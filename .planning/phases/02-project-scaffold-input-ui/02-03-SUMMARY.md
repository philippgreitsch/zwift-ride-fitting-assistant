---
phase: 02-project-scaffold-input-ui
plan: 03
subsystem: ui
tags: [react, react-hook-form, zod, zustand, tailwind, shadcn, measurement-forms]

requires:
  - phase: 02-02
    provides: WizardShell shell with step navigation and StepPlaceholder rendering
  - phase: 02-01
    provides: Zustand fitStore with updatePhysical/updateBody/skillLevel, MeasurementField, UnitInput components
provides:
  - PhysicalStep component with 8 measurement fields, handlebar type selector, drop bar conditional section
  - BodyStep component with 3 body measurement fields
  - WizardShell wired to render PhysicalStep at step 1 and BodyStep at step 2
affects:
  - 02-04 (frame geometry and fit report steps — same pattern)
  - 03-results (reads fitStore values populated by these steps)

tech-stack:
  added: []
  patterns:
    - "String-based RHF form with inline validation (not zodResolver with preprocess) — avoids ChangeHandler type mismatch with MeasurementField.onChange: (value: string) => void"
    - "Blur-sync to Zustand: validate inline on blur, if valid write parsed number (or undefined) to store"
    - "Override state derived from Zustand fitReport at render time — not from RHF state"
    - "Handlebar type read from Zustand store (not RHF) for conditional rendering — single source of truth"
    - "useRef + useEffect to detect handlebar type change to 'drop' and auto-expand drop offset section"

key-files:
  created:
    - src/components/wizard/steps/PhysicalStep.tsx
    - src/components/wizard/steps/BodyStep.tsx
  modified:
    - src/components/wizard/WizardShell.tsx

key-decisions:
  - "Used string-based RHF form values (not z.preprocess) — avoids TypeScript resolver incompatibility where preprocess makes inferred type 'unknown', breaking the zodResolver generic"
  - "Inline validateField() function instead of zodResolver for field-level errors — simpler, works with MeasurementField's string-valued onChange"
  - "handlebarType read from Zustand, not from RHF watch() — keeps conditional rendering in sync with store truth per plan Pitfall 7"
  - "Drop bar offset collapsible auto-expands on handlebar type change to 'drop' via useRef/useEffect tracking"
  - "WizardShell renders step content inline for steps 1-2 instead of StepPlaceholder — steps 3-5 remain as placeholders for Plan 04"

patterns-established:
  - "Step form pattern: useForm string values + watch() + inline validateField() + onBlur sync to Zustand"
  - "MeasurementField usage: onChange=(v => setValue) + onBlur=handleBlur + value=watch()"
  - "Override state: overriddenAxes computed from fitReport?.field != null, passed as isOverridden prop"

requirements-completed: [PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05, PHYS-06, PHYS-07, BODY-01, BODY-02, BODY-03, BODY-04, UX-01]

duration: 18min
completed: 2026-03-21
---

# Phase 2 Plan 3: Physical and Body Measurement Steps Summary

**PhysicalStep with 8 conditional fields (handlebar type gates drop bar offsets) and BodyStep with 3 body measurement fields, both wired into WizardShell with badge headers**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-21T19:30:00Z
- **Completed:** 2026-03-21T19:48:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- PhysicalStep renders all 8 physical measurement fields: saddle height, fore/aft, handlebar height (dynamic label), handlebar reach (dynamic label), crank length, and 2 drop bar hood offset fields gated behind handlebar type === 'drop'
- Handlebar type Select drives conditional rendering and label changes simultaneously — Hood height/Hood reach shown when drop bars selected
- Drop bar offset Collapsible auto-expands when user selects drop bars
- Override state correctly mutes saddle/handlebar fields when fitReport has corresponding values
- BodyStep renders inseam, torso length, arm length with simple guidance
- WizardShell step 1 renders PhysicalStep with "Start here" orange badge; step 2 renders BodyStep with "Optional" badge

## Task Commits

1. **Task 1: Build PhysicalStep with handlebar conditional and override state** - `97ca8ca` (feat)
2. **Task 2: Build BodyStep and wire both steps into WizardShell** - `2a73811` (feat)

**Plan metadata:** (included in final docs commit)

## Files Created/Modified

- `src/components/wizard/steps/PhysicalStep.tsx` - Physical measurements form with 8 fields, handlebar type selector, override state, blur-sync to Zustand
- `src/components/wizard/steps/BodyStep.tsx` - Body measurements form with inseam/torso/arm fields
- `src/components/wizard/WizardShell.tsx` - Added PhysicalStep/BodyStep imports and step 1/2 rendering

## Decisions Made

- Used string-based RHF form values with a local `validateField()` function instead of `z.preprocess` with `zodResolver`. The `z.preprocess` approach causes TypeScript's `zodResolver` generic to infer `unknown` types for preprocessed fields, making the resolver incompatible with the `useForm<FormValues>` type parameter. The string approach avoids this friction while preserving blur-timed validation behavior.
- `handlebarType` is read from Zustand store via `useFitStore`, not from RHF `watch()`. This is the plan's Pitfall 7 — the Select updates Zustand directly so all conditional rendering stays in sync with the authoritative store state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed zodResolver TypeScript incompatibility with z.preprocess fields**
- **Found during:** Task 1 (first build attempt)
- **Issue:** Using `z.preprocess` in the Zod schema caused TypeScript to infer field types as `unknown`, making the `zodResolver` generic incompatible with `useForm<PhysicalFormValues>`. RHF's `ChangeHandler` type also didn't match `MeasurementField`'s `onChange: (value: string) => void` prop.
- **Fix:** Changed schema to use `z.string().optional()` fields. Added a local `validateField()` function for inline range/type validation triggered on blur. Used `watch()` and `setValue()` instead of spreading `register()` results.
- **Files modified:** `src/components/wizard/steps/PhysicalStep.tsx`
- **Verification:** `npm run build` exits with code 0, no TypeScript errors
- **Committed in:** `97ca8ca` (Task 1 commit, second write)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug — TypeScript type incompatibility)
**Impact on plan:** Fix was necessary for correctness. The resulting string-based form pattern is now the established convention for all future wizard step forms. No scope creep.

## Issues Encountered

- `z.preprocess` with `zodResolver` produces `unknown` inferred types in Zod v4 + RHF 7 — this is a known friction point. The string-based approach with local validation is the correct pattern for this project's `MeasurementField` interface.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PhysicalStep and BodyStep are ready; Plan 04 replaces steps 3-5 (frame geometry and fit report steps)
- The string-based form pattern with `validateField()` + blur-sync should be replicated for frame and fit report steps
- Steps 3-5 still render StepPlaceholder — no UI regression
- Known stubs: WizardShell `StepPlaceholder` for steps 3-5 shows "coming soon" — intentional, Plan 04 resolves

---
*Phase: 02-project-scaffold-input-ui*
*Completed: 2026-03-21*
