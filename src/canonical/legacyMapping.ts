/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type { FourCirclesCalculations } from '../types/geometry.ts';
import { calculateCanonicalFourCircles } from './canonicalFourCircles.ts';
import type { CanonicalFourCirclesModel, LegacyToCanonicalSemanticMap } from './types.ts';

function pointDist(p: { x: number; y: number }, q: { x: number; y: number }): number {
  return Math.hypot(p.x - q.x, p.y - q.y);
}

function legacyLegSquareCenter(sq: FourCirclesCalculations['squareA']): { x: number; y: number } {
  return {
    x: (sq.O.x + sq.legVertex.x + sq.outerVertex.x + sq.baseVertex.x) / 4,
    y: (sq.O.y + sq.legVertex.y + sq.outerVertex.y + sq.baseVertex.y) / 4,
  };
}

function legacyHypSquareCenter(sq: FourCirclesCalculations['squareC']): { x: number; y: number } {
  return {
    x: (sq.A.x + sq.B.x + sq.Bc.x + sq.Ac.x) / 4,
    y: (sq.A.y + sq.B.y + sq.Bc.y + sq.Ac.y) / 4,
  };
}

/**
 * Semantic bridge (Vertex-Preserving Mode: Legacy (O, A, B) -> Canonical (C, A, B)):
 *
 * Given a Legacy FourCirclesCalculations built from (legacy_a = |OA|, legacy_b = |OB|):
 *   - Legacy vertex O=(0,0)        -> Canonical vertex C=(0,0) (90 deg)
 *   - Legacy vertex A=(0,legacy_a) -> Canonical vertex A=(0, sideB)
 *   - Legacy vertex B=(legacy_b,0) -> Canonical vertex B=(sideA, 0)
 * Therefore:
 *   - canonical.sideA = |BC| = legacy.triangle.b (|OB|)
 *   - canonical.sideB = |AC| = legacy.triangle.a (|OA|)
 *   - canonical.circleKa (on BC) === legacy.circleB (on OB)
 *   - canonical.circleKb (on AC) === legacy.circleA (on OA)
 *   - canonical.angleAlphaDeg    === legacy.triangle.alphaDeg (angle at vertex A)
 *   - canonical.angleBetaDeg     === legacy.triangle.betaDeg  (angle at vertex B)
 */
export function mapLegacyToCanonicalFourCircles(
  legacy: FourCirclesCalculations
): CanonicalFourCirclesModel {
  return calculateCanonicalFourCircles(legacy.triangle.b, legacy.triangle.a);
}

/**
 * Computes and verifies the full point-by-point, side-by-side, circle-by-circle
 * semantic mapping between a Legacy calculation and its Canonical Shadow Stand counterpart.
 */
export function verifyLegacyToCanonicalMapping(
  legacy: FourCirclesCalculations,
  tolerance = 1e-12
): {
  canonical: CanonicalFourCirclesModel;
  mapping: LegacyToCanonicalSemanticMap;
} {
  const canonical = mapLegacyToCanonicalFourCircles(legacy);

  const distO = pointDist(legacy.triangle.O, canonical.triangle.vertexC);
  const distA = pointDist(legacy.triangle.A, canonical.triangle.vertexA);
  const distB = pointDist(legacy.triangle.B, canonical.triangle.vertexB);

  const sideADelta = Math.abs(legacy.triangle.b - canonical.triangle.sideA);
  const sideBDelta = Math.abs(legacy.triangle.a - canonical.triangle.sideB);
  const sideCDelta = Math.abs(legacy.triangle.c - canonical.triangle.sideC);

  const alphaDelta = Math.abs(legacy.triangle.alphaDeg - canonical.triangle.angleAlphaDeg);
  const betaDelta = Math.abs(legacy.triangle.betaDeg - canonical.triangle.angleBetaDeg);

  const sqA_to_sqB = {
    areaDelta: Math.abs(legacy.squareA.area - canonical.squareB.area),
    centerDist: pointDist(legacyLegSquareCenter(legacy.squareA), canonical.squareB.center),
  };
  const sqB_to_sqA = {
    areaDelta: Math.abs(legacy.squareB.area - canonical.squareA.area),
    centerDist: pointDist(legacyLegSquareCenter(legacy.squareB), canonical.squareA.center),
  };
  const sqC_to_sqC = {
    areaDelta: Math.abs(legacy.squareC.area - canonical.squareC.area),
    centerDist: pointDist(legacyHypSquareCenter(legacy.squareC), canonical.squareC.center),
  };

  const cA_to_Kb = {
    areaDelta: Math.abs(legacy.circleA.area - canonical.circleKb.area),
    centerDist: pointDist(legacy.circleA.center, canonical.circleKb.center),
    diameterDelta: Math.abs(legacy.circleA.diameter - canonical.circleKb.diameter),
  };
  const cB_to_Ka = {
    areaDelta: Math.abs(legacy.circleB.area - canonical.circleKa.area),
    centerDist: pointDist(legacy.circleB.center, canonical.circleKa.center),
    diameterDelta: Math.abs(legacy.circleB.diameter - canonical.circleKa.diameter),
  };
  const cC_to_Kc = {
    areaDelta: Math.abs(legacy.circleC.area - canonical.circleKc.area),
    centerDist: pointDist(legacy.circleC.center, canonical.circleKc.center),
    diameterDelta: Math.abs(legacy.circleC.diameter - canonical.circleKc.diameter),
  };

  const kiMap = {
    areaDelta: Math.abs(legacy.incircle.area - canonical.incircleKi.area),
    radiusDelta: Math.abs(legacy.incircle.radius - canonical.incircleKi.radius),
    centerDist: pointDist(legacy.incircle.center, canonical.incircleKi.center),
  };
  const koMap = {
    areaDelta: Math.abs(legacy.circumcircle.area - canonical.circumcircleKo.area),
    radiusDelta: Math.abs(legacy.circumcircle.radius - canonical.circumcircleKo.radius),
    centerDist: pointDist(legacy.circumcircle.center, canonical.circumcircleKo.center),
  };

  const tanOA_to_SideB = pointDist(legacy.incircle.tangencyOA, canonical.incircleKi.tangencySideB);
  const tanOB_to_SideA = pointDist(legacy.incircle.tangencyOB, canonical.incircleKi.tangencySideA);
  const tanAB_to_SideC = pointDist(legacy.incircle.tangencyAB, canonical.incircleKi.tangencySideC);

  const maxDeviation = Math.max(
    distO,
    distA,
    distB,
    sideADelta,
    sideBDelta,
    sideCDelta,
    alphaDelta,
    betaDelta,
    sqA_to_sqB.areaDelta,
    sqA_to_sqB.centerDist,
    sqB_to_sqA.areaDelta,
    sqB_to_sqA.centerDist,
    sqC_to_sqC.areaDelta,
    sqC_to_sqC.centerDist,
    cA_to_Kb.areaDelta,
    cA_to_Kb.centerDist,
    cA_to_Kb.diameterDelta,
    cB_to_Ka.areaDelta,
    cB_to_Ka.centerDist,
    cB_to_Ka.diameterDelta,
    cC_to_Kc.areaDelta,
    cC_to_Kc.centerDist,
    cC_to_Kc.diameterDelta,
    kiMap.areaDelta,
    kiMap.radiusDelta,
    kiMap.centerDist,
    koMap.areaDelta,
    koMap.radiusDelta,
    koMap.centerDist,
    tanOA_to_SideB,
    tanOB_to_SideA,
    tanAB_to_SideC
  );

  const mapping: LegacyToCanonicalSemanticMap = {
    orientationMode: 'vertex_preserving',
    vertices: {
      legacyO_to_canonicalC: { legacyLabel: 'O', canonicalLabel: 'C', coordsMatch: distO <= tolerance },
      legacyA_to_canonicalA: { legacyLabel: 'A', canonicalLabel: 'A', coordsMatch: distA <= tolerance },
      legacyB_to_canonicalB: { legacyLabel: 'B', canonicalLabel: 'B', coordsMatch: distB <= tolerance },
    },
    sides: {
      legacyA_legOA_to_canonicalSideB: {
        legacyField: 'triangle.a',
        canonicalField: 'triangle.sideB',
        delta: sideBDelta,
      },
      legacyB_legOB_to_canonicalSideA: {
        legacyField: 'triangle.b',
        canonicalField: 'triangle.sideA',
        delta: sideADelta,
      },
      legacyC_hypAB_to_canonicalSideC: {
        legacyField: 'triangle.c',
        canonicalField: 'triangle.sideC',
        delta: sideCDelta,
      },
    },
    angles: {
      legacyAlpha_to_canonicalAlpha: {
        legacyField: 'triangle.alphaDeg',
        canonicalField: 'triangle.angleAlphaDeg',
        deltaDeg: alphaDelta,
      },
      legacyBeta_to_canonicalBeta: {
        legacyField: 'triangle.betaDeg',
        canonicalField: 'triangle.angleBetaDeg',
        deltaDeg: betaDelta,
      },
    },
    squaresAndCircles: {
      legacySquareA_to_canonicalSquareB: sqA_to_sqB,
      legacySquareB_to_canonicalSquareA: sqB_to_sqA,
      legacySquareC_to_canonicalSquareC: sqC_to_sqC,
      legacyCircleA_to_canonicalCircleKb: cA_to_Kb,
      legacyCircleB_to_canonicalCircleKa: cB_to_Ka,
      legacyCircleC_to_canonicalCircleKc: cC_to_Kc,
      legacyIncircle_to_canonicalIncircleKi: kiMap,
      legacyCircumcircle_to_canonicalCircumcircleKo: koMap,
    },
    incircleTangencies: {
      legacyTangencyOA_to_canonicalTangencySideB: tanOA_to_SideB,
      legacyTangencyOB_to_canonicalTangencySideA: tanOB_to_SideA,
      legacyTangencyAB_to_canonicalTangencySideC: tanAB_to_SideC,
    },
    overallEquivalencePassed: maxDeviation <= tolerance,
    maxDeviation,
  };

  return { canonical, mapping };
}
