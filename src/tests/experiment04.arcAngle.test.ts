/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  EXPERIMENT04_RADII,
  EXPERIMENT04_RESEARCH_ZONES,
  computeZoneSummaries,
  generateExperiment04SvgCharts,
  generateExperiment04Table,
  legsFromArcAngle,
  verifyScaleInvariance,
} from '../math/experiments/arcAngleParametricAnalysis.ts';

function runExperiment04Verification() {
  console.log('Running Experiment 04: Arc–Angle Parametric Analysis...');

  const { rows, boundaries } = generateExperiment04Table(EXPERIMENT04_RADII, 5);
  assert.equal(rows.length, 51, 'Expected 17 interior 5-deg points x 3 radii = 51 valid triangles');
  assert.equal(boundaries.length, 6, 'Expected 2 degenerate boundary endpoints x 3 radii = 6 boundary rows');

  // 1. Verify every single interior point (Section 10 checks)
  for (const row of rows) {
    assert.equal(row.isNonDegenerate, true, `Row #${row.rowIndex} must be non-degenerate`);
    assert.ok(row.a > 0 && row.b > 0 && row.c > 0, 'All three sides must be strictly positive');
    assert.ok(row.pythagoreanResidual < 1e-11, `a^2+b^2=c^2 residual too high at r=${row.r}, alpha=${row.alphaDeg}: ${row.pythagoreanResidual}`);
    assert.ok(Math.abs(row.angleSumDeg - 90) < 1e-12, `A + B = 90 failed at alpha=${row.alphaDeg}`);
    assert.ok(Math.abs(row.rActual - row.r) < 1e-12, `r_actual = (a+b-c)/2 failed at r=${row.r}, alpha=${row.alphaDeg}`);
    assert.ok(row.circlePointResidual < 1e-12, `T_AB not on circle at r=${row.r}, alpha=${row.alphaDeg}`);
    assert.ok(Math.abs(row.tangentLineDistance - row.r) < 1e-12, `Tangent distance != r at r=${row.r}, alpha=${row.alphaDeg}`);

    // Exact analytic angle identities (Option A: angles between hypotenuse and legs)
    assert.ok(Math.abs(row.angleBDeg - row.alphaDeg) < 1e-11, `Angle B must equal central angle alpha=${row.alphaDeg}`);
    assert.ok(Math.abs(row.angleADeg - (90 - row.alphaDeg)) < 1e-11, `Angle A must equal 90 - alpha`);

    const tanA = Math.tan((row.angleADeg * Math.PI) / 180);
    const cotB = 1 / Math.tan((row.angleBDeg * Math.PI) / 180);
    assert.ok(Math.abs(row.ratioBA - tanA) < 1e-11, 'b/a must equal tan(A)');
    assert.ok(Math.abs(row.ratioBA - cotB) < 1e-11, 'b/a must equal cot(B)');

    // Check symmetric isosceles triangle at alpha = 45 deg
    if (row.alphaDeg === 45) {
      assert.equal(row.isSymmetricIsosceles, true);
      assert.ok(Math.abs(row.angleADeg - 45) < 1e-12 && Math.abs(row.angleBDeg - 45) < 1e-12);
      assert.ok(Math.abs(row.a - row.b) < 1e-12);
      assert.ok(Math.abs(row.a - row.r * (2 + Math.SQRT2)) < 1e-12);
      assert.ok(Math.abs(row.ratioBA - 1) < 1e-12);
    } else {
      assert.equal(row.isSymmetricIsosceles, false);
    }
  }

  // 2. Verify boundary degenerate endpoints are excluded from valid triangles
  for (const b of boundaries) {
    assert.equal(b.isDegenerate, true);
    assert.ok(b.alphaDeg === 0 || b.alphaDeg === 90);
  }

  // 3. Verify reflection symmetry alpha <-> 90 - alpha within each radius
  for (const r of EXPERIMENT04_RADII) {
    const sub = rows.filter((x) => x.r === r);
    for (const p of sub) {
      const mirror = sub.find((x) => Math.abs(x.alphaDeg - (90 - p.alphaDeg)) < 1e-9);
      assert.ok(mirror, `Missing mirror point for alpha=${p.alphaDeg}`);
      assert.ok(Math.abs(p.a - mirror.b) < 1e-11);
      assert.ok(Math.abs(p.b - mirror.a) < 1e-11);
      assert.ok(Math.abs(p.c - mirror.c) < 1e-11);
      assert.ok(Math.abs(p.angleADeg - mirror.angleBDeg) < 1e-11);
      assert.ok(Math.abs(p.angleBDeg - mirror.angleADeg) < 1e-11);
    }
  }

  // 4. Verify zone summaries across r = 1, 2, 3
  const zones = computeZoneSummaries(EXPERIMENT04_RADII, EXPERIMENT04_RESEARCH_ZONES);
  assert.equal(zones.length, 18, '6 zones x 3 radii = 18 summary rows');

  for (const spec of EXPERIMENT04_RESEARCH_ZONES) {
    const z1 = zones.find((z) => z.r === 1 && z.zoneId === spec.id)!;
    const z2 = zones.find((z) => z.r === 2 && z.zoneId === spec.id)!;
    const z3 = zones.find((z) => z.r === 3 && z.zoneId === spec.id)!;
    assert.ok(z1 && z2 && z3);

    // Same A and B angular intervals across all radii
    assert.equal(z1.angleAMinDeg, z2.angleAMinDeg);
    assert.equal(z2.angleAMinDeg, z3.angleAMinDeg);
    assert.equal(z1.angleAMaxDeg, z2.angleAMaxDeg);
    assert.equal(z1.angleBMinDeg, z2.angleBMinDeg);
    assert.equal(z1.angleBMaxDeg, z3.angleBMaxDeg);

    // Linear scaling of arc length range with radius r
    assert.ok(Math.abs(z2.arcLengthDelta - 2 * z1.arcLengthDelta) < 1e-12);
    assert.ok(Math.abs(z3.arcLengthDelta - 3 * z1.arcLengthDelta) < 1e-12);
  }

  // 5. Scale invariance check
  const scaleReport = verifyScaleInvariance(EXPERIMENT04_RADII, 5);
  assert.equal(scaleReport.allShapeInvariantsHold, true, 'Shape invariants must hold across r = 1, 2, 3');
  assert.equal(scaleReport.allScaleLawsHold, true, 'Linear scaling laws must hold across r = 1, 2, 3');

  // 6. Helper legsFromArcAngle check
  const helperTest = legsFromArcAngle(2, 30);
  assert.ok(Math.abs(helperTest.a * helperTest.a + helperTest.b * helperTest.b - helperTest.c * helperTest.c) < 1e-11);
  assert.ok(Math.abs((helperTest.a + helperTest.b - helperTest.c) / 2 - 2) < 1e-12);

  // 7. Generate and save the 5 SVG figures in docs/experiments/figures/
  const figuresDir = path.resolve(process.cwd(), 'docs/experiments/figures');
  fs.mkdirSync(figuresDir, { recursive: true });
  const charts = generateExperiment04SvgCharts();
  fs.writeFileSync(path.join(figuresDir, 'exp04_chart1_angle_a.svg'), charts.chart1AngleA, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp04_chart2_angle_b.svg'), charts.chart2AngleB, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp04_chart3_angles_combined.svg'), charts.chart3AnglesCombined, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp04_chart4_arc_length.svg'), charts.chart4ArcLength, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp04_chart5_leg_ratio.svg'), charts.chart5LegRatio, 'utf8');

  // Print formatted unified table (Section 5)
  console.log('\n=== Unified Parametric Table (51 valid rows, step = 5 deg, r = 1, 2, 3) ===');
  console.log('| № | r | Центральный угол α | Длина дуги L | Угол A | Угол B | Катет a | Катет b | Гипотенуза c |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const row of rows) {
    console.log(
      `| ${row.rowIndex} | ${row.r} | ${row.alphaDeg.toFixed(0)}° | ${row.arcLength.toFixed(4)} | ${row.angleADeg.toFixed(4)}° | ${row.angleBDeg.toFixed(4)}° | ${row.a.toFixed(4)} | ${row.b.toFixed(4)} | ${row.c.toFixed(4)} |`
    );
  }

  // Print zone summary tables (Section 6)
  for (const r of EXPERIMENT04_RADII) {
    console.log(`\n=== Zone Summary Table: r = ${r} ===`);
    console.log('| Радиус r | Интервал дуги α | Диапазон угла A | Диапазон угла B | Диапазон длины дуги L |');
    console.log('|---|---|---|---|---|');
    for (const z of zones.filter((item) => item.r === r)) {
      console.log(
        `| ${z.r} | ${z.arcIntervalLabel} | ${z.angleAMinDeg.toFixed(0)}°–${z.angleAMaxDeg.toFixed(0)}° | ${z.angleBMinDeg.toFixed(0)}°–${z.angleBMaxDeg.toFixed(0)}° | ${z.arcLengthMin.toFixed(4)}–${z.arcLengthMax.toFixed(4)} (ΔL = ${z.arcLengthDelta.toFixed(4)}) |`
      );
    }
  }

  console.log('\n=== Scale Invariance Verification ===');
  console.log(`max |ΔA| = ${scaleReport.maxAngleADiffDeg.toExponential(2)}°`);
  console.log(`max |ΔB| = ${scaleReport.maxAngleBDiffDeg.toExponential(2)}°`);
  console.log(`max |Δ(b/a)| = ${scaleReport.maxRatioBADiff.toExponential(2)}`);
  console.log(`max relErr(L) = ${scaleReport.maxArcLengthScaleRelErr.toExponential(2)}`);
  console.log(`max relErr(a) = ${scaleReport.maxLegAScaleRelErr.toExponential(2)}`);
  console.log(`max relErr(b) = ${scaleReport.maxLegBScaleRelErr.toExponential(2)}`);
  console.log(`max relErr(c) = ${scaleReport.maxHypScaleRelErr.toExponential(2)}`);
  console.log('✓ Saved 5 SVG figures to docs/experiments/figures/exp04_chart*.svg');
  console.log('================================================================');
  console.log('EXPERIMENT 04: ARC–ANGLE PARAMETRIC ANALYSIS — ALL CHECKS PASSED!');
  console.log('================================================================');
}

runExperiment04Verification();
