/**
 * Zwift Ride hardware constants.
 *
 * Each constant includes an inline source citation and confidence level.
 * Unverified constants use null with UNVERIFIED comments.
 *
 * CRITICAL: All letter-to-mm lookup tables are empty until physically measured
 * on hardware. DO NOT derive from range arithmetic (see PITFALLS.md Pitfall 1).
 */

// ---------------------------------------------------------------------------
// Crank length
// ---------------------------------------------------------------------------

/**
 * Fixed crank length of the Zwift Ride in mm.
 * Source: DC Rainmaker Zwift Ride In-Depth Review (dcrainmaker.com/2024/06/...) — HIGH confidence
 */
export const ZWIFT_RIDE_CRANK_MM = 170 as const;

/**
 * Default crank length assumption for road bikes when user does not enter one.
 * Used for crank length correction: adjusted_saddle_height = road_saddle_height + (170 - road_crank_mm)
 * Per D-14: most common road bike crank length.
 * Source: TrainerRoad community fit transfer thread + D-14 decision — HIGH confidence
 */
export const DEFAULT_CRANK_LENGTH_MM = 172.5 as const;

// ---------------------------------------------------------------------------
// Hardware adjustment ranges
// ---------------------------------------------------------------------------

/**
 * Saddle height adjustment range in mm (floor to saddle top).
 * Source: geometrygeeks.bike/bike/zwift-smart-frame-2025/ + Cycling Weekly review — MEDIUM confidence
 */
export const SADDLE_HEIGHT_RANGE = { minMm: 599, maxMm: 865 } as const;

/**
 * Handlebar height adjustment range in mm (floor to bar center).
 * Source: geometrygeeks.bike/bike/zwift-smart-frame-2025/ + Cycling Weekly review — MEDIUM confidence
 */
export const HANDLEBAR_HEIGHT_RANGE = { minMm: 863, maxMm: 1024 } as const;

/**
 * Saddle fore/aft total adjustment range in mm.
 * UNVERIFIED — single community forum source, may conflate with 35mm rail slide measurement.
 * Source: community forum reports — LOW confidence, UNVERIFIED
 */
export const SADDLE_FORE_AFT_RANGE = { minMm: 0, maxMm: 100 } as const;

/**
 * Handlebar reach total adjustment range.
 * UNVERIFIED — total range not confirmed in any available source.
 * Must be physically measured before this constant is usable for out-of-range checks.
 * Source: UNVERIFIED — must be physically measured on Zwift Ride hardware
 */
export const HANDLEBAR_REACH_RANGE: { minMm: number | null; maxMm: number | null } = {
  minMm: null, // UNVERIFIED — measure on physical hardware
  maxMm: null, // UNVERIFIED — measure on physical hardware
};

// ---------------------------------------------------------------------------
// Seat tube geometry
// ---------------------------------------------------------------------------

/**
 * Zwift Ride seat tube angle in degrees.
 * Used in saddle fore/aft calculation to convert between horizontal setback and rail position.
 * Source: TrainerRoad forum (single community mention) — LOW confidence, UNVERIFIED
 */
export const ZWIFT_RIDE_SEAT_TUBE_ANGLE_DEGREES = 73.5 as const;

/**
 * Built-in setback of the Zwift Ride seatpost in mm.
 * This offset is present before any rail adjustment.
 * Source: community forum reports — MEDIUM confidence
 */
export const SEATPOST_BUILTIN_SETBACK_MM = 20 as const;

/**
 * Total fore/aft rail slide available in mm.
 * Riders can slide the saddle clamp this distance forward/backward on the rail.
 * Source: Mountain Massif Zwift Ride review (mountainmassif.com/reviews/...) — MEDIUM confidence
 */
export const SADDLE_RAIL_SLIDE_MM = 35 as const;

// ---------------------------------------------------------------------------
// Drop bar hood offset defaults
// ---------------------------------------------------------------------------

/**
 * Default horizontal offset between bar clamp center and hood contact point in mm.
 * Hoods typically sit further forward than the bar clamp center.
 * User-overridable — rider should measure their own hood position.
 * Source: BikeRadar forum, PITFALLS.md Pitfall 6 — MEDIUM confidence (range is 30–80mm; 50mm is midpoint)
 */
export const DEFAULT_DROP_BAR_HOOD_REACH_OFFSET_MM = 50 as const;

/**
 * Default vertical offset between bar clamp center and hood contact point in mm.
 * Hoods typically sit lower than the bar clamp center.
 * User-overridable — rider should measure their own hood position.
 * Source: PITFALLS.md Pitfall 6, BikeRadar forum — MEDIUM confidence (range is 30–50mm; 40mm is midpoint)
 */
export const DEFAULT_DROP_BAR_HOOD_HEIGHT_OFFSET_MM = 40 as const;

// ---------------------------------------------------------------------------
// Letter-to-mm lookup tables
// ---------------------------------------------------------------------------
//
// CRITICAL: These tables must be populated by physically measuring the mm value
// at each letter position on real Zwift Ride hardware.
//
// DO NOT derive from range arithmetic (e.g. (maxMm - minMm) / estimated_letter_count).
// Linear uniform spacing has not been confirmed for any axis.
// Per PITFALLS.md Pitfall 1.
//
// When empty, mmToLetter() returns null and AxisOutput has:
//   - letter_position: null
//   - confidence: 'low'
// The output layer displays the mm target with a note that the letter position
// requires hardware verification.
//
// See RESEARCH.md "Data Gap Strategy" for the full approach.
// ---------------------------------------------------------------------------

/**
 * Saddle height letter position to mm mapping.
 * UNVERIFIED — measure on physical hardware. DO NOT derive from range arithmetic.
 * Source: No official published table found (see RESEARCH.md Open Questions #1)
 */
export const SADDLE_HEIGHT_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure on Zwift Ride hardware at each letter position
  // A through Z or subset — letter count per axis also unconfirmed
  // Example once measured: A: 620, B: 632, C: 644, ...
};

/**
 * Handlebar height letter position to mm mapping.
 * UNVERIFIED — measure on physical hardware. DO NOT derive from range arithmetic.
 */
export const HANDLEBAR_HEIGHT_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure on Zwift Ride hardware at each letter position
};

/**
 * Handlebar reach letter position to mm mapping.
 * UNVERIFIED — measure on physical hardware. DO NOT derive from range arithmetic.
 */
export const HANDLEBAR_REACH_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure on Zwift Ride hardware at each letter position
};

/**
 * Saddle fore/aft letter position to mm mapping.
 * UNVERIFIED — measure on physical hardware. DO NOT derive from range arithmetic.
 */
export const SADDLE_FORE_AFT_LETTER_TO_MM: Record<string, number | null> = {
  // TODO: physically measure on Zwift Ride hardware at each letter position
};
