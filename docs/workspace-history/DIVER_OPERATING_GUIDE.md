DIVER SIMULATION MODEL — Basic Operating Instructions

Purpose

DIVER models a dive as a sequence of activities. You tell the program the working depth and whether you want the simulation to run in REAL or ACCELERATED time. During the dive the program suggests the activity it expects to come next. You may follow that suggestion or select another activity.

The program also keeps track of decompression requirements and displays depth, remaining air indication, no-stop/decompression information and the diver's depth/time profile.

These instructions describe how to operate the program; they are not diving-safety instructions.

Starting a dive

At:

WORKING DEPTH

enter the intended working depth in metres and press RETURN.

The program accepts a value greater than 0 and less than 50. An invalid value causes the question to be repeated.

At:

TIME MODE (REAL OR ACCELERATED)?

type either:

REAL

or:

ACCELERATED

and press RETURN.

REAL runs with the program's fine time step; anything other than the exact word REAL follows the accelerated setting in the BASIC source, although for normal operation the user should explicitly type ACCELERATED.

The dive begins with DESCEND from the surface to the working depth.
Responding to activity questions

During the dive the program asks:

WHICH ACTIVITY REQUIRED (<suggested activity>)

The word in brackets is the program's suggested next activity. The five valid activity names are:

DESCEND
ASCEND
WORK
DECOMPRESS
REST

The prompt appears before the present activity has necessarily finished. Answering it selects what is to happen at the next activity boundary; it does not instantly stop the activity currently in progress.

For straightforward operation, type the required activity name exactly as shown and press RETURN.

There is one important special case during a pre-planned WORK sequence. When the suggested activity is WORK and you simply wish to continue the already prepared staged WORK plan, pressing RETURN without entering another activity allows the stored default WORK continuation to be used. Entering a fresh explicit WORK choice may instead start the WORK-input path again. This behaviour follows the source's special PA-stack handling at lines 1890–1893.

WORK and BOTTOM TIME

When WORK is first selected, the program asks:

BOTTOM TIME

Enter the required WORK/bottom period in minutes and press RETURN.

For deeper dives the program may divide that requested period into several stages at decompression-table boundaries. You may therefore later see a question such as:

IS NEXT STAGE = 6 MIN. REQUIRED

This is not an error. The program is giving you an opportunity to decide whether to continue the previously planned WORK period as the decompression-table situation changes. The source explicitly constructs these staged WORK intervals in GOSUB 5900.

If you wish to continue the proposed stage, answer anything other than NO; in normal use, answer:

YES

If you answer:

NO

the program asks for a new:

BOTTOM TIME

rather than immediately ascending.

Enter a positive number if you want to revise the remaining WORK period. The program recalculates the WORK stages from the present point.

Enter 0 if you want no further WORK. The program then assumes that you want to ASCEND. The source labels this path ASSUME WANT ASCENT-NOT WORK.

ASCEND

Selecting ASCEND does not require you to enter an ascent depth. The program determines the target from its current decompression state.

If no decompression stop is required, ASCEND is directed towards the surface.

If a stop is required, the program directs ASCEND to the appropriate stop depth — 10 m or 5 m — and normally proposes DECOMPRESS next. The ASCEND routine derives the target directly from HT.

DECOMPRESS

DECOMPRESS is normally proposed automatically when the diver reaches a required decompression stop.

The program determines the duration from the current decompression requirement; the operator does not normally type the stop duration. At a 10 m stop it uses the 10 m requirement, and at a 5 m stop it uses the remaining 5 m requirement.

When the stop is complete, the program normally proposes another ASCEND.

DESCEND

DESCEND can also be chosen as a later activity.

When selected, the program asks:

TO WHAT DEPTH

Enter the required target depth in metres.

The new depth may not be shallower than the diver's present depth and may not exceed 50 m; otherwise the program repeats the question.

REST and ending the dive

When REST is selected, the program asks:

FOR HOW LONG

Enter the required REST duration in minutes. Very short values are raised to the program's minimum of 2 × TK.

REST is the terminal activity in the program. When it finishes, DIVER produces the final MEMORY display and ends the run.

The MEMORY display records the final WORK-end BT together with saved decompression information where applicable. For example, our verified WD40 / WORK20 case ends with:

21:45
10M 5:
5M 15

and restores the working depth to the depth display.

A simple novice example

A useful first run is:

WORKING DEPTH 16
TIME MODE ACCELERATED
follow the suggested WORK
BOTTOM TIME 10
follow the suggested ASCEND
then REST
FOR HOW LONG 5

This is a simple non-decompression dive and avoids the additional staged-WORK and decompression questions while learning the controls.