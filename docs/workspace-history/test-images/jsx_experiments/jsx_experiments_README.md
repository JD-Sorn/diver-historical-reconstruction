# DIVER.BAS — JSX Experiments
# Location: reference/jsx_experiments/
# ─────────────────────────────────────────────────────────────────────────────
# JSX component files produced during the sandbox-first reconstruction.
# These are reconstruction artefacts — validated visual representations
# of specific aspects of the simulation.
#
# Status levels:
#   EXPERIMENTAL  — under development, not yet validated
#   VALIDATED     — confirmed against photographic evidence and BASIC source
#   COMMITTED     — merged into main application (DiverCompleteWorks.jsx)
#   ARCHIVED      — superseded or retired (moved to src/sandbox/Archive/)
#
# Each entry records: filename, BASIC lines covered, evidence validated
# against, current status, and any outstanding issues.
# ─────────────────────────────────────────────────────────────────────────────

## ACTIVE EXPERIMENTS

### StateInspector1445.jsx
BASIC lines:  1300–1445 (initialisation sequence)
Validates:    All scalar variables and array state at line 1445
Evidence:     DIVERTRACE.BAS emulator runs, all depth ranges and time modes
Status:       VALIDATED
Notes:        Reactive to WD and time mode inputs. GOSUBs 6600, 6700 stubbed.

### LoopInspector1461.jsx
BASIC lines:  1461–1710 (first loop iteration)
Validates:    AL population, ES scheduling, scalar state after iteration 1
Evidence:     LOOPTRACE1.BAS emulator runs
Status:       VALIDATED
Notes:        Single iteration only. GOSUBs stubbed throughout.

### LoopStepper1461.jsx
BASIC lines:  1461–2200 (full loop with STEP and SKIP TO EVENT)
Validates:    Multi-iteration loop behaviour, AL log, activity transitions
Evidence:     LOOPTRACE1–3 emulator runs
Status:       VALIDATED
Notes:        Interactive stepper. GOTO 3000 stubbed as no-op.
              GOSUBs 5300–5700 stubbed — activity setup not yet live.

---

## EXPERIMENTS KNOWN FROM SESSION — LOCATION UNCERTAIN

The following experiments were created during the June 2026 session.
Locate and move to src/sandbox/Experiments/ or Archive/ as appropriate,
then update status here.

### DiverExperiment_1281_1363.jsx
BASIC lines:  1281–1363
Validates:    Time axis ticks, label position
Status:       VALIDATED — not yet committed to DiverCompleteWorks.jsx

### DiverExperiment_1362_1445.jsx
BASIC lines:  1362–1445
Validates:    DM box content (partial)
Status:       PARTIALLY VALIDATED — IDs 7–18 content still outstanding

### DiverExperiment_ID21.jsx
BASIC lines:  GOSUB 6600 (partial)
Validates:    DM box internal layout and dimensions
Status:       VALIDATED for layout only — functionality not finalised

---

## COMMITTED TO MAIN APPLICATION

# Move entries here when merged into DiverCompleteWorks.jsx

---

## ARCHIVED

# Move entries here when retired to src/sandbox/Archive/

### DiverCompleteWorks.jsx
Notes:  Reference/validation document, not a runnable component.
        Moved to src/sandbox/Archive/ — caused Vite auto-discovery error
        when placed in Experiments/. Contains committed JSX record of
        lines 1–780 and 1010–1280.
