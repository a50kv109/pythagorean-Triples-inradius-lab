/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { calculateFourCircles } from '../FourCirclesModel.ts';
import type { FourCirclesCalculations } from '../../types/geometry.ts';

const RAD2DEG = 180 / Math.PI;
export const DEFAULT_EXPERIMENT_TOLERANCE = 1e-12;

export class InvalidCircleFirstInputError extends RangeError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCircleFirstInputError';
  }
}

export class CircleFirstComputationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircleFirstComputationError';
  }
}

export interface CircleFirstResidualCheck {
  pythagoreanResidualAbs: number;
  pythagoreanResidualRel: number;
  incircleEqResidualAbs: number;
  incircleEqResidualRel: number;
  incircleStableResidualAbs: number;
  incircleStableResidualRel: number;
  ratioResidualRel: number;
  angleSumResidualDeg: number;
  tolerance: number;
  isValid: boolean;
  failureReasons: string[];
}

export interface CircleFirstTriangleRow {
  rInput: number;
  tInput: number;
  a: number;
  b: number;
  c: number;
  alphaRad: number;
  alphaDeg: number;
  betaRad: number;
  betaDeg: number;
  area: number;
  perimeter: number;
  semiPerimeter: number;
  rRecoveredDirect: number; // (a + b - c) / 2
  rRecoveredStable: number; // ab / (a + b + c)
  residuals: CircleFirstResidualCheck;
}

export interface CircleFirstGeometricPassport {
  classRadius: number;
  shapeIndex: number;
  dualShapeIndex: number; // 1 / t
  triangle: CircleFirstTriangleRow;
  fourCircles: FourCirclesCalculations;
  circleAreas: {
    Ka: number;
    Kb: number;
    Kc: number;
    Ki: number;
    Ko: number;
  };
  coreSqrtIdentityResidualRel: number;
}

export interface NaivePreambleFormulaResult {
  a: number;
  b: number;
  c: number;
  pythagoreanResidualAbs: number;
  incircleEqResidualAbs: number;
}

export function assertPositiveFinite(value: number, name: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new InvalidCircleFirstInputError(
      `Expected ${name} to be a strictly positive finite number, got ${String(value)}.`
    );
  }
  return value;
}

/**
 * Inverse map Psi(r, t) -> (a, b, c) derived algebraically from:
 *   (1) a^2 + b^2 = c^2
 *   (2) a + b - c = 2r
 *   (3) t = b / a
 *
 * Rationalized cancellation-free closed form:
 *   a(r, t) = r * (1 + t + sqrt(1 + t^2)) / t = r * (1 + (1 + hypot(1, t)) / t)
 *   b(r, t) = r * (1 + t + sqrt(1 + t^2))
 *   c(r, t) = hypot(a, b) = a * hypot(1, t)
 */
export function computeCircleFirstTriangle(
  r: number,
  t: number,
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): CircleFirstTriangleRow {
  const validR = assertPositiveFinite(r, 'inradius r');
  const validT = assertPositiveFinite(t, 'shape ratio t = b/a');
  const validTol = assertPositiveFinite(tolerance, 'tolerance');

  const hypUnit = Math.hypot(1, validT); // sqrt(1 + t^2)
  const scaleFactor = 1 + validT + hypUnit;

  // Cancellation-free evaluation for all t > 0
  const a = validR * (1 + (1 + hypUnit) / validT);
  const b = validR * scaleFactor;
  const c = Math.hypot(a, b);

  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a <= 0 || b <= 0 || c <= 0) {
    throw new CircleFirstComputationError(
      `Computed triangle sides are not strictly positive finite numbers for r=${validR}, t=${validT}: a=${a}, b=${b}, c=${c}`
    );
  }

  const alphaRad = Math.atan2(b, a);
  const alphaDeg = alphaRad * RAD2DEG;
  const betaRad = Math.atan2(a, b);
  const betaDeg = betaRad * RAD2DEG;

  const perimeter = a + b + c;
  const semiPerimeter = perimeter / 2;
  const area = 0.5 * a * b;

  const rRecoveredDirect = (a + b - c) / 2;
  const rRecoveredStable = (a / perimeter) * b;

  const residuals = verifyCircleFirstResiduals(
    { r: validR, t: validT, a, b, c, alphaDeg, betaDeg, rRecoveredStable },
    validTol
  );

  return {
    rInput: validR,
    tInput: validT,
    a,
    b,
    c,
    alphaRad,
    alphaDeg,
    betaRad,
    betaDeg,
    area,
    perimeter,
    semiPerimeter,
    rRecoveredDirect,
    rRecoveredStable,
    residuals,
  };
}

/**
 * Unrationalized subtractive form a = 2r / (1 + t - sqrt(1 + t^2)) kept only
 * to benchmark floating-point cancellation against computeCircleFirstTriangle.
 */
export function computeDirectSubtractionLegs(r: number, t: number): { a: number; b: number; c: number } {
  const validR = assertPositiveFinite(r, 'inradius r');
  const validT = assertPositiveFinite(t, 'shape ratio t');
  const denom = 1 + validT - Math.hypot(1, validT);
  const a = (2 * validR) / denom;
  const b = validT * a;
  const c = Math.hypot(a, b);
  return { a, b, c };
}

/**
 * Evaluates the erroneous unverified formula mentioned in pre-experiment notes:
 *   a = r*(1+t)/sqrt(t), b = r*(1+t)*sqrt(t), c = r*(1+t^2)/sqrt(t)
 * Used exclusively to demonstrate why it violates a^2 + b^2 = c^2 and a + b - c = 2r.
 */
export function evaluateErroneousPreambleFormula(r: number, t: number): NaivePreambleFormulaResult {
  const validR = assertPositiveFinite(r, 'inradius r');
  const validT = assertPositiveFinite(t, 'shape ratio t');
  const sqrtT = Math.sqrt(validT);
  const a = (validR * (1 + validT)) / sqrtT;
  const b = validR * (1 + validT) * sqrtT;
  const c = (validR * (1 + validT * validT)) / sqrtT;

  return {
    a,
    b,
    c,
    pythagoreanResidualAbs: Math.abs(a * a + b * b - c * c),
    incircleEqResidualAbs: Math.abs((a + b - c) - 2 * validR),
  };
}

export function verifyCircleFirstResiduals(
  params: {
    r: number;
    t: number;
    a: number;
    b: number;
    c: number;
    alphaDeg: number;
    betaDeg: number;
    rRecoveredStable: number;
  },
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): CircleFirstResidualCheck {
  const { r, t, a, b, c, alphaDeg, betaDeg, rRecoveredStable } = params;
  const failureReasons: string[] = [];

  const pythagoreanResidualAbs = Math.abs(a * a + b * b - c * c);
  const unitA = a / c;
  const unitB = b / c;
  const pythagoreanResidualRel = Math.abs(unitA * unitA + unitB * unitB - 1);

  const incircleEqResidualAbs = Math.abs((a + b - c) - 2 * r);
  const incircleEqResidualRel = incircleEqResidualAbs / (2 * r);

  const incircleStableResidualAbs = Math.abs(rRecoveredStable - r);
  const incircleStableResidualRel = incircleStableResidualAbs / r;

  const ratioResidualRel = Math.abs(b / a - t) / t;
  const angleSumResidualDeg = Math.abs(alphaDeg + betaDeg - 90);

  if (!Number.isFinite(pythagoreanResidualRel) || pythagoreanResidualRel > tolerance) {
    failureReasons.push(`Pythagorean relative residual ${pythagoreanResidualRel} exceeds ${tolerance}`);
  }
  if (!Number.isFinite(incircleStableResidualRel) || incircleStableResidualRel > tolerance) {
    failureReasons.push(`Stable inradius relative residual ${incircleStableResidualRel} exceeds ${tolerance}`);
  }
  if (!Number.isFinite(ratioResidualRel) || ratioResidualRel > tolerance) {
    failureReasons.push(`Ratio t = b/a relative residual ${ratioResidualRel} exceeds ${tolerance}`);
  }
  if (!Number.isFinite(angleSumResidualDeg) || angleSumResidualDeg > tolerance * 100) {
    failureReasons.push(`Angle sum residual ${angleSumResidualDeg} deg exceeds ${tolerance * 100}`);
  }

  return {
    pythagoreanResidualAbs,
    pythagoreanResidualRel,
    incircleEqResidualAbs,
    incircleEqResidualRel,
    incircleStableResidualAbs,
    incircleStableResidualRel,
    ratioResidualRel,
    angleSumResidualDeg,
    tolerance,
    isValid: failureReasons.length === 0,
    failureReasons,
  };
}

/**
 * Computes a complete family table for a fixed inradius r across a list of shape ratios t.
 */
export function generateCircleFirstFamilyTable(
  r: number,
  tValues: readonly number[],
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): CircleFirstTriangleRow[] {
  assertPositiveFinite(r, 'inradius r');
  if (!Array.isArray(tValues) || tValues.length === 0) {
    throw new InvalidCircleFirstInputError('Expected a non-empty array of t values.');
  }

  return tValues.map((t) => computeCircleFirstTriangle(r, t, tolerance));
}

/**
 * Forward map Phi(a, b) -> (r, t) from triangle legs back to circle-first coordinates.
 */
export function forwardClassifyFromLegs(a: number, b: number): { r: number; t: number } {
  const validA = assertPositiveFinite(a, 'leg a');
  const validB = assertPositiveFinite(b, 'leg b');
  const c = Math.hypot(validA, validB);
  const r = (validA / (validA + validB + c)) * validB;
  const t = validB / validA;
  return { r, t };
}

/**
 * Builds a complete geometric passport in the Pythagoras-Circles-Lab hierarchy:
 *   Class (r = const) -> Shape Index (t = b/a) -> Triangle + Five Circles Passport
 */
export function buildCircleFirstGeometricPassport(
  r: number,
  t: number,
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): CircleFirstGeometricPassport {
  const triangle = computeCircleFirstTriangle(r, t, tolerance);
  const fourCircles = calculateFourCircles(triangle.a, triangle.b);

  const circleAreas = {
    Ka: fourCircles.circleA.area,
    Kb: fourCircles.circleB.area,
    Kc: fourCircles.circleC.area,
    Ki: fourCircles.incircle.area,
    Ko: fourCircles.circumcircle.area,
  };

  const coreSqrtIdentityResidualRel =
    fourCircles.identityResidualAbs / Math.max(1e-300, fourCircles.sqrtSumLegs);

  return {
    classRadius: triangle.rInput,
    shapeIndex: triangle.tInput,
    dualShapeIndex: 1 / triangle.tInput,
    triangle,
    fourCircles,
    circleAreas,
    coreSqrtIdentityResidualRel,
  };
}
