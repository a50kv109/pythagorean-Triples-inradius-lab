# 05 — Canonical Software Architecture

## 1. Verified Source Directory Structure

```text
src/
├── App.tsx                                      # Root state (a, b), Undo/Redo, 9 workspace modules, SVG/PNG export
├── main.tsx                                     # React DOM mount
├── index.css                                    # Tailwind CSS entry & KaTeX styling
├── canonical/                                   # Pure Canonical Opposite-Side Mathematical Core
│   ├── index.ts
│   ├── types.ts                                 # CanonicalFourCirclesModel & semantic types
│   ├── canonicalFourCircles.ts                  # Pure canonical builder (C=(0,0), A=(0,sideB), B=(sideA,0))
│   ├── canonicalValidators.ts                   # 8 scale-normalized canonical invariant checks
│   ├── semanticContract.ts                      # Shape ratio rho = sideA / sideB & normalized spectrum
│   └── legacyMapping.ts                         # Equivalence bridge between FourCirclesCalculations & Canonical
├── math/                                        # Runtime Geometry Engine & Research Modules
│   ├── inputValidation.ts                       # InvalidTriangleInputError & positive-finite guards
│   ├── RightTriangle.ts                         # Right triangle OAB calculations
│   ├── SquareConstruction.ts                    # Exterior squares Qa, Qb, Qc & unit diagonal vector
│   ├── ThalesCircumcircle.ts                    # Thales circumcircle K_o & lambda scaling helpers
│   ├── FourCirclesModel.ts                      # Master runtime calculator calculateFourCircles(a, b)
│   ├── FourCirclesValidators.ts                 # 8 scale-normalized Four-Circle invariant checks
│   ├── ThalesValidators.ts                      # 9 Thales checks + validateAllFiveCirclesInvariants (17 total)
│   ├── FourCirclesSpectralAnalysis.ts           # Parametric ratios over t = b/a and scale lambda = c/5
│   ├── IncenterPartition.ts                     # Sub-triangles SA, SB, SC & right-angle markers
│   ├── symmetryAnimation.ts                     # Logarithmic t <-> 1/t easing trajectory
│   ├── presets.ts                               # 6 benchmark triangles
│   └── experiments/                             # Experimental Modules (Exp 01–06)
│       ├── circleFirstClassification.ts         # Exp 01: incircle-first (r, t) parameterization
│       ├── arcBasedClassification.ts            # Exp 02: angular & linear quarter-arc discretization
│       ├── arcGeometricValidation.ts            # Exp 03: tangent-line & residual validation
│       ├── arcAngleParametricAnalysis.ts        # Exp 04: arc-angle zones & scale invariance
│       ├── incircleArcDistribution.ts           # Exp 05: three central arcs phi_A, phi_B, phi_C
│       └── arcSideAreaCorrespondence.ts         # Exp 06: laws L-01..L-07 (arc vs side vs sub-triangle area)
├── geometry/
│   └── transforms.ts                            # World-to-screen (toScreen) & screen-to-world (toMath)
├── types/
│   └── geometry.ts                              # Runtime types & ActiveModuleId union (9 modules)
├── i18n/
│   └── translations.ts                          # Trilingual dictionary: RU, UK, EN
├── components/
│   ├── common/                                  # Header.tsx, BottomToolbar.tsx, MathFormula.tsx
│   ├── geometry/                                # GeometryBoard.tsx, FourCirclesView.tsx, RightTriangleView.tsx,
│   │                                            # IncenterPartitionOverlay.tsx, IncenterPartitionControls.tsx,
│   │                                            # IncenterPartitionSpectralPanel.tsx, Arc* overlays
│   └── panels/                                  # ControlsPanel.tsx, FourCirclesPanel.tsx, SpectralAnalysisPanel.tsx,
│                                                # ThalesCircumcirclePanel.tsx, InvariantsPanel.tsx, Arc* panels,
│                                                # ComparisonModal.tsx, TestRunnerModal.tsx, HelpModal.tsx
└── tests/                                       # 16 executable TypeScript test files (see Doc 08)
    ├── geometry.test.ts
    ├── incenterPartition.test.ts
    ├── experiment01..06*.test.ts
    ├── semanticFormulaPassports.test.ts
    └── canonical/
        ├── test01..04*.canonical.test.ts
        ├── semanticContract.canonical.test.ts
        └── experiment06.strictRootAudit.test.ts
```

---

## 2. Architectural Separation of Concerns

1. **Canonical Mathematical Core (`src/canonical/`)**:
   Self-contained mathematical model enforcing the opposite-side convention (`CANONICAL_OPPOSITE_SIDE_V1`), validated independently of the legacy/runtime model and bridged via `legacyMapping.ts`.
2. **Runtime Mathematical Calculation Modules (`src/math/`)**:
   Pure functions computing `FourCirclesCalculations`, `IncenterPartitionModel`, `ThalesCircumcircleGeometry`, and parametric curves for the UI. Zero React/DOM dependencies.
3. **Experimental Modules (`src/math/experiments/`)**:
   Six progressive research modules exploring incircle-first ($r, t$) construction, arc discretization, tangency validation, arc-angle zones, three-arc distribution, and side–area–arc isomorphism.
4. **Visualization & UI Components (`src/components/`)**:
   - `GeometryBoard.tsx`: Interactive SVG canvas with vertex dragging ($A$, $B$, $T_{AB}$), pan/zoom, layer filters, and optional `IncenterPartitionOverlay` + `IncenterPartitionControls`.
   - `panels/`: Right-hand analytical panels mapped to the 9 workspace modules (`four_circles`, `identity_proof`, `incircle_focus`, `spectral_analysis`, `thales_circumcircle`, `arc_classification`, `arc_angle_analysis`, `incircle_arc_distribution`, `arc_side_area`).
5. **Localization (`src/i18n/translations.ts`)**:
   Supports **three languages (`ru`, `uk`, `en`)** with `<html lang>` synchronization.
   *Known limitation:* `IncenterPartitionControls.tsx` and `IncenterPartitionSpectralPanel.tsx` currently render hardcoded Russian strings rather than reading from `TRANSLATIONS`.
