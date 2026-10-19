/* Inline-SVG charts for the plan pages. No charting library: these need to work
   off disk and with no network, and three hand-rolled SVGs cost less than a CDN.

   Every chart is planned-vs-actual on one axis (same unit, miles — never a
   second y-scale). Planned is CONTEXT and wears a recessive gray; what was
   actually run is the SUBJECT and wears the blue.

   Palette (validated with the dataviz skill's validate_palette.js):
     BLUE #1C6E9E  logged     — chosen over the UI's #2F6F8F, which sits below
                                the chroma floor and reads gray as a large fill
     GRAY #ADA799  planned    — dE 21.0 protan / 24.9 normal vs BLUE. Contrast
                                vs white is 2.4:1, below 3:1; that is accepted
                                only because every planned value is also in the
                                week list (the table view) and the tooltips.
     RED  #B4283C  race marker — dE 16.6 protan / 26.5 normal vs BLUE.
   Phase identity is NEVER carried by bar hue — seven phase hues fail pairwise
   separation. It rides the labelled strip under the axis instead. */

(function () {
  'use strict';

  var BLUE = '#1C6E9E', GRAY = '#ADA799', RED = '#B4283C';
  var INK = '#12141C', MUTE = '#7A7669', GRID = '#E2DED4', SURF = '#FFFFFF';
  var NOWBG = '#F3F0E8';
  var FONT = 'Karla,sans-serif';
  var W = 760, PADL = 40, PADR = 18, PADT = 36;

  function svgEl(name, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }
  function text(svg, x, y, str, o) {
    o = o || {};
    var t = svgEl('text', {
      x: x, y: y, 'text-anchor': o.anchor || 'middle', fill: o.fill || MUTE,
      'font-size': o.size || 11, 'font-weight': o.weight || 400, 'font-family': FONT
    });
    if (o.ls) t.setAttribute('letter-spacing', o.ls);
    t.textContent = str;
    svg.appendChild(t);
    return t;
  }
  function fmt(n) { return String(Math.round(n * 10) / 10); }

  /* Bar with a 4px rounded data-end and square corners at the baseline. */
  function barPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, h, w / 2);
    return 'M' + x + ',' + (y + h) + 'L' + x + ',' + (y + r) +
           'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
           'L' + (x + w - r) + ',' + y +
           'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) +
           'L' + (x + w) + ',' + (y + h) + 'Z';
  }

  /* ---------- shared tooltip ---------- */
  var tip = null;
  function showTip(html, pt) {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      document.body.appendChild(tip);
    }
    tip.innerHTML = html;
    tip.style.display = 'block';
    var r = tip.getBoundingClientRect();
    var x = pt.clientX - r.width / 2;
    var y = pt.clientY - r.height - 14;
    tip.style.left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    tip.style.top = Math.max(8, y) + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }
  function hoverable(node, html) {
    node.addEventListener('mousemove', function (ev) { showTip(html, ev); });
    node.addEventListener('mouseleave', hideTip);
    node.addEventListener('touchstart', function (ev) { showTip(html, ev.touches[0]); }, { passive: true });
  }
  document.addEventListener('scroll', hideTip, { passive: true, capture: true });

  function raceAt(plan, weekN) {
    for (var i = 0; i < plan.races.length; i++) if (plan.races[i].week === weekN) return plan.races[i];
    return null;
  }

  /* Gridlines, y labels, and the "now" column — drawn first so data sits on top. */
  function frame(o) {
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + o.H, role: 'img', 'aria-label': o.label });
    var plotH = o.H - PADT - o.PADB;
    var band = (W - PADL - PADR) / o.n;
    if (o.now) {
      var x = PADL + o.now.idx * band;
      svg.setAttribute('data-now-x', String(x + band / 2));
      svg.appendChild(svgEl('rect', { x: x, y: PADT - 8, width: band, height: plotH + 8, rx: 4, fill: NOWBG }));
      text(svg, x + band / 2, PADT - 14, o.now.started ? 'NOW' : 'NEXT',
           { size: 9.5, weight: 700, ls: '.1em' });
    }
    for (var t = 0; t <= o.yMax; t += o.step) {
      var y = PADT + plotH - (t / o.yMax) * plotH;
      svg.appendChild(svgEl('line', { x1: PADL, y1: y, x2: W - PADR, y2: y, stroke: GRID, 'stroke-width': 1 }));
      text(svg, PADL - 8, y + 4, t, { anchor: 'end', size: 12 });
    }
    return { svg: svg, plotH: plotH, band: band };
  }

  function xLabels(svg, weeks, band, y, every) {
    weeks.forEach(function (w, i) {
      if (every === 1 || i === 0 || w.n % 4 === 0) text(svg, PADL + i * band + band / 2, y, w.n);
    });
  }

  /* A clean tick step that gives at most five gridlines. */
  function niceStep(max) {
    var steps = [5, 10, 20, 25, 50, 100, 200, 250, 500];
    for (var k = 0; k < steps.length; k++) if (max / steps[k] <= 5) return steps[k];
    return 1000;
  }

  function hitBands(svg, weeks, band, plotH, htmlFor) {
    weeks.forEach(function (w, i) {
      var r = svgEl('rect', { x: PADL + i * band, y: PADT - 8, width: band, height: plotH + 8, fill: 'transparent' });
      hoverable(r, htmlFor(w, i));
      svg.appendChild(r);
    });
  }

  function tipHead(w) { return '<strong>Week ' + w.n + ' · ' + w.title + '</strong><span>' + w.dates + '</span>'; }

  /* ================= 1 · weekly volume ================= */
  function weeklyChart(plan, getLog, now) {
    var weeks = plan.weeks, n = weeks.length, H = 274, PADB = 58;
    var planned = weeks.map(function (w) { return w.total; });
    var actual = weeks.map(function (w) {
      var t = 0;
      w.s.forEach(function (s, i) { var L = getLog(w.n, i); if (L) t += +L.mi || 0; });
      return t;
    });
    var top = Math.max.apply(null, planned.concat(actual));
    var yMax = Math.max(60, Math.ceil(top / 20) * 20);
    var peak = Math.max.apply(null, planned);

    var f = frame({ H: H, PADB: PADB, n: n, yMax: yMax, step: 20, now: now,
                    label: 'Planned and logged miles for each of the ' + n + ' weeks' });
    var svg = f.svg, plotH = f.plotH, band = f.band;
    var gap = 2, barW = Math.max(4, Math.min(11, (band - 8) / 2));
    var base = PADT + plotH;

    weeks.forEach(function (w, i) {
      var cx = PADL + i * band + band / 2;
      var hp = (planned[i] / yMax) * plotH, ha = (actual[i] / yMax) * plotH;
      svg.appendChild(svgEl('path', { d: barPath(cx - gap / 2 - barW, base - hp, barW, hp, 4), fill: GRAY }));
      if (actual[i] > 0) {
        svg.appendChild(svgEl('path', { d: barPath(cx + gap / 2, base - ha, barW, ha, 4), fill: BLUE }));
      }
      var race = raceAt(plan, w.n);
      var topY = base - Math.max(hp, ha);
      if (race) {
        svg.appendChild(svgEl('circle', { cx: cx, cy: topY - 9, r: 4, fill: RED, stroke: SURF, 'stroke-width': 2 }));
        text(svg, cx, topY - 19, race.short || race.name.slice(0, 3).toUpperCase(),
             { fill: INK, size: 11, weight: 700, ls: '.04em' });
      } else if (planned[i] === peak) {
        text(svg, cx - gap / 2 - barW / 2, base - hp - 7, fmt(peak), { fill: INK, size: 12, weight: 700 });
      }
    });

    xLabels(svg, weeks, band, base + 16);

    /* phase strip — carries phase identity instead of the bar hue */
    var bandY = base + 26, runStart = 0;
    for (var i = 0; i <= n; i++) {
      if (i === n || weeks[i].phase !== weeks[runStart].phase) {
        var ph = plan.phases[weeks[runStart].phase];
        var x0 = PADL + runStart * band + 1, wid = (i - runStart) * band - 2;
        svg.appendChild(svgEl('rect', { x: x0, y: bandY, width: wid, height: 7, rx: 3.5, fill: ph.color }));
        if (wid > 64) text(svg, x0 + wid / 2, bandY + 21, ph.label.toUpperCase(), { size: 10.5, weight: 700, ls: '.07em' });
        runStart = i;
      }
    }

    hitBands(svg, weeks, band, plotH, function (w, i) {
      return tipHead(w) + '<span>Planned ' + fmt(planned[i]) + ' mi</span>' +
             '<span>Logged ' + (actual[i] > 0 ? fmt(actual[i]) + ' mi' : '—') + '</span>';
    });
    return { svg: svg };
  }

  /* ================= 2 · long run ================= */
  function longRunChart(plan, getLog, now) {
    var weeks = plan.weeks, n = weeks.length, H = 226, PADB = 34;
    /* the week's key session: the longest planned one (the race, in race weeks) */
    var keyIdx = weeks.map(function (w) {
      var best = 0;
      w.s.forEach(function (s, i) { if (s.mi > w.s[best].mi) best = i; });
      return best;
    });
    var planned = weeks.map(function (w, k) { return w.s[keyIdx[k]].mi; });
    var actual = weeks.map(function (w, k) {
      var L = getLog(w.n, keyIdx[k]);
      return L ? +L.mi : null;
    });
    var aMax = Math.max.apply(null, actual.map(function (v) { return v || 0; }));
    var yMax = Math.max(30, Math.ceil(aMax / 10) * 10);

    var f = frame({ H: H, PADB: PADB, n: n, yMax: yMax, step: 10, now: now,
                    label: 'Planned and logged long run for each week' });
    var svg = f.svg, plotH = f.plotH, band = f.band;
    function px(i) { return PADL + i * band + band / 2; }
    function py(v) { return PADT + plotH - (v / yMax) * plotH; }

    svg.appendChild(svgEl('path', {
      d: planned.map(function (v, i) { return (i ? 'L' : 'M') + px(i) + ',' + py(v); }).join(''),
      fill: 'none', stroke: GRAY, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'
    }));

    var peak = 0, peakAt = -1;
    planned.forEach(function (v, i) {
      var race = raceAt(plan, weeks[i].n);
      if (!race && v > peak) { peak = v; peakAt = i; }
    });
    planned.forEach(function (v, i) {
      var race = raceAt(plan, weeks[i].n);
      svg.appendChild(svgEl('circle', {
        cx: px(i), cy: py(v), r: race ? 4.5 : 3,
        fill: race ? RED : GRAY, stroke: SURF, 'stroke-width': 2
      }));
      if (race) text(svg, px(i), py(v) - 11, race.short + ' 26.2', { fill: INK, size: 11, weight: 700 });
      else if (i === peakAt) text(svg, px(i), py(v) - 11, fmt(v), { fill: INK, size: 12, weight: 700 });
    });

    /* actual: connect only consecutive logged weeks, so a gap reads as a gap */
    var seg = [];
    function flushSeg() {
      if (seg.length > 1) {
        svg.appendChild(svgEl('path', {
          d: seg.map(function (p, k) { return (k ? 'L' : 'M') + p[0] + ',' + p[1]; }).join(''),
          fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'
        }));
      }
      seg = [];
    }
    var last = -1;
    actual.forEach(function (v, i) {
      if (v == null) { flushSeg(); return; }
      seg.push([px(i), py(v)]);
      last = i;
    });
    flushSeg();
    /* r=5: a logged run usually lands right on its planned gray dot, and an
       equal-sized blue dot reads as "nothing logged" */
    actual.forEach(function (v, i) {
      if (v == null) return;
      svg.appendChild(svgEl('circle', { cx: px(i), cy: py(v), r: 5, fill: BLUE, stroke: SURF, 'stroke-width': 2 }));
    });
    if (last >= 0) {
      var right = px(last) > W - 70;
      text(svg, px(last) + (right ? -9 : 9), py(actual[last]) + 16, fmt(actual[last]),
           { anchor: right ? 'end' : 'start', fill: INK, size: 12, weight: 700 });
    }

    xLabels(svg, weeks, band, PADT + plotH + 18);
    hitBands(svg, weeks, band, plotH, function (w, i) {
      return tipHead(w) + '<span>' + w.s[keyIdx[i]].det + '</span>' +
             '<span>Planned ' + fmt(planned[i]) + ' mi</span>' +
             '<span>Logged ' + (actual[i] != null ? fmt(actual[i]) + ' mi' : '—') + '</span>';
    });

    var count = actual.filter(function (v) { return v != null; }).length;
    var stat = count
      ? count + ' of ' + n + ' long runs logged <span>· latest ' + fmt(actual[last]) +
        ' mi in week ' + weeks[last].n + ' (planned ' + fmt(planned[last]) + ')</span>'
      : 'No long run logged yet <span>· this chart follows each week\'s key session — ' +
        'the Saturday long run, or the race. Weekday runs count in the other two charts.</span>';
    return { svg: svg, stat: stat };
  }

  /* ================= 3 · cumulative ================= */
  /* range 'todate' zooms to the weeks so far (plus a little runway): on the
     whole-block scale of ~1,000 miles, the first weeks are a few pixels tall and
     read as a flat line on zero. 'block' shows all of it. Both lines start
     from a zero origin at the left edge, so even one logged week draws a line
     rather than a lone dot. */
  function cumulativeChart(plan, getLog, now, range) {
    var all = plan.weeks, H = 226, PADB = 34;
    var planned = [], actual = [], p = 0, a = 0, lastLogged = -1;
    all.forEach(function (w, i) {
      p += w.total;
      w.s.forEach(function (s, k) {
        var L = getLog(w.n, k);
        if (L) { a += +L.mi || 0; lastLogged = i; }
      });
      planned.push(p); actual.push(a);
    });

    var here = !now ? 0 : now.over ? all.length - 1 : now.started ? now.idx : 0;
    /* the logged line runs to today (or the last log), never on into the future */
    var endIdx = lastLogged < 0 ? -1 : Math.max(lastLogged, here);
    var nShow = range === 'block' ? all.length
              : Math.max(4, Math.min(all.length, Math.max(lastLogged, here) + 2));
    var weeks = all.slice(0, nShow);
    var lastShown = nShow - 1, endShown = Math.min(endIdx, lastShown);

    var top = Math.max(planned[lastShown], endShown >= 0 ? actual[endShown] : 0, 1);
    var step = niceStep(top), yMax = Math.ceil(top / step) * step;

    var f = frame({ H: H, PADB: PADB, n: nShow, yMax: yMax, step: step,
                    now: now && !now.over && now.idx < nShow ? now : null,
                    label: 'Cumulative planned miles against cumulative logged miles' });
    var svg = f.svg, plotH = f.plotH, band = f.band;
    function px(i) { return PADL + i * band + band / 2; }
    function py(v) { return PADT + plotH - (v / yMax) * plotH; }
    function path(arr, upto) {
      var d = 'M' + PADL + ',' + py(0);
      for (var i = 0; i <= upto; i++) d += 'L' + px(i) + ',' + py(arr[i]);
      return d;
    }

    svg.appendChild(svgEl('path', {
      d: path(planned, lastShown), fill: 'none', stroke: GRAY, 'stroke-width': 2,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round'
    }));
    /* label sits on the end of the gray line, not floating at the chart edge */
    text(svg, px(lastShown), py(planned[lastShown]) - 10, Math.round(planned[lastShown]) + ' mi',
         { anchor: 'end', fill: INK, size: 12, weight: 700 });

    if (endShown >= 0) {
      svg.appendChild(svgEl('path', {
        d: path(actual, endShown), fill: 'none', stroke: BLUE, 'stroke-width': 2,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round'
      }));
      svg.appendChild(svgEl('circle', { cx: px(endShown), cy: py(actual[endShown]), r: 5, fill: BLUE, stroke: SURF, 'stroke-width': 2 }));
      var right = px(endShown) > W - 90;
      text(svg, px(endShown) + (right ? -10 : 10), py(actual[endShown]) + 17, fmt(actual[endShown]) + ' mi',
           { anchor: right ? 'end' : 'start', fill: INK, size: 12, weight: 700 });
    }

    xLabels(svg, weeks, band, PADT + plotH + 18, nShow <= 12 ? 1 : 4);
    hitBands(svg, weeks, band, plotH, function (w, i) {
      var diff = actual[i] - planned[i];
      return tipHead(w) +
        '<span>Planned to date ' + fmt(planned[i]) + ' mi</span>' +
        (i <= endIdx
          ? '<span>Logged to date ' + fmt(actual[i]) + ' mi (' + (diff >= 0 ? '+' : '') + fmt(diff) + ')</span>'
          : '');
    });

    var stat;
    if (endIdx < 0) stat = 'Nothing logged yet';
    else {
      var d = actual[endIdx] - planned[endIdx];
      stat = fmt(actual[endIdx]) + ' mi logged <span>· plan through week ' + all[endIdx].n + ': ' +
             fmt(planned[endIdx]) + ' mi' +
             (now && now.started ? ' (' + (d >= 0 ? '+' : '') + fmt(d) + ')' : '') + '</span>';
    }
    return { svg: svg, stat: stat };
  }

  /* ---------- assembly ---------- */
  function legendOf(items) {
    var l = document.createElement('div');
    l.className = 'chart-legend';
    items.forEach(function (it) {
      var s = document.createElement('span');
      var key = document.createElement('i');
      key.style.background = it[1];
      if (it[2]) key.className = it[2];
      s.appendChild(key);
      s.appendChild(document.createTextNode(it[0]));
      l.appendChild(s);
    });
    return l;
  }

  /* o = { title, sub, legend, chart: {svg, stat}, control } */
  function card(o) {
    var c = document.createElement('div');
    c.className = 'chart-card';
    var head = document.createElement('div');
    head.className = 'chart-head';
    var h = document.createElement('h3');
    h.textContent = o.title;
    head.appendChild(h);
    if (o.control) head.appendChild(o.control);
    c.appendChild(head);
    var p = document.createElement('p');
    p.textContent = o.sub;
    c.appendChild(p);
    if (o.chart.stat) {
      var s = document.createElement('div');
      s.className = 'chart-stat';
      s.innerHTML = o.chart.stat;
      c.appendChild(s);
    }
    c.appendChild(o.legend);
    var scroll = document.createElement('div');
    scroll.className = 'chart-scroll';
    scroll.appendChild(o.chart.svg);
    c.appendChild(scroll);
    return c;
  }

  /* A zoom on the cumulative chart's own axis — not a data filter — so it
     lives on that card. Remembered per browser; it is only a convenience. */
  function rangeKey(plan) { return (plan.storageKey || plan.id) + ':cumRange'; }
  function getRange(plan) {
    try { return localStorage.getItem(rangeKey(plan)) === 'block' ? 'block' : 'todate'; }
    catch (e) { return 'todate'; }
  }
  function rangeControl(plan, current, onChange) {
    var seg = document.createElement('div');
    seg.className = 'seg';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Cumulative chart range');
    [['todate', 'To date'], ['block', 'Whole block']].forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt[1];
      b.className = opt[0] === current ? 'on' : '';
      b.setAttribute('aria-pressed', opt[0] === current ? 'true' : 'false');
      b.onclick = function () {
        try { localStorage.setItem(rangeKey(plan), opt[0]); } catch (e) {}
        onChange();
      };
      seg.appendChild(b);
    });
    return seg;
  }

  window.renderCharts = function (plan, getLog, now) {
    var host = document.getElementById('charts');
    if (!host) return;
    var at = now && !now.over ? now : null;
    var range = getRange(plan);
    hideTip();
    host.innerHTML = '';
    host.appendChild(card({
      title: 'Weekly volume',
      sub: 'Each week: planned on the left, what you logged on the right. The strip underneath is the phase.',
      legend: legendOf([['Planned', GRAY, 'key-bar'], ['Logged', BLUE, 'key-bar'], ['Race', RED]]),
      chart: weeklyChart(plan, getLog, at)
    }));
    host.appendChild(card({
      title: 'Long run',
      sub: 'The key session of each week — the Saturday long run, 10 miles building to 21, then the race itself.',
      legend: legendOf([['Planned', GRAY, 'key-line'], ['Logged', BLUE, 'key-line'], ['Race', RED]]),
      chart: longRunChart(plan, getLog, at)
    }));
    host.appendChild(card({
      title: 'Cumulative miles',
      sub: range === 'block'
        ? 'Running total against the plan across all ' + plan.weeks.length + ' weeks.'
        : 'Running total against the plan, zoomed to the weeks so far.',
      legend: legendOf([['Planned', GRAY, 'key-line'], ['Logged', BLUE, 'key-line']]),
      chart: cumulativeChart(plan, getLog, now, range),
      control: rangeControl(plan, range, function () { window.renderCharts(plan, getLog, now); })
    }));
    window.centerChartsOnNow();
  };

  /* On a phone the charts scroll sideways. Bring the current week into view
     instead of always opening on week 1. Needs layout, so it is a no-op while
     the dashboard is hidden — plan.js calls it again on returning there. */
  window.centerChartsOnNow = function () {
    document.querySelectorAll('#charts .chart-scroll').forEach(function (box) {
      var svg = box.querySelector('svg[data-now-x]');
      if (!svg || box.scrollWidth <= box.clientWidth) return;
      var x = (+svg.getAttribute('data-now-x') / W) * box.scrollWidth;
      box.scrollLeft = Math.max(0, x - box.clientWidth / 2);
    });
  };
})();
