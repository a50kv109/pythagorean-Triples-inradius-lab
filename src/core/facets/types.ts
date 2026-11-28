/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type { ExactRational } from '../exact/index.ts';

export type SpornZone = 'Z0_ROOT' | 'Z1_A1' | 'Z3_A3' | 'Z2_A2';
export type SpornParityCase = 'X0_ODD' | 'X0_EVEN';

export interface SpornFacetResult {
  readonly tripleId: string;
  readonly classId: string;
  readonly primId: string;

  readonly r: bigint;
  readonly k: bigint;
  readonly isPrimitive: boolean;

  readonly x: bigint;
  readonly y: bigint;
  readonly spornX: ExactRational;   // x / r
  readonly spornY: ExactRational;   // y / r
  readonly spornZone: SpornZone;

  readonly rayBaseR0: bigint;       // r / k
  readonly parityCase: SpornParityCase;

  // Exact rational geometry (no float64)
  readonly tanHalfA: ExactRational; // r / (r + y)
  readonly tanHalfB: ExactRational; // r / (r + x)
  readonly sinA: ExactRational;     // a / c
  readonly cosA: ExactRational;     // b / c
  readonly tanA: ExactRational;     // a / b
  readonly formT: ExactRational;    // b / a
  readonly asymQ: ExactRational;    // (b - a) / (a + b)
  readonly normS: ExactRational;    // S / r^2 (= x_tilde + y_tilde + 3)
  readonly normP: ExactRational;    // P / r (= 2 * x_tilde + 2 * y_tilde + 6 = 2 * normS)
}

export type BerggrenOperator = 'A1' | 'A2' | 'A3';

export interface RawTripleLegs {
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
}

export interface PrimitiveTripleState {
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
  readonly r: bigint;
  readonly x: bigint;
  readonly y: bigint;
}

export interface BerggrenChildTransition {
  readonly operator: BerggrenOperator;
  readonly rawTriple: RawTripleLegs;
  readonly canonTriple: PrimitiveTripleState;
  readonly legSwapped: boolean;
  readonly spornX: ExactRational;
  readonly spornY: ExactRational;
  readonly spornZone: SpornZone;
  readonly childId: string;
}

export interface BerggrenChildrenMap {
  readonly A1: BerggrenChildTransition;
  readonly A2: BerggrenChildTransition;
  readonly A3: BerggrenChildTransition;
}

export interface BerggrenParentResult {
  readonly parentOperator: BerggrenOperator | null;
  readonly parentTriple: PrimitiveTripleState | null;
  readonly parentId: string | null;
}

export interface BerggrenFacetResult {
  readonly tripleId: string;
  readonly classId: string;
  readonly primId: string;

  readonly r: bigint;
  readonly k: bigint;
  readonly isPrimitive: boolean;
  readonly appliesToPrimitiveAncestor: boolean;
  readonly primitiveAncestor: PrimitiveTripleState;

  readonly isRoot: boolean;
  readonly canonWord: readonly BerggrenOperator[];
  readonly rawWord: readonly BerggrenOperator[];
  readonly treeDepth: bigint;

  readonly parentOperator: BerggrenOperator | null;
  readonly parentId: string | null;
  readonly children: BerggrenChildrenMap;
}

export interface ZoneHistogram {
  readonly Z1_A1: bigint;
  readonly Z3_A3: bigint;
  readonly Z0_ROOT: bigint;
  readonly Z2_A2: bigint;
}

export interface ClassPopulationMetrics {
  readonly count: bigint;
  readonly meanSpornX: ExactRational;
  readonly meanADivC: ExactRational;
  readonly zoneHistogram: ZoneHistogram;
}

export interface PrimitivePopulationMetrics extends ClassPopulationMetrics {
  readonly berggrenDepthMin: bigint;
  readonly berggrenDepthMax: bigint;
}

export interface ClassProfileFacetResult {
  readonly classId: string;
  readonly r: bigint;

  readonly cMin: bigint;
  readonly cMax: bigint;
  readonly cMinRatio: ExactRational;
  readonly hasSub5rCompression: boolean;
  readonly spornXMin: ExactRational;
  readonly spornXMax: ExactRational;

  readonly allTriples: ClassPopulationMetrics;
  readonly primitiveTriples: PrimitivePopulationMetrics;
}
