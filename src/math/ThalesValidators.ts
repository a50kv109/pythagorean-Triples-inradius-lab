/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  FourCirclesCalculations,
  InvariantValidation,
  Point2D,
} from '../types/geometry.ts';
import { validateFourCirclesInvariants } from './FourCirclesValidators.ts';

const DEFAULT_TOLERANCE = 1e-9;

function dist(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Validates all 9 geometric and analytical invariants of the fifth circle —
 * Thales Circumcircle (K_o) — using the project's scale-normalized tolerance convention.
 */
export function validateThalesCircumcircleInvariants(
  calc: FourCirclesCalculations,
  tol = DEFAULT_TOLERANCE
): InvariantValidation[] {
  const { triangle, circleC, circumcircle } = calc;
  const { c } = triangle;
  const hasValidScale =
    Number.isFinite(c) &&
    c > 0 &&
    Number.isFinite(circumcircle.radius) &&
    circumcircle.radius > 0 &&
    Number.isFinite(circumcircle.diameter) &&
    circumcircle.diameter > 0;

  // 1. D_o = c
  const deltaDiameter = hasValidScale
    ? Math.abs(circumcircle.diameter - c) / c
    : NaN;

  // 2. R_o = c / 2
  const expectedRadius = c / 2;
  const deltaRadius = hasValidScale
    ? Math.abs(circumcircle.radius - expectedRadius) / c
    : NaN;

  // 3. K_o = pi * c^2 / 4
  const expectedArea = (Math.PI * c * c) / 4;
  const areaFinite =
    hasValidScale &&
    Number.isFinite(circumcircle.area) &&
    circumcircle.area > 0 &&
    Number.isFinite(expectedArea) &&
    expectedArea > 0;
  const deltaArea = areaFinite
    ? Math.abs(circumcircle.area - expectedArea) / expectedArea
    : NaN;

  // 4. L_o = pi * c
  const expectedCircumference = Math.PI * c;
  const circumFinite =
    hasValidScale &&
    Number.isFinite(circumcircle.circumference) &&
    circumcircle.circumference > 0 &&
    Number.isFinite(expectedCircumference) &&
    expectedCircumference > 0;
  const deltaCircumference = circumFinite
    ? Math.abs(circumcircle.circumference - expectedCircumference) / expectedCircumference
    : NaN;

  // 5. |O_o - A| = R_o
  const dA = dist(circumcircle.center, triangle.A);
  const deltaDistA = hasValidScale ? Math.abs(dA - circumcircle.radius) / circumcircle.radius : NaN;

  // 6. |O_o - B| = R_o
  const dB = dist(circumcircle.center, triangle.B);
  const deltaDistB = hasValidScale ? Math.abs(dB - circumcircle.radius) / circumcircle.radius : NaN;

  // 7. |O_o - O| = R_o (O is the right-angle vertex C of the inscribed triangle)
  const dO = dist(circumcircle.center, triangle.O);
  const deltaDistO = hasValidScale ? Math.abs(dO - circumcircle.radius) / circumcircle.radius : NaN;

  // 8. K_o = K_c (equal area while preserving distinct centers)
  const distinctCenters = dist(circumcircle.center, circleC.center) > 0;
  const deltaEqKc =
    areaFinite && Number.isFinite(circleC.area) && circleC.area > 0 && distinctCenters
      ? Math.abs(circumcircle.area - circleC.area) / circleC.area
      : NaN;

  // 9. Right angle opposite diameter AB: angle AOB = 90 deg (dot product (A-O).(B-O) = 0)
  const vOAx = triangle.A.x - triangle.O.x;
  const vOAy = triangle.A.y - triangle.O.y;
  const vOBx = triangle.B.x - triangle.O.x;
  const vOBy = triangle.B.y - triangle.O.y;
  const normOA = Math.hypot(vOAx, vOAy);
  const normOB = Math.hypot(vOBx, vOBy);
  const deltaRightAngle =
    hasValidScale && normOA > 0 && normOB > 0
      ? Math.max(
          Math.abs(vOAx * vOBx + vOAy * vOBy) / (normOA * normOB),
          Math.abs(circumcircle.angleAtRightVertexDeg - 90) / 90
        )
      : NaN;

  return [
    {
      id: 'thales_diameter',
      name: 'Диаметр K_o равен гипотенузе (D_o = c)',
      formula: 'D_o = |AB| = c = \\sqrt{a^2 + b^2}',
      description: 'По теореме Фалеса диаметр описанной окружности прямоугольного треугольника равен гипотенузе.',
      calculatedValue: hasValidScale ? `D_o = ${circumcircle.diameter.toPrecision(6)}` : 'Invalid',
      expectedValue: `c = ${c.toPrecision(6)}`,
      delta: deltaDiameter,
      isValid: Number.isFinite(deltaDiameter) && deltaDiameter < tol,
      tolerance: tol,
    },
    {
      id: 'thales_radius',
      name: 'Радиус K_o равен половине гипотенузы (R_o = c/2)',
      formula: 'R_o = \\frac{D_o}{2} = \\frac{c}{2}',
      description: 'Радиус описанной окружности составляет ровно половину длины гипотенузы.',
      calculatedValue: hasValidScale ? `R_o = ${circumcircle.radius.toPrecision(6)}` : 'Invalid',
      expectedValue: `c/2 = ${expectedRadius.toPrecision(6)}`,
      delta: deltaRadius,
      isValid: Number.isFinite(deltaRadius) && deltaRadius < tol,
      tolerance: tol,
    },
    {
      id: 'thales_area',
      name: 'Площадь описанной окружности (K_o = πc²/4)',
      formula: 'K_o = \\pi R_o^2 = \\frac{\\pi c^2}{4}',
      description: 'Площадь круга K_o согласована с его радиусом R_o = c/2.',
      calculatedValue: areaFinite ? `K_o = ${circumcircle.area.toPrecision(6)}` : 'Overflow',
      expectedValue: areaFinite ? `πc²/4 = ${expectedArea.toPrecision(6)}` : 'Overflow',
      delta: deltaArea,
      isValid: Number.isFinite(deltaArea) && deltaArea < tol,
      tolerance: tol,
    },
    {
      id: 'thales_circumference',
      name: 'Длина описанной окружности (L_o = πc)',
      formula: 'L_o = 2\\pi R_o = \\pi c',
      description: 'Длина окружности K_o пропорциональна гипотенузе с коэффициентом π.',
      calculatedValue: circumFinite ? `L_o = ${circumcircle.circumference.toPrecision(6)}` : 'Overflow',
      expectedValue: circumFinite ? `πc = ${expectedCircumference.toPrecision(6)}` : 'Overflow',
      delta: deltaCircumference,
      isValid: Number.isFinite(deltaCircumference) && deltaCircumference < tol,
      tolerance: tol,
    },
    {
      id: 'thales_dist_A',
      name: 'Принадлежность вершины A окружности K_o',
      formula: '|O_o - A| = R_o',
      description: 'Расстояние от середины гипотенузы O_o до вершины A равно радиусу R_o.',
      calculatedValue: `|O_o-A| = ${dA.toPrecision(6)}`,
      expectedValue: `R_o = ${circumcircle.radius.toPrecision(6)}`,
      delta: deltaDistA,
      isValid: Number.isFinite(deltaDistA) && deltaDistA < tol,
      tolerance: tol,
    },
    {
      id: 'thales_dist_B',
      name: 'Принадлежность вершины B окружности K_o',
      formula: '|O_o - B| = R_o',
      description: 'Расстояние от середины гипотенузы O_o до вершины B равно радиусу R_o.',
      calculatedValue: `|O_o-B| = ${dB.toPrecision(6)}`,
      expectedValue: `R_o = ${circumcircle.radius.toPrecision(6)}`,
      delta: deltaDistB,
      isValid: Number.isFinite(deltaDistB) && deltaDistB < tol,
      tolerance: tol,
    },
    {
      id: 'thales_dist_C',
      name: 'Принадлежность вершины прямого угла окружности K_o',
      formula: '|O_o - C| = R_o \\quad (C = O)',
      description: 'Вершина прямого угла лежит непосредственно на окружности K_o (медиана к гипотенузе равна c/2).',
      calculatedValue: `|O_o-O| = ${dO.toPrecision(6)}`,
      expectedValue: `R_o = ${circumcircle.radius.toPrecision(6)}`,
      delta: deltaDistO,
      isValid: Number.isFinite(deltaDistO) && deltaDistO < tol,
      tolerance: tol,
    },
    {
      id: 'thales_area_eq_Kc',
      name: 'Равенство площадей K_o = K_c при разных центрах',
      formula: 'K_o = K_c = \\frac{\\pi c^2}{4}, \\quad O_o \\neq O_c',
      description: 'Окружность в квадрате на гипотенузе и описанная окружность имеют равные площади и разные центры.',
      calculatedValue: areaFinite ? `K_o = ${circumcircle.area.toPrecision(6)}` : 'Overflow',
      expectedValue: areaFinite ? `K_c = ${circleC.area.toPrecision(6)}` : 'Overflow',
      delta: deltaEqKc,
      isValid: Number.isFinite(deltaEqKc) && deltaEqKc < tol,
      tolerance: tol,
    },
    {
      id: 'thales_right_angle',
      name: 'Прямой угол напротив диаметра (∠AOB = 90°)',
      formula: '\\angle ACB = 90^\\circ \\iff \\overrightarrow{OA} \\cdot \\overrightarrow{OB} = 0',
      description: 'Угол, опирающийся на диаметр AB окружности K_o, остаётся равным 90° при любых катетах.',
      calculatedValue: `${circumcircle.angleAtRightVertexDeg.toFixed(6)}°`,
      expectedValue: '90.000000°',
      delta: deltaRightAngle,
      isValid: Number.isFinite(deltaRightAngle) && deltaRightAngle < tol,
      tolerance: tol,
    },
  ];
}

/**
 * Combined validation of all 8 core Four-Circle invariants + 9 Thales Circumcircle invariants (17 total).
 */
export function validateAllFiveCirclesInvariants(
  calc: FourCirclesCalculations,
  tol = DEFAULT_TOLERANCE
): InvariantValidation[] {
  return [
    ...validateFourCirclesInvariants(calc, tol),
    ...validateThalesCircumcircleInvariants(calc, tol),
  ];
}
