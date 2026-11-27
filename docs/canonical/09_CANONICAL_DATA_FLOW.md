# 09 — Canonical Data Flow Pipeline

## 1. Authoritative State & Propagation Path

```text
[ User Interaction ]
  ├── Vertex Drag A/B or Arc T_AB (GeometryBoard.tsx)
  ├── Sliders / Presets / Scale λ (ControlsPanel.tsx)
  ├── Spectral Scrubbing t or λ (SpectralAnalysisPanel.tsx)
  └── Arc Controls (ArcClassificationPanel..ArcSideAreaPanel)
         │
         ▼
[ Root State in src/App.tsx ]
  ├── Primary state: (a, b) + 40-entry Undo/Redo history
  ├── Clamped & sanitized updates (handleChangeA/B/T/Lambda/ArcPhi)
  └── calc = useMemo(() => calculateFourCircles(a, b), [a, b])
         │
         ├──► [ Pure Math Engines ]
         │      ├── src/math/FourCirclesModel.ts (RightTriangle, SquareConstruction, ThalesCircumcircle)
         │      ├── src/math/IncenterPartition.ts (calculateIncenterPartition(calc))
         │      ├── src/math/FourCirclesSpectralAnalysis.ts (ratio & scale sampling)
         │      ├── src/math/FourCirclesValidators.ts & ThalesValidators.ts (17 live checks)
         │      ├── src/math/experiments/*.ts (Exp 01–06 models)
         │      └── src/canonical/*.ts (independent opposite-side model & legacyMapping bridge)
         │
         ▼
[ Synchronous View Projections ]
  ├── GeometryBoard.tsx (SVG canvas via toScreen/toMath in src/geometry/transforms.ts)
  │     ├── FourCirclesView.tsx, RightTriangleView.tsx
  │     ├── IncenterPartitionOverlay.tsx & IncenterPartitionControls.tsx
  │     └── Arc*BoardOverlay.tsx (active per module 06–09)
  ├── Right Sidebar Analytical Panels (switched by activeModule in App.tsx)
  │     ├── FourCirclesPanel, SpectralAnalysisPanel (live sampled curves), ThalesCircumcirclePanel
  │     ├── ArcClassificationPanel, ArcAngleAnalysisPanel, IncircleArcDistributionPanel, ArcSideAreaPanel
  │     └── InvariantsPanel (17 live checks)
  └── Modals (ComparisonModal, TestRunnerModal, HelpModal)
```

## 2. Deterministic Guarantee
Every pure kernel function in `src/canonical/` and `src/math/` computes outputs deterministically from positive finite inputs without side effects or network dependencies.
