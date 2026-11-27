/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { assertValidCanonicalSide, calculateCanonicalFourCircles } from './canonicalFourCircles.ts';
import type {
  CanonicalFourCirclesModel,
  CanonicalObjectIdentityRecord,
  CanonicalShapeRatioDefinition,
  CanonicalShapeRatioPassport,
} from './types.ts';

export const CANONICAL_SHAPE_RATIO_DEFINITION: CanonicalShapeRatioDefinition = 'sideA / sideB';

export const CANONICAL_SHAPE_RATIO_PASSPORT: CanonicalShapeRatioPassport = {
  canonicalName: 'shapeRatio',
  symbol: 'rho',
  definition: CANONICAL_SHAPE_RATIO_DEFINITION,
  formulaLatex:
    '\\rho \\equiv \\text{shapeRatio} = \\frac{\\text{sideA}}{\\text{sideB}} = \\frac{|BC|}{|AC|} = \\tan\\alpha = \\cot\\beta = t_{\\text{legacy}} = \\frac{b_{\\text{leg}}}{a_{\\text{leg}}}',
  legacySymbol: 't',
  legacyFormula: 'b_leg / a_leg = |OB| / |OA|',
  domain: '(0, +infinity)',
  dimension: 'dimensionless (degree 0 homogeneous under scale lambda > 0)',
  swapBehavior: 'Under sideA <-> sideB: shapeRatio -> 1 / shapeRatio',
  spectralFormulas: {
    sideANorm: 'rho (normalized with sideB = 1)',
    sideBNorm: '1',
    sideCNorm: 'sqrt(rho^2 + 1)',
    inradiusNorm: '(rho + 1 - sqrt(rho^2 + 1)) / 2 = rho / (rho + 1 + sqrt(rho^2 + 1))',
    shareKaOverKc: 'rho^2 / (1 + rho^2) [equals Legacy Kb / Kc]',
    shareKbOverKc: '1 / (1 + rho^2) [equals Legacy Ka / Kc]',
    shareKiOverKc: '(rho + 1 - sqrt(rho^2 + 1))^2 / (1 + rho^2) [equals Legacy Ki / Kc]',
  },
};

export interface CanonicalSpectralPoint {
  shapeRatio: number;
  shapeRatioDefinition: CanonicalShapeRatioDefinition;
  sideANorm: number;
  sideBNorm: number;
  sideCNorm: number;
  inradiusNorm: number;
  areaRatiosToKc: {
    Ka: number;
    Kb: number;
    Kc: number;
    Ki: number;
    Ko: number;
  };
  circumferenceRatiosToKc: {
    Ka: number;
    Kb: number;
    Kc: number;
    Ki: number;
    Ko: number;
  };
  radiusRatiosToSideC: {
    Ka: number;
    Kb: number;
    Kc: number;
    Ki: number;
    Ko: number;
  };
  identityResidualAbs: number;
}

/**
 * Computes the canonical spectral parameter `shapeRatio` explicitly defined as `sideA / sideB`.
 */
export function computeCanonicalShapeRatio(sideA: number, sideB: number): number {
  const validA = assertValidCanonicalSide(sideA, 'sideA');
  const validB = assertValidCanonicalSide(sideB, 'sideB');
  return validA / validB;
}

/**
 * Evaluates the normalized canonical five-circle spectrum driven by `shapeRatio = sideA / sideB`,
 * fixing `sideB = 1` and `sideA = shapeRatio` (matching Legacy `calculateFourCircles(1, t)`).
 */
export function evaluateCanonicalSpectralByShapeRatio(shapeRatio: number): CanonicalSpectralPoint {
  if (typeof shapeRatio !== 'number' || !Number.isFinite(shapeRatio) || shapeRatio <= 0) {
    throw new RangeError(
      `Invalid canonical shapeRatio (${CANONICAL_SHAPE_RATIO_DEFINITION}): expected finite > 0, got ${String(shapeRatio)}`
    );
  }

  const model = calculateCanonicalFourCircles(shapeRatio, 1);
  const kcArea = model.circleKc.area;
  const kcCirc = model.circleKc.circumference;
  const sideC = model.triangle.sideC;

  return {
    shapeRatio,
    shapeRatioDefinition: CANONICAL_SHAPE_RATIO_DEFINITION,
    sideANorm: model.triangle.sideA,
    sideBNorm: model.triangle.sideB,
    sideCNorm: sideC,
    inradiusNorm: model.incircleKi.radius,
    areaRatiosToKc: {
      Ka: model.circleKa.area / kcArea,
      Kb: model.circleKb.area / kcArea,
      Kc: 1,
      Ki: model.incircleKi.area / kcArea,
      Ko: model.circumcircleKo.area / kcArea,
    },
    circumferenceRatiosToKc: {
      Ka: model.circleKa.circumference / kcCirc,
      Kb: model.circleKb.circumference / kcCirc,
      Kc: 1,
      Ki: model.incircleKi.circumference / kcCirc,
      Ko: model.circumcircleKo.circumference / kcCirc,
    },
    radiusRatiosToSideC: {
      Ka: model.circleKa.radius / sideC,
      Kb: model.circleKb.radius / sideC,
      Kc: model.circleKc.radius / sideC,
      Ki: model.incircleKi.radius / sideC,
      Ko: model.circumcircleKo.radius / sideC,
    },
    identityResidualAbs: model.identityResidualAbs,
  };
}

/**
 * Builds the explicit 3-layer (Geometric Entity / Semantic Role / Canonical ID)
 * object identity catalog for all five circles, three exterior squares, sides,
 * and dependent tangent/partition objects.
 */
export function buildCanonicalObjectIdentityCatalog(
  model: CanonicalFourCirclesModel
): CanonicalObjectIdentityRecord[] {
  const { triangle, squareA, squareB, squareC, circleKa, circleKb, circleKc, incircleKi, circumcircleKo, incenterPartition } =
    model;

  return [
    // Five circles
    {
      layer1_geometricEntity: 'Circle inscribed in exterior square on +Ox segment [(0,0),(sideA,0)] (quadrant IV)',
      layer2_semanticRole: 'Circle in exterior square on leg opposite vertex A (alpha)',
      layer3_canonicalId: 'circleKa',
      legacyId: 'circleB',
      center: circleKa.center,
      radius: circleKa.radius,
      sideLengthOrDiameter: circleKa.diameter,
      attachedSide: 'sideA',
      oppositeVertex: 'A',
      area: circleKa.area,
    },
    {
      layer1_geometricEntity: 'Circle inscribed in exterior square on +Oy segment [(0,0),(0,sideB)] (quadrant II)',
      layer2_semanticRole: 'Circle in exterior square on leg opposite vertex B (beta)',
      layer3_canonicalId: 'circleKb',
      legacyId: 'circleA',
      center: circleKb.center,
      radius: circleKb.radius,
      sideLengthOrDiameter: circleKb.diameter,
      attachedSide: 'sideB',
      oppositeVertex: 'B',
      area: circleKb.area,
    },
    {
      layer1_geometricEntity: 'Circle inscribed in exterior square on hypotenuse [(0,sideB),(sideA,0)] (quadrant I)',
      layer2_semanticRole: 'Circle in exterior square on hypotenuse opposite right vertex C (gamma = 90 deg)',
      layer3_canonicalId: 'circleKc',
      legacyId: 'circleC',
      center: circleKc.center,
      radius: circleKc.radius,
      sideLengthOrDiameter: circleKc.diameter,
      attachedSide: 'sideC',
      oppositeVertex: 'C',
      area: circleKc.area,
    },
    {
      layer1_geometricEntity: 'Circle centered at incenter I=(r,r) internally tangent to all three triangle sides',
      layer2_semanticRole: 'Triangle incircle tangent to sideA, sideB, sideC',
      layer3_canonicalId: 'incircleKi',
      legacyId: 'incircle',
      center: incircleKi.center,
      radius: incircleKi.radius,
      sideLengthOrDiameter: incircleKi.diameter,
      attachedSide: 'all_three_sides',
      oppositeVertex: 'none',
      area: incircleKi.area,
    },
    {
      layer1_geometricEntity: 'Circle centered at hypotenuse midpoint (sideA/2, sideB/2) passing through C, A, B',
      layer2_semanticRole: 'Thales circumcircle with hypotenuse AB opposite right vertex C as diameter',
      layer3_canonicalId: 'circumcircleKo',
      legacyId: 'circumcircle',
      center: circumcircleKo.center,
      radius: circumcircleKo.radius,
      sideLengthOrDiameter: circumcircleKo.diameter,
      attachedSide: 'hypotenuse_endpoints',
      oppositeVertex: 'C',
      area: circumcircleKo.area,
    },

    // Three exterior squares
    {
      layer1_geometricEntity: 'Exterior square in quadrant IV attached to [(0,0),(sideA,0)]',
      layer2_semanticRole: 'Exterior square on leg opposite vertex A',
      layer3_canonicalId: 'squareA',
      legacyId: 'squareB',
      center: squareA.center,
      radius: null,
      sideLengthOrDiameter: squareA.sideLength,
      attachedSide: 'sideA',
      oppositeVertex: 'A',
      area: squareA.area,
    },
    {
      layer1_geometricEntity: 'Exterior square in quadrant II attached to [(0,0),(0,sideB)]',
      layer2_semanticRole: 'Exterior square on leg opposite vertex B',
      layer3_canonicalId: 'squareB',
      legacyId: 'squareA',
      center: squareB.center,
      radius: null,
      sideLengthOrDiameter: squareB.sideLength,
      attachedSide: 'sideB',
      oppositeVertex: 'B',
      area: squareB.area,
    },
    {
      layer1_geometricEntity: 'Exterior square in quadrant I attached to [(0,sideB),(sideA,0)]',
      layer2_semanticRole: 'Exterior square on hypotenuse opposite right vertex C',
      layer3_canonicalId: 'squareC',
      legacyId: 'squareC',
      center: squareC.center,
      radius: null,
      sideLengthOrDiameter: squareC.sideLength,
      attachedSide: 'sideC',
      oppositeVertex: 'C',
      area: squareC.area,
    },

    // Three sides
    {
      layer1_geometricEntity: 'Segment BC along +Ox from (0,0) to (sideA,0)',
      layer2_semanticRole: 'Leg opposite acute vertex A (alpha)',
      layer3_canonicalId: 'sideA',
      legacyId: 'triangle.b',
      center: { x: triangle.sideA / 2, y: 0 },
      radius: null,
      sideLengthOrDiameter: triangle.sideA,
      attachedSide: 'sideA',
      oppositeVertex: 'A',
      area: null,
    },
    {
      layer1_geometricEntity: 'Segment AC along +Oy from (0,0) to (0,sideB)',
      layer2_semanticRole: 'Leg opposite acute vertex B (beta)',
      layer3_canonicalId: 'sideB',
      legacyId: 'triangle.a',
      center: { x: 0, y: triangle.sideB / 2 },
      radius: null,
      sideLengthOrDiameter: triangle.sideB,
      attachedSide: 'sideB',
      oppositeVertex: 'B',
      area: null,
    },
    {
      layer1_geometricEntity: 'Segment AB from (0,sideB) to (sideA,0)',
      layer2_semanticRole: 'Hypotenuse opposite right vertex C (gamma = 90 deg)',
      layer3_canonicalId: 'sideC',
      legacyId: 'triangle.c',
      center: circumcircleKo.center,
      radius: null,
      sideLengthOrDiameter: triangle.sideC,
      attachedSide: 'sideC',
      oppositeVertex: 'C',
      area: null,
    },

    // Dependent tangent segments (disambiguated from spectral parameter t / shapeRatio)
    {
      layer1_geometricEntity: 'Equal tangent segments |A T_b| = |A T_c| = p - sideA from vertex A',
      layer2_semanticRole: 'Incircle tangent segment length at vertex A (opposite sideA)',
      layer3_canonicalId: 'tangentSegA',
      legacyId: 't_A (Exp 06)',
      center: null,
      radius: null,
      sideLengthOrDiameter: incenterPartition.tangentSegA,
      attachedSide: 'sideA',
      oppositeVertex: 'A',
      area: null,
    },
    {
      layer1_geometricEntity: 'Equal tangent segments |B T_a| = |B T_c| = p - sideB from vertex B',
      layer2_semanticRole: 'Incircle tangent segment length at vertex B (opposite sideB)',
      layer3_canonicalId: 'tangentSegB',
      legacyId: 't_B (Exp 06)',
      center: null,
      radius: null,
      sideLengthOrDiameter: incenterPartition.tangentSegB,
      attachedSide: 'sideB',
      oppositeVertex: 'B',
      area: null,
    },
    {
      layer1_geometricEntity: 'Equal tangent segments |C T_a| = |C T_b| = p - sideC = r from right vertex C',
      layer2_semanticRole: 'Incircle tangent segment length at vertex C (equals inradius r)',
      layer3_canonicalId: 'tangentSegC',
      legacyId: 't_C (Exp 06)',
      center: null,
      radius: null,
      sideLengthOrDiameter: incenterPartition.tangentSegC,
      attachedSide: 'sideC',
      oppositeVertex: 'C',
      area: null,
    },
  ];
}
