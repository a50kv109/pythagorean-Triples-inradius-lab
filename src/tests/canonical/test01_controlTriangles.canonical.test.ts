/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * CANONICAL MIGRATED TEST #1 (`CT-01`, migrated from Legacy `LT-01`:
 *   src/tests/geometry.test.ts, Section 1: Control Triangles Verification)
 *
 * Stage 5.1 Formal Passport:
 *   1. Mathematical Principle : Euclidean right-triangle Four-Circles laws
 *      (Pythagorean hypotenuse c^2=a^2+b^2, inradius r=ab/(a+b+c)=(a+b-c)/2>0,
 *       Pythagorean circle areas Ka+Kb=Kc, Central Identity sqrt(Ka)+sqrt(Kb)=sqrt(Kc)+sqrt(Ki),
 *       non-equality contrast Ka+Kb-Kc-Ki=-Ki<0, incenter partition S_A+S_B+S_C=S=pr, sum phi=360).
 *   2. Inputs                 : 6 canonical control triangles (sideA, sideB):
 *      (4,3), (3,4), (12,5), (4,4), (10,1), (1,10).
 *   3. Canonical Notation     : C=(0,0), A=(0,sideB), B=(sideA,0), sideA=|BC| opp A, sideB=|AC| opp B,
 *      sideC=|AB| opp C, angleAlpha=angle(A), angleBeta=angle(B), gamma=90, Ka/Kb/Kc/Ki, Qa/Qb/Qc.
 *   4. Expected Invariants    : All 8 canonical invariant IDs pass, sideA>sideB <=> alpha>beta,
 *      exact circle centers/diameters/areas, central sqrt & area laws, incenter partition sums.
 *   5. Legacy Link            : LT-01 (geometry.test.ts:45-109) via Vertex-Preserving mapping
 *      Legacy (O,A,B) -> Canonical (C,A,B), sideA=legacy.b, sideB=legacy.a, Ka=circleB, Kb=circleA.
 *   6. Pass Criteria          : Scalar & invariant tolerances <= 1e-9; Legacy<->Canonical
 *      maxDeviation <= 1e-12; all 8 Legacy and 8 Canonical invariants pass simultaneously.
 */

import assert from 'node:assert/strict';
import {
  calculateCanonicalFourCircles,
  verifyLegacyToCanonicalMapping,
} from '../../canonical/index.ts';
import { calculateFourCircles as calculateLegacyFourCircles } from '../../math/FourCirclesModel.ts';
import { validateFourCirclesInvariants as validateLegacyFourCirclesInvariants } from '../../math/FourCirclesValidators.ts';
import {
  CANONICAL_BRIDGE_TOLERANCE,
  CANONICAL_CORE_TOLERANCE,
  assertAllCanonicalCoreInvariantsValid,
  assertClose,
  type CanonicalTestPassport,
} from './testHelpers.ts';

export const CT01_PASSPORT: CanonicalTestPassport = {
  testId: 'CT-01',
  legacyTestId: 'LT-01',
  legacySource: 'src/tests/geometry.test.ts (Section 1, lines 45-109)',
  mathematicalPrinciple:
    'Pythagorean right triangle Four-Circles identities: c=sqrt(a^2+b^2), r=(a+b-c)/2>0, Ka+Kb=Kc, sqrt(Ka)+sqrt(Kb)=sqrt(Kc)+sqrt(Ki), Ka+Kb-Kc-Ki=-Ki<0, S_A+S_B+S_C=S=pr.',
  inputsDescription: '6 control pairs (sideA, sideB): (4,3), (3,4), (12,5), (4,4), (10,1), (1,10)',
  canonicalNotation: ['C=(0,0)', 'A=(0,sideB)', 'B=(sideA,0)', 'sideA opp A', 'sideB opp B', 'sideC opp C', 'Ka/Kb/Kc/Ki', 'Qa/Qb/Qc'],
  expectedInvariants: [
    '8 core canonical invariants (incircle_positive..area_non_equality_contrast)',
    'opposite-side monotonicity (sideA>sideB <=> alpha>beta)',
    'incenter partition sums (S_A+S_B+S_C=S=pr, phi_A+phi_B+phi_C=360)',
  ],
  legacyLink: 'Vertex-Preserving map Legacy (O,A,B)->Canonical (C,A,B): legacy.b->sideA, legacy.a->sideB, circleB->Ka, circleA->Kb',
  passCriteria: 'tol <= 1e-9 for invariants/identities; verifyLegacyToCanonicalMapping maxDeviation <= 1e-12; Legacy+Canonical 8/8 invariant parity',
};

const canonicalControlTriangles = [
  {
    legacyA_legOA: 3,
    legacyB_legOB: 4,
    sideA: 4,
    sideB: 3,
    expectedSideC: 5,
    expectedInradius: 1,
    label: 'Canonical (sideA=4, sideB=3, sideC=5) <- Legacy (3,4,5)',
  },
  {
    legacyA_legOA: 4,
    legacyB_legOB: 3,
    sideA: 3,
    sideB: 4,
    expectedSideC: 5,
    expectedInradius: 1,
    label: 'Canonical (sideA=3, sideB=4, sideC=5) <- Legacy (4,3,5)',
  },
  {
    legacyA_legOA: 5,
    legacyB_legOB: 12,
    sideA: 12,
    sideB: 5,
    expectedSideC: 13,
    expectedInradius: 2,
    label: 'Canonical (sideA=12, sideB=5, sideC=13) <- Legacy (5,12,13)',
  },
  {
    legacyA_legOA: 4,
    legacyB_legOB: 4,
    sideA: 4,
    sideB: 4,
    expectedSideC: 4 * Math.SQRT2,
    expectedInradius: 4 - 2 * Math.SQRT2,
    label: 'Canonical (sideA=4, sideB=4, sideC=4√2) <- Legacy (4,4,4√2)',
  },
  {
    legacyA_legOA: 1,
    legacyB_legOB: 10,
    sideA: 10,
    sideB: 1,
    expectedSideC: Math.sqrt(101),
    expectedInradius: (11 - Math.sqrt(101)) / 2,
    label: 'Canonical (sideA=10, sideB=1, sideC=√101) <- Legacy (1,10,√101)',
  },
  {
    legacyA_legOA: 10,
    legacyB_legOB: 1,
    sideA: 1,
    sideB: 10,
    expectedSideC: Math.sqrt(101),
    expectedInradius: (11 - Math.sqrt(101)) / 2,
    label: 'Canonical (sideA=1, sideB=10, sideC=√101) <- Legacy (10,1,√101)',
  },
] as const;

console.log('Running Canonical Shadow Stand Test CT-01 (Migrated from LT-01: Control Triangles)...\n');

for (const tc of canonicalControlTriangles) {
  // 1. Evaluate Canonical Shadow Stand purely from canonical opposite sides (sideA, sideB)
  const model = calculateCanonicalFourCircles(tc.sideA, tc.sideB);
  assertAllCanonicalCoreInvariantsValid(model, tc.label, CANONICAL_CORE_TOLERANCE);

  // 2. Canonical opposite-side geometry & monotonicity (sideA > sideB <=> alpha > beta)
  assertClose(model.triangle.sideA, tc.sideA, `${tc.label} sideA`);
  assertClose(model.triangle.sideB, tc.sideB, `${tc.label} sideB`);
  assertClose(model.triangle.sideC, tc.expectedSideC, `${tc.label} hypotenuse sideC`);
  assertClose(model.triangle.angleGammaDeg, 90, `${tc.label} right angle gamma = 90 deg`);
  assertClose(
    model.triangle.angleAlphaDeg + model.triangle.angleBetaDeg,
    90,
    `${tc.label} alpha + beta = 90 deg`
  );
  if (tc.sideA > tc.sideB) {
    assert.ok(
      model.triangle.angleAlphaDeg > model.triangle.angleBetaDeg,
      `${tc.label}: sideA > sideB must imply angleAlpha > angleBeta`
    );
  } else if (tc.sideB > tc.sideA) {
    assert.ok(
      model.triangle.angleBetaDeg > model.triangle.angleAlphaDeg,
      `${tc.label}: sideB > sideA must imply angleBeta > angleAlpha`
    );
  }

  // 3. Positive inradius & exact canonical circle centers/diameters/areas
  assertClose(model.incircleKi.radius, tc.expectedInradius, `${tc.label} inradius r`);
  assert.ok(model.incircleKi.radius > 0, `${tc.label} inradius r must be strictly positive`);

  // Ka is on sideA = BC along +Ox (IV quadrant): center (sideA/2, -sideA/2), diameter = sideA
  assertClose(model.circleKa.center.x, tc.sideA / 2, `${tc.label} O_Ka.x`);
  assertClose(model.circleKa.center.y, -tc.sideA / 2, `${tc.label} O_Ka.y`);
  assertClose(model.circleKa.diameter, tc.sideA, `${tc.label} d_a = sideA`);
  assertClose(model.circleKa.area, (Math.PI * tc.sideA * tc.sideA) / 4, `${tc.label} K_a`);

  // Kb is on sideB = AC along +Oy (II quadrant): center (-sideB/2, sideB/2), diameter = sideB
  assertClose(model.circleKb.center.x, -tc.sideB / 2, `${tc.label} O_Kb.x`);
  assertClose(model.circleKb.center.y, tc.sideB / 2, `${tc.label} O_Kb.y`);
  assertClose(model.circleKb.diameter, tc.sideB, `${tc.label} d_b = sideB`);
  assertClose(model.circleKb.area, (Math.PI * tc.sideB * tc.sideB) / 4, `${tc.label} K_b`);

  // Kc is on hypotenuse sideC = AB (I quadrant)
  assertClose(model.circleKc.center.x, (tc.sideA + tc.sideB) / 2, `${tc.label} O_Kc.x`);
  assertClose(model.circleKc.center.y, (tc.sideA + tc.sideB) / 2, `${tc.label} O_Kc.y`);
  assertClose(model.circleKc.diameter, tc.expectedSideC, `${tc.label} d_c = sideC`);
  assertClose(model.circleKc.area, (Math.PI * tc.expectedSideC * tc.expectedSideC) / 4, `${tc.label} K_c`);

  // Ki incircle center (r, r) & area
  assertClose(model.incircleKi.center.x, tc.expectedInradius, `${tc.label} I.x`);
  assertClose(model.incircleKi.center.y, tc.expectedInradius, `${tc.label} I.y`);
  assertClose(model.incircleKi.area, Math.PI * tc.expectedInradius * tc.expectedInradius, `${tc.label} K_i`);

  // 4. Central identity & area contrast
  assertClose(model.sqrtSumLegs, model.sqrtSumHypAndIn, `${tc.label} central sqrt identity`);
  assertClose(model.areaSumLegs, model.circleKc.area, `${tc.label} K_a + K_b = K_c`);
  assertClose(model.areaMinusAll, -model.incircleKi.area, `${tc.label} K_a + K_b - K_c - K_i = -K_i`);
  assert.ok(model.areaMinusAll < 0, `${tc.label} area sum mismatch must be strictly negative (-K_i)`);

  // 5. Canonical incenter partition consistency (S_A + S_B + S_C = S = p*r, sum phi = 360)
  assertClose(
    model.incenterPartition.subtriangleAreaSum,
    model.triangle.triangleArea,
    `${tc.label} S_A + S_B + S_C = S`
  );
  assertClose(
    model.triangle.semiperimeter * model.incircleKi.radius,
    model.triangle.triangleArea,
    `${tc.label} p*r = S`
  );
  assertClose(
    model.incenterPartition.arcAngleADeg +
      model.incenterPartition.arcAngleBDeg +
      model.incenterPartition.arcAngleCDeg,
    360,
    `${tc.label} phi_A + phi_B + phi_C = 360`
  );

  // 6. Strict Semantic Equivalence Proof against Legacy Stand (Vertex-Preserving Mapping & 8/8 invariant parity)
  const legacyModel = calculateLegacyFourCircles(tc.legacyA_legOA, tc.legacyB_legOB);
  const legacyInvariants = validateLegacyFourCirclesInvariants(legacyModel, CANONICAL_CORE_TOLERANCE);
  for (const linv of legacyInvariants) {
    assert.ok(linv.isValid, `${tc.label} legacy invariant failed: ${linv.id}`);
  }

  const { canonical: mappedCanonical, mapping } = verifyLegacyToCanonicalMapping(
    legacyModel,
    CANONICAL_BRIDGE_TOLERANCE
  );
  assert.equal(
    mapping.overallEquivalencePassed,
    true,
    `${tc.label} semantic equivalence failed: maxDeviation=${mapping.maxDeviation}`
  );
  assert.equal(mapping.vertices.legacyO_to_canonicalC.coordsMatch, true);
  assert.equal(mapping.vertices.legacyA_to_canonicalA.coordsMatch, true);
  assert.equal(mapping.vertices.legacyB_to_canonicalB.coordsMatch, true);

  assertClose(
    mappedCanonical.circleKa.area,
    model.circleKa.area,
    `${tc.label} mapped K_a === canonical K_a`
  );
  assertClose(
    legacyModel.circleB.area,
    model.circleKa.area,
    `${tc.label} Legacy circleB (on OB) === Canonical circleKa (on BC)`
  );
  assertClose(
    legacyModel.circleA.area,
    model.circleKb.area,
    `${tc.label} Legacy circleA (on OA) === Canonical circleKb (on AC)`
  );
  assertClose(
    legacyModel.triangle.alphaDeg,
    model.triangle.angleAlphaDeg,
    `${tc.label} Legacy alphaDeg (at A) === Canonical angleAlphaDeg (at A)`
  );
  assertClose(
    legacyModel.triangle.betaDeg,
    model.triangle.angleBetaDeg,
    `${tc.label} Legacy betaDeg (at B) === Canonical angleBetaDeg (at B)`
  );

  console.log(
    `✓ ${tc.label}: 8 canonical/legacy invariants + opposite-side monotonicity + exact semantic bridge (maxDev=${mapping.maxDeviation.toExponential(
      2
    )}) PASSED.`
  );
}

console.log('\nCANONICAL TEST CT-01 (1/23 MIGRATED) PASSED SUCCESSFULLY!');
