# Module Boundaries & Isolation Rules

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Frozen Baseline + `M5-S1` & `M5-S2` (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`)

## 1. Strict Boundary Rules

To maintain absolute mathematical integrity and testability, the codebase enforces strict acyclic hierarchical module boundaries:

```text
src/core/exact/ (M1) ◄── src/core/factorization/ (M2) ◄── src/core/classification/ (M3) ◄── src/core/facets/ (M4) ◄── src/core/passports/ (M5-S1, M5-S2)
```

### 1.1 M1 — Exact Computation Core (`src/core/exact/`)
- **Allowed Dependencies:** Node.js built-ins (tests only), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, UI components, `Math.*`, `Number(...)`, `parseInt`/`parseFloat`, `src/math/`, `src/geometry/`, `src/canonical/`, M2–M8.
- **Rule:** M1 is an autonomous, foundational arithmetic layer (frozen).

### 1.2 M2 — Number Theory Engine (`src/core/factorization/`)
- **Allowed Dependencies:** M1 via barrel export (`../exact/index.ts`), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, UI components, `Math.*`, `Number()`, `src/components/`, `src/canonical/`, M3–M8 modules.
- **Rule:** M2 depends solely on M1 and provides pure number-theoretic primitives for factorization and divisor generation (frozen).

### 1.3 M3 — Classification Engine (`src/core/classification/`)
- **Allowed Dependencies:** M1 (`../exact/index.ts`), M2 (`../factorization/index.ts`), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, `Math.*`, `Number()`, `parseInt`/`parseFloat`, M4–M8 modules.
- **Rule:** M3 consumes M2 hyperbola pairs and M1 exact operations to produce `RadiusClassificationResult` (frozen).

### 1.4 M4 — Structural Facets (`src/core/facets/`)
- **Allowed Dependencies:** M1 (`../exact/index.ts`), M3 (`../classification/index.ts`), and internal facet dependencies strictly in topological order:
  - `spornFacet.ts` (S1): M1, M3 types.
  - `berggrenFacet.ts` (S2): M1, M3 types, `classifySpornZone` from S1 (`./spornFacet.ts`).
  - `classProfileFacet.ts` (S3): M1, M3 types, S1 & S2 types.
- **Forbidden Dependencies:** React, DOM, SVG, `Math.*`, `Number()`, `parseInt`/`parseFloat`, direct re-factorization or re-classification duplicating M2/M3, M5–M8 modules.
- **Rule:** M4 enriches M3 outputs without duplicating M2 factorization or M3 classification (frozen).

### 1.5 M5-S1 — `ClassPassport` & `EuclidAdapter` (`src/core/passports/`)
- **Status:** `IMPLEMENTED — PENDING INDEPENDENT AUDIT` (`types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts`).
- **Allowed Dependencies:** M1 (`../exact/index.ts`), M2 (`../factorization/index.ts` types), M3 (`../classification/index.ts`), M4-S3 (`../facets/index.ts` types), and internal `M5-S1` modules (`./types.ts`, `./errors.ts`).
- **Forbidden Dependencies:** React, DOM, SVG, `Math.*`, `Number()`, `parseInt`/`parseFloat`, `Float64`, duplicating M2 factorization, recomputing M3 classification or `recoverEuclideanParameters` when `triple.euclideanParams` is already present, recomputing M4-S3 `ClassProfileFacet`, `M5-S2` (`classMatrix.ts`), deferred `M5-S3` (`RangeCatalog`) / `TransversalFacet`, `M6–M8`, or `Price tree`.
- **Rule:** `ClassPassport` acts strictly as a zero-duplication assembler and consistency checker over ready M2, M3, and M4-S3 outputs; `EuclidAdapter` verifies `{x0, y0} = {v², 2u²}` against M3 parameters.

### 1.6 M5-S2 — `ClassMatrix` (`src/core/passports/classMatrix.ts`)
- **Status:** `IMPLEMENTED — PENDING INDEPENDENT AUDIT` (`classMatrix.ts` + M5-S2 types/errors).
- **Allowed Dependencies:** M1 (`../exact/index.ts`), M3 (`../classification/index.ts` types), M4-S1/M4-S2 (`../facets/index.ts`), and `M5-S1` (`./euclidAdapter.ts`, `./types.ts`, `./errors.ts`).
- **Forbidden Dependencies:** React, DOM, SVG, `Math.*`, `Number()`, `parseInt`/`parseFloat`, `Float64`, mutating source `classification.allTriples`, `TRANSVERSAL` (`commonLegPrimA`, `commonHypPrimC`), deferred `M5-S3` (`RangeCatalog`), `M6–M8`, or `Price tree`.
- **Rule:** `ClassMatrix` shares pure group evaluators between `Full` and `Lazy` modes, enforces `CM-INV-01..08`, inherits `asymQ` from `M4-S1` (`Q1 = CLOSED`), and preserves `M5-S1` independence.

### 1.7 Remaining Future Modules (Deferred M5 Extensions & `M6–M8`)
- **Rule:** Deferred `M5-S3` (`RangeCatalog`) and `TransversalFacet`, independent verifier (`M6`), visual projection (`M7`), and export (`M8`) must respect strict dependency directions. Specifically, `M6` must remain independent from generation logic to prevent common-mode verification errors.
