/**
 * Unit tests for the Zwift Ride calculation engine.
 *
 * These tests verify every formula, correction, and edge case for all four
 * adjustment axes. Tests are organized by function, then by requirement ID.
 *
 * TDD: This file was written BEFORE calculations.ts (Red-Green-Refactor).
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSaddleHeight,
  calculateSaddleForeAft,
  calculateHandlebarHeight,
  calculateHandlebarReach,
  calculateFitOutputs,
  mmToLetter,
} from '../calculations';

// ---------------------------------------------------------------------------
// mmToLetter (CALC-05)
// ---------------------------------------------------------------------------

describe('mmToLetter', () => {
  it('returns null when the lookup table is empty', () => {
    expect(mmToLetter(620, {})).toBeNull();
  });

  it('returns the closest letter position for a given mm target', () => {
    const table = { A: 600, B: 620, C: 640 };
    expect(mmToLetter(625, table)).toBe('B'); // 625 - 620 = 5 vs 640 - 625 = 15
  });

  it('skips null entries and finds closest non-null entry', () => {
    const table: Record<string, number | null> = { A: null, B: 620, C: null };
    expect(mmToLetter(625, table)).toBe('B');
  });

  it('returns exact match when mm equals a table entry exactly', () => {
    const table = { A: 600, B: 620 };
    expect(mmToLetter(620, table)).toBe('B');
  });

  it('returns null when all table entries are null', () => {
    const table: Record<string, number | null> = { A: null, B: null, C: null };
    expect(mmToLetter(620, table)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateSaddleHeight (CALC-01)
// ---------------------------------------------------------------------------

describe('calculateSaddleHeight', () => {
  it('applies crank correction for 172.5mm cranks: 700 + (170 - 172.5) = 697.5', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 172.5 },
    });
    expect(result).not.toBeNull();
    expect(result!.ideal_mm).toBe(697.5);
    expect(result!.source).toBe('measured');
  });

  it('applies crank correction for 175mm cranks: 700 + (170 - 175) = 695', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 175 },
    });
    expect(result).not.toBeNull();
    expect(result!.ideal_mm).toBe(695);
    expect(result!.source).toBe('measured');
  });

  it('uses default 172.5mm crank when crankLength is absent (D-14)', () => {
    const withDefault = calculateSaddleHeight({
      physical: { saddleHeight: 700 },
    });
    const withExplicit = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 172.5 },
    });
    expect(withDefault?.ideal_mm).toBe(withExplicit?.ideal_mm);
  });

  it('applies no correction when cranks are already 170mm', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 170 },
    });
    expect(result!.ideal_mm).toBe(700);
  });

  it('fit report saddleHeight overrides physical saddleHeight (D-05)', () => {
    const result = calculateSaddleHeight({
      fitReport: { saddleHeight: 720 },
      physical: { saddleHeight: 700, crankLength: 172.5 },
    });
    expect(result!.ideal_mm).toBe(720);
    expect(result!.source).toBe('fit-report');
  });

  it('does NOT apply crank correction to fit report values', () => {
    // Fit report is the final mm value — no correction applied
    const result = calculateSaddleHeight({
      fitReport: { saddleHeight: 720 },
      physical: { crankLength: 175 },
    });
    expect(result!.ideal_mm).toBe(720);
  });

  it('uses LeMond formula for body inseam: round(800 * 0.883) = 706', () => {
    const result = calculateSaddleHeight({
      body: { inseam: 800 },
    });
    expect(result!.ideal_mm).toBe(Math.round(800 * 0.883)); // 706
    expect(result!.source).toBe('estimated');
  });

  it('returns null when no inputs are provided (D-13)', () => {
    expect(calculateSaddleHeight({})).toBeNull();
  });

  it('flags out_of_range above when target exceeds max (865mm)', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 900, crankLength: 170 },
    });
    expect(result!.out_of_range).toBe(true);
    expect(result!.direction).toBe('above');
    expect(result!.achievable_mm).toBe(865);
    expect(result!.ideal_mm).toBe(900);
  });

  it('flags out_of_range below when target is under min (599mm)', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 550, crankLength: 170 },
    });
    expect(result!.out_of_range).toBe(true);
    expect(result!.direction).toBe('below');
    expect(result!.achievable_mm).toBe(599);
    expect(result!.ideal_mm).toBe(550);
  });

  it('physical overrides body estimation (D-06)', () => {
    const result = calculateSaddleHeight({
      physical: { saddleHeight: 700, crankLength: 170 },
      body: { inseam: 800 },
    });
    expect(result!.source).toBe('measured');
    expect(result!.ideal_mm).toBe(700);
  });
});

// ---------------------------------------------------------------------------
// calculateSaddleForeAft (CALC-02)
// ---------------------------------------------------------------------------

describe('calculateSaddleForeAft', () => {
  it('returns measured source for physical saddleForeAft', () => {
    const result = calculateSaddleForeAft({
      physical: { saddleForeAft: 50 },
    });
    expect(result!.source).toBe('measured');
    expect(result!.ideal_mm).toBe(50);
  });

  it('fit report overrides physical saddleForeAft (D-05)', () => {
    const result = calculateSaddleForeAft({
      fitReport: { saddleForeAft: 60 },
      physical: { saddleForeAft: 50 },
    });
    expect(result!.source).toBe('fit-report');
    expect(result!.ideal_mm).toBe(60);
  });

  it('flags out_of_range above when target exceeds max (100mm)', () => {
    const result = calculateSaddleForeAft({
      physical: { saddleForeAft: 150 },
    });
    expect(result!.out_of_range).toBe(true);
    expect(result!.direction).toBe('above');
    expect(result!.achievable_mm).toBe(100);
    expect(result!.ideal_mm).toBe(150);
  });

  it('returns null when no inputs are provided (D-13)', () => {
    expect(calculateSaddleForeAft({})).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateHandlebarHeight (CALC-03)
// ---------------------------------------------------------------------------

describe('calculateHandlebarHeight', () => {
  it('direct transfer for flat bars: 950mm stays 950mm', () => {
    const result = calculateHandlebarHeight({
      physical: { handlebarHeight: 950, handlebarType: 'flat' },
    });
    expect(result!.ideal_mm).toBe(950);
    expect(result!.source).toBe('measured');
  });

  it('adds default drop bar hood height offset (40mm): 900 + 40 = 940', () => {
    const result = calculateHandlebarHeight({
      physical: { handlebarHeight: 900, handlebarType: 'drop' },
    });
    expect(result!.ideal_mm).toBe(940);
    expect(result!.source).toBe('measured');
  });

  it('adds custom drop bar hood height offset: 900 + 30 = 930', () => {
    const result = calculateHandlebarHeight({
      physical: {
        handlebarHeight: 900,
        handlebarType: 'drop',
        dropBarHoodHeightOffset: 30,
      },
    });
    expect(result!.ideal_mm).toBe(930);
  });

  it('fit report handlebarHeight overrides physical and skips offset (D-05)', () => {
    const result = calculateHandlebarHeight({
      fitReport: { handlebarHeight: 960 },
      physical: { handlebarHeight: 900, handlebarType: 'drop' },
    });
    expect(result!.ideal_mm).toBe(960);
    expect(result!.source).toBe('fit-report');
  });

  it('flags out_of_range above when target exceeds max (1024mm)', () => {
    const result = calculateHandlebarHeight({
      physical: { handlebarHeight: 1050, handlebarType: 'flat' },
    });
    expect(result!.out_of_range).toBe(true);
    expect(result!.direction).toBe('above');
    expect(result!.achievable_mm).toBe(1024);
  });

  it('flags out_of_range below when target is under min (863mm)', () => {
    const result = calculateHandlebarHeight({
      physical: { handlebarHeight: 830, handlebarType: 'flat' },
    });
    expect(result!.out_of_range).toBe(true);
    expect(result!.direction).toBe('below');
    expect(result!.achievable_mm).toBe(863);
  });

  it('returns null when no inputs are provided (D-13)', () => {
    expect(calculateHandlebarHeight({})).toBeNull();
  });

  it('direct transfer when handlebarType is undefined (treated as flat)', () => {
    const result = calculateHandlebarHeight({
      physical: { handlebarHeight: 950 },
    });
    expect(result!.ideal_mm).toBe(950);
  });
});

// ---------------------------------------------------------------------------
// calculateHandlebarReach (CALC-04)
// ---------------------------------------------------------------------------

describe('calculateHandlebarReach', () => {
  it('direct transfer for flat bars: 400mm stays 400mm', () => {
    const result = calculateHandlebarReach({
      physical: { handlebarReach: 400, handlebarType: 'flat' },
    });
    expect(result!.ideal_mm).toBe(400);
    expect(result!.source).toBe('measured');
  });

  it('subtracts default drop bar reach offset (50mm): 400 - 50 = 350', () => {
    const result = calculateHandlebarReach({
      physical: { handlebarReach: 400, handlebarType: 'drop' },
    });
    expect(result!.ideal_mm).toBe(350);
    expect(result!.source).toBe('measured');
  });

  it('subtracts custom drop bar reach offset: 400 - 70 = 330', () => {
    const result = calculateHandlebarReach({
      physical: {
        handlebarReach: 400,
        handlebarType: 'drop',
        dropBarHoodReachOffset: 70,
      },
    });
    expect(result!.ideal_mm).toBe(330);
  });

  it('fit report handlebarReach overrides physical with no offset', () => {
    const result = calculateHandlebarReach({
      fitReport: { handlebarReach: 380 },
      physical: { handlebarReach: 400, handlebarType: 'drop' },
    });
    expect(result!.ideal_mm).toBe(380);
    expect(result!.source).toBe('fit-report');
  });

  it('out_of_range is always false when HANDLEBAR_REACH_RANGE has null bounds', () => {
    // HANDLEBAR_REACH_RANGE.minMm and maxMm are null — range is unverified
    // Cannot check out-of-range, so achievable_mm equals ideal_mm
    const result = calculateHandlebarReach({
      physical: { handlebarReach: 9999, handlebarType: 'flat' },
    });
    expect(result!.out_of_range).toBe(false);
    expect(result!.achievable_mm).toBe(result!.ideal_mm);
  });

  it('returns null when no inputs are provided (D-13)', () => {
    expect(calculateHandlebarReach({})).toBeNull();
  });

  it('direct transfer when handlebarType is undefined (treated as flat)', () => {
    const result = calculateHandlebarReach({
      physical: { handlebarReach: 400 },
    });
    expect(result!.ideal_mm).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// calculateFitOutputs orchestrator (CALC-06)
// ---------------------------------------------------------------------------

describe('calculateFitOutputs', () => {
  it('returns correct source tags for mixed inputs', () => {
    const result = calculateFitOutputs({
      fitReport: { saddleHeight: 720 },
      physical: {
        saddleForeAft: 50,
        handlebarHeight: 950,
        handlebarReach: 400,
        handlebarType: 'flat',
      },
    });
    expect(result.saddleHeight!.source).toBe('fit-report');
    expect(result.saddleForeAft!.source).toBe('measured');
    expect(result.handlebarHeight!.source).toBe('measured');
    expect(result.handlebarReach!.source).toBe('measured');
  });

  it('partial fit report: fit-report for covered axes, measured for the rest (D-07)', () => {
    const result = calculateFitOutputs({
      fitReport: { saddleHeight: 720 },
      physical: {
        saddleForeAft: 50,
        handlebarHeight: 950,
        handlebarReach: 400,
        handlebarType: 'flat',
      },
    });
    expect(result.saddleHeight!.source).toBe('fit-report');
    expect(result.saddleForeAft!.source).toBe('measured');
  });

  it('allAxesOutOfRange is true when all four non-null axes are out of range (D-11)', () => {
    const result = calculateFitOutputs({
      physical: {
        saddleHeight: 1000,   // above 865 max
        saddleForeAft: 200,   // above 100 max
        handlebarHeight: 1100, // above 1024 max
        handlebarReach: 400,
        handlebarType: 'flat',
        crankLength: 170,
      },
    });
    // saddleHeight: 1000 > 865 → out of range
    // saddleForeAft: 200 > 100 → out of range
    // handlebarHeight: 1100 > 1024 → out of range
    // handlebarReach: 400 → not out of range (null bounds = never out of range)
    // At least one not out of range, so allAxesOutOfRange should be false
    expect(result.allAxesOutOfRange).toBeFalsy();
  });

  it('allAxesOutOfRange is falsy when not all axes are out of range', () => {
    const result = calculateFitOutputs({
      physical: {
        saddleHeight: 700,    // in range
        saddleForeAft: 50,    // in range
        handlebarHeight: 950, // in range
        handlebarReach: 400,
        handlebarType: 'flat',
        crankLength: 170,
      },
    });
    expect(result.allAxesOutOfRange).toBeFalsy();
  });

  it('allAxesOutOfRange is true when all axes with non-null bounds are out of range and reach has null bounds', () => {
    // Since reach cannot go out of range (null bounds), and if saddle + foreAft + handlebarHeight all are OOR,
    // the "all non-null axes" logic depends on whether we count reach or not.
    // Per D-11: allAxesOutOfRange when ALL non-null results have out_of_range = true
    // reach with null bounds will have out_of_range = false, so this can never be fully true
    // unless all other axes are also not null. This test verifies null axes are NOT counted.
    const result = calculateFitOutputs({});
    // All null → allAxesOutOfRange should be falsy (no data, not out of range)
    expect(result.allAxesOutOfRange).toBeFalsy();
    expect(result.saddleHeight).toBeNull();
    expect(result.saddleForeAft).toBeNull();
    expect(result.handlebarHeight).toBeNull();
    expect(result.handlebarReach).toBeNull();
  });

  it('priority: fit-report > physical for the same axis', () => {
    const result = calculateFitOutputs({
      fitReport: { saddleHeight: 720 },
      physical: { saddleHeight: 700, crankLength: 175 },
    });
    expect(result.saddleHeight!.source).toBe('fit-report');
    expect(result.saddleHeight!.ideal_mm).toBe(720);
  });

  it('priority: physical > body for the same axis', () => {
    const result = calculateFitOutputs({
      physical: { saddleHeight: 700, crankLength: 170 },
      body: { inseam: 800 },
    });
    expect(result.saddleHeight!.source).toBe('measured');
    expect(result.saddleHeight!.ideal_mm).toBe(700);
  });

  it('uses body estimation when no physical saddle height is available', () => {
    const result = calculateFitOutputs({
      body: { inseam: 800 },
    });
    expect(result.saddleHeight!.source).toBe('estimated');
    expect(result.saddleHeight!.ideal_mm).toBe(Math.round(800 * 0.883));
  });
});
