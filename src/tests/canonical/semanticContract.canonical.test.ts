/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * TASK 3 — CANONICAL SEMANTIC CONTRACT VERIFICATION SUITE
 *
 * Independent mathematical & geometric verification of:
 *   1. Five-circle correspondence (Ka, Kb, Kc, Ki, Ko) by coordinates, tangencies, and roles (NOT names)
 *   2. Three-square correspondence (Qa, Qb, Qc) by vertex geometry, half-planes, and areas
 *   3. Side <-> Opposite-Vertex relationship, Law of Sines, and 3-layer object identity catalog
 *   4. Exact definition & spectral formulas of `shapeRatio` (= sideA / sideB = tan(alpha) === legacy t)
 *   5. Reciprocal inversion of `shapeRatio` under leg swap (sideA <-> sideB) and spectral duality
 *   6. Non-conflict of `shapeRatio` with triangle angles alpha, beta, gamma
 *   7. Non-conflict of `shapeRatio` with incircle tangent segments `tangentSegA/B/C` (legacy t_A/B/C)
 */

import assert from 'node:assert/strict';
import {
  CANONICAL_SHAPE_RATIO_DEFINITION,
  CANONICAL_SHAPE_RATIO_PASSPORT,
  buildCanonicalObjectIdentityCatalog,
  calculateCanonicalFourCircles,
  computeCanonicalShapeRatio,
  evaluateCanonicalSpectralByShapeRatio,
  verifyLegacyToCanonicalMapping,
} from '../../canonical/index.ts';
import { calculateFourCircles as calculateLegacyFourCircles } from '../../math/FourCirclesModel.ts';
import { evaluateParametricFourCircles as evaluateLegacyParametric } from '../../math/FourCirclesSpectralAnalysis.ts';
import { computeArcSideAreaPoint } from '../../math/experiments/arcSideAreaCorrespondence.ts';

const TOL = 1e-11;

function assertClose(actual: number, expected: number, label: string, tol = TOL): void {
  const diff = Math.abs(actual - expected);
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(diff <= tol * scale, `${label}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function pointToLineDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

console.log('Running Task 3 — Canonical Semantic Contract Verification Suite...\n');

const testCases = [
  { sideA: 4, sideB: 3, label: '(sideA=4, sideB=3) <- Legacy (3,4)' },
  { sideA: 12, sideB: 5, label: '(sideA=12, sideB=5) <- Legacy (5,12)' },
  { sideA: 1.75, sideB: 6.2, label: '(sideA=1.75, sideB=6.2)' },
];

// ============================================================================
// 1. All Five Circles Correspondence (Geometric Properties, NOT Names)
// ============================================================================
for (const tc of testCases) {
  const canon = calculateCanonicalFourCircles(tc.sideA, tc.sideB);
  // In Vertex-Preserving Legacy (O, A, B) -> Canonical (C, A, B):
  // legacy legOA = sideB, legacy legOB = sideA
  const legacy = calculateLegacyFourCircles(tc.sideB, tc.sideA);
  const catalog = buildCanonicalObjectIdentityCatalog(canon);

  // Ka (on sideA = BC, opposite vertex A) === legacy.circleB (on OB, quadrant IV)
  assertClose(canon.circleKa.center.x, tc.sideA / 2, `${tc.label}: Ka.center.x`);
  assertClose(canon.circleKa.center.y, -tc.sideA / 2, `${tc.label}: Ka.center.y (quadrant IV)`);
  assertClose(canon.circleKa.radius, tc.sideA / 2, `${tc.label}: Ka.radius`);
  assertClose(canon.circleKa.center.x, legacy.circleB.center.x, `${tc.label}: Ka===legacy.circleB center.x`);
  assertClose(canon.circleKa.center.y, legacy.circleB.center.y, `${tc.label}: Ka===legacy.circleB center.y`);
  assertClose(canon.circleKa.area, legacy.circleB.area, `${tc.label}: Ka===legacy.circleB area`);
  // Geometric check: Ka touches segment BC [(0,0),(sideA,0)] at its midpoint (sideA/2, 0)
  assertClose(
    pointToLineDistance(canon.circleKa.center, canon.triangle.vertexB, canon.triangle.vertexC),
    canon.circleKa.radius,
    `${tc.label}: Ka distance to sideA (BC) equals radius`
  );

  // Kb (on sideB = AC, opposite vertex B) === legacy.circleA (on OA, quadrant II)
  assertClose(canon.circleKb.center.x, -tc.sideB / 2, `${tc.label}: Kb.center.x (quadrant II)`);
  assertClose(canon.circleKb.center.y, tc.sideB / 2, `${tc.label}: Kb.center.y`);
  assertClose(canon.circleKb.radius, tc.sideB / 2, `${tc.label}: Kb.radius`);
  assertClose(canon.circleKb.center.x, legacy.circleA.center.x, `${tc.label}: Kb===legacy.circleA center.x`);
  assertClose(canon.circleKb.center.y, legacy.circleA.center.y, `${tc.label}: Kb===legacy.circleA center.y`);
  assertClose(canon.circleKb.area, legacy.circleA.area, `${tc.label}: Kb===legacy.circleA area`);
  assertClose(
    pointToLineDistance(canon.circleKb.center, canon.triangle.vertexA, canon.triangle.vertexC),
    canon.circleKb.radius,
    `${tc.label}: Kb distance to sideB (AC) equals radius`
  );

  // Kc (on sideC = AB, opposite right vertex C) === legacy.circleC (quadrant I)
  const halfSum = (tc.sideA + tc.sideB) / 2;
  assertClose(canon.circleKc.center.x, halfSum, `${tc.label}: Kc.center.x`);
  assertClose(canon.circleKc.center.y, halfSum, `${tc.label}: Kc.center.y`);
  assertClose(canon.circleKc.radius, canon.triangle.sideC / 2, `${tc.label}: Kc.radius`);
  assertClose(canon.circleKc.area, legacy.circleC.area, `${tc.label}: Kc===legacy.circleC area`);
  assertClose(
    pointToLineDistance(canon.circleKc.center, canon.triangle.vertexA, canon.triangle.vertexB),
    canon.circleKc.radius,
    `${tc.label}: Kc tangent to hypotenuse AB`
  );

  // Ki (incircle tangent to all three sides) === legacy.incircle
  assertClose(canon.incircleKi.center.x, legacy.incircle.center.x, `${tc.label}: Ki===legacy.incircle center.x`);
  assertClose(canon.incircleKi.center.y, legacy.incircle.center.y, `${tc.label}: Ki===legacy.incircle center.y`);
  assertClose(canon.incircleKi.radius, legacy.incircle.radius, `${tc.label}: Ki===legacy.incircle radius`);
  assertClose(
    pointToLineDistance(canon.incircleKi.center, canon.triangle.vertexB, canon.triangle.vertexC),
    canon.incircleKi.radius,
    `${tc.label}: Ki tangent to sideA`
  );
  assertClose(
    pointToLineDistance(canon.incircleKi.center, canon.triangle.vertexA, canon.triangle.vertexC),
    canon.incircleKi.radius,
    `${tc.label}: Ki tangent to sideB`
  );
  assertClose(
    pointToLineDistance(canon.incircleKi.center, canon.triangle.vertexA, canon.triangle.vertexB),
    canon.incircleKi.radius,
    `${tc.label}: Ki tangent to sideC`
  );

  // Ko (Thales circumcircle passing through A, B, C) === legacy.circumcircle
  assertClose(canon.circumcircleKo.center.x, tc.sideA / 2, `${tc.label}: Ko.center.x`);
  assertClose(canon.circumcircleKo.center.y, tc.sideB / 2, `${tc.label}: Ko.center.y`);
  assertClose(canon.circumcircleKo.center.x, legacy.circumcircle.center.x, `${tc.label}: Ko===legacy.circumcircle center.x`);
  assertClose(canon.circumcircleKo.center.y, legacy.circumcircle.center.y, `${tc.label}: Ko===legacy.circumcircle center.y`);
  assertClose(canon.circumcircleKo.vertexDistances.toA, canon.circumcircleKo.radius, `${tc.label}: |Ko-A|=Ro`);
  assertClose(canon.circumcircleKo.vertexDistances.toB, canon.circumcircleKo.radius, `${tc.label}: |Ko-B|=Ro`);
  assertClose(canon.circumcircleKo.vertexDistances.toC, canon.circumcircleKo.radius, `${tc.label}: |Ko-C|=Ro`);

  // Verify semantic catalog completeness for all 5 circles and 3 squares
  assert.equal(
    catalog.filter((r) => r.layer3_canonicalId.startsWith('circle') || r.layer3_canonicalId.includes('Ki') || r.layer3_canonicalId.includes('Ko')).length,
    5
  );
  assert.equal(catalog.filter((r) => r.layer3_canonicalId.startsWith('square')).length, 3);
}

// ============================================================================
// 2. All Three Squares Correspondence (Qa, Qb, Qc)
// ============================================================================
{
  const canon = calculateCanonicalFourCircles(7, 3);
  const legacy = calculateLegacyFourCircles(3, 7);
  const { mapping } = verifyLegacyToCanonicalMapping(legacy, 1e-12);
  assert.equal(mapping.overallEquivalencePassed, true);

  // squareA (attached to sideA = BC, opposite A) === legacy.squareB
  assert.equal(canon.squareA.attachedSide, 'sideA');
  assertClose(canon.squareA.area, legacy.squareB.area, 'squareA.area === legacy.squareB.area');
  assert.ok(canon.squareA.center.x > 0 && canon.squareA.center.y < 0, 'squareA lies in quadrant IV');
  // Every vertex of squareA matches legacy.squareB vertex set
  const legSqBPts = [legacy.squareB.O, legacy.squareB.legVertex, legacy.squareB.outerVertex, legacy.squareB.baseVertex];
  for (const v of canon.squareA.vertices) {
    assert.ok(legSqBPts.some((lp) => Math.hypot(lp.x - v.x, lp.y - v.y) <= TOL), 'squareA vertex matches legacy.squareB');
  }

  // squareB (attached to sideB = AC, opposite B) === legacy.squareA
  assert.equal(canon.squareB.attachedSide, 'sideB');
  assertClose(canon.squareB.area, legacy.squareA.area, 'squareB.area === legacy.squareA.area');
  assert.ok(canon.squareB.center.x < 0 && canon.squareB.center.y > 0, 'squareB lies in quadrant II');
  const legSqAPts = [legacy.squareA.O, legacy.squareA.legVertex, legacy.squareA.outerVertex, legacy.squareA.baseVertex];
  for (const v of canon.squareB.vertices) {
    assert.ok(legSqAPts.some((lp) => Math.hypot(lp.x - v.x, lp.y - v.y) <= TOL), 'squareB vertex matches legacy.squareA');
  }

  // squareC (attached to sideC = AB, opposite C) === legacy.squareC
  assert.equal(canon.squareC.attachedSide, 'sideC');
  assertClose(canon.squareC.area, legacy.squareC.area, 'squareC.area === legacy.squareC.area');
  const legSqCPts = [legacy.squareC.A, legacy.squareC.B, legacy.squareC.Bc, legacy.squareC.Ac];
  for (const v of canon.squareC.vertices) {
    assert.ok(legSqCPts.some((lp) => Math.hypot(lp.x - v.x, lp.y - v.y) <= TOL), 'squareC vertex matches legacy.squareC');
  }
}

// ============================================================================
// 3. Side <-> Opposite Vertex Correspondence & Law of Sines
// ============================================================================
for (const tc of testCases) {
  const { triangle } = calculateCanonicalFourCircles(tc.sideA, tc.sideB);

  // Opposite vertex is strictly NOT on the line of its opposite side:
  // dist(A, line(BC)) === sideB > 0; dist(B, line(AC)) === sideA > 0;
  assertClose(pointToLineDistance(triangle.vertexA, triangle.vertexB, triangle.vertexC), triangle.sideB, `${tc.label}: A opp BC`);
  assertClose(pointToLineDistance(triangle.vertexB, triangle.vertexA, triangle.vertexC), triangle.sideA, `${tc.label}: B opp AC`);
  // Endpoints of sideA are B and C (neither is A); endpoints of sideB are A and C (neither is B)
  assert.ok(Math.hypot(triangle.vertexB.x - triangle.vertexC.x, triangle.vertexB.y - triangle.vertexC.y) > 0);
  assertClose(Math.hypot(triangle.vertexB.x - triangle.vertexC.x, triangle.vertexB.y - triangle.vertexC.y), triangle.sideA, `${tc.label}: |BC| === sideA`);
  assertClose(Math.hypot(triangle.vertexA.x - triangle.vertexC.x, triangle.vertexA.y - triangle.vertexC.y), triangle.sideB, `${tc.label}: |AC| === sideB`);
  assertClose(Math.hypot(triangle.vertexA.x - triangle.vertexB.x, triangle.vertexA.y - triangle.vertexB.y), triangle.sideC, `${tc.label}: |AB| === sideC`);

  // Law of Sines without index swap: a / sin(alpha) === b / sin(beta) === c
  assertClose(triangle.sideA / Math.sin(triangle.angleAlphaRad), triangle.sideC, `${tc.label}: a/sin(alpha)=c`);
  assertClose(triangle.sideB / Math.sin(triangle.angleBetaRad), triangle.sideC, `${tc.label}: b/sin(beta)=c`);
  // Strict monotonicity a > b <=> alpha > beta
  assert.equal(triangle.sideA > triangle.sideB, triangle.angleAlphaDeg > triangle.angleBetaDeg, `${tc.label}: a>b <=> alpha>beta`);
}

// ============================================================================
// 4. Exact Definition of `shapeRatio` & Spectral Correspondence vs Legacy `t`
// ============================================================================
{
  assert.equal(CANONICAL_SHAPE_RATIO_DEFINITION, 'sideA / sideB');
  assert.equal(CANONICAL_SHAPE_RATIO_PASSPORT.canonicalName, 'shapeRatio');
  assert.equal(CANONICAL_SHAPE_RATIO_PASSPORT.definition, 'sideA / sideB');

  for (const rho of [0.1, 0.5, 1.0, 4 / 3, 2.0, 10.0]) {
    const spec = evaluateCanonicalSpectralByShapeRatio(rho);
    const legSpec = evaluateLegacyParametric(rho); // legacy t = b_leg / a_leg = rho

    assert.equal(spec.shapeRatioDefinition, 'sideA / sideB');
    assertClose(spec.shapeRatio, rho, `rho=${rho}: shapeRatio`);
    assertClose(spec.sideANorm / spec.sideBNorm, rho, `rho=${rho}: sideA/sideB`);
    assertClose(spec.sideCNorm, Math.hypot(rho, 1), `rho=${rho}: cNorm`);

    // Exact analytic spectral formulas in terms of rho = sideA / sideB
    assertClose(spec.areaRatiosToKc.Ka, (rho * rho) / (1 + rho * rho), `rho=${rho}: Ka/Kc = rho^2/(1+rho^2)`);
    assertClose(spec.areaRatiosToKc.Kb, 1 / (1 + rho * rho), `rho=${rho}: Kb/Kc = 1/(1+rho^2)`);
    const expKiOverKc = Math.pow(rho + 1 - Math.hypot(rho, 1), 2) / (1 + rho * rho);
    assertClose(spec.areaRatiosToKc.Ki, expKiOverKc, `rho=${rho}: Ki/Kc analytic`);

    // Legacy bridge check: Ka_canon === Kb_leg, Kb_canon === Ka_leg, Ki_canon === Ki_leg
    assertClose(spec.areaRatiosToKc.Ka, legSpec.areas.Kb, `rho=${rho}: Ka_canon === Kb_legacy`);
    assertClose(spec.areaRatiosToKc.Kb, legSpec.areas.Ka, `rho=${rho}: Kb_canon === Ka_legacy`);
    assertClose(spec.areaRatiosToKc.Ki, legSpec.areas.Ki, `rho=${rho}: Ki_canon === Ki_legacy`);
  }

  // Degree-0 homogeneity under scale lambda > 0: shapeRatio(lambda * a, lambda * b) === shapeRatio(a, b)
  const baseRho = computeCanonicalShapeRatio(7, 3);
  for (const lambda of [0.25, 1, 7.5, 1e4]) {
    const scaled = calculateCanonicalFourCircles(7 * lambda, 3 * lambda);
    assertClose(scaled.triangle.shapeRatio, baseRho, `scale lambda=${lambda}: shapeRatio invariant`);
    assertClose(scaled.triangle.shapeRatio, Math.tan(scaled.triangle.angleAlphaRad), `scale lambda=${lambda}: shapeRatio = tan(alpha)`);
    assertClose(scaled.triangle.shapeRatio, 1 / Math.tan(scaled.triangle.angleBetaRad), `scale lambda=${lambda}: shapeRatio = cot(beta)`);
  }
}

// ============================================================================
// 5. Inversion of `shapeRatio` Under Leg Swap (sideA <-> sideB)
// ============================================================================
{
  const m1 = calculateCanonicalFourCircles(7, 3);
  const m2 = calculateCanonicalFourCircles(3, 7);
  assertClose(m1.triangle.shapeRatio * m2.triangle.shapeRatio, 1, 'rho(a,b) * rho(b,a) === 1');
  assertClose(m2.triangle.shapeRatio, m1.triangle.ratioSideBToSideA, 'rho(b,a) === 1 / rho(a,b)');
  assertClose(Math.log(m1.triangle.shapeRatio) + Math.log(m2.triangle.shapeRatio), 0, 'ln(rho) + ln(1/rho) === 0');

  const sp1 = evaluateCanonicalSpectralByShapeRatio(m1.triangle.shapeRatio);
  const sp2 = evaluateCanonicalSpectralByShapeRatio(m2.triangle.shapeRatio);
  assertClose(sp1.areaRatiosToKc.Ka, sp2.areaRatiosToKc.Kb, 'Spectral swap: Ka(rho) === Kb(1/rho)');
  assertClose(sp1.areaRatiosToKc.Kb, sp2.areaRatiosToKc.Ka, 'Spectral swap: Kb(rho) === Ka(1/rho)');
  assertClose(sp1.areaRatiosToKc.Ki, sp2.areaRatiosToKc.Ki, 'Spectral swap: Ki(rho) === Ki(1/rho)');
}

// ============================================================================
// 6. Zero Conflict Between `shapeRatio` and Angles alpha, beta, gamma
// ============================================================================
{
  // Angle measures are bounded: alpha, beta in (0, pi/2) rad = (0, 90) deg; gamma = 90 deg.
  // shapeRatio spans (0, +infinity) and equals tan(alpha), NOT alpha or beta.
  for (const [sideA, sideB] of [
    [1, 100],
    [1, 1],
    [10, 3],
    [150, 1],
  ]) {
    const { triangle } = calculateCanonicalFourCircles(sideA, sideB);
    assert.ok(triangle.shapeRatio > 0 && Number.isFinite(triangle.shapeRatio));
    // Verify mathematical identity shapeRatio === tan(angleAlphaRad) !== angleAlphaRad (tan(x) > x for all x in (0, pi/2))
    assertClose(triangle.shapeRatio, Math.tan(triangle.angleAlphaRad), `(${sideA},${sideB}): shapeRatio=tan(alpha)`);
    assert.ok(
      triangle.shapeRatio > triangle.angleAlphaRad &&
        triangle.shapeRatio - triangle.angleAlphaRad > 1e-9,
      `(${sideA},${sideB}): shapeRatio strictly exceeds angleAlphaRad`
    );
    assert.ok(
      Math.abs(triangle.shapeRatio - triangle.angleAlphaDeg) > 1e-2,
      `(${sideA},${sideB}): shapeRatio !== alphaDeg`
    );
  }
  // Unboundedness witness above right angle 90 deg:
  const tall = calculateCanonicalFourCircles(200, 1);
  assert.ok(tall.triangle.shapeRatio === 200 && tall.triangle.shapeRatio > tall.triangle.angleGammaDeg);
}

// ============================================================================
// 7. Zero Conflict Between `shapeRatio` and Tangent Segments (`tangentSegA/B/C`)
// ============================================================================
{
  const mBase = calculateCanonicalFourCircles(4, 3); // (sideA=4, sideB=3, sideC=5, r=1, p=6)
  const partBase = mBase.incenterPartition;

  // Classic tangent segment identities:
  // tangentSegA = p - a = 2, tangentSegB = p - b = 3, tangentSegC = p - c = r = 1
  assertClose(partBase.tangentSegA, 2, '(4,3,5): tangentSegA = p - sideA = 2');
  assertClose(partBase.tangentSegB, 3, '(4,3,5): tangentSegB = p - sideB = 3');
  assertClose(partBase.tangentSegC, 1, '(4,3,5): tangentSegC = p - sideC = r = 1');

  // Side decomposition & half-angle formulas:
  assertClose(partBase.tangentSegA + partBase.tangentSegC, mBase.triangle.sideB, 'tA + tC === sideB');
  assertClose(partBase.tangentSegB + partBase.tangentSegC, mBase.triangle.sideA, 'tB + tC === sideA');
  assertClose(partBase.tangentSegA + partBase.tangentSegB, mBase.triangle.sideC, 'tA + tB === sideC');
  assertClose(
    partBase.tangentSegA,
    mBase.incircleKi.radius / Math.tan(mBase.triangle.angleAlphaRad / 2),
    'tangentSegA === r * cot(alpha/2)'
  );
  assertClose(
    partBase.tangentSegB,
    mBase.incircleKi.radius / Math.tan(mBase.triangle.angleBetaRad / 2),
    'tangentSegB === r * cot(beta/2)'
  );

  // Cross-check against Exp 06 computeArcSideAreaPoint (where input alphaDeg = canonical angleBetaDeg)
  const exp06 = computeArcSideAreaPoint(mBase.incircleKi.radius, mBase.triangle.angleBetaDeg);
  assertClose(partBase.tangentSegA, exp06.tangentSegA, 'Canonical tangentSegA matches Exp 06 t_A');
  assertClose(partBase.tangentSegB, exp06.tangentSegB, 'Canonical tangentSegB matches Exp 06 t_B');
  assertClose(partBase.tangentSegC, exp06.tangentSegC, 'Canonical tangentSegC matches Exp 06 t_C');

  // Dimensional separation check: scaling by lambda = 5 scales tangentSegX by 5 (degree 1)
  // while leaving shapeRatio = 4/3 unchanged (degree 0)!
  const mScaled = calculateCanonicalFourCircles(4 * 5, 3 * 5);
  assertClose(mScaled.incenterPartition.tangentSegA / partBase.tangentSegA, 5, 'tangentSegA scales as lambda^1');
  assertClose(mScaled.incenterPartition.tangentSegB / partBase.tangentSegB, 5, 'tangentSegB scales as lambda^1');
  assertClose(mScaled.incenterPartition.tangentSegC / partBase.tangentSegC, 5, 'tangentSegC scales as lambda^1');
  assertClose(mScaled.triangle.shapeRatio, mBase.triangle.shapeRatio, 'shapeRatio scales as lambda^0');
}

console.log('✓ All 7 Task 3 Semantic Contract verification suites passed (coordinates, roles, shapeRatio, tangentSegs).');
console.log('\nCANONICAL SEMANTIC CONTRACT VERIFICATION PASSED SUCCESSFULLY!');
