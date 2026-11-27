/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import { calculateFourCircles } from '../math/FourCirclesModel.ts';
import { computeArcAnglePoint } from '../math/experiments/arcAngleParametricAnalysis.ts';

const TOL = 1e-11;

function assertClose(actual: number, expected: number, label: string, tol = TOL): void {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${label}: expected ${expected}, got ${actual} (diff=${diff})`);
}

function runSemanticPassportTests(): void {
  console.log('Running Semantic Formula Passports (F-001 to F-007) verification...');

  // =========================================================================
  // 1. Control Triangle (5, 12, 13) across F-001 through F-006
  // =========================================================================
  const a = 5;
  const b = 12;
  const c = 13;

  // F-001: Pythagorean theorem
  assert.equal(a * a + b * b, c * c, 'F-001: 5^2 + 12^2 must equal 13^2 = 169');
  assert.equal(Math.hypot(a, b), 13, 'F-001: hypotenuse c must equal 13');

  // F-002: Right triangle area
  const areaRight = (a * b) / 2;
  assert.equal(areaRight, 30, 'F-002: S = ab/2 = 30 for (5, 12, 13)');

  // F-003: Semiperimeter (Definition)
  const semiperimeter = (a + b + c) / 2;
  assert.equal(semiperimeter, 15, 'F-003: p = (5 + 12 + 13)/2 = 15');

  // F-005: Right triangle inradius & exact algebraic equivalence
  const rFromFraction = (a * b) / (a + b + c);
  const rFromDifference = (a + b - c) / 2;
  assert.equal(rFromFraction, 2, 'F-005: ab/(a+b+c) = 60/30 = 2');
  assert.equal(rFromDifference, 2, 'F-005: (a+b-c)/2 = 4/2 = 2');
  assert.equal((a + b + c) * (a + b - c), 2 * a * b, 'F-005 rationalization: (a+b+c)(a+b-c) = 2ab');

  // F-004: 3-subtriangle decomposition S = S1 + S2 + S3 = r(a+b+c)/2 = pr
  const r = rFromDifference;
  const s1 = (a * r) / 2;
  const s2 = (b * r) / 2;
  const s3 = (c * r) / 2;
  assert.equal(s1, 5, 'F-004 subtriangle S_OA = ar/2 = 5');
  assert.equal(s2, 12, 'F-004 subtriangle S_OB = br/2 = 12');
  assert.equal(s3, 13, 'F-004 subtriangle S_AB = cr/2 = 13');
  assert.equal(s1 + s2 + s3, 30, 'F-004 sum S1+S2+S3 = 30');
  assert.equal((r * (a + b + c)) / 2, 30, 'F-004 raw form r(a+b+c)/2 = 30');
  assert.equal(semiperimeter * r, 30, 'F-004 compressed form pr = 15*2 = 30');

  // F-006: Four circles identity on FourCirclesModel
  const calc = calculateFourCircles(a, b);
  assertClose(calc.circleA.area, (25 * Math.PI) / 4, 'F-006 Ka = 25*pi/4');
  assertClose(calc.circleB.area, 36 * Math.PI, 'F-006 Kb = 36*pi');
  assertClose(calc.circleC.area, (169 * Math.PI) / 4, 'F-006 Kc = 169*pi/4');
  assertClose(calc.incircle.area, 4 * Math.PI, 'F-006 Ki = 4*pi');

  const expectedSqrtSum = (17 * Math.sqrt(Math.PI)) / 2;
  assertClose(calc.sqrtSumLegs, expectedSqrtSum, 'F-006 sqrt(Ka) + sqrt(Kb) = 17*sqrt(pi)/2');
  assertClose(calc.sqrtSumHypAndIn, expectedSqrtSum, 'F-006 sqrt(Kc) + sqrt(Ki) = 17*sqrt(pi)/2');
  assertClose(calc.identityResidualAbs, 0, 'F-006 central sqrt identity residual = 0');
  assertClose(calc.pythagoreanAreaDiff, 0, 'F-006 Ka + Kb - Kc = 0');
  assertClose(calc.areaMinusAll, -calc.incircle.area, 'F-006 Ka + Kb - Kc - Ki = -Ki');

  // F-006 distinction between Kc (exterior square Qc) and Ko (Thales circumcircle)
  assertClose(calc.circumcircle.area, calc.circleC.area, 'F-006 Ko and Kc have equal area');
  assert.notEqual(
    calc.circumcircle.center.x,
    calc.circleC.center.x,
    'F-006 Ko and Kc have distinct centers'
  );

  // =========================================================================
  // 2. Domain separation checks (General triangle vs Right triangle)
  // =========================================================================
  // Isosceles triangle (5, 5, 6): height to base 6 is 4, S = 12, p = 8, r = 1.5
  const isoA = 5;
  const isoB = 5;
  const isoC = 6;
  const isoP = (isoA + isoB + isoC) / 2;
  const isoS = Math.sqrt(isoP * (isoP - isoA) * (isoP - isoB) * (isoP - isoC));
  const isoR = isoS / isoP;
  assertClose(isoS, 12, 'General triangle (5,5,6) area S = 12');
  assertClose(isoP * isoR, isoS, 'F-004 S = pr holds for non-right triangle (5,5,6)');

  // F-005 and F-006 must NOT hold for non-right triangle (5,5,6)
  const wrongRightInradius = (isoA + isoB - isoC) / 2;
  assert.ok(
    Math.abs(wrongRightInradius - isoR) > 0.4,
    'F-005 (a+b-c)/2 must fail on non-right triangle (5,5,6)'
  );
  const isoSqrtLegs = (Math.sqrt(Math.PI) / 2) * (isoA + isoB);
  const isoSqrtHypIn = Math.sqrt(Math.PI) * (isoC / 2 + isoR);
  assert.ok(
    Math.abs(isoSqrtLegs - isoSqrtHypIn) > 0.5,
    'F-006 sqrt identity must fail on non-right triangle (5,5,6)'
  );

  // =========================================================================
  // 3. F-007 Parametric Model cross-check against Experiment 04
  // =========================================================================
  const testRadii = [1, 2, 3];
  const testAngles = [15, 30, 45, 60, 75];

  for (const rVal of testRadii) {
    for (const alphaDeg of testAngles) {
      const pt = computeArcAnglePoint(rVal, alphaDeg);
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const sinA = Math.sin(alphaRad);
      const cosA = Math.cos(alphaRad);
      const factor = rVal * (1 + sinA + cosA);

      const expectedA = factor / cosA;
      const expectedB = factor / sinA;
      const expectedC = factor / (sinA * cosA);
      const expectedL = rVal * alphaRad;

      assertClose(pt.a, expectedA, `F-007 a(r=${rVal}, alpha=${alphaDeg})`);
      assertClose(pt.b, expectedB, `F-007 b(r=${rVal}, alpha=${alphaDeg})`);
      assertClose(pt.c, expectedC, `F-007 c(r=${rVal}, alpha=${alphaDeg})`);
      assertClose(pt.arcLength, expectedL, `F-007 L(r=${rVal}, alpha=${alphaDeg})`);
      assertClose(pt.angleADeg, 90 - alphaDeg, `F-007 A = 90 - alpha`);
      assertClose(pt.angleBDeg, alphaDeg, `F-007 B = alpha`);
      assertClose(pt.ratioAB, Math.tan(alphaRad), `F-007 a/b = tan(alpha)`);
      assertClose(pt.ratioBA, 1 / Math.tan(alphaRad), `F-007 b/a = cot(alpha)`);
    }
  }

  // Verify why swapped denominators (a = .../sin, b = .../cos) contradict a/b = tan(alpha)
  const alpha30 = (30 * Math.PI) / 180;
  const swappedRatio =
    (1 + Math.sin(alpha30) + Math.cos(alpha30)) /
    Math.sin(alpha30) /
    ((1 + Math.sin(alpha30) + Math.cos(alpha30)) / Math.cos(alpha30));
  assertClose(swappedRatio, 1 / Math.tan(alpha30), 'Swapped denominators give cot(alpha), not tan(alpha)');
  assert.ok(Math.abs(swappedRatio - Math.tan(alpha30)) > 1.0, 'Swapped form differs from tan(30 deg)');

  // Exact recovery of (5, 12, 13) from F-007 at r = 2, alpha = atan(5/12)
  const alpha51213Deg = (Math.atan(5 / 12) * 180) / Math.PI;
  const pt51213 = computeArcAnglePoint(2, alpha51213Deg);
  assertClose(pt51213.a, 5, 'F-007 recovers a = 5 for (5,12,13)');
  assertClose(pt51213.b, 12, 'F-007 recovers b = 12 for (5,12,13)');
  assertClose(pt51213.c, 13, 'F-007 recovers c = 13 for (5,12,13)');
  assertClose(pt51213.rActual, 2, 'F-007 recovers r = 2 for (5,12,13)');
  assertClose(pt51213.angleBDeg, alpha51213Deg, 'F-007 angle B = atan(5/12)');
  assertClose(pt51213.angleADeg, 90 - alpha51213Deg, 'F-007 angle A = 90 - atan(5/12)');

  console.log('ALL SEMANTIC FORMULA PASSPORT TESTS PASSED.');
}

runSemanticPassportTests();
