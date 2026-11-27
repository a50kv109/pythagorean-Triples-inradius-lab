/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import { calculateFourCircles } from '../math/FourCirclesModel.ts';
import { validateFourCirclesInvariants } from '../math/FourCirclesValidators.ts';
import { calculateRightTriangle } from '../math/RightTriangle.ts';
import { calculateSquareA, calculateSquareB, calculateSquareC } from '../math/SquareConstruction.ts';
import { InvalidTriangleInputError } from '../math/inputValidation.ts';
import {
  SYMMETRY_AXIS_EPSILON,
  evaluateSymmetryTrajectoryT,
  isAtSymmetryAxis,
} from '../math/symmetryAnimation.ts';
import {
  calculateThalesCircumcircleFromVertices,
  scaleTriangleGeometry,
  sampleThalesScaleCurves,
} from '../math/ThalesCircumcircle.ts';
import {
  validateAllFiveCirclesInvariants,
  validateThalesCircumcircleInvariants,
} from '../math/ThalesValidators.ts';

const TOL = 1e-9;

const EXPECTED_INVARIANT_IDS = [
  'incircle_positive',
  'squares_construction',
  'square_circles_tangency',
  'incircle_tangency',
  'four_circle_areas',
  'central_sqrt_identity',
  'pythagorean_circle_areas',
  'area_non_equality_contrast',
];

function assertClose(actual: number, expected: number, message: string, tol = TOL) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${message}: expected ${expected}, got ${actual} (diff=${diff})`);
}

const controlTriangles = [
  { a: 3, b: 4, expectedC: 5, expectedR: 1, label: '(3, 4, 5)' },
  { a: 4, b: 3, expectedC: 5, expectedR: 1, label: '(4, 3, 5)' },
  { a: 5, b: 12, expectedC: 13, expectedR: 2, label: '(5, 12, 13)' },
  { a: 4, b: 4, expectedC: 4 * Math.SQRT2, expectedR: 4 - 2 * Math.SQRT2, label: '(4, 4, 4√2)' },
  { a: 1, b: 10, expectedC: Math.sqrt(101), expectedR: (11 - Math.sqrt(101)) / 2, label: '(1, 10, √101)' },
  { a: 10, b: 1, expectedC: Math.sqrt(101), expectedR: (11 - Math.sqrt(101)) / 2, label: '(10, 1, √101)' },
];

console.log('Running Pythagoras — Four Circles Laboratory Test Suite...\n');

// ============================================================================
// 1. Control Triangles Verification: (3,4,5), (5,12,13), (4,4,4√2), (1,10,√101)
// ============================================================================
for (const tc of controlTriangles) {
  const calc = calculateFourCircles(tc.a, tc.b);
  const invariants = validateFourCirclesInvariants(calc, TOL);

  assert.deepEqual(
    invariants.map((inv) => inv.id),
    EXPECTED_INVARIANT_IDS,
    'Invariant IDs must match Four Circles specification'
  );

  for (const inv of invariants) {
    assert.ok(inv.isValid, `${tc.label} invariant failed: ${inv.name} (delta=${inv.delta})`);
  }

  // Hypotenuse & positive inradius
  assertClose(calc.triangle.c, tc.expectedC, `${tc.label} hypotenuse c`);
  assertClose(calc.incircle.radius, tc.expectedR, `${tc.label} inradius r`);
  assert.ok(calc.incircle.radius > 0, `${tc.label} inradius r must be strictly positive`);

  // Circle centers & diameters
  assertClose(calc.circleA.center.x, -tc.a / 2, `${tc.label} Oa.x`);
  assertClose(calc.circleA.center.y, tc.a / 2, `${tc.label} Oa.y`);
  assertClose(calc.circleA.diameter, tc.a, `${tc.label} da`);

  assertClose(calc.circleB.center.x, tc.b / 2, `${tc.label} Ob.x`);
  assertClose(calc.circleB.center.y, -tc.b / 2, `${tc.label} Ob.y`);
  assertClose(calc.circleB.diameter, tc.b, `${tc.label} db`);

  assertClose(calc.circleC.center.x, (tc.a + tc.b) / 2, `${tc.label} Oc.x`);
  assertClose(calc.circleC.center.y, (tc.a + tc.b) / 2, `${tc.label} Oc.y`);
  assertClose(calc.circleC.diameter, tc.expectedC, `${tc.label} dc`);

  assertClose(calc.incircle.center.x, tc.expectedR, `${tc.label} I.x`);
  assertClose(calc.incircle.center.y, tc.expectedR, `${tc.label} I.y`);

  // Four circle areas
  assertClose(calc.circleA.area, (Math.PI * tc.a * tc.a) / 4, `${tc.label} Ka`);
  assertClose(calc.circleB.area, (Math.PI * tc.b * tc.b) / 4, `${tc.label} Kb`);
  assertClose(calc.circleC.area, (Math.PI * tc.expectedC * tc.expectedC) / 4, `${tc.label} Kc`);
  assertClose(calc.incircle.area, Math.PI * tc.expectedR * tc.expectedR, `${tc.label} Ki`);

  // Central identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
  assertClose(calc.sqrtSumLegs, calc.sqrtSumHypAndIn, `${tc.label} central sqrt identity`);

  // Area contrast: Ka + Kb = Kc and Ka + Kb - Kc - Ki = -Ki != 0
  assertClose(calc.areaSumLegs, calc.circleC.area, `${tc.label} Ka + Kb = Kc`);
  assertClose(calc.areaMinusAll, -calc.incircle.area, `${tc.label} Ka + Kb - Kc - Ki = -Ki`);
  assert.ok(calc.areaMinusAll < 0, `${tc.label} area sum mismatch must be strictly negative (-Ki)`);

  console.log(`✓ Control triangle ${tc.label}: all 8 invariants, tangencies, and central identity passed.`);
}

// ============================================================================
// 2. Symmetry Under Leg Swap (a <-> b)
// ============================================================================
const s1 = calculateFourCircles(3, 7);
const s2 = calculateFourCircles(7, 3);
assertClose(s1.circleA.area, s2.circleB.area, 'Leg swap exchanges Ka and Kb');
assertClose(s1.circleC.area, s2.circleC.area, 'Leg swap preserves Kc');
assertClose(s1.incircle.radius, s2.incircle.radius, 'Leg swap preserves inradius r');
assertClose(s1.incircle.area, s2.incircle.area, 'Leg swap preserves Ki');
console.log('✓ Leg-swap symmetry (a <-> b) passed.');

// ============================================================================
// 3. Strict Input Validation Contract
// ============================================================================
const invalidPairs: Array<[number, number]> = [
  [0, 4],
  [4, 0],
  [-5, 4],
  [4, -0.001],
  [NaN, 4],
  [4, NaN],
  [Infinity, 4],
  [4, Infinity],
  [-Infinity, 4],
];

for (const [ia, ib] of invalidPairs) {
  assert.throws(
    () => calculateFourCircles(ia, ib),
    InvalidTriangleInputError,
    `calculateFourCircles(${ia}, ${ib}) must reject invalid input`
  );
  assert.throws(
    () => calculateRightTriangle(ia, ib),
    InvalidTriangleInputError,
    `calculateRightTriangle(${ia}, ${ib}) must reject invalid input`
  );
  assert.throws(
    () => calculateSquareC(ia, ib),
    InvalidTriangleInputError,
    `calculateSquareC(${ia}, ${ib}) must reject invalid input`
  );
}
assert.throws(() => calculateSquareA(0), InvalidTriangleInputError);
assert.throws(() => calculateSquareB(-1), InvalidTriangleInputError);
console.log('✓ Input validation rejected all invalid values (0, <0, NaN, ±Infinity).');

// ============================================================================
// 4. Micro, Macro & Extreme Aspect Ratio Stability
// ============================================================================
const scaleCases: Array<[number, number]> = [
  [1e-6, 1e-6],
  [1e-4, 3e-4],
  [0.2, 15],
  [15, 0.2],
  [1, 1e5],
  [1e5, 1],
  [1e50, 2e50],
];

for (const [sa, sb] of scaleCases) {
  const calc = calculateFourCircles(sa, sb);
  const invs = validateFourCirclesInvariants(calc, TOL);
  for (const inv of invs) {
    assert.ok(inv.isValid, `Scale/aspect case (${sa}, ${sb}) failed ${inv.id}: delta=${inv.delta}`);
  }
}
console.log('✓ Micro, macro, and extreme aspect ratio stability tests passed.');

// ============================================================================
// 5. Mutation Tests (Validators Must Catch Broken Geometry / Identities)
// ============================================================================
{
  const base = calculateFourCircles(4, 3);

  // 5a. Perturb incircle center
  const shiftedIncenter = {
    ...base,
    incircle: { ...base.incircle, center: { x: base.incircle.center.x + 0.05, y: base.incircle.center.y } },
  };
  const m1 = Object.fromEntries(validateFourCirclesInvariants(shiftedIncenter, TOL).map((i) => [i.id, i]));
  assert.equal(m1['incircle_positive'].isValid, false, 'Shifted incenter must fail incircle_positive');
  assert.equal(m1['incircle_tangency'].isValid, false, 'Shifted incenter must fail incircle_tangency');

  // 5b. Perturb Ki area (e.g. mistakenly using excircle instead of incircle)
  const wrongKi = {
    ...base,
    incircle: { ...base.incircle, area: base.incircle.area * 4 },
  };
  const m2 = Object.fromEntries(validateFourCirclesInvariants(wrongKi, TOL).map((i) => [i.id, i]));
  assert.equal(m2['four_circle_areas'].isValid, false, 'Wrong Ki area must fail four_circle_areas');
  assert.equal(m2['central_sqrt_identity'].isValid, false, 'Wrong Ki area must fail central_sqrt_identity');

  // 5c. Perturb Qc vertex
  const skewedQc = {
    ...base,
    squareC: { ...base.squareC, Bc: { x: base.squareC.Bc.x + 0.2, y: base.squareC.Bc.y } },
  };
  const m3 = Object.fromEntries(validateFourCirclesInvariants(skewedQc, TOL).map((i) => [i.id, i]));
  assert.equal(m3['squares_construction'].isValid, false, 'Skewed Qc must fail squares_construction');
  assert.equal(m3['square_circles_tangency'].isValid, false, 'Skewed Qc must fail square_circles_tangency');
}
import {
  computeFourCirclesSpectralAnalysis,
  evaluateParametricFourCircles,
  getNormalizedValuesForMode,
  getThalesNormalizedValueForMode,
  legsFromRatioAndHypotenuse,
  sampleSpectralCurves,
  sampleThalesAbsoluteCurves,
} from '../math/FourCirclesSpectralAnalysis.ts';

// ============================================================================
// 6. Spectral Analysis Unit Tests
// ============================================================================
{
  const calc = calculateFourCircles(4, 3); // Egyptian (3,4,5), r=1
  const spectral = computeFourCirclesSpectralAnalysis(calc);

  assert.equal(spectral.items.length, 4, 'Spectral analysis must return exactly 4 items');

  // Total area sum check
  const sumAreas = spectral.items.reduce((acc, i) => acc + i.area, 0);
  assertClose(spectral.totalArea, sumAreas, 'Total area matches sum of item areas');

  // Percentage shares sum to 100%
  const sumPercent = spectral.items.reduce((acc, i) => acc + i.areaSharePercent, 0);
  assertClose(sumPercent, 100, 'Area percentage shares sum to 100%');

  // Perimeters check
  for (const item of spectral.items) {
    const expectedPerimeter = 2 * Math.PI * item.radius;
    assertClose(item.perimeter, expectedPerimeter, `Perimeter for ${item.id}`);
    assertClose(item.diameter, 2 * item.radius, `Diameter = 2*radius for ${item.id}`);
    assert.ok(Number.isFinite(item.area) && item.area > 0, `Area for ${item.id} must be finite & positive`);
    assert.ok(Number.isFinite(item.perimeter) && item.perimeter > 0, `Perimeter for ${item.id} must be finite & positive`);
  }

  // Leg swap symmetry test for spectral analysis
  const s1a = calculateFourCircles(3, 4);
  const s2a = calculateFourCircles(4, 3);
  const spec1 = computeFourCirclesSpectralAnalysis(s1a);
  const spec2 = computeFourCirclesSpectralAnalysis(s2a);

  const itemA1 = spec1.items.find((i) => i.id === 'Ka')!;
  const itemB2 = spec2.items.find((i) => i.id === 'Kb')!;
  assertClose(itemA1.area, itemB2.area, 'Ka(3,4) equals Kb(4,3)');
}
console.log('✓ Spectral analysis unit tests passed successfully.');

// ============================================================================
// 7. Parametric Spectral Graph & Synchronization Tests (t = 0.1, 0.5, 1, 2, 10)
// ============================================================================
{
  const testRatios = [0.1, 0.5, 1.0, 2.0, 10.0];

  for (const t of testRatios) {
    const p = evaluateParametricFourCircles(t);

    // Independent reference calculations (a = 1, b = t)
    const refC = Math.sqrt(1 + t * t);
    const refR = (1 + t - refC) / 2;

    const refKa = Math.PI / 4;
    const refKb = (Math.PI * t * t) / 4;
    const refKc = (Math.PI * (1 + t * t)) / 4;
    const refKi = Math.PI * refR * refR;

    const refPa = Math.PI;
    const refPb = Math.PI * t;
    const refPc = Math.PI * refC;
    const refPi = 2 * Math.PI * refR;

    // Positivity and finiteness
    assert.ok(p.rNorm > 0 && Number.isFinite(p.rNorm), `t=${t}: r must be positive & finite`);
    for (const k of ['Ka', 'Kb', 'Kc', 'Ki'] as const) {
      assert.ok(p.areasAbs[k] > 0 && Number.isFinite(p.areasAbs[k]), `t=${t}: area ${k} positive`);
      assert.ok(p.radiiAbs[k] > 0 && Number.isFinite(p.radiiAbs[k]), `t=${t}: radius ${k} positive`);
      assert.ok(Number.isFinite(p.areas[k]), `t=${t}: normalized area ${k} finite`);
      assert.ok(Number.isFinite(p.perimeters[k]), `t=${t}: normalized perimeter ${k} finite`);
      assert.ok(Number.isFinite(p.radii[k]), `t=${t}: normalized radius ${k} finite`);
      assert.ok(Number.isFinite(p.diameters[k]), `t=${t}: normalized diameter ${k} finite`);
    }

    // Mode A: Areas normalized to Kc
    assertClose(p.areas.Ka, refKa / refKc, `t=${t}: Ka/Kc`);
    assertClose(p.areas.Kb, refKb / refKc, `t=${t}: Kb/Kc`);
    assertClose(p.areas.Kc, 1.0, `t=${t}: Kc/Kc`);
    assertClose(p.areas.Ki, refKi / refKc, `t=${t}: Ki/Kc`);

    // Pythagorean area sum: Ka + Kb = Kc => Ka/Kc + Kb/Kc = 1
    assertClose(p.areasAbs.Ka + p.areasAbs.Kb, p.areasAbs.Kc, `t=${t}: Ka + Kb = Kc`);
    assertClose(p.areas.Ka + p.areas.Kb, 1.0, `t=${t}: Ka/Kc + Kb/Kc = 1`);

    // Central identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
    const lhsSqrt = Math.sqrt(p.areasAbs.Ka) + Math.sqrt(p.areasAbs.Kb);
    const rhsSqrt = Math.sqrt(p.areasAbs.Kc) + Math.sqrt(p.areasAbs.Ki);
    assertClose(lhsSqrt, rhsSqrt, `t=${t}: central sqrt identity`);
    assertClose(p.identityResidualAbs, 0, `t=${t}: identity residual`);

    // Mode B: Perimeters normalized to Pc
    assertClose(p.perimeters.Ka, refPa / refPc, `t=${t}: Pa/Pc`);
    assertClose(p.perimeters.Kb, refPb / refPc, `t=${t}: Pb/Pc`);
    assertClose(p.perimeters.Kc, 1.0, `t=${t}: Pc/Pc`);
    assertClose(p.perimeters.Ki, refPi / refPc, `t=${t}: Pi/Pc`);

    // Mode C: Radii and Diameters normalized curves must coincide (D = 2R)
    for (const k of ['Ka', 'Kb', 'Kc', 'Ki'] as const) {
      assertClose(p.radii[k], p.diameters[k], `t=${t}: normalized radius == normalized diameter for ${k}`);
      assertClose(p.radii[k], p.perimeters[k], `t=${t}: normalized radius == normalized perimeter for ${k}`);
    }

    // Synchronization check: legsFromRatioAndHypotenuse -> calculateFourCircles -> same normalized ratios
    const { a: syncA, b: syncB } = legsFromRatioAndHypotenuse(t, 5);
    assertClose(syncB / syncA, t, `t=${t}: legsFromRatioAndHypotenuse preserves t = b/a`);
    const syncCalc = calculateFourCircles(syncA, syncB);
    const syncSpec = computeFourCirclesSpectralAnalysis(syncCalc);
    const syncById = Object.fromEntries(syncSpec.items.map((item) => [item.id, item]));
    assertClose(syncById.Ka.areaRatioToKc, p.areas.Ka, `t=${t}: synced Ka/Kc matches curve`);
    assertClose(syncById.Kb.areaRatioToKc, p.areas.Kb, `t=${t}: synced Kb/Kc matches curve`);
    assertClose(syncById.Ki.areaRatioToKc, p.areas.Ki, `t=${t}: synced Ki/Kc matches curve`);
    assertClose(syncById.Ki.radiusRatioToC, p.radii.Ki, `t=${t}: synced Ri/Rc matches curve`);
  }

  // Symmetry t = 1 exact checks
  const sym = evaluateParametricFourCircles(1.0);
  assertClose(sym.areas.Ka, 0.5, 'Symmetry t=1: Ka/Kc = 0.5');
  assertClose(sym.areas.Kb, 0.5, 'Symmetry t=1: Kb/Kc = 0.5');
  assertClose(sym.areas.Ki, 3 - 2 * Math.SQRT2, 'Symmetry t=1: Ki/Kc = 3 - 2√2');
  assertClose(sym.radii.Ka, Math.SQRT1_2, 'Symmetry t=1: Ra/Rc = 1/√2');
  assertClose(sym.radii.Kb, Math.SQRT1_2, 'Symmetry t=1: Rb/Rc = 1/√2');

  // Curve sampler includes symmetry point t = 1 and matches single-point evaluations
  const sampledAreas = sampleSpectralCurves({
    tMin: 0.1,
    tMax: 10,
    steps: 100,
    mode: 'areas',
    scaleMode: 'log',
  });
  assert.ok(sampledAreas.length >= 101, 'Sampled curve must have >= 101 points');
  const symSample = sampledAreas.find((pt) => Math.abs(pt.t - 1) < 1e-9);
  assert.ok(symSample, 'Sampled curve must explicitly contain symmetry point t = 1');
  assertClose(symSample!.Ka, 0.5, 'Sampled symmetry point Ka/Kc = 0.5');
  assertClose(symSample!.Ki, 3 - 2 * Math.SQRT2, 'Sampled symmetry point Ki/Kc');

  const sampledModeC = getNormalizedValuesForMode(sym, 'radii_diameters', 'diameter');
  assertClose(sampledModeC.Ka, Math.SQRT1_2, 'getNormalizedValuesForMode diameter matches 1/√2');
}
console.log('✓ Parametric spectral graph & synchronization tests (t = 0.1, 0.5, 1, 2, 10) passed.');

// ============================================================================
// 8. Regression Tests: Symmetry t <-> 1/t & Symmetry Sweep Trajectory Stability
// ============================================================================
{
  // 8a. Exact symmetry axis values at t = 1 across all modes
  const sym1 = evaluateParametricFourCircles(1.0);
  assertClose(sym1.areas.Ka, 0.5, 'Regression t=1: Ka/Kc = 0.5');
  assertClose(sym1.areas.Kb, 0.5, 'Regression t=1: Kb/Kc = 0.5');
  assertClose(sym1.areas.Kc, 1.0, 'Regression t=1: Kc/Kc = 1.0');
  assertClose(sym1.areas.Ki, 3 - 2 * Math.SQRT2, 'Regression t=1: Ki/Kc = 3 - 2√2');
  assertClose(sym1.perimeters.Ka, Math.SQRT1_2, 'Regression t=1: Pa/Pc = 1/√2');
  assertClose(sym1.perimeters.Kb, Math.SQRT1_2, 'Regression t=1: Pb/Pc = 1/√2');
  assertClose(sym1.perimeters.Ki, Math.SQRT2 - 1, 'Regression t=1: Pi/Pc = √2 - 1');
  assertClose(sym1.radii.Ki, Math.SQRT2 - 1, 'Regression t=1: Ri/Rc = √2 - 1');

  // 8b. Reciprocal symmetry t <-> 1/t across diverse positive ratios (including screenshot case t = 0.2989)
  const asymRatios = [0.1, 0.25, 0.2989, 0.5, 2.0, 4.0, 10.0];
  for (const t of asymRatios) {
    const pT = evaluateParametricFourCircles(t);
    const pInv = evaluateParametricFourCircles(1 / t);

    assertClose(pT.areas.Ka, pInv.areas.Kb, `Reciprocal symmetry t=${t}: Ka/Kc(t) === Kb/Kc(1/t)`);
    assertClose(pT.areas.Kb, pInv.areas.Ka, `Reciprocal symmetry t=${t}: Kb/Kc(t) === Ka/Kc(1/t)`);
    assertClose(pT.areas.Ki, pInv.areas.Ki, `Reciprocal symmetry t=${t}: Ki/Kc(t) === Ki/Kc(1/t)`);
    assertClose(pT.areas.Kc, 1.0, `Reciprocal symmetry t=${t}: Kc/Kc(t) === 1`);
    assertClose(pInv.areas.Kc, 1.0, `Reciprocal symmetry t=${t}: Kc/Kc(1/t) === 1`);

    assertClose(pT.perimeters.Ka, pInv.perimeters.Kb, `Reciprocal symmetry t=${t}: Pa/Pc(t) === Pb/Pc(1/t)`);
    assertClose(pT.perimeters.Kb, pInv.perimeters.Ka, `Reciprocal symmetry t=${t}: Pb/Pc(t) === Pa/Pc(1/t)`);
    assertClose(pT.perimeters.Ki, pInv.perimeters.Ki, `Reciprocal symmetry t=${t}: Pi/Pc(t) === Pi/Pc(1/t)`);

    assertClose(pT.radii.Ka, pInv.radii.Kb, `Reciprocal symmetry t=${t}: Ra/Rc(t) === Rb/Rc(1/t)`);
    assertClose(pT.radii.Kb, pInv.radii.Ka, `Reciprocal symmetry t=${t}: Rb/Rc(t) === Ra/Rc(1/t)`);
    assertClose(pT.radii.Ki, pInv.radii.Ki, `Reciprocal symmetry t=${t}: Ri/Rc(t) === Ri/Rc(1/t)`);
  }

  // 8c. Symmetry axis predicate and t = 1 fixed point
  assert.equal(isAtSymmetryAxis(1.0), true, 't = 1 is on symmetry axis');
  assert.equal(isAtSymmetryAxis(Math.exp(SYMMETRY_AXIS_EPSILON * 0.5)), true, 'tiny epsilon near 1 stays on symmetry axis');
  assert.equal(isAtSymmetryAxis(0.2989), false, 't = 0.2989 is outside symmetry axis epsilon');
  assert.equal(isAtSymmetryAxis(NaN), false, 'NaN is not on symmetry axis');
  assert.equal(isAtSymmetryAxis(-1), false, 'negative value is not on symmetry axis');

  for (let i = 0; i <= 20; i++) {
    const p = i / 20;
    const valAtOne = evaluateSymmetryTrajectoryT(1.0, p);
    assert.equal(valAtOne, 1, `t_start = 1 fixed point holds at progress=${p}`);
  }
  assert.equal(evaluateSymmetryTrajectoryT(0, 0.5), 1, 'non-positive t_start falls back cleanly to 1');
  assert.equal(evaluateSymmetryTrajectoryT(Number.NaN, 0.5), 1, 'NaN t_start falls back cleanly to 1');

  // 8d. Smooth logarithmic trajectory t_start -> 1/t_start -> t_start passing through t = 1
  const trajectoryStarts = [0.05, 0.2989, 0.5, 2.5, 20.0];
  for (const tStart of trajectoryStarts) {
    assertClose(evaluateSymmetryTrajectoryT(tStart, 0), tStart, `Trajectory(${tStart}) start at p=0`);
    assertClose(evaluateSymmetryTrajectoryT(tStart, -0.2), tStart, `Trajectory(${tStart}) clamps p<0`);
    assertClose(evaluateSymmetryTrajectoryT(tStart, 0.21), 1.0, `Trajectory(${tStart}) passes cleanly through t=1 on forward leg (p=0.21)`);
    assertClose(evaluateSymmetryTrajectoryT(tStart, 0.5), 1 / tStart, `Trajectory(${tStart}) reaches reciprocal 1/t_start at hold midpoint (p=0.5)`);
    assertClose(evaluateSymmetryTrajectoryT(tStart, 0.79), 1.0, `Trajectory(${tStart}) passes cleanly through t=1 on return leg (p=0.79)`);
    assertClose(evaluateSymmetryTrajectoryT(tStart, 1), tStart, `Trajectory(${tStart}) returns to t_start at p=1`);
    assertClose(evaluateSymmetryTrajectoryT(tStart, 1.5), tStart, `Trajectory(${tStart}) clamps p>1`);

    // Verify monotonicity and zero jitter across dense progress steps + geometry invariant stability
    const N = 120;
    const expectedSign = tStart < 1 ? 1 : -1;
    let prevU = Math.log(evaluateSymmetryTrajectoryT(tStart, 0));
    for (let i = 1; i <= N; i++) {
      const p = i / N;
      const tVal = evaluateSymmetryTrajectoryT(tStart, p);
      assert.ok(Number.isFinite(tVal) && tVal > 0, `Trajectory(${tStart}) step ${i} finite positive`);
      const currU = Math.log(tVal);

      if (p <= 0.42) {
        assert.ok((currU - prevU) * expectedSign >= -1e-12, `Forward leg monotone without jitter at p=${p}`);
      } else if (p < 0.58 && i / N > 0.42) {
        assertClose(currU, -Math.log(tStart), `Hold segment stays stationary at ln(1/tStart) p=${p}`);
      } else if (p > 0.58) {
        assert.ok((currU - prevU) * (-expectedSign) >= -1e-12, `Return leg monotone without jitter at p=${p}`);
      }
      prevU = currU;

      // Geometry round-trip check under fixed reference hypotenuse c = 5
      const { a, b } = legsFromRatioAndHypotenuse(tVal, 5, 0.2, 15);
      assert.ok(a >= 0.2 - 1e-12 && a <= 15 + 1e-12 && b >= 0.2 - 1e-12 && b <= 15 + 1e-12, `Leg bounds respected along sweep`);
      const calc = calculateFourCircles(a, b);
      const invs = validateFourCirclesInvariants(calc, TOL);
      for (const inv of invs) {
        assert.ok(inv.isValid, `Sweep step t=${tVal} failed invariant ${inv.id}: delta=${inv.delta}`);
      }
    }
  }
}
console.log('✓ Regression tests (symmetry t <-> 1/t, t=1 edge case, smooth log trajectory) passed.');

// ============================================================================
// 9. Thales Circumcircle (K_o) & Five-Circle Integration Tests
// ============================================================================
{
  // 9a. Classical & symmetric triples: (3,4,5), (5,12,13), (4,4,4√2), (8,15,17)
  const thalesTriples = [
    { a: 3, b: 4, c: 5 },
    { a: 5, b: 12, c: 13 },
    { a: 4, b: 4, c: 4 * Math.SQRT2 },
    { a: 8, b: 15, c: 17 },
  ];

  for (const tc of thalesTriples) {
    const calc = calculateFourCircles(tc.a, tc.b);
    const ko = calc.circumcircle;

    assertClose(ko.diameter, tc.c, `Thales (${tc.a},${tc.b}): D_o = c`);
    assertClose(ko.radius, tc.c / 2, `Thales (${tc.a},${tc.b}): R_o = c/2`);
    assertClose(ko.area, (Math.PI * tc.c * tc.c) / 4, `Thales (${tc.a},${tc.b}): K_o = pi*c^2/4`);
    assertClose(ko.circumference, Math.PI * tc.c, `Thales (${tc.a},${tc.b}): L_o = pi*c`);
    assertClose(ko.center.x, tc.b / 2, `Thales (${tc.a},${tc.b}): O_o.x = b/2`);
    assertClose(ko.center.y, tc.a / 2, `Thales (${tc.a},${tc.b}): O_o.y = a/2`);

    // Equidistance from O_o to all 3 vertices A, B, O and inscribed 90-degree angle
    assertClose(ko.vertexDistances.toA, ko.radius, `Thales (${tc.a},${tc.b}): |O_o-A| = R_o`);
    assertClose(ko.vertexDistances.toB, ko.radius, `Thales (${tc.a},${tc.b}): |O_o-B| = R_o`);
    assertClose(ko.vertexDistances.toC, ko.radius, `Thales (${tc.a},${tc.b}): |O_o-O| = R_o`);
    assertClose(ko.angleAtRightVertexDeg, 90, `Thales (${tc.a},${tc.b}): angle AOB = 90 deg`);

    // Structural theorem: K_o = K_c while O_o != O_c and |O_o - O_c| = c/2
    assertClose(ko.area, calc.circleC.area, `Thales (${tc.a},${tc.b}): K_o === K_c`, 1e-12);
    assertClose(ko.areaDiffWithKc, 0, `Thales (${tc.a},${tc.b}): areaDiffWithKc === 0`, 1e-12);
    const centerDist = Math.hypot(ko.center.x - calc.circleC.center.x, ko.center.y - calc.circleC.center.y);
    assertClose(centerDist, tc.c / 2, `Thales (${tc.a},${tc.b}): |O_o - O_c| = c/2`);
    assertClose(ko.centerDistanceToKc, tc.c / 2, `Thales (${tc.a},${tc.b}): centerDistanceToKc = c/2`);
    assert.ok(centerDist > 0, `Thales (${tc.a},${tc.b}): O_o != O_c`);
  }

  // 9b. General shifted & rotated right triangle (C != (0,0), arbitrary hypotenuse endpoints)
  // Proves O_o = (A+B)/2 is computed from actual hypotenuse endpoints, not hardcoded
  {
    const C = { x: 10, y: -4 };
    const theta = 0.63; // arbitrary rotation
    const leg1 = 6;
    const leg2 = 8; // hypotenuse = 10
    const A = { x: C.x + leg1 * Math.cos(theta), y: C.y + leg1 * Math.sin(theta) };
    const B = { x: C.x - leg2 * Math.sin(theta), y: C.y + leg2 * Math.cos(theta) };
    const koRot = calculateThalesCircumcircleFromVertices(A, B, C);

    assertClose(koRot.center.x, (A.x + B.x) / 2, 'Rotated Thales O_o.x = (Ax+Bx)/2');
    assertClose(koRot.center.y, (A.y + B.y) / 2, 'Rotated Thales O_o.y = (Ay+By)/2');
    assertClose(koRot.diameter, 10, 'Rotated Thales D_o = 10');
    assertClose(koRot.radius, 5, 'Rotated Thales R_o = 5');
    assertClose(koRot.vertexDistances.toA, 5, 'Rotated Thales |O_o-A| = 5');
    assertClose(koRot.vertexDistances.toB, 5, 'Rotated Thales |O_o-B| = 5');
    assertClose(koRot.vertexDistances.toC, 5, 'Rotated Thales |O_o-C| = 5');
    assertClose(koRot.angleAtRightVertexDeg, 90, 'Rotated Thales angle ACB = 90 deg');
  }

  // 9c. Extreme aspect ratios & tiny/huge scales
  const extremePairs: Array<[number, number]> = [
    [0.2, 15],
    [15, 0.2],
    [1e-4, 2e-4],
    [1e6, 2e6],
  ];
  for (const [ea, eb] of extremePairs) {
    const calc = calculateFourCircles(ea, eb);
    const thalesInvs = validateThalesCircumcircleInvariants(calc, TOL);
    assert.equal(thalesInvs.length, 9, 'validateThalesCircumcircleInvariants must return 9 invariants');
    for (const inv of thalesInvs) {
      assert.ok(inv.isValid, `Extreme/scale (${ea}, ${eb}) failed ${inv.id}: delta=${inv.delta}`);
    }
    const allInvs = validateAllFiveCirclesInvariants(calc, TOL);
    assert.equal(allInvs.length, 17, 'validateAllFiveCirclesInvariants must return 17 invariants');
    for (const inv of allInvs) {
      assert.ok(inv.isValid, `Combined 17-invariant check (${ea}, ${eb}) failed ${inv.id}: delta=${inv.delta}`);
    }
    // Original 4-circle validator unchanged at 8
    assert.equal(validateFourCirclesInvariants(calc, TOL).length, 8);
  }

  // 9d. Leg-swap symmetry (a, b) <-> (b, a) preserves scalars and reflects O_o (x <-> y)
  {
    const c1 = calculateFourCircles(3, 9);
    const c2 = calculateFourCircles(9, 3);
    assertClose(c1.circumcircle.diameter, c2.circumcircle.diameter, 'Swap preserves D_o');
    assertClose(c1.circumcircle.radius, c2.circumcircle.radius, 'Swap preserves R_o');
    assertClose(c1.circumcircle.area, c2.circumcircle.area, 'Swap preserves K_o');
    assertClose(c1.circumcircle.circumference, c2.circumcircle.circumference, 'Swap preserves L_o');
    assertClose(c1.circumcircle.center.x, c2.circumcircle.center.y, 'Swap reflects O_o.x <-> O_o.y');
    assertClose(c1.circumcircle.center.y, c2.circumcircle.center.x, 'Swap reflects O_o.y <-> O_o.x');
  }

  // 9e. Parametric spectral invariance & monotonic absolute growth of K_o(t)
  {
    const tGrid = [0.05, 0.1, 0.5, 1.0, 2.0, 10.0, 20.0];
    let prevAbs = { Ro: 0, Do: 0, Ko: 0, Lo: 0 };
    for (const t of tGrid) {
      const p = evaluateParametricFourCircles(t);
      assertClose(p.thalesNorm.RoOverC, 0.5, `t=${t}: R_o / c = 0.5`);
      assertClose(p.thalesNorm.DoOverC, 1.0, `t=${t}: D_o / c = 1`);
      assertClose(p.thalesNorm.KoOverKc, 1.0, `t=${t}: K_o / K_c = 1`);
      assertClose(p.thalesNorm.LoOverLc, 1.0, `t=${t}: L_o / L_c = 1`);
      assertClose(p.thalesNorm.RoOverRc, 1.0, `t=${t}: R_o / R_c = 1`);

      assertClose(getThalesNormalizedValueForMode(p, 'areas'), 1.0, `t=${t}: normalized K_o/K_c`);
      assertClose(getThalesNormalizedValueForMode(p, 'perimeters'), 1.0, `t=${t}: normalized L_o/L_c`);
      assertClose(getThalesNormalizedValueForMode(p, 'radii_diameters', 'radius'), 0.5, `t=${t}: normalized R_o/c`);
      assertClose(getThalesNormalizedValueForMode(p, 'radii_diameters', 'diameter'), 1.0, `t=${t}: normalized D_o/c`);

      // Strict monotonic growth of absolute metrics for unit leg a=1, b=t
      assert.ok(p.thalesAbs.Ro > prevAbs.Ro, `t=${t}: R_o*(t) strictly increasing`);
      assert.ok(p.thalesAbs.Do > prevAbs.Do, `t=${t}: D_o*(t) strictly increasing`);
      assert.ok(p.thalesAbs.Ko > prevAbs.Ko, `t=${t}: K_o*(t) strictly increasing`);
      assert.ok(p.thalesAbs.Lo > prevAbs.Lo, `t=${t}: L_o*(t) strictly increasing`);
      prevAbs = p.thalesAbs;
    }

    // Spectral summary keeps items.length === 4 and exposes circumcircleItem
    const spec = computeFourCirclesSpectralAnalysis(calculateFourCircles(4, 3));
    assert.equal(spec.items.length, 4, 'Spectral core items remains 4');
    assert.equal(spec.circumcircleItem.id, 'Ko');
    assertClose(spec.circumcircleItem.areaRatioToKc, 1.0, 'Spectral circumcircleItem Ko/Kc = 1');

    // sampleThalesAbsoluteCurves matches evaluateParametricFourCircles
    const absSamples = sampleThalesAbsoluteCurves({ tMin: 0.1, tMax: 10, steps: 40, scaleMode: 'log' });
    const symPt = absSamples.find((pt) => Math.abs(pt.t - 1) < 1e-9);
    assert.ok(symPt, 'sampleThalesAbsoluteCurves includes t = 1');
    assertClose(symPt!.Do, Math.SQRT2, 't=1 absolute D_o* = sqrt(2)');
    assertClose(symPt!.Ro, Math.SQRT2 / 2, 't=1 absolute R_o* = sqrt(2)/2');
    assertClose(symPt!.Ko, Math.PI / 2, 't=1 absolute K_o* = pi/2');
    assertClose(symPt!.Lo, Math.PI * Math.SQRT2, 't=1 absolute L_o* = pi*sqrt(2)');
  }

  // 9f. Negative/invalid input & mutation detection checks
  assert.throws(
    () => calculateThalesCircumcircleFromVertices({ x: NaN, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }),
    RangeError,
    'Rejects NaN vertex coordinate'
  );
  assert.throws(
    () => calculateThalesCircumcircleFromVertices({ x: 2, y: 3 }, { x: 2, y: 3 }, { x: 0, y: 0 }),
    RangeError,
    'Rejects coincident hypotenuse endpoints A === B'
  );
  assert.throws(
    () => evaluateParametricFourCircles(0),
    RangeError,
    'Rejects t = 0'
  );
  assert.throws(
    () => evaluateParametricFourCircles(-2),
    RangeError,
    'Rejects negative t'
  );
  assert.throws(
    () => evaluateParametricFourCircles(Number.NaN),
    RangeError,
    'Rejects NaN t'
  );

  // Mutation test on Thales validator
  {
    const base = calculateFourCircles(4, 3);
    const brokenCenter = {
      ...base,
      circumcircle: { ...base.circumcircle, center: { x: base.circumcircle.center.x + 0.1, y: base.circumcircle.center.y } },
    };
    const m = Object.fromEntries(validateThalesCircumcircleInvariants(brokenCenter, TOL).map((i) => [i.id, i]));
    assert.equal(m['thales_dist_A'].isValid, false, 'Shifted O_o must fail thales_dist_A');
    assert.equal(m['thales_dist_B'].isValid, false, 'Shifted O_o must fail thales_dist_B');
    assert.equal(m['thales_dist_C'].isValid, false, 'Shifted O_o must fail thales_dist_C');
  }
}
console.log('✓ Section 9: Thales Circumcircle (K_o) & Five-Circle Integration Tests passed.');

// ============================================================================
// 10. Two-Parameter Model: Scale Parameter (lambda) & Homogeneity Law Tests
// ============================================================================
{
  const baseA = 3;
  const baseB = 4;

  // 10a. Identity scaling lambda = 1.0
  {
    const idScale = scaleTriangleGeometry(baseA, baseB, 1.0);
    assertClose(idScale.a, 3, 'lambda=1.0: a = 3');
    assertClose(idScale.b, 4, 'lambda=1.0: b = 4');
    assertClose(idScale.c, 5, 'lambda=1.0: c = 5');
    assertClose(idScale.Do, 5, 'lambda=1.0: Do = 5');
    assertClose(idScale.Ro, 2.5, 'lambda=1.0: Ro = 2.5');
    assertClose(idScale.Lo, 5 * Math.PI, 'lambda=1.0: Lo = 5*pi');
    assertClose(idScale.Ko, (25 * Math.PI) / 4, 'lambda=1.0: Ko = 25*pi/4');
    assertClose(idScale.Kc, (25 * Math.PI) / 4, 'lambda=1.0: Kc = Ko = 25*pi/4');
    assertClose(idScale.Ki, Math.PI, 'lambda=1.0: Ki = pi * 1^2');
    assertClose(idScale.Sc, 25, 'lambda=1.0: Sc = 25');
  }

  // 10b. Doubled scale lambda = 2.0 (lengths double, areas quadruple)
  {
    const dblScale = scaleTriangleGeometry(baseA, baseB, 2.0);
    assertClose(dblScale.a, 6, 'lambda=2.0: a = 6 (2x)');
    assertClose(dblScale.b, 8, 'lambda=2.0: b = 8 (2x)');
    assertClose(dblScale.c, 10, 'lambda=2.0: c = 10 (2x)');
    // Linear metrics (degree 1)
    assertClose(dblScale.Do, 10, 'lambda=2.0: Do = 10 (2^1)');
    assertClose(dblScale.Ro, 5, 'lambda=2.0: Ro = 5 (2^1)');
    assertClose(dblScale.Lo, 10 * Math.PI, 'lambda=2.0: Lo = 10*pi (2^1)');
    // Quadratic metrics (degree 2)
    assertClose(dblScale.Ko, 4 * ((25 * Math.PI) / 4), 'lambda=2.0: Ko = 4 * Ko(1) (2^2)');
    assertClose(dblScale.Kc, 4 * ((25 * Math.PI) / 4), 'lambda=2.0: Kc = 4 * Kc(1) (2^2)');
    assertClose(dblScale.Ki, 4 * Math.PI, 'lambda=2.0: Ki = 4 * Ki(1) (2^2)');
    assertClose(dblScale.Sc, 100, 'lambda=2.0: Sc = 100 = 4 * 25 (2^2)');
  }

  // 10c. Halved scale lambda = 0.5 (lengths halve, areas quarter)
  {
    const halfScale = scaleTriangleGeometry(baseA, baseB, 0.5);
    assertClose(halfScale.a, 1.5, 'lambda=0.5: a = 1.5 (0.5x)');
    assertClose(halfScale.b, 2.0, 'lambda=0.5: b = 2.0 (0.5x)');
    assertClose(halfScale.c, 2.5, 'lambda=0.5: c = 2.5 (0.5x)');
    // Linear metrics (degree 1)
    assertClose(halfScale.Do, 2.5, 'lambda=0.5: Do = 2.5 (0.5^1)');
    assertClose(halfScale.Ro, 1.25, 'lambda=0.5: Ro = 1.25 (0.5^1)');
    assertClose(halfScale.Lo, 2.5 * Math.PI, 'lambda=0.5: Lo = 2.5*pi (0.5^1)');
    // Quadratic metrics (degree 2)
    assertClose(halfScale.Ko, 0.25 * ((25 * Math.PI) / 4), 'lambda=0.5: Ko = 0.25 * Ko(1) (0.5^2)');
    assertClose(halfScale.Kc, 0.25 * ((25 * Math.PI) / 4), 'lambda=0.5: Kc = 0.25 * Kc(1) (0.5^2)');
    assertClose(halfScale.Ki, 0.25 * Math.PI, 'lambda=0.5: Ki = 0.25 * Ki(1) (0.5^2)');
    assertClose(halfScale.Sc, 6.25, 'lambda=0.5: Sc = 6.25 = 0.25 * 25 (0.5^2)');
  }

  // 10d. Independence of t and lambda
  {
    // Varying t at constant c = 5 keeps circumcircle invariants unchanged
    const tValues = [0.2, 0.5, 1.0, 2.0, 5.0];
    for (const t of tValues) {
      const a = 5 / Math.sqrt(1 + t * t);
      const b = t * a;
      const calc = calculateFourCircles(a, b);
      assertClose(calc.circumcircle.diameter, 5, `Const c=5, t=${t}: Do = 5`);
      assertClose(calc.circumcircle.radius, 2.5, `Const c=5, t=${t}: Ro = 2.5`);
      assertClose(calc.circumcircle.area, (25 * Math.PI) / 4, `Const c=5, t=${t}: Ko = 25*pi/4`);
      assertClose(calc.circumcircle.circumference, 5 * Math.PI, `Const c=5, t=${t}: Lo = 5*pi`);
    }

    // Varying lambda at fixed t = 4/3 scales strictly by lambda^1 and lambda^2
    const lambdas = [0.2, 0.7, 1.0, 1.8, 2.5];
    for (const l of lambdas) {
      const scaled = scaleTriangleGeometry(3, 4, l);
      assertClose(scaled.Do / 5, l, `Fixed t, l=${l}: Do(l)/Do(1) = l`);
      assertClose(scaled.Ro / 2.5, l, `Fixed t, l=${l}: Ro(l)/Ro(1) = l`);
      assertClose(scaled.Lo / (5 * Math.PI), l, `Fixed t, l=${l}: Lo(l)/Lo(1) = l`);
      assertClose(scaled.Ko / ((25 * Math.PI) / 4), l * l, `Fixed t, l=${l}: Ko(l)/Ko(1) = l^2`);
      assertClose(scaled.Ki / Math.PI, l * l, `Fixed t, l=${l}: Ki(l)/Ki(1) = l^2`);
      assertClose(scaled.Sc / 25, l * l, `Fixed t, l=${l}: Sc(l)/Sc(1) = l^2`);
    }
  }

  // 10e. Invariant preservation under scaling lambda
  {
    const testLambdas = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.5, 10.0];
    for (const l of testLambdas) {
      const calc = calculateFourCircles(3 * l, 4 * l);
      // All 17 invariants must pass
      const allInvs = validateAllFiveCirclesInvariants(calc, TOL * Math.max(1, l * l));
      assert.equal(allInvs.length, 17, `l=${l}: 17 invariants checked`);
      for (const inv of allInvs) {
        assert.ok(inv.isValid, `l=${l} failed invariant ${inv.id}: delta=${inv.delta}`);
      }

      // Central sqrt identity: sqrt(Ka) + sqrt(Kb) = sqrt(Kc) + sqrt(Ki)
      const sqrtKa = Math.sqrt(calc.circleA.area);
      const sqrtKb = Math.sqrt(calc.circleB.area);
      const sqrtKc = Math.sqrt(calc.circleC.area);
      const sqrtKi = Math.sqrt(calc.incircle.area);
      assertClose(sqrtKa + sqrtKb, sqrtKc + sqrtKi, `l=${l}: central sqrt identity holds`, TOL * l);
    }
  }

  // 10f. sampleThalesScaleCurves verification & input validation
  {
    const scaleCurveSamples = sampleThalesScaleCurves({
      baseC: 5,
      baseA: 3,
      baseB: 4,
      lambdaMin: 0.2,
      lambdaMax: 2.5,
      steps: 50,
      scaleMode: 'linear',
    });
    assert.ok(scaleCurveSamples.length >= 50, 'Scale curves sampled at least 50 points');
    const idPt = scaleCurveSamples.find((pt) => Math.abs(pt.lambda - 1.0) < 1e-9);
    assert.ok(idPt, 'Scale curves include lambda = 1.0 identity point');
    assertClose(idPt!.Do, 5, 'Scale curve at lambda=1: Do = 5');
    assertClose(idPt!.Ro, 2.5, 'Scale curve at lambda=1: Ro = 2.5');
    assertClose(idPt!.Ko, (25 * Math.PI) / 4, 'Scale curve at lambda=1: Ko = 25*pi/4');

    // Rejection of invalid inputs
    assert.throws(() => scaleTriangleGeometry(0, 4, 1), RangeError, 'Rejects baseA <= 0');
    assert.throws(() => scaleTriangleGeometry(3, -1, 1), RangeError, 'Rejects baseB <= 0');
    assert.throws(() => scaleTriangleGeometry(3, 4, 0), RangeError, 'Rejects lambda <= 0');
    assert.throws(() => scaleTriangleGeometry(3, 4, -2), RangeError, 'Rejects negative lambda');
    assert.throws(() => scaleTriangleGeometry(3, 4, Number.NaN), RangeError, 'Rejects NaN lambda');
    assert.throws(
      () => sampleThalesScaleCurves({ baseC: 0, lambdaMin: 0.2, lambdaMax: 2.5 }),
      RangeError,
      'Rejects baseC <= 0'
    );
    assert.throws(
      () => sampleThalesScaleCurves({ baseC: 5, lambdaMin: 2.5, lambdaMax: 0.2 }),
      RangeError,
      'Rejects lambdaMin >= lambdaMax'
    );
  }
}
console.log('✓ Section 10: Scale Parameter (lambda) & Homogeneity Law Tests passed.');

console.log('\n================================================================');
console.log('ALL 10 SECTIONS OF PYTHAGORAS — FIVE CIRCLES GEOMETRY LAB PASSED!');
console.log('================================================================');

