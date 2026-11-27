# 01 — Canonical Overview: Pythagoras Circles — Canonical Geometry Research Laboratory

## 1. Project Passport
- **Canonical English Title:** Pythagoras Circles — Canonical Geometry Research Laboratory
- **Canonical Russian Title:** Лаборатория математических кругов Пифагора — Каноническая геометрическая лаборатория
- **Proposed GitHub Repository Slug:** `pythagoras-circles-canon-geometry-lab`
- **Version:** `1.2.0`
- **Architecture Standard:** Canonical First (with explicit semantic equivalence bridge to the runtime leg-indexed UI model)
- **Core Domain:** Euclidean geometry of right-angled triangles, exterior squares, square-inscribed circles, triangle incircle, Thales circumcircle, incenter triangle partition, parametric spectral ratio/scale analysis, and arc-based geometric experiments.

## 2. Research & Educational Purpose
The laboratory provides a deterministic, interactive mathematical research environment for studying the geometric and algebraic relationships connecting a Euclidean right triangle to five associated circles, three exterior squares, and the incenter partition:
- Central linear-scale four-circle identity: $\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$, contrasted against quadratic area non-equality $\operatorname{Area}(K_a) + \operatorname{Area}(K_b) - \operatorname{Area}(K_c) - \operatorname{Area}(K_i) = -\operatorname{Area}(K_i) < 0$.
- Incenter triangle partition identity: $S = S_A + S_B + S_C = p \cdot r$.
- Thales circumcircle $K_o$ structural identity with hypotenuse circle $K_c$ ($\operatorname{Area}(K_o) = \operatorname{Area}(K_c)$, $C_o = C_c$, $|O_o - O_c| = c/2 > 0$).
- Orthogonal two-parameter exploration of triangle shape ($\rho$ / $t$) and uniform scale ($\lambda = c/5$).
- Incircle-first and arc-based geometric classification and parametric correspondence (Experiments 01–06).

## 3. Core Geometric Objects
1. **Right-Angled Triangle ($\triangle ABC$)**:
   - **Canonical Opposite-Side Frame (`src/canonical/canonicalFourCircles.ts`)**: Right angle at $C(0,0)$ ($\gamma = 90^\circ$), $A(0, \text{sideB})$, $B(\text{sideA}, 0)$, with $\text{sideA} = |BC|$ opposite $A$, $\text{sideB} = |AC|$ opposite $B$, hypotenuse $\text{sideC} = |AB| = \sqrt{\text{sideA}^2 + \text{sideB}^2}$.
   - **Runtime UI Frame (`src/math/RightTriangle.ts`, `src/math/FourCirclesModel.ts`)**: Right angle at $O(0,0)$, $A(0, a)$, $B(b, 0)$, vertical leg $a = |OA|$, horizontal leg $b = |OB|$, hypotenuse $c = |AB| = \sqrt{a^2 + b^2}$. Bridged to the canonical frame via `src/canonical/legacyMapping.ts` (`sideA === b`, `sideB === a`).
2. **Exterior Squares ($Q_a, Q_b, Q_c$)**: Squares constructed externally on the two legs and hypotenuse.
3. **Square-Inscribed Circles ($K_a, K_b, K_c$)**: Circles inscribed inside $Q_a, Q_b, Q_c$ with diameters equal to the respective side lengths.
4. **Triangle Incircle ($K_i$)**: Inscribed circle of the right triangle centered at incenter $I(r, r)$ with inradius $r = \frac{ab}{a + b + c} = \frac{a + b - c}{2} = p - c$.
5. **Incenter Partition Layer (`src/math/IncenterPartition.ts`)**: Decomposition of the triangle into three sub-triangles sharing incenter $I$ and common altitude $r$ to the three sides.
6. **Thales Circumcircle ($K_o$)**: Circumscribed circle passing through $A, B,$ and the right-angle vertex ($C$ / $O$) with diameter equal to the hypotenuse and center at the hypotenuse midpoint.

## 4. Implemented Functional Capabilities
- **Interactive SVG Scene (`src/components/geometry/GeometryBoard.tsx`)**: Draggable vertices $A$ (along $+Oy$) and $B$ (along $+Ox$), arc tangency dragging ($T_{AB}$ in arc modules), pan/zoom, layer filters, construction animation, and PNG/SVG export.
- **Nine Analytical Workspace Modules (`src/App.tsx`, `src/components/common/Header.tsx`)**:
  1. `01. Four Circles` (`four_circles`)
  2. `02. √K Identity` (`identity_proof`)
  3. `03. Incircle Kᵢ` (`incircle_focus`)
  4. `04. Spectral Analysis` (`spectral_analysis`)
  5. `05. Thales Circle Kₒ` (`thales_circumcircle`)
  6. `06. Arc Classification` (`arc_classification`)
  7. `07. Arc & Angles` (`arc_angle_analysis`)
  8. `08. Three Arcs Kᵢ` (`incircle_arc_distribution`)
  9. `09. Arc–Side–Area` (`arc_side_area`)
- **Incenter Partition Overlay & Controls**: Interactive SVG overlay + floating panel (`geometric`, `proof` [7 steps], and `spectral` [illustrative preview] modes).
- **Trilingual UI**: Full **Russian (`ru`)**, **Ukrainian (`uk`)**, and **English (`en`)** localization in `src/i18n/translations.ts`. (Note: `IncenterPartitionControls.tsx` and `IncenterPartitionSpectralPanel.tsx` currently contain Russian-only hardcoded UI labels.)
- **Live Invariant Checking & Presets**: 17 live scale-normalized checks (`validateAllFiveCirclesInvariants`) in `InvariantsPanel.tsx` and `TestRunnerModal.tsx`, side-by-side comparison (`ComparisonModal.tsx`), Undo/Redo, and JSON save/load.

## 5. Principles of Canonical Architecture & Applicability Bounds
- **Strict Separation of Concerns**: Pure mathematical kernels (`src/canonical/`, `src/math/`) contain no DOM or React dependencies.
- **Boundary of Applicability**: All models require finite positive side lengths ($a, b > 0$). Non-positive, `NaN`, or non-finite inputs are rejected by `assertValidCanonicalSides` and `assertValidLegs`. UI leg sliders/drag clamp inputs to $[0.2, 15]$ (or $[0.1, 150]$ in arc-driven mode).
- **Truthfulness of Evidence**: Analytical derivations (`PROVEN`) are kept strictly distinct from floating-point checks (`VERIFIED_COMPUTATIONALLY`) and illustrative UI visualizations (such as static Bézier previews in `IncenterPartitionSpectralPanel.tsx`).
