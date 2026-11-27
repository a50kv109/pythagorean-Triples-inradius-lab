/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertPositiveBigInt,
  cmpBigInt,
  isDivisibleBigInt,
} from '../exact/index.ts';
import {
  CombinatorialLimitError,
  IncompleteFactorizationError,
} from './errors.ts';
import type { CanonicalFactorization } from './types.ts';

export const DEFAULT_MAX_DIVISOR_ENUMERATION_COUNT = 500_000n;

/**
 * Computes the exact divisor count tau(n) = prod(e_i + 1) from a complete factorization.
 * Throws IncompleteFactorizationError if the factorization is incomplete.
 */
export function countDivisorsFromFactorization(
  factorization: CanonicalFactorization
): bigint {
  if (!factorization.isComplete) {
    throw new IncompleteFactorizationError(
      factorization.value,
      'cannot compute exact divisor count tau(n) from an incomplete factorization'
    );
  }

  let count = 1n;
  for (const factor of factorization.primeFactors) {
    count *= factor.exponent + 1n;
  }
  return count;
}

/**
 * Generates all positive divisors of n from a complete canonical factorization,
 * sorted in strictly ascending BigInt order, with divisibility and count verification.
 */
export function generateDivisorsFromFactorization(
  factorization: CanonicalFactorization,
  maxDivisorCount: bigint = DEFAULT_MAX_DIVISOR_ENUMERATION_COUNT
): readonly bigint[] {
  const limit = assertPositiveBigInt(maxDivisorCount, 'maxDivisorCount');

  if (!factorization.isComplete) {
    throw new IncompleteFactorizationError(
      factorization.value,
      'cannot enumerate complete divisor list from an incomplete factorization'
    );
  }

  const expectedCount = countDivisorsFromFactorization(factorization);
  if (expectedCount > limit) {
    throw new CombinatorialLimitError(expectedCount, limit);
  }

  let divisors: bigint[] = [1n];

  for (const factor of factorization.primeFactors) {
    const nextDivisors: bigint[] = [];
    let primePower = 1n;

    for (let e = 0n; e <= factor.exponent; e += 1n) {
      for (const existing of divisors) {
        nextDivisors.push(existing * primePower);
      }
      if (e < factor.exponent) {
        primePower *= factor.prime;
      }
    }

    divisors = nextDivisors;
  }

  divisors.sort(cmpBigInt);

  verifyDivisorsComplete(factorization.value, divisors, expectedCount);

  return divisors;
}

/**
 * Verifies exact count, strict ascending uniqueness (no duplicates),
 * and exact divisibility d | n for every divisor.
 */
export function verifyDivisorsComplete(
  n: bigint,
  divisors: readonly bigint[],
  expectedCount?: bigint
): void {
  const vn = assertPositiveBigInt(n, 'n');
  if (expectedCount !== undefined && BigInt(divisors.length) !== expectedCount) {
    throw new IncompleteFactorizationError(
      vn,
      `divisor count mismatch: expected ${expectedCount.toString()}, generated ${divisors.length.toString()}`
    );
  }

  let prev = 0n;
  for (const d of divisors) {
    if (d <= prev) {
      throw new IncompleteFactorizationError(
        vn,
        `divisors are not strictly ascending or contain duplicate at ${d.toString()}`
      );
    }
    if (!isDivisibleBigInt(vn, d)) {
      throw new IncompleteFactorizationError(
        vn,
        `generated divisor ${d.toString()} does not divide ${vn.toString()}`
      );
    }
    prev = d;
  }
}
