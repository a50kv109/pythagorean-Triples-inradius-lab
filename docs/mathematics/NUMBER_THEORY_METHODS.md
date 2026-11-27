# Number Theory Methods

**Project:** Pythagoras Circles — Canonical Geometry Research Laboratory  
**Milestone:** M2 Baseline

## 1. Prime Factorization & Lifting (`src/core/factorization/primeFactorization.ts`)

- **Prime Factorization (`factorizeBigInt`):**  
  Factors positive BigInt integers into canonical prime powers using:
  1. Extraction of powers of 2 via bit shifts.
  2. Deterministic wheel trial division ($6k \pm 1$) up to `trialDivisionLimit`.
  3. Perfect square extraction via exact BigInt square roots.
  4. Deterministic Pollard-Brent cycle finding with strict iteration (`maxPollardIterations`) and wall-clock (`maxDurationMs`) time budgets.

- **Factorization Lifting (`liftRadiusFactorizationToTwoRSquared`):**  
  Directly lifts the prime factorization of $r = 2^{e_0} \prod p_i^{e_i}$ to $2r^2 = 2^{2e_0+1} \prod p_i^{2e_i}$ without re-factoring.

## 2. Three-Tier Primality Certification (`src/core/factorization/primality.ts`)

- **`PROVEN_PRIME`:** Proved by trial division up to $\sqrt{n}$ or deterministic Miller-Rabin using the first 13 prime bases up to the Sorenson & Webster (2015) proven bound $n < 3{,}317{,}044{,}064{,}679{,}887{,}385{,}961{,}981 \approx 3.317 \times 10^{24}$.
- **`PROBABLE_PRIME`:** Assigned for $n \ge 3.317 \times 10^{24}$ after passing 25 deterministic Miller-Rabin rounds.
- **`UNFACTORED_COMPOSITE`:** Assigned when composite numbers cannot be fully factored within budget limits.

## 3. Divisors and Hyperbola Pairs (`src/core/factorization/divisors.ts`, `hyperbolaPairs.ts`)

- **Divisor Generation:** Generates all positive divisors sorted in ascending order from complete factorizations, verifying exact count $\tau(n)$ and divisibility $d \mid n$.
- **Hyperbola Pairs:** Constructs all unique canonical pairs $(x, y)$ satisfying $xy = 2r^2$ and $x^2 < 2r^2 < y^2$.
