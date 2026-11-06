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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

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

Status: VERIFIED

DELETE:

```js
// GOSUB 6300 branches  -  which a still
```

The surrounding source-line comments already explain the plotting logic, so
no replacement is required.

### [6591] WORK-position point state

Status: VERIFIED

CURRENT:

```js
// [6591] PLOT 2,253,X3,Y3,255  -  diver's position dot during WORK
const [workDots, setWorkDots] = useState([]);
```

CHANGE TO:

```js
// [6591] PLOT 2,253,X3,Y3,255  -  WORK-position points accumulated
// to draw the diver’s track.
const [workDots, setWorkDots] = useState([]);
```

This makes clear that each source PLOT supplies one point and that the stored
points collectively form the WORK portion of the diver's track.

### [1445] initial depth/air display cells

Status: VERIFIED

CURRENT:

```js
// [1445] GOSUB 6600 initial call (AD=0) seeds the print-in reveal
const [depthDigitCells, setDepthDigitCells] = useState(() => gosub_6600(0).digitCells);
```

CHANGE TO:

```js
// [1445] Initial GOSUB 6600 (AD=0) supplies the depth-gauge cells
// for the progressive startup display.
const [depthDigitCells, setDepthDigitCells] = useState(() => gosub_6600(0).digitCells);
```

CURRENT:

```js
// [1445] GOSUB 6700 initial call (CL=0) seeds the print-in reveal
const [airGaugeCells, setAirGaugeCells] = useState(() => gosub_6700(0, 2.0));
```

CHANGE TO:

```js
// [1445] Initial GOSUB 6700 (CL=0) supplies the air-gauge cells
// for the progressive startup display.
const [airGaugeCells, setAirGaugeCells] = useState(() => gosub_6700(0, 2.0));
```

`Print-in reveal` was project shorthand rather than BASIC or Compucolor
terminology. The replacement describes the cells' role in the staged startup
display directly.

### [5970] invalid-WORK latch and [6950] stop text

Status: VERIFIED

DELETE this misplaced block from the display-state declarations:

```js
// [5970] PA=-1 returns to the main activity-copy path. On CCEMU this
// subsequently produces an interpreter CF ERROR at [1645]. The JSX does
// not reproduce host/interpreter error text; runtimeErrorRef below simply
// prevents an invalid WORK from continuing or reaching a display pass.
```

The detailed [2680–2686] handler comment already records the live CCEMU
evidence and explains why JSX reproduces the behavioural consequence rather
than the interpreter's error text. The declaration block need not duplicate
that explanation or refer to a ref declared much later.

CHANGE the runtime-error ref declaration FROM:

```js
const runtimeErrorRef = useRef(false);
```

TO:

```js
// [5970→1645] JSX termination latch for the PA=-1 invalid-WORK path.
const runtimeErrorRef = useRef(false);
```

CHANGE the unfinished [6950] comment FROM:

```js
// [6950] STOP10/STOP 5 text, WORK-initiation only. See gosub_6950's own
const [stopCells, setStopCells] = useState([]);
```

TO:

```js
// [6950] STOP 10/STOP 5 text displayed only when WORK begins.
const [stopCells, setStopCells] = useState([]);
```

### [1465–4000] `runDiveTick()` opening comments

Status: VERIFIED

CURRENT:

```js
// Execute one iteration of the main dive loop (lines 1465–4000).
// GOSUB 6600 (line 3510) is
function runDiveTick() {
  // BASIC PLOT/character output is synchronous execution. A new main-loop
  // pass cannot begin while an actual source display transaction is still
  // visibly draining. This changes wall-clock pacing only, never CL/AD/TK.
  if (displayWriteBusyRef.current) return;

  // [3530] GOSUB 6750 occurs after [3410] GOSUB 6300 in the BASIC.
  // Therefore graphics written by 6300 on this pass must already be visible
  // even if 6750 later halts at [6763].
```

CHANGE TO:

```js
// Executes one pass through the main dive loop ([1465–4000]).
function runDiveTick() {
  // BASIC issues PLOT and character output synchronously within each loop pass.
  // JSX waits for the queued screen writes to finish before starting another
  // pass. This affects wall-clock pacing only, not CL, AD or TK.
  if (displayWriteBusyRef.current) return;

  // [3410] GOSUB 6300 precedes [3530] GOSUB 6750. Queue the 6300 graphics
  // first so they remain visible if GOSUB 6750 stops at [6763].
```

This removes the unfinished GOSUB 6600 fragment and states the display gate
and source-call ordering directly.

### [1692] GOSUB 6100 call site

Status: VERIFIED

CURRENT:

```js
BASIC_BT = BASIC_AL[BASIC_AL_scalar][7];
// [1692] GOSUB 6100  -  implemented
{
```

CHANGE TO:

```js
BASIC_BT = BASIC_AL[BASIC_AL_scalar][7];
// [1692] GOSUB 6100  -  checks whether the next ascent will cross
// a decompression boundary.
{
```

The executable call immediately below already demonstrates that the GOSUB is
implemented. The replacement instead identifies its purpose at this call site;
the detailed HT/DX/D5 behaviour remains documented at the subroutine definition.

### [1693] GOSUB 6950 call site

Status: VERIFIED

CURRENT:

```js
}
// [1693] GOSUB 6950  -  implemented
queueTextCellWrites(setStopCells, gosub_6950().cells);
```

CHANGE TO:

```js
}
// [1693] GOSUB 6950  -  writes the initial STOP 10/STOP 5 display.
queueTextCellWrites(setStopCells, gosub_6950().cells);
```

`Initial` distinguishes this WORK-initiation display from later
decompression-stop handling.

### [1694]/[6850–6899] queued NOSTOP/time-to-bound writes

Status: VERIFIED

CURRENT:

```js
const nostopResult = gosub_6850();
// [1694]/[6850-6899] These are literal GOSUB 7000 screen writes.
// Spaces, fixed text and time characters all enter the same global
// queue so later overwrites cannot overtake an unfinished row.
```

CHANGE TO:

```js
const nostopResult = gosub_6850();
// [1694]/[6850–6899] Queue the NOSTOP/time-to-bound characters in
// source order, including spaces, so each row finishes before later
// display writes can replace it.
```

This retains the significant ordering rule while removing the implementation-
heavy phrases `literal screen writes`, `global queue` and `overtake`.

### [1682] clearing DM character positions 13–18

Status: VERIFIED

CURRENT:

```js
// [1682] VA=32:FOR ID=13 TO 18:GOSUB 7000:NEXT ID  -  implemented
// display (GOSUB 6250 or GOSUB 6850 Branch B's fall-through)
// 3 the same way GOSUB 6250/6800/6850 already do  -  six space
{
  const blankCells = [];
  const BASIC_FL = 0, BASIC_CO = 0;
  for (let BASIC_ID = 13; BASIC_ID <= 18; BASIC_ID++) {
    const c = gosub_7000(BASIC_ID, 32, BASIC_FL, BASIC_CO);
    if (c) blankCells.push({ ...c, line: 3 });
  }
  // [1682] Six spaces are six real terminal writes; queue them
  // rather than deleting/replacing the React row atomically.
  queueBoundCellWrites(blankCells, false);
}
```

CHANGE TO:

```js
// [1682] VA=32:FOR ID=13 TO 18:GOSUB 7000:NEXT ID  -  writes six
// spaces to clear DM character positions 13–18.
{
  const blankCells = [];
  const BASIC_FL = 0, BASIC_CO = 0;
  for (let BASIC_ID = 13; BASIC_ID <= 18; BASIC_ID++) {
    const c = gosub_7000(BASIC_ID, 32, BASIC_FL, BASIC_CO);
    if (c) blankCells.push({ ...c, line: 3 });
  }
  // Preserve the six source character writes in queue order.
  queueBoundCellWrites(blankCells, false);
}
```

This removes three sentence fragments, the redundant `implemented` label and
the framework-specific atomic-row comparison. The replacement describes the
six source writes and their purpose directly.

### [1685–1710] shared event continuation and GOSUB 6250

Status: VERIFIED

CURRENT:

```js
// [1685] GOTO 1730  -  ASCEND joins the common continuation at [1730].
} else if (BASIC_AL[BASIC_P][1] === 4) {
  // [1700] DECOMPRESS
  BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
  // [1701] GOSUB 6250  -  implemented
  // flag. Writes into the same boundCells state GOSUB 6850's
  // Branch B fall-through and GOSUB 6750 (II=12 case) use, since
  // the way GOSUB 6850/6750 needed gating for.
  const decompDisplayResult = gosub_6250();
  if (decompDisplayResult.cells.length > 0) {
    queueBoundCellWrites(decompDisplayResult.cells, false);
  }
  // [1705] GOTO 1730  -  DECOMPRESS joins the common continuation at [1730].
} else if (BASIC_AL[BASIC_P][1] === 5) {
  // [1710] REST
  BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
}
```

CHANGE TO:

```js
// [1685] GOTO 1730  -  continue with shared event scheduling.
} else if (BASIC_AL[BASIC_P][1] === 4) {
  // [1700] DECOMPRESS
  BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];

  // [1701] GOSUB 6250  -  when HT>5, writes the current decompression
  // requirement at this depth to DM character positions 13–18.
  const decompDisplayResult = gosub_6250();
  if (decompDisplayResult.cells.length > 0) {
    queueBoundCellWrites(decompDisplayResult.cells, false);
  }

  // [1705] GOTO 1730  -  continue with shared event scheduling.
} else if (BASIC_AL[BASIC_P][1] === 5) {
  // [1710] REST
  BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
}
```

This replaces the vague `common continuation` wording with the purpose of the
[1730] block, removes the damaged [1701] explanation and eliminates the
undefined `Branch B` label. REST at [1710] naturally falls through to [1730].

### Activity-start dispatch break and terminal REST

Status: VERIFIED

CHANGE the orphaned fragment FROM:

```js
// consumed. This matters when GOSUB 5900 creates a zero-duration
break;
```

TO:

```js
// The activity-start event has now been dispatched and its end event queued.
// Stop after one event so a zero-duration activity created by GOSUB 5900
// cannot also finish within this same JSX pass.
break;
```

CHANGE the REST description FROM:

```js
// [1800]-[1820] REST is terminal in the original program:
// [1815] GOSUB 8000 refreshes the final MEMORY display, then END.
```

TO:

```js
// [1800–1820] Completion of REST ends the dive: GOSUB 8000 refreshes
// the final MEMORY display, then END stops the program.
```

This identifies what has been dispatched and states REST's terminating effect
directly.

### [8020–8090] final MEMORY writes

Status: VERIFIED

CURRENT:

```js
// [8020-8090] final MEMORY DM contents are literal GOSUB 7000
// character writes, including spaces. They therefore join the
// same 35 ms serial text stream instead of appearing atomically.
queueTextCellWrites(setMemoryCells, memoryResult.cells);
```

CHANGE TO:

```js
// [8020–8090] Queue the final MEMORY characters, including spaces, in
// source order. [8090]'s own REM ("don't know value of VA") is Mallen's
// note of uncertainty about one value in this block.
queueTextCellWrites(setMemoryCells, memoryResult.cells);
```

The queue function and DISPLAY_WRITE_MS declaration already document pacing.
The added sentence preserves an explicit primary-source authorial annotation.

### [1888] completed-DECOMPRESS display

Status: VERIFIED

CURRENT:

```js
// [1888] IF AL(AL,1)=4 THEN GOSUB 7500. The decompression stop
if (BASIC_AL[BASIC_AL_scalar][1] === 4) {
```

CHANGE TO:

```js
// [1888] IF AL(AL,1)=4 THEN GOSUB 7500  -  when DECOMPRESS ends,
// clear its time row and update the STOP/ASCEND display.
if (BASIC_AL[BASIC_AL_scalar][1] === 4) {
```

This completes the truncated sentence and states both visible effects of
GOSUB 7500.

### [7515–7545] STOP/ASCEND character updates

Status: VERIFIED

CURRENT:

```js
// [7515]-[7545] likewise writes only the characters present in
// the BASIC branch: either IDs 5-6 (STOP -> STOP 5) or all six
// cells as ASCEND. Coordinate overwrite preserves untouched STOP
// characters until their queued replacement arrives.
queueTextCellWrites(setStopCells, decompFinishedDisplay.stopCells);
```

CHANGE TO:

```js
// [7515–7545] Queue only the positions written by the source: HT=10
// overwrites IDs 5–6, changing STOP 10 to STOP 5; otherwise IDs 1–6
// are overwritten with ASCEND.
queueTextCellWrites(setStopCells, decompFinishedDisplay.stopCells);
```

This removes the unclear `likewise` and explains the partial overwrite through
the actual source branches.

### [1890–1893] staged-WORK PA rows

Status: VERIFIED

CURRENT:

```js
// [1890-1893] Special staged-WORK path. If the look-ahead answer
// preserves the existing PA stack and jumps straight to GOSUB 5500.
```

CHANGE TO:

```js
// [1890–1893] When no activity name matched (NA=0) and the current
// default is WORK, set NA=3. If PA still contains WORK stages queued by
// GOSUB 5900, continue them through GOSUB 5500 instead of rebuilding PA.
```

This defines the former `PA stack` as queued WORK-stage rows and explains why
the ordinary PA-building path is bypassed.

### [1895] default successor

Status: VERIFIED

CURRENT:

```js
// [1895] Ordinary default resolution.
if (BASIC_NA === 0) BASIC_NA = BASIC_AL[BASIC_AL_scalar][5];
```

CHANGE TO:

```js
// [1895] IF NA=0 THEN NA=AL(AL,5)  -  if no activity was selected,
// use the current activity’s default successor.
if (BASIC_NA === 0) BASIC_NA = BASIC_AL[BASIC_AL_scalar][5];
```

This identifies what is defaulted and where the default comes from.

### Pending start event with no PA row

Status: VERIFIED

CURRENT:

```js
// No PA is available for this pending start event yet. Restore EP so
// the same event remains pending; [3010-3036] below may obtain the
// next activity through the predictive WHICH ACTIVITY prompt.
BASIC_EP = BASIC_EP - 1;
```

CHANGE TO:

```js
// No PA row is ready; restore EP so [3010–3036] can obtain the next
// activity before this start event is retried.
BASIC_EP = BASIC_EP - 1;
```

This preserves the reason for decrementing EP without repeating the prompt
description.

### [1790], [2200] and [2999–3000] control-flow comments

Status: VERIFIED

CURRENT:

```js
// [2200] GOTO 1465 after a true end-of-event dispatch. Returning here
// makes the next React tick re-enter at [1465] rather than fall through
// [2999] REM + + + + + + + + + + + +  -  source DISPLAY-section divider; no executable effect.
// to [3000]/[3400], preserving the BASIC control-flow ordering before
// the successor activity reaches the display/movement path.
if (BASIC_END_EVENT_DISPATCHED) return;

} else {
  // look-ahead section without executing another [1465]-[1471] cycle.
  resumeAt3000Ref.current = false;
}
```

CHANGE TO:

```js
// [2200] GOTO 1465  -  after dispatching the successor activity at an
// event boundary, begin a new main-loop pass before the [3000] display logic.
if (BASIC_END_EVENT_DISPATCHED) return;

} else {
  // [1790] Resume at [3000] without repeating [1465–1471].
  resumeAt3000Ref.current = false;
}
```

MOVE the displaced [2999] comment and expand it immediately before the
existing [3010] comment:

```js
// [2999] divider REM; [3000] REM DISPLAY  -  source headings only,
// with no executable effect.
```

This separates three source references that had become interleaved and removes
the framework-specific `React tick` wording.

### [3010–3017] predictive threshold and AIR OK

Status: VERIFIED

CURRENT:

```js
// [3010] IF CL<ES(EP,2)-IK THEN 3400  -  skip activity prompt if
if (activityStep === null && BASIC_CL >= BASIC_ES[BASIC_EP][2] - BASIC_IK && BASIC_CK === 0) {
  // [3017] IF AL(AL,1)=3 THEN GOSUB 6200  -  during WORK, rewrite
  // This is deliberately at the source call site, before [3021].
  if (BASIC_AL[BASIC_AL_scalar][1] === 3) {
    const airOkResult = gosub_6200();
    // [6205-6240] AIR OK is six GOSUB 7000 writes, not an atomic row.
    queueBoundCellWrites(airOkResult.cells, false);
  }
```

CHANGE TO:

```js
// [3010] IF CL<ES(EP,2)-IK THEN 3400  -  enter the prompt logic only
// when CL reaches the look-ahead threshold ES(EP,2)-IK.
if (activityStep === null &&
    BASIC_CL >= BASIC_ES[BASIC_EP][2] - BASIC_IK &&
    BASIC_CK === 0) {

  // [3017] IF AL(AL,1)=3 THEN GOSUB 6200  -  during WORK, write
  // AIR OK to DM character positions 13–18 before the activity prompt.
  if (BASIC_AL[BASIC_AL_scalar][1] === 3) {
    const airOkResult = gosub_6200();
    queueBoundCellWrites(airOkResult.cells, false);
  }
```

This completes both truncated comments and removes the repeated atomic-row
comparison.

### [3021–3036] predictive activity prompt and resume

Status: VERIFIED

CURRENT:

```js
// [3021] IF AL(AL,1)<>5 THEN 3025  -  REST skips the prompt entirely
if (BASIC_AL[BASIC_AL_scalar][1] !== 5) {
  // DECOMPRESS note: [1888] GOSUB 7500 is deliberately NOT done at
  // this predictive prompt. It belongs to the true [1800] event-boundary
  // [3025-3031] trigger "WHICH ACTIVITY REQUIRED (...)"
  BASIC_CK = 1;
  // [3025] CK=1:PRINT CHR$(7);  -  bell before WHICH ACTIVITY REQUIRED.
  bell();
  setActivityDefault(BASIC_A[BASIC_AL[BASIC_AL_scalar][5]]);
  setActivityStep('whichActivity');
  return;  // [3032] INPUT M$  -  execution resumes at [3400] after Enter
} else {
  // [3022] CK=1:GOTO 1465  -  REST suppresses WHICH ACTIVITY and does
  // not prepare another activity here. REST NEXT (GOSUB 5700) belongs
  BASIC_CK = 1;
  return;
}
}
} else {
  // [3035] recognised activity name: continue at [3400] in the same
  resumeAt3400Ref.current = false;
}
```

CHANGE TO:

```js
// [3021] IF AL(AL,1)<>5 THEN 3025  -  REST bypasses the activity prompt.
if (BASIC_AL[BASIC_AL_scalar][1] !== 5) {
  // During DECOMPRESS, [1888] GOSUB 7500 remains deferred until the
  // activity’s actual end event; it is not called at this predictive prompt.

  // [3025–3032] Set CK, ring the bell, display WHICH ACTIVITY REQUIRED
  // with the source default, then wait for INPUT M$.
  BASIC_CK = 1;
  bell();
  setActivityDefault(BASIC_A[BASIC_AL[BASIC_AL_scalar][5]]);
  setActivityStep('whichActivity');
  return;
} else {
  // [3022] CK=1:GOTO 1465  -  REST returns to the main loop without
  // prompting; its scheduled end event later terminates the dive.
  BASIC_CK = 1;
  return;
}
}
} else {
  // [3035–3036] After processing INPUT M$, continue at [3400] without
  // repeating the clock, event-dispatch or prompt logic above.
  resumeAt3400Ref.current = false;
}
```

This separates REST suppression, DECOMPRESS completion, the prompt sequence
and post-INPUT resumption. It also corrects the former claim that only a
recognised activity name reaches the resume branch.

### [3035–3036] remove vague `above`

Status: VERIFIED

CHANGE:

```js
// [3035–3036] After processing INPUT M$, continue at [3400] without
// repeating the clock, event-dispatch or prompt logic above.
```

TO:

```js
// [3035–3036] After processing INPUT M$, continue at [3400]
// without repeating [1465–3031].
```

The source range replaces the position-dependent word `above`.

### ASCEND actual-rise calculation

Status: VERIFIED

CHANGE the truncated comment:

```js
// BASIC_BB is the saved pre-tick AD from [1465]; BASIC_AD is
const actualRise = Math.abs(BASIC_BB - BASIC_AD);
```

TO:

```js
// BASIC_BB is the pre-tick AD saved at [1465]; BASIC_AD is the depth
// after the [3406–3408] ASCEND movement and target clamp.
const actualRise = Math.abs(BASIC_BB - BASIC_AD);
```

### [6310] zero-distance ASCEND grid column

Status: VERIFIED

CURRENT in final46:

```js
if (isZeroDistanceAscend && previousPaintedAscendGridRef.current !== null) {
  // [6310] A zero-distance ASCEND reuses the previously painted
  // profile-grid column.
  effectiveBarGridX = previousPaintedAscendGridRef.current;
}
```

CHANGE TO:

```js
if (isZeroDistanceAscend && previousPaintedAscendGridRef.current !== null) {
  // JSX-only rendering correction downstream of [6310]'s LP/LQ
  // calculation, not a direct translation of it. BASIC has no zero-distance
  // special case at [6310]. Reuse the previous profile-grid column so a
  // zero-distance ASCEND remains at its already-reached physical endpoint
  // instead of advancing to a later logical time column and leaving a gap.
  effectiveBarGridX = previousPaintedAscendGridRef.current;
}
```

DEF-024 records the confirmed cause and accepted fix: zero-distance ASCEND
rendering had advanced to the logical time-column position despite no physical
movement, producing JSX-only gaps before DECOMPRESS. The former direct [6310]
citation was therefore inaccurate.

### [6313–6320] zero-distance ASCEND segment

Status: VERIFIED

CHANGE the truncated fragment:

```js
// is still a plotted activity. Render its flat GOSUB 6300 vector
const isZeroDistanceAscend =
```

TO:

```js
// [6313–6320] A zero-distance ASCEND remains a plotted activity,
// so render its GOSUB 6300 vector as a flat segment.
const isZeroDistanceAscend =
```

### [6350] identify the DT table

Status: VERIFIED

CHANGE TO:

```js
// [6350] FOR J=1 TO 7  -  scans the seven columns of the DT
// decompression table to locate the coloured-band boundaries.
for (let BASIC_J = 1; BASIC_J <= 7; BASIC_J++) {
```

### [6360–6380] explain the DT row search

Status: VERIFIED

REPLACE the separate [6360], [6370] and [6375] comments with:

```js
// [6360–6375] Search DT column J from row L for the first 999
// sentinel or value below XX; the resulting I sets the next band
// boundary Y1 at [6380].
let BASIC_I = BASIC_L;
for (BASIC_I = BASIC_L; BASIC_I <= 21; BASIC_I++) {
  if (BASIC_DT[BASIC_I][BASIC_J] === 999 || BASIC_DT[BASIC_I][BASIC_J] < BASIC_XX) {
    break;
  }
}

// [6380] Y1=INT(140-(2*I+8)*YS)
```

This also corrects the current [6380] comment indentation.

### [6570] NEXT J

Status: VERIFIED

CHANGE TO:

```js
// [6570] NEXT J  -  continue the band search in the next DT column.
```

### [6590–6591] restored colours and WORK-position point

Status: VERIFIED

CHANGE TO:

```js
// [6590] PLOT 30,C(CO),29,16,29  -  restores background colour C(CO),
// sets the foreground to black (16), then issues the source’s final PLOT 29.
// [6591] PLOT 2,253,X3,Y3,255  -  plots one WORK-position point at
// (X3,Y3); successive points form the diver’s WORK track.
newWorkDots.push({
```

The final 29 has no following colour value within [6590], so the comment
preserves it literally without assigning an unsupported effect.

### WORK coloured-band column ordering

Status: VERIFIED

CHANGE TO:

```js
// Queue each WORK band column from top toward the time axis.
// Sorting by screen Y sets the order within the column; the X3 loop
// preserves the source’s left-to-right column order.
BASIC_columnBandBars.sort((a, b) => a.y - b.y);
```

This removes the CCEMU reference while retaining both ordering rules.

### [6593–6599] finish the GOSUB 6300 WORK path

Status: VERIFIED

CHANGE TO:

```js
// [6593] NEXT X3  -  continue with the next time-axis column.
}

// [6599] RETURN  -  completes the GOSUB 6300 WORK path.
// Queue the band bars before continuing to [3530] GOSUB 6750,
// preserving source write order if [6763] subsequently stops execution.
if (newBandBars.length > 0) {
```

### [3520]/[6731] conditional air-gauge redraw

Status: VERIFIED

CHANGE TO:

```js
// [3520] GOSUB 6700; [6731] returns when LA=VA, so [7301–7340]
// redraws the air gauge only when its displayed value changes.
const BASIC_AIR_VA = 13 - Math.floor(BASIC_CL * BASIC_XS / 10);
```

### [3530] same-pass display gate

Status: VERIFIED

CHANGE TO:

```js
// [3530] GOSUB 6750  -  if [1694] has already queued a display update
// in this pass, skip this call so that update is shown before any overwrite.
```

### [3530] queue GOSUB 6750 writes

Status: VERIFIED

CHANGE TO:

```js
// [3530] Queue GOSUB 6750’s DM character writes in source order.
queueBoundCellWrites(boundResult.cells, boundResult.outOfRange);
```

### [3560]/[4000] loop-end comments

Status: VERIFIED

CHANGE TO:

```js
// [3560] divider REM  -  no executable effect.
// [4000] GOTO 1465  -  the next timer call starts a new main-loop pass.
```

### [6763] OUT OF RANGE latch

Status: VERIFIED

CHANGE the truncated comment TO:

```js
// [6763] Latches OUT OF RANGE so no further main-loop pass begins.
const outOfRangeRef = useRef(false);
```

### [1820] normal end-of-dive latch

Status: VERIFIED

CHANGE the truncated comment TO:

```js
// [1820] Latches the normal end of the dive after REST completes.
const diveEndedRef = useRef(false);
```

### [1694]/[3530] one-pass NOSTOP display flag

Status: VERIFIED

CHANGE the damaged comment TO:

```js
// [1694]/[3530] Set after GOSUB 6850 queues the initial
// NOSTOP/time-to-bound update. Consumed once to skip the same-pass
// GOSUB 6750 call, then cleared.
const nostopEventCellsRef = useRef(false);
```

### [1304–1309] time-mode submission

Status: VERIFIED

CHANGE TO:

```js
// [1304–1309] Submit the time mode on Enter: REAL selects TK=1/32;
// any other input selects TK=0.25.
function handleTmKey(e) {
```

### [1304] stop the latched bell

Status: VERIFIED

CHANGE TO:

```js
// Completing [1304] INPUT M$ stops the latched bell.
stopBell();
```

### [1308] accelerated-time handwritten branch

Status: VERIFIED

CHANGE TO:

```js
// [1308  -  handwritten manuscript addition] TK=.25:GOTO 1316  - 
// accelerated mode sets TK, then skips the REAL assignment at [1309].
```

### [1445], [6696] and [6732] remembered display values

Status: VERIFIED

CHANGE TO:

```js
// [1445] Initial GOSUB 6600/GOSUB 6700 leave AY=AD=0 at [6696]
// and LA=VA=13 at [6732]. Set the same remembered values here so the
// first live loop does not redraw unchanged depth and air displays.
```

### [1466–1605] generalise initial-pass event-loop comments

Status: VERIFIED

REPLACE the initial-value-specific comments with:

```js
// [1466] IF ES(EP,1)=1 THEN 1471  -  do not advance CL while
// processing an activity-end event.
if (BASIC_ES[BASIC_EP][1] !== 1) {
  // [1467] CL=CL+TK  -  advance the simulation clock.
  BASIC_CL = BASIC_CL + BASIC_TK;

  // [1468–1470] When TK<>1, snap fractions close to zero or one
  // to an integer, limiting accumulated floating-point drift.
  if (BASIC_TK !== 1) {
    if (BASIC_CL - Math.floor(BASIC_CL) >= 0.999) BASIC_CL = Math.floor(BASIC_CL) + 1;
    if (BASIC_CL - Math.floor(BASIC_CL) <= 0.001) BASIC_CL = Math.floor(BASIC_CL);
  }
}

// [1471] IF CL<ES(EP,2) THEN 3000  -  enter event dispatch only
// when CL reaches the event time ES(EP,2).
if (!(BASIC_CL < BASIC_ES[BASIC_EP][2])) {

  // [1476] EP=EP+1  -  advance to the event being dispatched.
  BASIC_EP = BASIC_EP + 1;

  // [1605] IF ES(EP,1)=1 THEN 1800  -  type 1 enters activity-end
  // handling; type 0 continues with activity-start handling.
```

These comments now describe every loop pass rather than only the initial
ES(0,*) values.

---

## Proposed batch  -  review paused after [6310] renderer investigation

### [1694] repeated GOSUB 6950 call

Status: VERIFIED

CHANGE:

```js
// GOSUB 6950 called again immediately after in source
```

TO:

```js
// [1694] The second GOSUB 6950 repeats the STOP 10/STOP 5 display
// after GOSUB 6850.
```

### [1685] ASCEND GOTO 1730

Status: VERIFIED

CHANGE TO:

```js
// [1685] GOTO 1730  -  leave the ASCEND block and schedule its end event.
```

### [1705] DECOMPRESS GOTO 1730

Status: VERIFIED

CHANGE TO:

```js
// [1705] GOTO 1730  -  leave the DECOMPRESS block and schedule its end event.
```

### [8020–8090] final MEMORY writes and source uncertainty

Status: VERIFIED

CHANGE TO:

```js
// [8020–8090] Queue the final MEMORY characters, including spaces, in
// source order. [8090]'s REM ("don't know value of VA") records uncertainty
// about one value in this block.
```

### [2999–3000] REM divider and DISPLAY heading

Status: VERIFIED

CHANGE TO:

```js
// [2999] divider REM; [3000] REM DISPLAY heading  -  no executable effect.
```

### [3021] REST prompt bypass

Status: VERIFIED

CHANGE TO:

```js
// [3021] IF AL(AL,1)<>5 THEN 3025  -  REST bypasses WHICH ACTIVITY REQUIRED.
```

### [6310–6320] zero-distance ASCEND rectangle placement

Status: VERIFIED

CHANGE the comment inside the existing zero-distance ASCEND block TO:

```js
// This renderer represents [6320]'s vector as one rectangle per tick.
// For a zero-distance ASCEND, keep that approximation joined to the
// previously painted endpoint instead of advancing it to a new column.
```

This wording records why the present correction exists without implying that
JSX or SVG inherently requires it. Whether [6320] can instead be rendered
literally as vectors is now an open architectural investigation in DEF-027;
final47 remains the verified behavioural baseline meanwhile.

---

## Proposed batch  -  review paused at [1090] FRAME rendering

### [5970→1645] invalid-WORK termination latch

Status: VERIFIED

CHANGE TO:

```js
// [5970→1645] Stop further loop passes when PA=-1 would cause an
// untrapped runtime error at [1645].
const runtimeErrorRef = useRef(false);
```

### [5000–5099] BASIC input subroutines

Status: VERIFIED

CHANGE the introductory block TO:

```js
// ── GOSUB 5000 / 5060  -  BASIC input subroutines ──────────────
// [5000–5055] GOSUB 5000 displays M$, reads numeric M, then clears
// and homes the prompt line. Its live calls are handled at their input sites.
// [5060–5099] GOSUB 5060 reads an activity name and returns its A$(1..5)
// number in M, or 0 if unmatched, but has no caller in the surviving BASIC.
// The live [3034–3036] activity-name search is handled separately by
// handleActivityKey().
```

### CHR$(7) warning-bell lifecycle

Status: VERIFIED

CHANGE TO:

```js
// CHR$(7) starts a warning tone; the next INPUT or END stops it.
```

### [1278] initial warning and user-action restriction

Status: VERIFIED

CHANGE TO:

```js
// The initial [1278] warning may be inaudible until the first user action;
// later warnings can start normally.
```

### [1280] INPUT completion

Status: VERIFIED

CHANGE TO:

```js
// Completing [1280] INPUT M stops the warning bell.
```

### [5330] prompt-line cursor movement

Status: VERIFIED

CHANGE TO:

```js
// [5330] PLOT 3,80,0 moves the cursor off the prompt line;
// removing the prompt produces the same visible result here.
```

### [2080]/[5501–5509] staged WORK duration marker

Status: VERIFIED

CHANGE TO:

```js
// [2080] PA(PA,2)=-1  -  marks the staged WORK duration as not yet entered.
BASIC_PA[BASIC_PA_scalar][2] = -1;

// [5501–5509] The negative duration triggers the warning bell before
// the BOTTOM TIME prompt.
```

### [5900–5999] “SUB STRETCHES WORK” heading

Status: VERIFIED

CHANGE TO:

```js
// [5900–5999] “SUB STRETCHES WORK”  -  extends a proposed WORK period
// across the relevant DT time boundaries, adding the required staged
// activities to PA so the decompression graphic can advance with dive time.
```

### [5925–5931] first DT end marker

Status: VERIFIED

CHANGE TO:

```js
// [5925–5931] If DT reaches its 999 end marker before finding a
// boundary that includes the proposed WORK start time, execution stops.
```

### [5947]/[5970] later DT end marker

Status: VERIFIED

CHANGE TO:

```js
// [5947,5970] If the later boundary search reaches DT’s 999 end marker,
// set PA=-1 and return; unlike [5931], this path does not execute STOP.
```

### [5974] unsplit WORK interval

Status: VERIFIED

CHANGE TO:

```js
// [5974] IF J=K THEN 5998  -  if WORK starts and ends in the same
// DT interval, no split is needed; the following activity is ASCEND.
```

### [5509] BOTTOM TIME result

Status: VERIFIED

REPLACE the truncated comment with:

```js
// [5509] GOSUB 5000 reads BOTTOM TIME into M, then PA(1,2)=M
// stores it as the proposed WORK duration.
BASIC_PA[BASIC_PA_scalar][2] = BASIC_M;
```

### [5931] hard STOP result handling

Status: VERIFIED

CHANGE TO:

```js
// [5931] STOP terminates within GOSUB 5900; unlike [5970], it does
// not set PA=-1 and return. It produces no OUT OF RANGE display text.
```

### [5560–5590]/[5970→1645] PA<1 fall-through

Status: VERIFIED

CHANGE TO:

```js
// [5560  -  handwritten manuscript amendment] PA>=1 returns normally at
// [5590]. [5561]'s handwritten “error message” labels the PA<1
// fall-through but adds no executable statement.
// [5970] can return with PA=-1; continuing from that fall-through would
// cause an untrapped runtime error at [1645], so halt this invalid WORK
// before its display pass.
```

### [1892–1893]/[5501–5508] existing staged-WORK stack

Status: VERIFIED

REPLACE the truncated function-header comment with:

```js
// [1892–1893]/[5501–5508] Process the next WORK stage already queued
// in PA by GOSUB 5900.
function gosub_5500_continue_existing_stack() {
```

### [6900–6949] staged-WORK question display

Status: VERIFIED

CHANGE TO:

```js
// [6900–6949] Queue `T`, the flashing requirement, `>`, and the
// flashing next-bound value in source order.
```

### INPUT completion warning-bell handling

Status: VERIFIED

CHANGE TO:

```js
// Completing INPUT stops the warning bell. If the following branch
// executes another CHR$(7), bell() starts it again.
stopBell();
```

### [5506]/[5509] rejected staged-WORK continuation

Status: VERIFIED

REPLACE the two truncated comments with:

```js
// [5506] Only the literal NO rejects the proposed WORK stage and
// branches to [5509]; any other answer accepts it.
if (BASIC_M$ === 'NO') {
  // [5509] Reset PA and sound the warning bell before requesting
  // a replacement BOTTOM TIME.
  BASIC_PA_scalar = 1;
  bell();
```

### Initial serial reveal phases

Status: VERIFIED

REPLACE the incomplete phase list with:

```js
// Initial serial reveal order:
// 1 printCells; 2 dmCells; 3 vertical scale; 4 time axis;
// 5 NOSTOP display; 6 depth digits and trend; 7 air gauge.
```

### [1278] initial warning-bell effect

Status: VERIFIED

CHANGE TO:

```js
// [1278] Sound the initial WORKING DEPTH bell immediately if audio is
// available; otherwise sound it on the first user action.
useEffect(() => {
```

### [1090] incomplete `frameVisible` comment

Status: APPLIED

DEF-028 confirmed that the completed-rectangle reveal did not preserve the
source loop's ordering. Final52 replaces it with six sections, each revealed
after its corresponding row of 79 cyan character writes:

```js
// [1090] Reveal one FRAME section after each completed [1050–1070]
// row of 79 cyan character writes.
const visibleFrameSectionCount = Math.min(
  FRAME_SECTIONS.length,
  Math.floor(visibleCount / FRAME_ROW_CELL_COUNT)
);
```

The SVG render now maps the visible prefix of `FRAME_SECTIONS`. This is a
resolution candidate pending visual verification of the startup sequence.

### [1010] initial screen clear

Status: VERIFIED

CHANGE TO:

```jsx
{/* [1010] PLOT 6,39,12  -  clear the screen to blue. */}
```

### [1090] FRAME render-site description

Status: VERIFIED

CHANGE TO:

```jsx
{/* [1090] Two adjacent Y Bar Graphs form the right boundary of the cyan display area. */}
```

---

## Proposed batch  -  final JSX comments through end of file

### [1090] FRAME render-site wording

Status: APPLIED

CHANGE TO:

```jsx
{/* [1090] Two adjacent vertical bars mark the right boundary of the cyan display area. */}
```

Final52 supersedes this static render-site wording with:

```jsx
{/* [1090] Reveal each right-boundary section after its corresponding cyan row. */}
```

### [6950] STOP display row

Status: APPLIED

CHANGE TO:

```jsx
{/* [6950] STOP10/STOP 5 shares row 4 with the depth digits (IDs 19–20), so use the same Y coordinate. */}
```

### [8020–8090] MEMORY cell rewrite

Status: APPLIED

CHANGE TO:

```jsx
{/* [8020–8090] At the end of the dive, MEMORY rewrites DM cells IDs 1–18. */}
```

### [8060–8090] MEMORY row 9 spacing

Status: APPLIED

CHANGE TO:

```js
// [8060–8090] IDs 13–18 retain their source order, but row 9 uses
// tighter spacing to keep the condensed-font characters visually grouped.
```

This is a row-specific typographic adjustment necessitated by the substitute
condensed font; it does not change the source characters or their order.

### [6300] DESCEND/WORK/ASCEND joins

Status: APPLIED

CHANGE TO:

```jsx
{/* [6300] Join adjacent plot cells at DESCEND→WORK and WORK→ASCEND transitions. */}
```

### [6300] ASCEND/DECOMPRESS/REST corner joins

Status: APPLIED

CHANGE TO:

```jsx
{/* [6300] Fill corner joins at ASCEND↔DECOMPRESS and ASCEND→REST transitions. */}
```

### [1820] END overlay

Status: APPLIED

CHANGE TO:

```jsx
{/* [1820] END  -  normal program termination after REST. */}
```

### [3032]/[5000]/[5505] activity-prompt input

Status: APPLIED

REPLACE the truncated comment with:

```jsx
{/* [3032]/[5000]/[5505] Hidden input captures responses to the active activity prompt. */}
```

### [1280] WORKING DEPTH input

Status: APPLIED

CHANGE TO:

```jsx
{/* [1280] Hidden input captures the WORKING DEPTH response. */}
```

### [1304] TIME MODE input

Status: APPLIED

CHANGE TO:

```jsx
{/* [1304] Hidden input captures the TIME MODE response in uppercase. */}
```

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

**Sequential JSX comment review completed through the end of final49.**

The remaining work is review, application and independent verification of the
PROPOSED entries above, plus the separately recorded architectural question
DEF-027 and visual verification of the DEF-028 resolution candidate.
Completion of the sequential comment pass does not by itself close either
item.

---

## Proposed final punctuation and truncation audit  -  final50

Audit rule supplied by John: a comment containing only a BASIC source line
needs no full stop. Any complete explanatory sentence, whether wholly
non-BASIC or mixed with a BASIC citation, ends with a full stop. Decorative
section dividers and terse inline data labels are not sentences and are left
unchanged.

### [6280] truncated units-digit comment

Status: APPLIED

REPLACE:

```js
// [6280, second half] ID=17:VA=D5-INT(D5/10)*10+48  -  units digit, NOT
```

WITH:

```js
// [6280, second half] ID=17:VA=D5-INT(D5/10)*10+48  -  units digit
// from D5, not I.
```

This reconstruction is source-supported: [6260] assigns `I`, but [6280]
explicitly calculates the displayed units digit from `D5`.

### [5991–5997] truncated PA-copy comment

Status: APPLIED

REPLACE:

```js
// [5991-5997] Every generated row above PA(1) is WORK again and copies
```

WITH:

```js
// [5991–5997] Every generated row above PA(1) is WORK and copies
// fields 1, 3 and 4 from PA(1); field 2 retains its staged duration.
```

### [1090] truncated `frameVisible` comment

Status: APPLIED

Resolved in the Final52 DEF-028 candidate by replacing the fragment and the
completed-rectangle gate with the source-ordered six-section reveal recorded
above. Visual verification remains outstanding.

### Mixed/explanatory sentences missing final full stops

Status: APPLIED

ADD a final full stop to the complete explanatory sentence ending at each of
these final50 line anchors; do not otherwise reword the comment:

```text
79, 92, 119, 139, 143, 144, 198, 200, 224, 229,
251, 267, 297, 336, 365–368, 393, 396–400, 410,
420, 428, 432, 436, 510, 544, 545, 548, 551, 590,
616, 623, 627, 652, 754, 803, 810, 921, 1266,
1483, 1512, 1556, 1811, 1815, 1822, 1824, 1839,
1845, 1850, 1851, 2007, 2049, 2056, 2068, 2070,
2285, 2295, 2298, 2320, 2326, 2376, 2475, 2481,
2549, 2706, 2736, 2748.
```

The same rule applies to the JSX comments ending at final50 lines:

```text
2980, 2990, 2995, 3011, 3016, 3079, 3110, 3162,
3196, 3203.
```

### Inline explanatory comments missing final full stops

Status: APPLIED

ADD a final full stop to the prose inline comments at final50 lines:

```text
1232, 1260, 1261, 1271–1280, 1283, 2135,
2289, 2290, 2292, 2426, 2554, 3304, 3315.
```

Do not add full stops to pure BASIC transcriptions such as `[6315] LM=LQ`,
`[6999] RETURN`, or to terse array/value labels such as `C(1) blue` and
`1-based; index 0 unused`.
