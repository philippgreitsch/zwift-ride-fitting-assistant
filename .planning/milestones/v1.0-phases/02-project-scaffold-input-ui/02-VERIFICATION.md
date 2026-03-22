---
phase: 02-project-scaffold-input-ui
verified: 2026-03-21T20:30:00Z
status: human_needed
score: 18/18 must-haves verified
human_verification:
  - test: "Open app at 375px viewport, navigate all 5 steps, verify no horizontal scrolling at any step"
    expected: "Full-bleed layout, no overflow on 375px-wide screen, all inputs reachable without scrolling horizontally"
    why_human: "CSS overflow and touch-target usability requires a real viewport — cannot verify programmatically"
  - test: "Toggle OS dark mode and reload; verify backgrounds, text, borders, and amber banner render correctly"
    expected: "Page bg dark (zinc-950), card bg dark (zinc-900), text readable, amber banner visible, orange accents consistent"
    why_human: "Dark mode color correctness requires visual inspection"
  - test: "Select 'Drop bars' in Physical step; verify hood offset section expands and labels change to Hood height / Hood reach"
    expected: "Collapsible opens automatically, Hood height offset and Hood reach offset fields appear with 40/50 placeholders"
    why_human: "Conditional rendering and auto-expand behavior requires user interaction to verify"
  - test: "Enter a value in Fit Report step, navigate back to Physical step; verify saddle height field shows Overridden note and is disabled"
    expected: "Field label muted, input grayed out, 'Overridden by your fit report' text visible below input"
    why_human: "Override state propagation across wizard steps requires end-to-end interaction"
---

# Phase 02: Project Scaffold + Input UI — Verification Report

**Phase Goal:** Project scaffold with full input UI — install dependencies, create Zustand store, reusable form components, wizard shell with routing/navigation/progress, all 5 measurement input steps (Physical, Body, Frame, Fit Report, Results placeholder), mobile responsive, dark mode ready.
**Verified:** 2026-03-21T20:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

All automated checks pass. Phase goal is substantively achieved. Four items require human visual/interactive confirmation (listed below).

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Tailwind CSS utility classes render correctly | VERIFIED | `@import "tailwindcss"` in index.css; `@tailwindcss/vite` plugin in vite.config.ts; `vite build` exits 0 producing 51.67 kB CSS bundle |
| 2 | shadcn/ui components available from `@/components/ui/` | VERIFIED | All 8 components present: button, input, label, select, card, badge, collapsible, separator; components.json exists with base-nova style |
| 3 | Zustand store holds FitInputs-shaped inputs with update methods | VERIFIED | `src/store/fitStore.ts` exports `useFitStore`; interface has `inputs: FitInputs`, `skillLevel`, `currentStep`; all 4 update methods implemented (updatePhysical, updateBody, updateFrame, updateFitReport) |
| 4 | MeasurementField renders label, input with unit suffix, collapsible guidance | VERIFIED | Component at 163 lines; renders Label, Collapsible with beginner/pro mode branching, UnitInput with mm/degrees suffix, override note, helper text, error state |
| 5 | User sees skill level selection screen on first load | VERIFIED | WizardShell renders `<SkillLevelSelector />` when `currentStep === 0`; SkillLevelSelector shows "How do you want to use this tool?" heading with two full-width tappable cards |
| 6 | After selecting skill level, user sees 4-step wizard with tappable step indicators | VERIFIED | SkillLevelSelector calls `setSkillLevel` + `setCurrentStep(1)`; WizardShell renders `<StepIndicator>` when `currentStep >= 1`; 5 steps defined (Physical/Body/Frame/Fit Report/Results) |
| 7 | User can navigate forward and backward using Next/Back buttons | VERIFIED | WizardShell: Next button (`setCurrentStep(currentStep + 1)`), Back button (`setCurrentStep(currentStep - 1)`), CTA "Set up my Zwift Ride →" on step 4; step 5 shows Back only |
| 8 | User can enter saddle height, saddle fore/aft, handlebar height, handlebar reach, crank length | VERIFIED | PhysicalStep renders all 5 core MeasurementField instances with correct labels and blur-sync to Zustand via `updatePhysical` |
| 9 | Handlebar type selector gates drop bar offset fields (PHYS-05, PHYS-07) | VERIFIED | PhysicalStep: Select component for handlebar type; conditional `{handlebarType === 'drop' && <Collapsible>}` renders Hood height offset and Hood reach offset fields; labels change dynamically |
| 10 | Crank length shows helper text "Optional — defaults to 172.5mm" | VERIFIED | PhysicalStep line 266: `helperText="Optional — defaults to 172.5mm (most common road bike crank)"` with `placeholder="172.5"` |
| 11 | Every field has expandable measurement guidance (UX-01) | VERIFIED | MeasurementField wraps all inputs in Collapsible; beginner mode shows "How to measure" trigger; pro mode shows Info icon toggle; guidance text present for all 14 fields across all steps |
| 12 | Override state shows muted note when fitReport has matching axis (FIT-02 UI) | VERIFIED | PhysicalStep computes `overriddenAxes` from `fitReport?.field != null` and passes `isOverridden` prop to each MeasurementField; MeasurementField renders disabled input + italic "Overridden by your fit report" text |
| 13 | User can enter inseam, torso, arm in Body step (BODY-01, BODY-02, BODY-03) | VERIFIED | BodyStep renders 3 MeasurementField instances with labels "Inseam", "Torso length", "Arm length"; blur-sync to Zustand via `updateBody` |
| 14 | User can enter frame stack, reach, and seat tube angle — angle in degrees (FRAME-01/02/03) | VERIFIED | FrameStep renders "Frame stack" (mm), "Frame reach" (mm), "Seat tube angle" (unit="degrees"); no seatTubeLength field; updateFrame wired |
| 15 | Fit Report step shows priority banner (FIT-01, FIT-02) | VERIFIED | FitReportStep: amber banner at line 81 with AlertCircle icon and "Values here override your physical measurements for the same axis."; 4 MeasurementField instances for all fit report axes |
| 16 | Results step shows placeholder card | VERIFIED | ResultsStep renders Card with "Your settings are ready" heading, body text, and sub-line; no form fields (intentional Phase 2 placeholder) |
| 17 | App is mobile-responsive (UX-03) | VERIFIED (auto) / NEEDS HUMAN | WizardShell: `px-4` mobile padding, `max-w-[600px]` desktop, `min-h-[44px]` on all buttons, `flex flex-col-reverse sm:flex-row` nav stack; StepIndicator: `overflow-x-auto`, `hidden sm:inline` labels; UnitInput: `w-full` via relative div; human verification needed for actual viewport behavior |
| 18 | Dark mode renders correctly based on system preference | VERIFIED (auto) / NEEDS HUMAN | App.tsx: `prefers-color-scheme` media query wires `classList.toggle('dark')`; index.css has `.dark { }` block with CSS variables; `dark:bg-zinc-950` on App root; human verification needed for color accuracy |

**Score:** 18/18 truths verified (4 require human visual confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/store/fitStore.ts` | Zustand store with FitInputs shape | VERIFIED | Exports `useFitStore`; full FitStore interface with all methods present |
| `src/components/wizard/fields/MeasurementField.tsx` | Reusable measurement input with guidance | VERIFIED | 163 lines; all props implemented; collapsible guidance, override, error states |
| `src/components/wizard/fields/UnitInput.tsx` | Input with mm/degrees suffix | VERIFIED | Wraps shadcn Input; `type="text"` `inputMode="decimal"`; absolute-positioned unit span |
| `src/lib/utils.ts` | cn() utility for class merging | VERIFIED | Exports `cn()` using clsx + tailwind-merge |
| `components.json` | shadcn/ui configuration | VERIFIED | Present at project root; base-nova style, CSS variables enabled, @/* alias |
| `src/components/wizard/WizardShell.tsx` | Wizard container with step routing | VERIFIED | All 5 steps wired via `renderStepContent()` switch; SkillLevelSelector and StepIndicator wired |
| `src/components/wizard/StepIndicator.tsx` | Horizontal tappable step row | VERIFIED | 5 steps; active (orange-500), completed (zinc-500 + Check), upcoming (zinc-200) states; all buttons keyboard-accessible |
| `src/components/wizard/SkillLevelSelector.tsx` | Pre-wizard skill level screen | VERIFIED | Two tappable role=button cards; calls setSkillLevel + setCurrentStep(1) |
| `src/components/wizard/steps/PhysicalStep.tsx` | Physical measurements form | VERIFIED | 332 lines; handlebar type Select; 5 core fields + 2 conditional drop bar offset fields; override state; blur validation |
| `src/components/wizard/steps/BodyStep.tsx` | Body measurements form | VERIFIED | 124 lines; 3 MeasurementField instances; blur-sync to updateBody |
| `src/components/wizard/steps/FrameStep.tsx` | Frame geometry form | VERIFIED | 131 lines; seat tube angle correctly uses `unit="degrees"`; no seatTubeLength |
| `src/components/wizard/steps/FitReportStep.tsx` | Fit report form with priority banner | VERIFIED | 150 lines; amber banner with AlertCircle; 4 fit report fields; updateFitReport |
| `src/components/wizard/steps/ResultsStep.tsx` | Results placeholder | VERIFIED | Intentional Phase 2 placeholder; Card with correct heading and body text |
| `src/App.tsx` | Root app with dark mode detection | VERIFIED | Dark mode useEffect; WizardShell rendered; `dark:bg-zinc-950` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `vite.config.ts` | `@tailwindcss/vite` | tailwindcss() plugin | WIRED | Line 4: `import tailwindcss from '@tailwindcss/vite'`; line 8: `plugins: [tailwindcss(), react()]` |
| `src/store/fitStore.ts` | `src/types/fit.ts` | `import type { FitInputs }` | WIRED | Line 2: `import type { FitInputs } from '../types/fit'` |
| `src/App.tsx` | `src/components/wizard/WizardShell.tsx` | renders WizardShell | WIRED | Line 2 import + line 18 `<WizardShell />` |
| `src/components/wizard/WizardShell.tsx` | `src/store/fitStore.ts` | useFitStore reads currentStep + skillLevel | WIRED | Line 1 import; `useFitStore()` called in component body |
| `src/components/wizard/SkillLevelSelector.tsx` | `src/store/fitStore.ts` | calls setSkillLevel on selection | WIRED | Line 1 import; `setSkillLevel` and `setCurrentStep(1)` called in `handleSelect` |
| `src/components/wizard/steps/PhysicalStep.tsx` | `src/store/fitStore.ts` | useFitStore for updatePhysical + fitReport override | WIRED | Lines 68-72: reads updatePhysical, physical, fitReport, skillLevel, handlebarType |
| `src/components/wizard/steps/PhysicalStep.tsx` | `MeasurementField.tsx` | renders MeasurementField for each PHYS input | WIRED | 7 `<MeasurementField` instances (5 core + 2 drop bar offset) |
| `src/components/wizard/WizardShell.tsx` | `PhysicalStep.tsx` | renders PhysicalStep at step 1 | WIRED | Line 4 import; `case 1: return ... <PhysicalStep />` |
| `src/components/wizard/steps/FitReportStep.tsx` | `src/store/fitStore.ts` | useFitStore for updateFitReport | WIRED | Line 37: `updateFitReport = useFitStore((s) => s.updateFitReport)` |
| `src/components/wizard/steps/FrameStep.tsx` | `src/store/fitStore.ts` | useFitStore for updateFrame | WIRED | Line 52: `updateFrame = useFitStore((s) => s.updateFrame)` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| PHYS-01 | 02-03 | Saddle height input with reference point | SATISFIED | PhysicalStep: "Saddle height" MeasurementField with guidance text describing BB axle to saddle top |
| PHYS-02 | 02-03 | Saddle setback input | SATISFIED | PhysicalStep: "Saddle fore/aft (setback)" MeasurementField with plumb line guidance |
| PHYS-03 | 02-03 | Handlebar height input | SATISFIED | PhysicalStep: "Handlebar height" / "Hood height" label with floor-to-bar guidance |
| PHYS-04 | 02-03 | Handlebar reach input | SATISFIED | PhysicalStep: "Handlebar reach" / "Hood reach" label with saddle-to-bar guidance |
| PHYS-05 | 02-03 | Drop bar hood height/reach offset inputs | SATISFIED | PhysicalStep: dropBarHoodHeightOffset and dropBarHoodReachOffset fields in Collapsible, gated by `handlebarType === 'drop'` |
| PHYS-06 | 02-03 | Crank length input | SATISFIED | PhysicalStep: "Crank length" with `helperText="Optional — defaults to 172.5mm..."` and `placeholder="172.5"` |
| PHYS-07 | 02-03 | Handlebar type selector | SATISFIED | PhysicalStep: shadcn Select with "Drop bars" and "Flat bars" options; drives label changes and conditional drop bar section |
| FRAME-01 | 02-04 | Frame stack input | SATISFIED | FrameStep: "Frame stack" MeasurementField (mm) with geometry chart guidance |
| FRAME-02 | 02-04 | Frame reach input | SATISFIED | FrameStep: "Frame reach" MeasurementField (mm) with geometry chart guidance |
| FRAME-03 | 02-04 | Seat tube angle input | SATISFIED | FrameStep: "Seat tube angle" with `unit="degrees"`, range 70-80, no seatTubeLength field |
| BODY-01 | 02-03 | Inseam length input | SATISFIED | BodyStep: "Inseam" MeasurementField with barefoot standing guidance |
| BODY-02 | 02-03 | Torso length input | SATISFIED | BodyStep: "Torso length" MeasurementField with C7 to sacrum guidance |
| BODY-03 | 02-03 | Arm length input | SATISFIED | BodyStep: "Arm length" MeasurementField with shoulder to wrist guidance |
| BODY-04 | 02-03 | App derives estimated targets from body measurements | SATISFIED (engine) | BodyStep collects values into Zustand store; BODY-04 derivation handled by Phase 1 calculation engine (correct per plan scope) |
| FIT-01 | 02-04 | Manual fit report value entry | SATISFIED | FitReportStep: 4 MeasurementField instances for saddleHeight, saddleForeAft, handlebarHeight, handlebarReach |
| FIT-02 | 02-04 | Fit report values override others; UI makes this explicit | SATISFIED | Priority banner: "Values here override your physical measurements for the same axis."; Physical step computes `overriddenAxes` and passes `isOverridden` to disable fields |
| UX-01 | 02-01/03 | Every field shows reference point definition | SATISFIED | All 14 fields (across PhysicalStep, BodyStep, FrameStep, FitReportStep) include `guidanceText` prop with measurement instructions; MeasurementField renders these in Collapsible |
| UX-03 | 02-02/05 | Mobile-responsive, usable on phone next to bike | SATISFIED (auto) / NEEDS HUMAN | Responsive Tailwind classes verified; 44px touch targets; hidden sm:inline labels; `overflow-x-auto` on StepIndicator; human visual check still needed |

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/lib/zwiftRideConstants.ts` (lines 133–160) | Empty lookup table objects with TODO comments (`SADDLE_HEIGHT_LETTER_TO_MM = {}` etc.) | Info | Phase 1 known stub — these tables require physical Zwift Ride hardware measurements. Explicitly out of scope for Phase 2. The calculation engine's `mmToLetterPosition` function depends on these — but OUT-01/OUT-02 output requirements are Phase 3. No Phase 2 goals are blocked. |
| `src/components/wizard/steps/ResultsStep.tsx` | Placeholder card with no data output | Info | Intentional Phase 2 stub per plan design. Phase 3 will replace with calculation output (OUT-01 through OUT-05). Not a gap — expected state. |
| `src/components/wizard/WizardShell.tsx` (line 78) | `return null` in switch default case | Info | Correct guard clause for impossible `currentStep` values. Not a stub — defensive programming. |

No blockers or warnings found in Phase 2 scope components.

### Human Verification Required

#### 1. Mobile layout on 375px viewport

**Test:** Open `npm run dev` in browser. Open DevTools and set viewport to 375x812 (iPhone SE). Navigate through all 5 wizard steps (start at skill selector, go through Physical, Body, Frame, Fit Report, Results).
**Expected:** No horizontal scrollbar at any step. All inputs are full-width. All Next/Back buttons are stacked vertically (Next on top) and full-width. Step indicator shows circles only (no labels). All touch targets feel easily tappable.
**Why human:** CSS overflow, visual flow, and touch target usability cannot be confirmed by grep or static analysis.

#### 2. Dark mode color rendering

**Test:** In browser DevTools Rendering panel, set "prefers-color-scheme" to "dark". Reload the app and navigate through all steps.
**Expected:** Page background is very dark (near black). Card backgrounds are dark zinc. All text remains readable. The amber priority banner in the Fit Report step is visible. Orange-500 accent on active step circles and buttons is consistent. The "Overridden" note in italic is legible.
**Why human:** Color contrast and visual correctness require visual inspection; the CSS variables system maps theme tokens that grep cannot evaluate for actual rendered color.

#### 3. Drop bar conditional and label changes

**Test:** In Physical step, select "Drop bars" from the handlebar type dropdown.
**Expected:** The "Handlebar height" label changes to "Hood height" and "Handlebar reach" changes to "Hood reach" immediately. The "Drop bar hood offsets (advanced)" collapsible auto-expands, revealing Hood height offset (placeholder 40) and Hood reach offset (placeholder 50) fields.
**Why human:** Conditional rendering driven by Zustand state change and the auto-expand useEffect require real browser interaction.

#### 4. Override state propagation

**Test:** Navigate to Fit Report step (step 4). Enter any value in "Saddle height (fit report)". Navigate back to Physical step (step 1).
**Expected:** The "Saddle height" field in Physical step should show muted label text, a grayed/disabled input, and italic text "Overridden by your fit report" below it. Other fields should remain normal.
**Why human:** Cross-step Zustand state propagation and the conditional rendering of the override UI require end-to-end interactive testing.

### Gaps Summary

No gaps found. All 18 observable truths are verified. All 13 required artifacts exist and are substantively implemented (not stubs). All 10 key links are wired. All 18 requirement IDs are satisfied.

The ResultsStep placeholder is an intentional Phase 2 design decision — Phase 3 replaces it with calculation output. The empty Zwift Ride lookup tables in `zwiftRideConstants.ts` are a known Phase 1 data gap requiring physical hardware measurement, documented in STATE.md.

---

_Verified: 2026-03-21T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
