/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import {
  AtlasPerRadiusRow,
  CheckSpecItem,
  ClassificationSectionId,
  DocumentedTripleExample,
  GeometricPreviewSample,
  MatrixCategoryId,
  ModuleReadinessItem,
  OpenQuestionItem,
  RadiusPresetItem,
} from '../../types/classification.ts';

export const WORKSPACE_SECTION_ORDER: ClassificationSectionId[] = [
  'class_atlas',
  'class_inspector',
  'triple_matrix',
  'hyperbola_divisors',
  'geometric_inspector',
  'structural_analysis',
  'verification_export',
];

export const REFERENCE_RADII_PRESETS: RadiusPresetItem[] = [
  { r: 1, note: 'Граничный случай (3, 4, 5), N=1, T=1' },
  { r: 2, note: 'Минимальный чётный вписанный радиус, r = 2¹' },
  { r: 3, note: 'Эталонный класс C(3), N=3, T=2' },
  { r: 6, note: 'Первое нарушение c_min < 5r: (20, 21, 29)' },
  { r: 15, note: 'Первый класс с T(r) = 4, r = 3·5' },
  { r: 30, note: 'Верхняя граница Таблицы A (174 тройки)' },
  { r: 35, note: 'Эталон Janicková–Csókási (4 ППТ)' },
  { r: 100, note: 'Верхняя граница Таблицы B (855 троек)' },
];

/**
 * Documented formula-derived reference values for r = 1..6 from BENCHMARK_DATA_CATALOG.md §3 (Table 3.2 of 39-page PDF).
 * Stored strictly as static reference data awaiting live M2/M3/M6 computation.
 */
export const PER_RADIUS_REFERENCE_R1_R6: AtlasPerRadiusRow[] = [
  { r: 1, D: 2, N: 1, T: 1, scaledCount: 0, note: 'Единственный класс из 1 тройки: (3, 4, 5)' },
  { r: 2, D: 4, N: 2, T: 1, scaledCount: 1, note: '1 ППТ (5, 12, 13) + 1 масшт. (6, 8, 10)' },
  { r: 3, D: 6, N: 3, T: 2, scaledCount: 1, note: 'Эталон C(3): (7, 24, 25), (8, 15, 17), (9, 12, 15)' },
  { r: 4, D: 8, N: 3, T: 1, scaledCount: 2, note: 'Степень двойки r = 2²: ровно 1 ППТ (9, 40, 41)' },
  { r: 5, D: 10, N: 3, T: 2, scaledCount: 1, note: 'Последний класс с c_min = 5r до r = 6' },
  { r: 6, D: 12, N: 6, T: 2, scaledCount: 4, note: 'Первое c_min < 5r: (20, 21, 29), 29 < 30' },
];

/**
 * Documented reference triples for selected sample classes from BENCHMARK_DATA_CATALOG.md.
 * Used exclusively as static documented examples, never as live generated output.
 */
export const DOCUMENTED_CLASS_EXAMPLES: Record<number, DocumentedTripleExample[]> = {
  1: [
    { tripleId: 'PT-R1-K1-X1', a: 3, b: 4, c: 5, k: 1, x: 1, y: 2, isPrimitive: true },
  ],
  3: [
    { tripleId: 'PT-R3-K1-X1', a: 7, b: 24, c: 25, k: 1, x: 1, y: 18, isPrimitive: true },
    { tripleId: 'PT-R3-K1-X2', a: 8, b: 15, c: 17, k: 1, x: 2, y: 9, isPrimitive: true },
    { tripleId: 'PT-R3-K3-X3', a: 9, b: 12, c: 15, k: 3, x: 3, y: 6, isPrimitive: false },
  ],
};

export const MODULE_READINESS_SPEC: ModuleReadinessItem[] = [
  { id: 'M1', name: 'Точная арифметика (BigInt / Rational)', scope: 'Ядро вычислений', status: 'not_implemented' },
  { id: 'M2', name: 'Факторизация r и 2r² + сертификация', scope: 'Теория чисел', status: 'not_implemented' },
  { id: 'M3', name: 'Двойная генерация C(r) и слоёв Cₖ(r)', scope: 'Классификатор', status: 'not_implemented' },
  { id: 'M4', name: 'Фасеты Спорна, Берггрена, Прайса', scope: 'Структурный анализ', status: 'under_development' },
  { id: 'M5', name: 'Построитель паспортов и матриц v0.1', scope: 'Данные', status: 'not_implemented' },
  { id: 'M6', name: 'Независимый верификатор CHK-01…12', scope: 'Верификация', status: 'not_implemented' },
  { id: 'M7', name: 'Адаптер 2D SVG-проекции (float64)', scope: 'Визуализация', status: 'under_development' },
  { id: 'M8', name: 'Экспорт JSON / CSV / отчётов', scope: 'Экспорт', status: 'not_implemented' },
];

export const OPEN_QUESTIONS_SPEC: OpenQuestionItem[] = [
  { id: 'OQ-01', title: 'Ориентация катетов a < b на осях чертежа', status: 'Открыт (не утверждено)' },
  { id: 'OQ-02', title: 'Выбор формулы асимметрии asym_q', status: 'Открыт (кандидат v0.1 ≠ финал)' },
  { id: 'OQ-03', title: 'Режим наследия 4 окружностей (Exp 01–06)', status: 'Вынесен в изолированный режим' },
  { id: 'OQ-04', title: 'Предельные бюджеты r и N(r) в браузере', status: 'Открыт (не утверждено)' },
  { id: 'OQ-05', title: 'Семантика и формат пути berggren_word', status: 'Открыт (не утверждено)' },
  { id: 'OQ-06', title: 'Локальное хранение на Фазе 1', status: 'Принято: localStorage / экспорт' },
];

export interface MatrixColumnSchema {
  key: string;
  category: Exclude<MatrixCategoryId, 'all'>;
  categoryLabel: string;
  precision: 'exact_int' | 'exact_rational' | 'exact_bool_or_id' | 'approx_float64';
  description: string;
}

export const MATRIX_SCHEMA_COLUMNS: MatrixColumnSchema[] = [
  { key: 'row_idx', category: 'identification', categoryLabel: 'Идентификация', precision: 'exact_int', description: 'Порядковый индекс строки при сортировке по возрастанию x' },
  { key: 'triple_id', category: 'identification', categoryLabel: 'Идентификация', precision: 'exact_bool_or_id', description: 'Канонический ID тройки PT-R{r}-K{k}-X{x} без ведущих нулей' },
  { key: 'class_id', category: 'identification', categoryLabel: 'Идентификация', precision: 'exact_bool_or_id', description: 'Идентификатор класса CL-R{r}-D{2r}' },
  { key: 'prim_id', category: 'identification', categoryLabel: 'Идентификация', precision: 'exact_bool_or_id', description: 'ID примитивного прообраза PT-R{r/k}-K1-X{x/k}' },

  { key: 'x', category: 'arithmetic', categoryLabel: 'Арифметика', precision: 'exact_int', description: 'Факторизационный сдвиг x = a − 2r = c − b' },
  { key: 'y', category: 'arithmetic', categoryLabel: 'Арифметика', precision: 'exact_int', description: 'Факторизационный сдвиг y = b − 2r = c − a' },
  { key: 'k', category: 'arithmetic', categoryLabel: 'Арифметика', precision: 'exact_int', description: 'Масштабный множитель k = gcd(a, b, c) = gcd(x, y) | r' },
  { key: 'is_prim', category: 'arithmetic', categoryLabel: 'Арифметика', precision: 'exact_bool_or_id', description: 'Флаг примитивности (k = 1)' },
  { key: 'div3_leg / div4_leg / div5_side', category: 'arithmetic', categoryLabel: 'Арифметика', precision: 'exact_bool_or_id', description: 'Арифметический профиль делимости ППТ на 3, 4, 5' },

  { key: 'm, n', category: 'parametric', categoryLabel: 'Параметры Евклида', precision: 'exact_int', description: 'Параметры Евклида: m > n ≥ 1, gcd(m, n) = 1, m ≢ n (mod 2)' },
  { key: 'u, v', category: 'parametric', categoryLabel: 'Параметры Евклида', precision: 'exact_int', description: 'Взаимно простая пара u = n, v = m − n (2 ∤ v, r = kuv)' },

  { key: 'a, b, c', category: 'geometric', categoryLabel: 'Геометрия', precision: 'exact_int', description: 'Каноническая тройка 0 < a < b < c' },
  { key: 'S, p, P', category: 'geometric', categoryLabel: 'Геометрия', precision: 'exact_int', description: 'Площадь S = ab/2 = rp, полупериметр p, периметр P = a + b + c' },
  { key: 'angle_A, angle_B', category: 'geometric', categoryLabel: 'Геометрия', precision: 'approx_float64', description: 'Острые углы треугольника (приближённая визуализация float64)' },
  { key: 'a_div_c, b_div_c', category: 'geometric', categoryLabel: 'Геометрия', precision: 'exact_rational', description: 'Отношения катетов к гипотенузе (ExactRational)' },

  { key: 'sporn_x, sporn_y', category: 'structural', categoryLabel: 'Структура и подобие', precision: 'exact_rational', description: 'Нормированные координаты Спорна x̃ = x/r, ỹ = y/r (x̃ỹ = 2)' },
  { key: 'tan_half_A, tan_half_B', category: 'structural', categoryLabel: 'Структура и подобие', precision: 'exact_rational', description: 'Точные полутангенсы 1/(1 + ỹ) и 1/(1 + x̃)' },
  { key: 'form_t', category: 'structural', categoryLabel: 'Структура и подобие', precision: 'exact_rational', description: 'Параметр формы t = b/a > 1 (утверждённая величина)' },
  { key: 'asym_q', category: 'structural', categoryLabel: 'Структура и подобие', precision: 'exact_rational', description: 'Неутверждённый кандидат OQ-02 (в v0.1: (b−a)/(a+b); альтернативы открыты в DESIGN_REVIEW)' },

  { key: 'berggren_path, tree_depth', category: 'generative', categoryLabel: 'Генеалогия', precision: 'exact_bool_or_id', description: 'Путь в дереве Берггрена (неутверждённый формат OQ-05)' },
  { key: 'tree_leg_swapped', category: 'generative', categoryLabel: 'Генеалогия', precision: 'exact_bool_or_id', description: 'Флаг перестановки катетов между узлом дерева и каноном a < b' },
];

export const CHK_SPEC_ITEMS: CheckSpecItem[] = [
  { id: 'CHK-01', title: 'Пифагорово тождество и канон', scope: 'row', formula: 'a² + b² = c², 0 < a < b < c', criterion: 'Точное равенство в BigInt для каждой строки' },
  { id: 'CHK-02', title: 'Согласованность r, площади и периметра', scope: 'row', formula: 'a + b − c = 2r, P = 2p, S = ab/2 = pr', criterion: 'Все 5 целочисленных равенств без остатка' },
  { id: 'CHK-03', title: 'Гипербола и границы факторизации', scope: 'row', formula: 'xy = 2r², 1 ≤ x < √2·r < y ≤ 2r²', criterion: 'Тождество xy = 2r², строгое x² < 2r² < y² и рост x' },
  { id: 'CHK-04', title: 'Масштаб и делимость k | r', scope: 'row', formula: 'gcd(x, y) = gcd(a, b, c) = k, k | r', criterion: 'Равенство обеих НОД значению k и флага is_prim' },
  { id: 'CHK-05', title: 'Прямая евклидова генерация', scope: 'row', formula: 'm > n ≥ 1, gcd(m,n)=1, m ≢ n (mod 2)', criterion: 'Точное восстановление {a, b} = {k(m²−n²), 2kmn} и c' },
  { id: 'CHK-06', title: 'Полнота класса C(r)', scope: 'completeness', formula: '|rows| = N(r) = τ(2r²)/2', criterion: 'Независимый подсчёт N_indep(r) вне кода M2/M3' },
  { id: 'CHK-07', title: 'Полнота примитивного слоя C₁(r)', scope: 'completeness', formula: '|{k = 1}| = T(r) = 2^{ω*(r)} ≥ 1', criterion: 'Независимый подсчёт T_indep(r) без алгоритмов M3' },
  { id: 'CHK-08', title: 'Уникальность троек и ID', scope: 'completeness', formula: 'Uniq(a,b,c) = Uniq(x,y) = Uniq(triple_id)', criterion: 'Отсутствие дублей внутри матрицы класса' },
  { id: 'CHK-09', title: 'Обратное восстановление (u, v, m, n)', scope: 'row', formula: '{x₀, y₀} = {2u², v²}, 2 ∤ v', criterion: 'Точный isqrt без остатка и фиксация 2-части в u' },
  { id: 'CHK-10', title: 'Мощность каждого подкласса Cₖ(r)', scope: 'completeness', formula: '|Cₖ(r)| = T(r/k), число слоёв = τ(r)', criterion: 'Не пуст и не потерян ни один слой для всех k | r' },
  { id: 'CHK-11', title: 'Сертификация факторизации r и 2r²', scope: 'certification', formula: 'PROVEN_PRIME / PROBABLE_PRIME', criterion: 'Запрет смешения вероятностных простых с PROVEN_CLASS' },
  { id: 'CHK-12', title: 'Воспроизводимость идентификаторов', scope: 'certification', formula: 'CL-R{r}-D{2r}, PT-R{r}-K{k}-X{x}', criterion: 'Посимвольная реконструкция без ведущих нулей' },
];

/**
 * Standalone SVG engine demo presets (continuous GeometryBoard test shapes, decoupled from selected C(r)).
 */
export const GEOMETRIC_PREVIEW_SAMPLES: GeometricPreviewSample[] = [
  { id: 'demo_3_4_5', label: 'Демо SVG (3, 4, 5)', demoInradius: 1, note: 'Автономный демо-треугольник движка (r_demo = 1, не привязан к C(r))', a: 4, b: 3 },
  { id: 'demo_5_12_13', label: 'Демо SVG (5, 12, 13)', demoInradius: 2, note: 'Автономный демо-треугольник движка (r_demo = 2, не привязан к C(r))', a: 12, b: 5 },
  { id: 'demo_8_15_17', label: 'Демо SVG (8, 15, 17)', demoInradius: 3, note: 'Автономный демо-треугольник движка (r_demo = 3, не привязан к C(r))', a: 8, b: 15 },
];
