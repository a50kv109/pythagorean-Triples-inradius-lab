/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  CircleInSquareGeometry,
  FourCirclesCalculations,
  TriangleIncircleGeometry,
} from '../types/geometry.ts';
import { assertValidLegs } from './inputValidation.ts';
import { calculateRightTriangle } from './RightTriangle.ts';
import { calculateSquareA, calculateSquareB, calculateSquareC } from './SquareConstruction.ts';
import { calculateThalesCircumcircle } from './ThalesCircumcircle.ts';

const SQRT_PI = Math.sqrt(Math.PI);

/**
 * Calculates the complete parametric geometric model for:
 * "Pythagoras — Four Circles Laboratory"
 *
 * Single source of truth driven solely by legs (a, b):
 * - Right triangle OAB with right angle at O(0,0), A(0,a), B(b,0), c = sqrt(a^2 + b^2)
 * - Three exterior squares Qa, Qb, Qc
 * - Three circles Ka, Kb, Kc inscribed in Qa, Qb, Qc (diameters a, b, c)
 * - Fourth circle Ki: standard incircle inside OAB, r = (a + b - c) / 2 = ab / (a + b + c)
 * - Central identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
 */
export function calculateFourCircles(a: number, b: number): FourCirclesCalculations {
  const [validA, validB] = assertValidLegs(a, b);

  const triangle = calculateRightTriangle(validA, validB);
  const squareA = calculateSquareA(validA);
  const squareB = calculateSquareB(validB);
  const squareC = calculateSquareC(validA, validB);
  const c = triangle.c;

  // Ka inscribed in Qa: center (-a/2, a/2), radius = a/2
  const rA = validA / 2;
  const areaKa = (Math.PI * validA * validA) / 4;
  const circleA: CircleInSquareGeometry = {
    id: 'Ka',
    label: 'K_a',
    center: { x: -rA, y: rA },
    radius: rA,
    diameter: validA,
    area: areaKa,
    sqrtArea: (SQRT_PI * validA) / 2,
    tangencyPoints: [
      { x: 0, y: rA },       // on OA
      { x: -rA, y: validA }, // on ACa
      { x: -validA, y: rA }, // on CaDa
      { x: -rA, y: 0 },      // on DaO
    ],
  };

  // Kb inscribed in Qb: center (b/2, -b/2), radius = b/2
  const rB = validB / 2;
  const areaKb = (Math.PI * validB * validB) / 4;
  const circleB: CircleInSquareGeometry = {
    id: 'Kb',
    label: 'K_b',
    center: { x: rB, y: -rB },
    radius: rB,
    diameter: validB,
    area: areaKb,
    sqrtArea: (SQRT_PI * validB) / 2,
    tangencyPoints: [
      { x: rB, y: 0 },       // on OB
      { x: validB, y: -rB }, // on BCb
      { x: rB, y: -validB }, // on CbDb
      { x: 0, y: -rB },      // on DbO
    ],
  };

  // Kc inscribed in Qc: center ((a+b)/2, (a+b)/2), radius = c/2
  const rC = c / 2;
  const areaKc = (Math.PI * c * c) / 4;
  const halfSum = (validA + validB) / 2;
  const circleC: CircleInSquareGeometry = {
    id: 'Kc',
    label: 'K_c',
    center: { x: halfSum, y: halfSum },
    radius: rC,
    diameter: c,
    area: areaKc,
    sqrtArea: (SQRT_PI * c) / 2,
    tangencyPoints: [
      { x: validB / 2, y: validA / 2 },                   // on AB
      { x: validB + validA / 2, y: validB / 2 },          // on BBc
      { x: validA + validB / 2, y: validB + validA / 2 }, // on BcAc
      { x: validA / 2, y: validA + validB / 2 },          // on AcA
    ],
  };

  // Ki: incircle strictly inside right triangle OAB
  // Overflow-free and cancellation-free algebraic equivalent of (a + b - c) / 2:
  // r = ab / (a + b + c) = (a / (a + b + c)) * b
  const perimeter = validA + validB + c;
  const rIn = (validA / perimeter) * validB;
  const areaKi = Math.PI * rIn * rIn;
  const sqrtKi = SQRT_PI * rIn;

  // Tangency point on hypotenuse AB: I + r * (a/c, b/c)
  const cosAlpha = validA / c;
  const sinAlpha = validB / c;
  const incircle: TriangleIncircleGeometry = {
    id: 'Ki',
    label: 'K_i',
    center: { x: rIn, y: rIn },
    radius: rIn,
    diameter: 2 * rIn,
    area: areaKi,
    sqrtArea: sqrtKi,
    tangencyOA: { x: 0, y: rIn },
    tangencyOB: { x: rIn, y: 0 },
    tangencyAB: {
      x: rIn * (1 + cosAlpha),
      y: rIn * (1 + sinAlpha),
    },
  };

  // Central identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
  const sqrtKa = Math.sqrt(areaKa);
  const sqrtKb = Math.sqrt(areaKb);
  const sqrtKc = Math.sqrt(areaKc);
  const sqrtKiVal = Math.sqrt(areaKi);

  const sqrtSumLegs = sqrtKa + sqrtKb;
  const sqrtSumHypAndIn = sqrtKc + sqrtKiVal;
  const identityResidualAbs = Math.abs(sqrtSumLegs - sqrtSumHypAndIn);
  const identityResidualRel =
    sqrtSumLegs > 0 ? identityResidualAbs / sqrtSumLegs : NaN;

  // Area relations
  const areaSumLegs = areaKa + areaKb;
  const pythagoreanAreaDiff = areaSumLegs - areaKc;
  const areaMinusAll = areaKa + areaKb - areaKc - areaKi;
  const areaContrastExpected = -areaKi;

  // Fifth circle: Thales circumcircle K_o around triangle OAB (D_o = c, R_o = c/2, center = (A+B)/2)
  const circumcircle = calculateThalesCircumcircle(triangle, areaKc, circleC.center);

  return {
    triangle,
    squareA,
    squareB,
    squareC,
    circleA,
    circleB,
    circleC,
    incircle,
    circumcircle,
    sqrtSumLegs,
    sqrtSumHypAndIn,
    identityResidualAbs,
    identityResidualRel,
    areaSumLegs,
    pythagoreanAreaDiff,
    areaMinusAll,
    areaContrastExpected,
  };
}
