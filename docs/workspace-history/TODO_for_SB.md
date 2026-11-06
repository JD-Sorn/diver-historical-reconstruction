# DIVER.BAS Reconstruction — TODO
# Open items only. Delete when done. One line per item.
# Cross-references: TESTING_PLAN.md (T/U numbers), LOG.md, SCREEN_SPECS.md
---
# Cleared of completed/closed entries 22 July 2026 (HK) — full history for everything removed here lives in LOG.md (dated entries) and TESTING_PLAN.md (per-T/U coverage detail). Nothing was deleted without confirming it's captured in one or both first.

## COORDINATE SYSTEM

## SCREEN COMPONENTS
- T05: ACTION, John's explicit decision (24 July 2026): move "DIVER SIMULATION MODEL" title text and its
       underline to the very bottom of the screen — it's currently getting in the way. Not a historically-
       confirmed position (not seen in the photographs on file); John's own compromise, made because the
       original position isn't known rather than because bottom is believed correct. Not yet implemented.
       Original open question (true source position, blocked on U11) stays open in parallel — this is a
       placement decision, not a resolution of it. TESTING_PLAN.md T05.
- T18: descent-profile rendering — smooth-line vs block-staircase comparison still untested (Bresenham-vs-
       linear was already run and is a NULL RESULT — don't re-run it). Blocked on U14 (plotY range) and on
       confirming whether the unimplemented activity-prompt-stub interaction affects AD/event bookkeeping.
       GOSUB 6300 Branch 1. TESTING_PLAN.md T18.
- T18 (auto-run): DiverSim.jsx's 400ms/tick auto-run interval is a placeholder, not derived from hardware
       timing — needs a proper rate once REAL/ACCELERATED pacing is understood.

## DM BOX
- HOUSEKEEPING: two stale comments (T14c colour-verification note; DiverSim.jsx header/line 711 tick-
       stepper description) still to fix opportunistically next time either file is touched for other
       reasons — not urgent enough for its own T/U-number. See LOG.md 05 July 2026.
- T14a: DM_Y+13 hardcoded in JSX — replace with BASIC_row × (H/25) mapping (now that T21 is closed).
- T14d: GOSUB 7000 routing for IDs 7-18 — positions not yet calibrated; content semantics pending U08.
       (ID=21/depth-trend-bar itself is closed — its two carried-forward open threads are tracked under U04.)
- RAISED BY JOHN, testing observation: RED DM bars build from the top — "so 5 then 5 and 4 then 5,4 and 3,
       then 5,4,3 and 2 etc" — ahead of line 7240. Not yet traced against source; needs correlating to the
       actual GOSUB/routine responsible before it can be scoped as a T/U item.
- RAISED BY JOHN, testing observation: on the ASCEND suggestion (at least the last one observed), there's a
       "7m" figure shown — is this depth remaining? Not yet traced against source or assigned to a
       GOSUB/routine.

## USER INPUT
- RAISED BY JOHN: user input should display in CAPS (matching the original terminal's uppercase-only
       convention). Not yet implemented/verified in DiverSim.jsx.
- T25: MEMORY (GOSUB 8000, end-of-dive display) — not yet tested. Expected: AD=WD forces full-depth digits
       (IDs 19-20); no GOSUB 6750 call (no NOSTOP once dive is over). TESTING_PLAN.md T25.
- T26 dispatch arithmetic (AL(P,7), all five branches) Confirmed working — CORRECTS the previous "T26b/d/e
       not yet implemented" line, which was imprecise. TESTING_PLAN.md T26a-e.
- GOSUB 6100 (T26c-2) Confirmed (17 July 2026) — hand-verified against the DT table for two profiles before
       live testing, then matched exactly across live runs since (HT=10, DX=5, D5=20 predicted and observed).
- GOSUB 6250 (T26d, DECOMPRESS-initiation's own display routine — decompression time remaining at current
       depth) — still stubbed. Awaiting its own test, not bundled with the others.
- GOSUB 6850 (T26c-4, NOSTOP/time-to-bound init) — still stubbed. SB stalled on this 48+ hours without a
       working result; source-verified spec now on record to unstick it (24 July 2026, see LOG.md same
       date):
       DEPENDENCY CONFIRMED GENUINE, not a translation artefact: source line 6851 has the original author's
       own comment, "REM I&L OBTAINED FROM PREV CALL TO SUB 6100" — GOSUB 6850 deliberately reads whatever
       I/L GOSUB 6100 left behind, exploiting classic BASIC's lack of scoping as a real parameter-passing
       mechanism. Call sequence (1692 GOSUB 6100 : 1693 GOSUB 6950 : 1694 GOSUB 6850:GOSUB 6950) is safe —
       checked GOSUB 6950's source directly, it never touches I or L, so nothing clobbers the handoff.
       SCOPING WARNING: I/J/L are throwaway scratch variables EVERYWHERE ELSE in this program — GOSUB 6250,
       6800, 6900 (all `I= D5+DX` or similar) and GOSUB 6300 (`FOR I= L TO 21`) each use I and/or L for
       completely unrelated purposes. The fix must be a NEW, distinct pair of module-level variables used
       ONLY for the 6100→6850 handoff — do not reuse the existing module-level BASIC_I/BASIC_J (those
       belong to the unrelated [1040] print-cell setup loop) and do not let it touch 6250/6800/6900/6300's
       own local I/L, which must stay exactly as local as they are now. File already has a naming precedent
       for this exact problem (BASIC_I2/BASIC_J2, BASIC_I3) — continue that convention with a new suffixed
       pair rather than colliding with anything existing.
- ASCEND-initiation's DM-blanking call (T26b, GOSUB 7000 ×6, clears stale decompress-time digits on
       ascent) — still stubbed. Awaiting its own test.
- T32 (working number, pending assignment): GOSUB 5900 — still stubbed (splits a WORK period into
       auto-chained sub-stages when it crosses a decompression-table time boundary partway through;
       currently absent, WORK runs as one continuous block instead), but RESOLVED, correctness-neutral (17
       July 2026): staged vs single-shot computation for the WD40/BT22 profile converge to identical
       HT=10, DX=5, D5=20, for a structural reason, not coincidence — D5's accumulation telescopes across
       staged segments to the same sum the single-shot version computes directly, and HT/DX only ever
       depend on the final threshold crossed, which is identical either way. General property for any
       constant-depth WORK period, which is the only kind WORK ever is. LOW PRIORITY — implementation still
       wanted for source-fidelity/staging-display reasons, but not for correctness. See TESTING_PLAN.md T32.
- T27: all five NEXT-routines CLOSED/Confirmed — T27a/b/d/e closed; T27c=WORK confirmed (17 July 2026) via
       live-diagnostics-plus-event-log evidence. TESTING_PLAN.md T27a-e.
- T28: GOSUB 7500 Confirmed (17 July 2026) — same live-diagnostics-plus-event-log evidence class as T27c
       (`GOSUB 7500 fired: HT X -> Y` log lines). TESTING_PLAN.md T28.
- T29: GOSUB 6200 (WORK-only "AIR OK", IDs 13-18) — source analysis complete, implementation only, not built.
- T30: GOSUB 6800 (DECOMPRESS-only DT countdown, IDs 7-12) — source analysis complete, implementation only, not built.
- T23: REST never terminates the dive — confirmed as a genuine architectural property of DIVER.BAS
       itself, not a blocked dependency. [5730] PA(PA,5)=5 is unconditional in source, no exception
       anywhere in GOSUB 5700 — REST's own auto-chain (built and working) faithfully reproduces this.
       Open question, not yet investigated: whether the original 1979 program expected an out-of-band
       interrupt (BASIC BREAK/STOP) to end a REST-heavy dive, rather than anything reachable through the
       activity-selection logic itself. Known gap, still deferred per John's 10 July 2026 decision. See
       LOG.md 17 July 2026.

## UNRESOLVED
- U01: X-axis formula (SVG_x = plotX × 480/159) — not yet photo-confirmed. TESTING_PLAN.md U01.
- U03: FRAME element purpose — title-box hypothesis unconfirmed. Address in T04/T05.
- U04: two threads carried forward from the (closed) depth-trend-bar work: (1) position still provisional,
       no photo confirmation yet, unlike BAR22; (2) the bar's fractional-depth reading is well-supported,
       but a "conveys ascend/descend direction" reading is NOT — keep these as two separate claims, don't
       treat (2) as confirmed. Revisit if a photograph surfaces.
- U08: IDs 7-12 still open (partial); IDs 13-18 resolved (GOSUB 6250, confirmed against source).
- U09: 25-line hardware confirmed; only revisit if T05's missing title (blocked on U11) turns out to be
       line-count-related. LOW PRIORITY.
- U11: blocks T05 closure — scroll trigger/direction/line-count effects still unknown beyond the two
       confirmed PLOT 27 calls. TESTING_PLAN.md U11.
- U12: reopened — needs the original "small characters" observation's specifics (which test, screenshot)
       from John before either candidate explanation can be tested.
- U14: plotY wrap-range test still needed — send Y=140 on a CCEMU 25-line configuration and see where the
       block lands. Blocks T18 coordinate-formula confirmation. See CoordinateSystem.md, SCREEN_SPECS.md.
- U20: MQ/MP comparison (DIVER.bas lines 6316-6317) — needs live dive values to trace, not a static read.
- U21: DT value-for-value cross-check against the presumed RNPL/BSAC table not yet done.
- U22: CCEMU 2-significant-character variable-name truncation — genuine 8001 hardware limit or CCEMU-
       specific dialect quirk remains unconfirmed against Compucolor-8001-manual.pdf.
- U23: NS, NN, II — purpose unconfirmed.
- U25: screenshot showed six magenta lines against a three-(now confirmed two-)block loop in source/JSX —
       this specific discrepancy still unexplained; needs the actual screenshot re-examined against block
       positions before any explanation is accepted.
- U29 (working number, pending assignment): DX, once set to 5, is never reset anywhere in source. Diving
       again later in the same session, after a completely separate, shallower WORK period that on its own
       wouldn't need two stops, would still show STOP10 rather than STOP 5, because DX is left over from the
       earlier episode. Reads as a genuine quirk of the original 1979 program, not a bug in the port — if it
       comes up in testing, document as an Observed Anomaly, do not fix.

## FINAL PASS (after all else is finished)
- Full audit of DiverSim.jsx/DiverSim2.jsx comments against the Historical-first commenting convention
  (STYLE_GUIDE.md, 10 July 2026). Applied going forward and opportunistically as code is touched anyway —
  deliberately NOT retrofitted now. Do this pass last, once other work is done.
- U07/U10 reconciliation: PLOT 30's argument value 16 specifically has conflicting readings on file —
  "background colour (black)" in three places vs "large characters toggle" in CoordinateSystem.md. Deferred
  (10 July 2026, per John) rather than chased now — DM box renders correctly in practice, so this is a
  historical curiosity, not a live blocker. See LOG.md 05 July 2026 for full history.

## ZENODO
- Deposit canonical DIVER.BAS source with provenance statement.
- FA1/HA1: note self-hosting of Bedstead fonts (src/assets/fonts/) — removes CDN dependency,
  supports long-term archival stability of the reconstruction.
- Deposit photograph set with metadata.
- Deposit reconstruction with methodology note.
- Consider a standalone note on tangential findings from the 8001 manual proof-read (e.g. waffle/
  tofu fallback glyph, Reverse Field flag dual-purpose as Plot Mode XOR, double-height same-code
  odd/even-line rendering) — not needed for DiverSim.jsx but may be the only surviving record of
  these hardware details. Decide after manual proof-read is complete.
