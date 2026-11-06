# DIVER.BAS Reconstruction  -  Regression Test Register
# Established 28 July 2026, per John, alongside DEFECT_REGISTER.md and the DiverSim_Archive "Known Good" baseline. Rows are cumulative; later entries identify the exact accepted candidate and date.
# Current confirmed baseline is final24 (20 August 2026). Re-run relevant rows after ANY change, however small  -  per John's own principle: make the smallest possible change, then demonstrate all previously verified behaviour remains intact, before calling anything done.
#
# Source for every row: TESTING_PLAN.md (full mechanism detail) and LOG.md (dated narrative). This register is the compressed, pass/fail-oriented view  -  read TESTING_PLAN.md for the reasoning behind any row.
---

## How to use this

Before shipping any change, identify which rows touch the routine(s)
being changed (same GOSUB, same DM cells, same shared state) and re-run
those specific tests, not just the one the change was aimed at  -  several
of this project's real bugs so far (the 6950/6750 and 6850/6750 DM-cell
collisions, T35) were exactly this: a correct change to one routine
silently breaking another that shared state with it.

## Reference test profiles in use

- **WD40/BT22/ACCELERATED**  -  the most heavily-used profile. One WORK
  period, forces two DECOMPRESS stops. First full-cycle confirmation
  used this. Reaches 40m in 6 ticks (ACCELERATED, DR=30, TK=0.25).
- **WD18/BT10/ACCELERATED**  -  Scenario A, no decompression obligation.
  Used to exercise GOSUB 6850 Branch A specifically.
- **WD1/BT30, WD16/BT40, WD49 (immediate ASCEND), WD35, WD10/BT45,
  WD30/BT50**  -  T33/T34/T35 family repro cases, evidence in
  `reference/emulator_screenshots/`.

---

## Coordinate / rendering fundamentals

| ID | Test | Profile | Expected output | Source |
|----|------|---------|-----------------|--------|
| RT-01 | DESCEND reaches target depth, ACCELERATED | WD40, DR=30, TK=0.25 | 6 ticks to AD=40 (7.5m/tick, clamped on tick 6) | LOG.md 05/24 Jul; EVIDENCE_TO_PRESERVE.md T18_ACCEL_6tick_trace.txt |
| RT-02 | DESCEND reaches target depth, REAL | WD40, DR=30, TK=1/32 | 43 ticks to AD=40 (0.9375m/tick, clamped on tick 43) | Same as above; T18_REAL_43tick_trace.txt |
| RT-03 | Depth gauge digits + trend bar (GOSUB 6600) | any | Digits track AD each tick; trend bar reflects direction | T19, TESTING_PLAN.md |
| RT-04 | Air gauge (GOSUB 6700, ID=22) | any, including deep past VA<0 | 18-block bar updates each tick; **freezes at last valid reading when VA<0, does not blank** (T43 fix) | T20, TESTING_PLAN.md; LOG.md 27 Jul |
| RT-05 | Coloured-band mountain (GOSUB 6300 Branch 2) | WORK activity, appropriate WD/DT | Renders per T24a-d mechanism; Branch selector at line 6312 (`AL(AL,1)=3`) | T24a-d, TESTING_PLAN.md |
| RT-06 | ASCEND depth-update (T18c) | any ASCEND | AD updates tick-by-tick during ASCEND (mirrors DESCEND via AR) | LOG.md 17 Jul |
| RT-07 | Minimum bar height + full-width flat segments | DECOMPRESS stop (flat depth) | 2px floor, no 1px crisp-edge trim on flat segments | LOG.md 17 Jul |
| RT-32 | WORK→ASCEND track handoff, no position gap (DEF-003) | WD1/BT10, WD1/BT30, WD40/BT22 | Branch 1's `+1` offset suppressed on the tick immediately after Branch 2/WORK fires (`justLeftWorkRef`); no gap or overlap at the handoff; dive-start DESCEND case (`+1` offset itself) unaffected | LOG.md, DEFECT_REGISTER.md DEF-003, 28 Jul |
| RT-33 | DESCEND→WORK track continuity | WD16/BT40 | No discontinuity; profileSegs/workDots data consistent | LOG.md, TODO.md T36, 28 Jul |
| RT-34 | DESCEND→ASCEND (no WORK) track, short "level tick" at ASCEND's end | WD49, immediate ASCEND | A short flat cap at the end of the line is expected  -  explained by RT-07 (isFlat/MIN_BAR_H) firing during RT-29 (AD/IK look-ahead margin), not a defect. Explanation lives here, not as a code comment  -  John's policy (28 Jul) excludes cross-reference comments from DiverSim.jsx. | LOG.md, TODO.md T37, 28 Jul |

## DM box  -  display routines

| ID | Test | Profile | Expected output | Source |
|----|------|---------|-----------------|--------|
| RT-08 | GOSUB 6750, NOSTOP/time-to-next-bound | DESCEND or WORK | Cycles correctly through multiple DT bounds; hits genuine OUT OF RANGE halt when row exhausted | T21, TESTING_PLAN.md |
| RT-09 | GOSUB 6750 cell persistence | activity changes away from DESCEND/WORK (e.g. into ASCEND/DECOMPRESS/REST) | boundCells **left untouched**, not blanked (fixed 27 Jul  -  was the "T-line reverts" bug) | LOG.md 27 Jul, T21 addendum |
| RT-10 | GOSUB 6950, STOP10/STOP5 (T26c-3) | WORK-initiation | ~~Correct label + countdown written once at WORK start; STOP10 vs STOP 5 per DX at that moment~~ **REWRITTEN 12 August 2026  -  the "once at WORK start" framing is obsolete, not cosmetic wording.** GOSUB 6950 is called TWICE per WORK-initiation (source lines 1693/1694), and GOSUB 5900 (DEF-011) means a single BOTTOM TIME request can create several genuine, successive WORK-initiations, each independently re-entering 6950 twice. CCEMU-confirmed for WD40/BOTTOM TIME 20: eight total 6950 entries across four staged WORK activities (two per stage), label content per stage governed by that stage's own HT/DX (blank when HT=0/DX=0; STOP10 when HT=10/DX=5 in this profile). Expected behaviour is now: STOP10/STOP5 reflects the CURRENT stage's HT/DX, refreshed at every staged WORK-initiation, not written once at dive start and left alone. See DEFECT_REGISTER.md DEF-002 (mechanism confirmed)  -  whether the JSX DM content itself visibly reflects this per-stage refresh is DEF-002's own still-open question, distinct from this row's now-corrected expectation. | LOG.md 10/12 Aug; DEFECT_REGISTER.md DEF-002 |
| RT-11 | GOSUB 6950/6750 DM-cell collision gate | same tick WORK begins | 6950's write is NOT immediately overwritten by 6750 on the same tick (nostopEventCellsRef) | LOG.md 17 Jul |
| RT-12 | GOSUB 6100, decompression-bound check (T26c-2) | WD40/BT22 (two profiles hand-verified) | HT=10, DX=5, D5=20 for the standard profile; matches DT table exactly | LOG.md 16/17 Jul |
| RT-13 | GOSUB 6850, Branch A (T26c-4) | WD18/BT10, ACCELERATED | boundary(11)<=DT_I6_1(57) selects Branch A; D5=DX=0; "time to next bound" NNN:SS at IDs 7-12 | LOG.md 27 Jul |
| RT-14 | GOSUB 6850, Branch B (T26c-4) | WD40/BT22 | D5=20, DX=5 → "T25" + three colons (IDs 7-10 + 10-12); fires once at WORK-initiation | LOG.md 24/27 Jul |
| RT-15 | GOSUB 6850/6750 DM-cell collision gate | same tick as RT-14 | Same one-shot gate pattern as RT-11, on row 2 (IDs 7-12) | LOG.md 24 Jul |
| RT-16 | GOSUB 6800, DT countdown (T30) | WD40/BT22, DECOMPRESS stop | LAST fires once at tick=101 (HT:10,D5:20); row unchanged at fireCount=189 (~88 ticks later), spans the whole stop | LOG.md 28 Jul |
| RT-17 | GOSUB 6800/DX-vs-D5 selection | HT=10 throughout a stop | DX decremented (5→~0), D5 stays constant (20)  -  matches displayed "T20:15" | LOG.md 28 Jul |
| RT-18 | GOSUB 7500, HT step-down (T28) | DECOMPRESS-end | HT steps 10→5 as each stop completes | LOG.md 16/24 Jul, T28 |
| RT-19 | GOSUB 6250, decompression-time-remaining (T26d) | WD40/BT22, one-decompress-stop profile | LAST fires once (HT:10,D5:20,wroteCells:6); row 3 unchanged across the whole stop; never fires twice with only one DECOMPRESS event | LOG.md 28 Jul |
| RT-20 | GOSUB 6250/6800/6850 row-2/row-3 merge | any combination firing in sequence | Each merges into its OWN row (2 or 3) of boundCells, does not blank the other row | LOG.md 24/27/28 Jul (fixed for 6250; **6850/6800's own call sites NOT YET CHECKED for the mirror-image case  -  see TODO.md flag**) |
| RT-21 | T26b, ASCEND-initiation DM-blanking | WD40/BT22, ASCEND begins | Row 3 (IDs 13-18) blanks the instant the AL-create event for ASCEND fires  -  correlates exactly with the event log entry | LOG.md 28 Jul |
| RT-22 | GOSUB 6100 OUT OF RANGE halt (T35 fix) | WD30/BT50 | Clean "OUT OF RANGE" display, no JS crash, fireCount genuinely stops climbing (interval halt takes effect) | LOG.md 28 Jul |

## Input / dispatch mechanics

| ID | Test | Profile | Expected output | Source |
|----|------|---------|-----------------|--------|
| RT-23 | T27a/b/d/e, four of five NEXT-routines | various | All confirmed via LOOPTRACE/live testing | TESTING_PLAN.md T27a-e |
| RT-24 | T27c, WORK NEXT (GOSUB 5500) | full cycle run | `gosub_5500_start()` fires correctly as part of DESCEND→WORK→ASCEND→DECOMPRESS→REST | LOG.md 16/17 Jul |
| RT-25 | T26 dispatch arithmetic, all five branches | any | `AL(P,7)` computed correctly for DESCEND/ASCEND/WORK/DECOMPRESS/REST initiation | LOG.md, TODO.md correction 24 Jul |
| RT-26 | REST reaches scheduled boundary, does not self-chain | REST reached, no further activity queued | REST runs to its own scheduled duration and terminates via `GOSUB 8000` then `END` (source lines 1800-1820)  -  does NOT route back to REST | LOG.md 08 Aug; DEFECT_REGISTER.md DEF-006 |
| RT-27 | FOR HOW LONG asked exactly once per REST period | full cycle run, and WORK→REST override | Single prompt only; no second `FOR HOW LONG`; entered duration becomes REST's own duration; confirmed on both the standard WD40/BT22 cycle and the deliberate WORK→REST override (HT=10 established, no DECOMPRESS created  -  accepted REST choice overrides suggested successor) | LOG.md 08 Aug; DEFECT_REGISTER.md DEF-006 |

**REWRITTEN 08 August 2026 (John/SB)  -  supersedes prior wording.** The
original RT-26/RT-27 (below, struck through for the record, not
deleted) encoded a REST→REST self-chain expectation that a fresh
source check found contradicts BASIC lines 1800-1820, where REST
reaches `GOSUB 8000` and `END`. `DiverSim_REST_scheduler_v1.jsx` was
tested against the corrected expectation above and passed on both
tested paths (standard full-cycle and WORK→REST override). Prior
wording, kept for the historical record only, not a live requirement:
  - ~~RT-26 (old): REST routes back to REST unconditionally (source
    [5730])  -  confirmed architectural, not a bug.~~
  - ~~RT-27 (old): No spurious activity-required prompt between
    consecutive RESTs; AL(AL,1)=5/NA=5 correct; auto-default log entry
    fires.~~

## Full end-to-end

| ID | Test | Profile | Expected output | Source |
|----|------|---------|-----------------|--------|
| RT-28 | Full activity cycle | WD40/BT22, ACCELERATED | DESCEND → WORK (mountain + dashed track) → ASCEND → DECOMPRESS (stop 1) → ASCEND → DECOMPRESS (stop 2) → ASCEND → REST → END, all transitions/routing/drawing correct | LOG.md 17 Jul (first achieved), confirmed repeatedly since; ending corrected 08 Aug per DEF-006 |

**CORRECTED 08 August 2026**  -  this row's ending was `... → REST →
REST`; rewritten to `... → REST → END` following the RT-26/RT-27
correction above (REST terminates via `GOSUB 8000`/`END`, does not
self-chain). Confirmed on the standard WD40/BT22 path in
`DiverSim_REST_scheduler_v1.jsx`'s own test (SB, 08 August 2026). Note
`GOSUB 8000`'s MEMORY/end-of-dive display was separately unimplemented
at the time this row was corrected  -  this row confirmed the scheduler
reaches `END` correctly, not that the display was complete. **UPDATE,
same day:** MEMORY has since been implemented and CCEMU-verified
independently (see DEFECT_REGISTER.md DEF-011, TODO.md T25); a minor
cosmetic issue remains as DEF-010.

## Resolved-as-not-a-bug (no fix, but behaviour is settled  -  worth re-checking stays settled)

| ID | Test | Profile | Expected (settled) behaviour | Source |
|----|------|---------|-------------------------------|--------|
| RT-29 | AD/IK look-ahead margin | ASCEND, boundary approach | Prompt fires slightly before AD reaches true target (IK margin)  -  faithful, not a bug; no UX indicator added (John's explicit decision) | LOG.md 17 Jul |
| RT-30 | Activity-prompt pause gate | any activity prompt shown | Entire tick loop pauses, including GOSUB 6800  -  matches BASIC's blocking INPUT exactly | LOG.md 27 Jul |
| RT-35 | 20m/21m decompression-stage boundary | WD20/WORK40 vs WD21/WORK40, ACCELERATED | Explicit source condition `AL(AL,3)>20` (decompression calculation): above 20m, once the relevant DT boundary is crossed, DX=5/HT=10 can be introduced, and the ordinary D5 calculation can additionally require a 5m stop  -  so WD20 and WD21 correctly sit on opposite sides of a genuine 1978/79 decision boundary (WD21/WORK40 naturally produces stops at both 10m and 5m; WD20 does not). Faithful, not a defect  -  do not "fix" WD21 to match WD20's single-stop pattern. | LOG.md 08 Aug 2026 |
| RT-67 | DECOMPRESS accepted with no decompression obligation  -  general rule | `DESCEND → DECOMPRESS`; `WORK → DECOMPRESS` (no obligation established); `DESCEND → ASCEND → DECOMPRESS` (surface) | Confirmed historical/unexpected coded behaviour, JSX matches CCEMU exactly in all three variants  -  not a defect, not location-dependent. First DECOMPRESS produces no visible movement; activity machinery enters a repeating ASCEND/DECOMPRESS cycle indefinitely; DM develops transient residual characters at the far right (stray red `.0`, or `/...` then `.0`). BASIC accepts DECOMPRESS syntactically without guarding against the absent obligation, regardless of depth. Do not fix. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-68 | Consecutive DECOMPRESS during an active stop | Second DECOMPRESS selected at an active decompression stop instead of ASCEND | Confirmed historical/unexpected coded behaviour, JSX matches CCEMU exactly  -  not a defect. Second DECOMPRESS accepted, diver remains at current stop depth, additional duration added to the existing stop, countdown continues accordingly; normal ASCEND path resumes after the extended stop. Different failure mode from RT-67 (progresses correctly, just extended)  -  DECOMPRESS behaves as an additional hold-at-depth activity, not a guarded one-time transition. Do not fix. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-69 | REST  -  general rule, holds regardless of preceding activity or depth | `DESCEND → REST`; `WORK → REST`; other preceding-activity contexts | Confirmed general historical behaviour, JSX matches CCEMU exactly  -  not a defect, not a per-transition quirk. REST holds the diver at current `AD` for the entered duration, does not insert/imply ASCEND, terminates via GOSUB 8000/MEMORY/END with no intervening ASCEND; final READY appears at whatever depth REST was entered from. One general rule, not logged separately per predecessor activity. Do not fix; do not add an automatic ASCEND before REST. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-70 | Surface WORK → ASCEND | ASCEND previously completed at surface (AD=0); WORK (BT5) → ASCEND | Faithful, predictable coded behaviour  -  PASS, JSX matches CCEMU. WORK accepted at surface, holds AD=0 for entered duration; subsequent ASCEND has zero physical movement (already at surface); processing completes normally, REST follows as terminal path. Not a quirk or defect. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-71 | WORK→DECOMPRESS, established obligation, before ASCEND reaches stop depth | Sufficient WORK for a genuine obligation, DECOMPRESS selected before ASCEND | HISTORICAL MATCH/PASS  -  JSX matches CCEMU exactly, not a defect. DECOMPRESS does not reposition the diver; decompression timing executes at current AD, producing a continued level segment; ASCEND afterward resumes and completes normally; final MEMORY matches CCEMU. DECOMPRESS assumes ASCEND already positioned the diver  -  it doesn't move the diver itself. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-71B | Surface ASCEND recurrence  -  general rule | `DESCEND → ASCEND → WORK(BT5) → ASCEND`; `DESCEND → ASCEND → ASCEND` | Faithful, predictable coded behaviour  -  perfect PASS, JSX matches CCEMU in both tests. First ASCEND reaches surface (AD=0); subsequent activity accepted at surface; a following ASCEND performs zero physical movement (start=target=0); processing completes normally, proceeds to REST. General rule: ASCEND at AD=0 is a valid zero-movement activity, completed normally through ordinary successor logic, not treated as an error. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-72 | DESCEND after ASCEND/DECOMPRESS (deeper descent during active decompression) | `WORK → ASCEND → DECOMPRESS → DESCEND` to a deeper WD | Confirmed historical/unexpected coded behaviour, JSX matches CCEMU exactly  -  not a defect. Deeper DESCEND accepted, profile drawn at new depth, DM retains decompression state (STOP 5/5M 15: in the tested case), program then reaches genuine OUT OF RANGE (CCEMU: `SN ERROR IN 6763`; JSX: matching OUT OF RANGE halt). Original program allows descending again during active decompression, but the resulting state falls outside the decompression-table/display logic's expected range. Do not fix. | DESIGN_NOTES.md; LOG.md 16 Aug |

---

## Reclassified  -  moved OUT of "Resolved-as-not-a-bug"; GOSUB 5900 fully IMPLEMENTED, RT-36/37/38 all PASS

**Hold/clear note, 10-11 August 2026:** a coverage audit (10 August)
found two genuinely missing routines (GOSUB 6200, GOSUB 6900) and one
candidate-lineage regression (GOSUB 8000's full MEMORY implementation)
in the candidate then under test, and explicitly recommended holding
RT-36/37/38 until those were resolved. All three were resolved 11
August 2026 (see DEF-013, DEF-014, DEF-015) and the hold was lifted  - 
"no longer a known hidden live BASIC routine that should block
ordinary regression work" (SB, 11 August). RT-36/37/38 were then run
and all three PASS (11 August 2026, corrected from an earlier stale
PARTIAL/NOT YET RUN status  -  see below).

| ID | Test | Profile | Status | Source |
|----|------|---------|--------|--------|
| RT-31 | GOSUB 5900, staged WORK | WD40/WORK20, WD16/WORK10, WD20/WORK50 | ~~Staged vs single-shot computation converge to identical HT/DX/D5  -  correctness-neutral, low priority, not yet implemented~~ **SUPERSEDED 09 August 2026, then RECLASSIFIED AGAIN 10 August 2026  -  now IMPLEMENTED.** Stack generation, staged WORK consumption, normal continuation, and the NO/revised-BOTTOM-TIME replan path (both positive and non-positive) are all implemented and tested. PASS on WD40/ACCELERATED/WORK20 (staged 9.25→6→3→1.75, endpoints 11→17→20→21.75, final handoff to ASCEND 40→10m NEXT=DECOMPRESS), WD16/ACCELERATED/WORK10 (no unnecessary subdivision, DESCEND→WORK10→ASCEND preserved), WD20/ACCELERATED/WORK50 (staged 45→3→2, endpoints 46→49→51, HT 0→5, final WORK→ASCEND 20→5m NEXT=DECOMPRESS). Positive replan PASS (NO→BOTTOM TIME 1→"IS NEXT STAGE=1 MIN REQUIRED"→YES→ASCEND, after DEF-012's zero-duration-activity fix) and non-positive replan PASS ("IS NEXT STAGE=6 MIN REQUIRED"→NO→BOTTOM TIME 0→ASCEND rate 15, 40m→0m, NEXT=REST). | LOG.md 10 Aug; DEFECT_REGISTER.md DEF-011 (RESOLVED/IMPLEMENTED), DEF-012 (RESOLVED) |
| RT-36 | GOSUB 5900 shallow/depth boundary | WD9/ACCELERATED/long WORK; WD10/ACCELERATED/long WORK | **PASS (11 August 2026, corrects an earlier stale "NOT YET RUN" status).** WD9: 5900 bypassed because AD<10; WORK remained unstaged. WD10: 5900 became active normally at exactly 10m and staged the WORK according to the DT row. Conclusion: source condition [5905] is correctly reproduced as `<10`, not `<=10`  -  no off-by-one at the boundary. Formalised TODO.md T50  -  T50 closed/removed. | LOG.md 11 Aug; DEFECT_REGISTER.md DEF-011 |
| RT-37 | WORK/REST minimum-duration and TK-mode boundary | REST/WORK small-duration inputs, ACCELERATED and REAL | **PASS (11 August 2026, corrects an earlier stale "NOT YET RUN" status).** REST source ordering verified: `PA(PA,2)=M` stored before the local `M<2*TK` clamp, matching BASIC [5710]-[5715]. ACCELERATED REST input 0.1: PA duration remains 0.1, local M raised to 0.5. REAL REST input 0.1: PA remains 0.1, no local clamp applies (2*TK=0.0625). WORK `<TK` branch: ACCELERATED small final WORK stage takes the direct branch without asking "IS NEXT STAGE..."; REAL mode with the same ~0.1 stage asks the question because 0.1>TK. BASIC numeric PRINT fidelity (DEF-016) also confirmed here: JSX displays `.1`/`0.1`-style human-readable output, not raw float residue. Formalised TODO.md T55  -  T55 closed/removed. | LOG.md 11 Aug; DEFECT_REGISTER.md DEF-011, DEF-016 |
| RT-38 | GOSUB 5900 OUT OF RANGE paths | RT-38A: WD-profile reaching [5970]; RT-38B: isolated harness reaching [5931] | **PASS (11 August 2026, corrects an earlier stale PARTIAL status)  -  both distinct source exits verified, must remain separate, not merged into GOSUB 6100/6750's OUT OF RANGE tests.** RT-38A ([5970], PA=-1): live end-to-end test reached `status=pa-minus-one PA_scalar=-1 CL=1.75 row=16 J=6 K=7`  -  current CL remained valid within the DT row, but the proposed WORK end exceeded the usable row. RT-38B ([5931], hard STOP): controlled isolated 5900 harness reached `status=hard-stop sourceExit=5931 STOP AD=40 CL=30 TT=1 row=16 J=7 DT row=11,17,20,22,24,25,999`  -  current CL already beyond every usable DT entry, J-search reached the 999 sentinel. Qualification: RT-38B is intentionally an isolated source-path test, since normal full-program execution may be intercepted earlier by GOSUB 6750's own OUT OF RANGE protection. | LOG.md 11 Aug; DEFECT_REGISTER.md DEF-011 |
| RT-39 | GOSUB 6200 (AIR OK) | WD16, WD40 | PASS (11 August 2026)  -  appears whenever WORK is the current activity at the predictive activity question; third DM row otherwise blanked/overwritten later. Functional PASS on both profiles. Colour/exact display styling remain open as a separate fidelity question, not this row's scope. | DEFECT_REGISTER.md DEF-013 |
| RT-40 | GOSUB 6900 (staged-WORK decompression requirement display) | WD40/WORK20 | PASS (11 August 2026)  -  three staged questions observed: first blank (D5+DX=0), second "T10>15", third "T15>20". Functional PASS. A separate `T n::::`-type row appearing immediately afterward is NOT explained by this  -  corrected 14 August 2026: confirmed via CCEMU as RETAINED Dive Monitor state (not transient), resolved alongside DEF-002 (RT-49). | DEFECT_REGISTER.md DEF-014, DEF-002 |
| RT-41 | Two legitimate decompression stops in sequence (10m×5min then 5m×5min) | WD40, ACCELERATED | PASS (11 August 2026)  -  GOSUB 6850 showed D5=5, DX=5; later GOSUB 6250 showed D5=5, DX=0; MEMORY displayed both "10M 5" and "5M 5". Confirms the deeper-stop DX path and subsequent 5m D5 path operate correctly in sequence. Successful behavioural finding/regression evidence  -  not a defect, no fix TODO opened from this. | LOG.md 11 Aug |
| RT-42 | WORK-stage replan: first proposal YES, all subsequent proposals NO | WD40, ACCELERATED | PASS (11 August 2026)  -  decompression state remained coherent through replanning. GOSUB 6850 showed D5=10, DX=5; GOSUB 6250 later showed D5=10, DX=0. Dive completed normally through final 5m decompression, ascent, REST and END. Successful behavioural finding/regression evidence  -  not a defect, no fix TODO opened from this. | LOG.md 11 Aug |
| RT-43 | REAL-mode full activity cycle, no decompression | WD16, BT10, REAL (TK=1/32) | PASS (11 August 2026)  -  complete DESCEND→WORK→ASCEND→REST→END sequence. Predictive prompting, true movement boundary, activity creation, surface arrival, and REST completion all correct. A graphics problem remained at one activity transition (see DEF-017-adjacent graphics tracking), but no scheduler failure identified. Closes most of T47's REAL-mode-away-from-WD40 gap. | LOG.md 11 Aug; TODO.md T47 |
| RT-44 | REAL-mode full activity cycle, with decompression | deeper WD, REAL (TK=1/32) | PASS (11 August 2026)  -  DESCEND→WORK→ASCEND→DECOMPRESS→further ASCEND→additional DECOMPRESS (where required)→final ASCEND→REST→END. Predictive prompts correctly queued the next activity while the current activity continued to its true boundary. GOSUB 7500 fired correctly at DECOMPRESS boundaries; HT progressed through required stop depths (10→5→0 where applicable). One run produced two separate 5-minute DECOMPRESS periods  -  accepted as genuine source-derived behaviour, not duplicate scheduling, since the underlying event/activity chain supported it. YES/NO WORK-continuation responses (including NO→bottom-time replan) confirmed working in REAL mode. | LOG.md 11 Aug; TODO.md T47 |
| RT-45 | DEF-017/DEF-007 fix regression sweep  -  ASCEND↔DECOMPRESS join geometry | REAL WD40/BT20/all staged YES; REAL WD16/BT10; WD49/ACCELERATED/immediate ASCEND; WD40/BT22/ACCELERATED full cycle | PASS (12 August 2026)  -  same four-profile sweep confirms both DEF-017 (ASCEND target-tick raster-coincidence flat-segment misclassification, causing an ASCEND→DECOMPRESS start-step) and DEF-007 (SVG raster seam at the DECOMPRESS-line/first-ASCEND-rectangle junction, causing a DECOMPRESS→ASCEND end gap) fixes. Both ASCEND↔DECOMPRESS join directions now clean. WD49's established end-of-ASCEND "level tick" geometry (RT-34, explained by RT-07+RT-29) preserved, not disturbed. Scheduler untouched throughout  -  confirmed, not just assumed. | LOG.md 12 Aug; DEFECT_REGISTER.md DEF-017, DEF-007 |
| RT-46 | DEF-005 fix regression sweep  -  ASCEND-over-DT-bars z-order | WD35/BT20/ACCELERATED; WD40/BT20/ACCELERATED; WD40/BT22/ACCELERATED full cycle; REAL WD40/BT20/all staged YES | PASS (12 August 2026)  -  confirms the z-order fix (coloured WORK/DT bands render first, non-WORK `profileSegs` render after, so ASCEND correctly overwrites the mountain/DT bars per BASIC's sequential PLOT order). WD35's one-column-gap ASCEND start and WD40's same-column (`LQ===LM`) overlap both confirmed source-authentic, not defects exposed by the fix. RT-05 (WORK's own coloured-band rendering) confirmed unaffected. Scheduler untouched throughout. | LOG.md 12 Aug; DEFECT_REGISTER.md DEF-005 |
| RT-47 | DEF-009 fix regression sweep  -  DESCEND raw-LQ painting | WD16/ACCELERATED/immediate ASCEND; WD49/ACCELERATED/immediate ASCEND; WD40/ACCELERATED/immediate ASCEND; WD40/BT22/ACCELERATED full cycle; REAL WD40/BT20/all staged YES | PASS (13 August 2026)  -  confirms DESCEND now paints at raw BASIC `LQ` rather than `LQ+1`. WD16/WD49's one-column backward step at the DESCEND→ASCEND handoff is gone; WD40 (which had masked the original bug via coincidental column alignment) unaffected. No scheduler or simulation-state logic changed. | LOG.md 13 Aug; DEFECT_REGISTER.md DEF-009 |
| RT-48 | T44/join-overlap regression sweep  -  DESCEND→WORK and WORK→ASCEND connected-line rendering | WD18/BT10/ACCELERATED; WD35/BT20/ACCELERATED; WD40/BT22/ACCELERATED; REAL WD40/BT20/all staged YES; WD16/ACCELERATED/immediate ASCEND | PASS (14 August 2026)  -  CCEMU established DESCEND→WORK and WORK→ASCEND are genuinely connected lines in original execution; earlier JSX blue seams were SVG/raster-representation artefacts, not BASIC coordinate gaps (distinct mechanism from DEF-003's `+1`/raw-LQ offset fix, despite superficially similar symptom  -  see DEFECT_REGISTER.md DEF-003's update). T44 (WD18 repro case) closed on this evidence. | LOG.md 14 Aug; DEFECT_REGISTER.md DEF-003 |
| RT-49 | DEF-002 fix regression  -  DM/STOP-label lifecycle | WD40/BT20/ACCELERATED/all staged WORK YES | PASS (14 August 2026)  -  full CCEMU-derived DM lifecycle reproduced: green AIR OK; magenta STOP10; staged T10/T15/T20 display including flashing numeric transition fields; STOP10 retained through first ascent/10m stop; magenta STOP 5 at next decompression stage; green ASCEND after final decompression; correct final MEMORY. Dive completed normally, no scheduler regression. | LOG.md 14 Aug; DEFECT_REGISTER.md DEF-002 |
| RT-50 | DEF-010 fix regression  -  MEMORY heading geometry | Visual comparison against historical photograph | PASS (14 August 2026)  -  six-character black MEMORY header (not full-width strip), white text, header bottom touches DM, small cyan area preserved above, matching photograph. Established DM geometry unchanged. | LOG.md 14 Aug; DEFECT_REGISTER.md DEF-010 |
| RT-51 | T14a/T14d fix regression  -  DM text row vertical positioning | Visual inspection of NOSTOP/countdown/AIR OK rows | PASS (14 August 2026)  -  source-led mapping (rows 4/7/9) replacing equal visual spacing; clear separation of the three GOSUB 7000 text bands, no overlap. Third band needed an extra 4px downward adjustment for the taller JSX font vs CCEMU raster characters. | LOG.md 14 Aug |
| RT-52 | U04 fix regression  -  depth-trend indicator vertical placement | Video review against CCEMU | PASS (14 August 2026)  -  10-block trend stack moved up one block pitch (4px); bottom of indicator now aligns correctly with the air indicator; fill/VA logic unchanged (already source-faithful). | LOG.md 14 Aug |
| RT-53 | CAPS input fix regression  -  uppercase normalisation | Lower-case activity/YES-NO/time-mode entries | PASS (14 August 2026)  -  alphabetic input normalised to uppercase on entry, matching Compucolor's uppercase-only terminal convention; numeric WD input unaffected. | LOG.md 14 Aug |
| RT-54 | T51  -  GOSUB 6100 bracket search, second depth | WD30/BOTTOM TIME 35/ACCELERATED, staged-WORK accepted | PASS (14 August 2026)  -  full dive completed normally through WORK staging, ASCEND/decompression, MEMORY. No skipped/repeated bracket behaviour, premature OUT OF RANGE, freeze, or other anomaly at the 30m DT row  -  independent second-depth exercise of the bracket search beyond WD40/row-16. | LOG.md 14 Aug |
| RT-55 | T49  -  GOSUB 6850 Branch A/B selector, exact boundary | WD18/BOTTOM TIME 56/ACCELERATED (WORK began CL=1, endpoint exactly 57min = first DT boundary for 18m) | PASS (14 August 2026)  -  source [6852] branches only on `AL(AL,7)>DT(I,1)`, so equality remains Branch A; run completed normally, MEMORY showed `57:00` at WD18, no spurious decompression requirement at the equality point. | LOG.md 14 Aug |
| RT-56 | T25  -  GOSUB 8000 boundaries [8062]/[8063] | Boundary A: WD9/BOTTOM TIME 10/ACCELERATED. Boundary B: WD40/BOTTOM TIME 20/ACCELERATED (existing profile) | PASS (14 August 2026)  -  Boundary A (`IF WM<10 THEN NS=0`): MEMORY showed `10:45`, restored WD 9, blank decompression rows, no spurious requirement. Boundary B (`IF NS<0 THEN 8074`): closed by record reconciliation  -  the WD40/BT20 profile already passes the 11-minute DT boundary and finishes at BT=21.75 (NS<0), producing the already-confirmed `21:45 / 10M 5: / 5M 15` via the 8074 branch. Both GOSUB 8000 boundaries now covered. | LOG.md 14 Aug |
| RT-57 | T52/T53  -  negative-result confirmations, no code change | T52: WD20/BT68, BT69, BT70 (ACCELERATED and CCEMU). T53: direct observation of current baseline | Both CLOSED as source-behaviour-present-but-unreachable/equivalent (14 August 2026). T52: source [6939] `IF I>30 THEN I=-60` (">30 displays as *") appears unreachable in normal execution  -  WD20/BT68/BT69 both reach only `25>30` as the highest visible staged-WORK requirement; BT70 fails before reaching it (JSX: freezes; CCEMU: errors at line 1645 `AL(AL,I)=PA(PA,I)`, an independent confirmation of the same ceiling). Treated as defensive/residual source code, not a JSX defect. T53: source [6730]/[6731] GOSUB 6700's `IF LA=VA THEN 6745` redraw-skip optimisation is not implemented in JSX, but the air indicator is visually static between genuine value changes  -  no flicker/rebuild/colour disturbance  -  so JSX is visually equivalent without implementing the optimisation itself. | LOG.md 14 Aug |
| RT-58 | T54  -  GOSUB 6300 DESCEND MP=MQ equality case | WD15.25/BOTTOM TIME 1/ACCELERATED | PASS (15 August 2026)  -  deliberately exercised the DESCEND `MP=MQ` equality case; final DESCEND movement not suppressed, profile reached intended depth before WORK. A very small DESCEND→WORK visual discontinuity remains but is not a behavioural failure  -  consistent with minor rendering/raster handoff effects, not the tested equality logic. Combined with DEF-017's ASCEND `MP=MQ` evidence and existing same-column `LQ=LM` coverage, closes the equality-case question for GOSUB 6300 generally. No code change required. | LOG.md 15 Aug |
| RT-59 | Draw-order sweep closure  -  ASCEND→REST handoff | WD16/BOTTOM TIME 10/ACCELERATED | PASS (15 August 2026)  -  final ASCEND reached the surface cleanly and handed off directly into the REST horizontal segment with no gap, overlap anomaly, backward step, duplicated stroke, or other rendering discontinuity. Closes the last remaining candidate from the draw-order/position-handoff sweep (DEF-017/DEF-007/DEF-005/DEF-009/T54 closed the rest). No code change required. | LOG.md 15 Aug |
| RT-60 | U11  -  PLOT 27,10/27,11 character-advance behaviour | Minimal CCEMU A/B test | RESOLVED/PASS (15 August 2026)  -  `PLOT 27,10` selects vertical character advance (one row per character, upright); `PLOT 27,11` restores normal horizontal advance from the cursor's current position. No evidence `PLOT 27,11` itself causes scrolling or cursor repositioning  -  earlier "scroll mode" description was too broad. A follow-up minimal test also showed a single instance of each command is sufficient; DIVER.BAS's doubled occurrences are not behaviourally required (retained as a historical source characteristic, see DESIGN_NOTES.md). No JSX change required. | LOG.md 15 Aug; DESIGN_NOTES.md |
| RT-61 | DEF-018 fix  -  title/underline removed from visible rendering | Visual check, current lineage | PASS (15 August 2026)  -  JSX title and underline removed from visible rendering, matching the surviving BASIC's actual (non-displaying) behaviour; no synthetic `PLOT 255` equivalent added; no other initial-screen element found dependent on the former title code path. | DEFECT_REGISTER.md DEF-018 |
| RT-62 | Diagnostic-scaffolding removal regression  -  DiverSim_v12_READY_clean05.jsx | WD16/BOTTOM TIME 10/ACCELERATED | PASS (15 August 2026)  -  visible diagnostics, passive event logging, several stateful diagnostic snapshots, predictive-prompt diagnostic capture, tick tracing, and AD-block tracing all removed from the presentation lineage without behavioural regression. `DiverSim_v12_READY.jsx` retained separately as a frozen forensic baseline keeping this diagnostic plumbing for the record  -  the two are siblings, not a supersession. | LOG.md 15 Aug |
| RT-63 | Diagnostic-scaffolding removal regression, continued  -  clean06/clean07/clean08/clean10 | (progressive, same class of test as RT-62) | PASS (15 August 2026)  -  each build passed after removal of further diagnostic/trace scaffolding beyond clean05. | LOG.md 15 Aug |
| RT-64 | DEF-019 fix  -  `Tn:::` DM-row persistence | WD40/BOTTOM TIME 20/ACCELERATED | PASS (15 August 2026)  -  GOSUB 6750 writes now preserve untouched DM rows explicitly rather than replacing the whole `boundCells` set; `Tn:::` persistence behaves correctly again. Pre-existing defect, surfaced (not caused) by the diagnostic-cleanup regression. | LOG.md 15 Aug; DEFECT_REGISTER.md DEF-019 |
| RT-65 | DEF-020 fix/acceptance  -  WD41/BT21 SVG join gaps | WD41/BOTTOM TIME 21/ACCELERATED (found); confirmed on clean12 via WD40/BT20/ACCELERATED + a second staged-WORK/decompression run | PASS/ACCEPTED (15 August 2026)  -  probe confirmed underlying BASIC/SVG handoff coordinates contiguous at both 10m and 5m stops; issue is pure SVG rasterisation. Rejected: extra overlap, bridge, 3×3 join-cap candidates. Accepted: DECOMPRESS horizontals use SVG square line caps, reducing the seam to a negligible sub-pixel artefact  -  explicitly accepted as cosmetic, not a behavioural defect. Does NOT reopen DEF-007/DEF-017. | LOG.md 15 Aug; DEFECT_REGISTER.md DEF-020 |
| RT-66 | clean12 confirmation sweep  -  new presentation-lineage baseline | WD40/BT20/ACCELERATED; second staged-WORK/decompression run | PASS (15 August 2026)  -  GOSUB 5900 staging unaffected; `Tn:::` persistence, MEMORY, and READY all intact; small SVG join gaps remain visible but accepted as cosmetic (DEF-020). `DiverSim_v12_READY_clean12.jsx` promoted to confirmed presentation-lineage baseline, superseding clean05 through clean11. | LOG.md 15 Aug |
| RT-73 | DEF-021 fix regression  -  cross-AL `workDots` join correction | `WD10 → WORK/BT10 → later DESCEND to 20 → WORK 5` | PASS (16 August 2026)  -  extra graphic segment at start of second WORK gone; JSX no longer joins `workDots` between different AL records incorrectly. | DEFECT_REGISTER.md DEF-021 |
| RT-74 | DEF-022 fix regression  -  operator WORK→WORK prompt/gap correction | `BT5 → WORK → BT5 → WORK → BT10`; continued into `WORK → DESCEND → WORK` | PASS (16 August 2026)  -  one BOTTOM TIME prompt per operator-selected WORK (was two); continuous same-depth WORK trace (was gapped); DEF-021's WORK→DESCEND→WORK fix confirmed still intact on the same run. | DEFECT_REGISTER.md DEF-022 |
| RT-75 | DEF-023 fix regression  -  WORK-graphics commit-order correction before OUT OF RANGE | `... WORK → ASCEND → DECOMPRESS → WORK 5`, reaching genuine OUT OF RANGE | PASS (16 August 2026)  -  JSX-only coloured WORK/DT fragment at the OUT OF RANGE halt is gone; OUT OF RANGE behaviour and DM state remain faithful; DEF-021/DEF-022 confirmed still passing on the same lineage. | DEFECT_REGISTER.md DEF-023 |
| RT-76 | Repeated DESCEND recurrence | `DESCEND 10 → DESCEND 20 → DESCEND 33` | Faithful, predictable coded behaviour  -  perfect PASS, JSX matches CCEMU. Each successive DESCEND accepted normally, diver continues from current actual depth to the newly entered deeper target, movement/plotting continuous, no stray graphics/duplicate prompting/scheduler stall. General rule: consecutive DESCEND activities are valid and chainable. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-77 | ASCEND-at-stop → ASCEND recurrence | ASCEND completes at a decompression stop, then ASCEND selected again | Faithful coded behaviour  -  perfect PASS, JSX matches CCEMU exactly. Second ASCEND accepted, movement/progression follows source logic correctly, no duplicate prompt/stall/stray graphics/scheduler anomaly. Closed as tested. | LOG.md 16 Aug |
| RT-78 | Repeated ASCEND limit | Repeated ASCEND selections at a decompression stop, continued past ASCEND-recurrence (RT-77) | Historical source-program failure path, not a JSX defect  -  JSX and CCEMU fail at the same point; CCEMU reports `BS ERROR IN 1982`. Exact PA/AL/array mechanism still to be established from source, but confirmed not a reconstruction fidelity gap. Do not fix. | DESIGN_NOTES.md; LOG.md 16 Aug |
| RT-79 | DEF-024 fix regression  -  zero-distance ASCEND gap before DECOMPRESS | Repeated ASCEND selections at a decompression stop, before allowing DECOMPRESS | PASS (16 August 2026), user-confirmed perfect PASS. Zero-distance ASCEND now renders from its already-reached physical endpoint rather than a later logical time-column position, matching CCEMU's continuous graphical transition (BASIC ignores the redundant ASCEND logically). Candidate `DiverSim_v12_READY_clean14_DEF024_fix5.jsx`. Historical repeated-ASCEND eventual failure (RT-78) unchanged, still matches CCEMU. | DEFECT_REGISTER.md DEF-024 |
| RT-80 | v13 behavioural baseline post-promotion regression | WD10 shallow ordinary dive; WD40/BT20 full decompression dive; staged WORK case; ordinary multi-stop decompression | PASS (16 August 2026)  -  `DiverSim_v13_READY.jsx` (promoted from the confirmed DEF-024 fix5 lineage) confirms DEF-021 through DEF-024 have not disturbed normal scheduler, movement, WORK staging, or decompression behaviour. Phase closure: activity-transition/recurrence investigation CLOSED. | LOG.md 16 Aug |
| RT-81 | Compucolor-style corner/join presentation refinement | ASCEND↔DECOMPRESS: ordinary multi-stop decompression profile (`DiverSim_v13_JOIN_probe1.jsx`). ASCEND↔REST: shallow run (`DiverSim_v13_JOIN_probe2_REST.jsx`) | PASS (16 August 2026)  -  a small raster-style corner reinforcement reproduces the Compucolor solid right-angle union for both transition types, visually matching CCEMU. No renderer-wide rewrite needed; no scheduler/timing/activity/coordinate logic touched  -  presentation-only. | LOG.md 16 Aug |
| RT-82 | v13 presentation baseline post-fold regression | WD10 shallow ordinary dive; WD40/BT20 full decompression dive; staged WORK within WD40/BT20; repeated ASCEND at decompression stop then DECOMPRESS | PASS (16 August 2026)  -  `DiverSim_v13_READY_presentation1.jsx` (incorporating the accepted corner/join treatment) shows no regression in scheduler, staged WORK, decompression progression, REST termination, or DEF-024 behaviour. Accepted as current MAIN baseline. Presentation ToDo (corner/join refinement) CLOSED/PASS. | LOG.md 16 Aug |
| RT-83 | Surface re-entry deep-dive sequence | `DESCEND 10 → ASCEND → WORK 10 → DESCEND 40 → WORK 20` | Confirmed historical error path  -  PASS for reconstruction fidelity. JSX does not proceed normally after the second deep descent/work sequence; canonical BASIC/CCEMU also errors at the corresponding point. Using the surface state as the start of a new substantial dive can drive the original program into an error condition  -  faithful, not a defect. Do not fix. | DESIGN_NOTES.md; LOG.md 16 Aug |

---

## CONFIRMED  -  multi-profile scheduler regression sweep (08 August 2026)

Formal regression of the cumulative scheduler candidate, run across a
range of naturally generated dive profiles (SB), superseding the
"pending re-confirmation" status the rows below carried since the 07
August scheduler rewrite. Per the project's agreed logging practice,
intermediate failures/experimental fixes during development are not
separately logged  -  this cumulative PASS result supersedes them.

**Profiles tested, all PASS on scheduler/activity sequencing:**
- WD10/ACCELERATED → ASCEND → REST
- WD10/ACCELERATED → WORK10 → ASCEND → REST
- WD16/ACCELERATED → WORK10 → ASCEND → REST
- WD19/ACCELERATED → WORK47 → ASCEND → DECOMPRESS → ASCEND → REST
  (first observed naturally generated single-stop decompression dive)
- WD20/ACCELERATED/WORK40
- WD20/ACCELERATED/WORK50 → ASCEND → DECOMPRESS → ASCEND → REST
- WD21/ACCELERATED/WORK40 → ASCEND → DECOMPRESS → ASCEND → DECOMPRESS
  → ASCEND → REST
- WD40/ACCELERATED/WORK20 → ASCEND → DECOMPRESS → ASCEND → DECOMPRESS
  → ASCEND → REST

Confirmed across the set: predictive activity prompting without
prematurely terminating the current activity; true activity
boundaries; DESCEND and ASCEND target completion; WORK duration;
single- and multi-stop DECOMPRESS sequences; REST duration; final END
behaviour. This closes the scheduler-side substance of the rows below
 -  **RT-01/RT-02, RT-06, RT-08/RT-09, RT-16 through RT-20, RT-24,
RT-27/RT-28, RT-32 are CONFIRMED for scheduler/activity-sequencing
behaviour** on this evidence. Known graphics defects (DEF-005, DEF-007,
DEF-009) remain separately open/deferred and do NOT invalidate this
scheduler PASS  -  noted explicitly on the WD40 run, where part of the
first ascent is still obscured by the coloured DECOMPRESS-table bars
(DEF-005).

**Genuinely still outstanding, not closed by this sweep:**
- REAL mode (`TK=1/32`) away from WD40  -  this sweep ran ACCELERATED
  throughout. RT-02 and T47's REAL-mode-at-other-WD gap remain open.
- WD17/WD18  -  ~~the sweep covers WD19/20/21 but not the lower part of
  the previously-flagged XS=1 regime (T46, TODO.md).~~ CLOSED by the
  addendum sweep below.
- Exhaustive per-tick DM-digit-value accuracy at each row's originally
  specified profile  -  this sweep confirms scheduler/activity sequencing
  and "graphics and behaviour satisfactory," not a re-verification of
  every individual DM field value the original rows specified. Treat
  as confirmed at the sequencing level; a future exhaustive DM-content
  pass is still valid future work, not required to close this group.

**Significant finding, not a defect  -  20m/21m decompression boundary
(RT-35, new, see "Resolved-as-not-a-bug" above).**

**Qualification added 09 August 2026, per DEF-011's discovery:** this
scheduler PASS remains valid for the movement/event-boundary scheduler
as currently implemented  -  DESCEND, true boundaries, ASCEND,
DECOMPRESS, REST and END were genuinely demonstrated across the
profiles above, and none of that is withdrawn. However, it does NOT
constitute source-complete validation of WORK sequencing specifically:
every profile above ran through the current one-block JSX WORK
implementation, not the source-complete GOSUB 5900-staged WORK
implementation (see DEF-011, not yet implemented). RT-24, RT-28, and
other affected full-cycle profiles will need to be re-run once DEF-011
is implemented, since a staged WORK period may exercise the scheduler
differently than one continuous block does.

**UPDATE, 10 August 2026  -  the "not yet implemented" qualification
above is historically correct for the runs it describes, but is now
superseded going forward.** GOSUB 5900 is implemented (DEF-011
RESOLVED/IMPLEMENTED, 10 August 2026) and representative profiles have
since been re-run with source-complete 5900 staging and PASSED:
WD40/ACCELERATED/WORK20, WD16/ACCELERATED/WORK10, WD20/ACCELERATED/
WORK50, plus both the positive and non-positive NO/replan paths (see
RT-31, above). RT-24/RT-28 themselves have not been individually
re-run under this label, but WD40/WORK20's staged-WORK PASS covers the
same profile and activity sequence RT-24/RT-28 exercise  -  treat as
substantively re-confirmed, formal row re-run still outstanding if a
strict row-by-row re-run is wanted.

---

### Addendum  -  WD15 through WD20 scheduler sweep (09 August 2026)

Follow-up regression, run to establish continuity across a range
rather than only at the previously-emphasised reference cases (WD10,
WD16, WD21, WD40). WD15/16/17/18/19/20  -  **all six PASS on scheduler/
activity sequencing.** Correct progression confirmed through DESCEND
completion, WORK where selected, ASCEND completion, DECOMPRESS where
naturally required by the decompression-table arithmetic, REST, and
END. Some runs reproduced already-documented graphics issues,
particularly shallow/direct DESCEND→ASCEND geometry (DEF-009) and
other recorded rendering defects  -  these do not invalidate the
scheduler PASS and remain tracked separately in DEFECT_REGISTER.md.
Same WORK-staging qualification as above applies: WORK here is still
the current one-block implementation, not GOSUB 5900-staged.

Combined with the profiles above, every WD from 15 through 21 has now
been run through a full activity cycle  -  closing the WD17/WD18 gap
this section previously flagged, and confirming scheduler stability
across a continuous range rather than only at isolated reference
points. **No new scheduler defect identified.**


| RT-84 | final24 display-fidelity baseline | Full accepted regression suite | PASS (20 August 2026). `DiverSim_v13_READY_final24_display_fidelity_BASE.jsx` accepted as behavioural/display baseline. Serial visible-write model and empirical 35/10/18 ms display cadences do not regress scheduler/activity behaviour. | LOG.md 20 Aug |
| RT-85 | Latched terminal-bell stop semantics | Trigger source bell, then complete corresponding INPUT with RETURN | DIRECT USER PASS (20 August 2026): tone remains sounding and stops on ENTER as intended. Current candidate `DiverSim_v13_READY_final24_latched_bell_candidate.jsx`. This is a targeted bell-behaviour confirmation, not yet a full promotion regression. | LOG.md 20 Aug; STYLE_GUIDE.md |
| RT-86 | [1265–1266] title visibility / terminal-state fidelity | Normal canonical execution through title statements | PASS for historical interpretation: BASIC executes the lines, but no ordinary title/underline text appears in normal CCEMU while terminal remains in Graphic Plot Mode. JSX must not display title text. Hidden titleCells timing remains a separate deferred implementation cleanup. | TESTING_PLAN.md T05; LOG.md 20 Aug |
| RT-87 | PLOT stream grammar [1261]/[1273]/[1346] | Static source/manual cross-check | PASS: whole-statement serial parsing established. [1261] HOME + Graphic Plot + X/Y values; [1273] submode 250 X Bar Graph/X0; [1346] submode 246 Y Bar Graph/Y0. Comment corrections only; no executable behaviour change. | STYLE_GUIDE.md; TESTING_PLAN.md T04/T06; LOG.md 20 Aug |

## Not yet in this register (known gaps, flagged not forgotten)


- T44  -  WORK→ASCEND boundary, same root cause as DEF-003 suspected but
  not yet explicitly re-tested against the fix. Add a row once confirmed.
- T45  -  resolved as reasoned-but-unconfirmed, no fix implemented,
  nothing to regression-test.
- DEF-001, DEF-002, DEF-004, DEF-005 (see DEFECT_REGISTER.md)  -  open,
  not yet resolved. DEF-003 is resolved (see RT-32 above).
