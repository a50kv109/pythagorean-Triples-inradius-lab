/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type {
  CanonicalCircle,
  CanonicalCircumcircle,
  CanonicalFourCirclesModel,
  CanonicalIncircle,
  CanonicalIncircleSectorsAndSubtriangles,
  CanonicalPoint2D,
  CanonicalRightTriangle,
  CanonicalSquare,
} from './types.ts';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export class InvalidCanonicalTriangleInputError extends RangeError {
  readonly sideName: 'sideA' | 'sideB';
  readonly value: number;

  constructor(sideName: 'sideA' | 'sideB', value: number, detail?: string) {
    super(
      detail ??
        `Invalid canonical ${sideName}: expected a finite positive number (> 0), got ${String(value)}.`
    );
    this.name = 'InvalidCanonicalTriangleInputError';
    this.sideName = sideName;
    this.value = value;
  }
}

export function assertValidCanonicalSide(value: number, sideName: 'sideA' | 'sideB'): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    const opp = sideName === 'sideA' ? '(|BC| opposite A)' : '(|AC| opposite B)';
    throw new InvalidCanonicalTriangleInputError(
      sideName,
      value,
      `Invalid canonical ${sideName} ${opp}: expected positive finite number, got ${String(value)}`
    );
  }
  return value;
}

export function assertValidCanonicalSides(sideA: number, sideB: number): void {
  assertValidCanonicalSide(sideA, 'sideA');
  assertValidCanonicalSide(sideB, 'sideB');
}

/**
 * Pure canonical construction of right triangle ABC (right angle at C=(0,0)):
 *   - C = (0, 0)
 *   - A = (0, sideB) on +Oy, acute angle alpha = atan2(sideA, sideB)
 *   - B = (sideA, 0) on +Ox, acute angle beta  = atan2(sideB, sideA)
 *   - sideA = |BC| opposite A, sideB = |AC| opposite B, sideC = |AB| opposite C
 */
export function buildCanonicalRightTriangle(sideA: number, sideB: number): CanonicalRightTriangle {
  assertValidCanonicalSides(sideA, sideB);

  const sideC = Math.hypot(sideA, sideB);
  const angleAlphaRad = Math.atan2(sideA, sideB);
  const angleBetaRad = Math.atan2(sideB, sideA);
  const angleAlphaDeg = angleAlphaRad * RAD2DEG;
  const angleBetaDeg = angleBetaRad * RAD2DEG;
  const angleGammaRad = Math.PI / 2;
  const angleGammaDeg = 90;

  const perimeter = sideA + sideB + sideC;
  const semiperimeter = perimeter / 2;
  const triangleArea = 0.5 * sideA * sideB;

  return {
    vertexA: { x: 0, y: sideB },
    vertexB: { x: sideA, y: 0 },
    vertexC: { x: 0, y: 0 },
    sideA,
    sideB,
    sideC,
    legOA: sideB,
    legOB: sideA,
    angleAlphaRad,
    angleAlphaDeg,
    angleBetaRad,
    angleBetaDeg,
    angleGammaRad,
    angleGammaDeg,
    perimeter,
    semiperimeter,
    triangleArea,
    shapeRatio: sideA / sideB,
    shapeRatioDefinition: 'sideA / sideB',
    ratioSideAToSideB: sideA / sideB,
    ratioSideBToSideA: sideB / sideA,
  };
}

function midpoint(p: CanonicalPoint2D, q: CanonicalPoint2D): CanonicalPoint2D {
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
}

function buildSquareFromEdgeMidpoints(
  id: 'Qa' | 'Qb' | 'Qc',
  attachedSide: 'sideA' | 'sideB' | 'sideC',
  v0: CanonicalPoint2D,
  v1: CanonicalPoint2D,
  v2: CanonicalPoint2D,
  v3: CanonicalPoint2D,
  sideLength: number
): CanonicalSquare {
  const vertices: [CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D] = [
    v0,
    v1,
    v2,
    v3,
  ];
  const edgeMidpoints: [CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D] = [
    midpoint(v0, v1),
    midpoint(v1, v2),
    midpoint(v2, v3),
    midpoint(v3, v0),
  ];
  const center: CanonicalPoint2D = {
    x: (v0.x + v1.x + v2.x + v3.x) / 4,
    y: (v0.y + v1.y + v2.y + v3.y) / 4,
  };

  return {
    id,
    attachedSide,
    sideLength,
    area: sideLength * sideLength,
    perimeter: 4 * sideLength,
    center,
    vertices,
    edgeMidpoints,
  };
}

function buildCircleInSquare(
  id: 'Ka' | 'Kb' | 'Kc',
  square: CanonicalSquare
): CanonicalCircle {
  const diameter = square.sideLength;
  const radius = diameter / 2;
  return {
    id,
    inscribedInSquare: square.id,
    center: { ...square.center },
    radius,
    diameter,
    area: (Math.PI * diameter * diameter) / 4,
    circumference: Math.PI * diameter,
    tangencyPoints: square.edgeMidpoints,
  };
}

/**
 * Constructs canonical exterior square Q_a on side BC (sideA, along +Ox, quadrant IV).
 */
export function buildCanonicalSquareA(sideA: number): CanonicalSquare {
  const validSideA = assertValidCanonicalSide(sideA, 'sideA');
  const vertexC: CanonicalPoint2D = { x: 0, y: 0 };
  const vertexB: CanonicalPoint2D = { x: validSideA, y: 0 };
  return buildSquareFromEdgeMidpoints(
    'Qa',
    'sideA',
    vertexC,
    vertexB,
    { x: validSideA, y: -validSideA },
    { x: 0, y: -validSideA },
    validSideA
  );
}

/**
 * Constructs canonical exterior square Q_b on side AC (sideB, along +Oy, quadrant II).
 */
export function buildCanonicalSquareB(sideB: number): CanonicalSquare {
  const validSideB = assertValidCanonicalSide(sideB, 'sideB');
  const vertexC: CanonicalPoint2D = { x: 0, y: 0 };
  const vertexA: CanonicalPoint2D = { x: 0, y: validSideB };
  return buildSquareFromEdgeMidpoints(
    'Qb',
    'sideB',
    vertexC,
    vertexA,
    { x: -validSideB, y: validSideB },
    { x: -validSideB, y: 0 },
    validSideB
  );
}

/**
 * Constructs canonical exterior square Q_c on hypotenuse AB (sideC, quadrant I).
 */
export function buildCanonicalSquareC(sideA: number, sideB: number): CanonicalSquare {
  assertValidCanonicalSides(sideA, sideB);
  const sideC = Math.hypot(sideA, sideB);
  const vertexA: CanonicalPoint2D = { x: 0, y: sideB };
  const vertexB: CanonicalPoint2D = { x: sideA, y: 0 };
  return buildSquareFromEdgeMidpoints(
    'Qc',
    'sideC',
    vertexA,
    vertexB,
    { x: sideA + sideB, y: sideA },
    { x: sideB, y: sideA + sideB },
    sideC
  );
}

/**
 * Pure canonical calculation of the complete Five-Circles + Incenter-Partition model
 * directly from standard opposite sides (sideA = |BC|, sideB = |AC|).
 * Zero calls to Legacy math functions.
 */
export function calculateCanonicalFourCircles(
  sideA: number,
  sideB: number
): CanonicalFourCirclesModel {
  const triangle = buildCanonicalRightTriangle(sideA, sideB);
  const { sideC, vertexA, vertexB, vertexC } = triangle;

  // 1. Exterior squares Q_a (on BC = sideA, quadrant IV), Q_b (on AC = sideB, quadrant II), Q_c (on AB = sideC, quadrant I)
  const squareA = buildCanonicalSquareA(sideA);
  const squareB = buildCanonicalSquareB(sideB);
  const squareC = buildCanonicalSquareC(sideA, sideB);

  // 2. Square-inscribed circles Ka, Kb, Kc
  const circleKa = buildCircleInSquare('Ka', squareA);
  const circleKb = buildCircleInSquare('Kb', squareB);
  const circleKc = buildCircleInSquare('Kc', squareC);

  // 3. Triangle Incircle Ki (cancellation-free formula r = (sideA * sideB) / (sideA + sideB + sideC))
  const inradius = (sideA / triangle.perimeter) * sideB;
  const incenter: CanonicalPoint2D = { x: inradius, y: inradius };
  const incircleKi: CanonicalIncircle = {
    id: 'Ki',
    center: incenter,
    radius: inradius,
    diameter: 2 * inradius,
    area: Math.PI * inradius * inradius,
    circumference: 2 * Math.PI * inradius,
    tangencySideA: { x: inradius, y: 0 },
    tangencySideB: { x: 0, y: inradius },
    tangencySideC: {
      x: inradius * (1 + sideB / sideC),
      y: inradius * (1 + sideA / sideC),
    },
  };

  // 4. Thales Circumcircle Ko
  const circumCenter: CanonicalPoint2D = { x: sideA / 2, y: sideB / 2 };
  const circumRadius = sideC / 2;
  const circumcircleKo: CanonicalCircumcircle = {
    id: 'Ko',
    center: circumCenter,
    radius: circumRadius,
    diameter: sideC,
    area: (Math.PI * sideC * sideC) / 4,
    circumference: Math.PI * sideC,
    vertexDistances: {
      toA: Math.hypot(vertexA.x - circumCenter.x, vertexA.y - circumCenter.y),
      toB: Math.hypot(vertexB.x - circumCenter.x, vertexB.y - circumCenter.y),
      toC: Math.hypot(vertexC.x - circumCenter.x, vertexC.y - circumCenter.y),
    },
    angleAtRightVertexDeg: 90,
    areaDiffWithKc: (Math.PI * sideC * sideC) / 4 - circleKc.area,
    centerDistanceToKc: Math.hypot(
      circumCenter.x - circleKc.center.x,
      circumCenter.y - circleKc.center.y
    ),
  };

  // 5. Subtriangle areas & Incircle arc sectors (canonical A, B, C correspondence)
  const subtriangleAreaA = 0.5 * sideA * inradius;
  const subtriangleAreaB = 0.5 * sideB * inradius;
  const subtriangleAreaC = 0.5 * sideC * inradius;
  const subtriangleAreaSum = subtriangleAreaA + subtriangleAreaB + subtriangleAreaC;

  const arcAngleADeg = 180 - triangle.angleAlphaDeg;
  const arcAngleBDeg = 180 - triangle.angleBetaDeg;
  const arcAngleCDeg = 90;
  const arcAngleARad = arcAngleADeg * DEG2RAD;
  const arcAngleBRad = arcAngleBDeg * DEG2RAD;
  const arcAngleCRad = arcAngleCDeg * DEG2RAD;

  const incenterPartition: CanonicalIncircleSectorsAndSubtriangles = {
    subtriangleAreaA,
    subtriangleAreaB,
    subtriangleAreaC,
    subtriangleAreaSum,
    sideShareA: sideA / triangle.perimeter,
    sideShareB: sideB / triangle.perimeter,
    sideShareC: sideC / triangle.perimeter,
    areaShareA: subtriangleAreaA / triangle.triangleArea,
    areaShareB: subtriangleAreaB / triangle.triangleArea,
    areaShareC: subtriangleAreaC / triangle.triangleArea,
    arcAngleADeg,
    arcAngleBDeg,
    arcAngleCDeg,
    arcAngleARad,
    arcAngleBRad,
    arcAngleCRad,
    arcLengthA: inradius * arcAngleARad,
    arcLengthB: inradius * arcAngleBRad,
    arcLengthC: inradius * arcAngleCRad,
    arcShareA: arcAngleADeg / 360,
    arcShareB: arcAngleBDeg / 360,
    arcShareC: arcAngleCDeg / 360,
    // Cancellation-free tangent segment lengths:
    // p - sideA = sideB - r (since r = (sideA + sideB - sideC)/2 < sideB/2)
    // p - sideB = sideA - r (since r < sideA/2)
    // p - sideC = r
    tangentSegA: sideB - inradius,
    tangentSegB: sideA - inradius,
    tangentSegC: inradius,
  };

  // 6. Central Four-Circle Identity & Area Contrast
  const sqrtSumLegs = Math.sqrt(circleKa.area) + Math.sqrt(circleKb.area);
  const sqrtSumHypAndIn = Math.sqrt(circleKc.area) + Math.sqrt(incircleKi.area);
  const identityResidualAbs = Math.abs(sqrtSumLegs - sqrtSumHypAndIn);
  const areaSumLegs = circleKa.area + circleKb.area;
  const pythagoreanAreaDiff = areaSumLegs - circleKc.area;
  const areaMinusAll = areaSumLegs - circleKc.area - incircleKi.area;

  return {
    notationStandard: 'CANONICAL_OPPOSITE_SIDE_V1',
    triangle,
    squareA,
    squareB,
    squareC,
    circleKa,
    circleKb,
    circleKc,
    incircleKi,
    circumcircleKo,
    incenterPartition,
    sqrtSumLegs,
    sqrtSumHypAndIn,
    identityResidualAbs,
    areaSumLegs,
    pythagoreanAreaDiff,
    areaMinusAll,
  };
}
