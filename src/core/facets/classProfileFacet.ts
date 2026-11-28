/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  RATIONAL_ONE,
  RATIONAL_ZERO,
  addRational,
  createRational,
  divRational,
  eqRational,
  gtRational,
  gteRational,
  ltRational,
  lteRational,
  rationalFromBigInt,
  type ExactRational,
} from '../exact/index.ts';
import type { PythagoreanTriple, RadiusClassificationResult } from '../classification/index.ts';
import { ClassProfileFacetError } from './errors.ts';
import type {
  BerggrenFacetResult,
  ClassPopulationMetrics,
  ClassProfileFacetResult,
  PrimitivePopulationMetrics,
  SpornFacetResult,
  SpornZone,
  ZoneHistogram,
} from './types.ts';

interface MutableZoneHistogram {
  Z1_A1: bigint;
  Z3_A3: bigint;
  Z0_ROOT: bigint;
  Z2_A2: bigint;
}

const SPORN_ZONES: readonly SpornZone[] = ['Z1_A1', 'Z3_A3', 'Z0_ROOT', 'Z2_A2'];

function createEmptyZoneHistogram(): MutableZoneHistogram {
  return {
    Z1_A1: 0n,
    Z3_A3: 0n,
    Z0_ROOT: 0n,
    Z2_A2: 0n,
  };
}

function freezeZoneHistogram(hist: MutableZoneHistogram): ZoneHistogram {
  return Object.freeze({
    Z1_A1: hist.Z1_A1,
    Z3_A3: hist.Z3_A3,
    Z0_ROOT: hist.Z0_ROOT,
    Z2_A2: hist.Z2_A2,
  });
}

function sumZones(hist: ZoneHistogram): bigint {
  return hist.Z1_A1 + hist.Z3_A3 + hist.Z0_ROOT + hist.Z2_A2;
}

/**
 * Balanced pairwise (divide-and-conquer) exact rational summation.
 * Keeps intermediate denominator growth logarithmic in recursion depth for large N(r).
 */
function sumRationalsPairwiseRange(
  items: readonly ExactRational[],
  start: number,
  end: number
): ExactRational {
  const len = end - start;
  if (len <= 0) {
    return RATIONAL_ZERO;
  }
  if (len === 1) {
    return items[start];
  }
  if (len === 2) {
    return addRational(items[start], items[start + 1]);
  }
  const mid = start + (len >> 1);
  return addRational(
    sumRationalsPairwiseRange(items, start, mid),
    sumRationalsPairwiseRange(items, mid, end)
  );
}

function computeExactRationalMean(items: readonly ExactRational[]): ExactRational {
  const count = BigInt(items.length);
  if (count <= 0n) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      'Cannot compute exact rational mean of empty population'
    );
  }
  const total = sumRationalsPairwiseRange(items, 0, items.length);
  return divRational(total, rationalFromBigInt(count));
}

function formatExpectedClassId(r: bigint): string {
  return `CL-R${r.toString()}-D${(2n * r).toString()}`;
}

/**
 * Builds the aggregated ClassProfileFacetResult for a single complete radius class C(r)
 * by joining M3 classification results with M4-S1 (SpornFacet) and M4-S2 (BerggrenFacet)
 * via a strict 1-to-1 bijection on tripleId.
 */
export function buildClassProfileFacet(
  classification: RadiusClassificationResult,
  spornFacets: readonly SpornFacetResult[],
  berggrenFacets: readonly BerggrenFacetResult[]
): ClassProfileFacetResult {
  const r = classification.r;
  if (typeof r !== 'bigint' || r < 1n) {
    throw new ClassProfileFacetError(
      'INVALID_RADIUS',
      `ClassProfileFacet requires radius r >= 1n, received ${String(r)}`
    );
  }

  const status = (classification as { readonly status?: unknown }).status;
  if (
    !classification.isComplete ||
    (status !== undefined && status !== 'COMPLETE') ||
    classification.totalTriplesCount <= 0n ||
    classification.totalTriplesCount !== classification.expectedTotalCount
  ) {
    throw new ClassProfileFacetError(
      'INCOMPLETE_CLASSIFICATION_RESULT',
      `Cannot build ClassProfileFacet for r=${r.toString()}: M3 classification result is incomplete`
    );
  }

  const expectedN = classification.totalTriplesCount;
  if (
    BigInt(classification.allTriples.length) !== expectedN ||
    BigInt(spornFacets.length) !== expectedN ||
    BigInt(berggrenFacets.length) !== expectedN
  ) {
    throw new ClassProfileFacetError(
      'FACET_COUNT_MISMATCH',
      `Count mismatch for r=${r.toString()}: expected N=${expectedN.toString()}, got triples=${classification.allTriples.length}, sporn=${spornFacets.length}, berggren=${berggrenFacets.length}`
    );
  }

  const expectedClassId = formatExpectedClassId(r);

  const tripleById = new Map<string, PythagoreanTriple>();
  for (const triple of classification.allTriples) {
    if (triple.r !== r || triple.classId !== expectedClassId) {
      throw new ClassProfileFacetError(
        'CLASS_ID_MISMATCH',
        `Triple ${triple.tripleId} has classId=${triple.classId}, r=${triple.r.toString()}; expected classId=${expectedClassId}, r=${r.toString()}`
      );
    }
    if (tripleById.has(triple.tripleId)) {
      throw new ClassProfileFacetError(
        'DUPLICATE_TRIPLE_ID',
        `Duplicate tripleId ${triple.tripleId} in M3 classification for ${expectedClassId}`
      );
    }
    tripleById.set(triple.tripleId, triple);
  }

  const spornById = new Map<string, SpornFacetResult>();
  for (const sporn of spornFacets) {
    if (sporn.r !== r || sporn.classId !== expectedClassId) {
      throw new ClassProfileFacetError(
        'CLASS_ID_MISMATCH',
        `SpornFacet ${sporn.tripleId} has classId=${sporn.classId}, r=${sporn.r.toString()}; expected classId=${expectedClassId}, r=${r.toString()}`
      );
    }
    if (spornById.has(sporn.tripleId)) {
      throw new ClassProfileFacetError(
        'DUPLICATE_TRIPLE_ID',
        `Duplicate tripleId ${sporn.tripleId} in SpornFacet list for ${expectedClassId}`
      );
    }
    spornById.set(sporn.tripleId, sporn);
  }

  const berggrenById = new Map<string, BerggrenFacetResult>();
  for (const berggren of berggrenFacets) {
    if (berggren.r !== r || berggren.classId !== expectedClassId) {
      throw new ClassProfileFacetError(
        'CLASS_ID_MISMATCH',
        `BerggrenFacet ${berggren.tripleId} has classId=${berggren.classId}, r=${berggren.r.toString()}; expected classId=${expectedClassId}, r=${r.toString()}`
      );
    }
    if (berggrenById.has(berggren.tripleId)) {
      throw new ClassProfileFacetError(
        'DUPLICATE_TRIPLE_ID',
        `Duplicate tripleId ${berggren.tripleId} in BerggrenFacet list for ${expectedClassId}`
      );
    }
    berggrenById.set(berggren.tripleId, berggren);
  }

  // Verify strict 1-to-1 bijection across M3, M4-S1, M4-S2 and separate populations
  let cMin: bigint | null = null;
  let cMax: bigint | null = null;
  let spornXMin: ExactRational | null = null;
  let spornXMax: ExactRational | null = null;

  const allSpornX: ExactRational[] = [];
  const allADivC: ExactRational[] = [];
  const allZones = createEmptyZoneHistogram();

  const primSpornX: ExactRational[] = [];
  const primADivC: ExactRational[] = [];
  const primZones = createEmptyZoneHistogram();
  let berggrenDepthMin: bigint | null = null;
  let berggrenDepthMax: bigint | null = null;

  for (const triple of classification.allTriples) {
    const sporn = spornById.get(triple.tripleId);
    const berggren = berggrenById.get(triple.tripleId);
    if (!sporn || !berggren) {
      throw new ClassProfileFacetError(
        'TRIPLE_ID_MISMATCH',
        `Missing matching M4 facet for tripleId ${triple.tripleId} in ${expectedClassId}`
      );
    }

    const tripleIsPrim = triple.isPrimitive && triple.k === 1n;
    if (
      triple.isPrimitive !== (triple.k === 1n) ||
      sporn.isPrimitive !== tripleIsPrim ||
      berggren.isPrimitive !== tripleIsPrim ||
      sporn.k !== triple.k ||
      berggren.k !== triple.k
    ) {
      throw new ClassProfileFacetError(
        'INVARIANT_VIOLATION',
        `Inconsistent primitive/scale metadata across M3/S1/S2 for tripleId ${triple.tripleId}`
      );
    }

    if (cMin === null || triple.c < cMin) {
      cMin = triple.c;
    }
    if (cMax === null || triple.c > cMax) {
      cMax = triple.c;
    }

    if (spornXMin === null || ltRational(sporn.spornX, spornXMin)) {
      spornXMin = sporn.spornX;
    }
    if (spornXMax === null || gtRational(sporn.spornX, spornXMax)) {
      spornXMax = sporn.spornX;
    }

    allSpornX.push(sporn.spornX);
    allADivC.push(sporn.sinA);
    allZones[sporn.spornZone] += 1n;

    if (tripleIsPrim) {
      primSpornX.push(sporn.spornX);
      primADivC.push(sporn.sinA);
      primZones[sporn.spornZone] += 1n;

      if (berggrenDepthMin === null || berggren.treeDepth < berggrenDepthMin) {
        berggrenDepthMin = berggren.treeDepth;
      }
      if (berggrenDepthMax === null || berggren.treeDepth > berggrenDepthMax) {
        berggrenDepthMax = berggren.treeDepth;
      }
    }
  }

  for (const spornId of spornById.keys()) {
    if (!tripleById.has(spornId)) {
      throw new ClassProfileFacetError(
        'TRIPLE_ID_MISMATCH',
        `Extraneous SpornFacet tripleId ${spornId} not found in M3 classification for ${expectedClassId}`
      );
    }
  }
  for (const berggrenId of berggrenById.keys()) {
    if (!tripleById.has(berggrenId)) {
      throw new ClassProfileFacetError(
        'TRIPLE_ID_MISMATCH',
        `Extraneous BerggrenFacet tripleId ${berggrenId} not found in M3 classification for ${expectedClassId}`
      );
    }
  }

  if (primSpornX.length === 0 || berggrenDepthMin === null || berggrenDepthMax === null) {
    throw new ClassProfileFacetError(
      'PRIMITIVE_SET_EMPTY',
      `Primitive population is empty for ${expectedClassId}`
    );
  }

  const k1Subclass = classification.subclasses.find((group) => group.k === 1n);
  if (
    !k1Subclass ||
    !k1Subclass.isCardinalityMatch ||
    k1Subclass.actualCount !== k1Subclass.expectedCount
  ) {
    throw new ClassProfileFacetError(
      'INCOMPLETE_CLASSIFICATION_RESULT',
      `Missing or mismatched primitive k=1 subclass metadata for ${expectedClassId}`
    );
  }
  const expectedT = k1Subclass.expectedCount;

  if (cMin === null || cMax === null || spornXMin === null || spornXMax === null) {
    throw new ClassProfileFacetError(
      'INCOMPLETE_CLASSIFICATION_RESULT',
      `Empty triple extrema for ${expectedClassId}`
    );
  }

  const allMetrics: ClassPopulationMetrics = Object.freeze({
    count: BigInt(allSpornX.length),
    meanSpornX: computeExactRationalMean(allSpornX),
    meanADivC: computeExactRationalMean(allADivC),
    zoneHistogram: freezeZoneHistogram(allZones),
  });

  const primitiveMetrics: PrimitivePopulationMetrics = Object.freeze({
    count: BigInt(primSpornX.length),
    meanSpornX: computeExactRationalMean(primSpornX),
    meanADivC: computeExactRationalMean(primADivC),
    zoneHistogram: freezeZoneHistogram(primZones),
    berggrenDepthMin,
    berggrenDepthMax,
  });

  const profile: ClassProfileFacetResult = Object.freeze({
    classId: expectedClassId,
    r,
    cMin,
    cMax,
    cMinRatio: createRational(cMin, r),
    hasSub5rCompression: cMin < 5n * r,
    spornXMin,
    spornXMax,
    allTriples: allMetrics,
    primitiveTriples: primitiveMetrics,
  });

  verifyClassProfileInvariants(profile, { expectedN, expectedT });
  return profile;
}

/**
 * Independently verifies all twelve mathematical invariants CPF-INV-01..12
 * on a ClassProfileFacetResult against mandatory expected counts { expectedN, expectedT }.
 */
export function verifyClassProfileInvariants(
  profile: ClassProfileFacetResult,
  expectedCounts: { readonly expectedN: bigint; readonly expectedT: bigint }
): void {
  const { r, classId, cMin, cMax, cMinRatio, hasSub5rCompression, spornXMin, spornXMax } = profile;
  const { allTriples, primitiveTriples } = profile;

  if (r < 1n) {
    throw new ClassProfileFacetError('INVARIANT_VIOLATION', `CPF-INV failed: invalid radius r=${r.toString()}`);
  }
  if (classId !== formatExpectedClassId(r)) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `classId mismatch: expected ${formatExpectedClassId(r)}, got ${classId}`
    );
  }

  // CPF-INV-01: allTriples.count === expectedN and primitiveTriples.count === expectedT
  if (
    expectedCounts.expectedN < 1n ||
    expectedCounts.expectedT < 1n ||
    allTriples.count !== expectedCounts.expectedN ||
    primitiveTriples.count !== expectedCounts.expectedT ||
    allTriples.count < primitiveTriples.count
  ) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-01 failed for ${classId}: N=${allTriples.count.toString()} (expected ${expectedCounts.expectedN.toString()}), T=${primitiveTriples.count.toString()} (expected ${expectedCounts.expectedT.toString()})`
    );
  }

  // CPF-INV-02: 0 < cMin <= 5r and cMinRatio === cMin / r
  if (cMin <= 0n || cMin > 5n * r || !eqRational(cMinRatio, createRational(cMin, r))) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-02 failed for ${classId}: cMin=${cMin.toString()}, r=${r.toString()}`
    );
  }

  // CPF-INV-03: cMax === 2r^2 + 2r + 1 and cMin <= cMax (equality iff r === 1)
  const expectedCMax = 2n * r * r + 2n * r + 1n;
  if (
    cMax !== expectedCMax ||
    cMin > cMax ||
    (r === 1n ? cMin !== cMax : cMin >= cMax)
  ) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-03 failed for ${classId}: cMin=${cMin.toString()}, cMax=${cMax.toString()}, expectedCMax=${expectedCMax.toString()}`
    );
  }

  // CPF-INV-04: hasSub5rCompression === (cMin < 5r) === (allTriples.zoneHistogram.Z2_A2 > 0)
  if (
    hasSub5rCompression !== (cMin < 5n * r) ||
    hasSub5rCompression !== (allTriples.zoneHistogram.Z2_A2 > 0n)
  ) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-04 failed for ${classId}: hasSub5rCompression=${String(hasSub5rCompression)}, cMin=${cMin.toString()}, Z2_A2=${allTriples.zoneHistogram.Z2_A2.toString()}`
    );
  }

  // CPF-INV-05: sum(allTriples.zoneHistogram) === allTriples.count
  for (const zone of SPORN_ZONES) {
    if (allTriples.zoneHistogram[zone] < 0n || primitiveTriples.zoneHistogram[zone] < 0n) {
      throw new ClassProfileFacetError(
        'INVARIANT_VIOLATION',
        `Negative zone count in ${zone} for ${classId}`
      );
    }
  }
  if (sumZones(allTriples.zoneHistogram) !== allTriples.count) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-05 failed for ${classId}: sum(zonesAll) !== ${allTriples.count.toString()}`
    );
  }

  // CPF-INV-06: sum(primitiveTriples.zoneHistogram) === primitiveTriples.count
  if (sumZones(primitiveTriples.zoneHistogram) !== primitiveTriples.count) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-06 failed for ${classId}: sum(zonesPrim) !== ${primitiveTriples.count.toString()}`
    );
  }

  // CPF-INV-07: allTriples.zoneHistogram.Z0_ROOT === 1n
  if (allTriples.zoneHistogram.Z0_ROOT !== 1n) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-07 failed for ${classId}: allTriples Z0_ROOT=${allTriples.zoneHistogram.Z0_ROOT.toString()}`
    );
  }

  // CPF-INV-08: primitiveTriples.zoneHistogram.Z0_ROOT === (r === 1n ? 1n : 0n)
  const expectedPrimRoot = r === 1n ? 1n : 0n;
  if (primitiveTriples.zoneHistogram.Z0_ROOT !== expectedPrimRoot) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-08 failed for ${classId}: primitive Z0_ROOT=${primitiveTriples.zoneHistogram.Z0_ROOT.toString()}, expected ${expectedPrimRoot.toString()}`
    );
  }

  // CPF-INV-09: spornXMin === 1/r, spornXMax >= 1, and (spornXMax === 1) === !hasSub5rCompression
  const expectedSpornXMin = createRational(1n, r);
  if (
    !eqRational(spornXMin, expectedSpornXMin) ||
    !gteRational(spornXMax, RATIONAL_ONE) ||
    eqRational(spornXMax, RATIONAL_ONE) !== !hasSub5rCompression ||
    !lteRational(spornXMin, spornXMax)
  ) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-09 failed for ${classId}: spornX bounds invalid`
    );
  }

  // CPF-INV-10: allTriples.zoneHistogram[z] >= primitiveTriples.zoneHistogram[z] for every zone
  for (const zone of SPORN_ZONES) {
    if (allTriples.zoneHistogram[zone] < primitiveTriples.zoneHistogram[zone]) {
      throw new ClassProfileFacetError(
        'INVARIANT_VIOLATION',
        `CPF-INV-10 failed for ${classId}: allTriples.${zone} < primitiveTriples.${zone}`
      );
    }
  }

  // CPF-INV-11: 0n <= berggrenDepthMin <= berggrenDepthMax <= r - 1n
  if (
    primitiveTriples.berggrenDepthMin < 0n ||
    primitiveTriples.berggrenDepthMin > primitiveTriples.berggrenDepthMax ||
    primitiveTriples.berggrenDepthMax > r - 1n
  ) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-11 failed for ${classId}: depth=[${primitiveTriples.berggrenDepthMin.toString()}, ${primitiveTriples.berggrenDepthMax.toString()}], r=${r.toString()}`
    );
  }

  // CPF-INV-12: spornXMin <= meanSpornX <= spornXMax and 0 < meanADivC < 1 for both populations
  if (
    !lteRational(spornXMin, allTriples.meanSpornX) ||
    !lteRational(allTriples.meanSpornX, spornXMax) ||
    !lteRational(spornXMin, primitiveTriples.meanSpornX) ||
    !lteRational(primitiveTriples.meanSpornX, spornXMax) ||
    !gtRational(allTriples.meanADivC, RATIONAL_ZERO) ||
    !ltRational(allTriples.meanADivC, RATIONAL_ONE) ||
    !gtRational(primitiveTriples.meanADivC, RATIONAL_ZERO) ||
    !ltRational(primitiveTriples.meanADivC, RATIONAL_ONE)
  ) {
    throw new ClassProfileFacetError(
      'INVARIANT_VIOLATION',
      `CPF-INV-12 failed for ${classId}: mean rational bounds violated`
    );
  }
}
