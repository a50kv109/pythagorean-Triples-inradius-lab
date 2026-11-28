# Module Boundaries & Isolation Rules

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Baseline (M1–M4 Completed)

## 1. Strict Boundary Rules

To maintain absolute mathematical integrity and testability, the codebase enforces strict acyclic hierarchical module boundaries:

```text
src/core/exact/ (M1) ◄── src/core/factorization/ (M2) ◄── src/core/classification/ (M3) ◄── src/core/facets/ (M4)
```

### 1.1 M1 — Exact Computation Core (`src/core/exact/`)
- **Allowed Dependencies:** Node.js built-ins (tests only), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, UI components, `Math.*`, `Number(...)`, `parseInt`/`parseFloat`, `src/math/`, `src/geometry/`, `src/canonical/`, M2–M8.
- **Rule:** M1 is an autonomous, foundational arithmetic layer.

### 1.2 M2 — Number Theory Engine (`src/core/factorization/`)
- **Allowed Dependencies:** M1 via barrel export (`../exact/index.ts`), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, UI components, `Math.*`, `Number()`, `src/components/`, `src/canonical/`, M3–M8 modules.
- **Rule:** M2 depends solely on M1 and provides pure number-theoretic primitives for factorization and divisor generation.

### 1.3 M3 — Classification Engine (`src/core/classification/`)
- **Allowed Dependencies:** M1 (`../exact/index.ts`), M2 (`../factorization/index.ts`), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, `Math.*`, `Number()`, `parseInt`/`parseFloat`, M4–M8 modules.
- **Rule:** M3 consumes M2 hyperbola pairs and M1 exact operations to produce `RadiusClassificationResult`.

### 1.4 M4 — Structural Facets (`src/core/facets/`)
- **Allowed Dependencies:** M1 (`../exact/index.ts`), M3 (`../classification/index.ts`), and internal facet dependencies strictly in topological order:
  - `spornFacet.ts` (S1): M1, M3 types.
  - `berggrenFacet.ts` (S2): M1, M3 types, `classifySpornZone` from S1 (`./spornFacet.ts`).
  - `classProfileFacet.ts` (S3): M1, M3 types, S1 & S2 types.
- **Forbidden Dependencies:** React, DOM, SVG, `Math.*`, `Number()`, `parseInt`/`parseFloat`, direct re-factorization or re-classification duplicating M2/M3, M5–M8 modules.
- **Rule:** M4 enriches M3 outputs without duplicating M2 factorization or M3 classification.

### 1.5 Future Modules (M5–M8)
- **Rule:** Future passports/matrices (`M5`), independent verifier (`M6`), visual projection (`M7`), and export (`M8`) must respect strict dependency directions. Specifically, `M6` must remain independent from generation logic to prevent common-mode verification errors.
