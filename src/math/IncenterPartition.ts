/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { Point2D, FourCirclesCalculations } from '../types/geometry.ts';

export interface SubTrianglePartition {
  id: 'SA' | 'SB' | 'SC';
  label: string;
  name: string;
  vertices: [Point2D, Point2D, Point2D];
  baseSideName: string;
  baseSideLength: number;
  height: number; // r
  area: number;
  share: number; // area / S
  centroid: Point2D;
  tangencyPoint: Point2D; // Foot of perpendicular from incenter to this side
  rightAngleMarker: [Point2D, Point2D, Point2D, Point2D]; // 4 points of the perpendicular marker
}

export interface IncenterPartitionModel {
  // Original triangle properties
  vertexA: Point2D;
  vertexB: Point2D;
  vertexC: Point2D;
  sideA: number; // vertical leg (OA) in current coordinate model
  sideB: number; // horizontal leg (OB) in current coordinate model
  sideC: number; // hypotenuse (AB)
  triangleArea: number; // S = a * b / 2
  semiperimeter: number; // p = (a + b + c) / 2
  perimeter: number; // P = a + b + c

  // Incenter & inradius (from Canonical Geometry)
  incenter: Point2D; // I = (r, r)
  inradius: number;  // r = ab / (a + b + c)

  // Three sub-triangles
  subTriangles: {
    SA: SubTrianglePartition; // on side A
    SB: SubTrianglePartition; // on side B
    SC: SubTrianglePartition; // on hypotenuse C
  };

  // Proof sums and invariants
  areaSum: number; // SA + SB + SC
  productPR: number; // p * r
  identityDeltaArea: number; // |areaSum - triangleArea|
  identityDeltaPR: number; // |triangleArea - productPR|
  isExact: boolean; // within floating point tolerance
}

/**
 * Computes right angle marker polygon of size `size` at tangency point `foot`,
 * pointing towards incenter `I` and along the side tangent.
 */
function computeRightAngleSquare(
  foot: Point2D,
  incenter: Point2D,
  tangentUnit: Point2D,
  size: number
): [Point2D, Point2D, Point2D, Point2D] {
  // Normal from foot to incenter (length r)
  const dx = incenter.x - foot.x;
  const dy = incenter.y - foot.y;
  const dist = Math.hypot(dx, dy);
  const normalUnit = dist > 1e-12 ? { x: dx / dist, y: dy / dist } : { x: 0, y: 0 };

  // Square corners: foot -> foot + s*tangent -> foot + s*tangent + s*normal -> foot + s*normal
  const p0 = { x: foot.x, y: foot.y };
  const p1 = { x: foot.x + tangentUnit.x * size, y: foot.y + tangentUnit.y * size };
  const p2 = {
    x: foot.x + tangentUnit.x * size + normalUnit.x * size,
    y: foot.y + tangentUnit.y * size + normalUnit.y * size,
  };
  const p3 = { x: foot.x + normalUnit.x * size, y: foot.y + normalUnit.y * size };

  return [p0, p1, p2, p3];
}

/**
 * Calculates incenter partition model directly from FourCirclesCalculations.
 * Guarantees zero duplicate calculations: uses the exact canonical incenter and inradius.
 */
export function calculateIncenterPartition(calc: FourCirclesCalculations): IncenterPartitionModel {
  const { triangle, incircle } = calc;

  const C: Point2D = triangle.O; // (0, 0) right-angle vertex
  const A: Point2D = triangle.A; // (0, a)
  const B: Point2D = triangle.B; // (b, 0)

  const a = triangle.a; // vertical leg |OA|
  const b = triangle.b; // horizontal leg |OB|
  const c = triangle.c; // hypotenuse |AB|

  const S = triangle.area; // a * b / 2
  const P = triangle.perimeter; // a + b + c
  const p = P / 2; // semiperimeter

  const I = incircle.center; // (r, r)
  const r = incircle.radius; // ab / (a + b + c)

  const markerSize = Math.max(0.1, Math.min(0.4, r * 0.28));

  // 1. Sub-triangle SA on vertical leg OA (length a)
  // Vertices: C(0,0), A(0,a), I(r,r)
  const areaSA = (a * r) / 2;
  const centroidSA: Point2D = {
    x: (C.x + A.x + I.x) / 3,
    y: (C.y + A.y + I.y) / 3,
  };
  const tangencyOA = incircle.tangencyOA; // (0, r)
  // Tangent along OA towards A: (0, 1)
  const markerSA = computeRightAngleSquare(tangencyOA, I, { x: 0, y: 1 }, markerSize);

  const subTriangleSA: SubTrianglePartition = {
    id: 'SA',
    label: 'S_A',
    name: '△CAI (сторона a)',
    vertices: [C, A, I],
    baseSideName: 'a',
    baseSideLength: a,
    height: r,
    area: areaSA,
    share: S > 0 ? areaSA / S : 0,
    centroid: centroidSA,
    tangencyPoint: tangencyOA,
    rightAngleMarker: markerSA,
  };

  // 2. Sub-triangle SB on horizontal leg OB (length b)
  // Vertices: C(0,0), B(b,0), I(r,r)
  const areaSB = (b * r) / 2;
  const centroidSB: Point2D = {
    x: (C.x + B.x + I.x) / 3,
    y: (C.y + B.y + I.y) / 3,
  };
  const tangencyOB = incircle.tangencyOB; // (r, 0)
  // Tangent along OB towards B: (1, 0)
  const markerSB = computeRightAngleSquare(tangencyOB, I, { x: 1, y: 0 }, markerSize);

  const subTriangleSB: SubTrianglePartition = {
    id: 'SB',
    label: 'S_B',
    name: '△CBI (сторона b)',
    vertices: [C, B, I],
    baseSideName: 'b',
    baseSideLength: b,
    height: r,
    area: areaSB,
    share: S > 0 ? areaSB / S : 0,
    centroid: centroidSB,
    tangencyPoint: tangencyOB,
    rightAngleMarker: markerSB,
  };

  // 3. Sub-triangle SC on hypotenuse AB (length c)
  // Vertices: A(0,a), B(b,0), I(r,r)
  const areaSC = (c * r) / 2;
  const centroidSC: Point2D = {
    x: (A.x + B.x + I.x) / 3,
    y: (A.y + B.y + I.y) / 3,
  };
  const tangencyAB = incircle.tangencyAB;
  // Unit tangent along hypotenuse from A to B: (b/c, -a/c)
  const tangentABUnit = { x: b / c, y: -a / c };
  const markerSC = computeRightAngleSquare(tangencyAB, I, tangentABUnit, markerSize);

  const subTriangleSC: SubTrianglePartition = {
    id: 'SC',
    label: 'S_C',
    name: '△ABI (гипотенуза c)',
    vertices: [A, B, I],
    baseSideName: 'c',
    baseSideLength: c,
    height: r,
    area: areaSC,
    share: S > 0 ? areaSC / S : 0,
    centroid: centroidSC,
    tangencyPoint: tangencyAB,
    rightAngleMarker: markerSC,
  };

  const areaSum = areaSA + areaSB + areaSC;
  const productPR = p * r;
  const deltaArea = Math.abs(areaSum - S);
  const deltaPR = Math.abs(S - productPR);
  const isExact = deltaArea < 1e-11 && deltaPR < 1e-11;

  return {
    vertexA: A,
    vertexB: B,
    vertexC: C,
    sideA: a,
    sideB: b,
    sideC: c,
    triangleArea: S,
    semiperimeter: p,
    perimeter: P,
    incenter: I,
    inradius: r,
    subTriangles: {
      SA: subTriangleSA,
      SB: subTriangleSB,
      SC: subTriangleSC,
    },
    areaSum,
    productPR,
    identityDeltaArea: deltaArea,
    identityDeltaPR: deltaPR,
    isExact,
  };
}
