# COMMENTS TO AMEND  -  DIVER JSX

This is the single authoritative register for JSX comment changes.

John does not need to maintain this structure. He can raise any comment, source
reference, wording or concern conversationally; SB maintains this file.

Status meanings:
- PROPOSED  -  first-draft wording awaiting John's review; not yet agreed.
- AGREED  -  wording settled, not yet applied to the current JSX candidate.
- APPLIED  -  inserted into the current JSX candidate, not yet independently checked.
- VERIFIED  -  applied and checked in the current JSX candidate.

For the SB applying changes:
- Apply the wording below exactly unless an item explicitly says otherwise.
- Do not reconstruct a replacement from chat history.
- Do not revive superseded spreadsheet rows or older draft wording.
- Comment-only source changes do not alter executable behaviour.

---

## Agreed changes

### File header

Status: VERIFIED

CHANGE TO:

```js
// DiverSim.jsx
// A reconstruction of DIVER.BAS -  a 1978–79 activity-based diving simulation
// (DESCEND / WORK / ASCEND / DECOMPRESS / REST), originally written in
// BASIC for Compucolor/Intecolor 8001-family terminal hardware.
//
// Design: Dagfinn Aksnes, for his Master of Design (MDes by project)
// at the Royal College of Art, London, 1977–79.
// Original BASIC implementation: Dr George Mallen.
```

### Runtime plot-graphics heading

Status: VERIFIED

CHANGE TO:

```js
// ── Runtime: plot-graphics coordinate helpers ──
```

### [7120] air gauge comment

Status: VERIFIED

CHANGE TO:

```js
// [7120] IF ID=22 THEN 7300 - air gauge - Plot graphics
```

### [7130] depth trend comment

Status: VERIFIED

CHANGE TO:

```js
// [7130] IF ID=21 THEN 7200 - Plot graphics
```

### [1273–1277] render-site heading

Status: VERIFIED

CHANGE TO:

```jsx
{/* [1273–1277] depth scale ticks  -  cyan, Plot graphics */}
```

### [1346–1348] render-site heading

Status: VERIFIED

CHANGE TO:

```jsx
{/* [1346–1348] Time axis ticks  -  cyan, Plot graphics. */}
```

### CCI colour-map heading

Status: VERIFIED

CHANGE TO:

```js
// ── Runtime: Compucolor/Intecolor (CCI) colour map ──
// CCI refers to the Compucolor/Intecolor hardware family on which DIVER.BAS is believed to have originally run. The codes below (16–23) are the raw colour-attribute values used by the original PLOT commands; C(1..7) ([140]) holds a permutation of these same eight codes. Hex values are a modern SVG approximation of each code's CRT colour.
```

### [1] REM DIVER

Status: VERIFIED

CHANGE TO:

```js
// [1] REM DIVER  -  original BASIC program title.
```

### [100] CLEAR 20

Status: VERIFIED

CHANGE TO:

```js
// [100] CLEAR 20  -  reserves BASIC string space; no JSX equivalent required.
```

### BASIC array indexing note

Status: VERIFIED

ADD before the BASIC array definitions:

```js
// BASIC arrays are 1-based; JSX array handling follows the source indexing
// where practical. Any deliberate index translation is noted at the point of use.
```

### [1090] FRAME definition

Status: VERIFIED

CHANGE TO:

```js
// [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255  -  Code 2 enters Graphic Plot
// Mode; submode 246 is Y Bar Graph, Y0 Value. The sequence draws two adjacent
// vertical bars, both from Y0=YO to Y1, at plot-grid columns 158 and 159.
// "FRAME" is a JSX-only name for this constant, chosen because these bars mark
// the boundary of the title/cyan display area; it is not a BASIC term.
```

### [1090] FRAME render-site comment

Status: VERIFIED

CHANGE TO:

```jsx
{/* [1090] FRAME bar  -  two adjacent Y Bar Graph vertical bars (submode 246), right-edge boundary marker; see const FRAME above for full source citation and naming explanation. */}
```

### [1261], [1262], [1264] chained terminal controls

Status: VERIFIED

CHANGE TO:

```js
// [1261] PLOT 6,38,8,2,14,15  -  chained terminal controls in one statement:
//   code 6, arg 38   → CCI byte 38: BG=blue FG=cyan
//   code 8           → Home (Control-H): cursor to 0,0
//   code 2           → enter Graphic Plot Mode, which defaults to X Point Plot
//   values 14,15     → plot point X=14, Y=15
// [1262] PLOT 27,10,27,10  -  code 27 (ESC) with escape code 10 sets vertical
// write mode; the complete sequence is repeated once in the same statement.
// [1263] PRINT "5 METRE UNITS";  -  13 characters, vertical, cyan on blue
// [1264] PLOT 27,11,27,11  -  code 27 (ESC) with escape code 11 sets roll-up,
// left-to-right write mode; the complete sequence is repeated once.
```

The two old standalone spreadsheet entries for [1262] and [1264] are
superseded by this combined interpretation and must not be applied separately.

### [1265–1266] title text

Status: VERIFIED

CHANGE TO:

```js
// ── [1265–1266] title text  -  not visible in normal CCEMU execution ──
// The BASIC reaches these PRINT statements while still in Graphic Plot Mode,
// so no visible title/underline appears. JSX likewise does not render them;
// no title-cell timing/gating phase is required.
```

Evidence: DEF-018 records direct CCEMU execution with the title absent while the
terminal remained in Graphic Plot Mode; inserting diagnostic `PLOT 255` before
[1265] made the title and underline appear. The comment wording therefore rests
on observed execution, not inference alone.

DEF-018's visible-rendering fix is already present in the current JSX lineage:
the title and underline are not rendered. The later contained executable update
also removes the internal `titleCells`/`titleDone` timing phase, with subsequent
startup gating beginning at completion of the visible vertical-label stage.

### [1273–1276] depth-scale PLOT and loop

Status: VERIFIED

CHANGE TO:

```js
// ── Lines 1273–1277: depth scale tick marks ──────────────────
// [1273] PLOT 2,250,0  -  enters Graphic Plot Mode; submode 250 selects
// X Bar Graph, X0 Value, and sets X0=0.
// [1274] FOR I=140 TO 40 STEP -10  -  11 ticks (140,130,...,40)
// [1275] PLOT I,1  -  Y=I, X Max=1; draws a horizontal bar from X=0 through X=1.
// [1276] NEXT I
```

CHANGE the matching comment inside the JSX loop TO:

```js
// [1275] PLOT I,1  -  Y=I, X Max=1; horizontal bar from X=0 through X=1.
```

### [1277] PLOT 255

Status: VERIFIED

CHANGE TO:

```js
// [1277] PLOT 255  -  exits Plot Mode back to text mode on the real
// terminal, where both share one stateful serial protocol; leaving Plot
// Mode active would corrupt subsequent text. JSX has no equivalent
// because SVG drawing and DOM text are structurally separate here  - 
// there's no shared mode to exit. Historical Note, not a gap.
```

### [1346] chained terminal controls

Status: VERIFIED

CHANGE TO:

```js
// [1346] PLOT 6,38,2,246,34  -  chained controls in one statement:
//   code 6, arg 38               → CCI byte 38: BG=blue FG=cyan
//   code 2, submode 246, arg 34  → Y Bar Graph, Y0 Value; Y0=34
```

### [1348] Y Bar Graph data pair

Status: VERIFIED

CHANGE both [1348] comment sites TO:

```js
// [1348] PLOT I+10,35  -  X=I+10, Y Max=35; vertical bar from Y0=34 through Y=35.
```

The executable calculation is already consistent with this interpretation:
the rectangle is one graphical block wide and two graphical blocks high.
This is a comment-only clarification; no executable change is required.

---

## Verified executable correction

### [1273–1275] depth-scale tick X position

Status: VERIFIED

The source establishes `X0=0` at [1273]. Each [1275] pair then supplies
`Y=I` and `X Max=1`, drawing the tick from plot-grid X=0 through X=1.
The previous JSX started the rectangle at `W / 80` (6 px), which placed
it one complete text column to the right. This is a screen-measurement/
coordinate-domain inconsistency, not a change to the PLOT interpretation.

The corrected tick should begin at graphical X=0, the same graphical X
coordinate from which the diver trace starts, with its width derived exactly
from graphical columns X=0 through X=1.

CURRENT:

```js
BASIC_depthTicks.push({
  x: W / 80,                                  // col 1 -> SVG x=6px
  y: plotY(BASIC_I3),
  w: W / 80,                                  // one character width = 6px
  h: plotY(BASIC_I3 - 1) - plotY(BASIC_I3),
});
```

CHANGE TO:

```js
BASIC_depthTicks.push({
  x: 0,
  y: plotY(BASIC_I3),
  w: 2 * GRAPHIC_COL_W_160,
  h: plotY(BASIC_I3 - 1) - plotY(BASIC_I3),
});
```

Expected visible effect: all eleven depth-scale ticks move left by 6 px, from
the second text cell to the first, with no change to their vertical positions
or apparent width. No other display element, startup sequencing or scheduler
logic is to change.

---

## Verified 80×48 / 160×192 geometry wording

Status: VERIFIED

These entries record the coordinate model established by the Compucolor 8001
48-line specification, direct Code 14/15 CCEMU tests, the surviving BASIC and
the resulting arithmetic agreement with the historical display. John accepted
this wording on 22 August 2026; SB applied it to the final40 candidate and
verified it unchanged in final41.

### Shared coordinate model

ADD after the SVG viewport constants:

```js
// DIVER targets an 80×48 text grid and a 160×192 graphics grid. Code 14
// characters occupy two text rows; Code 15 restores one-row characters.
// SVG positions below are derived directly from those source grids.
```

### [1010–1100] cyan band and [1090] right-edge bars

ADD after the existing `[1010]` comment:

```js
// Code 14 remains active, so each printed space occupies two 48-line text rows.
```

ADD to the `[1090]` FRAME explanation:

```js
// Across the six iterations of [1040–1100], the two bars drawn by each
// execution of [1090] cover graphical rows 144–191: 48 of the 192
// graphics rows. This exactly matches the 100px height of the six
// Code-14 text rows.
```

### [1210–1260] DM blanking cells

ADD after the existing loop description:

```js
// Code 14 is still active. Cursor rows 2,4,6,8,10 therefore produce five
// adjacent two-row-high cells spanning rows 2–11 of the 48-line text grid.
```

### [1360–1361] time-axis label

CHANGE TO:

```js
// ── Lines 1360–1361: "TIME AT 10 MINUTE INTERVALS" label ─────
// [1360] PLOT 3,27,40  -  text cursor to column 27, row 40 on the
// 80×48 text grid.
// [1361] PRINT "TIME AT 10 MINUTE INTERVALS"  -  Code 14 set at [1010]
// remains active, so the character cell is two text rows high.
// Colour: cyan on blue (CCI byte 38 still active from line 1346).
```

This replaces the former use of 25-line CCEMU masking as the JSX positioning
rule. CCEMU directly establishes that row 40 is masked to row 8 in its 25-line
configuration. The 48-line hardware specification, the source's use of text
row 40 and graphical row 191, the continuing Code-14 state and the historical
display geometry together support modelling this sequence on the 80×48 text
and 160×192 graphics grids.

### [7110], [7145], [7150], [7160] DM text rows

CHANGE TO:

```js
// [7110] PLOT 14 selects large characters. [7145], [7150] and [7160]
// place the three DM text bands at rows 4, 7 and 9 of the 48-line grid.
// Each character occupies two rows, so its centre is one row below its origin.
```

### [7200–7240] fractional-depth indicator

ADD at the completed-transaction mapping:

```js
// [7200–7204] clears ten bars; [7210–7240] repaints INT(VA) bars
// from Y=164 toward Y=146. JSX applies the completed transaction as
// one frame so the terminal's brief clear pass is not presented as a
// separate travelling indicator, while preserving its total write delay.
```

Evidence: accelerated CCEMU DESCEND alternates between zero and five red bars
because `DR*TK=7.5`; REAL DESCEND shows the richer fractional sawtooth because
`DR*TK=0.9375`. In both recordings the completed red state is anchored at the
Y=164 end and no travelling clear packet is visible at 30fps.

### [7301–7342] air gauge geometry

CHANGE the opening geometry description TO:

```js
// [7301] PLOT 6,0,2,250,133  -  black; X Bar Graph with X0=133.
// [7302–7304] PLOT 183-2*I,134 clears rows 181,179,...,147;
// each bar runs from graphical X=133 through X=134.
```

### [8005–8006] MEMORY heading

CHANGE the render-site comment TO:

```jsx
{/* [8005] PLOT 15,6,7  -  turns blink and large characters off,
    then selects white foreground; [8006] places MEMORY at
    column 69, row 1 of the 80×48 text grid. */}
```

The Code-15 behaviour is stated directly in the Compucolor II manual:
it turns blink and large characters off. The following `6,7` is a
foreground-colour selection, not cursor positioning; [8006] performs the
cursor positioning separately.

### Later activity prompts

No change is proposed. A position-only attempt to move later Code-15 prompts
to the centre of a one-row cell was rejected because it retained the larger
SVG font and consequently shifted/clipped the glyph instead of scaling and
positioning it as one coherent normal-size character. The passed candidate
retains the established prompt rendering.

---

## Verified GOSUB 6600/7000 comment clarifications

Status: VERIFIED

These are comment-only replacements collected during the continuing sequential
review. John accepted this wording on 22 August 2026; SB applied it to the
final40 candidate and verified it unchanged in final41.

### [6205–6240] first expansion of DM

CHANGE TO:

```js
// [6205–6240] Writes AIR OK to Dive Monitor (DM) IDs 13–18 via GOSUB 7000.
```

This defines `DM` at its first occurrence in this part of the JSX; subsequent
comments may continue to use the abbreviation.

### [6601–6605] initial depth-gauge entry

CHANGE TO:

```js
// [6601] PLOT 29  -  selects foreground-colour control; GOSUB 7000
// later selects the colour for each depth-gauge character/bar.
// [6605] IF AD=AY THEN RETURN  -  false initially (0≠-1), so continue at [6610].
```

`PLOT 29` does not itself select red. The depth-gauge path supplies red through
`PLOT 6,1+FL` at [7250], with `FL` contributing the blink bit when set.

### [7130] depth-indicator clear and repaint

CHANGE TO:

```js
// [7130] IF ID=21 THEN 7200  -  branches to the depth-indicator graphics.
// [7200–7204] always clears all ten depth-indicator bars;
// [7205–7240] repaints the active bars only when VA is non-zero.
```

This replaces the incomplete wording `only the overlay`, which meant the
conditional repaint but did not identify either phase clearly.

The split is source-complete: [7200] selects black, enters X Bar Graph and
sets X0=152; [7200–7203] draws ten black bars at graphical rows
164,162,...,146; [7204] exits Plot Mode. [7205] skips repainting when VA=0;
otherwise [7210–7230] redraws VA active bars at the same positions and [7240]
exits Plot Mode.

### PLOT 6 colour-attribute argument forms

ADD to the CCI colour-map explanation:

```js
// PLOT 6 accepts a complete CCI attribute byte. Values such as 38 combine
// background and foreground fields; values 0–7 use only the foreground
// field, leaving the background black. FL adds the blink bit when set.
```

In this source, `PLOT 6,38` means blue background/cyan foreground, while
the Display Monitor calls use bare relative foreground indices:
`1` red, `2` green, `5` magenta and `7` white. These relative indices are
not keys into the JSX `CCI` object, which is keyed 16–23.

### [7147–7149] row-one colour branch

CHANGE TO:

```js
// [7147] IF CO=1 THEN 7149  -  selects green at [7149];
// otherwise [7148] selects magenta (relative foreground index 5).
```

This replaces the positional phrase `colour choice is applied below` with the
actual BASIC branch targets.

### [7250] depth-digit colour and cursor position

CHANGE TO:

```js
// [7250] PLOT 6,1+FL,3,57+ID,4  -  selects red, with FL adding the
// blink bit when set, then positions the cursor at column 57+ID, row 4.
```

---

## Verified continuing review comments  -  from final40 line 536

Status: VERIFIED

John accepted this batch on 22 August 2026. SB applied it to final41 and
verified that final41's executable text is identical to final40.

### GOSUB 6600 numeric depth and fractional indicator

CURRENT:

```js
// Both are computed within this one GOSUB (its own REM title, "SUB DEPTH
```

CHANGE TO:

```js
// GOSUB 6600 updates both the numeric depth display and the
// fractional-depth indicator selected by ID=21.
```

The existing sentence is truncated and leaves `Both` undefined. The replacement
identifies the two outputs represented immediately below by `digitCells` and
`trendCells` without adding executable behaviour.

### GOSUB 6100 handoff to GOSUB 6850

CURRENT:

```js
// GOSUB 6850. Not done on the outOfRange returns above  -  the original
// STOPs on those (line 6181), so 6850 is never reached in that case
```

CHANGE TO:

```js
// Preserve I and L from GOSUB 6100 for the later GOSUB 6850.
// The [6181] OUT OF RANGE:STOP paths return above and never reach this handoff.
```

`BASIC_I6` and `BASIC_L2` are JSX names for these preserved values, not
variables in the BASIC source.

### [6850–6899] NOSTOP/time-to-next-bound header

CURRENT:

```js
// [6850] SUB INITIALISES NOSTOP/TIME TO NEXT BOUND. Called from [1694]
// WORK-initiation only (paired with GOSUB 6950, called both immediately
// [6851] CO=0:FL=0:II=0  -  II here is a LOCAL scratch column-offset (0
// then 6, chosen at [6852]/[6881]), unrelated to the BASIC_I6/BASIC_L2
// Source is a two-way branch on [6852] IF AL(AL,7)>DT(I,1), sharing one
// digit-writer block ([6855]-[6861]) via GOTO 6855/6882:
// separate write, [6872]-[6880]), THEN falls through (II=6) to reuse
// refactor, since [6855] is the literal line both paths jump to.
// own write, IDs II+11/II+12) never reassign VA before their GOSUB 7000
// so both cells redisplay whatever VA was last set at [6878] (":" ,58)
// II=6 fall-through) always computes real seconds digits per [6859]/
// [6860] as written.
// CELL COLLISION: IDs 7-12/13-18 are the same DM cells GOSUB 6750
// writes every tick. GOSUB 6850 fires once, at WORK-initiation, earlier
// in the same runDiveTick() pass that later reaches GOSUB 6750
// unconditionally ([1694] -> ... -> GOTO 3000 -> [3530], all within one
// replace 6850's before it's ever rendered. Gated at the [3530] call
```

CHANGE TO:

```js
// [6850–6899] Initialises the DM at each WORK initiation [1694].
// [6852–6861] Branch A writes the time remaining to the first bound in
// IDs 7–12. [6872–6882] Branch B writes the total decompression requirement
// to IDs 7–12, then the time to the next bound to IDs 13–18.
// II is a local row offset (0 then 6), unrelated to BASIC_I6/BASIC_L2.
// [6879–6880] reuse VA=58, so both cells contain ':' as written in the source.
// GOSUB 6750 writes the same cells later in the [3530] pass; JSX gates that
// one same-tick call so [1694]'s queued serial writes remain visible for a tick.
```

The replacement retains the two source branches, the deliberate repeated-colon
behaviour and the JSX collision gate, while removing the damaged sentence
fragments and duplicated implementation history.

### [6260] retained source assignment

CURRENT:

```js
// [6260] I=D5:IF HT=10 THEN I=DX  -  dead code, see header comment.
```

CHANGE TO:

```js
// [6260] I=D5:IF HT=10 THEN I=DX  -  retained source assignment;
// I is not read again within GOSUB 6250.
```

Calling the statement `dead code` is too broad because BASIC variables are
global. The replacement states only what is established locally: the assignment
executes, but GOSUB 6250 does not subsequently read `I`.

### [6840] seconds-tens calculation

CURRENT:

```js
// [6840] ID=11:I=(I-INT(I))*60:VA=INT(I/10)+48:GOSUB 7000  -  OBSERVED
// tens-digit line in the file (e.g. [6859], [6785]). Translated
```

CHANGE TO:

```js
// [6840] ID=11:I=(I-INT(I))*60:VA=I/10+48:GOSUB 7000
// Source omits INT() from the seconds-tens calculation, unlike [6785]
// and [6859]; JSX preserves that arithmetic.
```

The existing comment is truncated and incorrectly inserts `INT()` into its
source transcription. The executable JSX already preserves the source's
`I/10+48` calculation; this is a comment-only correction.

### [6754] fractional DT row index

CURRENT:

```js
// [6754] J=INT(WM-7)/2  -  the original evaluates INT(WM-7) first.
// CCEMU execution confirms positive fractional array subscripts are truncated
// when DT(J,...) is evaluated: J=16.5 selects row 16, J=1.5 selects row 1.
```

CHANGE TO:

```js
// [6754] J=INT(WM-7)/2:IF J<1 THEN J=1.
// CCEMU confirms DT truncates positive fractional J (16.5→16; 1.5→1).
```

The replacement is shorter and transcribes the whole source line, including
the lower clamp. The following JSX retains the two distinct operations:
`Math.floor(BASIC_WM - 7) / 2` follows the written arithmetic, then
`Math.trunc(BASIC_J)` reproduces CCEMU's array-subscript handling.

### [6700–6740] initial air-gauge header

CURRENT:

```js
// ── Line 1445 GOSUB 6700  -  initial air gauge ─────────────────
// [6700] REM SUB AIR LEFT.
// [6710] REM THIS IS DUMMY RATE OF USAGE FOR DISPLAY ONLY  -  the gauge is explicitly a display-only consumption model.
// [6720] ID=22 selects the air bar in GOSUB 7000.
// [6725] VA=13-INT(CL*XS/10)  -  at CL=0, XS=2.0: VA=13
// [6730] IF VA<0 THEN RETURN
// [6731] IF LA=VA THEN RETURN  -  LA=0 initially, proceed
// [6732] LA=VA
// [6740] GOSUB 7000  -  routes to line 7300 (ID=22 air gauge bar)
// highest green block). VA's dummy formula (line 6725) never exceeds 13
```

CHANGE TO:

```js
// ── Line 1445 GOSUB 6700  -  initial air gauge ─────────────────
// [6700] REM SUB AIR LEFT.
// [6710] The source REM identifies the air-usage rate as dummy and display-only.
// [6720] ID=22 selects the air-gauge path in GOSUB 7000.
// [6725] VA=13-INT(CL*XS/10)  -  at CL=0, VA=13.
// [6730] IF VA<0 THEN RETURN.
// [6731] IF LA=VA THEN RETURN  -  false initially (0≠13), so continue at [6732].
// [6732] LA=VA.
// [6740] GOSUB 7000 routes ID=22 to [7300]. VA never exceeds 13, so
// the variable fill contains at most 13 green blocks.
```

This replaces the awkward word `explicitly` with the actual evidence: [6710]
itself labels the rate as dummy and display-only. It also repairs the orphaned
`highest green block)` fragment and replaces `proceed` with the branch result.

### [8000–8010] MEMORY entry

CURRENT:

```js
// [8000] REM MEMORY  -  end-of-dive display.
// [8010] AD=WD:GOSUB 6600:GOSUB 6700
// deliberately no GOSUB 6750 here, so MEMORY does not calculate/redraw
```

CHANGE TO:

```js
// [8000] REM MEMORY  -  end-of-dive display.
// [8010] AD=WD:GOSUB 6600:GOSUB 6700.
// GOSUB 8000 contains no GOSUB 6750, so it does not recalculate the live
// NOSTOP/time-to-bound display.
```

The replacement completes the truncated sentence without attributing an
unwritten intention to the source.

### [8090] final MEMORY row cell

CURRENT:

```js
// [8090] ID=18:VA=32:GOSUB 7000  -  trailing blank.
```

CHANGE TO:

```js
// [8090] ID=18:VA=32:GOSUB 7000  -  writes a space to the final row-3 cell.
```

`VA=32` is the space character. The replacement identifies both the character
and its location rather than relying on the shorthand `trailing blank`.

### [6731–6746], [7300–7342] air-gauge implementation block

CURRENT: the long comment block beginning with `[6732] LA=VA  -  stored
externally` and ending with `[6746] REM ***********`.

CHANGE TO:

```js
// [6731–6732] Runtime callers suppress unchanged VA and otherwise store LA=VA.
// [6740,7120,7300] ID=22 routes GOSUB 7000 to the air-gauge branch.
// [7301–7304] Black X Bar Graph clears 18 positions at Y=181,179,...,147;
// each bar runs from graphical X=133 through X=134.
// [7305–7308] The source issues three PLOT 6,5 bar draws. Direct CCEMU
// shows the completed lower gauge as one dark base and two visible magenta
// blocks; JSX reproduces that observed result.
// [7310–7340] If INT(VA)<>0, draws VA green bars above the lower marker.
// JSX constructs the completed 18-position result in one pass.
// [7304,7308,7342] PLOT 255 exits Plot Mode after each source pass;
// SVG has no shared terminal mode to exit. Historical Note, not a gap.
// [6745] RETURN; [6746] divider REM  -  no separate JSX action.
```

The source arithmetic sends three magenta draw pairs, but direct CCEMU evidence
shows two visible magenta blocks in the completed gauge. The passed JSX already
matches that observed output, so no executable change is proposed. This
supersedes the provisional three-visible-magenta interpretation raised during
review.

---

## Applied comment-coherence corrections  -  post-final41 sweep

Status: VERIFIED

These five comment-only corrections address sentence fragments found by a
full-file coherence sweep after the previous register was closed. John accepted
the first four on 22 August 2026; the adjacent [3530] correction was added from
the same reviewer pass. SB applied all five to final42. They do not alter any
executable JSX or reopen the previously VERIFIED items.

### [6181] OUT OF RANGE stop

CURRENT:

```js
// [6181] PRINT "OUT OF RANGE":STOP is a genuine BASIC STOP
// carrying on past GOSUB 6100 to call GOSUB 6950 and GOSUB
// fires, and GOSUB 6850 crashes here since GOSUB 6100's
```

CHANGE TO:

```js
// [6181] PRINT "OUT OF RANGE":STOP  -  halt before [1693–1694]
// and the later display calls in this main-loop pass.
```

GOSUB 6100 reaches [6181] when either DT-table search runs out of valid
entries. The BASIC then stops, so GOSUB 6950, GOSUB 6850 and the later display
calls are not reached. JSX represents that stop by setting the OUT OF RANGE
state and returning immediately.

### [1694] initial NOSTOP/time-to-bound writes

CURRENT:

```js
// [1694] GOSUB 6850  -  implemented
// quirk. Writes into the same boundCells state GOSUB 6750
// GOSUB 6750 call later in this same runDiveTick() pass (see
// [3530] below) skips overwriting it, letting this display
// actually be visible for at least one tick before GOSUB 6750's
// Branch A would silently wipe any row-3 content GOSUB 6250 had
```

CHANGE TO:

```js
// [1694] GOSUB 6850  -  queues the initial NOSTOP/time-to-bound DM writes.
// JSX sets a one-shot gate so [3530] GOSUB 6750 cannot replace those
// writes before React displays them.
```

The real terminal performs the [1694] and later [3530] serial writes in
sequence. React could batch both state updates into one render, hiding the
[1694] result; `nostopEventCellsRef` therefore suppresses only that same-pass
[3530] call. Normal GOSUB 6750 processing resumes on the next tick.

### [3530] one-shot gate consumer

CURRENT:

```js
// [3530] GOSUB 6750  -  NOSTOP/time-to-bound, now
// GATED: GOSUB 6750 is
// GOSUB 6850's same-tick write on the real hardware  -  but there, each
// GOSUB 6750 actually wrote something (cells.length>0) or hit its own
```

CHANGE TO:

```js
// [3530] GOSUB 6750  -  NOSTOP/time-to-bound. Gated: if [1694]'s same-pass
// write already fired this tick, skip GOSUB 6750 here so it cannot
// overwrite that display before React renders it.
```

This states the same one-shot accommodation from the point where the gate is
consumed. It does not change the gate or its scope.

### [6350] coloured-band DT scan

CURRENT:

```js
// [6350] FOR J=1 TO 7  -  band-search scan.
// clause a little further up this function, around [1605]).
```

CHANGE TO:

```js
// [6350] FOR J=1 TO 7  -  scans the seven DT columns for band boundaries.
```

The inner [6360–6375] loop finds the depth boundary for each coloured band.
The dangling reference to [1605] is unrelated to this loop.

### [5316] invalid DESCEND depth

DELETE this redundant fragment:

```js
// [5316] IF M<AD OR M>50 THEN 5312, looping back to re-show "TO WHAT
```

The complete [5316] behaviour is already documented beside the executable
test: an invalid depth returns to [5312], repeats the bell and prompt, and does
not write the value to PA. No replacement is required.

---

## Applied continuing coherence corrections  -  final43

Status: VERIFIED

John accepted these three comment-only changes on 22 August 2026. SB applied
them to final43; independent file review remains required before VERIFIED.

### [5500–5501] ordinary new-WORK entry

DELETE this sentence fragment:

```js
// this  -  since PA(PA,2)<0 is checked first thing
```

The ordinary new-WORK route already documents the complete sequence beside
the executable lines: [1900] selects PA=1, [2080] sets PA(PA,2)=-1, and
[5501] detects that negative duration and branches to [5509] for the BOTTOM
TIME prompt. The separate `gosub_5500_continue_existing_stack()` function
handles the [1891–1893] path that preserves an already-built PA stack.
Deleting the fragment loses no source or JSX explanation.

### [1278–1281] WORKING DEPTH bell and re-entry

CURRENT opening comments:

```js
// [1278] PRINT CHR$(7):GOTO 1280  -  sounds the terminal's physical bell
// as the initial audible prompt cue, then skips the alternate re-entry at
// [1279]. JSX preserves this with a one-shot bell() call when the initial
// WORKING DEPTH prompt becomes visible.
// [1279  -  handwritten insertion in the surviving manuscript]
// PLOT 3,0,0:PRINT CHR$(7);  -  homes the cursor and sounds the terminal bell
// on invalid-WD re-entry before falling through to [1280].
```

CHANGE TO:

```js
// [1278] PRINT CHR$(7):GOTO 1280  -  starts the terminal bell as the
// initial audible prompt cue, then skips the alternate re-entry at [1279].
// JSX starts the corresponding latched tone when the initial WORKING DEPTH
// prompt becomes visible; completing the INPUT stops it.
// [1279  -  handwritten insertion in the surviving manuscript]
// PLOT 3,0,0:PRINT CHR$(7);  -  homes the cursor and restarts the terminal
// bell on invalid-WD re-entry before falling through to [1280].
```

The previous phrase `one-shot bell() call` described the number of initial
calls but could be read as a fixed-duration sound. The implemented bell is
latched: CHR$(7) starts it and completion of the corresponding INPUT stops it.
The remaining [1280–1281] comments are unchanged.

### [1300–1355] initial values and time mode

CURRENT:

```js
// ── Lines 1300–1355: variable initialisations and time mode ───
// [1300] DR=30, AR=15, AD=0, CL=0
// [1301] WM=0, LM=0
// [1303–1308] Time mode prompt  -  INPUT "TIME MODE (REAL OR ACCELERATED)? "
// [1308  -  handwritten manuscript addition] ":GOTO 1316" is added to the
// printed TK=.25 line, making the ACCELERATED path jump explicitly to [1316].
// [1316] IK=TK; [1317] IF IK<0.5 THEN IK=0.5
// [1320] XS=1, LA=0
// [1330] IF WD<17 THEN XS=0.5
// [1340] IF WD>20 THEN XS=2.0   (at WD=40: XS=2.0)
// [1345] YS=2
// [1349] WE=0, HT=0, D5=0, DX=0
// [1350] AY=-1
// [1355] BT=0
```

CHANGE TO:

```js
// ── Lines 1300–1355: variable initialisations and time mode ───
// [1300] DR=30, AR=15, AD=0, CL=0
// [1301] WM=0, LM=0
// [1303–1309] Bell and time-mode input: "REAL" sets TK=1/32;
// any other response sets TK=0.25.
// [1308  -  handwritten manuscript addition] GOTO 1316 makes the
// accelerated path skip the REAL assignment at [1309].
// [1316] IK=TK; [1317] IF IK<0.5 THEN IK=0.5
// [1320] XS=1, LA=0
// [1330] IF WD<17 THEN XS=0.5
// [1340] IF WD>20 THEN XS=2.0
// [1345] YS=2
// [1349] WE=0, HT=0, D5=0, DX=0
// [1350] AY=-1
// [1355] BT=0
```

This includes the REAL assignment at [1309] and records the source's actual
branch rule: only exact `REAL` selects real time; every other response takes
the accelerated path. The WD=40 example is unnecessary and is removed.
Lines [1346–1348] remain covered by their separate tick-generation comments.

---

## Agreed changes  -  next markup batch

### [6851] I/L handoff from GOSUB 6100

Status: APPLIED

CURRENT:

```js
// [6851] "I&L OBTAINED FROM PREV CALL TO SUB 6100"  -  a genuine handoff
// before either of its return points; GOSUB 6850 needs to read whatever
// GOSUB 6100 last left behind, exactly as classic BASIC's lack of scoping
// NOT the local I/L reused for unrelated purposes inside GOSUB 6250/6800/
```

CHANGE TO:

```js
// [6851] "I&L OBTAINED FROM PREV CALL TO SUB 6100"  -  global BASIC
// variables left at either return point and subsequently read by GOSUB 6850.
// They are distinct here from the unrelated local I/L used in the JSX
// translations of GOSUB 6250 and GOSUB 6800.
```

This retains the source's deliberate cross-subroutine handoff while
distinguishing it from unrelated JSX-local uses of the same source names.

### [1370–1630] dual scalar/array names

Status: APPLIED

CURRENT:

```js
let BASIC_PA = [];  // [1370] DIM PA(8,5)  -  1-based both axes
let BASIC_PA_scalar;  // [1410] PA scalar  -  separate per STYLE_GUIDE naming convention
let BASIC_ES = [];  // [1416] DIM ES(30,2)  -  1-based both axes
let BASIC_ES_scalar;  // [1440] ES scalar  -  separate per STYLE_GUIDE naming convention
let BASIC_EP;  // [1440] EP  -  event pointer
let BASIC_AL = [];  // [1460] DIM AL(15,7)  -  1-based both axes
let BASIC_AL_scalar;  // [1630] AL scalar  -  separate per STYLE_GUIDE naming convention
let BASIC_P;
let BASIC_CK;  // [1789] CK  -  display loop gate flag
let BASIC_AA, BASIC_BB;  // [1465] AA=CL, BB=AD  -  saved clock/depth
```

CHANGE TO:

```js
// DIVER.BAS uses PA, ES and AL as both array and scalar names.
// JavaScript cannot do so, therefore `_scalar` distinguishes each scalar form.
let BASIC_PA = [];       // [1370] DIM PA(8,5)  -  1-based both axes
let BASIC_PA_scalar;     // [1410] scalar PA
let BASIC_ES = [];       // [1416] DIM ES(30,2)  -  1-based both axes
let BASIC_ES_scalar;     // [1440] scalar ES
let BASIC_EP;            // [1440] EP  -  event pointer
let BASIC_AL = [];       // [1460] DIM AL(15,7)  -  1-based both axes
let BASIC_AL_scalar;     // [1630] scalar AL
let BASIC_P;
let BASIC_CK;            // [1789] CK  -  display loop gate flag
let BASIC_AA, BASIC_BB;  // [1465] AA=CL, BB=AD  -  saved clock/depth
```

This makes the reason for the `_scalar` suffix self-contained and removes
three repetitive references to the external style guide.

### `DISPLAY_WRITE_MS` presentation-timing comment

Status: APPLIED

CURRENT:

```js
// TEMPORAL DISPLAY FIDELITY  -  presentation layer only.
// BASIC simulation state/timing is untouched; only visible screen writes
// are paced. One central value lets the cadence be tuned against CCEMU clips.
const DISPLAY_WRITE_MS = 35;
```

CHANGE TO:

```js
// Default delay between queued screen writes; does not affect simulation timing.
const DISPLAY_WRITE_MS = 35;
```

This retains the significant distinction between display pacing and simulation
timing. It removes repetition and the now-inaccurate suggestion that there is
only one central display-timing value.

### PLOT 31 shared blink phase

Status: APPLIED

CURRENT:

```js
// PLOT 31 blink is a display attribute, not another queued write. One
// shared phase keeps every flashing character in step, as terminal
// hardware would, regardless of when that character entered the queue.
```

CHANGE TO:

```js
// PLOT 31 sets a blink attribute rather than issuing another queued write.
// A shared phase keeps all blinking characters synchronised, matching the
// terminal regardless of when each character was written.
```

This separates the attribute interpretation from the reason for using one
shared blink phase and removes the awkward queue-based ending.

### Sequential text-cell writes

Status: APPLIED

CURRENT:

```js
// Sequentially overwrite text cells at their BASIC screen positions.
// This models repeated GOSUB 7000 writes rather than replacing a whole
// React text group atomically.
```

CHANGE TO:

```js
// Writes text cells sequentially at their BASIC screen positions,
// reproducing repeated GOSUB 7000 writes instead of updating the entire
// text group at once.
```

This removes framework-specific wording while retaining the source-fidelity
reason for performing the writes sequentially.

### [8006] MEMORY heading writes

Status: APPLIED

CURRENT:

```js
// [8006] PRINT "MEMORY";  -  six terminal character writes.
// The semicolon means no newline; reveal the heading through the same
// 35 ms character stream as the rest of the DM text.
```

CHANGE TO:

```js
// [8006] PRINT "MEMORY";  -  outputs six characters without a newline.
// JSX queues them at the default 35 ms text-write interval.
```

This describes the single PRINT statement more precisely while retaining its
six serial character outputs and their JSX display timing.

### [7200–7240] depth-indicator transaction

Status: APPLIED

CURRENT:

```js
// [7200-7204] clears ten bars; [7210-7240] repaints INT(VA) bars
// from Y=164 toward Y=146. JSX applies the completed transaction as
// one frame so the terminal's brief clear pass is not presented as a
// separate travelling indicator, while preserving its total write delay.
```

CHANGE TO:

```js
// [7200–7204] clears all ten bars; [7210–7240] redraws INT(VA) bars
// from Y=164 toward Y=146. JSX preserves the combined write delay but
// displays only the completed indicator, omitting the brief cleared state.
```

This states the source sequence and the JSX presentation choice directly,
without the ambiguous phrase `separate travelling indicator`.

### [6300–6599] replace numeric branch labels

Status: APPLIED

The JSX uses the invented labels `Branch 1` and `Branch 2` without defining
them before their first appearance. Replace all seven occurrences with the
source paths they actually denote.

CHANGE the two state-declaration comments TO:

```js
// [6320] Non-WORK profile segments accumulated one per tick by GOSUB 6300.
const [profileSegs, setProfileSegs] = useState([]);

const previousPaintedAscendGridRef = useRef(null);
const finalPaintedAscendGridRef = useRef(null);

// [6510]/[6525] WORK coloured-band bars generated by GOSUB 6300.
const [bandSegs, setBandSegs] = useState([]);
```

CHANGE the [3410] call-site comment TO:

```js
// [3410] GOSUB 6300  -  plots this tick's activity; branches internally at
// [6312] to the WORK coloured-band path or the non-WORK profile path.
```

This corrects the existing description `descent profile line` without
misdescribing the universal call site. [3410] is the sole GOSUB 6300 call;
both WORK and non-WORK activities enter there and separate at [6312].

CHANGE the [6330] path comment TO:

```js
// [6312→6330] WORK plotting path  -  coloured-band profile.
```

CHANGE the three matching render-site comments TO:

```jsx
{/* [6510]/[6525] GOSUB 6300 WORK path  -  coloured-band bars. */}
```

```jsx
{/* [6591] PLOT 2,253,X3,Y3,255  -  WORK position track. */}
```

```jsx
{/* [6320] GOSUB 6300 non-WORK path  -  profile segments. */}
```

The terminology follows the actual source split at [6312]: activity 3 branches
to the WORK path at [6330]; all other activities remain on the non-WORK path.

### [6320] damaged GOSUB 6300 fragment

Status: APPLIED

DELETE:

```js
// GOSUB 6300 branches  -  which a still
```

The surrounding source-line comments already explain the plotting logic, so
no replacement is required.

---

## Superseded / no longer outstanding

The former `PRINT CHR$(7)` entry stating that no JSX audio was implemented is
superseded. The current bell candidate implements the BASIC bell occurrences
as a latched warning tone: `CHR$(7)` starts the tone and the corresponding
user `INPUT`/program `END` stops it. Exact pitch remains an empirical
reconstruction choice.

The old standalone [1262] and [1264] spreadsheet rows are superseded by the
combined [1261]/[1262]/[1264] item above.

---

## REVIEW CHECKPOINT

**Sequential comment review completed through BASIC line 1273.**

Everything after BASIC 1273 remains open comment-audit scope. This is a
source-reference/comment-fidelity task, not evidence of an executable defect.
Later items already agreed (for example [1346]) do not imply that the
intervening JSX/BASIC has been sequentially reviewed.
