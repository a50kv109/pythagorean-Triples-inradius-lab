// ... existing code ...
We further incorporate a fifth geometric object, the Thales circumcircle $K_o$ passing through all three vertices of $\triangle OAB$. Although $K_o$ shares identical scalar measures with the hypotenuse-square inscribed circle $K_c$ ($R_o = R_c = c/2$, $D_o = D_c = c$, $K_o = K_c = \pi c^2 / 4$), the two circles occupy distinct geometric loci whose centers $O_o$ and $O_c$ are separated by Euclidean distance $\|O_c - O_o\|_2 = c/2$, placing $O_c$ directly on the circumference of $K_o$. Finally, we formalize an independent shape-scale parameterization separating dimensionless triangle shape $t = b/a$ from proportional scale $\lambda > 0$, establish degree-1 and degree-2 homogeneity laws, and describe an open-source TypeScript/React computational laboratory (`Pythagoras-Circles-Lab`, v1.2.0) that evaluates 17 runtime geometric invariants alongside a 10-section automated numerical test suite.

## Keywords
// ... existing code ...
To support rigorous investigation of this configuration, we formalize:
1. a Cartesian coordinate model of the four circles ($K_a, K_b, K_c, K_i$) and the fifth Thales circumcircle ($K_o$);
2. an independent shape-scale parameterization into dimensionless shape $t = b/a$ and proportional scale $\lambda > 0$;
3. an open-source interactive computational environment, **Pythagoras-Circles-Lab** (`v1.2.0`), combining deterministic double-precision numerical evaluation, real-time invariant verification, and dual normalized/dimensional visualization modes.

---
// ... existing code ...
## 3. Mathematical Definitions

Within the construction of Section 2, four primary circles are defined: three inscribed in the outward squares $Q_a, Q_b, Q_c$, and one inscribed in $\triangle OAB$ (Euclid, *Elements*, Book IV, Proposition 4 [1]; see **Table 1**).

| Circle | Geometric Role | Center Coordinates | Radius ($R$) | Diameter ($D$) | Area ($K$) |
// ... existing code ...
## 8. Two-Parameter Model: Shape and Scale

To separate intrinsic angular proportions from overall geometric size, `Pythagoras-Circles-Lab` (`v1.2.0`) parameterizes the family of right triangles by two independent positive real parameters $(t, \lambda) \in (0, \infty) \times (0, \infty)$:

1. **Dimensionless Shape Parameter ($t = b/a > 0$):**
// ... existing code ...
## 10. Computational Implementation

The mathematical model is implemented in **Pythagoras-Circles-Lab** (`v1.2.0`), an open-source client-side web laboratory built with TypeScript, React, Vite, and SVG rendering (`https://github.com/a50kv109/Pythagoras-Circles-Lab`) [4]. The codebase separates pure mathematical computation from interactive presentation:

- **Pure Mathematical Core (`src/math/`):**
// ... existing code ...
## 13. Limitations and Future Research

1. **Euclidean Right-Triangle Domain Restriction:** All identities derived here hold specifically for non-degenerate Euclidean right triangles ($a, b > 0$, $\angle AOB = 90^\circ$). Generalizing to oblique triangles introduces an additional $\cos\gamma$ term via the law of cosines and alters the inradius expression.
2. **IEEE-754 `float64` Precision and Range Limits:** While automated tests confirm stability across $[10^{-6}, 10^{6}]$, extreme aspect ratios ($t < 10^{-8}$ or $t > 10^{8}$) cause subtractive cancellation in $r = \frac{a + b - c}{2}$. Using the algebraically equivalent form $r = \frac{ab}{a + b + c}$ eliminates subtractive cancellation, but does not remove IEEE-754 `float64` exponent range or 53-bit significand rounding limits ($\varepsilon_{\text{mach}} \approx 2.22 \times 10^{-16}$) [3]: at extreme absolute scales, the intermediate product $ab$ can overflow `Number.MAX_VALUE` ($\approx 1.80 \times 10^{308}$) for $a, b \gtrsim 1.34 \times 10^{154}$ or underflow near `Number.MIN_VALUE` ($\approx 5 \times 10^{-324}$), requiring standard scale-normalization by $\max(a, b)$ near exponent boundaries.
3. **UI End-to-End Testing Coverage:** Automated CI verification covers mathematical modules, invariant validators, and build integrity; adding headless Playwright/Cypress E2E tests for pointer dragging remains a future engineering task.
4. **Pedagogical Effectiveness:** No controlled classroom study has yet been conducted to measure student learning gains from using `Pythagoras-Circles-Lab`; educational utility is presented as a methodological design goal rather than an empirical finding.

---

## 14. Conclusion

We have presented a complete elementary derivation of the square-root area identity $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ linking the three exterior square-inscribed circles of a right triangle to its interior incircle, contrasted this degree-1 relation with the classical degree-2 Pythagorean area relation $K_a + K_b = K_c$, and established the exact center separation $\|O_c - O_o\|_2 = c/2$ distinguishing the hypotenuse-square inscribed circle $K_c$ from the Thales circumcircle $K_o$. Coupled with the separated shape-scale $(t, \lambda)$ parameterization and the open-source `Pythagoras-Circles-Lab` (`v1.2.0`) implementation, the framework provides a transparent, reproducible foundation for both elementary geometric analysis and interactive mathematical visualization.

---
// ... existing code ...