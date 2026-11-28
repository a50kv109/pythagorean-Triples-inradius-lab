# Implementation Status

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Baseline (M1–M4 Completed)

## Truthful Milestone Status Table

| Milestone / Component | Status | Verified Artifacts |
| :--- | :--- | :--- |
| **Phase 1 — Workspace & Shell** | Completed | `src/App.tsx`, `src/components/`, `src/i18n/` |
| **Phase 1.1 / 1.2 — Refinement & Audit** | Completed | `PHASE_1_1_REFINEMENT_REPORT.md`, `PHASE_1_2_AUDIT_REPORT.md` |
| **M1 — Exact Computation Core** | Completed & Audited | `src/core/exact/`, `src/tests/core/exactM1.test.ts`, `M1_IMPLEMENTATION_REPORT.md`, `M1_POST_IMPLEMENTATION_AUDIT.md` |
| **M2 — Number Theory Engine** | Completed & Stabilized | `src/core/factorization/`, `src/tests/core/factorizationM2.test.ts`, `M2_IMPLEMENTATION_REPORT.md`, `M2_STABILIZATION_REPORT.md` |
| **M3 — Classification Engine** | Completed & Verified | `src/core/classification/`, `src/tests/core/classificationM3.test.ts`, `M3_IMPLEMENTATION_REPORT.md` |
| **M4-S1 — SpornFacet** | **Accepted** | `src/core/facets/spornFacet.ts`, `src/tests/core/spornFacetM4S1.test.ts` |
| **M4-S2 — BerggrenFacet** | **Accepted** | `src/core/facets/berggrenFacet.ts`, `src/tests/core/berggrenFacetM4S2.test.ts` |
| **M4-S3 — ClassProfileFacet** | **Accepted** | `src/core/facets/classProfileFacet.ts`, `src/tests/core/classProfileFacetM4S3.test.ts` |
| **M4 — Structural Facets (Aggregate)** | **COMPLETED** | `src/core/facets/index.ts`, `M4_STRUCTURAL_FACETS_FINAL.md` |
| **M5 — Class Passports & Matrices** | Not Implemented | — |
| **M6 — Independent Verifier (`CHK-01..12`)** | Not Implemented | — |
| **M7 — Geometric Projection** | Not Implemented | — |
| **M8 — Export & Analytics** | Not Implemented | — |

## Known Limitations & Non-Blocking Notes
1. Factorization of extremely large hard semiprimes ($> 30\text{--}40$ digits) without small prime factors may time out or exhaust iteration budgets, resulting in an explicit `INCOMPLETE` (`UNFACTORED_COMPOSITE`) status.
2. High-composite radii with $\tau(2r^2) > 500{,}000$ trigger combinatorial enumeration limits to prevent memory exhaustion; M4 batch functions reject incomplete M3 inputs with `INCOMPLETE_CLASSIFICATION_RESULT`.
3. `computeBerggrenFacetForTriple` and `verifyBerggrenFacetInvariants` reconstruct paths from root in $O(d) \le O(r_0)$ BigInt steps (`treeDepth === r0 - 1n` on the $x_0 = 1$ boundary branch), which is suitable for research radii up to thousands but linear in $r_0$ for extreme boundary triples.
4. In `src/tests/core/berggrenFacetM4S2.test.ts` Section 2, the 9 explicit level-2 assertions cover children of `(5,12,13)`, `(8,15,17)`, and `(7,24,25)`, while the three children of `A2(root) = (20,21,29)` (`(36,77,85)`, `(119,120,169)`, `(39,80,89)`) are verified via the `r=1..50` sweep in Section 10 and direct audit.
