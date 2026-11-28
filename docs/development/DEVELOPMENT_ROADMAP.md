# Development Roadmap

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Frozen Baseline + M5-S1 (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`)

## Milestone Plan

- **Phase 1, 1.1, 1.2:** Completed — Lab shell, UI refinement, navigation, and initial architectural audit.
- **M1 (Exact Computation Core):** Completed & Audited (Frozen) — Autonomous `BigInt` arithmetic, `ExactRational` numbers, radius primitives.
- **M2 (Number Theory Engine):** Completed & Stabilized (Frozen) — Prime factorization, primality certification, divisor generation, hyperbola pairs, arithmetic counters.
- **M3 (Classification Engine):** Completed & Verified (Frozen) — Triangle class $C(r)$ and sub-class $C_k(r)$ builder, Euclidean parameter recovery.
- **M4 (Structural Facets):** Completed & Accepted (Frozen) —
  - `M4-S1 SpornFacet` (Accepted): Sporn coordinates, 4-zone integer classifier, exact rational geometry (`normP = 2 * normS`).
  - `M4-S2 BerggrenFacet` (Accepted): Ternary tree transitions, `stepParent`, bidirectional `canonWord`/`rawWord` addressing, primitive-ancestor inheritance.
  - `M4-S3 ClassProfileFacet` (Accepted): Separated `allTriples`/`primitiveTriples` aggregates, zone histograms, pairwise `ExactRational` means, `CPF-INV-01..12`.
- **M5 (Passports & Matrices):** In Progress (Architecture in `M5_IMPLEMENTATION_BLUEPRINT.md`) —
  - `M5-S1 ClassPassport + EuclidAdapter`: **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`** (`src/core/passports/types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts`, `src/tests/core/classPassportM5S1.test.ts`). Consumes ready M2, M3, and M4-S3 outputs without recomputing classification or profile; implements `CP-INV-01..08`, `{x0, y0} = {v², 2u²}` verification, strict ascending `x` ordering check, partial M2 preservation on `INCOMPLETE`, and separation of `status`/`isComplete` vs. `certificationStatus`.
  - `M5-S2 ClassMatrix` (`Full` & `Lazy`): **Next Step (Not Started)** — Multi-attribute matrix builder (`ARITH`, `EUCLID`, `GEOM`, `SPORN`, `BERGGREN`).
  - `M5-S3 RangeCatalog`: **Deferred** — Range-level passport aggregation across $[r_{\min}, r_{\max}]$ and barrel export.
  - `TransversalFacet`: **Deferred** — Optional post-Q4 extension (`commonLegPrimA`, `commonHypPrimC`).
  - *Note:* `Price tree` is not part of the project architecture.
- **M6 (Independent Verifier):** Planned — Independent automated verifier checking `CHK-01..12`.
- **M7 (Geometric Projection):** Planned — SVG projection and visual adapter translating exact integers to screen coordinates.
- **M8 (Export & Analytics):** Planned — JSON/CSV export, advanced reporting, and workspace analytics.
