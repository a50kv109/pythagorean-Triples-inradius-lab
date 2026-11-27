# Development Roadmap — Four-Circles Pythagorean Geometry Lab

The items below represent **proposed future directions** for the project. None of the features in this document are currently implemented.

---

## 1. Mathematical & Analytical Extensions

- **Additional Circle & Triangle Identities:**
  - Explore relationships involving the three **excircles** ($r_a = \frac{a+c-b}{2}$, $r_b = \frac{b+c-a}{2}$, $r_c = \frac{a+b+c}{2}$) alongside $K_i$ and the square-inscribed circles.
  - Examine the semiperimeter and circumradius ($R_{\triangle} = c/2$) connections with $K_c$ (whose radius equals the circumradius of $\triangle OAB$).
- **True Discrete Harmonic / Spectral Analysis Layer:**
  - If harmonic decomposition of the four-circle angular intervals ($N = 4$) is pursued as a dedicated analytical layer, implement an explicit DFT amplitude/phase/symmetry module separate from the current parametric ratio plots.
- **Additional Parametric Modes:**
  - Plot absolute area residual $K_i(t) / K_c(t)$ alongside normalized $\sqrt{K_x(t)} / \sqrt{K_c(t)}$ curves.
  - Plot sensitivities (analytical derivatives $\frac{d}{dt}(K_x/K_c)$ and $\frac{d}{dt}(R_i/R_c)$) showing explicitly where $d(R_i/R_c)/dt = 0$ at $t = 1$.

---

## 2. Data Export & Reproducibility

- **Parametric Dataset Export (CSV / JSON):**
  - Export sampled curve tables across $[t_{\min}, t_{\max}]$ (areas, perimeters, radii, diameters, and identity residuals) as CSV or JSON for external inspection in Python/NumPy/R/Mathematica.
- **Shareable URL State:**
  - Encode `(a, b)`, active module, and graph settings in URL query parameters for reproducible experiment links.

---

## 3. UI & Educational Features

- **Guided Interactive Experiments:**
  - Built-in step-by-step inquiry scenarios (e.g., *"Why does $K_a + K_b = K_c$ hold while $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$?"*, *"Finding the maximum of $K_i/K_c$ at $t = 1$"*).
- **Fully Self-Contained Typography:**
  - Bundle `Plus Jakarta Sans` and `JetBrains Mono` locally if strict air-gapped UI font matching is desired (`katex` CSS and math fonts are already bundled locally via Vite).

---

## 4. Verification & Repository Infrastructure

- **Browser & Component Testing:**
  - Add Vitest + React Testing Library tests for `SpectralAnalysisPanel` and `GeometryBoard`, plus Playwright E2E visual regression checks.
- **GitHub Actions CI Workflow:**
  - Automate `bun install --frozen-lockfile`, `npm test`, `npm run lint`, and `npm run build` on pull requests.
- **Archival Pruning (Optional):**
  - Optionally remove `docs/archive/legacy-pythagorean-pants/` if archival history is no longer needed in a future release.
