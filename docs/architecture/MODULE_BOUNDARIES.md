# Module Boundaries & Isolation Rules

**Project:** Pythagoras Circles — Canonical Geometry Research Laboratory  
**Milestone:** M2 Baseline

## 1. Strict Boundary Rules

To maintain absolute mathematical integrity and testability, the codebase enforces strict hierarchical module boundaries:

```text
src/core/exact/ (M1) ◄── src/core/factorization/ (M2) ◄── src/math/ / src/components/ (UI)
```

### 1.1 M1 — Exact Computation Core (`src/core/exact/`)
- **Allowed Dependencies:** Node.js built-ins (`node:assert`, `node:fs`), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, UI components, `Math.*`, `Number(...)`, `parseInt`/`parseFloat`, `src/math/`, `src/geometry/`, `src/canonical/`.
- **Rule:** M1 is an autonomous, foundational arithmetic layer.

### 1.2 M2 — Number Theory Engine (`src/core/factorization/`)
- **Allowed Dependencies:** M1 via barrel export (`../exact/index.ts`), native JS `BigInt`.
- **Forbidden Dependencies:** React, DOM, SVG, UI components, `Math.*`, `Number()`, `src/components/`, `src/canonical/`, future M3–M8 modules.
- **Rule:** M2 depends solely on M1 and provides pure number-theoretic primitives for factorization and divisor generation.

### 1.3 Future Modules (M3–M8)
- **Rule:** Future classification, facets, class passports, and the independent verifier (`M6`) must respect strict dependency directions. Specifically, the independent verifier (`M6`) must not share common runtime code with the generation engine (`M2`/`M3`) to prevent common-mode errors.
