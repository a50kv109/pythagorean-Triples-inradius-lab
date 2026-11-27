/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * STAGE 4.1 — EXPERIMENT 06 STRICT ROOT AUDIT & IEEE-754 INTERVAL ENCLOSURE SCRIPT
 *
 * Canonical Opposite-Side Notation (MATHEMATICAL_NOTATION_STANDARD.md):
 *   - C = (0,0) right angle (gamma = 90 deg)
 *   - A = (0, sideB), angle alpha = angle(A) in (0, pi/2)
 *   - B = (sideA, 0), angle beta  = angle(B) = pi/2 - alpha
 *   - sideA = |BC| opp A, sideB = |AC| opp B, sideC = |AB| opp C
 *
 * Epistemic discipline:
 *   1. Global existence, uniqueness, concavity, and root-free proofs reside analytically
 *      in `docs/audit/EXPERIMENT_06_STRICT_ROOT_AUDIT.md`. Finite-grid assertions below
 *      verify algebraic/derivative formulas numerically at sample points and do NOT serve
 *      as global proofs.
 *   2. Root localization uses outward-rounded IEEE-754 float64 intervals `[lo, hi]`
 *      (`nextDown` / `nextUp` on `+`, `-`, `*`, `/` plus conservative +-4 ULP padding on
 *      monotone `Math.sin` / `Math.cos` on `[0, pi/2]`). It NEVER collapses brackets on
 *      `fmid === 0`, and stops at the float64 uncertainty band where `0 in f_iv(mid)`.
 *      Because ECMAScript/V8 does not provide hardware `fesetround` or CRlibm formal
 *      bounds for `Math.sin`/`Math.cos`, numerical coordinates for transcendental roots
 *      #1–#4 carry status `NUMERICALLY OBSERVED` (high-precision IEEE-754 enclosure),
 *      while analytical existence/uniqueness and algebraic roots #5–#6 are `PROVEN`.
 */

import assert from 'node:assert/strict';
import { calculateCanonicalFourCircles } from '../../canonical/index.ts';
import {
  computeArcSideAreaPoint,
  findCrossSystemShareCoincidences,
} from '../../math/experiments/arcSideAreaCorrespondence.ts';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function assertClose(actual: number, expected: number, label: string, tol = 1e-12): void {
  const diff = Math.abs(actual - expected);
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(diff <= tol * scale, `${label}: expected ${expected}, got ${actual} (diff=${diff})`);
}

// ============================================================================
// Outward-Rounded IEEE-754 Float64 Interval Arithmetic
// ============================================================================

const _f64Buf = new ArrayBuffer(8);
const _f64View = new DataView(_f64Buf);

function nextUp(x: number): number {
  if (Number.isNaN(x) || x === Infinity) return x;
  if (x === 0) return Number.MIN_VALUE;
  _f64View.setFloat64(0, x, false);
  let bits = _f64View.getBigUint64(0, false);
  bits = x > 0 ? bits + 1n : bits - 1n;
  _f64View.setBigUint64(0, bits, false);
  return _f64View.getFloat64(0, false);
}

function nextDown(x: number): number {
  return -nextUp(-x);
}

function stepUp(x: number, ulps: number): number {
  let v = x;
  for (let i = 0; i < ulps; i += 1) v = nextUp(v);
  return v;
}

function stepDown(x: number, ulps: number): number {
  let v = x;
  for (let i = 0; i < ulps; i += 1) v = nextDown(v);
  return v;
}

interface Interval {
  lo: number;
  hi: number;
}

function ivPoint(x: number): Interval {
  return { lo: x, hi: x };
}

function ivAdd(a: Interval, b: Interval): Interval {
  return { lo: nextDown(a.lo + b.lo), hi: nextUp(a.hi + b.hi) };
}

function ivSub(a: Interval, b: Interval): Interval {
  return { lo: nextDown(a.lo - b.hi), hi: nextUp(a.hi - b.lo) };
}

function ivMul(a: Interval, b: Interval): Interval {
  const products = [a.lo * b.lo, a.lo * b.hi, a.hi * b.lo, a.hi * b.hi];
  return {
    lo: nextDown(Math.min(...products)),
    hi: nextUp(Math.max(...products)),
  };
}

function ivDiv(a: Interval, b: Interval): Interval {
  assert.ok(b.lo > 0 || b.hi < 0, `ivDiv divisor must not contain 0: [${b.lo}, ${b.hi}]`);
  const invB: Interval = {
    lo: nextDown(1 / b.hi),
    hi: nextUp(1 / b.lo),
  };
  return ivMul(a, invB);
}

// Pi enclosure (Math.PI is nearest float64, within 0.5 ULP of pi)
const IV_PI: Interval = { lo: nextDown(Math.PI), hi: nextUp(Math.PI) };
const IV_TWO_PI: Interval = ivMul(ivPoint(2), IV_PI);
const IV_HALF_PI: Interval = ivDiv(IV_PI, ivPoint(2));
const IV_180_OVER_PI: Interval = ivDiv(ivPoint(180), IV_PI);

// Conservative +-4 ULP padding for V8 Math.sin / Math.cos, using strict monotonicity on [0, pi/2]
const TRIG_ULP_PAD = 4;

function ivSinOnFirstQuadrant(x: Interval): Interval {
  assert.ok(x.lo >= 0 && x.hi <= IV_HALF_PI.hi, `ivSin range error: [${x.lo}, ${x.hi}]`);
  return {
    lo: Math.max(0, stepDown(Math.sin(x.lo), TRIG_ULP_PAD)),
    hi: Math.min(1, stepUp(Math.sin(x.hi), TRIG_ULP_PAD)),
  };
}

function ivCosOnFirstQuadrant(x: Interval): Interval {
  assert.ok(x.lo >= 0 && x.hi <= IV_HALF_PI.hi, `ivCos range error: [${x.lo}, ${x.hi}]`);
  return {
    lo: Math.max(0, stepDown(Math.cos(x.hi), TRIG_ULP_PAD)),
    hi: Math.min(1, stepUp(Math.cos(x.lo), TRIG_ULP_PAD)),
  };
}

// Interval canonical share functions on alphaRad in (0, pi/2)
function ivWArcA(alpha: Interval): Interval {
  return ivDiv(ivSub(IV_PI, alpha), IV_TWO_PI);
}
function ivWArcB(alpha: Interval): Interval {
  return ivDiv(ivAdd(IV_HALF_PI, alpha), IV_TWO_PI);
}
function ivWArcC(): Interval {
  return ivPoint(0.25); // 1/4 is exact in binary float64
}

function ivWAreaA(alpha: Interval): Interval {
  const s = ivSinOnFirstQuadrant(alpha);
  const c = ivCosOnFirstQuadrant(alpha);
  const D = ivAdd(ivPoint(1), ivAdd(s, c));
  return ivDiv(s, D);
}
function ivWAreaB(alpha: Interval): Interval {
  const s = ivSinOnFirstQuadrant(alpha);
  const c = ivCosOnFirstQuadrant(alpha);
  const D = ivAdd(ivPoint(1), ivAdd(s, c));
  return ivDiv(c, D);
}
function ivWAreaC(alpha: Interval): Interval {
  const s = ivSinOnFirstQuadrant(alpha);
  const c = ivCosOnFirstQuadrant(alpha);
  const D = ivAdd(ivPoint(1), ivAdd(s, c));
  return ivDiv(ivPoint(1), D);
}

// Scalar canonical functions (for derivative point checks and comparison)
function wArcA(alphaRad: number): number {
  return (Math.PI - alphaRad) / (2 * Math.PI);
}
function wArcB(alphaRad: number): number {
  return (Math.PI / 2 + alphaRad) / (2 * Math.PI);
}
function wArcC(): number {
  return 0.25;
}
function wAreaA(alphaRad: number): number {
  const s = Math.sin(alphaRad);
  const c = Math.cos(alphaRad);
  return s / (1 + s + c);
}
function wAreaB(alphaRad: number): number {
  const s = Math.sin(alphaRad);
  const c = Math.cos(alphaRad);
  return c / (1 + s + c);
}
function wAreaC(alphaRad: number): number {
  const s = Math.sin(alphaRad);
  const c = Math.cos(alphaRad);
  return 1 / (1 + s + c);
}

function ivSign(v: Interval): -1 | 0 | 1 {
  if (v.hi < 0) return -1;
  if (v.lo > 0) return 1;
  return 0;
}

/**
 * Outward-rounded IEEE-754 interval bisection.
 *
 * Guarantees at exit:
 *   - a < b
 *   - ivSign(ivFn(ivPoint(a))) and ivSign(ivFn(ivPoint(b))) are non-zero and opposite.
 * Never collapses [a, b] on `fmid === 0`; stops when bisection probes enter the
 * float64 uncertainty zone where `0 in ivFn(ivPoint(x))`.
 */
function localizeAndEncloseRoot(
  ivFn: (alpha: Interval) => Interval,
  scalarFn: (alphaRad: number) => number,
  loRad: number,
  hiRad: number,
  name: string
): {
  rootRad: number;
  loRad: number;
  hiRad: number;
  rootDeg: number;
  loDeg: number;
  hiDeg: number;
  halfWidthDeg: number;
  intervalAtMid: Interval;
  scalarResidualAtMid: number;
  shareAtMid: number;
} {
  let a = loRad;
  let b = hiRad;
  const sAInit = ivSign(ivFn(ivPoint(a)));
  const sBInit = ivSign(ivFn(ivPoint(b)));
  assert.ok(
    sAInit !== 0 && sBInit !== 0 && sAInit !== sBInit,
    `${name}: initial endpoints must have strictly separated opposite interval signs`
  );

  for (let i = 0; i < 64; i += 1) {
    const mid = 0.5 * (a + b);
    if (mid <= a || mid >= b) break;

    const sMid = ivSign(ivFn(ivPoint(mid)));
    if (sMid === sAInit) {
      a = mid;
    } else if (sMid === sBInit) {
      b = mid;
    } else {
      // Midpoint lies in the float64 interval uncertainty band around the root.
      // Tighten left and right edges while strictly preserving opposite endpoint signs.
      let leftLo = a;
      let leftHi = mid;
      for (let j = 0; j < 20; j += 1) {
        const p = 0.5 * (leftLo + leftHi);
        if (p <= leftLo || p >= leftHi) break;
        if (ivSign(ivFn(ivPoint(p))) === sAInit) {
          leftLo = p;
        } else {
          leftHi = p;
        }
      }
      a = leftLo;

      let rightLo = mid;
      let rightHi = b;
      for (let j = 0; j < 20; j += 1) {
        const p = 0.5 * (rightLo + rightHi);
        if (p <= rightLo || p >= rightHi) break;
        if (ivSign(ivFn(ivPoint(p))) === sBInit) {
          rightHi = p;
        } else {
          rightLo = p;
        }
      }
      b = rightHi;
      break;
    }
  }

  assert.ok(a < b, `${name}: bracket must remain non-degenerate (a=${a}, b=${b})`);
  const finalSA = ivSign(ivFn(ivPoint(a)));
  const finalSB = ivSign(ivFn(ivPoint(b)));
  assert.equal(finalSA, sAInit, `${name}: left endpoint lost guaranteed interval sign`);
  assert.equal(finalSB, sBInit, `${name}: right endpoint lost guaranteed interval sign`);

  const rootRad = 0.5 * (a + b);
  const loDeg = ivMul(ivPoint(a), IV_180_OVER_PI).lo;
  const hiDeg = ivMul(ivPoint(b), IV_180_OVER_PI).hi;
  const halfWidthDeg = 0.5 * (hiDeg - loDeg);

  return {
    rootRad,
    loRad: a,
    hiRad: b,
    rootDeg: rootRad * RAD2DEG,
    loDeg,
    hiDeg,
    halfWidthDeg,
    intervalAtMid: ivFn(ivPoint(rootRad)),
    scalarResidualAtMid: scalarFn(rootRad),
    shareAtMid: 0,
  };
}

console.log('Running Stage 4.1 — Experiment 06 Strict Root Audit & IEEE-754 Enclosure...\n');

// ============================================================================
// 1. Finite-Grid Consistency Checks of Exact Analytical Derivatives & Bounds
//    (Note: these verify formulas at discrete points; global proofs are analytical.)
// ============================================================================
const h = 1e-7;
for (let deg = 1; deg <= 89; deg += 1) {
  const a = deg * DEG2RAD;
  const u = Math.tan(a / 2);
  const D = 1 + Math.sin(a) + Math.cos(a);

  const numDerivA = (wAreaA(a + h) - wAreaA(a - h)) / (2 * h);
  const exactDerivA = (1 + Math.cos(a)) / (D * D);
  const rationalDerivA = (1 + u * u) / (2 * (1 + u) * (1 + u));
  assertClose(numDerivA, exactDerivA, `dwAreaA/da at ${deg} deg`, 1e-8);
  assertClose(exactDerivA, rationalDerivA, `rational dwAreaA/da at ${deg} deg`, 1e-13);

  const numDerivB = (wAreaB(a + h) - wAreaB(a - h)) / (2 * h);
  const exactDerivB = -(1 + Math.sin(a)) / (D * D);
  const rationalDerivB = -(1 + u * u) / 4;
  assertClose(numDerivB, exactDerivB, `dwAreaB/da at ${deg} deg`, 1e-8);
  assertClose(exactDerivB, rationalDerivB, `rational dwAreaB/da at ${deg} deg`, 1e-13);

  const numDerivC = (wAreaC(a + h) - wAreaC(a - h)) / (2 * h);
  const exactDerivC = (Math.sin(a) - Math.cos(a)) / (D * D);
  assertClose(numDerivC, exactDerivC, `dwAreaC/da at ${deg} deg`, 1e-8);

  if (deg >= 45) {
    const h2 = 1e-4;
    const theta = a - Math.PI / 4;
    const d2wC =
      (Math.SQRT2 * (Math.cos(theta) + Math.SQRT2 * (1 + Math.sin(theta) * Math.sin(theta)))) /
      Math.pow(1 + Math.SQRT2 * Math.cos(theta), 3);
    const numD2wC = (wAreaC(a + h2) - 2 * wAreaC(a) + wAreaC(a - h2)) / (h2 * h2);
    assertClose(numD2wC, d2wC, `d2wAreaC/da2 at ${deg} deg`, 1e-6);
    assert.ok(d2wC > 0, `wAreaC convex => f_{B,C} strictly concave at ${deg} deg`);
  }

  // Non-intersecting pair checks at grid points:
  const derivFAB = -1 / (2 * Math.PI) - exactDerivB;
  assert.ok(derivFAB >= 0.25 - 1 / (2 * Math.PI) - 1e-15, `f'_{A,B} > 0 at ${deg} deg`);
  assert.ok(wArcA(a) > wAreaB(a), `wArcA > wAreaB at ${deg} deg`);
  assert.ok(wArcB(a) > wAreaA(a), `wArcB > wAreaA at ${deg} deg`);
  assert.ok(wArcC() < wAreaC(a), `wArcC < wAreaC at ${deg} deg`);
}

// Verify endpoint derivatives and unique maximum alpha_max in (pi/4, pi/2) for f_{B,C}
{
  const dfBC = (a: number): number => {
    const D = 1 + Math.sin(a) + Math.cos(a);
    return 1 / (2 * Math.PI) - (Math.sin(a) - Math.cos(a)) / (D * D);
  };
  assertClose(dfBC(Math.PI / 4), 1 / (2 * Math.PI), "f'_{B,C}(pi/4) = 1/(2pi)", 1e-15);
  assertClose(dfBC(Math.PI / 2), 1 / (2 * Math.PI) - 0.25, "f'_{B,C}(pi/2) = 1/(2pi) - 1/4", 1e-15);
  assert.ok(dfBC(Math.PI / 4) > 0 && dfBC(Math.PI / 2) < 0, "f'_{B,C} changes sign on (pi/4, pi/2)");

  // Localize alpha_max where f'_{B,C}(alpha_max) = 0
  let lo = Math.PI / 4;
  let hi = Math.PI / 2;
  for (let i = 0; i < 60; i += 1) {
    const mid = 0.5 * (lo + hi);
    if (dfBC(mid) > 0) lo = mid;
    else hi = mid;
  }
  const alphaMax = 0.5 * (lo + hi);
  const fMax = wArcB(alphaMax) - wAreaC(alphaMax);
  assert.ok(alphaMax > Math.PI / 4 && alphaMax < Math.PI / 2, 'alpha_max strictly inside (pi/4, pi/2)');
  assert.ok(fMax > 0, `f_{B,C}(alpha_max) > 0 (got ${fMax})`);
}

// ============================================================================
// 2. Localize & Enclose All 6 Roots in Canonical alpha = angle(A)
// ============================================================================
// 1. (A, A): strictly decreasing on (0, pi/2)
const rAA = localizeAndEncloseRoot(
  (a) => ivSub(ivWArcA(a), ivWAreaA(a)),
  (a) => wArcA(a) - wAreaA(a),
  1e-6,
  Math.PI / 2 - 1e-6,
  'Canonical (A,A)'
);
rAA.shareAtMid = wArcA(rAA.rootRad);

// 2. (B, B): strictly increasing on (0, pi/2)
const rBB = localizeAndEncloseRoot(
  (a) => ivSub(ivWArcB(a), ivWAreaB(a)),
  (a) => wArcB(a) - wAreaB(a),
  1e-6,
  Math.PI / 2 - 1e-6,
  'Canonical (B,B)'
);
rBB.shareAtMid = wArcB(rBB.rootRad);

// 3. (B, C): unique root in (pi/4, alpha_max) subset (pi/4, pi/2)
const rBC = localizeAndEncloseRoot(
  (a) => ivSub(ivWArcB(a), ivWAreaC(a)),
  (a) => wArcB(a) - wAreaC(a),
  Math.PI / 4,
  Math.PI / 2 - 1e-4,
  'Canonical (B,C)'
);
rBC.shareAtMid = wArcB(rBC.rootRad);

// 4. (A, C): unique root in (pi/2 - alpha_max, pi/4) subset (0, pi/4)
const rAC = localizeAndEncloseRoot(
  (a) => ivSub(ivWArcA(a), ivWAreaC(a)),
  (a) => wArcA(a) - wAreaC(a),
  1e-4,
  Math.PI / 4,
  'Canonical (A,C)'
);
rAC.shareAtMid = wArcA(rAC.rootRad);

// 5. (C, B): exact algebraic root alpha_5 = atan(4/3) (a:b:c = 4:3:5)
const rCB = localizeAndEncloseRoot(
  (a) => ivSub(ivWArcC(), ivWAreaB(a)),
  (a) => wArcC() - wAreaB(a),
  1e-6,
  Math.PI / 2 - 1e-6,
  'Canonical (C,B)'
);
rCB.shareAtMid = wArcC();
const exactAtan43 = Math.atan2(4, 3);
assert.ok(
  rCB.loRad <= exactAtan43 && exactAtan43 <= rCB.hiRad,
  `Canonical (C,B) enclosure [${rCB.loRad}, ${rCB.hiRad}] must contain atan(4/3)=${exactAtan43}`
);

// 6. (C, A): exact algebraic root alpha_6 = atan(3/4) (a:b:c = 3:4:5)
const rCA = localizeAndEncloseRoot(
  (a) => ivSub(ivWArcC(), ivWAreaA(a)),
  (a) => wArcC() - wAreaA(a),
  1e-6,
  Math.PI / 2 - 1e-6,
  'Canonical (C,A)'
);
rCA.shareAtMid = wArcC();
const exactAtan34 = Math.atan2(3, 4);
assert.ok(
  rCA.loRad <= exactAtan34 && exactAtan34 <= rCA.hiRad,
  `Canonical (C,A) enclosure [${rCA.loRad}, ${rCA.hiRad}] must contain atan(3/4)=${exactAtan34}`
);

// Mirror symmetry checks in Canonical alpha (with tolerances matching IEEE-754 bracket width):
assertClose(rAA.rootDeg + rBB.rootDeg, 90, 'Mirror rAA + rBB = 90 deg', 1e-11);
assertClose(rAC.rootDeg + rBC.rootDeg, 90, 'Mirror rAC + rBC = 90 deg', 1e-11);
assertClose(rCA.rootDeg + rCB.rootDeg, 90, 'Mirror rCA + rCB = 90 deg', 1e-11);

// ============================================================================
// 3. Cross-Check Against Canonical Stand & Legacy Exp 06 Implementation
// ============================================================================
const legCrossings = findCrossSystemShareCoincidences();

// Legacy Exp 06 uses standard opposite-side A/a, B/b, C/c labels,
// differing from Canonical ONLY by input parameterization alphaExp06 === Canonical beta = 90 - alpha.
assertClose(legCrossings.alphaArcAEqualsAreaADeg, 90 - rAA.rootDeg, 'Legacy (A,a) === Canonical (A,A) via beta=90-alpha', 1e-10);
assertClose(legCrossings.alphaArcBEqualsAreaBDeg, 90 - rBB.rootDeg, 'Legacy (B,b) === Canonical (B,B) via beta=90-alpha', 1e-10);
assertClose(legCrossings.alphaArcBEqualsAreaCDeg, 90 - rBC.rootDeg, 'Legacy (B,c) === Canonical (B,C) via beta=90-alpha', 1e-10);
assertClose(legCrossings.alphaArcAEqualsAreaCDeg, 90 - rAC.rootDeg, 'Legacy (A,c) === Canonical (A,C) via beta=90-alpha', 1e-10);
assertClose(legCrossings.alphaArcCEqualsAreaBDeg, 90 - rCB.rootDeg, 'Legacy (C,b) === Canonical (C,B) via beta=90-alpha', 1e-10);
assertClose(legCrossings.alphaArcCEqualsAreaADeg, 90 - rCA.rootDeg, 'Legacy (C,a) === Canonical (C,A) via beta=90-alpha', 1e-10);

for (const [label, root] of [
  ['(A,A)', rAA],
  ['(B,B)', rBB],
  ['(B,C)', rBC],
  ['(A,C)', rAC],
  ['(C,B)', rCB],
  ['(C,A)', rCA],
] as const) {
  const m = calculateCanonicalFourCircles(Math.sin(root.rootRad), Math.cos(root.rootRad));
  const legacyAtBeta = computeArcSideAreaPoint(m.incircleKi.radius, m.triangle.angleBetaDeg);
  assertClose(m.incenterPartition.arcShareA, wArcA(root.rootRad), `${label}: Canonical arcShareA`);
  assertClose(m.incenterPartition.arcShareB, wArcB(root.rootRad), `${label}: Canonical arcShareB`);
  assertClose(m.incenterPartition.areaShareA, wAreaA(root.rootRad), `${label}: Canonical areaShareA`);
  assertClose(m.incenterPartition.areaShareB, wAreaB(root.rootRad), `${label}: Canonical areaShareB`);
  assertClose(m.incenterPartition.areaShareC, wAreaC(root.rootRad), `${label}: Canonical areaShareC`);
  assertClose(m.incenterPartition.areaShareA, legacyAtBeta.areaShareA, `${label}: matches Legacy areaShareA`);
  assertClose(m.incenterPartition.areaShareB, legacyAtBeta.areaShareB, `${label}: matches Legacy areaShareB`);
  assertClose(m.incenterPartition.areaShareC, legacyAtBeta.areaShareC, `${label}: matches Legacy areaShareC`);
  assertClose(m.incenterPartition.arcShareA, legacyAtBeta.arcShareA, `${label}: matches Legacy arcShareA`);
  assertClose(m.incenterPartition.arcShareB, legacyAtBeta.arcShareB, `${label}: matches Legacy arcShareB`);
}

// ============================================================================
// 4. Special Cases: 3:4:5, 4:3:5, Isosceles 45 deg, Limits 0+ and 90-
// ============================================================================
{
  const tri345 = calculateCanonicalFourCircles(3, 4);
  assertClose(tri345.triangle.angleAlphaDeg, Math.atan2(3, 4) * RAD2DEG, '3:4:5 alpha = atan(3/4)');
  assertClose(tri345.incenterPartition.areaShareA, 3 / 12, '3:4:5 w_area_A = 1/4 = w_arc_C');
  assertClose(tri345.incenterPartition.areaShareB, 4 / 12, '3:4:5 w_area_B = 1/3');
  assertClose(tri345.incenterPartition.areaShareC, 5 / 12, '3:4:5 w_area_C = 5/12');

  const tri435 = calculateCanonicalFourCircles(4, 3);
  assertClose(tri435.triangle.angleAlphaDeg, Math.atan2(4, 3) * RAD2DEG, '4:3:5 alpha = atan(4/3)');
  assertClose(tri435.incenterPartition.areaShareA, 4 / 12, '4:3:5 w_area_A = 1/3');
  assertClose(tri435.incenterPartition.areaShareB, 3 / 12, '4:3:5 w_area_B = 1/4 = w_arc_C');
  assertClose(tri435.incenterPartition.areaShareC, 5 / 12, '4:3:5 w_area_C = 5/12');

  const iso = calculateCanonicalFourCircles(1, 1);
  assertClose(iso.incenterPartition.arcShareA, 0.375, '45 deg: wArcA = 3/8');
  assertClose(iso.incenterPartition.arcShareB, 0.375, '45 deg: wArcB = 3/8');
  assertClose(iso.incenterPartition.arcShareC, 0.25, '45 deg: wArcC = 1/4');
  assertClose(iso.incenterPartition.areaShareA, 1 / (2 + Math.SQRT2), '45 deg: wAreaA');
  assertClose(iso.incenterPartition.areaShareB, 1 / (2 + Math.SQRT2), '45 deg: wAreaB');
  assertClose(iso.incenterPartition.areaShareC, Math.SQRT2 - 1, '45 deg: wAreaC = sqrt(2)-1');

  // Near-degenerate limit alpha -> 0+ (1e-5 deg)
  const epsRad = 1e-5 * DEG2RAD;
  const nearZero = calculateCanonicalFourCircles(Math.sin(epsRad), Math.cos(epsRad));
  assertClose(nearZero.incenterPartition.arcShareA, 0.5, '0+ limit: wArcA -> 1/2', 1e-6);
  assertClose(nearZero.incenterPartition.arcShareB, 0.25, '0+ limit: wArcB -> 1/4', 1e-6);
  assertClose(nearZero.incenterPartition.areaShareA, 0, '0+ limit: wAreaA -> 0', 1e-6);
  assertClose(nearZero.incenterPartition.areaShareB, 0.5, '0+ limit: wAreaB -> 1/2', 1e-6);
  assertClose(nearZero.incenterPartition.areaShareC, 0.5, '0+ limit: wAreaC -> 1/2', 1e-6);

  // Near-degenerate limit alpha -> 90- (90 - 1e-5 deg)
  const nearNinetyRad = Math.PI / 2 - epsRad;
  const nearNinety = calculateCanonicalFourCircles(Math.sin(nearNinetyRad), Math.cos(nearNinetyRad));
  assertClose(nearNinety.incenterPartition.arcShareA, 0.25, '90- limit: wArcA -> 1/4', 1e-6);
  assertClose(nearNinety.incenterPartition.arcShareB, 0.5, '90- limit: wArcB -> 1/2', 1e-6);
  assertClose(nearNinety.incenterPartition.areaShareA, 0.5, '90- limit: wAreaA -> 1/2', 1e-6);
  assertClose(nearNinety.incenterPartition.areaShareB, 0, '90- limit: wAreaB -> 0', 1e-6);
  assertClose(nearNinety.incenterPartition.areaShareC, 0.5, '90- limit: wAreaC -> 1/2', 1e-6);
}

console.log('=== Localized IEEE-754 Outward-Rounded Interval Enclosures (alpha = angle(A)) ===');
for (const [id, r] of [
  ['1. wArcA = wAreaA', rAA],
  ['2. wArcB = wAreaB', rBB],
  ['3. wArcB = wAreaC', rBC],
  ['4. wArcA = wAreaC', rAC],
  ['5. wArcC = wAreaB (4:3:5)', rCB],
  ['6. wArcC = wAreaA (3:4:5)', rCA],
] as const) {
  console.log(
    `${id}: alpha=${r.rootDeg.toFixed(12)}° [${r.loDeg.toFixed(13)}°, ${r.hiDeg.toFixed(13)}°], ` +
      `halfWidth=${r.halfWidthDeg.toExponential(2)}°, |res|=${Math.abs(r.scalarResidualAtMid).toExponential(2)}, ` +
      `share=${(r.shareAtMid * 100).toFixed(8)}%`
  );
}

console.log('\nSTAGE 4.1 EXPERIMENT 06 STRICT ROOT AUDIT — ALL ANALYTICAL & NUMERICAL CHECKS PASSED!');
