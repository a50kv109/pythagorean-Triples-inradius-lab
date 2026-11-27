# Formula Dependency Graph — Four-Circles Pythagorean Geometry Lab (PCL)

This document traces the exact logical and computational derivation graph of all 24 UMFP formula passports (`PCL-A01` – `PCL-F24`) defined in [`FORMULA_PASSPORTS.md`](FORMULA_PASSPORTS.md).

The graph shows how the two independent leg parameters $(a, b)$ split into two geometric branches — exterior squares with their inscribed circles (Groups B–C) and the triangle incircle (Group D) — before converging in the central $\sqrt{K}$ identity (Group E) and the dimensionless parametric $t = b/a$ system (Group F).

---

## 1. Derivation Directed Acyclic Graph (DAG)

```mermaid
graph TD
    %% Root Contract & Inputs
    Inputs["Inputs: legs a, b"] --> A01["PCL-A01: Positive Finite Guard (a, b > 0)"]
    A01 --> A02["PCL-A02: Triangle Vertices O(0,0), A(0,a), B(b,0)"]
    A01 --> A03["PCL-A03: Hypotenuse c = √(a² + b²)"]
    A02 --> A03
    A03 --> A04["PCL-A04: Angles α, β, Area, Altitude, Projections"]

    %% Branch 1: Exterior Squares & Square-Inscribed Circles (Groups B & C)
    A02 --> B05["PCL-B05: Leg Squares Qa, Qb"]
    A03 --> B06["PCL-B06: Hypotenuse Square Qc"]
    B05 --> B07["PCL-B07: Square Areas Sa, Sb, Sc & Sa + Sb = Sc"]
    B06 --> B07

    B05 --> C08["PCL-C08: Centers Oa, Ob, Oc"]
    B06 --> C08
    B05 --> C09["PCL-C09: Radii Ra, Rb, Rc, Diameters & Tangency"]
    B06 --> C09
    C08 --> C09
    C09 --> C10["PCL-C10: Circle Areas Ka, Kb, Kc & √Ka, √Kb, √Kc"]
    B07 --> C11["PCL-C11: Pythagorean Circle Sum Ka + Kb = Kc"]
    C10 --> C11

    %% Branch 2: Triangle Incircle Ki (Group D)
    A03 --> D12["PCL-D12: Inradius r = (a + b - c)/2 = ab/(a + b + c)"]
    A04 --> D12
    D12 --> D13["PCL-D13: Incenter I(r, r) & Interior Containment"]
    D12 --> D14["PCL-D14: Tangency Points Ta, Tb, Tc & d = r"]
    D13 --> D14
    D12 --> D15["PCL-D15: Incircle Area Ki = πr² & √Ki = √π r"]

    %% Convergence: Central Four-Circle Identity & Contrast (Group E)
    C10 --> E16["PCL-E16: Central Identity √Ka + √Kb = √Kc + √Ki"]
    D12 --> E16
    D15 --> E16
    C11 --> E17["PCL-E17: Area Contrast Ka + Kb - Kc - Ki = -Ki"]
    D15 --> E17

    %% Branch 3: Parametric Ratio System t = b / a (Group F)
    A01 --> F18["PCL-F18: Dimensionless Ratio t = b/a & Normalized (1, t)"]
    A03 --> F18
    D12 --> F18

    C09 --> F19["PCL-F19: Perimeters Px = 2πRx = πDx & % Shares"]
    C10 --> F19
    D15 --> F19

    F18 --> F20["PCL-F20: Mode A Normalized Areas Kx(t)/Kc(t)"]
    C10 --> F20
    D15 --> F20

    F18 --> F21["PCL-F21: Unified Linear Ratios Px/Pc ≡ Rx/Rc ≡ Dx/Dc"]
    F19 --> F21

    F20 --> F22["PCL-F22: Reciprocal Duality t ↔ 1/t"]
    F21 --> F22
    F20 --> F23["PCL-F23: t = 1 Symmetry & Global Max Ki/Kc = 3 - 2√2"]
    F21 --> F23
    F22 --> F23

    A03 --> F24["PCL-F24: Inverse Sync (t, c0) -> Bounded (a, b)"]
    F18 --> F24
```

---

## 2. Structural Reading of the Graph

1. **Axiomatic Root (`PCL-A01` – `PCL-A04`):**
   Everything is derived from finite positive legs $(a, b)$. The hypotenuse $c = \sqrt{a^2+b^2}$ (`PCL-A03`) is the sole nonlinear root dependency feeding both branches.
2. **Exterior Squares & Square-Inscribed Circles (`PCL-B05` – `PCL-C11`):**
   Squares $Q_a, Q_b, Q_c$ determine diameters $(a, b, c)$, centers, areas $K_a, K_b, K_c$, and the quadratic Pythagorean sum $K_a + K_b = K_c$ (`PCL-C11`).
3. **Triangle Incircle (`PCL-D12` – `PCL-D15`):**
   Using $c$ and $(a, b)$, the inradius $r = \frac{ab}{a+b+c} = \frac{a+b-c}{2}$ (`PCL-D12`) yields the incenter $I(r,r)$, tangency points $T_a, T_b, T_c$, area $K_i$, and root $\sqrt{K_i}$.
4. **Central Convergence (`PCL-E16` – `PCL-E17`):**
   `PCL-C10` and `PCL-D15` combine linearly via square roots in the Central Four-Circle Identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ (`PCL-E16`), while `PCL-C11` and `PCL-D15` explain why direct areas fail to equate by exactly $-K_i$ (`PCL-E17`).
5. **Parametric Dependency & Non-Redundancy (`PCL-F18` – `PCL-F24`):**
   Setting $t = b/a$ (`PCL-F18`) produces quadratic area ratios (`PCL-F20`) and linear normalized ratios (`PCL-F21`). Crucially, `PCL-F21` explicitly shows that normalized perimeters ($P_x/P_c$), radii ($R_x/R_c$), and diameters ($D_x/D_c$) are **not independent laws** — they share a single derived node because $P_x = 2\pi R_x = \pi D_x$. Symmetry at $t = 1$ and its global maximum (`PCL-F23`) follow directly from reciprocal duality (`PCL-F22`), while `PCL-F24` maps interactive graph scrubbing back to bounded legs $(a, b)$.
