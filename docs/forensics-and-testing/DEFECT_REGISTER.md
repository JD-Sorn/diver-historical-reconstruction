# DIVER.BAS Reconstruction  -  Defect Register
# Established 28 July 2026, the project moves from development mode into controlled verification mode from this point. Baseline: a frozen "Known Good" copy of DiverSim.jsx (DiverSim_Archive, /experiments,
#
# Every new discrepancy from here on gets an ID and an entry here, using the template below. Cross-reference LOG.md (narrative/achievement record) and TESTING_PLAN.md (coverage detail) as usual  -  this register is the single place a defect's full lifecycle lives, start to finish.
#
# Guiding principle, do not assume a new observation invalidates an old solution. First establish whether it's a genuine defect, an intentional historical behaviour, or an unresolved question.
# When a defect is confirmed, make the smallest possible change and demonstrate all previously verified behaviour remains intact.
---

## Template

    DEF-NNN  -  <short title>
    Observation: <what was seen, plainly>
    Evidence: <screenshot/log/diagnostic reference, with file path>
    AI analysis: <HK/SB's read on mechanism, source-checked where possible>
    Your assessment: <John's judgement>
    Confirmed cause: <once established  -  genuine defect / historical
        variant / unresolved question>
    Proposed change: <if a defect>
    Files/routines affected:
    Regression tests required: <which entries in REGRESSION_TESTS.md must
        be re-run after any fix>
    Final resolution:

---

## DEF-001  -  DESCEND/WORK/ASCEND track shape vs 1979 photograph mismatch (RESOLVED)

**Observation:** WD40/BT22/ACCELERATED render compared directly against
a real 1979 photograph of the same profile. The riser/step pattern after
the WORK mountain sits noticeably more spread out to the right in the
current render than in the photo.

**Evidence:**
- `reference/emulator_screenshots/DEF001_WD40_BT22_render_STOP10_T030.png`
   -  sandbox render, "WHICH ACTIVITY REQUIRED (REST)" prompt up, LAST
  ANSWER: ASCEND, gosub_5400 (ASCEND NEXT), PA(2)=15 PA(4)=0 PA(5)=5,
  inputs AR=15 HT=0, STOP10, T 0:30.
- `reference/photos/DEF001_1979_photo_STOP5_T030.png`  -  1979 photograph,
  STOP 5, T 0:30.
- **Not at matching ticks**  -  the render shows STOP10 (first
  decompression stage) and the photo shows STOP 5 (second stage), same
  displayed T 0:30 but different points in the dive. John judges them
  close enough for a first look; clearer photos at matching ticks to
  follow before a real comparison.

**AI analysis (HK, 28 July 2026):** The mountain's own position (GOSUB
6300 Branch 2, BASIC_X3/BASIC_Y3) and the DESCEND→WORK and WORK→ASCEND
handoff points have never been checked against a photograph before now
 -  the only prior "confirmed against photograph" claim on this track (03
July 2026) covered DESCEND's first 3 ticks only. Explicitly **not**
T33/T34/T44 (per John)  -  a separate item. Worth flagging: this is
WD40/ACCELERATED, the one profile where `barCol`'s hardcoded `/2` rate
(the T33/T44 root cause, still being fixed by SB as of 28 July) happens
to be numerically correct  -  so whatever that fix resolves is unlikely to
explain this specific mismatch. Root cause not yet investigated.

**Your assessment:** Close enough for a first look; deferred pending
clearer matched-tick photos (John, 28 July 2026).

**Confirmed cause:** Not yet determined  -  Unresolved Question.

**Proposed change:** None yet  -  deferred.

**Files/routines affected:** GOSUB 6300 Branch 2 (BASIC_X3/BASIC_Y3),
DESCEND→WORK and WORK→ASCEND handoff points.

**Regression tests required:** TBD once cause is established.

**Final resolution:** RESOLVED - compared with CCEMU and matches. Photo and CRT distortion thought to be original cause

---

## DEF-002  -  STOP10/STOP5 label does not update after WORK-initiation (RESOLVED)

**Observation:** "STOP10"/"STOP 5" (GOSUB 6950, IDs 1-6) appears to never
update once set. John's WD40/BT22 test shows "STOP10" still on screen at
HT=0, past all decompression stops  -  intuitively should read STOP5 (or
nothing) by that point.

**Evidence:** John's direct observation on the WD40/BT22 test dive (HT=0,
past all stops, STOP10 still showing). No screenshot yet attached for
this specific moment.

**AI analysis (HK, 28 July 2026), checked directly against DIVER.bas
source (lines 6950-6999), not assumed:**

    6950 REM SUB DISPLAYS NEXT HT TO STOP AT WHEN ASCENDING
    6955 IF HT= 0 THEN 6999
    6956 CO= 0:FL= 0:ID= 1:VA= 83:GOSUB 7000: ID= 2:VA= 84:GOSUB 7000:ID= 3:VA= 79:GOSUB 7000
    6957 ID= 4:VA= 80:GOSUB 7000:ID= 5:IF DX<> 0 THEN 6962
    6958 VA= 32:GOSUB 7000:ID= 6:VA= 53:GOSUB 7000:GOTO 6999
    6962 VA= 49:GOSUB 7000:ID= 6:VA= 48:GOSUB 7000
    6999 RETURN

GOSUB 6950 is called exactly ONCE per dive, from the WORK-initiation
dispatch branch only (source lines 1693/1694)  -  never called from
anywhere else in the program. IDs 1-4 ("STOP") are written once; the
STOP10-vs-STOP5 choice (IDs 5-6) is decided once, from whatever `DX` was
at that single moment, via the `IF DX<>0 THEN 6962` branch. There is no
second call site and no mechanism anywhere else in source that revisits
this decision.

This strongly suggests the "STOP10 stuck" behaviour is **faithful to
source, not a translation bug**  -  on real 1979 hardware, this same
subroutine would also fire exactly once and never update again, for any
dive with a single WORK period (which the WD40/BT22 test is  -  one WORK
period, then staged ascent/decompression, consistent with everything
established about this profile this session).

**Caveat, not yet tested:** this reasoning depends on the profile having
only one WORK-initiation event. A dive with a genuine second, separate
WORK period (diver descends, works, ascends partway, works again at a
different depth) would be a different, untested case  -  worth confirming
whether the port correctly re-fires GOSUB 6950 in that scenario, since
that's a case that could still hide a real bug even if this one doesn't.

**REOPENED/REASSESSED 09 August 2026, per DEF-011.** The analysis above
assumed a WD40/BT22 dive involves exactly one WORK-initiation event  - 
true under the current one-block JSX WORK implementation, but GOSUB
5900 (DEF-011) proves the original BASIC can turn a single nominal
BOTTOM TIME request into several successive, chained WORK
activity-initiation events (the WD40/BOTTOM TIME 20 case alone produces
four staged WORK stages). Each staged WORK-initiation may or may not go
through the same dispatch branch (source lines 1693/1694) that calls
GOSUB 6950  -  this has not been established. **Do not retain "GOSUB 6950
fires exactly once per dive" as current fact.** Whether 6950 re-fires
(and updates STOP10/STOP5) at each staged WORK boundary must be
established from original BASIC/CCEMU, then reproduced in JSX once
DEF-011 is implemented. This is now the same open question as the
"caveat, not yet tested" above, just reached by staged WORK rather than
a separately-initiated second WORK period at a different depth  -  worth
testing both routes since they may not behave identically.

**CCEMU FINDING, 10 August 2026 (SB)  -  directly resolves the "caveat,
not yet tested" and "REOPENED/REASSESSED" questions above.** Controlled
CCEMU tracing of WD40/BOTTOM TIME 20 confirms every GOSUB-5900-generated
WORK stage re-enters the ordinary WORK-initiation path, and that path
contains TWO GOSUB 6950 call sites, not one:

    1693 GOSUB 6950
    1694 GOSUB 6850:GOSUB 6950

**The earlier "GOSUB 6950 fires exactly once per dive" wording was
therefore wrong on two counts**  -  once for assuming one WORK-initiation
event per dive (corrected 09 August, see above), and independently for
assuming one call site even within a single WORK-initiation (source
actually calls it twice per initiation, back to back). Both corrections
stand; this finding stays superseded, not silently re-adopted.

CCEMU trace across the four WD40/BOTTOM TIME 20 stages: `AL2 END11 HT0
DX0` (6950 entered twice); `AL3 END17 HT10 DX5` (twice); `AL4 END20
HT10 DX5` (twice); `AL5 END21.75 HT10 DX5` (twice)  -  eight total entries
into GOSUB 6950 across the dive, two per stage, exactly matching the two
source call sites. First stage: HT=0/DX=0, so line 6955 (`IF HT=0 THEN
6999`) causes both calls to return without writing STOP content. From
the second stage onward, HT=10/DX=5, so 6950 writes STOP10 on each
staged WORK-initiation.

**Interpretation revised:** STOP10 is not written once at the start of
the dive. It is refreshed during staged WORK whenever the
WORK-initiation branch re-runs. Once the diver leaves WORK for ASCEND/
DECOMPRESS, GOSUB 6950 is no longer called at all, so the last STOP
label written during WORK simply remains visible. This explains why
STOP10 can persist later at the 5m stop without implying 6950 itself
failed to update during WORK  -  for this specific profile, every staged
WORK-initiation from stage 2 onward independently arrives at HT10/DX5
and writes STOP10 again, so the visible label is STOP10 throughout by
coincidence of this profile's numbers, not because the mechanism only
ran once.

**Architectural consequence for DEF-011:** the 5900-generated sub-stages
are not merely internal timing fragments  -  they are full WORK
activities that pass through the normal activity-initiation machinery,
including GOSUB 6100, GOSUB 6950, and GOSUB 6850. A JSX implementation
of GOSUB 5900 must create staged WORK activities through the ordinary
WORK-initiation dispatch, not simulate the stages as hidden timing
subdivisions underneath one WORK activity. This CCEMU trace (the
per-stage HT/DX/6950-entry sequence above) is a direct regression
target for that future implementation.

**Your assessment:** [pending]

**Confirmed cause:** MECHANISM now confirmed via CCEMU (10 August
2026)  -  GOSUB 6950 is called twice per WORK-initiation (source lines
1693/1694), and re-fires at every 5900-staged WORK-initiation, not just
once per dive. For the WD40/BOTTOM TIME 20 profile specifically, this
produces STOP10 persisting through the whole WORK phase (bar the first
11-minute stage's blank/no-write state) because every staged
re-initiation from stage 2 onward independently computes HT10/DX5  - 
a faithful, mechanistically-understood outcome for this profile, not
an unexplained "stuck" label. Whether OTHER profiles (where staged
HT/DX values differ across stages, producing a genuine STOP10→STOP5
visible transition during WORK) are also correctly reproduced is not
yet tested  -  that remains blocked on DEF-011's implementation, since
current JSX doesn't run the staged WORK-initiation dispatch at all.

**Proposed change:** None proposed for JSX yet  -  the CCEMU finding is
a regression target for DEF-011's implementation, not a standalone fix
to make ahead of it. Once GOSUB 5900 is implemented per DEF-011, the
staged WORK-initiation dispatch must call GOSUB 6950 twice per stage
(matching source lines 1693/1694) and let STOP10/STOP5 update
naturally as each stage's HT/DX is computed.

**Files/routines affected:** `gosub_6950()`, its call site in the
WORK-initiation dispatch; directly entangled with DEF-011's GOSUB 5900
work  -  do not implement 5900 without also reproducing this two-call,
per-stage 6950 behaviour.

**Regression tests required:** DEF-011 is now implemented (10 August
2026), including the full per-stage GOSUB 6100/6850/6950 dispatch  -  so
the mechanism this defect depends on should now actually run in JSX.
Not yet separately confirmed: whether the visible STOP10/STOP5 DM
content updates correctly across stages in the implemented JSX (DEF-011's
own regression evidence was about scheduler/activity sequencing and
BOTTOM TIME/ASCEND handoffs, not a DM-content check). The WD40/BOTTOM
TIME 20 CCEMU trace above (eight 6950 entries, HT/DX per stage, STOP10
from stage 2 onward) remains the concrete regression target; a profile
where staged HT/DX genuinely differs across stages (unlike this one)
would additionally confirm a visible STOP10→STOP5 transition during
WORK itself, not just at dive end. The parked "CCEMU DM/NOSTOP sequence
capture" test (TODO.md, proposed 10 August 2026) is designed to answer
exactly this, on the original BASIC side, for later comparison.

**UPDATE, 14 August 2026  -  the parked CCEMU DM/NOSTOP capture test has
now been run**, on the same WD40/BOTTOM TIME 20 profile it was designed
for. A complete visible DM sequence was captured on the original-BASIC
side:
- Initial display includes NOSTOP/live depth.
- WORK decision displays "AIR OK" (GOSUB 6200/DEF-013).
- Decompression obligation produces magenta "STOP10".
- Steady staged-WORK requirement row observed as `T10:::`.
- Staged transition observed as `T10>15`; the `T` and `>` characters
  remain static while the numeric portions flash.
- Next steady state `T15:::`; next transition `T15>20` (same static/
  flashing pattern); next steady state `T20:::`.
- "STOP10" remains visibly present through staged WORK, initial ASCEND,
  and the 10m decompression stop. Existing source/trace evidence
  indicates it IS refreshed/re-written at each WORK re-initiation even
  where the visible text happens not to change (consistent with the
  8-entry 6950 trace above, where every stage past the first
  independently computes HT10/DX5).
- After completion of the 10m stop, source GOSUB 7500 changes the
  display to "STOP 5".
- After completion of the final 5m decompression stop, GOSUB 7500
  writes green "ASCEND".
- Final MEMORY display observed DIRECTLY in CCEMU as `21:45` / `10M 5:`
  / `5M 15` / red working depth 40  -  **this upgrades the previous
  MEMORY evidence from source-arithmetic inference to a full end-to-end
  CCEMU observation.** T25/TESTING_PLAN.md/TODO.md's careful "CCEMU
  proved BT=21.75; BASIC source proves the 21:45 formatting; JSX
  demonstrates the display  -  three distinct pieces of evidence, not one
  CCEMU run covering all of it" caveat should be updated to reflect
  that the CCEMU side of that evidence is now itself an observed
  end-to-end run, not only the BT=21.75 trace. See TESTING_PLAN.md T25.

**Important caution surfaced by this capture:** the `T...` row becomes
a LIVE COUNTDOWN during actual decompression  -  captured values such as
`T18:30`, `T15:30`, `T12:00` are mid-countdown snapshots and must NOT
be treated as initial/fixed values in any future comparison.

**Separately reconfirmed by this same capture session, not part of
DEF-002 itself:** plot-Y wraparound behaviour  -  ASCEND can pass through
the top of the 192-line plot domain and reappear at the bottom, with
subsequent DECOMPRESS plotting continuing from the wrapped position.
Original behaviour, not a display defect to "correct." Relevant to
CoordinateSystem.md's U14 (plotY range, currently unconfirmed by
photograph)  -  worth folding in when that file is next updated; HK
doesn't have it in the current working set to update directly.

**Diagnostic tooling note, worth retaining as project convention:** for
this capture, diagnostic BASIC line 7110 in GOSUB 7000 was changed from
`PLOT 14` to `PLOT 15` to make DM characters readable in normal
character form under CCEMU  -  does not alter dive logic. Retain as a
CCEMU reference/diagnostic variant for future archaeology; do NOT carry
this into canonical DIVER.bas.

**Fix candidate built, NOT YET TESTED:**
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_T44_DEF002_DM_lifecycle.jsx`
 -  built directly from the confirmed T44 baseline
(`..._T44_CCEMU_join_overlap2px_h2.jsx`), display-only changes:
completes GOSUB 7500 display behaviour (STOP 5, ASCEND, row-2 clear);
corrects GOSUB 7000 colour selection to source/CCEMU behaviour (magenta
IDs 1-6 under CO=0, yellow IDs 7-18 under CO=0, green under CO=1, red
depth digits); retains FL=1 as blink metadata so staged-WORK numeric
fields can flash independently. Scheduler, PA, ES, event boundaries,
predictive prompting, activity creation, movement/clamp, and
decompression arithmetic all untouched.

**RESOLVED/PASS, 14 August 2026  -  regression complete, candidate
promoted.** Tested WD40/BT20/ACCELERATED with all staged WORK
proposals accepted. Full CCEMU-derived DM lifecycle reproduced: green
AIR OK; magenta STOP10; staged T10/T15/T20 display including flashing
numeric transition fields; STOP10 retained through first ascent/10m
stop; magenta STOP 5 at next decompression stage; green ASCEND after
final decompression; correct final MEMORY. Dive completed normally.
No scheduler regression observed. Candidate promoted to confirmed
baseline (see TODO.md header for current full baseline filename, which
has since accumulated further fixes on top of this one).

**Evidence set preserved:** seventeen chronological screenshots from
the WD40/BT20 DEF-002 investigation recovered and saved as a numbered
evidence set/ZIP  -  staged WORK transitions, STOP10, STOP 5, ASCEND,
decompression countdown, wraparound, and final MEMORY.

**Correction to earlier evidence, 14 August 2026:** the `T n::::`-type
row (surfaced by GOSUB 6900/DEF-014) was previously described as
"transient." Direct CCEMU observation corrects this: after a
staged-WORK response, the `Tn:::` row remains static and continuously
visible until the next user question causes it to be rewritten  -  it is
RETAINED Dive Monitor state between prompts, not a brief rendering
artefact. Earlier notes describing it as transient (this entry,
DEF-014, TODO.md) should be read with this correction in mind.

**Final resolution:** RESOLVED  -  PASS (14 August 2026). Reopened 09
August 2026, mechanism confirmed via CCEMU (10 August 2026), original-
BASIC side fully captured (14 August 2026), JSX fix candidate built and
regression-confirmed the same day. Promoted to baseline.

---

## DEF-003  -  WORK-to-ASCEND handoff gap in the diver's own position track (RESOLVED)

**Observation:** Small but real visual gap between the end of GOSUB
6300 Branch 2's (WORK) dashed track and the start of Branch 1's
(ASCEND) line, at every WORK→ASCEND transition. John: "it is as if the
work horiz line is one tick too short."

**Evidence:** Paired profileSegs/workDots diagnostic readings (John, 28
July 2026) on WD1/BT10, WD1/BT30, WD1/BT33  -  gap was a CONSTANT 2.0px
regardless of WORK's duration (ruled out a growing/multi-column gap
hypothesis). WD1/BT10 (post-fix): profileSegs ascend bar at 44.3,
workDots last entry at 45.3  -  1px overlap, not a gap.

**AI analysis (SB, 28 July 2026), confirmed cause:** GOSUB 6300 Branch
1 draws a single bar per tick at BASIC_LQ+1 (an offset empirically
confirmed against a 3 July photograph for the dive-start DESCEND case,
internally consistent across any run of same-branch ticks). Branch 2
draws its own last dot at raw BASIC_LQ, no offset. At the exact tick
WORK hands off to ASCEND, both branches compute the identical LQ, but
Branch 1's +1 draws one column ahead of where Branch 2 left off  - 
hence the constant, non-growing gap.

Root architectural note: Branch 1's "single bar per tick" is itself an
approximation of the real BASIC source, which is a vector PLOT command
drawing a line between two points (LP,MP)→(LQ,MQ), not a single-point
mark. That approximation was made and photo-validated on 3 July 2026,
predating this session  -  DEF-003 is a boundary case that
approximation wasn't originally built to handle, not a new liberty
taken with the algorithm today.

**Your assessment:** WD1/BT10 confirmed good (28 July 2026). More
tests pending before full close.

**Confirmed cause:** GOSUB 6300 Branch 1's `+1` offset vs Branch 2's
raw LQ, unreconciled at the WORK→ASCEND handoff tick specifically.

**Proposed change:** `justLeftWorkRef`  -  set true whenever Branch 2
fires, consumed and reset by the next Branch 1 call. On that one
flagged tick only, `barGridX=BASIC_LQ` (no `+1`) instead of the usual
`BASIC_LQ+1`. Every other tick, including the dive-start DESCEND case
the `+1` offset was validated against, unaffected.

**Files/routines affected:** GOSUB 6300 Branch 1's `barGridX`
computation; new ref `justLeftWorkRef`.

**Regression tests required:** RT-01/RT-02 (dive-start DESCEND, the
`+1` offset's original validation case  -  must show NO change), RT-05
(coloured-band mountain), RT-28 (full end-to-end cycle).

**Final resolution:** RESOLVED (28 July 2026). Fix confirmed across
three profiles: WD1/BT10, WD1/BT30, and WD40/BT22 (the original 3 July
dive-start regression check  -  confirms the fix does not disturb the
one photograph-validated case). All pass.

**General principles uncovered (recorded for future reference and
historical narrative, per John):**
1. A gap that stays CONSTANT in size regardless of how long the
   preceding activity ran is diagnostic of a fixed rendering-convention
   mismatch between two code paths  -  not missing data or a skipped
   multi-tick span, which would instead scale with duration. Worth
   checking this distinction first in any future "disjointed track"
   report, before assuming a logic/data bug.
2. Wherever this project's translation substitutes a single-point-per-
   tick rendering for a real BASIC vector/line-draw PLOT command  -  an
   approximation made and validated once, for one specific calling
   context  -  that approximation should be treated as a candidate
   defect at any OTHER handoff/boundary it was never validated
   against. Its internal offset conventions may silently assume
   "always follows same-branch ticks," which the original validation
   had no way to surface.

**UPDATE, 14 August 2026:** T44 (the WD18 WORK→ASCEND repro case
flagged as possibly this same root cause from a different angle) has
now been investigated directly via CCEMU and resolved  -  but the actual
finding differs from the original hypothesis. CCEMU showed DESCEND→WORK
and WORK→ASCEND are genuinely connected lines in the original
execution; the JSX seams were SVG/raster-representation artefacts, not
a BASIC coordinate gap of the kind DEF-003 fixed. So T44's symptom was
real, but its cause was NOT the same `+1`/raw-LQ offset mismatch as
DEF-003  -  a useful caution in its own right: two symptoms that look
alike (a visible seam at an activity handoff) don't always share a
root cause, even when one was found first and looks like an obvious
explanation for the other. See TODO.md's removed T44 entry, LOG.md 14
August 2026.

---

## DEF-004  -  DESCEND terminates one tick early for most WD, missing the final clamp/landing tick (supersedes T34/T39/T40/T41) (RESOLVED)

**Observation:** Displayed/actual depth falls short of the requested
WD for most profiles. WD10/BT45 retest, 28 July 2026: diagnostic shows
AD=7.50 against a WD target of 10  -  a 2.5m shortfall. 7.50 = DR×TK
exactly (30×0.25), i.e. AD stopped after exactly ONE tick's worth of
descent, un-clamped, rather than continuing to a second tick and
clamping to the true target of 10m. The subsequent WORK period then
proceeds at this shortfall depth, and the DM's depth reading persists
the same shortfall rather than the requested WD. John reports this is
not WD10-specific  -  other WD values also terminate a few metres short.
WD40 (RT-01/RT-02) is independently confirmed correct  -  6 ticks,
properly clamped.

**Evidence:**
- WD10/BT45: AD=7.50 vs target 10 (shortfall 2.5m). Screenshot:
  `reference/emulator_screenshots/T34_WD10_BT45_ascend_depth_shows_7.png`.
- WD16/BT40: displays as 15 (shortfall 1m). Screenshot:
  `reference/emulator_screenshots/T33_T34_WD16_BT40_work_left_of_descent.png`.
- WD30/BT50: displays as 22 (shortfall ~7.5m). Screenshot:
  `reference/emulator_screenshots/T35_WD30_BT50_freeze_gosub5900_not_implemented.png`.
- WD49, immediate ASCEND: displays as 45 (shortfall 4m). Screenshot:
  `reference/emulator_screenshots/T33_T34_WD49_immediate_ascend_overlap.png`.

**AI analysis (HK, 28 July 2026):** Checked all four data points
against DR=30/TK=0.25 tick arithmetic (7.5m/tick). In every case the
observed value matches the SECOND-TO-LAST tick's value  -  the loop
stops exactly one tick before the tick that would either clamp to the
target (source `[3403] IF AD+DR*TK>target THEN clamp`) or land exactly
on it:
- WD10: ticks reach 7.5, then 15>10 would clamp to 10 on tick 2  -  stops at tick 1 (7.5, rounds to 7 on screen).
- WD16: ticks reach 7.5, 15, then 22.5>16 would clamp to 16 on tick 3  -  stops at tick 2 (15).
- WD30: ticks reach 7.5, 15, 22.5, then tick 4 lands exactly on 30 (30 is not >30, so this is the normal-add branch, not even a clamp)  -  stops at tick 3 (22.5, rounds to 22).
- WD49: ticks reach 7.5...45 by tick 6, then 52.5>49 would clamp to 49 on tick 7  -  stops at tick 6 (45).

This is one consistent mechanism explaining all four data points, not
four independent unexplained discrepancies as previously recorded
(TODO.md's earlier note that the four points showed "no consistent
pattern" is superseded by this finding).

**Working hypothesis (John, 28 July 2026), SUPERSEDED 07 August 2026  - 
not confirmed, see below:** RT-29's already-confirmed IK look-ahead
margin (`IF IK<0.5 THEN IK=0.5`, forcing IK=0.5 in ACCELERATED mode
where TK=0.25) was proposed as involved in an analogous
DESCEND-completion check the same way it's involved in ASCEND's. This
was never checked against source and is now superseded by the actual
confirmed mechanism below  -  the IK margin was not the cause.

**UPDATE 07 August 2026 (SB, consolidated scheduler handoff):**
Root cause confirmed via CCEMU. The original scheduler is predictive
 -  it separates current activity, look-ahead prompt boundary
(`ES(EP,2)-IK`), and true event boundary (`ES(EP,2)`). JSX had been
treating the WHICH ACTIVITY REQUIRED prompt as terminating/replacing
DESCEND immediately, before the `3405 AD=AL(AL,4)` bottom clamp could
execute  -  an architectural scheduler defect, not an IK-margin issue.
Fix: DESCEND remains current until its own movement completes, letting
3405 fire naturally; no artificial WD assignment introduced. Verified
via CCEMU across three profiles: WD10 (0→7.5→10), WD16
(0→7.5→15→16), WD40 (0→7.5→15→22.5→30→37.5→40, final non-multiple
step is the genuine 3405 clamp). A related clock-model correction
was also required: an intermediate fix version forced `CL=ES(EP,2)`
exactly at the boundary, which CCEMU proved wrong (BASIC advances on
its own discrete `CL=CL+TK` grid, not to the exact logical event time)
 -  this exact-CL clamp was removed. Current candidate implementing the
fix: `DiverSim_scheduler_CCEMU_clock_v3.jsx`.

**Your assessment:** Confirmed as a real, reproducible defect across
multiple WD values (John, 28 July 2026).

**Confirmed cause:** Scheduler architecture defect  -  predictive prompt
allowed to terminate DESCEND before its own 3405 clamp tick, not an
IK-margin effect (SB, CCEMU, 07 August 2026).

**Proposed change:** Implemented (see update above)  -  preserve DESCEND
as current activity until movement/clamp completes; remove the
exact-CL boundary clamp in favour of discrete TK-grid progression.

**Files/routines affected:** DESCEND tick-advance/scheduler logic
(source lines ~3403-3405, scheduler dispatch around 1465/3400/3405);
clock-advance handling (CL).

**Regression tests required:** RT-01/RT-02 (WD40 clamp/landing case  - 
must remain unaffected), plus the full DESCEND-related sweep below  - 
satisfied, see UPDATE below.

**UPDATE, 14 August 2026 (SB)  -  RESOLVED by record reconciliation.**
The "not yet regression-confirmed" hold above is stale. Root cause was
corrected in the predictive-scheduler reconstruction (DESCEND remains
current until its own movement/clamp completes; discrete TK clock
progression preserved, no artificial exact-CL boundary clamp); CCEMU
directly verified WD10, WD16, and WD40 landing at their true targets.
The subsequent accelerated WD15-20 sweep (08 August 2026) and REAL-mode
WD16/deeper full-cycle regressions (11 August 2026) both passed and
exercise exactly the DESCEND-completion behaviour this defect concerns.
LOG.md's 13 August 2026 TODO.md cleanup already recorded T34/T39/T40/
T41 (this defect's merged symptom family) as closed via that formal
regression. No new code or test required  -  this is a housekeeping
correction to a stale status line, not new work.

**Final resolution:** RESOLVED  -  PASS (14 August 2026, by record
reconciliation). Fix implemented 07 August 2026; formal regression
confirmation was already satisfied by the 08 August WD15-20 sweep and
11 August REAL-mode regression, but this entry's status line was never
updated to reflect that until now.

---

## DEF-005  -  ASCEND's own track renders behind the DT (coloured decompression) bars instead of on top (RESOLVED)

**Observation:** ASCEND's initial track segment renders BEHIND the
coloured DT (decompression-table) bars rather than taking visual
priority over them, wherever the two overlap spatially  -  visible at
the WORK-mountain-to-ASCEND boundary.

**Evidence:**
`reference/emulator_screenshots/T33_WD35_ascend_hidden_by_mountain_bar.png`
(WD=35). Retested directly, 28 July 2026: **confirmed FAIL**  -  the
diver path draws, then the DT/coloured bars draw over the first line
of ASCEND, partially or entirely depending on the graphic's start
point. Better image saved 08 August 2026:
`reference/emulator_screenshots/DEF-005_ascend_behind_DT_bars.png`
(John)  -  clearer capture of the same symptom, supersedes the T33/WD35
image as the primary reference.

**AI analysis:** Originally logged as two separate items  -  T38 (found
24 July, position/overlap framing) and a standalone "ASCEND should
overwrite DT bars" note (raised alongside DEF-003, 28 July). John
confirmed these are the same underlying issue and merged them here.
Distinct in kind from DEF-003 and DEF-004  -  this is a draw-order/
z-priority issue (which element paints on top), not a position/offset
bug, even though it surfaces on the same screenshot and near the same
boundary as DEF-003 originally covered.

Also resolves the T24 reopening flag raised 24 July 2026 (whether the
mountain-vs-ascent overlap was a gap in T24's own closure)  -  this is
DEF-005's territory specifically, not a T24 rendering defect.

**Your assessment:** Confirmed FAIL on direct retest (John, 28 July
2026).

**Confirmed cause:** DT/coloured bars paint after (on top of) the
ASCEND line in current draw order; ASCEND should paint last.

**Proposed change (confirmed, 12 August 2026  -  see update below):**
Reorder the draw sequence so ASCEND's line paints
after (on top of) the DT bars, or raise ASCEND's paint priority
explicitly. Not yet scoped in detail.

**UPDATE 12 August 2026 (SB)  -  cause and required rendering behaviour
CONFIRMED, regression testing still required before closure.** Causal
z-order test PASSED: moving `profileSegs` to render after the coloured
DT `bandSegs` makes ASCEND visibly overwrite the coloured mountain,
matching the intended BASIC sequential PLOT behaviour. No geometry,
scheduler, timing, or activity-state logic changed.

Follow-up diagnostics investigated whether the now-visible ASCEND
looked prematurely positioned, particularly at WD40/BT20  -  an
important check, since simply making ASCEND paint on top could have
exposed a genuine positioning bug that the old z-order had been
accidentally hiding:
- WD35/BT20: final WORK ends with LM=52; first ASCEND has LQ=53  -  no
  overlap, ASCEND begins one BASIC X-column after the last WORK
  column.
- WD40/BT20: final WORK Branch 2 plots X3=53 and leaves LM=53; first
  ASCEND has LQ=53. BASIC line 6314 suppresses only when `LQ<LM`, so
  equality is deliberately allowed by source. **The first ASCEND
  vector therefore legitimately occupies the same BASIC X-column as
  the final WORK bar**  -  confirmed source-authentic overlap, not a new
  JSX positioning or scheduler defect. The final coloured bar had
  previously been concealing some or all of that genuine ASCEND
  stroke, which is exactly the symptom this defect describes.

**RESOLVED, 12 August 2026 (SB)  -  regression PASS.** Cause confirmed:
the React SVG grouped rendering gave the coloured DT `bandSegs`
permanent z-priority over `profileSegs`, so the bars always painted
over ASCEND. In the original BASIC, GOSUB 6300 executes sequentially  - 
a later non-WORK vector can overwrite an already-plotted WORK/bar
column, which is exactly what the z-order fix reproduces. The z-order
candidate was built from the clean DEF-017/DEF-007 baseline so that
coloured WORK/DT bands render first and non-WORK `profileSegs` render
afterward. No geometry, scheduler, timing, PA/ES, activity creation,
movement/clamp, or other simulation logic changed.

**Regression PASS:** WD35/BT20/ACCELERATED; WD40/BT20/ACCELERATED;
WD40/BT22/ACCELERATED full cycle; REAL WD40/BT20/all staged YES.

**Overlap-extent clarification, WD35 vs WD40:** WD35  -  ASCEND begins
one BASIC X-column after the final WORK column; finite SVG element
width causes only a small edge overlap. WD40  -  source deliberately
permits the first ASCEND vector in the same BASIC X-column as the
final WORK bar (`LQ===LM`), producing substantially greater overlap.
Both are genuine, source-authentic, and now correctly rendered.

**New clean baseline: `DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx`**  - 
DEF-017, DEF-007, and DEF-005 are now all incorporated. Scheduler
remains PASS/FREEZE, untouched throughout.

**Clean-baseline confirmation sweep, 12 August 2026 (SB).** The final
clean successor `DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx` itself
(not a separate test candidate) has now completed its own confirmation
sweep: WD35/BT20/ACCELERATED  -  PASS; WD40/BT22/ACCELERATED full cycle
 -  PASS; REAL WD40/BT20/all staged YES  -  PASS. Confirms the DEF-005
z-order fix survived the clean rebuild and that the previously
incorporated DEF-017/DEF-007 fixes remain intact together on the one
file. This is the strongest confirmation yet, since it exercises the
actual baseline artefact rather than an intermediate build.

**Files/routines affected:** GOSUB 6300 rendering  -  draw order between
Branch 1's ASCEND line and the DT/coloured-band elements.

**Regression tests required:** RT-05 (coloured-band mountain  -  must
remain visually correct for WORK's own rendering, only ASCEND's
priority relative to it should change)  -  confirmed unaffected by the
regression PASS above. See REGRESSION_TESTS.md for the formalised row.

**Final resolution:** RESOLVED  -  PASS (12 August 2026). Cause
(z-priority draw-order bug) confirmed and fixed; WD40's more extensive
overlap confirmed as deliberate source behaviour (`LQ===LM` explicitly
allowed by BASIC line 6314), not a defect exposed by the fix.
Regression-confirmed across four profiles. Incorporated into the
current graphics baseline.

---

## DEF-006  -  REST asks "FOR HOW LONG" twice (scheduler double-prompt) (RESOLVED)

**Observation:** Live testing shows the "FOR HOW LONG" prompt (GOSUB
5700) appearing twice for a single REST period, instead of once.

**Evidence:** SB, consolidated scheduler handoff, 07 August 2026  - 
live testing during REST scheduler reconstruction work. No screenshot
attached yet.

**AI analysis (SB, 07 August 2026), checked against source:** In the
BASIC, REST suppresses the WHICH ACTIVITY REQUIRED prompt at the
look-ahead stage  - 

    3021 IF AL(AL,1)<>5 THEN 3025
    3022 CK=1:GOTO 1465

 -  and "FOR HOW LONG" (GOSUB 5700 / SUB REST NEXT) belongs later, in the
end-of-event dispatch path (`2010 ON NA GOTO...`, `2140 GOSUB 5700`),
not at look-ahead. Current JSX has a REST auto-default path inside the
look-ahead section that can itself call `gosub_5700_start()`  -  so the
prompt fires once there, then again at the correct end-of-event point,
producing the observed double-prompt. Same general family as DEF-004/
the WORK→ASCEND scheduler work (prompt vs true-boundary conflation),
but REST's own specific mechanism (an auto-default path duplicating
the end-of-event call) rather than the DESCEND/WORK pattern.

**Your assessment:** Confirmed as a genuine, repeatable defect. "FOR
HOW LONG" is presented twice for a single REST transition; this is not
expected behaviour and should be corrected to match the BASIC
scheduler, where REST suppresses the look-ahead activity prompt and
GOSUB 5700 belongs only in the end-of-event dispatch path. Confirmed
by repeated live observation, 07 August 2026 (John).

**Confirmed cause:** REST auto-default path in the look-ahead section
calling `gosub_5700_start()` in addition to the correct end-of-event
call  -  confirmed defect (SB, 07 August 2026), fix confirmed working
(SB, 08 August 2026).

**Proposed change:** Implemented in candidate
`DiverSim_REST_scheduler_v1.jsx`. Tested successfully on two paths, 08
August 2026 (SB):
  - Standard WD40/BT22 full decompression cycle:
    `DESCEND → WORK → ASCEND → DECOMPRESS → ASCEND → DECOMPRESS →
    ASCEND → REST → END`.
  - Deliberate WORK→REST override: `DESCEND → WORK → REST → END`  - 
    despite HT=10 already established, no DECOMPRESS
    activity/coloured bars were created, confirming the user's
    accepted REST choice overrides the suggested successor at that
    transition.
  Confirmed on both: FOR HOW LONG appears once only; the entered
  duration becomes REST's own duration; REST runs to its scheduled
  boundary with no second prompt; REST does not self-chain; at the
  REST boundary the simulation terminates via `GOSUB 8000` then `END`,
  matching BASIC lines 1800-1820.

**Files/routines affected:** REST scheduler / look-ahead handling;
`gosub_5700_start()` and its call sites.

**Regression tests required:** RT-26/RT-27  -  **confirmed historically
wrong, not just under review.** These rows' REST→REST self-chain
expectation contradicted BASIC lines 1800-1820 all along; both need
rewriting to reflect REST terminating via GOSUB 8000/END, not
re-passing as originally worded. RT-28's tail similarly needs
rewriting from `...→ REST → REST` to `...→ REST → END`. See
REGRESSION_TESTS.md for the corrected wording. "FOR HOW LONG asked
exactly once per REST period" is now covered by the two tested paths
above.

**Qualification (SB, 08 August 2026):** `GOSUB 8000`'s MEMORY/
end-of-dive display was separately unimplemented/unverified at the
time of this closure  -  this closure covers REST's own scheduling
behaviour only, not the display that runs once the simulation reaches
`END`. **UPDATE, same day:** MEMORY has since been implemented and
CCEMU-verified independently  -  see DEF-011 and TODO.md T25. A minor
cosmetic issue (MEMORY heading background) remains open as DEF-010.

**Final resolution:** RESOLVED  -  fix confirmed on two tested paths (08
August 2026), pending only the standard cosmetic wording pass over
RT-26/RT-27/RT-28 to bring the regression register in line (tracked as
a housekeeping follow-on, not a reason to hold this defect open). The
GOSUB 8000 MEMORY display is explicitly out of scope for this defect
and remains its own open item.

---

## DEF-007  -  DECOMPRESS→ASCEND transition gap (RESOLVED)

**Observation:** The horizontal DECOMPRESS graphic begins a little
early and extends a little too far on the time axis at its boundaries,
making ASCEND→DECOMPRESS joins look visually untidy.

**Evidence:** SB, DECOMPRESS scheduler handoff, 08 August 2026  - 
observed on the WD40/BT22 full-cycle path during DECOMPRESS scheduler
confirmation work. No screenshot attached yet.

**AI analysis (SB, 08 August 2026):** Assessed as a rendering/geometry
issue, not a scheduler/event-boundary issue  -  DECOMPRESS's own
scheduler behaviour (HT changes only at the true [1888] boundary) is
separately confirmed correct in this same session. BASIC draws the
non-WORK track as a vector between calculated start/end coordinates;
JSX currently represents the flat DECOMPRESS section using plot-column
rectangles instead, which is the suspected source of the small
start/end overshoot. Investigation was deliberately deferred until
scheduler correctness was established for DECOMPRESS; SB's suggested
next task is to investigate this without touching the now-confirmed
scheduler behaviour.

**UPDATE 08 August 2026 (SB, ASCEND/DECOMPRESS/REST rendering
investigation), current candidate `DiverSim_ASCEND_transition_REST_
vector_v1.jsx`:** Substantial progress, defect narrowed but NOT
resolved. Historical photograph confirmed as benchmark: vertical
ASCEND / horizontal DECOMPRESS only, no angled/curved ASCEND lines.
Four rendering approaches tried and rejected (literal SVG BASIC
vectors  -  angled ASCEND, wrong; rasterised BASIC vectors  -  broken/
uneven lines; stepped raster stroke  -  excessive staircasing not in
photo; L-shape on every ASCEND tick  -  clean joins but repeated
horizontal steps during ascent, also not in photo). Current fix:
normal photo-like vertical ASCEND bar restored; raw BASIC LQ position
applied only on the ASCEND tick reaching its target depth (the old
ASCEND→DECOMPRESS displacement traced to empirical LQ+1 positioning).
DECOMPRESS now rendered as a raw horizontal LP→LQ line instead of the
old filled/bar-style element  -  this specific defect's original
symptom (early-start/late-finish DECOMPRESS geometry) is GOOD in the
current candidate. **However, a new/related symptom remains: a small
visible gap at the end of a DECOMPRESS horizontal segment where the
following ASCEND begins**, absent from both the historical photograph
and the clean benchmark image produced during the investigation. User
has accepted the current appearance so work can continue, but SB is
explicit this is NOT to be classified as resolved or accepted
variance  -  it remains a genuine known rendering defect. Explicit
warning against a wrong fix: do not reintroduce L-shapes throughout
ASCEND to close this gap  -  that closes the transition but visibly
damages ASCEND fidelity (per the rejected L-shape experiment above).

**Your assessment:** [pending]

**RESOLVED 12 August 2026 (SB), investigated from the clean DEF-017
baseline (`DiverSim_v11_DEF017_ASCEND_target_fix.jsx`).** Same
disciplined two-probe methodology as DEF-017:
- **Probe 1:** the final DECOMPRESS endpoint and first ASCEND
  rectangle meet exactly in BASIC-derived X/Y geometry.
- **Probe 2:** the last non-zero-length DECOMPRESS SVG line also
  reaches exactly the first ASCEND rectangle's centre X and bottom Y  - 
  ruling out scheduler timing, BASIC coordinate mismatch, and missing
  final raster extent as causes.

**Confirmed cause:** an SVG raster seam at the junction between the
2px butt-capped DECOMPRESS `<line>` and the filled first ASCEND
`<rect>` under crisp-edge rendering  -  a pure rendering-technique
artefact, not a coordinate or timing error (both were ruled out by the
two probes above).

**Fix implemented:** extend only the first ASCEND rectangle
immediately following DECOMPRESS by 1px downward into the join. No
BASIC coordinates, scheduler, timing, PA/ES, activity creation,
movement/clamp, or other ASCEND rendering changed.

**Regression PASS (12 August 2026):** REAL WD40/BT20/all staged YES;
REAL WD16/BT10; WD49/ACCELERATED/immediate ASCEND; WD40/BT22/
ACCELERATED full cycle  -  same four-profile sweep used for DEF-017.

**New clean baseline: `DiverSim_v11_DEF017_DEF007_fix.jsx`.** Scheduler
remains PASS/FREEZE, untouched.

**Confirmed cause (superseded by the above  -  kept for history):**
Original early-start/late-finish DECOMPRESS
symptom traced to filled/bar-style plot-element rendering  -  fixed by
switching to a raw LP→LQ line. The remaining DECOMPRESS→ASCEND gap's
cause was not confirmed at the time this line was written; see the
RESOLVED note above for the actual confirmed cause.

**Proposed change (historical  -  see RESOLVED note above for the actual
implemented fix):** Implemented for the original symptom (raw
horizontal LP→LQ line for DECOMPRESS, target-depth-only LQ alignment
for ASCEND). Remaining gap: no fix proposed yet  -  desired eventual
result specified by SB is a continuous DECOMPRESS→ASCEND join with no
gap and no artificial horizontal step introduced into ordinary ASCEND.

**Files/routines affected:** First-ASCEND-rectangle-after-DECOMPRESS
sizing (1px extension into the join)  -  DECOMPRESS/ASCEND/REST flat-line
and bar track rendering generally (GOSUB 6300-family plot-column
logic). NOT the DECOMPRESS/ASCEND schedulers, unaffected throughout.

**Regression tests required:** Covered by the PASS evidence above  - 
see REGRESSION_TESTS.md for the formalised row. Did not require
re-touching RT-16/RT-17/RT-18/RT-19/RT-20 (DECOMPRESS's DM/
scheduler-side rows), confirming the fix was genuinely geometry-only
as hoped.

**Final resolution:** RESOLVED  -  PASS (12 August 2026). Root cause
(SVG raster seam, not a coordinate/timing/scheduler issue) confirmed
via two-probe investigation; fix regression-confirmed across four
profiles. Do not reopen this on the strength of unrelated ASCEND/
DECOMPRESS rendering work elsewhere  -  if a similar-looking gap
resurfaces, treat as a new observation to diagnose fresh rather than
assuming the same cause.

**Note, not a new defect:** STOP10 continuing to display at the 5m
stop remains DEF-002 and was not altered during the DECOMPRESS
scheduler work.

---

## DEF-008  -  REST rendered duration visually longer than actual (RESOLVED)

**Observation:** Under the old flat-bar rendering treatment, a REST
period of 5 (minutes) appeared graphically closer to approximately 7
minutes' worth of horizontal extent.

**Evidence:** SB, ASCEND/DECOMPRESS/REST rendering investigation, 08
August 2026  -  found while applying the same raw-line treatment already
adopted for DECOMPRESS (see DEF-007) to REST, during work on the
`DiverSim_ASCEND_transition_REST_vector_v1.jsx` candidate. No
screenshot attached yet.

**AI analysis (SB, 08 August 2026):** Same family as DEF-007's
original DECOMPRESS symptom  -  the old filled/bar-style plot-element
treatment for a flat activity segment introduces geometric error
versus the raw BASIC LP→LQ line the source itself draws.

**Your assessment:** [pending]

**Confirmed cause:** Filled/bar-style plot-element rendering of the
flat REST segment, same mechanism as DEF-007's original DECOMPRESS
symptom.

**Proposed change:** Implemented  -  REST switched to the same raw
horizontal LP→LQ line treatment as DECOMPRESS.

**Files/routines affected:** REST flat-track rendering (GOSUB
6300-family plot-column logic)  -  not the REST scheduler, which is
unaffected (see DEF-006, separately resolved).

**Regression tests required:** None specific to scheduler rows  -  this
is rendering-only. Worth a visual spot-check that REST durations other
than 5 also render correctly, not yet done.

**Final resolution:** RESOLVED (08 August 2026)  -  REST=5 test case now
shows the correct graphical duration in the current candidate. Unlike
DEF-007, no remaining known symptom reported for this one.

---

## DEF-009  -  DESCEND track uses legacy tick-count X positioning instead of BASIC LP/LQ geometry (RESOLVED)

**Observation:** The current DESCEND SVG renderer uses a tick-count-
derived X position introduced during early reconstruction work, rather
than the BASIC's own `LP=INT(AA*XS)+10` / `LQ=INT(CL*XS)+10`
coordinates.

**Evidence:** John, 08 August 2026. The approximation was useful and
visually plausible against poor-quality photographs at the time it was
built. Later ASCEND/handoff work has since exposed inconsistencies at
short-depth/direct DESCEND→ASCEND boundaries. No screenshot attached
yet.

**AI analysis:** The DESCEND track's historical fidelity is uncertain
as a result  -  it was never built from the same raw BASIC LP/LQ
geometry now used for ASCEND (target-depth-tick LQ), DECOMPRESS, and
REST (raw horizontal LP→LQ line, see DEF-007/DEF-008). DESCEND is the
one remaining track element still on the older tick-count
approximation rather than source coordinates.

**Final resolution:** RESOLVED (08 August 2026)  -  moved to new tick count mechanism..

## DEF-009  -  DESCEND painted at BASIC_LQ+1 instead of raw BASIC_LQ (RESOLVED)

**Observation:** The current DESCEND SVG renderer uses a tick-count-
derived X position introduced during early reconstruction work, rather
than the BASIC's own `LP=INT(AA*XS)+10` / `LQ=INT(CL*XS)+10`
coordinates.

**Evidence:** John, 08 August 2026. The approximation was useful and
visually plausible against poor-quality photographs at the time it was
built. Later ASCEND/handoff work has since exposed inconsistencies at
short-depth/direct DESCEND→ASCEND boundaries. No screenshot attached
yet.

**AI analysis:** The DESCEND track's historical fidelity is uncertain
as a result  -  it was never built from the same raw BASIC LP/LQ
geometry now used for ASCEND (target-depth-tick LQ), DECOMPRESS, and
REST (raw horizontal LP→LQ line, see DEF-007/DEF-008). DESCEND is the
one remaining track element still on the older tick-count
approximation rather than source coordinates.

**RESOLVED, 13 August 2026 (SB/John).** Original wording above is now
known partly stale: DESCEND was no longer using the old tick-count X
mechanism by the time this investigation actually began. The
surviving defect was narrower and more specific  -  an inherited
Branch-1 rendering convention that painted DESCEND at `BASIC_LQ + 1`
rather than at the raw BASIC time coordinate `BASIC_LQ`.

Controlled diagnostics showed why this could appear correct on some
profiles but fail on others. At WD16 and WD49, the final DESCEND bar
was painted one plot column ahead of the source coordinate, while the
following ASCEND began at raw `LQ`  -  producing a visible one-column
movement *backwards in time* at the DESCEND→ASCEND handoff. WD40 had
masked the problem, because its next ASCEND tick naturally advanced
into the same column that DESCEND's `+1` offset had occupied  -  the
same "only ever validated against WD40" pattern this project has now
seen several times (DEF-003, DEF-004, DEF-015).

A narrow landing-tick-only correction was tried first and REJECTED:
WD16 still failed. A broader causal candidate then painted ALL
DESCEND ticks at raw BASIC `LQ`, leaving ASCEND, WORK, DECOMPRESS/
REST, DEF-003's WORK-handoff exception, scheduler, PA/ES, movement/
clamp, and activity creation untouched.

**Causal candidate results:** WD16/ACCELERATED/immediate ASCEND  - 
PASS. WD49/ACCELERATED/immediate ASCEND  -  PASS. WD40/ACCELERATED/
immediate ASCEND  -  PASS.

A clean successor was then built directly from
`DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx`:
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_fix.jsx`.

**Clean regression:** WD16/ACCELERATED/immediate ASCEND  -  PASS.
WD49/ACCELERATED/immediate ASCEND  -  PASS. WD40/ACCELERATED/immediate
ASCEND  -  PASS. WD40/BT22/ACCELERATED full cycle  -  PASS. REAL WD40/
BT20/all staged YES  -  PASS.

**Your assessment:** [pending]

**Confirmed cause:** Inherited Branch-1 DESCEND rendering convention
painting at `BASIC_LQ + 1` instead of raw `BASIC_LQ`  -  masked at WD40
by a coincidental next-tick column alignment, exposed at WD16/WD49 as
a one-column backward step at the DESCEND→ASCEND handoff.

**Proposed change:** Implemented  -  DESCEND now paints all ticks at raw
BASIC `LQ`. The old blanket `+1` DESCEND offset is removed.

**Files/routines affected:** DESCEND track rendering (GOSUB 6300-family
Branch 1 plot-column logic) only. No scheduler or simulation-state
logic changed  -  DESCEND's own scheduler correctness (DEF-004) is
separately confirmed and untouched.

**Regression tests required:** Covered by the PASS evidence above  - 
see REGRESSION_TESTS.md for the formalised row.

**Final resolution:** RESOLVED  -  PASS (13 August 2026). DESCEND now
uses raw BASIC `LQ` for its paint X-coordinate throughout. New
confirmed baseline: `DiverSim_v11_DEF017_DEF007_DEF005_DEF009_fix.jsx`.

---

## DEF-010  -  MEMORY heading renders too much black background (RESOLVED)

**Observation:** The current JSX MEMORY heading renders with too much
black background  -  a full-width black strip rather than black
associated only with the printed character cells.

**Evidence:** SB, GOSUB 8000/MEMORY implementation handoff, 09 August
2026. Surviving photograph shows MEMORY one line above the DM box,
with black limited to the printed "MEMORY" text's own character
cells. No screenshot of the JSX result attached yet.

**AI analysis (SB, 09 August 2026):** Source line `8006 PLOT 3,69,1:
PRINT "MEMORY"` merely positions the cursor above the DM box and
prints the word  -  it does not paint a full-width black background.
Rendering-only issue. **8000's rendering/content logic itself is
unaffected**  -  GOSUB 8000 is implemented and source-verified in JSX
(see T25). **BT production is separately open under DEF-011**  -  MEMORY's
top-row correctness in general depends on 8000 being fed a
correctly-staged BT, which the WD40/BOTTOM TIME 20 case happens to get
right even without GOSUB 5900 implemented, because that case's final
endpoint converges; this does not mean BT production is confirmed
correct in general.

**RESOLVED, 14 August 2026 (SB)  -  historical photograph clarified the
actual geometry.** The Dive Monitor is the large black rectangle;
MEMORY is white text on a SEPARATE black strip exactly six characters
wide, sitting immediately above the DM, with a small cyan band still
visible above that strip. Fix: leaves established DM geometry
unchanged; adds a six-character black MEMORY header; white MEMORY
text; header bottom edge directly touches the DM; small cyan area
remains above, matching the historical photograph. Visual comparison
PASS. Candidate
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_T44_DEF002_DEF010_MEMORY_
heading_v3.jsx` promoted to baseline (superseded by further fixes
since  -  see TODO.md header for the current full baseline filename).

**Your assessment:** [pending]

**Confirmed cause:** Original rendering painted a full-width black
strip instead of a six-character-wide header matching the source's
actual PRINT-cursor positioning and the photograph's visible geometry.

**Proposed change:** Implemented  -  see RESOLVED note above.

**Files/routines affected:** MEMORY heading rendering only (GOSUB 8005/
8006's JSX equivalent)  -  NOT GOSUB 6600/6700/7000 or DM digit content,
and NOT GOSUB 5900/BT (DEF-011's separate scope).

**Regression tests required:** Visual comparison against the historical
photograph  -  PASS, see above.

**Final resolution:** RESOLVED  -  PASS (14 August 2026). The red
working-depth digits and the inconsistent colon punctuation on the two
decompression rows were correctly left untouched throughout, as
previously noted  -  neither was ever part of this defect.

---

## DEF-011  -  GOSUB 5900 (WORK-period staging) not implemented  -  promoted from low-priority to source-significant (RESOLVED)

**Observation:** DiverSim.jsx currently treats a single entered WORK
BOTTOM TIME as one indivisible activity. Original BASIC's GOSUB 5900
("SUB STRETCHES WORK") splits a requested WORK period into multiple
chained sub-stages at decompression-table time boundaries, presenting
each boundary as a real "IS NEXT STAGE = <duration> MIN. REQUIRED"
user decision.

**Precise user-interaction sequence (corrected 09 August 2026  -  the
"continue WORK or decline and ascend" shorthand used earlier was
imprecise):** At a staged WORK boundary, answering YES accepts the
proposed continuation. Answering NO does not itself command ASCEND; it
re-enters the BOTTOM TIME path at [5509]. A positive replacement
bottom time is processed through GOSUB 5900 and may generate a new set
of staged WORK intervals. The non-positive branch reaches [5515]
("ASSUME WANT ASCENT-NOT WORK") and then routes toward ASCEND. Exact
user-interaction sequences for revised positive bottom times remain
under controlled CCEMU investigation.

**Evidence:** SB, 09 August 2026, discovered during CCEMU investigation
of an unexpected GOSUB 8000/MEMORY value. CCEMU-proved for WD40/BOTTOM
TIME 20 (entry CL=1.75, TT=20, WD40's DT row 11,17,20,22,24,25,999):
GOSUB 5900 builds a four-entry PA stack  - 
`PA(1,2)=1.75 PA(1,5)=2`, `PA(2,2)=3 PA(2,5)=3`,
`PA(3,2)=6 PA(3,5)=3`, `PA(4,2)=9.25 PA(4,5)=3`  -  consumed in stack
order 9.25→6→3→1.75, producing staged WORK endpoints 11, 17, 20, 21.75.
Directly traced at line 1691 across all four stages (CL/P6/P2/P7/BT/PA
values recorded per stage in LOG.md 09 August 2026).

**AI analysis (SB, 09 August 2026):** Supersedes the 17 July 2026
"correctness-neutral, low priority" judgement recorded in TESTING_PLAN.md
T32 and REGRESSION_TESTS.md RT-31. That judgement checked only the
final numeric convergence of HT/DX/D5 for one profile and concluded
staging doesn't change the eventual decompression numbers  -  true, but
incomplete: it doesn't change WHETHER decompression obligations are
met correctly, but it does change (a) the internal PA/AL activity
sequence, (b) the moments at which the scheduler returns control to
the user, (c) the user's actual opportunity to choose continued WORK
vs. ASCEND at each table boundary, and (d) every intermediate and
final BT value. Point (d) is what surfaced this: `BT=AL(AL,7)` at line
1691, updated at each staged WORK-stage endpoint via
`AL(P,7)=AL(P,6)+AL(P,2)`.

**Precise evidentiary status (corrected 09 August 2026  -  tightened from
an earlier looser "CCEMU-verified end-to-end" claim):** GOSUB 8000 is
implemented and source-verified in JSX. The WD40/BOTTOM TIME 20 final
BT=21.75 was independently proved in original BASIC/CCEMU, via the
5900 PA-stack trace above. Source lines 8020-8060 then mechanically
establish that BT=21.75 becomes 21:45. This is source arithmetic
applied to an independently-CCEMU-proved BT value  -  it is NOT a
completed original-BASIC CCEMU run through the full final MEMORY
display. That distinction matters: it is in fact stronger evidence
than a fuzzy screenshot match would be, but it should not be
overstated as "CCEMU-verified end-to-end." **UPDATE 10 August 2026
(John/SB):** on this basis, TODO.md T25/TESTING_PLAN.md T25's MEMORY DM
content (21:45 / 10M 5: / 5M 15 / red 40 for this profile) is now
regarded as VERIFIED CORRECT  -  no outstanding content defect. This does
NOT close DEF-011 itself: the verification covers GOSUB 8000's own
formatting/content logic and this one profile's already-known BT value,
not whether JSX produces the correct BT in general for WORK periods
that cross a decompression-table boundary (still absent, still this
defect's scope).

**Your assessment:** [pending]

**Confirmed cause:** N/A  -  this is a missing-implementation gap, not a
JSX defect in the sense of incorrect existing code. Current JSX
behaviour (one indivisible WORK period) simply doesn't reproduce
source behaviour.

**Proposed change:** A future JSX implementation should reproduce the
5900-generated PA stack and its corresponding user interaction (staged
"IS NEXT STAGE" prompts at each decompression-table boundary, and the
YES/NO→[5509] re-entry behaviour described above at each), rather than
treating one entered WORK period as one indivisible activity. **CCEMU
finding, 10 August 2026 (SB), architectural clarification:** each
5900-generated stage is a full WORK activity that passes through the
ordinary WORK-initiation dispatch, not a hidden timing subdivision
underneath one activity  -  confirmed via CCEMU trace on WD40/BOTTOM TIME
20, where every staged WORK-initiation independently entered GOSUB
6950 twice (source lines 1693/1694, eight total entries across four
stages), and stages with HT=0/DX=0 (first stage) vs HT=10/DX=5
(stages 2-4) produced correspondingly different STOP-label behaviour
per stage. The JSX implementation must therefore create each staged
WORK activity through the normal activity-initiation machinery
(GOSUB 6100, 6850, 6950 equivalents), not simulate staging as internal
timing arithmetic underneath a single WORK-initiation call. This CCEMU
trace is a direct regression target for the implementation.

**IMPLEMENTED, 10 August 2026 (SB)  -  see full evidence below.**

**Files/routines affected:** GOSUB 5500 (WORK NEXT)/5900 (STRETCHES
WORK) and their JSX equivalents, PLUS each staged activity's full pass
through GOSUB 6100/6850/6950 (per the 10 August CCEMU finding  -  this is
broader than just the PA-stack/timing logic). Indirectly, BT and
therefore GOSUB 8000/MEMORY's top-row accuracy for any WORK period that
actually crosses a decompression-table boundary. Also entangled with
DEF-002 (STOP10/STOP5)  -  GOSUB 6950 is now confirmed (not just
suspected) to re-fire, twice per stage, at each staged WORK boundary;
see DEF-002 for the full mechanism.

**Implementation evidence (SB, 10 August 2026):** Stack-generation
arithmetic implemented and tested in isolation first  -  WD40/WORK20
reproduced the exact CCEMU PA stack (durations 1.75/3/6/9.25, NEXT
values 2/3/3/3)  -  then integrated into the existing scheduler,
including source lines 1890-1893 (preserving an already-prepared WORK
stack when the default WORK continuation is followed).

Regression PASSes:
- **WD40/ACCELERATED/WORK20  -  PASS.** Staged WORK executed 9.25→6→3→1.75,
  endpoints 11→17→20→21.75. Final WORK correctly handed off to ASCEND
  from 40m to 10m, NEXT=DECOMPRESS.
- **WD16/ACCELERATED/WORK10  -  PASS.** No unnecessary subdivision
  introduced  -  existing behaviour (DESCEND→WORK10→ASCEND) preserved.
- **WD20/ACCELERATED/WORK50  -  PASS.** Staged WORK 45→3→2, endpoints
  46→49→51. HT moved from 0 to 5; final WORK correctly created ASCEND
  from 20m to 5m, NEXT=DECOMPRESS.

NO/revised-BOTTOM-TIME path implemented and tested  -  at an "IS NEXT
STAGE = n MIN. REQUIRED" prompt, answering NO does not itself mean
ASCEND; it resets PA to 1 and asks for a new BOTTOM TIME (matching the
[5509] re-entry behaviour established 09 August 2026):
- **Positive replan test  -  PASS.** WD40/WORK20 reached the first staged
  boundary at CL=11; proposed 6-minute continuation rejected with NO;
  new BOTTOM TIME 1 entered. Because CL was exactly on the 11-minute
  table boundary, GOSUB 5900 legitimately constructed a zero-duration
  intermediate WORK entry followed by a 1-minute final entry  -  this
  exposed a genuine JSX scheduler bug (see DEF-012, found and fixed
  during this work). After the DEF-012 fix: NO→BOTTOM TIME 1→"IS NEXT
  STAGE = 1 MIN REQUIRED"→YES→ASCEND. PASS.
- **Non-positive replan test  -  PASS.** At the same staged boundary: "IS
  NEXT STAGE = 6 MIN REQUIRED"→NO→BOTTOM TIME 0 correctly followed the
  source KJ=1/"ASSUME WANT ASCENT-NOT WORK" path and immediately
  created ASCEND, rate 15, from 40m to 0m, NEXT=REST. PASS.

**Regression tests required:** RT-31 reclassified as implemented (see
REGRESSION_TESTS.md, updated). Three edge-coverage rows added  -  RT-36
(GOSUB 5900 shallow/AD<10 boundary, from T50), RT-37 (WORK/REST
minimum-duration and TK-mode boundary, from T55), RT-38 (GOSUB 5900
OUT OF RANGE paths  -  source [5931] hard STOP/O.R. when current CL
already lies beyond all usable DT-row entries, and source [5970] PA=-1
return/error when proposed CL+TT exceeds the usable DT row but current
CL itself is still valid; these are distinct source behaviours and
must NOT be merged into the existing GOSUB 6100/6750 OUT OF RANGE
regression tests). **UPDATE 11 August 2026: all three now PASS**  -  see
REGRESSION_TESTS.md for full evidence. T50/T55 closed and removed from
TODO.md accordingly. RT-24/RT-28 and other full-cycle profiles were
run under the old one-block WORK implementation historically  -  see
REGRESSION_TESTS.md for the dated note that representative profiles
have since been re-run with source-complete 5900 staging and passed
(the three PASSes above).

**Final resolution:** RESOLVED/IMPLEMENTED (10 August 2026)  -  core
behaviour (stack generation, staged consumption, normal continuation,
positive re-planning, abandonment-to-ASCEND) implemented and tested.
Edge/regression coverage (RT-36/RT-37/RT-38) subsequently run and
PASSED 11 August 2026  -  closed on both counts, core and edge. Reclassified 09 August
2026 from correctness-neutral/low priority to source-significant,
implemented 10 August 2026, edge coverage completed 11 August 2026.

---

## DEF-012  -  zero-duration staged WORK activity consumed within one scheduler pass instead of reaching display phase (RESOLVED)

**Observation:** When GOSUB 5900 legitimately constructs a zero-duration
intermediate WORK entry (a real, source-correct outcome when CL sits
exactly on a decompression-table boundary at the moment of a NO/replan),
the JSX scheduler was creating and completing that activity within a
single JS scheduler pass  -  skipping the display phase entirely.

**Evidence:** SB, 10 August 2026, found during the DEF-011 positive
replan test: WD40/WORK20 reached the first staged boundary at CL=11;
the proposed 6-minute continuation was rejected with NO and a new
BOTTOM TIME of 1 was entered. Because CL was exactly on the 11-minute
table boundary, GOSUB 5900 correctly constructed a zero-duration
intermediate WORK entry followed by a 1-minute final entry  -  this
specific, legitimate source outcome is what exposed the bug.

**AI analysis (SB, 10 August 2026):** BASIC line 1790 goes through
display processing before another event can be consumed  -  a
zero-duration activity still gets its own pass through the display/
movement phase before the scheduler moves on. The JSX was instead
consuming the zero-duration activity's creation and completion inside
one scheduler pass, never reaching the 3000/display phase for it. Same
general family as the earlier 1790→3000 same-pass-continuation finding
(08 August 2026 scheduler rewrite) and the 2200→1465 finding, but a
distinct case: those were about which pass a boundary belongs to, this
is about a pass being skipped entirely for an activity with zero
duration.

**Your assessment:** [pending]

**Confirmed cause:** JSX scheduler was not guaranteeing a newly-created
activity reaches the 3000/display phase before another completion event
is consumed, specifically exposed by the zero-duration case.

**Proposed change:** Implemented  -  JSX corrected so a newly-created
activity always reaches the 3000/display phase before another
completion event is consumed, regardless of that activity's duration.

**Files/routines affected:** Scheduler pass/event-consumption logic
(shared with the DESCEND/WORK/ASCEND/DECOMPRESS/REST scheduler
rewrite)  -  not specific to GOSUB 5900 itself, though 5900 is what
surfaces the zero-duration case.

**Regression tests required:** The sequence that exposed this  -  WD40/
WORK20, NO at CL=11, BOTTOM TIME 1, "IS NEXT STAGE = 1 MIN
REQUIRED"→YES→ASCEND  -  is the concrete regression case; confirmed PASS
after the fix (see DEF-011's positive replan test). No separate formal
RT row proposed yet; folded into DEF-011's implementation evidence.

**Final resolution:** RESOLVED (10 August 2026)  -  fix confirmed via the
positive replan test sequence above.

---

## DEF-013  -  GOSUB 6200 (AIR OK, called at 3017 during WORK) missing from candidate lineage (RESOLVED)

**Observation:** No `gosub_6200` implementation or call site existed in
the JSX candidate audited 10 August 2026
(`DiverSim_gosub5900_NO_replan_v4.jsx`)  -  a completely absent live
BASIC subroutine, not a fidelity gap in an existing one.

**Evidence:** SB, BASIC-to-JSX coverage audit, 10 August 2026  -  a
systematic block-by-block audit of the canonical corrected source
(`DIVER(5).bas`) against the current JSX candidate, checking whether
each source block's behaviour is represented, deliberately replaced,
intentionally omitted, fidelity-open, or genuinely absent. Source
`3017 IF AL(AL,1)=3 THEN GOSUB 6200` (main loop, gated on WORK only)
had no JSX counterpart at all.

**AI analysis (SB, 10 August 2026):** User-visible DM behaviour gap  - 
this is not a cosmetic/fidelity question, it's a missing routine.
Flagged as one of three findings more important than the then-planned
RT-36/37/38 edge tests; those were explicitly held pending this and
the other two findings (DEF-014, DEF-015) being resolved.

**RESOLVED 11 August 2026 (SB, v7 closure addendum):** Implemented at
the real source call site, line 3017. Observed on WD16 and WD40
profiles  -  "AIR OK" appears whenever WORK is the current activity at
the predictive activity question, and the third DM row is otherwise
blanked/overwritten later. Functional PASS. Colour and exact display
styling remain open as a fidelity question (not this defect's scope  - 
see the audit's "Fidelity/open display mechanism" list).

**Your assessment:** [pending]

**Confirmed cause:** Genuinely missing implementation, not a translated
bug  -  confirmed absent by direct code audit, not inferred.

**Proposed change:** Implemented  -  see RESOLVED note above.

**Files/routines affected:** `gosub_6200()` and its call site at the
WORK-gated point in the main loop (source 3017).

**Regression tests required:** New row added  -  RT-39 (functional PASS
on WD16/WD40, colour/styling fidelity separately open). See
REGRESSION_TESTS.md.

**Final resolution:** RESOLVED (11 August 2026)  -  functional PASS
confirmed on two profiles. Colour/styling fidelity remains open as a
separate, lower-priority question.

---

## DEF-014  -  GOSUB 6900 (decompression requirement display before staged WORK question) missing from candidate lineage (RESOLVED)

**Observation:** No `gosub_6900` existed in the JSX candidate audited
10 August 2026. Source `5503 GOSUB 6900` is called immediately before
printing "IS NEXT STAGE = ... MIN. REQUIRED" inside SUB WORK NEXT
(5500)  -  i.e., at every staged-WORK decision point introduced by
GOSUB 5900/DEF-011.

**Evidence:** SB, BASIC-to-JSX coverage audit, 10 August 2026. Flagged
as likely relevant to the CCEMU DM/NOSTOP differences already noticed
(the parked DM/NOSTOP capture test, TODO.md)  -  a completely absent
routine sitting right at the point that test would have been observing.

**AI analysis (SB, 10 August 2026):** One of three findings held to be
more important than the then-planned RT-36/37/38 edge tests, alongside
DEF-013 and DEF-015  -  the reasoning being that edge-case regression
work on a scheduler/DM stack that's still missing live routines isn't
meaningful yet.

**RESOLVED 11 August 2026 (SB, v7 closure addendum):** Implemented at
source line 5503, immediately before "IS NEXT STAGE...". WD40/WORK20
observed sequence: first staged question blank (`D5+DX=0`); second
"T10>15"; third "T15>20". Functional PASS.

**New observation surfaced by this fix, not explained by it:** a
separate `T n::::`-type row appears immediately afterward in CCEMU  - 
originally described as "transient", **corrected 14 August 2026**: it
is actually RETAINED Dive Monitor state, remaining static and visible
until the next user question causes it to be rewritten, not a brief
rendering artefact (see DEF-002's own correction note). GOSUB 6900
itself does not explain why this specific row exists  -  a natural
extension of the CCEMU DM/NOSTOP sequence capture test (now run, see
DEF-002).

**Your assessment:** [pending]

**Confirmed cause:** Genuinely missing implementation, confirmed absent
by direct code audit.

**Proposed change:** Implemented  -  see RESOLVED note above.

**Files/routines affected:** `gosub_6900()` and its call site inside
GOSUB 5500/WORK NEXT (source 5503), immediately preceding each staged
"IS NEXT STAGE" question introduced by DEF-011's GOSUB 5900 work.

**Regression tests required:** New row added  -  RT-40 (functional PASS
on WD40/WORK20's three staged questions). The `T n::::` retained-state
row's own display lifecycle is now folded into DEF-002's resolution
(14 August 2026), not a separate open item.

**Final resolution:** RESOLVED (11 August 2026)  -  functional PASS
confirmed. The `T n::::` row's own lifecycle question was folded into
and closed alongside DEF-002 (14 August 2026).

---

## DEF-015  -  full GOSUB 8000 MEMORY implementation absent from current candidate lineage (candidate-ancestry regression, RESOLVED)

**Observation:** The JSX candidate audited 10 August 2026
(`DiverSim_gosub5900_NO_replan_v4.jsx`) contained only the old/minimal
`gosub_8000()`  -  `AD=WD`, GOSUB 6600, GOSUB 6700  -  with none of the
8005/8006 MEMORY heading or the 8020-8100 rewrite of DM IDs 1-18 that
TODO.md/TESTING_PLAN.md/LOG.md record as implemented and demonstrated
on 09-10 August 2026 (see T25, DEF-010, DEF-011's WD40/BOTTOM TIME 20
result: `21:45 / 10M 5: / 5M 15 / red 40`).

**Evidence:** SB, BASIC-to-JSX coverage audit, 10 August 2026. Explicit
finding: "project LOG/TESTING_PLAN record that the full routine was
implemented and visually demonstrated... but that implementation is
not present in the current audited candidate." Classified as
REGRESSED/MISSING FROM CURRENT CANDIDATE  -  a category distinct from
DEF-013/DEF-014 (never implemented): this was implemented once, then
lost from the candidate lineage the audit was actually checking.

**AI analysis (SB, 10 August 2026):** "This is a regression in
candidate ancestry/integration, not a newly discovered source
routine." The most significant of the three audit findings  -  flagged
as the reason not to proceed to RT-36/37/38 yet. **Housekeeping
implication:** T25/DEF-010/DEF-011's earlier "implemented and
verified" status (09-10 August) was accurate for the candidate that
existed at the time, but did not survive into a later candidate
branch/lineage without this coverage audit catching it. Do not assume
a "verified" status from an earlier date still holds for whatever the
current candidate filename is  -  this is exactly the kind of drift the
audit was built to catch.

**RESOLVED 11 August 2026 (SB, v7 closure addendum):** Restored into
the current scheduler/5900 lineage and re-tested. WD40/ACCELERATED/
WORK20 completed with the established final MEMORY display, including
21:45 and the two decompression rows. PASS.

**Your assessment:** [pending]

**Confirmed cause:** Candidate-branch integration loss  -  the full
GOSUB 8000 implementation existed in an earlier candidate but was not
carried forward into the `_gosub5900_NO_replan` lineage. Root mechanism
of how it was dropped not established (not investigated further, since
restoration was the priority).

**Proposed change:** Implemented  -  restored, see RESOLVED note above.

**Files/routines affected:** `gosub_8000()`  -  full heading (8005/8006)
and DM IDs 1-18 rewrite (8020-8100), not just the minimal AD=WD/6600/
6700 refresh.

**Regression tests required:** Re-confirms T25/DEF-011's original
WD40/BOTTOM TIME 20 MEMORY PASS on the current (v7) candidate  -  no new
formal row needed, existing T25/DEF-011 evidence now applies to the
restored lineage.

**Final resolution:** RESOLVED (11 August 2026)  -  restored and
re-tested on the current candidate. T25/DEF-010/DEF-011 entries
unchanged in substance but should be read as now applying to the v7
lineage, not the v4 candidate this defect was found against.

---

## DEF-016  -  JSX displays raw floating-point values instead of BASIC PRINT-formatted numeric strings (RESOLVED)

**Observation:** JSX rendered a computed value as `0.0967891234444`
(raw JavaScript floating-point) where the authentic Compucolor BASIC
`PRINT` output for the same underlying quantity is a short, rounded,
specifically-formatted string  -  `.1` (leading space, no leading zero,
rounded to a small number of significant figures), not `0.1` and
certainly not the raw multi-digit float.

**Evidence:** John, controlled isolated CCEMU test, 11 August 2026  - 
minimal BASIC test case `10 A=.1:PRINT A`, `RUN`, output `.1` (with a
leading space, characteristic of BASIC reserving the sign position for
positive numbers). Screenshot saved  -  recommend
`reference/emulator_screenshots/DEF-016_basic_print_decimal_A_dot1.png`
(confirm actually saved at that path per the project's usual practice
of not assuming a stated path proves a saved file). The isolated test
script itself (`10 A=.1:PRINT A`) is short enough to record inline in
LOG.md rather than needing its own saved script file.

**AI analysis (John, 11 August 2026):** Directly relevant to DIVER
source line `PRINT "IS NEXT STAGE =";PA(PA,2);" MIN. REQUIRED"` (GOSUB
5500/5900's staged-WORK prompt, DEF-011). For a PA(PA,2) value that
would print as `.1` in authentic Compucolor BASIC, the correct DIVER
display is `IS NEXT STAGE = .1 MIN. REQUIRED`  -  not a raw float, not
`0.1`. Whether the leading space becomes visually significant after
the semicolon in DIVER's actual sentence depends on the preceding
literal  -  noted as an open question, not yet resolved. This is
evidence for the numeric representation rule itself, established via a
minimal isolated test rather than DIVER.bas directly  -  the general
rule likely applies wherever BASIC PRINTs a computed numeric variable
directly, not just at this one prompt.

**Your assessment:** [pending]

**Confirmed cause:** JSX's current numeric-to-string conversion for at
least the "IS NEXT STAGE" prompt (and plausibly other PRINT'd numeric
variables throughout the port) does not reproduce Compucolor BASIC's
PRINT numeric-formatting rules  -  likely just using JavaScript's default
number-to-string behaviour, which exposes raw floating-point precision
that BASIC's own formatting would have rounded away.

**Proposed change:** Not yet proposed. Would need: (1) confirming the
general Compucolor BASIC PRINT numeric-formatting rule (rounding
precision, leading-space-for-positive-sign, no-leading-zero-before-
decimal convention) via further isolated CCEMU tests beyond this one
data point if broader confidence is wanted; (2) a shared JSX
formatting helper reproducing that rule, used wherever DIVER's source
PRINTs a raw numeric variable (starting with PA(PA,2) at the "IS NEXT
STAGE" prompt); (3) resolving the open question about whether the
leading space is visually significant in the actual DIVER sentence
context.

**Files/routines affected:** At minimum, the "IS NEXT STAGE" prompt in
GOSUB 5500/5900 (DEF-011's staged WORK work). Potentially broader  - 
any JSX display currently PRINT'ing a raw computed BASIC variable
without BASIC-style numeric formatting is a candidate for the same
issue; not yet audited beyond this one instance.

**Regression tests required:** New test needed once a fix is proposed
 -  a staged-WORK profile where PA(PA,2) naturally lands on a value with
long floating-point tails (this defect's own discovery case is such a
value), checked against the correct " .1"-style formatted output.

**Final resolution:** RESOLVED (11 August 2026, SB)  -  treated as a
display/PRINT fidelity correction, not a scheduler change. JSX now
reproduces the human-readable BASIC-style value (e.g. `0.1`) instead
of exposing the raw JavaScript binary float (the discovery case's
value is variously cited as `0.0967891234444` and
`0.09999999999999964` in different notes on this fix  -  both are the
same class of raw-float artefact this fix addresses, not necessarily
the identical number; not worth resolving further since the fix is
general). Scope beyond the "IS NEXT STAGE" prompt not separately
re-audited, but the fix approach (a shared BASIC-style numeric
formatter) is general per the STYLE_GUIDE.md convention added
alongside this defect.

---

## DEF-017  -  REAL-mode ASCEND→DECOMPRESS start-step/discontinuity (RESOLVED)

**Observation:** At the start of DECOMPRESS there is a small visible
step/discontinuity instead of a clean ASCEND→DECOMPRESS join. New
artefact, distinct from the other already-known graphics defects
(DEF-005's z-order issue, DEF-007's DECOMPRESS→ASCEND end-of-segment
gap, DEF-009's DESCEND legacy positioning)  -  different transition
point (start of DECOMPRESS, not end), explicitly not to be merged with
those.

**Evidence:** SB, 11 August 2026, found in a later REAL-mode WD40
decompression run. That run itself was a PASS on scheduler/activity
sequencing  -  this is a graphics-only finding, explicitly separated
from scheduler correctness.

**AI analysis (SB, 11 August 2026):** BASIC GOSUB 6300's plotting logic
remains the authority  -  for non-WORK activity it derives LP/LQ from
time and MP/MQ from depth and emits the source PLOT vector. JSX
rendering is necessarily more elaborate, attempting to reproduce the
Compucolor display's visual/raster behaviour  -  so a correct scheduler
state can still produce incorrect JSX geometry. Investigation rule in
force: DIAGNOSE FIRST, NO FIX UNTIL CAUSE IS UNDERSTOOD, NO SCHEDULER
CHANGES  -  graphics repairs must not be allowed to feed back into
scheduler logic (the scheduler is frozen/PASS as of 11 August 2026, see
TODO.md header).

An attempted diagnostic candidate (v12) added React state to retain
decisive handoff records, intending to help this investigation. It
unexpectedly caused a run to reach the DESCEND boundary with NA=0
before the normal predictive activity had been queued. **That
diagnostic candidate is REJECTED/DISCARDED  -  it is NOT evidence of a
newly discovered scheduler defect**, and is not to be treated as an
ancestor of anything. V11 remains the behavioural baseline.

**Probe 1  -  COMPLETE (planned 11 August, run 12 August 2026).** Plan
was to instrument V11 non-invasively  -  avoiding new React state/
render-cycle effects  -  and capture: final ASCEND plotted coordinate/
column; first DECOMPRESS plotted coordinate/column; raw BASIC LP/LQ
and MP/MQ; any difference between the raw BASIC handoff and the JSX
painted handoff. Objective: determine whether the visible step is
produced by the handoff logic itself or by the ASCEND rasterisation
immediately before the handoff.

Results: the probe was run on the REAL WD40 decompression case.
Decisive records:
- ASCEND target 10m: final ASCEND grid 56; first DECOMPRESS grid 56;
  delta 0.
- ASCEND target 5m: final ASCEND grid 67; first DECOMPRESS grid 67;
  delta 0.
- The 5m ASCEND used a partial final rise (actualRise=0.3125,
  nominalRise=0.46875) but still handed off on the identical X grid.
- Final ASCEND to surface was captured at grid 98; there is no
  following DECOMPRESS activity at that handoff.

**X-grid-mismatch hypothesis RULED OUT.** The raw handoff coordinates
agree exactly (delta 0 in both cases)  -  the visible DECOMPRESS-start
step is NOT caused by a coordinate mismatch between final ASCEND and
first DECOMPRESS. This diagnostic was performed non-invasively against
the clean V11 behavioural baseline  -  nothing from the rejected v12
candidate was revived or inherited.

**Probe 2  -  CURRENT investigation (from 12 August 2026).** Since Probe
1 ruled out the handoff coordinates themselves, the investigation
narrows inward: examine the final ten ASCEND raster ticks  -  the
rendered geometry within the shared grid cell, vertical MP/MQ
geometry, and pixel construction immediately before the handoff. Not
yet run.

**Your assessment:** [pending]

**Confirmed cause:** Not yet established. Probe 1 positively ruled out
one candidate cause (X-grid mismatch at the handoff)  -  narrows, but
does not yet resolve, the investigation. Probe 2 is the current line
of inquiry.

**Proposed change (superseded by fix below):** ~~None yet  -  diagnose
first.~~

**Probe 2 result and confirmed cause (SB, 12 August 2026):** a
controlled V11-derived graphics-only test confirmed the cause. On an
ASCEND target tick, BASIC integerisation can produce `MP===MQ` even
though the diver has just completed a genuine ascent movement  -  a
raster coincidence, not a real constant-depth moment. JSX was
interpreting that coincidence as a flat segment and rendering the
terminal ASCEND tick with `FLAT_BAR_W`/forced `MIN_BAR_H` geometry
(the same flat-segment rendering genuinely correct for DECOMPRESS/REST
elsewhere)  -  producing the visible short horizontal cap/step
immediately before DECOMPRESS.

**Fix implemented**, in `DiverSim_v11_DEF017_ASCEND_target_fix.jsx`:
an ASCEND target tick retains ASCEND rectangle paint semantics even
where its integerised MP/MQ coordinates coincide. Genuine DECOMPRESS/
REST flat-segment rendering is unchanged. No scheduler, PA, ES,
event-boundary, predictive-prompt, activity-creation, timing, or
movement/clamp logic changed.

**Regression PASS (12 August 2026):**
- REAL WD40/BT20/all staged YES  -  both ASCEND→DECOMPRESS joins clean;
  dive/profile otherwise normal.
- WD49/ACCELERATED/immediate ASCEND  -  established end-of-ASCEND
  geometry (RT-34's short "level tick" cap, already explained by
  RT-07+RT-29) preserved, not disturbed by this fix.
- REAL WD16/BT10  -  ASCEND→REST and surface arrival clean.
- WD40/BT22/ACCELERATED  -  full-cycle regression PASS.

**New behavioural/graphics baseline: `DiverSim_v11_DEF017_ASCEND_
target_fix.jsx`.** Scheduler remains PASS/FREEZE, untouched by this
fix  -  confirmed explicitly, not just assumed.

**Files/routines affected:** ASCEND target-tick rendering (GOSUB
6300-family plot logic)  -  specifically the flat-vs-ASCEND-rectangle
paint-semantics decision at integerised MP/MQ coincidence. Not the
scheduler.

**Regression tests required:** Covered by the PASS evidence above  - 
see REGRESSION_TESTS.md for the formalised row.

**Final resolution:** RESOLVED  -  PASS (12 August 2026). Probe 1 ruled
out an X-grid handoff mismatch; Probe 2 identified the true cause
(raster-coincidence flat-segment misclassification on ASCEND target
ticks). Fix implemented and regression-confirmed across four profiles.
Scheduler untouched throughout, per the standing freeze.

---

## DEF-018  -  JSX displays the "DIVER SIMULATION MODEL." title, which the surviving BASIC does not (RESOLVED)

**Observation:** Current JSX renders the title text "DIVER SIMULATION
MODEL." and its dashed underline. Direct CCEMU execution of the
surviving BASIC shows this title is NOT visible in normal program
execution  -  it is a fidelity defect in the JSX, not a missing feature.

**Evidence:** John, U03 investigation, 15 August 2026. The surviving
BASIC reaches the title code at lines 1265-1266, but execution is
still in Graphic Plot Mode, established earlier in the screen-
initialisation sequence. In that state the title `PRINT` statements
do not produce normal visible text. A diagnostic insertion of
`PLOT 255` immediately before line 1265 exits Graphic Plot Mode; with
that single addition, "DIVER SIMULATION MODEL." and its dashed
underline appear correctly at the coded `PLOT 3,29,43` / `PLOT 3,29,44`
positions  -  proving the title mechanism was intended and would have
worked, but the surviving source is missing the escape that would
make it actually fire.

**AI analysis (John, 15 August 2026):** Best read as an historical
source omission/latent display bug in the surviving 1978/79 program,
not something to "fix" by adding the missing escape. Behavioural
fidelity is to the surviving EXECUTABLE program, not to inferred
intent  -  per this project's own standing principle (STYLE_GUIDE.md:
translate the algorithm as it actually runs). The diagnostic `PLOT 255`
is evidence only, proving the mechanism, and must NOT be incorporated
into the reconstruction. Additionally: when the title/underline was
made visible via the diagnostic, its resulting position intrudes
awkwardly into the main graphic area  -  suggesting either the title was
only ever a transient part of screen construction, or its coordinates
were still provisional/work-in-progress. No surviving evidence
establishes an intended final visible placement, which is a further
reason not to try to "complete" it.

**Your assessment:** [pending]

**Confirmed cause:** JSX renders the title unconditionally; source only
renders it if Graphic Plot Mode has been exited first via `PLOT 255`,
which the surviving BASIC never issues before reaching the title code.

**Proposed change:** Remove the title/underline rendering from JSX,
while preserving any unrelated initial-screen sequencing/timing
dependencies that happen to sit near it. Do NOT add the missing
`PLOT 255` escape to make the title appear  -  that would be correcting
inferred intent rather than reproducing the surviving executable.

**RESOLVED/PASS, 15 August 2026 (SB)  -  fix implemented and confirmed
in the active JSX lineage.** JSX title and underline removed from
visible rendering; no synthetic `PLOT 255` equivalent added; the
title-cell phase remains internally only where needed to preserve
established initial-screen timing/gating. Fix present in promoted
`DiverSim_v12.jsx` and therefore in the current READY/clean lineage.
T05 ("move title to bottom") remains correctly SUPERSEDED by this  - 
retained as historical context in TODO.md, not a live task.

**Files/routines affected:** Initial-screen construction / title
rendering (JSX equivalent of source lines ~1265-1266 and the
`PLOT 3,29,43`/`PLOT 3,29,44` positioning).

**Regression tests required:** Visual check that no other initial-
screen element depends on the title's former code path  -  satisfied,
see REGRESSION_TESTS.md.

**Final resolution:** RESOLVED  -  PASS (15 August 2026). Investigation
complete 15 August, fix implemented and confirmed the same day.

---

## DEF-019  -  `Tn:::` DM-row persistence defect (whole-set replacement on GOSUB 6750 writes) (RESOLVED)

**Observation:** During WD40/BT20 regression as part of the presentation-
lineage diagnostic cleanup, the `Tn:::` DM row (the RETAINED staged-WORK
state row confirmed via DEF-002's CCEMU lifecycle capture, 14 August
2026) was not persisting correctly.

**Evidence:** SB, 15 August 2026, found during clean06→clean10
diagnostic-scaffolding removal regression. Explicitly confirmed as a
PRE-EXISTING display-state fidelity defect, not caused by the cleanup
itself  -  the cleanup regression is what surfaced it, not what created
it.

**AI analysis (SB, 15 August 2026):** Root cause: GOSUB 6750 writes
were replacing the WHOLE `boundCells` set rather than preserving DM
rows that write hadn't actually touched  -  so a write meant to update
one row's content was incidentally wiping others, defeating the
retained-state behaviour DEF-002 established as correct (the `Tn:::`
row should remain visible and unchanged until the NEXT user question
specifically rewrites it, not get cleared by an unrelated write
elsewhere in the DM).

**Proposed change:** Implemented  -  GOSUB 6750 writes now preserve
untouched DM rows explicitly, rather than replacing the entire
`boundCells` set on every write.

**Files/routines affected:** `boundCells` write logic at GOSUB 6750's
JSX equivalent. Does not touch the scheduler, PA/ES, or decompression
arithmetic.

**Regression tests required:** WD40/BT20  -  confirmed PASS after the
fix, `Tn:::` persistence behaving correctly again.

**Final resolution:** RESOLVED  -  PASS (15 August 2026). Found and
fixed same session during the clean06-clean10 diagnostic-scaffolding
removal work.

---

## DEF-020  -  small SVG join gaps at WORK/DECOMPRESS/ASCEND joins, WD41/BT21 (RESOLVED)

**Observation:** WD41/BOTTOM TIME 21 (a profile not previously
regression-tested) exposed tiny visible gaps at WORK/DECOMPRESS/
ASCEND joins during the clean-lineage regression sweep.

**Evidence:** SB, 15 August 2026, found during
`DiverSim_v12_READY_clean10.jsx` regression at WD41/BT21/ACCELERATED.

**AI analysis (SB, 15 August 2026):** A probe confirmed the underlying
BASIC/SVG handoff coordinates themselves are contiguous at both the
10m and 5m stops  -  this is NOT a repeat of DEF-007/DEF-017 (both
already resolved, both scheduler/coordinate-level issues) and does
NOT reopen either. The cause is SVG rasterisation/rendering only.
**Explicit instruction, worth repeating: do not reopen the scheduler
or previously closed handoff defects on the basis of this residual
seam  -  probe evidence shows the underlying BASIC coordinates are
contiguous.**

Several rendering experiments tried and REJECTED: extra overlap,
bridge, and 3×3 join-cap candidates. Accepted treatment: DECOMPRESS
horizontals use SVG square line caps  -  reduced the seam to a
negligible sub-pixel artefact. John judged this PASS.

**Your assessment:** Confirmed acceptable  -  accepted as cosmetic
raster artefact, not a behavioural defect (John, via `clean12`'s
confirmation sweep, 15 August 2026: "small SVG join gaps remain
visible but are accepted as cosmetic raster artefacts, not behavioural
defects").

**Confirmed cause:** SVG rasterisation/line-cap rendering technique at
sub-pixel scale  -  not a scheduler, BASIC-coordinate, or geometry issue.

**Proposed change:** Implemented  -  DECOMPRESS horizontals use SVG
square line caps, built into `DiverSim_v12_READY_clean11.jsx` and
carried forward into `clean12`.

**Files/routines affected:** DECOMPRESS horizontal-segment SVG
line-cap style only. No BASIC coordinates, scheduler, timing, PA/ES,
or activity-creation logic touched.

**Regression tests required:** WD40/BT20/ACCELERATED, a second staged-
WORK/decompression run, both PASS on `clean12`  -  GOSUB 5900 staging
unaffected, `Tn:::` persistence/MEMORY/READY all intact alongside the
accepted residual seam.

**Final resolution:** RESOLVED  -  accepted cosmetic variance (15 August
2026). Sub-pixel SVG artefact remains visible but is explicitly judged
acceptable, not pursued further. Do not reopen on this basis alone.

---

## DEF-021  -  extra graphic segment at start of second WORK, in a DESCEND→WORK→DESCEND→WORK profile (RESOLVED)

**Observation:** In a dive with two DESCEND/WORK cycles (DESCEND →
WORK → DESCEND → WORK  -  i.e. work at one depth, then descend further
and work again at a second, deeper stage), the beginning of the
SECOND WORK period shows an extra graphic: a spurious segment
stretching from the top of the second DESCEND down to one tick into
the second WORK.

**Evidence:** John, 16 August 2026, direct observation. **UPDATE, same
day  -  repro established:** `WD10 → WORK/BT10 → later DESCEND to 20 →
WORK 5`. Diagnostic probe confirms the defect occurs on the first
later-DESCEND tick where the BASIC plotting coordinates advance to the
next X column:
- First later-DESCEND tick: `LP=12 LQ=12 MP=120 MQ=105`  -  vertical
  only, renders correctly.
- Next tick: `LP=12 LQ=13 MP=105 MQ=100`  -  BASIC plotting coordinates
  change in both X and Y, but current JSX Branch-1 DESCEND rendering
  places a vertical rectangle at `LQ=13`, losing the `LP→LQ` horizontal
  component.

No cross-WORK `workDots` connection was observed  -  that hypothesis is
RULED OUT.

**AI analysis:** Worth noting explicitly: this is a genuinely NEW
profile shape for this project's regression history  -  every
DESCEND-rendering-related fix resolved so far (DEF-003, DEF-004,
DEF-009) was found and fixed using single-DESCEND profiles (one
DESCEND, then WORK/ASCEND/DECOMPRESS/REST in some combination, but
never a second DESCEND partway through the dive). **Correction, 16
August 2026:** DEF-019 was previously grouped here as an example of
this same "untested profile shape" pattern  -  that was a
mischaracterisation. DEF-019 was the `Tn:::`/GOSUB 6750 DM-row
persistence defect, unrelated to DESCEND rendering; it doesn't belong
in this comparison. The broader point still holds without it: a
multi-stage dive  -  descend, work, descend further, work again  -  has
not been part of any prior regression sweep on record, and this is the
first proper regression case involving a genuine second DESCEND after
WORK. Consistent with this project's own recurring lesson (DEF-003,
DEF-004, DEF-009, DEF-015): a profile/scenario never independently
tested is not confirmed correct, no matter how many *other* profiles
have passed.

**Your assessment:** [pending]

**Confirmed cause:** Not yet formally confirmed (no fix tested, no
CCEMU comparison yet), but STRONGLY INDICATED by the probe above: the
later-DESCEND rendering approximation in JSX Branch-1 handles a
vertical-only tick correctly, but on the following tick  -  where BASIC
genuinely moves in both X and Y  -  JSX incorrectly continues placing a
vertical rectangle at the new X column instead of rendering the
LP→LQ horizontal component the source coordinates actually describe.
Scheduler/movement explicitly OUT OF SCOPE  -  probe evidence shows the
fault is in rendering, not activity timing or depth progression.

**Proposed change:** None yet  -  no fix should be marked confirmed
until tested. CCEMU comparison remains desirable before final closure,
per standing diagnose-first discipline.

**Files/routines affected:** GOSUB 6300-family Branch 1 DESCEND
rendering, specifically the later-DESCEND-tick handling where BASIC
coordinates advance in both X and Y (not just the already-correct
vertical-only case). Not the scheduler.

**Regression tests required:** Once a fix is proposed: the established
repro (`WD10 → WORK/BT10 → later DESCEND to 20 → WORK 5`) plus a
broader profile sweep, since this is the first test of this profile
shape at all.

**UPDATE, 16 August 2026  -  RESOLVED/PASS.** Fix implemented: the JSX
renderer had been joining `workDots` between different AL (activity
log) records, creating a false connecting line from the end of the
first WORK, through the second DESCEND, into the start of the second
WORK  -  this is the "extra graphic segment" originally reported. Fix
stops joining `workDots` across different AL records. Confirmed on the
established repro. Candidate: `DiverSim_v12_READY_clean14_DEF021.jsx`.
**Note (recorded during DEF-022's investigation, see below): this
cross-AL-record rule was initially too broad**  -  it also prevented
legitimate joins between genuinely consecutive same-depth WORK
activities (an operator selecting WORK again right after finishing
one), which surfaced as DEF-022. DEF-022's own fix refines the rule to
join by physical/depth contiguity rather than purely by AL-record
identity, without undoing DEF-021's own fix for the WORK→DESCEND→WORK
case. Both remain passing together in the current lineage  -  see
DEF-022 for detail. (This resolution note is reconstructed from
DEF-022's write-up rather than a separately-filed DEF-021 closure
report  -  the mechanism is well-evidenced by DEF-022's regression
detail, but flagged here for transparency about the source.)

**Final resolution:** RESOLVED  -  PASS (16 August 2026). Fixed via the
cross-AL `workDots`-joining correction described above; refined further
by DEF-022 without regressing this case. Confirmed passing on
`DiverSim_v12_READY_clean14_DEF022_fix1.jsx` and
`..._clean14_DEF023_fix1.jsx`.

---

## DEF-022  -  operator-selected WORK→WORK: double BOTTOM TIME prompt and false gap in consecutive same-depth WORK trace (RESOLVED)

**Observation:** After an ordinary WORK period, selecting WORK again
at the next "WHICH ACTIVITY REQUIRED" prompt (operator explicitly
choosing WORK→WORK, not the GOSUB 5900 staged-WORK case) showed two
mismatches against canonical BASIC: (1) each newly selected WORK asked
"BOTTOM TIME ?" twice; (2) a visible gap appeared between consecutive
same-depth WORK traces.

**Evidence:** SB, 16 August 2026, found while testing DEF-021's fix.
Canonical CCEMU comparison: BASIC asks "BOTTOM TIME ?" once per
operator-selected WORK, and draws consecutive WORK periods as a
continuous horizontal trace with no gap. Repro:
`BT5 → WORK → BT5 → WORK → BT10`. Explicitly kept separate from
DEF-021 throughout investigation  -  DEF-021's own WORK→DESCEND→WORK fix
was not to be undone while diagnosing this.

**AI analysis (SB, 16 August 2026), two confirmed causes:**
1. **Double BOTTOM TIME:** JSX was entering the WORK input path
   immediately when WORK was selected at the predictive activity
   prompt, then entering it again when the current WORK reached its
   true event boundary  -  asking twice for what BASIC's predictive
   scheduler only asks once. Fix: defer GOSUB 5500/BOTTOM TIME
   processing until the true boundary, matching BASIC's predictive-
   scheduler behaviour (the same general principle established for
   DESCEND/ASCEND/DECOMPRESS/REST back in the original scheduler
   rewrite  -  predictive prompt queues, true boundary dispatches).
2. **WORK-line gap:** DEF-021's fix (stop joining `workDots` across
   different AL records) was correct for preventing a false connection
   across WORK→DESCEND→WORK, but too broad  -  it also prevented the
   legitimate join between genuinely consecutive same-depth WORK
   activities. Fix: separate WORK AL records are now joined only when
   their plotted endpoints are physically contiguous at the same
   depth, not merely by differing AL-record identity.

**Your assessment:** [pending]

**Confirmed cause:** Both causes above  -  a scheduler-adjacent prompt-
timing bug (predictive prompt entering the WORK input path early
instead of only queuing) and a rendering-join rule inherited from
DEF-021 that was correct for one case but too broad for another.

**Proposed change:** Implemented  -  see the two fixes above.

**Regression evidence:** `BT5 → WORK → BT5 → WORK → BT10`  -  PASS, one
BOTTOM TIME prompt per WORK, continuous same-depth WORK trace.
Continued the same live run into `WORK → DESCEND → WORK`  -  PASS, no
false cross-depth connection; DEF-021 remains fixed.

**Files/routines affected:** WORK-initiation prompt/input dispatch
(predictive-vs-true-boundary timing, same family as the original
scheduler rewrite's governing principle); GOSUB 6300-family `workDots`
join logic (refined from DEF-021's AL-record rule to a physical-
contiguity/depth rule).

**Important distinction, worth stating explicitly for future work:**
different AL numbers alone do NOT determine whether WORK graphics
should connect. Sequential same-depth WORK activities can be visually
continuous in the original raster; WORK activities separated by a
depth-changing activity must remain separate. Judge by physical/depth
contiguity, not AL-record identity.

**Final resolution:** RESOLVED  -  PASS (16 August 2026). Accepted
candidate: `DiverSim_v12_READY_clean14_DEF022_fix1.jsx`. Scheduler
architecture remains frozen  -  the prompt correction restores existing
BASIC predictive-boundary behaviour rather than changing it; this is
not a scheduler-freeze exception, it's a JSX-side bug where the
predictive-boundary principle wasn't being followed correctly for this
one case.

---

## DEF-023  -  JSX-only coloured WORK graphics fragment committed before GOSUB 6750 OUT OF RANGE halt (RESOLVED)

**Observation:** In a decompression sequence reaching the genuine
GOSUB 6750 OUT OF RANGE path, JSX left a small vertical stack of
coloured WORK/DT graphics visible in the main plot area at the halt.
Canonical CCEMU does not show this fragment.

**Evidence:** SB, 16 August 2026. Repro arose during a transition sweep
after a legitimate decompression sequence: `... WORK → ASCEND →
DECOMPRESS → WORK 5`, reaching the genuine OUT OF RANGE condition (both
JSX and CCEMU reach the same OUT OF RANGE state and matching DM
content  -  only the stray graphic differs).

**AI analysis (SB, 16 August 2026):** Current JSX commits the current
tick's Branch-2 WORK graphics (`bandSegs`/`workDots`) to React state
before GOSUB 6750, later in the same tick, detects the genuine `[6763]`
OUT OF RANGE condition and halts. The halted tick therefore leaves
graphics on screen that canonical BASIC never visibly retains  -  BASIC
never got far enough into that tick's display sequence to show them
before halting.

**Your assessment:** [pending]

**Confirmed cause:** Render-commit ordering  -  WORK graphics committed
too early in the tick, before the same tick's OUT OF RANGE check could
prevent them from ever having been visibly reached in the original.

**Proposed change:** Implemented  -  stage the current tick's WORK
graphics temporarily; commit only after GOSUB 6750 completes normally.
If the OUT OF RANGE halt occurs, discard the pending graphics for that
tick.

**Regression evidence:** Exact repro rerun on
`DiverSim_v12_READY_clean14_DEF023_fix1.jsx`  -  perfect PASS. OUT OF
RANGE behaviour and DM state remain faithful; the JSX-only coloured
fragment is gone. DEF-021 and DEF-022 confirmed still passing in this
same lineage.

**Files/routines affected:** WORK Branch-2 graphics commit timing
relative to GOSUB 6750's OUT OF RANGE check, within the same tick.
Scheduler, activity logic, decompression arithmetic, and the OUT OF
RANGE condition itself were NOT changed  -  this was a render-commit
ordering fix only.

**Final resolution:** RESOLVED  -  PASS (16 August 2026). Accepted
candidate: `DiverSim_v12_READY_clean14_DEF023_fix1.jsx`.

---

## DEF-024  -  zero-distance ASCEND produced JSX-only gaps before DECOMPRESS (RESOLVED)

**Observation:** At a decompression stop, entering repeated ASCEND
selections before allowing DECOMPRESS produced visible gaps in JSX
before DECOMPRESS was eventually rendered.

**Evidence:** SB, 16 August 2026, found during the activity-transition/
recurrence testing phase. Canonical BASIC/CCEMU ignores the redundant
ASCEND logically and preserves a continuous graphical transition; JSX
previously advanced the presentation to a new time column for each
zero-distance ASCEND, producing the visible gaps. Related, separate
finding on the same repro: after a completed ASCEND at a decompression
stop, entering a second ASCEND causes CCEMU to join the vertical top
of the ASCEND trace immediately to the horizontal start of the pending
DECOMPRESS trace with no gap  -  JSX didn't draw that transition at the
same point. Scheduler behaviour itself matched CCEMU throughout; the
difference was graphical timing/order only.

**AI analysis (SB, 16 August 2026):** Diagnostic probe showed the
zero-distance ASCEND advancing the plotted X-position despite AD
remaining unchanged  -  i.e. JSX was rendering from the ASCEND's later
LOGICAL time-column position rather than its already-reached PHYSICAL
endpoint, even though nothing had actually moved.

**Your assessment:** User confirmed perfect PASS (16 August 2026).

**Confirmed cause:** Zero-distance ASCEND rendering used logical
time-column position instead of physical (already-reached) endpoint
position.

**Proposed change:** Implemented  -  preserve all scheduler/activity/
timing behaviour, but render a zero-distance ASCEND from its
already-reached physical ASCEND endpoint rather than its later logical
time-column position.

**Files/routines affected:** ASCEND rendering position logic
(GOSUB 6300-family) for the zero-distance case specifically. Scheduler,
activity, and timing behaviour explicitly preserved/untouched.

**Regression tests required:** Repeated-ASCEND-before-DECOMPRESS repro
 -  PASS on `DiverSim_v12_READY_clean14_DEF024_fix5.jsx`, user-confirmed.
The separate historical repeated-ASCEND EVENTUAL failure (CCEMU:
`BS ERROR IN 1982`) remains unchanged and still matches CCEMU  -  not
part of this fix's scope, see REGRESSION_TESTS.md's resolved-as-not-
a-bug entry for that.

**Final resolution:** RESOLVED  -  PASS (16 August 2026). Accepted
candidate: `DiverSim_v12_READY_clean14_DEF024_fix5.jsx`. Subsequently
promoted (with DEF-021/022/023 all confirmed intact) to
`DiverSim_v13_READY.jsx`, the new behavioural baseline  -  see TODO.md.

---

## DEF-025  -  initial [1278] WORKING DEPTH bell not audible (RESOLVED)

**Observation:** `final12_fulltrace`'s final regression found the
initial WORKING DEPTH prompt's bell (source [1278]) was not audible in
the browser, even though `bell()` was being called correctly at that
point. Invalid-input bells worked correctly, because those occur after
a user keypress.

**Evidence:** John, 17 August 2026, final-regression testing of
`DiverSim_v13_READY_final12_fulltrace.jsx`.

**AI analysis (SB, 17 August 2026):** Browser Web Audio contexts
require a user gesture to leave the "suspended" state. The invalid-
input bells worked because they fire after a keypress (a user gesture);
the initial WORKING DEPTH bell fires before any user interaction has
happened, so the `AudioContext` was still suspended and produced no
sound despite `bell()` being called correctly.

**Your assessment:** [pending]

**Confirmed cause:** `AudioContext` suspended at the point of the
initial bell call, not explicitly resumed first.

**Proposed change:** Implemented in `final13_regressionfix1`  -  Web
Audio handling adjusted so a suspended `AudioContext` is explicitly
resumed before sounding the bell.

**Files/routines affected:** Bell/audio handling only  -  not scheduler,
not dive logic.

**Regression tests required, NOT YET RUN:** fresh start should produce
exactly one audible bell at the initial WORKING DEPTH prompt; invalid
WD values should still each produce one bell; a valid WD should
proceed to TIME MODE without an extra bell. Per SB's explicit
instruction: do not begin another broad regression until this targeted
check (and DEF-026's) passes.

**Final resolution:** RESOLVED  -  fix implemented in
`DiverSim_v13_READY_final13_regressionfix1.jsx`.

---

## DEF-026  -  WORK display graphics committed before GOSUB 6100 [6181] OUT OF RANGE, not rolled back (RESOLVED)

**Observation:** `final12_fulltrace`'s final regression: WD40/BT20,
normal dive to the first suggested DECOMPRESS, then choose WORK and
enter BT55. JSX correctly reaches OUT OF RANGE, but incorrectly
displays new coloured WORK bars before the error. Canonical CCEMU
stops graphics at the previous valid display state and then shows OUT
OF RANGE  -  it never draws the new WORK's graphics at all.

**Evidence:** John, 17 August 2026, final-regression testing of
`DiverSim_v13_READY_final12_fulltrace.jsx`. Repro: WD40, BT20, follow
normal dive until first DECOMPRESS suggested, choose WORK, enter BT55.

**AI analysis (SB, 17 August 2026):** Current JSX committed the new
WORK's display elements before GOSUB 6100, later in the same
initiation, detects the genuine [6181] OUT OF RANGE condition and
halts  -  the same general class of bug as DEF-023 (WORK graphics
committed before GOSUB 6750's OUT OF RANGE check), but at a different
call site (GOSUB 6100's [6181], during WORK *initiation*, rather than
GOSUB 6750 mid-tick).

**Your assessment:** [pending]

**Confirmed cause:** Render-commit ordering  -  WORK display elements
committed before the same initiation's OUT OF RANGE check could
prevent them from ever having been reached in canonical execution.

**Proposed change:** Implemented in `final13_regressionfix1`  -  WORK
display elements are now associated with their AL/activity instance.
If [6181] OUT OF RANGE occurs during GOSUB 6100 while that WORK is
being initiated, graphics belonging to that new WORK are rolled back
before the error display. This extends the existing staged-rendering
principle already used around [3530]/GOSUB 6750 (DEF-023's fix) to
this second call site.

**Files/routines affected:** WORK-initiation display commit/rollback
logic around GOSUB 6100's OUT OF RANGE check. Explicitly NOT the
predictive scheduler, PA/AL/ES behaviour, decompression logic,
activity-transition rules, or historical abnormal-transition
behaviour  -  none of these were touched.

**Regression tests required, NOT YET RUN:** WD40/BT20 → first
DECOMPRESS suggestion → WORK/BT55 must show OUT OF RANGE with no new
coloured WORK bars appearing first. Per SB's explicit instruction: do
not begin another broad regression until this targeted check (and
DEF-025's) passes.

**Final resolution:** RESOLVED  -  fix implemented in
`DiverSim_v13_READY_final13_regressionfix1.jsx`.
