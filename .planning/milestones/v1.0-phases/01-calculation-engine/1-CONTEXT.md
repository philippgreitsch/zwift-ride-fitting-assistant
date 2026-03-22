# Phase 1: Calculation Engine - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the calculation logic for all four Zwift Ride adjustment axes as pure TypeScript functions. Encode the hardware constants (adjustment ranges, letter→mm lookup tables). Implement crank length correction, priority resolver for mixed input sources, and out-of-range handling. Covered by unit tests (Vitest). No UI — this is the engine that Phase 2 and 3 will call.

Requirements in scope: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06

</domain>

<decisions>
## Implementation Decisions

### Hardware constants — letter→mm mapping

- **D-01:** Research first before writing calculation code — check official Zwift/Wahoo geometry PDF and community sources (DC Rainmaker, Zwift forums, Reddit)
- **D-02:** If exact mapping can't be sourced: use best available community estimate, mark constants as `// UNVERIFIED — measure on physical hardware` in the source code
- **D-03:** All 4 adjustment axes use the letter system (A–Z) — no axes use raw mm or numbered positions
- **D-04:** Known hardware ranges to encode: saddle height 599–865mm, handlebar height 863–1024mm. Saddle fore/aft and handlebar reach ranges need confirmation from research.

### Input priority logic

- **D-05:** Fit report values always win — professional fit values override direct measurements and derivations for the same axis
- **D-06:** Priority order (high → low): fit report > direct physical measurement > frame geometry derivation > body measurement estimation
- **D-07:** Partial fit reports are fine — if fit report covers only 2 of 4 axes, use fit report for those and fall through to next priority for the rest
- **D-08:** Engine must tag each output value with its source (e.g., `source: "fit-report" | "measured" | "derived" | "estimated"`) so the output layer can show which axes came from the fit report vs self-measured

### Out-of-range handling

- **D-09:** When a calculated target exceeds Zwift Ride limits: return both the ideal target AND the clamped achievable position, plus a warning flag
- **D-10:** Output shape for an out-of-range axis: `{ ideal_mm, achievable_mm, letter_position, out_of_range: true, direction: "above" | "below" }`
- **D-11:** If ALL 4 axes are out of range simultaneously: engine returns an error state, not partial results. Output layer will display a clear error explaining the Zwift Ride can't match this position at all.

### Missing inputs

- **D-12:** If a user provides no measurements for a given axis: estimate from body measurements if available (inseam, torso, arm length). Output for estimated values is tagged `source: "estimated"`.
- **D-13:** If no body measurements are available either: return `null` for that axis — output layer skips it entirely
- **D-14:** Default crank length when user doesn't enter one: **172.5mm** (most common road bike crank). Saddle height correction = (user_crank_mm - 170) applied directly to saddle height target.

### Claude's Discretion

- Exact TypeScript types and interface shapes (beyond the shape defined in D-10)
- Specific math formulas for body measurement estimations (inseam, Hamley formula, etc.)
- Test case selection and edge case coverage
- File structure within `src/lib/`

</decisions>

<specifics>
## Specific Ideas

- The `source` tag on each output value is important — the output UI in Phase 3 needs to be able to say "This came from your fit report" vs "This is estimated from your body measurements"
- The letter position output should always accompany the mm value — users switching between measuring and using the letter notches need both
- Constants file should have inline comments citing where each value came from (e.g., `// Source: Wahoo geometry PDF` or `// Source: community estimate — needs verification`)

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, what "done" looks like
- `.planning/REQUIREMENTS.md` — CALC-01 through CALC-06 acceptance criteria

### Research findings
- `.planning/research/SUMMARY.md` — Key findings including known Zwift Ride hardware ranges and data gaps
- `.planning/research/FEATURES.md` — Zwift Ride hardware specs section, known ranges, letter system behavior
- `.planning/research/PITFALLS.md` — Critical: crank length correction, drop bar vs flat bar distinction, saddle height reference point definitions, seat tube angle for setback

No external spec documents exist yet — the canonical source for Zwift Ride hardware data is the Wahoo geometry PDF (requires research agent to locate and extract values).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the patterns

### Integration Points
- Phase 2 will import calculation functions from `src/lib/calculations.ts`
- Phase 2 will import hardware constants from `src/lib/zwiftRideConstants.ts`
- Zustand store (Phase 2) will call calculation functions reactively on input change

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-calculation-engine*
*Context gathered: 2026-03-21*
