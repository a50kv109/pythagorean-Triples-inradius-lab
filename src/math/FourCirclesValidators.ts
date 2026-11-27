/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  FourCirclesCalculations,
  InvariantValidation,
  Point2D,
  Vector2D,
} from '../types/geometry.ts';

const DEFAULT_TOLERANCE = 1e-9;

function dist(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function sub(p1: Point2D, p2: Point2D): Vector2D {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

/**
 * Perpendicular distance from point P to infinite line passing through S1 and S2.
 */
function pointToLineDistance(p: Point2D, s1: Point2D, s2: Point2D): number {
  const dx = s2.x - s1.x;
  const dy = s2.y - s1.y;
  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len <= 0) return NaN;
  return Math.abs(dx * (s1.y - p.y) - (s1.x - p.x) * dy) / len;
}

function dotUnit(u: Vector2D, v: Vector2D): number {
  const nu = Math.hypot(u.x, u.y);
  const nv = Math.hypot(v.x, v.y);
  if (!Number.isFinite(nu) || !Number.isFinite(nv) || nu <= 0 || nv <= 0) {
    return NaN;
  }
  return (u.x * v.x + u.y * v.y) / (nu * nv);
}

/**
 * Validates all geometric and analytical invariants of the Four Circles model.
 * All deltas are scale-normalized so invariants hold reliably across micro and macro scales.
 */
export function validateFourCirclesInvariants(
  calc: FourCirclesCalculations,
  tol = DEFAULT_TOLERANCE
): InvariantValidation[] {
  const { triangle, squareA, squareB, squareC, circleA, circleB, circleC, incircle } = calc;
  const { a, b, c } = triangle;
  const hasValidScale = Number.isFinite(c) && c > 0 && Number.isFinite(a) && a > 0 && Number.isFinite(b) && b > 0;

  // 1. Positivity of inradius r = (a + b - c)/2 and strict interior containment inside triangle OAB
  const r = incircle.radius;
  const expectedR = (a / (a + b + c)) * b;
  const rPosValid = Number.isFinite(r) && r > 0;
  // Center I = (r, r) lies in Q1 and strictly below hypotenuse ax + by = ab -> a*r + b*r < a*b
  const insideHypotenuse = r * (a + b) < a * b;
  const deltaR =
    hasValidScale && rPosValid && insideHypotenuse
      ? Math.max(
          Math.abs(r - expectedR) / c,
          Math.abs(incircle.center.x - r) / c,
          Math.abs(incircle.center.y - r) / c
        )
      : NaN;

  // 2. Correctness of squares Qa, Qb, Qc (side lengths & right-angle orthogonality)
  const qcSides = [
    dist(squareC.A, squareC.B),
    dist(squareC.B, squareC.Bc),
    dist(squareC.Bc, squareC.Ac),
    dist(squareC.Ac, squareC.A),
  ];
  const qcOrtho = Math.max(
    Math.abs(dotUnit(sub(squareC.B, squareC.A), sub(squareC.Bc, squareC.B))),
    Math.abs(dotUnit(sub(squareC.Bc, squareC.B), sub(squareC.Ac, squareC.Bc))),
    Math.abs(dotUnit(sub(squareC.Ac, squareC.Bc), sub(squareC.A, squareC.Ac)))
  );
  const qaSides = [
    dist(squareA.O, squareA.legVertex),
    dist(squareA.legVertex, squareA.outerVertex),
    dist(squareA.outerVertex, squareA.baseVertex),
    dist(squareA.baseVertex, squareA.O),
  ];
  const qbSides = [
    dist(squareB.O, squareB.legVertex),
    dist(squareB.legVertex, squareB.outerVertex),
    dist(squareB.outerVertex, squareB.baseVertex),
    dist(squareB.baseVertex, squareB.O),
  ];
  const deltaSquares = hasValidScale
    ? Math.max(
        ...qcSides.map((len) => Math.abs(len - c) / c),
        ...qaSides.map((len) => Math.abs(len - a) / a),
        ...qbSides.map((len) => Math.abs(len - b) / b),
        qcOrtho
      )
    : NaN;

  // 3. Tangency of Ka, Kb, Kc to all 4 sides of squares Qa, Qb, Qc
  const distKaSides = [
    pointToLineDistance(circleA.center, squareA.O, squareA.legVertex),
    pointToLineDistance(circleA.center, squareA.legVertex, squareA.outerVertex),
    pointToLineDistance(circleA.center, squareA.outerVertex, squareA.baseVertex),
    pointToLineDistance(circleA.center, squareA.baseVertex, squareA.O),
  ];
  const distKbSides = [
    pointToLineDistance(circleB.center, squareB.O, squareB.legVertex),
    pointToLineDistance(circleB.center, squareB.legVertex, squareB.outerVertex),
    pointToLineDistance(circleB.center, squareB.outerVertex, squareB.baseVertex),
    pointToLineDistance(circleB.center, squareB.baseVertex, squareB.O),
  ];
  const distKcSides = [
    pointToLineDistance(circleC.center, squareC.A, squareC.B),
    pointToLineDistance(circleC.center, squareC.B, squareC.Bc),
    pointToLineDistance(circleC.center, squareC.Bc, squareC.Ac),
    pointToLineDistance(circleC.center, squareC.Ac, squareC.A),
  ];
  const deltaSquareCircleTangency = hasValidScale
    ? Math.max(
        ...distKaSides.map((d) => Math.abs(d - circleA.radius) / a),
        ...distKbSides.map((d) => Math.abs(d - circleB.radius) / b),
        ...distKcSides.map((d) => Math.abs(d - circleC.radius) / c)
      )
    : NaN;

  // 4. Tangency of incircle Ki to all 3 sides of triangle OAB
  const dI_OA = pointToLineDistance(incircle.center, triangle.O, triangle.A);
  const dI_OB = pointToLineDistance(incircle.center, triangle.O, triangle.B);
  const dI_AB = pointToLineDistance(incircle.center, triangle.A, triangle.B);
  const tangencyPtsDev =
    rPosValid
      ? Math.max(
          Math.abs(dist(incircle.center, incircle.tangencyOA) - r) / r,
          Math.abs(dist(incircle.center, incircle.tangencyOB) - r) / r,
          Math.abs(dist(incircle.center, incircle.tangencyAB) - r) / r,
          pointToLineDistance(incircle.tangencyAB, triangle.A, triangle.B) / c
        )
      : NaN;
  const deltaIncircleTangency =
    rPosValid && hasValidScale
      ? Math.max(
          Math.abs(dI_OA - r) / r,
          Math.abs(dI_OB - r) / r,
          Math.abs(dI_AB - r) / r,
          tangencyPtsDev
        )
      : NaN;

  // 5. Exact areas of all 4 circles (overflow-aware)
  const expectedKa = (Math.PI * a * a) / 4;
  const expectedKb = (Math.PI * b * b) / 4;
  const expectedKc = (Math.PI * c * c) / 4;
  const expectedKi = Math.PI * r * r;
  const areasFinite =
    Number.isFinite(circleA.area) &&
    circleA.area > 0 &&
    Number.isFinite(circleB.area) &&
    circleB.area > 0 &&
    Number.isFinite(circleC.area) &&
    circleC.area > 0 &&
    Number.isFinite(incircle.area) &&
    incircle.area > 0 &&
    Number.isFinite(expectedKa) &&
    expectedKa > 0 &&
    Number.isFinite(expectedKb) &&
    expectedKb > 0 &&
    Number.isFinite(expectedKc) &&
    expectedKc > 0 &&
    Number.isFinite(expectedKi) &&
    expectedKi > 0;

  const deltaAreas = areasFinite
    ? Math.max(
        Math.abs(circleA.area - expectedKa) / expectedKa,
        Math.abs(circleB.area - expectedKb) / expectedKb,
        Math.abs(circleC.area - expectedKc) / expectedKc,
        Math.abs(incircle.area - expectedKi) / expectedKi
      )
    : NaN;

  // 6. Central Four-Circle Identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
  const sqrtKa = Math.sqrt(circleA.area);
  const sqrtKb = Math.sqrt(circleB.area);
  const sqrtKc = Math.sqrt(circleC.area);
  const sqrtKi = Math.sqrt(incircle.area);
  const lhs = sqrtKa + sqrtKb;
  const rhs = sqrtKc + sqrtKi;
  const rootsFinite =
    Number.isFinite(lhs) &&
    lhs > 0 &&
    Number.isFinite(rhs) &&
    rhs > 0 &&
    Number.isFinite(calc.sqrtSumLegs) &&
    Number.isFinite(calc.sqrtSumHypAndIn);
  const deltaCentralIdentity = rootsFinite
    ? Math.max(
        Math.abs(lhs - rhs) / lhs,
        Math.abs(calc.sqrtSumLegs - calc.sqrtSumHypAndIn) / lhs,
        Math.abs(lhs - calc.sqrtSumLegs) / lhs,
        Math.abs(rhs - calc.sqrtSumHypAndIn) / lhs
      )
    : NaN;

  // 7. Pythagorean Circle Area Identity: Ka + Kb = Kc
  const deltaPythCircles = areasFinite
    ? Math.abs(circleA.area + circleB.area - circleC.area) / circleC.area
    : NaN;

  // 8. Area Non-Equality Contrast: Ka + Kb - Kc - Ki = -Ki
  const contrastActual = circleA.area + circleB.area - circleC.area - incircle.area;
  const contrastExpected = -incircle.area;
  const deltaContrast = areasFinite
    ? Math.abs(contrastActual - contrastExpected) / circleC.area
    : NaN;

  return [
    {
      id: 'incircle_positive',
      name: 'Положительность вписанного радиуса r',
      formula: 'r = \\frac{a + b - c}{2} > 0, \\; I = (r, r)',
      description: 'Вписанная окружность K_i существует, r > 0 и центр I строго внутри треугольника OAB.',
      calculatedValue: rPosValid ? `r = ${r.toPrecision(6)}` : 'Invalid',
      expectedValue: `r = ${expectedR.toPrecision(6)}`,
      delta: deltaR,
      isValid: Number.isFinite(deltaR) && deltaR < tol,
      tolerance: tol,
    },
    {
      id: 'squares_construction',
      name: 'Построение трёх квадратов Q_a, Q_b, Q_c',
      formula: 'Q_a = a^2, \\; Q_b = b^2, \\; Q_c = c^2',
      description: 'Все стороны квадратов равны соответствующим сторонам треугольника, углы строго 90°.',
      calculatedValue: `c = ${c.toPrecision(6)}`,
      expectedValue: `√(a²+b²) = ${Math.hypot(a, b).toPrecision(6)}`,
      delta: deltaSquares,
      isValid: Number.isFinite(deltaSquares) && deltaSquares < tol,
      tolerance: tol,
    },
    {
      id: 'square_circles_tangency',
      name: 'Касание K_a, K_b, K_c сторон квадратов',
      formula: 'd(O_k, \\text{sides } Q_k) = r_k = \\frac{s_k}{2}',
      description: 'Каждая из трёх окружностей в квадратах касается всех четырёх сторон своего квадрата.',
      calculatedValue: `r_a=${circleA.radius.toPrecision(4)}, r_b=${circleB.radius.toPrecision(4)}, r_c=${circleC.radius.toPrecision(4)}`,
      expectedValue: `a/2, b/2, c/2`,
      delta: deltaSquareCircleTangency,
      isValid: Number.isFinite(deltaSquareCircleTangency) && deltaSquareCircleTangency < tol,
      tolerance: tol,
    },
    {
      id: 'incircle_tangency',
      name: 'Касание K_i всех сторон треугольника',
      formula: 'd(I, OA) = d(I, OB) = d(I, AB) = r',
      description: 'Четвёртая окружность K_i касается обоих катетов и гипотенузы треугольника OAB.',
      calculatedValue: `d = (${dI_OA.toPrecision(4)}, ${dI_OB.toPrecision(4)}, ${dI_AB.toPrecision(4)})`,
      expectedValue: `r = ${r.toPrecision(4)}`,
      delta: deltaIncircleTangency,
      isValid: Number.isFinite(deltaIncircleTangency) && deltaIncircleTangency < tol,
      tolerance: tol,
    },
    {
      id: 'four_circle_areas',
      name: 'Точность площадей четырёх кругов',
      formula: 'K_a=\\frac{\\pi a^2}{4},\\; K_b=\\frac{\\pi b^2}{4},\\; K_c=\\frac{\\pi c^2}{4},\\; K_i=\\pi r^2',
      description: 'Согласованность вычисленных площадей всех четырёх окружностей с их аналитическими формулами.',
      calculatedValue: areasFinite ? `K_i = ${incircle.area.toPrecision(5)}` : 'Overflow',
      expectedValue: areasFinite ? `πr² = ${expectedKi.toPrecision(5)}` : 'Overflow',
      delta: deltaAreas,
      isValid: Number.isFinite(deltaAreas) && deltaAreas < tol,
      tolerance: tol,
    },
    {
      id: 'central_sqrt_identity',
      name: 'Центральное тождество корней площадей',
      formula: '\\sqrt{K_a} + \\sqrt{K_b} = \\sqrt{K_c} + \\sqrt{K_i}',
      description: 'Сумма квадратных корней из площадей кругов на катетах равна сумме корней для гипотенузы и вписанного круга.',
      calculatedValue: rootsFinite ? lhs.toPrecision(8) : 'Overflow',
      expectedValue: rootsFinite ? rhs.toPrecision(8) : 'Overflow',
      delta: deltaCentralIdentity,
      isValid: Number.isFinite(deltaCentralIdentity) && deltaCentralIdentity < tol,
      tolerance: tol,
    },
    {
      id: 'pythagorean_circle_areas',
      name: 'Пифагорова сумма площадей на сторонах',
      formula: 'K_a + K_b = K_c',
      description: 'Сумма площадей кругов в квадратах на катетах равна площади круга на гипотенузе.',
      calculatedValue: areasFinite ? (circleA.area + circleB.area).toPrecision(6) : 'Overflow',
      expectedValue: areasFinite ? circleC.area.toPrecision(6) : 'Overflow',
      delta: deltaPythCircles,
      isValid: Number.isFinite(deltaPythCircles) && deltaPythCircles < tol,
      tolerance: tol,
    },
    {
      id: 'area_non_equality_contrast',
      name: 'Отличие тождества от суммы площадей',
      formula: 'K_a + K_b - K_c - K_i = -K_i \\neq 0',
      description: 'Прямая сумма площадей не равна K_c + K_i: расхождение строго равно -K_i < 0.',
      calculatedValue: areasFinite ? contrastActual.toPrecision(6) : 'Overflow',
      expectedValue: areasFinite ? contrastExpected.toPrecision(6) : 'Overflow',
      delta: deltaContrast,
      isValid: Number.isFinite(deltaContrast) && deltaContrast < tol,
      tolerance: tol,
    },
  ];
}
