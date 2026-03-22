# Milestones

## v1.0 MVP (Shipped: 2026-03-22)

**Phases completed:** 4 phases, 13 plans, 18 tasks

**Key accomplishments:**

- Vite 8 + TypeScript + Vitest scaffold with FitInputs/AxisOutput/FitOutputs types, hardware constants (saddle 599-865mm, handlebar 863-1024mm, crank 170mm), and Zod v4 validation schemas — all calculation-ready foundations
- Pure TypeScript calculation engine with TDD — crank correction, drop bar offsets, LeMond estimation, priority resolution, out-of-range clamping, and allAxesOutOfRange detection — all verified by 43 Vitest unit tests
- Tailwind v4 + shadcn/ui (base-nova/@base-ui) wired into Vite 8, Zustand store with FitInputs shape, MeasurementField and UnitInput reusable components ready for wizard steps
- Wizard shell with skill level selector, 5-step tappable indicator, and Next/Back navigation; full routing skeleton ready for step content plans
- PhysicalStep with 8 conditional fields (handlebar type gates drop bar offsets) and BodyStep with 3 body measurement fields, both wired into WizardShell with badge headers
- One-liner:
- Inter font wired from @fontsource/inter; all responsive layout and dark mode patterns confirmed correct across WizardShell, StepIndicator, SkillLevelSelector, MeasurementField, and PhysicalStep.
- One-liner:
- One-liner:
- Zwift Ride Fitting Assistant deployed live at https://zwift-ride-fitting-assistant.vercel.app — production build clean, localStorage persistence and results output verified by human on deployed URL.
- All four wizard input steps now call getValues(fieldName) in handleBlur, writing field values to Zustand on blur rather than on Next click — closing UAT gap 1 for reliable localStorage persistence.
- Zustand partialize extended to serialize currentStep, closing UAT gap where wizard position was lost on every page refresh

---
