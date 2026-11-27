/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { assertPositiveFinite, computeCircleFirstTriangle } from './circleFirstClassification.ts';
import {
  discretizeArcAngular,
  discretizeArcLinear,
  triangleFromPhysicalArcAngle,
} from './arcBasedClassification.ts';
import type { Point2D } from '../../types/geometry.ts';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const BOUNDARY_TOL = 1e-12;

export interface TangentLineEquation {
  coeffX: number; // sin(alpha)
  coeffY: number; // cos(alpha)
  rhs: number; // r * (1 + sin(alpha) + cos(alpha))
  formatted: string; // e.g. "0.5000x + 0.8660y = 2.3660"
  slope: number | null; // -tan(alpha), or null if vertical (alpha = 90 deg)
  distanceFromCenter: number; // verified distance from I=(r,r) to tangent line (must equal r)
}

export interface GeometricValidationRow {
  r: number;
  alphaDeg: number; // Physical central angle of tangency point T_AB measured from N=(r,2r) clockwise toward E=(2r,r)
  alphaRad: number;
  phiExp02Deg: number; // Parameter phi from Experiment 02 (proven identical to alphaDeg)
  thetaExp02Deg: number; // Parameter theta = 2 * alphaDeg from Experiment 02 cot(theta/2) formula
  arcLengthActual: number; // True geometric arc length L = r * alphaRad
  arcLengthIfUsingTheta: number; // Counter-check r * thetaRad (2x actual arc length!)
  tangencyPoint: Point2D; // T = (r*(1 + sin(alpha)), r*(1 + cos(alpha)))
  circleDistanceResidual: number; // ||T - I| - r|
  tangentLine: TangentLineEquation;
  isDegenerate: boolean;
  degeneracyReason: string | null;
  // Non-degenerate triangle values (null at alpha = 0 or 90 deg)
  vertexA: Point2D | null; // (0, a)
  vertexB: Point2D | null; // (b, 0)
  a: number | null;
  b: number | null;
  c: number | null;
  ratioT: number | null; // b / a
  angleADeg: number | null; // angle at A = 90 - alpha
  angleBDeg: number | null; // angle at B = alpha
  rActualDirect: number | null; // (a + b - c) / 2
  rActualStable: number | null; // ab / (a + b + c)
  pythagoreanResidualAbs: number | null; // |a^2 + b^2 - c^2|
  incircleEqResidualAbs: number | null; // |(a + b - c) - 2r|
  matchesExp01FormulaDiff: number | null; // max(|a - a_exp01|, |b - b_exp01|, |c - c_exp01|)
  matchesExp02PhiDiff: number | null; // |arcLengthActual - exp02.arcLengthFromN|
}

export interface DiscretizationComparisonEntry {
  mode: 'angular' | 'linear';
  r: number;
  arcLengthMax: number;
  stepLabel: string;
  stepValue: number;
  effectiveAngularStepDeg: number;
  intervalCount: number;
  boundaryPointCount: number;
  interiorOrderedCount: number;
  uniqueCongruenceCount: number;
  symmetricDuplicatesCount: number;
}

/**
 * Pure geometric validation from circle + tangent line at physical central angle alphaDeg in [0, 90]:
 *   1. Place incircle K_i of radius r at I = (r, r), fixed legs on x = 0 and y = 0.
 *   2. Place tangency point T(alpha) on the first-quadrant quarter-circle arc [N=(r,2r), E=(2r,r)]:
 *        T(alpha) = (r * (1 + sin(alpha)), r * (1 + cos(alpha)))
 *      so alpha = 0 deg is N=(r, 2r) and alpha = 90 deg is E=(2r, r).
 *   3. Construct the tangent line orthogonal to radius vector (T - I) directly.
 *   4. Compute arc length L = r * alpha (rad).
 *   5. Intersect the tangent line with fixed legs x = 0 and y = 0 to get A=(0,a) and B=(b,0),
 *      compute c = |A - B| and verify a^2+b^2=c^2, a+b-c=2r, and match with Experiment 01/02.
 */
export function validateTangentGeometryAtAngle(r: number, alphaDeg: number): GeometricValidationRow {
  const validR = assertPositiveFinite(r, 'inradius r');
  if (typeof alphaDeg !== 'number' || !Number.isFinite(alphaDeg) || alphaDeg < 0 || alphaDeg > 90) {
    throw new RangeError(`Expected alphaDeg in [0, 90], got ${String(alphaDeg)}`);
  }

  const alphaRad = alphaDeg * DEG2RAD;
  const sinA = Math.abs(alphaDeg - 90) < BOUNDARY_TOL ? 1 : Math.abs(alphaDeg) < BOUNDARY_TOL ? 0 : Math.sin(alphaRad);
  const cosA = Math.abs(alphaDeg - 90) < BOUNDARY_TOL ? 0 : Math.abs(alphaDeg) < BOUNDARY_TOL ? 1 : Math.cos(alphaRad);

  const tangencyPoint: Point2D = {
    x: validR * (1 + sinA),
    y: validR * (1 + cosA),
  };

  // Verify T lies strictly on circle (x - r)^2 + (y - r)^2 = r^2
  const distToCenter = Math.hypot(tangencyPoint.x - validR, tangencyPoint.y - validR);
  const circleDistanceResidual = Math.abs(distToCenter - validR);

  // Tangent line orthogonal to normal n = (sinA, cosA) passing through T:
  // sinA * x + cosA * y = sinA * T.x + cosA * T.y = r * (1 + sinA + cosA)
  const rhs = sinA * tangencyPoint.x + cosA * tangencyPoint.y;
  const normalNorm = Math.hypot(sinA, cosA);
  const signedDistFromCenter = Math.abs(sinA * validR + cosA * validR - rhs) / normalNorm;

  const slope = Math.abs(cosA) < BOUNDARY_TOL ? null : -sinA / cosA;
  const formatted =
    Math.abs(sinA) < BOUNDARY_TOL
      ? `y = ${rhs.toFixed(4)}`
      : Math.abs(cosA) < BOUNDARY_TOL
        ? `x = ${rhs.toFixed(4)}`
        : `${sinA.toFixed(4)}x + ${cosA.toFixed(4)}y = ${rhs.toFixed(4)}`;

  const tangentLine: TangentLineEquation = {
    coeffX: sinA,
    coeffY: cosA,
    rhs,
    formatted,
    slope,
    distanceFromCenter: signedDistFromCenter,
  };

  const arcLengthActual = validR * alphaRad;
  const thetaExp02Deg = 2 * alphaDeg;
  const arcLengthIfUsingTheta = validR * (thetaExp02Deg * DEG2RAD);

  // Boundary degeneracy check
  if (alphaDeg <= BOUNDARY_TOL) {
    return {
      r: validR,
      alphaDeg,
      alphaRad,
      phiExp02Deg: alphaDeg,
      thetaExp02Deg,
      arcLengthActual,
      arcLengthIfUsingTheta,
      tangencyPoint,
      circleDistanceResidual,
      tangentLine,
      isDegenerate: true,
      degeneracyReason: 'Tangent line y = 2r is parallel to horizontal leg Ox (B -> infinity, A = (0, 2r)).',
      vertexA: { x: 0, y: 2 * validR },
      vertexB: null,
      a: 2 * validR,
      b: null,
      c: null,
      ratioT: null,
      angleADeg: 90,
      angleBDeg: 0,
      rActualDirect: null,
      rActualStable: null,
      pythagoreanResidualAbs: null,
      incircleEqResidualAbs: null,
      matchesExp01FormulaDiff: null,
      matchesExp02PhiDiff: null,
    };
  }

  if (alphaDeg >= 90 - BOUNDARY_TOL) {
    return {
      r: validR,
      alphaDeg,
      alphaRad,
      phiExp02Deg: alphaDeg,
      thetaExp02Deg,
      arcLengthActual,
      arcLengthIfUsingTheta,
      tangencyPoint,
      circleDistanceResidual,
      tangentLine,
      isDegenerate: true,
      degeneracyReason: 'Tangent line x = 2r is parallel to vertical leg Oy (A -> infinity, B = (2r, 0)).',
      vertexA: null,
      vertexB: { x: 2 * validR, y: 0 },
      a: null,
      b: 2 * validR,
      c: null,
      ratioT: null,
      angleADeg: 0,
      angleBDeg: 90,
      rActualDirect: null,
      rActualStable: null,
      pythagoreanResidualAbs: null,
      incircleEqResidualAbs: null,
      matchesExp01FormulaDiff: null,
      matchesExp02PhiDiff: null,
    };
  }

  // Interior non-degenerate position: intersect tangent line with fixed legs x = 0 and y = 0
  const a = rhs / cosA;
  const b = rhs / sinA;
  const vertexA: Point2D = { x: 0, y: a };
  const vertexB: Point2D = { x: b, y: 0 };
  const c = Math.hypot(vertexB.x - vertexA.x, vertexB.y - vertexA.y);

  const ratioT = b / a;
  const angleADeg = Math.atan2(b, a) * RAD2DEG;
  const angleBDeg = Math.atan2(a, b) * RAD2DEG;
  const rActualDirect = (a + b - c) / 2;
  const rActualStable = (a / (a + b + c)) * b;

  const pythagoreanResidualAbs = Math.abs(a * a + b * b - c * c);
  const incircleEqResidualAbs = Math.abs(a + b - c - 2 * validR);

  // Cross-check against Experiment 01 inverse formula Psi(r, t) and Experiment 02 phi-based arc model
  const exp01 = computeCircleFirstTriangle(validR, ratioT);
  const matchesExp01FormulaDiff = Math.max(
    Math.abs(a - exp01.a),
    Math.abs(b - exp01.b),
    Math.abs(c - exp01.c)
  );

  const exp02 = triangleFromPhysicalArcAngle(validR, alphaDeg);
  const matchesExp02PhiDiff = Math.max(
    Math.abs(arcLengthActual - exp02.arcLengthFromN),
    Math.hypot(tangencyPoint.x - exp02.tangencyAB.x, tangencyPoint.y - exp02.tangencyAB.y)
  );

  return {
    r: validR,
    alphaDeg,
    alphaRad,
    phiExp02Deg: exp02.phiDeg,
    thetaExp02Deg: exp02.thetaCotHalfDeg,
    arcLengthActual,
    arcLengthIfUsingTheta,
    tangencyPoint,
    circleDistanceResidual,
    tangentLine,
    isDegenerate: false,
    degeneracyReason: null,
    vertexA,
    vertexB,
    a,
    b,
    c,
    ratioT,
    angleADeg,
    angleBDeg,
    rActualDirect,
    rActualStable,
    pythagoreanResidualAbs,
    incircleEqResidualAbs,
    matchesExp01FormulaDiff,
    matchesExp02PhiDiff,
  };
}

/**
 * Generates the complete Experiment 03 validation table for radius r across angles 0..90 deg.
 */
export function validateRadiusAngles(
  r: number,
  anglesDeg: readonly number[] = [0, 15, 30, 45, 60, 75, 90]
): GeometricValidationRow[] {
  return anglesDeg.map((deg) => validateTangentGeometryAtAngle(r, deg));
}

/**
 * Builds comparative discretization summary distinguishing:
 *   - intervals M
 *   - boundary-inclusive grid points
 *   - strictly interior ordered non-degenerate triangles
 *   - unique congruence classes (modulo a <-> b reflection alpha <-> 90 - alpha)
 */
export function buildValidationDiscretizationComparison(
  radii: readonly number[],
  angularStepsDeg: readonly number[],
  linearSteps: readonly number[]
): DiscretizationComparisonEntry[] {
  const entries: DiscretizationComparisonEntry[] = [];

  for (const stepDeg of angularStepsDeg) {
    for (const r of radii) {
      const res = discretizeArcAngular(r, stepDeg);
      entries.push({
        mode: 'angular',
        r: res.r,
        arcLengthMax: res.arcLengthMax,
        stepLabel: `${stepDeg}°`,
        stepValue: stepDeg,
        effectiveAngularStepDeg: res.effectiveAngularStepDeg,
        intervalCount: res.intervalCount,
        boundaryPointCount: res.boundaryInclusivePointCount,
        interiorOrderedCount: res.interiorNonDegenerateCount,
        uniqueCongruenceCount: res.uniqueCongruenceCount,
        symmetricDuplicatesCount: res.duplicateCongruenceCount,
      });
    }
  }

  for (const deltaL of linearSteps) {
    for (const r of radii) {
      const res = discretizeArcLinear(r, deltaL);
      entries.push({
        mode: 'linear',
        r: res.r,
        arcLengthMax: res.arcLengthMax,
        stepLabel: `${deltaL}`,
        stepValue: deltaL,
        effectiveAngularStepDeg: res.effectiveAngularStepDeg,
        intervalCount: res.intervalCount,
        boundaryPointCount: res.boundaryInclusivePointCount,
        interiorOrderedCount: res.interiorNonDegenerateCount,
        uniqueCongruenceCount: res.uniqueCongruenceCount,
        symmetricDuplicatesCount: res.duplicateCongruenceCount,
      });
    }
  }

  return entries;
}
