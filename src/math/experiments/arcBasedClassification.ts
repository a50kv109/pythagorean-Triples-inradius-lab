/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  DEFAULT_EXPERIMENT_TOLERANCE,
  InvalidCircleFirstInputError,
  assertPositiveFinite,
  computeCircleFirstTriangle,
  type CircleFirstTriangleRow,
} from './circleFirstClassification.ts';
import type { Point2D } from '../../types/geometry.ts';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const BOUNDARY_EPS = 1e-11;

export type DiscretizationMode = 'angular' | 'linear';

export interface ArcSampleTriangle {
  index: number;
  r: number;
  phiDeg: number; // Physical quarter-circle coordinate in (0, 90) measured from top tangency N=(r,2r) toward E=(2r,r)
  phiRad: number;
  thetaCotHalfDeg: number; // Corresponding theta = 2*phi for t = cot(theta/2)
  thetaCotHalfRad: number;
  arcLengthFromN: number; // L(phi) = r * phiRad on quarter-circle [0, pi*r/2]
  arcLengthThetaHalf: number; // r * thetaCotHalfRad
  t: number; // b / a = cot(phiRad) = cot(thetaCotHalfRad / 2)
  tangencyAB: Point2D; // T_AB = (r * (1 + sin(phi)), r * (1 + cos(phi)))
  triangle: CircleFirstTriangleRow;
  canonicalKey: string; // Congruence invariant key based on sorted legs [min(a,b), max(a,b)]
  isUniqueShape: boolean; // True for the first occurrence of each congruence class in the family
  tangencyMatchResidual: number; // |atan2(b, a) - (pi/2 - phiRad)|
}

export interface ArcDiscretizationResult {
  mode: DiscretizationMode;
  r: number;
  stepValue: number; // deg if angular, length if linear
  phiMaxDeg: number; // 90 deg
  phiMaxRad: number; // pi / 2
  arcLengthMax: number; // pi * r / 2
  effectiveAngularStepDeg: number;
  intervalCount: number; // Number of grid sub-intervals (for linear, includes final partial interval if non-integer)
  boundaryInclusivePointCount: number; // Grid points in [0, max] including endpoints
  interiorNonDegenerateCount: number; // Strictly interior points in (0, max) -> ordered right triangles
  uniqueCongruenceCount: number; // Distinct triangles modulo leg-swap symmetry (a <-> b)
  duplicateCongruenceCount: number; // interiorNonDegenerateCount - uniqueCongruenceCount
  samples: ArcSampleTriangle[];
}

export interface ArcComparisonRow {
  r: number;
  arcLengthMax: number;
  mode: DiscretizationMode;
  stepValue: number;
  effectiveAngularStepDeg: number;
  interiorNonDegenerateCount: number;
  uniqueCongruenceCount: number;
}

export function assertOpenArcAngleDeg(phiDeg: number, name = 'phiDeg'): number {
  if (typeof phiDeg !== 'number' || !Number.isFinite(phiDeg) || phiDeg <= 0 || phiDeg >= 90) {
    throw new InvalidCircleFirstInputError(
      `Expected ${name} to lie strictly inside (0, 90) degrees for a non-degenerate triangle, got ${String(phiDeg)}.`
    );
  }
  return phiDeg;
}

export function assertHalfAngleThetaDeg(thetaDeg: number, name = 'thetaDeg'): number {
  if (typeof thetaDeg !== 'number' || !Number.isFinite(thetaDeg) || thetaDeg <= 0 || thetaDeg >= 180) {
    throw new InvalidCircleFirstInputError(
      `Expected ${name} to lie strictly inside (0, 180) degrees for t = cot(theta/2), got ${String(thetaDeg)}.`
    );
  }
  return thetaDeg;
}

export function computeQuarterArcLength(r: number): number {
  const validR = assertPositiveFinite(r, 'inradius r');
  return (Math.PI * validR) / 2;
}

function buildCanonicalSignature(a: number, b: number): string {
  const minLeg = Math.min(a, b);
  const maxLeg = Math.max(a, b);
  // 10-digit precision handles float64 roundoff across symmetric reflections phi <-> 90 - phi
  return `${minLeg.toPrecision(10)}:${maxLeg.toPrecision(10)}`;
}

/**
 * Constructs a right triangle from the physical tangency point coordinate phiDeg in (0, 90)
 * along the available quarter-circle arc [N=(r,2r), E=(2r,r)] of length L_max = pi*r/2.
 *
 * Angle phi is measured clockwise from the top vertical-parallel limit N = (r, 2r) toward
 * the right horizontal-parallel limit E = (2r, r).
 * Therefore:
 *   - phi = beta (angle at vertex B)
 *   - t = b / a = cot(phi) = cot(theta / 2), where theta = 2 * phi
 *   - T_AB = (r * (1 + sin(phi)), r * (1 + cos(phi)))
 */
export function triangleFromPhysicalArcAngle(
  r: number,
  phiDeg: number,
  index = 0,
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): ArcSampleTriangle {
  const validR = assertPositiveFinite(r, 'inradius r');
  const validPhiDeg = assertOpenArcAngleDeg(phiDeg, 'phiDeg');
  const phiRad = validPhiDeg * DEG2RAD;

  // High-precision cotangent via cos / sin on (0, pi/2)
  const sinPhi = Math.sin(phiRad);
  const cosPhi = Math.cos(phiRad);
  const t = cosPhi / sinPhi;

  const triangle = computeCircleFirstTriangle(validR, t, tolerance);
  const tangencyAB: Point2D = {
    x: validR * (1 + sinPhi),
    y: validR * (1 + cosPhi),
  };

  // Verify consistency between tangency vector (T_AB - I)/r = (a/c, b/c) and phiRad
  const dx = (tangencyAB.x - validR) / validR; // a/c = cos(alpha) = sin(phi)
  const dy = (tangencyAB.y - validR) / validR; // b/c = sin(alpha) = cos(phi)
  const alphaFromTri = Math.atan2(triangle.b, triangle.a);
  const alphaFromArc = Math.atan2(dy, dx);
  const tangencyMatchResidual = Math.abs(alphaFromTri - alphaFromArc);

  const thetaCotHalfDeg = 2 * validPhiDeg;
  const thetaCotHalfRad = 2 * phiRad;

  return {
    index,
    r: validR,
    phiDeg: validPhiDeg,
    phiRad,
    thetaCotHalfDeg,
    thetaCotHalfRad,
    arcLengthFromN: validR * phiRad,
    arcLengthThetaHalf: validR * thetaCotHalfRad,
    t,
    tangencyAB,
    triangle,
    canonicalKey: buildCanonicalSignature(triangle.a, triangle.b),
    isUniqueShape: true,
    tangencyMatchResidual,
  };
}

/**
 * Direct evaluation of the Section 7 half-angle formula:
 *   t = cot(theta / 2), L(theta) = r * theta
 * Maps theta in (0, 180) deg to phi = theta / 2 in (0, 90) deg.
 * Notably, theta in (0, 90] deg corresponds to the unique non-congruent half t >= 1
 * ending at the isosceles triangle t = 1 at theta = 90 deg.
 */
export function triangleFromHalfAngleCot(
  r: number,
  thetaDeg: number,
  index = 0,
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): ArcSampleTriangle {
  const validThetaDeg = assertHalfAngleThetaDeg(thetaDeg, 'thetaDeg');
  return triangleFromPhysicalArcAngle(r, validThetaDeg / 2, index, tolerance);
}

/**
 * Experiment 1: Discretizes the available quarter-circle arc (0, 90 deg) with fixed angular step.
 * Endpoints 0 deg and 90 deg correspond to degenerate limiting configurations and are excluded.
 */
export function discretizeArcAngular(
  r: number,
  stepDeg: number,
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): ArcDiscretizationResult {
  const validR = assertPositiveFinite(r, 'inradius r');
  const validStepDeg = assertPositiveFinite(stepDeg, 'angular stepDeg');
  const phiMaxDeg = 90;
  const phiMaxRad = Math.PI / 2;
  const arcLengthMax = computeQuarterArcLength(validR);

  const ratio = phiMaxDeg / validStepDeg;
  const nearestInt = Math.round(ratio);
  const isExactDivisor = Math.abs(ratio - nearestInt) < BOUNDARY_EPS;

  const intervalCount = isExactDivisor ? nearestInt : Math.ceil(ratio - BOUNDARY_EPS);
  // When ratio is not an integer, interior points k = 1..floor(ratio) -> floor(ratio) points;
  // when ratio is exact integer K, interior points k = 1..K-1 -> K - 1 points.
  const exactInteriorCount = isExactDivisor
    ? Math.max(0, nearestInt - 1)
    : Math.max(0, Math.floor(ratio - BOUNDARY_EPS));
  const boundaryInclusivePointCount = isExactDivisor ? nearestInt + 1 : exactInteriorCount + 1;

  const seenShapes = new Set<string>();
  const samples: ArcSampleTriangle[] = [];
  let uniqueCongruenceCount = 0;

  for (let k = 1; k <= exactInteriorCount; k++) {
    const phiDeg = k * validStepDeg;
    if (phiDeg <= BOUNDARY_EPS || phiDeg >= phiMaxDeg - BOUNDARY_EPS) continue;

    const item = triangleFromPhysicalArcAngle(validR, phiDeg, k, tolerance);
    const isUnique = !seenShapes.has(item.canonicalKey);
    if (isUnique) {
      seenShapes.add(item.canonicalKey);
      uniqueCongruenceCount += 1;
    }
    item.isUniqueShape = isUnique;
    samples.push(item);
  }

  return {
    mode: 'angular',
    r: validR,
    stepValue: validStepDeg,
    phiMaxDeg,
    phiMaxRad,
    arcLengthMax,
    effectiveAngularStepDeg: validStepDeg,
    intervalCount,
    boundaryInclusivePointCount,
    interiorNonDegenerateCount: samples.length,
    uniqueCongruenceCount,
    duplicateCongruenceCount: samples.length - uniqueCongruenceCount,
    samples,
  };
}

/**
 * Experiment 2: Discretizes the available quarter-circle arc L in (0, pi*r/2) by fixed linear arc length deltaL.
 * Endpoints L = 0 and L = pi*r/2 correspond to degenerate limiting configurations and are excluded.
 */
export function discretizeArcLinear(
  r: number,
  deltaL: number,
  tolerance = DEFAULT_EXPERIMENT_TOLERANCE
): ArcDiscretizationResult {
  const validR = assertPositiveFinite(r, 'inradius r');
  const validDeltaL = assertPositiveFinite(deltaL, 'linear step deltaL');
  const phiMaxDeg = 90;
  const phiMaxRad = Math.PI / 2;
  const arcLengthMax = computeQuarterArcLength(validR);

  const ratio = arcLengthMax / validDeltaL;
  const nearestInt = Math.round(ratio);
  const isExactDivisor = Math.abs(ratio - nearestInt) < BOUNDARY_EPS;

  const intervalCount = isExactDivisor ? nearestInt : Math.ceil(ratio - BOUNDARY_EPS);
  const exactInteriorCount = isExactDivisor
    ? Math.max(0, nearestInt - 1)
    : Math.max(0, Math.floor(ratio - BOUNDARY_EPS));
  const boundaryInclusivePointCount = isExactDivisor ? nearestInt + 1 : exactInteriorCount + 1;

  const seenShapes = new Set<string>();
  const samples: ArcSampleTriangle[] = [];
  let uniqueCongruenceCount = 0;

  for (let k = 1; k <= exactInteriorCount; k++) {
    const arcLen = k * validDeltaL;
    const phiRad = arcLen / validR;
    const phiDeg = phiRad * RAD2DEG;
    if (phiDeg <= BOUNDARY_EPS || phiDeg >= phiMaxDeg - BOUNDARY_EPS) continue;

    const item = triangleFromPhysicalArcAngle(validR, phiDeg, k, tolerance);
    const isUnique = !seenShapes.has(item.canonicalKey);
    if (isUnique) {
      seenShapes.add(item.canonicalKey);
      uniqueCongruenceCount += 1;
    }
    item.isUniqueShape = isUnique;
    samples.push(item);
  }

  return {
    mode: 'linear',
    r: validR,
    stepValue: validDeltaL,
    phiMaxDeg,
    phiMaxRad,
    arcLengthMax,
    effectiveAngularStepDeg: (validDeltaL / validR) * RAD2DEG,
    intervalCount,
    boundaryInclusivePointCount,
    interiorNonDegenerateCount: samples.length,
    uniqueCongruenceCount,
    duplicateCongruenceCount: samples.length - uniqueCongruenceCount,
    samples,
  };
}

/**
 * Evaluates a summary matrix across radii and steps for either discretization mode.
 */
export function buildArcDiscretizationMatrix(
  radii: readonly number[],
  steps: readonly number[],
  mode: DiscretizationMode
): ArcComparisonRow[] {
  if (!Array.isArray(radii) || radii.length === 0 || !Array.isArray(steps) || steps.length === 0) {
    throw new InvalidCircleFirstInputError('Expected non-empty arrays for radii and steps.');
  }

  const rows: ArcComparisonRow[] = [];
  for (const r of radii) {
    for (const step of steps) {
      const res = mode === 'angular' ? discretizeArcAngular(r, step) : discretizeArcLinear(r, step);
      rows.push({
        r: res.r,
        arcLengthMax: res.arcLengthMax,
        mode,
        stepValue: step,
        effectiveAngularStepDeg: res.effectiveAngularStepDeg,
        interiorNonDegenerateCount: res.interiorNonDegenerateCount,
        uniqueCongruenceCount: res.uniqueCongruenceCount,
      });
    }
  }
  return rows;
}
