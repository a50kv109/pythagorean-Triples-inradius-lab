/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { assertPositiveFinite } from './circleFirstClassification.ts';
import { validateTangentGeometryAtAngle } from './arcGeometricValidation.ts';
import type { Point2D } from '../../types/geometry.ts';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const BOUNDARY_TOL = 1e-12;

export const EXPERIMENT04_RADII = [1, 2, 3] as const;
export const EXPERIMENT04_STEP_DEG = 5;

export interface ArcAngleZoneSpec {
  id: string;
  label: string;
  alphaMinDeg: number;
  alphaMaxDeg: number;
}

export const EXPERIMENT04_RESEARCH_ZONES: readonly ArcAngleZoneSpec[] = [
  { id: 'zone_10_15', label: '10°–15°', alphaMinDeg: 10, alphaMaxDeg: 15 },
  { id: 'zone_15_30', label: '15°–30°', alphaMinDeg: 15, alphaMaxDeg: 30 },
  { id: 'zone_30_45', label: '30°–45°', alphaMinDeg: 30, alphaMaxDeg: 45 },
  { id: 'zone_45_60', label: '45°–60°', alphaMinDeg: 45, alphaMaxDeg: 60 },
  { id: 'zone_60_75', label: '60°–75°', alphaMinDeg: 60, alphaMaxDeg: 75 },
  { id: 'zone_75_80', label: '75°–80°', alphaMinDeg: 75, alphaMaxDeg: 80 },
] as const;

export interface ArcAnglePoint {
  rowIndex: number;
  r: number;
  alphaDeg: number; // Central angle of tangency point T_AB from N=(r,2r) clockwise toward E=(2r,r)
  alphaRad: number;
  arcLength: number; // L = r * alphaRad
  angleADeg: number; // Acute angle between first (vertical) leg OA and hypotenuse AB: 90 - alpha
  angleBDeg: number; // Acute angle between second (horizontal) leg OB and hypotenuse AB: alpha
  angleSumDeg: number; // A + B (= 90)
  a: number; // Vertical leg OA along x = 0
  b: number; // Horizontal leg OB along y = 0
  c: number; // Hypotenuse AB
  ratioBA: number; // b / a = cot(alpha) = tan(A) = cot(B)
  ratioAB: number; // a / b = tan(alpha) = cot(A) = tan(B)
  tangencyAB: Point2D;
  tangencyOA: Point2D;
  tangencyOB: Point2D;
  tangentLineDistance: number;
  circlePointResidual: number;
  rActual: number;
  pythagoreanResidual: number;
  incircleResidual: number;
  isSymmetricIsosceles: boolean;
  isNonDegenerate: boolean;
}

export interface ArcAngleBoundaryPoint {
  r: number;
  alphaDeg: 0 | 90;
  arcLength: number;
  tangencyAB: Point2D;
  tangentLineEquation: string;
  limitingAngleADeg: number;
  limitingAngleBDeg: number;
  finiteLegDescription: string;
  infiniteLegDescription: string;
  isDegenerate: true;
}

export interface ArcAngleZoneSummary {
  r: number;
  zoneId: string;
  arcIntervalLabel: string;
  alphaMinDeg: number;
  alphaMaxDeg: number;
  deltaAlphaDeg: number;
  angleAMinDeg: number; // 90 - alphaMaxDeg
  angleAMaxDeg: number; // 90 - alphaMinDeg
  angleBMinDeg: number; // alphaMinDeg
  angleBMaxDeg: number; // alphaMaxDeg
  arcLengthMin: number; // r * alphaMinRad
  arcLengthMax: number; // r * alphaMaxRad
  arcLengthDelta: number; // r * deltaAlphaRad
  ratioBAMin: number; // cot(alphaMax)
  ratioBAMax: number; // cot(alphaMin)
}

export interface ScaleInvarianceReport {
  referenceRadius: number;
  comparedRadii: number[];
  maxAngleADiffDeg: number;
  maxAngleBDiffDeg: number;
  maxRatioBADiff: number;
  maxArcLengthScaleRelErr: number;
  maxLegAScaleRelErr: number;
  maxLegBScaleRelErr: number;
  maxHypScaleRelErr: number;
  allShapeInvariantsHold: boolean;
  allScaleLawsHold: boolean;
}

/**
 * Generates sorted interior central angles for a given step (excluding 0 and 90 deg).
 */
export function getInteriorAnglesDeg(stepDeg = EXPERIMENT04_STEP_DEG): number[] {
  if (typeof stepDeg !== 'number' || !Number.isFinite(stepDeg) || stepDeg <= 0 || stepDeg >= 90) {
    throw new RangeError(`Expected stepDeg in (0, 90), got ${String(stepDeg)}`);
  }
  const angles: number[] = [];
  const count = Math.floor(90 / stepDeg);
  for (let k = 1; k <= count; k += 1) {
    const deg = Number((k * stepDeg).toFixed(10));
    if (deg > BOUNDARY_TOL && deg < 90 - BOUNDARY_TOL) {
      angles.push(deg);
    }
  }
  return angles;
}

/**
 * Evaluates a single interior non-degenerate configuration on the Experiment 01-03 geometry:
 *   - Center I = (r, r)
 *   - Leg OA along +Oy (x = 0), touches at (0, r)
 *   - Leg OB along +Ox (y = 0), touches at (r, 0)
 *   - Tangency T_AB(alpha) = (r(1 + sin(alpha)), r(1 + cos(alpha)))
 *   - Angle A (at vertex A on OA) = 90 deg - alpha
 *   - Angle B (at vertex B on OB) = alpha
 */
export function computeArcAnglePoint(
  r: number,
  alphaDeg: number,
  rowIndex = 1
): ArcAnglePoint {
  const validR = assertPositiveFinite(r, 'inradius r');
  if (
    typeof alphaDeg !== 'number' ||
    !Number.isFinite(alphaDeg) ||
    alphaDeg <= BOUNDARY_TOL ||
    alphaDeg >= 90 - BOUNDARY_TOL
  ) {
    throw new RangeError(
      `Expected non-degenerate interior central angle alphaDeg in (0, 90), got ${String(alphaDeg)}`
    );
  }

  const geo = validateTangentGeometryAtAngle(validR, alphaDeg);
  if (
    geo.isDegenerate ||
    geo.a === null ||
    geo.b === null ||
    geo.c === null ||
    geo.angleADeg === null ||
    geo.angleBDeg === null ||
    geo.rActualDirect === null ||
    geo.pythagoreanResidualAbs === null ||
    geo.incircleEqResidualAbs === null
  ) {
    throw new Error(`Unexpected degenerate result at alphaDeg=${alphaDeg}`);
  }

  const isPositiveSides = geo.a > 0 && geo.b > 0 && geo.c > 0;
  const isNonDegenerate =
    isPositiveSides &&
    Math.abs(geo.tangentLine.distanceFromCenter - validR) < 1e-10 &&
    geo.circleDistanceResidual < 1e-10;

  return {
    rowIndex,
    r: validR,
    alphaDeg,
    alphaRad: geo.alphaRad,
    arcLength: geo.arcLengthActual,
    angleADeg: geo.angleADeg,
    angleBDeg: geo.angleBDeg,
    angleSumDeg: geo.angleADeg + geo.angleBDeg,
    a: geo.a,
    b: geo.b,
    c: geo.c,
    ratioBA: geo.b / geo.a,
    ratioAB: geo.a / geo.b,
    tangencyAB: geo.tangencyPoint,
    tangencyOA: { x: 0, y: validR },
    tangencyOB: { x: validR, y: 0 },
    tangentLineDistance: geo.tangentLine.distanceFromCenter,
    circlePointResidual: geo.circleDistanceResidual,
    rActual: geo.rActualDirect,
    pythagoreanResidual: geo.pythagoreanResidualAbs,
    incircleResidual: geo.incircleEqResidualAbs,
    isSymmetricIsosceles: Math.abs(alphaDeg - 45) < 1e-9,
    isNonDegenerate,
  } as ArcAnglePoint;
}

/**
 * Evaluates degenerate boundary endpoints alpha = 0 deg and alpha = 90 deg.
 */
export function computeArcAngleBoundary(r: number, alphaDeg: 0 | 90): ArcAngleBoundaryPoint {
  const validR = assertPositiveFinite(r, 'inradius r');
  const geo = validateTangentGeometryAtAngle(validR, alphaDeg);
  return {
    r: validR,
    alphaDeg,
    arcLength: geo.arcLengthActual,
    tangencyAB: geo.tangencyPoint,
    tangentLineEquation: geo.tangentLine.formatted,
    limitingAngleADeg: alphaDeg === 0 ? 90 : 0,
    limitingAngleBDeg: alphaDeg === 0 ? 0 : 90,
    finiteLegDescription: alphaDeg === 0 ? `a = ${(2 * validR).toFixed(4)}` : `b = ${(2 * validR).toFixed(4)}`,
    infiniteLegDescription: alphaDeg === 0 ? 'b -> +∞, c -> +∞' : 'a -> +∞, c -> +∞',
    isDegenerate: true,
  };
}

/**
 * Generates the unified Experiment 04 parametric table across all radii (default r = 1, 2, 3)
 * and interior 5-degree steps (5..85 deg -> 17 non-degenerate points per radius = 51 rows).
 */
export function generateExperiment04Table(
  radii: readonly number[] = EXPERIMENT04_RADII,
  stepDeg = EXPERIMENT04_STEP_DEG
): {
  rows: ArcAnglePoint[];
  boundaries: ArcAngleBoundaryPoint[];
} {
  const angles = getInteriorAnglesDeg(stepDeg);
  const rows: ArcAnglePoint[] = [];
  const boundaries: ArcAngleBoundaryPoint[] = [];
  let rowIndex = 1;

  for (const r of radii) {
    boundaries.push(computeArcAngleBoundary(r, 0));
    for (const alphaDeg of angles) {
      rows.push(computeArcAnglePoint(r, alphaDeg, rowIndex));
      rowIndex += 1;
    }
    boundaries.push(computeArcAngleBoundary(r, 90));
  }

  return { rows, boundaries };
}

/**
 * Computes summary zone tables for each radius r across the specified research arc intervals.
 */
export function computeZoneSummaries(
  radii: readonly number[] = EXPERIMENT04_RADII,
  zones: readonly ArcAngleZoneSpec[] = EXPERIMENT04_RESEARCH_ZONES
): ArcAngleZoneSummary[] {
  const summaries: ArcAngleZoneSummary[] = [];

  for (const r of radii) {
    const validR = assertPositiveFinite(r, 'inradius r');
    for (const zone of zones) {
      const aMinRad = zone.alphaMinDeg * DEG2RAD;
      const aMaxRad = zone.alphaMaxDeg * DEG2RAD;
      const deltaAlphaDeg = zone.alphaMaxDeg - zone.alphaMinDeg;
      const arcLengthMin = validR * aMinRad;
      const arcLengthMax = validR * aMaxRad;

      summaries.push({
        r: validR,
        zoneId: zone.id,
        arcIntervalLabel: zone.label,
        alphaMinDeg: zone.alphaMinDeg,
        alphaMaxDeg: zone.alphaMaxDeg,
        deltaAlphaDeg,
        angleAMinDeg: 90 - zone.alphaMaxDeg,
        angleAMaxDeg: 90 - zone.alphaMinDeg,
        angleBMinDeg: zone.alphaMinDeg,
        angleBMaxDeg: zone.alphaMaxDeg,
        arcLengthMin,
        arcLengthMax,
        arcLengthDelta: arcLengthMax - arcLengthMin,
        ratioBAMin: 1 / Math.tan(aMaxRad),
        ratioBAMax: 1 / Math.tan(aMinRad),
      });
    }
  }

  return summaries;
}

/**
 * Verifies scale-invariance of shape (angles A, B and ratio b/a) vs. linear scaling of L, a, b, c.
 */
export function verifyScaleInvariance(
  radii: readonly number[] = EXPERIMENT04_RADII,
  stepDeg = EXPERIMENT04_STEP_DEG
): ScaleInvarianceReport {
  if (radii.length === 0) {
    throw new RangeError('Expected at least one radius');
  }
  const refR = assertPositiveFinite(radii[0], 'reference radius');
  const angles = getInteriorAnglesDeg(stepDeg);

  let maxAngleADiffDeg = 0;
  let maxAngleBDiffDeg = 0;
  let maxRatioBADiff = 0;
  let maxArcLengthScaleRelErr = 0;
  let maxLegAScaleRelErr = 0;
  let maxLegBScaleRelErr = 0;
  let maxHypScaleRelErr = 0;

  for (const alphaDeg of angles) {
    const base = computeArcAnglePoint(refR, alphaDeg, 1);
    for (let i = 1; i < radii.length; i += 1) {
      const r = assertPositiveFinite(radii[i], `radii[${i}]`);
      const k = r / refR;
      const curr = computeArcAnglePoint(r, alphaDeg, 1);

      maxAngleADiffDeg = Math.max(maxAngleADiffDeg, Math.abs(curr.angleADeg - base.angleADeg));
      maxAngleBDiffDeg = Math.max(maxAngleBDiffDeg, Math.abs(curr.angleBDeg - base.angleBDeg));
      maxRatioBADiff = Math.max(maxRatioBADiff, Math.abs(curr.ratioBA - base.ratioBA));

      maxArcLengthScaleRelErr = Math.max(
        maxArcLengthScaleRelErr,
        Math.abs(curr.arcLength - k * base.arcLength) / Math.max(1e-15, curr.arcLength)
      );
      maxLegAScaleRelErr = Math.max(
        maxLegAScaleRelErr,
        Math.abs(curr.a - k * base.a) / Math.max(1e-15, curr.a)
      );
      maxLegBScaleRelErr = Math.max(
        maxLegBScaleRelErr,
        Math.abs(curr.b - k * base.b) / Math.max(1e-15, curr.b)
      );
      maxHypScaleRelErr = Math.max(
        maxHypScaleRelErr,
        Math.abs(curr.c - k * base.c) / Math.max(1e-15, curr.c)
      );
    }
  }

  return {
    referenceRadius: refR,
    comparedRadii: [...radii],
    maxAngleADiffDeg,
    maxAngleBDiffDeg,
    maxRatioBADiff,
    maxArcLengthScaleRelErr,
    maxLegAScaleRelErr,
    maxLegBScaleRelErr,
    maxHypScaleRelErr,
    allShapeInvariantsHold:
      maxAngleADiffDeg < 1e-11 && maxAngleBDiffDeg < 1e-11 && maxRatioBADiff < 1e-11,
    allScaleLawsHold:
      maxArcLengthScaleRelErr < 1e-12 &&
      maxLegAScaleRelErr < 1e-12 &&
      maxLegBScaleRelErr < 1e-12 &&
      maxHypScaleRelErr < 1e-12,
  };
}

/**
 * Converts a chosen central angle alphaDeg and inradius r directly into legs (a, b)
 * for interactive UI use.
 */
export function legsFromArcAngle(r: number, alphaDeg: number): { a: number; b: number; c: number } {
  const pt = computeArcAnglePoint(r, alphaDeg, 1);
  return { a: pt.a, b: pt.b, c: pt.c };
}

export interface Experiment04ChartSuiteSvg {
  chart1AngleA: string;
  chart2AngleB: string;
  chart3AnglesCombined: string;
  chart4ArcLength: string;
  chart5LegRatio: string;
}

function buildSvgChartFrame(
  title: string,
  subtitle: string,
  xLabel: string,
  yLabel: string,
  innerSvg: string,
  W = 680,
  H = 360
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff;">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff" rx="8" />
  <text x="58" y="28" font-size="14" font-weight="700" fill="#0f172a">${title}</text>
  <text x="58" y="45" font-size="11" fill="#475569">${subtitle}</text>
  ${innerSvg}
  <text x="${W / 2 + 18}" y="${H - 8}" text-anchor="middle" font-size="11" font-weight="600" fill="#334155">${xLabel}</text>
  <text x="16" y="${H / 2 + 12}" text-anchor="middle" font-size="11" font-weight="600" fill="#334155" transform="rotate(-90 16 ${H / 2 + 12})">${yLabel}</text>
</svg>`;
}

/**
 * Generates the 5 publication-ready SVG plots specified in Section 9 of Experiment 04:
 *   1. Angle A(alpha)
 *   2. Angle B(alpha)
 *   3. Angle A(alpha) & Angle B(alpha) combined
 *   4. Arc length L(alpha) for r = 1, 2, 3
 *   5. Leg ratio b/a = cot(alpha) (scale-invariant across r = 1, 2, 3)
 */
export function generateExperiment04SvgCharts(): Experiment04ChartSuiteSvg {
  const W = 680;
  const H = 360;
  const PAD = { l: 58, r: 28, t: 62, b: 46 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const xOfAlpha = (deg: number) => PAD.l + (deg / 90) * plotW;
  const angles = getInteriorAnglesDeg(5);

  const buildAxesGrid = (yTicks: number[], yMax: number, formatY: (v: number) => string) => {
    const yOf = (val: number) => PAD.t + plotH - (val / yMax) * plotH;
    const xTicks = [0, 15, 30, 45, 60, 75, 90];

    const yGrid = yTicks
      .map((yv) => {
        const y = yOf(yv);
        return `
  <line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W - PAD.r}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" />
  <text x="${PAD.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#475569" font-family="monospace">${formatY(yv)}</text>`;
      })
      .join('');

    const xGrid = xTicks
      .map((xv) => {
        const x = xOfAlpha(xv);
        const isSym = xv === 45;
        return `
  <line x1="${x.toFixed(1)}" y1="${PAD.t}" x2="${x.toFixed(1)}" y2="${H - PAD.b}" stroke="${isSym ? '#cbd5e1' : '#f1f5f9'}" stroke-width="1" ${isSym ? 'stroke-dasharray="4 3"' : ''} />
  <text x="${x.toFixed(1)}" y="${H - PAD.b + 16}" text-anchor="middle" font-size="10" fill="#475569" font-family="monospace">${xv}°</text>`;
      })
      .join('');

    return `${yGrid}${xGrid}
  <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${H - PAD.b}" stroke="#64748b" stroke-width="1.3" />
  <line x1="${PAD.l}" y1="${H - PAD.b}" x2="${W - PAD.r}" y2="${H - PAD.b}" stroke="#64748b" stroke-width="1.3" />`;
  };

  // Chart 1: Angle A(alpha) = 90 - alpha
  const yOfDeg = (deg: number) => PAD.t + plotH - (deg / 90) * plotH;
  const pathA = angles
    .map((deg, idx) => `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(deg).toFixed(1)} ${yOfDeg(90 - deg).toFixed(1)}`)
    .join(' ');
  const dotsA = angles
    .map(
      (deg) =>
        `<circle cx="${xOfAlpha(deg).toFixed(1)}" cy="${yOfDeg(90 - deg).toFixed(1)}" r="3.2" fill="#2563eb" stroke="#ffffff" stroke-width="1" />`
    )
    .join('');

  const chart1AngleA = buildSvgChartFrame(
    'График 1. Угол A от центрального угла дуги α (для r = 1, 2, 3)',
    'Линейная убывающая зависимость A(α) = 90° − α; кривые всех трёх масштабов совпадают',
    'Центральный угол касания α (град)',
    'Угол A при катете OA (град)',
    `${buildAxesGrid([0, 15, 30, 45, 60, 75, 90], 90, (v) => `${v}°`)}
    <path d="${pathA}" fill="none" stroke="#2563eb" stroke-width="2.5" />
    ${dotsA}
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfDeg(45).toFixed(1)}" r="5" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <text x="${xOfAlpha(45) + 10}" y="${yOfDeg(45) - 8}" font-size="10.5" font-weight="600" fill="#0f172a">α = 45°, A = 45° (a = b)</text>
    <rect x="${W - 210}" y="68" width="174" height="32" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
    <line x1="${W - 198}" y1="84" x2="${W - 174}" y2="84" stroke="#2563eb" stroke-width="2.5" />
    <text x="${W - 168}" y="88" font-size="10.5" fill="#0f172a">A(α) для r = 1, 2, 3</text>`,
    W,
    H
  );

  // Chart 2: Angle B(alpha) = alpha
  const pathB = angles
    .map((deg, idx) => `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(deg).toFixed(1)} ${yOfDeg(deg).toFixed(1)}`)
    .join(' ');
  const dotsB = angles
    .map(
      (deg) =>
        `<circle cx="${xOfAlpha(deg).toFixed(1)}" cy="${yOfDeg(deg).toFixed(1)}" r="3.2" fill="#059669" stroke="#ffffff" stroke-width="1" />`
    )
    .join('');

  const chart2AngleB = buildSvgChartFrame(
    'График 2. Угол B от центрального угла дуги α (для r = 1, 2, 3)',
    'Тождество B(α) = α; кривые всех трёх масштабов совпадают независимо от радиуса r',
    'Центральный угол касания α (град)',
    'Угол B при катете OB (град)',
    `${buildAxesGrid([0, 15, 30, 45, 60, 75, 90], 90, (v) => `${v}°`)}
    <path d="${pathB}" fill="none" stroke="#059669" stroke-width="2.5" />
    ${dotsB}
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfDeg(45).toFixed(1)}" r="5" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <text x="${xOfAlpha(45) + 10}" y="${yOfDeg(45) + 14}" font-size="10.5" font-weight="600" fill="#0f172a">α = 45°, B = 45° (a = b)</text>
    <rect x="${PAD.l + 14}" y="68" width="174" height="32" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
    <line x1="${PAD.l + 24}" y1="84" x2="${PAD.l + 48}" y2="84" stroke="#059669" stroke-width="2.5" />
    <text x="${PAD.l + 54}" y="88" font-size="10.5" fill="#0f172a">B(α) для r = 1, 2, 3</text>`,
    W,
    H
  );

  // Chart 3: Combined A(alpha) and B(alpha) with research zones highlighted
  const zoneShades = [
    { a1: 15, a2: 30, fill: '#e0f2fe', label: '15–30°' },
    { a1: 30, a2: 45, fill: '#dcfce7', label: '30–45°' },
    { a1: 45, a2: 60, fill: '#fef3c7', label: '45–60°' },
    { a1: 60, a2: 75, fill: '#ede9fe', label: '60–75°' },
  ]
    .map((z) => {
      const x1 = xOfAlpha(z.a1);
      const w = xOfAlpha(z.a2) - x1;
      return `<rect x="${x1.toFixed(1)}" y="${PAD.t}" width="${w.toFixed(1)}" height="${plotH}" fill="${z.fill}" opacity="0.45" />
      <text x="${(x1 + w / 2).toFixed(1)}" y="${PAD.t + 14}" text-anchor="middle" font-size="9" fill="#475569">${z.label}</text>`;
    })
    .join('');

  const chart3AnglesCombined = buildSvgChartFrame(
    'График 3. Взаимно дополнительные углы A(α) и B(α) на одной плоскости',
    'Точка пересечения α = 45° (A = B = 45°); везде A + B = 90° независимо от r ∈ {1, 2, 3}',
    'Центральный угол касания α (град)',
    'Острые углы треугольника (град)',
    `${zoneShades}
    ${buildAxesGrid([0, 15, 30, 45, 60, 75, 90], 90, (v) => `${v}°`)}
    <path d="${pathA}" fill="none" stroke="#2563eb" stroke-width="2.5" />
    <path d="${pathB}" fill="none" stroke="#059669" stroke-width="2.5" />
    ${dotsA}
    ${dotsB}
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfDeg(45).toFixed(1)}" r="5.5" fill="#d97706" stroke="#ffffff" stroke-width="1.8" />
    <text x="${xOfAlpha(45).toFixed(1)}" y="${yOfDeg(45) - 14}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#92400e">Симметрия (45°, 45°)</text>
    <rect x="${W - 220}" y="68" width="184" height="50" fill="#ffffff" stroke="#cbd5e1" rx="4" opacity="0.95" />
    <line x1="${W - 208}" y1="84" x2="${W - 184}" y2="84" stroke="#2563eb" stroke-width="2.5" />
    <text x="${W - 178}" y="88" font-size="10.5" fill="#0f172a">Угол A = 90° − α</text>
    <line x1="${W - 208}" y1="104" x2="${W - 184}" y2="104" stroke="#059669" stroke-width="2.5" />
    <text x="${W - 178}" y="108" font-size="10.5" fill="#0f172a">Угол B = α</text>`,
    W,
    H
  );

  // Chart 4: Arc length L(alpha) for r = 1, 2, 3
  const maxL = 5.0;
  const yOfL = (L: number) => PAD.t + plotH - (L / maxL) * plotH;
  const radiusStyles = [
    { r: 1, color: '#0284c7', label: 'r = 1 (L_max = π/2 ≈ 1.5708)' },
    { r: 2, color: '#d97706', label: 'r = 2 (L_max = π ≈ 3.1416)' },
    { r: 3, color: '#7c3aed', label: 'r = 3 (L_max = 3π/2 ≈ 4.7124)' },
  ];

  const arcPaths = radiusStyles
    .map((rs) => {
      const p = [0, ...angles, 90]
        .map((deg, idx) => {
          const L = rs.r * deg * DEG2RAD;
          return `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(deg).toFixed(1)} ${yOfL(L).toFixed(1)}`;
        })
        .join(' ');
      const dots = angles
        .map((deg) => {
          const L = rs.r * deg * DEG2RAD;
          return `<circle cx="${xOfAlpha(deg).toFixed(1)}" cy="${yOfL(L).toFixed(1)}" r="2.8" fill="${rs.color}" stroke="#ffffff" stroke-width="0.9" />`;
        })
        .join('');
      return `<path d="${p}" fill="none" stroke="${rs.color}" stroke-width="2.3" />${dots}`;
    })
    .join('');

  const chart4ArcLength = buildSvgChartFrame(
    'График 4. Длина дуги L(α) = r·α для трёх масштабов r = 1, 2, 3',
    'Строгая линейная пропорциональность радиусу: L(r, α) = r · (π·α°/180)',
    'Центральный угол касания α (град)',
    'Длина пройденной дуги L (ед.)',
    `${buildAxesGrid([0, 1, 2, 3, 4, 5], maxL, (v) => v.toFixed(1))}
    ${arcPaths}
    <rect x="${PAD.l + 14}" y="68" width="230" height="66" fill="#ffffff" stroke="#cbd5e1" rx="4" opacity="0.95" />
    ${radiusStyles
      .map(
        (rs, idx) => `
    <line x1="${PAD.l + 24}" y1="${84 + idx * 18}" x2="${PAD.l + 46}" y2="${84 + idx * 18}" stroke="${rs.color}" stroke-width="2.5" />
    <text x="${PAD.l + 52}" y="${88 + idx * 18}" font-size="10" fill="#0f172a">${rs.label}</text>`
      )
      .join('')}`,
    W,
    H
  );

  // Chart 5: Leg ratio b/a = cot(alpha) (capped on [0, 12] to clearly resolve 5..85 deg)
  const maxRatio = 12;
  const yOfRatio = (val: number) => PAD.t + plotH - (Math.min(maxRatio, val) / maxRatio) * plotH;
  const fineDegs: number[] = [];
  for (let d = 5; d <= 85; d += 0.5) {
    fineDegs.push(d);
  }
  const ratioPath = fineDegs
    .map((deg, idx) => {
      const val = 1 / Math.tan(deg * DEG2RAD);
      return `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(deg).toFixed(1)} ${yOfRatio(val).toFixed(1)}`;
    })
    .join(' ');
  const ratioDots = angles
    .map((deg) => {
      const val = 1 / Math.tan(deg * DEG2RAD);
      return `<circle cx="${xOfAlpha(deg).toFixed(1)}" cy="${yOfRatio(val).toFixed(1)}" r="3.2" fill="#dc2626" stroke="#ffffff" stroke-width="1" />`;
    })
    .join('');

  const chart5LegRatio = buildSvgChartFrame(
    'График 5. Отношение катетов t = b / a = cot(α) от центрального угла α',
    'Инвариант формы: совпадает для r = 1, 2, 3; при α = 45° проходит через точку симметрии b/a = 1',
    'Центральный угол касания α (град)',
    'Отношение катетов t = b / a',
    `${buildAxesGrid([0, 1, 2, 4, 6, 8, 10, 12], maxRatio, (v) => v.toFixed(0))}
    <line x1="${PAD.l}" y1="${yOfRatio(1).toFixed(1)}" x2="${W - PAD.r}" y2="${yOfRatio(1).toFixed(1)}" stroke="#94a3b8" stroke-dasharray="4 3" />
    <path d="${ratioPath}" fill="none" stroke="#dc2626" stroke-width="2.4" />
    ${ratioDots}
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfRatio(1).toFixed(1)}" r="5" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <text x="${xOfAlpha(45) + 10}" y="${yOfRatio(1) - 8}" font-size="10.5" font-weight="600" fill="#0f172a">α = 45°, b/a = 1.0000</text>
    <text x="${xOfAlpha(5) + 8}" y="${yOfRatio(11.43) + 12}" font-size="9.5" fill="#991b1b">α = 5°: b/a = 11.4301</text>
    <text x="${xOfAlpha(85) - 6}" y="${yOfRatio(0.0875) - 10}" text-anchor="end" font-size="9.5" fill="#991b1b">α = 85°: b/a = 0.0875</text>`,
    W,
    H
  );

  return {
    chart1AngleA,
    chart2AngleB,
    chart3AnglesCombined,
    chart4ArcLength,
    chart5LegRatio,
  };
}
