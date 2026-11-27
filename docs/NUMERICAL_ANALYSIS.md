# Numerical Analysis — Four-Circles Pythagorean Geometry Lab (PCL)

This document analyzes IEEE-754 `float64` precision, overflow/underflow limits, algebraic cancellation avoidance, domain clamping tiers, and discrete sampling behavior across `src/math/`, `src/App.tsx`, and `src/components/`.

---

## 1. IEEE-754 `float64` Machine Arithmetic Baseline

- **Format:** Standard JavaScript `number` (IEEE-754 double precision, 53-bit significand).
- **Machine Epsilon:**
  $$\varepsilon_{\text{mach}} = 2^{-52} \approx 2.220446049250313 \times 10^{-16}$$
  Providing approximately $15$–$17$ significant decimal digits for non-cancelling operations.
- **Finite Range:** `Number.MIN_VALUE` $\approx 5 \times 10^{-324}$ (subnormal minimum), normal minimum $\approx 2.225 \times 10^{-308}$, `Number.MAX_VALUE` $\approx 1.7976931348623157 \times 10^{308}$.

---

## 2. Computational Kernel Analysis (`src/math/`)

### 2.1 Hypotenuse $c = \sqrt{a^2 + b^2}$ (`RightTriangle.ts`, `SquareConstruction.ts`)
- **Naive Vulnerability:** Evaluating `Math.sqrt(a * a + b * b)` overflows prematurely to `Infinity` when $\max(a, b) > \sqrt{\text{MAX\_VALUE}} \approx 1.34078 \times 10^{154}$ and underflows to `0` when $\max(a, b) < \sqrt{\text{MIN\_NORMAL}} \approx 1.49 \times 10^{-154}$.
- **Actual Mitigation:** `calculateRightTriangle` and `calculateSquareC` use `Math.hypot(validA, validB)` (`PCL-A03`), which rescales by $\max(|a|, |b|)$ internally so $c$ stays accurate across the full `float64` exponent range up to $c \le \text{Number.MAX\_VALUE}$.

### 2.2 Cancellation-Free Inradius $r$ (`FourCirclesModel.ts`)
- **Naive Vulnerability:** Evaluating $r = \frac{a + b - c}{2}$ directly suffers **catastrophic subtractive cancellation** when $a \ll b$ or $b \ll a$. For example, if $a = 1$ and $b = 10^8$, then $c = \sqrt{10^{16} + 1} \approx 10^8 + 5\times 10^{-9}$, causing $b - c$ to lose $\approx 16$ decimal digits in `float64` (producing $r = 0$ instead of $\approx 0.5$ once $b/a \gtrsim 10^8$).
- **Actual Mitigation (`PCL-D12`):** `FourCirclesModel.ts` evaluates:
  ```ts
  const perimeter = validA + validB + c;
  const rIn = (validA / perimeter) * validB;
  ```
  which is algebraically equivalent to $\frac{ab}{a+b+c} = \frac{a+b-c}{2}$ (`MATHEMATICAL_PROOFS.md`, Theorem 1), involves only positive additions, and divides `validA / perimeter` before multiplying by `validB` so intermediate `validA * validB` cannot prematurely overflow.

### 2.3 Direction Cosines & Altitude (`RightTriangle.ts`, `FourCirclesModel.ts`)
- `cosAlpha = validA / c` and `sinAlpha = validB / c` are normalized before computing `altitude`, `altitudePoint`, `projectionA`, `projectionB`, and `incircle.tangencyAB`, keeping linear geometric projections overflow-safe.

### 2.4 Quadratic Quantities ($S_x$, $K_x$) & Square Roots (`FourCirclesModel.ts`)
- **Square & Circle Areas:** $S_x = s^2$ and $K_x = \frac{\pi s^2}{4}$ scale quadratically, so IEEE-754 `float64` exhibits:
  - **Quadratic underflow** ($K_x \to 0$) when $s \lesssim 10^{-162}$ (or for $K_i$ when $r \lesssim 10^{-162}$ under extreme scale/asymmetry).
  - **Quadratic overflow** ($K_x \to \infty$) when $c \gtrsim 1.51 \times 10^{154}$ (since $\frac{\pi}{4}c^2 > \text{MAX\_VALUE}$).
- **Important Nuance in `FourCirclesModel.ts`:**
  - `circle.sqrtArea` is computed linearly as `(SQRT_PI * s) / 2` (or `SQRT_PI * rIn`), which never prematurely overflows inside `float64`.
  - However, `sqrtSumLegs` and `sqrtSumHypAndIn` compute `Math.sqrt(areaKa) + Math.sqrt(areaKb)` and `Math.sqrt(areaKc) + Math.sqrt(areaKi)` from the quadratic areas, so those aggregate fields inherit the quadratic $\sim 10^{-162} \dots 10^{154}$ bounds (`NUMERICAL_ANALYSIS.md` Section 3).

---

## 3. Scale & Asymmetry Behavior

| Leg Domain $(a, b)$ | Hypotenuse $c$ (`Math.hypot`) | Inradius $r$ (`a/(a+b+c)*b`) | Areas $K_x$ & Identity Residual $\Delta_{\text{rel}}$ | Verification Status |
|---|---|---|---|---|
| $[0.2, 15]$ (Interactive UI `App.tsx`) | Exact (`float64`) | Exact (no cancellation) | $\Delta_{\text{rel}} < 10^{-15}$ | Tested in `geometry.test.ts` (`(0.2, 15)`, `(15, 0.2)`) |
| $[10^{-6}, 10^{-4}]$ (Micro scale) | Exact (`float64`) | Exact | $\Delta_{\text{rel}} < 10^{-15}$ | Tested in `geometry.test.ts` (`1e-6`, `1e-4`) |
| $[1, 10^5]$ & $[10^5, 1]$ (High asymmetry) | Exact (`float64`) | Exact (cancellation-free) | $\Delta_{\text{rel}} < 10^{-14}$ | Tested in `geometry.test.ts` (`(1, 1e5)`, `(1e5, 1)`) |
| $[10^{50}, 2\times 10^{50}]$ (Macro scale) | Exact (`float64`) | Exact | $\Delta_{\text{rel}} < 10^{-14}$ | Tested in `geometry.test.ts` (`(1e50, 2e50)`) |
| $s \lesssim 10^{-162}$ (Subnormal/Underflow regime) | Accurate down to $\sim 10^{-308}$ | Accurate | Quadratic $K_x$ underflows to `0` | Analytical `float64` bound (not unit-tested) |
| $s \gtrsim 1.51 \times 10^{154}$ (Overflow regime) | Accurate up to $\sim 10^{308}$ | Accurate until `a+b+c` overflows | Quadratic $K_x$ overflows to `Infinity` | Analytical `float64` bound (not unit-tested) |

---

## 4. Input Domains, Clamping Tiers & UI Quantization

The codebase separates core mathematical generality from interactive viewport constraints:

1. **Core Domain (`src/math/inputValidation.ts`):** `assertValidLegs(a, b)` enforces only finite $a, b > 0$ (`PCL-A01`).
2. **Root State Clamping (`src/App.tsx`, `clampVal`):** Interactive mutations clamp each leg to $[0.2, 15]$ and round to **4 decimal places**:
   ```ts
   Math.max(0.2, Math.min(15, Math.round(val * 10000) / 10000))
   ```
   This introduces a step quantization of $\le 5 \times 10^{-5}$ per leg during UI adjustments, which can shift $t = b/a$ slightly when setting very small legs, while preserving exactness of `calculateFourCircles(a, b)` on the rounded state.
3. **Panel Slider Bounds (`src/components/panels/ControlsPanel.tsx`):** Range sliders span $[0.5, 12]$ with `step="0.1"`, while numeric number inputs allow `[0.5, 15]` (clamped to `[0.2, 15]` by `App.tsx`).
4. **Parametric Sync (`legsFromRatioAndHypotenuse` in `FourCirclesSpectralAnalysis.ts`):**
   - Computes $a = c_0 / \sqrt{1 + t^2}$, $b = a t$ via `Math.hypot(1, targetT)`.
   - Applies uniform similarity scaling if $\min(a,b) < 0.2$ or $\max(a,b) > 15$, preserving $b/a = t$ identically whenever $t \in [0.2/15, 15/0.2] = [0.01\overline{3}, 75]$.
   - For extreme ratios $t < 1/75$ or $t > 75$, the final per-leg clamp (`Math.max(0.2, Math.min(15, ...))`) clips the ratio to $[1/75, 75]$. Note that in `SpectralAnalysisPanel.tsx` default/typical zoom ranges stay well inside $[0.02, 50]$.

---

## 5. Parametric Curve Sampling & Display Rounding

1. **Discrete Sampling (`sampleSpectralCurves` in `FourCirclesSpectralAnalysis.ts`):**
   - `SpectralAnalysisPanel.tsx` evaluates `sampleSpectralCurves` with `steps: 220` (default function parameter is `200`), generating 221 uniformly spaced points in either $\log_{10} t$ (`scaleMode = 'log'`) or $t$ (`scaleMode = 'linear'`).
   - Whenever $t_{\min} \le 1 \le t_{\max}$ and no grid sample lies within $10^{-9}$ of $1$, `sampleSpectralCurves` explicitly appends $t = 1$ and re-sorts, ensuring the exact symmetry point and global maximum `PCL-F23` are rendered without discretization error.
2. **Display vs. Internal Precision:**
   - Tables and metric cards format numbers to $2$–$4$ decimal places (`toFixed(2)`–`toFixed(4)`) or $4$–$8$ significant digits (`toPrecision`), while internal geometry, validators, and graph cursor coordinates retain full `float64` precision.
   - Automatic invariant validators (`FourCirclesValidators.ts`) and unit tests (`geometry.test.ts`) use scale-normalized relative tolerance $\text{tol} = 10^{-9}$ (`DEFAULT_TOLERANCE`), providing a $10^5$–$10^6\times$ safety margin above $\varepsilon_{\text{mach}}$ while remaining 5+ orders of magnitude tighter than pixel rendering tolerances.
