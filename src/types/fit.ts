/**
 * Type definitions for the Zwift Ride Fitting Assistant calculation engine.
 *
 * These contracts are the foundation for all calculation functions in src/lib/calculations.ts.
 * Every input shape and output shape used by the engine is defined here.
 *
 * Decisions encoded:
 * - D-03: All 4 axes use the letter system (A–Z)
 * - D-08: Each output is tagged with its source
 * - D-09/D-10: Out-of-range output shape
 * - D-11: allAxesOutOfRange error state
 */

/**
 * Source of a calculated output value.
 * Priority order (highest → lowest): fit-report > measured > derived > estimated
 * Per D-06 / D-08.
 */
export type InputSource = 'fit-report' | 'measured' | 'derived' | 'estimated';

/**
 * Handlebar type determines whether hood offsets must be applied
 * to reach and height calculations (CALC-03, CALC-04).
 */
export type HandlebarType = 'drop' | 'flat';

/**
 * All possible input measurement groups.
 * The engine applies priority per D-05/D-06 — fit report values win for any axis they cover.
 */
export interface FitInputs {
  /**
   * Values from a professional bike fit report (highest priority — D-05).
   * All values in mm. Reference: BB center for saddle height; floor for handlebar height.
   */
  fitReport?: {
    /** mm, BB center to saddle top */
    saddleHeight?: number;
    /** mm, horizontal from BB center to saddle nose */
    saddleForeAft?: number;
    /** mm, floor to bar center (for drop bar users: hood height) */
    handlebarHeight?: number;
    /** mm, horizontal from saddle nose to hand contact point */
    handlebarReach?: number;
  };

  /**
   * Direct physical measurements from user's road bike (second priority — D-06).
   * All values in mm.
   */
  physical?: {
    /** mm, BB center to saddle top */
    saddleHeight?: number;
    /** mm, horizontal from BB center to saddle nose */
    saddleForeAft?: number;
    /** mm, floor to bar center */
    handlebarHeight?: number;
    /** mm, horizontal reach to hand contact point */
    handlebarReach?: number;
    /**
     * mm — defaults to 172.5mm if absent (D-14).
     * Used for crank length correction in saddle height calculation (CALC-01).
     */
    crankLength?: number;
    /** Handlebar type — required to apply hood offsets for drop bar users (CALC-03, CALC-04) */
    handlebarType?: HandlebarType;
    /**
     * mm, how much lower hoods sit below bar clamp center.
     * Used when handlebarType is 'drop' and user measured hood-to-floor height.
     * Default estimate: 40mm.
     */
    dropBarHoodHeightOffset?: number;
    /**
     * mm, how much further forward hoods sit vs bar clamp center.
     * Used when handlebarType is 'drop' and user measured saddle-nose-to-bar-clamp reach.
     * Default estimate: 50mm.
     */
    dropBarHoodReachOffset?: number;
  };

  /**
   * Body measurements for estimation fallback (D-12).
   * All values in mm.
   */
  body?: {
    /** mm, floor to crotch (standing, no shoes) */
    inseam?: number;
    /** mm, C7 vertebra to sacrum */
    torso?: number;
    /** mm, shoulder to wrist */
    arm?: number;
  };

  /**
   * Frame geometry from manufacturer spec (lowest priority — D-06, D-13).
   * Used as derivation path when no direct measurements or body measurements available.
   */
  frame?: {
    /** mm, BB center to head tube top (vertical) */
    stack?: number;
    /** mm, BB center to head tube top-center (horizontal) */
    reach?: number;
    /** degrees, seat tube angle */
    seatTubeAngle?: number;
  };
}

/**
 * Output shape for a single adjustment axis.
 * Per D-09, D-10: always returns both ideal and achievable targets.
 * Per D-08: always tagged with source.
 * Per D-03: always includes letter_position (or null if lookup table is unmeasured).
 */
export interface AxisOutput {
  /** The calculated target in mm before clamping to hardware range */
  ideal_mm: number;
  /** The achievable mm value clamped to hardware range. Equals ideal_mm when in range. */
  achievable_mm: number;
  /**
   * The Zwift Ride letter position (A–Z) closest to achievable_mm.
   * null when the lookup table has no measured entries (UNVERIFIED hardware data gap).
   */
  letter_position: string | null;
  /** true when ideal_mm falls outside hardware range */
  out_of_range: boolean;
  /**
   * Direction of out-of-range exceedance.
   * Only present when out_of_range is true (D-10).
   */
  direction?: 'above' | 'below';
  /** Which input source produced this output value (D-08) */
  source: InputSource;
  /**
   * Confidence level of this output.
   * 'low' when letter_position is null (hardware mapping unverified).
   * 'medium' when derived from body measurements or unverified constants.
   * 'high' when from fit report or direct measurement with verified lookup.
   */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Output for all four Zwift Ride adjustment axes.
 * null for any axis means no input data was available for that axis (D-13).
 * Per D-11: allAxesOutOfRange is set when the Zwift Ride cannot achieve this position at all.
 */
export interface FitOutputs {
  saddleHeight: AxisOutput | null;
  saddleForeAft: AxisOutput | null;
  handlebarHeight: AxisOutput | null;
  handlebarReach: AxisOutput | null;
  /**
   * true when all four non-null axes have out_of_range: true.
   * Output layer should display an error state, not individual warnings (D-11).
   */
  allAxesOutOfRange?: boolean;
}
