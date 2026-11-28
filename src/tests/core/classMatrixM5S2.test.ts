/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRational, eqRational } from '../../core/exact/index.ts';
import { analyzeRadiusNumberTheory } from '../../core/factorization/index.ts';
import {
  classifyRadius,
  type RadiusClassificationResult,
} from '../../core/classification/index.ts';
import {
  buildClassProfileFacet,
  computeBerggrenFacetsForClass,
  computeSpornFacetsForClass,
} from '../../core/facets/index.ts';
import { buildClassPassport } from '../../core/passports/classPassport.ts';
import {
  ALL_MATRIX_COLUMN_GROUPS,
  ClassMatrixError,
  IncompleteClassificationError,
  MatrixInvariantError,
  buildFullClassMatrix,
  createLazyClassMatrix,
  findFullMatrixRowByX,
  getFullMatrixRowByIndex,
  verifyClassMatrixInvariants,
  verifyFullLazyMatrixParity,
  verifyPassportMatrixAlignment,
} from '../../core/passports/classMatrix.ts';
import type { FullClassMatrixResult } from '../../core/passports/types.ts';

console.log('Running M5-S2 ClassMatrix Test Suite...\n');

// ============================================================================
// 0. Strict Numerical Policy & Module Isolation Check
// ============================================================================
const passportsDir = path.resolve(process.cwd(), 'src/core/passports');
const passportFiles = fs.readdirSync(passportsDir).filter((f) => f.endsWith('.ts'));
assert.ok(passportFiles.includes('classMatrix.ts'), 'Expected classMatrix.ts in src/core/passports');

for (const file of passportFiles) {
  const raw = fs.readFileSync(path.join(passportsDir, file), 'utf8');
  const codeOnly = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseFloat\s*\(|\bparseInt\s*\(/.test(codeOnly), `Forbidden parseFloat/parseInt found in ${file}`);
  assert.ok(!/\bFloat64/.test(codeOnly), `Forbidden Float64 usage found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
  assert.ok(!/rangeCatalog/i.test(codeOnly), `Unexpected M5-S3 rangeCatalog reference in ${file}`);
  assert.ok(!/\bcommonLegPrimA\b|\bcommonHypPrimC\b/.test(codeOnly), `Unexpected deferred TRANSVERSAL field in ${file}`);
}
console.log('✓ Section 0: Pure BigInt isolation & zero float64 verified for M5-S2.');

// ============================================================================
// 1. Golden Tests: r = 1, 2, 3, 6, 15, 30, 35, 105, 420 & Passport Alignment
// ============================================================================
const GOLDEN_RADII = [
  { r: 1n, rowCount: 1n, firstTripleId: 'PT-R1-K1-X1', lastTripleId: 'PT-R1-K1-X1' },
  { r: 2n, rowCount: 2n, firstTripleId: 'PT-R2-K1-X1', lastTripleId: 'PT-R2-K2-X2' },
  { r: 3n, rowCount: 3n, firstTripleId: 'PT-R3-K1-X1', lastTripleId: 'PT-R3-K3-X3' },
  { r: 6n, rowCount: 6n, firstTripleId: 'PT-R6-K1-X1', lastTripleId: 'PT-R6-K1-X8' },
  { r: 15n, rowCount: 9n, firstTripleId: 'PT-R15-K1-X1', lastTripleId: 'PT-R15-K1-X18' },
  { r: 30n, rowCount: 18n, firstTripleId: 'PT-R30-K1-X1', lastTripleId: 'PT-R30-K5-X40' },
  { r: 35n, rowCount: 9n, firstTripleId: 'PT-R35-K1-X1', lastTripleId: 'PT-R35-K1-X49' },
  { r: 105n, rowCount: 27n, firstTripleId: 'PT-R105-K1-X1', lastTripleId: 'PT-R105-K3-X147' },
  { r: 420n, rowCount: 81n, firstTripleId: 'PT-R420-K1-X1', lastTripleId: 'PT-R420-K12-X588' },
] as const;

for (const spec of GOLDEN_RADII) {
  const numberTheory = analyzeRadiusNumberTheory(spec.r);
  const classification = classifyRadius(spec.r);
  const sporn = computeSpornFacetsForClass(classification);
  const berggren = computeBerggrenFacetsForClass(classification);
  const profile = buildClassProfileFacet(classification, sporn, berggren);
  const passport = buildClassPassport({ numberTheory, classification, profile });

  const matrix = buildFullClassMatrix(classification);
  const lazy = createLazyClassMatrix(classification);
  verifyClassMatrixInvariants(matrix, lazy);
  verifyPassportMatrixAlignment(passport, matrix);
  verifyPassportMatrixAlignment(passport, lazy);

  assert.equal(matrix.r, spec.r);
  assert.equal(matrix.D, 2n * spec.r);
  assert.equal(matrix.classId, `CL-R${spec.r.toString()}-D${(2n * spec.r).toString()}`);
  assert.equal(matrix.rowCount, spec.rowCount);
  assert.equal(matrix.isSortedByX, true);
  assert.equal(matrix.firstTripleId, spec.firstTripleId);
  assert.equal(matrix.lastTripleId, spec.lastTripleId);

  // Joint M5-S1 <-> M5-S2 summary parity
  assert.equal(matrix.rowCount, passport.expectedMatrixSummary.rowCount);
  assert.equal(matrix.isSortedByX, passport.expectedMatrixSummary.isSortedByX);
  assert.equal(matrix.firstTripleId, passport.expectedMatrixSummary.firstTripleId);
  assert.equal(matrix.lastTripleId, passport.expectedMatrixSummary.lastTripleId);
}

// Detailed row checks on r = 6 (contains scaled triples and all three Berggren operators)
const r6Matrix = buildFullClassMatrix(classifyRadius(6n));
const r6Row0 = getFullMatrixRowByIndex(r6Matrix, 0n);
assert.ok(r6Row0 !== null);
assert.equal(r6Row0.tripleId, 'PT-R6-K1-X1');
assert.equal(r6Row0.a, 13n);
assert.equal(r6Row0.b, 84n);
assert.equal(r6Row0.c, 85n);
assert.equal(r6Row0.arith.gcdSides, 1n);
assert.equal(r6Row0.arith.aEven, false);
assert.equal(r6Row0.arith.div3Leg, true); // 84 % 3 === 0
assert.equal(r6Row0.arith.div4Leg, true); // 84 % 4 === 0
assert.equal(r6Row0.arith.div5Side, true); // 85 % 5 === 0
assert.equal(r6Row0.euclid.euclidU, 6n);
assert.equal(r6Row0.euclid.euclidV, 1n);
assert.equal(r6Row0.euclid.euclidM, 7n);
assert.equal(r6Row0.euclid.euclidN, 6n);
assert.equal(r6Row0.geom.D, 12n);
assert.equal(r6Row0.geom.areaS, 546n);
assert.equal(r6Row0.geom.semiPerimeter, 91n); // c + r = 85 + 6 = 91
assert.equal(r6Row0.geom.perimeter, 182n);
assert.ok(eqRational(r6Row0.geom.aDivC, createRational(13n, 85n)));
assert.ok(eqRational(r6Row0.geom.bDivC, createRational(84n, 85n)));
assert.equal(r6Row0.berggren.appliesToPrimitiveAncestor, false);
assert.equal(r6Row0.berggren.treeDepth, 5n);
assert.equal(r6Row0.berggren.parentOperator, 'A1');
assert.equal(r6Row0.berggren.treeLegSwapped, false);

// PT-R6-K6-X6: (18, 24, 30), primitive ancestor (3, 4, 5)
const r6ScaledRoot = findFullMatrixRowByX(r6Matrix, 6n);
assert.ok(r6ScaledRoot !== null);
assert.equal(r6ScaledRoot.tripleId, 'PT-R6-K6-X6');
assert.equal(r6ScaledRoot.primId, 'PT-R1-K1-X1');
assert.equal(r6ScaledRoot.isPrimitive, false);
assert.equal(r6ScaledRoot.arith.gcdSides, 6n);
assert.equal(r6ScaledRoot.berggren.appliesToPrimitiveAncestor, true);
assert.equal(r6ScaledRoot.berggren.treeDepth, 0n);
assert.equal(r6ScaledRoot.berggren.parentOperator, null);
assert.equal(r6ScaledRoot.berggren.treeLegSwapped, false);

// PT-R6-K1-X8: (20, 21, 29) = A2(root) -> treeLegSwapped === true
const r6A2Row = findFullMatrixRowByX(r6Matrix, 8n);
assert.ok(r6A2Row !== null);
assert.equal(r6A2Row.tripleId, 'PT-R6-K1-X8');
assert.equal(r6A2Row.a, 20n);
assert.equal(r6A2Row.b, 21n);
assert.equal(r6A2Row.c, 29n);
assert.equal(r6A2Row.berggren.parentOperator, 'A2');
assert.equal(r6A2Row.berggren.treeLegSwapped, true);

// r = 3: PT-R3-K1-X2 -> (8, 15, 17) = A3(root) -> treeLegSwapped === true
const r3Matrix = buildFullClassMatrix(classifyRadius(3n));
const r3A3Row = findFullMatrixRowByX(r3Matrix, 2n);
assert.ok(r3A3Row !== null);
assert.equal(r3A3Row.a, 8n);
assert.equal(r3A3Row.b, 15n);
assert.equal(r3A3Row.c, 17n);
assert.equal(r3A3Row.berggren.parentOperator, 'A3');
assert.equal(r3A3Row.berggren.treeLegSwapped, true);

// r = 420 sampled checks (verify rowIdx, asymQ parity, Euclid correspondence)
const r420Matrix = buildFullClassMatrix(classifyRadius(420n));
const r420First = getFullMatrixRowByIndex(r420Matrix, 0n);
const r420Last = getFullMatrixRowByIndex(r420Matrix, 80n);
assert.ok(r420First !== null && r420Last !== null);
assert.equal(r420First.tripleId, 'PT-R420-K1-X1');
assert.equal(r420Last.tripleId, 'PT-R420-K12-X588');
assert.equal(r420Last.k, 12n);
assert.ok(
  eqRational(
    r420Last.sporn.asymQ,
    createRational(r420Last.b - r420Last.a, r420Last.a + r420Last.b)
  )
);
console.log('✓ Section 1: All 9 Golden matrices (r = 1, 2, 3, 6, 15, 30, 35, 105, 420) & Passport alignment passed.');

// ============================================================================
// 2. Lazy Materialization, Cache Identity, GEOM/SPORN Reuse & Full === Lazy
// ============================================================================
const c15 = classifyRadius(15n);
const full15 = buildFullClassMatrix(c15);
const lazy15 = createLazyClassMatrix(c15);

assert.equal(lazy15.mode, 'LAZY');
assert.equal(lazy15.rowCount, 9n);
assert.deepEqual(lazy15.getMaterializedGroups(), []);
for (const g of ALL_MATRIX_COLUMN_GROUPS) {
  assert.equal(lazy15.hasGroup(g), false);
}

// Before materialization, getRow returns CORE only
const coreOnlyRow = lazy15.getRow(0n);
assert.equal(coreOnlyRow.tripleId, 'PT-R15-K1-X1');
assert.equal(coreOnlyRow.arith, undefined);
assert.equal(coreOnlyRow.euclid, undefined);
assert.equal(coreOnlyRow.geom, undefined);
assert.equal(coreOnlyRow.sporn, undefined);
assert.equal(coreOnlyRow.berggren, undefined);

// Materialize GEOM first; repeated call returns exact same cached reference
const geomPass1 = lazy15.materializeGroup('GEOM');
const geomPass2 = lazy15.materializeGroup('GEOM');
assert.strictEqual(geomPass1, geomPass2);
assert.equal(Object.isFrozen(geomPass1), true);
assert.deepEqual(lazy15.getMaterializedGroups(), ['GEOM']);
assert.equal(lazy15.hasGroup('GEOM'), true);
assert.equal(lazy15.hasGroup('SPORN'), false);

// Lookup helpers on LazyClassMatrix
const byTriple = lazy15.findRowByTripleId('PT-R15-K3-X3');
assert.ok(byTriple !== null);
assert.equal(byTriple.k, 3n);
assert.ok(byTriple.geom !== undefined);
assert.equal(byTriple.sporn, undefined);

const byX = lazy15.findRowByX(18n, ['SPORN', 'BERGGREN']);
assert.ok(byX !== null);
assert.equal(byX.tripleId, 'PT-R15-K1-X18');
assert.ok(byX.sporn !== undefined);
assert.ok(byX.berggren !== undefined);
assert.equal(lazy15.hasGroup('SPORN'), true);
assert.equal(lazy15.hasGroup('BERGGREN'), true);
assert.equal(lazy15.findRowByTripleId('PT-R15-K1-X999'), null);
assert.equal(lazy15.findRowByX(999n), null);

// Materializing SPORN before GEOM reuses cached SpornFacetResult (sinA/cosA refs) without recomputing
const sporn15Custom = computeSpornFacetsForClass(c15);
const lazySpornFirst = createLazyClassMatrix(c15, { spornFacets: sporn15Custom });
const spornCols = lazySpornFirst.materializeGroup('SPORN');
const geomColsReused = lazySpornFirst.materializeGroup('GEOM');
assert.strictEqual(spornCols, lazySpornFirst.materializeGroup('SPORN'));
assert.strictEqual(geomColsReused, lazySpornFirst.materializeGroup('GEOM'));
for (let i = 0; i < sporn15Custom.length; i += 1) {
  // Both aDivC and bDivC point directly to sporn15Custom[i].sinA / cosA exact rational objects
  assert.strictEqual(geomColsReused[i].aDivC, sporn15Custom[i].sinA);
  assert.strictEqual(geomColsReused[i].bDivC, sporn15Custom[i].cosA);
}

// Verify GEOM after SPORN (when options.spornFacets NOT passed) does not trigger redundant SpornFacet computation
{
  const spornBefore = createLazyClassMatrix(c15);
  spornBefore.materializeGroup('SPORN');
  const geomAfter = spornBefore.materializeGroup('GEOM');
  const spornAfter = spornBefore.materializeGroup('SPORN');
  assert.equal(geomAfter.length, spornAfter.length);
  for (let i = 0; i < geomAfter.length; i += 1) {
    assert.ok(eqRational(geomAfter[i].aDivC, createRational(spornBefore.coreRows[i].a, spornBefore.coreRows[i].c)));
    assert.ok(eqRational(geomAfter[i].bDivC, createRational(spornBefore.coreRows[i].b, spornBefore.coreRows[i].c)));
  }
  verifyFullLazyMatrixParity(full15, spornBefore);
}

// Different materialization orders produce bitwise identical FullClassMatrixResult
const lazyOrderReverse = createLazyClassMatrix(c15);
const groupedSlice = lazyOrderReverse.materializeGroups(['BERGGREN', 'SPORN']);
assert.ok(groupedSlice.BERGGREN !== undefined);
assert.ok(groupedSlice.SPORN !== undefined);
lazyOrderReverse.materializeGroup('GEOM');
lazyOrderReverse.materializeGroup('EUCLID');
lazyOrderReverse.materializeGroup('ARITH');

const fullFromLazyA = lazy15.toFullMatrix();
const fullFromLazyB = lazyOrderReverse.toFullMatrix();
assert.deepEqual(fullFromLazyA, full15);
assert.deepEqual(fullFromLazyB, full15);
verifyClassMatrixInvariants(full15, lazy15);
verifyClassMatrixInvariants(full15, lazyOrderReverse);

// Shuffled optional facet cache reuse
const sporn15Shuffled = [...computeSpornFacetsForClass(c15)].reverse();
const berggren15Shuffled = [...computeBerggrenFacetsForClass(c15)].reverse();
const fullFromCachedFacets = buildFullClassMatrix(c15, {
  spornFacets: sporn15Shuffled,
  berggrenFacets: berggren15Shuffled,
});
assert.deepEqual(fullFromCachedFacets, full15);

// B5 Policy: Unsorted allTriples is normalized deterministically on a shallow copy without mutating source
const unsortedInputTriples = [...c15.allTriples].reverse();
const originalOrderSnapshot = unsortedInputTriples.map((t) => t.tripleId);
const unsortedClassification: RadiusClassificationResult = {
  ...c15,
  allTriples: unsortedInputTriples,
};
const normalizedFromUnsorted = buildFullClassMatrix(unsortedClassification);
const lazyNormalizedFromUnsorted = createLazyClassMatrix(unsortedClassification, {
  spornFacets: sporn15Shuffled,
  berggrenFacets: berggren15Shuffled,
});
assert.deepEqual(
  unsortedInputTriples.map((t) => t.tripleId),
  originalOrderSnapshot,
  'Source classification.allTriples array must NOT be mutated by ClassMatrix'
);
assert.deepEqual(normalizedFromUnsorted, full15);
assert.deepEqual(lazyNormalizedFromUnsorted.toFullMatrix(), full15);
verifyClassMatrixInvariants(normalizedFromUnsorted, lazyNormalizedFromUnsorted);

console.log('✓ Section 2: Lazy caching, O(1) cache identity, GEOM/SPORN reuse, copy-sort & Full === Lazy parity verified.');

// ============================================================================
// 3. CM-INV-01..08 Mutation Tests
// ============================================================================
function cloneMatrixForMutation(base: FullClassMatrixResult): any {
  return {
    ...base,
    rows: base.rows.map((row) => ({
      ...row,
      arith: { ...row.arith },
      euclid: { ...row.euclid },
      geom: { ...row.geom },
      sporn: { ...row.sporn },
      berggren: {
        ...row.berggren,
        canonWord: [...row.berggren.canonWord],
        rawWord: [...row.berggren.rawWord],
      },
    })),
  };
}

function freezeMutatedMatrix(m: any): FullClassMatrixResult {
  for (const row of m.rows) {
    Object.freeze(row.arith);
    Object.freeze(row.euclid);
    Object.freeze(row.geom);
    Object.freeze(row.sporn);
    Object.freeze(row.berggren.canonWord);
    Object.freeze(row.berggren.rawWord);
    Object.freeze(row.berggren);
    Object.freeze(row);
  }
  Object.freeze(m.rows);
  return Object.freeze(m);
}

// CM-INV-01: CORE field / canonical ID / hyperbola equation broken
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].c += 1n;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-01/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].primId = 'PT-R1-K1-X99';
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-01/.test(err.message)
  );
}

// CM-INV-02: wrong rowCount/header, discontinuous rowIdx, or unfrozen matrix
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rowCount = 99n;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-02/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[1].rowIdx = 5n;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-02/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  assert.throws(
    () => verifyClassMatrixInvariants(m),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-02/.test(err.message)
  );
}

// CM-INV-03: unsorted rows / duplicate tripleId / duplicate x in output
{
  const m = cloneMatrixForMutation(r3Matrix);
  const tmp = m.rows[0];
  m.rows[0] = m.rows[1];
  m.rows[1] = tmp;
  m.rows[0].rowIdx = 0n;
  m.rows[1].rowIdx = 1n;
  m.firstTripleId = m.rows[0].tripleId;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-03/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[1].tripleId = m.rows[0].tripleId;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-03/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[1].x = m.rows[0].x;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-03/.test(err.message)
  );
}

// CM-INV-04: GEOM identity violations (old v0.1 semiPerimeter typo 2r+x+y, areaS !== r*p)
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].geom.semiPerimeter -= m.r;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-04/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].geom.areaS += 1n;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-04/.test(err.message)
  );
}

// CM-INV-05: ARITH & EUCLID correspondence broken
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].arith.div5Side = !m.rows[0].arith.div5Side;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-05/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  const oldU = m.rows[0].euclid.euclidU;
  m.rows[0].euclid.euclidU = m.rows[0].euclid.euclidV;
  m.rows[0].euclid.euclidV = oldU;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-05/.test(err.message)
  );
}

// CM-INV-06: SPORN / exact rational trig mismatch (aDivC !== sinA, wrong spornZone, wrong asymQ)
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].sporn.spornZone = 'Z0_ROOT';
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-06/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].geom.aDivC = createRational(1n, 99n);
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-06/.test(err.message)
  );
}
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].sporn.asymQ = createRational(1n, 777n);
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-06/.test(err.message)
  );
}

// CM-INV-07: BERGGREN consistency (wrong treeLegSwapped)
{
  const m = cloneMatrixForMutation(r3Matrix);
  m.rows[0].berggren.treeLegSwapped = !m.rows[0].berggren.treeLegSwapped;
  assert.throws(
    () => verifyClassMatrixInvariants(freezeMutatedMatrix(m)),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-07/.test(err.message)
  );
}

// CM-INV-08: Full === Lazy mismatch
{
  const lazyR6 = createLazyClassMatrix(classifyRadius(6n));
  assert.throws(
    () => verifyClassMatrixInvariants(r3Matrix, lazyR6),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-08/.test(err.message)
  );
  const mutatedFull15 = cloneMatrixForMutation(full15);
  mutatedFull15.rows[0].arith.gcdSides = 99n;
  assert.throws(
    () => verifyFullLazyMatrixParity(freezeMutatedMatrix(mutatedFull15), lazy15),
    (err: unknown) => err instanceof MatrixInvariantError && /CM-INV-08/.test(err.message)
  );
}

console.log('✓ Section 3: All CM-INV-01..08 mutation checks passed.');

// ============================================================================
// 4. Negative Guards (Incomplete, Duplicates, Cache Mismatch, Alignment, Bounds)
// ============================================================================
const incompleteClassification: RadiusClassificationResult = {
  ...c15,
  isComplete: false,
};
assert.throws(
  () => buildFullClassMatrix(incompleteClassification),
  (err: unknown) =>
    err instanceof IncompleteClassificationError &&
    err.code === 'INCOMPLETE_CLASSIFICATION_RESULT'
);
assert.throws(
  () => createLazyClassMatrix(incompleteClassification),
  (err: unknown) =>
    err instanceof IncompleteClassificationError &&
    err.code === 'INCOMPLETE_CLASSIFICATION_RESULT'
);

// totalTriplesCount !== expectedTotalCount rejected
assert.throws(
  () =>
    buildFullClassMatrix({
      ...c15,
      totalTriplesCount: c15.expectedTotalCount - 1n,
    }),
  (err: unknown) =>
    err instanceof IncompleteClassificationError &&
    err.code === 'INCOMPLETE_CLASSIFICATION_RESULT'
);

assert.throws(
  () => buildFullClassMatrix({ ...c15, r: 0n }),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'INVALID_RADIUS'
);

// Duplicate tripleId rejected
assert.throws(
  () =>
    buildFullClassMatrix({
      ...c15,
      allTriples: [c15.allTriples[0], c15.allTriples[0], ...c15.allTriples.slice(2)],
    }),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'DUPLICATE_TRIPLE_ID'
);

// Duplicate x with distinct tripleId rejected
assert.throws(
  () =>
    buildFullClassMatrix({
      ...c15,
      allTriples: [
        c15.allTriples[0],
        { ...c15.allTriples[1], tripleId: 'PT-R15-K1-X1-ALT', x: c15.allTriples[0].x },
        ...c15.allTriples.slice(2),
      ],
    }),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'DUPLICATE_X'
);

// Facet cache mismatch (wrong length or wrong class)
assert.throws(
  () =>
    createLazyClassMatrix(c15, {
      spornFacets: computeSpornFacetsForClass(c15).slice(0, 2),
    }),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'FACET_CACHE_MISMATCH'
);
assert.throws(
  () =>
    createLazyClassMatrix(c15, {
      berggrenFacets: computeBerggrenFacetsForClass(classifyRadius(3n)),
    }),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'FACET_CACHE_MISMATCH'
);

// Invalid column group & invalid rowIdx
assert.throws(
  () => lazy15.materializeGroup('TRANSVERSAL' as any),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'INVALID_COLUMN_GROUP'
);
assert.throws(
  () => lazy15.getRow(99n),
  (err: unknown) => err instanceof ClassMatrixError && err.code === 'INVALID_ROW_INDEX'
);

// verifyPassportMatrixAlignment negative checks
{
  const nt15 = analyzeRadiusNumberTheory(15n);
  const sp15 = computeSpornFacetsForClass(c15);
  const bg15 = computeBerggrenFacetsForClass(c15);
  const prof15 = buildClassProfileFacet(c15, sp15, bg15);
  const p15 = buildClassPassport({ numberTheory: nt15, classification: c15, profile: prof15 });

  assert.throws(
    () =>
      verifyPassportMatrixAlignment(
        {
          ...p15,
          expectedMatrixSummary: { ...p15.expectedMatrixSummary, rowCount: 99n },
        },
        full15
      ),
    (err: unknown) => err instanceof ClassMatrixError && err.code === 'TRIPLE_MISMATCH'
  );
  assert.throws(
    () =>
      verifyPassportMatrixAlignment(
        { ...p15, isComplete: false, status: 'INCOMPLETE' },
        full15
      ),
    (err: unknown) => err instanceof ClassMatrixError && err.code === 'TRIPLE_MISMATCH'
  );
}
console.log('✓ Section 4: All negative guards passed.');

// ============================================================================
// 5. Range Sweep: r = 1..50 (Full === Lazy, CM-INV-01..08, Passport Parity)
// ============================================================================
let totalRows = 0n;
let totalPrimitives = 0n;

for (let r = 1n; r <= 50n; r += 1n) {
  const nt = analyzeRadiusNumberTheory(r);
  const cls = classifyRadius(r);
  const sporn = computeSpornFacetsForClass(cls);
  const berggren = computeBerggrenFacetsForClass(cls);
  const profile = buildClassProfileFacet(cls, sporn, berggren);
  const passport = buildClassPassport({
    numberTheory: nt,
    classification: cls,
    profile,
  });

  const full = buildFullClassMatrix(cls);
  const lazy = createLazyClassMatrix(cls);
  lazy.materializeGroups(['BERGGREN', 'GEOM', 'ARITH']);
  const fullFromLazy = lazy.toFullMatrix();

  verifyClassMatrixInvariants(full, lazy);
  verifyPassportMatrixAlignment(passport, full);
  assert.deepEqual(fullFromLazy, full);
  assert.equal(full.rowCount, passport.expectedMatrixSummary.rowCount);
  assert.equal(full.firstTripleId, passport.expectedMatrixSummary.firstTripleId);
  assert.equal(full.lastTripleId, passport.expectedMatrixSummary.lastTripleId);

  totalRows += full.rowCount;
  for (const row of full.rows) {
    if (row.isPrimitive) {
      totalPrimitives += 1n;
    }
  }
}

assert.equal(totalPrimitives, 110n);
assert.ok(totalRows > totalPrimitives);
console.log(
  `✓ Section 5: r=1..50 sweep passed (${totalRows.toString()} total rows, ${totalPrimitives.toString()} primitive rows, 0 violations).`
);
console.log('\nALL M5-S2 CLASS MATRIX TESTS PASSED!');
