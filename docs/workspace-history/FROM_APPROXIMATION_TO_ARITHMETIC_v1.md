# From Approximation to Arithmetic
## The Evolution and Verification of the DIVER Reconstruction

**Status:** PUBLICATION DRAFT  
**Subject:** Reconstruction of the 1978–79 DIVER diving simulation  
**Original project design:** Dagfinn Aksnes  
**Original BASIC implementation:** Dr George Mallen  
**Reconstruction:** John Dunlop  
**Source basis:** Corrected `DIVER.BAS`, controlled execution and diagnostic
programs, surviving manuscript and photographic evidence, contemporary
hardware documentation, and the verified browser reconstruction  

**Document purpose:** This paper records the development history of the
reconstruction: the initial requirement, the early use of estimates and visual
approximations, the discoveries made by testing the original program, and the
eventual replacement of compensating graphics code with source-derived
Compucolor raster arithmetic.

It is a companion to *Reconstructing DIVER: Method, Evidence and Preservation*,
which describes the evidential method, and *DIVER, 1978–79: Design and
Implementation*, which examines what the historical program itself reveals.

---

## 1. The Initial Requirement

The initial requirement appeared simple: make the surviving DIVER BASIC
program run in a modern browser while retaining the behaviour and appearance
of the 1978–79 original.

The intention was not to redesign DIVER as a contemporary dive-planning
application. It was to reconstruct the historical program closely enough that
its sequence of questions, simulated dive, decompression calculations, dynamic
display and distinctive profile graphics could be experienced again.

That requirement contained several hidden difficulties. DIVER was written for
a Compucolor/Intecolor 8001-family terminal environment with two coordinate
systems, retained display attributes, direct cursor control, serial character
writes and machine-specific `PLOT` operations. Its BASIC also depended on
global variables, permissive array use, `GOSUB` routines and control flow whose
timing was not obvious from a static reading.

The early strategy was therefore practical and incremental:

1. establish the screen geometry;
2. reconstruct the static display areas;
3. translate prompts and input;
4. reproduce the dive loop and activities;
5. add the Display Monitor and profile graphics;
6. compare the result with the surviving photographs and executable BASIC;
7. correct discrepancies as they appeared.

This was a sensible way to begin. It produced visible results quickly and made
individual parts of the program available for inspection. It did not, however,
yet distinguish between a plausible modern equivalent and a demonstrably
faithful reconstruction.

> **FIGURE MARKER 1  -  INITIAL RECONSTRUCTION**  
> Insert a screenshot of an early runnable JSX version showing the principal
> screen areas, prompts and approximate dive profile. A caption should explain
> that the broad visual structure was present before the scheduler and raster
> behaviour were fully understood.

---

## 2. Building the Screen from Measurements and Estimates

The first substantial work concentrated on the visible display. The surviving
photographs established the broad arrangement:

- a cyan information area across the top;
- a blue graphical area below;
- the Display Monitor at the upper right;
- the vertical `5 METRE UNITS` label and depth marks at the left;
- the dive profile moving from left to right;
- coloured decompression-table bands during WORK;
- changing numerical and textual information in the Display Monitor.

At this stage, measurement and estimation were unavoidable. Photographs could
be used to estimate the location and proportions of the Display Monitor, the
cyan/blue boundary, the depth scale and the profile. Contemporary manuals
helped interpret control codes, but the exact relationship between the 8001's
text grid, graphical raster and a responsive SVG display still had to be
worked out.

The reconstruction consequently began with a mixture of evidence:

- coordinates read directly from BASIC;
- dimensions inferred from loops and cursor positions;
- measurements taken from photographs;
- observations made in an emulator using related Compucolor behaviour;
- and visual adjustments needed to make the browser display resemble the
  historical screen.

This mixture was productive but potentially dangerous. An estimate could be
mistaken for a source fact, and a visually convincing result could conceal an
incorrect interpretation of the program.

The project therefore began recording not merely what had been implemented,
but how each conclusion had been reached. Photographic evidence, source
arithmetic, emulator behaviour and modern rendering choices were increasingly
kept distinct.

> **FIGURE MARKER 2  -  SOURCE PHOTOGRAPH AND MEASURED LAYOUT**  
> Insert a surviving 1979 screen photograph beside a reconstruction screenshot
> or annotated layout. Useful call-outs would identify the cyan area, Display
> Monitor, depth scale, graphical raster and dive-profile origin.

---

## 3. Working Through the Program Piece by Piece

Development initially proceeded in BASIC line-number order and by visible
feature. Small test components were used for the coordinate system, cyan
screen area, Display Monitor, title, labels, scales, gauges and plot routines.
The main JSX file accumulated the parts which had survived those tests.

The process was often described as testing, but in practice each test could
contain four activities:

- forming a hypothesis about what a BASIC section did;
- implementing that hypothesis;
- running a controlled comparison;
- analysing whether the result supported or rejected the hypothesis.

This was test-as-you-develop rather than a clean separation between completed
development and later verification. Recognising that fact improved the project
records: a component could be visibly present without yet being historically
confirmed, and a successful test of one branch did not prove that all branches
of the same subroutine existed in the reconstruction.

The testing plan therefore evolved from a list of screen features into a
line-number, `GOSUB` and branch-coverage structure. Periodic stocktakes asked:

- Is the BASIC section fully traced or only partly understood?
- Are all branches implemented, or only the one reached by the current test?
- Does the assumed set of call sites match the actual source?
- Is a routine complete, absent, or represented only by a stub?
- What evidence supports the present conclusion?

This more exact structure exposed gaps which an attractive running screen had
hidden.

---

## 4. The Scheduler Changed the Nature of the Project

The scheduler was the first decisive turning point.

During an accelerated descent the browser reconstruction could ask `WHICH
ACTIVITY REQUIRED` before the diver reached the requested working depth. The
early implementation effectively treated that question as the end of the
descent. A requested depth of 10 m could therefore appear as approximately
7.5 m both in the profile and in the Display Monitor.

It looked like an arithmetic defect. Controlled runs of the original BASIC
showed otherwise.

The historical program deliberately asks for the next activity before the
current activity is physically complete. The answer is predictive: it is
collected and retained while the diver continues moving to the true boundary.
Only then is the next activity committed.

The distinction can be stated simply:

> The prompt boundary is not the physical movement boundary.

This finding required an architectural rewrite. Input could no longer create
and start the next activity immediately. The reconstruction had to preserve a
pending answer while the current activity continued, reached its target and
was clamped at the correct depth.

Tests at several working depths confirmed the pattern. They also established
the relationship between simulated time and movement:

- accelerated mode uses `TK = 0.25`;
- descent rate is `DR = 30` metres per simulated minute;
- ascent rate is `AR = 15` metres per simulated minute;
- the predictive look-ahead uses `IK = max(TK, 0.5)`;
- movement and event scheduling are related, but not identical.

Once the scheduler rules had been derived, they were documented separately
and subjected to regression tests. Scheduler behaviour was then frozen so
that later display work could not silently disturb it.

> **FIGURE MARKER 3  -  PREDICTIVE PROMPTING**  
> Insert paired screenshots or a short sequence showing the early activity
> prompt and the diver subsequently reaching the requested depth. A WD10
> accelerated example is especially clear because the prompt appears near
> 7.5 m while the descent later completes at 10 m.

---

## 5. Diagnostic BASIC Programs and Controlled Tests

As questions became more precise, running the complete program was no longer
always the best way to answer them. Small diagnostic BASIC programs were
created to isolate individual calculations, branches and `PLOT` operations.
Equivalent isolated JSX components made it possible to compare alternative
rendering interpretations without endangering the integrated reconstruction.

These were the project's practical unit tests. They were not a conventional
automated unit-test suite; they were controlled experiments with narrow inputs
and inspectable outputs.

The most useful forms included:

- tick-by-tick traces of clock, depth and activity state;
- restricted programs which plotted only selected vectors;
- tests of individual `PLOT` codes and serial command streams;
- controlled WD and bottom-time scenarios;
- abnormal activity sequences designed to expose control-flow boundaries;
- isolated JSX graph components which could be revised rapidly;
- side-by-side comparison with surviving photographs.

The method was deliberately conservative:

1. state the question;
2. isolate the smallest relevant source path;
3. record the inputs and source variables;
4. observe the output;
5. change one interpretation at a time;
6. retain the result only if the evidence supports it;
7. rerun the affected regression paths after integration.

This prevented increasingly elaborate explanations from replacing direct
evidence.

---

## 6. WD40/BT20 as an Operational Model

The accelerated `WD40/BT20` dive became particularly useful because one run
exercises most of the important relationships:

- DESCEND from the surface to 40 m;
- WORK for a requested bottom time of 20 minutes;
- coloured decompression-table bands;
- an ascent constrained by decompression requirements;
- DECOMPRESS at a stop depth;
- a final ASCEND;
- changing Display Monitor information;
- several different kinds of graphical join.

At 40 m, the confirmed no-stop limit is 16 minutes, so a bottom time of 20
minutes reliably creates a decompression obligation. This makes the example
more informative than a simple descend–work–ascend profile.

### The descent arithmetic

In accelerated mode:

```text
TK = 0.25
DR = 30 m/min
depth change per full descent tick = DR × TK = 7.5 m
```

The six descent ticks therefore reach:

```text
7.5, 15, 22.5, 30, 37.5, 40 m
```

The final tick is clamped at the requested working depth, so it covers 2.5 m
rather than another 7.5 m.

With `YS = 2`, the corresponding source-Y intervals are:

```text
15, 15, 15, 15, 15 and 5 plot units
```

This became an important test of evidential discipline. The last strokes in a
blurred historical photograph did not appear to have defensibly measurable
proportions. The diagnostic arithmetic was unambiguous. The reconstruction
therefore retained the source-derived 15/15/15/15/15/5 sequence rather than
altering stroke lengths until they looked more like an indistinct photograph.

### The WORK interval

During WORK, the program does not draw an ordinary non-WORK profile stroke. It
scans decompression-table data and constructs coloured raster columns. The
diver's position at constant depth forms a horizontal track. Where that track
passes through visible table bands, the surviving photographs show a regular
dotted cadence; outside them it is solid.

### ASCEND and DECOMPRESS

The subsequent ascent changes depth at 15 m/min and may stop at a required
decompression depth. DECOMPRESS then advances time while depth remains
constant, producing a level horizontal track. A later ASCEND continues from
the same physical and graphical endpoint.

This one operational model therefore tests not just individual activities but
their relationships:

```text
DESCEND → WORK → ASCEND → DECOMPRESS → ASCEND
```

> **FIGURE MARKER 4  -  WD40/BT20 OPERATIONAL SEQUENCE**  
> Insert a completed WD40/BT20 screenshot showing the coloured DT bands,
> dotted WORK track, ascent, decompression level and final ascent. If space
> permits, pair it with the closest surviving 1979 photograph.

---

## 7. Why the First Profile Looked Convincing but Was Wrong

The early profile renderer represented each non-WORK tick as a modern SVG
rectangle or segment. It was visually plausible. DESCEND went down, ASCEND
went up, and flat activities moved horizontally with time.

But the approximation created secondary problems:

- gaps appeared at activity boundaries;
- some joins required remembered rendered columns;
- special handling was introduced for zero-distance ASCEND;
- corner fills were added to connect different activity types;
- a handoff could appear to move backwards in time;
- fixing one sequence could damage another.

These compensations were initially treated as the unavoidable difference
between the original terminal and SVG. Comment review eventually exposed the
weakness in that assumption. A block described as a rendering correction
downstream of BASIC line `[6310]` had no corresponding zero-distance logic in
the source. The question changed from “how should this special case be
explained?” to “why is the special case needed at all?”

That question became the starting point for the graphical rewrite.

---

## 8. A Separate Experimental Graph Stream

The graphical architecture was rewritten in a separate sequence of test
components rather than directly in the integrated program. This protected the
verified scheduler and allowed unsuccessful interpretations to be discarded
without obscuring the working baseline.

The early graph tests established that the dive profile should not be drawn as
one smooth modern line. The photographs showed discrete strokes with small,
regular breaks. More importantly, isolated BASIC diagnostics demonstrated that
the visible non-WORK output was composed of vertical raster strokes. Even when
successive source endpoints advanced in time, the displayed raster operation
placed each depth interval within a vertical plot column.

The experimental versions then explored:

- how source `LP/LQ` time coordinates select raster columns;
- how source `MP/MQ` depth coordinates define vertical intervals;
- how two source ticks may occupy the same or neighbouring columns;
- how DESCEND and ASCEND group into the photographed cadence;
- how the short final clamped interval should remain in sequence;
- how WORK begins after DESCEND and hands off to ASCEND;
- how ASCEND joins DECOMPRESS and REST;
- how the final ASCEND continues after decompression;
- how the dotted WORK track passes through the coloured bands.

Not every experimental version passed. Several looked attractive but failed a
specific comparison. The failed versions were useful because they narrowed the
problem without contaminating the main simulation.

> **FIGURE MARKER 5  -  ISOLATED GRAPH DEVELOPMENT**  
> Insert two or three compact screenshots: an early separated-stroke test, a
> failed join or grouping, and the accepted isolated WD40/BT20 profile. Label
> them as experiments rather than successive claims of correctness.

---

## 9. Returning to the BASIC Arithmetic

The decisive step was to stop treating the BASIC endpoints as hints for a
modern shape and instead reconstruct the display operation generated from
them.

For each non-WORK tick, the source calculates:

```basic
6310 LP=INT(AA*XS)+10:LQ=INT(CL*XS)+10
6313 MP=140-INT(BB*YS):MQ=140-INT(AD*YS)
6320 PLOT 6,32,29,2,253,LP,MP,242,LQ,MQ,255
```

The variables have direct graphical roles:

| Variable | Meaning in the profile calculation |
| --- | --- |
| `AA` | clock value saved before the tick |
| `CL` | clock value after the tick |
| `BB` | depth saved before movement |
| `AD` | depth after movement and any target clamp |
| `XS` | horizontal time scale selected from working depth |
| `YS` | vertical depth scale |
| `LP`, `LQ` | integerised source time coordinates |
| `MP`, `MQ` | integerised source depth coordinates |

The accepted renderer expands the source-derived vertical interval into
complete Compucolor plot cells in its assigned display column. It does not
invent a diagonal between modern pixel coordinates, and it does not use a
generic rectangle whose later joins must be repaired.

This is what “true graphical arithmetic” means in the reconstruction:

- source time determines the raster column;
- source depth determines the vertical interval;
- integerisation occurs where the BASIC performs it;
- target clamping determines the real final interval;
- raster cells determine the displayed stroke;
- adjacent activities meet through shared source coordinates;
- photographs test the interpretation but do not override defensible
  arithmetic.

The term does not imply that every pixel is copied from a photograph. It means
that the visible reconstruction is generated from the historical program's
coordinate arithmetic and the recovered raster behaviour rather than from
independent aesthetic compensation.

---

## 10. Reconstructing the Joins

The activity joins became the clearest test of the new approach.

Under the approximate renderer, a gap could be closed by adding a corner, an
overlap or a remembered column. Such a repair might improve one screenshot
without proving that either activity occupied the correct source position.

Under the arithmetic renderer, each activity arrives with a physical endpoint
and a source-coordinate endpoint. The next activity begins from that same
state. If both paths are rendered consistently, the join follows without an
independent patch.

This was tested across:

- DESCEND → WORK;
- WORK → ASCEND;
- direct DESCEND → ASCEND;
- ASCEND → DECOMPRESS;
- DECOMPRESS → ASCEND;
- ASCEND → REST;
- repeated and zero-distance ASCEND cases.

The integration tests exposed defects which the isolated profile alone could
not show. At one stage the diver appeared to go backwards in time at more than
one transition. At another, small gaps remained at both ends of the WORK
track. These were not disguised with extra shapes; the coordinate grouping was
revisited until the activities met in their proper columns.

The accepted joins were especially important because they were the strongest
visual indication that the activities were no longer separate approximations.
They had become different outputs of one coordinate model.

> **FIGURE MARKER 6  -  ACTIVITY JOINS**  
> Insert close crops of at least DESCEND→WORK, WORK→ASCEND and
> ASCEND→DECOMPRESS→ASCEND. The caption should note that no independent corner
> fills or remembered-column corrections are used.

---

## 11. The Dotted WORK Track and Common Line Weight

The WORK track required its own iteration. The photographs show it as solid
outside the visible decompression-table bands and regularly dotted while it
passes through them.

An integrated attempt added solid endpoint marks to improve activity joins.
Those marks disrupted the cadence: ordinary dots were approximately 5–6
rendered pixels long, while overlaid marks grew to approximately 16 pixels.
The result was visibly irregular.

The endpoint overlays were removed. The accepted implementation retains the
regular alternating point-to-point cadence through the bands and obtains the
activity joins from the underlying coordinates.

WORK, DECOMPRESS and REST were also given one common non-scaling horizontal
stroke thickness. This avoided responsive SVG rounding making one activity
look lighter than another even when their source role was equivalent.

These adjustments illustrate the difference between arithmetic and
presentation. Source coordinates determine where the track lies and where it
begins and ends. A shared rendered thickness and non-scaling stroke preserve a
consistent appearance when that historical geometry is displayed in a modern
responsive browser.

> **FIGURE MARKER 7  -  DOTTED TRACK COMPARISON**  
> Insert a close crop of the accepted dotted WORK track beside the closest
> original photograph. If useful, include the rejected irregular version to
> show why solid endpoint overlays were removed.

---

## 12. Integration Without Reopening the Scheduler

The new graphics were integrated under a strict constraint: rendering changes
must not alter the established scheduler, activity records, decompression
state, simulated time or historical failure paths.

This separation was essential because the graph is produced tick by tick from
live state. A graphical change which accidentally delayed a tick, committed a
future activity early or redrew a rejected WORK fragment could change more than
appearance.

Integration therefore checked both visual and behavioural properties:

- clock and depth still advanced according to `TK`, `DR` and `AR`;
- predictive questions did not stop current movement;
- target depths were still clamped correctly;
- staged WORK activities remained real scheduler activities;
- decompression obligations and stops remained unchanged;
- graphics preceding a genuine BASIC STOP remained visible;
- graphics belonging to an activity rejected before display were not committed;
- focus could be restored by clicking the simulation screen;
- prompts did not introduce persistent viewport scrollbars;
- serial Display Monitor writes retained their source order.

The result was not merely an improved graph placed on top of the old program.
It was a new display implementation constrained to reproduce the same verified
simulation state.

---

## 13. Regression and Independent Review

Each accepted change passed through several levels of checking.

### Source check

The relevant BASIC statements, branches and call sites were traced. Compound
`PLOT` streams were decomposed completely rather than described by their first
few values.

### Isolated test

The smallest relevant diagnostic BASIC or JSX component was run with known
inputs. For the profile rewrite this included individual DESCEND tick counts,
the `N=3` to `N=6` vector diagnostics, different grouping arrangements and
isolated activity sequences.

### Integrated visual test

The accepted mechanism was transferred into the full simulation and exercised
with representative runs. WD40/BT20 was particularly valuable because it
combined WORK bands, decompression and multiple joins.

### Behavioural regression

Previously confirmed scheduler and abnormal-sequence tests were rerun where a
change could affect their path. A graphics fix was not accepted merely because
its screenshot looked better.

### Independent comment and source review

The JSX comments were checked independently against the BASIC. The audit asked
whether every cited claim was accurate, whether any source line had been
silently omitted, and whether comments described direct translations or
modern host accommodations correctly.

This produced a searchable disposition for all 575 surviving numbered BASIC
lines. The coverage count was useful, but semantic review remained necessary:
575 citations can still contain a misleading explanation. The final process
therefore combined mechanical coverage, source comparison and prose review.

---

## 14. What the Photographs Could and Could Not Decide

The surviving photographs were indispensable. They established qualities
which source code alone could not show clearly:

- the overall proportions of the display;
- the raster character of the profile;
- small breaks between vertical strokes;
- the coloured decompression-table form;
- the dotted WORK track;
- relative line weights;
- and the appearance of important activity joins.

They also had limits. Screen curvature, camera angle, blur, phosphor spread,
exposure and the absence of an exact matching tick can make a short line look
longer or shorter than its calculated value. Some photographs do not preserve
enough detail to support a defensible pixel measurement.

The final evidential rule was therefore balanced:

> Use the photographs to identify the kind of display operation and to test
> the resulting appearance. Use the BASIC arithmetic to determine values which
> the photographs cannot measure reliably.

This rule avoided two opposite errors: ignoring visible historical evidence in
favour of a clean modern graph, and distorting sound arithmetic merely to match
an ambiguous photograph.

---

## 15. The Final Reconstruction Strategy

By the end of the process, the working strategy had become much more formal
than the one with which the project began.

1. **Treat the corrected BASIC as the primary historical artefact.**
2. **Use controlled execution to resolve ambiguous or timing-dependent
   behaviour.**
3. **Use photographs and manuals for appearance and hardware semantics.**
4. **Separate historical behaviour from modern host accommodation.**
5. **Develop uncertain mechanisms in isolated test streams.**
6. **Translate source arithmetic at the point where the source performs it.**
7. **Do not introduce visual compensation until the coordinate model has been
   tested.**
8. **Integrate the smallest evidence-supported change.**
9. **Run affected behavioural and visual regressions.**
10. **Obtain independent review before marking the result verified.**
11. **Record uncertainty rather than converting it into a confident guess.**
12. **Keep development history in registers and permanent source comments
    focused on the BASIC and material reconstruction differences.**

This is the route by which an approximate but recognisable port became an
auditable reconstruction.

---

## 16. Conclusion

DIVER was not recovered in one act of translation. It was recovered through a
sequence of increasingly precise questions.

The early reconstruction established that the program could be made visible
and operable in a browser. Measurements and estimates supplied a workable
screen. Feature-by-feature development exposed the BASIC's routines. Scheduler
diagnostics then showed that apparently simple interaction concealed predictive
event handling. Abnormal tests distinguished historical oddities from modern
defects. Isolated graph experiments finally demonstrated that the profile was
not a smooth line or a set of convenient rectangles, but a time-ordered raster
construction derived from the program's own coordinates.

The most important advance was not that the final graph looked better, though
it did. It was that its behaviour became explainable from the BASIC:

- why each descent interval has its length;
- why the final interval is clamped;
- why strokes occupy particular columns;
- why the WORK track is dotted through the bands;
- why activities meet where they do;
- and why no remembered column or artificial corner is required to make the
  profile coherent.

The completed reconstruction therefore rests on more than resemblance. It
rests on source arithmetic, recovered terminal behaviour, controlled testing,
photographic comparison and independent review. The route from approximation
to arithmetic is also the route by which DIVER changed from a modern port into
a documented act of software preservation.

