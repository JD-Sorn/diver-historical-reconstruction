# DIVER.BAS Reconstruction — TODO
# Open items only. Completed history belongs in LOG.md / TESTING_PLAN.md /
# DEFECT_REGISTER.md / REGRESSION_TESTS.md.
# Updated 20 August 2026 by SB during HK recovery.
---

## GOVERNING STATUS

- **Scheduler: PASS / FREEZE.** Do not alter scheduler, PA, ES, event-boundary,
  predictive-prompt, activity-creation, staged-WORK or movement/clamp logic
  without new BASIC/CCEMU evidence.
- **Confirmed behavioural/display baseline:**
  `DiverSim_v13_READY_final24_display_fidelity_BASE.jsx`
  — full regression PASS.
  SHA-256:
  `247d0d1c726e7de8da48313ebb1c8697c58c3e5be80ab7d492a1ea473a2e3912`
- **Current test candidate:**
  `DiverSim_v13_READY_final24_latched_bell_candidate.jsx`
  — latched warning tone directly tested by John; stops on ENTER as intended.
  Not yet promoted as the confirmed baseline.
- **575/575 BASIC source-line traceability** remains a permanent milestone.
- `COMMENTS_TO_AMEND.md` is the single comment-change register.
  Sequential comment-review checkpoint: **BASIC 1273**.

## CURRENT / NEXT

- Continue the sequential comment/reference audit after BASIC 1273 when John
  resumes. John raises comments conversationally; SB maintains
  `COMMENTS_TO_AMEND.md`.
- At the next executable-code update, review [1265–1266] titleCells/source-string
  participation in hidden presentation timing. The BASIC lines execute but do
  not display title text in normal CCEMU; visible JSX title output is already
  absent. This is a contained timing/code-cleanup candidate, not a comment-only
  change. See LOG.md 20 Aug / TESTING_PLAN.md T05 / DEF-018.
- Bell candidate: full regression/promotion remains to be decided. The 1150 Hz
  pitch is empirical only and may be revisited if better historical evidence
  appears. Browser first-audio gesture suppression is a host restriction.
- **DEF-001** remains deferred pending clearer matched-tick 1979 photographs.

## DISPLAY / PRESENTATION

- T18 residual visual-quality question: DESCEND rendering approach is settled
  by DEF-009, but any remaining presentation refinement should be judged only
  against source/CCEMU/photo evidence.
- T18 auto-run pacing: the historical relationship between simulation time and
  host wall-clock pacing remains separate from the final24 display-write
  cadences. Do not infer it from the 35/10/18 ms presentation timings.
- DM observation still untraced: red DM bars build from the top during the
  observed sequence. Correlate to the responsible source routine before
  creating a defect or implementation change.
- U07/U10 historical reconciliation: old records contain conflicting readings
  of `PLOT 30,16`. DM rendering is correct in practice; resolve only if the
  source/manual audit reaches it naturally.

## CONTROL-FLOW / DISPLAY-STATE AUDITS

- Check whether any STOP/error branch elsewhere has the same render-before-halt
  class once seen at GOSUB 6100 / GOSUB 6750. Do not assume a shared defect;
  inspect source ordering first.
- Check GOSUB 6850/6800 call sites for the old mirror-image DM-row wipe concern
  (row 2 vs IDs 13–18) if those routines are touched again.
- Diagnostic/tooling integrity (T56): determine whether the global error
  handler has silently swallowed other runtime exceptions; consider surfacing
  such errors during controlled verification.

## COVERAGE / REGISTER AUDIT

- REAL-mode breadth: WD16 and a deeper decompression profile are confirmed;
  not every WD has been exercised in REAL mode. Treat as substantially, not
  exhaustively, covered.
- Backfill second-depth evidence where register wording is broader than its
  historic evidence:
  - RT-24 / RT-27 / RT-28 full-cycle milestone;
  - RT-12 DT-bracket selection;
  - RT-13 / RT-14 GOSUB 6850 branch-selector breadth.
  Use naturally accumulated second-depth runs rather than inventing work solely
  for bookkeeping unless a gap becomes material.

## COMMENT / SOURCE CLEANUP

- After the sequential comment audit is complete, and only on John's explicit
  instruction, strip permanent JSX comments that are neither:
  1. BASIC-translation / JSX-difference comments, nor
  2. the approved short factual file header.
- Do not put RT-/DEF-/T-number process-history comments back into JSX.

## PRINT / OUTPUT AUDIT

- Continue to distinguish:
  1. source-derived BASIC output;
  2. reconstruction-only diagnostic output;
  3. JS numeric-format artefacts;
  4. source display material whose purpose is not yet understood.
- Do not “improve” odd source messages without evidence. The `Tn:::` row is
  confirmed retained/live DM state, not disposable transient text.

## ZENODO / ARCHIVAL

- Deposit canonical DIVER.BAS with provenance statement.
- Deposit photograph set with metadata.
- Deposit reconstruction with methodology note.
- Note self-hosted Bedstead fonts for archival stability.
- Consider a separate hardware-note deposit for useful 8001 manual findings
  that are not needed in DiverSim.jsx itself.
