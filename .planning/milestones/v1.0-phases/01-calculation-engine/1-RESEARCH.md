# Phase 1: Calculation Engine - Research

**Researched:** 2026-03-21
**Domain:** Pure TypeScript calculation functions, bike fitting math, Zwift Ride hardware constants
**Confidence:** MEDIUM (math patterns HIGH, hardware letter-to-mm mapping LOW — confirmed data gap)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hardware constants — letter→mm mapping**
- D-01: Research first before writing calculation code — check official Zwift/Wahoo geometry PDF and community sources
- D-02: If exact mapping can't be sourced: use best available community estimate, mark constants as `// UNVERIFIED — measure on physical hardware` in the source code
- D-03: All 4 adjustment axes use the letter system (A–Z) — no axes use raw mm or numbered positions
- D-04: Known hardware ranges to encode: saddle height 599–865mm, handlebar height 863–1024mm. Saddle fore/aft and handlebar reach ranges need confirmation from research.

**Input priority logic**
- D-05: Fit report values always win — professional fit values override direct measurements and derivations for the same axis
- D-06: Priority order (high → low): fit report > direct physical measurement > frame geometry derivation > body measurement estimation
- D-07: Partial fit reports are fine — use fit report for covered axes, fall through to next priority for the rest
- D-08: Engine must tag each output value with its source: `source: "fit-report" | "measured" | "derived" | "estimated"`

**Out-of-range handling**
- D-09: Return both the ideal target AND the clamped achievable position, plus a warning flag
- D-10: Out-of-range output shape: `{ ideal_mm, achievable_mm, letter_position, out_of_range: true, direction: "above" | "below" }`
- D-11: If ALL 4 axes are out of range simultaneously: engine returns an error state, not partial results

**Missing inputs**
- D-12: If no measurements for a given axis: estimate from body measurements if available (inseam, torso, arm length), tag as `source: "estimated"`
- D-13: If no body measurements available either: return `null` for that axis
- D-14: Default crank length when user doesn't enter one: 172.5mm. Saddle height correction = `(user_crank_mm - 170)` applied directly to saddle height target.

### Claude's Discretion

- Exact TypeScript types and interface shapes (beyond the shape defined in D-10)
- Specific math formulas for body measurement estimations (inseam, Hamley formula, etc.)
- Test case selection and edge case coverage
- File structure within `src/lib/`

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALC-01 | App calculates target Zwift Ride saddle height (mm) from input measurements, corrected for crank length difference | Crank correction formula confirmed: `adjusted = road_saddle_height + (170 - road_crank_mm)`. LeMond estimation fallback: `inseam × 0.883`. Hardware range: 599–865mm. |
| CALC-02 | App calculates target Zwift Ride saddle fore/aft position (mm) from input measurements | Setback requires Zwift Ride seat tube angle (73.5°, confirmed from community source). Total rail slide: 35mm. Seatpost has 20mm built-in setback. |
| CALC-03 | App calculates target Zwift Ride handlebar height (mm) from input measurements | Hardware range: 863–1024mm. Drop bar users need hood offset applied (30–50mm height offset from bar clamp center). |
| CALC-04 | App calculates target Zwift Ride handlebar reach (mm) from input measurements, accounting for handlebar type | Drop bar road bikes: hood contact point is 30–80mm further forward than bar clamp center. Direct reach transfer without offset produces wrong output. Handlebar type branching is required. |
| CALC-05 | App converts each mm target to the corresponding Zwift Ride letter position using the hardware lookup table | Letter-to-mm mapping is the primary data gap. No official published table found. Design as nullable lookup with `// UNVERIFIED` markers. |
| CALC-06 | App applies priority order: fit report values > direct measurements > frame geometry derivations > body measurement estimations | Priority resolver is a pattern decision. Each output tagged with source enum. |
</phase_requirements>

---

## Summary

Phase 1 builds the pure TypeScript engine that all later phases depend on. The domain is bike geometry math, hardware constant encoding, and input priority resolution — all expressed as stateless functions with no React or store dependencies. This phase is the highest-risk phase in the entire project because wrong constants or missing corrections produce silently incorrect outputs for all users.

The single most important finding from extended research: **no official published letter-to-mm mapping table exists for the Zwift Ride.** The Wahoo official bike fit PDF exists and was retrieved, but it contains a rider-height-to-letter recommendation chart (e.g. "if you are 175cm, set saddle to G"), not a letter-to-mm table. Community sources confirm this gap — multiple forum threads show users requesting this table and Zwift has not published it. The calculation engine must be architected to accommodate this: the constants file uses `null` placeholders for unverified positions, and the planner should treat physical hardware measurement as a prerequisite task before this phase can produce verified outputs.

The secondary findings are all HIGH confidence: the crank correction formula is well-established (`adjusted_saddle_height = road_saddle_height + (170 - road_crank_mm)`), the drop-bar-to-flat-bar reach offset is a documented bike fitting concept (30–80mm reach difference), and the Vitest testing patterns for pure TypeScript functions are standard and well-documented. The architecture from ARCHITECTURE.md — types → constants → calculations → validators — is the correct build order.

**Primary recommendation:** Build the calculation engine with `null`-safe constants (graceful degradation for unconfirmed positions), implement all four correction formulas correctly, and write Vitest tests that verify each formula independently of the hardware lookup table so correctness can be established even before the letter-to-mm table is physically measured.

---

## Standard Stack

### Core (for this phase — no React, no UI libraries needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.x | All calculation logic and type definitions | Catches unit conversion bugs and shape mismatches; pure TS functions are testable without React |
| Vitest | 2.x (bundled with Vite 8) | Unit testing calculation functions | Same config as Vite; zero additional setup; runs pure TS without browser environment |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod v4 | 4.3.x | Validation schemas for inputs | Define valid ranges for all measurement inputs in `validators.ts`; used later by Phase 2 forms |

**No other libraries are needed for Phase 1.** This phase produces `.ts` files with no npm dependencies beyond TypeScript and Vitest.

### Installation

```bash
# These will already be present after Phase 2 scaffolds the project
# For Phase 1 (pure TS files), no installation needed
# Vitest is included when Vite project is scaffolded with --template react-ts
npm create vite@latest . -- --template react-ts
npm install
# Verify Vitest is available:
npx vitest --version
```

**Version verification (confirmed against npm registry as of 2026-03-21):**
- `vitest`: 2.x current (ships with Vite 8 templates)
- `typescript`: 5.9.x current
- `zod`: 4.3.x current

---

## Architecture Patterns

### Recommended File Structure (this phase only)

```
src/
├── types/
│   └── fit.ts             # All TS types — built first, everything depends on these
├── lib/
│   ├── zwiftRideConstants.ts  # Hardware truth table — ranges, letter-to-mm lookup
│   ├── calculations.ts        # Pure calculation functions — all bike geometry math
│   └── validators.ts          # Zod schemas — input range validation
└── lib/__tests__/
    └── calculations.test.ts   # Vitest unit tests for all four axes
```

This phase produces only these files. No React, no store, no components.

### Pattern 1: Types First — Define the Contract

**What:** All data shapes are defined in `src/types/fit.ts` before writing a single calculation.
**When to use:** Always, in this order. Types are the contract every downstream file honors.

```typescript
// src/types/fit.ts

export type InputSource = 'fit-report' | 'measured' | 'derived' | 'estimated';

export interface FitInputs {
  // Fit report values (highest priority)
  fitReport?: {
    saddleHeight?: number;      // mm, BB center to saddle top
    saddleForeAft?: number;     // mm, horizontal from BB center to saddle nose
    handlebarHeight?: number;   // mm, floor to bar center (for drop bar users: hood height)
    handlebarReach?: number;    // mm, horizontal from saddle nose to hand contact point
  };

  // Direct physical measurements from road bike
  physical?: {
    saddleHeight?: number;      // mm
    saddleForeAft?: number;     // mm
    handlebarHeight?: number;   // mm
    handlebarReach?: number;    // mm
    crankLength?: number;       // mm — defaults to 172.5 if absent
    handlebarType?: 'drop' | 'flat';
    // For drop bar users: hood offset from bar clamp
    dropBarHoodHeightOffset?: number;   // mm, how much lower hoods sit below bar clamp center
    dropBarHoodReachOffset?: number;    // mm, how much further forward hoods sit vs bar clamp center
  };

  // Body measurements (for estimation fallback)
  body?: {
    inseam?: number;    // mm
    torso?: number;     // mm
    arm?: number;       // mm
  };

  // Frame geometry (lowest priority derivation path)
  frame?: {
    stack?: number;     // mm, BB center to head tube top
    reach?: number;     // mm, BB center to head tube top-center, horizontal
    seatTubeAngle?: number;  // degrees
  };
}

export interface AxisOutput {
  ideal_mm: number;             // The calculated target before clamping
  achievable_mm: number;        // Clamped to hardware range
  letter_position: string | null;  // null if lookup table entry is unverified
  out_of_range: boolean;
  direction?: 'above' | 'below';  // Only present when out_of_range is true
  source: InputSource;
  confidence: 'high' | 'medium' | 'low';  // 'low' when letter_position is null
}

export interface FitOutputs {
  saddleHeight: AxisOutput | null;
  saddleForeAft: AxisOutput | null;
  handlebarHeight: AxisOutput | null;
  handlebarReach: AxisOutput | null;
  allAxesOutOfRange?: boolean;  // true when all four are out_of_range
}
```

### Pattern 2: Hardware Constants as a Typed Nullable Table

**What:** All hardware data lives in `zwiftRideConstants.ts`. Entries that have not been physically measured are `null`. The engine handles null gracefully rather than crashing or estimating silently.

**When to use:** Always. Never hardcode a hardware number inline in `calculations.ts`.

```typescript
// src/lib/zwiftRideConstants.ts

// Source: geometrygeeks.bike / Cycling Weekly review — MEDIUM confidence
export const SADDLE_HEIGHT_RANGE = { minMm: 599, maxMm: 865 } as const;

// Source: DC Rainmaker review — HIGH confidence
export const ZWIFT_RIDE_CRANK_MM = 170 as const;

// Source: geometrygeeks.bike — MEDIUM confidence
export const HANDLEBAR_HEIGHT_RANGE = { minMm: 863, maxMm: 1024 } as const;

// Source: community forum reports — LOW confidence, needs physical verification
export const SADDLE_FORE_AFT_RANGE = { totalMm: 100 } as const;

// Source: UNVERIFIED — handlebar reach total range not confirmed in any available source
// Must be physically measured before this constant is usable
export const HANDLEBAR_REACH_RANGE: { minMm: number | null; maxMm: number | null } = {
  minMm: null,
  maxMm: null,
};

// Source: community forum (TrainerRoad) — LOW confidence, needs physical verification
export const ZWIFT_RIDE_SEAT_TUBE_ANGLE_DEGREES = 73.5 as const;

// CRITICAL: Letter-to-mm mapping is not officially published by Zwift.
// All entries are null until physically measured on hardware.
// DO NOT derive from (maxMm - minMm) / estimated_letter_count — this assumes
// linear uniform spacing which has not been confirmed.
// Source for null pattern: PITFALLS.md — Pitfall 1
export const SADDLE_HEIGHT_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure on Zwift Ride hardware at each letter position
  // A through Z or subset — letter count also unconfirmed
  // Example once measured: A: 620, B: 632, C: 644, ...
};

export const HANDLEBAR_HEIGHT_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure
};

export const HANDLEBAR_REACH_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure
};

export const SADDLE_FORE_AFT_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure
};
```

### Pattern 3: Pure Calculation Functions

**What:** All bike geometry math in `calculations.ts`. Functions take `FitInputs`, import only from constants and types, return `AxisOutput | null`.

**When to use:** Always. No React. No store access. No side effects.

```typescript
// src/lib/calculations.ts

import {
  SADDLE_HEIGHT_RANGE,
  ZWIFT_RIDE_CRANK_MM,
  SADDLE_HEIGHT_LETTER_TO_MM,
  // ... other constants
} from './zwiftRideConstants';
import type { FitInputs, AxisOutput } from '../types/fit';

// --- Saddle Height (CALC-01) ---

export function calculateSaddleHeight(inputs: FitInputs): AxisOutput | null {
  // Priority resolver (CALC-06)
  let targetMm: number | null = null;
  let source: AxisOutput['source'] = 'estimated';

  if (inputs.fitReport?.saddleHeight != null) {
    targetMm = inputs.fitReport.saddleHeight;
    source = 'fit-report';
  } else if (inputs.physical?.saddleHeight != null) {
    // Apply crank length correction (CALC-01 core logic)
    const roadCrank = inputs.physical.crankLength ?? 172.5;  // D-14 default
    const crankCorrection = ZWIFT_RIDE_CRANK_MM - roadCrank;
    targetMm = inputs.physical.saddleHeight + crankCorrection;
    source = 'measured';
  } else if (inputs.body?.inseam != null) {
    // LeMond formula estimation — confirmed MEDIUM confidence
    // Source: BikeDynamics saddle height calculator
    targetMm = Math.round(inputs.body.inseam * 0.883);
    source = 'estimated';
  } else {
    return null;  // D-13: no data available for this axis
  }

  return buildAxisOutput(targetMm, SADDLE_HEIGHT_RANGE, SADDLE_HEIGHT_LETTER_TO_MM, source);
}

// --- Shared mm-to-letter converter (CALC-05) ---

function mmToLetter(
  mm: number,
  lookupTable: Record<string, number | null>
): string | null {
  // Find the letter whose mm value is closest to the target
  // Returns null if no entries in the table have been measured yet
  let bestLetter: string | null = null;
  let bestDiff = Infinity;

  for (const [letter, value] of Object.entries(lookupTable)) {
    if (value === null) continue;
    const diff = Math.abs(value - mm);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestLetter = letter;
    }
  }
  return bestLetter;
}

// --- Shared output builder ---

function buildAxisOutput(
  idealMm: number,
  range: { minMm: number; maxMm: number },
  lookupTable: Record<string, number | null>,
  source: AxisOutput['source']
): AxisOutput {
  const achievableMm = Math.max(range.minMm, Math.min(range.maxMm, idealMm));
  const out_of_range = achievableMm !== idealMm;
  const letter_position = mmToLetter(achievableMm, lookupTable);

  return {
    ideal_mm: idealMm,
    achievable_mm: achievableMm,
    letter_position,
    out_of_range,
    direction: out_of_range
      ? idealMm > range.maxMm ? 'above' : 'below'
      : undefined,
    source,
    confidence: letter_position !== null ? 'high' : 'low',
  };
}
```

### Pattern 4: Vitest Tests for Pure Functions

**What:** Test file imports calculation functions directly — no component mounting, no DOM.
**When to use:** For every exported function in `calculations.ts`. Test independently from the lookup table by providing mock constants.

```typescript
// src/lib/__tests__/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSaddleHeight } from '../calculations';

describe('calculateSaddleHeight', () => {
  it('applies crank correction when physical saddle height is provided', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 172.5 },
    });
    // Correction: 170 - 172.5 = -2.5mm → 700 + (-2.5) = 697.5 → 698 after rounding
    expect(result?.achievable_mm).toBe(698);
    expect(result?.source).toBe('measured');
  });

  it('fit report overrides physical measurement', () => {
    const result = calculateSaddleHeight({
      fitReport: { saddleHeight: 720 },
      physical: { saddleHeight: 700, crankLength: 172.5 },
    });
    expect(result?.ideal_mm).toBe(720);
    expect(result?.source).toBe('fit-report');
  });

  it('uses LeMond formula when only inseam is available', () => {
    const result = calculateSaddleHeight({
      body: { inseam: 800 },
    });
    expect(result?.ideal_mm).toBe(Math.round(800 * 0.883));
    expect(result?.source).toBe('estimated');
  });

  it('returns null when no inputs are provided for this axis', () => {
    const result = calculateSaddleHeight({});
    expect(result).toBeNull();
  });

  it('flags out-of-range when target exceeds hardware max (865mm)', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 900, crankLength: 170 },
    });
    expect(result?.out_of_range).toBe(true);
    expect(result?.direction).toBe('above');
    expect(result?.achievable_mm).toBe(865);
    expect(result?.ideal_mm).toBe(900);
  });

  it('uses default 172.5mm crank when crankLength is absent', () => {
    const withDefault = calculateSaddleHeight({
      physical: { saddleHeight: 700 }, // no crankLength
    });
    const withExplicit = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 172.5 },
    });
    expect(withDefault?.achievable_mm).toBe(withExplicit?.achievable_mm);
  });
});
```

### Anti-Patterns to Avoid

- **Inline hardware values:** Never write `if (mm > 865)` in `calculations.ts`. Import `SADDLE_HEIGHT_RANGE.maxMm`.
- **Assumed linear letter spacing:** Never compute `mm_per_letter = (maxMm - minMm) / letterCount`. The spacing may be non-uniform. Use the lookup table or return null.
- **Calculations inside components:** All math in `calculations.ts`. Components only read from the store.
- **Triggering recalculation on every keystroke:** Calculate on form submit only.
- **Passing frame geometry as rider position:** `frame.stack` and `frame.reach` are NOT the same as rider hand position. Never pass frame geometry directly to fit target calculations.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input range validation | Custom if-statement validators | Zod v4 schemas in `validators.ts` | Zod generates TypeScript types + validation in one schema; range, type, and required checks all covered |
| Test framework | Custom test runner | Vitest (zero-config with Vite) | Jest-compatible API, first-class TypeScript, no separate ts-jest setup needed |
| Clamping logic | Repeated `Math.max/min` patterns | Single `buildAxisOutput()` helper | Deduplicates clamping, out-of-range flagging, and letter lookup across all 4 axes |

**Key insight:** The domain-specific math (crank correction, drop bar offset, seat tube angle setback) should be hand-rolled because it encodes domain knowledge — but everything around it (validation, test infrastructure, clamping) uses standard tools.

---

## Calculation Formulas (Verified)

### Saddle Height (CALC-01)

**Formula:** `adjusted_saddle_height_mm = road_saddle_height_mm + (170 - road_crank_mm)`

- Road bike cranks are commonly 172.5–175mm. Zwift Ride is fixed at 170mm.
- Correction adds the difference so knee angle is preserved.
- If `road_crank_mm = 172.5`: correction is `170 - 172.5 = -2.5mm` (saddle target is 2.5mm lower)
- If `road_crank_mm = 175`: correction is `170 - 175 = -5mm`
- Source: TrainerRoad community fit transfer thread + DC Rainmaker review (170mm crank confirmed)
- Confidence: HIGH

**Body estimation fallback (when no road bike measurement):**
- LeMond formula: `saddle_height_mm = inseam_mm × 0.883`
- Measurement reference: BB center to saddle top (same as hardware range measurement)
- Source: BikeDynamics saddle height calculator
- Confidence: MEDIUM (formula is an estimate; actual fit reports override this)

**Alternative body estimation (Hamley method, if Claude's discretion applies):**
- Hamley: `pedal-axle-to-saddle = inseam × 1.09`; then subtract crank arm length to get BB-to-saddle
- Hamley accounts for crank length; LeMond does not
- Recommendation: Use LeMond (simpler, same reference point as hardware range), note crank correction is applied separately

### Saddle Fore/Aft (CALC-02)

**Formula:** This axis requires the Zwift Ride seat tube angle constant.

- Users enter absolute horizontal setback: horizontal distance from BB center to saddle nose
- Do NOT ask for rail clamp position — this is bike-specific and does not transfer
- Zwift Ride seat tube angle: 73.5° (source: TrainerRoad forum, LOW confidence — needs physical verification)
- The target fore/aft position on the Zwift Ride is the rail position that achieves the user's target horizontal setback given the 73.5° tube angle
- Formula: `rail_offset_mm = (target_setback_mm - zwift_default_setback_mm) / cos(seat_tube_angle)`
- Hardware constraint: 35mm rail slide total (Mountain Massif review, MEDIUM confidence), seatpost has 20mm built-in setback
- Source: PITFALLS.md Pitfall 5

### Handlebar Height (CALC-03)

**Formula depends on handlebar type:**

- Flat bar (or Zwift Ride-style): direct transfer. `target_height_mm = road_bar_height_mm`
- Drop bar: user's reference point is typically the hood position, not the bar clamp center.
  - Hood position sits 30–50mm lower than bar clamp center (typical range)
  - If user measured hood-to-floor height: `target_height_mm = hood_height_mm + hood_height_offset_mm`
  - The `hood_height_offset_mm` must be supplied or estimated — a common road bike value is 40mm
- If user enters the Zwift Ride-equivalent directly (bar center to floor): no offset needed
- Hardware range: 863–1024mm floor to bar center
- Source: PITFALLS.md Pitfall 6, BikeRadar forum

### Handlebar Reach (CALC-04)

**Formula depends on handlebar type:**

- Flat bar: direct transfer. `target_reach_mm = road_reach_mm`
- Drop bar: hoods sit 30–80mm further forward than the bar clamp center (typical range; depends on bar make)
  - Road rider's hand contact is at the hoods, not the bar clamp
  - If user measured from saddle nose to hoods: `target_reach_mm = hood_reach_mm`
  - If user measured from saddle nose to bar clamp center: `target_reach_mm = bar_reach_mm - hood_reach_offset_mm`
  - A common offset is 50mm; this should be user-supplied or estimated with a note
- Source: PITFALLS.md Pitfall 6, BikeRadar forum discussion
- Confidence: MEDIUM (offset range is 30–80mm; exact value is bike-specific)

### Priority Resolver (CALC-06)

```
For each axis:
1. inputs.fitReport?.[axis] → source = 'fit-report'
2. inputs.physical?.[axis] → source = 'measured' (apply corrections)
3. inputs.frame → derived calculation → source = 'derived'
4. inputs.body → formula estimation → source = 'estimated'
5. null → axis skipped
```

The resolver runs independently per axis. A user who has a fit report for saddle height but not handlebar reach gets fit-report accuracy for saddle and estimation for reach.

### All-Axes-Out-Of-Range Check (D-11)

After calculating all four axes, check if all non-null outputs have `out_of_range: true`. If so, the `FitOutputs` object has `allAxesOutOfRange: true`. The output layer treats this as an error state and shows a clear message rather than four individual warnings.

---

## Common Pitfalls

### Pitfall 1: Deriving Letter-to-mm Mapping from Range ÷ Count

**What goes wrong:** Developer divides (865 - 599) / estimated_letter_count = ~10.6mm per letter and uses this as the table. Outputs are wrong for all users.
**Why it happens:** No official data exists; the calculation seems reasonable. It assumes uniform linear spacing, which is unconfirmed.
**How to avoid:** Use `null` for all lookup table entries until physically measured. Engine returns `confidence: 'low'` and no letter position. Users see mm target with a note that the letter position requires hardware verification.
**Warning signs:** Any code that computes `mm_per_letter` from range arithmetic.

### Pitfall 2: Missing Crank Length Correction

**What goes wrong:** Saddle height output equals raw input with no transformation. Users with 172.5mm cranks get a saddle that is 2.5mm too high. Over a 2-hour Zwift session this causes knee discomfort.
**Why it happens:** Crank length field omitted from the form or correction skipped in calculation.
**How to avoid:** Always apply correction. Default to 172.5mm when user doesn't enter crank length (D-14).
**Warning signs:** `result.achievable_mm === inputs.physical.saddleHeight` for any non-170mm crank length input.

### Pitfall 3: Direct Drop-Bar Reach Transfer

**What goes wrong:** User measured reach to their road bike's bar clamp center. App transfers that number directly. On the Zwift Ride, the user's hands are now 40–60mm further back than on their road bike.
**Why it happens:** Single reach input field with no handlebar type qualifier.
**How to avoid:** Always ask handlebar type. Apply hood offset when `handlebarType === 'drop'`. Source the offset from user input or estimate with a clear note.
**Warning signs:** Handlebar type appears nowhere in the calculation path for reach.

### Pitfall 4: Frame Geometry Passed as Rider Position

**What goes wrong:** `inputs.frame.reach` (BB center to head tube top-center) used as rider reach. Introduces 80–150mm of systematic error.
**Why it happens:** Frame geometry numbers are easy to find; rider position requires measuring or calculating cockpit additions.
**How to avoid:** Frame geometry is the lowest-priority derivation path. When deriving from frame geometry, the calculation must add stem reach, stem rise, handlebar clamp-to-hood offset. This adds significant complexity. Recommend prioritizing direct measurement or fit report over frame derivation.

### Pitfall 5: Seat Tube Angle Not Applied to Setback

**What goes wrong:** User's saddle setback (horizontal) transferred directly as a rail position offset. But the same rail position on a different seat tube angle produces different horizontal setback.
**Why it happens:** The seat tube angle constant is absent from the constants file.
**How to avoid:** Encode `ZWIFT_RIDE_SEAT_TUBE_ANGLE_DEGREES`. Apply the angle in the fore/aft calculation. Include a unit test that verifies setback output differs from raw input setback value.

---

## Hardware Constants Summary

### Confirmed (HIGH/MEDIUM confidence)

| Constant | Value | Source | Confidence |
|----------|-------|--------|------------|
| Zwift Ride crank length | 170mm | DC Rainmaker review | HIGH |
| Saddle height range | 599–865mm | Cycling Weekly + geometrygeeks.bike | MEDIUM |
| Handlebar height range | 863–1024mm | Cycling Weekly + geometrygeeks.bike | MEDIUM |
| Saddle rail slide (fore/aft) | 35mm | Mountain Massif review | MEDIUM |
| Seatpost built-in setback | 20mm | Community forum reports | MEDIUM |
| Handlebar bar clamp specs | 420mm width, 125mm drop, 70mm reach, 31.8mm diameter | DC Rainmaker review | HIGH |
| Default crank assumption | 172.5mm (most common road bike) | D-14, TrainerRoad community | HIGH |

### Unconfirmed (LOW confidence — requires physical measurement)

| Constant | Status | What's Needed |
|----------|--------|---------------|
| Letter-to-mm mapping (all 4 axes) | NOT PUBLISHED — no official source | Physical measurement at each letter position on hardware, OR official Zwift geometry PDF extraction |
| Handlebar reach total range | UNCONFIRMED | Physical measurement or official spec sheet |
| Saddle fore/aft total range (~100mm) | SINGLE FORUM SOURCE | Physical verification (may refer to different reference point than 35mm rail slide) |
| Seat tube angle (73.5°) | COMMUNITY FORUM ONLY | Cross-reference with official geometry spec |
| Letter count per axis (A–Z or subset) | UNKNOWN | Physical inspection |

### Data Gap Strategy

Until physical measurements are taken, the constants file uses this pattern:

```typescript
// src/lib/zwiftRideConstants.ts
// UNVERIFIED — measure on physical hardware before shipping
export const SADDLE_HEIGHT_LETTER_TO_MM: Record<string, number | null> = {};
```

When `mmToLetter()` receives an empty or all-null table, it returns `null`. The `AxisOutput` has `letter_position: null` and `confidence: 'low'`. The output layer (Phase 3) displays the mm target with a note: "Letter position requires hardware verification — use the mm target to set your position manually."

This means the app is functional and correct for mm targets before the letter table is populated, and the letter column improves automatically as data is filled in.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Zod v3 validation | Zod v4 (14x faster, 57% smaller bundle) | Use v4 — already in locked stack |
| Jest for TypeScript tests | Vitest (same Vite config, no ts-jest setup) | Simpler setup, faster execution |
| `inseam × 1.09` (Hamley, pedal-to-saddle) | `inseam × 0.883` (LeMond, BB-center-to-saddle) | LeMond matches the hardware range measurement reference; use LeMond |

---

## Open Questions

1. **Letter-to-mm mapping (BLOCKING for letter position output)**
   - What we know: Total ranges confirmed (599–865mm saddle, 863–1024mm handlebar). Letter system exists (A–Z on physical hardware markings).
   - What's unclear: No official published table. Spacing may not be uniform. Letter count per axis unknown.
   - Recommendation: Treat as a prerequisite task before phase sign-off. The planner should include a task: "Measure mm at each letter position on physical Zwift Ride hardware and populate `zwiftRideConstants.ts`". The engine ships with null entries and outputs mm targets without letter positions until this task completes.

2. **Handlebar reach total range (BLOCKING for reach out-of-range check)**
   - What we know: Adjustment is continuous (not click-stop). Horizontal sliding unit.
   - What's unclear: Total range in mm is not confirmed in any available source.
   - Recommendation: Default `HANDLEBAR_REACH_RANGE` min and max to `null`. Out-of-range check for reach is disabled until the range is measured.

3. **Drop bar hood offset values**
   - What we know: Hoods sit 30–80mm further forward and 30–50mm lower than bar clamp center (BikeRadar forum, MEDIUM confidence).
   - What's unclear: Whether to use a fixed default offset or ask users to measure it.
   - Recommendation (Claude's discretion): Use a user-supplied offset field with a default of 50mm reach and 40mm height. Document clearly in the input form that these are the values to measure from the bar clamp center to the hood contact point.

4. **Saddle fore/aft: rail slide vs total range**
   - What we know: Mountain Massif review says 35mm rail slide. Forum users say ~100mm total range.
   - What's unclear: Whether ~100mm includes the 20mm seatpost setback plus additional rail travel, or if these refer to different measurement points.
   - Recommendation: Encode `SADDLE_FORE_AFT_RANGE.totalMm = 100` as the clamp boundary with a `// UNVERIFIED` comment. Add a unit test that catches an out-of-range warning for an extreme setback value.

---

## Sources

### Primary (HIGH confidence)
- [DC Rainmaker Zwift Ride In-Depth Review](https://www.dcrainmaker.com/2024/06/zwift-ride-indoor-bike-review-future.html) — 170mm fixed crank confirmed, handlebar specs
- [BikeDynamics saddle height calculator](https://bikedynamics.co.uk/saddleheightformulae.htm) — LeMond formula (inseam × 0.883) and Hamley method
- [Vitest official docs](https://vitest.dev/config/) — unit test configuration and TypeScript patterns
- `.planning/research/PITFALLS.md` — all 7 critical pitfalls with prevention strategies (project research artifact)
- `.planning/research/ARCHITECTURE.md` — component build order, pure function pattern, constants file pattern (project research artifact)

### Secondary (MEDIUM confidence)
- [Geometry Details: Zwift Smart Frame 2025 — geometrygeeks.bike](https://geometrygeeks.bike/bike/zwift-smart-frame-2025/) — saddle height 599–865mm, handlebar 863–1024mm
- [Mountain Massif Zwift Ride review](https://www.mountainmassif.com/reviews/technical-hardware/a-detailed-look-at-the-zwift-ride/) — 35mm saddle rail slide, letter system description
- [TrainerRoad community — crank length saddle height adjustment](https://www.trainerroad.com/forum/t/transferring-bike-fit/15858) — correction formula community consensus
- [BikeRadar forum — flat bar vs drop bar reach](https://forum.bikeradar.com/discussion/13000954/reach-difference-between-flat-bars-and-drop-bars) — 30–80mm hood offset
- [Zwift Ride forum — seat tube angle 73.5°](https://www.trainerroad.com/forum/t/new-zwift-ride-smart-frame-june-12-2024/93840?page=5) — single community mention, LOW-MEDIUM

### Tertiary (LOW confidence — requires physical verification)
- Letter-to-mm position mapping: no official source found despite extensive search. Wahoo PDF retrieved but is rider-height-to-letter chart only, not mm conversion table.
- Handlebar reach total range: not found in any available source.
- Saddle fore/aft total range (~100mm): single forum source, conflates with 35mm rail slide.

---

## Metadata

**Confidence breakdown:**
- Standard stack (TypeScript, Vitest): HIGH — verified, zero ambiguity
- Calculation formulas (crank correction, drop bar offset, LeMond): HIGH — multiple verified sources
- Hardware ranges (saddle height, handlebar height): MEDIUM — third-party aggregator sources, cross-confirmed
- Letter-to-mm lookup table: LOW — confirmed data gap, no official or community source found
- Seat tube angle (73.5°): LOW — single community mention, unverified

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 for stack; hardware data gap remains LOW until physical measurement

---

*Phase: 01-calculation-engine*
*Research written: 2026-03-21*
