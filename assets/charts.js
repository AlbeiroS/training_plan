/* Inline-SVG charts for the plan pages. No charting library: these need to work
   off disk and with no network, and three hand-rolled SVGs cost less than a CDN.

   Palette note: the chart blue is #1C6E9E, not the UI's #2F6F8F. The UI colour
   sits below the chroma floor and reads gray as a large fill; #1C6E9E passes the
   CVD checks against the race red (dE 16.6 protan / 26.5 normal vision) while
   staying in the same family. Phase identity is NEVER carried by bar hue here —
   seven hues would fail pairwise separation — it rides the labelled band under
   the axis, with the Phases section above acting as the legend. */

(function () {
  'use strict';

  var BLUE = '#1C6E9E';
  var RED  = '#B4283C';
  var INK  = '#12141C';
  var MUTE = '#7A7669';
  var GRID = '#E2DED4';
  var SURF = '#FFFFFF';

  var W = 760, PADL = 40, PADR = 16, PADT = 24;

  function svgEl(name, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* Bar with a 4px rounded data-end and square corners at the baseline. */
  function barPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, h, w / 2);
    return 'M' + x + ',' + (y + h) +
           'L' + x + ',' + (y + r) +
           'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
           'L' + (x + w - r) + ',' + y +
           'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) +
           'L' + (x + w) + ',' + (y + h) + 'Z';
  }

  /* ---------- shared tooltip ---------- */
  var tip = null;
  function showTip(host, html, ev) {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      document.body.appendChild(tip);
    }
    tip.innerHTML = html;
    tip.style.display = 'block';
    var r = tip.getBoundingClientRect();
    var x = ev.clientX - r.width / 2;
    var y = ev.clientY - r.height - 14;
    tip.style.left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    tip.style.top = Math.max(8, y) + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  function hoverable(node, html) {
    node.style.cursor = 'default';
    node.addEventListener('mousemove', function (ev) { showTip(null, html, ev); });
    node.addEventListener('mouseleave', hideTip);
    node.addEventListener('touchstart', function (ev) {
      showTip(null, html, ev.touches[0]);
    }, { passive: true });
  }

  function axes(svg, H, PADB, yMax, ticks) {
    var plotH = H - PADT - PADB;
    ticks.forEach(function (t) {
      var y = PADT + plotH - (t / yMax) * plotH;
      svg.appendChild(svgEl('line', {
        x1: PADL, y1: y, x2: W - PADR, y2: y,
        stroke: GRID, 'stroke-width': 1
      }));
      var lab = svgEl('text', {
        x: PADL - 8, y: y + 4, 'text-anchor': 'end',
        fill: MUTE, 'font-size': 12, 'font-family': 'Karla,sans-serif'
      });
      lab.textContent = t;
      svg.appendChild(lab);
    });
  }

  /* ================= 1 · weekly mileage ================= */
  function weeklyChart(plan) {
    var H = 250, PADB = 56;
    var weeks = plan.weeks;
    var n = weeks.length;
    var plotW = W - PADL - PADR, plotH = H - PADT - PADB;
    var band = plotW / n;
    var barW = Math.min(24, band - 3);
    var yMax = 60;

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Planned miles for each of the ' + n + ' weeks'
    });
    axes(svg, H, PADB, yMax, [0, 20, 40, 60]);

    weeks.forEach(function (w, i) {
      var isRace = w.s.some(function (s) { return s.type === 'race'; });
      var h = (w.total / yMax) * plotH;
      var x = PADL + i * band + (band - barW) / 2;
      var y = PADT + plotH - h;

      var bar = svgEl('path', {
        d: barPath(x, y, barW, h, 4),
        fill: isRace ? RED : BLUE
      });
      hoverable(bar,
        '<strong>Week ' + w.n + ' · ' + w.title + '</strong>' +
        '<span>' + w.dates + '</span>' +
        '<span>' + w.total + ' mi planned</span>');
      svg.appendChild(bar);

      /* label only the peak and the races — never every bar */
      if (w.total === 55 || isRace) {
        var t = svgEl('text', {
          x: x + barW / 2, y: y - 7, 'text-anchor': 'middle',
          fill: INK, 'font-size': 12, 'font-weight': 700,
          'font-family': 'Karla,sans-serif'
        });
        t.textContent = isRace ? '26.2' : w.total;
        svg.appendChild(t);
      }

      /* every 4th week number, plus week 1 */
      if (i === 0 || (w.n % 4 === 0)) {
        var xl = svgEl('text', {
          x: x + barW / 2, y: PADT + plotH + 16, 'text-anchor': 'middle',
          fill: MUTE, 'font-size': 11, 'font-family': 'Karla,sans-serif'
        });
        xl.textContent = w.n;
        svg.appendChild(xl);
      }
    });

    /* phase band — carries phase identity instead of the bar hue */
    var bandY = PADT + plotH + 26, runStart = 0;
    for (var i = 0; i <= n; i++) {
      var cur = i < n ? weeks[i].phase : null;
      if (i === n || cur !== weeks[runStart].phase) {
        var ph = plan.phases[weeks[runStart].phase];
        var x0 = PADL + runStart * band + 1;
        var wid = (i - runStart) * band - 2;
        svg.appendChild(svgEl('rect', {
          x: x0, y: bandY, width: wid, height: 7, rx: 3.5, fill: ph.color
        }));
        if (wid > 64) {
          var pl = svgEl('text', {
            x: x0 + wid / 2, y: bandY + 21, 'text-anchor': 'middle',
            fill: MUTE, 'font-size': 11, 'font-weight': 700,
            'letter-spacing': '.08em', 'font-family': 'Karla,sans-serif'
          });
          pl.textContent = ph.label.toUpperCase();
          svg.appendChild(pl);
        }
        runStart = i;
      }
    }
    return svg;
  }

  /* ================= 2 · long run progression ================= */
  function longRunChart(plan) {
    var H = 205, PADB = 34;
    var weeks = plan.weeks, n = weeks.length;
    var plotW = W - PADL - PADR, plotH = H - PADT - PADB;
    var band = plotW / n, yMax = 30;

    var pts = weeks.map(function (w, i) {
      var longest = 0;
      w.s.forEach(function (s) { if (s.mi > longest) longest = s.mi; });
      return {
        w: w, x: PADL + i * band + band / 2,
        y: PADT + plotH - (Math.min(longest, yMax) / yMax) * plotH,
        mi: longest,
        isRace: w.s.some(function (s) { return s.type === 'race'; })
      };
    });

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Longest run in each week, building from 10 to 21 miles'
    });
    axes(svg, H, PADB, yMax, [0, 10, 20, 30]);

    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x + ',' + p.y; }).join('');
    /* area wash at ~10% under the line */
    svg.appendChild(svgEl('path', {
      d: d + 'L' + pts[n - 1].x + ',' + (PADT + plotH) + 'L' + pts[0].x + ',' + (PADT + plotH) + 'Z',
      fill: BLUE, opacity: .1
    }));
    svg.appendChild(svgEl('path', {
      d: d, fill: 'none', stroke: BLUE, 'stroke-width': 2,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round'
    }));

    pts.forEach(function (p) {
      var r = p.isRace || p.mi === 21 ? 5 : 3.5;
      var dot = svgEl('circle', {
        cx: p.x, cy: p.y, r: r,
        fill: p.isRace ? RED : BLUE, stroke: SURF, 'stroke-width': 2
      });
      hoverable(dot,
        '<strong>Week ' + p.w.n + '</strong>' +
        '<span>' + p.w.dates + '</span>' +
        '<span>' + p.mi + ' mi longest run</span>');
      svg.appendChild(dot);

      if (p.mi === 21 || p.isRace) {
        var t = svgEl('text', {
          x: p.x, y: p.y - 11, 'text-anchor': 'middle',
          fill: INK, 'font-size': 12, 'font-weight': 700,
          'font-family': 'Karla,sans-serif'
        });
        t.textContent = p.isRace ? '26.2' : p.mi;
        svg.appendChild(t);
      }
    });

    weeks.forEach(function (w, i) {
      if (i === 0 || w.n % 4 === 0) {
        var xl = svgEl('text', {
          x: PADL + i * band + band / 2, y: PADT + plotH + 18,
          'text-anchor': 'middle', fill: MUTE, 'font-size': 11,
          'font-family': 'Karla,sans-serif'
        });
        xl.textContent = w.n;
        svg.appendChild(xl);
      }
    });
    return svg;
  }

  /* ================= 3 · cumulative, planned vs logged ================= */
  function cumulativeChart(plan, loggedFor) {
    var H = 205, PADB = 34;
    var weeks = plan.weeks, n = weeks.length;
    var plotW = W - PADL - PADR, plotH = H - PADT - PADB;
    var band = plotW / n;

    var planned = [], done = [], pSum = 0, dSum = 0, anyLogged = false;
    weeks.forEach(function (w) {
      pSum += w.total;
      w.s.forEach(function (s, i) {
        if (loggedFor(w.n, i)) { dSum += s.mi || 0; anyLogged = true; }
      });
      planned.push(pSum); done.push(dSum);
    });
    var yMax = Math.ceil(pSum / 250) * 250;

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Cumulative planned miles against miles you have logged'
    });
    var ticks = [0, yMax / 4, yMax / 2, yMax * 3 / 4, yMax];
    axes(svg, H, PADB, yMax, ticks);

    function toPath(arr) {
      return arr.map(function (v, i) {
        return (i ? 'L' : 'M') + (PADL + i * band + band / 2) + ',' +
               (PADT + plotH - (v / yMax) * plotH);
      }).join('');
    }

    /* planned is context — gray. logged is the subject — blue. */
    svg.appendChild(svgEl('path', {
      d: toPath(planned), fill: 'none', stroke: MUTE, 'stroke-width': 2,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: .55
    }));

    if (anyLogged) {
      svg.appendChild(svgEl('path', {
        d: toPath(done), fill: 'none', stroke: BLUE, 'stroke-width': 2,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round'
      }));
    }

    weeks.forEach(function (w, i) {
      var hit = svgEl('rect', {
        x: PADL + i * band, y: PADT, width: band, height: plotH,
        fill: 'transparent'
      });
      hoverable(hit,
        '<strong>Week ' + w.n + '</strong>' +
        '<span>' + Math.round(planned[i]) + ' mi planned to date</span>' +
        '<span>' + Math.round(done[i]) + ' mi logged</span>');
      svg.appendChild(hit);
    });

    var endLab = svgEl('text', {
      x: W - PADR, y: PADT + plotH - (pSum / yMax) * plotH - 9,
      'text-anchor': 'end', fill: INK, 'font-size': 12, 'font-weight': 700,
      'font-family': 'Karla,sans-serif'
    });
    endLab.textContent = Math.round(pSum) + ' mi';
    svg.appendChild(endLab);

    weeks.forEach(function (w, i) {
      if (i === 0 || w.n % 4 === 0) {
        var xl = svgEl('text', {
          x: PADL + i * band + band / 2, y: PADT + plotH + 18,
          'text-anchor': 'middle', fill: MUTE, 'font-size': 11,
          'font-family': 'Karla,sans-serif'
        });
        xl.textContent = w.n;
        svg.appendChild(xl);
      }
    });
    return svg;
  }

  /* ---------- assembly ---------- */
  function card(title, sub, svg, legend) {
    var c = document.createElement('div');
    c.className = 'chart-card';
    var h = document.createElement('h3');
    h.textContent = title;
    c.appendChild(h);
    var p = document.createElement('p');
    p.textContent = sub;
    c.appendChild(p);
    if (legend) c.appendChild(legend);
    var scroll = document.createElement('div');
    scroll.className = 'chart-scroll';
    scroll.appendChild(svg);
    c.appendChild(scroll);
    return c;
  }

  function legendOf(items) {
    var l = document.createElement('div');
    l.className = 'chart-legend';
    items.forEach(function (it) {
      var s = document.createElement('span');
      var dot = document.createElement('i');
      dot.style.background = it[1];
      s.appendChild(dot);
      s.appendChild(document.createTextNode(it[0]));
      l.appendChild(s);
    });
    return l;
  }

  window.renderCharts = function (plan, loggedFor) {
    var host = document.getElementById('charts');
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(card(
      'Weekly volume',
      'Every week of the block. Colour marks the two races; the strip underneath is the phase.',
      weeklyChart(plan),
      legendOf([['Training week', BLUE], ['Race', RED]])
    ));
    host.appendChild(card(
      'Long run',
      'The number that actually builds a marathon — 10 miles to 21, then the race itself.',
      longRunChart(plan), null
    ));
    host.appendChild(card(
      'Cumulative miles',
      'Planned against logged. The blue line appears as you tick sessions off.',
      cumulativeChart(plan, loggedFor),
      legendOf([['Planned', MUTE], ['Logged', BLUE]])
    ));
  };
})();
