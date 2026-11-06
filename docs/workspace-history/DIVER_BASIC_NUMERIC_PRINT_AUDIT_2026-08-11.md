# DIVER.BAS Numeric PRINT Audit

Date: 11 August 2026

## Question

Where does the original DIVER.BAS rely on BASIC's native numeric `PRINT`
formatting, and therefore where should JSX use the CCEMU-confirmed
`basicPrintNumber()` behaviour rather than raw JavaScript number-to-string output?

## Result

There is only **one live direct numeric PRINT in DIVER.BAS**:

    5504 PRINT "IS NEXT STAGE =";PA(PA,2);:PRINT " MIN. REQUIRED";

All other BASIC `PRINT` statements output:

- fixed text strings;
- spaces/blank lines;
- `CHR$(7)` (bell);
- string variables such as `M$`;
- activity-name strings such as `A$(...)`;
- literal error text (`OUT OF RANGE`);
- the literal `MEMORY` heading.

Therefore the v10 use of `basicPrintNumber()` on the staged-WORK question is
not merely a narrow patch: it covers the only place where the original program
uses native BASIC numeric PRINT formatting for a calculated number.

## What does NOT use BASIC numeric PRINT formatting

The Dive Monitor's numerical material is built explicitly through GOSUB 7000.
The BASIC converts values to individual character codes using `INT(...)`, `+48`,
spaces, colons, `>`, etc. Examples include GOSUB 6750 and GOSUB 8000/MEMORY.
Those displays already encode their own formatting in the BASIC and should NOT
be routed through `basicPrintNumber()`.

Likewise, numeric INPUT prompts (WORKING DEPTH, BOTTOM TIME, FOR HOW LONG,
TO WHAT DEPTH) use the input mechanism; any typed-number echo is an INPUT/UI
presentation issue, not a numeric PRINT statement in DIVER.BAS.

Debug/event-log/diagnostic numbers in JSX are modern instrumentation and should
continue to show useful JS precision rather than emulate BASIC PRINT formatting.

## CCEMU evidence

Controlled CCEMU test:

    10 A=.1:PRINT A

displayed `.1` with BASIC's normal leading sign-space for a positive number.

Thus, for a PA stage whose JS internal value is
`0.09999999999999964`, DIVER's authentic user-facing form is:

    IS NEXT STAGE = .1 MIN. REQUIRED

The underlying numerical value and all scheduler arithmetic remain untouched.

## Development conclusion

No wider source-code rollout is currently required.

Keep `basicPrintNumber()` as a reusable BASIC-presentation helper, but apply it
only at line 5504 unless another native BASIC numeric PRINT is introduced or
discovered in a different source version.

This audit is complete.
