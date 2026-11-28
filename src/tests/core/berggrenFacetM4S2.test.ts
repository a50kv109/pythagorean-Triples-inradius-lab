/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  RATIONAL_ONE,
  addRational,
  createRational,
  divRational,
  eqRational,
  gcdBigInt,
  mulRational,
} from '../../core/exact/index.ts';
import { classifyRadius } from '../../core/classification/index.ts';
import {
  BERGGREN_ROOT_TRIPLE,
  IncompleteClassificationError,
  InvalidBerggrenInputError,
  RootHasNoParentError,
  applyCanonWord,
  applyRawWord,
  canonWordToRawWord,
  computeBerggrenFacetForTriple,
  computeBerggrenFacetsForClass,
  rawWordToCanonWord,
  requireBerggrenParent,
  stepA1,
  stepA2,
  stepA3,
  stepParent,
  verifyBerggrenFacetInvariants,
  type BerggrenOperator,
} from '../../core/facets/index.ts';

console.log('Running M4-S2 BerggrenFacet Test Suite...\n');

// ============================================================================
// 0. Strict Numerical Policy & Isolation Check
// ============================================================================
const facetsDir = path.resolve(process.cwd(), 'src/core/facets');
const facetFiles = fs.readdirSync(facetsDir).filter((f) => f.endsWith('.ts'));
assert.ok(facetFiles.includes('berggrenFacet.ts'), 'Expected berggrenFacet.ts in src/core/facets');

for (const file of facetFiles) {
  const raw = fs.readFileSync(path.join(facetsDir, file), 'utf8');
  const codeOnly = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseFloat\s*\(|\bparseInt\s*\(/.test(codeOnly), `Forbidden parseFloat/parseInt found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
}
console.log('✓ Section 0: Pure BigInt/ExactRational isolation & zero float64 verified.');

// ============================================================================
// 1. Root Test: (3, 4, 5)
// ============================================================================
const cls1 = classifyRadius(1n);
const facets1 = computeBerggrenFacetsForClass(cls1);
assert.equal(facets1.length, 1);
const rootFacet = facets1[0];

assert.equal(rootFacet.tripleId, 'PT-R1-K1-X1');
assert.equal(rootFacet.classId, 'CL-R1-D2');
assert.equal(rootFacet.primId, 'PT-R1-K1-X1');
assert.equal(rootFacet.isPrimitive, true);
assert.equal(rootFacet.appliesToPrimitiveAncestor, false);
assert.equal(rootFacet.isRoot, true);
assert.equal(rootFacet.treeDepth, 0n);
assert.deepEqual(rootFacet.canonWord, []);
assert.deepEqual(rootFacet.rawWord, []);
assert.equal(rootFacet.parentOperator, null);
assert.equal(rootFacet.parentId, null);

// Direct children of (3, 4, 5)
const { A1: rootA1, A2: rootA2, A3: rootA3 } = rootFacet.children;
assert.deepEqual(rootA1.rawTriple, { a: 5n, b: 12n, c: 13n });
assert.deepEqual(rootA1.canonTriple, { a: 5n, b: 12n, c: 13n, r: 2n, x: 1n, y: 8n });
assert.equal(rootA1.legSwapped, false);
assert.equal(rootA1.spornZone, 'Z1_A1');
assert.ok(eqRational(rootA1.spornX, createRational(1n, 2n)));

assert.deepEqual(rootA2.rawTriple, { a: 21n, b: 20n, c: 29n });
assert.deepEqual(rootA2.canonTriple, { a: 20n, b: 21n, c: 29n, r: 6n, x: 8n, y: 9n });
assert.equal(rootA2.legSwapped, true);
assert.equal(rootA2.spornZone, 'Z2_A2');
assert.ok(eqRational(rootA2.spornX, createRational(4n, 3n)));

assert.deepEqual(rootA3.rawTriple, { a: 15n, b: 8n, c: 17n });
assert.deepEqual(rootA3.canonTriple, { a: 8n, b: 15n, c: 17n, r: 3n, x: 2n, y: 9n });
assert.equal(rootA3.legSwapped, true);
assert.equal(rootA3.spornZone, 'Z3_A3');
assert.ok(eqRational(rootA3.spornX, createRational(2n, 3n)));

// Immutability check
assert.ok(Object.isFrozen(rootFacet));
assert.ok(Object.isFrozen(rootFacet.canonWord));
assert.ok(Object.isFrozen(rootFacet.children));

console.log('✓ Section 1: Root (3, 4, 5), direct children, and immutability passed.');

// ============================================================================
// 2 & 3. Exact A1, A2, A3 Transformations, Canonical Ordering & legSwapped
// ============================================================================
// Verify 12 explicit transitions: 9 level-2 and 3 level-3 transitions (level-1 parents: (5, 12, 13), (20, 21, 29), (8, 15, 17); level-2 parent: (7, 24, 25) = A1(A1(root)))
const s51213 = rootA1.canonTriple; // A1(root) = (5, 12, 13), r=2, x=1, y=8
const c51213_A1 = stepA1(s51213);
const c51213_A2 = stepA2(s51213);
const c51213_A3 = stepA3(s51213);

assert.deepEqual(c51213_A1.canonTriple, { a: 7n, b: 24n, c: 25n, r: 3n, x: 1n, y: 18n });
assert.equal(c51213_A1.legSwapped, false);
assert.deepEqual(c51213_A2.rawTriple, { a: 55n, b: 48n, c: 73n });
assert.deepEqual(c51213_A2.canonTriple, { a: 48n, b: 55n, c: 73n, r: 15n, x: 18n, y: 25n });
assert.equal(c51213_A2.legSwapped, true);
assert.deepEqual(c51213_A3.rawTriple, { a: 45n, b: 28n, c: 53n });
assert.deepEqual(c51213_A3.canonTriple, { a: 28n, b: 45n, c: 53n, r: 10n, x: 8n, y: 25n });
assert.equal(c51213_A3.legSwapped, true);

const s202129 = rootA2.canonTriple; // A2(root) = (20, 21, 29), r=6, x=8, y=9
const c202129_A1 = stepA1(s202129);
const c202129_A2 = stepA2(s202129);
const c202129_A3 = stepA3(s202129);

assert.deepEqual(c202129_A1.rawTriple, { a: 36n, b: 77n, c: 85n });
assert.deepEqual(c202129_A1.canonTriple, { a: 36n, b: 77n, c: 85n, r: 14n, x: 8n, y: 49n });
assert.equal(c202129_A1.legSwapped, false);
assert.equal(c202129_A1.spornZone, 'Z1_A1');
assert.ok(eqRational(c202129_A1.spornX, createRational(4n, 7n)));

assert.deepEqual(c202129_A2.rawTriple, { a: 120n, b: 119n, c: 169n });
assert.deepEqual(c202129_A2.canonTriple, { a: 119n, b: 120n, c: 169n, r: 35n, x: 49n, y: 50n });
assert.equal(c202129_A2.legSwapped, true);
assert.equal(c202129_A2.spornZone, 'Z2_A2');
assert.ok(eqRational(c202129_A2.spornX, createRational(7n, 5n)));

assert.deepEqual(c202129_A3.rawTriple, { a: 80n, b: 39n, c: 89n });
assert.deepEqual(c202129_A3.canonTriple, { a: 39n, b: 80n, c: 89n, r: 15n, x: 9n, y: 50n });
assert.equal(c202129_A3.legSwapped, true);
assert.equal(c202129_A3.spornZone, 'Z3_A3');
assert.ok(eqRational(c202129_A3.spornX, createRational(3n, 5n)));

const s81517 = rootA3.canonTriple; // A3(root) = (8, 15, 17), r=3, x=2, y=9
const c81517_A1 = stepA1(s81517);
const c81517_A2 = stepA2(s81517);
const c81517_A3 = stepA3(s81517);

assert.deepEqual(c81517_A1.canonTriple, { a: 12n, b: 35n, c: 37n, r: 5n, x: 2n, y: 25n });
assert.equal(c81517_A1.legSwapped, false);
assert.deepEqual(c81517_A2.rawTriple, { a: 72n, b: 65n, c: 97n });
assert.deepEqual(c81517_A2.canonTriple, { a: 65n, b: 72n, c: 97n, r: 20n, x: 25n, y: 32n });
assert.equal(c81517_A2.legSwapped, true);
assert.deepEqual(c81517_A3.rawTriple, { a: 56n, b: 33n, c: 65n });
assert.deepEqual(c81517_A3.canonTriple, { a: 33n, b: 56n, c: 65n, r: 12n, x: 9n, y: 32n });
assert.equal(c81517_A3.legSwapped, true);

const s72425 = c51213_A1.canonTriple; // (7, 24, 25), r=3, x=1, y=18
const c72425_A1 = stepA1(s72425);
const c72425_A2 = stepA2(s72425);
const c72425_A3 = stepA3(s72425);

assert.deepEqual(c72425_A1.canonTriple, { a: 9n, b: 40n, c: 41n, r: 4n, x: 1n, y: 32n });
assert.equal(c72425_A1.legSwapped, false);
assert.deepEqual(c72425_A2.rawTriple, { a: 105n, b: 88n, c: 137n });
assert.deepEqual(c72425_A2.canonTriple, { a: 88n, b: 105n, c: 137n, r: 28n, x: 32n, y: 49n });
assert.equal(c72425_A2.legSwapped, true);
assert.deepEqual(c72425_A3.rawTriple, { a: 91n, b: 60n, c: 109n });
assert.deepEqual(c72425_A3.canonTriple, { a: 60n, b: 91n, c: 109n, r: 21n, x: 18n, y: 49n });
assert.equal(c72425_A3.legSwapped, true);

// Exact rational fractional-linear transformations f1, f2, f3 check on (8, 15, 17) where t = 2/3
const t815 = createRational(2n, 3n);
const rTwo = createRational(2n, 1n);
assert.ok(eqRational(c81517_A1.spornX, divRational(t815, addRational(RATIONAL_ONE, t815))));
assert.ok(
  eqRational(
    c81517_A2.spornX,
    divRational(mulRational(rTwo, addRational(t815, RATIONAL_ONE)), addRational(t815, rTwo))
  )
);
assert.ok(eqRational(c81517_A3.spornX, divRational(rTwo, addRational(t815, rTwo))));

// Exact rational fractional-linear transformations f1, f2, f3 check on A2(root) = (20, 21, 29) where t = 8/6 = 4/3
const t2021 = createRational(8n, 6n);
assert.ok(eqRational(t2021, createRational(4n, 3n)));
const f1_2021 = divRational(t2021, addRational(RATIONAL_ONE, t2021));
const f2_2021 = divRational(
  mulRational(rTwo, addRational(t2021, RATIONAL_ONE)),
  addRational(t2021, rTwo)
);
const f3_2021 = divRational(rTwo, addRational(t2021, rTwo));
assert.ok(eqRational(f1_2021, createRational(4n, 7n)));
assert.ok(eqRational(f2_2021, createRational(7n, 5n)));
assert.ok(eqRational(f3_2021, createRational(3n, 5n)));
assert.ok(eqRational(c202129_A1.spornX, f1_2021));
assert.ok(eqRational(c202129_A2.spornX, f2_2021));
assert.ok(eqRational(c202129_A3.spornX, f3_2021));

console.log('✓ Sections 2 & 3: Exact A1/A2/A3 transitions (12 checks incl. A2(root)), f1/f2/f3 ratios, and legSwapped passed.');

// ============================================================================
// 4 & 5. Parent Descent, Reconstruction & Two Address Systems (canonWord / rawWord)
// ============================================================================
assert.deepEqual(stepParent(BERGGREN_ROOT_TRIPLE), {
  parentOperator: null,
  parentTriple: null,
  parentId: null,
});
assert.throws(() => requireBerggrenParent(BERGGREN_ROOT_TRIPLE), RootHasNoParentError);

const p72425 = stepParent(s72425);
assert.equal(p72425.parentOperator, 'A1');
assert.deepEqual(p72425.parentTriple, s51213);
assert.equal(p72425.parentId, 'PT-R2-K1-X1');

const cls3 = classifyRadius(3n);
const facets3 = computeBerggrenFacetsForClass(cls3);
const f72425 = facets3.find((f) => f.tripleId === 'PT-R3-K1-X1')!;
const f81517 = facets3.find((f) => f.tripleId === 'PT-R3-K1-X2')!;
assert.deepEqual(f72425.canonWord, ['A1', 'A1']);
assert.deepEqual(f72425.rawWord, ['A1', 'A1']);
assert.equal(f72425.treeDepth, 2n);
assert.equal(f72425.parentOperator, 'A1');
assert.equal(f72425.parentId, 'PT-R2-K1-X1');

assert.deepEqual(f81517.canonWord, ['A3']);
assert.deepEqual(f81517.rawWord, ['A3']);
assert.equal(f81517.treeDepth, 1n);
assert.equal(f81517.parentOperator, 'A3');
assert.equal(f81517.parentId, 'PT-R1-K1-X1');

// Parity conjugation example: (33, 56, 65) at r=12 -> canonWord = ['A3', 'A3'], rawWord = ['A3', 'A1']
const cls12 = classifyRadius(12n);
const f335665 = computeBerggrenFacetsForClass(cls12).find((f) => f.tripleId === 'PT-R12-K1-X9')!;
assert.deepEqual(f335665.canonWord, ['A3', 'A3']);
assert.deepEqual(f335665.rawWord, ['A3', 'A1']);
assert.deepEqual(canonWordToRawWord(['A3', 'A3']), ['A3', 'A1']);
assert.deepEqual(rawWordToCanonWord(['A3', 'A1']), ['A3', 'A3']);
assert.deepEqual(applyRawWord(['A3', 'A1']).rawTriple, { a: 33n, b: 56n, c: 65n });
assert.equal(applyRawWord(['A3', 'A1']).legSwapped, false);

// Mixed parity path test: ['A3', 'A2', 'A1', 'A3']
const mixedCanon: BerggrenOperator[] = ['A3', 'A2', 'A1', 'A3'];
const mixedRaw = canonWordToRawWord(mixedCanon);
// Step 0 (p=0): A3 -> A3, p=1
// Step 1 (p=1): A2 -> A2 (invariant), p=0
// Step 2 (p=0): A1 -> A1, p=0
// Step 3 (p=0): A3 -> A3, p=1
assert.deepEqual(mixedRaw, ['A3', 'A2', 'A1', 'A3']);
assert.deepEqual(rawWordToCanonWord(mixedRaw), mixedCanon);
assert.deepEqual(applyCanonWord(mixedCanon), applyRawWord(mixedRaw).canonTriple);

const mixedCanon2: BerggrenOperator[] = ['A2', 'A1', 'A3', 'A2'];
const mixedRaw2 = canonWordToRawWord(mixedCanon2);
// Step 0 (p=0): A2 -> A2, p=1
// Step 1 (p=1): A1 -> A3, p=1
// Step 2 (p=1): A3 -> A1, p=0
// Step 3 (p=0): A2 -> A2, p=1
assert.deepEqual(mixedRaw2, ['A2', 'A3', 'A1', 'A2']);
assert.deepEqual(rawWordToCanonWord(mixedRaw2), mixedCanon2);
assert.deepEqual(applyCanonWord(mixedCanon2), applyRawWord(mixedRaw2).canonTriple);

console.log('✓ Sections 4 & 5: Parent descent, root error, canonWord <-> rawWord conversions passed.');

// ============================================================================
// 6 & 7. Scaled-Triple Inheritance & Reference Depth Boundaries
// ============================================================================
// Reference depth ranges: r=1: [0,0], r=2: [1,1], r=3: [1,2]
const primDepths = (r: bigint) => {
  const prims = computeBerggrenFacetsForClass(classifyRadius(r)).filter((f) => f.isPrimitive);
  const ds = prims.map((f) => f.treeDepth).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return [ds[0], ds[ds.length - 1]];
};
assert.deepEqual(primDepths(1n), [0n, 0n]);
assert.deepEqual(primDepths(2n), [1n, 1n]);
assert.deepEqual(primDepths(3n), [1n, 2n]);

// Scaled triple (6, 8, 10) in C(2) -> k=2, primitiveAncestor = (3, 4, 5)
const cls2 = classifyRadius(2n);
const facets2 = computeBerggrenFacetsForClass(cls2);
const f6810 = facets2.find((f) => f.tripleId === 'PT-R2-K2-X2')!;
assert.equal(f6810.isPrimitive, false);
assert.equal(f6810.appliesToPrimitiveAncestor, true);
assert.equal(f6810.primId, 'PT-R1-K1-X1');
assert.deepEqual(f6810.primitiveAncestor, BERGGREN_ROOT_TRIPLE);
assert.equal(f6810.isRoot, true);
assert.equal(f6810.treeDepth, 0n);

// Scaled triple (16, 30, 34) in C(6) -> k=2, primitiveAncestor = (8, 15, 17)
const cls6 = classifyRadius(6n);
const facets6 = computeBerggrenFacetsForClass(cls6);
const f163034 = facets6.find((f) => f.tripleId === 'PT-R6-K2-X4')!;
assert.equal(f163034.isPrimitive, false);
assert.equal(f163034.appliesToPrimitiveAncestor, true);
assert.equal(f163034.primId, 'PT-R3-K1-X2');
assert.deepEqual(f163034.primitiveAncestor, s81517);
assert.deepEqual(f163034.canonWord, ['A3']);
assert.equal(f163034.treeDepth, 1n);

// Depth boundary for x0 = 1 series across r0 = 1..15: treeDepth === r0 - 1n
for (let r0 = 1n; r0 <= 15n; r0 += 1n) {
  const cls = classifyRadius(r0);
  const fBoundary = computeBerggrenFacetsForClass(cls).find((f) => f.tripleId === `PT-R${r0}-K1-X1`)!;
  assert.equal(fBoundary.treeDepth, r0 - 1n);
  assert.equal(fBoundary.canonWord.every((op) => op === 'A1'), true);
}

console.log('✓ Sections 6 & 7: Scaled-triple inheritance, reference depths, and x=1 depth boundary passed.');

// ============================================================================
// 8. Negative Tests (Invalid Triples & Incomplete Classifications)
// ============================================================================
assert.throws(
  () => stepA1({ a: 6n, b: 8n, c: 10n, r: 2n, x: 2n, y: 4n }),
  (err: unknown) => err instanceof InvalidBerggrenInputError && err.code === 'NON_PRIMITIVE_TRIPLE'
);
assert.throws(
  () => stepA2({ a: 4n, b: 3n, c: 5n, r: 1n, x: 2n, y: 1n }),
  (err: unknown) => err instanceof InvalidBerggrenInputError && err.code === 'NON_CANONICAL_ORDER'
);
assert.throws(
  () => stepA3({ a: 3n, b: 4n, c: 6n, r: 1n, x: 1n, y: 2n }),
  (err: unknown) => err instanceof InvalidBerggrenInputError && err.code === 'INVALID_TRIPLE_DIMENSIONS'
);

// Incomplete classification result checks
const incompleteCls = {
  r: 5n,
  totalTriplesCount: 0n,
  expectedTotalCount: 3n,
  isComplete: false,
  subclasses: [],
  allTriples: [],
  warnings: [],
};
assert.throws(
  () => computeBerggrenFacetsForClass(incompleteCls as any),
  IncompleteClassificationError
);

const badStatusCls = {
  ...cls3,
  status: 'COMBINATORIAL_LIMIT_EXCEEDED',
};
assert.throws(
  () => computeBerggrenFacetsForClass(badStatusCls as any),
  IncompleteClassificationError
);

// Malformed M3 triple
const badM3Triple: any = {
  ...cls3.allTriples[0],
  y: 99n,
};
assert.throws(
  () => computeBerggrenFacetForTriple(badM3Triple),
  InvalidBerggrenInputError
);

console.log('✓ Section 8: Negative tests for invalid triples and incomplete classifications passed.');

// ============================================================================
// 9. Full Population Test across r = 1..30 (174 Triples, 61 Primitive)
// ============================================================================
let totalTriples30 = 0n;
let primitiveTriples30 = 0n;
for (let rVal = 1n; rVal <= 30n; rVal += 1n) {
  const cls = classifyRadius(rVal);
  const facets = computeBerggrenFacetsForClass(cls);
  assert.equal(BigInt(facets.length), cls.totalTriplesCount);
  for (const facet of facets) {
    verifyBerggrenFacetInvariants(facet);
    totalTriples30 += 1n;
    if (facet.isPrimitive) {
      primitiveTriples30 += 1n;
    }
  }
}
assert.equal(totalTriples30, 174n);
assert.equal(primitiveTriples30, 61n);

console.log('✓ Section 9: Population test across r = 1..30 passed (174 total triples, 61 primitive, all BF-INV-01..06 verified).');

// ============================================================================
// 10. Exhaustive Primitive-Tree Uniqueness & Reconstruction Test (Finite Bound: r = 1..50)
// ============================================================================
const MAX_ENUM_RADIUS = 50n;
const seenPrimIds = new Set<string>();
const seenCanonWords = new Set<string>();
const seenRawWords = new Set<string>();
let totalPrimitives50 = 0n;

for (let rVal = 1n; rVal <= MAX_ENUM_RADIUS; rVal += 1n) {
  const cls = classifyRadius(rVal);
  const facets = computeBerggrenFacetsForClass(cls);
  for (const facet of facets) {
    if (!facet.isPrimitive) continue;
    totalPrimitives50 += 1n;

    const canonKey = facet.canonWord.join(',');
    const rawKey = facet.rawWord.join(',');

    assert.equal(seenPrimIds.has(facet.primId), false, `Duplicate primId ${facet.primId}`);
    assert.equal(seenCanonWords.has(canonKey), false, `Duplicate canonWord ${canonKey}`);
    assert.equal(seenRawWords.has(rawKey), false, `Duplicate rawWord ${rawKey}`);

    seenPrimIds.add(facet.primId);
    seenCanonWords.add(canonKey);
    seenRawWords.add(rawKey);

    assert.deepEqual(applyCanonWord(facet.canonWord), facet.primitiveAncestor);
    assert.deepEqual(applyRawWord(facet.rawWord).canonTriple, facet.primitiveAncestor);
    assert.equal(gcdBigInt(gcdBigInt(facet.primitiveAncestor.a, facet.primitiveAncestor.b), facet.primitiveAncestor.c), 1n);
  }
}

console.log(
  `✓ Section 10: Exhaustive primitive-tree uniqueness & reconstruction passed for finite bound r = 1..${MAX_ENUM_RADIUS.toString()} (${totalPrimitives50.toString()} unique primitive triples).`
);

console.log('\n================================================================');
console.log('ALL TESTS FOR M4-S2 BERGGRENFACET PASSED SUCCESSFULLY!');
console.log('================================================================');
