/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type { CanonicalFourCirclesModel, CanonicalInvariantCheckResult } from './types.ts';

export const CANONICAL_DEFAULT_TOLERANCE = 1e-9;

function dist(p: { x: number; y: number }, q: { x: number; y: number }): number {
  return Math.hypot(p.x - q.x, p.y - q.y);
}

function pointToLineDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len === 0) return Number.POSITIVE_INFINITY;
  return Math.abs(dx * (a.y - p.y) - (a.x - p.x) * dy) / len;
}

/**
 * Validates the 8 canonical Four-Circles invariants independently of Legacy validators.
 */
export function validateCanonicalFourCirclesInvariants(
  model: CanonicalFourCirclesModel,
  tolerance = CANONICAL_DEFAULT_TOLERANCE
): CanonicalInvariantCheckResult[] {
  const {
    triangle,
    squareA,
    squareB,
    squareC,
    circleKa,
    circleKb,
    circleKc,
    incircleKi,
    sqrtSumLegs,
    sqrtSumHypAndIn,
    areaSumLegs,
    areaMinusAll,
  } = model;
  const { sideA, sideB, sideC, vertexA, vertexB, vertexC } = triangle;
  const r = incircleKi.radius;

  // 1. Incircle positivity & position (scale-invariant relative to r and sideC)
  const dAB = pointToLineDistance(incircleKi.center, vertexA, vertexB);
  const dBC = pointToLineDistance(incircleKi.center, vertexB, vertexC);
  const dAC = pointToLineDistance(incircleKi.center, vertexA, vertexC);
  const incirclePosDelta =
    Math.max(Math.abs(dAB - r), Math.abs(dBC - r), Math.abs(dAC - r)) / Math.max(1e-300, r);

  // 2. Squares construction (equal sides & perpendicular edges)
  const checkSquare = (sq: typeof squareA, expectedLen: number): number => {
    const [v0, v1, v2, v3] = sq.vertices;
    const e0 = dist(v0, v1);
    const e1 = dist(v1, v2);
    const e2 = dist(v2, v3);
    const e3 = dist(v3, v0);
    const diag1 = dist(v0, v2);
    const diag2 = dist(v1, v3);
    const lenErr = Math.max(
      Math.abs(e0 - expectedLen),
      Math.abs(e1 - expectedLen),
      Math.abs(e2 - expectedLen),
      Math.abs(e3 - expectedLen)
    );
    const diagErr = Math.max(
      Math.abs(diag1 - expectedLen * Math.SQRT2),
      Math.abs(diag2 - expectedLen * Math.SQRT2)
    );
    return Math.max(lenErr, diagErr) / Math.max(1e-300, expectedLen);
  };
  const squaresDelta = Math.max(
    checkSquare(squareA, sideA),
    checkSquare(squareB, sideB),
    checkSquare(squareC, sideC)
  );

  // 3. Square-circle tangencies
  const checkCircleInSq = (c: typeof circleKa): number => {
    const radErr = c.tangencyPoints.map((tp) => Math.abs(dist(c.center, tp) - c.radius));
    return Math.max(...radErr) / Math.max(1e-300, c.radius);
  };
  const sqCircleTangencyDelta = Math.max(
    checkCircleInSq(circleKa),
    checkCircleInSq(circleKb),
    checkCircleInSq(circleKc)
  );

  // 4. Incircle tangency points T_a, T_b, T_c
  const incircleTanDelta =
    Math.max(
      Math.abs(dist(incircleKi.center, incircleKi.tangencySideA) - r),
      Math.abs(dist(incircleKi.center, incircleKi.tangencySideB) - r),
      Math.abs(dist(incircleKi.center, incircleKi.tangencySideC) - r),
      pointToLineDistance(incircleKi.tangencySideA, vertexB, vertexC),
      pointToLineDistance(incircleKi.tangencySideB, vertexA, vertexC),
      pointToLineDistance(incircleKi.tangencySideC, vertexA, vertexB)
    ) / Math.max(1e-300, r);

  // 5. Four circle areas match analytic pi*d^2/4 and pi*r^2
  const expKa = (Math.PI * sideA * sideA) / 4;
  const expKb = (Math.PI * sideB * sideB) / 4;
  const expKc = (Math.PI * sideC * sideC) / 4;
  const expKi = Math.PI * r * r;
  const areasDelta = Math.max(
    Math.abs(circleKa.area - expKa) / Math.max(1e-300, expKa),
    Math.abs(circleKb.area - expKb) / Math.max(1e-300, expKb),
    Math.abs(circleKc.area - expKc) / Math.max(1e-300, expKc),
    Math.abs(incircleKi.area - expKi) / Math.max(1e-300, expKi)
  );

  // 6. Central sqrt identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
  const sqrtDelta = Math.abs(sqrtSumLegs - sqrtSumHypAndIn) / Math.max(1e-300, sqrtSumLegs);

  // 7. Pythagorean circle area equality: Ka + Kb = Kc
  const pythAreaDelta = Math.abs(areaSumLegs - circleKc.area) / Math.max(1e-300, circleKc.area);

  // 8. Area non-equality contrast: Ka + Kb - Kc - Ki = -Ki != 0
  const contrastDelta =
    Math.abs(areaMinusAll + incircleKi.area) / Math.max(1e-300, incircleKi.area);

  return [
    {
      id: 'incircle_positive',
      name: 'Incircle Positivity & Equidistance (K_i)',
      isValid: r > 0 && incirclePosDelta <= tolerance,
      delta: incirclePosDelta,
      tolerance,
      details: `r=${r}, relDelta=${incirclePosDelta.toExponential(2)}`,
    },
    {
      id: 'squares_construction',
      name: 'Exterior Squares Construction (Q_a on BC, Q_b on AC, Q_c on AB)',
      isValid: squaresDelta <= tolerance,
      delta: squaresDelta,
      tolerance,
      details: `maxRelErr=${squaresDelta.toExponential(2)}`,
    },
    {
      id: 'square_circles_tangency',
      name: 'Square-Inscribed Circles Tangency (K_a, K_b, K_c)',
      isValid: sqCircleTangencyDelta <= tolerance,
      delta: sqCircleTangencyDelta,
      tolerance,
      details: `maxRelErr=${sqCircleTangencyDelta.toExponential(2)}`,
    },
    {
      id: 'incircle_tangency',
      name: 'Incircle Tangency on Sides a, b, c (T_a, T_b, T_c)',
      isValid: incircleTanDelta <= tolerance,
      delta: incircleTanDelta,
      tolerance,
      details: `maxRelErr=${incircleTanDelta.toExponential(2)}`,
    },
    {
      id: 'four_circle_areas',
      name: 'Four Circle Area Formulas (K_a, K_b, K_c, K_i)',
      isValid: areasDelta <= tolerance,
      delta: areasDelta,
      tolerance,
      details: `maxRelErr=${areasDelta.toExponential(2)}`,
    },
    {
      id: 'central_sqrt_identity',
      name: 'Central Identity: √K_a + √K_b = √K_c + √K_i',
      isValid: sqrtDelta <= tolerance,
      delta: sqrtDelta,
      tolerance,
      details: `relErr=${sqrtDelta.toExponential(2)}`,
    },
    {
      id: 'pythagorean_circle_areas',
      name: 'Pythagorean Circle Area Law: K_a + K_b = K_c',
      isValid: pythAreaDelta <= tolerance,
      delta: pythAreaDelta,
      tolerance,
      details: `relErr=${pythAreaDelta.toExponential(2)}`,
    },
    {
      id: 'area_non_equality_contrast',
      name: 'Area Contrast: K_a + K_b - K_c - K_i = -K_i ≠ 0',
      isValid: areaMinusAll < 0 && contrastDelta <= tolerance,
      delta: contrastDelta,
      tolerance,
      details: `relErr=${contrastDelta.toExponential(2)}`,
    },
  ];
}
