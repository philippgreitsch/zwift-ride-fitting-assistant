/**
 * Zwift Ride calculation engine.
 *
 * All four axis calculation functions plus the orchestrator.
 * Pure TypeScript — no React, no side effects, no global state.
 *
 * Requirements satisfied: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06
 *
 * Import notes:
 * - All hardware values come from zwiftRideConstants — never hardcoded inline
 * - All type contracts come from types/fit.ts
 */

import type { FitInputs, AxisOutput, FitOutputs, InputSource } from '../types/fit';
import {
  ZWIFT_RIDE_CRANK_MM,
  DEFAULT_CRANK_LENGTH_MM,
  SADDLE_HEIGHT_RANGE,
  HANDLEBAR_HEIGHT_RANGE,
  SADDLE_FORE_AFT_RANGE,
  HANDLEBAR_REACH_RANGE,
  DEFAULT_DROP_BAR_HOOD_REACH_OFFSET_MM,
  DEFAULT_DROP_BAR_HOOD_HEIGHT_OFFSET_MM,
  SADDLE_HEIGHT_LETTER_TO_MM,
  HANDLEBAR_HEIGHT_LETTER_TO_MM,
  HANDLEBAR_REACH_LETTER_TO_MM,
  SADDLE_FORE_AFT_LETTER_TO_MM,
} from './zwiftRideConstants';

// ---------------------------------------------------------------------------
// CALC-05: mm-to-letter converter
// ---------------------------------------------------------------------------

/**
 * Find the Zwift Ride letter position closest to the given mm value.
 * Returns null if the lookup table has no non-null entries (hardware not measured yet).
 */
export function mmToLetter(
  mm: number,
  lookupTable: Record<string, number | null>
): string | null {
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

// ---------------------------------------------------------------------------
// Shared output builders
// ---------------------------------------------------------------------------

/**
 * Build an AxisOutput for axes with fully-known hardware bounds.
 * Clamps idealMm to [range.minMm, range.maxMm], flags out_of_range, finds letter position.
 */
function buildAxisOutput(
  idealMm: number,
  range: { minMm: number; maxMm: number },
  lookupTable: Record<string, number | null>,
  source: InputSource
): AxisOutput {
  const achievable_mm = Math.max(range.minMm, Math.min(range.maxMm, idealMm));
  const out_of_range = achievable_mm !== idealMm;
  const letter_position = mmToLetter(achievable_mm, lookupTable);

  return {
    ideal_mm: idealMm,
    achievable_mm,
    letter_position,
    out_of_range,
    direction: out_of_range
      ? idealMm > range.maxMm
        ? 'above'
        : 'below'
      : undefined,
    source,
    confidence: letter_position !== null ? 'high' : 'low',
  };
}

/**
 * Build an AxisOutput for axes where range bounds may be null (e.g. handlebar reach).
 * When min/max are null, clamping is skipped: achievable_mm = idealMm, out_of_range = false.
 */
function buildAxisOutputNullableRange(
  idealMm: number,
  range: { minMm: number | null; maxMm: number | null },
  lookupTable: Record<string, number | null>,
  source: InputSource
): AxisOutput {
  // If both bounds are known, behave identically to buildAxisOutput
  if (range.minMm !== null && range.maxMm !== null) {
    return buildAxisOutput(idealMm, { minMm: range.minMm, maxMm: range.maxMm }, lookupTable, source);
  }

  // Partial or fully unknown range — cannot perform out-of-range check
  const letter_position = mmToLetter(idealMm, lookupTable);

  return {
    ideal_mm: idealMm,
    achievable_mm: idealMm,
    letter_position,
    out_of_range: false,
    source,
    confidence: letter_position !== null ? 'high' : 'low',
  };
}

// ---------------------------------------------------------------------------
// CALC-01: Saddle Height
// ---------------------------------------------------------------------------

/**
 * Calculate target Zwift Ride saddle height from available inputs.
 *
 * Priority (D-05/D-06):
 *   1. fitReport.saddleHeight (no crank correction — fit report is the final mm value)
 *   2. physical.saddleHeight (crank correction applied: target = height + (ZWIFT_RIDE_CRANK_MM - crankLength))
 *   3. body.inseam (LeMond estimation: round(inseam * 0.883))
 *   4. null — no applicable input (D-13)
 */
export function calculateSaddleHeight(inputs: FitInputs): AxisOutput | null {
  let targetMm: number;
  let source: InputSource;

  if (inputs.fitReport?.saddleHeight != null) {
    // Fit report is the final position value — no crank correction (per CALC-01)
    targetMm = inputs.fitReport.saddleHeight;
    source = 'fit-report';
  } else if (inputs.physical?.saddleHeight != null) {
    // Apply crank length correction (CALC-01 core formula)
    // Zwift Ride has 170mm cranks; road bike may have longer cranks.
    // Correction preserves knee angle: if road crank is longer, saddle target is lower.
    const crankLength = inputs.physical.crankLength ?? DEFAULT_CRANK_LENGTH_MM;
    const crankCorrection = ZWIFT_RIDE_CRANK_MM - crankLength;
    targetMm = inputs.physical.saddleHeight + crankCorrection;
    source = 'measured';
  } else if (inputs.body?.inseam != null) {
    // LeMond formula estimation (D-12): BB center to saddle top = inseam × 0.883
    // Source: BikeDynamics saddle height calculator — MEDIUM confidence
    targetMm = Math.round(inputs.body.inseam * 0.883);
    source = 'estimated';
  } else {
    return null; // D-13: no data available for this axis
  }

  return buildAxisOutput(targetMm, SADDLE_HEIGHT_RANGE, SADDLE_HEIGHT_LETTER_TO_MM, source);
}

// ---------------------------------------------------------------------------
// CALC-02: Saddle Fore/Aft
// ---------------------------------------------------------------------------

/**
 * Calculate target Zwift Ride saddle fore/aft position from available inputs.
 *
 * Priority (D-05/D-06):
 *   1. fitReport.saddleForeAft
 *   2. physical.saddleForeAft
 *   3. null — no applicable input (D-13)
 *
 * Note: Frame-geometry derivation (seat tube angle conversion) is a stretch goal.
 * For now, direct measurement and fit report paths only (per plan spec).
 */
export function calculateSaddleForeAft(inputs: FitInputs): AxisOutput | null {
  let targetMm: number;
  let source: InputSource;

  if (inputs.fitReport?.saddleForeAft != null) {
    targetMm = inputs.fitReport.saddleForeAft;
    source = 'fit-report';
  } else if (inputs.physical?.saddleForeAft != null) {
    targetMm = inputs.physical.saddleForeAft;
    source = 'measured';
  } else {
    return null; // D-13
  }

  return buildAxisOutput(targetMm, SADDLE_FORE_AFT_RANGE, SADDLE_FORE_AFT_LETTER_TO_MM, source);
}

// ---------------------------------------------------------------------------
// CALC-03: Handlebar Height
// ---------------------------------------------------------------------------

/**
 * Calculate target Zwift Ride handlebar height from available inputs.
 *
 * Priority (D-05/D-06):
 *   1. fitReport.handlebarHeight (no offset — fit report is the final mm value)
 *   2. physical.handlebarHeight with drop bar offset if handlebarType === 'drop'
 *      Drop bar users measured hood-to-floor height. Hoods sit LOWER than bar clamp center.
 *      Zwift Ride flat bar reference is the bar clamp center.
 *      Target = hood_height + offset (the bar is higher than where the hoods were).
 *   3. null — no applicable input (D-13)
 */
export function calculateHandlebarHeight(inputs: FitInputs): AxisOutput | null {
  let targetMm: number;
  let source: InputSource;

  if (inputs.fitReport?.handlebarHeight != null) {
    targetMm = inputs.fitReport.handlebarHeight;
    source = 'fit-report';
  } else if (inputs.physical?.handlebarHeight != null) {
    const isDropBar = inputs.physical.handlebarType === 'drop';

    if (isDropBar) {
      // CALC-03: Hood height is lower than bar clamp center.
      // To get the equivalent flat bar position, add the height offset.
      const offset =
        inputs.physical.dropBarHoodHeightOffset ?? DEFAULT_DROP_BAR_HOOD_HEIGHT_OFFSET_MM;
      targetMm = inputs.physical.handlebarHeight + offset;
    } else {
      // Flat bar or undefined handlebarType: direct transfer
      targetMm = inputs.physical.handlebarHeight;
    }
    source = 'measured';
  } else {
    return null; // D-13
  }

  return buildAxisOutput(
    targetMm,
    HANDLEBAR_HEIGHT_RANGE,
    HANDLEBAR_HEIGHT_LETTER_TO_MM,
    source
  );
}

// ---------------------------------------------------------------------------
// CALC-04: Handlebar Reach
// ---------------------------------------------------------------------------

/**
 * Calculate target Zwift Ride handlebar reach from available inputs.
 *
 * Priority (D-05/D-06):
 *   1. fitReport.handlebarReach (no offset — fit report is the final mm value)
 *   2. physical.handlebarReach with drop bar offset if handlebarType === 'drop'
 *      Drop bar users' hoods are further FORWARD than bar clamp center.
 *      Zwift Ride flat bar reference is the bar clamp center.
 *      Target = hood_reach - offset (flat bar position is shorter).
 *   3. null — no applicable input (D-13)
 *
 * Note: HANDLEBAR_REACH_RANGE has null bounds (unverified) — out-of-range check is disabled.
 */
export function calculateHandlebarReach(inputs: FitInputs): AxisOutput | null {
  let targetMm: number;
  let source: InputSource;

  if (inputs.fitReport?.handlebarReach != null) {
    targetMm = inputs.fitReport.handlebarReach;
    source = 'fit-report';
  } else if (inputs.physical?.handlebarReach != null) {
    const isDropBar = inputs.physical.handlebarType === 'drop';

    if (isDropBar) {
      // CALC-04: Hoods are further forward than bar clamp center.
      // To get the equivalent flat bar position, subtract the reach offset.
      const offset =
        inputs.physical.dropBarHoodReachOffset ?? DEFAULT_DROP_BAR_HOOD_REACH_OFFSET_MM;
      targetMm = inputs.physical.handlebarReach - offset;
    } else {
      // Flat bar or undefined handlebarType: direct transfer
      targetMm = inputs.physical.handlebarReach;
    }
    source = 'measured';
  } else {
    return null; // D-13
  }

  return buildAxisOutputNullableRange(
    targetMm,
    HANDLEBAR_REACH_RANGE,
    HANDLEBAR_REACH_LETTER_TO_MM,
    source
  );
}

// ---------------------------------------------------------------------------
// CALC-06: Orchestrator
// ---------------------------------------------------------------------------

/**
 * Calculate all four Zwift Ride adjustment axes from the given inputs.
 *
 * Applies priority resolution per D-05/D-06 for each axis independently (D-07).
 * Sets allAxesOutOfRange per D-11: true when all non-null axes have out_of_range = true.
 * Null axes (no input data) are NOT counted as out-of-range (D-13).
 */
export function calculateFitOutputs(inputs: FitInputs): FitOutputs {
  const saddleHeight = calculateSaddleHeight(inputs);
  const saddleForeAft = calculateSaddleForeAft(inputs);
  const handlebarHeight = calculateHandlebarHeight(inputs);
  const handlebarReach = calculateHandlebarReach(inputs);

  // D-11: allAxesOutOfRange — all non-null results must have out_of_range: true
  const nonNullResults = [saddleHeight, saddleForeAft, handlebarHeight, handlebarReach].filter(
    (axis): axis is AxisOutput => axis !== null
  );

  const allAxesOutOfRange =
    nonNullResults.length > 0 && nonNullResults.every((axis) => axis.out_of_range);

  return {
    saddleHeight,
    saddleForeAft,
    handlebarHeight,
    handlebarReach,
    allAxesOutOfRange,
  };
}
