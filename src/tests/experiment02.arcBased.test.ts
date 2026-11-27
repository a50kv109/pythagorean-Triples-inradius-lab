/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import {
  buildArcDiscretizationMatrix,
  computeQuarterArcLength,
  discretizeArcAngular,
  discretizeArcLinear,
  triangleFromHalfAngleCot,
  triangleFromPhysicalArcAngle,
} from '../math/experiments/arcBasedClassification.ts';
import { InvalidCircleFirstInputError } from '../math/experiments/circleFirstClassification.ts';

const TOL = 1e-11;
const RADII = [1, 2, 3] as const;
const ANGULAR_STEPS_DEG = [15, 5, 1, 0.5, 0.1] as const;
const LINEAR_STEPS = [0.5, 0.25, 0.1, 0.05] as const;

function assertClose(actual: number, expected: number, message: string, tol = TOL) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${message}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function fmt(n: number, digits = 6): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(digits);
}

console.log('Running Experiment 02: Arc-Based Classification of Right Triangles...\n');

// ============================================================================
// 1. Section 7 Formula Check: t = cot(theta / 2) at theta = 10, 30, 45, 60, 90 deg
// ============================================================================
{
  const preambleThetas = [10, 30, 45, 60, 90];
  console.log('=== Half-Angle Formula Table (r = 1, t = cot(theta/2)) ===');
  console.log('| theta (deg) | phi = theta/2 (deg) | t = b/a | a | b | c | S | P |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const theta of preambleThetas) {
    const sample = triangleFromHalfAngleCot(1, theta);
    const expectedT = 1 / Math.tan((theta * Math.PI) / 360);
    assertClose(sample.t, expectedT, `theta=${theta}: t = cot(theta/2)`);
    assert.equal(sample.triangle.residuals.isValid, true);
    assert.ok(sample.tangencyMatchResidual < TOL, `theta=${theta}: tangency match residual`);
    console.log(
      `| ${theta} | ${sample.phiDeg} | ${fmt(sample.t)} | ${fmt(sample.triangle.a)} | ${fmt(
        sample.triangle.b
      )} | ${fmt(sample.triangle.c)} | ${fmt(sample.triangle.area)} | ${fmt(sample.triangle.perimeter)} |`
    );
  }
  // Check theta = 90 -> t = 1 (isosceles)
  const iso = triangleFromHalfAngleCot(1, 90);
  assertClose(iso.t, 1, 'theta=90 deg gives isosceles t = 1');
  assertClose(iso.triangle.a, iso.triangle.b, 'theta=90 deg gives a = b');
  console.log('✓ Half-angle formula t = cot(theta/2) verified.\n');
}

// ============================================================================
// 2. Three Families Summary (r = 1, 2, 3) at step = 15 deg
// ============================================================================
for (const r of RADII) {
  const res = discretizeArcAngular(r, 15);
  assertClose(res.arcLengthMax, (Math.PI * r) / 2, `r=${r}: L_max = pi*r/2`);
  assert.equal(res.intervalCount, 6, `r=${r}: 15 deg divides 90 into 6 intervals`);
  assert.equal(res.boundaryInclusivePointCount, 7, `r=${r}: 7 boundary points`);
  assert.equal(res.interiorNonDegenerateCount, 5, `r=${r}: 5 strictly interior triangles`);
  assert.equal(res.uniqueCongruenceCount, 3, `r=${r}: 3 unique congruence classes`);
  assert.equal(res.duplicateCongruenceCount, 2, `r=${r}: 2 symmetric leg-swap duplicates`);

  console.log(`=== Family r = ${r} (L_max = ${fmt(res.arcLengthMax)}, step = 15 deg) ===`);
  console.log('| # | phi (deg) | theta (deg) | L(phi) | t = b/a | a | b | c | S | P | Unique? |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const s of res.samples) {
    assert.equal(s.triangle.residuals.isValid, true, `r=${r}, phi=${s.phiDeg}: residuals valid`);
    assertClose(s.triangle.rRecoveredStable, r, `r=${r}, phi=${s.phiDeg}: r recovered`);
    assert.ok(s.tangencyMatchResidual < TOL, `r=${r}, phi=${s.phiDeg}: tangency angle matches b/a`);
    console.log(
      `| ${s.index} | ${s.phiDeg} | ${s.thetaCotHalfDeg} | ${fmt(s.arcLengthFromN)} | ${fmt(s.t)} | ${fmt(
        s.triangle.a
      )} | ${fmt(s.triangle.b)} | ${fmt(s.triangle.c)} | ${fmt(s.triangle.area)} | ${fmt(
        s.triangle.perimeter
      )} | ${s.isUniqueShape ? 'Yes' : 'Twin (a↔b)'} |`
    );
  }
  console.log('');
}

// ============================================================================
// 3. Experiment 1: Angular Discretization (15, 5, 1, 0.5, 0.1 deg) across r = 1, 2, 3
// ============================================================================
{
  const expectedByStep: Record<number, { intervals: number; interior: number; unique: number }> = {
    15: { intervals: 6, interior: 5, unique: 3 },
    5: { intervals: 18, interior: 17, unique: 9 },
    1: { intervals: 90, interior: 89, unique: 45 },
    0.5: { intervals: 180, interior: 179, unique: 90 },
    0.1: { intervals: 900, interior: 899, unique: 450 },
  };

  console.log('=== Experiment 1: Angular Discretization Matrix ===');
  console.log('| Радиус r | Длина дуги L_max | Угловой шаг | Интервалов | Внутр. невырожд. (упоряд.) | Уникальных (без a↔b) |');
  console.log('|---|---|---|---|---|---|');

  for (const stepDeg of ANGULAR_STEPS_DEG) {
    const countsAcrossRadii: number[] = [];
    for (const r of RADII) {
      const res = discretizeArcAngular(r, stepDeg);
      const exp = expectedByStep[stepDeg];
      assert.equal(res.intervalCount, exp.intervals, `r=${r}, step=${stepDeg}: intervals`);
      assert.equal(res.interiorNonDegenerateCount, exp.interior, `r=${r}, step=${stepDeg}: interior count`);
      assert.equal(res.uniqueCongruenceCount, exp.unique, `r=${r}, step=${stepDeg}: unique count`);

      // Verify every single triangle in the sample set (even for 0.1 deg -> 899 triangles!)
      for (const s of res.samples) {
        assert.equal(s.triangle.residuals.isValid, true, `Angular r=${r}, phi=${s.phiDeg}: valid geometry`);
        assert.ok(s.tangencyMatchResidual < 1e-10, `Angular r=${r}, phi=${s.phiDeg}: tangency residual`);
      }

      countsAcrossRadii.push(res.interiorNonDegenerateCount);
      console.log(
        `| ${r} | ${fmt(res.arcLengthMax)} | ${stepDeg}° | ${res.intervalCount} | ${res.interiorNonDegenerateCount} | ${res.uniqueCongruenceCount} |`
      );
    }
    assert.equal(
      new Set(countsAcrossRadii).size,
      1,
      `Angular step ${stepDeg} deg must yield identical count across r=1,2,3`
    );
  }
  console.log('✓ Experiment 1 verified: fixed angular step yields IDENTICAL triangle count across r = 1, 2, 3.\n');
}

// ============================================================================
// 4. Experiment 2: Linear Arc-Length Discretization (0.5, 0.25, 0.1, 0.05) across r = 1, 2, 3
// ============================================================================
{
  const expectedLinear: Record<number, Record<number, number>> = {
    1: { 0.5: 3, 0.25: 6, 0.1: 15, 0.05: 31 },
    2: { 0.5: 6, 0.25: 12, 0.1: 31, 0.05: 62 },
    3: { 0.5: 9, 0.25: 18, 0.1: 47, 0.05: 94 },
  };

  console.log('=== Experiment 2: Linear Arc-Length Discretization Matrix ===');
  console.log('| Радиус r | Длина дуги L_max | Линейный шаг ΔL | Эфф. угловой шаг | Внутр. невырожд. | Уникальных (без a↔b) |');
  console.log('|---|---|---|---|---|---|');

  for (const deltaL of LINEAR_STEPS) {
    const countsAcrossRadii: number[] = [];
    for (const r of RADII) {
      const res = discretizeArcLinear(r, deltaL);
      const exp = expectedLinear[r][deltaL];
      assert.equal(res.interiorNonDegenerateCount, exp, `Linear r=${r}, dL=${deltaL}: interior count`);
      // Because pi is transcendental and r, dL are rational, no symmetric leg-swap collisions occur
      assert.equal(
        res.uniqueCongruenceCount,
        res.interiorNonDegenerateCount,
        `Linear r=${r}, dL=${deltaL}: rational deltaL yields zero leg-swap duplicates`
      );

      // Verify effective angular step formula deltaPhi_eff = deltaL / r rad
      assertClose(
        res.effectiveAngularStepDeg,
        ((deltaL / r) * 180) / Math.PI,
        `Linear r=${r}, dL=${deltaL}: effective angular step`
      );

      for (const s of res.samples) {
        assert.equal(s.triangle.residuals.isValid, true, `Linear r=${r}, k=${s.index}: valid geometry`);
        assert.ok(s.tangencyMatchResidual < 1e-10, `Linear r=${r}, k=${s.index}: tangency residual`);
      }

      countsAcrossRadii.push(res.interiorNonDegenerateCount);
      console.log(
        `| ${r} | ${fmt(res.arcLengthMax)} | ${deltaL} | ${fmt(res.effectiveAngularStepDeg, 4)}° | ${res.interiorNonDegenerateCount} | ${res.uniqueCongruenceCount} |`
      );
    }
    assert.ok(
      countsAcrossRadii[0] < countsAcrossRadii[1] && countsAcrossRadii[1] < countsAcrossRadii[2],
      `Linear step ${deltaL} must strictly increase triangle count with r=1 < r=2 < r=3`
    );
  }
  console.log('✓ Experiment 2 verified: fixed linear arc step yields GROWING triangle count proportional to L_max = pi*r/2.\n');
}

// ============================================================================
// 5. Matrix Helper, Degenerate Boundary Rejection & Error Handling
// ============================================================================
{
  const matAng = buildArcDiscretizationMatrix([1, 2, 3], [15, 1], 'angular');
  const matLin = buildArcDiscretizationMatrix([1, 2, 3], [0.5, 0.1], 'linear');
  assert.equal(matAng.length, 6);
  assert.equal(matLin.length, 6);
  assertClose(computeQuarterArcLength(2), Math.PI, 'Quarter arc at r=2 is pi');

  // Degenerate boundary exclusion checks (0 deg and 90 deg must throw)
  assert.throws(() => triangleFromPhysicalArcAngle(1, 0), InvalidCircleFirstInputError);
  assert.throws(() => triangleFromPhysicalArcAngle(1, 90), InvalidCircleFirstInputError);
  assert.throws(() => triangleFromPhysicalArcAngle(1, -5), InvalidCircleFirstInputError);
  assert.throws(() => triangleFromPhysicalArcAngle(1, 95), InvalidCircleFirstInputError);
  assert.throws(() => triangleFromHalfAngleCot(1, 0), InvalidCircleFirstInputError);
  assert.throws(() => triangleFromHalfAngleCot(1, 180), InvalidCircleFirstInputError);
  assert.throws(() => discretizeArcAngular(0, 15), InvalidCircleFirstInputError);
  assert.throws(() => discretizeArcLinear(1, 0), InvalidCircleFirstInputError);

  // Step larger than full arc yields 0 interior points (still finite, non-throwing)
  const coarseAng = discretizeArcAngular(1, 90);
  assert.equal(coarseAng.interiorNonDegenerateCount, 0);
  const coarseLin = discretizeArcLinear(1, 2.0); // 2.0 > pi/2 ≈ 1.5708
  assert.equal(coarseLin.interiorNonDegenerateCount, 0);
  console.log('✓ Boundary exclusion, matrix builder, and invalid-input checks passed.');
}

console.log('\n================================================================');
console.log('EXPERIMENT 02: ARC-BASED CLASSIFICATION — ALL VERIFICATIONS PASSED!');
console.log('================================================================');
