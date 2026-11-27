# Formula Passport: F04 — Semi-perimeter

1. `formula_id`: `F04`
2. `formula_name`: Semi-perimeter of Triangle ABC
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $p = \frac{a_{\text{c}} + b_{\text{c}} + c}{2} = \frac{P}{2}$
5. `source_expression`: `perimeter / 2`
6. `semantic_description`: Calculates the semi-perimeter $p$ (half of perimeter $P$), central to the identity $S = p r$.
7. `symbol_registry`:
   - $p$: Semi-perimeter
   - $P$: Perimeter
   - $a_{\text{c}}, b_{\text{c}}, c$: Side lengths
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $P > 0$
10. `output_variables`: $p > 0$
11. `applicability_conditions`: Euclidean triangle $\triangle ABC$.
12. `constraints`: $p > c > 0$
13. `dependencies`: F03 (Perimeter $P$)
14. `mathematical_derivation`: Direct definition $p = P / 2$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/incenterPartition.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalRightTriangle`), `src/math/IncenterPartition.ts` (`calculateIncenterPartition`)
18. `numerical_considerations`: Exact binary floating-point scaling by $1/2$.
