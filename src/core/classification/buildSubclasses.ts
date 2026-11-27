/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { analyzeRadiusNumberTheory } from '../factorization/index.ts';
import { classifyTriple } from './classifyTriple.ts';
import { SubclassMismatchError } from './errors.ts';
import type { RadiusClassificationResult, SubclassGroup, PythagoreanTriple } from './types.ts';

/**
 * Builds the canonical partition C(r) = \bigsqcup_{k|r} C_k(r) for radius r.
 * Verifies actual vs expected cardinalities (|C_k(r)| = T(r/k)) and total count (N(r)).
 */
export function buildSubclasses(r: bigint): RadiusClassificationResult {
  const m2Result = analyzeRadiusNumberTheory(r);

  if (
    !m2Result.isFactorizationComplete ||
    !m2Result.isDivisorEnumerationComplete ||
    m2Result.hyperbolaPairs === null
  ) {
    return {
      r,
      totalTriplesCount: 0n,
      expectedTotalCount: 0n,
      isComplete: false,
      subclasses: [],
      allTriples: [],
      warnings: m2Result.warnings,
    };
  }

  const hyperbolaPairs = m2Result.hyperbolaPairs;
  const allTriples: PythagoreanTriple[] = [];

  for (const pair of hyperbolaPairs) {
    const triple = classifyTriple(r, pair.x, pair.y);
    allTriples.push(triple);
  }

  const subclassMap = new Map<bigint, PythagoreanTriple[]>();

  for (const triple of allTriples) {
    const k = triple.k;
    if (!subclassMap.has(k)) {
      subclassMap.set(k, []);
    }
    subclassMap.get(k)!.push(triple);
  }

  const subclasses: SubclassGroup[] = [];
  let totalTriplesCount = 0n;

  for (const [k, triples] of subclassMap.entries()) {
    const primitiveRadius = r / k;
    const subM2 = analyzeRadiusNumberTheory(primitiveRadius);
    const expectedCount = subM2.counters ? subM2.counters.T : 0n;
    const actualCount = BigInt(triples.length);
    const isCardinalityMatch = actualCount === expectedCount;

    if (!isCardinalityMatch) {
      throw new SubclassMismatchError(r, k, actualCount, expectedCount);
    }

    subclasses.push({
      k,
      primitiveRadius,
      actualCount,
      expectedCount,
      isCardinalityMatch,
      triples,
    });

    totalTriplesCount += actualCount;
  }

  subclasses.sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : 0));

  const expectedTotalCount = m2Result.counters ? m2Result.counters.N : 0n;
  const isComplete = totalTriplesCount === expectedTotalCount;

  return {
    r,
    totalTriplesCount,
    expectedTotalCount,
    isComplete,
    subclasses,
    allTriples,
    warnings: m2Result.warnings,
  };
}
