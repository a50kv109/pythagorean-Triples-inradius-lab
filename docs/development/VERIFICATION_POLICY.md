# Verification Policy

**Project:** Pythagoras Circles — Canonical Geometry Research Laboratory  
**Milestone:** M2 Baseline

## 1. Core Verification Principles

- **Exact Arithmetic:** All mathematical core routines (`src/core/exact/`, `src/core/factorization/`) operate strictly on native `BigInt` and immutable exact rationals (`ExactRational`). Floating-point approximations are forbidden in computational logic.
- **Separation of Concerns:** Exact number theory and geometric calculations are cleanly separated from visual floating-point screen rendering and charting (`M7`).
- **Primality Separation:** Probable primality (`PROBABLE_PRIME`) is never conflated with proven primality (`PROVEN_PRIME`). Results involving probable primes are explicitly flagged.
- **Incomplete Computation Handling:** Incomplete factorizations or timed-out Pollard-Brent runs are reported explicitly as `INCOMPLETE` with diagnostic warnings; they are never masked as successful completions.
- **Golden Benchmarks & Regression Tests:** The test suite (`npm test`) verifies golden benchmark totals for $r = 1\dots 30$ ($T=61, N=174$) and $r = 1\dots 100$ ($T=249, N=855$), alongside M1 and legacy geometry tests.
