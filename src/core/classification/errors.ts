/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export class ClassificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClassificationError';
  }
}

export class InvalidTripleError extends ClassificationError {
  constructor(r: bigint, x: bigint, y: bigint, message: string) {
    super(
      `Invalid Pythagorean triple for r=${r.toString()}, x=${x.toString()}, y=${y.toString()}: ${message}`
    );
    this.name = 'InvalidTripleError';
  }
}

export class EuclideanRecoveryError extends ClassificationError {
  constructor(a: bigint, b: bigint, c: bigint, message: string) {
    super(
      `Failed Euclidean parameter recovery for triple (${a.toString()}, ${b.toString()}, ${c.toString()}): ${message}`
    );
    this.name = 'EuclideanRecoveryError';
  }
}

export class SubclassMismatchError extends ClassificationError {
  constructor(r: bigint, k: bigint, actual: bigint, expected: bigint) {
    super(
      `Subclass cardinality mismatch for r=${r.toString()}, k=${k.toString()}: actual=${actual.toString()}, expected=${expected.toString()}`
    );
    this.name = 'SubclassMismatchError';
  }
}
