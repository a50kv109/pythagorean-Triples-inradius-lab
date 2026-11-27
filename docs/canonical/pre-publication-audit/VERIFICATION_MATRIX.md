# Stage 7.2 Verification Matrix

**Repository:** `pythagoras-circles-canon-geometry-lab`  
**Verification Date:** 2026-11-27  
**Runtime Environment:** Node.js + `tsx` + TypeScript (`tsc --noEmit`) + Vite 8 (`vite build`)

---

## 1. Build, Static Type-Check & Script Summary

| Check | Command | Scope | Result | Notes |
| :--- | :--- | :--- | :---: | :--- |
| TypeScript Static Check | `npx tsc --noEmit` (`npm run lint`) | Full `src/` codebase | **PASS** | 0 errors |
| Production Build | `npm run build` | Vite bundle (`1710` modules) | **PASS** | Emits pre-existing Vite notices (`__dirname` in `vite.config.ts:22`, JS chunk ~1.21 MB > 500 kB) |
| Default Test Script | `npm test` | `geometry.test.ts` + `incenterPartition.test.ts` | **PASS** | Covers **2 / 16** test files (`WARNING`: remaining 14 require direct `npx tsx`) |
| Full Standalone Test Run | `for f in src/tests/*.test.ts src/tests/canonical/*.test.ts; do npx tsx "$f"; done` | All **16 / 16** executable test files | **PASS** | Every test file passes independently with exit code `0` |
| Automated Browser/DOM Suite | — | Interactive DOM / pointer drag / visual pixels | **NOT VERIFIED** | No Playwright / Vitest DOM harness configured in repository |

---

## 2. Complete Executable Test File Matrix (`16 / 16 PASS`)

| # | Test File | In `npm test`? | Execution Command | Status | Verified Scope |
| :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | `src/tests/geometry.test.ts` | **Yes** | `npx tsx src/tests/geometry.test.ts` | **PASS** | 4 circles, $\sqrt{K}$ identity, area contrast, Thales $K_o$, spectral ratios, leg-swap symmetry, $\lambda$ scaling, extreme scales |
| 2 | `src/tests/incenterPartition.test.ts` | **Yes** | `npx tsx src/tests/incenterPartition.test.ts` | **PASS** | $S_A, S_B, S_C$, $S = S_A+S_B+S_C = pr$, vertex connectivity, $r$ equidistance, scaling |
| 3 | `src/tests/canonical/test01_controlTriangles.canonical.test.ts` | No | `npx tsx src/tests/canonical/test01_controlTriangles.canonical.test.ts` | **PASS** | Canonical opposite-side control triangles & equivalence with runtime core |
| 4 | `src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` | No | `npx tsx src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` | **PASS** | Canonical leg-swap symmetry & opposite-side invariance |
| 5 | `src/tests/canonical/test03_inputValidation.canonical.test.ts` | No | `npx tsx src/tests/canonical/test03_inputValidation.canonical.test.ts` | **PASS** | Canonical domain validation (`<= 0`, `NaN`, `Infinity`) |
| 6 | `src/tests/canonical/test04_numericalStability.canonical.test.ts` | No | `npx tsx src/tests/canonical/test04_numericalStability.canonical.test.ts` | **PASS** | Canonical micro/macro & high-asymmetry IEEE-754 stability |
| 7 | `src/tests/canonical/semanticContract.canonical.test.ts` | No | `npx tsx src/tests/canonical/semanticContract.canonical.test.ts` | **PASS** | `CANONICAL_SHAPE_RATIO_PASSPORT`, $\rho = \text{sideA}/\text{sideB}$, sub-triangle shares |
| 8 | `src/tests/canonical/experiment06.strictRootAudit.test.ts` | No | `npx tsx src/tests/canonical/experiment06.strictRootAudit.test.ts` | **PASS** | Strict canonical audit of Experiment 06 opposite-side correspondence |
| 9 | `src/tests/experiment01.circleFirst.test.ts` | No | `npx tsx src/tests/experiment01.circleFirst.test.ts` | **PASS** | Exp 01 incircle-first $(r, t)$ parameterization |
| 10 | `src/tests/experiment02.arcBased.test.ts` | No | `npx tsx src/tests/experiment02.arcBased.test.ts` | **PASS** | Exp 02 angular/linear quarter-arc classification |
| 11 | `src/tests/experiment03.geometricValidation.test.ts` | No | `npx tsx src/tests/experiment03.geometricValidation.test.ts` | **PASS** | Exp 03 tangency & geometric residual checks |
| 12 | `src/tests/experiment04.arcAngle.test.ts` | No | `npx tsx src/tests/experiment04.arcAngle.test.ts` | **PASS** | Exp 04 arc-angle zones & scale invariance |
| 13 | `src/tests/experiment05.incircleArcDistribution.test.ts` | No | `npx tsx src/tests/experiment05.incircleArcDistribution.test.ts` | **PASS** | Exp 05 central arcs $\varphi_A + \varphi_B + \varphi_C = 2\pi$ |
| 14 | `src/tests/experiment06.arcSideArea.test.ts` | No | `npx tsx src/tests/experiment06.arcSideArea.test.ts` | **PASS** | Exp 06 laws `L-01`–`L-07` |
| 15 | `src/tests/experiment06.audit.test.ts` | No | `npx tsx src/tests/experiment06.audit.test.ts` | **PASS** | Exp 06 correspondence & residual audit |
| 16 | `src/tests/semanticFormulaPassports.test.ts` | No | `npx tsx src/tests/semanticFormulaPassports.test.ts` | **PASS** | Semantic formula passport consistency checks |

*Shared non-runner helper:* `src/tests/canonical/testHelpers.ts`.

---

## 3. Codebase-to-Documentation Link & Integrity Checks

- **Archive Hygiene:** `pythagoras-circles-lab-stage3.zip` verified redundant (0 unique files missing from workspace) and removed prior to final verification.
- **No Source Code Mutated:** `src/*.ts`, `src/*.tsx`, and `src/index.css` remain untouched during Stage 7.2.
