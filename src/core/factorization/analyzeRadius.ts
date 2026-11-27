/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertPositiveRadius,
  computeDiameter,
  computeTwoRSquared,
} from '../exact/index.ts';
import { computeArithmeticCounters } from './counters.ts';
import {
  DEFAULT_MAX_DIVISOR_ENUMERATION_COUNT,
  generateDivisorsFromFactorization,
} from './divisors.ts';
import { CombinatorialLimitError } from './errors.ts';
import { buildHyperbolaDivisorPairs } from './hyperbolaPairs.ts';
import {
  factorizeBigInt,
  liftRadiusFactorizationToTwoRSquared,
} from './primeFactorization.ts';
import type {
  FactorizationOptions,
  NumberTheoryDiagnostic,
  RadiusNumberTheoryResult,
} from './types.ts';

/**
 * Full reproducible M2 Number Theory Engine pipeline for inradius r >= 1n:
 *   1. Factors r and verifies reconstruction.
 *   2. Lifts factorization of r to 2r^2.
 *   3. Computes exact counters omega*(r), tau(r), tau(2r^2), T(r), N(r).
 *   4. Generates complete sorted divisors of r and 2r^2.
 *   5. Constructs all unique canonical hyperbola pairs (x, y) with xy = 2r^2, x^2 < 2r^2 < y^2.
 *
 * Incomplete factorizations or combinatorial limits are reported explicitly rather than masked.
 */
export function analyzeRadiusNumberTheory(
  r: bigint,
  options: FactorizationOptions = {}
): RadiusNumberTheoryResult {
  const validR = assertPositiveRadius(r);
  const diameter = computeDiameter(validR);
  const twoRSquared = computeTwoRSquared(validR);

  const rFactorization = factorizeBigInt(validR, options);
  const twoRSquaredFactorization = liftRadiusFactorizationToTwoRSquared(
    validR,
    rFactorization
  );

  const warnings: NumberTheoryDiagnostic[] = [...rFactorization.warnings];

  if (!rFactorization.isComplete || !twoRSquaredFactorization.factorization.isComplete) {
    return {
      radius: validR,
      diameter,
      twoRSquared,
      rFactorization,
      twoRSquaredFactorization,
      certificationStatus: 'INCOMPLETE',
      isFactorizationComplete: false,
      isDivisorEnumerationComplete: false,
      divisorsOfR: null,
      divisorsOfTwoRSquared: null,
      divisorCountOfR: null,
      divisorCountOfTwoRSquared: null,
      hyperbolaPairs: null,
      counters: null,
      warnings,
    };
  }

  const counters = computeArithmeticCounters(rFactorization);
  const maxDivCount =
    options.maxDivisorEnumerationCount ?? DEFAULT_MAX_DIVISOR_ENUMERATION_COUNT;

  try {
    const divisorsOfR = generateDivisorsFromFactorization(rFactorization, maxDivCount);
    const divisorsOfTwoRSquared = generateDivisorsFromFactorization(
      twoRSquaredFactorization.factorization,
      maxDivCount
    );
    const hyperbolaPairs = buildHyperbolaDivisorPairs(validR, divisorsOfTwoRSquared);

    return {
      radius: validR,
      diameter,
      twoRSquared,
      rFactorization,
      twoRSquaredFactorization,
      certificationStatus: rFactorization.certificationStatus,
      isFactorizationComplete: true,
      isDivisorEnumerationComplete: true,
      divisorsOfR,
      divisorsOfTwoRSquared,
      divisorCountOfR: counters.tauR,
      divisorCountOfTwoRSquared: counters.tauTwoRSquared,
      hyperbolaPairs,
      counters,
      warnings,
    };
  } catch (err) {
    if (err instanceof CombinatorialLimitError) {
      warnings.push({
        code: 'COMBINATORIAL_LIMIT_EXCEEDED',
        severity: 'WARNING',
        message: err.message,
      });

      return {
        radius: validR,
        diameter,
        twoRSquared,
        rFactorization,
        twoRSquaredFactorization,
        certificationStatus: rFactorization.certificationStatus,
        isFactorizationComplete: true,
        isDivisorEnumerationComplete: false,
        divisorsOfR: null,
        divisorsOfTwoRSquared: null,
        divisorCountOfR: counters.tauR,
        divisorCountOfTwoRSquared: counters.tauTwoRSquared,
        hyperbolaPairs: null,
        counters,
        warnings,
      };
    }
    throw err;
  }
}
