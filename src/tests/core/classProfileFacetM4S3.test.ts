/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  addRational,
  createRational,
  divRational,
  eqRational,
  parseRational,
  rationalFromBigInt,
  type ExactRational,
} from '../../core/exact/index.ts';
import { classifyRadius } from '../../core/classification/index.ts';
import { analyzeRadiusNumberTheory } from '../../core/factorization/index.ts';
import {
  ClassProfileFacetError,
  buildClassProfileFacet,
  computeBerggrenFacetsForClass,
  computeSpornFacetsForClass,
  verifyClassProfileInvariants,
  type ClassProfileFacetResult,
  type ZoneHistogram,
} from '../../core/facets/index.ts';

console.log('Running M4-S3 ClassProfileFacet Test Suite...\n');

// ============================================================================
// 0. Strict Numerical Policy & Isolation Check
// ============================================================================
const facetsDir = path.resolve(process.cwd(), 'src/core/facets');
const facetFiles = fs.readdirSync(facetsDir).filter((f) => f.endsWith('.ts'));
assert.ok(facetFiles.includes('classProfileFacet.ts'), 'Expected classProfileFacet.ts in src/core/facets');

for (const file of facetFiles) {
  const raw = fs.readFileSync(path.join(facetsDir, file), 'utf8');
  const codeOnly = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseFloat\s*\(|\bparseInt\s*\(/.test(codeOnly), `Forbidden parseFloat/parseInt found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
}
console.log('✓ Section 0: Pure BigInt/ExactRational isolation & zero float64 verified.');

function buildForRadius(r: bigint): {
  profile: ClassProfileFacetResult;
  expectedN: bigint;
  expectedT: bigint;
} {
  const cls = classifyRadius(r);
  const sporn = computeSpornFacetsForClass(cls);
  const berg = computeBerggrenFacetsForClass(cls);
  const profile = buildClassProfileFacet(cls, sporn, berg);
  const expectedT = cls.subclasses.find((g) => g.k === 1n)!.expectedCount;
  return { profile, expectedN: cls.totalTriplesCount, expectedT };
}

function makeZones(z1: bigint, z3: bigint, z0: bigint, z2: bigint): ZoneHistogram {
  return { Z1_A1: z1, Z3_A3: z3, Z0_ROOT: z0, Z2_A2: z2 };
}

// ============================================================================
// 1. Six Golden Tests: r = 1, 2, 3, 15, 35, 105
// ============================================================================
interface GoldenSpec {
  readonly r: bigint;
  readonly classId: string;
  readonly N: bigint;
  readonly T: bigint;
  readonly cMin: bigint;
  readonly cMax: bigint;
  readonly cMinRatio: string;
  readonly hasSub5rCompression: boolean;
  readonly spornXMin: string;
  readonly spornXMax: string;
  readonly meanSpornXAll: string;
  readonly meanSpornXPrim: string;
  readonly meanADivCAll: string;
  readonly meanADivCPrim: string;
  readonly zonesAll: ZoneHistogram;
  readonly zonesPrim: ZoneHistogram;
  readonly depthMin: bigint;
  readonly depthMax: bigint;
}

const GOLDEN_SPECS: readonly GoldenSpec[] = [
  {
    r: 1n,
    classId: 'CL-R1-D2',
    N: 1n,
    T: 1n,
    cMin: 5n,
    cMax: 5n,
    cMinRatio: '5',
    hasSub5rCompression: false,
    spornXMin: '1',
    spornXMax: '1',
    meanSpornXAll: '1',
    meanSpornXPrim: '1',
    meanADivCAll: '3/5',
    meanADivCPrim: '3/5',
    zonesAll: makeZones(0n, 0n, 1n, 0n),
    zonesPrim: makeZones(0n, 0n, 1n, 0n),
    depthMin: 0n,
    depthMax: 0n,
  },
  {
    r: 2n,
    classId: 'CL-R2-D4',
    N: 2n,
    T: 1n,
    cMin: 10n,
    cMax: 13n,
    cMinRatio: '5',
    hasSub5rCompression: false,
    spornXMin: '1/2',
    spornXMax: '1',
    meanSpornXAll: '3/4',
    meanSpornXPrim: '1/2',
    meanADivCAll: '32/65',
    meanADivCPrim: '5/13',
    zonesAll: makeZones(1n, 0n, 1n, 0n),
    zonesPrim: makeZones(1n, 0n, 0n, 0n),
    depthMin: 1n,
    depthMax: 1n,
  },
  {
    r: 3n,
    classId: 'CL-R3-D6',
    N: 3n,
    T: 2n,
    cMin: 15n,
    cMax: 25n,
    cMinRatio: '5',
    hasSub5rCompression: false,
    spornXMin: '1/3',
    spornXMax: '1',
    meanSpornXAll: '2/3',
    meanSpornXPrim: '1/2',
    meanADivCAll: '574/1275',
    meanADivCPrim: '319/850',
    zonesAll: makeZones(1n, 1n, 1n, 0n),
    zonesPrim: makeZones(1n, 1n, 0n, 0n),
    depthMin: 1n,
    depthMax: 2n,
  },
  {
    r: 15n,
    classId: 'CL-R15-D30',
    N: 9n,
    T: 4n,
    cMin: 73n,
    cMax: 481n,
    cMinRatio: '73/15',
    hasSub5rCompression: true,
    spornXMin: '1/15',
    spornXMax: '6/5',
    meanSpornXAll: '23/45',
    meanSpornXPrim: '1/2',
    meanADivCAll: '21792641352137/62464186200975',
    meanADivCPrim: '515896423/1606279298',
    zonesAll: makeZones(5n, 2n, 1n, 1n),
    zonesPrim: makeZones(2n, 1n, 0n, 1n),
    depthMin: 2n,
    depthMax: 14n,
  },
  {
    r: 35n,
    classId: 'CL-R35-D70',
    N: 9n,
    T: 4n,
    cMin: 169n,
    cMax: 2521n,
    cMinRatio: '169/35',
    hasSub5rCompression: true,
    spornXMin: '1/35',
    spornXMax: '7/5',
    meanSpornXAll: '148/315',
    meanSpornXPrim: '11/20',
    meanADivCAll: '75169441138207358/244798835403383001',
    meanADivCPrim: '136515655797/426596046916',
    zonesAll: makeZones(6n, 1n, 1n, 1n),
    zonesPrim: makeZones(2n, 1n, 0n, 1n),
    depthMin: 2n,
    depthMax: 34n,
  },
  {
    r: 105n,
    classId: 'CL-R105-D210',
    N: 27n,
    T: 8n,
    cMin: 507n,
    cMax: 22261n,
    cMinRatio: '169/35',
    hasSub5rCompression: true,
    spornXMin: '1/105',
    spornXMax: '7/5',
    meanSpornXAll: '43/105',
    meanSpornXPrim: '3/10',
    meanADivCAll: '156678477023299640106959393325933387935457425858429089/555116655859249727514723976361520793756626844474666575',
    meanADivCPrim: '7563546069064214797476147/33770302289589208116867106',
    zonesAll: makeZones(19n, 5n, 1n, 2n),
    zonesPrim: makeZones(7n, 1n, 0n, 0n),
    depthMin: 5n,
    depthMax: 104n,
  },
];

for (const g of GOLDEN_SPECS) {
  const { profile, expectedN, expectedT } = buildForRadius(g.r);
  verifyClassProfileInvariants(profile, { expectedN, expectedT });

  assert.equal(profile.r, g.r);
  assert.equal(profile.classId, g.classId);
  assert.equal(profile.allTriples.count, g.N);
  assert.equal(profile.primitiveTriples.count, g.T);
  assert.equal(profile.cMin, g.cMin);
  assert.equal(profile.cMax, g.cMax);
  assert.ok(eqRational(profile.cMinRatio, parseRational(g.cMinRatio)));
  assert.equal(profile.hasSub5rCompression, g.hasSub5rCompression);
  assert.ok(eqRational(profile.spornXMin, parseRational(g.spornXMin)));
  assert.ok(eqRational(profile.spornXMax, parseRational(g.spornXMax)));
  assert.ok(eqRational(profile.allTriples.meanSpornX, parseRational(g.meanSpornXAll)));
  assert.ok(eqRational(profile.primitiveTriples.meanSpornX, parseRational(g.meanSpornXPrim)));
  assert.ok(eqRational(profile.allTriples.meanADivC, parseRational(g.meanADivCAll)));
  assert.ok(eqRational(profile.primitiveTriples.meanADivC, parseRational(g.meanADivCPrim)));
  assert.deepEqual(profile.allTriples.zoneHistogram, g.zonesAll);
  assert.deepEqual(profile.primitiveTriples.zoneHistogram, g.zonesPrim);
  assert.equal(profile.primitiveTriples.berggrenDepthMin, g.depthMin);
  assert.equal(profile.primitiveTriples.berggrenDepthMax, g.depthMax);

  // Verify immutability
  assert.ok(Object.isFrozen(profile));
  assert.ok(Object.isFrozen(profile.allTriples));
  assert.ok(Object.isFrozen(profile.allTriples.zoneHistogram));
  assert.ok(Object.isFrozen(profile.primitiveTriples));
  assert.ok(Object.isFrozen(profile.primitiveTriples.zoneHistogram));
}
console.log('✓ Section 1: All 6 Golden Tests (r = 1, 2, 3, 15, 35, 105) & immutability passed.');

// ============================================================================
// 2. Direct Verification of All 12 Invariants (CPF-INV-01..12)
// ============================================================================
const { profile: base15, expectedN: n15, expectedT: t15 } = buildForRadius(15n);

const invMutations: Array<{ name: string; mutated: ClassProfileFacetResult; counts?: { expectedN: bigint; expectedT: bigint } }> = [
  {
    name: 'CPF-INV-01 (N mismatch)',
    mutated: base15,
    counts: { expectedN: n15 + 1n, expectedT: t15 },
  },
  {
    name: 'CPF-INV-01 (T mismatch)',
    mutated: base15,
    counts: { expectedN: n15, expectedT: t15 + 1n },
  },
  {
    name: 'CPF-INV-02 (cMin > 5r)',
    mutated: { ...base15, cMin: 5n * base15.r + 1n },
  },
  {
    name: 'CPF-INV-03 (cMax mismatch)',
    mutated: { ...base15, cMax: base15.cMax + 1n },
  },
  {
    name: 'CPF-INV-04 (hasSub5rCompression mismatch)',
    mutated: { ...base15, hasSub5rCompression: false },
  },
  {
    name: 'CPF-INV-05 (allTriples zone sum mismatch)',
    mutated: {
      ...base15,
      allTriples: {
        ...base15.allTriples,
        zoneHistogram: { ...base15.allTriples.zoneHistogram, Z1_A1: base15.allTriples.zoneHistogram.Z1_A1 + 1n },
      },
    },
  },
  {
    name: 'CPF-INV-06 (primitiveTriples zone sum mismatch)',
    mutated: {
      ...base15,
      primitiveTriples: {
        ...base15.primitiveTriples,
        zoneHistogram: { ...base15.primitiveTriples.zoneHistogram, Z1_A1: base15.primitiveTriples.zoneHistogram.Z1_A1 + 1n },
      },
    },
  },
  {
    name: 'CPF-INV-07 (allTriples Z0_ROOT !== 1)',
    mutated: {
      ...base15,
      allTriples: {
        ...base15.allTriples,
        zoneHistogram: makeZones(6n, 2n, 0n, 1n),
      },
    },
  },
  {
    name: 'CPF-INV-08 (primitive Z0_ROOT !== 0 for r > 1)',
    mutated: {
      ...base15,
      primitiveTriples: {
        ...base15.primitiveTriples,
        zoneHistogram: makeZones(1n, 1n, 1n, 1n),
      },
    },
  },
  {
    name: 'CPF-INV-09 (spornXMin mismatch)',
    mutated: { ...base15, spornXMin: createRational(2n, 15n) },
  },
  {
    name: 'CPF-INV-10 (all zone < prim zone)',
    mutated: {
      ...base15,
      allTriples: {
        ...base15.allTriples,
        zoneHistogram: makeZones(1n, 6n, 1n, 1n),
      },
    },
  },
  {
    name: 'CPF-INV-11 (berggrenDepthMax > r - 1)',
    mutated: {
      ...base15,
      primitiveTriples: {
        ...base15.primitiveTriples,
        berggrenDepthMax: 15n,
      },
    },
  },
  {
    name: 'CPF-INV-12 (meanSpornX > spornXMax)',
    mutated: {
      ...base15,
      allTriples: {
        ...base15.allTriples,
        meanSpornX: createRational(7n, 5n),
      },
    },
  },
  {
    name: 'CPF-INV-12 (meanADivC >= 1)',
    mutated: {
      ...base15,
      primitiveTriples: {
        ...base15.primitiveTriples,
        meanADivC: createRational(1n, 1n),
      },
    },
  },
];

for (const item of invMutations) {
  assert.throws(
    () => verifyClassProfileInvariants(item.mutated, item.counts ?? { expectedN: n15, expectedT: t15 }),
    (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'INVARIANT_VIOLATION',
    `Expected INVARIANT_VIOLATION for ${item.name}`
  );
}
console.log('✓ Section 2: All 12 invariant violation checks (CPF-INV-01..12) passed.');

// ============================================================================
// 3. Negative Tests (P-NEG-1..4, ID/Class/Radius/PrimitiveSet guards)
// ============================================================================
const cls15 = classifyRadius(15n);
const sporn15 = computeSpornFacetsForClass(cls15);
const berg15 = computeBerggrenFacetsForClass(cls15);

const cls3 = classifyRadius(3n);
const sporn3 = computeSpornFacetsForClass(cls3);
const berg3 = computeBerggrenFacetsForClass(cls3);

// P-NEG-1: isComplete === false or status !== 'COMPLETE' -> INCOMPLETE_CLASSIFICATION_RESULT
assert.throws(
  () => buildClassProfileFacet({ ...cls15, isComplete: false }, sporn15, berg15),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'INCOMPLETE_CLASSIFICATION_RESULT'
);
assert.throws(
  () => buildClassProfileFacet({ ...cls15, status: 'COMBINATORIAL_LIMIT_EXCEEDED' } as any, sporn15, berg15),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'INCOMPLETE_CLASSIFICATION_RESULT'
);

// P-NEG-2: Facet array length mismatch -> FACET_COUNT_MISMATCH
assert.throws(
  () => buildClassProfileFacet(cls15, sporn15.slice(0, sporn15.length - 1), berg15),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'FACET_COUNT_MISMATCH'
);
assert.throws(
  () => buildClassProfileFacet(cls15, sporn15, berg15.slice(0, berg15.length - 1)),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'FACET_COUNT_MISMATCH'
);

// P-NEG-3a: Duplicate tripleId -> DUPLICATE_TRIPLE_ID
assert.throws(
  () =>
    buildClassProfileFacet(
      cls15,
      [sporn15[0], { ...sporn15[1], tripleId: sporn15[0].tripleId }, ...sporn15.slice(2)],
      berg15
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'DUPLICATE_TRIPLE_ID'
);
assert.throws(
  () =>
    buildClassProfileFacet(
      cls15,
      sporn15,
      [berg15[0], { ...berg15[1], tripleId: berg15[0].tripleId }, ...berg15.slice(2)]
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'DUPLICATE_TRIPLE_ID'
);

// P-NEG-3b: Substituted/missing tripleId within same class -> TRIPLE_ID_MISMATCH
assert.throws(
  () =>
    buildClassProfileFacet(
      cls15,
      [{ ...sporn15[0], tripleId: 'PT-R15-K1-X999999' }, ...sporn15.slice(1)],
      berg15
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'TRIPLE_ID_MISMATCH'
);
assert.throws(
  () =>
    buildClassProfileFacet(
      cls15,
      sporn15,
      [{ ...berg15[0], tripleId: 'PT-R15-K1-X999999' }, ...berg15.slice(1)]
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'TRIPLE_ID_MISMATCH'
);

// P-NEG-4: Cross-class / radius contamination -> CLASS_ID_MISMATCH
assert.throws(
  () =>
    buildClassProfileFacet(
      cls15,
      [sporn3[0], ...sporn15.slice(1)],
      berg15
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'CLASS_ID_MISMATCH'
);
assert.throws(
  () =>
    buildClassProfileFacet(
      cls15,
      sporn15,
      [berg3[0], ...berg15.slice(1)]
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'CLASS_ID_MISMATCH'
);

// Invalid radius r <= 0 -> INVALID_RADIUS
assert.throws(
  () => buildClassProfileFacet({ ...cls15, r: 0n }, sporn15, berg15),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'INVALID_RADIUS'
);

// Empty primitive population -> PRIMITIVE_SET_EMPTY
const scaledOnlyCls = {
  ...cls15,
  totalTriplesCount: 1n,
  expectedTotalCount: 1n,
  allTriples: [cls15.allTriples.find((t) => !t.isPrimitive)!],
};
const scaledTripleId = scaledOnlyCls.allTriples[0].tripleId;
assert.throws(
  () =>
    buildClassProfileFacet(
      scaledOnlyCls,
      [sporn15.find((s) => s.tripleId === scaledTripleId)!],
      [berg15.find((b) => b.tripleId === scaledTripleId)!]
    ),
  (err: unknown) => err instanceof ClassProfileFacetError && err.code === 'PRIMITIVE_SET_EMPTY'
);

console.log('✓ Section 3: Negative tests (P-NEG-1..4, ID/class/radius/empty-primitive guards) passed.');

// ============================================================================
// 4. Large-Class Balanced Pairwise Summation Check (N(r) > 50)
// ============================================================================
// r = 420 has 420 = 2^2 * 3 * 5 * 7 -> N(420) = (2+1)*(2+1)*(2+1)*(2+1) = 81 > 50, T(420) = 8
const cls420 = classifyRadius(420n);
const sporn420 = computeSpornFacetsForClass(cls420);
const berg420 = computeBerggrenFacetsForClass(cls420);
assert.ok(cls420.totalTriplesCount > 50n, `Expected N(420) > 50, got ${cls420.totalTriplesCount.toString()}`);

const profile420 = buildClassProfileFacet(cls420, sporn420, berg420);
const expectedT420 = cls420.subclasses.find((g) => g.k === 1n)!.expectedCount;
verifyClassProfileInvariants(profile420, {
  expectedN: cls420.totalTriplesCount,
  expectedT: expectedT420,
});

// Independently verify balanced pairwise exact mean against sequential rational summation
let seqSumX = createRational(0n, 1n);
let seqSumA = createRational(0n, 1n);
for (const s of sporn420) {
  seqSumX = addRational(seqSumX, s.spornX);
  seqSumA = addRational(seqSumA, s.sinA);
}
const expectedMeanX420: ExactRational = divRational(seqSumX, rationalFromBigInt(cls420.totalTriplesCount));
const expectedMeanA420: ExactRational = divRational(seqSumA, rationalFromBigInt(cls420.totalTriplesCount));
assert.ok(eqRational(profile420.allTriples.meanSpornX, expectedMeanX420));
assert.ok(eqRational(profile420.allTriples.meanADivC, expectedMeanA420));
assert.equal(profile420.allTriples.count, 81n);
assert.equal(profile420.primitiveTriples.count, 8n);

console.log('✓ Section 4: Large-class balanced summation test (r = 420, N = 81 > 50) passed.');

// ============================================================================
// 5. Full Population Sweep across r = 1..120 (120 Classes, 1098 Triples, 311 Primitive)
// ============================================================================
let totalTriples120 = 0n;
let totalPrim120 = 0n;
const classCountByOmega = new Map<bigint, bigint>([
  [0n, 0n],
  [1n, 0n],
  [2n, 0n],
  [3n, 0n],
]);
const sub5rCountByOmega = new Map<bigint, bigint>([
  [0n, 0n],
  [1n, 0n],
  [2n, 0n],
  [3n, 0n],
]);

for (let r = 1n; r <= 120n; r += 1n) {
  const { profile, expectedN, expectedT } = buildForRadius(r);
  verifyClassProfileInvariants(profile, { expectedN, expectedT });

  totalTriples120 += profile.allTriples.count;
  totalPrim120 += profile.primitiveTriples.count;

  const m2 = analyzeRadiusNumberTheory(r);
  const omegaStar = m2.counters!.omegaStar;
  classCountByOmega.set(omegaStar, (classCountByOmega.get(omegaStar) ?? 0n) + 1n);
  if (profile.hasSub5rCompression) {
    sub5rCountByOmega.set(omegaStar, (sub5rCountByOmega.get(omegaStar) ?? 0n) + 1n);
  }
}

assert.equal(totalTriples120, 1098n);
assert.equal(totalPrim120, 311n);
assert.equal(classCountByOmega.get(0n), 7n);
assert.equal(classCountByOmega.get(1n), 76n);
assert.equal(classCountByOmega.get(2n), 36n);
assert.equal(classCountByOmega.get(3n), 1n);
assert.equal(sub5rCountByOmega.get(0n), 0n);
assert.equal(sub5rCountByOmega.get(1n), 19n);
assert.equal(sub5rCountByOmega.get(2n), 21n);
assert.equal(sub5rCountByOmega.get(3n), 1n);

console.log('✓ Section 5: Full range sweep r = 1..120 passed (120 classes, 1098 triples, 311 primitive, omega* aggregates matched).');

console.log('\n================================================================');
console.log('ALL TESTS FOR M4-S3 CLASSPROFILEFACET PASSED SUCCESSFULLY!');
console.log('================================================================');
