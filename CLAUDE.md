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
road-to-boston-2027.html     thin page, ~40 lines
assets/plan.css              shared styles for every derived plan
assets/plan.js               shared renderer + logger
plans/road-to-boston-2027.json   plan data
```

Adding a race = one JSON file plus one thin HTML page. `index.html` still holds the
old half-marathon plan inline; fold it into the shared renderer and turn the root into
a hub when convenient.

## Plan JSON shape

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

`plan.js` fetches the JSON, so opening the HTML off disk is blocked by `file://`
origin rules. Serve it:

```bash
python -m http.server 8777
```

Then http://localhost:8777/road-to-boston-2027.html. `.claude/launch.json` has this
wired as the `training-plan` config.

## Publishing

Commit and push to `main`; Pages redeploys in under a minute. Files are UTF-8 and
contain `·`, `×`, `–`, `→` — keep them that way. Non-ASCII in the JSON is written as
`\uXXXX` escapes deliberately, so the data file survives any editor.

## Logging

Runs are logged to `localStorage` under `storageKey`, with export/import JSON buttons
as the backup path. Planned next step: a Google Apps Script Web App as a thin JSON
endpoint writing to a Sheet, so the log is cross-device — the page writing locally
first and syncing when online. Plans stay in git; only the log moves to the Sheet.
