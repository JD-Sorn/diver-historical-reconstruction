# COMMENTS TO AMEND  -  DIVER JSX

This is the single authoritative register for JSX comment changes.

John does not need to maintain this structure. He can raise any comment, source
reference, wording or concern conversationally; SB maintains this file.

Status meanings:
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

Status: AGREED

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

Status: AGREED

CHANGE TO:

```js
// ── Runtime: plot-graphics coordinate helpers ──
```

### [7120] air gauge comment

Status: AGREED

CHANGE TO:

```js
// [7120] IF ID=22 THEN 7300 - air gauge - Plot graphics
```

### [7130] depth trend comment

Status: AGREED

CHANGE TO:

```js
// [7130] IF ID=21 THEN 7200 - Plot graphics
```

### [1273–1277] render-site heading

Status: AGREED

CHANGE TO:

```jsx
{/* [1273–1277] depth scale ticks  -  cyan, Plot graphics, appear after title */}
```

### [1346–1348] render-site heading

Status: AGREED

CHANGE TO:

```jsx
{/* [1346–1348] Time axis ticks  -  cyan, Plot graphics. */}
```

### CCI colour-map heading

Status: AGREED

CHANGE TO:

```js
// ── Runtime: Compucolor/Intecolor (CCI) colour map ──
// CCI refers to the Compucolor/Intecolor hardware family on which DIVER.BAS is believed to have originally run. The codes below (16–23) are the raw colour-attribute values used by the original PLOT commands; C(1..7) ([140]) holds a permutation of these same eight codes. Hex values are a modern SVG approximation of each code's CRT colour.
```

### [1] REM DIVER

Status: AGREED

CHANGE TO:

```js
// [1] REM DIVER  -  original BASIC program title.
```

### [100] CLEAR 20

Status: AGREED

CHANGE TO:

```js
// [100] CLEAR 20  -  reserves BASIC string space; no JSX equivalent required.
```

### BASIC array indexing note

Status: AGREED

ADD before the BASIC array definitions:

```js
// BASIC arrays are 1-based; JSX array handling follows the source indexing
// where practical. Any deliberate index translation is noted at the point of use.
```

### [1090] FRAME definition

Status: AGREED

CHANGE TO:

```js
// [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255  -  Code 2 enters Graphic Plot
// Mode; submode 246 is Y Bar Graph, Y0 Value. The sequence draws two adjacent
// vertical bars, both from Y0=YO to Y1, at plot-grid columns 158 and 159.
// "FRAME" is a JSX-only name for this constant, chosen because these bars mark
// the boundary of the title/cyan display area; it is not a BASIC term.
```

### [1090] FRAME render-site comment

Status: AGREED

CHANGE TO:

```jsx
{/* [1090] FRAME bar  -  two adjacent Y Bar Graph vertical bars (submode 246), right-edge boundary marker; see const FRAME above for full source citation and naming explanation. */}
```

### [1261], [1262], [1264] chained terminal controls

Status: AGREED

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

Status: AGREED

CHANGE TO:

```js
// ── Lines 1265–1266: title text  -  not visible in normal CCEMU execution ──
// Consistent with the terminal still being in Graphic Plot Mode.
// JSX retained for source-translation fidelity; not intended as visible output.
```

Evidence: DEF-018 records direct CCEMU execution with the title absent while the
terminal remained in Graphic Plot Mode; inserting diagnostic `PLOT 255` before
[1265] made the title and underline appear. The comment wording therefore rests
on observed execution, not inference alone.

The existing JSX which constructs the title/underline representation is retained
for now. Its possible removal from executable display/timing code is a deferred
code change, not part of this comment-only update.

### [1273–1274] depth-scale PLOT

Status: AGREED

CHANGE TO:

```js
// [1273] PLOT 2,250,0  -  Code 2 enters Graphic Plot Mode;
//        submode 250 = X Bar Graph, X0 Value; X0=0
// [1274] FOR I=140 TO 40 STEP -10  -  11 ticks (140,130,...,40)
```

### [1277] PLOT 255

Status: AGREED

CHANGE TO:

```js
// [1277] PLOT 255  -  exits Plot Mode back to text mode on the real
// terminal, where both share one stateful serial protocol; leaving Plot
// Mode active would corrupt subsequent text. JSX has no equivalent
// because SVG drawing and DOM text are structurally separate here  - 
// there's no shared mode to exit. Historical Note, not a gap.
```

### [1346] chained terminal controls

Status: AGREED

CHANGE TO:

```js
// [1346] PLOT 6,38,2,246,34  -  chained controls in one statement:
//   code 6, arg 38               → CCI byte 38: BG=blue FG=cyan
//   code 2, submode 246, arg 34  → Y Bar Graph, Y0 Value; Y0=34
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

**Sequential comment review completed through BASIC line 1273.**

Everything after BASIC 1273 remains open comment-audit scope. This is a
source-reference/comment-fidelity task, not evidence of an executable defect.
Later items already agreed (for example [1346]) do not imply that the
intervening JSX/BASIC has been sequentially reviewed.