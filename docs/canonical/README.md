# Canonical Documentation Package — Pythagoras Circles — Canonical Geometry Research Laboratory

Welcome to the **Canonical Documentation Package** for **Pythagoras Circles — Canonical Geometry Research Laboratory** (*Лаборатория математических кругов Пифагора — Каноническая геометрическая лаборатория*, proposed repository slug: `pythagoras-circles-canon-geometry-lab`).

This documentation set reflects the actual implemented codebase as verified during **Stage 7.2 (Documentation Reconciliation & Pre-Publication Audit)**. Legacy historical documents in `/docs/` are preserved separately for reference and are not modified as normative canonical specifications.

---

## Document Index

1. **[01 — Overview](./01_CANONICAL_OVERVIEW.md)**: Project identity, research scope, core objects, 9 modules + Incenter Partition, and applicability bounds.
2. **[02 — Mathematical Model](./02_CANONICAL_MATHEMATICAL_MODEL.md)**: Reconciled mathematical formulations across `src/canonical/` and `src/math/`, coordinate frames, incircle, incenter partition, four circles, Thales circumcircle, spectral laws, and Experiments 01–06.
3. **[03 — Notation Standard](./03_CANONICAL_NOTATION_STANDARD.md)**: Canonical opposite-side symbol registry (`CANONICAL_OPPOSITE_SIDE_V1`) and explicit semantic bridge to runtime UI symbols.
4. **[04 — Internal Triangle Naming & Partition Semantics](./04_CANONICAL_INTERNAL_TRIANGLE_NAMING.md)**: Unambiguous specification of sub-triangles $S_A, S_B, S_C$ in both `canonicalFourCircles.ts` and `IncenterPartition.ts`, proving $S = S_A + S_B + S_C = p r$.
5. **[05 — Software Architecture](./05_CANONICAL_ARCHITECTURE.md)**: Verified file tree (`src/canonical/`, `src/math/`, `src/components/`, `src/tests/`), 9 workspace modules, and `RU / UK / EN` localization.
6. **[06 — Spectral Analysis Laboratory](./06_CANONICAL_SPECTRAL_ANALYSIS.md)**: Specification of `SpectralAnalysisPanel.tsx` (`Modes A–E`), `semanticContract.ts`, and the Stage 7.2 Special Audit disclosure for `IncenterPartitionSpectralPanel.tsx`.
7. **[07 — Interaction Model](./07_CANONICAL_INTERACTION_MODEL.md)**: Vertex/arc dragging, $\lambda$/$t$ scrubbing, layer filters, history, and export controls.
8. **[08 — Verification & Test Suite Registry](./08_CANONICAL_VERIFICATION_AND_TESTS.md)**: Full registry of all 16 test files, `npm test` scope, `tsc --noEmit`, and `vite build` results.
9. **[09 — Data Flow Pipeline](./09_CANONICAL_DATA_FLOW.md)**: End-to-end deterministic propagation from `App.tsx` state `(a, b)` through math engines to SVG & analytical panels.
10. **[10 — Glossary](./10_CANONICAL_GLOSSARY.md)**: Unified dictionary of mathematical, geometric, and architectural terms.
11. **[11 — Changelog](./11_CANONICAL_CHANGELOG.md)**: Version history of the Canonical documentation contour.
12. **[Formula Passports (UMFP Model)](./formula-passports/README.md)**: Verified UMFP-style passports `F01`–`F19`, inventory, dependency graph, notation profile, and passport audit.
13. **[Stage 7.2 Pre-Publication Audit](./pre-publication-audit/README.md)**: Comprehensive pre-publication verification report (`PASS` / `FIXED` / `WARNING` / `BLOCKER` / `NOT VERIFIED`) and `VERIFICATION_MATRIX.md`.
