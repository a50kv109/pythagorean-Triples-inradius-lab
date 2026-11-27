/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { FourCirclesCalculations } from '../types/geometry.ts';
import { calculateFourCircles } from './FourCirclesModel.ts';

export type CircleKey = 'Ka' | 'Kb' | 'Kc' | 'Ki';
export type FiveCircleKey = CircleKey | 'Ko';
export type SpectralGraphMode = 'areas' | 'perimeters' | 'radii_diameters' | 'thales_abs' | 'scale_lambda';
export type LinearMeasureKind = 'radius' | 'diameter';
export type AxisScaleMode = 'log' | 'linear';

export {
  sampleThalesScaleCurves,
  scaleTriangleGeometry,
  type ScaleTransformationResult,
  type ThalesScaleSamplePoint,
} from './ThalesCircumcircle.ts';

export interface CircleSeriesMeta {
  id: FiveCircleKey;
  label: string;
  shortTitle: string;
  fullName: string;
  color: string;
  colorBg: string;
  textClass: string;
}

export const CIRCLE_SERIES_META: Record<CircleKey, CircleSeriesMeta> = {
  Ka: {
    id: 'Ka',
    label: 'K_a',
    shortTitle: 'Kₐ',
    fullName: 'Круг K_a (на катете a)',
    color: '#2563eb',
    colorBg: 'bg-blue-600',
    textClass: 'text-blue-700',
  },
  Kb: {
    id: 'Kb',
    label: 'K_b',
    shortTitle: 'K_b',
    fullName: 'Круг K_b (на катете b)',
    color: '#059669',
    colorBg: 'bg-emerald-600',
    textClass: 'text-emerald-700',
  },
  Kc: {
    id: 'Kc',
    label: 'K_c',
    shortTitle: 'K_c',
    fullName: 'Круг K_c (на гипотенузе c)',
    color: '#e11d48',
    colorBg: 'bg-rose-600',
    textClass: 'text-rose-700',
  },
  Ki: {
    id: 'Ki',
    label: 'K_i',
    shortTitle: 'Kᵢ',
    fullName: 'Круг K_i (вписанный в △OAB)',
    color: '#d97706',
    colorBg: 'bg-amber-600',
    textClass: 'text-amber-700',
  },
};

export const THALES_SERIES_META: CircleSeriesMeta = {
  id: 'Ko',
  label: 'K_o',
  shortTitle: 'Kₒ',
  fullName: 'Описанная окружность Фалеса K_o',
  color: '#7c3aed',
  colorBg: 'bg-violet-600',
  textClass: 'text-violet-700',
};

export const FIVE_CIRCLE_SERIES_META: Record<FiveCircleKey, CircleSeriesMeta> = {
  ...CIRCLE_SERIES_META,
  Ko: THALES_SERIES_META,
};

export const REFERENCE_T_VALUES = [0.1, 0.5, 1.0, 2.0, 10.0] as const;

export interface SpectralItem {
  id: FiveCircleKey;
  label: string;
  fullName: string;
  color: string;
  colorBg: string;
  // Areas
  area: number;
  areaSharePercent: number;
  areaRatioToKc: number;
  // Perimeters (Circumferences P = 2*pi*R = pi*d)
  perimeter: number;
  perimeterSharePercent: number;
  perimeterRatioToKc: number;
  // Radii & Diameters
  radius: number;
  diameter: number;
  radiusRatioToC: number;
  diameterRatioToC: number;
}

export interface SpectralAnalysisResult {
  items: SpectralItem[]; // Strictly the 4 core circles (preserves 100% share sum invariant)
  circumcircleItem: SpectralItem; // 5th circle K_o (Thales circumcircle)
  totalArea: number;
  totalPerimeter: number;
}

export interface ThalesNormalizedRatios {
  RoOverC: number;  // R_o / c = 1/2
  DoOverC: number;  // D_o / c = 1
  KoOverKc: number; // K_o / K_c = 1
  LoOverLc: number; // L_o / L_c = 1
  RoOverRc: number; // R_o / R_c = 1
}

export interface ThalesAbsoluteMetrics {
  Ro: number; // sqrt(1 + t^2) / 2
  Do: number; // sqrt(1 + t^2)
  Ko: number; // pi * (1 + t^2) / 4
  Lo: number; // pi * sqrt(1 + t^2)
}

export interface ParametricCircleRatios {
  t: number;
  aNorm: number;
  bNorm: number;
  cNorm: number;
  rNorm: number;
  areas: Record<CircleKey, number>;
  perimeters: Record<CircleKey, number>;
  radii: Record<CircleKey, number>;
  diameters: Record<CircleKey, number>;
  areasAbs: Record<CircleKey, number>;
  perimetersAbs: Record<CircleKey, number>;
  radiiAbs: Record<CircleKey, number>;
  diametersAbs: Record<CircleKey, number>;
  thalesNorm: ThalesNormalizedRatios;
  thalesAbs: ThalesAbsoluteMetrics;
  identityResidualAbs: number;
}

export interface CurveSamplePoint {
  t: number;
  Ka: number;
  Kb: number;
  Kc: number;
  Ki: number;
  Ko: number;
}

export interface ThalesAbsoluteSamplePoint {
  t: number;
  Ro: number;
  Do: number;
  Ko: number;
  Lo: number;
}

/**
 * Computes spectral analysis metrics for all four circles ($K_a, K_b, K_c, K_i$)
 * from an existing FourCirclesCalculations instance, strictly separating areas
 * (quadratic units) from perimeters, radii, and diameters (linear units).
 */
export function computeFourCirclesSpectralAnalysis(
  calc: FourCirclesCalculations
): SpectralAnalysisResult {
  const { circleA, circleB, circleC, incircle } = calc;

  // Areas
  const Ka = circleA.area;
  const Kb = circleB.area;
  const Kc = circleC.area;
  const Ki = incircle.area;
  const totalArea = Ka + Kb + Kc + Ki;

  // Perimeters (P = 2 * pi * R = pi * d)
  const Pa = 2 * Math.PI * circleA.radius;
  const Pb = 2 * Math.PI * circleB.radius;
  const Pc = 2 * Math.PI * circleC.radius;
  const Pi = 2 * Math.PI * incircle.radius;
  const totalPerimeter = Pa + Pb + Pc + Pi;

  const rC = circleC.radius;
  const dC = circleC.diameter;

  const items: SpectralItem[] = [
    {
      id: 'Ka',
      label: CIRCLE_SERIES_META.Ka.label,
      fullName: CIRCLE_SERIES_META.Ka.fullName,
      color: CIRCLE_SERIES_META.Ka.color,
      colorBg: CIRCLE_SERIES_META.Ka.colorBg,
      area: Ka,
      areaSharePercent: totalArea > 0 ? (Ka / totalArea) * 100 : 0,
      areaRatioToKc: Kc > 0 ? Ka / Kc : 0,
      perimeter: Pa,
      perimeterSharePercent: totalPerimeter > 0 ? (Pa / totalPerimeter) * 100 : 0,
      perimeterRatioToKc: Pc > 0 ? Pa / Pc : 0,
      radius: circleA.radius,
      diameter: circleA.diameter,
      radiusRatioToC: rC > 0 ? circleA.radius / rC : 0,
      diameterRatioToC: dC > 0 ? circleA.diameter / dC : 0,
    },
    {
      id: 'Kb',
      label: CIRCLE_SERIES_META.Kb.label,
      fullName: CIRCLE_SERIES_META.Kb.fullName,
      color: CIRCLE_SERIES_META.Kb.color,
      colorBg: CIRCLE_SERIES_META.Kb.colorBg,
      area: Kb,
      areaSharePercent: totalArea > 0 ? (Kb / totalArea) * 100 : 0,
      areaRatioToKc: Kc > 0 ? Kb / Kc : 0,
      perimeter: Pb,
      perimeterSharePercent: totalPerimeter > 0 ? (Pb / totalPerimeter) * 100 : 0,
      perimeterRatioToKc: Pc > 0 ? Pb / Pc : 0,
      radius: circleB.radius,
      diameter: circleB.diameter,
      radiusRatioToC: rC > 0 ? circleB.radius / rC : 0,
      diameterRatioToC: dC > 0 ? circleB.diameter / dC : 0,
    },
    {
      id: 'Kc',
      label: CIRCLE_SERIES_META.Kc.label,
      fullName: CIRCLE_SERIES_META.Kc.fullName,
      color: CIRCLE_SERIES_META.Kc.color,
      colorBg: CIRCLE_SERIES_META.Kc.colorBg,
      area: Kc,
      areaSharePercent: totalArea > 0 ? (Kc / totalArea) * 100 : 0,
      areaRatioToKc: Kc > 0 ? Kc / Kc : 1,
      perimeter: Pc,
      perimeterSharePercent: totalPerimeter > 0 ? (Pc / totalPerimeter) * 100 : 0,
      perimeterRatioToKc: Pc > 0 ? Pc / Pc : 1,
      radius: circleC.radius,
      diameter: circleC.diameter,
      radiusRatioToC: rC > 0 ? circleC.radius / rC : 1,
      diameterRatioToC: dC > 0 ? circleC.diameter / dC : 1,
    },
    {
      id: 'Ki',
      label: CIRCLE_SERIES_META.Ki.label,
      fullName: CIRCLE_SERIES_META.Ki.fullName,
      color: CIRCLE_SERIES_META.Ki.color,
      colorBg: CIRCLE_SERIES_META.Ki.colorBg,
      area: Ki,
      areaSharePercent: totalArea > 0 ? (Ki / totalArea) * 100 : 0,
      areaRatioToKc: Kc > 0 ? Ki / Kc : 0,
      perimeter: Pi,
      perimeterSharePercent: totalPerimeter > 0 ? (Pi / totalPerimeter) * 100 : 0,
      perimeterRatioToKc: Pc > 0 ? Pi / Pc : 0,
      radius: incircle.radius,
      diameter: incircle.diameter,
      radiusRatioToC: rC > 0 ? incircle.radius / rC : 0,
      diameterRatioToC: dC > 0 ? incircle.diameter / dC : 0,
    },
  ];

  const circumcircleItem: SpectralItem = {
    id: 'Ko',
    label: THALES_SERIES_META.label,
    fullName: THALES_SERIES_META.fullName,
    color: THALES_SERIES_META.color,
    colorBg: THALES_SERIES_META.colorBg,
    area: calc.circumcircle.area,
    areaSharePercent: totalArea > 0 ? (calc.circumcircle.area / totalArea) * 100 : 0,
    areaRatioToKc: Kc > 0 ? calc.circumcircle.area / Kc : 1,
    perimeter: calc.circumcircle.circumference,
    perimeterSharePercent: totalPerimeter > 0 ? (calc.circumcircle.circumference / totalPerimeter) * 100 : 0,
    perimeterRatioToKc: Pc > 0 ? calc.circumcircle.circumference / Pc : 1,
    radius: calc.circumcircle.radius,
    diameter: calc.circumcircle.diameter,
    radiusRatioToC: rC > 0 ? calc.circumcircle.radius / rC : 1,
    diameterRatioToC: dC > 0 ? calc.circumcircle.diameter / dC : 1,
  };

  return {
    items,
    circumcircleItem,
    totalArea,
    totalPerimeter,
  };
}

/**
 * Evaluates the normalized parametric Four Circles model at dimensionless ratio t = b / a > 0,
 * fixing a = 1, b = t, c = sqrt(1 + t^2), r = (1 + t - c) / 2,
 * directly through the authoritative calculateFourCircles(1, t) model.
 */
export function evaluateParametricFourCircles(t: number): ParametricCircleRatios {
  if (typeof t !== 'number' || !Number.isFinite(t) || t <= 0) {
    throw new RangeError(`Invalid dimensionless ratio t = b/a: expected finite > 0, got ${String(t)}`);
  }

  const calc = calculateFourCircles(1, t);
  const spectral = computeFourCirclesSpectralAnalysis(calc);
  const byId = Object.fromEntries(spectral.items.map((item) => [item.id, item])) as Record<
    CircleKey,
    SpectralItem
  >;

  return {
    t,
    aNorm: calc.triangle.a,
    bNorm: calc.triangle.b,
    cNorm: calc.triangle.c,
    rNorm: calc.incircle.radius,
    areas: {
      Ka: byId.Ka.areaRatioToKc,
      Kb: byId.Kb.areaRatioToKc,
      Kc: byId.Kc.areaRatioToKc,
      Ki: byId.Ki.areaRatioToKc,
    },
    perimeters: {
      Ka: byId.Ka.perimeterRatioToKc,
      Kb: byId.Kb.perimeterRatioToKc,
      Kc: byId.Kc.perimeterRatioToKc,
      Ki: byId.Ki.perimeterRatioToKc,
    },
    radii: {
      Ka: byId.Ka.radiusRatioToC,
      Kb: byId.Kb.radiusRatioToC,
      Kc: byId.Kc.radiusRatioToC,
      Ki: byId.Ki.radiusRatioToC,
    },
    diameters: {
      Ka: byId.Ka.diameterRatioToC,
      Kb: byId.Kb.diameterRatioToC,
      Kc: byId.Kc.diameterRatioToC,
      Ki: byId.Ki.diameterRatioToC,
    },
    areasAbs: {
      Ka: byId.Ka.area,
      Kb: byId.Kb.area,
      Kc: byId.Kc.area,
      Ki: byId.Ki.area,
    },
    perimetersAbs: {
      Ka: byId.Ka.perimeter,
      Kb: byId.Kb.perimeter,
      Kc: byId.Kc.perimeter,
      Ki: byId.Ki.perimeter,
    },
    radiiAbs: {
      Ka: byId.Ka.radius,
      Kb: byId.Kb.radius,
      Kc: byId.Kc.radius,
      Ki: byId.Ki.radius,
    },
    diametersAbs: {
      Ka: byId.Ka.diameter,
      Kb: byId.Kb.diameter,
      Kc: byId.Kc.diameter,
      Ki: byId.Ki.diameter,
    },
    thalesNorm: {
      RoOverC: calc.triangle.c > 0 ? calc.circumcircle.radius / calc.triangle.c : 0.5,
      DoOverC: calc.triangle.c > 0 ? calc.circumcircle.diameter / calc.triangle.c : 1,
      KoOverKc: byId.Kc.area > 0 ? calc.circumcircle.area / byId.Kc.area : 1,
      LoOverLc: byId.Kc.perimeter > 0 ? calc.circumcircle.circumference / byId.Kc.perimeter : 1,
      RoOverRc: byId.Kc.radius > 0 ? calc.circumcircle.radius / byId.Kc.radius : 1,
    },
    thalesAbs: {
      Ro: calc.circumcircle.radius,
      Do: calc.circumcircle.diameter,
      Ko: calc.circumcircle.area,
      Lo: calc.circumcircle.circumference,
    },
    identityResidualAbs: calc.identityResidualAbs,
  };
}

export function getNormalizedValuesForMode(
  ratios: ParametricCircleRatios,
  mode: SpectralGraphMode,
  linearKind: LinearMeasureKind = 'radius'
): Record<CircleKey, number> {
  if (mode === 'areas') return ratios.areas;
  if (mode === 'perimeters') return ratios.perimeters;
  return linearKind === 'radius' ? ratios.radii : ratios.diameters;
}

export function getThalesNormalizedValueForMode(
  ratios: ParametricCircleRatios,
  mode: SpectralGraphMode,
  linearKind: LinearMeasureKind = 'radius'
): number {
  if (mode === 'areas') return ratios.thalesNorm.KoOverKc; // 1
  if (mode === 'perimeters') return ratios.thalesNorm.LoOverLc; // 1
  return linearKind === 'radius' ? ratios.thalesNorm.RoOverC : ratios.thalesNorm.DoOverC; // 0.5 or 1
}

/**
 * Samples the four parametric function curves plus the constant normalized K_o line
 * over [tMin, tMax] directly from the unified model.
 */
export function sampleSpectralCurves(options: {
  tMin: number;
  tMax: number;
  steps?: number;
  mode: SpectralGraphMode;
  linearKind?: LinearMeasureKind;
  scaleMode?: AxisScaleMode;
}): CurveSamplePoint[] {
  const {
    tMin,
    tMax,
    steps = 200,
    mode,
    linearKind = 'radius',
    scaleMode = 'log',
  } = options;

  if (!Number.isFinite(tMin) || !Number.isFinite(tMax) || tMin <= 0 || tMax <= tMin) {
    throw new RangeError(`Invalid t range [${tMin}, ${tMax}]`);
  }

  const tValues: number[] = [];
  if (scaleMode === 'log') {
    const logMin = Math.log10(tMin);
    const logMax = Math.log10(tMax);
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      tValues.push(Math.pow(10, logMin + u * (logMax - logMin)));
    }
  } else {
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      tValues.push(tMin + u * (tMax - tMin));
    }
  }

  // Ensure symmetry point t = 1 is cleanly sampled if in range
  if (tMin <= 1 && 1 <= tMax && !tValues.some((v) => Math.abs(v - 1) < 1e-9)) {
    tValues.push(1);
    tValues.sort((x, y) => x - y);
  }

  return tValues.map((t) => {
    const ratios = evaluateParametricFourCircles(t);
    const vals = getNormalizedValuesForMode(ratios, mode, linearKind);
    const koVal = getThalesNormalizedValueForMode(ratios, mode, linearKind);
    return {
      t,
      Ka: vals.Ka,
      Kb: vals.Kb,
      Kc: vals.Kc,
      Ki: vals.Ki,
      Ko: koVal,
    };
  });
}

/**
 * Samples unnormalized (a = 1, b = t) absolute Thales circumcircle growth curves
 * Ro(t), Do(t), Ko(t), Lo(t) over [tMin, tMax].
 */
export function sampleThalesAbsoluteCurves(options: {
  tMin: number;
  tMax: number;
  steps?: number;
  scaleMode?: AxisScaleMode;
}): ThalesAbsoluteSamplePoint[] {
  const { tMin, tMax, steps = 200, scaleMode = 'log' } = options;

  if (!Number.isFinite(tMin) || !Number.isFinite(tMax) || tMin <= 0 || tMax <= tMin) {
    throw new RangeError(`Invalid t range [${tMin}, ${tMax}]`);
  }

  const tValues: number[] = [];
  if (scaleMode === 'log') {
    const logMin = Math.log10(tMin);
    const logMax = Math.log10(tMax);
    for (let i = 0; i <= steps; i++) {
      tValues.push(Math.pow(10, logMin + (i / steps) * (logMax - logMin)));
    }
  } else {
    for (let i = 0; i <= steps; i++) {
      tValues.push(tMin + (i / steps) * (tMax - tMin));
    }
  }

  if (tMin <= 1 && 1 <= tMax && !tValues.some((v) => Math.abs(v - 1) < 1e-9)) {
    tValues.push(1);
    tValues.sort((x, y) => x - y);
  }

  return tValues.map((t) => {
    const ratios = evaluateParametricFourCircles(t);
    return {
      t,
      ...ratios.thalesAbs,
    };
  });
}

/**
 * Converts a desired dimensionless leg ratio t = b / a and reference hypotenuse c
 * into legs (a, b) bounded within [minLeg, maxLeg] while preserving b / a = t accurately.
 */
export function legsFromRatioAndHypotenuse(
  targetT: number,
  targetC: number,
  minLeg = 0.2,
  maxLeg = 15
): { a: number; b: number } {
  if (!Number.isFinite(targetT) || targetT <= 0) {
    throw new RangeError(`Invalid targetT: ${String(targetT)}`);
  }
  const safeC = Number.isFinite(targetC) && targetC > 0 ? targetC : 5;

  let a = safeC / Math.hypot(1, targetT);
  let b = a * targetT;

  const minSide = Math.min(a, b);
  if (minSide < minLeg) {
    const scaleUp = minLeg / minSide;
    a *= scaleUp;
    b *= scaleUp;
  }

  const maxSide = Math.max(a, b);
  if (maxSide > maxLeg) {
    const scaleDown = maxLeg / maxSide;
    a *= scaleDown;
    b *= scaleDown;
  }

  // Final guard if extreme ratio exceeds maxLeg/minLeg
  a = Math.max(minLeg, Math.min(maxLeg, a));
  b = Math.max(minLeg, Math.min(maxLeg, b));

  return { a, b };
}
