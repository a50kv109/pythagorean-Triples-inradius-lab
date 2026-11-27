# 06 — Canonical Spectral Analysis Laboratory

## 1. Terminology & Architecture Overview
The application implements parametric graphical ratio and scale analysis across two distinct UI panels and two mathematical kernels:
1. **Main Parametric Spectral Module (`04. Spectral Analysis`)**: Backed by `src/math/FourCirclesSpectralAnalysis.ts`, `src/math/ThalesCircumcircle.ts`, `src/math/symmetryAnimation.ts`, and `src/components/panels/SpectralAnalysisPanel.tsx`.
2. **Canonical Semantic Spectrum (`src/canonical/semanticContract.ts`)**: Pure canonical evaluator `evaluateCanonicalSpectralByShapeRatio(shapeRatio)` parameterized by $\rho = \text{sideA} / \text{sideB}$ (`CANONICAL_SHAPE_RATIO_PASSPORT`).
3. **Incenter Partition Spectral Sub-Panel (`src/components/geometry/IncenterPartitionSpectralPanel.tsx`)**: An experimental sub-panel inside `IncenterPartitionControls.tsx` whose curves and footer residual are currently **illustrative UI placeholders** (see Section 4 Special Audit).

---

## 2. Main Parametric Spectral Curves (`SpectralAnalysisPanel.tsx` & `FourCirclesSpectralAnalysis.ts`)

All plots in Module 04 are genuinely sampled from the mathematical model via `sampleSpectralCurves`, `sampleThalesAbsoluteCurves`, and `sampleThalesScaleCurves`:

| Mode | Plotted Functions | Independent Variable | Normalization / Scale | Source Function |
| :--- | :--- | :--- | :--- | :--- |
| **A — Areas** | $K_a(t)/K_c(t),\; K_b(t)/K_c(t),\; K_c(t)/K_c(t)=1,\; K_i(t)/K_c(t)$ (+ optional $K_o/K_c=1$) | $t = b/a \in [t_{\min}, t_{\max}]$ (default $[0.1, 10]$) | Dimensionless ratio to $K_c$ | `evaluateParametricFourCircles` |
| **B — Perimeters** | $P_a(t)/P_c(t),\; P_b(t)/P_c(t),\; P_c(t)/P_c(t)=1,\; P_i(t)/P_c(t)$ (+ optional $L_o/L_c=1$) | $t = b/a$ | Dimensionless ratio to $P_c$ | `evaluateParametricFourCircles` |
| **C — Radii / Diameters** | $R_x(t)/R_c(t)$ or $D_x(t)/D_c(t)$ (+ optional $R_o/c=0.5$ or $D_o/c=1$) | $t = b/a$ | Dimensionless ratio to $R_c$ or $c$ | `evaluateParametricFourCircles` |
| **D — Abs. Growth $K_o(t)$** | Unnormalized unit-leg ($a=1, b=t$) curves $R_o^*(t), D_o^*(t), L_o^*(t), K_o^*(t)$ | $t = b/a$ | Unit-leg absolute scale ($a=1$) | `sampleThalesAbsoluteCurves` |
| **E — Scale $\lambda$** | Homogeneity curves: $D_o, R_o, L_o \propto \lambda^1$ (linear) and $K_o, K_i \propto \lambda^2$ (quadratic) | $\lambda = c/5 \in [0.2, 2.5]$ | Fixed shape ratio $t$, varying $\lambda$ | `sampleThalesScaleCurves` |

- **Axes & Controls:** Supports `log` ($\log_{10} t$, centering the symmetry axis $t = 1$) and `linear` horizontal axes, zoom in/out, reference markers (`0.1, 0.5, 1.0, 2.0, 10.0`), smooth symmetry sweep ($t \leftrightarrow 1/t$ via `evaluateSymmetryTrajectoryT`), and direct click/drag scrubbing on the SVG plot (`viewBox="0 0 640 300"`).
- **Bidirectional Synchronization:** Dragging $A$ or $B$ on `GeometryBoard` updates $t$ and $\lambda$ and moves the vertical cursor on `SpectralAnalysisPanel`; scrubbing the plot invokes `handleChangeT` / `handleChangeLambda` in `App.tsx`, updating the triangle and all five circles synchronously.

---

## 3. Canonical Semantic Spectrum (`src/canonical/semanticContract.ts`)

In `CANONICAL_OPPOSITE_SIDE_V1`, fixing $\text{sideB} = 1$ and $\text{sideA} = \rho$ yields:
$$\frac{\operatorname{Area}(K_a)}{\operatorname{Area}(K_c)} = \frac{\rho^2}{1+\rho^2}, \qquad \frac{\operatorname{Area}(K_b)}{\operatorname{Area}(K_c)} = \frac{1}{1+\rho^2}, \qquad \frac{\operatorname{Area}(K_i)}{\operatorname{Area}(K_c)} = \frac{(\rho + 1 - \sqrt{\rho^2 + 1})^2}{1+\rho^2}$$
Tested against legacy `evaluateParametricFourCircles(t)` (with $K_a \leftrightarrow K_b$ mapping) in `src/tests/canonical/semanticContract.canonical.test.ts`.

---

## 4. Special Audit Disclosure: `IncenterPartitionSpectralPanel.tsx`

Direct code inspection of `src/components/geometry/IncenterPartitionSpectralPanel.tsx` (lines 27–43 and 156–269) establishes the following **documented implementation limitations**:

1. **Static Illustrative Curves (Not Model-Sampled):**
   In lines 160–204, the SVG `<path>` elements for all four tabs (`areas`, `dimensions`, `angles`, `ratios`) use hardcoded quadratic Bézier strings (e.g., `d="M 15 150 Q 90 110 160 80 T 310 25"`), rather than points sampled from `calculateIncenterPartition`.
2. **Marker Positioning Across Tabs:**
   The vertical Live Cursor `cursorPixelX` dynamically maps `currentLambda` (`[0.2, 4.0]`) in `scale` mode or `currentRho` (`[0.2, 5.0]`) in `shape` mode to pixel X coordinates `[15, 295]`. However, the three marker circles (`ySA`, `ySB`, `ySC`, lines 40–42 and 219–245) are always derived from sub-triangle areas (`subTriangles.SA/SB/SC.area / maxArea`), regardless of whether the user selects `areas`, `dimensions`, `angles`, or `ratios`.
3. **Hardcoded Residual Label:**
   Line 267 displays the real computed `areaSum.toFixed(3)` and `triangleArea.toFixed(3)`, followed by the literal string `(Δ = 0.000)` instead of `partition.identityDeltaArea`. *(The actual numeric check `isExact` and `identityDeltaArea` are accurately computed in `src/math/IncenterPartition.ts` and displayed in `IncenterPartitionControls.tsx`'s numeric table.)*

**Audit Classification:** `WARNING` — documented transparently as an illustrative preview panel; analytical curve claims must rely on Module 04 (`SpectralAnalysisPanel.tsx`) and `IncenterPartition.ts` data until `IncenterPartitionSpectralPanel.tsx` is upgraded to real curve sampling in a future code stage.
