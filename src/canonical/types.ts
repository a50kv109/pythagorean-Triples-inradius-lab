/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export interface CanonicalPoint2D {
  x: number;
  y: number;
}

export type CanonicalOrientationMode = 'vertex_preserving' | 'mirror_leg_name_preserving';
export type CanonicalShapeRatioDefinition = 'sideA / sideB';

export type CanonicalObjectLayerKind =
  | 'side'
  | 'square'
  | 'circle'
  | 'incircle'
  | 'circumcircle'
  | 'tangency_point'
  | 'tangent_segment'
  | 'subtriangle'
  | 'incircle_arc';

export interface CanonicalObjectIdentityRecord {
  layer1_geometricEntity: string;
  layer2_semanticRole: string;
  layer3_canonicalId: string;
  legacyId: string;
  center: CanonicalPoint2D | null;
  radius: number | null;
  sideLengthOrDiameter: number | null;
  attachedSide: 'sideA' | 'sideB' | 'sideC' | 'all_three_sides' | 'hypotenuse_endpoints' | 'none';
  oppositeVertex: 'A' | 'B' | 'C' | 'none';
  area: number | null;
}

export interface CanonicalShapeRatioPassport {
  canonicalName: 'shapeRatio';
  symbol: 'rho';
  definition: CanonicalShapeRatioDefinition;
  formulaLatex: string;
  legacySymbol: 't';
  legacyFormula: 'b_leg / a_leg = |OB| / |OA|';
  domain: '(0, +infinity)';
  dimension: 'dimensionless (degree 0 homogeneous under scale lambda > 0)';
  swapBehavior: 'Under sideA <-> sideB: shapeRatio -> 1 / shapeRatio';
  spectralFormulas: {
    sideANorm: string;
    sideBNorm: string;
    sideCNorm: string;
    inradiusNorm: string;
    shareKaOverKc: string;
    shareKbOverKc: string;
    shareKiOverKc: string;
  };
}

export interface CanonicalTriangleInput {
  /** Side a = |BC| along +Ox, opposite vertex A (alpha) */
  sideA: number;
  /** Side b = |AC| along +Oy, opposite vertex B (beta) */
  sideB: number;
}

/**
 * Canonical Right Triangle ABC with right angle at C = (0, 0),
 * acute vertex A = (0, sideB) on +Oy, acute vertex B = (sideA, 0) on +Ox.
 * Opposite-side rule strictly holds: sideA opp A, sideB opp B, sideC opp C.
 */
export interface CanonicalRightTriangle {
  vertexA: CanonicalPoint2D; // (0, sideB)
  vertexB: CanonicalPoint2D; // (sideA, 0)
  vertexC: CanonicalPoint2D; // (0, 0) right angle

  sideA: number; // |BC|, opposite angle alpha
  sideB: number; // |AC|, opposite angle beta
  sideC: number; // |AB|, hypotenuse opposite gamma = 90 deg

  /** Explicit coordinate-axis helpers mapped directly to opposite sides */
  legOA: number; // |CA| along +Oy === sideB
  legOB: number; // |CB| along +Ox === sideA

  angleAlphaRad: number; // angle at A = atan2(sideA, sideB)
  angleAlphaDeg: number;
  angleBetaRad: number; // angle at B = atan2(sideB, sideA)
  angleBetaDeg: number;
  angleGammaRad: number; // pi / 2
  angleGammaDeg: number; // 90

  perimeter: number; // P = sideA + sideB + sideC
  semiperimeter: number; // p = P / 2
  triangleArea: number; // S = 0.5 * sideA * sideB

  /**
   * Canonical spectral shape parameter (conceptual name: `shapeRatio`, mathematical symbol: rho).
   * Explicitly defined as `sideA / sideB` = |BC| / |AC| = tan(alpha) = cot(beta),
   * which is numerically and geometrically identical to Legacy `t = b_leg / a_leg = |OB| / |OA|`.
   */
  shapeRatio: number;
  shapeRatioDefinition: CanonicalShapeRatioDefinition;
  /** Directional leg-ratio aliases preserved explicitly */
  ratioSideAToSideB: number; // === shapeRatio = sideA / sideB = tan(alpha)
  ratioSideBToSideA: number; // === 1 / shapeRatio = sideB / sideA = cot(alpha) = tan(beta)
}

export interface CanonicalSquare {
  id: 'Qa' | 'Qb' | 'Qc';
  attachedSide: 'sideA' | 'sideB' | 'sideC';
  sideLength: number;
  area: number;
  perimeter: number;
  center: CanonicalPoint2D;
  vertices: [CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D];
  edgeMidpoints: [CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D];
}

export interface CanonicalCircle {
  id: 'Ka' | 'Kb' | 'Kc';
  inscribedInSquare: 'Qa' | 'Qb' | 'Qc';
  center: CanonicalPoint2D;
  radius: number;
  diameter: number;
  area: number;
  circumference: number;
  tangencyPoints: [CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D, CanonicalPoint2D];
}

export interface CanonicalIncircle {
  id: 'Ki';
  center: CanonicalPoint2D; // I = (inradius, inradius)
  radius: number; // r = sideA * sideB / (sideA + sideB + sideC)
  diameter: number; // 2r
  area: number; // pi * r^2
  circumference: number; // 2 * pi * r
  tangencySideA: CanonicalPoint2D; // T_a = (r, 0) on BC (sideA)
  tangencySideB: CanonicalPoint2D; // T_b = (0, r) on AC (sideB)
  tangencySideC: CanonicalPoint2D; // T_c on AB (sideC)
}

export interface CanonicalCircumcircle {
  id: 'Ko';
  center: CanonicalPoint2D; // O_o = (sideA/2, sideB/2)
  radius: number; // R_o = sideC / 2
  diameter: number; // D_o = sideC
  area: number; // K_o = pi * sideC^2 / 4
  circumference: number; // C_o = pi * sideC
  vertexDistances: {
    toA: number;
    toB: number;
    toC: number;
  };
  angleAtRightVertexDeg: number; // 90 deg
  areaDiffWithKc: number; // K_o - K_c
  centerDistanceToKc: number; // |O_o - O_c|
}

export interface CanonicalIncircleSectorsAndSubtriangles {
  // Subtriangle areas ΔIBC (A), ΔIAC (B), ΔIAB (C)
  subtriangleAreaA: number; // 0.5 * sideA * r
  subtriangleAreaB: number; // 0.5 * sideB * r
  subtriangleAreaC: number; // 0.5 * sideC * r
  subtriangleAreaSum: number; // equals triangleArea = semiperimeter * r

  // Normalized shares (w_side === w_area)
  sideShareA: number;
  sideShareB: number;
  sideShareC: number;
  areaShareA: number;
  areaShareB: number;
  areaShareC: number;

  // Incircle sector central angles (around vertices A, B, C)
  arcAngleADeg: number; // 180 - angleAlphaDeg
  arcAngleBDeg: number; // 180 - angleBetaDeg
  arcAngleCDeg: number; // 90
  arcAngleARad: number;
  arcAngleBRad: number;
  arcAngleCRad: number;
  arcLengthA: number;
  arcLengthB: number;
  arcLengthC: number;
  arcShareA: number;
  arcShareB: number;
  arcShareC: number;

  // Tangent segment lengths from vertices A, B, C to incircle tangency points
  // (replaces ambiguous legacy t_A, t_B, t_C in Exp 06)
  tangentSegA: number; // p - sideA = sideB - r = r * cot(alpha / 2) = r * tan(phi_A / 2)
  tangentSegB: number; // p - sideB = sideA - r = r * cot(beta / 2) = r * tan(phi_B / 2)
  tangentSegC: number; // p - sideC = r * cot(45 deg) = r
}

export interface CanonicalFourCirclesModel {
  notationStandard: 'CANONICAL_OPPOSITE_SIDE_V1';
  triangle: CanonicalRightTriangle;
  squareA: CanonicalSquare; // Q_a on sideA (BC)
  squareB: CanonicalSquare; // Q_b on sideB (AC)
  squareC: CanonicalSquare; // Q_c on sideC (AB)
  circleKa: CanonicalCircle; // K_a in Q_a
  circleKb: CanonicalCircle; // K_b in Q_b
  circleKc: CanonicalCircle; // K_c in Q_c
  incircleKi: CanonicalIncircle; // K_i inside ABC
  circumcircleKo: CanonicalCircumcircle; // K_o circumscribed around ABC
  incenterPartition: CanonicalIncircleSectorsAndSubtriangles;

  // Core identities
  sqrtSumLegs: number; // sqrt(Ka) + sqrt(Kb)
  sqrtSumHypAndIn: number; // sqrt(Kc) + sqrt(Ki)
  identityResidualAbs: number; // |sqrt(Ka) + sqrt(Kb) - sqrt(Kc) - sqrt(Ki)|
  areaSumLegs: number; // Ka + Kb
  pythagoreanAreaDiff: number; // Ka + Kb - Kc
  areaMinusAll: number; // Ka + Kb - Kc - Ki = -Ki
}

export interface CanonicalInvariantCheckResult {
  id:
    | 'incircle_positive'
    | 'squares_construction'
    | 'square_circles_tangency'
    | 'incircle_tangency'
    | 'four_circle_areas'
    | 'central_sqrt_identity'
    | 'pythagorean_circle_areas'
    | 'area_non_equality_contrast';
  name: string;
  isValid: boolean;
  delta: number;
  tolerance: number;
  details: string;
}

export interface LegacyToCanonicalSemanticMap {
  orientationMode: CanonicalOrientationMode;
  vertices: {
    legacyO_to_canonicalC: { legacyLabel: 'O'; canonicalLabel: 'C'; coordsMatch: boolean };
    legacyA_to_canonicalA: { legacyLabel: 'A'; canonicalLabel: 'A'; coordsMatch: boolean };
    legacyB_to_canonicalB: { legacyLabel: 'B'; canonicalLabel: 'B'; coordsMatch: boolean };
  };
  sides: {
    legacyA_legOA_to_canonicalSideB: { legacyField: 'triangle.a'; canonicalField: 'triangle.sideB'; delta: number };
    legacyB_legOB_to_canonicalSideA: { legacyField: 'triangle.b'; canonicalField: 'triangle.sideA'; delta: number };
    legacyC_hypAB_to_canonicalSideC: { legacyField: 'triangle.c'; canonicalField: 'triangle.sideC'; delta: number };
  };
  angles: {
    legacyAlpha_to_canonicalAlpha: { legacyField: 'triangle.alphaDeg'; canonicalField: 'triangle.angleAlphaDeg'; deltaDeg: number };
    legacyBeta_to_canonicalBeta: { legacyField: 'triangle.betaDeg'; canonicalField: 'triangle.angleBetaDeg'; deltaDeg: number };
  };
  squaresAndCircles: {
    legacySquareA_to_canonicalSquareB: { areaDelta: number; centerDist: number };
    legacySquareB_to_canonicalSquareA: { areaDelta: number; centerDist: number };
    legacySquareC_to_canonicalSquareC: { areaDelta: number; centerDist: number };
    legacyCircleA_to_canonicalCircleKb: { areaDelta: number; centerDist: number; diameterDelta: number };
    legacyCircleB_to_canonicalCircleKa: { areaDelta: number; centerDist: number; diameterDelta: number };
    legacyCircleC_to_canonicalCircleKc: { areaDelta: number; centerDist: number; diameterDelta: number };
    legacyIncircle_to_canonicalIncircleKi: { areaDelta: number; radiusDelta: number; centerDist: number };
    legacyCircumcircle_to_canonicalCircumcircleKo: { areaDelta: number; radiusDelta: number; centerDist: number };
  };
  incircleTangencies: {
    legacyTangencyOA_to_canonicalTangencySideB: number;
    legacyTangencyOB_to_canonicalTangencySideA: number;
    legacyTangencyAB_to_canonicalTangencySideC: number;
  };
  overallEquivalencePassed: boolean;
  maxDeviation: number;
}
