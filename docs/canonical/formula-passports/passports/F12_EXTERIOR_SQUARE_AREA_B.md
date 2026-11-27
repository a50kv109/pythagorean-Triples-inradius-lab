# Formula Passport: F12 — Exterior Square Area $Q_b$

1. `formula_id`: `F12`
2. `formula_name`: Area of Exterior Square $Q_b$
3. `mathematical_domain`: Euclidean Geometry
4. `canonical_expression`: $\operatorname{Area}(Q_b) = b_{\text{c}}^2$
5. `source_expression`: `sideLength * sideLength` (`buildCanonicalSquareB(sideB)`)
6. `semantic_description`: Calculates the area of exterior square $Q_b$ constructed outwardly on side `sideB` ($AC$, quadrant II in Canonical Core).
7. `symbol_registry`:
   - $\operatorname{Area}(Q_b)$: Area of geometric square $Q_b$
   - $b_{\text{c}}$ (`sideB`): Length of $AC$ (in runtime `SquareConstruction.ts`, `calculateSquareA(a)` corresponds geometrically to Canonical $Q_b$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $b_{\text{c}} > 0$
10. `output_variables`: $\operatorname{Area}(Q_b) > 0$
11. `applicability_conditions`: Exterior square layer on leg `sideB`.
12. `constraints`: $b_{\text{c}} \in \mathbb{R}^+$
13. `dependencies`: None (Base input)
14. `mathematical_derivation`: Area of a Euclidean square of side length $b_{\text{c}}$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalSquareB`), `src/math/SquareConstruction.ts` (`calculateSquareB` / `calculateSquareA` via `legacyMapping.ts`)
18. `numerical_considerations`: Direct squaring.
