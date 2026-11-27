# UMFP Formula Passports — Four-Circles Pythagorean Geometry Lab (PCL)

This document defines the 29 **Universal Mathematical Formula Passports (UMFP)** (`PCL-A01`–`PCL-G29`) for all formulas, geometric constructions, validation invariants, and parametric relations implemented in the **Four-Circles Pythagorean Geometry Lab** (`src/math/`).

> **UMFP Methodological Scope Notice:**
> This registry follows the methodological architecture of the **Universal Mathematical Formula Passport (UMFP)** (`a50kv109/universal-Mathematical-formula-Passport`): separating **RAW** vs. **NORMALIZED** formula representations, **Structural Classification**, **Variable Scopes & Domain Constraints**, **Dependencies**, **Diagnostics / Insight Notes**, and **Epistemic Validity Statuses** (`VERIFIED`, `DERIVED`, `CONJECTURE`, `ANALOGY`).
>
> **No Runtime Engine Integration:** The external UMFP software engine (`FormulaPassport`, `generatePassport()`, `comparePassports()`, `compareExpressions()`, automated AST parser, and `Insight Bank` module) is **not** installed or imported into this codebase. All 29 passports below are authored manually in alignment with UMFP methodology and verified directly against the TypeScript implementation (`src/math/*`) and test suite (`src/tests/geometry.test.ts`).

---

## Validity & Structural Taxonomy

- **UMFP Validity Status (Epistemic Reliability — kept strictly distinct from structural type):**
  - `VERIFIED`: Confirmed analytically against Euclidean axioms/proofs **and/or** verified directly by automated tests and runtime validators (`tol = 1e-9`), or enforced directly by runtime domain guards.
  - `DERIVED`: Algebraically or geometrically deduced from definitions and established theorems within the domain (`a, b > 0` finite).
  - `CONJECTURE`: Proposed generalization or unproved extension outside `v1.0.0` (tracked in Section 6 of [`MATHEMATICAL_PROOFS.md`](MATHEMATICAL_PROOFS.md) and [`VERIFICATION_MATRIX.md`](VERIFICATION_MATRIX.md)).
  - `ANALOGY`: Structural parallel (e.g., excircle or non-Euclidean analogue) not established as an identity in this model.
- **UMFP Structural Classification:** Categorizes the mathematical role of the expression (`Domain Constraint`, `Coordinate Definition`, `Established Euclidean Theorem`, `Geometric Construction`, `Algebraic Identity`, `Parametric Functional Relation`, `Symmetry / Extremum Proposition`, `Computational Mapping`).

---

## Passport Index

- **Group A — Right Triangle Geometry & Input Domain:** `PCL-A01` – `PCL-A04`
- **Group B — Exterior Squares ($Q_a, Q_b, Q_c$):** `PCL-B05` – `PCL-B07`
- **Group C — Three Square-Inscribed Circles ($K_a, K_b, K_c$):** `PCL-C08` – `PCL-C11`
- **Group D — Fourth Circle: Triangle Incircle ($K_i$):** `PCL-D12` – `PCL-D15`
- **Group E — Central Four-Circle Identity & Area Contrast:** `PCL-E16` – `PCL-E17`
- **Group F — Parametric Model ($t = b/a$) & Normalized Curves:** `PCL-F18` – `PCL-F24`
- **Group G — Fifth Geometric Layer: Thales Circumcircle ($K_o$):** `PCL-G25` – `PCL-G29`

---

## Group A. Right Triangle Geometry & Input Domain

### `PCL-A01` — Non-Degenerate Leg Domain Guard
- **ID:** `PCL-A01`
- **Name:** Strict Positive Finite Leg Contract
- **RAW Expression:** `typeof value === 'number' && Number.isFinite(value) && value > 0`
- **NORMALIZED Expression:** $a \in (0, +\infty) \subset \mathbb{R}, \quad b \in (0, +\infty) \subset \mathbb{R}$
- **UMFP Structural Classification:** `Domain Constraint`
- **UMFP Validity Status:** `VERIFIED` *(runtime contract enforced & tested)*
- **Variables & Scope:** $a > 0$ (vertical leg length, model-wide parameter), $b > 0$ (horizontal leg length, model-wide parameter).
- **Domain Constraints:** Open positive quadrant $(0, +\infty) \times (0, +\infty)$; rejects `0`, `< 0`, `NaN`, and `±Infinity`.
- **Mathematical Foundation:** Non-degeneracy axiom for a Euclidean right triangle (required so $c > 0$, $S_{\triangle} > 0$, and $r > 0$).
- **Dependencies:** None (root input guard).
- **Implementation Location:** `assertValidLeg`, `assertValidLegs`, `InvalidTriangleInputError` in `src/math/inputValidation.ts`.
- **Verification Method:** Automated exception tests on `0`, `-5`, `-0.001`, `-1`, `NaN`, `±Infinity` (`src/tests/geometry.test.ts`, Section 3).
- **Diagnostics / Insight Notes:** Core math functions accept arbitrary finite $a, b > 0$, whereas `App.tsx` (`clampVal`) clamps interactive UI inputs to $[0.2, 15]$ and `ControlsPanel.tsx` sliders span $[0.5, 12]$.

---

### `PCL-A02` — Canonical Right Triangle Vertices
- **ID:** `PCL-A02`
- **Name:** Orthonormal Coordinate Placement of $\triangle OAB$
- **RAW Expression:** `O = {x: 0, y: 0}`, `A = {x: 0, y: validA}`, `B = {x: validB, y: 0}`
- **NORMALIZED Expression:** $\mathbf{O} = (0, 0), \quad \mathbf{A} = (0, a), \quad \mathbf{B} = (b, 0)$
- **UMFP Structural Classification:** `Coordinate Definition`
- **UMFP Validity Status:** `VERIFIED` *(canonical coordinate definition tested in control cases)*
- **Variables & Scope:** $a, b \in \mathbb{R}_{>0}$ (free leg parameters), $\mathbf{O}, \mathbf{A}, \mathbf{B} \in \mathbb{R}^2$.
- **Domain Constraints:** Requires `PCL-A01` ($a, b > 0$, finite).
- **Mathematical Foundation:** Canonical choice of Cartesian coordinate axes placing the right angle $\angle AOB = 90^\circ$ at $O$, leg $OA$ on $+y$, and leg $OB$ on $+x$.
- **Dependencies:** `PCL-A01`.
- **Implementation Location:** `calculateRightTriangle` in `src/math/RightTriangle.ts`.
- **Verification Method:** Structural inspection and vertex coordinate assertions across 6 control triangles (`src/tests/geometry.test.ts`, Section 1).
- **Diagnostics / Insight Notes:** Exact in IEEE-754 `float64`; anchors all downstream exterior square and incenter coordinates.

---

### `PCL-A03` — Hypotenuse Length (Pythagorean Theorem)
- **ID:** `PCL-A03`
- **Name:** Euclidean Hypotenuse Length $c$
- **RAW Expression:** `c = Math.hypot(validA, validB)`
- **NORMALIZED Expression:** $c(a, b) = (a^2 + b^2)^{1/2}$
- **UMFP Structural Classification:** `Established Euclidean Theorem`
- **UMFP Validity Status:** `VERIFIED` *(classical theorem & unit-tested across scales)*
- **Variables & Scope:** $a, b > 0$ (inputs), $c > \max(a, b) > 0$ (derived scalar).
- **Domain Constraints:** `PCL-A01`, $\angle AOB = 90^\circ$; finite in `float64` whenever $\sqrt{a^2 + b^2} \le \text{Number.MAX\_VALUE}$.
- **Mathematical Foundation:** Classical Pythagorean theorem ($c^2 = a^2 + b^2$ with $c > 0$).
- **Dependencies:** `PCL-A01`, `PCL-A02`.
- **Implementation Location:** `calculateRightTriangle` (`src/math/RightTriangle.ts`) and `calculateSquareC` (`src/math/SquareConstruction.ts`).
- **Verification Method:** Exact comparisons on `(3,4,5)`, `(5,12,13)`, `(4,4,4√2)`, `(1,10,√101)` and scale tests (`1e-6` to `1e50`) in `src/tests/geometry.test.ts` (Sections 1 & 4), plus `squares_construction` validator.
- **Diagnostics / Insight Notes:** Using `Math.hypot` avoids naive `a*a + b*b` intermediate overflow ($> 1.34 \times 10^{154}$) and underflow ($< 1.49 \times 10^{-154}$).

---

### `PCL-A04` — Triangle Angles, Area, Perimeter, Altitude, and Projections
- **ID:** `PCL-A04`
- **Name:** Secondary Analytical Properties of $\triangle OAB$
- **RAW Expression:** `alphaRad = Math.atan2(validB, validA)`, `betaRad = Math.atan2(validA, validB)`, `area = (validA * validB) / 2`, `perimeter = validA + validB + c`, `altitude = validA * (validB / c)`
- **NORMALIZED Expression:**
  $$\alpha = \arctan\!\left(\frac{b}{a}\right),\; \beta = \arctan\!\left(\frac{a}{b}\right),\; S_{\triangle} = \frac{1}{2}ab,\; P_{\triangle} = a + b + c,\; h_c = \frac{ab}{c},\; H = \left(b\frac{a^2}{c^2},\; a\frac{b^2}{c^2}\right),\; c_a = \frac{a^2}{c},\; c_b = \frac{b^2}{c}$$
- **UMFP Structural Classification:** `Derived Trigonometric & Similarity Relations`
- **UMFP Validity Status:** `DERIVED` *(analytically derived; `perimeter`, `alpha/beta`, `cosAlpha/sinAlpha` exercised in UI & `FourCirclesModel.ts`)*
- **Variables & Scope:** $\alpha, \beta \in (0, \pi/2)$ ($\alpha + \beta = \pi/2$), $S_{\triangle}, P_{\triangle}, h_c, c_a, c_b > 0$, $H \in \overline{AB}$.
- **Domain Constraints:** `PCL-A01`, `PCL-A03`; `area` overflows if $ab/2 > \text{MAX\_VALUE}$.
- **Mathematical Foundation:** Right-triangle trigonometry ($\tan\alpha = b/a$) and right-triangle altitude similarity ($\triangle OHA \sim \triangle BHO \sim \triangle BAO$).
- **Dependencies:** `PCL-A01`, `PCL-A02`, `PCL-A03`.
- **Implementation Location:** `calculateRightTriangle` in `src/math/RightTriangle.ts`.
- **Verification Method:** Analytical verification against code; direction ratios `a/c, b/c` indirectly tested via `tangencyAB` (`incircle_tangency`); standalone `h_c, H, c_a, c_b` fields are not directly asserted in `geometry.test.ts`.
- **Diagnostics / Insight Notes:** Direction cosines `cosAlpha = validA / c` and `sinAlpha = validB / c` are normalized before computing `altitude`, `altitudePoint`, `projectionA`, and `projectionB` to prevent intermediate quadratic overflow.

---

## Group B. Exterior Squares ($Q_a, Q_b, Q_c$)

### `PCL-B05` — Exterior Leg Squares ($Q_a, Q_b$)
- **ID:** `PCL-B05`
- **Name:** Vertex Coordinates of Exterior Squares on Legs $OA$ and $OB$
- **RAW Expression:** `Qa: O(0,0), A(0,a), Ca(-a,a), Da(-a,0)`; `Qb: O(0,0), B(b,0), Cb(b,-b), Db(0,-b)`
- **NORMALIZED Expression:**
  $$Q_a = \operatorname{conv}\{(0,0), (0,a), (-a,a), (-a,0)\}, \qquad Q_b = \operatorname{conv}\{(0,0), (b,0), (b,-b), (0,-b)\}$$
- **UMFP Structural Classification:** `Geometric Construction`
- **UMFP Validity Status:** `VERIFIED` *(definition verified by runtime side-length invariant)*
- **Variables & Scope:** $a, b > 0$; $Q_a \subset \{x \le 0, y \ge 0\}$ (Quadrant II), $Q_b \subset \{x \ge 0, y \le 0\}$ (Quadrant IV).
- **Domain Constraints:** `PCL-A01`, `PCL-A02`.
- **Mathematical Foundation:** Outward $90^\circ$ placement of squares along $-x$ from $OA$ and $-y$ from $OB$ so interiors are disjoint from $\triangle OAB$.
- **Dependencies:** `PCL-A01`, `PCL-A02`.
- **Implementation Location:** `calculateSquareA`, `calculateSquareB` in `src/math/SquareConstruction.ts`.
- **Verification Method:** Side-length checks in `validateFourCirclesInvariants` (`squares_construction`, `tol = 1e-9`) and `src/tests/geometry.test.ts` (Sections 1 & 4).
- **Diagnostics / Insight Notes:** Sign negation only; zero floating-point rounding error.

---

### `PCL-B06` — Exterior Hypotenuse Square ($Q_c$)
- **ID:** `PCL-B06`
- **Name:** Vertex Coordinates and Orthogonality of Square $Q_c$ on Hypotenuse $AB$
- **RAW Expression:** `A(0, a)`, `B(b, 0)`, `Bc(b + a, b)`, `Ac(a, a + b)`
- **NORMALIZED Expression:** $\mathbf{B}_c = \mathbf{B} + (a, b) = (b+a,\, b), \quad \mathbf{A}_c = \mathbf{A} + (a, b) = (a,\, a+b), \quad \overrightarrow{AB}\cdot\overrightarrow{BB_c} = (b, -a)\cdot(a, b) = 0$
- **UMFP Structural Classification:** `Geometric Construction`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED` *(orthogonality derived and unit-tested + mutation-tested)*
- **Variables & Scope:** $a, b > 0$, outward normal vector $\overrightarrow{n} = (a, b)$ of length $c$.
- **Domain Constraints:** `PCL-A01`, `PCL-A02`, `PCL-A03`.
- **Mathematical Foundation:** Rotating edge vector $\overrightarrow{AB} = (b, -a)$ by $+90^\circ$ counterclockwise in $\mathbb{R}^2$ gives $\overrightarrow{n} = (a, b)$, which points outward from $\triangle OAB$ into Quadrant I with $\|\overrightarrow{n}\| = \sqrt{a^2+b^2} = c$.
- **Dependencies:** `PCL-A01`, `PCL-A02`, `PCL-A03`.
- **Implementation Location:** `calculateSquareC` in `src/math/SquareConstruction.ts`.
- **Verification Method:** Side-length equality ($|AB|=|BB_c|=|B_c A_c|=|A_c A|=c$) and 3 normalized dot-product orthogonality checks (`qcOrtho < 1e-9`) in `FourCirclesValidators.ts` (`squares_construction`), plus skewed `Bc` mutation test (`src/tests/geometry.test.ts`, Section 5c).
- **Diagnostics / Insight Notes:** Pure addition avoids trigonometric rotation drift.

---

### `PCL-B07` — Square Areas & Pythagorean Area Relation
- **ID:** `PCL-B07`
- **Name:** Exterior Square Areas $S_a, S_b, S_c$ and Pythagorean Identity
- **RAW Expression:** `Sa = validA * validA`, `Sb = validB * validB`, `Sc = c * c`
- **NORMALIZED Expression:** $S_a = a^2, \quad S_b = b^2, \quad S_c = c^2, \quad S_a + S_b = S_c$
- **UMFP Structural Classification:** `Established Euclidean Theorem`
- **UMFP Validity Status:** `VERIFIED` *(established theorem & tested via circle-area proportionality)*
- **Variables & Scope:** $S_a, S_b, S_c > 0$.
- **Domain Constraints:** `PCL-A03`, `PCL-B05`, `PCL-B06`; overflows in `float64` when side $> 1.34 \times 10^{154}$.
- **Mathematical Foundation:** Square area $S = s^2$ combined with `PCL-A03` ($a^2 + b^2 = c^2$).
- **Dependencies:** `PCL-A03`, `PCL-B05`, `PCL-B06`.
- **Implementation Location:** `calculateSquareA`, `calculateSquareB`, `calculateSquareC` in `src/math/SquareConstruction.ts`.
- **Verification Method:** Side lengths verified in `squares_construction`; sum equivalence verified via `pythagorean_circle_areas` (`PCL-C11`, $K_x = \frac{\pi}{4} S_x$).
- **Diagnostics / Insight Notes:** Quadratic scaling bounds safe `float64` area evaluation to $s \in [10^{-162}, 10^{154}]$.

---

## Group C. Three Square-Inscribed Circles ($K_a, K_b, K_c$)

### `PCL-C08` — Centers of Square-Inscribed Circles ($O_a, O_b, O_c$)
- **ID:** `PCL-C08`
- **Name:** Midpoint Centers of $K_a, K_b, K_c$
- **RAW Expression:** `Oa = {-rA, rA}`, `Ob = {rB, -rB}`, `Oc = {(validA + validB) / 2, (validA + validB) / 2}` where `rA = validA / 2`, `rB = validB / 2`
- **NORMALIZED Expression:**
  $$O_a = \left(-\frac{a}{2},\; \frac{a}{2}\right), \qquad O_b = \left(\frac{b}{2},\; -\frac{b}{2}\right), \qquad O_c = \left(\frac{a+b}{2},\; \frac{a+b}{2}\right)$$
- **UMFP Structural Classification:** `Derived Coordinate Formula`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $O_a, O_b, O_c \in \mathbb{R}^2$.
- **Domain Constraints:** `PCL-B05`, `PCL-B06`.
- **Mathematical Foundation:** Center of a square-inscribed circle equals the midpoint of either square diagonal: $(O + C_a)/2$, $(O + C_b)/2$, $(A + B_c)/2 = \frac{(0,a)+(b+a,b)}{2} = \left(\frac{a+b}{2}, \frac{a+b}{2}\right)$.
- **Dependencies:** `PCL-B05`, `PCL-B06`.
- **Implementation Location:** `calculateFourCircles` in `src/math/FourCirclesModel.ts`.
- **Verification Method:** Direct assertions on $O_a, O_b, O_c$ coordinates across all 6 control triangles (`src/tests/geometry.test.ts`, Section 1).
- **Diagnostics / Insight Notes:** Notice $O_c$ lies on the $45^\circ$ symmetry line $y = x$ for **all** $a, b > 0$.

---

### `PCL-C09` — Radii, Diameters & Square Tangency of $K_a, K_b, K_c$
- **ID:** `PCL-C09`
- **Name:** Linear Dimensions and Four-Side Tangency of $K_a, K_b, K_c$
- **RAW Expression:** `rA = validA / 2, dA = validA`; `rB = validB / 2, dB = validB`; `rC = c / 2, dC = c`; plus 4 edge midpoints per square
- **NORMALIZED Expression:**
  $$R_a = \frac{a}{2},\; D_a = a; \quad R_b = \frac{b}{2},\; D_b = b; \quad R_c = \frac{c}{2},\; D_c = c; \qquad d(O_k, \ell_m(Q_k)) = R_k$$
- **UMFP Structural Classification:** `Geometric Tangency Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $R_k > 0$, $D_k = 2R_k$, $k \in \{a,b,c\}$, $m \in \{1,2,3,4\}$.
- **Domain Constraints:** `PCL-B05`, `PCL-B06`, `PCL-C08`.
- **Mathematical Foundation:** The inscribed circle of a square of side $s$ touches all four sides perpendicularly at their midpoints at distance $s/2$.
- **Dependencies:** `PCL-A03`, `PCL-B05`, `PCL-B06`, `PCL-C08`.
- **Implementation Location:** `calculateFourCircles` (`src/math/FourCirclesModel.ts`) and `square_circles_tangency` (`src/math/FourCirclesValidators.ts`).
- **Verification Method:** Runtime validator `square_circles_tangency` (`tol = 1e-9`) across all scales (`1e-6` to `1e50`) and skewed-$Q_c$ mutation test (`src/tests/geometry.test.ts`, Sections 1, 4, 5c).
- **Diagnostics / Insight Notes:** Normalized by each square's own side length so tangency check remains invariant across micro/macro scales.

---

### `PCL-C10` — Areas & Square Roots of $K_a, K_b, K_c$
- **ID:** `PCL-C10`
- **Name:** Areas and Principal Square Roots of Square-Inscribed Circles
- **RAW Expression:** `area = (Math.PI * s * s) / 4`, `sqrtArea = (SQRT_PI * s) / 2` for $s \in \{a, b, c\}$
- **NORMALIZED Expression:**
  $$K_a = \frac{\pi a^2}{4},\; K_b = \frac{\pi b^2}{4},\; K_c = \frac{\pi c^2}{4}; \qquad \sqrt{K_a} = \frac{\sqrt{\pi}}{2}a,\; \sqrt{K_b} = \frac{\sqrt{\pi}}{2}b,\; \sqrt{K_c} = \frac{\sqrt{\pi}}{2}c$$
- **UMFP Structural Classification:** `Algebraic Area Formula`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $s \in \{a, b, c\} > 0$, $\pi = \text{Math.PI}$.
- **Domain Constraints:** `PCL-A01`, `PCL-A03`, `PCL-C09`; finite area requires $\frac{\pi}{4}c^2 \le \text{Number.MAX\_VALUE}$ ($c \lesssim 1.51 \times 10^{154}$).
- **Mathematical Foundation:** $K = \pi R^2 = \pi (s/2)^2 = \frac{\pi s^2}{4}$ and principal root $\sqrt{s^2} = s$ for $s > 0$.
- **Dependencies:** `PCL-C09`.
- **Implementation Location:** `calculateFourCircles` (`src/math/FourCirclesModel.ts`).
- **Verification Method:** Runtime validator `four_circle_areas` (`tol = 1e-9`) and closed-form assertions in `src/tests/geometry.test.ts` (Sections 1 & 4).
- **Diagnostics / Insight Notes:** `circle.sqrtArea` is evaluated linearly without intermediate squaring, while `sqrtSumLegs` / `sqrtSumHypAndIn` compute `Math.sqrt(area)`.

---

### `PCL-C11` — Pythagorean Circle Area Identity
- **ID:** `PCL-C11`
- **Name:** Additivity of Areas of Leg-Square Circles ($K_a + K_b = K_c$)
- **RAW Expression:** `areaSumLegs = areaKa + areaKb`, `pythagoreanAreaDiff = areaSumLegs - areaKc`
- **NORMALIZED Expression:** $K_a + K_b = K_c$
- **UMFP Structural Classification:** `Algebraic Identity`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $K_a, K_b, K_c > 0$.
- **Domain Constraints:** `PCL-A03`, `PCL-C10` (finite non-overflowing areas).
- **Mathematical Foundation:** Factoring $\frac{\pi}{4}$ gives $K_a + K_b = \frac{\pi}{4}(a^2 + b^2) = \frac{\pi}{4}c^2 = K_c$ (`MATHEMATICAL_PROOFS.md`, Identity 4).
- **Dependencies:** `PCL-A03`, `PCL-B07`, `PCL-C10`.
- **Implementation Location:** `calculateFourCircles` (`src/math/FourCirclesModel.ts`), `pythagorean_circle_areas` (`src/math/FourCirclesValidators.ts`).
- **Verification Method:** Deductive proof + runtime validator + unit assertions (`src/tests/geometry.test.ts`, Sections 1, 4, 7).
- **Diagnostics / Insight Notes:** Direct area conservation holds for the three square-inscribed circles alone, explaining why adding $K_i$ breaks direct area equality (`PCL-E17`).

---

## Group D. Fourth Circle: Triangle Incircle $K_i$

### `PCL-D12` — Right-Triangle Inradius ($r$)
- **ID:** `PCL-D12`
- **Name:** Inradius of Right Triangle $\triangle OAB$ (Analytical & Cancellation-Free Forms)
- **RAW Expression:** `rIn = (validA / (validA + validB + c)) * validB`
- **NORMALIZED Expression:** $r(a, b) = \frac{ab}{a + b + c} = \frac{a + b - c}{2} > 0$
- **UMFP Structural Classification:** `Established Euclidean Formula / Algebraic Equivalence`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $a, b > 0$, $c = \sqrt{a^2+b^2}$, $r > 0$.
- **Domain Constraints:** `PCL-A01`, `PCL-A03`; strictly positive by the strict triangle inequality $a + b > c$.
- **Mathematical Foundation:** Equating $S_{\triangle} = \frac{1}{2}ab = \frac{a+b+c}{2}r$ yields $r = \frac{ab}{a+b+c}$; rationalizing by $(a+b-c)$ via $a^2+b^2=c^2$ yields $\frac{a+b-c}{2}$ (`MATHEMATICAL_PROOFS.md`, Theorem 1).
- **Dependencies:** `PCL-A01`, `PCL-A03`, `PCL-A04`.
- **Implementation Location:** `calculateFourCircles` (`src/math/FourCirclesModel.ts`, lines 98–99); `incircle_positive` (`src/math/FourCirclesValidators.ts`).
- **Verification Method:** Formal derivation + `incircle_positive` validator + control values ($r=1$ for `(3,4,5)`, $r=2$ for `(5,12,13)`) + extreme aspect ratio tests `(1, 1e5)`, `(1e50, 2e50)` (`src/tests/geometry.test.ts`, Sections 1 & 4).
- **Diagnostics / Insight Notes:** `(a / (a + b + c)) * b` eliminates catastrophic cancellation present in `(a + b - c) / 2` when $a \ll b$ or $b \ll a$ and prevents intermediate `a * b` overflow.

---

### `PCL-D13` — Incenter Coordinates & Strict Interior Containment
- **ID:** `PCL-D13`
- **Name:** Center $I$ of Incircle $K_i$ and Interior Inequality
- **RAW Expression:** `center = {x: rIn, y: rIn}`, `insideHypotenuse = r * (a + b) < a * b`
- **NORMALIZED Expression:** $I = (r, r), \qquad r > 0 \;\land\; r(a + b) < ab$
- **UMFP Structural Classification:** `Derived Coordinate & Containment Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $I \in \mathbb{R}_{>0}^2$.
- **Domain Constraints:** `PCL-A01`, `PCL-A02`, `PCL-D12`; containment check `r*(a+b) < a*b` requires $a b \le \text{Number.MAX\_VALUE}$.
- **Mathematical Foundation:** Because $OA \subset \{x=0\}$ and $OB \subset \{y=0\}$, equidistance $d(I, OA) = d(I, OB) = r$ in Quadrant I fixes $I = (r, r)$, while $a r + b r - ab = -rc < 0$ proves strict containment inside $\triangle OAB$ (`MATHEMATICAL_PROOFS.md`, Proposition 2).
- **Dependencies:** `PCL-A02`, `PCL-D12`.
- **Implementation Location:** `incircle.center` (`src/math/FourCirclesModel.ts`), `incircle_positive` (`src/math/FourCirclesValidators.ts`).
- **Verification Method:** Exact `I.x, I.y` checks + shifted-incenter mutation test (`src/tests/geometry.test.ts`, Sections 1 & 5a).
- **Diagnostics / Insight Notes:** Tangency radii $IT_a, IT_b$ form an $r \times r$ corner square with $O(0,0)$.

---

### `PCL-D14` — Incircle Tangency Points & Side-Distance Invariant
- **ID:** `PCL-D14`
- **Name:** Tangency Points $T_a, T_b, T_c$ and Distance Equalities for $K_i$
- **RAW Expression:** `tangencyOA = {x: 0, y: rIn}`, `tangencyOB = {x: rIn, y: 0}`, `tangencyAB = {x: rIn * (1 + validA/c), y: rIn * (1 + validB/c)}`
- **NORMALIZED Expression:**
  $$T_a = (0, r),\quad T_b = (r, 0),\quad T_c = \left(r\left(1 + \frac{a}{c}\right),\; r\left(1 + \frac{b}{c}\right)\right); \qquad d(I, OA) = d(I, OB) = d(I, AB) = r$$
- **UMFP Structural Classification:** `Geometric Tangency Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $T_a \in OA$, $T_b \in OB$, $T_c \in AB$.
- **Domain Constraints:** `PCL-A02`, `PCL-A03`, `PCL-D12`, `PCL-D13`.
- **Mathematical Foundation:** Perpendicular projection of $I(r, r)$ onto $ax + by - ab = 0$ along unit normal $\hat{n} = (a/c, b/c)$ (`MATHEMATICAL_PROOFS.md`, Proposition 2).
- **Dependencies:** `PCL-A03`, `PCL-D12`, `PCL-D13`.
- **Implementation Location:** `incircle` tangency fields (`src/math/FourCirclesModel.ts`), `incircle_tangency` (`src/math/FourCirclesValidators.ts`).
- **Verification Method:** Runtime validator `incircle_tangency` checks all 3 point-to-line distances and all 3 tangency-point radii/collinearity at `tol = 1e-9` + mutation test (`src/tests/geometry.test.ts`, Sections 1, 4, 5a).
- **Diagnostics / Insight Notes:** Direction cosines `a/c` and `b/c` prevent intermediate overflow.

---

### `PCL-D15` — Incircle Area & Square Root ($K_i, \sqrt{K_i}$)
- **ID:** `PCL-D15`
- **Name:** Area, Diameter, and Principal Square Root of $K_i$
- **RAW Expression:** `diameter = 2 * rIn`, `areaKi = Math.PI * rIn * rIn`, `sqrtKi = SQRT_PI * rIn`
- **NORMALIZED Expression:** $D_i = 2r, \qquad K_i = \pi r^2, \qquad \sqrt{K_i} = \sqrt{\pi}\,r = \frac{\sqrt{\pi}}{2}(a + b - c)$
- **UMFP Structural Classification:** `Algebraic Area Formula`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $r > 0$, $D_i > 0$, $K_i > 0$.
- **Domain Constraints:** `PCL-D12`; quadratic `areaKi` underflows when $r \lesssim 10^{-162}$.
- **Mathematical Foundation:** Circle area formula $K_i = \pi r^2$ and `PCL-D12`.
- **Dependencies:** `PCL-D12`.
- **Implementation Location:** `incircle` fields in `src/math/FourCirclesModel.ts`.
- **Verification Method:** `four_circle_areas` runtime validator + closed-form checks + `4 * Ki` fault-injection test (`src/tests/geometry.test.ts`, Sections 1 & 5b).
- **Diagnostics / Insight Notes:** Under extreme asymmetry ($a \ll b$), $K_i$ underflows earlier than $K_c$ because $r \approx a/2 \ll c/2$.

---

## Group E. Central Four-Circle Identity & Area Contrast

### `PCL-E16` — Central Four-Circle Square-Root Identity
- **ID:** `PCL-E16`
- **Name:** Derived Additive Square-Root Identity of the Four Circles
- **RAW Expression:** `sqrtSumLegs = Math.sqrt(areaKa) + Math.sqrt(areaKb)`, `sqrtSumHypAndIn = Math.sqrt(areaKc) + Math.sqrt(areaKi)`
- **NORMALIZED Expression:**
  $$\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i} \quad \left(\equiv \frac{\sqrt{\pi}}{2}(a + b)\right)$$
- **UMFP Structural Classification:** `Algebraic Identity (Derived, Non-General — Euclidean Right Triangles Only)`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED` *(derived mathematical identity proven for all Euclidean right triangles $a, b > 0$ and numerically verified; NOT claimed as a new general theorem)*
- **Variables & Scope:** $K_a, K_b, K_c, K_i > 0$ determined by right-triangle legs $a, b > 0$.
- **Domain Constraints:** Strictly requires a flat Euclidean right triangle ($\angle AOB = 90^\circ$, $a, b > 0$); does **not** generalize unchanged to oblique triangles where $a^2 + b^2 \ne c^2$.
- **Mathematical Foundation:** Substituting $r = \frac{a+b-c}{2}$ (`PCL-D12`) into $\sqrt{K_c} + \sqrt{K_i} = \frac{\sqrt{\pi}}{2}c + \frac{\sqrt{\pi}}{2}(a+b-c) = \frac{\sqrt{\pi}}{2}(a+b) = \sqrt{K_a} + \sqrt{K_b}$ (`MATHEMATICAL_PROOFS.md`, Identity 3).
- **Dependencies:** `PCL-C10`, `PCL-D12`, `PCL-D15`.
- **Implementation Location:** `FourCirclesModel.ts` (`sqrtSumLegs`, `sqrtSumHypAndIn`, `identityResidualAbs`, `identityResidualRel`) and `central_sqrt_identity` (`FourCirclesValidators.ts`).
- **Verification Method:** Step-by-step algebraic proof (`MATHEMATICAL_PROOFS.md`, Identity 3) + runtime validator + all 6 control triangles, extreme scales, parametric tests, and `4*Ki` mutation test (`src/tests/geometry.test.ts`, Sections 1, 4, 5b, 7).
- **Diagnostics / Insight Notes:** Extracting principal square roots converts quadratic area units into linear radius/diameter units scaled by $\sqrt{\pi}/2$.

---

### `PCL-E17` — Direct Area Non-Equality Contrast
- **ID:** `PCL-E17`
- **Name:** Exact Discrepancy Between Leg-Circle Sum and $(K_c + K_i)$
- **RAW Expression:** `areaMinusAll = areaKa + areaKb - areaKc - areaKi`, `areaContrastExpected = -areaKi`
- **NORMALIZED Expression:** $K_a + K_b - K_c - K_i = -K_i = -\pi r^2 < 0$
- **UMFP Structural Classification:** `Algebraic Identity / Contrast Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $K_a, K_b, K_c, K_i > 0$.
- **Domain Constraints:** `PCL-A01`, `PCL-C11`, `PCL-D15`.
- **Mathematical Foundation:** Subtracting $K_i > 0$ from `PCL-C11` ($K_a + K_b - K_c = 0$) leaves $-K_i < 0$ (`MATHEMATICAL_PROOFS.md`, Identity 4).
- **Dependencies:** `PCL-C11`, `PCL-D15`.
- **Implementation Location:** `FourCirclesModel.ts` (`areaMinusAll`, `areaContrastExpected`), `area_non_equality_contrast` (`FourCirclesValidators.ts`).
- **Verification Method:** Algebraic proof + runtime validator (`tol = 1e-9`) + `assert.ok(calc.areaMinusAll < 0)` (`src/tests/geometry.test.ts`, Section 1).
- **Diagnostics / Insight Notes:** Demonstrates why square roots (`PCL-E16`), rather than raw areas, balance when $K_i$ is included.

---

## Group F. Parametric Model ($t = b/a$) & Normalized Curves

### `PCL-F18` — Dimensionless Leg Ratio & Normalized Triangle
- **ID:** `PCL-F18`
- **Name:** One-Parameter Dimensionless Reduction ($t = b/a$)
- **RAW Expression:** `calculateFourCircles(1, t)` with guard `typeof t === 'number' && Number.isFinite(t) && t > 0`
- **NORMALIZED Expression:**
  $$t = \frac{b}{a} > 0, \quad a_{\text{norm}} = 1, \quad b_{\text{norm}} = t, \quad c(t) = \sqrt{1 + t^2}, \quad r(t) = \frac{t}{1 + t + \sqrt{1 + t^2}} = \frac{1 + t - \sqrt{1 + t^2}}{2}$$
- **UMFP Structural Classification:** `Parametric Functional Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $t \in (0, +\infty)$ (dimensionless leg aspect ratio).
- **Domain Constraints:** `Number.isFinite(t) && t > 0` (`RangeError` otherwise).
- **Mathematical Foundation:** Scale invariance of Euclidean similarity: rescaling $(a, b) \mapsto (1, b/a)$ preserves all dimensionless ratios relative to $K_c$ or $R_c$.
- **Dependencies:** `PCL-A01`, `PCL-A03`, `PCL-D12`.
- **Implementation Location:** `evaluateParametricFourCircles(t)` in `src/math/FourCirclesSpectralAnalysis.ts`.
- **Verification Method:** Tested against independent closed-form calculations at $t \in \{0.1, 0.5, 1.0, 2.0, 10.0\}$ (`src/tests/geometry.test.ts`, Section 7).
- **Diagnostics / Insight Notes:** Reuses `calculateFourCircles(1, t)` as single source of truth so curve values can never diverge from the geometry board.

---

### `PCL-F19` — Current-State Circumferences & Share Breakdown
- **ID:** `PCL-F19`
- **Name:** Circle Perimeters and Percentage Shares of Four-Circle Ensemble
- **RAW Expression:** `Px = 2 * Math.PI * radius`, `areaSharePercent = (Kx / totalArea) * 100`, `perimeterSharePercent = (Px / totalPerimeter) * 100`
- **NORMALIZED Expression:**
  $$P_x = 2\pi R_x = \pi D_x, \qquad \text{share}_K(x) = 100\,\frac{K_x}{\sum_{y} K_y}, \qquad \text{share}_P(x) = 100\,\frac{P_x}{\sum_{y} P_y}$$
- **UMFP Structural Classification:** `Derived Computational Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $x, y \in \{K_a, K_b, K_c, K_i\}$.
- **Domain Constraints:** `PCL-A01`, `PCL-C09`, `PCL-C10`, `PCL-D12`, `PCL-D15`.
- **Mathematical Foundation:** Euclidean circumference $P = 2\pi R$ and finite ensemble normalization.
- **Dependencies:** `PCL-C09`, `PCL-C10`, `PCL-D12`, `PCL-D15`.
- **Implementation Location:** `computeFourCirclesSpectralAnalysis` in `src/math/FourCirclesSpectralAnalysis.ts`.
- **Verification Method:** Checked on `(4, 3)` (`items.length === 4`, share sum `= 100%`, $P=2\pi R$, $D=2R$, swap symmetry) in `src/tests/geometry.test.ts` (Section 6).
- **Diagnostics / Insight Notes:** Strictly separates quadratic area shares from linear perimeter shares.

---

### `PCL-F20` — Mode A: Normalized Parametric Area Curves ($K_x(t) / K_c(t)$)
- **ID:** `PCL-F20`
- **Name:** Dimensionless Circle Area Ratios Relative to Hypotenuse Circle $K_c$
- **RAW Expression:** `byId[k].areaRatioToKc` from `computeFourCirclesSpectralAnalysis(calculateFourCircles(1, t))`
- **NORMALIZED Expression:**
  $$\frac{K_a(t)}{K_c(t)} = \frac{1}{1 + t^2}, \qquad \frac{K_b(t)}{K_c(t)} = \frac{t^2}{1 + t^2}, \qquad \frac{K_c(t)}{K_c(t)} = 1, \qquad \frac{K_i(t)}{K_c(t)} = \frac{\left(1 + t - \sqrt{1+t^2}\right)^2}{1 + t^2}$$
- **UMFP Structural Classification:** `Parametric Functional Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $t > 0$, curve outputs bounded in $(0, 1]$.
- **Domain Constraints:** `PCL-F18` ($t > 0$, finite).
- **Mathematical Foundation:** Ratio of quadratic areas under $a=1, b=t, c=\sqrt{1+t^2}$ (`MATHEMATICAL_PROOFS.md`, Identity 5).
- **Dependencies:** `PCL-C10`, `PCL-C11`, `PCL-D15`, `PCL-F18`.
- **Implementation Location:** `evaluateParametricFourCircles`, `sampleSpectralCurves(..., mode: 'areas')` in `src/math/FourCirclesSpectralAnalysis.ts`.
- **Verification Method:** Closed-form reference checks at $t \in \{0.1, 0.5, 1.0, 2.0, 10.0\}$ and `Ka/Kc + Kb/Kc = 1` check (`src/tests/geometry.test.ts`, Section 7).
- **Diagnostics / Insight Notes:** Rendered as Mode A (`Площади`) in `SpectralAnalysisPanel.tsx` using discrete sampling (`steps = 220`).

---

### `PCL-F21` — Modes B & C: Unified Linear Normalized Curves ($P_x/P_c \equiv R_x/R_c \equiv D_x/D_c$)
- **ID:** `PCL-F21`
- **Name:** Coincident Dimensionless Perimeter, Radius, and Diameter Ratios
- **RAW Expression:** `perimeters[k] = Pk / Pc`, `radii[k] = Rk / Rc`, `diameters[k] = Dk / Dc`
- **NORMALIZED Expression:**
  $$\frac{P_x(t)}{P_c(t)} \equiv \frac{R_x(t)}{R_c(t)} \equiv \frac{D_x(t)}{D_c(t)} = \begin{cases} (1+t^2)^{-1/2}, & x = a \\ t\,(1+t^2)^{-1/2}, & x = b \\ 1, & x = c \\ (1 + t - \sqrt{1+t^2})(1+t^2)^{-1/2}, & x = i \end{cases}$$
- **UMFP Structural Classification:** `Algebraic Identity / Linear Scaling Equivalence`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $t > 0$, $x \in \{a, b, c, i\}$.
- **Domain Constraints:** `PCL-F18` ($t > 0$, finite).
- **Mathematical Foundation:** Constant proportionality factors ($P = 2\pi R$, $D = 2R$) cancel identically in normalization by $K_c$ (`MATHEMATICAL_PROOFS.md`, Identity 5).
- **Dependencies:** `PCL-C09`, `PCL-D12`, `PCL-F18`, `PCL-F19`.
- **Implementation Location:** `evaluateParametricFourCircles`, `getNormalizedValuesForMode` in `src/math/FourCirclesSpectralAnalysis.ts`.
- **Verification Method:** Explicit equality `radii[k] === diameters[k] === perimeters[k]` verified across all 4 circles and all reference $t$ (`src/tests/geometry.test.ts`, Section 7).
- **Diagnostics / Insight Notes:** Modes B and C share one mathematical curve family; the `Radius | Diameter` switch updates labels and unnormalized readouts without distorting curves.

---

### `PCL-F22` — Reciprocal Leg-Swap Duality ($t \leftrightarrow 1/t$)
- **ID:** `PCL-F22`
- **Name:** Functional Symmetry Under Leg Exchange ($a \leftrightarrow b$)
- **RAW Expression:** `f(1/t)` swaps `Ka` and `Kb` ratios while preserving `Kc` and `Ki`
- **NORMALIZED Expression:**
  $$\frac{K_a(1/t)}{K_c(1/t)} = \frac{K_b(t)}{K_c(t)}, \qquad \frac{K_i(1/t)}{K_c(1/t)} = \frac{K_i(t)}{K_c(t)}, \qquad \frac{R_a(1/t)}{R_c(1/t)} = \frac{R_b(t)}{R_c(t)}, \qquad \frac{R_i(1/t)}{R_c(1/t)} = \frac{R_i(t)}{R_c(t)}$$
- **UMFP Structural Classification:** `Symmetry Identity`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $t > 0$, reciprocal $1/t > 0$.
- **Domain Constraints:** `PCL-F18` ($t > 0$, finite).
- **Mathematical Foundation:** Algebraic invariance under $t \mapsto 1/t$ (`MATHEMATICAL_PROOFS.md`, Identity 6).
- **Dependencies:** `PCL-F20`, `PCL-F21`.
- **Implementation Location:** Default `'log'` axis in `SpectralAnalysisPanel.tsx` and symmetric grid sampling in `sampleSpectralCurves`.
- **Verification Method:** Deductive proof + tested on `(3,7)/(7,3)`, `(3,4)/(4,3)`, `(0.1, 10)`, `(0.5, 2.0)` (`src/tests/geometry.test.ts`, Sections 2, 6, 7).
- **Diagnostics / Insight Notes:** Under $u = \log_{10} t$, inversion becomes $u \mapsto -u$ mirror symmetry about $t = 1$.

---

### `PCL-F23` — Symmetry Values & Global Maximum of $K_i / K_c$ at $t = 1$
- **ID:** `PCL-F23`
- **Name:** Isosceles Symmetry Configuration and Global Incircle-to-Hypotenuse Extremum
- **RAW Expression:** `evaluateParametricFourCircles(1.0)` + explicit injection of `1` in `sampleSpectralCurves`
- **NORMALIZED Expression:**
  $$\text{At } t = 1:\; \frac{K_a(1)}{K_c(1)} = \frac{K_b(1)}{K_c(1)} = \frac{1}{2},\; \frac{R_a(1)}{R_c(1)} = \frac{1}{\sqrt{2}};\qquad \max_{t>0}\frac{R_i(t)}{R_c(t)} = \sqrt{2} - 1,\; \max_{t>0}\frac{K_i(t)}{K_c(t)} = 3 - 2\sqrt{2}$$
- **UMFP Structural Classification:** `Symmetry / Extremum Proposition`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $t \in (0, +\infty)$, extremum uniquely at $t = 1$ ($\alpha = \pi/4$).
- **Domain Constraints:** `PCL-F18` ($t > 0$).
- **Mathematical Foundation:** Writing $R_i/R_c = \cos\alpha + \sin\alpha - 1 = \sqrt{2}\sin(\alpha + \pi/4) - 1$ achieves its unique global maximum at $\alpha = \pi/4$ ($t = 1$) (`MATHEMATICAL_PROOFS.md`, Proposition 7).
- **Dependencies:** `PCL-F20`, `PCL-F21`, `PCL-F22`.
- **Implementation Location:** `sampleSpectralCurves` (`src/math/FourCirclesSpectralAnalysis.ts`) and `t = 1` symmetry UI in `SpectralAnalysisPanel.tsx`.
- **Verification Method:** Analytical extremum proof + exact assertions at `t = 1.0` and inside `sampleSpectralCurves` (`src/tests/geometry.test.ts`, Section 7).
- **Diagnostics / Insight Notes:** Explicit insertion of `t = 1` when `tMin <= 1 <= tMax` guarantees exact peak rendering regardless of discrete `steps` parity.

---

### `PCL-F24` — Ratio-to-Leg Inverse Synchronization Mapping
- **ID:** `PCL-F24`
- **Name:** Conversion from Dimensionless Ratio $t$ and Reference Hypotenuse $c_0$ to Bounded Legs $(a, b)$
- **RAW Expression:** `a = safeC / Math.hypot(1, targetT); b = a * targetT;` followed by uniform similarity scaling into `[minLeg, maxLeg]` and per-leg clamp
- **NORMALIZED Expression:**
  $$a_0 = \frac{c_0}{\sqrt{1 + t^2}}, \qquad b_0 = a_0 t, \qquad (a, b) = \operatorname{clamp}_{[\ell_{\min}, \ell_{\max}]}\!\left(\operatorname{scale}(a_0, b_0)\right)$$
- **UMFP Structural Classification:** `Computational Mapping`
- **UMFP Validity Status:** `VERIFIED` *(computational algorithm unit-tested within aspect bounds)*
- **Variables & Scope:** `targetT` $> 0$, `targetC` $> 0$ (fallback `5`), bounds $\ell_{\min} = 0.2$, $\ell_{\max} = 15$.
- **Domain Constraints:** `Number.isFinite(targetT) && targetT > 0`; preserves exact ratio $b/a = t$ when $t \in [\ell_{\min}/\ell_{\max}, \ell_{\max}/\ell_{\min}] = [1/75, 75]$.
- **Mathematical Foundation:** Inverting $t = b/a$ and $c_0 = \sqrt{a^2 + b^2} = a\sqrt{1+t^2}$ with similarity rescaling.
- **Dependencies:** `PCL-A03`, `PCL-F18`.
- **Implementation Location:** `legsFromRatioAndHypotenuse` (`src/math/FourCirclesSpectralAnalysis.ts`), invoked by `handleChangeT` (`src/App.tsx`).
- **Verification Method:** Round-trip verification at $t \in \{0.1, 0.5, 1.0, 2.0, 10.0\}$ (`c = 5`) asserting $b/a = t$ and exact match with `evaluateParametricFourCircles(t)` (`src/tests/geometry.test.ts`, Section 7).
- **Diagnostics / Insight Notes:** `App.tsx` `clampVal` rounds legs to 6 decimal places (`1e-6`), maintaining tight synchronization during interactive UI scrubbing.

---

## Group G. Fifth Geometric Layer: Thales Circumcircle ($K_o$)

### `PCL-G25` — Thales Circumcenter from Hypotenuse Endpoints ($O_o$)
- **ID:** `PCL-G25`
- **Name:** Circumcenter of Right Triangle $\triangle ABC$ as Midpoint of Hypotenuse $AB$
- **RAW Expression:** `center = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }`
- **NORMALIZED Expression:** $O_o = \frac{\mathbf{A} + \mathbf{B}}{2} \quad \xrightarrow{\mathbf{A}=(0,a),\,\mathbf{B}=(b,0)} \quad \left(\frac{b}{2},\; \frac{a}{2}\right)$
- **UMFP Structural Classification:** `Coordinate Definition / Established Euclidean Theorem`
- **UMFP Validity Status:** `VERIFIED` *(computed directly from vertex coordinates and tested on both canonical and rotated triangles)*
- **Variables & Scope:** $\mathbf{A}, \mathbf{B}, \mathbf{C} \in \mathbb{R}^2$ with $\mathbf{A} \neq \mathbf{B}$ and $\angle ACB = 90^\circ$.
- **Domain Constraints:** Finite coordinates with $|\mathbf{A} - \mathbf{B}| > 0$ (`RangeError` otherwise).
- **Mathematical Foundation:** Classical Thales' theorem: the circumcenter of any Euclidean right triangle lies at the midpoint of its hypotenuse.
- **Dependencies:** `PCL-A01`, `PCL-A02`.
- **Implementation Location:** `calculateThalesCircumcircleFromVertices` in `src/math/ThalesCircumcircle.ts`.
- **Verification Method:** Verified on `(3,4,5)`, `(5,12,13)`, `(4,4,4√2)`, `(8,15,17)` and on a shifted, rotated right triangle ($C=(10,-4), \theta=0.63$) in `src/tests/geometry.test.ts` (Section 9a–9b).
- **Diagnostics / Insight Notes:** Explicitly uses endpoints `A, B` rather than hardcoding $(b/2, a/2)$.

---

### `PCL-G26` — Thales Diameter, Radius, Area, and Circumference ($D_o, R_o, K_o, L_o$)
- **ID:** `PCL-G26`
- **Name:** Scalar Dimensions of the Fifth Circle $K_o$
- **RAW Expression:** `diameter = Math.hypot(B.x - A.x, B.y - A.y)`, `radius = diameter / 2`, `area = (Math.PI * diameter * diameter) / 4`, `circumference = Math.PI * diameter`
- **NORMALIZED Expression:** $D_o = c, \qquad R_o = \frac{c}{2}, \qquad K_o = \frac{\pi c^2}{4}, \qquad L_o = \pi c$
- **UMFP Structural Classification:** `Established Euclidean Theorem / Area & Circumference Formulas`
- **UMFP Validity Status:** `VERIFIED` *(tested by 4 runtime invariants and multi-scale unit tests)*
- **Variables & Scope:** $c = |\mathbf{A}-\mathbf{B}| > 0$.
- **Domain Constraints:** Same `float64` quadratic area bounds as `PCL-C10` ($c \lesssim 1.51 \times 10^{154}$).
- **Mathematical Foundation:** By Thales' theorem, hypotenuse $AB$ is a diameter of the circumcircle.
- **Dependencies:** `PCL-A03`, `PCL-G25`.
- **Implementation Location:** `calculateThalesCircumcircleFromVertices` (`src/math/ThalesCircumcircle.ts`) and `thales_diameter`, `thales_radius`, `thales_area`, `thales_circumference` (`src/math/ThalesValidators.ts`).
- **Verification Method:** Verified across control triples, `(0.2, 15)`, `(1e-4, 2e-4)`, `(1e6, 2e6)`, and leg-swap symmetry (`src/tests/geometry.test.ts`, Section 9a–9d).
- **Diagnostics / Insight Notes:** Uses `Math.hypot(B.x - A.x, B.y - A.y)` directly from vertices.

---

### `PCL-G27` — Equidistance to Vertices & Inscribed Right Angle ($\angle AOB = 90^\circ$)
- **ID:** `PCL-G27`
- **Name:** Three-Vertex Concyclicity and Thales Right-Angle Condition
- **RAW Expression:** `toA = hypot(Oo - A)`, `toB = hypot(Oo - B)`, `toC = hypot(Oo - C)`, `angleAtRightVertexDeg = atan2(|(A-C) x (B-C)|, (A-C) . (B-C)) * 180 / Math.PI`
- **NORMALIZED Expression:** $|O_o - \mathbf{A}| = |O_o - \mathbf{B}| = |O_o - \mathbf{C}| = R_o, \qquad \angle ACB = 90^\circ \iff \overrightarrow{CA}\cdot\overrightarrow{CB} = 0$
- **UMFP Structural Classification:** `Established Euclidean Theorem`
- **UMFP Validity Status:** `VERIFIED` *(checked by 4 runtime invariants + shifted-center mutation test)*
- **Variables & Scope:** $\mathbf{A}, \mathbf{B}, \mathbf{C} \in \mathbb{R}^2$.
- **Domain Constraints:** Non-degenerate right triangle (`PCL-A01`).
- **Mathematical Foundation:** Every vertex of a right triangle lies on the circle with the hypotenuse as diameter; equivalently, the median to the hypotenuse equals $c/2$.
- **Dependencies:** `PCL-G25`, `PCL-G26`.
- **Implementation Location:** `ThalesCircumcircle.ts` and `thales_dist_A`, `thales_dist_B`, `thales_dist_C`, `thales_right_angle` (`ThalesValidators.ts`).
- **Verification Method:** Verified at `tol = 1e-9` across all presets, extreme scales, rotated triangles, and center-perturbation mutation test (`src/tests/geometry.test.ts`, Section 9a–9f).
- **Diagnostics / Insight Notes:** `thales_right_angle` validates both dot-product orthogonality and `atan2`-measured degree angle.

---

### `PCL-G28` — Area Equivalence vs. Center Separation ($K_o = K_c$, $O_o \neq O_c$)
- **ID:** `PCL-G28`
- **Name:** Structural Equivalence of $K_o$ and $K_c$ Metrics with Distinct Centers
- **RAW Expression:** `areaDiffWithKc = area - circleCArea`, `centerDistanceToKc = Math.hypot(center.x - circleCCenter.x, center.y - circleCCenter.y)`
- **NORMALIZED Expression:** $K_o = K_c = \frac{\pi c^2}{4}, \quad L_o = L_c = \pi c, \quad D_o = D_c = c, \qquad |O_o - O_c| = \left\|\left(\frac{b}{2}, \frac{a}{2}\right) - \left(\frac{a+b}{2}, \frac{a+b}{2}\right)\right\| = \frac{c}{2} > 0$
- **UMFP Structural Classification:** `Derived Geometric Comparison Identity`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $a, b > 0$, $c = \sqrt{a^2+b^2}$.
- **Domain Constraints:** `PCL-C08`–`PCL-C10`, `PCL-G25`, `PCL-G26`.
- **Mathematical Foundation:** Displacement vector $O_c - O_o = \left(\frac{a}{2}, \frac{b}{2}\right)$ has Euclidean norm $\frac{\sqrt{a^2+b^2}}{2} = \frac{c}{2} > 0$, proving $K_o$ and $K_c$ are congruent yet distinct circles.
- **Dependencies:** `PCL-C08`, `PCL-C10`, `PCL-G25`, `PCL-G26`.
- **Implementation Location:** `ThalesCircumcircle.ts`, `thales_area_eq_Kc` (`ThalesValidators.ts`), and `KcVsKoComparison.tsx`.
- **Verification Method:** Verified at `1e-12` area diff and `1e-9` center-distance equality across control triples (`src/tests/geometry.test.ts`, Section 9a).
- **Diagnostics / Insight Notes:** Visually clarifies why $K_o$ encloses $\triangle OAB$ while $K_c$ sits inside exterior square $Q_c$.

---

### `PCL-G29` — Parametric Thales Invariance & Absolute Growth ($t = b/a$)
- **ID:** `PCL-G29`
- **Name:** Constant Normalized Ratios and Monotonic Unit-Leg Growth of $K_o(t)$
- **RAW Expression:** `thalesNorm = { RoOverC: 0.5, DoOverC: 1, KoOverKc: 1, LoOverLc: 1, RoOverRc: 1 }`, `thalesAbs = { Ro, Do, Ko, Lo }` at $(a=1, b=t)$
- **NORMALIZED Expression:**
  $$\frac{K_o(t)}{K_c(t)} = \frac{L_o(t)}{L_c(t)} = \frac{D_o(t)}{c(t)} = 1,\; \frac{R_o(t)}{c(t)} = \frac{1}{2}; \qquad R_o^*(t) = \frac{\sqrt{1+t^2}}{2},\; D_o^*(t) = \sqrt{1+t^2},\; L_o^*(t) = \pi\sqrt{1+t^2},\; K_o^*(t) = \frac{\pi(1+t^2)}{4}$$
- **UMFP Structural Classification:** `Parametric Functional Relation`
- **UMFP Validity Status:** `DERIVED` & `VERIFIED`
- **Variables & Scope:** $t = b/a \in (0, +\infty)$.
- **Domain Constraints:** `PCL-F18` ($t > 0$, finite).
- **Mathematical Foundation:** Similarity invariance fixes $K_o/K_c = 1$ and $R_o/c = 1/2$, while fixing unit leg $a = 1, b = t$ makes $c^*(t) = \sqrt{1+t^2}$ strictly increasing on $(0, +\infty)$.
- **Dependencies:** `PCL-F18`, `PCL-G26`, `PCL-G28`.
- **Implementation Location:** `evaluateParametricFourCircles`, `getThalesNormalizedValueForMode`, `sampleThalesAbsoluteCurves` (`FourCirclesSpectralAnalysis.ts`), rendered in `SpectralAnalysisPanel.tsx`.
- **Verification Method:** Tested across $t \in [0.05, 20]$ for constant ratios, strict monotonicity of `thalesAbs`, and `sampleThalesAbsoluteCurves` (`src/tests/geometry.test.ts`, Section 9e).
- **Diagnostics / Insight Notes:** Rendered both as an optional normalized overlay and in the dedicated `Abs. Growth K_o(t)` tab.

---

### `PCL-G30` — Proportional Scaling Transformation and Homogeneity Law ($\lambda > 0$)
- **ID:** `PCL-G30`
- **Name:** Proportional Scaling Transformation & Homogeneity Law of Degrees 1 and 2
- **RAW Expression:** `scaleTriangleGeometry(baseA, baseB, lambda)`, `sampleThalesScaleCurves(options)`
- **NORMALIZED Expression:**
  $$\mathbf{x}' = \lambda \mathbf{x} \implies a(\lambda) = \lambda a_0, \quad b(\lambda) = \lambda b_0, \quad c(\lambda) = \lambda c_0, \quad t = \frac{b(\lambda)}{a(\lambda)} \equiv \frac{b_0}{a_0} = \text{const}$$
  $$\text{Linear Metrics (Degree 1): } D_o(\lambda) = \lambda D_o(1), \quad R_o(\lambda) = \lambda R_o(1), \quad L_o(\lambda) = \lambda L_o(1), \quad r(\lambda) = \lambda r(1)$$
  $$\text{Area Metrics (Degree 2): } K_o(\lambda) = \lambda^2 K_o(1), \quad K_c(\lambda) = \lambda^2 K_c(1), \quad K_i(\lambda) = \lambda^2 K_i(1), \quad S_c(\lambda) = \lambda^2 S_c(1)$$
  $$\text{Central Identity Invariance: } \sqrt{K_a(\lambda)} + \sqrt{K_b(\lambda)} = \lambda\left(\sqrt{K_a(1)} + \sqrt{K_b(1)}\right) \equiv \lambda\left(\sqrt{K_c(1)} + \sqrt{K_i(1)}\right) = \sqrt{K_c(\lambda)} + \sqrt{K_i(\lambda)}$$
- **UMFP Structural Classification:** `Parametric Scaling Transformation & Homogeneity Law`
- **UMFP Validity Status:** `VERIFIED` *(Section 10 of test suite)*
- **Variables & Scope:** $\lambda > 0$, base triangle $(a_0, b_0, c_0) \in \mathbb{R}_{>0}^3$.
- **Domain Constraints:** $a_0 > 0, b_0 > 0, \lambda \in (0, +\infty)$. Canonical baseline: $(a_0=3, b_0=4, c_0=5)$ with $\lambda = c / 5.0$.
- **Mathematical Foundation:** Linear scaling is a homothety with scale factor $\lambda$. Any metric of dimension $[L^1]$ is a homogeneous function of degree 1 ($f(\lambda \mathbf{x}) = \lambda f(\mathbf{x})$), while any metric of dimension $[L^2]$ is homogeneous of degree 2 ($f(\lambda \mathbf{x}) = \lambda^2 f(\mathbf{x})$). The central identity is homogeneous of degree 1 because $\sqrt{K} \sim [L^1]$, rendering it invariant for all $\lambda > 0$.
- **Dependencies:** `PCL-A01`, `PCL-C08`–`PCL-C10`, `PCL-D12`, `PCL-E16`, `PCL-G26`.
- **Implementation Location:** `scaleTriangleGeometry` and `sampleThalesScaleCurves` in `ThalesCircumcircle.ts`; live interactive controls in `ControlsPanel.tsx`, `ThalesCircumcirclePanel.tsx`, and `SpectralAnalysisPanel.tsx` (Tab `Scale λ`).
- **Verification Method:** Verified across identity ($\lambda = 1.0$), double ($\lambda = 2.0$), half ($\lambda = 0.5$), shape independence, invariant preservation, and invalid input rejection (`src/tests/geometry.test.ts`, Section 10a–10f).
- **Diagnostics / Insight Notes:** Provides the orthogonal decomposition of triangle configurations into shape space ($t = b/a \in \mathbb{R}_{>0}$) and scale space ($\lambda = c / 5.0 \in \mathbb{R}_{>0}$).

