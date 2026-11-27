/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { gcdBigInt, isqrtBigInt } from '../exact/index.ts';
import { EuclideanRecoveryError } from './errors.ts';
import type { EuclideanParameters } from './types.ts';

/**
 * Recovers Euclidean parameters (m, n, u, v) from primitive hyperbola components (x0, y0).
 * Validates exact integer square roots, parity, m > n > 0, and gcd(m, n) = 1.
 */
export function recoverEuclideanParameters(x0: bigint, y0: bigint): EuclideanParameters {
  if (x0 <= 0n || y0 <= 0n) {
    throw new EuclideanRecoveryError(
      0n,
      0n,
      0n,
      `primitive x0=${x0.toString()} and y0=${y0.toString()} must be positive`
    );
  }

  const isXOdd = x0 % 2n !== 0n;
  const isYOdd = y0 % 2n !== 0n;

  if (isXOdd === isYOdd) {
    throw new EuclideanRecoveryError(
      0n,
      0n,
      0n,
      `primitive x0=${x0.toString()} and y0=${y0.toString()} must have opposite parity (one odd, one even)`
    );
  }

  let oddVal: bigint;
  let evenVal: bigint;
  if (isXOdd) {
    oddVal = x0;
    evenVal = y0;
  } else {
    oddVal = y0;
    evenVal = x0;
  }

  const vSquared = oddVal;
  const v = isqrtBigInt(vSquared);
  if (v * v !== vSquared) {
    throw new EuclideanRecoveryError(0n, 0n, 0n, `odd value ${oddVal.toString()} is not a square`);
  }

  if (evenVal % 2n !== 0n) {
    throw new EuclideanRecoveryError(
      0n,
      0n,
      0n,
      `even value ${evenVal.toString()} is not divisible by 2`
    );
  }
  const uSquared = evenVal / 2n;
  const u = isqrtBigInt(uSquared);
  if (u * u !== uSquared) {
    throw new EuclideanRecoveryError(0n, 0n, 0n, `u^2 value ${uSquared.toString()} is not a square`);
  }

  const n = u;
  const m = u + v;

  if (m <= n || n <= 0n) {
    throw new EuclideanRecoveryError(
      0n,
      0n,
      0n,
      `invalid parameter relationship m=${m.toString()}, n=${n.toString()} (must have m > n > 0)`
    );
  }

  if (gcdBigInt(m, n) !== 1n) {
    throw new EuclideanRecoveryError(
      0n,
      0n,
      0n,
      `gcd(m, n) must be 1, got gcd(${m.toString()}, ${n.toString()}) = ${gcdBigInt(m, n).toString()}`
    );
  }

  if ((m + n) % 2n === 0n) {
    throw new EuclideanRecoveryError(
      0n,
      0n,
      0n,
      `m and n must have opposite parity, got m=${m.toString()}, n=${n.toString()}`
    );
  }

  return { m, n, u, v };
}
