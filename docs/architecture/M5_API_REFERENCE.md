# M5 Passports — Public API Reference (`M5-S1`)

**Directory:** `src/core/passports/`  
**Implemented Sub-Phase (`M5-S1`):** `types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts` (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`)  
**Next / Deferred Sub-Phases:** `M5-S2 ClassMatrix` (**Not Started**); `M5-S3 RangeCatalog` & barrel `index.ts` (**Deferred**); `TransversalFacet` (**Deferred**). `Price tree` is not part of the architecture.

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
  Independently checks `CP-INV-01..08` on a `ClassPassportResult`. Throws `PassportInvariantError` (`code: 'INVARIANT_VIOLATION'`) on violation.

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

## 3. Types & Errors (`types.ts`, `errors.ts`)

- **Core Types:** `PassportSpecVersion` (`'0.1'`), `PassportStatus` (`'COMPLETE' | 'INCOMPLETE'`), `PassportOddPrimeFactor`, `PassportNumberTheorySummary`, `SubclassSpectrumEntry`, `ExpectedMatrixSummary`, `ClassPassportResult`, `BuildClassPassportInput`, `ClassifiedTripleInput`, `PassportDiagnosticInput`, `ResolvedEuclideanParameters`.
- **Errors:** `ClassPassportError` (`code: ClassPassportErrorCode`), `InvalidRadiusError` (`'INVALID_RADIUS'`), `PassportMismatchError` (`'PASSPORT_MISMATCH'`), `MissingProfileError` (`'MISSING_PROFILE'`), `PassportInvariantError` (`'INVARIANT_VIOLATION'`), `EuclidAdapterError` (`'EUCLID_ADAPTER_ERROR'`).
