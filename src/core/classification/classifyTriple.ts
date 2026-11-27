/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { gcdBigInt } from '../exact/index.ts';
import { reconstructTriple } from './reconstructTriple.ts';
import { recoverEuclideanParameters } from './recoverEuclideanParameters.ts';
import type { PythagoreanTriple } from './types.ts';

/**
 * Classifies a reconstructed Pythagorean triple with scale factor k, primitive ancestor,
 * standard identifiers, and Euclidean parameters.
 */
export function classifyTriple(r: bigint, x: bigint, y: bigint): PythagoreanTriple {
  const { a, b, c } = reconstructTriple(r, x, y);
  const D = 2n * r;
  const k = gcdBigInt(gcdBigInt(a, b), c);
  const isPrimitive = k === 1n;
  const primitiveRadius = r / k;

  const a0 = a / k;
  const b0 = b / k;
  const c0 = c / k;
  const x0 = x / k;
  const y0 = y / k;

  const classId = `CL-R${r.toString()}-D${D.toString()}`;
  const tripleId = `PT-R${r.toString()}-K${k.toString()}-X${x.toString()}`;
  const primId = `PT-R${primitiveRadius.toString()}-K1-X${x0.toString()}`;

  const euclideanParams = recoverEuclideanParameters(x0, y0);

  // Validate Euclidean reconstruction
  const em = euclideanParams.m;
  const en = euclideanParams.n;
  const ea0 = em * em - en * en;
  const eb0 = 2n * em * en;
  const ec0 = em * em + en * en;

  const primMin = ea0 < eb0 ? ea0 : eb0;
  const primMax = ea0 < eb0 ? eb0 : ea0;
  const expectedMin = a0 < b0 ? a0 : b0;
  const expectedMax = a0 < b0 ? b0 : a0;

  if (primMin !== expectedMin || primMax !== expectedMax || ec0 !== c0) {
    throw new Error(
      `Euclidean parameter reconstruction failed for primitive ancestor (${a0.toString()}, ${b0.toString()}, ${c0.toString()}) with m=${em.toString()}, n=${en.toString()}`
    );
  }

  return {
    r,
    D,
    x,
    y,
    a,
    b,
    c,
    k,
    isPrimitive,
    primitiveRadius,
    primitiveAncestor: {
      a: a0,
      b: b0,
      c: c0,
      x: x0,
      y: y0,
    },
    classId,
    tripleId,
    primId,
    euclideanParams,
  };
}
