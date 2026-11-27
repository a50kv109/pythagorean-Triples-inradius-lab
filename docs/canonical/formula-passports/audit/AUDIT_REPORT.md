# Canonical Formula Passports Audit Report (Stage 7.2 Reconciled)

## 1. Audit Summary
- **Audit Date:** 2026-11-27
- **Scope:** Passports `F01`–`F19` compared against `src/canonical/`, `src/math/`, and all 16 test files in `src/tests/`.
- **Methodology:** UMFP (Universal Mathematical Formula Passport) schema + Stage 7.2 code-to-documentation reconciliation.

## 2. Discrepancies Found & Resolved During Stage 7.2
1. **Nonexistent Source Path (`src/math/geometry.ts`) — FIXED:**
   Earlier drafts of `F01`–`F06` and `F11`–`F19` referenced `src/math/geometry.ts`. Replaced with verified modules (`src/canonical/canonicalFourCircles.ts`, `src/math/RightTriangle.ts`, `src/math/FourCirclesModel.ts`, `src/math/SquareConstruction.ts`, `src/math/ThalesCircumcircle.ts`, `src/canonical/semanticContract.ts`).
2. **$S_A / S_B$ Indexing Mismatch (`F07`–`F08`, `F05`, `F18`) — FIXED:**
   Earlier drafts mixed the canonical opposite-side frame with `IncenterPartition.ts`'s leg-indexed frame (writing $S_A = \frac{1}{2}br$ for $\triangle BCI$ while citing `IncenterPartition.ts` which computes `SA = 0.5 * a * r` on $\triangle CAI$). Both frames and their exact equivalence bridge (`legacyMapping.ts`) are now explicitly documented in `F07`, `F08`, `F18`, `02`, `03`, and `04`.
3. **Out-of-Scope Formula Disclosure — DOCUMENTED:**
   Passports `F01`–`F19` cover the 19 foundational triangle, incenter-partition, square, circle, Thales, and aspect-ratio formulas. Additional implemented formulas (central $\sqrt{K}$ identity, area contrast, spectral ratios, $\lambda$-scaling, and Exp 01–06 arc laws) exist in `src/math/` and `src/canonical/` and are documented in `02_CANONICAL_MATHEMATICAL_MODEL.md` and `FORMULA_INVENTORY.md`.

## 3. Verification Results
- **Analytical Proof (`PROVEN`):** Validated for all 19 formulas (`F01`–`F19`).
- **Computational Execution (`VERIFIED_COMPUTATIONALLY`):** Confirmed by `npm test` (`geometry.test.ts` + `incenterPartition.test.ts`) and all 14 additional test files in `src/tests/` executed via `npx tsx` on 2026-11-27.
