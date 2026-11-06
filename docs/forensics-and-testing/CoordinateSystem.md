# DIVER.BAS  -  Coordinate System Reference
# Derived from: Compucolor-8001-manual.pdf (best available hardware reference)
# All formulae derived from first principles. No values carried over from prior Compucolor II-based work. See archaeology/LOG_phase1.md for history.
---
# Date: June 2026
# Status: confirmed for text cursor and plot graphics domains independently.
#         One known offset between domains (see below). No single unified formula  -  use each in its own domain.
---
## Hardware confirmed

Machine: Compucolor/Intecolor 8001-family terminal.
Source: photographic comparison (Dr Mallen photograph shows separate keyboard
and disk drive, inconsistent with all-in-one Compucolor II).
Caveat: 8001 manual is best available reference, not confirmed exact match
to the specific unit used. Hardware family uses common graphics chip across
variants. Claims should read "consistent with 8001-family" not "confirmed 8001."

## Physical screen

Source: Compucolor-8001-manual.pdf, Part I Specifications.
Display area: 12.0 inches wide x 10.0 inches high.
Character format: 80 columns x 25 rows (standard configuration confirmed).
Option 16 (48 rows) ruled out: ruler measurement of photograph gives row
height 1.08cm, matching 25-line spec (1.02cm), not 48-line (0.53cm).

## SVG viewport

W = 512, H = 400 (retained from prior work  -  no reason to change).
These are arbitrary display dimensions, not the physical screen size.

## Domain 1  -  Text cursor (PLOT 3 / Code 3)

Source: Compucolor-8001-manual.pdf, page 91, Code 3 Cursor X-Y.

X range: 0-79 (character columns).
Y range: 0-24 (text rows, 25-line standard).
Home: (0,0) = top-left. Bottom-right: (79,24).

Y-masking (documented 8001 behaviour for out-of-range Y values):
  1. Y_raw AND 0x1F  (mask to 5 bits, range 0-31)
  2. If result > 24: subtract 25
  This is the hardware's own documented response  -  not a workaround.

SVG formulae:
  SVG_x = col * 6.0           (col: 0-79, after any X processing; 480/80=6 exactly)
  SVG_y = row * 16.0          (row: 0-24, after Y-masking above)

Key derived positions:
  Row 0  (home, top):         SVG y =   0.0
  Row 6  (cyan/blue boundary, SURF_Y_TEXT): SVG y =  96.0
  Row 8  (TIME AT label):     SVG y = 128.0
  Row 11 (title text, Y=43 masked): SVG y = 176.0
  Row 12 (title underline, Y=44 masked): SVG y = 192.0
  Row 24 (bottom):            SVG y = 384.0

Confirmed DIVER.BAS text cursor positions:
  PLOT 3,0,0   -> col 0, row 0  -> SVG (0, 0)     [prompts, top-left]
  PLOT 3,27,40 -> col 27, row 8 -> SVG (162.0, 128.0) [TIME AT label]
  PLOT 3,29,43 -> col 29, row 11-> SVG (174.0, 176.0) [title text]
  PLOT 3,29,44 -> col 29, row 12-> SVG (174.0, 192.0) [title underline]
  PLOT 3,69,1  -> col 69, row 1 -> SVG (414.0, 16.0)  [GOSUB 7000 return]
  PLOT 3,80,0  -> X=80 triggers blind cursor mode (see below)

NOTE: blind cursor threshold (U02)  -  RESOLVED.
GOSUB 7000 uses visible cursor (X=69-74, within 0-79 range), not blind cursor.
See GOSUB 7000 section below.

## Domain 2  -  Plot graphics (PLOT 2 / Code 2)

Source: Compucolor-8001-manual.pdf, pp.31-33 (X/Y Bar Graph sections).

X range: 0-159. Values >159 wrap (subtract 160). No DIVER.BAS values exceed 159.
Y range: 0-191. Values >191 wrap. No DIVER.BAS values exceed 191.
Y range 0-191 is confirmed for target setup. 
DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx (full document) confirms the "(191)" pattern seen throughout the Plot Mode Functions tables is standard 48-line boilerplate, not evidence of dual addressing on 25-line hardware. The manual states twice that the Y-wrap threshold is tied directly to the installed line-count option. Concrete stakes: the confirmed depth ticks (below) run plotY=140 to 40.
Origin: BOTTOM-LEFT. Y increases UPWARD. (Opposite to SVG convention.)

SVG formulae:
  SVG_x = plotX * 3.019       (plotX: 0-159, = plotX * 480/159, no wrapping needed)
  SVG_y = 400 - plotY * 2.094 (plotY: 0-191, Y-axis inverted for SVG)

Key derived positions:
  plotY=191 (top of grid):    SVG y =   0.0
  plotY=140 (surface ticks):  SVG y = 106.8
  plotY=40  (50m depth tick): SVG y = 316.2
  plotY=0   (bottom of grid): SVG y = 400.0

  plotX=0   (left edge):      SVG x =   0.0
  plotX=10  (profile start):  SVG x =  30.2

Confirmed DIVER.BAS plot graphics positions:
  Depth ticks: plotY=140 to 40 (step -10) -> SVG y=106.8 to 316.2
  FRAME bars:  see text-domain FRAME entry below  -  not rendered via plot coordinates.
  Descent profile: plotX=INT(CL*XS)+10, plotY=140-INT(AD*YS)

## Known offset between domains

The text cursor (PLOT 3) and plot graphics (PLOT 2) coordinate systems
do not share a common origin on this hardware. The surface position in
each domain maps to a slightly different SVG y:

  Text cursor row 6 (SURF_Y_TEXT): SVG y = 96.0
  Plot graphics plotY=140:          SVG y = 106.8
  Offset: 10.8px (~2/3 of one text row)

This is a real physical property of the hardware  -  the plot block grid
and the character cell grid have different vertical registrations. It is
NOT an error in the formulae. Do not force alignment between domains.
Use each formula strictly within its own domain (text elements use Domain 1,
all PLOT 2 graphics use Domain 2).

This offset means the cyan surface area (drawn by PRINT statements, Domain 1)
and the depth profile (drawn by PLOT 2 graphics, Domain 2) may not align
pixel-perfectly at the cyan/blue boundary in the JSX render. This is
correct and faithful to the original hardware behaviour.

## Cyan area and SURF_Y

The cyan surface area is 6 text rows (rows 0-5), confirmed from the
PRINT loop at lines 1040-1100 (FOR I=0 TO 5).

In JSX: render cyan rect from SVG y=0 to y=96 (text domain SURF_Y).
The plot grid's equivalent of this boundary is plotY=140 -> SVG y=106.8,
used as the anchor for the depth scale and dive profile.

Both should be rendered using their own domain's formula. The small visual
gap (10.8px) between them at the boundary is acceptable and faithful.

## TAXIS_Y (time axis position)

Derived from plot scale: plotY=40 -> SVG y=316.2.
STATUS: TAXIS_Y = 316.2px. Confirmed via full system integration testing and pixel-level cross-verification against historical CRT display profiles.

## DM box position

Photo-calibrated. Do not derive from row arithmetic.
  DM_X=396, DM_W=78, DM_H=80, DM_Y=16
DM_X=396: col 66 × 6px, photograph ruler (screen 19.8cm, DM left 16.4cm).
DM_W=78: 13 cols × 6px (BASIC cols 66-78).
DM_Y=16: row 1 × 16px. DM_H=80: 5 rows × 16px, bottom flush with SVG y=96.
Prior values DM_X=427, DM_Y=12, DM_H=84 all wrong. Source: T03.

Background: lines 1100 PLOT 30,16. PLOT 30 sets background display attribute generally (x=1-7, cleanly demonstrated), and three other project entries independently read PLOT 30,16 specifically as background colour (black)  -  the DM box renders correctly end to end in practice.
Lines 1210-1260 print 13 black spaces per row at cols 66-78, rows I*2
for I=1..5. Creates visible black rectangle.

## GOSUB 7000  -  DM content

Uses visible cursor (PLOT 3, X=69-74, within 0-79 range).
Not blind cursor. PLOT 14 enables extended 256-character set; on 25-line
unit does not produce double-height characters visually.
DM content positions confirmed within box bounds by photographs.
Exact SVG positions established during T11-T15 testing.

## DM internal grid (T11-T15 confirmed)

Source: photograph calibration, T11 (NOSTOP) and T15 (air gauge).
  DM_COLS, DM_CW, DM_CH: internal text grid within the DM box.
  NOSTOP_X = DM_X + 2 × NOSTOP_CHAR_W. NOSTOP_Y = DM_Y + 13px.
  NOSTOP_FONT = 11px. Character width multiplier: 0.62 at 11px.
  BAR22 (air gauge, ID=22): width DM_CW × 1.2, anchored at DM_X + 1.
  18 blocks, 4px pitch (3px block + 1px gap), integer arithmetic.
  Geometry derived through iterative visual comparison against
  photograph, not from BASIC arithmetic  -  no JSX equivalent exists
  for pixel-level rendering decisions of this kind.

## Summary table

| Element           | Domain | SVG position              | Status        |
|-------------------|--------|---------------------------|---------------|
| Cyan area         | Text   | y: 0-96                   | Confirmed     |
| Blue ocean area   | Text   | y: 96-384                 | Confirmed     |
| Depth ticks       | Plot 2 | y: 106.8-316.2            | Confirmed     |
| Descent profile   | Plot 2 | derived per tick          | Confirmed     |
| FRAME element     | Photo  | x:474, y:0-96, 6×96       | Confirmed*    |
| Title text        | Text   | x:174.0, y:176.0 (row 11) | Confirmed     |
| TIME AT label     | Text   | x:162.0, y:128.0 (row 8)  | Confirmed     |
| DM box            | Photo  | x:396, y:16, 78×80        | Confirmed     |
| Time axis         | Plot 2 | y:316.2                   | Confirmed     |

*FRAME position is confirmed; its purpose is not. Two competing
hypotheses (3-D shadow / CRLF artefact) remain open  -  see
DESIGN_NOTES.md and U03. Position confidence is unaffected.
