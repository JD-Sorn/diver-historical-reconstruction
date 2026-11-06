# DIVER Reconstruction Style Standard

## 1. Purpose

Apply this standard to the JavaScript/JSX reconstruction of `DIVER.BAS` and to its permanent source comments.

Reproduce the corrected BASIC program faithfully. Translate its algorithm, state transitions, execution order, terminal behaviour and visible output rather than merely reproducing a similar final screen.

Keep the reconstructed source sufficiently traceable that a reader can compare it with the BASIC listing and follow the corresponding execution.

Give demonstrated historical behaviour priority over performance, modern JavaScript idiom and contemporary user-interface convention.

## 2. Normative language

Interpret the terms in this document as follows:

- **MUST** indicates a mandatory requirement.
- **MUST NOT** indicates a prohibition.
- **SHOULD** indicates the expected practice unless a documented reason justifies an exception.
- **SHOULD NOT** indicates a practice to avoid unless a documented reason justifies it.
- **MAY** indicates an optional practice.

## 3. Sources of authority

### SRC-01  -  Use the corrected source

Treat the corrected `DIVER.BAS` listing, including established handwritten amendments, as the primary authority for executable behaviour.

### SRC-02  -  Separate evidence from interpretation

Distinguish among:

- behaviour demonstrated by the corrected source;
- behaviour demonstrated by execution or diagnostic evidence;
- behaviour documented by the Compucolor/Intecolor manuals;
- reconstruction behaviour required by the browser host;
- interpretation that remains uncertain.

Do not present an inference as a source fact.

### SRC-03  -  Preserve significant source annotations

Preserve an original REM statement or manuscript annotation when it documents a genuine data handoff, authorial uncertainty, operational assumption or executable amendment.

Identify the wording as a source annotation. Do not silently adopt the annotation as a modern conclusion.

### SRC-04  -  Do not invent intent

Describe demonstrated behaviour when the original intention is unknown. Do not supply a purpose merely because one appears plausible.

### SRC-05  -  Preserve faithful irregularities

Retain confirmed source behaviour even when it appears awkward, surprising or unlike a modern application.

Do not add an indicator, warning, prompt, correction or convenience solely to make faithful historical behaviour easier for a modern user unless that addition is separately authorised.

## 4. Program structure

### STR-01  -  Preserve execution order

Preserve the order of calculations, assignments, branches, calls, loops, display writes and event dispatches when that order can affect state or visible behaviour.

### STR-02  -  Preserve procedural form

Prefer an explicit translation of the BASIC control flow to a shorter modern abstraction when the abstraction would obscure source correspondence.

Do not replace a sequential BASIC calculation with a combined expression if doing so conceals an intermediate value or changes evaluation order.

### STR-03  -  Translate subroutines as named functions

Represent a live BASIC subroutine with a function whose name retains its entry line number, such as `gosub_6300()` or `gosub_7000()`.

Keep call-site order consistent with the corresponding GOSUB order.

Do not create a function for a source routine that has no live caller unless the function has a documented reconstruction purpose.

### STR-04  -  Preserve loop exhaustion semantics

Preserve the BASIC value of a FOR-loop variable after normal exhaustion, including its one-past-the-upper-bound value where the source subsequently uses it.

Do not add an error, defensive return or no-match branch merely because a modern implementation would normally treat loop exhaustion as exceptional.

Trace the exhausted value into the following source statements before translating the loop.

### STR-05  -  Preserve event boundaries

Distinguish predictive activity input from true end-of-event dispatch.

Store a predictive answer without replacing the currently executing activity. Continue movement to its physical target and clamp the depth before committing the successor at the true event boundary.

### STR-06  -  Preserve shared BASIC state

Preserve values intentionally carried between subroutines. Do not localise a BASIC variable when a later routine depends on the value left by an earlier routine.

Keep unrelated JavaScript loop variables local when the BASIC source merely reuses the same short variable name for unrelated purposes.

## 5. Variable and data-structure naming

### NAM-01  -  Prefix translated BASIC variables

Prefix a JavaScript variable that directly represents a BASIC variable with `BASIC_`.

Examples:

```js
BASIC_I
BASIC_WD
BASIC_XS
BASIC_PA
BASIC_AL
BASIC_ES
BASIC_DT
```

### NAM-02  -  Do not prefix reconstruction variables

Do not use the `BASIC_` prefix for React state, browser mechanisms, display queues, SVG data or other reconstruction-only structures.

Name such variables by their reconstruction role.

### NAM-03  -  Preserve BASIC indexing

Preserve the source index base for translated BASIC arrays. Keep PA, AL, ES, DT, C and other source arrays 1-based wherever the BASIC uses 1-based subscripts.

Document a deliberate exception at its point of use.

### NAM-04  -  Separate scalar and array uses

When the BASIC uses the same name as both a scalar and an array, retain the unqualified translated name for the array and append `_scalar` to the scalar.

Example:

```js
BASIC_PA         // DIM PA(8,5)
BASIC_PA_scalar  // PA=1, PA=PA+1, and related scalar uses
```

Apply the same convention consistently to every dual-use source name.

### NAM-05  -  Explain roles, not conventions

Describe the source role of a variable where a comment is needed. Do not cite this Style Standard from the code to justify a name.

## 6. Separation of concerns

### SEP-01  -  Keep three layers distinct

Keep these layers distinguishable:

1. translated BASIC state and algorithms;
2. reconstruction mechanisms such as queues, latches and browser input handling;
3. React/SVG presentation state and rendering.

Do not allow presentation mechanisms to alter BASIC clock, depth, activity, event or decompression state.

### SEP-02  -  Identify reconstruction-only behaviour

Describe browser-only logic as a reconstruction, host or presentation mechanism.

Do not cite a nearby BASIC line as though it directly contains reconstruction-only logic.

When useful, state that the mechanism is downstream of a source calculation rather than a translation of that calculation.

### SEP-03  -  Avoid framework detail where unnecessary

Use terms such as “screen cells”, “display update”, “rendered output” or “browser host” when the framework name adds no useful information.

Mention React or SVG only when the framework-specific distinction is material to the explanation.

## 7. BASIC line citations

### CIT-01  -  Place citations locally

Place a BASIC line citation immediately before or beside the translated statement or block it explains.

Use square brackets:

```js
// [1467] CL=CL+TK
BASIC_CL = BASIC_CL + BASIC_TK;
```

### CIT-02  -  Use accurate ranges

Use an en dash for a continuous source range, such as `[6300–6599]`.

Use a slash for distinct cited statements that jointly explain one operation, such as `[6510]/[6525]`.

Use an arrow only for an explicit transfer or path between non-contiguous lines, such as `[5970→1645]`.

### CIT-03  -  Describe the cited statement

Ensure that the wording after a citation accurately describes the cited source line or range.

Do not attach a citation merely because related reconstruction code appears near the translated result of that line.

### CIT-04  -  Account for complete statements

Account for every significant operand, control byte and trailing value in a cited compound BASIC statement.

Do not quote only the opening portion of a chained PLOT statement while leaving later codes unexplained.

### CIT-05  -  Describe call sites neutrally

Describe a GOSUB call as a call to the complete routine. Do not label an unconditional call site as only one of the branches that the routine may select internally.

Name the internal condition when explaining the branch.

### CIT-06  -  Keep source headings concise

Describe a REM divider or section heading as a source heading with no executable effect. Do not give it a modern operational purpose.

### CIT-07  -  Allow concise inert-line comments

Use a single-line citation for a BASIC statement only when it is demonstrably inert and has no state, timing, display or control-flow consequence.

Do not apply this exception to terminal-state changes, audible cues or statements whose effect is merely difficult to reproduce.

Examples:

```js
// [1] REM DIVER  -  original BASIC program title
// [100] CLEAR 20  -  reserves BASIC string space; no JSX equivalent is required.
```

## 8. PLOT-stream interpretation

### PLT-01  -  Parse the complete serial stream

Parse every comma-separated PLOT statement as one stateful terminal stream.

Do not divide the statement into assumed fixed-length commands before interpreting the entire sequence. Allow each control byte to determine how subsequent values are interpreted.

### PLT-02  -  Consult the hardware documentation

Check the applicable Compucolor/Intecolor documentation before assigning meaning to an unresolved control code or submode.

Do not infer the meaning of trailing PLOT values from a superficially similar statement.

### PLT-03  -  Preserve state transitions

Account for Plot Mode entry and exit, colour selection, character size, blink state, cursor control and graphic submodes when they affect later bytes or visible output.

### PLT-04  -  Preserve raster behaviour

Represent source plot intervals using complete Compucolor raster cells when that is the demonstrated behaviour.

Preserve the source-coordinate relationship between adjacent activity paths. Do not repair handoffs later with arbitrary corner segments or remembered display columns.

## 9. Permanent source comments

### COM-01  -  Limit comment scope

Use permanent JSX comments for:

1. the behaviour of the corresponding BASIC statement or routine; and
2. a material difference in how the reconstruction preserves that behaviour.

Do not place defect history, test references, review discussions, candidate-build information or development narrative in permanent source comments.

### COM-02  -  Apply historical-first order

When the reconstruction differs from the source mechanism, explain the points that apply in this order:

1. what the BASIC statement did;
2. why the operation mattered on the original system;
3. how or why the reconstruction differs; and
4. which behavioural effect remains preserved.

Keep the explanation proportionate. Do not expand a self-evident translation into unnecessary prose.

### COM-03  -  Remove temporary construction comments

Remove TODO notes, scaffolding explanations and temporary implementation commentary once the relevant behaviour has been settled.

Record continuing uncertainty or investigation in the appropriate project register instead.

### COM-04  -  Permit a factual file header

Permit a short header containing the file identity, a one-line description of DIVER and factual attribution.

Do not include process history, review status, defect references or build history in the header.

### COM-05  -  Avoid ambiguous references

Do not use “above”, “below”, “likewise”, “implemented”, “continue”, “common continuation”, “stack” or “branch” unless the local wording identifies the relevant routine, state or destination clearly.

Name a branch by its source condition or activity rather than only as “Branch A” or “Branch B”.

### COM-06  -  Use complete sentences

Rewrite accidental fragments as complete sentences.

End every explanatory sentence with a full stop.

Do not add a full stop when a comment consists solely of a literal BASIC statement, source heading or source label.

When a comment combines a BASIC statement with explanatory prose, punctuate the explanatory prose as a complete sentence.

### COM-07  -  Prefer direct wording

Use concise descriptions of effect and relationship.

Prefer “continue with event scheduling at [1730]” to “join the common continuation”.

Prefer “the diver’s actual WORK position” to an unexplained “position dot”.

Avoid decorative terms such as “crucial”, “expensive”, “genuine” or “deliberately” unless they communicate a necessary technical distinction.

## 10. Display and timing behaviour

### DSP-01  -  Preserve source write order

Preserve the order of BASIC PRINT, PLOT and GOSUB 7000 display writes.

Ensure that a later overwrite cannot overtake an earlier queued write to the same screen area.

### DSP-02  -  Preserve persistent screen cells

Change only the cells or plotted area addressed by the translated source operation.

Leave other screen content visible until another source-directed operation overwrites it.

Do not clear stale-looking monitor text merely to imitate a modern form or dashboard.

### DSP-03  -  Separate display pacing from simulation time

Treat browser display delays as presentation timing only.

Do not allow display pacing to alter `BASIC_CL`, `BASIC_AD`, `BASIC_TK`, event scheduling or decompression state.

### DSP-04  -  Preserve audible cues

Represent CHR$(7) as an audible warning whose lifetime follows demonstrated source operation.

Stop the warning when the corresponding INPUT completes or the program reaches END. Treat browser autoplay restrictions as host constraints rather than source behaviour.

### DSP-05  -  Preserve shared display attributes

Treat blink as a display attribute shared by the relevant characters, not as additional queued character writes.

Keep flashing characters in a common phase when the terminal hardware would have done so.

### DSP-06  -  Preserve activity-track relationships

Render DESCEND and ASCEND as the demonstrated sequence of vertical raster strokes.

Render WORK, DECOMPRESS and REST horizontal tracks with a common displayed thickness.

Preserve the regular dotted WORK trace through visible DT colour bands and its solid form outside them.

Join activities at their shared source-derived raster coordinates.

## 11. Optimisation and alteration

### OPT-01  -  Do not optimise without cause

Do not refactor translated source logic solely to make it shorter, more idiomatic or more efficient.

Optimise only when specifically required and only after demonstrating that source behaviour, execution order and traceability remain unchanged.

### OPT-02  -  Do not compensate aesthetically

Do not alter source-derived coordinates, durations, movement increments or activity boundaries merely to resemble a photograph more closely.

Use photographic evidence to test an interpretation, not to override defensible source arithmetic.

### OPT-03  -  Treat unvalidated approximations cautiously

Treat a rendering approximation validated in one activity or handoff as unverified in another context until the additional context has been checked.

Distinguish a constant rendering mismatch from a gap that grows with elapsed time before diagnosing missing state or dropped ticks.

## 12. Documentation boundaries

### DOC-01  -  Keep process history out of the code

Record defects, experiments, rejected proposals, verification evidence and development history in the appropriate Markdown registers rather than in JSX comments.

### DOC-02  -  Keep build information out of explanations

Do not identify behaviour by candidate, final or sequential build number in permanent documentation unless documenting release history.

Use stable routine names, source ranges and component names instead.

### DOC-03  -  Avoid inaccessible dependencies

Ensure that a permanent comment can be understood from the source and included project documentation.

Do not make a source comment depend on a chat exchange, private reviewer statement or unavailable external comparison.

### DOC-04  -  Use consistent terminology

Use the established meanings of PA, AL, ES and DT throughout the project documentation.

Define those terms in architectural documentation. Do not redefine them inconsistently inside individual comments.

## 13. Formatting

### FMT-01  -  Use British English

Use British spelling and punctuation in project prose.

### FMT-02  -  Format identifiers consistently

Use backticks for filenames, functions, variables and literal identifiers in Markdown.

Use uppercase for activity names and prompts exactly as displayed by the program.

### FMT-03  -  Use consistent dashes

Use an en dash for numeric ranges and an em dash for an explanatory break.

Do not substitute an ASCII hyphen where the distinction matters in published prose.

### FMT-04  -  Keep comments readable

Keep comments close to the code they explain and wrap them to the project’s established source width.

Do not retain damaged fragments, duplicated wording or sentences whose subject appears only in a removed line.

## 14. Verification requirements

### REV-01  -  Verify citations

Check every new or materially changed BASIC citation against the corrected source before marking it verified.

### REV-02  -  Verify compound terminal statements

Check every newly interpreted chained PLOT statement against the terminal documentation and account for its complete byte stream.

### REV-03  -  Check related occurrences

Search for every related occurrence when changing the terminology or interpretation of a routine, branch, activity path or display mechanism.

### REV-04  -  Separate comment verification from behavioural verification

Verify both the wording of a comment and the behaviour of any accompanying code change. Do not treat agreement on wording as evidence that altered executable behaviour is correct.

### REV-05  -  Complete a publication sweep

Before publication, search the permanent source comments for:

- incomplete sentences and truncation;
- unexplained branch names;
- stale build references;
- reviewer or AI-workflow references;
- defect and test identifiers;
- unsupported historical claims;
- unresolved TODO markers;
- inconsistent punctuation; and
- citations that do not fully account for the source statement.

Resolve or formally record every finding before release.
