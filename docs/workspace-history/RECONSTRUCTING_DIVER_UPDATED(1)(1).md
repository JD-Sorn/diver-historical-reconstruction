# Reconstructing DIVER
## Method, Evidence and Preservation

**Status:** PUBLICATION DRAFT  
**Source basis:** Corrected `DIVER.BAS`, controlled execution and diagnostic evidence, surviving manuscript and photographic evidence, contemporary hardware documentation, and the verified v13 browser reconstruction  
**Document purpose:** Methodological history of the reconstruction of the 1978–79 DIVER BASIC program  
**Scope:** This document explains how the behaviour of the original program was recovered and preserved. It is a companion to *DIVER, 1978–79: Design and Implementation*, which analyses the historical program itself, and to the technical component guide, which documents the reconstructed architecture.

---

## 1. Introduction

The reconstruction of DIVER began as what appeared to be a relatively straightforward software task: translate a surviving late-1970s BASIC program into a modern environment while reproducing its visible behaviour.

That description proved inadequate.

The project gradually became an exercise in experimental software archaeology. Static source translation was not enough to recover timing, display state, shared-variable effects, predictive prompting, event boundaries or historically odd activity transitions. Behaviour that looked incorrect in the modern implementation sometimes turned out to be faithful to the original; behaviour that looked plausible sometimes concealed a fundamental misunderstanding of the BASIC control flow.

The central methodological change was therefore a shift from asking:

> How should this BASIC be rewritten in JavaScript?

To asking:

> What does the surviving program actually do, and what evidence is sufficient to establish that behaviour?

The distinction shaped every later stage of the project.

---

## 2. From Translation to Reconstruction

A literal source-to-source approach is attractive because the BASIC appears, at first glance, structurally simple. It contains numbered statements, `GOSUB` routines, `IF...THEN` branches, `READ/DATA`, direct terminal plotting and user input.

But direct syntactic correspondence does not guarantee behavioural correspondence.

The original program executes sequentially in a stateful BASIC and terminal environment. The modern reconstruction runs in React, where rendering, state updates, user input and timed execution are separated differently. A modern implementation can therefore preserve the apparent algorithm while changing the timing relationship between operations.

The project encountered this repeatedly. Cursor state, Plot Mode, audible bell behaviour, movement timing, prompt timing and retained variables all proved capable of changing the historical result even where the surrounding control logic looked equivalent.

The reconstruction consequently moved towards a smallest-change, evidence-led discipline. Features were not modernised merely because a contemporary implementation could be cleaner. Odd behaviour was treated as evidence until comparison with the original showed otherwise.

---

## 3. Evidence Discipline

The project eventually adopted an explicit evidence discipline. The corrected BASIC is the primary historical artefact. Observed execution is the primary evidence for resolving ambiguous, timing-dependent or machine-dependent behaviour in that source. Manuscript additions, photographs and contemporary manuals supply other kinds of evidence which neither source reading nor execution can provide alone.

The working order is therefore:

1. the surviving and corrected BASIC source;
2. observed execution of that source, particularly where static reading is insufficient;
3. surviving manuscript and original project photographs;
4. contemporary hardware documentation;
5. the modern JSX reconstruction.

The important consequence is that the reconstruction is never allowed to become the authority for how DIVER ought to behave.

If the JSX behaves one way and the original BASIC behaves another, the disagreement is evidence against the JSX unless there is stronger evidence that the BASIC under test is itself not representative of the surviving program.

This principle prevented several plausible but incorrect modernisations from becoming accepted simply because they produced smoother or more intuitive behaviour.

Project status and historical evidence are not equivalent. Terms such as **Proposed**, **Applied** or **Verified** describe progress within the reconstruction workflow. Terms such as **demonstrated by source**, **demonstrated by observed execution**, **supported by manuscript evidence** and **interpretation** describe the basis for a historical claim. A completed implementation status does not strengthen the historical evidence behind it.

---

## 4. Emulator Work as Experimental Archaeology

Running the original BASIC became essential because static reading could not answer every behavioural question.

The emulator provided a controlled environment in which questions could be tested directly against the historical program. These experiments addressed issues such as:

- whether movement continues after an early activity prompt;
- when a depth is clamped to its target;
- whether repeated activities are accepted;
- how unusual decompression sequences behave;
- whether a displayed anomaly belongs to the original or the reconstruction;
- and how machine-specific `PLOT` operations affect visible output.

The process resembled experimental archaeology: reproduce a condition, observe the original artefact's behaviour, vary one factor where possible, and use the result to refine or reject an interpretation.

This was particularly important for the scheduler.

---

## 5. The Scheduler as the Turning Point

The scheduler became the point at which the project decisively stopped being a translation exercise.

An early reconstruction produced a superficially plausible result during descent. When the program asked for the next activity before the target working depth had been reached, the modern implementation effectively treated the prompt as the end of the movement. A requested 10 m descent could therefore appear to stop at approximately 7.5 m.

The obvious explanation was that the reconstruction had calculated the depth incorrectly.

That explanation was wrong.

Controlled tests of the original BASIC at multiple working depths established that the prompt itself was early. The historical program was asking for the next activity before the current descent had physically completed. After the operator answered, movement continued until the true target boundary was reached and clamped.

The key conceptual discovery was therefore:

> The prompt boundary and the physical completion boundary are not the same event.

The original program performs predictive interaction. It gathers the next activity in advance and retains that answer while the present activity continues.

This required a structural change in the JSX reconstruction. The answer could not immediately create and start the next activity. It had to be queued while the current activity remained active until its actual boundary.

The scheduler was subsequently tested across a range of working depths, staged WORK sequences and REAL-mode behaviour. Once those tests converged, the scheduler logic was treated as closed unless new source evidence emerged. The resulting rules are recorded separately in `SCHEDULER_SPEC.md`; the important point here is methodological: the early prompt was established as a scheduled look-ahead event rather than a movement boundary.

This episode changed the reconstruction philosophy. It showed that plausible modern behaviour was not sufficient evidence and that the original program's timing relationships had to be recovered experimentally.

---

## 6. Why Abnormal Tests Became Important

Normal-path testing is necessary but insufficient for historical reconstruction.

Initially, the most obvious tests were ordinary dive sequences: descend, work, ascend, decompress where required, and return to the surface. Those tests establish that the program can perform its intended demonstration path, but they do not expose the boundaries of its actual control model.

Unusual sequences proved more informative.

Tests included combinations such as:

- REST while submerged;
- DECOMPRESS when no decompression obligation existed;
- repeated DECOMPRESS;
- WORK followed by WORK;
- repeated ASCEND;
- deeper DESCEND during decompression;
- surface WORK;
- zero-distance ASCEND.

These tests helped separate two categories which must not be confused:

1. a defect introduced by the reconstruction;
2. an oddity or failure mode present in the original program.

A faithful reconstruction sometimes has to preserve the second category rather than correct it.

---

## 7. Reconstruction Defects versus Historical Behaviour

Several issues initially looked similar on screen but had very different evidential status.

Examples of genuine reconstruction defects included:

- treating an early predictive prompt as physical movement completion;
- approximating non-WORK source vectors with per-tick rectangles and later compensating with remembered columns or artificial corner joins;
- committing a coloured WORK fragment on a tick which should terminate with an original `OUT OF RANGE` path;
- allowing activity handoffs to use inconsistent rendered coordinates, producing gaps or apparent movement backwards in time;
- translating a fractional BASIC array subscript by truncating it, which selected the wrong decompression-table row and delayed an `OUT OF RANGE` stop by several display passes.

Examples of behaviour preserved because it was observed in the original included:

- REST terminating at the current depth;
- DECOMPRESS being accepted in situations where a modern safety-oriented program might refuse it;
- repeated ASCEND eventually reaching an original BASIC error in some abnormal sequences;
- permissive transitions which do not form a defensive modern state machine.

The governing rule became simple:

> Do not repair an oddity merely because it looks wrong. First determine whether the oddity belongs to the reconstruction or to DIVER itself.

---

## 8. Reconstructing the Display

Display fidelity presented a different class of problem because the original program writes directly to a stateful terminal environment.

The BASIC relies on `PLOT` commands, colour codes, cursor positioning, Plot Mode, character cells and direct screen updates. These operations do not map naturally onto a modern DOM/SVG environment.

Some original statements therefore have no literal modern equivalent. For example, a command whose purpose is to exit a shared terminal Plot Mode may require no functional operation in a reconstruction where graphical and textual rendering are already separated. Conversely, an audible terminal bell does require an explicit modern equivalent if its behavioural effect is to be preserved.

This led to a historical-first commenting rule for non-translatable operations: record the original operation, explain why it mattered, state the reconstruction's disposition, and identify the behavioural effect that remains to be preserved. The finished form of that rule is now maintained in the formal Style Standard rather than in development comments.

The display work therefore became both graphical reconstruction and hardware interpretation. Direct terminal character writes had to remain ordered and persistent: a routine changes only the cells it addresses, and later writes must not overtake earlier writes. Blink had to be treated as a shared display attribute rather than another character transaction. Browser pacing had to remain separate from BASIC simulated time.

The graphical profile required a further change in approach. The non-WORK path had initially been approximated as one rectangle per tick. Diagnostic BASIC programs, source arithmetic and the 1979 photographs instead established a sequence of complete vertical Compucolor raster cells. DESCEND and ASCEND therefore consist of discrete vertical strokes with small regular separations. WORK produces its coloured DT columns and its position track separately; the track is solid outside visible bands and regularly dotted through them. WORK, DECOMPRESS and REST use a common displayed horizontal thickness.

The decisive improvement was to derive every activity handoff from shared source coordinates. This removed the need for remembered rendered columns and arbitrary corner repairs, and prevented the profile from appearing to move backwards in time. Photographs remained valuable tests of interpretation, but they were not used to override defensible source arithmetic merely to improve visual resemblance.

Two smaller examples show why visible fidelity cannot be treated as superficial. Reproducing `CHR$(7)` required a shared Web Audio mechanism which can be armed until the browser receives a permitted user gesture. A visually incorrect `OUT OF RANGE` screen initially looked like a render-order problem but proved to originate in numeric subscript conversion selecting the wrong decompression-table row. In both cases a presentation symptom exposed the boundary between recovered program behaviour and the modern host.

---

## 9. React as Both Tool and Hazard

React made it practical to recreate DIVER in a contemporary environment, but its programming model also introduced hazards.

The original BASIC executes in a largely synchronous sequence with globally persistent variables. React separates state updates, rendering, event handlers and timed callbacks. A direct conversion of every BASIC variable into ordinary React state can therefore perturb the timing of the simulation itself.

The settled reconstruction keeps translated `BASIC_*` state synchronously available at module level, mirroring the source's shared variable environment. React state holds visible collections whose changes must render, while refs hold continuation points, output-busy state, focus controls and STOP/END latches which must persist without themselves scheduling a render. Display queues serialise character and graphical transactions where source order is visible.

Graphics are staged where necessary so that a visible change is committed only if the corresponding BASIC path completes successfully. Conversely, a source graphic which precedes a later STOP remains visible because the original drawing had already occurred.

This was not an attempt to reproduce BASIC implementation style for its own sake. It was a way of preventing modern framework behaviour from altering observable historical behaviour.

The hidden keyboard input is positioned across the simulation display so that a click within the reconstructed screen restores focus without introducing prompt-dependent scrollbars. The audible bell, trivial as a single character output in BASIC, requires an explicit audio context and activation handling. These mechanisms are host accommodations: neither is permitted to alter scheduler state or simulated time.

The broader lesson is that a newer programming environment can introduce temporal and interaction assumptions which are invisible in a purely algorithmic comparison. Faithful reconstruction requires those assumptions to be identified and contained.


### Host-environment fidelity: the initial bell

The initial WORKING DEPTH bell remains a useful preservation case. In the BASIC, `CHR$(7)` asks the terminal to sound its bell directly. The browser reconstruction instead maintains one shared audio context, arms the cue when immediate playback is not permitted, and starts it on the first available pointer or keyboard gesture. The tone remains latched until the corresponding INPUT completes or the program reaches END.

This preserves the historical interaction without inventing an `enable sound` control. Any delay imposed before the first permitted gesture belongs to the browser's activation policy, not to DIVER's simulation logic.

---

## 10. Development and Regression Discipline

The project adopted an incremental workflow built around small changes and targeted retesting.

Important practices included:

- preserving a canonical BASIC reference;
- using diagnostic BASIC variants for controlled experiments;
- recording findings in an append-only project log;
- maintaining a TODO/register of unresolved matters;
- using version control;
- making the smallest change consistent with the evidence;
- retesting affected paths rather than repeatedly reopening experimentally closed areas;
- distinguishing source-analysis questions from reconstruction defects.

AI-assisted work was divided functionally between implementation/problem-solving and independent record/checking tasks. This separation helped maintain a decision trail while reducing the risk that an attractive implementation explanation would become its own verification.

The final standard was not merely that DIVER should appear to work. Each change had to survive comparison with the original behaviour relevant to that change.

The late `OUT OF RANGE` investigation is a compact example of that discipline. Several plausible render-order hypotheses were tested and rejected. A purpose-built trace then showed that the failing call was `GOSUB 6750/[6763]`, not the initially suspected `GOSUB 6100/[6181]`. A second trace exposed `J=16.5` being truncated to decompression-table row 16 in JSX; changing the subscript conversion restored the original screen behaviour. The sequence is a useful reminder that a graphics mismatch can be evidence of a numerical-semantics error rather than a graphics error.

---

## 11. The Source-Comment Audit and 575/575 Traceability

As the executable reconstruction stabilised, the comments themselves became a preservation issue.

During development, comments had accumulated several kinds of material:

- correct source citations;
- working theories;
- test history;
- implementation explanations;
- stale assumptions;
- and descriptions which had become detached from the exact BASIC lines they purported to explain.

The source was therefore subjected to a separate comment audit.

The governing question became:

> What exact BASIC line or lines does this comment describe?

Comments which could not answer that question were rewritten, split, relocated or removed. Where the BASIC construct had no literal JSX equivalent, the comment had to record the original operation and its modern disposition rather than silently omitting it.

The audit also exposed the distinction between printed source and manuscript amendments. The handwritten changes around `[1279]`, `[1281]`, `[1308]` and `[5560]/[5561]` were explicitly marked as such rather than allowed to appear as ordinary typed source lines.

A coverage sweep then checked every numbered BASIC line against the JSX comments. The result was **575/575 surviving BASIC lines explicitly traceable in the reconstruction**.

This does not mean that every line has a one-to-one executable translation. `REM` lines, `RETURN`s, terminal state operations and consolidated `READ/DATA` structures may have different modern dispositions. It means that every surviving source line has been considered and that a future reader can locate what happened to it.

Coverage alone was not treated as completion. Every comment then underwent a semantic and prose review: compound PLOT streams were checked for omitted trailing codes; citations were checked against the exact source statement; JSX-only logic was separated from direct translation; damaged fragments, ambiguous branch names and build references were removed; and a final punctuation sweep distinguished literal BASIC comments from explanatory sentences. Comment-only changes were independently reviewed without treating them as executable verification.

That traceability became an important form of confidence precisely because some aspects of the historical project remain unknowable. The permanent source comments now document source behaviour and material reconstruction differences; the development history remains in separate registers and papers.

---

## 12. What AI Contributed  -  and What It Could Not Establish

AI assistance was useful throughout the reconstruction for code comparison, hypothesis generation, targeted edits, source searches, test planning and documentation.

It was not treated as historical authority.

The comment-audit phase provided a particularly clear example of why that distinction matters. An AI-assisted clean-up pass could produce a polished-looking result while silently dropping provenance elsewhere. One pass corrected a scrambled block but removed the opening `REM`-line citation from several neighbouring subroutine headers. A subsequent pass restored those headers but still left other incomplete comment text. Later, a stricter coverage check exposed remaining citation gaps which earlier checks had treated as complete.

The failure mode was therefore not spectacularly incorrect output. It was **premature confidence in completeness**.

The methodological response was to replace assertions such as “the audit is complete” with independently checkable conditions:

- every BASIC line must be searchable in the JSX;
- a coverage check must report no omissions;
- comment-only edits must produce no executable difference when comments are mechanically stripped.

AI remained highly useful once its claims were subjected to those external checks.

The project also demonstrated limits which no AI inference could legitimately remove: undocumented authorial intention, the exact chronology of manuscript amendments, and the division of responsibility between design specification and implementation where the surviving evidence does not say.

---

## 13. When Reconstruction Became Preservation

The project's goal changed over time.

At first, success meant making a modern version of DIVER behave convincingly.

Later, that became insufficient. The reconstruction had to preserve peculiarities, document uncertainty, distinguish manuscript layers, retain original failure modes where demonstrated, and make every surviving source line traceable.

The work therefore moved from software conversion towards preservation.

That shift also changed the meaning of completeness. A reconstruction can be executable while still concealing assumptions. Preservation requires the assumptions themselves to be visible and the limits of knowledge to be recorded.

---

## 14. Lessons for Similar Reconstruction Projects

Several general lessons emerge from the DIVER work.

### Do not modernise too early

Cleaner contemporary behaviour may be less historically accurate.

### Do not infer timing from static code alone

Prompt timing, movement timing and display timing may have relationships that are only visible during execution.

### Treat anomalies as evidence before treating them as defects

An odd result may belong to the original program.

### Build controlled experiments

Small comparative tests often resolve questions more reliably than increasingly elaborate reasoning from source alone.

### Keep an explicit evidence hierarchy

The modern reconstruction should never silently become the authority for the historical artefact.

### Separate implementation from interpretation

A modern framework may need a very different internal mechanism to produce the same observable result.

### Preserve uncertainty

Where evidence cannot establish intention or chronology, the final documentation should say so.

### Make the reconstruction auditable

Traceability, version history and mechanical checks provide stronger confidence than a claim that the reconstruction has been thoroughly reviewed.

---

## 15. Conclusion

Reconstructing DIVER required more than translating BASIC syntax into modern code. It required recovering an execution model, a display environment, a scheduler, a permissive activity system and a collection of historically specific behaviours whose significance only became clear through repeated comparison with the original.

The most important methodological change was the move from implementation confidence to evidential confidence. A behaviour was not accepted because the JSX looked right; it was accepted because the source, observed execution or manuscript evidence supported it.

The resulting reconstruction is therefore intended not merely to run, but to remain inspectable. Its strongest claim is not that every historical question has been answered. It is that the surviving evidence has been treated explicitly, uncertainties have been preserved, and every numbered line of the original BASIC has a visible disposition in the modern source.

The companion historical paper analyses what the program itself reveals. `SCHEDULER_SPEC.md`, the Program Components and Relationships guide, the user manual, the formal Style Standard and the verification registers provide the corresponding technical and evidential detail.
