/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export type WorkspaceMode = 'classification' | 'legacy';

export type ClassificationSectionId =
  | 'class_atlas'
  | 'class_inspector'
  | 'triple_matrix'
  | 'hyperbola_divisors'
  | 'geometric_inspector'
  | 'structural_analysis'
  | 'verification_export';

export type EmptyStateKind =
  | 'not_implemented'
  | 'awaiting_verified_data'
  | 'under_development';

export type MatrixCategoryId =
  | 'all'
  | 'identification'
  | 'arithmetic'
  | 'parametric'
  | 'geometric'
  | 'structural'
  | 'generative';

export interface RadiusPresetItem {
  r: number;
  note: string;
}

export interface AtlasPerRadiusRow {
  r: number;
  D: number;
  N: number;
  T: number;
  scaledCount: number;
  note: string;
}

export interface DocumentedTripleExample {
  tripleId: string;
  a: number;
  b: number;
  c: number;
  k: number;
  x: number;
  y: number;
  isPrimitive: boolean;
}

export interface ModuleReadinessItem {
  id: string;
  name: string;
  scope: string;
  status: EmptyStateKind;
}

export interface CheckSpecItem {
  id: string;
  title: string;
  scope: 'row' | 'completeness' | 'certification';
  formula: string;
  criterion: string;
}

export interface OpenQuestionItem {
  id: string;
  title: string;
  status: string;
}

export interface GeometricPreviewSample {
  id: string;
  label: string;
  demoInradius: number;
  note: string;
  a: number;
  b: number;
}

/**
 * Interface contract prepared for future Module M7 (tripleToSvgGeometry).
 * M7 is NOT implemented in Phase 1 / Phase 1.1.
 */
export type M7OrientationMode = 'b_horizontal_a_vertical' | 'a_horizontal_b_vertical';

export interface M7SvgProjectionInput {
  tripleId: string;
  classId: string;
  exactA: string;
  exactB: string;
  exactC: string;
  exactR: string;
  orientation: M7OrientationMode;
}
