/* Plan data. Assigned to a global rather than served as .json so the page
   works when opened straight off disk - file:// blocks fetch(), not <script>. */
window.PLAN_DATA = {
  "id": "road-to-boston-2027",
  "title": "Road to Boston",
  "kicker": "25 Weeks · Two Marathons",
  "subtitle": "Built on the 24-week base/stride/cadence/taper framework, Intermediate level, capped at 55 mi/week and 21 mi long. Houston is raced at the end of the base phase; Boston is the A race.",
  "start": "2026-10-26",
  "storageKey": "rtb2027",
  "races": [
    {
      "name": "Houston Marathon",
      "short": "HOU",
      "date": "2027-01-17",
      "week": 12,
      "goal": "3:30:00",
      "stretch": "3:27:00",
      "note": "Raced, but not emptied. A controlled 3:30 here is a fitness test and a dress rehearsal — not the season."
    },
    {
      "name": "Boston Marathon",
      "short": "BOS",
      "date": "2027-04-19",
      "week": 25,
      "goal": "Set in February",
      "note": "The A race. Goal time gets fixed after Houston tells us what the engine is actually worth."
    }
  ],
  "paces": [
    { "key": "z1",       "label": "Z1 recovery",  "pace": "10:00 – 10:30", "note": "Monday only. Genuinely slow. If it feels like training, it is too fast." },
    { "key": "z2",       "label": "Z2 easy",      "pace": "9:15 – 9:45",   "note": "The bulk of the plan. Conversational, nasal-breathing territory." },
    { "key": "mp",       "label": "Marathon pace","pace": "7:55 – 8:05",   "note": "3:30 is 8:01/mi. Train the top of the range and race the bottom of it." },
    { "key": "tempo",    "label": "Tempo",        "pace": "7:30 – 7:40",   "note": "Half-marathon effort. Comfortably hard, controlled, repeatable." },
    { "key": "interval", "label": "Interval",     "pace": "7:00 – 7:10",   "note": "10K effort. 800m in 3:30–3:35 · 1000m in 4:23–4:28 · 1200m in 5:15–5:22 · 1600m in 7:00–7:10." },
    { "key": "stride",   "label": "Strides",      "pace": "~6:00",              "note": "100m relaxed and fast, full walk-back recovery. Form work, not a workout." }
  ],
  "phases": {
    "base":    { "label": "Base",            "color": "#2F6F8F", "weeks": "1 – 8",   "objective": "Aerobic capacity, muscular endurance and connective-tissue strength. The phase that makes the rest survivable.", "focus": "Volume in easy zones. Intervals present but held at 10K effort — maintenance, not development. Strides twice a week to keep the legs honest." },
    "houston": { "label": "Houston-specific", "color": "#C4553C", "weeks": "9 – 11",  "objective": "Sharpen enough to race 3:30 without derailing the Boston build.", "focus": "Base volume held, marathon pace grafted into the Saturday long run: 4 miles, then 6, then a short 3 on the down week. Fuelling and hydration rehearsed at race pace." },
    "race-hou":{ "label": "Houston week",     "color": "#B4283C", "weeks": "12",          "objective": "Arrive rested. Race Sunday 17 January.", "focus": "Volume collapses, legs stay awake with strides. The fitness is already banked." },
    "recovery":{ "label": "Recovery",         "color": "#7A7669", "weeks": "13 – 14", "objective": "Absorb the marathon. This is the most important fortnight in the plan and the easiest to ruin.", "focus": "No quality of any kind in week 13. Strides return week 14. If anything still aches, take another week — Boston is 13 weeks out and there is room." },
    "stride":  { "label": "Stride",           "color": "#4B7A52", "weeks": "15 – 18", "objective": "Stride efficiency and neuromuscular coordination. Speed built on top of the Houston base.", "focus": "Mileage rebuilds, intensity steps up. Interval reps lengthen 800 → 1000 → 1200. Speed should feel smooth, never forced." },
    "cadence": { "label": "Cadence & Boston", "color": "#8A5B2E", "weeks": "19 – 22", "objective": "Running economy, race-specific fitness, and the one thing Houston cannot teach you — hills.", "focus": "Marathon pace on rolling terrain. Controlled downhill running to condition the quads for the first 16 miles of Boston, hill repeats for the Newton stretch at 16–21." },
    "taper":   { "label": "Taper",            "color": "#6A4C93", "weeks": "23 – 25", "objective": "Shed fatigue, keep fitness. Three weeks, not four — Houston and its recovery took one.", "focus": "Volume drops hard, intensity stays short and sharp. Sleep, food, hydration, and staying off your feet. Fitness is revealed, not built." }
  },
  "weeks": [
    { "n": 1, "phase": "base", "title": "The day after", "dates": "Oct 26 – Nov 1", "total": 30, "note": "You raced a half yesterday. Week one is damage control dressed as training — no reps, no tempo, nothing that asks a question of your legs.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery shuffle",                  "feel": "Shake the half out. Slower than you think is necessary." },
        { "day": "Tue", "type": "z2",       "mi": 6,  "det": "Easy + 4 × 100m strides",      "feel": "Strides only to remind the legs what fast feels like." },
        { "day": "Wed", "type": "z2",       "mi": 5,  "det": "Easy continuous",                   "feel": "Conversational the whole way." },
        { "day": "Thu", "type": "z2",       "mi": 5,  "det": "Easy continuous",                   "feel": "No tempo this week. Resist it." },
        { "day": "Sat", "type": "long",     "mi": 10, "det": "Easy long run",                     "feel": "Finish feeling you could do five more. You could — don't." }
      ] },
    { "n": 2, "phase": "base", "title": "Rhythm", "dates": "Nov 2 – 8", "total": 35, "note": "The full weekly shape arrives: Monday recovery, Tuesday reps, Wednesday easy, Thursday tempo, Saturday long. This is the pattern for the next six months.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Z1 means Z1." },
        { "day": "Tue", "type": "interval", "mi": 7,  "det": "1.5 mi w/u + 6 × 800m (400m jog) + 1.5 mi c/d", "feel": "Your bread-and-butter session. All six reps the same — 3:30–3:35." },
        { "day": "Wed", "type": "z2",       "mi": 7,  "det": "Easy continuous",                   "feel": "Legs will be heavy from Tuesday. Normal." },
        { "day": "Thu", "type": "tempo",    "mi": 6,  "det": "2 mi easy + 2 mi @ tempo + 2 mi easy", "feel": "First tempo. 7:35 and no faster." },
        { "day": "Sat", "type": "long",     "mi": 11, "det": "Easy long run",                     "feel": "All Z2. The long run earns nothing by being fast." }
      ] },
    { "n": 3, "phase": "base", "title": "Settling in", "dates": "Nov 9 – 15", "total": 38, "note": "Same session shapes, one more mile in most places. Three weeks up, then the first down week.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 7,  "det": "1.5 mi w/u + 6 × 800m (400m jog) + 1.5 mi c/d", "feel": "Identical to last week. Should feel smoother." },
        { "day": "Wed", "type": "z2",       "mi": 8,  "det": "Easy continuous",                   "feel": "Z2 discipline." },
        { "day": "Thu", "type": "tempo",    "mi": 6,  "det": "2 mi easy + 2 mi @ tempo + 2 mi easy", "feel": "Same as week 2, held steadier." },
        { "day": "Sat", "type": "long",     "mi": 12, "det": "Easy long run + 4 × 100m strides to finish", "feel": "Strides at the end, on tired legs. Good habit." }
      ] },
    { "n": 4, "phase": "base", "title": "Down week", "dates": "Nov 16 – 22", "total": 28, "note": "Volume drops but the long run barely does — that is how a marathon down week works. The easy days get cut, not the Saturday.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 3,  "det": "Recovery",                          "feel": "Short." },
        { "day": "Tue", "type": "interval", "mi": 6,  "det": "1.5 mi w/u + 4 × 800m (400m jog) + 1.5 mi c/d", "feel": "Two reps fewer. Same pace." },
        { "day": "Wed", "type": "z2",       "mi": 5,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "z2",       "mi": 4,  "det": "Easy continuous — no tempo",   "feel": "A real break from quality." },
        { "day": "Sat", "type": "long",     "mi": 10, "det": "Easy long run",                     "feel": "Comfortable. Good week to audit shoes — you will need a second pair before March." }
      ] },
    { "n": 5, "phase": "base", "title": "Second block", "dates": "Nov 23 – 29", "total": 40, "note": "Forty-mile week. Thanksgiving falls Thursday — the tempo is movable to Wednesday or Friday, but move it, do not skip it.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 7.5,"det": "1.5 mi w/u + 6 × 800m (400m jog) + 1.5 mi c/d + 2 × 100m strides", "feel": "Reps feel repeatable now. That is the point of base." },
        { "day": "Wed", "type": "z2",       "mi": 8,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 6.5,"det": "2 mi easy + 2.5 mi @ tempo + 2 mi easy", "feel": "Half a mile longer at tempo. Thanksgiving: shift the day, keep the session." },
        { "day": "Sat", "type": "long",     "mi": 13, "det": "Easy long run — start carrying fluid",    "feel": "Thirteen miles easy. Begin drinking on schedule, not on thirst." }
      ] },
    { "n": 6, "phase": "base", "title": "Building", "dates": "Nov 30 – Dec 6", "total": 44, "note": "Wednesday crosses nine miles. At five running days, 40+ mile weeks mean there are no short days left except Monday.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "The only genuinely short run of the week." },
        { "day": "Tue", "type": "interval", "mi": 8,  "det": "1.5 mi w/u + 7 × 800m (400m jog) + 1.5 mi c/d", "feel": "Seventh rep. Hold the pace, do not drift." },
        { "day": "Wed", "type": "z2",       "mi": 9,  "det": "Easy continuous",                   "feel": "Long for a midweek easy run. Keep it honest Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7,  "det": "2 mi easy + 3 mi @ tempo + 2 mi easy", "feel": "Three miles at tempo — your Thursday ceiling for this cycle." },
        { "day": "Sat", "type": "long",     "mi": 15, "det": "Easy long run + gel at 45 and 90 min", "feel": "Fuelling rehearsal starts here. Same gels you will use in Houston." }
      ] },
    { "n": 7, "phase": "base", "title": "First taste of pace", "dates": "Dec 7 – 13", "total": 47, "note": "Marathon pace enters the plan — three miles at the end of an 18-mile long run. This is the single most informative session so far.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "You will want this one." },
        { "day": "Tue", "type": "interval", "mi": 8,  "det": "1.5 mi w/u + 7 × 800m (400m jog) + 1.5 mi c/d", "feel": "Same as last week." },
        { "day": "Wed", "type": "z2",       "mi": 9,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7,  "det": "2 mi easy + 3 mi @ tempo + 2 mi easy", "feel": "Steady." },
        { "day": "Sat", "type": "long",     "mi": 18, "det": "15 mi easy + 3 mi @ MP",            "feel": "Eight-minute miles on 15-mile legs. If that feels impossible, 3:30 is the wrong number — tell me." }
      ] },
    { "n": 8, "phase": "base", "title": "Down week", "dates": "Dec 14 – 20", "total": 32, "note": "Last easy week before the Houston-specific block. Bank the recovery — the next three weeks are the hardest of the first half.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 6.5,"det": "1.5 mi w/u + 5 × 800m (400m jog) + 1.5 mi c/d", "feel": "Trimmed." },
        { "day": "Wed", "type": "z2",       "mi": 6,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "z2",       "mi": 5.5,"det": "Easy + 4 × 100m strides — no tempo", "feel": "Quality off, legs awake." },
        { "day": "Sat", "type": "long",     "mi": 10, "det": "Easy long run",                     "feel": "Deliberately short. Do not add miles because you feel good." }
      ] },
    { "n": 9, "phase": "houston", "title": "Marathon pace", "dates": "Dec 21 – 27", "total": 50, "note": "The Houston block. Reps lengthen to 1000m and the long run carries four miles at race pace. Christmas is Friday — already a rest day.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Z1." },
        { "day": "Tue", "type": "interval", "mi": 8.5,"det": "1.5 mi w/u + 5 × 1000m (400m jog) + 1.5 mi c/d", "feel": "4:23–4:28 per rep. Longer reps, same effort." },
        { "day": "Wed", "type": "z2",       "mi": 10, "det": "Easy continuous",                   "feel": "Ten easy. Z2 or it will cost you Saturday." },
        { "day": "Thu", "type": "tempo",    "mi": 7.5,"det": "2 mi easy + 3 mi @ tempo + 2.5 mi easy", "feel": "Controlled." },
        { "day": "Sat", "type": "long",     "mi": 19, "det": "15 mi easy + 4 mi @ MP — Boxing Day", "feel": "Full race kit, race breakfast, race start time. Treat it as a rehearsal." }
      ] },
    { "n": 10, "phase": "houston", "title": "Peak", "dates": "Dec 28 – Jan 3", "total": 52, "note": "The biggest week before Houston: 52 miles, a 20-mile long run with six at race pace. New Year's Day is Friday — rest day again. The calendar is on your side.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Protect Saturday." },
        { "day": "Tue", "type": "interval", "mi": 8,  "det": "1.5 mi w/u + 4 × 1200m (400m jog) + 1.5 mi c/d", "feel": "5:15–5:22 per rep. Hold rep four." },
        { "day": "Wed", "type": "z2",       "mi": 10, "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 9,  "det": "2.5 mi easy + 3 mi @ tempo + 3.5 mi easy", "feel": "Longest Thursday of the block." },
        { "day": "Sat", "type": "long",     "mi": 20, "det": "14 mi easy + 6 mi @ MP",            "feel": "The key session of the Houston build. Six miles at 8:00 off 14 easy tells you your race." }
      ] },
    { "n": 11, "phase": "houston", "title": "Pulling back", "dates": "Jan 4 – 10", "total": 38, "note": "Taper begins. Volume drops a third, intensity stays. You will feel restless and full of energy — that is the taper working, not a signal to add miles.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 7,  "det": "1.5 mi w/u + 4 × 800m @ MP (400m jog) + 1.5 mi c/d", "feel": "At race pace, not 10K pace. Rehearsing rhythm." },
        { "day": "Wed", "type": "z2",       "mi": 7,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "tempo",    "mi": 6,  "det": "2 mi easy + 2 mi @ tempo + 2 mi easy", "feel": "Short and sharp." },
        { "day": "Sat", "type": "long",     "mi": 14, "det": "11 mi easy + 3 mi @ MP",            "feel": "Last meaningful long run. Finish wanting more." }
      ] },
    { "n": 12, "phase": "race-hou", "title": "Houston", "dates": "Jan 11 – 17", "total": 44.2, "note": "Your eighth Houston. Flat, fast, and you know every mile of it. Target 3:30 — go through halfway at 1:45 or a shade over, and do not let a good first 10K talk you into a 3:20 attempt. Boston is the race.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Loose." },
        { "day": "Tue", "type": "z2",       "mi": 5,  "det": "Easy + 6 × 100m strides",      "feel": "Activation, not training." },
        { "day": "Wed", "type": "z2",       "mi": 4,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "z2",       "mi": 3,  "det": "Easy + 4 × 100m strides",      "feel": "Last run with any snap in it." },
        { "day": "Sat", "type": "z2",       "mi": 2,  "det": "Shakeout — expo day",          "feel": "Off your feet the rest of the day." },
        { "day": "Sun", "type": "race",     "mi": 26.2,"det": "HOUSTON MARATHON · 3:30 target · 8:01/mi", "feel": "First 10K should feel annoyingly easy. Run the second half on the fuel of the first." }
      ] },
    { "n": 13, "phase": "recovery", "title": "Nothing", "dates": "Jan 18 – 24", "total": 20, "note": "The week that decides whether Boston happens. No reps, no tempo, no strides, no Strava segments. A marathon leaves damage that feels healed ten days before it is.",
      "s": [
        { "day": "Mon", "type": "rest",     "mi": 0,  "det": "Complete rest — walk if you want", "feel": "Nothing." },
        { "day": "Tue", "type": "z1",       "mi": 4,  "det": "Very easy shuffle",                 "feel": "Slower than Z1. Stop if anything sharpens." },
        { "day": "Wed", "type": "z1",       "mi": 4,  "det": "Very easy",                         "feel": "Easy." },
        { "day": "Thu", "type": "z1",       "mi": 4,  "det": "Very easy",                         "feel": "Easy." },
        { "day": "Fri", "type": "z1",       "mi": 2,  "det": "Very easy",                         "feel": "Optional." },
        { "day": "Sat", "type": "long",     "mi": 6,  "det": "Easy — not a long run",        "feel": "Six miles is the ceiling, not the target." }
      ] },
    { "n": 14, "phase": "recovery", "title": "Switching back on", "dates": "Jan 25 – 31", "total": 28, "note": "Strides return, nothing else does. If anything still complains — Achilles, calf, hip — repeat week 13. Boston is twelve weeks out and there is genuinely room.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "z2",       "mi": 6,  "det": "Easy + 6 × 100m strides",      "feel": "Strides only. No reps yet." },
        { "day": "Wed", "type": "z2",       "mi": 6,  "det": "Easy continuous",                   "feel": "Z2 returning." },
        { "day": "Thu", "type": "z2",       "mi": 4,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Sat", "type": "long",     "mi": 8,  "det": "Easy long run",                     "feel": "Should feel genuinely good. If it does not, take another easy week." }
      ] },
    { "n": 15, "phase": "stride", "title": "Stride phase", "dates": "Feb 1 – 7", "total": 38, "note": "Your framework's stride phase, now sitting on top of marathon fitness instead of base fitness. Intervals return and the reps will feel easier than they did in December — that is the Houston block paying out.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 7.5,"det": "1.5 mi w/u + 6 × 800m (400m jog) + 1.5 mi c/d", "feel": "Back to the staple. Expect 3:28–3:32 for the same effort." },
        { "day": "Wed", "type": "z2",       "mi": 8,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 6.5,"det": "2 mi easy + 2.5 mi @ tempo + 2 mi easy", "feel": "Rebuilding." },
        { "day": "Sat", "type": "long",     "mi": 12, "det": "Easy long run + 4 × 100m strides to finish", "feel": "All easy. The quality is on Tuesday now." }
      ] },
    { "n": 16, "phase": "stride", "title": "Lengthening", "dates": "Feb 8 – 14", "total": 43, "note": "Reps go to 1000m. Mileage back into the forties.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 8,  "det": "1.5 mi w/u + 5 × 1000m (400m jog) + 1.5 mi c/d", "feel": "4:20–4:25 — slightly quicker than December, same effort." },
        { "day": "Wed", "type": "z2",       "mi": 9,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7,  "det": "2 mi easy + 3 mi @ tempo + 2 mi easy", "feel": "Steady." },
        { "day": "Sat", "type": "long",     "mi": 14, "det": "Easy long run",                     "feel": "Easy. Start scouting a rolling route for March." }
      ] },
    { "n": 17, "phase": "stride", "title": "Stride peak", "dates": "Feb 15 – 21", "total": 47, "note": "Longest reps of the phase. This is the sharpest you will be all year in pure speed terms — from here the work turns marathon-specific again.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 8.5,"det": "1.5 mi w/u + 4 × 1200m (400m jog) + 1.5 mi c/d", "feel": "5:10–5:18. Rep four is the one that counts." },
        { "day": "Wed", "type": "z2",       "mi": 9,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7.5,"det": "2 mi easy + 3 mi @ tempo + 2.5 mi easy", "feel": "Controlled." },
        { "day": "Sat", "type": "long",     "mi": 17, "det": "Easy long run on rolling terrain",  "feel": "Introduce hills as terrain, not as a workout. Just stop avoiding them." }
      ] },
    { "n": 18, "phase": "stride", "title": "Down week", "dates": "Feb 22 – 28", "total": 33, "note": "Last down week before the Boston block. Set your Boston goal time this week — Houston is five weeks behind you and the stride phase has told us the rest.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 6.5,"det": "1.5 mi w/u + 5 × 800m (400m jog) + 1.5 mi c/d", "feel": "Trimmed." },
        { "day": "Wed", "type": "z2",       "mi": 6,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "z2",       "mi": 5.5,"det": "Easy + 4 × 100m strides — no tempo", "feel": "Rest the quality." },
        { "day": "Sat", "type": "long",     "mi": 11, "det": "Easy long run",                     "feel": "Short on purpose." }
      ] },
    { "n": 19, "phase": "cadence", "title": "Newton begins", "dates": "Mar 1 – 7", "total": 47, "note": "The cadence phase, and the start of Boston-specific work. Two things Houston could not teach you: climbing at mile 17, and quads that survive a net-downhill first half. Both start now.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 8,  "det": "1.5 mi w/u + 6 × 1000m (400m jog) + 1.5 mi c/d", "feel": "Focus on cadence — count 180+ on the reps and hold it on the jogs." },
        { "day": "Wed", "type": "z2",       "mi": 9,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7,  "det": "2 mi easy + 3 mi @ tempo on a hill loop + 2 mi easy", "feel": "Tempo effort on rolling ground. Pace will drop; effort should not." },
        { "day": "Sat", "type": "long",     "mi": 18, "det": "14 mi rolling + 4 mi @ MP on the hilliest section you can find", "feel": "Race pace uphill. This is the Newton rehearsal." }
      ] },
    { "n": 20, "phase": "cadence", "title": "Downhill damage", "dates": "Mar 8 – 14", "total": 51, "note": "Boston's first 16 miles drop 300 feet. Runners who have never trained downhill arrive at Newton with quads that no longer work. Two miles of controlled descent this week, and again next.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 8.5,"det": "1.5 mi w/u + 5 × 1200m (400m jog) + 1.5 mi c/d", "feel": "5:10–5:18. Cadence over stride length." },
        { "day": "Wed", "type": "z2",       "mi": 10, "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7.5,"det": "2 mi easy + 3 mi @ tempo + 2.5 mi easy", "feel": "Flat is fine today." },
        { "day": "Sat", "type": "long",     "mi": 20, "det": "13 mi easy incl. 2 mi controlled downhill + 5 mi @ MP",  "feel": "Quick feet on the descents, short stride, let gravity do it. Quads will be sore Sunday — that is the adaptation." }
      ] },
    { "n": 21, "phase": "cadence", "title": "Peak week", "dates": "Mar 15 – 21", "total": 55, "note": "The high point of the whole 25 weeks: 55 miles, 21-mile long run, six miles at race pace on rolling terrain. Both your ceilings, hit once, on purpose. Everything after this is subtraction.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 6,  "det": "Recovery",                          "feel": "You will need every mile of this to be slow." },
        { "day": "Tue", "type": "interval", "mi": 9,  "det": "1.5 mi w/u + 4 × 1600m (600m jog) + 1.5 mi c/d", "feel": "7:00–7:10 per rep. The hardest Tuesday of the plan." },
        { "day": "Wed", "type": "z2",       "mi": 10, "det": "Easy continuous",                   "feel": "Strictly Z2. Saturday matters more." },
        { "day": "Thu", "type": "tempo",    "mi": 9,  "det": "3 mi easy + 3 mi @ tempo + 3 mi easy", "feel": "Longest Thursday of the plan." },
        { "day": "Sat", "type": "long",     "mi": 21, "det": "15 mi rolling incl. 2 mi downhill + 6 mi @ MP",     "feel": "Full dress rehearsal: kit, shoes, breakfast, gels, start time. Your longest run of the year." }
      ] },
    { "n": 22, "phase": "cadence", "title": "Down week", "dates": "Mar 22 – 28", "total": 36, "note": "Hard cut after the peak. The adaptation from weeks 19 to 21 happens here, not during them.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 7,  "det": "1.5 mi w/u + 5 × 800m (400m jog) + 1.5 mi c/d", "feel": "Short, keep the snap." },
        { "day": "Wed", "type": "z2",       "mi": 7,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "z2",       "mi": 5,  "det": "Easy + 4 × 100m strides — no tempo", "feel": "Rest it." },
        { "day": "Sat", "type": "long",     "mi": 13, "det": "Easy long run",                     "feel": "Comfortable. Resist adding." }
      ] },
    { "n": 23, "phase": "taper", "title": "Taper · week 1", "dates": "Mar 29 – Apr 4", "total": 44, "note": "Three weeks of taper rather than your framework's four — Houston and its recovery already took one. Volume comes down, race pace stays in.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 5,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 8,  "det": "1.5 mi w/u + 4 × 1000m @ MP–tempo (400m jog) + 1.5 mi c/d", "feel": "Rhythm, not effort." },
        { "day": "Wed", "type": "z2",       "mi": 8,  "det": "Easy continuous",                   "feel": "Z2." },
        { "day": "Thu", "type": "tempo",    "mi": 7,  "det": "2 mi easy + 3 mi @ tempo + 2 mi easy", "feel": "Last real tempo." },
        { "day": "Sat", "type": "long",     "mi": 16, "det": "12 mi rolling + 4 mi @ MP",         "feel": "Final long run with pace in it. Should feel controlled, almost easy." }
      ] },
    { "n": 24, "phase": "taper", "title": "Taper · week 2", "dates": "Apr 5 – 11", "total": 32, "note": "Volume down a third again. You will feel sluggish mid-week and sharp by Saturday. Both are normal and neither means anything.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Easy." },
        { "day": "Tue", "type": "interval", "mi": 6.5,"det": "1.5 mi w/u + 4 × 800m @ MP (400m jog) + 1.5 mi c/d", "feel": "At race pace. Memorising the rhythm." },
        { "day": "Wed", "type": "z2",       "mi": 6,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "tempo",    "mi": 5.5,"det": "2 mi easy + 1.5 mi @ MP + 2 mi easy", "feel": "Short." },
        { "day": "Sat", "type": "long",     "mi": 10, "det": "8 mi easy + 2 mi @ MP",             "feel": "Last double-digit run. Finish fresh." }
      ] },
    { "n": 25, "phase": "taper", "title": "Boston", "dates": "Apr 12 – 19", "total": 44.2, "note": "An eight-day week, because Patriots' Day is a Monday. Sunday is already your rest day, so it becomes travel and feet-up day. Downhill to mile 16, Newton from 16 to 21, Heartbreak at 20.5, then four miles that are flatter than they feel. Twenty-five weeks and a thousand miles for this one.",
      "s": [
        { "day": "Mon", "type": "z1",       "mi": 4,  "det": "Recovery",                          "feel": "Loose." },
        { "day": "Tue", "type": "z2",       "mi": 5,  "det": "Easy + 6 × 100m strides",      "feel": "Activation." },
        { "day": "Wed", "type": "z2",       "mi": 4,  "det": "Easy continuous",                   "feel": "Easy." },
        { "day": "Thu", "type": "z2",       "mi": 3,  "det": "Easy + 4 × 100m strides",      "feel": "Last run with snap." },
        { "day": "Sat", "type": "z2",       "mi": 2,  "det": "Shakeout · expo",              "feel": "Off your feet afterwards." },
        { "day": "Sun", "type": "rest",     "mi": 0,  "det": "Rest · travel to Hopkinton",   "feel": "Nothing. Eat, hydrate, sleep." },
        { "day": "Mon", "type": "race",     "mi": 26.2,"det": "BOSTON MARATHON · Patriots' Day", "feel": "Hold back on the descent to mile 16 — that is the whole race. Newton is survivable on fresh quads and brutal on spent ones." }
      ] }
  ]
};
