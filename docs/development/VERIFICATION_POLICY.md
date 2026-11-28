# Verification Policy

**Project:** Pythagoras Triples Inradius Classification Laboratory  
**Milestone:** M4 Baseline (M1–M4 Completed)

## 1. Core Verification Principles

- **Exact Arithmetic:** All discrete core routines (`src/core/exact/`, `src/core/factorization/`, `src/core/classification/`, `src/core/facets/`) operate strictly on native `BigInt` and immutable exact rationals (`ExactRational`). Floating-point approximations (`Math.*`, `Number()`, `parseFloat`, `parseInt`) and `BigInt`-to-`number` conversions are forbidden in computational logic.
- **Separation of Concerns:** Exact number-theoretic, classification, and facet calculations are cleanly separated from legacy continuous geometry models (`src/math/`) and visual screen rendering (`M7`).
- **Primality & Completeness Safety:** Probable primality (`PROBABLE_PRIME`) is never conflated with proven primality (`PROVEN_PRIME`). Incomplete factorizations or classifications (`isComplete === false`) are reported explicitly and rejected across M4 (`INCOMPLETE_CLASSIFICATION_RESULT`) rather than masked as complete profiles.
- **Population Isolation (M4-S3):** Class aggregates strictly separate all triples ($N(r)$) from primitive triples ($T(r)$); Berggren depth bounds are computed strictly on primitive triples ($k = 1$).
- **Golden Benchmarks & Regression Tests:** The automated suite (`npm test`, 8 test scripts) verifies golden totals for $r = 1\dots 30$ ($T=61, N=174$), $r = 1\dots 50$ ($110$ unique Berggren primitive paths), $r = 1\dots 100$ ($T=249, N=855$), and $r = 1\dots 120$ ($120$ classes, $N=1098, T=311$), alongside M1, M2, M3, and legacy geometry suites. See [`M4_VERIFICATION_AND_TESTS.md`](M4_VERIFICATION_AND_TESTS.md).
