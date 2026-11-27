# 04 — Canonical Internal Triangle Naming & Partition Semantics

## 1. Purpose & Reconciliation of Indexing Conventions

Connecting the incenter $I$ to vertices $A, B, C$ decomposes the right triangle into three sub-triangles sharing $I$ and common altitude $r$ perpendicular to each side.

An earlier draft of this document mixed the **Canonical Opposite-Side Frame** (`src/canonical/canonicalFourCircles.ts`) with the **Runtime Leg-Indexed Frame** (`src/math/IncenterPartition.ts`), creating an apparent contradiction between $S_A$ and $S_B$. This specification establishes the exact unambiguous mapping between both representations.

---

## 2. Canonical Standard (`src/canonical/canonicalFourCircles.ts`)

In `CANONICAL_OPPOSITE_SIDE_V1` ($C = (0,0)$, $A = (0, \text{sideB})$, $B = (\text{sideA}, 0)$):

| Canonical ID | Triangle Vertices | Attached Base Side | Opposite Vertex | Base Length | Altitude | Area Formula | Code Field (`canonicalFourCircles.ts`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **$S_A^{\text{canon}}$** | $\triangle IBC$ | $BC$ (`sideA`) | $A$ | $\text{sideA}$ | $r$ | $\frac{1}{2} \cdot \text{sideA} \cdot r$ | `incenterPartition.subtriangleAreaA` |
| **$S_B^{\text{canon}}$** | $\triangle IAC$ | $AC$ (`sideB`) | $B$ | $\text{sideB}$ | $r$ | $\frac{1}{2} \cdot \text{sideB} \cdot r$ | `incenterPartition.subtriangleAreaB` |
| **$S_C^{\text{canon}}$** | $\triangle IAB$ | $AB$ (`sideC`) | $C$ | $\text{sideC}$ | $r$ | $\frac{1}{2} \cdot \text{sideC} \cdot r$ | `incenterPartition.subtriangleAreaC` |

**Note on Legs vs. Hypotenuse of Internal Triangles:**
Each sub-triangle $\triangle IBC, \triangle IAC, \triangle IAB$ is in general an **obtuse** triangle (with angle at $I$ equal to $90^\circ + \frac{X}{2} > 90^\circ$, except possibly degenerate limits). Therefore, internal sub-triangles do **not** have their own "catheti" or "hypotenuse" — the terms *catheti* and *hypotenuse* belong strictly to the parent right triangle $\triangle ABC$, while each internal triangle has one **base** (side $a_{\text{c}}, b_{\text{c}},$ or $c$ of $\triangle ABC$), two **incenter-to-vertex segments** ($IB, IC$, etc.), and **altitude** $r$ from $I$ to the base.

Internal segment lengths from $I(r, r)$ to vertices $A, B, C$ (`PROVEN` analytically; note: not separately stored as fields in `IncenterPartition.ts` or `canonicalFourCircles.ts`):
- $|IC| = r\sqrt{2}$ (bisector of right angle $\gamma = 90^\circ$)
- $|IA| = \sqrt{r^2 + (\text{sideB} - r)^2} = \frac{r}{\sin(\alpha/2)}$
- $|IB| = \sqrt{(\text{sideA} - r)^2 + r^2} = \frac{r}{\sin(\beta/2)}$

---

## 3. Runtime `IncenterPartition.ts` Implementation (`src/math/IncenterPartition.ts`)

`calculateIncenterPartition(calc)` consumes `FourCirclesCalculations`, where $O = (0,0)$ (aliased `C`), $A = (0, a)$ (`sideA = |OA|`), and $B = (b, 0)$ (`sideB = |OB|`). In this runtime frame, subscripts `SA, SB, SC` index by **adjacent leg name `a, b, c`** rather than opposite vertex:

| Runtime Field (`subTriangles.*`) | Vertices in `IncenterPartition.ts` | Base Side Name & Length | Area Formula in Code | Canonical Equivalent (`canonicalFourCircles.ts`) |
| :--- | :--- | :--- | :--- | :--- |
| **`SA`** (`S_A`) | `[C, A, I]` ($\triangle CAI$) | `'a'` ($a = \|OA\|$) | `0.5 * a * r` | **$S_B^{\text{canon}}$** (`subtriangleAreaB`) |
| **`SB`** (`S_B`) | `[C, B, I]` ($\triangle CBI$) | `'b'` ($b = \|OB\|$) | `0.5 * b * r` | **$S_A^{\text{canon}}$** (`subtriangleAreaA`) |
| **`SC`** (`S_C`) | `[A, B, I]` ($\triangle ABI$) | `'c'` ($c = \|AB\|$) | `0.5 * c * r` | **$S_C^{\text{canon}}$** (`subtriangleAreaC`) |

Both representations yield identical numerical areas, shares ($w_k = S_k / S$), and partition sum $S_A + S_B + S_C = p \cdot r = S$ (`PROVEN` & `VERIFIED_COMPUTATIONALLY` in `src/tests/incenterPartition.test.ts` and `src/tests/canonical/semanticContract.canonical.test.ts`).

---

## 4. Experiment 06 Correspondence (`src/math/experiments/arcSideAreaCorrespondence.ts`)

Experiment 06 adopts the **same Euclidean opposite-side convention** as the Canonical Standard:
- $S_a = \operatorname{Area}(\triangle IOB) = \frac{1}{2} a r$ (opposite $A$, base $|OB|$)
- $S_b = \operatorname{Area}(\triangle IOA) = \frac{1}{2} b r$ (opposite $B$, base $|OA|$)
- $S_c = \operatorname{Area}(\triangle IAB) = \frac{1}{2} c r$ (opposite $C$, base $|AB|$)
