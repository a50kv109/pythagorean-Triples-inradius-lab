# System Architecture

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Baseline (M1 Exact Core + M2 Number Theory Engine + M3 Classification Engine + M4 Structural Facets + Geometry Lab)

## 1. Architectural Overview

The application is structured as a modular client-side Single Page Application (SPA) built with React 19, TypeScript, Vite, and Tailwind CSS. Its computational core (`src/core/`) provides an exact, deterministic discrete number-theory and structural-analysis pipeline (`M1 -> M2 -> M3 -> M4`), separated from the continuous Euclidean Four-Circles Geometry Laboratory (`src/math/`, `src/components/`).

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    M1 — Exact Computation Core                          │
│     src/core/exact/: BigInt math, gcdBigInt, isqrtBigInt, ExactRational │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    M2 — Number Theory Engine                            │
│  src/core/factorization/: primeFactorization, primality, divisors, 2r^2 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    M3 — Classification Engine                           │
│  src/core/classification/: reconstructTriple, Euclid recovery, C_k(r)   │
│  Output: RadiusClassificationResult (allTriples, subclasses, counters)  │
└───────────────┬───────────────────────────────────┬─────────────────────┘
                │                                   │
                ▼                                   ▼
┌───────────────────────────────┐   ┌─────────────────────────────────────┐
│   M4-S1 — SpornFacet          │   │   M4-S2 — BerggrenFacet             │
│   spornFacet.ts               │   │   berggrenFacet.ts                  │
│   spornX/Y, 4 zones, normS/P  │   │   A1/A2/A3, stepParent, canon/raw   │
└───────────────┬───────────────┘   └───────────────┬─────────────────────┘
                │         ▲                         │
                │         │ (uses classifySpornZone)│
                └─────────┴─────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    M4-S3 — ClassProfileFacet                            │
│  classProfileFacet.ts: strict tripleId bijection, all vs primitive      │
│  metrics, pairwise ExactRational means, CPF-INV-01..12                  │
└─────────────────────────────────────────────────────────────────────────┘

Legacy / Visual Subsystem (Isolated from src/core/):
  src/math/, src/geometry/, src/canonical/ ──▶ React 19 UI (src/components/)
```

## 2. Core Computational Layers

1. **M1 — Exact Computation Core (`src/core/exact/`):**
   - Pure `BigInt` arithmetic, strict integer string parsing (`parseIntegerBigInt`), exact non-negative greatest common divisor (`gcdBigInt`), exact integer square roots via Newton's method (`isqrtBigInt`), and normalized immutable exact rational numbers (`ExactRational`).
   - Zero floating-point dependency (`Math.*`, `Number()`, `parseFloat` are strictly banned).

2. **M2 — Number Theory Engine (`src/core/factorization/`):**
   - Canonical prime factorization (`factorizeBigInt`) with trial division wheel, Pollard-Brent cycle finding, and 3-tier prime certification (`PROVEN_PRIME`, `PROBABLE_PRIME`, `UNFACTORED_COMPOSITE`).
   - Exact divisor generation, hyperbola divisor pair construction ($xy = 2r^2$), and arithmetic counters ($\omega^*(r), \tau(r), T(r), N(r)$).

3. **M3 — Classification Engine (`src/core/classification/`):**
   - Reconstructs canonical triples $0 < a < b < c$ from $(r, x, y)$, recovers primitive Euclidean parameters $(m, n, u, v)$, computes scale factor $k = \gcd(a, b, c)$, assigns canonical identifiers (`classId`, `tripleId`, `primId`), and partitions $C(r)$ into $k$-subclasses $C_k(r)$ with cardinality validation.

4. **M4 — Structural Facets (`src/core/facets/`):**
   - **Architectural Principle:** M4 consumes outputs from M1–M3 and **never duplicates** prime factorization, divisor enumeration, or triple classification.
   - **S1 (`spornFacet.ts`):** Maps every triple in $C(r)$ into Sporn coordinates ($\tilde{x} = x/r$, $\tilde{y} = y/r$), ray base $r_0 = r/k$, parity regime, exact 4-zone partition (`Z0_ROOT`, `Z1_A1`, `Z3_A3`, `Z2_A2`), and exact rational triangle shape parameters (`normP = P/r = 2 * normS`).
   - **S2 (`berggrenFacet.ts`):** Uses `classifySpornZone` from S1 for deterministic `O(1)` parent step recovery (`stepParent`), implements forward row-vector transitions `stepA1`/`stepA2`/`stepA3`, bidirectional word conversion (`canonWordToRawWord` / `rawWordToCanonWord`), and primitive-ancestor inheritance for scaled triples ($k > 1$).
   - **S3 (`classProfileFacet.ts`):** Joins `RadiusClassificationResult` (M3), `SpornFacetResult[]` (S1), and `BerggrenFacetResult[]` (S2) via a verified 1-to-1 bijection on `tripleId`, keeping `allTriples` ($N(r)$) and `primitiveTriples` ($T(r)$) strictly separated and computing exact rational means via balanced pairwise summation.

5. **Legacy / Runtime Geometry Laboratory (`src/math/`, `src/canonical/`, `src/geometry/`):**
   - Continuous Euclidean models for the four circles, incenter partition, Thales circumcircle ($K_o$), and spectral analysis curves (`CANONICAL_OPPOSITE_SIDE_V1`).

## 3. Determinism and Data Flow
All computational pipelines in M1–M4 are fully deterministic and side-effect free: identical `BigInt` inputs yield identical frozen canonical outputs. Floating-point calculations remain strictly isolated to the legacy continuous geometry lab and future `M7` visual adapters.
