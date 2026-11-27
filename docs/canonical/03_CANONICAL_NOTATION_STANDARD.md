# 03 — Canonical Notation Standard

This standard aligns with `src/canonical/types.ts`, `src/canonical/canonicalFourCircles.ts`, and `src/canonical/semanticContract.ts`, while explicitly documenting the bridge (`src/canonical/legacyMapping.ts`) to the runtime leg-indexed frame (`src/math/`).

---

## 1. Strict Semantic Rules
1. **Geometric Object vs. Scalar Measure:** Never conflate a geometric set with its scalar area, radius, or perimeter in prose or schemas:
   - $K_a, K_b, K_c, K_i, K_o$: Circular geometric objects (or in scalar algebraic formulas, explicitly write $\operatorname{Area}(K_x)$ / $K_x^{\text{area}}$ when avoiding ambiguity; note that legacy formulas and UI labels also write $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ as shorthand for $\sqrt{\operatorname{Area}(K_x)}$).
   - $Q_a, Q_b, Q_c$: Exterior squares; $\operatorname{Area}(Q_x)$ is square area.
2. **Opposite-Side Rule (Canonical Standard `CANONICAL_OPPOSITE_SIDE_V1`):**
   - Vertices: $A, B, C$ with right angle at $C = (0,0)$, $\gamma = 90^\circ$.
   - Opposite sides:
     - $a_{\text{c}}$ (`sideA`): $|BC|$ along $+Ox$, opposite vertex $A$ ($\alpha$).
     - $b_{\text{c}}$ (`sideB`): $|AC|$ along $+Oy$, opposite vertex $B$ ($\beta$).
     - $c$ (`sideC`): $|AB|$, hypotenuse opposite vertex $C$ ($\gamma = 90^\circ$).

---

## 2. Canonical Symbol Registry & Runtime UI Mapping

| Canonical Symbol | Meaning in Canonical Core (`src/canonical/`) | Equivalent in Runtime UI (`src/math/`, `src/types/geometry.ts`) |
| :--- | :--- | :--- |
| $C$ | Right-angle vertex $(0, 0)$, $\gamma = 90^\circ$ | $O = (0, 0)$ (named `vertexC` in `IncenterPartition.ts`) |
| $A$ | Vertex $(0, \text{sideB})$ on $+Oy$, angle $\alpha$ | $A = (0, a)$ on $+Oy$, angle $\alpha$ |
| $B$ | Vertex $(\text{sideA}, 0)$ on $+Ox$, angle $\beta$ | $B = (b, 0)$ on $+Ox$, angle $\beta$ |
| $\text{sideA}$ ($a_{\text{c}}$) | Horizontal leg $\|BC\|$, opposite $A$ | `triangle.b` ($b = \|OB\|$, `legOB`) |
| $\text{sideB}$ ($b_{\text{c}}$) | Vertical leg $\|AC\|$, opposite $B$ | `triangle.a` ($a = \|OA\|$, `legOA`) |
| $\text{sideC}$ ($c$) | Hypotenuse $\|AB\|$, opposite $C$ | `triangle.c` ($c = \|AB\|$) |
| $Q_a, Q_b, Q_c$ | Exterior squares on $\text{sideA}, \text{sideB}, \text{sideC}$ | `squareB` (on $OB$), `squareA` (on $OA$), `squareC` (on $AB$) |
| $K_a, K_b, K_c$ | Circles inscribed in $Q_a, Q_b, Q_c$ | `circleB` (in $Q_b$), `circleA` (in $Q_a$), `circleC` (in $Q_c$) |
| $K_i$, $I$, $r$ | Incircle, incenter $(r, r)$, inradius | `incircle`, `incircle.center`, `incircle.radius` |
| $K_o$, $O_o$, $R_o, D_o$ | Thales circumcircle, center $(\text{sideA}/2, \text{sideB}/2)$, radius $c/2$, diameter $c$ | `circumcircle` (`O_o = (b/2, a/2)`, `R_o = c/2`; note UI sometimes displays `O_c` vs `O_o`) |
| $O_c$ | Center of hypotenuse square $Q_c$ / circle $K_c$ | `circleC.center = ((a+b)/2, (a+b)/2)` |
| $T_a, T_b, T_c$ | Incircle tangency points on $\text{sideA}, \text{sideB}, \text{sideC}$ | `tangencyOB`, `tangencyOA`, `tangencyAB` |
| $\text{tangentSegA, B, C}$ | Tangent lengths from $A, B, C$: $p-a_{\text{c}}, p-b_{\text{c}}, p-c$ | Replaces ambiguous legacy $t_A, t_B, t_C$ |
| $S, P, p$ | Triangle area $\frac{1}{2}a_{\text{c}}b_{\text{c}}$, perimeter $a_{\text{c}}+b_{\text{c}}+c$, semi-perimeter $P/2$ | `triangle.area`, `triangle.perimeter`, `semiperimeter` |
| $S_A, S_B, S_C$ | Sub-triangle areas in incenter partition (see Doc 04) | `subTriangles.SB, SA, SC` (see Doc 04 mapping) |
| $\rho$ (`shapeRatio`) | $\text{sideA} / \text{sideB} = \tan\alpha$ | `t = b / a` in `FourCirclesSpectralAnalysis.ts` |
| $\lambda$ | Scale parameter $\text{sideC} / 5$ | `lambda = c / 5.0` |
| $\varphi_A, \varphi_B, \varphi_C$ | Incircle central arc angles $180^\circ - A, 180^\circ - B, 90^\circ$ | `arcAngleADeg, BDeg, CDeg` / `phiADeg, BDeg, CDeg` |
