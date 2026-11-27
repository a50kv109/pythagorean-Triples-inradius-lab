/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { exactDivBigInt, powBigInt } from '../exact/index.ts';
import { IncompleteFactorizationError } from './errors.ts';
import type { ArithmeticCounters, CanonicalFactorization } from './types.ts';

/**
 * Computes exact arithmetic counters purely in BigInt from a complete radius factorization:
 * - omega*(r): number of distinct odd prime factors of r
 * - tau(r): (e_0 + 1) * prod(e_i + 1)
 * - tau(2r^2): (2e_0 + 2) * prod(2e_i + 1)
 * - T(r) = 2^{omega*(r)} (primitive triple count)
 * - N(r) = tau(2r^2) / 2 = (e_0 + 1) * prod(2e_i + 1) (total triple count)
 */
export function computeArithmeticCounters(
  rFactorization: CanonicalFactorization
): ArithmeticCounters {
  if (!rFactorization.isComplete) {
    throw new IncompleteFactorizationError(
      rFactorization.value,
      'cannot compute omega*(r), T(r), N(r) from an incomplete factorization'
    );
  }

  const omegaStar = BigInt(rFactorization.oddPrimeFactors.length);
  const e0 = rFactorization.twoExponent;

  let tauR = e0 + 1n;
  let oddSquaredFactorProduct = 1n;

  for (const factor of rFactorization.oddPrimeFactors) {
    tauR *= factor.exponent + 1n;
    oddSquaredFactorProduct *= 2n * factor.exponent + 1n;
  }

  const tauTwoRSquared = (2n * e0 + 2n) * oddSquaredFactorProduct;
  const T = powBigInt(2n, omegaStar);
  const N = exactDivBigInt(tauTwoRSquared, 2n);

  return {
    omegaStar,
    tauR,
    tauTwoRSquared,
    T,
    N,
  };
}
