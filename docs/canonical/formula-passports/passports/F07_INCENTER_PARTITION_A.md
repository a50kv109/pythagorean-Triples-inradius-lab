# Formula Passport: F07 — Sub-Triangle Area $S_A$

1. `formula_id`: `F07`
2. `formula_name`: Area of Incenter Partition Sub-Triangle $S_A$
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $S_A^{\text{canon}} = \operatorname{Area}(\triangle IBC) = \frac{1}{2} a_{\text{c}} r$
5. `source_expression`:
   - Canonical core: `0.5 * sideA * inradius` (`subtriangleAreaA`)
   - Runtime UI `IncenterPartition.ts`: `(a * r) / 2` on `subTriangles.SA` ($\triangle CAI$, base $OA = a_{\text{leg}} \equiv b_{\text{c}}$; whereas $\triangle CBI$ is stored in `subTriangles.SB`)
6. `semantic_description`: Calculates the area of the incenter partition sub-triangle attached to side `sideA` ($BC$, opposite vertex $A$) with base `sideA` and altitude $r$ from incenter $I$.
7. `symbol_registry`:
   - $S_A^{\text{canon}}$: Area of $\triangle IBC$ attached to $BC$ (`sideA`)
   - $a_{\text{c}}$ (`sideA`): Length of $BC$ (equivalent to runtime $b_{\text{leg}} = |OB|$)
   - $r$: Inradius (altitude from $I$ to $BC$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03 & Doc 04)
9. `input_variables`: $a_{\text{c}} > 0$, $r > 0$
10. `output_variables`: $S_A^{\text{canon}} > 0$
11. `applicability_conditions`: Incenter partition of right triangle $\triangle ABC$.
12. `constraints`: $0 < S_A^{\text{canon}} < S / 2$
13. `dependencies`: F06 (Inradius $r$)
14. `mathematical_derivation`: Because the incircle $K_i$ is tangent to $BC$, the distance from $I$ to $BC$ equals $r$, giving $\operatorname{Area}(\triangle IBC) = \frac{1}{2} \cdot |BC| \cdot r$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/incenterPartition.test.ts`, `src/tests/canonical/semanticContract.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`), `src/math/IncenterPartition.ts` (`calculateIncenterPartition` — leg-indexed `SA`/`SB` bridge documented in Doc 04)
18. `numerical_considerations`: Exact floating-point arithmetic; verified across asymmetric ratios $(1, 10, \sqrt{101})$ and $(10, 1, \sqrt{101})$.
