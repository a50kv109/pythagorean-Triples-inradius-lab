# Formula Passport: F01 — Hypotenuse Length

1. `formula_id`: `F01`
2. `formula_name`: Hypotenuse Length of Right-Angled Triangle
3. `mathematical_domain`: Euclidean Geometry / Pythagorean Theorem
4. `canonical_expression`: $c = \sqrt{a_{\text{c}}^2 + b_{\text{c}}^2}$
5. `source_expression`: `Math.hypot(sideA, sideB)` / `Math.hypot(validA, validB)`
6. `semantic_description`: Calculates the length of hypotenuse $c = |AB|$ opposite the $90^\circ$ angle, given orthogonal legs $a_{\text{c}}$ and $b_{\text{c}}$.
7. `symbol_registry`:
   - $c$ (`sideC`): Hypotenuse $|AB|$
   - $a_{\text{c}}$ (`sideA`): Horizontal leg $|BC|$ opposite $A$ (runtime UI: `b = |OB|`)
   - $b_{\text{c}}$ (`sideB`): Vertical leg $|AC|$ opposite $B$ (runtime UI: `a = |OA|`)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0$, $b_{\text{c}} > 0$ (finite)
10. `output_variables`: $c > 0$
11. `applicability_conditions`: Euclidean right triangle $\triangle ABC$ with $\gamma = 90^\circ$.
12. `constraints`: $a_{\text{c}}, b_{\text{c}} \in \mathbb{R}^+$ (validated via `assertValidCanonicalSides` / `assertValidLegs`)
13. `dependencies`: None (Base formula)
14. `mathematical_derivation`: Direct corollary of the Pythagorean theorem ($a_{\text{c}}^2 + b_{\text{c}}^2 = c^2$ with $c > 0$).
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`, `src/tests/canonical/test04_numericalStability.canonical.test.ts` (tested across $(3,4,5)$, $(5,12,13)$, $(4,4,4\sqrt{2})$, $(1,10,\sqrt{101})$, micro $10^{-6}$, macro $10^{6}$).
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`buildCanonicalRightTriangle`), `src/math/RightTriangle.ts` (`calculateRightTriangle`)
18. `numerical_considerations`: Uses IEEE-754 `Math.hypot` to prevent intermediate squaring overflow/underflow at extreme scales.
