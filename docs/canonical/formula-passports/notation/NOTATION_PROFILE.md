# Canonical Notation Profile (Formula Passports)

## 1. Canonical Core Standard (`CANONICAL_OPPOSITE_SIDE_V1` — `src/canonical/`)
- **Vertices:** $C = (0, 0)$ ($\gamma = 90^\circ$), $A = (0, b_{\text{c}})$ ($\alpha$), $B = (a_{\text{c}}, 0)$ ($\beta$).
- **Opposite Sides:** $a_{\text{c}}$ (`sideA = |BC|` opposite $A$), $b_{\text{c}}$ (`sideB = |AC|` opposite $B$), $c$ (`sideC = |AB|` opposite $C$).
- **Incenter & Inradius:** $I = (r, r)$, $r = \frac{a_{\text{c}} b_{\text{c}}}{a_{\text{c}} + b_{\text{c}} + c} = \frac{a_{\text{c}} + b_{\text{c}} - c}{2}$.
- **Canonical Sub-Triangles:**
  - $S_A^{\text{canon}} = \operatorname{Area}(\triangle IBC) = \frac{1}{2} a_{\text{c}} r$
  - $S_B^{\text{canon}} = \operatorname{Area}(\triangle IAC) = \frac{1}{2} b_{\text{c}} r$
  - $S_C^{\text{canon}} = \operatorname{Area}(\triangle IAB) = \frac{1}{2} c r$
- **Exterior Squares & Square-Inscribed Circles:** $Q_a, Q_b, Q_c$ and $K_a, K_b, K_c$ attached to `sideA`, `sideB`, `sideC`.
- **Thales Circumcircle:** $K_o$ with center $O_o = \left(\frac{a_{\text{c}}}{2}, \frac{b_{\text{c}}}{2}\right)$ and radius $R_o = \frac{c}{2}$.
- **Shape & Scale:** $\rho = \frac{a_{\text{c}}}{b_{\text{c}}} = \tan\alpha$, $\lambda = \frac{c}{5}$.

## 2. Runtime UI Bridge (`src/canonical/legacyMapping.ts` & `src/math/IncenterPartition.ts`)
In the runtime UI frame ($O=(0,0), A=(0, a_{\text{leg}}), B=(b_{\text{leg}}, 0)$):
- $a_{\text{leg}} \equiv b_{\text{c}}$, $b_{\text{leg}} \equiv a_{\text{c}}$, $t = \frac{b_{\text{leg}}}{a_{\text{leg}}} \equiv \rho$.
- `IncenterPartition.ts` indexes sub-triangles by adjacent leg (`SA` = $\triangle CAI = \frac{1}{2}a_{\text{leg}}r \equiv S_B^{\text{canon}}$, `SB` = $\triangle CBI = \frac{1}{2}b_{\text{leg}}r \equiv S_A^{\text{canon}}$, `SC` = $\triangle ABI = \frac{1}{2}cr$).
