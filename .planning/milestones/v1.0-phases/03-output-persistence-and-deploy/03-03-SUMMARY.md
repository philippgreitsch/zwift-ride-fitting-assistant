---
phase: 03-output-persistence-and-deploy
plan: 03
subsystem: results-screen
tags: [results, wizard, calculation, zustand, components, wiring]
requires:
  - src/lib/calculations.ts
  - src/store/fitStore.ts
  - src/components/wizard/steps/results/AxisCard.tsx
  - src/types/fit.ts
provides:
  - src/components/wizard/steps/ResultsStep.tsx
affects:
  - src/components/wizard/WizardShell.tsx
tech_stack_added: []
tech_stack_patterns:
  - zustand-selector-pattern
  - pure-calculation-in-component
  - empty-state-guard
key_files_created: []
key_files_modified:
  - src/components/wizard/steps/ResultsStep.tsx
decisions:
  - "AXIS_INSTRUCTIONS defined as const object (not array) — keys match FitOutputs axis names for direct dot-access with type safety"
  - "hasAnyData guard shown before results: prevents four empty AxisCards when no input entered (Pitfall 3 from RESEARCH.md)"
  - "allAxesOutOfRange === true (strict equality) — guards against undefined when no non-null axes (D-11)"
  - "Start over button appears in both empty-state and results state — users can always reset from results screen (UX-04)"
metrics:
  duration_seconds: 55
  completed_date: "2026-03-22"
  tasks_completed: 1
  files_created: 0
  files_modified: 1
---

# Phase 03 Plan 03: ResultsStep Wired to Calculation Engine Summary

**One-liner:** ResultsStep fully wired to Zustand inputs and calculateFitOutputs — renders four AxisCards in locked order with empty-state guard, allAxesOutOfRange summary error, and Start over reset button.

## What Was Built

The payoff screen — the reason the app exists. Replaced the `ResultsStep` placeholder with a complete implementation connecting the Zustand store, calculation engine, and output components built in Plans 01 and 02.

### Task 1: Wire ResultsStep to calculation engine and output components

**File:** `src/components/wizard/steps/ResultsStep.tsx` — replaced entirely.

The new implementation:

1. **Reads inputs from Zustand store** via `useFitStore((s) => s.inputs)` and `useFitStore((s) => s.resetStore)`.
2. **Calls `calculateFitOutputs(inputs)`** to derive all four axis outputs (saddleHeight, saddleForeAft, handlebarHeight, handlebarReach).
3. **Empty-state guard** (`hasAnyData`): when all four axes return null (no measurements entered), shows a single prompt card ("Enter measurements in the steps above") with a Start over button — instead of four empty AxisCards.
4. **`allAxesOutOfRange` summary error**: when all non-null axes have `out_of_range: true`, shows a red summary banner above the four AxisCards.
5. **Four `AxisCard` instances in locked order** (OUT-04): Saddle Height → Saddle Fore/Aft → Bar Height → Bar Reach. This order must not change.
6. **`AXIS_INSTRUCTIONS` static content**: per-axis physical adjustment strings, marked LOW confidence with a comment pointing to RESEARCH.md Open Question 2.
7. **Start over button** in results state calls `resetStore()` — clears localStorage and resets `currentStep` to 0.

**Commit:** `c3056f7` — `feat(03-03): wire ResultsStep to calculation engine and output components`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| AXIS_INSTRUCTIONS as const object, not array | Direct dot-access by key (saddleHeight, saddleForeAft, etc.) — type-safe and self-documenting |
| hasAnyData uses axes.some() not outputs.allAxesOutOfRange | allAxesOutOfRange counts only non-null axes; need a separate check for the no-data case |
| allAxesOutOfRange === true (strict equality) | Avoids truthy match against undefined when FitOutputs.allAxesOutOfRange is not set |
| Start over button in both empty and results states | Users should always be able to reset, regardless of whether they have data or not |
| LOW confidence comment kept inline | RESEARCH.md Open Question 2 is unresolved — comment ensures future maintainers don't treat these strings as verified |

## Deviations from Plan

None — plan executed exactly as written. The implementation matches the code example in the plan spec verbatim.

## Known Stubs

**AXIS_INSTRUCTIONS strings are LOW confidence** — sourced from community reviews, not verified against physical Zwift Ride hardware or official Zwift documentation. These strings are functional placeholders that describe the correct general procedure, but exact lever locations and adjustment mechanisms should be verified before publishing. See RESEARCH.md Open Question 2.

This is intentional and documented via inline comment in the file. The lookup tables (letter positions) remain empty records — this is tracked as a known blocker in STATE.md (Zwift Ride hardware not physically measured). The AxisCard component handles the null letter_position case gracefully by showing the mm value with a "Letter position not yet confirmed" note.

## Self-Check: PASSED

- FOUND: src/components/wizard/steps/ResultsStep.tsx
- FOUND commit: c3056f7 (feat(03-03): wire ResultsStep to calculation engine and output components)
