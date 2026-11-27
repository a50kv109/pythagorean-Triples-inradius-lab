/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * CANONICAL MIGRATED TEST #2 (`CT-02`, migrated from Legacy `LT-02`:
 *   src/tests/geometry.test.ts, Section 2: Symmetry Under Leg Swap)
 *
 * Stage 5.1 Formal Passport:
 *   1. Mathematical Principle : Geometric reflection across the bisector y = x maps
 *      (sideA, sideB) <-> (sideB, sideA), exchanging leg-attached objects while preserving
 *      hypotenuse, circumcircle, and incircle invariants.
 *   2. Inputs                 : Canonical leg-swap pairs (7,3)<->(3,7) and (1.25,4.8)<->(4.8,1.25).
 *   3. Canonical Notation     : sideA <-> sideB, squareA <-> squareB, circleKa <-> circleKb,
 *      angleAlpha <-> angleBeta, subtriangleAreaA <-> subtriangleAreaB, arcAngleA <-> arcAngleB,
 *      tangentSegA <-> tangentSegB, tangencySideA <-> tangencySideB; invariant Kc, Ko, Ki, sideC, P, S.
 *      (Note: reciprocal shapeRatio inversion rho <-> 1/rho is verified separately in
 *      `semanticContract.canonical.test.ts` to avoid cross-suite duplication.)
 *   4. Expected Invariants    : Both states pass 8/8 core invariants and are deterministic;
 *      Ka/Kb swap areas, diameters, circumferences and reflect centers (x <-> y); Kc, Ko, Ki, r,
 *      sideC, perimeter, triangleArea remain invariant; T_a <-> T_b reflect (x <-> y) and T_c.x <-> T_c.y.
 *   5. Legacy Link            : LT-02 (geometry.test.ts:111-120) pairs (3,7) <-> (7,3) mapped via
 *      Vertex-Preserving bridge: Legacy s1.circleA (OA=3) <-> Canonical(7,3).circleKb (AC=3)
 *      and Legacy s2.circleB (OB=3) <-> Canonical(3,7).circleKa (BC=3).
 *   6. Pass Criteria          : Scalar/coordinate match <= 1e-9; strict deepEqual reproducibility;
 *      Legacy<->Canonical maxDeviation <= 1e-12.
 */

import assert from 'node:assert/strict';
import {
  calculateCanonicalFourCircles,
  verifyLegacyToCanonicalMapping,
} from '../../canonical/index.ts';
import { calculateFourCircles as calculateLegacyFourCircles } from '../../math/FourCirclesModel.ts';
import {
  CANONICAL_BRIDGE_TOLERANCE,
  CANONICAL_CORE_TOLERANCE,
  assertAllCanonicalCoreInvariantsValid,
  assertClose,
  type CanonicalTestPassport,
} from './testHelpers.ts';

export const CT02_PASSPORT: CanonicalTestPassport = {
  testId: 'CT-02',
  legacyTestId: 'LT-02',
  legacySource: 'src/tests/geometry.test.ts (Section 2, lines 111-120)',
  mathematicalPrinciple:
    'Involution symmetry under reflection across y=x: (sideA, sideB) <-> (sideB, sideA) swaps leg-indexed objects and acute angles while preserving symmetric hypotenuse and incircle/circumcircle invariants.',
  inputsDescription: 'Canonical pairs (7,3)<->(3,7) and (1.25,4.8)<->(4.8,1.25); Legacy pair (3,7)<->(7,3)',
  canonicalNotation: ['sideA<->sideB', 'Ka<->Kb', 'Qa<->Qb', 'angleAlpha<->angleBeta', 'subtriangleAreaA<->B', 'arcAngleA<->B', 'T_a<->T_b'],
  expectedInvariants: [
    '8/8 core invariants on both configurations + reproducibility',
    'Ka<->Kb & Qa<->Qb exchange + center reflection (x<->y)',
    'Kc, Ko, Ki, r, sideC, perimeter, triangleArea invariance',
    'acute angles, incenter partition shares/subtriangles/arcs/tangentSegs exchange',
  ],
  legacyLink: 'Legacy (3,7)<->(7,3) mapped via Vertex-Preserving bridge: s1.circleA===canon(7,3).circleKb, s2.circleB===canon(3,7).circleKa',
  passCriteria: 'tol <= 1e-9 on all symmetry invariants; maxDeviation <= 1e-12 on Legacy<->Canonical bridge',
};

console.log('Running Canonical Shadow Stand Test CT-02 (Migrated from LT-02: Leg-Swap Symmetry)...\n');

// ============================================================================
// Part A: Pure Canonical Leg-Swap Symmetry (Zero Legacy Calls)
// ============================================================================
const canonicalSwapPairs: Array<{ sideA: number; sideB: number; label: string }> = [
  { sideA: 7, sideB: 3, label: '(sideA=7, sideB=3) <- Legacy (3, 7)' },
  { sideA: 1.25, sideB: 4.8, label: '(sideA=1.25, sideB=4.8) non-integer pair' },
];

for (const tc of canonicalSwapPairs) {
  const m1 = calculateCanonicalFourCircles(tc.sideA, tc.sideB);
  const m2 = calculateCanonicalFourCircles(tc.sideB, tc.sideA);

  // Reproducibility check (two independent calls yield identical results)
  const m1Repeat = calculateCanonicalFourCircles(tc.sideA, tc.sideB);
  assert.deepEqual(m1, m1Repeat, `${tc.label}: pure canonical calculation must be strictly reproducible`);

  // Both configurations satisfy all 8 canonical invariants
  assertAllCanonicalCoreInvariantsValid(m1, `${tc.label} m1`, CANONICAL_CORE_TOLERANCE);
  assertAllCanonicalCoreInvariantsValid(m2, `${tc.label} m2`, CANONICAL_CORE_TOLERANCE);

  // 1. Exchange of Ka and Kb areas, diameters, circumferences, and y=x center reflection
  assertClose(m1.circleKa.area, m2.circleKb.area, `${tc.label}: swaps Ka(m1) === Kb(m2)`);
  assertClose(m1.circleKb.area, m2.circleKa.area, `${tc.label}: swaps Kb(m1) === Ka(m2)`);
  assertClose(m1.circleKa.diameter, m2.circleKb.diameter, `${tc.label}: swaps d_a(m1) === d_b(m2)`);
  assertClose(m1.circleKa.circumference, m2.circleKb.circumference, `${tc.label}: swaps C_a(m1) === C_b(m2)`);
  assertClose(m1.circleKa.center.x, m2.circleKb.center.y, `${tc.label}: center reflection (x <-> y) for Ka->Kb`);
  assertClose(m1.circleKa.center.y, m2.circleKb.center.x, `${tc.label}: center reflection (y <-> x) for Ka->Kb`);
  assertClose(m1.squareA.area, m2.squareB.area, `${tc.label}: swaps Qa(m1) === Qb(m2)`);

  // 2. Preservation of Kc, Ko, Ki, sideC, perimeter, and triangleArea
  assertClose(m1.circleKc.area, m2.circleKc.area, `${tc.label}: preserves Kc`);
  assertClose(m1.circleKc.circumference, m2.circleKc.circumference, `${tc.label}: preserves C_c`);
  assertClose(m1.circleKc.center.x, m2.circleKc.center.x, `${tc.label}: preserves Kc center.x`);
  assertClose(m1.circleKc.center.y, m2.circleKc.center.y, `${tc.label}: preserves Kc center.y`);
  assertClose(m1.circumcircleKo.area, m2.circumcircleKo.area, `${tc.label}: preserves Ko`);
  assertClose(m1.incircleKi.radius, m2.incircleKi.radius, `${tc.label}: preserves inradius r`);
  assertClose(m1.incircleKi.area, m2.incircleKi.area, `${tc.label}: preserves Ki`);
  assertClose(m1.triangle.sideC, m2.triangle.sideC, `${tc.label}: preserves hypotenuse sideC`);
  assertClose(m1.triangle.perimeter, m2.triangle.perimeter, `${tc.label}: preserves perimeter P`);
  assertClose(m1.triangle.triangleArea, m2.triangle.triangleArea, `${tc.label}: preserves triangleArea S`);

  // 3. Opposite-angle & incenter-partition involution
  assertClose(m1.triangle.angleAlphaDeg, m2.triangle.angleBetaDeg, `${tc.label}: swaps angleAlpha <-> angleBeta`);
  assertClose(m1.triangle.angleBetaDeg, m2.triangle.angleAlphaDeg, `${tc.label}: swaps angleBeta <-> angleAlpha`);
  assertClose(
    m1.incenterPartition.subtriangleAreaA,
    m2.incenterPartition.subtriangleAreaB,
    `${tc.label}: swaps subtriangleAreaA <-> subtriangleAreaB`
  );
  assertClose(
    m1.incenterPartition.areaShareA,
    m2.incenterPartition.areaShareB,
    `${tc.label}: swaps areaShareA <-> areaShareB`
  );
  assertClose(
    m1.incenterPartition.arcAngleADeg,
    m2.incenterPartition.arcAngleBDeg,
    `${tc.label}: swaps arcAngleA <-> arcAngleB`
  );
  assertClose(
    m1.incenterPartition.arcShareA,
    m2.incenterPartition.arcShareB,
    `${tc.label}: swaps arcShareA <-> arcShareB`
  );
  assertClose(
    m1.incenterPartition.tangentSegA,
    m2.incenterPartition.tangentSegB,
    `${tc.label}: swaps tangentSegA <-> tangentSegB`
  );

  // 4. Tangency point reflection across y = x
  assertClose(m1.incircleKi.tangencySideA.x, m2.incircleKi.tangencySideB.y, `${tc.label}: T_a <-> T_b (x<->y)`);
  assertClose(m1.incircleKi.tangencySideA.y, m2.incircleKi.tangencySideB.x, `${tc.label}: T_a <-> T_b (y<->x)`);
  assertClose(m1.incircleKi.tangencySideC.x, m2.incircleKi.tangencySideC.y, `${tc.label}: T_c reflects x <-> y`);
}

// ============================================================================
// Part B: Semantic Comparison Against Legacy LT-02 Pair (3, 7) <-> (7, 3)
// ============================================================================
{
  const legacyS1 = calculateLegacyFourCircles(3, 7);
  const legacyS2 = calculateLegacyFourCircles(7, 3);

  const canonDirect1 = calculateCanonicalFourCircles(7, 3);
  const canonDirect2 = calculateCanonicalFourCircles(3, 7);

  const map1 = verifyLegacyToCanonicalMapping(legacyS1, CANONICAL_BRIDGE_TOLERANCE);
  const map2 = verifyLegacyToCanonicalMapping(legacyS2, CANONICAL_BRIDGE_TOLERANCE);

  assert.equal(map1.mapping.overallEquivalencePassed, true, 'Semantic bridge failed for Legacy (3,7)');
  assert.equal(map2.mapping.overallEquivalencePassed, true, 'Semantic bridge failed for Legacy (7,3)');

  // Bidirectional Legacy <-> Canonical leg-swap identity:
  // Legacy s1.circleA (OA=3) === Canonical(7,3).circleKb (AC=3)
  // Legacy s1.circleB (OB=7) === Canonical(7,3).circleKa (BC=7)
  // Legacy s2.circleB (OB=3) === Canonical(3,7).circleKa (BC=3)
  // Legacy s2.circleA (OA=7) === Canonical(3,7).circleKb (AC=7)
  assertClose(legacyS1.circleA.area, canonDirect1.circleKb.area, 'Legacy s1.circleA === Canonical(7,3).circleKb');
  assertClose(legacyS1.circleB.area, canonDirect1.circleKa.area, 'Legacy s1.circleB === Canonical(7,3).circleKa');
  assertClose(legacyS2.circleB.area, canonDirect2.circleKa.area, 'Legacy s2.circleB === Canonical(3,7).circleKa');
  assertClose(legacyS2.circleA.area, canonDirect2.circleKb.area, 'Legacy s2.circleA === Canonical(3,7).circleKb');
  assertClose(legacyS1.circleA.area, legacyS2.circleB.area, 'Legacy LT-02 s1.Ka === s2.Kb');
  assertClose(canonDirect1.circleKb.area, canonDirect2.circleKa.area, 'Canonical CT-02 Kb(7,3) === Ka(3,7)');
  assertClose(legacyS1.circleC.area, canonDirect1.circleKc.area, 'Legacy Kc matches Canonical Kc');
  assertClose(legacyS1.incircle.radius, canonDirect1.incircleKi.radius, 'Legacy r matches Canonical r');
  assertClose(legacyS1.incircle.area, canonDirect1.incircleKi.area, 'Legacy Ki matches Canonical Ki');

  console.log(
    `✓ Semantic Legacy<->Canonical swap verified: maxDev(3,7)=${map1.mapping.maxDeviation.toExponential(
      2
    )}, maxDev(7,3)=${map2.mapping.maxDeviation.toExponential(2)}`
  );
}

console.log('\nCANONICAL TEST CT-02 (2/23 MIGRATED) PASSED SUCCESSFULLY!');
