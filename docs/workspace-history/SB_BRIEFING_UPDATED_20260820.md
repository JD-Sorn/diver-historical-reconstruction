# DIVER.BAS Reconstruction  -  Briefing for a New SB Session
# Regenerated 20 August 2026 after HK outage.
# For history: LOG.md. For coverage: TESTING_PLAN.md / REGRESSION_TESTS.md.
---

## What this project is

Historically faithful React/JSX reconstruction of the surviving 1978/79
DIVER.BAS diving simulation. Design/project: Dagfinn Aksnes. Original BASIC
implementation: Dr George Mallen. Reconstruction: John Dunlop. Read
STYLE_GUIDE.md before changing source.

Evidence hierarchy:
1. observed canonical BASIC execution under CCEMU;
2. corrected canonical BASIC source;
3. surviving manuscript/photos;
4. hardware manuals;
5. JSX.

Do not modernise authentic odd behaviour.

## Scheduler status  -  PASS / FREEZE

Scheduler/activity-transition work is closed and frozen. Predictive prompting,
IK behaviour, PA/AL/ES, event boundaries, queued activities, movement/clamp
ordering, staged WORK and decompression sequencing are all proven across the
established regression set. Do not alter them without new BASIC/CCEMU evidence.

## Current files

**Confirmed behavioural/display baseline:**
`DiverSim_v13_READY_final24_display_fidelity_BASE.jsx`

Full regression PASS. SHA-256:
`247d0d1c726e7de8da48313ebb1c8697c58c3e5be80ab7d492a1ea473a2e3912`

**Current test candidate:**
`DiverSim_v13_READY_final24_latched_bell_candidate.jsx`

Derived from final24. Bell is latched: CHR$(7) starts the warning tone;
completing the corresponding INPUT with RETURN or program END stops it.
John has directly confirmed the stop-on-ENTER behaviour. 1150 Hz is empirical;
the hardware manual gives no pitch. Browser autoplay policy may suppress the
first pre-gesture sound.

`DiverSim_v12_READY.jsx` remains the separate frozen forensic baseline with
diagnostic plumbing. Never trust a version number without the full filename.

## Display-fidelity model

final24 serialises visible BASIC-equivalent screen writes in source order.
Accepted empirical cadences:
- ordinary DM/text writes: 35 ms;
- Air/Depth indicator block writes: 10 ms;
- coloured-band block writes: 18 ms.

A timing barrier exists only when actual display work occurs. Air honours
`LA=VA`; depth honours `AD=AY`; bands reveal top-to-down, left-to-right.
MEMORY heading/final gauges calibrated. WD16/BT75 top-of-bars oddity is
canonical and must remain.

## Comment/source provenance

575/575 BASIC-line traceability is a permanent milestone.

`COMMENTS_TO_AMEND.md` is now the single authoritative comment-change register.
Sequential review checkpoint: BASIC line 1273. John raises comments naturally;
SB maintains the register. Comment-only source changes do not alter executable
behaviour.

Permanent source comments: BASIC meaning + JSX difference only, plus the
approved factual file header. No RT-/DEF-/T-number process-history comments.

## Critical recent PLOT correction

Read the whole PLOT statement as one serial terminal byte stream before
decomposing it.

- [1261] `6,38,8,2,14,15`: CCI 38; HOME; enter Graphic Plot Mode; X=14,Y=15.
- [1262]/[1264]: complete ESC sequence duplicated once.
- [1273] `2,250,0`: Graphic Plot Mode; X Bar Graph, X0 Value; X0=0.
- [1346] `6,38,2,246,34`: CCI 38; Graphic Plot Mode; Y Bar Graph, Y0 Value;
  Y0=34.

Do not call Code 2 itself “X Bar Graph”.

## Title [1265–1266]

The BASIC lines execute but the title/underline are not displayed as text in
normal CCEMU, consistent with the terminal still being in Graphic Plot Mode.
JSX visible title output is absent. Source strings/titleCells remain for
translation fidelity; their hidden timing participation is a deferred,
contained executable-code review candidate.

## Bell

Seven source CHR$(7) occurrences are mapped: [1278], handwritten [1279],
[1303], [3025], [5315], [5509], [5705]. Modern validation-only bells were
removed.

Hardware manual: nominal Code-7 tone, with handwritten note that it stays on
until BASIC reads END or INPUT. Current candidate follows that operational
behaviour. Exact pitch is not documented.

## Manuscript amendments

Keep handwritten changes distinct from printed BASIC:
- [1279] handwritten insertion;
- [1281] handwritten target 1278→1279;
- [1308] handwritten addition;
- [5560]/[5561] handwritten amendment/note.

Treat as a small post-print revision layer; chronology unknown.

## Open / deferred

- DEF-001 remains deferred pending clearer matched-tick photographs.
- Comment audit continues after BASIC 1273 when John resumes.
- Hidden titleCells timing participation: review at next executable update.
- Bell pitch may be revisited only if better historical evidence appears.
- Register-audit/boundary-coverage items remain as listed in TODO.md.
- Do not reopen scheduler or faithful historical abnormal sequences.

## Files to read

1. STYLE_GUIDE.md
2. canonical DIVER BASIC
3. exact current JSX filename
4. COMMENTS_TO_AMEND.md when working on comments
5. TODO.md
6. DEFECT_REGISTER.md
7. REGRESSION_TESTS.md
8. TESTING_PLAN.md
9. DESIGN_NOTES.md
10. LOG.md for chronology
