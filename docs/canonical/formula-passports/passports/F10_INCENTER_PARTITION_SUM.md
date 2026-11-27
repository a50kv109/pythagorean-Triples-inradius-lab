# Formula Passport: F10 — Incenter Partition Sum Identity

1. `formula_id`: `F10`
2. `formula_name`: Incenter Partition Total Area Identity ($S = S_A + S_B + S_C = p r$)
3. `mathematical_domain`: Planimetry / Euclidean Geometry
4. `canonical_expression`: $S = S_A + S_B + S_C = \frac{1}{2}a_{\text{c}}r + \frac{1}{2}b_{\text{c}}r + \frac{1}{2}cr = r\left(\frac{a_{\text{c}} + b_{\text{c}} + c}{2}\right) = p \cdot r$
5. `source_expression`: `areaSA + areaSB + areaSC` (`areaSum`) and `p * r` (`productPR`)
6. `semantic_description`: Establishes that the three disjoint interior sub-triangles $\triangle IBC, \triangle IAC, \triangle IAB$ exhaust $\triangle ABC$, proving $S = p \cdot r$.
7. `symbol_registry`:
   - $S$: Total triangle area
   - $S_A, S_B, S_C$: Sub-triangle areas
   - $p$: Semi-perimeter; $r$: Inradius
8. `notation_profile`: Canonical Notation Standard (`CANONICAL_OPPOSITE_SIDE_V1`, Doc 03 & Doc 04)
9. `input_variables`: $S_A, S_B, S_C > 0$
10. `output_variables`: Total partitioned area $S$
11. `applicability_conditions`: Non-degenerate Euclidean triangle ($I$ lies strictly in the interior of $\triangle ABC$).
12. `constraints`: Verified in `IncenterPartition.ts` with `deltaArea < 1e-11 && deltaPR < 1e-11` (`isExact`).
13. `dependencies`: F02, F04, F06, F07, F08, F09
14. `mathematical_derivation`: Since $I$ lies strictly inside $\triangle ABC$, segments $IA, IB, IC$ partition $\triangle ABC$ into three non-overlapping sub-triangles whose areas sum to $S = \frac{1}{2}(a_{\text{c}} + b_{\text{c}} + c)r = p r$.
15. `verification_status`: `PROVEN` & `VERIFIED_COMPUTATIONALLY`
16. `verification_evidence`: `src/tests/incenterPartition.test.ts` (control triangles & parametric sweeps), `src/tests/canonical/semanticContract.canonical.test.ts`
17. `implementation_reference`: `src/math/IncenterPartition.ts` (`calculateIncenterPartition`), `src/canonical/canonicalFourCircles.ts` (`calculateCanonicalFourCircles`)
18. `numerical_considerations`: Verified residuals $\Delta_{\text{area}}, \Delta_{pr} < 10^{-11}$ on control triangles; UI note: `IncenterPartitionSpectralPanel.tsx` displays a hardcoded `(Δ = 0.000)` footer string whereas `IncenterPartitionControls.tsx` displays the real computed deltas.
