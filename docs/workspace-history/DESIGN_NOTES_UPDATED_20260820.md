# DIVER.BAS  -  Design Notes
# Observations about the original system's design intent, as recovered from BASIC source analysis and photographic evidence.
# Append-only. Each entry dated and sourced.
---
# These notes inform the React port's state transition logic and display architecture. They are not cosmetic observations  -  they describe the information architecture of the original simulation.
---

## June 2026

### Core display principle
"Display only what is needed for the next decision;
 warn before the decision point arrives."

Source: inferred from BASIC structure and photographic evidence.
Observed in:
  - DM box shows NOSTOP until decompression becomes relevant, then switches
    to stop depths and remaining times  -  the display changes precisely when
    the diver needs different information for the next decision.
  - Depth gauge (IDs 19–20) updates continuously  -  depth is always the
    parameter for the next decision during descent and ascent.
  - Air gauge (ID=22) counts down continuously  -  a permanent background
    warning that precedes the decision to end the dive.
  - The DM box is not decorative. It is the decision support instrument.
    Every element within it exists because a diver needs that specific
    piece of information at that specific point in the dive.

Implication for React port:
  State transitions in the display logic should be driven by decision
  points in the dive profile, not by arbitrary timers or animation frames.
  When the simulation crosses a threshold that changes what the diver needs
  to know, the display should change  -  not before, not after.
  The DM box content is effectively a state machine whose states correspond
  to dive phases: pre-dive, descending, working, decompressing, ascending.


### DM box as instrument panel
The Display Monitor (DM) box functions as a self-contained instrument panel
occupying the top-right of the screen. Its layout is fixed  -  bar graph(s)
on the left, text displays on the right  -  and its content changes with
dive phase. This is analogous to a physical dive computer display, which
shows different readouts depending on what the diver is doing.

The original hardware context (Compucolor II, 1979) makes this more
significant: building a dynamic, phase-sensitive display instrument in
BASIC on a system with limited memory and no graphics library required
deliberate architectural decisions. The blind cursor mechanism (GOSUB 7000
routing by ID) is itself an architectural choice  -  a single display
subroutine with a dispatch table, anticipating what would later be called
a component model.


### Dive stages and display states
From photographic evidence, three display stages are visible:
  1. Pre-dive: NOSTOP in DM, no dive profile drawn, working depth prompt answered.
  2. During dive (pre-decomp): DM shows NOSTOP + depth + air gauge.
     Approximately 10 photographs in this state. DM not always clearly visible.
  3. End of dive / decompression: DM shows stop depths and times.
     "BLUE STOP 5" visible in photographs  -  decompression obligation display.

The transition from state 2 to state 3 is the most critical decision point
in the dive  -  the moment the diver must begin decompression stops. The
display architecture is designed around making this transition unmistakable.


### DM box layout confirmed  -  structural not functional
June 2026. Confirmed by DiverExperiment_ID21.jsx visual inspection.

The internal geometry of the DM box is now established:

```
┌─────────────────────────────────────┐
│ [BAR] NOSTOP          [tens][units] │  ← Row 1: IDs 1–6, 19–20
│ [BAR] ROW2TEXT (TBC)                │  ← Row 2: IDs 7–12
│ [BAR] ROW3TEXT (TBC)                │  ← Row 3: IDs 13–18
│ [BAR] [ID=21 bar...........]        │  ← ID=21 (purpose TBC)
└─────────────────────────────────────┘
  ↑ ID=22 runs full height on left
```

Constants that define this layout:
  DM_COLS=12, DM_CW=DM_W/12 (~6.4px), DM_CH=DM_H/6 (~14px)
  Row 1: DM_Y + DM_CH * 1.2
  Row 2: DM_Y + DM_CH * 2.2
  Row 3: DM_Y + DM_CH * 3.2
  ID=21 bar: ROW1_Y + DM_CH * 2.5

⚠ CRITICAL: This confirms STRUCTURE only. The following remain unresolved:
  - ID=21: purpose unconfirmed
  - IDs 7–12 (row 2): content and colour unknown
  - IDs 13–18 (row 3): content and colour unknown
  - ID=22: left column position confirmed, full functionality not yet traced
Do not treat layout confirmation as functional confirmation.


### ID=21  -  depth trend indicator hypothesis
June 2026. Primary source: Dagfinn Aksnes (original designer), direct communication.

Dagfinn's description: "In low visibility it is useful to have a graphic not
numeric indication of depth and whether static, ascending or descending.
This display is actually a flat bar with a triangle above and below."

Interpretation (hypothesis  -  pending code confirmation):
  - Flat bar: the background cleared by PLOT 6,0,2,250,152 at line 7200  - 
    10 blocks drawn in black, always present as a reference plane.
  - Upper triangle: filled blocks during descent  -  VA=(AD-INT(AD))*10
    increases 0→9 as diver descends through each metre. Blocks fill upward.
  - Lower triangle: corresponding behaviour during ascent  -  VA decreases
    9→0 as diver ascends through each metre. Blocks fill downward.
  - Static: IF AD=AY THEN 6699 skips redraw entirely when depth unchanged  - 
    display is static precisely when the diver is static.

Direction signal: fractional part naturally encodes direction  - 
  Descent: fraction increases 0→9 per metre → upper triangle grows
  Ascent:  fraction decreases 9→0 per metre → lower triangle grows

This is a deliberately sophisticated graphic cue for 1979 BASIC on constrained
hardware. The diver reads direction and motion from the triangle shape without
needing to interpret numbers  -  particularly valuable in low visibility.

Status: HYPOTHESIS. Requires confirmation by locating ascent-specific PLOT
handling elsewhere in BASIC (separate sequence mirroring descent in opposite
direction). If found, would strongly confirm this interpretation.
→ TODO: ID=21  -  search for ascent-specific PLOT handling in dive loop
→ LOG: ID=21 purpose  -  depth trend indicator hypothesis from Dagfinn

 The finding from LOOPTRACE2 is that AD reaching WD (line 3405) and the event firing (line 1471) are independent mechanisms that must not be conflated in the JSX port.
 

### Tick-driven animation principle
June 2026. Source: BASIC source analysis, confirmed by LOOPTRACE1–3 emulator runs.
→ LOG: Tick-driven animation principle  -  for DESIGN_NOTES.md

GOSUB 6300 is called once per tick from line 3410. During DESCEND and ASCEND
(Branch 1), it draws one profile segment per tick from the previous clock
position to the current one. The profile does not appear all at once  -  it
accumulates column by column in step with simulated time.

The horizontal mapping is direct: x = INT(CL*XS)+10. Clock time maps
linearly to screen x-position. XS (0.5/1.0/2.0 depending on WD) determines
how quickly the profile moves rightward across the screen.

During WORK (Branch 2), the coloured band mountain replaces the simple line.
The bands represent decompression limits from the DT table, drawn as stacked
vertical bars per column. The diver's position within the bands is tracked by
CO and drawn as a coloured dot  -  dot colour reflects decompression status.

Implication for React port: profile must be rendered incrementally as time
advances, not calculated and drawn all at once. Each tick adds one column.
The accumulation IS the animation  -  it is not decorative; it encodes elapsed
time as visible screen space. A rendering shortcut that draws the full profile
from stored AL data would lose this temporal dimension entirely.


### RMTS  -  governing display principle (confirmed by Dagfinn)
June 2026. Primary source: Dagfinn Aksnes (original designer), direct communication.
→ LOG: RMTS = requirements  -  confirmed by Dagfinn

"RMTS" is believed to be George Mallen's shorthand for "requirements". Dagfinn
confirmed it identifies the governing principle for all display content:

  "At all times display only the information required to make upcoming
   decisions and sound the alarm before the decision has to be made."

This principle is not a design philosophy overlaid on the BASIC  -  it is
structurally encoded throughout the program:

  - NOSTOP string displayed until decompression becomes relevant, then
    replaced by stop depths and times (GOSUB 6750)
  - Depth gauge updates every tick  -  depth is always the parameter for the
    next decision during descent and ascent (GOSUB 6600)
  - Air gauge counts down every tick  -  a permanent background warning whose
    purpose is to precede the decision to surface (GOSUB 6700)
  - CK flag (line 3015): fires the next-activity prompt exactly IK=0.5 min
    before the current activity ends  -  the alarm before the decision arrives,
    confirmed by LOOPTRACE3 emulator run
  - PA single-entry architecture: next activity is entered only when current
    one completes; the user acts at the moment informed by the display

The RMTS principle is not an external description of the system. It is the
design brief, and it explains every architectural choice from the DM box layout
to the event scheduler timing. It is why the DM box is not decorative.


### Interactive model  -  one-decision-at-a-time
June 2026. Source: BASIC source analysis, confirmed by DIVERTRACE.BAS and
LOOPTRACE1 emulator runs.
→ LOG: Port architectural divergence  -  batch PA input identified

DIVER.BAS is an interactive, one-activity-at-a-time system, not a plan-then-
execute system. Only PA(1) is pre-populated at initialisation (lines 1370–1371)
with the first DESCEND activity. Subsequent PA entries are built one at a time
as each activity completes (lines 1900–1910), after the user is prompted for
the next activity by the CK flag mechanism.

The user cannot plan ahead. The system presents each decision at the moment it
is required, using the display instruments  -  particularly the DM box  -  to
inform that decision. This is the RMTS principle instantiated in the data
architecture: the PA array is not a pre-planned schedule but a live queue of
exactly one item ahead.

Implication for React port: the existing JSX port collects all PA entries
upfront before the dive plot starts. This is an architectural difference, not
a cosmetic one. The original's interactive model is what makes the simulation
a live decision-support instrument rather than a replay of a pre-entered plan.
Correction required once GOSUBs 5300–5700 are fully integrated into the port.


### Open question  -  two early screen elements lack explanation
June 2026. Source: BASIC source analysis and photographic evidence.
→ LOG: Title text and FRAME elements  -  two unexplained early disappearances

Two distinct early-screen components (the title text, and the
lines 1040-1100 FRAME construction) are both confirmed absent from
photographs by the second tick of any dive, and in both cases no
clearing/erase code has been identified in DIVER.BAS that would
account for this. This is recorded as an open question rather than
a design principle  -  it may reflect gaps in the current BASIC
transcription, an unidentified memory/screen-sharing mechanism, or
simply remain unexplained. Noted here because the consistency of the
pattern (two independent elements, same early-disappearance behaviour,
both unexplained) seems unlikely to be coincidental, even though no
confirmed cause has been found.


### CORRECTION  -  Title text: framing in preceding entry partially retracted
June 2026. Corrects: "Open question  -  two early screen elements lack explanation" (above).
→ LOG: Title text  -  existence confirmed only in source code, NEVER observed in any photograph

The preceding entry states both the title text and the FRAME element are
"confirmed absent from photographs by the second tick of any dive." This is
WRONG for the title text and is retracted.

The title "DIVER SIMULATION MODEL." is known only from DIVER.BAS source code
(lines 1265–1266). NO surviving photograph  -  pre-dive, early-dive, or any
other stage  -  shows this title on screen. The source attribution "photographic
evidence" in the preceding entry is therefore incorrect for this element.
The title has never been photographically observed; it did not "appear and
then disappear"  -  there is simply no photographic record of it at all.

The question is better framed as: why does the title never appear in any
photograph we have? Possible explanations, none confirmed:
  - It displays only extremely briefly (scroll-mode or rapid overwrite)
  - No surviving photograph was taken during the brief window it was visible
  - Some other factor specific to the photographed hardware session

The FRAME / lines 1040–1100 element: the preceding entry's framing for
this element remains valid. It is confirmed absent from all photographs;
whether it ever appeared is separately open.

STATUS: title text is code-confirmed, photographically unobserved.
Do not cite as a photographically confirmed screen element in FA1/HA1
without this caveat. The two-element pattern noted in the preceding entry
retains structural interest, but the title element's evidential basis is
now weaker than the FRAME element's.


### Translation style  -  BASIC fidelity over idiomatic React

The reconstruction translates the BASIC algorithm, not merely its
final visual output. Someone should be able to compare the BASIC
listing and the React code side-by-side and follow execution
line-for-line. Three naming conventions enforce this: BASIC_* prefixes
all variables that correspond directly to the original source; runtime.*
methods emulate the original machine commands (PLOT, PRINT, GOSUB etc.)
in the same call sequence as the BASIC; React components render runtime
state only. Line number comments (// [1040]) provide a permanent mapping
back to the listing.

Source: authorial decision, John, June 2026. Full specification:
STYLE_GUIDE.md.

Implication for port: do not replace procedural BASIC with higher-level
JavaScript constructs for conciseness. Historical fidelity takes
precedence over idiomatic React or performance. Do not optimise unless
specifically requested.


### PLOT 30  -  background colour and character size control

`PLOT 30,n` sets background colour via CCI byte n, and also controls
character size. Confirmed: `PLOT 30,15` = small characters, `PLOT 30,16`
= large (normal) characters. `PLOT 30,16` at line 1100 ensures large
characters are active before the DM print loop. `PLOT 30,20` in the
coloured bands section sets blue background.

Source: emulator tests T02/T03/T04. Whether byte 16 additionally sets
black background (as CCI byte 16 would imply) is not yet confirmed on
a cyan background. Not yet reconciled with the 8001 manual.

Implication for port: `PLOT 30` calls must be emulated in sequence  -  they
set conditions for subsequent PRINT output, not just a one-off visual
effect. The coloured bands background and DM black background both depend
on this mechanism.


### FRAME bar  -  3-D shadow hypothesis

The FRAME element (lines 1040–1100) renders as a single white vertical
bar at the right edge of the DM box (x=474, col 79, h=96px). The
hypothesis is that it functions as a 3-D shadow: the white bar at the
right edge of a black box on a cyan background creates the visual
impression that the DM box is raised from the screen surface.

Source: photograph analysis; T02 position confirmed by photograph ruler
measurement. Purpose not stated in BASIC source; hypothesis derived from
visual context. Not yet confirmed from primary source (Dagfinn Aksnes).

Implication for port: render as a static white rect. Position follows
text domain (col 79 × 6px = x=474), not plot domain. The 2.4px gap
between cyan area bottom (SVG y=96) and FRAME plot-domain bottom
(SVG y=98.4) is closed by using the text-domain boundary.


### PRINT semicolon  -  DM solid rectangle mechanism

`PRINT " ";` (with semicolon) keeps the cursor on the same row after
each character. Without the semicolon  -  which was missing from the
original transcription  -  characters advance to the next line and the
DM box does not form correctly. Found and confirmed by emulator test T03.

Source: emulator test T03. The solid black rectangle is produced by
the PRINT loop with semicolon present, combined with `PLOT 30,16`
setting large characters active. The `I*2` cursor positioning (even
rows only: 2, 4, 6, 8, 10) produces 5 contiguous rows despite the
even-row placement  -  mechanism not yet explained (U10).

Implication for port: the semicolon is structurally essential, not
stylistic. U10 remains open but the visual result (solid rectangle)
is confirmed and the port renders it correctly pending investigation.


### Vertical cursor advance mode  -  PLOT 27,10

`PLOT 27,10` sets vertical cursor advance mode: after each character
is printed, the cursor steps downward rather than rightward. This is
how the depth axis label ("5 METRE UNITS") is produced  -  upright
characters arranged vertically, without any character rotation.
`PLOT 27,11` restores scroll mode.

Source: BASIC lines 1261–1264; confirmed T04 by photograph (upright
characters, vertical arrangement). Purpose of repeated calls
(`PLOT 27,10,27,10` and `PLOT 27,11,27,11`) not yet confirmed  - 
archive check pending (U11).

Implication for port: characters are rendered upright in a vertical
column, not rotated SVG text. Each character is placed at the
next row position after the previous one.


### Bedstead font  -  SAA5050 approximation

Bedstead (loaded via `@import` from fontlibrary.org) is used as an
approximation of the SAA5050 teletext character generator, which is
the likely character ROM for the 8001-family hardware. It is not
confirmed against the actual 8001 character ROM.

Source: DiverSim.jsx; T04 visual confirmation at FONT_SIZE=10.
Character width multiplier for SVG text positioning: 0.57 at
FONT_SIZE=10, confirmed empirically for cursor placement (T07).

Implication for port: Bedstead is a reasonable approximation pending
ROM confirmation. The 0.57 multiplier is empirically derived and
may need revision if the actual ROM or a closer approximation is
identified. FONT_SIZE=10 is a named constant throughout.


### Universal print rate  -  deliberate legibility choice

`PRINT_INTERVAL_MS = 20` (20ms per character, 50 characters/second)
is the universal print rate for all PRINT loops in the port: cyan
surface area, DM box background, vertical label, title text, and
input prompts. This rate is not derived from hardware baud rate or
any timing in the original BASIC.

Source: DiverSim.jsx. Chosen to make the left-to-right, row-by-row
fill visually legible at screen resolution. Supersedes 40ms used
briefly at T02.

Implication for port: `PRINT_INTERVAL_MS` is a single named constant
and may be adjusted freely without affecting correctness. It is a
display aesthetic decision, not a fidelity requirement.


### Input prompt style  -  T07/T08 design decisions

Input prompts render as black text on cyan background (CCI byte 48:
BG=cyan FG=black). A blinking block cursor is implemented as an SVG
`<rect>` with `<animate>` element at 0.75s step-end interval. Invalid
input fires a 300ms tone at 1400Hz, approximating the original
CHR$(7) bell. The animation ticker pauses during input and resumes
on valid entry.

Source: BASIC GOSUB 5000, lines 1278–1281. Bell approximation is a
port decision  -  original hardware bell pitch and duration not
documented. Cursor blink rate chosen to match conventional terminal
behaviour.

Implication for port: these are explicit design decisions for the
reconstruction, not values derived from the BASIC source. They should
be flagged as such in any documentation (FA1/HA1) that discusses
the port's fidelity.


### DM box typography  -  Bedstead variants and font hosting

The DM box content uses BedsteadBoldUltraCondensed at NOSTOP_FONT=11px,
distinct from the regular Bedstead used elsewhere (FONT_SIZE=10). Character
width multiplier for DM content: 0.62 at 11px, confirmed empirically.
DM_FONT_FAMILY constant provides all eight Bedstead variants as switchable
options, anticipating that the correct DM character ROM match may differ
from the main screen character ROM match.

Source: DiverSim.jsx T11 implementation. NOSTOP_X = DM_X + 2×NOSTOP_CHAR_W;
NOSTOP_Y = DM_Y+13px  -  photo-calibrated. Not confirmed against actual 8001
character ROM; Bedstead remains a SAA5050 approximation throughout.

Implication for port: fonts are now self-hosted at src/assets/fonts/ rather
than loaded via Font Library CDN. Spacing is sized to accommodate "NOSTOP 30"
(9 characters) within DM width  -  this forward-plans for the decompression
display at T21+, where NOSTOP is replaced by stop depth and remaining time.


### FRAME  -  CRLF artefact hypothesis (alternative to 3-D shadow)

An alternative explanation to the 3-D shadow hypothesis (above) has
emerged: the FRAME bar may simply be the hardware's CRLF behaviour
at column 80, rendered visibly in cyan because the background flag
(PLOT 30,22) is active at that point in the print loop. Under this
hypothesis, the bar is not a designed graphical element but an
incidental hardware artefact of reaching the column boundary  -  and
the PLOT 2 calls at line 1090 (previously assumed to draw the FRAME)
may be drawing something else entirely, with the visible mark being
unrelated to those calls.

Source: project process discussion, June 2026. Status: HYPOTHESIS,
untested. Requires emulator confirmation  -  specifically whether a
CRLF triggered by reaching column 80 renders a visible mark in the
active background colour, independently of the PLOT 2,246,YO,158,
Y1,... calls.

Implication for port: this does not displace the 3-D shadow
hypothesis. Both stand as competing explanations pending
investigation. See U03.


### Archived material  -  evidential status in the reset project

This project underwent a deliberate reset in late June 2026, archiving
prior JSX work (DiverCompleteWorks.jsx, DiverExperiment_ID21.jsx, and
associated LOOPTRACE*.BAS emulator files among others) and restarting
the JSX build from a sequential, line-number-driven test plan.

Archived material may be consulted for orientation, hypothesis
generation, and as a starting point for investigation. It must not
be treated as evidence. Any specific value  -  a colour, a coordinate,
a count, a behaviour  -  drawn from archived material must be
independently re-confirmed against current photographic evidence, a
current emulator test, or current BASIC source analysis before being
adopted in DiverSim.jsx or cited in TESTING_PLAN.md, LOG.md, or this
file.

This principle has already been applied in practice: the T15 air
gauge experiment file suggested 3 magenta blocks in the bar graph;
current photograph evidence shows 2 blue blocks, and the
implementation follows the photograph, not the archive. Where
archived files are no longer available (e.g. LOOPTRACE1.BAS, cited
in earlier TESTING_PLAN drafts for T17 but not recoverable post-reset),
such citations reflect pre-reset evidential status only and do not
constitute current confirmation.


### Font fidelity  -  Bedstead as approximation, not match

Bedstead approximates the SAA5050 teletext chip character ROM. The
8001-family terminal used in this project almost certainly has a
different character ROM. Individual glyph shapes should be expected
to differ from photographic evidence on a case-by-case basis, and
corrections should be treated as routine findings rather than
surprises.

Source: T14/T15 glyph investigation. First confirmed instance: zero.
Photograph evidence showed a slashed zero (diagonal stroke); all
eight loaded Bedstead variants rendered an unslashed zero by default.
Resolved via CSS font-variant-numeric: slashed-zero, applied at the
DiverSim.jsx root container, cascading to all rendered text. A
related baseline-variant digit issue (digits 3,4,5,7,9 sitting below
baseline versus 6,8 extending above, as on period-correct displays)
was resolved by the same font amendment.

Implication for port: further numeral and character glyph checks
should continue as more DM content is implemented, since Bedstead's
approximation may diverge from the original ROM in further ways not
yet discovered. Each such discrepancy is an expected category of
finding, not an exceptional one.

### DX never reset  -  a persistent-state design quirk, not a port bug

Source: TODO.md U29, moved here 14 August 2026 (HK) as an observed
design characteristic rather than an actionable task  -  it was
originally logged as a TODO item but reads as a genuine property of
the original 1978/79 program's state model, not something to fix.

`DX`, once set to 5 by the decompression logic, is never reset
anywhere in the source. Consequently, diving again later in the same
session  -  after a completely separate, shallower WORK period that on
its own would not require two stops  -  would still show STOP10 rather
than STOP 5, because `DX` carries the value left over from the earlier
dive/episode within the same run.

This reads as a genuine quirk of the original program's session-level
state model: DX behaves as accumulated session state, not as a value
freshly derived from the current dive's own parameters. Not a bug in
the port to fix  -  if it comes up in testing, it should be documented
as an Observed Anomaly (matching the original) rather than corrected.

### Post-END READY display  -  visual fidelity only, not interpreter emulation

Source: John, 15 August 2026.

The historical photograph and CCEMU both show the BASIC interpreter's
`READY` prompt and cursor appearing after DIVER reaches `END`.
Design principle: reproduce this visually, as part of the completed
screen, but do not emulate interpreter functionality  -  the modern
simulation is restarted by refreshing the browser, not by any
in-simulation command line.

### PLOT 27,10 / PLOT 27,11  -  duplicated in source, not functionally required

Source: John, 15 August 2026, following direct CCEMU A/B testing.

`PLOT 27,10` selects vertical character advance (characters print
vertically, one row per character, remaining upright); `PLOT 27,11`
restores normal horizontal character advance. No evidence was found
that `PLOT 27,11` itself causes scrolling or cursor repositioning  - 
earlier descriptions of it as "scroll mode" were too broad.

DIVER.BAS issues each of these commands twice in a row. A minimal
CCEMU test showed a single instance of each is sufficient to produce
the observed behaviour  -  the duplication is not required for the
effect. Why Dr Mallen issued each command twice is unknown: possibly
original-hardware caution, experimental residue, or deliberate
defensive programming. No behavioural requirement has been
demonstrated for the duplication. Retained as a historical source
characteristic; not to be treated as a functional requirement of the
JSX reconstruction.

### GOSUB 5060  -  defined but never called

Source: recovered from source analysis; recorded as a design note
15 August 2026 (previously tracked as TODO item U24).

GOSUB 5060 exists as a complete subroutine in the surviving source,
but no call site has been identified anywhere in the listing. Retained
as a historical fact about the surviving program  -  dead code, most
likely a leftover from an earlier draft  -  not something to reconstruct
or "fix" in the JSX port. No missing call should be inferred.

### Unexpected coded behaviour  -  activities accepted in states the original program was evidently not designed to encounter

Source: SB, 16 August 2026. Controlled JSX and CCEMU comparison across
several "invalid" activity-selection sequences. All confirmed as
faithful  -  the original BASIC accepts these commands syntactically and
does not guard against the states involved, rather than the JSX
reconstruction introducing new behaviour. Do not "fix" any of these;
recorded here so a future maintainer doesn't mistake faithful
reproduction for a bug. See REGRESSION_TESTS.md's "Resolved-as-not-
a-bug" section for the matching regression entries.

**DECOMPRESS accepted with no decompression obligation established  - 
general rule, not location-dependent.** Repro (three variants, all
matching identically in JSX and CCEMU): `DESCEND → DECOMPRESS` before
any WORK/obligation exists; `WORK → DECOMPRESS` where the WORK didn't
establish an obligation; and `DESCEND → ASCEND → DECOMPRESS` at the
surface. In every case: the first DECOMPRESS produces no visible
profile movement; the activity machinery enters a repeating
ASCEND/DECOMPRESS cycle indefinitely rather than progressing normally;
the Dive Monitor develops transient residual characters at the far
right (observed sequences include a stray red `.0` and, separately,
`/...` then `.0`). **General rule:** this loop is not dependent on the
diver being below the surface  -  DECOMPRESS selected without a valid
obligation can enter the repeating cycle regardless of depth.
Interpretation: BASIC accepts DECOMPRESS syntactically but doesn't
guard against the absence of a decompression obligation, in any
context.

**Consecutive DECOMPRESS, during an active decompression stop.**
Repro: at an active decompression stop, select DECOMPRESS again
instead of ASCEND. Observed identically in JSX and CCEMU: the second
DECOMPRESS is accepted; the diver remains at the current stop depth;
the additional DECOMPRESS duration is effectively added to the
existing stop period; the monitor countdown continues accordingly;
after the extended stop completes, the normal ASCEND path resumes.
Interpretation: DECOMPRESS behaves as an additional hold-at-current-
depth activity rather than a guarded one-time state transition  -  a
different failure mode from the no-obligation loop above (this one
progresses correctly, just with an extended stop), so kept as its own
entry rather than merged into it.

**REST  -  general rule, holds regardless of preceding activity or
depth.** Confirmed across multiple preceding-activity contexts
(`DESCEND → REST` while submerged; `WORK → REST` at working depth; and
others)  -  REST behaves consistently regardless of what came before it.
REST holds the diver at the current actual depth (`AD`) for the
entered duration; does not insert or imply an ASCEND; on completion,
follows the normal terminal path through GOSUB 8000/MEMORY and then
END; the final READY state appears with the diver still at whatever
depth REST was entered from. This is a single general property of
REST, not a separate quirk per predecessor activity  -  do not log
further individual "X → REST" cases as new findings unless a future
case behaves materially differently from this rule.

**WORK → DECOMPRESS, with an established decompression obligation.**
Repro: sufficient WORK to establish a genuine decompression obligation,
then DECOMPRESS selected before ASCEND has moved the diver to the
required stop depth. Observed identically in JSX and CCEMU: DECOMPRESS
does not reposition the diver to the stop depth  -  the diver remains at
the current working depth while the DECOMPRESS duration is served,
producing a continued level profile segment; when ASCEND is
subsequently selected, the normal ascent/decompression sequence resumes
and completes correctly; final MEMORY values and overall profile
behaviour match CCEMU. Interpretation: DECOMPRESS assumes ASCEND has
already positioned the diver at the required stop depth  -  it executes
decompression timing at the current `AD` rather than moving the diver
itself.

**DESCEND after ASCEND/DECOMPRESS (deeper descent during an active
decompression sequence).** Repro: `WORK → ASCEND → DECOMPRESS →
DESCEND` to a deeper working depth while a decompression sequence is in
progress. Observed identically in JSX and CCEMU: the deeper DESCEND is
accepted; the profile is drawn at the new depth; the Dive Monitor
retains the decompression state (`STOP 5`, `5M 15:` in the tested case);
the program then reaches the genuine OUT OF RANGE path  -  CCEMU reports
`SN ERROR IN 6763` after the stop, JSX displays the corresponding OUT
OF RANGE halt. Interpretation: the original program allows the operator
to descend again during an active decompression sequence, but the
resulting depth/time state falls outside the range expected by the
decompression-table/display logic.

**Surface WORK → ASCEND  -  predictable, not a quirk.** Starting state:
ASCEND has previously completed at the surface (`AD=0`). Sequence:
WORK (BOTTOM TIME 5) → ASCEND. Observed identically in JSX and CCEMU:
WORK is accepted at the surface and remains at `AD=0` for the entered
duration; the subsequent ASCEND has zero physical movement (diver
already at the surface); activity processing completes normally; REST
is then offered/follows as the terminal path. Faithful and logically
predictable  -  not a defect.

**Surface ASCEND recurrence  -  general rule.** Two independent tests
confirm the same rule in both JSX and CCEMU: `DESCEND → ASCEND → WORK
(BT5) → ASCEND` and `DESCEND → ASCEND → ASCEND`. In both, the first
ASCEND reaches the surface (`AD=0`); the subsequent activity (WORK or a
second ASCEND) is accepted at the surface; a following ASCEND performs
zero physical movement because start and target depth are both 0;
processing completes normally and proceeds to REST. **General rule:**
ASCEND invoked when `AD=0` is a valid zero-movement activity  -  the
scheduler completes it normally and continues through the ordinary
successor logic rather than treating surface ASCEND as an error.

### Repeated/chained activity selections  -  some are faithfully fine, some are faithfully broken

Source: SB, 16 August 2026, activity-transition/recurrence testing
phase. Confirmed identically in JSX and canonical BASIC/CCEMU in every
case below  -  none of these are reconstruction defects.

**Consecutive DESCEND is valid and chainable.** Repro:
`DESCEND 10 → DESCEND 20 → DESCEND 33`. Each successive DESCEND is
accepted normally; the diver continues from the current actual depth
to the newly entered deeper target; movement and plotting remain
continuous; no stray graphics, duplicate prompting, or scheduler
stall. General rule: consecutive DESCEND activities are valid and can
be chained, each new DESCEND using the current depth as its starting
point and the newly entered depth as its target.

**ASCEND-at-stop, then ASCEND again, is fine once.** Allow ASCEND to
complete at a decompression stop, then select ASCEND again: accepted,
movement/progression follows source logic correctly, no anomaly.

**But repeated ASCEND selections eventually hit a genuine historical
failure.** Continue selecting ASCEND repeatedly at a decompression
stop and both JSX and canonical CCEMU eventually fail at the same
point  -  CCEMU reports `BS ERROR IN 1982`. This is a historical source-
program failure path, not a JSX defect. The exact PA/AL/array
mechanism behind it has not been established from source, but the
failure itself is confirmed faithful.

### Surface re-entry into a new deep dive  -  historical error path

Source: SB, 16 August 2026. Repro:
`DESCEND 10 → ASCEND → WORK 10 → DESCEND 40 → WORK 20`. JSX does not
proceed normally after the second deep descent/work sequence;
canonical BASIC/CCEMU also errors at the corresponding point.
Confirmed historical behaviour / source-program failure path  -  correct
reconstruction fidelity, not a defect. Note: individual surface
activities (REST, a single ASCEND, etc.) can be accepted cleanly on
their own, but using the surface state as the starting point of a
substantial new dive can drive the original program into an error
condition. Do not "fix" this.

## 20 August 2026

### Bell is a sustained operator-warning state, not merely a short beep

Source: Compucolor/Intecolor terminal manual Code 7 description plus handwritten
manual annotation, DIVER.BAS CHR$(7) call sites, and John's direct test of the
latched JSX candidate.

The terminal manual gives Code 7 a nominal tone duration, but the handwritten
operational note records that the tone remains on until BASIC reads an END or
INPUT. For DIVER this makes the bell part of the operator-decision state: it can
continue while the program is waiting for the response and stops when the
response is completed. The reconstruction therefore models CHR$(7) as a latched
warning tone rather than an arbitrary fixed-duration beep. Exact frequency is
not documented; 1150 Hz in JSX is only an empirical approximation.

### [1265–1266] title strings execute without becoming normal visible text

Source: canonical BASIC/CCEMU plus 20-August PLOT-stream re-analysis.

The title and underline statements are executable, not dead code. However they
run while the terminal remains in Graphic Plot Mode, and normal CCEMU execution
does not display them as ordinary text. This is a useful distinction for the
reconstruction: source traceability should retain the fact that the PRINT
statements exist and execute, but visible title text must not be invented.

### PLOT statements are stateful serial streams

The meaning of a byte depends on terminal state established by earlier bytes in
the same PLOT statement. [1261] is the decisive example: after HOME, Code 2
enters Graphic Plot Mode and 14,15 are plot coordinates, not a separate Code-14
command. Likewise [1273] uses submode 250 (X Bar Graph, X0 Value) and [1346]
uses submode 246 (Y Bar Graph, Y0 Value). Future archaeological interpretation
must parse each full statement sequentially before assigning command names.

