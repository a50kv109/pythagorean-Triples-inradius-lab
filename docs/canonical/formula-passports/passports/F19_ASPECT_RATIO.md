# Formula Passport: F19 — Shape Ratio Parameter $\rho$

1. `formula_id`: `F19`
2. `formula_name`: Canonical Shape Ratio ($\rho \equiv \text{shapeRatio}$)
3. `mathematical_domain`: Parametric Geometry
4. `canonical_expression`: $\rho = \frac{a_{\text{c}}}{b_{\text{c}}} = \frac{|BC|}{|AC|} = \tan\alpha = \cot\beta \equiv t = \frac{b_{\text{leg}}}{a_{\text{leg}}}$
5. `source_expression`: `sideA / sideB` (`computeCanonicalShapeRatio`, `buildCanonicalRightTriangle`) / `calc.triangle.b / calc.triangle.a` (`t` in `FourCirclesSpectralAnalysis.ts`)
6. `semantic_description`: Calculates the dimensionless, scale-invariant shape ratio $\rho$ (equivalent to runtime $t = b_{\text{leg}}/a_{\text{leg}}$) that parameterizes all normalized spectral curves.
7. `symbol_registry`:
   - $\rho$ (`shapeRatio`): Dimensionless shape ratio
   - $a_{\text{c}}$ (`sideA`): Opposite $A$ ($|BC|$); $b_{\text{c}}$ (`sideB`): Opposite $B$ ($|AC|$)
   - $t$: Legacy/runtime symbol for $b_{\text{leg}} / a_{\text{leg}} = |OB| / |OA|$
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03 & `semanticContract.ts`)
9. `input_variables`: $a_{\text{c}} > 0$, $b_{\text{c}} > 0$
10. `output_variables`: $\rho \in (0, +\infty)$
11. `applicability_conditions`: Non-degenerate right triangle ($a_{\text{c}}, b_{\text{c}} > 0$).
12. `constraints`: Degree-0 homogeneous under uniform scaling $\lambda > 0$; under $a_{\text{c}} \leftrightarrow b_{\text{c}}$, $\rho \mapsto 1/\rho$; $\rho = 1$ marks the isosceles symmetry axis.
13. `dependencies`: None (directly from orthogonal legs)
14. `mathematical_derivation`: In right triangle $\triangle ABC$ with $\gamma = 90^\circ$, $\tan\alpha = \frac{\text{opposite}}{\text{adjacent}} = \frac{|BC|}{|AC|} = \frac{a_{\text{c}}}{b_{\text{c}}}$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/canonical/semanticContract.canonical.test.ts`, `src/tests/geometry.test.ts` (Sections 7, 8, and spectral parametric tests)
17. `implementation_reference`: `src/canonical/semanticContract.ts` (`CANONICAL_SHAPE_RATIO_PASSPORT`, `computeCanonicalShapeRatio`), `src/canonical/canonicalFourCircles.ts`, `src/math/FourCirclesSpectralAnalysis.ts`
18. `numerical_considerations`: Division protected against zero/non-finite inputs by `assertValidCanonicalSide`.
