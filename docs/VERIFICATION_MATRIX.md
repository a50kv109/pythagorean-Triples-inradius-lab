# Verification Matrix — Four-Circles Pythagorean Geometry Lab (PCL)

This matrix maps every UMFP formula passport (`PCL-A01`–`PCL-G29`) and open research direction to its analytical basis, unit/runtime verification, UMFP validity status (`VERIFIED`, `DERIVED`, `CONJECTURE`, `ANALOGY`), and known limitations.

---

## 1. Traceability Matrix (`PCL-A01` – `PCL-G29`)

| Formula ID | Property Verified | Analytical Basis | Numerical Test / Runtime Validator | Code & Test Location | UMFP Validity Status | Known Limitations |
|---|---|---|---|---|---|---|
| `PCL-A01` | Strict domain $a, b > 0$, finite | `Domain Constraint` | Rejects `0`, `<0`, `NaN`, `±Infinity` (`InvalidTriangleInputError`) | `inputValidation.ts`; `geometry.test.ts` (Sec. 3) | `VERIFIED` | UI clamps further to `[0.2, 15]` (`App.tsx`) |
| `PCL-A02` | Canonical vertices $O(0,0), A(0,a), B(b,0)$ | `Coordinate Definition` | Verified across 6 control triangles | `RightTriangle.ts`; `geometry.test.ts` (Sec. 1) | `VERIFIED` | Right angle fixed at origin $O$ |
| `PCL-A03` | Hypotenuse $c = \sqrt{a^2 + b^2}$ via `Math.hypot` | `Established Euclidean Theorem` | Control triangles + scales `1e-6` to `1e50`; `squares_construction` | `RightTriangle.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4) | `VERIFIED` | Overflows if $c > \text{MAX\_VALUE}$ |
| `PCL-A04` | Angles $\alpha, \beta$, $S_{\triangle}, P_{\triangle}, h_c, H, c_a, c_b$ | `MATHEMATICAL_PROOFS.md` (Trigonometry / similarity) | Direction cosines used for `tangencyAB`; `h_c, H, c_a, c_b` not standalone-asserted in `geometry.test.ts` | `RightTriangle.ts` | `DERIVED` *(partial test)* | `RightTriangle.area` overflows if $ab/2 > \text{MAX\_VALUE}$ |
| `PCL-B05` | Exterior leg squares $Q_a, Q_b$ | `Geometric Construction` | Side lengths checked via `squares_construction` (`tol = 1e-9`) | `SquareConstruction.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4) | `VERIFIED` | Q2/Q4 signs hold by construction |
| `PCL-B06` | Exterior hypotenuse square $Q_c$ & orthogonality | `Geometric Construction` | Side lengths $= c$ and 3 dot products $= 0$ + skewed `Bc` mutation test | `SquareConstruction.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4, 5c) | `DERIVED`, `VERIFIED` | — |
| `PCL-B07` | Square areas $S_a, S_b, S_c$ & $S_a + S_b = S_c$ | `Established Euclidean Theorem` | Side checks in `squares_construction` + proportional check in `PCL-C11` | `SquareConstruction.ts`; `geometry.test.ts` (Sec. 1, 4) | `VERIFIED` | Quadratic `float64` overflow above $\sim 1.34 \times 10^{154}$ |
| `PCL-C08` | Centers $O_a, O_b, O_c$ | `Derived Coordinate Formula` | Exact coordinate assertions on all 6 control triangles | `FourCirclesModel.ts`; `geometry.test.ts` (Sec. 1) | `DERIVED`, `VERIFIED` | — |
| `PCL-C09` | Radii $R_k$, diameters $D_k$, 4-side square tangency | `Geometric Tangency Relation` | `square_circles_tangency` (`tol = 1e-9`) + diameters + skewed `Qc` mutation | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4, 5c) | `DERIVED`, `VERIFIED` | — |
| `PCL-C10` | Areas $K_a, K_b, K_c$ & $\sqrt{K_a}, \sqrt{K_b}, \sqrt{K_c}$ | `Algebraic Area Formula` | `four_circle_areas` (`tol = 1e-9`) + exact area checks | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4) | `DERIVED`, `VERIFIED` | Quadratic `float64` bounds $[10^{-162}, 10^{154}]$ |
| `PCL-C11` | Pythagorean circle sum $K_a + K_b = K_c$ | `MATHEMATICAL_PROOFS.md` (Identity 4) | `pythagorean_circle_areas` (`tol = 1e-9`) + Sec. 1 & 7 checks | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4, 7) | `DERIVED`, `VERIFIED` | Same quadratic `float64` bounds |
| `PCL-D12` | Inradius $r = \frac{a+b-c}{2} = \frac{ab}{a+b+c} > 0$ | `MATHEMATICAL_PROOFS.md` (Prop. 1) | `incircle_positive` + exact checks + `(1, 1e5)`, `(1e50, 2e50)` | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4) | `DERIVED`, `VERIFIED` | — |
| `PCL-D13` | Incenter $I(r, r)$ & $r(a+b) < ab$ | `MATHEMATICAL_PROOFS.md` (Prop. 2) | `incircle_positive` + `I.x, I.y` checks + shifted `I` mutation test | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 5a) | `DERIVED`, `VERIFIED` | Interior check `r*(a+b) < a*b` overflows above $10^{154}$ |
| `PCL-D14` | Tangency points $T_a, T_b, T_c$ & $d(I, \text{sides}) = r$ | `MATHEMATICAL_PROOFS.md` (Prop. 2) | `incircle_tangency` (`tol = 1e-9`) + shifted `I` mutation test | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4, 5a) | `DERIVED`, `VERIFIED` | — |
| `PCL-D15` | Incircle area $K_i = \pi r^2$ & $\sqrt{K_i}$ | `Algebraic Area Formula` | `four_circle_areas` + `Ki` area checks + `4*Ki` mutation test | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 5b) | `DERIVED`, `VERIFIED` | Quadratic underflow when $r \lesssim 10^{-162}$ |
| `PCL-E16` | Central derived identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ | `MATHEMATICAL_PROOFS.md` (Identity 3) | `central_sqrt_identity` + Sec. 1, 4, 5b, 7 checks (`tol = 1e-9`) | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4, 5b, 7) | `DERIVED`, `VERIFIED` | Valid for Euclidean right triangles only; `Math.sqrt(area)` has quadratic bounds |
| `PCL-E17` | Area contrast $K_a + K_b - K_c - K_i = -K_i < 0$ | `MATHEMATICAL_PROOFS.md` (Identity 4) | `area_non_equality_contrast` + `< 0` check in Sec. 1 | `FourCirclesModel.ts`, `FourCirclesValidators.ts`; `geometry.test.ts` (Sec. 1, 4) | `DERIVED`, `VERIFIED` | Normalized by $K_c$ in validator |
| `PCL-F18` | Dimensionless ratio $t = b/a$, `calculateFourCircles(1, t)` | `MATHEMATICAL_PROOFS.md` (Identity 5) | Tested at $t \in \{0.1, 0.5, 1.0, 2.0, 10.0\}$ | `FourCirclesSpectralAnalysis.ts`; `geometry.test.ts` (Sec. 7) | `DERIVED`, `VERIFIED` | Throws `RangeError` for $t \le 0$ or non-finite |
| `PCL-F19` | Perimeters $P_x = 2\pi R_x = \pi D_x$ & % shares | `Derived Computational Relation` | Exact 4 items, `sum == 100%`, $P=2\pi R$, swap symmetry on `(4,3)` | `FourCirclesSpectralAnalysis.ts`; `geometry.test.ts` (Sec. 6) | `DERIVED`, `VERIFIED` | — |
| `PCL-F20` | Mode A normalized areas $K_x(t)/K_c(t)$ | `MATHEMATICAL_PROOFS.md` (Identity 5) | Reference checks at $t \in \{0.1, 0.5, 1, 2, 10\}$ + `sampleSpectralCurves` | `FourCirclesSpectralAnalysis.ts`; `geometry.test.ts` (Sec. 7) | `DERIVED`, `VERIFIED` | Graph polyline uses discrete `steps = 220` |
| `PCL-F21` | Modes B & C linear ratios $P_x/P_c \equiv R_x/R_c \equiv D_x/D_c$ | `MATHEMATICAL_PROOFS.md` (Identity 5) | Equality of `perimeters`, `radii`, `diameters` + `getNormalizedValuesForMode` | `FourCirclesSpectralAnalysis.ts`; `geometry.test.ts` (Sec. 7) | `DERIVED`, `VERIFIED` | `Radius \| Diameter` switch updates labels & raw values only |
| `PCL-F22` | Reciprocal leg-swap duality $t \leftrightarrow 1/t$ | `MATHEMATICAL_PROOFS.md` (Identity 6) | `(3,7)/(7,3)`, `(3,4)/(4,3)`, `(0.1, 10)`, `(0.5, 2.0)` | `FourCirclesSpectralAnalysis.ts`; `geometry.test.ts` (Sec. 2, 6, 7) | `DERIVED`, `VERIFIED` | Plot mirror symmetry applies on `'log'` scale |
| `PCL-F23` | Symmetry at $t=1$ & global max $K_i/K_c = 3 - 2\sqrt{2}$ | `MATHEMATICAL_PROOFS.md` (Prop. 7) | Asserted at `t = 1.0` and inside `sampleSpectralCurves` | `FourCirclesSpectralAnalysis.ts`; `geometry.test.ts` (Sec. 7) | `DERIVED`, `VERIFIED` | Global maximum proven analytically; sampled at discrete points |
| `PCL-F24` | Ratio-to-leg sync `legsFromRatioAndHypotenuse` | `Computational Mapping` | Round-trip sync at $t \in \{0.1, 0.5, 1, 2, 10\}$ (`c = 5`) | `FourCirclesSpectralAnalysis.ts`, `App.tsx`; `geometry.test.ts` (Sec. 7) | `VERIFIED` | Ratio clips if $t \notin [1/75, 75]$; `App.tsx` rounds legs to $10^{-6}$ |
| `PCL-G25` | Thales circumcenter $O_o = \frac{A+B}{2}$ from endpoints | `Established Euclidean Theorem` | Canonical triples + shifted/rotated right triangle + swap reflection | `ThalesCircumcircle.ts`; `geometry.test.ts` (Sec. 9a, 9b, 9d) | `VERIFIED` | Throws `RangeError` on non-finite or coincident `A === B` |
| `PCL-G26` | Thales $D_o=c, R_o=c/2, K_o=\pi c^2/4, L_o=\pi c$ | `Established Euclidean Theorem` | 4 runtime validators (`tol = 1e-9`) + extreme/scale tests | `ThalesCircumcircle.ts`, `ThalesValidators.ts`; `geometry.test.ts` (Sec. 9a, 9c) | `VERIFIED` | Same `float64` quadratic area bounds as `PCL-C10` |
| `PCL-G27` | Vertex equidistance $|O_o-V|=R_o$ & $\angle AOB=90^\circ$ | `Established Euclidean Theorem` | `thales_dist_A/B/C`, `thales_right_angle` + center-shift mutation test | `ThalesCircumcircle.ts`, `ThalesValidators.ts`; `geometry.test.ts` (Sec. 9a, 9b, 9f) | `VERIFIED` | — |
| `PCL-G28` | Area identity $K_o = K_c$ with $|O_o - O_c| = c/2 > 0$ | `Derived Geometric Comparison` | `thales_area_eq_Kc` (`tol = 1e-9`) + `1e-12` area diff check | `ThalesCircumcircle.ts`, `ThalesValidators.ts`, `KcVsKoComparison.tsx`; `geometry.test.ts` (Sec. 9a) | `DERIVED`, `VERIFIED` | — |
| `PCL-G29` | Constant `thalesNorm` & monotonic `thalesAbs` growth | `MATHEMATICAL_FOUNDATION.md` (Sec. 6.4) | $t \in [0.05, 20]$ ratios, strict monotonicity & `sampleThalesAbsoluteCurves` | `FourCirclesSpectralAnalysis.ts`, `SpectralAnalysisPanel.tsx`; `geometry.test.ts` (Sec. 9e) | `DERIVED`, `VERIFIED` | Graph polyline uses discrete sampling (`steps = 220`) |

---

## 2. Open Conjectures & Analogies (Outside `v1.0.0` Scope)

| Topic | Description | UMFP Validity Status | Current Repository State |
|---|---|---|---|
| Excircle extension | Comparing excircles $r_a, r_b, r_c$ with $K_i, K_a, K_b, K_c$ | `ANALOGY` | Listed in `ROADMAP.md`; not implemented or tested |
| Discrete harmonic DFT | True Fourier/DFT decomposition of 4-circle sequence | `CONJECTURE` | Listed in `ROADMAP.md`; not implemented |
| Non-Euclidean triangles | Spherical / hyperbolic analogues where $a^2+b^2 \ne c^2$ | `ANALOGY` | Outside model assumptions |

---

## 3. Verification Boundaries

1. **Automated Unit Tests (`npm test`):** Pure mathematical & synchronization checks across Sections 1–9 in `src/tests/geometry.test.ts` (`tol = 1e-9`).
2. **Runtime Monitors:** `validateAllFiveCirclesInvariants` evaluates all 17 invariants (8 core Four-Circle + 9 Thales Circumcircle) live inside `InvariantsPanel.tsx` and `TestRunnerModal.tsx`.
3. **Not Covered by Automated Tests:** Browser DOM/pointer rendering, CSS responsiveness across viewports, and CDN availability (no Playwright/RTL harness is installed).
