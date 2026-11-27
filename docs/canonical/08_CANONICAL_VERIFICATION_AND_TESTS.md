# 08 — Canonical Verification & Test Suite Registry

## 1. Epistemic Classification Standard
- **`PROVEN`**: Analytically derived Euclidean/algebraic identity (universal over stated domain $a, b > 0$).
- **`VERIFIED_COMPUTATIONALLY`**: Confirmed by executed automated assertions over finite test cases, sweeps, and IEEE-754 tolerances ($\Delta \le 10^{-9}$ or $10^{-11}$). Computational tests corroborate correctness within tested domains; they do **not** replace formal proof.
- **`WARNING` / `LIMITATION`**: Feature with partial UI/implementation caveats documented explicitly.
- **`NOT_VERIFIED`**: Unexecuted or unassessed claim.

---

## 2. Build, Type-Check & Test Command Inventory

### Standard Configured Commands (`package.json`)
| Command | Actual Scope Executed | Status (Verified 2026-11-27) |
| :--- | :--- | :--- |
| `npx tsc --noEmit` (`npm run lint`) | Full TypeScript static check across `src/` | **PASS** (0 errors) |
| `npm run build` (`vite build`) | Production client bundle (`1710` modules) | **PASS** (built in 1.23s) |
| `npm test` | Executes **only 2** of the 16 test files: `src/tests/geometry.test.ts` and `src/tests/incenterPartition.test.ts` | **PASS** (both files pass 100%) |

### Complete Test File Registry (16 Executable Files Discovered)

| Test File | Included in `npm test`? | Executed Directly (`npx tsx`)? | Result | Coverage |
| :--- | :---: | :---: | :---: | :--- |
| `src/tests/geometry.test.ts` | **Yes** | Yes | **PASS** | Sections 1–10: 4 circles, $\sqrt{K}$ identity, Thales $K_o$, spectral ratios, symmetry, $\lambda$ scaling |
| `src/tests/incenterPartition.test.ts` | **Yes** | Yes | **PASS** | Sub-triangles $S_A, S_B, S_C$, $S = S_A+S_B+S_C = pr$, vertex connectivity, $r$ equidistance |
| `src/tests/canonical/test01_controlTriangles.canonical.test.ts` | No | Yes | **PASS** | Canonical opposite-side control triangles & equivalence |
| `src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` | No | Yes | **PASS** | Canonical leg-swap invariance & opposite-side mapping |
| `src/tests/canonical/test03_inputValidation.canonical.test.ts` | No | Yes | **PASS** | Canonical input boundary guards (`InvalidCanonicalTriangleInputError`) |
| `src/tests/canonical/test04_numericalStability.canonical.test.ts` | No | Yes | **PASS** | Micro/macro & extreme ratio stability of canonical core |
| `src/tests/canonical/semanticContract.canonical.test.ts` | No | Yes | **PASS** | `CANONICAL_SHAPE_RATIO_PASSPORT`, $\rho = \text{sideA}/\text{sideB}$, sub-triangle shares |
| `src/tests/canonical/experiment06.strictRootAudit.test.ts` | No | Yes | **PASS** | Strict audit of Experiment 06 canonical correspondence |
| `src/tests/experiment01.circleFirst.test.ts` | No | Yes | **PASS** | Exp 01 incircle-first $(r, t)$ parameterization |
| `src/tests/experiment02.arcBased.test.ts` | No | Yes | **PASS** | Exp 02 angular/linear arc discretization |
| `src/tests/experiment03.geometricValidation.test.ts` | No | Yes | **PASS** | Exp 03 tangent line & geometric residual validation |
| `src/tests/experiment04.arcAngle.test.ts` | No | Yes | **PASS** | Exp 04 arc-angle parametric zones & scale invariance |
| `src/tests/experiment05.incircleArcDistribution.test.ts` | No | Yes | **PASS** | Exp 05 three-arc distribution $\varphi_A, \varphi_B, \varphi_C$ |
| `src/tests/experiment06.arcSideArea.test.ts` | No | Yes | **PASS** | Exp 06 laws `L-01`–`L-07` |
| `src/tests/experiment06.audit.test.ts` | No | Yes | **PASS** | Exp 06 mathematical & residual audit |
| `src/tests/semanticFormulaPassports.test.ts` | No | Yes | **PASS** | Validation of semantic formula passport records |

*(Note: `src/tests/canonical/testHelpers.ts` is a shared helper module, not a standalone test runner.)*

---

## 3. Known Verification Limitations
1. **`npm test` Partial Coverage:** By default `package.json` runs only 2 of the 16 test files; running all 16 requires invoking `npx tsx` on the remaining 14 files (see `pre-publication-audit/VERIFICATION_MATRIX.md`).
2. **Visual Sub-Panel Limitation:** `IncenterPartitionSpectralPanel.tsx` renders static Bézier paths and a hardcoded `(Δ = 0.000)` footer label; UI rendering of `IncenterPartitionSpectralPanel` is not covered by automated DOM/visual regression tests.
