/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * Three-level prime/factor certification status (no conflation of probabilistic and proven primality).
 */
export type PrimeCertificationStatus =
  | 'PROVEN_PRIME'
  | 'PROBABLE_PRIME'
  | 'UNFACTORED_COMPOSITE';

/**
 * Result verdict of a standalone primality certification check on an integer n >= 1.
 */
export type PrimalityVerdict =
  | PrimeCertificationStatus
  | 'COMPOSITE'
  | 'UNIT';

export type PrimalityProofMethod =
  | 'UNIT_ONE'
  | 'SMALL_PRIME_EXACT'
  | 'TRIAL_DIVISION_EXACT'
  | 'DETERMINISTIC_MILLER_RABIN'
  | 'PROBABILISTIC_MILLER_RABIN'
  | 'TRIAL_DIVISION_DIVISOR'
  | 'MILLER_RABIN_WITNESS';

export interface PrimalityCertificate {
  readonly value: bigint;
  readonly verdict: PrimalityVerdict;
  readonly isPrime: boolean | null;
  readonly isProven: boolean;
  readonly method: PrimalityProofMethod;
  readonly basesTested: readonly bigint[];
  readonly witnessOrDivisor?: bigint;
  readonly deterministicThreshold: bigint;
}

export interface PrimePowerFactor {
  readonly prime: bigint;
  readonly exponent: bigint;
  readonly status: 'PROVEN_PRIME' | 'PROBABLE_PRIME';
  readonly method: PrimalityProofMethod;
}

export interface UnfactoredCompositeFactor {
  readonly value: bigint;
  readonly exponent: bigint;
  readonly status: 'UNFACTORED_COMPOSITE';
  readonly reason: string;
}

export type FactorizationCertificationStatus =
  | 'PROVEN_COMPLETE'
  | 'PROBABLE_COMPLETE'
  | 'INCOMPLETE';

export interface CanonicalFactorization {
  readonly value: bigint;
  readonly twoExponent: bigint;
  readonly primeFactors: readonly PrimePowerFactor[];
  readonly oddPrimeFactors: readonly PrimePowerFactor[];
  readonly unfactoredComposites: readonly UnfactoredCompositeFactor[];
  readonly reconstructedFromPrimes: bigint;
  readonly reconstructedTotal: bigint;
  readonly isComplete: boolean;
  readonly certificationStatus: FactorizationCertificationStatus;
  readonly iterationsUsed: bigint;
  readonly warnings: readonly NumberTheoryDiagnostic[];
}

export interface TwoRSquaredFactorization {
  readonly radius: bigint;
  readonly twoRSquared: bigint;
  readonly factorization: CanonicalFactorization;
}

export interface HyperbolaDivisorPair {
  readonly x: bigint;
  readonly y: bigint;
}

export interface ArithmeticCounters {
  readonly omegaStar: bigint;
  readonly tauR: bigint;
  readonly tauTwoRSquared: bigint;
  readonly T: bigint;
  readonly N: bigint;
}

export type NumberTheoryDiagnosticSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type NumberTheoryDiagnosticCode =
  | 'PROBABLE_PRIME_USED'
  | 'POLLARD_ITERATION_LIMIT_REACHED'
  | 'TIME_BUDGET_EXCEEDED'
  | 'INCOMPLETE_FACTORIZATION'
  | 'COMBINATORIAL_LIMIT_EXCEEDED';

export interface NumberTheoryDiagnostic {
  readonly code: NumberTheoryDiagnosticCode;
  readonly severity: NumberTheoryDiagnosticSeverity;
  readonly message: string;
}

export interface FactorizationOptions {
  /** Maximum trial-division divisor tested deterministically (default: 100000n). */
  readonly trialDivisionLimit?: bigint;
  /** Maximum divisor threshold below which trial division proves primality (default: 10000000000n, i.e. sqrt <= 10^5). */
  readonly trialDivisionProofMaxN?: bigint;
  /**
   * Upper bound for deterministic Miller-Rabin (default & hard cap: Sorenson-Webster 2015 limit
   * 3_317_044_064_679_887_385_961_981n). Passing a smaller value allows forcing PROBABLE_PRIME above it.
   */
  readonly deterministicMillerRabinMax?: bigint;
  /** Number of deterministic Miller-Rabin rounds/bases used above the proven bound (default: 25n). */
  readonly probablePrimeRounds?: bigint;
  /** Maximum total Pollard-Brent steps per factorization call (default: 300000n). */
  readonly maxPollardIterations?: bigint;
  /** Maximum wall-clock duration in milliseconds as BigInt (default: 2500n). */
  readonly maxDurationMs?: bigint;
  /** Maximum number of divisors/pairs allowed for full enumeration (default: 500000n). */
  readonly maxDivisorEnumerationCount?: bigint;
}

export interface RadiusNumberTheoryResult {
  readonly radius: bigint;
  readonly diameter: bigint;
  readonly twoRSquared: bigint;
  readonly rFactorization: CanonicalFactorization;
  readonly twoRSquaredFactorization: TwoRSquaredFactorization;
  readonly certificationStatus: FactorizationCertificationStatus;
  readonly isFactorizationComplete: boolean;
  readonly isDivisorEnumerationComplete: boolean;
  readonly divisorsOfR: readonly bigint[] | null;
  readonly divisorsOfTwoRSquared: readonly bigint[] | null;
  readonly divisorCountOfR: bigint | null;
  readonly divisorCountOfTwoRSquared: bigint | null;
  readonly hyperbolaPairs: readonly HyperbolaDivisorPair[] | null;
  readonly counters: ArithmeticCounters | null;
  readonly warnings: readonly NumberTheoryDiagnostic[];
}
