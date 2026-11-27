/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  InvalidRadiusError,
  InvalidBigIntInputError,
  computeTwoRSquared,
  verifyHyperbolaIdentity,
} from '../../core/exact/index.ts';
import {
  CombinatorialLimitError,
  DETERMINISTIC_MR_LIMIT_13_BASES,
  IncompleteFactorizationError,
  InvalidFactorizationInputError,
  analyzeRadiusNumberTheory,
  buildHyperbolaDivisorPairs,
  certifyPrimality,
  computeArithmeticCounters,
  countDivisorsFromFactorization,
  factorizeBigInt,
  generateDivisorsFromFactorization,
  liftRadiusFactorizationToTwoRSquared,
  modAddBigInt,
  modMulBigInt,
  modPowBigInt,
  passesMillerRabinBase,
  reconstructFromFactorization,
  verifyDivisorsComplete,
} from '../../core/factorization/index.ts';

console.log('Running M2 — Number Theory Engine Test Suite (with Stabilization Patch)...\n');

// ============================================================================
// 1. Isolation Check: M2 Must Have Zero Number Math, Math.*, React, UI, or M3 Coupling
// ============================================================================
const factorDir = path.resolve(process.cwd(), 'src/core/factorization');
const factorFiles = fs.readdirSync(factorDir).filter((f) => f.endsWith('.ts'));
assert.ok(factorFiles.length >= 8, 'Expected modular M2 source files in src/core/factorization');

for (const file of factorFiles) {
  const raw = fs.readFileSync(path.join(factorDir, file), 'utf8');
  const codeOnly = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseInt\s*\(|\bparseFloat\s*\(/.test(codeOnly), `Forbidden parseInt/parseFloat found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
  assert.ok(
    !/from\s+['"].*(components|geometry|math|canonical|classification|verification)\//.test(codeOnly),
    `Forbidden UI/legacy/M3+/M6 coupling found in ${file}`
  );
  // Ensure M1 is accessed only via ../exact/index.ts
  const exactImports = [...codeOnly.matchAll(/from\s+['"](\.\.\/exact\/[^'"]+)['"]/g)].map((m) => m[1]);
  for (const imp of exactImports) {
    assert.equal(imp, '../exact/index.ts', `M2 file ${file} must import M1 strictly via ../exact/index.ts`);
  }
}
console.log('✓ Section 1: Pure BigInt isolation & M1 barrel-only dependency verified across src/core/factorization/.');

// ============================================================================
// 2. Modular Arithmetic & Prime Certification (M2.2 & Stabilization M2-AUD-01, M2-AUD-04)
// ============================================================================
assert.equal(modAddBigInt(-3n, 10n, 7n), 0n);
assert.equal(modMulBigInt(1000000007n, 1000000009n, 998244353n), (1000000007n * 1000000009n) % 998244353n);
assert.equal(modPowBigInt(2n, 10n, 1000n), 24n);
assert.equal(modPowBigInt(7n, 0n, 1n), 0n);
assert.equal(modPowBigInt(2n, 560n, 561n), 1n);
assert.equal(modPowBigInt(3n, 560n, 561n), 375n);

// M2-AUD-01: passesMillerRabinBase strict domain validation (reject base < 2 or base >= n)
assert.throws(() => passesMillerRabinBase(15n, 1n), InvalidFactorizationInputError);
assert.throws(() => passesMillerRabinBase(15n, 15n), InvalidFactorizationInputError);
assert.throws(() => passesMillerRabinBase(15n, 16n), InvalidFactorizationInputError);
assert.equal(passesMillerRabinBase(15n, 2n), false);
assert.equal(passesMillerRabinBase(13n, 2n), true);

// Unit 1n
const unitCert = certifyPrimality(1n);
assert.equal(unitCert.verdict, 'UNIT');
assert.equal(unitCert.isPrime, false);
assert.equal(unitCert.isProven, true);

// Proven primes within Sorenson-Webster 13-base limit
for (const p of [2n, 3n, 5n, 97n, 101n, 104729n, 1000000007n, (1n << 61n) - 1n]) {
  const c = certifyPrimality(p);
  assert.equal(c.verdict, 'PROVEN_PRIME', `Expected PROVEN_PRIME for ${p.toString()}`);
  assert.equal(c.isPrime, true);
  assert.equal(c.isProven, true);
}

// Carmichael numbers and famous strong pseudoprimes must be caught as COMPOSITE
for (const comp of [561n, 1729n, 41041n, 341550071728321n]) {
  const c = certifyPrimality(comp);
  assert.equal(c.verdict, 'COMPOSITE', `Expected COMPOSITE for ${comp.toString()}`);
  assert.equal(c.isPrime, false);
  assert.equal(c.isProven, true);
}

// Genuine prime strictly above Sorenson-Webster bound (~3.317 * 10^24): M_89 = 2^89 - 1
const mersenne89 = (1n << 89n) - 1n;
assert.ok(mersenne89 > DETERMINISTIC_MR_LIMIT_13_BASES);
const probableCert = certifyPrimality(mersenne89);
assert.equal(probableCert.verdict, 'PROBABLE_PRIME');
assert.equal(probableCert.isPrime, null);
assert.equal(probableCert.isProven, false);
assert.equal(probableCert.method, 'PROBABILISTIC_MILLER_RABIN');

// Attempting to raise deterministicMillerRabinMax above the mathematical limit must remain clamped
const clampedCert = certifyPrimality(mersenne89, {
  deterministicMillerRabinMax: mersenne89 + 1000n,
});
assert.equal(clampedCert.verdict, 'PROBABLE_PRIME');
assert.equal(clampedCert.deterministicThreshold, DETERMINISTIC_MR_LIMIT_13_BASES);

console.log('✓ Section 2: Modular arithmetic, MR domain validation (M2-AUD-01), and prime certification passed.');

// ============================================================================
// 3. Prime Factorization (M2.1): Primes, Powers, Mixed, Pollard-Brent & Incomplete States
// ============================================================================
// Truncated trial division safety edge case: 49n with trialDivisionLimit = 6n must NOT falsely claim 49 is prime
const f49 = factorizeBigInt(49n, { trialDivisionLimit: 6n });
assert.equal(f49.isComplete, true);
assert.deepEqual(
  f49.primeFactors.map((f) => [f.prime, f.exponent, f.status]),
  [[7n, 2n, 'PROVEN_PRIME']]
);

// Prime power
const fPow2 = factorizeBigInt(1024n);
assert.equal(fPow2.twoExponent, 10n);
assert.equal(fPow2.oddPrimeFactors.length, 0);
assert.equal(fPow2.certificationStatus, 'PROVEN_COMPLETE');
assert.equal(reconstructFromFactorization(fPow2), 1024n);

// Large composite > 2^53 factored via Pollard-Brent (bypassing trial division)
const pA = 1000000007n;
const pB = 1000000009n;
const semiLarge = pA * pB; // ~10^18 > 2^53
const fSemi = factorizeBigInt(semiLarge, { trialDivisionLimit: 100n });
assert.equal(fSemi.isComplete, true);
assert.equal(fSemi.certificationStatus, 'PROVEN_COMPLETE');
assert.deepEqual(
  fSemi.primeFactors.map((f) => [f.prime, f.exponent, f.status]),
  [
    [pA, 1n, 'PROVEN_PRIME'],
    [pB, 1n, 'PROVEN_PRIME'],
  ]
);
assert.equal(fSemi.reconstructedFromPrimes, semiLarge);

// Mixed factorization containing a PROBABLE_PRIME (> 3.317 * 10^24)
const mixedProbable = 12n * mersenne89; // 2^2 * 3 * (2^89 - 1)
const fMixedProb = factorizeBigInt(mixedProbable);
assert.equal(fMixedProb.isComplete, true);
assert.equal(fMixedProb.certificationStatus, 'PROBABLE_COMPLETE');
assert.equal(fMixedProb.reconstructedFromPrimes, mixedProbable);
assert.ok(fMixedProb.warnings.some((w) => w.code === 'PROBABLE_PRIME_USED'));
assert.equal(fMixedProb.oddPrimeFactors[1].status, 'PROBABLE_PRIME');

// Forced incomplete factorization -> UNFACTORED_COMPOSITE (explicit, never masked)
const hardComposite = 1000003n * 1000033n; // > 10^12
const incompleteFact = factorizeBigInt(hardComposite, {
  trialDivisionLimit: 100n,
  maxPollardIterations: 2n,
});
assert.equal(incompleteFact.isComplete, false);
assert.equal(incompleteFact.certificationStatus, 'INCOMPLETE');
assert.equal(incompleteFact.unfactoredComposites.length, 1);
assert.equal(incompleteFact.unfactoredComposites[0].status, 'UNFACTORED_COMPOSITE');
assert.equal(incompleteFact.unfactoredComposites[0].value, hardComposite);
assert.equal(incompleteFact.reconstructedTotal, hardComposite);
assert.throws(() => countDivisorsFromFactorization(incompleteFact), IncompleteFactorizationError);
assert.throws(() => generateDivisorsFromFactorization(incompleteFact), IncompleteFactorizationError);
assert.throws(() => computeArithmeticCounters(incompleteFact), IncompleteFactorizationError);

const incompleteAnalysis = analyzeRadiusNumberTheory(hardComposite, {
  trialDivisionLimit: 100n,
  maxPollardIterations: 2n,
});
assert.equal(incompleteAnalysis.isFactorizationComplete, false);
assert.equal(incompleteAnalysis.certificationStatus, 'INCOMPLETE');
assert.equal(incompleteAnalysis.divisorsOfR, null);
assert.equal(incompleteAnalysis.divisorsOfTwoRSquared, null);
assert.equal(incompleteAnalysis.hyperbolaPairs, null);
assert.equal(incompleteAnalysis.counters, null);
assert.ok(incompleteAnalysis.warnings.some((w) => w.code === 'INCOMPLETE_FACTORIZATION'));

console.log('✓ Section 3: Prime factorization, 2r^2 lifting, probable-prime flagging & UNFACTORED_COMPOSITE handling passed.');

// ============================================================================
// 4. Mandatory Control Radii (r = 1, 2, 3, 6, 15, 30, 35, 100) & M2-AUD-02 (Standalone Hyperbola Hardening)
// ============================================================================
// M2-AUD-02: Standalone buildHyperbolaDivisorPairs must reject incomplete subsets like [1n, 18n] for r=3
assert.throws(() => buildHyperbolaDivisorPairs(3n, [1n, 18n]), IncompleteFactorizationError);

interface ExpectedControl {
  readonly r: bigint;
  readonly omegaStar: bigint;
  readonly tauR: bigint;
  readonly T: bigint;
  readonly N: bigint;
}

const controlCases: readonly ExpectedControl[] = [
  { r: 1n, omegaStar: 0n, tauR: 1n, T: 1n, N: 1n },
  { r: 2n, omegaStar: 0n, tauR: 2n, T: 1n, N: 2n },
  { r: 3n, omegaStar: 1n, tauR: 2n, T: 2n, N: 3n },
  { r: 6n, omegaStar: 1n, tauR: 4n, T: 2n, N: 6n },
  { r: 15n, omegaStar: 2n, tauR: 4n, T: 4n, N: 9n },
  { r: 30n, omegaStar: 2n, tauR: 8n, T: 4n, N: 18n },
  { r: 35n, omegaStar: 2n, tauR: 4n, T: 4n, N: 9n },
  { r: 100n, omegaStar: 1n, tauR: 9n, T: 2n, N: 15n },
];

for (const expected of controlCases) {
  const res = analyzeRadiusNumberTheory(expected.r);
  assert.equal(res.radius, expected.r);
  assert.equal(res.diameter, 2n * expected.r);
  assert.equal(res.twoRSquared, computeTwoRSquared(expected.r));
  assert.equal(res.isFactorizationComplete, true);
  assert.equal(res.isDivisorEnumerationComplete, true);
  assert.equal(res.certificationStatus, 'PROVEN_COMPLETE');
  assert.equal(res.rFactorization.reconstructedFromPrimes, expected.r);
  assert.equal(res.twoRSquaredFactorization.factorization.reconstructedFromPrimes, res.twoRSquared);

  assert.ok(res.counters !== null && res.divisorsOfR !== null && res.divisorsOfTwoRSquared !== null && res.hyperbolaPairs !== null);
  assert.equal(res.counters.omegaStar, expected.omegaStar);
  assert.equal(res.counters.tauR, expected.tauR);
  assert.equal(res.counters.T, expected.T);
  assert.equal(res.counters.N, expected.N);
  assert.equal(BigInt(res.divisorsOfR.length), expected.tauR);
  assert.equal(BigInt(res.divisorsOfTwoRSquared.length), 2n * expected.N);
  assert.equal(BigInt(res.hyperbolaPairs.length), expected.N);

  // Verify standalone buildHyperbolaDivisorPairs succeeds with complete valid divisors of 2r^2
  const standalonePairs = buildHyperbolaDivisorPairs(expected.r, res.divisorsOfTwoRSquared);
  assert.equal(standalonePairs.length, res.hyperbolaPairs.length);

  // Verify every pair satisfies xy = 2r^2, x^2 < 2r^2 < y^2, and uniqueness
  const seenX = new Set<bigint>();
  for (const pair of res.hyperbolaPairs) {
    assert.equal(pair.x * pair.y, res.twoRSquared);
    assert.ok(pair.x >= 1n);
    assert.ok(pair.x * pair.x < res.twoRSquared);
    assert.ok(pair.y * pair.y > res.twoRSquared);
    assert.ok(pair.y <= res.twoRSquared);
    assert.equal(verifyHyperbolaIdentity(expected.r, pair.x, pair.y), true);
    assert.equal(seenX.has(pair.x), false);
    seenX.add(pair.x);
  }
}

// Explicit boundary case r = 1 -> [(1, 2)]
const r1 = analyzeRadiusNumberTheory(1n);
assert.deepEqual(r1.hyperbolaPairs, [{ x: 1n, y: 2n }]);

// Explicit reference class C(3) pairs -> {(1, 18), (2, 9), (3, 6)}
const r3 = analyzeRadiusNumberTheory(3n);
assert.deepEqual(r3.hyperbolaPairs, [
  { x: 1n, y: 18n },
  { x: 2n, y: 9n },
  { x: 3n, y: 6n },
]);

// Direct test for verifyDivisorsComplete
verifyDivisorsComplete(18n, [1n, 2n, 3n, 6n, 9n, 18n], 6n);
assert.throws(() => verifyDivisorsComplete(18n, [1n, 2n, 4n]), IncompleteFactorizationError);

console.log('✓ Section 4: All 8 mandatory control radii & standalone hyperbola hardening (M2-AUD-02) verified.');

// ============================================================================
// 5. Cross-Check Against Reference Catalog Totals (r = 1..100) & Brute-Force Divisors (r = 1..30)
// ============================================================================
let sumT30 = 0n;
let sumN30 = 0n;
let sumT100 = 0n;
let sumN100 = 0n;

for (let rNum = 1n; rNum <= 100n; rNum += 1n) {
  const res = analyzeRadiusNumberTheory(rNum);
  assert.ok(res.counters !== null && res.divisorsOfTwoRSquared !== null);
  sumT100 += res.counters.T;
  sumN100 += res.counters.N;
  if (rNum <= 30n) {
    sumT30 += res.counters.T;
    sumN30 += res.counters.N;

    // Independent naive divisor enumeration check on 2r^2 for r <= 30
    const twoR2 = 2n * rNum * rNum;
    const naiveDivs: bigint[] = [];
    for (let d = 1n; d <= twoR2; d += 1n) {
      if (twoR2 % d === 0n) naiveDivs.push(d);
    }
    assert.deepEqual(res.divisorsOfTwoRSquared, naiveDivs);
  }
}

// From BENCHMARK_DATA_CATALOG.md §1:
// 1..30: T=61, N=174 | 1..100: T=249, N=855
assert.equal(sumT30, 61n);
assert.equal(sumN30, 174n);
assert.equal(sumT100, 249n);
assert.equal(sumN100, 855n);

// Agarwal 2020 P27 reference radius: r = 577 * 408 = 235416 -> T = 8, N = 108
const agarwal = analyzeRadiusNumberTheory(577n * 408n);
assert.ok(agarwal.counters !== null && agarwal.hyperbolaPairs !== null);
assert.equal(agarwal.counters.T, 8n);
assert.equal(agarwal.counters.N, 108n);
assert.equal(BigInt(agarwal.hyperbolaPairs.length), 108n);

console.log('✓ Section 5: Golden benchmark totals (r=1..30: 61/174; r=1..100: 249/855) & brute-force divisor check passed.');

// ============================================================================
// 6. Large BigInt Radii (> 2^53), Reproducibility, Combinatorial Guard & Invalid Inputs
// ============================================================================
// Large radius > 2^53: r = 2 * 1000000007 * 1000000009 (where 2r^2 > 10^36)
const bigRadius = 2n * 1000000007n * 1000000009n;
const run1 = analyzeRadiusNumberTheory(bigRadius);
const run2 = analyzeRadiusNumberTheory(bigRadius);

assert.deepEqual(run1, run2); // Strict reproducibility
assert.equal(run1.isFactorizationComplete, true);
assert.equal(run1.certificationStatus, 'PROVEN_COMPLETE');
assert.ok(run1.counters !== null && run1.hyperbolaPairs !== null);
assert.equal(run1.counters.omegaStar, 2n);
assert.equal(run1.counters.T, 4n); // 2^2
assert.equal(run1.counters.N, (1n + 1n) * (2n + 1n) * (2n + 1n)); // 2 * 3 * 3 = 18
assert.equal(BigInt(run1.hyperbolaPairs.length), 18n);
for (const pair of run1.hyperbolaPairs) {
  assert.equal(verifyHyperbolaIdentity(bigRadius, pair.x, pair.y), true);
}

// Combinatorial enumeration guard (returns counters, suppresses huge array explicitly)
const guardRes = analyzeRadiusNumberTheory(90n, { maxDivisorEnumerationCount: 10n });
assert.equal(guardRes.isFactorizationComplete, true);
assert.equal(guardRes.isDivisorEnumerationComplete, false);
assert.ok(guardRes.counters !== null);
assert.equal(guardRes.counters.N, 30n);
assert.equal(guardRes.divisorsOfTwoRSquared, null);
assert.equal(guardRes.hyperbolaPairs, null);
assert.ok(guardRes.warnings.some((w) => w.code === 'COMBINATORIAL_LIMIT_EXCEEDED'));

const lifted = liftRadiusFactorizationToTwoRSquared(90n, guardRes.rFactorization);
assert.throws(
  () => generateDivisorsFromFactorization(lifted.factorization, 10n),
  CombinatorialLimitError
);

// Invalid input rejection
assert.throws(() => analyzeRadiusNumberTheory(0n), InvalidRadiusError);
assert.throws(() => analyzeRadiusNumberTheory(-12n), InvalidRadiusError);
assert.throws(() => analyzeRadiusNumberTheory(6 as unknown as bigint), InvalidRadiusError);
assert.throws(() => factorizeBigInt(0n), InvalidBigIntInputError);
assert.throws(() => factorizeBigInt(-5n), InvalidBigIntInputError);
assert.throws(() => certifyPrimality(0n), InvalidBigIntInputError);
assert.throws(
  () => factorizeBigInt(15n, { trialDivisionLimit: 0n }),
  InvalidFactorizationInputError
);
assert.throws(
  () => buildHyperbolaDivisorPairs(0n, [1n, 2n]),
  InvalidRadiusError
);

console.log('✓ Section 6: >2^53 BigInt radii, strict reproducibility, combinatorial limit guard, and invalid input rejection passed.');

console.log('\n================================================================');
console.log('ALL 6 SECTIONS OF M2 NUMBER THEORY ENGINE PASSED (STABILIZED)!');
console.log('================================================================');
