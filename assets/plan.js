/* Shared renderer + logger for every plan in this repo.
   Usage:  <script src="plans/<plan>.js"></script>   <!-- sets window.PLAN_DATA -->
           <script src="assets/plan.js"></script>
           <script>renderPlan()</script>

   The plan data arrives as a global from a <script> tag rather than a fetched
   .json, so the page works when opened straight off disk: file:// origin rules
   block fetch() but not <script src>. renderPlan() still accepts a URL as a
   fallback for anything served over http. */

(function () {
  'use strict';

  var PLAN = null;
  var KEY = null;
  var logged = {};           // "week-sessionIndex" -> true

  /* ---------- storage (per-viewer, per-browser; wrapped because it throws
       in private windows and with site data blocked) ---------- */
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(logged)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) logged = JSON.parse(raw) || {};
    } catch (e) { logged = {}; }
  }
  function storageWorks() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  }

  /* ---------- dates: parse as LOCAL midnight, not UTC, so the countdown
       never lands a day out in a negative-offset timezone ---------- */
  function parseDate(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2], 7, 0, 0);
  }
  function daysUntil(d) {
    return Math.ceil((d - new Date()) / 86400000);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
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
  function loggedMiles() {
    var m = 0;
    PLAN.weeks.forEach(function (w) {
      w.s.forEach(function (s, i) { if (logged[w.n + '-' + i]) m += s.mi || 0; });
    });
    return m;
  }

  /* ---------- hero ---------- */
  function renderHero() {
    var h = document.getElementById('hero');
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
    var t = planTotals();
    var box = el('div', 'cd');
    box.appendChild(el('div', 'cd-n', Math.round(t.miles)));
    box.appendChild(el('div', 'cd-l', 'miles total'));
    cds.appendChild(box);
    h.appendChild(cds);
  }

  /* ---------- stats ---------- */
  function renderStats() {
    var t = planTotals();
    var rows = [
      [PLAN.weeks.length, 'weeks'],
      [Math.round(t.miles), 'total miles'],
      [t.peak, 'peak week'],
      [t.longest, 'longest run'],
      [t.sessions, 'sessions'],
      [PLAN.races.length, 'marathons']
    ];
    var g = document.getElementById('stats');
    rows.forEach(function (r) {
      var s = el('div', 'stat');
      s.appendChild(el('div', 'v', r[0]));
      s.appendChild(el('div', 'k', r[1]));
      g.appendChild(s);
    });
  }

  /* ---------- paces ---------- */
  function renderPaces() {
    var box = document.getElementById('paces');
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

  /* ---------- phases ---------- */
  function renderPhases() {
    var g = document.getElementById('phases');
    Object.keys(PLAN.phases).forEach(function (k) {
      var p = PLAN.phases[k];
      var c = el('div', 'phase-card');
      c.style.borderLeftColor = p.color;
      var h = el('h3', null, esc(p.label));
      h.style.color = p.color;
      c.appendChild(h);
      c.appendChild(el('div', 'wk', 'Weeks ' + esc(p.weeks)));
      c.appendChild(el('p', null, esc(p.objective)));
      c.appendChild(el('p', 'focus', esc(p.focus)));
      g.appendChild(c);
    });
  }

  /* ---------- weeks ---------- */
  function renderWeeks() {
    var box = document.getElementById('weeks');
    box.innerHTML = '';
    var today = new Date();

    PLAN.weeks.forEach(function (w) {
      var ph = PLAN.phases[w.phase] || { label: w.phase, color: '#999' };
      var isRace = w.s.some(function (s) { return s.type === 'race'; });
      var runnable = [];
      w.s.forEach(function (s, i) { if (s.mi > 0) runnable.push(i); });
      var allDone = runnable.length > 0 && runnable.every(function (i) {
        return logged[w.n + '-' + i];
      });

      var wk = el('div', 'week' + (isRace ? ' is-race' : '') + (allDone ? ' is-done' : ''));
      wk.style.borderLeftColor = ph.color;

      /* head */
      var head = el('div', 'week-head');
      head.appendChild(el('div', 'wnum', w.n));
      var meta = el('div', 'wmeta');
      meta.appendChild(el('h3', null, esc(w.title)));
      meta.appendChild(el('div', 'wd', esc(w.dates)));
      head.appendChild(meta);
      var right = el('div', 'wright');
      right.appendChild(el('div', 'wtot', w.total + ' <span>mi</span>'));
      var pill = el('div', 'pill', esc(ph.label));
      pill.style.background = ph.color;
      right.appendChild(pill);
      head.appendChild(right);
      head.onclick = function () { wk.classList.toggle('open'); };
      wk.appendChild(head);

      /* body */
      var body = el('div', 'week-body');
      if (w.note) body.appendChild(el('div', 'wnote', esc(w.note)));

      w.s.forEach(function (s, i) {
        var id = w.n + '-' + i;
        var row = el('div', 'sess');
        row.appendChild(el('div', 'sday', esc(s.day)));

        var sb = el('div', 'sbody');
        var tag = el('span', 'stype', esc((s.type || '').replace('race-hou', 'race')));
        tag.style.background = 'var(--' + s.type + ')';
        sb.appendChild(tag);
        sb.appendChild(el('div', 'sdet', esc(s.det)));
        if (s.feel) sb.appendChild(el('div', 'sfeel', esc(s.feel)));
        row.appendChild(sb);

        var sr = el('div', 'sright');
        if (s.mi > 0) sr.appendChild(el('div', 'smi', s.mi + ' <span>mi</span>'));
        if (s.mi > 0) {
          var b = el('button', 'logbtn' + (logged[id] ? ' on' : ''), logged[id] ? 'done' : 'log');
          b.onclick = function (ev) {
            ev.stopPropagation();
            if (logged[id]) delete logged[id]; else logged[id] = true;
            save();
            if (window.PlanSync) {
              PlanSync.record({
                key: id, week: w.n, session: i, day: s.day,
                type: s.type, miles: s.mi, done: !!logged[id]
              });
            }
            redrawKeepingOpen();
          };
          sr.appendChild(b);
        }
        row.appendChild(sr);
        body.appendChild(row);
      });

      wk.appendChild(body);
      wk.dataset.week = w.n;
      box.appendChild(wk);
    });
  }

  function drawCharts() {
    if (!window.renderCharts) return;
    renderCharts(PLAN, function (weekN, idx) { return !!logged[weekN + '-' + idx]; });
  }

  /* Re-render the week list without collapsing whatever the user had open. */
  function redrawKeepingOpen() {
    var open = [];
    document.querySelectorAll('#weeks .week.open').forEach(function (n) {
      open.push(n.dataset.week);
    });
    renderWeeks();
    open.forEach(function (n) {
      var node = document.querySelector('#weeks .week[data-week="' + n + '"]');
      if (node) node.classList.add('open');
    });
    renderBar(); drawCharts();
  }

  function openCurrentWeek() {
    var start = parseDate(PLAN.start);
    var wk = Math.floor((new Date() - start) / (7 * 86400000)) + 1;
    if (wk < 1) wk = 1;
    var nodes = document.querySelectorAll('#weeks .week');
    if (nodes[wk - 1]) nodes[wk - 1].classList.add('open');
  }

  /* ---------- bottom bar ---------- */
  function renderBar() {
    var t = planTotals();
    var done = loggedMiles();
    var pct = t.miles ? Math.round((done / t.miles) * 100) : 0;
    document.getElementById('progT').textContent =
      Math.round(done) + ' of ' + Math.round(t.miles) + ' mi logged · ' + pct + '%';
    document.getElementById('progF').style.width = pct + '%';
  }

  /* ---------- export / import ---------- */
  function exportLog() {
    var payload = { plan: PLAN.id, exported: new Date().toISOString(), logged: logged };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = PLAN.id + '-log.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importLog() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var d = JSON.parse(fr.result);
          logged = d.logged || {};
          save(); renderWeeks(); renderBar();
        } catch (e) { alert('That file was not a log export.'); }
      };
      fr.readAsText(f);
    };
    inp.click();
  }
  function resetLog() {
    if (!confirm('Clear every logged run for this plan?')) return;
    logged = {};
    try { localStorage.removeItem(KEY); } catch (e) {}
    renderWeeks(); renderBar();
  }

  /* ---------- entry point ---------- */
  function build(data) {
    PLAN = data;
    KEY = data.storageKey || data.id;
    load();
    document.title = data.title + ' · ' + data.kicker;
    renderHero(); renderStats(); renderPaces(); renderPhases();
    renderWeeks(); openCurrentWeek(); renderBar(); drawCharts();

    if (!storageWorks()) {
      document.querySelector('.wrap').appendChild(el('div', 'warn',
        'This browser is blocking local storage, so logged runs will not be ' +
        'remembered. Private windows and blocked site data both do this.'));
    }
    document.getElementById('btnExport').onclick = exportLog;
    document.getElementById('btnImport').onclick = importLog;
    document.getElementById('btnReset').onclick = resetLog;

    startSync();
  }

  /* ---------- sheet sync (no-op until assets/sync-config.js is filled in) ---------- */
  function startSync() {
    var dot = document.getElementById('syncDot');
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
      logged = remote;
      save();
      redrawKeepingOpen();
    });
  }

  function fail(msg) {
    document.getElementById('weeks').innerHTML =
      '<div class="warn"><strong>Could not load the plan data.</strong><br>' + msg + '</div>';
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
