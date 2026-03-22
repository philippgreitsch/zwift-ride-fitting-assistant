---
phase: 03-output-persistence-and-deploy
plan: 02
subsystem: output-components
tags: [components, results, axis-card, alert, shadcn]
requires: [src/types/fit.ts, src/components/ui/card.tsx, src/components/ui/badge.tsx]
provides: [src/components/wizard/steps/results/AxisCard.tsx, src/components/wizard/steps/results/OutOfRangeAlert.tsx, src/components/ui/alert.tsx]
affects: [src/components/wizard/steps/ResultsStep.tsx]
tech_stack_added: []
tech_stack_patterns: [shadcn-cli-install, four-state-component-pattern, forwardRef-presentational]
key_files_created:
  - src/components/ui/alert.tsx
  - src/components/wizard/steps/results/AxisCard.tsx
  - src/components/wizard/steps/results/OutOfRangeAlert.tsx
key_files_modified: []
decisions:
  - "shadcn CLI generated alert.tsx in base-nova style (cva + data-slot pattern) matching existing card/badge components"
  - "AxisCard uses direct null guard (axis === null) before out_of_range check — matches four-state pattern from RESEARCH.md"
  - "OutOfRangeAlert receives label, direction, achievable_mm, ideal_mm as explicit props — not AxisOutput directly — keeping it decoupled"
metrics:
  duration_seconds: 68
  completed_date: "2026-03-22"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 03 Plan 02: AxisCard and OutOfRangeAlert Components Summary

**One-liner:** shadcn Alert installed via CLI; AxisCard handles four AxisOutput display states (null / out-of-range / letter-known / letter-unknown) with OutOfRangeAlert for destructive feedback.

## What Was Built

Two presentational components for displaying a single Zwift Ride axis output in the results step, plus the shadcn Alert dependency they require.

### Task 1: Install shadcn Alert component

Ran `npx shadcn@latest add alert --yes` — CLI created `src/components/ui/alert.tsx` in the base-nova style (cva + data-slot pattern), matching the existing card and badge components. Exports: `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`. The `destructive` variant uses design-token-based text-destructive colouring consistent with the base-nova palette.

**Commit:** `5c4ed69` — `chore(03-02): install shadcn Alert component`

### Task 2: Build OutOfRangeAlert and AxisCard

**OutOfRangeAlert** (`src/components/wizard/steps/results/OutOfRangeAlert.tsx`): Renders a destructive Alert naming the specific axis, showing direction (too high / too low for the Zwift Ride), the mm diff between ideal and achievable, and the closest achievable mm.

**AxisCard** (`src/components/wizard/steps/results/AxisCard.tsx`): Handles all four `AxisOutput` display states:
- State 1 `axis === null`: Grey, 50%-opacity card with "No data entered for this axis."
- State 2 `out_of_range === true`: Card containing `OutOfRangeAlert` + instruction text
- State 3 `letter_position !== null`: Large letter (4xl) + secondary mm value + instruction + source badge
- State 4 `letter_position === null`: Large mm value (4xl) + "Letter position not yet confirmed" note + instruction + source badge

Source badge maps `InputSource` values to human labels: Fit report / Direct measurement / Frame geometry / Body estimate.

**Commit:** `947f4e9` — `feat(03-02): add AxisCard and OutOfRangeAlert components`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| shadcn CLI for alert.tsx generation | Ensures base-nova style consistency — manual creation would risk style drift |
| OutOfRangeAlert takes explicit props (not AxisOutput) | Decouples the alert from the AxisOutput type; easier to test and reuse |
| Four-state guard order: null → out_of_range → letter known/unknown | Mirrors RESEARCH.md Pattern 3 exactly; null check must precede out_of_range access |

## Deviations from Plan

None — plan executed exactly as written. The shadcn CLI ran non-interactively with `--yes` as specified. The generated alert.tsx also exported `AlertAction` (not in the plan spec), which is harmless — it's an additive export from the base-nova registry.

## Known Stubs

None — these are purely presentational components. No data source wiring required at this layer; `AxisCard` and `OutOfRangeAlert` receive fully-typed props. Data will be wired in the ResultsStep (Plan 03-03).

## Self-Check: PASSED

- FOUND: src/components/ui/alert.tsx
- FOUND: src/components/wizard/steps/results/AxisCard.tsx
- FOUND: src/components/wizard/steps/results/OutOfRangeAlert.tsx
- FOUND commit: 5c4ed69 (chore(03-02): install shadcn Alert component)
- FOUND commit: 947f4e9 (feat(03-02): add AxisCard and OutOfRangeAlert components)
