/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertBigInt,
  gcdBigInt,
  parseIntegerBigInt,
  powBigInt,
} from './bigIntMath.ts';
import {
  ExactArithmeticError,
  ExactDivisionByZeroError,
  InvalidBigIntInputError,
} from './errors.ts';

/**
 * Canonical normalized exact rational number num / den:
 * - den > 0n strictly (sign is always carried by num);
 * - gcd(|num|, den) === 1n;
 * - zero is uniquely represented as { num: 0n, den: 1n }.
 */
export interface ExactRational {
  readonly num: bigint;
  readonly den: bigint;
}

export const RATIONAL_ZERO: ExactRational = Object.freeze({ num: 0n, den: 1n });
export const RATIONAL_ONE: ExactRational = Object.freeze({ num: 1n, den: 1n });

function assertRationalObject(q: unknown, paramName = 'q'): ExactRational {
  if (typeof q !== 'object' || q === null) {
    throw new ExactArithmeticError(`Invalid ExactRational "${paramName}": expected object`);
  }
  const candidate = q as { num?: unknown; den?: unknown };
  if (typeof candidate.num !== 'bigint' || typeof candidate.den !== 'bigint') {
    throw new ExactArithmeticError(
      `Invalid ExactRational "${paramName}": numerator and denominator must be bigint`
    );
  }
  if (candidate.den === 0n) {
    throw new ExactDivisionByZeroError(`ExactRational "${paramName}" has zero denominator`);
  }
  return createRational(candidate.num, candidate.den);
}

/**
 * Constructs and normalizes an ExactRational num / den.
 * Normalizes denominator sign (> 0n) and reduces by gcd(|num|, |den|).
 */
export function createRational(num: bigint, den: bigint = 1n): ExactRational {
  const nRaw = assertBigInt(num, 'num');
  const dRaw = assertBigInt(den, 'den');

  if (dRaw === 0n) {
    throw new ExactDivisionByZeroError('ExactRational denominator cannot be 0n');
  }
  if (nRaw === 0n) {
    return RATIONAL_ZERO;
  }

  const sign = dRaw < 0n ? -1n : 1n;
  const nSigned = nRaw * sign;
  const dPos = dRaw * sign;
  const divisor = gcdBigInt(nSigned, dPos);

  return Object.freeze({
    num: nSigned / divisor,
    den: dPos / divisor,
  });
}

export function rationalFromBigInt(value: bigint): ExactRational {
  return createRational(assertBigInt(value, 'value'), 1n);
}

/**
 * Parses an integer string ("-5") or fraction string ("-10/15") into normalized ExactRational.
 * Rejects floating-point notation or malformed inputs.
 */
export function parseRational(raw: string, paramName = 'q'): ExactRational {
  if (typeof raw !== 'string') {
    throw new InvalidBigIntInputError(paramName, `expected string, received ${typeof raw}`);
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new InvalidBigIntInputError(paramName, 'empty rational string');
  }
  const parts = trimmed.split('/');
  if (parts.length === 1) {
    return createRational(parseIntegerBigInt(parts[0], `${paramName}.num`), 1n);
  }
  if (parts.length === 2) {
    const num = parseIntegerBigInt(parts[0], `${paramName}.num`);
    const den = parseIntegerBigInt(parts[1], `${paramName}.den`);
    return createRational(num, den);
  }
  throw new InvalidBigIntInputError(paramName, `invalid rational format "${raw}"`);
}

export function addRational(a: ExactRational, b: ExactRational): ExactRational {
  const x = assertRationalObject(a, 'a');
  const y = assertRationalObject(b, 'b');
  return createRational(x.num * y.den + y.num * x.den, x.den * y.den);
}

export function subRational(a: ExactRational, b: ExactRational): ExactRational {
  const x = assertRationalObject(a, 'a');
  const y = assertRationalObject(b, 'b');
  return createRational(x.num * y.den - y.num * x.den, x.den * y.den);
}

export function mulRational(a: ExactRational, b: ExactRational): ExactRational {
  const x = assertRationalObject(a, 'a');
  const y = assertRationalObject(b, 'b');
  return createRational(x.num * y.num, x.den * y.den);
}

export function divRational(a: ExactRational, b: ExactRational): ExactRational {
  const x = assertRationalObject(a, 'a');
  const y = assertRationalObject(b, 'b');
  if (y.num === 0n) {
    throw new ExactDivisionByZeroError('cannot divide ExactRational by 0');
  }
  return createRational(x.num * y.den, x.den * y.num);
}

export function negRational(q: ExactRational): ExactRational {
  const x = assertRationalObject(q, 'q');
  if (x.num === 0n) return RATIONAL_ZERO;
  return Object.freeze({ num: -x.num, den: x.den });
}

export function absRational(q: ExactRational): ExactRational {
  const x = assertRationalObject(q, 'q');
  if (x.num >= 0n) return x;
  return Object.freeze({ num: -x.num, den: x.den });
}

export function invRational(q: ExactRational): ExactRational {
  const x = assertRationalObject(q, 'q');
  if (x.num === 0n) {
    throw new ExactDivisionByZeroError('cannot invert ExactRational 0');
  }
  return createRational(x.den, x.num);
}

export function powRational(q: ExactRational, exp: bigint): ExactRational {
  const x = assertRationalObject(q, 'q');
  const e = assertBigInt(exp, 'exp');

  if (e === 0n) return RATIONAL_ONE;
  if (e < 0n) {
    if (x.num === 0n) {
      throw new ExactDivisionByZeroError('cannot raise 0 to negative exponent');
    }
    const posExp = -e;
    return createRational(powBigInt(x.den, posExp), powBigInt(x.num, posExp));
  }
  return createRational(powBigInt(x.num, e), powBigInt(x.den, e));
}

export function cmpRational(a: ExactRational, b: ExactRational): -1 | 0 | 1 {
  const x = assertRationalObject(a, 'a');
  const y = assertRationalObject(b, 'b');
  const left = x.num * y.den;
  const right = y.num * x.den;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function eqRational(a: ExactRational, b: ExactRational): boolean {
  const x = assertRationalObject(a, 'a');
  const y = assertRationalObject(b, 'b');
  return x.num === y.num && x.den === y.den;
}

export function ltRational(a: ExactRational, b: ExactRational): boolean {
  return cmpRational(a, b) === -1;
}

export function lteRational(a: ExactRational, b: ExactRational): boolean {
  return cmpRational(a, b) !== 1;
}

export function gtRational(a: ExactRational, b: ExactRational): boolean {
  return cmpRational(a, b) === 1;
}

export function gteRational(a: ExactRational, b: ExactRational): boolean {
  return cmpRational(a, b) !== -1;
}

export function isZeroRational(q: ExactRational): boolean {
  return assertRationalObject(q, 'q').num === 0n;
}

export function isPositiveRational(q: ExactRational): boolean {
  return assertRationalObject(q, 'q').num > 0n;
}

export function isNegativeRational(q: ExactRational): boolean {
  return assertRationalObject(q, 'q').num < 0n;
}

export function isIntegerRational(q: ExactRational): boolean {
  return assertRationalObject(q, 'q').den === 1n;
}

/**
 * Formats normalized ExactRational as "num" when den === 1n, else "num/den".
 */
export function formatRational(q: ExactRational): string {
  const x = assertRationalObject(q, 'q');
  return x.den === 1n ? x.num.toString() : `${x.num.toString()}/${x.den.toString()}`;
}

/**
 * Always formats normalized ExactRational as "num/den".
 */
export function formatRationalFraction(q: ExactRational): string {
  const x = assertRationalObject(q, 'q');
  return `${x.num.toString()}/${x.den.toString()}`;
}
