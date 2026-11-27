# Canonical Formula Dependency Graph (`F01`–`F19`)

## 1. Dependency Tree (Canonical Opposite-Side Frame: $a_{\text{c}} = \text{sideA}, b_{\text{c}} = \text{sideB}$)

```text
Independent Positive Inputs: (sideA = a_c > 0, sideB = b_c > 0)
 ├── F19: Shape Ratio ρ = a_c / b_c
 ├── F01: Hypotenuse c = √(a_c² + b_c²) [via Math.hypot]
 │    ├── F03: Perimeter P = a_c + b_c + c
 │    │    └── F04: Semi-perimeter p = P / 2
 │    ├── F13: Exterior Square Area Area(Qc) = c²
 │    ├── F16: Incircle Radius rc = c / 2
 │    └── F17: Thales Circumradius Ro = c / 2
 ├── F02: Triangle Area S = ½ a_c b_c
 ├── F06: Inradius r = (a_c / (a_c + b_c + c)) · b_c  [depends on F01, F03]
 │    ├── F05: Incenter Coordinates I = (r, r)
 │    ├── F07: Sub-Triangle Area SA_canon = ½ a_c r
 │    ├── F08: Sub-Triangle Area SB_canon = ½ b_c r
 │    ├── F09: Sub-Triangle Area SC = ½ c r        [depends on F01, F06]
 │    └── F10: Partition Sum Identity S = SA + SB + SC = p · r [depends on F02, F04, F06, F07, F08, F09]
 ├── F11: Exterior Square Area Area(Qa) = a_c²
 ├── F12: Exterior Square Area Area(Qb) = b_c²
 ├── F14: Incircle Radius ra = a_c / 2
 ├── F15: Incircle Radius rb = b_c / 2
 └── F18: Thales Circumcenter Oo = (a_c / 2, b_c / 2)
```

## 2. Structural Properties
- **Acyclic DAG:** Every derived quantity flows strictly forward from independent inputs $(a_{\text{c}}, b_{\text{c}}) \in \mathbb{R}^+ \times \mathbb{R}^+$. Zero circular dependencies exist.
- **Computational Flow Alignment:** Matches `buildCanonicalRightTriangle` $\to$ `calculateCanonicalFourCircles` in `src/canonical/canonicalFourCircles.ts` and `calculateFourCircles` $\to$ `calculateIncenterPartition` in `src/math/`.
