/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertPositiveRadius,
  computeTwoRSquared,
  verifyPythagoreanIdentity,
  computeInradiusFromTriple,
  verifyHyperbolaIdentity,
} from '../exact/index.ts';
import { InvalidTripleError } from './errors.ts';

export interface ReconstructedTriple {
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
}

/**
 * Converts a canonical hyperbola pair (x, y) for inradius r into an exact Pythagorean triple (a, b, c).
 * Enforces strict BigInt arithmetic, identity checks, and canonical leg ordering (a < b).
 */
export function reconstructTriple(r: bigint, x: bigint, y: bigint): ReconstructedTriple {
  const validR = assertPositiveRadius(r);
  const twoR2 = computeTwoRSquared(validR);

  if (!verifyHyperbolaIdentity(validR, x, y)) {
    throw new InvalidTripleError(validR, x, y, `hyperbola identity xy = 2r^2 failed`);
  }

  const a = 2n * validR + x;
  const b = 2n * validR + y;
  const c = 2n * validR + x + y;

  if (!verifyPythagoreanIdentity(a, b, c)) {
    throw new InvalidTripleError(
      validR,
      x,
      y,
      `Pythagorean identity a^2 + b^2 = c^2 failed for (${a.toString()}, ${b.toString()}, ${c.toString()})`
    );
  }

  try {
    const computedR = computeInradiusFromTriple(a, b, c);
    if (computedR !== validR) {
      throw new InvalidTripleError(
        validR,
        x,
        y,
        `inradius mismatch: expected r=${validR.toString()}, computed r=${computedR.toString()}`
      );
    }
  } catch (err: any) {
    throw new InvalidTripleError(validR, x, y, err.message || `inradius identity failed`);
  }

  if (a >= b) {
    throw new InvalidTripleError(
      validR,
      x,
      y,
      `canonical leg ordering a < b failed (a=${a.toString()}, b=${b.toString()})`
    );
  }

  return { a, b, c };
}
