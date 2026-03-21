# Phase 2: Project Scaffold and Input UI - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the Vite/React app and build all measurement input forms. Users can navigate a multi-step wizard, enter measurements across all four input modes (physical, body, frame, fit report), and see data ready for calculation. No output guide — that is Phase 3. Zustand store wires inputs to the calculation engine but results are not yet displayed.

Requirements in scope: PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05, PHYS-06, PHYS-07, FRAME-01, FRAME-02, FRAME-03, BODY-01, BODY-02, BODY-03, BODY-04, FIT-01, FIT-02, UX-01, UX-03

</domain>

<decisions>
## Implementation Decisions

### Wizard structure and navigation

- **D-01:** Non-linear 4-step wizard — progress indicator at top, all steps tappable so user can jump freely. No blocking navigation.
- **D-02:** Step order: Physical Measurements → Body Measurements → Frame Geometry → Fit Report. Starts with most familiar (bike + tape measure), ends with most authoritative.
- **D-03:** Physical Measurements section is "start here" — the primary section. Body, Frame, and Fit Report sections are labeled "Optional — fills in gaps".
- **D-04:** No required fields. The engine handles null gracefully (D-13 from Phase 1). Unanswered sections show a neutral "no data" state, not a validation error.
- **D-05:** Each section header includes a one-liner: *"Fill in what you have. Anything left blank will be estimated or skipped."*
- **D-06:** "Next" / "Back" buttons for linear flow; step indicators at top are always tappable for jumping.

### Skill level mode

- **D-07:** Skill level selector shown once at wizard start — two options: "I'm new to bike fitting" and "I know my measurements".
- **D-08:** Beginner mode — measurement guidance auto-expanded for the first field in each section; remaining fields show a visible "How to measure ▾" collapsed prompt.
- **D-09:** Pro mode — all guidance collapsed by default; small ⓘ icon on each label, tap to reveal.
- **D-10:** Skill level is stored in Zustand and persists across sessions (same as measurement data).

### Measurement guidance (UX-01)

- **D-11:** Guidance is tap-to-expand inline text, not a tooltip — better on mobile, allows longer text without overflow.
- **D-12:** "Complex" fields (saddle height, saddle setback, handlebar reach) get fuller descriptions with explicit reference point callouts (e.g., "measure from center of BB axle to top of saddle, not the rails").
- **D-13:** "Simple" fields (crank length, inseam, frame stack) get a short one-liner.
- **D-14:** Crank length field always shows "(optional — defaults to 172.5mm)" inline regardless of skill mode.

### Input priority visibility (FIT-02)

- **D-15:** Fit Report section displays a persistent banner: *"Values here override your physical measurements for the same axis."*
- **D-16:** When a user has filled in both a physical measurement and a fit report value for the same axis, the physical field shows a subtle inline note: *"Overridden by your fit report"* (grayed out, not an error state).

### Calculation trigger and results handoff

- **D-17:** Results are a dedicated final wizard step — not inline on the input form.
- **D-18:** Explicit CTA at the end of the wizard: **"Set up my Zwift Ride →"** — action-oriented, names the outcome.
- **D-19:** Partial data is allowed — user can trigger the results step even with only 1–2 sections filled. The engine returns null for axes with no data (Phase 1 D-13); the output layer handles this in Phase 3.
- **D-20:** In Phase 2, the results step is a placeholder ("Your settings are ready — output coming in Phase 3") — full output guide is out of scope here.

### Handlebar type selector (PHYS-07)

- **D-21:** Handlebar type (drop / flat bar) lives in the Physical Measurements section as the first field — it gates how other fields are labeled (e.g., "hood height" vs "bar height" for handlebar height input).
- **D-22:** Selecting "drop bar" reveals the drop-specific offset fields (dropBarHoodHeightOffset, dropBarHoodReachOffset) with sensible defaults shown (40mm / 50mm) and optional override.

### Claude's Discretion

- Exact shadcn/ui component choices per field (Input, Select, etc.)
- Specific wording of measurement guidance text for each field
- Step indicator visual design
- Exact Tailwind spacing and typography
- Zustand store shape and slice organization
- Form validation timing (blur vs submit)

</decisions>

<specifics>
## Specific Ideas

- The skill level selector is the very first thing users see — sets the tone for the whole experience
- "Set up my Zwift Ride →" is the primary CTA button at the end of the wizard
- Drop bar users should see field labels that match their context ("hood height" not "bar height") — the handlebar type selector at the top of Physical section enables this
- The override note ("Overridden by your fit report") on physical fields should be subtle — grayed label, not red error — it's informational, not a problem

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase boundary and requirements
- `.planning/REQUIREMENTS.md` — PHYS-01 through PHYS-07, FRAME-01 through FRAME-03, BODY-01 through BODY-04, FIT-01, FIT-02, UX-01, UX-03 acceptance criteria

### Calculation engine contracts (Phase 1 output)
- `src/types/fit.ts` — Complete `FitInputs`, `FitOutputs`, `AxisOutput` type contracts — all form fields map directly to fields in this type
- `src/lib/calculations.ts` — `calculateFitOutputs()` orchestrator; Zustand store calls this function with `FitInputs`
- `src/lib/zwiftRideConstants.ts` — Hardware constants including default crank length (172.5mm) and drop bar offsets (40mm / 50mm)

### Phase 1 decisions
- `.planning/phases/01-calculation-engine/1-CONTEXT.md` — D-12 through D-14: null handling, body measurement fallback, default crank length

### Stack
- `CLAUDE.md` — Full technology stack decisions (React 19, Tailwind v4, React Hook Form + Zod, Zustand, shadcn/ui)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/fit.ts` — `FitInputs` is the exact shape the Zustand store must hold. Every wizard field maps 1:1 to a field in this type. Do not invent new field names.
- `src/lib/calculations.ts` — `calculateFitOutputs(inputs: FitInputs): FitOutputs` — call this from Zustand store when inputs change
- `src/lib/zwiftRideConstants.ts` — `DEFAULT_CRANK_LENGTH_MM` (172.5) and `DEFAULT_DROP_BAR_HOOD_*_OFFSET_MM` are the defaults to show in placeholder/helper text

### Established Patterns
- All calculation logic stays in `src/lib/` — no formulas inside React components
- Vite + React project is already scaffolded (Phase 1 Plan 01-01 created the project structure)

### Integration Points
- Zustand store holds `FitInputs` — wizard forms write to it, `calculateFitOutputs` reads from it
- Results step (Phase 2 placeholder, Phase 3 full output) reads `FitOutputs` from the store

</code_context>

<deferred>
## Deferred Ideas

- Full output/results guide — Phase 3
- localStorage persistence (UX-02) and reset (UX-04) — Phase 3
- Multiple bike profiles (PROF-01 through PROF-03) — v2 backlog
- Shareable URL with encoded measurements (SHARE-02) — v2 backlog

</deferred>

---

*Phase: 02-project-scaffold-input-ui*
*Context gathered: 2026-03-21*
