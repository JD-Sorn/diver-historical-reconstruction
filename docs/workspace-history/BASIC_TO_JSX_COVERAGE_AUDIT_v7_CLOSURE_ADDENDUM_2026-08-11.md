# DIVER.BAS → JSX Coverage Audit  -  v7 Closure Addendum

Date: 11 August 2026

## Scope

Second-pass source-coverage audit of the corrected canonical `DIVER(5).bas` against
`DiverSim_gosub5900_NO_replan_v7_GOSUB6900.jsx`.

This addendum updates the 10 August audit after restoration/implementation and live
testing of GOSUB 8000, GOSUB 6200 and GOSUB 6900.

## Result

No additional live BASIC subroutine has been found missing from the current JSX.

The canonical BASIC contains 21 live GOSUB targets:

5000, 5300, 5400, 5500, 5600, 5700, 5900, 6100, 6200, 6250, 6300,
6600, 6700, 6750, 6800, 6850, 6900, 6950, 7000, 7500 and 8000.

All are now accounted for in v7:

- 5000 is represented by the React numeric-input handlers rather than a shared
  literal subroutine.
- 5300, 5400, 5500, 5600, 5700, 5900, 6100, 6200, 6250, 6600, 6700,
  6750, 6800, 6850, 6900, 6950, 7000, 7500 and 8000 have explicit JSX
  equivalents.
- 6300 is represented inline in the dive-tick/rendering machinery rather than by
  a function named `gosub_6300`.
- 5060 exists in the BASIC listing but has no GOSUB caller anywhere in the
  canonical program. It remains classified as unreachable historical source and
  does not require runtime JSX behaviour.

The handwritten/transcribed line 5561 (`# ERROR MESSGE - HAND-WRITTEN`) is not an
executable BASIC statement and is treated as source annotation, not missing JSX.

## Previously missing items now closed at coverage level

### GOSUB 8000  -  MEMORY

Restored into the current scheduler/5900 lineage and re-tested.

WD40 / ACCELERATED / WORK20 completed with the established final MEMORY display,
including 21:45 and the two decompression rows. PASS.

### GOSUB 6200  -  AIR OK

Implemented at the real source call site, line 3017.

Observed on WD16 and WD40 profiles. `AIR OK` appears whenever WORK is the current
activity at the predictive activity question and the third DM row is otherwise
blanked/overwritten later. Functional PASS.

Colour and exact display styling remain fidelity questions.

### GOSUB 6900  -  staged-WORK decompression requirement

Implemented at source line 5503 immediately before `IS NEXT STAGE...`.

WD40 / WORK20 observed sequence:

- first staged question: blank (`D5+DX=0`);
- second: `T10>15`;
- third: `T15>20`.

Functional PASS.

The separate transient `T n::::`-type row seen immediately afterward remains an
unresolved display-sequence observation; it is not explained by 6900 itself.

## Coverage conclusion

At the source-coverage level, every live executable BASIC routine and every live
GOSUB target is now accounted for by the current JSX or by an explicit modern
equivalent.

This does **not** mean every source line is visually/hardware-faithful.

The remaining work is now in two different categories:

### Fidelity/open display mechanism

- initial-screen Compucolor PLOT/cursor/scroll details;
- GOSUB 6300 low-level plotting and newly confirmed transient L/step construction;
- GOSUB 6600 PLOT-29/depth-trend geometry;
- GOSUB 7000 exact row positioning, colour and PLOT semantics, especially IDs 7–18;
- exact DM write/overwrite sequence, including the unresolved transient
  `T n::::`-type display;
- colour verification for AIR OK and related DM messages.

### Regression/edge coverage

- RT-36: GOSUB 5900 below 10 m and exactly 10 m;
- RT-37: TK/minimum-duration behaviour in REAL and ACCELERATED modes;
- RT-38: both distinct GOSUB 5900 OUT OF RANGE paths;
- broader representative end-to-end regression on the now source-complete
  scheduler/5900/DM lineage.

## Development implication

There is no longer a known hidden live BASIC routine that should block ordinary
regression work.

Future display discoveries should be classified first as:

1. missing source behaviour;
2. incorrect translated behaviour;
3. static visual fidelity difference;
4. temporal/display fidelity difference;
5. emulator-specific anomaly.

Do not alter JSX merely because CCEMU shows a transient effect until the source
operation responsible has been identified.

## Archaeological note

The CCEMU video has added a new evidence class: temporal display construction.
Repeated L-shaped/stepped plotting behaviour is clearly systematic under emulation,
but CCEMU is known to have display bugs (for example spurious LF behaviour).
Use CCEMU structurally rather than pixel-literally: repeated behaviour that
corresponds with source PLOT logic is strong evidence for the construction method,
not proof of exact original-hardware timing or appearance.
