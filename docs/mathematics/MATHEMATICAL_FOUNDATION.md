# Mathematical Foundation

**Project:** Pythagoras Circles — Canonical Geometry Research Laboratory  
**Milestone:** M2 Baseline

## 1. Pythagorean Triples and Inradius

- **Pythagorean Equation:**  
  $$a^2 + b^2 = c^2, \qquad a, b, c \in \mathbb{N}, \quad 0 < a < b < c.$$

- **Inradius and Diameter:**  
  $$r = \frac{a + b - c}{2}, \qquad D = 2r = a + b - c.$$

- **Hyperbolic Factorization Identity (Clarke, 2005; Omland, 2017; Sporn, 2021):**  
  Let shift variables be $x = a - 2r = c - b$ and $y = b - 2r = c - a$. Then:
  $$(a - 2r)(b - 2r) = 2r^2 \quad \Longleftrightarrow \quad x \cdot y = 2r^2.$$

- **Reconstruction:**  
  $$a = 2r + x, \qquad b = 2r + y, \qquad c = 2r + x + y.$$

- **Canonical Bounds:**  
  $$1 \le x < \sqrt{2}\,r < y \le 2r^2.$$

## 2. Arithmetic Counters (Robbins, 2006; Omland, 2017)

Let canonical prime factorization of $r$ be $r = 2^{e_0} \prod_{i=1}^{s} p_i^{e_i}$.
- **Primitive Triple Count ($T(r)$):**  
  $$T(r) = 2^{\omega^*(r)} = 2^s,$$
  where $\omega^*(r)$ is the number of distinct odd prime factors of $r$.

- **Total Triple Count ($N(r)$):**  
  $$N(r) = \frac{\tau(2r^2)}{2} = (e_0 + 1)\prod_{i=1}^{s}(2e_i + 1) = \sum_{k \mid r} T\!\left(\frac{r}{k}\right).$$

- **Subclasses ($C_k(r)$):**  
  For each divisor $k \mid r$, the scaled sub-class $C_k(r)$ has cardinality $|C_k(r)| = T(r/k)$.
