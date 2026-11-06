# DIVER.BAS Reconstruction  -  Briefing for a New SB Session

**Regenerated: 15 August 2026**  
**Purpose:** fast handover to a fresh Sandbox/SB instance. This is not append-only. It replaces the older SB briefing for orientation only; permanent history belongs in LOG.md / TESTING_PLAN.md / DEFECT_REGISTER.md / REGRESSION_TESTS.md.

---

## 1. What this project is

Reconstructing `DIVER.BAS`, a 1978/79 diving-simulation BASIC program written by Dr George Mallen for Dagfinn Aksnes' RCA work, originally associated with Compucolor/Intecolor 8001-family hardware, as a modern React/JSX simulation with **behavioural and historical fidelity**.

The aim is not to modernise the UX or "improve" odd source behaviour. Where the surviving BASIC behaves strangely but CCEMU confirms it, reproduce the behaviour unless there is explicit evidence that the surviving source itself is defective.

John is the historical/source owner and runs CCEMU tests. SB writes/tests JSX candidates and reasons from BASIC/CCEMU evidence. HK maintains the append-only records and project documentation; HK may lag the very latest SB findings, so this briefing deliberately includes the 14–15 August closure work that may not yet be reflected in TODO/LOG.

---

## 2. FILES THE NEW SB INSTANCE NEEDS IMMEDIATELY

Read these **before proposing any code change**:

1. **`DiverSim_v12.jsx`**  -  CURRENT BEHAVIOURAL BASELINE, created 15 August 2026.  
   This is the file to work from. If it is not visible in the new chat, ask John to attach it immediately.

2. **`STYLE_GUIDE.md`**  -  translation/commenting conventions.  
   Historical-first comments only: explain what BASIC did and how JSX reproduces it. Do not leave test-number/process commentary in presentation code.

3. **`DIVER(5).bas`** (or the currently identified corrected canonical `DIVER.bas`)  -  canonical surviving BASIC source.  
   Do not substitute an older copy.

4. **`SCHEDULER_SPEC.md`**  -  scheduler philosophy and behavioural rules.  
   Read this before touching anything near PA/ES/AL, prompts, timing, activity creation or movement/clamp.

5. **Latest `REGRESSION_TESTS.md`**  -  existing regression obligations.

6. **Latest `TODO.md`, `DEFECT_REGISTER.md`, `TESTING_PLAN.md`**  -  useful, but treat unresolved-U entries cautiously until HK has caught up with this briefing. A major U-item closure sweep happened 15 August.

7. **`CoordinateSystem.md` and `SCREEN_SPECS.md`**  -  only when working on Compucolor display geometry.

8. **`PLOT Manual.docx` / `DETAIL OF GRAPHIC PLOT SUBMODES.docx`**  -  only when a hardware/PLOT question genuinely requires them.

9. **`LOG.md`**  -  consult selectively when the exact historical chain of a finding matters; do not read the whole thing as a prerequisite.

### Critical lineage warning

There was an **older rejected diagnostic candidate called "v12" on 11 August**. It added React state for ASCEND→DECOMPRESS diagnostics and perturbed scheduler timing. It was rejected and must never be treated as an ancestor.

**The current official `DiverSim_v12.jsx` is completely different.** It was created 15 August from the confirmed v11 lineage and is the new promoted baseline. The reused version number is intentional and supersedes the rejected diagnostic branch.

---

## 3. HARD RULE: SCHEDULER IS PASS / FREEZE

The scheduler is proven enough to be treated as frozen.

**Do not alter**:

- predictive prompting / look-ahead;
- PA, ES or AL semantics;
- event boundaries;
- activity creation;
- DESCEND/ASCEND movement or clamp ordering;
- TK/IK timing;
- WORK staged-activity scheduling;
- DECOMPRESS/REST termination;
- React state that can change timing/render cadence around the scheduler;

unless **new behavioural evidence from canonical BASIC or observed CCEMU execution** requires it.

The project has already lost time to diagnostic instrumentation perturbing the scheduler. Do not add React state merely to observe a tick path when a ref/log or static calculation will do.

---

## 4. EVIDENCE HIERARCHY

1. **Observed CCEMU execution of the canonical BASIC** is the strongest behavioural evidence.
2. Canonical `DIVER(5).bas` defines the surviving source.
3. Historical photographs are useful for gross appearance, but John no longer wants exact geometric calibration inferred from photo measurements.
4. Manual/document evidence explains hardware semantics.
5. JSX is the reconstruction, never the authority over BASIC/CCEMU.

When source reading and CCEMU behaviour disagree, report the disagreement. Do not "correct" CCEMU to fit a static interpretation.

---

## 5. CURRENT BASELINE  -  `DiverSim_v12.jsx`

`DiverSim_v12.jsx` descends from the confirmed lineage:

`DiverSim_v11_DEF017_DEF007_DEF005_DEF009_T44_DEF002_DEF010_T14a_T14d_U04_CAPS_input.jsx`

The v12 promotion makes one deliberately narrow behavioural change:

### DIVER SIMULATION MODEL title removed

Canonical BASIC contains:

```basic
1265 PRINT : PLOT 3,29,43:PRINT "DIVER SIMULATION MODEL."
1266 PLOT 3,29,44:PRINT "-----------------------"
```

Direct CCEMU testing proved:

- normal canonical execution **does not visibly print the title or underline**;
- adding a diagnostic `PLOT 255` immediately before line 1265 makes both appear at the coded position;
- therefore the surviving program reaches the title code while the terminal is still in Graphic Plot Mode;
- the missing Plot Escape is a latent source/display omission, not something to repair in the JSX.

**Behavioural fidelity requires the JSX title and underline to remain invisible.**

`DiverSim_v12.jsx` therefore retains the source/title-cell phase for established initial-screen timing/gating but intentionally renders no visible title or underline.

Do **not** add a synthetic `PLOT 255` equivalent.

---

## 6. RECENTLY RESOLVED GRAPHICS / DISPLAY DEFECTS

These are all CLOSED/PASS and must not be casually reopened.

### DEF-017  -  ASCEND→DECOMPRESS start step  -  RESOLVED

REAL WD40 showed a small start-step. Raw handoff X-grid was already exact. Cause was final ASCEND movement quantising to `MP===MQ` after BASIC `INT`, which JSX misclassified as flat.

Fix preserves ASCEND paint on the target tick via an `isAscendTargetTick` exception.

Regression passed.

### DEF-007  -  DECOMPRESS→ASCEND visible gap  -  RESOLVED

BASIC coordinates were contiguous; SVG rasterisation created a seam between a 2px butt-capped line and following rect. Fixed with a narrowly scoped 1px overlap only at first ASCEND rect after DECOMPRESS.

### DEF-005  -  ASCEND hidden behind WORK/DT mountain  -  RESOLVED

SVG group order did not match sequential BASIC PLOT order. `profileSegs` moved after `bandSegs`.

### DEF-009  -  DESCEND X-position  -  RESOLVED

DESCEND incorrectly inherited `LQ+1`. Direct CCEMU/probe evidence established raw `LQ` for DESCEND, retaining the WORK-specific handoff behaviour elsewhere.

### T44  -  DESCEND→WORK / WORK→ASCEND seam  -  RESOLVED

CCEMU showed connected joins. JSX mixed line/rect raster seams were corrected with narrow WORK-specific bridge geometry. No scheduler changes.

### DEF-002  -  STOP10 / STOP5 / DM lifecycle  -  RESOLVED

Full CCEMU lifecycle established and implemented:

- WORK prompt → green `AIR OK`;
- decompression requirement → magenta `STOP10`;
- staged WORK row sequence such as `T10>15`, `T15>20`;
- `Tn:::` rows are **persistent until the next question rewrites them**, not transient;
- STOP10 persists through staged WORK / first ASCEND / 10m stop;
- after 10m stop GOSUB7500 changes it to `STOP 5`;
- after final 5m stop GOSUB7500 writes green `ASCEND`;
- final MEMORY for WD40/BT20: `21:45`, red `40`, `10M 5:`, `5M 15`.

### DEF-010  -  MEMORY heading  -  RESOLVED

Historical appearance: separate six-cell black strip immediately above DM, white `MEMORY`, small cyan band above. v3 placement passed.

### T14a/T14d  -  DM rows  -  RESOLVED

Rows 4 / 7 / 9 mapped into DM box, with the accepted empirical row-9 +4px font nudge. Passed.

### U04  -  depth trend bar  -  RESOLVED

Direct CCEMU comparison confirmed current behaviour; bar moved one position higher and passed.

### Uppercase input fidelity  -  RESOLVED

WD / time-mode / activity inputs display uppercase to match the terminal convention.

### U25  -  air indicator  -  CLOSED/PASS

A proposed source-only three-block change was rejected because direct CCEMU↔JSX comparison showed the existing appearance was correct. Observed CCEMU behaviour wins.

### T53  -  air redraw-skip  -  RESOLVED/PASS

No visible flicker; no code change.

### T51 / T49 / T25 / T54  -  source boundary coverage  -  RESOLVED/PASS

- T51: DT-table bracket search at WD30/BT35.
- T49: exact GOSUB6850 equality at WD18/BT56.
- T25: both remaining GOSUB8000 MEMORY boundary branches.
- T54: GOSUB6300 equality coverage, including DESCEND `MP=MQ`; combined with earlier ASCEND equality evidence.

### ASCEND→REST handoff sweep  -  RESOLVED/PASS

WD16/BT10/ACCELERATED. Clean surface handoff into REST; no gap/backstep/cap/duplicate stroke.

---

## 7. U-ITEM CLEANUP  -  15 AUGUST

Most old U-items were archaeology from an earlier reconstruction stage and are no longer active engineering work.

Closed / superseded:

- **U01**  -  closed; no longer relying on exact measurements from photographs.
- **U04**  -  closed/superseded by direct CCEMU trend-bar comparison.
- **U08**  -  closed/superseded by full DM lifecycle + T14 row work.
- **U09**  -  closed after U11; 25-line hardware confirmed and no remaining line-count dependency.
- **U11**  -  resolved by isolated CCEMU A/B tests:
  - one `PLOT 27,10` selects vertical character advance;
  - one `PLOT 27,11` restores horizontal advance;
  - neither requires duplication under CCEMU;
  - `27,11` itself showed no scroll/reposition effect.
  The doubled pairs in DIVER.BAS are retained only as an unexplained historical source characteristic.
- **U12**  -  closed; PLOT14/15 question overtaken by manual and direct diagnostic evidence.
- **U14**  -  closed/superseded; real-dive CCEMU execution already demonstrated Y wrap behaviour.
- **U20**  -  closed/superseded by T54 + DEF-017 equality evidence.
- **U21**  -  closed; Dr Mallen's DT values agree with multiple external dive tables including Royal Navy material.
- **U22**  -  closed; two-significant-character variable-name issue no longer relevant.
- **U23**  -  closed/superseded; NS/NN/II roles now understood through GOSUB6750/MEMORY work.
- **U24**  -  closed as historical observed anomaly: GOSUB5060 exists but has no call site; do not invent one.
- **U25**  -  closed/superseded by direct CCEMU air-gauge comparison.
- **U29**  -  closed as historical quirk/non-issue for JSX; DX persistence across hypothetical second dive in same BASIC session is not relevant to normal browser-reload usage.

### U03  -  title/FRAME question  -  RESOLVED by 15 Aug CCEMU title investigation

The title itself does not display in canonical execution because the source omits a `PLOT 255` escape before lines 1265–1266. Current v12 removes the JSX title accordingly.

Do not keep U03 open as a title-placement investigation.

---

## 8. IMPORTANT COMPucolor ARCHAEOLOGY FINDINGS FROM 15 AUGUST

### PLOT 27 vertical/horizontal mode

Minimal CCEMU programs established:

- `PLOT 27,10` → subsequent text advances vertically, characters upright;
- omit `27,11` → later text continues vertically;
- `PLOT 27,11` → subsequent text resumes ordinary horizontal advance from current cursor location;
- one command each is sufficient, despite DIVER.BAS issuing each twice.

Do not describe `PLOT 27,11` simply as "scroll mode" in future comments. The isolated test did not show scrolling.

### Plot Escape and the missing title

`PLOT 255` is Plot Escape. Adding it diagnostically before line 1265 makes the otherwise invisible title appear. This is the explanation for the long-standing title discrepancy.

Again: **do not fix the BASIC's apparent omission in the JSX. The JSX follows observed canonical execution.**

---

## 9. OTHER CLOSED / STALE ITEMS NOT TO REOPEN

- T42 old "bottom time a bit short" observation  -  CLOSED; current baseline shows no discrepancy.
- T50 / RT-36  -  already PASS/closed.
- T55 / RT-37  -  already PASS/closed.
- RT-38 both GOSUB5900 OUT OF RANGE exits  -  PASS.
- T52 `*` branch in GOSUB6900  -  CLOSED as apparently unreachable/redundant in live normal execution; WD20/BT70 errors earlier at BASIC line 1645.
- "7m on ASCEND suggestion"  -  CLOSED/EXPLAINED: green ASCEND from GOSUB7500 and live depth display, no defect.

Before acting on any old TODO row, check whether it has been superseded by the 14–15 August work above.

---

## 10. CURRENT HISTORICAL DISPLAY BEHAVIOUR TO PRESERVE

- CCEMU can wrap plot-Y through the top of the 192-line plot domain and reappear at the bottom; subsequent DECOMPRESS continues from the wrapped position. This is source/hardware behaviour, not a JSX bug to "tidy".
- `Tn:::` DM row remains visible after staged-WORK response until a later user question rewrites that row.
- final MEMORY restores working depth in red and shows saved decompression values exactly as source formats them.
- no modern UX smoothing of predictive prompts, odd screen timing, or terminal behaviour.

---

## 11. NEXT STEPS  -  START HERE

### Step 1  -  smoke-test `DiverSim_v12.jsx`

Before doing new work, run one concise sanity profile to prove the title suppression did not perturb anything:

- initial screen: **no `DIVER SIMULATION MODEL.` title / underline**;
- WD input still activates normally;
- run a straightforward ACCELERATED dive;
- confirm final MEMORY still appears correctly.

No broad regression is needed yet unless this smoke test exposes a problem.

### Step 2  -  add post-END `READY` / cursor visual fidelity

Historical photograph and CCEMU show BASIC interpreter `READY` and cursor after DIVER reaches `END`.

Agreed design:

- render `READY` and cursor visually after program completion;
- non-interactive;
- no RUN/LIST/interpreter emulation;
- no new scheduler state;
- browser refresh is the modern restart mechanism.

This is presentation fidelity only and must remain outside frozen scheduler logic.

### Step 3  -  freeze/archive forensic baseline

Once v12 + post-END READY are verified, preserve a diagnostic-rich baseline intact as forensic reference.

### Step 4  -  create clean presentation lineage

Remove or quarantine:

- diagnostic panels;
- temporary probes/traces;
- stale "not yet"/"STUB" comments that no longer describe the code;
- rejected-experiment residue;
- dead investigation-only branches;
- process/test commentary embedded in production JSX.

Retain:

- historical BASIC comments;
- comments explaining modern JSX equivalents;
- source-fidelity exceptions that future maintainers could otherwise "correct" incorrectly;
- optionally long-term diagnostics behind a separate debug switch if genuinely useful.

### Step 5  -  full regression after cleanup

Only after cleanup run the full regression suite, with representative ACCELERATED and REAL profiles, especially WD16 and WD40/decompression paths.

The purpose then is not to rediscover the scheduler but to ensure presentation cleanup introduced no regression.

---

## 12. DEFERRED / NON-BLOCKING HISTORICAL WORK

- DEF-001  -  track shape versus 1979 photograph: defer until genuinely better matched photographic evidence appears.
- Historical provenance / Zenodo packaging.
- Hardware oddities that do not affect current DIVER behaviour should be documented, not allowed to derail completion.
- If a clearer original photograph surfaces later, compare qualitatively; do not reintroduce photo-derived pseudo-precision as the geometry authority.

---

## 13. WORKING CONVENTIONS FOR THE NEW SB

- John is rigorous and will run exact CCEMU tests when they add real value; do not ask for tests merely because an old TODO number exists.
- Prefer one narrow hypothesis/test at a time.
- Distinguish PASS, FAIL, CLOSED/SUPERSEDED and DEFERRED explicitly.
- Do not call a profile or mechanism generally proven from one isolated run.
- Do not conflate source intent with executed behaviour.
- Do not treat a source comment or old JSX comment as authority over observed canonical execution.
- When a result closes an issue, give John concise text suitable for HK.
- Avoid candidate-name sprawl now that `DiverSim_v12.jsx` is the promoted baseline. Use a short descriptive suffix only for genuinely experimental branches, then promote back to a clean base name after PASS.

---

## 14. ONE-SENTENCE STATE OF THE PROJECT

**DIVER is now a substantially working, source-complete reconstruction with the scheduler frozen and the major display/DM/handoff defects closed; `DiverSim_v12.jsx` is the new behavioural baseline, the long-standing invisible-title mystery is resolved, and the immediate work is a smoke test, post-END READY/cursor fidelity, then forensic freeze → presentation cleanup → full regression.**
