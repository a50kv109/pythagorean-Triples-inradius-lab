/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertBigInt,
  assertNonNegativeBigInt,
  assertPositiveBigInt,
} from '../exact/index.ts';

/**
 * Normalizes a mod m into [0n, m - 1n] purely in BigInt.
 */
export function modNormalizeBigInt(a: bigint, mod: bigint): bigint {
  const va = assertBigInt(a, 'a');
  const vm = assertPositiveBigInt(mod, 'mod');
  const r = va % vm;
  return r < 0n ? r + vm : r;
}

/**
 * Exact modular addition (a + b) mod m in BigInt.
 */
export function modAddBigInt(a: bigint, b: bigint, mod: bigint): bigint {
  const vm = assertPositiveBigInt(mod, 'mod');
  const na = modNormalizeBigInt(a, vm);
  const nb = modNormalizeBigInt(b, vm);
  const sum = na + nb;
  return sum >= vm ? sum - vm : sum;
}

/**
 * Exact modular multiplication (a * b) mod m in BigInt without overflow.
 */
export function modMulBigInt(a: bigint, b: bigint, mod: bigint): bigint {
  const vm = assertPositiveBigInt(mod, 'mod');
  const na = modNormalizeBigInt(a, vm);
  const nb = modNormalizeBigInt(b, vm);
  return (na * nb) % vm;
}

/**
 * Exact modular exponentiation (base^exp mod m) using binary square-and-multiply in BigInt.
 */
export function modPowBigInt(base: bigint, exp: bigint, mod: bigint): bigint {
  const vb = assertBigInt(base, 'base');
  let e = assertNonNegativeBigInt(exp, 'exp');
  const vm = assertPositiveBigInt(mod, 'mod');

  if (vm === 1n) {
    return 0n;
  }

  let result = 1n;
  let b = modNormalizeBigInt(vb, vm);

  while (e > 0n) {
    if ((e & 1n) === 1n) {
      result = (result * b) % vm;
    }
    e >>= 1n;
    if (e > 0n) {
      b = (b * b) % vm;
    }
  }

  return result;
}
