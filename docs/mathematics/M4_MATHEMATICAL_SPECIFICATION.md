# M4 Mathematical Specification — Structural Facets (S1–S3)

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Structural Facets (`M4-S1 SpornFacet`, `M4-S2 BerggrenFacet`, `M4-S3 ClassProfileFacet`)  
**Status:** Accepted & Frozen (`2026-11-28`)

All computations in M4 operate strictly in `BigInt` and M1 `ExactRational` without floating-point approximations (`float64`, `Number()`, `Math.*`).

---

## 1. Base Hyperbolic Model (M1–M3 Foundation)

For a canonical Pythagorean triple $(a, b, c) \in \mathbb{N}^3$ with $a^2 + b^2 = c^2$ and $0 < a < b < c$:

$$r = \frac{a + b - c}{2} \in \mathbb{N}, \qquad D = 2r = a + b - c.$$

Using shift coordinates:

$$x = a - 2r = c - b, \qquad y = b - 2r = c - a,$$

every triple in the class $C(r)$ satisfies the hyperbolic divisor identity:

$$(a - 2r)(b - 2r) = 2r^2 \quad \Longleftrightarrow \quad x \cdot y = 2r^2, \qquad 1 \le x < \sqrt{2}\,r < y \le 2r^2,$$

with scale factor $k = \gcd(a, b, c) = \gcd(x, y)$, primitive ancestor radius $r_0 = r / k$, and canonical IDs `CL-R{r}-D{2r}`, `PT-R{r}-K{k}-X{x}`, and `PT-R{r/k}-K1-X{x/k}`.

---

## 2. M4-S1: `SpornFacet` (`src/core/facets/spornFacet.ts`)

### 2.1 Normalized Coordinates, Fundamental Ray, and Parity
For any triple in $C(r)$ (primitive $k = 1$ or scaled $k > 1$):

$$\tilde{x} = \frac{x}{r} \in \mathbb{Q} \cap (0, \sqrt{2}), \qquad \tilde{y} = \frac{y}{r} = \frac{2}{\tilde{x}} \in \mathbb{Q} \cap (\sqrt{2}, +\infty), \qquad \tilde{x}\tilde{y} = 2.$$

- **Fundamental ray radius:** $r_0 = r / k$.
- **Parity regime:** `X0_ODD` if $x_0 = x/k$ is odd, else `X0_EVEN`.

### 2.2 Exact Four-Zone Integer Classifier (`classifySpornZone`)
Thresholds $2 - \sqrt{2}$ and $1$ partition $(0, \sqrt{2})$ into four disjoint zones using pure `BigInt` comparisons (eliminating any $\sqrt{2}$ float approximation):

| Zone | Condition on $\tilde{x} = x/r$ | Exact `BigInt` Condition | Structural Meaning |
| :--- | :--- | :--- | :--- |
| `Z0_ROOT` | $\tilde{x} = 1$ | `x === r` | Egyptian ray $(3k, 4k, 5k)$ |
| `Z1_A1` | $0 < \tilde{x} < 2 - \sqrt{2}$ | `x < r && (2n * r - x)^2 > 2n * r^2` | Image of Berggren operator $A_1$ |
| `Z3_A3` | $2 - \sqrt{2} < \tilde{x} < 1$ | `x < r && (2n * r - x)^2 < 2n * r^2` | Image of Berggren operator $A_3$ |
| `Z2_A2` | $1 < \tilde{x} < \sqrt{2}$ | `x > r && x^2 < 2n * r^2` | Hypotenuse compression ($c < 5r$) and image of $A_2$ |

### 2.3 Exact Rational Geometry & `normP` Semantics
For acute angles $A < B$, triangle area $S = ab/2$, and **full perimeter** $P = a + b + c = 2(3r + x + y)$:

$$\tan\frac{A}{2} = \frac{r}{r + y}, \qquad \tan\frac{B}{2} = \frac{r}{r + x}, \qquad \sin A = \frac{a}{c}, \qquad \cos A = \frac{b}{c}, \qquad \tan A = \frac{a}{b},$$

$$\text{formT} = \frac{b}{a}, \qquad \text{asymQ} = \frac{b - a}{a + b}, \qquad \text{normS} = \frac{S}{r^2} = 3 + \tilde{x} + \tilde{y}, \qquad \text{normP} = \frac{P}{r} = 6 + 2\tilde{x} + 2\tilde{y} = 2 \cdot \text{normS}.$$

*(Contract fix: `normP` strictly denotes the normalized **full perimeter** $P/r = 2 \cdot \text{normS}$, never the semiperimeter $p/r$.)*

### 2.4 SpornFacet Invariants (`SF-INV`)
- **`SF-INV-01`:** `spornX * spornY === 2`.
- **`SF-INV-02`:** `spornX.num > 0n` and `spornX.num^2 < 2n * spornX.den^2` (strict integer square guard; no `sqrt` or `float64`).
- **`SF-INV-03`:** `r === k * rayBaseR0`.
- **`SF-INV-04`:** `sinA^2 + cosA^2 === 1`.
- **`SF-INV-05`:** `tanHalfA * (spornY + 1) === 1` and `tanHalfB * (spornX + 1) === 1`.
- **`SF-INV-06`:** `normS === spornX + spornY + 3` and `normP === 2 * normS`.
- **`SF-INV-07` (verified via tests):** Scale invariance across $C_k(r)$ vs primitive ancestor `primId`.

---

## 3. M4-S2: `BerggrenFacet` (`src/core/facets/berggrenFacet.ts`)

### 3.1 Berggren Matrices (Row-Vector Convention)
From primitive canonical state $(a, b, c)$ with $a < b < c$, row multiplication $(a', b', c') = (a, b, c) A_i$:

$$A_1 = \begin{pmatrix} 1 & 2 & 2 \\ -2 & -1 & -2 \\ 2 & 2 & 3 \end{pmatrix}, \qquad A_2 = \begin{pmatrix} 1 & 2 & 2 \\ 2 & 1 & 2 \\ 2 & 2 & 3 \end{pmatrix}, \qquad A_3 = \begin{pmatrix} -1 & -2 & -2 \\ 2 & 1 & 2 \\ 2 & 2 & 3 \end{pmatrix}.$$

Canonicalization $a_{\text{can}} < b_{\text{can}}$ produces `legSwapped = false` for $A_1$, and `legSwapped = true` for $A_2, A_3$.

### 3.2 Exact Forward Transitions & Fractional-Linear Sporn Dynamics
- **$A_1$:** $r'_1 = r + x$, $x'_1 = x$, $y'_1 = 4r + 2x + y$, with $f_1(\tilde{x}) = \frac{\tilde{x}}{1 + \tilde{x}} \in (0, 2 - \sqrt{2})$ (`Z1_A1`).
- **$A_2$:** $r'_2 = 3r + x + y$, $x'_2 = 4r + 2x + y$, $y'_2 = 4r + x + 2y$, with $f_2(\tilde{x}) = \frac{2(\tilde{x} + 1)}{\tilde{x} + 2} \in (1, \sqrt{2})$ (`Z2_A2`).
- **$A_3$:** $r'_3 = r + y$, $x'_3 = y$, $y'_3 = 4r + x + 2y$, with $f_3(\tilde{x}) = \frac{2}{\tilde{x} + 2} \in (2 - \sqrt{2}, 1)$ (`Z3_A3`).

### 3.3 Unique Parent Descent (`stepParent`)
For any non-root primitive triple, `classifySpornZone(x, r)` uniquely determines the inverse step:
- **`Z1_A1` ($A_1^{-1}$):** $r = r' - x'$, $x = x'$, $y = y' - 4r' + 2x'$.
- **`Z3_A3` ($A_3^{-1}$):** $r = r' - x'$, $y = x'$, $x = y' - 4r' + 2x'$.
- **`Z2_A2` ($A_2^{-1}$):** $r = 3r' - x' - y'$, $x = 2x' + y' - 4r'$, $y = x' + 2y' - 4r'$.

For root `(3, 4, 5)` (`Z0_ROOT`), `stepParent` returns `{ parentOperator: null, parentTriple: null, parentId: null }` (`requireBerggrenParent` throws `RootHasNoParentError`).

### 3.4 Canonical vs. Raw Addressing & Scaled-Triple Inheritance
- **`canonWord`**: operator sequence from `(3, 4, 5)` with canonical $a < b$ swap at every step.
- **`rawWord`**: operator sequence applied directly without intermediate swaps; `canonWordToRawWord` and `rawWordToCanonWord` conjugate $A_1 \leftrightarrow A_3$ whenever accumulated leg-swap parity is odd (`A1` parity `0`, `A2` and `A3` parity `1`), leaving $A_2$ invariant.
- **Scaled-triple inheritance:** `computeBerggrenFacetForTriple` accepts scaled M3 triples ($k > 1$), resolves `primitiveAncestor` ($r_0 = r/k$), executes tree descent and child transitions on `primitiveAncestor`, and sets `appliesToPrimitiveAncestor = (k > 1n)`.

### 3.5 BerggrenFacet Invariants (`BF-INV-01..06`)
- **`BF-INV-01`:** Exact child radius formulas ($r+x_0$, $3r_0+x_0+y_0$, $r_0+y_0$).
- **`BF-INV-02`:** Children satisfy $x' \ge 1$, $x' < y'$, $x'y' = 2(r')^2$, Pythagorean identity, and canonical order.
- **`BF-INV-03`:** Primitive ancestor and all three children satisfy $\gcd(a, b, c) = 1$.
- **`BF-INV-04`:** Child zones (`Z1_A1`, `Z2_A2`, `Z3_A3`), `legSwapped` flags, and exact $f_1, f_2, f_3$ rational Sporn transitions match.
- **`BF-INV-05`:** All children revert via `stepParent`; root/non-root parent checks, `applyCanonWord`/`applyRawWord` reconstruction, and `rawWordToCanonWord` round-trip succeed.
- **`BF-INV-06`:** $0 \le \text{treeDepth} \le r_0 - 1$, with $\text{treeDepth} = r_0 - 1$ on the $x_0 = 1$ boundary series.

---

## 4. M4-S3: `ClassProfileFacet` (`src/core/facets/classProfileFacet.ts`)

### 4.1 Population Isolation & Exact Class Metrics
`ClassProfileFacet` aggregates M3 (`RadiusClassificationResult`), M4-S1 (`SpornFacetResult[]`), and M4-S2 (`BerggrenFacetResult[]`) via a strict 1-to-1 `tripleId` bijection, strictly isolating:
1. **`allTriples` ($N(r)$):** `cMin`, `cMax = 2r^2 + 2r + 1`, `cMinRatio = cMin / r`, `hasSub5rCompression = (cMin < 5r)`, `spornXMin = 1/r`, `spornXMax`, `meanSpornX`, `meanADivC` (from `SpornFacetResult.sinA`), and `zoneHistogram`.
2. **`primitiveTriples` ($T(r)$, strictly `isPrimitive && k === 1n`):** `meanSpornX`, `meanADivC`, `zoneHistogram`, `berggrenDepthMin`, `berggrenDepthMax`.

Scaled triples ($k > 1$) never enter primitive Berggren depth bounds. Exact rational averages use balanced pairwise divide-and-conquer summation (`ExactRational`).

### 4.2 ClassProfileFacet Invariants (`CPF-INV-01..12`)
1. **`CPF-INV-01`:** `allTriples.count === expectedN`, `primitiveTriples.count === expectedT`, `N >= T >= 1`.
2. **`CPF-INV-02`:** `0 < cMin <= 5r` and `cMinRatio === cMin / r`.
3. **`CPF-INV-03`:** `cMax === 2r^2 + 2r + 1`, `cMin <= cMax` (equality iff `r === 1`).
4. **`CPF-INV-04`:** `hasSub5rCompression === (cMin < 5r) === (allTriples.zoneHistogram.Z2_A2 > 0)`.
5. **`CPF-INV-05`:** `sum(allTriples.zoneHistogram) === allTriples.count`.
6. **`CPF-INV-06`:** `sum(primitiveTriples.zoneHistogram) === primitiveTriples.count`.
7. **`CPF-INV-07`:** `allTriples.zoneHistogram.Z0_ROOT === 1`.
8. **`CPF-INV-08`:** `primitiveTriples.zoneHistogram.Z0_ROOT === (r === 1 ? 1 : 0)`.
9. **`CPF-INV-09`:** `spornXMin === 1/r`, `spornXMax >= 1`, and `(spornXMax === 1) === !hasSub5rCompression`.
10. **`CPF-INV-10`:** `allTriples.zoneHistogram[z] >= primitiveTriples.zoneHistogram[z]` for all four zones.
11. **`CPF-INV-11`:** `0 <= berggrenDepthMin <= berggrenDepthMax <= r - 1`.
12. **`CPF-INV-12`:** `spornXMin <= meanSpornX <= spornXMax` and `0 < meanADivC < 1` for both populations.
