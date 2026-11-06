# For SB  -  New Direction, 05 July 2026

Short version: TESTING_PLAN.md has a new organising structure and a new
status vocabulary. Nothing already done has been changed or invalidated
 -  this is about how we track everything from here on, and it already
caught two gaps that would otherwise have stayed hidden.

## 1. New status vocabulary (replaces "resolved"/"unresolved")

John reviewed the project with someone else and adopted a six-category
scheme, reasoned from what software archaeology actually needs  -  not
everything is "fixed" or "broken," some things are genuine unexplained
features of the surviving material with no expectation of ever
resolving, and lumping those in with "still needs work" was misleading.

- **Confirmed**  -  behaviour demonstrated directly from code or multiple
  independent sources.
- **Implemented**  -  recreated in DiverSim.jsx and verified.
- **Working Hypothesis**  -  current interpretation, subject to revision.
- **Observed Anomaly**  -  a genuine feature of the surviving material with
  NO current explanation and no expectation of resolution. Doesn't blame
  the original program or imply the listing is defective  -  just records
  the fact.
- **Historical Variant**  -  the listing may contain more than one version
  from George's development process (handwritten amendments, listing vs
  emulator divergence). Distinct from an anomaly: acknowledges multiple
  versions existed, doesn't claim one is unexplained.
- **Deferred**  -  outside current project scope.
- **Not Yet Investigated**  -  known item awaiting analysis.

"Unresolved" is retired from new entries. Full definitions are in
TESTING_PLAN.md's new STATUS CLASSIFICATION SCHEME section.

**Worked example already applied:** U24 (GOSUB 5060, zero call sites) is
now framed as an Observed Anomaly rather than an open dead-code
question  -  the subroutine survives, no caller was found after a full
scan, and that's simply recorded as-is.

Applied going forward and whenever something's touched anyway  -  not a
retrofit pass. Your existing entries don't need rewording unless you're
already revising them for something else.

## 2. Testing is now organised around tick-by-tick GOSUB coverage

The bigger change. Feature-based testing (splash screen, depth gauge,
etc.) kept missing GOSUBs and branches that don't map cleanly onto one
feature  -  the activity-initiation dispatch block, the input-prompt
routines, and two main-loop GOSUBs (6200, 6800) were all found this
session, well after the "containing" features were already marked
working. So TESTING_PLAN.md now has a full coverage matrix  -  every
GOSUB in the program, its call sites, its gating, its assigned
T/U-number, its status  -  and three reference dive scenarios designed
specifically so their combined execution paths hit every GOSUB and
every activity-gated branch at least once.

**Reference scenarios, concrete parameters already set:**
- **Scenario A** (simple path): ACCELERATED, WD=18, BOTTOM TIME=10, no
  REST. No decompression obligation expected.
- **Scenario B** (forces decompression): ACCELERATED, WD=40, BOTTOM
  TIME=20, no REST. Reasoned estimate, not calculated from the DT
  table's real thresholds  -  if DECOMPRESS doesn't trigger, raise BOTTOM
  TIME in 5-minute steps and log wherever it does trigger.
- **Scenario C** (includes REST): ACCELERATED, WD=18, BOTTOM TIME=8,
  REST=5. Built on A's shallow profile deliberately, to keep REST
  isolated from decompression complexity.

**Rule going forward:** a GOSUB/branch only earns Confirmed in the
matrix once a tick-by-tick trace file actually shows it fired  -  not
from source-reading alone. Trace files follow the existing
`tests/T18_*_trace.txt` naming pattern.

## 3. New tests opened this session, all currently Not Yet Investigated

- **T25**  -  MEMORY (line 8010, end-of-dive display). New category, "END
  PHASE"  -  wasn't documented as its own thing before.
- **T26**  -  activity-initiation dispatch (lines 1670-1705): covers line
  1682's DM-field blanking and GOSUB 6100/6950/6850/6250. What actually
  selects between the four branches hasn't been traced yet  -  that's the
  first thing Scenario A/B/C's traces should help settle.
- **T27**  -  activity-selection input prompts (GOSUB 5300-5700). Not
  analysed at all yet, even at source level.
- **T28**  -  GOSUB 7500, DECOMPRESS-end handler. Gating already confirmed
  via your LOOPTRACE5 testbed work; content/wiring not done.
- **T29**  -  GOSUB 6200 (WORK-only, writes literal "AIR OK" to IDs 13-18).
  Found while building the coverage matrix  -  previously only covered
  incidentally by U18's gating work.
- **T30**  -  GOSUB 6800 (DECOMPRESS-only, DT countdown, writes IDs 7-12).
  Same history as T29.

Phase-testing reservation (full WORK/DECOMPRESS/ASCEND/REST behaviour)
now starts at T31, shifted twice this session to make room.

## 4. Where things stand on your open items

- **T21**  -  I found `gosub_6750()` already wired into DiverSim.jsx's tick
  loop when I re-checked the uploaded file, but haven't closed it in
  TODO.md since you hadn't confirmed it's tested. Over to you.
- **U25**  -  still waiting on the PLOT-14-on/off isolation test to settle
  whether the magenta block count is a BIG-Characters rendering artefact
  or something else.
- **T18**  -  the Bresenham-vs-linear hypothesis is a NULL RESULT (you
  already ran it, no daylight found)  -  the open comparison is smooth
  line vs block-staircase instead. Don't re-run the old one.

Full detail on all of the above is in TODO.md, TESTING_PLAN.md, and
LOG.md as always  -  this is just the map of what changed and why.
