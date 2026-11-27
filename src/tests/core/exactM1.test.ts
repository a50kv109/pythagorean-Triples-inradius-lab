/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ExactDivisionByZeroError,
  ExactDivisibilityError,
  ExactIdentityError,
  InvalidBigIntInputError,
  InvalidRadiusError,
  NotPerfectSquareError,
  RATIONAL_ONE,
  RATIONAL_ZERO,
  absBigInt,
  absRational,
  addRational,
  assertBigInt,
  assertNonNegativeBigInt,
  assertNonZeroBigInt,
  assertPositiveBigInt,
  assertPositiveRadius,
  cmpBigInt,
  cmpRational,
  computeDiameter,
  computeFactorizationShifts,
  computeInradiusFromTriple,
  computeTwoRSquared,
  createRational,
  divModBigInt,
  divRational,
  eqBigInt,
  eqRational,
  exactDivBigInt,
  exactSqrtBigInt,
  formatRational,
  formatRationalFraction,
  gcdBigInt,
  gtRational,
  gteRational,
  invRational,
  isDivisibleBigInt,
  isEvenBigInt,
  isIntegerRational,
  isNegativeRational,
  isOddBigInt,
  isPerfectSquareBigInt,
  isPositiveRational,
  isZeroRational,
  isqrtBigInt,
  lcmBigInt,
  ltRational,
  lteRational,
  maxBigInt,
  minBigInt,
  mulRational,
  negRational,
  parseIntegerBigInt,
  parseRational,
  powBigInt,
  powRational,
  rationalFromBigInt,
  reconstructTripleFromShifts,
  signBigInt,
  subRational,
  verifyCanonicalOrder,
  verifyHyperbolaIdentity,
  verifyPythagoreanIdentity,
} from '../../core/exact/index.ts';

console.log('Running M1 — Exact Computation Core Test Suite...\n');

// ============================================================================
// 1. Isolation Check: M1 Core Must Have Zero Number/Math/React/UI Coupling
// ============================================================================
const exactDir = path.resolve(process.cwd(), 'src/core/exact');
const exactFiles = fs.readdirSync(exactDir).filter((f) => f.endsWith('.ts'));
assert.ok(exactFiles.length >= 4, 'Expected M1 module files in src/core/exact');

for (const file of exactFiles) {
  const raw = fs.readFileSync(path.join(exactDir, file), 'utf8');
  const codeOnly = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseInt\s*\(|\bparseFloat\s*\(/.test(codeOnly), `Forbidden parseInt/parseFloat found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
  assert.ok(!/from\s+['"].*(components|geometry|math)\//.test(codeOnly), `Forbidden UI/legacy coupling in ${file}`);
}
console.log('✓ Section 1: Pure isolation & zero float64/Number/UI coupling verified across src/core/exact/.');

// ============================================================================
// 2. BigInt Arithmetic, Parsing, Comparisons, Divisibility & Exact Division
// ============================================================================
assert.equal(parseIntegerBigInt('  -0042  '), -42n);
assert.equal(parseIntegerBigInt('123456789012345678901234567890'), 123456789012345678901234567890n);
assert.throws(() => parseIntegerBigInt('3.14'), InvalidBigIntInputError);
assert.throws(() => parseIntegerBigInt('1e5'), InvalidBigIntInputError);
assert.throws(() => parseIntegerBigInt(''), InvalidBigIntInputError);

assert.equal(absBigInt(-99n), 99n);
assert.equal(absBigInt(0n), 0n);
assert.equal(signBigInt(-5n), -1);
assert.equal(signBigInt(0n), 0);
assert.equal(signBigInt(5n), 1);
assert.equal(cmpBigInt(-2n, 3n), -1);
assert.equal(cmpBigInt(7n, 7n), 0);
assert.equal(cmpBigInt(10n, 9n), 1);
assert.equal(eqBigInt(42n, 42n), true);
assert.equal(minBigInt(8n, -3n), -3n);
assert.equal(maxBigInt(8n, -3n), 8n);
assert.equal(isEvenBigInt(-4n), true);
assert.equal(isOddBigInt(-3n), true);

assert.deepEqual(divModBigInt(17n, 5n), { quotient: 3n, remainder: 2n });
assert.deepEqual(divModBigInt(-17n, 5n), { quotient: -3n, remainder: -2n });
assert.throws(() => divModBigInt(10n, 0n), ExactDivisionByZeroError);

assert.equal(isDivisibleBigInt(72n, 8n), true);
assert.equal(isDivisibleBigInt(72n, 5n), false);
assert.equal(exactDivBigInt(-84n, 7n), -12n);
assert.throws(() => exactDivBigInt(72n, 5n), ExactDivisibilityError);
assert.throws(() => exactDivBigInt(10n, 0n), ExactDivisionByZeroError);

assert.equal(powBigInt(2n, 0n), 1n);
assert.equal(powBigInt(0n, 0n), 1n);
assert.equal(powBigInt(0n, 5n), 0n);
assert.equal(powBigInt(-3n, 5n), -243n);
assert.throws(() => powBigInt(2n, -1n), InvalidBigIntInputError);
console.log('✓ Section 2: BigInt parsing, comparisons, divMod, exactDiv, and powBigInt passed.');

// ============================================================================
// 3. GCD, LCM & Exact Integer Square Roots (Without Math.sqrt)
// ============================================================================
assert.equal(gcdBigInt(0n, 0n), 0n);
assert.equal(gcdBigInt(0n, -18n), 18n);
assert.equal(gcdBigInt(-48n, 18n), 6n);
assert.equal(gcdBigInt(1071n, 462n), 21n);
assert.equal(lcmBigInt(0n, 25n), 0n);
assert.equal(lcmBigInt(-12n, 18n), 36n);

assert.equal(isqrtBigInt(0n), 0n);
assert.equal(isqrtBigInt(1n), 1n);
assert.equal(isqrtBigInt(2n), 1n);
assert.equal(isqrtBigInt(3n), 1n);
assert.equal(isqrtBigInt(15n), 3n);
assert.equal(isqrtBigInt(16n), 4n);
assert.equal(isqrtBigInt(17n), 4n);

// Large integer exact squares (> 2^53 and > 10^50)
const hugeRoot = 12345678901234567890123456789n;
const hugeSquare = hugeRoot * hugeRoot;
assert.equal(isqrtBigInt(hugeSquare), hugeRoot);
assert.equal(isqrtBigInt(hugeSquare - 1n), hugeRoot - 1n);
assert.equal(isqrtBigInt(hugeSquare + 1n), hugeRoot);
assert.equal(isPerfectSquareBigInt(hugeSquare), true);
assert.equal(isPerfectSquareBigInt(hugeSquare - 1n), false);
assert.equal(isPerfectSquareBigInt(hugeSquare + 1n), false);
assert.equal(isPerfectSquareBigInt(-4n), false);
assert.equal(exactSqrtBigInt(hugeSquare), hugeRoot);
assert.throws(() => exactSqrtBigInt(hugeSquare + 1n), NotPerfectSquareError);
assert.throws(() => isqrtBigInt(-1n), InvalidBigIntInputError);
console.log('✓ Section 3: GCD, LCM, and exact BigInt isqrt/square verification (up to 10^56+) passed.');

// ============================================================================
// 4. ExactRational Normalization, Arithmetic, Comparisons & Error Handling
// ============================================================================
const qNeg = createRational(10n, -15n);
assert.deepEqual(qNeg, { num: -2n, den: 3n });
assert.equal(formatRational(qNeg), '-2/3');
assert.equal(formatRational(createRational(-12n, -3n)), '4');
assert.equal(formatRationalFraction(createRational(-12n, -3n)), '4/1');
assert.deepEqual(createRational(0n, -999n), RATIONAL_ZERO);
assert.equal(isZeroRational(RATIONAL_ZERO), true);
assert.equal(isIntegerRational(rationalFromBigInt(7n)), true);
assert.equal(isIntegerRational(qNeg), false);

assert.throws(() => createRational(1n, 0n), ExactDivisionByZeroError);
assert.throws(() => parseRational('1/0'), ExactDivisionByZeroError);
assert.throws(() => parseRational('1.5'), InvalidBigIntInputError);
assert.throws(() => parseRational('1/2/3'), InvalidBigIntInputError);

const aRat = parseRational(' 6/8 '); // 3/4
const bRat = parseRational('-5/12');
assert.equal(formatRational(addRational(aRat, bRat)), '1/3'); // 9/12 - 5/12 = 4/12 = 1/3
assert.equal(formatRational(subRational(aRat, bRat)), '7/6'); // 9/12 + 5/12 = 14/12 = 7/6
assert.equal(formatRational(mulRational(aRat, bRat)), '-5/16');
assert.equal(formatRational(divRational(aRat, bRat)), '-9/5');
assert.equal(formatRational(negRational(bRat)), '5/12');
assert.equal(formatRational(absRational(bRat)), '5/12');
assert.equal(formatRational(invRational(bRat)), '-12/5');
assert.equal(formatRational(powRational(aRat, 3n)), '27/64');
assert.equal(formatRational(powRational(aRat, 0n)), '1');
assert.equal(formatRational(powRational(aRat, -2n)), '16/9');
assert.equal(eqRational(RATIONAL_ONE, powRational(RATIONAL_ZERO, 0n)), true);

assert.throws(() => divRational(aRat, RATIONAL_ZERO), ExactDivisionByZeroError);
assert.throws(() => invRational(RATIONAL_ZERO), ExactDivisionByZeroError);
assert.throws(() => powRational(RATIONAL_ZERO, -1n), ExactDivisionByZeroError);

assert.equal(cmpRational(bRat, aRat), -1);
assert.equal(ltRational(bRat, aRat), true);
assert.equal(lteRational(aRat, aRat), true);
assert.equal(gtRational(aRat, bRat), true);
assert.equal(gteRational(aRat, aRat), true);
assert.equal(isPositiveRational(aRat), true);
assert.equal(isNegativeRational(bRat), true);

// Exact rational precision beyond IEEE-754 float64
const pBig = 9007199254740993n; // 2^53 + 1 (not representable exactly in float64)
const qBig = 9007199254740992n; // 2^53
const bigRatio = createRational(pBig, qBig);
assert.equal(gtRational(bigRatio, RATIONAL_ONE), true);
assert.equal(formatRational(subRational(bigRatio, RATIONAL_ONE)), `1/${qBig.toString()}`);
console.log('✓ Section 4: ExactRational normalization, arithmetic, comparisons, and >2^53 precision passed.');

// ============================================================================
// 5. Safe Radius, Diameter, 2r^2, and Canonical Shift Identities
// ============================================================================
// Boundary r = 1: (3, 4, 5), x = 1, y = 2 = 2r^2
assert.equal(assertPositiveRadius(1n), 1n);
assert.equal(computeDiameter(1n), 2n);
assert.equal(computeTwoRSquared(1n), 2n);
assert.equal(computeInradiusFromTriple(3n, 4n, 5n), 1n);
assert.deepEqual(computeFactorizationShifts(3n, 4n, 5n, 1n), { x: 1n, y: 2n });
assert.deepEqual(reconstructTripleFromShifts(1n, 1n, 2n), { a: 3n, b: 4n, c: 5n });
assert.equal(verifyHyperbolaIdentity(1n, 1n, 2n), true);

// Reference C(3): (7,24,25), (8,15,17), (9,12,15)
assert.equal(computeDiameter(3n), 6n);
assert.equal(computeTwoRSquared(3n), 18n);
assert.deepEqual(computeFactorizationShifts(7n, 24n, 25n, 3n), { x: 1n, y: 18n });
assert.deepEqual(computeFactorizationShifts(8n, 15n, 17n, 3n), { x: 2n, y: 9n });
assert.deepEqual(computeFactorizationShifts(9n, 12n, 15n, 3n), { x: 3n, y: 6n });
assert.deepEqual(reconstructTripleFromShifts(3n, 2n, 9n), { a: 8n, b: 15n, c: 17n });

// Boundary violation: mirrored y < x or non-canonical (4,3,5)
assert.equal(verifyCanonicalOrder(3n, 4n, 5n), true);
assert.equal(verifyCanonicalOrder(4n, 3n, 5n), false);
assert.equal(verifyPythagoreanIdentity(3n, 4n, 5n), true);
assert.equal(verifyPythagoreanIdentity(3n, 4n, 6n), false);
assert.equal(verifyHyperbolaIdentity(3n, 9n, 2n), false);
assert.throws(() => computeFactorizationShifts(4n, 3n, 5n, 1n), ExactIdentityError);
assert.throws(() => computeFactorizationShifts(7n, 24n, 25n, 2n), ExactIdentityError);
assert.throws(() => reconstructTripleFromShifts(3n, 9n, 2n), ExactIdentityError);

// Very large radius r = 10^15 (where 2r^2 = 2*10^30, c_max ~ 2*10^30 >> 2^53)
const hugeR = 1000000000000000n;
const hugeTwoR2 = computeTwoRSquared(hugeR);
assert.equal(hugeTwoR2, 2000000000000000000000000000000n);
const extremeTriple = reconstructTripleFromShifts(hugeR, 1n, hugeTwoR2);
assert.equal(extremeTriple.a, 2n * hugeR + 1n);
assert.equal(extremeTriple.b, hugeTwoR2 + 2n * hugeR);
assert.equal(extremeTriple.c, hugeTwoR2 + 2n * hugeR + 1n);
assert.equal(
  verifyPythagoreanIdentity(extremeTriple.a, extremeTriple.b, extremeTriple.c),
  true
);
assert.equal(computeInradiusFromTriple(extremeTriple.a, extremeTriple.b, extremeTriple.c), hugeR);
assert.deepEqual(
  computeFactorizationShifts(extremeTriple.a, extremeTriple.b, extremeTriple.c, hugeR),
  { x: 1n, y: hugeTwoR2 }
);

// Invalid radius & runtime type rejection
assert.throws(() => assertPositiveRadius(0n), InvalidRadiusError);
assert.throws(() => assertPositiveRadius(-5n), InvalidRadiusError);
assert.throws(() => assertPositiveRadius(3 as unknown as bigint), InvalidRadiusError);
assert.throws(() => assertBigInt(42 as unknown as bigint), InvalidBigIntInputError);
assert.throws(() => assertPositiveBigInt(0n), InvalidBigIntInputError);
assert.throws(() => assertNonNegativeBigInt(-1n), InvalidBigIntInputError);
assert.throws(() => assertNonZeroBigInt(0n), ExactDivisionByZeroError);
console.log('✓ Section 5: Radius, diameter, 2r^2, extreme r=10^15 identities, and invalid inputs passed.');

console.log('\n================================================================');
console.log('ALL 5 SECTIONS OF M1 EXACT COMPUTATION CORE PASSED!');
console.log('================================================================');
