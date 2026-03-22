# Phase 3: Output, Persistence, and Deploy — Research

**Researched:** 2026-03-21
**Domain:** React output rendering, Zustand persist middleware, Vercel deployment
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OUT-01 | Output shows the target mm value for each of the 4 Zwift Ride adjustment axes | `FitOutputs` type already carries `ideal_mm` and `achievable_mm` on each `AxisOutput`; display in ResultsStep |
| OUT-02 | Output shows the corresponding Zwift Ride letter position for each axis | `AxisOutput.letter_position` (string or null); null path needs graceful display ("Awaiting hardware data") |
| OUT-03 | Output shows an out-of-range warning when a target falls outside adjustment limits | `AxisOutput.out_of_range`, `direction`, `achievable_mm` vs `ideal_mm`; name the specific axis |
| OUT-04 | Output presented as a step-by-step adjustment guide (saddle height → saddle fore/aft → bar height → bar reach) | Four ordered cards/sections in ResultsStep; hardcoded display order |
| OUT-05 | Each output step includes a brief explanation of how to make the adjustment on the Zwift Ride | Static instruction strings per axis — no calculation needed; authored once, displayed always |
| UX-02 | All entered measurements saved to browser localStorage and restored on next visit | Zustand `persist` middleware wrapping `useFitStore`; `name: 'zwift-fit-profile'` |
| UX-04 | User can clear/reset all saved measurements and start fresh with a single action | `useBoundStore.persist.clearStorage()` + store state reset; single "Start over" button in UI |

</phase_requirements>

---

## Summary

Phase 3 completes three independent work streams: (1) replace the `ResultsStep` placeholder with a real four-step adjustment guide wired to the calculation engine; (2) add Zustand `persist` middleware to the existing store so inputs survive browser sessions; (3) deploy the finished app to Vercel.

All three streams connect to work already done. The calculation engine (`calculateFitOutputs`) is complete and tested. The store exists without persistence — wrapping it in `persist` is an additive change with no API surface change to consumers. The Vite build already produces a static bundle that Vercel auto-detects and deploys with zero configuration.

The primary complexity in this phase is the output rendering: the `AxisOutput` type has several states (null axis, in-range with letter, in-range without letter, out-of-range) that the UI must handle gracefully. The lookup tables are still empty (`UNVERIFIED`), meaning `letter_position` will be `null` for all axes — the output must display meaningfully in that state and show mm targets with an honest "letter position unconfirmed" note.

**Primary recommendation:** Build ResultsStep as a pure presentational component reading `useFitStore().inputs`, calling `calculateFitOutputs(inputs)` inline (no memoization needed at this scale), and rendering four `AxisCard` sub-components. Add `persist` to the store in a single additive edit. Deploy via Vercel's GitHub integration.

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0.12 | State + localStorage persistence | Already in store; `persist` is a first-party middleware — `import { persist, createJSONStorage } from 'zustand/middleware'` |
| React | 19.2.x | Output rendering | Existing stack |
| Tailwind CSS | 4.x | Styling | Existing stack |
| shadcn/ui | CLI-based | Card, Badge, Alert components for output layout | Existing stack; `Card`, `Badge` already installed |

### New shadcn/ui components to add

| Component | Purpose | When to Add |
|-----------|---------|-------------|
| `Alert` (shadcn/ui) | Out-of-range warning block — semantically correct, styled with destructive variant | Plan that builds out-of-range warning display |
| `Separator` | Visual divider between the four axis steps in the guide | Already installed per `src/components/ui/separator.tsx` |

**Installation for Alert (only new component needed):**
```bash
npx shadcn@latest add alert
```

### Vercel Deployment

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Vercel CLI (optional) | latest | Local preview + manual deploy | `npm i -g vercel` — only needed if not using GitHub integration |
| Vercel GitHub integration | N/A | CI/CD on push | Zero-config; auto-detects Vite; recommended path |

No `vercel.json` file is required for a standard Vite SPA. Vercel reads `package.json` scripts and detects `vite build` automatically.

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── components/
│   └── wizard/
│       └── steps/
│           ├── ResultsStep.tsx          # REPLACE placeholder — wires store → calculateFitOutputs → AxisCard list
│           └── results/
│               ├── AxisCard.tsx         # Single axis output card (mm + letter + status)
│               └── OutOfRangeAlert.tsx  # Destructive alert for out-of-range axes
├── store/
│   └── fitStore.ts                      # ADD persist middleware — additive change only
└── lib/
    └── calculations.ts                  # UNCHANGED — engine is complete
```

### Pattern 1: Persist Middleware on Existing Store

**What:** Wrap the existing `useFitStore` `create()` call with `persist()`. The store's action functions are excluded via `partialize` so only serializable data goes to localStorage.

**When to use:** Exactly once — in `fitStore.ts`. No changes to any component that already calls `useFitStore`.

**Example:**
```typescript
// Source: Zustand docs — zustand.docs.pmnd.rs/reference/integrations/persisting-store-data
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FitInputs } from '../types/fit'

// partialize: store only serializable data — exclude action functions
export const useFitStore = create<FitStore>()(
  persist(
    (set) => ({
      inputs: {},
      skillLevel: null,
      currentStep: 0,
      // ...actions unchanged
    }),
    {
      name: 'zwift-fit-profile',           // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inputs: state.inputs,
        skillLevel: state.skillLevel,
        // currentStep intentionally excluded — always start at step 0 on reload
      }),
    }
  )
)
```

**Key decision:** `currentStep` should NOT be persisted. On reload, the user should see the wizard from step 1 (or the skill selector), not be dropped into the middle of step 3 from a previous session. The `inputs` and `skillLevel` are what need to survive.

### Pattern 2: Calculation in ResultsStep

**What:** Call `calculateFitOutputs(inputs)` directly in `ResultsStep` — no separate hook, no memoization. The function is pure and fast; performance is not a concern for this data volume.

**When to use:** In `ResultsStep.tsx` only. No other component should call `calculateFitOutputs` directly.

**Example:**
```typescript
// Source: existing src/lib/calculations.ts exports
import { useFitStore } from '@/store/fitStore'
import { calculateFitOutputs } from '@/lib/calculations'

export function ResultsStep() {
  const inputs = useFitStore((s) => s.inputs)
  const outputs = calculateFitOutputs(inputs)
  // outputs.saddleHeight, .saddleForeAft, .handlebarHeight, .handlebarReach
  // Each is AxisOutput | null
  return (...)
}
```

### Pattern 3: AxisCard Component States

Each `AxisCard` must handle four distinct states driven by the `AxisOutput` type:

| State | Condition | Display |
|-------|-----------|---------|
| No data | `axis === null` | Greyed card: "No data entered for this axis" |
| In range, letter known | `!out_of_range && letter_position !== null` | Letter in large text + mm value + instruction |
| In range, letter unknown | `!out_of_range && letter_position === null` | mm value + "Letter position unconfirmed — lookup table not yet populated" note |
| Out of range | `out_of_range === true` | `OutOfRangeAlert` naming the axis + direction + achievable_mm as fallback |

**Axis display order** (OUT-04 locked): saddle height → saddle fore/aft → bar height → bar reach.

### Pattern 4: Reset (UX-04)

**What:** Single "Start over" action that (a) clears localStorage and (b) resets store to initial state, (c) navigates to step 0.

**Example:**
```typescript
// Source: Zustand docs — zustand.docs.pmnd.rs/guides/how-to-reset-state
// useBoundStore.persist.clearStorage() wipes the localStorage key
// A resetStore action in the store resets in-memory state

// In fitStore.ts — add a resetStore action:
resetStore: () => {
  useFitStore.persist.clearStorage()
  set({ inputs: {}, skillLevel: null, currentStep: 0 })
}
```

Expose this as a button in the Results step: "Start over" (ghost/secondary variant, bottom of results).

### Anti-Patterns to Avoid

- **Calling `calculateFitOutputs` in multiple components:** Keep it in `ResultsStep` only. Duplicating the call elsewhere creates divergence risk.
- **Persisting `currentStep` to localStorage:** Users expect to start at the beginning, not resume mid-wizard on a new session.
- **Persisting action functions:** `partialize` must exclude all `(set) =>` action functions — they are not serializable and will error if you try to JSON-encode them.
- **Deriving letter position from range arithmetic:** The lookup tables are intentionally empty until physically measured. Do not fill them with `(max - min) / N` estimates. Display null state instead.
- **Blocking the results step when `letter_position` is null:** The mm target is still useful to users. Null letter position is a data gap, not an error — show what you have.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage read/write | `useEffect` + `JSON.stringify/parse` per field | Zustand `persist` middleware | Handles hydration timing, serialization, partial state, and the `clearStorage` API in ~10 lines |
| State reset | Manual `set({})` calls at each component | `persist.clearStorage()` + one `resetStore` action | Guarantees both in-memory and storage are cleared atomically |
| Out-of-range UI | Custom inline warning markup | shadcn/ui `Alert` with `variant="destructive"` | Accessible, styled correctly, consistent with existing shadcn/ui component patterns |

**Key insight:** Every pattern in this phase has a first-party solution in the already-installed stack. The work is wiring, not building.

---

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on First Render

**What goes wrong:** The Zustand `persist` middleware hydrates from localStorage asynchronously in some configurations. If a component reads the store before hydration completes, it sees the initial empty state, then snaps to the persisted state — causing a visible flicker or incorrect "no data" display.

**Why it happens:** `localStorage` is synchronous, but Zustand's `persist` middleware can delay hydration if not configured explicitly. In the Zustand v5 docs, `localStorage` is noted as synchronous — hydration completes at store creation. This means flicker is not expected for this project, but it's worth verifying after implementation.

**How to avoid:** Use `createJSONStorage(() => localStorage)` explicitly (not the default). Test by entering data, refreshing, and verifying values appear immediately without a flash of empty fields. If flicker occurs, add `onRehydrateStorage` callback to track hydration state.

**Warning signs:** Input fields briefly show placeholder text on page load despite previously entered values.

### Pitfall 2: Persisting Non-Serializable State

**What goes wrong:** If `partialize` is omitted, Zustand attempts to serialize the entire store — including action functions. `JSON.stringify` cannot encode functions and will either silently drop them or throw.

**Why it happens:** Missing `partialize` option.

**How to avoid:** Always include `partialize: (state) => ({ inputs: state.inputs, skillLevel: state.skillLevel })`. Verify with a quick `JSON.parse(localStorage.getItem('zwift-fit-profile'))` in the browser console after filling in one field.

### Pitfall 3: ResultsStep Mounted Before Inputs Are Ready

**What goes wrong:** User navigates directly to the results step (step 5) via the step indicator before entering any data. `calculateFitOutputs({})` returns all-null axes. This is valid behavior — the engine handles it gracefully (D-13) — but the UI needs to render a clear "enter measurements first" prompt rather than showing four empty "No data" cards.

**Why it happens:** The step indicator allows free navigation (D-06 from Phase 2 decisions).

**How to avoid:** In `ResultsStep`, check if `outputs` has any non-null axis before rendering the guide. If all axes are null, render a prompt: "Enter measurements in the steps above to see your Zwift Ride settings."

### Pitfall 4: `currentStep` Persisted to localStorage

**What goes wrong:** User leaves mid-wizard at step 3. On next visit, they land at step 3 with no context of what they were doing.

**Why it happens:** Including `currentStep` in `partialize`.

**How to avoid:** Exclude `currentStep` from `partialize` explicitly. It is intentionally absent from the example in Pattern 1 above.

### Pitfall 5: Vercel SPA 404 on Hard Refresh

**What goes wrong:** After deploy, navigating to any client-side path (not applicable here — single-page, no router) or hard-refreshing a non-root path returns a Vercel 404.

**Why it happens:** Vercel serves the static build; without a rewrite rule, unknown paths 404.

**How to avoid:** This project has no client-side router (no React Router, no URL-based navigation). All state is in Zustand. There are no routes to 404. This pitfall is not applicable but is documented for awareness if routing is added in v2.

### Pitfall 6: `letter_position` null Displayed as Broken UI

**What goes wrong:** The lookup tables are empty in the current codebase (`UNVERIFIED`). Every axis will return `letter_position: null`. If the UI treats null as an error and shows a broken or alarming state, it undermines trust in the mm output, which is still correct.

**Why it happens:** UI treats null as an error rather than a data-gap notice.

**How to avoid:** Display null as an informational note: "Letter position not yet confirmed — use the mm measurement above until the hardware table is populated." The mm target is the primary value; the letter is a convenience mapping.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### Zustand persist — complete fitStore.ts shape
```typescript
// Source: Zustand docs (zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  resetStore: () => void
}

const initialState = {
  inputs: {} as FitInputs,
  skillLevel: null as SkillLevel | null,
  currentStep: 0,
}

export const useFitStore = create<FitStore>()(
  persist(
    (set) => ({
      ...initialState,
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
      resetStore: () => {
        useFitStore.persist.clearStorage()
        set(initialState)
      },
    }),
    {
      name: 'zwift-fit-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inputs: state.inputs,
        skillLevel: state.skillLevel,
        // currentStep intentionally excluded — start fresh on reload
      }),
    }
  )
)

export type { SkillLevel }
```

### AxisCard skeleton
```typescript
// Source: existing AxisOutput type (src/types/fit.ts)
import type { AxisOutput } from '@/types/fit'

interface AxisCardProps {
  label: string           // "Saddle Height", "Saddle Fore/Aft", etc.
  axis: AxisOutput | null
  instruction: string     // How to physically make this adjustment on the Zwift Ride
}

export function AxisCard({ label, axis, instruction }: AxisCardProps) {
  if (axis === null) {
    return <Card>/* No data entered for {label} */</Card>
  }
  if (axis.out_of_range) {
    return (
      <Card>
        <OutOfRangeAlert axis={label} direction={axis.direction!} achievable_mm={axis.achievable_mm} ideal_mm={axis.ideal_mm} />
      </Card>
    )
  }
  return (
    <Card>
      {/* Primary: letter position (large) or null notice */}
      {axis.letter_position
        ? <span className="text-4xl font-bold">{axis.letter_position}</span>
        : <span className="text-sm text-zinc-500">Letter position unconfirmed</span>
      }
      {/* Secondary: mm value */}
      <span>{axis.achievable_mm} mm</span>
      {/* Source badge: fit-report / measured / estimated */}
      <Badge>{axis.source}</Badge>
      {/* Instruction text */}
      <p>{instruction}</p>
    </Card>
  )
}
```

### ResultsStep wiring
```typescript
// Source: existing calculateFitOutputs (src/lib/calculations.ts) + useFitStore
import { useFitStore } from '@/store/fitStore'
import { calculateFitOutputs } from '@/lib/calculations'
import { AxisCard } from './results/AxisCard'

const AXIS_INSTRUCTIONS = {
  saddleHeight: 'Turn the saddle height dial on the right side of the frame. Each click moves the saddle up or down one position.',
  saddleForeAft: 'Use the 4mm hex key to loosen the saddle clamp bolt. Slide the saddle to the target position, then re-tighten.',
  handlebarHeight: 'Turn the handlebar height dial on the left side of the frame. Each click moves the bar up or down one position.',
  handlebarReach: 'Use the 4mm hex key to loosen the bar clamp. Slide the bar forward or back to the target position, then re-tighten.',
}

export function ResultsStep() {
  const inputs = useFitStore((s) => s.inputs)
  const resetStore = useFitStore((s) => s.resetStore)
  const outputs = calculateFitOutputs(inputs)

  const hasAnyData = [outputs.saddleHeight, outputs.saddleForeAft, outputs.handlebarHeight, outputs.handlebarReach]
    .some((axis) => axis !== null)

  if (!hasAnyData) {
    return <Card>/* Enter measurements first prompt */</Card>
  }

  return (
    <div className="flex flex-col gap-4">
      <AxisCard label="Saddle Height" axis={outputs.saddleHeight} instruction={AXIS_INSTRUCTIONS.saddleHeight} />
      <AxisCard label="Saddle Fore/Aft" axis={outputs.saddleForeAft} instruction={AXIS_INSTRUCTIONS.saddleForeAft} />
      <AxisCard label="Bar Height" axis={outputs.handlebarHeight} instruction={AXIS_INSTRUCTIONS.handlebarHeight} />
      <AxisCard label="Bar Reach" axis={outputs.handlebarReach} instruction={AXIS_INSTRUCTIONS.handlebarReach} />
      <Button variant="ghost" onClick={resetStore}>Start over</Button>
    </div>
  )
}
```

### Vercel deploy — no config needed
```bash
# One-time: connect GitHub repo to Vercel via vercel.com dashboard
# Vercel auto-detects Vite, sets build command to `npm run build`, output dir to `dist`
# Every push to main deploys automatically

# Optional local preview:
npx vercel --prod
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `useEffect` + `localStorage.setItem` per field | Zustand `persist` middleware | Zustand v4+ (2022) | Eliminates 30+ lines of boilerplate for a 10-field store |
| Zustand persist v4 (async hydration quirks) | Zustand v5 persist (fixed hydration consistency, v5.0.10 Jan 2026) | Jan 2026 | Hydration is reliable with localStorage; no need for `hasHydrated` guard for synchronous storage |
| Vercel manual config (`vercel.json` with build overrides) | Zero-config Vite detection | 2023 | No `vercel.json` needed for standard Vite+React SPA |

**Deprecated/outdated:**
- Direct `localStorage.getItem/setItem` in `useEffect`: replaced by `persist` middleware — do not use for full-store persistence.
- Zustand `persist` with `getStorage` option (v3 API): replaced by `storage: createJSONStorage(() => localStorage)` in v4/v5.

---

## Open Questions

1. **Zwift Ride letter-to-mm lookup tables remain empty**
   - What we know: All four `*_LETTER_TO_MM` records in `zwiftRideConstants.ts` have no entries. `mmToLetter()` returns `null` for all axes. This is a confirmed data gap from Phase 1, still unresolved.
   - What's unclear: Whether the tables will be populated before Phase 3 ships, or whether Phase 3 ships with the graceful null display.
   - Recommendation: Build the null display path properly so the app is useful with mm targets alone. When tables are eventually populated (hardware measurement), the output auto-upgrades to show letter positions with no UI changes.

2. **Instruction text for adjustment steps (OUT-05)**
   - What we know: The RESEARCH.md placeholder text in Code Examples above is a reasonable starting point. Physical adjustment instructions need to match actual Zwift Ride hardware controls.
   - What's unclear: Exact control names (e.g., is it a dial, a lever, a hex bolt?), which side of the frame each control is on.
   - Recommendation: If user has access to the Zwift Ride, author the four instruction strings from direct observation. If not, use community review sources (DC Rainmaker, Cycling Weekly) to confirm control types. This is content, not code — a single string per axis.

3. **shadcn/ui `Alert` component availability in base-nova style**
   - What we know: shadcn/ui migrated to base-nova (Base UI) style in 2026. The `Alert` component exists in the shadcn/ui registry.
   - What's unclear: Whether `Alert` with `variant="destructive"` renders correctly under base-nova Tailwind v4 theming.
   - Recommendation: Run `npx shadcn@latest add alert` and verify visual output. If styling is off, use a manual `div` with `bg-red-50 border-red-200 text-red-800` Tailwind classes as fallback — this is well within Tailwind v4 capabilities.

---

## Sources

### Primary (HIGH confidence)
- Zustand npm — verified v5.0.12 current — [https://www.npmjs.com/package/zustand](https://www.npmjs.com/package/zustand)
- Zustand persist middleware docs — `persist`, `createJSONStorage`, `partialize`, `clearStorage` API — [https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)
- Zustand reset state guide — `resetStore` pattern — [https://zustand.docs.pmnd.rs/guides/how-to-reset-state](https://zustand.docs.pmnd.rs/guides/how-to-reset-state)
- Vercel Vite deployment docs — zero-config auto-detection confirmed — [https://vercel.com/docs/frameworks/frontend/vite](https://vercel.com/docs/frameworks/frontend/vite)
- Existing codebase — `src/types/fit.ts`, `src/lib/calculations.ts`, `src/store/fitStore.ts`, `src/components/wizard/WizardShell.tsx` — confirmed Phase 2 output state

### Secondary (MEDIUM confidence)
- Zustand persist v5.0.10 fix (Jan 2026) — hydration consistency improvement — cited in WebSearch results
- shadcn/ui `Alert` component — registry existence confirmed; base-nova rendering unverified until `npx shadcn@latest add alert` is run

### Tertiary (LOW confidence)
- Zwift Ride physical adjustment instruction text (OUT-05) — based on community review sources; should be verified against hardware or official documentation before shipping

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, APIs verified from official docs
- Architecture: HIGH — patterns are direct applications of existing codebase contracts and official library APIs
- Output rendering: HIGH — `AxisOutput` type fully specifies all states; rendering is deterministic
- Pitfalls: HIGH — derived from actual codebase decisions (confirmed empty lookup tables, persist partialize requirement)
- Instruction text (OUT-05): LOW — content authoring depends on hardware access

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable libraries; only risk is shadcn/ui base-nova Alert styling which can be verified in minutes)
