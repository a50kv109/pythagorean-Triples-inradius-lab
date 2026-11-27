/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export interface PrimitiveAncestor {
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
  readonly x: bigint;
  readonly y: bigint;
}

export interface EuclideanParameters {
  readonly m: bigint;
  readonly n: bigint;
  readonly u: bigint;
  readonly v: bigint;
}

export interface PythagoreanTriple {
  readonly r: bigint;
  readonly D: bigint;
  readonly x: bigint;
  readonly y: bigint;
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
  readonly k: bigint;
  readonly isPrimitive: boolean;
  readonly primitiveRadius: bigint;
  readonly primitiveAncestor: PrimitiveAncestor;
  readonly classId: string;
  readonly tripleId: string;
  readonly primId: string;
  readonly euclideanParams?: EuclideanParameters;
}

export interface SubclassGroup {
  readonly k: bigint;
  readonly primitiveRadius: bigint;
  readonly actualCount: bigint;
  readonly expectedCount: bigint;
  readonly isCardinalityMatch: boolean;
  readonly triples: readonly PythagoreanTriple[];
}

export interface RadiusClassificationResult {
  readonly r: bigint;
  readonly totalTriplesCount: bigint;
  readonly expectedTotalCount: bigint;
  readonly isComplete: boolean;
  readonly subclasses: readonly SubclassGroup[];
  readonly allTriples: readonly PythagoreanTriple[];
  readonly warnings: readonly any[];
}
