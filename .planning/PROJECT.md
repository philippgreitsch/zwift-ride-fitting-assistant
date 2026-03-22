# Zwift Ride Fitting Assistant

## What This Is

A webapp that helps cyclists replicate their real bike position on a Zwift Ride stationary bike. Users enter measurements from their existing bike (manufacturer geometry, self-measured values, bike fit report numbers, or body measurements) and the app outputs a step-by-step adjustment guide showing both the physical measurement targets and the corresponding Zwift Ride position settings (notch/dial positions).

**Shipped:** v1.0 MVP — live at https://zwift-ride-fitting-assistant.vercel.app

## Core Value

Given my existing bike measurements, tell me exactly how to set up my Zwift Ride to match — in both millimeters and Zwift Ride position numbers.

## Current State (v1.0)

- **Stack:** React 19 + TypeScript + Vite 8, Tailwind v4, shadcn/ui (base-nova), Zustand persist, React Hook Form + Zod v4
- **Source:** ~3,300 LOC, 43 unit tests passing
- **Deploy:** Vercel (free tier), auto-deploys from GitHub main
- **Known gap:** Letter position lookup tables empty — mm targets display correctly, letter positions show "not yet confirmed" until hardware data is added to `src/lib/zwiftRideConstants.ts`

## Requirements

### Validated (v1.0)

- ✓ User can enter physical measurements (saddle height, setback, handlebar height, reach, drop) — v1.0
- ✓ User can enter manufacturer bike geometry (stack, reach, seat tube angle) — v1.0
- ✓ User can enter body measurements (inseam, torso length, arm length) — v1.0
- ✓ User can enter bike fit report values (manual entry, overrides measurements) — v1.0
- ✓ App calculates target Zwift Ride settings from all input modes — v1.0
- ✓ Output is a four-step adjustment guide (saddle height → fore/aft → bar height → bar reach) — v1.0
- ✓ Out-of-range warnings shown when targets exceed Zwift Ride limits — v1.0
- ✓ Measurements saved to localStorage and restored on return — v1.0
- ✓ User can clear all saved measurements — v1.0
- ✓ App is mobile-responsive and usable on a phone beside the bike — v1.0
- ✓ App deployed at public URL, free service — v1.0

### Active (v1.1+)

- [ ] Output shows Zwift Ride letter positions (notch/dial) alongside mm targets — blocked on hardware lookup table data (backlog 999.1)

### Out of Scope

- PDF upload/parsing — manual entry is sufficient; users copy key numbers
- User accounts / login — localStorage covers the need
- Multiple saved bike profiles — one active fit profile for v1
- Paid tier — free service only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend-only, no backend | No auth, no server costs, deployable free on Vercel | ✓ Validated |
| Manual entry only (no PDF parsing) | Simpler to build; users copy key numbers | ✓ Validated — works well in practice |
| localStorage via Zustand persist | No backend needed, private, zero friction | ✓ Validated — blur-sync pattern established |
| Show both mm and letter positions | Serves both measurer and notch-system users | ⚠ Partial — mm live; letter positions pending hardware |
| currentStep persisted | UAT showed users expect to return to their last step | ✓ Reversed initial decision — UAT confirmed correct |
| React Hook Form + getValues() in handleBlur | watch() snapshot is stale in blur handler | ✓ Confirmed pattern for all step components |

## Constraints

- **Architecture**: Frontend-only — no backend, no database, no auth
- **Cost**: Free to use; hosting on Vercel free tier
- **Scope**: Zwift Ride only — not a generic bike fitting tool

---
*Last updated: 2026-03-22 after v1.0 milestone complete*
