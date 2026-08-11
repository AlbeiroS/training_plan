# training_plan

Static site published with GitHub Pages at https://albeiros.github.io/training_plan/
Repo: https://github.com/AlbeiroS/training_plan (branch `main`, served from repo root).

## Layout

- `index.html` — self-contained page: CSS in a `<style>` block, plan data + rendering in one
  `<script>` block. No build step, no dependencies except the Google Fonts link.

## Plan data

Editing the plan means editing the `PLAN` array near the top of the `<script>` block
(~line 240 of `index.html`). Shape:

```js
const RACE = new Date(2026, 9, 25, 7, 0, 0); // month is 0-based: 9 = October

const PLAN = [
  { n: 1, phase: 'base', title: 'Getting rolling', dates: 'Aug 10 – 16',
    note: 'Week-level guidance.',
    s: [
      { type: 'easy',     mi: 3,   det: 'What to run',  feel: 'How it should feel.' },
      { type: 'interval', mi: 3.5, det: '...',          feel: '...' },
      { type: 'long',     mi: 4,   det: '...',          feel: '...' }
    ] },
];
```

- `phase`: `base` | `build` | `peak` | `taper` | `race` — drives the colour accents
  (`--base`, `--build`, … in `:root`).
- `type`: `easy` | `interval` | `long` — drives the session colour (`--easy`, `--interval`, `--long`).
- `mi`: distance in **miles**.

## Adding another training plan

The site currently serves one plan at the root. To add a second, add a new HTML file
(e.g. `10k.html`) and link to it from `index.html` — GitHub Pages serves any file in
the repo root at `https://albeiros.github.io/training_plan/<file>`.

## Publishing

Commit and push to `main`; Pages redeploys automatically (usually under a minute).
The file is UTF-8 — keep it that way (it contains `·`, `×`, `–`).
