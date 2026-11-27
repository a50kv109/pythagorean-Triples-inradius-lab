/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * Base error for all failures in the M1 Exact Computation Core.
 */
export class ExactArithmeticError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExactArithmeticError';
  }
}

export class InvalidBigIntInputError extends ExactArithmeticError {
  readonly paramName: string;

  constructor(paramName: string, detail: string) {
    super(`Invalid exact integer "${paramName}": ${detail}`);
    this.name = 'InvalidBigIntInputError';
    this.paramName = paramName;
  }
}

export class InvalidRadiusError extends ExactArithmeticError {
  readonly radiusInput: string;

  constructor(radiusInput: string, detail: string) {
    super(`Invalid inradius r (${radiusInput}): ${detail}`);
    this.name = 'InvalidRadiusError';
    this.radiusInput = radiusInput;
  }
}

export class ExactDivisionByZeroError extends ExactArithmeticError {
  constructor(context = 'division by zero') {
    super(`Exact arithmetic error: ${context}`);
    this.name = 'ExactDivisionByZeroError';
  }
}

export class ExactDivisibilityError extends ExactArithmeticError {
  readonly dividend: bigint;
  readonly divisor: bigint;

  constructor(dividend: bigint, divisor: bigint) {
    super(`Exact divisibility failed: ${dividend.toString()} is not divisible by ${divisor.toString()}`);
    this.name = 'ExactDivisibilityError';
    this.dividend = dividend;
    this.divisor = divisor;
  }
}

export class NotPerfectSquareError extends ExactArithmeticError {
  readonly value: bigint;

  constructor(value: bigint) {
    super(`Exact square root failed: ${value.toString()} is not a perfect square`);
    this.name = 'NotPerfectSquareError';
    this.value = value;
  }
}

export class ExactIdentityError extends ExactArithmeticError {
  constructor(detail: string) {
    super(`Exact mathematical identity failed: ${detail}`);
    this.name = 'ExactIdentityError';
  }
}
