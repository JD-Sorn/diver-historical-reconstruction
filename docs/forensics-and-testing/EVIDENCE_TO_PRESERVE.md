# DIVER.BAS  -  Evidence to Preserve
# Compiled from a full pass through LOG.md, 05 July 2026.
# Purpose: LOG.md already assumes "full evidence in reference/ and tests/ folders" (see its header), but most entries only narrate what was found, without a stored file backing it up. This lists everything that should have a file behind it, what to call it, and where  -  split into "already named, just confirm it's actually saved" vs "not yet captured  -  you may need to rerun the test to get it."
---

## Already named in LOG.md  -  confirm these are actually saved where stated

These have an explicit path already written into LOG.md. Worth a quick
check that the files genuinely exist there, since a stated path isn't
proof of a saved file.

- `reference/emulator_screenshots/looptrace6_AG_VA13.png`
   -  ID=22 air gauge screenshot (1 dark/3 magenta/13 green/1 dark), from
  LOOPTRACE6.BAS. Referenced at LOG.md "ID=22 air gauge... confirmed."

- `tests/T18_ACCEL_6tick_trace.txt`
   -  Full console output, ACCELERATED mode (WD=40/DR=30/TK=0.25), six-tick
  trace. Confirms column-pairing pattern. Referenced at LOG.md "T18
  six-tick trace confirmed via browser console."

- `tests/T18_REAL_43tick_trace.txt`
   -  Full console output, REAL mode (WD=40/DR=30/TK=1/32), complete
  43-tick descent (AD=0→40.00). Confirms the 8-tick quantisation period.
  Referenced at LOG.md "UPGRADE: full 43-tick trace."

---

## Code (BASIC test scripts)  -  not yet given a stored location

- **LOOPTRACE3.BAS**  -  verified T22 (display loop gate/CK flag fix).
  Suggested: `reference/emulator_scripts/LOOPTRACE3.BAS`

- **LOOPTRACE4.BAS**  -  verified T23 (end-of-event handler post-DESCEND).
  Suggested: `reference/emulator_scripts/LOOPTRACE4.BAS`

- **LOOPTRACE5.BAS  -  TWO versions, both worth keeping, not just the final one:**
  - The **original** version (flag names `G7500$`, `G6800$`, `G6200$` etc.)
    that produced the lockstep bug  -  this is itself the primary evidence
    for U22 (the suspected 2-character truncation). Suggested:
    `reference/emulator_scripts/LOOPTRACE5_v1_collision.BAS`
  - The **corrected** version (flags renamed F1–F6) that confirmed U18.
    Suggested: `reference/emulator_scripts/LOOPTRACE5_v2_corrected.BAS`
  Keeping both matters here specifically because the *difference between
  them* is the evidence for U22, not just the final result.

- **LOOPTRACE6.BAS**  -  produced the ID=22 air gauge screenshot above.
  The screenshot is named; the script that generated it doesn't appear
  to be. Suggested: `reference/emulator_scripts/LOOPTRACE6.BAS`

- **DIVER.bas vs DIVER7450.BAS  -  provenance note (05 July 2026):** U26
  confirmed line 7240's `GOTO 7445` genuinely fails on CCEMU (not benign
  fall-through); `GOTO 7450` succeeds. Decision: **DIVER.bas is kept
  unmodified, error and all, as the authentic 1979 artefact.**
  **DIVER7450.BAS** is a separate corrected working copy (7445→7450 fix
  only) used for all testing from this point forward. Any result quoted
  against "DIVER7450.BAS" is running the fix; results against "DIVER.bas"
  retain the original defect. Keep this distinction visible in test
  results going forward  -  a future reader comparing two results needs to
  know which copy produced which, not just that a fix exists.
  Suggested: `reference/emulator_scripts/DIVER7450.BAS`, filed alongside
  the canonical DIVER.bas rather than replacing it.

- **DIVER_TRACE.bas** (the instrumented version used for the U25/U26
  session)  -  given the open question over whether U25/U26's anomalies
  are genuine or artefacts of this specific instrumentation (line-buffer
  overrun hypothesis), the exact instrumented source matters as evidence
  in its own right, not just its output. Suggested:
  `reference/emulator_scripts/DIVER_TRACE.bas`

- **The planned unmodified, uninstrumented DIVER.bas run** (U26's "NEXT
  TEST")  -  once run, save the exact copy used (should be byte-identical
  to the canonical DIVER.bas, which is worth confirming rather than
  assuming). Suggested: note in TODO.md/LOG.md which exact file/commit
  was run, rather than a new file, since it should just be DIVER.bas itself.

---

## Screenshots  -  not yet given a stored location

- **U25/U26 screenshot**  -  the DIVER_TRACE.bas run showing the six
  magenta lines and the `?US ERROR IN 7240` message. This is the single
  most important not-yet-filed piece of evidence, since both U25 and U26
  currently rest on a description of it rather than the image itself.
  Suggested: `reference/emulator_screenshots/U25_air_gauge_magenta.png`
  (as discussed earlier  -  anchored to U25 since the magenta blocks are
  the visually central content, cross-referenced from U26).

- **LOOPTRACE5.BAS run 1 (collision) screenshot**  -  showing G6800$/G6200$
  reading identically across all rows. Suggested:
  `reference/emulator_screenshots/looptrace5_v1_collision.png`

- **LOOPTRACE5.BAS run 2 (corrected) screenshot**  -  showing all five
  activities matching expected flags. May be superseded by the video
  below if the video captures the same thing more completely  -  your
  call on whether both are worth keeping or the video alone suffices.
  Suggested if kept: `reference/emulator_screenshots/looptrace5_v2_confirmed.png`

---

## Video  -  not yet given a stored location

- **LOOPTRACE5.BAS corrected-rerun video** (mentioned in your last
  message)  -  this is the primary confirming evidence for U18's closure.
  Suggested: `reference/emulator_videos/U18_looptrace5_confirmed.mp4`
  (anchored to U18 as discussed, since the video's substance is the
  closure itself, with U22 being what made the corrected version
  necessary rather than what the video shows).

---

## Photographs  -  flagging a gap, not a specific list

LOG.md references an original photograph or photographs constantly  - 
DM_X calibration ("screen width 19.8cm, DM left edge 16.4cm"), row-height
cross-check (~10.8mm), the two-photograph pixel calibration for T18's
depth ticks, the single NOSTOP photograph, the air-gauge photograph
showing "2 blue" vs BASIC's "3 magenta," and others  -  but **no entry
gives a stored file path for any of them**, unlike the emulator
screenshots. Either these already live somewhere outside what I can see
(a project folder not reflected in LOG.md's citations), or they've been
genuinely un-filed this whole time. Worth confirming which, since these
are the highest-value primary evidence in the whole project  -  everything
else is checked against them, not the other way around.

---

## Specific numeric values worth recording explicitly, not just narratively

Even where a screenshot/trace file is impractical or already covered
above, a few specific values are referenced repeatedly enough in
reasoning (not just as one-off results) that they're worth a durable,
citable home  -  e.g. a short table in DESIGN_NOTES.md or SCREEN_SPECS.md,
rather than only living in LOG.md prose:

- The confirmed depth-tick range, plotY=140 to plotY=40 (already in
  CoordinateSystem.md  -  just flagging it's exactly the value at stake in
  U14's proposed Y=140 wrap test, so it'll want to sit next to whatever
  that test produces).
- DM_X=396 and its photograph-ruler derivation (19.8cm / 16.4cm)  - 
  already in CoordinateSystem.md, but the photograph it was measured
  from isn't filed (see Photographs section above).
- LOOPTRACE5.BAS's confirmed DECOMPRESS flag pattern: `G7500=YES,
  G6800=YES, G6200=NO, 6751P=NO, 3025S=YES, 3406B=NO`  -  currently only in
  LOG.md prose; worth a line in TESTING_PLAN.md's U18 entry too if it
  isn't there already, since it's the actual pass/fail criterion.
