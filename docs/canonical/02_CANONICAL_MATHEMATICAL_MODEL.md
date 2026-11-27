# 02 — Canonical Mathematical Model

This document reconciles the canonical mathematical model (`src/canonical/canonicalFourCircles.ts`, `src/canonical/semanticContract.ts`) with the runtime UI calculation modules (`src/math/RightTriangle.ts`, `src/math/FourCirclesModel.ts`, `src/math/IncenterPartition.ts`, `src/math/ThalesCircumcircle.ts`, `src/math/FourCirclesSpectralAnalysis.ts`, `src/math/experiments/*`).

---

## 1. Coordinate Frames & Explicit Correspondence

The repository maintains **two mathematically isomorphic coordinate representations** bridged by `src/canonical/legacyMapping.ts` (`verifyLegacyToCanonicalMapping`):

| Element | Canonical Opposite-Side Frame (`src/canonical/canonicalFourCircles.ts`) | Runtime UI Leg-Indexed Frame (`src/math/RightTriangle.ts`, `FourCirclesModel.ts`, `IncenterPartition.ts`) |
| :--- | :--- | :--- |
| **Right-angle vertex ($\gamma = 90^\circ$)** | $C = (0, 0)$ | $O = (0, 0)$ (aliased as `C` inside `IncenterPartition.ts`) |
| **Vertex on $+Oy$** | $A = (0, \text{sideB})$ | $A = (0, a)$ |
| **Vertex on $+Ox$** | $B = (\text{sideA}, 0)$ | $B = (b, 0)$ |
| **Horizontal leg (along $+Ox$)** | $\text{sideA} = \|BC\|$ (opposite vertex $A$) | $b = \|OB\|$ (`legOB`) |
| **Vertical leg (along $+Oy$)** | $\text{sideB} = \|AC\|$ (opposite vertex $B$) | $a = \|OA\|$ (`legOA`) |
| **Hypotenuse** | $\text{sideC} = \|AB\| = \sqrt{\text{sideA}^2 + \text{sideB}^2}$ | $c = \|AB\| = \sqrt{a^2 + b^2}$ |
| **Shape parameter** | $\rho = \dfrac{\text{sideA}}{\text{sideB}} = \tan\alpha$ | $t = \dfrac{b}{a} = \tan\alpha$ (numerically identical to $\rho$) |

**Applicability Domain:** $\text{sideA}, \text{sideB} \in \mathbb{R}^+$ (finite, strictly $> 0$).

---

## 2. Core Triangle Relations (`PROVEN` & `VERIFIED_COMPUTATIONALLY`)

Using canonical side lengths $(a_{\text{c}}, b_{\text{c}}, c) \equiv (\text{sideA}, \text{sideB}, \text{sideC})$:
1. **Hypotenuse:** $c = \sqrt{a_{\text{c}}^2 + b_{\text{c}}^2}$ (implemented via `Math.hypot` to avoid intermediate overflow/underflow).
2. **Interior Angles:** $\alpha = \operatorname{atan2}(a_{\text{c}}, b_{\text{c}})$ at $A$, $\beta = \operatorname{atan2}(b_{\text{c}}, a_{\text{c}})$ at $B$, $\gamma = \pi/2 = 90^\circ$ at $C$.
3. **Perimeter & Semi-perimeter:** $P = a_{\text{c}} + b_{\text{c}} + c$, $p = \dfrac{a_{\text{c}} + b_{\text{c}} + c}{2}$.
4. **Triangle Area:** $S = \dfrac{1}{2} a_{\text{c}} b_{\text{c}}$.
5. **Altitude & Hypotenuse Projections** (`RightTriangle.ts`):
   $$h_c = \frac{a b}{c}, \qquad c_a = \frac{a^2}{c}, \qquad c_b = \frac{b^2}{c}, \qquad H = \left(b \left(\frac{a}{c}\right)^2,\; a \left(\frac{b}{c}\right)^2\right)$$

---

## 3. Incenter & Incircle $K_i$ (`PROVEN` & `VERIFIED_COMPUTATIONALLY`)

1. **Inradius (Cancellation-Free Form vs. Direct Form):**
   - Analytical identity: $r = \dfrac{a_{\text{c}} + b_{\text{c}} - c}{2} = p - c = \dfrac{S}{p} = \dfrac{a_{\text{c}} b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c}$.
   - Computational form used in `canonicalFourCircles.ts` and `FourCirclesModel.ts`:
     $$r = \left(\frac{a_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c}\right) b_{\text{c}}$$
     *(avoids catastrophic cancellation when $a_{\text{c}} \ll b_{\text{c}}$ or $b_{\text{c}} \ll a_{\text{c}}$, and avoids overflow at extreme scales).*
2. **Incenter Coordinates:** $I = (r, r)$ (since both legs lie on the positive coordinate axes meeting at $90^\circ$).
3. **Incircle Area & Circumference:** $\operatorname{Area}(K_i) = \pi r^2$, $C_i = 2\pi r$.
4. **Tangency Points on Sides** (Canonical Frame):
   - On $BC$ ($\text{sideA}$): $T_a = (r, 0)$
   - On $AC$ ($\text{sideB}$): $T_b = (0, r)$
   - On $AB$ ($\text{sideC}$): $T_c = \left(r\left(1 + \frac{\text{sideB}}{\text{sideC}}\right),\; r\left(1 + \frac{\text{sideA}}{\text{sideC}}\right)\right)$

---

## 4. Incenter Triangle Partition ($S = S_A + S_B + S_C = p r$)

Connecting incenter $I$ to vertices $A, B, C$ partitions $\triangle ABC$ into three sub-triangles sharing altitude $r$:
- **In Canonical Frame (`src/canonical/canonicalFourCircles.ts`):**
  $$S_A^{\text{canon}} = \operatorname{Area}(\triangle IBC) = \frac{1}{2}\,\text{sideA}\,r, \quad S_B^{\text{canon}} = \operatorname{Area}(\triangle IAC) = \frac{1}{2}\,\text{sideB}\,r, \quad S_C^{\text{canon}} = \operatorname{Area}(\triangle IAB) = \frac{1}{2}\,\text{sideC}\,r$$
- **In Runtime UI `IncenterPartition.ts` (Leg-Indexed Frame):**
  $$S_A^{\text{UI}} = \operatorname{Area}(\triangle CAI) = \frac{1}{2}\,a\,r, \quad S_B^{\text{UI}} = \operatorname{Area}(\triangle CBI) = \frac{1}{2}\,b\,r, \quad S_C^{\text{UI}} = \operatorname{Area}(\triangle ABI) = \frac{1}{2}\,c\,r$$
- **Partition Sum Identity (`PROVEN` & `VERIFIED_COMPUTATIONALLY`):**
  $$S_A + S_B + S_C = \frac{1}{2}(a + b + c)\,r = p \cdot r = S$$
  Checked at tolerance $10^{-11}$ in `src/math/IncenterPartition.ts` (`isExact`).

---

## 5. Exterior Squares ($Q_x$), Square-Inscribed Circles ($K_x$), & Four-Circle Identity

- **Exterior Squares:** $\operatorname{Area}(Q_a) = a_{\text{c}}^2$, $\operatorname{Area}(Q_b) = b_{\text{c}}^2$, $\operatorname{Area}(Q_c) = c^2 = a_{\text{c}}^2 + b_{\text{c}}^2$.
- **Square-Inscribed Circles:** Radii $r_a = a_{\text{c}}/2$, $r_b = b_{\text{c}}/2$, $r_c = c/2$; Areas $\operatorname{Area}(K_x) = \frac{\pi s_x^2}{4}$; Circumferences $C_x = \pi s_x$.
- **Universal Direction Vector** (`SquareConstruction.ts`): $\mathbf{e} = \left(\frac{1}{\sqrt{2}}, \frac{1}{\sqrt{2}}\right)$ along designated diagonals of $Q_a, Q_b$.
- **Central Linear-Scale Four-Circle Identity (`PROVEN` & `VERIFIED_COMPUTATIONALLY`):**
  $$\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \frac{\sqrt{\pi}}{2}(a_{\text{c}} + b_{\text{c}}) = \frac{\sqrt{\pi}}{2}c + \frac{\sqrt{\pi}}{2}(a_{\text{c}} + b_{\text{c}} - c) = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$$
- **Pythagorean Circle Area Law & Contrast:**
  $$\operatorname{Area}(K_a) + \operatorname{Area}(K_b) = \operatorname{Area}(K_c), \qquad \operatorname{Area}(K_a) + \operatorname{Area}(K_b) - \operatorname{Area}(K_c) - \operatorname{Area}(K_i) = -\operatorname{Area}(K_i) < 0$$

---

## 6. Thales Circumcircle ($K_o$) & Homogeneity Scaling ($\lambda$)

- **Center & Radius:** $O_o = \frac{A + B}{2} = \left(\frac{a_{\text{c}}}{2}, \frac{b_{\text{c}}}{2}\right)$ (in Canonical) / $\left(\frac{b}{2}, \frac{a}{2}\right)$ (in UI), $R_o = \frac{c}{2}$, $D_o = c$.
- **Area & Circumference:** $\operatorname{Area}(K_o) = \frac{\pi c^2}{4} = \operatorname{Area}(K_c)$, $C_o = \pi c = C_c$.
- **Structural Separation from $K_c$:** $|O_o - O_c| = \frac{c}{2} > 0$.
- **Homogeneity Law (`scaleTriangleGeometry`, $\lambda > 0$):** Linear measures ($a, b, c, r, R_o, D_o, C_x$) scale as $\lambda^1$; quadratic measures ($\operatorname{Area}(Q_x), \operatorname{Area}(K_x), S, S_x$) scale as $\lambda^2$.

---

## 7. Parametric Spectral Relations & Experiment 01–06 Arc Laws

- **Normalized Spectral Family (`semanticContract.ts`, `FourCirclesSpectralAnalysis.ts`):**
  Fixing $b_{\text{c}} = 1, a_{\text{c}} = \rho$ (or $a = 1, b = t$):
  $$\frac{\operatorname{Area}(K_a)}{\operatorname{Area}(K_c)} = \frac{\rho^2}{1+\rho^2}, \quad \frac{\operatorname{Area}(K_b)}{\operatorname{Area}(K_c)} = \frac{1}{1+\rho^2}, \quad \frac{\operatorname{Area}(K_i)}{\operatorname{Area}(K_c)} = \frac{(\rho + 1 - \sqrt{\rho^2+1})^2}{1+\rho^2}$$
  *(In `FourCirclesSpectralAnalysis.ts` where $t = b/a$, the ratios for $K_a/K_c$ and $K_b/K_c$ swap roles symmetrically.)*
- **Incircle Arc Distribution & Side–Area Correspondence (`arcSideAreaCorrespondence.ts`, `incircleArcDistribution.ts`):**
  - Central angles of tangency arcs around $I$: $\varphi_A = 180^\circ - A$, $\varphi_B = 180^\circ - B$, $\varphi_C = 90^\circ$.
  - Side–Area Share Isomorphism: $w^{\text{area}}_k = \dfrac{S_k}{S} = \dfrac{s_k}{a+b+c} = w^{\text{side}}_k$.
  - Pythagorean Sub-Triangle Area Law: $S_a^2 + S_b^2 = S_c^2$.
  - Area Defect: $S_a + S_b - S_c = r^2$.
