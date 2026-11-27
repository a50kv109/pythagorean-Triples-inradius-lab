# Canonical Formula Inventory (`F01`–`F19`)

All 19 core passports below have been reconciled against actual implementations in `src/canonical/` and `src/math/` and verified computational tests in `src/tests/`.

| ID | Formula Name | Canonical Expression (`CANONICAL_OPPOSITE_SIDE_V1`) | Domain | Epistemic Status | Verified Implementation | Test Evidence |
|:---|:---|:---|:---|:---|:---|:---|
| **F01** | Hypotenuse Length | $c = \sqrt{a_{\text{c}}^2 + b_{\text{c}}^2}$ | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `RightTriangle.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F02** | Triangle Area | $S = \frac{1}{2}a_{\text{c}}b_{\text{c}}$ | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `RightTriangle.ts` | `geometry.test.ts`, `incenterPartition.test.ts` |
| **F03** | Perimeter | $P = a_{\text{c}} + b_{\text{c}} + c$ | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `RightTriangle.ts` | `geometry.test.ts`, `incenterPartition.test.ts` |
| **F04** | Semi-perimeter | $p = \frac{a_{\text{c}} + b_{\text{c}} + c}{2}$ | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `IncenterPartition.ts` | `incenterPartition.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F05** | Incenter Coordinates | $I = (r, r),\; x_I = y_I = \frac{a_{\text{c}}b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c}$ | Analytic Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `FourCirclesModel.ts` | `geometry.test.ts`, `incenterPartition.test.ts` |
| **F06** | Inradius | $r = \frac{a_{\text{c}}b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c} = \frac{a_{\text{c}} + b_{\text{c}} - c}{2}$ | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `FourCirclesModel.ts` | `geometry.test.ts`, `test04_numericalStability.canonical.test.ts` |
| **F07** | Sub-Triangle Area $S_A^{\text{canon}}$ | $S_A^{\text{canon}} = \frac{1}{2}a_{\text{c}}r$ ($\triangle IBC$; UI `SA` uses $\frac{1}{2}a_{\text{leg}}r$) | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `IncenterPartition.ts` | `incenterPartition.test.ts`, `semanticContract.canonical.test.ts` |
| **F08** | Sub-Triangle Area $S_B^{\text{canon}}$ | $S_B^{\text{canon}} = \frac{1}{2}b_{\text{c}}r$ ($\triangle IAC$; UI `SB` uses $\frac{1}{2}b_{\text{leg}}r$) | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `IncenterPartition.ts` | `incenterPartition.test.ts`, `semanticContract.canonical.test.ts` |
| **F09** | Sub-Triangle Area $S_C$ | $S_C = \frac{1}{2}cr$ ($\triangle IAB$) | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `IncenterPartition.ts` | `incenterPartition.test.ts`, `semanticContract.canonical.test.ts` |
| **F10** | Incenter Partition Sum | $S = S_A + S_B + S_C = p r$ | Planimetry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `IncenterPartition.ts` | `incenterPartition.test.ts`, `semanticContract.canonical.test.ts` |
| **F11** | Exterior Square Area $Q_a$ | $\operatorname{Area}(Q_a) = a_{\text{c}}^2$ (UI `squareA` uses $a_{\text{leg}}^2$) | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `SquareConstruction.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F12** | Exterior Square Area $Q_b$ | $\operatorname{Area}(Q_b) = b_{\text{c}}^2$ (UI `squareB` uses $b_{\text{leg}}^2$) | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `SquareConstruction.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F13** | Exterior Square Area $Q_c$ | $\operatorname{Area}(Q_c) = c^2 = a_{\text{c}}^2 + b_{\text{c}}^2$ | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `SquareConstruction.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F14** | Incircle Radius $K_a$ | $r_a = a_{\text{c}} / 2$ (UI `circleA` uses $a_{\text{leg}}/2$) | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `FourCirclesModel.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F15** | Incircle Radius $K_b$ | $r_b = b_{\text{c}} / 2$ (UI `circleB` uses $b_{\text{leg}}/2$) | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `FourCirclesModel.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F16** | Incircle Radius $K_c$ | $r_c = c / 2$ | Euclidean Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `FourCirclesModel.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F17** | Thales Circumradius | $R_o = c / 2$ | Thales's Theorem | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `ThalesCircumcircle.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F18** | Thales Circumcenter | $O_o = \left(\frac{a_{\text{c}}}{2}, \frac{b_{\text{c}}}{2}\right)$ (UI: $\left(\frac{b_{\text{leg}}}{2}, \frac{a_{\text{leg}}}{2}\right)$) | Analytic Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `ThalesCircumcircle.ts` | `geometry.test.ts`, `test01_controlTriangles.canonical.test.ts` |
| **F19** | Shape Ratio Parameter | $\rho = \frac{a_{\text{c}}}{b_{\text{c}}} = \tan\alpha \equiv t = \frac{b_{\text{leg}}}{a_{\text{leg}}}$ | Parametric Geometry | `PROVEN` & `VERIFIED_COMPUTATIONALLY` | `canonicalFourCircles.ts`, `semanticContract.ts` | `semanticContract.canonical.test.ts`, `geometry.test.ts` |

## Additional Formulas in Repository Scope (Beyond F01–F19)
The codebase also implements the following mathematical formulas outside the initial `F01`–`F19` passport set (documented in `02_CANONICAL_MATHEMATICAL_MODEL.md` and `06_CANONICAL_SPECTRAL_ANALYSIS.md`, and tested in `src/tests/`):
- **Central Four-Circle Identity & Area Contrast:** $\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$ and $\operatorname{Area}(K_a)+\operatorname{Area}(K_b)-\operatorname{Area}(K_c)-\operatorname{Area}(K_i)=-\operatorname{Area}(K_i)$ (`FourCirclesModel.ts`, `canonicalFourCircles.ts`).
- **Four-Circle & Thales Areas/Circumferences:** $\operatorname{Area}(K_x) = \pi s_x^2 / 4$, $\operatorname{Area}(K_i) = \pi r^2$, $C_x = \pi s_x$, $|O_o - O_c| = c/2$.
- **Right Triangle Altitude & Projections:** $h_c = ab/c$, $c_a = a^2/c$, $c_b = b^2/c$ (`RightTriangle.ts`).
- **Homogeneity Scale Law ($\lambda = c/5$):** `scaleTriangleGeometry` (`ThalesCircumcircle.ts`).
- **Parametric Spectral Ratios & Arc Laws (Exp 01–06):** `FourCirclesSpectralAnalysis.ts`, `semanticContract.ts`, `src/math/experiments/*`.

## Summary Statistics (`F01`–`F19`)
- **Passports created (`F01`–`F19`):** 19
- **Passports with reconciled `src/` paths & notation:** 19 (100%)
- **Passports with analytical proof (`PROVEN`) AND executed unit-test evidence (`VERIFIED_COMPUTATIONALLY`):** 19 (100%)
- **Unresolved contradictions inside `F01`–`F19`:** 0 (earlier `F07`/`F08` and `src/math/geometry.ts` discrepancies resolved in Stage 7.2)
