# Formula Passport: F09 — Sub-Triangle Area $S_C$

1. `formula_id`: `F09`
2. `formula_name`: Area of Incenter Partition Sub-Triangle $S_C$ ($\triangle IAB$)
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $S_C = \operatorname{Area}(\triangle IAB) = \frac{1}{2} c r$
5. `source_expression`: `0.5 * sideC * inradius` / `(c * r) / 2`
6. `semantic_description`: Calculates the area of sub-triangle $\triangle IAB$ formed by connecting incenter $I$ to hypotenuse endpoints $A$ and $B$, with base $AB = c$ and altitude $r$.
7. `symbol_registry`:
   - $S_C$: Area of $\triangle IAB$ attached to hypotenuse $AB$ (`sideC`)
   - $c$ (`sideC`): Hypotenuse length
   - $r$: Inradius (altitude perpendicular to $AB$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03 & Doc 04)
9. `input_variables`: $c > 0$, $r > 0$
10. `output_variables`: $S_C > 0$
11. `applicability_conditions`: Incenter partition of right triangle $\triangle ABC$.
12. `constraints`: Identical in both Canonical Core and Runtime `IncenterPartition.ts` (hypotenuse index $C$ is invariant).
13. `dependencies`: F01 (Hypotenuse $c$), F06 (Inradius $r$)
14. `mathematical_derivation`: Since $K_i$ is tangent to hypotenuse $AB$ at $T_c$, $IT_c \perp AB$ and $|IT_c| = r$, so $\operatorname{Area}(\triangle IAB) = \frac{1}{2} c r$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/incenterPartition.test.ts`, `src/tests/canonical/semanticContract.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`), `src/math/IncenterPartition.ts` (`calculateIncenterPartition`)
18. `numerical_considerations`: Invariant under leg swap $a_{\text{c}} \leftrightarrow b_{\text{c}}$.
