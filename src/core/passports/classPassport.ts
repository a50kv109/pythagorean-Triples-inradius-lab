/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { powBigInt } from '../exact/index.ts';
import type { NumberTheoryDiagnostic } from '../factorization/index.ts';
import {
  InvalidRadiusError,
  MissingProfileError,
  PassportInvariantError,
  PassportMismatchError,
} from './errors.ts';
import type {
  BuildClassPassportInput,
  ClassPassportResult,
  ExpectedMatrixSummary,
  PassportNumberTheorySummary,
  PassportOddPrimeFactor,
  SubclassSpectrumEntry,
} from './types.ts';

function formatExpectedClassId(r: bigint): string {
  return `CL-R${r.toString()}-D${(2n * r).toString()}`;
}

function formatDiagnosticWarning(warning: unknown): string {
  if (typeof warning === 'string') {
    return warning;
  }
  if (typeof warning === 'object' && warning !== null) {
    const diag = warning as Partial<NumberTheoryDiagnostic>;
    if (typeof diag.code === 'string' && typeof diag.message === 'string') {
      return `[${diag.code}] ${diag.message}`;
    }
    if (typeof diag.message === 'string') {
      return diag.message;
    }
  }
  return String(warning);
}

function collectWarnings(
  m2Warnings: readonly unknown[],
  m3Warnings: readonly unknown[]
): readonly string[] {
  const seen = new Set<string>();
  const combined: string[] = [];

  for (const w of m2Warnings) {
    const formatted = formatDiagnosticWarning(w);
    if (!seen.has(formatted)) {
      seen.add(formatted);
      combined.push(formatted);
    }
  }
  for (const w of m3Warnings) {
    const formatted = formatDiagnosticWarning(w);
    if (!seen.has(formatted)) {
      seen.add(formatted);
      combined.push(formatted);
    }
  }

  return Object.freeze(combined);
}

function buildNumberTheorySummary(
  input: BuildClassPassportInput['numberTheory']
): PassportNumberTheorySummary {
  const rFact = input.rFactorization;
  const oddPrimeFactors: readonly PassportOddPrimeFactor[] = Object.freeze(
    rFact.oddPrimeFactors.map((factor) =>
      Object.freeze({
        prime: factor.prime,
        exponent: factor.exponent,
      })
    )
  );

  const counters = input.counters;

  return Object.freeze({
    twoExponent: rFact.twoExponent,
    oddPrimeFactors,
    omegaStar: counters ? counters.omegaStar : null,
    tauR: counters ? counters.tauR : null,
    tauTwoRSquared: counters ? counters.tauTwoRSquared : null,
    T: counters ? counters.T : null,
    N: counters ? counters.N : null,
    divisorsOfR: input.divisorsOfR !== null ? Object.freeze([...input.divisorsOfR]) : null,
  });
}

function areSubclassesSortedAscending(
  entries: readonly SubclassSpectrumEntry[]
): boolean {
  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i].k <= entries[i - 1].k) {
      return false;
    }
  }
  return true;
}

/**
 * Builds an immutable ClassPassportResult (`CL-R{r}-D{2r}`) by combining
 * M2 (`RadiusNumberTheoryResult`), M3 (`RadiusClassificationResult`), and
 * M4-S3 (`ClassProfileFacetResult`) without duplicating any lower-layer computations.
 */
export function buildClassPassport(
  input: BuildClassPassportInput
): ClassPassportResult {
  if (typeof input !== 'object' || input === null) {
    throw new PassportMismatchError('buildClassPassport input must be a non-null object');
  }

  const { numberTheory, classification, profile } = input;
  if (!numberTheory || typeof numberTheory !== 'object') {
    throw new PassportMismatchError('numberTheory (M2) result is required');
  }
  if (!classification || typeof classification !== 'object') {
    throw new PassportMismatchError('classification (M3) result is required');
  }

  const r = numberTheory.radius;
  if (typeof r !== 'bigint' || r < 1n) {
    throw new InvalidRadiusError(r);
  }
  if (typeof classification.r !== 'bigint' || classification.r < 1n) {
    throw new InvalidRadiusError(classification.r, 'classification.r must be >= 1n');
  }
  if (classification.r !== r) {
    throw new PassportMismatchError(
      `radius mismatch between M2 (r=${r.toString()}) and M3 (r=${classification.r.toString()})`
    );
  }

  const D = 2n * r;
  const twoRSquared = 2n * r * r;
  if (numberTheory.diameter !== D || numberTheory.twoRSquared !== twoRSquared) {
    throw new PassportMismatchError(
      `M2 diameter/2r^2 mismatch for r=${r.toString()}: expected D=${D.toString()}, 2r^2=${twoRSquared.toString()}`
    );
  }
  if (numberTheory.rFactorization.value !== r) {
    throw new PassportMismatchError(
      `M2 rFactorization.value=${numberTheory.rFactorization.value.toString()} does not match r=${r.toString()}`
    );
  }

  const classId = formatExpectedClassId(r);

  if (profile !== undefined && profile !== null) {
    if (profile.r !== r || profile.classId !== classId) {
      throw new PassportMismatchError(
        `profile mismatch: expected classId=${classId}, r=${r.toString()}, got classId=${profile.classId}, r=${profile.r.toString()}`
      );
    }
  }

  const warnings = collectWarnings(numberTheory.warnings, classification.warnings);
  const ntSummary = buildNumberTheorySummary(numberTheory);

  const m2Complete =
    numberTheory.certificationStatus !== 'INCOMPLETE' &&
    numberTheory.isFactorizationComplete &&
    numberTheory.isDivisorEnumerationComplete &&
    numberTheory.counters !== null &&
    numberTheory.divisorsOfR !== null;

  const m3Status = (classification as { readonly status?: unknown }).status;
  const m3Complete =
    classification.isComplete &&
    (m3Status === undefined || m3Status === 'COMPLETE') &&
    classification.totalTriplesCount > 0n &&
    classification.totalTriplesCount === classification.expectedTotalCount &&
    BigInt(classification.allTriples.length) === classification.totalTriplesCount;

  if (!m2Complete || !m3Complete) {
    const incompleteSummary: ExpectedMatrixSummary = Object.freeze({
      rowCount: null,
      isSortedByX: false,
      firstTripleId: null,
      lastTripleId: null,
    });

    const incompletePassport: ClassPassportResult = Object.freeze({
      specVersion: '0.1',
      classId,
      r,
      D,
      twoRSquared,
      status: 'INCOMPLETE',
      isComplete: false,
      certificationStatus: numberTheory.certificationStatus,
      isDivisorEnumerationComplete: numberTheory.isDivisorEnumerationComplete,
      warnings,
      numberTheory: ntSummary,
      subclassSpectrum: Object.freeze([]),
      profile: null,
      expectedMatrixSummary: incompleteSummary,
    });

    verifyClassPassportInvariants(incompletePassport);
    return incompletePassport;
  }

  if (profile === undefined || profile === null) {
    throw new MissingProfileError(r, classId);
  }

  const counters = numberTheory.counters!;
  if (
    classification.totalTriplesCount !== counters.N ||
    classification.expectedTotalCount !== counters.N
  ) {
    throw new PassportMismatchError(
      `triple count mismatch between M2 (N=${counters.N.toString()}) and M3 (total=${classification.totalTriplesCount.toString()}, expected=${classification.expectedTotalCount.toString()})`
    );
  }

  if (
    profile.allTriples.count !== counters.N ||
    profile.primitiveTriples.count !== counters.T
  ) {
    throw new PassportMismatchError(
      `population count mismatch between M2 (N=${counters.N.toString()}, T=${counters.T.toString()}) and M4-S3 profile (N=${profile.allTriples.count.toString()}, T=${profile.primitiveTriples.count.toString()})`
    );
  }

  const allTriples = classification.allTriples;
  for (let i = 0; i < allTriples.length; i += 1) {
    const triple = allTriples[i];
    if (triple.r !== r || triple.classId !== classId) {
      throw new PassportMismatchError(
        `triple ${triple.tripleId} has r=${triple.r.toString()}, classId=${triple.classId}; expected r=${r.toString()}, classId=${classId}`
      );
    }
    if (i > 0 && triple.x <= allTriples[i - 1].x) {
      throw new PassportMismatchError(
        `classification.allTriples for ${classId} must be strictly sorted by ascending x (got x=${triple.x.toString()} after x=${allTriples[i - 1].x.toString()})`
      );
    }
  }
  const isSortedByX = true;

  const sortedSubclasses = [...classification.subclasses].sort((a, b) =>
    a.k < b.k ? -1 : a.k > b.k ? 1 : 0
  );

  let spectrumTotal = 0n;
  let primitiveSubclassCount: bigint | null = null;
  const subclassSpectrum: SubclassSpectrumEntry[] = sortedSubclasses.map((group) => {
    if (
      group.k <= 0n ||
      group.k * group.primitiveRadius !== r ||
      !group.isCardinalityMatch ||
      group.actualCount !== group.expectedCount
    ) {
      throw new PassportMismatchError(
        `invalid subclass group k=${group.k.toString()} for ${classId}`
      );
    }
    spectrumTotal += group.actualCount;
    if (group.k === 1n) {
      primitiveSubclassCount = group.actualCount;
    }
    return Object.freeze({
      k: group.k,
      primitiveRadius: group.primitiveRadius,
      actualCount: group.actualCount,
      expectedCount: group.expectedCount,
      isCardinalityMatch: group.isCardinalityMatch,
    });
  });

  if (
    spectrumTotal !== counters.N ||
    BigInt(subclassSpectrum.length) !== counters.tauR ||
    primitiveSubclassCount !== counters.T
  ) {
    throw new PassportMismatchError(
      `subclassSpectrum aggregate mismatch for ${classId}: sum=${spectrumTotal.toString()} (expected N=${counters.N.toString()}), len=${subclassSpectrum.length} (expected tauR=${counters.tauR.toString()}), k=1 count=${String(primitiveSubclassCount)} (expected T=${counters.T.toString()})`
    );
  }

  const expectedMatrixSummary: ExpectedMatrixSummary = Object.freeze({
    rowCount: counters.N,
    isSortedByX,
    firstTripleId: allTriples.length > 0 ? allTriples[0].tripleId : null,
    lastTripleId: allTriples.length > 0 ? allTriples[allTriples.length - 1].tripleId : null,
  });

  const completePassport: ClassPassportResult = Object.freeze({
    specVersion: '0.1',
    classId,
    r,
    D,
    twoRSquared,
    status: 'COMPLETE',
    isComplete: true,
    certificationStatus: numberTheory.certificationStatus,
    isDivisorEnumerationComplete: numberTheory.isDivisorEnumerationComplete,
    warnings,
    numberTheory: ntSummary,
    subclassSpectrum: Object.freeze(subclassSpectrum),
    profile,
    expectedMatrixSummary,
  });

  verifyClassPassportInvariants(completePassport);
  return completePassport;
}

/**
 * Independently verifies all ClassPassport invariants CP-INV-01..08.
 */
export function verifyClassPassportInvariants(passport: ClassPassportResult): void {
  const {
    r,
    D,
    twoRSquared,
    classId,
    status,
    isComplete,
    certificationStatus,
    isDivisorEnumerationComplete,
    numberTheory,
    subclassSpectrum,
    profile,
    expectedMatrixSummary,
  } = passport;

  // CP-INV-01: D === 2n * r, twoRSquared === 2n * r * r, classId === CL-R{r}-D{D}
  if (
    typeof r !== 'bigint' ||
    r < 1n ||
    D !== 2n * r ||
    twoRSquared !== 2n * r * r ||
    classId !== formatExpectedClassId(r)
  ) {
    throw new PassportInvariantError(
      'CP-INV-01',
      `identity/dimensions mismatch for r=${String(r)}, D=${String(D)}, twoRSquared=${String(twoRSquared)}, classId=${classId}`
    );
  }

  // CP-INV-02: isComplete === (status === 'COMPLETE') and completeness equivalence
  if (isComplete !== (status === 'COMPLETE')) {
    throw new PassportInvariantError(
      'CP-INV-02',
      `isComplete=${String(isComplete)} disagrees with status=${status} for ${classId}`
    );
  }
  if (status === 'COMPLETE') {
    if (
      certificationStatus === 'INCOMPLETE' ||
      !isDivisorEnumerationComplete ||
      profile === null
    ) {
      throw new PassportInvariantError(
        'CP-INV-02',
        `COMPLETE status requires non-INCOMPLETE M2 certification, complete divisor enumeration, and non-null profile for ${classId}`
      );
    }
  } else {
    // CP-INV-07: INCOMPLETE invariants
    if (
      profile !== null ||
      subclassSpectrum.length !== 0 ||
      expectedMatrixSummary.rowCount !== null ||
      expectedMatrixSummary.isSortedByX !== false ||
      expectedMatrixSummary.firstTripleId !== null ||
      expectedMatrixSummary.lastTripleId !== null
    ) {
      throw new PassportInvariantError(
        'CP-INV-07',
        `INCOMPLETE passport ${classId} must have profile=null, empty subclassSpectrum, and null expectedMatrixSummary boundaries`
      );
    }
    return;
  }

  // CP-INV-03: COMPLETE number-theoretic counters T = 2^omega* and N = (e0+1)*prod(2e_i+1)
  const {
    twoExponent,
    oddPrimeFactors,
    omegaStar,
    tauR,
    tauTwoRSquared,
    T,
    N,
    divisorsOfR,
  } = numberTheory;

  if (
    omegaStar === null ||
    tauR === null ||
    tauTwoRSquared === null ||
    T === null ||
    N === null ||
    divisorsOfR === null
  ) {
    throw new PassportInvariantError(
      'CP-INV-03',
      `COMPLETE passport ${classId} cannot have null M2 counters or divisorsOfR`
    );
  }

  if (omegaStar !== BigInt(oddPrimeFactors.length)) {
    throw new PassportInvariantError(
      'CP-INV-03',
      `omegaStar=${omegaStar.toString()} disagrees with oddPrimeFactors.length=${oddPrimeFactors.length} for ${classId}`
    );
  }

  let expectedTauR = twoExponent + 1n;
  let oddProd = 1n;
  for (const factor of oddPrimeFactors) {
    expectedTauR *= factor.exponent + 1n;
    oddProd *= 2n * factor.exponent + 1n;
  }
  const expectedT = powBigInt(2n, omegaStar);
  const expectedN = (twoExponent + 1n) * oddProd;
  const expectedTauTwoRSquared = 2n * expectedN;

  if (
    T !== expectedT ||
    N !== expectedN ||
    tauR !== expectedTauR ||
    tauTwoRSquared !== expectedTauTwoRSquared ||
    BigInt(divisorsOfR.length) !== tauR
  ) {
    throw new PassportInvariantError(
      'CP-INV-03',
      `counter formula check failed for ${classId}: T=${T.toString()}, N=${N.toString()}, tauR=${tauR.toString()}, tauTwoRSquared=${tauTwoRSquared.toString()}`
    );
  }

  // CP-INV-04: subclassSpectrum sorted ascending by k, length === tauR, sum(actualCount) === N
  if (
    BigInt(subclassSpectrum.length) !== tauR ||
    !areSubclassesSortedAscending(subclassSpectrum)
  ) {
    throw new PassportInvariantError(
      'CP-INV-04',
      `subclassSpectrum sorting or length=${subclassSpectrum.length} vs tauR=${tauR.toString()} failed for ${classId}`
    );
  }

  let spectrumSum = 0n;
  for (const entry of subclassSpectrum) {
    if (
      entry.k <= 0n ||
      entry.k * entry.primitiveRadius !== r ||
      !entry.isCardinalityMatch ||
      entry.actualCount !== entry.expectedCount
    ) {
      throw new PassportInvariantError(
        'CP-INV-04',
        `invalid subclassSpectrum entry k=${entry.k.toString()} for ${classId}`
      );
    }
    spectrumSum += entry.actualCount;
  }
  if (spectrumSum !== N) {
    throw new PassportInvariantError(
      'CP-INV-04',
      `sum(subclassSpectrum.actualCount)=${spectrumSum.toString()} !== N=${N.toString()} for ${classId}`
    );
  }

  // CP-INV-05: embedded M4-S3 profile count and identity consistency
  if (
    profile.r !== r ||
    profile.classId !== classId ||
    profile.allTriples.count !== N ||
    profile.primitiveTriples.count !== T
  ) {
    throw new PassportInvariantError(
      'CP-INV-05',
      `profile consistency failed for ${classId}`
    );
  }

  // CP-INV-06: expectedMatrixSummary consistency for COMPLETE passport
  if (
    expectedMatrixSummary.rowCount !== N ||
    expectedMatrixSummary.isSortedByX !== true ||
    expectedMatrixSummary.firstTripleId === null ||
    expectedMatrixSummary.lastTripleId === null
  ) {
    throw new PassportInvariantError(
      'CP-INV-06',
      `expectedMatrixSummary mismatch for ${classId}: rowCount=${String(expectedMatrixSummary.rowCount)}, isSortedByX=${String(expectedMatrixSummary.isSortedByX)}, N=${N.toString()}`
    );
  }

  // CP-INV-08: PROBABLE_COMPLETE remains computationally COMPLETE when M3/M4 are complete
  if (certificationStatus === 'PROBABLE_COMPLETE' && (!isComplete || status !== 'COMPLETE')) {
    throw new PassportInvariantError(
      'CP-INV-08',
      `PROBABLE_COMPLETE failed completeness invariant for ${classId}`
    );
  }
}
