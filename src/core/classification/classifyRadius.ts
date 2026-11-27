/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { buildSubclasses } from './buildSubclasses.ts';
import type { RadiusClassificationResult } from './types.ts';

/**
 * Top-level classification pipeline entry point for a given inradius r.
 */
export function classifyRadius(r: bigint): RadiusClassificationResult {
  return buildSubclasses(r);
}
