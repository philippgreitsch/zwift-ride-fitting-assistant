---
phase: 01-calculation-engine
plan: "02"
subsystem: calculation-engine
tags: [typescript, vitest, tdd, bike-fitting, calculations, pure-functions]

# Dependency graph
requires:
  - src/types/fit.ts (FitInputs, AxisOutput, FitOutputs type contracts)
  - src/lib/zwiftRideConstants.ts (all hardware constants)
provides:
  - calculateSaddleHeight with crank correction and LeMond estimation fallback
  - calculateSaddleForeAft with direct measurement and fit-report priority
  - calculateHandlebarHeight with drop bar hood height offset
  - calculateHandlebarReach with drop bar hood reach offset and null-range handling
  - calculateFitOutputs orchestrator with allAxesOutOfRange detection
  - mmToLetter nearest-entry lookup with null-safe empty table handling
  - 43 Vitest unit tests verifying all formulas, edge cases, and priority logic
affects: [02-ui-phase, 03-output-phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD Red-Green-Refactor for pure TypeScript calculation functions
    - buildAxisOutput shared helper to deduplicate clamping, out-of-range, and letter lookup
    - buildAxisOutputNullableRange variant for axes with unverified hardware bounds
    - Priority resolver per axis (fit-report > measured > estimated) with source tagging
    - allAxesOutOfRange detection: non-null axes all out_of_range triggers error state

key-files:
  created:
    - src/lib/calculations.ts
    - src/lib/__tests__/calculations.test.ts
  modified: []

key-decisions:
  - "LeMond formula (inseam × 0.883) inline constant is acceptable — it is a domain math constant, not a hardware constant"
  - "buildAxisOutputNullableRange variant introduced for handlebar reach — avoids null-check duplication across reach-specific logic"
  - "allAxesOutOfRange counts only non-null axes (null = no data, not out-of-range per D-11)"
  - "REFACTOR phase found no DRY violations — priority resolver pattern was already clean per-function with no repeated blocks"

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 01 Plan 02: Calculation Engine Summary

**Pure TypeScript calculation engine with TDD — crank correction, drop bar offsets, LeMond estimation, priority resolution, out-of-range clamping, and allAxesOutOfRange detection — all verified by 43 Vitest unit tests**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-21T16:36:43Z
- **Completed:** 2026-03-21T16:39:30Z
- **Tasks:** 1 (TDD — 3 commits: RED, GREEN, docs)
- **Files modified:** 2

## Accomplishments

- 43 unit tests written in RED phase (all failing — import error), then implemented in GREEN phase (all passing)
- `calculateSaddleHeight`: crank correction formula `height + (ZWIFT_RIDE_CRANK_MM - crankLength)` with default 172.5mm fallback, LeMond estimation `round(inseam × 0.883)`, fit-report override (no correction applied to fit report values)
- `calculateSaddleForeAft`: direct measurement and fit-report priority paths, clamped to SADDLE_FORE_AFT_RANGE
- `calculateHandlebarHeight`: flat bar direct transfer, drop bar adds DEFAULT_DROP_BAR_HOOD_HEIGHT_OFFSET_MM (or custom), fit-report override
- `calculateHandlebarReach`: flat bar direct transfer, drop bar subtracts DEFAULT_DROP_BAR_HOOD_REACH_OFFSET_MM (or custom), null-range handling for unverified HANDLEBAR_REACH_RANGE
- `mmToLetter`: nearest-entry lookup, skips null entries, returns null when table is empty or all-null
- `calculateFitOutputs`: orchestrates all four axes independently (D-07), sets allAxesOutOfRange when all non-null axes are out-of-range (D-11)
- All 43 tests pass in 4ms; TypeScript strict check clean with zero errors

## Task Commits

1. **RED phase (failing tests)** - `d05cdd4` (test)
2. **GREEN phase (implementation)** - `adaab0a` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `src/lib/calculations.ts` — All six exported functions; pure TypeScript; all hardware values via imports from zwiftRideConstants; 320 lines
- `src/lib/__tests__/calculations.test.ts` — 43 Vitest tests across 6 describe blocks; RED phase verified with import error; GREEN phase: 43/43 passing

## Decisions Made

- LeMond formula coefficient `0.883` used inline — this is a domain math constant (not a Zwift hardware constant), so inline use is appropriate and expected
- `buildAxisOutputNullableRange` added as a separate helper from `buildAxisOutput` to handle handlebar reach's null bounds without conditional null-checks scattered through the axis function
- `allAxesOutOfRange` logic counts only non-null results — null means "no data available for this axis" (D-13), not "out of range" (D-11)
- REFACTOR phase: no structural changes needed — priority resolver pattern is naturally clean with one block per priority tier per function

## Deviations from Plan

None — plan executed exactly as written.

TDD Red-Green-Refactor followed as specified:
1. RED: wrote all 43 tests, confirmed import error failure
2. GREEN: implemented calculations.ts, all 43 tests passed
3. REFACTOR: reviewed, no changes needed

## Known Stubs

None — all calculation functions are fully implemented against the type contracts. The letter-to-mm lookup tables remain empty (from Plan 01) but this is expected behavior: `mmToLetter` returns `null` and `AxisOutput` has `letter_position: null` with `confidence: 'low'`. This is not a stub — it is the correct behavior per PITFALLS.md Pitfall 1 and the DATA GAP STRATEGY in RESEARCH.md. The mm targets are fully correct and useful without the letter positions.

## Self-Check: PASSED
