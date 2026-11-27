# Formula Passport: F13 — Exterior Square Area $Q_c$

1. `formula_id`: `F13`
2. `formula_name`: Area of Exterior Square $Q_c$ on Hypotenuse $c$
3. `mathematical_domain`: Euclidean Geometry
4. `canonical_expression`: $\operatorname{Area}(Q_c) = c^2 = a_{\text{c}}^2 + b_{\text{c}}^2$
5. `source_expression`: `sideLength * sideLength` (`buildCanonicalSquareC`) / `c * c` (`calculateSquareC`)
6. `semantic_description`: Calculates the area of exterior square $Q_c$ constructed outwardly on hypotenuse $AB$ into quadrant I.
7. `symbol_registry`:
   - $\operatorname{Area}(Q_c)$: Area of hypotenuse square $Q_c$
   - $c$ (`sideC`): Hypotenuse length
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0$, $b_{\text{c}} > 0$ ($c = \sqrt{a_{\text{c}}^2 + b_{\text{c}}^2}$)
10. `output_variables`: $\operatorname{Area}(Q_c) > 0$
11. `applicability_conditions`: Exterior square layer on hypotenuse $AB$.
12. `constraints`: $\operatorname{Area}(Q_c) = \operatorname{Area}(Q_a) + \operatorname{Area}(Q_b)$
13. `dependencies`: F01 (Hypotenuse $c$)
14. `mathematical_derivation`: Square of hypotenuse $c$, equal to $a_{\text{c}}^2 + b_{\text{c}}^2$ by the Pythagorean theorem.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalSquareC`), `src/math/SquareConstruction.ts` (`calculateSquareC`)
18. `numerical_considerations`: Square construction verifies all 4 edges equal $c$ and diagonals equal $c\sqrt{2}$ within $10^{-9}$ relative tolerance (`canonicalValidators.ts`).
