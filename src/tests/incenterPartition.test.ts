/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import { calculateFourCircles } from '../math/FourCirclesModel.ts';
import { calculateIncenterPartition } from '../math/IncenterPartition.ts';

const TOL = 1e-9;

function assertClose(actual: number, expected: number, message: string, tol = TOL) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${message}: expected ${expected}, got ${actual} (diff=${diff})`);
}

console.log('Running Incenter Triangle Partition (S = SA + SB + SC = pr) Test Suite...\n');

// ============================================================================
// 1. Control Triangles: (3,4,5), (4,3,5), (5,12,13), (4,4,4√2), (1,10,√101)
// ============================================================================
const controlCases = [
  {
    a: 3,
    b: 4,
    expectedC: 5,
    expectedP: 6, // (3 + 4 + 5) / 2
    expectedS: 6, // 3 * 4 / 2
    expectedR: 1, // 6 / 6
    expectedSA: 1.5, // 3 * 1 / 2
    expectedSB: 2.0, // 4 * 1 / 2
    expectedSC: 2.5, // 5 * 1 / 2
    label: '(3, 4, 5)',
  },
  {
    a: 4,
    b: 3,
    expectedC: 5,
    expectedP: 6,
    expectedS: 6,
    expectedR: 1,
    expectedSA: 2.0, // 4 * 1 / 2
    expectedSB: 1.5, // 3 * 1 / 2
    expectedSC: 2.5, // 5 * 1 / 2
    label: '(4, 3, 5)',
  },
  {
    a: 5,
    b: 12,
    expectedC: 13,
    expectedP: 15, // (5 + 12 + 13) / 2
    expectedS: 30, // 5 * 12 / 2
    expectedR: 2,  // 30 / 15
    expectedSA: 5.0,  // 5 * 2 / 2
    expectedSB: 12.0, // 12 * 2 / 2
    expectedSC: 13.0, // 13 * 2 / 2
    label: '(5, 12, 13)',
  },
  {
    a: 4,
    b: 4,
    expectedC: 4 * Math.SQRT2,
    expectedP: 4 + 2 * Math.SQRT2,
    expectedS: 8,
    expectedR: 4 - 2 * Math.SQRT2,
    expectedSA: 2 * (4 - 2 * Math.SQRT2),
    expectedSB: 2 * (4 - 2 * Math.SQRT2),
    expectedSC: 2 * Math.SQRT2 * (4 - 2 * Math.SQRT2),
    label: '(4, 4, 4√2)',
  },
  {
    a: 1,
    b: 10,
    expectedC: Math.sqrt(101),
    expectedP: (11 + Math.sqrt(101)) / 2,
    expectedS: 5,
    expectedR: (11 - Math.sqrt(101)) / 2,
    expectedSA: (1 * (11 - Math.sqrt(101)) / 2) / 2,
    expectedSB: (10 * (11 - Math.sqrt(101)) / 2) / 2,
    expectedSC: (Math.sqrt(101) * (11 - Math.sqrt(101)) / 2) / 2,
    label: '(1, 10, √101)',
  },
];

for (const tc of controlCases) {
  const calc = calculateFourCircles(tc.a, tc.b);
  const part = calculateIncenterPartition(calc);

  // 1. Incenter coordinates I = (r, r)
  assertClose(part.incenter.x, tc.expectedR, `${tc.label} incenter I.x`);
  assertClose(part.incenter.y, tc.expectedR, `${tc.label} incenter I.y`);
  assertClose(part.inradius, tc.expectedR, `${tc.label} inradius r`);

  // 2. Semiperimeter p and area S
  assertClose(part.semiperimeter, tc.expectedP, `${tc.label} semiperimeter p`);
  assertClose(part.triangleArea, tc.expectedS, `${tc.label} triangle area S`);

  // 3. Three sub-triangle areas: SA = ar/2, SB = br/2, SC = cr/2
  assertClose(part.subTriangles.SA.area, tc.expectedSA, `${tc.label} sub-triangle SA area`);
  assertClose(part.subTriangles.SB.area, tc.expectedSB, `${tc.label} sub-triangle SB area`);
  assertClose(part.subTriangles.SC.area, tc.expectedSC, `${tc.label} sub-triangle SC area`);

  // 4. Area sum theorem: SA + SB + SC = S
  assertClose(part.areaSum, tc.expectedS, `${tc.label} area sum SA + SB + SC = S`);
  assertClose(part.identityDeltaArea, 0, `${tc.label} identityDeltaArea`);

  // 5. Invariant product theorem: S = pr
  assertClose(part.productPR, tc.expectedS, `${tc.label} product pr = S`);
  assertClose(part.identityDeltaPR, 0, `${tc.label} identityDeltaPR`);
  assert.ok(part.isExact, `${tc.label} isExact flag`);

  // 6. Sub-triangle shares sum to 1.0 (100%)
  const shareSum = part.subTriangles.SA.share + part.subTriangles.SB.share + part.subTriangles.SC.share;
  assertClose(shareSum, 1.0, `${tc.label} share sum`);

  console.log(`✓ Control triangle ${tc.label}: SA=${part.subTriangles.SA.area.toFixed(3)}, SB=${part.subTriangles.SB.area.toFixed(3)}, SC=${part.subTriangles.SC.area.toFixed(3)}, Sum=${part.areaSum.toFixed(3)} = S = pr.`);
}

// ============================================================================
// 2. Geometric Connectivity & Vertex Adjacency Tests
// ============================================================================
console.log('\nRunning geometric vertex connectivity tests...');
{
  const calc = calculateFourCircles(3, 4);
  const part = calculateIncenterPartition(calc);

  const C = part.vertexC; // (0, 0)
  const A = part.vertexA; // (0, 3)
  const B = part.vertexB; // (4, 0)
  const I = part.incenter; // (1, 1)

  // SA connects C, A, I
  assert.deepEqual(part.subTriangles.SA.vertices[0], C, 'SA vertex 0 must be C');
  assert.deepEqual(part.subTriangles.SA.vertices[1], A, 'SA vertex 1 must be A');
  assert.deepEqual(part.subTriangles.SA.vertices[2], I, 'SA vertex 2 must be I');

  // SB connects C, B, I
  assert.deepEqual(part.subTriangles.SB.vertices[0], C, 'SB vertex 0 must be C');
  assert.deepEqual(part.subTriangles.SB.vertices[1], B, 'SB vertex 1 must be B');
  assert.deepEqual(part.subTriangles.SB.vertices[2], I, 'SB vertex 2 must be I');

  // SC connects A, B, I
  assert.deepEqual(part.subTriangles.SC.vertices[0], A, 'SC vertex 0 must be A');
  assert.deepEqual(part.subTriangles.SC.vertices[1], B, 'SC vertex 1 must be B');
  assert.deepEqual(part.subTriangles.SC.vertices[2], I, 'SC vertex 2 must be I');

  console.log('✓ All 3 sub-triangles correctly share incenter I and connect to corresponding vertices without gaps.');
}

// ============================================================================
// 3. Equidistance Property: Distance from I to all 3 sides equals r
// ============================================================================
console.log('\nRunning distance from incenter to sides tests...');
for (const tc of controlCases) {
  const calc = calculateFourCircles(tc.a, tc.b);
  const part = calculateIncenterPartition(calc);
  const r = part.inradius;
  const I = part.incenter;

  // 1. Distance to vertical leg (line x = 0)
  const distToVerticalLeg = Math.abs(I.x - 0);
  assertClose(distToVerticalLeg, r, `${tc.label} distance from I to vertical leg`);

  // 2. Distance to horizontal leg (line y = 0)
  const distToHorizontalLeg = Math.abs(I.y - 0);
  assertClose(distToHorizontalLeg, r, `${tc.label} distance from I to horizontal leg`);

  // 3. Distance to hypotenuse line ax + by - ab = 0
  // Formula: |a*Ix + b*Iy - a*b| / sqrt(a^2 + b^2)
  const a = tc.a;
  const b = tc.b;
  const c = part.sideC;
  const distToHypotenuse = Math.abs(a * I.x + b * I.y - a * b) / c;
  assertClose(distToHypotenuse, r, `${tc.label} distance from I to hypotenuse`);

  // 4. Perpendicular projection feet check
  const footA = part.subTriangles.SA.tangencyPoint; // (0, r)
  assertClose(Math.hypot(I.x - footA.x, I.y - footA.y), r, `${tc.label} length of perp to side a`);

  const footB = part.subTriangles.SB.tangencyPoint; // (r, 0)
  assertClose(Math.hypot(I.x - footB.x, I.y - footB.y), r, `${tc.label} length of perp to side b`);

  const footC = part.subTriangles.SC.tangencyPoint; // on AB
  assertClose(Math.hypot(I.x - footC.x, I.y - footC.y), r, `${tc.label} length of perp to side c`);
}
console.log('✓ Incenter equidistance property: distance to all 3 sides equals inradius r.');

// ============================================================================
// 4. Dynamic Parametric Sweep & Robustness Tests
// ============================================================================
console.log('\nRunning parametric sweep across aspect ratios...');
for (let a = 0.5; a <= 15; a += 1.5) {
  for (let b = 0.5; b <= 15; b += 1.5) {
    const calc = calculateFourCircles(a, b);
    const part = calculateIncenterPartition(calc);

    assert.ok(part.inradius > 0, `Inradius must be positive for a=${a}, b=${b}`);
    assertClose(part.areaSum, part.triangleArea, `Area sum equality for a=${a}, b=${b}`);
    assertClose(part.productPR, part.triangleArea, `S = pr equality for a=${a}, b=${b}`);
    assert.ok(part.isExact, `isExact flag for a=${a}, b=${b}`);
  }
}
console.log('✓ Dynamic parametric sweep passed across all test aspect ratios.');

console.log('\n================================================================');
console.log('ALL INCENTER PARTITION TESTS PASSED! S = SA + SB + SC = pr VERIFIED!');
console.log('================================================================\n');
