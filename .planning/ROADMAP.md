# Roadmap: Zwift Ride Fitting Assistant

## Overview

Three phases take this project from zero to a live, working tool. Phase 1 builds and verifies the calculation engine in isolation — the correctness foundation that every output depends on. Phase 2 scaffolds the project and builds the full input UI, wiring all measurement entry forms to the calculation engine. Phase 3 delivers the output guide, persistence, and deploys the app publicly so cyclists can use it beside their Zwift Ride.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Calculation Engine** - Hardware constants, all four axis calculations, and unit tests verified against a physical Zwift Ride
- [ ] **Phase 2: Project Scaffold and Input UI** - Vite/React app scaffolded with Zustand store; all measurement input forms built and mobile-responsive
- [ ] **Phase 3: Output, Persistence, and Deploy** - Step-by-step adjustment guide, localStorage persistence, and live deployment on Vercel

## Phase Details

### Phase 1: Calculation Engine
**Goal**: The calculation logic is correct, tested, and verified — all four Zwift Ride adjustment axes produce accurate outputs from any valid input combination
**Depends on**: Nothing (first phase)
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06
**Success Criteria** (what must be TRUE):
  1. Given a saddle height and crank length, the app produces a corrected target saddle height in mm that accounts for the Zwift Ride's 170mm cranks
  2. Given handlebar height and handlebar type (drop/flat), the app produces a handlebar height target in mm with correct drop-bar offset applied
  3. Given handlebar reach and handlebar type, the app produces a reach target in mm that accounts for the hand contact point difference between drop and flat bars
  4. Each mm target is converted to the correct Zwift Ride letter position using the verified hardware lookup table
  5. Vitest unit tests pass for all four axes, including crank correction, out-of-range clamping, and fit-report priority override
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — Scaffold Vite+TS project, define type contracts, hardware constants, and Zod validators
- [ ] 01-02-PLAN.md — TDD: implement all four axis calculation functions with full test coverage

### Phase 2: Project Scaffold and Input UI
**Goal**: A working React app where a cyclist can enter all their bike measurements across all four input modes and see the data ready for calculation
**Depends on**: Phase 1
**Requirements**: PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05, PHYS-06, PHYS-07, FRAME-01, FRAME-02, FRAME-03, BODY-01, BODY-02, BODY-03, BODY-04, FIT-01, FIT-02, UX-01, UX-03
**Success Criteria** (what must be TRUE):
  1. User can navigate a multi-step input wizard and enter physical measurements, frame geometry, body measurements, and fit report values in dedicated form sections
  2. Every input field shows a reference point definition that tells the user exactly how to take that measurement
  3. Handlebar type selector (drop bar / flat bar) is present and wired to trigger the correct calculation branch
  4. Crank length field is present and wired to the saddle height correction
  5. The app is fully usable on a phone screen held beside the Zwift Ride (no horizontal scrolling, inputs are thumb-reachable)
**Plans**: TBD

### Phase 3: Output, Persistence, and Deploy
**Goal**: The app is live and accessible — cyclists enter measurements, receive a complete step-by-step Zwift Ride adjustment guide, and their data persists across sessions
**Depends on**: Phase 2
**Requirements**: OUT-01, OUT-02, OUT-03, OUT-04, OUT-05, UX-02, UX-04
**Success Criteria** (what must be TRUE):
  1. After submitting measurements, user sees a four-step adjustment guide (saddle height, saddle fore/aft, bar height, bar reach) showing both the target mm value and the corresponding Zwift Ride letter position for each axis
  2. When a target falls outside the Zwift Ride's physical adjustment limits, the user sees a clear warning naming the specific axis that is out of range
  3. Each step includes a brief explanation of how to physically make that adjustment on the Zwift Ride
  4. On returning to the app in a new browser session, all previously entered measurements are automatically restored — no re-entry required
  5. User can clear all saved measurements and start fresh with a single action
  6. The app is accessible at a public URL and loads correctly with no backend dependency
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Calculation Engine | 0/2 | Planning complete | - |
| 2. Project Scaffold and Input UI | 0/? | Not started | - |
| 3. Output, Persistence, and Deploy | 0/? | Not started | - |
