/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { PresetConfiguration } from '../types/geometry.ts';

export const FOUR_CIRCLES_PRESETS: PresetConfiguration[] = [
  {
    id: 'classic_3_4_5',
    title: 'a = 4, b = 3, c = 5 (Египетский, r = 1)',
    shortLabel: '(3, 4, 5)',
    description: 'Классический египетский треугольник: целые стороны и целочисленный вписанный радиус r = 1.',
    a: 4,
    b: 3,
    category: 'classical',
  },
  {
    id: 'classic_5_12_13',
    title: 'a = 5, b = 12, c = 13 (Тройка 5-12-13, r = 2)',
    shortLabel: '(5, 12, 13)',
    description: 'Пифагорова тройка с целым радиусом вписанной окружности r = (5 + 12 - 13)/2 = 2.',
    a: 5,
    b: 12,
    category: 'classical',
  },
  {
    id: 'sym_4_4',
    title: 'a = 4, b = 4, c = 4√2 (Равнобедренный)',
    shortLabel: '(4, 4, 4√2)',
    description: 'Симметричный прямоугольный треугольник: K_a = K_b, r = 4 - 2√2 ≈ 1.1716.',
    a: 4,
    b: 4,
    category: 'symmetry',
  },
  {
    id: 'extreme_1_10',
    title: 'a = 1, b = 10, c = √101 (Вытянутый)',
    shortLabel: '(1, 10, √101)',
    description: 'Сильно вытянутый треугольник (b/a = 10): маленький вписанный круг K_i (r ≈ 0.475).',
    a: 1,
    b: 10,
    category: 'extreme',
  },
  {
    id: 'extreme_10_1',
    title: 'a = 10, b = 1, c = √101 (Зеркальный)',
    shortLabel: '(10, 1, √101)',
    description: 'Зеркальное вытягивание вдоль вертикального катета: K_a и K_b меняются местами, K_i и K_c неизменны.',
    a: 10,
    b: 1,
    category: 'extreme',
  },
  {
    id: 'classic_8_15_17',
    title: 'a = 8, b = 15, c = 17 (Тройка 8-15-17, r = 3)',
    shortLabel: '(8, 15, 17)',
    description: 'Ещё одна примитивная пифагорова тройка с целым радиусом вписанной окружности r = 3.',
    a: 8,
    b: 15,
    category: 'benchmark',
  },
];
