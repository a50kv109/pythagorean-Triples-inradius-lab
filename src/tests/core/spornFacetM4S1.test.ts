/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  createRational,
  eqRational,
  mulRational,
  rationalFromBigInt,
} from '../../core/exact/index.ts';
import { classifyRadius } from '../../core/classification/index.ts';
import {
  classifySpornZone,
  computeSpornFacetForTriple,
  computeSpornFacetsForClass,
  verifySpornFacetInvariants,
  IncompleteClassificationError,
  InvalidSpornInputError,
} from '../../core/facets/index.ts';

console.log('Running M4-S1 SpornFacet Test Suite...\n');

// ============================================================================
// 1. Isolation Check: No float64 math or React/UI coupling
// ============================================================================
const facetsDir = path.resolve(process.cwd(), 'src/core/facets');
const facetFiles = fs.readdirSync(facetsDir).filter((f) => f.endsWith('.ts'));
assert.ok(facetFiles.length >= 3, 'Expected M4 facet source files');

for (const file of facetFiles) {
  const raw = fs.readFileSync(path.join(facetsDir, file), 'utf8');
  const codeOnly = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/\bMath\./.test(codeOnly), `Forbidden Math.* usage found in ${file}`);
  assert.ok(!/\bNumber\s*\(/.test(codeOnly), `Forbidden Number() conversion found in ${file}`);
  assert.ok(!/from\s+['"]react['"]/.test(codeOnly), `Forbidden React dependency found in ${file}`);
}
console.log('✓ Section 1: Pure BigInt/ExactRational isolation verified across src/core/facets/.');

// ============================================================================
// 2. Golden Tests G1 – G6 (including normS and normP = 2 * normS)
// ============================================================================
// G1: r=1, x=1, y=2 -> (3, 4, 5) [Z0_ROOT]
const class1 = classifyRadius(1n);
const f1 = computeSpornFacetForTriple(class1.allTriples[0]);
assert.equal(f1.tripleId, 'PT-R1-K1-X1');
assert.equal(f1.spornZone, 'Z0_ROOT');
assert.ok(eqRational(f1.spornX, createRational(1n, 1n)));
assert.ok(eqRational(f1.spornY, createRational(2n, 1n)));
assert.equal(f1.rayBaseR0, 1n);
assert.equal(f1.parityCase, 'X0_ODD');
assert.ok(eqRational(f1.tanHalfA, createRational(1n, 3n)));
assert.ok(eqRational(f1.tanHalfB, createRational(1n, 2n)));
assert.ok(eqRational(f1.asymQ, createRational(1n, 7n)));
assert.ok(eqRational(f1.normS, createRational(6n, 1n))); // 3 + 1 + 2 = 6
assert.ok(eqRational(f1.normP, createRational(12n, 1n))); // 6 + 2(1) + 2(2) = 12 = 2 * normS
assert.ok(eqRational(f1.normP, mulRational(f1.normS, rationalFromBigInt(2n))));

// G2: r=2, x=1, y=8 -> (5, 12, 13) [Z1_A1]
const class2 = classifyRadius(2n);
const f2 = computeSpornFacetForTriple(class2.allTriples[0]); // x=1, y=8
assert.equal(f2.spornZone, 'Z1_A1');
assert.ok(eqRational(f2.spornX, createRational(1n, 2n)));
assert.ok(eqRational(f2.spornY, createRational(4n, 1n)));
assert.ok(eqRational(f2.normS, createRational(15n, 2n))); // 3 + 1/2 + 4 = 15/2
assert.ok(eqRational(f2.normP, createRational(15n, 1n))); // 2 * (15/2) = 15
assert.ok(eqRational(f2.normP, mulRational(f2.normS, rationalFromBigInt(2n))));

// G3: r=2, x=2, y=4 -> (6, 8, 10), k=2 [Z0_ROOT]
const f3 = computeSpornFacetForTriple(class2.allTriples[1]); // x=2, y=4
assert.equal(f3.k, 2n);
assert.equal(f3.spornZone, 'Z0_ROOT');
assert.equal(f3.rayBaseR0, 1n); // primitive r0 = 1
assert.ok(eqRational(f3.normP, mulRational(f3.normS, rationalFromBigInt(2n))));

// G4: r=3, x=2, y=9 -> (8, 15, 17) [Z3_A3]
const class3 = classifyRadius(3n);
const f4 = computeSpornFacetForTriple(class3.allTriples[1]); // x=2, y=9
assert.equal(f4.spornZone, 'Z3_A3');
assert.ok(eqRational(f4.spornX, createRational(2n, 3n)));
assert.equal(f4.parityCase, 'X0_EVEN');
assert.ok(eqRational(f4.normS, createRational(20n, 3n))); // 3 + 2/3 + 3 = 20/3
assert.ok(eqRational(f4.normP, createRational(40n, 3n))); // 2 * (20/3) = 40/3
assert.ok(eqRational(f4.normP, mulRational(f4.normS, rationalFromBigInt(2n))));

// G5: r=6, x=8, y=9 -> (20, 21, 29) [Z2_A2]
const class6 = classifyRadius(6n);
const f5 = computeSpornFacetForTriple(class6.allTriples.find((t) => t.x === 8n)!);
assert.equal(f5.spornZone, 'Z2_A2');
assert.ok(eqRational(f5.spornX, createRational(4n, 3n)));
assert.ok(eqRational(f5.normS, createRational(35n, 6n))); // 3 + 4/3 + 3/2 = 35/6
assert.ok(eqRational(f5.normP, createRational(35n, 3n))); // 2 * (35/6) = 35/3
assert.ok(eqRational(f5.normP, mulRational(f5.normS, rationalFromBigInt(2n))));

// G6: r=15, x=9, y=50 -> (39, 80, 89) [Z3_A3]
const class15 = classifyRadius(15n);
const f6 = computeSpornFacetForTriple(class15.allTriples.find((t) => t.x === 9n)!);
assert.equal(f6.spornZone, 'Z3_A3');
assert.ok(eqRational(f6.spornX, createRational(3n, 5n)));
assert.ok(eqRational(f6.normP, mulRational(f6.normS, rationalFromBigInt(2n))));

console.log('✓ Section 2: Golden Tests G1 – G6 (including normS and normP=2*normS) passed.');

// ============================================================================
// 3. Negative Tests G7 – G8, SF-INV-02 & Ancestor Invariance G9
// ============================================================================
// G7: Incomplete classification check
const incompleteRes = {
  r: 5n,
  totalTriplesCount: 0n,
  expectedTotalCount: 3n,
  isComplete: false,
  subclasses: [],
  allTriples: [],
  warnings: [],
};
assert.throws(() => computeSpornFacetsForClass(incompleteRes as any), IncompleteClassificationError);

// G8: Invalid dimensions / hyperbola identity
const badTriple: any = {
  tripleId: 'PT-BAD',
  classId: 'CL-BAD',
  primId: 'PT-PRIM',
  r: 3n,
  k: 1n,
  x: 2n,
  y: 8n, // 2 * 8 = 16 != 2 * 3^2 = 18
  a: 8n,
  b: 14n,
  c: 16n,
  isPrimitive: true,
  primitiveRadius: 3n,
  primitiveAncestor: { a: 8n, b: 14n, c: 16n, x: 2n, y: 8n },
};
assert.throws(() => computeSpornFacetForTriple(badTriple), InvalidSpornInputError);

// Specific test for corrected SF-INV-02:
// Rejection of spornX in [sqrt(2), 2): e.g. xTilde = 3/2 (1.5^2 = 2.25 >= 2)
const invalidXFacet: any = {
  ...f1,
  spornX: createRational(3n, 2n),
};
assert.throws(() => verifySpornFacetInvariants(invalidXFacet), InvalidSpornInputError);

// Specific test for SF-INV-06: normP !== 2 * normS mismatch
const invalidNormPFacet: any = {
  ...f1,
  normP: f1.normS, // Incorrect 1x instead of 2x
};
assert.throws(() => verifySpornFacetInvariants(invalidNormPFacet), InvalidSpornInputError);

// G9: Ancestor invariance between C(3) and C(6) scaled triple (16, 30, 34) vs (8, 15, 17)
const baseTriple = class3.allTriples.find((t) => t.x === 2n)!; // (8, 15, 17)
const baseFacet = computeSpornFacetForTriple(baseTriple);

const scaledTriple = class6.allTriples.find((t) => t.x === 4n)!; // (16, 30, 34), k=2
const scaledFacet = computeSpornFacetForTriple(scaledTriple);

assert.equal(baseFacet.spornZone, scaledFacet.spornZone);
assert.ok(eqRational(baseFacet.spornX, scaledFacet.spornX));
assert.equal(baseFacet.rayBaseR0, scaledFacet.rayBaseR0);
assert.equal(baseFacet.primId, scaledFacet.primId);
assert.ok(eqRational(scaledFacet.normP, mulRational(scaledFacet.normS, rationalFromBigInt(2n))));

console.log('✓ Section 3: Negative tests G7-G8, SF-INV-02 guard & Ancestor Invariance G9 passed.');

// ============================================================================
// 4. Systematic Proving Pass across r = 1..30 (174 Triples Population)
// ============================================================================
let totalFacetsTested = 0n;
const zoneHistogram = { Z0_ROOT: 0, Z1_A1: 0, Z2_A2: 0, Z3_A3: 0 };

for (let rVal = 1n; rVal <= 30n; rVal += 1n) {
  const cls = classifyRadius(rVal);
  const facets = computeSpornFacetsForClass(cls);
  assert.equal(BigInt(facets.length), cls.totalTriplesCount);
  totalFacetsTested += BigInt(facets.length);

  for (const facet of facets) {
    zoneHistogram[facet.spornZone]++;
    // Verify normP === 2 * normS holds exactly across every triple
    assert.ok(eqRational(facet.normP, mulRational(facet.normS, rationalFromBigInt(2n))));
  }
}
assert.equal(totalFacetsTested, 174n);
assert.equal(zoneHistogram.Z0_ROOT, 30);
assert.equal(zoneHistogram.Z1_A1, 116);
assert.equal(zoneHistogram.Z2_A2, 9);
assert.equal(zoneHistogram.Z3_A3, 19);

console.log(`✓ Section 4: Systematic verification across r = 1..30 passed (all 174 triples verified with exact zone counts: Z0=30, Z1=116, Z2=9, Z3=19).`);

console.log('\n================================================================');
console.log('ALL TESTS FOR M4-S1 SPORNFACET PASSED SUCCESSFULLY!');
console.log('================================================================');
