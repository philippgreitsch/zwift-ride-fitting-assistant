---
phase: 02-project-scaffold-input-ui
plan: "04"
subsystem: wizard-steps
tags: [react, form, wizard, measurement-input, frame-geometry, fit-report, results-placeholder]
dependency_graph:
  requires: ["02-01", "02-02", "02-03"]
  provides: ["FrameStep", "FitReportStep", "ResultsStep", "full-wizard-navigation"]
  affects: ["WizardShell", "fitStore"]
tech_stack:
  added: []
  patterns:
    - "String-based RHF form values with manual blur validation (same pattern as PhysicalStep/BodyStep)"
    - "Lucide AlertCircle icon in amber priority banner for FitReportStep"
    - "Switch-based step routing in WizardShell replaces StepPlaceholder component"
key_files:
  created:
    - src/components/wizard/steps/FrameStep.tsx
    - src/components/wizard/steps/FitReportStep.tsx
    - src/components/wizard/steps/ResultsStep.tsx
  modified:
    - src/components/wizard/WizardShell.tsx
decisions:
  - "Reused string-based RHF + manual blur validation pattern from Plan 02-03 — consistent across all step components"
  - "seatTubeAngle uses unit=degrees not mm — per FRAME-03 type contract and Pitfall 8"
  - "No seatTubeLength field in FrameStep — FitInputs.frame type has seatTubeAngle only"
  - "WizardShell StepPlaceholder removed entirely — replaced with renderStepContent() switch for cleaner routing"
metrics:
  duration: "~2 minutes"
  completed: "2026-03-21T19:34:01Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 02 Plan 04: Frame, Fit Report, and Results Steps Summary

**One-liner:** Frame step (stack/reach/seat-tube-angle with degrees unit), FitReport step (4 fields + persistent amber priority banner), and Results placeholder wired into WizardShell completing all 5 wizard steps.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build FrameStep, FitReportStep, ResultsStep | d571da1 | FrameStep.tsx, FitReportStep.tsx, ResultsStep.tsx |
| 2 | Wire all three steps into WizardShell | 9f8683c | WizardShell.tsx |

## What Was Built

### FrameStep (`src/components/wizard/steps/FrameStep.tsx`)
- Three `MeasurementField` instances: Frame stack (mm), Frame reach (mm), Seat tube angle (degrees)
- Seat tube angle uses `unit="degrees"` per FRAME-03 — critical distinction from mm fields
- Validation ranges: stack 400-700 mm, reach 350-450 mm, seat tube angle 70-80 degrees
- Error messages for degrees field use "degrees" not "mm"
- String-based RHF form with manual blur validation syncing to Zustand `updateFrame`

### FitReportStep (`src/components/wizard/steps/FitReportStep.tsx`)
- Persistent non-dismissable amber priority banner at top (D-15): "Values here override your physical measurements for the same axis."
- Banner uses `AlertCircle` from lucide-react, `bg-amber-50`, `border-amber-200`, `text-amber-600`
- Four `MeasurementField` instances: Saddle height, Saddle fore/aft, Handlebar height, Handlebar reach (all mm)
- Validation: positive number only (fit report values have no fixed upper range)
- Syncs to Zustand `updateFitReport` on blur

### ResultsStep (`src/components/wizard/steps/ResultsStep.tsx`)
- Phase 2 placeholder using shadcn `Card` component
- Heading: "Your settings are ready" (text-2xl font-semibold)
- Body: "We've calculated your Zwift Ride target positions. Full adjustment guide coming in the next update."
- Sub-line: "Come back soon — or check the project for updates." (text-zinc-500)
- No form fields — pure placeholder for Phase 3 calculation output

### WizardShell updates
- Imported FrameStep, FitReportStep, ResultsStep
- Replaced `StepPlaceholder` component with `renderStepContent()` switch statement
- All 5 steps now render real content — no "coming soon" placeholders remain
- Navigation flow: skill selector → physical (step 1) → body (step 2) → frame (step 3) → fit report (step 4) → results (step 5)
- Step 4 shows "Set up my Zwift Ride →" CTA; step 5 shows Back only

## Requirements Addressed

- **FRAME-01**: Frame stack field in FrameStep
- **FRAME-02**: Frame reach field in FrameStep
- **FRAME-03**: Seat tube angle field (degrees only, no seat tube length — matches FitInputs type contract)
- **FIT-01**: Four fit report fields in FitReportStep
- **FIT-02**: Priority banner making override behavior explicit (D-15)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- **ResultsStep** is intentionally a placeholder (no data wired). This is per plan (Phase 2 scope). Phase 3 will replace it with real calculation output.

## Self-Check: PASSED

- FOUND: src/components/wizard/steps/FrameStep.tsx
- FOUND: src/components/wizard/steps/FitReportStep.tsx
- FOUND: src/components/wizard/steps/ResultsStep.tsx
- FOUND: src/components/wizard/WizardShell.tsx
- FOUND commit d571da1 (Task 1)
- FOUND commit 9f8683c (Task 2)
- `npm run build` exits 0
