# Formula Passport: F08 — Sub-Triangle Area $S_B$

1. `formula_id`: `F08`
2. `formula_name`: Area of Incenter Partition Sub-Triangle $S_B$
3. `mathematical_domain`: Planimetry
4. `canonical_expression`: $S_B^{\text{canon}} = \operatorname{Area}(\triangle IAC) = \frac{1}{2} b_{\text{c}} r$
5. `source_expression`:
   - Canonical core: `0.5 * sideB * inradius` (`subtriangleAreaB`)
   - Runtime UI `IncenterPartition.ts`: `(b * r) / 2` on `subTriangles.SB` ($\triangle CBI$, base $OB = b_{\text{leg}} \equiv a_{\text{c}}$; whereas $\triangle CAI$ is stored in `subTriangles.SA`)
6. `semantic_description`: Calculates the area of the incenter partition sub-triangle attached to side `sideB` ($AC$, opposite vertex $B$) with base `sideB` and altitude $r$ from incenter $I$.
7. `symbol_registry`:
   - $S_B^{\text{canon}}$: Area of $\triangle IAC$ attached to $AC$ (`sideB`)
   - $b_{\text{c}}$ (`sideB`): Length of $AC$ (equivalent to runtime $a_{\text{leg}} = |OA|$)
   - $r$: Inradius (altitude from $I$ to $AC$)
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03 & Doc 04)
9. `input_variables`: $b_{\text{c}} > 0$, $r > 0$
10. `output_variables`: $S_B^{\text{canon}} > 0$
11. `applicability_conditions`: Incenter partition of right triangle $\triangle ABC$.
12. `constraints`: $0 < S_B^{\text{canon}} < S / 2$
13. `dependencies`: F06 (Inradius $r$)
14. `mathematical_derivation`: Because $K_i$ is tangent to $AC$, the altitude from $I$ to $AC$ equals $r$, giving $\operatorname{Area}(\triangle IAC) = \frac{1}{2} \cdot |AC| \cdot r$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/incenterPartition.test.ts`, `src/tests/canonical/semanticContract.canonical.test.ts`
17. `implementation_reference`: `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`), `src/math/IncenterPartition.ts` (`calculateIncenterPartition` — leg-indexed `SA`/`SB` bridge documented in Doc 04)
18. `numerical_considerations`: Exact floating-point arithmetic; symmetric swap $S_A^{\text{canon}} \leftrightarrow S_B^{\text{canon}}$ under $a_{\text{c}} \leftrightarrow b_{\text{c}}$.
