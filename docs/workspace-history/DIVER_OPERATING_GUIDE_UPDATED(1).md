# DIVER SIMULATION MODEL  -  Basic Operating Instructions

## Purpose

DIVER models a dive as a sequence of activities. You enter the intended working depth and choose whether the simulation runs in REAL or ACCELERATED time. During the dive, DIVER suggests the activity it expects to come next. You may follow that suggestion or choose another activity.

The program also keeps track of decompression requirements and displays the diver's depth/time profile together with depth, air and no-stop/decompression information.

These instructions describe how to operate the program. They are not diving-safety instructions.

## Starting a dive

When DIVER displays:

```text
WORKING DEPTH
```

an audible bell is requested. Enter the intended working depth in metres and press RETURN.

On the original system the bell was produced directly by the terminal. In the modern reconstruction, a browser may occasionally suppress this first sound until the page has received a user interaction. This is a host-browser audio restriction only and does not affect the operation of the simulation. Later warning bells are normally unaffected.

The accepted range is greater than 0 m and less than 50 m. An invalid value causes another bell and the question is repeated.

DIVER then asks:

```text
TIME MODE (REAL OR ACCELERATED) ?
```

Type:

```text
REAL
```

or:

```text
ACCELERATED
```

and press RETURN.

REAL runs with the fine simulation time step. ACCELERATED runs the same model more quickly and is normally the convenient mode for demonstration or exploration.

The dive begins with DESCEND from the surface to the working depth.

## Responding to activity questions

During the dive DIVER asks:

```text
WHICH ACTIVITY REQUIRED (<suggested activity>)
```

The word in brackets is DIVER's suggested next activity. The five activity names are:

```text
DESCEND
ASCEND
WORK
DECOMPRESS
REST
```

The question may appear before the present activity has physically finished. Your answer selects what is to happen at the next activity boundary; it does not immediately stop the activity already in progress.

For ordinary use, type the required activity name exactly as shown and press RETURN.

DIVER is deliberately permissive. It will accept some unusual activity sequences rather than prevent them. Such sequences can lead to unusual displays or to one of the program's original error stops. For a straightforward dive, following the suggested activities is the simplest course.

## WORK and BOTTOM TIME

When WORK is selected, DIVER asks:

```text
BOTTOM TIME
```

Enter the required WORK period in minutes and press RETURN.

On deeper or longer dives, DIVER may divide the requested WORK period into stages at decompression-table boundaries. You may therefore later see a question such as:

```text
IS NEXT STAGE = 6 MIN. REQUIRED
```

If you wish to continue the proposed stage, answer anything other than `NO`; in normal use, answer:

```text
YES
```

If you answer:

```text
NO
```

DIVER asks for a new:

```text
BOTTOM TIME
```

Enter a positive number to revise the remaining WORK period.

Enter `0` if you want no further WORK. DIVER then assumes that the next activity should be ASCEND.

During a prepared multi-stage WORK sequence, DIVER may offer WORK as the next activity automatically. Following that proposal continues the stored WORK plan.

## ASCEND

Selecting ASCEND does not require you to enter a target depth. DIVER determines the target from the current decompression state.

If no decompression stop is required, ASCEND proceeds towards the surface.

If a stop is required, ASCEND proceeds to the appropriate stop depth, 10 m or 5 m, and DIVER will normally suggest DECOMPRESS next.

## DECOMPRESS

DECOMPRESS is normally suggested when the diver reaches a required decompression stop.

DIVER determines the stop duration from the current decompression requirement. The operator does not normally enter a decompression duration.

When the stop is complete, DIVER normally suggests another ASCEND.

## DESCEND

DESCEND can also be chosen later in a dive.

DIVER then asks:

```text
TO WHAT DEPTH
```

Enter the required target depth in metres.

The target may not be shallower than the diver's present depth and may not exceed 50 m. An invalid value causes the question to be repeated.

## REST and ending the dive

When REST is selected, DIVER asks:

```text
FOR HOW LONG
```

Enter the required REST duration in minutes.

REST is the terminal activity. When it finishes, DIVER produces the final MEMORY display and ends the run.

REST does not itself return the diver to the surface. If REST is selected while submerged, the program ends at that depth. For an ordinary dive, ASCEND to the surface before selecting REST.

The MEMORY display records final dive information, including the final WORK-end time and saved decompression information where applicable, and restores the working depth to the depth display.

## Reading the display

The main blue plotting area shows the diver's depth/time profile as the dive proceeds.

The display monitor at the upper right provides changing information appropriate to the current stage of the dive. Depending on the activity and decompression state, it can show:

- depth information;
- the air-remaining indication;
- NOSTOP/time-to-bound information;
- the next decompression stop;
- decompression time information.

The display changes as the dive progresses. Some information remains visible until another display routine replaces it.

## A simple first run

A useful first run is:

```text
WORKING DEPTH 16
TIME MODE ACCELERATED
```

Follow the suggested WORK activity, enter:

```text
BOTTOM TIME 10
```

then follow the suggested ASCEND and, once back at the surface, select:

```text
REST
```

and enter, for example:

```text
FOR HOW LONG 5
```

This is a simple non-decompression dive and avoids the additional staged-WORK and decompression questions while learning the controls.
