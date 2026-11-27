# Verification and Testing — Four-Circles Pythagorean Geometry Lab

This document describes the automated and runtime verification layers implemented in the repository, how to execute all checks, and which additional tests remain desirable for future releases.

---

## 1. Test and Verification Files

1. **Automated Unit & Synchronization Suite:** `src/tests/geometry.test.ts` (executed via Node `tsx` with `node:assert/strict`, tolerance `TOL = 1e-9`).
2. **Runtime Invariant Validators:** `src/math/FourCirclesValidators.ts` (8 core invariants) and `src/math/ThalesValidators.ts` (`validateThalesCircumcircleInvariants` for 9 Thales invariants; `validateAllFiveCirclesInvariants` for all 17 combined invariants), evaluated live on every state change inside `src/components/panels/InvariantsPanel.tsx` and across control benchmarks inside `src/components/panels/TestRunnerModal.tsx`.
3. **UMFP Traceability & Precision Docs:** See [`VERIFICATION_MATRIX.md`](VERIFICATION_MATRIX.md) (`PCL-A01`–`PCL-G29`) and [`NUMERICAL_ANALYSIS.md`](NUMERICAL_ANALYSIS.md) for formula-level proof vs. test mapping and `float64` stability bounds.

---

## 2. Commands (Matching `package.json`)

```bash
# 0. Verify deterministic dependencies from bun.lock
bun install --frozen-lockfile

# 1. Execute automated mathematical & synchronization unit tests
npm test

# 2. Run TypeScript static type checking
npm run lint

# 3. Build production Vite bundle (bundles local KaTeX CSS/fonts into dist/)
npm run build
```

---

## 3. Implemented Test Coverage (`src/tests/geometry.test.ts`)

### Section 1: Control Triangles & All 8 Invariants
Verifies `calculateFourCircles(a, b)` and all 8 `validateFourCirclesInvariants` checks (`incircle_positive`, `squares_construction`, `square_circles_tangency`, `incircle_tangency`, `four_circle_areas`, `central_sqrt_identity`, `pythagorean_circle_areas`, `area_non_equality_contrast`) against analytical closed-form expectations on six control triangles:
- `(3, 4, 5)` and `(4, 3, 5)` ($c = 5$, $r = 1$)
- `(5, 12, 13)` ($c = 13$, $r = 2$)
- `(4, 4, 4√2)` ($c = 4\sqrt{2}$, $r = 4 - 2\sqrt{2}$)
- `(1, 10, √101)` and `(10, 1, √101)` ($c = \sqrt{101}$, $r = \frac{11 - \sqrt{101}}{2}$)

Checks exact circle centers, diameters, areas, $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$, $K_a + K_b = K_c$, and $K_a + K_b - K_c - K_i = -K_i < 0$.

### Section 2: Leg-Swap Symmetry ($a \leftrightarrow b$)
Verifies on `(3, 7)` vs. `(7, 3)` that swapping legs exchanges $K_a$ and $K_b$ while preserving $K_c$, $r$, and $K_i$.

### Section 3: Strict Input Validation Contract
Verifies that `calculateFourCircles`, `calculateRightTriangle`, `calculateSquareC`, `calculateSquareA`, and `calculateSquareB` throw `InvalidTriangleInputError` on invalid inputs: `0`, negative values (`-5`, `-0.001`, `-1`), `NaN`, `+Infinity`, and `-Infinity`.

### Section 4: Micro, Macro & Extreme Aspect Ratio Stability
Runs all 8 scale-normalized invariants across extreme positive floating-point cases:
- Micro: `(1e-6, 1e-6)`, `(1e-4, 3e-4)`
- UI aspect bounds: `(0.2, 15)`, `(15, 0.2)`
- Extreme aspect ratios: `(1, 1e5)`, `(1e5, 1)`
- Macro scale: `(1e50, 2e50)`

### Section 5: Mutation / Fault-Injection Tests
Intentionally corrupts calculated geometry to confirm validators detect broken invariants:
- Shifting incenter `I` fails `incircle_positive` and `incircle_tangency`.
- Multiplying `Ki.area` by `4` fails `four_circle_areas` and `central_sqrt_identity`.
- Skewing vertex `Qc.Bc` fails `squares_construction` and `square_circles_tangency`.

### Section 6: Current-State Spectral Analysis Metrics
Verifies `computeFourCirclesSpectralAnalysis(calc)` on `(4, 3)`:
- Exact 4 items (`Ka, Kb, Kc, Ki`),
- Area sum and percentage shares summing to `100%`,
- Perimeter consistency $P = 2\pi R$ and $D = 2R$, positivity and finiteness,
- Leg-swap symmetry `Ka(3,4) === Kb(4,3)`.

### Section 7: Parametric Spectral Graph & Synchronization (`t = 0.1, 0.5, 1, 2, 10`)
For each reference ratio $t \in \{0.1, 0.5, 1.0, 2.0, 10.0\}$:
- Compares `evaluateParametricFourCircles(t)` against independently computed reference formulas for `c`, `r`, Mode A (`Ka/Kc, Kb/Kc, Kc/Kc, Ki/Kc`), Mode B (`Pa/Pc, Pb/Pc, Pc/Pc, Pi/Pc`), and Mode C (`Ra/Rc, Rb/Rc, Rc/Rc, Ri/Rc` and `Da/Dc, Db/Dc, Dc/Dc, Di/Dc`).
- Verifies `Ka + Kb = Kc` (`Ka/Kc + Kb/Kc = 1`) and central identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ (`identityResidualAbs ≈ 0`).
- Verifies Mode C normalized radius curves and normalized diameter curves coincide (`radii[k] === diameters[k] === perimeters[k]`).
- Verifies positivity of all radii/areas and finiteness of all normalized values.
- Verifies exact symmetry values at $t = 1$: $K_a/K_c = K_b/K_c = 0.5$, $K_i/K_c = 3 - 2\sqrt{2}$, $R_a/R_c = R_b/R_c = 1/\sqrt{2}$.
- Verifies `sampleSpectralCurves` explicitly includes $t = 1$ in the sampled curve.
- Verifies synchronization round-trip: `legsFromRatioAndHypotenuse(t, 5)` $\to$ `calculateFourCircles(a, b)` $\to$ `computeFourCirclesSpectralAnalysis` matches `evaluateParametricFourCircles(t)` and preserves $b / a = t$.

### Section 8: Regression Tests (`t <-> 1/t` Symmetry & Sweep Trajectory Stability)
- Verifies exact values at the symmetry axis $t = 1$ ($K_a/K_c = K_b/K_c = 0.5$, $K_i/K_c = 3 - 2\sqrt{2}$, $P_i/P_c = R_i/R_c = \sqrt{2} - 1$).
- Verifies reciprocal leg-swap symmetry $t \leftrightarrow 1/t$ across $t \in \{0.1, 0.25, 0.2989, 0.5, 2.0, 4.0, 10.0\}$ for areas, perimeters, and radii.
- Verifies `isAtSymmetryAxis` and exact $t = 1$ fixed-point trajectory handling (`evaluateSymmetryTrajectoryT(1, p) === 1`) plus finite safe fallback on invalid inputs.
- Verifies smooth monotonic log-space sweep $t_{\text{start}} \to 1/t_{\text{start}} \to t_{\text{start}}$ crossing $t = 1$ and maintaining all 8 geometry invariants across dense progress steps.

### Section 9: Thales Circumcircle ($K_o$) & Five-Circle Integration Tests
- **Control & Pythagorean Triples (`(3,4,5)`, `(5,12,13)`, `(4,4,4√2)`, `(8,15,17)`):** Verifies $D_o = c$, $R_o = c/2$, $K_o = \pi c^2/4$, $L_o = \pi c$, $O_o = (b/2, a/2)$, vertex equidistance $|O_o - A| = |O_o - B| = |O_o - O| = R_o$, $\angle AOB = 90^\circ$, and $K_o = K_c$ with distinct centers $|O_o - O_c| = c/2 > 0$.
- **Shifted & Rotated General Right Triangle:** Verifies `calculateThalesCircumcircleFromVertices(A, B, C)` at $C = (10, -4)$ rotated by $\theta = 0.63\text{ rad}$, proving $O_o = \frac{A+B}{2}$ is computed from actual endpoints rather than hardcoded.
- **Extreme Aspect & Scale Stability:** Runs all 9 Thales and 17 combined invariants on `(0.2, 15)`, `(15, 0.2)`, `(1e-4, 2e-4)`, `(1e6, 2e6)`, confirming `validateFourCirclesInvariants` stays unchanged at 8.
- **Leg-Swap Symmetry:** Confirms $(3, 9) \leftrightarrow (9, 3)$ preserves $D_o, R_o, K_o, L_o$ and reflects $O_o$ coordinates ($x \leftrightarrow y$).
- **Parametric Invariance & Monotonic Growth:** Verifies constant `thalesNorm` ratios across $t \in [0.05, 20]$, strict monotonicity of `thalesAbs` ($R_o^*, D_o^*, K_o^*, L_o^*$), 4-item core `spectral.items` backward compatibility + `circumcircleItem`, and `sampleThalesAbsoluteCurves`.
- **Negative Input & Mutation Guards:** Confirms `RangeError` on `NaN` vertices, coincident $A = B$, and $t \le 0$ or `NaN`; confirms shifting $O_o$ fails `thales_dist_A`, `thales_dist_B`, and `thales_dist_C`.

---

## 4. Desirable Future Tests (Not Yet Implemented)

1. **React Component & DOM Interaction Tests (e.g., Vitest + React Testing Library):** Automated UI tests simulating pointer scrubbing on `SpectralAnalysisPanel`'s SVG plot, clicking mode tabs, toggling linear/log scales, and dragging vertices `A`/`B` on `GeometryBoard`.
2. **End-to-End Browser Visual Verification (Playwright):** Automated headless browser checks across desktop and mobile viewports verifying SVG layout, KaTeX rendering, PNG/SVG export downloads, and zero console errors.
3. **Property-Based / Fuzz Testing:** Randomized sampling across $t \in (10^{-6}, 10^6)$ and $(a, b)$ scales to stress-test `legsFromRatioAndHypotenuse` and graph sampling edge cases.
