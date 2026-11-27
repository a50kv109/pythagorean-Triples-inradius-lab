/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertPositiveRadius,
  computeTwoRSquared,
  exactDivBigInt,
  verifyHyperbolaIdentity,
} from '../exact/index.ts';
import { IncompleteFactorizationError } from './errors.ts';
import { factorizeBigInt, liftRadiusFactorizationToTwoRSquared } from './primeFactorization.ts';
import { countDivisorsFromFactorization } from './divisors.ts';
import type { HyperbolaDivisorPair } from './types.ts';

/**
 * Builds the complete, deduplicated, ascending-by-x set of canonical hyperbola divisor pairs (x, y):
 *   x * y = 2r^2
 *   1 <= x < sqrt(2)*r < y <= 2r^2  (verified purely in BigInt via x^2 < 2r^2 and y^2 > 2r^2).
 */
export function buildHyperbolaDivisorPairs(
  r: bigint,
  twoRSquaredDivisors: readonly bigint[]
): readonly HyperbolaDivisorPair[] {
  const validR = assertPositiveRadius(r);
  const twoR2 = computeTwoRSquared(validR);

  // Exact standalone completeness validation against r factorization
  const rFact = factorizeBigInt(validR);
  if (!rFact.isComplete) {
    throw new IncompleteFactorizationError(
      validR,
      'cannot build hyperbola pairs from incomplete r factorization'
    );
  }
  const twoRSquaredFact = liftRadiusFactorizationToTwoRSquared(validR, rFact);
  const expectedDivCount = countDivisorsFromFactorization(twoRSquaredFact.factorization);
  if (BigInt(twoRSquaredDivisors.length) !== expectedDivCount) {
    throw new IncompleteFactorizationError(
      twoR2,
      `hyperbola divisor list is incomplete: expected ${expectedDivCount.toString()} divisors, received ${twoRSquaredDivisors.length.toString()}`
    );
  }

  let lastDiv = 0n;
  for (const x of twoRSquaredDivisors) {
    if (x <= 0n) {
      throw new IncompleteFactorizationError(
        twoR2,
        `divisor ${x.toString()} must be positive`
      );
    }
    if (twoR2 % x !== 0n) {
      throw new IncompleteFactorizationError(
        twoR2,
        `divisor ${x.toString()} does not divide 2r^2 (${twoR2.toString()})`
      );
    }
    if (x <= lastDiv) {
      throw new IncompleteFactorizationError(
        twoR2,
        `divisors must be in strict ascending order and unique, got x=${x.toString()} after prev=${lastDiv.toString()}`
      );
    }
    lastDiv = x;
  }

  const pairs: HyperbolaDivisorPair[] = [];
  const seenX = new Set<bigint>();
  let prevX = 0n;

  for (const x of twoRSquaredDivisors) {
    // Only take lower-branch divisors where x^2 < 2r^2
    if (x * x >= twoR2) {
      continue;
    }

    const y = exactDivBigInt(twoR2, x);

    if (!verifyHyperbolaIdentity(validR, x, y)) {
      throw new IncompleteFactorizationError(
        twoR2,
        `pair (${x.toString()}, ${y.toString()}) failed exact hyperbola identity for r=${validR.toString()}`
      );
    }

    if (seenX.has(x) || x <= prevX) {
      throw new IncompleteFactorizationError(
        twoR2,
        `duplicate or unsorted hyperbola pair x=${x.toString()}`
      );
    }

    seenX.add(x);
    prevX = x;
    pairs.push({ x, y });
  }

  // Every divisor of 2r^2 pairs bijectively into (x, y) since 2r^2 is never a square
  if (BigInt(pairs.length) * 2n !== BigInt(twoRSquaredDivisors.length)) {
    throw new IncompleteFactorizationError(
      twoR2,
      `hyperbola pair count mismatch: got ${pairs.length.toString()} pairs from ${twoRSquaredDivisors.length.toString()} divisors`
    );
  }

  return pairs;
}
