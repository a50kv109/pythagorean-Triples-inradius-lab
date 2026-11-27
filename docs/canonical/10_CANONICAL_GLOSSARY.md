# 10 — Canonical Glossary

- **Canonical Opposite-Side Frame (`CANONICAL_OPPOSITE_SIDE_V1`)**: Coordinate convention in `src/canonical/canonicalFourCircles.ts` with $C=(0,0)$, $A=(0, \text{sideB})$, $B=(\text{sideA}, 0)$, where `sideA = |BC|` is opposite vertex $A$ and `sideB = |AC|` is opposite vertex $B$.
- **Cathetus ($a, b$)**: One of the two orthogonal legs of a right-angled triangle adjacent to the $90^\circ$ vertex.
- **Central Four-Circle Identity**: $\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$.
- **Exterior Squares ($Q_a, Q_b, Q_c$)**: Squares constructed externally on the three sides of the right triangle.
- **Hypotenuse ($c$)**: Longest side opposite the right angle, $c = \sqrt{a^2 + b^2}$.
- **Incenter ($I$) & Inradius ($r$)**: Center $I=(r, r)$ and radius $r = \frac{ab}{a+b+c} = \frac{a+b-c}{2}$ of the inscribed circle $K_i$.
- **Incenter Partition ($S_A, S_B, S_C$)**: Decomposition of the right triangle into three sub-triangles sharing incenter $I$ and altitude $r$, satisfying $S_A + S_B + S_C = p r = S$.
- **Legacy-to-Canonical Bridge (`src/canonical/legacyMapping.ts`)**: Semantic mapping (`sideA === triangle.b`, `sideB === triangle.a`) linking the runtime UI frame ($O, A, B$) to the canonical opposite-side frame ($C, A, B$).
- **Live Cursor**: Vertical control line synchronized with the current triangle parameters on spectral plots.
- **Scale Parameter ($\lambda$)**: Normalized linear scale factor $\lambda = c / 5.0$.
- **Shape Parameter ($\rho$ / $t$)**: Dimensionless leg ratio $\rho = \text{sideA} / \text{sideB} = \tan\alpha \equiv t = b/a$.
- **Square-Inscribed Circles ($K_a, K_b, K_c$)**: Circles inscribed inside $Q_a, Q_b, Q_c$ with diameters equal to the corresponding side lengths.
- **Thales Circumcircle ($K_o$)**: Circle circumscribed around the right triangle with diameter $AB = c$, radius $R_o = c/2$, and center at the midpoint of $AB$.
