/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  Point2D,
  RightTriangleCalculations,
  ThalesCircumcircleGeometry,
} from '../types/geometry.ts';

const SQRT_PI = Math.sqrt(Math.PI);
const RAD2DEG = 180 / Math.PI;

function assertFinitePoint(pt: Point2D, name: string): void {
  if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
    throw new RangeError(`Invalid coordinate for vertex ${name}: (${pt?.x}, ${pt?.y})`);
  }
}

/**
 * Computes the fifth geometric object: Thales Circumcircle (K_o)
 * circumscribed around any Euclidean right triangle with hypotenuse endpoints A, B
 * and right-angle vertex C (in this lab: C = O(0, 0)).
 *
 * Uses actual endpoint coordinates A and B directly rather than hardcoding screen origin:
 *   O_o = (A + B) / 2
 *   D_o = |A - B| = c
 *   R_o = D_o / 2 = c / 2
 *   K_o = pi * R_o^2 = pi * c^2 / 4
 *   L_o = 2 * pi * R_o = pi * c
 */
export function calculateThalesCircumcircleFromVertices(
  A: Point2D,
  B: Point2D,
  C: Point2D,
  circleCArea?: number,
  circleCCenter?: Point2D
): ThalesCircumcircleGeometry {
  assertFinitePoint(A, 'A');
  assertFinitePoint(B, 'B');
  assertFinitePoint(C, 'C');

  // Center at midpoint of hypotenuse AB computed directly from endpoints A and B
  const center: Point2D = {
    x: (A.x + B.x) / 2,
    y: (A.y + B.y) / 2,
  };

  // Hypotenuse length from endpoints A, B
  const diameter = Math.hypot(B.x - A.x, B.y - A.y);
  if (!Number.isFinite(diameter) || diameter <= 0) {
    throw new RangeError('Hypotenuse endpoints A and B must be distinct with finite positive distance.');
  }

  const radius = diameter / 2;
  const area = (Math.PI * diameter * diameter) / 4;
  const circumference = Math.PI * diameter;
  const sqrtArea = (SQRT_PI * diameter) / 2;

  const toA = Math.hypot(center.x - A.x, center.y - A.y);
  const toB = Math.hypot(center.x - B.x, center.y - B.y);
  const toC = Math.hypot(center.x - C.x, center.y - C.y);

  // Measure actual inscribed angle ∠ACB from vectors CA and CB
  const vCAx = A.x - C.x;
  const vCAy = A.y - C.y;
  const vCBx = B.x - C.x;
  const vCBy = B.y - C.y;
  const dot = vCAx * vCBx + vCAy * vCBy;
  const cross = Math.abs(vCAx * vCBy - vCAy * vCBx);
  const angleAtRightVertexDeg = Math.atan2(cross, dot) * RAD2DEG;

  const areaDiffWithKc = circleCArea !== undefined ? area - circleCArea : 0;
  const centerDistanceToKc =
    circleCCenter !== undefined
      ? Math.hypot(center.x - circleCCenter.x, center.y - circleCCenter.y)
      : radius;

  return {
    id: 'Ko',
    label: 'K_o',
    center,
    radius,
    diameter,
    area,
    circumference,
    sqrtArea,
    vertexDistances: {
      toA,
      toB,
      toC,
    },
    angleAtRightVertexDeg,
    areaDiffWithKc,
    centerDistanceToKc,
  };
}

/**
 * Convenience adapter computing K_o directly from RightTriangleCalculations (A, B, O)
 * and existing K_c circle properties.
 */
export function calculateThalesCircumcircle(
  triangle: RightTriangleCalculations,
  circleCArea?: number,
  circleCCenter?: Point2D
): ThalesCircumcircleGeometry {
  return calculateThalesCircumcircleFromVertices(
    triangle.A,
    triangle.B,
    triangle.O,
    circleCArea,
    circleCCenter
  );
}

export interface ScaleTransformationResult {
  lambda: number;
  a: number;
  b: number;
  c: number;
  Ro: number;
  Do: number;
  Ko: number;
  Lo: number;
  Ka: number;
  Kb: number;
  Kc: number;
  Ki: number;
  Sa: number;
  Sb: number;
  Sc: number;
}

/**
 * Calculates scaled right triangle parameters given base legs (baseA, baseB) and scale factor lambda > 0.
 * Demonstrates the fundamental Euclidean scaling laws:
 * - Linear dimensions scale as lambda^1: a, b, c, Ro, Do, Lo, r
 * - Quadratic dimensions scale as lambda^2: Ka, Kb, Kc, Ki, Ko, Sa, Sb, Sc
 */
export function scaleTriangleGeometry(
  baseA: number,
  baseB: number,
  lambda: number
): ScaleTransformationResult {
  if (!Number.isFinite(baseA) || baseA <= 0 || !Number.isFinite(baseB) || baseB <= 0) {
    throw new RangeError(`Base legs must be finite positive numbers: got a=${baseA}, b=${baseB}`);
  }
  if (!Number.isFinite(lambda) || lambda <= 0) {
    throw new RangeError(`Scale factor lambda must be finite positive number: got lambda=${lambda}`);
  }

  const a = baseA * lambda;
  const b = baseB * lambda;
  const c = Math.hypot(a, b);
  const r = (a + b - c) / 2;

  const Ro = c / 2;
  const Do = c;
  const Ko = (Math.PI * c * c) / 4;
  const Lo = Math.PI * c;

  const Ka = (Math.PI * a * a) / 4;
  const Kb = (Math.PI * b * b) / 4;
  const Kc = (Math.PI * c * c) / 4;
  const Ki = Math.PI * r * r;

  const Sa = a * a;
  const Sb = b * b;
  const Sc = c * c;

  return {
    lambda,
    a,
    b,
    c,
    Ro,
    Do,
    Ko,
    Lo,
    Ka,
    Kb,
    Kc,
    Ki,
    Sa,
    Sb,
    Sc,
  };
}

export interface ThalesScaleSamplePoint {
  lambda: number;
  Do: number;
  Ro: number;
  Lo: number;
  Ko: number;
  Kc: number;
  Ki: number;
  Sc: number;
}

/**
 * Samples Thales circumcircle scaling curves over lambda in [lambdaMin, lambdaMax]
 * at fixed shape ratio t = baseB / baseA and reference hypotenuse baseC.
 */
export function sampleThalesScaleCurves(options: {
  baseC: number;
  baseA?: number;
  baseB?: number;
  lambdaMin: number;
  lambdaMax: number;
  steps?: number;
  scaleMode?: 'linear' | 'log';
}): ThalesScaleSamplePoint[] {
  const {
    baseC,
    baseA = 4,
    baseB = 3,
    lambdaMin,
    lambdaMax,
    steps = 200,
    scaleMode = 'linear',
  } = options;

  if (!Number.isFinite(baseC) || baseC <= 0) {
    throw new RangeError(`Invalid baseC: ${baseC}`);
  }
  if (!Number.isFinite(lambdaMin) || !Number.isFinite(lambdaMax) || lambdaMin <= 0 || lambdaMax <= lambdaMin) {
    throw new RangeError(`Invalid lambda range [${lambdaMin}, ${lambdaMax}]`);
  }

  const lambdaValues: number[] = [];
  if (scaleMode === 'log') {
    const logMin = Math.log10(lambdaMin);
    const logMax = Math.log10(lambdaMax);
    for (let i = 0; i <= steps; i++) {
      lambdaValues.push(Math.pow(10, logMin + (i / steps) * (logMax - logMin)));
    }
  } else {
    for (let i = 0; i <= steps; i++) {
      lambdaValues.push(lambdaMin + (i / steps) * (lambdaMax - lambdaMin));
    }
  }

  // Ensure lambda = 1 (identity) is included if within range
  if (lambdaMin <= 1 && 1 <= lambdaMax && !lambdaValues.some((v) => Math.abs(v - 1) < 1e-9)) {
    lambdaValues.push(1);
    lambdaValues.sort((x, y) => x - y);
  }

  // Normalize base legs to exactly match baseC hypotenuse
  const rawHyp = Math.hypot(baseA, baseB);
  const normA = (baseA / rawHyp) * baseC;
  const normB = (baseB / rawHyp) * baseC;

  return lambdaValues.map((l) => {
    const res = scaleTriangleGeometry(normA, normB, l);
    return {
      lambda: l,
      Do: res.Do,
      Ro: res.Ro,
      Lo: res.Lo,
      Ko: res.Ko,
      Kc: res.Kc,
      Ki: res.Ki,
      Sc: res.Sc,
    };
  });
}
