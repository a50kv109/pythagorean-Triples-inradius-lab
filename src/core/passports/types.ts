/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type { ExactRational } from '../exact/index.ts';
import type {
  FactorizationCertificationStatus,
  NumberTheoryDiagnostic,
  RadiusNumberTheoryResult,
} from '../factorization/index.ts';
import type {
  EuclideanParameters,
  PythagoreanTriple,
  RadiusClassificationResult,
} from '../classification/index.ts';
import type {
  BerggrenFacetResult,
  BerggrenOperator,
  ClassProfileFacetResult,
  SpornFacetResult,
  SpornParityCase,
  SpornZone,
} from '../facets/index.ts';

export type PassportSpecVersion = '0.1';
export type PassportStatus = 'COMPLETE' | 'INCOMPLETE';

export interface PassportOddPrimeFactor {
  readonly prime: bigint;
  readonly exponent: bigint;
}

export interface PassportNumberTheorySummary {
  readonly twoExponent: bigint;
  readonly oddPrimeFactors: readonly PassportOddPrimeFactor[];
  readonly omegaStar: bigint | null;
  readonly tauR: bigint | null;
  readonly tauTwoRSquared: bigint | null;
  readonly T: bigint | null;
  readonly N: bigint | null;
  readonly divisorsOfR: readonly bigint[] | null;
}

export interface SubclassSpectrumEntry {
  readonly k: bigint;
  readonly primitiveRadius: bigint;
  readonly actualCount: bigint;
  readonly expectedCount: bigint;
  readonly isCardinalityMatch: boolean;
}

export interface ExpectedMatrixSummary {
  readonly rowCount: bigint | null;
  readonly isSortedByX: boolean;
  readonly firstTripleId: string | null;
  readonly lastTripleId: string | null;
}

export interface ClassPassportResult {
  readonly specVersion: PassportSpecVersion;
  readonly classId: string;
  readonly r: bigint;
  readonly D: bigint;
  readonly twoRSquared: bigint;

  readonly status: PassportStatus;
  readonly isComplete: boolean;
  readonly certificationStatus: FactorizationCertificationStatus;
  readonly isDivisorEnumerationComplete: boolean;
  readonly warnings: readonly string[];

  readonly numberTheory: PassportNumberTheorySummary;
  readonly subclassSpectrum: readonly SubclassSpectrumEntry[];
  readonly profile: ClassProfileFacetResult | null;
  readonly expectedMatrixSummary: ExpectedMatrixSummary;
}

export interface BuildClassPassportInput {
  readonly numberTheory: RadiusNumberTheoryResult;
  readonly classification: RadiusClassificationResult;
  readonly profile?: ClassProfileFacetResult | null;
}

export type ClassifiedTripleInput = Pick<
  PythagoreanTriple,
  'r' | 'k' | 'x' | 'y' | 'primitiveAncestor' | 'euclideanParams'
> & {
  readonly tripleId?: string;
};

export type PassportDiagnosticInput = string | NumberTheoryDiagnostic;
export type ResolvedEuclideanParameters = EuclideanParameters;

// ============================================================================
// M5-S2: ClassMatrix (Eager CORE/INDEX + Lazy ARITH, EUCLID, GEOM, SPORN, BERGGREN)
// ============================================================================

export type MatrixColumnGroup = 'ARITH' | 'EUCLID' | 'GEOM' | 'SPORN' | 'BERGGREN';

export interface ClassMatrixRowCore {
  readonly rowIdx: bigint;
  readonly tripleId: string;
  readonly classId: string;
  readonly primId: string;
  readonly r: bigint;
  readonly x: bigint;
  readonly y: bigint;
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
  readonly k: bigint;
  readonly isPrimitive: boolean;
}

export interface MatrixArithColumns {
  readonly gcdSides: bigint;
  readonly aEven: boolean;
  readonly div3Leg: boolean;
  readonly div4Leg: boolean;
  readonly div5Side: boolean;
}

export interface MatrixEuclidColumns {
  readonly euclidU: bigint;
  readonly euclidV: bigint;
  readonly euclidM: bigint;
  readonly euclidN: bigint;
}

export interface MatrixGeomColumns {
  readonly D: bigint;
  readonly areaS: bigint;
  readonly semiPerimeter: bigint;
  readonly perimeter: bigint;
  readonly aDivC: ExactRational;
  readonly bDivC: ExactRational;
}

export interface MatrixSpornColumns {
  readonly spornX: ExactRational;
  readonly spornY: ExactRational;
  readonly spornZone: SpornZone;
  readonly rayBaseR0: bigint;
  readonly parityCase: SpornParityCase;
  readonly tanHalfA: ExactRational;
  readonly tanHalfB: ExactRational;
  readonly tanA: ExactRational;
  readonly formT: ExactRational;
  readonly asymQ: ExactRational;
  readonly normS: ExactRational;
  readonly normP: ExactRational;
}

export interface MatrixBerggrenColumns {
  readonly canonWord: readonly BerggrenOperator[];
  readonly rawWord: readonly BerggrenOperator[];
  readonly treeDepth: bigint;
  readonly parentOperator: BerggrenOperator | null;
  readonly treeLegSwapped: boolean;
  readonly appliesToPrimitiveAncestor: boolean;
}

export interface MatrixGroupColumnMap {
  readonly ARITH: MatrixArithColumns;
  readonly EUCLID: MatrixEuclidColumns;
  readonly GEOM: MatrixGeomColumns;
  readonly SPORN: MatrixSpornColumns;
  readonly BERGGREN: MatrixBerggrenColumns;
}

export interface ClassMatrixRowFull extends ClassMatrixRowCore {
  readonly arith: MatrixArithColumns;
  readonly euclid: MatrixEuclidColumns;
  readonly geom: MatrixGeomColumns;
  readonly sporn: MatrixSpornColumns;
  readonly berggren: MatrixBerggrenColumns;
}

export interface ClassMatrixRowView extends ClassMatrixRowCore {
  readonly arith?: MatrixArithColumns;
  readonly euclid?: MatrixEuclidColumns;
  readonly geom?: MatrixGeomColumns;
  readonly sporn?: MatrixSpornColumns;
  readonly berggren?: MatrixBerggrenColumns;
}

export interface BuildClassMatrixOptions {
  readonly spornFacets?: readonly SpornFacetResult[];
  readonly berggrenFacets?: readonly BerggrenFacetResult[];
}

export interface FullClassMatrixResult {
  readonly specVersion: PassportSpecVersion;
  readonly mode: 'FULL';
  readonly classId: string;
  readonly r: bigint;
  readonly D: bigint;
  readonly rowCount: bigint;
  readonly isSortedByX: true;
  readonly firstTripleId: string;
  readonly lastTripleId: string;
  readonly rows: readonly ClassMatrixRowFull[];
}

export type MaterializedMatrixGroupsMap = Readonly<
  Partial<{
    readonly [G in MatrixColumnGroup]: readonly MatrixGroupColumnMap[G][];
  }>
>;

export interface LazyClassMatrix {
  readonly specVersion: PassportSpecVersion;
  readonly mode: 'LAZY';
  readonly classId: string;
  readonly r: bigint;
  readonly D: bigint;
  readonly rowCount: bigint;
  readonly isSortedByX: true;
  readonly firstTripleId: string;
  readonly lastTripleId: string;
  readonly coreRows: readonly ClassMatrixRowCore[];

  hasGroup(group: MatrixColumnGroup): boolean;
  getMaterializedGroups(): readonly MatrixColumnGroup[];
  materializeGroup<G extends MatrixColumnGroup>(
    group: G
  ): readonly MatrixGroupColumnMap[G][];
  materializeGroups(
    groups: readonly MatrixColumnGroup[]
  ): MaterializedMatrixGroupsMap;
  getRow(
    rowIdx: bigint,
    groups?: readonly MatrixColumnGroup[]
  ): ClassMatrixRowView;
  findRowByTripleId(
    tripleId: string,
    groups?: readonly MatrixColumnGroup[]
  ): ClassMatrixRowView | null;
  findRowByX(
    x: bigint,
    groups?: readonly MatrixColumnGroup[]
  ): ClassMatrixRowView | null;
  toFullMatrix(): FullClassMatrixResult;
}
