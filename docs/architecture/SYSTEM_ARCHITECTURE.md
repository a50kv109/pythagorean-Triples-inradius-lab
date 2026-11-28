# System Architecture

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Frozen Baseline + `M5-S1` & `M5-S2` (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`)

## 1. Architectural Overview

The application is structured as a modular client-side Single Page Application (SPA) built with React 19, TypeScript, Vite, and Tailwind CSS. Its computational core (`src/core/`) provides an exact, deterministic discrete number-theory, classification, structural-facet, passport, and matrix pipeline (`M1 -> M2 -> M3 -> M4 -> M5-S1/M5-S2`), separated from the continuous Euclidean Four-Circles Geometry Laboratory (`src/math/`, `src/components/`).

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
└───────────────┬───────────────────────────────────┬─────────────────────┘
                │                                   │
                │                                   ▼
                │   ┌─────────────────────────────────────────────────────┐
                │   │           M3 — Classification Engine                │
                │   │  src/core/classification/: reconstruct, Euclid, C_k │
                │   └───────────┬───────────────────────────┬─────────────┘
                │               │                           │
                │               ▼                           ▼
                │   ┌───────────────────────┐   ┌─────────────────────────┐
                │   │ M4-S1 — SpornFacet    │   │ M4-S2 — BerggrenFacet   │
                │   │ spornX/Y, zones, norm │   │ A1/A2/A3, stepParent    │
                │   └───────────┬───────────┘   └───────────┬─────────────┘
                │               │   ▲ (classifySpornZone)   │
                │               └───┴───────────┬───────────┘
                │                               ▼
                │   ┌─────────────────────────────────────────────────────┐
                │   │         M4-S3 — ClassProfileFacet                   │
                │   │  tripleId bijection, all vs prim metrics, CPF-INV   │
                │   └───────────────────────────┬─────────────────────────┘
                │                               │
                ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│     M5-S1 & M5-S2 — ClassPassport, EuclidAdapter & ClassMatrix          │
│     (IMPLEMENTED — PENDING INDEPENDENT AUDIT)                           │
│  src/core/passports/: classPassport.ts, euclidAdapter.ts, classMatrix.ts│
│  M5-S1: CP-INV-01..08; {x0,y0}={v²,2u²}                                 │
│  M5-S2: Eager CORE/INDEX + Lazy ARITH,EUCLID,GEOM,SPORN,BERGGREN        │
│         CM-INV-01..08; Q1=CLOSED; Full===Lazy parity                    │
│  (M5-S3 RangeCatalog & TransversalFacet: Deferred; no Price tree)       │
└─────────────────────────────────────────────────────────────────────────┘

Legacy / Visual Subsystem (Isolated from src/core/):
  src/math/, src/geometry/, src/canonical/ ──▶ React 19 UI (src/components/)
```

## 2. Core Computational Layers

1. **M1 — Exact Computation Core (`src/core/exact/` — Frozen):**
   - Pure `BigInt` arithmetic, strict integer string parsing (`parseIntegerBigInt`), exact non-negative greatest common divisor (`gcdBigInt`), exact integer square roots via Newton's method (`isqrtBigInt`), and normalized immutable exact rational numbers (`ExactRational`).
   - Zero floating-point dependency (`Math.*`, `Number()`, `parseFloat` are strictly banned).

2. **M2 — Number Theory Engine (`src/core/factorization/` — Frozen):**
   - Canonical prime factorization (`factorizeBigInt`) with trial division wheel, Pollard-Brent cycle finding, and 3-tier prime certification (`PROVEN_PRIME`, `PROBABLE_PRIME`, `UNFACTORED_COMPOSITE`).
   - Exact divisor generation, hyperbola divisor pair construction ($xy = 2r^2$), and arithmetic counters ($\omega^*(r), \tau(r), T(r), N(r)$).

3. **M3 — Classification Engine (`src/core/classification/` — Frozen):**
   - Reconstructs canonical triples $0 < a < b < c$ from $(r, x, y)$, recovers primitive Euclidean parameters $(m, n, u, v)$, computes scale factor $k = \gcd(a, b, c)$, assigns canonical identifiers (`classId`, `tripleId`, `primId`), and partitions $C(r)$ into $k$-subclasses $C_k(r)$ with cardinality validation.

4. **M4 — Structural Facets (`src/core/facets/` — Frozen):**
   - **Architectural Principle:** M4 consumes outputs from M1–M3 and **never duplicates** prime factorization, divisor enumeration, or triple classification.
   - **S1 (`spornFacet.ts`):** Maps every triple in $C(r)$ into Sporn coordinates ($\tilde{x} = x/r$, $\tilde{y} = y/r$), ray base $r_0 = r/k$, parity regime, exact 4-zone partition (`Z0_ROOT`, `Z1_A1`, `Z3_A3`, `Z2_A2`), and exact rational triangle shape parameters (`normP = P/r = 2 * normS`).
   - **S2 (`berggrenFacet.ts`):** Uses `classifySpornZone` from S1 for deterministic `O(1)` parent step recovery (`stepParent`), implements forward row-vector transitions `stepA1`/`stepA2`/`stepA3`, bidirectional word conversion (`canonWordToRawWord` / `rawWordToCanonWord`), and primitive-ancestor inheritance for scaled triples ($k > 1$).
   - **S3 (`classProfileFacet.ts`):** Joins `RadiusClassificationResult` (M3), `SpornFacetResult[]` (S1), and `BerggrenFacetResult[]` (S2) via a verified 1-to-1 bijection on `tripleId`, keeping `allTriples` ($N(r)$) and `primitiveTriples` ($T(r)$) strictly separated and computing exact rational means via balanced pairwise summation.

5. **M5-S1 & M5-S2 — ClassPassport, EuclidAdapter & ClassMatrix (`src/core/passports/` — `IMPLEMENTED — PENDING INDEPENDENT AUDIT`):**
   - **Zero-Duplication Aggregation (`M5-S1`):** `ClassPassport` (`buildClassPassport`, `verifyClassPassportInvariants`) consumes already-computed M2 (`RadiusNumberTheoryResult`), M3 (`RadiusClassificationResult`), and M4-S3 (`ClassProfileFacetResult`) outputs without recomputing factorization, classification, or class profile metrics.
   - **`EuclidAdapter` (`resolveEuclideanParameters`):** Reads precomputed `triple.euclideanParams` (falling back to M3 `recoverEuclideanParameters` only when omitted) and verifies exact primitive shift correspondence $\{x_0, y_0\} = \{v^2, 2u^2\}$ together with $n = u$, $m = u + v$, $uv = r_0$, $\gcd(m, n) = 1$, and $2 \nmid (m + n)$.
   - **Completeness vs. Certification & Ordering (`M5-S1`):** Enforces `CP-INV-01..08` (including `CP-INV-07` strict `expectedMatrixSummary.isSortedByX === false` check), strict ascending `x` sorting of `classification.allTriples` on `COMPLETE` passports, separates computational completeness (`status`, `isComplete`) from M2 mathematical certification (`certificationStatus`), and preserves partial M2 data on `INCOMPLETE` (`profile = null`, `subclassSpectrum = []`, `expectedMatrixSummary.rowCount = null`).
   - **Tabular Materialization (`M5-S2` — `classMatrix.ts`):** Builds `FullClassMatrixResult` (`buildFullClassMatrix`) and cache-backed `LazyClassMatrix` (`createLazyClassMatrix`) with an eager `CORE`/`INDEX` backbone (deterministic shallow-copy `x` sort without mutating `classification.allTriples`, `rowIdx = 0n..N-1n`) and five cached lazy groups (`ARITH`, `EUCLID`, `GEOM`, `SPORN`, `BERGGREN`), `Q1 = CLOSED` (inherits `asymQ` from `M4-S1`), `CM-INV-01..08`, strict `Full === Lazy` parity (`verifyFullLazyMatrixParity`), and joint `verifyPassportMatrixAlignment`. Rejects incomplete M3 inputs via `IncompleteClassificationError`.
   - **Deferred / Excluded Scope:** `M5-S3 RangeCatalog` and `TRANSVERSAL` (`commonLegPrimA`, `commonHypPrimC`) are deferred; `Price tree` is not part of the architecture.

6. **Legacy / Runtime Geometry Laboratory (`src/math/`, `src/canonical/`, `src/geometry/`):**
   - Continuous Euclidean models for the four circles, incenter partition, Thales circumcircle ($K_o$), and spectral analysis curves (`CANONICAL_OPPOSITE_SIDE_V1`).

## 3. Determinism and Data Flow
All computational pipelines in M1–M4 and M5-S1/M5-S2 are fully deterministic and side-effect free: identical `BigInt` inputs yield identical frozen canonical outputs. Floating-point calculations remain strictly isolated to the legacy continuous geometry lab and future `M7` visual adapters.
