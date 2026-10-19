# training_plan

Albeiro's training plans, published with GitHub Pages at
https://albeiros.github.io/training_plan/ — repo https://github.com/AlbeiroS/training_plan
(branch `main`, served from the repo root).

## Athlete

Marathon PR 3:14:42. Eight-time Houston starter, BQ'd for Boston 2027 (second Boston).
Runs five days a week: **Mon** Z1 recovery · **Tue** intervals · **Wed** Z2 easy ·
**Thu** tempo inside an easy run · **Sat** long run. Fri and Sun are rest.
Hard caps, not targets: **55 mi/week peak**, **21 mi longest run**.

## The source framework

The 24-week master plan is the athlete's own design, held in a Google Sheet
(`1hPH1jDB3bQmLIJPyOU-ouSgS0aUDyDnbkLFfLhWlIdU`, tabs `FullTraining_<Level>`) and
visualised in `~/Downloads/marathon-training-hub-v2.html`. Four levels by peak weekly
mileage — Beginner 29, Basic 40, Intermediate 52, Advanced 64 — over four phases:

| Phase | Weeks | Objective |
|---|---|---|
| Base | 1–12 | Aerobic capacity, muscular endurance, connective tissue |
| Stride | 13–16 | Stride efficiency, neuromuscular coordination |
| Cadence | 17–20 | Running economy, race-specific fitness, marathon pace |
| Taper | 21–24 | Shed fatigue, keep fitness |

Race-specific plans are **derived** from this framework, not written from scratch.
Note that the hub HTML's `distributeDailyMiles()` is a placeholder — it splits a week
as 35% long run and divides the rest evenly, so it models weekly *totals* only. The
real daily structure lives in the derived plan JSON here.

## Layout

```
index.html                   the Oct 2026 half plan — self-contained, pre-refactor
road-to-boston-2027.html     thin page, ~50 lines
assets/plan.css              shared styles for every derived plan
assets/plan.js               shared renderer + logger
assets/charts.js             inline-SVG charts
assets/sync.js               log sync to a Google Sheet
assets/sync-config.js        the /exec URL + token (empty = local-only)
apps-script/Code.gs          the Sheet-side endpoint, pasted into Apps Script
plans/road-to-boston-2027.js plan data (sets window.PLAN_DATA)
```

Script order in the page matters: plan data → sync-config → sync → charts → plan.

Adding a race = one data file plus one thin HTML page. `index.html` still holds the
old half-marathon plan inline; fold it into the shared renderer and turn the root into
a hub when convenient.

**Why the plan data is `.js` and not `.json`:** so the page works when opened straight
off disk by double-clicking. `file://` origin rules block `fetch()` but not
`<script src>`, so the data is assigned to `window.PLAN_DATA` by its own script tag.
Load order in the page matters — data file first, then `assets/plan.js`, then
`renderPlan()`. `renderPlan(url)` still accepts a URL and will fetch it when no global
is present, but nothing uses that path today.

## Plan data shape

The file is `window.PLAN_DATA = { ... };` wrapping this object:

```jsonc
{
  "id": "...", "title": "...", "kicker": "...", "subtitle": "...",
  "start": "2026-10-26",        // Monday of week 1
  "storageKey": "rtb2027",      // must be unique per plan or logs collide
  "races":  [ { "name", "short", "date", "week", "goal", "note" } ],  // week = the plan week it falls in; short = chart label (HOU)
  "paces":  [ { "key", "label", "pace", "note" } ],   // key must match a --var in plan.css
  "phases": { "base": { "label", "color", "weeks", "objective", "focus" } },
  "weeks":  [ { "n", "phase", "title", "dates", "total", "note",
                "s": [ { "day", "type", "mi", "det", "feel" } ] } ]
}
```

`type` must be one of `z1 z2 interval tempo long race rest` — each maps to a CSS
variable of the same name. `phase` must be a key of `phases`. Week `total` is authored,
not computed, so it must equal the sum of that week's `mi`.

## Local preview

Double-clicking `road-to-boston-2027.html` works — no server needed. To serve the
folder anyway (closer to how Pages behaves):

```bash
python -m http.server 8777
```

Then http://localhost:8777/road-to-boston-2027.html. `.claude/launch.json` has this
wired as the `training-plan` config.

## Publishing

Commit and push to `main`; Pages redeploys in under a minute. Files are UTF-8 and
contain `·`, `×`, `–`, `→` — keep them that way.

**Bump the `?v=` on every asset link in the plan HTML whenever anything in `assets/`
or `plans/` changes.** Pages serves everything with `Cache-Control: max-age=600`, so
without a new query string a browser will happily pair the new HTML with up to
10-minute-old CSS/JS. That happened once (Oct 19): the athlete saw the new nav as bare
links on top of the old layout. Use one version string for all links on the page,
format `YYYY-MM-DD.N`.

## Page structure

Hash-routed views, no framework: `#dashboard` (default) · `#weeks` · `#paces` ·
`#phases`. `route()` in `plan.js` toggles `.view.on` and a `v-<name>` class on `body`.
The hero only shows on the dashboard (`body:not(.v-dashboard) .hero`). The nav is
sticky. `#weeks` scrolls to and opens the current week.

The dashboard is: hero → block stats → charts → a "this week" card you can log from
(the athlete asked for the card below the charts).
"This week" is computed from `start`; before the block begins it shows week 1 as
"up next".

## Logging and sync

Two tiers, and the split is the point: **plans live in git, logs live in a Sheet.**
Authored content wants version history; captured data wants to be queryable and to
outlive any one device.

A log entry records what was actually run, keyed `"<week>-<sessionIndex>"`:
`{ mi, time, note, at }`. `time` is normalised to `h:mm:ss`/`m:ss`; pace is derived,
never stored locally. The editor (bottom sheet on phones) accepts `:`, `.` or spaces as
time separators so the phone's decimal keypad is enough. The original format stored
`true` per key — `normalize()` upgrades those to the planned distance on load, and
also drops entries for sessions that no longer exist.

- `localStorage` under `storageKey` is always written first, so the UI never waits on
  the network and logging works with no signal. It does **not** survive clearing site
  data — the Export/Import JSON buttons are the manual backup path.
- `assets/sync.js` + `apps-script/Code.gs` push the log to a Google Sheet. Changes
  queue in `<storageKey>:pending` (each with a unique `stamp`, so an edit made while a
  flush is in flight is not lost) and flush when they can; on load the Sheet is the
  source of truth with anything pending applied on top. The bottom bar shows
  `synced` / `syncing` / `offline` / `local only`.

Sheet columns: `plan key week session day type planned_mi actual_mi time pace notes
done updated_at`, one row per session, upserted by `(plan, key)`. Removing a log sets
`done = FALSE` rather than deleting the row. **Columns B and I:K are forced to plain
text** — otherwise Sheets turns a key like `3-1` into 1 March and `1:22:10` into a
time-of-day, silently corrupting the log. Keep that if you touch `Code.gs`.

Sync is **off** until `assets/sync-config.js` has a `/exec` URL and token — with it
empty everything still works, just locally. Setup steps are in the header comment of
`apps-script/Code.gs`.

The POST deliberately uses `Content-Type: text/plain` so the browser treats it as a
simple request and sends no CORS preflight — Apps Script does not answer `OPTIONS`.
Don't "fix" that to `application/json`; it breaks the write path.

Security: a public static page cannot hold a secret, so the token is visible in
source. This is obscure, not secure. The Sheet's revision history is the undo.

## Charts

`assets/charts.js`, hand-rolled inline SVG — no charting library, so the page works
off disk and offline. Three charts, each planned-vs-logged on **one** miles axis:
weekly volume (grouped columns), long run (the week's longest planned session — the
Saturday long run, or the race — vs what was logged for that same session; weekday
runs deliberately do not count here), and cumulative. A shaded "NOW"/"NEXT" column
marks the current week. The cumulative logged line stops at today; the long-run logged
line breaks where a week wasn't logged, so a gap reads as a gap.

Each card can carry a one-line summary (`stat`) under its subtitle — chart functions
return `{ svg, stat }`. The long-run summary says plainly when no long run has been
logged, because a blank chart there was mistaken for a bug.

Cumulative has a **To date / Whole block** switch (default To date, remembered in
`localStorage` under `<storageKey>:cumRange`). On the whole-block 0–1,000 axis the
first weeks are a few pixels tall and read as a flat line on zero; To date shows weeks
1 → now+2 (minimum 4) with its own scale. Both lines start from a zero origin so one
logged week still draws a line, not a lone dot.

On phones the charts scroll sideways; `centerChartsOnNow()` scrolls each one so the
current week is in view. It needs layout, so `route()` re-runs it on returning to the
dashboard.

Planned is context and wears `#ADA799`; logged is the subject and wears `#1C6E9E`.
That gray is 2.4:1 against white — under 3:1, which is only acceptable because every
planned value is also in the week list and the tooltips. Don't remove both of those.

Legend swatch classes are `key-bar` / `key-line`, not `bar` / `line`: a bare `.bar`
matches the fixed footer and pins the swatch to the bottom of the screen.

Phase identity is carried by the labelled band under the x-axis, **never by bar hue**.
The seven UI phase colours fail pairwise CVD separation as large fills (stride
`#4B7A52` vs recovery `#7A7669` is ΔE 7.8 even in normal vision) — fine beside a text
label in the UI, wrong in a 25-bar chart. Charts use a single blue `#1C6E9E` with the
races in `#B4283C`; that pair validates at ΔE 16.6 protan / 26.5 normal. If you add a
chart colour, validate it rather than eyeballing it.
