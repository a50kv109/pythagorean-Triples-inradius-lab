# Formula Passport: F02 — Triangle Area

1. `formula_id`: `F02`
2. `formula_name`: Area of Right-Angled Triangle
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $S = \frac{1}{2} a_{\text{c}} b_{\text{c}}$
5. `source_expression`: `0.5 * sideA * sideB` / `(validA * validB) / 2`
6. `semantic_description`: Calculates the area $S$ of right-angled triangle $\triangle ABC$ from its orthogonal legs $a_{\text{c}}$ and $b_{\text{c}}$.
7. `symbol_registry`:
   - $S$: Total triangle area
   - $a_{\text{c}}, b_{\text{c}}$: Orthogonal leg lengths
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0$, $b_{\text{c}} > 0$
10. `output_variables`: $S > 0$
11. `applicability_conditions`: Right-angled triangle $\triangle ABC$ ($\gamma = 90^\circ$).
12. `constraints`: $a_{\text{c}}, b_{\text{c}} \in \mathbb{R}^+$
13. `dependencies`: None (Base formula)
14. `mathematical_derivation`: Half the product of base and perpendicular altitude, where one leg acts as base and the other as altitude.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/incenterPartition.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalRightTriangle`), `src/math/RightTriangle.ts` (`calculateRightTriangle`)
18. `numerical_considerations`: Direct IEEE-754 floating-point product; invariant under $a_{\text{c}} \leftrightarrow b_{\text{c}}$.
