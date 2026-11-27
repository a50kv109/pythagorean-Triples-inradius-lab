# Formula Passport: F14 — Incircle Radius $r_a$ ($K_a$)

1. `formula_id`: `F14`
2. `formula_name`: Radius of Circle $K_a$ Inscribed in Square $Q_a$
3. `mathematical_domain`: Euclidean Geometry
4. `canonical_expression`: $r_a = \frac{a_{\text{c}}}{2}$
5. `source_expression`: `diameter / 2` (`buildCircleInSquare('Ka', squareA)`)
6. `semantic_description`: Calculates the radius $r_a$ of circle $K_a$ inscribed inside exterior square $Q_a$ (diameter equals side length $a_{\text{c}}$).
7. `symbol_registry`:
   - $r_a$: Radius of $K_a$
   - $a_{\text{c}}$ (`sideA`): Side length of $Q_a$ (in `FourCirclesModel.ts`, `circleB` corresponds to Canonical $K_a$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0$
10. `output_variables`: $r_a > 0$
11. `applicability_conditions`: Square-inscribed circle $K_a$ inside $Q_a$.
12. `constraints`: $r_a = a_{\text{c}} / 2$
13. `dependencies`: F11 (Square $Q_a$)
14. `mathematical_derivation`: A circle inscribed in a square of side $a_{\text{c}}$ is tangent to all four edge midpoints, giving diameter $a_{\text{c}}$ and radius $a_{\text{c}}/2$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCircleInSquare`), `src/math/FourCirclesModel.ts` (`calculateFourCircles`)
18. `numerical_considerations`: Exact floating-point division by 2.
