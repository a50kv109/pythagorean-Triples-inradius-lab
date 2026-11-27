# Release Notes — Pythagoras — Four Circles Geometry Lab v1.2.0

**Release Tag:** `v1.2.0`  
**Target Repository:** `Pythagoras-Circles-Lab` (`https://github.com/a50kv109/Pythagoras-Circles-Lab`)  
**Author:** Andrey Artsybashev (`Copyright (c) 2026 Andrey Artsybashev`)  
**License:** MIT  
**Status:** **READY FOR GITHUB PUBLICATION**

---

## 1. Overview of v1.2.0

Version `v1.2.0` introduces a major mathematical and architectural extension to the **Four-Circles Pythagorean Geometry Lab**: the **Two-Parameter Orthogonal Model ($t, \lambda$)** and true scale-dependent behavior for the fifth geometric layer (**Thales Circumcircle $K_o$**).

While previous versions successfully integrated Thales' circumcircle ($O_o = \frac{A+B}{2}$, $\angle AOB = 90^\circ$, $K_o = K_c$), varying the shape parameter $t = b/a$ at constant hypotenuse kept the circumcircle diameter fixed. Version `v1.2.0` decouples triangle **shape ($t = b/a$)** from system **scale ($\lambda = c / c_0$)**, allowing independent exploration of proportions and sizing while rigorously preserving all 17 mathematical invariants and the central square-root identity.

---

## 2. Key New Features & Architectural Enhancements

1. **Two-Parameter Orthogonal Decomposition ($t, \lambda$):**
   - **Shape Parameter ($t = b/a \in (0, +\infty)$):** Modifies right triangle proportions at constant hypotenuse.
   - **Scale Parameter ($\lambda = c / c_0 > 0$):** Scales the entire geometric system proportionally ($\lambda = 1.0$ corresponds to the canonical 3-4-5 Egyptian triple baseline).
2. **Scale-Dependent Thales Circumcircle ($K_o$) & Homogeneity Law:**
   - Linear metrics ($D_o, R_o, L_o, r$) scale strictly with degree 1 ($\sim \lambda^1$).
   - Quadratic area metrics ($K_o, K_c, K_i, S_c$) scale strictly with degree 2 ($\sim \lambda^2$).
   - Universal invariance of the central square-root identity $\sqrt{K_a(\lambda)} + \sqrt{K_b(\lambda)} = \sqrt{K_c(\lambda)} + \sqrt{K_i(\lambda)}$ for all $\lambda > 0$.
3. **Interactive Scale Controls & Presets:**
   - Dedicated scale slider ($\lambda \in [0.2, 2.5]$) in `ControlsPanel.tsx` and `ThalesCircumcirclePanel.tsx`.
   - Quick jump buttons for standard scales ($\lambda = 0.5x, 1.0x, 1.5x, 2.0x$) and reset to baseline ($\lambda = 1.0$).
4. **New Spectral Analysis Tab — «Масштаб $\lambda$» (Scale $\lambda$):**
   - Plots absolute growth curves $D_o(\lambda), R_o(\lambda), L_o(\lambda)$ (dashed) and $K_o(\lambda), K_i(\lambda)$ (solid) over $\lambda$.
   - Includes reference scale line $\lambda = 1.0$, live coordinate readout, and a degree-of-homogeneity verification table.
5. **Expanded Test Suite (Section 10):**
   - Comprehensive unit tests covering $\lambda = 1.0$ identity, $\lambda = 2.0$ (doubling lengths, quadrupling areas), $\lambda = 0.5$ (halving lengths, quartering areas), $t$ vs. $\lambda$ independence, 17-invariant preservation across $\lambda \in [0.1, 10.0]$, and input range validation (`10/10 test sections passing`).
6. **UMFP-aligned Formula Passport Documentation (`PCL-G30`):**
   - Added formula passport `PCL-G30` for the Proportional Scaling Transformation and Homogeneity Law, documenting passports `PCL-A01`–`PCL-G30` strictly according to the UMFP methodology. Note that the UMFP software engine is not imported or executed in this application.

---

## 3. Mathematical Summary

For any right triangle with legs $a_0, b_0$ and hypotenuse $c_0 = \sqrt{a_0^2 + b_0^2}$:
$$a(\lambda) = \lambda a_0, \quad b(\lambda) = \lambda b_0, \quad c(\lambda) = \lambda c_0$$
The Thales circumcircle parameters satisfy:
$$D_o(\lambda) = \lambda c_0, \quad R_o(\lambda) = \frac{\lambda c_0}{2}, \quad L_o(\lambda) = \pi \lambda c_0, \quad K_o(\lambda) = \lambda^2 \frac{\pi c_0^2}{4} = \lambda^2 K_o(1)$$
Normalized ratio $K_o(\lambda) / K_c(\lambda) \equiv 1$ remains strictly invariant due to simultaneous quadratic scaling of $K_o$ and $K_c$.

---

## 4. Verification & Build Results

- **Automated Test Suite (`npm test`):** 10/10 test sections passed successfully (`tol = 1e-9`).
- **Static Type Check (`npm run lint` / `tsc --noEmit`):** 0 errors.
- **Production Build (`npm run build` / `vite build`):** Clean production bundle generated in `dist/` with offline-bundled KaTeX assets.

---

## 5. Instructions for Running

```bash
# 1. Install dependencies
bun install --frozen-lockfile

# 2. Run test suite
npm test

# 3. Start development server
npm run dev
```

*(Open `http://localhost:3000` in your browser).*
