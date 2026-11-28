/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  RATIONAL_ONE,
  addRational,
  computeInradiusFromTriple,
  createRational,
  divRational,
  eqRational,
  gcdBigInt,
  mulRational,
  verifyCanonicalOrder,
  verifyHyperbolaIdentity,
  verifyPythagoreanIdentity,
} from '../exact/index.ts';
import type { PythagoreanTriple, RadiusClassificationResult } from '../classification/index.ts';
import {
  BerggrenFacetError,
  IncompleteClassificationError,
  InvalidBerggrenInputError,
  RootHasNoParentError,
} from './errors.ts';
import { classifySpornZone } from './spornFacet.ts';
import type {
  BerggrenChildTransition,
  BerggrenFacetResult,
  BerggrenOperator,
  BerggrenParentResult,
  PrimitiveTripleState,
  RawTripleLegs,
  SpornZone,
} from './types.ts';

export const BERGGREN_ROOT_TRIPLE: PrimitiveTripleState = Object.freeze({
  a: 3n,
  b: 4n,
  c: 5n,
  r: 1n,
  x: 1n,
  y: 2n,
});

const RATIONAL_TWO = createRational(2n, 1n);

function formatPrimId(r: bigint, x: bigint): string {
  return `PT-R${r.toString()}-K1-X${x.toString()}`;
}

function assertValidPrimitiveState(state: PrimitiveTripleState): void {
  const { a, b, c, r, x, y } = state;
  if (
    typeof a !== 'bigint' ||
    typeof b !== 'bigint' ||
    typeof c !== 'bigint' ||
    typeof r !== 'bigint' ||
    typeof x !== 'bigint' ||
    typeof y !== 'bigint'
  ) {
    throw new InvalidBerggrenInputError('all triple state fields must be bigint', 'INVALID_TRIPLE_DIMENSIONS');
  }
  if (a <= 0n || b <= 0n || c <= 0n || r <= 0n || x <= 0n || y <= 0n) {
    throw new InvalidBerggrenInputError('all triple dimensions and shifts must be positive', 'INVALID_TRIPLE_DIMENSIONS');
  }
  if (!verifyPythagoreanIdentity(a, b, c)) {
    throw new InvalidBerggrenInputError(
      `Pythagorean identity a^2 + b^2 = c^2 failed for (${a.toString()}, ${b.toString()}, ${c.toString()})`,
      'INVALID_TRIPLE_DIMENSIONS'
    );
  }
  if (!verifyCanonicalOrder(a, b, c)) {
    throw new InvalidBerggrenInputError(
      `canonical order 0 < a < b < c violated for (${a.toString()}, ${b.toString()}, ${c.toString()})`,
      'NON_CANONICAL_ORDER'
    );
  }
  const computedR = computeInradiusFromTriple(a, b, c);
  if (computedR !== r) {
    throw new InvalidBerggrenInputError(
      `inradius mismatch: expected r=${r.toString()}, computed r=${computedR.toString()}`,
      'INVALID_TRIPLE_DIMENSIONS'
    );
  }
  if (a !== 2n * r + x || b !== 2n * r + y || c !== 2n * r + x + y) {
    throw new InvalidBerggrenInputError(
      `shift reconstruction mismatch for r=${r.toString()}, x=${x.toString()}, y=${y.toString()}`,
      'INVALID_HYPERBOLA_IDENTITY'
    );
  }
  if (!verifyHyperbolaIdentity(r, x, y)) {
    throw new InvalidBerggrenInputError(
      `hyperbola identity xy = 2r^2 failed for r=${r.toString()}, x=${x.toString()}, y=${y.toString()}`,
      'INVALID_HYPERBOLA_IDENTITY'
    );
  }
  const g = gcdBigInt(gcdBigInt(a, b), c);
  if (g !== 1n) {
    throw new InvalidBerggrenInputError(
      `Berggren operators require a primitive triple (gcd = 1), got gcd=${g.toString()}`,
      'NON_PRIMITIVE_TRIPLE'
    );
  }
}

function multiplyRowByBerggrenMatrix(
  a: bigint,
  b: bigint,
  c: bigint,
  operator: BerggrenOperator
): RawTripleLegs {
  if (operator === 'A1') {
    return Object.freeze({
      a: a - 2n * b + 2n * c,
      b: 2n * a - b + 2n * c,
      c: 2n * a - 2n * b + 3n * c,
    });
  }
  if (operator === 'A2') {
    return Object.freeze({
      a: a + 2n * b + 2n * c,
      b: 2n * a + b + 2n * c,
      c: 2n * a + 2n * b + 3n * c,
    });
  }
  return Object.freeze({
    a: -a + 2n * b + 2n * c,
    b: -2n * a + b + 2n * c,
    c: -2n * a + 2n * b + 3n * c,
  });
}

function stepOperator(
  state: PrimitiveTripleState,
  operator: BerggrenOperator
): BerggrenChildTransition {
  assertValidPrimitiveState(state);

  const rawTriple = multiplyRowByBerggrenMatrix(state.a, state.b, state.c, operator);
  const legSwapped = rawTriple.a > rawTriple.b;

  const canonA = legSwapped ? rawTriple.b : rawTriple.a;
  const canonB = legSwapped ? rawTriple.a : rawTriple.b;
  const canonC = rawTriple.c;

  let nextR: bigint;
  let nextX: bigint;
  let nextY: bigint;

  if (operator === 'A1') {
    nextR = state.r + state.x;
    nextX = state.x;
    nextY = 4n * state.r + 2n * state.x + state.y;
  } else if (operator === 'A2') {
    nextR = 3n * state.r + state.x + state.y;
    nextX = 4n * state.r + 2n * state.x + state.y;
    nextY = 4n * state.r + state.x + 2n * state.y;
  } else {
    nextR = state.r + state.y;
    nextX = state.y;
    nextY = 4n * state.r + state.x + 2n * state.y;
  }

  const canonTriple: PrimitiveTripleState = Object.freeze({
    a: canonA,
    b: canonB,
    c: canonC,
    r: nextR,
    x: nextX,
    y: nextY,
  });

  assertValidPrimitiveState(canonTriple);

  const spornX = createRational(nextX, nextR);
  const spornY = createRational(nextY, nextR);
  const spornZone = classifySpornZone(nextX, nextR);

  return Object.freeze({
    operator,
    rawTriple,
    canonTriple,
    legSwapped,
    spornX,
    spornY,
    spornZone,
    childId: formatPrimId(nextR, nextX),
  });
}

/**
 * Applies Berggren operator A1 in row-vector convention and returns the canonicalized child transition.
 */
export function stepA1(state: PrimitiveTripleState): BerggrenChildTransition {
  return stepOperator(state, 'A1');
}

/**
 * Applies Berggren operator A2 in row-vector convention and returns the canonicalized child transition.
 */
export function stepA2(state: PrimitiveTripleState): BerggrenChildTransition {
  return stepOperator(state, 'A2');
}

/**
 * Applies Berggren operator A3 in row-vector convention and returns the canonicalized child transition.
 */
export function stepA3(state: PrimitiveTripleState): BerggrenChildTransition {
  return stepOperator(state, 'A3');
}

/**
 * Applies the selected Berggren operator to a canonical primitive triple state.
 */
export function stepBerggren(
  state: PrimitiveTripleState,
  operator: BerggrenOperator
): BerggrenChildTransition {
  return stepOperator(state, operator);
}

/**
 * Recovers the unique Berggren parent operator and primitive parent triple from the Sporn zone.
 * For the root (3, 4, 5), returns { parentOperator: null, parentTriple: null, parentId: null }.
 */
export function stepParent(state: PrimitiveTripleState): BerggrenParentResult {
  assertValidPrimitiveState(state);

  const zone: SpornZone = classifySpornZone(state.x, state.r);

  if (zone === 'Z0_ROOT') {
    if (
      state.r !== 1n ||
      state.a !== 3n ||
      state.b !== 4n ||
      state.c !== 5n ||
      state.x !== 1n ||
      state.y !== 2n
    ) {
      throw new InvalidBerggrenInputError(
        `primitive triple (${state.a.toString()}, ${state.b.toString()}, ${state.c.toString()}) in Z0_ROOT must be (3, 4, 5)`,
        'INVARIANT_VIOLATION'
      );
    }
    return Object.freeze({
      parentOperator: null,
      parentTriple: null,
      parentId: null,
    });
  }

  let parentOperator: BerggrenOperator;
  let parentR: bigint;
  let parentX: bigint;
  let parentY: bigint;

  if (zone === 'Z1_A1') {
    parentOperator = 'A1';
    parentR = state.r - state.x;
    parentX = state.x;
    parentY = state.y - 4n * state.r + 2n * state.x;
  } else if (zone === 'Z3_A3') {
    parentOperator = 'A3';
    parentR = state.r - state.x;
    parentY = state.x;
    parentX = state.y - 4n * state.r + 2n * state.x;
  } else {
    // Z2_A2
    parentOperator = 'A2';
    parentR = 3n * state.r - state.x - state.y;
    parentX = 2n * state.x + state.y - 4n * state.r;
    parentY = state.x + 2n * state.y - 4n * state.r;
  }

  const parentTriple: PrimitiveTripleState = Object.freeze({
    a: 2n * parentR + parentX,
    b: 2n * parentR + parentY,
    c: 2n * parentR + parentX + parentY,
    r: parentR,
    x: parentX,
    y: parentY,
  });

  assertValidPrimitiveState(parentTriple);

  // Verify exact forward reversibility
  const forwardChild = stepOperator(parentTriple, parentOperator);
  if (
    forwardChild.canonTriple.a !== state.a ||
    forwardChild.canonTriple.b !== state.b ||
    forwardChild.canonTriple.c !== state.c ||
    forwardChild.canonTriple.r !== state.r ||
    forwardChild.canonTriple.x !== state.x ||
    forwardChild.canonTriple.y !== state.y
  ) {
    throw new BerggrenFacetError(
      'INVARIANT_VIOLATION',
      `parent-child reversibility failed for (${state.a.toString()}, ${state.b.toString()}, ${state.c.toString()})`
    );
  }

  return Object.freeze({
    parentOperator,
    parentTriple,
    parentId: formatPrimId(parentR, parentX),
  });
}

/**
 * Requires a non-root primitive triple to have a parent; throws RootHasNoParentError for (3, 4, 5).
 */
export function requireBerggrenParent(state: PrimitiveTripleState): {
  readonly parentOperator: BerggrenOperator;
  readonly parentTriple: PrimitiveTripleState;
  readonly parentId: string;
} {
  const result = stepParent(state);
  if (result.parentOperator === null || result.parentTriple === null || result.parentId === null) {
    throw new RootHasNoParentError(state.a, state.b, state.c);
  }
  return Object.freeze({
    parentOperator: result.parentOperator,
    parentTriple: result.parentTriple,
    parentId: result.parentId,
  });
}

function conjugateOperator(op: BerggrenOperator): BerggrenOperator {
  if (op === 'A1') return 'A3';
  if (op === 'A3') return 'A1';
  return 'A2';
}

function operatorSwapParity(op: BerggrenOperator): 0 | 1 {
  return op === 'A1' ? 0 : 1;
}

/**
 * Converts a canonical Berggren word (with leg canonicalization a < b at each step)
 * into the classical raw Berggren word (applied directly from (3, 4, 5) without intermediate swaps).
 * Conjugates A1 <-> A3 whenever accumulated leg-swap parity is odd; A2 stays invariant.
 */
export function canonWordToRawWord(
  canonWord: readonly BerggrenOperator[]
): readonly BerggrenOperator[] {
  const rawWord: BerggrenOperator[] = [];
  let swapParity: 0 | 1 = 0;

  for (const canonOp of canonWord) {
    const rawOp = swapParity === 0 ? canonOp : conjugateOperator(canonOp);
    rawWord.push(rawOp);
    swapParity = ((swapParity + operatorSwapParity(canonOp)) & 1) as 0 | 1;
  }

  return Object.freeze(rawWord);
}

/**
 * Converts a classical raw Berggren word (applied directly from (3, 4, 5) without intermediate swaps)
 * into its unique canonical Berggren word (with a < b canonicalization at each step).
 */
export function rawWordToCanonWord(
  rawWord: readonly BerggrenOperator[]
): readonly BerggrenOperator[] {
  const canonWord: BerggrenOperator[] = [];
  let swapParity: 0 | 1 = 0;

  for (const rawOp of rawWord) {
    const canonOp = swapParity === 0 ? rawOp : conjugateOperator(rawOp);
    canonWord.push(canonOp);
    swapParity = ((swapParity + operatorSwapParity(canonOp)) & 1) as 0 | 1;
  }

  return Object.freeze(canonWord);
}

/**
 * Reconstructs the canonical primitive triple state by applying a canonWord from root (3, 4, 5).
 */
export function applyCanonWord(canonWord: readonly BerggrenOperator[]): PrimitiveTripleState {
  let current = BERGGREN_ROOT_TRIPLE;
  for (const op of canonWord) {
    current = stepOperator(current, op).canonTriple;
  }
  return current;
}

/**
 * Reconstructs the raw and canonical primitive triple by applying a rawWord from root (3, 4, 5) without intermediate swaps.
 */
export function applyRawWord(rawWord: readonly BerggrenOperator[]): {
  readonly rawTriple: RawTripleLegs;
  readonly canonTriple: PrimitiveTripleState;
  readonly legSwapped: boolean;
} {
  let a = BERGGREN_ROOT_TRIPLE.a;
  let b = BERGGREN_ROOT_TRIPLE.b;
  let c = BERGGREN_ROOT_TRIPLE.c;

  for (const op of rawWord) {
    const next = multiplyRowByBerggrenMatrix(a, b, c, op);
    a = next.a;
    b = next.b;
    c = next.c;
  }

  const rawTriple: RawTripleLegs = Object.freeze({ a, b, c });
  const legSwapped = a > b;
  const canonA = legSwapped ? b : a;
  const canonB = legSwapped ? a : b;
  const r = computeInradiusFromTriple(canonA, canonB, c);
  const canonTriple: PrimitiveTripleState = Object.freeze({
    a: canonA,
    b: canonB,
    c,
    r,
    x: canonA - 2n * r,
    y: canonB - 2n * r,
  });
  assertValidPrimitiveState(canonTriple);

  return Object.freeze({ rawTriple, canonTriple, legSwapped });
}

function statesEqual(left: PrimitiveTripleState, right: PrimitiveTripleState): boolean {
  return (
    left.a === right.a &&
    left.b === right.b &&
    left.c === right.c &&
    left.r === right.r &&
    left.x === right.x &&
    left.y === right.y
  );
}

/**
 * Computes the complete BerggrenFacetResult for a single M3 PythagoreanTriple.
 * For scaled triples (k > 1), tree computations operate on its primitiveAncestor and set appliesToPrimitiveAncestor = true.
 */
export function computeBerggrenFacetForTriple(triple: PythagoreanTriple): BerggrenFacetResult {
  const {
    tripleId,
    classId,
    primId,
    r,
    k,
    x,
    y,
    a,
    b,
    c,
    isPrimitive,
    primitiveRadius,
    primitiveAncestor: pa,
  } = triple;

  if (r <= 0n || k <= 0n || x <= 0n || y <= 0n || a <= 0n || b <= 0n || c <= 0n) {
    throw new InvalidBerggrenInputError(`non-positive dimensions in triple ${tripleId}`, 'INVALID_TRIPLE_DIMENSIONS');
  }
  if (!verifyPythagoreanIdentity(a, b, c)) {
    throw new InvalidBerggrenInputError(`Pythagorean identity failed for triple ${tripleId}`, 'INVALID_TRIPLE_DIMENSIONS');
  }
  if (!verifyCanonicalOrder(a, b, c)) {
    throw new InvalidBerggrenInputError(`canonical order a < b < c failed for triple ${tripleId}`, 'NON_CANONICAL_ORDER');
  }
  if (x * y !== 2n * r * r || a !== 2n * r + x || b !== 2n * r + y || c !== 2n * r + x + y) {
    throw new InvalidBerggrenInputError(`hyperbola identity failed for triple ${tripleId}`, 'INVALID_HYPERBOLA_IDENTITY');
  }
  const actualK = gcdBigInt(gcdBigInt(a, b), c);
  if (actualK !== k || isPrimitive !== (k === 1n) || primitiveRadius * k !== r) {
    throw new InvalidBerggrenInputError(`inconsistent scale factor k for triple ${tripleId}`, 'INVALID_TRIPLE_DIMENSIONS');
  }
  if (
    pa.a * k !== a ||
    pa.b * k !== b ||
    pa.c * k !== c ||
    pa.x * k !== x ||
    pa.y * k !== y
  ) {
    throw new InvalidBerggrenInputError(`inconsistent primitiveAncestor for triple ${tripleId}`, 'INVALID_TRIPLE_DIMENSIONS');
  }

  const primitiveAncestor: PrimitiveTripleState = Object.freeze({
    a: pa.a,
    b: pa.b,
    c: pa.c,
    r: primitiveRadius,
    x: pa.x,
    y: pa.y,
  });
  assertValidPrimitiveState(primitiveAncestor);

  const expectedPrimId = formatPrimId(primitiveRadius, pa.x);
  if (primId !== expectedPrimId) {
    throw new InvalidBerggrenInputError(
      `primId mismatch: expected ${expectedPrimId}, got ${primId}`,
      'INVALID_TRIPLE_DIMENSIONS'
    );
  }

  // Descend to root (3, 4, 5) to recover canonWord, parentOperator, parentId
  const reversedOperators: BerggrenOperator[] = [];
  let cursor: PrimitiveTripleState = primitiveAncestor;
  let immediateParentOperator: BerggrenOperator | null = null;
  let immediateParentId: string | null = null;
  let steps = 0n;

  while (true) {
    const parentInfo = stepParent(cursor);
    if (parentInfo.parentOperator === null || parentInfo.parentTriple === null) {
      break;
    }
    if (steps === 0n) {
      immediateParentOperator = parentInfo.parentOperator;
      immediateParentId = parentInfo.parentId;
    }
    reversedOperators.push(parentInfo.parentOperator);
    cursor = parentInfo.parentTriple;
    steps += 1n;

    if (steps > primitiveAncestor.r) {
      throw new BerggrenFacetError(
        'INVARIANT_VIOLATION',
        `parent descent exceeded upper bound r0=${primitiveAncestor.r.toString()} for ${tripleId}`
      );
    }
  }

  const canonWord = Object.freeze([...reversedOperators].reverse());
  const rawWord = canonWordToRawWord(canonWord);
  const treeDepth = BigInt(canonWord.length);
  const isRoot = treeDepth === 0n;

  const children = Object.freeze({
    A1: stepA1(primitiveAncestor),
    A2: stepA2(primitiveAncestor),
    A3: stepA3(primitiveAncestor),
  });

  const result: BerggrenFacetResult = Object.freeze({
    tripleId,
    classId,
    primId,
    r,
    k,
    isPrimitive,
    appliesToPrimitiveAncestor: !isPrimitive,
    primitiveAncestor,
    isRoot,
    canonWord,
    rawWord,
    treeDepth,
    parentOperator: immediateParentOperator,
    parentId: immediateParentId,
    children,
  });

  verifyBerggrenFacetInvariants(result);
  return result;
}

/**
 * Computes BerggrenFacet results for an entire M3 RadiusClassificationResult, enforcing strict completeness.
 */
export function computeBerggrenFacetsForClass(
  classification: RadiusClassificationResult
): readonly BerggrenFacetResult[] {
  const status = (classification as { readonly status?: unknown }).status;
  if (
    !classification.isComplete ||
    (status !== undefined && status !== 'COMPLETE') ||
    classification.allTriples.length === 0 ||
    BigInt(classification.allTriples.length) !== classification.totalTriplesCount ||
    classification.totalTriplesCount !== classification.expectedTotalCount
  ) {
    throw new IncompleteClassificationError(classification.r, 'BerggrenFacet');
  }

  return Object.freeze(
    classification.allTriples.map((triple) => computeBerggrenFacetForTriple(triple))
  );
}

/**
 * Independently verifies BF-INV-01 through BF-INV-06 on a BerggrenFacetResult.
 */
export function verifyBerggrenFacetInvariants(facet: BerggrenFacetResult): void {
  const pa = facet.primitiveAncestor;
  const r0 = pa.r;
  const x0 = pa.x;
  const y0 = pa.y;

  // BF-INV-03 (ancestor): gcd(a0, b0, c0) === 1
  if (gcdBigInt(gcdBigInt(pa.a, pa.b), pa.c) !== 1n) {
    throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-03 failed: ancestor not primitive for ${facet.tripleId}`);
  }

  // Verify scaled-triple inheritance consistency
  if (facet.appliesToPrimitiveAncestor !== !facet.isPrimitive || facet.k * r0 !== facet.r) {
    throw new BerggrenFacetError('INVARIANT_VIOLATION', `Scaled-triple inheritance flag/radius mismatch for ${facet.tripleId}`);
  }

  const { A1, A2, A3 } = facet.children;

  // BF-INV-01: Exact radius transitions for all three operators
  if (
    A1.canonTriple.r !== r0 + x0 ||
    A2.canonTriple.r !== 3n * r0 + x0 + y0 ||
    A3.canonTriple.r !== r0 + y0
  ) {
    throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-01 failed: child radius transition mismatch for ${facet.tripleId}`);
  }

  // BF-INV-02 & BF-INV-03 for all three children
  for (const child of [A1, A2, A3]) {
    const ct = child.canonTriple;
    if (
      ct.x < 1n ||
      ct.x >= ct.y ||
      ct.x * ct.y !== 2n * ct.r * ct.r ||
      !verifyPythagoreanIdentity(ct.a, ct.b, ct.c) ||
      !verifyCanonicalOrder(ct.a, ct.b, ct.c)
    ) {
      throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-02 failed on child ${child.operator} for ${facet.tripleId}`);
    }
    if (gcdBigInt(gcdBigInt(ct.a, ct.b), ct.c) !== 1n) {
      throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-03 failed: child ${child.operator} not primitive for ${facet.tripleId}`);
    }
  }

  // BF-INV-04: Sporn-zone correspondence and exact rational f1, f2, f3 transitions
  if (A1.spornZone !== 'Z1_A1' || A1.legSwapped !== false) {
    throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-04 failed on A1 for ${facet.tripleId}`);
  }
  if (A2.spornZone !== 'Z2_A2' || A2.legSwapped !== true) {
    throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-04 failed on A2 for ${facet.tripleId}`);
  }
  if (A3.spornZone !== 'Z3_A3' || A3.legSwapped !== true) {
    throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-04 failed on A3 for ${facet.tripleId}`);
  }

  const t = createRational(x0, r0);
  const f1Expected = divRational(t, addRational(RATIONAL_ONE, t));
  const f2Expected = divRational(
    mulRational(RATIONAL_TWO, addRational(t, RATIONAL_ONE)),
    addRational(t, RATIONAL_TWO)
  );
  const f3Expected = divRational(RATIONAL_TWO, addRational(t, RATIONAL_TWO));

  if (
    !eqRational(A1.spornX, f1Expected) ||
    !eqRational(A2.spornX, f2Expected) ||
    !eqRational(A3.spornX, f3Expected)
  ) {
    throw new BerggrenFacetError(
      'INVARIANT_VIOLATION',
      `BF-INV-04 failed: exact fractional-linear Sporn transition mismatch for ${facet.tripleId}`
    );
  }

  // BF-INV-05: Parent-child reversibility & word reconstruction
  for (const child of [A1, A2, A3]) {
    const back = stepParent(child.canonTriple);
    if (
      back.parentOperator !== child.operator ||
      back.parentTriple === null ||
      !statesEqual(back.parentTriple, pa)
    ) {
      throw new BerggrenFacetError(
        'INVARIANT_VIOLATION',
        `BF-INV-05 failed: child ${child.operator} did not revert to parent for ${facet.tripleId}`
      );
    }
  }

  if (facet.isRoot) {
    if (
      !statesEqual(pa, BERGGREN_ROOT_TRIPLE) ||
      facet.parentOperator !== null ||
      facet.parentId !== null ||
      facet.treeDepth !== 0n ||
      facet.canonWord.length !== 0 ||
      facet.rawWord.length !== 0
    ) {
      throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-05 failed: invalid root state for ${facet.tripleId}`);
    }
  } else {
    const parentInfo = stepParent(pa);
    if (
      parentInfo.parentOperator !== facet.parentOperator ||
      parentInfo.parentId !== facet.parentId ||
      parentInfo.parentTriple === null
    ) {
      throw new BerggrenFacetError('INVARIANT_VIOLATION', `BF-INV-05 failed: parent mismatch for ${facet.tripleId}`);
    }
  }

  const rebuiltCanon = applyCanonWord(facet.canonWord);
  const rebuiltRaw = applyRawWord(facet.rawWord).canonTriple;
  if (!statesEqual(rebuiltCanon, pa) || !statesEqual(rebuiltRaw, pa)) {
    throw new BerggrenFacetError(
      'INVARIANT_VIOLATION',
      `BF-INV-05 failed: word reconstruction mismatch for ${facet.tripleId}`
    );
  }

  const roundTripCanon = rawWordToCanonWord(facet.rawWord);
  if (
    roundTripCanon.length !== facet.canonWord.length ||
    roundTripCanon.some((op, idx) => op !== facet.canonWord[idx])
  ) {
    throw new BerggrenFacetError(
      'INVARIANT_VIOLATION',
      `BF-INV-05 failed: rawWordToCanonWord inverse check failed for ${facet.tripleId}`
    );
  }

  // BF-INV-06: Tree-depth bound 0 <= treeDepth <= r0 - 1
  if (
    facet.treeDepth < 0n ||
    facet.treeDepth > r0 - 1n ||
    BigInt(facet.canonWord.length) !== facet.treeDepth ||
    BigInt(facet.rawWord.length) !== facet.treeDepth
  ) {
    throw new BerggrenFacetError(
      'INVARIANT_VIOLATION',
      `BF-INV-06 failed: treeDepth=${facet.treeDepth.toString()} out of [0, ${(r0 - 1n).toString()}] for ${facet.tripleId}`
    );
  }
  if (x0 === 1n && facet.treeDepth !== r0 - 1n) {
    throw new BerggrenFacetError(
      'INVARIANT_VIOLATION',
      `BF-INV-06 boundary failed: x0=1 series must have depth r0-1=${(r0 - 1n).toString()}, got ${facet.treeDepth.toString()}`
    );
  }
}
