/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  createRational,
  eqRational,
  exactDivBigInt,
  gcdBigInt,
  mulRational,
} from '../exact/index.ts';
import type {
  PythagoreanTriple,
  RadiusClassificationResult,
} from '../classification/index.ts';
import {
  canonWordToRawWord,
  classifySpornZone,
  computeBerggrenFacetsForClass,
  computeSpornFacetsForClass,
  type BerggrenFacetResult,
  type SpornFacetResult,
} from '../facets/index.ts';
import {
  ClassMatrixError,
  IncompleteClassificationError,
  MatrixInvariantError,
} from './errors.ts';
import { resolveEuclideanParameters } from './euclidAdapter.ts';
import type {
  BuildClassMatrixOptions,
  ClassMatrixRowCore,
  ClassMatrixRowFull,
  ClassMatrixRowView,
  ClassPassportResult,
  FullClassMatrixResult,
  LazyClassMatrix,
  MaterializedMatrixGroupsMap,
  MatrixArithColumns,
  MatrixBerggrenColumns,
  MatrixColumnGroup,
  MatrixEuclidColumns,
  MatrixGeomColumns,
  MatrixGroupColumnMap,
  MatrixSpornColumns,
} from './types.ts';

export const ALL_MATRIX_COLUMN_GROUPS: readonly MatrixColumnGroup[] = Object.freeze([
  'ARITH',
  'EUCLID',
  'GEOM',
  'SPORN',
  'BERGGREN',
]);

const VALID_COLUMN_GROUPS: ReadonlySet<string> = new Set<string>(
  ALL_MATRIX_COLUMN_GROUPS
);

function formatExpectedClassId(r: bigint): string {
  return `CL-R${r.toString()}-D${(2n * r).toString()}`;
}

function formatExpectedTripleId(r: bigint, k: bigint, x: bigint): string {
  return `PT-R${r.toString()}-K${k.toString()}-X${x.toString()}`;
}

function assertValidColumnGroup(group: unknown): MatrixColumnGroup {
  if (typeof group !== 'string' || !VALID_COLUMN_GROUPS.has(group)) {
    throw new ClassMatrixError(
      'INVALID_COLUMN_GROUP',
      `Unknown ClassMatrix column group "${String(group)}"; expected one of ${ALL_MATRIX_COLUMN_GROUPS.join(', ')}`
    );
  }
  return group as MatrixColumnGroup;
}

function validateClassificationAndBuildCore(
  classification: RadiusClassificationResult
): {
  readonly r: bigint;
  readonly D: bigint;
  readonly classId: string;
  readonly triples: readonly PythagoreanTriple[];
  readonly coreRows: readonly ClassMatrixRowCore[];
  readonly tripleIdToIndex: ReadonlyMap<string, number>;
} {
  if (typeof classification !== 'object' || classification === null) {
    throw new IncompleteClassificationError(
      'unknown',
      'classification must be a non-null object'
    );
  }

  const r = classification.r;
  if (typeof r !== 'bigint' || r < 1n) {
    throw new ClassMatrixError(
      'INVALID_RADIUS',
      `Invalid radius ${String(r)} for ClassMatrix: expected bigint >= 1n`
    );
  }

  const status = (classification as { readonly status?: unknown }).status;
  if (
    !classification.isComplete ||
    (status !== undefined && status !== 'COMPLETE')
  ) {
    throw new IncompleteClassificationError(
      r,
      `classification.isComplete=${String(classification.isComplete)}, status=${String(status)}`
    );
  }

  if (
    typeof classification.totalTriplesCount !== 'bigint' ||
    typeof classification.expectedTotalCount !== 'bigint' ||
    classification.totalTriplesCount <= 0n ||
    classification.totalTriplesCount !== classification.expectedTotalCount ||
    !Array.isArray(classification.allTriples) ||
    BigInt(classification.allTriples.length) !== classification.totalTriplesCount
  ) {
    throw new IncompleteClassificationError(
      r,
      `triple count mismatch: allTriples=${Array.isArray(classification.allTriples) ? classification.allTriples.length : 'non-array'}, totalTriplesCount=${String(classification.totalTriplesCount)}, expectedTotalCount=${String(classification.expectedTotalCount)}`
    );
  }

  const D = 2n * r;
  const twoRSquared = 2n * r * r;
  const classId = formatExpectedClassId(r);

  // Check uniqueness of tripleId and x, and validate every triple before sorting a copy
  const seenTripleIds = new Set<string>();
  const seenX = new Set<bigint>();
  const validatedTriples: PythagoreanTriple[] = [];

  for (let i = 0; i < classification.allTriples.length; i += 1) {
    const triple = classification.allTriples[i];
    if (typeof triple !== 'object' || triple === null) {
      throw new ClassMatrixError(
        'TRIPLE_MISMATCH',
        `classification.allTriples[${i}] must be a non-null object`
      );
    }

    if (seenTripleIds.has(triple.tripleId)) {
      throw new ClassMatrixError(
        'DUPLICATE_TRIPLE_ID',
        `Duplicate tripleId "${triple.tripleId}" in ${classId}`
      );
    }
    seenTripleIds.add(triple.tripleId);

    if (seenX.has(triple.x)) {
      throw new ClassMatrixError(
        'DUPLICATE_X',
        `Duplicate hyperbolic shift x=${triple.x.toString()} in ${classId}`
      );
    }
    seenX.add(triple.x);

    const tR: bigint = triple.r;
    const tD: bigint = triple.D;
    const tK: bigint = triple.k;
    const tX: bigint = triple.x;
    const tY: bigint = triple.y;
    const tA: bigint = triple.a;
    const tB: bigint = triple.b;
    const tC: bigint = triple.c;

    if (
      tR !== r ||
      tD !== D ||
      triple.classId !== classId ||
      tK < 1n ||
      tR % tK !== 0n ||
      triple.isPrimitive !== (tK === 1n)
    ) {
      throw new ClassMatrixError(
        'TRIPLE_MISMATCH',
        `Triple ${triple.tripleId} metadata mismatch for ${classId}`
      );
    }

    const expectedTripleId = formatExpectedTripleId(r, tK, tX);
    const r0: bigint = r / tK;
    const x0: bigint = tX / tK;
    const expectedPrimId = formatExpectedTripleId(r0, 1n, x0);
    if (triple.tripleId !== expectedTripleId || triple.primId !== expectedPrimId) {
      throw new ClassMatrixError(
        'TRIPLE_MISMATCH',
        `Triple ${triple.tripleId} canonical IDs disagree with expected (${expectedTripleId}, ${expectedPrimId})`
      );
    }

    if (
      tX <= 0n ||
      tY <= tX ||
      tX * tY !== twoRSquared ||
      tA !== D + tX ||
      tB !== D + tY ||
      tC !== D + tX + tY ||
      !(tA > 0n && tA < tB && tB < tC) ||
      tA * tA + tB * tB !== tC * tC
    ) {
      throw new ClassMatrixError(
        'TRIPLE_MISMATCH',
        `Triple ${triple.tripleId} violates canonical Pythagorean or hyperbola equations`
      );
    }

    validatedTriples.push(triple);
  }

  // Deterministic ascending sort on a shallow copy without mutating classification.allTriples
  validatedTriples.sort((left, right) => {
    const lx: bigint = left.x;
    const rx: bigint = right.x;
    return lx < rx ? -1 : lx > rx ? 1 : 0;
  });

  const coreRows: ClassMatrixRowCore[] = [];
  const tripleIdToIndex = new Map<string, number>();

  for (let i = 0; i < validatedTriples.length; i += 1) {
    const triple = validatedTriples[i];
    tripleIdToIndex.set(triple.tripleId, i);
    coreRows.push(
      Object.freeze({
        rowIdx: BigInt(i),
        tripleId: triple.tripleId,
        classId: triple.classId,
        primId: triple.primId,
        r: triple.r,
        x: triple.x,
        y: triple.y,
        a: triple.a,
        b: triple.b,
        c: triple.c,
        k: triple.k,
        isPrimitive: triple.isPrimitive,
      })
    );
  }

  return {
    r,
    D,
    classId,
    triples: Object.freeze(validatedTriples),
    coreRows: Object.freeze(coreRows),
    tripleIdToIndex,
  };
}

function indexFacetCache<T extends { readonly tripleId: string; readonly classId: string; readonly r: bigint }>(
  facets: readonly T[],
  label: string,
  classId: string,
  r: bigint,
  tripleIdToIndex: ReadonlyMap<string, number>
): readonly T[] {
  if (facets.length !== tripleIdToIndex.size) {
    throw new ClassMatrixError(
      'FACET_CACHE_MISMATCH',
      `${label} cache length (${facets.length}) does not match rowCount (${tripleIdToIndex.size}) for ${classId}`
    );
  }

  const aligned = new Array<T>(tripleIdToIndex.size);
  const seen = new Set<string>();

  for (const facet of facets) {
    if (facet.r !== r || facet.classId !== classId) {
      throw new ClassMatrixError(
        'FACET_CACHE_MISMATCH',
        `${label} entry ${facet.tripleId} has (r=${facet.r.toString()}, classId=${facet.classId}); expected (r=${r.toString()}, classId=${classId})`
      );
    }
    if (seen.has(facet.tripleId)) {
      throw new ClassMatrixError(
        'FACET_CACHE_MISMATCH',
        `Duplicate tripleId "${facet.tripleId}" in ${label} cache for ${classId}`
      );
    }
    const idx = tripleIdToIndex.get(facet.tripleId);
    if (idx === undefined) {
      throw new ClassMatrixError(
        'FACET_CACHE_MISMATCH',
        `${label} cache contains unknown tripleId "${facet.tripleId}" for ${classId}`
      );
    }
    seen.add(facet.tripleId);
    aligned[idx] = facet;
  }

  return Object.freeze(aligned);
}

// Pure group evaluators shared between Full and Lazy modes to guarantee exact parity
function computeArithGroup(
  coreRows: readonly ClassMatrixRowCore[]
): readonly MatrixArithColumns[] {
  return Object.freeze(
    coreRows.map((row) =>
      Object.freeze({
        gcdSides: gcdBigInt(gcdBigInt(row.a, row.b), row.c),
        aEven: row.a % 2n === 0n,
        div3Leg: row.a % 3n === 0n || row.b % 3n === 0n,
        div4Leg: row.a % 4n === 0n || row.b % 4n === 0n,
        div5Side: row.a % 5n === 0n || row.b % 5n === 0n || row.c % 5n === 0n,
      })
    )
  );
}

function computeEuclidGroup(
  triples: readonly PythagoreanTriple[]
): readonly MatrixEuclidColumns[] {
  return Object.freeze(
    triples.map((triple) => {
      const ep = resolveEuclideanParameters(triple);
      return Object.freeze({
        euclidU: ep.u,
        euclidV: ep.v,
        euclidM: ep.m,
        euclidN: ep.n,
      });
    })
  );
}

function computeGeomGroup(
  coreRows: readonly ClassMatrixRowCore[],
  cachedSpornFacets: readonly SpornFacetResult[] | null
): readonly MatrixGeomColumns[] {
  return Object.freeze(
    coreRows.map((row, i) => {
      const sporn = cachedSpornFacets ? cachedSpornFacets[i] : null;
      const D = 2n * row.r;
      const areaS = exactDivBigInt(row.a * row.b, 2n);
      const semiPerimeter = exactDivBigInt(row.a + row.b + row.c, 2n);
      const perimeter = row.a + row.b + row.c;
      const aDivC = sporn ? sporn.sinA : createRational(row.a, row.c);
      const bDivC = sporn ? sporn.cosA : createRational(row.b, row.c);

      return Object.freeze({
        D,
        areaS,
        semiPerimeter,
        perimeter,
        aDivC,
        bDivC,
      });
    })
  );
}

function computeSpornGroup(
  alignedSpornFacets: readonly SpornFacetResult[]
): readonly MatrixSpornColumns[] {
  return Object.freeze(
    alignedSpornFacets.map((facet) =>
      Object.freeze({
        spornX: facet.spornX,
        spornY: facet.spornY,
        spornZone: facet.spornZone,
        rayBaseR0: facet.rayBaseR0,
        parityCase: facet.parityCase,
        tanHalfA: facet.tanHalfA,
        tanHalfB: facet.tanHalfB,
        tanA: facet.tanA,
        formT: facet.formT,
        asymQ: facet.asymQ,
        normS: facet.normS,
        normP: facet.normP,
      })
    )
  );
}

function computeBerggrenGroup(
  alignedBerggrenFacets: readonly BerggrenFacetResult[]
): readonly MatrixBerggrenColumns[] {
  return Object.freeze(
    alignedBerggrenFacets.map((facet) =>
      Object.freeze({
        canonWord: Object.freeze([...facet.canonWord]),
        rawWord: Object.freeze([...facet.rawWord]),
        treeDepth: facet.treeDepth,
        parentOperator: facet.parentOperator,
        treeLegSwapped:
          facet.parentOperator === 'A2' || facet.parentOperator === 'A3',
        appliesToPrimitiveAncestor: facet.appliesToPrimitiveAncestor,
      })
    )
  );
}

function buildRowView(
  coreRow: ClassMatrixRowCore,
  index: number,
  groupsToInclude: readonly MatrixColumnGroup[],
  groupCache: ReadonlyMap<MatrixColumnGroup, readonly unknown[]>
): ClassMatrixRowView {
  const row: {
    rowIdx: bigint;
    tripleId: string;
    classId: string;
    primId: string;
    r: bigint;
    x: bigint;
    y: bigint;
    a: bigint;
    b: bigint;
    c: bigint;
    k: bigint;
    isPrimitive: boolean;
    arith?: MatrixArithColumns;
    euclid?: MatrixEuclidColumns;
    geom?: MatrixGeomColumns;
    sporn?: MatrixSpornColumns;
    berggren?: MatrixBerggrenColumns;
  } = {
    rowIdx: coreRow.rowIdx,
    tripleId: coreRow.tripleId,
    classId: coreRow.classId,
    primId: coreRow.primId,
    r: coreRow.r,
    x: coreRow.x,
    y: coreRow.y,
    a: coreRow.a,
    b: coreRow.b,
    c: coreRow.c,
    k: coreRow.k,
    isPrimitive: coreRow.isPrimitive,
  };

  for (const group of groupsToInclude) {
    const data = groupCache.get(group);
    if (!data) continue;
    switch (group) {
      case 'ARITH':
        row.arith = data[index] as MatrixArithColumns;
        break;
      case 'EUCLID':
        row.euclid = data[index] as MatrixEuclidColumns;
        break;
      case 'GEOM':
        row.geom = data[index] as MatrixGeomColumns;
        break;
      case 'SPORN':
        row.sporn = data[index] as MatrixSpornColumns;
        break;
      case 'BERGGREN':
        row.berggren = data[index] as MatrixBerggrenColumns;
        break;
    }
  }

  return Object.freeze(row);
}

function binarySearchIndexByX(
  rows: readonly ClassMatrixRowCore[],
  targetX: bigint
): number {
  let lo = 0;
  let hi = rows.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const midX = rows[mid].x;
    if (midX === targetX) {
      return mid;
    }
    if (midX < targetX) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return -1;
}

/**
 * Creates a cache-backed LazyClassMatrix with eager CORE/INDEX rows and
 * on-demand group materialization for ARITH, EUCLID, GEOM, SPORN, and BERGGREN.
 */
export function createLazyClassMatrix(
  classification: RadiusClassificationResult,
  options: BuildClassMatrixOptions = {}
): LazyClassMatrix {
  const { r, D, classId, triples, coreRows, tripleIdToIndex } =
    validateClassificationAndBuildCore(classification);

  let alignedSpornCache: readonly SpornFacetResult[] | null =
    options.spornFacets !== undefined
      ? indexFacetCache(
          options.spornFacets,
          'spornFacets',
          classId,
          r,
          tripleIdToIndex
        )
      : null;

  let alignedBerggrenCache: readonly BerggrenFacetResult[] | null =
    options.berggrenFacets !== undefined
      ? indexFacetCache(
          options.berggrenFacets,
          'berggrenFacets',
          classId,
          r,
          tripleIdToIndex
        )
      : null;

  const groupCache = new Map<MatrixColumnGroup, readonly unknown[]>();

  function getOrComputeSpornFacets(): readonly SpornFacetResult[] {
    if (alignedSpornCache === null) {
      const computed = computeSpornFacetsForClass(classification);
      alignedSpornCache = indexFacetCache(
        computed,
        'spornFacets',
        classId,
        r,
        tripleIdToIndex
      );
    }
    return alignedSpornCache;
  }

  function getOrComputeBerggrenFacets(): readonly BerggrenFacetResult[] {
    if (alignedBerggrenCache === null) {
      const computed = computeBerggrenFacetsForClass(classification);
      alignedBerggrenCache = indexFacetCache(
        computed,
        'berggrenFacets',
        classId,
        r,
        tripleIdToIndex
      );
    }
    return alignedBerggrenCache;
  }

  function materializeGroup<G extends MatrixColumnGroup>(
    group: G
  ): readonly MatrixGroupColumnMap[G][] {
    const validGroup = assertValidColumnGroup(group);
    const cached = groupCache.get(validGroup);
    if (cached !== undefined) {
      return cached as readonly MatrixGroupColumnMap[G][];
    }

    let computed: readonly unknown[];
    switch (validGroup) {
      case 'ARITH':
        computed = computeArithGroup(coreRows);
        break;
      case 'EUCLID':
        computed = computeEuclidGroup(triples);
        break;
      case 'GEOM':
        computed = computeGeomGroup(coreRows, alignedSpornCache);
        break;
      case 'SPORN':
        computed = computeSpornGroup(getOrComputeSpornFacets());
        break;
      case 'BERGGREN':
        computed = computeBerggrenGroup(getOrComputeBerggrenFacets());
        break;
    }

    groupCache.set(validGroup, computed);
    return computed as readonly MatrixGroupColumnMap[G][];
  }

  function materializeGroups(
    groups: readonly MatrixColumnGroup[]
  ): MaterializedMatrixGroupsMap {
    if (!Array.isArray(groups)) {
      throw new ClassMatrixError(
        'INVALID_COLUMN_GROUP',
        'groups must be an array of MatrixColumnGroup'
      );
    }
    const result: {
      ARITH?: readonly MatrixArithColumns[];
      EUCLID?: readonly MatrixEuclidColumns[];
      GEOM?: readonly MatrixGeomColumns[];
      SPORN?: readonly MatrixSpornColumns[];
      BERGGREN?: readonly MatrixBerggrenColumns[];
    } = {};

    for (const g of groups) {
      const validGroup = assertValidColumnGroup(g);
      switch (validGroup) {
        case 'ARITH':
          result.ARITH = materializeGroup('ARITH');
          break;
        case 'EUCLID':
          result.EUCLID = materializeGroup('EUCLID');
          break;
        case 'GEOM':
          result.GEOM = materializeGroup('GEOM');
          break;
        case 'SPORN':
          result.SPORN = materializeGroup('SPORN');
          break;
        case 'BERGGREN':
          result.BERGGREN = materializeGroup('BERGGREN');
          break;
      }
    }
    return Object.freeze(result);
  }

  function resolveGroupsList(
    groups?: readonly MatrixColumnGroup[]
  ): readonly MatrixColumnGroup[] {
    if (groups === undefined) {
      return getMaterializedGroups();
    }
    if (!Array.isArray(groups)) {
      throw new ClassMatrixError(
        'INVALID_COLUMN_GROUP',
        'groups must be an array of MatrixColumnGroup'
      );
    }
    const validated: MatrixColumnGroup[] = [];
    for (const g of groups) {
      const validGroup = assertValidColumnGroup(g);
      materializeGroup(validGroup);
      if (!validated.includes(validGroup)) {
        validated.push(validGroup);
      }
    }
    return validated;
  }

  function getMaterializedGroups(): readonly MatrixColumnGroup[] {
    return Object.freeze(
      ALL_MATRIX_COLUMN_GROUPS.filter((g) => groupCache.has(g))
    );
  }

  function getRow(
    rowIdx: bigint,
    groups?: readonly MatrixColumnGroup[]
  ): ClassMatrixRowView {
    if (typeof rowIdx !== 'bigint' || rowIdx < 0n || rowIdx >= BigInt(coreRows.length)) {
      throw new ClassMatrixError(
        'INVALID_ROW_INDEX',
        `rowIdx=${String(rowIdx)} out of bounds [0n, ${BigInt(coreRows.length - 1).toString()}n] for ${classId}`
      );
    }
    const idx = findCoreIndexByRowIdx(coreRows, rowIdx);
    const activeGroups = resolveGroupsList(groups);
    return buildRowView(coreRows[idx], idx, activeGroups, groupCache);
  }

  function findRowByTripleId(
    tripleId: string,
    groups?: readonly MatrixColumnGroup[]
  ): ClassMatrixRowView | null {
    const idx = tripleIdToIndex.get(tripleId);
    if (idx === undefined) {
      return null;
    }
    const activeGroups = resolveGroupsList(groups);
    return buildRowView(coreRows[idx], idx, activeGroups, groupCache);
  }

  function findRowByX(
    x: bigint,
    groups?: readonly MatrixColumnGroup[]
  ): ClassMatrixRowView | null {
    if (typeof x !== 'bigint') {
      return null;
    }
    const idx = binarySearchIndexByX(coreRows, x);
    if (idx < 0) {
      return null;
    }
    const activeGroups = resolveGroupsList(groups);
    return buildRowView(coreRows[idx], idx, activeGroups, groupCache);
  }

  function toFullMatrix(): FullClassMatrixResult {
    const arithCols = materializeGroup('ARITH');
    const euclidCols = materializeGroup('EUCLID');
    const geomCols = materializeGroup('GEOM');
    const spornCols = materializeGroup('SPORN');
    const berggrenCols = materializeGroup('BERGGREN');

    const fullRows: ClassMatrixRowFull[] = coreRows.map((core, idx) =>
      Object.freeze({
        rowIdx: core.rowIdx,
        tripleId: core.tripleId,
        classId: core.classId,
        primId: core.primId,
        r: core.r,
        x: core.x,
        y: core.y,
        a: core.a,
        b: core.b,
        c: core.c,
        k: core.k,
        isPrimitive: core.isPrimitive,
        arith: arithCols[idx],
        euclid: euclidCols[idx],
        geom: geomCols[idx],
        sporn: spornCols[idx],
        berggren: berggrenCols[idx],
      })
    );

    const fullMatrix: FullClassMatrixResult = Object.freeze({
      specVersion: '0.1',
      mode: 'FULL',
      classId,
      r,
      D,
      rowCount: BigInt(coreRows.length),
      isSortedByX: true,
      firstTripleId: coreRows[0].tripleId,
      lastTripleId: coreRows[coreRows.length - 1].tripleId,
      rows: Object.freeze(fullRows),
    });

    verifyClassMatrixInvariants(fullMatrix);
    return fullMatrix;
  }

  return Object.freeze({
    specVersion: '0.1',
    mode: 'LAZY',
    classId,
    r,
    D,
    rowCount: BigInt(coreRows.length),
    isSortedByX: true,
    firstTripleId: coreRows[0].tripleId,
    lastTripleId: coreRows[coreRows.length - 1].tripleId,
    coreRows,
    hasGroup: (group: MatrixColumnGroup) =>
      groupCache.has(assertValidColumnGroup(group)),
    getMaterializedGroups,
    materializeGroup,
    materializeGroups,
    getRow,
    findRowByTripleId,
    findRowByX,
    toFullMatrix,
  });
}

// Lookup index by bigint rowIdx using pure BigInt comparisons
function findCoreIndexByRowIdx(
  coreRows: readonly ClassMatrixRowCore[],
  rowIdx: bigint
): number {
  let lo = 0;
  let hi = coreRows.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const midIdx = coreRows[mid].rowIdx;
    if (midIdx === rowIdx) {
      return mid;
    }
    if (midIdx < rowIdx) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  throw new ClassMatrixError(
    'INVALID_ROW_INDEX',
    `rowIdx=${rowIdx.toString()} not found in ClassMatrix`
  );
}

/**
 * Builds an immutable FullClassMatrixResult with all five lazy groups materialized
 * through the exact same group evaluators as LazyClassMatrix.
 */
export function buildFullClassMatrix(
  classification: RadiusClassificationResult,
  options: BuildClassMatrixOptions = {}
): FullClassMatrixResult {
  return createLazyClassMatrix(classification, options).toFullMatrix();
}

/**
 * O(log N) binary search over a FullClassMatrixResult by hyperbolic shift x.
 */
export function findFullMatrixRowByX(
  matrix: FullClassMatrixResult,
  x: bigint
): ClassMatrixRowFull | null {
  if (typeof x !== 'bigint') {
    return null;
  }
  const idx = binarySearchIndexByX(matrix.rows, x);
  return idx >= 0 ? matrix.rows[idx] : null;
}

/**
 * O(log N) lookup by bigint rowIdx using pure BigInt comparisons.
 */
export function getFullMatrixRowByIndex(
  matrix: FullClassMatrixResult,
  rowIdx: bigint
): ClassMatrixRowFull | null {
  if (typeof rowIdx !== 'bigint' || rowIdx < 0n || rowIdx >= matrix.rowCount) {
    return null;
  }
  let lo = 0;
  let hi = matrix.rows.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const midIdx = matrix.rows[mid].rowIdx;
    if (midIdx === rowIdx) {
      return matrix.rows[mid];
    }
    if (midIdx < rowIdx) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return null;
}

function fullRowsEqual(left: ClassMatrixRowFull, right: ClassMatrixRowFull): boolean {
  if (
    left.rowIdx !== right.rowIdx ||
    left.tripleId !== right.tripleId ||
    left.classId !== right.classId ||
    left.primId !== right.primId ||
    left.r !== right.r ||
    left.x !== right.x ||
    left.y !== right.y ||
    left.a !== right.a ||
    left.b !== right.b ||
    left.c !== right.c ||
    left.k !== right.k ||
    left.isPrimitive !== right.isPrimitive
  ) {
    return false;
  }

  if (
    left.arith.gcdSides !== right.arith.gcdSides ||
    left.arith.aEven !== right.arith.aEven ||
    left.arith.div3Leg !== right.arith.div3Leg ||
    left.arith.div4Leg !== right.arith.div4Leg ||
    left.arith.div5Side !== right.arith.div5Side
  ) {
    return false;
  }

  if (
    left.euclid.euclidU !== right.euclid.euclidU ||
    left.euclid.euclidV !== right.euclid.euclidV ||
    left.euclid.euclidM !== right.euclid.euclidM ||
    left.euclid.euclidN !== right.euclid.euclidN
  ) {
    return false;
  }

  if (
    left.geom.D !== right.geom.D ||
    left.geom.areaS !== right.geom.areaS ||
    left.geom.semiPerimeter !== right.geom.semiPerimeter ||
    left.geom.perimeter !== right.geom.perimeter ||
    !eqRational(left.geom.aDivC, right.geom.aDivC) ||
    !eqRational(left.geom.bDivC, right.geom.bDivC)
  ) {
    return false;
  }

  if (
    !eqRational(left.sporn.spornX, right.sporn.spornX) ||
    !eqRational(left.sporn.spornY, right.sporn.spornY) ||
    left.sporn.spornZone !== right.sporn.spornZone ||
    left.sporn.rayBaseR0 !== right.sporn.rayBaseR0 ||
    left.sporn.parityCase !== right.sporn.parityCase ||
    !eqRational(left.sporn.tanHalfA, right.sporn.tanHalfA) ||
    !eqRational(left.sporn.tanHalfB, right.sporn.tanHalfB) ||
    !eqRational(left.sporn.tanA, right.sporn.tanA) ||
    !eqRational(left.sporn.formT, right.sporn.formT) ||
    !eqRational(left.sporn.asymQ, right.sporn.asymQ) ||
    !eqRational(left.sporn.normS, right.sporn.normS) ||
    !eqRational(left.sporn.normP, right.sporn.normP)
  ) {
    return false;
  }

  if (
    left.berggren.treeDepth !== right.berggren.treeDepth ||
    left.berggren.parentOperator !== right.berggren.parentOperator ||
    left.berggren.treeLegSwapped !== right.berggren.treeLegSwapped ||
    left.berggren.appliesToPrimitiveAncestor !== right.berggren.appliesToPrimitiveAncestor ||
    left.berggren.canonWord.length !== right.berggren.canonWord.length ||
    left.berggren.rawWord.length !== right.berggren.rawWord.length ||
    !left.berggren.canonWord.every((op, idx) => op === right.berggren.canonWord[idx]) ||
    !left.berggren.rawWord.every((op, idx) => op === right.berggren.rawWord[idx])
  ) {
    return false;
  }

  return true;
}

/**
 * Verifies CM-INV-08 parity between a FullClassMatrixResult and a LazyClassMatrix.
 */
export function verifyFullLazyMatrixParity(
  fullMatrix: FullClassMatrixResult,
  lazyMatrix: LazyClassMatrix
): void {
  if (
    fullMatrix.r !== lazyMatrix.r ||
    fullMatrix.D !== lazyMatrix.D ||
    fullMatrix.classId !== lazyMatrix.classId ||
    fullMatrix.rowCount !== lazyMatrix.rowCount ||
    fullMatrix.isSortedByX !== lazyMatrix.isSortedByX ||
    fullMatrix.firstTripleId !== lazyMatrix.firstTripleId ||
    fullMatrix.lastTripleId !== lazyMatrix.lastTripleId
  ) {
    throw new MatrixInvariantError(
      'CM-INV-08',
      `Full vs Lazy header mismatch for ${fullMatrix.classId}`
    );
  }

  const fromLazy = lazyMatrix.toFullMatrix();
  if (fromLazy.rows.length !== fullMatrix.rows.length) {
    throw new MatrixInvariantError(
      'CM-INV-08',
      `Full vs Lazy row count mismatch for ${fullMatrix.classId}`
    );
  }

  for (let i = 0; i < fullMatrix.rows.length; i += 1) {
    if (!fullRowsEqual(fullMatrix.rows[i], fromLazy.rows[i])) {
      throw new MatrixInvariantError(
        'CM-INV-08',
        `Full vs Lazy row parity mismatch at ${fullMatrix.rows[i].tripleId}`
      );
    }
  }
}

/**
 * Joint M5-S1 <-> M5-S2 consistency check: ClassPassport.expectedMatrixSummary <-> ClassMatrix.
 */
export function verifyPassportMatrixAlignment(
  passport: ClassPassportResult,
  matrix: FullClassMatrixResult | LazyClassMatrix
): void {
  if (!passport.isComplete || passport.status !== 'COMPLETE') {
    throw new ClassMatrixError(
      'TRIPLE_MISMATCH',
      `Cannot align ClassMatrix with incomplete ClassPassport for ${passport.classId}`
    );
  }

  if (
    passport.r !== matrix.r ||
    passport.classId !== matrix.classId ||
    passport.expectedMatrixSummary.rowCount !== matrix.rowCount ||
    passport.expectedMatrixSummary.isSortedByX !== true ||
    matrix.isSortedByX !== true ||
    passport.expectedMatrixSummary.firstTripleId !== matrix.firstTripleId ||
    passport.expectedMatrixSummary.lastTripleId !== matrix.lastTripleId
  ) {
    throw new ClassMatrixError(
      'TRIPLE_MISMATCH',
      `ClassPassport.expectedMatrixSummary disagrees with ClassMatrix for ${passport.classId}`
    );
  }
}

/**
 * Independently verifies all FullClassMatrixResult invariants CM-INV-01..08.
 * CM-INV-01: CORE fields match M3 triple identities & canonical IDs.
 * CM-INV-02: Continuous rowIdx (0n..N-1), header bounds, and immutability.
 * CM-INV-03: Strict ascending x ordering and uniqueness of tripleId and x.
 * CM-INV-04: Geometric identities (p = 3r+x+y = c+r, P = 2p, S = ab/2 = r*p).
 * CM-INV-05: Arithmetic group (gcdSides === k, divisibility flags) & Euclid correspondence.
 * CM-INV-06: Exact rational SPORN parity (aDivC === sinA, bDivC === cosA, asymQ = (b-a)/(a+b)).
 * CM-INV-07: BERGGREN structural consistency (treeLegSwapped, canonWord <-> rawWord).
 * CM-INV-08: Full === Lazy parity (verified when lazyCounterpart is provided).
 */
export function verifyClassMatrixInvariants(
  matrix: FullClassMatrixResult,
  lazyCounterpart?: LazyClassMatrix
): void {
  const {
    specVersion,
    mode,
    classId,
    r,
    D,
    rowCount,
    isSortedByX,
    firstTripleId,
    lastTripleId,
    rows,
  } = matrix;

  // CM-INV-02 (header, rowCount, boundaries, immutability)
  if (
    specVersion !== '0.1' ||
    mode !== 'FULL' ||
    typeof r !== 'bigint' ||
    r < 1n ||
    D !== 2n * r ||
    classId !== formatExpectedClassId(r) ||
    !Array.isArray(rows) ||
    rows.length === 0 ||
    rowCount !== BigInt(rows.length) ||
    isSortedByX !== true ||
    firstTripleId !== rows[0].tripleId ||
    lastTripleId !== rows[rows.length - 1].tripleId
  ) {
    throw new MatrixInvariantError(
      'CM-INV-02',
      `matrix header or boundary mismatch for ${classId}`
    );
  }

  if (!Object.isFrozen(matrix) || !Object.isFrozen(rows)) {
    throw new MatrixInvariantError(
      'CM-INV-02',
      `FullClassMatrixResult and rows array must be frozen for ${classId}`
    );
  }

  const twoRSquared = 2n * r * r;
  const twoRational = createRational(2n, 1n);
  const seenTripleIds = new Set<string>();
  const seenX = new Set<bigint>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    // CM-INV-02: continuous rowIdx from 0n to N-1
    if (row.rowIdx !== BigInt(i)) {
      throw new MatrixInvariantError(
        'CM-INV-02',
        `rowIdx=${row.rowIdx.toString()} does not match position ${i} in ${classId}`
      );
    }

    // CM-INV-03: uniqueness of tripleId and x, plus strict ascending x
    if (seenTripleIds.has(row.tripleId)) {
      throw new MatrixInvariantError(
        'CM-INV-03',
        `duplicate tripleId "${row.tripleId}" in ${classId}`
      );
    }
    seenTripleIds.add(row.tripleId);

    const xRowCheck: bigint = row.x;
    if (seenX.has(xRowCheck)) {
      throw new MatrixInvariantError(
        'CM-INV-03',
        `duplicate shift x=${xRowCheck.toString()} in ${classId}`
      );
    }
    seenX.add(xRowCheck);

    if (i > 0 && xRowCheck <= rows[i - 1].x) {
      throw new MatrixInvariantError(
        'CM-INV-03',
        `rows are not strictly sorted by ascending x at rowIdx=${row.rowIdx.toString()} in ${classId}`
      );
    }

    // CM-INV-01: CORE fields, IDs, and Pythagorean/hyperbola identities
    const rRow: bigint = row.r;
    const kRow: bigint = row.k;
    const xRow: bigint = row.x;
    const yRow: bigint = row.y;
    const aRow: bigint = row.a;
    const bRow: bigint = row.b;
    const cRow: bigint = row.c;
    const k: bigint = gcdBigInt(gcdBigInt(aRow, bRow), cRow);
    const r0: bigint = r / kRow;
    const x0: bigint = xRow / kRow;
    const y0: bigint = yRow / kRow;

    if (
      rRow !== r ||
      row.classId !== classId ||
      kRow < 1n ||
      r % kRow !== 0n ||
      kRow !== k ||
      row.isPrimitive !== (kRow === 1n) ||
      row.tripleId !== formatExpectedTripleId(r, kRow, xRow) ||
      row.primId !== formatExpectedTripleId(r0, 1n, x0) ||
      xRow <= 0n ||
      yRow <= xRow ||
      xRow * yRow !== twoRSquared ||
      aRow !== D + xRow ||
      bRow !== D + yRow ||
      cRow !== D + xRow + yRow ||
      !(aRow > 0n && aRow < bRow && bRow < cRow) ||
      aRow * aRow + bRow * bRow !== cRow * cRow
    ) {
      throw new MatrixInvariantError(
        'CM-INV-01',
        `CORE triple fields, IDs, or hyperbola identity failed at ${row.tripleId}`
      );
    }

    // CM-INV-04: Geometric identities (p = 3r+x+y = c+r, P = 2p, S = ab/2 = r*p)
    const { geom } = row;
    const geomD: bigint = geom.D;
    const geomAreaS: bigint = geom.areaS;
    const geomSemiP: bigint = geom.semiPerimeter;
    const geomPerim: bigint = geom.perimeter;
    if (
      geomD !== D ||
      geomSemiP !== cRow + r ||
      geomSemiP !== 3n * r + xRow + yRow ||
      geomPerim !== 2n * geomSemiP ||
      geomPerim !== aRow + bRow + cRow ||
      2n * geomAreaS !== aRow * bRow ||
      geomAreaS !== r * geomSemiP
    ) {
      throw new MatrixInvariantError(
        'CM-INV-04',
        `GEOM identity mismatch at ${row.tripleId}`
      );
    }

    // CM-INV-05: ARITH group (gcdSides === k, divisibility) & EUCLID correspondence
    const { arith, euclid } = row;
    if (
      arith.gcdSides !== kRow ||
      arith.aEven !== (aRow % 2n === 0n) ||
      arith.div3Leg !== (aRow % 3n === 0n || bRow % 3n === 0n) ||
      arith.div4Leg !== (aRow % 4n === 0n || bRow % 4n === 0n) ||
      arith.div5Side !==
        (aRow % 5n === 0n || bRow % 5n === 0n || cRow % 5n === 0n)
    ) {
      throw new MatrixInvariantError(
        'CM-INV-05',
        `ARITH group mismatch at ${row.tripleId}`
      );
    }

    const eU: bigint = euclid.euclidU;
    const eV: bigint = euclid.euclidV;
    const eM: bigint = euclid.euclidM;
    const eN: bigint = euclid.euclidN;
    const vSq: bigint = eV * eV;
    const twoUSq: bigint = 2n * eU * eU;
    const matchesShifts =
      (x0 === vSq && y0 === twoUSq) || (x0 === twoUSq && y0 === vSq);

    if (
      eU <= 0n ||
      eV <= 0n ||
      eN !== eU ||
      eM !== eU + eV ||
      eM <= eN ||
      eU * eV !== r0 ||
      gcdBigInt(eM, eN) !== 1n ||
      (eM + eN) % 2n === 0n ||
      !matchesShifts
    ) {
      throw new MatrixInvariantError(
        'CM-INV-05',
        `EUCLID group mismatch at ${row.tripleId}`
      );
    }

    // CM-INV-06: Exact rational SPORN parity & aDivC === sinA, bDivC === cosA
    const { sporn } = row;
    const expectedSinA = createRational(aRow, cRow);
    const expectedCosA = createRational(bRow, cRow);
    const expectedZone = classifySpornZone(xRow, r);
    const expectedParity = x0 % 2n === 0n ? 'X0_EVEN' : 'X0_ODD';
    if (
      !eqRational(geom.aDivC, expectedSinA) ||
      !eqRational(geom.bDivC, expectedCosA) ||
      !eqRational(sporn.spornX, createRational(xRow, r)) ||
      !eqRational(sporn.spornY, createRational(yRow, r)) ||
      sporn.spornZone !== expectedZone ||
      sporn.rayBaseR0 !== r0 ||
      sporn.parityCase !== expectedParity ||
      !eqRational(sporn.tanA, createRational(aRow, bRow)) ||
      !eqRational(sporn.formT, createRational(bRow, aRow)) ||
      !eqRational(sporn.tanHalfA, createRational(r, r + yRow)) ||
      !eqRational(sporn.tanHalfB, createRational(r, r + xRow)) ||
      !eqRational(sporn.asymQ, createRational(bRow - aRow, aRow + bRow)) ||
      !eqRational(sporn.normS, createRational(geomAreaS, r * r)) ||
      !eqRational(sporn.normP, createRational(geomPerim, r)) ||
      !eqRational(sporn.normP, mulRational(twoRational, sporn.normS))
    ) {
      throw new MatrixInvariantError(
        'CM-INV-06',
        `SPORN / exact rational trig mismatch at ${row.tripleId}`
      );
    }

    // CM-INV-07: BERGGREN structural consistency
    const { berggren } = row;
    const expectedParentOp =
      berggren.canonWord.length === 0
        ? null
        : berggren.canonWord[berggren.canonWord.length - 1];
    const expectedRawWord = canonWordToRawWord(berggren.canonWord);
    const rawWordMatches =
      expectedRawWord.length === berggren.rawWord.length &&
      expectedRawWord.every((op, idx) => op === berggren.rawWord[idx]);
    const isRootPrimitive = x0 === 1n && y0 === 2n;
    if (
      berggren.appliesToPrimitiveAncestor !== !row.isPrimitive ||
      berggren.treeDepth !== BigInt(berggren.canonWord.length) ||
      !rawWordMatches ||
      berggren.parentOperator !== expectedParentOp ||
      berggren.treeLegSwapped !==
        (berggren.parentOperator === 'A2' || berggren.parentOperator === 'A3') ||
      (berggren.treeDepth === 0n) !== isRootPrimitive
    ) {
      throw new MatrixInvariantError(
        'CM-INV-07',
        `BERGGREN group mismatch at ${row.tripleId}`
      );
    }

    // Row immutability (part of CM-INV-02)
    if (
      !Object.isFrozen(row) ||
      !Object.isFrozen(arith) ||
      !Object.isFrozen(euclid) ||
      !Object.isFrozen(geom) ||
      !Object.isFrozen(sporn) ||
      !Object.isFrozen(berggren) ||
      !Object.isFrozen(berggren.canonWord) ||
      !Object.isFrozen(berggren.rawWord)
    ) {
      throw new MatrixInvariantError(
        'CM-INV-02',
        `row and sub-group objects must be frozen at ${row.tripleId}`
      );
    }
  }

  // CM-INV-08: Full === Lazy parity when Lazy counterpart is supplied
  if (lazyCounterpart !== undefined) {
    verifyFullLazyMatrixParity(matrix, lazyCounterpart);
  }
}

export * from './errors.ts';
export * from './types.ts';
