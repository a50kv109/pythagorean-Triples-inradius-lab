/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  EXPERIMENT06_LAWS_CATALOG,
  EXPERIMENT06_RADII,
  computeArcSideAreaFromLegs,
  computeArcSideAreaFromOppositeSides,
  computeArcSideAreaPoint,
  findCrossSystemShareCoincidences,
  generateExperiment06SvgCharts,
  generateExperiment06Table,
  reconstructNormalizedModelFromArcShares,
  verifyExperiment06ScaleInvariance,
} from '../math/experiments/arcSideAreaCorrespondence.ts';

const TOL = 1e-11;

function assertClose(actual: number, expected: number, label: string, tol = TOL): void {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${label}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function runExperiment06Verification(): void {
  console.log('Running Experiment 06: Arc–Side–Area Mathematical Relationship Analysis (Standard Notation)...\n');

  // 1. Verify all 51 configurations (r = 1, 2, 3; alpha = 5..85 deg)
  const rows = generateExperiment06Table(EXPERIMENT06_RADII, 5);
  assert.equal(rows.length, 51, 'Expected 17 interior angles x 3 radii = 51 rows');

  for (const row of rows) {
    // Standard opposite-side ordering check: A > B <=> a > b
    if (row.angleADeg > row.angleBDeg + 1e-9) {
      assert.ok(row.a > row.b, `Standard notation: angleA=${row.angleADeg} > angleB=${row.angleBDeg} must imply a=${row.a} > b=${row.b}`);
    } else if (row.angleBDeg > row.angleADeg + 1e-9) {
      assert.ok(row.b > row.a, `Standard notation: angleB=${row.angleBDeg} > angleA=${row.angleADeg} must imply b=${row.b} > a=${row.a}`);
    }

    // L-01: Side shares === Area shares identically
    assert.ok(row.sideAreaShareMaxDiff < 1e-13, `L-01 side/area isomorphism failed at alpha=${row.alphaDeg}`);

    // L-03: Direct Law-of-Sines arc-to-area bridge sin(phi_K) / sum(sin(phi))
    assert.ok(row.sineBridgeMaxDiff < 1e-13, `L-03 direct sine bridge failed at alpha=${row.alphaDeg}`);

    // L-04: Half-angle tangent hyperbolic invariant & standard side formulas
    assert.ok(row.hyperbolicTangentResidual < 1e-11, `L-04 hyperbolic tangent residual failed at alpha=${row.alphaDeg}`);
    assertClose(row.a, row.r * (1 + row.tanHalfPhiB), `L-04 a = r*(1+tan(phi_B/2)) at alpha=${row.alphaDeg}`);
    assertClose(row.b, row.r * (1 + row.tanHalfPhiA), `L-04 b = r*(1+tan(phi_A/2)) at alpha=${row.alphaDeg}`);
    assertClose(
      row.tanHalfPhiA * row.tanHalfPhiB,
      row.totalArea / (row.r * row.r),
      `L-04 tan(phiA/2)*tan(phiB/2) = S/r^2 at alpha=${row.alphaDeg}`
    );

    // L-05: Pythagorean area relation S_a^2 + S_b^2 = S_c^2
    assert.ok(row.pythagoreanAreaResidual < 1e-9, `L-05 S_a^2+S_b^2=S_c^2 failed at alpha=${row.alphaDeg}`);
    assertClose(
      row.areaShareA * row.areaShareA + row.areaShareB * row.areaShareB,
      row.areaShareC * row.areaShareC,
      `L-05 normalized w_a^2 + w_b^2 = w_c^2 at alpha=${row.alphaDeg}`
    );

    // L-06: Area defect identity S_a + S_b - S_c = r^2 and w_a + w_b - w_c = 2 w_a w_b = r^2 / S
    assert.ok(row.areaDefectVsRSquaredDiff < 1e-10, `L-06 S_a+S_b-S_c=r^2 failed at alpha=${row.alphaDeg}`);
    assert.ok(row.normalizedDefectResidual < 1e-12, `L-06 w_a+w_b-w_c=2*w_a*w_b failed at alpha=${row.alphaDeg}`);
    assertClose(
      row.areaShareC,
      0.5 - row.rSquaredOverS / 2,
      `L-06 w_c = 1/2 - r^2/(2S) at alpha=${row.alphaDeg}`
    );

    // L-07: Simultaneous equality is impossible; non-crossing opposite inequalities hold everywhere
    assert.equal(row.allThreeArcEqualAreaShares, false, 'Simultaneous 3-share arc==area equality is impossible');
    assertClose(row.arcShareC, 0.25, 'Arc share C is strictly 0.25');
    assert.ok(
      row.areaShareC >= Math.SQRT2 - 1 - 1e-12 && row.areaShareC < 0.5,
      `Hypotenuse area share w_c must lie in [sqrt(2)-1, 0.5), got ${row.areaShareC}`
    );
    assert.ok(
      row.arcShareA > row.areaShareB && row.arcShareB > row.areaShareA,
      `Strict opposite bounds w^arc_A > w^area_b and w^arc_B > w^area_a at alpha=${row.alphaDeg}`
    );

    // L-08: Vertex segments vs tangency radii relation
    assertClose(
      (row.vertexDistIA * row.vertexDistIB) / (2 * Math.SQRT2),
      row.areaC,
      `L-08 S_c = |IA|*|IB|/(2*sqrt(2)) at r=${row.r}, alpha=${row.alphaDeg}`
    );
    assertClose(row.psiADeg + row.psiBDeg + row.psiCDeg, 360, 'Vertex bisector angles sum to 360 deg');
    assertClose(row.psiCDeg, 135, 'psi_C = angle(AIB) = 135 deg constant');

    // Reconstruction from arc shares alone
    const rec = reconstructNormalizedModelFromArcShares(row.arcShareA, row.arcShareB, row.arcShareC);
    assertClose(rec.areaShareA, row.areaShareA, `Reconstructed w_a at alpha=${row.alphaDeg}`);
    assertClose(rec.areaShareB, row.areaShareB, `Reconstructed w_b at alpha=${row.alphaDeg}`);
    assertClose(rec.areaShareC, row.areaShareC, `Reconstructed w_c at alpha=${row.alphaDeg}`);
    assertClose(rec.rSquaredOverS, row.rSquaredOverS, `Reconstructed r^2/S at alpha=${row.alphaDeg}`);
  }

  // 2. Classic benchmark triangles (legOA=3, legOB=4 -> a=4 opp A, b=3 opp B, c=5) and (5, 12, 13)
  const tri345 = computeArcSideAreaFromLegs(3, 4);
  assertClose(tri345.r, 1, '(3,4,5) r = 1');
  assertClose(tri345.a, 4, '(3,4,5) a = |OB| = 4 (opposite A=53.13°)');
  assertClose(tri345.b, 3, '(3,4,5) b = |OA| = 3 (opposite B=36.87°)');
  assertClose(tri345.areaA, 2.0, '(3,4,5) S_a = 2.0');
  assertClose(tri345.areaB, 1.5, '(3,4,5) S_b = 1.5');
  assertClose(tri345.areaC, 2.5, '(3,4,5) S_c = 2.5');
  assertClose(tri345.areaShareA, 4 / 12, '(3,4,5) w_a = 1/3');
  assertClose(tri345.areaShareB, 3 / 12, '(3,4,5) w_b = 1/4 = w^arc_C!');
  assertClose(tri345.areaShareC, 5 / 12, '(3,4,5) w_c = 5/12');
  assertClose(tri345.tanHalfPhiA, 2, '(3,4,5) tan(phi_A/2) = 2');
  assertClose(tri345.tanHalfPhiB, 3, '(3,4,5) tan(phi_B/2) = 3');
  assertClose(tri345.rSquaredOverS, 1 / 6, '(3,4,5) r^2/S = 1/6');

  const tri345Std = computeArcSideAreaFromOppositeSides(4, 3);
  assertClose(tri345Std.a, 4, 'computeArcSideAreaFromOppositeSides(4,3).a');
  assertClose(tri345Std.b, 3, 'computeArcSideAreaFromOppositeSides(4,3).b');

  const tri51213 = computeArcSideAreaFromLegs(5, 12);
  assertClose(tri51213.r, 2, '(5,12,13) r = 2');
  assertClose(tri51213.a, 12, '(5,12,13) a = 12');
  assertClose(tri51213.b, 5, '(5,12,13) b = 5');
  assertClose(tri51213.areaA, 12, '(5,12,13) S_a = 12');
  assertClose(tri51213.areaB, 5, '(5,12,13) S_b = 5');
  assertClose(tri51213.areaC, 13, '(5,12,13) S_c = 13');
  assertClose(tri51213.tanHalfPhiA, 1.5, '(5,12,13) tan(phi_A/2) = 1.5');
  assertClose(tri51213.tanHalfPhiB, 5.0, '(5,12,13) tan(phi_B/2) = 5');
  assertClose(tri51213.rSquaredOverS, 4 / 30, '(5,12,13) r^2/S = 2/15');

  // 3. Symmetry case alpha = 45 deg
  const iso = computeArcSideAreaPoint(1, 45);
  assertClose(iso.areaShareA, 1 / (2 + Math.SQRT2), 'alpha=45: w_a = 1/(2+sqrt(2))');
  assertClose(iso.areaShareB, 1 / (2 + Math.SQRT2), 'alpha=45: w_b = 1/(2+sqrt(2))');
  assertClose(iso.areaShareC, Math.SQRT2 - 1, 'alpha=45: w_c = sqrt(2) - 1 (minimum of w_c)');
  assertClose(iso.rSquaredOverS, 3 - 2 * Math.SQRT2, 'alpha=45: r^2/S = 3 - 2*sqrt(2)');

  // 4. Special angles alpha = 30 deg & 60 deg
  const p30 = computeArcSideAreaPoint(1, 30);
  assert.ok(p30.a > p30.b, 'At alpha=30 (A=60, B=30), a > b in standard notation');
  const p60 = computeArcSideAreaPoint(1, 60);
  assertClose(p30.areaShareA, p60.areaShareB, 'Mirror symmetry 30 vs 60 deg');
  assertClose(p30.areaShareC, p60.areaShareC, 'Hypotenuse area share symmetric');

  // 5. All 6 pairwise crossings (2 same-index + 4 cross-index)
  const crossings = findCrossSystemShareCoincidences();
  const ptAA = computeArcSideAreaPoint(1, crossings.alphaArcAEqualsAreaADeg);
  assertClose(ptAA.arcShareA, ptAA.areaShareA, 'Same-index coincidence w^arc_A = w^area_a', 1e-12);
  const ptBB = computeArcSideAreaPoint(1, crossings.alphaArcBEqualsAreaBDeg);
  assertClose(ptBB.arcShareB, ptBB.areaShareB, 'Same-index coincidence w^arc_B = w^area_b', 1e-12);
  const ptBC = computeArcSideAreaPoint(1, crossings.alphaArcBEqualsAreaCDeg);
  assertClose(ptBC.arcShareB, ptBC.areaShareC, 'Cross-index coincidence w^arc_B = w^area_c', 1e-12);
  const ptAC = computeArcSideAreaPoint(1, crossings.alphaArcAEqualsAreaCDeg);
  assertClose(ptAC.arcShareA, ptAC.areaShareC, 'Cross-index coincidence w^arc_A = w^area_c', 1e-12);
  const ptCB = computeArcSideAreaPoint(1, crossings.alphaArcCEqualsAreaBDeg);
  assertClose(ptCB.arcShareC, ptCB.areaShareB, 'Exact (3,4,5) crossing w^arc_C = w^area_b = 0.25', 1e-12);
  assertClose(crossings.alphaArcCEqualsAreaBDeg, Math.atan2(3, 4) * (180 / Math.PI), 'Exact angle atan(3/4)', 1e-11);
  const ptCA = computeArcSideAreaPoint(1, crossings.alphaArcCEqualsAreaADeg);
  assertClose(ptCA.arcShareC, ptCA.areaShareA, 'Exact (4,3,5) crossing w^arc_C = w^area_a = 0.25', 1e-12);

  // 6. Scale invariance & homogeneity across r = 1, 2, 3
  const scaleReport = verifyExperiment06ScaleInvariance(EXPERIMENT06_RADII, 5);
  assert.equal(scaleReport.allNormalizedRatiosInvariant, true, 'All normalized ratios must be scale-invariant');
  assert.equal(scaleReport.allScalingsExact, true, 'Linear and area scalings must be exact');

  // 7. Boundary limits alpha -> 0+ and alpha -> 90-
  const nearZero = computeArcSideAreaPoint(1, 0.01);
  assert.ok(nearZero.areaShareA > 0.499 && nearZero.areaShareC > 0.499);
  assert.ok(nearZero.areaShareB < 0.001 && nearZero.rSquaredOverS < 0.001);

  const nearNinety = computeArcSideAreaPoint(1, 89.99);
  assert.ok(nearNinety.areaShareB > 0.499 && nearNinety.areaShareC > 0.499);
  assert.ok(nearNinety.areaShareA < 0.001 && nearNinety.rSquaredOverS < 0.001);

  assert.equal(EXPERIMENT06_LAWS_CATALOG.length, 8, 'Catalog must contain 8 classified laws');

  // 8. Regenerate 4 SVG charts
  const charts = generateExperiment06SvgCharts();
  const figuresDir = path.resolve(process.cwd(), 'docs/experiments/figures');
  fs.mkdirSync(figuresDir, { recursive: true });
  fs.writeFileSync(path.join(figuresDir, 'exp06_chart1_three_systems_shares.svg'), charts.chart1ThreeSystemsShares, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp06_chart2_bridge_defect.svg'), charts.chart2BridgeDefect, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp06_chart3_areas_and_tangents.svg'), charts.chart3AreasAndTangents, 'utf8');
  fs.writeFileSync(path.join(figuresDir, 'exp06_chart4_radii_vs_bisectors.svg'), charts.chart4RadiiVsBisectors, 'utf8');

  console.log('=== All 6 Share Coincidences (Standard Notation) ===');
  console.log(`1. Same-index  w^arc_A = w^area_a at alpha = ${crossings.alphaArcAEqualsAreaADeg.toFixed(6)} deg (share = ${(ptAA.arcShareA * 100).toFixed(4)}%)`);
  console.log(`2. Same-index  w^arc_B = w^area_b at alpha = ${crossings.alphaArcBEqualsAreaBDeg.toFixed(6)} deg (share = ${(ptBB.arcShareB * 100).toFixed(4)}%)`);
  console.log(`3. Cross-index w^arc_B = w^area_c at alpha = ${crossings.alphaArcBEqualsAreaCDeg.toFixed(6)} deg (share = ${(ptBC.arcShareB * 100).toFixed(4)}%)`);
  console.log(`4. Cross-index w^arc_A = w^area_c at alpha = ${crossings.alphaArcAEqualsAreaCDeg.toFixed(6)} deg (share = ${(ptAC.arcShareA * 100).toFixed(4)}%)`);
  console.log(`5. Cross-index w^arc_C = w^area_b at alpha = ${crossings.alphaArcCEqualsAreaBDeg.toFixed(6)} deg (share = 25.0000%, exact 3-4-5)`);
  console.log(`6. Cross-index w^arc_C = w^area_a at alpha = ${crossings.alphaArcCEqualsAreaADeg.toFixed(6)} deg (share = 25.0000%, exact 4-3-5)`);

  console.log('\n=== Scale Invariance Summary (r = 1, 2, 3) ===');
  console.log(`max |Δw_arc| = ${scaleReport.maxArcShareDiff.toExponential(2)}`);
  console.log(`max |Δw_side| = ${scaleReport.maxSideShareDiff.toExponential(2)}`);
  console.log(`max |Δw_area| = ${scaleReport.maxAreaShareDiff.toExponential(2)}`);
  console.log(`max |Δ(r²/S)| = ${scaleReport.maxRSquaredOverSDiff.toExponential(2)}`);
  console.log(`max linear relErr = ${scaleReport.maxLinearScaleRelErr.toExponential(2)}`);
  console.log(`max area relErr = ${scaleReport.maxAreaScaleRelErr.toExponential(2)}`);

  console.log('\n=== 5-deg Table (r = 1, Standard Notation: a opp A, b opp B) ===');
  const r1 = rows.filter((x) => x.r === 1);
  console.log('| α | ∠A / ∠B | a / b / c | w_arc (A/B/C %) | w_area≡w_side (a/b/c %) | S_a / S_b / S_c | r²/S (%) |');
  console.log('|---|---|---|---|---|---|---|');
  for (const x of r1) {
    console.log(
      `| ${x.alphaDeg}° | ${x.angleADeg.toFixed(0)}°/${x.angleBDeg.toFixed(0)}° | ${x.a.toFixed(4)}/${x.b.toFixed(4)}/${x.c.toFixed(4)} | ${(x.arcShareA * 100).toFixed(2)}/${(x.arcShareB * 100).toFixed(2)}/25.00 | ${(x.areaShareA * 100).toFixed(2)}/${(x.areaShareB * 100).toFixed(2)}/${(x.areaShareC * 100).toFixed(2)} | ${x.areaA.toFixed(3)}/${x.areaB.toFixed(3)}/${x.areaC.toFixed(3)} | ${(x.rSquaredOverS * 100).toFixed(2)}% |`
    );
  }

  console.log('\nEXPERIMENT 06: ARC–SIDE–AREA CORRESPONDENCE — ALL CHECKS PASSED!');
}

runExperiment06Verification();
