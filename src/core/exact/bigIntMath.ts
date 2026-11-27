/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  ExactDivisionByZeroError,
  ExactDivisibilityError,
  InvalidBigIntInputError,
  NotPerfectSquareError,
} from './errors.ts';

export type BigIntOrdering = -1 | 0 | 1;

export interface BigIntDivMod {
  readonly quotient: bigint;
  readonly remainder: bigint;
}

const STRICT_INT_STRING_RE = /^[+-]?\d+$/;

/**
 * Validates that a runtime value is a native bigint.
 */
export function assertBigInt(value: unknown, paramName = 'value'): bigint {
  if (typeof value !== 'bigint') {
    throw new InvalidBigIntInputError(paramName, `expected bigint, received ${typeof value}`);
  }
  return value;
}

export function assertPositiveBigInt(value: unknown, paramName = 'value'): bigint {
  const v = assertBigInt(value, paramName);
  if (v <= 0n) {
    throw new InvalidBigIntInputError(paramName, `expected integer > 0, received ${v.toString()}`);
  }
  return v;
}

export function assertNonNegativeBigInt(value: unknown, paramName = 'value'): bigint {
  const v = assertBigInt(value, paramName);
  if (v < 0n) {
    throw new InvalidBigIntInputError(paramName, `expected integer >= 0, received ${v.toString()}`);
  }
  return v;
}

export function assertNonZeroBigInt(value: unknown, paramName = 'value'): bigint {
  const v = assertBigInt(value, paramName);
  if (v === 0n) {
    throw new ExactDivisionByZeroError(`parameter "${paramName}" must be non-zero`);
  }
  return v;
}

/**
 * Parses a decimal integer string strictly into a bigint without touching IEEE-754 number.
 */
export function parseIntegerBigInt(raw: string, paramName = 'value'): bigint {
  if (typeof raw !== 'string') {
    throw new InvalidBigIntInputError(paramName, `expected string, received ${typeof raw}`);
  }
  const trimmed = raw.trim();
  if (!STRICT_INT_STRING_RE.test(trimmed)) {
    throw new InvalidBigIntInputError(paramName, `expected strict decimal integer string, received "${raw}"`);
  }
  return BigInt(trimmed);
}

export function absBigInt(value: bigint): bigint {
  const v = assertBigInt(value, 'value');
  return v < 0n ? -v : v;
}

export function signBigInt(value: bigint): BigIntOrdering {
  const v = assertBigInt(value, 'value');
  if (v < 0n) return -1;
  if (v > 0n) return 1;
  return 0;
}

export function cmpBigInt(a: bigint, b: bigint): BigIntOrdering {
  const x = assertBigInt(a, 'a');
  const y = assertBigInt(b, 'b');
  if (x < y) return -1;
  if (x > y) return 1;
  return 0;
}

export function eqBigInt(a: bigint, b: bigint): boolean {
  return assertBigInt(a, 'a') === assertBigInt(b, 'b');
}

export function minBigInt(a: bigint, b: bigint): bigint {
  const x = assertBigInt(a, 'a');
  const y = assertBigInt(b, 'b');
  return x <= y ? x : y;
}

export function maxBigInt(a: bigint, b: bigint): bigint {
  const x = assertBigInt(a, 'a');
  const y = assertBigInt(b, 'b');
  return x >= y ? x : y;
}

export function isEvenBigInt(value: bigint): boolean {
  return (assertBigInt(value, 'value') & 1n) === 0n;
}

export function isOddBigInt(value: bigint): boolean {
  return (assertBigInt(value, 'value') & 1n) === 1n;
}

/**
 * Computes truncating integer quotient and remainder with explicit zero-divisor protection.
 */
export function divModBigInt(dividend: bigint, divisor: bigint): BigIntDivMod {
  const a = assertBigInt(dividend, 'dividend');
  const b = assertNonZeroBigInt(divisor, 'divisor');
  const quotient = a / b;
  const remainder = a % b;
  return { quotient, remainder };
}

/**
 * Checks exact divisibility (divisor | dividend). Returns false for divisor === 0n or throws?
 * Throws ExactDivisionByZeroError if divisor === 0n to prevent silent undefined math.
 */
export function isDivisibleBigInt(dividend: bigint, divisor: bigint): boolean {
  const a = assertBigInt(dividend, 'dividend');
  const b = assertNonZeroBigInt(divisor, 'divisor');
  return a % b === 0n;
}

/**
 * Divides dividend by divisor only when remainder is strictly 0n.
 */
export function exactDivBigInt(dividend: bigint, divisor: bigint): bigint {
  const a = assertBigInt(dividend, 'dividend');
  const b = assertNonZeroBigInt(divisor, 'divisor');
  const remainder = a % b;
  if (remainder !== 0n) {
    throw new ExactDivisibilityError(a, b);
  }
  return a / b;
}

/**
 * Exact non-negative greatest common divisor gcd(|a|, |b|).
 * Follows standard convention gcd(0, 0) = 0, gcd(a, 0) = |a|.
 */
export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = absBigInt(assertBigInt(a, 'a'));
  let y = absBigInt(assertBigInt(b, 'b'));
  while (y !== 0n) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}

/**
 * Exact non-negative least common multiple lcm(|a|, |b|).
 * Returns 0n if either argument is 0n.
 */
export function lcmBigInt(a: bigint, b: bigint): bigint {
  const x = absBigInt(assertBigInt(a, 'a'));
  const y = absBigInt(assertBigInt(b, 'b'));
  if (x === 0n || y === 0n) return 0n;
  return (x / gcdBigInt(x, y)) * y;
}

/**
 * Exact integer exponentiation (base ^ exp) for exp >= 0n.
 */
export function powBigInt(base: bigint, exp: bigint): bigint {
  let b = assertBigInt(base, 'base');
  let e = assertNonNegativeBigInt(exp, 'exp');
  let result = 1n;
  while (e > 0n) {
    if ((e & 1n) === 1n) {
      result *= b;
    }
    e >>= 1n;
    if (e > 0n) {
      b *= b;
    }
  }
  return result;
}

/**
 * Exact floor(sqrt(n)) computed purely via BigInt Newton's method.
 * Never uses Math.sqrt or IEEE-754 floating-point numbers.
 */
export function isqrtBigInt(n: bigint): bigint {
  const value = assertNonNegativeBigInt(n, 'n');
  if (value === 0n || value === 1n) return value;

  const bitLength = BigInt(value.toString(2).length);
  let x = 1n << ((bitLength + 1n) >> 1n);
  let y = (x + value / x) >> 1n;

  while (y < x) {
    x = y;
    y = (x + value / x) >> 1n;
  }

  return x;
}

/**
 * Checks whether n is an exact integer square without floating-point approximation.
 */
export function isPerfectSquareBigInt(n: bigint): boolean {
  const value = assertBigInt(n, 'n');
  if (value < 0n) return false;
  const root = isqrtBigInt(value);
  return root * root === value;
}

/**
 * Returns the non-negative integer square root of n if and only if n is a perfect square.
 */
export function exactSqrtBigInt(n: bigint): bigint {
  const value = assertNonNegativeBigInt(n, 'n');
  const root = isqrtBigInt(value);
  if (root * root !== value) {
    throw new NotPerfectSquareError(value);
  }
  return root;
}
