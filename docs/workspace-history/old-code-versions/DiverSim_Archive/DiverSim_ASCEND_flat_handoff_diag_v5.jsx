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
// [6100] SUB TESTS IF DECOMP BOUND WILL BE CROSSED BETWEEN LAST WORK-END &
// WHEN THIS WORK OVER-UPDATES HT, DX & D5. NEXT ASCENT FOLLOWING WORK, i.e.
// whether to rise to 5m, 10m, or straight to the surface. Called once per
// WORK-initiation (T26c's [1692], alongside 6950/6850 — all three were
// stubbed until now). Implemented 17 July 2026, after tracing an apparent
// "REST loop" back to this gap: ASCEND's own routing (already correctly
// implemented, [5450] IF HT<>0 THEN PA(PA,5)=4) can never send the diver to
// DECOMPRESS instead of REST if HT never becomes anything but its initial 0
// — which is exactly what happens while this subroutine doesn't exist.
//
// Same DT-table row-index formula as gosub_6750's WM->J mapping
// (floor((depth-7)/2)), using AL(AL,3) — the depth WORK started at — rather
// than the running-maximum WM, since this is testing a specific completed
// WORK period, not the whole dive's deepest point.
//
// [6181] "PRINT 'OUT OF RANGE':STOP" appears twice in source (999 sentinel
// hit, or either FOR-NEXT loop exhausting without an early match) — reusing
// the same halt mechanism gosub_6750 already established for its own OUT OF
// RANGE case, for consistency (same red on-page message, same interval
// stop), rather than inventing a second one.
// [7500] SUB WHEN FINISHED DECOMP. Fires whenever the just-completed
// activity was DECOMPRESS ([1888] IF AL(AL,1)=4 THEN GOSUB 7500, part of
// T23's end-of-event handler). Implemented 17 July 2026, second half of
// closing the ASCEND<->DECOMPRESS loop John reported right after GOSUB
// 6100 first went in: DECOMPRESS's own routing ([5640] PA(PA,5)=2) always
// sends the diver back to ASCEND unconditionally, and ASCEND's routing
// ([5450]) sends them back to DECOMPRESS as long as HT is still non-zero
// — nothing was ever stepping HT back down, so once set it stayed set
// forever. [7549] HT=HT-5 is that step-down (10->5->0, one stop closer to
// done each time). Functional core only — [7502]-[7545] (writing "ASCEND"
// vs blank text to the DM depending on whether HT was 10 or 5) is
// display-only and deliberately deferred, same smallest-first approach as
// the rest of today's work; it doesn't affect whether the loop closes.
// [6950] SUB DISPLAYS NEXT HT TO STOP AT WHEN ASCENDING. Called twice per
// WORK-initiation ([1693] directly, [1694] again right after GOSUB 6850) —
// both calls preserved faithfully even though the second is redundant
// (HT/DX don't change between them), per STYLE_GUIDE.md's "preserve
// execution order" — not "optimised" away. Implemented 17 July 2026, the
// first of the Dive-phase GOSUB batch (agreed with John: Dive phase to
// full confidence before MEMORY/T25, one GOSUB at a time).
//
// IDs 1-6, all row 4 (gosub_7000's ID<7 branch) — same row as the depth
// digits (IDs 19-20), different columns, so no overlap expected.
//
// Known, deliberately-not-fixed quirk (flagged to John before building,
// confirmed as source's own behaviour, not a bug to correct): DX is set
// once ([6190], GOSUB 6100) and never reset anywhere in source. A later,
// shallower WORK period that on its own wouldn't need two stops would
// still show STOP10 if DX was set earlier in the same session. Faithful
// translation preserves this as-is.
function gosub_6950() {
  // [6955] IF HT=0 THEN 6999
  if (BASIC_HT === 0) {
    return { cells: [] };
  }
  const BASIC_CO = 0, BASIC_FL = 0;
  const cells = [];
  let c;
  // [6956] "STOP" — S=83, T=84, O=79, P=80
  c = gosub_7000(1, 83, BASIC_FL, BASIC_CO); if (c) cells.push(c);
  c = gosub_7000(2, 84, BASIC_FL, BASIC_CO); if (c) cells.push(c);
  c = gosub_7000(3, 79, BASIC_FL, BASIC_CO); if (c) cells.push(c);
  c = gosub_7000(4, 80, BASIC_FL, BASIC_CO); if (c) cells.push(c);
  // [6957] IF DX<>0 THEN 6962
  if (BASIC_DX !== 0) {
    // [6962] "10" — '1'=49, '0'=48
    c = gosub_7000(5, 49, BASIC_FL, BASIC_CO); if (c) cells.push(c);
    c = gosub_7000(6, 48, BASIC_FL, BASIC_CO); if (c) cells.push(c);
  } else {
    // [6958] " 5" — space=32, '5'=53
    c = gosub_7000(5, 32, BASIC_FL, BASIC_CO); if (c) cells.push(c);
    c = gosub_7000(6, 53, BASIC_FL, BASIC_CO); if (c) cells.push(c);
  }
  // [6999] RETURN
  return { cells };
}

function gosub_7500() {
  // [7549] HT=HT-5
  BASIC_HT = BASIC_HT - 5;
}

function gosub_6100() {
  // [6125] I=INT((AL(AL,3)-7)/2)
  let BASIC_I = Math.floor((BASIC_AL[BASIC_AL_scalar][3] - 7) / 2);
  // [6127] IF I<1 THEN I=1
  if (BASIC_I < 1) BASIC_I = 1;

  // [6135]-[6155] FOR J=1 TO 7: IF DT(I,J)=999 THEN OUT OF RANGE.
  // IF WE<=DT(I,J) THEN found (break). NEXT J: exhaustion is an explicit
  // OUT OF RANGE here (source: "GOTO 6181" right after "NEXT J"), unlike
  // T24c's band search — this loop's exhaustion is NOT the meaningful
  // case STYLE_GUIDE.md's FOR-NEXT note describes; source treats it as a
  // genuine error condition.
  let BASIC_J = null;
  for (let J = 1; J <= 7; J++) {
    if (BASIC_DT[BASIC_I][J] === 999) {
      return { outOfRange: true };
    }
    if (BASIC_WE <= BASIC_DT[BASIC_I][J]) {
      BASIC_J = J;
      break;
    }
  }
  if (BASIC_J === null) {
    return { outOfRange: true };
  }

  // [6165]-[6180] FOR L=1 TO 7: IF DT(I,L)=999 THEN OUT OF RANGE.
  // IF AL(AL,7)<=DT(I,L) THEN found (break). NEXT L falls through to the
  // same OUT OF RANGE line on exhaustion (sequential, no explicit GOTO
  // needed in source since 6181 is the very next line).
  let BASIC_L = null;
  for (let L = 1; L <= 7; L++) {
    if (BASIC_DT[BASIC_I][L] === 999) {
      return { outOfRange: true };
    }
    if (BASIC_AL[BASIC_AL_scalar][7] <= BASIC_DT[BASIC_I][L]) {
      BASIC_L = L;
      break;
    }
  }
  if (BASIC_L === null) {
    return { outOfRange: true };
  }

  // HANDOFF (not a source line — see the BASIC_I6/BASIC_L2 declaration
  // above): I and L are both settled from here on, on both remaining
  // return paths below, so this is the one place to persist them for
  // GOSUB 6850. Not done on the outOfRange returns above — the original
  // STOPs on those (line 6181), so 6850 is never reached in that case
  // and there is nothing meaningful to hand off.
  BASIC_I6 = BASIC_I;
  BASIC_L2 = BASIC_L;

  // [6185] WE=AL(AL,7)
  BASIC_WE = BASIC_AL[BASIC_AL_scalar][7];
  // [6190] IF AL(AL,3)>20 AND L>1 THEN DX=5
  if (BASIC_AL[BASIC_AL_scalar][3] > 20 && BASIC_L > 1) BASIC_DX = 5;
  // [6191] IF DX<>0 THEN HT=10
  if (BASIC_DX !== 0) BASIC_HT = 10;
  // [6193] IF J=L THEN RETURN — no change since the last check.
  if (BASIC_J === BASIC_L) {
    return { outOfRange: false };
  }
  // [6194] D5=D5+(L-J)*5
  BASIC_D5 = BASIC_D5 + (BASIC_L - BASIC_J) * 5;
  // [6195] IF DX=0 THEN HT=5
  if (BASIC_DX === 0) BASIC_HT = 5;
  return { outOfRange: false };
}

// [6850] SUB INITIALISES NOSTOP/TIME TO NEXT BOUND. Called from [1694],
// WORK-initiation only (paired with GOSUB 6950, called both immediately
// before and immediately after — see gosub_6950's own header comment).
// Implemented 24 July 2026, after the I/L handoff dependency from GOSUB
// 6100 (see BASIC_I6/BASIC_L2 above) stalled this for 48+ hours — see
// TODO.md 24 July 2026 for the full trace that unblocked it.
//
// [6851] CO=0:FL=0:II=0 — II here is a LOCAL scratch column-offset (0,
// then 6, chosen at [6852]/[6881]), unrelated to the BASIC_I6/BASIC_L2
// handoff pair; do not confuse the two.
//
// Source is a two-way branch on [6852] IF AL(AL,7)>DT(I,1), sharing one
// digit-writer block ([6855]-[6861]) via GOTO 6855/6882:
//   Branch A (AL(AL,7)<=DT(I6,1)): boundary not yet reached — shows
//     "time to next bound" as NNN:SS across IDs 7-12, via the shared
//     digit-writer, then returns.
//   Branch B (AL(AL,7)>DT(I6,1)): boundary already passed — shows "T" +
//     total decompression required (D5+DX) across IDs 7-10 (its own,
//     separate write, [6872]-[6880]), THEN falls through (II=6) to reuse
//     the SAME shared digit-writer a second time, this time showing
//     time-to-bound-L2 as NNN:SS across IDs 13-18.
// Translated as one internal helper (writeBoundTime) called once or
// twice, mirroring the source's own GOTO reuse of a single block — not a
// refactor, since [6855] is the literal line both paths jump to.
//
// DELIBERATELY PRESERVED QUIRK, not corrected: [6879]/[6880] (Branch B's
// own write, IDs II+11/II+12) never reassign VA before their GOSUB 7000,
// so both cells redisplay whatever VA was last set at [6878] (":" ,58) —
// i.e. two extra colons where seconds digits might be expected, not a
// transcription gap. This only affects Branch B's own six-cell write;
// the shared digit-writer itself (used directly by Branch A, and via the
// II=6 fall-through) always computes real seconds digits per [6859]/
// [6860] as written. Flagged to John before building, per STYLE_GUIDE.md.
//
// CELL COLLISION: IDs 7-12/13-18 are the same DM cells GOSUB 6750 (T21)
// writes every tick. GOSUB 6850 fires once, at WORK-initiation, earlier
// in the same runDiveTick() pass that later reaches GOSUB 6750
// unconditionally ([1694] -> ... -> GOTO 3000 -> [3530], all within one
// call) — so without gating, 6750's same-tick write would silently
// replace 6850's before it's ever rendered. Gated at the [3530] call
// site via nostopEventCellsRef, same collision class already flagged for
// GOSUB 6950/GOSUB 6750 in SB_BRIEFING.md.
function gosub_6850() {
  const BASIC_CO = 0, BASIC_FL = 0;

  // Shared digit-writer, [6855]-[6861] in source. Writes six DM cells
  // (BASIC_II+7 .. BASIC_II+12) showing BASIC_NN (minutes, possibly
  // fractional) as "NNN:SS". BASIC_II=0 -> IDs 7-12 (DM row 2);
  // BASIC_II=6 -> IDs 13-18 (DM row 3) — same row split gosub_6750 uses.
  function writeBoundTime(BASIC_II, BASIC_NN) {
    const line = BASIC_II === 6 ? 3 : 2;
    const out = [];
    let c;

    // [6855] hundreds digit — suppressed (32, space) if zero.
    let BASIC_VA = Math.floor(BASIC_NN / 100) + 48;
    if (BASIC_VA === 48) BASIC_VA = 32;
    c = gosub_7000(BASIC_II + 7, BASIC_VA, BASIC_FL, BASIC_CO);
    if (c) out.push({ ...c, line });

    // [6856] tens digit — suppressed only if no hundreds digit shown.
    const BASIC_J = BASIC_NN - Math.floor(BASIC_NN / 100) * 100;
    BASIC_VA = Math.floor(BASIC_J / 10) + 48;
    if (BASIC_VA === 48 && BASIC_NN < 100) BASIC_VA = 32;
    c = gosub_7000(BASIC_II + 8, BASIC_VA, BASIC_FL, BASIC_CO);
    if (c) out.push({ ...c, line });

    // [6857] units digit — suppressed only if no hundreds or tens shown.
    BASIC_VA = Math.floor(BASIC_J - Math.floor(BASIC_J / 10) * 10) + 48;
    if (BASIC_VA === 48 && BASIC_NN < 10) BASIC_VA = 32;
    c = gosub_7000(BASIC_II + 9, BASIC_VA, BASIC_FL, BASIC_CO);
    if (c) out.push({ ...c, line });

    // [6858] ":" — blanked entirely if NN=0.
    BASIC_VA = 58;
    if (BASIC_NN === 0) BASIC_VA = 32;
    c = gosub_7000(BASIC_II + 10, BASIC_VA, BASIC_FL, BASIC_CO);
    if (c) out.push({ ...c, line });

    // [6859] seconds-tens digit, from the fractional part of NN * 60.
    const BASIC_J_sec = (BASIC_NN - Math.floor(BASIC_NN)) * 60;
    BASIC_VA = Math.floor(BASIC_J_sec / 10) + 48;
    if (BASIC_NN === 0) BASIC_VA = 32;
    c = gosub_7000(BASIC_II + 11, BASIC_VA, BASIC_FL, BASIC_CO);
    if (c) out.push({ ...c, line });

    // [6860] seconds-units digit.
    BASIC_VA = BASIC_J_sec - Math.floor(BASIC_J_sec / 10) * 10 + 48;
    if (BASIC_NN === 0) BASIC_VA = 32;
    c = gosub_7000(BASIC_II + 12, BASIC_VA, BASIC_FL, BASIC_CO);
    if (c) out.push({ ...c, line });

    return out;
  }

  // [6852] IF AL(AL,7)>DT(I,1) THEN 6872
  if (BASIC_AL[BASIC_AL_scalar][7] <= BASIC_DT[BASIC_I6][1]) {
    // Branch A — [6854] NN=DT(I,1)-CL: IF AD<10 THEN NN=0
    let BASIC_NN = BASIC_DT[BASIC_I6][1] - BASIC_CL;
    if (BASIC_AD < 10) BASIC_NN = 0;
    // [6855]-[6861] then [6899] RETURN
    // DIAGNOSTIC (27 July 2026) — see call site's epLogRef push, added to
    // chase the "T, no numbers, wrong colon count" report against a real
    // NUL-character (String.fromCharCode(NaN)) hypothesis for undefined
    // D5/DX. Remove once that's confirmed or ruled out.
    return {
      cells: writeBoundTime(0, BASIC_NN),
      debug: { branch: 'A', I6: BASIC_I6, L2: BASIC_L2, boundary: BASIC_AL[BASIC_AL_scalar][7], DT_I6_1: BASIC_DT[BASIC_I6][1], NN: BASIC_NN, D5: BASIC_D5, DX: BASIC_DX },
    };
  }

  // Branch B — [6872]-[6880]: "T" + total decompression (D5+DX) required,
  // its own six-cell write (own quirk — see header comment above).
  const cells = [];
  let c;

  // [6872] ID=II+7:VA=84 ('T'):GOSUB 7000
  c = gosub_7000(7, 84, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6873] J=D5+DX
  const BASIC_J = BASIC_D5 + BASIC_DX;
  // [6874] ID=II+8:VA=INT(J/10)+48: IF VA=48 THEN VA=32
  let BASIC_VA = Math.floor(BASIC_J / 10) + 48;
  if (BASIC_VA === 48) BASIC_VA = 32;
  // [6875, first half] GOSUB 7000
  c = gosub_7000(8, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });
  // [6875, second half] ID=II+9:VA=J-INT(J/10)*10+48:GOSUB 7000
  BASIC_VA = BASIC_J - Math.floor(BASIC_J / 10) * 10 + 48;
  c = gosub_7000(9, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6878] ID=II+10:VA=58:GOSUB 7000
  BASIC_VA = 58;
  c = gosub_7000(10, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });
  // [6879] ID=II+11:GOSUB 7000 — QUIRK: no VA reassignment, still 58.
  c = gosub_7000(11, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });
  // [6880] ID=II+12:GOSUB 7000 — QUIRK: no VA reassignment, still 58.
  c = gosub_7000(12, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6881] II=6:NN=DT(I,L)-CL: IF NN<0 THEN NN=0
  let BASIC_NN2 = BASIC_DT[BASIC_I6][BASIC_L2] - BASIC_CL;
  if (BASIC_NN2 < 0) BASIC_NN2 = 0;
  // [6882] GOTO 6855 — reuse the shared digit-writer for DM row 3.
  cells.push(...writeBoundTime(6, BASIC_NN2));

  // DIAGNOSTIC (27 July 2026) — see Branch A's matching comment above.
  return {
    cells,
    debug: { branch: 'B', I6: BASIC_I6, L2: BASIC_L2, boundary: BASIC_AL[BASIC_AL_scalar][7], DT_I6_1: BASIC_DT[BASIC_I6][1], J_totalDecomp: BASIC_D5 + BASIC_DX, NN2: BASIC_NN2, D5: BASIC_D5, DX: BASIC_DX },
  };
}

// [6800] SUB COUNTS DOWN TOTAL DT RQMNTS. Gated `IF AL(AL,1)=4 THEN
// GOSUB 6800` at [3540], main loop, DECOMPRESS(4) only — fires every
// tick while decompressing, live-counting down whichever of D5/DX the
// current HT step-down (GOSUB 7500, T28, confirmed) says is active right
// now. Complete, unbroken source (6804-6849), no gap — unlike the false
// alarm raised over GOSUB 6850's [6879]/[6880] during this same session
// (confirmed by John: that one really is the source's own VA-carryover
// quirk, not a transcription gap; unrelated to this routine). This is
// what John's photo evidence ("T15:38", persisting below STOP10) was
// actually showing — GOSUB 6850's Branch B only ever flashes once, at
// WORK-initiation, long before a dive reaches DECOMPRESS; GOSUB 6800 is
// the routine still live at the point the photo was taken (post-first-
// DECOMPRESS, input pending for ASCEND). Writes the SAME six DM cells
// (IDs 7-12, row 2) GOSUB 6750/6850 use — same collision class as
// before, but this one is activity-exclusive at the point of collision:
// GOSUB 6750 goes silent during DECOMPRESS via its own [6751] gate, so
// there's no same-tick arbitration needed the way GOSUB 6850 required —
// the existing "only setState when cells.length>0" pattern is enough.
// [6250] SUB DISPLAYS DECOMP RMTS TO BE SATISFIED AT THIS DEPTH. Called
// from [1701], DECOMPRESS-initiation only (fires every time a NEW
// DECOMPRESS period begins, not one-off/dive-start — see GOSUB_INDEX.md).
// Mirrors GOSUB 6850's role, on the DECOMPRESS side rather than WORK.
// Source complete, no gaps (6257-6299).
//
// [6257] IF HT<=5 THEN 6299 — the whole routine no-ops once HT has
// stepped down past 10 (GOSUB 7500, T28, confirmed), so this only ever
// displays anything during the FIRST decompression stage of a dive.
// Likely the "5M 15" seen in John's earlier photo evidence.
//
// [6260] I=D5:IF HT=10 THEN I=DX — DEAD CODE, preserved not dropped: I is
// set here but never read anywhere else in this routine ([6261]-[6285]
// all use D5 directly, not I). Translated literally per STYLE_GUIDE's
// "translate the algorithm" rule, flagged rather than silently omitted —
// same treatment as the existing U24 (GOSUB 5060) dead-code flag.
//
// Writes IDs 13-18: '5','M',' ', then D5 as two digits, then ':' — e.g.
// "5M 20:". Shares these cells with GOSUB 6850's Branch B fall-through
// and GOSUB 6750's own II=12 case — same collision class as before, but
// GOSUB 6250 fires once at DECOMPRESS-initiation and GOSUB 6850 once at
// WORK-initiation, so they shouldn't land on the same tick in practice.
//
// ADDRESSED SEPARATELY (T26b, 28 July 2026): source [1682] (ASCEND-
// initiation) blanks IDs 13-18 back to spaces the moment ascent begins —
// implemented at that call site, not here. This routine's "5M 20:" no
// longer persists into ASCEND as a result.
function gosub_6250() {
  // [6257] IF HT<=5 THEN 6299 — no-op past the first decompression stage.
  if (BASIC_HT <= 5) {
    return { cells: [] };
  }

  const BASIC_CO = 0, BASIC_FL = 0;

  // [6260] I=D5:IF HT=10 THEN I=DX — dead code, see header comment.
  let BASIC_I = BASIC_D5;
  if (BASIC_HT === 10) BASIC_I = BASIC_DX;

  const cells = [];
  let c;

  // [6261] ID=13:VA=53 ('5'):GOSUB 7000
  c = gosub_7000(13, 53, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });

  // [6265] ID=14:VA=77 ('M'):GOSUB 7000
  c = gosub_7000(14, 77, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });

  // [6270] ID=15:VA=32 (' ')
  let BASIC_VA = 32;
  // [6275, first half] GOSUB 7000 (flush 6270)
  c = gosub_7000(15, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });
  // [6275, second half] ID=16:VA=INT(D5/10)+48: IF VA=48 THEN VA=32
  BASIC_VA = Math.floor(BASIC_D5 / 10) + 48;
  if (BASIC_VA === 48) BASIC_VA = 32;

  // [6280, first half] GOSUB 7000 (flush 6275)
  c = gosub_7000(16, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });
  // [6280, second half] ID=17:VA=D5-INT(D5/10)*10+48 — units digit, NOT
  // suppressed on zero, matching every other units-digit line in the file.
  BASIC_VA = BASIC_D5 - Math.floor(BASIC_D5 / 10) * 10 + 48;

  // [6285] GOSUB 7000 (flush 6280): ID=18:VA=58 (':'):GOSUB 7000
  c = gosub_7000(17, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });
  c = gosub_7000(18, 58, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });

  // [6299] RETURN
  return { cells };
}

function gosub_6800() {
  const BASIC_CO = 0, BASIC_FL = 0;
  const cells = [];
  let c;

  // [6805] ID=7:VA=84 ('T')
  c = gosub_7000(7, 84, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6810]-[6820] IF HT=10 THEN DX=DX-TK ELSE D5=D5-TK — counts down
  // whichever stage GOSUB 7500's HT step-down (10->5->0) says is current.
  if (BASIC_HT === 10) {
    BASIC_DX = BASIC_DX - BASIC_TK;
  } else {
    BASIC_D5 = BASIC_D5 - BASIC_TK;
  }

  // [6825] I=D5+DX: ID=8: VA=INT(I/10)+48: IF VA=48 THEN VA=32
  const BASIC_I = BASIC_D5 + BASIC_DX;
  let BASIC_VA = Math.floor(BASIC_I / 10) + 48;
  if (BASIC_VA === 48) BASIC_VA = 32;
  c = gosub_7000(8, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6830] GOSUB 7000: ID=9: VA=I-INT(I/10)*10+48: GOSUB 7000
  BASIC_VA = BASIC_I - Math.floor(BASIC_I / 10) * 10 + 48;
  c = gosub_7000(9, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6835] ID=10:VA=58:GOSUB 7000
  c = gosub_7000(10, 58, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6840] ID=11:I=(I-INT(I))*60:VA=INT(I/10)+48:GOSUB 7000 — OBSERVED
  // ANOMALY: source literally reads "VA= I/ 10+ 48", with NO INT() on
  // this one line specifically, unlike every other equivalent seconds-
  // tens-digit line in the file (e.g. [6859], [6785]). Translated
  // literally, not "corrected" — VA is passed through un-floored here.
  // In practice this is very likely inconsequential: PLOT VA (and, here,
  // gosub_7000's own eventual character-code conversion) needs an
  // integer character code regardless, so a fractional VA gets truncated
  // at that point either way, same net result as if INT() were present.
  // Flagged rather than silently matched to the surrounding pattern.
  const BASIC_I_sec = (BASIC_I - Math.floor(BASIC_I)) * 60;
  BASIC_VA = BASIC_I_sec / 10 + 48;
  c = gosub_7000(11, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6845] ID=12:VA=I-INT(I/10)*10+48:GOSUB 7000
  BASIC_VA = BASIC_I_sec - Math.floor(BASIC_I_sec / 10) * 10 + 48;
  c = gosub_7000(12, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6849] RETURN
  return { cells };
}

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

  // [6754] J=INT(WM-7)/2 — the original evaluates INT(WM-7) first,
  // so J may retain a .5 fractional value. Compucolor BASIC then truncates
  // that value when J is used as an array subscript; JSX preserves J itself
  // and applies truncation only at the BASIC_DT access.
  let BASIC_J = Math.floor(BASIC_WM - 7) / 2;
  if (BASIC_J < 1) BASIC_J = 1;
  const dtRow = Math.trunc(BASIC_J);

  // [6755]
  let BASIC_NS = BASIC_DT[dtRow][1] - BASIC_CL - BASIC_TK;
  const BASIC_FL = 0;
  if (BASIC_WM < 10) BASIC_NS = 0;

  // [6756]
  let BASIC_II = 6;
  let BASIC_NN = BASIC_NS;

  if (BASIC_NS < 0) {
    // [6762]
    let BASIC_boundCol = null;
    for (let I = 2; I <= 7; I++) {
      if (BASIC_DT[dtRow][I] !== 999 && BASIC_DT[dtRow][I] > BASIC_CL) {
        BASIC_boundCol = I;
        break;
      }
    }
    // [6763]
    if (BASIC_boundCol === null) {
      return { cells: [{ type: 'error', message: 'OUT OF RANGE' }], outOfRange: true };
    }
    // [6764]
    BASIC_NN = BASIC_DT[dtRow][BASIC_boundCol] - BASIC_CL - BASIC_TK;
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
// [6851] "I&L OBTAINED FROM PREV CALL TO SUB 6100" — a genuine handoff,
// confirmed via the original author's own source comment (see TODO.md
// 24 July 2026), not a translation artefact. GOSUB 6100's own I/J/L are
// function-local (see gosub_6100 below) and settle to their final values
// before either of its return points; GOSUB 6850 needs to read whatever
// GOSUB 6100 last left behind, exactly as classic BASIC's lack of scoping
// allows the original to do. This pair exists ONLY for that one handoff —
// NOT the existing BASIC_I/BASIC_J (unrelated [1040] print-cell loop), and
// NOT the local I/L reused for unrelated purposes inside GOSUB 6250/6800/
// 6900/6300. Naming continues the file's existing BASIC_I2/BASIC_I3
// precedent for disambiguated scratch state.
let BASIC_I6, BASIC_L2;
// BUG FIX (17 July 2026): BASIC_E5/BASIC_EX were used at [1695]
// (E5=D5, EX=DX, inside the WORK branch of event creation) but never
// declared — a ReferenceError, uncaught, that aborted runDiveTick mid-
// function every tick from WORK onward. Pre-existing (T26c), only
// surfaced now because WORK never previously reached this branch (see
// the T23 PA(PA,1) fix — before that, WORK's AL entry was always
// misclassified as DESCEND, so this line was unreachable). The crash's
// knock-on effects: ES(EP,2) never got set for the WORK event (function
// aborted before reaching that line), so the event-creation check kept
// re-firing every subsequent tick without ever completing — draining
// AL_scalar past the array's allocated length, which is what produced
// the second error (TypeError reading '1' of undefined). Expect that
// one to disappear as a consequence of this fix, not as something
// separate to patch.
let BASIC_E5, BASIC_EX;
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

  // TEMPORARY: compact geometry trace for ASCEND->DECOMPRESS / ASCEND->REST
  // handoffs. Rendering is unchanged; this only records the BASIC coordinate
  // and the actual JSX geometry used by the two adjoining activities.
  const [handoffGeometryLog, setHandoffGeometryLog] = useState([]);

  // [6510]/[6525] GOSUB 6300 Branch 2 — coloured band bars, T24a-d, ported
  // from DiverSim2 sandbox 17 July 2026 after John confirmed the render
  // against photograph (column heights, boundaries, and step cadence all
  // matched, WORK period and beyond). Native per-column resolution — one
  // bar per X3, exactly one plot-unit wide, left edge at plotX(X3), no
  // centring — confirmed correct; do not reintroduce width/centring
  // without a fresh photograph comparison (see DiverSim2 sandbox history:
  // both a widened-and-centred version and a block-snapped version were
  // tried and rejected first for hiding/overwriting real column data).
  const [bandSegs, setBandSegs] = useState([]);

  // [6591] PLOT 2,253,X3,Y3,255 — diver's position dot during WORK
  // (Branch 2). Same CCI byte convention as Branch 1's profile line
  // (CONFIRMED against photograph 03 July 2026, ticks 1-3 — see LOG T18):
  // final colour black, not the yellow DiverSim2's sandbox used to keep
  // it visually distinct from the profile line while both were on screen
  // for testing. John's explicit instruction, 17 July 2026: black here.
  const [workDots, setWorkDots] = useState([]);

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
  // [6950] STOP10/STOP 5 text, WORK-initiation only. See gosub_6950's own
  // header comment. Persists until the next WORK-initiation overwrites it
  // (or clears it, once HT reaches 0) — matches source, which never blanks
  // these cells independently.
  const [stopCells, setStopCells] = useState([]);

  // Execute one iteration of the main dive loop (lines 1465–4000).
  // T18: lines 1465–1471, 3010, 3400–3410, GOSUB 6300 Branch 1 only.
  // GOSUB 6600 (line 3510) is T19, confirmed and wired in. GOSUB 6700/6750
  // (lines 3520-3530) are T20/T21 — not yet called.
  function runDiveTick() {
    if (!resumeAt3400Ref.current) {
    if (!resumeAt3000Ref.current) {
    // DIAGNOSTIC (17 July 2026) — refocused again, now on GOSUB 6100's
    // own variables (WE/HT/DX/D5), since that's the piece currently being
    // tested. PA/NA fields from the REST auto-chain piece kept too, since
    // those are still relevant to confirming ASCEND->DECOMPRESS routing
    // once HT is actually non-zero.
    // DIAGNOSTIC (17 July 2026) — refocused for REST testing. WE/HT/DX/D5
    // (GOSUB 6100/7500, DECOMPRESS routing) dropped — confirmed working,
    // not relevant here. Added PA(PA,2) to see the entered duration.
    setAlDebug({
      AL_scalar: BASIC_AL_scalar,
      AL_1: BASIC_AL[BASIC_AL_scalar] ? BASIC_AL[BASIC_AL_scalar][1] : '(no entry)',
      AL_5: BASIC_AL[BASIC_AL_scalar] ? BASIC_AL[BASIC_AL_scalar][5] : '(no entry)',
      CL: BASIC_CL.toFixed(2),
      AD: BASIC_AD.toFixed(2),
      activityStep: activityStep,
      NA: BASIC_NA,
      PA_1: BASIC_PA[BASIC_PA_scalar] ? BASIC_PA[BASIC_PA_scalar][1] : '(no entry)',
      PA_2: BASIC_PA[BASIC_PA_scalar] ? BASIC_PA[BASIC_PA_scalar][2] : '(no entry)',
      PA_5: BASIC_PA[BASIC_PA_scalar] ? BASIC_PA[BASIC_PA_scalar][5] : '(no entry)',
    });

    // [1465] AA=CL, BB=AD
    BASIC_AA = BASIC_CL; BASIC_BB = BASIC_AD;

    // [1466] IF ES(EP,1)=1 THEN 1471
    if (BASIC_ES[BASIC_EP][1] !== 1) {
      // [1467] CL=CL+TK — preserve the BASIC's discrete simulation clock.
      // CCEMU traces confirm CL is not clamped to ES(EP,2); event time is a
      // threshold which the normal TK sequence may cross between ticks.
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
    // RESTRUCTURED 17 July 2026 — was a single `if`, meaning a run of
    // several consecutive stale/reserved ES slots (which can happen when
    // a cleared reservation's OWN boundary is still stale from whatever
    // activity originally reserved it) only got resolved one slot per
    // tick, leaving CL/AL_scalar looking "frozen" for several ticks at a
    // time even though real progress was happening underneath. Now loops
    // within a single tick until EP lands on a slot that's genuinely
    // either unreserved or still in the future. SAFETY_CAP guards against
    // a genuine infinite loop if something here doesn't actually
    // converge — if it ever fires, that's real evidence of a different
    // bug, not something to raise silently.
    // [1900] PA=1 / [1905] PA(PA,1)=NA / [1910] PA(PA,3)=AL(AL,4) — DEFERRED
    // here (28 July 2026), run once per tick, rather than immediately on
    // answering "WHICH ACTIVITY" (see handleActivityKey's own comment,
    // and the REST auto-chain path just above, for the full reasoning).
    // Fires on the first tick where BASIC_NA is pending but PA hasn't
    // been set up yet for it — giving normal per-tick processing (the
    // [3400] AD-update block, further below) at least one full tick to
    // run with PA still NOT ready, before the while-loop's own gate
    // (checked next) can possibly be satisfied. T23 (end-of-event
    // handler) BUG FIX history (17 July 2026, per John's report: WORK
    // ran zero ticks despite a valid bottom time) still applies — see
    // the original fuller comment preserved at the REST auto-chain site.
    // FIX (same day, John's report: "work does nothing" — a second
    // DESCEND entry was created instead of WORK): the guard here was
    // `!BASIC_PA[BASIC_PA_scalar][1]` — "write it if not already set" —
    // but PA(1,1) is set to 1 (DESCEND) once, at dive start, and never
    // naturally resets to falsy afterward, so this never fired again for
    // any later transition; the stale 1 just got copied straight into
    // the next AL entry. Compare against BASIC_NA directly instead.
    // [1900-1910] For DESCEND, PA must not be prepared when the look-ahead
    // answer is received. In the BASIC, the accepted activity name leaves NA
    // set and execution returns through [3400]; PA is built later from the
    // [1800] end-of-event path. Other activity paths retain the existing
    // provisional behaviour until their scheduler fidelity is examined.
    if (BASIC_AL[BASIC_AL_scalar][1] !== 1 && BASIC_AL[BASIC_AL_scalar][1] !== 2 && BASIC_AL[BASIC_AL_scalar][1] !== 3 && BASIC_AL[BASIC_AL_scalar][1] !== 4 && BASIC_NA !== 0 && BASIC_PA[BASIC_PA_scalar] && BASIC_PA[BASIC_PA_scalar][1] !== BASIC_NA) {
      BASIC_PA[BASIC_PA_scalar][1] = BASIC_NA;
      BASIC_PA[BASIC_PA_scalar][3] = BASIC_AL[BASIC_AL_scalar][4];
    }

    // DESCEND physical completion is part of the current activity. Do not let
    // the event transition consume the queued activity until [3403-3405] has
    // brought AD to the exact target depth.
    const BASIC_DESCEND_COMPLETE = BASIC_AL[BASIC_AL_scalar][1] !== 1 ||
      BASIC_AD >= BASIC_AL[BASIC_AL_scalar][4];
    const BASIC_ASCEND_COMPLETE = BASIC_AL[BASIC_AL_scalar][1] !== 2 ||
      BASIC_AD <= BASIC_AL[BASIC_AL_scalar][4];

    let SAFETY_CAP = 10;
    let BASIC_END_EVENT_DISPATCHED = false;
    while (activityStep === null && BASIC_DESCEND_COMPLETE && BASIC_ASCEND_COMPLETE && !(BASIC_CL < BASIC_ES[BASIC_EP][2]) && SAFETY_CAP > 0) {
      SAFETY_CAP--;
      // [1476] EP=EP+1
      BASIC_EP = BASIC_EP + 1;
      // TEMPORARY DIAGNOSTIC (17 July 2026) — log every EP transition and
      // whether the landed-on slot was found reserved, to see the actual
      // sequence rather than one end-state snapshot.
      epLogRef.current.push(`EP->${BASIC_EP} ES(${BASIC_EP},1)=${BASIC_ES[BASIC_EP] ? BASIC_ES[BASIC_EP][1] : '?'} ES(${BASIC_EP},2)=${BASIC_ES[BASIC_EP] ? BASIC_ES[BASIC_EP][2] : '?'} CL=${BASIC_CL.toFixed(2)}`);
      if (epLogRef.current.length > 20) epLogRef.current.shift();
      // [1605] IF ES(EP,1)=1 THEN 1800 — not implemented (T23); assumed false
      if (BASIC_ES[BASIC_EP][1] !== 1 && !(BASIC_PA_scalar < 1 || !BASIC_PA[BASIC_PA_scalar] || !BASIC_PA[BASIC_PA_scalar][1])) {
        // TEMPORARY DIAGNOSTIC (17 July 2026) — this branch was the prime
        // suspect for where the trail goes cold (AL_scalar/ES_scalar not
        // advancing the way a completed creation should). Logging
        // PA_scalar and the PA slot's own content before it gets copied,
        // since a stale/invalid PA_scalar here (nothing has re-answered
        // WHICH ACTIVITY since WORK began) is the leading suspect.
        epLogRef.current.push(`AL-create firing: PA_scalar=${BASIC_PA_scalar} PA[PA_scalar]=${BASIC_PA[BASIC_PA_scalar] ? BASIC_PA[BASIC_PA_scalar].slice(1,6).join(',') : '(undefined!)'} AL_scalar(before)=${BASIC_AL_scalar}`);
        if (epLogRef.current.length > 20) epLogRef.current.shift();
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
          // [1692] GOSUB 6100 — implemented 17 July 2026, first piece of
          // fixing the REST-loop symptom traced back to HT never being
          // computed. See gosub_6100's own header comment for the full
          // reasoning.
          {
            const decompResult = gosub_6100();
            if (decompResult.outOfRange) {
              // FIX (28 July 2026, John's crash report on WD30/BT50) —
              // [6181] PRINT "OUT OF RANGE":STOP is a genuine BASIC STOP,
              // halting the ENTIRE program immediately, mid-subroutine —
              // not just setting a flag for something else to notice
              // later. The interval-level halt below (outOfRangeRef,
              // checked between ticks) was already correct and already
              // built for this, but within THIS tick, execution was
              // carrying on past GOSUB 6100 to call GOSUB 6950 and GOSUB
              // 6850 anyway — the source never reaches those once STOP
              // fires, and GOSUB 6850 crashes here since GOSUB 6100's
              // outOfRange return path never sets BASIC_I6/BASIC_L2 (see
              // gosub_6100's own comment on that handoff). Returning here
              // skips the rest of THIS tick entirely, matching STOP —
              // the interval-level check then prevents any further tick
              // from starting at all, same as the original never
              // reaching another line after 6181 for the rest of the run.
              outOfRangeRef.current = true;
              setBoundCells(cells => ({ ...cells, outOfRange: true }));
              return;
            }
          }
          // [1693] GOSUB 6950 — implemented 17 July 2026 (Dive-phase GOSUB
          // batch, first piece). Writes STOP10/STOP 5. See gosub_6950's
          // own header comment.
          setStopCells(gosub_6950().cells);
          // [1694] GOSUB 6850 — implemented 24 July 2026. See gosub_6850's
          // own header comment for the branch logic and the preserved
          // quirk. Writes into the same boundCells state GOSUB 6750 (T21)
          // uses, since both target the same DM cells (IDs 7-12/13-18) —
          // see gosub_6850's header for why. nostopEventCellsRef flags
          // this tick as "just had an event write" so the unconditional
          // GOSUB 6750 call later in this same runDiveTick() pass (see
          // [3530] below) skips overwriting it, letting this display
          // actually be visible for at least one tick before GOSUB 6750's
          // own recomputation (from WM, not I6/L2) takes back over on the
          // next tick as normal.
          // FIX (28 July 2026, same root cause as the GOSUB 6800 fix just
          // below): setBoundCells(nostopResult) was a FULL REPLACE.
          // Branch A only ever produces row-2 cells — a full replace on
          // Branch A would silently wipe any row-3 content GOSUB 6250 had
          // already written in an earlier DECOMPRESS period. Branch B
          // legitimately touches both rows, so this merges by whichever
          // row(s) the actual result touches, not a fixed row number.
          const nostopResult = gosub_6850();
          const touchedLines = new Set(nostopResult.cells.map(c => c.line));
          setBoundCells(cells => ({
            cells: [...cells.cells.filter(c => !touchedLines.has(c.line)), ...nostopResult.cells],
            outOfRange: cells.outOfRange,
          }));
          nostopEventCellsRef.current = true;
          // DIAGNOSTIC (27 July 2026) — chasing the "T, no numbers, wrong
          // colon count" report. Persistent state, not epLogRef — see
          // nostop6850Debug's own declaration comment for why. Remove
          // once resolved either way.
          setNostop6850Debug({ fireCount, tick: tickCount, ...nostopResult.debug });
          // GOSUB 6950 called again immediately after in source
          // (redundant — HT/DX don't change between the two calls — but
          // preserved faithfully rather than "optimised" to one call, per
          // STYLE_GUIDE.md's execution-order rule).
          setStopCells(gosub_6950().cells);
          // [1695] E5=D5, EX=DX
          BASIC_E5 = BASIC_D5; BASIC_EX = BASIC_DX;
        } else if (BASIC_AL[BASIC_P][1] === 2) {
          // [1680] ASCEND — T26b, this change.
          // AL(P,7)=AL(P,6)+(AL(P,3)-AL(P,4))/AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] +
            (BASIC_AL[BASIC_P][3] - BASIC_AL[BASIC_P][4]) / BASIC_AL[BASIC_P][2];
          // [1682] VA=32:FOR ID=13 TO 18:GOSUB 7000:NEXT ID — implemented
          // 28 July 2026. Blanks the DM's decompression-stop-time field
          // (IDs 13-18) to spaces the moment ascent begins, since that
          // display (GOSUB 6250 or GOSUB 6850 Branch B's fall-through)
          // no longer applies once ascending. Merges into boundCells row
          // 3 the same way GOSUB 6250/6800/6850 already do — six space
          // cells replacing whatever row-3 content was last there, not a
          // fixed row-clear outside that pattern.
          {
            const blankCells = [];
            const BASIC_FL = 0, BASIC_CO = 0;
            for (let BASIC_ID = 13; BASIC_ID <= 18; BASIC_ID++) {
              const c = gosub_7000(BASIC_ID, 32, BASIC_FL, BASIC_CO);
              if (c) blankCells.push({ ...c, line: 3 });
            }
            setBoundCells(cells => ({
              cells: [...cells.cells.filter(c => c.line !== 3), ...blankCells],
              outOfRange: cells.outOfRange,
            }));
          }
        } else if (BASIC_AL[BASIC_P][1] === 4) {
          // [1700] DECOMPRESS — T26d, this change. AL(P,7)=AL(P,6)+AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
          // [1701] GOSUB 6250 — implemented 27 July 2026. See gosub_6250's
          // own header comment for the HT<=5 no-op gate and the dead-code
          // flag. Writes into the same boundCells state GOSUB 6850's
          // Branch B fall-through and GOSUB 6750 (II=12 case) use, since
          // all three target IDs 13-18 — but this fires once, at
          // DECOMPRESS-initiation, so no same-tick collision is expected
          // the way GOSUB 6850/6750 needed gating for.
          const decompDisplayResult = gosub_6250();
          if (decompDisplayResult.cells.length > 0) {
            setBoundCells(cells => ({
              cells: [...cells.cells.filter(c => c.line !== 3), ...decompDisplayResult.cells],
              outOfRange: cells.outOfRange,
            }));
          }
          // DIAGNOSTIC (27 July 2026) — see gosub6250Debug's declaration
          // comment. Remove once GOSUB 6250 is confirmed and stable.
          setGosub6250Debug({ fireCount, tick: tickCount, HT: BASIC_HT, D5: BASIC_D5, DX: BASIC_DX, wroteCells: decompDisplayResult.cells.length });
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
        // BUG FIX (17 July 2026, confirmed via transition log: EP and
        // ES_scalar can diverge — my while-loop restructure lets EP race
        // ahead across several stale/reserved slots within one tick,
        // clearing reservations as it goes, without ES_scalar advancing
        // at all (that only happens here, in the AL-create branch). If
        // ES_scalar was left behind EP when this fires, a plain +1 can
        // land the NEW reservation on the exact slot EP just started
        // using for ITS OWN boundary — instantly re-blocking the thing
        // that was just unblocked. Reserving strictly ahead of EP's
        // current position (not just ES_scalar's own last value) makes
        // that collision impossible. Source has no equivalent of this
        // race, since it processes one EP step per pass with no
        // multi-slot catch-up in a single tick — this guard exists
        // because of that restructuring, not because source needs it.
        BASIC_ES_scalar = Math.max(BASIC_ES_scalar, BASIC_EP) + 1;
        // [1765] ES(ES,1)=1, ES(ES,2)=AL(P,7)
        BASIC_ES[BASIC_ES_scalar][1] = 1;
        BASIC_ES[BASIC_ES_scalar][2] = BASIC_AL[BASIC_P][7];
        // [1789] CK=0
        BASIC_CK = 0;
      } else if (BASIC_ES[BASIC_EP][1] === 1) {
        // [1605] IF ES(EP,1)=1 THEN 1800
        if (BASIC_AL[BASIC_AL_scalar][1] === 5) {
          // [1800]-[1820] REST is terminal in the original program:
          // GOSUB 8000 (final memory display), then END. GOSUB 8000's
          // display is not reconstructed here yet; stop the scheduler loop.
          epLogRef.current.push(`REST boundary: EP=${BASIC_EP} CL=${BASIC_CL.toFixed(2)} — END`);
          if (epLogRef.current.length > 20) epLogRef.current.shift();
          diveEndedRef.current = true;
          BASIC_END_EVENT_DISPATCHED = true;
          break;
        }
        if (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 2 || BASIC_AL[BASIC_AL_scalar][1] === 3 || BASIC_AL[BASIC_AL_scalar][1] === 4) {
          // DESCEND/ASCEND/WORK/DECOMPRESS: use the original end-of-event
          // route. The queued WHICH ACTIVITY answer remains in NA and the
          // current AL entry stays active until its true boundary.
          const boundaryActivity = BASIC_AL[BASIC_AL_scalar][1] === 1 ? 'DESCEND' :
            (BASIC_AL[BASIC_AL_scalar][1] === 2 ? 'ASCEND' :
              (BASIC_AL[BASIC_AL_scalar][1] === 3 ? 'WORK' : 'DECOMPRESS'));
          epLogRef.current.push(`${boundaryActivity} boundary: EP=${BASIC_EP} AD=${BASIC_AD.toFixed(2)} NA=${BASIC_NA}`);
          if (epLogRef.current.length > 20) epLogRef.current.shift();

          // [1800] IF AL(AL,1)<>5 THEN 1881
          // [1881] ES=ES+1
          BASIC_ES_scalar = BASIC_ES_scalar + 1;
          if (!BASIC_ES[BASIC_ES_scalar]) BASIC_ES[BASIC_ES_scalar] = new Array(3).fill(0);
          // [1882] ES(ES,1)=0:ES(ES,2)=0
          BASIC_ES[BASIC_ES_scalar][1] = 0;
          BASIC_ES[BASIC_ES_scalar][2] = 0;

          // [1888] IF AL(AL,1)=4 THEN GOSUB 7500. The decompression stop
          // remains current until this true event boundary; only now is HT
          // stepped down for construction of the following ASCEND.
          if (BASIC_AL[BASIC_AL_scalar][1] === 4) {
            const htBefore = BASIC_HT;
            gosub_7500();
            epLogRef.current.push(`GOSUB 7500 fired: HT ${htBefore} -> ${BASIC_HT}`);
            if (epLogRef.current.length > 20) epLogRef.current.shift();
          }

          // [1890-1895] Preserve the accepted look-ahead answer; if none was
          // supplied, use the activity's recorded default.
          if (BASIC_NA === 0) BASIC_NA = BASIC_AL[BASIC_AL_scalar][5];

          // [1900] PA=1
          BASIC_PA_scalar = 1;
          // [1905] PA(PA,1)=NA
          BASIC_PA[BASIC_PA_scalar][1] = BASIC_NA;
          // [1910] PA(PA,3)=AL(AL,4)
          BASIC_PA[BASIC_PA_scalar][3] = BASIC_AL[BASIC_AL_scalar][4];

          // [2010] ON NA GOTO 2020,2050,2080,2110,2140.
          // Dispatch the accepted activity only here, at the true boundary.
          if (BASIC_NA === 1) {
            // [2020] GOSUB 5300
            gosub_5300_start();
          } else if (BASIC_NA === 2) {
            // [2050] GOSUB 5400
            gosub_5400();
          } else if (BASIC_NA === 3) {
            // [2080] PA(PA,2)=-1; [2085] GOSUB 5500
            BASIC_PA[BASIC_PA_scalar][2] = -1;
            gosub_5500_start();
          } else if (BASIC_NA === 4) {
            // [2110] GOSUB 5600
            gosub_5600();
          } else if (BASIC_NA === 5) {
            // [2140] GOSUB 5700
            gosub_5700_start();
          }
          // [2200] GOTO 1465. Do not fall through to [3000]/[3400] in
          // this same JS pass after a completed activity boundary.
          BASIC_END_EVENT_DISPATCHED = true;
          break;
        }

        epLogRef.current.push(`EP=${BASIC_EP} was reserved, clearing`);
        if (epLogRef.current.length > 20) epLogRef.current.shift();
        // Existing provisional handling for non-DESCEND activities. Their
        // scheduler fidelity has not yet been brought into this change.
        BASIC_ES[BASIC_EP][1] = 0;
      } else {
        // BUG FIX (17 July 2026, per John's report of a runaway —
        // AL_scalar=25, EP=31 after only 4 real activities, ending in a
        // caught "reading '1'" error once EP ran past the array's actual
        // length). Root cause: this slot isn't reserved (flag 0), but a
        // never-touched default slot ALSO reads as flag 0 — there was no
        // way to tell "safely cleared, ready to use" apart from "nobody
        // has prepared a real activity here yet". Once one genuinely
        // empty PA read happened, every subsequent default slot looked
        // equally "available", and the while loop fabricated an AL entry
        // from empty data on every single one, racing off the end of the
        // array. Correct behaviour when there's truly no prepared
        // activity: don't fabricate anything — back off this EP advance
        // and stop, exactly as if the boundary hadn't been reached yet.
        // The separate WHICH ACTIVITY prompt (the [3010] look-ahead
        // check, elsewhere in this function) is what's actually
        // responsible for prompting and populating real PA data; this
        // loop's job is only to consume it once it exists.
        epLogRef.current.push(`EP=${BASIC_EP}: no valid PA data (PA_scalar=${BASIC_PA_scalar}) — halting, not fabricating an entry`);
        if (epLogRef.current.length > 20) epLogRef.current.shift();
        BASIC_EP = BASIC_EP - 1;
        break;
      }
    }
    if (SAFETY_CAP === 0) {
      epLogRef.current.push('SAFETY_CAP EXHAUSTED — did not converge, real bug elsewhere');
      if (epLogRef.current.length > 20) epLogRef.current.shift();
    }

    // [2200] GOTO 1465 after a true end-of-event dispatch. The previous
    // JSX only broke out of the internal while-loop and then continued into
    // [3000]/[3400], causing one extra render/movement pass for the activity
    // that had just ended. End this JS tick here; the next timer tick resumes
    // at [1465], matching the BASIC control flow.
    if (BASIC_END_EVENT_DISPATCHED) return;

    } else {
      // [1790] GOTO 3000 — first AL/event creation already advanced CL and
      // established AA/BB. Continue this same BASIC pass at the display/
      // look-ahead section without executing another [1465]-[1471] cycle.
      resumeAt3000Ref.current = false;
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
      // DIAGNOSTIC (28 July 2026) — T34 investigation. Captures the exact
      // state at the moment this condition first becomes true, before any
      // of the branching below runs. Read-only aside from the one setter.
      // Remove once T34 is resolved.
      setPromptTriggerDebug({
        tick: tickCount, fireCount,
        AL_scalar: BASIC_AL_scalar, activity: BASIC_AL[BASIC_AL_scalar][1],
        target: BASIC_AL[BASIC_AL_scalar][4],
        CL: BASIC_CL, AD: BASIC_AD, EP: BASIC_EP,
        ES_EP_2: BASIC_ES[BASIC_EP][2], IK: BASIC_IK, CK: BASIC_CK,
      });
      // [3021] IF AL(AL,1)<>5 THEN 3025 — REST skips the prompt entirely
      if (BASIC_AL[BASIC_AL_scalar][1] !== 5) {
        // TEMPORARY DIAGNOSTIC (17 July 2026) — unconditional, logs every
        // time this block fires regardless of the AL(AL,1)===4 check
        // below, since HT wasn't decrementing and I need to see whether
        // this block is even running, and what AL(AL,1) reads at the
        // exact moment, rather than trust a later diagnostic snapshot.
        epLogRef.current.push(`WHICH ACTIVITY firing: AL_scalar=${BASIC_AL_scalar} AL(AL,1)=${BASIC_AL[BASIC_AL_scalar][1]} HT(before)=${BASIC_HT}`);
        if (epLogRef.current.length > 20) epLogRef.current.shift();
        // DECOMPRESS note: [1888] GOSUB 7500 is deliberately NOT done at
        // this predictive prompt. It belongs to the true [1800] event-boundary
        // path, after the DECOMPRESS period has actually completed.
        // [3025-3031] trigger "WHICH ACTIVITY REQUIRED (...)"
        BASIC_CK = 1;
        setActivityDefault(BASIC_A[BASIC_AL[BASIC_AL_scalar][5]]);
        setActivityStep('whichActivity');
        return; // [3032] INPUT M$ — execution resumes at [3400] after Enter
      } else {
        // [3022] CK=1:GOTO 1465 — REST suppresses WHICH ACTIVITY and does
        // not prepare another activity here. REST NEXT (GOSUB 5700) belongs
        // to the preceding activity's end-of-event dispatch, not to REST's
        // own look-ahead processing.
        BASIC_CK = 1;
        return;
      }
    }
    } else {
      // [3035] recognised activity name: continue at [3400] in the same
      // scheduler pass. AA/BB/CL are deliberately left exactly as they were
      // when INPUT was issued.
      resumeAt3400Ref.current = false;
    }

    {
      // [3400] IF AL(AL,1)<>1 AND AL(AL,1)<>2 THEN 3410
      // DIAGNOSTIC (28 July 2026) — T34, third pass. Captures exactly
      // what this block sees on every tick it's reached, before it does
      // anything — isolating whether it's being skipped, or running with
      // unexpected values, rather than inferring either from before/
      // after end-of-tick snapshots. Remove once T34 is resolved.
      const adBlockDebugEntry = {
        tick: tickCount, AL_scalar: BASIC_AL_scalar,
        AL_1: BASIC_AL[BASIC_AL_scalar] ? BASIC_AL[BASIC_AL_scalar][1] : '?',
        AL_4: BASIC_AL[BASIC_AL_scalar] ? BASIC_AL[BASIC_AL_scalar][4] : '?',
        AD_before: BASIC_AD, DR: BASIC_DR, TK: BASIC_TK,
        willEnter: BASIC_AL[BASIC_AL_scalar] && (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 2),
      };
      if (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 2) {
        // [3402] IF AL(AL,1)=2 THEN 3406 — ASCEND branch
        if (BASIC_AL[BASIC_AL_scalar][1] === 2) {
          // [3406]-[3408] — T18c, implemented 17 July 2026. Mirrors the
          // DESCEND branch below exactly, but subtracting (ascending
          // reduces depth) via AR (ascent rate) instead of DR, and
          // checking against the target from the other direction —
          // "ceiling reached" (AD would go below the target) rather
          // than "bottom reached" (AD would go above it). Found stubbed
          // during today's ASCEND/DECOMPRESS testing: with this branch
          // empty, AD never changed during ASCEND, so Branch 1's
          // profile-line render (bar height = this tick's depth change)
          // had nothing to draw — the diver's track appeared to freeze
          // at WORK's end point even though CL was genuinely advancing.
          if (BASIC_AD - BASIC_AR * BASIC_TK < BASIC_AL[BASIC_AL_scalar][4]) {
            // [3408] AD=AL(AL,4) — CEILING REACHED
            BASIC_AD = BASIC_AL[BASIC_AL_scalar][4];
          } else {
            // [3407] AD=AD-AR*TK
            BASIC_AD = BASIC_AD - BASIC_AR * BASIC_TK;
          }
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
      adBlockDebugEntry.AD_after = BASIC_AD;
      if (!adBlockTraceFrozenRef.current) {
        setAdBlockTraceLog(log => {
          const next = [...log, adBlockDebugEntry];
          if (next.length >= 20) adBlockTraceFrozenRef.current = true;
          return next;
        });
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
            // (MP -> MQ).
            //
            // CORRECTED 28 July 2026 (T33/T34/T36/T37/T38/T44 family). The
            // comment this replaced claimed BASIC_LQ (floor(CL*XS)) "rounds
            // inconsistently" at grid boundaries, and used a hardcoded
            // tick-count column scheme (barCol = floor(tickN/2)+1) instead,
            // to sidestep that supposed rounding artefact. That diagnosis
            // was WRONG, and had already been superseded on the very same
            // day it was written — see LOG.md, three entries later, same
            // date: "T18 six-tick trace confirmed via browser console — no
            // rounding error found... No mechanism exists for cumulative/
            // progressive error under these specific test values." The
            // correction just never made it back into this comment.
            // Independently reconfirmed 28 July 2026: TK is always 1/32 or
            // 0.25, XS is always 0.5/1/2 — every value in play is an exact
            // power of two, so CL's repeated addition (CL=CL+TK) is bit-
            // exact in IEEE-754 across thousands of ticks tested (checked
            // directly, zero mismatches against tickCount*TK for every
            // realistic TK/XS combination).
            //
            // What was ACTUALLY happening: barCol's hardcoded "/2" is the
            // real column-crossing rate (1/(TK*XS) ticks per column) ONLY
            // for the one profile it was validated against by photograph —
            // WD=40 (XS=2.0) under ACCELERATED (TK=0.25) gives 1/(0.25*2)=2
            // ticks/column, matching "/2" exactly by coincidence. For any
            // OTHER TK*XS combination — e.g. T33's WD=1 (XS=0.5), same
            // TK=0.25, real rate 1/(0.25*0.5)=8 ticks/column — barCol still
            // advanced every 2 ticks regardless, 4x too fast: a permanent,
            // deterministic rate mismatch against BASIC_LQ (used by Branch
            // 2/WORK's coloured band), not an occasional flicker. That
            // mismatch is what T33/T34/T36-T38/T44 were actually showing.
            //
            // Fix: derive the column from the real, TK/XS-aware BASIC_LQ
            // directly, restoring one shared coordinate source for both
            // GOSUB 6300 branches — which a still-earlier comment ("column
            // 1 aligns with LQ's first grid value") always intended. The +1
            // offset below is empirical, not derived: BASIC_LQ=10 at tick 1
            // for the WD=40/ACCELERATED case, but the old, photograph-
            // confirmed barGridX was 11 at that same tick — a consistent
            // +1 at every tick checked. Preserved exactly rather than
            // assumed away, since it's the one case with real photographic
            // evidence behind it.
            // CCI byte 32: BG=blue FG=black — final bar colour is black.
            // BAR_W trimmed 1px from a full plotX grid unit — full-width bars
            // rendered fractionally too wide under crispEdges pixel snapping.
            const BAR_W = plotX(1) - 1;
            // DEF-003 fix (28 July 2026): on the first Branch 1 tick right
            // after a Branch 2 (WORK) tick, align with WORK's own last
            // column (BASIC_LQ) instead of the usual +1 offset — see
            // justLeftWorkRef's own declaration for why. Every other tick
            // (including the dive-start DESCEND tick the +1 offset was
            // originally validated against) is unaffected.
            const barGridX = justLeftWorkRef.current ? BASIC_LQ : BASIC_LQ + 1;
            justLeftWorkRef.current = false;
            const T18_DEBUG_COLOURS = false;               // set true to re-enable per-tick colour cycling while testing
            const TEST_COLOURS = ['#FF0000','#FF8800','#FFFF00','#00FF00','#00FFFF','#FF00FF'];
            const tickColour = T18_DEBUG_COLOURS ? TEST_COLOURS[tickCount % TEST_COLOURS.length] : '#000000';
            // MIN_BAR_H (17 July 2026, per John's report): a genuinely
            // flat segment (MP===MQ — depth not changing this tick, e.g.
            // holding a DECOMPRESS stop) produces a zero-height rect,
            // which SVG renders as nothing at all. The real hardware's
            // PLOT command still paints a filled bar spanning the column
            // even at constant height — this was never exposed before
            // today, since every prior Branch-1 tick (DESCEND) had a
            // genuine depth change. 2px floor keeps a flat stop visible
            // as a thin line without materially affecting any bar that
            // already has real height.
            const MIN_BAR_H = 2;
            const rawH = Math.abs(plotY(BASIC_MQ) - plotY(BASIC_MP));
            const isFlat = rawH < MIN_BAR_H;
            // Keep the established bar approximation for changing-depth
            // DESCEND/ASCEND, but use source-coordinate horizontal vectors
            // for constant-depth DECOMPRESS and REST. For ASCEND, suppress
            // the empirical +1 X offset on the one tick that actually lands
            // at its target depth, so the following flat activity starts at
            // the same BASIC LQ coordinate without introducing L-shapes
            // throughout the climb.
            const activityType = BASIC_AL[BASIC_AL_scalar][1];
            const isDecompress = activityType === 4;
            const isRest = activityType === 5;
            const FLAT_BAR_W = plotX(1);

            if (isDecompress || isRest) {
              // REST can legitimately follow either ASCEND or WORK. The
              // established ASCEND renderer is displayed one plot column
              // ahead of raw BASIC LQ, whereas WORK ends on raw LQ. Preserve
              // the true flat-activity duration by shifting BOTH endpoints
              // only when the immediate predecessor was ASCEND.
              const previousActivityType =
                BASIC_AL_scalar > 1 ? BASIC_AL[BASIC_AL_scalar - 1][1] : 0;
              const flatXOffset =
                (isRest || isDecompress) && previousActivityType === 2 ? 1 : 0;

              const flatStartX = plotX(BASIC_LP + flatXOffset);
              const flatEndX = plotX(BASIC_LQ + flatXOffset);

              if (previousActivityType === 2) {
                setHandoffGeometryLog(log => [...log.slice(-11),
                  `${isDecompress ? 'ASC->DECOMP' : 'ASC->REST'} ` +
                  `CL=${BASIC_CL.toFixed(3)} AD=${BASIC_AD.toFixed(3)} ` +
                  `LP=${BASIC_LP} LQ=${BASIC_LQ} ` +
                  `rawLPx=${plotX(BASIC_LP).toFixed(2)} rawLQx=${plotX(BASIC_LQ).toFixed(2)} ` +
                  `offset=${flatXOffset} flatStart=${flatStartX.toFixed(2)} flatEnd=${flatEndX.toFixed(2)}`
                ]);
              }

              setProfileSegs(segs => [...segs, {
                kind: 'line',
                x: flatStartX,
                x2: flatEndX,
                y: plotY(BASIC_MQ),
                colour: tickColour,
              }]);
            } else {
              // ASCEND (and DESCEND) use one consistent established Branch-1
              // rendering convention throughout the activity.
              const rectX = plotX(barGridX) - (isFlat ? FLAT_BAR_W : BAR_W) / 2;
              const rectW = isFlat ? FLAT_BAR_W : BAR_W;
              const activityTypeForDiag = BASIC_AL[BASIC_AL_scalar][1];

              if (activityTypeForDiag === 2) {
                setHandoffGeometryLog(log => [...log.slice(-11),
                  `ASCEND CL=${BASIC_CL.toFixed(3)} AD=${BASIC_AD.toFixed(3)} ` +
                  `LP=${BASIC_LP} LQ=${BASIC_LQ} barGridX=${barGridX} ` +
                  `rawLPx=${plotX(BASIC_LP).toFixed(2)} rawLQx=${plotX(BASIC_LQ).toFixed(2)} ` +
                  `rectL=${rectX.toFixed(2)} rectC=${(rectX + rectW/2).toFixed(2)} rectR=${(rectX + rectW).toFixed(2)}`
                ]);
              }

              setProfileSegs(segs => [...segs, {
                kind: 'rect',
                x: rectX,
                y: isFlat ? plotY(BASIC_MQ) - MIN_BAR_H / 2 : Math.min(plotY(BASIC_MP), plotY(BASIC_MQ)),
                w: rectW,
                h: isFlat ? MIN_BAR_H : rawH,
                colour: tickColour,
              }]);
            }
          }
        }
      } else {
        // [6330] GOSUB 6300 Branch 2 (coloured band mountain) — T24a-d,
        // ported from DiverSim2 sandbox 17 July 2026. Confirmed against
        // photograph: column heights, boundaries, and step cadence all
        // matched (John, 17 July 2026 — "the column heights and
        // boundaries all match. The spurious effects have gone").
        //
        // DEF-003 (28 July 2026): mark that Branch 1 fires next found a
        // WORK tick immediately before it — see justLeftWorkRef's own
        // declaration and the barGridX fix at Branch 1's own site.
        justLeftWorkRef.current = true;
        //
        // [6330] Y3=INT(140-BB*YS)
        const BASIC_Y3 = Math.floor(140 - BASIC_BB * BASIC_YS);

        const newBandBars = [];
        const newWorkDots = [];

        // [6331] FOR X3=LP TO LQ
        for (let BASIC_X3 = BASIC_LP; BASIC_X3 <= BASIC_LQ; BASIC_X3++) {
          // [6332] IF X3<=LM THEN 6593 — skip, no rightward progress
          if (BASIC_X3 <= BASIC_LM) {
            continue;
          }
          // [6333] LM=X3: XX=(X3-10)/XS-TK
          BASIC_LM = BASIC_X3;
          const BASIC_XX = (BASIC_X3 - 10) / BASIC_XS - BASIC_TK;
          // [6345] Y2=140: C=1
          // BASIC_C_scalar, not BASIC_C: this is the band-counter scalar
          // (C=1, C=C+1, C=7), distinct from the module-level BASIC_C
          // array (C(1..7), the display-attribute lookup table) per
          // STYLE_GUIDE.md's dual scalar/array convention. A plain
          // BASIC_C here would shadow the array for this entire block,
          // making it unreachable — exactly what the band-colour lookup
          // below needs.
          let BASIC_Y2 = 140;
          let BASIC_C_scalar = 1;
          // [6346] L=1: CO=1
          let BASIC_L = 1;
          let BASIC_CO = 1;

          // [6350] FOR J=1 TO 7 — band-search scan.
          // RE-ENABLED (17 July 2026). Was temporarily disabled to
          // isolate the freeze John reported — confirmed the freeze
          // happened identically with this whole loop skipped, proving
          // it wasn't the cause. Real cause found and fixed separately:
          // ES(EP,1) reservation flag never being cleared (see the else
          // clause a little further up this function, around [1605]).
          for (let BASIC_J = 1; BASIC_J <= 7; BASIC_J++) {
            // [6355] PLOT 30,20 — STUB, drawing only
            // [6360] FOR I=L TO 21 / [6370] IF DT(I,J)=999 OR DT(I,J)<XX THEN 6380
            // BUG FIX (per STYLE_GUIDE.md FOR-NEXT exhaustion note): a
            // BASIC FOR I=L TO 21 ... NEXT I loop that runs to completion
            // without an early exit does not error — I settles one past
            // the upper bound (22) and execution carries on normally.
            let BASIC_I = BASIC_L;
            for (BASIC_I = BASIC_L; BASIC_I <= 21; BASIC_I++) {
              if (BASIC_DT[BASIC_I][BASIC_J] === 999 || BASIC_DT[BASIC_I][BASIC_J] < BASIC_XX) {
                break;
              }
            }
            // [6380] Y1=INT(140-(2*I+8)*YS)
            let BASIC_Y1 = Math.floor(140 - (2 * BASIC_I + 8) * BASIC_YS);
            // [6390] Y1=Y1+2
            BASIC_Y1 = BASIC_Y1 + 2;
            // [6391] IF Y1=42 THEN Y1=40
            if (BASIC_Y1 === 42) BASIC_Y1 = 40;
            // [6392] IF Y1<40 THEN Y1=40
            if (BASIC_Y1 < 40) BASIC_Y1 = 40;

            const BASIC_inRange = !(BASIC_Y3 < BASIC_Y1 || BASIC_Y3 > BASIC_Y2);
            if (BASIC_inRange) {
              BASIC_CO = BASIC_C_scalar;
            }
            // [6500] IF C=1 THEN 6540 — first band found: no PRIOR band
            // exists yet to draw between, so the draw block is skipped
            // regardless of C=1's outcome.
            const BASIC_wouldDraw = BASIC_C_scalar !== 1;

            if (BASIC_wouldDraw) {
              // Native per-column resolution — CONFIRMED, do not widen or
              // centre without a fresh photograph comparison (see header
              // comment on bandSegs' useState declaration above).
              const BAND_BAR_W = plotX(BASIC_X3 + 1) - plotX(BASIC_X3);
              const barY1 = plotY(BASIC_Y1);
              const barY2 = plotY(BASIC_Y2);
              // [6550] Y2=Y1-1 deliberately leaves a 1-plot-unit buffer
              // between consecutive bands in BASIC's coordinate space —
              // invisible at the 8001's native resolution, ~2px of
              // visible background at our SVG scale. BASIC_Y1/BASIC_Y2
              // themselves are correct and untouched; GAP_FUDGE is a
              // rendering-only extension toward the shallower edge to
              // close the seam.
              const GAP_FUDGE = 400 / 191;
              const plotAttr = BASIC_C[BASIC_C_scalar];
              newBandBars.push({
                x: plotX(BASIC_X3),
                y: Math.min(barY1, barY2) - GAP_FUDGE,
                w: BAND_BAR_W,
                h: Math.abs(barY2 - barY1) + GAP_FUDGE,
                colour: CCI[plotAttr],
              });
            }

            // [6540] IF Y1=40 OR C=7 THEN 6590 — exit the J loop
            if (BASIC_Y1 === 40 || BASIC_C_scalar === 7) break;
            // [6541] IF DT(I,J)=999 THEN 6590 — exit the J loop
            if (BASIC_DT[BASIC_I][BASIC_J] === 999) break;
            // [6550] Y2=Y1-1
            BASIC_Y2 = BASIC_Y1 - 1;
            // [6560] C=C+1
            BASIC_C_scalar = BASIC_C_scalar + 1;
            // [6570] L=I
            BASIC_L = BASIC_I;
          }

          // [6591] PLOT 2,253,X3,Y3,255 — diver's actual position dot.
          // Black (see workDots' useState declaration above), not the
          // sandbox's yellow.
          // [6591] PLOT 2,253,X3,Y3,255 — diver's actual position dot.
          // Black (see workDots' useState declaration above), not the
          // sandbox's yellow. inBand: John's observation, 17 July 2026,
          // against the reference photograph — the track should render
          // as a dashed line while crossing the coloured mountain and a
          // solid line elsewhere, matching the photo exactly. CO>1 means
          // the diver's current depth falls inside a drawn band (CO=1 is
          // the never-drawn background colour).
          newWorkDots.push({ x: plotX(BASIC_X3), y: plotY(BASIC_Y3), inBand: BASIC_CO > 1 });
        }

        if (newBandBars.length > 0) {
          setBandSegs(segs => [...segs, ...newBandBars]);
        }
        if (newWorkDots.length > 0) {
          setWorkDots(dots => [...dots, ...newWorkDots]);
        }
      }
    }

    // [3510] GOSUB 6600 — depth digits, now wired in (T19, confirmed)
    const depthResult = gosub_6600(BASIC_AD);
    setDepthDigitCells(depthResult.digitCells);
    setDepthTrendCells(depthResult.trendCells);
    // [3520] GOSUB 6700 — air gauge, now wired in (T20, this change)
    // FIX (T43, HK's TODO.md flag, 27 July 2026): same root cause as the
    // GOSUB 6750/boundCells bug above — [6730] IF VA<0 THEN 6745 means
    // GOSUB 6700 does nothing at all once too deep for the gauge's
    // displayable range; real hardware leaves the last valid reading on
    // screen, untouched. gosub_6700() already returns [] in that case;
    // unconditionally calling setAirGaugeCells would blank the gauge
    // instead of freezing it. Only update when it actually has cells.
    const airGaugeResult = gosub_6700(BASIC_CL, BASIC_XS);
    if (airGaugeResult.length > 0) {
      setAirGaugeCells(airGaugeResult);
    }
    // [3530] GOSUB 6750 — NOSTOP/time-to-bound, now wired in (T21, this change)
    // GATED (24 July 2026, alongside GOSUB 6850 going in): GOSUB 6750 is
    // unconditional every tick in source too, and DOES genuinely overwrite
    // GOSUB 6850's same-tick write on the real hardware — but there, each
    // GOSUB draws directly to the physical screen, so a human watching
    // could see 6850's digits for a brief moment before 6750 redraws over
    // them. In this discrete-tick, state-based render, the two calls
    // within one runDiveTick() happen synchronously with no frame drawn
    // in between, so an unconditional overwrite here would make GOSUB
    // 6850's display never actually visible at all — not a faithful
    // reproduction of "briefly visible, then redrawn", just "never
    // rendered". Skipping this one write, exactly once, on the tick GOSUB
    // 6850 just fired, is the closest discrete-tick equivalent available;
    // every subsequent tick behaves exactly as before (unconditional).
    //
    // SECOND FIX, same change (John's photo evidence, 27 July 2026 — see
    // LOG.md): [6751] I=AL(AL,1):IF I<>1 AND I<>3 THEN 6799 — GOSUB 6750
    // does a bare RETURN, with NO PLOT calls whatsoever, once activity
    // leaves DESCEND(1)/WORK(3). On the real hardware that means those
    // pixels are simply never touched — whatever was last drawn (GOSUB
    // 6850's display, most recently) stays exactly as it was, visible
    // through DECOMPRESS/ASCEND/REST, matching the photo (STOP10/T15:38
    // still on screen well after WORK ended). gosub_6750() already
    // returns cells:[] correctly in that case — but unconditionally
    // calling setBoundCells with an empty array was REPLACING the
    // previous non-empty display with nothing, every single tick, which
    // is not the same thing as "untouched". Only update boundCells when
    // GOSUB 6750 actually wrote something (cells.length>0) or hit its own
    // OUT OF RANGE case; otherwise leave the prior state exactly as is.
    if (nostopEventCellsRef.current) {
      nostopEventCellsRef.current = false;
    } else {
      const boundResult = gosub_6750();
      if (boundResult.cells.length > 0 || boundResult.outOfRange) {
        setBoundCells(boundResult);
      }
      if (boundResult.outOfRange) {
        // FIX (28 July 2026, same class of bug as the GOSUB 6100 STOP fix
        // above, found by sweeping the source for every other STOP after
        // that one — see [6763] NEXT I:PRINT "OUT OF RANGE":STOP, GOSUB
        // 6750's OWN out-of-range case, distinct from GOSUB 6100's but
        // with the identical gap: outOfRangeRef gets set, but nothing
        // stopped THIS tick from continuing on into [3540]'s GOSUB 6800
        // anyway. Unlike the 6850 case this didn't crash (GOSUB 6800
        // doesn't touch BASIC_I6/BASIC_L2), so it was a silent fidelity
        // gap rather than a visible bug — GOSUB 6750 fires every tick
        // (not once, like GOSUB 6100), so this is the more likely of the
        // two to actually get hit in practice. Same fix: halt here.
        outOfRangeRef.current = true;
        return;
      }
    }

    // [3540] IF AL(AL,1)=4 THEN GOSUB 6800 — total DT requirements
    // countdown, DECOMPRESS only. Same tick as [3530] above, immediately
    // after it (source's own comment on this ordering — see GOSUB_INDEX.md
    // U18 — GOSUB 6750 writes first, GOSUB 6800 overwrites; here GOSUB
    // 6750 has already gone silent for DECOMPRESS via its own [6751] gate,
    // so this is a plain activity-gated write, not an arbitration).
    // FIX (28 July 2026, John's report — "6250 shows no Line3 at all"):
    // this was doing a FULL REPLACE of boundCells, but GOSUB 6800 only
    // ever returns row-2 cells (IDs 7-12). GOSUB 6800 fires every tick
    // through the whole DECOMPRESS period; GOSUB 6250 fires once, at
    // DECOMPRESS-initiation, writing row 3. The full replace was wiping
    // row 3 back out on the very next tick after GOSUB 6250 wrote it —
    // exactly the "mirror-image" of the bug already fixed for GOSUB
    // 6250's own call site, flagged as unchecked at the time (see
    // TODO.md). Same merge pattern now applied here.
    if (BASIC_AL[BASIC_AL_scalar][1] === 4) {
      const dtResult = gosub_6800();
      if (dtResult.cells.length > 0) {
        setBoundCells(cells => ({
          cells: [...cells.cells.filter(c => c.line !== 2), ...dtResult.cells],
          outOfRange: cells.outOfRange,
        }));
      }
    }

    // DIAGNOSTIC (28 July 2026) — T34, second pass. Final state for THIS
    // tick, after CL increment, AL-creation while-loop, prompt-trigger,
    // and the [3400] AD-update block have all run. See tickTraceLog's
    // own declaration comment for why this is separate from epLogRef.
    // FIX (same day): the plain rolling-last-40 version lost exactly the
    // ticks that matter — a long WORK period (80 ticks for BT=20) pushed
    // the whole DESCEND-and-transition window out before it could be
    // read. Now freezes 15 ticks after the first AL_scalar change, so
    // the capture always covers DESCEND, the transition itself, and a
    // short run into the next activity, regardless of how long that
    // next activity subsequently runs.
    if (!tickTraceFrozenRef.current) {
      if (tickTraceStartALRef.current === null) {
        tickTraceStartALRef.current = BASIC_AL_scalar;
      } else if (BASIC_AL_scalar !== tickTraceStartALRef.current && tickTraceTransitionTickRef.current === null) {
        tickTraceTransitionTickRef.current = tickCount;
      }
      if (tickTraceTransitionTickRef.current !== null && tickCount - tickTraceTransitionTickRef.current >= 15) {
        tickTraceFrozenRef.current = true;
      }
      setTickTraceLog(log => [...log, {
        tick: tickCount, CL: BASIC_CL.toFixed(3), AD: BASIC_AD.toFixed(3),
        EP: BASIC_EP, AL_scalar: BASIC_AL_scalar,
        AL_1: BASIC_AL[BASIC_AL_scalar] ? BASIC_AL[BASIC_AL_scalar][1] : '?',
        ES_EP_2: BASIC_ES[BASIC_EP] ? BASIC_ES[BASIC_EP][2].toFixed(3) : '?',
        activityStep, CK: BASIC_CK,
      }]);
    }

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
  // TEMPORARY DIAGNOSTIC (17 July 2026, per HK) — direct, always-on
  // readout of AL(AL,1)/AL_scalar/CL every tick, to settle whether
  // Branch 2 is ever actually reached in a real run before chasing
  // anything else. Remove once answered.
  const [alDebug, setAlDebug] = useState(null);
  // TEMPORARY DIAGNOSTIC (27 July 2026) — GOSUB 6850 fires once per
  // WORK-initiation, but the epLogRef event log churns fast (EP-create/
  // AL-create/WHICH ACTIVITY/GOSUB 7500 all push to the same 20-line
  // buffer) — by the time a test run is paused to read it, the entry is
  // long gone (confirmed: John's fireCount=432 report had no 6850 entry
  // left at all). Persistent state instead, same pattern as alDebug
  // above: holds only the MOST RECENT firing, survives indefinitely
  // until GOSUB 6850 next fires. Remove once the "no numbers" report is
  // resolved either way.
  const [nostop6850Debug, setNostop6850Debug] = useState(null);
  // TEMPORARY DIAGNOSTIC (27 July 2026) — same rationale and pattern as
  // nostop6850Debug above: GOSUB 6250 fires once, at DECOMPRESS-
  // initiation, and the rolling epLogRef churns too fast to catch a
  // one-shot entry reliably. Persistent state instead.
  const [gosub6250Debug, setGosub6250Debug] = useState(null);
  // TEMPORARY DIAGNOSTIC (28 July 2026) — T34 investigation (DESCEND
  // terminating short of the requested WD). Captures CL/AD/ES/IK/CK at
  // the exact tick the prompt-trigger condition first fires. Remove
  // once T34 is resolved.
  const [promptTriggerDebug, setPromptTriggerDebug] = useState(null);
  // TEMPORARY DIAGNOSTIC (28 July 2026) — T34 investigation, second pass.
  // Dedicated per-tick trace, unpolluted by epLogRef's other event types
  // (already learned, from GOSUB 6850's own diagnostic, that a shared
  // rolling log churns too fast for a specific sequence to survive being
  // read). Records EVERY tick unconditionally, capped ring-buffer style.
  // Remove once T34 is resolved.
  const [tickTraceLog, setTickTraceLog] = useState([]);
  // Support refs for tickTraceLog's freeze-after-transition logic — see
  // the push site's own comment for why. tickTraceStartALRef records the
  // AL_scalar seen on the first logged tick (the baseline to detect a
  // change against); tickTraceTransitionTickRef records which tick
  // number AL_scalar first changed; tickTraceFrozenRef stops further
  // pushes once that window has been captured.
  const tickTraceStartALRef = useRef(null);
  const tickTraceTransitionTickRef = useRef(null);
  const tickTraceFrozenRef = useRef(false);
  // AD-block diagnostic (28 July 2026, T34 third pass) — was used but
  // never actually declared in the previous edit; fixed here. Freezes
  // after 20 entries, same ring-buffer-avoidance reasoning as
  // tickTraceLog above.
  const [adBlockTraceLog, setAdBlockTraceLog] = useState([]);
  const adBlockTraceFrozenRef = useRef(false);
  const [fireCount, setFireCount] = useState(0);
  const epLogRef = useRef([]);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [caughtError, setCaughtError] = useState(null);

  // TEMPORARY DIAGNOSTIC (17 July 2026) — global catch-all, reported
  // on-page. The console UI wasn't cooperating, and the try/catch around
  // runDiveTickRef.current() caught nothing, meaning whatever's in the
  // console (mf.js / localhost errors) either isn't from that call or
  // isn't a synchronous throw. This catches genuinely everything —
  // uncaught errors and unhandled promise rejections, anywhere on the
  // page — regardless of source.
  useEffect(() => {
    const onError = (event) => {
      setCaughtError('window.onerror: ' + event.message + '\n' + (event.error?.stack || '(no stack)'));
    };
    const onRejection = (event) => {
      setCaughtError('unhandledrejection: ' + String(event.reason));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

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

  // [3035] A$(NA)=M$ THEN 3400 — INPUT returns into the same BASIC pass.
  // React input returns on a later callback, so this ref tells runDiveTick()
  // to resume at [3400] without re-running [1465]-[3035].
  const resumeAt3400Ref = useRef(false);
  const resumeAt3000Ref = useRef(false);

  // [6763] OUT OF RANGE — see gosub_6750 comment above. A ref (not state)
  // since it's only read inside the interval callback, not rendered.
  const outOfRangeRef = useRef(false);
  // [1820] END after REST completes. Separate from OUT OF RANGE so a normal
  // completed dive is not reported as an error halt.
  const diveEndedRef = useRef(false);

  // GOSUB 6850/GOSUB 6750 collision gate — see the [3530] call site and
  // gosub_6850's own header comment. Set true when GOSUB 6850 has just
  // written boundCells this tick; consumed (and reset) by the very next
  // GOSUB 6750 check in the same tick, so it never affects later ticks.
  const nostopEventCellsRef = useRef(false);

  // DEF-003 (28 July 2026): GOSUB 6300 Branch 1 (DESCEND/ASCEND) draws a
  // single bar per tick at BASIC_LQ+1 — an offset empirically confirmed
  // against a photograph for the dive-start DESCEND case, and consistent
  // internally across any run of same-branch ticks. Branch 2 (WORK)
  // draws its own last dot at raw BASIC_LQ, no offset. At the exact tick
  // WORK hands off to ASCEND, both branches compute the same LQ, but
  // Branch 1's own +1 then draws one column ahead of where Branch 2 left
  // off — a small, constant, visible gap at every WORK->ASCEND handoff
  // (confirmed via John's own paired profileSegs/workDots readings: a
  // fixed 2px gap regardless of how long WORK ran, not a growing one).
  // This ref flags exactly one tick — the first Branch 1 call right
  // after a Branch 2 call — so that one tick can align with Branch 2's
  // own ending column instead. Every other tick, including the dive-
  // start case the +1 offset was validated against, is unaffected.
  const justLeftWorkRef = useRef(false);

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
  //   activityStep  — a prompt is awaiting an answer. During DESCEND the
  //                   scheduler continues to tick through the look-ahead
  //                   interaction; later activities retain the existing
  //                   pause behaviour pending their own scheduler review.
  useEffect(() => {
    if (!tmEntered) return;
    const interval = setInterval(() => {
      // TEMPORARY DIAGNOSTIC (17 July 2026) — counts every interval
      // firing, before any gate. If this stops advancing, the interval
      // itself is gone (effect torn down, not recreated). If it keeps
      // advancing while runDiveTick's own counter doesn't, one of the
      // two gates below is the cause after all.
      setFireCount(n => n + 1);
      if (outOfRangeRef.current || diveEndedRef.current) {
        clearInterval(interval);
        return;
      }
      // BASIC INPUT is synchronous: while any input prompt is outstanding,
      // no new [1465] pass begins. WHICH ACTIVITY resumes explicitly at
      // [3400] from handleActivityKey when Enter is pressed.
      if (activityStep !== null) {
        return;
      }
      // TEMPORARY DIAGNOSTIC (17 July 2026) — explicit try/catch, reported
      // on-page. Both known gates are confirmed clear (activityStep null,
      // outOfRangeRef false), yet runDiveTick's own first-line counter
      // stops advancing — the only remaining explanation is a thrown
      // exception the console isn't surfacing for some reason. This
      // sidesteps that entirely.
      try {
        runDiveTickRef.current();
      } catch (err) {
        setCaughtError(err.message + '\n' + (err.stack || ''));
      }
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

        // [1790] GOTO 3000 — continue this same scheduler pass at 3000.
        // Do it immediately, before the normal interval is enabled, so no
        // extra [1465]/CL increment can occur between [1790] and [3000].
        resumeAt3000Ref.current = true;
        runDiveTickRef.current();
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
    // [5509] GOSUB 5000: PA(1,2)=M — BUG FIX (17 July 2026, per John's
    // report of an instant WORK->ASCEND transition with no visible
    // activity). This assignment was missing entirely: BASIC_M was
    // received and checked for M>0 below, but never actually written
    // anywhere. PA(PA,4)=PA(PA,3) at [5520] then produced a zero-length
    // WORK stage regardless of what bottom time was typed, since the
    // duration this depends on downstream was never carried over.
    // Source sets this unconditionally, before the M>0 branch — so it
    // happens even on the KJ=1 "assume ascent" path below.
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_M;
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

    // DECOMPRESS fidelity: [3035] a recognised activity returns directly
    // to [3400]. The answer is only queued in NA here; [1888] GOSUB 7500
    // and the [2010] NEXT-routine dispatch wait for DECOMPRESS's true event
    // boundary.
    if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 4 && activityStep === 'whichActivity') {
      resumeAt3400Ref.current = true;
      setActivityStep(null);
      setActivityInput('');
      runDiveTickRef.current();
      return;
    }

    // ASCEND fidelity: [3035] a recognised activity returns directly to
    // [3400]. The answer is only queued in NA here; GOSUB 5300/5400/5500/
    // 5600/5700 is deferred to [1800]->[2010] at ASCEND's true boundary.
    if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 2 && activityStep === 'whichActivity') {
      resumeAt3400Ref.current = true;
      setActivityStep(null);
      setActivityInput('');
      runDiveTickRef.current();
      return;
    }

    // REVERTED (28 July 2026) — the AD-snap that was here has been
    // removed. John's challenge (see LOG.md) established it was a
    // corrective shortcut, not a faithful translation: traced against
    // source, AD reaching the target is guaranteed by continued normal
    // ticking after the prompt is answered ([3015]'s CK<>0 shortcut),
    // not by an explicit reset anywhere. Investigation ongoing — see
    // tickTraceLog diagnostic.

    // DEFERRED (28 July 2026) — PA(PA,1)/PA(PA,3) setup moved out of here
    // and into runDiveTick, run once per tick instead of immediately on
    // answering. Source's own sequence (confirmed against [1465]-[1730]
    // and [1890]-[1910]): "WHICH ACTIVITY" answered -> NA recorded ->
    // program returns to the MAIN LOOP -> normal ticking continues,
    // including the [3403]/[3405] AD-clamp -> only later, once CL
    // reaches the TRUE boundary, does PA get built and the transition
    // fire. Setting PA(PA,1) here, immediately, made it truthy on the
    // SAME synchronous call as the keypress — the tick loop's own gate
    // (BASIC_PA[BASIC_PA_scalar][1] being set) was then satisfied the
    // instant the boundary was next reached, with no structural gap for
    // an extra catch-up tick to run in between. See runDiveTick's own
    // new PA-setup block for where this now happens.

    if (matched === 1) {
      gosub_5300_start();
      setActivityInput('');
      return; // stay in prompt mode — do not clear activityStep below
    } else if (matched === 2) {
      if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 3 && activityStep === 'whichActivity') {
        // [3035] During WORK, accepting ASCEND records NA only. WORK remains
        // current until its true event boundary; GOSUB 5400 is dispatched
        // later from the [1800]->[2010] boundary path.
        resumeAt3400Ref.current = true;
        setActivityStep(null);
        setActivityInput('');
        runDiveTickRef.current();
        return;
      }
      gosub_5400();
    } else if (matched === 3) {
      if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 1 && activityStep === 'whichActivity') {
        // [3035] A$(NA)=M$ THEN 3400 — during DESCEND, accepting WORK only
        // records NA. It does not enter GOSUB 5500 here; BOTTOM TIME is
        // reached later from [1800]->[1881]->[2010]->[2085] at the true
        // event boundary, after DESCEND movement (including [3405]) has
        // completed.
        resumeAt3400Ref.current = true;
        setActivityStep(null);
        setActivityInput('');
        runDiveTickRef.current();
        return;
      }
      gosub_5500_start();
      setActivityInput('');
      return; // existing non-DESCEND path; reviewed separately later
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
      {(alDebug || fireCount > 0) && (
        <button
          onClick={() => setShowDiagnostics(v => !v)}
          style={{
            position: 'absolute', bottom: 4, right: 4, zIndex: 1000,
            fontFamily: 'monospace', fontSize: 11,
          }}
        >
          {showDiagnostics ? 'Hide diagnostics ▼' : 'Show diagnostics ▲'}
        </button>
      )}
      {(alDebug || fireCount > 0) && showDiagnostics && (
        <div style={{
          position: 'absolute', bottom: 30, left: 4, right: 4, zIndex: 999, maxHeight: '35vh', overflowY: 'auto',
          background: '#fff', color: '#000', padding: '4px 8px',
          fontFamily: 'monospace', fontSize: 12, border: '2px solid red',
        }}>
          DIAGNOSTIC — fireCount={fireCount} AL_scalar={alDebug?.AL_scalar} AL(AL,1)={String(alDebug?.AL_1)} AL(AL,5)={String(alDebug?.AL_5)} CL={alDebug?.CL} AD={alDebug?.AD} NA={String(alDebug?.NA)} PA(PA,1)={String(alDebug?.PA_1)} PA(PA,2)={String(alDebug?.PA_2)} PA(PA,5)={String(alDebug?.PA_5)} | LIVE activityStep={String(activityStep)} tmEntered={String(tmEntered)}
          <div style={{ marginTop: 4 }}>
            LAST GOSUB 6850 — {nostop6850Debug ? JSON.stringify(nostop6850Debug) : '(not fired yet this run)'}
          </div>
          <div style={{ marginTop: 4 }}>
            LAST GOSUB 6250 — {gosub6250Debug ? JSON.stringify(gosub6250Debug) : '(not fired yet this run)'}
          </div>
          <div style={{ marginTop: 4 }}>
            PROMPT TRIGGER (T34) — {promptTriggerDebug ? JSON.stringify(promptTriggerDebug) : '(not fired yet this run)'}
          </div>
          <div style={{ marginTop: 4 }}>
            TICK TRACE (T34, last 40) —
            {tickTraceLog.map((e, i) => (
              <div key={i}>
                tick={e.tick} CL={e.CL} AD={e.AD} EP={e.EP} AL_scalar={e.AL_scalar} AL(AL,1)={String(e.AL_1)} ES(EP,2)={e.ES_EP_2} activityStep={String(e.activityStep)} CK={e.CK}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 4 }}>
            AD BLOCK TRACE (T34, third pass) —
            {adBlockTraceLog.map((e, i) => (
              <div key={i}>
                tick={e.tick} AL_scalar={e.AL_scalar} AL(AL,1)={String(e.AL_1)} AL(AL,4)={String(e.AL_4)} AD_before={e.AD_before} DR={e.DR} TK={e.TK} willEnter={String(e.willEnter)} AD_after={e.AD_after}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 4 }}>
            {/* DIAGNOSTIC (28 July 2026) — DEF-003 gap investigation.
                Read-only, same pattern as workDots above. Both this and
                workDots' x values are already plotX()-transformed, so
                directly comparable — the actual gap size is
                profileSegs[N].x minus workDots[last].x, not eyeballed.
                Remove once DEF-003 is resolved. */}
            profileSegs — count={profileSegs.length}
            {profileSegs.length > 0 && (
              <> xs=[{profileSegs.map(s => s.x.toFixed(1)).join(',')}]</>
            )}
          </div>
          <div style={{ marginTop: 4 }}>
            {/* DIAGNOSTIC (28 July 2026) — DEF-003 investigation (workDots
                "invisible jump" during WORK). Read-only, computed directly
                from state each render — no new setter, no state change.
                Remove once DEF-003 is resolved. */}
            workDots — count={workDots.length}
            {workDots.length > 0 && (
              <> first.x={workDots[0].x.toFixed(1)} last.x={workDots[workDots.length - 1].x.toFixed(1)} xs=[{workDots.map(d => d.x.toFixed(0)).join(',')}]</>
            )}
          </div>
          <div style={{ marginTop: 4 }}>
            {/* TEMPORARY DIAGNOSTIC (17 July 2026) — same direct override
                DiverSim2's "Force WORK" button uses: overwrite AL(AL,1)
                on the CURRENT entry directly, bypassing PA/ES entirely.
                Lets T24's drawing code be tested independent of the T23
                event-scheduling bugs, per John's suggestion. */}
            <button onClick={() => {
              if (BASIC_AL[BASIC_AL_scalar]) BASIC_AL[BASIC_AL_scalar][1] = 3;
            }}>Force WORK (AL=3), bypass PA/ES</button>
          </div>
          <div style={{ marginTop: 4, borderTop: '1px solid #888', paddingTop: 4 }}>
            ASCEND/FLAT HANDOFF GEOMETRY — last 12 relevant entries:<br />
            {handoffGeometryLog.length === 0
              ? <div>(waiting for ASCEND/DECOMPRESS/REST)</div>
              : handoffGeometryLog.map((line, i) => <div key={i}>{line}</div>)}
          </div>
          <div style={{ marginTop: 4, borderTop: '1px solid red', paddingTop: 4 }}>
            EVENT LOG (most recent last):<br />
            {epLogRef.current.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      )}
      {caughtError && (
        <div style={{
          position: 'absolute', top: 4, right: 4, zIndex: 999,
          background: '#000', color: '#f00', padding: '8px',
          fontFamily: 'monospace', fontSize: 11, border: '2px solid red',
          maxWidth: 500, whiteSpace: 'pre-wrap',
        }}>
          CAUGHT ERROR: {caughtError}
        </div>
      )}
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

        {/* [1362–1368] NOSTOP — green on black, cols 69-74, row 2 of DM,
            char by char. FIXED 17 July 2026 (John's report): this and
            GOSUB 6950's STOP10/STOP 5 (below) occupy the identical six
            cells (IDs 1-6) — on real hardware, writing new characters
            there physically overwrote NOSTOP's pixels; two independent,
            always-on SVG elements at the same coordinates don't get that
            for free, so both were drawing at once. Gating NOSTOP on
            stopCells being empty reproduces the overwrite: NOSTOP shows
            until GOSUB 6950 first writes here (HT becomes non-zero), then
            gives way permanently, matching source (which never blanks
            these cells back to NOSTOP once written). */}
        {stopCells.length === 0 && nostopCells.slice(0, nostopCount).map((c, i) => (
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
            // DEPTH_DIGIT_NUDGE (17 July 2026, per John): the generic
            // gosub_7000 column grid (confirmed pixel-perfect for STOP10
            // earlier today) put the depth digits' own centre 3.6px left
            // of the depth-trend bar's centre directly beneath them —
            // computed as (TREND_X + BAR22_W/2) - digit-pair's own
            // original centre. Visual alignment only; doesn't change
            // gosub_7000's formula itself, which remains correct as the
            // generic case — this is a small, targeted correction for
            // this one two-character group sitting directly above a
            // separately-calibrated element.
            x={c.x + (W / 80) / 2 + 3.6}
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
          ) : null
        ))}

        {/* [6950] STOP10/STOP 5 — same row (row 4) as the depth digits
            (IDs 19-20), different columns, so same y-formula as those,
            not boundCells' multi-line offset above. */}
        {stopCells.map((c, i) => (
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

        {/* [6320] GOSUB 6300 Branch 1 — descent profile, one bar per fixed time-axis column */}
        {/* CONFIRMED against photograph 03 July 2026 (ticks 1-3; see LOG T18). Final colour: black. */}
        {profileSegs.map((s, i) => (
          s.kind === 'line'
            ? <line key={i} x1={s.x} y1={s.y} x2={s.x2} y2={s.y}
                stroke={s.colour} strokeWidth={2} strokeLinecap="butt" />
            : <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.colour} />
        ))}

        {/* [6510]/[6525] GOSUB 6300 Branch 2 — coloured band bars. Ported
            from DiverSim2 sandbox, CONFIRMED against photograph 17 July
            2026 (column heights, boundaries, step cadence). Rendered
            before the work dot so the dot stays visible on top. */}
        {bandSegs.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.colour} />
        ))}

        {/* [6591] PLOT 2,253,X3,Y3,255 — diver's position track, Branch 2
            (WORK). REVISED 17 July 2026 per John's observation: a
            strokeDasharray on each individual segment didn't read as
            broken, because each segment is only ~3px long (one column's
            width) — too short to complete even one dash-gap cycle, so it
            just rendered solid. Skipping alternate in-band segments
            instead produces the dash/space pattern at the actual column
            spacing, which is visible. Out-of-band segments still draw
            every one, for a contiguous solid line. */}
        {workDots.slice(1).map((d, i) => {
          const prev = workDots[i]; // workDots[i] is the point before d, since we sliced from index 1
          const inBand = prev.inBand || d.inBand;
          if (inBand && i % 2 === 1) return null; // skip alternate in-band segments for a visible dash/space
          return (
            <line
              key={i}
              x1={prev.x} y1={prev.y} x2={d.x} y2={d.y}
              stroke="#050505" strokeWidth={2}
            />
          );
        })}

        {/* [6763] OUT OF RANGE — moved 17 July 2026. Previously small
            (10px) text tucked into the header near the DM box, where
            John reported the sim looking "frozen" with no visible
            message when this fired — it may well have been rendering
            correctly but rendered small/early enough to be missed or
            covered. Large, centred in the open ocean area, rendered
            last so nothing else can paint over it. */}
        {boundCells.outOfRange && (
          <text
            x={W / 2}
            y={H / 2 + 40}
            fill={RED}
            fontSize={28}
            fontWeight="bold"
            fontFamily={DM_FONT_FAMILY}
            textAnchor="middle"
          >
            OUT OF RANGE
          </text>
        )}

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
