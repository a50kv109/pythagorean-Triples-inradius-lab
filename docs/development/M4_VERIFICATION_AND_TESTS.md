# M4 Verification and Testing Documentation

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Structural Facets (`S1`, `S2`, `S3`)  
**Verification Date:** `2026-11-28`

---

## 1. Analytical Proofs vs. Finite Computational Verification

To maintain strict mathematical rigor, verified properties are separated into two categories:

1. **Analytical Mathematical Proofs (Universal for all $r \ge 1$):**
   - Canonical bijection between $C(r)$ and hyperbola pairs $xy = 2r^2$ ($1 \le x < \sqrt{2}r < y \le 2r^2$), Robbins ($T(r) = 2^{\omega^*(r)}$), and Omland ($N(r) = \tau(2r^2)/2$).
   - Exact partition of $(0, \sqrt{2}) \setminus \{1\}$ by $f_1, f_2, f_3$ matching the four Sporn zones (`Z0_ROOT`, `Z1_A1`, `Z3_A3`, `Z2_A2`), strict radius increase $r' \ge r + 1$, uniqueness of `stepParent`, and $0 \le d \le r_0 - 1$ depth bound (attained at $x_0 = 1$).
   - Strict monotonicity of $c/r = 2 + \tilde{x} + 2/\tilde{x}$ on $(0, \sqrt{2})$, giving $c_{\max}(r) = 2r^2 + 2r + 1$ and $c_{\min} < 5r \iff Z_2(\text{allTriples}) > 0$.

2. **Finite Computational Verification (Executed Test Suites):**
   - Exhaustive finite-range sweeps (`r = 1..30`, `r = 1..50`, `r = 1..120`), golden vectors, invariant mutation tests, and negative error-path tests confirm implementation fidelity on tested ranges without replacing universal proofs where finite enumeration applies.

---

## 2. M4 Test Suites & Coverage

### 2.1 `src/tests/core/spornFacetM4S1.test.ts` (M4-S1)
- **Section 1 (Isolation):** Verifies zero `Math.*`, `Number()`, `parseFloat`/`parseInt`, React/UI imports across `src/core/facets/`.
- **Section 2 (Golden Tests G1–G6):** Verifies `(3,4,5)`, `(5,12,13)`, `(6,8,10)`, `(8,15,17)`, `(20,21,29)`, `(39,80,89)`, including `normS` and `normP = 2 * normS`.
- **Section 3 (Negative & Ancestor Invariance G7–G9):** Rejects incomplete M3 results, non-canonical `(4,3,5)`, broken hyperbola identity, weak `SF-INV-02` bypass ($\tilde{x} = 3/2$), and checks scale invariance between scaled triples and their primitive ancestors.
- **Section 4 ($r = 1\dots 30$ Sweep):** All **174** triples pass `SF-INV-01..06` with exact zone counts `Z0_ROOT=30, Z1_A1=116, Z2_A2=9, Z3_A3=19`.

### 2.2 `src/tests/core/berggrenFacetM4S2.test.ts` (M4-S2)
- **Section 0 (Isolation):** Verifies pure `BigInt`/`ExactRational` policy.
- **Section 1 (Root):** `(3,4,5)` (`isRoot = true`, `treeDepth = 0n`, `canonWord = []`, `rawWord = []`) and its 3 direct children + `Object.isFrozen`.
- **Sections 2–3 (Transitions & $f_1/f_2/f_3$):** The verification suite covers **12 explicit parent-to-child transitions**: **9 transitions from level-1 nodes to level-2 nodes** (3 children each from `A1(root) = (5,12,13)`, `A2(root) = (20,21,29)` $\to$ `(36,77,85)`, `(119,120,169)`, `(39,80,89)`, and `A3(root) = (8,15,17)`), plus **3 additional transitions from the level-2 node `(7,24,25) = A1(A1(root))` to level-3 nodes**. The suite therefore covers 9 second-level transitions and 3 third-level transitions, not 12 second-level transitions, along with exact rational fractional-linear ratios `f1, f2, f3` at both $t = 2/3$ and $t = 8/6 = 4/3$ ($4/7$, $7/5$, $3/5$).
- **Sections 4–5 (Descent & Addressing):** Root null / `RootHasNoParentError`, `(33,56,65)` parity conjugation (`canonWord=['A3','A3']` ↔ `rawWord=['A3','A1']`), and mixed-parity round-trips.
- **Sections 6–7 (Scaled Inheritance & Depths):** `(6,8,10)` and `(16,30,34)` (`appliesToPrimitiveAncestor = true`), reference primitive depths (`r=1:[0,0]`, `r=2:[1,1]`, `r=3:[1,2]`), and $x_0 = 1$ boundary (`treeDepth === r0 - 1n` for `r0 = 1..15`).
- **Section 8 (Negative Tests):** Rejects non-primitive `(6,8,10)` in `stepA1`, non-canonical `(4,3,5)` in `stepA2`, invalid `(3,4,6)` in `stepA3`, incomplete M3 inputs, and malformed M3 triples.
- **Section 9 ($r = 1\dots 30$ Sweep):** All **174** triples (**61** primitive) pass `BF-INV-01..06`.
- **Section 10 ($r = 1\dots 50$ Exhaustive Tree Uniqueness):** **110** unique primitive triples, zero duplicate `primId`/`canonWord`/`rawWord`, exact reconstruction via both `applyCanonWord` and `applyRawWord`.

### 2.3 `src/tests/core/classProfileFacetM4S3.test.ts` (M4-S3)
- **Section 0 (Isolation):** Verifies pure `BigInt`/`ExactRational` policy.
- **Section 1 (Golden Tests `r = 1, 2, 3, 15, 35, 105`):** Exact `ExactRational` verification of `cMin`, `cMax`, `cMinRatio`, `hasSub5rCompression`, `spornXMin/Max`, `meanSpornX`, `meanADivC` (including 53-digit denominator at $r = 105$), `zonesAll`, `zonesPrim`, primitive Berggren depth bounds (`[0,0], [1,1], [1,2], [2,14], [2,34], [5,104]`), and deep `Object.isFrozen`.
- **Section 2 (`CPF-INV-01..12`):** 14 mutation checks verifying every invariant triggers `ClassProfileFacetError('INVARIANT_VIOLATION')`.
- **Section 3 (Negative Guards `P-NEG-1..4`+):** Incomplete M3 / bad `status` (`INCOMPLETE_CLASSIFICATION_RESULT`), facet count mismatch (`FACET_COUNT_MISMATCH`), duplicate `tripleId` (`DUPLICATE_TRIPLE_ID`), substituted `tripleId` (`TRIPLE_ID_MISMATCH`), cross-class/radius contamination (`CLASS_ID_MISMATCH`), `r <= 0n` (`INVALID_RADIUS`), and empty primitive set (`PRIMITIVE_SET_EMPTY`).
- **Section 4 (Large Class $N(r) > 50$):** `r = 420` ($N = 81 > 50, T = 8$), verifying balanced pairwise `ExactRational` means match sequential exact summation identically.
- **Section 5 ($r = 1\dots 120$ Sweep):** **120** classes, **1098** triples, **311** primitive triples, `0` violations of `CPF-INV-01..12`, exact $\omega^*(r)$ class counts `(7, 76, 36, 1)` and sub-$5r$ compression counts `(0, 19, 21, 1)`.

---

## 3. Executed Command Results (`2026-11-28`)

| Check | Command | Result |
| :--- | :--- | :--- |
| Full Automated Test Suite | `npm test` (8 suites: Geometry, Incenter Partition, M1, M2, M3, M4-S1, M4-S2, M4-S3) | **PASS** (exit code `0`) |
| TypeScript Type Check | `npx tsc --noEmit` / `npm run lint` | **PASS** (0 errors) |
| Production Build | `npm run build` (`vite build`) | **PASS** (1724 modules, clean `dist/`) |
| Static `float64` Scan | `grep -rnE "Number\(|Math\.|parseFloat|parseInt|Float64|toFixed" src/core/facets` | **PASS** (0 matches) |
