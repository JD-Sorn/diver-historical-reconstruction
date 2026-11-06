# DIVER.BAS - JSX Test Plan

Structured by BASIC line number sequence.

Each test: discrete BASIC section, JSX component, emulator screenshot where needed, conclusions filed. Tests are cumulative - each builds on the previous. The running JSX at any point = program verified to that line.

## FILE NAMING CONVENTIONS

- **JSX (accumulating simulation file):**
    - `DiverSim.jsx` - single file, grows with each test
- **Test notes (one per test, filed in reference/jsx_experiments/):**
    - `T##_short_description.md` e.g. `T02_cyan_frame.md`
- **Emulator BASIC programs (filed in reference/emulator_screenshots/):**
    - `T##_short_description.bas` e.g. `T03_dm_box.bas`
- **Screenshots (filed in reference/emulator_screenshots/):**
    - `T##_short_description.png` e.g. `T02_frame_position.png`
    - `T##_short_description_variant.png` e.g. `T03_dm_solid_cyan_bg.png`
- **Photograph references (filed in reference/photographs/):**
    - keep original filenames - do not rename source photographs
- **Rules:**
    - T## prefix on all reference files - links file to test in plan
    - lowercase, underscores, no spaces
    - description concise (2-3 words maximum)
    - variant suffix where multiple screenshots per test

## METHODOLOGY NOTE - a T-number is not purely a test

In practice a T/U-number bundles several distinct roles under one label: forming a hypothesis about what the BASIC does, implementing it in JSX, running it against the emulator/testbed, and analysing whether the result matches. This wasn't the original intent (John's usual practice is test-as-you-develop, not a separate develop-then- test split) but became the working shape of this project once Sandbox started carrying the development role as well as the testing role.

Consequence for reading this file: "COMPLETE" or "CONFIRMED" on a T-number does not mean a pre-existing, fully-formed piece of BASIC behaviour was purely observed and verified - real hypothesis-forming and development work may have happened en route, inside the same entry. Don't assume the terminology ("test", "TESTING_PLAN") implies a cleaner separation than actually occurred. Terminology is being kept as-is for continuity rather than renamed at this point.

Going forward, entries may carry inline phase tags - [HYPOTHESIS], [DEV], [TESTBED], [ANALYSIS] - on the relevant lines, applied opportunistically as entries are touched anyway rather than in a retrofit pass over existing entries. Absence of tags on an existing entry means "not yet tagged," not "untagged because it was pure observation."

A separate line, alongside the phase tags rather than folded into [DEV], answers a different question: is this actually in the file the simulation runs from?

- Implemented in DiverSim.jsx: YES / NO / SANDBOX ONLY / STUB
- YES - present and working in DiverSim.jsx (production, accumulating).
- NO - not implemented anywhere yet.
- SANDBOX ONLY - exists in DiverSim2.jsx but hasn't graduated to the production file.
- STUB - a placeholder exists in DiverSim.jsx but doesn't do the real thing yet (this is what the existing "⚠ STUB in DiverSim.jsx" notes on T14d/T15a already mean informally - this formalises them). Worth distinguishing from NO: a stub can look implemented at a glance when it isn't.
    - REQUIREMENT (added 17 July 2026): a stubbed GOSUB must PRINT a short self-identifying label in the cyan area (Domain 1 text space, rows 0-5 - confirmed in CoordinateSystem.md, separate from where actual dive graphics render) whenever it's called, e.g. "[STUB: GOSUB 6100]". A silent stub is invisible by default - it does nothing and looks no different from a working routine that simply had nothing to draw that tick. DiverSim.jsx should make its own incompleteness visible at runtime, not require reading TODO.md separately to know what's missing. Applied going forward and to existing stubs as they're next touched - not a retrofit pass over every currently - stubbed GOSUB right now.

Add a short reason after the state, the way the existing STUB notes already do, e.g. "STUB (static CL=0 only - see T15a)" rather than a bare YES/NO. [DEV] deliberately does not cover this - reasoning out an approach and actually writing it into DiverSim.jsx are different things, and conflating them is part of what caused the confusion this convention is meant to fix. Applied opportunistically, as above - not a retrofit pass, though most entries are likely to be re-touched and updated at some point anyway.

See also: STOCKTAKE mechanism below, for periodically checking that a loop/GOSUB/branch is actually fully developed before being tested against it, rather than discovering the gap mid-test.

## METHODOLOGY NOTE - CCEMU is a tool, not our hardware

CCEMU (https://www.compucolor.org/emu/ccemu.html) emulates the Compucolor II (64×32 text) - a different machine from the confirmed Compucolor/Intecolor 8001-family unit this project uses. It shares enough of the same PLOT-command family and BASIC dialect to be genuinely useful for testing DIVER.bas's own logic, structure and control flow - results of that kind are valid and transfer normally.

Screen geometry, pixel positions, and coordinate wrapping observed on CCEMU do not transfer and must never be cited in LOG.md or TODO.md as evidence about the real hardware.

KNOWN CCEMU LIMIT - line-input length. Long DIVER.bas lines can exceed CCEMU's line-input length when entered as plain text (e.g. line 6856, inside GOSUB 6850, at 106 characters as transcribed - see LOG.md 05 July 2026). Whether this is a genuine platform limit or an artefact of typing/pasting a detokenised plain-text transcription (as opposed to loading a tokenised program file, which would likely behave differently) is unconfirmed, but either way it constrains what can currently be tested in CCEMU. Not an open question about DIVER.bas - a tooling constraint, parked deliberately (formerly tracked as U27). Revisit if a file-load path into CCEMU becomes available.

VERSION SNAPSHOT DISCIPLINE. Adopted 10 July 2026, after a DiverSim.jsx session went badly wrong (multiple things attempted at once, none handled well - see LOG.md) and had to be reverted. Before starting any work on DiverSim.jsx/DiverSim2.jsx with real risk of going sideways (a new T-number, a multi-part change, anything speculative), save a timestamped snapshot of the current working file first - e.g. `DiverSim_2026-07-10_preT26.jsx` - alongside the working copy, so a revert is always a known-good file, not a hope that undo history holds up. Same underlying principle as the DIVER.bas/DIVER7450.BAS provenance split (U26): know exactly which version produced which result, and always have a safe point to fall back to. Going forward, work proceeds tick-by-tick with confirmation at each step rather than large speculative changes, per John's direction.

REFINEMENT (10 July 2026, John): the manual tick-stepper genuinely helped break down the T24 sequence's logical complexity, but even one tick can still carry too much at once - e.g. T24a+c together processed two columns' worth of band-search results (X3=36 and X3=37) in a single step, given LP/LQ can span more than one column per tick.

Monitoring fewer ticks at a time - down to a single column's worth of output per pause, not just a single tick - remains viable and worth using when a step still feels like too much to follow at a glance.

The stepper isn't a one-size-fits-all unit; use it at whatever granularity keeps each pause actually inspectable.

FORWARD DEPENDENCIES - closed sub-tests conditional on unbuilt pieces.

Started 10 July 2026. Several of the small T26/T27 sub-tests pass correctly today only because something they depend on hasn't been built yet - the zero/init value they read IS the correct result right now, but stops being correct once the dependency exists. Listed here so nobody has to reconstruct this from LOG.md, and so each one gets re-checked when its dependency actually lands, not assumed to still hold:

- T27b (ASCEND NEXT) - gosub_5400() resets PA_scalar=1 itself, standing in for T23's not-yet-built skeleton step. Re-check once T23 exists, so the two don't reset PA_scalar in conflicting ways.
- T27d (DECOMPRESS NEXT) - same PA_scalar precondition as T27b. Also:
    - PA(2)=0 (DX) and PA(4)=0 (PA(3)) are both still at init value because T26c (GOSUB 6100, the thing that actually sets DX) isn't built yet. Re-check both PA_scalar and the DX/PA(3) values once T23 and T26c respectively exist.
- T27a (DESCEND NEXT) - closed on the valid-input case only. The reject-and-reprompt path (`IF M<AD OR M>50 THEN 5312`) has not been exercised - the first test happened to fall on the "no correction needed" side. Not fully proven until a follow-up test confirms rejection with no PA write.
- T27e (REST NEXT) - same shape as T27a: closed on the unclamped case only (input=10, well above the 0.5 threshold). Clamp behaviour itself not confirmed by the initial test - SB tried further values same day with expected results, but full detail not yet written up; confirm explicitly whether the clamp path was actually exercised once that follow-up lands.

Add new entries here as more sub-tests close conditionally rather than letting the dependency go unrecorded.

## DEMONSTRATED BEHAVIOUR OVERRIDES DOCUMENTATION, DURING DEVELOPMENT

Adopted 10 July 2026 (John), generalising a specific call on PLOT 29/30's colour-setting behaviour into standing policy. The project's evidential hierarchy already ranks observed behaviour above documentary sources (manuals, prior AI interpretation) - this makes that ranking an explicit development policy, not just a tie-breaker used after the fact: if a piece of DiverSim.jsx behaviour is directly demonstrated clean (no other settings interfering, repeatable), build against it and move on, even if a manual or an earlier LOG.md entry says something that doesn't yet fit. Reconciling the discrepancy is deferred, not abandoned - worth doing once the reconstruction itself is further along or finished, not before, since chasing full documentary reconciliation for every open question would stall active development indefinitely.

Worked example: PLOT 29/PLOT 30 with argument values 1-7 (the C() range) demonstrated as simple, clean colour-setting with nothing else in play - sufficient to unblock T24d fully, since the coloured bands only ever use C() values 1-7. The unresolved U07/U10 tension over PLOT 30's argument 16 specifically (DM box background/character-size question - see FINAL PASS below) doesn't touch this range and isn't holding up T24 or anything else. Demonstrated-clean is enough to build on now; full reconciliation of the documentary conflict waits.

## PREDICTION IS NOT OBSERVATION - file identity must be verified

Adopted 17 July 2026, after T24c was logged as CLOSED on the strength of a report that turned out to present computed predictions as if they were values read off a live screenshot - the file actually under test was still unfixed the whole time. Two things going forward:

1. A prediction (hand-reasoned, or computed by a test harness) and an observation (a value actually seen on screen, in a genuine run, by the person or process claiming to have seen it) are NOT interchangeable, even when they agree. Reporting a prediction using language that implies it was observed - "confirmed," "shows," "the screenshot displays" - is a citation-discipline violation, not a shortcut. State plainly which one something is.

2. Before trusting any "fix applied"/"confirmed working" claim, verify the file actually under test is the file the claim is about - an md5 checksum (or equivalent) is cheap and is what caught this case; a declared fix has now failed to reach the tested file TWICE in T24c's own history alone. Don't assume a delivered fix landed; check it did.

This is the same evidential hierarchy already governing the project (observed behaviour > BASIC source > screenshots > interpretation) - this note exists because the hierarchy was violated by conflation, not by skipping verification outright, which is a more dangerous failure mode precisely because it looks like verification happened.

## STATUS CLASSIFICATION SCHEME (replaces "resolved"/"unresolved")

Adopted 05 July 2026, on John's review. Forcing every finding into a binary "resolved"/"unresolved" doesn't fit software archaeology well - some things are settled, some are genuine unexplained features of the surviving material with no expectation of ever being resolved, and those two cases shouldn't share a status. Going forward, use:

- **Confirmed** - behaviour demonstrated directly from code or multiple independent sources.
- **Implemented** - recreated in DiverSim.jsx and verified.
- **Working Hypothesis** - current interpretation, subject to revision if new evidence emerges. (Replaces informal "HYPOTHESIS, not yet a finding" phrasing.)
- **Observed Anomaly** - a genuine feature of the surviving material with NO current explanation and no expectation of resolution. Records an objective fact for future readers without implying the listing is defective or blaming the original programmer.
    - Example: U24 - GOSUB 5060 exists, has no identified caller, and no attempt is made to infer a missing one; the fact is simply recorded as it survives.
- **Historical Variant** - the listing contains, or is suspected to contain, more than one version from George's development process (e.g. a handwritten amendment implying a changed GOTO target, or a case where the listing and emulator behaviour genuinely differ). Distinct from an anomaly:
    - this acknowledges multiple versions existed, not that one version is unexplained.
- **Deferred** - outside current project scope.
- **Not Yet Investigated** - known item awaiting analysis.

"Unresolved" is retired from new entries - it implicitly frames every open item as something to be fixed, which doesn't fit anomalies or historical variants that may never resolve and aren't meant to.

TWO-LEVEL STRUCTURE. TESTING_PLAN.md has become top-level-functionality heavy (splash screen, main display, depth gauge, etc.) as the project matured from "make DIVER work" to "understand how DIVER worked" - the smaller units (a single PLOT, a FOR...NEXT loop, a GOSUB, an inferred ROM behaviour) are exactly where interpretation and implementation meet, and deserve their own tracked entries rather than being absorbed into one top-level line. Going forward:

- Level 1 - Functional: what the user sees (e.g. "3. Time axis").
- Level 2 - Archaeological: the building blocks underneath it, each with its own status from the scheme above, e.g.:
    - 3.1 BASIC 1346-1348 - tick mark generation - Confirmed
    - 3.2 BASIC 1360-1361 - time axis label - Confirmed
    - 3.3 PLOT 2,246... - Working Hypothesis
    - 3.4 PLOT 30,16 - Observed Anomaly

APPLIED OPPORTUNISTICALLY, same as the phase-tag convention above - not a retrofit pass over everything already written. Existing entries keep their current wording until next touched; only new entries and entries being revised anyway adopt the new categories and two-level structure.

## STOCKTAKE mechanism

Purpose: a deliberate, periodic pause - not triggered by a surprising test result - to check whether currently-open loops, GOSUBs, and branches are actually fully developed and documented BEFORE further testing proceeds against them. Catches the case where testing has outpaced development (see methodology note above) and a "test" is quietly doing undocumented development work instead.

When: at natural pause points (session boundaries, after a batch of related T-numbers close, or whenever John wants to take stock - no fixed cadence). Not a substitute for the shared-subroutine call-site matrix or tick-at-a-time methodology below - this is a coarser, whole-project check; those are per-subroutine and per-loop mechanics.

What to check per open T/U-number:

- Is the underlying BASIC section (loop/GOSUB/branch) fully traced and understood, or only partially - i.e. is testing running ahead of development?
- Are all branches of a conditional/ON-GOTO actually implemented, or only the one branch the current test happens to exercise (cf. T17a: ASCEND/WORK/DECOMPRESS/REST stubbed, DESCEND only)?
- Does the call-site coverage match reality (cf. T19b's revised 3-site structure) rather than an assumed structure?

Log a STOCKTAKE entry in LOG.md (dated, tagged STOCKTAKE) summarising findings - what's genuinely settled, what's assumed, what's still stubbed - rather than editing TODO.md/TESTING_PLAN.md silently.

TESTING_PLAN.md will grow as a result of this process; that's expected, not a sign of scope creep.

## TICK-BY-TICK GOSUB COVERAGE - organising structure for remaining testing

Adopted 05 July 2026. Rationale: testing organised purely by top-level feature (splash screen, depth gauge, etc.) risks missing GOSUBs and branches that don't map cleanly onto any one feature - activity-gated subroutines in the main loop, one-off dive-start calls, and the activity-initiation dispatch block were all found this way, well after the features "containing" them had already been marked working. This section makes GOSUB/branch coverage the organising structure for everything from here on, not an afterthought discovered by accident.

METHOD: rather than testing each GOSUB in isolation, define a small number of reference dive scenarios, chosen so their COMBINED execution paths hit every GOSUB and every activity-gated branch at least once - standard branch/path coverage, applied to a 1979 BASIC program instead of modern code. Each scenario is run tick-by-tick against CCEMU (or DIVER7450.BAS directly), console/trace output captured, and cross-checked against this matrix's predictions.

REFERENCE SCENARIOS - concrete parameters set 05 July 2026. All confirmed against DIVER.bas's actual input prompts: TIME MODE (REAL/ACCELERATED, selects TK), WORKING DEPTH (WD), BOTTOM TIME (WORK duration), FOR HOW LONG (REST duration). DR=30/AR=15 are fixed constants, not user-set, so no scenario needs to specify them. DECOMPRESS's own duration is fully computed (PA(PA,2)=DX or D5), not user-prompted - Scenario B needs no decompress-duration parameter, only a WORK long enough to trigger it.

- Scenario A - simple path, no decompression obligation.
    - TIME MODE=ACCELERATED (TK=0.25), WD=18, BOTTOM TIME=10, no REST.
    - Shallow + short - expected to stay within no-stop limits on any plausible RNPL/BSAC-style table. DESCEND→WORK→ASCEND, no DECOMPRESS branch expected.

- Scenario B - decompression obligation forced.
    - TIME MODE=ACCELERATED (TK=0.25), WD=40 (reuses T18's own validated precedent), BOTTOM TIME=20, no REST. CONFIRMED (not estimated - corrected 05 July 2026): WM=40 gives J=16 (GOSUB 6100's depth-bucket index), and DT[16][1]=16 minutes is the confirmed no-stop limit at 40m - already calculated earlier this session. BOTTOM TIME=20 exceeds it by 4 minutes, with margin to spare. Will trigger DECOMPRESS; no fallback needed.
    - Exercises GOSUB 6800 (T30), 7500 (T28), 6250 (T26d), and the DECOMPRESS branch of GOSUB 6100 (T26c).

- Scenario C - includes REST.
    - TIME MODE=ACCELERATED (TK=0.25), WD=18, BOTTOM TIME=8, REST FOR HOW LONG=5. Built on Scenario A's shallow profile deliberately, to keep REST's own gating isolated from decompression complexity rather than conflating two open questions in one run. Exercises GOSUB 5700 (T27e, not yet traced) and REST's initiation branch (T26e, confirmed source - the simplest of T26's five branches, no GOSUBs at all).

- Scenario D - not a separate run: every scenario's final tick reaches MEMORY (T25) incidentally: call out and check explicitly each time.

ARTEFACT CONVENTION: full console/trace output per scenario, one file per run, following the existing tests/T18_\*_trace.txt naming pattern - e.g. tests/T_scenarioA_trace.txt. A GOSUB/branch is not marked Confirmed in the matrix below until a trace file shows it was actually hit, not just reasoned about from source. Source-level understanding alone earns Working Hypothesis or Not Yet Investigated, per the status scheme above.

COVERAGE MATRIX (T/U-number, or " - " where none yet assigned):

| GOSUB | Called from | Gating/context | Test | Status |
|---|---|---|---|---|
| 5000 | 1280,5315,5509,5710 | generic input prompt, shared | T27a/c/e | Partially exercised (T27a,e) |
| 5060 | none | unreachable | U24 | Observed Anomaly |
| 5300 | 2020 | DESCEND-select dispatch | T27a | CLOSED - Confirmed, Implemented |
| 5400 | 2050 | ASCEND-select dispatch | T27b | CLOSED - Confirmed, Implemented |
| 5500 | 2085 | WORK-select dispatch | T27c | CLOSED - Confirmed, Implemented |
| 5600 | 2110 | DECOMPRESS-select dispatch | T27d | CLOSED - Confirmed, Implemented |
| 5700 | 2140 | REST-select dispatch | T27e | CLOSED - Confirmed, Implemented |
| 5900 | 5550 (in 5500) | inside WORK-select | T32 | Working Hypothesis - behavioural, not cosmetic |
| 6100 | 1692 (in 1690 br.) | WORK-initiation | T26c-2 | Confirmed (17 July 2026) |
| 6200 | 3017 | main loop, WORK only | T29 | Confirmed (source) |
| 6250 | 1701 (in 1700 br.) | DECOMPRESS-initiation | T26d | Confirmed (source) |
| 6300 | 3410 | main loop, unconditional | T18/T24 | Working Hyp. (Br.1) / Not Yet Investig. (Br.2) |
| 6600 | 1445,3510,8010 | init/main loop/MEMORY | T19 | Confirmed, Implemented |
| 6700 | 1445,3520,8010 | init/main loop/MEMORY | T20 | Confirmed, Implemented |
| 6750 | 1445?,3530 | main loop, unconditional | T21 | CLOSED - Confirmed, Implemented |
| 6800 | 3540 | main loop, DECOMPRESS only | T30 | Confirmed (source) |
| 6850 | 1694 (in 1690 br.) | WORK-initiation | T26c-4 | Confirmed (source), not built |
| 6900 | 5503 (in 5500) | inside WORK-select prompt | T27c | Confirmed (via 5500) |
| 6950 | 1693,1694 | WORK-initiation | T26c-3 | CLOSED - Confirmed, Implemented |
| 7000 | ~90 call sites | shared DM digit writer | multiple | Confirmed (partial - see IDs 7-12 DECOMPRESS content, U21) |
| 7500 | 1888 | DECOMPRESS-end | T28 | Confirmed (17 July 2026) |
| 8000 | 1815 | end-of-dive | T25 | Not Yet Investigated |

GAPS THE MATRIX ITSELF SURFACES: T26's branch-selection question (RESOLVED 05 July 2026 - see T26 above: line 1665's ON AL(P,1) GOTO dispatch, all five branches including REST now identified and traced) is no longer one of these. Remaining: T26 is source-complete but has zero DiverSim.jsx implementation - Scenario A/B/C's traces are now purely for confirming the implementation matches source, not for discovering what the source does.

### T00 - Coordinate system (prerequisite)

COMPLETE. Output filed: reference/CoordinateSystem.md

- Two domains confirmed: text cursor (Domain 1) and plot graphics (Domain 2).
- Known 10.8px offset between domains at cyan/blue boundary - faithful to hardware.
- SVG W=480 (480/80=6px per char cell, whole number). H=400 (400/25=16px per row).
- Domain 1: SVG_x=col\*6.0, SVG_y=row\*16.0
- Domain 2: SVG_x=plotX\*(480/159)≈plotX\*3.019, SVG_y=400-plotY\*2.094

### T01 - Line 1010: ERASE PAGE, blue background

COMPLETE

- PLOT 6,39,12 - CCI byte 39 sets BG=blue FG=white; byte 12 = erase page.
- Result: solid blue rectangle W×H.
- Previously confirmed: yes. Repeat in new environment.

### T02 - Lines 1040–1100: cyan surface area + FRAME element

COMPLETE

- FOR I=0 TO 5: 79 spaces (cyan background) + PLOT 2,246,YO,158,Y1,...
- Result: 6-row cyan strip at top. FRAME bar at right edge (plot x=158-159, plot y=144-191 on 8001 grid). PLOT 30,16 sets black background at end.
- Previously confirmed: LOOPTRACE7/8 (FRAME position). Repeat cleanly.
- Note: FRAME purpose unresolved but position now derivable from 8001 grid.

### T03 - Lines 1210–1260: DM box black background

COMPLETE

- FOR I=1 TO 5: PLOT 3,66,I\*2 then 13 black spaces (cols 66-78).
- Result: black rectangle in cyan area, top-right.
- DM_X=396 (col 66 x 6px, confirmed by photograph: screen 19.8cm, DM left edge 16.4cm). DM_W=78 (13 cols x 6px). DM_Y=16 (row 1 x 16px).
    - DM_H=80 (5 rows x 16px, bottom flush with cyan/blue boundary SVG y=96).
    - Prior values DM_X=427, DM_W=77, DM_H=84, DM_Y=12 all wrong.
- PRINT " "; semicolon confirmed: keeps characters on same row.
    - Was missing from transcription; found by emulator testing.
- U10: I\*2 cursor skip produces solid rectangle - mechanism not yet explained.
    - Rendered as solid rect; experimentally justified by emulator screenshot.
    - Cyan-background retest pending.

### T04 - Lines 1261–1264: "5 METRE UNITS" vertical label

COMPLETE

- PLOT 6,38 (CCI byte 38: BG=blue FG=cyan) + PLOT 27,10 (vertical mode on) + PRINT "5 METRE UNITS" + PLOT 27,11 (scroll mode).
- Result: cyan characters running vertically down left edge of blue area.
- Position: confirmed photographically.

### T05 - Lines 1265–1266: title text

OPEN - investigation paused. Code in DiverSim.jsx at col 29, rows 11–12 per Y-masking formula. Position provisional - Y-masking may not apply on this hardware. Not photographically observed at any stage.

ACTION, John's explicit decision (24 July 2026): move "DIVER SIMULATION MODEL" title text and its underline to the very bottom of the screen - currently getting in the way. Not a historically-confirmed position (not seen in the photographs on file); John's own compromise, made because the original position isn't known, not because bottom is believed correct. Not yet implemented. Does not resolve the question below - that stays open in parallel as the historical question, tracked separately from where the reconstruction actually places the element.

Investigation (DiverSimT05test.jsx):

- Small characters active at line 1265 (PLOT 14,15 at line 1261).
- In small character mode, title text lands near time axis label area (bottom of screen), not mid-screen as previously assumed.
- "TIME AT 10 MINUTE INTERVALS" (PRINT, character cell layer) could obliterate the title line but not the underline (one small row below).
- Domain 2 PLOT 2 tick marks do not overwrite character cell content.
- PLOT 27,11 at line 1264 sets scroll mode - scroll behaviour on this hardware unknown. May account for content movement or disappearance.
- → U11: scroll behaviour must be understood before T05 can be closed.

### T06 - Lines 1273–1277: depth scale tick marks

COMPLETE

- PLOT 2,250,0 (X Bar Graph) then FOR I=140 TO 40 STEP -10: PLOT I,1
- Result: 11 cyan tick marks at left edge of blue area.
- Position: col 1 (SVG x=6px), one character wide (6px).
    - Confirmed by photograph: ticks hard on left edge at col 1, not col 0.
- SVG y positions (Domain 2 formula):
    - plotY=140 -> SVG y=106.8px (surface boundary)
    - plotY=40 -> SVG y=316.2px (50m tick)
- Colour: uniform cyan with all axis elements.

### T07 - Lines 1278–1281: working depth prompt and validation

COMPLETE

GOSUB 5000: PLOT 6,48 (BG=cyan FG=black) + PRINT "WORKING DEPTH " + INPUT M [1281] IF WD<=0 OR WD>=50 THEN 1279 - re-prompt if invalid.

- Error: CHR$(7) bell (approximated as 1400Hz/300ms tone). No visible error text.
- Prompt appears at col 0, row 0 over existing cyan area, in sequence after T06.
- Animation ticker pauses until valid entry. Prompt clears on acceptance.
- Blinking block cursor: SVG rect, 0.75s step-end. Char width multiplier: 0.57.
- BASIC_WD assigned on valid entry. Test value: WD=40.
- Rendered as interactive animated prompt - not a static end-state.

### T08 - Lines 1300–1355: variable initialisations and time mode selection

COMPLETE

- [1300] DR=30, AR=15, AD=0, CL=0. [1301] WM=0, LM=0.
- [1303-1308] INPUT "TIME MODE (REAL OR ACCELERATED)? " at col 0, row 0.
    - Same prompt style as T07: black on cyan, blinking block cursor.
    - "REAL" -> TK=1/32. "ACCELERATED" -> TK=0.25.
    - No validation loop - fall-through on invalid input (faithful to BASIC).
- [1316] IK=TK; IF IK<0.5 THEN IK=0.5.
- [1320] XS=1, LA=0. [1330] IF WD<17 THEN XS=0.5. [1340] IF WD>20 THEN XS=2.0.
- [1345] YS=2. [1349] WE=0, HT=0, D5=0, DX=0. [1350] AY=-1. [1355] BT=0.
- All variables set in handler on Enter. Test values: TK=0.25, XS=2.0, YS=2.
- Rendered as interactive animated prompt - not pure state.

### T09 - Lines 1346–1348: time axis tick marks

COMPLETE. Ticks rendered 2 plot units tall (doubled from BASIC's 1 unit to match photograph appearance). ⚠ Provisional: if U09 y-formula is inaccurate, the apparent tick size in the photograph may reflect scale distortion rather than confirmed 2-unit hardware behaviour. Ruler measurement unlikely to resolve this definitively - held as an open question in the notes. Count and spacing runtime-computed from BASIC_XS.

- SVG y=326.7px (plotY=35, Domain 2). ⚠ y-position subject to U09.
- PLOT 6,38 (cyan) + FOR I=1 TO 150 STEP XS\*10: PLOT I+10,35
- At WD=40, XS=2.0: 8 ticks at plotX=11,31,51,71,91,111,131,151.
- Tick: 1 plot unit wide (≈3px), 2 plot units tall (≈4.2px).
- Tick computation deferred to runtime (computeTimeTicks) - BASIC_XS not known until T08 completes.

### T10 - Lines 1360–1361: "TIME AT 10 MINUTE INTERVALS" label

COMPLETE. Character by character at 20ms after time axis ticks.

- Position: col 27, SVG y=336px (row 21). Confirmed by photograph.
- ⚠ DISCREPANCY: Y-masking gives 40 AND 0x1F = row 8 = SVG y=128px.
    - Photograph gives row 21 = SVG y=336px. Difference: exactly 13 rows (208px).
    - Leading hypothesis: scroll events triggered by PRINT statements between lines 1264 and 1360 shift the effective cursor origin by 13 rows.
    - Connects directly to U11 (PLOT 27,11 scroll mode behaviour unknown).
    - All PLOT 3 positions after line 1264 should be treated as photograph-calibrated until U11 is resolved - do not rely on Y-masking formula alone for this region. T10 marked complete on photograph evidence.
- Result: cyan label 2 rows below cyan boundary.

### T11 - Lines 1362–1368: NOSTOP string in DM

COMPLETE

- CO=1, FL=0 → PLOT 6,2 (CCI byte 2: BG=black FG=green).
- IDs 1-6, VA=78,79,83,84,79,80 → "NOSTOP" via GOSUB 7000.
- Six GOSUB 7000 calls, one per character. 20ms universal rate.
- Position: DM_Y+13px vertical. NOSTOP_X = DM_X + 2×NOSTOP_CHAR_W.
- Font: BedsteadBoldUltraCondensed, NOSTOP_FONT=11px, width multiplier 0.62.
- Spacing accommodates "NOSTOP 30" (9 chars) within DM width - see T21+.
- DM_FONT_FAMILY constant: all 8 Bedstead variants as switchable options.
- Fonts self-hosted at src/assets/fonts/ (not Font Library CDN).

### T12 - Lines 1370–1410: PA array and scalar initialised

COMPLETE. No screen output - pure state.

- BASIC_PA: 9×6 zero-filled array (1-based, index 0 unused).
    - PA(1,1..5) = 1, BASIC_DR, 0, BASIC_WD, 3 (first DESCEND entry).

BASIC_PA_scalar = 1 (dual scalar/array convention per STYLE_GUIDE).

Both declared at module level. Populated in handleTmKey after T08 variable initialisations - depends on BASIC_WD and BASIC_DR.

### T13 - Lines 1416–1440: ES array and scalars initialised

COMPLETE. No screen output - pure state.

- BASIC_ES: 31×3 zero-filled array (1-based, index 0 unused).
    - ES(0,1), ES(0,2), ES(1,1), ES(1,2) explicitly set to 0 per BASIC.
- BASIC_ES_scalar = 1, BASIC_EP = 0. Both module-level.
- Dual scalar/array convention (BASIC_ES_scalar) per STYLE_GUIDE.
- All initialisations in handleTmKey alongside T12.

### T14 - Line 1445 GOSUB 6600: initial depth gauge in DM

COMPLETE. Visually confirmed this session.

- gosub_6600() and gosub_7000() functions in place.
- At AD=0: space at ID=19 (leading zero suppressed), '0' at ID=20.
- ID=21: skipped at AD=0 (integer depth). Red digits at correct DM position.
- Six stub markers in code: T14a–T14e, T15a. See TODO DM BOX.

### T15 - Line 1445 GOSUB 6700: initial air gauge in DM

COMPLETE. Static CL=0 only - must become dynamic at T20 (see T15a stub).

- gosub_6700() implemented via BASIC lines 6700–6745. At CL=0, XS=2.0: VA=13.
- Renders 18 blocks bottom to top: 1 dark / 2 blue / 14 green / 1 dark.
    - Block pitch: 4px (3px block + 1px gap). Width: DM_CW\*1.2, at DM_X+1.
    - Integer arithmetic throughout for regular spacing. Photo-calibrated.
- ⚠ Colour discrepancy: BASIC line 7301 and archive compute 3 magenta fixed blocks; photograph shows 2 blue. Current rendering uses 2 blue.
    - CCI decode or CRT phosphor uncertainty. Not fully resolved - see LOG.
- NOSTOP confirmed double-height (NOSTOP_FONT \* 2 = 22px), consistent with PLOT 14 extended character set behaviour on 25-line unit.
- ⚠ STUB T15a in place - static CL=0 only.

### T16 - Line 1460 DIM AL(15,7): array allocated

No screen output. Log only.

## METHODOLOGY NOTE - shared subroutines and call-site coverage

Several GOSUB targets (6600 depth digits, 6700 air gauge, 6750 NOSTOP display, and possibly others) are called from more than one point in the main engine loop - DESCEND, WORK, ASCEND, DECOMPRESS, REST - and again from the end-of-dive MEMORY phase. A test confirming the mechanism at ONE call site (e.g. T19 confirming GOSUB 6600 during DESCEND) proves the subroutine works, not that every call site is covered: parameters, flags (e.g. FL), or context-dependent behaviour may differ between passes.

For any such subroutine, maintain an explicit call-site matrix (one row per phase, plus MEMORY) rather than a single COMPLETE/OPEN tag.

Do not mark a shared subroutine fully confirmed until every call site that the BASIC listing actually exercises it from has its own row.

Confirm from the listing which phases genuinely call it - do not assume all five activity types plus MEMORY apply without checking.

See GOSUB 6600 call-site matrix under T19 below for the first application of this principle. Apply the same structure to GOSUB 6700 (T20) and GOSUB 6750 (T21) as work on those phases proceeds.

## METHODOLOGY NOTE - tick-at-a-time approach (T18 onwards)

Animated/looping tests are verified one tick at a time rather than implemented and run to completion in one step:

- T18 tick 1: execute lines 1465-1471 once (CL advances by TK, AD check), GOSUB 6300 Branch 1 draws exactly one profile segment. Verify position.
- T18 tick 2: repeat, confirm second segment joins correctly, AD advances.
- Continue tick by tick until the descent profile is confirmed correct, at which point T18 is marked complete and the tick loop trusted.
- T19: add GOSUB 6600 into the trusted loop, watch depth digits per tick.
- T20: add GOSUB 6700 into the loop, watch air gauge update.
- T21: add GOSUB 6750.

This isolates each new mechanism against an already-verified base, rather than debugging multiple simultaneous unknowns.

### T17 - Lines 1461–1789: first event fire, DESCEND committed

COMPLETE. Manually traced step-by-step against BASIC listing.

- At AD=0, WD=40, DR=30, TK=0.25: AL[1][7]=0.25+(40-0)/30=1.583. AL(1,1..7) populated. ES slots written. CK=0.
- Note: LOOPTRACE1.BAS (cited below) is unavailable post-reset and carries no evidential weight - see DESIGN_NOTES.md archived-material principle.
- ON AL(P,1) GOTO: only DESCEND branch exercised. Other 4 branches (ASCEND/WORK/DECOMPRESS/REST) stubbed - T17a.
- No screen output from this section alone. Log only.

### T18 - Lines 3400–3408 + GOSUB 6300 Branch 1: descent profile

STARTED - in progress. Tick-at-a-time approach (see methodology note above).

- AD update per tick. GOSUB 6300 Branch 1 implemented as point-to-point line (LP,MP)→(LQ,MQ) per tick - UNCONFIRMED assumption.
- CCI byte 32: BG=blue FG=black. Confirmed visible in photograph.
- ⚠ PLOT 6,32,29,2,253,LP,MP,242,LQ,MQ,255 sends individual bytes; how the VDU interprets 253/242 within the byte stream (separators, sub-modes, or other) is UNKNOWN. Point-to-point line is an assumption, not confirmed.
    - Photograph evidence suggests a possible vertical-drop step pattern rather than a smooth diagonal. Emulator byte-stream testing in progress.
- ⚠ Coordinate formula SVG_x=plotX\*(480/159) depends on plot grid dimensions - currently under investigation (open question, see LOG). Do not treat as settled until resolved.
- Render end-state target: 6 ticks, AD=40, CL=1.75.

**T18c** - ASCEND depth-update (lines 3406-3408). IMPLEMENTED (17 July 2026, SB): AD never changed during ASCEND before this fix, leaving Branch 1's profile line with nothing to draw during that activity despite CL genuinely advancing - the track appeared frozen at WORK's end point. Mirrors DESCEND's own tick-by-tick logic, subtracting via AR toward the target instead of adding via DR. Confirmed live as part of the first full end-to-end dive-cycle trace. See LOG.md 17 July 2026.

### T19 - GOSUB 6600 during descent: depth digits update

DESCEND call site: COMPLETE. Red digits counting up as AD increases, confirmed under WD=40/DR=30/TK=0.25: blank+7, 15, 22, 30, 37, 40, with leading-zero suppression working correctly at AD<10. End-state: "40" in red at DM row 1 right. Source: LOG.md, 03 July 2026.

Tens/units digits (IDs 19-20) use Math.floor(BASIC_AD) on the working assumption that AD has implicit INT typing from first assignment in the original BASIC - not independently confirmed from the listing.

GOSUB 6600 call-site matrix - REVISED 05 July 2026 (see LOG.md). Direct search of DIVER.bas shows only 3 call sites, not one per activity type:

INIT (line 1445) - COMPLETE (T14).

LOOP (line 3510) - COMPLETE (this entry, T19). Reached via `4000 GOTO 1465` identically for all 5 activity types (DESCEND/WORK/ASCEND/DECOMPRESS/REST) - the activity branch at line 3400 gates whether AD changes, not whether GOSUB 6600 fires. The DESCEND test therefore already covers WORK/ASCEND/DECOMPRESS/REST, which do not call GOSUB 6600 from any separate location.

MEMORY (line 8010) - not yet tested. AD=WD:GOSUB 6600:GOSUB 6700 (no accompanying GOSUB 6750 - no NOSTOP display once the dive is over, consistent with expected behaviour).

Previous version of this matrix assumed a row per activity type (WORK/ASCEND/DECOMPRESS/REST/MEMORY); that structure was wrong - see LOG.md 05 July 2026. Apply the same call-site-count check to GOSUB 6700 (T20) and GOSUB 6750 (T21) before building matrices for those.

T14c (FL flag, colour for IDs≥19) and T14e (PLOT 29 at line 6601) are RESOLVED - both are properties of GOSUB 6600's own header (FL=0 set at line 6610 before any ID branch; PLOT 29 fires as the first statement, before the AD=AY early-return check), true on every call regardless of call site. No per-call-site testing was needed to close these; see LOG.md 05 July 2026.

### T20 - GOSUB 6700 during descent: air gauge update

- VA=13-INT(CL\*XS/10), counting down slowly.
- At CL=1.75, XS=2.0: VA=13-INT(0.35)=13. No visible change yet.

### T21 CLOSED (10 July 2026, confirmed by John) - GOSUB 6750 during descent: NOSTOP/time-to-next-bound display.

Mechanism fully confirmed end-to-end: gosub_6750 observed cycling correctly through multiple decompression-table bounds (row 16, [16,21,25,28,30,31,999]) - no-stop time countdown, switching to time-to-next-bound, re-targeting each successive column, finally hitting the genuine OUT OF RANGE halt (line 6763) once the row ran out. First end-to-end observation of this multi-bound cycling; strong confirmation of the WM fix (line 6752) along with the rest of the translation. IDs 7-12/13-18 CONTENT (as opposed to the mechanism) still pending U08 analysis - separate from this closure. See TODO.md T21, LOG.md 10 July 2026.

BUG FOUND AND FIXED (27 July 2026, SB), post-closure - doesn't reopen this closure, but a real gap existed alongside it until now. [6751] `IF I<>1 AND I<>3 THEN 6799` means GOSUB 6750 does a bare RETURN, no PLOT calls, once the activity isn't DESCEND/WORK - real hardware leaves the DM cells exactly as they were. The port's gosub_6750() was correctly computing `cells: []` in that case, but the call site was unconditionally calling setBoundCells with it anyway, blanking the display instead of leaving it - not present before GOSUB 6850 landed, or masked until then, since nothing else had written into those cells yet. Fixed by only calling setBoundCells when GOSUB 6750 (or 6850, or 6800) actually produced cells. Confirmed against John's photographic evidence (STOP10 + the "T" line persisting well into DECOMPRESS/ASCEND, rather than reverting). Same root cause independently found by HK in GOSUB 6700/air gauge (T43, working number) - same fix pattern applied there too, also confirmed fixed. See LOG.md 27 July 2026, TODO.md.

Related, already-existing mechanism (not new): GOSUB 6850 and GOSUB 6750 write the same DM cells and can both fire on the same tick - gated via a one-shot ref (nostopEventCellsRef) so 6750 skips exactly one write on the tick 6850 fires. Necessary specifically because React's synchronous batching means the later call would silently supersede the earlier one before any frame is drawn - not equivalent to real hardware's "briefly visible, then redrawn," since there's no frame in between here to make the first write visible at all.

### T22 - Lines 3010–3025: display loop gate and CK flag

- Verified by LOOPTRACE3.BAS.
- Prompt "WHICH ACTIVITY REQUIRED (WORK)" fires one IK before event.
- No permanent screen change. Log only.
- Implemented in DiverSim.jsx: PARTIAL (10 July 2026) - the isolated prompt itself (boundary detection, authentic SVG display, input capture against A$(1..5)) is implemented and tested working. PA building / NA consumption / createEvent() deliberately NOT included - separate step, feeds T26/T27. See TODO.md T22, LOG.md 10 July 2026.

### T23 - Lines 1800–1910: end-of-event handler post-DESCEND

- Verified by LOOPTRACE4.BAS.
- PA rebuilt for WORK activity. No screen output. Log only.
- Implemented in DiverSim.jsx: NO (10 July 2026) - source behaviour verified via LOOPTRACE4.BAS, but nothing under T23 exists in the sim.
- FINDING (10 July 2026): line 1800 (`IF AL(AL,1)<>5 THEN 1881`) is the actual dive-termination check - dive only ends when the just-ended event was REST, triggering GOSUB 8000+END. Without T23, REST loops indefinitely (faithful default PA(5)=5, no exit). DECISION (John): known gap, not being fixed now. See TODO.md T23, LOG.md 10 July 2026.
- UPDATE (17 July 2026, SB): T23's REST auto-chain now implemented.
- CORRECTION, same date: the loop is a genuine architectural property of DIVER.BAS itself, not a blocked dependency. [5730] `PA(PA,5)=5` is unconditional in source, no exception anywhere in GOSUB 5700 - once REST is reached it always routes back to itself. The earlier attribution to GOSUB 6950/6850 (T26c-3/4) still being stubbed does not hold up - neither touches PA/AL/NA or any routing variable; both are pure DM-digit display writers and would remain so once built.
- Open question, not investigated: whether the original 1979 program expected an out-of-band interrupt (BASIC BREAK/STOP) to end a REST-heavy dive. Known gap, still deferred per John's 10 July 2026 decision. See TODO.md T23, LOG.md 17 July 2026.

## WORK PHASE (not yet fully analysed)

### T24 - GOSUB 6300 Branch 2: coloured band mountain

Major section (lines 6330–6593). First in-situ photographic evidence available. Submode mechanism IDENTIFIED (05 July 2026): line 6525 matches the Y Bar Graph auto-chain (246→245→244) from DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx exactly - vertical bar graphs, one per DT column. See LOG.md, TODO.md T24.

FULL SOURCE PULLED (10 July 2026, SB) - richer than "coloured bands" suggested. For each time-axis column since the last tick, draws TWO things: a stack of coloured vertical bars (scanning DT's 7 columns for where elapsed time crosses each decompression bound - the ceiling structure, stacked like layers) and a single marker dot at the diver's current position (X3,Y3) - the "mountain" reading, since the bands form a profile and the dot tracks position against it.

SPLIT into T24a-d, smallest/least risky first (10 July 2026, SB):

**T24a** CLOSED (05 July 2026, confirmed by John) - outer setup (column loop bounds LP/LQ, LM skip-check, per-column resets Y3/XX/Y2/C/L/CO) implemented and tested via a dedicated stepper added to DiverSim2.jsx - a "Force WORK (AL=3)" debug button plus an on-screen readout, extending the existing manual tick-stepper pattern rather than console (which proved unreliable this session - dev-server/iframe console-context issue, worked around not resolved). Observed alternation (LM advancing every other tick) confirmed EXPECTED - XS=2.0/TK=0.25 arithmetic, identical to T18's already-confirmed Branch 1 pairing rhythm (LP/LQ/LM shared between both branches) - good cross-confirmation, not a new finding. DiverSim2.jsx's stepper additions are testing scaffolding; not yet decided whether to carry into DiverSim.jsx. See LOG.md, TODO.md T24.

**T24b** CLOSED (05 July 2026, confirmed by John) - diver's position dot (`[6591] PLOT 2,253,X3,Y3,255`), implemented in DiverSim2.jsx's stepper, reusing the same plotX/plotY helpers already proven for T18's profile line - no new geometry needed. Tested via the Force WORK workflow: with AD fixed at WD (40m) throughout (WORK doesn't change depth), the dot renders precisely on the 40m depth tick, confirmed visually against the existing tick scale. Rendered as a small yellow circle, distinct from Branch 1's white profile rects, so both remain visible and distinguishable during testing.

**T24c** - Band-search arithmetic, still no drawing. Source, lines 6350-6390 plus the state-carry lines that let the loop iterate correctly (6540-6570):

```
FOR J=1 TO 7
  FOR I=L TO 21
    IF DT(I,J)=999 OR DT(I,J)<XX THEN [exit inner loop]
  NEXT I
  Y1=INT(140-(2*I+8)*YS); Y1=Y1+2: IF Y1=42 THEN Y1=40
  IF Y1<40 THEN Y1=40
  IF Y3<Y1 OR Y3>Y2 THEN [skip to next J]
  ...
  IF Y1=40 OR C=7 THEN [stop scanning]
  IF DT(I,J)=999 THEN [stop scanning]
  Y2=Y1-1; C=C+1; L=I
NEXT J
```

This is the scan that finds each band's depth boundary (Y1) by searching the DT table, and checks whether the diver's current position (Y3) actually falls within that band (line 6390) - plus the bookkeeping (Y2, C, L) needed to correctly step through all 7 potential bands, not just the first. SCOPED (10 July 2026): build the full J/I loop structure and the Y1/Y2/C/L arithmetic, with the actual drawing calls (lines 6500-6525, PLOT 29/PLOT 2,246) explicitly stubbed out - same treatment already given to GOSUB 6100/6950/6850/6250/5900 elsewhere. Confirms which bands exist and where their boundaries fall, via an on-screen readout, before committing to how they should actually be rendered.

BUG FOUND AND FIXED (10 July 2026, SB): inner I-loop was defensively bailing out on running to completion without an early exit, treating it as an error. Real BASIC FOR-NEXT semantics: I settles at 22 (one past the upper bound), execution continues normally. CONFIRMED GENUINE (checked directly against source data, not a display artifact): column X3=37, J=3, DT(20,3)=16 and DT(21,3)=15 vs XX=13.25 - neither matches, table genuinely exhausted. With I=22:

Y1=INT(140-(2×22+8)×YS)=36 (corrected from an initial arithmetic slip of 38, caught on review), then +2=38, then <40 clamp fires, Y1=40 - the line-6540 "hit the ocean floor" exit condition. Meaningful, correct termination.

PREMATURE CLOSURE RETRACTED (17 July 2026): marked CLOSED earlier the same day on an SB report that presented its own harness-computed predictions as if they were values read off John's live screenshots - the file John was actually testing was still unfixed throughout. Not caught before being logged. See LOG.md for the full account.

**T24c** RE-CLOSED (17 July 2026), with real evidence this time: John re-ran ticks 45/46/47 against the same unfixed file, reproduced the blank row twice more, and uploaded the actual file in use - byte-for-byte identical to the pre-fix snapshot. Fix re-delivered with an md5 checksum; John reloaded and re-ran tick 45 himself, now showing `J=2 I=22 Y1=40 Y2=61 C=2 [diver in range, CO=2] (would draw)` - the case combining table exhaustion with the diver's first in-range hit, most likely to expose a further bug if one existed. Confirmed live, by John directly, on the actual running file.

OBSERVED INVARIANT, re-confirmed against the genuinely-fixed file: I=22 would make line 6541 index DT[22] (out of the 1..21 table bounds), but line 6540's Y1=40-or-C=7 clamp always fires first on any table exhaustion, so this is never reached.

**T24c2** RESOLVED (10 July 2026, John, isolation test on CCEMU) - colour/ grammar analysis, between T24c and T24d. `PLOT 29,C(C)` (line 6510) and `PLOT 30,C(CO)` (line 6590) grammar confirmed: no byte leakage into the output stream at any of 7 tested values (X=1-7, screenshot on file).

PLOT 29 sets the foreground display attribute; PLOT 30 sets the complementary background attribute. Cross-confirmed against a direct Compucolor II manual excerpt (new source - see LOG.md): PLOT 29/30/31/14/15 are documented as "the second method of setting color, blink and character height," i.e. display-attribute commands, not drawing commands - exactly matching the test result.

TERMINOLOGY CORRECTED: C() is not a "colour array" - a table of Compucolor display-attribute values, of which colour is one effect, not the whole of what's selected. George's use of C(1..7)=20,23,18,22,19,17,16 rather than inlining raw PLOT 29 values throughout is a deliberate abstraction, insulating the rest of the program from the hardware codes.

U07's grammar question CLOSED by this result.

**T24d** CLOSED (17 July 2026, SB): actual band rendering (the PLOT 29/PLOT 2,246 Y-bar-graph drawing) confirmed working in DiverSim.jsx itself, not just DiverSim2.jsx - matches the earlier photograph confirmation exactly, including the diver's track switching from a solid line to a dash/space pattern while crossing the mountain (John's specific request). Native per-column resolution, ported from the already-confirmed DiverSim2.jsx geometry. See LOG.md 17 July 2026.

U07's grammar/colour question RESOLVED (T24c2, above). Semantics of WHICH band gets WHICH attribute (i.e. what the C() index actually maps to per decompression state) remains open for T24d to establish.

## END PHASE

### T25 - GOSUB 8000 (MEMORY, end-of-dive display), reached once via line 1815.

Quite distinct in operation from the tick-loop phases - a separate "end phase" not previously documented as its own category in this plan - but reuses established GOSUBs (6600, 6700, 7000) in a new, non-loop context.

IMPLEMENTED 09 August 2026 (SB) - supersedes everything below this point in the entry, which described the pre-implementation state.

Full source block recovered and implemented, substantially more than the previously-known line 8010 refresh alone:

- 8005/8006: heading - positions the cursor above the DM box and prints "MEMORY" (does not itself paint a background - a separate, minor rendering issue, DEFECT_REGISTER.md DEF-010).
- 8010: `AD=WD:GOSUB 6600:GOSUB 6700` - forces AD to working depth before calling the depth-gauge and air-gauge routines one final time. Confirmed: AD=WD deliberately restores the working depth in the red depth digits (source-correct, not a bug) and GOSUB 6700 refreshes/checks the air indicator. No GOSUB 6750 call - no NOSTOP display once the dive is over, per source, as expected.
- Explicit rewrite of DM IDs 1-18: top MEMORY row derived from BT, formatted to minutes:seconds via lines 8020-8060. For a decompression dive, the lower two rows restore saved decompression requirements (`D5=E5:DX=EX`) and display as "10M \<DX>:" / "5M \<D5>" - the differing punctuation (explicit ASCII 58 colon on the 10m row; the 5m row's final cell explicitly blank) is source-correct, not to be regularised.
- Source boundaries [8062]/[8063] (`IF WM<10 THEN NS=0`,`IF NS<0 THEN 8074`) inside GOSUB 8000 itself - not yet confirmed exercised by the WD40/BOTTOM TIME 20 test case; flag for a dedicated check rather than assuming covered.
- No new stubbed dependency exposed - uses already-implemented 6600/6700/7000.

WD40/BOTTOM TIME 20 test case: DM CONTENT VERIFIED 10 August 2026 (John/SB). `21:45` / `10M 5:` / `5M 15` / red `40` is regarded as verified correct - no outstanding defect in MEMORY DM content. Do not alter these values to fit the poor-quality historical photographs; photographs are corroborative only.

Evidentiary basis, kept as three distinct pieces of evidence rather than compressed into "CCEMU proved the complete MEMORY display" (an overstatement caught and corrected 09 August 2026 - retain the distinction):

1. Original BASIC/CCEMU tracing proved the final WORK-stage BT progression 11→17→20→21.75 (via the GOSUB 5900 investigation, see DEFECT_REGISTER.md DEF-011) - so BT=21.75 is what enters GOSUB 8000.
2. BASIC source lines 8020-8060 prove HOW that BT decomposes into 21:45 (.75 minute → 45 seconds; no rounding to 22:00).
3. The JSX demonstrates the completed display.

UPDATE 14 August 2026: the CCEMU DM/NOSTOP sequence capture test (see DEFECT_REGISTER.md DEF-002) ran the WD40/BOTTOM TIME 20 profile end-to-end in CCEMU and directly observed the final MEMORY display as `21:45` / `10M 5:` / `5M 15` / red `40` - item 1 above is therefore no longer just a BT=21.75 trace; the full display has now actually been observed in CCEMU too. Items 1-3 above remain three distinct pieces of evidence (still not one single CCEMU run that ALSO independently re-derived items 2/3 from scratch), but the CCEMU side of the evidence is now stronger than a mid-dive BT trace alone.

Photographs too poor to confirm the top row reliably, but the lower two rows are corroborated by them.

Explicitly separate from this verified content: DEF-010 (MEMORY heading cosmetic rendering - outside the DM content, does not reopen this). DEF-011 (GOSUB 5900/WORK staging not yet implemented - concerns how the correct BT is produced upstream for WORK periods that cross a decompression-table boundary; does not make this verified GOSUB 8000 formatting/content wrong).

Remaining open: DEF-010 (heading background, cosmetic only). Also entangled: DEF-011 (GOSUB 5900 not yet implemented - MEMORY's top-row correctness in general depends on BT being correctly staged, which this WD40/BT20 case happens to get right without 5900 because its final endpoint converges, not because BT production is confirmed correct generally) and DEF-002 (whether GOSUB 6950/STOP10-STOP5 re-fires across 5900-staged WORK boundaries, reopened).

#### Original pre-implementation entry, kept for history

Line 8010: `AD=WD:GOSUB 6600:GOSUB 6700` - forces AD to working depth before calling the depth-gauge and air-gauge routines one final time for the summary display.

Expected: AD=WD forces full-depth digits (IDs 19-20, per T19's confirmed digit format); no GOSUB 6750 call - no NOSTOP display once the dive is over, per source (see LOG.md 05 July 2026).

Spun out from T19b (05 July 2026) once GOSUB 6600's call-site structure was otherwise fully confirmed - this is the one call site never actually exercised. NOT YET TESTED.

### T26 - Activity-initiation dispatch (lines 1665-1710).

SPLIT into five sub-tests, 05 July 2026, at John's request - one dispatch block was too large a unit to follow. Dispatched by `1665 ON AL(P,1) GOTO 1670,1680,1690,1700,1710` - one branch per activity, per U18's confirmed mapping (1=DESCEND, 2=ASCEND, 3=WORK, 4=DECOMPRESS, 5=REST). All five source-traced and CORRECTED 05 July 2026 (an earlier reading had 1680/1690 swapped and had missed 1710 and line 1665 entirely - see LOG.md). Nothing in this block exists in DiverSim.jsx; each sub-test below is implementation only, no further source tracing needed.

**T26a** CLOSED (10 July 2026) - DESCEND-initiation (line 1670). Confirmed (source) and Implemented in DiverSim.jsx: tested and confirmed working.

Simplest of the five: `AL(P,7)=AL(P,6)+(AL(P,4)-AL(P,3))/AL(P,2)`. No GOSUBs. First of the T26/T27 sub-tests completed, tick-by-tick, per the version-snapshot/small-steps approach adopted after the earlier combined-attempt revert.

**T26b** CLOSED (28 July 2026, SB) - ASCEND-initiation (line 1680).

`AL(P,7)=AL(P,6)+(AL(P,3)-AL(P,4))/AL(P,2)`; line 1682 blanks IDs 13-18 to spaces (VA=32, six GOSUB 7000 calls) - clears the decompression-stop-time DM field on beginning to ascend. CONFIRMED, raised from Implemented same day: merges into boundCells row 3 the same way GOSUB 6250/6800/6850 already do. Closes the known gap where "5M 20:" (or GOSUB 6850 Branch B's row-3 fall-through) would persist visibly into ASCEND - flagged repeatedly through this session as an expected, pre-existing, not-yet-fixed gap; now fixed.

LIVE EVIDENCE (WD40/BT22): row 3 showed "5M 20:" while the ASCEND look-ahead prompt was up but before the AL-create event for ASCEND had fired (event log ends at "GOSUB 7500 fired: HT 10 -> 5", no AL-create for activity 2 yet). Next screenshot, after the event log advances past "AL-create firing: PA[PA_scalar]=2,15,10,5,4" (activity code 2 = ASCEND), shows row 3 genuinely empty (DM box: "STOP10 6" / "T20:00", no third line) at the following prompt. Transition correlates exactly with the AL-create event, same live-diagnostics-plus-event-log evidence standard as everything else in this batch.

NOTED, NOT YET SEPARATELY CONFIRMED: same test's inputs show HT=5 at the second DECOMPRESS stop, meaning GOSUB 6250's own IF HT<=5 gate should make it a no-op there - row 3 should stay blank through the second stop rather than repopulating. Consistent with expectation but not directly evidenced yet; worth confirming on a future screenshot, not blocking.

This closes the ASCEND/DECOMPRESS DM-field batch in full: GOSUB 6250 (T26d), GOSUB 6800 (T30), GOSUB 6850 (T26c-4), and T26b are all Confirmed. See LOG.md 28 July 2026.

- **T26c** - WORK-initiation (line 1690-1695). Confirmed (source).
- SPLIT FURTHER (10 July 2026, per John): the earlier decision to keep this as one sub-test was reconsidered given the T26/T27 combined - attempt failure - as scoped, T26c actually needs four new things (the arithmetic, plus three unbuilt GOSUB functions), not one. None of GOSUB 6100, 6950, or 6850 exist as functions in DiverSim.jsx yet.
- Split the same way T27c split off GOSUB 5900.

**T26c-1** - event-creation arithmetic (FIRST PIECE, scoped now): just `AL(P,7)=AL(P,6)+AL(P,2)` and `E5=D5:EX=DX`, with GOSUB 6100/6950/6850 explicitly marked as not-yet-implemented stubs (same treatment GOSUB 5900 got under T27c). This alone is expected to fix the unbounded - ticking behaviour observed under T21's closure (see LOG.md 10 July 2026) - it's what makes AL(AL,1) actually become 3 (WORK) instead of staying 1 (DESCEND), which was the real cause of that observation, not a defect in GOSUB 6750. NOT YET TESTED.

**T26c-2** - GOSUB 6100 (decompression-bound check): compares this event's depth AL(AL,3) and bottom time AL(AL,7) against the DT table, updates D5/DX/HT; hard STOP at line 6181 on table overrun, needs graceful handling if implemented. CONFIRMED (17 July 2026, SB) - hand-verified against the DT table for two profiles (40m/22min, 40m/5min) before live testing; live results since have matched that hand calculation exactly (HT=10, DX=5, D5=20 predicted and observed).

Extends the same live-diagnostics-plus-event-log evidence standard that closed T27c, with hand-calculation cross-check on top. See LOG.md 17 July 2026.

BUG FOUND AND FIXED (28 July 2026, SB) - T35, the WD30/BT50 freeze (raised 24 July, screenshot T35_WD30_BT50_freeze_gosub5900_not_implemented.png). Root cause was NOT GOSUB 5900/T32 as first suspected - [6181] `PRINT "OUT OF RANGE":STOP` is a genuine BASIC STOP, halting the entire program immediately, mid-subroutine. GOSUB 6100's outOfRange return path was being handled as a display flag (outOfRangeRef.current=true, "OUT OF RANGE" text shown) but execution carried on regardless - GOSUB 6950 and GOSUB 6850 both still ran on the same tick afterwards, which source never reaches once STOP fires.

The interval-level halt (outOfRangeRef, checked between ticks) was already correctly built for this, but nothing stopped the CURRENT tick's execution from continuing past the check. Fixed with a single `return` immediately after the outOfRange branch, skipping the rest of that tick entirely; the existing interval-level check then prevents any further tick from starting, matching STOP's "never executes another line" semantics exactly. T32's suspected involvement (flagged 24 July) was a red herring - unrelated bug, same test profile. See LOG.md 28 July 2026.

**T26c-3** CLOSED (17 July 2026, SB) - GOSUB 6950 (precomputes/displays the eventual ascent stop - its name describes its OUTPUT, not which activity calls it: the naming trap that caused the earlier mis-read of this branch as ASCEND). Implemented and confirmed: STOP10/STOP 5 correctly displaying, NOSTOP correctly giving way to it once HT becomes non-zero. First of the agreed Dive-phase GOSUB batch (Dive phase to full confidence before MEMORY/T25, one GOSUB at a time, per John's explicit approach).

- Archaeologically significant, not just "worked as expected":
- NOSTOP's screen position was established via dedicated photo-calibration (NOSTOP_X, NOSTOP_CHAR_W). STOP10's position instead came entirely from gosub_7000's generic, uncalibrated column-grid formula (col × W/80 - the same formula used everywhere else in the DM, never specifically verified against a photograph at this location.
- John confirms the two landed pixel-perfect on both axes, independently - two separate strands of prior work cross-validating each other without either having been built to match the other. The generic formula is now independently confirmed exact at this specific row (row 4), useful evidence given that other DM regions (IDs 7-18, rows 2/3) needed a special-cased override rather than the generic formula (see boundCells's render-block comment). Worth keeping as a data point if U01 (X-axis formula, still not photo-confirmed) or the rows 2/3 override question is ever revisited.
- BUG FOUND AND FIXED along the way: NOSTOP and STOP10/STOP 5 occupy the identical six DM cells (source's own design - new characters overwrite old ones on real hardware), but the two independent SVG elements didn't get that overwrite behaviour for free, causing visible overlap the first time GOSUB 6950 had real content to show.
- Fixed by gating the static NOSTOP render on stopCells being empty.
- Worth watching for in the remaining Dive-phase batch (6850, 6250, T29, T30) - any of them writing into DM cells another already-confirmed routine occupies could hit the identical issue.
- See LOG.md 17 July 2026.

**T26c-4** CLOSED (27 July 2026, SB) - GOSUB 6850 (NOSTOP/time-to-bound init). Both branches now Confirmed.

- Branch A closed: test profile WD=18, BT=10, accelerated tick rate.
- Live diagnostic: {"branch":"A","I6":5,"L2":1,"boundary":11, "DT_I6_1":57,"NN":56,"D5":0,"DX":0}. Checks out internally: boundary(11)<=DT_I6_1(57) correctly selects Branch A; D5=DX=0 consistent with a genuine no-decompression profile (corroborated by HT=0 in the same test's own UI, and "NOSTOP" - not "STOP10" - still showing much later in that dive, since GOSUB 6950 never had cause to write STOP10/STOP5 if HT never went non-zero); NN=56 against DT_I6_1=57 implies CL≈1 at the moment it fired, consistent with tick=2 - very early in the dive, right after a short DESCEND, as expected for a shallow WD18 profile.

Branch B: matches expected diagnostic values (D5=20, DX=5 → "T25") on the WD40/BT22 profile - partial live glimpse of rendered output ("T25::"), not a clean full capture.

Status raised from Working Hypothesis to Confirmed on both branches, using the same live-diagnostics-plus-event-log evidence standard already accepted elsewhere in the project (T27c/T26c-2/T28 precedent) - no formal trace file, per the still-open evidence-bar question, but internally consistent diagnostic data for both branches plus a partial live glimpse of Branch B's rendered output together judged sufficient, matching the same bar those closed items used.

**T45** RESOLVED, decision recorded (28 July 2026, John's call): Branch B's Confirmed status was flagged as resting partly on the "T25::" partial glimpse, given John's direct question whether a one-tick flash is even correct behaviour on the real hardware. SB checked the Compucolor 8001 manual directly rather than leaving HK's timing hypothesis (LOG.md 28 July 2026) as pure speculation: standard power-up baud rate is 9600, and every PLOT-submode section in the manual carries the same repeated note - "SEND Code 253 between X,Y data sets if necessary for timing considerations. See Appendix A-4 for delays" - the terminal's own manufacturer documented that screen-writing was not instantaneous and required explicit padding/sync codes. Appendix A-4's actual millisecond figures couldn't be extracted (a graphic in the source PDF, not text/table-extractable) - not cited further than confirmed, no invented numbers. Rough estimate offered, not treated as confirmed: the full stretch from GOSUB 6850's first write to GOSUB 6750's next overwrite plausibly spans tens to low-hundreds of milliseconds of real wall-clock time on original hardware - comfortably within human visual perception.

DECISION: T45 stands as reasoned-but-unconfirmed, same evidence-bar question as everything else in this project. NOT implementing the proposed fix (a deliberate pause letting React paint an intermediate frame between GOSUB 6850's write and its overwrite) for now - John will catch this directly when testing timing/boundary behaviour rather than having it built speculatively. GOSUB 6850's Confirmed status stands, unchanged. See LOG.md 28 July 2026.

Combined with GOSUB 6800 (T30, Confirmed) and GOSUB 6250 (T26d, Implemented, not yet live-confirmed), all three WORK/DECOMPRESS - initiation display routines from this batch are done or in final verification. See LOG.md 27 July 2026.

DEPENDENCY CONFIRMED GENUINE (24 July 2026, checked directly against DIVER.bas, not inferred): line 6851 carries the original author's own comment, "REM I&L OBTAINED FROM PREV CALL TO SUB 6100" - GOSUB 6850 deliberately reads whatever I/L GOSUB 6100 left behind, exploiting classic BASIC's lack of scoping as a real parameter-passing mechanism. Call sequence (1692 GOSUB 6100 : 1693 GOSUB 6950 : 1694 GOSUB 6850:GOSUB 6950) is safe - GOSUB 6950's source never touches I or L, so nothing clobbers the handoff between the two calls.

SCOPING WARNING: I/J/L are throwaway scratch variables everywhere else in this program - GOSUB 6250 (line 6260), 6800 (line 6825), 6900 (line 6925) each use I for an unrelated purpose (`I= D5+DX` or similar), and GOSUB 6300 (lines 6346/6360, `FOR I= L TO 21`) uses both I and L for its own unrelated band-search loop. RESOLVED (27 July 2026): new module-level handoff pair introduced, BASIC_I6/BASIC_L2 - NOT I4 as first proposed on 24 July, since I4 was already taken by an unrelated pre-existing loop (line ~359, depth-tick plotting) that the 24 July proposal hadn't checked against. Set at the end of gosub_6100()'s two return points, read by gosub_6850().

Confirmed not touching the unrelated module-level BASIC_I/BASIC_J or any of 6250/6800/6900/6300's own local I/L, which remain exactly as local as before. See LOG.md 27 July 2026.

See LOG.md 24 July 2026.

**T26d** CLOSED (28 July 2026, SB) - DECOMPRESS-initiation (line 1700-1705). GOSUB 6250 (decompression content, already resolved via U08) CONFIRMED, raised from Implemented (27 July 2026). Held up on two profiles: WD40/BT22 (one-decompress-stop) and an earlier profile.

Second-profile evidence: LAST GOSUB 6250 diagnostic fired once at tick=101 (HT:10, D5:20, wroteCells:6) and row 3 ("5M 20:") was still correctly visible unchanged at fireCount=189, ~88 ticks later, spanning the whole DECOMPRESS stop - confirms the GOSUB 6800/ boundCells full-replace fix (T21/T43, 27 July) actually resolved the blanking, not just incidentally.

Event log cross-check on this profile: only one DECOMPRESS stop (PA=[4,5,10,10,2], 5 min at 10m) - LAST GOSUB 6250 correctly never updates a second time, since there's no second DECOMPRESS-initiation event to fire it. Row 2 also checks out: HT stayed at 10 for the whole stop, so per [6810] GOSUB 6800 was decrementing DX (5→~0) not D5 (stayed 20 throughout) - I=D5+DX at freeze matches the displayed "T20:15" exactly. GOSUB 7500's HT 10→5 step-down fires right as the stop completes, consistent with existing T28 confirmation.

Same live-diagnostics-plus-event-log evidence standard as T27c/T28/GOSUB 6850 - no formal trace file, judged sufficient.

GOSUB 6250/6800/6850 (T26d/T30/T26c-4) now all Confirmed - closes the whole WORK/DECOMPRESS-initiation display batch. See LOG.md 28 July 2026.

**T26e** - REST-initiation (line 1710). Confirmed (source). Simplest of the five along with T26a: `AL(P,7)=AL(P,6)+AL(P,2)`. No GOSUBs. Never traced before this session's correction - previously missed entirely.

ACTION: implement.

### T27 - Activity-selection input prompts (lines 2020-2140).

SPLIT into five sub-tests, 05 July 2026, at John's request, same reasoning as T26.

GOSUB 5300/5400/5500/5600/5700 (DESCEND/ASCEND/WORK/DECOMPRESS/REST "NEXT" routines - the prompts asking depth/bottom-time/duration for the next activity).

**T27a** CLOSED (05 July 2026, confirmed by John) - DESCEND NEXT (GOSUB 5300). `gosub_5300_start()`/`gosub_5300_resume()` implemented and tested. Valid-input case confirmed: typed 42, AD=40, valid range 40-50 → PA(2)=30 (=DR), PA(4)=42, PA(5)=3, exact match to prediction.

Same shape as T27e - one prompt, one condition, plus the readout-with-inputs convention now standard across all four NEXT-routine closures.

NOT YET TESTED: the reject-and-reprompt path itself (`IF M<AD OR M>50 THEN 5312`) - same situation as T27e's clamp, where the first test happened to fall on the "no correction needed" side. Worth a follow-up test typing something below 40 or above 50, confirming the prompt re-fires with no PA write, before this counts as fully proven rather than just present-in-code.

**T27b** CLOSED (05 July 2026, confirmed by John) - ASCEND NEXT (GOSUB 5400). `gosub_5400()` implemented and tested against the confirmed no-input formula. Result: PA(2)=15 (=AR), PA(4)=0 (=HT, no decompression obligation yet in this test), PA(5)=5 (HT=0, so the HT≠0→4 branch correctly didn't fire) - exact match to prediction.

Scoped precondition noted in code: gosub_5400() resets PA_scalar=1 itself, standing in for T23's skeleton-building step (not yet implemented) - worth revisiting once T23 exists, so the two don't end up resetting PA_scalar in conflicting ways.

**T27c** CLOSED (17 July 2026, SB) - WORK NEXT (GOSUB 5500). Already substantially documented via this session's U18/GOSUB 6900 work.

Exercised live 16 July 2026 (`gosub_5500_start()` fired as part of a full DESCEND→WORK→ASCEND→DECOMPRESS→REST run); moved to Confirmed 17 July 2026 on the strength of the live-diagnostics-plus-event-log evidence from the first full closed activity cycle (REST→REST). See LOG.md 17 July 2026 - includes a note flagging this reading (SB's report named "T27's REST entry," read here as resolving T27c's still-open status via the same session's stronger evidence standard), worth SB confirming.

**T27d** CLOSED (05 July 2026, confirmed by John) - DECOMPRESS NEXT (GOSUB 5600). `gosub_5600()` implemented and tested against the confirmed no-input formula. Result: PA(2)=0 (=DX, at its init value since T26c/GOSUB 6100 - the thing that would actually set DX - isn't built yet; expected, not a defect), PA(4)=0 (=PA(3), uninitialised for the same reason, exactly as flagged in code comments before testing), PA(5)=2 (unconditional per source) - all as predicted. Same scoped precondition as T27b: gosub_5600() resets PA_scalar=1 itself, standing in for T23's not-yet-built skeleton step.

**T27e** CLOSED (05 July 2026, confirmed by John) - REST NEXT (GOSUB 5700).

`gosub_5700_start()`/`gosub_5700_resume()` implemented and tested - first of the "second prompt" routines, confirming the start/resume split works correctly for a genuine two-step flow (WHICH ACTIVITY → FOR HOW LONG). Result: input=10, TK=0.25 (clamp threshold=0.5) → PA(2)=10 (correctly unclamped, since 10 is well above the 0.5 threshold - clamp behaviour itself not exercised by the initial test, only confirmed not to misfire on a normal value), PA(4)=0 (=PA(3), uninitialised pending T23 as expected), PA(5)=5 - all as predicted.

Readout now also shows the input variables behind each result (HT/DX/D5/AR/TK as relevant), added mid-session so results can be checked against their actual inputs rather than asserted blind.

FOLLOW-UP (same day): SB tried additional rest-time values beyond the initial 10 and got the expected results each time - clamp behaviour may now be genuinely exercised, not just untested. Detail not yet written up; expect a fuller LOG.md entry to follow.

**T28** - GOSUB 7500 (line 1888, `IF AL(AL,1)=4 THEN GOSUB 7500`): fires when a DECOMPRESS event ends, writing the diver's NEXT activity's label (see U18's correction, 05 July 2026 - this does not fire on ASCEND as originally guessed). Gating already confirmed via U18's testbed (LOOPTRACE5). CONFIRMED (17 July 2026, SB): writes `HT=HT-5` on each DECOMPRESS completion, closing the ASCEND↔DECOMPRESS loop.

Implemented 16 July 2026, hand-verified against the DT table for two profiles at the time; extended to Confirmed 17 July 2026 on the same live-diagnostics-plus-event-log evidence standard that closed T27c (`GOSUB 7500 fired: HT X -> Y` log lines are that same evidence class). See LOG.md 17 July 2026.

### T32 (working number, pending assignment) - GOSUB 5900 (line 5550, inside GOSUB 5500/WORK NEXT).

Splits a requested WORK period into multiple internally-chained sub-stages if it crosses a decompression-table time boundary partway through. Explicitly stubbed out since 10 July 2026 (same treatment as GOSUB 6100/6950/6850/6250 at the time) - this was already known, but had been implicitly treated as covered by T27c's closure (see the now-corrected coverage-table row above), which only ever tested the WORK NEXT prompt's input mechanics, not GOSUB 5900's own staging logic.

SCOPED (17 July 2026, SB): unlike the other stubs, this one is BEHAVIOURAL, not cosmetic. Traced against the WD40/BT22 profile used to confirm the full activity cycle: start time falls in DT bracket J=1, end time in bracket K=5. Since J≠K, source's own logic says this exact test should have been split into multiple auto-chained WORK sub-stages (PA(K,5)=3, no prompt between them - same pattern as REST's own auto-chain), not run as one continuous 22-minute block the way the current implementation does.

RESOLVED, correctness-neutral (17 July 2026, SB): traced staged vs single-shot computation for the WD40/BT22 profile directly - both converge to identical HT=10, DX=5, D5=20. Not coincidence, structural:

D5's accumulation telescopes across staged segments to the same sum the single-shot version computes directly, and HT/DX only ever depend on the final threshold crossed, which is identical either way. This is a general property for any constant-depth WORK period - the only kind WORK ever is - not just a one-profile match. LOW PRIORITY: implementation is still wanted for source-fidelity (the staging is a real feature of the 1979 program) and for correctly displaying intermediate stage prompts, but no longer carries the correctness risk to already-Confirmed items that it did before this was traced.

- See LOG.md 17 July 2026.
- SUPERSEDED - PROMOTED TO SOURCE-SIGNIFICANT (09 August 2026, SB, via CCEMU investigation of the GOSUB 8000 MEMORY value). The "low priority, correctness-neutral" judgement above is now known incomplete: it only checked the FINAL numeric convergence of HT/DX/D5 for one profile, not the behavioural consequences of staging itself.
- GOSUB 5900 splits a requested WORK period at decompression-table time boundaries into multiple PA-stack entries (intermediate entries carry PA(n,5)=3 - WORK expected next; the final entry carries PA(1,5)=2 - ASCEND expected next). Each staged boundary is presented to the user as "IS NEXT STAGE = \<duration> MIN. REQUIRED". Precise interaction (corrected 09 August 2026): answering YES accepts the proposed continuation; answering NO does not itself command ASCEND - it re-enters the BOTTOM TIME path at [5509], where a positive replacement bottom time is processed through GOSUB 5900 again (and may generate a new set of staged intervals), while the non-positive branch reaches [5515] ("ASSUME WANT ASCENT-NOT WORK") and routes toward ASCEND. Exact interaction sequences for revised positive bottom times remain under controlled CCEMU investigation. This makes decompression-table boundaries real user-facing decision points during the bottom phase, not merely an internal computation detail.
- It also directly determines BT (the variable GOSUB 8000/MEMORY reads): BT is updated at each staged WORK-stage endpoint via AL(P,7)=AL(P,6)+AL(P,2) then BT=AL(AL,7) at line 1691, so the MEMORY display's own accuracy depends on 5900 actually being implemented.
- For WD40/BOTTOM TIME 20: entry CL=1.75, TT=20 splits into four stages (endpoints 11, 17, 20, 21.75 - the WD40 DT row is 11,17,20,22,24,25,999), executed off the PA stack in order 9.25→6→3→1.75. The final BT=21.75 was independently proved in original BASIC/CCEMU; source lines 8020-8060 then mechanically give a MEMORY top row of 21:45 - this is source arithmetic on a CCEMU-proved BT, not a completed CCEMU run through the full MEMORY display end to end. NEW STATUS: source-significant, implementation required - not low priority. See DEFECT_REGISTER.md DEF-011, DEFECT_REGISTER.md DEF-002 (reopened, entangled with this), LOG.md 09 August 2026.

### T29 - GOSUB 6200 (line 3017, `IF AL(AL,1)=3 THEN GOSUB 6200`): fires every tick during WORK only.

Writes the literal characters "AIR OK" to IDs 13-18 (VA=65,73,82,32,79,75 - direct ASCII), overwriting whatever GOSUB 6250/6800 last wrote to the same field.

STATE (corrected 05 July 2026, per John): source-level analysis is COMPLETE, not incidental - full digit decode with line citations (6200-6240), gating confirmed, and its role as the third writer to the IDs 13-18 shared field established. Also confirmed: why it's absent from every reference photograph - it only fires during WORK.

Nothing implemented in DiverSim.jsx. ACTION: implementation only.

### T30 CLOSED (27 July 2026, SB) - GOSUB 6800 (line 3540, `IF AL(AL,1)=4 THEN GOSUB 6800`): fires every tick during DECOMPRESS only.

Counts down total DT requirements (D5/DX decremented by TK each tick), writes remaining stop time to IDs 7-12 in MM:SS-style digits. IMPLEMENTED AND CONFIRMED against John's photographic evidence - this is what the "T15:38, persisting below STOP10" photo was actually showing, NOT GOSUB 6850 (whose Branch B only ever flashes once, at WORK-initiation, long before a dive reaches DECOMPRESS - see T26c-4 above).

STATE (corrected 05 July 2026, per John): source-level analysis is COMPLETE - full digit decode (6800-6845), confirmed as the source of the "T "-prefixed display seen in photographs (this is the finding that resolved that question).

OBSERVED ANOMALY, flagged not corrected: source [6840] reads "VA=I/10+48" with no INT(), unlike every equivalent line elsewhere in the file. Translated literally; likely inconsequential since the eventual character-code conversion truncates fractional VA the same way INT() would, but worth having on record.

FALSE ALARM, worth recording so it doesn't get re-investigated: a suspected transcription gap at DIVER.bas lines 6876/6877 (missing from the file, breaking an otherwise-consecutive numbering pattern) was briefly raised this session. John confirmed directly against source: no gap. The real explanation was GOSUB 6800 sharing the exact same DM cells and a similar "T"+digits+colon+digits shape as GOSUB 6850's Branch B - two different, then-both-unimplemented routines, not one routine with missing source.

See LOG.md 27 July 2026.

### T31 onwards: reserved for full WORK, DECOMPRESS, ASCEND, REST phase testing (as distinct from the dispatch/prompt mechanics above, which are prerequisite infrastructure shared by all of them).

## KNOWN UNRESOLVED ISSUES

### U01: x-axis coordinate formula - re-derived from 8001 grid:

- SVG_x = plotX \* (480/159) ≈ plotX \* 3.019
- W=480 chosen: 480/80 = 6px per character cell (whole number).
- Supersedes retracted Compucolor II formula.
- ⚠ Not yet independently confirmed by photo measurement.
- Address in T06/T09/T18.

### U02: RESOLVED.

GOSUB 7000 uses visible cursor (X=69-74), not blind cursor. PLOT 14 used for extended character set (256 types).

DM text positions use standard visible cursor formula.

### U03: FRAME element - position confirmed by photograph (T02).

- x=474 (col 79 x 6px, flush to DM right edge), y=0, w=6px, h=96px (stops at cyan/blue text-domain boundary).
- Hypothesis: 3-D shadow effect making DM box appear raised from screen.
- PLOT 2 behaviour not yet reconciled with 8001 manual.
- Does not block testing.

### U04 CLOSED (05 July 2026): ID=21 depth trend bar implemented and tested in DiverSim.jsx.

RED colour proven directly from source (FL=0 fixed at line 6610, CCI=1+FL=1). Two bugs found/fixed: reveal-animation bypass, FRAME-boundary overshoot. Code split into depthDigitCells/depthTrendCells (was blended with T19's digits).

Position still PROVISIONAL - no photo confirmation yet, unlike BAR22. See TODO.md T14d/U04, LOG.md 05 July 2026.

### U05: RESOLVED.

PLOT 27,11 scroll mode - behaviour confirmed as scroll (not erase). Title text scrolled from view, not erased.

### U06: Title text - code-confirmed (lines 1265-1266), never photographically observed.

Not "overwritten by profile" as previously stated - that explanation is retracted. No surviving photograph shows the title at any stage. Possible explanations: displayed only extremely briefly, or no photograph taken during the window it was visible.

See DESIGN_NOTES.md for full correction.

### U07: GOSUB 6300 Branch 2 - major section, now decomposed into T24a-d.

Submode mechanism identified (05 July 2026): Y Bar Graph auto-chain (246/245/244), one vertical bar per DT column. PLOT 29/30 grammar RESOLVED (10 July 2026, T24c2) - display-attribute commands, confirmed by isolation test and a direct Compucolor II manual quote. Remaining: which band gets which attribute per decompression state - T24d's job. See TODO.md T24, LOG.md.

### U08: IDs 7-12 and 13-18 DM content - not yet confirmed for all dive phases.

Partially addressed in T21.

### U09: Plot domain y-formula - derived as SVG_y = 400 - plotY \* 2.094 from 8001 grid.

Previous photo-calibrated value (295px for time axis) used wrong coordinate system and is retracted.

- Key derived positions: plotY=140 -> 106.8px, plotY=40 -> 316.2px, plotY=35 -> 326.7px (time axis ticks, T09).
- ⚠ Not yet confirmed by photograph ruler measurement.
- Confirm before committing time axis and depth axis positions.

### U10: DM box I\*2 row-skip mechanism - BASIC loop positions cursor on even rows only (rows 2,4,6,8,10) yet produces a solid black rectangle.

Emulator confirms solid result; mechanism not explained.

- Cyan-background retest pending to replicate original conditions.
- Does not block testing - solid rect rendering experimentally justified.
- DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx checked (05 July 2026): no information relevant to this mechanism found. Remains exactly as open as before.

### U11: PLOT 27 scroll and vertical mode behaviour - partially confirmed, scroll details unknown.

- PLOT 27,10: vertical cursor advance mode confirmed (cursor steps downward after each character rather than rightward).
- PLOT 27,11: scroll mode confirmed active from line 1264.
- UNKNOWN: scroll trigger conditions, scroll direction, number of lines scrolled, and effect on existing screen content.
- Directly affects T05 - scroll events after line 1264 may account for title text and underline never appearing in photographs.
- Emulator investigation required before T05 can be closed.
- SUB-QUESTION RESOLVED (05 July 2026): Roll Mode/Plot Mode mutual exclusivity checked directly against DIVER.bas - the only two PLOT 27 calls (lines 1262, 1264) occur before Plot Mode is ever entered (first entry/exit pair: lines 1273-1277). Sequential, non-overlapping by construction; DIVER.bas already respects the constraint without needing an explicit guard. Does NOT explain T05's missing title or T10's 13-row shift. See TODO.md U11, LOG.md 05 July 2026.

### U18: IDs 7-12 shared field gating - CLOSED (05 July 2026).

Static trace complete (four writers, largely sequential overwrite, not alternatives). Activity-code mapping RESOLVED from source (line 780 DATA statement): 1=DESCEND, 2=ASCEND, 3=WORK, 4=DECOMPRESS, 5=REST - corrects an earlier guess that AL(AL,1)=4 was ASCEND. DT confirmed populated from source tables; NS/NN/II still unconfirmed (see note below - not carried forward into the closure). CONFIRMED BY TESTBED:

corrected LOOPTRACE5.BAS (flags renamed to avoid the U22 collision) rerun; all five activities matched expected flags, including DECOMPRESS. Two loose ends not really about gating were already spun out as U20/U21. See TODO.md U18, LOG.md 05 July 2026.

NS, NN, II were not addressed by this closure - spun out as U23.

### U20: MQ/MP comparison (lines 6316-6317) and WORK(3) branch (line 6312) - needs live dive values, not a static trace.

Spun out from U18.

### U21: DT value-for-value cross-check against the previously identified RNPL/BSAC decompression table - population confirmed, contents not yet checked.

Spun out from U18.

### U22: Possible 2-significant-character variable-name truncation in CCEMU (compucolor.org/emu/ccemu.html) - surfaced as a LOOPTRACE5.BAS bug (G6800$/G6200$ collided).

LOOPTRACE5.BAS corrected and rerun cleanly (05 July 2026) - the collision itself is fixed. Whether it reflects a genuine 8001 hardware limit or a CCEMU-specific dialect quirk remains open and unconfirmed against the 8001 manual.

### U23: NS, NN, and II - purpose unconfirmed.

Spun out from U18 on its closure (05 July 2026); DT (also originally part of U18) is tracked separately under U21.

### U24 - Observed Anomaly: the surviving listing contains a complete subroutine at lines 5060-5099 (GOSUB 5060, "SUB I/P NAME"), but no call to it has been identified.

Confirmed via GOSUB_INDEX.md and a full-file scan (05 July 2026) - zero orphaned GOSUB targets anywhere; the one numeric near-match (5600) is a legitimate, already-documented subroutine. No attempt made to reconstruct or infer a missing call.

See TODO.md U24, LOG.md 05 July 2026.

U25: Air gauge (ID=22, GOSUB 7000 lines 7300-7342) draws three fixed magenta blocks unconditionally (lines 7305-7308, CCI=5), positioned at X=153,151,149 Y=134 - never covered by the green depletion overlay. Confirmed as a GOSUB 7000 product, not a separate subroutine. Purpose unknown, not in any reference photograph.

- DISCREPANCY, UNRESOLVED: source loop is 3 iterations (I=16 TO 18) but screenshot shows six magenta lines, not touching the air gauge. Not yet explained - needs screenshot re-examined against block positions before any explanation is accepted.
- ADDENDUM (05 July 2026, direct CCEMU test): colour confirmed as magenta, not blue. Block count confirmed as two, not three - DiverSim.jsx's comment said three (stale, inconsistent with its own code, which only colours 2 blocks); comment corrected to match code. MAGENTA constant (#CC00CC) was already correct from an earlier fix - this test confirms it, not a new bug.

### U26 RESOLVED (05 July 2026): GOTO 7445 confirmed to fail on CCEMU - genuinely undefined, not old-style fall-through.

GOTO 7450 succeeds. Decision: original DIVER.bas kept unmodified as the authentic artefact; DIVER7450.BAS is the corrected working copy used for all further testing from this point. Results quoted against "DIVER7450.BAS" run the fix; results against "DIVER.bas" retain the original defect. See EVIDENCE_TO_PRESERVE.md.

### U27 RECLASSIFIED (05 July 2026):

moved to the CCEMU tooling notes above - not an open question about DIVER.bas, a known CCEMU operational limit.
