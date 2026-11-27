/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { assertPositiveFinite } from './circleFirstClassification.ts';
import { getInteriorAnglesDeg } from './arcAngleParametricAnalysis.ts';
import { computeIncircleArcDistribution } from './incircleArcDistribution.ts';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const BOUNDARY_TOL = 1e-12;

export const EXPERIMENT06_RADII = [1, 2, 3] as const;
export const EXPERIMENT06_STEP_DEG = 5;

export type LawClassificationCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface LawCatalogEntry {
  id: string;
  title: string;
  formulaTex: string;
  category: LawClassificationCategory;
  categoryLabel: string;
  summary: string;
}

/**
 * Standard Euclidean Opposite-Side Notation (adopted throughout Experiment 06):
 *   - Angle A = 90° - alpha (at vertex A on Oy), opposite side a = |OB| (legOB)
 *   - Angle B = alpha       (at vertex B on Ox), opposite side b = |OA| (legOA)
 *   - Angle C = 90°         (at vertex O = (0,0)), opposite side c = |AB|
 *   - Subtriangles:
 *       S_a = Area(ΔIOB) = ½·a·r  (opposite A, base |OB|)
 *       S_b = Area(ΔIOA) = ½·b·r  (opposite B, base |OA|)
 *       S_c = Area(ΔIAB) = ½·c·r  (opposite C, base |AB|)
 *   - Incircle arcs:
 *       φ_A = 180° - A = 90° + alpha  (around vertex A, opposite side a)
 *       φ_B = 180° - B = 180° - alpha (around vertex B, opposite side b)
 *       φ_C = 180° - C = 90°          (around vertex C, opposite side c)
 *
 * Coordinate bridge to Experiments 01–05:
 *   In Experiments 01–05, `exp05.a` denotes vertical leg |OA| (= b here) and
 *   `exp05.b` denotes horizontal leg |OB| (= a here). Both legOA and legOB are
 *   exposed explicitly on ArcSideAreaPoint so zero ambiguity remains.
 */
export const EXPERIMENT06_LAWS_CATALOG: readonly LawCatalogEntry[] = [
  {
    id: 'L-01',
    title: 'Изоморфизм линейной и площадной систем разбиения',
    formulaTex: 'w^{\\text{area}}_k = \\frac{S_k}{S} = \\frac{s_k}{a+b+c} = w^{\\text{side}}_k',
    category: 'A',
    categoryLabel: 'A. Известная закономерность',
    summary: 'Все три малых треугольника имеют общую высоту r к сторонам-основаниям, поэтому доли площадей тождественно равны долям периметра.',
  },
  {
    id: 'L-02',
    title: 'Дополнительность центральных углов дуг',
    formulaTex: '\\varphi_A = 180^\\circ - A,\\quad \\varphi_B = 180^\\circ - B,\\quad \\varphi_C = 90^\\circ',
    category: 'A',
    categoryLabel: 'A. Известная закономерность',
    summary: 'Угловая система окружности линейно определяется углами треугольника: каждая дуга φ_X дополняет угол вершины X до 180°.',
  },
  {
    id: 'L-03',
    title: 'Прямой синусный перенос от дуг к сторонам и площадям',
    formulaTex: 'w^{\\text{area}}_a : w^{\\text{area}}_b : w^{\\text{area}}_c = \\sin\\varphi_A : \\sin\\varphi_B : \\sin\\varphi_C',
    category: 'B',
    categoryLabel: 'B. Новое представление известной закономерности',
    summary: 'В стандартной нотации (a напротив A, b напротив B) теорема синусов переписывается без перестановки индексов: w_k = sin(φ_K) / Σsin(φ).',
  },
  {
    id: 'L-04',
    title: 'Половинное тангенсное разложение через углы дуг',
    formulaTex: '\\left(\\tan\\frac{\\varphi_A}{2}-1\\right)\\left(\\tan\\frac{\\varphi_B}{2}-1\\right)=2,\\quad \\frac{S}{r^2}=\\tan\\frac{\\varphi_A}{2}\\tan\\frac{\\varphi_B}{2}',
    category: 'B',
    categoryLabel: 'B. Новое представление известной закономерности',
    summary: 'Касательные отрезки t_A = p−a = r·tan(φ_A/2), t_B = p−b = r·tan(φ_B/2) дают a = r(1+tan(φ_B/2)), b = r(1+tan(φ_A/2)) и гиперболический инвариант.',
  },
  {
    id: 'L-05',
    title: 'Пифагорово соотношение площадей малых треугольников',
    formulaTex: 'S_a^2 + S_b^2 = S_c^2, \\qquad (w^{\\text{area}}_a)^2 + (w^{\\text{area}}_b)^2 = (w^{\\text{area}}_c)^2',
    category: 'C',
    categoryLabel: 'C. Новое следствие известных теорем',
    summary: 'Следствие теоремы Пифагора и L-01: квадрат площади треугольника при гипотенузе равен сумме квадратов площадей двух треугольников при катетах.',
  },
  {
    id: 'L-06',
    title: 'Площадной дефект и квадрат радиуса r²',
    formulaTex: 'S_a + S_b - S_c = r^2, \\qquad w^{\\text{area}}_a + w^{\\text{area}}_b - w^{\\text{area}}_c = 2w^{\\text{area}}_a w^{\\text{area}}_b = \\frac{r^2}{S}',
    category: 'C',
    categoryLabel: 'C. Новое следствие известных теорем',
    summary: 'Разность между суммой площадей при катетах и площадью при гипотенузе равна площади углового квадрата инцентра r².',
  },
  {
    id: 'L-07',
    title: 'Неэквивалентность дуг и площадей, инверсия C/c и 6 точечных совпадений',
    formulaTex: 'w^{\\text{arc}}_C = \\frac{1}{4} < w^{\\text{area}}_c \\in [\\sqrt{2}-1,\\tfrac{1}{2}), \\quad w^{\\text{arc}}_A = w^{\\text{area}}_a \\;\\text{при}\\; \\alpha\\approx 34.36^\\circ',
    category: 'C',
    categoryLabel: 'C. Новое следствие известных теорем',
    summary: 'Одновременная пропорциональность всех 3 дуг и площадей невозможна; одноимённые острые доли пересекаются ровно по одному разу (34.36° и 55.64°), а w_C = w_b = 25% — точно в (3,4,5).',
  },
  {
    id: 'L-08',
    title: 'Различие радиусов касания и отрезков к вершинам',
    formulaTex: '\\psi_X = 90^\\circ + \\frac{X}{2} = \\frac{360^\\circ - \\varphi_X}{2}, \\quad S_c = \\frac{|IA|\\,|IB|}{2\\sqrt{2}}',
    category: 'A',
    categoryLabel: 'A. Известная закономерность',
    summary: 'Углы между отрезками к вершинам (биссектрисами) равны полусумме углов треугольника с 90° и строго отличны от самих углов φ_X (ψ_C ≡ 135° ≠ 90°).',
  },
] as const;

export interface ArcSideAreaPoint {
  rowIndex: number;
  r: number;
  alphaDeg: number;
  angleADeg: number; // 90 - alphaDeg (at vertex A)
  angleBDeg: number; // alphaDeg (at vertex B)
  angleCDeg: number; // 90 (at vertex O)

  // System A: Angular Arc System (tangency radii)
  phiADeg: number; // 180 - A = 90 + alpha
  phiBDeg: number; // 180 - B = 180 - alpha
  phiCDeg: number; // 180 - C = 90
  arcLengthA: number;
  arcLengthB: number;
  arcLengthC: number;
  circumference: number;
  arcShareA: number;
  arcShareB: number;
  arcShareC: number;

  // Coordinate-axis leg lengths (preserved explicitly for bridge to Exp 01–05)
  legOA: number; // |OA| along +Oy (opposite B, equals b)
  legOB: number; // |OB| along +Ox (opposite A, equals a)

  // System B: Linear Side System (STANDARD opposite-side geometric notation)
  a: number; // |OB|, opposite angle A
  b: number; // |OA|, opposite angle B
  c: number; // |AB|, opposite angle C = 90 deg
  perimeter: number;
  sideShareA: number; // a / P
  sideShareB: number; // b / P
  sideShareC: number; // c / P
  tangentSegA: number; // p - a = r * tan(phi_A / 2) (at vertex A, on sides b and c)
  tangentSegB: number; // p - b = r * tan(phi_B / 2) (at vertex B, on sides a and c)
  tangentSegC: number; // p - c = r (at vertex O, on sides a and b)

  // System C: Area Partition System (subtriangles opposite A, B, C)
  areaA: number; // S_a = Area(ΔIOB) = 0.5 * a * r (opposite A)
  areaB: number; // S_b = Area(ΔIOA) = 0.5 * b * r (opposite B)
  areaC: number; // S_c = Area(ΔIAB) = 0.5 * c * r (opposite C)
  totalArea: number; // S = 0.5 * a * b = p * r
  areaShareA: number; // S_a / S
  areaShareB: number; // S_b / S
  areaShareC: number; // S_c / S

  // Vertex segments (from incenter I to vertices A, B, O)
  vertexDistIA: number; // |IA| = r / sin(A/2)
  vertexDistIB: number; // |IB| = r / sin(B/2)
  vertexDistIO: number; // |IO| = r * sqrt(2)
  psiADeg: number; // angle(I->B, I->O) = 90 + A/2 (subtends side a = OB)
  psiBDeg: number; // angle(I->A, I->O) = 90 + B/2 (subtends side b = OA)
  psiCDeg: number; // angle(I->A, I->B) = 90 + C/2 = 135 (subtends side c = AB)

  // Half-angle tangent quantities
  tanHalfPhiA: number; // tan(phi_A / 2) = t_A / r
  tanHalfPhiB: number; // tan(phi_B / 2) = t_B / r
  hyperbolicTangentResidual: number; // |(tan(phiA/2) - 1)*(tan(phiB/2) - 1) - 2|

  // Cross-system residuals & invariants
  sideAreaShareMaxDiff: number;      // max_k |sideShare_k - areaShare_k|
  sineBridgeMaxDiff: number;         // max_k |areaShare_k - sin(phi_K)/(sum sin(phi))|
  pythagoreanAreaResidual: number;   // |S_a^2 + S_b^2 - S_c^2|
  areaDefectVsRSquaredDiff: number;  // |(S_a + S_b - S_c) - r^2|
  normalizedDefectResidual: number;  // |(w_a + w_b - w_c) - 2*w_a*w_b|
  rSquaredOverS: number;             // r^2 / S = r / p
  allThreeArcEqualAreaShares: boolean; // false for all alpha in (0, 90)
}

export interface Experiment06ScaleInvarianceReport {
  referenceRadius: number;
  comparedRadii: number[];
  maxArcShareDiff: number;
  maxSideShareDiff: number;
  maxAreaShareDiff: number;
  maxRSquaredOverSDiff: number;
  maxLinearScaleRelErr: number;
  maxAreaScaleRelErr: number;
  allNormalizedRatiosInvariant: boolean;
  allScalingsExact: boolean;
}

export interface CrossSystemCoincidenceResult {
  // Same-index acute crossings (unique to standard opposite-side notation!)
  alphaArcAEqualsAreaADeg: number;
  alphaArcBEqualsAreaBDeg: number;
  // Cross-index crossings with C/c
  alphaArcBEqualsAreaCDeg: number;
  alphaArcAEqualsAreaCDeg: number;
  // Cross-index crossings with C = 25% (exact 3-4-5 and 4-3-5!)
  alphaArcCEqualsAreaBDeg: number;
  alphaArcCEqualsAreaADeg: number;
}

export interface ReconstructedModelFromArcShares {
  arcShareA: number;
  arcShareB: number;
  arcShareC: number;
  phiADeg: number;
  phiBDeg: number;
  phiCDeg: number;
  angleADeg: number;
  angleBDeg: number;
  angleCDeg: number;
  sideShareA: number;
  sideShareB: number;
  sideShareC: number;
  areaShareA: number;
  areaShareB: number;
  areaShareC: number;
  ratioAToC: number;
  ratioBToC: number;
  ratioAToB: number;
  rSquaredOverS: number;
}

/**
 * Evaluates all three distribution systems (Angular Arcs, Linear Sides, Subtriangle Areas)
 * using STANDARD opposite-side Euclidean notation (a opposite A, b opposite B, c opposite C).
 */
export function computeArcSideAreaPoint(
  r: number,
  alphaDeg: number,
  rowIndex = 1
): ArcSideAreaPoint {
  const validR = assertPositiveFinite(r, 'inradius r');
  if (
    typeof alphaDeg !== 'number' ||
    !Number.isFinite(alphaDeg) ||
    alphaDeg <= BOUNDARY_TOL ||
    alphaDeg >= 90 - BOUNDARY_TOL
  ) {
    throw new RangeError(`Expected interior alphaDeg in (0, 90), got ${String(alphaDeg)}`);
  }

  const exp05 = computeIncircleArcDistribution(validR, alphaDeg, rowIndex);
  const { angleADeg, angleBDeg, angleCDeg, phiADeg, phiBDeg, phiCDeg } = exp05;

  // Explicit bridge from Experiment 05 coordinate legs:
  // exp05.a = |OA| (opposite B) -> standard b
  // exp05.b = |OB| (opposite A) -> standard a
  const legOA = exp05.a;
  const legOB = exp05.b;
  const a = legOB;
  const b = legOA;
  const c = exp05.c;

  const perimeter = a + b + c;
  const semiperimeter = perimeter / 2;
  const sideShareA = a / perimeter;
  const sideShareB = b / perimeter;
  const sideShareC = c / perimeter;

  const tangentSegA = semiperimeter - a;
  const tangentSegB = semiperimeter - b;
  const tangentSegC = validR;

  const areaA = 0.5 * a * validR; // ΔIOB (opposite A)
  const areaB = 0.5 * b * validR; // ΔIOA (opposite B)
  const areaC = 0.5 * c * validR; // ΔIAB (opposite C)
  const totalArea = areaA + areaB + areaC;

  const areaShareA = areaA / totalArea;
  const areaShareB = areaB / totalArea;
  const areaShareC = areaC / totalArea;

  // Vertex segments |IA|, |IB|, |IO| and bisector sector angles psi
  const vertexDistIA = Math.hypot(validR, legOA - validR);
  const vertexDistIB = Math.hypot(legOB - validR, validR);
  const vertexDistIO = validR * Math.SQRT2;
  const psiADeg = 90 + angleADeg / 2;
  const psiBDeg = 90 + angleBDeg / 2;
  const psiCDeg = 90 + angleCDeg / 2; // 135 deg

  // Half-angle tangents tan(phi_A / 2) and tan(phi_B / 2)
  const tanHalfPhiA = Math.tan((phiADeg * DEG2RAD) / 2);
  const tanHalfPhiB = Math.tan((phiBDeg * DEG2RAD) / 2);
  const hyperbolicTangentResidual = Math.abs((tanHalfPhiA - 1) * (tanHalfPhiB - 1) - 2);

  // Direct Law-of-Sines arc-to-area bridge (same-index!): sin(phi_K) / sum(sin(phi))
  const sinPhiA = Math.sin(phiADeg * DEG2RAD);
  const sinPhiB = Math.sin(phiBDeg * DEG2RAD);
  const sinPhiC = Math.sin(phiCDeg * DEG2RAD);
  const sinSum = sinPhiA + sinPhiB + sinPhiC;

  const bridgeShareA = sinPhiA / sinSum;
  const bridgeShareB = sinPhiB / sinSum;
  const bridgeShareC = sinPhiC / sinSum;

  const sideAreaShareMaxDiff = Math.max(
    Math.abs(sideShareA - areaShareA),
    Math.abs(sideShareB - areaShareB),
    Math.abs(sideShareC - areaShareC)
  );
  const sineBridgeMaxDiff = Math.max(
    Math.abs(areaShareA - bridgeShareA),
    Math.abs(areaShareB - bridgeShareB),
    Math.abs(areaShareC - bridgeShareC)
  );

  const pythagoreanAreaResidual = Math.abs(areaA * areaA + areaB * areaB - areaC * areaC);
  const areaDefectVsRSquaredDiff = Math.abs(areaA + areaB - areaC - validR * validR);
  const normalizedDefectResidual = Math.abs(
    areaShareA + areaShareB - areaShareC - 2 * areaShareA * areaShareB
  );
  const rSquaredOverS = (validR * validR) / totalArea;

  const allThreeArcEqualAreaShares =
    Math.abs(exp05.shareA - areaShareA) < 1e-9 &&
    Math.abs(exp05.shareB - areaShareB) < 1e-9 &&
    Math.abs(exp05.shareC - areaShareC) < 1e-9;

  return {
    rowIndex,
    r: validR,
    alphaDeg,
    angleADeg,
    angleBDeg,
    angleCDeg,
    phiADeg,
    phiBDeg,
    phiCDeg,
    arcLengthA: exp05.lengthA,
    arcLengthB: exp05.lengthB,
    arcLengthC: exp05.lengthC,
    circumference: exp05.totalCircumference,
    arcShareA: exp05.shareA,
    arcShareB: exp05.shareB,
    arcShareC: exp05.shareC,
    legOA,
    legOB,
    a,
    b,
    c,
    perimeter,
    sideShareA,
    sideShareB,
    sideShareC,
    tangentSegA,
    tangentSegB,
    tangentSegC,
    areaA,
    areaB,
    areaC,
    totalArea,
    areaShareA,
    areaShareB,
    areaShareC,
    vertexDistIA,
    vertexDistIB,
    vertexDistIO,
    psiADeg,
    psiBDeg,
    psiCDeg,
    tanHalfPhiA,
    tanHalfPhiB,
    hyperbolicTangentResidual,
    sideAreaShareMaxDiff,
    sineBridgeMaxDiff,
    pythagoreanAreaResidual,
    areaDefectVsRSquaredDiff,
    normalizedDefectResidual,
    rSquaredOverS,
    allThreeArcEqualAreaShares,
  };
}

/**
 * Computes Experiment 06 point from coordinate legs (legOA along +Oy, legOB along +Ox).
 */
export function computeArcSideAreaFromLegs(legOA: number, legOB: number): ArcSideAreaPoint {
  const validOA = assertPositiveFinite(legOA, 'legOA');
  const validOB = assertPositiveFinite(legOB, 'legOB');
  const c = Math.hypot(validOA, validOB);
  const r = (validOA / (validOA + validOB + c)) * validOB;
  const alphaDeg = Math.atan2(validOA, validOB) * RAD2DEG;
  return computeArcSideAreaPoint(r, alphaDeg, 1);
}

/**
 * Computes Experiment 06 point from standard opposite sides (a opposite A, b opposite B).
 */
export function computeArcSideAreaFromOppositeSides(a: number, b: number): ArcSideAreaPoint {
  return computeArcSideAreaFromLegs(b, a);
}

/**
 * Unified forward reconstruction model:
 * Given ONLY the normalized angular arc distribution (w^arc_A, w^arc_B, w^arc_C) of a
 * non-degenerate triangle (with w^arc_K in (0, 0.5) and sum = 1), analytically recovers
 * all interior angles and all normalized linear/area ratios without any side measurements.
 */
export function reconstructNormalizedModelFromArcShares(
  arcShareA: number,
  arcShareB: number,
  arcShareC: number
): ReconstructedModelFromArcShares {
  for (const [name, v] of [
    ['arcShareA', arcShareA],
    ['arcShareB', arcShareB],
    ['arcShareC', arcShareC],
  ] as const) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0 || v >= 0.5) {
      throw new RangeError(`Expected ${name} in (0, 0.5), got ${String(v)}`);
    }
  }
  const sum = arcShareA + arcShareB + arcShareC;
  if (Math.abs(sum - 1) > 1e-9) {
    throw new RangeError(`Expected arc shares to sum to 1, got ${sum}`);
  }

  const phiARad = 2 * Math.PI * arcShareA;
  const phiBRad = 2 * Math.PI * arcShareB;
  const phiCRad = 2 * Math.PI * arcShareC;

  const phiADeg = phiARad * RAD2DEG;
  const phiBDeg = phiBRad * RAD2DEG;
  const phiCDeg = phiCRad * RAD2DEG;

  const angleADeg = 180 - phiADeg;
  const angleBDeg = 180 - phiBDeg;
  const angleCDeg = 180 - phiCDeg;

  const sA = Math.sin(phiARad);
  const sB = Math.sin(phiBRad);
  const sC = Math.sin(phiCRad);
  const sSum = sA + sB + sC;

  const sideShareA = sA / sSum;
  const sideShareB = sB / sSum;
  const sideShareC = sC / sSum;

  // For right triangles (C = 90 deg, phi_C = 90 deg), r^2 / S = cot(pi*w_A)*cot(pi*w_B).
  // In general for any triangle: r / p = 1 / (tan(phi_A/2) + tan(phi_B/2) + tan(phi_C/2)),
  // and r^2 / S = r / p = 1 / sum(cot(X/2)).
  const sumTanHalfPhi =
    Math.tan(phiARad / 2) + Math.tan(phiBRad / 2) + Math.tan(phiCRad / 2);
  const rSquaredOverS = 1 / sumTanHalfPhi;

  return {
    arcShareA,
    arcShareB,
    arcShareC,
    phiADeg,
    phiBDeg,
    phiCDeg,
    angleADeg,
    angleBDeg,
    angleCDeg,
    sideShareA,
    sideShareB,
    sideShareC,
    areaShareA: sideShareA,
    areaShareB: sideShareB,
    areaShareC: sideShareC,
    ratioAToC: sA / sC,
    ratioBToC: sB / sC,
    ratioAToB: sA / sB,
    rSquaredOverS,
  };
}

/**
 * Generates the unified 5-degree parametric grid across radii (default 1, 2, 3).
 */
export function generateExperiment06Table(
  radii: readonly number[] = EXPERIMENT06_RADII,
  stepDeg = EXPERIMENT06_STEP_DEG
): ArcSideAreaPoint[] {
  const angles = getInteriorAnglesDeg(stepDeg);
  const rows: ArcSideAreaPoint[] = [];
  let rowIndex = 1;
  for (const r of radii) {
    for (const alphaDeg of angles) {
      rows.push(computeArcSideAreaPoint(r, alphaDeg, rowIndex));
      rowIndex += 1;
    }
  }
  return rows;
}

/**
 * Solves for all 6 exact share coincidences between Systems A and C on alpha in (0, 90)
 * in standard opposite-side geometric notation.
 */
export function findCrossSystemShareCoincidences(): CrossSystemCoincidenceResult {
  const bisect = (fn: (alphaDeg: number) => number, lo: number, hi: number): number => {
    let a = lo;
    let b = hi;
    let fa = fn(a);
    for (let i = 0; i < 80; i += 1) {
      const mid = (a + b) / 2;
      const fmid = fn(mid);
      if (Math.abs(fmid) < 1e-15 || b - a < 1e-13) return mid;
      if ((fa <= 0 && fmid <= 0) || (fa >= 0 && fmid >= 0)) {
        a = mid;
        fa = fmid;
      } else {
        b = mid;
      }
    }
    return (a + b) / 2;
  };

  // 1. Same-index acute crossing: w^arc_A(alpha) == w^area_a(alpha)
  const alphaArcAEqualsAreaADeg = bisect((alpha) => {
    const pt = computeArcSideAreaPoint(1, alpha);
    return pt.arcShareA - pt.areaShareA;
  }, 1, 89);

  // 2. Cross-index hypotenuse crossing: w^arc_B(alpha) == w^area_c(alpha)
  const alphaArcBEqualsAreaCDeg = bisect((alpha) => {
    const pt = computeArcSideAreaPoint(1, alpha);
    return pt.arcShareB - pt.areaShareC;
  }, 1, 45);

  // 3. Cross-index right-angle arc crossing: w^arc_C (= 1/4) == w^area_b(alpha) -> exact (3, 4, 5)
  const alphaArcCEqualsAreaBDeg = bisect((alpha) => {
    const pt = computeArcSideAreaPoint(1, alpha);
    return pt.arcShareC - pt.areaShareB;
  }, 1, 89);

  return {
    alphaArcAEqualsAreaADeg,
    alphaArcBEqualsAreaBDeg: 90 - alphaArcAEqualsAreaADeg,
    alphaArcBEqualsAreaCDeg,
    alphaArcAEqualsAreaCDeg: 90 - alphaArcBEqualsAreaCDeg,
    alphaArcCEqualsAreaBDeg,
    alphaArcCEqualsAreaADeg: 90 - alphaArcCEqualsAreaBDeg,
  };
}

/**
 * Verifies scale invariance of all normalized ratios across radii r = 1, 2, 3
 * and homogeneity deg 1 (lengths/sides) vs deg 2 (areas).
 */
export function verifyExperiment06ScaleInvariance(
  radii: readonly number[] = EXPERIMENT06_RADII,
  stepDeg = EXPERIMENT06_STEP_DEG
): Experiment06ScaleInvarianceReport {
  if (radii.length === 0) {
    throw new RangeError('Expected at least one radius');
  }
  const refR = assertPositiveFinite(radii[0], 'reference radius');
  const angles = getInteriorAnglesDeg(stepDeg);

  let maxArcShareDiff = 0;
  let maxSideShareDiff = 0;
  let maxAreaShareDiff = 0;
  let maxRSquaredOverSDiff = 0;
  let maxLinearScaleRelErr = 0;
  let maxAreaScaleRelErr = 0;

  for (const alphaDeg of angles) {
    const base = computeArcSideAreaPoint(refR, alphaDeg, 1);
    for (let i = 1; i < radii.length; i += 1) {
      const r = assertPositiveFinite(radii[i], `radii[${i}]`);
      const k = r / refR;
      const k2 = k * k;
      const curr = computeArcSideAreaPoint(r, alphaDeg, 1);

      maxArcShareDiff = Math.max(
        maxArcShareDiff,
        Math.abs(curr.arcShareA - base.arcShareA),
        Math.abs(curr.arcShareB - base.arcShareB),
        Math.abs(curr.arcShareC - base.arcShareC)
      );
      maxSideShareDiff = Math.max(
        maxSideShareDiff,
        Math.abs(curr.sideShareA - base.sideShareA),
        Math.abs(curr.sideShareB - base.sideShareB),
        Math.abs(curr.sideShareC - base.sideShareC)
      );
      maxAreaShareDiff = Math.max(
        maxAreaShareDiff,
        Math.abs(curr.areaShareA - base.areaShareA),
        Math.abs(curr.areaShareB - base.areaShareB),
        Math.abs(curr.areaShareC - base.areaShareC)
      );
      maxRSquaredOverSDiff = Math.max(
        maxRSquaredOverSDiff,
        Math.abs(curr.rSquaredOverS - base.rSquaredOverS)
      );

      maxLinearScaleRelErr = Math.max(
        maxLinearScaleRelErr,
        Math.abs(curr.a - k * base.a) / curr.a,
        Math.abs(curr.b - k * base.b) / curr.b,
        Math.abs(curr.c - k * base.c) / curr.c,
        Math.abs(curr.arcLengthA - k * base.arcLengthA) / curr.arcLengthA,
        Math.abs(curr.vertexDistIA - k * base.vertexDistIA) / curr.vertexDistIA
      );

      maxAreaScaleRelErr = Math.max(
        maxAreaScaleRelErr,
        Math.abs(curr.areaA - k2 * base.areaA) / curr.areaA,
        Math.abs(curr.areaB - k2 * base.areaB) / curr.areaB,
        Math.abs(curr.areaC - k2 * base.areaC) / curr.areaC,
        Math.abs(curr.totalArea - k2 * base.totalArea) / curr.totalArea
      );
    }
  }

  return {
    referenceRadius: refR,
    comparedRadii: [...radii],
    maxArcShareDiff,
    maxSideShareDiff,
    maxAreaShareDiff,
    maxRSquaredOverSDiff,
    maxLinearScaleRelErr,
    maxAreaScaleRelErr,
    allNormalizedRatiosInvariant:
      maxArcShareDiff < 1e-13 &&
      maxSideShareDiff < 1e-13 &&
      maxAreaShareDiff < 1e-13 &&
      maxRSquaredOverSDiff < 1e-13,
    allScalingsExact: maxLinearScaleRelErr < 1e-12 && maxAreaScaleRelErr < 1e-12,
  };
}

export interface Experiment06ChartSuiteSvg {
  chart1ThreeSystemsShares: string;
  chart2BridgeDefect: string;
  chart3AreasAndTangents: string;
  chart4RadiiVsBisectors: string;
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
 * Generates 4 SVG charts for Experiment 06 documentation in standard opposite-side notation.
 */
export function generateExperiment06SvgCharts(): Experiment06ChartSuiteSvg {
  const W = 680;
  const H = 360;
  const PAD = { l: 58, r: 28, t: 62, b: 46 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const xOfAlpha = (deg: number) => PAD.l + (deg / 90) * plotW;

  const fineDegs: number[] = [];
  for (let d = 1; d <= 89; d += 1) {
    fineDegs.push(d);
  }
  const finePts = fineDegs.map((d) => computeArcSideAreaPoint(1, d));
  const crossings = findCrossSystemShareCoincidences();
  const ptAA = computeArcSideAreaPoint(1, crossings.alphaArcAEqualsAreaADeg);
  const ptBB = computeArcSideAreaPoint(1, crossings.alphaArcBEqualsAreaBDeg);
  const ptCB = computeArcSideAreaPoint(1, crossings.alphaArcCEqualsAreaBDeg);

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

  // Chart 1: Three-system normalized shares (%): System A (dashed) vs System B/C (solid)
  const yOfPct = (pct: number) => PAD.t + plotH - (pct / 55) * plotH;
  const makePctPath = (pick: (p: ArcSideAreaPoint) => number) =>
    finePts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfPct(pick(p) * 100).toFixed(1)}`)
      .join(' ');

  const chart1ThreeSystemsShares = buildSvgFrame(
    'График 1. Доли дуг (Система A) и сторон/площадей (Системы B, C) в стандартной нотации',
    'Сплошные: w_area ≡ w_side (a против A, b против B); штрих: w_arc. Отмечены точки совпадения долей',
    'Острый угол B = α (град)',
    'Нормализованная доля (%)',
    `${buildAxes([0, 10, 25, 34.5, 41.4, 50], 55, (v) => `${v}%`)}
    <path d="${makePctPath((p) => p.areaShareA)}" fill="none" stroke="#2563eb" stroke-width="2.4" />
    <path d="${makePctPath((p) => p.areaShareB)}" fill="none" stroke="#059669" stroke-width="2.4" />
    <path d="${makePctPath((p) => p.areaShareC)}" fill="none" stroke="#d97706" stroke-width="2.6" />
    <path d="${makePctPath((p) => p.arcShareA)}" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 3" />
    <path d="${makePctPath((p) => p.arcShareB)}" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="5 3" />
    <path d="${makePctPath((p) => p.arcShareC)}" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="5 3" />
    <circle cx="${xOfAlpha(ptAA.alphaDeg).toFixed(1)}" cy="${yOfPct(ptAA.areaShareA * 100).toFixed(1)}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="${xOfAlpha(ptBB.alphaDeg).toFixed(1)}" cy="${yOfPct(ptBB.areaShareB * 100).toFixed(1)}" r="4.5" fill="#059669" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="${xOfAlpha(ptCB.alphaDeg).toFixed(1)}" cy="${yOfPct(25).toFixed(1)}" r="4.5" fill="#d97706" stroke="#ffffff" stroke-width="1.5" />
    <rect x="${W - 282}" y="64" width="246" height="58" fill="#ffffff" stroke="#cbd5e1" rx="4" opacity="0.95" />
    <text x="${W - 272}" y="80" font-size="10" font-weight="600" fill="#0f172a">Сплошные: w_area ≡ w_side (a=OB, b=OA, c=AB)</text>
    <text x="${W - 272}" y="96" font-size="10" font-weight="600" fill="#0f172a">Штрих: w_arc (w_A=w_a @34.4°, w_B=w_b @55.6°)</text>
    <text x="${W - 272}" y="112" font-size="9.5" fill="#475569">Точка (3,4,5) @36.87°: w_arc_C = w_area_b = 25%</text>`,
    W,
    H
  );

  // Chart 2: Defect Law (w_a + w_b - w_c = r^2 / S = 2 w_a w_b)
  const yOfDef = (v: number) => PAD.t + plotH - (v / 0.25) * plotH;
  const pathDefect = finePts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfDef(p.rSquaredOverS).toFixed(1)}`)
    .join(' ');
  const p45 = computeArcSideAreaPoint(1, 45);
  const maxDefect = 3 - 2 * Math.SQRT2;

  const chart2BridgeDefect = buildSvgFrame(
    'График 2. Безразмерный инвариант связи r² / S = w_a + w_b − w_c = 2·w_a·w_b',
    'Максимум достигается в симметрии α = 45°: r²/S = 3 − 2√2 ≈ 0.1716 (17.16% площади занимает квадрат r²)',
    'Острый угол B = α (град)',
    'Отношение r² / S = r / p',
    `${buildAxes([0, 0.05, 0.1, 0.1716, 0.25], 0.25, (v) => v.toFixed(2))}
    <path d="${pathDefect}" fill="none" stroke="#7c3aed" stroke-width="2.5" />
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfDef(p45.rSquaredOverS).toFixed(1)}" r="5" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <text x="${xOfAlpha(45).toFixed(1)}" y="${(yOfDef(maxDefect) - 10).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f172a">max = 3 − 2√2 ≈ 0.1716 при α = 45°</text>`,
    W,
    H
  );

  // Chart 3: Subtriangle areas (r = 1) vs alpha (capped at 10)
  const maxAreaPlot = 10.0;
  const yOfArea = (v: number) => PAD.t + plotH - (Math.min(maxAreaPlot, v) / maxAreaPlot) * plotH;
  const makeAreaPath = (pick: (p: ArcSideAreaPoint) => number) =>
    finePts
      .filter((p) => p.alphaDeg >= 10 && p.alphaDeg <= 80)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfArea(pick(p)).toFixed(1)}`)
      .join(' ');

  const chart3AreasAndTangents = buildSvgFrame(
    'График 3. Площади трёх малых треугольников S_a, S_b, S_c (при r = 1, α ∈ [10°, 80°])',
    'S_a = ½ar (против A), S_b = ½br (против B), S_c = ½cr; везде S_a² + S_b² = S_c² и S_a + S_b − S_c = 1',
    'Острый угол B = α (град)',
    'Площадь малого треугольника (ед.²)',
    `${buildAxes([0, 2, 4, 6, 8, 10], maxAreaPlot, (v) => v.toFixed(0))}
    <path d="${makeAreaPath((p) => p.areaA)}" fill="none" stroke="#2563eb" stroke-width="2.3" />
    <path d="${makeAreaPath((p) => p.areaB)}" fill="none" stroke="#059669" stroke-width="2.3" />
    <path d="${makeAreaPath((p) => p.areaC)}" fill="none" stroke="#d97706" stroke-width="2.5" />
    <circle cx="${xOfAlpha(45).toFixed(1)}" cy="${yOfArea(p45.areaC).toFixed(1)}" r="4.5" fill="#d97706" stroke="#ffffff" stroke-width="1.4" />
    <text x="${xOfAlpha(45).toFixed(1)}" y="${(yOfArea(p45.areaC) - 10).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="#92400e">min S_c = 1 + √2 ≈ 2.4142</text>`,
    W,
    H
  );

  // Chart 4: Tangency Radii Angles (phi_k) vs Vertex Segment Angles (psi_k)
  const yOfDeg = (deg: number) => PAD.t + plotH - (deg / 180) * plotH;
  const makeDegPath = (pick: (p: ArcSideAreaPoint) => number) =>
    finePts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfDeg(pick(p)).toFixed(1)}`)
      .join(' ');

  const chart4RadiiVsBisectors = buildSvgFrame(
    'График 4. Сравнение углов радиусов касания (φ) и углов отрезков к вершинам (ψ)',
    'Сплошные: φ_A, φ_B, φ_C (дуги); штрих: ψ_A, ψ_B, ψ_C = 135° (биссектрисы IA, IB, IO)',
    'Острый угол B = α (град)',
    'Центральный угол вокруг инцентра I (град)',
    `${buildAxes([0, 45, 90, 135, 180], 180, (v) => `${v}°`)}
    <path d="${makeDegPath((p) => p.phiADeg)}" fill="none" stroke="#2563eb" stroke-width="2.3" />
    <path d="${makeDegPath((p) => p.phiBDeg)}" fill="none" stroke="#059669" stroke-width="2.3" />
    <path d="${makeDegPath((p) => p.phiCDeg)}" fill="none" stroke="#d97706" stroke-width="2.3" />
    <path d="${makeDegPath((p) => p.psiADeg)}" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 3" />
    <path d="${makeDegPath((p) => p.psiBDeg)}" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="5 3" />
    <path d="${makeDegPath((p) => p.psiCDeg)}" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="5 3" />
    <text x="${xOfAlpha(72).toFixed(1)}" y="${(yOfDeg(135) - 6).toFixed(1)}" font-size="10" font-weight="600" fill="#b45309">ψ_C = ∠AIB ≡ 135°</text>
    <text x="${xOfAlpha(72).toFixed(1)}" y="${(yOfDeg(90) - 6).toFixed(1)}" font-size="10" font-weight="600" fill="#b45309">φ_C ≡ 90°</text>`,
    W,
    H
  );

  return {
    chart1ThreeSystemsShares,
    chart2BridgeDefect,
    chart3AreasAndTangents,
    chart4RadiiVsBisectors,
  };
}
