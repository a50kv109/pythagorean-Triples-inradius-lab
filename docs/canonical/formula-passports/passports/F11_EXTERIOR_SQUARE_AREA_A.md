# Formula Passport: F11 — Exterior Square Area $Q_a$

1. `formula_id`: `F11`
2. `formula_name`: Area of Exterior Square $Q_a$
3. `mathematical_domain`: Euclidean Geometry
4. `canonical_expression`: $\operatorname{Area}(Q_a) = a_{\text{c}}^2$
5. `source_expression`: `sideLength * sideLength` (`buildCanonicalSquareA(sideA)`)
6. `semantic_description`: Calculates the area of exterior square $Q_a$ constructed outwardly on side `sideA` ($BC$, quadrant IV in Canonical Core).
7. `symbol_registry`:
   - $\operatorname{Area}(Q_a)$: Area of geometric square $Q_a$
   - $a_{\text{c}}$ (`sideA`): Length of $BC$ (in runtime `SquareConstruction.ts`, `calculateSquareA(a)` constructs `squareA` on vertical leg $OA = a_{\text{leg}}$, while `calculateSquareB(b)` corresponds to Canonical $Q_a$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0$
10. `output_variables`: $\operatorname{Area}(Q_a) > 0$
11. `applicability_conditions`: Exterior square layer on leg `sideA`.
12. `constraints`: $a_{\text{c}} \in \mathbb{R}^+$
13. `dependencies`: None (Base input)
14. `mathematical_derivation`: Area of a Euclidean square of side length $a_{\text{c}}$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalSquareA`), `src/math/SquareConstruction.ts` (`calculateSquareA` / `calculateSquareB` via `legacyMapping.ts`)
18. `numerical_considerations`: Direct squaring.
