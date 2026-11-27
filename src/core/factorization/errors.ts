/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { ExactArithmeticError } from '../exact/index.ts';

/**
 * Base error class for M2 — Number Theory Engine failures.
 */
export class FactorizationError extends ExactArithmeticError {
  constructor(message: string) {
    super(message);
    this.name = 'FactorizationError';
  }
}

export class InvalidFactorizationInputError extends FactorizationError {
  readonly paramName: string;

  constructor(paramName: string, detail: string) {
    super(`Invalid factorization input "${paramName}": ${detail}`);
    this.name = 'InvalidFactorizationInputError';
    this.paramName = paramName;
  }
}

export class IncompleteFactorizationError extends FactorizationError {
  readonly targetValue: bigint;

  constructor(targetValue: bigint, detail: string) {
    super(`Factorization of ${targetValue.toString()} is incomplete: ${detail}`);
    this.name = 'IncompleteFactorizationError';
    this.targetValue = targetValue;
  }
}

export class CombinatorialLimitError extends FactorizationError {
  readonly expectedCount: bigint;
  readonly limit: bigint;

  constructor(expectedCount: bigint, limit: bigint) {
    super(
      `Combinatorial enumeration limit exceeded: required ${expectedCount.toString()} items, limit is ${limit.toString()}`
    );
    this.name = 'CombinatorialLimitError';
    this.expectedCount = expectedCount;
    this.limit = limit;
  }
}
