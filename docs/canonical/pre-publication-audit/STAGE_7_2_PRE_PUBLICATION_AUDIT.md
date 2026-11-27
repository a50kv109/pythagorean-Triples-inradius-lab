# Stage 7.2 — Detailed Pre-Publication Canonical Audit Report

**Project:** Pythagoras Circles — Canonical Geometry Research Laboratory  
**Proposed GitHub Repository Name:** `pythagoras-circles-canon-geometry-lab`  
**Audit Date:** 2026-11-27  
**Scope Constraint:** Documentation reconciliation & audit only — no modifications made to `.ts`/`.tsx` application code, mathematical formulas, UI components, or test files.

---

## Classification Legend
- **`PASS`** — Verified directly against existing source code/builds/tests with zero issues.
- **`FIXED`** — Discrepancy discovered in documentation/metadata/archive cleanliness and resolved during Stage 7.2 reconciliation.
- **`WARNING`** — Verified non-blocking limitation in source code, UI, test configuration, or build output documented transparently without altering code.
- **`BLOCKER`** — Critical barrier preventing canonical publication (none remain).
- **`NOT VERIFIED`** — Claim or behavior not tested/observed directly.

---

## 1. Repository Identity and Metadata — `FIXED`

- **Findings Prior to Stage 7.2:**
  - `package.json` used `"name": "pythagoras-circles-lab"`, `index.html` titled the page `"Pythagoras — Four Circles | Экспериментальная лаборатория"`, `metadata.json` had `"Pythagoras — Four Circles (Канонический ремикс)"`, and root `README.md`/`README_RU.md` described only the legacy 5-module `Pythagoras-Circles-Lab` structure.
- **Reconciliation Applied:**
  - Updated `package.json`, `index.html` (`<title>`, `meta[name="description"]`, `og:title`, `og:description`), `metadata.json`, `README.md`, and `README_RU.md` to the unified canonical identity:
    - English: **Pythagoras Circles — Canonical Geometry Research Laboratory**
    - Russian: **Лаборатория математических кругов Пифагора — Каноническая геометрическая лаборатория**
    - Proposed slug: `pythagoras-circles-canon-geometry-lab`
- **Residual Note (`WARNING`):** Automated GitHub repository creation/renaming via remote git push was intentionally not executed; the user creates/publishes under `pythagoras-circles-canon-geometry-lab` on GitHub.

---

## 2. Canonical Documentation (`docs/canonical/*`) — `FIXED`

- **Findings Prior to Stage 7.2:**
  - `05_CANONICAL_ARCHITECTURE.md` referenced non-existent paths (`src/math/geometry.ts`, `tests/`).
  - `01_CANONICAL_OVERVIEW.md` and `05_CANONICAL_ARCHITECTURE.md` understated module count or omitted the `RU / UK / EN` localization scope and Exp 01–06 module coverage.
  - `04_CANONICAL_INTERNAL_TRIANGLE_NAMING.md` blended opposite-side canonical subscripts with `IncenterPartition.ts` leg-indexed subscripts.
- **Reconciliation Applied:**
  - Reconciled all 12 files (`README.md`, `01`–`11`) in `docs/canonical/` to match the actual `src/` tree, 9 workspace modules (`01`–`09`) + Incenter Partition, `src/canonical/` core, `src/math/experiments/` (Exp 01–06), and 16 test files.

---

## 3. Notation Standard & Dual-Frame Consistency — `FIXED`

- **Verified Dual-Frame Structure:**
  1. **Canonical Opposite-Side Frame (`src/canonical/canonicalFourCircles.ts`, `CANONICAL_OPPOSITE_SIDE_V1`):**
     Right angle at $C(0,0)$, $A(0, \text{sideB})$, $B(\text{sideA}, 0)$; $\text{sideA} = |BC|$ (opposite $A$), $\text{sideB} = |AC|$ (opposite $B$); shape ratio $\rho = \text{sideA}/\text{sideB} = \tan\alpha$; `subtriangleAreaA` $= \frac{1}{2}\text{sideA}\cdot r$ ($\triangle IBC$), `subtriangleAreaB` $= \frac{1}{2}\text{sideB}\cdot r$ ($\triangle IAC$).
  2. **Runtime UI Leg-Indexed Frame (`src/math/RightTriangle.ts`, `FourCirclesModel.ts`, `IncenterPartition.ts`):**
     Right angle at $O(0,0)$ (aliased `C` in `IncenterPartition.ts`), $A(0, a)$, $B(b, 0)$ with `a = |OA|`, `b = |OB|`; ratio $t = b/a$; `IncenterPartition.ts` assigns `SA` $= \frac{1}{2}a r$ ($\triangle CAI$) and `SB` $= \frac{1}{2}b r$ ($\triangle CBI$).
  3. **Experiment 06 (`src/math/experiments/arcSideAreaCorrespondence.ts`):**
     Uses opposite-side sub-triangle indexing (`S_a` on $OB$, `S_b` on $OA$, `S_c` on $AB$), consistent with `CANONICAL_OPPOSITE_SIDE_V1`.
- **Reconciliation Applied:** Documented the exact algebraic bridge (`sideA === b`, `sideB === a`, `SA === subtriangleAreaB`, `SB === subtriangleAreaA`, $\rho \equiv t$) across `02`, `03`, `04`, `NOTATION_PROFILE.md`, and passports `F07`, `F08`, `F11`, `F12`, `F14`, `F15`, `F18`, `F19`.

---

## 4. Formula Passports (`docs/canonical/formula-passports/*`) — `FIXED`

- **Audit Results:**
  - All 19 core passports (`F01`–`F19`), `FORMULA_INVENTORY.md`, `FORMULA_DEPENDENCY_GRAPH.md`, `notation/NOTATION_PROFILE.md`, and `audit/AUDIT_REPORT.md` now reference verified `src/` files and real `src/tests/` test evidence.
  - `F07` and `F08` explicitly resolve the `subtriangleAreaA`/`B` vs. `IncenterPartition.ts` `SA`/`SB` indexing mapping.
- **Scope Disclosure (`WARNING`):**
  - `F01`–`F19` formalize the 19 foundational right-triangle, incircle, incenter-partition, square, circle-radius, Thales, and shape-ratio formulas. Additional implemented formulas (the central $\sqrt{K}$ identity, area contrast, circle areas/circumferences, $\lambda$-scaling, spectral ratios, and Experiments 01–06 laws `L-01`–`L-07`) are implemented in `src/` and documented in `02_CANONICAL_MATHEMATICAL_MODEL.md` and `06_CANONICAL_SPECTRAL_ANALYSIS.md` (and in legacy passports in `docs/FORMULA_PASSPORTS.md` and `docs/semantic-formula-passports/`), rather than numbered `F20+` inside Stage 7.1.

---

## 5. Canonical Source Implementation (`src/canonical/*`) — `PASS`

- Verified files on disk:
  - `src/canonical/types.ts`
  - `src/canonical/canonicalFourCircles.ts`
  - `src/canonical/canonicalValidators.ts` (8 scale-normalized canonical invariants)
  - `src/canonical/semanticContract.ts` (`CANONICAL_SHAPE_RATIO_PASSPORT`, `evaluateCanonicalSpectralByShapeRatio`)
  - `src/canonical/legacyMapping.ts` (`assertCanonicalLegacyEquivalence`)
  - `src/canonical/index.ts`
- **Path Clarification:** An earlier reference mentioned `src/math/semanticContract.ts`; the actual verified path in the codebase is **`src/canonical/semanticContract.ts`**.
- **Verification:** All 6 canonical test files in `src/tests/canonical/` execute and pass without errors.

---

## 6. Runtime Mathematical Engine & Experiments (`src/math/*`) — `PASS`

- Core modules verified: `FourCirclesModel.ts`, `RightTriangle.ts`, `SquareConstruction.ts`, `ThalesCircumcircle.ts`, `FourCirclesSpectralAnalysis.ts`, `IncenterPartition.ts`, `FourCirclesValidators.ts` (8 invariants), `ThalesValidators.ts` (9 invariants; 17 total in `validateAllFiveCirclesInvariants`), `inputValidation.ts`, `presets.ts`, `symmetryAnimation.ts`.
- All 6 experimental modules in `src/math/experiments/` (`circleFirstClassification.ts`, `arcBasedClassification.ts`, `arcGeometricValidation.ts`, `arcAngleParametricAnalysis.ts`, `incircleArcDistribution.ts`, `arcSideAreaCorrespondence.ts`) execute cleanly and pass their dedicated unit/audit test suites.

---

## 7. Spectral Panels, Synchronization & Localization (`src/components/*`) — `WARNING`

1. **Module 04 Main Spectral Panel (`src/components/panels/SpectralAnalysisPanel.tsx`) — `PASS`:**
   - All five modes (`Areas`, `Perimeters`, `Radii/Diameters`, `Abs. Growth K_o(t)`, `Scale λ`) sample points directly from `sampleSpectralCurves`, `sampleThalesAbsoluteCurves`, and `sampleThalesScaleCurves`.
   - Bidirectional synchronization between `GeometryBoard` dragging and `SpectralAnalysisPanel` scrubbing (`handleChangeT`, `handleChangeLambda`) is fully wired in `App.tsx`.
2. **Incenter Partition Spectral Sub-Panel (`src/components/geometry/IncenterPartitionSpectralPanel.tsx`) — `WARNING`:**
   - **Static Bézier SVG Paths (lines 160–204):** All four graph tabs (`areas`, `dimensions`, `angles`, `ratios`) render hardcoded quadratic Bézier strings rather than model-computed sample arrays.
   - **Area-Based Marker Y Positions Across Tabs (lines 39–42, 219–245):** While `cursorPixelX` updates dynamically from `currentLambda` (`[0.2, 4.0]`) or `currentRho` (`[0.2, 5.0]`), all three colored dots (`ySA`, `ySB`, `ySC`) compute Y coordinates from sub-triangle areas even when `dimensions`, `angles`, or `ratios` tabs are selected.
   - **Hardcoded Residual Banner (line 267):** Renders computed `areaSum.toFixed(3)` and `triangleArea.toFixed(3)` alongside literal `(Δ = 0.000)` instead of `partition.identityDeltaArea` *(whereas `IncenterPartitionControls.tsx` displays the actual computed delta)*.
3. **Partial Trilingual Coverage (`src/i18n/translations.ts` vs. Incenter Sub-Controls) — `WARNING`:**
   - `translations.ts` fully supports `ru`, `uk`, and `en` across the main UI and 9 modules, while `IncenterPartitionControls.tsx` and `IncenterPartitionSpectralPanel.tsx` contain hardcoded Russian strings.
4. **Browser/DOM Automated Testing — `NOT VERIFIED`:**
   - Automated DOM interaction tests (React Testing Library / Playwright) are not configured in this repository; UI checks are established via TypeScript compilation, static code inspection, and user/browser runtime verification.

---

## 8. Tests, TypeScript & Build Verification — `WARNING`

- `npx tsc --noEmit` (`npm run lint`): **`PASS`** (0 errors).
- `npm run build` (`vite build`): **`PASS`** (1710 modules transformed cleanly).
  - Pre-existing Vite warnings (`WARNING`): `vite.config.ts:22` `__dirname` notice in ESM config, and bundle chunk size > 500 kB (`dist/assets/index-*.js` ~1.21 MB due to KaTeX/UI bundle).
- `npm test`: **`PASS`**, but **Partial Coverage (`WARNING`)**: `package.json` runs only `geometry.test.ts` and `incenterPartition.test.ts` (2 of 16 test files).
- **All 16 Standalone Test Files (`npx tsx`):** **`PASS`** (`16/16` executed individually; see `VERIFICATION_MATRIX.md`).

---

## 9. Legacy Documentation & Temporary Files — `FIXED`

- **Legacy Documentation Preservation (`PASS`):** All pre-canonical documents under `/docs/` (`MATHEMATICAL_FOUNDATION.md`, `FORMULA_PASSPORTS.md`, `ARCHITECTURE.md`, `docs/architecture/`, `docs/audit/`, `docs/experiments/`, `docs/semantic-formula-passports/`, etc.) remain intact and are explicitly cross-referenced as historical reference documentation.
- **Archive Cleanup (`FIXED`):** Root archive `pythagoras-circles-lab-stage3.zip` was verified via `unzip -Z1` to contain **0 unique missing files** (pure snapshot from 2026-11-26 containing `.aistudio/artifacts/...` temporary media) and was deleted.

---

## 10. Remaining Publication Blockers & Final Recommendation

- **Critical Blockers Remaining (`BLOCKER`):** **None (`0`).**
- **Final Stage 7.2 Verdict:** **`READY WITH DOCUMENTED WARNINGS`**
  - **Rationale:** All builds, TypeScript checks, and all 16 automated mathematical/contract test files pass; metadata, READMEs, 12 canonical docs, and 19 UMFP formula passports are reconciled with the actual codebase; and the 4 non-blocking caveats (`IncenterPartitionSpectralPanel.tsx` illustrative curves/hardcoded `Δ = 0.000`, Russian-only labels in Incenter controls, `npm test` running 2/16 files, and Vite chunk/ESM notices) are explicitly documented so no reader is misled prior to a future Stage 8 code polish.
