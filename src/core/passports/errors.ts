/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export type ClassPassportErrorCode =
  | 'INVALID_RADIUS'
  | 'PASSPORT_MISMATCH'
  | 'MISSING_PROFILE'
  | 'INVARIANT_VIOLATION'
  | 'EUCLID_ADAPTER_ERROR';

export class ClassPassportError extends Error {
  readonly code: ClassPassportErrorCode;

  constructor(code: ClassPassportErrorCode, message: string) {
    super(message);
    this.name = 'ClassPassportError';
    this.code = code;
  }
}

export class InvalidRadiusError extends ClassPassportError {
  constructor(r: unknown, reason = 'inradius r must be a positive bigint >= 1n') {
    super('INVALID_RADIUS', `Invalid radius ${String(r)} for ClassPassport: ${reason}`);
    this.name = 'InvalidRadiusError';
  }
}

export class PassportMismatchError extends ClassPassportError {
  constructor(message: string) {
    super('PASSPORT_MISMATCH', `ClassPassport consistency mismatch: ${message}`);
    this.name = 'PassportMismatchError';
  }
}

export class MissingProfileError extends ClassPassportError {
  constructor(r: bigint, classId: string) {
    super(
      'MISSING_PROFILE',
      `Cannot build complete ClassPassport for ${classId} (r=${r.toString()}): M4-S3 ClassProfileFacetResult is required when M2 and M3 are complete`
    );
    this.name = 'MissingProfileError';
  }
}

export class PassportInvariantError extends ClassPassportError {
  constructor(invariantId: string, message: string) {
    super('INVARIANT_VIOLATION', `${invariantId} violated: ${message}`);
    this.name = 'PassportInvariantError';
  }
}

export class EuclidAdapterError extends ClassPassportError {
  constructor(message: string) {
    super('EUCLID_ADAPTER_ERROR', `Euclidean parameter adapter failed: ${message}`);
    this.name = 'EuclidAdapterError';
  }
}
