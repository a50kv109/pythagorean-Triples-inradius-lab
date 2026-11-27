/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertPositiveBigInt,
  assertPositiveRadius,
  cmpBigInt,
  computeTwoRSquared,
  exactSqrtBigInt,
  gcdBigInt,
  isPerfectSquareBigInt,
  powBigInt,
} from '../exact/index.ts';
import { InvalidFactorizationInputError } from './errors.ts';
import { certifyPrimality } from './primality.ts';
import type {
  CanonicalFactorization,
  FactorizationCertificationStatus,
  FactorizationOptions,
  NumberTheoryDiagnostic,
  PrimePowerFactor,
  TwoRSquaredFactorization,
  UnfactoredCompositeFactor,
} from './types.ts';

export const DEFAULT_TRIAL_DIVISION_LIMIT = 100_000n;
export const DEFAULT_MAX_POLLARD_ITERATIONS = 300_000n;
export const DEFAULT_MAX_DURATION_MS = 2_500n;

function nowMsBigInt(): bigint {
  return BigInt(Date.now());
}

interface WorkItem {
  readonly value: bigint;
  readonly exponent: bigint;
}

interface BrentSearchResult {
  readonly divisor: bigint | null;
  readonly iterations: bigint;
  readonly abortReason?: 'POLLARD_ITERATION_LIMIT_REACHED' | 'TIME_BUDGET_EXCEEDED';
}

/**
 * Deterministic Pollard-Brent factorization step for an odd composite n >= 9n.
 * Never uses Math.random(). Respects iteration and wall-clock budgets.
 */
function findNonTrivialDivisorBrent(
  n: bigint,
  remainingIterations: bigint,
  deadlineMs: bigint
): BrentSearchResult {
  if (n % 2n === 0n) {
    return { divisor: 2n, iterations: 0n };
  }
  if (n % 3n === 0n) {
    return { divisor: 3n, iterations: 0n };
  }
  if (isPerfectSquareBigInt(n)) {
    return { divisor: exactSqrtBigInt(n), iterations: 1n };
  }

  let iterations = 0n;
  const batchSize = 128n;
  let c = 1n;

  while (iterations < remainingIterations) {
    if (nowMsBigInt() >= deadlineMs) {
      return {
        divisor: null,
        iterations,
        abortReason: 'TIME_BUDGET_EXCEEDED',
      };
    }

    let y = (2n + c) % n;
    if (y === 0n) y = 1n;

    let r = 1n;
    let q = 1n;
    let g = 1n;
    let x = 0n;
    let ys = 0n;

    const step = (v: bigint): bigint => (v * v + c) % n;

    while (g === 1n) {
      x = y;
      for (let i = 0n; i < r; i += 1n) {
        if (iterations >= remainingIterations) {
          return {
            divisor: null,
            iterations,
            abortReason: 'POLLARD_ITERATION_LIMIT_REACHED',
          };
        }
        if ((iterations & 1023n) === 0n && nowMsBigInt() >= deadlineMs) {
          return {
            divisor: null,
            iterations,
            abortReason: 'TIME_BUDGET_EXCEEDED',
          };
        }
        y = step(y);
        iterations += 1n;
      }

      let k = 0n;
      while (k < r && g === 1n) {
        ys = y;
        const limit = r - k < batchSize ? r - k : batchSize;
        for (let i = 0n; i < limit; i += 1n) {
          if (iterations >= remainingIterations) {
            return {
              divisor: null,
              iterations,
              abortReason: 'POLLARD_ITERATION_LIMIT_REACHED',
            };
          }
          if ((iterations & 1023n) === 0n && nowMsBigInt() >= deadlineMs) {
            return {
              divisor: null,
              iterations,
              abortReason: 'TIME_BUDGET_EXCEEDED',
            };
          }
          y = step(y);
          const diff = x >= y ? x - y : y - x;
          q = (q * diff) % n;
          iterations += 1n;
        }
        g = gcdBigInt(q, n);
        k += batchSize;
      }

      r <<= 1n;
    }

    if (g === n) {
      do {
        if (iterations >= remainingIterations || nowMsBigInt() >= deadlineMs) {
          return {
            divisor: null,
            iterations,
            abortReason: nowMsBigInt() >= deadlineMs ? 'TIME_BUDGET_EXCEEDED' : 'POLLARD_ITERATION_LIMIT_REACHED',
          };
        }
        ys = step(ys);
        const diff = x >= ys ? x - ys : ys - x;
        g = gcdBigInt(diff, n);
        iterations += 1n;
      } while (g === 1n);
    }

    if (g > 1n && g < n) {
      return { divisor: g, iterations };
    }

    c += 1n;
  }

  return {
    divisor: null,
    iterations,
    abortReason: 'POLLARD_ITERATION_LIMIT_REACHED',
  };
}

/**
 * Reconstructs the exact BigInt integer from a CanonicalFactorization.
 */
export function reconstructFromFactorization(
  factorization: CanonicalFactorization
): bigint {
  let product = 1n;
  for (const factor of factorization.primeFactors) {
    product *= powBigInt(factor.prime, factor.exponent);
  }
  for (const composite of factorization.unfactoredComposites) {
    product *= powBigInt(composite.value, composite.exponent);
  }
  return product;
}

/**
 * Factors a positive BigInt n >= 1n into canonical prime powers with explicit
 * three-level prime certification and explicit incomplete-factorization reporting.
 */
export function factorizeBigInt(
  n: bigint,
  options: FactorizationOptions = {}
): CanonicalFactorization {
  const vn = assertPositiveBigInt(n, 'n');

  const trialDivisionLimit =
    options.trialDivisionLimit !== undefined
      ? options.trialDivisionLimit
      : DEFAULT_TRIAL_DIVISION_LIMIT;
  if (typeof trialDivisionLimit !== 'bigint' || trialDivisionLimit < 1n) {
    throw new InvalidFactorizationInputError('trialDivisionLimit', 'must be BigInt >= 1n');
  }

  const maxPollardIterations =
    options.maxPollardIterations !== undefined
      ? options.maxPollardIterations
      : DEFAULT_MAX_POLLARD_ITERATIONS;
  if (typeof maxPollardIterations !== 'bigint' || maxPollardIterations < 0n) {
    throw new InvalidFactorizationInputError('maxPollardIterations', 'must be BigInt >= 0n');
  }

  const maxDurationMs =
    options.maxDurationMs !== undefined ? options.maxDurationMs : DEFAULT_MAX_DURATION_MS;
  if (typeof maxDurationMs !== 'bigint' || maxDurationMs < 0n) {
    throw new InvalidFactorizationInputError('maxDurationMs', 'must be BigInt >= 0n');
  }

  const startMs = nowMsBigInt();
  const deadlineMs = startMs + maxDurationMs;

  const primeMap = new Map<bigint, PrimePowerFactor>();
  const unfactoredMap = new Map<bigint, UnfactoredCompositeFactor>();
  const warnings: NumberTheoryDiagnostic[] = [];

  const addPrime = (
    prime: bigint,
    exponent: bigint,
    status: 'PROVEN_PRIME' | 'PROBABLE_PRIME',
    method: PrimePowerFactor['method']
  ): void => {
    const existing = primeMap.get(prime);
    if (existing) {
      primeMap.set(prime, {
        prime,
        exponent: existing.exponent + exponent,
        status:
          existing.status === 'PROVEN_PRIME' && status === 'PROVEN_PRIME'
            ? 'PROVEN_PRIME'
            : 'PROBABLE_PRIME',
        method: existing.status === 'PROVEN_PRIME' ? existing.method : method,
      });
    } else {
      primeMap.set(prime, { prime, exponent, status, method });
    }
  };

  const addUnfactored = (value: bigint, exponent: bigint, reason: string): void => {
    const existing = unfactoredMap.get(value);
    if (existing) {
      unfactoredMap.set(value, {
        value,
        exponent: existing.exponent + exponent,
        status: 'UNFACTORED_COMPOSITE',
        reason: existing.reason,
      });
    } else {
      unfactoredMap.set(value, {
        value,
        exponent,
        status: 'UNFACTORED_COMPOSITE',
        reason,
      });
    }
  };

  let remaining = vn;
  let twoExponent = 0n;

  // 1. Extract power of 2
  while ((remaining & 1n) === 0n) {
    twoExponent += 1n;
    remaining >>= 1n;
  }
  if (twoExponent > 0n) {
    addPrime(2n, twoExponent, 'PROVEN_PRIME', 'SMALL_PRIME_EXACT');
  }

  // 2. Deterministic wheel trial division (factor 3 and 6k +/- 1) up to trialDivisionLimit
  if (remaining > 1n && trialDivisionLimit >= 3n) {
    let e3 = 0n;
    while (remaining % 3n === 0n) {
      e3 += 1n;
      remaining /= 3n;
    }
    if (e3 > 0n) {
      addPrime(3n, e3, 'PROVEN_PRIME', 'SMALL_PRIME_EXACT');
    }

    let d = 5n;
    let nextCandidate = 5n;
    while (d <= trialDivisionLimit && d * d <= remaining) {
      if (remaining % d === 0n) {
        let exp = 0n;
        while (remaining % d === 0n) {
          exp += 1n;
          remaining /= d;
        }
        addPrime(d, exp, 'PROVEN_PRIME', 'TRIAL_DIVISION_EXACT');
      }
      nextCandidate = d + 2n;

      const d2 = d + 2n;
      if (d2 > trialDivisionLimit || d2 * d2 > remaining) {
        break;
      }
      if (remaining % d2 === 0n) {
        let exp = 0n;
        while (remaining % d2 === 0n) {
          exp += 1n;
          remaining /= d2;
        }
        addPrime(d2, exp, 'PROVEN_PRIME', 'TRIAL_DIVISION_EXACT');
      }
      nextCandidate = d + 6n;
      d += 6n;
    }

    // All primes < nextCandidate have been stripped; if nextCandidate^2 > remaining, remaining is strictly PROVEN_PRIME.
    if (remaining > 1n && nextCandidate * nextCandidate > remaining) {
      addPrime(remaining, 1n, 'PROVEN_PRIME', 'TRIAL_DIVISION_EXACT');
      remaining = 1n;
    }
  }

  // 3. Certify & factor any remaining odd composite parts using Miller-Rabin + Pollard-Brent
  let iterationsUsed = 0n;
  let abortCode: 'POLLARD_ITERATION_LIMIT_REACHED' | 'TIME_BUDGET_EXCEEDED' | null = null;
  const workQueue: WorkItem[] = remaining > 1n ? [{ value: remaining, exponent: 1n }] : [];

  while (workQueue.length > 0) {
    const item = workQueue.pop()!;
    if (item.value === 1n) continue;

    // Extract perfect squares quickly before primality / Pollard-Brent
    if (isPerfectSquareBigInt(item.value)) {
      const root = exactSqrtBigInt(item.value);
      workQueue.push({ value: root, exponent: item.exponent * 2n });
      continue;
    }

    const cert = certifyPrimality(item.value, options);
    if (cert.verdict === 'PROVEN_PRIME') {
      addPrime(item.value, item.exponent, 'PROVEN_PRIME', cert.method);
      continue;
    }
    if (cert.verdict === 'PROBABLE_PRIME') {
      addPrime(item.value, item.exponent, 'PROBABLE_PRIME', cert.method);
      continue;
    }

    // Composite detected! If trial-division witness already gave a divisor, split immediately.
    if (
      cert.method === 'TRIAL_DIVISION_DIVISOR' &&
      cert.witnessOrDivisor !== undefined &&
      cert.witnessOrDivisor > 1n &&
      cert.witnessOrDivisor < item.value
    ) {
      const div = cert.witnessOrDivisor;
      workQueue.push({ value: div, exponent: item.exponent });
      workQueue.push({ value: item.value / div, exponent: item.exponent });
      continue;
    }

    if (abortCode !== null || iterationsUsed >= maxPollardIterations || nowMsBigInt() >= deadlineMs) {
      const reason: 'POLLARD_ITERATION_LIMIT_REACHED' | 'TIME_BUDGET_EXCEEDED' =
        abortCode !== null
          ? abortCode
          : nowMsBigInt() >= deadlineMs
            ? 'TIME_BUDGET_EXCEEDED'
            : 'POLLARD_ITERATION_LIMIT_REACHED';
      abortCode = reason;
      addUnfactored(item.value, item.exponent, reason);
      continue;
    }

    const brent = findNonTrivialDivisorBrent(
      item.value,
      maxPollardIterations - iterationsUsed,
      deadlineMs
    );
    iterationsUsed += brent.iterations;

    if (brent.divisor !== null && brent.divisor > 1n && brent.divisor < item.value) {
      workQueue.push({ value: brent.divisor, exponent: item.exponent });
      workQueue.push({ value: item.value / brent.divisor, exponent: item.exponent });
    } else {
      const reason = brent.abortReason ?? 'POLLARD_ITERATION_LIMIT_REACHED';
      abortCode = reason;
      addUnfactored(item.value, item.exponent, reason);
    }
  }

  // Canonical ascending sort of prime factors and unfactored parts
  const primeFactors = Array.from(primeMap.values()).sort((a, b) => cmpBigInt(a.prime, b.prime));
  const oddPrimeFactors = primeFactors.filter((f) => f.prime > 2n);
  const unfactoredComposites = Array.from(unfactoredMap.values()).sort((a, b) =>
    cmpBigInt(a.value, b.value)
  );

  let reconstructedFromPrimes = 1n;
  for (const factor of primeFactors) {
    reconstructedFromPrimes *= powBigInt(factor.prime, factor.exponent);
  }

  let reconstructedTotal = reconstructedFromPrimes;
  for (const comp of unfactoredComposites) {
    reconstructedTotal *= powBigInt(comp.value, comp.exponent);
  }

  const isComplete = unfactoredComposites.length === 0 && reconstructedFromPrimes === vn;
  const hasProbablePrime = primeFactors.some((f) => f.status === 'PROBABLE_PRIME');

  let certificationStatus: FactorizationCertificationStatus;
  if (!isComplete) {
    certificationStatus = 'INCOMPLETE';
    if (abortCode === 'TIME_BUDGET_EXCEEDED') {
      warnings.push({
        code: 'TIME_BUDGET_EXCEEDED',
        severity: 'WARNING',
        message: `Time budget (${maxDurationMs.toString()} ms) exceeded while factoring ${vn.toString()}.`,
      });
    } else {
      warnings.push({
        code: 'POLLARD_ITERATION_LIMIT_REACHED',
        severity: 'WARNING',
        message: `Pollard-Brent iteration budget (${maxPollardIterations.toString()}) exhausted while factoring ${vn.toString()}.`,
      });
    }
    warnings.push({
      code: 'INCOMPLETE_FACTORIZATION',
      severity: 'WARNING',
      message: `Factorization of ${vn.toString()} is incomplete; ${unfactoredComposites.length.toString()} unfactored composite remainder(s) remain.`,
    });
  } else if (hasProbablePrime) {
    certificationStatus = 'PROBABLE_COMPLETE';
    warnings.push({
      code: 'PROBABLE_PRIME_USED',
      severity: 'WARNING',
      message: `Factorization of ${vn.toString()} includes prime factor(s) above the deterministic Miller-Rabin bound (certified as PROBABLE_PRIME only).`,
    });
  } else {
    certificationStatus = 'PROVEN_COMPLETE';
  }

  return {
    value: vn,
    twoExponent,
    primeFactors,
    oddPrimeFactors,
    unfactoredComposites,
    reconstructedFromPrimes,
    reconstructedTotal,
    isComplete,
    certificationStatus,
    iterationsUsed,
    warnings,
  };
}

/**
 * Lifts the canonical factorization of radius r = 2^{e_0} * prod(p_i^{e_i})
 * directly to 2r^2 = 2^{2e_0 + 1} * prod(p_i^{2e_i}) without re-factoring.
 */
export function liftRadiusFactorizationToTwoRSquared(
  r: bigint,
  rFactorization: CanonicalFactorization
): TwoRSquaredFactorization {
  const validR = assertPositiveRadius(r);
  if (rFactorization.value !== validR) {
    throw new InvalidFactorizationInputError(
      'rFactorization',
      `factorization target (${rFactorization.value.toString()}) does not match radius r=${validR.toString()}`
    );
  }

  const twoRSquared = computeTwoRSquared(validR);
  const twoExp = 2n * rFactorization.twoExponent + 1n;

  const oddPrimeFactors: PrimePowerFactor[] = rFactorization.oddPrimeFactors.map((f) => ({
    prime: f.prime,
    exponent: 2n * f.exponent,
    status: f.status,
    method: f.method,
  }));

  const primeFactors: PrimePowerFactor[] = [
    {
      prime: 2n,
      exponent: twoExp,
      status: 'PROVEN_PRIME',
      method: 'SMALL_PRIME_EXACT',
    },
    ...oddPrimeFactors,
  ];

  const unfactoredComposites: UnfactoredCompositeFactor[] =
    rFactorization.unfactoredComposites.map((c) => ({
      value: c.value,
      exponent: 2n * c.exponent,
      status: 'UNFACTORED_COMPOSITE',
      reason: c.reason,
    }));

  let reconstructedFromPrimes = powBigInt(2n, twoExp);
  for (const f of oddPrimeFactors) {
    reconstructedFromPrimes *= powBigInt(f.prime, f.exponent);
  }

  let reconstructedTotal = reconstructedFromPrimes;
  for (const comp of unfactoredComposites) {
    reconstructedTotal *= powBigInt(comp.value, comp.exponent);
  }

  const isComplete =
    rFactorization.isComplete &&
    unfactoredComposites.length === 0 &&
    reconstructedFromPrimes === twoRSquared;

  const liftedFactorization: CanonicalFactorization = {
    value: twoRSquared,
    twoExponent: twoExp,
    primeFactors,
    oddPrimeFactors,
    unfactoredComposites,
    reconstructedFromPrimes,
    reconstructedTotal,
    isComplete,
    certificationStatus: rFactorization.certificationStatus,
    iterationsUsed: rFactorization.iterationsUsed,
    warnings: [...rFactorization.warnings],
  };

  return {
    radius: validR,
    twoRSquared,
    factorization: liftedFactorization,
  };
}
