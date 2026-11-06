# DIVER.BAS Scheduler Behaviour Specification

**Status:** Living Specification  
**Purpose:** Behavioural reference for reconstruction of the original dive-planning scheduler  
**Historical system:** Compucolor 8001  
**Original software:** DIVER.BAS  
**Development period:** 1978–79; demonstrated at the Royal College of Art Degree Show, 1979

## 1. Purpose

This document defines the observed behaviour of the activity scheduler in the original DIVER.BAS program.

It is intended to provide a behavioural reference for the modern JSX reconstruction.

The purpose is not to prescribe a particular JavaScript implementation. The JSX may use different programming mechanisms from the original BASIC, but it must reproduce the behaviour established by examination and testing of the original program.

Where implementation choices arise, the observed behaviour of the original BASIC takes precedence over implementation convenience.

This is a living specification. Further investigation of other parts of the original program may extend or refine it.

## 2. Scheduler Philosophy

The scheduler is predictive rather than purely reactive.

It does not wait until the current activity has finished before asking the user what should happen next.

Instead, it anticipates the forthcoming activity boundary and requests the user's next activity sufficiently early for the response to be available when the transition becomes due.

This allows user interaction and physical simulation to overlap.

The important distinction is that asking for the next activity does not mean that the current activity has ended.

The current activity continues to execute until its own scheduled boundary is reached.

The scheduler therefore separates three things which might otherwise appear to be one operation:

1. requesting the next activity;
2. completing the current activity;
3. activating the next activity.

This separation is fundamental to the observed behaviour.

## 3. Activities

The program represents the dive as a sequence of activities.

The activity record contains, amongst other information:

- activity type;
- target depth;
- activity selection information;
- associated event timing.

The scheduler maintains an active activity while preparing subsequent activity information.

The activity currently being executed therefore must not be confused with the activity which the user has just selected.

## 4. Activity States

For purposes of understanding the scheduler, an activity can be considered to pass through four conceptual states.

### 4.1 Created

An activity record has been established and its parameters have been calculated.

At this point it exists within the scheduler but has not necessarily become the currently executing activity.

### 4.2 Requested

The scheduler asks the user to provide the next activity.

The original program displays:

`WHICH ACTIVITY REQUIRED (...)`

The user's response is obtained before the event boundary.

### 4.3 Queued

The user's response has been accepted and the corresponding activity information is available to the scheduler.

The current activity nevertheless continues to execute.

The queued activity does not prematurely replace the current activity.

### 4.4 Activated

When the appropriate event boundary is reached, the scheduler advances to the next activity and that activity becomes the active activity.

This is the actual activity transition.

## 5. Look-Ahead Scheduling

The principal scheduler test is line 3010:

`IF CL<ES(EP,2)-IK THEN 3400`

The variables relevant to this decision are:

- `CL`  -  simulation clock;
- `ES(EP,2)`  -  scheduled event time for the current event;
- `IK`  -  look-ahead interval.

The scheduler therefore begins preparing the next activity when:

`CL >= event time - IK`

It does not wait for:

`CL >= event time`

before requesting the user's response.

This is the mechanism which permits the program to obtain user input in advance.

## 6. IK Behaviour

The look-ahead interval is established by lines 1316–1317:

`1316 IK= TK`

`1317 IF IK <0.5 THEN IK= 0.5`

Consequently, during accelerated execution where the relevant time increment is below 0.5, the look-ahead interval is nevertheless at least 0.5.

The observed accelerated traces therefore show a look-ahead interval of approximately 0.5 simulation time units.

IK controls when the next activity is requested.

It does not indicate that the current activity has completed.

It does not itself cause the activity transition.

## 7. Event Boundaries

Each scheduled activity has an associated event time.

The event time is represented by `ES(EP,2)`, where `EP` identifies the current event.

The scheduler uses the event time to determine when the current activity should give way to the next one.

The look-ahead test and the eventual activity transition are therefore separate operations.

The important distinction is:

- Look-ahead boundary: event time minus IK
- Actual event boundary: event time

The first initiates preparation.

The second permits transition.

## 8. User Input Does Not Stop the Current Activity

This is one of the most important findings from the experimental investigation.

Once the scheduler has requested `WHICH ACTIVITY REQUIRED (WORK)`, the user may enter `WORK` immediately or after further simulation cycles have occurred.

The current activity does not stop simply because the next activity has been requested.

The WD40 accelerated test demonstrates this particularly clearly.

The user did not enter `WORK` until after the simulation clock had advanced to approximately 1.0.

During that period, the diver continued descending.

The scheduler therefore does not implement a simple prompt-then-change-activity sequence.

Its observed behaviour is effectively:

Look-ahead reached → request next activity → obtain/store response → continue current activity → reach boundary → activate next activity.

## 9. DESCEND Movement

The DESCEND activity contains the critical movement logic around lines 3400–3409.

The relevant section is:

`3400 IF AL(AL,1) <> 1 AND AL(AL,1) <> 2 THEN 3410`

`3402 IF AL(AL,1)= 2 THEN 3406`

`3403 IF AD+DR*TK>AL(AL,4) THEN 3405`

`3404 AD=AD+ DR* TK:GOTO 3410`

`3405 AD= AL(AL,4):GOTO 3410:REM BOTTOM REACHED`

For a descent:

- the next depth is calculated from the current depth, descent rate and time increment;
- if the calculated depth does not exceed the target, line 3404 advances the diver;
- if the calculated depth would exceed the target, line 3405 clamps the depth exactly to the target.

The clamp is therefore part of completion of the DESCEND activity.

## 10. Bottom Clamp

The distinction between lines 3404 and 3405 proved critical to the investigation.

Line 3404 represents an ordinary descent increment.

Line 3405 handles the final increment when the next calculated movement would pass the target depth.

Conceptually:

- Current depth plus movement is less than or equal to target: ordinary movement.
- Current depth plus movement is greater than target: clamp exactly to target.

The clamp therefore prevents the simulation from stepping beyond the requested working depth.

It is not merely a display correction.

It is part of the activity's execution.

## 11. Ordering of Movement and Activity Transition

The original program does not activate the next activity merely because the user has supplied its details.

The current activity continues through its movement logic.

Where required, the bottom clamp is executed.

Only subsequently does the activity transition occur at the appropriate event boundary.

For a descent to a working depth, the expected sequence is:

DESCEND active → look-ahead reached → request next activity → user enters WORK → DESCEND continues → ordinary movement cycles → bottom clamp if required → target depth reached → event boundary reached → current activity ends → WORK becomes active.

## 12. Experimental Evidence

The scheduler behaviour was investigated using diagnostic instrumentation added to the original BASIC and executed under CCEMU.

The principal accelerated test cases included working depths of:

- 10 metres;
- 16 metres;
- 40 metres.

The traces demonstrated the same fundamental ordering in each case.

### WD10

The diver initially moved to 7.5 metres.

The next movement would have exceeded the 10 metre target.

Line 3405 therefore executed and set the depth to exactly 10 metres.

The bottom-time prompt followed.

The WORK activity was then established.

### WD16

The diver continued through further movement cycles.

The next movement would have exceeded 16 metres.

Line 3405 executed and clamped the diver to exactly 16 metres.

The bottom-time prompt followed.

### WD40

The longer descent provided particularly useful evidence because the user did not immediately provide the requested WORK response.

The scheduler continued executing DESCEND while waiting for the response.

After further descent cycles, line 3405 executed and clamped the diver to exactly 40 metres.

Only then did the bottom-time stage follow.

The consistency of these observations across different working depths demonstrates that the behaviour is a property of the scheduler rather than a special case associated with a particular depth.

## 13. The 7.5 Metre JSX Problem

The original investigation was prompted by a discrepancy in the JSX reconstruction.

For a requested working depth of 10 metres, the JSX was stopping the diver at 7.5 metres rather than continuing to 10 metres.

The original BASIC trace demonstrated that this was not the expected behaviour of the original system.

The critical evidence was the execution of line 3405.

The original BASIC executes the bottom clamp when the next movement would exceed the target depth.

Therefore, 7.5 metres is an intermediate state, not the completed descent.

The original program subsequently sets the depth to 10 metres through the bottom-clamp logic.

The problem was therefore not a calculation of the target depth. It was a difference in the timing and ordering of scheduler operations.

## 14. Architectural Interpretation

The experimental evidence indicates that the scheduler maintains a distinction between:

**Current activity**  -  the activity whose physical behaviour is currently being simulated.

**Next activity**  -  the activity requested by the user in anticipation of the upcoming boundary.

**Event**  -  the scheduled point at which the current activity gives way to the next.

These concepts must remain separate in the JSX.

In particular:

> Receiving the user's next-activity response must not itself terminate the current activity.

## 15. Requirements for the JSX Scheduler

A conforming JSX implementation shall:

1. Maintain a clearly identifiable current activity.
2. Permit the scheduler to request the next activity before the current activity has completed.
3. Preserve the current activity while the user supplies the next activity.
4. Store or otherwise retain the user's response without immediately replacing the active activity.
5. Continue simulation of the current activity after the response has been received.
6. Execute the complete movement logic of the current activity.
7. Execute the bottom clamp when a descent step would exceed the target depth.
8. Reach the exact target depth before completing the descent.
9. Treat the event boundary as distinct from the look-ahead prompt boundary.
10. Activate the queued activity only when the appropriate event boundary is reached.
11. Preserve the logical ordering of the BASIC wherever practical.
12. Avoid solving the observed discrepancy merely by forcing the displayed depth to the target value.

The underlying execution sequence must be correct.

## 16. Preservation of BASIC Structure

The JSX project has an additional preservation objective beyond reproducing visible behaviour.

Where practical, the JSX should retain recognisable correspondence with the BASIC's organisation and logic.

This does not require literal translation of BASIC syntax.

It does require that a reader familiar with both languages can identify the relationship between the original algorithm and its modern implementation.

In particular, the scheduler should not be replaced by an unrelated abstraction merely because that abstraction is more idiomatic in modern JavaScript.

Modern implementation mechanisms are acceptable where necessary, but the original logical structure should remain visible wherever practical.

## 17. What This Specification Does Not Prescribe

This document does not prescribe:

- React component structure;
- state-management library;
- JavaScript syntax;
- timer implementation;
- rendering implementation;
- CSS;
- animation mechanism;
- particular variable names.

Those are implementation decisions.

The specification defines the behaviour those implementation decisions must produce.

## 18. Regression Behaviour

The experimentally established WD10, WD16 and WD40 cases should be retained as regression tests.

A scheduler change should not be considered successful merely because the WD10 display eventually reaches 10 metres.

It must also preserve the ordering demonstrated by the original program:

look-ahead → prompt → current activity continues → movement → clamp where necessary → event boundary → next activity activation.

The purpose of the regression tests is therefore to verify both state and sequence.

## 19. Current Understanding

The scheduler investigation has established that the original DIVER.BAS program contains a deliberate separation between user interaction and physical activity execution.

The program anticipates the user's next decision while continuing to simulate the current dive activity.

This allows the graphical simulation to remain continuous while giving the user sufficient time to make the next decision.

The discovery is significant because this behaviour is not immediately obvious from the final graphical result.

It emerges from the relationship between the scheduler, event timing, user input and movement routines.

The scheduler should therefore be regarded as an event-driven mechanism with look-ahead interaction rather than as a simple sequence of input followed by activity.

## 20. Living Specification

This document records the scheduler behaviour established so far.

It should be extended if further examination of the original BASIC, CCEMU execution, or additional controlled experiments reveal behaviour not currently covered.

New conclusions should be based upon evidence from the original program wherever possible.

The purpose of maintaining this specification is to prevent the JSX implementation from gradually becoming an interpretation of the original behaviour rather than a reconstruction of it.

The governing principle is:

**Translate the algorithm, preserve the behaviour, and, wherever practical, preserve the structure.**
