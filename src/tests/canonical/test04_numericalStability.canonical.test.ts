/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * CANONICAL MIGRATED TEST #4 (`CT-04`, aligned with Stage 5.2.3 Practical Geometric Domain;
 *   migrated from Legacy `LT-04`: src/tests/geometry.test.ts, Section 4, lines 158-178)
 *
 * Stage 5.2.3 Formal Passport:
 *   1. Mathematical Principle : Separation of homogeneous scale stability (degree-1/2/0 scaling laws
 *      under side scaling lambda = sideC / 5.0) and aspect-ratio conditioning (varying shapeRatio =
 *      sideA / sideB = tan(alpha)) across the Practical Geometric Domain defined by SIMULTANEOUS (AND)
 *      inequalities:
 *        - Level 1 (IN_LEVEL_1_VISUAL): 0.5 <= sideA, sideB <= 15.0  AND  1/24 <= rho <= 24.0
 *          (equivalent to 2.386 deg <= alpha <= 87.614 deg; derived lambda in [0.1414, 4.2426]).
 *        - Level 2 (IN_LEVEL_2_RESEARCH): 0.1 <= sideA, sideB <= 150.0  AND  0.01 <= rho <= 100.0
 *          (equivalent to 0.573 deg <= alpha <= 89.427 deg; derived lambda in [0.0283, 42.4264]).
 *      Note on LT-04 extreme probes: (1e-6, 1e-6), (1e-4, 3e-4), (1e50, 2e50), (1, 1e5), (1e5, 1) and
 *      synthetic IEEE-754 boundary probes (1e-150..1e150, 5000, 1e8, 1e154) lie in OUT_OF_PRACTICAL_DOMAIN
 *      and are excluded from mandatory Canonical scope under VISUAL-GEOMETRIC FIDELITY OVER EXTREME
 *      NUMERICAL RANGE (remaining archived in Legacy LT-04 only).
 *   2. Inputs                 :
 *      - Part A (Practical Scale): base (4,3) scaled by lambda in [0.04..37.5] (inside Level 2),
 *        Level 1/2 square corners (0.5,0.5), (15,15), (0.1,0.1), (150,150) (lambda in [0.0283, 42.4264]),
 *        and all 6 canonical presets from FOUR_CIRCLES_PRESETS (all inside Level 1).
 *      - Part B (Practical Shape Boundaries): Level 1 & Level 2 aspect-ratio boundaries (rho = 1/24, 24,
 *        1/75, 75 [LT-04], 1/100, 100), cancellation-free inradius check at rho = 100, and explicit
 *        simultaneous-AND domain classification counterexamples ((15, 0.5), (150, 0.5)).
 *      - Part C (Bounded Dense Grid Scan): deterministic 2D grid covering simultaneous Level 1 & Level 2
 *        boundaries and interior to confirm absence of local float64 anomalies across the tested mesh.
 *   3. Canonical Notation     : sideA = |BC| opp A, sideB = |AC| opp B, sideC = |AB| opp C,
 *      inradius r, shapeRatio = sideA / sideB = tan(alpha), angleAlphaDeg, Ka/Kb/Kc/Ki/Ko,
 *      subtriangleAreaA/B/C, tangentSegA/B/C.
 *   4. Expected Invariants    :
 *      - 8/8 canonical & 8/8 legacy invariants pass (unrelaxed tol = 1e-9) across all Level 1 & Level 2
 *        control configurations and across every point of the bounded dense grid scan.
 *      - Degree-1, degree-2, degree-0 homogeneity and exact analytic scalars hold to <= 1e-12 rel.
 *      - Legacy <-> Canonical semantic bridge passes with maxDeviation <= 1e-12 across the entire domain.
 *   5. Legacy Link            : LT-04 (geometry.test.ts:158-178) via Vertex-Preserving map
 *      (legacyA = sideB, legacyB = sideA). Covers practical LT-04 pairs (0.2, 15) and (15, 0.2) in
 *      Level 2; extreme LT-04 pairs (1e-6, 3e-4, 2e50, 1e5) are archived in Legacy LT-04.
 *   6. Pass Criteria          : tol <= 1e-9 for all 8/8 invariants without relaxation; relErr <= 1e-12
 *      for analytic scalars and homogeneity; maxDeviation <= 1e-12 for semantic bridge.
 */

import assert from 'node:assert/strict';
import {
  calculateCanonicalFourCircles,
  validateCanonicalFourCirclesInvariants,
  verifyLegacyToCanonicalMapping,
} from '../../canonical/index.ts';
import { calculateFourCircles as calculateLegacyFourCircles } from '../../math/FourCirclesModel.ts';
import { validateFourCirclesInvariants as validateLegacyFourCirclesInvariants } from '../../math/FourCirclesValidators.ts';
import { FOUR_CIRCLES_PRESETS } from '../../math/presets.ts';
import {
  CANONICAL_BRIDGE_TOLERANCE,
  CANONICAL_CORE_TOLERANCE,
  assertAllCanonicalCoreInvariantsValid,
  assertRelativeClose,
  type CanonicalTestPassport,
} from './testHelpers.ts';

export const CT04_PASSPORT: CanonicalTestPassport = {
  testId: 'CT-04',
  legacyTestId: 'LT-04',
  legacySource: 'src/tests/geometry.test.ts (Section 4, lines 158-178)',
  mathematicalPrinciple:
    'Verifies homogeneous scale stability and aspect-ratio conditioning across the simultaneous Level 1 & Level 2 Practical Geometric Domain (0.1 <= sideA, sideB <= 150 AND 0.01 <= rho <= 100), without extreme IEEE-754 out-of-domain probes.',
  inputsDescription:
    'Part A: practical scale lambdas [0.04..37.5] on (4,3), Level 1/2 square corners (lambda 0.0283..42.4264), 6 UI presets; Part B: Level 1 & Level 2 aspect boundaries (rho in [0.01, 100], including LT-04 (15,0.2) & (0.2,15)) + simultaneous-AND checks; Part C: bounded dense 2D grid scan across Level 1 & Level 2',
  canonicalNotation: [
    'sideA',
    'sideB',
    'sideC',
    'inradius',
    'shapeRatio',
    'angleAlphaDeg',
    'Ka/Kb/Kc/Ki/Ko',
    'subtriangleAreaA/B/C',
    'tangentSegA/B/C',
  ],
  expectedInvariants: [
    '8/8 canonical & 8/8 legacy invariants pass (tol = 1e-9) across all Level 1 & Level 2 inputs and the dense grid scan',
    'Exact degree-1 (lengths), degree-2 (areas), degree-0 (angles/shares/shapeRatio) homogeneity <= 1e-12 rel',
    'Legacy <-> Canonical semantic bridge maxDeviation <= 1e-12 across the entire Practical Geometric Domain',
  ],
  legacyLink:
    'LT-04 (geometry.test.ts:158-178) via Vertex-Preserving map for practical pairs (15,0.2)/(0.2,15); extreme LT-04 IEEE-754 probes (1e-6, 3e-4, 2e50, 1e5) archived in Legacy per Stage 5.2.3',
  passCriteria:
    'tol <= 1e-9 for all 8/8 invariants without relaxation; relErr <= 1e-12 for analytic scalars/homogeneity; bridge maxDeviation <= 1e-12',
};

type DomainLevel = 'IN_LEVEL_1_VISUAL' | 'IN_LEVEL_2_RESEARCH' | 'OUT_OF_PRACTICAL_DOMAIN';

function classifyPracticalDomain(sideA: number, sideB: number): DomainLevel {
  const rho = sideA / sideB;
  const inLevel1 =
    sideA >= 0.5 &&
    sideA <= 15.0 &&
    sideB >= 0.5 &&
    sideB <= 15.0 &&
    rho >= 1 / 24 &&
    rho <= 24.0;
  if (inLevel1) return 'IN_LEVEL_1_VISUAL';

  const inLevel2 =
    sideA >= 0.1 &&
    sideA <= 150.0 &&
    sideB >= 0.1 &&
    sideB <= 150.0 &&
    rho >= 0.01 &&
    rho <= 100.0;
  if (inLevel2) return 'IN_LEVEL_2_RESEARCH';

  return 'OUT_OF_PRACTICAL_DOMAIN';
}

console.log('Running Canonical Shadow Stand Test CT-04 (Stage 5.2.3 Practical Geometric Domain)...\n');

// ============================================================================
// Part A: Practical Homogeneous Scale Stability (a' = lambda * a, b' = lambda * b)
// ============================================================================
const baseCanon = calculateCanonicalFourCircles(4, 3); // 4:3:5, r=1, S=6, P=12, lambda=1
const practicalLambdas = [0.04, 0.1, 0.2, 0.5, 1, 2, 2.5, 5, 10, 25, 37.5];

for (const lam of practicalLambdas) {
  const sideA = 4 * lam;
  const sideB = 3 * lam;
  assert.notEqual(
    classifyPracticalDomain(sideA, sideB),
    'OUT_OF_PRACTICAL_DOMAIN',
    `Practical scale lambda=${lam} must stay inside Level 2`
  );

  const scaled = calculateCanonicalFourCircles(sideA, sideB);
  const label = `Practical Scale lambda=${lam} on (4,3)`;

  // 1. All 8 canonical invariants must pass with unrelaxed tol = 1e-9
  assertAllCanonicalCoreInvariantsValid(scaled, label, CANONICAL_CORE_TOLERANCE);

  // 2. Degree-1 linear homogeneity (lengths, radii, circumferences, tangent segments)
  assertRelativeClose(scaled.triangle.sideA, baseCanon.triangle.sideA * lam, `${label}: sideA`, 1e-12);
  assertRelativeClose(scaled.triangle.sideB, baseCanon.triangle.sideB * lam, `${label}: sideB`, 1e-12);
  assertRelativeClose(scaled.triangle.sideC, baseCanon.triangle.sideC * lam, `${label}: sideC`, 1e-12);
  assertRelativeClose(scaled.triangle.perimeter, baseCanon.triangle.perimeter * lam, `${label}: P`, 1e-12);
  assertRelativeClose(scaled.incircleKi.radius, baseCanon.incircleKi.radius * lam, `${label}: r`, 1e-12);
  assertRelativeClose(scaled.circleKa.radius, baseCanon.circleKa.radius * lam, `${label}: R_a`, 1e-12);
  assertRelativeClose(scaled.circleKb.circumference, baseCanon.circleKb.circumference * lam, `${label}: C_b`, 1e-12);
  assertRelativeClose(scaled.circumcircleKo.radius, baseCanon.circumcircleKo.radius * lam, `${label}: R_o`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.tangentSegA, baseCanon.incenterPartition.tangentSegA * lam, `${label}: tangentSegA`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.tangentSegB, baseCanon.incenterPartition.tangentSegB * lam, `${label}: tangentSegB`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.tangentSegC, baseCanon.incenterPartition.tangentSegC * lam, `${label}: tangentSegC`, 1e-12);

  // 3. Degree-2 quadratic homogeneity (areas & subtriangles)
  const lam2 = lam * lam;
  assertRelativeClose(scaled.triangle.triangleArea, baseCanon.triangle.triangleArea * lam2, `${label}: S`, 1e-12);
  assertRelativeClose(scaled.squareA.area, baseCanon.squareA.area * lam2, `${label}: Q_a`, 1e-12);
  assertRelativeClose(scaled.squareB.area, baseCanon.squareB.area * lam2, `${label}: Q_b`, 1e-12);
  assertRelativeClose(scaled.squareC.area, baseCanon.squareC.area * lam2, `${label}: Q_c`, 1e-12);
  assertRelativeClose(scaled.circleKa.area, baseCanon.circleKa.area * lam2, `${label}: K_a`, 1e-12);
  assertRelativeClose(scaled.circleKb.area, baseCanon.circleKb.area * lam2, `${label}: K_b`, 1e-12);
  assertRelativeClose(scaled.circleKc.area, baseCanon.circleKc.area * lam2, `${label}: K_c`, 1e-12);
  assertRelativeClose(scaled.incircleKi.area, baseCanon.incircleKi.area * lam2, `${label}: K_i`, 1e-12);
  assertRelativeClose(scaled.circumcircleKo.area, baseCanon.circumcircleKo.area * lam2, `${label}: K_o`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.subtriangleAreaA, baseCanon.incenterPartition.subtriangleAreaA * lam2, `${label}: S_A`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.subtriangleAreaB, baseCanon.incenterPartition.subtriangleAreaB * lam2, `${label}: S_B`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.subtriangleAreaC, baseCanon.incenterPartition.subtriangleAreaC * lam2, `${label}: S_C`, 1e-12);

  // 4. Degree-0 dimensionless invariance (angles, shapeRatio, normalized shares)
  assertRelativeClose(scaled.triangle.angleAlphaDeg, baseCanon.triangle.angleAlphaDeg, `${label}: alpha`, 1e-12);
  assertRelativeClose(scaled.triangle.angleBetaDeg, baseCanon.triangle.angleBetaDeg, `${label}: beta`, 1e-12);
  assertRelativeClose(scaled.triangle.shapeRatio, baseCanon.triangle.shapeRatio, `${label}: shapeRatio`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.areaShareA, baseCanon.incenterPartition.areaShareA, `${label}: w_area_A`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.areaShareB, baseCanon.incenterPartition.areaShareB, `${label}: w_area_B`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.areaShareC, baseCanon.incenterPartition.areaShareC, `${label}: w_area_C`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.arcShareA, baseCanon.incenterPartition.arcShareA, `${label}: w_arc_A`, 1e-12);
  assertRelativeClose(scaled.incenterPartition.sideShareA, baseCanon.incenterPartition.sideShareA, `${label}: w_side_A`, 1e-12);

  // 5. Legacy <-> Canonical parity & semantic bridge
  const legScaled = calculateLegacyFourCircles(sideB, sideA);
  for (const linv of validateLegacyFourCirclesInvariants(legScaled, CANONICAL_CORE_TOLERANCE)) {
    assert.ok(linv.isValid, `${label} legacy invariant failed: ${linv.id}`);
  }
  const { mapping } = verifyLegacyToCanonicalMapping(legScaled, CANONICAL_BRIDGE_TOLERANCE);
  assert.equal(mapping.overallEquivalencePassed, true, `${label}: semantic bridge failed`);
}

// Level 1 & Level 2 square corners (lambda from 0.02828 to 42.4264) + all 6 UI presets
const scaleBoundaryAndPresetPairs = [
  { sideA: 0.5, sideB: 0.5, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 min corner (0.5, 0.5), lambda=0.1414' },
  { sideA: 15, sideB: 15, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 max corner (15, 15), lambda=4.2426' },
  { sideA: 0.1, sideB: 0.1, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 min corner (0.1, 0.1), lambda=0.0283' },
  { sideA: 150, sideB: 150, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 max corner (150, 150), lambda=42.4264' },
  ...FOUR_CIRCLES_PRESETS.map((p) => ({
    sideA: p.b,
    sideB: p.a,
    expectedLevel: 'IN_LEVEL_1_VISUAL' as const,
    label: `Preset ${p.id} (sideA=${p.b}, sideB=${p.a})`,
  })),
];

for (const tc of scaleBoundaryAndPresetPairs) {
  assert.equal(
    classifyPracticalDomain(tc.sideA, tc.sideB),
    tc.expectedLevel,
    `${tc.label}: domain classification mismatch`
  );
  const canon = calculateCanonicalFourCircles(tc.sideA, tc.sideB);
  const leg = calculateLegacyFourCircles(tc.sideB, tc.sideA);
  assertAllCanonicalCoreInvariantsValid(canon, tc.label, CANONICAL_CORE_TOLERANCE);
  for (const linv of validateLegacyFourCirclesInvariants(leg, CANONICAL_CORE_TOLERANCE)) {
    assert.ok(linv.isValid, `${tc.label} legacy invariant failed: ${linv.id}`);
  }
  const { mapping } = verifyLegacyToCanonicalMapping(leg, CANONICAL_BRIDGE_TOLERANCE);
  assert.equal(mapping.overallEquivalencePassed, true, `${tc.label}: semantic bridge failed`);
}

console.log('✓ Part A (Practical Scale Stability): 8/8 invariants + degree-1/2/0 homogeneity passed across lambda in [0.0283, 42.4264] and all 6 presets.');

// ============================================================================
// Part B: Practical Aspect-Ratio Conditioning & Simultaneous-AND Boundaries
// ============================================================================
const practicalAspectCases = [
  // Level 1 boundaries: rho in [1/24, 24] <-> alpha in [2.386 deg, 87.614 deg]
  { sideA: 15, sideB: 0.625, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 max rho=24 at (15, 0.625)' },
  { sideA: 0.625, sideB: 15, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 min rho=1/24 at (0.625, 15)' },
  { sideA: 12, sideB: 0.5, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 corner rho=24 at (12, 0.5)' },
  { sideA: 0.5, sideB: 12, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 corner rho=1/24 at (0.5, 12)' },
  { sideA: 10, sideB: 1, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 preset-scale (10, 1), rho=10' },
  { sideA: 1, sideB: 10, expectedLevel: 'IN_LEVEL_1_VISUAL' as const, label: 'Level 1 preset-scale (1, 10), rho=0.1' },

  // Level 2 boundaries & practical LT-04 cases: rho in [0.01, 100] <-> alpha in [0.573 deg, 89.427 deg]
  { sideA: 15, sideB: 0.2, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'LT-04 practical aspect (15, 0.2), rho=75' },
  { sideA: 0.2, sideB: 15, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'LT-04 practical aspect (0.2, 15), rho=1/75' },
  { sideA: 10, sideB: 0.1, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 min-leg max rho=100 at (10, 0.1)' },
  { sideA: 0.1, sideB: 10, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 min-leg min rho=0.01 at (0.1, 10)' },
  { sideA: 150, sideB: 1.5, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 max-leg max rho=100 at (150, 1.5)' },
  { sideA: 1.5, sideB: 150, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 max-leg min rho=0.01 at (1.5, 150)' },
  { sideA: 100, sideB: 1, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 boundary rho=100 at (100, 1)' },
  { sideA: 1, sideB: 100, expectedLevel: 'IN_LEVEL_2_RESEARCH' as const, label: 'Level 2 boundary rho=0.01 at (1, 100)' },
] as const;

for (const tc of practicalAspectCases) {
  assert.equal(
    classifyPracticalDomain(tc.sideA, tc.sideB),
    tc.expectedLevel,
    `${tc.label}: domain classification mismatch`
  );

  const canon = calculateCanonicalFourCircles(tc.sideA, tc.sideB);
  const leg = calculateLegacyFourCircles(tc.sideB, tc.sideA);
  assertAllCanonicalCoreInvariantsValid(canon, tc.label, CANONICAL_CORE_TOLERANCE);

  const expectedC = Math.hypot(tc.sideA, tc.sideB);
  const expectedR = (tc.sideA / (tc.sideA + tc.sideB + expectedC)) * tc.sideB;
  const expectedAlphaDeg = (Math.atan2(tc.sideA, tc.sideB) * 180) / Math.PI;
  assertRelativeClose(canon.triangle.sideC, expectedC, `${tc.label}: sideC`, 1e-12);
  assertRelativeClose(canon.incircleKi.radius, expectedR, `${tc.label}: r`, 1e-12);
  assertRelativeClose(canon.triangle.angleAlphaDeg, expectedAlphaDeg, `${tc.label}: angleAlphaDeg`, 1e-12);
  assertRelativeClose(
    Math.tan((canon.triangle.angleAlphaDeg * Math.PI) / 180),
    canon.triangle.shapeRatio,
    `${tc.label}: tan(alpha) === shapeRatio`,
    1e-12
  );
  assertRelativeClose(
    canon.triangle.triangleArea,
    0.5 * tc.sideA * tc.sideB,
    `${tc.label}: S`,
    1e-12
  );
  assertRelativeClose(
    canon.incenterPartition.areaShareA +
      canon.incenterPartition.areaShareB +
      canon.incenterPartition.areaShareC,
    1,
    `${tc.label}: sum(areaShares) = 1`,
    1e-12
  );

  const { mapping } = verifyLegacyToCanonicalMapping(leg, CANONICAL_BRIDGE_TOLERANCE);
  assert.equal(mapping.overallEquivalencePassed, true, `${tc.label}: semantic bridge failed`);
}

// Verify exact rho <-> alpha equivalence and cancellation-free r at Level 2 boundary (rho = 100)
{
  const level1AlphaMin = (Math.atan(1 / 24) * 180) / Math.PI;
  const level1AlphaMax = (Math.atan(24) * 180) / Math.PI;
  const level2AlphaMin = (Math.atan(0.01) * 180) / Math.PI;
  const level2AlphaMax = (Math.atan(100) * 180) / Math.PI;
  assert.ok(Math.abs(level1AlphaMin - 2.385944) < 1e-5 && Math.abs(level1AlphaMax - 87.614056) < 1e-5);
  assert.ok(Math.abs(level2AlphaMin - 0.572939) < 1e-5 && Math.abs(level2AlphaMax - 89.427061) < 1e-5);

  const a = 150;
  const b = 1.5; // rho = 100
  const c = Math.hypot(a, b);
  const m = calculateCanonicalFourCircles(a, b);
  const relErrCanonical = Math.abs(m.incircleKi.radius - (a * b) / (a + b + c)) / m.incircleKi.radius;
  assert.ok(relErrCanonical <= 1e-15, `Cancellation-free r relErr=${relErrCanonical}`);

  // Simultaneous AND boundary checks: legs inside rectangle do not guarantee domain membership if rho violates
  assert.equal(classifyPracticalDomain(15, 0.5), 'IN_LEVEL_2_RESEARCH', '(15, 0.5) has rho=30 > 24 -> outside Level 1');
  assert.equal(classifyPracticalDomain(150, 0.5), 'OUT_OF_PRACTICAL_DOMAIN', '(150, 0.5) has rho=300 > 100 -> OUT_OF_PRACTICAL_DOMAIN');
  assert.equal(classifyPracticalDomain(0.1, 15), 'OUT_OF_PRACTICAL_DOMAIN', '(0.1, 15) has rho=1/150 < 0.01 -> OUT_OF_PRACTICAL_DOMAIN');
}

console.log('✓ Part B (Aspect-Ratio & Simultaneous-AND Boundaries): Level 1 [1/24, 24] & Level 2 [0.01, 100] verified.');

// ============================================================================
// Part C: Bounded Dense Grid Scan Across Simultaneous Level 1 & Level 2 Domain
// ============================================================================
{
  // Log-spaced aspect ratios covering [0.01, 100] including exact domain boundaries 0.01, 1/24, 1, 24, 100
  const rhoSamples: number[] = [
    0.01, 0.015, 0.02, 0.03, 1 / 24, 0.05, 0.075, 0.1, 0.15, 0.25, 0.4, 0.65,
    1,
    1.5, 2.5, 4, 6.5, 10, 15, 20, 24, 35, 50, 75, 100,
  ];
  // Log-spaced minor-leg samples across [0.1, 150] with dense coverage inside [0.5, 15]
  const baseSamples: number[] = [
    0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.625, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5,
    6.5, 8, 10, 12, 15, 25, 40, 65, 100, 150,
  ];

  let level1GridCount = 0;
  let level2GridCount = 0;
  let maxDeltaLevel1 = 0;
  let maxDeltaLevel2 = 0;

  for (const rho of rhoSamples) {
    for (const s of baseSamples) {
      // Choose (sideA, sideB) cleanly inside simultaneous rectangle when feasible:
      const sideA = rho >= 1 ? s * rho : s;
      const sideB = rho >= 1 ? s : s / rho;
      const level = classifyPracticalDomain(sideA, sideB);
      if (level === 'OUT_OF_PRACTICAL_DOMAIN') continue;

      const canon = calculateCanonicalFourCircles(sideA, sideB);
      const invs = validateCanonicalFourCirclesInvariants(canon, CANONICAL_CORE_TOLERANCE);
      for (const inv of invs) {
        assert.ok(inv.isValid, `Dense grid (${sideA}, ${sideB}) [${level}] failed ${inv.id} (delta=${inv.delta})`);
        if (level === 'IN_LEVEL_1_VISUAL') {
          if (inv.delta > maxDeltaLevel1) maxDeltaLevel1 = inv.delta;
        } else {
          if (inv.delta > maxDeltaLevel2) maxDeltaLevel2 = inv.delta;
        }
      }

      const expectedC = Math.hypot(sideA, sideB);
      const expectedR = (sideA / (sideA + sideB + expectedC)) * sideB;
      assertRelativeClose(canon.triangle.sideC, expectedC, `Grid (${sideA}, ${sideB}): sideC`, 1e-12);
      assertRelativeClose(canon.incircleKi.radius, expectedR, `Grid (${sideA}, ${sideB}): r`, 1e-12);

      const leg = calculateLegacyFourCircles(sideB, sideA);
      const { mapping } = verifyLegacyToCanonicalMapping(leg, CANONICAL_BRIDGE_TOLERANCE);
      assert.equal(mapping.overallEquivalencePassed, true, `Grid (${sideA}, ${sideB}): semantic bridge failed`);

      if (level === 'IN_LEVEL_1_VISUAL') level1GridCount++;
      else level2GridCount++;
    }
  }

  const totalGridCount = level1GridCount + level2GridCount;
  assert.ok(level1GridCount >= 120, `Expected >= 120 Level 1 grid points, got ${level1GridCount}`);
  assert.ok(level2GridCount >= 120, `Expected >= 120 Level 2 grid points, got ${level2GridCount}`);
  assert.ok(maxDeltaLevel1 <= 1e-11, `Unexpected Level 1 maxDelta=${maxDeltaLevel1}`);
  assert.ok(maxDeltaLevel2 <= 1e-11, `Unexpected Level 2 maxDelta=${maxDeltaLevel2}`);

  console.log(
    `✓ Part C (Bounded Dense Grid Scan): ${totalGridCount} valid points checked ` +
      `(Level 1: ${level1GridCount}, maxDelta=${maxDeltaLevel1.toExponential(2)}; ` +
      `Level 2: ${level2GridCount}, maxDelta=${maxDeltaLevel2.toExponential(2)} << 1e-9).`
  );
}

console.log('\nCANONICAL TEST CT-04 (4/23 MIGRATED, STAGE 5.2.3 PRACTICAL DOMAIN) PASSED SUCCESSFULLY!');
