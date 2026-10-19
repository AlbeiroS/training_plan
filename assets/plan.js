/* Shared renderer + logger for every plan in this repo.

   Page load order:
     plans/<plan>.js        sets window.PLAN_DATA
     assets/sync-config.js  sets window.SYNC (empty = local only)
     assets/sync.js         window.PlanSync
     assets/charts.js       window.renderCharts
     assets/plan.js         this file
     renderPlan()

   The plan data arrives as a global from a <script> tag rather than a fetched
   .json, so the page works when opened straight off disk: file:// origin rules
   block fetch() but not <script src>. renderPlan(url) still accepts a URL as a
   fallback for anything served over http.

   Log entries are keyed "<week>-<sessionIndex>" and hold what was actually run:
     { mi, time, note, at }
   Older logs stored `true` per key; normalize() upgrades those to the planned
   distance so nothing logged before this format is lost. */

(function () {
  'use strict';

  var PLAN = null;
  var KEY = null;
  var logged = {};
  var VIEWS = ['dashboard', 'weeks', 'paces', 'phases'];

  /* ---------- storage (per-browser; wrapped because it throws in private
       windows and with site data blocked) ---------- */
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(logged)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      logged = raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { logged = {}; }
  }
  function storageWorks() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  }

  /* ---------- small helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmtMi(n) { return String(Math.round((+n || 0) * 10) / 10); }

  /* Parse as LOCAL time, not UTC, so countdowns and "this week" never land a
     day out in a negative-offset timezone. */
  function parseDate(iso, hour) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2], hour == null ? 7 : hour, 0, 0);
  }
  function daysUntil(d) { return Math.ceil((d - new Date()) / 86400000); }

  function nowIndex() {
    var days = Math.floor((new Date() - parseDate(PLAN.start, 0)) / 86400000);
    var idx = Math.floor(days / 7);
    return {
      idx: Math.max(0, Math.min(PLAN.weeks.length - 1, idx)),
      started: days >= 0,
      over: idx >= PLAN.weeks.length
    };
  }

  /* Time accepts h:mm:ss, mm:ss or bare minutes. '.' and spaces also work as
     separators so the phone's decimal keypad is enough — no hunting for ':'. */
  function parseTime(t) {
    t = String(t || '').trim();
    if (!t) return null;
    var p = t.split(/[:.\s]+/).map(Number);
    if (p.some(function (x) { return isNaN(x) || x < 0; })) return NaN;
    if (p.length === 1) return p[0] * 60;
    if (p.length === 2) return p[1] < 60 ? p[0] * 60 + p[1] : NaN;
    if (p.length === 3) return p[1] < 60 && p[2] < 60 ? p[0] * 3600 + p[1] * 60 + p[2] : NaN;
    return NaN;
  }
  function fmtClock(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function paceOf(mi, time) {
    var s = parseTime(time);
    if (!s || isNaN(s) || !(mi > 0)) return '';
    return fmtClock(s / mi) + '/mi';
  }

  function sessionAt(key) {
    var p = String(key).split('-');
    for (var i = 0; i < PLAN.weeks.length; i++) {
      if (PLAN.weeks[i].n === +p[0]) return PLAN.weeks[i].s[+p[1]] || null;
    }
    return null;
  }
  function normalize(map) {
    var out = {};
    Object.keys(map || {}).forEach(function (k) {
      var v = map[k], s = sessionAt(k);
      if (!s || !(s.mi > 0)) return;
      if (v === true) out[k] = { mi: s.mi, time: '', note: '', at: '' };
      else if (v && typeof v === 'object' && isFinite(+v.mi) && +v.mi > 0) {
        out[k] = { mi: +v.mi, time: v.time || '', note: v.note || '', at: v.at || '' };
      }
    });
    return out;
  }

  /* ---------- totals ---------- */
  function planTotals() {
    var miles = 0, sessions = 0, longest = 0, peak = 0;
    PLAN.weeks.forEach(function (w) {
      miles += w.total || 0;
      if ((w.total || 0) > peak) peak = w.total;
      w.s.forEach(function (s) {
        if (s.mi > 0) sessions++;
        if (s.type !== 'race' && s.mi > longest) longest = s.mi;
      });
    });
    return { miles: miles, sessions: sessions, longest: longest, peak: peak };
  }
  function weekLogged(w) {
    var t = 0;
    w.s.forEach(function (s, i) { var L = logged[w.n + '-' + i]; if (L) t += L.mi; });
    return t;
  }
  function loggedMiles() {
    var t = 0;
    Object.keys(logged).forEach(function (k) { t += logged[k].mi; });
    return t;
  }

  /* ---------- hero / stats / paces / phases ---------- */
  function renderHero() {
    var h = $('hero');
    h.innerHTML = '';
    h.appendChild(el('div', 'kicker', esc(PLAN.kicker)));
    h.appendChild(el('h1', null, esc(PLAN.title).replace(/(\s\S+)$/, ' <em>$1</em>')));
    h.appendChild(el('p', 'sub', esc(PLAN.subtitle)));

    var cds = el('div', 'countdowns');
    PLAN.races.forEach(function (r) {
      var n = daysUntil(parseDate(r.date));
      var box = el('div', 'cd' + (n <= 21 && n >= 0 ? ' is-race' : ''));
      box.appendChild(el('div', 'cd-n', n > 0 ? n : (n === 0 ? 'TODAY' : 'done')));
      box.appendChild(el('div', 'cd-l', (n > 0 ? 'days · ' : '') + esc(r.name.replace(' Marathon', ''))));
      cds.appendChild(box);
    });
    var box = el('div', 'cd');
    box.appendChild(el('div', 'cd-n', Math.round(planTotals().miles)));
    box.appendChild(el('div', 'cd-l', 'miles total'));
    cds.appendChild(box);
    h.appendChild(cds);
  }

  function renderStats() {
    var t = planTotals();
    var g = $('stats');
    g.innerHTML = '';
    [[PLAN.weeks.length, 'weeks'], [Math.round(t.miles), 'total miles'],
     [t.peak, 'peak week'], [t.longest, 'longest run'],
     [t.sessions, 'sessions'], [PLAN.races.length, 'marathons']
    ].forEach(function (r) {
      var s = el('div', 'stat');
      s.appendChild(el('div', 'v', r[0]));
      s.appendChild(el('div', 'k', r[1]));
      g.appendChild(s);
    });
  }

  function renderPaces() {
    var box = $('paces');
    box.innerHTML = '';
    PLAN.paces.forEach(function (p) {
      var row = el('div', 'pace-row');
      var l = el('div', 'pl');
      var sw = el('span', 'swatch');
      sw.style.background = 'var(--' + p.key + ')';
      l.appendChild(sw);
      l.appendChild(document.createTextNode(p.label));
      row.appendChild(l);
      row.appendChild(el('div', 'pv', esc(p.pace)));
      row.appendChild(el('div', 'pn', esc(p.note)));
      box.appendChild(row);
    });
  }

  function renderPhases() {
    var g = $('phases');
    g.innerHTML = '';
    Object.keys(PLAN.phases).forEach(function (k) {
      var p = PLAN.phases[k];
      var c = el('div', 'phase-card');
      c.style.borderLeftColor = p.color;
      var h = el('h3', null, esc(p.label));
      h.style.color = p.color;
      c.appendChild(h);
      c.appendChild(el('div', 'wk', (/[–-]/.test(p.weeks) ? 'Weeks ' : 'Week ') + esc(p.weeks)));
      c.appendChild(el('p', null, esc(p.objective)));
      c.appendChild(el('p', 'focus', esc(p.focus)));
      g.appendChild(c);
    });
  }

  /* ---------- one session row — shared by the week list and this-week card ---------- */
  function sessionRow(w, s, i) {
    var id = w.n + '-' + i, L = logged[id];
    var row = el('div', 'sess' + (L ? ' is-logged' : ''));
    row.appendChild(el('div', 'sday', esc(s.day)));

    var sb = el('div', 'sbody');
    var tag = el('span', 'stype', esc(s.type));
    tag.style.background = 'var(--' + s.type + ')';
    sb.appendChild(tag);
    sb.appendChild(el('div', 'sdet', esc(s.det)));
    if (s.feel) sb.appendChild(el('div', 'sfeel', esc(s.feel)));
    if (L) {
      var bits = [fmtMi(L.mi) + ' mi'];
      if (L.time) bits.push(L.time);
      var pc = paceOf(L.mi, L.time);
      if (pc) bits.push(pc);
      sb.appendChild(el('div', 'slog', esc(bits.join(' · '))));
      if (L.note) sb.appendChild(el('div', 'snote', esc(L.note)));
    }
    row.appendChild(sb);

    var sr = el('div', 'sright');
    if (s.mi > 0) {
      sr.appendChild(el('div', 'smi', fmtMi(s.mi) + ' <span>mi</span>'));
      var b = el('button', 'logbtn' + (L ? ' on' : ''), L ? 'Edit' : 'Log');
      b.type = 'button';
      b.setAttribute('aria-label', (L ? 'Edit the log for' : 'Log') + ' week ' + w.n + ', ' + s.day);
      b.onclick = function (ev) { ev.stopPropagation(); openEditor(w, s, i); };
      sr.appendChild(b);
    }
    row.appendChild(sr);
    return row;
  }

  /* ---------- week list ---------- */
  function renderWeeks() {
    var box = $('weeks');
    var open = {};
    box.querySelectorAll('.week.open').forEach(function (n) { open[n.dataset.week] = 1; });
    var first = !box.dataset.ready;
    var now = nowIndex();
    box.innerHTML = '';

    PLAN.weeks.forEach(function (w, wi) {
      var ph = PLAN.phases[w.phase] || { label: w.phase, color: '#999' };
      var isRace = w.s.some(function (s) { return s.type === 'race'; });
      var runnable = [];
      w.s.forEach(function (s, i) { if (s.mi > 0) runnable.push(i); });
      var allDone = runnable.length > 0 && runnable.every(function (i) { return logged[w.n + '-' + i]; });
      var done = weekLogged(w);

      var wk = el('div', 'week' + (isRace ? ' is-race' : '') + (allDone ? ' is-done' : '') +
                         (wi === now.idx && !now.over ? ' is-now' : ''));
      wk.style.borderLeftColor = ph.color;
      wk.dataset.week = w.n;

      var head = el('div', 'week-head');
      head.appendChild(el('div', 'wnum', w.n));
      var meta = el('div', 'wmeta');
      meta.appendChild(el('h3', null, esc(w.title)));
      meta.appendChild(el('div', 'wd', esc(w.dates) +
        (wi === now.idx && !now.over ? ' · <strong>' + (now.started ? 'this week' : 'up next') + '</strong>' : '')));
      head.appendChild(meta);
      var right = el('div', 'wright');
      right.appendChild(el('div', 'wtot', fmtMi(w.total) + ' <span>mi</span>'));
      if (done > 0) right.appendChild(el('div', 'wlog', fmtMi(done) + ' logged'));
      var pill = el('div', 'pill', esc(ph.label));
      pill.style.background = ph.color;
      right.appendChild(pill);
      head.appendChild(right);
      head.onclick = function () { wk.classList.toggle('open'); };
      wk.appendChild(head);

      var body = el('div', 'week-body');
      if (w.note) body.appendChild(el('div', 'wnote', esc(w.note)));
      w.s.forEach(function (s, i) { body.appendChild(sessionRow(w, s, i)); });
      wk.appendChild(body);

      if (open[w.n] || (first && wi === now.idx)) wk.classList.add('open');
      box.appendChild(wk);
    });
    box.dataset.ready = '1';
  }

  /* ---------- this-week card (dashboard) ---------- */
  function renderThisWeek() {
    var box = $('thisWeek');
    if (!box) return;
    var now = nowIndex();
    var w = PLAN.weeks[now.idx];
    var ph = PLAN.phases[w.phase] || { label: w.phase, color: '#999' };
    var done = weekLogged(w);
    box.innerHTML = '';

    var card = el('div', 'tw');
    card.style.borderTopColor = ph.color;

    var head = el('div', 'tw-head');
    var left = el('div', 'tw-l');
    left.appendChild(el('div', 'tw-k',
      (now.over ? 'Final week' : now.started ? 'This week' : 'Up next') +
      ' · week ' + w.n + ' of ' + PLAN.weeks.length));
    left.appendChild(el('h3', null, esc(w.title)));
    left.appendChild(el('div', 'tw-d', esc(w.dates) + ' · ' + esc(ph.label)));
    head.appendChild(left);

    var right = el('div', 'tw-r');
    right.appendChild(el('div', 'tw-n', fmtMi(done) + '<span> / ' + fmtMi(w.total) + ' mi</span>'));
    var meter = el('div', 'tw-meter');
    meter.setAttribute('role', 'meter');
    meter.setAttribute('aria-label', 'Miles logged this week');
    meter.setAttribute('aria-valuemin', '0');
    meter.setAttribute('aria-valuemax', String(w.total));
    meter.setAttribute('aria-valuenow', String(done));
    var fill = el('div', 'tw-fill');
    fill.style.width = Math.min(100, w.total ? (done / w.total) * 100 : 0) + '%';
    meter.appendChild(fill);
    right.appendChild(meter);
    head.appendChild(right);
    card.appendChild(head);

    if (w.note) card.appendChild(el('p', 'tw-note', esc(w.note)));
    w.s.forEach(function (s, i) { card.appendChild(sessionRow(w, s, i)); });

    var more = el('a', 'tw-more', 'All ' + PLAN.weeks.length + ' weeks →');
    more.href = '#weeks';
    card.appendChild(more);
    box.appendChild(card);
  }

  /* ---------- log editor ---------- */
  var ed = null, edCtx = null;

  function editor() {
    if (ed) return ed;
    ed = el('div', 'sheet-bg');
    ed.innerHTML =
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="edTitle">' +
        '<div class="sheet-k" id="edK"></div>' +
        '<h3 id="edTitle"></h3>' +
        '<div class="sheet-plan" id="edPlan"></div>' +
        '<div class="sheet-grid">' +
          '<label for="edMi">Actual miles<input id="edMi" type="number" inputmode="decimal" step="0.1" min="0" max="60"></label>' +
          '<label for="edTime">Time <small>optional</small><input id="edTime" type="text" inputmode="decimal" placeholder="1:22:10" autocomplete="off"></label>' +
        '</div>' +
        '<div class="sheet-pace" id="edPace"></div>' +
        '<label for="edNote">Notes <small>optional</small><textarea id="edNote" rows="2" placeholder="How it felt, weather, shoes…"></textarea></label>' +
        '<div class="sheet-err" id="edErr" role="alert"></div>' +
        '<div class="sheet-btns">' +
          '<button type="button" class="b-danger" id="edDel">Remove</button>' +
          '<span></span>' +
          '<button type="button" class="b-ghost" id="edCancel">Cancel</button>' +
          '<button type="button" class="b-main" id="edSave">Save</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ed);

    ed.addEventListener('click', function (e) { if (e.target === ed) closeEditor(); });
    $('edCancel').onclick = closeEditor;
    $('edSave').onclick = saveEditor;
    $('edDel').onclick = removeEditor;
    $('edMi').oninput = updatePace;
    $('edTime').oninput = updatePace;
    document.addEventListener('keydown', function (e) {
      if (!ed.classList.contains('open')) return;
      if (e.key === 'Escape') closeEditor();
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); saveEditor(); }
    });
    return ed;
  }

  function updatePace() {
    var mi = parseFloat($('edMi').value);
    var t = $('edTime').value;
    var secs = parseTime(t);
    var out = $('edPace');
    if (t && isNaN(secs)) { out.textContent = 'Time not recognised — try 1:22:10 or 45:30'; out.className = 'sheet-pace bad'; return; }
    out.className = 'sheet-pace';
    var p = paceOf(mi, t);
    out.textContent = p ? 'Pace ' + p : '';
  }

  function openEditor(w, s, i) {
    editor();
    edCtx = { w: w, s: s, i: i, id: w.n + '-' + i };
    var L = logged[edCtx.id];
    $('edK').textContent = 'Week ' + w.n + ' · ' + s.day + ' · ' + s.type;
    $('edTitle').textContent = s.det;
    $('edPlan').textContent = 'Planned ' + fmtMi(s.mi) + ' mi';
    $('edMi').value = L ? L.mi : s.mi;
    $('edTime').value = L ? L.time : '';
    $('edNote').value = L ? L.note : '';
    $('edErr').textContent = '';
    $('edDel').style.visibility = L ? 'visible' : 'hidden';
    updatePace();
    ed.classList.add('open');
    document.body.classList.add('sheet-open');
    setTimeout(function () { $('edMi').focus(); $('edMi').select(); }, 30);
  }

  function closeEditor() {
    if (!ed) return;
    ed.classList.remove('open');
    document.body.classList.remove('sheet-open');
    edCtx = null;
  }

  function saveEditor() {
    if (!edCtx) return;
    var mi = parseFloat($('edMi').value);
    if (!(mi > 0) || mi > 60) {
      $('edErr').textContent = 'Enter the miles you ran (more than 0). To clear a log, use Remove.';
      return;
    }
    var t = $('edTime').value.trim();
    var secs = parseTime(t);
    if (t && isNaN(secs)) {
      $('edErr').textContent = 'Time not recognised — use h:mm:ss, mm:ss, or leave it blank.';
      return;
    }
    logged[edCtx.id] = {
      mi: Math.round(mi * 100) / 100,
      time: secs ? fmtClock(secs) : '',
      note: $('edNote').value.trim(),
      at: new Date().toISOString()
    };
    commit(edCtx.w, edCtx.s, edCtx.i);
    closeEditor();
  }

  function removeEditor() {
    if (!edCtx) return;
    delete logged[edCtx.id];
    commit(edCtx.w, edCtx.s, edCtx.i);
    closeEditor();
  }

  function syncRecord(w, s, i) {
    if (!window.PlanSync) return;
    var id = w.n + '-' + i, L = logged[id];
    PlanSync.record({
      key: id, week: w.n, session: i, day: s.day, type: s.type, planned: s.mi,
      mi: L ? L.mi : 0, time: L ? L.time : '', pace: L ? paceOf(L.mi, L.time) : '',
      note: L ? L.note : '', done: !!L
    });
  }

  function commit(w, s, i) {
    save();
    syncRecord(w, s, i);
    redraw();
  }

  /* ---------- bottom bar ---------- */
  function renderBar() {
    var t = planTotals();
    var done = loggedMiles();
    var pct = t.miles ? Math.round((done / t.miles) * 100) : 0;
    $('progT').textContent = fmtMi(done) + ' of ' + Math.round(t.miles) + ' mi logged · ' + pct + '%';
    $('progF').style.width = Math.min(100, pct) + '%';
  }

  function drawCharts() {
    if (!window.renderCharts) return;
    renderCharts(PLAN, function (weekN, idx) { return logged[weekN + '-' + idx] || null; }, nowIndex());
  }

  function redraw() {
    renderWeeks();
    renderThisWeek();
    renderBar();
    drawCharts();
  }

  /* ---------- export / import / reset ---------- */
  function forEachSession(fn) {
    PLAN.weeks.forEach(function (w) { w.s.forEach(function (s, i) { fn(w, s, i); }); });
  }

  function exportLog() {
    var payload = { plan: PLAN.id, exported: new Date().toISOString(), logged: logged };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = PLAN.id + '-log.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function importLog() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json,.json';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var d = JSON.parse(fr.result);
          var before = logged;
          logged = normalize(d.logged);
          save();
          forEachSession(function (w, s, i) {
            var id = w.n + '-' + i;
            if (before[id] || logged[id]) syncRecord(w, s, i);
          });
          redraw();
        } catch (e) { alert('That file was not a log export.'); }
      };
      fr.readAsText(f);
    };
    inp.click();
  }
  function resetLog() {
    var syncing = window.PlanSync && PlanSync.enabled();
    if (!confirm('Clear every logged run for this plan?' +
                 (syncing ? '\n\nThis also clears them from your Google Sheet.' : ''))) return;
    var before = logged;
    logged = {};
    try { localStorage.removeItem(KEY); } catch (e) {}
    forEachSession(function (w, s, i) { if (before[w.n + '-' + i]) syncRecord(w, s, i); });
    redraw();
  }

  /* ---------- navigation ---------- */
  function route() {
    var v = (location.hash || '').replace('#', '');
    if (VIEWS.indexOf(v) < 0) v = 'dashboard';
    VIEWS.forEach(function (name) {
      var node = document.querySelector('.view[data-view="' + name + '"]');
      if (node) node.classList.toggle('on', name === v);
    });
    document.querySelectorAll('.nav a[data-v]').forEach(function (a) {
      var on = a.dataset.v === v;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    VIEWS.forEach(function (name) { document.body.classList.remove('v-' + name); });
    document.body.classList.add('v-' + v);

    if (v === 'weeks') {
      var cur = document.querySelector('#weeks .week.is-now');
      if (cur) { cur.classList.add('open'); cur.scrollIntoView({ block: 'start' }); return; }
    }
    window.scrollTo(0, 0);
  }

  /* ---------- sheet sync (no-op until assets/sync-config.js is filled in) ---------- */
  function startSync() {
    var dot = $('syncDot');
    if (!window.PlanSync || !PlanSync.enabled()) {
      if (dot) {
        dot.className = 'sync local';
        dot.title = 'Logs are stored in this browser only. Clearing site data ' +
                    'erases them — use Export for backups, or set up Sheet sync.';
        dot.textContent = 'local only';
      }
      return;
    }
    PlanSync.init(PLAN.id, KEY);
    PlanSync.onStatus(function (state, detail) {
      if (!dot) return;
      var pend = PlanSync.pendingCount();
      dot.className = 'sync ' + state;
      dot.textContent = state === 'syncing' ? 'syncing…'
                      : state === 'offline' ? (pend ? pend + ' waiting' : 'offline')
                      : 'synced';
      dot.title = state === 'offline'
        ? 'Could not reach the Sheet (' + (detail || '') + '). Your runs are ' +
          'saved here and will send themselves when you are back online.'
        : 'Logged runs are saved to your Google Sheet.';
    });
    PlanSync.pull().then(function (remote) {
      if (!remote) return;
      logged = normalize(remote);
      save();
      redraw();
    });
    PlanSync.flush();
  }

  /* ---------- entry point ---------- */
  function build(data) {
    PLAN = data;
    KEY = data.storageKey || data.id;
    load();
    logged = normalize(logged);
    save();                       // persist any legacy `true` entries in the new shape
    document.title = data.title + ' · ' + data.kicker;
    var brand = $('navBrand');
    if (brand) brand.textContent = data.title;

    renderHero(); renderStats(); renderPaces(); renderPhases();
    redraw();

    if (!storageWorks()) {
      document.querySelector('main').appendChild(el('div', 'warn',
        'This browser is blocking local storage, so logged runs will not be ' +
        'remembered. Private windows and blocked site data both do this.'));
    }
    $('btnExport').onclick = exportLog;
    $('btnImport').onclick = importLog;
    $('btnReset').onclick = resetLog;

    window.addEventListener('hashchange', route);
    route();
    startSync();
  }

  function fail(msg) {
    var main = document.querySelector('main') || document.body;
    main.innerHTML = '<div class="warn"><strong>Could not load the plan data.</strong><br>' + msg + '</div>';
  }

  /* Prefers window.PLAN_DATA, set by the plan's own <script> tag — that is what
     makes the page work off disk. Falls back to fetching a URL when served. */
  window.renderPlan = function (src) {
    if (window.PLAN_DATA) { build(window.PLAN_DATA); return; }
    if (!src) {
      fail('No plan loaded. The page should include its data file with ' +
           '<code>&lt;script src="plans/&lt;plan&gt;.js"&gt;</code> before this script.');
      return;
    }
    fetch(src)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(build)
      .catch(function (err) {
        fail('Tried to fetch <code>' + esc(src) + '</code> and failed. ' +
             'Opening the page off disk blocks fetch — serve the folder with ' +
             '<code>python -m http.server 8777</code> instead.' +
             '<br><small>' + esc(err.message) + '</small>');
      });
  };
})();
