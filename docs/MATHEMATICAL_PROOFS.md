# Mathematical Proofs — Four-Circles Pythagorean Geometry Lab (PCL)

This document provides formal step-by-step proofs for the mathematical identities and parametric propositions in the **Four-Circles Pythagorean Geometry Lab**, explicitly separating:

1. **Definitions**
2. **Assumptions**
3. **Established Theorems** (classical Euclidean prerequisites)
4. **Derived Identities & Propositions** (deduced strictly within `a, b > 0` right triangles)
5. **Numerical & Graphical Observations**
6. **Conjectures, Analogies & Open Directions** (`CONJECTURE` / `ANALOGY` — not proved or implemented in `v1.0.0`)

Bracketed passport IDs (e.g., `PCL-D12`) correspond to [`FORMULA_PASSPORTS.md`](FORMULA_PASSPORTS.md).

---

## 1. Definitions

1. **Right Triangle $\triangle OAB$ (`PCL-A02`):** In Euclidean $\mathbb{R}^2$, let $O = (0,0)$, $A = (0, a)$, and $B = (b, 0)$, with hypotenuse length $c = |AB|$.
2. **Exterior Squares (`PCL-B05`, `PCL-B06`):**
   - $Q_a$ on leg $OA$: vertices $O(0,0), A(0,a), C_a(-a,a), D_a(-a,0)$, side $a$.
   - $Q_b$ on leg $OB$: vertices $O(0,0), B(b,0), C_b(b,-b), D_b(0,-b)$, side $b$.
   - $Q_c$ on hypotenuse $AB$: vertices $A(0,a), B(b,0), B_c(b+a,b), A_c(a,a+b)$, side $c$.
3. **Square-Inscribed Circles (`PCL-C08`–`PCL-C10`):** $K_a, K_b, K_c$ are the unique circles inscribed in $Q_a, Q_b, Q_c$, having radii $R_a = a/2, R_b = b/2, R_c = c/2$, diameters $D_a = a, D_b = b, D_c = c$, and areas $K_x = \pi R_x^2$.
4. **Triangle Incircle $K_i$ (`PCL-D12`–`PCL-D15`):** The unique circle strictly inside $\triangle OAB$ tangent to segments $OA, OB, AB$, with radius $r > 0$, diameter $2r$, incenter $I$, and area $K_i = \pi r^2$.
5. **Dimensionless Ratio ($t$, `PCL-F18`):** $t := b/a > 0$, with normalized legs $a_{\text{norm}} = 1,\; b_{\text{norm}} = t$.

---

## 2. Assumptions

1. **Flat Euclidean Plane:** Standard $\mathbb{R}^2$ Euclidean geometry with standard $\pi$.
2. **Non-Degeneracy (`PCL-A01`):** $a, b \in \mathbb{R}_{>0}$ are strictly positive finite real numbers. Hence $c > \max(a,b) > 0$, $a + b > c$, and $S_{\triangle OAB} = \frac{1}{2}ab > 0$.
3. **Principal Square Root:** $\sqrt{x} \ge 0$ denotes the non-negative real root for $x \ge 0$, so $\sqrt{s^2} = s$ for all $s > 0$.

---

## 3. Established Theorems (Classical Prerequisites)

- **Pythagorean Theorem (`PCL-A03`, `VERIFIED`):** In right triangle $\triangle OAB$ ($\angle AOB = 90^\circ$), $a^2 + b^2 = c^2$.
- **Triangle Area-Inradius Formula (`VERIFIED`):** For any non-degenerate triangle with area $S$, semiperimeter $p = \frac{a+b+c}{2}$, and inradius $r$, $S = p r$.
- **Circle Area & Circumference (`VERIFIED`):** A circle of radius $R$ (diameter $D = 2R$) has area $K = \pi R^2 = \frac{\pi D^2}{4}$ and circumference $P = 2\pi R = \pi D$.

---

## 4. Derived Identities & Propositions (`DERIVED` / `VERIFIED`)

### Proposition 1 — Right-Triangle Inradius Formula (`PCL-D12`)
**Statement:** For any right triangle $\triangle OAB$ with legs $a, b > 0$ and hypotenuse $c = \sqrt{a^2 + b^2}$, the inradius satisfies:
$$r = \frac{ab}{a + b + c} = \frac{a + b - c}{2} > 0$$

**Proof:**
1. Equating $S = \frac{1}{2}ab$ and $S = pr = \frac{a+b+c}{2}r$ gives $r = \frac{ab}{a + b + c} > 0$.
2. Multiplying numerator and denominator by $(a + b - c) > 0$:
   $$r = \frac{ab(a + b - c)}{(a + b + c)(a + b - c)} = \frac{ab(a + b - c)}{(a + b)^2 - c^2} = \frac{ab(a + b - c)}{a^2 + b^2 + 2ab - c^2}$$
3. Substituting $a^2 + b^2 = c^2$ reduces the denominator to $2ab$:
   $$r = \frac{ab(a + b - c)}{2ab} = \frac{a + b - c}{2}$$
$\blacksquare$

---

### Proposition 2 — Incenter Coordinates, Interior Containment, and Tangency Points (`PCL-D13`, `PCL-D14`)
**Statement:** In canonical coordinates $O(0,0), A(0,a), B(b,0)$, the incenter is $I = (r, r)$, lies strictly inside $\triangle OAB$, and touches $OA, OB, AB$ at:
$$T_a = (0, r), \qquad T_b = (r, 0), \qquad T_c = \left(r\left(1 + \frac{a}{c}\right),\; r\left(1 + \frac{b}{c}\right)\right)$$

**Proof:**
1. Because $OA$ lies on $x = 0$ ($y \ge 0$) and $OB$ lies on $y = 0$ ($x \ge 0$), any point in Quadrant I at perpendicular distance $r$ from both axes is $I = (r, r)$, with orthogonal feet $T_a = (0, r) \in OA$ and $T_b = (r, 0) \in OB$.
2. Hypotenuse $AB$ has equation $ax + by - ab = 0$ with outward unit normal $\hat{n} = (a/c, b/c)$. Substituting $I = (r, r)$ and $r = \frac{ab}{a+b+c}$:
   $$ar + br - ab = ab\left(\frac{a+b}{a+b+c} - 1\right) = -\frac{abc}{a+b+c} = -rc < 0$$
   Moreover $r < a$ and $r < b$ since $\frac{b}{a+b+c} < 1$ and $\frac{a}{a+b+c} < 1$, proving $I$ lies strictly inside $\triangle OAB$.
3. The perpendicular distance from $I$ to $AB$ is $\frac{|ar + br - ab|}{c} = r$, and $T_c = I + r\hat{n} = \left(r(1 + a/c), r(1 + b/c)\right)$ satisfies $ax_{T_c} + by_{T_c} = r(a + b + c) = ab$, confirming $T_c \in AB$.
$\blacksquare$

---

### Derived Identity 3 — Central Four-Circle Square-Root Identity (`PCL-E16`)
**Classification Note:** This relation is a **derived algebraic identity** for Euclidean right triangles (`a, b > 0`), **not** a new general theorem.

**Statement:** For every non-degenerate Euclidean right triangle ($a, b > 0$):
$$\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$$

**Proof:**
1. Because $a, b, c, r > 0$, taking principal square roots of `PCL-C10` and `PCL-D15` gives:
   $$\sqrt{K_a} = \frac{\sqrt{\pi}}{2}a, \qquad \sqrt{K_b} = \frac{\sqrt{\pi}}{2}b, \qquad \sqrt{K_c} = \frac{\sqrt{\pi}}{2}c, \qquad \sqrt{K_i} = \sqrt{\pi}\,r$$
2. Substituting $r = \frac{a + b - c}{2}$ (Proposition 1):
   $$\sqrt{K_i} = \frac{\sqrt{\pi}}{2}(a + b - c)$$
3. Adding the hypotenuse and incircle roots:
   $$\sqrt{K_c} + \sqrt{K_i} = \frac{\sqrt{\pi}}{2}c + \frac{\sqrt{\pi}}{2}(a + b - c) = \frac{\sqrt{\pi}}{2}(a + b) = \sqrt{K_a} + \sqrt{K_b}$$
$\blacksquare$

---

### Derived Identity 4 — Pythagorean Circle Area Sum & Contrast Identity (`PCL-C11`, `PCL-E17`)
**Statement:** For every right triangle with $a, b > 0$:
$$K_a + K_b = K_c \qquad \text{and} \qquad K_a + K_b - K_c - K_i = -K_i < 0$$

**Proof:**
1. By $a^2 + b^2 = c^2$, $K_a + K_b = \frac{\pi}{4}(a^2 + b^2) = \frac{\pi c^2}{4} = K_c$.
2. Subtracting $K_c + K_i$ yields $(K_a + K_b - K_c) - K_i = -K_i = -\pi r^2 < 0$ since $r > 0$.
$\blacksquare$

---

### Derived Identity 5 — Parametric Scaling & Collapse of Linear Curve Families (`PCL-F18`, `PCL-F20`, `PCL-F21`)
**Statement:** With $t = b/a > 0$, all ratios normalized to $K_c$ depend solely on $t$:
$$\frac{K_a(t)}{K_c(t)} = \frac{1}{1+t^2}, \qquad \frac{K_b(t)}{K_c(t)} = \frac{t^2}{1+t^2}, \qquad \frac{K_i(t)}{K_c(t)} = \frac{\left(1 + t - \sqrt{1+t^2}\right)^2}{1+t^2}$$
and all normalized linear measures coincide identically:
$$\frac{P_x(t)}{P_c(t)} \equiv \frac{R_x(t)}{R_c(t)} \equiv \frac{D_x(t)}{D_c(t)} = \sqrt{\frac{K_x(t)}{K_c(t)}} \qquad \forall x \in \{a, b, c, i\}$$

**Proof:**
1. Rescaling by $\lambda = 1/a > 0$ yields $a_{\text{norm}} = 1$, $b_{\text{norm}} = t$, $c(t) = \sqrt{1 + t^2}$, and $r(t) = \frac{1 + t - \sqrt{1+t^2}}{2}$.
2. Because $K_x(\lambda a, \lambda b) = \lambda^2 K_x(a, b)$ and $R_x(\lambda a, \lambda b) = \lambda R_x(a, b)$, $a$ cancels from every ratio relative to $K_c$ or $R_c$.
3. Because $P_x = 2\pi R_x$ and $D_x = 2R_x$, constant factors $2\pi$ and $2$ cancel identically in ratios relative to $K_c$.
$\blacksquare$

---

### Derived Identity 6 — Reciprocal Duality Under $t \leftrightarrow 1/t$ (`PCL-F22`)
**Statement:** For every $t > 0$:
$$\frac{K_a(1/t)}{K_c(1/t)} = \frac{K_b(t)}{K_c(t)}, \qquad \frac{K_i(1/t)}{K_c(1/t)} = \frac{K_i(t)}{K_c(t)}, \qquad \frac{R_a(1/t)}{R_c(1/t)} = \frac{R_b(t)}{R_c(t)}, \qquad \frac{R_i(1/t)}{R_c(1/t)} = \frac{R_i(t)}{R_c(t)}$$

**Proof:**
1. Direct substitution $t \mapsto 1/t$ gives $\frac{1}{1 + 1/t^2} = \frac{t^2}{1+t^2}$.
2. Multiplying numerator and denominator of $R_i(1/t)/R_c(1/t)$ by $t > 0$ gives $\frac{t + 1 - \sqrt{t^2 + 1}}{\sqrt{t^2 + 1}} = \frac{R_i(t)}{R_c(t)}$.
$\blacksquare$

---

### Derived Proposition 7 — Symmetry Values and Global Maximum of $K_i / K_c$ at $t = 1$ (`PCL-F23`)
**Statement:** For $t > 0$, $R_i(t)/R_c(t)$ and $K_i(t)/K_c(t)$ attain their **unique global maximum** at $t = 1$ ($a = b$):
$$\max_{t > 0} \frac{R_i(t)}{R_c(t)} = \sqrt{2} - 1, \qquad \max_{t > 0} \frac{K_i(t)}{K_c(t)} = (\sqrt{2} - 1)^2 = 3 - 2\sqrt{2}$$
and at $t = 1$: $\frac{K_a(1)}{K_c(1)} = \frac{K_b(1)}{K_c(1)} = \frac{1}{2}$, $\frac{R_a(1)}{R_c(1)} = \frac{R_b(1)}{R_c(1)} = \frac{1}{\sqrt{2}}$.

**Proof:**
1. Setting $t = \tan\alpha$ for $\alpha \in (0, \pi/2)$, $\frac{1}{\sqrt{1+t^2}} = \cos\alpha$ and $\frac{t}{\sqrt{1+t^2}} = \sin\alpha$.
2. Thus:
   $$\frac{R_i(t)}{R_c(t)} = \cos\alpha + \sin\alpha - 1 = \sqrt{2}\sin\!\left(\alpha + \frac{\pi}{4}\right) - 1$$
3. On $\alpha \in (0, \pi/2)$, $\alpha + \frac{\pi}{4} \in (\pi/4, 3\pi/4)$, so $\sin(\alpha + \pi/4)$ achieves its unique maximum $1$ iff $\alpha = \pi/4$ ($t = 1$).
4. Since $u \mapsto u^2$ is strictly increasing on $u > 0$, $K_i(t)/K_c(t) = (R_i/R_c)^2$ achieves its unique maximum $(\sqrt{2}-1)^2 = 3 - 2\sqrt{2}$ at $t = 1$.
$\blacksquare$

---

## 5. Numerical & Graphical Observations

1. **Logarithmic Mirror Symmetry (`scaleMode = 'log'`):** Under $u = \log_{10} t$, Identity 6 sends $u \mapsto -u$, making $K_a/K_c$ and $K_b/K_c$ exact mirror reflections across $t = 1$ and $K_i/K_c$ symmetric on $[0.1, 10]$.
2. **Asymptotic Decay:** As $t \to 0^+$, $R_i(t)/R_c(t) = t + \mathcal{O}(t^2)$ and $K_i(t)/K_c(t) = t^2 + \mathcal{O}(t^3) \to 0$; by duality, $K_i(t)/K_c(t) \sim t^{-2} \to 0$ as $t \to +\infty$.
3. **Discrete Graph Sampling (`steps = 220`):** The SVG polyline draws discrete segments with $t = 1$ explicitly injected when $t_{\min} \le 1 \le t_{\max}$.

---

## 6. Conjectures, Analogies & Open Directions (`CONJECTURE` / `ANALOGY` — Outside `v1.0.0`)

The following are **unproved and unimplemented** outside `v1.0.0` (see [`ROADMAP.md`](ROADMAP.md)):
- **`ANALOGY` — Excircle Square-Root Relations:** Extending the linear-root structure to the three excircles ($r_a = \frac{a+c-b}{2}$, $r_b = \frac{b+c-a}{2}$, $r_c = \frac{a+b+c}{2}$) alongside $K_i$.
- **`CONJECTURE` — Discrete Harmonic / DFT Spectral Decomposition:** Decomposing the 4-circle sequence $(K_a, K_b, K_c, K_i)$ via explicit DFT amplitudes/phases (distinct from the current parametric $t = b/a$ ratio plots).
- **`ANALOGY` — Non-Euclidean Extensions:** Investigating curved-geometry analogues where $a^2 + b^2 \ne c^2$.
