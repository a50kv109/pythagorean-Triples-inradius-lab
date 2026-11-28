# Implementation Status

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Frozen Baseline + `M5-S1` & `M5-S2` (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`)

## Truthful Milestone Status Table

| Milestone / Component | Status | Verified Artifacts |
| :--- | :--- | :--- |
| **Phase 1 — Workspace & Shell** | Completed | `src/App.tsx`, `src/components/`, `src/i18n/` |
| **Phase 1.1 / 1.2 — Refinement & Audit** | Completed | `PHASE_1_1_REFINEMENT_REPORT.md`, `PHASE_1_2_AUDIT_REPORT.md` |
| **M1 — Exact Computation Core** | Completed & Audited (Frozen) | `src/core/exact/`, `src/tests/core/exactM1.test.ts`, `M1_IMPLEMENTATION_REPORT.md`, `M1_POST_IMPLEMENTATION_AUDIT.md` |
| **M2 — Number Theory Engine** | Completed & Stabilized (Frozen) | `src/core/factorization/`, `src/tests/core/factorizationM2.test.ts`, `M2_IMPLEMENTATION_REPORT.md`, `M2_STABILIZATION_REPORT.md` |
| **M3 — Classification Engine** | Completed & Verified (Frozen) | `src/core/classification/`, `src/tests/core/classificationM3.test.ts`, `M3_IMPLEMENTATION_REPORT.md` |
| **M4-S1 — SpornFacet** | **Accepted (Frozen)** | `src/core/facets/spornFacet.ts`, `src/tests/core/spornFacetM4S1.test.ts` |
| **M4-S2 — BerggrenFacet** | **Accepted (Frozen)** | `src/core/facets/berggrenFacet.ts`, `src/tests/core/berggrenFacetM4S2.test.ts` |
| **M4-S3 — ClassProfileFacet** | **Accepted (Frozen)** | `src/core/facets/classProfileFacet.ts`, `src/tests/core/classProfileFacetM4S3.test.ts` |
| **M4 — Structural Facets (Aggregate)** | **COMPLETED (Frozen Baseline)** | `src/core/facets/index.ts`, `M4_STRUCTURAL_FACETS_FINAL.md` |
| **M5-S1 — ClassPassport & EuclidAdapter** | **IMPLEMENTED — PENDING INDEPENDENT AUDIT** | `src/core/passports/types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts`, `src/tests/core/classPassportM5S1.test.ts`, `package.json` |
| **M5-S2 — ClassMatrix (`Full` & `Lazy`)** | **IMPLEMENTED — PENDING INDEPENDENT AUDIT** | `src/core/passports/classMatrix.ts`, `types.ts`, `errors.ts`, `src/tests/core/classMatrixM5S2.test.ts`, `package.json` |
| **M5-S3 — RangeCatalog** | Deferred | Planned in `M5_IMPLEMENTATION_BLUEPRINT.md` |
| **TransversalFacet (`M5-S4` / post-M5)** | Deferred | Optional post-Q4 extension (`commonLegPrimA`, `commonHypPrimC`) |
| **M6 — Independent Verifier (`CHK-01..12`)** | Not Implemented | — |
| **M7 — Geometric Projection** | Not Implemented | — |
| **M8 — Export & Analytics** | Not Implemented | — |

> **Architectural & Design Notes:**
> - `Q1 = CLOSED` — M5 inherits `asymQ = (b - a) / (a + b)` from frozen `M4-S1` without redefining it.
> - `Price tree` is **not** part of the project architecture.

## M5-S1 & M5-S2 Verification Scope (Gemini Implementation Environment vs. Independent Audit)
The following checks were executed and passed in the Gemini implementation environment after final `M5-S1` hardening (`CP-INV-07` negative test on `isSortedByX = undefined`) and `M5-S2` `ClassMatrix` implementation; they are recorded as implementation-environment verification and **await independent audit confirmation**:
- `M5-S1` suite (`src/tests/core/classPassportM5S1.test.ts`): **PASS** (covers `CP-INV-01..08`, negative `CP-INV-07` test, `{x0, y0} = {v², 2u²}` in `EuclidAdapter`, strict ascending `x` enforcement on `COMPLETE` passports, partial M2 preservation on `INCOMPLETE`, and `status`/`isComplete` vs. `certificationStatus`).
- `M5-S2` suite (`src/tests/core/classMatrixM5S2.test.ts`): **PASS** (covers `CM-INV-01..08`, Golden matrices $r = 1, 2, 3, 6, 15, 30, 35, 105, 420$, `Full === Lazy` parity across materialization orders, $O(1)$ cache identity, `GEOM` reusing cached `SPORN` without recomputation, shallow-copy sorting without mutating source `allTriples`, negative guards including `isComplete === false`, `totalTriplesCount !== expectedTotalCount`, duplicate `tripleId`/`x`, `verifyPassportMatrixAlignment`, and $r = 1..50$ sweep).
- Full `npm test` (all 10 suites): **PASS**.
- TypeScript type check (`npx tsc --noEmit`): **PASS** (0 errors).
- Production build (`npm run build`): **PASS**.
- Static isolation scan on `src/core/passports/`: **`SCAN_CLEAN`** (zero `float64`/`Number()`/`Math.*`/`React`).

## Known Limitations & Non-Blocking Notes
1. Factorization of extremely large hard semiprimes ($> 30\text{--}40$ digits) without small prime factors may time out or exhaust iteration budgets, resulting in an explicit `INCOMPLETE` (`UNFACTORED_COMPOSITE`) status.
2. High-composite radii with $\tau(2r^2) > 500{,}000$ trigger combinatorial enumeration limits to prevent memory exhaustion; M4 batch functions and `M5-S2` `ClassMatrix` (`buildFullClassMatrix`, `createLazyClassMatrix`) reject incomplete M3 inputs with `INCOMPLETE_CLASSIFICATION_RESULT`, while `M5-S1` `ClassPassport` preserves partial M2 data and emits an explicit `INCOMPLETE` passport (`profile = null`, `subclassSpectrum = []`, `expectedMatrixSummary = { rowCount: null, isSortedByX: false, firstTripleId: null, lastTripleId: null }`).
3. `computeBerggrenFacetForTriple` recovers `canonWord` via `stepParent` in $O(d)$ and `verifyBerggrenFacetInvariants` independently re-evaluates `canonWord` and `rawWord` in $O(d)$, where $d = \text{treeDepth} \le r_0 - 1$ (attaining $d = r_0 - 1$ on the $x_0 = 1$ boundary series). This is an intentional trade-off of extra work for independent path reconstruction verifiability, without artificial depth or radius limits.
