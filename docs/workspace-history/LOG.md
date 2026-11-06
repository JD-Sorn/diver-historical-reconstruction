# DIVER.BAS  -  Project Log
# Append-only. One finding per entry. Cross-references only.
# Full evidence in reference/ and tests/ folders.
# Supersedes LOG_phase1.md (archived June 2026  -  reset following identification of correct hardware manual: Compucolor 8001, not Compucolor II. All prior coordinate work provisional.)
# Style (28 July 2026, per John): state achievements and roll-backs, minimal explanation  -  routine/expected work isn't worth narrating.
# Save real narrative for what's actually notable: a clever bit of original BASIC, an old/new mismatch needing action, AI drift caught and corrected, occasional test results.
---
## June 2026
### 8001 manual: plot grid X:0-159, Y:0-191 confirmed
Source: Compucolor-8001-manual.pdf pp.31-33 (X/Y Bar Graph sections)
### 8001 manual: text cursor X:0-79, Y:0-24 (25-line), Y-masking AND 0x1F
Source: Compucolor-8001-manual.pdf p.91 (Code 3, Cursor X-Y)
### 8001 manual: screen 25-line confirmed (not 48-line Option 16)
Source: ruler measurement (photo) vs spec (p.1 Part I)  -  row height match
### 8001 manual: CCI byte encoding confirmed, matches prior work
Source: Compucolor-8001-manual.pdf Code 6 section
### 8001 manual: Code 12 = Erase Page confirmed
Source: Compucolor-8001-manual.pdf Code 12 section
### Title text Y=43 resolves to row 11 via documented Y-masking
Source: 8001-manual.pdf p.91 + DIVER.bas lines 1265-1266
### ID=22 air gauge: 1 dark / 3 magenta / 13 green / 1 dark confirmed
Source: LOOPTRACE6.BAS screenshot + BASIC lines 7300-7342
Evidence: reference/emulator_screenshots/looptrace6_AG_VA13.png
### GOSUB 7000 uses visible cursor (X=69-74), not blind cursor  -  U02 resolved
Source: BASIC GOSUB 7000 analysis; Compucolor-8001-manual.pdf p.91
### PLOT 14: extended character set (256 types) on 25-line unit  -  not size-doubling
Source: BASIC GOSUB 7000 analysis; Compucolor-8001-manual.pdf Code 14
### PLOT 27,11 scroll mode confirmed as scroll, not erase  -  U05 resolved
Source: BASIC source analysis; DIVER.BAS line 1264
### PLOT 30: sets background colour  -  PLOT 30,16 = black bg, PLOT 30,22 = prior colour
Source: BASIC lines 1010, 1100; contextual analysis
### x-axis formula derived: SVG_x = plotX × (512/159) ≈ plotX × 3.220
Source: 8001 plot grid (Compucolor-8001-manual.pdf pp.31-33); SVG width 512px photo-derived
⚠ Not yet independently confirmed by photograph ruler measurement  -  see U01
### T00 complete: coordinate system derived, two domains confirmed
Source: reference/CoordinateSystem.md; Compucolor-8001-manual.pdf pp.31-33, p.91
### SVG width revised: W=480 (480/80=6px per char cell, whole number alignment)
Source: TESTING_PLAN.md U01 derivation; supersedes W=512. Formula: SVG_x=plotX*(480/159)≈3.019
### T01 complete  -  line 1010, blue background
DiverSim.jsx verified to line 1010. Solid blue screen, W=480 H=400.
Evidence: DiverSim.jsx rendered in browser, confirmed correct.
### T02 complete: cyan surface + FRAME element. DiverSim.jsx verified to line 1100.
Evidence: DiverSim.jsx; shapeRendering="crispEdges" added to SVG element.
### T02: cyan/FRAME 2.4px gap confirmed correct  -  inter-domain offset, not error
Source: CoordinateSystem.md (Domain 1 y=96, Domain 2 plotY=144→y=98.4); do not correct.
### T02: print animation at 40ms/cell (25 chars/sec)  -  rate chosen for legibility, not hardware
Source: DiverSim.jsx PRINT_INTERVAL_MS. FRAME timing simplified: segments appear after all 474 cells, not per-row. Acceptable at this speed.
### T03 complete: DM box black rectangle. DiverSim.jsx verified to line 1260.
Evidence: DiverSim.jsx. DM_X corrected to 396, DM_W corrected to 78.
### DM_X corrected: 396 (col 66 × 6px), confirmed by photograph ruler measurement
Source: photo ruler  -  screen width 19.8cm, DM left edge 16.4cm → 397.9px ≈ 396px. Prior value 427 wrong.
### DM_W corrected: 78 (13 cols × 6px). DM_Y=12 and DM_H=84 unchanged.
Source: BASIC lines 1210-1260 (13 black spaces cols 66-78); CoordinateSystem.md.
### PLOT 30 mechanism clarified: Code 30 (Flag On) + CCI byte  -  not XOR plotting
Source: T03 analysis. PLOT 30,16 = Flag On + CCI byte 16 (black bg). Prior LOG entry correct in effect, wrong in mechanism.
### U10 raised: DM box even-row loop (rows 2,4,6,8,10) vs solid rect in photograph  -  unresolved
Source: BASIC lines 1210-1260; photograph. Solid rect rendered as reasonable approximation pending investigation.
### T02 FRAME bar corrected: single white rect x=474 (col 79 × 6px), y=0, w=6px, h=96px
Source: photograph. Text-domain boundary SVG y=96 confirmed. Plot-domain y=98.4 rejected. 3-D shadow hypothesis stands.
### PRINT semicolon confirmed: missing from transcription, found by emulator test
Source: emulator test T03. Without semicolon characters do not stay on same row. Solid rectangle explained by loop + semicolon + PLOT 30,16.
### DM_Y corrected: 16 (row 1 × 16px). DM_H corrected: 80 (5 rows × 16px, bottom flush SVG y=96)
Source: T03 implementation. Prior values DM_Y=12, DM_H=84 wrong. All prior LOG entries for these values superseded.
### PLOT 30 partial clarification: 30,15=small characters, 30,16=large characters  -  confirmed by emulator
Source: emulator tests T02/T03. Background-colour meaning of byte 16 unconfirmed. PLOT 30,20=blue bg in coloured bands section. Prior LOG entry on PLOT 30 background should be read with this caveat.
### CORRECTION NOTE: prior LOG entry "DM_Y=12 and DM_H=84 unchanged" is wrong
Source: subsequent LOG entry (DM_Y corrected to 16, DM_H corrected to 80). Both values were later corrected.
### OPEN QUESTION: plot grid height  -  physical 25×4=100 blocks vs manual Y range 0-191 (192 values)
Source: SCREEN_SPECS.md. May reflect different manual sections or 48-line vs 25-line configuration. All current work uses Y:0-191. Needs investigation.
### T04 complete: "5 METRE UNITS" vertical label, col 3 SVG x=18px, top at SVG y≈128 (plotY=130)
Source: photograph; DIVER.BAS lines 1261-1264. PLOT 27,10 = vertical cursor advance (not rotation).
### T05 coded: title text col 29 rows 11-12, SVG x=174 y=176/192, cyan on blue
Source: BASIC lines 1265-1266; CoordinateSystem.md. Position pending emulator confirmation.
### T06 complete: 11 cyan depth ticks, col 1 SVG x=6px (~2.1px high). Corrects plan entry (was col 0).
Source: photograph; DIVER.BAS lines 1273-1277.
### T07 complete: working depth prompt CCI byte 48, 300ms/1400Hz bell, blinking cursor, BASIC_WD assigned
Source: BASIC lines 1278-1281, GOSUB 5000. Cursor width multiplier 0.57 at Bedstead FONT_SIZE=10.
### Bedstead font: SAA5050 teletext approximation, fontlibrary.org. Width multiplier 0.57 at FONT_SIZE=10.
Source: DiverSim.jsx. Not confirmed against actual 8001 character ROM.
### PRINT_INTERVAL_MS revised to 20ms universal rate for all PRINT loops. Supersedes 40ms noted at T02.
Source: DiverSim.jsx.
### PLOT 30 ongoing: 30,15=small chars, 30,16=large chars confirmed. Background on cyan bg pending.
Source: emulator tests T04. PLOT 30,20=blue bg in coloured bands. Not reconciled with 8001 manual.
### U06 reopened: "overwritten by profile" explanation retracted  -  title text still unexplained
Source: TESTING_PLAN.md U06 correction. See DESIGN_NOTES.md for full statement. Prior LOG entry superseded.
### T09 complete: time axis tick marks, 8 ticks at SVG y=326.7px (plotY=35), cyan
Source: DiverSim.jsx; photograph (tick height doubled to 2 plot units). ⚠ y-position subject to U09.
### T05 investigation paused: small chars active at line 1265, title lands near time axis area
Source: DiverSimT05test.jsx. Scroll mode active from line 1264  -  scroll behaviour unknown. See U11.
### U11 raised: PLOT 27 scroll behaviour  -  trigger, direction, line count, content effect all unknown
Source: T05 investigation; TESTING_PLAN.md U11. Directly affects T05 closure.
### T11 complete: NOSTOP string in DM, green (CCI byte 2), BedsteadBoldUltraCondensed 11px
Source: DiverSim.jsx. Position photo-calibrated. Spacing set for "NOSTOP 30" (9 chars). Fonts self-hosted.
### T12 complete: PA array (9×6, 1-based) and BASIC_PA_scalar initialised  -  pure state, no screen output
Source: DiverSim.jsx. BASIC_PA_scalar per STYLE_GUIDE dual scalar/array convention. Populated in handleTmKey.
### T13 complete: ES array (31×3, 1-based), BASIC_ES_scalar=1, BASIC_EP=0  -  pure state
Source: DiverSim.jsx. Convention per STYLE_GUIDE. Placed in handleTmKey alongside T12.
### T14a-T14e, T15a: six DM open items identified during T14 implementation
Source: sandbox Claude analysis. Stubs marked ⚠ STUB in DiverSim.jsx. Detail in TODO DM BOX section.
### T10 complete: "TIME AT 10 MINUTE INTERVALS" label, col 27, SVG y=336px (row 21), photograph-confirmed
Source: DiverSim.jsx; photograph. ⚠ Y-masking gives row 8 (128px)  -  discrepancy of exactly 13 rows (208px).
### T10 discrepancy: 13-row offset from Y-masking formula  -  scroll hypothesis, depends on U11
Source: sandbox analysis. Hypothesis: PRINT scroll events between lines 1264-1360 shift cursor origin 13 rows.
All PLOT 3 positions after line 1264 are photograph-calibrated until U11 resolved.
### T14 complete: initial depth gauge (IDs 19-20 digits, ID=21 skipped at AD=0), visually confirmed
Source: DiverSim.jsx. gosub_6600() and gosub_7000() in place. Six stubs marked T14a–T14e, T15a.
### T15 complete: air gauge initial state, 18 blocks (1 dark/2 blue/14 green/1 dark), VA=13 at CL=0
Source: DiverSim.jsx; photograph calibration. 4px pitch, DM_CW*1.2 width. Stub T15a in place.
### T15 colour discrepancy: BASIC/archive gives 3 magenta; photograph shows 2 blue  -  unresolved
Source: BASIC line 7301 vs photograph. CCI decode or CRT phosphor uncertainty. Current rendering: 2 blue.
### NOSTOP confirmed double-height: NOSTOP_FONT * 2 = 22px, consistent with PLOT 14 on 25-line unit
Source: T15 visual confirmation. Consistent with DESIGN_NOTES PLOT 14 entry.
### Browser translation popup fixed: translate="no" on body + notranslate meta tag
Source: index.html. lang="en" alone insufficient  -  likely triggered by simulated screen text content (Bedstead font, dense numeric/short-string display).
### OPEN QUESTION  -  plot grid dimensions: three conflicting figures, investigation underway
Source: manual p.77 (100), manual pp.31-33 (0-191/192), Wikipedia tertiary source (192x160, axes possibly transposed).
Wikipedia figure not treated as evidence. Code currently matches photographs in layout (values were
photo-calibrated by eye, not formula-derived), so existing positions likely unaffected even if formula
range is wrong. John investigating primary manual directly. No coordinate formulae altered pending resolution.
### T18 started: descent profile (GOSUB 6300 Branch 1), point-to-point line implemented, unconfirmed
Source: DiverSim.jsx. PLOT 6,32,29,2,253,LP,MP,242,LQ,MQ,255 implemented as simple point-to-point line  - 
assumption that Code 2 takes coordinate pairs is UNCONFIRMED. PLOT sends individual bytes; how the VDU
interprets bytes 253/242 within the stream (separators, sub-modes, or other) is unknown. Photograph
evidence suggests possible vertical-drop step pattern rather than smooth diagonal. Resolving via emulator
byte-stream testing, in progress.
### T15 font fix complete: slashed zero and all numeral rendering resolved
Source: font-variant-numeric: slashed-zero applied at DiverSim.jsx root. Baseline-variant digit issue
(3,4,5,7,9 below baseline vs 6,8 above) also resolved via same font amendment. No longer an open item.
### DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx: vector mode (binary 242/241) confirmed  -  straight line between two points
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx. "Best straight line fit between X₀,Y₀ and X₁,Y₁ using plot blocks."
### U13 resolved: plot grid 160×100 (25-line) or 160×192 (48-line)  -  confirmed from primary manual
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx. Y:0-99 (25-line), Y:0-191 (48-line). Wikipedia axes were transposed.
### New tension: DIVER.BAS plotY values exceed 25-line Y max of 99  -  wrapping produces nonsensical results
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx vs DIVER.BAS BASIC values. plotY=140 and plotY=40 both map to 40 on
25-line hardware. Either machine was 48-line, or 25-line hardware addresses 0-191 regardless of row count.
Emulator test required before coordinate formulae can be settled.
### Code 29 in descent profile byte stream  -  purpose unknown
Source: DIVER.BAS GOSUB 6300 Branch 1. PLOT 6,32,29,2,253,LP,MP,242,LQ,MQ,255  -  byte 29 precedes Plot Mode
entry. Not covered in DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx. Investigate before T18 can be fully closed.
### Code 29 = Flag Off (Reverse Field flag → 0)  -  confirmed purpose in descent profile
Source: 8001 manual Code 29; DIVER.BAS GOSUB 6300 Branch 1. Defensive reset before
Plot Mode entry  -  ensures XOR/erase mode is inactive before drawing vector segment.
### Code 29 citation upgraded: verified against Compucolor-8001-manual_pdfgear_com_.docx
Source: Compucolor-8001-manual_pdfgear_com_.docx (control code table + running text, p.17 area;
also control code summary table). Manual contains TWO code-29 definitions in different tables:
(1) direct single-byte Control Code 29 = "Flag Off" (Reverse Field flag → 0); (2) ESC-prefixed
(Code 27 + 29) = "Block Receive Mode", an unrelated escape-sequence command. DIVER.BAS descent
profile stream (6,32,29,2,253,LP,MP,242,LQ,MQ,255) has no preceding ESC byte, so byte 29 there
is the direct control code (Flag Off), consistent with prior LOG entry. Flag Off/On (Codes 29/30)
is the same flag documented in DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx as controlling XOR/erase
behaviour in Plot Mode, and matches the earlier PLOT 30 = Flag On finding (T03). Consistent
evidence chain across three sources.
⚠ OCR CAVEAT: this manual copy is machine-OCR'd (pdfgear.com), with visible artefacts (garbled
table columns, misread characters e.g. "9FA�H" for a RAM address, "Cz" for "26"). John proof-reading
and will supply a corrected Word document of the control/escape code tables  -  some time out. Treat
running-text sentence definitions (e.g. "Code 29 Flag Off...") as reliable; treat raw OCR'd summary
tables with caution until the corrected version is available.
### Hand-drawn character grid: cross-hatched glyph at col F = non-printing placeholder, not a real character
Source: hand-drawn "Secrets of the printing characters" reference sheet (16×16 grid, codes 00-FF);
cross-checked against DePaul ASCII table (condor.depaul.edu/sjost/it236/documents/ascii.htm). The
recurring cross-hatched mark at column F in several rows (e.g. 0x1F, 0x7F) has no ASCII counterpart  - 
0x7F is DEL, a non-printing control code in standard ASCII. This confirms the grid documents the
Compucolor character-generator ROM's actual print output for every byte value, not standard ASCII
control-code semantics: the ROM draws a visible placeholder glyph for non-printing positions rather
than leaving them blank. Relevant to T14d/U08 (DM content IDs 7-18 unconfirmed)  -  any GOSUB routine
sending a byte in this range would render this placeholder, not a letter or symbol. Full grid
transcription in progress (~1/3 complete); table to be rebuilt in corrected manual Word doc.
### Hand-drawn character grid: full 16×16 transcription complete  -  supersedes prior partial entry
Source: "Secrets of the printing characters" reference sheet, full transcription. Structure confirmed:
  00-1F: small letters + symbols (` a-z { | } ~ + placeholder at col F)
  20-5F: standard ASCII symbols/digits/uppercase (matches DePaul ASCII table exactly)
  60-7F: repeats 00-1F verbatim (small letters)
  80-9F, A0-DF: repeats 00-1F / 20-5F verbatim, rendered as BIG (double-height) glyphs  -  top half
    printed on odd lines, bottom half on even lines, same code for both halves (per source annotation)
  E0-FF: repeats 80-9F pattern (BIG letters continuation)
"DEL" placeholder (col F of 00-1F/60-7F/80-9F/E0-FF blocks): ⚠ UNRESOLVED, not confirmed.
Author's own note on the source sheet: the glyph at 1F/7F/9F/FF is a symbol resembling a hash
but with three lines in each direction (denser cross-hatch than a standard #), and its identity
as DEL is the author's tentative reading, not a confirmed mapping. Downgrades prior LOG entry
("cross-hatched glyph = non-printing placeholder, not a real character") from confirmed to
plausible-but-unresolved. Do not treat "DEL" as settled for these four positions pending
further verification (e.g. against 8001 manual character-generator ROM section, if it exists).
CORRECTION: cell 00,0 is backtick (`) not dash (-) as read from low-res crop in prior session.
⚠ POSSIBLE GAP: cell A0,3 transcribed blank; expected # per A0-DF mirroring 20-5F. Needs re-check
against original sheet.
Confirms extended character set accessible via PLOT 14 (256-character mode) is this full grid,
directly relevant to T14d (DM routing for IDs 7-18) and U08 (DM content unconfirmed).
### U16 RESOLVED: glyph at 1F/7F/9F/FF is the character ROM's non-printable fallback glyph
Source: John's terminology note. The hash-with-three-lines symbol is a waffle/mesh/checkerboard
pattern  -  the standard 1979-era convention for a character-generator ROM's "no glyph defined"
fallback (equivalent in function to the modern "tofu" □). By definition this glyph doesn't map
to one specific code point; it's rendered wherever no printable character is defined, which is
sufficient to explain its recurrence at the last column of each alphabetic 32-code block. No
further code-point identification is needed or applicable. Any DM routine (T14d/U08) sending a
byte to this position will render the fallback pattern, not a letter or symbol  -  documented for
that purpose.
### Glyph at 1F/7F/9F/FF identified as a fallback/placeholder glyph type (checkerboard/mesh/"tofu")
Source: John's terminology note. The hash-with-three-lines symbol is of the same general class as
the modern "tofu" glyph (☐) used by fonts to represent an unavailable/unmapped character  -  i.e. a
fallback rendering, not necessarily specifically ASCII DEL. Reframes U16 from "unidentified symbol"
to "unresolved WHICH fallback-glyph convention this specific ROM uses," which is a narrower and
more tractable question. Does not resolve U16  -  still no primary-source confirmation of what code
point(s) this glyph represents or why it appears only at the last column of each alphabetic block.
### T18 fixed-column bar render replaces diagonal vector line and two-bar staircase
Source: DiverSim2.jsx. BASIC_LQ (floor(CL*XS)) rounds inconsistently at exact
grid-boundary CL values under WD=40/DR=30/TK=0.25 (ACCELERATED)  -  observed as
tick 2 landing on tick 3's column instead of tick 1's. Bar x-position now
taken from a tick-count column index (tick 1 -> col 1, ticks 2&3 -> col 2,
ticks 4&5 -> col 3, ...) instead of BASIC_LQ directly. BASIC_LQ/BASIC_LM and
the skip logic (line 6314) are unchanged  -  only this render's x-position is
affected. Confirmed against photograph for ticks 1-3, 03 July 2026.
### T18 bar width: one plotX grid unit minus 1px, crispEdges correction
Source: visual confirmation against photograph. Full-width bars (exactly one
grid unit) rendered fractionally too wide under SVG crispEdges pixel
snapping. Final colour confirmed black (CCI byte 32) on blue; debug
alternating tick colours removed as default, retained as toggle
(T18_DEBUG_COLOURS) for further testing.
### BUG FOUND AND FIXED: [3010] gate was halting AD/profile updates after tick 3
Source: DiverSim.jsx, DiverSim2.jsx, 03 July 2026. The [3010] gate
(IF CL<ES(EP,2)-IK THEN 3400) was coded as wrapping the WHOLE 3400 block
(AD update + descent-profile draw), not just the still-stubbed
activity-prompt lines 3025-3036 (T18b/T22). Once CL crossed ES(EP,2)-IK
(after tick 3 under WD=40/DR=30/TK=0.25), both AD and the profile draw were
silently skipped every subsequent tick. In BASIC, a FALSE result here falls
through to the activity prompt and THEN continues to 3400 regardless.
Corrected: only the activity-prompt stub is now conditional; 3400 always
runs. Both files now reach the full 6-tick end-state (AD=40, CL=1.75).
### T18 six-tick trace confirmed via browser console  -  no rounding error found
Source: DiverSim2.jsx console output, 03 July 2026 (WD=40, DR=30, TK=0.25,
ACCELERATED). h=31.41 identical for ticks 1-5, h=10.47 for tick 6 (exactly
1/3, matching 2.5m vs 7.5m). MQ formula (140-floor(AD*YS)) is provably
identical in form to the T06 depth-tick formula; AD*YS lands on a whole
number every tick in this test case, so floor() has no fractional remainder
to lose at any step. No mechanism exists for cumulative/progressive error
under these specific test values.
Raw trace: tests/T18_ACCEL_6tick_trace.txt (full console output, confirms
column-pairing pattern tick1→col1, ticks2-3→col2, ticks4-5→col3, tick6→col4).
### Photograph pixel calibration: risers 1-2 match, riser 3 (~35m) does not
Source: two photographs, pixel-calibrated against cyan tick-dash marks
(sub-pixel fit, <1.3px residual across 9 gridlines). Risers 1 (7.5m) and 2
(22.5m) match the WD=40/DR=30/TK=0.25 model within photo-measurement noise.
Riser 3 measured ~1.6m short of the 37.5m prediction, landing near 35m  -  a
gap too large for photo noise and not reproducible from the code's own
arithmetic (see six-tick trace entry above). Unresolved as of this entry.
### REAL time mode confirmed: TK=1/32
Source: DiverSim2.jsx console output. WD=40/DR=30/TK=1/32 gives a 43-tick
descent, average step 0.93m/tick. Consistent with the "~10 minute dive"
pacing description.
### XS formula confirmed unconditionally by BASIC source, not mode-dependent
Source: DIVER.BAS lines 1320-1340  -  [1320] XS=1,LA=0; [1330] IF WD<17 THEN
XS=0.5; [1340] IF WD>20 THEN XS=2.0. XS depends on WD only; REAL/ACCELERATED
mode (i.e. TK) has no effect on it. WD=40 gives XS=2.0 in both modes.
Resolves prior uncertainty over whether XS carried over correctly to
REAL-mode testing (it does, coincidentally, but for a cited reason now).
### REAL-mode tick trace reveals non-cumulative plot-grid quantisation effect
Source: DiverSim2.jsx console output, WD=40/DR=30/TK=1/32. h alternates
4.19/2.09 with an exact 8-tick period (confirmed non-cumulative  -  no drift).
Caused by the per-tick depth step (0.9375m) not evenly dividing the 0.5m
plot-grid resolution (1/YS). Same mechanism as the "block-resolution
rendering of a true straight line" note already on file for vector mode
(DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx), now observed directly in a
controlled, logged run rather than inferred from a photograph.
UPGRADE: full 43-tick trace (complete REAL-mode descent, AD=0→40.00)
obtained and checked  -  h=2.09 dip recurs at ticks 1,9,17,25,33,41 (exact
8-tick period) with zero drift end to end, not just in a partial sample.
Column index also holds steady for one extra tick at each dip (e.g. col
stays at 5 across ticks 8-9), confirming the quantisation affects both
bar height and column advancement via the same underlying cause, not two
separate effects. Raw trace: tests/T18_REAL_43tick_trace.txt.
### DR=24.348 (REAL mode) numerically reproduces the photograph's 35m riser
Source: brute-force search (WD=40, TK=1/32, XS=2, DR swept 0.1-120).
DR=24.348 gives four macro-treads (grouped by BASIC_LQ) ending at 10.652m,
22.826m, 35.000m, 40m  -  second-last exactly 35m to three decimal places.
Wired into DiverSim2.jsx as an explicitly-labelled debug override
(T18_DR_OVERRIDE, REAL mode only)  -  NOT a corrected value.
⚠ UNRESOLVED TENSION: [1300] DR=30, AR=15, AD=0, CL=0 is transcribed as
unconditional  -  DR is not user input in the source as it stands. If
confirmed, DR=24.348 cannot be the value used in any historical dive, and
this hypothesis is closed without resolving the 35m discrepancy. Needs
checking against the primary listing or Dagfinn before proceeding further.
### DiverSim.jsx: debug tick-stepper removed, auto-run added
Source: DiverSim.jsx. Manual "Next Tick" control and debug HUD removed;
replaced with a useEffect-driven auto-run (400ms/tick placeholder interval,
not derived from hardware timing) once time mode is confirmed, stopping at
target depth. Manual stepper retained only in DiverSim2.jsx (sandbox).
⚠ Auto-run screenshots taken before all ticks have fired can look like
rendering faults (observed: an apparently 3x-too-long tick 6 bar was
actually tick 4 alone, mid-formation)  -  settle time needed before
screenshotting DiverSim.jsx for comparison purposes.
### U15 numbering collision noted: sandbox's new "U15" renumbered to U17
Source: HK cross-check. Sandbox's new item (verify BASIC line 1300 DR=30
unconditional) was labelled U15, but U15 was already used and resolved
earlier this session (Code 29 purpose, now closed). Renumbered to U17 in
TODO.md to avoid two unrelated findings sharing one ID in this append-only
log. No content change, numbering only.
### U17 RESOLVED: DR eliminated as explanation for the photograph's 35m riser
Source: DIVER.BAS transcription, confirmed by John  -  [1300] DR=30 is set
unconditionally; DR is not a variable the historical program ever varied,
in any time mode. The DR=24.348 (REAL mode) numerical fit found by
brute-force search (WD=40, TK=1/32, XS=2 per lines 1320-1340), reproducing
four macro-treads with the second-last landing on exactly 35m, is a real
mathematical result but cannot correspond to any historical dive, since no
run of the program could use that DR. Debug override (T18_DR_OVERRIDE) has
been removed from DiverSim2.jsx. The 35m photograph discrepancy remains
unresolved; DR is no longer a live candidate. Remaining candidates: the
photographed dive may not have used WD=40; or the still-unimplemented
activity-prompt stub (lines 3025-3036, T18b/T22) may affect AD or event
bookkeeping in a way not yet captured once CL crosses ES(EP,2)-IK.
### 8001 manual proofread: current boundary documented (The_CompucolorCRT.docx)
Source: John, editor's note added to document TOC. Proofread/rebuilt content
currently covers Part I and Part II through p.24 (Details of Escape Codes)  - 
Control Codes, Escape Codes (summary + detail), character grid (waffle glyph
resolved), RS-232/baud rate table all rebuilt as proper Word tables with
working page markers (~ N ~). CORRECTION to this entry: Details of Graphic
Plot Submodes is NOT untranscribed  -  it has been proofread and is
deliberately kept as a separate document (DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx)
rather than merged in, since The_CompucolorCRT.docx is already large. Only
Light Pen Operation and Appendices A-E remain genuinely not yet transcribed
 -  treat those as raw-OCR-quality until proofread. Citations to Plot Submodes
content should use DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx directly (already the
citation basis for existing LOG entries on vector mode and grid dimensions);
citations to Light Pen Operation or the Appendices should still fall back to
Compucolor-8001-manual_pdfgear_com_.docx (raw OCR) for now.
### T19 complete and confirmed: depth digits (IDs 19-20) live during descent
Source: DiverSim2.jsx, console/visual confirmation, 03 July 2026. GOSUB 6600
wired into the tick loop (was static AD=0 only, LOG T14b). Tens/units digits
(IDs 19-20) use Math.floor(BASIC_AD)  -  AD's likely implicit INT typing from
first assignment in the original BASIC. Confirmed sequence under
WD=40/DR=30/TK=0.25: blank+7, 15, 22, 30, 37, 40, with leading-zero
suppression working correctly at AD<10.
### ID=21 clarified as a pre-existing stub, not part of T19
Source: DiverSim2.jsx. gosub_7000 returns {type:'trend'} for ID=21, but no
render path exists anywhere in the file for that type  -  its value has been
computed but silently dropped since long before this session, under any AD.
Already on file as U04/T14d ("depth trend bar  -  Dagfinn description not
reconciled with code"); unaffected by and unrelated to the T19 fix above.
Not a tenths-digit display, despite the (AD-INT(AD))*10 formula's
resemblance to one  -  needs Dagfinn's actual description before a render
path is attempted.
### NOSTOP line's numeric portion confirmed as live depth, not no-stop time
Source: John, single photograph (number non-zero, label reads "NOSTOP" not
"STOP"). Revises prior assumption (LOG T21/TODO) that this was a
minutes-remaining countdown to a no-stop dive limit. Working assumption
only  -  the "NOSTOP"->"STOP" label switch, if a second photograph or
description surfaces, would be the confirming evidence either way.
### TODO T-numbers cross-checked against TESTING_PLAN.md  -  three corrections made
Source: John, prompting HK to check TESTING_PLAN.md directly rather than work from LOG.md/
TODO.md alone. TESTING_PLAN.md is the authoritative source for T-numbers and was NOT being
cross-checked this session  -  root cause of both the T20 and (new) T22/T23 collisions. Per
TESTING_PLAN.md: T20=GOSUB 6700 air gauge, T21=GOSUB 6750 NOSTOP display, T22=lines 3010-3025
display loop gate/CK flag, T23=lines 1800-1910 end-of-event handler post-DESCEND, T24=GOSUB
6300 Branch 2 coloured band mountain. Corrections applied: air gauge reverted from this
session's incorrect "T23" back to T20; coloured band mountain renumbered from a pre-existing
"T20" to T24; activity-prompt-sequence entry renumbered from a pre-existing "T22" to T23; a
new T22 entry added (previously unrepresented in TODO despite the [3010] gate bug already
being fixed and logged this session under an informal description, not a T-number). Going
forward, T-number assignment/changes should check TESTING_PLAN.md first, not just TODO.md.
### HT and DX are not independent  -  HT derived from DX in GOSUB 6100
Source: DIVER.bas lines 6100-6199 ("SUB TESTS IF DECOMP BOUND WILL BE CROSSED..."),
confirmed by John. DX is the primary flag, set at line 6190
(`IF AL(AL,3)>20 AND L>1 THEN DX=5`). HT is set from DX immediately after:
line 6191 `IF DX<>0 THEN HT=10`, line 6195 `IF DX=0 THEN HT=5`. HT is not a
second independent tracker of decompression status  -  it is simply "next
stop depth", chosen by DX. A third variable, D5, accumulates separately at
line 6194 (`D5=D5+(L-J)*5`), likely a decompression-time total. This
resolves the standing question (raised this session) of how HT and DX
relate: DX leads, HT follows.
### IDs 1-6 confirmed as a shared text field: NOSTOP / STOP / ASCEND
Source: DIVER.bas lines 6950-6999 (GOSUB 6950, "SUB DISPLAYS NEXT HT TO
STOP AT WHEN ASCENDING") and lines 7500-7549 (GOSUB 7500, "SUB WHEN
FINISHED DECOMP"), confirmed by John. GOSUB 6950 writes "STOP 5" or
"STOP10" to IDs 1-6, chosen by DX (line 6957, `IF DX<>0 THEN 6962`),
gated on HT<>0 (line 6955). GOSUB 7500 writes "ASCEND" to the same six
IDs when the last stop finishes (HT<>10 branch), or rewrites only the
depth digits (IDs 5-6, "10"→" 5") when a shallower stop remains (HT=10
branch), leaving "STOP" untouched at IDs 1-4. This is the same six
character cells that NOSTOP occupies during descent (T11, IDs 1-6, via
GOSUB 7000 at lines 1362-1368)  -  NOSTOP/STOP/ASCEND are not three
displays choosing a label, they are three different call sites writing
to one shared DM field, whichever ran most recently is what is on
screen. Revises the loose phrase "the NOSTOP line" used in earlier notes
(including the T21/TODO working assumption on NOSTOP's numeric portion)
 -  that finding concerned GOSUB 6600's IDs 19-21 (depth gauge digits),
a physically different field from IDs 1-6. The two should not be
conflated going forward.
### U08 partially resolved: IDs 13-18 identified (GOSUB 6250)
Source: DIVER.bas lines 6250-6299 ("SUB DISPLAYS DECOMP RQMNTS TO BE
SATISFIED AT THIS DEPTH"), confirmed by John. Gated on HT>5. Displays
"5M" + D5 (tens digit, units digit) + ":" via IDs 13-18. Likely
decompression stop time remaining in minutes  -  meaning inferred from
context (the "5M" and colon format), not independently confirmed.
TODO.md U08 updated accordingly.
### IDs 7-12 identified as a second, busier shared field  -  at least four writers
Source: DIVER.bas lines 6750-6799 (GOSUB 6750), 6800-6849 (GOSUB 6800,
"SUB COUNTS DOWN TOTAL DT RQMNTS"), 6850-6899 (GOSUB 6850, "SUB
INITIALISES NOSTOP/TIME TO NEXT BOUND"), 6900-6949 (GOSUB 6900, "SUB
DISPL DECOMP RQMNTS"). All four write countdown-style displays (MM:SS or
similar) into IDs 7-12, using an II offset (0 or 6) that in some branches
extends the same write into the IDs 13-18 range as well. This mirrors the
IDs 1-6 pattern above  -  one shared field, multiple call sites, whichever
fires most recently is what is on screen. Which of the four fires when
(i.e. what gates them against each other) is NOT yet established  -  see
new open item below.
### New display state found: asterisk in place of a number
Source: DIVER.bas line 6939 (GOSUB 6900), `IF I>30 THEN I=-60`, with the
original REM comment `DISPLAYED AS "*"` retained in the listing. Confirms
that at least one of the IDs 7-12 displays can show an asterisk rather
than a digit pair under some condition (I>30 before the substitution).
Previously undocumented. Exact trigger condition (what I represents at
that point, and what an asterisk means to the diver) not yet analysed.
### Correction: lines 6194 and 6280 have no original-source anomaly
Source: John. The apparent missing "=" at line 6194 and missing "*10" at
line 6280, flagged provisionally earlier this session, were John's own
transcription/typing slips when quoting the lines in chat, not features
of the original BASIC listing or the DIVER.bas file. No bug exists in the
source at either line. Retracting the earlier flag.
### GOSUB 6600 call-site structure: 3 sites, not 5-6  -  T19b matrix premise revised
Source: DIVER.bas, direct line search, 05 July 2026. GOSUB 6600 is called
from exactly three places: line 1445 (initial paint, already covered by
T14), line 3510 (shared main loop, reached via `4000 GOTO 1465` for every
activity type  -  the only activity-dependent branch, at line 3400, gates
whether AD itself changes, not whether GOSUB 6600 fires), and line 8010
(MEMORY end-of-dive screen, `AD=WD:GOSUB 6600:GOSUB 6700`  -  notably no
accompanying GOSUB 6750, consistent with NOSTOP not being shown once the
dive is over). WORK/ASCEND/DECOMPRESS/REST do not each call GOSUB 6600
separately  -  they all pass through the same line 3510 identically to
DESCEND. The T19 DESCEND test therefore already exercises the one shared
loop call site. Revises the call-site matrix premise in TESTING_PLAN.md
T19 from a five-activity-plus-MEMORY structure to a 3-call-site structure
(INIT / shared LOOP / MEMORY).
### T14c RESOLVED: FL flag colour (IDs 19-20) is source-invariant, not context-dependent
Source: DIVER.bas lines 6610, 7250/7210, 05 July 2026. Line 6610 sets
FL=0 unconditionally inside GOSUB 6600, before the ID 19/20/21 branches,
on every call regardless of which of the 3 call sites triggered it.
GOSUB 7000's colour statement for these IDs is `PLOT 6,1+FL,...` (line
7250)  -  since FL=0 always in this path, CCI is always 1 (red). This is
a property of the subroutine's own header, not something that could vary
by activity or call site; no per-call-site testing needed to close this.
DiverSim2.jsx's hardcoded RED for IDs≥19 was correct.
### T14e RESOLVED: PLOT 29 (line 6601) is an unconditional defensive reset
Source: DIVER.bas line 6601, 05 July 2026. PLOT 29 is the first statement
in GOSUB 6600, executed before the line 6605 `IF AD=AY THEN 6699`
early-return check  -  unconditional on activity, ID, or FL. Consistent
with the existing Code 29 = Flag Off finding (descent profile, GOSUB
6300 Branch 1): a defensive Reverse-Field-off reset before writing the
depth digits' CCI byte, not display-sync or cursor-reset. No further
investigation needed.
### U04 mechanism resolved: ID=21 depth trend bar uses baseline+overlay bar technique
Source: DIVER.bas lines 7200-7240, 05 July 2026. Structure: line 7200
draws a fixed 10-tick baseline (CCI=0, dim), then (if VA<>0) line 7210
draws an overlay of VA blocks in CCI=1+FL (red, FL always 0 per T14c).
Same technique as the air gauge (ID=22, line 7300+)  -  fixed baseline
plus active-colour overlay  -  just 10 ticks instead of 18, at the line
7200-area coordinates. VA=(AD-INT(AD))*10, the fractional part of depth
×10, reads as a partial-fill indicator for progress through the current
whole metre between the IDs 19-20 digit updates. Render mechanism no
longer blocked on Dagfinn's description. Exact visual appearance (colour/
size/position against a photograph) is NOT yet confirmed  -  U04 downgraded
from "mechanism unknown" to "mechanism known, cosmetic confirmation
outstanding," not closed outright. See TODO.md U04, T14d.
### Methodology decision: T-number role-conflation acknowledged, stock-take mechanism added
Source: John, 05 July 2026 (SB priority order: methodology note first,
stock-take mechanism second, phase tags applied opportunistically third
 -  no retrofit pass). John identified that Sandbox has effectively been
carrying hypothesis-forming, development, testbedding, and result
analysis all under single T-numbers, which the "test"/"TESTING_PLAN"
terminology obscures. Terminology retained for continuity. Added to
TESTING_PLAN.md: (1) a methodology note stating this explicitly, so
"COMPLETE" is not misread as "purely observed," plus the phase-tag
convention ([HYPOTHESIS]/[DEV]/[TESTBED]/[ANALYSIS]) for future entries;
(2) a STOCKTAKE mechanism  -  periodic, deliberate pauses (not triggered
by surprising results) to check open loops/GOSUBs/branches are fully
developed before further testing proceeds against them, logged here as
dated STOCKTAKE entries. TESTING_PLAN.md is expected to grow as a
result; this is by design, not scope creep. Phase tags will be applied
opportunistically as existing entries are touched anyway, not as a
retrofit pass over the whole file.
### New convention: phase tags within an entry (per HK discussion)  -  SB's application
HK observed (relayed by John) that a single T/U-number has been bundling
hypothesis, development, testbed execution and analysis under one
"testing" label, which understates the development work involved and
risks a future reader misreading "confirmed" as purely observational.
Agreed approach: keep TESTING_PLAN.md and T-numbering as-is, but tag
component parts of an entry  -  [DEV], [ANALYSIS], [TESTBED],
[DEV/ANALYSIS]  -  with "done"/"outstanding" status, applied
opportunistically rather than as a retrofit. See methodology note added
to TESTING_PLAN.md (HK also added a STOCKTAKE mechanism alongside this,
same session  -  see separate entry above). First applied to U18 (below).
### U18 (IDs 7-12 gating)  -  static trace complete, tagged per new convention
Source: DIVER.bas lines 1694, 3510-3540, 5500-5503. The four writers are
not alternatives choosing a display; they are largely sequential within
known contexts. GOSUB 6850+6950 fire once at dive start (line 1694).
GOSUB 6750 fires every tick, unconditionally, in the main loop (line
3530). GOSUB 6800 fires on the same tick, immediately after 6750, only
when AL(AL,1)=4 (line 3540)  -  on such ticks 6750 writes first and 6800
overwrites it, last write wins, as with the IDs 1-6 field. GOSUB 6900 is
not part of the tick loop at all: it fires inside "SUB WORK NEXT" (line
5500), immediately before the "IS NEXT STAGE = n MIN REQUIRED" prompt,
gated by reaching that decision point rather than by a tick condition.
Outstanding: AL(AL,1)=4's meaning (working assumption DECOMPRESS, not
confirmed), a dynamic trace to confirm the overwrite behaviour, and
NS/NN/DT/II. See TODO.md U18 for the tagged breakdown.
### Note on file fork, 05 July 2026
SB's upload this session was based on the version of TODO.md/TESTING_PLAN.md/
LOG.md predating the GOSUB 6600 call-site work (T14c/T14e/T19b/U04  - 
see entries above), rather than the version HK had already updated. The
two branches diverged: HK's copy had the GOSUB 6600 resolution plus a
fuller methodology note (including STOCKTAKE); SB's copy had its own
methodology-note wording (phase tags only) plus the new U18 static trace.
No actual content conflict  -  SB's U18 work and phase-tag convention have
been merged into HK's copy above, and nothing from either side was lost.
Cause: John notes there was a lot happening in parallel this morning and
a hand-off point was likely missed. Worth double-checking file versions
match before parallel work sessions in future, given SB and HK are
editing from what should be a shared but manually-relayed state.
### U18 RESOLVED (activity-code mapping): AL(AL,1)=4 is DECOMPRESS, not ASCEND
Source: DIVER.bas line 780 `DATA DESCEND,ASCEND,WORK,DECOMPRESS,REST`, read via
lines 720-760 (`FOR J=1 TO 5:READ A$(J):NEXT J`), 05 July 2026. Confirms
1=DESCEND, 2=ASCEND, 3=WORK, 4=DECOMPRESS, 5=REST. This CORRECTS an earlier
working guess (AL(AL,1)=4 = ASCEND, inferred from GOSUB 7500 writing
"ASCEND")  -  that guess was wrong. 4 is DECOMPRESS; GOSUB 7500 writes the
diver's NEXT activity's label when a DECOMPRESS event ends, not the current
one. This also settles the original IDs 7-12 gating question: GOSUB
6800/7500 gate on DECOMPRESS(4); GOSUB 6750 fully executes only for
DESCEND(1)/WORK(3) (line 6751); GOSUB 6900 isn't tick-gated at all. DT
confirmed populated via line 240 (`READ DT(I,J)`) from the tables at lines
600-700  -  likely the same RNPL/BSAC table from earlier work, not yet
cross-checked value-for-value. NS, NN, and II remain unconfirmed.
LOOPTRACE5.BAS was drafted off the back of this finding  -  a standalone
diagnostic cross-checking eleven AL(AL,1) gates from the listing against
the confirmed mapping above; drafted, not yet run. Remaining open scope
(the MQ/MP comparison at lines 6316-6317 and the WORK(3) branch at line
6312, needing live dive values rather than a static trace; and the DT
value-for-value cross-check) is no longer really about IDs 7-12 gating  - 
John to decide whether these split into their own U-number. See TODO.md
U18 for the current tagged breakdown.
### U20, U21 opened: split from U18 now that gating question is settled
Source: John, 05 July 2026. With U18's core question (IDs 7-12 gating,
AL(AL,1) mapping) resolved, its two remaining loose ends were no longer
about gating and have been given their own numbers: U20 (MQ/MP comparison
at DIVER.bas lines 6316-6317, and the WORK(3) branch at line 6312  -  needs
live dive values, not a static trace) and U21 (DT value-for-value
cross-check against the previously identified RNPL/BSAC decompression
table  -  population confirmed via line 240, contents not yet checked).
See TODO.md U20/U21, TESTING_PLAN.md U20/U21.
### LOOPTRACE5.BAS bug found: probable 2-significant-character variable truncation
Source: John running LOOPTRACE5.BAS in the CCEMU Compucolor emulator
(https://www.compucolor.org/emu/ccemu.html), 05 July 2026.
Result didn't match expectation: for the WORK pass, G6800$=YES and G6200$=YES
appeared together; for DECOMPRESS, both read NO together. The two flags moved
in lockstep when they should track different activities independently
(G6800$ only for DECOMPRESS, G6200$ only for WORK). SB's diagnosis: the
interpreter likely distinguishes variable names by only their first two
characters, so `G6800$` and `G6200$` collide as the same variable ("G6..$").
Line 350 (`G6200$=...`) executes after line 330 (`G6800$=...`) in the same
pass, so line 350's value always wins and both PRINT statements report the
same variable twice. `G7500$` was unaffected  -  correctly read YES for
DECOMPRESS, independently confirming GOSUB 7500's gating  -  because no other
variable in the script starts "G7".
This is a LOOPTRACE5.BAS/testbed artefact, NOT a finding about DIVER.BAS's
own behaviour. The AL(AL,1) mapping and gating logic already confirmed under
U18 are unaffected and stand independently of this bug.
Possible wider significance (hypothesis, not confirmed): IF the interpreter
genuinely truncates variable names to 2 significant characters, this could
explain the terse variable naming throughout the original 1979 DIVER.BAS
listing (AD, DX, HT, D5, PA, AL)  -  exactly the discipline a programmer would
need under such a constraint. NOT yet checked against
Compucolor-8001-manual.pdf; the emulator's BASIC dialect may not match the
original 8001 hardware's exactly. Do not treat as confirmed for the real
platform until checked. See TODO.md U22.
Action: LOOPTRACE5.BAS needs its flag variable names changed so their first
two characters differ (e.g. G6800$/G6200$ renamed) and rerun before its
U18/U20 gating result can be trusted.
### U14: primary-source evidence favouring 0-191 Y-range on 25-line hardware
Source: John's manual proof-reading  -  Plot Mode Functions tables (X₀Y₀
Vector Plot Mode and Incremental Vector Plot Mode), cross-checked against
both the original PDF and the Word transcription, 05 July 2026. In both
tables, every Y-value row is given as "0 to 99 (191)"  -  not a one-off, but
consistent across every row in both plot submodes. This is the manual
itself documenting a dual Y range at the point of use, not just in the
general specifications section. Read together with SCREEN_SPECS.md's
existing note (Y range: 0-99 (25-line) or 0-191 (48-line), Compucolor-8001-
manual.pdf pp.31-33), this is direct primary-source support for the "25-line
hardware addresses 0-191 regardless of physical row count" branch of U14,
rather than "the machine was actually 48-line." Strengthens but does not
by itself close U14  -  the emulator test previously specified as required
has not yet been run. Treat as strong corroborating evidence, not final
confirmation.
### CORRECTION to 05 July 2026 U14 entry: "(191)" is 48-line boilerplate, not dual-addressing evidence
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx, full document (previously only
seen as two isolated table images), 05 July 2026. Retracts the reading in
the earlier same-day LOG entry ("primary-source evidence favouring 0-191
Y-range on 25-line hardware"). The full document contains an explicit
general statement not visible in the two table images: "The character
grid is made up of 80 characters wide by 25 [48] lines high... plot grid
to be 160 blocks wide by 100 [192] blocks high," and later, unambiguously,
"a 160 wide by 100 (192 for 48 Line) high block matrix." Every Y-range
line throughout the chapter (X/Y Point Plot, X/Y Bar Graph, Vector Mode,
Incremental Vector  -  all of them) follows the same "0 to 99 (0-191)" or
"(192)" pattern as standard inline boilerplate giving the 48-line
alternative, not evidence that 25-line hardware itself addresses the
fuller range. CORRECTED READING: the manual consistently treats 191/192
as 48-line-only throughout this chapter, not just in the general
specifications section. This REINFORCES the U14 tension rather than
resolving it  -  DIVER.BAS's plotY values up to 191 remain unexplained on
confirmed 25-line hardware. Emulator test remains the outstanding step.
Also confirms (in passing) the existing Reverse-Field-flag/XOR dual-purpose
finding already noted in TODO.md's ZENODO section, and the vector-mode
chaining behaviour ("or" cells in the Plot Mode/Plot Submode and Plot
Escape/Plot Submode rows) already discussed from the table images.
### T18 lead: hardware vector line-fit may explain grid-boundary rounding inconsistency
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx (Vector Mode X₀/Y₀ sections)
cross-checked against DIVER.bas line 6320 (`PLOT 6,32,29,2,253,LP,MP,242,
LQ,MQ,255`), 05 July 2026. Confirms this line uses CCI setup, Flag Off,
Plot Mode, X Point Plot (253, loads X₁Y₁), then Vector Mode X₀ (242, loads
X₀Y₀ and draws)  -  consistent with the already-confirmed 242/241 vector
mode finding. New: the manual states the terminal "determines the best
straight line fit between X₀,Y₀ and X₁,Y₁ using the plot blocks"  -  i.e.
a hardware rasterisation algorithm (plausibly Bresenham-like), not a
simple linear interpolation. HYPOTHESIS (not yet tested): T18's observed
grid-boundary rounding inconsistency may stem from the JSX reconstruction
not replicating this specific hardware line-fit algorithm. Worth testing
directly rather than continuing to chase the rounding empirically. See
TODO.md T18.
### U07/T24 partial finding: "coloured band mountain" uses Y Bar Graph submode
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx (Y Bar Graph Y₀/X/Y Max
sections) cross-checked against DIVER.bas line 6525 (`PLOT 2,246,Y1,X3,
Y2,255`), 05 July 2026. Matches the manual's documented Y Bar Graph
auto-chain exactly: code 246 (Y₀ value) auto-advances to 245 (X value)
auto-advances to 244 (Y Max), bar drawn  -  three data words with no
intervening submode codes, precisely because the chain auto-advances.
Confirms GOSUB 6300 Branch 2 draws vertical bar graphs, one per DT
column (J, lines 6350-6570), not point-plots or vectors. Real structural
progress on U07, though the semantics of what each band/colour represents
(presumably decompression-stop depths, via the DT array) are not yet
analysed. Loose end NOT resolved: line 6510 `PLOT 29,C(C)` pairs Code 29
(Flag Off  -  documented as a bare control code with no following data
word) directly with `C(C)`; this doesn't obviously match the documented
grammar and needs its own look when U07/T24 gets a full analysis pass.
See TODO.md T24/U07.
### Phase-tag convention extended: "Implemented in DiverSim.jsx" status line
Source: John, 05 July 2026. Added a fourth element to the phase-tag
convention, sitting alongside [HYPOTHESIS]/[DEV]/[TESTBED]/[ANALYSIS]
rather than folded into [DEV]: a status line answering whether an entry's
logic is actually in the file the simulation runs from. States: YES (in
DiverSim.jsx), NO (not implemented anywhere), SANDBOX ONLY (in DiverSim2.jsx,
not graduated), STUB (a placeholder exists in DiverSim.jsx but doesn't do
the real thing  -  formalises the existing informal "⚠ STUB in DiverSim.jsx"
notes already on T14d/T15a). Each state carries a short reason, e.g. "STUB
(static CL=0 only  -  see T15a)," rather than a bare state alone. Deliberately
kept separate from [DEV]: reasoning out an approach and actually writing it
into DiverSim.jsx are different things, and conflating them was part of
the original problem. Applied opportunistically, same as the other phase
tags  -  no retrofit pass, though most entries are expected to be re-touched
and updated over time anyway. See TESTING_PLAN.md methodology note.
### New file: GOSUB_INDEX.md  -  master index of all subroutines and call sites
Source: direct extraction from DIVER.bas, 05 July 2026. Built in response
to a question about whether a full GOSUB call-site table existed  -  it
didn't. Covers all 18 subroutines, their call sites, gating conditions,
and cross-references to existing T/U-numbers (T18, T19/T19b, T24/U07,
U18). GOSUB 7000 (~78 call sites) is broken down by calling routine
rather than listed line-by-line, since each call just writes one DM
field and the routing is already tracked elsewhere (T14a/T14c/T14d/T15a/
T21). One notable finding: GOSUB 5060 ("SUB I/P NAME") is defined but has
ZERO call sites anywhere in the listing  -  flagged as a possible new
U-number candidate but not assigned one without John's steer, in case
it's simply dead code from an earlier draft. See GOSUB_INDEX.md.
### U18 confirmed by testbed; U22 collision fixed and rerun
Source: LOOPTRACE5.BAS, two runs, 05 July 2026. First run used flag names
G7500$, G6800$, G6200$, etc.; G6800$ and G6200$ produced identical results
on every row, tracing to a likely two-significant-character variable
collision on the interpreter used (CCEMU)  -  see U22. Corrected version
renamed all six flags to non-colliding two-character prefixes (F1–F6) and
was rerun. Result: all five activities (DESCEND, ASCEND, WORK, DECOMPRESS,
REST) matched the expected flag pattern exactly, including DECOMPRESS  - 
the row that mattered most, since it's the only one where GOSUB 7500 and
GOSUB 6800 should both fire. U18 closed on this basis. U22 left open as a
separate question: whether the collision reflects a genuine constraint of
the original 8001 hardware (which would help explain DIVER.BAS's terse
variable naming throughout) or is specific to the CCEMU emulator's BASIC
dialect.
### U14 sharpened: tension now unambiguous, not just reinforced
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx, 05 July 2026. The manual
states plainly, twice, that the Y-wrap threshold is tied directly to
which line-count option is installed: "The X Point Plot in conjunction
with the Y Point Plot allows any block on a 160 wide by 100 (192 for 48
Line) high block matrix..." and "...all larger values will cause 100
(192) to be subtracted from the new value of Y..." No room left for
"25-line hardware might still address 0-191 regardless"  -  the document
ties the wrap point to the option explicitly, both times. Concrete stakes
for DIVER.BAS: CoordinateSystem.md's own confirmed depth ticks run
plotY=140 down to 40. If the confirmed 25-line unit genuinely wraps at
100, plotY=140 wraps to 40  -  landing on the same screen row as the
already-present plotY=40 tick, which cannot be right for a readable depth
scale. Specific test proposed for whoever runs the emulator: send Y=140
on a CCEMU 25-line configuration and see literally where the block lands.
See TODO.md, SCREEN_SPECS.md, CoordinateSystem.md U14.
### U11 (PLOT 27 scroll): new lead  -  Roll Mode and Plot Mode are mutually exclusive
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx, Code 11/K "Roll Mode"
section, 05 July 2026. Confirms rolling is line-count-dependent (25-line
units roll one line at a time, 48-line units roll two)  -  but the more
important finding is a previously undocumented constraint: "the plot
mode and blind cursor mode only work in non-roll mode." Roll Mode and
Plot Mode graphics cannot be active simultaneously on this hardware.
Given T10's finding of a 13-row cursor-origin shift across scroll events
(lines 1264-1360), this needs checking directly: does DIVER.BAS turn
Plot Mode off before invoking roll, and back on afterwards? If not,
something in the current model may need revisiting. Not yet checked
against the DIVER.bas listing. See TODO.md U11.
### U12 (PLOT 14/15 size discrepancy): likely resolved  -  probable emulator line-count mismatch
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx, Code 14 section, 05 July
2026. States: "Code 14, A7 On... This bit is used to allow 2X character
sizes for 48 line units. This effectively doubles the number of
displayable character types from 128 to 256." This confirms the existing
working note in CoordinateSystem.md almost word-for-word: on 25-line
hardware, Code 14 only extends the character set (128→256); it does not
double character size. If CCEMU showed small/different characters during
testing, that is consistent with the emulator being configured for the
wrong line-count option, not a genuine ambiguity in the hardware's own
documented behaviour. Moved from "not reconciled" to "likely resolved,"
pending a quick check of which line-count option CCEMU was actually set
to during that test. See TODO.md U12.
### U10 and U03: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx checked, no new information
Source: DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx (full document), 05 July
2026. Explicitly noting (rather than leaving silent, which could be
mistaken for "not checked") that neither U10 (PLOT 30 DM box even-row
stripe mechanism) nor U03 (FRAME element purpose) is addressed anywhere
in this document  -  no PLOT 30 background-effect discussion, no
frame/shadow/border feature mentioned. Both remain exactly as open as
before this document was reviewed.
### U23 opened: NS/NN/II spun out from U18 on its closure
Source: John, 05 July 2026. U18's static trace had flagged DT, NS, NN,
and II as needing confirmation. DT was addressed and is tracked
separately under U21 (value-for-value cross-check against the RNPL/BSAC
table). NS, NN, and II were not covered by that round of work and had no
home once U18 closed  -  given their own number, U23, purely to keep track
of them rather than let them drop when the U18 entry was removed from
TODO.md. See TODO.md U23, TESTING_PLAN.md U23.
### U24 opened: GOSUB 5060 dead-code question, no longer left unassigned
Source: John, 05 July 2026. The GOSUB 5060 ("SUB I/P NAME"  -  zero call
sites, first noted when GOSUB_INDEX.md was built) was flagged as a
candidate but deliberately left unassigned pending John's steer. Given
its own number now, U24, so it isn't left floating without one. See
TODO.md U24, TESTING_PLAN.md U24, GOSUB_INDEX.md.
### U25 opened: unexplained magenta lines in DM box, DIVER_TRACE.bas run
Source: John, 05 July 2026, screenshot on file. A cluster of six magenta
lines appeared in the DM box region during a DIVER_TRACE.bas run,
alongside a correctly-rendered air gauge. Not present in any reference
photograph. CAVEAT, flagged at the time of the finding rather than after
the fact: the same run hit a line-buffer overrun (`?US ERROR IN 7240`  - 
7240 is not a real line number in DIVER.bas), consistent with corruption
from an over-length instrumented line rather than a genuine jump target.
The magenta lines may be a symptom of that same corruption, not a real
DM element. Needs reproducing on a clean, unmodified run before being
treated as genuine. If it reproduces cleanly, the natural place to look
is the DM GOSUBs writing IDs 7-18 (6750/6800/6850/6900, per
GOSUB_INDEX.md)  -  the busiest, least-photographed part of the DM box.
See TODO.md U25, TESTING_PLAN.md U25.
### U25 opened: air gauge's unconditional magenta blocks found, but block count doesn't match what's on screen
Source: DIVER.bas lines 7300-7342 (`GOSUB 7000`, ID=22 routing via line
7120). Three magenta (CCI=5) blocks at lines 7305-7308 are drawn every
time the air gauge renders, positioned at X=153,151,149 Y=134, never
covered by the green depletion overlay (which starts at X=155). This
explains why John found no standalone GOSUB for the artefact  -  it's
inline within the shared `GOSUB 7000` display-monitor routine, at the
air-gauge (ID=22) branch specifically, not the depth-trend-bar (ID=21)
branch. Open discrepancy: the source loop (`FOR I=16 TO 18`) is
unambiguously three iterations, but John's screenshot shows six magenta
lines, and the magenta group sits beside the air indicator without
touching it. Do not treat as resolved  -  needs the screenshot checked
directly against these three X-positions before accepting any
explanation for the count mismatch.
### U26 opened: likely line-7240 transposition bug, found via the same DIVER_TRACE.bas run as U25
Source: DIVER.bas line 7240. `GOTO 7445` targets a non-existent line; the
natural correction, by comparison with every other exit path in the
routine (line 7195, and the general shape of the ID-dispatch block), is
`GOTO 7440`. Originally misattributed (05 July 2026) to a line-buffer
overrun in the DIVER_TRACE.bas instrumentation used earlier in the
session  -  that attribution is retracted; this looks like a genuine
pre-existing defect in the source, independent of the trace
modifications. Not yet confirmed by testing the corrected jump target in
the emulator.
### U26 revised: GOTO 7445 may be intentional fall-through, not a bug
John's note (05 July 2026): older BASIC interpreters often let a `GOTO`
to an undefined line fall through to the next existing line number
rather than raising an error. Under that convention, `GOTO 7445` at
DIVER.bas line 7240 resolves to line 7450, not 7440  -  the earlier
suggestion of a "7445-for-7440 transposition" pointed the wrong
direction, since 7440 precedes 7445 and a forward fall-through cannot
land there. Retracting that proposed fix. This also reopens the original
line-buffer-overrun explanation for the `?US ERROR IN 7240` seen in the
DIVER_TRACE.bas screenshot, since a correctly-implemented fall-through
would not have errored at all. Needs confirming against
Compucolor-8001-manual.pdf (or a clean, non-instrumented emulator run)
whether this specific platform's BASIC actually behaves this way before
treating line 7240 as either broken or correct.
### U19 resolved: AY confirmed as a depth-change guard
Source: DIVER.bas lines 6605, 6696. `AY` is read once (line 6605,
`IF AD=AY THEN 6699`) and written once (line 6696, `AY=AD`), both inside
`GOSUB 6600`. Its role is exactly the "last displayed depth" change-guard
proposed when this item was opened  -  confirmed by direct reading, not
inferred. Closes U19.
### U26 promoted to next test, with reasoning tied to the newly-resolved U19
Source: DIVER.bas lines 6605, 6690, 7240; ACCELERATED parameters (WD=40,
DR=30, TK=0.25) already established for T18. Confirming U19 (AY
change-guard) shows the ID=21 branch is reached on tick one of any full
run under these parameters, since AD's fractional part is non-zero from
the first tick. This makes an unmodified, uninstrumented run of
DIVER.bas the cheapest possible test of whether line 7240's `GOTO 7445`
is a genuine defect or benign old-style fall-through  -  no code changes
needed, removing the DIVER_TRACE.bas line-buffer confound entirely.
Recommended as the next test before resuming U25.
### U26 RESOLVED: GOTO 7445 genuinely fails on CCEMU; DIVER7450.BAS created as corrected working copy
Source: John, direct emulator test, 05 July 2026. `GOTO 7445` confirmed
to fail  -  genuinely undefined on this platform, not benign old-style
fall-through as the revised hypothesis proposed. `GOTO 7450` (the next
existing line number) succeeds. Provenance decision: the original
DIVER.bas is kept unmodified, error and all, as the authentic artefact.
A corrected working copy, DIVER7450.BAS, is created and used for all
further testing from this point. Any future result quoted against
"DIVER7450.BAS" runs the 7450 fix; results against "DIVER.bas" proper
retain the original defect. See EVIDENCE_TO_PRESERVE.md for the stored
file note.
### U04: "ripple" direction hypothesis flagged as unsupported by the VA formula
Source: DIVER.bas line 6690 (`VA=(AD-INT(AD))*10`), 05 July 2026. A
proposed reading of ID=21  -  the bar at the DM's right-hand edge
indicating ascend/descend direction  -  is worth recording as a working
idea, but is NOT supported by the formula as written: VA depends only on
AD's fractional part, carries no sign, and has no reference to DR versus
AR. Nothing in the formula distinguishes descending from ascending. Kept
as two separate claims in TODO.md's U04 entry: "shows fractional depth"
(well-supported, direct from source) versus "conveys direction"
(plausible but unconfirmed, would have to come from context rather than
the bar itself)  -  deliberately not folded into one confirmed behaviour.
### T22 confirmed live in a full dive; earlier flagged depth-sequence discrepancy retracted
Source: full-dive run, ACCELERATED parameters, 05 July 2026. A previously
flagged discrepancy  -  depth sequence 0, 7, 15, 22, 30, [activity-prompt
break], 37, 40 read as diverging from the expected 7,15,22,30,37,40  -  was
wrong and is retracted; the sequence matches exactly. More useful than
the correction itself: the break falls between the AD=30 and AD=37
ticks, one tick early of completing the descent to WD=40. Given IK=TK
unless TK<0.5, in which case IK=0.5 (lines 1316-1317), and TK=0.25 here,
IK=0.5  -  so T22's activity-prompt stub firing "within IK of the
boundary" predicts exactly this: a look-ahead window wide enough to
catch the last one-to-two ticks before the event ends. This is the first
time T22's mechanism has been observed firing in a real, full dive
rather than only via the isolated LOOPTRACE3 test. See TODO.md T22.
### U27 opened: line 6856 length limit, deliberately parked
Source: John, 05 July 2026. DIVER.bas line 6856 (inside GOSUB 6850, the
II+7/II+8/II+9 countdown-digit group) exceeds CCEMU's line-input length
when entered as plain text (106 characters as transcribed). Logged as a
deliberate stop, not an unresolved loose end dropped by accident:
emulating correctly beyond this point is too uncertain to be worth the
effort right now. Whether this is a genuine platform limit or an
artefact of typing/pasting a detokenised plain-text transcription (rather
than loading a tokenised program file, which would likely behave
differently) remains open. Revisit if a file-load path into CCEMU
becomes available, or if U23 (NS/NN/II's purpose) gets addressed some
other way first. See TODO.md U27, TESTING_PLAN.md U27.
### CCEMU scope clarified as a methodology note, not a U-number
John, 05 July 2026: CCEMU is a useful tool for testing DIVER.bas's own
logic (control flow, GOSUB structure, variable behaviour), since it
shares the same PLOT-command family  -  but it emulates the Compucolor II,
not the confirmed 8001-family hardware, and its screen geometry/
coordinate values must never be cited as evidence about the real
machine. An earlier same-session proposal to log this as an open item
(U28) is withdrawn  -  it wasn't a genuine unresolved question, just a
scoping rule, and its claim that this "weakens confidence" in U14 was an
overstatement: U14 remains exactly as open as before, for its own
reasons, unaffected by CCEMU's geometry mismatch. Recorded as a
methodology note in TESTING_PLAN.md instead.
### DiverSim.jsx/DiverSim2.jsx uploaded and cross-checked against tracked claims
Source: DiverSim.jsx and DiverSim2.jsx, uploaded 05 July 2026 (first time
either file has been directly available to check, rather than relying on
secondhand description). Confirms T20 and T21 (GOSUB 6700/6750) are
still `⚠ STUB  -  not yet wired into tick loop` in both files (lines
848-849/859-860)  -  matches what TODO.md already said, but TODO.md's T20
entry ("Confirmed correct") had no qualifier distinguishing "the BASIC
logic is confirmed correct" from "it runs in the sim"  -  added explicit
"Implemented in DiverSim.jsx: STUB" status lines to both T20 and T21 now
that this is verified directly, per the phase-tag convention. Also
confirms U04/T14d's ID=21 trend bar exactly as described (computed
correctly, `{type:'trend', va, fl}`, no render path anywhere in either
file) and that the manual tick-stepper is genuinely gone from
DiverSim.jsx's UI, living only in DiverSim2.jsx (line 1364).
Two stale comments found in the process, noted in TODO.md rather than
given their own T/U-number: line 1299's "FL flag colour logic not fully
verified" (stale  -  T14c resolved via source analysis) and DiverSim.jsx's
own header/line 711 still describing "manual tick stepping" (stale  -  the
file has since moved to the 400ms auto-run placeholder). Both mirrored
in DiverSim2.jsx. Worth fixing next time either file is touched.
### T20 wired into DiverSim.jsx and tested; U25 colour/count confirmed by direct observation
John, 05 July 2026: GOSUB 6700 (air gauge) wired reactively into
runDiveTick(), tested functionally  -  works. Separately, direct CCEMU
observation (not photograph) gives a decisive reading on the long-open
U25 colour question: the bottom two elements of the air gauge are
magenta, not blue, settling what photographs alone couldn't.
DiverSim.jsx's own descriptive comment had drifted from its code
(claimed three magenta blocks, code implements two)  -  corrected to
match the code and this observation. `MAGENTA` constant and its CCI
value were already correct from an earlier fix; this test confirms that
fix rather than finding a new defect.
### Transcription correction: DIVER.bas line 6752 (WD→WM)
Source: John, 05 July 2026. Line 6752 (inside GOSUB 6750, DESCEND/WORK
branch  -  see U18) originally transcribed as `IF AD>WM THEN WD=AD`;
corrected to `IF AD>WM THEN WM=AD`. The comparison side (`AD>WM`) was
always correct; the error was in the assignment target (WD instead of
WM). WM tracks the maximum depth reached so far in this context (working
maximum, read again at line 6754: `J=INT(WM-7)/2`)  -  assigning to WD
(working depth, a different variable entirely) would have silently
broken this tracking. Same category of fix as the earlier corrections at
lines 6194, 6275, 6280. Primary DIVER.bas source file updated; no
downstream TODO.md/TESTING_PLAN.md/GOSUB_INDEX.md entries reference line
6752 directly, so nothing else needs updating as a result of this fix.
### Stock-take pass: U09, U10, U12, U24, U27 revisited
John, 05 July 2026, working through the open items list while SB sleeps.
- U09: photographs confirmed as 25-line; second measurement not needed
  except possibly re: T05's missing title. Downgraded, no action pending.
- U10: DM box even-row solid-rect now plausibly explained by the same
  "BIG Characters" (PLOT 14 doubling rendered rows) mechanism proposed
  for the ID=21 ripple effect  -  not yet formally confirmed, same
  isolation test would settle both.
- U12: the "likely resolved  -  wrong CCEMU line-count setting" reading
  logged earlier was under-specified; John flagged more detail is needed
  before it can be cleared. Reopened as not reconciled. Also now worth
  weighing against the BIG-Characters hypothesis as an alternative cause,
  rather than a line-count mismatch.
- U24: added a caveat  -  given four genuine transcription typos have now
  been found in the project (6194, 6275, 6280, 6752), GOSUB 5060 having
  zero call sites might itself be a transcription slip in some other
  line's GOSUB target, not necessarily dead code. Worth checking for
  stray targets near 5060 before concluding it's unreferenced.
- U27: reclassified. Not a genuine open question about DIVER.bas  -  a
  known CCEMU operational limit (line-input length). Moved out of the
  U-number list to a tooling note in TESTING_PLAN.md's methodology
  section, next to the CCEMU-scope note, so it stays visible without
  occupying a U-number.
### U11 RESOLVED: DIVER.bas never combines Roll Mode with Plot Mode
Source: DIVER.bas lines 1262, 1264, 1273-1277, 05 July 2026. The only two
PLOT 27 calls in the entire file (the sole use of Roll Mode anywhere in
DIVER.bas). No PLOT 2 (Plot Mode entry) appears before them; the first
genuine Plot Mode entry/exit pair doesn't occur until lines 1273-1277,
after both scroll calls. The program is in text/cursor mode, not Plot
Mode, at the moment the scroll fires  -  sequential, non-overlapping by
construction, not by explicit guard. Confirms DIVER.bas already respects
the Roll-Mode/Plot-Mode mutual exclusivity found in
DETAIL_OF_GRAPHIC_PLOT_SUBMODES.docx, without needing to. Does not, on
its own, explain T05's missing title/underline or T10's 13-row
cursor-origin shift  -  those remain open, just no longer via this
mechanism.
### U24 search complete: no orphaned or mistyped GOSUB targets found anywhere
Source: DIVER.bas, full-file scan, 05 July 2026. Checked every unique
GOSUB target in the file against actual line numbers  -  zero orphaned
targets (every GOSUB resolves to a real, existing line). Checked
specifically for digit-transposition near-misses of 5060: the only
numeric near-match among real targets is 5600, which is line 5600's own
legitimate, already-documented subroutine (DECOMPRESS NEXT)  -  not an
unexplained call. The "possible transcription typo" caveat added earlier
this session does not hold up under a full scan; if anything this
strengthens the original reading that GOSUB 5060 is genuinely
unreferenced dead code, not a mistyped call site elsewhere.
### T18 correction: Bresenham-vs-linear hypothesis already tested (null result), real gap is smooth-vs-staircase
Source: SB, 05 July 2026. The "hardware best straight line fit" hypothesis
logged earlier this session as "not yet tested" had actually already been
tested, earlier the same session  -  SB ran Bresenham vs naive rounding
against DIVER.bas's actual ACCELERATED-mode segments and found no
daylight between the two algorithms for any realistic near-vertical
segment. Null result, not an open question. The genuinely untested
comparison is different: smooth line rendering vs block-staircase
rendering. TODO.md and NEXT_ACTIONS_2026-07-05.md corrected to reflect
this  -  the Bresenham-vs-linear framing should not be re-run as if still
open.
### SB confirms plan for U25/U10 isolation test (PLOT 14 on/off)
Source: SB, 05 July 2026. Agrees the isolation test proposed for U25
(and shared with U10)  -  comparing a fixed 3-block loop with PLOT 14 on
vs off, checking rendered row count  -  is the right way to settle whether
the line-buffer-corruption explanation or the BIG Characters explanation
accounts for the original screenshot. SB building this directly. No
change to TODO.md/TESTING_PLAN.md needed  -  matches the action already
recorded in NEXT_ACTIONS_2026-07-05.md.
### T15a CLOSED: air gauge fully implemented in DiverSim.jsx
John, 05 July 2026: air gauge fully implemented in DiverSim.jsx. Reactive
wiring (T20), geometry (matches CoordinateSystem.md's confirmed BAR22
spec exactly  -  no discrepancy found), and colour scheme (magenta blocks
confirmed via direct CCEMU test) all verified. One documentation note
worth keeping visible: blocks 17-18 never fill, even at CL=0, because
VA's dummy formula tops out at 13  -  faithful to source, not a rendering
gap. Removed from TODO.md per delete-when-done convention.
### T19 CLOSED (tick-loop/init call sites); T19b's structural question CLOSED; MEMORY spun out as new test T25
John, 05 July 2026: confirms T19 (GOSUB 6600, depth gauge digits) closed
for the tick-loop and init call sites  -  call-site structure, AY's
change-guard role, digit format, and DiverSim.jsx wiring all
independently confirmed across this session, with row 1's screen
position additionally validated as a side effect of calibrating row 2's
spacing against it. MEMORY (line 8010) was explicitly NOT tested, and is
excluded from this closure. Confirmed (John): MEMORY needs its own new
test, since it belongs to a phase not previously documented in
TESTING_PLAN.md at all  -  the "end phase," distinct in operation from the
tick-loop phases despite reusing established GOSUBs (6600, 6700).
Assigned T25  -  TESTING_PLAN.md's existing phase-reservation note already
named "end-of-dive sequence (GOSUB 8000)" as part of the T25-onwards
block, so T25 fits without needing a fresh decision on numbering; the
WORK/DECOMPRESS/ASCEND/REST activity-phase reservation shifted to T26
onwards to keep the two categories from colliding. New END PHASE section
added to TESTING_PLAN.md with T25's expected behaviour (AD=WD forces
full-depth digits; no GOSUB 6750 call). See TODO.md T19/T19b/T25 update,
TESTING_PLAN.md END PHASE section.
### T20 finished
John, 05 July 2026: confirms T20 (GOSUB 6700, air gauge) as finished  - 
dummy-rate mechanism, LA change-guard, and DiverSim.jsx wiring all
confirmed working. Magenta-block colour question (previously ambiguous
from photographs alone) settled by direct CCEMU test in the same pass.
See TODO.md for the consolidated closure.
### T14d/U04 closed: Depth Trend bar wired, tested, and separated from Depth Gauge in code
John, 05 July 2026: ID=21 (Depth Trend) implemented and tested against
CCEMU. RED colour proven directly from source (FL=0 fixed at line 6610,
CCI=1+FL=1, CCI=1 confirmed pure red per SCREEN_SPECS.md's Code 6 table)
rather than assumed from the depth digits sharing the same formula. Two
bugs surfaced and fixed during testing: reveal-animation bypass (rendered
before the DM box), and a frame-boundary overshoot (provisional position
overlapped FRAME's confirmed x=474 by 1-2px, corrected by moving one DM
column left). Session-long confusion between "Depth Gauge" (T19, digits)
and "Depth Trend" (ID=21, block bar)  -  genuinely distinct in source but
blended into one JS array (`depthGaugeCells`)  -  resolved by splitting
into `depthDigitCells`/`depthTrendCells`, each with independent state,
render, and comments. John confirms this as closed and working; position
remains provisional pending photo comparison, per the note carried into
TODO.md.
### Stock-take: dive-start/dispatch GOSUB cluster (lines 1465-2200) largely untouched
Source: John's request, direct trace against DIVER.bas and the freshly
uploaded DiverSim.jsx, 05 July 2026. Traced every GOSUB call between the
loop marker at line 1461 and line 2200. Result: none of GOSUB 6100,
6950, 6850, 6250, 5300, 5400, 5500, 5600, 5700, 7500, or 8000 exist
anywhere in DiverSim.jsx, and most (6100, 6950, and all five of the
5300-5700 activity-dispatch routines) have no source-level discussion on
file at all  -  not even an open TODO item. 6850, 6250, and 7500's gating
has been confirmed (via U18's testbed or U08's content analysis) but
their actual rendered content in DiverSim.jsx has never been checked.
This is a real, previously-unflagged gap  -  the 3400+ tick-loop GOSUBs
(6600/6700/6750) have all had close attention this session; this earlier
stretch of the program has had essentially none. Recorded as a
STOCKTAKE entry in TODO.md's USER INPUT section rather than assigning
individual T/U-numbers yet, since the right granularity (one test per
GOSUB, or a combined dive-start test) hasn't been decided.
### GOSUB 6750 (T21) found wired in DiverSim.jsx  -  flagged, not closed
Source: direct re-inspection of the freshly uploaded DiverSim.jsx,
05 July 2026, prompted by the stock-take above. `gosub_6750()` is fully
implemented (line 675, correctly uses the line-6752 WM fix) and wired
into runDiveTick() at [3530], alongside T19/T20's wiring. This was found
by inspection, not reported by John or SB in this session  -  NOT closed
in TODO.md pending confirmation it's actually been tested and works, to
keep the same evidential standard as T19/T20/T14d's closures. Also found
a stale comment directly beneath the wiring ("⚠ STUB  -  see LOG T21, not
yet wired into tick loop") that now contradicts the code above it  -  same
pattern as the earlier T14c/tick-stepper-header stale comments.
### Correction: lines 1670-1705 are a per-activity initiation dispatch, not one-off dive-start calls
Source: John's question on line 1682, prompting a closer retrace, 05 July
2026. Earlier same-day stock-take entry mischaracterised lines
1670-1705 as one-off dive-start calls. They're not  -  four branches,
selected per newly-starting activity, each computing AL(P,7) (predicted
end-time for that activity) differently:
  1670  -  ASCEND-shaped formula (AL(P,4)-AL(P,3))/AL(P,2).
  1680  -  DESCEND-shaped formula (opposite sign); line 1682 blanks IDs
    13-18 to spaces (VA=32)  -  clears the decompression-stop-time DM
    field, sensible since there's nothing to show it at descent start.
  1690  -  confirmed ASCEND by GOSUB 6950's own REM comment ("...WHEN
    ASCENDING"). Also calls GOSUB 6100 and 6850  -  both fire on every
    ASCEND-start, not once at dive-start as previously written.
  1700  -  calls GOSUB 6250 (decompression content)  -  DECOMPRESS branch.
GOSUB 6100 traced in full this session: checks whether a decompression
bound was crossed, using this event's depth (AL(AL,3)) and bottom time
(AL(AL,7), confirmed via line 1691's BT=AL(AL,7)) against the DT table;
updates D5/DX/HT. Hard STOP at line 6181 on table overrun  -  would need
graceful handling if implemented, same treatment as GOSUB 6750's OUT OF
RANGE case.
Consequence: 1682/6100/6950/6850 don't need individual T-numbers  -  they
belong to one coherent activity-initiation dispatch block and should be
tested as that unit. What selects between the four branches, and
whether WORK has an equivalent, not yet traced. See TODO.md stock-take
entry (corrected).
### T26, T27, T28 opened: full test coverage for the lines 1465-2200 stock-take cluster
Source: John, 05 July 2026  -  completing the stock-take by ensuring every
item found has a proper home, following the same logic that gave MEMORY
its T25. Three new tests opened:
  T26  -  activity-initiation dispatch (lines 1670-1705), covering line
  1682's DM-field blanking and GOSUB 6100/6950/6850/6250, all previously
  mischaracterised as one-off dive-start calls (see prior correction
  entry) and now understood as one coherent per-activity dispatch block.
  T27  -  activity-selection input prompts (GOSUB 5300-5700, lines
  2020-2140)  -  genuinely undiscussed until now, not even at source level.
  T28  -  GOSUB 7500, the DECOMPRESS-end handler (line 1888)  -  gating
  already confirmed via U18's testbed, content/wiring still open.
TESTING_PLAN.md's WORK/DECOMPRESS/ASCEND/REST phase reservation shifted
from "T26 onwards" to "T29 onwards" to make room, with a note that T26-28
are prerequisite dispatch/prompt infrastructure shared by all four
phases, distinct from full phase-behaviour testing itself. Every item
from the original lines-1465-2200 table now has an explicit home: T25
(MEMORY), T26 (initiation dispatch), T27 (input prompts), T28
(DECOMPRESS-end), or is already closed (T19/T20, T21 pending
confirmation).
### New status classification scheme adopted, replacing resolved/unresolved binary
Source: John, 05 July 2026, following external review. Adopted a
six-category status scheme for TESTING_PLAN.md going forward: Confirmed,
Implemented, Working Hypothesis, Observed Anomaly, Historical Variant,
Deferred, Not Yet Investigated. "Unresolved" retired from new entries  - 
it implicitly frames every open item as something to be fixed, which
doesn't fit genuine anomalies or historical variants that may never
resolve and aren't meant to. Also adopting a two-level structure
going forward: Level 1 (Functional  -  what the user sees, e.g. "Time
axis") and Level 2 (Archaeological  -  the underlying building blocks: a
single PLOT, a loop, a GOSUB, an inferred ROM behaviour), each Level 2
item carrying its own status from the new scheme. Reflects the project's
shift from "make DIVER work" to "understand how DIVER worked."
Applied opportunistically, same as the phase-tag convention  -  not a
retrofit of everything already written; only new entries and anything
revised anyway adopt the new categories and structure.
First worked example applied: U24 (GOSUB 5060, zero call sites)
reclassified from an open dead-code question to an Observed Anomaly  - 
the fact that a complete subroutine survives with no identified caller
is recorded as-is, with no attempt to infer a missing call, and no
implication that the listing is defective or that this is expected to
ever resolve. See TESTING_PLAN.md methodology note, TODO.md U24.
### TESTING_PLAN.md restructured around tick-by-tick GOSUB coverage
Source: John, 05 July 2026. Testing organised purely by top-level feature
(splash screen, depth gauge, etc.) risks missing GOSUBs/branches that
don't map cleanly onto one feature  -  this session alone found three such
gaps (the T26 dispatch block, T27's input prompts, and now T29/T30) well
after the "containing" features had already been marked working. Added a
new TICK-BY-TICK GOSUB COVERAGE section to TESTING_PLAN.md, adopted as
the organising structure for all remaining testing:
  - Method: define a small number of reference dive scenarios (A/B/C),
    chosen so their combined execution paths hit every GOSUB and every
    activity-gated branch at least once  -  branch/path coverage applied
    to the BASIC program. Each run captured as a full tick-by-tick trace
    file (extending the existing tests/T18_*_trace.txt convention).
  - Rule: a GOSUB/branch is not marked Confirmed in the coverage matrix
    until a trace file shows it was actually hit  -  source-level
    understanding alone only earns Working Hypothesis or Not Yet
    Investigated, per the status scheme adopted earlier this session.
  - Full coverage matrix built and populated with current knowledge  - 
    every GOSUB in the program, its call sites, gating, assigned T/U
    number, and status.
Building the matrix immediately proved its worth: two more GOSUBs
(6200, 6800) turned up that had only ever been covered incidentally by
U18's gating confirmation, never given their own test. Opened as T29
(GOSUB 6200, WORK-only, writes "AIR OK" to IDs 13-18) and T30 (GOSUB
6800, DECOMPRESS-only, DT countdown, writes IDs 7-12). Phase-testing
reservation shifted from "T29 onwards" to "T31 onwards" to make room.
The matrix also surfaces, rather than hides, what's still genuinely
unknown: what selects between T26's four activity-initiation branches
has never been traced, and REST/WORK's equivalents (if any) haven't been
identified  -  flagged directly in the matrix as gaps for Scenario A/B/C's
traces to help settle, rather than left implicit.
### Concrete parameter sets set for the three reference dive scenarios
Source: John, 05 July 2026. Confirmed against DIVER.bas's actual input
prompts (TIME MODE, WORKING DEPTH, BOTTOM TIME, FOR HOW LONG) before
setting values  -  DR=30/AR=15 confirmed as fixed constants, not user-set;
DECOMPRESS's own duration confirmed fully computed, not prompted, so
Scenario B needs no decompress-duration parameter.
  Scenario A: ACCELERATED, WD=18, BOTTOM TIME=10, no REST. Simple path,
  no decompression obligation expected.
  Scenario B: ACCELERATED, WD=40 (reuses T18's validated precedent),
  BOTTOM TIME=20, no REST. Expected to force a decompression obligation;
  flagged as a reasoned estimate, not calculated from the DT table's
  actual thresholds (not extracted anywhere on file)  -  if it doesn't
  trigger, raise BOTTOM TIME in 5-minute steps and log the threshold
  found as a useful result in its own right.
  Scenario C: ACCELERATED, WD=18, BOTTOM TIME=8, REST=5. Built on
  Scenario A's shallow profile to isolate REST's gating from
  decompression complexity.
Written into TESTING_PLAN.md's REFERENCE SCENARIOS section, replacing
the "TBD per scenario" placeholder. CCEMU itself remains John's choice;
this only fixes the DIVER.bas-side parameters.
### CORRECTION: T26's branch mapping was wrong  -  missed the dispatch line entirely
Source: John/SB, 05 July 2026, prompted by a corrected state line for
T26. Direct re-check of DIVER.bas confirms the error. Line 1665, missed
entirely in the earlier trace: `ON AL(P,1) GOTO 1670,1680,1690,1700,1710`
 -  the actual dispatch mechanism. Combined with U18's already-confirmed
activity-code mapping (1=DESCEND, 2=ASCEND, 3=WORK, 4=DECOMPRESS,
5=REST), this gives the correct branch assignment:
  1670=DESCEND (no GOSUBs), 1680=ASCEND (line 1682's DM-field blanking),
  1690=WORK (GOSUB 6100/6950/6850/6950  -  most documented of the five),
  1700=DECOMPRESS (GOSUB 6250), 1710=REST (no GOSUBs, never traced
  before this correction).
This CORRECTS an earlier same-session reading that had 1680/1690 swapped
 -  DESCEND/ASCEND mis-assigned from formula shape alone, and 1690 misread
as ASCEND specifically because GOSUB 6950's own REM comment ("...WHEN
ASCENDING") was taken as evidence of which activity calls it, rather
than what its output describes. In fact GOSUB 6950 fires on WORK-
initiation and precomputes/displays the ascent-stop that will eventually
be needed once work ends  -  its name describes its output, not its
caller. GOSUB 6100's REM comment ("between last WORK-END and when THIS
WORK...") actually fits the corrected WORK-initiation reading far better
than the earlier ASCEND reading ever did, in hindsight.
Consequence: T26 is now source-COMPLETE, not partial  -  all five
branches traced, including REST (1710), which had never been looked at
before this correction. Nothing left to trace at the source level;
remaining work is implementation only. Corrected in TODO.md, TESTING_PLAN.md
(entry + coverage matrix rows for 6100/6250/6850/6950), and
GOSUB_INDEX.md (summary table, detail sections, and the GOSUB 7000
caller-breakdown bucket label, which had also called this "dive-start
sequence" and was never updated when the block was first correctly
identified as per-activity dispatch rather than one-off).
### T27 refined: GOSUB 5500 already partly documented, two of the four new ones need no user input
Source: John/SB, 05 July 2026. GOSUB 5500 (SUB WORK NEXT) already has
substantial prior documentation via this session's U18/GOSUB 6900 work
 -  T27 was not fully undiscussed as previously stated, only 5300/5400/
5600/5700 were genuinely unread before this. Of those four, GOSUB 5400
(ASCEND NEXT) and GOSUB 5600 (DECOMPRESS NEXT) take no user input at
all  -  both derive their values directly from HT/DX/D5 (confirmed
against source: 5600 reads `PA(PA,2)=DX`, or `D5` if `HT=5`; 5400 reads
`PA(PA,4)=HT` directly). Only 5300 and 5700 remain to trace in full.
See TODO.md T27, TESTING_PLAN.md T27.
### T29, T30 corrected to source-COMPLETE; Scenario B's hedge dropped, DT[16][1]=16 confirmed
Source: John, 05 July 2026. T29 (GOSUB 6200) and T30 (GOSUB 6800) were
logged as "Not Yet Investigated" when the coverage matrix opened them  - 
wrong. Both already had complete source-level analysis from direct
conversation this session: T29's full digit decode (6200-6240), its
role as the third writer to the IDs 13-18 field, and the explanation for
its absence from every reference photograph (WORK-only) were all already
established. T30's full digit decode (6800-6845) had already resolved
the "T "-prefixed display seen in photographs. Both corrected to
"Confirmed (source)" with "implementation only" as the remaining action.
Separately: Scenario B's WD=40/BOTTOM TIME=20 was written up with a
hedge ("reasoned estimate... raise in 5-minute steps if it doesn't
trigger") that shouldn't have been there  -  the actual calculation had
already been done earlier this session: WM=40 gives J=16 (GOSUB 6100's
depth-bucket index), DT[16][1]=16 minutes is the confirmed no-stop limit
at 40m, and BOTTOM TIME=20 exceeds it by 4 minutes with margin. Hedge
removed, replaced with the confirmed figures.
### Pattern noted: coverage-matrix build missed work done in direct conversation, not file-derivable
Source: John, 05 July 2026. This is the fourth instance in one pass
(T26, T27, T29, T30 all needed correcting the same way) of the same
underlying gap: building the coverage matrix by scanning DIVER.bas and
the existing TODO.md/LOG.md/GOSUB_INDEX.md files does not reliably
surface work that happened in direct conversation this session but
wasn't fully re-derivable from those files alone  -  some of that
conversational work had landed as TODO/LOG entries, but not always in a
form a file-scan would connect back to the specific GOSUB/line in
question. Flagging this as a structural limitation of how the matrix was
built, not a one-off. Practical consequence going forward: for whatever
of T26/T27 still needs finishing (T27's 5300/5700, T26's DM-field
blanking detail) and any future matrix entries, checking directly with
John/SB before writing "Not Yet Investigated" or "no source discussion
on file" is more reliable than a file-scan alone, given how much of this
project's real analysis happens in conversation first and file-form
second.
### Version snapshot discipline adopted, after a DiverSim.jsx session had to be reverted
Source: John, 10 July 2026. A DiverSim.jsx session with SB went wrong  - 
too many things attempted at once, none handled well  -  and had to be
reverted. SB acknowledged this and is now working tick-by-tick with
confirmation at each step rather than large speculative changes. John's
own note: "handle versions better." Formalised as a methodology note in
TESTING_PLAN.md: before starting any DiverSim.jsx/DiverSim2.jsx work
with real risk of going sideways, save a timestamped snapshot first
(e.g. DiverSim_2026-07-10_preT26.jsx) so a revert is always a known-good
file rather than a hope that undo history holds up. Same underlying
principle as the DIVER.bas/DIVER7450.BAS provenance split under U26  - 
know which version produced which result, always have a safe fallback
point.
### Postmortem: reverted T26+T27 combined attempt confirms the "monster test" diagnosis
Source: SB, 10 July 2026. A first attempt combined T26+T27 as one large
piece  -  all five NEXT routines, GOSUB 5900's work-stretching logic,
event-creation for all five activity branches, and a new prompt UI, all
built simultaneously. Produced multiple simultaneous symptoms: the trend
bar (T14d, already closed) rendering out of order, the BOTTOM TIME
prompt repeating, no evidence of the WORK event actually being built,
and prompts rendered as HTML rather than authentic BASIC-style
PRINT/text. Also contained a genuine self-inflicted structural bug: an
early large edit replaced `function runDiveTick() {` without ever
re-adding the declaration, leaving the whole tick body floating outside
any function for several subsequent edits before a binary-search on
brace balance caught it. Reverted entirely rather than debugged in
place. Confirms John's "too many things going on, none of them handled
well" diagnosis directly, and the version-snapshot-discipline note
adopted the same day  -  this is exactly the failure mode that note was
written to guard against. T14d's own closure is unaffected  -  the
trend-bar symptom was a side-effect of the broken combined attempt,
now gone with the revert, not a real regression in T14d itself.
### T22 extended: "WHICH ACTIVITY REQUIRED" prompt implemented, deliberately scoped
Source: SB, 10 July 2026, following the revert above  -  working
tick-by-tick with confirmation at each step per John's direction. The
isolated prompt itself now implemented in DiverSim.jsx: boundary
detection (`CL>=ES(EP,2)-IK`, `CK` gate, REST-skip  -  the gating logic
T22 already confirmed via LOOPTRACE3.BAS), displayed as authentic SVG
text at row 0 matching the existing WD/TM prompt style rather than an
HTML modal, and input capture/validation against `A$(1..5)` (the
activity-name array from U18's confirmed DATA statement). Tested and
confirmed working by John. Deliberately stops there: no PA building, no
NA consumption into an event, no createEvent() call  -  that remains open
as its own separately-tested step, feeding into T26/T27 rather than
being built alongside them in one piece. See TODO.md T22.
### T26a-e/T27a-e split confirmed adopted; T26a closed
Source: John, 10 July 2026, following SB's status report. The T26a-e/
T27a-e split (drafted 05 July 2026, held pending SB's input on the
original combined T26/T27 attempt) is now confirmed adopted  -  TODO.md's
stock-take entry updated to match TESTING_PLAN.md, which already carried
the split. T26a (DESCEND-initiation, line 1670) marked CLOSED: SB
reports it implemented in DiverSim.jsx and tested working  -  the first
of the T26/T27 sub-tests actually completed, using the tick-by-tick,
one-piece-at-a-time approach adopted after the earlier combined attempt
had to be reverted. See TODO.md T26, TESTING_PLAN.md T26a.
### T27b CLOSED: ASCEND NEXT implemented and tested
John, 05 July 2026: `gosub_5400()` (ASCEND NEXT) implemented and tested
against the confirmed no-input formula. Result: PA(2)=15 (=AR), PA(4)=0
(=HT, no decompression obligation yet in this test), PA(5)=5 (HT=0, so
the HT≠0→4 branch correctly didn't fire)  -  exact match to prediction.
Scoped precondition noted in code: gosub_5400() resets PA_scalar=1
itself, standing in for T23's skeleton-building step (not yet
implemented)  -  flagged to revisit once T23 exists, so the two don't end
up resetting PA_scalar in conflicting ways. Second of the T26/T27
sub-tests completed. See TODO.md T27, TESTING_PLAN.md T27b.
### T27d CLOSED: DECOMPRESS NEXT implemented and tested
John, 05 July 2026: `gosub_5600()` (DECOMPRESS NEXT) implemented and
tested against the confirmed no-input formula. Result: PA(2)=0 (=DX, at
its init value since T26c/GOSUB 6100  -  the thing that would actually set
DX  -  isn't built yet; expected, not a defect), PA(4)=0 (=PA(3),
uninitialised for the same reason, exactly as flagged in code comments
before testing), PA(5)=2 (unconditional per source)  -  all as predicted.
Same scoped precondition as T27b: gosub_5600() resets PA_scalar=1
itself, standing in for T23's not-yet-built skeleton step. Third of the
T26/T27 sub-tests completed. See TODO.md T27, TESTING_PLAN.md T27d.
### FORWARD DEPENDENCIES standing note added to TESTING_PLAN.md
Source: John, 10 July 2026. Several small T26/T27 sub-tests pass
correctly today only because something they depend on hasn't been built
yet (T27b/T27d's shared PA_scalar precondition standing in for T23;
T27d's DX/PA(3) values sitting at init because T26c/GOSUB 6100 isn't
built). Added a standing, live-maintained list in TESTING_PLAN.md so
these don't have to be reconstructed from LOG.md later, and so each gets
re-checked when its actual dependency lands rather than assumed to still
hold. To be added to as more sub-tests close conditionally.
### T27e CLOSED: REST NEXT implemented and tested, first start/resume split confirmed
John, 05 July 2026: `gosub_5700_start()`/`gosub_5700_resume()` (REST
NEXT) implemented and tested  -  first of the "second prompt" routines,
confirming the start/resume split works correctly for a genuine two-step
flow (WHICH ACTIVITY → FOR HOW LONG). Result: input=10, TK=0.25 (clamp
threshold=0.5) → PA(2)=10 (correctly unclamped, well above the 0.5
threshold  -  clamp behaviour itself not exercised by the initial test,
only confirmed not to misfire on a normal value), PA(4)=0 (=PA(3),
uninitialised pending T23 as expected), PA(5)=5  -  all as predicted.
Readout now also shows the input variables behind each result
(HT/DX/D5/AR/TK as relevant), added mid-session so results can be
checked against their actual inputs rather than asserted blind.
Same day, SB tried additional rest-time values beyond the initial 10 and
got the expected results each time  -  possibly exercising clamp behaviour
for the first time, though full detail not yet written up; a fuller
LOG.md entry is expected to follow.
Fourth of the T26/T27 sub-tests completed. Correction made in the same
edit: an initial draft of this entry claimed all five of T27 were now
closed  -  wrong, only T27b/T27d/T27e are. T27a (DESCEND) is still
untraced and T27c (WORK) is documented but not yet implemented/tested.
Caught and corrected before being left standing. See TODO.md T27,
TESTING_PLAN.md T27e.
### T27a CLOSED: DESCEND NEXT implemented and tested, valid-input case only
John, 05 July 2026: `gosub_5300_start()`/`gosub_5300_resume()` (DESCEND
NEXT) implemented and tested. Valid-input case confirmed: typed 42,
AD=40, valid range 40-50 → PA(2)=30 (=DR), PA(4)=42, PA(5)=3, exact
match to prediction. Same shape as T27e  -  one prompt, one condition,
plus the readout-with-inputs convention now standard across all four
NEXT-routine closures. NOT YET TESTED: the reject-and-reprompt path
itself (`IF M<AD OR M>50 THEN 5312`)  -  same situation as T27e's clamp,
where the first test happened to fall on the "no correction needed"
side. Flagged as not fully proven until a follow-up test confirms
rejection with no PA write. Added to TESTING_PLAN.md's FORWARD
DEPENDENCIES note alongside T27e's clamp gap, since both are the same
category: closed on the happy path, with a genuine untested branch
still sitting in the code.
Fifth of the T26/T27 sub-tests completed, and four of five NEXT
routines now closed (T27a/b/d/e)  -  only T27c (WORK NEXT) remains,
deliberately held back given GOSUB 6900 and the work-stretching logic
(GOSUB 5900) it involves. See TODO.md T27, TESTING_PLAN.md T27a.
### Dismissive "no JSX equivalent" comments flagged, table built for SB
Source: John, 10 July 2026. Raised concern that comments like "// [100]
CLEAR 20  -  string space reservation, no JSX equivalent" read as "there's
no equivalent so we didn't bother," which conflicts with the project's
stated ethos (STYLE_GUIDE.md: historical fidelity, translate the BASIC
algorithm not just its output). Full-file scan of the uploaded
DiverSim.jsx for this pattern and broader dismissive phrasings found
three genuine cases: [100] CLEAR 20 (string-space reservation  -  a real
memory-model artifact of 1979 interpreters), [1277] PLOT 255 (Plot Mode
exit  -  meaningful in the original's shared stateful terminal protocol,
genuinely unneeded in JSX's structurally separate SVG/DOM rendering),
and PRINT CHR$(7) at lines 846/848 (the terminal's audible bell  -  the
one case of the three where a modern equivalent is actually
implementable, unlike the other two which are archaeologically complete
as documentation fixes). One existing comment ([6763] OUT OF RANGE) was
already done right and held up as the template. Two near-misses (DM
internal grid, ID=21 orientation note) were checked and found legitimate
as written  -  they honestly state no BASIC line exists to translate,
rather than dismissing one that does. Everything else caught by the
broader search (array-indexing footnotes, T27c forward-dependency notes)
is accurate WIP commentary, not part of this problem. Table with
suggested replacement wording for all three written to
COMMENTS_TO_AMEND.md for SB.
### T21 CLOSED: gosub_6750 confirmed cycling correctly through multiple decompression bounds
John, 10 July 2026: after entering a positive BOTTOM TIME (22, via the
newly-closed T27c), `gosub_6750` was observed cycling correctly through
multiple decompression-table bounds in row 16 ([16,21,25,28,30,31,999])
 -  no-stop time counting down, switching to time-to-next-bound once
exhausted, then re-targeting each successive column as CL passed it,
finally hitting the genuine OUT OF RANGE halt (line 6763) once the row
ran out of real values. First time this multi-bound cycling has been
observed end-to-end; strong positive confirmation of gosub_6750's
translation, including the WM fix (line 6752). This is the confirming
test T21 had been waiting on since 05 July 2026, when the wiring was
found already present but left unclosed pending exactly this kind of
evidence. Consolidated two previously-separate TODO.md entries (a stale
STUB-status T21 entry, and the "FLAG FOR CONFIRMATION" note) into one
clean closure. Stale contradicting comment ("⚠ STUB  -  not yet wired
into tick loop," sitting beneath the actually-working code) also cleaned
up as part of this.
NOTE, explicitly not a defect: CL kept climbing unbounded past the
entered 22 minutes in this test, because T26c (which would create a
real WORK event with its own end-boundary) isn't implemented yet  -  the
tick loop was still running under the shadow of the original DESCEND
event. This directly identifies what T26c's arithmetic actually fixes
(AL(AL,1) becoming 3/WORK instead of staying 1/DESCEND) and confirms it
as the natural next piece, rather than DiverSim.jsx having a bug.
### T26c split further into T26c-1 through T26c-4, reversing the earlier "kept as one unit" call
Source: John, 10 July 2026, prompted directly by the combined-attempt
failure earlier this session. T26c was originally scoped as one
sub-test on the reasoning that its three GOSUB calls were "one coherent
sequence." Reconsidered: as scoped it actually requires four new things
 -  the arithmetic itself, plus three GOSUB functions (6100, 6950, 6850)
that don't exist in DiverSim.jsx at all yet  -  which is exactly the
"monster test" shape that just failed. Split the same way T27c split
off GOSUB 5900: T26c-1 (event-creation arithmetic only  - 
AL(P,7)=AL(P,6)+AL(P,2), E5=D5:EX=DX  -  with 6100/6950/6850 explicitly
stubbed) scoped as the immediate next piece, expected to fix the
unbounded-ticking behaviour observed in the T21 finding above. T26c-2/
3/4 (GOSUB 6100/6950/6850 respectively) each become their own later
piece. See TODO.md T26, TESTING_PLAN.md T26c-1 through T26c-4.
### Historical-first commenting adopted project-wide, full audit deferred to a final pass
Source: John, 10 July 2026, generalising from the three-item comment
table (COMMENTS_TO_AMEND.md). The underlying principle is broader than
"no equivalent" dismissals  -  comments like "// replaced with SVG" have
the same problem in a different shape: they jump to the modern
implementation without ever stating what the original did. Adopted as
an explicit STYLE_GUIDE.md rule: any comment covering a BASIC construct
without a direct JSX equivalent must state (1) what the BASIC statement
did, (2) why it existed on the original hardware, (3) either why modern
JSX doesn't need an equivalent or how it achieves the same effect
differently, and (4)  -  mandatory, not optional  -  whether any
behavioural effect still needs preserving, since this is what stops the
convention collapsing back into a longer dismissal.
Scope decision: applied going forward and whenever existing code is
touched for other reasons, NOT retrofitted now. A full audit of
everything already written is deliberately deferred to a final pass,
after all other work is finished  -  added to TODO.md under a new FINAL
PASS section, alongside a pointer to COMMENTS_TO_AMEND.md as its
starting seed.
### Finding: REST loops indefinitely, root cause identified, left as a known deliberate gap
John, 10 July 2026: WORK→ASCEND→REST chain now reaches REST correctly  - 
T26a-e's fix confirmed working for that path. But REST then loops
indefinitely, always defaulting back to REST (faithful to source: PA(5)=5
per line 5730, REST's own default next activity is REST), with no
endpoint. Root cause identified precisely: source line 1800
(`IF AL(AL,1)<>5 THEN 1881`) is the actual dive-termination check  -  the
dive only ends when the just-ended event was REST, triggering GOSUB
8000+END. That's part of T23 (end-of-event handler), which is verified
against the source (LOOPTRACE4.BAS) but not implemented in DiverSim.jsx
at all. Without it, nothing catches "a REST just finished" and the cycle
has no exit.
Decision (John): noted and left as a known gap, not fixed now  -  not
building T23 (or even a scoped-down halt-on-REST piece) at this point,
moving to the next item instead. Any test dive currently ending in REST
will not terminate  -  expected behaviour given what's built, not a
regression to chase. See TODO.md T23, TESTING_PLAN.md T23.
### T24 fully re-scoped and split into T24a-d, following the T26/T27 precedent
Source: SB, 10 July 2026. Pulled the complete Branch 2 source (had only
had it partway through before) before proposing any breakdown, avoiding
the earlier "monster test" mistake of scoping from an incomplete
picture. Branch 2 turns out richer than "coloured bands" suggested: for
each time-axis column since the last tick, it draws two distinct things
 -  a stack of coloured vertical bars (scanning the DT table's 7 columns
for where elapsed time crosses each decompression bound, rendering the
decompression ceiling structure as stacked layers) and a single marker
dot at the diver's actual current position (X3,Y3), which is what makes
it a "mountain" reading  -  the bands form a profile and the dot tracks
position against it.
Split into four pieces, smallest and least-risky first, same reasoning
as T26/T27's splits:
  T24a  -  outer setup only (column loop bounds, LM skip-check, per-column
  resets), no visible output, pure housekeeping. SB starting here.
  T24b  -  the diver's position dot, `PLOT 2,253,X3,Y3,255`  -  simplest
  actual PLOT call in the routine, first visible output.
  T24c  -  band-search arithmetic (DT-scanning loops), still no drawing.
  T24c2  -  a deliberately separate colour/grammar analysis step between
  T24c and T24d: `PLOT 29,C(C)` (line 6510) and `PLOT 30,C(CO)` (line
  6590) are exactly U07's already-flagged "doesn't match documented Code
  29 grammar" issue  -  resolve this and the C() colour array's contents
  before guessing at colours during rendering.
  T24d  -  actual band rendering, once T24c/T24c2 are confirmed.
U07 is now decomposed across these five pieces rather than sitting as
one large unresolved item. See TODO.md T24, TESTING_PLAN.md T24a-d.
### T24c2 RESOLVED: PLOT 29/30 grammar confirmed, C() reclassified as a display-attribute table
Source: three distinct pieces of evidence, kept separate below.

(1) EXPERIMENTAL RESULT  -  John, 10 July 2026, isolation test run on
CCEMU (screenshot on file). The test used DIVER.bas's own C() values
(DIM C(7), C(1)=20 through C(7)=16) rather than raw 0-7, and sent
`PLOT 29,C(I)` / `PLOT 30,C(I)` for I=1 to 7, watching for an extra
character or cursor jump between a printed "A" and "B" marker on each
row  -  leakage would mean the value wasn't being consumed as flag data.
Result: clean "AB" on every row tested, each in a distinct colour, no
stray characters or jumps observed. No byte leakage.

(2) NEW PRIMARY SOURCE  -  a Compucolor II manual excerpt, distinct from
Compucolor-8001-manual.pdf already on file: "Color can be selected
without being contained in a quoted string by the second method of
setting color, blink and character height. This is done through the use
of the PLOT statement... PLOT 29 (sets foreground color), PLOT 30 (sets
background color), PLOT 31 (sets blink on), PLOT 14 (sets large
characters), PLOT 15 (sets blink and large characters off)." This is
the correct manual for CCEMU specifically, which emulates the Compucolor
II (per the CCEMU-scope methodology note)  -  directly confirms PLOT 29/
30/31/14/15 are display-attribute commands, not drawing commands.
ACTION NEEDED: this excerpt came via John relaying another AI
conversation; the source PDF itself isn't in hand. Worth asking John
whether it can be filed properly (e.g. as Compucolor-II-manual.pdf)
alongside the 8001 manual, since it's now load-bearing primary evidence.

(3) INTERPRETIVE COMMENTARY  -  from a separate AI assistant John
consulted (not SB, not this instance), synthesising (1) and (2). Logged
here as attributed external commentary, not as an independent source in
its own right: proposed reclassifying C() from "colour array" to "a
table of Compucolor display-attribute values, of which colour is one
effect, not the whole of what's selected," and noted George's use of
named C(1..7) constants rather than inlining raw PLOT 29 values
throughout as a deliberate abstraction insulating the rest of the
program from hardware codes. Both points independently check out against
(1) and (2) directly, not just asserted  -  adopted into TODO.md/
TESTING_PLAN.md's terminology on that basis.

CONSEQUENCE: T24c2 (the colour/grammar gate between T24c and T24d)
closes. T24d can proceed without guessing at what PLOT 29/30 do.
Remaining open question, NOT resolved by this: which band gets which
specific attribute per decompression state  -  that's T24d's job, using
this grammar as a known-solid foundation rather than an open risk.

SB was not part of this exchange and does not yet know about it  -  flag
directly when SB resumes, since it unblocks T24d and changes the C()
terminology SB should use going forward.
### T24a CLOSED: Branch 2's outer setup confirmed, console-visibility issue worked around
John, 05 July 2026 (confirmed after this session's console-debugging
friction was resolved by switching approach): Branch 2's outer setup  - 
column loop bounds LP/LQ, LM skip-check, per-column resets Y3/XX/Y2/C/
L/CO  -  implemented and tested via a dedicated stepper added to
DiverSim2.jsx: a "Force WORK (AL=3)" debug button (sets AL(AL,1)=3
directly, bypassing the full activity-transition machinery, since that
isn't built in DiverSim2 at all) plus an on-screen readout of every
T24a variable. This extends the existing manual tick-stepper pattern
rather than relying on console.log, which proved unreliable this
session (a "19 hidden" console message that neither the frame-context
dropdown nor other checks resolved  -  worked around by moving to
on-screen readout, not root-caused).
Observed alternation  -  LM advancing one column every other tick (new
column computed, then skipped once)  -  confirmed EXPECTED, not a bug:
XS=2.0, TK=0.25 means CL×XS only advances 0.5/tick, and INT() flooring
only promotes LQ on alternating ticks. Identical mechanism to T18's
already-confirmed Branch 1 pairing rhythm (LP/LQ/LM are shared between
both branches)  -  good cross-confirmation the shared arithmetic is
consistent, not a new finding specific to Branch 2.
DiverSim2.jsx's stepper additions (Force WORK button, T24a readout
panel) are testing scaffolding  -  not yet decided whether they're worth
carrying into DiverSim.jsx or left as DiverSim2-only tooling.
T24b scoped as the next piece: the diver's position dot
(`6591 PLOT 2,253,X3,Y3,255`)  -  simplest actual drawing statement in
Branch 2, sits inside T24a's existing loop/skip-gate as a small
addition rather than new structure, and reuses T18's already-proven
plotX()/plotY() coordinate helpers directly. Suggested to render an
actual SVG dot rather than another readout, since it's the first
genuinely visible output from Branch 2. See TODO.md T24, TESTING_PLAN.md
T24a/T24b.
### U07/U10 cross-check reopened: PLOT 30,16's meaning has conflicting history, not newly contradictory
Source: John, 05 July 2026, flagged immediately after U07's grammar
resolution. U07's "PLOT 30,x sets background colour" finding (confirmed
via isolation test + Compucolor II manual quote) doesn't obviously
square with U10's already-cited "PLOT 30,16 = large characters toggle"
(CoordinateSystem.md, stated as "Confirmed effect").
Full history dug up rather than assumed: this exact tension already
existed in the files and was never fully reconciled.
  - Earliest entry: "PLOT 30: sets background colour  -  PLOT 30,16 =
    black bg, PLOT 30,22 = prior colour" (contextual analysis).
  - Refined: "PLOT 30 mechanism clarified: Code 30 (Flag On) + CCI byte
     -  not XOR plotting... PLOT 30,16 = Flag On + CCI byte 16 (black
    bg). Prior LOG entry correct in effect, wrong in mechanism."
  - Then, when "large characters" entered the record: "PLOT 30 partial
    clarification: 30,15=small characters, 30,16=large characters  - 
    confirmed by emulator... Background-colour meaning of byte 16
    unconfirmed... Prior LOG entry on PLOT 30 background should be read
    with this caveat."  -  this is the explicit hedge that never made it
    into CoordinateSystem.md's downstream summary, which states "large
    characters" as flatly Confirmed with no caveat on direction.
  - TESTING_PLAN.md's own T02 entry, separately, states "PLOT 30,16 sets
    black background at end"  -  a third instance of the background-
    colour reading, sitting uncorrected alongside the large-characters
    one.
Independent corroboration for background-colour: "PLOT 30,20=blue bg"
was observed during U10's own original investigation, and 20 is exactly
C(1) from T24c2's freshly-confirmed display-attribute table  -  real
cross-confirmation from an unrelated angle.
John's hypothesis, NOT confirmed: PLOT 30's argument may be a multi-
purpose/bit-encoded byte (some bits colour, a separate bit character
size) rather than single-purpose, similar to the CCI convention used
elsewhere. Plausible, but not checked against the manual's actual bit
layout for this specific argument.
Do not cite U07 and U10 together as reconciled until this is resolved.
Updated TODO.md (T24c2, U10) and CoordinateSystem.md's DM box background
note to carry this flag explicitly rather than let either "Confirmed"
statement stand unqualified.
### Policy adopted: demonstrated behaviour overrides documentation during development; U07/U10 deferred
Source: John, 10 July 2026. Confirmed PLOT 29/30 with argument values
1-7 (the C() range) demonstrated cleanly as simple colour-setting, no
other settings interfering, repeatable  -  x=16 specifically not tested
this time. Generalised into standing policy: when a piece of DiverSim.jsx
behaviour is directly demonstrated clean, build against it and move on,
even where a manual or an earlier LOG.md entry doesn't yet fit  - 
reconciling the discrepancy is deferred, not abandoned, and belongs
later in the project rather than blocking active development now.
Written up as a new methodology note in TESTING_PLAN.md, using this
exact case as the worked example.
Consequence for U07/U10: since the coloured bands only ever use C()
values 1-7, U07's demonstration fully unblocks T24d  -  the x=16-specific
tension with U10 (DM box background vs large-characters reading)
doesn't touch that range. Separately, John notes the DM box content is
now rendering correctly end to end, after considerable work to get there
 -  the x=16 question no longer reads as a live concern, just an
unreconciled historical detail. Downgraded from "cross-check needed
before citing together" to deferred: moved into TODO.md's FINAL PASS
section (alongside the comment-audit item), softened in CoordinateSystem.md
to reflect non-blocking status, full history retained as-is from the
earlier LOG.md entry. Revisit once all else is finished, not before.
### Correction: U07 screenshot's odd-only rows were the test loop, not a capture artefact
Source: John, 10 July 2026. My earlier guess that X=2/4/6 were missing
from the U07 grammar-test screenshot because of scrolling or an
incomplete capture was wrong  -  the test loop itself only stepped through
odd values (1,3,5,7), so there was never anything to capture for the
even ones. Corrected in EVIDENCE_TO_PRESERVE.md.
Observed Anomaly (per the new classification scheme, 10 July 2026):
separately, X=7's "B" marker appeared to land on the next output line
rather than immediately after "A" on the same line  -  possibly a CCEMU
buffer-clearing quirk, not yet explained. Genuine feature of what was
observed, no current explanation, no expectation of urgent resolution  - 
recorded as-is rather than guessed at. Doesn't affect U07/T24c2's
closure (the grammar result itself  -  no leakage, correct attribute
behaviour  -  is unaffected by this). Worth a look if a similar oddity
recurs elsewhere, otherwise left as a curiosity.
### T24b CLOSED: diver's position dot rendering confirmed, T24c scoped in full detail
John, 05 July 2026: diver's position dot ([6591] PLOT 2,253,X3,Y3,255)
implemented in DiverSim2.jsx's stepper, reusing the same plotX/plotY
helpers already proven for T18's profile line  -  no new geometry needed.
Tested via the Force WORK workflow: with AD fixed at WD (40m) throughout
(WORK doesn't change depth), the dot renders precisely on the 40m depth
tick, confirmed visually against the existing tick scale. Rendered as a
small yellow circle, distinct from Branch 1's white profile rects, so
both remain visible and distinguishable during testing.
T24c scoped with full source detail (lines 6350-6390, plus state-carry
lines 6540-6570): the J/I loop scanning the DT table to find each band's
depth boundary (Y1), checking whether the diver's current position (Y3)
falls within that band, and the Y2/C/L bookkeeping needed to step
through all 7 potential bands rather than just the first. Scoped to
build the full loop/arithmetic with the actual drawing calls (lines
6500-6525) explicitly stubbed  -  same treatment as GOSUB 6100/6950/6850/
6250/5900 elsewhere  -  confirming which bands exist and where via
on-screen readout before committing to rendering. See TODO.md T24,
TESTING_PLAN.md T24b/T24c.
### T24c bug confirmed and fixed: BASIC FOR-NEXT loop exhaustion is meaningful, not an error
SB, 10 July 2026. Confirmed all three review points from the earlier
T24c readout:
Point 3 (arithmetic): SB's own working contained a slip  -  stated
Y1=INT(140-(2×22+8)×2)=38, but the correct result is 36
(2×22+8=52, 52×2=104, 140-104=36). SB caught and corrected this
immediately when flagged, noting the final conclusion (Y1 clamps to 40)
was right, but the intermediate step it was reached through was wrong  - 
worth recording as a small honest moment in the narrative: the right
answer arrived via a flawed path, and the flaw was caught and owned
rather than left standing once pointed out.
Point 2 (table exhaustion): confirmed genuine, not a display artifact.
SB checked directly against source data before responding: for column
X3=37, J=3, DT(20,3)=16 and DT(21,3)=15 against XX=13.25  -  neither
value is below XX nor equals the 999 sentinel, so the scan genuinely
exhausts the table for that column on real data, not an edge case
manufactured by the test.
Root cause and fix: the inner I-loop (FOR I=L TO 21) was defensively
bailing out when it ran to completion without an early exit, treating
that as an unexpected error. Real BASIC FOR-NEXT semantics don't work
that way  -  I settles at 22 (one past the upper bound) and execution
carries on normally using that value. With the corrected arithmetic
(I=22 → Y1=36, +2=38, <40 clamp fires → Y1=40), this is the genuine,
correct line-6540 "hit the ocean floor, stop scanning" exit condition  - 
a meaningful result, not a dead end. Fix applied by SB; T24c not yet
formally closed pending re-verification of the readout against the
corrected code.
Wider consequence, recorded per John's request even though the
follow-up itself is incomplete: this may not be a one-off translation
error. Any other FOR...NEXT loop translated with the same defensive
instinct (treating natural loop-exhaustion as an error case rather than
tracing what the source actually does with the settled loop variable)
could carry the same class of bug. A systematic check has NOT been
done. Recorded as a live TODO.md item now, and as a lasting lesson in
STYLE_GUIDE.md ("BASIC FOR-NEXT loop exhaustion is often meaningful,
not exceptional"), rather than waiting for the audit itself to happen
before writing any of this down.
### Tick-stepper granularity refined: even one tick can be too much
John, 10 July 2026. The manual tick-stepper has genuinely helped break
down T24's complexity, but the T24a+c readout just reviewed processed
two columns' worth of band-search output (X3=36 and X3=37) in a single
tick, since LP/LQ can span more than one column per step  -  still more
than ideal to take in at a glance. Noted as a refinement to the
version-snapshot/tick-by-tick methodology note in TESTING_PLAN.md:
monitoring fewer ticks  -  or even sub-tick, down to one column's worth of
output  -  remains viable and worth using whenever a single step still
feels like too much to follow. The stepper is a tool to use at whatever
granularity keeps a pause actually inspectable, not a fixed unit.
### FOR-loop audit complete: T24c's bug was the only instance
SB, 10 July 2026. Systematic check of every FOR...NEXT loop in both
DiverSim.jsx and DiverSim2.jsx for the same defensive-bailout pattern
found in T24c. Checked both files properly after an initial pass missed
DiverSim2.jsx  -  the file where the actual bug lived  -  and was corrected
before being reported.
Result: T24c's scan was the only actual instance.
  gosub_6750's bound search (line 711)  -  checked directly against
  source: line 6763 has an explicit `PRINT "OUT OF RANGE": STOP`
  immediately after the loop. A genuine source-level halt, not a
  natural loop-completion being misread  -  already translated correctly.
  WHICH ACTIVITY's name-matching loop  -  never treated "no match" as an
  error to begin with (it re-prompts)  -  no risk of this pattern.
  DiverSim2.jsx  -  only one FOR I/J/K loop exists there at all (T24c's
  own), already covered.
Flagged for the record though not yet live code: gosub_5900
(work-stretching logic, still a stub) has two similar-looking scans in
source, but both end in an explicit source-level error path (line
5931's STOP, line 5970's PA=-1 error flag)  -  when eventually built,
"no match → halt" will be the correct translation there, not a repeat
of this mistake. Worth remembering when that day comes.
Separately, the static "(no draw, C=1)" debug label (point 1 from the
earlier review) is fixed  -  now derives from the live C value instead of
a hardcoded string, "compiles clean" per SB. This was misleading in
exactly the case that revealed the original bug (where C wasn't
actually available yet), so worth having fixed properly rather than
left as a known quirk.
### T24c status precisely restated: fix applied, not yet observed working
SB, 10 July 2026, self-assessment given deliberately precisely rather
than rounded up to "done." What was actually completed: the I=22
semantics fix, the live-C label fix, and confirmation via esbuild that
the code compiles  -  a syntax check only. Also hand-reasoned through the
corrected arithmetic to predict the result (getting it wrong once along
the way, caught on review  -  see the earlier LOG.md entry). None of that
constitutes actually running the corrected code and observing real
output, per the project's own evidential hierarchy (observed behaviour
outranks reasoning about behaviour, however careful). T24c remains NOT
CLOSED. Specific test identified to actually close it: reload with the
corrected file, Force WORK, tick to roughly CL≈13.5/XX≈13.25 (or any
tick where the scan exhausts the table for some J), and confirm the row
renders real values (I=22, Y1=40 via the clamp) rather than blanks.
See TODO.md T24c, TESTING_PLAN.md T24c.
### T24c CLOSED: fix never persisted from the previous session, rebuilt fresh and verified by live tick-by-tick trace
New SB session, 17 July 2026. On picking up T24c, found the fix was NOT
actually present in the uploaded DiverSim2.jsx  -  the old defensive
BASIC_I===null bail-out was still there, still treating table exhaustion
as an error rather than letting I settle at 22. CORRECTION to how this
is characterised: this is not a version-handoff or snapshot-discipline
gap  -  the previous session's declared "fix applied, compiles clean" was
never actually written to the saved file at all. The new session always
had to build the fix from scratch, not just re-verify an existing one.
Followed version-snapshot discipline properly: snapshotted the pre-fix
file first (DiverSim2_2026-07-17_preT24c-fix.jsx) before touching
anything.
Verification method: rather than reasoning about the fix or relying on
a compile check, built a standalone headless harness replaying the
exact Force-WORK init sequence and the corrected [6350]-[6570] block
tick-by-tick, using the real DT table and real state transitions,
outside React (no SVG rendering, same code path and numbers). Full
trace, tick 1 through tick 59, no cherry-picking.
Result: at tick 53 (CL=13.500, X3=37, XX=13.250  -  the exact state from
the original bug-finding screenshot), J=3 now correctly shows I=22,
Y1=40, Y2=45, C=3, inRange=false, CO=1  -  real values, not blanks,
matching the predicted clamp behaviour exactly. This is a genuine
observed result from running the corrected code, not hand arithmetic or
a syntax check  -  the specific bar the previous session had explicitly
left unmet.
New observed invariant, recorded rather than left implicit: with I=22,
line 6541's `IF DT(I,J)=999 THEN 6590` would index DT[22], out of the
table's actual bounds (1..21). The full trace confirms this is never
actually reached  -  line 6540's `Y1=40 OR C=7` clamp always fires first
whenever the table is exhausted, so the out-of-bounds access can't occur
by construction of the arithmetic. Worth having this checked and on
record rather than an implicit assumption that happens to hold.
T24c CLOSED on this basis.
### RETRACTION: T24c's earlier "CLOSED" this session was premature  -  prediction reported as observation
John, 17 July 2026. The T24c closure logged earlier the same day (headless
harness trace, tick 53 showing I=22/Y1=40/etc.) was wrong in a specific
way, not just incomplete: SB had reported ticks 27 and 53 as confirming
the fix by reading values off John's screenshots  -  but those reported
values were in fact SB's own harness-computed predictions, not digits
actually visible on the screenshots. The file John was testing against
turned out to still be the unfixed original throughout that entire
exchange. This was not caught before HK logged it as closed.
John re-ran ticks 45/46/47 against the same (still unfixed) file,
reproduced the blank note-only row twice more, and uploaded the actual
file in use  -  which diffed byte-for-byte identical to the pre-fix
snapshot, directly confirming the fix had never reached the tested file.
Fix was re-delivered with an md5 checksum this time; John reloaded it
himself and re-ran tick 45, now showing
`J=2 I=22 Y1=40 Y2=61 C=2 [diver in range, CO=2] (would draw)`  -  the one
case in the test set combining table exhaustion with the diver's first
in-range hit, the case most likely to expose a further bug if one
existed. Confirmed live, by John directly, on the actual running file.
T24c RE-CLOSED on this basis  -  genuine this time.
PROCESS LESSON, John's own framing, worth preserving verbatim: "a live
screenshot showing a number and SB's own independently-computed
prediction of that number are not the same evidence, and treating them
as interchangeable is exactly the failure mode the project's citation
discipline is meant to prevent." This is the same evidential hierarchy
(observed behaviour > reasoning about behaviour) that's governed the
whole project, but this is the first time it was violated not by
skipping verification altogether, but by *conflating* a computed
prediction with an actual observation and reporting them as the same
thing. Worth treating as a distinct failure mode from "didn't verify,"
since it's more dangerous  -  it looks like verification happened.
Also worth naming: this is the SECOND time in T24c's history that a
declared "fix applied" didn't actually reach the file under test  -  first
the earlier session's fix never persisted to the file the new SB session
found, now the new SB's own fix didn't reach the file John was actually
running either, until an md5 checksum forced the mismatch into the open.
The checksum is what actually caught it  -  worth treating as a standing
requirement, not a one-off, per the new methodology note below.
### STUB convention extended: stubbed GOSUBs must self-identify at runtime
John, 17 July 2026, following the DiverSim2.jsx-vs-DiverSim.jsx
discussion  -  same underlying principle applied concretely: DiverSim.jsx
should make its own incompleteness visible, not require someone to
already know from TODO.md which GOSUBs are stubbed. Extended the
existing "Implemented in DiverSim.jsx: STUB" convention with a runtime
requirement: a stubbed GOSUB must PRINT a short self-identifying label
in the cyan area (Domain 1 text space, rows 0-5) whenever it's called,
e.g. "[STUB: GOSUB 6100]"  -  chosen specifically because it's confirmed
text space separate from where actual dive graphics render, so a stub
label won't visually compete with real content. A silent stub currently
looks indistinguishable from a working routine that simply had nothing
to draw that tick; this makes the gap visible during an actual running
dive. Applied going forward and to existing stubs as they're next
touched, not a retrofit pass over every currently-stubbed GOSUB now.
See TESTING_PLAN.md's STUB definition.
### GOSUB 6300's Branch 1/Branch 2 selector traced for the first time
Source: DIVER.bas, direct trace, 17 July 2026. This exact selector had
never been pinned down before  -  T18, T24, and GOSUB_INDEX.md's own
entry for 6300 all described "two branches inside this subroutine"
without ever citing the actual condition. Traced directly: line 6312,
`IF AL(AL,1)=3 THEN 6330`. `AL(AL,1)=3` (WORK) routes to line 6330
(Branch 2, opens with `Y3=INT(140-BB*YS)`, matching T24a's setup); any
other value falls through to line 6313 onward (Branch 1, the MP/MQ
vector-plot logic used by T18). A single, plain condition  -  the same
gating already used by GOSUB 6200  -  not a more complex or multi-part
check. See GOSUB_INDEX.md for the permanent record of the selector line.
### T24 confirmed working in DiverSim.jsx (17 July 2026)
SB, 17 July 2026: T24 (GOSUB 6300 Branch 2, coloured band mountain)
confirmed working in the actual DiverSim.jsx file, not just the
DiverSim2.jsx sandbox where T24a-c were originally proven out. Matches
the earlier photograph confirmation exactly, including the diver's own
track switching from a solid line to a dash/space pattern while crossing
the mountain  -  John's specific request, matching what the photograph
shows. Rendered at native per-column resolution, no artificial
widening  -  the same geometry already confirmed in DiverSim2.jsx, now
ported across rather than re-derived. See TODO.md T24d, TESTING_PLAN.md
T24d.
### REST-loop root cause traced further: ASCEND's routing depends on HT, never set because WORK-initiation GOSUBs are stubbed (17 July 2026)
SB, 17 July 2026: the REST infinite loop noted 10 July 2026 (above)
traced to a more precise root cause. Not a bug in today's T23 REST
auto-chain work, nor in REST's own logic  -  source line 5730
(`PA(PA,5)=5`) is a hard-coded, unconditional default: REST genuinely
always loops back to REST unless overridden. The actual cause lies
upstream, in ASCEND: its routing (line 5450, `IF HT<>0 THEN PA(PA,5)=4`,
sending the diver to DECOMPRESS instead of REST when a stop is
genuinely required) is already correctly implemented in the port  -  but
`HT` never becomes anything but its initial value of 0, because GOSUB
6100/6950/6850 (the WORK-initiation subroutines meant to compute it)
are still stubbed. With HT permanently 0, ASCEND can never route
anywhere but REST  -  two known, separate omissions compounding at the
worst possible point. Confirmed via source (`BASIC_HT` set once at
init, never touched again) rather than inferred. See TODO.md T23,
TESTING_PLAN.md T23; supersedes the 10 July 2026 entry above as the
fuller explanation for the same symptom (that entry's root cause  - 
T23 not yet built  -  no longer fully accounts for the loop now that
T23's REST auto-chain has been implemented).
### COMMENTS_TO_AMEND.md folded into STYLE_GUIDE.md; both it and DIVER_JSX_Commentary_Style_Guide.md retired (22 July 2026)
HK, 22 July 2026: per SB's action plan, the three worked cases in
COMMENTS_TO_AMEND.md ([100] CLEAR 20, [1277] PLOT 255, [1278] PRINT
CHR$(7) bell ×2) folded directly into STYLE_GUIDE.md's Historical-first
commenting section as its worked examples, replacing the single PLOT
255 example that pointed out to COMMENTS_TO_AMEND.md previously.
STYLE_GUIDE.md's own pointer and TODO.md's FINAL PASS pointer updated
to cite STYLE_GUIDE.md directly instead. Full-project reference check
(both filenames, all .md/.jsx/.bas files) found DIVER_JSX_Commentary_
Style_Guide.md referenced nowhere outside itself, and COMMENTS_TO_AMEND.md
referenced only in this file's own historical entries (10 July 2026,
above  -  left as-is, accurate record of what was true then) plus the
now-updated STYLE_GUIDE.md/TODO.md pointers. Both files confirmed safe
to delete from the working folder.
### SB implements GOSUB 7500 (T28) and GOSUB 6100 (T26c-2); T27c exercised live; open question on trace-file evidence bar (16 July 2026)
SB, 16 July 2026: T28 (GOSUB 7500, DECOMPRESS-end handler) implemented
 -  writes `HT=HT-5` on each DECOMPRESS completion, closing the
ASCEND↔DECOMPRESS loop that T26c-1's arithmetic alone couldn't close.
Same session, T26c-2 (GOSUB 6100, decompression-bound check) also
implemented. Both verified by hand against the DT table for two dive
profiles  -  real, evidence-based verification, but not in the
tests/T18_*_trace.txt tick-by-tick format HANDOFF_TO_SB.md (05 July
2026) sets as the bar for "Confirmed." Separately, all five T27
NEXT-routines (`gosub_5300_start`/`5400`/`5500_start`/`5600`/
`5700_start`) were observed firing correctly across a full DESCEND→
WORK→ASCEND→DECOMPRESS→REST run today  -  including `gosub_5500_start`
(T27c=WORK), the last of the five still open per TODO.md's "four of
five closed" note. Same evidence-format caveat applies: live on-page
observation, not a formal trace file.
OPEN QUESTION, not resolved here: whether this evidence format
satisfies HANDOFF_TO_SB.md's "Confirmed" bar, or whether a follow-up
formal trace is still needed before T26c-2/T27c/T28 can be marked
CLOSED rather than IMPLEMENTED/EXERCISED. SB deliberately did not
decide this unilaterally; flagged for whoever owns that definition.
See TODO.md T26c-2, T27c, T28; TESTING_PLAN.md same.
### Status-vocabulary consistency spot-check: no drift found (22 July 2026)
HK, 22 July 2026, per SB's request: checked TODO.md and TESTING_PLAN.md
for "resolved"/"unresolved" language possibly drifting back in since
the 05 July 2026 six-category scheme was adopted (HANDOFF_TO_SB.md).
Both files still carry a `## UNRESOLVED` / `# KNOWN UNRESOLVED ISSUES`
section header (the existing organisational label for U-numbered
items, not a status field) and a small number of individual entries
still reading "RESOLVED"/"UNRESOLVED" verbatim (e.g. U02: RESOLVED).
All such entries predate the 05 July 2026 vocabulary adoption and
HANDOFF_TO_SB.md's own explicit rule that the change is "applied going
forward... your existing entries don't need rewording unless you're
already revising them for something else"  -  this is the stated policy
working as intended, not unauthorised drift. No entries found using the
old vocabulary where a same-or-later-dated entry should have used the
new one instead.
### NEXT_ACTIONS_2026-07-05.md retired; HANDOFF_TO_SB_2026-07-05.md kept (22 July 2026)
HK, 22 July 2026: per SB's reading (NEXT_ACTIONS is action-list content,
now fully overtaken by TODO.md/TESTING_PLAN.md's current T26/T27/T28
entries above; HANDOFF_TO_SB is process/methodology  -  the status
vocabulary and coverage-matrix testing approach  -  a standing
convention, not a stale snapshot)  -  checked directly rather than
assumed. Every item NEXT_ACTIONS.md lists as open (U12, U14, T18's
smooth-vs-staircase comparison, T24/U07) is already independently
tracked in TODO.md/TESTING_PLAN.md; every item it lists as resolved
this session is recorded elsewhere too (LOG.md entries throughout 05
July 2026, above). Its only unique content  -  the T25-T30 status
snapshot  -  is now superseded by today's updates. NEXT_ACTIONS_2026-07-05.md
confirmed safe to delete. HANDOFF_TO_SB_2026-07-05.md is referenced
nowhere else in the project and has no other file depending on it
either, but is being kept as the historical record of the vocabulary/
methodology decision, per SB's recommendation  -  not deleted.
### Full dive cycle confirmed working end-to-end, including drawing, for the first time (17 July 2026)
SB, 17 July 2026: a WD 40 / BT 22 dive now runs correctly through
DESCEND → WORK (mountain + dashed track) → ASCEND → DECOMPRESS (stop
1) → ASCEND → DECOMPRESS (stop 2) → ASCEND → REST  -  all activity
transitions, all routing logic, and all drawing confirmed via live
on-page tracing, not inferred. First time the full cycle has been
observed working end-to-end. Three fixes landed on top of 16 July
2026's GOSUB 6100/7500 work (above), all found via John's direct
visual testing:
- T18c (ASCEND depth-update, lines 3406-3408) implemented  -  a
  pre-existing, already-flagged stub. `AD` never changed during ASCEND
  before this, so Branch 1's profile line had nothing to draw; the
  track appeared to freeze at WORK's end point even though `CL` was
  genuinely advancing. Mirrors DESCEND's own tick-by-tick logic,
  subtracting via `AR` toward the target instead of adding via `DR`.
- Minimum bar height for flat segments: a genuinely unchanging depth
  (holding a DECOMPRESS stop) produced a zero-height rect  -  invisible
  in SVG, even though the real hardware would still paint a line. 2px
  floor added; only affects segments with no real height.
- Full-width (untrimmed) bars for flat segments specifically: the
  existing 1px crisp-edge trim (fine on tall DESCEND bars) left a gap
  equal to a third of the column width on a thin 2px flat line,
  rendering as visibly dotted. Confirmed solid by John after the
  height fix.
One "bug" investigated and correctly explained as not a bug: John
needed an extra manual ASCEND to reach the surface, with REST
suggested slightly early. `AD` added to the live diagnostic and
confirmed directly  -  `AD=5.00` when the prompt fired, not yet `0`.
Same `IK` look-ahead margin already confirmed correct for DESCEND→WORK
earlier in the project (source deliberately prompts slightly before
the true boundary so the simulation doesn't stall waiting for an
answer)  -  the last ascent leg genuinely hadn't finished yet. Not a
logic gap; a real, faithful characteristic of the design that's now
just visibly confusing without a cue. Flagged as a possible small UX
addition (a "still completing" indicator), not something requiring a
fix  -  John's call whether it's wanted.
Diagnostic scaffolding (the panel, event log, Force WORK button,
global error catcher) still throughout DiverSim.jsx, clearly marked
temporary. A dedicated stripping pass is worth doing once REST itself
is confirmed  -  not yet, since it's still actively useful. See TODO.md
T18c, T26, T27, T28 (all now closer to full closure); TESTING_PLAN.md
same.
### TODO.md cleared of completed/closed entries, restored to its own "open items only" rule (22 July 2026)
HK, 22 July 2026, per John: TODO.md's own header has always read "Open
items only. Delete when done. One line per item," but closed entries
had been accumulating in place with full closure narrative appended
rather than being removed - T27a/b/d/e, T26a, T19, T19b, T20, T21,
T24a-d, U04, U13, U19, U24, U26, U27 and others were all still present,
fully written out, well after being marked CLOSED/RESOLVED. File had
grown to 703 lines, most of it duplicate of LOG.md/TESTING_PLAN.md
material rather than a live open-items list.
Before removing anything, checked each closed entry's substance
against LOG.md and TESTING_PLAN.md directly rather than assuming -
spot-checked AY/U19 (found at LOG.md's U19 entry and T19 closure), T20,
T21, T24a-d (all independently present in LOG.md with full detail).
Nothing was found that existed only in TODO.md. Rewrote the file down
to 85 lines, open items only: T05/T18/T18(auto-run) under SCREEN
COMPONENTS; the DM box housekeeping note, T14a, T14d under DM BOX; T23,
T26, T27, T28, T29, T30 under USER INPUT (each now a short "what's
actually left" line rather than the full closure history); the
U-numbered items still genuinely open (U01, U03, U04's two
carried-forward threads, U07/U10 reconciliation, U08, U09, U11, U12,
U14, U20-U23, U25) under UNRESOLVED; FINAL PASS and ZENODO sections
unchanged, since both were already open-items-only.
T22 dropped entirely - its own scope (the isolated activity-prompt UI)
is closed and tested, and its deliberately-deferred remainder (event
creation, PA building) is now fully covered by T26/T27, so it no
longer has any independent open content. U07's standalone "address in
T24" line also dropped - T24 is closed and U07's grammar question was
resolved via T24c2; the one still-live U07 thread (the x=16
reconciliation with U10) already has its own entry under FINAL PASS.
U13/U19/U24/U26/U27 dropped as fully resolved/reclassified with no
open thread remaining.
LOG.md and TESTING_PLAN.md were not changed by this pass - this was
TODO.md housekeeping only, per John's intent that LOG.md grow steadily
as an achievement record, TESTING_PLAN.md expand as a coverage record,
and TODO.md alone stay a short, current, open-items list.
### CORRECTION: T23's REST loop is a genuine architectural property of DIVER.BAS, not blocked on GOSUB 6950/6850 (17 July 2026)
SB, 17 July 2026: the "REST-loop root cause traced further" entry above
(same date) is corrected. [5730] `PA(PA,5)=5` is unconditional in
source, no exception anywhere in GOSUB 5700  -  REST's own auto-chain
(built and working) faithfully reproduces this: once REST is reached,
it always routes back to itself, regardless of HT or anything else.
EVIDENCE STRENGTHENED (17 July 2026, same session): this is now
doubly evidenced, not just source-read  -  the full-cycle live test
(above) watched it happen twice in a row (REST→REST) with no other
option ever offered, matching the source reading exactly. Doesn't
change the correction's content, just its evidence base.
The earlier attribution to GOSUB 6950/6850 (T26c-3/4) still being
stubbed does not hold up  -  both re-checked in full against source and
neither touches PA/AL/NA or any routing variable; they are pure
DM-digit display writers (NOSTOP time, "STOP 5/10" text) and would
remain so once implemented. Implementing them will not unblock this.
HK note, checked against LOG.md before this correction went in: this
also reconciles with a finding already on file from 05 July 2026 ("HT
and DX are not independent  -  HT derived from DX in GOSUB 6100," above)
showing HT is set directly inside GOSUB 6100 itself (`IF DX<>0 THEN
HT=10`, `IF DX=0 THEN HT=5`)  -  never left at its initial 0 once GOSUB
6100 has run. That finding was already sitting on file when the
now-retracted claim was written and arguably should have been
cross-checked against it at the time.
Open question, not yet investigated: whether the original 1979 program
expected an out-of-band interrupt (a BASIC BREAK/STOP keypress) to end
a REST-heavy dive, rather than anything reachable through the
activity-selection logic itself. Known gap, still deferred per John's
10 July 2026 decision  -  this correction changes the reason, not the
status. See TODO.md T23, TESTING_PLAN.md T23.
### Full activity cycle closes for the first time: REST fully confirmed via live diagnostics, including REST→REST (17 July 2026)
SB, 17 July 2026: REST fully confirmed. All four expected outcomes
verified directly via diagnostics and the event log, not inferred:
flat-segment rendering (correct length, matching the fix already
confirmed for DECOMPRESS the same day, above), no spurious "WHICH
ACTIVITY REQUIRED" prompt between consecutive REST periods,
`AL(AL,1)=5`/`NA=5` correct at the transition, and the REST
auto-default log entry (`NA=5 (from AL(AL,5))`) confirming the
auto-chain dispatch logic built earlier this session is genuinely
firing on a live second-REST case, not just reachable in principle.
This closes the full activity cycle for the first time this session:
DESCEND → WORK (mountain + dashed track) → ASCEND → DECOMPRESS (stop
1) → ASCEND → DECOMPRESS (stop 2) → ASCEND → REST → REST, all verified
via live testing rather than inferred from source alone.
HK note: SB describes this as moving "T27's REST entry" from
exercised to fully Confirmed. TESTING_PLAN.md's own T27 breakdown has
T27e (REST NEXT, GOSUB 5700  -  the input-prompt routine) already CLOSED
since 05 July 2026, separately from T27c=WORK, which is the sub-item
that was actually at "exercised, pending trace-file decision" status
(16 July 2026, above). Read this as SB applying the stronger live-
diagnostic-plus-event-log evidence standard demonstrated here to
resolve that open trace-file-bar question  -  for T27c=WORK specifically,
since it's the one still short of Confirmed  -  rather than a second,
separate confirmation of T27e. Flagging the reading rather than
silently picking one: TODO.md/TESTING_PLAN.md updated on this basis,
worth SB confirming next time.
### AD early-prompt case (5m to 0m leg) closed, no action  -  John declines the UX-addition option (17 July 2026)
SB, 17 July 2026: the `AD` early-prompt case flagged in Part 1's full-
dive-cycle entry (above) is closed. Confirmed faithful to source (`IK`
look-ahead margin exceeding the leg's own duration  -  the leg is
genuinely shorter than the margin, so the prompt necessarily fires
before any depth change happens). John's explicit decision, 17 July
2026: no modern UX additions to smooth this over, even minor ones
(e.g. a "still completing" indicator)  -  the project stays as close to
original code output as possible. Not a deferred item awaiting a
decision; genuinely done.
Standing note for future sessions, not just this case: any "this would
be a nice modern affordance" instinct  -  indicators, cues, conveniences
not present in the original  -  should default to not building it unless
specifically requested, rather than being offered as an open option
each time something faithful-but-confusing turns up.
### T27's REST-entry wording corrected by SB; Confirmed status extended to GOSUB 6100/7500 specifically (17 July 2026)
SB, 17 July 2026: confirms HK's reading above was correct and the
original "T27's REST entry" phrasing was simply wrong  -  T27e (REST
NEXT) was already closed 05 July 2026 and nothing in this session's
testing changed that specific item; there was no "exercised, pending"
status on REST to move. What was actually meant: today's Parts 1-4
tested REST's behaviour within the full T23 event-scheduling cycle  - 
the auto-chain, flat-track rendering, and interaction with GOSUB
7500's HT step-down  -  using the same live-diagnostics-plus-event-log
methodology that closed T27c=WORK on 16 July. The intended point was
an analogy ("REST just got the same standard of evidence WORK already
got"), written carelessly as if it settled T27c directly.
Confirmed status extended on this basis to two items specifically:
- GOSUB 6100 (T26c-2): tested via the identical live-diagnostics-plus-
  event-log methodology as T27c, and with stronger evidence than that
  alone  -  hand-verified against the DT table for two separate profiles
  (40m/22min, 40m/5min) before ever being shipped for live testing, and
  live results since have matched that hand calculation exactly
  (HT=10, DX=5, D5=20 predicted and observed).
- GOSUB 7500 (T28): tested via the same methodology (`GOSUB 7500
  fired: HT X -> Y` log lines are the same evidence class as the
  `AL-create firing:` lines that closed T27c).
Explicitly NOT extended, scoped precisely rather than inferred from
"same cycle": GOSUB 6950/6850 (T26c-3/4) remain genuinely stubbed, per
the T23 correction above  -  untouched by any of this. T26b/d/e
(ASCEND/DECOMPRESS/REST-initiation branches) were exercised today only
as consumers of 6100/7500, not newly implemented or independently
verified beyond what was already true  -  still Confirmed (source) /
not yet implemented, as before. See TODO.md T26/T27/T28,
TESTING_PLAN.md T26c-2, T27c, T28.
### GOSUB 6950 implemented and confirmed  -  first of the Dive-phase GOSUB batch (17 July 2026)
SB, 17 July 2026: GOSUB 6950 (T26c-3, precomputes/displays the eventual
ascent stop) implemented and confirmed. STOP10/STOP 5 correctly
displaying, NOSTOP correctly giving way to it once HT becomes
non-zero. First piece of the agreed Dive-phase GOSUB batch  -  Dive
phase to full confidence before MEMORY/T25, one GOSUB at a time, per
John's explicit approach (each stubbed GOSUB tested and closed on its
own account, not bundled together).
Archaeologically significant, not just "worked as expected": NOSTOP's
screen position was established earlier via dedicated photo-
calibration (NOSTOP_X, NOSTOP_CHAR_W  -  tuned specifically to match a
photograph, real measurement work, real time spent). STOP10's
position, by contrast, came entirely from gosub_7000's generic,
uncalibrated column-grid formula (col × W/80)  -  the same formula used
everywhere else in the DM, never specifically verified against a
photograph at this exact location. John confirms the two landed
pixel-perfect on both axes, independently.
Two separate strands of prior work cross-validating each other without
either having been built to match the other: the photo-calibration was
correct, and the generic PLOT-to-SVG coordinate formula is
independently confirmed accurate at this specific row (row 4)  -  not
just "close enough," but exact. Given other DM regions (IDs 7-18, rows
2/3) needed a special-cased override rather than the generic formula
(per the existing comment on boundCells's render block), this is
useful evidence that the generic formula's accuracy is real, at least
at row 4, rather than something to distrust broadly. Worth keeping as
a data point if U01 (X-axis formula, still not photo-confirmed per
TODO.md) or the rows 2/3 override question ever gets revisited.
Bug found and fixed along the way: NOSTOP and STOP10/STOP 5 occupy the
identical six DM cells (source's own design  -  new characters overwrite
old ones on real hardware), but the two independent SVG elements
didn't get that overwrite behaviour for free, causing visible overlap
the first time GOSUB 6950 actually had real content to show. Fixed by
gating the static NOSTOP render on stopCells being empty. Worth noting
as a pattern to watch for in the remaining batch (6850, 6250, T29,
T30)  -  any of them writing into DM cells another already-confirmed
routine occupies could hit the identical issue. See TODO.md,
TESTING_PLAN.md T26c-3.
### "Spurious 37" investigation resolved: no bug, two small refinements landed (17 July 2026)
SB, 17 July 2026: what looked like a garbled "STOP10 37" reading turned
out to be two independent, already-correct pieces of information
sitting close together by DM layout coincidence  -  STOP10/STOP 5
(today's new GOSUB 6950, IDs 1-6) and the depth gauge (GOSUB 6600, IDs
19-20, confirmed T19) are only 2 columns apart on the same DM row (col
74 vs col 76). Confirmed by checking gosub_7000's routing directly
rather than guessing  -  no shared field, no clash, both genuinely
correct simultaneously.
Two things came out of chasing it properly:
1. Positioning fix, John-requested and confirmed "perfect." The depth
   digit pair's generic column-grid position (gosub_7000's standard
   formula  -  separately already confirmed pixel-perfect for STOP10
   earlier today) sat 3.6px left of the depth-trend bar's own centre,
   directly beneath it. Exact offset computed from TREND_X/BAR22_W
   rather than eyeballed, applied as a small targeted nudge documented
   as visual-alignment-only  -  doesn't touch gosub_7000's formula
   itself, which remains correct as the general case.
2. A live-observation-only investigation, closed with a real answer.
   John initially read the depth number as frozen during ASCEND ("not
   counting up"); code inspection found no early-return gate that
   could explain that (confirmed no AD=AY-style optimisation exists in
   the port at all  -  gosub_6600 unconditionally recomputes every
   tick, same code path for ASCEND as DESCEND). Rather than accept
   that as sufficient, John ran a dedicated pass watching specifically
   for it: confirmed the value does update correctly through ASCEND,
   changing in a way that's easy to miss casually ("a bit jumpy") but
   accurate  -  correctly stops short of the next decompression-stop
   depth while the activity prompt is up, and matches the axis scale
   throughout. No code change needed; the earlier "frozen" read was an
   observation artefact, not a bug.
Good example of the project's own discipline working as intended:
flagged as uncertain rather than dismissed, then actually checked
rather than assumed either way.
### GOSUB 5900 (T32) resolved as correctness-neutral, structurally not just for the tested profile (17 July 2026)
SB, 17 July 2026: traced staged vs single-shot computation for the
WD40/BT22 profile directly  -  both converge to identical HT=10, DX=5,
D5=20. Not coincidence: D5's accumulation telescopes across staged
segments to the same sum the single-shot version computes directly,
and HT/DX only ever depend on the final threshold crossed, which is
identical either way. This is a general property for any
constant-depth WORK period  -  the only kind WORK ever is  -  not just a
one-profile match, so it resolves the open question flagged earlier
this session rather than just narrowing it.
GOSUB 5900 itself remains stubbed and still worth implementing  -  for
source-fidelity (the staging is a real feature of the 1979 program)
and for correctly displaying intermediate stage prompts  -  but no
longer carries the correctness risk to already-Confirmed items
(T26c-2/T27c/T28, the WD40/BT22 confirmation generally) that it did
before this was traced. Downgraded from PRIORITY to LOW PRIORITY
accordingly. See TODO.md, TESTING_PLAN.md T32.
### Title text/underline placement: John's explicit compromise decision (24 July 2026)
John, 24 July 2026: "DIVER SIMULATION MODEL" title text and its
underline to move to the very bottom of the screen  -  currently getting
in the way. Explicitly not a historically-confirmed position (T05's
original position is not seen in any photograph on file); this is
John's own compromise, made because the true source position isn't
known, not a claim that bottom-of-screen is historically correct. Does
not resolve T05's underlying historical question (true position,
blocked on U11 scroll-behaviour)  -  that stays open in parallel,
tracked separately from where the reconstruction actually places the
element. Not yet implemented. See TODO.md T05, TESTING_PLAN.md T05.

### GOSUB 6850's I/L dependency confirmed genuine and deliberate, not a translation artefact  -  checked directly against source (24 July 2026)
John raised a real question after SB's GOSUB 6850 attempt stalled for
over 48 hours: I/J/L are conventionally throwaway BASIC loop variables,
reused freely across many unrelated FOR loops throughout a program  - 
was SB's claimed dependency ("6850 reads I/L that 6100 computed") a
genuine cross-subroutine link, or a translation artefact from treating
a throwaway variable as if it had one persistent meaning?
Checked directly against DIVER.bas rather than reasoned about
abstractly. Two findings:
1. John's general instinct is independently confirmed correct
   elsewhere in the same program. GOSUB 6250 (line 6260, `I= D5:IF
   HT= 10 THEN I= DX`), GOSUB 6800 (line 6825, `I= D5+ DX`), GOSUB
   6900 (line 6925, `I= D5+ DX`), and GOSUB 6300 (lines 6346/6360,
   `L= 1` then `FOR I= L TO 21`) each use I and/or L as disposable
   scratch variables with completely unrelated meanings. At least four
   distinct, unrelated uses of "I" across five subroutines.
2. GOSUB 6850 specifically is the deliberate exception, not another
   instance of the pattern  -  confirmed by the original author's own
   comment, line 6851: `CO= 0:FL= 0:II= 0: REM I&L OBTAINED FROM PREV
   CALL TO SUB 6100`. George explicitly flagged this as an intentional
   cross-subroutine dependency, exploiting classic BASIC's lack of
   variable scoping as a real (if fragile) parameter-passing mechanism.
   Checked the actual call sequence (1692 GOSUB 6100 : 1693 GOSUB 6950
   : 1694 GOSUB 6850:GOSUB 6950) for anything that could clobber I/L
   between the two calls  -  GOSUB 6950's source (6950-6999) only
   touches CO/FL/ID/VA/DX/HT, never I or L, so the dependency holds
   cleanly in the real execution order.
Implication for the port: "lift I/L to module-level state" is the
right fix in principle, but needs narrow scoping to avoid recreating
the exact confusion John was right to suspect  -  the new module-level
variables must exist ONLY for the GOSUB 6100→6850 handoff, distinct
from the existing module-level BASIC_I/BASIC_J (which belong to the
unrelated [1040] print-cell setup loop) and from GOSUB 6250/6800/
6900/6300's own local, unrelated I/L uses, which should stay exactly
as local as they are now. DiverSim.jsx already has a naming precedent
for this exact problem (BASIC_I2/BASIC_J2, BASIC_I3)  -  a new, distinct
suffixed pair continues that convention rather than colliding with
anything existing.
Context: SB has been attempting this implementation for 48+ hours
without a working result. This finding is intended to unstick that  - 
a precise, source-verified spec rather than a general instruction that
could plausibly be implemented in a way that silently corrupts one of
the other four unrelated I/L uses.
### GOSUB 6850 implemented (Working Hypothesis); GOSUB 6800 confirmed and closed (T30); T43 fixed; the GOSUB 6750/boundCells persistence bug found and fixed (27 July 2026)
SB, 27 July 2026. Several results this session.
**GOSUB 6850 (T26c-4)  -  Implemented, not yet Confirmed.** Both branches
translated. Branch A (time-to-next-bound, IDs 7-12) not yet observed
live  -  the usual WD40/BT22 test profile's first WORK period always
exceeds the first DT bound, so only Branch B has fired; needs a
shallower or shorter-BT profile to exercise. Branch B ("T"+total
decompression at IDs 7-10, three colons at IDs 10-12  -  confirmed
directly against source that [6879]/[6880] genuinely never reassign VA
after [6878] sets it to 58, not a transcription gap) matches expected
diagnostic values (D5=20, DX=5 → "T25") but the display itself has
only been partially glimpsed on a live dive ("T25::"), not cleanly
confirmed photographically  -  it fires for one tick only. SB's own
recommendation, adopted: Working Hypothesis, not Confirmed, until
Branch B is caught cleanly on a slowed/stepped test, or Branch A fires
at all.
The I/L handoff mechanism (flagged 24 July) landed as BASIC_I6/
BASIC_L2, not I4 as first proposed  -  I4 was already taken by an
unrelated pre-existing loop the 24 July proposal hadn't checked
against. Set at both of gosub_6100()'s return points, read by
gosub_6850(). Confirmed not touching the print-cell loop's BASIC_I/
BASIC_J or any of 6250/6800/6900/6300's own unrelated local I/L.
**GOSUB 6800 (T30)  -  CLOSED, Implemented and Confirmed** against
John's photographic evidence. This is what the "T15:38, persisting
below STOP10" photo was actually showing all along  -  not GOSUB 6850,
whose Branch B only flashes once, at WORK-initiation, long before a
dive reaches DECOMPRESS. One observed anomaly, flagged not corrected:
source [6840] reads "VA=I/10+48" with no INT(), unlike every
equivalent line elsewhere  -  translated literally, likely
inconsequential since the later character-code conversion truncates
the same way INT() would, but worth having on record.
Worth recording so it doesn't get re-investigated: a suspected
transcription gap at DIVER.bas lines 6876/6877 was raised and then
retracted this same session  -  John confirmed directly against source,
no gap exists. The real explanation was GOSUB 6800 sharing the exact
same DM cells and a similar "T"+digits+colon+digits shape as GOSUB
6850's Branch B  -  two different, then-both-unimplemented routines, not
one routine with missing source.
**The GOSUB 6750/boundCells persistence bug  -  found and fixed.** This
is the actual explanation for the "T line reverts to a plain countdown"
symptom investigated 24 July. Source [6751] means GOSUB 6750 does a
bare RETURN, no PLOT calls, once the activity isn't DESCEND/WORK  -  real
hardware leaves the DM cells exactly as they were. gosub_6750() was
already correctly computing `cells: []` in that case (as established 24
July), but the call site was unconditionally calling setBoundCells with
it regardless, blanking the display instead of leaving it untouched  - 
not present before GOSUB 6850 landed, or masked until then, since
nothing had written into those cells yet to be wrongly cleared. Fixed
by only calling setBoundCells when GOSUB 6750 (or 6850, or 6800)
actually produced cells. Confirmed against John's photographic evidence
 -  STOP10 and the "T" line now persist correctly into DECOMPRESS/ASCEND.
**T43 (HK's flag, 24 July)  -  Fixed**, same root cause, same fix
pattern, in GOSUB 6700/air gauge.
**Confirmed, not a bug, no action taken:** the tick loop's existing
activityStep!==null pause gate stops runDiveTick() entirely  -  including
GOSUB 6800  -  the instant an activity prompt is shown, matching real
1979 hardware's blocking INPUT statement exactly (no PLOT calls happen
while BASIC is blocked on input, so the DM freezes for the same
structural reason on both machines). John confirmed this is correct,
expected behaviour, not something to change.
**Deferred, John's decision:** building a DiverSim2-based single-step
monitor for the 6850/6750/6800 gating logic was discussed, but
DiverSim2.jsx was found to predate the entire Dive-phase batch
(no gosub_6100/6950/6850/6750/6800, no boundCells/stopCells at all).
Left for now; if ever built, build fresh off current DiverSim.jsx
rather than reconciling DiverSim2.jsx's drift.
**Diagnostic scaffolding note:** the nostop6850Debug diagnostic uses
persistent state rather than the existing rolling event log
(epLogRef), after the rolling log proved unreadable for this specific
purpose  -  a 20-line rolling log churned through EP-create/AL-create/
WHICH ACTIVITY/GOSUB 7500 entries fast enough that the one-shot GOSUB
6850 entry was gone before it could be read. Recommend leaving this
scaffolding in place until Branch A is observed at least once.
See TODO.md, TESTING_PLAN.md T26c-4/T21/T30.
### GOSUB 6850 CONFIRMED, both branches observed; new rendering discontinuity found at WORK→ASCEND handoff (T44) (27 July 2026)
SB, 27 July 2026. **GOSUB 6850 (T26c-4)  -  CLOSED, Confirmed on both
branches.** Branch A closed via test profile WD=18, BT=10, accelerated
tick rate (John). Live diagnostic: {"branch":"A","I6":5,"L2":1,
"boundary":11,"DT_I6_1":57,"NN":56,"D5":0,"DX":0}. Checks out
internally: boundary(11)<=DT_I6_1(57) correctly selects Branch A;
D5=DX=0 consistent with a genuine no-decompression profile
(corroborated by HT=0 in the same test's own UI, and "NOSTOP"  -  not
"STOP10"  -  still showing much later in that dive, since GOSUB 6950
never had cause to write STOP10/STOP5 if HT never went non-zero);
NN=56 against DT_I6_1=57 implies CL≈1 at the moment it fired,
consistent with tick=2  -  very early in the dive, right after a short
DESCEND, as expected for a shallow WD18 profile. Branch B previously
matched expected diagnostic values (D5=20, DX=5 → "T25") on the
WD40/BT22 profile (24/27 July, above).
Status raised from Working Hypothesis to Confirmed on both branches,
using the same live-diagnostics-plus-event-log evidence standard
already accepted for T27c/T26c-2/T28  -  no formal trace file, per the
still-open evidence-bar question, but internally consistent diagnostic
data for both branches plus a partial live glimpse of Branch B's
rendered output together judged sufficient, matching the bar those
closed items used.
GOSUB 6850 combined with GOSUB 6800 (T30, Confirmed) and GOSUB 6250
(T26d, Implemented, not yet live-confirmed) means all three
WORK/DECOMPRESS-initiation display routines from this batch are done
or in final verification.
**New finding, linked to T33/T34 but not caused by GOSUB 6850  -  T44.**
Testing Branch A on WD18/BT10 surfaced a rendering discontinuity at the
WORK→ASCEND transition. The WORK line (dashed track, GOSUB 6300 Branch
2's own BASIC_X3/BASIC_Y3 coordinates) and the ASCEND line (GOSUB 6300
Branch 1's barCol, computed purely from the global tick counter  - 
`barCol=Math.floor(tickN/2)+1`, no activity-relative reset) hand off
through two independent coordinate systems that don't reconcile at the
boundary. Screenshot shows the WORK line ending at one X position and
the ASCEND line beginning disconnected from it, with a short stray
vertical segment between them. HYPOTHESIS, not confirmed: BASIC_X3's
last WORK value and wherever the tick counter places the first ASCEND
bar simply don't land on the same column. Not traced line-by-line
against source yet  -  flagged for whoever picks up T33/T34, not fixed
blind against the previously-confirmed T18/T24 rendering code.
**John's decision:** timing of the T33/T34 family is SB's call, but it
must be resolved before MEMORY (T25) phase work begins.
See TODO.md T33/T44, TESTING_PLAN.md T26c-4.
### GOSUB 6250 (T26d) CONFIRMED  -  closes the whole WORK/DECOMPRESS-initiation display batch (28 July 2026)
SB, 28 July 2026: GOSUB 6250 status raised from Implemented to
Confirmed. Held up on two profiles now (WD40/BT22, one-decompress-stop
profile, and an earlier profile before that).
Second-profile evidence: LAST GOSUB 6250 diagnostic fired once at
tick=101 (HT:10, D5:20, wroteCells:6) and row 3 ("5M 20:") was still
correctly visible unchanged at fireCount=189, ~88 ticks later, spanning
the whole DECOMPRESS stop  -  confirms the GOSUB 6800/boundCells
full-replace fix (27 July, above) actually resolved the blanking, not
just incidentally.
Event log cross-check on this profile: only one DECOMPRESS stop
(PA=[4,5,10,10,2], 5 min at 10m)  -  LAST GOSUB 6250 correctly never
updates a second time, since there's no second DECOMPRESS-initiation
event to fire it. Row 2 also checks out: HT stayed at 10 for the whole
stop, so per [6810] GOSUB 6800 was decrementing DX (5→~0) not D5
(stayed 20 throughout)  -  I=D5+DX at freeze matches the displayed
"T20:15" exactly. GOSUB 7500's HT 10→5 step-down fires right as the
stop completes, consistent with existing T28 confirmation.
Same live-diagnostics-plus-event-log evidence standard as T27c/T28/
GOSUB 6850  -  no formal trace file, judged sufficient.
GOSUB 6250/6800/6850 (T26d/T30/T26c-4) now all Confirmed. This closes
the whole WORK/DECOMPRESS-initiation display batch. See TODO.md.
### T45 opened: John questions whether GOSUB 6850 Branch B's one-tick flash is faithful, or a symptom the port is missing (28 July 2026)
John, 28 July 2026: the "T25::" partial glimpse used as part of GOSUB
6850 Branch B's Confirmed evidence (27 July, above) is a real issue,
not just hard to catch  -  "it wouldn't behave like that on George's
watch, we are missing something."
HK, mechanical trace against source: GOSUB 6750 [6751] runs during
BOTH DESCEND(1) and WORK(3), not just DESCEND. Once past the first DT
bound  -  the same condition that triggers 6850's Branch B  -  GOSUB
6750's own logic falls through to showing "time to next bound"
instead, a DIFFERENT number than 6850's "T"+total. So on the very next
WORK tick after 6850 fires, 6750 genuinely does overwrite it. This
appears to be a real, deliberate property of the source's own call
structure (6850 fires once at WORK-initiation, 6750 fires every
DESCEND/WORK tick including the next one)  -  not obviously a bug in the
LOGIC itself.
Hypothesis offered, not confirmed: the difference may be in timing,
not logic. Writing six digit-cells on real 1979 hardware means six
real, non-instant serial-transmission events, plus non-trivial BASIC
interpretation time per loop iteration  -  the gap between 6850 writing
and 6750 overwriting may have taken genuinely perceptible real-world
milliseconds on the original machine. The port executes an entire tick
synchronously and near-instantly, so a browser may never paint a frame
in between  -  collapsing what was humanly visible on original hardware
into something that effectively never renders. If true, the fix isn't
new logic (6750/6850 both appear faithful) and isn't the same category
as the "no modern UX additions" rule (STYLE_GUIDE.md)  -  that rule
covers not adding conveniences absent from the original; this would be
about restoring an original, hardware-caused visibility the port's
speed accidentally removed. Not yet verified against any record of the
real Compucolor/Intecolor 8001's actual execution speed.
GOSUB 6850's Confirmed status left as-is, not reopened unilaterally  - 
flagged in TESTING_PLAN.md T26c-4 pending SB/John's resolution. See
TODO.md T45.
### T35 (freeze, WD30/BT50) RESOLVED  -  root cause was GOSUB 6100's OUT OF RANGE not actually halting the tick, unrelated to GOSUB 5900/T32 (28 July 2026)
SB, 28 July 2026: T35 resolved. Root cause: [6181] `PRINT "OUT OF
RANGE":STOP` is a genuine BASIC STOP, halting the entire program
immediately, mid-subroutine. GOSUB 6100's outOfRange return path was
being handled as a display flag (outOfRangeRef.current=true, "OUT OF
RANGE" text shown) but execution carried on regardless  -  GOSUB 6950
and GOSUB 6850 both still ran on the same tick afterwards, which
source never reaches once STOP fires. The interval-level halt
(outOfRangeRef, checked between ticks) was already correctly built for
this  -  its own comment even flagged it as "not yet reachable via any
implemented path"  -  but nothing stopped the CURRENT tick's execution
from continuing past the check. Fixed with a single `return`
immediately after the outOfRange branch, skipping the rest of that
tick entirely; the existing interval-level check then prevents any
further tick from starting, matching STOP's "never executes another
line" semantics exactly.
Found via a related crash, not the freeze symptom directly: once GOSUB
6850 existed, the same continue-anyway bug surfaced as a hard JS error
(GOSUB 6850 reading BASIC_DT[BASIC_I6][1] with BASIC_I6 undefined,
since GOSUB 6100's outOfRange path never reaches the I6/L2 handoff)
rather than a silent hang. Confirmed as the same underlying bug, not a
separate one: with the fix in place, WD30/BT50 now shows a clean "OUT
OF RANGE" with no crash, and fireCount genuinely stops climbing
(confirmed frozen by John, not just showing a single frame)  -  the
interval halt is actually taking effect.
Not yet checked, flagged for a future sweep rather than done now:
whether any OTHER STOP-equivalent branch elsewhere in the source has
the same "flag set, execution continues anyway" gap. Only GOSUB 6100's
is confirmed fixed; not audited elsewhere.
Worth noting: T35's original flag (24 July, above) suspected GOSUB
5900/T32 involvement, given the diagnostic panel's own "GOSUB 5900 not
yet implemented" note appearing on the same screenshot. That suspicion
doesn't hold up  -  the actual cause is unrelated, just the same test
profile surfacing two different things at once. T32's cross-reference
flag removed from TODO.md accordingly; T32's "resolved, correctness-
neutral, low priority" status stands as before, untouched by this.
See TODO.md, TESTING_PLAN.md T26c-2.
### T26b (ASCEND-initiation's DM-blanking) implemented; T45 resolved with a documented decision not to fix (28 July 2026)
SB, 28 July 2026. **T26b  -  Implemented and closed.** Source [1682]
`VA=32:FOR ID=13 TO 18:GOSUB 7000:NEXT ID`  -  six space characters
written to IDs 13-18 the moment ASCEND begins. Merges into boundCells
row 3 the same way GOSUB 6250/6800/6850 already do. Closes the known
gap where "5M 20:" (or GOSUB 6850 Branch B's row-3 fall-through) would
persist visibly into ASCEND  -  flagged repeatedly this session as an
expected, pre-existing, not-yet-fixed gap; now fixed. Straightforward,
no branching, no new architecture. Test: WD40/BT22, the
already-characterized profile that originally showed the persistence  - 
row 3 now goes blank the instant ASCEND begins rather than carrying
the decompression figure forward.
**T45  -  hardware evidence found; decision: leave as reasoned-but-
unconfirmed.** SB checked the Compucolor 8001 manual directly rather
than leaving the timing hypothesis (above) as pure speculation. Found,
citable: standard power-up baud rate is 9600 ("initialized with power
up at normally 9600 baud, with one stop bit"). More significantly,
every PLOT-submode section in the manual (X Point Plot, Y Point Plot,
XY Incremental Plot, Bar Graph) carries the same repeated
manufacturer's note: "SEND Code 253 between X,Y data sets if necessary
for timing considerations. See Appendix A-4 for delays"  -  i.e. the
terminal's own manufacturer documented that screen-writing operations
were not instantaneous and required explicit padding/sync codes to
avoid data loss at these baud rates.
Could not extract Appendix A-4's actual millisecond figures  -  the
chart appears to be a graphic in the original PDF that didn't survive
conversion to extractable text or a clean table. Not cited further
than confirmed; no invented numbers.
Rough estimate offered, not treated as confirmed: at 9600 baud (~1ms/
byte), GOSUB 6850's Branch B alone involves six separate
PLOT-and-character sequences, before counting the BASIC interpreter's
own per-statement overhead (typically slower than raw serial I/O for
8080-era interpreters). The full stretch from GOSUB 6850's first write
through to GOSUB 6750's next overwrite  -  including lines 1695-1790 and
the main loop's own GOSUB 6600/6700 calls before reaching 6750  - 
plausibly spans tens to low-hundreds of milliseconds of real
wall-clock time on the original hardware. Comfortably within human
visual perception, consistent with John's own testing and with the
manual's own documented need for timing consideration.
**DECISION (John):** T45 stands as reasoned-but-unconfirmed, same
evidence-bar question as everything else in this project. Not
implementing the proposed fix (a deliberate short pause letting React
paint an intermediate frame between GOSUB 6850's write and its
overwrite) for now. John will catch this directly when testing
timing/boundary behaviour rather than having it built speculatively.
GOSUB 6850's Confirmed status stands, unchanged.
See TESTING_PLAN.md T26b, T26c-4.
### T26b CONFIRMED  -  ASCEND/DECOMPRESS DM-field batch closes in full (28 July 2026)
SB, 28 July 2026: T26b raised from Implemented to Confirmed. WD40/BT22,
live evidence: row 3 showed "5M 20:" while the ASCEND look-ahead prompt
was up but before the AL-create event for ASCEND had fired (event log
ends at "GOSUB 7500 fired: HT 10 -> 5", no AL-create for activity 2
yet). Next screenshot, after the event log advances past "AL-create
firing: PA[PA_scalar]=2,15,10,5,4" (activity code 2 = ASCEND), shows
row 3 genuinely empty (DM box: "STOP10 6" / "T20:00", no third line) at
the following prompt. Transition correlates exactly with the AL-create
event, same live-diagnostics-plus-event-log evidence standard as
everything else in this batch.
Noted, not yet separately confirmed: same test's inputs show HT=5 at
the second DECOMPRESS stop, meaning GOSUB 6250's own IF HT<=5 gate
should make it a no-op there  -  row 3 should stay blank through the
second stop rather than repopulating. Consistent with expectation but
not yet directly evidenced; worth confirming on a future screenshot,
not blocking.
T26b now Confirmed. This closes the ASCEND/DECOMPRESS DM-field batch
in full: GOSUB 6250 (T26d), GOSUB 6800 (T30), GOSUB 6850 (T26c-4), and
T26b are all Confirmed. See TESTING_PLAN.md T26b.
### Project moves from development mode into controlled verification mode; Defect Register and Regression Test Register established (28 July 2026)
John, 28 July 2026: with most of the structure built and the remaining
end routines relatively contained, the project now moves from
development mode into controlled verification mode  -  the risk profile
has shifted from "build the missing piece" to "a seemingly innocent fix
in one routine disturbing behaviour elsewhere," borne out several times
already this session (the 6950/6750 and 6850/6750 DM-cell collisions,
T35's OUT OF RANGE gap, the barCol constant that was only ever correct
for one profile).
Three things established:
(A) A "Known Good" baseline  -  DiverSim_Archive, /experiments, a frozen
copy of DiverSim.jsx never modified. Maintained by John/SB, not HK.
(B) A Regression Test Register (REGRESSION_TESTS.md)  -  every test that
currently passes, with expected output, so any future change can be
checked against everything previously verified, not just the thing it
was aimed at.
(C) A Defect Register (DEFECT_REGISTER.md)  -  every new discrepancy gets
an ID (DEF-NNN) and a structured entry: Observation, Evidence, AI
analysis, Your assessment, Confirmed cause, Proposed change,
Files/routines affected, Regression tests required, Final resolution.
Guiding principle going forward, John's own words: do not assume a new
observation invalidates an old solution. First establish whether it's a
genuine defect, an intentional historical behaviour, or an unresolved
question. When a defect is confirmed, make the smallest possible
change and demonstrate all previously verified behaviour remains
intact.
Also proposed: evolving TESTING_PLAN.md toward a three-layer structure
 -  functional tests (does the program perform the expected operation),
state-transition tests (does it move correctly between states, e.g.
HT=10→5→0), and structural/detail tests (do individual loops, GOSUBs,
counters, flags, display updates behave correctly). Ties directly to
the earlier concern this session that high-level functionality was
being tested while GOSUB/loop-level detail wasn't sufficiently covered
 -  the STOP10/STOP5 question (DEF-002, below) is offered as the
motivating example: it could pass a functional test ("the dive
completes") while failing a state-transition test ("the display
correctly reflects each decompression stage").
Two entries opened immediately: DEF-001 (DESCEND/WORK/ASCEND track
shape vs a real 1979 photograph  -  deferred pending clearer matched-tick
photos) and DEF-002 (STOP10/STOP5 label appearing frozen  -  HK's source
check of GOSUB 6950 found it's called exactly once per dive, from
WORK-initiation only, with no other call site or update mechanism
anywhere in source; this points toward faithful behaviour rather than a
genuine defect, pending SB/John confirmation). See DEFECT_REGISTER.md.
### DEF-003 opened and mostly resolved: WORK→ASCEND handoff gap, a boundary case the 3 July +1 offset wasn't built to handle (28 July 2026)
John/SB, 28 July 2026. Constant 2.0px gap observed between GOSUB 6300
Branch 2's (WORK) dashed track and Branch 1's (ASCEND) line at every
WORK→ASCEND transition ("it is as if the work horiz line is one tick
too short"). Diagnosed via paired profileSegs/workDots readings across
three WD1 profiles  -  gap held constant regardless of WORK's duration,
ruling out a growing/multi-column hypothesis.
Root cause: Branch 1 draws each tick's bar at `BASIC_LQ+1` (an offset
photo-validated on 3 July 2026 for the dive-start DESCEND case), Branch
2 draws its own last dot at raw `BASIC_LQ`, no offset. At the exact
handoff tick both branches compute the same LQ, but Branch 1's `+1`
draws one column ahead of where Branch 2 left off. The `+1` offset
itself isn't wrong  -  it was correctly validated against a photograph
weeks before this session  -  this is a boundary case that validation
never covered, not a new liberty taken with the algorithm today.
Fix: `justLeftWorkRef`, set whenever Branch 2 fires, consumed by the
next Branch 1 call to suppress the `+1` on that one tick only. WD1/BT10
confirmed good; more tests pending before full close. Regression set:
RT-01/RT-02 (the original DESCEND validation case, must show no
change), RT-05, RT-28  -  all flagged PENDING in REGRESSION_TESTS.md
until confirmed.
New blocked TODO opened, explicitly not to start until DEF-003 closes:
sweep for the same pattern (single-point approximation of a real
vector PLOT, differently-offset across branches) at every other
GOSUB 6300-adjacent handoff  -  ASCEND→DECOMPRESS, DECOMPRESS→ASCEND,
ASCEND→REST, and similarly-structured multi-branch rendering routines.
See TODO.md, DEFECT_REGISTER.md DEF-003.
### DEF-003 resolved; two general principles recorded in STYLE_GUIDE.md; T33 closed, T36/T37/T38/T44 statuses clarified (28 July 2026)
John, 28 July 2026: DEF-003 resolved. Fix confirmed across three
profiles: WD1/BT10, WD1/BT30, and WD40/BT22 (the original 3 July
dive-start regression check  -  confirms the fix does not disturb the
one photograph-validated case). All pass.
Two general principles recorded, per John, for future reference and
historical narrative  -  written into STYLE_GUIDE.md rather than left
only here, since both generalise beyond this one fix: (1) a gap that
stays constant regardless of activity duration points to a fixed
rendering-convention mismatch, not missing data; (2) any single-point
approximation of a real BASIC vector PLOT, validated once for one
calling context, should be treated as a candidate defect at every
OTHER boundary it touches but was never validated against.
T33 closed on this basis  -  its own repro case (WD=1/BT=30) is exactly
what DEF-003 was built and tested against. T38 and T44 involve the
same WORK→ASCEND boundary DEF-003 fixed, but neither has been
explicitly re-tested against the fix  -  flagged as likely-but-not-
confirmed rather than closed alongside T33. T36 and T37 involve
genuinely different boundaries (DESCEND→WORK, and DESCEND→ASCEND with
no WORK phase) that DEF-003's fix doesn't touch  -  these stay open, and
are now the lead candidates for the sweep task, which is unblocked as
of this entry (T33's remaining tests being the condition that was
blocking it).
New TODO opened: ASCEND's start should take visual priority over the
coloured DT bars, not render behind them  -  related to T38's finding
but likely a different kind of fix (draw-order/z-priority, not a
position offset) even though it surfaces on the same screenshot.
See TODO.md, DEFECT_REGISTER.md DEF-003, STYLE_GUIDE.md,
REGRESSION_TESTS.md RT-32.
### T36/T37 pass; T38 confirmed FAIL and merged with the z-order item into DEF-005; T34 family unified into DEF-004 with a real mechanism (28 July 2026)
John, 28 July 2026. **T36  -  PASS.** WD16/BT40, profileSegs/workDots
data consistent, no visible discontinuity.
**T37  -  PASS, with the "level tick" cap now explained rather than
open.** WD49, immediate ASCEND. The short flat cap at the end of the
ASCEND line is RT-07's isFlat/MIN_BAR_H flat-segment rendering firing
during RT-29's already-confirmed AD/IK look-ahead margin  -  two
previously-confirmed mechanisms combining, not a new one, this test
just happened to observe it at an ASCEND boundary rather than a
DECOMPRESS stop. No fix needed; SB to add a comment at the isFlat site
cross-referencing RT-29 so this doesn't get re-raised later (not yet
done  -  flagged in REGRESSION_TESTS.md).
Both T36/T37 were the sweep task's original lead candidates  -  both
clearing means the sweep starts with no known-bad case in hand, only
the general pattern to look for.
**Correction: the "ASCEND should overwrite DT bars" item is not new  - 
same underlying issue as T38.** Retested directly: confirmed FAIL  - 
the diver path draws, then the DT/coloured bars draw over the first
line of ASCEND. Merged into DEFECT_REGISTER.md as DEF-005, distinct in
kind from DEF-003 (z-order/draw-priority, not position/offset). Also
resolves the 24 July T24 reopening flag  -  this is DEF-005's territory,
not a T24 defect.
**T34  -  CONFIRMED FAIL, now with a real mechanism, not four
unexplained data points.** WD10/BT45 retest: AD=7.50 against a WD
target of 10  -  exactly DR×TK (30×0.25), i.e. DESCEND stopped after one
tick, un-clamped, rather than continuing to the tick that would clamp
to 10. Checked all four original T34/T39/T40/T41 data points (49→45,
10→7, 16→15, 30→22) against DR=30/TK=0.25 tick arithmetic  -  every one
matches the SECOND-TO-LAST tick's value: the loop stops exactly one
tick before the tick that would clamp to target or land on it exactly.
One consistent mechanism, not the "no consistent pattern" originally
recorded. WD40 (RT-01/RT-02) is unaffected  -  independently confirmed
correct. Merged T34/T39/T40/T41 into DEFECT_REGISTER.md as DEF-004.
Working hypothesis, John's own, NOT YET CHECKED against source: RT-29's
IK look-ahead margin (forced minimum 0.5 in ACCELERATED mode) may be
involved in an analogous DESCEND-completion check  -  a fixed margin
would be a much larger fraction of a small WD than a large one,
consistent with WD40 being unaffected. Proposed investigation only.
See TODO.md, DEFECT_REGISTER.md DEF-004/DEF-005, REGRESSION_TESTS.md
RT-33/RT-34.
### Comment-scope policy clarified: no cross-reference comments in DiverSim.jsx (28 July 2026)
John, 28 July 2026: HK's earlier recommendation for T37 (a code
comment cross-referencing RT-29 at the isFlat site) is not wanted.
Permanent comments in DiverSim.jsx are for exactly two things: what a
BASIC line did, and how JSX achieves the same effect differently.
Nothing else  -  not cross-references to RT-NNN/DEF-NNN/T-numbers, not
test rationale. That material belongs in LOG.md/DEFECT_REGISTER.md/
REGRESSION_TESTS.md/TESTING_PLAN.md, not duplicated into source.
Temporary construction comments are permitted during active building
but must be removed once the artefact is confirmed working  -  not left
as permanent documentation.
Written into STYLE_GUIDE.md as a standing clarification. T37's TODO.md
entry and RT-34 corrected to remove the recommendation.
### Future requirement recorded: eventual full strip of non-BASIC-translation comments; confirms the project's narrative comes from LOG.md, not the source (28 July 2026)
John, 28 July 2026: at some point, every comment in DiverSim.jsx that
isn't a BASIC-translation-plus-JSX-difference comment will need to be
removed  -  not just "stop adding new ones" (28 July's earlier comment-
scope clarification, above) but eventually stripping everything else
out, including anything that predates that clarification. The finished
JSX is meant to be the clean product of the exercise; the process
itself  -  how it was built, the interesting challenges along the way  - 
is deliberately kept out of the code and lives instead in LOG.md and
the other tracking documents, which will be used to produce a separate
narrative account.
This is recorded as a future requirement, not current work  -  written
into STYLE_GUIDE.md and added to TODO.md's FINAL PASS section,
logically following the existing Historical-first commenting audit
item (settle the convention, then strip everything that isn't it). Not
to be started proactively; awaiting John's explicit go-ahead.
Also confirms something worth being deliberate about going forward:
LOG.md's narrative detail is not incidental record-keeping  -  it is the
actual source material for a planned account of the project, which
raises the bar on writing entries that would stand on their own to a
reader who wasn't in the conversation, not just entries that make
sense to whoever already knows the context.
### Full boundary/parameter-space sweep done; register audit flags single-profile "Confirmed" rows (28 July 2026)
HK, 28 July 2026, per John: swept all ~127 IF-statements in DIVER.bas
for genuine continuous-value boundaries (as opposed to trivial/
cosmetic IFs). Found the middle XS regime (WD 17-20) has never been
tested once  -  every WD ever used in this project falls outside it.
Ten further boundaries flagged (T46-T55, TODO.md), plus T25 augmented
with GOSUB 8000's own unswept boundaries.
Audited REGRESSION_TESTS.md against the same lens: several "Confirmed"
rows (RT-12, RT-13/14, RT-24/27/28, RT-31) share one foundational
profile (WD40/BT22/ACCELERATED) rather than being independent trials  - 
flagged, not treated as new bugs. RT-32 (DEF-003, three profiles
spanning two XS regimes) is the model going forward.
See TODO.md, PARAMETER-SPACE / BOUNDARY COVERAGE section.
### SB consolidated scheduler handoff: predictive scheduler reconstructed via CCEMU; DEF-004 root cause found and fixed; REST double-prompt defect opened (07 August 2026)
SB, consolidated handoff superseding earlier piecemeal notes, 07 August
2026. Governing principle updated: the original scheduler is now
experimentally characterised  -  instrumented CCEMU execution is the
authority where the listing is ambiguous, not static reading alone.

**Scheduler model established.** Original scheduler is predictive: it
separates current activity, requested/queued next activity, the
look-ahead prompt boundary (`IF CL<ES(EP,2)-IK THEN 3400`, so look-ahead
fires at approximately `ES(EP,2)-IK`), and the true event boundary
(`ES(EP,2)` itself). Receiving a "WHICH ACTIVITY REQUIRED" response does
not mean the current activity has ended.

**Major JSX architectural error found and fixed:** BASIC's `3032 INPUT
M$` / `3035 IF A$(NA)=M$ THEN 3400` resumes at line 3400 in the same
scheduler pass  -  it does not restart at 1465. JSX had been treating the
prompt as an external pause and restarting from the top of the
scheduler, changing movement/event ordering. Corrected to preserve
INPUT response → resume at 3400.

**DEF-004 root cause superseded.** The IK-margin hypothesis recorded 28
July was never confirmed and is now superseded  -  the actual cause was
this scheduler defect: the predictive prompt could terminate/replace
DESCEND before its `3405` bottom clamp executed. Fix preserves DESCEND
as current until movement completes, letting 3405 fire naturally. No
artificial WD assignment introduced. Verified via CCEMU: WD10
0→7.5→10, WD16 0→7.5→15→16, WD40 0→7.5→15→22.5→30→37.5→40 (final
non-multiple step is the genuine 3405 clamp). See DEFECT_REGISTER.md
DEF-004, updated.

**Clock-model correction.** An intermediate JSX version forced
`CL=ES(EP,2)` exactly at the boundary; CCEMU proved this wrong  -  BASIC
advances `CL=CL+TK` on its normal discrete grid and event times
(`ES(EP,2)`) are logical thresholds CL need not ever equal exactly
(e.g. WD10 completes at CL≈0.50 against a calculated event time of
0.5833). The exact-CL clamp was removed; discrete TK-grid progression
restored.

**Initial-pass correction.** BASIC's `1790 GOTO 3000` continues in the
same scheduler pass; JSX had been ending the pass early, adding an
extra TK increment before the first prompt (CL=0.50 instead of the
CCEMU-observed CL=0.25 for WD10 WORK). Corrected to preserve 1790→3000
as same-pass continuation; now matches CCEMU exactly.

**Short-depth DESCEND single-stroke appearance  -  explained, not a
defect.** WD10/WD16 can render as one near-vertical stroke despite
genuine multi-tick movement, because GOSUB 6300's `LP=INT(AA*XS)+10` /
`LQ=INT(CL*XS)+10` can map successive ticks to the same integer X plot
column at shallow depth/short elapsed time. WD40 runs long enough for
X to advance visibly. Source/plot-granularity behaviour, not a
scheduler bug.

**WORK→ASCEND scheduler reconstructed on the same principles**
(look-ahead prompt separated from transition; ASCEND becomes current
only once WORK's own boundary completes). An intermediate version had
a timing error (~10.5833 boundary transitioning at CL≈11.08), traced to
the temporary exact-boundary/next-tick handling since superseded by the
discrete-clock model above. **Needs re-regression on the current
candidate before being considered closed**  -  not yet re-run since the
clock-model correction.

**REST scheduler defect found, open.** `3021 IF AL(AL,1)<>5 THEN 3025` /
`3022 CK=1:GOTO 1465`  -  REST suppresses the WHICH ACTIVITY prompt at
look-ahead; "FOR HOW LONG" (GOSUB 5700) belongs later, in the
end-of-event path (`2010 ON NA GOTO...`, `2140 GOSUB 5700`). Current JSX
has a REST auto-default path in the look-ahead section that can call
`gosub_5700_start()` too early  -  live testing showed FOR HOW LONG asked
twice. Confirmed defect, not yet corrected. Opened as DEF-006.

**ASCEND scheduler not yet reconstructed.** Still shows the pre-fix
pattern (becomes active on prompt, look-ahead prompt during ascent in
progress, crosses the scheduled event time on the normal TK grid).
Relevant physical logic: `3406 IF AD-AR*TK<AL(AL,4) THEN 3408` /
`3407 AD=AD-AR*TK` / `3408 AD=AL(AL,4)`. SB flags explicitly: do not
generalise DESCEND's fix mechanically  -  test ASCEND on its own terms
first (current-activity persistence, natural 3408 clamp, no early next-
activity activation). DECOMPRESS scheduler likewise not yet
reconstructed.

**Compucolor BASIC interpreter semantic found: fractional array
subscripts truncate on indexing, not on assignment.** Line 6754,
`J=INT(WM-7)/2`  -  CCEMU confirms the division happens after the INT, so
J itself retains .5 values (WM=10→J=1.5, WM=16→J=4.5, WM=40→J=16.5).
A second CCEMU test confirmed that when such a fractional J is then
used as `DT(J,1)`, the interpreter truncates the subscript to the lower
integer (J=1.5→row 1, J=4.5→row 4, J=16.5→row 16). This traces back to
the "unexpectedly large NOSTOP-area time-available values" seen during
scheduler testing  -  concerns the time value displayed beneath NOSTOP,
not the NOSTOP value itself. `gosub_6750()` corrected: preserve
fractional BASIC_J, truncate only at the DT-indexing step. General
interpreter-semantic finding, worth retaining beyond this one routine.

**Current candidate:** `DiverSim_scheduler_CCEMU_clock_v3.jsx`  -  DESCEND
scheduler reconstruction, WORK scheduler work, CCEMU-based discrete
clock handling, same-pass 3035→3400 and 1790→3000 continuations,
GOSUB 6750 fractional-J correction. REST and ASCEND remain open.

**Confirmed so far:** predictive scheduler principle; prompt/current-
activity separation; BASIC INPUT resumes at 3400; initial 1790→3000
same-pass continuation; discrete TK clock (no exact-ES clamp); DESCEND
movement/clamp behaviour; Compucolor fractional array-subscript
semantics; REST double-prompt defect (open).
**Re-regression required before closing** (clock model revised after
earlier scheduler passes): DESCEND→WORK and WORK→ASCEND schedulers.
**Not yet reconstructed:** ASCEND, DECOMPRESS, REST schedulers (REST
has a known defect pending fix; ASCEND/DECOMPRESS not yet attempted).

See DEFECT_REGISTER.md (DEF-004 updated, DEF-006 opened),
REGRESSION_TESTS.md (regression sweep pending, RT-01/RT-02/RT-32 need
re-confirmation against the new clock model), TODO.md.
### DEF-006 assessment recorded; REST candidate produced but untested; RT-26/RT-27 flagged for review against source lines 1800-1820 (08 August 2026)
John, 08 August 2026. DEF-006 (REST double-prompt) confirmed by
repeated live observation, assessment recorded in DEFECT_REGISTER.md.
Candidate `DiverSim_REST_scheduler_v1.jsx` produced implementing the
proposed fix; not yet tested  -  DEF-006 status set to FIX IMPLEMENTED,
NOT YET REGRESSION-CONFIRMED (same standard as DEF-004/WORK→ASCEND).

Separately, and more significant: a fresh source check found BASIC
lines 1800-1820 have REST reaching `GOSUB 8000` and `END`, which may
be inconsistent with RT-26/RT-27's existing expectation that REST
self-chains (routes back to REST) unconditionally. If confirmed,
RT-26/RT-27's own expected behaviour  -  not just DEF-006's candidate  - 
would be the thing that's historically wrong. Both rows flagged for
review in REGRESSION_TESTS.md and not to be used as pass/fail
criteria against the REST candidate until a REST test tomorrow settles
it. See DEFECT_REGISTER.md DEF-006, REGRESSION_TESTS.md.
### RT-28 tail flagged alongside RT-26/RT-27 pending REST source/test question (08 August 2026)
John, 08 August 2026. RT-28's final `REST→REST` segment rests on the
same self-chain assumption now under review for RT-26/RT-27 (BASIC
lines 1800-1820). Flagged in REGRESSION_TESTS.md  -  not to be used as a
failure criterion for `DiverSim_REST_scheduler_v1.jsx` until settled.
RT-28's DESCEND→WORK→ASCEND→DECOMPRESS portion is unaffected. See
DEFECT_REGISTER.md DEF-006.
### DEF-006 resolved  -  REST scheduler confirmed via CCEMU; RT-26/RT-27 rewritten, RT-28 tail corrected (08 August 2026)
SB, 08 August 2026. `DiverSim_REST_scheduler_v1.jsx` tested
successfully on two paths: the standard WD40/BT22 full decompression
cycle and a deliberate WORK→REST override. Confirmed: FOR HOW LONG
appears once only; entered duration becomes REST's own duration; REST
runs to its scheduled boundary with no second prompt; REST does not
self-chain; at the boundary the simulation terminates via `GOSUB 8000`
then `END`, matching source lines 1800-1820.

Full-cycle route: `DESCEND → WORK → ASCEND → DECOMPRESS → ASCEND →
DECOMPRESS → ASCEND → REST → END`. Override route: `DESCEND → WORK →
REST → END`  -  despite HT=10 already established, no DECOMPRESS
activity/coloured bars were created, confirming the user's accepted
REST choice overrides the suggested successor at that transition.

DEF-006 marked RESOLVED. RT-26/RT-27's old REST→REST self-chain
wording confirmed historically wrong (not merely under review) and
rewritten to the terminate-via-END behaviour above; old wording kept
struck through for the historical record. RT-28's tail corrected from
`...→ REST → REST` to `...→ REST → END`.

Qualification carried forward: `GOSUB 8000`'s MEMORY/end-of-dive
display remains separately unimplemented/unverified  -  this closure
covers REST's scheduling behaviour only, not that display. See
DEFECT_REGISTER.md DEF-006, REGRESSION_TESTS.md, TODO.md.
### ASCEND scheduler reconstructed and CCEMU-confirmed on full WD40/BT22 profile; DECOMPRESS next (08 August 2026)
SB, 08 August 2026. `DiverSim_ASCEND_scheduler_v1.jsx` tested through
the full WD40/BT22 decompression profile. Same architectural fix as
DESCEND/WORK: answering WHICH ACTIVITY REQUIRED during ASCEND only
queues NA  -  source line 3035 returns to 3400, so ASCEND stays current
through 3406-3408, reaches/clamps to its target depth, and only then
does the true end-of-event path dispatch the queued next activity.

Confirmed full-profile sequence: 40→10 (suggested next DECOMPRESS,
prompt appears while still above 10m, AL-create PA=2,15,40,10,4;
boundary AD=10.00 NA=4, then DECOMPRESS created), 10→5 (same pattern,
AL-create PA=2,15,10,5,4, boundary AD=5.00 NA=4, DECOMPRESS created),
5→0 (AL-create PA=2,15,5,0,5, boundary AD=0.00 NA=5, REST created).
Final sequence: `...DECOMPRESS → ASCEND(5→0) → REST → END`, REST
boundary reaching END. No early DECOMPRESS/REST activation observed at
any transition.

STOP10 label still reading STOP10 at the later 5m stop is DEF-002 (not
an ASCEND scheduler failure)  -  current source analysis indicates the
label is set once at WORK initiation and not revisited later.

Current candidate: `DiverSim_ASCEND_scheduler_v1.jsx`. Next SB task:
DECOMPRESS scheduler reconstruction/review  -  DECOMPRESS still uses
older provisional event handling and should not yet be described as
scheduler-confirmed.

Regression status per SB: WD40/BT22 full-cycle ASCEND path passes
after the latest scheduler changes, but this is CCEMU evidence only  - 
formal REGRESSION_TESTS.md rows affected by the broader scheduler
rewrite (RT-06 and related) still need updating/re-running before any
wider closure claim. See TODO.md, REGRESSION_TESTS.md.
### HK housekeeping fix: TODO.md's T23 entry still described REST as never terminating (08 August 2026)
John flagged that TODO.md's T23 entry still carried the pre-DEF-006
wording (REST self-chains unconditionally, dive never terminates via
the activity-selection logic), left unupdated when RT-26/RT-27/RT-28
and DEF-006 were corrected. HK error, not a code issue. T23 rewritten
to point at the confirmed REST→END behaviour and mark the old wording
superseded; the open question about an out-of-band BASIC BREAK/STOP
interrupt is removed as premised on the now-superseded reading. No
other stale self-chain references found elsewhere in the doc set.
### DECOMPRESS scheduler reconstructed and CCEMU-confirmed; premature DECOMPRESS graphic resolved incidentally; DEF-007 opened for flat-line misalignment (08 August 2026)
SB, 08 August 2026. `DiverSim_DECOMPRESS_scheduler_v1.jsx`  -  the
cumulative candidate, now including DESCEND/WORK/ASCEND/REST plus this
DECOMPRESS correction. Source-fidelity fix: DECOMPRESS had retained
older provisional behaviour where `GOSUB 7500` could fire at the
predictive WHICH ACTIVITY prompt; corrected so DECOMPRESS remains
current, HT changes only at the true `[1888]` boundary
(`IF AL(AL,1)=4 THEN GOSUB 7500`), and the queued next activity is
created afterward via the normal end-of-event route.

Confirmed on both WD40/BT22 stops: first stop, prompt fires at
HT(before)=10 with ASCEND selected but DECOMPRESS remaining current;
true boundary (EP=8, AD=10.00, NA=2) fires `GOSUB 7500` (HT 10→5),
then creates ASCEND 10→5 (PA=2,15,10,5,4, DECOMPRESS suggested next).
Second stop: same pattern, HT(before)=5, true boundary (EP=12,
AD=5.00, NA=2) fires `GOSUB 7500` (HT 5→0), creates final ASCEND 5→0
(PA=2,15,5,0,5, REST suggested next).

The previously observed premature DECOMPRESS graphic has disappeared
 -  assessed as an incidental consequence of the activity-handoff fix,
not a separate graphics fix.

New graphics-only observation, DEF-007 opened: the DECOMPRESS flat-
line track begins slightly early and extends slightly too far at its
boundaries on the time axis, making ASCEND→DECOMPRESS joins look
untidy. Assessed as rendering/geometry (BASIC draws the non-WORK track
as a vector between calculated coordinates; JSX represents the flat
DECOMPRESS section via plot-column rectangles), not scheduler  -  the
scheduler fix above is unaffected. Deliberately deferred until
scheduler correctness was established; now SB's suggested next task.

STOP10 continuing to display at the 5m stop remains DEF-002, unaltered
by this work.

Scheduler status: DESCEND, WORK, ASCEND, DECOMPRESS and REST have each
now been reconstructed/tested on the standard WD40/BT22 route. Per
HK's standing rule, formal regression rows are not inferred closed
from this  -  see REGRESSION_TESTS.md pending section (RT-16/17/18/19/20
added alongside RT-06 and the earlier DESCEND/WORK rows).
### Premature DECOMPRESS graphic disappearance independently verified (08 August 2026)
John, 08 August 2026. Confirmed independently that the previously
observed premature DECOMPRESS graphic is no longer apparent. SB agrees
the fix was a by-product of correcting the scheduler rather than a
separate graphics change. Upgrades the earlier entry's status from
SB's own assessment only to independently verified  -  see TODO.md,
REGRESSION_TESTS.md.
### ASCEND/DECOMPRESS/REST rendering investigation; new control-flow correction retained; DECOMPRESS→ASCEND gap remains open (not resolved); REST duration defect found and fixed (08 August 2026)
SB, 08 August 2026. Current cumulative candidate:
`DiverSim_ASCEND_transition_REST_vector_v1.jsx`.

**New control-flow correction, source-confirmed, retained:** at a true
activity end-event boundary, BASIC line 2200 returns to 1465 and does
NOT fall through into the 3000/3400 display/movement block in the same
pass. JSX had been breaking only out of its internal catch-up loop and
continuing into display/movement regardless. Corrected; independent of
the rendering work below.

**Rendering investigation.** Historical photograph used as benchmark:
shows vertical ASCEND / horizontal DECOMPRESS sections only, no angled
or curved ASCEND lines. Four approaches tried and rejected: literal
SVG BASIC vectors (clean joins, angled ASCEND  -  visually wrong);
rasterised BASIC vectors (closer geometry, broken/uneven lines);
stepped raster stroke (excessive staircasing not in photo); L-shape on
every ASCEND tick (clean joins, but repeated horizontal steps during
ascent, also not in photo). Diagnostically useful, none chosen.

**Current ASCEND treatment:** photo-like vertical bar restored for the
normal climb; raw BASIC LQ position applied only on the tick reaching
target depth (old ASCEND→DECOMPRESS displacement traced to empirical
LQ+1 positioning)  -  good landing without L-shaping the whole ascent.

**DECOMPRESS:** now a raw horizontal LP→LQ line instead of a filled/
bar-style element  -  good duration/position geometry, resolves DEF-007's
original early-start/late-finish symptom.

**REST:** same raw LP→LQ treatment adopted; in doing so, found REST=5
had been rendering at ~7 minutes' visual duration under the old
flat-bar treatment  -  now correct. Logged and closed as DEF-008.

**Remaining, explicitly NOT resolved:** a small gap persists at the
end of a DECOMPRESS horizontal segment where the following ASCEND
begins  -  absent from the photograph and the clean benchmark image.
Accepted for now so work can continue, but SB explicit this is not to
be classified as resolved or accepted variance; DEF-007 kept OPEN,
narrowed to this remaining symptom. Do not reintroduce ASCEND L-shapes
to close it  -  that fixes the join but damages ASCEND fidelity per the
rejected experiment above.

STOP10/STOP5 (DEF-002) unaffected, remains separate. Broader
regression/matrix testing still outstanding once activity
implementations are in suitable shape  -  rendering work not to be
treated as globally complete on the strength of the current accepted
appearance. See DEFECT_REGISTER.md DEF-007 (updated), DEF-008 (new,
resolved), TODO.md.
### DEF-005 evidence  -  clearer screenshot saved (08 August 2026)
John, 08 August 2026. Saved a clearer screenshot of DEF-005 (ASCEND
track rendering behind the coloured DT bars) to
`reference/emulator_screenshots/DEF-005_ascend_behind_DT_bars.png`,
superseding the original T33/WD35 image as the primary reference for
this defect. DEFECT_REGISTER.md's DEF-005 evidence updated to point at
the new file.
### DEF-009 opened  -  DESCEND legacy tick-count X positioning, deferred (08 August 2026)
John, 08 August 2026. Opened DEF-009: the DESCEND SVG renderer still
uses a tick-count-derived X position from early reconstruction work,
rather than BASIC's own `LP=INT(AA*XS)+10` / `LQ=INT(CL*XS)+10`
coordinates  -  the approach already adopted for ASCEND/DECOMPRESS/REST.
The approximation was visually plausible against poor-quality
photographs at the time, but later ASCEND/handoff work has exposed
inconsistencies at short-depth/direct DESCEND→ASCEND boundaries.
Proposed fix: rebuild DESCEND rendering from BASIC LP/LQ geometry,
approximating only the Compucolor rasterisation, not the underlying
time coordinates. Explicitly marked DEFERRED/NON-BLOCKING  -  most
visible only at shallow/direct-return edge cases, scheduler/state
behaviour not implicated, and the outstanding regression sweep,
single-profile validation gap, and DEF-007's remaining gap all take
priority. See DEFECT_REGISTER.md DEF-009, TODO.md.
### Formal multi-profile scheduler regression sweep  -  PASS; 20m/21m decompression boundary confirmed source-faithful, not a defect (08 August 2026)
SB, 08 August 2026. Formal regression of the cumulative scheduler
candidate run across a range of naturally generated dive profiles,
superseding the "pending re-confirmation" status several
REGRESSION_TESTS.md rows had carried since the 07 August scheduler
rewrite.

**Profiles tested, all PASS:** WD10/ACCELERATED→ASCEND→REST;
WD10/ACCELERATED→WORK10→ASCEND→REST; WD16/ACCELERATED→WORK10→ASCEND→
REST; WD19/ACCELERATED→WORK47→ASCEND→DECOMPRESS→ASCEND→REST (first
observed naturally generated single-stop decompression dive);
WD20/ACCELERATED/WORK40; WD20/ACCELERATED/WORK50→ASCEND→DECOMPRESS→
ASCEND→REST; WD21/ACCELERATED/WORK40→ASCEND→DECOMPRESS→ASCEND→
DECOMPRESS→ASCEND→REST; WD40/ACCELERATED/WORK20→ASCEND→DECOMPRESS→
ASCEND→DECOMPRESS→ASCEND→REST. Confirmed throughout: predictive
activity prompting without premature termination; true activity
boundaries; DESCEND/ASCEND target completion; WORK duration; single-
and multi-stop DECOMPRESS; REST duration; final END behaviour. Known
graphics defects (DEF-005, DEF-007, DEF-009) remain separately open
and don't invalidate the scheduler PASS  -  DEF-005 specifically noted
still present on the WD40 run (first ascent partially obscured by
coloured DT bars).

REGRESSION_TESTS.md updated: RT-01/RT-02, RT-06, RT-08/RT-09, RT-16
through RT-20, RT-24, RT-27/RT-28, RT-32 marked CONFIRMED for
scheduler/activity-sequencing behaviour on this evidence. Genuinely
still open: REAL mode away from WD40, WD17/WD18 (lower part of the
XS=1 regime, T46), and exhaustive per-tick DM-digit-value accuracy
(this sweep confirms sequencing/behaviour, not an exhaustive re-check
of every DM field value the original rows specified).

Per SB's stated logging practice: intermediate failures/experimental
fixes during development not separately logged; this cumulative PASS
supersedes them.

**Archaeological finding, not a defect  -  20m/21m decompression
boundary.** WD21/WORK40 naturally produced decompression stops at both
10m and 5m, while WD20 did not, despite differing by only 1m of
working depth. Traced to an explicit source condition,
`AL(AL,3)>20`, in the decompression calculation: above 20m, once the
relevant DT boundary is crossed, DX=5/HT=10 can be introduced in
addition to the ordinary D5 calculation's own 5m-stop requirement.
Confirmed as a genuine, deliberately-encoded 1978/79 decision boundary,
not a JSX artefact or an approximation error  -  independent evidence
the reconstruction is reproducing the source decompression logic
itself, not merely matching photographed dive profiles. Logged as
RT-35 (Resolved-as-not-a-bug), REGRESSION_TESTS.md. Future exhaustive
decompression-table boundary / deliberate OUT OF RANGE testing may be
undertaken separately if required; not required to close this
scheduler regression group.
### WD15-WD20 addendum scheduler sweep  -  PASS, closes WD17/18 gap, no new defect (09 August 2026)
SB, 09 August 2026. Follow-up to the WD10/16/19/20/21/40 formal
regression sweep  -  additional scheduler regression across WD15,
WD16, WD17, WD18, WD19 and WD20. All six PASS on scheduler/activity
sequencing: correct progression through DESCEND completion, WORK
where selected, ASCEND completion, DECOMPRESS where naturally
required by the decompression-table arithmetic, REST, and END. Some
runs reproduced already-documented graphics issues (shallow/direct
DESCEND→ASCEND geometry, DEF-009; other recorded rendering defects)
 -  these don't invalidate the scheduler PASS and remain tracked
separately.

Purpose/value noted by SB: shows the reconstructed scheduler is
stable across a continuous range of working depths, not only at the
previously emphasised reference cases (WD10, WD16, WD21, WD40).
Combined with the earlier sweep, every WD from 15 through 21 has now
been run through a full activity cycle  -  closing the WD17/WD18 gap
flagged in REGRESSION_TESTS.md and TODO.md's T46. No new scheduler
defect identified. See REGRESSION_TESTS.md (addendum added under the
multi-profile sweep section), TODO.md T46 (updated to CLOSED).
### GOSUB 8000 MEMORY implemented and source-verified in JSX; GOSUB 5900 promoted from low-priority to source-significant (DEF-011); MEMORY heading rendering issue opened (DEF-010) (09 August 2026)
SB, 09 August 2026. Full GOSUB 8000 source block recovered and
implemented  -  MEMORY is substantially more than the previously-known
line 8010 refresh. Comprises: heading (8005/8006, cursor position +
"MEMORY" text); 8010 (`AD=WD:GOSUB 6600:GOSUB 6700`, deliberately
restoring working depth in the red depth digits and refreshing the air
indicator); explicit rewrite of DM IDs 1-18. Top MEMORY row derived
from BT via 8020-8060 (minutes:seconds). For a decompression dive,
lower two rows restore saved decompression requirements (`D5=E5:DX=EX`)
as "10M <DX>:" / "5M <D5>"  -  the differing punctuation (colon on the
10m row, blank final cell on the 5m row) is source-correct. No new
stubbed dependency exposed  -  uses already-implemented 6600/6700/7000.

WD40/BOTTOM TIME 20 test: GOSUB 8000 implemented and source-verified
in JSX; the final BT=21.75 was independently proved in original
BASIC/CCEMU (via the GOSUB 5900 investigation below); source lines
8020-8060 then mechanically establish BT=21.75 → 21:45. JSX displayed
`21:45` / `10M 5:` / `5M 15` / red working depth 40. This is source
arithmetic applied to an independently-proved BT  -  not a completed
original-BASIC CCEMU run through the full final MEMORY display end to
end; stronger evidence than a fuzzy screenshot match, but should not
be described as "CCEMU-verified end-to-end." Lower two rows agree with
source and with poor-quality surviving photographs (readable as
approximately 10M 5, 5M 15); the top row's photograph evidence is too
poor to confirm reliably and was not used to fit the result.

**MEMORY heading rendering issue, opened as DEF-010 (minor):** current
JSX renders too much black background behind "MEMORY"  -  source line
8006 only positions the cursor and prints the text; the photograph
shows black limited to the character cells, not a full-width strip.
Does not affect MEMORY arithmetic or DM content. Explicit note: do not
remove the red working-depth digits or regularise the decompression
rows' colon  -  both are source-correct, not related to this issue.

**Major discovery  -  GOSUB 5900 ("SUB STRETCHES WORK") promoted from
correctness-neutral/low-priority to source-significant, opened as
DEF-011.** Found while investigating the MEMORY BT value. GOSUB 5900
splits a requested WORK BOTTOM TIME at decompression-table time
boundaries into multiple chained PA-stack entries (intermediate
entries PA(n,5)=3  -  WORK expected next; final entry PA(1,5)=2  -  ASCEND
expected next), each presented to the user as "IS NEXT STAGE = <n> MIN.
REQUIRED". Precise interaction: answering YES accepts the proposed
continuation; answering NO does not itself command ASCEND  -  it
re-enters the BOTTOM TIME path at [5509], where a positive replacement
bottom time is processed through GOSUB 5900 again (possibly generating
a new staged set), while the non-positive branch reaches [5515]
("ASSUME WANT ASCENT-NOT WORK") and routes to ASCEND. Exact
interaction sequences for revised positive bottom times remain under
controlled CCEMU investigation. CCEMU-proved for WD40/BOTTOM TIME 20
(CL=1.75, TT=20, DT row 11,17,20,22,24,25,999): four-stage PA stack
consumed in order 9.25→6→3→1.75, giving staged endpoints 11, 17, 20,
21.75. Traced directly at line 1691 across all four stages. BT
(`BT=AL(AL,7)`, updated at each staged endpoint via
`AL(P,7)=AL(P,6)+AL(P,2)`) progresses 11→17→20→21.75  -  final surviving
BT is 21.75 minutes, proved via direct original-BASIC/CCEMU execution
of the 5900 PA-stack trace, not inferred from JSX or photographs. This
is what GOSUB 8000 mechanically displays as 21:45 for this exact case.

The 17 July 2026 "correctness-neutral, low priority" judgement
(TESTING_PLAN.md T32, REGRESSION_TESTS.md RT-31) is now known
incomplete: it correctly established that staged vs single-shot HT/DX/
D5 converge to the same final numbers, but didn't account for the
behavioural consequences of staging itself  -  the internal PA/AL
sequence, when the scheduler returns control to the user, the genuine
WORK-vs-ASCEND decision at each table boundary, and every intermediate/
final BT value all depend on 5900 actually running. TESTING_PLAN.md T32
and REGRESSION_TESTS.md RT-31 both updated with a dated superseding
note (old conclusion kept, marked superseded, not deleted). New status:
source-significant, implementation required. Reopened now rather than
deferred to implementation time, per John's explicit instruction, since
this is exactly the kind of outstanding item this project's logging
practice is meant to catch.

Per John's explicit instruction: intermediate investigative hypotheses
considered and superseded during this work are not separately logged
here.

DEF-002 (STOP10/STOP5) reopened as a related consequence: its earlier
"fires exactly once per dive" analysis assumed one WORK-initiation
event per dive, which DEF-011 disproves in general  -  whether GOSUB
6950 re-fires across 5900-staged WORK boundaries must now be
established from original BASIC/CCEMU rather than retained as current
fact.

See DEFECT_REGISTER.md DEF-002 (reopened), DEF-010, DEF-011; TODO.md
T25/T32/T42/T50; TESTING_PLAN.md T25/T32; REGRESSION_TESTS.md
(RT-31 moved out of "resolved as not a bug"; scheduler-sweep
qualification added noting RT-24/RT-28 ran under one-block WORK, not
5900-staged WORK).
### HK housekeeping corrections  -  date error, overclaimed CCEMU wording, imprecise 5900 interaction description, DEF-002 reopened, T32/T50/T42 staleness, RT-31 section placement (09 August 2026)
John, 09 August 2026, identified several HK errors in the 08/09 August
material and requested corrections:

1. **Date error.** The WD15-WD20 addendum sweep and the GOSUB 8000
   MEMORY/GOSUB 5900 discoveries were dated 08 August 2026 throughout,
   but both actually belong to today's (09 August) session. Corrected
   in LOG.md (entry headers and opening lines), DEFECT_REGISTER.md
   (DEF-010, DEF-011), TODO.md (T25), TESTING_PLAN.md (T32's
   superseding note), and REGRESSION_TESTS.md (the WD15-20 addendum
   section, RT-31's cross-reference). Genuinely older 08 August
   material (the scheduler rewrite, DEF-005 through DEF-009, the
   original WD10/16/19/20/21/40 sweep) is unaffected and correctly
   remains dated 08 August.

2. **Overclaimed "CCEMU-verified" wording.** Several places (LOG.md
   heading, TODO.md T25, DEFECT_REGISTER.md DEF-011) described the
   WD40/BOTTOM TIME 20 MEMORY result as "CCEMU-proved/verified
   end-to-end." What was actually proved: the complete GOSUB 5900 PA
   stack and successive original-BASIC BT values in CCEMU, finishing
   at BT=21.75; GOSUB 8000 is implemented and source-verified in JSX;
   source lines 8020-8060 mechanically establish BT=21.75 → 21:45. A
   clean original-BASIC CCEMU run through the full final MEMORY
   display itself was not completed. Corrected wording adopted
   throughout: "GOSUB 8000 implemented and source-verified in JSX;
   WD40/BOTTOM TIME 20 final BT=21.75 independently proved in original
   BASIC/CCEMU; MEMORY formatting therefore gives 21:45 by direct
   source arithmetic." Noted as stronger evidence than a fuzzy
   screenshot match, just more precisely bounded than the earlier
   phrasing implied.

3. **Imprecise GOSUB 5900 interaction description.** "Continue WORK or
   decline and ascend" was an oversimplification. Corrected throughout
   (DEF-011, TESTING_PLAN.md T32, TODO.md T32) to: answering YES
   accepts the proposed continuation; answering NO does not itself
   command ASCEND  -  it re-enters the BOTTOM TIME path at [5509], where
   a positive replacement bottom time is reprocessed through GOSUB
   5900 (possibly generating new staged intervals), and the
   non-positive branch reaches [5515] ("ASSUME WANT ASCENT-NOT WORK")
   and routes to ASCEND. Exact sequences for revised positive bottom
   times remain under controlled CCEMU investigation.

4. **DEF-002 reopened.** Its "GOSUB 6950 fires exactly once per dive"
   analysis assumed one WORK-initiation event per dive  -  DEF-011
   disproves this in general (a single BOTTOM TIME request can become
   several chained staged WORK activities). Whether 6950 re-fires
   across staged WORK boundaries must be established from original
   BASIC/CCEMU, not retained as current fact. DEFECT_REGISTER.md
   updated.

5. **TODO.md T32 housekeeping contradiction.** T32 still stated the
   superseded "RESOLVED, correctness-neutral, LOW PRIORITY" conclusion
   even after TESTING_PLAN.md and REGRESSION_TESTS.md had been updated
   to say otherwise  -  two competing statements in different files.
   Corrected: TODO.md's T32 entry now states only current status and
   action (open-items-only, per TODO's own purpose); the superseded
   reasoning stays in TESTING_PLAN.md/LOG.md as marked history.

6. **T50 stale rationale.** Was framed around validating the discarded
   "correctness-neutral for any constant-depth WORK period" conclusion.
   Reframed around whether 5900 staging is bypassed below 10m and what
   happens exactly at AD=10  -  a live boundary question independent of
   the old, now-superseded framing.

7. **TESTING_PLAN.md T25 section stale.** Still read "END PHASE (not
   yet tested)" / "NOT YET TESTED" and only described line 8010, not
   the full MEMORY routine now implemented. Rewritten to match the
   fuller, current detail (which had ended up better-documented in
   TODO.md than in TESTING_PLAN.md itself)  -  old pre-implementation
   text kept below the rewrite, marked as history rather than deleted.

8. **T42 flagged for reassessment**, not closed  -  its old "not yet
   known whether it shares a root cause" framing predates the DEF-011
   discovery about BOTTOM TIME/BT/staging; put behind T32/5900,
   revisit once staged WORK exists.

9. **REGRESSION_TESTS.md structure.** RT-31 was sitting under
   "Resolved-as-not-a-bug" while its own text said it was no longer
   resolved. Moved to a new "Reclassified  -  moved OUT of
   Resolved-as-not-a-bug" section.

10. **Scheduler-sweep qualification added.** The 08 August multi-profile
    sweep and its 09 August WD15-20 addendum both confirm DESCEND, true
    boundaries, ASCEND, DECOMPRESS, REST and END  -  genuinely
    demonstrated, not withdrawn. But neither constitutes source-complete
    validation of WORK sequencing, since every tested profile ran the
    current one-block WORK implementation, not GOSUB 5900-staged WORK.
    RT-24, RT-28, and other affected full-cycle profiles will need
    re-running once DEF-011 is implemented.

11. **DEF-010 wording narrowed.** Previously said DM digit content and
    GOSUB 5900/BT were "confirmed correct independently" of the heading
    issue  -  too broad. Corrected: 8000's rendering/content logic is
    unaffected by DEF-010; BT production is separately open under
    DEF-011, and the WD40/BT20 case getting the right MEMORY value
    without 5900 implemented is a convergence of that specific case,
    not general confirmation that BT production is correct.
### T25/GOSUB 8000 MEMORY  -  DM content verified correct; no outstanding content defect; evidentiary wording tightened further (10 August 2026)
John/SB, 10 August 2026. WD40/BOTTOM TIME 20 MEMORY DM content  -  `21:45`
/ `10M 5:` / `5M 15` / red working depth `40`  -  is now regarded as
verified correct. No outstanding defect in MEMORY DM content. Do not
alter these values to fit the poor-quality historical photographs;
photographs remain corroborative only.

Verification basis kept as three distinct pieces of evidence, not
compressed into one claim: (1) original BASIC/CCEMU tracing proved the
final WORK-stage BT progression 11→17→20→21.75, so BT=21.75 is what
enters GOSUB 8000; (2) BASIC source lines 8020-8060 prove how that BT
decomposes into 21:45 (.75 minute → 45 seconds, no rounding to 22:00);
(3) the JSX demonstrates the completed display. The lower two rows are
source-derived decompression values (10M 5:, 5M 15); the differing
trailing-colon punctuation is intentional source behaviour. AD=WD
deliberately restores the working-depth display, hence red 40.

Explicitly reaffirmed as still separate: DEF-010 (MEMORY heading
cosmetic rendering  -  outside the DM content, does not reopen this) and
DEF-011 (GOSUB 5900/WORK staging not yet implemented  -  concerns how the
correct BT is produced upstream for WORK periods crossing a
decompression-table boundary; does not make this verified GOSUB 8000
formatting/content wrong).

Per John's explicit instruction: retain the distinction established 09
August 2026 between what CCEMU proved (BT=21.75), what the BASIC 8000
source proves (how that becomes 21:45), and what the JSX demonstrates
(the completed display)  -  do not compress this back into "CCEMU proved
the complete MEMORY display." TODO.md T25, TESTING_PLAN.md T25, and
DEFECT_REGISTER.md DEF-011 updated accordingly.
### GOSUB 5900/6950 CCEMU finding  -  staged WORK activities pass through the full ordinary WORK-initiation dispatch; DEF-002 mechanism confirmed; regression target established (10 August 2026)
SB, 10 August 2026. Controlled CCEMU tracing of WD40/BOTTOM TIME 20
confirmed every GOSUB-5900-generated WORK stage re-enters the ordinary
WORK-initiation path, and that path contains TWO GOSUB 6950 call sites,
not one: `1693 GOSUB 6950` and `1694 GOSUB 6850:GOSUB 6950`. The
earlier "GOSUB 6950 fires exactly once per dive" wording is confirmed
incorrect on two counts  -  once for assuming one WORK-initiation event
per dive (corrected 09 August), and independently for assuming one call
site even within a single WORK-initiation (source calls it twice, back
to back). Both corrections remain superseded, not re-adopted.

CCEMU trace across the four WD40/BOTTOM TIME 20 stages: `AL2 END11 HT0
DX0` (6950 entered twice); `AL3 END17 HT10 DX5` (twice); `AL4 END20
HT10 DX5` (twice); `AL5 END21.75 HT10 DX5` (twice)  -  eight total
entries, two per stage, exactly matching the two source call sites.
First stage: HT=0/DX=0, so line 6955 causes both calls to return
without writing STOP content. From the second stage onward, HT=10/DX=5,
so 6950 writes STOP10 on each staged WORK-initiation.

**DEF-002 interpretation revised:** STOP10 is not written once at dive
start  -  it's refreshed during staged WORK whenever the WORK-initiation
branch re-runs. Once the diver leaves WORK for ASCEND/DECOMPRESS, GOSUB
6950 is no longer called, so the last STOP label written during WORK
simply remains visible. For WD40/BOTTOM TIME 20 specifically, every
staged WORK-initiation from stage 2 onward independently arrives at
HT10/DX5 and writes STOP10 again  -  the visible STOP10 persistence at
the 5m stop is explained mechanistically, not left as an unexplained
"stuck" label. DEFECT_REGISTER.md DEF-002 updated with the full trace
and a revised confirmed-cause/regression-test section; kept OPEN,
blocked on DEF-011's implementation, since whether OTHER profiles (with
genuinely differing staged HT/DX) show a correct visible STOP10→STOP5
transition during WORK itself remains untested.

**DEF-011 architectural consequence:** the 5900-generated sub-stages are
not merely internal timing fragments  -  they are full WORK activities
passing through the normal activity-initiation machinery, including
GOSUB 6100, 6950, and 6850. A JSX implementation of GOSUB 5900 must
therefore create staged WORK activities through the ordinary
WORK-initiation dispatch, not simulate the stages as hidden timing
subdivisions underneath one WORK activity. This CCEMU trace (per-stage
HT/DX/6950-entry sequence) is a direct regression target for the future
implementation. DEFECT_REGISTER.md DEF-011 and TODO.md T32 updated
accordingly.
### GOSUB 5900 (DEF-011) implemented and regression-tested; DEF-012 (zero-duration activity scheduler bug) found and fixed; DEF-002 tied to implementation status; CCEMU DM/NOSTOP capture test parked (10 August 2026)
SB/John, 10 August 2026.

**GOSUB 5900 implementation.** Stack-generation arithmetic implemented
and tested in isolation first  -  WD40/WORK20 reproduced the exact CCEMU
PA stack (durations 1.75/3/6/9.25, NEXT values 2/3/3/3)  -  then
integrated into the scheduler, including source lines 1890-1893
(preserving an already-prepared WORK stack when the default WORK
continuation is followed). Regression PASSes: WD40/ACCELERATED/WORK20
(staged 9.25→6→3→1.75, endpoints 11→17→20→21.75, final handoff to
ASCEND 40→10m NEXT=DECOMPRESS); WD16/ACCELERATED/WORK10 (no unnecessary
subdivision, DESCEND→WORK10→ASCEND preserved); WD20/ACCELERATED/WORK50
(staged 45→3→2, endpoints 46→49→51, HT 0→5, final WORK→ASCEND 20→5m
NEXT=DECOMPRESS).

NO/revised-BOTTOM-TIME path implemented and tested  -  answering NO at a
staged boundary resets PA to 1 and asks for a new BOTTOM TIME, per the
[5509] re-entry behaviour established 09 August. Positive replan test:
WD40/WORK20 at CL=11 boundary, reject 6-minute continuation with NO,
enter BOTTOM TIME 1  -  since CL sat exactly on the 11-minute table
boundary, GOSUB 5900 legitimately constructed a zero-duration
intermediate WORK entry followed by a 1-minute final entry, exposing a
genuine JSX scheduler bug (opened and resolved same-session as DEF-012
below). After the fix: NO→BOTTOM TIME 1→"IS NEXT STAGE=1 MIN
REQUIRED"→YES→ASCEND. PASS. Non-positive replan test: "IS NEXT
STAGE=6 MIN REQUIRED"→NO→BOTTOM TIME 0 correctly followed the source
KJ=1/"ASSUME WANT ASCENT-NOT WORK" path, immediately creating ASCEND
rate 15, 40m→0m, NEXT=REST. PASS.

DEF-011 marked RESOLVED/IMPLEMENTED  -  core behaviour done, subject to
ordinary edge/regression coverage rather than missing core behaviour.

**DEF-012 opened and resolved same session:** the zero-duration staged
WORK activity above exposed that JSX was consuming a newly-created
activity's creation and completion within one scheduler pass, skipping
the display phase  -  BASIC line 1790 goes through display processing
before another event can be consumed, even for a zero-duration
activity. JSX corrected so a newly-created activity always reaches the
3000/display phase before another completion event is consumed.
Confirmed via the positive replan test sequence above.

**Regression register additions:** RT-31 reclassified from "open
implementation gap" to implemented, with full PASS evidence. Three new
formal rows added, not yet run: RT-36 (GOSUB 5900 shallow/AD<10
boundary, formalises TODO.md T50), RT-37 (WORK/REST minimum-duration
and TK-mode boundary, formalises TODO.md T55), RT-38 (GOSUB 5900 OUT
OF RANGE paths  -  source [5931] hard STOP/O.R. and [5970] PA=-1 return/
error, two distinct behaviours, not to be merged into the existing
GOSUB 6100/6750 OUT OF RANGE tests). T50/T55 retained in TODO.md until
RT-36/RT-37 actually run. The 09 August scheduler-sweep qualification
(WORK sequencing not source-complete since profiles ran one-block
WORK) is now followed by a dated note that representative profiles
have since been re-run with source-complete 5900 staging and passed.

**DEF-002 tied to DEF-011's implementation status:** the mechanism DEF-002
depends on (GOSUB 6950 firing twice per staged WORK-initiation) should
now actually run in JSX, since DEF-011's implementation includes the
full per-stage 6100/6850/6950 dispatch. Not yet separately confirmed:
whether the visible STOP10/STOP5 DM content updates correctly across
stages  -  DEF-011's own regression evidence covered scheduler/activity
sequencing and BOTTOM TIME/ASCEND handoffs, not a DM-content check.
DEF-002 stays open pending that specific confirmation.

**CCEMU DM/NOSTOP sequence capture test  -  parked, not started.** John
proposed a separate, narrow controlled test: observe exactly what the
DM/NOSTOP area does through a known dive (WD40/BOTTOM TIME 20, accept
every staged WORK with YES), recording only the three DM rows at ten
specific capture points (before first WORK stage; at each of the four
staged endpoints; first ASCEND prompt; 10m and 5m DECOMPRESS; REST;
final MEMORY)  -  no numeric diagnostics, no screenshots unless a stage
is unusually interesting. Explicitly for control flow and cell content
only  -  CCEMU's own character rendering (horizontally split characters,
wrap peculiarities) makes it unreliable for judging 1979 screen
appearance, which stays separate, later work against better photo
prints. Could answer: whether NOSTOP persists through END11; exactly
when STOP10 overwrites it; whether row 2/3 persist into ASCEND/
DECOMPRESS; when STOP10 is last refreshed; whether STOP5 ever appears
for this profile; what's cleared at REST before MEMORY overwrites the
DM. Added to TODO.md's new "Parked" section  -  not to derail current
work.

See DEFECT_REGISTER.md DEF-002 (updated), DEF-011 (RESOLVED/
IMPLEMENTED), DEF-012 (new, RESOLVED); TODO.md T32/T50/T55/Parked
section; REGRESSION_TESTS.md RT-31/RT-36/RT-37/RT-38.
### BASIC-to-JSX coverage audit  -  two missing live routines (GOSUB 6200, GOSUB 6900) and one candidate-lineage regression (full GOSUB 8000 MEMORY) found; RT-36/37/38 held pending resolution (10 August 2026)
SB, 10 August 2026. First systematic block-by-block audit of the
corrected canonical source (`DIVER(5).bas`, latest corrected 17,551-
byte copy, incorporating known canonical corrections including 5560,
5715, 5994, 6194, 6280, 6346, 6390, 6752, 6859, 6875, 6933/6938/6942,
7240, 7502, 8065, 8073) against the actual current JSX candidate
(`DiverSim_gosub5900_NO_replan_v4.jsx`), classifying each block as
IMPLEMENTED, MODERN EQUIVALENT, FIDELITY OPEN, INTENTIONALLY OMITTED,
MISSING, or REGRESSED/MISSING FROM CURRENT CANDIDATE.

Bulk of the source (constants/tables, initial screen, main event loop,
scheduler core, all five activity dispatches, DESCEND/ASCEND movement,
periodic display calls, GOSUB 5900 itself) confirmed IMPLEMENTED or
MODERN EQUIVALENT. Three substantive findings, judged more important
than the then-planned RT-36/37/38 edge tests  -  those explicitly held
until resolved:

1. **GOSUB 6200 (AIR OK, source 3017, WORK-gated)**  -  completely
   absent from v4. Opened as DEF-013.
2. **GOSUB 6900 (decompression requirement display, source 5503,
   immediately before each staged "IS NEXT STAGE" question)**  - 
   completely absent from v4. Flagged as likely relevant to the
   already-noticed CCEMU DM/NOSTOP differences. Opened as DEF-014.
3. **Full GOSUB 8000 MEMORY**  -  the current v4 `gosub_8000()` contained
   only the old minimal `AD=WD`/6600/6700 refresh, none of the 8005/
   8006 heading or 8020-8100 DM rewrite that project records (T25,
   DEF-010, DEF-011) describe as implemented and demonstrated
   09-10 August. Classified as a candidate-lineage/integration
   regression, not a newly discovered gap  -  implemented once, not
   carried forward into the `_gosub5900_NO_replan` branch. Opened as
   DEF-015.

Audit's explicit caution: current JSX contains numerous stale comments
("not yet", "STUB", or describing an earlier stage) even where the
code has since been completed  -  comments cannot be used as audit
authority; canonical BASIC plus current executable JSX are the source
of truth, with TESTING_PLAN/TODO/LOG reconciled afterwards. Also
flagged: initial-screen PLOT/cursor/scroll details, GOSUB 6300/6600/
7000 low-level fidelity, and the exact DM/NOSTOP/STOP/AIR OK sequence
remain open fidelity questions (not missing algorithms), best settled
by the already-parked CCEMU DM/NOSTOP capture test.

Recommendation: restore/reintegrate full GOSUB 8000, implement/test
GOSUB 6200 and GOSUB 6900, re-run a short representative profile to
confirm all three coexist with the proven 5900 scheduler  -  only then
return to RT-36/37/38 and remaining fidelity work.

### BASIC-to-JSX coverage audit  -  v7 closure addendum: all findings resolved, no known missing live routine remains (11 August 2026)
SB, 11 August 2026. Second-pass audit of `DIVER(5).bas` against
`DiverSim_gosub5900_NO_replan_v7_GOSUB6900.jsx`. All 21 live canonical
GOSUB targets (5000, 5300, 5400, 5500, 5600, 5700, 5900, 6100, 6200,
6250, 6300, 6600, 6700, 6750, 6800, 6850, 6900, 6950, 7000, 7500,
8000) now accounted for  -  as explicit JSX equivalents, as React input
handlers (5000), or inline in the rendering machinery (6300). GOSUB
5060 reconfirmed unreachable historical dead code (no caller anywhere
in the canonical listing)  -  no JSX behaviour required. Line 5561's
handwritten "# ERROR MESSGE" annotation confirmed non-executable
source commentary, not missing JSX.

**GOSUB 8000 (DEF-015):** restored into the current lineage and
re-tested. WD40/ACCELERATED/WORK20 completed with the established
final MEMORY display (21:45, both decompression rows). PASS. Resolved.

**GOSUB 6200 (DEF-013):** implemented at source line 3017. Observed on
WD16 and WD40  -  AIR OK appears whenever WORK is current activity at
the predictive activity question. Functional PASS. Colour/exact
styling remain open as fidelity questions, not this defect's scope.
Resolved.

**GOSUB 6900 (DEF-014):** implemented at source line 5503. WD40/WORK20
observed sequence: first staged question blank (D5+DX=0), second
"T10>15", third "T15>20". Functional PASS. Surfaced a new, separate
transient `T n::::`-type row appearing immediately afterward, not
explained by 6900 itself  -  added to the scope of the already-parked
CCEMU DM/NOSTOP capture test rather than opened as its own item.
Resolved (functional coverage); transient-row observation tracked
separately, not blocking.

No longer a known hidden live BASIC routine blocking ordinary
regression work  -  RT-36/37/38's hold (10 August) is lifted. New rows
RT-39 (GOSUB 6200, PASS) and RT-40 (GOSUB 6900, PASS) added to
REGRESSION_TESTS.md.

Remaining work now falls into two categories, neither blocking: (1)
fidelity/open display mechanism  -  initial-screen PLOT/cursor/scroll,
GOSUB 6300 low-level plotting and newly-confirmed transient L/step
construction, GOSUB 6600 PLOT-29/depth-trend geometry, GOSUB 7000 row
positioning/colour/PLOT semantics (IDs 7-18), the exact DM write/
overwrite sequence including the new transient-row observation, AIR OK
colour verification; (2) regression/edge coverage  -  RT-36/37/38, plus
broader representative end-to-end regression on the now
source-complete scheduler/5900/DM lineage.

Archaeological note carried forward: CCEMU video adds a new evidence
class (temporal display construction)  -  repeated L-shaped/stepped
plotting is systematic under emulation, but CCEMU has known display
bugs (e.g. spurious LF behaviour). Use CCEMU structurally, not
pixel-literally: repeated behaviour matching source PLOT logic is
strong evidence for construction method, not proof of exact original-
hardware timing/appearance. Do not alter JSX to chase a CCEMU-observed
transient effect until the responsible source operation is identified.

See DEFECT_REGISTER.md DEF-013/DEF-014/DEF-015 (all RESOLVED);
REGRESSION_TESTS.md RT-39/RT-40 (new), RT-36/37/38 (hold lifted);
TODO.md T25 (candidate-lineage note added), parked CCEMU DM/NOSTOP
test (scope extended).
### Two further GOSUB 5900 regression PASSes; WORK-stage YES/NO clarified for novice operating instructions; next phase targeted REAL simulation (11 August 2026)
SB, 11 August 2026. Two successful behavioural findings recorded as
regression evidence, not defects  -  no new scheduler-fix TODO opened
from either.

**WD40/ACCELERATED, two legitimate decompression stops in sequence
(10m×5min then 5m×5min)  -  PASS.** GOSUB 6850 showed D5=5, DX=5; later
GOSUB 6250 showed D5=5, DX=0; MEMORY displayed both "10M 5" and "5M 5".
Confirms the deeper-stop DX path and subsequent 5m D5 path operate
correctly in sequence. Logged as RT-41.

**WD40/ACCELERATED, first WORK-stage proposal YES then all subsequent
proposals NO  -  PASS.** Decompression state remained coherent through
replanning. GOSUB 6850 showed D5=10, DX=5; GOSUB 6250 later showed
D5=10, DX=0. Dive completed normally through final 5m decompression,
ascent, REST and END. Logged as RT-42.

**Operating-behaviour clarification.** A NO response to a proposed WORK
stage does not mean "no more WORK"  -  it rejects the automatically
proposed next stage. DIVER then requests a new BOTTOM TIME so the
remaining WORK period can be replanned: a positive BOTTOM TIME permits
further WORK under the revised plan; BOTTOM TIME zero represents no
further bottom work/progression toward ascent. Refines the 09 August
[5509]-re-entry mechanism with the user-facing framing. Should be
incorporated into the novice/user-manual operating instructions, since
the original prompt sequence can otherwise read as contradictory  -  not
one of HK's tracked files, flagged in TODO.md for whoever maintains it.

**Next testing phase:** targeted REAL dive simulation, with V11
retained unchanged.

See REGRESSION_TESTS.md RT-41/RT-42; TODO.md T32 (clarification and
next-phase note added).
### DEF-016 opened  -  BASIC PRINT numeric formatting confirmed via isolated CCEMU test; new STYLE_GUIDE.md translation convention (11 August 2026)
John, 11 August 2026. Isolated CCEMU test  -  `10 A=.1:PRINT A`, `RUN`  - 
produced ` .1` (leading space, no leading zero), confirming Compucolor
BASIC's `PRINT` applies its own numeric-formatting rule rather than
printing a raw internal float. Screenshot evidence; recommended path
`reference/emulator_screenshots/DEF-016_basic_print_decimal_A_dot1.png`
(confirm actually saved there, per usual practice).

Directly relevant to DIVER source `PRINT "IS NEXT STAGE
=";PA(PA,2);" MIN. REQUIRED"` (GOSUB 5500/5900's staged-WORK prompt,
DEF-011)  -  JSX had displayed a raw floating-point value
(`0.0967891234444`) for a PA(PA,2) case where authentic BASIC would
show `.1`. Correct display: `IS NEXT STAGE = .1 MIN. REQUIRED`.
Whether the leading space is visually significant in that specific
sentence (given the preceding literal) remains an open question.

Opened as DEF-016  -  general rule, not scoped to just this one prompt:
any DIVER `PRINT` of a raw numeric variable is a candidate for the
same issue until audited. New STYLE_GUIDE.md convention added
recording the rule for all future translation work, alongside the
existing FOR-NEXT-exhaustion and historical-first-commenting
conventions.
### DEF-016 fix confirmed; RT-38 partial PASS ([5931] exit); REAL-mode full-cycle and decompression runs PASS; scheduler declared PASS/FREEZE; new DEF-017 (ASCEND→DECOMPRESS start-step) opened under active investigation; v12 diagnostic rejected; PRINT/output audit started (11 August 2026)
SB, 11 August 2026 (HK catch-up covering the period from the DEF-016
floating-point fix onward  -  some items may restate ground already
logged; reconciled against existing entries rather than duplicated).

**DEF-016 confirmed fixed**  -  treated as a display/PRINT fidelity
correction, not a scheduler change. JSX now reproduces the
human-readable BASIC-style value rather than exposing the raw
JavaScript float. Marked RESOLVED in DEFECT_REGISTER.md.

**PRINT/output audit started**, distinguishing source-derived output
(must reproduce faithfully), diagnostic/debug output (reconstruction-
only), floating-point formatting artefacts (DEF-016's territory), and
transient screen material not yet understood (includes the
already-tracked transient `T n::::` row). Explicit caution: do not
silently "improve" source messages merely because their wording
appears odd. Added to TODO.md as an ongoing process item.

**RT-38 partial PASS.** The [5931] hard-stop OUT OF RANGE exit
confirmed via a controlled source-faithful test: `status=hard-stop
sourceExit=5931 STOP` for AD=40/CL=30/TT=1 (I=16.5, row=16, J=7,
K=null, PA_scalar=1, DT row 11,17,20,22,24,25,999)  -  CL=30 lies beyond
every usable DT row-16 boundary, the J-search reaching sentinel 999 at
column 7. Traced into source logic rather than treated as a JSX
scheduler failure; confirmed legitimate source behaviour, must not be
"repaired" in JSX. The [5970] PA=-1 return/error exit remains
untested. REGRESSION_TESTS.md RT-38 updated to reflect the partial
status.

**REAL-mode end-to-end runs, both PASS.** REAL WD16/BT10: complete
DESCEND→WORK→ASCEND→REST→END, predictive prompting/true movement
boundary/activity creation/surface arrival/REST completion all
correct (a graphics problem remained at one activity transition, no
scheduler failure). REAL deeper/decompression runs: full
DESCEND→WORK→ASCEND→DECOMPRESS→further ASCEND→additional DECOMPRESS
(where required)→final ASCEND→REST→END, GOSUB 7500 firing correctly
at DECOMPRESS boundaries with HT progressing through required stop
depths (10→5→0 where applicable); one run produced two separate
5-minute DECOMPRESS periods, accepted as genuine source-derived
behaviour given the underlying event/activity chain supported it.
YES/NO WORK-continuation responses, including NO→bottom-time replan,
confirmed working in REAL mode too. Logged as RT-43/RT-44; TODO.md
T47 (REAL-mode-away-from-WD40 gap) updated to substantially closed.

**SCHEDULER STATUS: PASS/FREEZE.** Following the accelerated and REAL
runs, the scheduler is considered proven  -  do not alter scheduler, PA,
ES, event-boundary, predictive-prompt, activity-creation, or
movement/clamp logic without new behavioural evidence from the
BASIC/source. Project has moved from scheduler reconstruction into
graphics fidelity investigation. Added as a prominent header note in
TODO.md.

**New graphics artefact  -  DEF-017 opened.** A later REAL WD40
decompression run (itself a PASS) showed a small visible step/
discontinuity at the start of DECOMPRESS instead of a clean
ASCEND→DECOMPRESS join  -  explicitly distinct from DEF-005/DEF-007/
DEF-009, not to be merged with them. Archaeological position: GOSUB
6300's plotting logic remains the authority (LP/LQ from time, MP/MQ
from depth for non-WORK activity); JSX rendering is necessarily more
elaborate in reproducing Compucolor's raster behaviour, so a correct
scheduler state can still produce incorrect JSX geometry. Investigation
rule: diagnose first, no fix until cause understood, no scheduler
changes  -  graphics repairs must not feed back into the now-frozen
scheduler.

**Diagnostic v12 REJECTED/DISCARDED.** Added React state to retain
decisive handoff records for the DEF-017 investigation; unexpectedly
caused a run to reach the DESCEND boundary with NA=0 before the normal
predictive activity was queued. Traced to the diagnostic's own added
state/render-cycle effects  -  explicitly NOT evidence of a newly
discovered scheduler defect. V11 remains the behavioural baseline; v12
is not to be treated as an ancestor of anything going forward (per the
candidate-lineage lesson from DEF-015). Next SB action: instrument V11
non-invasively (no new React state/render-cycle effects) and capture
final ASCEND plotted coordinate, first DECOMPRESS plotted coordinate,
raw BASIC LP/LQ and MP/MQ, and any difference between the raw BASIC
handoff and the JSX painted handoff  -  to determine whether the step is
produced by the handoff logic itself or by the ASCEND rasterisation
immediately before it.

See DEFECT_REGISTER.md DEF-016 (RESOLVED), DEF-017 (new, OPEN,
under investigation); REGRESSION_TESTS.md RT-38 (updated), RT-43/RT-44
(new); TODO.md (scheduler freeze header, T47 updated, PRINT/output
audit section added).
### HK correction  -  stale RT-36/37/38 and TODO wording (11 August 2026)
SB, 11 August 2026, flagged that RT-36/37/38 were still recorded as
NOT YET RUN/PARTIAL despite all three having actually run and PASSED.
Corrected:

- **RT-36**  -  PASS. WD9/ACCELERATED/long WORK: 5900 bypassed (AD<10),
  WORK unstaged. WD10/ACCELERATED/long WORK: 5900 active normally at
  exactly 10m, staged per the DT row. Source condition [5905] confirmed
  as `<10`, not `<=10`. T50 closed/removed from TODO.md.
- **RT-37**  -  PASS. REST ordering verified (`PA(PA,2)=M` stored before
  the local `M<2*TK` clamp, matching [5710]-[5715]). ACCELERATED REST
  input 0.1: PA stays 0.1, local M raised to 0.5. REAL REST input 0.1:
  PA stays 0.1, no local clamp (2*TK=0.0625). WORK `<TK` branch:
  ACCELERATED takes the direct branch without the stage question; REAL
  asks it (0.1>TK there). DEF-016's numeric PRINT fidelity also
  reconfirmed here. T55 closed/removed from TODO.md.
- **RT-38**  -  PASS, both exits. RT-38A ([5970], PA=-1): live end-to-end
  test reached `status=pa-minus-one PA_scalar=-1 CL=1.75 row=16 J=6
  K=7`  -  CL valid within the row, proposed WORK end exceeded it.
  RT-38B ([5931], hard STOP): isolated harness reached
  `status=hard-stop sourceExit=5931 STOP AD=40 CL=30 TT=1 row=16 J=7
  DT row=11,17,20,22,24,25,999`. Qualification: RT-38B is intentionally
  isolated, since normal full-program execution may be intercepted
  earlier by GOSUB 6750's own OUT OF RANGE protection.

REGRESSION_TESTS.md's "Reclassified" section rewritten cleanly (it had
also fragmented across earlier edits, with RT-31/36/37/38 splitting
into two separate table blocks around RT-39-44  -  consolidated into one
table, no duplicate rows). TODO.md's T25 entry corrected (was still
describing DEF-011 as "not yet implemented in JSX"  -  that was accurate
09 August wording, marked historical, not current fact). T32's entry
updated with the RT-36/37/38 PASS status. DEFECT_REGISTER.md DEF-011's
regression-tests-required and final-resolution sections updated to
close on both core behaviour AND edge coverage.

Current project state confirmed unchanged and correct throughout this
correction: scheduler status PASS/FREEZE; behavioural baseline V11;
v12 discarded, not an ancestor; development phase graphics fidelity
investigation; DEF-017 (ASCEND→DECOMPRESS start-step) open, diagnose-
first rule in force; no scheduler/PA/ES/event-boundary/predictive-
prompt/activity-creation/movement-clamp changes without new source
evidence.
### DEF-017 clean-V11 probe: X-grid-mismatch hypothesis ruled out (12 August 2026)
SB, 12 August 2026. The non-invasive V11 handoff probe proposed 11
August was run on the REAL WD40 decompression case. Decisive records:
ASCEND target 10m  -  final ASCEND grid 56, first DECOMPRESS grid 56,
delta 0. ASCEND target 5m  -  final ASCEND grid 67, first DECOMPRESS
grid 67, delta 0 (the 5m ASCEND used a partial final rise,
actualRise=0.3125, nominalRise=0.46875, but still handed off on the
identical X grid). Final ASCEND to surface captured at grid 98, with
no following DECOMPRESS activity at that handoff.

Conclusion: DEF-017 remains OPEN, but the hypothesis that the visible
DECOMPRESS-start step is caused by an X-grid mismatch between final
ASCEND and first DECOMPRESS is ruled out  -  raw handoff coordinates
agree exactly in both tested cases. Investigation moves inward: the
rendered geometry within the shared grid cell, vertical MP/MQ
geometry, and pixel construction. No scheduler, PA/ES, timing, React
state, activity-creation, or movement/clamp changes made or proposed  - 
this remains a graphics-only investigation. Performed non-invasively
against the clean V11 baseline; nothing from the rejected v12
candidate was revived or inherited.

**Housekeeping note:** an SB_BRIEFING.md was received this session
dated 12 August with this probe evidence already folded in, but it had
been built on a version of the briefing that predated the 11 August
RT-36/37/38 correction (still showing them as not-yet-run/partial,
T50/T55 still listed as open)  -  a documentation-lineage drift of the
same kind DEF-015 already taught this project to watch for. The new
probe evidence was extracted and logged here and in DEFECT_REGISTER.md
DEF-017; the stale RT-36/37/38 wording was NOT re-adopted. SB_BRIEFING.md
regenerated fresh from the current authoritative files plus this new
finding.

See DEFECT_REGISTER.md DEF-017 (updated).
### HK corrections  -  DEF-017 Probe 1/Probe 2 structure, RT-10 obsolete expectation, TODO.md T36/T37 internal contradiction (12 August 2026)
John, 12 August 2026, flagged three issues.

1. **DEF-017 hadn't caught up with its own Probe 1 result.** The entry
   still presented the (already-completed) instrument-and-compare plan
   as the "current investigation," with the probe results awkwardly
   appended after it, rather than reading as one settled step followed
   by a clearly-named next one. Restructured into **Probe 1  -  COMPLETE**
   (the plan, then its results: 10m handoff grid 56→56, 5m handoff grid
   67→67, delta 0 in both cases, X-grid-mismatch hypothesis ruled out)
   and **Probe 2  -  CURRENT investigation** (examine the final ten ASCEND
   raster ticks  -  within-cell rendering geometry, vertical MP/MQ
   geometry, pixel construction  -  not yet run). Final resolution line
   updated to name Probe 2 explicitly rather than leaving "investigation
   continues" unspecific. Note: the Probe 1 finding itself was already
   logged in LOG.md on 12 August (see the preceding entry)  -  the gap
   was specifically in DEFECT_REGISTER.md's presentation, not a missing
   log record.

2. **RT-10 was stale and materially wrong**, not cosmetically outdated.
   It stated GOSUB 6950 writes "correct label + countdown... once at
   WORK start"  -  superseded by the confirmed finding (DEF-002/DEF-011)
   that 6950 fires twice per WORK-initiation and GOSUB 5900 can turn one
   BOTTOM TIME request into several genuine WORK-initiations, each
   re-entering 6950. Rewritten to state the corrected expectation (label
   reflects the CURRENT stage's HT/DX, refreshed at every staged
   WORK-initiation) with the old wording struck through and dated, not
   silently replaced.

3. **TODO.md's T33 entry contradicted its own T36/T37 entries.** A
   sentence written 28 July said T36/T37 "remain genuinely open" as
   sweep lead candidates  -  directly above an "UPDATE (28 July 2026)"
   note recording both PASSED on direct retest, and directly above
   T36/T37's own PASS/CLOSED entries lower in the same file. Marked the
   stale sentence as superseded same-day, left legible for context
   rather than deleted outright (TODO.md is open-items-only, but the
   surrounding reasoning was worth keeping readable).

See DEFECT_REGISTER.md DEF-017; REGRESSION_TESTS.md RT-10; TODO.md
(T33 entry).
### DEF-017 RESOLVED  -  ASCEND target-tick raster-coincidence flat-segment fix; DEF-007 RESOLVED  -  DECOMPRESS/ASCEND SVG raster-seam fix; new baseline DiverSim_v11_DEF017_DEF007_fix.jsx (12 August 2026)
SB, 12 August 2026. Two long-standing graphics defects resolved back
to back, both via the same disciplined diagnose-first, two-probe
methodology, both scheduler-untouched.

**DEF-017 RESOLVED.** Cause confirmed by a controlled V11-derived
graphics-only test: on an ASCEND target tick, BASIC integerisation can
produce MP===MQ even though the diver has just completed a genuine
ascent movement  -  a raster coincidence, not a real constant-depth
moment. JSX was interpreting that coincidence as a flat segment,
rendering the terminal ASCEND tick with FLAT_BAR_W/forced MIN_BAR_H
geometry, producing the visible cap/step immediately before
DECOMPRESS. Fix, in `DiverSim_v11_DEF017_ASCEND_target_fix.jsx`: an
ASCEND target tick retains ASCEND rectangle paint semantics even where
its integerised MP/MQ coordinates coincide; genuine DECOMPRESS/REST
flat rendering unchanged. Regression PASS across REAL WD40/BT20/all
staged YES (both joins clean), WD49/ACCELERATED/immediate ASCEND
(established end-of-ASCEND geometry preserved), REAL WD16/BT10
(ASCEND→REST/surface clean), WD40/BT22/ACCELERATED full cycle. No
scheduler, PA, ES, event-boundary, predictive-prompt, activity-
creation, timing, or movement/clamp logic changed. Probe 1 (11-12
August, X-grid handoff mismatch ruled out) and Probe 2 (this cause)
together close the investigation.

**DEF-007 RESOLVED**, investigated from the clean DEF-017 baseline.
Same two-probe methodology: Probe 1 established the final DECOMPRESS
endpoint and first ASCEND rectangle meet exactly in BASIC-derived X/Y
geometry; Probe 2 established the last non-zero-length DECOMPRESS SVG
line also reaches exactly the first ASCEND rectangle's centre X and
bottom Y  -  ruling out scheduler timing, BASIC coordinate mismatch, and
missing final raster extent. Confirmed cause: an SVG raster seam at
the junction between the 2px butt-capped DECOMPRESS `<line>` and the
filled first ASCEND `<rect>` under crisp-edge rendering  -  a pure
rendering-technique artefact. Fix: extend only the first ASCEND
rectangle immediately following DECOMPRESS by 1px downward into the
join. No BASIC coordinates, scheduler, timing, PA/ES, activity
creation, movement/clamp, or other ASCEND rendering changed. Same
four-profile regression PASS as DEF-017.

**New clean baseline: `DiverSim_v11_DEF017_DEF007_fix.jsx`**  - 
supersedes plain V11 and the intermediate DEF017-only candidate.
Scheduler remains PASS/FREEZE throughout, confirmed untouched by both
fixes, not merely assumed.

DEF-009's TODO.md priority note updated  -  DEF-007 and DEF-017, both
formerly cited as ahead of it in priority, are now resolved.

See DEFECT_REGISTER.md DEF-017 (RESOLVED), DEF-007 (RESOLVED);
REGRESSION_TESTS.md RT-45 (new); TODO.md (scheduler-status header
baseline updated, DEF-009 priority note fixed).
### DEF-005  -  causal z-order fix confirmed, WD40 apparent overlap confirmed source-authentic; regression testing still required, not yet closed (12 August 2026)
SB, 12 August 2026. Causal z-order test PASSED: moving `profileSegs`
to render after the coloured DT `bandSegs` makes ASCEND visibly
overwrite the coloured mountain, matching intended BASIC sequential
PLOT behaviour. No geometry, scheduler, timing, or activity-state
logic changed.

Follow-up diagnostics checked whether the now-visible ASCEND looked
prematurely positioned, particularly at WD40/BT20  -  important since
simply reordering paint priority could have exposed a genuine
positioning bug the old z-order had been accidentally hiding. WD35/
BT20: final WORK ends LM=52, first ASCEND LQ=53  -  no overlap, one
column gap as expected. WD40/BT20: final WORK Branch 2 plots X3=53,
leaves LM=53; first ASCEND LQ=53  -  BASIC line 6314 suppresses only
when `LQ<LM`, so equality is deliberately allowed by source; the first
ASCEND vector legitimately occupies the same BASIC X-column as the
final WORK bar. Confirmed source-authentic overlap, not a JSX defect  - 
the final coloured bar had simply been concealing some or all of that
genuine ASCEND stroke, which is exactly DEF-005's original symptom.

Current causal test candidate: `DiverSim_DEF005_zorder_test.jsx`  -  a
separate, not-yet-merged test build, distinct from the current graphics
baseline (`DiverSim_v11_DEF017_DEF007_fix.jsx`). Status: cause and
required rendering behaviour confirmed; regression testing still
required before closure. Next planned tests: WD40/BT22 ACCELERATED
full cycle, REAL WD40/BT20 full cycle. Scheduler remains PASS/FREEZE,
untouched throughout.

See DEFECT_REGISTER.md DEF-005 (updated, still OPEN).
### DEF-005 RESOLVED  -  z-order fix confirmed via regression PASS; new baseline DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx (12 August 2026)
SB, 12 August 2026. Regression testing completed for the DEF-005 z-
order fix. Cause confirmed: React SVG grouped rendering gave the
coloured DT `bandSegs` permanent z-priority over `profileSegs`, so the
bars always painted over ASCEND  -  in the original BASIC, GOSUB 6300
executes sequentially, so a later non-WORK vector can legitimately
overwrite an already-plotted WORK/bar column. Fix built from the clean
DEF-017/DEF-007 baseline: coloured WORK/DT bands render first,
non-WORK `profileSegs` render afterward. No geometry, scheduler,
timing, PA/ES, activity creation, movement/clamp, or other simulation
logic changed.

Regression PASS: WD35/BT20/ACCELERATED; WD40/BT20/ACCELERATED; WD40/
BT22/ACCELERATED full cycle; REAL WD40/BT20/all staged YES.

Overlap-extent clarified: WD35's ASCEND begins one BASIC X-column
after the final WORK column (finite SVG element width causes only a
small edge overlap); WD40's source deliberately permits the first
ASCEND vector in the same BASIC X-column as the final WORK bar
(`LQ===LM`), producing substantially greater overlap. Both confirmed
genuine and now correctly rendered.

New clean baseline: `DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx`  -  all
three of DEF-017, DEF-007, and DEF-005 now incorporated. Scheduler
remains PASS/FREEZE, untouched throughout all three fixes.

TODO.md's baseline header and DEF-009's priority note both updated to
reflect DEF-005's closure alongside DEF-017/DEF-007.

See DEFECT_REGISTER.md DEF-005 (RESOLVED); REGRESSION_TESTS.md RT-46
(new); TODO.md (baseline header, DEF-009 priority note).
### DEF-005  -  clean-baseline confirmation sweep (12 August 2026)
SB, 12 August 2026. The final clean successor
`DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx` itself  -  not a separate
test build  -  completed its own confirmation sweep: WD35/BT20/
ACCELERATED PASS, WD40/BT22/ACCELERATED full cycle PASS, REAL WD40/
BT20/all staged YES PASS. Confirms the DEF-005 z-order fix survived
the clean rebuild and that the previously incorporated DEF-017/DEF-007
fixes remain intact on the same file. Scheduler remained PASS/FREEZE
and untouched throughout. No status change  -  DEF-005 was already
RESOLVED; this is the strongest confirmation yet since it exercises
the actual baseline artefact rather than an intermediate build. See
DEFECT_REGISTER.md DEF-005.
### DEF-009 RESOLVED  -  DESCEND raw-LQ painting fix; aggressive TODO.md cleanup (13 August 2026)
SB/John, 13 August 2026.

**DEF-009 RESOLVED.** Original defect wording partly stale: DESCEND
was no longer using the old tick-count X mechanism by the time this
investigation began. The surviving defect was narrower  -  an inherited
Branch-1 rendering convention painting DESCEND at `BASIC_LQ + 1`
rather than raw `BASIC_LQ`. Controlled diagnostics showed why this
could look correct on some profiles but fail on others: at WD16 and
WD49, the final DESCEND bar was painted one plot column ahead of the
source coordinate while the following ASCEND began at raw `LQ`,
producing a visible one-column backward step at the DESCEND→ASCEND
handoff. WD40 masked the problem  -  its next ASCEND tick naturally
advanced into the same column DESCEND's `+1` offset occupied, the same
"only ever validated against WD40" pattern as DEF-003/DEF-004/DEF-015.
A narrow landing-tick-only correction was tried and rejected (WD16
still failed); a broader candidate painting all DESCEND ticks at raw
`LQ` passed WD16/WD49/WD40 immediate-ASCEND, then a clean successor
built from `DiverSim_v11_DEF017_DEF007_DEF005_fix.jsx`  -  named
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_fix.jsx`  -  passed the same
three plus WD40/BT22 full cycle and REAL WD40/BT20/all staged YES. No
scheduler or simulation-state logic changed. New confirmed baseline
named above. See DEFECT_REGISTER.md DEF-009, REGRESSION_TESTS.md
RT-47.

**Aggressive TODO.md cleanup**, per John's detailed reconciliation
(file dropped from 526 to 273 lines  -  roughly half). John's core
complaint: the file is meant to hold open items only, but was carrying
numerous entries already marked RESOLVED/CLOSED/SUPERSEDED/IMPLEMENTED
as if still active. Removed entirely (all fully captured in LOG.md/
TESTING_PLAN.md/DEFECT_REGISTER.md, nothing lost, just no longer
duplicated as "open" here): T33 (resolved via DEF-003), T36 (PASS/
CLOSED), T37 (PASS/CLOSED), the T38/ASCEND-overwrite merge note
(resolved via DEF-005), T34/T39/T40/T41 (DEF-004, closed via formal
regression), the entire 07-08 August "scheduler reconstruction
underway" historical block (obsolete now the scheduler is PASS/
FREEZE), T25's main "implemented and verified" block (kept only as a
one-line boundary-check remnant in Tier 2), T26 (confirmed), GOSUB
6100/T26c-2 (confirmed), T32/GOSUB 5900 implementation (implemented,
edge regression PASS), the old DEF-009-deferred TODO entry (now
resolved above), T27 (confirmed), T28 (confirmed), T29 (GOSUB 6200
AIR OK  -  also stale, not in John's original list but caught during
the same pass: implemented via DEF-013), T23 (superseded, no open
question), T46 (closed by the WD15-21 sweep), T48 (answered by RT-35),
and the IK-look-ahead item under the boundary sweep (duplicated
DEF-004 tracking, not a separate item).

Shortened rather than deleted: T47 (REAL-mode gap  -  reduced to a
one-paragraph "substantially closed" note); the register-audit
paragraph (dropped the now-fully-resolved RT-31 line, kept RT-24/27/
28/12/13/14's genuinely still-untested bracket/branch gaps); T18
(rewritten  -  the old smooth-line-vs-staircase framing predated DEF-009
and no longer describes a live question); the SCREEN COMPONENTS
draw-order sweep item (condensed to name DEF-017/007/005/009 as closed
and ASCEND→REST as the one remaining untested transition).

Retained deliberately, per John: T44 (WD18 WORK→ASCEND repro case,
still not explicitly re-tested against DEF-003) and T42 (BT40 repro
case)  -  both quick confirmation candidates now that staged WORK
actually exists to test them against.

Moved out of TODO.md rather than deleted: U29 (DX-never-reset quirk)  - 
reads as a documented original-program design observation, not
outstanding work; flagged here for whoever maintains the design/
observed-anomalies record, since HK doesn't have that file loaded to
move it into directly.

Baseline header updated to `DiverSim_v11_DEF017_DEF007_DEF005_DEF009_
fix.jsx`.
### U29 moved from TODO.md into DESIGN_NOTES.md (14 August 2026, HK)
Follow-up to the 13 August TODO.md cleanup, where U29 (DX never reset
across a session, so a later shallower dive can still show STOP10 left
over from an earlier one) was removed from TODO.md as a design
observation rather than outstanding work, but couldn't be relocated at
the time since DESIGN_NOTES.md wasn't in HK's working set. John
supplied the file this session  -  U29's content added as a new dated
entry ("DX never reset  -  a persistent-state design quirk, not a port
bug"), matching the file's existing per-entry dated/sourced convention.
No other TODO.md changes this turn.
### T44 RESOLVED (CCEMU: DESCEND→WORK/WORK→ASCEND are genuinely connected lines, JSX seams were raster artefacts); T42 CLOSED (no longer reproduces); full CCEMU DM lifecycle captured  -  DEF-002 evidence upgraded, new untested fix candidate (14 August 2026)
SB, 14 August 2026.

**T44 RESOLVED  -  PASS.** CCEMU established the original raster
behaviour directly: DESCEND→WORK and WORK→ASCEND are visibly connected
lines in original execution; the earlier JSX blue seams were SVG/
raster-representation artefacts, not BASIC coordinate gaps. Distinct
mechanism from DEF-003's `+1`/raw-LQ offset fix, despite the
superficially similar symptom  -  DEF-003's entry updated with this
caution (two similar-looking handoff seams don't always share a root
cause). Final candidate:
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_T44_CCEMU_join_overlap2px_h2.jsx`.
Five-profile regression PASS: WD18/BT10/ACCELERATED, WD35/BT20/
ACCELERATED, WD40/BT22/ACCELERATED, REAL WD40/BT20/all staged YES,
WD16/ACCELERATED/immediate ASCEND. T44 removed from TODO.md; this
candidate is now the confirmed baseline (logged as RT-48).

**T42 CLOSED  -  PASS.** Old WD16/BT40 note said displayed bottom time
appeared slightly short of 40, but the exact figure/state was never
captured at the time. Re-run on the current baseline showed no
discrepancy, completed normally. Symptom not reproduced in recent
testing, considered superseded by the later source-/SVG-accurate
rendering work. No code change required. Removed from TODO.md.

**CCEMU display-observation tooling note.** For easier archaeology,
diagnostic BASIC line 7110 in GOSUB 7000 was changed from `PLOT 14` to
`PLOT 15`  -  makes DM characters readable in normal character form
under CCEMU, does not alter dive logic. Extremely useful; retained as
a CCEMU reference/diagnostic variant, explicitly NOT a change to
canonical DIVER.bas.

**DEF-002  -  full CCEMU DM lifecycle captured, WD40/BOTTOM TIME 20**
(the parked capture test proposed 10 August, now run). Complete visible
DM sequence: initial NOSTOP/live depth; WORK decision shows "AIR OK";
decompression obligation produces magenta "STOP10"; steady staged-WORK
row `T10:::`; staged transition `T10>15` (`T`/`>` static, numerics
flash); `T15:::`; `T15>20`; `T20:::`; "STOP10" persists through staged
WORK, initial ASCEND, and the 10m stop (confirmed refreshed at each
WORK re-initiation even where visually unchanged, consistent with the
8-entry 6950 trace); after the 10m stop, GOSUB 7500 changes display to
"STOP 5"; after the final 5m stop, GOSUB 7500 writes green "ASCEND";
final MEMORY observed directly as `21:45` / `10M 5:` / `5M 15` / red
40  -  **upgrades the previous MEMORY evidence from source-arithmetic
inference to a full end-to-end CCEMU observation** (TESTING_PLAN.md
T25 updated accordingly). Caution: the `T...` row is a LIVE COUNTDOWN
during actual decompression  -  captured values like `T18:30`/`T15:30`/
`T12:00` are mid-countdown snapshots, not fixed initial values.

Also reconfirmed, separately from DEF-002: plot-Y wraparound  -  ASCEND
can pass through the top of the 192-line plot domain and reappear at
the bottom, DECOMPRESS plotting continuing from the wrapped position.
Original behaviour, not a defect. Relevant to CoordinateSystem.md's
U14 (not closed by this alone, but corroborating). Noted in TODO.md;
HK doesn't have CoordinateSystem.md in the current working set to
update directly.

**Fix candidate built, NOT YET TESTED:**
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_T44_DEF002_DM_lifecycle.jsx`
 -  built from the confirmed T44 baseline, display-only: completes
GOSUB 7500 display behaviour (STOP 5, ASCEND, row-2 clear); corrects
GOSUB 7000 colour selection to source/CCEMU behaviour (magenta IDs 1-6/
CO=0, yellow IDs 7-18/CO=0, green/CO=1, red depth digits); retains
FL=1 blink metadata for independent flashing. Scheduler, PA, ES, event
boundaries, predictive prompting, activity creation, movement/clamp,
and decompression arithmetic untouched. Requires visual regression
before promotion  -  DEF-002 remains OPEN, not yet closed.

See DEFECT_REGISTER.md DEF-002 (updated, still OPEN), DEF-003
(updated with T44 caution); REGRESSION_TESTS.md RT-48 (new);
TESTING_PLAN.md T25 (evidentiary upgrade); TODO.md (T44/T42 removed,
baseline header updated, parked test marked run, DEF-002 candidate
added as open item, U14 note added).
### DEF-002, DEF-010, DEF-004, T14a/T14d, U04, CAPS input all RESOLVED; U25 candidate rejected; T51/T49/T25-boundaries/T52/T53 closed; DM row-2 "transient" corrected to "retained state"; 17-screenshot evidence set preserved (14 August 2026)
SB, 14 August 2026. A very large single-session batch of closures,
all confirmed scheduler-untouched throughout.

**DEF-002 RESOLVED  -  PASS.** Candidate
`..._T44_DEF002_DM_lifecycle.jsx` tested WD40/BT20/ACCELERATED, all
staged WORK proposals accepted. Full CCEMU-derived DM lifecycle
reproduced: green AIR OK; magenta STOP10; staged T10/T15/T20 display
including flashing numeric transition fields; STOP10 retained through
first ascent/10m stop; magenta STOP 5 at next decompression stage;
green ASCEND after final decompression; correct final MEMORY. Dive
completed normally, no scheduler regression. Promoted to baseline.
Logged as RT-49.

**Evidence set preserved:** seventeen chronological screenshots from
the WD40/BT20 DEF-002 investigation recovered and saved as a numbered
evidence set/ZIP  -  staged WORK transitions, STOP10, STOP 5, ASCEND,
decompression countdown, wraparound, and final MEMORY.

**Correction: the `T n::::`-type row is NOT transient.** Direct CCEMU
observation: after a staged-WORK response, the `Tn:::` row remains
static and continuously visible until the next user question causes
it to be rewritten  -  RETAINED Dive Monitor state between prompts, not
a brief rendering artefact. Earlier notes (DEF-002, DEF-014, TODO.md's
PRINT/output audit, REGRESSION_TESTS.md RT-40) describing it as
"transient" corrected accordingly.

**Caution reconfirmed:** the `T...` row becomes a LIVE COUNTDOWN
during actual decompression  -  values like `T18:30`/`T15:30`/`T12:00`
are mid-countdown snapshots, not fixed initial values.

**Also reconfirmed by the same capture:** plot-Y wraparound  -  ASCEND
can pass through the top of the 192-line plot domain and reappear at
the bottom, DECOMPRESS continuing from the wrapped position. Original
behaviour, not a defect. Relevant to CoordinateSystem.md's U14.

**DEF-010 RESOLVED  -  PASS.** Historical photograph clarified the
MEMORY geometry: the DM is the large black rectangle; MEMORY is white
text on a SEPARATE black strip exactly six characters wide, sitting
immediately above the DM, with a small cyan band still visible above
that. Fix: established DM geometry unchanged; adds the six-character
black MEMORY header; white text; header bottom touches DM; cyan area
preserved above. Visual comparison PASS. Candidate
`..._DEF010_MEMORY_heading_v3.jsx` promoted. Logged as RT-50.

**DEF-004 RESOLVED by record reconciliation  -  no new work.** The
"FIX IMPLEMENTED, NOT YET REGRESSION-CONFIRMED" status line was stale:
the 08 August WD15-20 accelerated sweep and 11 August REAL-mode
regression had already exercised exactly the DESCEND-completion
behaviour this defect concerns, and LOG.md's 13 August TODO.md cleanup
had already recorded T34/T39/T40/T41 (this defect's merged symptom
family) as closed via that formal regression  -  the DEFECT_REGISTER.md
status line just never caught up. Corrected.

**T14a/T14d RESOLVED  -  PASS.** Current JSX had equal visual spacing
between the three GOSUB 7000 text bands; BASIC routes them to rows 4,
7, and 9. Source-led mapping introduced, preserving established top/
bottom DM positions, positioning the middle row per the 3-row/2-row
source relationship. The third band needed an additional 4px downward
adjustment because the BedsteadBoldUltraCondensed JSX font renders
visually taller than the CCEMU raster characters. Candidate
`..._T14a_T14d_DM_rows_v2.jsx`  -  clear separation of NOSTOP/countdown/
AIR OK rows, no overlap. Visual PASS, promoted. Logged as RT-51.

**U04 RESOLVED  -  PASS.** CCEMU video confirmed the ID=21 depth-trend
indicator's dynamic behaviour (ripple progresses downward on DESCEND,
retreats upward on ASCEND) was already source-faithful in the existing
VA/fill logic  -  only vertical placement was wrong. Candidate
`..._U04_trend_up1.jsx` moved the complete 10-block trend stack up one
block pitch (4px), fill logic unchanged. Video review PASS: bottom of
indicator now aligns with the air indicator. Promoted. Logged as
RT-52.

**Old ASCEND-suggestion "7m" observation CLOSED/EXPLAINED  -  no code
change.** Direct CCEMU comparison confirms the green ASCEND
instruction displays alongside the normal red live-depth field  -  at
the final ASCEND→REST prompt, CCEMU shows green ASCEND with red 5
(current AD). Current JSX reproduces the same arrangement. The earlier
"7m" report was simply the ordinary red AD/depth display observed when
AD was approximately 7m, not a separate DM message or defect.

**Uppercase terminal input RESOLVED  -  PASS.** JSX accepted lower-case
activity/time-mode input but echoed it in the case typed, unlike the
Compucolor's uppercase-only convention. Candidate
`..._CAPS_input.jsx` normalises alphabetic input to uppercase on entry
for activity/YES-NO and time-mode fields; numeric WD input unaffected.
Lower-case test entries displayed immediately in uppercase, accepted
normally. PASS, promoted. Logged as RT-53.

**U25 CLOSED  -  candidate REJECTED, no code change.** The air indicator
had already been directly compared between CCEMU and JSX and found
visually correct. A later source-only reading of lines 7305-7308
suggested changing the fixed magenta-block count, but this would have
overridden stronger behavioural evidence. Candidate
`..._U25_air3magenta.jsx` REJECTED  -  must not enter the lineage.
Existing air-indicator rendering in the CAPS-input baseline remains
confirmed correct.

**T53 RESOLVED  -  PASS, no code change.** Source GOSUB 6700 skips
redrawing the air gauge when calculated VA is unchanged (`IF LA=VA
THEN 6745`); JSX doesn't implement this hardware optimisation. Direct
observation of the current baseline: air indicator remains visually
static between genuine value changes  -  no flicker, rebuild, colour
disturbance. Visually equivalent without the optimisation. Logged as
RT-57.

**T52 CLOSED  -  source behaviour present but live path unreachable, no
code change.** Source GOSUB 6900 line 6939 (`IF I>30 THEN I=-60`,
displayed as `*`) was deliberately pushed toward its boundary. JSX:
WD20/BT68 and BT69 both reached only `25>30` as the highest visible
staged-WORK requirement; BT70 entered the OUT OF RANGE/freeze path
before any `30>*` display. CCEMU independently confirmed the same
pattern: WD20/BT69 reached only `25>30`; WD20/BT70 failed at BASIC
line 1645 (`AL(AL,I)=PA(PA,I)`), consistent with an activity-array/
index limit being reached first. Strong behavioural evidence the `*`
branch is defensive/residual code, not reachable in normal execution
 -  no JSX defect demonstrated by its absence. Logged as RT-57 (combined
with T53).

**T51 RESOLVED  -  PASS, no code change.** GOSUB 6100's DT-table I/J/L
bracket search tested at a depth other than the heavily-tested WD40/
row-16 case: WD30/BOTTOM TIME 35/ACCELERATED, staged-WORK accepted.
Full dive completed normally through WORK staging, ASCEND/
decompression, and MEMORY  -  no skipped/repeated bracket behaviour,
premature OUT OF RANGE, freeze, or anomaly. Independent second-depth
confirmation. Logged as RT-54.

**T49 RESOLVED  -  PASS, no code change.** GOSUB 6850's Branch A/B
selector tested at its exact boundary: WD18/BOTTOM TIME 56/
ACCELERATED, WORK began at CL=1 giving an exact WORK endpoint of 57
minutes  -  equal to the first DT-table boundary for 18m. Source line
6852 branches only on `AL(AL,7)>DT(I,1)`, so equality correctly stays
in Branch A. Run completed normally, MEMORY showed `57:00` at WD18, no
decompression requirement introduced at the equality point. Logged as
RT-55.

**T25 MEMORY boundary coverage RESOLVED  -  PASS, no code change.** Both
previously-unconfirmed GOSUB 8000 boundaries now covered. Boundary A
(`IF WM<10 THEN NS=0`, [8062]): WD9/BOTTOM TIME 10/ACCELERATED  -  final
MEMORY showed `10:45`, restored WD 9, blank decompression rows, no
spurious requirement. Boundary B (`IF NS<0 THEN 8074`, [8063]): closed
by record reconciliation using the already-verified WD40/BOTTOM TIME
20 profile, which passes the 11-minute DT boundary and finishes at
BT=21.75 (NS<0)  -  the `21:45 / 10M 5: / 5M 15` output is exactly what
the 8074 branch produces after restoring D5=E5/DX=EX. All remaining
T25 boundary coverage complete; GOSUB 8000 source-faithful across both
shallow/no-decompression and decompression-memory paths. Logged as
RT-56.

**CCEMU diagnostic tooling note.** For display archaeology, diagnostic
BASIC line 7110 in GOSUB 7000 was changed from `PLOT 14` to `PLOT 15`
in a diagnostic-only copy  -  makes DM text readable in normal character
form under CCEMU, doesn't alter dive logic. Extremely useful; retained
as a CCEMU reference/diagnostic variant, explicitly NOT a change to
canonical DIVER.bas.

**Current confirmed baseline after today's work:**
`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_T44_DEF002_DEF010_T14a_
T14d_U04_CAPS_input.jsx`. Scheduler remains PASS/FREEZE  -  no
scheduler, PA, ES, event-boundary, predictive-prompt, activity-
creation, movement/clamp, timing, or decompression arithmetic changes
were made in any of today's fixes.

See DEFECT_REGISTER.md DEF-002/DEF-004/DEF-010/DEF-014 (all updated);
REGRESSION_TESTS.md RT-49 through RT-57 (new); TODO.md (T14a, T14d,
U04, U25, CAPS-input item, "7m" observation, T51, T49, T25-boundary
note, T52, T53 all removed; baseline header rewritten; transient
wording corrected).
### U-item closure sweep  -  14 of 15 tracked items closed; U03 converts to DEF-018 (title rendering fidelity defect, action required); T54 and the ASCEND→REST handoff close the draw-order sweep entirely (15 August 2026)
John, 15 August 2026. Large closure sweep across the UNRESOLVED
section.

**Closed/superseded, no further action, all logged in TODO.md's
single summary line:**
- **U01**  -  X-axis formula. Photographic measurement no longer used as
  an authoritative calibration method for this reconstruction;
  behavioural/visual validation of the working simulation provides
  stronger evidence than deriving exact geometry from photographs.
- **U04**  -  depth-trend-bar questions overtaken by the U04/trend_up1
  fix (14 August), already closed; speculative "conveys ascend/descend
  direction" reading not required for the reconstruction.
- **U08**  -  DM IDs 7-12 semantics/positioning fully covered by the
  later GOSUB 7000 DM lifecycle reconstruction, STOP10/STOP5 behaviour,
  MEMORY content, and T14a/T14d calibration.
- **U12**  -  PLOT 14/15 character-size uncertainty overtaken by manual
  evidence and the PLOT 15 diagnostic variant (14 August).
- **U14**  -  plot-Y wraparound directly demonstrated during genuine
  ASCEND/DECOMPRESS execution across multiple full-program CCEMU dives;
  a synthetic Y=140 test would no longer materially improve confidence.
- **U20**  -  MQ/MP comparison [6316]/[6317] live evidence requirement
  met: DESCEND equality case exercised by T54 (WD15.25/BT1/
  ACCELERATED), ASCEND equality case already central to DEF-017.
- **U21**  -  decompression-table values compared against multiple
  external dive tables including Royal Navy material; agree, no
  outstanding discrepancy.
- **U22**  -  two-significant-character variable-name limitation was a
  diagnostic/CCEMU-only artefact from a since-corrected collision, not
  relevant to the reconstructed JSX.
- **U23**  -  NS/NN/II purposes established by the GOSUB 6750/
  decompression-display reconstruction: NS holds the first no-stop/
  bound calculation, NN holds the selected remaining time for display
  after later-bound searching, II selects the relevant DM cell group.
- **U24**  -  GOSUB 5060 confirmed dead code (defined, never called)  - 
  historical fact about the surviving program, moved to DESIGN_NOTES.md.
- **U25**  -  air-gauge magenta-line discrepancy traced partly to an
  instrumented CCEMU run with line-buffer corruption; direct CCEMU-to-
  JSX comparison showed existing JSX display correct; a source-only
  3-block-count change candidate (`..._U25_air3magenta.jsx`) explicitly
  REJECTED for disagreeing with observed behaviour.
- **U29**  -  DX-never-reset-across-a-session quirk; historical, not
  relevant since the modern simulation ends at MEMORY and restarts via
  browser refresh. Already moved to DESIGN_NOTES.md (14 August).
- **U09**  -  held pending U11; U11 now resolved (below), removing the
  dependency  -  no line-count-related uncertainty remains.
- **U11**  -  minimal CCEMU A/B test: `PLOT 27,10` = vertical character
  advance (one row per character, upright); `PLOT 27,11` = restore
  normal horizontal advance from the cursor's current position. No
  evidence `PLOT 27,11` itself scrolls or repositions the cursor  - 
  earlier "scroll mode" description too broad. Separate finding: a
  single instance of each command is sufficient in a minimal test;
  DIVER.BAS's doubled occurrences aren't behaviourally required  -  why
  Dr Mallen doubled them is unknown (hardware caution, experimental
  residue, defensive programming  -  no requirement demonstrated).
  Retained as a historical source characteristic in DESIGN_NOTES.md.

**U03  -  the one exception: converts to an open action item, not a
closed question.** Direct CCEMU execution of the surviving BASIC
confirms "DIVER SIMULATION MODEL." and its dashed underline are NOT
visible in normal execution  -  lines 1265-1266 are reached, but the
terminal is still in Graphic Plot Mode from earlier screen
initialisation, so the title `PRINT` statements don't produce visible
text. A diagnostic `PLOT 255` inserted immediately before line 1265
exits Graphic Plot Mode and makes the title/underline appear correctly
at the coded positions  -  proving the mechanism was intended but the
surviving source is missing the escape that would fire it. Per this
project's standing fidelity principle (surviving executable, not
inferred intent), the JSX must NOT display the title, and the
diagnostic `PLOT 255` must NOT be incorporated into the reconstruction.
Current JSX incorrectly shows the title  -  this is a fidelity defect,
opened as **DEF-018**, action required (remove the title rendering).
T05 (the earlier "move title to bottom" compromise) is superseded by
this  -  there's no position to move it to, since it shouldn't display
at all.

**T54 RESOLVED  -  PASS.** WD15.25/BOTTOM TIME 1/ACCELERATED deliberately
exercised the DESCEND `MP=MQ` equality case in GOSUB 6300. Final
DESCEND movement not suppressed, profile reached intended depth before
WORK. A very small DESCEND→WORK visual discontinuity remains but isn't
a behavioural failure  -  consistent with minor rendering/raster handoff
effects, not the tested equality logic. Combined with DEF-017's ASCEND
equality evidence and existing `LQ=LM` coverage, closes the GOSUB 6300
equality-case question generally. No code change. Logged as RT-58.

**Draw-order sweep fully closed  -  ASCEND→REST handoff RESOLVED/PASS.**
WD16/BOTTOM TIME 10/ACCELERATED: final ASCEND reached the surface
cleanly and handed off directly into the REST horizontal segment with
no gap, overlap anomaly, backward step, duplicated stroke, or other
discontinuity. This was the last remaining candidate from the 28 July
draw-order/position-handoff sweep  -  DEF-017/DEF-007/DEF-005/DEF-009/T54
closed the rest. Sweep complete. No code change. Logged as RT-59.

**Design notes added** (see DESIGN_NOTES.md): Post-END READY display
(reproduce the BASIC interpreter's READY prompt/cursor visually after
END, without emulating interpreter functionality  -  the modern
simulation restarts via browser refresh); PLOT 27,10/27,11 duplication
(historical source characteristic, not functionally required); GOSUB
5060 dead code (moved from U24).

See DEFECT_REGISTER.md DEF-018 (new, OPEN  -  the only actionable item
from this whole sweep); TODO.md (UNRESOLVED section collapsed to one
summary line, draw-order sweep and T54 closed, T18/T05 updated);
REGRESSION_TESTS.md RT-58/RT-59/RT-60 (new); DESIGN_NOTES.md (three
new entries).
### DEF-018 RESOLVED  -  title/underline removed from JSX; diagnostic-scaffolding cleanup produces new v12 baseline lineage (15 August 2026)
SB, 15 August 2026. DEF-018 fix implemented and confirmed: JSX title
and underline removed from visible rendering, matching the surviving
BASIC's actual (non-displaying, Graphic-Plot-Mode-stuck) behaviour. No
synthetic `PLOT 255` equivalent added. The title-cell phase remains
internally only where needed to preserve established initial-screen
timing/gating. T05 stays superseded, historical context only. Logged
as RT-61.

**New baseline lineage.** Fix present in promoted `DiverSim_v12.jsx`.
Diagnostic-scaffolding cleanup then produced two sibling files, not a
supersession pair: `DiverSim_v12_READY.jsx` is a frozen forensic
baseline deliberately retaining diagnostic plumbing for the record;
`DiverSim_v12_READY_clean05.jsx` is the current presentation-lineage
candidate, with visible diagnostics, passive event logging, several
stateful diagnostic snapshots, predictive-prompt diagnostic capture,
tick tracing, and AD-block tracing all removed. clean05 tested WD16/
BOTTOM TIME 10/ACCELERATED  -  perfect PASS, no behavioural regression.
Logged as RT-62.

**Naming-collision note, worth flagging explicitly.** The rejected
11 August diagnostic candidate (added React state for ASCEND→
DECOMPRESS handoff capture, caused a DESCEND-boundary/NA=0 artefact,
discarded) was informally called "v12" in that session's notes. This
is unrelated to today's legitimate `DiverSim_v12.jsx` lineage  -  the
two share an informal version number by coincidence, not ancestry.
TODO.md's baseline header now calls this out explicitly, since
confusing the two would be exactly the kind of candidate-lineage error
this project has hit more than once before (DEF-015).

No new unresolved reconstruction issue known as of 15 August 2026.

See DEFECT_REGISTER.md DEF-018 (RESOLVED); REGRESSION_TESTS.md RT-61/
RT-62 (new); TODO.md (baseline header rewritten with naming-collision
warning).
### Presentation-lineage cleanup continues past clean05  -  DEF-019 (Tn::: persistence) and DEF-020 (WD41/BT21 SVG join gaps) found and fixed; clean11 candidate built (15 August 2026, evening)
SB, 15 August 2026, evening. Diagnostic-scaffolding removal continued
beyond clean05: clean06, clean07, clean08, and clean10 all PASS after
progressively more diagnostic/trace scaffolding removed.

**DEF-019 found and fixed.** During WD40/BT20 regression, the `Tn:::`
DM row (confirmed RETAINED state via DEF-002's CCEMU lifecycle
capture) was not persisting correctly. Pre-existing display-state
fidelity defect, not caused by the cleanup  -  the regression surfaced
it, didn't create it. Root cause: GOSUB 6750 writes were replacing the
WHOLE `boundCells` set rather than preserving untouched DM rows, so a
write meant for one row was incidentally wiping others. Fixed: GOSUB
6750 now preserves untouched rows explicitly. Confirmed PASS. `clean10`
then also passed WD41/BOTTOM TIME 21/ACCELERATED.

**DEF-020 found and fixed/accepted.** WD41/BT21  -  a profile not
previously regression-tested  -  exposed tiny visible gaps at WORK/
DECOMPRESS/ASCEND joins. A probe confirmed the underlying BASIC/SVG
handoff coordinates are themselves contiguous at both the 10m and 5m
stops  -  the cause is SVG rasterisation only, NOT a repeat of DEF-007/
DEF-017 (both already resolved at the coordinate/scheduler level) and
does not reopen either. Several rendering experiments tried and
REJECTED: extra overlap, bridge, and 3×3 join-cap candidates. Accepted
treatment: DECOMPRESS horizontals use SVG square line caps, reducing
the seam to a negligible sub-pixel artefact. John judged this PASS.

**Current candidate at end of evening session:**
`DiverSim_v12_READY_clean11.jsx`  -  built directly from clean10 with
only the accepted DECOMPRESS square-cap change. Awaiting morning
confirmation before being frozen as the new proven baseline (see
follow-up entry below  -  this was superseded by clean12 the same
overall session).

Cleanup status: frozen forensic baseline `DiverSim_v12_READY.jsx`
remains untouched, retains diagnostic plumbing. Clean lineage is still
presentation-only cleanup; scheduler remains PASS/FROZEN, not altered.
Next planned work: continue removal/classification of remaining
diagnostic/probe-only plumbing, then comment cleanup, dead-code/import
sweep, final broad regression.

**Explicit instruction, worth repeating in full:** do not reopen the
scheduler or previously closed handoff defects (DEF-007, DEF-017) on
the basis of DEF-020's tiny residual SVG seam  -  probe evidence shows
the underlying BASIC coordinates are contiguous.

### `DiverSim_v12_READY_clean12.jsx` confirmed as new presentation-lineage baseline (15 August 2026, later)
SB, 15 August 2026. `clean12` (continuing from `clean11`) passed its
confirmation sweep: WD40/BT20/ACCELERATED PASS; a second staged-WORK/
decompression run PASS; GOSUB 5900 staging unaffected; `Tn:::`
persistence, MEMORY, and READY all intact. Small SVG join gaps (DEF-020)
remain visible but are accepted as cosmetic raster artefacts, not
behavioural defects. `clean12` promoted to the confirmed presentation-
lineage baseline, superseding clean05 through clean11  -  those filenames
are now stale references. `DiverSim_v12_READY.jsx` (frozen forensic,
retains diagnostics) is unaffected and remains the separate sibling
baseline.

See DEFECT_REGISTER.md DEF-019 (RESOLVED), DEF-020 (RESOLVED  - 
accepted cosmetic variance); REGRESSION_TESTS.md RT-63 through RT-66
(new); TODO.md baseline header rewritten to name clean12.
### DEF-021 opened  -  new graphics defect found in a two-DESCEND profile (16 August 2026)
John, 16 August 2026, direct observation. A dive with two DESCEND/WORK
cycles (DESCEND → WORK → DESCEND → WORK  -  work at one depth, then
descend further and work again) shows an extra graphic at the start
of the second WORK: a spurious segment stretching from the top of the
second DESCEND down to one tick into the second WORK.

No formal repro case (WD/BT for either stage, TK mode), CCEMU trace,
or screenshot on record yet  -  flagged from live testing, not yet
investigated. Opened as DEF-021, OPEN.

Flagged explicitly as this project's first genuinely NEW profile shape
tested since the graphics-defect cluster (DEF-005/007/009/017/019/020)
closed out: every DESCEND-related fix on record so far was found and
fixed using single-DESCEND profiles. A multi-stage dive  -  descend,
work, descend further, work again  -  has never been part of any
regression sweep. Possibly the same "never independently tested until
now" pattern as DEF-005 and DEF-019 (both found only once a
previously-untried profile/regression path was actually exercised).

TODO.md's baseline header note "no new unresolved reconstruction
issue" (15 August) is now superseded.

See DEFECT_REGISTER.md DEF-021 (new, OPEN); TODO.md (new open item,
baseline header updated).
### DEF-021 update  -  repro established, probe indicates JSX rendering cause; correction to DEF-019 characterisation (16 August 2026)
John, 16 August 2026. Repro established:
`WD10 → WORK/BT10 → later DESCEND to 20 → WORK 5`. Diagnostic probe
confirms the defect occurs on the first later-DESCEND tick where the
BASIC plotting coordinates advance to the next X column: the first
later-DESCEND tick (`LP=12 LQ=12 MP=120 MQ=105`) is vertical-only and
renders correctly; the next tick (`LP=12 LQ=13 MP=105 MQ=100`) changes
BASIC coordinates in both X and Y, but current JSX Branch-1 DESCEND
rendering places a vertical rectangle at `LQ=13`, losing the `LP→LQ`
horizontal component. No cross-WORK `workDots` connection was
observed  -  that hypothesis is RULED OUT.

Status: OPEN. JSX-side cause strongly indicated (the later-DESCEND
rendering approximation), but no fix should be marked confirmed until
tested, and CCEMU comparison remains desirable before final closure.
Scheduler/movement explicitly out of scope  -  probe evidence shows the
fault is in rendering, not activity timing or depth progression.

**Correction to this project's own record:** the earlier same-day
entry describing this project's DESCEND-related fix history grouped
DEF-019 alongside DEF-005 as an example of the "never independently
tested profile" pattern, and separately listed DEF-019 in a set of
"DESCEND-related fixes" in TODO.md/DEFECT_REGISTER.md. Both were
mischaracterisations  -  DEF-019 was the `Tn:::`/GOSUB 6750 DM-row
persistence defect, entirely unrelated to DESCEND rendering. Corrected
in DEFECT_REGISTER.md DEF-021 and TODO.md's DEF-021 entry (this entry
itself is left as originally written, per LOG.md's append-only
convention  -  treat the correction here and in the other files as
authoritative going forward). The broader point those entries made
stands without DEF-019: this remains the first proper regression case
involving a genuine second DESCEND after WORK.

See DEFECT_REGISTER.md DEF-021 (updated); TODO.md DEF-021 entry
(updated, corrected).
### Activity-transition/recurrence sweep continued  -  consecutive DECOMPRESS, generalised REST rule, surface WORK/ASCEND findings; REST entries consolidated per John's instruction (16 August 2026, continued)
SB, 16 August 2026, continuing the same day's activity-transition
testing.

**Consecutive DECOMPRESS during an active stop  -  confirmed faithful.**
Selecting DECOMPRESS again at an active decompression stop, instead of
ASCEND: accepted in both JSX and CCEMU; diver remains at the current
stop depth; the additional duration is added to the existing stop;
monitor countdown continues accordingly; normal ASCEND path resumes
after the extended stop. DECOMPRESS behaves as an additional
hold-at-current-depth activity rather than a guarded one-time
transition  -  distinct failure mode from the no-obligation loop (this
one progresses correctly, just with an extended stop).

**REST generalised into one rule, per John's explicit instruction to
collapse separate observations rather than proliferate entries.**
Confirmed across multiple preceding-activity contexts (submerged,
working depth, others): REST holds the diver at current `AD` for the
entered duration, never inserts/implies ASCEND, and always terminates
via GOSUB 8000/MEMORY/END  -  final READY appears wherever REST was
entered from. DESIGN_NOTES.md and REGRESSION_TESTS.md both updated:
the previously-separate DESCEND→REST/WORK→REST entries merged into one
general-rule entry (RT-69). No further individual "X → REST" cases to
be logged unless one behaves materially differently from this rule.

**DECOMPRESS-no-obligation loop confirmed general, not surface-
dependent.** `DESCEND → ASCEND → DECOMPRESS` (at the surface) produces
the identical repeating ASCEND/DECOMPRESS cycle already seen for the
submerged cases. Existing DESIGN_NOTES entry broadened to state this
as a general rule (not logged as a fourth separate case)  -  DEF/RT-67
updated accordingly.

**Surface WORK → ASCEND  -  faithful, predictable.** With ASCEND
previously completed at the surface (AD=0): WORK (BT5) → ASCEND. WORK
accepted at AD=0, subsequent ASCEND has zero physical movement,
processing completes normally, REST follows as the terminal path.

**Surface ASCEND recurrence  -  general rule, two independent tests.**
`DESCEND → ASCEND → WORK(BT5) → ASCEND` and
`DESCEND → ASCEND → ASCEND`  -  both reach the surface via the first
ASCEND, both accept the subsequent activity at AD=0, both complete a
following zero-movement ASCEND normally and proceed to REST. General
rule: ASCEND invoked at AD=0 is a valid zero-movement activity, not
treated as an error by the scheduler.

See DESIGN_NOTES.md (REST entries consolidated, DECOMPRESS-no-
obligation entry broadened, new consecutive-DECOMPRESS/surface-WORK/
surface-ASCEND entries added); REGRESSION_TESTS.md RT-67 through
RT-71B (consolidated/updated/new).
### MILESTONE: DiverSim_v13_READY_final12_fulltrace.jsx  -  complete 575/575 BASIC source-line traceability; final regression finds two new fidelity defects (DEF-025, DEF-026); final13_regressionfix1 candidate built, not yet confirmed (17 August 2026)
SB, 17 August 2026.

**Milestone: `DiverSim_v13_READY_final12_fulltrace.jsx`.** Consolidated
the completed source-comment audit. Every surviving BASIC source line
now has an explicit, visible disposition in the JSX  -  a direct
implementation citation, a grouped/range citation where appropriate,
or an explicit historical/no-runtime-equivalent note. **575/575**
traceability achieved. Manuscript amendments preserved separately from
ordinary printed BASIC. Includes the initial [1278] bell implementation
attempt. No scheduler or dive-logic changes were intended during this
sweep. This is recorded as a genuine project milestone  -  a core
provenance property of the reconstruction  -  not merely another
superseded intermediate build, even though it was itself superseded
within the same day once its own final regression found two issues
(below).

**Final-regression findings against final12, both fidelity defects, not
historical BASIC behaviour, scheduler logic unaffected:**

1. **DEF-025 opened**  -  initial [1278] WORKING DEPTH bell not audible
   in the browser, despite `bell()` being called correctly. Invalid-
   input bells worked because they fire after a user keypress; the
   initial bell fires before any user gesture, so the browser's
   `AudioContext` was still suspended.
2. **DEF-026 opened**  -  WD40/BT20, normal dive to the first suggested
   DECOMPRESS, choose WORK, enter BT55: JSX correctly reaches OUT OF
   RANGE but incorrectly displays new coloured WORK bars before the
   error. CCEMU stops graphics at the previous valid display state,
   then shows OUT OF RANGE  -  it never draws the new WORK's graphics.

**`DiverSim_v13_READY_final13_regressionfix1.jsx` built, derived from
final12, fixing both without reopening scheduler logic:**

- **DEF-025 fix:** Web Audio handling adjusted so a suspended
  `AudioContext` is explicitly resumed before sounding the bell.
- **DEF-026 fix:** WORK display elements now associated with their
  AL/activity instance. If [6181] OUT OF RANGE occurs during GOSUB
  6100 while that WORK is being initiated, graphics belonging to that
  new WORK are rolled back before the error display  -  extends the
  existing staged-rendering principle already used around [3530]/
  GOSUB 6750 (DEF-023's fix) to this second call site.

**Status: `final13_regressionfix1` is the current TEST CANDIDATE, NOT
YET the confirmed baseline.** Two targeted tests required before any
broader regression resumes: (1) exactly one audible bell at the
initial WORKING DEPTH prompt, one per invalid WD, none extra on a
valid WD; (2) the WD40/BT20→WORK/BT55 repro must show OUT OF RANGE
with no new coloured WORK bars appearing first. Explicitly no intended
change to: predictive scheduler; PA/AL/ES behaviour; decompression
logic; activity-transition rules; historical abnormal-transition
behaviour; 575/575 BASIC source traceability.

See DEFECT_REGISTER.md DEF-025, DEF-026 (both OPEN, fix implemented,
not yet regression-confirmed); TODO.md (baseline header updated with
milestone + pending-candidate status, two targeted tests added as the
one open action item).
