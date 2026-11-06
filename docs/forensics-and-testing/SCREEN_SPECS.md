# DIVER.BAS  -  Confirmed Screen Specifications

Hardware: Compucolor/Intecolor 8001-family, standard configuration.
All figures from Compucolor-8001-manual.pdf unless noted.

---

## Physical Screen
- Size: 19" diagonal. Display area: 12.0" wide × 10.0" high (304.8mm × 254mm).
- Source: Compucolor-8001-manual.pdf, Specifications p.77.

## Character Grid
- 80 columns × 25 rows. Cursor home: top-left (0,0). Bottom-right: (79,24).
- Source: Compucolor-8001-manual.pdf p.77, p.91.

## Plot Grid
- 160 blocks wide (80 cols × 2). Y range: 0-99 (25-line) or 0-191 (48-line).
- Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx (primary manual section).
- ⚠ TENSION: DIVER.BAS uses plotY values up to 191. On confirmed 25-line
  hardware these wrap at 99, producing nonsensical depth tick positions.
  Whether 25-line hardware addresses 0-191 regardless of physical row count
  is unconfirmed. CORRECTED 05 July 2026: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx
  (full document) confirms the "(191)" pattern seen throughout is standard
  boilerplate for the 48-line alternative ("160 wide by 100 (192 for 48 Line)
  high"), not evidence of dual addressing on 25-line hardware  -  retracts an
  earlier same-day reading to the contrary.
  SHARPENED 05 July 2026: the tension is now UNAMBIGUOUS. The manual states
  twice that the Y-wrap threshold is tied directly to the installed
  line-count option ("...all larger values will cause 100 (192) to be
  subtracted from the new value of Y..."). No room left for "25-line
  hardware might still address 0-191 regardless." Concrete stakes: the
  confirmed depth ticks below run plotY=140 down to 40  -  if the 25-line
  unit genuinely wraps at 100, plotY=140 wraps to 40, landing on the same
  row as the existing plotY=40 tick. Specific test: send Y=140 on a CCEMU
  25-line configuration and see where the block lands.
  Emulator test still required. See TODO U14, LOG.md 05 July 2026. Do not
  alter Domain 2 formulae until resolved.
- Source: Compucolor-8001-manual.pdf pp.31–33.

## Cursor Addressing (PLOT 3 / Code 3)
- X range: 0–79. Y range: 0–24.
- Out-of-range masking: X AND 0x7F then −80 if >79. Y AND 0x1F then −25 if >24.
- Source: Compucolor-8001-manual.pdf p.91.

## Blind Cursor (PLOT 3, X≥80)
- Triggered when X byte ≥ 80 (X=80 → column 0 of DM box region).
- X masked 0–127, Y masked 0–31 (25-line) / 0–63 (48-line option).
- Source: Compucolor-8001-manual.pdf p.91.

## CCI Byte Encoding (PLOT 6 / Code 6)
- A0=RedF A1=GreenF A2=BlueF (foreground). A3=RedB A4=GreenB A5=BlueB (background).
- A6=Blink. A7=Plot character (2×4 block mode).
- Source: Compucolor-8001-manual.pdf Code 6.

## Flag Control Codes 29/30
- Code 29 = Flag Off: sets Reverse Field flag to 0. Code 30 = Flag On: sets it to 1.
- Same flag governs XOR/erase behaviour in Plot Mode (per DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx)
  and Reverse Field in text mode  -  dual-purpose flag depending on active mode.
- ⚠ Code 29/30 also exist as ESC-prefixed (Code 27 + 29/30) escape sequences with unrelated
  meanings (Block Receive Mode, Jump to RAM). Direct (non-ESC-prefixed) byte 29/30 in a byte
  stream = Flag Off/On; only applies when not preceded by ESC (Code 27).
- Source: Compucolor-8001-manual_pdfgear_com_.docx, control code table (running text).
 
## SVG Coordinate Formulae
- X: SVG_x = plotX × (480/159) ≈ plotX × 3.019. W=480 chosen: 480/80=6px per char cell (whole number).
- Y: SVG_y = 400 − plotY × 2.094. Y=0 is bottom of plot area; positive upward.
  plotY=140 → SVG_y=106.8. plotY=40 → SVG_y=316.2.
- Source: Compucolor-8001-manual.pdf pp.31-33; SVG dimensions photo-derived.

## Row Height Reference
- 25 rows in 254mm display height → ~10.2mm per row.
- Photographic cross-check: ~10.8mm per row (within 6%). Confirms 25-line.
- Source: Compucolor-8001-manual.pdf p.77; photographic ruler, June 2026.
