/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type {
  FactorizationCertificationStatus,
  NumberTheoryDiagnostic,
  RadiusNumberTheoryResult,
} from '../factorization/index.ts';
import type {
  EuclideanParameters,
  PythagoreanTriple,
  RadiusClassificationResult,
} from '../classification/index.ts';
import type { ClassProfileFacetResult } from '../facets/index.ts';

export type PassportSpecVersion = '0.1';
export type PassportStatus = 'COMPLETE' | 'INCOMPLETE';

export interface PassportOddPrimeFactor {
  readonly prime: bigint;
  readonly exponent: bigint;
}

export interface PassportNumberTheorySummary {
  readonly twoExponent: bigint;
  readonly oddPrimeFactors: readonly PassportOddPrimeFactor[];
  readonly omegaStar: bigint | null;
  readonly tauR: bigint | null;
  readonly tauTwoRSquared: bigint | null;
  readonly T: bigint | null;
  readonly N: bigint | null;
  readonly divisorsOfR: readonly bigint[] | null;
}

export interface SubclassSpectrumEntry {
  readonly k: bigint;
  readonly primitiveRadius: bigint;
  readonly actualCount: bigint;
  readonly expectedCount: bigint;
  readonly isCardinalityMatch: boolean;
}

export interface ExpectedMatrixSummary {
  readonly rowCount: bigint | null;
  readonly isSortedByX: boolean;
  readonly firstTripleId: string | null;
  readonly lastTripleId: string | null;
}

export interface ClassPassportResult {
  readonly specVersion: PassportSpecVersion;
  readonly classId: string;
  readonly r: bigint;
  readonly D: bigint;
  readonly twoRSquared: bigint;

  readonly status: PassportStatus;
  readonly isComplete: boolean;
  readonly certificationStatus: FactorizationCertificationStatus;
  readonly isDivisorEnumerationComplete: boolean;
  readonly warnings: readonly string[];

  readonly numberTheory: PassportNumberTheorySummary;
  readonly subclassSpectrum: readonly SubclassSpectrumEntry[];
  readonly profile: ClassProfileFacetResult | null;
  readonly expectedMatrixSummary: ExpectedMatrixSummary;
}

export interface BuildClassPassportInput {
  readonly numberTheory: RadiusNumberTheoryResult;
  readonly classification: RadiusClassificationResult;
  readonly profile?: ClassProfileFacetResult | null;
}

export type ClassifiedTripleInput = Pick<
  PythagoreanTriple,
  'r' | 'k' | 'x' | 'y' | 'primitiveAncestor' | 'euclideanParams'
> & {
  readonly tripleId?: string;
};

export type PassportDiagnosticInput = string | NumberTheoryDiagnostic;
export type ResolvedEuclideanParameters = EuclideanParameters;
