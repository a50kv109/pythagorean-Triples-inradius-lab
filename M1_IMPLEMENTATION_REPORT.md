# M1_IMPLEMENTATION_REPORT — Отчёт о реализации модуля M1 (Exact Computation Core)

**Проект:** *Pythagoras Circles — Canonical Geometry Research Laboratory*  
**Этап:** **Implementation Phase M1 — Exact Computation Core**  
**Статус:** Реализован исключительно фундаментальный слой точной арифметики `src/core/exact/`; модули **M2–M8 не реализовывались**.  
**Дата:** 2026-11-27

---

## 1. Архитектура реализованного ядра (`src/core/exact/`)

Ядро **M1** спроектировано как полностью автономный, не зависящий от React, DOM, SVG, `src/math/*`, `src/geometry/*` и `src/canonical/*` слой детерминированной арифметики на базе нативного `BigInt`:

1. **`errors.ts` — Иерархия типизированных ошибок домена:**
   - `ExactArithmeticError` (базовый класс);
   - `InvalidBigIntInputError` (некорректный тип/формат целых аргументов);
   - `InvalidRadiusError` (радиус $r \le 0$ или не-`bigint`);
   - `ExactDivisionByZeroError` (деление на $0$, нулевой знаменатель, инверсия нуля, $0^{-k}$);
   - `ExactDivisibilityError` (деление с ненулевым остатком в `exactDivBigInt`);
   - `NotPerfectSquareError` (попытка извлечь точный корень из неквадрата в `exactSqrtBigInt`);
   - `ExactIdentityError` (нарушение $a^2 + b^2 = c^2$, канона $0 < a < b < c$ или $xy = 2r^2$).

2. **`bigIntMath.ts` — Точная целочисленная арифметика (`BigInt`):**
   - Строгий парсер `parseIntegerBigInt` (только десятичные целочисленные строки, без `Number`/`parseInt`/`parseFloat`).
   - Валидаторы `assertBigInt`, `assertPositiveBigInt`, `assertNonNegativeBigInt`, `assertNonZeroBigInt`.
   - Сравнения и базовые операции: `absBigInt`, `signBigInt`, `cmpBigInt`, `eqBigInt`, `minBigInt`, `maxBigInt`, `isEvenBigInt`, `isOddBigInt`, `powBigInt`.
   - Точное деление и делимость: `divModBigInt`, `isDivisibleBigInt`, `exactDivBigInt`.
   - Теоретико-числовые базовые примитивы (без факторизации M2): `gcdBigInt`, `lcmBigInt`.
   - Точные квадратные корни без `Math.sqrt`: `isqrtBigInt` (целочисленный метод Ньютона с начальным сдвигом по битовой длине `BigInt`), `isPerfectSquareBigInt`, `exactSqrtBigInt`.

3. **`exactRational.ts` — Несократимые рациональные числа (`ExactRational`):**
   - Иммутабельный (`Object.freeze`) тип `{ readonly num: bigint; readonly den: bigint }`.
   - Инварианты нормализации: `den > 0n` строго (знак всегда в `num`), `gcd(|num|, den) === 1n`, ноль нормализуется к `RATIONAL_ZERO = { num: 0n, den: 1n }`.
   - Конструкторы и парсинг: `createRational`, `rationalFromBigInt`, `parseRational` (целые `"n"` и дроби `"n/d"`, отказ на `float`, `1/0` и некорректных строках).
   - Арифметика и сравнения: `addRational`, `subRational`, `mulRational`, `divRational`, `negRational`, `absRational`, `invRational`, `powRational`, `cmpRational`, `eqRational`, `ltRational`, `lteRational`, `gtRational`, `gteRational`, `isZeroRational`, `isPositiveRational`, `isNegativeRational`, `isIntegerRational`, `formatRational`, `formatRationalFraction`.
   - Преобразование в `number` (`toNumber`) намеренно отсутствует в `M1`, чтобы исключить скрытую потерю точности.

4. **`radiusPrimitives.ts` — Безопасная работа с радиусом $r$, $D$, $2r^2$ и сдвигами $(x, y)$:**
   - Валидация радиуса: `assertPositiveRadius(r)` ($r \ge 1$, строго `bigint`).
   - Базовые величины: `computeDiameter(r) = 2n * r`, `computeTwoRSquared(r) = 2n * r * r`.
   - Проверки и вычисления для троек и гиперболы: `verifyPythagoreanIdentity(a, b, c)`, `verifyCanonicalOrder(a, b, c)`, `computeInradiusFromTriple(a, b, c)`, `verifyHyperbolaIdentity(r, x, y)` ($1 \le x < y \le 2r^2$, $x^2 < 2r^2 < y^2$, $xy = 2r^2$), `computeFactorizationShifts(a, b, c, r?)`, `reconstructTripleFromShifts(r, x, y)`.

5. **`index.ts` — Единая точка экспорта ядра M1.**

---

## 2. Список созданных и изменённых файлов

### Созданы (новые файлы):
- `/src/core/exact/errors.ts`
- `/src/core/exact/bigIntMath.ts`
- `/src/core/exact/exactRational.ts`
- `/src/core/exact/radiusPrimitives.ts`
- `/src/core/exact/index.ts`
- `/src/tests/core/exactM1.test.ts`
- `/M1_IMPLEMENTATION_REPORT.md`

### Изменены:
- `/package.json` — в скрипт `"test"` добавлен запуск `tsx src/tests/core/exactM1.test.ts` с полным сохранением существующих тестов `geometry.test.ts` и `incenterPartition.test.ts`.

### Не тронуты (строго сохранены):
- Все UI-компоненты (`src/App.tsx`, `src/components/*`), локализация (`src/i18n/*`), существующая лаборатория 4 окружностей (`src/math/*`, `src/geometry/*`, `src/canonical/*`), документация базы знаний и отчёты Phase 1.1 / Phase 1.2.

---

## 3. Публичные интерфейсы и контракты M1 (`src/core/exact/index.ts`)

- **Типы и константы:** `BigIntOrdering`, `BigIntDivMod`, `ExactRational`, `ExactTripleLegs`, `ExactShiftPair`, `RATIONAL_ZERO`, `RATIONAL_ONE`.
- **Ошибки:** `ExactArithmeticError`, `InvalidBigIntInputError`, `InvalidRadiusError`, `ExactDivisionByZeroError`, `ExactDivisibilityError`, `NotPerfectSquareError`, `ExactIdentityError`.
- **Целочисленный слой:** `assertBigInt`, `assertPositiveBigInt`, `assertNonNegativeBigInt`, `assertNonZeroBigInt`, `parseIntegerBigInt`, `absBigInt`, `signBigInt`, `cmpBigInt`, `eqBigInt`, `minBigInt`, `maxBigInt`, `isEvenBigInt`, `isOddBigInt`, `divModBigInt`, `isDivisibleBigInt`, `exactDivBigInt`, `gcdBigInt`, `lcmBigInt`, `powBigInt`, `isqrtBigInt`, `isPerfectSquareBigInt`, `exactSqrtBigInt`.
- **Рациональный слой:** `createRational`, `rationalFromBigInt`, `parseRational`, `addRational`, `subRational`, `mulRational`, `divRational`, `negRational`, `absRational`, `invRational`, `powRational`, `cmpRational`, `eqRational`, `ltRational`, `lteRational`, `gtRational`, `gteRational`, `isZeroRational`, `isPositiveRational`, `isNegativeRational`, `isIntegerRational`, `formatRational`, `formatRationalFraction`.
- **Радиусный слой:** `assertPositiveRadius`, `computeDiameter`, `computeTwoRSquared`, `verifyPythagoreanIdentity`, `verifyCanonicalOrder`, `computeInradiusFromTriple`, `verifyHyperbolaIdentity`, `computeFactorizationShifts`, `reconstructTripleFromShifts`.

---

## 4. Описание тестов M1 и результаты фактических проверок

В `/src/tests/core/exactM1.test.ts` реализованы 5 секций проверок:
1. **Изоляция ядра (`Section 1`):** программная проверка всех файлов `src/core/exact/*.ts` (после очистки комментариев) на отсутствие `Math.*`, `Number(...)`, `parseInt`, `parseFloat`, импортов `react`, `components/`, `geometry/`, `math/`.
2. **BigInt-арифметика и деление (`Section 2`):** парсинг знаковых/сверхдлинных чисел (`10^29+`), отказ на `"3.14"`, `"1e5"`, `""`, `divModBigInt`, `exactDivBigInt`, `isDivisibleBigInt`, `powBigInt`, обработка `0n` и отрицательных аргументов.
3. **НОД/НОК и точный квадратный корень (`Section 3`):** граничные `gcdBigInt(0, 0)`, отрицательные аргументы, точные `isqrtBigInt` и `isPerfectSquareBigInt` для малых значений (`0..17`) и сверхбольших квадратов `> 10^56` (`(12345678901234567890123456789n)^2 ± 1`), проверка исключения `NotPerfectSquareError`.
4. **`ExactRational` (`Section 4`):** нормализация отрицательных знаменателей и сокращение НОД, `0/-999 -> 0/1`, все 4 арифметические операции, возведение в отрицательные/нулевые степени, сравнения дробей при масштабе $> 2^{53}$ (`(2^53 + 1) / 2^53 > 1` с точным остатком `1 / 2^53`), защита от деления на ноль.
5. **Радиус, диаметр, $2r^2$ и гиперболические сдвиги (`Section 5`):** граничный случай $r = 1 \implies (3, 4, 5), (x, y) = (1, 2)$; эталонный класс $C(3)$ (`(7,24,25)`, `(8,15,17)`, `(9,12,15)`); проверка экстремального радиуса $r = 10^{15}$ ($2r^2 = 2\cdot 10^{30} \gg 2^{53}$); отклонение неканонических `(4, 3, 5)`, непифагоровых `(3, 4, 6)` и некорректных радиусов (`0n`, `-5n`, `number`).

### Фактические результаты прогона:
- **`npm test`:**
  - `src/tests/geometry.test.ts`: **PASS** (все 10 секций).
  - `src/tests/incenterPartition.test.ts`: **PASS**.
  - `src/tests/core/exactM1.test.ts`: **PASS** (`ALL 5 SECTIONS OF M1 EXACT COMPUTATION CORE PASSED!`).
- **`tsc --noEmit` (`lint_applet`):** **PASS** (0 ошибок).
- **`vite build` (`compile_applet`):** **PASS** (успешная сборка).

---

## 5. Ограничения, известные проблемы и статус M2–M8

- **Подтверждение области реализации:** модули **M2** (факторизация и сертификация простоты), **M3** (генерация $C(r)$ и $C_k(r)$), **M4** (фасеты Спорна/Берггрена/пучки), **M5** (паспорта и матрица), **M6** (независимый верификатор `CHK-01…12`), **M7** (SVG-проекция) и **M8** (экспорт/аналитика) **не реализовывались**.
- **Ограничения M1:**
  - При `toString(2)` внутри `isqrtBigInt` для чисел с миллионами бит асимптотика определяется длиной двоичной записи, что более чем достаточно для всего рабочего диапазона $r$ в браузере (до тысяч бит).
  - `M1` намеренно не предоставляет методов приближения в `float64`: конвертация точных величин в `float64` (для графиков и `angle_A, angle_B`) будет инкапсулирована исключительно в будущем визуальном адаптере **M7**.
  - Некритические UI-замечания `AUD-01…AUD-09` из `PHASE_1_2_AUDIT_REPORT.md` сохраняются как контрольные пункты соответствующих следующих фаз.

---

## 6. Рекомендации для следующего этапа (M2 — Number Theory Engine)

1. Реализовать `M2` в `src/core/factorization/` строго поверх `src/core/exact/` (`M1`): каноническое разложение $r = 2^{e_0}\prod p_i^{e_i}$, построение делителей $2r^2$ ($xy = 2r^2,\; x < y$) и пар $(u, v)$ ($r/k = uv,\; \gcd(u,v)=1,\; 2 \nmid v$).
2. Обязательно внедрить трёхуровневую сертификацию простоты `PROVEN_PRIME` (пробное деление / 13-базовый детерминированный Миллер–Рабин для $p < 3.317 \times 10^{24}$), `PROBABLE_PRIME` и `UNFACTORED_COMPOSITE` согласно `DESIGN_REVIEW.md §4.1`.
3. Сохранить архитектурную границу для будущего независимого верификатора `M6`: `M6` должен опираться только на `M1` (`src/core/exact/`), без импортов из `M2` или `M3`.
