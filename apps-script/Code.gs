/**
 * Training-log backend: a thin JSON endpoint over one Google Sheet.
 *
 * This is deliberately NOT a website. The plan pages stay on GitHub Pages,
 * where they load instantly and live in version control; only the log — the
 * thing that changes daily and must outlive any one phone — lives here.
 *
 * One row per logged session, upserted by (plan, key). Columns:
 *   plan | key | week | session | day | type | planned_mi | actual_mi |
 *   time | pace | notes | done | updated_at
 * Removing a log in the app sets done = FALSE rather than deleting the row,
 * so the Sheet keeps a record of what was there.
 *
 * Setup steps are in the repo's CLAUDE.md / the chat guide. Short version:
 * paste this into Extensions → Apps Script of a new Sheet, set TOKEN, deploy as
 * a Web app (Execute as: Me · Who has access: Anyone), copy the /exec URL.
 *
 * SECURITY, honestly: a public static page cannot keep a secret. The token is
 * visible in the page source, so this is obscure, not secure. The data is miles
 * and notes, and the Sheet keeps revision history (File → Version history), so
 * any vandalism is one undo away.
 */

var TOKEN      = 'CHANGE-ME-to-any-random-string';
var SHEET_NAME = 'log';
var HEADERS    = ['plan', 'key', 'week', 'session', 'day', 'type', 'planned_mi',
                  'actual_mi', 'time', 'pace', 'notes', 'done', 'updated_at'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  // Force plain text where Sheets would otherwise "help": a key like "3-1"
  // becomes 1 March, and "1:22:10" becomes a time-of-day Date. Either one
  // silently corrupts the log, so these columns are pinned to text.
  sh.getRange('B:B').setNumberFormat('@');   // key
  sh.getRange('I:K').setNumberFormat('@');   // time, pace, notes
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function text_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, 'GMT', 'H:mm:ss'); // defensive: legacy cells
  }
  return v == null ? '' : String(v);
}

/** GET ?plan=<id>&token=<token>  →  { ok, logged: { "<week>-<idx>": {mi,time,note} } } */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.token !== TOKEN) return json_({ ok: false, error: 'bad token' });

  var rows = sheet_().getDataRange().getValues();
  var logged = {};
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[0]) !== String(p.plan)) continue;
    if (!(r[11] === true || r[11] === 'TRUE')) continue;
    logged[text_(r[1])] = { mi: Number(r[7]) || 0, time: text_(r[8]), note: text_(r[10]) };
  }
  return json_({ ok: true, logged: logged, count: Object.keys(logged).length });
}

/**
 * POST body (sent as text/plain so the browser skips the CORS preflight):
 *   { plan, token, changes: [ { key, week, session, day, type, planned,
 *                               mi, time, pace, note, done } ] }
 */
function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (body.token !== TOKEN) return json_({ ok: false, error: 'bad token' });

  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); }
  catch (err) { return json_({ ok: false, error: 'busy' }); }

  try {
    var sh = sheet_();
    var rows = sh.getDataRange().getValues();
    var index = {};
    for (var i = 1; i < rows.length; i++) index[rows[i][0] + '|' + text_(rows[i][1])] = i + 1;

    var now = new Date(), appended = [];
    (body.changes || []).forEach(function (c) {
      var row = [body.plan, String(c.key), c.week, c.session, c.day || '', c.type || '',
                 Number(c.planned) || 0, Number(c.mi) || 0,
                 c.time || '', c.pace || '', c.note || '', !!c.done, now];
      var at = index[body.plan + '|' + c.key];
      if (at) sh.getRange(at, 1, 1, HEADERS.length).setValues([row]);
      else appended.push(row);
    });
    if (appended.length) {
      sh.getRange(sh.getLastRow() + 1, 1, appended.length, HEADERS.length).setValues(appended);
    }
    return json_({ ok: true, written: (body.changes || []).length });
  } finally {
    lock.releaseLock();
  }
}
