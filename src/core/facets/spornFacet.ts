/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  createRational,
  addRational,
  subRational,
  mulRational,
  divRational,
  rationalFromBigInt,
  type ExactRational,
} from '../exact/index.ts';
import type { PythagoreanTriple, RadiusClassificationResult } from '../classification/index.ts';
import type { SpornZone, SpornParityCase, SpornFacetResult } from './types.ts';
import { IncompleteClassificationError, InvalidSpornInputError } from './errors.ts';

/**
 * Classifies the Sporn zone for given x and r using strictly integer comparisons:
 * - Z0_ROOT: x === r
 * - Z1_A1: x < r and (2r - x)^2 > 2r^2
 * - Z3_A3: x < r and (2r - x)^2 < 2r^2
 * - Z2_A2: x > r (with x^2 < 2r^2 guaranteed by canonical ordering)
 */
export function classifySpornZone(x: bigint, r: bigint): SpornZone {
  if (x <= 0n || r <= 0n) {
    throw new InvalidSpornInputError(`x=${x.toString()} and r=${r.toString()} must be positive`);
  }
  if (x === r) {
    return 'Z0_ROOT';
  }
  if (x < r) {
    const diff = 2n * r - x;
    const diffSq = diff * diff;
    const twoR2 = 2n * r * r;
    if (diffSq > twoR2) {
      return 'Z1_A1';
    }
    if (diffSq < twoR2) {
      return 'Z3_A3';
    }
    throw new InvalidSpornInputError(`Exact boundary collision (2r - x)^2 = 2r^2 for x=${x.toString()}, r=${r.toString()}`);
  }
  // x > r
  if (x * x >= 2n * r * r) {
    throw new InvalidSpornInputError(`x^2 >= 2r^2 violated for x=${x.toString()}, r=${r.toString()}`);
  }
  return 'Z2_A2';
}

/**
 * Computes exact SpornFacetResult for a single M3 PythagoreanTriple.
 */
export function computeSpornFacetForTriple(triple: PythagoreanTriple): SpornFacetResult {
  const { r, k, x, y, a, b, c, tripleId, classId, primId, isPrimitive } = triple;

  if (r <= 0n || x <= 0n || y <= 0n || a <= 0n || b <= 0n || c <= 0n) {
    throw new InvalidSpornInputError(`non-positive dimensions in triple ${tripleId}`);
  }
  if (x * y !== 2n * r * r) {
    throw new InvalidSpornInputError(`hyperbola identity xy = 2r^2 failed for triple ${tripleId}`);
  }
  if (a >= b) {
    throw new InvalidSpornInputError(`canonical order a < b violated for triple ${tripleId}`);
  }

  const spornX = createRational(x, r);
  const spornY = createRational(y, r);
  const spornZone = classifySpornZone(x, r);

  const rayBaseR0 = r / k;
  const x0 = x / k;
  const parityCase: SpornParityCase = x0 % 2n !== 0n ? 'X0_ODD' : 'X0_EVEN';

  // Exact geometry ratios
  const tanHalfA = createRational(r, r + y);
  const tanHalfB = createRational(r, r + x);
  const sinA = createRational(a, c);
  const cosA = createRational(b, c);
  const tanA = createRational(a, b);
  const formT = createRational(b, a);
  const asymQ = createRational(b - a, a + b);

  // normS = spornX + spornY + 3, normP = P / r = 2 * normS
  const normS = addRational(addRational(spornX, spornY), rationalFromBigInt(3n));
  const normP = mulRational(normS, rationalFromBigInt(2n));

  const result: SpornFacetResult = {
    tripleId,
    classId,
    primId,
    r,
    k,
    isPrimitive,
    x,
    y,
    spornX,
    spornY,
    spornZone,
    rayBaseR0,
    parityCase,
    tanHalfA,
    tanHalfB,
    sinA,
    cosA,
    tanA,
    formT,
    asymQ,
    normS,
    normP,
  };

  verifySpornFacetInvariants(result);
  return result;
}

/**
 * Computes SpornFacet results for an entire classification class, verifying completeness.
 */
export function computeSpornFacetsForClass(
  classification: RadiusClassificationResult
): readonly SpornFacetResult[] {
  if (!classification.isComplete || classification.allTriples.length === 0) {
    throw new IncompleteClassificationError(classification.r);
  }

  return classification.allTriples.map((triple) => computeSpornFacetForTriple(triple));
}

/**
 * Validates local mathematical invariants SF-INV-01..06 on a computed SpornFacetResult.
 */
export function verifySpornFacetInvariants(facet: SpornFacetResult): void {
  // SF-INV-01: spornX * spornY === 2
  const product = mulRational(facet.spornX, facet.spornY);
  if (!product.num || product.num !== 2n || product.den !== 1n) {
    throw new InvalidSpornInputError(`SF-INV-01 failed: spornX * spornY !== 2 for ${facet.tripleId}`);
  }

  // SF-INV-02: 0 < spornX < spornY and spornX^2 < 2
  const numSq = facet.spornX.num * facet.spornX.num;
  const denSq = facet.spornX.den * facet.spornX.den;
  if (facet.spornX.num <= 0n || numSq >= 2n * denSq) {
    throw new InvalidSpornInputError(
      `SF-INV-02 failed: spornX must be positive and spornX^2 < 2 for ${facet.tripleId}`
    );
  }

  // SF-INV-03: r === k * rayBaseR0
  if (facet.r !== facet.k * facet.rayBaseR0) {
    throw new InvalidSpornInputError(`SF-INV-03 failed: r !== k * rayBaseR0 for ${facet.tripleId}`);
  }

  // SF-INV-04: sinA^2 + cosA^2 === 1
  const sinSq = mulRational(facet.sinA, facet.sinA);
  const cosSq = mulRational(facet.cosA, facet.cosA);
  const sinCosSum = addRational(sinSq, cosSq);
  if (sinCosSum.num !== 1n || sinCosSum.den !== 1n) {
    throw new InvalidSpornInputError(`SF-INV-04 failed: sinA^2 + cosA^2 !== 1 for ${facet.tripleId}`);
  }

  // SF-INV-05: tanHalfA * (spornY + 1) === 1 and tanHalfB * (spornX + 1) === 1
  const checkA = mulRational(facet.tanHalfA, addRational(facet.spornY, rationalFromBigInt(1n)));
  const checkB = mulRational(facet.tanHalfB, addRational(facet.spornX, rationalFromBigInt(1n)));
  if (checkA.num !== 1n || checkA.den !== 1n || checkB.num !== 1n || checkB.den !== 1n) {
    throw new InvalidSpornInputError(`SF-INV-05 failed: half-angle tan identity violated for ${facet.tripleId}`);
  }

  // SF-INV-06: normS === spornX + spornY + 3 and normP === 2 * normS
  const expectedNormS = addRational(addRational(facet.spornX, facet.spornY), rationalFromBigInt(3n));
  if (!facet.normS.num || facet.normS.num !== expectedNormS.num || facet.normS.den !== expectedNormS.den) {
    throw new InvalidSpornInputError(`SF-INV-06 failed: normS identity violated for ${facet.tripleId}`);
  }
  const expectedNormP = mulRational(facet.normS, rationalFromBigInt(2n));
  if (!facet.normP.num || facet.normP.num !== expectedNormP.num || facet.normP.den !== expectedNormP.den) {
    throw new InvalidSpornInputError(`SF-INV-06 failed: normP identity violated (expected 2 * normS) for ${facet.tripleId}`);
  }
}
