/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * EXPERIMENT 06 — INDEPENDENT MATHEMATICAL AUDIT
 *
 * Strictly independent verification built directly from Euclidean definitions,
 * vertex coordinates, Shoelace/cross-product areas, and trigonometric identities,
 * WITHOUT using computeArcAnglePoint / computeIncircleArcDistribution /
 * computeArcSideAreaPoint as reference oracles.
 */

import assert from 'node:assert/strict';
import {
  computeArcSideAreaPoint,
  reconstructNormalizedModelFromArcShares,
} from '../math/experiments/arcSideAreaCorrespondence.ts';

const DEG2RAD = Math.PI / 180;
const TOL = 1e-11;

function assertClose(actual: number, expected: number, label: string, tol = TOL): void {
  const diff = Math.abs(actual - expected);
  const limit = tol * Math.max(1, Math.abs(expected));
  assert.ok(diff <= limit, `${label}: expected ${expected}, got ${actual} (diff=${diff}, limit=${limit})`);
}

function shoelaceArea(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
): number {
  return 0.5 * Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
}

function independentEuclideanEvaluation(r: number, alphaDeg: number) {
  const Adeg = 90 - alphaDeg;
  const Bdeg = alphaDeg;
  const Cdeg = 90;

  const Arad = Adeg * DEG2RAD;
  const Brad = Bdeg * DEG2RAD;

  // Tangent segments from raw half-angle cotangent formulas: t_X = r * cot(X/2)
  const tA = r / Math.tan(Arad / 2);
  const tB = r / Math.tan(Brad / 2);
  const tC = r; // r * cot(45 deg) = r

  // Standard opposite-side lengths: a opposite A, b opposite B, c opposite C
  const a = tB + tC; // lies along Ox (OB)
  const b = tA + tC; // lies along Oy (OA)
  const c = tA + tB; // hypotenuse AB

  // Independent Law of Sines reconstruction from angles
  const cFromSinA = a / Math.sin(Arad);
  const cFromSinB = b / Math.sin(Brad);
  assertClose(cFromSinA, c, `Raw Law of Sines a/sin(A)=c at alpha=${alphaDeg}`);
  assertClose(cFromSinB, c, `Raw Law of Sines b/sin(B)=c at alpha=${alphaDeg}`);

  // Independent vertex coordinates: O=(0,0), A_pt=(0,b), B_pt=(a,0), I=(r,r)
  const Ax = 0;
  const Ay = b;
  const Bx = a;
  const By = 0;
  const Ix = r;
  const Iy = r;

  // Independent Shoelace areas of ΔIOB (opposite A), ΔIOA (opposite B), ΔIAB (opposite C)
  const S_a = shoelaceArea(Ix, Iy, 0, 0, Bx, By);
  const S_b = shoelaceArea(Ix, Iy, 0, 0, Ax, Ay);
  const S_c = shoelaceArea(Ix, Iy, Ax, Ay, Bx, By);
  const S_total = 0.5 * a * b;

  // Independent central angles of tangency radii via explicit formula phi_X = 180 - X
  const phiA = 180 - Adeg;
  const phiB = 180 - Bdeg;
  const phiC = 180 - Cdeg;

  // Independent arc shares
  const wArcA = phiA / 360;
  const wArcB = phiB / 360;
  const wArcC = phiC / 360;

  // Independent side shares and area shares
  const P = a + b + c;
  const wSideA = a / P;
  const wSideB = b / P;
  const wSideC = c / P;
  const wAreaA = S_a / S_total;
  const wAreaB = S_b / S_total;
  const wAreaC = S_c / S_total;

  // Independent bisector sector areas ½ * |IX| * |IY| * sin(psi)
  const distIA = Math.hypot(Ax - Ix, Ay - Iy);
  const distIB = Math.hypot(Bx - Ix, By - Iy);
  const distIO = Math.hypot(Ix, Iy);
  const psiA = (90 + Adeg / 2) * DEG2RAD;
  const psiB = (90 + Bdeg / 2) * DEG2RAD;
  const psiC = (90 + Cdeg / 2) * DEG2RAD;

  const S_a_bis = 0.5 * distIB * distIO * Math.sin(psiA);
  const S_b_bis = 0.5 * distIA * distIO * Math.sin(psiB);
  const S_c_bis = 0.5 * distIA * distIB * Math.sin(psiC);

  return {
    Adeg,
    Bdeg,
    a,
    b,
    c,
    P,
    S_a,
    S_b,
    S_c,
    S_total,
    S_a_bis,
    S_b_bis,
    S_c_bis,
    phiA,
    phiB,
    phiC,
    wArcA,
    wArcB,
    wArcC,
    wSideA,
    wSideB,
    wSideC,
    wAreaA,
    wAreaB,
    wAreaC,
  };
}

function runIndependentAudit(): void {
  console.log('Running Experiment 06 Independent Mathematical Audit...\n');

  // 1. Cross-verify raw geometric definitions vs module output across radii & interior grid
  for (const r of [0.75, 1, 2, 3, 5.5]) {
    for (let alpha = 2; alpha <= 88; alpha += 2) {
      const raw = independentEuclideanEvaluation(r, alpha);
      const mod = computeArcSideAreaPoint(r, alpha);

      assertClose(mod.a, raw.a, `Audit a (r=${r}, alpha=${alpha})`);
      assertClose(mod.b, raw.b, `Audit b (r=${r}, alpha=${alpha})`);
      assertClose(mod.c, raw.c, `Audit c (r=${r}, alpha=${alpha})`);

      // Verify Shoelace == ½·base·r == ½·|IX|·|IY|·sin(ψ)
      assertClose(raw.S_a, 0.5 * raw.a * r, `Shoelace vs ½ar (alpha=${alpha})`, 1e-10);
      assertClose(raw.S_b, 0.5 * raw.b * r, `Shoelace vs ½br (alpha=${alpha})`, 1e-10);
      assertClose(raw.S_c, 0.5 * raw.c * r, `Shoelace vs ½cr (alpha=${alpha})`, 1e-10);
      assertClose(raw.S_a_bis, raw.S_a, `Bisector area S_a (alpha=${alpha})`, 1e-10);
      assertClose(raw.S_b_bis, raw.S_b, `Bisector area S_b (alpha=${alpha})`, 1e-10);
      assertClose(raw.S_c_bis, raw.S_c, `Bisector area S_c (alpha=${alpha})`, 1e-10);
      assertClose(raw.S_a + raw.S_b + raw.S_c, raw.S_total, `Area partition sum (alpha=${alpha})`, 1e-10);

      // Verify direct standard-notation identities
      assertClose(mod.areaA, raw.S_a, `Module areaA vs Shoelace (alpha=${alpha})`, 1e-10);
      assertClose(mod.areaB, raw.S_b, `Module areaB vs Shoelace (alpha=${alpha})`, 1e-10);
      assertClose(mod.areaC, raw.S_c, `Module areaC vs Shoelace (alpha=${alpha})`, 1e-10);
      assertClose(raw.wSideA, raw.wAreaA, `Side share == Area share A (alpha=${alpha})`);
      assertClose(raw.wSideB, raw.wAreaB, `Side share == Area share B (alpha=${alpha})`);
      assertClose(raw.wSideC, raw.wAreaC, `Side share == Area share C (alpha=${alpha})`);

      // Independent Pythagorean & defect laws
      assertClose(raw.S_a * raw.S_a + raw.S_b * raw.S_b, raw.S_c * raw.S_c, `Pythagoras S_a^2+S_b^2=S_c^2`, 1e-8);
      assertClose(raw.S_a + raw.S_b - raw.S_c, r * r, `Defect S_a+S_b-S_c=r^2`, 1e-9);
    }
  }

  // 2. Exhaustive dense scan across (0.01°, 89.99°) at 0.01° resolution (8999 points)
  //    to count EVERY sign change across all 9 pairs (w^arc_X - w^area_y)
  const pairNames = [
    '(A,a)', '(A,b)', '(A,c)',
    '(B,a)', '(B,b)', '(B,c)',
    '(C,a)', '(C,b)', '(C,c)',
  ] as const;
  const signChangeRoots: Record<string, number[]> = Object.fromEntries(pairNames.map((n) => [n, []]));

  let prevDiffs: number[] | null = null;
  let prevAlpha = 0;

  for (let i = 1; i <= 8999; i += 1) {
    const alpha = i * 0.01;
    const raw = independentEuclideanEvaluation(1, alpha);

    // Check strict universal non-crossing inequalities
    assert.ok(raw.wArcC < raw.wAreaC, `w^arc_C < w^area_c failed at ${alpha}`);
    assert.ok(raw.wArcA > raw.wAreaB, `w^arc_A > w^area_b failed at ${alpha}`);
    assert.ok(raw.wArcB > raw.wAreaA, `w^arc_B > w^area_a failed at ${alpha}`);

    const diffs = [
      raw.wArcA - raw.wAreaA,
      raw.wArcA - raw.wAreaB,
      raw.wArcA - raw.wAreaC,
      raw.wArcB - raw.wAreaA,
      raw.wArcB - raw.wAreaB,
      raw.wArcB - raw.wAreaC,
      raw.wArcC - raw.wAreaA,
      raw.wArcC - raw.wAreaB,
      raw.wArcC - raw.wAreaC,
    ];

    if (prevDiffs !== null) {
      for (let k = 0; k < 9; k += 1) {
        if (prevDiffs[k] === 0 || (prevDiffs[k] < 0 && diffs[k] >= 0) || (prevDiffs[k] > 0 && diffs[k] <= 0)) {
          signChangeRoots[pairNames[k]].push((prevAlpha + alpha) / 2);
        }
      }
    }
    prevDiffs = diffs;
    prevAlpha = alpha;
  }

  // Verify exact crossing topology: 6 total crossings, 0 for (A,b), (B,a), (C,c)
  assert.equal(signChangeRoots['(A,a)'].length, 1, 'Unique root for (A,a)');
  assert.equal(signChangeRoots['(B,b)'].length, 1, 'Unique root for (B,b)');
  assert.equal(signChangeRoots['(B,c)'].length, 1, 'Unique root for (B,c)');
  assert.equal(signChangeRoots['(A,c)'].length, 1, 'Unique root for (A,c)');
  assert.equal(signChangeRoots['(C,b)'].length, 1, 'Unique root for (C,b)');
  assert.equal(signChangeRoots['(C,a)'].length, 1, 'Unique root for (C,a)');
  assert.equal(signChangeRoots['(A,b)'].length, 0, 'Zero roots for (A,b)');
  assert.equal(signChangeRoots['(B,a)'].length, 0, 'Zero roots for (B,a)');
  assert.equal(signChangeRoots['(C,c)'].length, 0, 'Zero roots for (C,c)');

  // 3. Independent verification of Reconstruction Theorem (general + right triangle)
  //    Also verify on non-right triangle (A=50°, B=60°, C=70°)!
  const genArcShares = [(180 - 50) / 360, (180 - 60) / 360, (180 - 70) / 360] as const;
  const genRec = reconstructNormalizedModelFromArcShares(
    genArcShares[0],
    genArcShares[1],
    genArcShares[2]
  );
  const s50 = Math.sin(50 * DEG2RAD);
  const s60 = Math.sin(60 * DEG2RAD);
  const s70 = Math.sin(70 * DEG2RAD);
  const sTot = s50 + s60 + s70;
  assertClose(genRec.sideShareA, s50 / sTot, 'General triangle reconstruction share A');
  assertClose(genRec.sideShareB, s60 / sTot, 'General triangle reconstruction share B');
  assertClose(genRec.sideShareC, s70 / sTot, 'General triangle reconstruction share C');
  assertClose(genRec.angleADeg, 50, 'General triangle angle A');
  assertClose(genRec.angleBDeg, 60, 'General triangle angle B');
  assertClose(genRec.angleCDeg, 70, 'General triangle angle C');

  // 4. Boundary behavior checks (approaching 0+, 45, 90-) without admitting degenerate 0 or 90
  const epsNear0 = independentEuclideanEvaluation(1, 1e-5);
  assert.ok(epsNear0.wAreaA > 0.49999 && epsNear0.wAreaC > 0.49999 && epsNear0.wAreaB < 1e-6);
  const at45 = independentEuclideanEvaluation(1, 45);
  assertClose(at45.wAreaA, at45.wAreaB, 'Exact symmetry at alpha=45 deg');
  assertClose(at45.wAreaC, Math.SQRT2 - 1, 'Exact w_c = sqrt(2)-1 at alpha=45 deg');
  const epsNear90 = independentEuclideanEvaluation(1, 90 - 1e-5);
  assert.ok(epsNear90.wAreaB > 0.49999 && epsNear90.wAreaC > 0.49999 && epsNear90.wAreaA < 1e-6);

  assert.throws(() => computeArcSideAreaPoint(1, 0), RangeError, 'Degenerate alpha=0 must be rejected');
  assert.throws(() => computeArcSideAreaPoint(1, 90), RangeError, 'Degenerate alpha=90 must be rejected');

  console.log('=== Independent 8999-point Scan Root Counts ===');
  for (const name of pairNames) {
    const roots = signChangeRoots[name];
    console.log(`Pair ${name}: ${roots.length} crossing(s)${roots.length > 0 ? ` near alpha ≈ ${roots[0].toFixed(2)}°` : ' (strictly disjoint)'}`);
  }
  console.log('\nEXPERIMENT 06 INDEPENDENT MATHEMATICAL AUDIT — ALL CHECKS PASSED!');
}

runIndependentAudit();
