/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { assertPositiveFinite } from './circleFirstClassification.ts';
import { computeArcAnglePoint, getInteriorAnglesDeg } from './arcAngleParametricAnalysis.ts';
import type { Point2D } from '../../types/geometry.ts';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const BOUNDARY_TOL = 1e-12;

export const EXPERIMENT05_RADII = [1, 2, 3] as const;
export const EXPERIMENT05_STEP_DEG = 5;

export interface IncircleArcRecord {
  id: 'arc_A' | 'arc_B' | 'arc_C';
  oppositeVertex: 'A' | 'B' | 'C';
  centralAngleDeg: number;
  centralAngleRad: number;
  arcLength: number;
  shareOfCircle: number; // fraction in (0, 1)
  sharePercent: number;  // percentage in (0, 100)
}

export interface IncircleArcDistributionPoint {
  rowIndex: number;
  r: number;
  alphaDeg: number; // angle B = alpha, angle A = 90 - alpha, angle C = 90
  a: number;
  b: number;
  c: number;
  angleADeg: number;
  angleBDeg: number;
  angleCDeg: number;
  // Three central angles (in degrees & radians)
  phiADeg: number; // 180 - A = 90 + alpha (between I->T_OA and I->T_AB)
  phiBDeg: number; // 180 - B = 180 - alpha (between I->T_OB and I->T_AB)
  phiCDeg: number; // 180 - C = 90 (between I->T_OA and I->T_OB)
  phiARad: number;
  phiBRad: number;
  phiCRad: number;
  centralAngleSumDeg: number;
  // Three arc lengths L = r * phi_rad
  lengthA: number;
  lengthB: number;
  lengthC: number;
  totalCircumference: number;
  arcLengthSum: number;
  arcSumResidualAbs: number;
  // Normalized shares of full circle
  shareA: number;
  shareB: number;
  shareC: number;
  shareSum: number;
  // Ratios relative to L_C (which is fixed at 1/4 of circumference)
  ratioAToC: number; // (90 + alpha) / 90
  ratioBToC: number; // (180 - alpha) / 90
  ratioAToB: number; // (90 + alpha) / (180 - alpha)
  // Tangency points & incenter
  incenter: Point2D;
  tangencyOA: Point2D;
  tangencyOB: Point2D;
  tangencyAB: Point2D;
  // Structural & symmetry predicates
  areLegArcsEqual: boolean;   // phi_A == phi_B (holds iff alpha == 45 deg)
  areAllThreeEqual: boolean;  // phi_A == phi_B == phi_C == 120 deg (always false for right triangles)
  arcs: [IncircleArcRecord, IncircleArcRecord, IncircleArcRecord];
}

export interface Experiment05ScaleInvarianceReport {
  referenceRadius: number;
  comparedRadii: number[];
  maxPhiADiffDeg: number;
  maxPhiBDiffDeg: number;
  maxPhiCDiffDeg: number;
  maxShareDiff: number;
  maxLengthScaleRelErr: number;
  angularDistributionInvariant: boolean;
  arcLengthsScaleLinearly: boolean;
}

export interface GeneralTriangleArcEqualityResult {
  angleADeg: number;
  angleBDeg: number;
  angleCDeg: number;
  phiADeg: number;
  phiBDeg: number;
  phiCDeg: number;
  angleSumDeg: number;
  phiSumDeg: number;
  allThreeEqual120: boolean;
}

/**
 * Evaluates the general Euclidean theorem phi_X = 180 - angle_X for any triangle angles (A, B, C)
 * with A + B + C = 180 deg, used to verify when all three central angles equal 120 deg.
 */
export function evaluateGeneralTriangleCentralAngles(
  angleADeg: number,
  angleBDeg: number,
  angleCDeg: number
): GeneralTriangleArcEqualityResult {
  if (
    !Number.isFinite(angleADeg) ||
    !Number.isFinite(angleBDeg) ||
    !Number.isFinite(angleCDeg) ||
    angleADeg <= 0 ||
    angleBDeg <= 0 ||
    angleCDeg <= 0
  ) {
    throw new RangeError('Triangle angles must be strictly positive finite numbers');
  }
  const angleSumDeg = angleADeg + angleBDeg + angleCDeg;
  if (Math.abs(angleSumDeg - 180) > 1e-9) {
    throw new RangeError(`Triangle angles must sum to 180 deg, got ${angleSumDeg}`);
  }

  const phiADeg = 180 - angleADeg;
  const phiBDeg = 180 - angleBDeg;
  const phiCDeg = 180 - angleCDeg;
  const phiSumDeg = phiADeg + phiBDeg + phiCDeg;

  const allThreeEqual120 =
    Math.abs(phiADeg - 120) < 1e-9 &&
    Math.abs(phiBDeg - 120) < 1e-9 &&
    Math.abs(phiCDeg - 120) < 1e-9;

  return {
    angleADeg,
    angleBDeg,
    angleCDeg,
    phiADeg,
    phiBDeg,
    phiCDeg,
    angleSumDeg,
    phiSumDeg,
    allThreeEqual120,
  };
}

/**
 * Computes the three incircle central angles, arc lengths, normalized shares, and vector cross-checks
 * from incircle radius r > 0 and acute angle alphaDeg in (0, 90) (where B = alpha, A = 90 - alpha, C = 90).
 */
export function computeIncircleArcDistribution(
  r: number,
  alphaDeg: number,
  rowIndex = 1
): IncircleArcDistributionPoint {
  const validR = assertPositiveFinite(r, 'inradius r');
  if (
    typeof alphaDeg !== 'number' ||
    !Number.isFinite(alphaDeg) ||
    alphaDeg <= BOUNDARY_TOL ||
    alphaDeg >= 90 - BOUNDARY_TOL
  ) {
    throw new RangeError(
      `Expected interior angle alphaDeg in (0, 90), got ${String(alphaDeg)}`
    );
  }

  const base = computeArcAnglePoint(validR, alphaDeg, rowIndex);
  const angleADeg = base.angleADeg; // 90 - alpha
  const angleBDeg = base.angleBDeg; // alpha
  const angleCDeg = 90;

  // Direct vector-based central angles from I=(r,r) to T_OA=(0,r), T_OB=(r,0), T_AB=(r(1+sin a), r(1+cos a)):
  // v_OA = (-1, 0), v_OB = (0, -1), v_AB = (sin(alpha), cos(alpha))
  const vOAx = (base.tangencyOA.x - validR) / validR;
  const vOAy = (base.tangencyOA.y - validR) / validR;
  const vOBx = (base.tangencyOB.x - validR) / validR;
  const vOBy = (base.tangencyOB.y - validR) / validR;
  const vABx = (base.tangencyAB.x - validR) / validR;
  const vABy = (base.tangencyAB.y - validR) / validR;

  // Numerically stable central angles between unit radial vectors using atan2(|u x v|, u . v),
  // avoiding acos precision loss near collinear boundary limits (alpha -> 0+ or 90-).
  const angleBetweenUnitVectors = (ux: number, uy: number, vx: number, vy: number): number => {
    const cross = Math.abs(ux * vy - uy * vx);
    const dot = ux * vx + uy * vy;
    return Math.atan2(cross, dot);
  };
  const phiARad = angleBetweenUnitVectors(vOAx, vOAy, vABx, vABy);
  const phiBRad = angleBetweenUnitVectors(vOBx, vOBy, vABx, vABy);
  const phiCRad = angleBetweenUnitVectors(vOAx, vOAy, vOBx, vOBy);

  const phiADeg = phiARad * RAD2DEG;
  const phiBDeg = phiBRad * RAD2DEG;
  const phiCDeg = phiCRad * RAD2DEG;
  const centralAngleSumDeg = phiADeg + phiBDeg + phiCDeg;

  const lengthA = validR * phiARad;
  const lengthB = validR * phiBRad;
  const lengthC = validR * phiCRad;
  const totalCircumference = 2 * Math.PI * validR;
  const arcLengthSum = lengthA + lengthB + lengthC;
  const arcSumResidualAbs = Math.abs(arcLengthSum - totalCircumference);

  const shareA = lengthA / totalCircumference;
  const shareB = lengthB / totalCircumference;
  const shareC = lengthC / totalCircumference;
  const shareSum = shareA + shareB + shareC;

  const areLegArcsEqual = Math.abs(phiADeg - phiBDeg) < 1e-9;
  const areAllThreeEqual =
    Math.abs(phiADeg - phiBDeg) < 1e-9 && Math.abs(phiBDeg - phiCDeg) < 1e-9;

  const arcs: [IncircleArcRecord, IncircleArcRecord, IncircleArcRecord] = [
    {
      id: 'arc_A',
      oppositeVertex: 'A',
      centralAngleDeg: phiADeg,
      centralAngleRad: phiARad,
      arcLength: lengthA,
      shareOfCircle: shareA,
      sharePercent: shareA * 100,
    },
    {
      id: 'arc_B',
      oppositeVertex: 'B',
      centralAngleDeg: phiBDeg,
      centralAngleRad: phiBRad,
      arcLength: lengthB,
      shareOfCircle: shareB,
      sharePercent: shareB * 100,
    },
    {
      id: 'arc_C',
      oppositeVertex: 'C',
      centralAngleDeg: phiCDeg,
      centralAngleRad: phiCRad,
      arcLength: lengthC,
      shareOfCircle: shareC,
      sharePercent: shareC * 100,
    },
  ];

  return {
    rowIndex,
    r: validR,
    alphaDeg,
    a: base.a,
    b: base.b,
    c: base.c,
    angleADeg,
    angleBDeg,
    angleCDeg,
    phiADeg,
    phiBDeg,
    phiCDeg,
    phiARad,
    phiBRad,
    phiCRad,
    centralAngleSumDeg,
    lengthA,
    lengthB,
    lengthC,
    totalCircumference,
    arcLengthSum,
    arcSumResidualAbs,
    shareA,
    shareB,
    shareC,
    shareSum,
    ratioAToC: lengthA / lengthC,
    ratioBToC: lengthB / lengthC,
    ratioAToB: lengthA / lengthB,
    incenter: { x: validR, y: validR },
    tangencyOA: base.tangencyOA,
    tangencyOB: base.tangencyOB,
    tangencyAB: base.tangencyAB,
    areLegArcsEqual,
    areAllThreeEqual,
    arcs,
  };
}

/**
 * Computes Experiment 05 distribution directly from legs (a, b) of a right triangle.
 */
export function computeIncircleArcDistributionFromLegs(
  a: number,
  b: number
): IncircleArcDistributionPoint {
  const validA = assertPositiveFinite(a, 'leg a');
  const validB = assertPositiveFinite(b, 'leg b');
  const c = Math.hypot(validA, validB);
  const r = (validA / (validA + validB + c)) * validB;
  const alphaDeg = Math.atan2(validA, validB) * RAD2DEG;
  return computeIncircleArcDistribution(r, alphaDeg, 1);
}

/**
 * Generates the unified parametric grid across radii (default 1, 2, 3) and 5-degree steps.
 */
export function generateExperiment05Table(
  radii: readonly number[] = EXPERIMENT05_RADII,
  stepDeg = EXPERIMENT05_STEP_DEG
): IncircleArcDistributionPoint[] {
  const angles = getInteriorAnglesDeg(stepDeg);
  const rows: IncircleArcDistributionPoint[] = [];
  let rowIndex = 1;
  for (const r of radii) {
    for (const alphaDeg of angles) {
      rows.push(computeIncircleArcDistribution(r, alphaDeg, rowIndex));
      rowIndex += 1;
    }
  }
  return rows;
}

/**
 * Verifies scale invariance of central angles and normalized shares across radii
 * alongside strict linear scaling L(k*r) = k * L(r).
 */
export function verifyExperiment05ScaleInvariance(
  radii: readonly number[] = EXPERIMENT05_RADII,
  stepDeg = EXPERIMENT05_STEP_DEG
): Experiment05ScaleInvarianceReport {
  if (radii.length === 0) {
    throw new RangeError('Expected at least one radius');
  }
  const refR = assertPositiveFinite(radii[0], 'reference radius');
  const angles = getInteriorAnglesDeg(stepDeg);

  let maxPhiADiffDeg = 0;
  let maxPhiBDiffDeg = 0;
  let maxPhiCDiffDeg = 0;
  let maxShareDiff = 0;
  let maxLengthScaleRelErr = 0;

  for (const alphaDeg of angles) {
    const base = computeIncircleArcDistribution(refR, alphaDeg, 1);
    for (let i = 1; i < radii.length; i += 1) {
      const r = assertPositiveFinite(radii[i], `radii[${i}]`);
      const k = r / refR;
      const curr = computeIncircleArcDistribution(r, alphaDeg, 1);

      maxPhiADiffDeg = Math.max(maxPhiADiffDeg, Math.abs(curr.phiADeg - base.phiADeg));
      maxPhiBDiffDeg = Math.max(maxPhiBDiffDeg, Math.abs(curr.phiBDeg - base.phiBDeg));
      maxPhiCDiffDeg = Math.max(maxPhiCDiffDeg, Math.abs(curr.phiCDeg - base.phiCDeg));

      maxShareDiff = Math.max(
        maxShareDiff,
        Math.abs(curr.shareA - base.shareA),
        Math.abs(curr.shareB - base.shareB),
        Math.abs(curr.shareC - base.shareC)
      );

      maxLengthScaleRelErr = Math.max(
        maxLengthScaleRelErr,
        Math.abs(curr.lengthA - k * base.lengthA) / curr.lengthA,
        Math.abs(curr.lengthB - k * base.lengthB) / curr.lengthB,
        Math.abs(curr.lengthC - k * base.lengthC) / curr.lengthC
      );
    }
  }

  return {
    referenceRadius: refR,
    comparedRadii: [...radii],
    maxPhiADiffDeg,
    maxPhiBDiffDeg,
    maxPhiCDiffDeg,
    maxShareDiff,
    maxLengthScaleRelErr,
    angularDistributionInvariant:
      maxPhiADiffDeg < 1e-11 &&
      maxPhiBDiffDeg < 1e-11 &&
      maxPhiCDiffDeg < 1e-11 &&
      maxShareDiff < 1e-13,
    arcLengthsScaleLinearly: maxLengthScaleRelErr < 1e-12,
  };
}

export interface Experiment05ChartSuiteSvg {
  chart1CentralAngles: string;
  chart2NormalizedShares: string;
  chart3ArcLengthsByRadius: string;
  chart4PolarSectorsComparison: string;
}

function buildSvgFrame(
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
 * Generates 4 SVG plots for Experiment 05 documentation.
 */
export function generateExperiment05SvgCharts(): Experiment05ChartSuiteSvg {
  const W = 680;
  const H = 360;
  const PAD = { l: 58, r: 28, t: 62, b: 46 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const xOfAlpha = (deg: number) => PAD.l + (deg / 90) * plotW;
  const angles = getInteriorAnglesDeg(5);

  const buildAxes = (yTicks: number[], yMax: number, formatY: (v: number) => string) => {
    const yOf = (val: number) => PAD.t + plotH - (val / yMax) * plotH;
    const xTicks = [0, 15, 30, 45, 60, 75, 90];

    const yGrid = yTicks
      .map((yv) => {
        const y = yOf(yv);
        return `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W - PAD.r}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" />
  <text x="${PAD.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#475569" font-family="monospace">${formatY(yv)}</text>`;
      })
      .join('');

    const xGrid = xTicks
      .map((xv) => {
        const x = xOfAlpha(xv);
        const isSym = xv === 45;
        return `<line x1="${x.toFixed(1)}" y1="${PAD.t}" x2="${x.toFixed(1)}" y2="${H - PAD.b}" stroke="${isSym ? '#cbd5e1' : '#f1f5f9'}" stroke-width="1" ${isSym ? 'stroke-dasharray="4 3"' : ''} />
  <text x="${x.toFixed(1)}" y="${H - PAD.b + 16}" text-anchor="middle" font-size="10" fill="#475569" font-family="monospace">${xv}°</text>`;
      })
      .join('');

    return `${yGrid}${xGrid}
  <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${H - PAD.b}" stroke="#64748b" stroke-width="1.3" />
  <line x1="${PAD.l}" y1="${H - PAD.b}" x2="${W - PAD.r}" y2="${H - PAD.b}" stroke="#64748b" stroke-width="1.3" />`;
  };

  // Chart 1: Three Central Angles phi_A, phi_B, phi_C vs alpha
  const yOfPhi = (deg: number) => PAD.t + plotH - (deg / 180) * plotH;
  const pathPhiA = [0, ...angles, 90]
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(d).toFixed(1)} ${yOfPhi(90 + d).toFixed(1)}`)
    .join(' ');
  const pathPhiB = [0, ...angles, 90]
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(d).toFixed(1)} ${yOfPhi(180 - d).toFixed(1)}`)
    .join(' ');
  const pathPhiC = `M ${xOfAlpha(0).toFixed(1)} ${yOfPhi(90).toFixed(1)} L ${xOfAlpha(90).toFixed(1)} ${yOfPhi(90).toFixed(1)}`;

  const chart1CentralAngles = buildSvgFrame(
    'График 1. Центральные углы трёх дуг вписанной окружности φ_A, φ_B, φ_C от α',
    'φ_A = 90° + α, φ_B = 180° − α, φ_C ≡ 90° (инвариантны к масштабу r = 1, 2, 3)',
    'Острый угол B = α (град)',
    'Центральный угол φ (град)',
    `${buildAxes([0, 45, 90, 120, 135, 180], 180, (v) => `${v}°`)}
    <line x1="${PAD.l}" y1="${yOfPhi(120).toFixed(1)}" x2="${W - PAD.r}" y2="${yOfPhi(120).toFixed(1)}" stroke="#94a3b8" stroke-dasharray="3 3" />
    <text x="${W - PAD.r - 4}" y="${(yOfPhi(120) - 5).toFixed(1)}" text-anchor="end" font-size="9.5" fill="#64748b">120° (недостижимо одновременно для всех 3 дуг)</text>
    <path d="${pathPhiA}" fill="none" stroke="#2563eb" stroke-width="2.5" />
    <path d="${pathPhiB}" fill="none" stroke="#059669" stroke-width="2.5" />
    <path d="${pathPhiC}" fill="none" stroke="#d97706" stroke-width="2.5" />
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfPhi(135).toFixed(1)}" r="5" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <text x="${xOfAlpha(45).toFixed(1)}" y="${(yOfPhi(135) - 10).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">α=45°: φ_A=φ_B=135°, φ_C=90°</text>
    <rect x="${PAD.l + 14}" y="68" width="214" height="62" fill="#ffffff" stroke="#cbd5e1" rx="4" opacity="0.95" />
    <line x1="${PAD.l + 24}" y1="84" x2="${PAD.l + 44}" y2="84" stroke="#2563eb" stroke-width="2.5" />
    <text x="${PAD.l + 50}" y="88" font-size="10" fill="#0f172a">φ_A = 180° − A = 90° + α</text>
    <line x1="${PAD.l + 24}" y1="102" x2="${PAD.l + 44}" y2="102" stroke="#059669" stroke-width="2.5" />
    <text x="${PAD.l + 50}" y="106" font-size="10" fill="#0f172a">φ_B = 180° − B = 180° − α</text>
    <line x1="${PAD.l + 24}" y1="120" x2="${PAD.l + 44}" y2="120" stroke="#d97706" stroke-width="2.5" />
    <text x="${PAD.l + 50}" y="124" font-size="10" fill="#0f172a">φ_C = 180° − C = 90° (const)</text>`,
    W,
    H
  );

  // Chart 2: Normalized Shares s_A, s_B, s_C (%)
  const yOfPct = (pct: number) => PAD.t + plotH - (pct / 60) * plotH;
  const pathShareA = [0, ...angles, 90]
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(d).toFixed(1)} ${yOfPct(((90 + d) / 360) * 100).toFixed(1)}`)
    .join(' ');
  const pathShareB = [0, ...angles, 90]
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xOfAlpha(d).toFixed(1)} ${yOfPct(((180 - d) / 360) * 100).toFixed(1)}`)
    .join(' ');
  const pathShareC = `M ${xOfAlpha(0).toFixed(1)} ${yOfPct(25).toFixed(1)} L ${xOfAlpha(90).toFixed(1)} ${yOfPct(25).toFixed(1)}`;

  const chart2NormalizedShares = buildSvgFrame(
    'График 2. Нормализованные доли трёх дуг в длине вписанной окружности (%)',
    'Дуга при прямом угле занимает ровно 25%; оставшиеся 75% линейно перераспределяются по α',
    'Острый угол B = α (град)',
    'Доля от полной окружности (%)',
    `${buildAxes([0, 15, 25, 37.5, 50, 60], 60, (v) => `${v}%`)}
    <path d="${pathShareA}" fill="none" stroke="#2563eb" stroke-width="2.5" />
    <path d="${pathShareB}" fill="none" stroke="#059669" stroke-width="2.5" />
    <path d="${pathShareC}" fill="none" stroke="#d97706" stroke-width="2.5" />
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfPct(37.5).toFixed(1)}" r="4.8" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <text x="${xOfAlpha(45).toFixed(1)}" y="${(yOfPct(37.5) - 10).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">37.5% / 37.5% / 25%</text>
    <text x="${xOfAlpha(72).toFixed(1)}" y="${(yOfPct(25) - 6).toFixed(1)}" font-size="10" font-weight="600" fill="#b45309">s_C ≡ 25.0% (1/4 окружности)</text>`,
    W,
    H
  );

  // Chart 3: Absolute Arc Lengths L_A, L_B, L_C across r = 1, 2, 3 (showing linear scaling)
  const maxLen = 10.0;
  const yOfLen = (L: number) => PAD.t + plotH - (L / maxLen) * plotH;
  const radiiStyles = [
    { r: 1, strokeDash: undefined, label: 'r = 1 (C = 2π ≈ 6.28)' },
    { r: 2, strokeDash: '6 3', label: 'r = 2 (C = 4π ≈ 12.57)' },
    { r: 3, strokeDash: '2 3', label: 'r = 3 (C = 6π ≈ 18.85)' },
  ];

  const lenPaths = radiiStyles
    .map((rs) => {
      const pA = [0, ...angles, 90]
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(d).toFixed(1)} ${yOfLen(rs.r * (90 + d) * DEG2RAD).toFixed(1)}`)
        .join(' ');
      const pB = [0, ...angles, 90]
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(d).toFixed(1)} ${yOfLen(rs.r * (180 - d) * DEG2RAD).toFixed(1)}`)
        .join(' ');
      const pC = `M ${xOfAlpha(0).toFixed(1)} ${yOfLen((rs.r * Math.PI) / 2).toFixed(1)} L ${xOfAlpha(90).toFixed(1)} ${yOfLen((rs.r * Math.PI) / 2).toFixed(1)}`;
      const dashAttr = rs.strokeDash ? `stroke-dasharray="${rs.strokeDash}"` : '';
      return `
      <path d="${pA}" fill="none" stroke="#2563eb" stroke-width="2" ${dashAttr} />
      <path d="${pB}" fill="none" stroke="#059669" stroke-width="2" ${dashAttr} />
      <path d="${pC}" fill="none" stroke="#d97706" stroke-width="2" ${dashAttr} />`;
    })
    .join('');

  const chart3ArcLengthsByRadius = buildSvgFrame(
    'График 3. Абсолютные длины дуг L_A, L_B, L_C при r = 1, 2, 3',
    'Масштаб r задаёт вертикальное растяжение L = r·φ в 1 : 2 : 3 раза при неизменных угловых пропорциях',
    'Острый угол B = α (град)',
    'Длина дуги L (ед.)',
    `${buildAxes([0, 2, 4, 6, 8, 10], maxLen, (v) => v.toFixed(0))}
    ${lenPaths}
    <rect x="${PAD.l + 14}" y="68" width="210" height="60" fill="#ffffff" stroke="#cbd5e1" rx="4" opacity="0.95" />
    <line x1="${PAD.l + 24}" y1="84" x2="${PAD.l + 46}" y2="84" stroke="#334155" stroke-width="2" />
    <text x="${PAD.l + 52}" y="88" font-size="10" fill="#0f172a">Сплошная: r = 1 (L_C = π/2)</text>
    <line x1="${PAD.l + 24}" y1="101" x2="${PAD.l + 46}" y2="101" stroke="#334155" stroke-width="2" stroke-dasharray="6 3" />
    <text x="${PAD.l + 52}" y="105" font-size="10" fill="#0f172a">Штрих: r = 2 (L_C = π)</text>
    <line x1="${PAD.l + 24}" y1="118" x2="${PAD.l + 46}" y2="118" stroke="#334155" stroke-width="2" stroke-dasharray="2 3" />
    <text x="${PAD.l + 52}" y="122" font-size="10" fill="#0f172a">Пунктир: r = 3 (L_C = 3π/2)</text>`,
    W,
    H
  );

  // Chart 4: Visual Sector Breakdown for α = 15°, 30°, 45°, 60°, 75°
  const sampleAlphas = [15, 30, 45, 60, 75];
  const radiusPx = 44;
  const cxStart = 96;
  const cxStep = 122;
  const cy = 195;

  const sectorSvgs = sampleAlphas
    .map((alpha, idx) => {
      const cx = cxStart + idx * cxStep;
      const dist = computeIncircleArcDistribution(1, alpha);
      // Place sectors cleanly in SVG coordinates (start from top -90 deg clockwise: C=90, A=90+alpha, B=180-alpha)
      // Specifically match board orientation: T_OA is left (-180 deg / 180 deg), T_OB is down (+90 deg SVG), T_AB is (-90 + alpha)
      const ptAt = (degFromRightCCW: number) => {
        const rad = degFromRightCCW * DEG2RAD;
        return {
          x: cx + radiusPx * Math.cos(rad),
          y: cy - radiusPx * Math.sin(rad),
        };
      };
      const pOA = ptAt(180);
      const pOB = ptAt(270);
      const pAB = ptAt(90 - alpha);

      const arcPath = (p1: Point2D, p2: Point2D, largeArc: 0 | 1) =>
        `M ${cx} ${cy} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${radiusPx} ${radiusPx} 0 ${largeArc} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`;

      // Clockwise in SVG: pOA (left) -> pAB (upper-right) -> pOB (down) -> pOA (left)
      const secA = arcPath(pOA, pAB, dist.phiADeg > 180 ? 1 : 0);
      const secB = arcPath(pAB, pOB, dist.phiBDeg > 180 ? 1 : 0);
      const secC = arcPath(pOB, pOA, 0);

      return `
      <g>
        <path d="${secA}" fill="#3b82f6" fill-opacity="0.28" stroke="#2563eb" stroke-width="2" />
        <path d="${secB}" fill="#10b981" fill-opacity="0.28" stroke="#059669" stroke-width="2" />
        <path d="${secC}" fill="#f59e0b" fill-opacity="0.28" stroke="#d97706" stroke-width="2" />
        <circle cx="${cx}" cy="${cy}" r="2.8" fill="#0f172a" />
        <text x="${cx}" y="${cy - radiusPx - 14}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">α = ${alpha}°</text>
        <text x="${cx}" y="${cy + radiusPx + 18}" text-anchor="middle" font-size="9.5" font-family="monospace" fill="#1d4ed8">φ_A = ${dist.phiADeg.toFixed(0)}° (${dist.arcs[0].sharePercent.toFixed(1)}%)</text>
        <text x="${cx}" y="${cy + radiusPx + 32}" text-anchor="middle" font-size="9.5" font-family="monospace" fill="#047857">φ_B = ${dist.phiBDeg.toFixed(0)}° (${dist.arcs[1].sharePercent.toFixed(1)}%)</text>
        <text x="${cx}" y="${cy + radiusPx + 46}" text-anchor="middle" font-size="9.5" font-family="monospace" fill="#b45309">φ_C = 90° (25.0%)</text>
      </g>`;
    })
    .join('');

  const chart4PolarSectorsComparison = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff;">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff" rx="8" />
  <text x="28" y="30" font-size="14" font-weight="700" fill="#0f172a">График 4. Сравнение секторов трёх дуг вписанной окружности для особых углов α</text>
  <text x="28" y="48" font-size="11" fill="#475569">Синий: дуга φ_A = 90° + α (против ∠A); Зелёный: дуга φ_B = 180° − α (против ∠B); Янтарный: φ_C = 90° (против ∠C = 90°)</text>
  ${sectorSvgs}
  <text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-size="10.5" fill="#475569">При α = 45° равны две дуги при катетах (135° = 135°), но не все три (φ_C = 90°)</text>
</svg>`;

  return {
    chart1CentralAngles,
    chart2NormalizedShares,
    chart3ArcLengthsByRadius,
    chart4PolarSectorsComparison,
  };
}
