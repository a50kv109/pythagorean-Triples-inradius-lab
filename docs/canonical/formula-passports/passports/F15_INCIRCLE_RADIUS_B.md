# Formula Passport: F15 — Incircle Radius $r_b$ ($K_b$)

1. `formula_id`: `F15`
2. `formula_name`: Radius of Circle $K_b$ Inscribed in Square $Q_b$
3. `mathematical_domain`: Euclidean Geometry
4. `canonical_expression`: $r_b = \frac{b_{\text{c}}}{2}$
5. `source_expression`: `diameter / 2` (`buildCircleInSquare('Kb', squareB)`)
6. `semantic_description`: Calculates the radius $r_b$ of circle $K_b$ inscribed inside exterior square $Q_b$ (diameter equals side length $b_{\text{c}}$).
7. `symbol_registry`:
   - $r_b$: Radius of $K_b$
   - $b_{\text{c}}$ (`sideB`): Side length of $Q_b$ (in `FourCirclesModel.ts`, `circleA` corresponds to Canonical $K_b$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $b_{\text{c}} > 0$
10. `output_variables`: $r_b > 0$
11. `applicability_conditions`: Square-inscribed circle $K_b$ inside $Q_b$.
12. `constraints`: $r_b = b_{\text{c}} / 2$
13. `dependencies`: F12 (Square $Q_b$)
14. `mathematical_derivation`: A circle inscribed in a square of side $b_{\text{c}}$ has diameter $b_{\text{c}}$ and radius $b_{\text{c}}/2$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCircleInSquare`), `src/math/FourCirclesModel.ts` (`calculateFourCircles`)
18. `numerical_considerations`: Exact floating-point division by 2.
