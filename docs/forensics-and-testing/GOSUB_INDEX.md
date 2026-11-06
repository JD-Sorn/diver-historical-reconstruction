# DIVER.BAS  -  GOSUB Master Index
# Purpose: a single reference for every subroutine and every place it is called from, so call-site counts and gating conditions are established once, here, rather than re-derived (and potentially miscounted) each time a T/U-number needs them. Built directly from DIVER.bas, 05 July 2026.
# Cross-references: TESTING_PLAN.md (T/U numbers), TODO.md, LOG.md.
---

## Summary table

| Line | Subroutine (REM comment)                          | Call sites | Notes |
|------|----------------------------------------------------|-----------:|-------|
| 5000 | SUB I/P NUMBER                                     | 4          | Generic numeric-input prompt |
| 5060 | SUB I/P NAME                                       | **0**      | ⚠ Defined but never called  -  see below |
| 5300 | DESCEND NEXT                                       | 1          | Activity-selection dispatch |
| 5400 | ASCEND NEXT                                        | 1          | Activity-selection dispatch |
| 5500 | SUB WORK NEXT                                      | 1          | Activity-selection dispatch |
| 5600 | DECOMPRESS NEXT                                    | 1          | Activity-selection dispatch |
| 5700 | REST NEXT                                          | 1          | Activity-selection dispatch |
| 5900 | SUB STRETCHES WORK                                 | 1          | Called from within 5500 |
| 6100 | SUB TESTS IF DECOMP BOUND WILL BE CROSSED...        | 1          | WORK-initiation (T26) |
| 6200 | SUBROUTINE DISPLAYS "AIR OK"                       | 1          | Gated: `IF AL(AL,1)=3` (WORK) |
| 6250 | SUB DISPLAYS DECOMP RMTS TO BE SATISFIED AT DEPTH  | 1          | DECOMPRESS-initiation (T26); see U08 |
| 6300 | SUB COLOURED BANDS                                 | 1          | Two branches inside  -  see T18, T24/U07 |
| 6600 | SUB DEPTH GAUGE                                    | 3          | See T19/T19b  -  RESOLVED, 3 sites confirmed |
| 6700 | SUB AIR LEFT                                       | 3          | Same 3 sites as 6600 (called immediately after each time) |
| 6750 | SUB DISPL. NOSTOP TIME REMAIN OR REMAIN TO NXT BOUND| 1          | Main loop, unconditional  -  see U18 |
| 6800 | SUB COUNTS DOWN TOTAL DT RQMNTS                    | 1          | Gated: `IF AL(AL,1)=4` (DECOMPRESS)  -  see U18 |
| 6850 | SUB INITIALISES NOSTOP/TIME TO NEXT BOUND          | 1          | WORK-initiation (T26), paired with 6950 |
| 6900 | SUB DISPL DECOMP RQMNTS                            | 1          | Inside "SUB WORK NEXT" (5500)  -  see U18 |
| 6950 | SUB DISPLAYS NEXT HT TO STOP AT WHEN ASCENDING     | 2          | WORK-initiation (T26)  -  precomputes the ascent-stop, doesn't run during ASCEND itself |
| 7000 | SUB DISPLAY MONITOR                                | ~78        | DM digit writer  -  called from almost every other subroutine; see breakdown below |
| 7500 | SUB WHEN FINISHED DECOMP.                          | 1          | Gated: `IF AL(AL,1)=4` (DECOMPRESS)  -  see U18 correction |
| 8000 | DISPLAYS MEMORY AT END                             | 1          | End-of-dive |

**U24:** GOSUB 5060 ("SUB I/P NAME") is defined but has zero call sites
anywhere in the listing. Assigned a U-number rather than left as an
unassigned candidate (05 July 2026)  -  dead code, a leftover from an
earlier draft of the program, or called via some indirect mechanism not
yet identified (e.g. computed GOSUB, which DIVER.BAS does not appear to
use elsewhere). Not yet investigated further. See TODO.md U24,
TESTING_PLAN.md U24.

---

## Full call-site detail (all subroutines except 7000  -  see breakdown below)

### 5000  -  SUB I/P NUMBER (generic numeric input prompt)
- `1280 M$="WORKING DEPTH " : GOSUB 5000 : WD=M`  -  dive setup, one-off.
- `5315 PRINT CHR$(7);:M$="TO WHAT DEPTH":GOSUB 5000`  -  inside DESCEND NEXT (5300).
- `5509 PLOT 3,0,0:PA=1:PRINT CHR$(7);:M$="BOTTOM TIME":GOSUB 5000:PA(1,2)=M`  -  inside SUB WORK NEXT (5500).
- `5710 M$="FOR HOW LONG": GOSUB 5000 : PA(PA,2)=M`  -  inside REST NEXT (5700).

### 5060  -  SUB I/P NAME
- No call sites found. See U24 above.

### 5300  -  DESCEND NEXT
- `2020 GOSUB 5300:GOTO 2200`  -  activity dispatch, `ON NA GOTO 2020,2050,2080,2110,2140` (line 2010), NA=1.

### 5400  -  ASCEND NEXT
- `2050 GOSUB 5400:GOTO 2200`  -  activity dispatch, NA=2.

### 5500  -  SUB WORK NEXT
- `2085 GOSUB 5500`  -  activity dispatch, NA=3. Followed by `2090 IF KJ=0 THEN 2200` / `2100 NA=2:GOTO 1900` (loops back to re-prompt if KJ flag set).

### 5600  -  DECOMPRESS NEXT
- `2110 GOSUB 5600:GOTO 2200`  -  activity dispatch, NA=4.

### 5700  -  REST NEXT
- `2140 GOSUB 5700`  -  activity dispatch, NA=5.

### 5900  -  SUB STRETCHES WORK
- `5550 GOSUB 5900`  -  called from inside SUB WORK NEXT (5500), unconditional within that routine.

### 6100  -  SUB TESTS IF DECOMP BOUND WILL BE CROSSED...
- `1692 GOSUB 6100`  -  WORK-initiation branch (line 1665's `ON AL(P,1) GOTO
  1670,1680,1690,1700,1710` dispatch; AL(P,1)=3=WORK per U18 selects 1690),
  fires every time a new WORK period begins, alongside 6950/6850 (lines
  1690-1695). NOT one-off/dive-start  -  corrects an earlier same-session
  mischaracterisation. See TODO.md T26, LOG.md 05 July 2026.

### 6200  -  SUBROUTINE DISPLAYS "AIR OK"
- `3017 IF AL(AL,1)=3 THEN GOSUB 6200`  -  main loop, gated on WORK(3) only.

### 6250  -  SUB DISPLAYS DECOMP RMTS TO BE SATISFIED AT THIS DEPTH
- `1701 GOSUB 6250`  -  DECOMPRESS-initiation branch (line 1665's dispatch,
  AL(P,1)=4=DECOMPRESS selects 1700), fires every time a new DECOMPRESS
  period begins, not one-off/dive-start. See U08 (IDs 13-18 resolved via
  this routine), TODO.md T26.

### 6300  -  SUB COLOURED BANDS
- `3410 GOSUB 6300`  -  main loop, reached via the shared `3400` gate (runs regardless of activity type once `AL(AL,1)` branch resolves AD). Two branches inside this subroutine  -  Branch 1 (descent profile, vector mode, see T18) and Branch 2 (coloured bands, Y Bar Graph mode, see T24/U07). SELECTOR CONFIRMED (17 July 2026): line 6312, `IF AL(AL,1)=3 THEN 6330`  -  the single, plain condition. `AL(AL,1)=3` (WORK) routes to line 6330 (Branch 2, opens with `Y3=INT(140-BB*YS)`, matches T24a's setup); any other value falls through to line 6313 onward (Branch 1, the `MP`/`MQ` vector-plot logic). Same condition as GOSUB 6200's gating  -  not a more complex or multi-part check. Previously undocumented; every prior reference to this branch split just said "two branches inside" without citing the actual selector.

### 6600  -  SUB DEPTH GAUGE  -  RESOLVED, see T19/T19b
- `1445 GOSUB 6600:GOSUB 6700`  -  initial paint, one-off.
- `3510 GOSUB 6600`  -  main loop, unconditional, reached identically by all 5 activity types.
- `8010 AD=WD: GOSUB 6600:GOSUB 6700`  -  MEMORY end-of-dive screen. No accompanying GOSUB 6750 (see LOG.md).

### 6700  -  SUB AIR LEFT
- Same 3 call sites as 6600 (`1445`, `3520`, `8010`), always called immediately after 6600 in each case.

### 6750  -  SUB DISPL. NOSTOP TIME REMAIN...
- `3530 GOSUB 6750`  -  main loop, unconditional (every tick, all activities). Not called at 8010 (MEMORY)  -  no NOSTOP display once the dive is over. See U18.

### 6800  -  SUB COUNTS DOWN TOTAL DT RQMNTS
- `3540 IF AL(AL,1)=4 THEN GOSUB 6800`  -  main loop, gated on DECOMPRESS(4) only, same tick as 6750, immediately after it (6750 writes first, 6800 overwrites  -  see U18).

### 6850  -  SUB INITIALISES NOSTOP/TIME TO NEXT BOUND
- `1694 GOSUB 6850:GOSUB 6950`  -  WORK-initiation branch (line 1665's
  dispatch, AL(P,1)=3=WORK selects 1690), fires every time a new WORK
  period begins, paired with 6950. Not one-off/dive-start.

### 6900  -  SUB DISPL DECOMP RQMNTS
- `5503 GOSUB 6900:M=PA(PA,2):PLOT 3,0,0:PRINT :PLOT 6,48,3,0,0`  -  inside SUB WORK NEXT (5500), not part of the tick loop at all; fires immediately before the "IS NEXT STAGE = n MIN REQUIRED" prompt. See U18.

### 6950  -  SUB DISPLAYS NEXT HT TO STOP AT WHEN ASCENDING
- `1693 GOSUB 6950`  -  WORK-initiation branch (line 1665's dispatch,
  AL(P,1)=3=WORK selects 1690). Its name describes what its output is
  about (the ascent that will eventually follow), not which activity
  calls it  -  a naming trap that led to an earlier same-session
  mischaracterisation of this whole branch as ASCEND. Not one-off/
  dive-start.
- `1694 GOSUB 6850:GOSUB 6950`  -  same branch, called again immediately
  after 6850 in the same line.

### 7500  -  SUB WHEN FINISHED DECOMP.
- `1888 IF AL(AL,1)=4 THEN GOSUB 7500`  -  gated on DECOMPRESS(4). Writes the diver's NEXT activity's label when a DECOMPRESS event ends, not the current one  -  see U18 correction (05 July 2026), which fixed an earlier working guess that this fired on ASCEND(2).

### 8000  -  DISPLAYS MEMORY AT END
- `1815 GOSUB 8000`  -  end-of-dive, one-off, immediately before `1820 END`.

---

## GOSUB 7000 (SUB DISPLAY MONITOR)  -  breakdown by caller

Called roughly 78 times across the listing  -  far too many to list individually
and not useful to (each call just writes one DM digit/field via a specific
`ID=`/`VA=` pair). More useful broken down by which routine calls it:

| Calling context                              | Approx. calls |
|-----------------------------------------------|---------------:|
| 8000 (DISPLAYS MEMORY AT END)                  | 17 |
| 6850 (SUB INITIALISES NOSTOP/TIME TO NEXT BOUND)| 11 |
| Pre-5000, activity-initiation dispatch (lines 1665-1710, T26)  -  recurs every time a new activity begins, not one-off | 7 |
| 6750 (SUB DISPL. NOSTOP TIME REMAIN...)         | 7 |
| 6200 (SUBROUTINE DISPLAYS "AIR OK")             | 6 |
| 6900 (SUB DISPL DECOMP RQMNTS)                  | 6 |
| 7500 (SUB WHEN FINISHED DECOMP.)                | 6 |
| 6250 (SUB DISPLAYS DECOMP RMTS AT THIS DEPTH)    | 5 |
| 6800 (SUB COUNTS DOWN TOTAL DT RQMNTS)          | 5 |
| 6950 (SUB DISPLAYS NEXT HT TO STOP...)          | 4 |
| 6600 (SUB DEPTH GAUGE)                          | 3 |
| 6700 (SUB AIR LEFT)                             | 1 |

Every ID/VA pair written via these calls maps to a specific DM field  - 
this is the routing already tracked in TODO.md's T14a/T14c/T14d/T15a/T21
entries, not duplicated here. This table exists to show *which subroutine*
is responsible for *how much* of the DM box content, at a glance.

---

## Open questions this raises (not yet added elsewhere)

- U24: GOSUB 5060 has zero call sites  -  see note above.
- 6300's two branches share one call site (3410) but branch internally  - 
  worth confirming whether both branches always execute on every call, or
  whether one is conditionally skipped, when T24/U07 gets its full pass.
