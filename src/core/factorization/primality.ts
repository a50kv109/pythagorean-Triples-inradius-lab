/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  assertBigInt,
  assertPositiveBigInt,
  isEvenBigInt,
  isqrtBigInt,
} from '../exact/index.ts';
import { InvalidFactorizationInputError } from './errors.ts';
import { modPowBigInt } from './modularArithmetic.ts';
import type {
  FactorizationOptions,
  PrimalityCertificate,
} from './types.ts';

/**
 * Sorenson & Webster (2015) proven upper bound for deterministic Miller-Rabin
 * using the first 12 primes {2..37} (and strictly valid with the first 13 primes {2..41}):
 * n < 3,317,044,064,679,887,385,961,981 (~3.317 * 10^24).
 */
export const DETERMINISTIC_MR_LIMIT_13_BASES = 3_317_044_064_679_887_385_961_981n;

export const FIRST_13_PRIME_BASES: readonly bigint[] = [
  2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n,
];

export const PROBABLE_PRIME_FIXED_BASES: readonly bigint[] = [
  2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n,
  43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n,
];

interface DeterministicBracket {
  readonly upperBound: bigint;
  readonly bases: readonly bigint[];
}

const DETERMINISTIC_BRACKETS: readonly DeterministicBracket[] = [
  { upperBound: 2_047n, bases: [2n] },
  { upperBound: 1_373_653n, bases: [2n, 3n] },
  { upperBound: 25_326_001n, bases: [2n, 3n, 5n] },
  { upperBound: 3_215_031_751n, bases: [2n, 3n, 5n, 7n] },
  { upperBound: 2_152_302_898_747n, bases: [2n, 3n, 5n, 7n, 11n] },
  { upperBound: 3_474_749_660_383n, bases: [2n, 3n, 5n, 7n, 11n, 13n] },
  { upperBound: 341_550_071_728_321n, bases: [2n, 3n, 5n, 7n, 11n, 13n, 17n] },
  { upperBound: 3_825_123_056_546_413_051n, bases: [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n] },
  {
    upperBound: 318_665_857_834_031_151_167_461n,
    bases: [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n],
  },
  {
    upperBound: DETERMINISTIC_MR_LIMIT_13_BASES,
    bases: FIRST_13_PRIME_BASES,
  },
];

export const DEFAULT_TRIAL_PROOF_MAX_N = 10_000_000_000n;
export const DEFAULT_PROBABLE_PRIME_ROUNDS = 25n;

/**
 * Performs a single strong probable prime test (Miller-Rabin) for odd n > 2 and base 2 <= a < n.
 * Returns true if n passes (is a strong probable prime to base a), false if a witnesses compositeness.
 */
export function passesMillerRabinBase(n: bigint, base: bigint): boolean {
  const vn = assertPositiveBigInt(n, 'n');
  const va = assertBigInt(base, 'base');

  if (vn <= 2n || isEvenBigInt(vn)) {
    throw new InvalidFactorizationInputError('n', 'passesMillerRabinBase requires odd n > 2');
  }
  if (va < 2n || va >= vn) {
    throw new InvalidFactorizationInputError('base', `base ${va.toString()} must satisfy 2 <= base < ${vn.toString()}`);
  }
  const a = va;

  let d = vn - 1n;
  let s = 0n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s += 1n;
  }

  let x = modPowBigInt(a, d, vn);
  if (x === 1n || x === vn - 1n) {
    return true;
  }

  for (let r = 1n; r < s; r += 1n) {
    x = (x * x) % vn;
    if (x === vn - 1n) {
      return true;
    }
    if (x === 1n) {
      return false;
    }
  }

  return false;
}

/**
 * Generates deterministic additional bases purely in BigInt if probablePrimeRounds > 25n.
 */
function buildDeterministicProbableBases(n: bigint, rounds: bigint): readonly bigint[] {
  const bases: bigint[] = [];
  let idx = 0n;
  for (const p of PROBABLE_PRIME_FIXED_BASES) {
    if (idx >= rounds) break;
    if (p < n) {
      bases.push(p);
      idx += 1n;
    }
  }

  // Deterministic BigInt Weyl/LCG sequence for extra bases if rounds > PROBABLE_PRIME_FIXED_BASES.length
  let state = 6364136223846793005n * (n & ((1n << 64n) - 1n)) + 1442695040888963407n;
  const span = n - 3n;
  while (idx < rounds && span > 0n) {
    state = (state * 6364136223846793005n + 1442695040888963407n) & ((1n << 128n) - 1n);
    const candidate = 2n + (state % span);
    bases.push(candidate);
    idx += 1n;
  }

  return bases;
}

/**
 * Exact deterministic trial division primality proof for moderate integers.
 */
function trialDivisionExactProof(n: bigint): PrimalityCertificate {
  if (n === 2n || n === 3n) {
    return {
      value: n,
      verdict: 'PROVEN_PRIME',
      isPrime: true,
      isProven: true,
      method: 'SMALL_PRIME_EXACT',
      basesTested: [],
      deterministicThreshold: DETERMINISTIC_MR_LIMIT_13_BASES,
    };
  }
  if (n % 2n === 0n) {
    return {
      value: n,
      verdict: 'COMPOSITE',
      isPrime: false,
      isProven: true,
      method: 'TRIAL_DIVISION_DIVISOR',
      basesTested: [],
      witnessOrDivisor: 2n,
      deterministicThreshold: DETERMINISTIC_MR_LIMIT_13_BASES,
    };
  }
  if (n % 3n === 0n) {
    return {
      value: n,
      verdict: 'COMPOSITE',
      isPrime: false,
      isProven: true,
      method: 'TRIAL_DIVISION_DIVISOR',
      basesTested: [],
      witnessOrDivisor: 3n,
      deterministicThreshold: DETERMINISTIC_MR_LIMIT_13_BASES,
    };
  }

  const limit = isqrtBigInt(n);
  let d = 5n;
  while (d <= limit) {
    if (n % d === 0n) {
      return {
        value: n,
        verdict: 'COMPOSITE',
        isPrime: false,
        isProven: true,
        method: 'TRIAL_DIVISION_DIVISOR',
        basesTested: [],
        witnessOrDivisor: d,
        deterministicThreshold: DETERMINISTIC_MR_LIMIT_13_BASES,
      };
    }
    const d2 = d + 2n;
    if (d2 <= limit && n % d2 === 0n) {
      return {
        value: n,
        verdict: 'COMPOSITE',
        isPrime: false,
        isProven: true,
        method: 'TRIAL_DIVISION_DIVISOR',
        basesTested: [],
        witnessOrDivisor: d2,
        deterministicThreshold: DETERMINISTIC_MR_LIMIT_13_BASES,
      };
    }
    d += 6n;
  }

  return {
    value: n,
    verdict: 'PROVEN_PRIME',
    isPrime: true,
    isProven: true,
    method: 'TRIAL_DIVISION_EXACT',
    basesTested: [],
    deterministicThreshold: DETERMINISTIC_MR_LIMIT_13_BASES,
  };
}

/**
 * Certifies primality of a positive BigInt n >= 1n without ever conflating
 * probable primality with proven primality.
 */
export function certifyPrimality(
  n: bigint,
  options: FactorizationOptions = {}
): PrimalityCertificate {
  const vn = assertPositiveBigInt(n, 'n');

  const requestedDetMax =
    options.deterministicMillerRabinMax !== undefined
      ? assertPositiveBigInt(options.deterministicMillerRabinMax, 'deterministicMillerRabinMax')
      : DETERMINISTIC_MR_LIMIT_13_BASES;

  // Never allow raising the deterministic threshold above the mathematically proven bound.
  const deterministicThreshold =
    requestedDetMax < DETERMINISTIC_MR_LIMIT_13_BASES
      ? requestedDetMax
      : DETERMINISTIC_MR_LIMIT_13_BASES;

  const trialProofMaxN =
    options.trialDivisionProofMaxN !== undefined
      ? assertPositiveBigInt(options.trialDivisionProofMaxN, 'trialDivisionProofMaxN')
      : DEFAULT_TRIAL_PROOF_MAX_N;

  const probableRounds =
    options.probablePrimeRounds !== undefined
      ? assertPositiveBigInt(options.probablePrimeRounds, 'probablePrimeRounds')
      : DEFAULT_PROBABLE_PRIME_ROUNDS;

  if (probableRounds < 1n) {
    throw new InvalidFactorizationInputError('probablePrimeRounds', 'must be >= 1n');
  }

  if (vn === 1n) {
    return {
      value: 1n,
      verdict: 'UNIT',
      isPrime: false,
      isProven: true,
      method: 'UNIT_ONE',
      basesTested: [],
      deterministicThreshold,
    };
  }

  // Exact check against the small proven primes up to 97n
  for (const p of PROBABLE_PRIME_FIXED_BASES) {
    if (vn === p) {
      return {
        value: vn,
        verdict: 'PROVEN_PRIME',
        isPrime: true,
        isProven: true,
        method: 'SMALL_PRIME_EXACT',
        basesTested: [],
        deterministicThreshold,
      };
    }
    if (vn % p === 0n) {
      return {
        value: vn,
        verdict: 'COMPOSITE',
        isPrime: false,
        isProven: true,
        method: 'TRIAL_DIVISION_DIVISOR',
        basesTested: [],
        witnessOrDivisor: p,
        deterministicThreshold,
      };
    }
  }

  // Direct deterministic proof by trial division for moderate values
  if (vn <= trialProofMaxN) {
    const res = trialDivisionExactProof(vn);
    return {
      ...res,
      deterministicThreshold,
    };
  }

  // Deterministic Miller-Rabin inside mathematically proven bounds
  if (vn < deterministicThreshold) {
    let selectedBases: readonly bigint[] = FIRST_13_PRIME_BASES;
    for (const bracket of DETERMINISTIC_BRACKETS) {
      if (vn < bracket.upperBound) {
        selectedBases = bracket.bases;
        break;
      }
    }

    const tested: bigint[] = [];
    for (const base of selectedBases) {
      if (base >= vn) continue;
      tested.push(base);
      if (!passesMillerRabinBase(vn, base)) {
        return {
          value: vn,
          verdict: 'COMPOSITE',
          isPrime: false,
          isProven: true,
          method: 'MILLER_RABIN_WITNESS',
          basesTested: tested,
          witnessOrDivisor: base,
          deterministicThreshold,
        };
      }
    }

    return {
      value: vn,
      verdict: 'PROVEN_PRIME',
      isPrime: true,
      isProven: true,
      method: 'DETERMINISTIC_MILLER_RABIN',
      basesTested: tested,
      deterministicThreshold,
    };
  }

  // Outside proven deterministic bound: probabilistic Miller-Rabin ONLY
  const bases = buildDeterministicProbableBases(vn, probableRounds);
  const tested: bigint[] = [];
  for (const base of bases) {
    tested.push(base);
    if (!passesMillerRabinBase(vn, base)) {
      return {
        value: vn,
        verdict: 'COMPOSITE',
        isPrime: false,
        isProven: true,
        method: 'MILLER_RABIN_WITNESS',
        basesTested: tested,
        witnessOrDivisor: base,
        deterministicThreshold,
      };
    }
  }

  return {
    value: vn,
    verdict: 'PROBABLE_PRIME',
    isPrime: null,
    isProven: false,
    method: 'PROBABILISTIC_MILLER_RABIN',
    basesTested: tested,
    deterministicThreshold,
  };
}
