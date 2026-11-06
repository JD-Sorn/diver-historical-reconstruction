# DIVER.BAS — Emulator Screenshots
# Location: reference/emulator_screenshots/
# ─────────────────────────────────────────────────────────────────────────────
# Screenshots captured during Compucolor II emulator test runs.
# Emulator: compucolor.org browser build, March 2021 version.
#
# KNOWN EMULATOR ANOMALIES — apply when interpreting all screenshots:
#   - Y-axis inversion: bar graphs render inverted relative to real hardware
#   - Row count: 32 rows — shorter than original hardware
#   - Column count: corrected to 80 columns (modified ccemu_2021_03_16.js)
#   - Colour rendering: believed accurate but not independently confirmed
#
# Naming convention: [test]_[ID]_[VA]_[YYYYMMDD].png
# Where ID and VA are not applicable, use: [test]_[desc]_[YYYYMMDD].png
#
# Each entry records: filename, date, what was tested, what was observed,
# what was concluded, and the LOG.md entry it supports.
# ─────────────────────────────────────────────────────────────────────────────

## SCREENSHOTS PRESENT

### [filename]
Date:
Test:
Observed:
Concluded:
LOG entry:


---

## SCREENSHOTS KNOWN MISSING — TO RECREATE

The following tests were run during June 2026 but screenshots were not
retained. Findings are recorded in LOG.md. Re-run each test and save
screenshot before updating this entry.

### dm_nostop.bas
Test:       IDs 1–6, VA=78,79,83,84,79,80 — NOSTOP string, green
LOG entry:  NOSTOP string — green confirmed by emulator

### dm_depth.bas
Test:       ID=19 VA=52, ID=20 VA=48 — depth digits, red
LOG entry:  Depth digits — red confirmed by emulator and photograph

### dm_bars_ID21.bas
Test:       ID=21 VA=10,5,0 — red bar full/half/empty
LOG entry:  ID=21 red bar — colour confirmed by emulator

### dm_bars_ID22.bas
Test:       ID=22 VA=13,7,0 — green/magenta bar full/half/empty
LOG entry:  Air bar (ID=22) — green with magenta bottom marker confirmed

### dm_rows.bas
Test:       IDs 7–18 — row layout confirmation
LOG entry:  DM box row layout — three text rows confirmed by emulator

### dm_pos_test1.bas
Test:       IDs 1,2,3 → A,B,C — blind cursor column mapping
LOG entry:  Blind cursor byte sequence — empirically confirmed

### dm_pos_test2.bas
Test:       IDs 1,7 → A,B — row separation confirmation
LOG entry:  Blind cursor byte sequence — empirically confirmed

### dm_pos_test3.bas
Test:       IDs 19,20 → depth digit positions
LOG entry:  Blind cursor byte sequence — empirically confirmed

### dm_6600.bas
Test:       GOSUB 6600 full sequence, AD=5.5
LOG entry:  ID=21 purpose — unconfirmed, evidence summarised

### looptrace1_WD40_TK025.png
Test:       Lines 1460–1789, WD=40, TK=0.25
LOG entry:  Lines 1460–1789 — first event fire verified

### looptrace1_WD12_TK025.png
Test:       Lines 1460–1789, WD=12, TK=0.25
LOG entry:  Lines 1460–1789 — first event fire verified

### looptrace1_WD12_TKreal.png
Test:       Lines 1460–1789, WD=12, TK=1/32
LOG entry:  Lines 1460–1789 — first event fire verified

### looptrace2_WD40_TK025.png
Test:       Lines 3400–3408, WD=40, TK=0.25
LOG entry:  Lines 3400–3408 — AD update and depth clamp verified

### looptrace2_WD12_TK025.png
Test:       Lines 3400–3408, WD=12, TK=0.25
LOG entry:  Lines 3400–3408 — AD update and depth clamp verified

### looptrace2_WD30_TK025.png
Test:       Lines 3400–3408, WD=30, TK=0.25
LOG entry:  Lines 3400–3408 — AD update and depth clamp verified

### looptrace3_ET158333_TK025.png
Test:       Lines 3010–3025, ET=1.58333, TK=0.25
LOG entry:  Lines 3010–3025 — display loop gate logic verified

---

## SCREENSHOTS STILL TO TAKE — PLANNED TESTS

# Add entries here as new emulator tests are planned.
# Move to SCREENSHOTS PRESENT once taken and saved.
