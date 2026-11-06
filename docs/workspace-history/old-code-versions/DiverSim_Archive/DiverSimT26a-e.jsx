// DiverSim.jsx — DIVER.BAS JSX port
// Verified to: line 1789 (T17 complete); T18-T21 in progress (auto-run tick loop,
// 400ms placeholder interval — manual tick-stepper moved to DiverSim2.jsx)
// Tests: T01–T04, T06–T17 complete; T05 open; T18 in progress
// Coordinate system: CoordinateSystem.md

import { useState, useEffect, useRef } from "react";

// ── Runtime: Bedstead font — loaded via style tag; font-family 'BedsteadRegular' ──
// Variants available: BedsteadRegular, BedsteadBold, BedsteadBoldCondensed.
// DM_FONT_FAMILY selects the variant for DM content — switch to test.

// ── SVG viewport ──────────────────────────────────────────────
// W=480: 480/80 = 6px per character cell (whole number)
// H=400: 400/25 = 16px per text row (whole number)
const W = 480;
const H = 400;

// ── Runtime: coordinate helpers (Domain 2 — plot graphics) ───
// Source: CoordinateSystem.md, 8001 grid X:0-159 Y:0-191
// SVG_x = plotX * (480/159) ≈ 3.019
// SVG_y = 400 - plotY * 2.094
const plotX = x => x * (W / 159);
const plotY = y => H - y * (H / 191);

// ── Runtime: CCI colour map ───────────────────────────────────
// CCI codes to SVG hex.
// Source: Compucolor-8001-manual.pdf, Code 6 (CCI)
const CCI = {
  16: "#050505",  // black
  17: "#FF3333",  // red
  18: "#00CC00",  // green
  19: "#CCCC00",  // yellow
  20: "#0033AA",  // blue
  21: "#CC00CC",  // magenta
  22: "#00C8B8",  // cyan
  23: "#DDDDDD",  // white
};

// ── Lines 1–780: pre-screen data initialisation ───────────────

// [100] CLEAR 20 — 1979 BASIC interpreters required string space to be
// explicitly reserved upfront (here, 20 bytes) since memory wasn't
// dynamically managed; JS strings need no such reservation, so this has
// no functional JSX counterpart. Historical Note, not a gap.

// [140] DIM C(7) — colour palette indices (1-based, CCI codes)
// [150] C(1..7) = 20,23,18,22,19,17,16
const BASIC_C = [
  null,  // 1-based; index 0 unused
  20,    // C(1) blue
  23,    // C(2) white
  18,    // C(3) green
  22,    // C(4) cyan
  19,    // C(5) yellow
  17,    // C(6) red
  16,    // C(7) black
];

// [140] DIM DT(21,7) — decompression table (1-based both axes)
// [200–700] READ DT(I,J) from DATA statements
// 999 = N.T. sentinel
const BASIC_DT = [
  null,  // 1-based; index 0 unused
  [null, 232, 431, 999, 999, 999, 999, 999],
  [null, 137, 140, 159, 179, 201, 229, 270],
  [null,  96,  98, 106, 116, 125, 134, 144],
  [null,  72,  73,  81,  88,  94,  99, 105],
  [null,  57,  59,  66,  71,  76,  80,  84],
  [null,  46,  49,  55,  60,  63,  67,  70],
  [null,  38,  42,  47,  51,  55,  58, 999],
  [null,  32,  37,  41,  45,  48,  51, 999],
  [null,  27,  32,  37,  40,  43,  45, 999],
  [null,  23,  29,  33,  36,  39,  41, 999],
  [null,  20,  25,  30,  33,  35,  37, 999],
  [null,  18,  23,  27,  30,  32,  34, 999],
  [null,  16,  21,  25,  28,  30,  31, 999],
  [null,  14,  20,  23,  26,  27,  29, 999],
  [null,  12,  18,  21,  24,  26,  27, 999],
  [null,  11,  17,  20,  22,  24,  25, 999],
  [null,  10,  16,  19,  21,  22,  24, 999],
  [null,   9,  15,  18,  20,  21, 999, 999],
  [null,   8,  14,  17,  18,  20, 999, 999],
  [null,   8,  13,  16,  17, 999, 999, 999],
  [null,   7,  12,  15,  17, 999, 999, 999],
];

// [140] DIM A$(5) — activity names (1-based)
// [720–780] READ A$(J) from DATA
const BASIC_A = [
  null,       // 1-based; index 0 unused
  "DESCEND",
  "ASCEND",
  "WORK",
  "DECOMPRESS",
  "REST",
];

// ── Lines 1010–1100: screen initialisation ────────────────────

// [1010] PLOT 6,39,12,30,22,14
// CCI byte 39: BG=blue FG=white. Code 12: erase page.
// Code 30: Flag On. Code 22: cyan background (flag active).
// Code 14: A7 On (extended character set).
const BG    = CCI[20];  // blue  — set by CCI byte 39 (BG bits)
const CYAN  = CCI[22];  // cyan  — set by Code 22 (flag background)
const WHITE = CCI[23];  // white — set by CCI byte 39 (FG bits)

// [1040–1100] FOR I=0 TO 5 loop:
//   [1050] FOR J=0 TO 78: PRINT " " — 79 spaces, each printed with cyan
//          background (Domain 1, text cursor). Each space = one character
//          cell: 6px wide × 16px tall. Cursor starts at col 0 of each row.
//   [1080] Y1 = 191 - 8*I
//   [1085] YO = Y1 - 7
//   [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255
//          Two filled rectangles: plotX=158 and 159, plotY=YO to Y1.
//          CCI byte 246: BG=white FG=white (white fill). Confirmed by CCI trace.
//   [1095] PRINT — newline (advances cursor to next row)
//   [1100] NEXT I: PLOT 30,16 — sets black background colour

// Pre-compute all cell positions from the [1040] loop.
// printCells: one entry per PRINT " " (Domain 1 — text cursor, 6×16px per cell).
// frameSegs:  one entry per [1090] PLOT 2 pair (Domain 2 — plot graphics).
// These are computed once at module load; the component animates over printCells.
const printCells = [];
let BASIC_I, BASIC_J, BASIC_Y1, BASIC_YO;

// [1040]
for (BASIC_I = 0; BASIC_I <= 5; BASIC_I++) {

  // [1050]
  for (BASIC_J = 0; BASIC_J <= 78; BASIC_J++) {

    // [1060] PRINT " "
    // Each printed space fills one character cell with the current
    // background colour (cyan, set by PLOT 6,39 … 22 at line 1010).
    // Domain 1: SVG_x = col * 6, SVG_y = row * 16.
    printCells.push({
      x: BASIC_J * (W / 80),   // col = J (cursor advances left to right)
      y: BASIC_I * (H / 25),   // row = I (outer loop)
      w: W / 80,               // one character cell wide (6px)
      h: H / 25,               // one character cell tall (16px)
    });

    // [1070] NEXT J
  }

  // [1080]
  BASIC_Y1 = 191 - 8 * BASIC_I;

  // [1085]
  BASIC_YO = BASIC_Y1 - 7;

  // [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255
  // Six iterations produce a single continuous white vertical bar.
  // BASIC_Y1 and BASIC_YO computed faithfully each iteration.

  // [1095] PRINT — newline; cursor advances to col 0 of next row.
  // No SVG output.

  // [1100] NEXT I
}

// [1090] FRAME bar — single white rect, x=474, y=0, w=6, h=96.
const FRAME = {
  x: 474,   // col 79 x 6px
  y: 0,
  w: 6,     // one character cell wide
  h: 96,    // cyan/blue boundary = 6 rows x 16px
};
// [1100] PLOT 30,16 — ensures large characters active before DM print loop.
// PLOT 30,15 = small characters, PLOT 30,16 = large characters.
// Byte 16 may also set black background (CCI byte 16 = black).

// ── Lines 1210–1260: DM box ───────────────────────────────────
// [1210] FOR I=1 TO 5
// [1230]   PLOT 3,66,I*2  — cursor to col 66, row I*2 (rows 2,4,6,8,10)
// [1240]   FOR J=66 TO 78
// [1250]     PRINT " ";   — 13 black spaces, semicolon keeps cursor on same row
// [1255]   NEXT J
// [1260] NEXT I
//
// DM_X=396: col 66 x 6px. DM_Y=16: row 1 x 16px.
// DM_W=78: 13 cols x 6px. DM_H=80: 5 rows x 16px, bottom at SVG y=96.
// U10: I*2 row-skip produces solid rectangle — mechanism not yet explained.
const BLACK = CCI[16];
const MAGENTA = CCI[21];  // #CC00CC — true magenta, confirmed (was a blue placeholder test value)
const DARK  = "#080818";  // cleared bar blocks

const DM_X = 396;   // col 66 x 6px
const DM_Y = 16;    // row 1 x 16px
const DM_W = 78;    // 13 cols x 6px
const DM_H = 80;    // 5 rows x 16px

// DM internal grid — adopted from archive (DiverCompleteWorks.jsx).
// No BASIC equivalent; rendering convenience only.
const DM_COLS  = 12;
const DM_CW    = DM_W / DM_COLS;   // ~6.5px per column
const DM_CH    = DM_H / 6;         // ~13.3px per row

// ID=22 air gauge bar geometry — confirmed by LOOPTRACE6.BAS and photograph.
// Source: DiverCompleteWorks.jsx (archive). Adapted to corrected DM constants.
const BAR22_X   = DM_X + 1;
const BAR22_W   = DM_CW * 1.2;
const BAR22_BLK = 4;                // block pitch in px (block + gap)
const BAR22_H   = BAR22_BLK * 18;  // total height derived from block count    // 18 blocks total

// Depth trend bar (ID=21) — PROVISIONAL geometry, T14d/U04, this change.
// Source (lines 7200-7240) uses raw plot X varying / Y fixed (X=166-2*I,
// Y=155), the same "horizontal in raw BASIC coordinates" shape BAR22 (ID=22)
// also has — and BAR22 was ultimately confirmed VERTICAL by photograph/
// LOOPTRACE6.BAS, not horizontal. No equivalent photo confirmation exists
// yet for ID=21, so this follows BAR22's precedent as the more likely
// orientation (plus John's own working hypothesis: "possibly located on
// right hand edge of the DM"), but this is a guess, not a finding — flag
// clearly, do not treat as settled. 10 baseline blocks (not BAR22's 18),
// same 4px pitch for visual consistency, positioned near the DM's right
// edge, clear of both the air gauge (left) and the text rows (centre).
const TREND_X       = DM_X + DM_W - 6 - DM_CW;  // moved one column left (was overlapping FRAME at x=474)
const TREND_BLK     = 4;
const TREND_COUNT   = 10;  // [7200] FOR I=1 TO 10 — baseline block count

// Pre-compute DM print cells: 13 spaces x 5 rows (I=1 to 5).
const dmCells = [];
let BASIC_I2, BASIC_J2;

// [1210]
for (BASIC_I2 = 1; BASIC_I2 <= 5; BASIC_I2++) {

  // [1230] PLOT 3,66,I*2 — cursor to col 66, row I*2; no SVG output

  // [1240]
  for (BASIC_J2 = 66; BASIC_J2 <= 78; BASIC_J2++) {

    // [1250] PRINT " "; — one black character cell, semicolon holds row
    // Rows rendered contiguously 1-5 (SVG y=16-80). See U10.
    dmCells.push({
      x: BASIC_J2 * (W / 80),
      y: BASIC_I2 * (H / 25),  // rows 1-5: I=1->y=16, I=5->y=80
      w: W / 80,
      h: H / 25,
    });

    // [1255] NEXT J
  }

  // [1260] NEXT I
}

// ── Lines 1261–1264: "5 METRE UNITS" vertical label ──────────
// [1261] PLOT 6,38   — CCI byte 38: BG=blue FG=cyan
// [1261] PLOT 8,2    — purpose not yet confirmed
// [1261] PLOT 14,15  — Code 14: extended character set. Byte 15 = small
//                      characters per emulator, but photograph shows normal
//                      size. Not yet reconciled.
// [1262] PLOT 27,10  — vertical mode on (repeated; reason unknown,
// [1262] PLOT 27,10    archive check pending)
// [1263] PRINT "5 METRE UNITS"; — 13 characters, vertical, cyan on blue
// [1264] PLOT 27,11  — vertical mode off / scroll mode (repeated;
// [1264] PLOT 27,11    reason unknown, archive check pending)
//
// Position: col 3, SVG x=18px.
// "5" character opposite 5m depth tick: plotY=130 -> SVG y=127.8px.
// String runs top to bottom: 13 chars x 16px = 208px.
// PLOT 27,10 vertical mode: cursor advances downward after each character
// rather than rightward. Characters are upright, not rotated.

const BASIC_VERT_STR = "5 METRE UNITS";
const VERT_X = 3 * (W / 80);   // col 3 -> SVG x=18px
const VERT_Y = 400 - 130 * (H / 191);  // plotY=130 -> SVG y~127.8px

// ── Lines 1265–1266: title text ───────────────────────────────
// [1265] PRINT                    — newline; no SVG output
// [1265] PLOT 3,29,43             — col 29, Y=43 masked to row 11
// [1265] PRINT "DIVER SIMULATION MODEL."
// [1266] PLOT 3,29,44             — col 29, Y=44 masked to row 12
// [1266] PRINT "-----------------------"
//
// Colour: cyan on blue (CCI byte 38 still active from line 1261).
// Col 29 -> SVG x=174px. Row 11 -> SVG y=176px. Row 12 -> SVG y=192px.
// Y-masking: 43 AND 0x1F = 11; 44 AND 0x1F = 12.
// Source: CoordinateSystem.md Domain 1 formula.

const BASIC_TITLE   = "DIVER SIMULATION MODEL.";
const BASIC_UNDERLINE = "-----------------------";
const TITLE_X = 29 * (W / 80);   // col 29 -> SVG x=174px
const TITLE_Y1 = 11 * (H / 25);  // row 11 -> SVG y=176px
const TITLE_Y2 = 12 * (H / 25);  // row 12 -> SVG y=192px

// Pre-compute title cells: two strings printed character by character.
// [1265] title line then [1266] underline, in sequence.
const titleCells = [];

// [1265] PRINT "DIVER SIMULATION MODEL."
Array.from(BASIC_TITLE).forEach((ch, idx) => {
  titleCells.push({
    ch,
    x: TITLE_X + idx * (W / 80),
    y: TITLE_Y1,
  });
});

// [1266] PRINT "-----------------------"
Array.from(BASIC_UNDERLINE).forEach((ch, idx) => {
  titleCells.push({
    ch,
    x: TITLE_X + idx * (W / 80),
    y: TITLE_Y2,
  });
});

// ── Lines 1273–1277: depth scale tick marks ───────────────────
// [1273] PLOT 2,250,0   — Code 2 (X Bar Graph), plotX origin=0
// [1274] FOR I=140 TO 40 STEP -10  — 11 ticks (140,130,...,40)
// [1275]   PLOT I,1     — horizontal tick at plotY=I, width=1 plot unit
// [1276] NEXT I
// [1277] PLOT 255       — end of PLOT stream
//
// Colour: uniform cyan with all axis elements.
// Each tick: col 1 (SVG x=6px), one character width. Domain 2 — no animation delay.

const BASIC_depthTicks = [];
let BASIC_I3;

// [1274]
for (BASIC_I3 = 140; BASIC_I3 >= 40; BASIC_I3 -= 10) {

  // [1275] PLOT I,1 — horizontal tick, col 1, one character wide.
  BASIC_depthTicks.push({
    x: W / 80,                                  // col 1 -> SVG x=6px
    y: plotY(BASIC_I3),
    w: W / 80,                                  // one character width = 6px
    h: plotY(BASIC_I3 - 1) - plotY(BASIC_I3),
  });

  // [1276] NEXT I
}
// [1277] PLOT 255 — exits Plot Mode back to text mode on the real
// terminal, where both share one stateful serial protocol; leaving Plot
// Mode active would corrupt subsequent text. JSX has no equivalent
// because SVG drawing and DOM text are structurally separate here —
// there's no shared mode to exit. Historical Note, not a gap.

// ── Lines 1346–1348: time axis tick marks ─────────────────────
// [1346] PLOT 6,38        — CCI byte 38: BG=blue FG=cyan
// [1346] PLOT 2,246,34    — Code 2 (X Bar Graph), plotY origin=34
// [1346] FOR I=1 TO 150 STEP XS*10  — at XS=2.0: I=1,21,41,...,141
// [1348]   PLOT I+10,35   — tick at plotX=I+10, plotY=35
// [1348] NEXT I : PLOT 255
//
// Colour: uniform cyan with all axis elements.
// Each tick: 1 plot unit wide x 1 plot unit tall. Domain 2 — no animation delay.
// Number of ticks and spacing depend on BASIC_XS (set by T08).

// T09 ticks computed at runtime (depend on BASIC_XS from T08).
// Returns array of tick rects given current BASIC_XS value.
function computeTimeTicks(BASIC_XS) {
  const ticks = [];
  let BASIC_I4;
  // [1346]
  for (BASIC_I4 = 1; BASIC_I4 <= 150; BASIC_I4 += BASIC_XS * 10) {
    // [1348] PLOT I+10,35
    ticks.push({
      x: plotX(BASIC_I4 + 10),
      y: plotY(35),
      w: plotX(1),                        // 1 plot unit wide
      h: (plotY(34) - plotY(35)) * 2,     // 2 plot units tall — photograph-driven.
      // ⚠ Provisional pending U09: if y-formula is off, apparent tick size in
      // photograph may reflect scale distortion rather than genuine 2-unit height.
      // Cannot be confirmed by ruler measurement alone. See TESTING_PLAN T09.
    });
  }
  return ticks;
}

// ── Lines 1360–1361: "TIME AT 10 MINUTE INTERVALS" label ─────
// [1360] PLOT 3,27,40  — col 27, Y=40. Y-masking (AND 0x1F) gives row 8,
//   but photograph shows label one row below time ticks (near bottom of screen).
//   Discrepancy unresolved — emulator test pending.
// [1361] PRINT "TIME AT 10 MINUTE INTERVALS";
//
// Colour: cyan on blue (CCI byte 38 still active from line 1261).
// Col 27 -> SVG x=162px. Position: one row below time ticks per photograph.
// 27 characters, printed left to right at 20ms per character.

const BASIC_TAXIS_LABEL = "TIME AT 10 MINUTE INTERVALS";
const TAXIS_LABEL_X = 27 * (W / 80);   // col 27 -> SVG x=162px
const TAXIS_LABEL_Y = 21 * (H / 25);   // row 21 -> SVG y=336px, immediately
                                        // below time ticks (plotY=35 -> 326.7px).
                                        // Domain 1 anchor; mixed-domain addition
                                        // produced incorrect gap.

const taxisCells = Array.from(BASIC_TAXIS_LABEL).map((ch, idx) => ({
  ch,
  x: TAXIS_LABEL_X + idx * (W / 80),
  y: TAXIS_LABEL_Y,
}));

// ── Lines 1362–1368: NOSTOP string in DM ─────────────────────
// [1362] CO=1, FL=0  — CO=1 selects green (CCI byte 2: BG=black FG=green)
// [1363] ID=1, VA=78 (N) : GOSUB 7000
// [1364] ID=2, VA=79 (O) : GOSUB 7000
// [1365] ID=3, VA=83 (S) : GOSUB 7000
// [1366] ID=4, VA=84 (T) : GOSUB 7000
// [1367] ID=5, VA=79 (O) : GOSUB 7000
// [1368] ID=6, VA=80 (P) : GOSUB 7000
//
// GOSUB 7000 for IDs 1-6 (line 7145): PLOT 3,68+ID,4 — col 69-74, row 4.
// CO=1 (line 7149): PLOT 6,2+FL — FL=0 so CCI byte 2: BG=black FG=green.
// PLOT VA — prints ASCII character.
// Col 69 -> SVG x=414px. Row 4 -> SVG y=64px. Green: CCI[18]=#00CC00.

const GREEN = CCI[18];

const NOSTOP_FONT = 11;  // photo-calibrated: 9 chars fit DM width from col 3

// DM-internal row-to-row spacing. Not the same as NOSTOP_FONT*2 (22, the
// character render size) — that was the initial guess for line pitch too,
// but John's direct visual read (05 July 2026) found it too wide, in two
// steps: 22 -> 19.5 -> 17.0 (this value), each a ~2.5-unit reduction, the
// second capped at "no more than that" per instruction. Photo cross-check
// (7mm char height, 1mm line-1/2 gap, 254mm screen = 400 SVG units)
// suggested tighter still (~12-13), but that conversion is approximate on
// two counts (photo measurement + fontSize-to-glyph-height ratio), so
// treated as a secondary signal throughout, not the primary one.
const DM_LINE_HEIGHT = 17.0;  // ⚠ provisional, see comment above
const NOSTOP_CHAR_W = NOSTOP_FONT * 0.62;           // ≈8.6px per character
const NOSTOP_X = DM_X + 2.5 * NOSTOP_CHAR_W;       // photo-calibrated position

const BASIC_nostopVA = [78, 79, 83, 84, 79, 80];  // ASCII: N,O,S,T,O,P
const nostopCells = [];
let BASIC_ID, BASIC_VA;

// [1363-1368]
for (let n = 0; n < 6; n++) {
  BASIC_ID = n + 1;
  BASIC_VA = BASIC_nostopVA[n];

  // [7145] PLOT 3,68+ID,4 — cursor to col 68+ID, row 4
  // [7149] PLOT 6,2 — green on black (CO=1, FL=0)
  // [7180] PLOT VA — print character
  // x spacing uses NOSTOP_FONT * 0.62 (confirmed Bedstead width multiplier)
  // rather than fixed 6px cell width, to prevent character overlap.
  nostopCells.push({
    ch: String.fromCharCode(BASIC_VA),
    x: NOSTOP_X + n * NOSTOP_CHAR_W,   // spaced by actual char width from DM col 3
    y: DM_Y + 13,                         // SVG y=29px; photo-calibrated
    fontSize: NOSTOP_FONT * 2,  // test: double height per PLOT 14 hypothesis
  });
}
// Bedstead font, 10px. Used throughout for all text rendering.
const FONT_SIZE = 10;

// DM content font — uncomment one to test against photograph.
// const DM_FONT_FAMILY = "BedsteadRegular, monospace";
// const DM_FONT_FAMILY = "BedsteadCondensed, monospace";
// const DM_FONT_FAMILY = "BedsteadExtraCondensed, monospace";
// const DM_FONT_FAMILY = "BedsteadBold, monospace";
// const DM_FONT_FAMILY = "BedsteadBoldCondensed, monospace";
// const DM_FONT_FAMILY = "BedsteadBoldSemiCondensed, monospace";
// const DM_FONT_FAMILY = "BedsteadBoldExtraCondensed, monospace";
const DM_FONT_FAMILY = "BedsteadBoldUltraCondensed, monospace";

// Vertical label font size: FONT_SIZE used in place of derived value (8.1px).
// Derived: span from 5m tick (SVG y=127.7) to 30m tick (SVG y=232.5) = 104.8px / 13 chars.
const VERT_FONT_SIZE = (400 - 80 * (H / 191)) - (400 - 130 * (H / 191));
const VERT_FONT_SIZE_PX = FONT_SIZE;

// Pre-compute one cell per character for animation.
const vertCells = Array.from(BASIC_VERT_STR).map((ch, idx) => ({
  ch,
  x: VERT_X,
  y: VERT_Y + idx * VERT_FONT_SIZE_PX,
}));

// Interval between each PRINT " " character reveal, in milliseconds.
// Not derived from hardware baud rate; chosen to make the row-by-row
// fill visually legible. Adjust freely — this has no effect on the
// correctness of the rendered output.
const PRINT_INTERVAL_MS = 3;

// ── GOSUB 7000 — Display Monitor ──────────────────────────────
// [7100] IF FL=1 THEN FL=64
// [7110] PLOT 14 — extended character set
// [7120] IF ID=22 THEN 7300 — air gauge (Domain 2, T15)
// [7130] IF ID=21 THEN 7200 — depth trend bar (Domain 2, T14)
// [7131] IF ID>=19 THEN 7250 — depth digits: PLOT 6,1+FL,3,57+ID,4
// [7135] IF ID>=13 THEN 7160 — row 3: PLOT 3,56+ID,9
// [7140] IF ID>=7  THEN 7150 — row 2: PLOT 3,62+ID,7
// [7145] else      — row 1: PLOT 3,68+ID,4
// [7170] PLOT VA — print character
// Returns { type:'text', ch, x, y, color } or { type:'rect', ... }
// or null if no output (e.g. ID=21 with VA=0).

const RED = CCI[17];

function gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO) {
  // [7100]
  if (BASIC_FL === 1) BASIC_FL = 64;

  // [7120] ID=22 — air gauge, WIRED (T20) + geometry confirmed against
  // CoordinateSystem.md (T15a, this change): BAR22_X=DM_X+1, BAR22_W=
  // DM_CW*1.2, 18 blocks at 4px pitch — all match the photo-calibrated
  // spec exactly. Colour scheme tested against CCEMU (05 July 2026):
  // block 1 dark, blocks 2-3 magenta, blocks 4-18 green up to VA.
  if (BASIC_ID === 22) return { type: 'air', va: BASIC_VA, fl: BASIC_FL };

  // [7130] ID=21 — T14d/U04, this change: WIRED. Baseline (10 blocks,
  // lines 7200-7204) draws unconditionally in source; only the overlay
  // (7210 onwards) is gated on VA!=0. Previously returned null whenever
  // VA=0, skipping the baseline too — visually equivalent in practice
  // (baseline is CCI=0, invisible against the black DM backdrop either
  // way) but not strictly faithful; corrected to match source exactly.
  if (BASIC_ID === 21) {
    return { type: 'trend', va: BASIC_VA, fl: BASIC_FL };
  }

  // [7131] ID>=19 — depth digits: col=57+ID, row=4
  // [7250] PLOT 6,1+FL, 3,57+ID, 4
  let BASIC_col, BASIC_row;
  if (BASIC_ID >= 19) {
    BASIC_col = 57 + BASIC_ID;
    BASIC_row = 4;
  // [7135] ID>=13 — row 3: col=56+ID, row=9 — ⚠ STUB — see LOG T14d
  } else if (BASIC_ID >= 13) {
    BASIC_col = 56 + BASIC_ID;
    BASIC_row = 9;
  // [7140] ID>=7 — row 2: col=62+ID, row=7 — ⚠ STUB — see LOG T14d
  } else if (BASIC_ID >= 7) {
    BASIC_col = 62 + BASIC_ID;
    BASIC_row = 7;
  // [7145] ID<7 — row 1: col=68+ID, row=4
  } else {
    BASIC_col = 68 + BASIC_ID;
    BASIC_row = 4;
  }

  // [7170] clamp VA
  let BASIC_VA_clamped = BASIC_VA;
  if (BASIC_VA_clamped > 95) BASIC_VA_clamped = 63;
  if (BASIC_VA_clamped < 32) BASIC_VA_clamped = 63;

  // Colour: CO=1 -> green (CCI byte 2+FL), else -> cyan/white (CCI byte 3+FL)
  // ID>=19: PLOT 6,1+FL (red on black regardless of CO)
  const color = BASIC_ID >= 19 ? RED : (BASIC_CO === 1 ? GREEN : CCI[22]);

  return {
    type:  'text',
    ch:    String.fromCharCode(BASIC_VA_clamped),
    x:     BASIC_col * (W / 80),
    y:     BASIC_row * (H / 25),
    color,
  };
}

// ── Line 1445 GOSUB 6600 — initial depth gauge ────────────────
// [6600] Called at line 1445 with AD=0, AY=-1, FL=0.
// [6601] PLOT 29 — ⚠ STUB — see LOG T14e
// [6605] IF AD=AY THEN RETURN — AD=0, AY=-1: proceed.
// [6610] ID=19, FL=0
// [6620] VA=INT(AD/10)+48 = 48 ('0')
// [6630] IF VA=48 THEN VA=32 — suppress leading zero -> space
// [6640] GOSUB 7000 — space at ID=19 (col 76, row 4), red
// [6650] ID=20
// [6660] VA=AD-INT(AD/10)*10+48 = 48 ('0')
// [6670] GOSUB 7000 — '0' at ID=20 (col 77, row 4), red
// [6680] ID=21
// [6690] VA=(AD-INT(AD))*10 = 0
// [6695] GOSUB 7000 — VA=0, no output (skipped at line 7205)
// [6696] AY=AD
//
// ⚠ T19 (confirmed, DiverSim2.jsx sandbox, 03 July 2026): the transcription
// above applies no INT() to AD itself for the ID=19/20 (tens/units)
// formulas, only to AD/10. Fed a fractional AD (as occurs every tick under
// WD=40/DR=30/TK=0.25 — see LOG T18), this produces a non-integer VA, which
// isn't a valid character code. AD most likely carries an implicit INT type
// from its first assignment in the original BASIC (a common period-BASIC
// behaviour), making it an integer throughout — consistent with ID=21 being
// the sole carrier of the fractional part (AD-INT(AD))*10. Implemented
// accordingly: ID=19/20 use Math.floor(BASIC_AD); ID=21 uses the raw
// (fractional) BASIC_AD unchanged. Confirmed against the tick sequence
// blank+7, 15, 22, 30, 37, 40 for WD=40/DR=30/TK=0.25.
//
// ID=21 ("depth trend bar") is computed correctly here but has no render
// path anywhere in this file — gosub_7000 returns {type:'trend'} for it,
// and only {type:'text'} cells are drawn. Pre-existing, not part of T19.
// See U04/T14d: needs Dagfinn's actual description before a render path
// is attempted.

function gosub_6600(BASIC_AD) {
  // SPLIT (05 July 2026): previously returned one combined "cells" array
  // mixing IDs 19-20 (Depth Gauge, T19 — text digits) with ID=21 (Depth
  // Trend, T14d/U04 — a block-graphics bar, completely different PLOT
  // technique, driven by AD's fractional part not its whole-number value).
  // Both are computed within this one GOSUB (its own REM title, "SUB DEPTH
  // GAUGE", covers all three IDs together, matching source), but they were
  // never the same thing in the BASIC, and blending them into one JS array
  // caused genuine confusion in this session's conversation. Now returns
  // both explicitly, named for what they actually are.
  const digitCells = [];
  const trendCells = [];
  let BASIC_FL = 0;
  let BASIC_VA, BASIC_ID;

  // AD treated as INT for the tens/units digits (see note above); the
  // fractional part, if any, is carried separately by ID=21 below.
  const BASIC_AD_INT = Math.floor(BASIC_AD);

  // [6610]
  BASIC_ID = 19; BASIC_FL = 0;

  // [6620]
  BASIC_VA = Math.floor(BASIC_AD_INT / 10) + 48;

  // [6630]
  if (BASIC_VA === 48) BASIC_VA = 32;

  // [6640]
  const c19 = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, 1);
  if (c19) digitCells.push(c19);

  // [6650]
  BASIC_ID = 20;

  // [6660]
  BASIC_VA = BASIC_AD_INT - Math.floor(BASIC_AD_INT / 10) * 10 + 48;

  // [6670]
  const c20 = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, 1);
  if (c20) digitCells.push(c20);

  // [6680]
  BASIC_ID = 21;

  // [6690] — uses the raw (possibly fractional) BASIC_AD, not BASIC_AD_INT
  BASIC_VA = (BASIC_AD - Math.floor(BASIC_AD)) * 10;

  // [6695]
  const c21 = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, 1);
  if (c21) trendCells.push(c21);

  return { digitCells, trendCells };
}


// ⚠ T19 (confirmed): was static AD=0 only (LOG T14b) — now recomputed
// reactively in runDiveTick() each tick. State declaration lives inside the
// component (see below), not here at module scope — useState cannot run
// outside a component body (a mistake caught and fixed in the DiverSim2.jsx
// sandbox first; not repeated here).

// ── Line 3530 GOSUB 6750 — NOSTOP time remaining / time to next bound ──
// [6750] REM SUB DISPL. NOSTOP TIME REMAIN OR REMAIN TIME TO NXT BOUND.
// Two displays sharing one subroutine, switching on whether the no-stop
// limit has been exceeded: IDs 7-12 (II=6) while time remains, IDs 13-18
// (II=12) once exceeded, showing time to the next decompression bound
// instead. Digit format: NNN:SS (minutes, cascading leading-zero
// suppression across three digits, seconds from the fractional part x60).
//
// [6752] CORRECTED 05 July 2026 (John): source reads
// "IF AD>WM THEN WM=AD" — a self-consistent running-maximum-depth
// ("Water Mark") tracker. An earlier reading this session ("IF AD>WM THEN
// WD=AD") was a transcription slip on my part, not a genuine issue in
// DIVER.bas. WM updates only on DESCEND/WORK ticks (line 6751 returns
// immediately otherwise), so it correctly freezes at the deepest point
// reached once ASCEND begins — exactly the behaviour a decompression
// calculation needs. Confirmed plausible against real-world figures:
// WM=40 gives J=16, DT[16][1]=16 minutes no-stop time at 40m (realistic);
// the uncorrected reading gave DT[1][1]=232 minutes at 40m (implausible).
// See U29, LOG.md 05 July 2026.
//
// [6763] "OUT OF RANGE" is a genuine deliberate HALT in the original
// BASIC (PRINT + STOP) if the dive profile exceeds every bound in the
// table row. No literal JS equivalent for halting a running simulation —
// implemented here as an explicit {type:'error'} cell plus an
// outOfRange flag, which the auto-run interval checks to stop ticking.
// This is a judgement call about how to represent a BASIC STOP in a live
// UI, not a pure translation — flagged for confirmation rather than
// treated as settled. Very unlikely to trigger during a simple WD=40
// DESCEND-only run (well within the table's range), so may not be
// visible in ordinary testing.
function gosub_6750() {
  // [6751]
  const BASIC_activity = BASIC_AL[BASIC_AL_scalar][1];
  if (BASIC_activity !== 1 && BASIC_activity !== 3) {
    return { cells: [], outOfRange: false };
  }

  // [6752]
  if (BASIC_AD > BASIC_WM) BASIC_WM = BASIC_AD;

  // [6753]
  const BASIC_CO = 0;

  // [6754]
  let BASIC_J = Math.floor((BASIC_WM - 7) / 2);
  if (BASIC_J < 1) BASIC_J = 1;

  // [6755]
  let BASIC_NS = BASIC_DT[BASIC_J][1] - BASIC_CL - BASIC_TK;
  const BASIC_FL = 0;
  if (BASIC_WM < 10) BASIC_NS = 0;

  // [6756]
  let BASIC_II = 6;
  let BASIC_NN = BASIC_NS;

  if (BASIC_NS < 0) {
    // [6762]
    let BASIC_boundCol = null;
    for (let I = 2; I <= 7; I++) {
      if (BASIC_DT[BASIC_J][I] !== 999 && BASIC_DT[BASIC_J][I] > BASIC_CL) {
        BASIC_boundCol = I;
        break;
      }
    }
    // [6763]
    if (BASIC_boundCol === null) {
      return { cells: [{ type: 'error', message: 'OUT OF RANGE' }], outOfRange: true };
    }
    // [6764]
    BASIC_NN = BASIC_DT[BASIC_J][BASIC_boundCol] - BASIC_CL - BASIC_TK;
    BASIC_II = 12;
  }

  const cells = [];
  const BASIC_line = BASIC_II === 6 ? 2 : 3;  // DM-internal row: 2 for IDs 7-12, 3 for IDs 13-18
  let BASIC_ID, BASIC_VA, c;

  // [6765]
  BASIC_ID = BASIC_II + 1;
  const BASIC_hundreds = Math.floor(BASIC_NN / 100);
  BASIC_VA = BASIC_hundreds + 48;
  if (BASIC_VA === 48) BASIC_VA = 32;
  // [6773]
  c = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: BASIC_line });

  BASIC_ID = BASIC_II + 2;
  // [6774]
  const BASIC_tens = Math.floor((BASIC_NN - BASIC_hundreds * 100) / 10);
  BASIC_VA = BASIC_tens + 48;
  if (BASIC_VA === 48 && BASIC_hundreds === 0) BASIC_VA = 32;
  // [6775]
  c = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: BASIC_line });

  BASIC_ID = BASIC_II + 3;
  const BASIC_units = Math.floor(BASIC_NN - BASIC_hundreds * 100 - BASIC_tens * 10);
  BASIC_VA = BASIC_units + 48;
  // [6776]
  if (BASIC_VA === 48 && BASIC_tens === 0 && BASIC_hundreds === 0) BASIC_VA = 32;
  // [6778]
  c = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: BASIC_line });

  // [6779]
  BASIC_ID = BASIC_II + 4;
  BASIC_VA = 58; // ':'
  if (BASIC_NN === 0) BASIC_VA = 32;
  // [6780]
  c = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: BASIC_line });

  // [6782]
  if (BASIC_NN === 0) {
    // [6797]
    c = gosub_7000(BASIC_II + 5, 32, BASIC_FL, BASIC_CO);
    if (c) cells.push({ ...c, line: BASIC_line });
    c = gosub_7000(BASIC_II + 6, 32, BASIC_FL, BASIC_CO);
    if (c) cells.push({ ...c, line: BASIC_line });
    return { cells, outOfRange: false };
  }

  // [6785]
  const BASIC_secs = (BASIC_NN - Math.floor(BASIC_NN)) * 60;
  BASIC_ID = BASIC_II + 5;
  BASIC_VA = Math.floor(BASIC_secs / 10) + 48;
  c = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: BASIC_line });

  // [6790]
  BASIC_ID = BASIC_II + 6;
  BASIC_VA = Math.floor(BASIC_secs - Math.floor(BASIC_secs / 10) * 10) + 48;
  c = gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: BASIC_line });

  // [6799] RETURN
  return { cells, outOfRange: false };
}

// ── Line 1445 GOSUB 6700 — initial air gauge ──────────────────
// [6700] ID=22
// [6725] VA=13-INT(CL*XS/10) — at CL=0, XS=2.0: VA=13
// [6730] IF VA<0 THEN RETURN
// [6731] IF LA=VA THEN RETURN — LA=0 initially, proceed
// [6732] LA=VA
// [6740] GOSUB 7000 — routes to line 7300 (ID=22 air gauge bar)
//
// Air gauge: 18 blocks bottom to top.
//   Block 1 (bottom): dark. Blocks 2-3: magenta (confirmed by direct CCEMU
//   observation, 05 July 2026 — photographs are ambiguous on this colour;
//   the emulator reading is treated as decisive). Blocks 4-18: green, up
//   to VA blocks filled from block 4 upward (i.e. block index 3+VA is the
//   highest green block). VA's dummy formula (line 6725) never exceeds 13,
//   so blocks 17-18 are never reached and stay permanently dark even at
//   CL=0 (full tank) — this is faithful to the source's own arithmetic,
//   not a rendering gap; the original REM at line 6710 already flags the
//   whole formula as "DUMMY RATE... FOR DISPLAY ONLY."
// Confirmed by LOOPTRACE6.BAS emulator and photograph. Source: DiverCompleteWorks.jsx.
// T15a COMPLETE (05 July 2026): wired reactively (T20), geometry checked
// against CoordinateSystem.md's confirmed BAR22 spec (exact match), colour
// scheme tested against CCEMU. See LOG.md.

function gosub_6700(BASIC_CL, BASIC_XS) {
  // [6725]
  let BASIC_VA = 13 - Math.floor(BASIC_CL * BASIC_XS / 10);

  // [6730]
  if (BASIC_VA < 0) return [];

  // [6732] LA=VA — stored externally; skip [6731] LA=VA check at init (LA=0, VA=13)

  // [6740] GOSUB 7000 — ID=22 handled as Domain 2 bar graph
  // Returns one rect per block (18 total).
  const blocks = [];
  const BAR22_BOTTOM = DM_Y + DM_H - 2;
  for (let BASIC_i = 0; BASIC_i < 18; BASIC_i++) {
    const blockFromBottom = BASIC_i + 1;
    let fill = DARK;
    if (blockFromBottom === 1)                                         fill = DARK;
    else if (blockFromBottom >= 2 && blockFromBottom <= 3)             fill = MAGENTA;
    else if (blockFromBottom > 3 && blockFromBottom - 3 <= BASIC_VA)   fill = GREEN;
    else                                                               fill = DARK;
    blocks.push({
      type: 'rect',
      x: BAR22_X,
      y: BAR22_BOTTOM - (BASIC_i + 1) * BAR22_BLK + 1,
      w: BAR22_W,
      h: BAR22_BLK - 1,  // 3px block, 1px gap
      fill,
    });
  }
  return blocks;
}

// NOTE: airGaugeCells is now reactive component state (see below) — the
// static module-level call that used to live here (gosub_6700(0, 2.0)) is
// superseded by the [3520] wiring in runDiveTick(), mirroring T19's fix
// for depthDigitCells/depthTrendCells/gosub_6600.

// ── Lines 1278–1281: working depth prompt ─────────────────────
// [1278] PRINT CHR$(7) — sounded the terminal's physical bell as an
// audible prompt cue, part of the original user experience. No JSX
// audio implemented yet — this is a deliberate gap (a modern equivalent,
// e.g. a short beep, is possible), not a case where none could exist.
// [1279] PLOT 3,0,0     — cursor home
// [1279] PRINT CHR$(7); — sounded the terminal's physical bell as an
// audible prompt cue on re-prompt, part of the original user experience.
// No JSX audio implemented yet — this is a deliberate gap (a modern
// equivalent, e.g. a short beep, is possible), not a case where none
// could exist.
// [1280] M$="WORKING DEPTH " : GOSUB 5000 : WD=M
//   GOSUB 5000: PLOT 6,48 (BG=cyan FG=black), PLOT 3,0,0,
//   PRINT M$; INPUT M, PLOT 3,0,0, PRINT "              ";
// [1281] IF WD<=0 OR WD>=50 THEN 1279  — re-prompt if invalid
//
// Prompt: "WORKING DEPTH " at col 0, row 0 (black on cyan).
// Input clears after valid entry (14 spaces overwrite prompt).
// Valid range: 0 < WD < 50. Test value: WD=40.

let BASIC_WD;   // [1280] Working depth — set by user input, validated at line 1281

// ── Lines 1300–1355: variable initialisations and time mode ───
// [1300] DR=30, AR=15, AD=0, CL=0
// [1301] WM=0, LM=0
// [1303–1308] Time mode prompt — INPUT "TIME MODE (REAL OR ACCELERATED)? "
//   Response "REAL"        -> TK=1/32
//   Response "ACCELERATED" -> TK=0.25
//   No validation loop — fall-through on invalid input (faithful to BASIC).
// [1316] IK=TK; [1317] IF IK<0.5 THEN IK=0.5
// [1320] XS=1, LA=0
// [1330] IF WD<17 THEN XS=0.5
// [1340] IF WD>20 THEN XS=2.0   (at WD=40: XS=2.0)
// [1345] YS=2
// [1349] WE=0, HT=0, D5=0, DX=0
// [1350] AY=-1
// [1355] BT=0

let BASIC_DR, BASIC_AR, BASIC_AD, BASIC_CL;
let BASIC_WM, BASIC_LM;
let BASIC_TK, BASIC_IK, BASIC_XS, BASIC_YS, BASIC_LA;
let BASIC_WE, BASIC_HT, BASIC_D5, BASIC_DX, BASIC_AY, BASIC_BT;
let BASIC_NA = 0;  // [1665 onward] next-activity code, set by the WHICH ACTIVITY prompt
let BASIC_KJ = 0;  // [5515] "assume ascent, not work" flag — set when BOTTOM TIME gets a non-positive answer

const PROMPT_TM = "TIME MODE (REAL OR ACCELERATED)? ";

// ── Lines 1370–1410: PA array ─────────────────────────────────
// [1370] DIM PA(8,5) — 1-based both axes
// [1371] PA(1,1)=1, PA(1,2)=DR, PA(1,3)=0, PA(1,4)=WD, PA(1,5)=3
// [1410] PA=1
// No screen output. Populated in handleTmKey after T08 variables set.
let BASIC_PA = [];         // [1370] DIM PA(8,5) — 1-based both axes
let BASIC_PA_scalar;       // [1410] PA scalar — separate per STYLE_GUIDE naming convention
let BASIC_ES = [];         // [1416] DIM ES(30,2) — 1-based both axes
let BASIC_ES_scalar;       // [1440] ES scalar — separate per STYLE_GUIDE naming convention
let BASIC_EP;              // [1440] EP — event pointer
let BASIC_AL = [];         // [1460] DIM AL(15,7) — 1-based both axes
let BASIC_AL_scalar;       // [1630] AL scalar — separate per STYLE_GUIDE naming convention
let BASIC_P;                // [1652] P — current activity log index
let BASIC_CK;               // [1789] CK — display loop gate flag
let BASIC_AA, BASIC_BB;     // [1465] AA=CL, BB=AD — saved clock/depth

const PROMPT_WD  = "WORKING DEPTH ";
const PROMPT_FG  = "#050505";  // black — CCI byte 48 FG

export default function DiverSim() {
  // visibleCount: how many printCells have been revealed so far.
  // Starts at 0 (blue screen only); increments by 1 per interval tick.
  const [visibleCount, setVisibleCount] = useState(0);

  // [1465 onwards] Main dive loop — auto-run tick loop for T18+ (manual
  // tick-stepper moved to DiverSim2.jsx).
  // tickCount: number of dive loop iterations executed via debug control.
  // Testing aid only — not part of historical recreation. Separate from
  // the automatic PRINT_INTERVAL_MS animation used for T01–T17.
  const [tickCount, setTickCount] = useState(0);

  // [6320] Profile line segments accumulated one per tick (GOSUB 6300 Branch 1).
  const [profileSegs, setProfileSegs] = useState([]);

  // [1445] GOSUB 6600 initial call (AD=0) seeds the print-in reveal;
  // updated reactively each tick in runDiveTick() (T19, confirmed).
  // SPLIT (05 July 2026) — see gosub_6600 comment: Depth Gauge (T19, IDs
  // 19-20, text digits) and Depth Trend (T14d/U04, ID=21, block-graphics
  // bar) are now two separate states, not one blended array.
  const [depthDigitCells, setDepthDigitCells] = useState(() => gosub_6600(0).digitCells);
  const [depthTrendCells, setDepthTrendCells] = useState(() => gosub_6600(0).trendCells);

  // [1445] GOSUB 6700 initial call (CL=0) seeds the print-in reveal;
  // updated reactively each tick in runDiveTick() (T20, this change).
  // Seeded with XS=2.0 as a safe default (matching the old static call) —
  // BASIC_XS itself isn't known until the working-depth prompt resolves,
  // same ordering issue as the original BASIC (XS depends on WD, set later).
  const [airGaugeCells, setAirGaugeCells] = useState(() => gosub_6700(0, 2.0));

  // [3530] GOSUB 6750 — NOSTOP time remaining / time to next bound (T21,
  // this change). Seeded empty, not by calling gosub_6750() directly —
  // BASIC_AL/BASIC_AL_scalar aren't populated until the first event is
  // created (line 1630 onward), so an initial call would read past the
  // end of an empty array. Matches how depthDigitCells/depthTrendCells/
  // airGaugeCells seed from a safe fixed state (AD=0 / CL=0) rather than
  // live-but-unset data.
  const [boundCells, setBoundCells] = useState({ cells: [], outOfRange: false });

  // Execute one iteration of the main dive loop (lines 1465–4000).
  // T18: lines 1465–1471, 3010, 3400–3410, GOSUB 6300 Branch 1 only.
  // GOSUB 6600 (line 3510) is T19, confirmed and wired in. GOSUB 6700/6750
  // (lines 3520-3530) are T20/T21 — not yet called.
  function runDiveTick() {
    // [1465] AA=CL, BB=AD
    BASIC_AA = BASIC_CL; BASIC_BB = BASIC_AD;

    // [1466] IF ES(EP,1)=1 THEN 1471
    if (BASIC_ES[BASIC_EP][1] !== 1) {
      // [1467] CL=CL+TK
      BASIC_CL = BASIC_CL + BASIC_TK;
      // [1468] IF TK=1 THEN 1471
      if (BASIC_TK !== 1) {
        // [1469-1470] floating point cleanup
        if (BASIC_CL - Math.floor(BASIC_CL) >= 0.999) BASIC_CL = Math.floor(BASIC_CL) + 1;
        if (BASIC_CL - Math.floor(BASIC_CL) <= 0.001) BASIC_CL = Math.floor(BASIC_CL);
      }
    }

    // [1471] IF CL<ES(EP,2) THEN 3000 — event-fire re-entry, T18a/T26c,
    // this change. Was entirely stubbed before — only the one-off setup
    // block (below, in the WD-entry handler) ever created an event, so
    // AL(AL,1) never actually changed from DESCEND(1), regardless of
    // what NA/PA held. Only fires once a PA entry is actually ready
    // (activityStep===null — no prompt still pending).
    if (activityStep === null && !(BASIC_CL < BASIC_ES[BASIC_EP][2])) {
      // [1476] EP=EP+1
      BASIC_EP = BASIC_EP + 1;
      // [1605] IF ES(EP,1)=1 THEN 1800 — not implemented (T23); assumed false
      if (BASIC_ES[BASIC_EP][1] !== 1) {
        // [1630] AL=AL+1
        BASIC_AL_scalar = BASIC_AL_scalar + 1;
        // [1640-1650] FOR I=1 TO 5: AL(AL,I)=PA(PA,I)
        for (let BASIC_I5 = 1; BASIC_I5 <= 5; BASIC_I5++) {
          BASIC_AL[BASIC_AL_scalar][BASIC_I5] = BASIC_PA[BASIC_PA_scalar][BASIC_I5];
        }
        // [1651] PA=PA-1
        BASIC_PA_scalar = BASIC_PA_scalar - 1;
        // [1652] P=AL
        BASIC_P = BASIC_AL_scalar;
        // [1660] AL(P,6)=CL
        BASIC_AL[BASIC_P][6] = BASIC_CL;

        // [1665] ON AL(P,1) GOTO 1670,1680,1690,1700,1710
        if (BASIC_AL[BASIC_P][1] === 1) {
          // [1670] DESCEND — AL(P,7)=AL(P,6)+(AL(P,4)-AL(P,3))/AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] +
            (BASIC_AL[BASIC_P][4] - BASIC_AL[BASIC_P][3]) / BASIC_AL[BASIC_P][2];
        } else if (BASIC_AL[BASIC_P][1] === 3) {
          // [1690] WORK — T26c. AL(P,7)=AL(P,6)+AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
          // [1691] BT=AL(AL,7)
          BASIC_BT = BASIC_AL[BASIC_AL_scalar][7];
          // [1692-1694] GOSUB 6100, 6950, 6850, 6950 — NOT IMPLEMENTED.
          // Deliberately left as stubs (same treatment as GOSUB 5900 in
          // T27c) — each is its own not-yet-built subroutine, not a
          // small piece of this one. This means: no decompression-bound
          // check happens yet, HT/NOSTOP-related DM content won't update
          // from this event, and the OUT OF RANGE behaviour seen in
          // earlier testing may still occur if a WORK period runs long
          // — none of that is fixed until 6100/6950/6850 exist.
          // [1695] E5=D5, EX=DX
          BASIC_E5 = BASIC_D5; BASIC_EX = BASIC_DX;
        } else if (BASIC_AL[BASIC_P][1] === 2) {
          // [1680] ASCEND — T26b, this change.
          // AL(P,7)=AL(P,6)+(AL(P,3)-AL(P,4))/AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] +
            (BASIC_AL[BASIC_P][3] - BASIC_AL[BASIC_P][4]) / BASIC_AL[BASIC_P][2];
          // [1682] VA=32:FOR ID=13 TO 18:GOSUB 7000:NEXT ID — on the real
          // hardware this blanked the DM's decompression-stop-time field
          // (IDs 13-18) to spaces the moment ascent began, since that
          // display no longer applies once ascending. NOT IMPLEMENTED
          // here — the render side of GOSUB 7000's ID 13-18 routing
          // isn't wired to this event-creation moment yet, so the DM
          // field may show stale content briefly. Cosmetic, not blocking
          // — the event's own timing (AL(P,7) above) is correct either way.
        } else if (BASIC_AL[BASIC_P][1] === 4) {
          // [1700] DECOMPRESS — T26d, this change. AL(P,7)=AL(P,6)+AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
          // [1701] GOSUB 6250 — NOT IMPLEMENTED. Same treatment as
          // GOSUB 6100/6950/6850 above: its own not-yet-built subroutine.
          // U08 already resolved what it should display (IDs 13-18,
          // "5M"+D5+":") — only the wiring itself is missing.
        } else if (BASIC_AL[BASIC_P][1] === 5) {
          // [1710] REST — T26e, this change. AL(P,7)=AL(P,6)+AL(P,2)
          // Simplest of the five branches — no GOSUB calls at all in
          // source at this point.
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
        }
        // T26a-e all now implemented (arithmetic + explicitly-stubbed
        // GOSUB calls). Fixes the zero-boundary loop bug reported
        // 05 July 2026 — previously only DESCEND(1)/WORK(3) computed
        // AL(P,7); ASCEND/DECOMPRESS/REST events got a boundary of 0
        // (uninitialised), which is always in the past, causing the
        // WHICH ACTIVITY prompt to re-fire immediately.

        // [1730] ES(EP,2)=AL(P,7)
        BASIC_ES[BASIC_EP][2] = BASIC_AL[BASIC_P][7];
        // [1740] ES=ES+1
        BASIC_ES_scalar = BASIC_ES_scalar + 1;
        // [1765] ES(ES,1)=1, ES(ES,2)=AL(P,7)
        BASIC_ES[BASIC_ES_scalar][1] = 1;
        BASIC_ES[BASIC_ES_scalar][2] = BASIC_AL[BASIC_P][7];
        // [1789] CK=0
        BASIC_CK = 0;
      }
    }

    // [3010] IF CL<ES(EP,2)-IK THEN 3400 — skip activity prompt if not yet due.
    // T22/T26, this change, SCOPED DELIBERATELY SMALL (05 July 2026, per
    // John — a previous, much larger attempt at T26/T27 together caused
    // real problems: prompt appeared before other DM content, no evidence
    // of downstream state actually building, and the prompt was rendered
    // as an HTML modal rather than authentic SVG text). This piece is
    // ONLY the boundary detection + prompt display + input capture and
    // validation. It deliberately does NOT build PA, does NOT consume NA
    // into an event, and does NOT call createEvent() — those are later,
    // separate, individually-tested pieces once this one is confirmed
    // working in isolation.
    if (activityStep === null && BASIC_CL >= BASIC_ES[BASIC_EP][2] - BASIC_IK && BASIC_CK === 0) {
      // [3021] IF AL(AL,1)<>5 THEN 3025 — REST skips the prompt entirely
      if (BASIC_AL[BASIC_AL_scalar][1] !== 5) {
        // [3025-3031] trigger "WHICH ACTIVITY REQUIRED (...)"
        BASIC_CK = 1;
        setActivityDefault(BASIC_A[BASIC_AL[BASIC_AL_scalar][5]]);
        setActivityStep('whichActivity');
      } else {
        // [3022] CK=1: GOTO 1465 — REST: no prompt
        BASIC_CK = 1;
      }
    }
    {
      // [3400] IF AL(AL,1)<>1 AND AL(AL,1)<>2 THEN 3410
      if (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 2) {
        // [3402] IF AL(AL,1)=2 THEN 3406 — ASCEND branch
        if (BASIC_AL[BASIC_AL_scalar][1] === 2) {
          // ⚠ STUB — see LOG T18c: ASCEND branch (3406-3408) not yet implemented.
        } else {
          // [3403] IF AD+DR*TK > AL(AL,4) THEN 3405 — DESCEND branch
          if (BASIC_AD + BASIC_DR * BASIC_TK > BASIC_AL[BASIC_AL_scalar][4]) {
            // [3405] AD=AL(AL,4) — bottom reached
            BASIC_AD = BASIC_AL[BASIC_AL_scalar][4];
          } else {
            // [3404] AD=AD+DR*TK
            BASIC_AD = BASIC_AD + BASIC_DR * BASIC_TK;
          }
        }
      }

      // [3410] GOSUB 6300 — Branch 1 (descent profile line)
      // [6310] LP=INT(AA*XS)+10, LQ=INT(CL*XS)+10
      const BASIC_LP = Math.floor(BASIC_AA * BASIC_XS) + 10;
      const BASIC_LQ = Math.floor(BASIC_CL * BASIC_XS) + 10;

      // [6312] IF AL(AL,1)=3 THEN 6330 — WORK branch, not reached for DESCEND
      if (BASIC_AL[BASIC_AL_scalar][1] !== 3) {
        // [6313] MP=140-INT(BB*YS), MQ=140-INT(AD*YS)
        const BASIC_MP = 140 - Math.floor(BASIC_BB * BASIC_YS);
        const BASIC_MQ = 140 - Math.floor(BASIC_AD * BASIC_YS);

        // [6314] IF LQ<LM THEN 6599 — skip if no rightward progress
        if (BASIC_LQ >= BASIC_LM) {
          // [6315] LM=LQ
          BASIC_LM = BASIC_LQ;

          // [6316] IF AL(AL,1)=1 AND MQ>MP THEN 6599 — DESCEND: skip if going up
          // [6317] IF AL(AL,1)=2 AND MP>MQ THEN 6599 — ASCEND: skip if going down
          const skip =
            (BASIC_AL[BASIC_AL_scalar][1] === 1 && BASIC_MQ > BASIC_MP) ||
            (BASIC_AL[BASIC_AL_scalar][1] === 2 && BASIC_MP > BASIC_MQ);

          if (!skip) {
            // [6320] PLOT 6,32,29,2,253,LP,MP,242,LQ,MQ,255
            // T18 CONFIRMED RENDER — photograph match, 03 July 2026.
            // Single vertical bar per tick, height = this tick's depth change
            // (MP -> MQ). Horizontal position uses a FIXED COLUMN scheme
            // rather than BASIC_LQ directly: LQ is derived from floor(CL*XS),
            // and at exact grid-boundary CL values (e.g. CL=0.5 at XS=2.0)
            // floating-point representation caused LQ to round inconsistently
            // between neighbouring ticks — visually, tick 2 landing on tick
            // 3's column instead of tick 1's, per photograph comparison.
            // BASIC_LQ/BASIC_LM and the skip logic above are left untouched —
            // they still track the model's actual state faithfully. Only the
            // bar's SVG x position is taken from a simple tick-count column
            // index, sidestepping the float-rounding artefact: tick 1 ->
            // column 1, ticks 2 & 3 -> column 2, ticks 4 & 5 -> column 3, and
            // so on (one new column every two ticks after the first). Column
            // width = one plotX grid unit, so adjacent columns touch exactly
            // rather than gap. Confirmed against photograph for ticks 1-3;
            // superseded the two-bar (LP+LQ) staircase approach previously
            // coded here, which is no longer used.
            // Does not resolve the underlying LQ/rounding question, which
            // still needs investigating separately (affects BASIC_LQ's
            // fidelity as state, not just this render's x position).
            // CCI byte 32: BG=blue FG=black — final bar colour is black.
            // BAR_W trimmed 1px from a full plotX grid unit — full-width bars
            // rendered fractionally too wide under crispEdges pixel snapping.
            const BAR_W = plotX(1) - 1;
            const tickN = tickCount + 1;                  // 1-based tick number
            const barCol = Math.floor(tickN / 2) + 1;     // 1,2,2,3,3,4,4…
            const barGridX = 10 + barCol;                 // column 1 aligns with LQ's first grid value (11)
            const T18_DEBUG_COLOURS = false;               // set true to re-enable per-tick colour cycling while testing
            const TEST_COLOURS = ['#FF0000','#FF8800','#FFFF00','#00FF00','#00FFFF','#FF00FF'];
            const tickColour = T18_DEBUG_COLOURS ? TEST_COLOURS[tickCount % TEST_COLOURS.length] : '#000000';
            setProfileSegs(segs => [...segs, {
              x: plotX(barGridX) - BAR_W / 2,
              y: Math.min(plotY(BASIC_MP), plotY(BASIC_MQ)),
              w: BAR_W,
              h: Math.abs(plotY(BASIC_MQ) - plotY(BASIC_MP)),
              colour: tickColour,
            }]);
          }
        }
      }
    }

    // [3510] GOSUB 6600 — depth digits, now wired in (T19, confirmed)
    const depthResult = gosub_6600(BASIC_AD);
    setDepthDigitCells(depthResult.digitCells);
    setDepthTrendCells(depthResult.trendCells);
    // [3520] GOSUB 6700 — air gauge, now wired in (T20, this change)
    setAirGaugeCells(gosub_6700(BASIC_CL, BASIC_XS));
    // [3530] GOSUB 6750 — NOSTOP/time-to-bound, now wired in (T21, this change)
    const boundResult = gosub_6750();
    setBoundCells(boundResult);
    if (boundResult.outOfRange) outOfRangeRef.current = true;
    // [3530] GOSUB 6750 — ⚠ STUB — see LOG T21, not yet wired into tick loop

    // [4000] GOTO 1465 — handled by caller incrementing tickCount
    setTickCount(t => t + 1);
  }

  // [1280–1281] Working depth input state.
  // wdEntered: true once a valid WD has been accepted.
  // wdInput: current value of the HTML input element.
  // wdError: true if last entry was invalid (triggers re-prompt bell).
  const [wdEntered, setWdEntered]   = useState(false);
  const [wdInput,   setWdInput]     = useState('');
  const [wdError,   setWdError]     = useState(false);

  // [3025-3036] Activity prompt state — T22/T26, this change, deliberately
  // scoped small: this is ONLY the prompt itself (trigger, display, input
  // capture, validation). No downstream consequence yet — see the boundary
  // -check comment above for why.
  //   activityStep: null | 'whichActivity'
  //   activityDefault: the bracketed default shown, e.g. "(WORK)"
  //   activityResult: last validated answer, for visual confirmation only
  //                   (not consumed anywhere yet)
  const [activityStep,    setActivityStep]    = useState(null);
  const [activityInput,   setActivityInput]   = useState('');
  const [activityDefault, setActivityDefault] = useState('');
  const [activityResult,  setActivityResult]  = useState('');
  // [5400] PA readout — T27b, this change. Visual confirmation only,
  // showing PA(PA,2)/(4)/(5) after gosub_5400 runs. Not consumed by
  // anything downstream yet.
  const [paSnapshot, setPaSnapshot] = useState(null);

  // [1303–1308] Time mode input state.
  // tmEntered: true once time mode response accepted.
  // tmInput: current value of input element.
  const [tmEntered, setTmEntered] = useState(false);
  const [tmInput,   setTmInput]   = useState('');

  // runDiveTickRef always points at the latest runDiveTick closure, so the
  // auto-run interval below never calls a stale version (tickCount, used
  // for the fixed-column bar placement and debug colour cycling, is a
  // React state value closed over at function-definition time — a fixed
  // interval callback set up once would otherwise keep reading tickCount=0
  // forever). Sandbox file (DiverSim2.jsx) keeps the manual "Next Tick"
  // button instead — this file auto-advances once time mode is confirmed.
  const runDiveTickRef = useRef(runDiveTick);
  runDiveTickRef.current = runDiveTick;

  // [6763] OUT OF RANGE — see gosub_6750 comment above. A ref (not state)
  // since it's only read inside the interval callback, not rendered.
  const outOfRangeRef = useRef(false);

  // [1465 onward] Auto-run the dive loop once time mode is entered.
  // ⚠ Placeholder interval (400ms/tick) — rate chosen for visibility while
  // T18 is still being confirmed tick-by-tick against the photograph, not
  // derived from hardware timing.
  // Stop/pause conditions, this change (05 July 2026) — replaces the old
  // "stop once AD reaches DESCEND target" placeholder, which predated
  // T22/T27's activity-transition work and would silently halt the
  // interval the moment AD=WD, regardless of what the WHICH ACTIVITY
  // prompt was doing (this is what looked like "selecting WORK just
  // stopped everything" — two coincidentally-overlapping non-events, not
  // a single bug: the interval was always going to stop there, and WORK
  // separately does nothing yet since T27c isn't built).
  //   outOfRangeRef — genuine OUT OF RANGE halt (not yet reachable via
  //                   any implemented path, but the check is harmless)
  //   activityStep  — a prompt is awaiting an answer; PAUSED, not
  //                   stopped, so the interval can resume once it
  //                   resolves — the interval keeps running, it just
  //                   skips ticking while a prompt is up.
  useEffect(() => {
    if (!tmEntered) return;
    const interval = setInterval(() => {
      if (outOfRangeRef.current) {
        clearInterval(interval);
        return;
      }
      if (activityStep !== null) {
        return; // paused, not stopped — wait for the prompt to resolve
      }
      runDiveTickRef.current();
    }, 400);
    return () => clearInterval(interval);
  }, [tmEntered, activityStep]);

  // [1304] Accept time mode on Enter. No validation — fall-through faithful to BASIC.
  function handleTmKey(e) {
    if (e.key !== 'Enter') return;
    const BASIC_MS = tmInput.toUpperCase().trim();

    // [1300] DR=30, AR=15, AD=0, CL=0
    BASIC_DR = 30; BASIC_AR = 15; BASIC_AD = 0; BASIC_CL = 0;

    // [1301] WM=0, LM=0
    BASIC_WM = 0; BASIC_LM = 0;

    // [1307–1308]
    if (BASIC_MS === 'REAL') {
      // [1309] TK=1/32
      BASIC_TK = 1 / 32;
    } else {
      // [1308] TK=0.25 (ACCELERATED or fall-through)
      BASIC_TK = 0.25;
    }

    // [1316] IK=TK
    BASIC_IK = BASIC_TK;

    // [1317] IF IK<0.5 THEN IK=0.5
    if (BASIC_IK < 0.5) BASIC_IK = 0.5;

    // [1320] XS=1, LA=0
    BASIC_XS = 1; BASIC_LA = 0;

    // [1330] IF WD<17 THEN XS=0.5
    if (BASIC_WD < 17) BASIC_XS = 0.5;

    // [1340] IF WD>20 THEN XS=2.0
    if (BASIC_WD > 20) BASIC_XS = 2.0;

    // [1345] YS=2
    BASIC_YS = 2;

    // [1349] WE=0, HT=0, D5=0, DX=0
    BASIC_WE = 0; BASIC_HT = 0; BASIC_D5 = 0; BASIC_DX = 0;

    // [1350] AY=-1
    BASIC_AY = -1;

    // [1355] BT=0
    BASIC_BT = 0;

    // [1370] DIM PA(8,5) — initialise 1-based 2D array
    BASIC_PA = Array.from({ length: 9 }, () => new Array(6).fill(0));

    // [1371] PA(1,1..5) = 1, DR, 0, WD, 3
    BASIC_PA[1][1] = 1;          // activity type: DESCEND
    BASIC_PA[1][2] = BASIC_DR;   // descent rate
    BASIC_PA[1][3] = 0;
    BASIC_PA[1][4] = BASIC_WD;   // working depth
    BASIC_PA[1][5] = 3;

    // [1410] PA=1 — PA scalar
    BASIC_PA_scalar = 1;

    // [1416] DIM ES(30,2) — initialise 1-based 2D array
    BASIC_ES = Array.from({ length: 31 }, () => new Array(3).fill(0));

    // [1419] ES(0,1)=0, ES(0,2)=0
    BASIC_ES[0][1] = 0;
    BASIC_ES[0][2] = 0;

    // [1430] ES(1,1)=0, ES(1,2)=0
    BASIC_ES[1][1] = 0;
    BASIC_ES[1][2] = 0;

    // [1440] ES=1, EP=0
    BASIC_ES_scalar = 1;
    BASIC_EP = 0;

    // [1460] DIM AL(15,7) — 1-based both axes
    BASIC_AL = Array.from({ length: 16 }, () => new Array(8).fill(0));
    BASIC_AL_scalar = 0;

    // ── Lines 1461–1789: first event fire, DESCEND committed ──
    // [1465] AA=CL, BB=AD — save current clock and depth
    BASIC_AA = BASIC_CL; BASIC_BB = BASIC_AD;

    // [1466] IF ES(EP,1)=1 THEN 1471 — ES(0,1)=0, false, fall through
    if (BASIC_ES[BASIC_EP][1] !== 1) {
      // [1467] CL=CL+TK
      BASIC_CL = BASIC_CL + BASIC_TK;
      // [1468] IF TK=1 THEN 1471 — TK=0.25, false, continue
      if (BASIC_TK !== 1) {
        // [1469] floating point cleanup
        if (BASIC_CL - Math.floor(BASIC_CL) >= 0.999) BASIC_CL = Math.floor(BASIC_CL) + 1;
        // [1470]
        if (BASIC_CL - Math.floor(BASIC_CL) <= 0.001) BASIC_CL = Math.floor(BASIC_CL);
      }
    }

    // [1471] IF CL<ES(EP,2) THEN 3000 — ES(0,2)=0, CL=0.25: 0.25<0 false, fall through
    if (!(BASIC_CL < BASIC_ES[BASIC_EP][2])) {

      // [1476] EP=EP+1
      BASIC_EP = BASIC_EP + 1;

      // [1605] IF ES(EP,1)=1 THEN 1800 — ES(1,1)=0, false, continue
      if (BASIC_ES[BASIC_EP][1] !== 1) {

        // [1630] AL=AL+1
        BASIC_AL_scalar = BASIC_AL_scalar + 1;

        // [1640-1650] FOR I=1 TO 5: AL(AL,I)=PA(PA,I)
        for (let BASIC_I5 = 1; BASIC_I5 <= 5; BASIC_I5++) {
          BASIC_AL[BASIC_AL_scalar][BASIC_I5] = BASIC_PA[BASIC_PA_scalar][BASIC_I5];
        }

        // [1651] PA=PA-1
        BASIC_PA_scalar = BASIC_PA_scalar - 1;

        // [1652] P=AL
        BASIC_P = BASIC_AL_scalar;

        // [1660] AL(P,6)=CL
        BASIC_AL[BASIC_P][6] = BASIC_CL;

        // [1665] ON AL(P,1) GOTO 1670,1680,1690,1700,1710
        // AL(P,1)=1 (DESCEND) -> 1670
        if (BASIC_AL[BASIC_P][1] === 1) {
          // [1670] AL(P,7)=AL(P,6)+(AL(P,4)-AL(P,3))/AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] +
            (BASIC_AL[BASIC_P][4] - BASIC_AL[BASIC_P][3]) / BASIC_AL[BASIC_P][2];
          // [1675] GOTO 1730 — other branches (ASCEND/WORK/DECOMPRESS/REST)
          // not yet reached on first event; ⚠ STUB — see LOG T17a
        }

        // [1730] ES(EP,2)=AL(P,7)
        BASIC_ES[BASIC_EP][2] = BASIC_AL[BASIC_P][7];

        // [1740] ES=ES+1
        BASIC_ES_scalar = BASIC_ES_scalar + 1;

        // [1765] ES(ES,1)=1, ES(ES,2)=AL(P,7)
        BASIC_ES[BASIC_ES_scalar][1] = 1;
        BASIC_ES[BASIC_ES_scalar][2] = BASIC_AL[BASIC_P][7];

        // [1789] CK=0
        BASIC_CK = 0;

        // [1790] GOTO 3000 — display loop; no screen output from T17 itself.
      }
    }

    setTmEntered(true);
  }
  // Valid range: WD > 0 AND WD < 50 (line 1281 condition inverted).
  // [1279] CHR$(7) — bell on invalid input.
  // Approximated via Web Audio API: 1400Hz tone, 300ms.
  function bell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1400;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* audio unavailable — silent fallback */ }
  }

  function handleWdKey(e) {
    if (e.key !== 'Enter') return;
    const BASIC_M = parseFloat(wdInput);
    if (isNaN(BASIC_M) || BASIC_M <= 0 || BASIC_M >= 50) {
      // [1279] re-prompt — bell + clear input
      bell();
      setWdError(true);
      setWdInput('');
      return;
    }
    // [1280] WD=M — assign and continue
    BASIC_WD = BASIC_M;
    setWdError(false);
    setWdEntered(true);
  }

  // [5400] REM ASCEND NEXT — T27b, this change. No prompt: derives both
  // values directly from HT (the decompression-stop depth already
  // established elsewhere), matching HK's confirmed reading. Scoped
  // precondition: resets PA_scalar to 1 so there's a well-defined PA
  // entry to write into — the full skeleton-building this would normally
  // rely on (T26c's end-of-event handler, [1900-1910]) isn't built yet,
  // so this is a minimal stand-in just for testing this piece in
  // isolation, not the real mechanism.
  function gosub_5400() {
    BASIC_PA_scalar = 1;
    // [5402] PA(PA,2)=AR
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_AR;
    // [5420] PA(PA,4)=HT
    BASIC_PA[BASIC_PA_scalar][4] = BASIC_HT;
    // [5430] PA(PA,5)=5
    BASIC_PA[BASIC_PA_scalar][5] = 5;
    // [5450] IF HT<>0 THEN PA(PA,5)=4
    if (BASIC_HT !== 0) BASIC_PA[BASIC_PA_scalar][5] = 4;
    setPaSnapshot({ routine: 'gosub_5400 (ASCEND NEXT)', pa: { 2: BASIC_PA[BASIC_PA_scalar][2], 4: BASIC_PA[BASIC_PA_scalar][4], 5: BASIC_PA[BASIC_PA_scalar][5] }, inputs: { AR: BASIC_AR, HT: BASIC_HT } });
  }

  // [5600] REM DECOMPRESS NEXT — T27d, this change. No prompt: derives
  // duration from DX, or D5 if HT=5, matching HK's confirmed reading.
  // Same scoped precondition as gosub_5400 (PA_scalar reset to 1) — see
  // that function's comment. PA(4)=PA(3) will read whatever PA(3)
  // currently holds, which T23 (not yet built) is what actually
  // populates meaningfully — expect this to look uninitialised until
  // T23 exists.
  function gosub_5600() {
    BASIC_PA_scalar = 1;
    // [5610] PA(PA,2)=DX
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_DX;
    // [5615] IF HT=5 THEN PA(PA,2)=D5
    if (BASIC_HT === 5) BASIC_PA[BASIC_PA_scalar][2] = BASIC_D5;
    // [5620] PA(PA,4)=PA(PA,3)
    BASIC_PA[BASIC_PA_scalar][4] = BASIC_PA[BASIC_PA_scalar][3];
    // [5640] PA(PA,5)=2
    BASIC_PA[BASIC_PA_scalar][5] = 2;
    setPaSnapshot({ routine: 'gosub_5600 (DECOMPRESS NEXT)', pa: { 2: BASIC_PA[BASIC_PA_scalar][2], 4: BASIC_PA[BASIC_PA_scalar][4], 5: BASIC_PA[BASIC_PA_scalar][5] }, inputs: { DX: BASIC_DX, HT: BASIC_HT, D5: BASIC_D5 } });
  }

  // [5700] REM REST NEXT — T27e, this change. First of the "second
  // prompt" routines: unlike gosub_5400/5600, this one genuinely needs
  // to ask something (FOR HOW LONG) before it can finish. Split into
  // start/resume, same shape agreed for the other second-prompt pieces
  // (T27a, T27c) still to come. Same scoped PA_scalar=1 precondition as
  // gosub_5400/5600.
  function gosub_5700_start() {
    setActivityStep('forHowLong');
  }
  function gosub_5700_resume(BASIC_M) {
    BASIC_PA_scalar = 1;
    // [5715] IF M<2*TK THEN M=2*TK — a clamp, not a rejection: no
    // re-prompting loop, unlike T27a's DESCEND NEXT (still to come).
    if (BASIC_M < 2 * BASIC_TK) BASIC_M = 2 * BASIC_TK;
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_M;
    // [5720] PA(PA,4)=PA(PA,3)
    BASIC_PA[BASIC_PA_scalar][4] = BASIC_PA[BASIC_PA_scalar][3];
    // [5730] PA(PA,5)=5
    BASIC_PA[BASIC_PA_scalar][5] = 5;
    setPaSnapshot({ routine: 'gosub_5700 (REST NEXT)', pa: { 2: BASIC_PA[BASIC_PA_scalar][2], 4: BASIC_PA[BASIC_PA_scalar][4], 5: BASIC_PA[BASIC_PA_scalar][5] }, inputs: { typed: BASIC_M, TK: BASIC_TK, clampedTo: 2 * BASIC_TK } });
    setActivityStep(null);
    setActivityInput('');
  }

  // [5300] REM DESCEND NEXT — T27a, this change. First reject-and-reprompt
  // case: unlike REST's clamp, an invalid answer here does NOT get
  // corrected automatically — the same prompt fires again (source:
  // [5316] IF M<AD OR M>50 THEN 5312, looping back to re-show "TO WHAT
  // DEPTH" rather than falling through). Same scoped PA_scalar=1
  // precondition as the other NEXT routines.
  function gosub_5300_start() {
    BASIC_PA_scalar = 1;
    // [5310] PA(PA,2)=DR
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_DR;
    setActivityStep('toWhatDepth');
  }
  function gosub_5300_resume(BASIC_M) {
    // [5316] IF M<AD OR M>50 THEN 5312 — reject, re-prompt, no PA write
    if (BASIC_M < BASIC_AD || BASIC_M > 50) {
      bell();
      setActivityInput('');
      return; // stays in 'toWhatDepth' — prompt fires again
    }
    // [5317] PA(PA,4)=M
    BASIC_PA[BASIC_PA_scalar][4] = BASIC_M;
    // [5320] PA(PA,5)=3
    BASIC_PA[BASIC_PA_scalar][5] = 3;
    setPaSnapshot({
      routine: 'gosub_5300 (DESCEND NEXT)',
      pa: { 2: BASIC_PA[BASIC_PA_scalar][2], 4: BASIC_PA[BASIC_PA_scalar][4], 5: BASIC_PA[BASIC_PA_scalar][5] },
      inputs: { typed: BASIC_M, AD: BASIC_AD, validRange: `${BASIC_AD}-50` },
    });
    setActivityStep(null);
    setActivityInput('');
  }


  // [5500] REM SUB WORK NEXT — T27c, this change. Reached via the NA
  // dispatch, which always sets PA(PA,2)=-1 immediately before calling
  // this (source line 2080) — since PA(PA,2)<0 is checked first thing
  // here (5501), the "IS NEXT STAGE" prompt (5502-5508) is structurally
  // unreachable from this entry point and is not implemented; goes
  // straight to BOTTOM TIME (5509), matching what the real dispatch
  // would actually do.
  function gosub_5500_start() {
    BASIC_PA_scalar = 1;
    BASIC_PA[BASIC_PA_scalar][2] = -1; // [2080] PA(PA,2)=-1, set by the caller in source
    setActivityStep('bottomTime');
  }
  function gosub_5500_resume(BASIC_M) {
    // [5510] IF M>0 THEN 5520
    if (BASIC_M > 0) {
      // [5520] PA(PA,4)=PA(PA,3)
      BASIC_PA[BASIC_PA_scalar][4] = BASIC_PA[BASIC_PA_scalar][3];
      // [5530] PA(PA,5)=2
      BASIC_PA[BASIC_PA_scalar][5] = 2;
      // [5550] GOSUB 5900 -- work-stretching. NOT IMPLEMENTED (deliberately
      // out of scope for this piece -- this is the single riskiest piece
      // of the earlier abandoned combined attempt, and belongs in its
      // own dedicated step once this simpler path is confirmed working).
      BASIC_KJ = 0;
      setPaSnapshot({
        routine: 'gosub_5500 (WORK NEXT)',
        pa: { 2: BASIC_PA[BASIC_PA_scalar][2], 4: BASIC_PA[BASIC_PA_scalar][4], 5: BASIC_PA[BASIC_PA_scalar][5] },
        inputs: { typed: BASIC_M, KJ: BASIC_KJ, note: 'GOSUB 5900 not yet implemented' },
      });
    } else {
      // [5515] KJ=1 -- assume ascent, not work. No PA writes at all.
      BASIC_KJ = 1;
      setPaSnapshot({
        routine: 'gosub_5500 (WORK NEXT) -- non-positive answer',
        pa: { 2: BASIC_PA[BASIC_PA_scalar][2], 4: BASIC_PA[BASIC_PA_scalar][4], 5: BASIC_PA[BASIC_PA_scalar][5] },
        inputs: { typed: BASIC_M, KJ: BASIC_KJ, note: 'PA untouched -- KJ=1 set instead' },
      });
    }
    setActivityStep(null);
    setActivityInput('');
  }

  // [3032-3036, 5312-5315, 5705-5710] Activity prompts — T22/T26/T27a/
  // T27b/T27d/T27e, this change. Dispatches on activityStep:
  // 'whichActivity' parses an activity name and either runs a no-prompt
  // NEXT routine (ASCEND/DECOMPRESS), triggers a second prompt (DESCEND/
  // REST, and now WORK), or does nothing further yet. 'toWhatDepth'/
  // 'forHowLong'/'bottomTime' each parse a number and finish their
  // routine.
  function handleActivityKey(e) {
    if (e.key !== 'Enter') return;

    if (activityStep === 'forHowLong') {
      const BASIC_M = parseFloat(activityInput);
      if (isNaN(BASIC_M)) { bell(); setActivityInput(''); return; }
      gosub_5700_resume(BASIC_M);
      return;
    }
    if (activityStep === 'toWhatDepth') {
      const BASIC_M = parseFloat(activityInput);
      if (isNaN(BASIC_M)) { bell(); setActivityInput(''); return; }
      gosub_5300_resume(BASIC_M);
      return;
    }
    if (activityStep === 'bottomTime') {
      const BASIC_M = parseFloat(activityInput);
      if (isNaN(BASIC_M)) { bell(); setActivityInput(''); return; }
      gosub_5500_resume(BASIC_M);
      return;
    }

    const BASIC_M$ = activityInput.trim().toUpperCase();
    let matched = 0;
    for (let NA = 1; NA <= 5; NA++) {
      if (BASIC_A[NA] === BASIC_M$) { matched = NA; break; }
    }
    BASIC_NA = matched;
    setActivityResult(matched === 0 ? `NO MATCH (typed "${activityInput}")` : BASIC_A[matched]);
    // BUG FIX (05 July 2026, per John's report): matched===0 previously
    // fell through to clear activityStep without rebuilding PA, letting
    // event creation consume a stale/empty PA entry next tick — produced
    // a nonsense event (activity 0, boundary 0), causing the prompt to
    // re-fire immediately, looking like an infinite REST/ASCEND loop
    // with null values. Source's real behaviour here is [1895] IF NA=0
    // THEN NA=AL(AL,5) — default to the just-ended event's own default
    // activity — but that's T23 (end-of-event handler), not yet built.
    // Interim fix: re-prompt instead of proceeding, same treatment as
    // DESCEND's reject-and-reprompt case, rather than risk the loop.
    if (matched === 0) {
      bell();
      setActivityInput('');
      return; // stays in 'whichActivity' — prompt fires again
    }
    if (matched === 1) {
      gosub_5300_start();
      setActivityInput('');
      return; // stay in prompt mode — do not clear activityStep below
    } else if (matched === 2) {
      gosub_5400();
    } else if (matched === 3) {
      gosub_5500_start();
      setActivityInput('');
      return; // stay in prompt mode — do not clear activityStep below
    } else if (matched === 4) {
      gosub_5600();
    } else if (matched === 5) {
      gosub_5700_start();
      setActivityInput('');
      return; // stay in prompt mode — do not clear activityStep below
    }
    setActivityStep(null);
    setActivityInput('');
  }

  // Total animated cells across all print sequences in order of execution.
  // Phase 1: printCells      (T02, lines 1040–1100)
  // Phase 2: dmCells         (T03, lines 1210–1260)
  // Phase 3: vertCells       (T04, lines 1261–1264)
  // Phase 4: titleCells      (T05, lines 1265–1266)
  // Phase 5: taxisCells      (T10, lines 1360–1361)
  // Phase 6: nostopCells     (T11, lines 1362–1368)
  // Phase 7: depthDigitCells + depthTrendCells (T14, line 1445 GOSUB 6600 —
  //          split into Depth Gauge/T19 and Depth Trend/T14d-U04, but still
  //          one combined reveal phase since both come from one GOSUB call)
  // Phase 8: airGaugeCells   (T15, line 1445 GOSUB 6700)
  const totalCells = printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length + nostopCells.length + depthDigitCells.length + depthTrendCells.length + airGaugeCells.length;

  // Phase boundaries
  const printDone      = visibleCount >= printCells.length;
  const dmCount        = printDone ? visibleCount - printCells.length : 0;
  const dmDone         = visibleCount >= printCells.length + dmCells.length;
  const vertCount      = dmDone ? visibleCount - printCells.length - dmCells.length : 0;
  const vertDone       = visibleCount >= printCells.length + dmCells.length + vertCells.length;
  const titleCount     = vertDone ? visibleCount - printCells.length - dmCells.length - vertCells.length : 0;
  const titleDone      = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length;
  const taxisCount     = tmEntered ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length : 0;
  const taxisDone      = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length;
  const nostopCount    = taxisDone ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length - taxisCells.length : 0;
  const nostopDone      = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length + nostopCells.length;
  const depthPhaseCount = nostopDone ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length - taxisCells.length - nostopCells.length : 0;
  const depthPhaseDone  = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length + nostopCells.length + depthDigitCells.length + depthTrendCells.length;
  const airGaugeCount   = depthPhaseDone ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length - taxisCells.length - nostopCells.length - depthDigitCells.length - depthTrendCells.length : 0;

  useEffect(() => {
    if (visibleCount >= totalCells) return;
    // [1278-1281] Pause at WD prompt until valid WD entered.
    if (titleDone && !wdEntered) return;
    // [1303-1308] Pause at time mode prompt until response entered.
    if (titleDone && wdEntered && !tmEntered) return;
    const timer = setTimeout(
      () => setVisibleCount(v => v + 1),
      PRINT_INTERVAL_MS
    );
    return () => clearTimeout(timer);
  }, [visibleCount, totalCells, titleDone, wdEntered, tmEntered]);

  // FRAME bar: revealed after all printCells complete.
  // On hardware the PLOT 2 fires once per outer I iteration; rendering
  // the single combined rect at phase end is visually equivalent.
  const frameVisible = printDone;

  return (
    <div translate="no" lang="en" style={{ background: "#000", padding: 8, position: 'relative', fontVariantNumeric: 'slashed-zero' }}>
      <style>{`
        @font-face { font-family: 'BedsteadRegular'; src: url('/src/assets/fonts/bedstead.regular.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadCondensed'; src: url('/src/assets/fonts/bedstead.condensed.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadExtraCondensed'; src: url('/src/assets/fonts/bedstead.extra-condensed.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadBold'; src: url('/src/assets/fonts/bedstead.bold.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadBoldCondensed'; src: url('/src/assets/fonts/bedstead.bold-condensed.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadBoldSemiCondensed'; src: url('/src/assets/fonts/bedstead.bold-semi-condensed.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadBoldExtraCondensed'; src: url('/src/assets/fonts/bedstead.bold-extra-condensed.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @font-face { font-family: 'BedsteadBoldUltraCondensed'; src: url('/src/assets/fonts/bedstead.bold-ultra-condensed.otf') format('opentype'); font-weight: normal; font-style: normal; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block" }}
        shapeRendering="crispEdges"
      >
        {/* [1010] PLOT 6,39,12 — erase page, blue background */}
        <rect x={0} y={0} width={W} height={H} fill={BG} />

        {/* [1050–1070] PRINT " "; loop — cyan character cells revealed one per tick */}
        {printCells.slice(0, visibleCount).map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={CYAN} />
        ))}

        {/* [1090] PLOT 2 — FRAME bar, single white rect at right edge of cyan area */}
        {frameVisible && (
          <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill={WHITE} />
        )}

        {/* [1210–1260] PRINT " "; loop — black character cells revealed one per tick */}
        {dmCells.slice(0, dmCount).map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={BLACK} />
        ))}

        {/* [1263] PRINT "5 METRE UNITS"; — vertical cyan characters, one per tick */}
        {/* PLOT 27,10 vertical mode: cursor advances downward after each char, */}
        {/* not rightward. Characters are upright, not rotated. */}
        {/* PLOT 27,11 scroll mode: purpose pending archive check. */}
        {/* Font: Bedstead (SAA5050 approximation). fontSize=14px derived from */}
        {/* 5m tick (SVG y=128) to 30m tick (SVG y=311), span=183px / 13 chars. */}
        {vertCells.slice(0, vertCount).map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2}
            y={c.y + VERT_FONT_SIZE_PX / 2}
            fill={CYAN}
            fontSize={FONT_SIZE}
            fontFamily="BedsteadRegular, monospace"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.ch}
          </text>
        ))}

        {/* [1265–1266] PRINT title and underline — cyan on blue, character by character */}
        {titleCells.slice(0, titleCount).map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2}
            y={c.y + (H / 25) / 2}
            fill={CYAN}
            fontSize={FONT_SIZE}
            fontFamily="BedsteadRegular, monospace"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.ch}
          </text>
        ))}

        {/* [1273–1277] depth scale ticks — cyan, Domain 2, appear after title */}
        {/* 11 ticks at plotY=140 to 40 step -10; plotX=0-1 -> SVG x=0-3px */}
        {titleDone && BASIC_depthTicks.map((t, i) => (
          <rect key={i} x={t.x} y={t.y} width={t.w} height={t.h} fill={CYAN} />
        ))}

        {/* [1280] GOSUB 5000 — "WORKING DEPTH " prompt, black on cyan, row 0 */}
        {titleDone && !wdEntered && (
          <>
            <text
              x={2}
              y={H / 25 / 2}
              fill={PROMPT_FG}
              fontSize={FONT_SIZE}
              fontFamily="BedsteadRegular, monospace"
              dominantBaseline="central"
            >
              {PROMPT_WD}{wdInput}
            </text>
            <rect
              x={2 + (PROMPT_WD.length + wdInput.length) * FONT_SIZE * 0.62}
              y={H / 25 / 2 - FONT_SIZE / 2}
              width={FONT_SIZE * 0.62}
              height={FONT_SIZE}
              fill={PROMPT_FG}
            >
              <animate attributeName="opacity" values="1;1;0;0"
                keyTimes="0;0.5;0.5;1" dur="0.75s" repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* [3025-3031, 5312-5315, 5509, 5705-5710] Activity prompts —
            T22/T26/T27a/T27c/T27e, this change. Row 0, same position as
            WD/TM above (PLOT 3,0,0 in source) — the cyan area spans rows
            0-5 for the whole dive, not just at startup, so this reuses
            the same black-on-cyan styling rather than needing new
            colours. */}
        {tmEntered && (activityStep === 'whichActivity' || activityStep === 'forHowLong' || activityStep === 'toWhatDepth' || activityStep === 'bottomTime') && (() => {
          const msg = activityStep === 'whichActivity'
            ? `WHICH ACTIVITY REQUIRED (${activityDefault}) `
            : activityStep === 'forHowLong'
            ? `FOR HOW LONG `
            : activityStep === 'toWhatDepth'
            ? `TO WHAT DEPTH `
            : `BOTTOM TIME `;
          return (
            <>
              <text
                x={2}
                y={H / 25 / 2}
                fill={PROMPT_FG}
                fontSize={FONT_SIZE}
                fontFamily="BedsteadRegular, monospace"
                dominantBaseline="central"
              >
                {msg}{activityInput}
              </text>
              <rect
                x={2 + (msg.length + activityInput.length) * FONT_SIZE * 0.62}
                y={H / 25 / 2 - FONT_SIZE / 2}
                width={FONT_SIZE * 0.62}
                height={FONT_SIZE}
                fill={PROMPT_FG}
              >
                <animate attributeName="opacity" values="1;1;0;0"
                  keyTimes="0;0.5;0.5;1" dur="0.75s" repeatCount="indefinite" />
              </rect>
            </>
          );
        })()}

        {/* Visual confirmation only — not consumed anywhere yet (see
            handleActivityKey comment). Small text, row 2, so it doesn't
            collide with the prompt itself or any DM content. */}
        {activityResult && (
          <text x={2} y={(H / 25) * 2.5} fill={PROMPT_FG} fontSize={FONT_SIZE * 0.7}
            fontFamily="BedsteadRegular, monospace">
            LAST ANSWER: {activityResult}
          </text>
        )}

        {/* [5400/5600/5700] PA readout — T27b/T27d/T27e, this change.
            Visual confirmation only. Now shows which routine ran and the
            input variables (HT/DX/D5/AR/TK/typed value) that produced the
            PA result, since those (HT especially) aren't otherwise
            visible anywhere on screen — added per John's request, so a
            PA value can be checked against its actual inputs rather than
            asserted blind. */}
        {paSnapshot && (
          <>
            <text x={2} y={(H / 25) * 3.5} fill={PROMPT_FG} fontSize={FONT_SIZE * 0.7}
              fontFamily="BedsteadRegular, monospace">
              {paSnapshot.routine}
            </text>
            <text x={2} y={(H / 25) * 4.5} fill={PROMPT_FG} fontSize={FONT_SIZE * 0.7}
              fontFamily="BedsteadRegular, monospace">
              PA(2)={paSnapshot.pa[2]} PA(4)={paSnapshot.pa[4]} PA(5)={paSnapshot.pa[5]}
            </text>
            <text x={2} y={(H / 25) * 5.5} fill={PROMPT_FG} fontSize={FONT_SIZE * 0.7}
              fontFamily="BedsteadRegular, monospace">
              inputs: {Object.entries(paSnapshot.inputs).map(([k, v]) => `${k}=${v}`).join('  ')}
            </text>
          </>
        )}


        {/* [1304] INPUT "TIME MODE (REAL OR ACCELERATED)? " — row 0, black on cyan */}
        {/* No validation — fall-through on invalid input faithful to BASIC. */}
        {titleDone && wdEntered && !tmEntered && (
          <>
            <text
              x={2}
              y={H / 25 / 2}
              fill={PROMPT_FG}
              fontSize={FONT_SIZE}
              fontFamily="BedsteadRegular, monospace"
              dominantBaseline="central"
            >
              {PROMPT_TM}{tmInput}
            </text>
            <rect
              x={2 + (PROMPT_TM.length + tmInput.length) * FONT_SIZE * 0.62}
              y={H / 25 / 2 - FONT_SIZE / 2}
              width={FONT_SIZE * 0.62}
              height={FONT_SIZE}
              fill={PROMPT_FG}
            >
              <animate attributeName="opacity" values="1;1;0;0"
                keyTimes="0;0.5;0.5;1" dur="0.75s" repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* [1346–1348] Time axis ticks — cyan, Domain 2, appear after T08 */}
        {/* Spacing and count depend on BASIC_XS set by time mode response. */}
        {tmEntered && computeTimeTicks(BASIC_XS).map((t, i) => (
          <rect key={i} x={t.x} y={t.y} width={t.w} height={t.h} fill={CYAN} />
        ))}

        {/* [1360–1361] "TIME AT 10 MINUTE INTERVALS" — cyan on blue, char by char */}
        {taxisCells.slice(0, taxisCount).map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2}
            y={c.y + (H / 25) / 2}
            fill={CYAN}
            fontSize={FONT_SIZE}
            fontFamily="BedsteadRegular, monospace"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.ch}
          </text>
        ))}

        {/* [1362–1368] NOSTOP — green on black, cols 69-74, row 2 of DM, char by char */}
        {nostopCells.slice(0, nostopCount).map((c, i) => (
          <text
            key={i}
            x={c.x + NOSTOP_CHAR_W / 2}
            y={c.y + c.fontSize / 2}
            fill={GREEN}
            fontSize={c.fontSize}
            fontFamily={DM_FONT_FAMILY}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.ch}
          </text>
        ))}

        {/* [1445] GOSUB 6600 — Depth Gauge (T19, confirmed): IDs 19-20 text digits only. */}
        {/* Split from Depth Trend (ID=21, below) — see gosub_6600 comment. Not to be */}
        {/* confused with each other; they were always distinct in source. */}
        {/* ⚠ STUB — see LOG T14a: y hardcoded, not from gosub_7000 row mapping */}
        {/* T14c RESOLVED (LOG.md) — FL is always 0, CCI always red; not a live variable here, no further verification needed */}
        {/* Reveal animation: this array is revealed first (matches original */}
        {/* push order), depthTrendCells second — depthPhaseCount is shared */}
        {/* across both since they come from one GOSUB call. */}
        {(depthPhaseDone ? depthDigitCells : depthDigitCells.slice(0, Math.min(depthPhaseCount, depthDigitCells.length))).map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2}
            y={DM_Y + 13 + NOSTOP_FONT}
            fill={c.color}
            fontSize={NOSTOP_FONT * 2}
            fontFamily={DM_FONT_FAMILY}
            style={{ fontVariantNumeric: 'slashed-zero' }}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.ch}
          </text>
        ))}

        {/* [7200-7240] ID=21 Depth Trend bar — T14d/U04, this change: WIRED. */}
        {/* Split from Depth Gauge (IDs 19-20, above) — a completely different */}
        {/* PLOT technique (block graphics, not text), driven by AD's fractional */}
        {/* part rather than its whole-number value. */}
        {/* Baseline (10 blocks, CCI=0 -> DARK, effectively invisible against */}
        {/* the black DM backdrop) drawn unconditionally; RED overlay (CCI=1+FL) */}
        {/* fills up to VA blocks from the bottom. Orientation/position PROVISIONAL */}
        {/* — see TREND_X comment above. VA range: (AD-INT(AD))*10, so 0-9. */}
        {/* Reveal animation: revealed second, after depthDigitCells (see above) — */}
        {/* offset by depthDigitCells.length so it only appears once its own slot */}
        {/* in the shared reveal count has actually been reached. */}
        {(depthPhaseDone ? depthTrendCells : depthTrendCells.slice(0, Math.max(0, depthPhaseCount - depthDigitCells.length))).map((c, ci) => {
          const TREND_BOTTOM = DM_Y + DM_H - 2;
          const blocks = [];
          for (let i = 0; i < TREND_COUNT; i++) {
            const blockFromBottom = i + 1;
            const fill = blockFromBottom <= c.va ? RED : DARK;
            blocks.push(
              <rect
                key={`${ci}-${i}`}
                x={TREND_X}
                y={TREND_BOTTOM - blockFromBottom * TREND_BLK + 1}
                width={BAR22_W}
                height={TREND_BLK - 1}
                fill={fill}
              />
            );
          }
          return blocks;
        })}

        {/* [1445] GOSUB 6700 — air gauge bar, 18 blocks, bottom to top */}
        {/* Bar geometry photo-calibrated, with reference to prior experimental work. */}

        {/* T20 WIRED (05 July 2026) — live during descent, no longer static CL=0 */}
        {airGaugeCells.slice(0, airGaugeCount).map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
        ))}

        {/* [3530] GOSUB 6750 — NOSTOP time remaining / time to next bound (T21, this change) */}
        {/* Position: DM-internal row 2 (IDs 7-12) / row 3 (IDs 13-18), following the same */}
        {/* hardcoded-y pattern as gosub_6600 above — gosub_7000's generic row×16 formula */}
        {/* is NOT calibrated for DM-internal text (confirmed 05 July 2026, John's screenshot: */}
        {/* rendering with c.y directly placed the countdown in the ocean area, well outside */}
        {/* the DM box). Row spacing uses NOSTOP_FONT*2 (22px) to match row 1's line height — */}
        {/* ⚠ STUB — see LOG T14d: still not calibrated against a photograph, only against row 1 */}
        {boundCells.cells.map((c, i) => (
          c && c.type === 'text' ? (
            <text
              key={i}
              x={c.x + (W / 80) / 2}
              y={DM_Y + 13 + NOSTOP_FONT + (c.line - 1) * DM_LINE_HEIGHT}
              fill={c.color}
              fontSize={NOSTOP_FONT * 2}
              fontFamily={DM_FONT_FAMILY}
              style={{ fontVariantNumeric: 'slashed-zero' }}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {c.ch}
            </text>
          ) : c && c.type === 'error' ? (
            <text
              key={i}
              x={DM_X + DM_W / 2}
              y={DM_Y + DM_H + 12}
              fill={RED}
              fontSize={10}
              fontFamily={DM_FONT_FAMILY}
              textAnchor="middle"
            >
              {c.message}
            </text>
          ) : null
        ))}

        {/* [6320] GOSUB 6300 Branch 1 — descent profile, one bar per fixed time-axis column */}
        {/* CONFIRMED against photograph 03 July 2026 (ticks 1-3; see LOG T18). Final colour: black. */}
        {profileSegs.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.colour} />
        ))}

      </svg>

      {/* [3032] Activity prompt input — invisible, captures keystrokes for */}
      {/* WHICH ACTIVITY REQUIRED — T22/T26, this change, scoped small. */}
      {tmEntered && (activityStep === 'whichActivity' || activityStep === 'forHowLong' || activityStep === 'toWhatDepth' || activityStep === 'bottomTime') && (
        <input
          autoFocus
          value={activityInput}
          onChange={e => setActivityInput(e.target.value)}
          onKeyDown={handleActivityKey}
          style={{
            position: 'absolute', top: 0, left: 0,
            opacity: 0, width: '100%', height: '4%', cursor: 'none',
          }}
        />
      )}

      {/* [1280] WD input — invisible, captures keystrokes for WD prompt */}
      {titleDone && !wdEntered && (
        <input
          autoFocus
          value={wdInput}
          onChange={e => { setWdError(false); setWdInput(e.target.value); }}
          onKeyDown={handleWdKey}
          style={{
            position: 'absolute', top: 0, left: 0,
            opacity: 0, width: '100%', height: '4%', cursor: 'none',
          }}
        />
      )}

      {/* [1304] Time mode input — invisible, captures keystrokes for TM prompt */}
      {titleDone && wdEntered && !tmEntered && (
        <input
          autoFocus
          value={tmInput}
          onChange={e => setTmInput(e.target.value)}
          onKeyDown={handleTmKey}
          style={{
            position: 'absolute', top: 0, left: 0,
            opacity: 0, width: '100%', height: '4%', cursor: 'none',
          }}
        />
      )}

      {/* Dive loop auto-runs once time mode is confirmed — see useEffect above. */}
      {/* Manual tick-stepper control lives only in the DiverSim2.jsx sandbox. */}
    </div>
  );
}
