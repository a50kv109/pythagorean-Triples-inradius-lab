# M2_IMPLEMENTATION_REPORT — Отчёт о реализации модуля M2 (Number Theory Engine)

**Проект:** *Pythagoras Circles — Canonical Geometry Research Laboratory*  
**Этап:** **Implementation Phase M2 — Number Theory Engine**  
**Статус:** Реализован изолированный теоретико-числовой слой `src/core/factorization/` строго поверх M1 (`src/core/exact/index.ts`); модули **M1 не изменялись**, модули **M3–M8 не реализовывались**.  
**Дата:** 2026-11-27  

---

## 1. Список созданных и изменённых файлов

### Созданы (новые файлы):
- `/src/core/factorization/errors.ts` — иерархия ошибок M2 (`FactorizationError`, `InvalidFactorizationInputError`, `IncompleteFactorizationError`, `CombinatorialLimitError`), наследуемая от `ExactArithmeticError` (M1).
- `/src/core/factorization/types.ts` — типизированные контракты (`PrimeCertificationStatus`, `PrimalityCertificate`, `CanonicalFactorization`, `TwoRSquaredFactorization`, `HyperbolaDivisorPair`, `ArithmeticCounters`, `NumberTheoryDiagnostic`, `FactorizationOptions`, `RadiusNumberTheoryResult`).
- `/src/core/factorization/modularArithmetic.ts` — точная модульная арифметика на `BigInt` (`modNormalizeBigInt`, `modAddBigInt`, `modMulBigInt`, `modPowBigInt`).
- `/src/core/factorization/primality.ts` — трёхуровневый сертификатор простоты (`certifyPrimality`, `passesMillerRabinBase`, детерминированные пороги Миллера–Рабина вплоть до $3.317 \times 10^{24}$ по Sorenson & Webster 2015).
- `/src/core/factorization/primeFactorization.ts` — каноническая факторизация (`factorizeBigInt`, `reconstructFromFactorization`, `liftRadiusFactorizationToTwoRSquared`).
- `/src/core/factorization/divisors.ts` — генерация и проверка полноты всех положительных делителей (`countDivisorsFromFactorization`, `generateDivisorsFromFactorization`, `verifyDivisorsComplete`).
- `/src/core/factorization/hyperbolaPairs.ts` — построение полного уникального множества канонических пар гиперболы $xy = 2r^2$ (`buildHyperbolaDivisorPairs`).
- `/src/core/factorization/counters.ts` — точные теоретические счётчики (`computeArithmeticCounters`: $\omega^*(r)$, $\tau(r)$, $\tau(2r^2)$, $T(r)$, $N(r)$).
- `/src/core/factorization/analyzeRadius.ts` — единый детерминированный оркестратор (`analyzeRadiusNumberTheory`).
- `/src/core/factorization/index.ts` — единая точка экспорта публичного API M2.
- `/src/tests/core/factorizationM2.test.ts` — независимый набор автотестов M2 (6 секций).
- `/M2_IMPLEMENTATION_REPORT.md` — настоящий отчёт.

### Изменены:
- `/package.json` — в скрипт `"test"` добавлен запуск `tsx src/tests/core/factorizationM2.test.ts` при полном сохранении тестов старой лаборатории и M1.

### Не тронуты (строго сохранены):
- Все файлы M1 (`src/core/exact/*`, `src/tests/core/exactM1.test.ts`), UI (`src/App.tsx`, `src/components/*`), геометрия 4 окружностей (`src/math/*`, `src/geometry/*`, `src/canonical/*`), а также исследовательские документы.

---

## 2. Публичный API M2 (`src/core/factorization/index.ts`)

- **Константы и типы:**  
  `DETERMINISTIC_MR_LIMIT_13_BASES`, `FIRST_13_PRIME_BASES`, `PROBABLE_PRIME_FIXED_BASES`, `DEFAULT_TRIAL_PROOF_MAX_N`, `DEFAULT_PROBABLE_PRIME_ROUNDS`, `DEFAULT_TRIAL_DIVISION_LIMIT`, `DEFAULT_MAX_POLLARD_ITERATIONS`, `DEFAULT_MAX_DURATION_MS`, `DEFAULT_MAX_DIVISOR_ENUMERATION_COUNT`;  
  `PrimeCertificationStatus`, `PrimalityVerdict`, `PrimalityProofMethod`, `PrimalityCertificate`, `PrimePowerFactor`, `UnfactoredCompositeFactor`, `FactorizationCertificationStatus`, `CanonicalFactorization`, `TwoRSquaredFactorization`, `HyperbolaDivisorPair`, `ArithmeticCounters`, `NumberTheoryDiagnostic`, `FactorizationOptions`, `RadiusNumberTheoryResult`.
- **Ошибки:**  
  `FactorizationError`, `InvalidFactorizationInputError`, `IncompleteFactorizationError`, `CombinatorialLimitError`.
- **Функции:**  
  - *Модульная арифметика:* `modNormalizeBigInt`, `modAddBigInt`, `modMulBigInt`, `modPowBigInt`;
  - *Сертификация простоты (M2.2):* `passesMillerRabinBase`, `certifyPrimality`;
  - *Факторизация и подъём (M2.1):* `factorizeBigInt`, `reconstructFromFactorization`, `liftRadiusFactorizationToTwoRSquared`;
  - *Делители (M2.3):* `countDivisorsFromFactorization`, `generateDivisorsFromFactorization`, `verifyDivisorsComplete`;
  - *Пары гиперболы (M2.4):* `buildHyperbolaDivisorPairs`;
  - *Счётчики (M2.5):* `computeArithmeticCounters`;
  - *Комплексный анализ радиуса:* `analyzeRadiusNumberTheory`.

---

## 3. Алгоритмы факторизации, сертификации и математические основания

### 3.1 Факторизация и восстановление (M2.1)
1. **Выделение степени двойки:** $r = 2^{e_0} \cdot r_{\text{odd}}$ сдвигами `BigInt`.
2. **Колесо пробного деления ($6k \pm 1$):** детерминированное выделение делителей $3$ и $6k \pm 1$ до `trialDivisionLimit` (по умолчанию $10^5$) с точным отслеживанием `nextCandidate` (гарантия `nextCandidate^2 > remaining` перед присвоением статуса `PROVEN_PRIME`).
3. **Проверка на полный квадрат:** перед запуском Полларда–Брента остаток проверяется через `isPerfectSquareBigInt` / `exactSqrtBigInt` (M1), что мгновенно расщепляет степени $p^{2k}$.
4. **Детерминированный Pollard–Brent:** пакетный GCD (`batchSize = 128n`), детерминированная последовательность полиномов $x^2 + c \pmod n$ без `Math.random()`, строгий контроль бюджета шагов (`maxPollardIterations`) и времени (`maxDurationMs` через `BigInt(Date.now())`).
5. **Восстановление и инвариант:** все найденные простые степени сливаются, сортируются по возрастанию (`cmpBigInt`), и на любом исходе проверяется `reconstructedTotal === n` (произведение простых степеней и неразложенных составных остатков).
6. **Подъём к $2r^2$:** по $r = 2^{e_0} \prod_{i=1}^s p_i^{e_i}$ аналитически без повторной факторизации строится:
   $$2r^2 = 2^{2e_0 + 1} \prod_{i=1}^s p_i^{2e_i},$$
   сохраняющее статусы сертификации всех $p_i$ и проверяющее совпадение произведения с `computeTwoRSquared(r)` из M1.

### 3.2 Трёхуровневая сертификация простоты (M2.2)
- **`PROVEN_PRIME`** присваивается строго в двух математически доказанных режимах:
  1. Полное пробное деление до $\lfloor \sqrt{n} \rfloor$ (малые простые $\le 97$ или $n \le 10^8$ при соответствующем лимите);
  2. Детерминированный тест Миллера–Рабина в доказанных интервалах (вплоть до границы Sorenson & Webster, 2015: $n < 3\,317\,044\,064\,679\,887\,385\,961\,981 \approx 3.317 \times 10^{24}$ по 13 первым простым основаниям $\{2, 3, 5, \dots, 41\}$). Пользовательский параметр `deterministicMillerRabinMax` жёстко ограничен сверху этой доказанной границей.
- **`PROBABLE_PRIME`** присваивается выше $3.317 \times 10^{24}$ после прохождения $25$ (или `probablePrimeRounds`) детерминированно воспроизводимых раундов Миллера–Рабина (`isPrime: null`, `isProven: false`). При наличии хотя бы одного такого фактора класс помечается как `PROBABLE_COMPLETE` с явным предупреждением `PROBABLE_PRIME_USED`.
- **`UNFACTORED_COMPOSITE`** присваивается остатку, распознанному как `COMPOSITE`, если бюджет шагов или времени исчерпан до нахождения делителя. Итоговый статус становится `INCOMPLETE`, а массивы делителей, пары и счётчики возвращаются как `null` с диагностическим описанием — неполный результат никогда не маскируется под успешный.

### 3.3 Делители, пары гиперболы и счётчики (M2.3–M2.5)
- **Делители:** строятся только при `isComplete === true` и $\tau(n) \le \text{maxDivisorEnumerationCount}$; сортируются по возрастанию и проходят `verifyDivisorsComplete` (отсутствие дубликатов, точное равенство $\tau$, проверка $d \mid n$ через M1 `isDivisibleBigInt`).
- **Пары гиперболы $(x, y)$:** отбор делителей $2r^2$ по чисто целочисленному условию $x^2 < 2r^2$ с вычислением $y = 2r^2 / x$ через `exactDivBigInt`, проверкой `verifyHyperbolaIdentity(r, x, y)` ($1 \le x < y \le 2r^2,\; x^2 < 2r^2 < y^2,\; xy = 2r^2$) и контролем $2 \cdot |\text{pairs}| = \tau(2r^2)$.
- **Теоретические счётчики:**  
  $$\omega^*(r) = s, \quad \tau(r) = (e_0 + 1)\prod_{i=1}^s(e_i + 1), \quad T(r) = 2^{\omega^*(r)}, \quad N(r) = \frac{\tau(2r^2)}{2} = (e_0 + 1)\prod_{i=1}^s(2e_i + 1).$$

---

## 4. Ограничения производительности

- Детерминированное пробное деление ($10^5$) + Миллер–Рабин + Pollard–Brent в браузере уверенно и быстро (единицы миллисекунд) раскладывают числа с простыми и полупростыми факторами до $\sim 60\text{–}80$ бит ($r \sim 10^{18}\text{–}10^{24}$).
- Для трудных полупростых $r > 10^{25}$ с двумя крупными простыми делителями срабатывают защитные ограничения:
  - `maxPollardIterations` (по умолчанию `300_000n`);
  - `maxDurationMs` (по умолчанию `2_500n` мс).
- Для высокосоставных чисел (комбинаторный взрыв числа делителей) действует `maxDivisorEnumerationCount` (по умолчанию `500_000n`): при превышении порога точные счётчики $\omega^*(r), \tau(r), T(r), N(r)$ всё равно вычисляются, а перечислимые списки делителей и пар явно отключаются (`null`) с предупреждением `COMBINATORIAL_LIMIT_EXCEEDED`.

---

## 5. Результаты контрольных случаев (из фактического прогона `factorizationM2.test.ts`)

| $r$ | Факторизация $r$ | $\omega^*(r)$ | $\tau(r)$ | $\tau(2r^2)$ | $T(r)$ | $N(r)$ | Пары гиперболы $(x, y)$ | Статус |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :--- | :--- |
| **1** | $2^0$ | 0 | 1 | 2 | 1 | 1 | `(1, 2)` | `PROVEN_COMPLETE` |
| **2** | $2^1$ | 0 | 2 | 4 | 1 | 2 | `(1, 8), (2, 4)` | `PROVEN_COMPLETE` |
| **3** | $3^1$ | 1 | 2 | 6 | 2 | 3 | `(1, 18), (2, 9), (3, 6)` | `PROVEN_COMPLETE` |
| **6** | $2^1 \cdot 3^1$ | 1 | 4 | 12 | 2 | 6 | 6 уникальных пар (`(1,72)..(8,9)`) | `PROVEN_COMPLETE` |
| **15** | $3^1 \cdot 5^1$ | 2 | 4 | 18 | 4 | 9 | 9 уникальных пар | `PROVEN_COMPLETE` |
| **30** | $2^1 \cdot 3^1 \cdot 5^1$ | 2 | 8 | 36 | 4 | 18 | 18 уникальных пар | `PROVEN_COMPLETE` |
| **35** | $5^1 \cdot 7^1$ | 2 | 4 | 18 | 4 | 9 | 9 уникальных пар | `PROVEN_COMPLETE` |
| **100** | $2^2 \cdot 5^2$ | 1 | 9 | 30 | 2 | 15 | 15 уникальных пар | `PROVEN_COMPLETE` |

Дополнительно подтверждены:
- **Эталонный срез `BENCHMARK_DATA_CATALOG.md` ($r = 1\dots 100$):** $\sum_{r=1}^{30} T(r) = 61$, $\sum_{r=1}^{30} N(r) = 174$; $\sum_{r=1}^{100} T(r) = 249$, $\sum_{r=1}^{100} N(r) = 855$ — точное совпадение; полный перебор делителей $2r^2$ для $r = 1\dots 30$ совпал посимвольно.
- **Сильное псевдопростое и числа Кармайкла:** `561`, `1729`, `41041` и 7-базовое сильное псевдопростое `341550071728321` распознаны как `COMPOSITE`.
- **Числа $> 3.317 \times 10^{24}$:** простое Мерсенна $M_{89} = 2^{89} - 1$ и составное $12(2^{89} - 1)$ получили статус `PROBABLE_PRIME` / `PROBABLE_COMPLETE` с предупреждением `PROBABLE_PRIME_USED` (без ложного повышения до `PROVEN`).
- **Большой `BigInt` $> 2^{53}$:** $r = 2 \cdot 1000000007 \cdot 1000000009$ ($2r^2 > 10^{36}$) факторизован детерминированно (два прогона полностью тождественны), $T = 4, N = 18$, все 18 пар прошли `verifyHyperbolaIdentity`.

---

## 6. Результаты проверок сборки и тестов

- **`npm test`:** **PASS** (код возврата `0`):
  - `src/tests/geometry.test.ts` (10 секций): **PASS**
  - `src/tests/incenterPartition.test.ts`: **PASS**
  - `src/tests/core/exactM1.test.ts` (5 секций): **PASS**
  - `src/tests/core/factorizationM2.test.ts` (6 секций): **PASS**
- **`tsc --noEmit` (`lint`):** **PASS** (0 ошибок).
- **`vite build` (`build`):** **PASS** (успешная сборка).

---

## 7. Известные ограничения и статус следующих этапов (M3–M8)

- Модули **M3** (классификация $C(r)$ / $C_k(r)$, идентификаторы `CL-R...-D...`, `PT-R...-K...-X...`), **M4** (фасеты Спорна, Берггрена, пучки), **M5** (паспорта и матрица), **M6** (независимый верификатор `CHK-01…12`), **M7** (SVG-проекция) и **M8** (экспорт/UI) в рамках настоящего этапа **не реализовывались**.
- Будущий независимый верификатор **M6** не должен импортировать `src/core/factorization/` (как предусмотрено `DESIGN_REVIEW.md §4.2`).
- Как и в любом конечном по времени алгоритме факторизации в браузере, для произвольно больших трудных полупростых $r$ без известных малых множителей возможен детерминированный возврат `INCOMPLETE` (`UNFACTORED_COMPOSITE`) при исчерпании квоты шагов или времени.
