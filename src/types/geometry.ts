/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface TriangleState {
  a: number; // Vertical leg OA (along +y axis)
  b: number; // Horizontal leg OB (along +x axis)
}

export interface RightTriangleCalculations {
  O: Point2D;
  A: Point2D;
  B: Point2D;
  a: number;
  b: number;
  c: number; // Hypotenuse
  alphaRad: number; // angle at A = arctan(b/a)
  alphaDeg: number;
  betaRad: number;  // angle at B = arctan(a/b)
  betaDeg: number;
  area: number;     // a * b / 2
  perimeter: number;// a + b + c
  altitude: number; // h_c = a * b / c
  altitudePoint: Point2D; // Projection of O onto AB
  projectionA: number; // c_a = a^2 / c
  projectionB: number; // c_b = b^2 / c
}

export interface SquareVertices {
  O: Point2D;
  legVertex: Point2D;
  outerVertex: Point2D;
  baseVertex: Point2D;
  designatedDiagStart: Point2D;
  designatedDiagEnd: Point2D;
  side: number;
  area: number;
}

export interface HypotenuseSquareVertices {
  A: Point2D;  // (0, a)
  B: Point2D;  // (b, 0)
  Bc: Point2D; // (b + a, b)
  Ac: Point2D; // (a, a + b)
  side: number; // c
  area: number; // c^2
}

export interface CircleInSquareGeometry {
  id: 'Ka' | 'Kb' | 'Kc';
  label: string;
  center: Point2D;
  radius: number;
  diameter: number;
  area: number;
  sqrtArea: number;
  tangencyPoints: [Point2D, Point2D, Point2D, Point2D];
}

export interface TriangleIncircleGeometry {
  id: 'Ki';
  label: string;
  center: Point2D; // I = (r, r)
  radius: number;  // r = (a + b - c) / 2
  diameter: number; // 2r
  area: number;    // pi * r^2
  sqrtArea: number; // sqrt(pi) * r
  tangencyOA: Point2D; // (0, r)
  tangencyOB: Point2D; // (r, 0)
  tangencyAB: Point2D; // (r * (1 + a/c), r * (1 + b/c))
}

export interface ThalesCircumcircleGeometry {
  id: 'Ko';
  label: string;
  center: Point2D; // O_o = (A + B) / 2 computed from hypotenuse endpoints A and B
  radius: number;  // R_o = c / 2
  diameter: number; // D_o = c
  area: number;    // K_o = pi * R_o^2 = pi * c^2 / 4
  circumference: number; // L_o = 2 * pi * R_o = pi * c
  sqrtArea: number; // sqrt(K_o) = sqrt(pi) * c / 2
  vertexDistances: {
    toA: number; // |O_o - A|
    toB: number; // |O_o - B|
    toC: number; // |O_o - O| (right-angle vertex)
  };
  angleAtRightVertexDeg: number; // verified angle at right-angle vertex (= 90°)
  areaDiffWithKc: number;        // K_o - K_c (0 up to float64 rounding)
  centerDistanceToKc: number;    // |O_o - O_c| (= c / 2 > 0)
}

export interface FourCirclesCalculations {
  triangle: RightTriangleCalculations;
  squareA: SquareVertices; // Qa on vertical leg OA
  squareB: SquareVertices; // Qb on horizontal leg OB
  squareC: HypotenuseSquareVertices; // Qc on hypotenuse AB

  circleA: CircleInSquareGeometry; // Ka in Qa
  circleB: CircleInSquareGeometry; // Kb in Qb
  circleC: CircleInSquareGeometry; // Kc in Qc
  incircle: TriangleIncircleGeometry; // Ki inside triangle OAB
  circumcircle: ThalesCircumcircleGeometry; // Ko circumscribed around triangle OAB (Thales theorem)

  // Central identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
  sqrtSumLegs: number;       // sqrt(Ka) + sqrt(Kb)
  sqrtSumHypAndIn: number;   // sqrt(Kc) + sqrt(Ki)
  identityResidualAbs: number;
  identityResidualRel: number;

  // Area relations contrast
  areaSumLegs: number;       // Ka + Kb
  pythagoreanAreaDiff: number; // (Ka + Kb) - Kc
  areaMinusAll: number;      // Ka + Kb - Kc - Ki (equals -Ki)
  areaContrastExpected: number; // -Ki
}

export interface InvariantValidation {
  id: string;
  name: string;
  formula: string;
  description: string;
  calculatedValue: string;
  expectedValue: string;
  delta: number;
  isValid: boolean;
  tolerance: number;
}

export interface PresetConfiguration {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  a: number;
  b: number;
  category: 'symmetry' | 'classical' | 'extreme' | 'benchmark';
}

export type ActiveModuleId =
  | 'four_circles'
  | 'identity_proof'
  | 'incircle_focus'
  | 'spectral_analysis'
  | 'thales_circumcircle'
  | 'arc_classification'
  | 'arc_angle_analysis'
  | 'incircle_arc_distribution'
  | 'arc_side_area';

export type DisplayMode = 'school' | 'research';

export type BoardLayerFilter =
  | 'all'
  | 'triangle_incircle'
  | 'squares'
  | 'square_circles'
  | 'four_circles_only'
  | 'thales_only'
  | 'five_circles'
  | 'incenter_partition';

export interface HoveredObject {
  id: string;
  title: string;
  details: string;
  category: 'vertex' | 'segment' | 'polygon' | 'circle';
}

export interface SavedConfiguration {
  id: string;
  name: string;
  a: number;
  b: number;
  savedAt: string;
}
