# DIVER.BAS → JSX Coverage Audit

Date: 10 August 2026

## Purpose

This audit checks the corrected canonical BASIC source (`DIVER(5).bas`) against the current working JSX candidate (`DiverSim_gosub5900_NO_replan_v4.jsx`).

The question is not merely whether a BASIC line number appears in a JSX comment. Each source block is classified by whether its behaviour is represented, deliberately replaced by a modern equivalent, intentionally omitted with evidence, still fidelity-open, or genuinely absent from the current JSX.

## Source basis

The Library contains several DIVER copies. `DIVER(5).bas` is the latest corrected 17,551-byte copy and incorporates the known canonical corrections (including 5560, 5715, 5994, 6194, 6280, 6346, 6390, 6752, 6859, 6875, 6933/6938/6942, 7240, 7502, 8065 and 8073). The current JSX audited is `DiverSim_gosub5900_NO_replan_v4.jsx`, the candidate that passed the current 5900 YES and NO/replan tests.

## Classification

- **IMPLEMENTED**  -  executable behaviour is represented in the current JSX.
- **MODERN EQUIVALENT**  -  Compucolor-specific mechanism is intentionally represented by browser/SVG/React behaviour.
- **FIDELITY OPEN**  -  the source action is represented, but visual/hardware fidelity is not settled.
- **INTENTIONALLY OMITTED**  -  source block is proven unreachable or has no required modern effect.
- **MISSING**  -  source behaviour is not present in the current JSX and requires investigation before further closure work.
- **REGRESSED/MISSING FROM CURRENT CANDIDATE**  -  project records say it was implemented, but the current audited JSX no longer contains it.

## Block audit

| BASIC lines | Purpose | Current status | Audit note |
|---|---|---|---|
| 1–780 | CLEAR, C(), DT(), A$ data and activity names | IMPLEMENTED | Core constants/tables/activity names are present in JSX and have been exercised throughout testing. |
| 1010–1277 | Initial screen construction, DM box, labels, scale | MODERN EQUIVALENT / FIDELITY OPEN | SVG/React equivalents exist. Several Compucolor PLOT/cursor details remain explicitly provisional (including some positioning and PLOT-mode interpretation). Accounted for, but not fully source-fidelity closed. |
| 1278–1445 | WD input, time mode, TK/IK/XS/YS, initial PA/ES, initial DM calls | IMPLEMENTED | Input/state setup is represented. Some comments are stale and still describe earlier stubs despite later implementation. |
| 1460–1790 | Main event loop, CL clock, AL creation, activity end-time calculation, ES reservation | IMPLEMENTED | This is the reconstructed scheduler core. Current 5900 tests confirm staged WORK entries use it correctly. |
| 1800–2200 | True event boundary, REST termination, 7500 on DECOMPRESS, PA rebuild and NEXT dispatch | IMPLEMENTED | Current JSX contains the 1888/7500 path and all five activity dispatches. 1890–1893 staged-WORK preservation is now implemented and tested. |
| 3000–3015 | Display/look-ahead gate | IMPLEMENTED | Predictive prompt and CK behaviour implemented/tested. |
| **3017** | **IF WORK THEN GOSUB 6200** | **MISSING** | No GOSUB 6200 implementation or call exists in current v4. This is a user-visible DM behaviour gap. |
| 3021–3036 | WHICH ACTIVITY prompt/input/default handling | IMPLEMENTED | Current prompt path is active and central to scheduler tests. |
| 3400–3410 | DESCEND/ASCEND depth movement and clamp | IMPLEMENTED | Verified across multiple profiles. |
| 3510–3540 | 6600/6700/6750/6800 periodic display calls | IMPLEMENTED | Functions/call sites exist; display fidelity of some cells remains open. |
| 3560–4000 | loop continuation | IMPLEMENTED | Modern loop equivalent present. |
| 5000–5055 | generic numeric input | MODERN EQUIVALENT | Implemented through React input handlers rather than one shared BASIC subroutine. |
| 5060–5099 | generic name input | INTENTIONALLY OMITTED | Canonical project record establishes GOSUB 5060 is never called anywhere in the BASIC. Retained as historical dead code, no JSX behaviour required. |
| 5300–5395 | DESCEND NEXT | IMPLEMENTED | `gosub_5300_start/resume`; validation and target depth behaviour present. |
| 5400–5495 | ASCEND NEXT | IMPLEMENTED | `gosub_5400`; derives target from HT and successor from decompression state. |
| 5500–5590 | WORK NEXT / staged decision / replan | IMPLEMENTED | YES continuation, NO→BOTTOM TIME positive replan, and non-positive→ASCEND are now tested. |
| 5600–5690 | DECOMPRESS NEXT | IMPLEMENTED | `gosub_5600`. |
| 5700–5890 | REST NEXT | IMPLEMENTED | `gosub_5700_start/resume`; minimum duration handling exists. |
| 5900–5999 | STRETCHES WORK | IMPLEMENTED | Stack construction, staging, zero-duration boundary handling and replan are in v4 and passed representative tests. OOR edge paths still need formal regression tests. |
| 6100–6199 | decompression-bound calculation; HT/DX/D5 | IMPLEMENTED | `gosub_6100` exists and has driven tested decompression routing. |
| **6200–6240** | **display “AIR OK”** | **MISSING** | No `gosub_6200`, no source-line 6200 call implementation found in current v4. This must be investigated and implemented before claiming line-complete coverage. |
| 6250–6299 | display decompression requirement at current depth | IMPLEMENTED | `gosub_6250`; DM cells are generated and merged. |
| 6300–6599 | coloured bands + diver/profile graphics | MODERN EQUIVALENT / FIDELITY OPEN | Branch logic and visual output exist. Some low-level PLOT operations are intentionally approximated/stubbed; known graphics defects remain separately tracked. |
| 6600–6699 | depth gauge | IMPLEMENTED / FIDELITY OPEN | Digits and trend output exist. PLOT 29 semantics and trend geometry remain explicitly provisional. |
| 6700–6746 | air-left gauge | IMPLEMENTED | Dynamic gauge exists and is used during dive/end refresh. |
| 6750–6799 | NOSTOP/time-to-next-bound display | IMPLEMENTED / NEEDS DISPLAY-SEQUENCE VERIFICATION | Routine exists. A dedicated CCEMU DM sequence is still desirable because the original display is difficult to read and 6200/6900 omissions may affect what is seen around it. |
| 6800–6849 | decompression countdown | IMPLEMENTED | `gosub_6800`. |
| 6850–6899 | initialise NOSTOP/time-to-next-bound rows | IMPLEMENTED | Both branches represented. |
| **6900–6949** | **display decompression requirements before staged WORK decision** | **MISSING** | Current v4 contains no `gosub_6900`. BASIC 5503 calls it immediately before printing `IS NEXT STAGE = ... MIN. REQUIRED`. This omission is likely relevant to the CCEMU DM/NOSTOP differences already noticed. |
| 6950–6999 | display next stop (STOP10/STOP5) | IMPLEMENTED | `gosub_6950`; CCEMU has now proved two calls per staged WORK initiation. Later persistence remains a display-sequence question, not an absent routine. |
| 7000–7451 | display-monitor dispatcher; text cells; depth trend; air bar | PARTLY MODERN EQUIVALENT / FIDELITY OPEN | Generic dispatch exists, including ID=22 air-bar handling. Current code still explicitly labels some ID 7–18 row mapping, PLOT 29 and related geometry as STUB/provisional. Behaviour is accounted for but not all hardware/display fidelity is closed. |
| 7500–7549 | after DECOMPRESS: clear rows, ASCEND text/HT step | IMPLEMENTED | `gosub_7500` is called at true DECOMPRESS completion and tested. |
| **8000–8100** | **MEMORY end display** | **REGRESSED / MISSING FROM CURRENT v4** | This is the largest audit finding. Current v4 `gosub_8000()` only does `AD=WD`, GOSUB 6600 and GOSUB 6700. It does **not** contain 8005/8006 MEMORY heading or the source 8020–8100 rewrite of DM IDs 1–18. Project LOG/TESTING_PLAN record that the full routine was implemented and visually demonstrated (`21:45 / 10M 5: / 5M 15 / red 40`), but that implementation is not present in the current audited candidate. The full MEMORY implementation must be restored/reintegrated before further closure. |

## Definite unaccounted source behaviour

The audit found three substantive source areas that must be resolved before we continue with ordinary edge/cosmetic work:

1. **GOSUB 6200  -  AIR OK (6200–6240), called at 3017 during WORK.** Completely absent from current v4.
2. **GOSUB 6900  -  display decompression requirements (6900–6949), called at 5503 immediately before each `IS NEXT STAGE` question.** Completely absent from current v4.
3. **Full GOSUB 8000 MEMORY (8005–8100).** Previously implemented according to the project record and demonstrated in JSX, but absent from the current v4 candidate. Current v4 has only the old/minimal 8010 depth+air refresh. This is a regression in candidate ancestry/integration, not a newly discovered source routine.

These three findings are more important than the planned RT-36/37/38 edge tests. The edge tests should be held until the current working candidate once again contains all already-known source behaviour.

## Accounted but still requiring fidelity investigation

These are not missing algorithms, but they prevent a literal “every BASIC line faithfully reproduced” claim:

- initial-screen PLOT/cursor/scroll details in 1010–1277;
- GOSUB 6300 low-level PLOT/vector/raster fidelity and known graphics defects;
- GOSUB 6600 PLOT 29 and depth-trend geometry;
- GOSUB 7000 generic DM row positioning/colour/PLOT semantics for IDs 7–18;
- exact DM/NOSTOP/STOP/AIR OK/decompression-row sequence, best settled with the planned dedicated CCEMU display-content run.

## Stale-comment warning

The current JSX contains numerous comments saying “not yet”, “STUB”, or describing an earlier implementation stage even where the code below has since been completed. Therefore comments cannot be used as the audit authority. The canonical BASIC plus current executable JSX must remain the source of truth, with TESTING_PLAN/TODO/LOG reconciled afterwards.

## Immediate recommendation

Do **not** proceed directly to the 5900 edge tests yet.

Next work should be:

1. restore/reintegrate the full GOSUB 8000 implementation into the current v4 lineage and re-run the known WD40/WORK20 MEMORY check;
2. implement and test GOSUB 6200 at its actual 3017 WORK call site;
3. implement and test GOSUB 6900 at 5503, using CCEMU to observe the DM immediately before/through staged-WORK questions;
4. rerun a short representative profile to make sure 6200/6900/8000 coexist with the now-proven 5900 scheduler;
5. only then return to RT-36/37/38 and remaining graphics/fidelity work.

## Audit conclusion

The project is much closer to complete source coverage than it was before the scheduler and 5900 work, but the answer to “has every BASIC line been dealt with?” is **no** for the current JSX candidate.

The audit has found two genuinely unimplemented live subroutines (6200 and 6900) plus one previously implemented block (full 8000) that has been lost from the current candidate lineage. These should be investigated/fixed before further closure work.
