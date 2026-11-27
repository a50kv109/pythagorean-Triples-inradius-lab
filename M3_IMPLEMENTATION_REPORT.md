# M3 Implementation Report — Classification Engine

**Project:** Pythagorean Triples Inradius Classification Laboratory  
**Milestone:** M3 — Classification Engine  
**Status:** IMPLEMENTED, TESTED, AND VERIFIED  

---

## 1. Implemented Modules

Under `src/core/classification/`:
1. **`errors.ts`**: Custom error hierarchy (`ClassificationError`, `InvalidTripleError`, `EuclideanRecoveryError`, `SubclassMismatchError`).
2. **`types.ts`**: TypeScript definitions for `PythagoreanTriple`, `PrimitiveAncestor`, `EuclideanParameters`, `SubclassGroup`, and `RadiusClassificationResult`.
3. **`reconstructTriple.ts`**: Exact BigInt triple reconstruction from canonical hyperbola divisor pairs $(x, y)$, enforcing identity checks and canonical leg ordering $a < b$.
4. **`recoverEuclideanParameters.ts`**: Extraction and validation of Euclidean generation parameters $(m, n, u, v)$ from primitive components $(x_0, y_0)$.
5. **`classifyTriple.ts`**: Complete triple classification including scale factor $k = \gcd(a, b, c)$, primality flag, primitive ancestor, standard identifiers (`class_id`, `triple_id`, `prim_id`), and Euclidean recovery.
6. **`buildSubclasses.ts`**: Partition construction $C(r) = \bigsqcup_{k \mid r} C_k(r)$, comparing actual versus expected cardinality $|C_k(r)| = T(r/k)$ and total $N(r)$.
7. **`classifyRadius.ts`**: Top-level API entry point for radius classification.
8. **`index.ts`**: Public barrel exports.

Additionally, completed the M2 stabilization follow-up in `src/core/factorization/hyperbolaPairs.ts` to strictly validate that every supplied divisor of $2r^2$ is positive, divides $2r^2$, is unique, and is in strict ascending order, accompanied by a regression test for tampered divisors.

---

## 2. Public API

- `classifyRadius(r: bigint): RadiusClassificationResult`
- `buildSubclasses(r: bigint): RadiusClassificationResult`
- `classifyTriple(r: bigint, x: bigint, y: bigint): PythagoreanTriple`
- `reconstructTriple(r: bigint, x: bigint, y: bigint): ReconstructedTriple`
- `recoverEuclideanParameters(x0: bigint, y0: bigint): EuclideanParameters`

---

## 3. Mathematical Invariants Enforced

1. **Exact BigInt Arithmetic**: Zero floating-point calculations (`Math.*`, `Number()`) in the classification core.
2. **Pythagorean Identity**: $a^2 + b^2 = c^2$ verified for every reconstructed triple.
3. **Inradius Identity**: $\frac{a + b - c}{2} = r$ verified exactly.
4. **Hyperbola Identity**: $x \cdot y = 2r^2$ verified via M1 exact verification primitives.
5. **Canonical Leg Ordering**: $a < b$ enforced.
6. **Scale Factor & Subclass Partition**: $k = \gcd(a, b, c) = \gcd(x, y)$ with $k \mid r$, and exact cardinality match $|C_k(r)| = T(r/k)$.
7. **Euclidean Parameter Validation**: Exact integer square roots, $m > n > 0$, $\gcd(m, n) = 1$, and opposite parity for $m$ and $n$.

---

## 4. Test Cases & Verification Results

- **Unit Test Suite (`src/tests/core/classificationM3.test.ts`)**:
  - **Isolation Check**: Verified zero `Math.*`, `Number()`, React, or unauthorized cross-module coupling.
  - **Radius $r = 1$**: Confirmed triple $(3, 4, 5)$, $N(1) = 1, T(1) = 1$, single subclass $k = 1$.
  - **Radius $r = 3$**: Confirmed triples $(7, 24, 25)$, $(8, 15, 17)$, $(9, 12, 15)$, $N(3) = 3, T(3) = 2$, subclass cardinalities and primitive ancestor $(3, 4, 5)$.
  - **Radii $r = 2, 6, 15, 30$**: Confirmed complete subclass partitioning and cardinality matches.
  - **Error Paths**: Verified rejection of invalid hyperbola pairs, malformed primitive components, and non-opposite parity.
  - **Systematic Property Invariants ($r = 1 \dots 20$)**: Verified $a^2+b^2=c^2$, $(a+b-c)/2=r$, $xy=2r^2$, and primitive ancestor scaling across all generated triples.

---

## 5. Limitations

- Enumeration limits on extremely large radii where $2r^2$ divisor count exceeds safe memory/combinatorial bounds (handled gracefully via M2 combinatorial guard `COMBINATORIAL_LIMIT_EXCEEDED`).

---

## 6. Scope Confirmation

**Explicit confirmation:** M4 (Structural Analysis), M5 (Passports & Matrices), Berggren tree traversal, Sporn transformations, common-side families, and new UI panels were **NOT** implemented in M3.
