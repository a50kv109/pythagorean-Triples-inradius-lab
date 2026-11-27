# 11 — Canonical Changelog

## v1.2.0 — Stage 7.2 Documentation Reconciliation (2026-11-27)
- **Project Identity Standardized:** Adopted *Pythagoras Circles — Canonical Geometry Research Laboratory* / *Лаборатория математических кругов Пифагора — Каноническая геометрическая лаборатория* (`pythagoras-circles-canon-geometry-lab`).
- **Source-of-Truth Alignment:** Replaced non-existent placeholder paths (`src/math/geometry.ts`, `tests/`) across `docs/canonical/` and `formula-passports/` with verified source paths (`src/canonical/`, `src/math/`, `src/tests/`).
- **Notation & Internal Partition Reconciliation:** Resolved the $S_A / S_B$ indexing discrepancy by documenting both `CANONICAL_OPPOSITE_SIDE_V1` (`canonicalFourCircles.ts`) and the runtime leg-indexed frame (`FourCirclesModel.ts`, `IncenterPartition.ts`) together with `legacyMapping.ts`.
- **Architecture & Language Update:** Updated `05_CANONICAL_ARCHITECTURE.md` to cover all 9 workspace modules, Experiments 01–06, Incenter Partition, and trilingual `RU / UK / EN` localization.
- **Spectral Panel Special Audit:** Transparently documented static Bézier curves and hardcoded `Δ = 0.000` in `IncenterPartitionSpectralPanel.tsx` vs. real computed curves in `SpectralAnalysisPanel.tsx`.
- **Verification Matrix:** Executed and cataloged all 16 test files (`src/tests/*.ts`, `src/tests/canonical/*.ts`), `tsc --noEmit`, and `vite build`, alongside `docs/canonical/pre-publication-audit/`.
- **Root Cleanup:** Removed temporary archive `pythagoras-circles-lab-stage3.zip` and aligned `README.md`, `README_RU.md`, `package.json`, `index.html`, and `metadata.json`.

## v1.2.0 — Stage 7 / 7.1 Initial Canonical Package & Formula Passports (2026-11-26)
- Established `docs/canonical/` and initial UMFP-style formula passports `F01`–`F19`.
