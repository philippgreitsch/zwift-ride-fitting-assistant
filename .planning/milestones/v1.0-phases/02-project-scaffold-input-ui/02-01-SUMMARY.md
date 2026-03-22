---
phase: 02-project-scaffold-input-ui
plan: "01"
subsystem: ui
tags: [tailwind, shadcn, zustand, react-hook-form, base-ui, collapsible, form-fields]

# Dependency graph
requires:
  - phase: 01-calculation-engine
    provides: FitInputs type, FitOutputs type, validators.ts Zod schemas, zwiftRideConstants.ts

provides:
  - Tailwind v4 wired via @tailwindcss/vite plugin (no postcss, no tailwind.config.js)
  - shadcn/ui initialized with base-nova style using @base-ui/react primitives
  - shadcn/ui components: button, input, label, select, card, badge, collapsible, separator
  - Zustand store (useFitStore) holding FitInputs shape with updatePhysical/Body/Frame/FitReport methods
  - UnitInput component: text input with mm/degrees suffix, inputMode=decimal
  - MeasurementField component: full measurement field with label, collapsible guidance, override state, error state

affects:
  - 02-wizard-shell (depends on useFitStore, shadcn components)
  - 02-physical-step (uses MeasurementField, UnitInput, useFitStore)
  - 02-body-frame-steps (uses MeasurementField, UnitInput, useFitStore)
  - 02-fit-report-step (uses MeasurementField, useFitStore)

# Tech tracking
tech-stack:
  added:
    - tailwindcss 4.2.2
    - "@tailwindcss/vite 4.2.2"
    - zustand 5.0.12
    - react-hook-form 7.71.2
    - "@hookform/resolvers 5.2.2"
    - lucide-react 0.577.0
    - class-variance-authority 0.7.1
    - clsx 2.1.1
    - tailwind-merge 3.5.0
    - "@fontsource/inter 5.2.8"
    - "@base-ui/react 1.3.0 (shadcn base-nova style)"
    - shadcn 4.1.0
    - tw-animate-css 1.4.0
  patterns:
    - Tailwind v4 uses @tailwindcss/vite plugin only — no tailwind.config.js, no postcss
    - shadcn/ui base-nova style uses @base-ui/react primitives (not @radix-ui)
    - Path alias @/* -> ./src/* in tsconfig.app.json + vite.config.ts (required by shadcn init)
    - UnitInput uses inputMode=decimal not type=number to avoid browser spinners
    - MeasurementField derives isOverridden from prop (caller computes from Zustand fitReport state)
    - Zustand store holds nested FitInputs shape verbatim — no flattening

key-files:
  created:
    - src/store/fitStore.ts
    - src/components/wizard/fields/UnitInput.tsx
    - src/components/wizard/fields/MeasurementField.tsx
    - src/components/ui/button.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - src/components/ui/select.tsx
    - src/components/ui/card.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/collapsible.tsx
    - src/components/ui/separator.tsx
    - src/lib/utils.ts
  modified:
    - vite.config.ts
    - src/main.tsx
    - src/index.css
    - tsconfig.json
    - tsconfig.app.json
    - package.json
    - components.json

key-decisions:
  - "shadcn/ui used base-nova style (not slate/radix default) — uses @base-ui/react primitives; this is the default when running npx shadcn@latest init --defaults in 2026"
  - "tsconfig.json required @/* path alias for shadcn init to succeed; added compilerOptions to root tsconfig.json and tsconfig.app.json"
  - "Zustand store does not use persist middleware in Phase 2 — deferred to Phase 3 per UX-02 requirement"
  - "MeasurementField tracks open state locally via React.useState, initialized from defaultExpanded prop"
  - "CollapsibleContent maps to base-ui Panel component; onOpenChange receives (open, eventDetails) not just open"

patterns-established:
  - "Pattern: Import shadcn components from @/components/ui/<component>"
  - "Pattern: Use cn() from @/lib/utils for conditional class merging"
  - "Pattern: UnitInput wraps shadcn Input with absolute-positioned unit span"
  - "Pattern: MeasurementField is the atomic reusable form field — use it for all measurement inputs"
  - "Pattern: Override state computed from Zustand store at step level, passed as isOverridden prop"

requirements-completed: [UX-01, UX-03]

# Metrics
duration: 5min
completed: "2026-03-21"
---

# Phase 02 Plan 01: Project Scaffold + Dependencies Summary

**Tailwind v4 + shadcn/ui (base-nova/@base-ui) wired into Vite 8, Zustand store with FitInputs shape, MeasurementField and UnitInput reusable components ready for wizard steps**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T19:14:49Z
- **Completed:** 2026-03-21T19:19:57Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Tailwind v4 wired via @tailwindcss/vite plugin with CSS variables; no tailwind.config.js or postcss
- shadcn/ui initialized (base-nova style, @base-ui/react primitives) with 8 components installed
- Zustand store matches FitInputs nested shape exactly with patch methods per section
- MeasurementField handles beginner/pro guidance modes, override state, and error state
- UnitInput renders mm/degrees suffix without browser spinner issues (inputMode=decimal)
- All builds pass with zero TypeScript/Vite errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and wire Tailwind v4 + shadcn/ui** - `cb729c6` (feat)
2. **Task 2: Create Zustand store and reusable field components** - `a5203ca` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `src/store/fitStore.ts` - Zustand store with FitInputs shape, skill level, currentStep, and update methods
- `src/components/wizard/fields/UnitInput.tsx` - Input wrapper with mm/degrees unit suffix
- `src/components/wizard/fields/MeasurementField.tsx` - Full measurement field: label, collapsible guidance, input, error/override states
- `src/components/ui/button.tsx` - shadcn Button (base-nova)
- `src/components/ui/input.tsx` - shadcn Input (base-nova)
- `src/components/ui/label.tsx` - shadcn Label
- `src/components/ui/select.tsx` - shadcn Select
- `src/components/ui/card.tsx` - shadcn Card
- `src/components/ui/badge.tsx` - shadcn Badge
- `src/components/ui/collapsible.tsx` - shadcn Collapsible (base-ui Panel)
- `src/components/ui/separator.tsx` - shadcn Separator
- `src/lib/utils.ts` - cn() utility (clsx + tailwind-merge)
- `vite.config.ts` - Added @tailwindcss/vite plugin and @/* path alias
- `src/main.tsx` - Added @fontsource/inter imports and CSS import
- `src/index.css` - @import tailwindcss + shadcn CSS variables
- `tsconfig.json` + `tsconfig.app.json` - Added @/* path alias (required for shadcn init)
- `components.json` - shadcn configuration (base-nova, neutral, CSS variables)
- `package.json` - All Phase 2 dependencies added

## Decisions Made
- **shadcn base-nova style:** `npx shadcn@latest init --defaults` in 2026 selects base-nova (not the legacy slate/radix style). This uses `@base-ui/react` primitives instead of `@radix-ui/*`. The component APIs are compatible for this use case.
- **Path alias required:** shadcn init fails without `@/*` alias in tsconfig. Added to both root `tsconfig.json` and `tsconfig.app.json`.
- **No Zustand persist in Phase 2:** Persist middleware deferred to Phase 3 per UX-02 requirement. Store is in-memory only.
- **CollapsibleContent is base-ui Panel:** `onOpenChange` receives `(open: boolean, eventDetails)` — the MeasurementField handles this correctly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @/* path alias to tsconfig.json for shadcn init**
- **Found during:** Task 1 (shadcn/ui initialization)
- **Issue:** `npx shadcn@latest init --defaults` failed with "No import alias found in your tsconfig.json file" — shadcn reads the root tsconfig for path alias configuration
- **Fix:** Added `compilerOptions.baseUrl` and `compilerOptions.paths` (`@/*: ./src/*`) to both `tsconfig.json` and `tsconfig.app.json`; updated `vite.config.ts` to include `resolve.alias` using `path.resolve(__dirname, './src')`; installed `@types/node` as devDependency for the `path` module
- **Files modified:** tsconfig.json, tsconfig.app.json, vite.config.ts, package.json
- **Verification:** shadcn init succeeded on third attempt
- **Committed in:** cb729c6 (Task 1 commit, within the initial commit scope)

---

**Total deviations:** 1 auto-fixed (1 blocking — required for shadcn init)
**Impact on plan:** Auto-fix was necessary to unblock shadcn initialization. The path alias is also best practice for import resolution in this project. No scope creep.

## Issues Encountered
- shadcn/ui `--defaults` flag selects "base-nova" preset (Geist font, @base-ui/react) rather than the Radix/Slate setup described in CLAUDE.md. This is expected — shadcn CLI evolves quickly. The base-nova components are functionally equivalent for our purposes (Collapsible, Input, Label, Button all work as expected). The Inter font is still imported via `@fontsource/inter` in `main.tsx` as planned.

## Known Stubs
None — no UI stubs introduced in this plan. The MeasurementField and UnitInput are complete components. The Zustand store is a live in-memory store (no persistence stub).

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Tailwind v4 CSS framework fully operational
- shadcn/ui components available from `@/components/ui/*`
- `useFitStore` importable from `@/store/fitStore` with full FitInputs shape
- `MeasurementField` and `UnitInput` ready for use in wizard step components
- All subsequent Phase 2 plans (wizard shell, step components) can proceed independently

## Self-Check: PASSED

All key files verified present:
- FOUND: src/store/fitStore.ts
- FOUND: src/components/wizard/fields/MeasurementField.tsx
- FOUND: src/components/wizard/fields/UnitInput.tsx
- FOUND: components.json
- FOUND: src/components/ui/collapsible.tsx

All commits verified:
- FOUND: cb729c6 (Task 1)
- FOUND: a5203ca (Task 2)

---
*Phase: 02-project-scaffold-input-ui*
*Completed: 2026-03-21*
