# Zwift Ride Fitting Assistant

## What This Is

A webapp that helps cyclists replicate their real bike position on a Zwift Ride stationary bike. Users enter measurements from their existing bike (manufacturer geometry, self-measured values, bike fit report numbers, or body measurements) and the app outputs a step-by-step adjustment guide showing both the physical measurement targets and the corresponding Zwift Ride position settings (notch/dial positions).

## Core Value

Given my existing bike measurements, tell me exactly how to set up my Zwift Ride to match — in both millimeters and Zwift Ride position numbers.

## Requirements

### Validated

- [x] User can enter manufacturer bike geometry (stack, reach, seat tube length) — Validated in Phase 02: project-scaffold-input-ui
- [x] User can enter physical measurements (saddle height, saddle setback, handlebar height, reach, drop) — Validated in Phase 02: project-scaffold-input-ui
- [x] User can enter body measurements (inseam, torso length, arm length) — Validated in Phase 02: project-scaffold-input-ui
- [x] User can enter bike fit report values (key numbers, manually typed) — Validated in Phase 02: project-scaffold-input-ui

### Active

- [ ] App calculates target Zwift Ride settings from input measurements
- [ ] Output shows both physical measurement targets and Zwift Ride position settings (notch/dial position)
- [ ] Output is a step-by-step adjustment guide
- [ ] Measurements are saved in browser local storage (no re-entry on return visits)
- [ ] App is deployed online and accessible as a free service

### Out of Scope

- PDF upload/parsing — manual entry sufficient for v1
- User accounts / login — local storage covers the need
- Multiple saved bike profiles — one active fit profile for v1
- Paid tier — free service only

## Context

- The Zwift Ride is a smart stationary trainer with adjustable saddle height, saddle fore/aft position, handlebar height, and handlebar fore/aft position
- The exact adjustment ranges, notch counts, and measurement conversions for the Zwift Ride need to be researched and encoded in the app's calculation logic
- No tech stack preference — pure frontend (no backend needed for v1) with local storage persistence is the right approach
- Deployment target: publicly accessible URL, free service

## Constraints

- **Architecture**: Frontend-only for v1 — no backend, no database, no auth
- **Cost**: Free to use for end users; hosting should be cheap/free (e.g. Vercel, Netlify)
- **Scope**: Zwift Ride only — not a generic bike fitting tool for other trainers

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual entry only (no PDF parsing) | Simpler to build, users can copy key numbers from fit reports | — Pending |
| Local storage for persistence | No backend needed, keeps it free and private | — Pending |
| Show both mm measurements and Zwift Ride positions | Users who measure and users who use notch system are both covered | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-21 after Phase 02 complete — full input wizard UI shipped*
