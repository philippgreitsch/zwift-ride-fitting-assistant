---
status: diagnosed
phase: 03-output-persistence-and-deploy
source: [03-VERIFICATION.md]
started: 2026-03-22T00:00:00Z
updated: 2026-03-22T00:00:00Z
---

## Current Test

Tested on live URL: https://zwift-ride-fitting-assistant.vercel.app

## Tests

### 1. localStorage persistence on production
expected: Enter a measurement value, refresh the page, confirm the value is automatically restored
result: FAILED — values are only saved to the store when clicking "Next"; entering a value and refreshing without clicking Next loses the value. Even when clicking Next, values are restored but the user is returned to step 0 (home screen) instead of their current step.

### 2. Start over clears localStorage on production
expected: Click "Start over" on Results step, refresh the page, confirm all fields are empty and app is at step 0
result: [pending — blocked by issue in test 1]

### 3. Mobile viewport
expected: At 390px wide, no horizontal scroll, all form fields are usable without zooming
result: [pending]

### 4. End-to-end results rendering
expected: Enter saddle height value, navigate to Results step, AxisCard renders the mm value with "Letter position not yet confirmed" note
result: [pending]

## Summary

total: 4
passed: 0
issues: 2
pending: 2
skipped: 0
blocked: 1

## Gaps

### Gap 1: Field values not synced to Zustand on blur
status: failed
description: Values are only written to the Zustand store when clicking "Next", not on field blur. The persist middleware cannot save values that never reach the store.
root_cause: Blur handlers in step components (PhysicalStep, BodyStep, FrameStep, FitReportStep) are not reliably writing to the store — only Next navigation triggers the sync.

### Gap 2: currentStep excluded from persistence — user returned to step 0 on reload
status: failed
description: currentStep was intentionally excluded from partialize per the original plan, but the correct behavior is to restore the user to their last active step. After refresh, user always lands on the skill level selector (step 0) even if they had progressed through the wizard.
root_cause: partialize in fitStore.ts explicitly excludes currentStep from localStorage.
