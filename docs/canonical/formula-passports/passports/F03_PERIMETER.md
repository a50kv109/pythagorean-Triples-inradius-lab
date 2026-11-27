# Formula Passport: F03 — Perimeter

1. `formula_id`: `F03`
2. `formula_name`: Perimeter of Triangle ABC
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $P = a_{\text{c}} + b_{\text{c}} + c$
5. `source_expression`: `sideA + sideB + sideC` / `validA + validB + c`
6. `semantic_description`: Calculates the perimeter $P$ as the sum of the three side lengths of $\triangle ABC$.
7. `symbol_registry`:
   - $P$: Triangle perimeter
   - $a_{\text{c}}, b_{\text{c}}$: Orthogonal legs
   - $c$: Hypotenuse length
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0$, $b_{\text{c}} > 0$, $c > 0$
10. `output_variables`: $P > 0$
11. `applicability_conditions`: Euclidean triangle $\triangle ABC$.
12. `constraints`: $a_{\text{c}}, b_{\text{c}}, c \in \mathbb{R}^+$
13. `dependencies`: F01 (Hypotenuse $c$)
14. `mathematical_derivation`: Definition of polygon perimeter $P = |BC| + |AC| + |AB|$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/incenterPartition.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalRightTriangle`), `src/math/RightTriangle.ts` (`calculateRightTriangle`)
18. `numerical_considerations`: All terms are strictly positive; no subtractive cancellation.
