# DIVER.BAS Reconstruction  -  Briefing for a New SB Session
# Not append-only  -  this gets REGENERATED each time a new SB session starts, not grown. For full history, see LOG.md (chronological, permanent) and TESTING_PLAN.md (per-T/U coverage detail). This doc exists purely to get a fresh session oriented quickly, without reading either of those in full.
# Last regenerated: 15 August 2026, by HK.
---

## What this project is

Reconstructing DIVER.BAS  -  a diving-simulation BASIC program written by Dr
George Mallen during his degree course (1978/79) for Compucolor/Intecolor
8001-family hardware  -  as a modern React/JSX web app (DiverSim.jsx), as
historically faithfully as possible. Read STYLE_GUIDE.md before writing or
changing any code.

## SCHEDULER STATUS: PASS / FREEZE  -  read this first

**As of 11 August 2026, the scheduler is considered proven and frozen.**
Full accelerated (WD15-21, WD40) and REAL-mode (WD16, deeper/decompression)
regression, plus complete GOSUB 5900 edge coverage, all PASS. **Do not alter
scheduler, PA, ES, event-boundary, predictive-prompt, activity-creation, or
movement/clamp logic without NEW behavioural evidence from the BASIC/
source.** The project has been in graphics/display fidelity investigation
since then, and as of 15 August 2026 has no known unresolved reconstruction
issue.

## Current baseline: `DiverSim_v12_READY_clean05.jsx`

Tested WD16/BT10/ACCELERATED, PASS. This is one of two sibling files, NOT a
diagnostic-vs-clean supersession pair  -  pick the right one for the purpose:

- **`DiverSim_v12_READY_clean05.jsx`**  -  presentation lineage. Diagnostic
  scaffolding (visible diagnostics, passive event logging, several stateful
  diagnostic snapshots, predictive-prompt diagnostic capture, tick tracing,
  AD-block tracing) removed WITHOUT behavioural regression. Use this for
  presentation or further feature work.
- **`DiverSim_v12_READY.jsx`**  -  frozen forensic baseline, deliberately
  RETAINS the diagnostic plumbing for the record. Use this if you need the
  diagnostic trail.

**⚠ NAMING COLLISION  -  read before trusting anything about "v12":** an
UNRELATED, REJECTED diagnostic candidate from 11 August (added React state
for ASCEND→DECOMPRESS handoff capture, caused a DESCEND-boundary/NA=0
artefact, discarded) was informally called "v12" in that session's own
notes. This has nothing to do with today's legitimate `DiverSim_v12.jsx`
lineage  -  the shared informal version number is coincidence, not ancestry.
Always check the FULL filename, never just a version number.

**Documentation-lineage discipline, reinforced repeatedly:** DEF-015 (a
fully implemented GOSUB 8000 MEMORY silently lost between candidate
branches), the v12-naming-collision above, and the general pattern behind
DEF-003/DEF-004/DEF-009 ("only ever validated against one profile/candidate,
quietly assumed general") are all the same lesson. **Always confirm which
exact candidate file a claim is about before trusting it.**

## Governing principle

**Behavioural fidelity is defined by observed execution under CCEMU, not
merely by static reading of DIVER.BAS.** Where the listing is ambiguous,
instrumented CCEMU execution is the authority. Fidelity means matching the
surviving EXECUTABLE program, not inferred original intent  -  DEF-018 (below)
is the clearest recent example of this distinction actually mattering.

## Comment policy

Permanent comments exist for exactly two things: what a BASIC line did, and
how JSX achieves the same effect differently (Historical-first commenting,
STYLE_GUIDE.md). Nothing else. The current JSX contains numerous STALE
comments  -  comments are NOT a reliable audit authority; canonical BASIC plus
current executable JSX are the source of truth.

## Recently RESOLVED (11-15 August 2026)  -  large batch, summarised

**Scheduler/logic:**
- **DEF-011** (GOSUB 5900 staged WORK)  -  implemented, core + full edge
  coverage (RT-36/37/38) all PASS. Precise interaction: NO at a staged
  boundary re-enters BOTTOM TIME at [5509], does NOT command ASCEND
  directly.
- **DEF-012** (zero-duration staged-activity scheduler bug, found during
  DEF-011 testing)  -  fixed.
- **DEF-004** (DESCEND one-tick-early landing)  -  resolved by record
  reconciliation; formal regression had already covered it, the status line
  just hadn't caught up.
- **DEF-016** (BASIC PRINT numeric formatting  -  raw floats vs BASIC's
  rounded/formatted output)  -  fixed, general STYLE_GUIDE.md convention
  added.

**Graphics (all confirmed scheduler-untouched):**
- **DEF-017**  -  ASCEND target-tick raster coincidence (MP===MQ) misread as
  a flat segment, causing an ASCEND→DECOMPRESS start-step. Fixed.
- **DEF-007**  -  SVG raster seam at the DECOMPRESS-line/first-ASCEND-
  rectangle junction. Fixed.
- **DEF-005**  -  coloured DT bars had permanent z-priority over ASCEND.
  Fixed: bars render first, ASCEND paints after, matching BASIC's
  sequential PLOT order.
- **DEF-009**  -  DESCEND painted at `LQ+1` instead of raw `LQ`, masked at
  WD40 by coincidental alignment. Fixed.
- **T44**  -  DESCEND→WORK/WORK→ASCEND join: CCEMU proved these are
  genuinely connected lines in original execution; JSX seams were SVG/
  raster artefacts, NOT the same coordinate-offset mechanism as DEF-003
  (similar symptom, different cause  -  worth remembering these can differ).
- **T54 / ASCEND→REST handoff**  -  closed the entire draw-order/position-
  handoff sweep (started 28 July). Nothing remains open in that sweep.
- **DEF-018**  -  JSX was displaying the "DIVER SIMULATION MODEL." title;
  CCEMU proved the surviving BASIC never actually shows it (title code
  runs while still in Graphic Plot Mode). Title/underline removed from
  JSX; the diagnostic `PLOT 255` that proves the mechanism was intended is
  evidence only, NOT incorporated into the reconstruction.

**Display/DM content:**
- **DEF-002** (STOP10/STOP5 lifecycle)  -  full CCEMU DM lifecycle captured
  and reproduced: AIR OK → STOP10 → staged T10/T15/T20 (flashing numerics)
  → STOP 5 after the 10m stop → green ASCEND after the final stop →
  correct MEMORY. Seventeen screenshots preserved as evidence.
  **Correction:** the `T n::::` row is NOT transient  -  it's RETAINED DM
  state between prompts, rewritten only on the next question. The `T...`
  row becomes a LIVE COUNTDOWN during actual decompression (e.g. `T18:30`)
   -  don't mistake a snapshot for a fixed value.
- **DEF-010** (MEMORY heading)  -  photograph clarified the real geometry: a
  separate six-character-wide black strip, not a full-width strip. Fixed.
- **T14a/T14d**  -  DM text row vertical positioning, source-led mapping
  (rows 4/7/9). Fixed.
- **U04** (depth-trend indicator)  -  position only was wrong; fill/VA logic
  was already source-faithful. Moved up one block pitch. Fixed.
- Uppercase terminal input  -  normalised on entry. Fixed.
- **U25**  -  a proposed "fix" (`..._U25_air3magenta.jsx`) was REJECTED; the
  existing air-indicator rendering was already correct. Don't let this
  candidate back into the lineage.

**Full U-item closure sweep (15 August)**  -  14 of 15 tracked U-items
closed/superseded (U01, U04, U08, U09, U11, U12, U14, U20, U21, U22, U23,
U24, U25, U29). U03 was the one exception  -  see DEF-018 above. Notable
finding: **U11**  -  `PLOT 27,10` = vertical character advance, `PLOT 27,11`
= restore horizontal (NOT "scroll mode" as previously described; no
evidence it scrolls or repositions the cursor).

## Still open

- **DEF-001**  -  track shape vs 1979 photo mismatch  -  deferred, awaiting
  clearer matched-tick photos. The only item still genuinely open from the
  original defect list.
- Narrower boundary-coverage gaps in TODO.md's Register Audit section
  (RT-24/27/28/12/13/14  -  all validated on WD40 only, never independently
  confirmed at a second depth).
- Nothing else currently known  -  see TODO.md itself for the live list,
  which should be short and genuinely open-items-only as of 15 August
  (aggressively cleaned 13 August, cleaned again 15 August).

## Design notes worth knowing (DESIGN_NOTES.md, not action items)

- **Post-END READY display**  -  reproduce the BASIC interpreter's READY
  prompt/cursor visually after END; do NOT emulate interpreter
  functionality. The modern simulation restarts via browser refresh.
- **PLOT 27,10/27,11 duplication**  -  DIVER.BAS issues each command twice;
  a single instance is sufficient behaviourally. Why Dr Mallen doubled them
  is unknown  -  retained as historical characteristic, not a requirement.
- **GOSUB 5060**  -  defined, never called. Dead code, don't reconstruct.
- **DX never reset across a session** (U29)  -  genuine original quirk, not
  relevant to the modern simulation (ends at MEMORY, restarts on refresh).

## Files to read, in order

1. STYLE_GUIDE.md  -  translation conventions, always read first.
2. DIVER.bas / DIVER(5).bas (latest corrected canonical copy)  -  source of
   truth.
3. Current baseline JSX candidate  -  confirm the EXACT filename (see naming-
   collision warning above) before trusting any claim about it.
4. TODO.md  -  what's actually open right now; read the baseline/scheduler
   header at the top first. Recently and repeatedly cleaned to open-items-
   only  -  if something reads as already resolved, check DEFECT_REGISTER.md/
   LOG.md rather than assume TODO.md is stale again.
5. DEFECT_REGISTER.md  -  every open/closed defect, full lifecycle.
6. REGRESSION_TESTS.md  -  what must keep passing; RT-36 through RT-62 are
   the newest rows, all PASS.
7. TESTING_PLAN.md  -  coverage detail for anything TODO.md references.
8. DESIGN_NOTES.md  -  observed design characteristics of the original
   program  -  not action items, don't "fix" these.
9. CoordinateSystem.md, SCREEN_SPECS.md  -  hardware/rendering reference.
10. LOG.md  -  only when full history on something specific is needed.

## Working conventions

- HK (this doc's author) does not edit DiverSim.jsx  -  SB's exclusively.
- Status vocabulary: Confirmed / Implemented / Working Hypothesis /
  Observed Anomaly / Historical Variant / Deferred / Not Yet Investigated.
- Faithfully-reproduced behaviour that reads as confusing or incomplete on
  modern hardware does not get a UX fix or a "completion"  -  DEF-018 is the
  clearest example: the title mechanism was provably intended, and it still
  doesn't get added back, because the surviving executable doesn't run it.
- A profile/mode/candidate validated only in isolation is not validated in
  general  -  this project's history (DEF-003, DEF-004, DEF-009, DEF-015)
  shows that gap has produced real problems repeatedly. Always name the
  exact profile/candidate a claim applies to.
- A genuine quirk of the original program belongs in DESIGN_NOTES.md as an
  observation, not TODO.md as a task  -  don't fix faithfully-reproduced
  original behaviour, however odd it looks.
