# M2_POST_IMPLEMENTATION_AUDIT — Независимый пост-реализационный аудит модуля M2 (Number Theory Engine)

**Проект:** *Pythagoras Circles — Canonical Geometry Research Laboratory*  
**Объект аудита:** Модуль **M2 — Number Theory Engine** (`src/core/factorization/*`, `src/tests/core/factorizationM2.test.ts`, `M2_IMPLEMENTATION_REPORT.md`)  
**Режим аудита:** **Строго READ-ONLY** (исходный код M1/M2, тесты, зависимости, UI и существующие документы не изменялись; M3 не реализовывался)  
**Дата аудита:** 2026-11-27  

---

## 0. Итоговый вердикт и прямой ответ для перехода к M3

### **Вердикт: `PASS WITH WARNINGS`**

- **Критических (`Critical`) дефектов:** **0**
- **Математических ошибок в полном пайплайне `analyzeRadiusNumberTheory`:** **0**
- **Замечаний уровня `Medium`:** **3** (`M2-AUD-01`, `M2-AUD-02`, `M2-AUD-03`)
- **Замечаний уровня `Low`:** **3** (`M2-AUD-04`, `M2-AUD-05`, `M2-AUD-06`)

### **Является ли M2 математически достаточно надёжным, чтобы служить арифметическим фундаментом для M3?**
**Да. M2 математически надёжен для использования в качестве арифметического фундамента M3 (`Classification Engine`),** при условии, что M3 обращается к нему через `analyzeRadiusNumberTheory` (или через корректно переданные полные результаты `factorizeBigInt` → `liftRadiusFactorizationToTwoRSquared` → `generateDivisorsFromFactorization` → `buildHyperbolaDivisorPairs`).  

При этом перед или в начале M3 рекомендуется устранить **2 контрактных предупреждения** публичных вспомогательных функций (`M2-AUD-01` — жёсткая проверка $2 \le \text{base} < n$ в `passesMillerRabinBase`, и `M2-AUD-02` — запрет на приём неполного/подменённого списка делителей в standalone `buildHyperbolaDivisorPairs`). Оба замечания **не затрагивают** внутренний конвейер `certifyPrimality` / `analyzeRadiusNumberTheory`, но важны для строгости публичного API M2.

---

## 1. Объём инспекции исходников (Source Inspection)

В режиме read-only полностью изучены все 12 файлов M2, а также публичный API M1 (`src/core/exact/index.ts`) и математическая база (`/MATHEMATICAL_FOUNDATION.md`, `/DESIGN_REVIEW.md`, `/CLASSIFICATION_SPECIFICATION.md`, `/BENCHMARK_DATA_CATALOG.md`):

1. `/src/core/factorization/errors.ts` (51 строка)
2. `/src/core/factorization/types.ts` (146 строк)
3. `/src/core/factorization/modularArithmetic.ts` (70 строк)
4. `/src/core/factorization/primality.ts` (361 строка)
5. `/src/core/factorization/primeFactorization.ts` (541 строка)
6. `/src/core/factorization/divisors.ts` (121 строка)
7. `/src/core/factorization/hyperbolaPairs.ts` (68 строк)
8. `/src/core/factorization/counters.ts` (51 строка)
9. `/src/core/factorization/analyzeRadius.ts` (132 строки)
10. `/src/core/factorization/index.ts` (15 строк)
11. `/src/tests/core/factorizationM2.test.ts` (357 строк)
12. `/M2_IMPLEMENTATION_REPORT.md` (127 строк)

---

## 2. Независимая проверка сертификации простоты (Prime Certification)

### 2.1 Математическая корректность порогов и наборов оснований Миллера–Рабина (`primality.ts:23–56`)
Все интервалы в `DETERMINISTIC_BRACKETS` проверены по опубликованным теоремам (Pomerance–Selfridge–Wagstaff; Jaeschke 1993; Zhang 2001; Jiang & Deng 2012; Sorenson & Webster 2015/2017):
- `2_047n` → `[2n]` ($\psi_1 = 2047 = 23 \cdot 89$);
- `1_373_653n` → `[2n, 3n]` ($\psi_2 = 1\,373\,653$);
- `25_326_001n` → `[2n, 3n, 5n]` ($\psi_3 = 25\,326\,001$);
- `3_215_031_751n` → `[2n, 3n, 5n, 7n]` ($\psi_4 = 3\,215\,031\,751$);
- `2_152_302_898_747n` → `[2n..11n]` ($\psi_5$);
- `3_474_749_660_383n` → `[2n..13n]` ($\psi_6$);
- `341_550_071_728_321n` → `[2n..17n]` ($\psi_7 = 10\,670\,053 \cdot 32\,010\,157$);
- `3_825_123_056_546_413_051n` → `[2n..23n]` ($\psi_8 = \psi_9$);
- `318_665_857_834_031_151_167_461n` → `[2n..37n]` (строже $\psi_{11}$, т. к. включает также `37n`);
- `3_317_044_064_679_887_385_961_981n` → `[2n..41n]` (теорема Sorenson & Webster для первых 12 простых `{2..37}`, усиленная 13-м основанием `41n`, полностью согласована с `DESIGN_REVIEW.md §4.1`).

Пользовательский параметр `deterministicMillerRabinMax` жёстко ограничен сверху (`primality.ts:226–229`): поднять предел доказательности выше `3_317_044_064_679_887_385_961_981n` невозможно.

### 2.2 Поведение на `1`, `2`, `3`, чётных, малых простых, псевдопростых и на границе порога
- `n = 1n` → `verdict: 'UNIT'`, `isPrime: false`, `isProven: true` (`primality.ts:245–255`).
- `n = 2n, 3n, ..., 97n` → `SMALL_PRIME_EXACT` (`PROVEN_PRIME`), составные, кратные простым $\le 97$, немедленно отклоняются как `TRIAL_DIVISION_DIVISOR` (`COMPOSITE`).
- **Прямая проверка границы $B = 3\,317\,044\,064\,679\,887\,385\,961\,981$ (выполнена независимым read-only запуском):**
  - Непосредственно ниже $B$: `3317044064679887385961813n` → `PROVEN_PRIME`, `isProven: true`, `basesTested: 13` (`DETERMINISTIC_MILLER_RABIN`).
  - Строго в точке $B$: условие `vn < deterministicThreshold` (`primality.ts:294`) **ложно**, $B$ уходит на 25-раундовый путь, где свидетель `43n` уличает $B$ как `COMPOSITE` (`MILLER_RABIN_WITNESS`).
  - Непосредственно выше $B$: `3317044064679887385962123n` → `PROBABLE_PRIME`, `isPrime: null`, `isProven: false`, `basesTested: 25` (`PROBABILISTIC_MILLER_RABIN`).
- Знаменитые числа Кармайкла (`561`, `1729`, `41041`) и 7-базовое сильное псевдопростое `341550071728321` распознаются как `COMPOSITE`.

### 2.3 Критическая проверка публичной функции `passesMillerRabinBase(n, base)` (`primality.ts:61–99`)
- **Выявлено несоответствие контракта (`M2-AUD-01`, `Medium`):** JSDoc в строке 62 заявляет контракт `for odd n > 2 and base 2 <= a < n`, но строки 72–74 выполняют:
  ```ts
  const a = va % vn;
  if (a === 0n) return true;
  if (a === 1n || a === vn - 1n) return true;
  ```
  В результате вызов `passesMillerRabinBase(15n, 1n)`, `passesMillerRabinBase(15n, 15n)` и `passesMillerRabinBase(15n, 16n)` фактически возвращает **`true`** для заведомо составного числа `15n` (подтверждено прямым запуском!).
- Внутри `certifyPrimality` это не приводит к ошибке: для малых $n$ срабатывает предварительная проверка делимости до `97n` (`primality.ts:258–282`), для детерминированных интервалов стоит `if (base >= vn) continue;` (`primality.ts:305`), а для вероятностного LCG-генератора — `2n + (state % (n - 3n))` (`primality.ts:117–120`), что гарантирует $2 \le a \le n - 2$. Тем не менее внешний контракт функции `passesMillerRabinBase` сейчас не защищён от злоупотребления.

### 2.4 Несогласованность константы `DEFAULT_TRIAL_PROOF_MAX_N` (`primality.ts:58, 285` и `types.ts:112`)
- В `types.ts:112` и `primality.ts:58` заявлен порог `DEFAULT_TRIAL_PROOF_MAX_N = 10_000_000_000n` ($10^{10}$, $\sqrt{n} \le 10^5$), но в `primality.ts:285` зашит жёсткий потолок `vn <= 100_000_000n` ($10^8$). Из-за этого числа из $(10^8, 10^{10}]$ проходят `DETERMINISTIC_MILLER_RABIN` вместо `TRIAL_DIVISION_EXACT` — математически они всё равно получают верный `PROVEN_PRIME`, но документация опции `trialDivisionProofMaxN` расходится с поведением (`M2-AUD-03`).

---

## 3. Проверка факторизации (`primeFactorization.ts`)

1. **Степени двойки (`lines 272–278`):** `twoExponent` выделяется побитовыми сдвигами `remaining >>= 1n` до нечётного остатка; для $n = 1$ даёт `twoExponent = 0n` и пустой список `primeFactors`. Корректно.
2. **Колесо пробного деления $6k \pm 1$ (`lines 281–325`):**
   - Сначала полностью выделяется `3n`.
   - Далее проверяются `d` и `d + 2` до `trialDivisionLimit` с явным счётчиком `nextCandidate`: `nextCandidate = d + 2n` после `d` и `nextCandidate = d + 6n` после `d + 2n` (с `break`, если `d + 2n > trialDivisionLimit`).
   - Вывод о простоте остатка делается **только** при `remaining > 1n && nextCandidate * nextCandidate > remaining`, что математически исключает ложный `PROVEN_PRIME` при урезанном `trialDivisionLimit` (напр., `49n` при `trialDivisionLimit: 6n` корректно отправляется в очередь и раскладывается на `7^2`).
3. **Полные квадраты (`lines 62–64, 337–341`):** перед тестом простоты и в начале `findNonTrivialDivisorBrent` проверяется `isPerfectSquareBigInt(item.value)` через точный `isqrtBigInt` (M1), удваивая показатель `item.exponent * 2n`. Это гарантированно предотвращает застревание Pollard–Brent на больших квадратах вида $p^{2k}$.
4. **Pollard–Brent (`lines 51–170`):** детерминированный вариант с пакетным НОД (`batchSize = 128n`), перебором полиномов `c = 1n, 2n, ...` и откатом при `g === n`. Использует только `BigInt` (`Date.now()` приводится к `BigInt`). Замечание (`M2-AUD-06`): в цикле отката `do ... while (g === 1n)` (`lines 143–155`) проверяется лимит итераций, но не проверяется `deadlineMs` (максимальный перерасход ограничен $\le 128$ шагами НОД).
5. **Распространение кратностей и защита от завышения статуса (`lines 227–266, 360–392`):** при расщеплении `(v, exp)` на `(d, exp)` и `(v/d, exp)` сумма степеней инвариантна. Однако в `addPrime` (`lines 238–242`) при объединении одинакового простого использовано `existing.status === 'PROVEN_PRIME' || status === 'PROVEN_PRIME'`. Хотя при детерминированном `certifyPrimality` расхождение невозможно, логически безопаснее использовать `&&` (не допускать повышения статуса при слиянии — `M2-AUD-05`).
6. **Исчерпание бюджета и реконструкция (`lines 366–459`):**
   - Проверено при `maxPollardIterations: 2n` и `maxDurationMs: 0n` на `1000003n * 1000033n`: в обоих случаях возвращается `certificationStatus: 'INCOMPLETE'`, `isComplete: false`, остаток маркируется `UNFACTORED_COMPOSITE`, предупреждения (`TIME_BUDGET_EXCEEDED` / `POLLARD_ITERATION_LIMIT_REACHED`, `INCOMPLETE_FACTORIZATION`) формируются честно.
   - `reconstructedFromPrimes` и `reconstructedTotal` строго равны произведению `BigInt` степеней; при `PROBABLE_PRIME` статус понижается до `PROBABLE_COMPLETE` с кодом `PROBABLE_PRIME_USED`.
   - **Важное методологическое подтверждение:** сомножители получают `PROVEN_PRIME` **только** через доказательный путь (`SMALL_PRIME_EXACT`, `TRIAL_DIVISION_EXACT` при `nextCandidate^2 > remaining` или `vn <= 10^8`, либо `DETERMINISTIC_MILLER_RABIN` строго ниже `3.317e24`), а не по факту одного лишь обратного произведения.

---

## 4. Полнота генерации делителей (`divisors.ts`)

- `countDivisorsFromFactorization` (`lines 23–38`) и `generateDivisorsFromFactorization` (`lines 44–85`) жёстко отклоняют любую неполную факторизацию (`IncompleteFactorizationError`).
- Порог комбинаторного взрыва (`expectedCount > limit`) проверяется **до** аллокации массива и выбрасывает `CombinatorialLimitError`; внутри `analyzeRadiusNumberTheory` (`analyzeRadius.ts:104–128`) это исключение перехватывается явно: счётчики $\omega^*(r), \tau(r), T(r), N(r)$ сохраняются точными, списки делителей и пар устанавливаются в `null`, а `isDivisorEnumerationComplete` — в `false` с предупреждением `COMBINATORIAL_LIMIT_EXCEEDED`.
- `verifyDivisorsComplete` (`lines 91–120`) проверяет строгое возрастание (`d <= prev`), количество `BigInt(divisors.length) === expectedCount` и фактическую делимость `isDivisibleBigInt(vn, d)` для каждого элемента.

---

## 5. Пары гиперболы (`hyperbolaPairs.ts`)

- Точные условия $xy = 2r^2$, $1 \le x < \sqrt{2}\,r < y \le 2r^2$ проверяются без приближений с плавающей точкой через `x * x >= twoR2` (отсечение верхней ветви), `y = exactDivBigInt(twoR2, x)` и вызов `verifyHyperbolaIdentity(validR, x, y)` из M1 ($x \ge 1, x < y, y \le 2r^2, x^2 < 2r^2 < y^2, xy = 2r^2$).
- Внутри `analyzeRadiusNumberTheory` список `divisorsOfTwoRSquared` предварительно провалидирован на полноту ($\tau(2r^2)$) и строгое возрастание, а `buildHyperbolaDivisorPairs` дополнительно проверяет уникальность `x`, строгое возрастание `prevX < x` и биективное равенство `2n * BigInt(pairs.length) === BigInt(twoRSquaredDivisors.length)`.
- Граничный случай $r = 1 \implies [(1, 2)]$ и эталон $r = 3 \implies [(1, 18), (2, 9), (3, 6)]$ корректны.
- **Выявленный пробел standalone-контракта (`M2-AUD-04`, `Medium`):** если вызвать экспортированную функцию `buildHyperbolaDivisorPairs(3n, [1n, 18n])` **напрямую** вне `analyzeRadiusNumberTheory` с неполным, но симметричным подмножеством делителей, проверка `2n * pairs.length === twoRSquaredDivisors.length` (`2 === 2`) пропустит неполный список из 1 пары вместо 3 (подтверждено прямым запуском!).

---

## 6. Теоретические счётчики (`counters.ts`)

- Требует `rFactorization.isComplete === true` (иначе `IncompleteFactorizationError`).
- Вычисления строго в `BigInt`:
  - $\omega^*(r) = \text{BigInt}(\text{oddPrimeFactors.length})$;
  - $\tau(r) = (e_0 + 1)\prod_{i=1}^s (e_i + 1)$;
  - $\tau(2r^2) = (2e_0 + 2)\prod_{i=1}^s (2e_i + 1)$;
  - $T(r) = 2^{\omega^*(r)}$ (`powBigInt(2n, omegaStar)`);
  - $N(r) = \tau(2r^2) / 2$ (`exactDivBigInt(tauTwoRSquared, 2n)`).
- Полностью согласовано с теоремами Роббинса (2006) и Омланда (2017) в `/MATHEMATICAL_FOUNDATION.md`.

---

## 7. Независимая эталонная проверка (Independent Reference Verification)

Вне тестов самого M2 выполнен независимый read-only прогон наивными эталонными алгоритмами (прямое пробное деление до $\sqrt{r}$, прямой перебор всех $1 \le d \le 2r^2$ с проверкой $2r^2 \bmod d = 0$, независимый расчёт $\omega^*, \tau, T, N$) для **всех $r \in \{1 \dots 30\} \cup \{35, 100\}$**:

- Все 32 радиуса дали **100% посимвольное совпадение** массивов `divisorsOfR`, `divisorsOfTwoRSquared`, `hyperbolaPairs` и всех счётчиков `omegaStar`, `tauR`, `T`, `N` между независимым перебором и `analyzeRadiusNumberTheory(r)`.
- Агрегированные суммы полностью совпали с `/BENCHMARK_DATA_CATALOG.md`:
  - $r = 1\dots 30$: $\sum T(r) = 61$, $\sum N(r) = 174$;
  - $r = 1\dots 100$: $\sum T(r) = 249$, $\sum N(r) = 855$;
  - $r = 235\,416 = 577 \cdot 408$ (Agarwal P27): $T(r) = 8$, $N(r) = 108$.

---

## 8. Особая проверка больших чисел (`> Number.MAX_SAFE_INTEGER`)

- **Числа $> 2^{53}$:** все арифметические операции, циклы и счётчики (включая показатели, $\tau$, `iterationsUsed` и измерение длительности через `BigInt(Date.now())`) работают строго в `BigInt`, без `number`-математики и `Math.*`. Проверено для $r = 2 \cdot 1\,000\,000\,007 \cdot 1\,000\,000\,009 \approx 2 \times 10^{18}$ ($2r^2 > 10^{36}$).
- **Граница $3.317 \times 10^{24}$:** поведение строго разделено — `PROVEN_PRIME` ниже порога и `PROBABLE_PRIME` (с `isPrime: null`, `isProven: false` и предупреждением `PROBABLE_PRIME_USED`) начиная с порога.
- **Ограничения Pollard–Brent и памяти:** произвольно большие трудные полупростые числа ($> 10^{25}$ без малых множителей) не гарантируются к полному разложению за ограниченное время, что явно моделируется через `maxPollardIterations` (`300_000n`), `maxDurationMs` (`2_500n` мс) и `UNFACTORED_COMPOSITE`; комбинаторный взрыв числа делителей ограничивается через `maxDivisorEnumerationCount` (`500_000n`).

---

## 9. Реестр замечаний и рекомендаций (без внесения правок)

| ID | Серьёзность | Файл и строки | Математическое / техническое объяснение | Влияние на будущий M3 | Рекомендуемое исправление |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`M2-AUD-01`** | `Medium` | `src/core/factorization/primality.ts:61–99` | Публичная функция `passesMillerRabinBase(n, base)` документирует $2 \le a < n$, но выполняет `a = va % vn` и возвращает `true` при `a === 0n` или `a === 1n` (в частности, для составного `n = 15n` при `base = 1n, 15n, 16n` возвращает `true`). | **Отсутствует при вызове через `certifyPrimality`**, т. к. внутренние пути гарантируют $2 \le a \le n - 2$ и предварительно проверяют простые $\le 97$. Опасно только при прямом внешнем вызове `passesMillerRabinBase` в тестах или будущих модулях. | Добавить явную валидацию `if (va < 2n \|\| va >= vn)` (выброс `InvalidFactorizationInputError`) или явно возвращать ошибку для оснований вне $[2, n - 1]$ (при $n > 2$). |
| **`M2-AUD-02`** | `Medium` | `src/core/factorization/hyperbolaPairs.ts:20–67` | Standalone-функция `buildHyperbolaDivisorPairs(r, twoRSquaredDivisors)` проверяет `2n * BigInt(pairs.length) === BigInt(twoRSquaredDivisors.length)`, но не сверяет длину списка делителей с $\tau(2r^2)$. При прямом вызове с неполным симметричным набором (напр., `[1n, 18n]` для $r = 3$) возвращает неполный список пар без ошибки. | **Отсутствует при вызове через `analyzeRadiusNumberTheory`**, т. к. `generateDivisorsFromFactorization` заранее гарантирует длину $\tau(2r^2)$. Риск возникает только при ручном прямом вызове `buildHyperbolaDivisorPairs` из M3. | Добавить опциональный (или обязательный) параметр `expectedDivisorCount?: bigint` / принимать `TwoRSquaredFactorization`, либо явно зафиксировать в M3 использование `analyzeRadiusNumberTheory`. |
| **`M2-AUD-03`** | `Medium` | `src/core/factorization/primality.ts:58, 285` и `types.ts:112` | Константа `DEFAULT_TRIAL_PROOF_MAX_N` равна `10_000_000_000n` ($10^{10}$), но условие в строке 285 зашивает потолок `vn <= 100_000_000n` ($10^8$). Начиная с $10^8 + 1$ `certifyPrimality` переключается на детерминированный Миллер–Рабин вместо пробного деления, игнорируя диапазон $(10^8, 10^{10}]$ в `trialDivisionProofMaxN`. | **Нулевое влияние на корректность** (оба пути возвращают математически доказанный `PROVEN_PRIME`). Несогласованность только в контракте настройки `trialDivisionProofMaxN`. | Убрать жёсткий предел `&& vn <= 100_000_000n` (управляя порогом только через `trialProofMaxN`) или привести константу и JSDoc в `types.ts` к `100_000_000n`. |
| **`M2-AUD-04`** | `Low` | `src/core/factorization/primality.ts:116–123` | При `probablePrimeRounds > 25n` LCG-генератор дополнительных оснований для вероятностного Миллера–Рабина может сгенерировать основание, уже протестированное в первых 25 фиксированных простых (`PROBABLE_PRIME_FIXED_BASES`). | Не снижает точность, лишь возможен дублирующий раунд при нестандартном `probablePrimeRounds > 25n`. | При генерации дополнительных оснований пропускать значения, уже входящие в `Set` протестированных оснований. |
| **`M2-AUD-05`** | `Low` | `src/core/factorization/primeFactorization.ts:238–242` | В `addPrime` при слиянии кратностей одинакового простого использовано логическое «ИЛИ» (`existing.status === 'PROVEN_PRIME' \|\| status === 'PROVEN_PRIME'`). Если бы по какой-то ошибке два пути дали разные статусы, приоритет получил бы `PROVEN_PRIME`. | Практически недостижимо, т. к. `certifyPrimality` детерминирован для фиксированных `(p, options)`. | Использовать `&&` (или проверку консистентности статусов), чтобы статус сертификации никогда не мог повышаться при слиянии. |
| **`M2-AUD-06`** | `Low` | `src/core/factorization/primeFactorization.ts:143–155` и `src/tests/core/factorizationM2.test.ts` | 1) В цикле отката Pollard–Brent (`do ... while (g === 1n)`) проверяется лимит итераций, но не проверяется `deadlineMs` (ограничено максимум 128 шагами).<br>2) В `factorizationM2.test.ts` отсутствуют прямые тесты для `passesMillerRabinBase` (включая `base >= n`), окрестности самой границы $3.317 \times 10^{24}$ ($B - k, B, B + k$) и прямого вызова `verifyDivisorsComplete`. | Не влияет на математическую корректность M3 при соблюдении бюджета и контрактов. | Добавить проверку `nowMsBigInt() >= deadlineMs` в цикл отката и расширить `factorizationM2.test.ts` перечисленными граничными тестами. |

---

## 10. Итоговое заключение по готовности к M3

Модуль **M2 (`src/core/factorization/`)** математически корректен, воспроизводим, изолирован от `float64`/`Math.*`/UI и честно разграничивает `PROVEN_PRIME`, `PROBABLE_PRIME` и `UNFACTORED_COMPOSITE`. Все 32 проверенных независимым перебором радиуса ($1\dots 30, 35, 100$) и граничные проверки вокруг $3.317 \times 10^{24}$ подтвердили полное совпадение факторизаций, делителей, пар гиперболы и счётчиков $T(r), N(r)$.

**Переход к реализации M3 (`Classification Engine`) разрешён** (при условии, что M3 использует `analyzeRadiusNumberTheory` как единую точку получения факторизации и пар гиперболы и сохраняет независимость будущего верификатора M6 от M2/M3). Замечания `M2-AUD-01`–`M2-AUD-06` рекомендуется устранить небольшим рефакторинговым патчем перед финализацией ядра.
