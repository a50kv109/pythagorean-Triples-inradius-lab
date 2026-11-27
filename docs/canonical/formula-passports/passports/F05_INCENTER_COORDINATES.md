# Formula Passport: F05 — Incenter Coordinates

1. `formula_id`: `F05`
2. `formula_name`: Incenter Coordinates of Right-Angled Triangle
3. `mathematical_domain`: Analytic Geometry / Planimetry
4. `canonical_expression`: $I = (x_I, y_I) = (r, r), \quad x_I = y_I = \frac{a_{\text{c}} b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c}$
5. `source_expression`: `const incenter = { x: inradius, y: inradius }` where `inradius = (sideA / triangle.perimeter) * sideB`
6. `semantic_description`: Calculates the 2D coordinates $(x_I, y_I)$ of incenter $I$ when the $90^\circ$ vertex lies at the origin and legs lie along $+Ox, +Oy$.
7. `symbol_registry`:
   - $I(x_I, y_I)$: Incenter coordinates
   - $r$: Inradius (F06)
   - $a_{\text{c}}, b_{\text{c}}, c$: Side lengths
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $a_{\text{c}} > 0, b_{\text{c}} > 0, c > 0$
10. `output_variables`: $x_I > 0, y_I > 0$
11. `applicability_conditions`: Right-angle vertex at $(0,0)$, legs along $+Ox$ and $+Oy$.
12. `constraints`: $0 < r < \min(a_{\text{c}}, b_{\text{c}}) / 2$
13. `dependencies`: F01, F03, F06
14. `mathematical_derivation`: Since $I$ lies in the first quadrant at equal perpendicular distance $r$ from $+Ox$ ($y=0$) and $+Oy$ ($x=0$), its coordinates are $(r, r)$. Equivalently from trilinear barycentric formula $\frac{a_{\text{c}} A + b_{\text{c}} B + c C}{a_{\text{c}}+b_{\text{c}}+c} = \frac{(a_{\text{c}}\cdot 0 + b_{\text{c}}\cdot a_{\text{c}} + 0,\; a_{\text{c}}\cdot b_{\text{c}} + 0 + 0)}{a_{\text{c}}+b_{\text{c}}+c} = (r, r)$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts`, `src/tests/incenterPartition.test.ts`, `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`), `src/math/FourCirclesModel.ts` (`calculateFourCircles`)
18. `numerical_considerations`: Derived via cancellation-free inradius (F06).
