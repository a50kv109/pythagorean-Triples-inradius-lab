/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * Shared assertion & specification helpers for Canonical Shadow Stand tests (`CT-01`..`CT-03`).
 * Keeps invariant IDs, tolerance checks, and formal test-passport metadata DRY across CT suites.
 */

import assert from 'node:assert/strict';
import {
  validateCanonicalFourCirclesInvariants,
  type CanonicalFourCirclesModel,
} from '../../canonical/index.ts';

export const CANONICAL_CORE_TOLERANCE = 1e-9;
export const CANONICAL_BRIDGE_TOLERANCE = 1e-12;

export const EXPECTED_CANONICAL_CORE_INVARIANT_IDS = [
  'incircle_positive',
  'squares_construction',
  'square_circles_tangency',
  'incircle_tangency',
  'four_circle_areas',
  'central_sqrt_identity',
  'pythagorean_circle_areas',
  'area_non_equality_contrast',
] as const;

export interface CanonicalTestPassport {
  readonly testId: string;
  readonly legacyTestId: string;
  readonly legacySource: string;
  readonly mathematicalPrinciple: string;
  readonly inputsDescription: string;
  readonly canonicalNotation: readonly string[];
  readonly expectedInvariants: readonly string[];
  readonly legacyLink: string;
  readonly passCriteria: string;
}

export function assertClose(
  actual: number,
  expected: number,
  message: string,
  tol = CANONICAL_CORE_TOLERANCE
): void {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tol, `${message}: expected ${expected}, got ${actual} (diff=${diff})`);
}

export function assertRelativeClose(
  actual: number,
  expected: number,
  message: string,
  tol = CANONICAL_CORE_TOLERANCE
): void {
  const diff = Math.abs(actual - expected);
  const scale = Math.max(1e-300, Math.abs(expected));
  assert.ok(
    diff <= tol * scale,
    `${message}: expected ${expected}, got ${actual} (relDiff=${diff / scale})`
  );
}

export function assertAllCanonicalCoreInvariantsValid(
  model: CanonicalFourCirclesModel,
  label: string,
  tol = CANONICAL_CORE_TOLERANCE
): void {
  const invariants = validateCanonicalFourCirclesInvariants(model, tol);
  assert.deepEqual(
    invariants.map((inv) => inv.id),
    [...EXPECTED_CANONICAL_CORE_INVARIANT_IDS],
    `${label}: canonical invariant IDs must match specification`
  );
  for (const inv of invariants) {
    assert.ok(inv.isValid, `${label} canonical invariant failed: ${inv.name} (delta=${inv.delta})`);
  }
}
