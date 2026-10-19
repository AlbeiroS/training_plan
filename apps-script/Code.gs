/**
 * Training-log backend: a thin JSON endpoint over one Google Sheet.
 *
 * This is deliberately NOT a website. The plan pages stay on GitHub Pages,
 * where they load instantly and live in version control; only the log — the
 * thing that changes daily and must outlive any one phone — lives here.
 *
 * SETUP (about five minutes, all on your side — it needs your Google account):
 *   1. Create a new Google Sheet. Name the first tab exactly: log
 *   2. Extensions → Apps Script. Delete the stub, paste this file, Save.
 *   3. Change TOKEN below to any random string of your choosing.
 *   4. Deploy → New deployment → type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Authorise it when prompted (it will warn — it is your own script).
 *   5. Copy the /exec URL it gives you.
 *   6. Put the URL and the same TOKEN into assets/sync-config.js, then push.
 *
 * SECURITY, honestly: a public static page cannot keep a secret. The token
 * will be visible in the page source, so this is obscure, not secure. Anyone
 * who found the URL could read or scribble on your log. The data is miles and
 * checkmarks, and the Sheet keeps full revision history (File → Version
 * history) so any vandalism is one undo away. If that trade is not acceptable,
 * leave sync off and use the Export button for backups instead.
 */

var TOKEN      = 'CHANGE-ME-to-any-random-string';
var SHEET_NAME = 'log';
var HEADERS    = ['plan', 'key', 'week', 'session', 'day', 'type',
                  'miles', 'done', 'updated_at'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** GET ?plan=<id>&token=<token>  →  { ok, logged: { "<week>-<idx>": true } } */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.token !== TOKEN) return json_({ ok: false, error: 'bad token' });

  var sh = sheet_();
  var rows = sh.getDataRange().getValues();
  var logged = {};
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) !== String(p.plan)) continue;
    if (rows[i][7] === true || rows[i][7] === 'TRUE' || rows[i][7] === 1) {
      logged[String(rows[i][1])] = true;
    }
  }
  return json_({ ok: true, logged: logged, count: Object.keys(logged).length });
}

/**
 * POST body (text/plain so the browser sends no CORS preflight):
 *   { plan, token, changes: [ { key, week, session, day, type, miles, done } ] }
 * Upserts each change by (plan, key).
 */
function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  if (body.token !== TOKEN) return json_({ ok: false, error: 'bad token' });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }

  try {
    var sh = sheet_();
    var rows = sh.getDataRange().getValues();

    // index existing rows by plan|key so repeated toggles update in place
    var index = {};
    for (var i = 1; i < rows.length; i++) {
      index[rows[i][0] + '|' + rows[i][1]] = i + 1; // 1-based sheet row
    }

    var now = new Date();
    var appended = [];
    (body.changes || []).forEach(function (c) {
      var row = [body.plan, c.key, c.week, c.session, c.day || '',
                 c.type || '', c.miles || 0, !!c.done, now];
      var at = index[body.plan + '|' + c.key];
      if (at) {
        sh.getRange(at, 1, 1, HEADERS.length).setValues([row]);
      } else {
        appended.push(row);
      }
    });
    if (appended.length) {
      sh.getRange(sh.getLastRow() + 1, 1, appended.length, HEADERS.length)
        .setValues(appended);
    }
    return json_({ ok: true, written: (body.changes || []).length });
  } finally {
    lock.releaseLock();
  }
}
