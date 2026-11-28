/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { gcdBigInt } from '../exact/index.ts';
import {
  recoverEuclideanParameters,
  type EuclideanParameters,
} from '../classification/index.ts';
import { EuclidAdapterError } from './errors.ts';
import type { ClassifiedTripleInput } from './types.ts';

function freezeEuclideanParameters(params: EuclideanParameters): EuclideanParameters {
  return Object.freeze({
    m: params.m,
    n: params.n,
    u: params.u,
    v: params.v,
  });
}

function validatePositiveBigInt(value: unknown, label: string, context: string): bigint {
  if (typeof value !== 'bigint' || value <= 0n) {
    throw new EuclidAdapterError(`${context}: "${label}" must be a positive bigint`);
  }
  return value;
}

/**
 * Resolves Euclidean parameters { m, n, u, v } for a classified triple without
 * duplicating M3 work:
 * - Reads precomputed `triple.euclideanParams` when present and validates structural consistency.
 * - Falls back to M3 `recoverEuclideanParameters(x0, y0)` only when `euclideanParams` is absent.
 */
export function resolveEuclideanParameters(
  triple: ClassifiedTripleInput
): EuclideanParameters {
  if (typeof triple !== 'object' || triple === null) {
    throw new EuclidAdapterError('triple must be a non-null object');
  }

  const label = triple.tripleId ?? 'classified triple';
  const r = validatePositiveBigInt(triple.r, 'r', label);
  const k = validatePositiveBigInt(triple.k, 'k', label);
  const x = validatePositiveBigInt(triple.x, 'x', label);
  const y = validatePositiveBigInt(triple.y, 'y', label);

  if (r % k !== 0n || x % k !== 0n || y % k !== 0n) {
    throw new EuclidAdapterError(
      `${label}: scale factor k=${k.toString()} must divide r=${r.toString()}, x=${x.toString()}, y=${y.toString()}`
    );
  }

  const r0 = r / k;
  const x0 = x / k;
  const y0 = y / k;

  if (triple.primitiveAncestor) {
    if (triple.primitiveAncestor.x !== x0 || triple.primitiveAncestor.y !== y0) {
      throw new EuclidAdapterError(
        `${label}: primitiveAncestor shifts (${triple.primitiveAncestor.x.toString()}, ${triple.primitiveAncestor.y.toString()}) do not match (x/k, y/k)=(${x0.toString()}, ${y0.toString()})`
      );
    }
  }

  if (triple.euclideanParams !== undefined) {
    const ep = triple.euclideanParams;
    if (typeof ep !== 'object' || ep === null) {
      throw new EuclidAdapterError(`${label}: euclideanParams must be an object when provided`);
    }
    const m = validatePositiveBigInt(ep.m, 'euclideanParams.m', label);
    const n = validatePositiveBigInt(ep.n, 'euclideanParams.n', label);
    const u = validatePositiveBigInt(ep.u, 'euclideanParams.u', label);
    const v = validatePositiveBigInt(ep.v, 'euclideanParams.v', label);

    const vSq = v * v;
    const twoUSq = 2n * u * u;
    const matchesPrimitiveShifts =
      (x0 === vSq && y0 === twoUSq) || (x0 === twoUSq && y0 === vSq);

    if (
      n !== u ||
      m !== u + v ||
      m <= n ||
      u * v !== r0 ||
      gcdBigInt(m, n) !== 1n ||
      (m + n) % 2n === 0n ||
      !matchesPrimitiveShifts
    ) {
      throw new EuclidAdapterError(
        `${label}: precomputed euclideanParams (m=${m.toString()}, n=${n.toString()}, u=${u.toString()}, v=${v.toString()}) violate M3 primitive identity or shifts (x0=${x0.toString()}, y0=${y0.toString()}) for r0=${r0.toString()}`
      );
    }

    return freezeEuclideanParameters(ep);
  }

  // Fallback to M3 recovery only when optional euclideanParams was omitted
  return freezeEuclideanParameters(recoverEuclideanParameters(x0, y0));
}
