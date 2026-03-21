# Project Research Summary

**Project:** Zwift Ride Fitting Assistant
**Domain:** Frontend-only bike fitting calculator — fit transfer from real bike to Zwift Ride smart bike
**Researched:** 2026-03-21
**Confidence:** MEDIUM (stack HIGH, architecture HIGH, features/pitfalls MEDIUM due to unresolved hardware data gap)

## Executive Summary

The Zwift Ride Fitting Assistant is a single-page, frontend-only calculator that helps cyclists translate their professional bike fit measurements into the correct physical adjustment positions on the Zwift Ride smart trainer. This is a pure client-side app with no backend: form inputs, calculation logic, and persistence all live in the browser. The recommended build approach is React 19 + TypeScript + Vite with React Hook Form, Zod validation, and Zustand persist middleware — a well-matched stack for a form-heavy, localStorage-persisted single-page tool. The architecture enforces a strict separation between the UI layer (React components), the state layer (Zustand store), and the calculation engine (pure TypeScript functions) — enabling independent testing of the core math.

The single most important risk in this project is not a technical one: the Zwift Ride uses a letter-based position marking system (A, B, C...) whose exact millimeter values per letter have not been officially published by Zwift. Every output the app produces depends on this lookup table. Building the conversion table from assumptions or by dividing total range by estimated position count will silently produce wrong outputs for all users. This data gap must be resolved — via physical measurement on real hardware or retrieval of the official Zwift geometry PDF — before the calculation engine can be written. Until it is resolved, the app can be scaffolded but not correctly implemented.

Several additional fit-transfer pitfalls are non-obvious and have HIGH recovery cost if missed: the Zwift Ride ships with 170 mm cranks (road bikes commonly use 172.5–175 mm, requiring saddle height correction), the Zwift Ride uses flat bars while road bikes use drop bars (making direct reach/height transfer incorrect), and seat tube angle differences affect saddle setback transfer. These are not polish concerns — they must be encoded in Phase 1 before any user testing, or outputs will be systematically wrong and erode trust in the tool.

## Key Findings

### Recommended Stack

The stack is purpose-built for a form-heavy frontend calculator with no server needs. Vite 8 + React 19 + TypeScript 5.9 is the scaffold. React Hook Form 7 handles multi-field form state without re-rendering on every keystroke (critical for a 10+ input form on mobile). Zod v4 validates measurement ranges. Zustand 5 with the persist middleware covers the full fit profile across sessions with a single store and zero boilerplate. shadcn/ui provides accessible form components (Input, Label, Button, Card) via source-copy model — no locked dependency. This stack has verified version compatibility throughout.

**Core technologies:**
- React 19 + TypeScript 5.9: UI framework with type safety — catches silent unit conversion bugs and shape mismatches in localStorage
- Vite 8: Build tool and dev server — zero-config, sub-300ms startup, auto-detected by Vercel
- Tailwind CSS v4: Styling — CSS-native config, pairs with shadcn/ui out of the box
- React Hook Form 7 + Zod v4: Form state and validation — uncontrolled components eliminate keystroke re-renders; Zod v4 is 14x faster than v3
- Zustand 5 (persist): State and localStorage — single store serializes the entire fit profile automatically
- shadcn/ui: Accessible UI components — source is copied into repo, not a locked dependency

**What NOT to use:** Next.js (dead weight for a client-only calculator), Redux Toolkit (overkill, 40KB+), Formik (9 dependencies, re-renders on every keystroke), Create React App (deprecated).

### Expected Features

The feature set is tightly scoped around fit transfer for the four Zwift Ride adjustment axes: saddle height, saddle fore/aft, handlebar height, and handlebar reach. A direct competitor (zwift-fit-tool.replit.app) exists and must be manually reviewed before build to identify gaps worth filling.

**Must have (table stakes):**
- Direct mm input for all four dimensions (saddle height, saddle setback, handlebar height, handlebar reach)
- Zwift Ride position output (letter + equivalent mm) for each axis
- Step-by-step adjustment guide as a checklist — actionable, not just numbers
- Out-of-range warnings when target exceeds Zwift Ride physical limits
- localStorage persistence — users return across sessions
- Mobile-responsive layout — phone beside trainer is the primary use context
- Inline measurement guidance (reference point definitions per field) — prevents the single largest source of user input error

**Should have (competitive):**
- Body measurement estimation mode (inseam/torso/arm formulas for users without a fit report)
- Copy-to-clipboard output
- Multiple saved profiles (households with multiple riders)
- Comparison mode (current Zwift Ride settings vs target)

**Defer to v2+:**
- Visual side-view position diagram (high frontend complexity for additive value)
- Manufacturer geometry input mode (most users have mm measurements, not geometry data)
- Fit report number guide (manual documentation is sufficient initially)

**Anti-features — do not build:**
- PDF upload and parse (OCR fragile, out of scope)
- User accounts (backend requirement)
- AI/LLM fit assessment (out of scope — tool replicates position, does not assess it)
- Generic bike fitting for non-Zwift Ride bikes (scope creep)

### Architecture Approach

The architecture is four layers with strict communication rules: UI components read from and write to a single Zustand store; the store calls pure TypeScript calculation functions; the calculation functions import only from a hardware constants file. No component imports calculation logic directly. The calculation engine lives entirely in `src/lib/calculations.ts` — testable with Vitest without mounting React. Hardware constants (ranges, letter-to-mm table) live in `src/lib/zwiftRideConstants.ts` — the only file that needs editing when new measurement data is confirmed. Inputs accumulate in the store during the multi-step wizard and calculations run once on final submission, not on every keystroke.

**Major components:**
1. `NavigationShell` — step indicator, progress bar, Back/Next navigation
2. `InputSection` — multi-step form wizard orchestrator; delegates to individual form components
3. `ResultsSection` / `ResultCard` — reads calculated outputs from store; renders per-axis adjustment cards
4. `fitProfileStore` (Zustand) — single persisted store for all inputs, outputs, and active wizard step
5. `calculations.ts` — pure functions: saddle height, handlebar height, reach, fore/aft, mm-to-Zwift-position
6. `zwiftRideConstants.ts` — hardware truth table: ranges, letter-to-mm lookup, seat tube angle

**Build order:** Types → constants → calculations (test with Vitest) → validators → store → input UI → output UI → integration.

### Critical Pitfalls

1. **Unverified position-to-mm data** — The letter-to-mm lookup table for all four Zwift Ride adjustment axes is not publicly documented. Never derive it by dividing total range by estimated position count. Obtain the official Zwift PDF and physically verify on hardware before writing a single calculation. This is the highest-recovery-cost pitfall (affects all outputs for all users).

2. **Crank length correction missing** — The Zwift Ride ships with 170 mm cranks. Road bikes commonly use 172.5–175 mm. Saddle height transfers require the correction: `adjusted_saddle_height = road_saddle_height + (170 - road_crank_length)`. Missing this input field means saddle height output is systematically wrong for most users.

3. **Drop bar vs flat bar conflation** — Road bikes use drop bars where the primary hand position (hoods) sits 30–80 mm further forward and 30–50 mm lower than the bar clamp center. The Zwift Ride uses flat bars. Direct transfer of reach/height without accounting for handlebar type will misplace hands by 30–80 mm in reach. The input form must ask for handlebar type and measure from the rider's actual hand contact point, not the bar clamp.

4. **Frame geometry vs rider position confusion** — Frame stack and reach (BB center to head tube top) are not the same as rider position stack and reach (BB center to hand contact). Passing frame geometry directly into position calculations introduces 80–150 mm of systematic error in reach.

5. **Undefined measurement reference points** — "Saddle height" means different things to different users (BB center to saddle top vs floor to saddle vs pedal axle to saddle). Every input field must include exact reference point definitions, an example value, and ideally a diagram. Missing these causes high input error rates that are invisible until users report wrong outputs.

## Implications for Roadmap

Based on the research, the suggested phase structure follows the component build order from ARCHITECTURE.md and puts all physically-dangerous assumptions into Phase 1. No later phase can be correct if Phase 1 ships with wrong hardware data or flawed calculation logic.

### Phase 1: Foundation — Data Model, Hardware Constants, and Calculation Engine

**Rationale:** The entire app is only as correct as its calculation engine. Phase 1 resolves all blocking unknowns before a single UI component is built. This prevents discovering calculation errors during integration when fix cost is highest. Per PITFALLS.md, every critical pitfall is a Phase 1 concern.

**Delivers:**
- TypeScript types (`FitInputs`, `FitOutput`, `ZwiftPosition`) — the contract everything else conforms to
- `zwiftRideConstants.ts` populated from verified source material (official PDF + physical measurement)
- `calculations.ts` with all four axis calculations including crank correction, seat tube angle setback, and handlebar type adjustment
- Zod validation schemas for all input forms
- Vitest unit test suite for calculations — saddle height, setback, handlebar height, reach — covering crank correction, out-of-range clamping, and handlebar type branching

**Addresses:** Direct mm input mode (table stakes), out-of-range validation, crank length correction, handlebar type distinction, seat tube angle for setback

**Avoids:** Pitfalls 1–6 (unverified data, frame/position conflation, crank length, undefined reference points, seat tube angle, drop bar/flat bar)

**Gate:** Do not proceed to Phase 2 until unit tests pass AND outputs are verified against a physical Zwift Ride by someone who can measure actual positions.

### Phase 2: State Layer and Project Scaffold

**Rationale:** The store is the integration point between the calculation engine and every UI component. It must be stable and tested before UI work begins. Establishing the store in isolation means UI development can move fast without state bugs.

**Delivers:**
- Vite + React + TypeScript project scaffolded
- Tailwind v4 + shadcn/ui initialized
- `fitProfileStore` with Zustand persist middleware — inputs, outputs, active step
- localStorage schema versioning (`fitProfile_v1` key)
- Store integration tests: verify persist round-trip, verify `runCalculations()` calls correct functions

**Uses:** Full stack (Vite 8, React 19, Zustand 5, Tailwind v4, shadcn/ui)

**Avoids:** localStorage schema versioning pitfall (stored data has a version key from day one)

### Phase 3: Input UI — Multi-Step Form Wizard

**Rationale:** Input forms are the user's primary interaction. Building them after the store is stable means form components can be fully wired and tested. The multi-step wizard pattern is defined in ARCHITECTURE.md — this phase implements it.

**Delivers:**
- `NavigationShell` — step indicator, Back/Next buttons
- `InputSection` — step routing orchestrator
- Individual form components: `FitReportForm` (primary path), `PhysicalMeasurementsForm`, `BodyMeasurementsForm`
- Inline measurement guidance with reference point definitions for every field (eliminates Pitfall 4)
- Handlebar type selector (drop bar / flat bar) wired to calculation branching
- Crank length input field
- React Hook Form + Zod validation wired to all forms
- Mobile-responsive layout (primary use context: phone beside trainer)

**Addresses:** All P1 table-stakes input features, inline measurement guidance, mobile layout

**Avoids:** Keystroke recalculation anti-pattern (calculations run on form submit only), flat-form abandonment UX pitfall

### Phase 4: Output UI — Results and Adjustment Guide

**Rationale:** Output components read from the store and have no logic of their own — they are the simplest phase technically. Building them after input is complete means they can be tested with real data from the wizard.

**Delivers:**
- `ResultCard` — per-axis output showing both Zwift Ride letter position and mm equivalent
- `ResultsSection` — assembles four cards into the step-by-step adjustment guide
- Out-of-range warning display (specific, axis-named warnings — not generic errors)
- Checklist output format (items users can check off while adjusting the bike)
- Clear visual separation between "Your current bike" inputs and "Your Zwift Ride" outputs

**Addresses:** Step-by-step guide, out-of-range warnings, units on output (both letter and mm always shown), checklist UX

**Avoids:** Static text output pitfall, generic error message pitfall, output-outside-store anti-pattern

### Phase 5: Integration and Edge Case Hardening

**Rationale:** End-to-end wiring and validation of edge cases. Short riders hitting handlebar height minimums, extreme setback values, missing optional inputs. The "looks done but isn't" checklist from PITFALLS.md is the acceptance criteria for this phase.

**Delivers:**
- `App.tsx` wired: NavigationShell + InputSection + ResultsSection
- All PITFALLS.md "looks done but isn't" checklist items verified
- Graceful degradation for partial profiles (show available outputs, prompt for missing fields)
- localStorage corruption recovery (schema version mismatch degrades gracefully, does not crash)
- Deployment to Vercel (zero-config, free tier)

**Addresses:** Bounds-checking completeness, partial input handling, schema versioning recovery, deployment

### Phase 6: Post-Validation Enhancements (v1.x)

**Rationale:** These features add value but do not change the correctness of the core tool. Add after Phase 5 is live and core usage is validated.

**Delivers:**
- Body measurement estimation mode (inseam × formula for users without fit reports)
- Copy-to-clipboard output
- Multiple saved profiles
- Comparison mode (current settings vs target)

**Addresses:** P2 features from FEATURES.md prioritization matrix

### Phase Ordering Rationale

- Phase 1 before everything because wrong hardware data or calculation errors in Phase 1 invalidate all work in later phases. This is the only phase with a hard gate before proceeding.
- Phase 2 (store) before Phase 3 (input UI) because components cannot be fully tested until their data layer is stable.
- Phase 3 (input) before Phase 4 (output) because output components consume data produced by the input flow; testing output with mock data is acceptable but real data integration is required for acceptance.
- Phase 5 (integration) is a dedicated phase, not rolled into Phase 4, because edge case hardening consistently takes longer than expected and should not share a phase with feature work.
- Phase 6 deferred because the v1.x features (body measurement estimation, multiple profiles) do not affect the core fit transfer use case and should only be prioritized after validating that users actually need them.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1:** Hardware data gap is the critical blocker. Before writing any calculation code, the owner of a Zwift Ride needs to physically measure mm at every letter position for saddle height, handlebar height, and handlebar reach — or locate and extract the official Zwift geometry PDF from the product page Tech Specs tab. This is a prerequisite activity, not a development task.
- **Phase 1:** Multiple bike fitting formula methodologies exist for body measurement estimation (LeMond vs Hamley vs others). If body measurement mode is scoped into Phase 1, a formula choice must be made and documented. Recommend deferring to Phase 6 to keep Phase 1 focused on verified data.
- **Phase 3:** The handlebar type input and its branching into calculation logic is non-trivial (see Pitfall 6). Needs explicit design review before implementation — how to ask users about handlebar type without confusing them, and what cockpit measurements to collect for drop bar users.

Phases with standard patterns (skip research-phase):

- **Phase 2:** Zustand + Vite project scaffold is well-documented; no research needed during planning.
- **Phase 4:** Output rendering is standard React component work with no domain-specific unknowns.
- **Phase 5:** Vercel deployment is zero-config; localStorage schema versioning pattern is documented.
- **Phase 6:** All features are incremental additions to the established architecture; no new patterns required.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm and official release docs. Full version compatibility matrix confirmed. |
| Features | MEDIUM | Feature list is well-researched. Core hardware adjustment ranges are confirmed (HIGH) but position-to-mm letter mapping is unconfirmed (LOW) — the single most critical gap. Direct competitor tool exists but could not be scraped. |
| Architecture | HIGH | Patterns are established (pure functions, Zustand persist, RHF multi-step wizard). Zwift-specific hardware encoding is MEDIUM but architecture design accommodates nullable entries with confidence flags. |
| Pitfalls | MEDIUM | Seven critical pitfalls identified with prevention strategies. Most have HIGH confidence. The position data pitfall is known-unknown. Crank/handlebar/setback pitfalls are domain-well-known but often missed by first-time implementers. |

**Overall confidence:** MEDIUM — the technology and architecture are solid and HIGH confidence; the domain-specific data gap (letter-to-mm mapping) keeps overall confidence at MEDIUM.

### Gaps to Address

- **Position-to-mm lookup table (BLOCKING):** The letter-to-mm mapping for all four adjustment axes on the Zwift Ride is not publicly documented. This must be resolved before Phase 1 calculation code is written. Action: physical measurement on a real Zwift Ride at each letter position, or locate the official geometry PDF on the Zwift product page Tech Specs tab. This is the highest-priority pre-development task.

- **Handlebar reach total range (BLOCKING for reach calculation):** The total horizontal adjustment range of the Zwift Ride handlebar is unconfirmed in available sources. Must be measured or sourced from the geometry PDF.

- **Saddle fore/aft range clarification:** Community sources report ~100 mm total range; Mountain Massif review confirms 35 mm rail slide. These figures may refer to different reference points (total range vs rail clamp travel only). Clarify before encoding the constant.

- **Competitor tool review:** The direct competitor at zwift-fit-tool.replit.app could not be scraped. Manual review is recommended before starting UI design to identify gaps in the existing solution worth filling.

- **Handlebar type UX design:** How to ask users about their road bike handlebar type (drop bar / flat bar / tri bar) and which hand position to replicate, without confusing less technically sophisticated users, is unresolved. Requires a UX design decision before Phase 3 begins.

## Sources

### Primary (HIGH confidence)
- [Vite 8.0 release announcement](https://vite.dev/blog/announcing-vite8) — Vite 8 with Rolldown, March 2026
- [React v19.2 blog post](https://react.dev/blog/2025/10/01/react-19-2) — React 19.2 stable
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — stable Jan 2025
- [Zod v4 release notes](https://zod.dev/v4) — 4.3.x, 14x perf improvement over v3
- [Zustand npm](https://www.npmjs.com/package/zustand) — 5.0.12 current
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — localStorage default behavior
- [React Hook Form npm](https://www.npmjs.com/package/react-hook-form) — 7.71.2 current
- [TypeScript 5.9 docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) — 5.9.x current
- [Vercel Vite deployment docs](https://vercel.com/docs/frameworks/frontend/vite) — zero-config deploy confirmed
- [Zwift community forum — adjustment measurements](https://forums.zwift.com/t/zwift-ride-measurements-e/635899) — confirms letter system exists, official table not published
- [Official Zwift Ride bike fit guide PDF](https://www.wahoofitness.com/media/wysiwyg/cms/zwift/ride/zwift-ride_guide_bike-fit_a-1.pdf) — authoritative source for position data

### Secondary (MEDIUM confidence)
- [shadcn/ui comparison 2026](https://www.pkgpulse.com/blog/shadcn-ui-vs-base-ui-vs-radix-components-2026) — shadcn/ui default choice corroborated across sources
- [React form libraries 2026 comparison](https://blog.croct.com/post/best-react-form-libraries) — RHF community consensus
- [Geometry Details: Zwift Smart Frame 2025 — geometrygeeks.bike](https://geometrygeeks.bike/bike/zwift-smart-frame-2025/) — adjustment ranges
- [Zwift Ride Review — Cycling Weekly](https://www.cyclingweekly.com/reviews/bike-reviews/zwift-ride-review-the-ultimate-smart-bike-for-zwifties) — position marking system confirmed
- [Mountain Massif Zwift Ride review](https://www.mountainmassif.com/reviews/technical-hardware/a-detailed-look-at-the-zwift-ride/) — 35 mm saddle rail slide, letter system
- [BikeDynamics saddle height calculator](https://bikedynamics.co.uk/saddleheightformulae.htm) — inseam × 0.883 formula
- [DC Rainmaker Zwift Ride review](https://www.dcrainmaker.com/2024/06/zwift-ride-indoor-bike-review-future.html) — 170 mm fixed crank confirmed
- [Cyclist.co.uk — stack and reach frame vs position](https://www.cyclist.co.uk/in-depth/how-to-measure-stack-and-reach) — frame vs rider position distinction
- [TrainerRoad community — crank length saddle height adjustment](https://www.trainerroad.com/forum/t/transferring-bike-fit/15858) — correction formula
- [BikeRadar forum — flat bar vs drop bar reach](https://forum.bikeradar.com/discussion/13000954/reach-difference-between-flat-bars-and-drop-bars) — offset magnitude

### Tertiary (LOW confidence — needs validation)
- Zwift Ride letter-to-mm mapping — no official source; must be physically measured before use
- Handlebar reach total adjustment range — unconfirmed in all available sources
- Saddle fore/aft total range (~100 mm) — single forum source; requires physical verification

---
*Research completed: 2026-03-21*
*Ready for roadmap: yes*
