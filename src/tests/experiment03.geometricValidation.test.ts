/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import {
  buildValidationDiscretizationComparison,
  validateRadiusAngles,
  validateTangentGeometryAtAngle,
} from '../math/experiments/arcGeometricValidation.ts';

const TOL = 1e-11;
const TEST_ANGLES = [0, 15, 30, 45, 60, 75, 90] as const;
const RADII = [1, 2, 3] as const;

function assertClose(actual: number, expected: number, message: string, tol = TOL) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${message}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function fmt(n: number | null, digits = 6): string {
  if (n === null) return '∞ / вырожд.';
  return Number.isInteger(n) ? `${n}` : n.toFixed(digits);
}

console.log('Running Experiment 03: Geometric Validation of Arc Parameterization...\n');

// ============================================================================
// 1. Parameter Reconciliation: alpha vs Exp 02 phi vs Exp 02 theta = 2*alpha
// ============================================================================
{
  const r1At15 = validateTangentGeometryAtAngle(1, 15);
  const r1At30 = validateTangentGeometryAtAngle(1, 30);

  assertClose(r1At15.arcLengthActual, Math.PI / 12, 'alpha=15 deg, r=1: L = pi/12 = 0.261799');
  assertClose(r1At30.arcLengthActual, Math.PI / 6, 'alpha=30 deg, r=1: L = pi/6 = 0.523599');
  assertClose(r1At15.phiExp02Deg, 15, 'Exp 02 phi matches physical central angle alpha=15 deg');
  assertClose(r1At15.thetaExp02Deg, 30, 'Exp 02 theta = 2 * alpha = 30 deg');
  assertClose(
    r1At15.arcLengthIfUsingTheta,
    2 * r1At15.arcLengthActual,
    'r * theta is 2x the physical arc length L = r * alpha'
  );

  console.log('✓ Parameter reconciliation confirmed:');
  console.log(
    `  - Physical central angle alpha = 15° (= Exp02 phi): L = r*alpha = ${r1At15.arcLengthActual.toFixed(
      6
    )}, T=(${r1At15.tangencyPoint.x.toFixed(4)}, ${r1At15.tangencyPoint.y.toFixed(4)}), Exp02 theta=2*alpha=${r1At15.thetaExp02Deg}°`
  );
  console.log(
    `  - Physical central angle alpha = 30° (= Exp02 phi): L = r*alpha = ${r1At30.arcLengthActual.toFixed(
      6
    )}, T=(${r1At30.tangencyPoint.x.toFixed(4)}, ${r1At30.tangencyPoint.y.toFixed(4)}), Exp02 theta=2*alpha=${r1At30.thetaExp02Deg}°\n`
  );
}

// ============================================================================
// 2. Full Geometric Verification Tables for r = 1, 2, 3 across 0..90 deg
// ============================================================================
for (const r of RADII) {
  const rows = validateRadiusAngles(r, TEST_ANGLES);
  assert.equal(rows.length, 7);

  console.log(`=== Geometric Validation Table: r = ${r} (L_max = ${((Math.PI * r) / 2).toFixed(6)}) ===`);
  console.log(
    '| alpha | theta=2a | L = r*alpha | T_AB (x, y) | Tangent Line | a | b | c | ∠A / ∠B | r_act | |a²+b²-c²| | |a+b-c-2r| |'
  );
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');

  for (const row of rows) {
    // Circle tangency invariants hold even at degenerate boundaries!
    assert.ok(row.circleDistanceResidual < TOL, `r=${r}, alpha=${row.alphaDeg}: T_AB lies on circle`);
    assertClose(row.tangentLine.distanceFromCenter, r, `r=${r}, alpha=${row.alphaDeg}: line dist to I == r`);
    assertClose(
      row.arcLengthActual,
      r * ((row.alphaDeg * Math.PI) / 180),
      `r=${r}, alpha=${row.alphaDeg}: L == r*alpha`
    );

    if (row.alphaDeg === 0 || row.alphaDeg === 90) {
      assert.equal(row.isDegenerate, true, `Boundary alpha=${row.alphaDeg} must be flagged degenerate`);
      assert.ok(row.degeneracyReason !== null);
    } else {
      assert.equal(row.isDegenerate, false);
      assert.ok(row.a !== null && row.b !== null && row.c !== null);
      assert.ok(row.angleADeg !== null && row.angleBDeg !== null);
      assert.ok(row.rActualDirect !== null && row.rActualStable !== null);
      assert.ok(row.pythagoreanResidualAbs !== null && row.incircleEqResidualAbs !== null);
      assert.ok(row.matchesExp01FormulaDiff !== null && row.matchesExp02PhiDiff !== null);

      assertClose(row.angleBDeg!, row.alphaDeg, `r=${r}, alpha=${row.alphaDeg}: triangle angle B == arc angle alpha`);
      assertClose(row.angleADeg!, 90 - row.alphaDeg, `r=${r}, alpha=${row.alphaDeg}: triangle angle A == 90 - alpha`);
      assertClose(row.rActualDirect!, r, `r=${r}, alpha=${row.alphaDeg}: (a+b-c)/2 == r`);
      assertClose(row.rActualStable!, r, `r=${r}, alpha=${row.alphaDeg}: ab/(a+b+c) == r`);
      assert.ok(row.pythagoreanResidualAbs! < 1e-11, `r=${r}, alpha=${row.alphaDeg}: a^2+b^2=c^2`);
      assert.ok(row.incircleEqResidualAbs! < 1e-11, `r=${r}, alpha=${row.alphaDeg}: a+b-c=2r`);
      assert.ok(row.matchesExp01FormulaDiff! < 1e-12, `r=${r}, alpha=${row.alphaDeg}: matches Exp 01 formula`);
      assert.ok(row.matchesExp02PhiDiff! < 1e-12, `r=${r}, alpha=${row.alphaDeg}: matches Exp 02 phi model`);
    }

    const tStr = `(${row.tangencyPoint.x.toFixed(4)}, ${row.tangencyPoint.y.toFixed(4)})`;
    const angStr =
      row.isDegenerate ? 'вырожд.' : `${row.angleADeg!.toFixed(1)}° / ${row.angleBDeg!.toFixed(1)}°`;
    const pythStr = row.pythagoreanResidualAbs === null ? '—' : row.pythagoreanResidualAbs.toExponential(1);
    const incStr = row.incircleEqResidualAbs === null ? '—' : row.incircleEqResidualAbs.toExponential(1);

    console.log(
      `| ${row.alphaDeg}° | ${row.thetaExp02Deg}° | ${row.arcLengthActual.toFixed(6)} | ${tStr} | ${
        row.tangentLine.formatted
      } | ${fmt(row.a, 4)} | ${fmt(row.b, 4)} | ${fmt(row.c, 4)} | ${angStr} | ${fmt(
        row.rActualDirect,
        6
      )} | ${pythStr} | ${incStr} |`
    );
  }
  console.log('');
}

// ============================================================================
// 3. Discretization Comparison: Mode A (Angular) vs Mode B (Linear)
// ============================================================================
{
  const comparison = buildValidationDiscretizationComparison([1, 2, 3], [15, 5, 1], [0.5, 0.1]);
  console.log('=== Discretization Comparison: Intervals vs Interior vs Unique ===');
  console.log(
    '| Mode | r | L_max | Step | Eff. Δα | Intervals | Boundary Pts | Interior Ordered | Unique (no a↔b) | Duplicates |'
  );
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const e of comparison) {
    assert.equal(
      e.interiorOrderedCount - e.uniqueCongruenceCount,
      e.symmetricDuplicatesCount,
      'Duplicate count must equal ordered - unique'
    );
    console.log(
      `| ${e.mode} | ${e.r} | ${e.arcLengthMax.toFixed(4)} | ${e.stepLabel} | ${e.effectiveAngularStepDeg.toFixed(
        3
      )}° | ${e.intervalCount} | ${e.boundaryPointCount} | ${e.interiorOrderedCount} | ${
        e.uniqueCongruenceCount
      } | ${e.symmetricDuplicatesCount} |`
    );
  }
  console.log('\n✓ Discretization boundary & symmetry counts verified.');
}

// ============================================================================
// 4. Reject Out-of-Range Physical Arc Angles
// ============================================================================
{
  assert.throws(() => validateTangentGeometryAtAngle(1, -1), RangeError);
  assert.throws(() => validateTangentGeometryAtAngle(1, 91), RangeError);
  assert.throws(() => validateTangentGeometryAtAngle(0, 45), RangeError);
}

console.log('\n================================================================');
console.log('EXPERIMENT 03: GEOMETRIC VALIDATION — ALL VERIFICATIONS PASSED!');
console.log('================================================================');
