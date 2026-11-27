# A Square-Root Area Identity for Four Circles Associated with a Right Triangle

**An Elementary Geometric Identity and an Interactive Parametric Laboratory**

**Andrey Artsybashev**  
*Independent Researcher, Software Architect*  
*Correspondence:* [A50kv109@gmail.com](mailto:A50kv109@gmail.com)  
*Project Repository:* [https://github.com/a50kv109/Pythagoras-Circles-Lab](https://github.com/a50kv109/Pythagoras-Circles-Lab)  

---

## Abstract

We examine an elementary geometric configuration associated with a Euclidean right triangle $OAB$ having legs $a, b > 0$ and hypotenuse $c = \sqrt{a^2 + b^2}$. On the three sides of the triangle, exterior squares $Q_a, Q_b, Q_c$ are constructed, each inscribing a circle ($K_a, K_b, K_c$ respectively). A fourth circle, the incircle $K_i$, is inscribed within the triangle. While the Pythagorean area relation states that $K_a + K_b = K_c$, taking the square root of each circle area yields a novel linear-scale identity: $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$. We provide a rigorous algebraic derivation showing that this identity follows directly from the classical formula for the right triangle inradius. Furthermore, we extend the geometric analysis by incorporating the circumcircle of the right triangle (Thales circle $K_o$) and establishing a two-parameter orthogonal parametric model separating triangle shape ($t = b/a$) from overall system scale ($\lambda > 0$). To accompany this theoretical exposition, we describe an open-source interactive computational laboratory (**Pythagoras-Circles-Lab**, v1.2.0) featuring real-time graphical parametric analysis, absolute and normalized scaling modes, and automated verification of 17 geometric invariants.

**Keywords:** Euclidean geometry, Pythagorean theorem, incircle, circumcircle, Thales' theorem, parametric geometry, interactive visualization, mathematical software.

---

## 1. Introduction

The Pythagorean theorem is among the foundational pillars of geometry, famously relating the areas of squares constructed on the sides of a right triangle:
$$a^2 + b^2 = c^2$$
When geometric figures similar in shape are constructed on the sides of a right triangle, their areas inherit the Pythagorean scaling property. For instance, if circles $K_a, K_b, K_c$ are inscribed within squares $Q_a, Q_b, Q_c$ constructed on legs $a, b$ and hypotenuse $c$, their areas satisfy:
$$K_a + K_b = K_c$$
because each circle area is proportional to the square of its side length ($K = \frac{\pi}{4} s^2$).

In this work, we investigate the geometric consequences of introducing the right triangle's interior incircle $K_i$ alongside the three square-inscribed circles. By converting quadratic areas into linear dimensions via principal square roots, we establish an exact square-root area identity:
$$\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$$
Although this relation is an algebraic consequence of the standard inradius formula, it offers a striking visual and structural bridge between the Pythagorean theorem and the properties of the triangle incircle. To facilitate rigorous exploration of this configuration, we present an open-source computational research environment—**Pythagoras-Circles-Lab**—which implements both dimensionless shape parameterization ($t = b/a$) and scale parameterization ($\lambda > 0$), including the fifth geometric layer: the Thales circumcircle ($K_o$).

---

## 2. Geometric Construction

Consider a Euclidean plane $\mathbb{R}^2$ with standard Cartesian coordinates. Let $a, b > 0$ be two finite positive real parameters representing the lengths of the orthogonal legs of a right triangle $OAB$:
- $O = (0, 0)$ (right-angle vertex)
- $A = (0, a)$ (endpoint of vertical leg $OA$)
- $B = (b, 0)$ (endpoint of horizontal leg $OB$)

The hypotenuse segment $AB$ has length:
$$c = |AB| = \sqrt{a^2 + b^2}$$

### 2.1 Exterior Squares
Three squares are constructed outward on the sides of $\triangle OAB$:
1. **Square $Q_a$** on leg $OA$ (side length $a$, area $a^2$): vertices at $(0,0), (0,a), (-a,a), (-a,0)$.
2. **Square $Q_b$** on leg $OB$ (side length $b$, area $b^2$): vertices at $(0,0), (b,0), (b,-b), (0,-b)$.
3. **Square $Q_c$** on hypotenuse $AB$ (side length $c$, area $c^2$): constructed outward into Quadrant I.

---

## 3. Mathematical Definitions of the Four Circles

Within this geometric framework, four primary circles are defined:

1. **Circle $K_a$ (Square-inscribed on leg $a$):**
   - Center: $O_a = \left(-\frac{a}{2}, \frac{a}{2}\right)$
   - Radius: $R_a = \frac{a}{2}$, Diameter: $D_a = a$
   - Area: $K_a = \pi \left(\frac{a}{2}\right)^2 = \frac{\pi a^2}{4}$

2. **Circle $K_b$ (Square-inscribed on leg $b$):**
   - Center: $O_b = \left(\frac{b}{2}, -\frac{b}{2}\right)$
   - Radius: $R_b = \frac{b}{2}$, Diameter: $D_b = b$
   - Area: $K_b = \pi \left(\frac{b}{2}\right)^2 = \frac{\pi b^2}{4}$

3. **Circle $K_c$ (Square-inscribed on hypotenuse $c$):**
   - Center: $O_c = \left(\frac{a+b}{2}, \frac{a+b}{2}\right)$
   - Radius: $R_c = \frac{c}{2}$, Diameter: $D_c = c$
   - Area: $K_c = \pi \left(\frac{c}{2}\right)^2 = \frac{\pi c^2}{4}$

4. **Circle $K_i$ (Triangle Incircle):**
   - Inradius $r$:
     $$r = \frac{a + b - c}{2} = \frac{ab}{a + b + c}$$
   - Incenter: $I = (r, r)$ (tangent to both coordinate axes in Quadrant I)
   - Area: $K_i = \pi r^2$

---

## 4. The Main Square-Root Area Identity

### 4.1 Derivation of the Inradius Formula
The area of right triangle $\triangle OAB$ can be expressed in two ways: via the legs and via the semiperimeter $p = \frac{a+b+c}{2}$ and inradius $r$:
$$S = \frac{1}{2}ab = pr = \frac{a+b+c}{2}r \implies r = \frac{ab}{a+b+c}$$
Multiplying numerator and denominator by $(a + b - c)$ yields:
$$r = \frac{ab(a+b-c)}{(a+b)^2 - c^2} = \frac{ab(a+b-c)}{(a^2+b^2+2ab) - c^2}$$
By the Pythagorean theorem, $a^2 + b^2 = c^2$, so the denominator simplifies to $2ab$:
$$r = \frac{ab(a+b-c)}{2ab} = \frac{a+b-c}{2}$$

### 4.2 Derivation of the Square-Root Area Identity
Taking the principal square root of the areas of circles $K_a, K_b, K_c, K_i$:
$$\sqrt{K_a} = \frac{\sqrt{\pi}}{2}a, \quad \sqrt{K_b} = \frac{\sqrt{\pi}}{2}b, \quad \sqrt{K_c} = \frac{\sqrt{\pi}}{2}c, \quad \sqrt{K_i} = \sqrt{\pi}\,r = \frac{\sqrt{\pi}}{2}(a + b - c)$$

Evaluating the left-hand side (LHS) and right-hand side (RHS):
- **LHS:**
  $$\sqrt{K_a} + \sqrt{K_b} = \frac{\sqrt{\pi}}{2}(a + b)$$
- **RHS:**
  $$\sqrt{K_c} + \sqrt{K_i} = \frac{\sqrt{\pi}}{2}c + \frac{\sqrt{\pi}}{2}(a + b - c) = \frac{\sqrt{\pi}}{2}(a + b)$$

Thus, we establish the exact identity:
$$\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$$

### 4.3 Contrast with Direct Area Sums
Summing the areas directly yields:
$$K_a + K_b = \frac{\pi}{4}(a^2 + b^2) = \frac{\pi c^2}{4} = K_c$$
Subtracting $K_c + K_i$ gives:
$$K_a + K_b - K_c - K_i = -K_i = -\pi r^2 < 0$$
Hence, direct area addition satisfies $K_a + K_b = K_c$, whereas the square-root relation bridges the three square-inscribed circles with the interior incircle $K_i$.

---

## 5. The Fifth Circle: Thales Circumcircle ($K_o$)

To provide a complete geometric picture of right triangle circular properties, the laboratory incorporates a fifth geometric layer: the **Thales circumcircle $K_o$**.

### 5.1 Defining Properties
By classical Euclidean Thales' theorem, any right triangle inscribed in a circle has its hypotenuse as a diameter. For $\triangle OAB$:
- **Circumcenter ($O_o$):** Midpoint of hypotenuse $AB$:
  $$O_o = \frac{A + B}{2} = \left(\frac{b}{2}, \frac{a}{2}\right)$$
- **Diameter ($D_o$) and Radius ($R_o$):**
  $$D_o = c = \sqrt{a^2 + b^2}, \qquad R_o = \frac{c}{2}$$
- **Area ($K_o$) and Circumference ($L_o$):**
  $$K_o = \pi R_o^2 = \frac{\pi c^2}{4}, \qquad L_o = \pi c$$
- **Concyclicity:** All three vertices $O, A, B$ are equidistant from $O_o$:
  $$|O_o - O| = |O_o - A| = |O_o - B| = R_o = \frac{c}{2}$$

### 5.2 Distinction Between $K_o$ and $K_c$
While $K_o$ (circumcircle) and $K_c$ (hypotenuse square-inscribed circle) share identical scalar dimensions ($D_o = D_c = c$, $R_o = R_c = c/2$, $K_o = K_c = \frac{\pi c^2}{4}$), they occupy distinct geometric loci:
$$O_o = \left(\frac{b}{2}, \frac{a}{2}\right) \neq O_c = \left(\frac{a+b}{2}, \frac{a+b}{2}\right), \qquad |O_o - O_c| = \frac{c}{2} > 0$$

---

## 6. Two-Parameter Parametric Model ($t, \lambda$)

Version `v1.2.0` introduces an orthogonal mathematical decomposition of triangle configurations into two decoupled parameters:

1. **Shape Parameter ($t = b/a \in (0, +\infty)$):** Governs internal proportions and aspect ratio at constant hypotenuse.
2. **Scale Parameter ($\lambda = c / c_0 > 0$):** Governs overall system size relative to the canonical Egyptian triple benchmark ($a_0=3, b_0=4, c_0=5.0$).

### 6.1 Homogeneity Laws of Degrees 1 and 2
Under proportional scaling $\mathbf{x} \mapsto \lambda \mathbf{x}$:
- **Linear metrics (degree 1):**
  $$a(\lambda) = \lambda a_0, \quad b(\lambda) = \lambda b_0, \quad c(\lambda) = \lambda c_0, \quad D_o(\lambda) = \lambda c_0, \quad R_o(\lambda) = \lambda R_o(1), \quad L_o(\lambda) = \lambda L_o(1)$$
- **Area metrics (degree 2):**
  $$K_o(\lambda) = \lambda^2 K_o(1), \quad K_c(\lambda) = \lambda^2 K_c(1), \quad K_i(\lambda) = \lambda^2 K_i(1)$$
- **Central Identity Invariance:** Because $\sqrt{K(\lambda)} = \lambda \sqrt{K(1)}$, the square-root area identity scales linearly as $\lambda\left(\sqrt{K_a(1)} + \sqrt{K_b(1)}\right) = \sqrt{K_c(\lambda)} + \sqrt{K_i(\lambda)}$, remaining valid for all $\lambda > 0$.

---

## 7. Computational Implementation

The mathematical model is implemented as a modular TypeScript/React application (`Pythagoras-Circles-Lab`):
- **Core Math Layer (`src/math/`):** `RightTriangle.ts`, `SquareConstruction.ts`, `FourCirclesModel.ts`, `ThalesCircumcircle.ts`, and `FourCirclesSpectralAnalysis.ts`.
- **Validation Layer (`FourCirclesValidators.ts`, `ThalesValidators.ts`):** Continuous verification of 8 core + 9 Thales invariants (`17/17` total) at tolerance $10^{-9}$.
- **Interactive Visualization (`src/components/`):** SVG geometry board (`GeometryBoard.tsx`), analytical spectral panel (`SpectralAnalysisPanel.tsx`), and modal test runners.

---

## 8. Numerical Verification and Reproducibility

The repository includes a comprehensive automated test suite (`src/tests/geometry.test.ts`) covering 10 test sections (control triangles, leg-swap symmetry, micro/macro extremes, mutation checks, and $\lambda$ homogeneity laws). All tests execute successfully via `npm test`.

---

## 9. Educational and Research Applications
The laboratory serves as an exploratory tool for secondary and university mathematics education, illustrating the bridge between algebraic identities, radical geometry, and scale invariance.

---

## 10. Limitations and Future Work
- **Domain restriction:** Valid only for Euclidean right triangles ($a, b > 0$).
- **Floating-point precision:** Standard IEEE-754 `float64` precision applies.

---

## 11. Conclusion
We have presented the exact derivation of the square-root area identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ and its extension with the Thales circumcircle under a rigorous two-parameter model.

---

## 12. References
1. Euclid, *Elements*, Book I & Book VI.
2. Artsybashev, A., *Pythagoras-Circles-Lab: Interactive Parametric Exploration of Pythagorean Geometry*, GitHub Repository, v1.2.0, 2026. [https://github.com/a50kv109/Pythagoras-Circles-Lab](https://github.com/a50kv109/Pythagoras-Circles-Lab).

---

## Deliverables B, C, D, E, F

### B. Mathematical Statements and Claims Requiring Independent Verification
1. Whether the square-root identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ has appeared under identical phrasing in historical mathematical literature prior to this educational synthesis.
2. Numerical stability bounds under extreme floating-point underflow ($10^{-300}$).

### C. Weaknesses, Ambiguities, and Missing Information in Project Documentation
1. UI drag interactions and pointer scrubbing cannot be verified via automated headless E2E tests in the current CI environment.
2. Explicit distinction between scale-invariant ratio plots and unnormalized absolute growth plots must be carefully emphasized for student users.

### D. Proposed List of Figures
- **Figure 1:** Geometric schematic of the four circles and incircle for $\triangle OAB$ ($a=4, b=3, c=5$).
- **Figure 2:** Geometric separation of centers between $O_o$ (Thales circumcenter) and $O_c$ (hypotenuse square center).
- **Figure 3:** Parametric spectral curves showing normalized ratios versus shape parameter $t = b/a$.
- **Figure 4:** Scale growth curves showing linear ($\lambda^1$) vs. quadratic ($\lambda^2$) scaling laws.

### E. Zenodo Metadata Proposal
- **Title:** A Square-Root Area Identity for Four Circles Associated with a Right Triangle
- **Abstract:** We examine an elementary geometric configuration associated with a right triangle...
- **Keywords:** Euclidean geometry, Pythagorean theorem, incircle, circumcircle, Thales' theorem, interactive visualization.
- **Publication Type:** Preprint
- **Suggested License:** Creative Commons Attribution 4.0 International (CC-BY-4.0)
- **Related Identifier:** GitHub Repository [https://github.com/a50kv109/Pythagoras-Circles-Lab](https://github.com/a50kv109/Pythagoras-Circles-Lab)

### F. Discrepancy Audit
- **Status:** All mathematical formulas, TypeScript implementations (`ThalesCircumcircle.ts`, `FourCirclesModel.ts`), test suites (`geometry.test.ts`), and documentation (`FORMULA_PASSPORTS.md`, `MATHEMATICAL_FOUNDATION.md`) are fully harmonized. UMFP is documented strictly as a methodological framework without runtime software dependencies.
