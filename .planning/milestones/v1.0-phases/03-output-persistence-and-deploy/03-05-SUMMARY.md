---
phase: 03-output-persistence-and-deploy
plan: 05
subsystem: ui
tags: [react, react-hook-form, zustand, form-state, blur-sync]

# Dependency graph
requires:
  - phase: 03-output-persistence-and-deploy
    provides: Zustand store with persist middleware and updatePhysical/updateBody/updateFrame/updateFitReport actions
provides:
  - Blur-triggered Zustand sync in all four wizard input steps (PhysicalStep, BodyStep, FrameStep, FitReportStep)
affects:
  - UAT gap 1 closure — localStorage persistence now reliable on field blur without Next click

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use getValues(fieldName) inside handleBlur to read current RHF field value — never read from the stale watch() snapshot"

key-files:
  created: []
  modified:
    - src/components/wizard/steps/PhysicalStep.tsx
    - src/components/wizard/steps/BodyStep.tsx
    - src/components/wizard/steps/FrameStep.tsx
    - src/components/wizard/steps/FitReportStep.tsx

key-decisions:
  - "getValues(fieldName) inside handleBlur — reads current RHF internal state; watch() snapshot is stale on blur with mode:'onBlur'"

patterns-established:
  - "Pattern: getValues(fieldName) for event handlers that must read the value being committed; watch() for controlled rendering only"

requirements-completed: [UX-02]

# Metrics
duration: 10min
completed: 2026-03-22
---

# Phase 03 Plan 05: Blur Sync Fix Summary

**All four wizard input steps now call getValues(fieldName) in handleBlur, writing field values to Zustand on blur rather than on Next click — closing UAT gap 1 for reliable localStorage persistence.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-22T12:00:00Z
- **Completed:** 2026-03-22T12:10:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Fixed stale `watch()` read bug in `PhysicalStep.handleBlur` — field values now sync to Zustand on every blur event
- Applied the same two-change pattern (add `getValues` to destructure, use `getValues(fieldName)` in handler) to `BodyStep`, `FrameStep`, and `FitReportStep`
- Build passes with zero TypeScript errors; all 43 Vitest tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix blur sync in PhysicalStep** - `e2f3637` (fix)
2. **Task 2: Fix blur sync in BodyStep, FrameStep, FitReportStep** - `5ab4cb1` (fix)

## Files Created/Modified
- `src/components/wizard/steps/PhysicalStep.tsx` - Added `getValues` to useForm destructure; replaced `values[fieldName]` with `getValues(fieldName)` in handleBlur
- `src/components/wizard/steps/BodyStep.tsx` - Same two-change fix
- `src/components/wizard/steps/FrameStep.tsx` - Same two-change fix
- `src/components/wizard/steps/FitReportStep.tsx` - Same two-change fix

## Decisions Made
- `getValues(fieldName)` inside `handleBlur` is correct because RHF with `mode:'onBlur'` does not update the `watch()` snapshot until after the blur cycle completes — the snapshot captured at render contains the value before the user's input. `getValues()` reads directly from RHF internal state at call time and is always current.
- `const values = watch()` retained in all components — it drives controlled input rendering and must stay. Only the blur handler's read is changed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- UAT gap 1 is closed: field blur writes to Zustand store immediately, persist middleware can save on every keystroke+blur without requiring a Next click
- All four input steps are consistent — no step has the stale read bug remaining

---
*Phase: 03-output-persistence-and-deploy*
*Completed: 2026-03-22*
