# Pythagorean Triples Inradius Classification Laboratory

**Repository:** `a50kv109/pythagorean-Triples-inradius-lab` · **Version:** `1.2.0` · **License:** *Pending Decision (Author Approval Required)*

*An exact mathematical research laboratory for the computation, classification, and structural analysis of integer Pythagorean triples grouped by the inradius of their incircle.*

---

## 1. Overview & Research Problem

The **Pythagorean Triples Inradius Classification Laboratory** (`pythagorean-Triples-inradius-lab`) is a rigorous TypeScript and React research environment designed to explore the number-theoretic and geometric structure of Pythagorean triples ($a^2 + b^2 = c^2, a, b, c \in \mathbb{N}, 0 < a < b < c$) classified by their incircle inradius $r$:

$$r = \frac{a + b - c}{2}$$

Rather than treating Pythagorean triples as isolated numerical curiosities, this laboratory implements an exact hierarchical classification architecture based on the inradius $r$, connecting prime factorization, divisor theory, hyperbola parameterization, and geometric properties.

---

## 2. Core Mathematical Foundation

### 2.1 The Hyperbolic Factorization Identity
Every integer right-angled triangle with inradius $r$ satisfies the fundamental hyperbolic relation (Clarke, 2005; Omland, 2017; Sporn, 2021):

$$(a - 2r)(b - 2r) = 2r^2 \quad \Longleftrightarrow \quad x \cdot y = 2r^2$$

where shift variables are defined as:
$$x = a - 2r = c - b, \qquad y = b - 2r = c - a$$

The complete canonical class of triples for a given $r$, denoted $C(r)$, is in exact bijection with the set of divisor pairs $(x, y)$ of $2r^2$ satisfying canonical bounds:
$$1 \le x < \sqrt{2}\,r < y \le 2r^2$$

Triples are reconstructed deterministically via:
$$a = 2r + x, \qquad b = 2r + y, \qquad c = 2r + x + y$$

### 2.2 Arithmetic Counters (Robbins, 2006; Omland, 2017)
Given the canonical prime factorization of inradius $r = 2^{e_0} \prod_{i=1}^{s} p_i^{e_i}$:
- **Primitive Triples Count ($T(r)$):** $T(r) = 2^{\omega^*(r)} = 2^s$, where $\omega^*(r)$ is the number of distinct odd prime factors of $r$.
- **Total Triples Count ($N(r)$):** $N(r) = \frac{\tau(2r^2)}{2} = (e_0 + 1)\prod_{i=1}^{s}(2e_i + 1) = \sum_{k \mid r} T\!\left(\frac{r}{k}\right)$.

---

## 3. Architecture & Implemented Modules

### 3.1 M1 — Exact Computation Core (`src/core/exact/`)
- Pure native `BigInt` arithmetic, strict decimal integer string parsing (`parseIntegerBigInt`), exact non-negative greatest common divisor (`gcdBigInt`), exact integer square roots via Newton's method (`isqrtBigInt`), and normalized immutable exact rational numbers (`ExactRational`).
- Strictly bans floating-point approximations (`Math.*`, `Number()`, `parseFloat`).

### 3.2 M2 — Number Theory Engine (`src/core/factorization/`)
- Canonical prime factorization (`factorizeBigInt`) with wheel trial division, deterministic Pollard-Brent cycle finding, and 3-tier primality certification (`PROVEN_PRIME`, `PROBABLE_PRIME`, `UNFACTORED_COMPOSITE`) anchored on the Sorenson & Webster (2015) 13-base deterministic Miller-Rabin bound ($\approx 3.317 \times 10^{24}$).
- Complete divisor generation, hyperbola divisor pair builder ($xy = 2r^2$), and arithmetic counters ($\omega^*(r), \tau(r), T(r), N(r)$).

### 3.3 M3 — Classification Engine (`src/core/classification/`)
- Deterministic reconstruction of canonical Pythagorean triples $a < b < c$ from $(r, x, y)$, recovery of primitive Euclidean parameters $(m, n, u, v)$, scale factor extraction $k = \gcd(a, b, c)$, and exact partitioning into $k$-subclasses $C(r) = \bigsqcup_{k \mid r} C_k(r)$ with canonical IDs (`CL-R{r}-D{2r}`, `PT-R{r}-K{k}-X{x}`, `PT-R{r/k}-K1-X{x/k}`).

### 3.4 M4 — Structural Facets (`src/core/facets/`)
Constructed directly over M1–M3 outputs without duplicating factorization, divisor generation, or triple classification:
- **M4-S1 (`spornFacet.ts` — `SpornFacet`):** Scale-invariant Sporn similarity coordinates ($\tilde{x} = x/r$, $\tilde{y} = y/r$), fundamental ray radius $r_0 = r/k$, parity regime (`X0_ODD` / `X0_EVEN`), strict integer 4-zone classifier (`Z0_ROOT`, `Z1_A1`, `Z3_A3`, `Z2_A2`), and exact rational triangle geometry (`tanHalfA`, `tanHalfB`, `sinA`, `cosA`, `tanA`, `formT`, `asymQ`, `normS`, `normP = P/r = 2 * normS`), verified by `SF-INV-01..06`.
- **M4-S2 (`berggrenFacet.ts` — `BerggrenFacet`):** Ternary Berggren tree operators (`stepA1`, `stepA2`, `stepA3`), unique zone-based parent descent (`stepParent`, `requireBerggrenParent`), bidirectional canonical/raw word addressing (`canonWordToRawWord`, `rawWordToCanonWord`, `applyCanonWord`, `applyRawWord`), primitive-ancestor inheritance for scaled triples (`appliesToPrimitiveAncestor = (k > 1n)`), and invariants `BF-INV-01..06`.
- **M4-S3 (`classProfileFacet.ts` — `ClassProfileFacet`):** Per-class exact statistical aggregation (`buildClassProfileFacet`, `verifyClassProfileInvariants`) joining M3, S1, and S2 via strict 1-to-1 `tripleId` bijection, separating `allTriples` ($N(r)$) and `primitiveTriples` ($T(r)$), computing balanced pairwise `ExactRational` means, zone histograms, hypotenuse compression ($c_{\min} < 5r$), primitive-only Berggren depths, and invariants `CPF-INV-01..12`.

### 3.5 M5-S1 & M5-S2 — `ClassPassport`, `EuclidAdapter` & `ClassMatrix` (`src/core/passports/` — `IMPLEMENTED — PENDING INDEPENDENT AUDIT`)
Assembles deterministic class passports (`CL-R{r}-D{2r}`) and multi-attribute triple matrices (`PT-R{r}-K{k}-X{x}`) over ready M1–M4 outputs without recomputing factorization, classification, facets, or class profile metrics (`Q1 = CLOSED`: inherits `asymQ = (b - a)/(a + b)` from frozen `M4-S1`):
- **`EuclidAdapter` (`euclidAdapter.ts`):** `resolveEuclideanParameters` reads M3 `triple.euclideanParams` (falling back to M3 `recoverEuclideanParameters` when omitted) and enforces exact primitive shift correspondence $\{x_0, y_0\} = \{v^2, 2u^2\}$.
- **`ClassPassport` (`classPassport.ts`):** `buildClassPassport` and `verifyClassPassportInvariants` enforce `CP-INV-01..08` (including `CP-INV-07` strict `isSortedByX === false` check on `INCOMPLETE`), strict ascending `x` ordering of `classification.allTriples` for `COMPLETE` passports, explicit separation of computational completeness (`status`, `isComplete`) from M2 mathematical certification (`certificationStatus`), and preservation of partial M2 data on `INCOMPLETE` (`profile = null`, `subclassSpectrum = []`, `expectedMatrixSummary.rowCount = null`).
- **`ClassMatrix` (`classMatrix.ts`):** `buildFullClassMatrix` and `createLazyClassMatrix` construct an immutable `CORE`/`INDEX` backbone (validating uniqueness and sorting a shallow copy by ascending `x` without mutating `classification.allTriples`, `rowIdx = 0n..N-1n`) with five cached lazy column groups (`ARITH`, `EUCLID`, `GEOM` with $p = 3r + x + y = c + r$, `SPORN`, `BERGGREN`), `CM-INV-01..08`, strict `Full === Lazy` parity (`verifyFullLazyMatrixParity`), and joint `verifyPassportMatrixAlignment`. Rejects incomplete M3 inputs with `IncompleteClassificationError`.
- **Remaining M5 & Excluded Scope:** `M5-S3 RangeCatalog` and `TRANSVERSAL` (`commonLegPrimA`, `commonHypPrimC`) are **Deferred**; `Price tree` is not part of the architecture.

### 3.6 Legacy Geometry Subsystem (`src/math/`, `src/components/`, `src/canonical/`)
- The original **Four Circles Laboratory** (exterior squares $Q_a, Q_b, Q_c$, incircle $K_i$, Thales circumcircle $K_o$, incenter partition, and spectral analysis) is preserved intact as a legacy and visual reference subsystem within the repository.

---

## 4. Development Roadmap & Implementation Status

| Milestone | Status | Description |
| :--- | :--- | :--- |
| **Phase 1 — Workspace & Shell** | Completed | React UI, navigation, panels, localization. |
| **M1 — Exact Computation Core** | Completed & Audited (Frozen) | Autonomous `BigInt` arithmetic and `ExactRational` numbers. |
| **M2 — Number Theory Engine** | Completed & Stabilized (Frozen) | Factorization, primality certification, divisors, hyperbola pairs, and counters. |
| **M3 — Classification Engine** | Completed & Verified (Frozen) | Triangle class $C(r)$ and sub-class $C_k(r)$ builder. |
| **M4 — Structural Facets** | **COMPLETED (Frozen)** | `M4-S1 SpornFacet` (Accepted), `M4-S2 BerggrenFacet` (Accepted), `M4-S3 ClassProfileFacet` (Accepted). |
| **M5-S1 — ClassPassport & EuclidAdapter** | **IMPLEMENTED — PENDING INDEPENDENT AUDIT** | `src/core/passports/` (`types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts`), `CP-INV-01..08`, `classPassportM5S1.test.ts`. |
| **M5-S2 — ClassMatrix (`Full` & `Lazy`)** | **IMPLEMENTED — PENDING INDEPENDENT AUDIT** | `src/core/passports/classMatrix.ts`, 5 lazy groups (`ARITH`, `EUCLID`, `GEOM`, `SPORN`, `BERGGREN`), `CM-INV-01..08`, `classMatrixM5S2.test.ts`. |
| **M5-S3 — RangeCatalog / TransversalFacet** | Deferred | Range catalog (`M5-S3`) and optional `TransversalFacet`. *(Note: `Price tree` is excluded from architecture.)* |
| **M6 — Independent Verifier** | Planned | Automated verifier checking `CHK-01..12`. |
| **M7 — Geometric Projection** | Planned | SVG projection and visual adapter. |
| **M8 — Export & Analytics** | Planned | JSON/CSV export and workspace reporting. |

---

## 5. Installation, Execution & Testing

**Prerequisites:** Node.js (v18+) and `npm`.

```bash
npm install
npm run dev       # Starts Vite dev server at http://localhost:3000
npm run lint      # Runs TypeScript type-checking (tsc --noEmit)
npm run build     # Builds production bundle into dist/
npm test          # Runs all 10 automated suites (Geometry, Incenter Partition, M1, M2, M3, M4-S1, M4-S2, M4-S3, M5-S1, M5-S2)
```

---

## 6. Verification Policy & Documentation
- **Exact-First:** All discrete core routines (`src/core/*`) use pure `BigInt` and `ExactRational`; floating-point math (`Math.*`, `Number()`, `parseFloat`) is forbidden.
- **Primality & Completeness Safety:** Probable primality is never conflated with proven primality; incomplete classifications (`isComplete === false`) are rejected across M4 and `M5-S2` `ClassMatrix` (`INCOMPLETE_CLASSIFICATION_RESULT`) and handled explicitly in `M5-S1` (`status: 'INCOMPLETE'` with partial M2 data preserved and `profile = null`).
- **Golden Benchmarks & Implementation Checks:** M1–M4 benchmarks are verified across $r = 1\dots 30$ ($T=61, N=174$), $r = 1\dots 50$ ($110$ unique primitive tree paths, $339$ total rows), $r = 1\dots 100$ ($T=249, N=855$), and $r = 1\dots 120$ ($120$ classes, $N=1098, T=311$). In the Gemini implementation environment, `M5-S1` and `M5-S2` tests, all 10 `npm test` suites, `tsc --noEmit`, `npm run build`, and `src/core/passports/` static scan (`SCAN_CLEAN`) passed and **await independent audit**.
- **Technical Reference Docs:**
  - Architecture & Boundaries: [`docs/architecture/SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md), [`docs/architecture/MODULE_BOUNDARIES.md`](docs/architecture/MODULE_BOUNDARIES.md)
  - M4 Mathematical Spec & API: [`docs/mathematics/M4_MATHEMATICAL_SPECIFICATION.md`](docs/mathematics/M4_MATHEMATICAL_SPECIFICATION.md), [`docs/architecture/M4_API_REFERENCE.md`](docs/architecture/M4_API_REFERENCE.md)
  - M5-S1 / M5-S2 API & Blueprint: [`docs/architecture/M5_API_REFERENCE.md`](docs/architecture/M5_API_REFERENCE.md), [`M5_IMPLEMENTATION_BLUEPRINT.md`](M5_IMPLEMENTATION_BLUEPRINT.md)
  - Verification & Status: [`docs/development/IMPLEMENTATION_STATUS.md`](docs/development/IMPLEMENTATION_STATUS.md), [`docs/development/M4_VERIFICATION_AND_TESTS.md`](docs/development/M4_VERIFICATION_AND_TESTS.md), [`M4_STRUCTURAL_FACETS_FINAL.md`](M4_STRUCTURAL_FACETS_FINAL.md)

---

## 7. License
**License Status: PENDING DECISION**  
*Explicit author approval required for open-source license selection (e.g., MIT).*
