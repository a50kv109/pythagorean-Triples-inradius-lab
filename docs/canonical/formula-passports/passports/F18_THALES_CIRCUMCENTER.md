# Formula Passport: F18 — Thales Circumcenter $O_o$ ($K_o$)

1. `formula_id`: `F18`
2. `formula_name`: Circumcenter Coordinates of Thales Circle $K_o$
3. `mathematical_domain`: Analytic Geometry / Thales's Theorem
4. `canonical_expression`: $O_o = \frac{A + B}{2} = \left(\frac{a_{\text{c}}}{2}, \frac{b_{\text{c}}}{2}\right)$
5. `source_expression`:
   - Canonical core: `{ x: sideA / 2, y: sideB / 2 }`
   - Vertex-generalized runtime: `{ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }` (evaluates to `(b_leg / 2, a_leg / 2)`)
6. `semantic_description`: Calculates the 2D coordinates of the Thales circumcenter $O_o$ as the midpoint of hypotenuse $AB$.
7. `symbol_registry`:
   - $O_o$: Thales circumcenter (distinct from $O_c$, the center of $Q_c / K_c$)
   - $A, B$: Hypotenuse endpoints
   - $a_{\text{c}}, b_{\text{c}}$: Canonical legs (runtime $b_{\text{leg}}, a_{\text{leg}}$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: Endpoints $A, B$ (or $a_{\text{c}}, b_{\text{c}} > 0$)
10. `output_variables`: 2D point $O_o$
11. `applicability_conditions`: Right triangle with hypotenuse $AB$.
12. `constraints`: Equidistant to $A, B,$ and the $90^\circ$ vertex; separated from $O_c$ by $|O_o - O_c| = c/2 > 0$.
13. `dependencies`: None (directly from $A, B$)
14. `mathematical_derivation`: Midpoint of $A(0, b_{\text{c}})$ and $B(a_{\text{c}}, 0)$ is $\left(\frac{0 + a_{\text{c}}}{2}, \frac{b_{\text{c}} + 0}{2}\right) = \left(\frac{a_{\text{c}}}{2}, \frac{b_{\text{c}}}{2}\right)$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts` (Section 9), `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/math/ThalesCircumcircle.ts` (`calculateThalesCircumcircleFromVertices`), `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`)
18. `numerical_considerations`: `ThalesCircumcircle.ts` computes midpoint directly from $(A, B)$ rather than assuming origin coordinates.
