// DiverSimT05test.jsx — T05 hypothesis test
// Tests whether "TIME AT 10 MINUTE INTERVALS" overwrites title text
// when title is rendered in small character mode (PLOT 14,15 active).
// Do not merge back to DiverSim.jsx until hypothesis confirmed.
// Coordinate system: CoordinateSystem.md

import { useState, useEffect } from "react";

// ── Runtime: Bedstead font — loaded via style tag; font-family 'BedsteadRegular' ──

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

// [100] CLEAR 20 — string space reservation, no JSX equivalent

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

const DM_X = 396;   // col 66 x 6px
const DM_Y = 16;    // row 1 x 16px
const DM_W = 78;    // 13 cols x 6px
const DM_H = 80;    // 5 rows x 16px

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
// [1265] PLOT 3,29,43             — col 29, Y=43 in small character mode
// [1265] PRINT "DIVER SIMULATION MODEL."
// [1266] PLOT 3,29,44             — col 29, Y=44 in small character mode
// [1266] PRINT "-----------------------"
//
// T05 TEST: small characters active (PLOT 14,15 at line 1261).
// Title positioned 2 small-character rows below TAXIS_LABEL_Y.
// Small character row height = H/50 = 8px.
// If TAXIS label overwrites title, hypothesis confirmed.

const BASIC_TITLE     = "DIVER SIMULATION MODEL.";
const BASIC_UNDERLINE = "-----------------------";
const SMALL_ROW = H / 50;              // 8px — small character row height
const TITLE_X  = 29 * (W / 80);       // col 29 -> SVG x=174px
const TITLE_Y1 = 21 * (H / 25) + SMALL_ROW;        // 1 small row below Taxis label
const TITLE_Y2 = TITLE_Y1 + SMALL_ROW;             // one small row below title

const titleCells = [];

// [1265] PRINT "DIVER SIMULATION MODEL."
Array.from(BASIC_TITLE).forEach((ch, idx) => {
  titleCells.push({
    ch,
    x: TITLE_X + idx * (W / 80),
    y: TITLE_Y1,
    fontSize: SMALL_ROW,
  });
});

// [1266] PRINT "-----------------------"
Array.from(BASIC_UNDERLINE).forEach((ch, idx) => {
  titleCells.push({
    ch,
    x: TITLE_X + idx * (W / 80),
    y: TITLE_Y2,
    fontSize: SMALL_ROW,
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
// [1277] PLOT 255 — end of stream; no JSX equivalent

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
// Bedstead font, 10px. Used throughout for all text rendering.
const FONT_SIZE = 10;

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
const PRINT_INTERVAL_MS = 20;

// ── Lines 1278–1281: working depth prompt ─────────────────────
// [1278] PRINT CHR$(7)  — bell; no JSX equivalent
// [1279] PLOT 3,0,0     — cursor home
// [1279] PRINT CHR$(7); — bell on re-prompt; no JSX equivalent
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

const PROMPT_TM = "TIME MODE (REAL OR ACCELERATED)? ";

const PROMPT_WD  = "WORKING DEPTH ";
const PROMPT_FG  = "#050505";  // black — CCI byte 48 FG

export default function DiverSim() {
  // visibleCount: how many printCells have been revealed so far.
  // Starts at 0 (blue screen only); increments by 1 per interval tick.
  const [visibleCount, setVisibleCount] = useState(0);

  // [1280–1281] Working depth input state.
  // wdEntered: true once a valid WD has been accepted.
  // wdInput: current value of the HTML input element.
  // wdError: true if last entry was invalid (triggers re-prompt bell).
  const [wdEntered, setWdEntered]   = useState(false);
  const [wdInput,   setWdInput]     = useState('');
  const [wdError,   setWdError]     = useState(false);

  // [1303–1308] Time mode input state.
  // tmEntered: true once time mode response accepted.
  // tmInput: current value of input element.
  const [tmEntered, setTmEntered] = useState(false);
  const [tmInput,   setTmInput]   = useState('');

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

  // Total animated cells across all print sequences in order of execution.
  // Phase 1: printCells  (T02, lines 1040–1100)
  // Phase 2: dmCells     (T03, lines 1210–1260)
  // Phase 3: vertCells   (T04, lines 1261–1264)
  // Phase 4: titleCells  (T05, lines 1265–1266)
  // Phase 5: taxisCells  (T10, lines 1360–1361) — after T07/T08 input phases
  const totalCells = printCells.length + dmCells.length + vertCells.length + titleCells.length + taxisCells.length;

  // Phase boundaries
  const printDone  = visibleCount >= printCells.length;
  const dmCount    = printDone ? visibleCount - printCells.length : 0;
  const dmDone     = visibleCount >= printCells.length + dmCells.length;
  const vertCount  = dmDone ? visibleCount - printCells.length - dmCells.length : 0;
  const vertDone   = visibleCount >= printCells.length + dmCells.length + vertCells.length;
  const titleCount = vertDone ? visibleCount - printCells.length - dmCells.length - vertCells.length : 0;
  const titleDone  = visibleCount >= printCells.length + dmCells.length + vertCells.length + titleCells.length;
  const taxisCount = tmEntered ? visibleCount - printCells.length - dmCells.length - vertCells.length - titleCells.length : 0;

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
    <div style={{ background: "#000", padding: 8, position: 'relative' }}>
      <style>{`
        @import url('https://fontlibrary.org//face/bedstead');
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

        {/* [1265–1266] PRINT title and underline — small characters, char by char */}
        {/* T05 TEST: rendered in small character mode (SMALL_ROW=8px). */}
        {titleCells.slice(0, titleCount).map((c, i) => (
          <text
            key={i}
            x={c.x + (W / 80) / 2}
            y={c.y + c.fontSize / 2}
            fill={CYAN}
            fontSize={c.fontSize}
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
              x={2 + (PROMPT_WD.length + wdInput.length) * FONT_SIZE * 0.57}
              y={H / 25 / 2 - FONT_SIZE / 2}
              width={FONT_SIZE * 0.57}
              height={FONT_SIZE}
              fill={PROMPT_FG}
            >
              <animate attributeName="opacity" values="1;1;0;0"
                keyTimes="0;0.5;0.5;1" dur="0.75s" repeatCount="indefinite" />
            </rect>
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
              x={2 + (PROMPT_TM.length + tmInput.length) * FONT_SIZE * 0.57}
              y={H / 25 / 2 - FONT_SIZE / 2}
              width={FONT_SIZE * 0.57}
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

      </svg>

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
    </div>
  );
}
