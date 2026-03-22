---
phase: 03-output-persistence-and-deploy
plan: 01
subsystem: store
tags: [persistence, zustand, localStorage, state-management]
dependency_graph:
  requires: []
  provides: [localStorage persistence for fit inputs and skill level, resetStore action]
  affects: [src/store/fitStore.ts, all consumers of useFitStore]
tech_stack:
  added: []
  patterns: [Zustand persist middleware, createJSONStorage, partialize, clearStorage]
key_files:
  modified:
    - src/store/fitStore.ts
decisions:
  - currentStep excluded from persist partialize — users always start at step 0 on reload
  - initialState extracted as const to enable atomic reset in resetStore
  - resetStore calls clearStorage() then set(initialState) — both localStorage and in-memory cleared atomically
metrics:
  duration: 84s
  completed: 2026-03-22
  tasks_completed: 1
  files_modified: 1
---

# Phase 03 Plan 01: Persist Middleware and Reset Action Summary

## One-liner

Zustand persist middleware added to fitStore with partialize (inputs + skillLevel only) and resetStore action using clearStorage() for atomic localStorage + in-memory reset.

## What Was Built

Rewrote `src/store/fitStore.ts` to wrap the existing `create<FitStore>()` call in Zustand's `persist()` middleware. The store now serializes `inputs` and `skillLevel` to `localStorage` under the key `zwift-fit-profile` on every state update and hydrates them on page load.

Key implementation details:
- `partialize` explicitly includes only `inputs` and `skillLevel` — action functions and `currentStep` are excluded from serialization
- `createJSONStorage(() => localStorage)` used for synchronous hydration (no flicker per Zustand v5 docs)
- `initialState` extracted as a `const` before the store definition — shared between store initialization and `resetStore`
- `resetStore` action calls `useFitStore.persist.clearStorage()` first (evicts localStorage key), then `set(initialState)` (resets in-memory state) — atomic clear

No API surface changes — all existing consumers of `useFitStore` compile without modification.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add persist middleware and resetStore action to fitStore | 33aa949 | src/store/fitStore.ts |

## Verification

- `npm run build` exits 0 — TypeScript compilation passes, all 2040 modules transformed
- `npm run test` exits 0 — 43 existing tests all pass, no regressions
- `grep "persist"` confirms import, middleware call, and storage name present
- `grep "clearStorage"` confirms resetStore wires to localStorage eviction
- `grep "partialize"` confirms single partialize block with currentStep excluded

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. The persist middleware is fully wired. `resetStore` is implemented and exported via the store. Consumers can call `useFitStore((s) => s.resetStore)` to trigger the "Start over" flow — the UI button (per RESEARCH.md Pattern 4) is deferred to the ResultsStep plan.

## Self-Check: PASSED

Files verified:
- FOUND: /Users/philippgreitsch/Documents/zwift-ride-fitting-assistant/src/store/fitStore.ts

Commits verified:
- FOUND: 33aa949 — feat(03-01): add persist middleware and resetStore action to fitStore
