/**
 * Zod v4 validation schemas for all Zwift Ride Fitting Assistant measurement inputs.
 *
 * These schemas enforce valid measurement ranges for each input group.
 * They are used by Phase 2 form validation (React Hook Form + @hookform/resolvers).
 *
 * Schema hierarchy:
 *   fitInputsSchema (top-level)
 *   ├── fitReportSchema
 *   ├── physicalMeasurementsSchema
 *   ├── bodyMeasurementsSchema
 *   └── frameGeometrySchema
 */

import { z } from 'zod';

/**
 * Validates fit report values (highest priority inputs).
 * All values in mm — positive number only (measurement must be positive distance).
 */
export const fitReportSchema = z.object({
  saddleHeight: z.number().positive().optional(),
  saddleForeAft: z.number().positive().optional(),
  handlebarHeight: z.number().positive().optional(),
  handlebarReach: z.number().positive().optional(),
});

/**
 * Validates direct physical measurements from user's road bike.
 * Ranges cover all realistic road/gravel/triathlon bike configurations.
 * All values in mm except handlebarType (enum).
 */
export const physicalMeasurementsSchema = z.object({
  /** Saddle height in mm — reasonable range for any road cyclist */
  saddleHeight: z.number().min(400).max(1000).optional(),
  /** Saddle fore/aft horizontal offset in mm */
  saddleForeAft: z.number().min(0).max(200).optional(),
  /** Handlebar height (floor to bar center) in mm */
  handlebarHeight: z.number().min(600).max(1200).optional(),
  /** Handlebar reach (saddle nose to hand contact) in mm */
  handlebarReach: z.number().min(200).max(800).optional(),
  /** Crank length in mm — covers all production crank sizes (140–200mm) */
  crankLength: z.number().min(140).max(200).optional(),
  /** Handlebar type — determines whether hood offsets are applied */
  handlebarType: z.enum(['drop', 'flat']).optional(),
  /** Drop bar hood height offset from bar clamp center in mm */
  dropBarHoodHeightOffset: z.number().min(0).max(100).optional(),
  /** Drop bar hood reach offset from bar clamp center in mm */
  dropBarHoodReachOffset: z.number().min(0).max(150).optional(),
});

/**
 * Validates body measurements for estimation fallback (D-12).
 * All values in mm. Ranges cover adult human variation.
 */
export const bodyMeasurementsSchema = z.object({
  /** Inseam in mm (floor to crotch, standing, no shoes) */
  inseam: z.number().min(500).max(1100).optional(),
  /** Torso length in mm (C7 vertebra to sacrum) */
  torso: z.number().min(300).max(800).optional(),
  /** Arm length in mm (shoulder to wrist) */
  arm: z.number().min(400).max(900).optional(),
});

/**
 * Validates frame geometry inputs from manufacturer spec (lowest priority source).
 * All values in mm except seatTubeAngle (degrees).
 */
export const frameGeometrySchema = z.object({
  /** Stack in mm (BB center to head tube top, vertical) */
  stack: z.number().min(400).max(700).optional(),
  /** Reach in mm (BB center to head tube top-center, horizontal) */
  reach: z.number().min(350).max(450).optional(),
  /** Seat tube angle in degrees */
  seatTubeAngle: z.number().min(70).max(80).optional(),
});

/**
 * Top-level schema combining all four input groups.
 * All groups are optional — the engine handles missing groups via priority fallback (D-06).
 * Use this schema to validate the full FitInputs object before passing to the calculation engine.
 */
export const fitInputsSchema = z.object({
  fitReport: fitReportSchema.optional(),
  physical: physicalMeasurementsSchema.optional(),
  body: bodyMeasurementsSchema.optional(),
  frame: frameGeometrySchema.optional(),
});
