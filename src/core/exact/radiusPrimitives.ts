/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { assertBigInt, exactDivBigInt } from './bigIntMath.ts';
import { ExactIdentityError, InvalidRadiusError } from './errors.ts';

export interface ExactTripleLegs {
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
}

export interface ExactShiftPair {
  readonly x: bigint;
  readonly y: bigint;
}

/**
 * Validates that inradius r is a strictly positive BigInt integer (r >= 1n).
 */
export function assertPositiveRadius(r: unknown): bigint {
  if (typeof r !== 'bigint') {
    throw new InvalidRadiusError(typeof r, `expected bigint, received ${typeof r}`);
  }
  if (r <= 0n) {
    throw new InvalidRadiusError(r.toString(), 'inradius r must be strictly positive (r >= 1n)');
  }
  return r;
}

/**
 * Exact diameter D = 2r (strictly even natural number).
 */
export function computeDiameter(r: bigint): bigint {
  const validR = assertPositiveRadius(r);
  return 2n * validR;
}

/**
 * Exact hyperbola constant 2r^2 computed purely in BigInt.
 */
export function computeTwoRSquared(r: bigint): bigint {
  const validR = assertPositiveRadius(r);
  return 2n * validR * validR;
}

/**
 * Verifies exact Pythagorean equality a^2 + b^2 = c^2 with positive integer sides.
 */
export function verifyPythagoreanIdentity(a: bigint, b: bigint, c: bigint): boolean {
  const va = assertBigInt(a, 'a');
  const vb = assertBigInt(b, 'b');
  const vc = assertBigInt(c, 'c');
  return va > 0n && vb > 0n && vc > 0n && va * va + vb * vb === vc * vc;
}

/**
 * Verifies canonical leg ordering 0 < a < b < c.
 */
export function verifyCanonicalOrder(a: bigint, b: bigint, c: bigint): boolean {
  const va = assertBigInt(a, 'a');
  const vb = assertBigInt(b, 'b');
  const vc = assertBigInt(c, 'c');
  return va > 0n && va < vb && vb < vc;
}

/**
 * Computes exact integer inradius r = (a + b - c) / 2 of an integer right triangle.
 * Requires a > 0, b > 0, c > 0 and exact identity a^2 + b^2 = c^2.
 */
export function computeInradiusFromTriple(a: bigint, b: bigint, c: bigint): bigint {
  if (!verifyPythagoreanIdentity(a, b, c)) {
    throw new ExactIdentityError(
      `(${a.toString()}, ${b.toString()}, ${c.toString()}) is not a positive integer Pythagorean triple`
    );
  }
  const diameter = a + b - c;
  if (diameter <= 0n || diameter % 2n !== 0n) {
    throw new ExactIdentityError(
      `invalid incircle diameter D = a + b - c = ${diameter.toString()}`
    );
  }
  return exactDivBigInt(diameter, 2n);
}

/**
 * Verifies the canonical hyperbola factorization condition:
 * xy = 2r^2 and 1 <= x < sqrt(2)*r < y <= 2r^2
 * expressed purely in BigInt inequalities: x >= 1n, x < y, y <= 2r^2, x^2 < 2r^2 < y^2, x*y === 2r^2.
 */
export function verifyHyperbolaIdentity(r: bigint, x: bigint, y: bigint): boolean {
  const validR = assertPositiveRadius(r);
  const vx = assertBigInt(x, 'x');
  const vy = assertBigInt(y, 'y');
  const twoR2 = 2n * validR * validR;
  return (
    vx >= 1n &&
    vx < vy &&
    vy <= twoR2 &&
    vx * vy === twoR2 &&
    vx * vx < twoR2 &&
    vy * vy > twoR2
  );
}

/**
 * Computes canonical factorization shifts x = a - 2r, y = b - 2r
 * and verifies x = c - b, y = c - a, and xy = 2r^2 exactly.
 */
export function computeFactorizationShifts(
  a: bigint,
  b: bigint,
  c: bigint,
  r?: bigint
): ExactShiftPair {
  if (!verifyCanonicalOrder(a, b, c)) {
    throw new ExactIdentityError(
      `canonical ordering 0 < a < b < c violated for (${a.toString()}, ${b.toString()}, ${c.toString()})`
    );
  }
  const computedR = computeInradiusFromTriple(a, b, c);
  if (r !== undefined) {
    const expectedR = assertPositiveRadius(r);
    if (computedR !== expectedR) {
      throw new ExactIdentityError(
        `inradius mismatch: expected r=${expectedR.toString()}, computed r=${computedR.toString()}`
      );
    }
  }
  const diameter = computeDiameter(computedR);
  const x = a - diameter;
  const y = b - diameter;

  if (x !== c - b || y !== c - a || !verifyHyperbolaIdentity(computedR, x, y)) {
    throw new ExactIdentityError(
      `hyperbola shift identity xy = 2r^2 failed for (${a.toString()}, ${b.toString()}, ${c.toString()})`
    );
  }

  return { x, y };
}

/**
 * Reconstructs canonical triple (a, b, c) from (r, x, y) after verifying xy = 2r^2 and canonical bounds.
 */
export function reconstructTripleFromShifts(
  r: bigint,
  x: bigint,
  y: bigint
): ExactTripleLegs {
  const validR = assertPositiveRadius(r);
  const vx = assertBigInt(x, 'x');
  const vy = assertBigInt(y, 'y');

  if (!verifyHyperbolaIdentity(validR, vx, vy)) {
    throw new ExactIdentityError(
      `cannot reconstruct triple: (${vx.toString()}, ${vy.toString()}) does not satisfy canonical xy = 2r^2 for r=${validR.toString()}`
    );
  }

  const diameter = computeDiameter(validR);
  const a = diameter + vx;
  const b = diameter + vy;
  const c = diameter + vx + vy;

  return { a, b, c };
}
