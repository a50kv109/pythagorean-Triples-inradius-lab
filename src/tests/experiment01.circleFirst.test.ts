/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import {
  DEFAULT_EXPERIMENT_TOLERANCE,
  InvalidCircleFirstInputError,
  buildCircleFirstGeometricPassport,
  computeCircleFirstTriangle,
  computeDirectSubtractionLegs,
  evaluateErroneousPreambleFormula,
  forwardClassifyFromLegs,
  generateCircleFirstFamilyTable,
  verifyCircleFirstResiduals,
  type CircleFirstTriangleRow,
} from '../math/experiments/circleFirstClassification.ts';
import { calculateFourCircles } from '../math/FourCirclesModel.ts';
import { validateAllFiveCirclesInvariants } from '../math/ThalesValidators.ts';

const TOL = 1e-11;
const TEST_T_VALUES = [0.5, 1, 4 / 3, 2] as const;

function assertClose(actual: number, expected: number, message: string, tol = TOL) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${message}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function fmt(n: number, digits = 6): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(digits);
}

function fmtSci(n: number): string {
  return n === 0 ? '0' : n.toExponential(2);
}

function printFamilyTable(title: string, rows: CircleFirstTriangleRow[]) {
  console.log(`\n=== ${title} ===`);
  console.log(
    '| t = b/a | a | b | c | alpha (deg) | beta (deg) | S (area) | P (perim) | r_direct | r_stable | |a^2+b^2-c^2| | |(a+b-c)-2r| |'
  );
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const row of rows) {
    const tLabel = Math.abs(row.tInput - 4 / 3) < 1e-12 ? '4/3 (1.333333)' : fmt(row.tInput, 4);
    console.log(
      `| ${tLabel} | ${fmt(row.a)} | ${fmt(row.b)} | ${fmt(row.c)} | ${fmt(row.alphaDeg, 4)} | ${fmt(
        row.betaDeg,
        4
      )} | ${fmt(row.area)} | ${fmt(row.perimeter)} | ${fmt(row.rRecoveredDirect, 12)} | ${fmt(
        row.rRecoveredStable,
        12
      )} | ${fmtSci(row.residuals.pythagoreanResidualAbs)} | ${fmtSci(row.residuals.incircleEqResidualAbs)} |`
    );
  }
}

console.log('Running Experiment 01: Circle-First Classification of Right Triangles...');

// ============================================================================
// 1. Refutation Check of Unverified Preamble Formula
// ============================================================================
{
  const brokenSym = evaluateErroneousPreambleFormula(1, 1);
  assert.equal(brokenSym.a, 2);
  assert.equal(brokenSym.b, 2);
  assert.equal(brokenSym.c, 2);
  assert.ok(
    brokenSym.pythagoreanResidualAbs === 4,
    'Erroneous preamble formula produces (2,2,2) at r=1,t=1, violating a^2+b^2=c^2 by 4'
  );

  const broken345 = evaluateErroneousPreambleFormula(1, 4 / 3);
  assert.ok(
    broken345.pythagoreanResidualAbs > 1,
    `Erroneous preamble formula fails (3,4,5) check: |a^2+b^2-c^2|=${broken345.pythagoreanResidualAbs}`
  );
  console.log(
    `\n✓ Refutation check confirmed: unverified preamble formula fails at r=1,t=1 (2,2,2 -> |a^2+b^2-c^2|=${brokenSym.pythagoreanResidualAbs}) and r=1,t=4/3 (|a^2+b^2-c^2|=${fmt(
      broken345.pythagoreanResidualAbs,
      4
    )}).`
  );
}

// ============================================================================
// 2. Control Case: Classical Egyptian Triangle (3, 4, 5) from (r = 1, t = 4/3)
// ============================================================================
{
  const egyptian = computeCircleFirstTriangle(1, 4 / 3);
  assertClose(egyptian.a, 3, 'Egyptian triangle leg a at r=1, t=4/3');
  assertClose(egyptian.b, 4, 'Egyptian triangle leg b at r=1, t=4/3');
  assertClose(egyptian.c, 5, 'Egyptian triangle hypotenuse c at r=1, t=4/3');
  assertClose(egyptian.area, 6, 'Egyptian triangle area S = 6');
  assertClose(egyptian.perimeter, 12, 'Egyptian triangle perimeter P = 12');
  assertClose(egyptian.rRecoveredDirect, 1, 'Egyptian recovered r_direct = 1');
  assertClose(egyptian.rRecoveredStable, 1, 'Egyptian recovered r_stable = 1');
  assert.equal(egyptian.residuals.isValid, true);
  console.log('✓ Control triangle (3, 4, 5) uniquely recovered from (r=1, t=4/3).');
}

// ============================================================================
// 3. Experiments 1, 2, 3: Families r = 1, r = 2, r = 3 for t in {0.5, 1, 4/3, 2}
// ============================================================================
const tableR1 = generateCircleFirstFamilyTable(1, TEST_T_VALUES, DEFAULT_EXPERIMENT_TOLERANCE);
const tableR2 = generateCircleFirstFamilyTable(2, TEST_T_VALUES, DEFAULT_EXPERIMENT_TOLERANCE);
const tableR3 = generateCircleFirstFamilyTable(3, TEST_T_VALUES, DEFAULT_EXPERIMENT_TOLERANCE);

printFamilyTable('Experiment 1: Family r = 1', tableR1);
printFamilyTable('Experiment 2: Family r = 2', tableR2);
printFamilyTable('Experiment 3: Family r = 3', tableR3);

for (const [label, table, expectedR] of [
  ['r=1', tableR1, 1],
  ['r=2', tableR2, 2],
  ['r=3', tableR3, 3],
] as const) {
  for (const row of table) {
    assert.equal(row.residuals.isValid, true, `${label}, t=${row.tInput} residuals must pass`);
    assert.ok(
      row.residuals.incircleEqResidualAbs <= 1e-13,
      `${label}, t=${row.tInput}: |(a+b-c)-2r| = ${row.residuals.incircleEqResidualAbs}`
    );
    assert.ok(
      row.residuals.pythagoreanResidualAbs <= 1e-13,
      `${label}, t=${row.tInput}: |a^2+b^2-c^2| = ${row.residuals.pythagoreanResidualAbs}`
    );
    assertClose(row.rRecoveredDirect, expectedR, `${label}, t=${row.tInput}: r_direct == ${expectedR}`);
    assertClose(row.rRecoveredStable, expectedR, `${label}, t=${row.tInput}: r_stable == ${expectedR}`);
    assertClose(row.alphaDeg + row.betaDeg, 90, `${label}, t=${row.tInput}: alpha + beta = 90 deg`);

    // Cross-verify against core Pythagoras-Circles-Lab model without modifying core
    const passport = buildCircleFirstGeometricPassport(expectedR, row.tInput);
    const fiveInvs = validateAllFiveCirclesInvariants(passport.fourCircles, 1e-9);
    for (const inv of fiveInvs) {
      assert.ok(inv.isValid, `Core 5-circle invariant ${inv.id} failed for r=${expectedR}, t=${row.tInput}`);
    }
    assertClose(passport.fourCircles.incircle.radius, expectedR, 'Core inradius matches rInput');
    assert.ok(passport.coreSqrtIdentityResidualRel <= 1e-13, 'Central sqrt identity matches');
  }
}

// Check r=1, t=1 exact analytic values: a = b = 2 + sqrt(2), c = 2 + 2*sqrt(2)
{
  const sym1 = tableR1[1];
  const expectedLeg = 2 + Math.SQRT2;
  const expectedHyp = 2 + 2 * Math.SQRT2;
  assertClose(sym1.a, expectedLeg, 'r=1, t=1: a = 2 + sqrt(2)');
  assertClose(sym1.b, expectedLeg, 'r=1, t=1: b = 2 + sqrt(2)');
  assertClose(sym1.c, expectedHyp, 'r=1, t=1: c = 2 + 2*sqrt(2)');
  assertClose(sym1.alphaDeg, 45, 'r=1, t=1: alpha = 45 deg');
  assertClose(sym1.betaDeg, 45, 'r=1, t=1: beta = 45 deg');
}

// Check r=2, t=4/3 -> (6, 8, 10) and r=3, t=4/3 -> (9, 12, 15)
assertClose(tableR2[2].a, 6, 'r=2, t=4/3: a = 6');
assertClose(tableR2[2].b, 8, 'r=2, t=4/3: b = 8');
assertClose(tableR2[2].c, 10, 'r=2, t=4/3: c = 10');
assertClose(tableR2[2].area, 24, 'r=2, t=4/3: S = 24 (4 * 6)');
assertClose(tableR3[2].a, 9, 'r=3, t=4/3: a = 9');
assertClose(tableR3[2].b, 12, 'r=3, t=4/3: b = 12');
assertClose(tableR3[2].c, 15, 'r=3, t=4/3: c = 15');
assertClose(tableR3[2].area, 54, 'r=3, t=4/3: S = 54 (9 * 6)');

// ============================================================================
// 4. Homogeneity & Similarity Invariants Across r = 1, 2, 3
// ============================================================================
for (let i = 0; i < TEST_T_VALUES.length; i++) {
  const row1 = tableR1[i];
  const row2 = tableR2[i];
  const row3 = tableR3[i];

  // Linear scaling (degree 1 in r)
  assertClose(row2.a, 2 * row1.a, `t=${row1.tInput}: a(2,t) = 2*a(1,t)`);
  assertClose(row2.b, 2 * row1.b, `t=${row1.tInput}: b(2,t) = 2*b(1,t)`);
  assertClose(row2.c, 2 * row1.c, `t=${row1.tInput}: c(2,t) = 2*c(1,t)`);
  assertClose(row2.perimeter, 2 * row1.perimeter, `t=${row1.tInput}: P(2,t) = 2*P(1,t)`);

  assertClose(row3.a, 3 * row1.a, `t=${row1.tInput}: a(3,t) = 3*a(1,t)`);
  assertClose(row3.b, 3 * row1.b, `t=${row1.tInput}: b(3,t) = 3*b(1,t)`);
  assertClose(row3.c, 3 * row1.c, `t=${row1.tInput}: c(3,t) = 3*c(1,t)`);
  assertClose(row3.perimeter, 3 * row1.perimeter, `t=${row1.tInput}: P(3,t) = 3*P(1,t)`);

  // Angle invariance (degree 0 in r)
  assertClose(row2.alphaDeg, row1.alphaDeg, `t=${row1.tInput}: alpha preserved at r=2`);
  assertClose(row2.betaDeg, row1.betaDeg, `t=${row1.tInput}: beta preserved at r=2`);
  assertClose(row3.alphaDeg, row1.alphaDeg, `t=${row1.tInput}: alpha preserved at r=3`);
  assertClose(row3.betaDeg, row1.betaDeg, `t=${row1.tInput}: beta preserved at r=3`);

  // Area quadratic scaling (degree 2 in r: 4x and 9x)
  assertClose(row2.area, 4 * row1.area, `t=${row1.tInput}: S(2,t) = 4*S(1,t)`);
  assertClose(row3.area, 9 * row1.area, `t=${row1.tInput}: S(3,t) = 9*S(1,t)`);
}
console.log('\n✓ Experiments 1, 2, 3 and cross-scale invariants (2x/3x sides, 4x/9x area, invariant angles) passed.');

// ============================================================================
// 5. Bijection Completeness & Leg-Swap Symmetry (t <-> 1/t) Across Wide Domain
// ============================================================================
{
  const wideR = [1e-5, 0.25, 1, 2.5, 1e5];
  const wideT = [1e-6, 1e-3, 0.1, 0.5, 0.75, 1, 4 / 3, 2, 10, 1e3, 1e6];

  for (const r of wideR) {
    for (const t of wideT) {
      // Inverse -> Forward: Phi(Psi(r, t)) == (r, t)
      const tri = computeCircleFirstTriangle(r, t);
      assert.equal(tri.residuals.isValid, true, `Wide bijection residual valid at r=${r}, t=${t}`);
      const back = forwardClassifyFromLegs(tri.a, tri.b);
      assertClose(back.r / r, 1, `Bijection Phi(Psi(${r}, ${t})).r`, 1e-12);
      assertClose(back.t / t, 1, `Bijection Phi(Psi(${r}, ${t})).t`, 1e-12);

      // Leg-swap duality: t <-> 1/t
      const dual = computeCircleFirstTriangle(r, 1 / t);
      assertClose(dual.a / tri.b, 1, `Duality a(r, 1/t) == b(r, t) at r=${r}, t=${t}`, 1e-12);
      assertClose(dual.b / tri.a, 1, `Duality b(r, 1/t) == a(r, t) at r=${r}, t=${t}`, 1e-12);
      assertClose(dual.c / tri.c, 1, `Duality c(r, 1/t) == c(r, t) at r=${r}, t=${t}`, 1e-12);
      assertClose(dual.area / tri.area, 1, `Duality area invariant under t <-> 1/t`, 1e-12);
    }
  }

  // Forward -> Inverse on arbitrary right triangles (including non-integer, Pythagorean triples, skewed)
  const sampleLegs: Array<[number, number]> = [
    [3, 4],
    [5, 12],
    [8, 15],
    [7, 24],
    [1, 1],
    [0.003, 7.5],
    [Math.PI, Math.E],
    [1e4, 1e-2],
  ];
  for (const [origA, origB] of sampleLegs) {
    const { r, t } = forwardClassifyFromLegs(origA, origB);
    const reconstructed = computeCircleFirstTriangle(r, t);
    assertClose(reconstructed.a / origA, 1, `Round-trip Psi(Phi(${origA}, ${origB})).a`, 1e-12);
    assertClose(reconstructed.b / origB, 1, `Round-trip Psi(Phi(${origA}, ${origB})).b`, 1e-12);
    const core = calculateFourCircles(origA, origB);
    assertClose(reconstructed.c / core.triangle.c, 1, `Round-trip c matches core model`, 1e-12);
  }
  console.log('✓ Bijection round-trip Phi(Psi(r,t))=(r,t), Psi(Phi(a,b))=(a,b), and t <-> 1/t duality passed.');
}

// ============================================================================
// 6. Numerical Cancellation Benchmark (Direct Subtraction vs Rationalized Form)
// ============================================================================
{
  // At t = 1e-15, (1 + t - sqrt(1 + t^2)) loses ~50 of 53 mantissa bits; at t = 1e16 it underflows to 0.
  const tinyT = 1e-15;
  const direct = computeDirectSubtractionLegs(1, tinyT);
  const rationalized = computeCircleFirstTriangle(1, tinyT);
  const directCheck = forwardClassifyFromLegs(direct.a, direct.b);
  const ratCheck = forwardClassifyFromLegs(rationalized.a, rationalized.b);
  const directErr = Math.abs(directCheck.r - 1);
  const ratErr = Math.abs(ratCheck.r - 1);
  assert.ok(
    !Number.isFinite(direct.a) || directErr > 1e-2,
    `Direct subtraction suffers catastrophic cancellation at t=${tinyT} (err=${directErr})`
  );
  assert.ok(
    ratErr < 1e-14,
    `Rationalized formula stays accurate to float64 ULP at t=${tinyT} (err=${ratErr})`
  );

  // At t = 1e16, 1 + t === hypot(1, t) in float64 -> direct subtraction divides by zero
  const hugeDirectDenom = 1 + 1e16 - Math.hypot(1, 1e16);
  assert.equal(hugeDirectDenom, 0, 'Direct denominator collapses to 0 at t = 1e16');
  const hugeRat = computeCircleFirstTriangle(1, 1e16);
  assert.ok(Number.isFinite(hugeRat.a) && Math.abs(hugeRat.a - 2) < 1e-14, 'Rationalized a(1, 1e16) -> 2 cleanly');

  console.log(
    `✓ Cancellation benchmark: at t=${tinyT} direct error=${fmtSci(directErr)} vs rationalized=${fmtSci(ratErr)}; at t=1e16 direct denom=0 vs rationalized a=${hugeRat.a}.`
  );
}

// ============================================================================
// 7. Fault Detection & Input Validation Checks
// ============================================================================
{
  const badInputs: Array<[number, number]> = [
    [0, 1],
    [1, 0],
    [-1, 1],
    [1, -0.5],
    [Number.NaN, 1],
    [1, Number.NaN],
    [Number.POSITIVE_INFINITY, 1],
    [1, Number.POSITIVE_INFINITY],
    [Number.NEGATIVE_INFINITY, 1],
  ];

  for (const [badR, badT] of badInputs) {
    assert.throws(
      () => computeCircleFirstTriangle(badR, badT),
      InvalidCircleFirstInputError,
      `Must reject invalid (r=${badR}, t=${badT})`
    );
  }

  assert.throws(() => generateCircleFirstFamilyTable(1, []), InvalidCircleFirstInputError);

  // Verify residual checker catches broken computation (e.g., corrupted hypotenuse)
  const brokenCheck = verifyCircleFirstResiduals({
    r: 1,
    t: 4 / 3,
    a: 3,
    b: 4,
    c: 5.05, // corrupted
    alphaDeg: Math.atan2(4, 3) * (180 / Math.PI),
    betaDeg: Math.atan2(3, 4) * (180 / Math.PI),
    rRecoveredStable: (3 * 4) / (3 + 4 + 5.05),
  });
  assert.equal(brokenCheck.isValid, false, 'Residual checker must catch corrupted geometry');
  assert.ok(brokenCheck.failureReasons.length >= 2, 'Corrupted geometry must flag Pythagorean and inradius errors');
  console.log('✓ Input validation and error/residual fault-detection checks passed.');
}

console.log('\n================================================================');
console.log('EXPERIMENT 01: CIRCLE-FIRST CLASSIFICATION — ALL VERIFICATIONS PASSED!');
console.log('================================================================');
