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

### 3.3 Legacy Geometry Subsystem (`src/math/`, `src/components/`, `src/canonical/`)
- The original **Four Circles Laboratory** (exterior squares $Q_a, Q_b, Q_c$, incircle $K_i$, Thales circumcircle $K_o$, incenter partition, and spectral analysis) is preserved intact as a legacy and visual reference subsystem within the repository.

---

## 4. Development Roadmap & Implementation Status

| Milestone | Status | Description |
| :--- | :--- | :--- |
| **Phase 1 — Workspace & Shell** | Completed | React UI, navigation, panels, localization. |
| **M1 — Exact Computation Core** | Completed & Audited | Autonomous BigInt arithmetic and rational numbers. |
| **M2 — Number Theory Engine** | Completed & Stabilized | Factorization, primality certification, divisors, hyperbola pairs, and counters. |
| **M3 — Classification Engine** | Planned | Triangle class $C(r)$ and sub-class $C_k(r)$ builder. |
| **M4 — Facets & Structural Analysis** | Planned | Sporn coordinates, Berggren trees, multi-attribute matrices. |
| **M5 — Class Passports & Matrices** | Planned | Class passports and structural catalogs. |
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
npm test          # Runs automated test suite (geometry, incenter partition, M1 exact core, M2 number theory engine)
```

---

## 6. Verification Policy
- **Exact-First:** All number-theoretic calculations use `BigInt`.
- **Primality Safety:** Proven primality is never conflated with probable primality.
- **Incomplete Handling:** Timed-out or incomplete factorizations are reported explicitly as `INCOMPLETE` (`UNFACTORED_COMPOSITE`).
- **Golden Benchmarks:** Tested against reference catalog totals ($r=1..30$: $T=61, N=174$; $r=1..100$: $T=249, N=855$).

---

## 7. License
**License Status: PENDING DECISION**  
*Explicit author approval required for open-source license selection (e.g., MIT).*
