# 07 — Canonical Interaction Model

## 1. Interactive Manipulation Mechanics (`src/App.tsx`, `GeometryBoard.tsx`)
- **Vertex Dragging:** Users drag vertex $A(0, a)$ vertically along $+Oy$ (`onChangeA`) or vertex $B(b, 0)$ horizontally along $+Ox$ (`onChangeB`). Inputs are sanitized and clamped in `App.tsx` (`clampVal`: finite values in $[0.2, 15]$ rounded to $10^{-6}$).
- **Arc Tangency Dragging (Experiments 02–05):** In arc-based modules, users can drag the hypotenuse tangency point $T_{AB}$ along the quarter-circle arc (`onChangeArcPhi`), updating `(a, b)` via `triangleFromPhysicalArcAngle` (clamped to $[0.1, 150]$).
- **Uniform Scaling ($\lambda$):** `handleChangeLambda` scales both legs proportionally around the current shape ratio $t = b/a$ using reference scale $\lambda = c / 5.0$.
- **Shape Sweeps ($t$ / $\rho$):** `handleChangeT` computes `(a, b)` from target ratio $t$ and current hypotenuse $c$ via `legsFromRatioAndHypotenuse`.

## 2. Workspace Modes, Layer Filters & Overlays
- **Nine Top-Bar Workspace Modules (`Header.tsx`):**
  `four_circles`, `identity_proof`, `incircle_focus`, `spectral_analysis`, `thales_circumcircle`, `arc_classification`, `arc_angle_analysis`, `incircle_arc_distribution`, `arc_side_area`.
- **Board Layer Filters (`BoardLayerFilter`):**
  `all`, `triangle_incircle`, `squares`, `square_circles`, `four_circles_only`, `thales_only`, `five_circles`.
- **Incenter Partition Layer (`IncenterPartitionOverlay.tsx` & `IncenterPartitionControls.tsx`):**
  Toggled via the `Разбиение через I` (`incenterPartition`) chip on `GeometryBoard`, offering three sub-modes (`geometric`, `proof` with 7 interactive steps and auto-play, and `spectral` preview) and visibility toggles for segments, fills, radii, labels, and numeric values.

## 3. Session Tools, History & Export (`BottomToolbar.tsx`)
- **Undo / Redo:** Up to 40 snapshots in `historyState` (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Y`, `Ctrl/Cmd+Shift+Z`).
- **Presets & Persistence:** 6 preset triangles (`FOUR_CIRCLES_PRESETS`), JSON configuration save/load (`localStorage` + file import/export), comparison modal (`ComparisonModal.tsx`), live test runner modal (`TestRunnerModal.tsx`), and PNG/SVG canvas export.
- **Trilingual Switching:** Instant switching between `RU`, `UK`, and `EN` (`TRANSLATIONS[lang]`), synchronized to `document.documentElement.lang`.
