/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * CANONICAL MIGRATED TEST #3 (`CT-03`, migrated from Legacy `LT-03`:
 *   src/tests/geometry.test.ts, Section 3: Strict Input Validation Contract)
 *
 * Stage 5.1 Formal Passport:
 *   1. Mathematical Principle : A non-degenerate Euclidean right triangle requires strictly
 *      positive, finite leg lengths: (sideA, sideB) in (0, +infinity)^2 subset of R^2.
 *      Zero, -0, negative, NaN, and +/-Infinity values violate finiteness or positivity.
 *   2. Inputs                 : 11 invalid pairs (9 from LT-03 + (-0, 4) + (4, -Infinity)),
 *      6 invalid single-leg values [0, -1, -0, NaN, +Infinity, -Infinity], plus positive boundary
 *      acceptance cases (4, 3), (1e-12, 1e-12), (1e12, 1e12).
 *   3. Canonical Notation     : `InvalidCanonicalTriangleInputError` (fields `sideName`: 'sideA'|'sideB', `value`),
 *      `calculateCanonicalFourCircles`, `buildCanonicalRightTriangle`, `buildCanonicalSquareA/B/C`,
 *      `assertValidCanonicalSide`, `assertValidCanonicalSides`.
 *   4. Expected Invariants    : Every invalid input throws `InvalidCanonicalTriangleInputError` with
 *      exact `sideName` matching the rejected leg; every positive finite pair succeeds deterministically.
 *   5. Legacy Link            : LT-03 (geometry.test.ts:122-156) under Vertex-Preserving map
 *      (legacy.a -> sideB, legacy.b -> sideA, calculateSquareA -> buildCanonicalSquareB,
 *       calculateSquareB -> buildCanonicalSquareA).
 *   6. Pass Criteria          : 100% throw parity across all 9 LT-03 pairs + SquareA/B checks + exact
 *      parameter-role correspondence on `err.sideName`.
 */

import assert from 'node:assert/strict';
import {
  InvalidCanonicalTriangleInputError,
  assertValidCanonicalSide,
  assertValidCanonicalSides,
  buildCanonicalRightTriangle,
  buildCanonicalSquareA,
  buildCanonicalSquareB,
  buildCanonicalSquareC,
  calculateCanonicalFourCircles,
} from '../../canonical/index.ts';
import { calculateFourCircles as calculateLegacyFourCircles } from '../../math/FourCirclesModel.ts';
import { calculateRightTriangle as calculateLegacyRightTriangle } from '../../math/RightTriangle.ts';
import {
  calculateSquareA as calculateLegacySquareA,
  calculateSquareB as calculateLegacySquareB,
  calculateSquareC as calculateLegacySquareC,
} from '../../math/SquareConstruction.ts';
import { InvalidTriangleInputError as LegacyInvalidTriangleInputError } from '../../math/inputValidation.ts';
import type { CanonicalTestPassport } from './testHelpers.ts';

export const CT03_PASSPORT: CanonicalTestPassport = {
  testId: 'CT-03',
  legacyTestId: 'LT-03',
  legacySource: 'src/tests/geometry.test.ts (Section 3, lines 122-156)',
  mathematicalPrinciple:
    'Non-degeneracy and finiteness domain contract: valid right triangles exist iff (sideA, sideB) in (0, +infinity)^2 subset of R^2.',
  inputsDescription: '11 invalid pairs (LT-03 9 pairs + (-0,4), (4,-Infinity)), 6 invalid scalar leg values, and valid positive cases',
  canonicalNotation: [
    'InvalidCanonicalTriangleInputError(sideName, value)',
    'calculateCanonicalFourCircles(sideA, sideB)',
    'buildCanonicalRightTriangle(sideA, sideB)',
    'buildCanonicalSquareA(sideA) / SquareB(sideB) / SquareC(sideA, sideB)',
  ],
  expectedInvariants: [
    'All invalid pairs and scalars throw InvalidCanonicalTriangleInputError with accurate sideName',
    'Valid positive finite inputs (4,3), (1e-12,1e-12), (1e12,1e12) succeed across all constructors',
  ],
  legacyLink: 'Vertex-Preserving parameter-role map: legacy legA (|OA|) <-> canonical sideB (|AC|); legacy legB (|OB|) <-> canonical sideA (|BC|)',
  passCriteria: '100% rejection parity with Legacy LT-03 and exact sideName role match on every mapped rejection',
};

console.log('Running Canonical Shadow Stand Test CT-03 (Migrated from LT-03: Strict Input Validation Contract)...\n');

// ============================================================================
// Part A: Pure Canonical Input Domain Validation Contract (Zero Legacy Calls)
// ============================================================================
const invalidSidePairs: Array<{ sideA: number; sideB: number; badParam: 'sideA' | 'sideB' }> = [
  { sideA: 0, sideB: 4, badParam: 'sideA' },
  { sideA: 4, sideB: 0, badParam: 'sideB' },
  { sideA: -5, sideB: 4, badParam: 'sideA' },
  { sideA: 4, sideB: -0.001, badParam: 'sideB' },
  { sideA: Number.NaN, sideB: 4, badParam: 'sideA' },
  { sideA: 4, sideB: Number.NaN, badParam: 'sideB' },
  { sideA: Number.POSITIVE_INFINITY, sideB: 4, badParam: 'sideA' },
  { sideA: 4, sideB: Number.POSITIVE_INFINITY, badParam: 'sideB' },
  { sideA: Number.NEGATIVE_INFINITY, sideB: 4, badParam: 'sideA' },
  { sideA: 4, sideB: Number.NEGATIVE_INFINITY, badParam: 'sideB' },
  { sideA: -0, sideB: 4, badParam: 'sideA' },
];

for (const tc of invalidSidePairs) {
  assert.throws(
    () => calculateCanonicalFourCircles(tc.sideA, tc.sideB),
    (err: unknown) =>
      err instanceof InvalidCanonicalTriangleInputError && err.sideName === tc.badParam,
    `calculateCanonicalFourCircles(${tc.sideA}, ${tc.sideB}) must reject ${tc.badParam}`
  );
  assert.throws(
    () => buildCanonicalRightTriangle(tc.sideA, tc.sideB),
    (err: unknown) =>
      err instanceof InvalidCanonicalTriangleInputError && err.sideName === tc.badParam,
    `buildCanonicalRightTriangle(${tc.sideA}, ${tc.sideB}) must reject ${tc.badParam}`
  );
  assert.throws(
    () => buildCanonicalSquareC(tc.sideA, tc.sideB),
    (err: unknown) =>
      err instanceof InvalidCanonicalTriangleInputError && err.sideName === tc.badParam,
    `buildCanonicalSquareC(${tc.sideA}, ${tc.sideB}) must reject ${tc.badParam}`
  );
  assert.throws(
    () => assertValidCanonicalSides(tc.sideA, tc.sideB),
    (err: unknown) =>
      err instanceof InvalidCanonicalTriangleInputError && err.sideName === tc.badParam,
    `assertValidCanonicalSides(${tc.sideA}, ${tc.sideB}) must reject ${tc.badParam}`
  );
}

// Single-side square constructors Q_a (on sideA = BC) and Q_b (on sideB = AC)
const invalidSingleValues = [0, -1, -0, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
for (const badVal of invalidSingleValues) {
  assert.throws(
    () => buildCanonicalSquareA(badVal),
    (err: unknown) => err instanceof InvalidCanonicalTriangleInputError && err.sideName === 'sideA',
    `buildCanonicalSquareA(${badVal}) must reject invalid sideA`
  );
  assert.throws(
    () => buildCanonicalSquareB(badVal),
    (err: unknown) => err instanceof InvalidCanonicalTriangleInputError && err.sideName === 'sideB',
    `buildCanonicalSquareB(${badVal}) must reject invalid sideB`
  );
  assert.throws(() => assertValidCanonicalSide(badVal, 'sideA'), InvalidCanonicalTriangleInputError);
}

// Positive domain acceptance check
const validSqA = buildCanonicalSquareA(4);
const validSqB = buildCanonicalSquareB(3);
assert.equal(validSqA.id, 'Qa');
assert.equal(validSqA.attachedSide, 'sideA');
assert.equal(validSqB.id, 'Qb');
assert.equal(validSqB.attachedSide, 'sideB');
for (const [okA, okB] of [
  [4, 3],
  [1e-12, 1e-12],
  [1e12, 1e12],
] as const) {
  const m = calculateCanonicalFourCircles(okA, okB);
  assert.ok(Number.isFinite(m.incircleKi.radius) && m.incircleKi.radius > 0);
}

// ============================================================================
// Part B: Equivalence Check Against Legacy LT-03 Validation Contract
// ============================================================================
// Under Vertex-Preserving map: (legacy.a = sideB, legacy.b = sideA)
const lt03LegacyPairs: Array<{ legA: number; legB: number; expectedCanonicalBadSide: 'sideA' | 'sideB' }> = [
  { legA: 0, legB: 4, expectedCanonicalBadSide: 'sideB' },
  { legA: 4, legB: 0, expectedCanonicalBadSide: 'sideA' },
  { legA: -5, legB: 4, expectedCanonicalBadSide: 'sideB' },
  { legA: 4, legB: -0.001, expectedCanonicalBadSide: 'sideA' },
  { legA: Number.NaN, legB: 4, expectedCanonicalBadSide: 'sideB' },
  { legA: 4, legB: Number.NaN, expectedCanonicalBadSide: 'sideA' },
  { legA: Number.POSITIVE_INFINITY, legB: 4, expectedCanonicalBadSide: 'sideB' },
  { legA: 4, legB: Number.POSITIVE_INFINITY, expectedCanonicalBadSide: 'sideA' },
  { legA: Number.NEGATIVE_INFINITY, legB: 4, expectedCanonicalBadSide: 'sideB' },
];

for (const { legA, legB, expectedCanonicalBadSide } of lt03LegacyPairs) {
  const sideA = legB;
  const sideB = legA;

  let legacyThrew = false;
  let canonicalThrew = false;
  let canonicalSideName: string | undefined;

  try {
    calculateLegacyFourCircles(legA, legB);
  } catch (err) {
    assert.ok(err instanceof LegacyInvalidTriangleInputError);
    legacyThrew = true;
  }

  try {
    calculateCanonicalFourCircles(sideA, sideB);
  } catch (err) {
    assert.ok(err instanceof InvalidCanonicalTriangleInputError);
    canonicalThrew = true;
    canonicalSideName = err.sideName;
  }

  assert.equal(legacyThrew, true, `Legacy must throw for (${legA}, ${legB})`);
  assert.equal(canonicalThrew, true, `Canonical must throw for mapped (${sideA}, ${sideB})`);
  assert.equal(
    canonicalSideName,
    expectedCanonicalBadSide,
    `Mapped (${legA}, ${legB}) -> (${sideA}, ${sideB}) must attribute rejection to ${expectedCanonicalBadSide}`
  );

  assert.throws(() => calculateLegacyRightTriangle(legA, legB), LegacyInvalidTriangleInputError);
  assert.throws(() => buildCanonicalRightTriangle(sideA, sideB), InvalidCanonicalTriangleInputError);

  assert.throws(() => calculateLegacySquareC(legA, legB), LegacyInvalidTriangleInputError);
  assert.throws(() => buildCanonicalSquareC(sideA, sideB), InvalidCanonicalTriangleInputError);
}

// Legacy calculateSquareA(0) (vertical leg |OA|=0) corresponds to Canonical buildCanonicalSquareB(0) (sideB=0)
// Legacy calculateSquareB(-1) (horizontal leg |OB|=-1) corresponds to Canonical buildCanonicalSquareA(-1) (sideA=-1)
assert.throws(() => calculateLegacySquareA(0), LegacyInvalidTriangleInputError);
assert.throws(
  () => buildCanonicalSquareB(0),
  (err: unknown) => err instanceof InvalidCanonicalTriangleInputError && err.sideName === 'sideB'
);
assert.throws(() => calculateLegacySquareB(-1), LegacyInvalidTriangleInputError);
assert.throws(
  () => buildCanonicalSquareA(-1),
  (err: unknown) => err instanceof InvalidCanonicalTriangleInputError && err.sideName === 'sideA'
);

console.log(
  '✓ Rejected all invalid pairs (0, -0, <0, NaN, ±Infinity) across Canonical & Legacy contracts with exact parameter role correspondence.'
);
console.log('\nCANONICAL TEST CT-03 (3/23 MIGRATED) PASSED SUCCESSFULLY!');
