---
phase: 02-project-scaffold-input-ui
plan: "02"
subsystem: ui
tags: [wizard, navigation, step-indicator, skill-level, shadcn, zustand, tailwind]

# Dependency graph
requires:
  - phase: 02-01
    provides: useFitStore, shadcn/ui components, MeasurementField, UnitInput, Tailwind v4 wired

provides:
  - WizardShell component: full wizard navigation container with step routing
  - SkillLevelSelector component: pre-wizard skill level screen with two tappable cards
  - StepIndicator component: horizontal 5-step tappable progress row with active/completed/upcoming states
  - Dark mode detection wired in App.tsx via prefers-color-scheme

affects:
  - 02-03-physical-step (renders inside WizardShell step 1 content area)
  - 02-04-body-frame-steps (renders inside WizardShell steps 2-3 content areas)
  - 02-05-fit-report-results (renders inside WizardShell steps 4-5)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WizardShell uses currentStep from useFitStore to route between SkillLevelSelector (step 0) and wizard steps (1-5)"
    - "Mobile layout: full-bleed div with px-4; Desktop: max-w-[600px] Card — two separate DOM branches avoid class-merging issues"
    - "SkillLevelSelector uses role=button div pattern (not button element) to allow flex-col card layout with nested spans"
    - "StepIndicator uses button elements for keyboard accessibility; aria-current=step on active step"
    - "Dark mode applied via classList.toggle('dark') in useEffect with MediaQueryList listener"

key-files:
  created:
    - src/components/wizard/SkillLevelSelector.tsx
    - src/components/wizard/StepIndicator.tsx
    - src/components/wizard/WizardShell.tsx
  modified:
    - src/App.tsx

key-decisions:
  - "WizardShell renders two separate DOM branches (mobile div + desktop Card) rather than one element with responsive classes — avoids class-merge conflicts between full-bleed and Card padding"
  - "SkillLevelSelector border-2 class always present, toggled by conditional color classes — avoids layout shift from border appearing on selection"
  - "Results step (step 5) navigation: only Back button shown; Next button entirely absent to prevent over-navigation"
  - "Step badge for step 1 uses bg-orange-500 text-white inline override — Badge default variant uses bg-primary which maps to theme primary, not orange-500"

requirements-completed: [UX-03]

# Metrics
duration: 3min
completed: "2026-03-21"
---

# Phase 02 Plan 02: Wizard Shell and Navigation Summary

**Wizard shell with skill level selector, 5-step tappable indicator, and Next/Back navigation; full routing skeleton ready for step content plans**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-21T19:23:03Z
- **Completed:** 2026-03-21T19:27:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- SkillLevelSelector renders two tappable option cards (beginner/pro) with orange-500 selected border and background tint
- Selecting a skill level calls setSkillLevel + setCurrentStep(1) advancing to the wizard
- StepIndicator renders 5 tappable steps (Physical/Body/Frame/Fit Report/Results) with active (orange-500), completed (zinc-500 + Check icon), and upcoming (zinc-200) visual states
- WizardShell routes between skill selector (step 0) and wizard steps (1-5) based on currentStep
- Mobile: full-bleed layout with px-4; Desktop: max-w-[600px] Card container (p-6)
- Steps 1-4 show placeholder content with Start here / Optional badges and sub-description
- Step 5 shows results placeholder Card with "Your settings are ready" heading
- Navigation: Next (orange-500 filled), Back (ghost), CTA on step 4 "Set up my Zwift Ride →", step 5 shows only Back
- Dark mode detection wired via prefers-color-scheme in App.tsx useEffect
- All builds pass zero errors

## Task Commits

Each task committed atomically:

1. **Task 1: Create SkillLevelSelector and StepIndicator components** - `aa35f64` (feat)
2. **Task 2: Create WizardShell and wire into App.tsx** - `a0cc9f0` (feat)

## Files Created/Modified

- `src/components/wizard/SkillLevelSelector.tsx` - Pre-wizard skill level screen with two tappable option cards
- `src/components/wizard/StepIndicator.tsx` - Horizontal tappable 5-step row with active/completed/upcoming states and lucide Check icon
- `src/components/wizard/WizardShell.tsx` - Wizard container routing currentStep to SkillLevelSelector or step content with navigation
- `src/App.tsx` - Updated to import WizardShell, add dark mode detection via prefers-color-scheme

## Decisions Made

- **Two DOM branches for responsive layout:** WizardShell renders `<div className="sm:hidden">` and `<div className="hidden sm:block">` rather than a single element with responsive card classes. This avoids class-merge conflicts where Card's internal padding would conflict with the full-bleed mobile layout requirement.
- **border-2 always present on SkillLevelSelector cards:** The border-2 class is always applied; only the border color changes on selection. This prevents layout shift (border-width change from 1px to 2px would shift content by 1px).
- **Results step back-only:** Step 5 navigation intentionally shows only a Back button. No Next button is rendered — the results step is a terminal step and over-navigation past it would break the wizard.
- **Orange badge override:** Badge component's `default` variant uses `bg-primary` (maps to shadcn theme primary color, which is slate/zinc in base-nova, not orange). The "Start here" badge needs orange-500, so an explicit `bg-orange-500 text-white` class override is applied inline.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- Steps 1-4 show placeholder `<p>Step {n} content — coming soon</p>` inside their content areas. These are intentional scaffold stubs. Plans 03-05 will replace them with actual form content. The wizard navigation itself is fully functional.
- Step 5 shows a results placeholder Card. Plan 05 will replace this with actual calculation output.

## Self-Check: PASSED

Files verified present:
- FOUND: src/components/wizard/SkillLevelSelector.tsx
- FOUND: src/components/wizard/StepIndicator.tsx
- FOUND: src/components/wizard/WizardShell.tsx
- FOUND: src/App.tsx (updated)

Commits verified:
- FOUND: aa35f64 (Task 1)
- FOUND: a0cc9f0 (Task 2)

---
*Phase: 02-project-scaffold-input-ui*
*Completed: 2026-03-21*
