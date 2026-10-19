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
  "races":  [ { "name", "date", "week", "goal", "note" } ],
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
contain `·`, `×`, `–`, `→` — keep them that way. Non-ASCII in the JSON is written as
`\uXXXX` escapes deliberately, so the data file survives any editor.

## Logging and sync

Two tiers, and the split is the point: **plans live in git, logs live in a Sheet.**
Authored content wants version history; captured data wants to be queryable and to
outlive any one device.

- `localStorage` under `storageKey` is always written first, so the UI never waits on
  the network and logging works with no signal. It does **not** survive clearing site
  data — the Export/Import JSON buttons are the manual backup path.
- `assets/sync.js` + `apps-script/Code.gs` push the log to a Google Sheet. Toggles
  queue in `<storageKey>:pending` and flush when they can; on load the Sheet is the
  source of truth with anything pending applied on top. The bottom bar shows
  `synced` / `syncing` / `offline` / `local only`.

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
off disk and offline. Three charts: weekly volume (columns), long run (line), and
cumulative planned-vs-logged.

Phase identity is carried by the labelled band under the x-axis, **never by bar hue**.
The seven UI phase colours fail pairwise CVD separation as large fills (stride
`#4B7A52` vs recovery `#7A7669` is ΔE 7.8 even in normal vision) — fine beside a text
label in the UI, wrong in a 25-bar chart. Charts use a single blue `#1C6E9E` with the
races in `#B4283C`; that pair validates at ΔE 16.6 protan / 26.5 normal. If you add a
chart colour, validate it rather than eyeballing it.
