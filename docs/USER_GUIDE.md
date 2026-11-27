# User Guide — Four-Circles Pythagorean Geometry Lab

This practical guide explains how to launch, operate, and interpret the **Four-Circles Pythagorean Geometry Lab**.

---

## 1. Launching the Application

1. Install dependencies (first time only):
   ```bash
   bun install --frozen-lockfile   # or: npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
   *(Default view opens on **01. Four Circles** with the classic Egyptian triangle $a = 4,\; b = 3,\; c = 5,\; r = 1$.)*

---

## 2. Changing Triangle Parameters

You can adjust the legs $a$ (vertical $OA$) and $b$ (horizontal $OB$) in four synchronized ways:

1. **Direct Manipulation on the Canvas:** Drag purple vertex **$A$** vertically along the $Y$-axis or vertex **$B$** horizontally along the $X$-axis. Drag anywhere on the empty grid to pan; use the mouse wheel or `+` / `-` buttons to zoom.
2. **Sliders & Numeric Inputs (`ControlsPanel`):** Use the sliders (`0.5` to `12.0`) or type exact numbers (`0.2` to `15.0`) into the `Катет a` and `Катет b` fields.
3. **Control Triangle Presets:** Click any benchmark preset button such as `(3, 4, 5)`, `(5, 12, 13)`, `(4, 4, 4√2)`, `(1, 10, √101)`, `(10, 1, √101)`, or `(8, 15, 17)`.
4. **Continuous Sweep:** Click **«Плавное изменение (a, b)»** to animate proportions continuously (`0.5x`, `1x`, `2x` speed), or click **«Сброс (3-4-5)»** to restore $(4, 3)$.

---

## 3. Inspecting the Four Circles & Identity

Use the top navigation tabs to switch focus:

- **`01. Четыре круга` (`01. Four Circles`):** Full geometric construction showing $\triangle OAB$, squares $Q_a, Q_b, Q_c$, circles $K_a$ (blue), $K_b$ (emerald), $K_c$ (rose), $K_i$ (amber), optional dashed violet Thales circumcircle $K_o$, and the $K_c$ vs. $K_o$ comparison table.
- **`02. Тождество √K` (`02. √K Identity`):** Displays the algebraic proof of $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ alongside live LHS, RHS, and residual values.
- **`03. Вписанный круг Kᵢ` (`03. Incircle Kᵢ`):** Dims exterior squares to highlight the incircle $K_i$, its center $I(r, r)$, and tangency points $T_a, T_b, T_c$.
- **`05. Окружность Фалеса Kₒ` (`05. Thales Circle Kₒ`):** Focuses on the circumscribed Thales circle $K_o$ around $\triangle OAB$, showing $D_o = c$, $R_o = c/2$, $K_o = \pi c^2/4$, $L_o = \pi c$, vertex equidistance ($|O_o-A| = |O_o-B| = |O_o-O|$), $\angle AOB = 90^\circ$, 3-center comparison ($I$ vs. $O_o$ vs. $O_c$), and $K_c$ vs. $K_o$.

**Canvas Toolbar Controls:**
- **Layer Filters:** `Все` (All), `△ и Kᵢ`, `Квадраты Q`, `Круги K_a,b,c`, `4 круга`, `Фалес K_o`, `5 кругов`.
- **Visual Toggles:** `K_o` (show/hide Thales circumcircle), `Сетка` (Grid), `Подписи` (Labels), `Центры` (Centers), `Радиусы` (Radii), `Углы` (Angles).
- **Hover Inspection:** Move the pointer over any circle (including the perimeter ring of $K_o$), square, side, or vertex to read its exact coordinates and formula in the bottom-right canvas tooltip.

---

## 4. Using the Parametric Function Graph (`04. Спектральный анализ`)

Click **`04. Спектральный анализ`** (`04. Spectral Analysis`) in the top bar to open the interactive parametric plotting panel.

### 4.1 Switching Between Analysis Modes
Select one of the five tabs at the top of the panel:
1. **Площади (Areas):** Plots normalized circle areas $K_x(t) / K_c(t)$ (with optional **`+ K_o`** overlay at $K_o/K_c = 1$).
2. **Периметры (Perimeters):** Plots normalized circumferences $P_x(t) / P_c(t)$ where $P = 2\pi R = \pi D$ (optional **`+ K_o`** at $L_o/L_c = 1$).
3. **Радиусы / Диаметры (Radii / Diameters):** Plots $R_x(t) / R_c(t)$ or $D_x(t) / D_c(t)$ with a **`Радиусы (R)` / `Диаметры (D)`** toggle (optional **`+ K_o`** shows $R_o/c = 0.5$ or $D_o/c = 1$).
4. **Рост K_o(t) (Abs. Growth K_o(t)):** Plots unnormalized unit-leg ($a = 1, b = t$) monotonic curves $R_o^*(t), D_o^*(t), L_o^*(t), K_o^*(t)$ with dynamic Y-axis scaling and live pointer scrubbing.
5. **Масштаб λ (Scale λ):** Visualizes the two-parameter Homogeneity Law over $\lambda \in [0.2, 2.5]$ at constant aspect ratio $t = b/a$. Plots linear growth $D_o, R_o, L_o \sim \lambda^1$ (dashed) alongside quadratic area growth $K_o, K_i \sim \lambda^2$ (solid), with reference buttons ($\lambda = 0.5, 1.0, 1.5, 2.0$) and a live degree-of-homogeneity verification table.

### 4.2 Interacting with the Cartesian Graph
- **Direct Scrubbing:** Click or drag horizontally anywhere inside the Cartesian SVG plot (`cursor-crosshair`). The vertical pink cursor and the four colored dots move along the curves while simultaneously updating $t = b/a$, the triangle $(a, b)$ on the geometry board, and all numeric tables.
- **Axis Scale (`Лог. t` / `Линейн. t`):**
  - **Logarithmic (`Лог. t`, default):** Centers the symmetry point $t = 1$ so reciprocal configurations ($t$ and $1/t$) appear symmetrically on the left and right.
  - **Linear (`Линейн. t`):** Shows uniform spacing along $t$.
- **Zoom & Reset:**
  - Click the **Zoom In (`+`)** and **Zoom Out (`-`)** buttons to narrow or widen the $t$ interval around the current value.
  - Click **`[0.1, 10]`** to reset the horizontal axis to the default range $0.1 \le t \le 10$.
  - If the current triangle lies outside a zoomed range, click **«Включить в диапазон»** in the amber notice bar to auto-fit the view.
- **Symmetry Controls:**
  - Click **`t = 1 (Симметрия)`** to jump directly to the symmetric isosceles right triangle ($a = b$).
  - Click **«Пройти через симметрию»** to sweep smoothly back and forth across $t = 1$ (click **«Пауза»** to stop).

### 4.3 Reference Parameter Points
Below the graph, click any of the five preset ratio cards:
- `t = 0.1` · `t = 0.5` · `t = 1.0 (Симметрия)` · `t = 2.0` · `t = 10.0`

Each card displays the exact precomputed normalized values for the active mode and highlights automatically when the active triangle matches that ratio.

---

## 5. Interpreting Displayed Values

### Synchronized Current-Point Strip & Analytical Table
- **Текущая точка:** Displays exact `t = b/a` and the four color-coded normalized ratios (`K_a/K_c`, `K_b/K_c`, `K_c/K_c = 1.0000`, `K_i/K_c` — or `P`, `R`, `D` equivalents).
- **Geometry Summary Bar:** Shows `t = b/a`, legs `a` and `b`, hypotenuse `c`, and inradius `r` from the shared calculation state.
- **Five-Circle Table:** Lists for each circle ($K_a, K_b, K_c, K_i, K_o$):
  1. Normalized ratio to $K_c$ in the selected mode,
  2. Area $K$ (square units),
  3. Perimeter $P$ (linear units),
  4. Radius $R$ and Diameter $D$ (linear units).
- **Live (a, b) vs. Unit (1, t) vs. Invariant Ratio Table:** Directly contrasts the current triangle's dimensional $R_o, D_o, L_o, K_o$, unit-leg values $R_o^*, D_o^*, L_o^*, K_o^*$, and scale-invariant ratios ($R_o/c = 0.5$, $D_o/c = 1$, $L_o/L_c = 1$, $K_o/K_c = 1$).
- **Долевое распределение (Collapsible):** Expands a secondary proportional bar comparison showing each core circle's percentage share of total area/perimeter.

### Live Invariant Verification (`InvariantsPanel`)
Below the analytical panel, all 17 mathematical invariants (grouped into **8 Core Four-Circle** and **9 Thales Circumcircle $K_o$** invariants) are checked continuously at tolerance $10^{-9}$, showing exact calculated vs. expected values and relative discrepancy $\Delta$.

---

## 6. Exporting, Saving, and Comparing

In the bottom toolbar (`BottomToolbar`):
- **Отменить / Вернуть (`Ctrl+Z` / `Ctrl+Y`):** Step through recent `(a, b)` changes.
- **Сохранить / Загрузить:** Save configurations in browser `localStorage` or export/import `.json` files.
- **Снимок PNG / SVG:** Download a high-resolution PNG or vector SVG snapshot of the geometry board.
- **Пошагово:** Animate layer-by-layer construction (`△ и Kᵢ` $\to$ `Квадраты Q` $\to$ `Круги K_a,b,c` $\to$ `Фалес K_o` $\to$ `5 кругов` $\to$ `Все`).
- **Сравнить (Header):** Compare the current 5-circle configuration side-by-side with another configuration (including $R_o, K_o$ and violet dashed $K_o$ previews).
- **Тесты 17/17 (Header):** Inspect all 5 control triangles (`17/17` invariants, $r$, and $R_o$) and load any of them onto the board.
- **RU / UK / EN:** Switch the entire user interface (navigation, toolbar popovers, SVG hover tooltips, controls, analytical panels, invariant checkers, and modals) between Russian, Ukrainian, and English.
