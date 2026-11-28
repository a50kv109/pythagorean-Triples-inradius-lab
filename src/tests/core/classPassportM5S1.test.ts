/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  analyzeRadiusNumberTheory,
  type RadiusNumberTheoryResult,
} from '../../core/factorization/index.ts';
import {
  classifyRadius,
  type RadiusClassificationResult,
} from '../../core/classification/index.ts';
import {
  buildClassProfileFacet,
  computeBerggrenFacetsForClass,
  computeSpornFacetsForClass,
} from '../../core/facets/index.ts';
import {
  buildClassPassport,
  verifyClassPassportInvariants,
} from '../../core/passports/classPassport.ts';
import { resolveEuclideanParameters } from '../../core/passports/euclidAdapter.ts';
import {
  EuclidAdapterError,
  InvalidRadiusError,
  MissingProfileError,
  PassportInvariantError,
  PassportMismatchError,
} from '../../core/passports/errors.ts';
import type {
  ClassPassportResult,
  ClassifiedTripleInput,
} from '../../core/passports/types.ts';

console.log('Running M5-S1 ClassPassport & euclidAdapter Test Suite...\n');

// ============================================================================
// 0. Strict Numerical Policy & Module Isolation Check
// ============================================================================
const passportsDir = path.resolve(process.cwd(), 'src/core/passports');
const passportFiles = fs.readdirSync(passportsDir).filter((f) => f.endsWith('.ts'));

for (const requiredFile of ['classPassport.ts', 'errors.ts', 'euclidAdapter.ts', 'types.ts']) {
  assert.ok(
    passportFiles.includes(requiredFile),
    `Expected M5-S1 file ${requiredFile} in src/core/passports`
  );
}

for (const file of passportFiles) {
  const raw = fs.readFileSync(path.join(passportsDir, file), 'utf8');
  const codeOnly = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseFloat\s*\(|\bparseInt\s*\(/.test(codeOnly), `Forbidden parseFloat/parseInt found in ${file}`);
  assert.ok(!/\bFloat64/.test(codeOnly), `Forbidden Float64 usage found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
  assert.ok(!/rangeCatalog/i.test(codeOnly), `Unexpected M5-S3 rangeCatalog reference in ${file}`);
  if (file === 'classPassport.ts' || file === 'euclidAdapter.ts') {
    assert.ok(!/classMatrix/i.test(codeOnly), `M5-S1 module ${file} must not depend on M5-S2 classMatrix`);
  }
}
console.log('✓ Section 0: Pure BigInt isolation & M5-S1 file boundary verified.');

function buildPipelineForRadius(r: bigint): {
  numberTheory: RadiusNumberTheoryResult;
  classification: RadiusClassificationResult;
  passport: ClassPassportResult;
} {
  const numberTheory = analyzeRadiusNumberTheory(r);
  const classification = classifyRadius(r);
  const sporn = computeSpornFacetsForClass(classification);
  const berggren = computeBerggrenFacetsForClass(classification);
  const profile = buildClassProfileFacet(classification, sporn, berggren);
  const passport = buildClassPassport({ numberTheory, classification, profile });
  return { numberTheory, classification, passport };
}

// ============================================================================
// 1. Golden Tests: r = 1, 2, 3, 6, 35, 105
// ============================================================================
interface GoldenPassportSpec {
  readonly r: bigint;
  readonly classId: string;
  readonly D: bigint;
  readonly twoRSquared: bigint;
  readonly twoExponent: bigint;
  readonly oddPrimes: readonly bigint[];
  readonly omegaStar: bigint;
  readonly tauR: bigint;
  readonly tauTwoRSquared: bigint;
  readonly T: bigint;
  readonly N: bigint;
  readonly subclassKs: readonly bigint[];
  readonly firstTripleId: string;
  readonly lastTripleId: string;
}

const GOLDEN_SPECS: readonly GoldenPassportSpec[] = [
  {
    r: 1n,
    classId: 'CL-R1-D2',
    D: 2n,
    twoRSquared: 2n,
    twoExponent: 0n,
    oddPrimes: [],
    omegaStar: 0n,
    tauR: 1n,
    tauTwoRSquared: 2n,
    T: 1n,
    N: 1n,
    subclassKs: [1n],
    firstTripleId: 'PT-R1-K1-X1',
    lastTripleId: 'PT-R1-K1-X1',
  },
  {
    r: 2n,
    classId: 'CL-R2-D4',
    D: 4n,
    twoRSquared: 8n,
    twoExponent: 1n,
    oddPrimes: [],
    omegaStar: 0n,
    tauR: 2n,
    tauTwoRSquared: 4n,
    T: 1n,
    N: 2n,
    subclassKs: [1n, 2n],
    firstTripleId: 'PT-R2-K1-X1',
    lastTripleId: 'PT-R2-K2-X2',
  },
  {
    r: 3n,
    classId: 'CL-R3-D6',
    D: 6n,
    twoRSquared: 18n,
    twoExponent: 0n,
    oddPrimes: [3n],
    omegaStar: 1n,
    tauR: 2n,
    tauTwoRSquared: 6n,
    T: 2n,
    N: 3n,
    subclassKs: [1n, 3n],
    firstTripleId: 'PT-R3-K1-X1',
    lastTripleId: 'PT-R3-K3-X3',
  },
  {
    r: 6n,
    classId: 'CL-R6-D12',
    D: 12n,
    twoRSquared: 72n,
    twoExponent: 1n,
    oddPrimes: [3n],
    omegaStar: 1n,
    tauR: 4n,
    tauTwoRSquared: 12n,
    T: 2n,
    N: 6n,
    subclassKs: [1n, 2n, 3n, 6n],
    firstTripleId: 'PT-R6-K1-X1',
    lastTripleId: 'PT-R6-K1-X8',
  },
  {
    r: 35n,
    classId: 'CL-R35-D70',
    D: 70n,
    twoRSquared: 2450n,
    twoExponent: 0n,
    oddPrimes: [5n, 7n],
    omegaStar: 2n,
    tauR: 4n,
    tauTwoRSquared: 18n,
    T: 4n,
    N: 9n,
    subclassKs: [1n, 5n, 7n, 35n],
    firstTripleId: 'PT-R35-K1-X1',
    lastTripleId: 'PT-R35-K1-X49',
  },
  {
    r: 105n,
    classId: 'CL-R105-D210',
    D: 210n,
    twoRSquared: 22050n,
    twoExponent: 0n,
    oddPrimes: [3n, 5n, 7n],
    omegaStar: 3n,
    tauR: 8n,
    tauTwoRSquared: 54n,
    T: 8n,
    N: 27n,
    subclassKs: [1n, 3n, 5n, 7n, 15n, 21n, 35n, 105n],
    firstTripleId: 'PT-R105-K1-X1',
    lastTripleId: 'PT-R105-K3-X147',
  },
];

for (const spec of GOLDEN_SPECS) {
  const { passport } = buildPipelineForRadius(spec.r);
  verifyClassPassportInvariants(passport);

  assert.equal(passport.specVersion, '0.1');
  assert.equal(passport.classId, spec.classId);
  assert.equal(passport.r, spec.r);
  assert.equal(passport.D, spec.D);
  assert.equal(passport.twoRSquared, spec.twoRSquared);
  assert.equal(passport.status, 'COMPLETE');
  assert.equal(passport.isComplete, true);
  assert.equal(passport.certificationStatus, 'PROVEN_COMPLETE');
  assert.equal(passport.isDivisorEnumerationComplete, true);

  assert.equal(passport.numberTheory.twoExponent, spec.twoExponent);
  assert.deepEqual(
    passport.numberTheory.oddPrimeFactors.map((f) => f.prime),
    spec.oddPrimes
  );
  assert.equal(passport.numberTheory.omegaStar, spec.omegaStar);
  assert.equal(passport.numberTheory.tauR, spec.tauR);
  assert.equal(passport.numberTheory.tauTwoRSquared, spec.tauTwoRSquared);
  assert.equal(passport.numberTheory.T, spec.T);
  assert.equal(passport.numberTheory.N, spec.N);
  assert.ok(passport.numberTheory.divisorsOfR !== null);
  assert.deepEqual(
    passport.subclassSpectrum.map((s) => s.k),
    spec.subclassKs
  );

  assert.ok(passport.profile !== null);
  assert.equal(passport.profile.classId, spec.classId);
  assert.equal(passport.profile.allTriples.count, spec.N);
  assert.equal(passport.profile.primitiveTriples.count, spec.T);

  assert.deepEqual(passport.expectedMatrixSummary, {
    rowCount: spec.N,
    isSortedByX: true,
    firstTripleId: spec.firstTripleId,
    lastTripleId: spec.lastTripleId,
  });

  // Immutability check
  assert.ok(Object.isFrozen(passport));
  assert.ok(Object.isFrozen(passport.numberTheory));
  assert.ok(Object.isFrozen(passport.subclassSpectrum));
  assert.ok(Object.isFrozen(passport.expectedMatrixSummary));
  assert.ok(Object.isFrozen(passport.warnings));
}
console.log('✓ Section 1: All 6 Golden Passports (r = 1, 2, 3, 6, 35, 105) & immutability passed.');

// ============================================================================
// 2. euclidAdapter Tests (Direct M3 Read + Omitted Fallback + Mismatch Guard)
// ============================================================================
const cls15 = classifyRadius(15n);
for (const triple of cls15.allTriples) {
  assert.ok(triple.euclideanParams !== undefined);
  const resolved = resolveEuclideanParameters(triple);
  assert.deepEqual(resolved, triple.euclideanParams);
  assert.ok(Object.isFrozen(resolved));
  assert.equal(resolved.u * resolved.v, triple.r / triple.k);
  assert.equal(resolved.n, resolved.u);
  assert.equal(resolved.m, resolved.u + resolved.v);
}

// Verify fallback recovery when optional euclideanParams is omitted
const sampleTriple = cls15.allTriples[0]; // (31, 480, 481) -> x=1, y=450, k=1, u=15, v=1, m=16, n=15
const withoutParams: ClassifiedTripleInput = {
  tripleId: sampleTriple.tripleId,
  r: sampleTriple.r,
  k: sampleTriple.k,
  x: sampleTriple.x,
  y: sampleTriple.y,
  primitiveAncestor: sampleTriple.primitiveAncestor,
};
const fallbackResolved = resolveEuclideanParameters(withoutParams);
assert.deepEqual(fallbackResolved, { m: 16n, n: 15n, u: 15n, v: 1n });

// Verify corrupted euclideanParams is rejected
assert.throws(
  () =>
    resolveEuclideanParameters({
      ...sampleTriple,
      euclideanParams: { m: 5n, n: 2n, u: 2n, v: 3n },
    }),
  (err: unknown) => err instanceof EuclidAdapterError && err.code === 'EUCLID_ADAPTER_ERROR'
);

// Verify formally admissible (uv=15, gcd(8,3)=1, opposite parity) but wrong-triple params are rejected
assert.equal(sampleTriple.x, 1n);
assert.equal(sampleTriple.y, 450n);
assert.throws(
  () =>
    resolveEuclideanParameters({
      ...sampleTriple,
      euclideanParams: { m: 8n, n: 3n, u: 3n, v: 5n },
    }),
  (err: unknown) => err instanceof EuclidAdapterError && err.code === 'EUCLID_ADAPTER_ERROR'
);

// Verify primitiveAncestor mismatch is rejected
assert.throws(
  () =>
    resolveEuclideanParameters({
      ...sampleTriple,
      primitiveAncestor: { ...sampleTriple.primitiveAncestor, x: 999n },
    }),
  (err: unknown) => err instanceof EuclidAdapterError && err.code === 'EUCLID_ADAPTER_ERROR'
);

console.log('✓ Section 2: euclidAdapter direct M3 read, fallback recovery, and validation guards passed.');

// ============================================================================
// 3. PROBABLE_COMPLETE Certification with Complete Computation (CP-INV-08)
// ============================================================================
const ntProbable = analyzeRadiusNumberTheory(101n, {
  trialDivisionLimit: 2n,
  trialDivisionProofMaxN: 100n, // 101n > 97n small-prime bracket and > 100n proof max
  deterministicMillerRabinMax: 100n, // Forces probabilistic Miller-Rabin for 101n
  probablePrimeRounds: 10n,
});
assert.equal(ntProbable.certificationStatus, 'PROBABLE_COMPLETE');
assert.equal(ntProbable.isFactorizationComplete, true);
assert.equal(ntProbable.isDivisorEnumerationComplete, true);

const clsProbable = classifyRadius(101n);
const profProbable = buildClassProfileFacet(
  clsProbable,
  computeSpornFacetsForClass(clsProbable),
  computeBerggrenFacetsForClass(clsProbable)
);
const probablePassport = buildClassPassport({
  numberTheory: ntProbable,
  classification: clsProbable,
  profile: profProbable,
});
verifyClassPassportInvariants(probablePassport);
assert.equal(probablePassport.status, 'COMPLETE');
assert.equal(probablePassport.isComplete, true);
assert.equal(probablePassport.certificationStatus, 'PROBABLE_COMPLETE');
assert.ok(probablePassport.warnings.some((w) => w.includes('PROBABLE_PRIME_USED')));
assert.equal(probablePassport.expectedMatrixSummary.rowCount, 3n);
assert.ok(probablePassport.profile !== null);

console.log('✓ Section 3: PROBABLE_COMPLETE computational completeness & warning preservation (CP-INV-08) passed.');

// ============================================================================
// 4. Incomplete M2 / M3 Preservation & CP-INV-07 Tests
// ============================================================================
// 4a. M2 divisor enumeration limit exceeded (counters known, divisors/pairs null)
const ntDivLimit = analyzeRadiusNumberTheory(30n, {
  maxDivisorEnumerationCount: 3n,
});
assert.equal(ntDivLimit.isFactorizationComplete, true);
assert.equal(ntDivLimit.isDivisorEnumerationComplete, false);
assert.ok(ntDivLimit.counters !== null);
assert.equal(ntDivLimit.divisorsOfR, null);

const incompleteCls: RadiusClassificationResult = {
  r: 30n,
  totalTriplesCount: 0n,
  expectedTotalCount: 0n,
  isComplete: false,
  subclasses: [],
  allTriples: [],
  warnings: ['[COMBINATORIAL_LIMIT_EXCEEDED] mocked incomplete classification'],
};

const incompleteDivPassport = buildClassPassport({
  numberTheory: ntDivLimit,
  classification: incompleteCls,
  profile: null,
});
verifyClassPassportInvariants(incompleteDivPassport);
assert.equal(incompleteDivPassport.status, 'INCOMPLETE');
assert.equal(incompleteDivPassport.isComplete, false);
assert.equal(incompleteDivPassport.isDivisorEnumerationComplete, false);
assert.equal(incompleteDivPassport.profile, null);
assert.deepEqual(incompleteDivPassport.subclassSpectrum, []);
assert.deepEqual(incompleteDivPassport.expectedMatrixSummary, {
  rowCount: null,
  isSortedByX: false,
  firstTripleId: null,
  lastTripleId: null,
});
// Partial M2 data must be preserved
assert.equal(incompleteDivPassport.numberTheory.twoExponent, 1n);
assert.deepEqual(
  incompleteDivPassport.numberTheory.oddPrimeFactors.map((f) => f.prime),
  [3n, 5n]
);
assert.equal(incompleteDivPassport.numberTheory.N, 18n);
assert.equal(incompleteDivPassport.numberTheory.T, 4n);
assert.equal(incompleteDivPassport.numberTheory.divisorsOfR, null);
assert.ok(
  incompleteDivPassport.warnings.some((w) => w.includes('COMBINATORIAL_LIMIT_EXCEEDED'))
);

// 4b. M2 incomplete factorization (counters === null, partial prime factors retained, mandatory execution)
const ntFactorIncomplete = analyzeRadiusNumberTheory(2n * 1000003n * 1000033n, {
  trialDivisionLimit: 10n,
  maxPollardIterations: 1n,
  maxDurationMs: 1000n,
});
assert.equal(ntFactorIncomplete.isFactorizationComplete, false);
assert.equal(ntFactorIncomplete.certificationStatus, 'INCOMPLETE');

const incompleteFactCls: RadiusClassificationResult = {
  r: ntFactorIncomplete.radius,
  totalTriplesCount: 0n,
  expectedTotalCount: 0n,
  isComplete: false,
  subclasses: [],
  allTriples: [],
  warnings: [],
};
const partialPassport = buildClassPassport({
  numberTheory: ntFactorIncomplete,
  classification: incompleteFactCls,
});
verifyClassPassportInvariants(partialPassport);
assert.equal(partialPassport.status, 'INCOMPLETE');
assert.equal(partialPassport.certificationStatus, 'INCOMPLETE');
assert.equal(partialPassport.numberTheory.twoExponent, 1n);
assert.equal(partialPassport.numberTheory.N, null);
assert.equal(partialPassport.expectedMatrixSummary.rowCount, null);

console.log('✓ Section 4: Incomplete M2/M3 preservation (rowCount=null, partial M2 retained) passed.');

// ============================================================================
// 5. Negative Guard Tests & Invariant Violation Mutations (CP-INV-01..08)
// ============================================================================
const { numberTheory: nt6, classification: cls6, passport: p6 } = buildPipelineForRadius(6n);

// Invalid radius
assert.throws(
  () =>
    buildClassPassport({
      numberTheory: { ...nt6, radius: 0n },
      classification: { ...cls6, r: 0n },
    }),
  (err: unknown) => err instanceof InvalidRadiusError && err.code === 'INVALID_RADIUS'
);

// Radius mismatch between M2 and M3
assert.throws(
  () =>
    buildClassPassport({
      numberTheory: nt6,
      classification: classifyRadius(3n),
    }),
  (err: unknown) => err instanceof PassportMismatchError && err.code === 'PASSPORT_MISMATCH'
);

// Cross-class profile mismatch
const cls3 = classifyRadius(3n);
const prof3 = buildClassProfileFacet(
  cls3,
  computeSpornFacetsForClass(cls3),
  computeBerggrenFacetsForClass(cls3)
);
assert.throws(
  () =>
    buildClassPassport({
      numberTheory: nt6,
      classification: cls6,
      profile: prof3,
    }),
  (err: unknown) => err instanceof PassportMismatchError && err.code === 'PASSPORT_MISMATCH'
);

// Missing profile when M2 and M3 are complete
assert.throws(
  () =>
    buildClassPassport({
      numberTheory: nt6,
      classification: cls6,
    }),
  (err: unknown) => err instanceof MissingProfileError && err.code === 'MISSING_PROFILE'
);

// M3 vs M2 count mismatch
assert.throws(
  () =>
    buildClassPassport({
      numberTheory: nt6,
      classification: { ...cls6, totalTriplesCount: 5n, expectedTotalCount: 5n, allTriples: cls6.allTriples.slice(0, 5) },
      profile: p6.profile,
    }),
  (err: unknown) => err instanceof PassportMismatchError && err.code === 'PASSPORT_MISMATCH'
);

// Direct invariant mutation checks (CP-INV-01..08)
assert.throws(
  () => verifyClassPassportInvariants({ ...p6, D: 10n }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-01')
);
assert.throws(
  () => verifyClassPassportInvariants({ ...p6, isComplete: false }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-02')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...p6,
      numberTheory: { ...p6.numberTheory, N: 999n },
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-03')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...p6,
      subclassSpectrum: [...p6.subclassSpectrum].reverse(),
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-04')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...p6,
      profile: {
        ...p6.profile!,
        allTriples: { ...p6.profile!.allTriples, count: 99n },
      },
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-05')
);
// Unsorted allTriples in COMPLETE classification must be rejected
assert.throws(
  () =>
    buildClassPassport({
      numberTheory: nt6,
      classification: {
        ...cls6,
        allTriples: [...cls6.allTriples].reverse(),
      },
      profile: p6.profile,
    }),
  (err: unknown) => err instanceof PassportMismatchError && err.code === 'PASSPORT_MISMATCH'
);

assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...p6,
      expectedMatrixSummary: { ...p6.expectedMatrixSummary, rowCount: 99n },
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-06')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...p6,
      expectedMatrixSummary: { ...p6.expectedMatrixSummary, isSortedByX: false },
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-06')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...incompleteDivPassport,
      expectedMatrixSummary: { ...incompleteDivPassport.expectedMatrixSummary, rowCount: 0n },
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-07')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...incompleteDivPassport,
      expectedMatrixSummary: {
        ...incompleteDivPassport.expectedMatrixSummary,
        isSortedByX: undefined as unknown as boolean,
      },
    }),
  (err: unknown) =>
    err instanceof PassportInvariantError &&
    err.code === 'INVARIANT_VIOLATION' &&
    err.message.includes('CP-INV-07')
);
assert.throws(
  () =>
    verifyClassPassportInvariants({
      ...probablePassport,
      isComplete: false,
      status: 'INCOMPLETE',
    }),
  (err: unknown) => err instanceof PassportInvariantError && err.message.includes('CP-INV-07')
);

console.log('✓ Section 5: Negative guard tests & CP-INV-01..08 mutation checks passed.');

// ============================================================================
// 6. Systematic Range Check r = 1..30
// ============================================================================
let totalN = 0n;
let totalT = 0n;
for (let r = 1n; r <= 30n; r += 1n) {
  const { passport } = buildPipelineForRadius(r);
  verifyClassPassportInvariants(passport);
  assert.equal(passport.status, 'COMPLETE');
  assert.equal(passport.expectedMatrixSummary.isSortedByX, true);
  totalN += passport.numberTheory.N!;
  totalT += passport.numberTheory.T!;
}
assert.equal(totalN, 174n);
assert.equal(totalT, 61n);

console.log('✓ Section 6: Range r = 1..30 verified (30 complete passports, 174 triples, 61 primitive).');
console.log('\n================================================================');
console.log('ALL TESTS FOR M5-S1 CLASSPASSPORT & EUCLID ADAPTER PASSED!');
console.log('================================================================');
