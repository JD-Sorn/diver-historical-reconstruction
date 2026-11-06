# DIVER.BAS Reconstruction  -  TODO
# Open items only. Delete when done. One line per item.
# Cross-references: TESTING_PLAN.md (T/U numbers), LOG.md, SCREEN_SPECS.md
---
# Cleared of completed/closed entries 22 July 2026 (HK)  -  full history for everything removed here lives in LOG.md (dated entries) and TESTING_PLAN.md (per-T/U coverage detail). Nothing was deleted without confirming it's captured in one or both first.
#
---
# SCHEDULER STATUS, 11 August 2026: PASS / FREEZE. (Still in force, 16 Aug.)
# Following accelerated (WD10-21, WD40) and REAL-mode (WD16, deeper/decompression) regression runs, the scheduler is considered proven.
# DO NOT alter scheduler, PA, ES, event-boundary, predictive-prompt, activity-creation, or movement/clamp logic without NEW behavioural evidence from the BASIC/source. Held through an extensive activity-transition/recurrence testing phase (16 August) without needing a single exception.
#
# CURRENT BASELINE (updated 16 August 2026):
# DiverSim_v13_READY_presentation1.jsx  -  the current MAIN baseline. (SUPERSEDES the whole v12_READY_clean05-clean14 lineage and plain v13_READY  -  all now stale references.) Built on DiverSim_v13_READY.jsx (promoted from the confirmed DEF-024 fix5 lineage) plus an accepted Compucolor-style corner/join presentation refinement (small raster- style corner reinforcement for ASCEND↔DECOMPRESS and ASCEND↔REST transitions, matching CCEMU's solid right-angle union  -  presentation only, no scheduler/timing/activity/coordinate changes). Post-fold regression PASS: WD10 shallow ordinary dive; WD40/BT20 full decompression dive; staged WORK within WD40/BT20; repeated ASCEND at a decompression stop then DECOMPRESS. No regression in scheduler, staged WORK, decompression progression, REST termination, or DEF-024.
#
# DiverSim_v12_READY.jsx remains the SEPARATE, frozen forensic baseline retaining diagnostic plumbing  -  still a sibling, not superseded by any of the above; use it if the diagnostic trail is needed.
#
# NAMING COLLISION WARNING: the REJECTED diagnostic candidate from 11 August (React-state handoff-record capture, caused a DESCEND-boundary/NA=0 artefact, discarded) was informally called "v12" in that session's notes. UNRELATED to the legitimate v12/v13 lineage.
# Always check the FULL filename, not just the version number.
#
# Resolved and incorporated (see LOG.md for full per-fix detail across 08-16 August - too long to repeat here): DEF-003/004 (scheduler), DEF-005/007/009/017 (draw-order/z-order/positioning cluster), T44, DEF-002/010 (DM/MEMORY display), T14a/T14d, U04, CAPS input, DEF-018 (title removed - surviving BASIC never shows it), DEF-019 (Tn::: persistence), DEF-020 (WD41/BT21 SVG join gaps, accepted cosmetic), DEF-021 (cross-AL workDots false join), DEF-022 (operator WORK→WORK double-prompt + gap), DEF-023 (WORK graphics committed before OUT OF RANGE halt), DEF-024 (zero-distance ASCEND gap before DECOMPRESS).
# One proposed candidate (`..._U25_air3magenta.jsx`) was explicitly REJECTED - do not let it enter the lineage.
#
# PHASE CLOSURE, 16 August 2026: the activity-transition/recurrence investigation (DEF-021 through DEF-024, plus a battery of faithful/historical-behaviour confirmations  -  see DESIGN_NOTES.md and REGRESSION_TESTS.md RT-76 through RT-83) is CLOSED. The deferred Compucolor-style corner/join presentation refinement was also picked up and CLOSED within the same session (see baseline description above) - do not re-add it as a TODO item.
#
# No new unresolved reconstruction issue is known as of 16 August 2026.
# Next phase: further presentation/refinement work as it arises, plus the still-open register-audit backfilling noted below (Tier sections).
#
# MILESTONE, 17 August 2026: DiverSim_v13_READY_final12_fulltrace.jsx - consolidated the completed source-comment audit. Every surviving BASIC source line now has an explicit, visible disposition in the JSX - direct implementation citation, grouped/range citation, or an explicit historical/no-runtime-equivalent note. 575/575 traceability.
# This is a core provenance property of the reconstruction, not merely an intermediate build  -  treat it as a project milestone in its own right even though it has since been superseded by final13 (below).
# No scheduler or dive-logic changes were intended during this sweep.
#
# CURRENT TEST CANDIDATE, 17 August 2026 (NOT YET the confirmed baseline): DiverSim_v13_READY_final13_regressionfix1.jsx. final12's own final-regression found two fidelity defects (DEF-025: initial [1278] WORKING DEPTH bell inaudible - AudioContext suspended, not resumed before first sound; DEF-026: WORK display graphics committed before GOSUB 6100's [6181] OUT OF RANGE check, not rolled back - same class of bug as DEF-023, different call site). Both fixes implemented in final13, NEITHER YET REGRESSION-CONFIRMED. Two targeted tests required before any broader regression resumes: (1) exactly one audible bell at the initial WORKING DEPTH prompt, one per invalid WD, none extra on a valid WD; (2) WD40/BT20 → first DECOMPRESS suggestion → WORK/BT55 must show OUT OF RANGE with no new coloured WORK bars appearing first. Do NOT treat final13 as the baseline until both pass. No intended change in final13 to: predictive scheduler; PA/AL/ES behaviour; decompression logic; activity-transition rules; historical abnormal-transition behaviour; 575/575 BASIC source traceability.
#
# The 11-August-rejected diagnostic build (see naming collision warning above) is unrelated to this baseline and remains discarded - do not treat it as an ancestor of anything. See LOG.md 11-17 August 2026.
---

## COORDINATE SYSTEM

## SCREEN COMPONENTS
- **Two targeted tests pending on `final13_regressionfix1` (17 August 2026)  -  do not begin broader
       regression until both pass.** (1) DEF-025: fresh start should produce exactly one audible bell at
       the initial WORKING DEPTH prompt; invalid WD values should still each produce one bell; a valid WD
       should proceed to TIME MODE without an extra bell. (2) DEF-026: WD40/BT20 → first DECOMPRESS
       suggestion → WORK/BT55 must show OUT OF RANGE with no new coloured WORK bars appearing first. See
       DEFECT_REGISTER.md DEF-025, DEF-026.
- Draw-order/position-handoff sweep  -  **CLOSED, 15 August 2026.** ASCEND→DECOMPRESS (DEF-017),
       DECOMPRESS→ASCEND (DEF-007), ASCEND-over-DT-bars z-order (DEF-005), DESCEND's own positioning
       (DEF-009), the DESCEND MP=MQ equality case (T54), and ASCEND→REST (tested WD16/BOTTOM TIME 10/
       ACCELERATED  -  surface arrival handed off directly into REST with no gap, overlap, backward step, or
       duplicated stroke) are all now RESOLVED/PASS. Sweep complete, nothing remaining. See LOG.md 15 Aug.
- T05: **SUPERSEDED, 15 August 2026, by DEF-018.** This item's "move title to bottom of screen" compromise
       assumed the title would be displayed somewhere; DEF-018's investigation established the surviving
       BASIC never actually shows "DIVER SIMULATION MODEL." at all (Graphic Plot Mode is never exited
       before the title code runs)  -  so JSX should not display the title in any position, not just a
       different one. This T05 placement task is therefore moot; the live action item is DEF-018 (remove
       the title from JSX), not repositioning it. TESTING_PLAN.md T05.
- T18: descent-profile rendering  -  **REWRITTEN 13 August 2026, previous framing stale.** The old
       smooth-line-vs-block-staircase comparison predates DEF-009's resolution, which settled DESCEND's
       actual paint coordinate (raw BASIC `LQ`, not the old tick-count/`+1` approximation)  -  the rendering
       *approach* is no longer in question, only whether any residual visual-quality question remains once
       broader graphics polish work resumes. U14 (its former blocker) closed 15 August 2026  -  plot-Y
       wraparound confirmed via full-program CCEMU dives, no standalone coordinate-formula test needed.
       GOSUB 6300 Branch 1. TESTING_PLAN.md T18.
- T18 (auto-run): DiverSim.jsx's 400ms/tick auto-run interval is a placeholder, not derived from hardware
       timing  -  needs a proper rate once REAL/ACCELERATED pacing is understood.

## DM BOX
- HOUSEKEEPING: two stale comments (T14c colour-verification note; DiverSim.jsx header/line 711 tick-
       stepper description) still to fix opportunistically next time either file is touched for other
       reasons  -  not urgent enough for its own T/U-number. See LOG.md 05 July 2026.
- RAISED BY JOHN, testing observation: RED DM bars build from the top  -  "so 5 then 5 and 4 then 5,4 and 3,
       then 5,4,3 and 2 etc"  -  ahead of line 7240. Not yet traced against source; needs correlating to the
       actual GOSUB/routine responsible before it can be scoped as a T/U item.
## USER INPUT
- FLAGGED, NOT YET CHECKED (from T35's resolution, 28 July 2026): whether any OTHER STOP-equivalent branch
       elsewhere in the source has the same gap GOSUB 6100's OUT OF RANGE had  -  a display flag set but
       execution continuing anyway within the same tick, rather than actually halting. Only GOSUB 6100's is
       confirmed fixed; not audited elsewhere. GOSUB 6750 has its own separate OUT OF RANGE STOP at source
       line 6763 (already the template case cited in STYLE_GUIDE.md/COMMENTS_TO_AMEND.md)  -  worth checking
       first, being the other known HALT site, though not yet confirmed to have the same gap.
- FLAGGED, NOT YET CHECKED (from GOSUB 6250's Confirmation, 28 July 2026): whether GOSUB 6850/6800's own
       call sites have the MIRROR-IMAGE problem to the one just fixed for GOSUB 6250  -  i.e. whether they
       wipe row-3 (IDs 13-18) unnecessarily when writing row-2, the same class of bug fixed twice already
       this session, just in the other direction. Not checked  -  flagged for whenever those are next touched.

## UNRESOLVED

(U01, U04, U08, U09, U11, U12, U14, U20, U21, U22, U23, U24, U25, U29 all CLOSED/SUPERSEDED as of the 15
August 2026 U-item closure sweep  -  see LOG.md for the full per-item reasoning. U03 is the one exception:
investigation complete, but it converted into an OPEN action item  -  see DEFECT_REGISTER.md DEF-018 (JSX
displays a title the surviving BASIC never actually shows; must be removed). Nothing remains open in this
section.)

## DIAGNOSTIC / TOOLING INTEGRITY (28 July 2026, John)

- T56 (working number, pending assignment): audit what the global error handler may have silently caught
       and swallowed. Found via a diagnostic bug (SB's `adBlockTraceFrozenRef`/`setAdBlockTraceLog` were
       used but never declared, and no render code displayed the panel  -  this threw a ReferenceError on
       EVERY tick, for as long as the diagnostic existed, with zero visible sign of it, caught silently by
       the existing global error handler). The diagnostic bug itself is SB's to finish and confirm fixed  - 
       NOT what this item tracks. This item is the broader question that finding raises: if the error
       handler can absorb a persistent, every-tick failure completely invisibly, what ELSE might currently
       be failing the same way, unnoticed, because nothing has gone looking. ACTION: check what the handler
       has actually caught recently (if it logs/records anything), and consider whether it should surface
       errors more loudly rather than absorbing them silently, at least while controlled verification mode
       is ongoing. Separate concern from any specific defect  -  this is about the diagnostic/tooling layer's
       own reliability, not a GOSUB or rendering bug.

## PARAMETER-SPACE / BOUNDARY COVERAGE (28 July 2026, John)

Context: DEF-003 (barCol) and DEF-004 (DESCEND one-tick-early) both turned out to be "only ever validated
against WD40" bugs  -  a piece built and tested against one reference profile, quietly assumed general.
Systematic sweep of every genuine continuous-value boundary in DIVER.bas, done 28 July 2026 (HK), to find
the rest before they're found the hard way. Most of the source's ~127 IF-statements are trivial (leading-
zero suppression, fixed ID-range dispatch, activity-type switches already well-covered elsewhere)  -  left
out below. These are the ones where a real number crosses a threshold and changes which code path runs.

### Tier 1  -  foundational, most other tests implicitly depend on these being right

- T47 (working number, pending assignment): `TK` mode boundary  -  REAL mode away from WD40. **Substantially
       closed 11 August 2026**  -  REAL WD16/BT10 (full DESCEND→WORK→ASCEND→REST→END, PASS) and a REAL
       deeper/decompression profile (PASS, including multi-stop DECOMPRESS and NO→bottom-time replan) both
       confirmed. See REGRESSION_TESTS.md RT-43/RT-44. Residual: not every WD has been run in REAL mode,
       just WD16 and one deeper profile  -  treat as substantially, not exhaustively, closed.

### Tier 2  -  real regime boundaries, narrower blast radius

(T49, T51, and the T25 GOSUB 8000 boundary detail were all RESOLVED/PASS 14 August 2026  -  see LOG.md. Tier
2 has no open items as of this cleanup.)

### Tier 3  -  narrower, but flagged rather than assumed fine

(T52 and T53 were both RESOLVED/CLOSED 14 August 2026  -  see LOG.md. T52's source `*` display branch [6939]
appears unreachable in normal execution, confirmed independently in both JSX and CCEMU; T53's GOSUB 6700
redraw-skip optimisation is visually equivalent whether implemented or not, confirmed by direct observation.
T54 RESOLVED/PASS 15 August 2026  -  WD15.25/BT1/ACCELERATED deliberately exercised the DESCEND `MP=MQ`
equality case; final DESCEND movement not suppressed, profile reached intended depth before WORK. A very
small DESCEND→WORK visual discontinuity remains but is not a behavioural failure  -  consistent with minor
rendering/raster handoff effects, not the tested equality logic. Combined with DEF-017's ASCEND `MP=MQ`
evidence and existing same-column `LQ=LM` coverage, Tier 3 has no open items.)

### Register audit  -  rows that read broader than their actual evidence

Found while auditing REGRESSION_TESTS.md against this same sweep (28 July 2026, HK). Not new bugs  -  flags
that some "Confirmed" rows are narrower than they sound, mostly because they share one foundational profile
(WD40/BT22/ACCELERATED) rather than being independent trials. RT-32 (DEF-003, three profiles spanning two
XS regimes) is the model to match going forward.

- RT-24/RT-27/RT-28 (the full-cycle milestone) has ONLY ever run at WD40  -  says nothing about regimes 1/2.
- RT-12 reads as "two profiles hand-verified" but both are WD40 (different bottom times only, same depth)
   -  the DT-bracket-selection logic has never been tested at any other depth.
- RT-13/RT-14 each validate one GOSUB 6850 branch on one profile  -  no profile has confirmed the branch
  SELECTOR itself is correct, only that each branch's output looks right once already selected.
ACTION: as T51's WD30 profile and other second-depth runs accumulate, use them to backfill a second,
genuinely different-depth profile against RT-12/13/14/24/27/28, rather than treating this as separate work.


- Full audit of DiverSim.jsx/DiverSim2.jsx comments against the Historical-first commenting convention
  (STYLE_GUIDE.md, 10 July 2026). Applied going forward and opportunistically as code is touched anyway  - 
  deliberately NOT retrofitted now. Do this pass last, once other work is done.
- FUTURE, NOT YET ACTIONED (John, 28 July 2026): strip every comment from DiverSim.jsx that is NOT a
  BASIC-translation-plus-JSX-difference comment  -  including cross-references, test rationale, and any
  history-explaining notes that predate STYLE_GUIDE.md's comment-scope clarification. The finished JSX is
  meant to be the clean product; process/challenge narrative lives in LOG.md and the other tracking docs,
  destined for a separate narrative account, not the source. Do not start proactively  -  wait for John's
  explicit go-ahead. Logically follows the audit item above (settle the convention first, then strip
  everything that isn't it).
- U07/U10 reconciliation: PLOT 30's argument value 16 specifically has conflicting readings on file  - 
  "background colour (black)" in three places vs "large characters toggle" in CoordinateSystem.md. Deferred
  (10 July 2026, per John) rather than chased now  -  DM box renders correctly in practice, so this is a
  historical curiosity, not a live blocker. See LOG.md 05 July 2026 for full history.

## ZENODO
- Deposit canonical DIVER.BAS source with provenance statement.
- FA1/HA1: note self-hosting of Bedstead fonts (src/assets/fonts/)  -  removes CDN dependency,
  supports long-term archival stability of the reconstruction.
- Deposit photograph set with metadata.
- Deposit reconstruction with methodology note.
- Consider a standalone note on tangential findings from the 8001 manual proof-read (e.g. waffle/
  tofu fallback glyph, Reverse Field flag dual-purpose as Plot Mode XOR, double-height same-code
  odd/even-line rendering)  -  not needed for DiverSim.jsx but may be the only surviving record of
  these hardware details. Decide after manual proof-read is complete.

## PRINT/output audit (started 11 August 2026, SB)

Ongoing process, not a single fix. Distinguishes JSX display output into four
categories: (1) source-derived BASIC output which must be reproduced faithfully
(subject to DEF-016's numeric-formatting rule); (2) diagnostic/debug output
belonging only to the reconstruction, not authentic to source; (3) formatting
artefacts caused by JavaScript floating point (DEF-016's territory); (4)
transient screen material whose exact purpose is not yet understood  -  the
`T n::::`-type row (DEF-014's follow-on) turned out NOT to be transient at all:
CCEMU confirmed 14 August 2026 it's RETAINED Dive Monitor state between
prompts, rewritten only on the next user question  -  see DEFECT_REGISTER.md
DEF-002, now RESOLVED. **Explicit
caution: do not silently "improve" source messages merely because their
wording appears odd**  -  treat category-4 material as source behaviour to be
investigated archaeologically, not cleaned up speculatively, same principle as
the project's existing historical-first commenting convention (STYLE_GUIDE.md).

### Parked  -  explicitly deferred, not to derail current work

(CCEMU DM/NOSTOP sequence capture, WD40/BT20  -  RUN 14 August 2026, results folded into DEFECT_REGISTER.md
DEF-002. Nothing currently parked.)
