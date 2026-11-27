# Formula Passport: F16 — Incircle Radius $r_c$ ($K_c$)

1. `formula_id`: `F16`
2. `formula_name`: Radius of Circle $K_c$ Inscribed in Square $Q_c$
3. `mathematical_domain`: Euclidean Geometry
4. `canonical_expression`: $r_c = \frac{c}{2}$
5. `source_expression`: `diameter / 2` (`buildCircleInSquare('Kc', squareC)`) / `c / 2` (`calculateFourCircles`)
6. `semantic_description`: Calculates the radius $r_c$ of circle $K_c$ inscribed inside exterior hypotenuse square $Q_c$.
7. `symbol_registry`:
   - $r_c$: Radius of $K_c$
   - $c$ (`sideC`): Hypotenuse length
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $c > 0$
10. `output_variables`: $r_c > 0$
11. `applicability_conditions`: Square-inscribed circle $K_c$ inside $Q_c$.
12. `constraints`: $r_c = R_o = c/2$ (identical radius to Thales circumcircle $K_o$, distinct center $|O_o - O_c| = c/2$)
13. `dependencies`: F01 (Hypotenuse $c$), F13 (Square $Q_c$)
14. `mathematical_derivation`: A circle inscribed in square $Q_c$ of side $c$ has diameter $c$ and radius $c/2$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCircleInSquare`), `src/math/FourCirclesModel.ts` (`calculateFourCircles`)
18. `numerical_considerations`: Exact floating-point division by 2.
