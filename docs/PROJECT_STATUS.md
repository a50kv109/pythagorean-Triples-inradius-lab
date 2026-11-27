# Project Status — Four-Circles Pythagorean Geometry Lab

This document summarizes the verified current state of the repository based on direct inspection of the source code, test suite, and build configuration.

---

## 1. Implemented

- **Deterministic Five-Layer Geometry Core (`src/math/`):**
  - Right triangle geometry (`RightTriangle.ts`), three exterior squares (`SquareConstruction.ts`), three square-inscribed circles $K_a, K_b, K_c$, cancellation-free triangle incircle $K_i$ (`FourCirclesModel.ts`), input contract (`inputValidation.ts`), and presets (`presets.ts`).
  - Fifth dynamic geometric layer: **Thales Circumcircle $K_o$** (`ThalesCircumcircle.ts`) computed strictly from actual hypotenuse endpoints $A, B$, preserving all four-circle identities untouched.
  - Scale-normalized validation of 8 core invariants (`FourCirclesValidators.ts`) + 9 Thales invariants (`ThalesValidators.ts`, `validateAllFiveCirclesInvariants` = `17/17`).
  - **Two-Parameter Orthogonal Model ($t, \lambda$):** Decouples triangle shape ($t = b/a \in \mathbb{R}_{>0}$) and scale ($\lambda = c / 5.0 \in \mathbb{R}_{>0}$, `scaleTriangleGeometry`, `sampleThalesScaleCurves`), proving the Homogeneity Law ($D, R, L, r \sim \lambda^1$, $K, S \sim \lambda^2$) and universal invariance of the central identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$.
- **Interactive Parametric Analysis (`FourCirclesSpectralAnalysis.ts`, `SpectralAnalysisPanel.tsx`):**
  - Dimensionless $t = b/a$ model evaluation via `calculateFourCircles(1, t)`.
  - Interactive SVG Cartesian function plot with 3 normalized modes (Areas, Perimeters, Radii/Diameters with Radius/Diameter switch + optional `K_o` overlay), `Abs. Growth K_o(t)` unnormalized growth curves, and the dedicated **`Масштаб λ`** (Scale $\lambda$) mode visualizing the Homogeneity Law across $\lambda \in [0.2, 2.5]$.
  - Logarithmic/linear horizontal axis toggle, zoom/reset (`[0.1, 10]`), symmetry line $t = 1$, reference scale line $\lambda = 1.0$, symmetry sweep animation, clickable reference ratio and scale cards (`t = 0.1, 0.5, 1.0, 2.0, 10.0` and $\lambda = 0.2, 0.5, 1.0, 1.5, 2.0$), live `(a,b)` vs. `(1,t)` vs. invariant table, scale degree-of-homogeneity table, and 5-circle synchronized readout table.
  - Bidirectional synchronization with `App.tsx` via `handleChangeT` and `handleChangeLambda`.
- **Interactive Geometry Board & Research Tools:**
  - Dragging vertices $A(0,a)$ and $B(b,0)$, pan/zoom, layer filters (`all`, `triangle_incircle`, `squares`, `square_circles`, `four_circles_only`, `thales_only`, `five_circles`), `K_o` toggle, hover inspection (`GeometryBoard.tsx`, `FourCirclesView.tsx`, `RightTriangleView.tsx`, `CoordinateGrid.tsx`).
  - Dedicated Module `05. Thales Circle Kₒ` (`ThalesCircumcirclePanel.tsx`) with dynamic $\lambda$ slider and similarity table, reusable $K_c$ vs. $K_o$ comparison (`KcVsKoComparison.tsx`), live identity & 17-invariant observers (`FourCirclesPanel.tsx`, `InvariantsPanel.tsx`), 5-circle comparison (`ComparisonModal.tsx`), interactive test runner (`TestRunnerModal.tsx`), help modal (`HelpModal.tsx`), Undo/Redo, JSON save/load, PNG/SVG export, and 6-step build animation (`BottomToolbar.tsx`).

---

## 2. Tested

Verified by executing `npm test`, `npm run lint`, and `npm run build`:
- All 10 test sections in `src/tests/geometry.test.ts` pass at tolerance `1e-9` (control triangles, leg-swap symmetry, invalid input rejection, extreme micro/macro/aspect stability, validator mutation tests, current-state spectral metrics, parametric graph + synchronization checks at $t = 0.1, 0.5, 1.0, 2.0, 10.0$, $t \leftrightarrow 1/t$ symmetry / log-space animation regressions, Section 9 Thales Circumcircle $K_o$ & Five-Circle integration checks, and Section 10 Scale Parameter $\lambda$ & Homogeneity Law verification tests).
- `tsc --noEmit` completes with zero TypeScript errors.
- `vite build` produces a clean production bundle in `dist/`.

---

## 3. Documented

- Bilingual READMEs: `README.md` (English) and `README_RU.md` (Russian).
- Complete mathematical & parametric foundation: `docs/MATHEMATICAL_FOUNDATION.md` and `docs/MATHEMATICAL_PROOFS.md`.
- Verified software architecture: `docs/ARCHITECTURE.md`.
- User guide, verification reference, status report, release readiness report, and roadmap: `docs/USER_GUIDE.md`, `docs/VERIFICATION_AND_TESTING.md`, `docs/PROJECT_STATUS.md`, `docs/RELEASE_READINESS.md`, `docs/ROADMAP.md`.
- UMFP formula passports, DAG, proofs, numerical analysis, and verification matrix (`PCL-A01`–`PCL-G30`): `docs/FORMULA_PASSPORTS.md`, `docs/FORMULA_DEPENDENCY_GRAPH.md`, `docs/MATHEMATICAL_PROOFS.md`, `docs/NUMERICAL_ANALYSIS.md`, `docs/VERIFICATION_MATRIX.md` *(methodological conformance; no runtime UMFP engine dependency imported)*.

---

## 4. Not Yet Verified

1. **Automated Headless Browser / Visual E2E Testing:** No browser automation suite (Playwright/Cypress) or Chromium binary is installed in this execution environment; visual layout rendering, drag interactions on `GeometryBoard`, and graph scrubbing on `SpectralAnalysisPanel` have **not** been executed in a live headless browser (`NOT RUN`).
2. **Font CDN Accessibility Offline:** `katex/dist/katex.min.css` and all `.woff2`/`.woff`/`.ttf` KaTeX math fonts are now bundled locally into `dist/assets/` via Vite (`src/main.tsx`), eliminating runtime reliance on the external KaTeX CDN. Optional `Plus Jakarta Sans` / `JetBrains Mono` Google Fonts remain in `index.html` as progressive enhancement over local system sans/monospace fallbacks in `src/index.css`.

---

## 5. Repository Hygiene & Cleanup Status

1. **Full `RU / UK / EN` Interface Localization:** `src/i18n/translations.ts` covers all UI components (`Header`, `BottomToolbar` including Load popover, `GeometryBoard` tooltips/controls, `ControlsPanel` including presets, `FourCirclesPanel`, `ThalesCircumcirclePanel`, `KcVsKoComparison`, `SpectralAnalysisPanel`, `InvariantsPanel`, `ComparisonModal`, `TestRunnerModal`, and `HelpModal`) without altering existing four-circle mathematical formulas or Sections 1–8 tests.
2. **Responsive CSS Improvements:** Added `h-dvh` root viewport sizing, mobile canvas height floor adjustment (`min-h-[260px] lg:min-h-[400px]`), horizontal table scroll wrappers (`overflow-x-auto`), mobile-centered toolbar popover (`max-w-[calc(100vw-2rem)]`), and responsive summary grids (`grid-cols-2 sm:grid-cols-5`). *(Code-inspected; visual verification pending in real browser.)*
3. **Legacy Upstream v1.0 Documentation Archived:** The five legacy files from the earlier prototype (`INVARIANT_PROOFS_v1.0.md`, `MATHEMATICAL_FOUNDATION_v1.0.md`, `MATHEMATICAL_SPEC_v1.0.md`, `NUMERICAL_ANALYSIS_v1.0.md`, `VERIFICATION_MATRIX_v1.0.md`) remain unmodified inside [`docs/archive/legacy-pythagorean-pants/`](archive/legacy-pythagorean-pants/) as archival provenance; unused session screenshot assets under `public/assets/aistudio/` were removed, and `docs/assets/four-circles-diagram.svg` provides an original geometric diagram.
4. **Cleaned Dependencies & Lockfile (`package.json`, `bun.lock`):**
   - Unused template dependencies (`@google/genai`, `express`, `dotenv`, `canvas-confetti`, `motion`, `@types/express`, `@types/canvas-confetti`) have been removed.
   - `bun.lock` (`"name": "pythagoras-circles-lab"`) serves as the single authoritative lockfile and passes `bun install --frozen-lockfile`.
5. **Project Metadata & Environment Template:** `package.json` (`"name": "pythagoras-circles-lab"`), `metadata.json` (`"name": "Pythagoras-Circles-Lab — Four-Circles Pythagorean Geometry Lab"`, unused `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` removed), `index.html`, and `.env.example` (no secret API keys required) are aligned cleanly.
6. **License & Provenance:** The repository is licensed under the **MIT License** (`LICENSE`, `Copyright (c) 2026 Andrey Artsybashev`), matching `"license": "MIT"` in `package.json`, `README.md`, `README_RU.md`, and `SPDX-License-Identifier: MIT` headers across all `.ts`/`.tsx` files in `src/`. All runtime dependencies imported in `src/` (`react`, `react-dom`, `katex`, `lucide-react`) use permissive MIT or ISC licenses.
