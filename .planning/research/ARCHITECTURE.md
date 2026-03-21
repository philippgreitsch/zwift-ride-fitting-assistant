# Architecture Research

**Domain:** Frontend-only bike fitting calculator — form inputs to hardware position output
**Researched:** 2026-03-21
**Confidence:** HIGH (patterns), MEDIUM (Zwift Ride hardware encoding specifics)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer (React)                          │
├──────────────────┬──────────────────┬───────────────────────────┤
│   InputSection   │   ResultsSection │     NavigationShell        │
│  (form wizard)   │  (output guide)  │  (step indicator/tabs)    │
│                  │                  │                           │
│  ┌────────────┐  │  ┌────────────┐  │                           │
│  │InputForms  │  │  │ResultCards │  │                           │
│  │(RHF+Zod)   │  │  │(mm + notch)│  │                           │
│  └─────┬──────┘  │  └────────────┘  │                           │
├────────┼─────────┴──────────────────┴───────────────────────────┤
│        │              State Layer (Zustand)                      │
│        │  ┌─────────────────────────────────────────────────┐   │
│        └─►│  fitProfileStore  (persist → localStorage)      │   │
│           │  { inputs, calculatedOutputs, activeStep }      │   │
│           └──────────────────┬──────────────────────────────┘   │
├──────────────────────────────┼─────────────────────────────────┤
│                              │   Calculation Engine (pure TS)  │
│           ┌──────────────────▼──────────────────────────────┐   │
│           │  src/lib/calculations.ts                         │   │
│           │  calculateSaddleHeight(inputs) → FitOutput       │   │
│           │  calculateHandlebarHeight(inputs) → FitOutput    │   │
│           │  calculateReach(inputs) → FitOutput              │   │
│           │  mmToZwiftPosition(mm, axis) → ZwiftPosition     │   │
│           └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                       Hardware Constants Layer                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  src/lib/zwiftRideConstants.ts                            │   │
│  │  SADDLE_HEIGHT_RANGE, HANDLEBAR_HEIGHT_RANGE              │   │
│  │  LETTER_TO_MM_TABLE, FORE_AFT_RANGE                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `NavigationShell` | Step indicator, progress bar, "Back/Next" buttons, overall page frame | Reads `activeStep` from store; writes step changes to store |
| `InputSection` | Multi-step form wizard — one section per input category | Reads/writes `inputs` in fitProfileStore; invokes calculation engine on completion |
| `InputForms` | Individual form field groups (geometry, body, fit report, physical measurements) | Managed by React Hook Form + Zod; delegates to `InputSection` on submit |
| `ResultsSection` | Renders all four adjustment outputs (saddle height, saddle fore/aft, handlebar height, handlebar reach) as a step-by-step guide | Reads `calculatedOutputs` from store |
| `ResultCards` | Single adjustment output card — shows target mm, target Zwift letter/position, and tightening instructions | Receives output slice as props from `ResultsSection` |
| `fitProfileStore` | Single Zustand store: all user inputs + derived outputs + active wizard step; persisted to localStorage | Written by InputForms; read by ResultsSection and NavigationShell |
| `calculations.ts` | Pure calculation functions — all bike geometry math, all Zwift Ride position conversions. No React, no side effects. | Called by `fitProfileStore` actions; independently testable |
| `zwiftRideConstants.ts` | Hardware truth table — adjustment ranges, mm-per-letter table, fore/aft limits, crank offset data | Imported by `calculations.ts` only; never imported by UI components |

## Recommended Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui copied components (Input, Button, Card, etc.)
│   ├── navigation/
│   │   └── NavigationShell.tsx  # Step progress bar, prev/next, top-level page shell
│   ├── input/
│   │   ├── InputSection.tsx     # Orchestrates multi-step form, step routing
│   │   ├── GeometryForm.tsx     # Stack, reach, seat tube length
│   │   ├── BodyMeasurementsForm.tsx  # Inseam, torso, arm length
│   │   ├── FitReportForm.tsx    # Saddle height, setback, bar height, reach drop
│   │   └── PhysicalMeasurementsForm.tsx  # Self-measured values from current bike
│   └── results/
│       ├── ResultsSection.tsx   # Renders all output cards, summary header
│       └── ResultCard.tsx       # Single adjustment: label, mm value, Zwift position
├── lib/
│   ├── calculations.ts          # ALL bike geometry math and Zwift position conversions
│   ├── zwiftRideConstants.ts    # Hardware truth table (ranges, letter table, limits)
│   └── validators.ts            # Zod schemas for each form section
├── store/
│   └── fitProfileStore.ts       # Zustand store with persist middleware
├── types/
│   └── fit.ts                   # TypeScript types: FitInputs, FitOutput, ZwiftPosition
├── App.tsx                      # Root — renders NavigationShell + active section
└── main.tsx                     # Vite entry point
```

### Structure Rationale

- **`lib/calculations.ts` is sacred.** All math lives here, nothing else does. This single decision makes the calculation engine testable with Vitest without mounting any React component.
- **`lib/zwiftRideConstants.ts` is separate from calculations.** The hardware table will need to be updated as more Zwift Ride measurement data is confirmed. Keeping it in one file means edits never touch calculation logic.
- **`store/` is a single file.** One Zustand store with `persist` covers all state. This app has no inter-store coordination complexity that would justify splitting.
- **`components/input/` and `components/results/` are separate.** Input and output are independent concerns. Results do not depend on which input form is active — they read from the store.
- **`types/fit.ts` is the contract.** All data shapes flow through here. Changing a type surfaces every broken consumer at compile time.

## Architectural Patterns

### Pattern 1: Calculation Engine as Pure Functions

**What:** All bike geometry math and Zwift Ride position conversions are pure TypeScript functions with no React dependencies, no side effects, and no direct store access.

**When to use:** Always, for this project. The calculation logic is the core product; it must be testable in isolation.

**Trade-offs:** Requires discipline to keep calculations out of components. Worth it — bugs in geometry math are invisible until a test catches them.

**Example:**
```typescript
// src/lib/calculations.ts
import { SADDLE_HEIGHT_RANGE, LETTER_TO_MM_TABLE } from './zwiftRideConstants'
import type { FitInputs, FitOutput } from '../types/fit'

export function calculateSaddleHeight(inputs: FitInputs): FitOutput {
  // Derive target mm from inputs (saddle height from fit report takes priority;
  // fall back to inseam formula: inseam * 0.883)
  const targetMm = inputs.fitReport?.saddleHeight
    ?? Math.round(inputs.body.inseam * 0.883)

  // Clamp to hardware range
  const clampedMm = Math.max(
    SADDLE_HEIGHT_RANGE.minMm,
    Math.min(SADDLE_HEIGHT_RANGE.maxMm, targetMm)
  )

  // Convert mm to nearest Zwift letter position
  const zwiftPosition = mmToZwiftPosition(clampedMm, 'saddleHeight')

  return {
    targetMm: clampedMm,
    zwiftPosition,
    withinRange: clampedMm === targetMm,
    note: clampedMm !== targetMm ? 'Target exceeds Zwift Ride adjustment range' : undefined,
  }
}
```

### Pattern 2: Single Zustand Store with Persist Middleware

**What:** One store holds the entire application state — all form inputs, all calculated outputs, and the current wizard step. `persist` middleware serializes the whole store to `localStorage` automatically.

**When to use:** Any multi-step form with localStorage persistence requirements. Eliminates manual `useEffect` synchronization.

**Trade-offs:** All state in one place can feel monolithic. For this app's scope, splitting stores adds complexity with no benefit.

**Example:**
```typescript
// src/store/fitProfileStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateSaddleHeight, calculateHandlebarHeight, calculateReach, calculateSaddleForeAft } from '../lib/calculations'
import type { FitInputs, FitOutputs } from '../types/fit'

interface FitProfileState {
  inputs: Partial<FitInputs>
  outputs: FitOutputs | null
  activeStep: number
  setInputs: (inputs: Partial<FitInputs>) => void
  runCalculations: () => void
  setActiveStep: (step: number) => void
}

export const useFitProfileStore = create<FitProfileState>()(
  persist(
    (set, get) => ({
      inputs: {},
      outputs: null,
      activeStep: 0,
      setInputs: (inputs) => set((state) => ({ inputs: { ...state.inputs, ...inputs } })),
      runCalculations: () => {
        const { inputs } = get()
        if (!isComplete(inputs)) return
        set({
          outputs: {
            saddleHeight: calculateSaddleHeight(inputs as FitInputs),
            saddleForeAft: calculateSaddleForeAft(inputs as FitInputs),
            handlebarHeight: calculateHandlebarHeight(inputs as FitInputs),
            handlebarReach: calculateReach(inputs as FitInputs),
          }
        })
      },
      setActiveStep: (step) => set({ activeStep: step }),
    }),
    { name: 'zwift-fit-profile' }  // localStorage key
  )
)
```

### Pattern 3: Hardware Constants as a Typed Lookup Table

**What:** Zwift Ride adjustment positions (letter-to-mm mapping, range limits) are encoded as a typed constant object in one file, never hardcoded inline.

**When to use:** Any time the app needs to convert a target mm value to a Zwift position. Centralizing this table means firmware changes or newly measured data require one file edit.

**Trade-offs:** The letter-to-mm table is partially unknown today (see Data Flow section below). Design the table so individual entries can be filled in as data is confirmed, with runtime warnings for any gaps.

**Example:**
```typescript
// src/lib/zwiftRideConstants.ts
export const SADDLE_HEIGHT_RANGE = {
  minMm: 599,   // 59.9 cm — confirmed from geometry specs
  maxMm: 865,   // 86.5 cm — confirmed from geometry specs
}

// IMPORTANT: Letter positions need field measurement to confirm mm values.
// Set to null until confirmed; calculations.ts will surface a LOW_CONFIDENCE flag.
export const SADDLE_HEIGHT_LETTER_TO_MM: Record<string, number | null> = {
  A: null,  // TODO: measure on physical unit
  B: null,
  // ... fill in as data is confirmed
}

export const SADDLE_FORE_AFT_RANGE = {
  totalMm: 35,  // 35mm rail slide — confirmed
}

export const HANDLEBAR_HEIGHT_RANGE = {
  minMm: 863,   // 86.3 cm — confirmed
  maxMm: 1024,  // 102.4 cm — confirmed
}
```

## Data Flow

### Input to Output Flow

```
User enters measurements (any combination of sources)
    │
    ▼
React Hook Form (per-section)
    │  Zod validates ranges and required fields
    ▼
fitProfileStore.setInputs(sectionData)
    │  Merges partial inputs; does NOT calculate yet
    ▼
User reaches final input step → "Calculate" action
    │
    ▼
fitProfileStore.runCalculations()
    │  Calls pure functions from calculations.ts
    │  Passes complete FitInputs object
    ▼
calculations.ts
    │  1. Resolve priority: fit report values > direct physical measurements
    │     > body measurement formulas > bike geometry derivations
    │  2. Apply bike geometry math (stack/reach → effective position)
    │  3. Convert target mm → nearest Zwift letter position
    │     using zwiftRideConstants.ts lookup table
    │  4. Clamp to hardware range; flag out-of-range results
    ▼
FitOutputs { saddleHeight, saddleForeAft, handlebarHeight, handlebarReach }
    │  Each output: { targetMm, zwiftPosition, withinRange, note }
    ▼
fitProfileStore.outputs (persisted to localStorage)
    │
    ▼
ResultsSection reads outputs → renders ResultCards
    │  Each card shows: target mm | Zwift letter/position | adjustment steps
    ▼
User adjusts Zwift Ride physically
```

### Input Priority Resolution

This is the core calculation challenge. Users may provide any combination of input types. The engine must resolve them in priority order:

```
For each fit dimension (saddle height, bar height, reach, fore/aft):

Priority 1: Fit report value (most accurate — from professional fitting)
    ↓ (if missing)
Priority 2: Self-measured physical value from current bike
    ↓ (if missing)
Priority 3: Body measurement formula (inseam × factor, etc.)
    ↓ (if missing)
Priority 4: Bike geometry derivation (stack + reach + stem math)
    ↓ (if all missing)
Priority 5: Cannot calculate — show field as "Enter [measurement] to calculate"
```

### State Management Flow

```
localStorage
    │ (rehydrated on page load by Zustand persist)
    ▼
fitProfileStore
    │
    ├── inputs → InputSection reads for pre-fill on return visits
    ├── outputs → ResultsSection reads for display
    └── activeStep → NavigationShell reads for step indicator

User action → InputForms → setInputs() → store → localStorage (auto-persisted)
User submits final step → runCalculations() → store.outputs → ResultsSection re-renders
```

## Component Build Order

Build in this sequence — each layer depends on the one above it being stable:

**Phase 1 — Foundation (no React required)**
1. `src/types/fit.ts` — define all types first; everything else depends on shapes
2. `src/lib/zwiftRideConstants.ts` — hardware data; changes rarely once set
3. `src/lib/calculations.ts` — pure functions; test with Vitest before wiring to UI
4. `src/lib/validators.ts` — Zod schemas; defines what inputs are valid

**Phase 2 — State Layer**
5. `src/store/fitProfileStore.ts` — wire calculations into store actions; test persistence

**Phase 3 — Input UI**
6. `NavigationShell` — empty shell with step routing
7. Individual form components (GeometryForm, BodyMeasurementsForm, etc.)
8. `InputSection` — orchestrates which form shows per step

**Phase 4 — Output UI**
9. `ResultCard` — single output card; test with mock data
10. `ResultsSection` — assemble cards; wire to store

**Phase 5 — Integration**
11. Wire `App.tsx` — connect shell + sections; verify end-to-end flow
12. Edge case handling — out-of-range results, missing inputs, partial fits

**Rationale:** Building the calculation engine first (Phase 1) and testing it independently prevents a situation where UI work exposes calculation bugs late in development. The store (Phase 2) must be stable before any UI component can be fully tested, since all persistence flows through it.

## Scaling Considerations

This is a frontend-only static app. "Scaling" means browser performance and maintainability, not server load.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| MVP (1-100 daily users) | Current architecture — no changes needed. Vite bundles to ~150KB total. |
| Growth (100-10K daily users) | Static hosting handles this effortlessly. Consider adding PostHog or Plausible analytics to understand which input types are used most. |
| If calculation logic expands | Split calculations.ts by concern (saddleCalcs.ts, handlebarCalcs.ts) — still pure functions, just organized. |
| If multiple bike profiles needed | Add a `profiles: Profile[]` array to fitProfileStore and a profile selector UI. Store structure supports this without a rewrite. |

### Scaling Priority for This Project
There is no meaningful scale concern for a static calculator. The one future risk is calculation complexity growth — keep functions pure and tested from day one to prevent that from becoming a maintenance burden.

## Anti-Patterns

### Anti-Pattern 1: Calculation Logic Inside React Components

**What people do:** Write `const saddleHeight = inseam * 0.883` inside a component's render body or `useEffect`.

**Why it's wrong:** Impossible to unit test without mounting React. Duplication risk when the same formula is needed in multiple components. Silent breakage if a component is refactored.

**Do this instead:** All math lives in `src/lib/calculations.ts`. Components read results from the store, never derive them.

### Anti-Pattern 2: Hardcoding Zwift Ride Hardware Values Inline

**What people do:** Scatter `if (mm > 865) ...` and `const letter = 'G'` throughout calculation functions.

**Why it's wrong:** Zwift Ride hardware data is partially unconfirmed (letter-to-mm mapping needs field measurement). When the table is updated, you need to hunt down every hardcoded value.

**Do this instead:** All hardware constants in `zwiftRideConstants.ts`. Calculations import from there. Update one file when new measurements are confirmed.

### Anti-Pattern 3: Triggering Recalculation on Every Keystroke

**What people do:** Call `runCalculations()` inside a form `onChange` handler.

**Why it's wrong:** Intermediate invalid states (e.g., user has typed "17" of "178") will produce garbage results or validation errors. Creates flicker in the results panel.

**Do this instead:** Run calculations only when a form section is submitted (user clicks "Next" or "Calculate"). React Hook Form's `handleSubmit` is the correct trigger — it fires only on valid, complete data.

### Anti-Pattern 4: Storing Calculated Outputs Outside the Store

**What people do:** Keep `outputs` in local component state (`useState`) and pass them down as props.

**Why it's wrong:** Results must survive page navigation, refresh, and return visits. Component state is ephemeral. Prop-drilling 4 output values through 3 component layers creates coupling.

**Do this instead:** `fitProfileStore` holds both inputs and outputs, both persisted. `ResultsSection` reads directly from the store.

## Integration Points

### External Services

This is a frontend-only app. There are no external service integrations for v1.

| Potential Future Addition | Integration Pattern | Notes |
|--------------------------|---------------------|-------|
| Analytics (Plausible/PostHog) | Script tag or npm package; fire events on calculation runs | Privacy-friendly analytics only — no PII is collected (measurements stay local) |
| Zwift API | Not applicable for v1; Zwift does not expose a public API for bike fit settings | Out of scope |

### Internal Boundaries

| Boundary | Communication | Rule |
|----------|---------------|------|
| UI components ↔ Store | Zustand hooks (`useFitProfileStore`) | Components never import from `calculations.ts` directly |
| Store ↔ Calculations | Direct function calls inside store actions | `runCalculations()` is the only entry point to the calculation engine from store |
| Calculations ↔ Constants | ES module import | `calculations.ts` is the only file that imports `zwiftRideConstants.ts` |
| Form ↔ Store | `setInputs()` action only | Forms never mutate store state directly; always via action |

## Critical Architecture Dependency: Hardware Data Gap

**This is the most important architecture note for the roadmap.**

The Zwift Ride uses a letter-based position system (A through Z+ markings on seat post and stem). The exact millimeter value for each letter position is **not publicly documented** by Zwift. Community forum research confirms this gap — users have asked for a conversion table and Zwift has not published one.

**What is confirmed (HIGH confidence):**
- Saddle height range: 599–865 mm (59.9–86.5 cm)
- Handlebar height range: 863–1024 mm (86.3–102.4 cm)
- Saddle fore/aft: 35 mm rail slide total
- Rider height range: 152–198 cm
- Adjustment system uses letters (A–Z) marked in cm increments on hardware

**What needs field measurement (LOW confidence until confirmed):**
- Exact mm value per letter for saddle height
- Exact mm value per letter for handlebar height
- Exact mm value per letter for handlebar fore/aft reach
- Whether letter spacing is uniform (likely) or variable

**Architecture decision:** Design `zwiftRideConstants.ts` to support nullable entries with a `confidence` flag. The calculation engine should output both the target mm value AND a best-estimate letter position, clearly communicating to the user when position data is confirmed vs. estimated. This means the app is usable before the full table is known, and improves silently as data is filled in.

## Sources

- [Zwift Ride geometry specs — geometrygeeks.bike](https://geometrygeeks.bike/bike/zwift-smart-frame-2025/) — saddle height 599–865 mm, handlebar 863–1024 mm — MEDIUM confidence (third-party aggregator)
- [Zwift community forum — adjustment measurements](https://forums.zwift.com/t/zwift-ride-measurements-e/635899) — confirms letter system exists, official table not published — HIGH confidence (primary source)
- [Mountain Massif Zwift Ride review](https://www.mountainmassif.com/reviews/technical-hardware/a-detailed-look-at-the-zwift-ride/) — 35 mm saddle rail slide, letter system description — MEDIUM confidence (third-party review)
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — localStorage persistence pattern — HIGH confidence
- [React Hook Form + Zustand multi-step pattern](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps) — wizard architecture — MEDIUM confidence
- Bike fitting formulas (inseam × 0.883 for saddle height) — [BikeDynamics saddle height calculator](https://bikedynamics.co.uk/saddleheightformulae.htm) — MEDIUM confidence (industry standard but multiple methodologies exist)

---
*Architecture research for: Zwift Ride Fitting Assistant — frontend-only bike fitting calculator*
*Researched: 2026-03-21*
