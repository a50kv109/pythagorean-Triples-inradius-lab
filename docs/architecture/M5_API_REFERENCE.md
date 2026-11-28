# M5 Passports & Matrices — Public API Reference (`M5-S1` & `M5-S2`)

**Directory:** `src/core/passports/`  
**Implemented Sub-Phases:**
- **`M5-S1` (`ClassPassport` + `EuclidAdapter`):** `types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts` — **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`**
- **`M5-S2` (`ClassMatrix`):** `classMatrix.ts` (+ M5-S2 contracts in `types.ts`, `errors.ts`) — **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`**  
**Design Decisions & Deferred Scope:**
- **`Q1 = CLOSED`:** M5 inherits `asymQ = (b - a) / (a + b)` directly from frozen `M4-S1` without redefining it.
- **Deferred:** `M5-S3 RangeCatalog` & barrel `index.ts` (**Deferred**); `TRANSVERSAL` (`commonLegPrimA`, `commonHypPrimC`) (**Deferred**).
- **Excluded:** `Price tree` is not part of the architecture.

All signatures below match the actual TypeScript exports in `src/core/passports/`.

---

## 1. `EuclidAdapter` (`src/core/passports/euclidAdapter.ts`)

### Functions
- **`resolveEuclideanParameters(triple: ClassifiedTripleInput): EuclideanParameters`**  
  Resolves immutable `{ m, n, u, v }` for a classified triple without duplicating M3 work:
  - Validates positive `bigint` fields `r`, `k`, `x`, `y` and scale divisibility (`k | r`, `k | x`, `k | y`), yielding `(r0, x0, y0) = (r/k, x/k, y/k)`.
  - If `triple.primitiveAncestor` is present, enforces exact match with `(x0, y0)`.
  - When `triple.euclideanParams` is present, validates $n = u$, $m = u + v$, $m > n > 0$, $u \cdot v = r_0$, $\gcd(m, n) = 1$, $2 \nmid (m + n)$, **and exact primitive shift correspondence** $\{x_0, y_0\} = \{v^2, 2u^2\}$.
  - Falls back to M3 `recoverEuclideanParameters(x0, y0)` only when `triple.euclideanParams` is omitted.
  - Throws `EuclidAdapterError` on any structural or shift mismatch.

---

## 2. `ClassPassport` (`src/core/passports/classPassport.ts`)

### Functions
- **`buildClassPassport(input: BuildClassPassportInput): ClassPassportResult`**  
  Assembles an immutable `ClassPassportResult` (`CL-R{r}-D{2r}`) directly from ready M2 (`RadiusNumberTheoryResult`), M3 (`RadiusClassificationResult`), and M4-S3 (`ClassProfileFacetResult`) outputs without recomputing factorization, classification, or profile metrics:
  - Validates `r >= 1n`, `D === 2n * r`, `twoRSquared === 2n * r * r`, and cross-module `r` / `classId` alignment.
  - Separates computational completeness (`status: 'COMPLETE' | 'INCOMPLETE'`, `isComplete`) from M2 mathematical certification (`certificationStatus: 'PROVEN_COMPLETE' | 'PROBABLE_COMPLETE' | 'INCOMPLETE'`).
  - **When M2 or M3 is incomplete:** preserves available partial M2 data in `numberTheory`, sets `status: 'INCOMPLETE'`, `isComplete: false`, `profile: null`, `subclassSpectrum: []`, and `expectedMatrixSummary: { rowCount: null, isSortedByX: false, firstTripleId: null, lastTripleId: null }`, then validates `CP-INV-01`, `CP-INV-02`, and `CP-INV-07`.
  - **When M2 and M3 are complete:** requires a valid `ClassProfileFacetResult` (`MissingProfileError` if missing), verifies M2 ↔ M3 ↔ M4-S3 counter consistency ($N, T, \tau(r)$), enforces **strict ascending `x` ordering** on `classification.allTriples` (`isSortedByX: true`), builds ascending-$k$ `subclassSpectrum`, and validates `CP-INV-01..08`.
- **`verifyClassPassportInvariants(passport: ClassPassportResult): void`**  
  Independently checks `CP-INV-01..08` on a `ClassPassportResult`. For `INCOMPLETE` passports, `CP-INV-07` explicitly enforces `expectedMatrixSummary.isSortedByX === false` (rejecting non-boolean/corrupted values such as `undefined`). Throws `PassportInvariantError` (`code: 'INVARIANT_VIOLATION'`) on violation.

### Implemented Invariants (`CP-INV-01..08`)
- **`CP-INV-01`:** `r >= 1n`, `D === 2n * r`, `twoRSquared === 2n * r * r`, `classId === CL-R{r}-D{2r}`.
- **`CP-INV-02`:** `isComplete === (status === 'COMPLETE')`; `COMPLETE` requires non-`INCOMPLETE` M2 certification, `isDivisorEnumerationComplete === true`, and non-null `profile`.
- **`CP-INV-03`:** `COMPLETE` passport has non-null M2 counters (`omegaStar`, `tauR`, `tauTwoRSquared`, `T`, `N`, `divisorsOfR`) matching exact prime-factorization formulas $T = 2^{\omega^*(r)}$ and $N = (e_0 + 1)\prod (2e_i + 1) = \tau(2r^2)/2$.
- **`CP-INV-04`:** `subclassSpectrum` is strictly sorted ascending by `k`, has length $\tau(r)$, satisfies $k \cdot r_0 = r$ and cardinality match, and sums to $N$.
- **`CP-INV-05`:** Embedded M4-S3 `profile` matches `r`, `classId`, `N`, and `T`.
- **`CP-INV-06`:** For `COMPLETE` passports, `expectedMatrixSummary.rowCount === N`, `isSortedByX === true`, and non-null `firstTripleId` / `lastTripleId`.
- **`CP-INV-07`:** For `INCOMPLETE` passports, `profile === null`, `subclassSpectrum.length === 0`, `expectedMatrixSummary.rowCount === null`, `isSortedByX === false`, and null first/last triple boundaries (while preserving available M2 `numberTheory` fields).
- **`CP-INV-08`:** `PROBABLE_COMPLETE` certification remains computationally `COMPLETE` (`isComplete === true`) whenever M3 and M4-S3 are complete.

---

## 3. `ClassMatrix` (`src/core/passports/classMatrix.ts`)

### Constants & Builders
- **`ALL_MATRIX_COLUMN_GROUPS: readonly MatrixColumnGroup[]`**  
  Frozen ordered list: `['ARITH', 'EUCLID', 'GEOM', 'SPORN', 'BERGGREN']` (`TRANSVERSAL` is deferred).
- **`createLazyClassMatrix(classification: RadiusClassificationResult, options?: BuildClassMatrixOptions): LazyClassMatrix`**  
  Builds an immutable `CORE`/`INDEX` matrix backbone with on-demand cached group materialization:
  - **Incomplete Policy:** Rejects `classification.isComplete === false` or `totalTriplesCount !== expectedTotalCount` with `IncompleteClassificationError` (`code: 'INCOMPLETE_CLASSIFICATION_RESULT'`).
  - **B5 Copy-Sort Policy:** Validates every triple (`r >= 1n`, Pythagorean/hyperbola identities, canonical IDs), rejects duplicate `tripleId` (`DUPLICATE_TRIPLE_ID`) or duplicate `x` (`DUPLICATE_X`), sorts a **shallow copy** deterministically by ascending `x` without mutating `classification.allTriples`, and assigns continuous `rowIdx = 0n..N-1n` after sorting.
  - **Facet Cache Validation:** Optional `options.spornFacets` / `options.berggrenFacets` are matched 1-to-1 by `tripleId` against the corresponding M3 triple (`tripleId`, `classId`, `r`, `primId`, `k`, `isPrimitive`, plus `appliesToPrimitiveAncestor`, `primitiveAncestor` fields `a, b, c, x, y`, and `primitiveRadius` for Berggren facets) and checked via `verifySpornFacetInvariants()` / `verifyBerggrenFacetInvariants()` (`FACET_CACHE_MISMATCH` on mismatch).
  - **Lazy Caching:** Methods `hasGroup`, `getMaterializedGroups`, `materializeGroup`, `materializeGroups`, `getRow`, `findRowByTripleId`, `findRowByX`, and `toFullMatrix()`. Repeated `materializeGroup(g)` calls return the exact frozen cached array reference in $O(1)$. When `SPORN` (or `options.spornFacets`) is materialized before `GEOM`, `GEOM` directly reuses cached `sinA`/`cosA` references without recomputing `SpornFacet`.
- **`buildFullClassMatrix(classification: RadiusClassificationResult, options?: BuildClassMatrixOptions): FullClassMatrixResult`**  
  Eagerly builds an immutable `FullClassMatrixResult` (`mode: 'FULL'`) using the exact same pure group evaluators as `LazyClassMatrix`, and validates `CM-INV-01..08`.
- **`findFullMatrixRowByX(matrix: FullClassMatrixResult, x: bigint): ClassMatrixRowFull | null`**  
  $O(\log N)$ binary search by hyperbolic shift `x` using pure `bigint` comparisons.
- **`getFullMatrixRowByIndex(matrix: FullClassMatrixResult, rowIdx: bigint): ClassMatrixRowFull | null`**  
  $O(\log N)$ lookup by `bigint` `rowIdx` without `Number()` conversions.
- **`verifyFullLazyMatrixParity(fullMatrix: FullClassMatrixResult, lazyMatrix: LazyClassMatrix): void`**  
  Verifies bitwise row/header parity between `Full` and `Lazy` (`CM-INV-08`).
- **`verifyClassMatrixInvariants(matrix: FullClassMatrixResult, lazyCounterpart?: LazyClassMatrix): void`**  
  Independently verifies `CM-INV-01..08` (`MatrixInvariantError` on failure).
- **`verifyPassportMatrixAlignment(passport: ClassPassportResult, matrix: FullClassMatrixResult | LazyClassMatrix): void`**  
  Verifies joint `M5-S1 <-> M5-S2` alignment (`ClassPassport.expectedMatrixSummary <-> ClassMatrix`), throwing `ClassMatrixError` (`'TRIPLE_MISMATCH'`) on incomplete passports or boundary mismatches.

### Implemented Invariants (`CM-INV-01..08`)
- **`CM-INV-01`:** `CORE` fields, hyperbola/Pythagorean equations, and canonical IDs (`tripleId`, `primId`, `classId`) match M3 identities.
- **`CM-INV-02`:** Continuous `rowIdx` (`0n..N-1n`), valid header bounds (`rowCount`, `firstTripleId`, `lastTripleId`), and `Object.freeze` immutability across matrix, rows, and column groups.
- **`CM-INV-03`:** Strict ascending `x` ordering and uniqueness of `tripleId` and `x`.
- **`CM-INV-04`:** Geometric identities (`p = 3r + x + y = c + r`, `P = 2p`, `S = ab/2 = r * p`).
- **`CM-INV-05`:** Arithmetic group (`gcdSides === k`, divisibility flags `aEven`, `div3Leg`, `div4Leg`, `div5Side`) and `EUCLID` correspondence (`{x0, y0} = {v², 2u²}`, `m = u + v`, `n = u`, `uv = r0`).
- **`CM-INV-06`:** Exact rational `GEOM`/`SPORN` parity (`aDivC === sinA`, `bDivC === cosA`, and `asymQ = (b - a) / (a + b)` inherited from `M4-S1`, `Q1 = CLOSED`).
- **`CM-INV-07` (`BERGGREN` mathematical identity):** Verifies not only internal consistency (`treeLegSwapped === (parentOperator === 'A2' || parentOperator === 'A3')`, `canonWord <-> rawWord` via `canonWordToRawWord`, `treeDepth`, `parentOperator`, `appliesToPrimitiveAncestor`, root equivalence `treeDepth === 0n <=> (3, 4, 5)`), but also exact reconstruction of the row's primitive ancestor `(a0, b0, c0, r0, x0, y0)` from `CORE` parameters using M4-S2 `applyCanonWord()` and `applyRawWord().canonTriple`.
- **`CM-INV-08`:** `Full === Lazy` parity across all column groups and materialization orders (verified when `lazyCounterpart` is passed).

---

## 4. Types & Errors (`types.ts`, `errors.ts`)

- **M5-S1 Core Types:** `PassportSpecVersion` (`'0.1'`), `PassportStatus` (`'COMPLETE' | 'INCOMPLETE'`), `PassportOddPrimeFactor`, `PassportNumberTheorySummary`, `SubclassSpectrumEntry`, `ExpectedMatrixSummary`, `ClassPassportResult`, `BuildClassPassportInput`, `ClassifiedTripleInput`, `PassportDiagnosticInput`, `ResolvedEuclideanParameters`.
- **M5-S2 Matrix Types:** `MatrixColumnGroup` (`'ARITH' | 'EUCLID' | 'GEOM' | 'SPORN' | 'BERGGREN'`), `ClassMatrixRowCore`, `MatrixArithColumns`, `MatrixEuclidColumns`, `MatrixGeomColumns`, `MatrixSpornColumns`, `MatrixBerggrenColumns`, `MatrixGroupColumnMap`, `ClassMatrixRowFull`, `ClassMatrixRowView`, `BuildClassMatrixOptions`, `FullClassMatrixResult`, `MaterializedMatrixGroupsMap`, `LazyClassMatrix`.
- **M5-S1 Errors:** `ClassPassportError` (`code: ClassPassportErrorCode`), `InvalidRadiusError` (`'INVALID_RADIUS'`), `PassportMismatchError` (`'PASSPORT_MISMATCH'`), `MissingProfileError` (`'MISSING_PROFILE'`), `PassportInvariantError` (`'INVARIANT_VIOLATION'`), `EuclidAdapterError` (`'EUCLID_ADAPTER_ERROR'`).
- **M5-S2 Errors:** `ClassMatrixError` (`code: ClassMatrixErrorCode`), `IncompleteClassificationError` (`'INCOMPLETE_CLASSIFICATION_RESULT'`), `MatrixInvariantError` (`'INVARIANT_VIOLATION'`), covering `'INVALID_RADIUS'`, `'DUPLICATE_TRIPLE_ID'`, `'DUPLICATE_X'`, `'TRIPLE_MISMATCH'`, `'FACET_CACHE_MISMATCH'`, `'INVALID_COLUMN_GROUP'`, `'INVALID_ROW_INDEX'`, and `'INVARIANT_VIOLATION'`.
