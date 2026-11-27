# Formula Passport: F06 — Inradius

1. `formula_id`: `F06`
2. `formula_name`: Inradius of Right-Angled Triangle ABC
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $r = \frac{a_{\text{c}} b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c} = \frac{a_{\text{c}} + b_{\text{c}} - c}{2} = \frac{S}{p}$
5. `source_expression`: `(sideA / triangle.perimeter) * sideB` / `(validA / perimeter) * validB`
6. `semantic_description`: Calculates the inradius $r$ of the inscribed circle $K_i$ tangent to all three sides of $\triangle ABC$.
7. `symbol_registry`:
   - $r$: Inradius
   - $a_{\text{c}}, b_{\text{c}}$: Orthogonal legs; $c$: Hypotenuse
   - $S$: Triangle area; $p$: Semi-perimeter
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0, b_{\text{c}} > 0$
10. `output_variables`: $r > 0$
11. `applicability_conditions`: Right-angled triangle $\triangle ABC$.
12. `constraints`: $r > 0$
13. `dependencies`: F01, F02, F03
14. `mathematical_derivation`: From $S = p r \implies r = \frac{2S}{P} = \frac{a_{\text{c}} b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c}$. Rationalizing the denominator using $c^2 = a_{\text{c}}^2 + b_{\text{c}}^2$ yields $\frac{a_{\text{c}} b_{\text{c}}(a_{\text{c}}+b_{\text{c}}-c)}{(a_{\text{c}}+b_{\text{c}})^2 - c^2} = \frac{a_{\text{c}}+b_{\text{c}}-c}{2}$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/canonical/test04_numericalStability.canonical.test.ts` (extreme ratios $1:10^4$, micro $10^{-6}$, macro $10^6$).
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`), `src/math/FourCirclesModel.ts` (`calculateFourCircles`)
18. `numerical_considerations`: Implemented as `(a / (a + b + c)) * b` instead of `(a + b - c) / 2` to avoid catastrophic subtractive cancellation when $a \ll b$ or $b \ll a$, and to avoid $a \cdot b$ overflow at large scales.
