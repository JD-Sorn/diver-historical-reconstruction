// DIVER SIMULATION MODEL — React/JSX reconstruction
// Overall design: Dagfinn Aksnes, for his Master of Design project as a student at the Royal College of Art, London, 1978–79
// Original BASIC implementation: Dr George Mallen
// Reconstruction: John Dunlop
// AI development assistance: ChatGPT and Claude
// Version: v13

import { useState, useEffect, useRef } from "react";


// ── SVG viewport ──────────────────────────────────────────────
const W = 480;
const H = 400;

// BASIC numeric PRINT formatting.
function basicPrintNumber(value) {
  if (!Number.isFinite(value)) return String(value);

  // Reduce only the textual representation, not the stored/calculated value.
  let s = Number.parseFloat(value.toPrecision(12)).toString();

  // Compucolor BASIC suppresses the leading zero on fractions: .1, -.1.
  if (s.startsWith("0.")) s = s.slice(1);
  else if (s.startsWith("-0.")) s = "-" + s.slice(2);

  // Positive numbers reserve the sign position in BASIC PRINT output.
  return value >= 0 ? ` ${s}` : s;
}

// ── Runtime: coordinate helpers (Domain 2 — plot graphics) ───
// SVG_x = plotX * (480/159) ≈ 3.019
// SVG_y = 400 - plotY * 2.094
const plotX = x => x * (W / 159);
const plotY = y => H - y * (H / 191);

// ── Runtime: CCI colour map ───────────────────────────────────
// CCI codes to SVG hex.
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

// [1] REM DIVER — the original program title in the BASIC listing. REM is
// non-executable, so no runtime behaviour requires a JSX counterpart.
// Historical Note, not a gap.

// [100] CLEAR 20 — 1979 BASIC interpreters required string space to be
// explicitly reserved upfront (here, 20 bytes) since memory wasn't
// dynamically managed; JS strings need no such reservation, so this has
// no functional JSX counterpart. Historical Note, not a gap.

// [200-280] READ the 21x7 decompression table into DT.
// [300-700] DATA statements contain the table values.
// [720-760] READ five activity names into A$(1..5).
// [780] DATA DESCEND,ASCEND,WORK,DECOMPRESS,REST.
// JSX stores these same values directly as initialized arrays/constants, so
// the BASIC READ/DATA loading mechanism has no separate runtime translation.
// Historical structure is preserved here by consolidated citation.

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
const BG    = CCI[20];  // blue  — set by CCI byte 39 (BG bits)
const CYAN  = CCI[22];  // cyan  — set by Code 22 (flag background)
const WHITE = CCI[23];  // white — set by CCI byte 39 (FG bits)

// [1040–1100] FOR I=0 TO 5 loop:
// [1050] FOR J=0 TO 78: PRINT " " — 79 spaces, each printed with cyan
// [1080] Y1 = 191 - 8*I
// [1085] YO = Y1 - 7
// [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255
// [1095] PRINT — newline (advances cursor to next row)
// [1100] NEXT I: PLOT 30,16 — sets black background colour

const printCells = [];
let BASIC_I, BASIC_J, BASIC_Y1, BASIC_YO;

// [1040]
for (BASIC_I = 0; BASIC_I <= 5; BASIC_I++) {

  // [1050]
  for (BASIC_J = 0; BASIC_J <= 78; BASIC_J++) {

    // [1060] PRINT " "
    // background colour (cyan, set by PLOT 6,39 … 22 at line 1010).
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

  // [1095] PRINT — newline; cursor advances to col 0 of next row.

  // [1100] NEXT I
}

// [1090] FRAME bar — single white rect, x=474, y=0, w=6, h=96.
const FRAME = {
  x: 474,   // col 79 x 6px
  y: 0,
  w: 6,     // one character cell wide
  h: 96,    // cyan/blue boundary = 6 rows x 16px
};

// ── Lines 1210–1260: DM box ───────────────────────────────────
// [1210] FOR I=1 TO 5
// [1230]   PLOT 3,66,I*2  — cursor to col 66, row I*2 (rows 2,4,6,8,10)
// [1240]   FOR J=66 TO 78
// [1250]     PRINT " ";   — 13 black spaces, semicolon keeps cursor on same row
// [1255]   NEXT J
// [1260] NEXT I
const BLACK = CCI[16];
const MAGENTA = CCI[21];  // #CC00CC
const DARK  = "#080818";  // cleared bar blocks

const DM_X = 396;   // col 66 x 6px
const DM_Y = 16;    // row 1 x 16px
const DM_W = 78;    // 13 cols x 6px
const DM_H = 80;    // 5 rows x 16px

const DM_COLS  = 12;
const DM_CW    = DM_W / DM_COLS;   // ~6.5px per column
const DM_CH    = DM_H / 6;         // ~13.3px per row

const BAR22_X   = DM_X + 1;
const BAR22_W   = DM_CW * 1.2;
const BAR22_BLK = 4;                // block pitch in px (block + gap)
const BAR22_H   = BAR22_BLK * 18;  // total height derived from block count    // 18 blocks total

// Source (lines 7200-7240) uses raw plot X varying / Y
const TREND_X       = DM_X + DM_W - 6 - DM_CW;
const TREND_BLK     = 4;
const TREND_COUNT   = 10;  // [7200] FOR I=1 TO 10 — baseline block count

const dmCells = [];
let BASIC_I2, BASIC_J2;

// [1210]
for (BASIC_I2 = 1; BASIC_I2 <= 5; BASIC_I2++) {

  // [1230] PLOT 3,66,I*2 — cursor to col 66, row I*2; no SVG output

  // [1240]
  for (BASIC_J2 = 66; BASIC_J2 <= 78; BASIC_J2++) {

    // [1250] PRINT " "; — one black character cell, semicolon holds row
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
// [1261] PLOT 8,2    — purpose
// [1261] PLOT 14,15  — Code 14: extended character set. Byte 15 = small
// [1262] PLOT 27,10  — vertical mode on
// [1262] PLOT 27,10
// [1263] PRINT "5 METRE UNITS"; — 13 characters, vertical, cyan on blue
// [1264] PLOT 27,11  — vertical mode off / scroll mode
// [1264] PLOT 27,11

const BASIC_VERT_STR = "5 METRE UNITS";
const VERT_X = 3 * (W / 80);   // col 3 -> SVG x=18px
const VERT_Y = 400 - 130 * (H / 191);  // plotY=130 -> SVG y~127.8px

// ── Lines 1265–1266: attempted title text — NOT VISIBLE on hardware/CCEMU ──
// [1265] PRINT
// [1265] PLOT 3,29,43
// [1265] PRINT "DIVER SIMULATION MODEL."
// [1266] PLOT 3,29,44
// [1266] PRINT "-----------------------"

const BASIC_TITLE   = "DIVER SIMULATION MODEL.";
const BASIC_UNDERLINE = "-----------------------";
const TITLE_X = 29 * (W / 80);
const TITLE_Y1 = 11 * (H / 25);
const TITLE_Y2 = 12 * (H / 25);

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
// [1277] PLOT 255 — exits Plot Mode back to text mode on the real
// terminal, where both share one stateful serial protocol; leaving Plot
// Mode active would corrupt subsequent text. JSX has no equivalent
// because SVG drawing and DOM text are structurally separate here —
// there's no shared mode to exit. Historical Note, not a gap.

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

// ── Lines 1346–1348: time axis tick marks ─────────────────────
// [1346] PLOT 6,38        — CCI byte 38: BG=blue FG=cyan
// [1346] PLOT 2,246,34    — Code 2 (X Bar Graph), plotY origin=34
// [1346] FOR I=1 TO 150 STEP XS*10  — at XS=2.0: I=1,21,41,...,141
// [1348]   PLOT I+10,35   — tick at plotX=I+10, plotY=35
// [1348] NEXT I : PLOT 255

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
      h: (plotY(34) - plotY(35)) * 2,
    });
  }
  return ticks;
}

// ── Lines 1360–1361: "TIME AT 10 MINUTE INTERVALS" label ─────
// [1360] PLOT 3,27,40  — col 27, Y=40. Y-masking (AND 0x1F) gives row 8
// [1361] PRINT "TIME AT 10 MINUTE INTERVALS"
// Colour: cyan on blue (CCI byte 38 still active from line 1261).

const BASIC_TAXIS_LABEL = "TIME AT 10 MINUTE INTERVALS";
const TAXIS_LABEL_X = 27 * (W / 80);   // col 27 -> SVG x=162px
const TAXIS_LABEL_Y = 21 * (H / 25);   // row 21 -> SVG y=336px, immediately

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

const GREEN = CCI[18];

const NOSTOP_FONT = 11;

const DM_LINE_HEIGHT = 17.0;

// GOSUB 7000 places the three DM text bands at BASIC rows 4, 7 and 9
// ([7145], [7150], [7160]). The normal-character CCEMU
const DM_TEXT_ROW1_Y = DM_Y + 13 + NOSTOP_FONT;
const DM_BASIC_ROW_PITCH = (2 * DM_LINE_HEIGHT) / (9 - 4);
const DM_TEXT_ROW3_EXTRA = 4;
const dmTextYFromBasicRow = (basicRow) => {
  const y = DM_TEXT_ROW1_Y + (basicRow - 4) * DM_BASIC_ROW_PITCH;
  return basicRow >= 9 ? y + DM_TEXT_ROW3_EXTRA : y;
};

const NOSTOP_CHAR_W = NOSTOP_FONT * 0.62;           // ≈8.6px per character
const NOSTOP_X = DM_X + 2.5 * NOSTOP_CHAR_W;

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
  nostopCells.push({
    ch: String.fromCharCode(BASIC_VA),
    x: NOSTOP_X + n * NOSTOP_CHAR_W,   // spaced by actual char width from DM col 3
    y: DM_Y + 13,
    fontSize: NOSTOP_FONT * 2,
  });
}
const FONT_SIZE = 10;

const DM_FONT_FAMILY = "BedsteadBoldUltraCondensed, monospace";

const VERT_FONT_SIZE = (400 - 80 * (H / 191)) - (400 - 130 * (H / 191));
const VERT_FONT_SIZE_PX = FONT_SIZE;

const vertCells = Array.from(BASIC_VERT_STR).map((ch, idx) => ({
  ch,
  x: VERT_X,
  y: VERT_Y + idx * VERT_FONT_SIZE_PX,
}));

const PRINT_INTERVAL_MS = 3;

// ── GOSUB 7000 — Display Monitor ──────────────────────────────
// [7100] IF FL=1 THEN FL=64
// [7110] PLOT 14 — extended character set
// [7120] IF ID=22 THEN 7300 — air gauge (Domain 2
// [7130] IF ID=21 THEN 7200 — depth trend bar (Domain 2
// [7131] IF ID>=19 THEN 7250 — depth digits: PLOT 6,1+FL,3,57+ID,4
// [7135] IF ID>=13 THEN 7160 — row 3: PLOT 3,56+ID,9
// [7140] IF ID>=7  THEN 7150 — row 2: PLOT 3,62+ID,7
// [7145] else      — row 1: PLOT 3,68+ID,4
// [7170] PLOT VA — print character

const RED = CCI[17];

// ── GOSUB 7000 ────────────────────────────────────────────────
// [7000] REM SUB DISPLAY MONITOR
function gosub_7000(BASIC_ID, BASIC_VA, BASIC_FL, BASIC_CO) {
  // [7100]
  if (BASIC_FL === 1) BASIC_FL = 64;

  // [7120] ID=22 — air gauge
  if (BASIC_ID === 22) return { type: 'air', va: BASIC_VA, fl: BASIC_FL };

  // [7130] ID=21
  // lines 7200-7204) draws unconditionally in source; only the overlay
  if (BASIC_ID === 21) {
    return { type: 'trend', va: BASIC_VA, fl: BASIC_FL };
  }

  // [7131] ID>=19 — depth digits: col=57+ID, row=4
  // [7250] PLOT 6,1+FL, 3,57+ID, 4
  let BASIC_col, BASIC_row;
  if (BASIC_ID >= 19) {
    // [7260] GOTO 7170 — depth-digit path rejoins common VA validation/output.
    BASIC_col = 57 + BASIC_ID;
    BASIC_row = 4;
  // [7135] ID>=13 — row 3: col=56+ID, row=9
  } else if (BASIC_ID >= 13) {
    BASIC_col = 56 + BASIC_ID;
    BASIC_row = 9;
  // [7140] ID>=7 — row 2: col=62+ID, row=7
  } else if (BASIC_ID >= 7) {
    BASIC_col = 62 + BASIC_ID;
    BASIC_row = 7;
  // [7145] ID<7 — row 1: col=68+ID, row=4
  } else {
    BASIC_col = 68 + BASIC_ID;
    BASIC_row = 4;
    // [7147] IF CO=1 THEN 7149 — colour choice is applied below.
  }

  // [7170] clamp VA
  let BASIC_VA_clamped = BASIC_VA;
  if (BASIC_VA_clamped > 95) BASIC_VA_clamped = 63;
  // [7175] IF VA<32 THEN VA=63
  if (BASIC_VA_clamped < 32) BASIC_VA_clamped = 63;

  // [7148-7149,7165-7168,7250] GOSUB 7000 colour selection is
  // CCI 2 (green) for IDs 1-18. FL=1 becomes bit 64 at [7100]
  let color;
  if (BASIC_ID >= 19) {
    color = RED;
  } else if (BASIC_CO === 1) {
    color = GREEN;
  } else if (BASIC_ID >= 7) {
    color = CCI[19];
  } else {
    color = CCI[21];
  }

  // [7195] GOTO 7440 — ordinary text path skips the bar-graph branches.
  // [7440] PLOT 15:FL=0; [7450] PLOT 3,80,0; [7451] RETURN — terminal mode/cursor cleanup and exit.
  return {
    type:  'text',
    ch:    String.fromCharCode(BASIC_VA_clamped),
    x:        BASIC_col * (W / 80),
    y:        BASIC_row * (H / 25),
    basicRow: BASIC_row,
    color,
    blink:    BASIC_FL === 64,
  };
}

// ── GOSUB 6200 ────────────────────────────────────────────────
// [6200] REM SUBROUTINE DISPLAYS "AIR OK"
// [6205-6240] Writes AIR OK to DM IDs 13-18 via GOSUB 7000.
function gosub_6200() {
  const BASIC_FL = 0;
  const BASIC_CO = 1;
  const chars = [65, 73, 82, 32, 79, 75]; // "AIR OK"
  const cells = [];
  for (let i = 0; i < chars.length; i++) {
    const BASIC_ID = 13 + i;
    const c = gosub_7000(BASIC_ID, chars[i], BASIC_FL, BASIC_CO);
    if (c) cells.push({ ...c, line: 3 });
  }
  return { cells };
}

// ── GOSUB 6900 — SUB DISPL DECOMP RQMNTS ────────────────────
// [6900] REM SUB DISPL DECOMP RQMNTS
// Called from [5503] immediately before each staged-WORK
// (row 2) only when D5+DX is non-zero. Source [6910]-[6949].
function gosub_6900() {
  // [6910] IF D5+DX=0 THEN 6949
  let BASIC_I6900 = BASIC_D5 + BASIC_DX;
  if (BASIC_I6900 === 0) return { cells: [] };

  const cells = [];
  // [6921] FL=0:CO=0
  let BASIC_FL6900 = 0;
  const BASIC_CO6900 = 0;
  const put = (id, va, fl = BASIC_FL6900) => {
    const c = gosub_7000(id, va, fl, BASIC_CO6900);
    if (c) cells.push({ ...c, line: 2 });
  };

  // [6924] ID=7:VA=84:GOSUB 7000 — 'T'
  put(7, 84, 0);

  // [6925] I=D5+DX; [6927] VA=INT(I/10)+48; [6929] suppress leading zero.
  // [6930] FL=1; [6931] ID=8:GOSUB 7000; [6932] FL=1; [6933] ID=9 units:GOSUB 7000.
  let va = Math.floor(BASIC_I6900 / 10) + 48;
  if (va === 48) va = 32;
  BASIC_FL6900 = 1;
  put(8, va, 1);
  put(9, BASIC_I6900 - Math.floor(BASIC_I6900 / 10) * 10 + 48, 1);

  // [6937] ID=10:FL=0:VA=62:GOSUB 7000 — '>' separator.
  BASIC_FL6900 = 0;
  put(10, 62, 0);

  // [6938] I=I+5; [6939] values over 30 become -60 (displayed as "*").
  // [6942] form tens; [6943] suppress zero; [6944] ID=11:GOSUB 7000; [6948] ID=12 units:GOSUB 7000.
  BASIC_I6900 += 5;
  if (BASIC_I6900 > 30) BASIC_I6900 = -60; // displayed as '*' by 7000 clamp
  va = Math.floor(BASIC_I6900 / 10) + 48;
  if (va === 48) va = 32;
  put(11, va, 1);
  put(12, BASIC_I6900 - Math.floor(BASIC_I6900 / 10) * 10 + 48, 1);

  return { cells };
}

// ── Line 1445 GOSUB 6600 — initial depth gauge ────────────────
// [6600] Called at line 1445 with AD=0, AY=-1, FL=0.
// [6601] PLOT 29
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

function gosub_6600(BASIC_AD) {
  // Both are computed within this one GOSUB (its own REM title, "SUB DEPTH
  const digitCells = [];
  const trendCells = [];
  let BASIC_FL = 0;
  let BASIC_VA, BASIC_ID;

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

  // [6699] RETURN
  return { digitCells, trendCells };
}

// ── GOSUB 6950 — display next ascent stop ──────────────────────
// [6950] REM SUB DISPLAYS NEXT HT TO STOP AT WHEN ASCENDING
// [6955] Return without output when HT=0.
// [6956-6962] Write DM IDs 1-6 as "STOP10" when DX<>0,
// otherwise as "STOP 5".
// Called from the WORK-initiation path at [1693] and again at [1694],
// after GOSUB 6100 has established the current decompression requirement.
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

// [7500] REM SUB WHEN FINISHED DECOMP.
function gosub_7500() {
  // [7502] CO=0:FL=0
  let BASIC_CO = 0;
  const BASIC_FL = 0;
  const row2Cells = [];
  const stopCells = [];
  let c;

  // [7505] Clear IDs 7-12 when a decompression stop finishes.
  for (let BASIC_ID = 7; BASIC_ID <= 12; BASIC_ID++) {
    c = gosub_7000(BASIC_ID, 32, BASIC_FL, BASIC_CO);
    if (c) row2Cells.push({ ...c, line: 2 });
  }

  // [7510] IF HT=10 THEN 7536
  if (BASIC_HT === 10) {
    // [7536]-[7545] After the 10m stop, preserve STOP in IDs 1-4
    c = gosub_7000(5, 32, BASIC_FL, BASIC_CO); if (c) stopCells.push(c);
    c = gosub_7000(6, 53, BASIC_FL, BASIC_CO); if (c) stopCells.push(c);
  } else {
    // [7515] CO=1
    BASIC_CO = 1;
    // [7520] IDs 1-2="AS"; [7525] IDs 3-4="CE"; [7530] IDs 5-6="ND".
    const chars = [65, 83, 67, 69, 78, 68];
    for (let i = 0; i < chars.length; i++) {
      c = gosub_7000(1 + i, chars[i], BASIC_FL, BASIC_CO);
      if (c) stopCells.push(c);
    }
    // [7535] GOTO 7549 — skip the STOP-5 rewrite used by the HT=10 branch.
  }

  // [7549] HT=HT-5
  BASIC_HT = BASIC_HT - 5;
  return { row2Cells, stopCells };
}

// ── GOSUB 6100 ────────────────────────────────────────────────
// [6100] REM SUB TESTS IF DECOMP BOUND WILL BE CROSSED BETWEEN LAST WORK-END & WHEN
// [6101-6102] Continues the source REM description: updates HT, DX and D5 for the next ascent after WORK.
function gosub_6100() {
  // [6125] I=INT((AL(AL,3)-7)/2)
  let BASIC_I = Math.floor((BASIC_AL[BASIC_AL_scalar][3] - 7) / 2);
  // [6127] IF I<1 THEN I=1
  if (BASIC_I < 1) BASIC_I = 1;

  // [6135] FOR J=1 TO 7
  let BASIC_J = null;
  for (let J = 1; J <= 7; J++) {
    // [6140] IF DT(I,J)=999 THEN 6181
    if (BASIC_DT[BASIC_I][J] === 999) {
      return { outOfRange: true };
    }
    // [6145] IF WE<=DT(I,J) THEN 6165
    if (BASIC_WE <= BASIC_DT[BASIC_I][J]) {
      BASIC_J = J;
      break;
    }
    // [6150] NEXT J
  }
  // [6155] GOTO 6181: REM O.R. — no qualifying J found.
  if (BASIC_J === null) {
    // [6181] PRINT "OUT OF RANGE":STOP
    return { outOfRange: true };
  }

  // [6165] FOR L=1 TO 7
  let BASIC_L = null;
  for (let L = 1; L <= 7; L++) {
    // [6170] IF DT(I,L)=999 THEN 6181
    if (BASIC_DT[BASIC_I][L] === 999) {
      return { outOfRange: true };
    }
    // [6175] IF AL(AL,7)<=DT(I,L) THEN 6185
    if (BASIC_AL[BASIC_AL_scalar][7] <= BASIC_DT[BASIC_I][L]) {
      BASIC_L = L;
      break;
    }
    // [6180] NEXT L
  }
  if (BASIC_L === null) {
    // [6181] PRINT "OUT OF RANGE":STOP
    return { outOfRange: true };
  }

  // GOSUB 6850. Not done on the outOfRange returns above — the original
  // STOPs on those (line 6181), so 6850 is never reached in that case
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
  // [6199] RETURN
  return { outOfRange: false };
}

// [6850] SUB INITIALISES NOSTOP/TIME TO NEXT BOUND. Called from [1694]
// WORK-initiation only (paired with GOSUB 6950, called both immediately
// [6851] CO=0:FL=0:II=0 — II here is a LOCAL scratch column-offset (0
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
function gosub_6850() {
  const BASIC_CO = 0, BASIC_FL = 0;

  // Shared digit-writer, [6855]-[6861] in source. Writes six DM cells
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
    return { cells: writeBoundTime(0, BASIC_NN) };
  }

  // Branch B — [6872]-[6880]: "T" + total decompression (D5+DX) required
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

  // [6875] GOSUB 7000 writes the units digit after the tens digit of D5+DX.
    // [6878] ID=II+10:VA=58:GOSUB 7000
  BASIC_VA = 58;
  c = gosub_7000(10, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });
  // [6879] ID=II+11:GOSUB 7000 — VA remains 58.
  c = gosub_7000(11, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });
  // [6880] ID=II+12:GOSUB 7000 — VA remains 58.
  c = gosub_7000(12, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 2 });

  // [6881] II=6:NN=DT(I,L)-CL: IF NN<0 THEN NN=0
  let BASIC_NN2 = BASIC_DT[BASIC_I6][BASIC_L2] - BASIC_CL;
  if (BASIC_NN2 < 0) BASIC_NN2 = 0;
  // [6882] GOTO 6855 — reuse the shared digit-writer for DM row 3.
  cells.push(...writeBoundTime(6, BASIC_NN2));

  return { cells };
}

// ── GOSUB 6250 — display decompression requirement at this depth ──
// [6250] REM SUB DISPLAYS DECOMP RMTS TO BE SATISFIED AT THIS DEPTH
// Called at [1701] when a DECOMPRESS activity is initiated.
// [6257] Return without output when HT<=5.
// [6260] Assigns I=D5, or I=DX when HT=10; I is not subsequently
// read by this routine and is preserved here as written in the BASIC.
// [6261-6285] Write DM IDs 13-18 as "5M " followed by D5 and ":".
function gosub_6250() {
  // [6257] IF HT<=5 THEN 6299 — no-op past the first decompression stage.
  if (BASIC_HT <= 5) {
    return { cells: [] };
  }

  // [6258] CO=0:FL=0
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
  BASIC_VA = BASIC_D5 - Math.floor(BASIC_D5 / 10) * 10 + 48;

  // [6285] GOSUB 7000 (flush 6280): ID=18:VA=58 (':'):GOSUB 7000
  c = gosub_7000(17, BASIC_VA, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });
  c = gosub_7000(18, 58, BASIC_FL, BASIC_CO);
  if (c) cells.push({ ...c, line: 3 });

  // [6299] RETURN
  return { cells };
}

// ── GOSUB 6800 ────────────────────────────────────────────────
// [6800] REM SUB COUNTS DOWN TOTAL DT RQMNTS
function gosub_6800() {
  // [6804] CO=0:FL=0
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
    // [6815] D5=D5-TK:GOTO 6825
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
  // tens-digit line in the file (e.g. [6859], [6785]). Translated
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

// ── GOSUB 6750 ────────────────────────────────────────────────
// [6750] REM SUB DISPL. NOSTOP TIME REMAIN OR REMAIN TIME TO NXT BOUND.
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

  // [6754] J=INT(WM-7)/2 — the original evaluates INT(WM-7) first.
  // CCEMU execution confirms positive fractional array subscripts are truncated
  // when DT(J,...) is evaluated: J=16.5 selects row 16, J=1.5 selects row 1.
  let BASIC_J = Math.floor(BASIC_WM - 7) / 2;
  if (BASIC_J < 1) BASIC_J = 1;
  const dtRow = Math.trunc(BASIC_J);

  // [6755]
  BASIC_NS = BASIC_DT[dtRow][1] - BASIC_CL - BASIC_TK;
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
// [6700] REM SUB AIR LEFT.
// [6710] REM THIS IS DUMMY RATE OF USAGE FOR DISPLAY ONLY — the gauge is explicitly a display-only consumption model.
// [6720] ID=22 selects the air bar in GOSUB 7000.
// [6725] VA=13-INT(CL*XS/10) — at CL=0, XS=2.0: VA=13
// [6730] IF VA<0 THEN RETURN
// [6731] IF LA=VA THEN RETURN — LA=0 initially, proceed
// [6732] LA=VA
// [6740] GOSUB 7000 — routes to line 7300 (ID=22 air gauge bar)
// highest green block). VA's dummy formula (line 6725) never exceeds 13

// [8000] REM MEMORY — end-of-dive display.
// [8010] AD=WD:GOSUB 6600:GOSUB 6700
// deliberately no GOSUB 6750 here, so MEMORY does not calculate/redraw
function gosub_8000() {
  // [8010] AD=WD:GOSUB 6600:GOSUB 6700
  BASIC_AD = BASIC_WD;
  const depth = gosub_6600(BASIC_AD);
  const air = gosub_6700(BASIC_CL, BASIC_XS);

  let BASIC_CO = 1;
  let BASIC_FL = 0;
  const cells = [];
  const put = (id, va, line) => {
    const c = gosub_7000(id, va, BASIC_FL, BASIC_CO);
    if (c) cells.push({ ...c, line });
  };

  // [8020-8060] IDs 1-6: saved BT, formatted as HMM:SS.
  let BASIC_VA = Math.floor(BASIC_BT / 100) + 48;
  if (BASIC_VA === 48) BASIC_VA = 32;
  put(1, BASIC_VA, 1);
  let BASIC_I = Math.floor(BASIC_BT - Math.floor(BASIC_BT / 100) * 100);
  BASIC_VA = Math.floor(BASIC_I / 10) + 48;
  if (BASIC_VA === 48) BASIC_VA = 32;
  put(2, BASIC_VA, 1);
  BASIC_VA = BASIC_I - Math.floor(BASIC_I / 10) * 10 + 48;
  put(3, BASIC_VA, 1);
  put(4, 58, 1);
  BASIC_I = (BASIC_BT - Math.floor(BASIC_BT)) * 60;
  BASIC_VA = Math.floor(BASIC_I / 10) + 48;
  put(5, BASIC_VA, 1);
  BASIC_VA = BASIC_I - Math.floor(BASIC_I / 10) * 10 + 48;
  put(6, BASIC_VA, 1);

  // [8062] IF WM<10 THEN NS=0
  if (BASIC_WM < 10) BASIC_NS = 0;

  if (BASIC_NS >= 0) {
    // [8064] blank row 2; NS=0 then returns without touching row 3.
    BASIC_VA = 32;
    for (let id = 7; id <= 12; id++) put(id, BASIC_VA, 2);
    if (BASIC_NS !== 0) {
      // [8065-8073] row 3: RNS + NS.
      BASIC_CO = 0;
      put(13, 82, 3); put(14, 78, 3); put(15, 83, 3);
      BASIC_VA = Math.floor(BASIC_NS / 100) + 48;
      if (BASIC_VA === 48) BASIC_VA = 32;
      put(16, BASIC_VA, 3);
      BASIC_I = BASIC_NS - Math.floor(BASIC_NS / 100) * 100;
      BASIC_VA = Math.floor(BASIC_I / 10) + 48;
      if (BASIC_NS < 100 && BASIC_VA === 48) BASIC_VA = 32;
      put(17, BASIC_VA, 3);
      BASIC_VA = BASIC_I - Math.floor(BASIC_I / 10) * 10 + 48;
      put(18, BASIC_VA, 3);
    }
  } else {
    // [8074] restore saved decompression requirements.
    BASIC_D5 = BASIC_E5;
    BASIC_DX = BASIC_EX;

    // [8075-8078] row 2: 10M + DX.
    BASIC_CO = 1;
    put(7, 49, 2); put(8, 48, 2); put(9, 77, 2);
    BASIC_CO = 0;
    BASIC_VA = Math.floor(BASIC_DX / 10) + 48;
    if (BASIC_VA === 48) BASIC_VA = 32;
    put(10, BASIC_VA, 2);
    BASIC_VA = BASIC_DX - Math.floor(BASIC_DX / 10) * 10 + 48;
    put(11, BASIC_VA, 2);
    put(12, 58, 2);

    // [8080-8090] row 3: 5M + D5.
    BASIC_CO = 1;
    put(13, 53, 3); put(14, 77, 3); put(15, 32, 3);
    BASIC_CO = 0;
    BASIC_VA = Math.floor(BASIC_D5 / 10) + 48;
    if (BASIC_VA === 48) BASIC_VA = 32;
    put(16, BASIC_VA, 3);
    BASIC_VA = BASIC_D5 - Math.floor(BASIC_D5 / 10) * 10 + 48;
    put(17, BASIC_VA, 3);
    // [8090] ID=18:VA=32:GOSUB 7000 — trailing blank.
    put(18, 32, 3);
  }

  // [8100] RETURN
  return { depth, air, cells };
}

function gosub_6700(BASIC_CL, BASIC_XS) {
  // [6725]
  let BASIC_VA = 13 - Math.floor(BASIC_CL * BASIC_XS / 10);

  // [6730]
  if (BASIC_VA < 0) return [];

  // [6732] LA=VA — stored externally; skip [6731] LA=VA check at init (LA=0, VA=13)

  // [6740] GOSUB 7000 — ID=22 branches at [7120] to the air-bar routine.
  // [7300] REM — source entry point for the ID=22 air-bar branch.
  // [7301-7304] The BASIC first clears all 18 gauge blocks to background.
  // [7305-7308] It then redraws the fixed lower three-block marker using
  // PLOT 6,5; the JSX one-pass representation is one dark and two magenta
  // blocks, matching the verified original display.
  // [7310] If INT(VA)=0 the BASIC skips the variable fill.
  // [7315-7340] Otherwise it draws VA variable blocks using colour 2+FL.
  // The JSX constructs the same complete 18-block result in one pass.
  // [7304], [7308], [7342] PLOT 255 exits Plot Mode after each BASIC pass;
  // SVG has no shared terminal Plot Mode to exit. Historical Note, not a gap.
  // [6745] RETURN is represented by the early exits and the function return below.
  // [6746] REM *********** — source divider; no executable effect.
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

// [1278] PRINT CHR$(7):GOTO 1280 — sounds the terminal's physical bell
// as the initial audible prompt cue, then skips the alternate re-entry at
// [1279]. JSX preserves this with a one-shot bell() call when the initial
// WORKING DEPTH prompt becomes visible.
// [1279 — handwritten insertion in the surviving manuscript]
// PLOT 3,0,0:PRINT CHR$(7); — homes the cursor and sounds the terminal bell
// on invalid-WD re-entry before falling through to [1280].
// [1280] M$="WORKING DEPTH " : GOSUB 5000 : WD=M
// GOSUB 5000: PLOT 6,48 (BG=cyan FG=black), PLOT 3,0,0
// PRINT M$; INPUT M, PLOT 3,0,0, PRINT "              "
// [1281 — handwritten manuscript amendment] The branch target is changed
// from printed 1278 to 1279, creating the distinct invalid-input re-entry.

let BASIC_WD;  // [1280] Working depth — set by user input, validated at line 1281

// ── Lines 1300–1355: variable initialisations and time mode ───
// [1300] DR=30, AR=15, AD=0, CL=0
// [1301] WM=0, LM=0
// [1303–1308] Time mode prompt — INPUT "TIME MODE (REAL OR ACCELERATED)? "
// [1308 — handwritten manuscript addition] ":GOTO 1316" is added to the
// printed TK=.25 line, making the ACCELERATED path jump explicitly to [1316].
// [1316] IK=TK; [1317] IF IK<0.5 THEN IK=0.5
// [1320] XS=1, LA=0
// [1330] IF WD<17 THEN XS=0.5
// [1340] IF WD>20 THEN XS=2.0   (at WD=40: XS=2.0)
// [1345] YS=2
// [1349] WE=0, HT=0, D5=0, DX=0
// [1350] AY=-1
// [1355] BT=0

let BASIC_DR, BASIC_AR, BASIC_AD, BASIC_CL;
let BASIC_WM, BASIC_LM, BASIC_NS;
let BASIC_TK, BASIC_IK, BASIC_XS, BASIC_YS, BASIC_LA;
let BASIC_WE, BASIC_HT, BASIC_D5, BASIC_DX, BASIC_AY, BASIC_BT;
// [6851] "I&L OBTAINED FROM PREV CALL TO SUB 6100" — a genuine handoff
// before either of its return points; GOSUB 6850 needs to read whatever
// GOSUB 6100 last left behind, exactly as classic BASIC's lack of scoping
// NOT the local I/L reused for unrelated purposes inside GOSUB 6250/6800/
let BASIC_I6, BASIC_L2;
let BASIC_E5, BASIC_EX;
let BASIC_NA = 0;  // [1665 onward] next-activity code, set by the WHICH ACTIVITY prompt
let BASIC_KJ = 0;  // [5515] "assume ascent, not work" flag — set when BOTTOM TIME gets a non-positive answer

const PROMPT_TM = "TIME MODE (REAL OR ACCELERATED)? ";

// ── Lines 1370–1410: PA array ─────────────────────────────────
// [1370] DIM PA(8,5) — 1-based both axes
// [1371] PA(1,1)=1, PA(1,2)=DR, PA(1,3)=0, PA(1,4)=WD, PA(1,5)=3
// [1410] PA=1
let BASIC_PA = [];  // [1370] DIM PA(8,5) — 1-based both axes
let BASIC_PA_scalar;  // [1410] PA scalar — separate per STYLE_GUIDE naming convention
let BASIC_ES = [];  // [1416] DIM ES(30,2) — 1-based both axes
let BASIC_ES_scalar;  // [1440] ES scalar — separate per STYLE_GUIDE naming convention
let BASIC_EP;  // [1440] EP — event pointer
let BASIC_AL = [];  // [1460] DIM AL(15,7) — 1-based both axes
let BASIC_AL_scalar;  // [1630] AL scalar — separate per STYLE_GUIDE naming convention
let BASIC_P;
let BASIC_CK;  // [1789] CK — display loop gate flag
let BASIC_AA, BASIC_BB;  // [1465] AA=CL, BB=AD — saved clock/depth

const PROMPT_WD  = "WORKING DEPTH ";
const PROMPT_FG  = "#050505";  // black — CCI byte 48 FG

export default function DiverSim() {
  const [visibleCount, setVisibleCount] = useState(0);

  // [6320] Profile line segments accumulated one per tick (GOSUB 6300 Branch 1).
  const [profileSegs, setProfileSegs] = useState([]);

  const previousPaintedAscendGridRef = useRef(null);
  const finalPaintedAscendGridRef = useRef(null);

  // [6510]/[6525] GOSUB 6300 Branch 2 — coloured band bars
  const [bandSegs, setBandSegs] = useState([]);

  // [6591] PLOT 2,253,X3,Y3,255 — diver's position dot during WORK
  const [workDots, setWorkDots] = useState([]);

  // [1445] GOSUB 6600 initial call (AD=0) seeds the print-in reveal
  const [depthDigitCells, setDepthDigitCells] = useState(() => gosub_6600(0).digitCells);
  const [depthTrendCells, setDepthTrendCells] = useState(() => gosub_6600(0).trendCells);

  // [1445] GOSUB 6700 initial call (CL=0) seeds the print-in reveal
  const [airGaugeCells, setAirGaugeCells] = useState(() => gosub_6700(0, 2.0));

  // [3530] GOSUB 6750 — NOSTOP time remaining / time to next bound
  const [boundCells, setBoundCells] = useState({ cells: [], outOfRange: false });
  // [5970] PA=-1 returns to the main activity-copy path. On CCEMU this
  // subsequently produces an interpreter CF ERROR at [1645]. The JSX does
  // not reproduce host/interpreter error text; runtimeErrorRef below simply
  // prevents an invalid WORK from continuing or reaching a display pass.
  // [6950] STOP10/STOP 5 text, WORK-initiation only. See gosub_6950's own
  const [stopCells, setStopCells] = useState([]);
  const [memoryActive, setMemoryActive] = useState(false);
  const [memoryCells, setMemoryCells] = useState([]);

  // Execute one iteration of the main dive loop (lines 1465–4000).
  // GOSUB 6600 (line 3510) is
  function runDiveTick() {
    // [3530] GOSUB 6750 occurs after [3410] GOSUB 6300 in the BASIC.
    // Therefore graphics written by 6300 on this pass must already be visible
    // even if 6750 later halts at [6763].

    if (!resumeAt3400Ref.current) {
    if (!resumeAt3000Ref.current) {
    // [1465] AA=CL, BB=AD
    BASIC_AA = BASIC_CL; BASIC_BB = BASIC_AD;

    // [1466] IF ES(EP,1)=1 THEN 1471
    if (BASIC_ES[BASIC_EP][1] !== 1) {
      // [1467] CL=CL+TK — preserve the BASIC's discrete simulation clock.
      BASIC_CL = BASIC_CL + BASIC_TK;
      // [1468] IF TK=1 THEN 1471
      if (BASIC_TK !== 1) {
        // [1469-1470] floating point cleanup
        if (BASIC_CL - Math.floor(BASIC_CL) >= 0.999) BASIC_CL = Math.floor(BASIC_CL) + 1;
        if (BASIC_CL - Math.floor(BASIC_CL) <= 0.001) BASIC_CL = Math.floor(BASIC_CL);
      }
    }

    // [1471, 1800-1910] A next activity may be answered predictively before
    // the current activity reaches its physical boundary. Keep that answer
    // queued in NA; PA creation at [1900-1910] belongs to the end-of-event
    // path and must not be brought forward for DESCEND, ASCEND, WORK or DECOMPRESS.
    if (BASIC_AL[BASIC_AL_scalar][1] !== 1 && BASIC_AL[BASIC_AL_scalar][1] !== 2 && BASIC_AL[BASIC_AL_scalar][1] !== 3 && BASIC_AL[BASIC_AL_scalar][1] !== 4 && BASIC_NA !== 0 && BASIC_PA[BASIC_PA_scalar] && BASIC_PA[BASIC_PA_scalar][1] !== BASIC_NA) {
      BASIC_PA[BASIC_PA_scalar][1] = BASIC_NA;
      BASIC_PA[BASIC_PA_scalar][3] = BASIC_AL[BASIC_AL_scalar][4];
    }

    // Hold event dispatch until the current movement has reached AL(AL,4).
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
      // [1605] IF ES(EP,1)=1 THEN 1800
      if (BASIC_ES[BASIC_EP][1] !== 1 && !(BASIC_PA_scalar < 1 || !BASIC_PA[BASIC_PA_scalar] || !BASIC_PA[BASIC_PA_scalar][1])) {
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
          // [1690] WORK
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
          // [1691] BT=AL(AL,7)
          BASIC_BT = BASIC_AL[BASIC_AL_scalar][7];
          // [1692] GOSUB 6100 — implemented
          {
            const decompResult = gosub_6100();
            if (decompResult.outOfRange) {
              // [6181] PRINT "OUT OF RANGE":STOP is a genuine BASIC STOP
              // carrying on past GOSUB 6100 to call GOSUB 6950 and GOSUB
              // fires, and GOSUB 6850 crashes here since GOSUB 6100's
              outOfRangeRef.current = true;
              setBoundCells(cells => ({ ...cells, outOfRange: true }));
              return;
            }
          }
          // [1693] GOSUB 6950 — implemented
          setStopCells(gosub_6950().cells);
          // [1694] GOSUB 6850 — implemented
          // quirk. Writes into the same boundCells state GOSUB 6750
          // GOSUB 6750 call later in this same runDiveTick() pass (see
          // [3530] below) skips overwriting it, letting this display
          // actually be visible for at least one tick before GOSUB 6750's
          // Branch A would silently wipe any row-3 content GOSUB 6250 had
          const nostopResult = gosub_6850();
          const touchedLines = new Set(nostopResult.cells.map(c => c.line));
          setBoundCells(cells => ({
            cells: [...cells.cells.filter(c => !touchedLines.has(c.line)), ...nostopResult.cells],
            outOfRange: cells.outOfRange,
          }));
          nostopEventCellsRef.current = true;
          // GOSUB 6950 called again immediately after in source
          setStopCells(gosub_6950().cells);
          // [1695] E5=D5, EX=DX
          BASIC_E5 = BASIC_D5; BASIC_EX = BASIC_DX;
        } else if (BASIC_AL[BASIC_P][1] === 2) {
          // [1680] ASCEND
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] +
            (BASIC_AL[BASIC_P][3] - BASIC_AL[BASIC_P][4]) / BASIC_AL[BASIC_P][2];
          // [1682] VA=32:FOR ID=13 TO 18:GOSUB 7000:NEXT ID — implemented
          // display (GOSUB 6250 or GOSUB 6850 Branch B's fall-through)
          // 3 the same way GOSUB 6250/6800/6850 already do — six space
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
          // [1685] GOTO 1730 — ASCEND joins the common continuation at [1730].
        } else if (BASIC_AL[BASIC_P][1] === 4) {
          // [1700] DECOMPRESS
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
          // [1701] GOSUB 6250 — implemented
          // flag. Writes into the same boundCells state GOSUB 6850's
          // Branch B fall-through and GOSUB 6750 (II=12 case) use, since
          // the way GOSUB 6850/6750 needed gating for.
          const decompDisplayResult = gosub_6250();
          if (decompDisplayResult.cells.length > 0) {
            setBoundCells(cells => ({
              cells: [...cells.cells.filter(c => c.line !== 3), ...decompDisplayResult.cells],
              outOfRange: cells.outOfRange,
            }));
          }
          // [1705] GOTO 1730 — DECOMPRESS joins the common continuation at [1730].
        } else if (BASIC_AL[BASIC_P][1] === 5) {
          // [1710] REST
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] + BASIC_AL[BASIC_P][2];
        }

        // [1730] ES(EP,2)=AL(P,7)
        BASIC_ES[BASIC_EP][2] = BASIC_AL[BASIC_P][7];
        // [1740] ES=ES+1
        BASIC_ES_scalar = Math.max(BASIC_ES_scalar, BASIC_EP) + 1;
        // [1765] ES(ES,1)=1, ES(ES,2)=AL(P,7)
        BASIC_ES[BASIC_ES_scalar][1] = 1;
        BASIC_ES[BASIC_ES_scalar][2] = BASIC_AL[BASIC_P][7];
        // [1789] CK=0
        BASIC_CK = 0;

        // consumed. This matters when GOSUB 5900 creates a zero-duration
        break;
      } else if (BASIC_ES[BASIC_EP][1] === 1) {
        // [1605] IF ES(EP,1)=1 THEN 1800
        if (BASIC_AL[BASIC_AL_scalar][1] === 5) {
          // [1800]-[1820] REST is terminal in the original program:
          // [1815] GOSUB 8000 refreshes the final MEMORY display, then END.
          const memoryResult = gosub_8000();
          setDepthDigitCells(memoryResult.depth.digitCells);
          setDepthTrendCells(memoryResult.depth.trendCells);
          // GOSUB 6700 can deliberately return without drawing when its
          if (memoryResult.air.length > 0) {
            setAirGaugeCells(memoryResult.air);
          }
          setMemoryCells(memoryResult.cells);
          setMemoryActive(true);
          diveEndedRef.current = true;
          BASIC_END_EVENT_DISPATCHED = true;
          break;
        }
        if (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 2 || BASIC_AL[BASIC_AL_scalar][1] === 3 || BASIC_AL[BASIC_AL_scalar][1] === 4) {
          const boundaryActivity = BASIC_AL[BASIC_AL_scalar][1] === 1 ? 'DESCEND' :
            (BASIC_AL[BASIC_AL_scalar][1] === 2 ? 'ASCEND' :
              (BASIC_AL[BASIC_AL_scalar][1] === 3 ? 'WORK' : 'DECOMPRESS'));

          // [1800] IF AL(AL,1)<>5 THEN 1881
          // [1881] ES=ES+1
          BASIC_ES_scalar = BASIC_ES_scalar + 1;
          if (!BASIC_ES[BASIC_ES_scalar]) BASIC_ES[BASIC_ES_scalar] = new Array(3).fill(0);
          // [1882] ES(ES,1)=0:ES(ES,2)=0
          BASIC_ES[BASIC_ES_scalar][1] = 0;
          BASIC_ES[BASIC_ES_scalar][2] = 0;

          // [1888] IF AL(AL,1)=4 THEN GOSUB 7500. The decompression stop
          if (BASIC_AL[BASIC_AL_scalar][1] === 4) {
            const htBefore = BASIC_HT;
            const decompFinishedDisplay = gosub_7500();

            // [7505] owns row 2 at this boundary; replace only that row.
            setBoundCells(cells => ({
              cells: [
                ...cells.cells.filter(c => c.line !== 2),
                ...decompFinishedDisplay.row2Cells,
              ],
              outOfRange: cells.outOfRange,
            }));

            // [7536]-[7545] writes only IDs 5-6 (STOP -> STOP 5)
            // while [7515]-[7530] rewrites all six cells as ASCEND.
            setStopCells(cells => {
              if (htBefore === 10) {
                return [
                  ...cells.filter((c, i) => i < 4),
                  ...decompFinishedDisplay.stopCells,
                ];
              }
              return decompFinishedDisplay.stopCells;
            });

          }

          // [1890-1893] Special staged-WORK path. If the look-ahead answer
          // preserves the existing PA stack and jumps straight to GOSUB 5500.
          if (BASIC_NA === 0 && BASIC_AL[BASIC_AL_scalar][5] === 3) {
            BASIC_NA = 3;
            if (BASIC_PA_scalar >= 1) {
              gosub_5500_continue_existing_stack();
              BASIC_END_EVENT_DISPATCHED = true;
              break;
            }
          }

          // [1895] Ordinary default resolution.
          if (BASIC_NA === 0) BASIC_NA = BASIC_AL[BASIC_AL_scalar][5];

          // [1900] PA=1
          BASIC_PA_scalar = 1;
          // [1905] PA(PA,1)=NA
          BASIC_PA[BASIC_PA_scalar][1] = BASIC_NA;
          // [1910] PA(PA,3)=AL(AL,4)
          BASIC_PA[BASIC_PA_scalar][3] = BASIC_AL[BASIC_AL_scalar][4];

          // [2010] ON NA GOTO 2020,2050,2080,2110,2140.
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
          BASIC_END_EVENT_DISPATCHED = true;
          break;
        }

        BASIC_ES[BASIC_EP][1] = 0;
      } else {
        // No PA is available for this pending start event yet. Restore EP so
        // the same event remains pending; [3010-3036] below may obtain the
        // next activity through the predictive WHICH ACTIVITY prompt.
        BASIC_EP = BASIC_EP - 1;
        break;
      }
    }
    if (SAFETY_CAP === 0) {
    }

    // [2200] GOTO 1465 after a true end-of-event dispatch. Returning here
    // makes the next React tick re-enter at [1465] rather than fall through
    // [2999] REM + + + + + + + + + + + + — source DISPLAY-section divider; no executable effect.
    // to [3000]/[3400], preserving the BASIC control-flow ordering before
    // the successor activity reaches the display/movement path.
    if (BASIC_END_EVENT_DISPATCHED) return;

    } else {
      // look-ahead section without executing another [1465]-[1471] cycle.
      resumeAt3000Ref.current = false;
    }

    // [3010] IF CL<ES(EP,2)-IK THEN 3400 — skip activity prompt if
    if (activityStep === null && BASIC_CL >= BASIC_ES[BASIC_EP][2] - BASIC_IK && BASIC_CK === 0) {
      // [3017] IF AL(AL,1)=3 THEN GOSUB 6200 — during WORK, rewrite
      // This is deliberately at the source call site, before [3021].
      if (BASIC_AL[BASIC_AL_scalar][1] === 3) {
        const airOkResult = gosub_6200();
        setBoundCells(cells => ({
          cells: [...cells.cells.filter(c => c.line !== 3), ...airOkResult.cells],
          outOfRange: cells.outOfRange,
        }));
      }

      // [3021] IF AL(AL,1)<>5 THEN 3025 — REST skips the prompt entirely
      if (BASIC_AL[BASIC_AL_scalar][1] !== 5) {
        // DECOMPRESS note: [1888] GOSUB 7500 is deliberately NOT done at
        // this predictive prompt. It belongs to the true [1800] event-boundary
        // [3025-3031] trigger "WHICH ACTIVITY REQUIRED (...)"
        BASIC_CK = 1;
        setActivityDefault(BASIC_A[BASIC_AL[BASIC_AL_scalar][5]]);
        setActivityStep('whichActivity');
        return;  // [3032] INPUT M$ — execution resumes at [3400] after Enter
      } else {
        // [3022] CK=1:GOTO 1465 — REST suppresses WHICH ACTIVITY and does
        // not prepare another activity here. REST NEXT (GOSUB 5700) belongs
        BASIC_CK = 1;
        return;
      }
    }
    } else {
      // [3035] recognised activity name: continue at [3400] in the same
      resumeAt3400Ref.current = false;
    }

    {
      // [3400] IF AL(AL,1)<>1 AND AL(AL,1)<>2 THEN 3410
      if (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 2) {
        // [3402] IF AL(AL,1)=2 THEN 3406 — ASCEND branch
        if (BASIC_AL[BASIC_AL_scalar][1] === 2) {
          // [3406]-[3408]
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
            // GOSUB 6300 branches — which a still
            const BAR_W = plotX(1) - 1;
            const activityTypeForBarGrid = BASIC_AL[BASIC_AL_scalar][1];
            const barGridX =
              activityTypeForBarGrid === 1
                ? BASIC_LQ
                : (justLeftWorkRef.current ? BASIC_LQ : BASIC_LQ + 1);
            justLeftWorkRef.current = false;
            const tickColour = '#000000';
            const MIN_BAR_H = 2;
            const rawH = Math.abs(plotY(BASIC_MQ) - plotY(BASIC_MP));
            const isFlat = rawH < MIN_BAR_H;
            const activityType = BASIC_AL[BASIC_AL_scalar][1];
            const isDecompress = activityType === 4;
            const isRest = activityType === 5;
            const FLAT_BAR_W = plotX(1);

            if (isDecompress || isRest) {
              const previousActivityType =
                BASIC_AL_scalar > 1 ? BASIC_AL[BASIC_AL_scalar - 1][1] : 0;
              const flatXOffset = 0;

              const paintedFlatStartGrid =
                previousActivityType === 2 && finalPaintedAscendGridRef.current !== null
                  ? finalPaintedAscendGridRef.current
                  : BASIC_LP;

              const flatStartX = plotX(paintedFlatStartGrid);
              const flatEndX = plotX(BASIC_LQ);

              previousPaintedAscendGridRef.current = null;
              finalPaintedAscendGridRef.current = null;

              setProfileSegs(segs => [...segs, {
                kind: 'line',
                x: flatStartX,
                x2: flatEndX,
                y: plotY(BASIC_MQ),
                colour: tickColour,
                al: BASIC_AL_scalar,
                activityType: BASIC_AL[BASIC_AL_scalar][1],
              }]);
            } else {
              const activityTypeForDiag = BASIC_AL[BASIC_AL_scalar][1];
              const isAscendNow = activityTypeForDiag === 2;

              let effectiveBarGridX = barGridX;
              let isPartialFinalAscend = false;
              let isAscendTargetTick = false;
              const previousActivityTypeForPaint =
                BASIC_AL_scalar > 1 ? BASIC_AL[BASIC_AL_scalar - 1][1] : 0;
              const isFirstAscendAfterDecompress =
                isAscendNow && previousActivityTypeForPaint === 4 &&
                Math.abs(BASIC_CL - BASIC_AL[BASIC_AL_scalar][3]) < 1e-9;

              if (isAscendNow) {
                const completionTime = BASIC_AL[BASIC_AL_scalar][7];
                const completionGridX =
                  Math.floor(completionTime * BASIC_XS) + 10;

                const currentGridX =
                  Math.floor(BASIC_CL * BASIC_XS) + 10;

                effectiveBarGridX = currentGridX;

                // BASIC_BB is the saved pre-tick AD from [1465]; BASIC_AD is
                const actualRise = Math.abs(BASIC_BB - BASIC_AD);
                const nominalRise = Math.abs(BASIC_AR * BASIC_TK);
                const atTarget =
                  Math.abs(BASIC_AD - BASIC_AL[BASIC_AL_scalar][4]) < 1e-9;
                isAscendTargetTick = atTarget;

                isPartialFinalAscend =
                  atTarget &&
                  nominalRise > 0 &&
                  actualRise > 0 &&
                  actualRise < nominalRise - 1e-9 &&
                  previousPaintedAscendGridRef.current !== null;

                const isZeroDistanceAscend =
                  Math.abs(BASIC_AL[BASIC_AL_scalar][3] - BASIC_AL[BASIC_AL_scalar][4]) < 1e-9;

                if (isZeroDistanceAscend && previousPaintedAscendGridRef.current !== null) {
                  // [6310] A zero-distance ASCEND plots from the already-reached
                  effectiveBarGridX = previousPaintedAscendGridRef.current;
                } else if (isPartialFinalAscend) {
                  effectiveBarGridX = previousPaintedAscendGridRef.current;
                } else if (BASIC_CL >= completionTime) {
                  effectiveBarGridX = completionGridX;
                }

                previousPaintedAscendGridRef.current = effectiveBarGridX;
                finalPaintedAscendGridRef.current = atTarget
                  ? effectiveBarGridX
                  : null;

              } else {
                previousPaintedAscendGridRef.current = null;
                finalPaintedAscendGridRef.current = null;
              }

              // is still a plotted activity. Render its flat GOSUB 6300 vector
              const isZeroDistanceAscend =
                isAscendNow &&
                Math.abs(BASIC_AL[BASIC_AL_scalar][3] - BASIC_AL[BASIC_AL_scalar][4]) < 1e-9;
              const paintAsFlat =
                isFlat && (!isAscendNow || isZeroDistanceAscend);
              const rectX = isZeroDistanceAscend
                ? plotX(effectiveBarGridX)
                : plotX(effectiveBarGridX) - (paintAsFlat ? FLAT_BAR_W : BAR_W) / 2;
              const rectW = paintAsFlat ? FLAT_BAR_W : BAR_W;

              const rectY =
                paintAsFlat
                  ? plotY(BASIC_MQ) - MIN_BAR_H / 2
                  : Math.min(plotY(BASIC_MP), plotY(BASIC_MQ));
              const rectH =
                (paintAsFlat ? MIN_BAR_H : rawH) +
                (isFirstAscendAfterDecompress ? 1 : 0);

              setProfileSegs(segs => [...segs, {
                kind: 'rect',
                x: rectX,
                y: rectY,
                w: rectW,
                h: rectH,
                colour: tickColour,
                al: BASIC_AL_scalar,
                activityType: BASIC_AL[BASIC_AL_scalar][1],
              }]);
            }
          }
        }
      } else {
        // [6330] GOSUB 6300 Branch 2 (coloured band mountain)
        justLeftWorkRef.current = true;
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
          let BASIC_Y2 = 140;
          let BASIC_C_scalar = 1;
          // [6346] L=1: CO=1
          let BASIC_L = 1;
          let BASIC_CO = 1;

          // [6350] FOR J=1 TO 7 — band-search scan.
          // clause a little further up this function, around [1605]).
          for (let BASIC_J = 1; BASIC_J <= 7; BASIC_J++) {
            // [6355] PLOT 30,20
            // [6360] FOR I=L TO 21 / [6370] IF DT(I,J)=999 OR DT(I,J)<XX THEN 6380
            let BASIC_I = BASIC_L;
            for (BASIC_I = BASIC_L; BASIC_I <= 21; BASIC_I++) {
              if (BASIC_DT[BASIC_I][BASIC_J] === 999 || BASIC_DT[BASIC_I][BASIC_J] < BASIC_XX) {
                break;
              }
            }
            // [6375] NEXT I — represented by the preceding JavaScript search loop.
      // [6380] Y1=INT(140-(2*I+8)*YS)
            let BASIC_Y1 = Math.floor(140 - (2 * BASIC_I + 8) * BASIC_YS);
            // [6381] Y1=Y1+2: IF Y1=42 THEN Y1=40
            BASIC_Y1 = BASIC_Y1 + 2;
            if (BASIC_Y1 === 42) BASIC_Y1 = 40;
            // [6385] IF Y1<40 THEN Y1=40
            if (BASIC_Y1 < 40) BASIC_Y1 = 40;

            // [6390] IF Y3<Y1 OR Y3>Y2 THEN 6500
            const BASIC_inRange = !(BASIC_Y3 < BASIC_Y1 || BASIC_Y3 > BASIC_Y2);
            // [6400] CO=C — reached only when [6390] does not branch.
            if (BASIC_inRange) {
              BASIC_CO = BASIC_C_scalar;
            }
            // [6500] IF C=1 THEN 6540 — first band found: no PRIOR band
            const BASIC_wouldDraw = BASIC_C_scalar !== 1;

            if (BASIC_wouldDraw) {
              const BAND_BAR_W = plotX(BASIC_X3 + 1) - plotX(BASIC_X3);
              const barY1 = plotY(BASIC_Y1);
              const barY2 = plotY(BASIC_Y2);
              // [6550] Y2=Y1-1 deliberately leaves a 1-plot-unit buffer
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
            // [6565] L=I
            BASIC_L = BASIC_I;
            // [6570] NEXT J — represented by this enclosing JavaScript loop.
          }

          // [6590] PLOT 30,C(CO),29,16,29 — source restores plot attributes after the coloured-band loop.
          // [6591] PLOT 2,253,X3,Y3,255 — diver's actual position dot.
          newWorkDots.push({
            x: plotX(BASIC_X3),
            y: plotY(BASIC_Y3),
            inBand: BASIC_CO > 1,
            al: BASIC_AL_scalar,
          });
          // [6593] NEXT X3 — represented by this enclosing JavaScript loop.
        }

        // [6599] RETURN — end of the source GOSUB 6300 WORK branch.
        // Commit now, at the 6300 call site. BASIC executes this drawing before
        // [3530] GOSUB 6750, so a later [6763] STOP leaves these pixels visible.
        if (newBandBars.length > 0) {
          setBandSegs(segs => [...segs, ...newBandBars]);
        }
        if (newWorkDots.length > 0) {
          setWorkDots(dots => [...dots, ...newWorkDots]);
        }
      }
    }

    // [3510] GOSUB 6600 — depth digits, now
    const depthResult = gosub_6600(BASIC_AD);
    setDepthDigitCells(depthResult.digitCells);
    setDepthTrendCells(depthResult.trendCells);
    // [3520] GOSUB 6700 — air gauge, now
    // GOSUB 6750/boundCells bug above — [6730] IF VA<0 THEN 6745 means
    // GOSUB 6700 does nothing at all once too deep for the gauge's
    const airGaugeResult = gosub_6700(BASIC_CL, BASIC_XS);
    if (airGaugeResult.length > 0) {
      setAirGaugeCells(airGaugeResult);
    }
    // [3530] GOSUB 6750 — NOSTOP/time-to-bound, now
    // GATED: GOSUB 6750 is
    // GOSUB 6850's same-tick write on the real hardware — but there, each
    // GOSUB 6750 actually wrote something (cells.length>0) or hit its own
    if (nostopEventCellsRef.current) {
      nostopEventCellsRef.current = false;
    } else {
      const boundResult = gosub_6750();
      if (boundResult.cells.length > 0 || boundResult.outOfRange) {
        // [3530] GOSUB 6750 writes only the six screen cells selected by II.
        const touchedBasicRows = new Set(boundResult.cells.map(c => c.basicRow));
        setBoundCells(current => ({
          cells: [
            ...current.cells.filter(c => !touchedBasicRows.has(c.basicRow)),
            ...boundResult.cells,
          ],
          outOfRange: boundResult.outOfRange || current.outOfRange,
        }));
      }
      if (boundResult.outOfRange) {
        // [6763] PRINT "OUT OF RANGE":STOP — halt this tick before [3540].
        outOfRangeRef.current = true;
        return;
      }
    }

    // [3540] IF AL(AL,1)=4 THEN GOSUB 6800 — update DECOMPRESS row 2 only;
    // preserve the other DM rows written by their own source routines.
    if (BASIC_AL[BASIC_AL_scalar][1] === 4) {
      const dtResult = gosub_6800();
      if (dtResult.cells.length > 0) {
        setBoundCells(cells => ({
          cells: [...cells.cells.filter(c => c.line !== 2), ...dtResult.cells],
          outOfRange: cells.outOfRange,
        }));
      }
    }

    // [3560] REM ... — source divider after display-update calls; no executable effect.
    // [4000] GOTO 1465 — the interval callback begins the next loop pass.
  }

  // [1280–1281] Working depth input state.
  const [wdEntered, setWdEntered]   = useState(false);
  const [wdInput,   setWdInput]     = useState('');
  const [wdError,   setWdError]     = useState(false);
  const initialWdBellDoneRef = useRef(false);
  const initialWdBellPendingRef = useRef(false);
  const audioCtxRef = useRef(null);

  // [3025-3036] Activity prompt state: trigger, display, input capture and validation.
  const [activityStep,    setActivityStep]    = useState(null);
  const [activityInput,   setActivityInput]   = useState('');
  const [activityDefault, setActivityDefault] = useState('');

  // [1303–1308] Time mode input state.
  const [tmEntered, setTmEntered] = useState(false);
  const [tmInput,   setTmInput]   = useState('');

  const runDiveTickRef = useRef(runDiveTick);
  runDiveTickRef.current = runDiveTick;

  // [3035] A$(NA)=M$ THEN 3400 — INPUT returns into the same BASIC pass.
  // to resume at [3400] without re-running [1465]-[3035].
  const resumeAt3400Ref = useRef(false);
  const resumeAt3000Ref = useRef(false);

  // [6763] OUT OF RANGE — see gosub_6750 comment above. A ref (not state)
  const outOfRangeRef = useRef(false);
  const runtimeErrorRef = useRef(false);
  const hardStopRef = useRef(false);
  // [1820] END after REST completes. Separate from OUT OF RANGE so a normal
  const diveEndedRef = useRef(false);

  // gosub_6850's own header comment. Set true when GOSUB 6850 has just
  // GOSUB 6750 check in the same tick, so it never affects later ticks.
  const nostopEventCellsRef = useRef(false);

  const justLeftWorkRef = useRef(false);

  // [1465 onward] Auto-run the dive loop once time mode is entered.
  useEffect(() => {
    if (!tmEntered) return;
    const interval = setInterval(() => {
      if (outOfRangeRef.current || runtimeErrorRef.current || hardStopRef.current || diveEndedRef.current) {
        clearInterval(interval);
        return;
      }
      // no new [1465] pass begins. WHICH ACTIVITY resumes explicitly at
      // [3400] from handleActivityKey when Enter is pressed.
      if (activityStep !== null) {
        return;
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
    BASIC_WM = 0; BASIC_LM = 0; BASIC_NS = 0;

    // [1307–1308]
    if (BASIC_MS === 'REAL') {
      // [1309] TK=1/32
      BASIC_TK = 1 / 32;
    } else {
      // [1308 — handwritten manuscript addition] TK=.25:GOTO 1316.
      // This branch already proceeds directly to the [1316] IK assignment below.
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
    setMemoryActive(false);
    setMemoryCells([]);

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

    // [1419] ES(0,1)=0
    BASIC_ES[0][1] = 0;
    // [1420] ES(0,2)=0
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
    // [1461] REM ..LOOP.. — source marker for the main execution loop.
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
        if (BASIC_AL[BASIC_P][1] === 1) {
          // [1670] AL(P,7)=AL(P,6)+(AL(P,4)-AL(P,3))/AL(P,2)
          BASIC_AL[BASIC_P][7] = BASIC_AL[BASIC_P][6] +
            (BASIC_AL[BASIC_P][4] - BASIC_AL[BASIC_P][3]) / BASIC_AL[BASIC_P][2];
          // [1675] GOTO 1730 — other branches (ASCEND/WORK/DECOMPRESS/REST)
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
        // extra [1465]/CL increment can occur between [1790] and [3000].
        resumeAt3000Ref.current = true;
        runDiveTickRef.current();
      }
    }

    setTmEntered(true);
  }
  // ── GOSUB 5000 / 5060 — BASIC input subroutines ──────────────
  // [5000-5055] SUB I/P NUMBER displays M$, reads numeric M, then clears and
  // homes the prompt line. [5060-5099] SUB I/P NAME similarly reads M$, scans
  // A$(1..5), and returns the matching activity number in M, or 0 if unmatched.
  // React consolidates these terminal-driven routines into controlled input
  // fields and key handlers, so their individual BASIC statements do not have
  // one-to-one JSX lines. Numeric GOSUB 5000 behaviour is preserved at its live
  // call sites. GOSUB 5060 has no caller in the surviving BASIC; activity-name
  // matching required by the live program is performed in handleActivityKey().

  // Valid range: WD > 0 AND WD < 50 (line 1281 condition inverted).
  // [1279 — handwritten insertion] CHR$(7) — bell on invalid input.
  function getAudioContext() {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtxRef.current = new AudioCtx();
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  }

  function soundBell(ctx) {
    if (!ctx || ctx.state !== 'running') return false;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1150;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
      return true;
    } catch (e) {
      return false;
    }
  }

  function bell() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'running') {
      soundBell(ctx);
      return;
    }
    // Subsequent bells normally occur inside a key event, so resume() is then
    // permitted by browser autoplay policy. The initial [1278] cue is handled
    // separately below if the browser has not yet received a user gesture.
    ctx.resume().then(() => soundBell(ctx)).catch(() => {});
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

  // [5400] REM ASCEND NEXT
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
    // [5495] RETURN
  }

  // [5600] REM DECOMPRESS NEXT
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
    // [5690] RETURN
  }

  // [5700] REM REST NEXT
  function gosub_5700_start() {
    setActivityStep('forHowLong');
  }
  function gosub_5700_resume(BASIC_M) {
    BASIC_PA_scalar = 1;
    // [5710] PA(PA,2)=M occurs BEFORE [5715] mutates local M.
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_M;
    // [5715] IF M<2*TK THEN M=2*TK — mutates local M only; PA(PA,2)
    // retains the value already copied from M at [5710].
    if (BASIC_M < 2 * BASIC_TK) BASIC_M = 2 * BASIC_TK;
    // [5720] PA(PA,4)=PA(PA,3)
    BASIC_PA[BASIC_PA_scalar][4] = BASIC_PA[BASIC_PA_scalar][3];
    // [5730] PA(PA,5)=5
    BASIC_PA[BASIC_PA_scalar][5] = 5;
    setActivityStep(null);
    setActivityInput('');
    // [5890] RETURN
  }

  // [5300] REM DESCEND NEXT
  // [5316] IF M<AD OR M>50 THEN 5312, looping back to re-show "TO WHAT
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
    // [5330] PLOT 3,80,0 — source moves the terminal cursor off the prompt line; React removes the prompt instead.
    setActivityStep(null);
    setActivityInput('');
    // [5395] RETURN
  }

  // [5500] REM SUB WORK NEXT
  // this — since PA(PA,2)<0 is checked first thing
  function gosub_5500_start() {
    BASIC_PA_scalar = 1;
    BASIC_PA[BASIC_PA_scalar][2] = -1;  // [2080] PA(PA,2)=-1, set by the caller in source
    setActivityStep('bottomTime');
  }
  // [5900-5999] REM SUB STRETCHES WORK — builds the PA stack.
  function gosub_5900() {
    // [5905] IF AD<10 THEN 5999
    if (BASIC_AD < 10) {
      return { status: 'bypass' };
    }

    // [5910] TT=PA(1,2): I=INT(PA(1,3)-7)/2
    const BASIC_TT = BASIC_PA[1][2];
    let BASIC_I5900 = Math.floor(BASIC_PA[1][3] - 7) / 2;
    // [5913] IF I>21 THEN I=21
    if (BASIC_I5900 > 21) BASIC_I5900 = 21;
    const BASIC_DT_ROW = Math.trunc(BASIC_I5900);

    // [5915-5945] Find J: first DT boundary not already passed by CL.
    let BASIC_J5900 = null;
    for (let j = 1; j <= 7; j++) {
      const v = BASIC_DT[BASIC_DT_ROW]?.[j];
      // [5925,5931] sentinel before a qualifying boundary is a hard STOP.
      if (v === 999 || v === undefined) {
        return { status: 'hard-stop' };
      }
      // [5926] IF CL<=DT(I,J) THEN 5945
      if (BASIC_CL <= v) {
        BASIC_J5900 = j;
        break;
      }
    }
    if (BASIC_J5900 === null) {
      return { status: 'hard-stop' };
    }

    // [5945-5974] Find K: first DT boundary at/after proposed WORK end.
    let BASIC_K5900 = null;
    for (let k = 1; k <= 7; k++) {
      const v = BASIC_DT[BASIC_DT_ROW]?.[k];
      // [5947,5970] this O.R. path sets PA=-1 and returns, unlike 5931 STOP.
      if (v === 999 || v === undefined) {
        BASIC_PA_scalar = -1;
        return { status: 'pa-minus-one' };
      }
      // [5950] IF CL+TT<=DT(I,K) THEN 5974
      if (BASIC_CL + BASIC_TT <= v) {
        BASIC_K5900 = k;
        break;
      }
    }
    if (BASIC_K5900 === null) {
      BASIC_PA_scalar = -1;
      return { status: 'pa-minus-one' };
    }

    // [5974] IF J=K THEN 5998 — no split; only final successor becomes ASCEND.
    if (BASIC_J5900 !== BASIC_K5900) {
      // [5976] final (bottom-of-stack) remainder after last crossed boundary.
      BASIC_PA[1][2] = BASIC_CL + BASIC_TT - BASIC_DT[BASIC_DT_ROW][BASIC_K5900 - 1];

      // [5977-5984] Build complete interior DT-boundary intervals backwards.
      if (BASIC_K5900 - BASIC_J5900 !== 1) {
        let BASIC_M5900 = BASIC_K5900 - BASIC_J5900 + 1;
        for (let BASIC_L5900 = BASIC_J5900 + 1; BASIC_L5900 <= BASIC_K5900 - 1; BASIC_L5900++) {
          BASIC_M5900 = BASIC_M5900 - 1;
          BASIC_PA[BASIC_M5900][2] =
            BASIC_DT[BASIC_DT_ROW][BASIC_L5900] - BASIC_DT[BASIC_DT_ROW][BASIC_L5900 - 1];
        }
      }

      // [5985-5986] PA becomes stack depth; top entry runs from CL to first boundary.
      BASIC_PA_scalar = BASIC_K5900 - BASIC_J5900 + 1;
      BASIC_PA[BASIC_PA_scalar][2] = BASIC_DT[BASIC_DT_ROW][BASIC_J5900] - BASIC_CL;

      // [5991-5997] Every generated row above PA(1) is WORK again and copies
      for (let BASIC_KCOPY = 2; BASIC_KCOPY <= BASIC_PA_scalar; BASIC_KCOPY++) {
        BASIC_PA[BASIC_KCOPY][5] = 3;
        for (let BASIC_JCOPY = 1; BASIC_JCOPY <= 4; BASIC_JCOPY++) {
          if (BASIC_JCOPY === 2) continue;
          BASIC_PA[BASIC_KCOPY][BASIC_JCOPY] = BASIC_PA[1][BASIC_JCOPY];
        }
      }
    }

    // [5998] PA(1,5)=2 — last entry in stack expects ASCEND.
    BASIC_PA[1][5] = 2;
    return { status: 'ok' };
  }

  function gosub_5500_resume(BASIC_M) {
    // [5509] GOSUB 5000: PA(1,2)=M
    // anywhere. PA(PA,4)=PA(PA,3) at [5520] then produced a zero-length
    BASIC_PA[BASIC_PA_scalar][2] = BASIC_M;
    // [5510] IF M>0 THEN 5520
    if (BASIC_M > 0) {
      // [5520] PA(PA,4)=PA(PA,3)
      BASIC_PA[BASIC_PA_scalar][4] = BASIC_PA[BASIC_PA_scalar][3];
      // [5530] PA(PA,5)=2
      BASIC_PA[BASIC_PA_scalar][5] = 2;
      // [5550] GOSUB 5900 — build the source PA stack.
      const stretch5900 = gosub_5900();
      BASIC_KJ = 0;

      // [5931] is a genuine STOP inside GOSUB 5900. Keep it distinct from
      // [5970], which sets PA=-1 and returns. RT-38B established the 5931
      // source path in isolation; normal full-program execution may be caught
      // earlier by GOSUB 6750. No invented OUT OF RANGE text is added here.
      if (stretch5900.status === 'hard-stop') {
        hardStopRef.current = true;
        setActivityStep(null);
        setActivityInput('');
        return;
      }

      // [5970] PA=-1:GOTO 5999 returns from GOSUB 5900. Live CCEMU execution
      // later produces CF ERROR IN 1645 because the negative PA value reaches
      // the activity-copy path. That is an interpreter consequence, not DIVER
      // display output, so JSX reproduces the behavioural consequence only:
      // reject/halt this invalid WORK before any new WORK display pass.
      if (stretch5900.status === 'pa-minus-one') {
        runtimeErrorRef.current = true;
        setActivityStep(null);
        setActivityInput('');
        return;
      }
    } else {
      // [5515] KJ=1: REM ASSUME WANT ASCENT-NOT WORK. The caller then executes
      // [2090] IF KJ=0 THEN 2200; [2100] NA=2:GOTO 1900, which rebuilds PA(1)
      // as an ordinary ASCEND via the normal [1900-2050] path. Do that here
      BASIC_KJ = 1;
      BASIC_NA = 2;
      BASIC_PA_scalar = 1;
      BASIC_PA[1][1] = 2;
      BASIC_PA[1][3] = BASIC_AL[BASIC_AL_scalar][4];
      gosub_5400();
    }
    setActivityStep(null);
    setActivityInput('');
  }

  // [5501-5508] Continue an already-built 5900 WORK stack. Unlike the initial
  function gosub_5500_continue_existing_stack() {
    if (BASIC_PA_scalar < 1 || !BASIC_PA[BASIC_PA_scalar]) {
      BASIC_KJ = 1;
      return;
    }
    if (BASIC_PA[BASIC_PA_scalar][2] < 0) {
      setActivityStep('bottomTime');
      return;
    }
    if (BASIC_PA[BASIC_PA_scalar][2] < BASIC_TK) {
      BASIC_KJ = 1;
      return;
    }

    // [5503] GOSUB 6900 — immediately before the staged-WORK question
    const decompRqResult = gosub_6900();
    if (decompRqResult.cells.length) {
      setBoundCells(current => ({
        cells: [...current.cells.filter(c => c.line !== 2), ...decompRqResult.cells],
        outOfRange: current.outOfRange,
      }));
    }

    setActivityStep('nextStageWork');
    setActivityInput('');
  }

  // [3032-3036, 5312-5315, 5705-5710] Activity prompts
  function handleActivityKey(e) {
    if (e.key !== 'Enter') return;

    if (activityStep === 'nextStageWork') {
      const BASIC_M$ = activityInput.trim().toUpperCase();
      // [5506] only the literal NO rejects the staged continuation. Any other
      if (BASIC_M$ === 'NO') {
        // [5506 -> 5509] Reject the proposed staged continuation. Source does
        BASIC_PA_scalar = 1;
        setActivityStep('bottomTime');
        setActivityInput('');
        return;
      }
      BASIC_KJ = 0;
      setActivityStep(null);
      setActivityInput('');
      return;
    }

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
    if (matched === 0) {
      // [3034-3036] Leave NA=0 when no activity name matches; [1890-1893] may then accept staged WORK.
      if (BASIC_M$ !== '') bell();
      resumeAt3400Ref.current = true;
      setActivityStep(null);
      setActivityInput('');
      runDiveTickRef.current();
      return;
    }

    // [3035] During DECOMPRESS, queue NA and return to [3400];
    // [1888]/[2010] dispatch the successor at the true event boundary.
    if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 4 && activityStep === 'whichActivity') {
      resumeAt3400Ref.current = true;
      setActivityStep(null);
      setActivityInput('');
      runDiveTickRef.current();
      return;
    }

    // [3035] During ASCEND, queue NA and return to [3400];
    // [1800]/[2010] dispatch the successor at the true event boundary.
    if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 2 && activityStep === 'whichActivity') {
      resumeAt3400Ref.current = true;
      setActivityStep(null);
      setActivityInput('');
      runDiveTickRef.current();
      return;
    }

    if (matched === 1) {
      if (activityStep === 'whichActivity') {
        // [3035] Queue DESCEND at the predictive prompt; [2020] invokes GOSUB 5300 at the boundary.
        resumeAt3400Ref.current = true;
        setActivityStep(null);
        setActivityInput('');
        runDiveTickRef.current();
        return;
      }
      gosub_5300_start();
      setActivityInput('');
      return;
    } else if (matched === 2) {
      if (BASIC_AL[BASIC_AL_scalar] && BASIC_AL[BASIC_AL_scalar][1] === 3 && activityStep === 'whichActivity') {
        // [3035] During WORK, queue ASCEND; [1800]/[2010] dispatch it at the boundary.
        resumeAt3400Ref.current = true;
        setActivityStep(null);
        setActivityInput('');
        runDiveTickRef.current();
        return;
      }
      gosub_5400();
    } else if (matched === 3) {
      if (BASIC_AL[BASIC_AL_scalar] && activityStep === 'whichActivity' &&
          (BASIC_AL[BASIC_AL_scalar][1] === 1 || BASIC_AL[BASIC_AL_scalar][1] === 3)) {
        // [3035] Queue WORK at the predictive prompt; [2085] invokes GOSUB 5500 at the boundary.
        resumeAt3400Ref.current = true;
        setActivityStep(null);
        setActivityInput('');
        runDiveTickRef.current();
        return;
      }
      gosub_5500_start();
      setActivityInput('');
      return;
    } else if (matched === 4) {
      gosub_5600();
    } else if (matched === 5) {
      // [3034-3035] REST is queued here; [1900]-[2140] dispatch GOSUB 5700 at the boundary.
    }
    setActivityStep(null);
    setActivityInput('');
  }

  // Phase 1: printCells
  // Phase 2: dmCells
  // Phase 3: vertCells
  // Phase 5: taxisCells
  // Phase 6: nostopCells
  // Phase 8: airGaugeCells
  const totalCells = printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length + nostopCells.length + depthDigitCells.length + depthTrendCells.length + airGaugeCells.length;

  const printDone      = visibleCount >= printCells.length;
  const dmCount        = printDone ? visibleCount - printCells.length : 0;
  const dmDone         = visibleCount >= printCells.length + dmCells.length;
  const vertCount      = dmDone ? visibleCount - printCells.length - dmCells.length : 0;
  const vertDone       = visibleCount >= printCells.length + dmCells.length + vertCells.length;
  const titleDone      = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length;
  const taxisCount     = tmEntered ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length : 0;
  const taxisDone      = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length;
  const nostopCount    = taxisDone ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length - taxisCells.length : 0;
  const nostopDone      = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length + nostopCells.length;
  const depthPhaseCount = nostopDone ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length - taxisCells.length - nostopCells.length : 0;
  const depthPhaseDone  = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length + nostopCells.length + depthDigitCells.length + depthTrendCells.length;
  const airGaugeCount   = depthPhaseDone ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length - taxisCells.length - nostopCells.length - depthDigitCells.length - depthTrendCells.length : 0;

  // [1278] PRINT CHR$(7):GOTO 1280 — sound the initial WORKING DEPTH bell once.
  // A 1979 terminal could ring immediately. Browsers may prohibit audio until
  // the document receives its first user gesture. If audio is already unlocked,
  // ring at once; otherwise arm the cue and ring on the first pointer/key gesture
  // in this document, before that gesture is processed by the input control.
  useEffect(() => {
    if (!titleDone || wdEntered || initialWdBellDoneRef.current) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'running' && soundBell(ctx)) {
      initialWdBellDoneRef.current = true;
      initialWdBellPendingRef.current = false;
    } else {
      initialWdBellPendingRef.current = true;
    }
  }, [titleDone, wdEntered]);

  useEffect(() => {
    const unlockAndFlushInitialBell = () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const flush = () => {
        if (initialWdBellPendingRef.current && !initialWdBellDoneRef.current) {
          if (soundBell(ctx)) {
            initialWdBellDoneRef.current = true;
            initialWdBellPendingRef.current = false;
          }
        }
        if (ctx.state === 'running') {
          window.removeEventListener('pointerdown', unlockAndFlushInitialBell, true);
          window.removeEventListener('keydown', unlockAndFlushInitialBell, true);
        }
      };

      if (ctx.state === 'running') {
        flush();
      } else {
        ctx.resume().then(flush).catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlockAndFlushInitialBell, true);
    window.addEventListener('keydown', unlockAndFlushInitialBell, true);
    return () => {
      window.removeEventListener('pointerdown', unlockAndFlushInitialBell, true);
      window.removeEventListener('keydown', unlockAndFlushInitialBell, true);
    };
  }, []);

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

  // On hardware the PLOT 2 fires once per outer I iteration; rendering
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

        {/* [1265–1266] The BASIC attempts to print DIVER SIMULATION MODEL. */}

        {/* [1273–1277] depth scale ticks — cyan, Domain 2, appear after title */}
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

        {/* [3025-3031, 5312-5315, 5509, 5705-5710] Activity prompts */}
        {tmEntered && (activityStep === 'whichActivity' || activityStep === 'forHowLong' || activityStep === 'toWhatDepth' || activityStep === 'bottomTime' || activityStep === 'nextStageWork') && (() => {
          const msg = activityStep === 'whichActivity'
            ? `WHICH ACTIVITY REQUIRED (${activityDefault}) `
            : activityStep === 'forHowLong'
            ? `FOR HOW LONG `
            : activityStep === 'toWhatDepth'
            ? `TO WHAT DEPTH `
            : activityStep === 'nextStageWork'
            ? `IS NEXT STAGE =${basicPrintNumber(BASIC_PA[BASIC_PA_scalar]?.[2])} MIN. REQUIRED `
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

        {/* [1304] INPUT "TIME MODE (REAL OR ACCELERATED)? " — row 0, black on cyan */}
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

        {/* [1346–1348] Time axis ticks — cyan, Domain 2. */}
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

        {/* [1362–1368] NOSTOP — green on black, cols 69-74, row 2 of DM, char by char. */}
        {!memoryActive && stopCells.length === 0 && nostopCells.slice(0, nostopCount).map((c, i) => (
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

        {/* [1445] GOSUB 6600 — Depth Gauge: IDs 19-20 text digits only. */}
        {(depthPhaseDone ? depthDigitCells : depthDigitCells.slice(0, Math.min(depthPhaseCount, depthDigitCells.length))).map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2 + 3.6}
            y={dmTextYFromBasicRow(c.basicRow)}
            fill={c.color}
            fontSize={NOSTOP_FONT * 2}
            fontFamily={DM_FONT_FAMILY}
            style={{
              fontVariantNumeric: 'slashed-zero',
              animation: c.blink ? 'blink 0.5s step-end infinite' : undefined,
            }}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.ch}
          </text>
        ))}

        {/* [7200-7240] ID=21 Depth Trend bar */}
        {(depthPhaseDone ? depthTrendCells : depthTrendCells.slice(0, Math.max(0, depthPhaseCount - depthDigitCells.length))).map((c, ci) => {
          const TREND_BOTTOM = DM_Y + DM_H - 2 - TREND_BLK;
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

        {airGaugeCells.slice(0, airGaugeCount).map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
        ))}

        {/* [3530] GOSUB 6750 — NOSTOP time remaining / time to next bound. */}
        {/* GOSUB 7000 source rows are preserved explicitly: IDs 1-6 at row 4 */}
        {!memoryActive && boundCells.cells.map((c, i) => (
          c && c.type === 'text' ? (
            <text
              key={i}
              x={c.x + (W / 80) / 2}
              y={dmTextYFromBasicRow(c.basicRow)}
              fill={c.color}
              fontSize={NOSTOP_FONT * 2}
              fontFamily={DM_FONT_FAMILY}
              style={{
                fontVariantNumeric: 'slashed-zero',
                animation: c.blink ? 'blink 0.5s step-end infinite' : undefined,
              }}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {c.ch}
            </text>
          ) : null
        ))}

        {/* [6950] STOP10/STOP 5 — same row (row 4) as the depth digits (IDs 19-20), different columns, so same y-formula as those, not boundCells' multi-line offset above. */}
        {!memoryActive && stopCells.map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2}
            y={dmTextYFromBasicRow(c.basicRow)}
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

        {/* [8005-8006] terminal MEMORY heading. */}
        {memoryActive && (
          <>
            <rect
              x={69 * (W / 80)}
              y={DM_Y - FONT_SIZE}
              width={6 * (W / 80)}
              height={FONT_SIZE}
              fill={BLACK}
            />
            <text
              x={69 * (W / 80)}
              y={DM_Y - FONT_SIZE / 2}
              fill={CCI[23]}
              fontSize={FONT_SIZE}
              fontFamily="BedsteadRegular, monospace"
              textAnchor="start"
              dominantBaseline="central"
            >MEMORY</text>
          </>
        )}

        {/* [8020-8090] MEMORY owns IDs 1-18 once the dive ends. */}
        {memoryActive && memoryCells.map((c, i) => (
          c && c.type === 'text' ? (
            <text
              key={`memory-${i}`}
              x={c.x + (W / 80) / 2}
              y={dmTextYFromBasicRow(c.basicRow)}
              fill={c.color}
              fontSize={NOSTOP_FONT * 2}
              fontFamily={DM_FONT_FAMILY}
              style={{
                fontVariantNumeric: 'slashed-zero',
                animation: c.blink ? 'blink 0.5s step-end infinite' : undefined,
              }}
              textAnchor="middle"
              dominantBaseline="central"
            >{c.ch}</text>
          ) : null
        ))}

        {/* [6510]/[6525] GOSUB 6300 Branch 2 — coloured band bars. */}
        {bandSegs.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.colour} />
        ))}

        {/* [6591] PLOT 2,253,X3,Y3,255 — diver's position track, Branch 2 (WORK). */}
        {workDots.slice(1).map((d, i) => {
          const prev = workDots[i]; // workDots[i] is the point before d, since we sliced from index 1
          // [6591] Each WORK activity starts a new sequence of PLOT 2 points.
          if (prev.al !== d.al) {
            const SAME_Y_EPSILON = 0.01;
            const ONE_PLOT_COLUMN = 480 / 159;
            if (Math.abs(prev.y - d.y) > SAME_Y_EPSILON ||
                Math.abs(d.x - prev.x) > ONE_PLOT_COLUMN + 0.1) {
              return null;
            }
          }
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

        {/* [6300] Adjacent Compucolor raster PLOT cells physically meet at DESCEND→WORK and WORK→ASCEND handoffs. */}
        {(() => {
          if (workDots.length === 0 || profileSegs.length === 0) return null;

          const workGroups = [];
          for (const dot of workDots) {
            const last = workGroups[workGroups.length - 1];
            if (!last || last.al !== dot.al) {
              workGroups.push({ al: dot.al, dots: [dot] });
            } else {
              last.dots.push(dot);
            }
          }

          const fills = [];

          for (const group of workGroups) {
            const firstWork = group.dots[0];
            const lastWork = group.dots[group.dots.length - 1];
            const previousAL = group.al - 1;
            const nextAL = group.al + 1;

            const previousSegs = profileSegs.filter(s => s.al === previousAL);
            const nextSegs = profileSegs.filter(s => s.al === nextAL);

            if (
              BASIC_AL[previousAL]?.[1] === 1 &&
              previousSegs.length > 0
            ) {
              const previous = previousSegs[previousSegs.length - 1];
              if (previous.kind === 'rect') {
                const left = previous.x + previous.w - 2;
                const right = firstWork.x;
                if (right > left) {
                  fills.push(
                    <rect
                      key={`dw-${group.al}`}
                      x={left}
                      y={firstWork.y - 1}
                      width={right - left}
                      height={2}
                      fill="#050505"
                    />
                  );
                }
              }
            }

            if (
              BASIC_AL[nextAL]?.[1] === 2 &&
              nextSegs.length > 0
            ) {
              const next = nextSegs[0];
              if (next.kind === 'rect') {
                const left = lastWork.x;
                const right = next.x + 2;
                if (right > left) {
                  fills.push(
                    <rect
                      key={`wa-${group.al}`}
                      x={left}
                      y={lastWork.y - 1}
                      width={right - left}
                      height={2}
                      fill="#050505"
                    />
                  );
                }
              }
            }
          }

          return <>{fills}</>;
        })()}

        {/* [6320] GOSUB 6300 Branch 1 — non-WORK profile plotting. */}
        {profileSegs.map((s, i) => (
          s.kind === 'line'
            ? <line key={i} x1={s.x} y1={s.y} x2={s.x2} y2={s.y}
                stroke={s.colour} strokeWidth={2}
                strokeLinecap={s.activityType === 4 ? "square" : "butt"} />
            : <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.colour} />
        ))}

        {/* [6300] Compucolor raster corner joins for ASCEND↔DECOMPRESS and ASCEND→REST. */}
        {(() => {
          const joins = [];
          const byAL = new Map();
          for (const seg of profileSegs) {
            if (!byAL.has(seg.al)) byAL.set(seg.al, []);
            byAL.get(seg.al).push(seg);
          }

          for (const [al, segs] of byAL.entries()) {
            const flatActivity = BASIC_AL[al]?.[1];
            if (flatActivity !== 4 && flatActivity !== 5) continue;
            const lines = segs.filter(s => s.kind === 'line');
            if (lines.length === 0) continue;
            const first = lines[0];
            const last = lines[lines.length - 1];

            if (BASIC_AL[al - 1]?.[1] === 2) {
              joins.push(
                <rect key={`ad-in-${al}`} x={first.x - 1} y={first.y - 1}
                  width={2} height={2} fill={first.colour} />
              );
            }
            if (flatActivity === 4 && BASIC_AL[al + 1]?.[1] === 2) {
              joins.push(
                <rect key={`ad-out-${al}`} x={last.x2 - 1} y={last.y - 1}
                  width={2} height={2} fill={last.colour} />
              );
            }
          }
          return <>{joins}</>;
        })()}

        {/* [1820] END returns control to the BASIC interpreter. */}
        {diveEndedRef.current && (
          <>
            <text
              x={2}
              y={H / 25 / 2}
              fill={PROMPT_FG}
              fontSize={FONT_SIZE}
              fontFamily="BedsteadRegular, monospace"
              dominantBaseline="central"
            >READY</text>
            <rect
              x={2}
              y={(H / 25) * 1.5 - FONT_SIZE / 2}
              width={FONT_SIZE * 0.62}
              height={FONT_SIZE}
              fill={PROMPT_FG}
            />
          </>
        )}

        {/* [6763] PRINT "OUT OF RANGE":STOP. */}
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
      {tmEntered && (activityStep === 'whichActivity' || activityStep === 'forHowLong' || activityStep === 'toWhatDepth' || activityStep === 'bottomTime' || activityStep === 'nextStageWork') && (
        <input
          autoFocus
          value={activityInput}
          onChange={e => setActivityInput(e.target.value.toUpperCase())}
          onKeyDown={handleActivityKey}
          style={{
            position: 'absolute', top: 0, left: 0,
            opacity: 0, width: '100%', height: '4%', cursor: 'none',
          }}
        />
      )}

      {/* [1280] WD input — invisible keystroke capture for the BASIC prompt. */}
      {titleDone && !wdEntered && (
        <input
          autoFocus
          value={wdInput}
          onChange={e => { setWdError(false); setWdInput(e.target.value.toUpperCase()); }}
          onKeyDown={handleWdKey}
          style={{
            position: 'absolute', top: 0, left: 0,
            opacity: 0, width: '100%', height: '4%', cursor: 'none',
          }}
        />
      )}

      {/* [1304] Time-mode input — invisible keystroke capture; BASIC input is uppercase. */}
      {titleDone && wdEntered && !tmEntered && (
        <input
          autoFocus
          value={tmInput}
          onChange={e => setTmInput(e.target.value.toUpperCase())}
          onKeyDown={handleTmKey}
          style={{
            position: 'absolute', top: 0, left: 0,
            opacity: 0, width: '100%', height: '4%', cursor: 'none',
          }}
        />
      )}

    </div>
  );
}
