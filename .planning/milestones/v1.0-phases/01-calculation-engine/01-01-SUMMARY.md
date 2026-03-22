---
phase: 01-calculation-engine
plan: "01"
subsystem: testing
tags: [typescript, vite, vitest, zod, bike-fitting, types, validation]

# Dependency graph
requires: []
provides:
  - FitInputs, AxisOutput, FitOutputs, InputSource TypeScript type contracts in src/types/fit.ts
  - All Zwift Ride hardware constants with source citations in src/lib/zwiftRideConstants.ts
  - Zod v4 validation schemas for all input measurement groups in src/lib/validators.ts
  - Vitest 2.x test runner configured with node environment and passWithNoTests
  - Vite 8 + React + TypeScript project scaffold with build/test scripts
affects: [02-calculation-engine, 03-ui-phase]

# Tech tracking
tech-stack:
  added:
    - Vite 8.0.1 (build tool + dev server)
    - TypeScript 5.9.3 (type safety)
    - Vitest 2.1.9 (unit testing)
    - React 19.2.0 + react-dom (UI framework, scaffold for Phase 2)
    - "@vitejs/plugin-react 6.0.1" (Vite 8-compatible React plugin)
    - "zod 4.3.6" (validation schemas)
  patterns:
    - Types-first contract definition — src/types/fit.ts is the source of truth for all data shapes
    - Hardware constants in single file with inline source citations and confidence levels
    - Null-safe lookup tables — empty Record<string, number | null> until physically measured
    - Zod v4 schemas mirror TypeScript interface shape for each input group

key-files:
  created:
    - src/types/fit.ts
    - src/lib/zwiftRideConstants.ts
    - src/lib/validators.ts
    - vitest.config.ts
    - vite.config.ts
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - package.json
    - .gitignore
  modified: []

key-decisions:
  - "Used @vitejs/plugin-react 6.0.1 (not 4.x) because Vite 8 requires v6 for peer dep compatibility"
  - "Added passWithNoTests: true to vitest.config.ts so scaffold passes with zero test files"
  - "vitest verify uses tsc -p tsconfig.app.json not bare tsc --noEmit file.ts (bare tsc lacks skipLibCheck, fails on node_modules type errors)"
  - "All letter-to-mm lookup tables are empty Record<string, number | null> — not derived from range arithmetic per PITFALLS.md Pitfall 1"
  - "HANDLEBAR_REACH_RANGE has null min/max — total range is unconfirmed in any available source"

patterns-established:
  - "Pattern 1: Types-first — src/types/fit.ts defines all contracts before any implementation"
  - "Pattern 2: Hardware constants in src/lib/zwiftRideConstants.ts with inline source citations and confidence levels"
  - "Pattern 3: Null-safe lookup tables — empty objects until physically measured on hardware, never derived from arithmetic"
  - "Pattern 4: Zod v4 schemas in src/lib/validators.ts mirror FitInputs interface shape"

requirements-completed: [CALC-05, CALC-06]

# Metrics
duration: 5min
completed: 2026-03-21
---

# Phase 01 Plan 01: Scaffold + Types + Constants + Validators Summary

**Vite 8 + TypeScript + Vitest scaffold with FitInputs/AxisOutput/FitOutputs types, hardware constants (saddle 599-865mm, handlebar 863-1024mm, crank 170mm), and Zod v4 validation schemas — all calculation-ready foundations**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T13:30:27Z
- **Completed:** 2026-03-21T13:36:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Vite 8 + React + TypeScript project scaffolded with Vitest 2.x running (zero tests, exit 0)
- Three core type/constant/validator files created with zero TypeScript errors
- All known Zwift Ride hardware constants encoded with inline source citations and confidence levels
- Letter-to-mm lookup tables defined as empty records per PITFALLS.md Pitfall 1 (no fabricated values)
- Zod v4 schemas for all four input groups ready for Phase 2 form integration

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite + TypeScript project with Vitest** - `cd17775` (chore)
2. **Task 2: Define type contracts, hardware constants, and validation schemas** - `0cd273d` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `src/types/fit.ts` - FitInputs, AxisOutput, FitOutputs, InputSource, HandlebarType type contracts
- `src/lib/zwiftRideConstants.ts` - All hardware constants with source citations (saddle/handlebar ranges, crank length, seat tube angle, rail slide, hood offsets, letter-to-mm tables)
- `src/lib/validators.ts` - Zod v4 schemas: fitReportSchema, physicalMeasurementsSchema, bodyMeasurementsSchema, frameGeometrySchema, fitInputsSchema
- `vitest.config.ts` - Test runner config with node environment and passWithNoTests
- `vite.config.ts` - Vite 8 build config with @vitejs/plugin-react v6
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript project references config
- `package.json` - All dependencies including Zod 4.3.6, Vitest 2.1.9, React 19.2.0
- `.gitignore` - Excludes node_modules, dist, .DS_Store, *.tsbuildinfo

## Decisions Made

- Used `@vitejs/plugin-react@^6.0.1` instead of `^4.5.2` — v4 has no Vite 8 peer dep support; v6 is the correct version for Vite 8
- Added `passWithNoTests: true` to vitest.config.ts — the plan requires "exits without error" but Vitest exits code 1 with no test files by default
- Type verification uses `tsc -p tsconfig.app.json` (not bare `tsc --noEmit file.ts`) — bare invocation fails on node_modules type errors because it lacks the project's `skipLibCheck: true` setting
- `SADDLE_FORE_AFT_RANGE` uses `{ minMm: 0, maxMm: 100 }` shape (matching other range constants) rather than `{ totalMm: 100 }` shape from RESEARCH.md Pattern 2 — the plan spec and TypeScript type consistency require min/max for clamping functions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used @vitejs/plugin-react v6 instead of v4**
- **Found during:** Task 1 (npm install)
- **Issue:** `npm install` failed — `@vitejs/plugin-react@^4.5.2` only supports Vite 4-7 as peer dependency; Vite 8 requires v6
- **Fix:** Updated package.json to `@vitejs/plugin-react@^6.0.1` which declares `vite: "^8.0.0"` as peer dependency
- **Files modified:** package.json
- **Verification:** `npm install` succeeds with no peer dep errors
- **Committed in:** cd17775 (Task 1 commit)

**2. [Rule 3 - Blocking] Added passWithNoTests to vitest.config.ts**
- **Found during:** Task 1 (verification step)
- **Issue:** `npx vitest run` with no test files exits code 1 by default; plan requires exit code 0
- **Fix:** Added `passWithNoTests: true` to vitest.config.ts test options
- **Files modified:** vitest.config.ts
- **Verification:** `npx vitest run` now exits 0 with "No test files found, exiting with code 0"
- **Committed in:** cd17775 (Task 1 commit)

**3. [Rule 3 - Blocking] Manual project creation instead of npm create vite**
- **Found during:** Task 1 (scaffolding)
- **Issue:** `npm create vite@latest . -- --template react-ts` cancels when target directory is non-empty (contains CLAUDE.md); `--force` flag also cancelled
- **Fix:** Scaffolded in temp directory, then created all files manually from the template structure
- **Files modified:** All scaffold files (package.json, tsconfig files, vite.config.ts, index.html, src/main.tsx, src/App.tsx)
- **Verification:** `npx vitest run` exits 0; `tsc -p tsconfig.app.json` exits 0
- **Committed in:** cd17775 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 3 - Blocking)
**Impact on plan:** All three fixes were necessary to complete scaffolding in a non-empty directory. No scope creep. Final state matches plan specifications exactly.

## Issues Encountered

- Vite create-vite CLI (v9.0.3) refuses to scaffold into non-empty directories even with `--force`. Workaround: manual file creation following the react-ts template structure.
- The `tsc --noEmit file.ts` verification command in the plan spec does not work with this tsconfig because bare tsc invocation doesn't use skipLibCheck — `tsc -p tsconfig.app.json` is the correct verification approach.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All type contracts ready for Plan 02 to import and implement calculation functions
- `src/lib/zwiftRideConstants.ts` exports all constants Plan 02 needs (ranges, crank mm, seat tube angle)
- `src/types/fit.ts` exports FitInputs shape Plan 02 functions will receive
- `src/lib/__tests__/` directory exists and ready for test files
- **Known blocker (pre-existing, not introduced here):** Letter-to-mm lookup tables are empty — Plan 02 calculations will return `confidence: 'low'` and `letter_position: null` until hardware is physically measured

## Self-Check: PASSED

All files verified present, all commits verified in git history.

- FOUND: src/types/fit.ts
- FOUND: src/lib/zwiftRideConstants.ts
- FOUND: src/lib/validators.ts
- FOUND: vitest.config.ts
- FOUND: .planning/phases/01-calculation-engine/01-01-SUMMARY.md
- FOUND commit: cd17775 (chore(01-01): scaffold Vite + TypeScript project with Vitest)
- FOUND commit: 0cd273d (feat(01-01): define type contracts, hardware constants, and validation schemas)

---
*Phase: 01-calculation-engine*
*Completed: 2026-03-21*
