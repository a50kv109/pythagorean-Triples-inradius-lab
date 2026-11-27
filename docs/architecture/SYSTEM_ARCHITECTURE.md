# System Architecture

**Project:** Pythagoras Circles — Canonical Geometry Research Laboratory  
**Milestone:** M2 Baseline (M1 Exact Core + M2 Number Theory Engine + Geometry Lab)

## 1. Architectural Overview

The application is structured as a modular client-side Single Page Application (SPA) built with React 19, TypeScript, Vite, and Tailwind CSS. It combines continuous Euclidean geometry visualization with a rigorous discrete number theory computational engine.

```text
┌────────────────────────────────────────────────────────┐
│                      React 19 UI                       │
│     (App.tsx, Navigation, Panels, Modals, Canvas)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Runtime Presentation                  │
│       (FourCirclesModel, ThalesCircumcircle, Svg)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                  M2 Number Theory Engine               │
│       (factorize, divisors, hyperbola pairs, counters) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   M1 Exact Core                        │
│       (BigInt arithmetic, ExactRational, primitives)   │
└────────────────────────────────────────────────────────┘
```

## 2. Core Computational Layers

1. **M1 — Exact Computation Core (`src/core/exact/`):**
   - Pure `BigInt` arithmetic, strict integer string parsing (`parseIntegerBigInt`), exact non-negative greatest common divisor (`gcdBigInt`), exact integer square roots via Newton's method (`isqrtBigInt`), and normalized immutable exact rational numbers (`ExactRational`).
   - Zero floating-point dependency (`Math.*`, `Number()`, `parseFloat` are strictly banned).

2. **M2 — Number Theory Engine (`src/core/factorization/`):**
   - Canonical prime factorization (`factorizeBigInt`) with trial division wheel, Pollard-Brent cycle finding, and 3-tier prime certification (`PROVEN_PRIME`, `PROBABLE_PRIME`, `UNFACTORED_COMPOSITE`).
   - Exact divisor generation, hyperbola divisor pair construction ($xy = 2r^2$), and arithmetic counters ($\omega^*(r), \tau(r), T(r), N(r)$).

3. **Legacy / Runtime Geometry Laboratory (`src/math/`, `src/canonical/`, `src/geometry/`):**
   - Continuous Euclidean models for the four circles, incenter partition, Thales circumcircle ($K_o$), and spectral analysis curves.
   - Mapped explicitly to canonical coordinate standards (`CANONICAL_OPPOSITE_SIDE_V1`).

## 3. Determinism and Data Flow
All computational pipelines in M1 and M2 are fully deterministic: identical inputs yield identical canonical BigInt outputs. Floating-point calculations are strictly restricted to the rendering and charting layers (`M7` visual adapters).
