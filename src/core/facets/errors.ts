/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export class SpornFacetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpornFacetError';
  }
}

export class IncompleteClassificationError extends SpornFacetError {
  readonly code = 'INCOMPLETE_CLASSIFICATION_RESULT' as const;

  constructor(r: bigint, facetName = 'SpornFacet') {
    super(`Cannot build ${facetName} for r=${r.toString()}: M3 classification result is incomplete`);
    this.name = 'IncompleteClassificationError';
  }
}

export class InvalidSpornInputError extends SpornFacetError {
  constructor(message: string) {
    super(`Invalid input for SpornFacet: ${message}`);
    this.name = 'InvalidSpornInputError';
  }
}

export type BerggrenFacetErrorCode =
  | 'INCOMPLETE_CLASSIFICATION_RESULT'
  | 'INVALID_TRIPLE_DIMENSIONS'
  | 'INVALID_HYPERBOLA_IDENTITY'
  | 'NON_CANONICAL_ORDER'
  | 'NON_PRIMITIVE_TRIPLE'
  | 'ROOT_HAS_NO_PARENT'
  | 'INVARIANT_VIOLATION';

export class BerggrenFacetError extends Error {
  readonly code: BerggrenFacetErrorCode;

  constructor(code: BerggrenFacetErrorCode, message: string) {
    super(message);
    this.name = 'BerggrenFacetError';
    this.code = code;
  }
}

export class InvalidBerggrenInputError extends BerggrenFacetError {
  constructor(
    message: string,
    code: BerggrenFacetErrorCode = 'INVALID_TRIPLE_DIMENSIONS'
  ) {
    super(code, `Invalid input for BerggrenFacet: ${message}`);
    this.name = 'InvalidBerggrenInputError';
  }
}

export class RootHasNoParentError extends BerggrenFacetError {
  constructor(a: bigint, b: bigint, c: bigint) {
    super(
      'ROOT_HAS_NO_PARENT',
      `Root triple (${a.toString()}, ${b.toString()}, ${c.toString()}) has no parent in the Berggren tree`
    );
    this.name = 'RootHasNoParentError';
  }
}

export type ClassProfileErrorCode =
  | 'INCOMPLETE_CLASSIFICATION_RESULT'
  | 'INVALID_RADIUS'
  | 'FACET_COUNT_MISMATCH'
  | 'TRIPLE_ID_MISMATCH'
  | 'DUPLICATE_TRIPLE_ID'
  | 'CLASS_ID_MISMATCH'
  | 'PRIMITIVE_SET_EMPTY'
  | 'INVARIANT_VIOLATION';

export class ClassProfileFacetError extends Error {
  readonly code: ClassProfileErrorCode;

  constructor(code: ClassProfileErrorCode, message: string) {
    super(message);
    this.name = 'ClassProfileFacetError';
    this.code = code;
  }
}
