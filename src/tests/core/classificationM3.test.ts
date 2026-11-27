/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  InvalidRadiusError,
} from '../../core/exact/index.ts';
import {
  ClassificationError,
  InvalidTripleError,
  EuclideanRecoveryError,
  SubclassMismatchError,
  reconstructTriple,
  recoverEuclideanParameters,
  classifyTriple,
  buildSubclasses,
  classifyRadius,
} from '../../core/classification/index.ts';

console.log('Running M3 — Classification Engine Test Suite...\n');

// ============================================================================
// 1. Isolation Check: M3 Must Have Zero Math.*, Number() Conversions, React, or UI Coupling
// ============================================================================
const classDir = path.resolve(process.cwd(), 'src/core/classification');
const classFiles = fs.readdirSync(classDir).filter((f) => f.endsWith('.ts'));
assert.ok(classFiles.length >= 7, 'Expected modular M3 source files in src/core/classification');

for (const file of classFiles) {
  const raw = fs.readFileSync(path.join(classDir, file), 'utf8');
  const codeOnly = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/\bparseInt\s*\(|\bparseFloat\s*\(/.test(codeOnly), `Forbidden parseInt/parseFloat found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
  assert.ok(
    !/from\s+['"].*(components|geometry|canonical|verification)\//.test(codeOnly),
    `Forbidden UI/legacy/M4+/M6 coupling found in ${file}`
  );

  // M1 & M2 imports check
  const exactOrFactorImports = [
    ...codeOnly.matchAll(/from\s+['"](\.\.\/(exact|factorization)\/[^'"]+)['"]/g),
  ].map((m) => m[1]);
  for (const imp of exactOrFactorImports) {
    assert.ok(
      imp === '../exact/index.ts' || imp === '../factorization/index.ts',
      `M3 file ${file} must import M1/M2 strictly via ../exact/index.ts or ../factorization/index.ts, got ${imp}`
    );
  }
}
console.log('✓ Section 1: Pure BigInt isolation & strict M1/M2 barrel dependency verified across src/core/classification/.');

// ============================================================================
// 2. Radius r = 1 Verification
// ============================================================================
const res1 = classifyRadius(1n);
assert.equal(res1.r, 1n);
assert.equal(res1.totalTriplesCount, 1n);
assert.equal(res1.expectedTotalCount, 1n);
assert.equal(res1.isComplete, true);
assert.equal(res1.subclasses.length, 1);
assert.equal(res1.subclasses[0].k, 1n);
assert.equal(res1.subclasses[0].actualCount, 1n);
assert.equal(res1.subclasses[0].expectedCount, 1n);
assert.equal(res1.subclasses[0].triples.length, 1);

const t1 = res1.subclasses[0].triples[0];
assert.equal(t1.a, 3n);
assert.equal(t1.b, 4n);
assert.equal(t1.c, 5n);
assert.equal(t1.k, 1n);
assert.equal(t1.isPrimitive, true);
assert.equal(t1.primitiveRadius, 1n);
assert.equal(t1.classId, 'CL-R1-D2');
assert.equal(t1.tripleId, 'PT-R1-K1-X1');
assert.equal(t1.primId, 'PT-R1-K1-X1');
assert.deepEqual(t1.primitiveAncestor, { a: 3n, b: 4n, c: 5n, x: 1n, y: 2n });
assert.deepEqual(t1.euclideanParams, { m: 2n, n: 1n, u: 1n, v: 1n });

console.log('✓ Section 2: Radius r = 1 verification passed (3, 4, 5).');

// ============================================================================
// 3. Radius r = 3 Verification
// ============================================================================
const res3 = classifyRadius(3n);
assert.equal(res3.r, 3n);
assert.equal(res3.totalTriplesCount, 3n);
assert.equal(res3.expectedTotalCount, 3n);
assert.equal(res3.isComplete, true);
assert.equal(res3.subclasses.length, 2); // k = 1 and k = 3

// Subclass k = 1: T(3) = 2 expected triples
const sub1 = res3.subclasses.find((s) => s.k === 1n);
assert.ok(sub1);
assert.equal(sub1.actualCount, 2n);
assert.equal(sub1.expectedCount, 2n);
const triplesK1 = sub1.triples.map((t) => [t.a, t.b, t.c]);
// Expected triples for k=1: (7, 24, 25) and (8, 15, 17)
assert.deepEqual(
  triplesK1.sort((a, b) => (a[0] < b[0] ? -1 : 1)),
  [
    [7n, 24n, 25n],
    [8n, 15n, 17n],
  ]
);

// Subclass k = 3: T(1) = 1 expected triple: (9, 12, 15)
const sub3 = res3.subclasses.find((s) => s.k === 3n);
assert.ok(sub3);
assert.equal(sub3.actualCount, 1n);
assert.equal(sub3.expectedCount, 1n);
assert.equal(sub3.triples[0].a, 9n);
assert.equal(sub3.triples[0].b, 12n);
assert.equal(sub3.triples[0].c, 15n);
assert.equal(sub3.triples[0].isPrimitive, false);
assert.equal(sub3.triples[0].primitiveRadius, 1n);
assert.deepEqual(sub3.triples[0].primitiveAncestor, { a: 3n, b: 4n, c: 5n, x: 1n, y: 2n });

console.log('✓ Section 3: Radius r = 3 verification passed (subclasses k=1 and k=3).');

// ============================================================================
// 4. Radius r = 6 Verification & Additional Test Radii (r = 2, 15, 30)
// ============================================================================
for (const rVal of [2n, 6n, 15n, 30n]) {
  const res = classifyRadius(rVal);
  assert.equal(res.isComplete, true);
  assert.equal(res.totalTriplesCount, res.expectedTotalCount);
  for (const sub of res.subclasses) {
    assert.equal(sub.actualCount, sub.expectedCount);
    assert.equal(sub.isCardinalityMatch, true);
  }
}
console.log('✓ Section 4: Radii r=2, 6, 15, 30 subclass cardinalities and completeness verified.');

// ============================================================================
// 5. Error Handling, Invalid Inputs, and Euclidean Recovery Edge Cases
// ============================================================================
// Invalid hyperbola pair reconstruction
assert.throws(() => reconstructTriple(3n, 1n, 1n), InvalidTripleError);
assert.throws(() => classifyTriple(3n, 1n, 1n), InvalidTripleError);

// Invalid Euclidean parameter recovery (non-opposite parity, non-square, etc.)
assert.throws(() => recoverEuclideanParameters(2n, 4n), EuclideanRecoveryError); // both even
assert.throws(() => recoverEuclideanParameters(3n, 5n), EuclideanRecoveryError); // both odd
assert.throws(() => recoverEuclideanParameters(2n, 3n), EuclideanRecoveryError); // x0=2 even, but evenVal=2 => u^2=1 => u=1, but oddVal=3 => v=sqrt(3) not int square
assert.throws(() => recoverEuclideanParameters(0n, 2n), EuclideanRecoveryError);

console.log('✓ Section 5: Invalid triples, Euclidean recovery errors, and domain checks passed.');

// ============================================================================
// 6. Systematic Property Checks (r = 1..20)
// ============================================================================
for (let rNum = 1n; rNum <= 20n; rNum += 1n) {
  const classification = classifyRadius(rNum);
  assert.equal(classification.isComplete, true);

  for (const triple of classification.allTriples) {
    // 1. a^2 + b^2 = c^2
    assert.equal(triple.a * triple.a + triple.b * triple.b, triple.c * triple.c);
    // 2. (a + b - c) / 2 = r
    assert.equal((triple.a + triple.b - triple.c) / 2n, triple.r);
    // 3. x * y = 2r^2
    assert.equal(triple.x * triple.y, 2n * triple.r * triple.r);
    // 4. a = 2r + x, b = 2r + y, c = 2r + x + y
    assert.equal(triple.a, 2n * triple.r + triple.x);
    assert.equal(triple.b, 2n * triple.r + triple.y);
    assert.equal(triple.c, 2n * triple.r + triple.x + triple.y);
    // 5. Primitive ancestor reconstruction & scaling
    const pa = triple.primitiveAncestor;
    assert.equal(triple.a, pa.a * triple.k);
    assert.equal(triple.b, pa.b * triple.k);
    assert.equal(triple.c, pa.c * triple.k);
    assert.equal(pa.a * pa.a + pa.b * pa.b, pa.c * pa.c);
  }
}
console.log('✓ Section 6: Systematic property invariants verified across r = 1..20.');

console.log('\n================================================================');
console.log('ALL SECTIONS OF M3 CLASSIFICATION ENGINE PASSED SUCCESSFULLY!');
console.log('================================================================');
