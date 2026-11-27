/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  EXPERIMENT05_RADII,
  computeIncircleArcDistribution,
  computeIncircleArcDistributionFromLegs,
  evaluateGeneralTriangleCentralAngles,
  generateExperiment05SvgCharts,
  generateExperiment05Table,
  verifyExperiment05ScaleInvariance,
} from '../math/experiments/incircleArcDistribution.ts';

const TOL = 1e-11;

function assertClose(actual: number, expected: number, label: string, tol = TOL): void {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${label}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function runExperiment05Verification(): void {
  console.log('Running Experiment 05: Incircle Arc Distribution Analysis...\n');

  // 1. Unified 5-deg grid across r = 1, 2, 3 (51 interior configurations)
  const rows = generateExperiment05Table(EXPERIMENT05_RADII, 5);
  assert.equal(rows.length, 51, 'Expected 17 interior 5-deg angles x 3 radii = 51 rows');

  for (const row of rows) {
    // Q1: Sum of three central angles always equals 360 deg
    assertClose(row.centralAngleSumDeg, 360, `Sum of central angles = 360 at r=${row.r}, alpha=${row.alphaDeg}`);

    // Sum of three arc lengths equals full circumference 2*pi*r
    assertClose(
      row.arcLengthSum,
      row.totalCircumference,
      `Sum of three arc lengths = 2*pi*r at r=${row.r}, alpha=${row.alphaDeg}`
    );
    assertClose(row.shareSum, 1, `Normalized shares sum to 1 at r=${row.r}, alpha=${row.alphaDeg}`);

    // Central angles match supplementary laws: phi_X = 180 - angle_X
    assertClose(row.phiADeg, 180 - row.angleADeg, `phi_A = 180 - A at alpha=${row.alphaDeg}`);
    assertClose(row.phiBDeg, 180 - row.angleBDeg, `phi_B = 180 - B at alpha=${row.alphaDeg}`);
    assertClose(row.phiCDeg, 180 - row.angleCDeg, `phi_C = 180 - C = 90 at alpha=${row.alphaDeg}`);
    assertClose(row.phiADeg, 90 + row.alphaDeg, `phi_A = 90 + alpha at alpha=${row.alphaDeg}`);
    assertClose(row.phiBDeg, 180 - row.alphaDeg, `phi_B = 180 - alpha at alpha=${row.alphaDeg}`);
    assertClose(row.phiCDeg, 90, `phi_C = 90 constant at alpha=${row.alphaDeg}`);
    assertClose(row.shareC, 0.25, `share_C = 25% constant at alpha=${row.alphaDeg}`);

    // Right triangle NEVER achieves equal 120-degree 3-way split because phi_C = 90 != 120
    assert.equal(
      row.areAllThreeEqual,
      false,
      `Right triangle cannot split incircle into three 120-deg arcs (alpha=${row.alphaDeg})`
    );
  }

  // 2. Special case alpha = 45 deg (isosceles right triangle)
  const iso = computeIncircleArcDistribution(2, 45);
  assertClose(iso.angleADeg, 45, 'alpha=45: A = 45 deg');
  assertClose(iso.angleBDeg, 45, 'alpha=45: B = 45 deg');
  assertClose(iso.phiADeg, 135, 'alpha=45: phi_A = 135 deg');
  assertClose(iso.phiBDeg, 135, 'alpha=45: phi_B = 135 deg');
  assertClose(iso.phiCDeg, 90, 'alpha=45: phi_C = 90 deg');
  assertClose(iso.lengthA, iso.lengthB, 'alpha=45: L_A = L_B');
  assertClose(iso.shareA, 0.375, 'alpha=45: share_A = 37.5%');
  assertClose(iso.shareB, 0.375, 'alpha=45: share_B = 37.5%');
  assertClose(iso.shareC, 0.25, 'alpha=45: share_C = 25.0%');
  assert.equal(iso.areLegArcsEqual, true, 'alpha=45: two acute-vertex arcs are equal');
  assert.equal(iso.areAllThreeEqual, false, 'alpha=45: third right-angle arc stays 90 deg != 135 deg');

  // 3. Prove three-way 120 deg equality holds iff A = B = C = 60 deg (equilateral triangle)
  const equilateral = evaluateGeneralTriangleCentralAngles(60, 60, 60);
  assert.equal(equilateral.allThreeEqual120, true, 'Equilateral (60,60,60) yields 120,120,120');
  assertClose(equilateral.phiSumDeg, 360, 'Equilateral central angle sum = 360');

  const rightIsoGeneral = evaluateGeneralTriangleCentralAngles(45, 45, 90);
  assert.equal(rightIsoGeneral.allThreeEqual120, false, 'Right triangle (45,45,90) cannot yield 120,120,120');

  // 4. Special cases alpha = 30 deg and alpha = 60 deg
  const deg30 = computeIncircleArcDistribution(1, 30);
  assertClose(deg30.angleADeg, 60, 'alpha=30: A = 60 deg');
  assertClose(deg30.angleBDeg, 30, 'alpha=30: B = 30 deg');
  assertClose(deg30.phiADeg, 120, 'alpha=30: phi_A = 120 deg (1/3 circle)');
  assertClose(deg30.phiBDeg, 150, 'alpha=30: phi_B = 150 deg (5/12 circle)');
  assertClose(deg30.phiCDeg, 90, 'alpha=30: phi_C = 90 deg (1/4 circle)');
  assertClose(deg30.shareA, 1 / 3, 'alpha=30: share_A = 1/3');
  assertClose(deg30.shareB, 5 / 12, 'alpha=30: share_B = 5/12');

  const deg60 = computeIncircleArcDistribution(1, 60);
  assertClose(deg60.angleADeg, 30, 'alpha=60: A = 30 deg');
  assertClose(deg60.angleBDeg, 60, 'alpha=60: B = 60 deg');
  assertClose(deg60.phiADeg, 150, 'alpha=60: phi_A = 150 deg (5/12 circle)');
  assertClose(deg60.phiBDeg, 120, 'alpha=60: phi_B = 120 deg (1/3 circle)');
  assertClose(deg60.phiCDeg, 90, 'alpha=60: phi_C = 90 deg (1/4 circle)');

  // 5. Leg-swap symmetry: (a, b) <-> (b, a) corresponds to alpha <-> 90 - alpha and swaps phi_A <-> phi_B
  const tri345 = computeIncircleArcDistributionFromLegs(3, 4);
  const tri435 = computeIncircleArcDistributionFromLegs(4, 3);
  assertClose(tri345.alphaDeg + tri435.alphaDeg, 90, 'Leg swap maps alpha -> 90 - alpha');
  assertClose(tri345.phiADeg, tri435.phiBDeg, 'Leg swap exchanges phi_A and phi_B');
  assertClose(tri345.phiBDeg, tri435.phiADeg, 'Leg swap exchanges phi_B and phi_A');
  assertClose(tri345.phiCDeg, tri435.phiCDeg, 'Leg swap preserves phi_C = 90 deg');
  assertClose(tri345.lengthA, tri435.lengthB, 'Leg swap exchanges L_A and L_B');

  // 6. Scale invariance & linear scaling of arc lengths across r = 1, 2, 3
  const scaleReport = verifyExperiment05ScaleInvariance(EXPERIMENT05_RADII, 5);
  assert.equal(scaleReport.angularDistributionInvariant, true, 'Central angles & shares must be scale-invariant');
  assert.equal(scaleReport.arcLengthsScaleLinearly, true, 'Arc lengths must scale linearly with r');

  // Uniform triangle scaling (5,12,13) -> lambda*(5,12,13) preserves central angles
  const tri51213 = computeIncircleArcDistributionFromLegs(5, 12);
  const tri51213Scaled = computeIncircleArcDistributionFromLegs(5 * 2.5, 12 * 2.5);
  assertClose(tri51213.phiADeg, tri51213Scaled.phiADeg, 'Triangle scaling preserves phi_A');
  assertClose(tri51213.phiBDeg, tri51213Scaled.phiBDeg, 'Triangle scaling preserves phi_B');
  assertClose(tri51213.phiCDeg, tri51213Scaled.phiCDeg, 'Triangle scaling preserves phi_C');
  assertClose(tri51213Scaled.lengthA, 2.5 * tri51213.lengthA, 'Triangle scaling scales L_A by lambda');

  // 7. Boundary limits alpha -> 0+ and alpha -> 90- (numerical stability near endpoints)
  const nearZero = computeIncircleArcDistribution(1, 0.001);
  assert.ok(Math.abs(nearZero.phiADeg - 90) < 0.01, 'alpha -> 0+: phi_A -> 90 deg');
  assert.ok(Math.abs(nearZero.phiBDeg - 180) < 0.01, 'alpha -> 0+: phi_B -> 180 deg');
  assertClose(nearZero.centralAngleSumDeg, 360, 'alpha -> 0+: sum stays 360 deg');

  const nearNinety = computeIncircleArcDistribution(1, 89.999);
  assert.ok(Math.abs(nearNinety.phiADeg - 180) < 0.01, 'alpha -> 90-: phi_A -> 180 deg');
  assert.ok(Math.abs(nearNinety.phiBDeg - 90) < 0.01, 'alpha -> 90-: phi_B -> 90 deg');
  assertClose(nearNinety.centralAngleSumDeg, 360, 'alpha -> 90-: sum stays 360 deg');

  // Degenerate inputs must throw
  assert.throws(() => computeIncircleArcDistribution(1, 0), RangeError);
  assert.throws(() => computeIncircleArcDistribution(1, 90), RangeError);
  assert.throws(() => computeIncircleArcDistribution(-1, 45), RangeError);

  // 8. Generate SVG charts for Experiment 05 documentation
  const charts = generateExperiment05SvgCharts();
  const figuresDir = path.resolve(process.cwd(), 'docs/experiments/figures');
  fs.mkdirSync(figuresDir, { recursive: true });
  fs.writeFileSync(path.join(figuresDir, 'exp05_chart1_central_angles.svg'), charts.chart1CentralAngles, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp05_chart2_normalized_shares.svg'), charts.chart2NormalizedShares, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp05_chart3_arc_lengths.svg'), charts.chart3ArcLengthsByRadius, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp05_chart4_polar_sectors.svg'), charts.chart4PolarSectorsComparison, 'utf8');

  // Print concise Markdown tables for verified documentation
  console.log('=== Scale Invariance Summary (r = 1, 2, 3) ===');
  console.log(`max |Δφ_A| = ${scaleReport.maxPhiADiffDeg.toExponential(2)} deg`);
  console.log(`max |Δφ_B| = ${scaleReport.maxPhiBDiffDeg.toExponential(2)} deg`);
  console.log(`max |Δφ_C| = ${scaleReport.maxPhiCDiffDeg.toExponential(2)} deg`);
  console.log(`max |Δshare| = ${scaleReport.maxShareDiff.toExponential(2)}`);
  console.log(`max relErr(L) = ${scaleReport.maxLengthScaleRelErr.toExponential(2)}`);
  console.log('\n=== Sample Table (r = 1, 5-deg grid) ===');
  const r1Rows = rows.filter((x) => x.r === 1);
  console.log('| α | ∠A | ∠B | φ_A | φ_B | φ_C | L_A | L_B | L_C | s_A (%) | s_B (%) | s_C (%) |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const x of r1Rows) {
    console.log(
      `| ${x.alphaDeg}° | ${x.angleADeg.toFixed(0)}° | ${x.angleBDeg.toFixed(0)}° | ${x.phiADeg.toFixed(0)}° | ${x.phiBDeg.toFixed(0)}° | ${x.phiCDeg.toFixed(0)}° | ${x.lengthA.toFixed(4)} | ${x.lengthB.toFixed(4)} | ${x.lengthC.toFixed(4)} | ${(x.shareA * 100).toFixed(2)}% | ${(x.shareB * 100).toFixed(2)}% | ${(x.shareC * 100).toFixed(2)}% |`
    );
  }
  console.log('\nEXPERIMENT 05: INCIRCLE ARC DISTRIBUTION ANALYSIS — ALL CHECKS PASSED!');
}

runExperiment05Verification();
