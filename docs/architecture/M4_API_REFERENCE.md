# M4 Structural Facets — Public API Reference

**Barrel Entry Point:** `src/core/facets/index.ts`  
**Modules:** `spornFacet.ts` (S1), `berggrenFacet.ts` (S2), `classProfileFacet.ts` (S3), `types.ts`, `errors.ts`

All signatures below match the actual TypeScript exports in `src/core/facets/`.

---

## 1. M4-S1: `SpornFacet` (`src/core/facets/spornFacet.ts`)

### Functions
- **`classifySpornZone(x: bigint, r: bigint): SpornZone`**  
  Classifies $(x, r)$ into `'Z0_ROOT' | 'Z1_A1' | 'Z3_A3' | 'Z2_A2'` using exact `BigInt` inequalities. Throws `InvalidSpornInputError` if $x \le 0$, $r \le 0$, $(2r-x)^2 = 2r^2$, or $x^2 \ge 2r^2$ when $x > r$.
- **`computeSpornFacetForTriple(triple: PythagoreanTriple): SpornFacetResult`**  
  Computes exact `spornX`, `spornY`, `spornZone`, `rayBaseR0 = r / k`, `parityCase` (`'X0_ODD' | 'X0_EVEN'`), and exact rational geometry (`tanHalfA`, `tanHalfB`, `sinA`, `cosA`, `tanA`, `formT`, `asymQ`, `normS`, `normP = 2 * normS`), then runs `verifySpornFacetInvariants`.
- **`computeSpornFacetsForClass(classification: RadiusClassificationResult): readonly SpornFacetResult[]`**  
  Requires `classification.isComplete === true` and non-empty `allTriples`; otherwise throws `IncompleteClassificationError` (`code: 'INCOMPLETE_CLASSIFICATION_RESULT'`).
- **`verifySpornFacetInvariants(facet: SpornFacetResult): void`**  
  Verifies `SF-INV-01..06` on a computed `SpornFacetResult`. Throws `InvalidSpornInputError` on violation.

### Output Type & Errors
- **`SpornFacetResult`**: `{ tripleId, classId, primId, r, k, isPrimitive, x, y, spornX, spornY, spornZone, rayBaseR0, parityCase, tanHalfA, tanHalfB, sinA, cosA, tanA, formT, asymQ, normS, normP }`.
- **Errors**: `SpornFacetError`, `IncompleteClassificationError` (`code = 'INCOMPLETE_CLASSIFICATION_RESULT'`), `InvalidSpornInputError`.

---

## 2. M4-S2: `BerggrenFacet` (`src/core/facets/berggrenFacet.ts`)

### Constants & Tree Operators
- **`BERGGREN_ROOT_TRIPLE: PrimitiveTripleState`**: `{ a: 3n, b: 4n, c: 5n, r: 1n, x: 1n, y: 2n }`.
- **`stepA1(state: PrimitiveTripleState): BerggrenChildTransition`**
- **`stepA2(state: PrimitiveTripleState): BerggrenChildTransition`**
- **`stepA3(state: PrimitiveTripleState): BerggrenChildTransition`**
- **`stepBerggren(state: PrimitiveTripleState, operator: BerggrenOperator): BerggrenChildTransition`**  
  All forward steps validate `state` as a canonical primitive state (`gcd = 1`, `a < b < c`, $a^2+b^2=c^2$, $xy=2r^2$) and return `{ operator, rawTriple, canonTriple, legSwapped, spornX, spornY, spornZone, childId }`. Throw `InvalidBerggrenInputError` on non-primitive (`'NON_PRIMITIVE_TRIPLE'`), non-canonical (`'NON_CANONICAL_ORDER'`), or dimension/hyperbola errors.
- **`stepParent(state: PrimitiveTripleState): BerggrenParentResult`**  
  Recovers `{ parentOperator, parentTriple, parentId }` deterministically from `classifySpornZone(state.x, state.r)` and verifies forward reversibility. Returns `{ parentOperator: null, parentTriple: null, parentId: null }` for root `(3, 4, 5)`.
- **`requireBerggrenParent(state: PrimitiveTripleState): { readonly parentOperator: BerggrenOperator; readonly parentTriple: PrimitiveTripleState; readonly parentId: string }`**  
  Same as `stepParent`, except throws `RootHasNoParentError` (`code = 'ROOT_HAS_NO_PARENT'`) for `(3, 4, 5)`.

### Bidirectional Addressing
- **`canonWordToRawWord(canonWord: readonly BerggrenOperator[]): readonly BerggrenOperator[]`**
- **`rawWordToCanonWord(rawWord: readonly BerggrenOperator[]): readonly BerggrenOperator[]`**  
  Bijective conjugators flipping `A1 <-> A3` on odd accumulated swap parity while keeping `A2` invariant.
- **`applyCanonWord(canonWord: readonly BerggrenOperator[]): PrimitiveTripleState`**
- **`applyRawWord(rawWord: readonly BerggrenOperator[]): { readonly rawTriple: RawTripleLegs; readonly canonTriple: PrimitiveTripleState; readonly legSwapped: boolean }`**

### Class Facet Builders & Verifier
- **`computeBerggrenFacetForTriple(triple: PythagoreanTriple): BerggrenFacetResult`**  
  Accepts any valid M3 `PythagoreanTriple` (both primitive and scaled $k > 1$). Resolves `primitiveAncestor` ($r_0 = r/k$), descends to `(3, 4, 5)`, computes `canonWord`, `rawWord`, `treeDepth`, `parentOperator`, `parentId`, `children`, sets `appliesToPrimitiveAncestor = !isPrimitive`, and runs `verifyBerggrenFacetInvariants`.
- **`computeBerggrenFacetsForClass(classification: RadiusClassificationResult): readonly BerggrenFacetResult[]`**  
  Enforces completeness (`isComplete === true`, optional `status === 'COMPLETE'`, array/count equality with `expectedTotalCount`); otherwise throws `IncompleteClassificationError`.
- **`verifyBerggrenFacetInvariants(facet: BerggrenFacetResult): void`**  
  Verifies `BF-INV-01..06` and scaled-triple inheritance consistency. Throws `BerggrenFacetError('INVARIANT_VIOLATION', ...)`.

### Errors
- **`BerggrenFacetError`** (`code: BerggrenFacetErrorCode`), **`InvalidBerggrenInputError`**, **`RootHasNoParentError`**.
- `BerggrenFacetErrorCode`: `'INCOMPLETE_CLASSIFICATION_RESULT' | 'INVALID_TRIPLE_DIMENSIONS' | 'INVALID_HYPERBOLA_IDENTITY' | 'NON_CANONICAL_ORDER' | 'NON_PRIMITIVE_TRIPLE' | 'ROOT_HAS_NO_PARENT' | 'INVARIANT_VIOLATION'`.

---

## 3. M4-S3: `ClassProfileFacet` (`src/core/facets/classProfileFacet.ts`)

### Functions
- **`buildClassProfileFacet(classification: RadiusClassificationResult, spornFacets: readonly SpornFacetResult[], berggrenFacets: readonly BerggrenFacetResult[]): ClassProfileFacetResult`**  
  Validates radius ($r \ge 1$), completeness (`isComplete`, optional `status`, `totalTriplesCount === expectedTotalCount`), array lengths, uniform `classId` / `r`, uniqueness and 1-to-1 `tripleId` bijection across M3, S1, and S2, and non-empty primitive set ($k = 1$). Computes frozen class aggregates using balanced pairwise `ExactRational` summation and validates `CPF-INV-01..12` via `verifyClassProfileInvariants`.
- **`verifyClassProfileInvariants(profile: ClassProfileFacetResult, expectedCounts: { readonly expectedN: bigint; readonly expectedT: bigint }): void`**  
  Independently verifies `CPF-INV-01..12` against mandatory `expectedCounts`.

### Types & Errors
- **`ZoneHistogram`**: `{ readonly Z1_A1: bigint; readonly Z3_A3: bigint; readonly Z0_ROOT: bigint; readonly Z2_A2: bigint }`.
- **`ClassPopulationMetrics`**: `{ readonly count: bigint; readonly meanSpornX: ExactRational; readonly meanADivC: ExactRational; readonly zoneHistogram: ZoneHistogram }`.
- **`PrimitivePopulationMetrics`**: extends `ClassPopulationMetrics` with `{ readonly berggrenDepthMin: bigint; readonly berggrenDepthMax: bigint }`.
- **`ClassProfileFacetResult`**: `{ readonly classId: string; readonly r: bigint; readonly cMin: bigint; readonly cMax: bigint; readonly cMinRatio: ExactRational; readonly hasSub5rCompression: boolean; readonly spornXMin: ExactRational; readonly spornXMax: ExactRational; readonly allTriples: ClassPopulationMetrics; readonly primitiveTriples: PrimitivePopulationMetrics }`.
- **`ClassProfileFacetError`** (`code: ClassProfileErrorCode`): `'INCOMPLETE_CLASSIFICATION_RESULT' | 'INVALID_RADIUS' | 'FACET_COUNT_MISMATCH' | 'TRIPLE_ID_MISMATCH' | 'DUPLICATE_TRIPLE_ID' | 'CLASS_ID_MISMATCH' | 'PRIMITIVE_SET_EMPTY' | 'INVARIANT_VIOLATION'`.

### Known Constraints
- Batch facet builders reject incomplete M3 results (`isComplete === false`) rather than emitting partial metrics.
- `computeBerggrenFacetForTriple` and `verifyBerggrenFacetInvariants` reconstruct full tree words from `(3, 4, 5)` in $O(\text{treeDepth}) \le O(r_0)$ BigInt steps.
