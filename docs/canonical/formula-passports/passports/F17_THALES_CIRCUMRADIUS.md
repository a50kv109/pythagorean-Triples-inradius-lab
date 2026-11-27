# Formula Passport: F17 — Thales Circumradius $R_o$ ($K_o$)

1. `formula_id`: `F17`
2. `formula_name`: Circumradius of Thales Circle $K_o$
3. `mathematical_domain`: Euclidean Geometry / Thales's Theorem
4. `canonical_expression`: $R_o = \frac{c}{2}$
5. `source_expression`: `sideC / 2` (`calculateCanonicalFourCircles`) / `diameter / 2` (`calculateThalesCircumcircleFromVertices`)
6. `semantic_description`: Calculates the circumradius $R_o$ of the Thales circumcircle $K_o$ passing through all three vertices $A, B, C$ of right triangle $\triangle ABC$.
7. `symbol_registry`:
   - $R_o$: Radius of Thales circumcircle $K_o$
   - $c$ (`sideC`): Hypotenuse length (circle diameter $D_o = |A - B| = c$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03)
9. `input_variables`: $c > 0$ (or vertices $A, B$ with $|A - B| > 0$)
10. `output_variables`: $R_o > 0$
11. `applicability_conditions`: Right-angled triangle inscribed in $K_o$ with hypotenuse as diameter.
12. `constraints`: $|O_o - A| = |O_o - B| = |O_o - C| = R_o = c/2$
13. `dependencies`: F01 (Hypotenuse $c$)
14. `mathematical_derivation`: By Thales's theorem and its converse, the right angle at $C$ subtends diameter $AB$, so the circumcenter is the midpoint of $AB$ and $R_o = |AB|/2 = c/2$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/geometry.test.ts` (Section 9), `src/tests/canonical/test01_controlTriangles.canonical.test.ts`
17. `implementation_reference`: `src/math/ThalesCircumcircle.ts` (`calculateThalesCircumcircleFromVertices`, `calculateThalesCircumcircle`), `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`)
18. `numerical_considerations`: Verified against endpoint distance $|B - A|$ in `ThalesValidators.ts`.
