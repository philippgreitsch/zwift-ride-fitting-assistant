# Phase 2: Project Scaffold and Input UI — Research

**Researched:** 2026-03-21
**Domain:** React 19 + Tailwind v4 + shadcn/ui multi-step wizard with form state management
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Non-linear 4-step wizard — progress indicator at top, all steps tappable so user can jump freely. No blocking navigation.
- **D-02:** Step order: Physical Measurements → Body Measurements → Frame Geometry → Fit Report. Starts with most familiar (bike + tape measure), ends with most authoritative.
- **D-03:** Physical Measurements section is "start here" — the primary section. Body, Frame, and Fit Report sections are labeled "Optional — fills in gaps".
- **D-04:** No required fields. The engine handles null gracefully. Unanswered sections show a neutral "no data" state, not a validation error.
- **D-05:** Each section header includes a one-liner: "Fill in what you have. Anything left blank will be estimated or skipped."
- **D-06:** "Next" / "Back" buttons for linear flow; step indicators at top are always tappable for jumping.
- **D-07:** Skill level selector shown once at wizard start — two options: "I'm new to bike fitting" and "I know my measurements".
- **D-08:** Beginner mode — measurement guidance auto-expanded for the first field in each section; remaining fields show a visible "How to measure ▾" collapsed prompt.
- **D-09:** Pro mode — all guidance collapsed by default; small ⓘ icon on each label, tap to reveal.
- **D-10:** Skill level is stored in Zustand and persists across sessions.
- **D-11:** Guidance is tap-to-expand inline text (Collapsible), not a tooltip.
- **D-12:** "Complex" fields (saddle height, saddle setback, handlebar reach) get fuller descriptions with explicit reference point callouts.
- **D-13:** "Simple" fields (crank length, inseam, frame stack) get a short one-liner.
- **D-14:** Crank length field always shows "(optional — defaults to 172.5mm)" inline regardless of skill mode.
- **D-15:** Fit Report section displays a persistent banner: "Values here override your physical measurements for the same axis."
- **D-16:** When a user has filled in both a physical measurement and a fit report value for the same axis, the physical field shows a subtle inline note: "Overridden by your fit report" (grayed out, not an error state).
- **D-17:** Results are a dedicated final wizard step — not inline on the input form.
- **D-18:** Explicit CTA at the end of the wizard: "Set up my Zwift Ride →"
- **D-19:** Partial data is allowed — user can trigger the results step even with only 1–2 sections filled.
- **D-20:** In Phase 2, the results step is a placeholder ("Your settings are ready — output coming in Phase 3").
- **D-21:** Handlebar type (drop / flat bar) lives in the Physical Measurements section as the first field.
- **D-22:** Selecting "drop bar" reveals the drop-specific offset fields with sensible defaults shown (40mm / 50mm) and optional override.

### Claude's Discretion

- Exact shadcn/ui component choices per field (Input, Select, etc.)
- Specific wording of measurement guidance text for each field
- Step indicator visual design
- Exact Tailwind spacing and typography
- Zustand store shape and slice organization
- Form validation timing (blur vs submit)

### Deferred Ideas (OUT OF SCOPE)

- Full output/results guide — Phase 3
- localStorage persistence (UX-02) and reset (UX-04) — Phase 3
- Multiple bike profiles (PROF-01 through PROF-03) — v2 backlog
- Shareable URL with encoded measurements (SHARE-02) — v2 backlog

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PHYS-01 | User can enter saddle height (from bottom bracket to top of saddle) with reference point shown | Collapsible guidance pattern + Input component; `physical.saddleHeight` in FitInputs |
| PHYS-02 | User can enter saddle setback (horizontal distance from BB center to saddle nose) | Same pattern; `physical.saddleForeAft` |
| PHYS-03 | User can enter handlebar height with reference point shown | Label changes by handlebar type (D-21/D-22); `physical.handlebarHeight` |
| PHYS-04 | User can enter handlebar reach | Complex field with reference callouts; `physical.handlebarReach` |
| PHYS-05 | User can enter handlebar drop (for drop bars) | Conditional on `handlebarType === 'drop'`; D-22 Collapsible section |
| PHYS-06 | User can enter crank length | Simple field; defaults to 172.5mm; `physical.crankLength` |
| PHYS-07 | User can select handlebar type (drop bars vs flat bars) | Select component; gates hood offset fields and re-labels height/reach fields |
| FRAME-01 | User can enter frame stack | Simple field; `frame.stack` |
| FRAME-02 | User can enter frame reach | Simple field; `frame.reach` |
| FRAME-03 | User can enter seat tube length and angle | `frame.seatTubeAngle` (degrees, not mm — special unit handling needed) |
| BODY-01 | User can enter inseam length | Simple field; `body.inseam` |
| BODY-02 | User can enter torso length | Simple field; `body.torso` |
| BODY-03 | User can enter arm length | Simple field; `body.arm` |
| BODY-04 | App derives estimated position targets from body measurements when direct measurements are absent | No UI action; handled by calculation engine (Phase 1). Store just needs to hold body values. |
| FIT-01 | User can manually enter key values from a professional bike fit report | Step 4 fields: `fitReport.saddleHeight`, `fitReport.saddleForeAft`, `fitReport.handlebarHeight`, `fitReport.handlebarReach` |
| FIT-02 | Fit report values take priority over derived/estimated values | Priority banner (D-15) + "Overridden" inline note (D-16) — UI-only, engine already handles priority |
| UX-01 | Every measurement input field shows a reference point definition | Collapsible guidance panels in all steps — beginner/pro mode awareness |
| UX-03 | App is mobile-responsive and usable on a phone next to the bike | Mobile-first layout contract defined in UI-SPEC; full-width inputs, 44px touch targets, single-column |

</phase_requirements>

---

## Summary

Phase 2 builds on a Vite 8 + React 19 + TypeScript scaffold that already exists from Phase 1. The calculation engine, types, and constants are fully implemented. What is entirely absent: Tailwind CSS, shadcn/ui, Zustand, React Hook Form, and all UI. Every package listed in CLAUDE.md must be installed fresh.

The core pattern is a 5-screen wizard (skill selector pre-screen + 4 data steps + results placeholder). All form state lives in a Zustand store holding the `FitInputs` shape from `src/types/fit.ts`. React Hook Form manages local field validation (blur-timed, no required fields) while Zustand holds the canonical state. The "Overridden by fit report" state is computed from the Zustand store, not from React Hook Form state — this is an important architectural split.

The UI-SPEC (02-UI-SPEC.md) is a binding contract and should be treated as a primary input alongside this research document. Field names, copy, colors, spacing, and component choices are all locked there. The planner should reference the UI-SPEC Field Inventory table directly when generating per-step tasks.

**Primary recommendation:** Install all missing dependencies in Wave 0 (shadcn init + package installs + Tailwind plugin wiring), then implement wizard shell and Zustand store before any step content, so all later step tasks can work independently and in parallel.

---

## Standard Stack

### Core (already installed from Phase 1)
| Library | Installed Version | Purpose |
|---------|------------------|---------|
| React | 19.2.x | UI framework |
| react-dom | 19.2.x | DOM rendering |
| TypeScript | 5.9.3 | Type safety |
| Vite | 8.0.1 | Build tool / dev server |
| zod | 4.3.6 | Validation schemas |
| vitest | 2.0.x | Unit testing |

### Must Install in Phase 2
| Library | Current Version (npm verified) | Purpose | Why |
|---------|-------------------------------|---------|-----|
| tailwindcss | 4.2.2 | Utility CSS | v4 Oxide engine; required for shadcn/ui |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind v4 | v4 uses Vite plugin, NOT postcss |
| zustand | 5.0.12 | Global form state + skill level | persist middleware for session continuity |
| react-hook-form | 7.71.2 | Field-level form management | blur validation, no re-renders |
| @hookform/resolvers | 5.2.2 | RHF ↔ Zod bridge | connects Zod schema to RHF |
| lucide-react | 0.577.0 | Icons | used by shadcn/ui; ChevronDown, Info, Check, AlertCircle |
| class-variance-authority | 0.7.1 | Variant management | shadcn/ui dependency |
| clsx | 2.1.1 | Class merging | shadcn/ui utility |
| tailwind-merge | 3.5.0 | Tailwind class deduplication | shadcn/ui `cn()` utility |
| @fontsource/inter | 5.2.8 | Inter font (self-hosted) | UI-SPEC: Inter font, loaded locally not CDN |

### shadcn/ui Components (CLI-installed, not npm packages)
| Component | shadcn command | Used for |
|-----------|----------------|----------|
| button | `npx shadcn@latest add button` | Next, Back, CTA |
| input | `npx shadcn@latest add input` | All measurement number fields |
| label | `npx shadcn@latest add label` | All form field labels |
| select | `npx shadcn@latest add select` | Handlebar type, skill level (fallback if card selector not available) |
| card | `npx shadcn@latest add card` | Wizard step container, optional section wrapper |
| badge | `npx shadcn@latest add badge` | "Start here" / "Optional" labels |
| collapsible | `npx shadcn@latest add collapsible` | "How to measure" guidance panels (UX-01) |
| separator | `npx shadcn@latest add separator` | Field group dividers |

**Installation order matters:** Tailwind + vite plugin MUST be wired before running `npx shadcn@latest init`, because shadcn detects the CSS framework during init.

**Installation commands:**
```bash
# Step 1: Tailwind v4 + Vite plugin
npm install tailwindcss @tailwindcss/vite

# Step 2: Core state + form packages
npm install zustand react-hook-form @hookform/resolvers

# Step 3: shadcn/ui dependencies + font
npm install lucide-react class-variance-authority clsx tailwind-merge @fontsource/inter

# Step 4: Wire Tailwind plugin into vite.config.ts BEFORE shadcn init
# (see Architecture Patterns below)

# Step 5: Initialize shadcn/ui
npx shadcn@latest init
# Accept defaults: slate base, zinc accents, 0.5rem radius, Inter font

# Step 6: Add components
npx shadcn@latest add button input label select card badge collapsible separator
```

**Version verification:** All versions above were verified against npm registry on 2026-03-21.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/                  # shadcn/ui generated components (do not hand-edit)
│   ├── wizard/
│   │   ├── WizardShell.tsx          # Step routing, progress indicator, Next/Back
│   │   ├── StepIndicator.tsx        # Horizontal tappable step row
│   │   ├── SkillLevelSelector.tsx   # Pre-wizard screen (D-07)
│   │   ├── steps/
│   │   │   ├── PhysicalStep.tsx     # Step 1: PHYS-01..07
│   │   │   ├── BodyStep.tsx         # Step 2: BODY-01..03
│   │   │   ├── FrameStep.tsx        # Step 3: FRAME-01..03
│   │   │   ├── FitReportStep.tsx    # Step 4: FIT-01..02
│   │   │   └── ResultsStep.tsx      # Step 5: placeholder (D-20)
│   │   └── fields/
│   │       ├── MeasurementField.tsx # Reusable: Input + Label + Collapsible guidance
│   │       └── UnitInput.tsx        # Input with "mm" suffix slot
├── store/
│   └── fitStore.ts          # Zustand store: FitInputs + skillLevel + currentStep
├── lib/                     # Phase 1 output — do not modify
│   ├── calculations.ts
│   ├── validators.ts
│   └── zwiftRideConstants.ts
├── types/                   # Phase 1 output — do not modify
│   └── fit.ts
├── index.css                # @import "tailwindcss" + CSS variables for shadcn
└── main.tsx                 # imports '@fontsource/inter'
```

### Pattern 1: Tailwind v4 Vite Plugin Wiring
**What:** v4 no longer uses a `tailwind.config.js` or the postcss plugin. Instead it uses `@tailwindcss/vite`.
**When to use:** Always — this is the only supported Tailwind v4 + Vite setup path.
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
```
```css
/* src/index.css */
@import "tailwindcss";
/* shadcn/ui CSS variables will be added here by `npx shadcn@latest init` */
```

### Pattern 2: Zustand Store Shape
**What:** Single store holding `FitInputs`, `skillLevel`, and `currentStep`. The `persist` middleware is deferred to Phase 3 (UX-02) — Phase 2 store persists in memory only.
**When to use:** Create once in Wave 0; all wizard steps read/write from this store.
```typescript
// src/store/fitStore.ts
import { create } from 'zustand'
import type { FitInputs } from '../types/fit'

type SkillLevel = 'beginner' | 'pro'

interface FitStore {
  inputs: FitInputs
  skillLevel: SkillLevel | null
  currentStep: number  // 0 = skill selector, 1..5 = wizard steps
  setSkillLevel: (level: SkillLevel) => void
  updatePhysical: (patch: Partial<NonNullable<FitInputs['physical']>>) => void
  updateBody: (patch: Partial<NonNullable<FitInputs['body']>>) => void
  updateFrame: (patch: Partial<NonNullable<FitInputs['frame']>>) => void
  updateFitReport: (patch: Partial<NonNullable<FitInputs['fitReport']>>) => void
  setCurrentStep: (step: number) => void
}
```

**Key insight:** Skill level IS stored in Zustand per D-10. Persistence (Zustand `persist` middleware) is deferred to Phase 3 (UX-02 requirement). In Phase 2, all state is in-memory only.

### Pattern 3: RHF + Zustand Sync (blur-timed)
**What:** React Hook Form owns local validation; Zustand holds canonical state. On `onBlur`, validated value is written to store.
**When to use:** Every measurement input field.
```typescript
// In each step component
const { register, formState: { errors } } = useForm<PhysicalFormValues>({
  resolver: zodResolver(physicalSchema),
  mode: 'onBlur',  // D-Claude's Discretion: blur timing
})

// On blur: sync to Zustand
const handleBlur = (field: keyof PhysicalFormValues, value: string) => {
  const num = value === '' ? undefined : Number(value)
  updatePhysical({ [field]: num })
}
```

**Critical:** No required fields (D-04). Empty string converts to `undefined`, not an error.

### Pattern 4: "Overridden by fit report" State (D-16)
**What:** Computed from Zustand, not from form state. Physical fields check whether the corresponding `fitReport` axis is populated.
**When to use:** All PHYS-01..05 fields that have a `fitReport` counterpart.
```typescript
// In PhysicalStep
const fitReport = useFitStore(s => s.inputs.fitReport)
const isOverridden = (axis: 'saddleHeight' | 'saddleForeAft' | 'handlebarHeight' | 'handlebarReach') =>
  fitReport?.[axis] !== undefined && fitReport[axis] !== null
```

### Pattern 5: Conditional Drop Bar Fields (D-22)
**What:** Hood offset fields and relabeling appear when `handlebarType === 'drop'`.
**When to use:** Physical step only.
```typescript
const handlebarType = useFitStore(s => s.inputs.physical?.handlebarType)
// Show hood offset Collapsible only when handlebarType === 'drop'
// Dynamically adjust label: handlebarType === 'drop' ? 'Hood height' : 'Handlebar height'
```

### Pattern 6: MeasurementField Reusable Component
**What:** Wraps shadcn Input + Label + Collapsible guidance into a single composable unit. Accepts guidance text, guidance level ('simple'|'complex'), and override state props.
**Why:** All 16 measurement fields use the same structure. Centralizing avoids copy-paste drift in styles, aria labels, and guidance expand logic.
```typescript
interface MeasurementFieldProps {
  id: string
  label: string
  unit?: 'mm' | 'degrees'
  guidanceLevel: 'simple' | 'complex'
  guidanceText: React.ReactNode
  isOverridden?: boolean
  defaultExpanded?: boolean  // true for first field in beginner mode
  // ...RHF register props
}
```

### Anti-Patterns to Avoid
- **Putting calculation logic in React components:** All formulas stay in `src/lib/calculations.ts`. Components only read from the store.
- **Using tooltip/popover for guidance:** D-11 locks this to Collapsible inline text. Do not install Dialog, Tooltip, or Popover.
- **Re-deriving "overridden" state from RHF:** Always derive from Zustand store. RHF does not know about fitReport values.
- **Using postcss plugin for Tailwind v4:** Must use `@tailwindcss/vite`. The postcss path (`tailwind.config.js`) is v3 only.
- **Installing shadcn before Tailwind is wired:** shadcn init reads the Vite config to detect Tailwind version. Install and wire Tailwind first.
- **Inventing new field names:** UI-SPEC Field Inventory maps every field to its exact `FitInputs` path. Use those paths exactly — no renames.
- **Required fields or asterisks:** D-04 prohibits required field indicators of any kind.
- **Installing Progress component unless needed:** UI-SPEC marks it Optional — only install if step indicator needs it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Field validation with error messages | Custom error state | React Hook Form + Zod | RHF handles blur/submit timing, error clearing, and field registration; Zod provides schema |
| "mm" suffix on input | Absolute-positioned `<span>` inside custom div | Input with `className` right-padding + a sibling `<span>` per shadcn pattern | Consistent focus ring, accessibility; shadcn Input accepts className customization |
| Expandable guidance panels | Custom accordion from scratch | shadcn Collapsible (Radix primitive) | Keyboard accessible, handles open/close state, animatable |
| Option card selector (skill level) | Custom radio button styling | Two `<Card>` components with `onClick` and conditional border class | Simpler, accessible, matches UI-SPEC "large tappable option cards" |
| Step indicator | Custom progress bar component | Plain divs with conditional Tailwind classes (active/completed/upcoming) | No library needed; logic is: `step < current`, `step === current`, `step > current` |
| Form state persistence | Manual `useEffect` + `localStorage.setItem` | Zustand `persist` middleware | Phase 3 task — not needed in Phase 2; don't pre-implement |

**Key insight:** The "hard" parts of this phase are not calculation or business logic (Phase 1 handles that) — they are accessibility, conditional rendering, and consistent field layout. shadcn/ui and React Hook Form solve all of these without custom code.

---

## Critical Installation Context

### What Phase 1 Left
The project scaffold from Phase 1 includes:
- Vite 8.0.1 + `@vitejs/plugin-react` v6 (chosen for Vite 8 peer dep compatibility, per STATE.md)
- `src/types/fit.ts` — `FitInputs`, `FitOutputs`, `AxisOutput` complete type contracts
- `src/lib/calculations.ts` — `calculateFitOutputs()` orchestrator
- `src/lib/zwiftRideConstants.ts` — `DEFAULT_CRANK_LENGTH_MM` (172.5), `DEFAULT_DROP_BAR_HOOD_*_OFFSET_MM`
- `src/lib/validators.ts` — Zod validators (verify what's in here before writing new schemas)
- `src/App.tsx` — bare shell (`<h1>Zwift Ride Fitting Assistant</h1>`)
- NO CSS framework, NO state management, NO form library, NO UI components

### What Must Be Added (Wave 0)
1. Tailwind v4 + `@tailwindcss/vite` plugin → wire into `vite.config.ts`
2. `@import "tailwindcss"` in `src/index.css`
3. `zustand`, `react-hook-form`, `@hookform/resolvers`
4. `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
5. `@fontsource/inter`
6. `npx shadcn@latest init` (with slate/zinc/0.5rem/Inter preset)
7. `npx shadcn@latest add button input label select card badge collapsible separator`
8. Import `@fontsource/inter/400.css` and `@fontsource/inter/600.css` in `main.tsx`

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config Approach
**What goes wrong:** Developer creates `tailwind.config.js` or adds tailwindcss to postcss. Nothing renders.
**Why it happens:** v3 docs are more prevalent. shadcn guides sometimes reference v3 setup.
**How to avoid:** Use `@tailwindcss/vite` plugin only. No `tailwind.config.js`. No postcss entry. `@import "tailwindcss"` in CSS is the only configuration needed.
**Warning signs:** Tailwind classes applied but no styles appear; `postcss.config.js` exists with tailwindcss entry.

### Pitfall 2: shadcn Init Without Tailwind Wired
**What goes wrong:** `npx shadcn@latest init` fails or generates incorrect `components.json` / CSS variables.
**Why it happens:** shadcn init detects the CSS framework by reading the Vite config and CSS files. If Tailwind is not yet wired, it may fall back to an incorrect configuration.
**How to avoid:** Always run `npm install tailwindcss @tailwindcss/vite` AND update `vite.config.ts` and `index.css` BEFORE running shadcn init.

### Pitfall 3: RHF "required" vs Null Fields
**What goes wrong:** Default Zod schema treats empty string as invalid; RHF marks field as error on blur.
**Why it happens:** `z.number()` rejects empty string; `z.coerce.number()` converts `""` to `0` not `undefined`.
**How to avoid:** Use `z.preprocess(val => val === '' ? undefined : Number(val), z.number().optional())` pattern for all measurement fields. Empty field = undefined, which is valid.
**Warning signs:** Blur on an empty field shows a red error border when it should not.

### Pitfall 4: Zustand Store Shape vs FitInputs
**What goes wrong:** Store holds a flattened structure (e.g., `saddleHeight` at top level) instead of nested `FitInputs` shape. Calculation engine call fails.
**Why it happens:** Flatter store feels easier at first.
**How to avoid:** Store `inputs: FitInputs` verbatim. The `updatePhysical` etc. methods patch nested sub-objects with spread. Never flatten the shape.

### Pitfall 5: "Overridden" State from RHF Instead of Zustand
**What goes wrong:** Developer checks RHF's form values to determine override state; override indicator never shows because RHF only knows about the current step's fields.
**Why it happens:** RHF is the closest form state to the input.
**How to avoid:** Override state is always computed from `useFitStore` — reads both `inputs.physical.*` and `inputs.fitReport.*`. RHF has no visibility into other steps.

### Pitfall 6: Wizard Step as Separate Routes
**What goes wrong:** Developer reaches for React Router for wizard navigation. Adds unnecessary complexity, breaks UX-03 (no page reloads on step changes).
**Why it happens:** Multi-step wizards are often associated with routing.
**How to avoid:** Wizard is a single component with a `currentStep: number` in Zustand. Conditional render of step content. No router needed for Phase 2.

### Pitfall 7: Drop Bar Field Visibility via React State Instead of Zustand
**What goes wrong:** `useState` for `handlebarType` within PhysicalStep. On wizard navigation and return, state resets to default, hiding or showing wrong fields.
**Why it happens:** useState feels natural for local UI.
**How to avoid:** `handlebarType` is in Zustand (`inputs.physical.handlebarType`). Read from store; update store on select. Never use React local state for values that should persist across step navigation.

### Pitfall 8: Seat Tube Angle Unit
**What goes wrong:** Seat tube angle field (FRAME-03) is rendered with "mm" suffix. It is in degrees.
**Why it happens:** All other frame fields are mm; easy oversight.
**How to avoid:** `UnitInput` component accepts `unit` prop: `'mm' | 'degrees'`. FRAME-03 passes `unit="degrees"`.

---

## Code Examples

### Zustand Store (with FitInputs shape)
```typescript
// src/store/fitStore.ts
import { create } from 'zustand'
import type { FitInputs } from '../types/fit'

type SkillLevel = 'beginner' | 'pro'

interface FitStore {
  inputs: FitInputs
  skillLevel: SkillLevel | null
  currentStep: number
  setSkillLevel: (level: SkillLevel) => void
  updatePhysical: (patch: Partial<NonNullable<FitInputs['physical']>>) => void
  updateBody: (patch: Partial<NonNullable<FitInputs['body']>>) => void
  updateFrame: (patch: Partial<NonNullable<FitInputs['frame']>>) => void
  updateFitReport: (patch: Partial<NonNullable<FitInputs['fitReport']>>) => void
  setCurrentStep: (step: number) => void
}

export const useFitStore = create<FitStore>()((set) => ({
  inputs: {},
  skillLevel: null,
  currentStep: 0,
  setSkillLevel: (level) => set({ skillLevel: level }),
  updatePhysical: (patch) =>
    set((s) => ({ inputs: { ...s.inputs, physical: { ...s.inputs.physical, ...patch } } })),
  updateBody: (patch) =>
    set((s) => ({ inputs: { ...s.inputs, body: { ...s.inputs.body, ...patch } } })),
  updateFrame: (patch) =>
    set((s) => ({ inputs: { ...s.inputs, frame: { ...s.inputs.frame, ...patch } } })),
  updateFitReport: (patch) =>
    set((s) => ({ inputs: { ...s.inputs, fitReport: { ...s.inputs.fitReport, ...patch } } })),
  setCurrentStep: (step) => set({ currentStep: step }),
}))
```

### Zod Schema for Empty-Tolerant Number Fields
```typescript
// Applied to all measurement fields — empty string becomes undefined, never an error
const optionalMm = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z.number().positive().optional()
)
```

### Tailwind v4 + Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```
```css
/* src/index.css */
@import "tailwindcss";
/* shadcn/ui will append its CSS variable block here during init */
```

### "Overridden by fit report" Pattern
```typescript
// src/components/wizard/steps/PhysicalStep.tsx
const fitReport = useFitStore((s) => s.inputs.fitReport)

const overriddenAxes = {
  saddleHeight:    fitReport?.saddleHeight    != null,
  saddleForeAft:   fitReport?.saddleForeAft   != null,
  handlebarHeight: fitReport?.handlebarHeight != null,
  handlebarReach:  fitReport?.handlebarReach  != null,
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind postcss plugin + `tailwind.config.js` | `@tailwindcss/vite` plugin, `@import "tailwindcss"` CSS only | Tailwind v4 (Jan 2025) | No config file needed; different Vite plugin |
| shadcn/ui + Tailwind v3 | shadcn/ui auto-detects v4 via `npx shadcn@latest init` | shadcn CLI update ~early 2025 | `npx shadcn@latest init` handles v4 automatically |
| Zod v3 `.optional()` | Zod v4 `.optional()` (same API, 14x faster, smaller bundle) | Zod v4 (2025) | Import from `'zod'` unchanged; validators.ts already uses Zod v4 |
| React Router for wizard steps | Zustand `currentStep` + conditional render | Recognized pattern for single-page wizards | No routing library needed |

**Deprecated/outdated:**
- `Create React App`: deprecated by React team, not relevant
- Tailwind postcss config: v3 only, do not use with v4

---

## Open Questions

1. **What is in `src/lib/validators.ts`?**
   - What we know: File was created in Phase 1; likely contains Zod measurement schemas
   - What's unclear: Whether it already covers Phase 2 field shapes, to avoid duplicating validation logic
   - Recommendation: Read `validators.ts` in Wave 0 before writing new Zod schemas

2. **Seat tube angle input precision**
   - What we know: `frame.seatTubeAngle` is in degrees (e.g., 73.5°)
   - What's unclear: Whether to accept decimal degrees or integer only; min/max range for validation
   - Recommendation: Accept `z.number().min(60).max(85)` (anatomically reasonable range); allow one decimal

3. **shadcn/ui `@hookform/resolvers` version mismatch**
   - What we know: npm shows `@hookform/resolvers` at 5.2.2; CLAUDE.md says 3.x
   - What's unclear: Whether 5.x has breaking changes vs 3.x for Zod v4 integration
   - Recommendation: Install 5.2.2 (current), test the Zod v4 resolver works. If not, pin to 3.x. This needs verification in Wave 0.

---

## Sources

### Primary (HIGH confidence)
- `src/types/fit.ts` — authoritative FitInputs shape; all field names verified from source
- `src/lib/zwiftRideConstants.ts` — DEFAULT_CRANK_LENGTH_MM (172.5), DEFAULT_DROP_BAR_HOOD_*_OFFSET_MM values
- `CLAUDE.md` — full technology stack decisions, version table, installation commands
- `.planning/phases/02-project-scaffold-input-ui/02-UI-SPEC.md` — binding visual + interaction contract
- `.planning/phases/02-project-scaffold-input-ui/2-CONTEXT.md` — all D-0x locked decisions
- Tailwind CSS v4 announcement: https://tailwindcss.com/blog/tailwindcss-v4 — Vite plugin requirement confirmed

### Secondary (MEDIUM confidence)
- npm registry (verified 2026-03-21): zustand 5.0.12, react-hook-form 7.71.2, @hookform/resolvers 5.2.2, tailwindcss 4.2.2, @tailwindcss/vite 4.2.2, lucide-react 0.577.0

### Tertiary (LOW confidence)
- `@hookform/resolvers` v5.x Zod v4 compatibility: assumed from version bump; needs Wave 0 verification

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry on research date
- Architecture: HIGH — patterns derived from Phase 1 type contracts + locked CONTEXT.md decisions + UI-SPEC
- Pitfalls: HIGH — Tailwind v4 config trap and RHF null-field trap are well-documented; others derived from architectural analysis
- `@hookform/resolvers` v5 compatibility: LOW — unverified; flag for Wave 0 smoke test

**Research date:** 2026-03-21
**Valid until:** 2026-04-20 (30 days — stable libraries; Tailwind v4 and shadcn CLI can iterate faster, re-verify if > 2 weeks)
