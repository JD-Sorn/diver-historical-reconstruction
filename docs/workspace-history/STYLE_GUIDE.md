# DIVER.BAS  -  React Translation Style Guide
# Authorial decision: John, June 2026.
# Applies to all JSX files in the reconstruction.
# Updated 19 August 2026, by SB, per John  -  added the zero-effect BASIC line exception below. HK to review when available; not a substantive rewrite of anything HK has previously authored or agreed.
---

## Objective

Recreate DIVER.BAS faithfully in modern React/JavaScript.
Translate the BASIC algorithm, not merely its final visual output.
Someone should be able to compare the BASIC listing and the React
code side-by-side and follow execution almost line-for-line.
Historical fidelity takes precedence over performance or idiomatic React.

## Variable naming

If a JavaScript variable directly corresponds to an original BASIC
variable, prefix it with BASIC_.

    BASIC_I, BASIC_J, BASIC_Y1, BASIC_YO, BASIC_WD, BASIC_XS

BASIC arrays use the same convention and the same index base as the
original (note: BASIC arrays PA, AL, ES, DT are 1-based in places):

    BASIC_PA, BASIC_AL, BASIC_ES, BASIC_DT

Do not prefix variables that are part of the modern runtime:

    runtime, screenBuffer, graphicsLayer, cursor

## BASIC arrays are 1-based

DIVER.BAS's arrays (PA, AL, ES, DT, C, and others) are 1-based, and the
JSX preserves that indexing rather than shifting to JavaScript's native
0-based convention  -  this keeps a BASIC array subscript and its JSX
counterpart numerically identical, which matters for line-for-line
comparison against the listing. Any place where this is deliberately
NOT the case (a genuine 0-based JS structure standing in for something
that was never really "array-shaped" in BASIC) should be noted at the
point of use, not assumed from this general rule.

## Runtime methods

Implement original BASIC commands as runtime methods, not inline logic.
The translated code calls these in the same sequence as the BASIC program.

    runtime.PRINT(...)
    runtime.NEWLINE()
    runtime.PLOT(...)
    runtime.INPUT(...)
    runtime.GOSUB_6300()    ← GOSUB n becomes a named async method

GOSUB/RETURN has no JavaScript equivalent. Each GOSUB target becomes
a named async runtime method carrying the line number:
runtime.GOSUB_6300(), runtime.GOSUB_7000() etc.
This keeps the line number visible and the call sequence traceable.

## Line number comments

Retain original BASIC line numbers as comments immediately before the
translated statement. This provides a permanent mapping to the listing.

    // [1040]
    for (BASIC_I = 0; BASIC_I <= 5; BASIC_I++) {

        // [1050]
        for (BASIC_J = 0; BASIC_J <= 78; BASIC_J++) {

            // [1060]
            await runtime.PRINT(" ");
        }

        // [1080]
        BASIC_Y1 = 191 - (8 * BASIC_I);
    }

## Historical-first commenting

Adopted 10 July 2026, following a review of comments like "no JSX
equivalent" and "replaced with SVG" that jumped straight to the modern
implementation without ever stating what the original did. This
undersells the project's own objective above: a reader should learn
both systems, not just be told the BASIC part didn't matter.

Applies whenever a BASIC construct doesn't translate directly into a
JSX/JavaScript equivalent  -  whether because none is needed, or because
the modern implementation achieves the same effect by different means.
The comment must cover, in order:

1. What the BASIC statement did.
2. Why it existed on the original hardware.
3. Either why modern JSX/JavaScript doesn't need an equivalent, or how
   it achieves the same effect differently  -  whichever applies.
4. Whether any behavioural effect still needs preserving. This point is
   mandatory, not optional  -  it's what stops the convention collapsing
   back into a longer-winded dismissal. A case can satisfy points 1-3
   cleanly and still be quietly dropping something real (e.g. an
   audible cue, a timing effect) that a modern equivalent could in fact
   provide.

Worked examples (folded in from COMMENTS_TO_AMEND.md, 21 July 2026  - 
the three cases originally identified there as needing this treatment,
found via a full-file scan for "no equivalent"/"no JSX"/"not
applicable"/"not needed"/"no-op" and broader dismissive terms):

**[1277] PLOT 255**  -  exits Plot Mode back to text mode on the real
terminal, where both share one stateful serial protocol; leaving Plot
Mode active would corrupt subsequent text. JSX has no equivalent
because SVG drawing and DOM text are structurally separate here  - 
there's no shared mode to exit. Historical Note, not a gap.

    // [1277] PLOT 255  -  exits Plot Mode back to text mode on the real
    // terminal, where both share one stateful serial protocol; leaving
    // Plot Mode active would corrupt subsequent text. JSX has no
    // equivalent because SVG drawing and DOM text are structurally
    // separate here  -  there's no shared mode to exit. Historical Note,
    // not a gap.

**[1278] PRINT CHR$(7)** (bell; two occurrences, lines 846 and 848)  - 
sounded the terminal's physical bell as an audible prompt cue, part of
the original user experience. No JSX audio implemented yet  -  this is a
deliberate gap (a modern equivalent, e.g. a short beep, is possible),
not a case where none could exist. Distinct from the two cases above:
those are archaeologically complete as documentation-only fixes; this
one is the one case of the three where an actual audio equivalent
remains implementable, if that's ever wanted.

Applied going forward and whenever existing code/comments are touched
for other reasons  -  NOT a retrofit pass. A full audit of everything
already written is intentionally deferred; see TODO.md.

## Exception: zero-effect BASIC lines

Added 19 August 2026, following the comment-audit review. Two lines in
the surviving listing  -  [1] REM DIVER (the program title) and [100]
CLEAR 20 (string-space reservation, obsolete under JS memory
management)  -  have no executable effect whatsoever on the original
hardware, and translate to nothing at all in JSX beyond the fact of
having been considered. Both were originally written up using the full
four-point historical-first structure, since at the time they were the
worked examples establishing the convention. On review this reads as
excessive for lines with genuinely zero behavioural stakes: there is no
possible finding under point 4 ("whether any behavioural effect still
needs preserving") because there is no behaviour to begin with.

For a line meeting ALL of the following, a single-line citation is
sufficient instead of the full four-point form:

- The BASIC statement is provably inert (REM, or a construct  -  like
  CLEAR  -  whose entire purpose was memory management on now-obsolete
  hardware) with no possible behavioural, timing, or display
  consequence, on the original hardware or in JSX.
- Nothing under historical-first point 4 could ever apply to it.

    // [1] REM DIVER  -  original BASIC program title.
    // [100] CLEAR 20  -  reserves BASIC string space; no JSX equivalent required.

This is expected to remain rare  -  [1] and [100] are the only two
identified cases at time of writing. Do not extend this exception by
analogy to a line that merely *looks* inert without confirming no
possible behavioural/timing/display consequence exists; when in doubt,
use the full four-point form. If a third or fourth genuine case turns
up, add it here by name rather than treating this as a general licence
to abbreviate.

**[1277] PLOT 255 and [1278] PRINT CHR$(7), above, are NOT covered by
this exception**  -  despite JSX needing no direct construct for either,
[1277] involves a real state transition (Plot Mode) worth explaining,
and [1278] has a live, unresolved behavioural question (point 4: the
audio cue gap). Both keep the full four-point form.

## BASIC FOR-NEXT loop exhaustion is often meaningful, not exceptional

Found 10 July 2026, in T24c's band-search loop (see LOG.md), recorded
here for posterity rather than only as a one-off fix.

When a `FOR I=start TO end ... NEXT I` loop runs to completion without
an early exit, the loop variable doesn't vanish or become invalid  - 
it settles one past the upper bound (`end+1`), and the original program
carries on to the next line using that value, same as any other loop
exit. Modern instincts treat "the loop ran out without finding a match"
as an edge case worth guarding against or erroring on; BASIC has no such
concept, and DIVER.BAS routinely relies on this exact behaviour to reach
a meaningful downstream result (in T24c's case, the loop exhausting the
`DT` table was the correct signal for "no further decompression bound
exists  -  treat this as the floor").

When translating a `FOR...NEXT` loop, do not add a defensive bail-out,
error branch, or early-return for the completion-without-match case
unless the BASIC source itself branches on it explicitly. Trace what the
next line actually does with the settled loop variable, and translate
that  -  the "no match found" case is very often the intended path, not a
failure state.

## Program structure

Preserve: loop structure, IF statements, calculation order,
variable names, execution order.

Do not replace procedural BASIC with higher-level JavaScript constructs
simply because they are more concise. Prefer the explicit loop over
a one-line equivalent, the sequential IF over a ternary, the step-by-step
calculation over a composed expression.

## Separation of concerns

BASIC_* variables   -  the original 1979 program.
runtime.* methods   -  emulation of the original machine behaviour.
React components    -  rendering of the runtime state.

These three layers must remain clearly distinct in the code.

## Optimisation

Do not optimise or refactor unless specifically requested.
The translated code should resemble "JavaScript written by the original
BASIC program", not a modern redesign.


## BASIC variables with dual scalar/array usage

DIVER.BAS uses some variable names as both a scalar and an array
(e.g. PA as scalar PA=1 and array PA(row,col)). JavaScript cannot
share a name between a scalar and an array.

Where this occurs, append _scalar to the scalar variable name:

    BASIC_PA           -  the array  (DIM PA(8,5))
    BASIC_PA_scalar    -  the scalar (PA=1, PA=PA+1 etc.)

Apply the same convention to any other BASIC variable found to have
dual scalar/array usage.

## Faithful-but-confusing behaviour is not a UX gap to fix

Decided 17 July 2026, following the `AD`/`IK` look-ahead-margin case
(a REST prompt firing slightly before the true ascent boundary  -  a
genuine, deliberate characteristic of the 1979 source, not a bug  - 
that reads as mildly confusing without a cue on modern hardware). See
LOG.md 17 July 2026.

When faithfully-reproduced original behaviour is confirmed correct but
would read as confusing or rough to a modern user, do not propose a
modern UX addition to smooth it over  -  an indicator, a cue, a
convenience not present in the original  -  even a minor one. Default to
leaving it as-is, matching the source, unless specifically requested.

This is a standing instruction, not a one-off judgement call on this
case: don't re-raise "this would be a nice modern affordance" as an
open option each time faithful-but-confusing behaviour turns up
elsewhere in the program. John has already declined this category of
addition once; treat it as declined going forward rather than asking
again per instance.

## Diagnosing rendering discontinuities: constant gaps vs growing gaps, and single-point approximations of vector PLOTs

Established 28 July 2026, from DEF-003 (WORK→ASCEND track handoff gap
 -  see LOG.md and DEFECT_REGISTER.md same date). Recorded here because
both principles generalise beyond that one fix.

**1. A gap that stays constant in size regardless of how long the
preceding activity ran is diagnostic of a fixed rendering-convention
mismatch between two code paths  -  not missing data or a skipped
multi-tick span**, which would instead scale with duration. Check this
distinction first in any future "disjointed track" report, before
assuming a logic/data bug (missing pushes, dropped ticks) is the cause.

**2. Wherever this project's translation substitutes a single-point-
per-tick rendering for a real BASIC vector/line-draw PLOT command  - 
approximated and validated once, for one specific calling context  - 
treat that approximation as a candidate defect at any OTHER
handoff/boundary it was never validated against.** Its internal offset
conventions may silently assume "always follows same-branch ticks,"
which the original single-context validation had no way to surface.
This is not a flaw in the original approximation (DEF-003's own `+1`
offset was correctly photo-validated for the case it was built for)  - 
it's a reminder that a validation covering one boundary doesn't
transfer to every other boundary the same code touches.

## Comment scope: BASIC translation and JSX difference only  -  nothing else

Clarified 28 July 2026, per John, after HK proposed a cross-reference
comment (pointing a code comment at a Regression Test Register row)
that should not have been suggested.

Permanent comments in DiverSim.jsx exist for exactly two purposes:
what a BASIC line/statement did, and how the JSX achieves the same
effect differently (the Historical-first commenting convention,
above). Nothing else belongs as a permanent comment  -  not
cross-references to RT-NNN/DEF-NNN/T-numbers, not test rationale, not
"this behaviour is expected because X" notes explaining project
history. That explanatory material belongs in LOG.md,
DEFECT_REGISTER.md, REGRESSION_TESTS.md, and TESTING_PLAN.md  -  never
duplicated into the source as a comment.

Temporary construction comments (scaffolding notes, TODO-style markers
while a piece is actively being built) are fine to have during
development, but must be removed once the artefact in question is
confirmed working  -  they are not meant to persist as documentation.

**Exception  -  the file header.** A short, factual header at the very
top of DiverSim.jsx (identity of the file, one-line description of
what DIVER is, and attribution to Aksnes/Mallen/the reconstruction) is
permitted and does not fall under the "nothing else" restriction above.
It carries no process history, no test rationale, and no cross-
references to RT-/DEF-/T-numbers  -  only short factual statements of
authorship and purpose, in the same spirit as a standard file docblock.
Agreed 19 August 2026, after review confirmed this is a materially
different category from the process-history comments the "nothing
else" rule was written to exclude. If John's planned future pass to
strip all non-historical-first comments from the file ever proceeds
(see below), this header is explicitly exempted and should be
preserved.

**Future requirement, not yet actioned (John, 28 July 2026):** at some
point, John will require every comment that is NOT a BASIC-translation-
plus-JSX-difference comment to be removed from the codebase entirely  - 
this goes beyond "don't add new ones" to "eventually strip everything
else out," including any that predate this clarification. The finished
JSX is meant to be the clean product of the exercise; the process
itself  -  how it was built, the challenges hit along the way  -  is
deliberately kept OUT of the code and instead lives in LOG.md and the
other tracking documents, which will later be used to produce a
separate narrative account. This is a future pass, not current work  - 
do not start stripping comments proactively; wait for John's explicit
go-ahead. Related to, but broader than, TODO.md's existing FINAL PASS
audit item (which is about conforming existing comments to the
Historical-first convention  -  this is about removing everything that
isn't that convention, once the convention itself is settled). The
file-header exception above stands even after this future pass.
