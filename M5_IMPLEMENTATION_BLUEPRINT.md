# M5_IMPLEMENTATION_BLUEPRINT — Архитектурный аудит и поэтапный план внедрения M5

**Проект:** `pythagorean-Triples-inradius-lab` (Pythagoras Triples Inradius Classification Laboratory)  
**Этап:** **M5 — Passports & Matrices** (`ClassPassport`, `ClassMatrix`, `RangeCatalog`)  
**Дата подготовки:** `2026-11-28`  
**Базовая линия:** `M4_STRUCTURAL_FACETS_FINAL` (`M1–M4` завершены и заморожены)

---

## 1. Executive Summary

Этап **M5 (Passports & Matrices)** представляет собой **слой агрегации, паспортизации и многопризнаковой табличной материализации** поверх замороженных и верифицированных вычислительных слоёв **M1–M4** (`Exact Core` → `Number Theory Engine` → `Classification Engine` → `Structural Facets`).

Ключевой принцип архитектуры M5: **строгое нулевое дублирование** алгоритмов M1–M4. Модуль `src/core/passports/` не повторяет факторизацию M2, не дублирует реконструкцию троек и евклидовых параметров M3, не пересчитывает координаты Спорна (`M4-S1`), дерево Берггрена (`M4-S2`) и агрегаты профиля класса (`M4-S3`), а объединяет их в два детерминированных артефакта:
1. **`ClassPassport` (`CL-R{r}-D{2r}`)** — целостный математический паспорт класса $C(r)$.
2. **`ClassMatrix` (`PT-R{r}-K{k}-X{x}`)** — многопризнаковая матрица троек класса $C(r)$ с единым каркасом строки и модульной `Full` / `Lazy` материализацией шести категорий признаков.

Аудит фактического кода репозитория показал, что **евклидовы параметры `(m, n, u, v)` уже реализованы в M3** (`recoverEuclideanParameters`), полупериметр должен вычисляться по исправленной формуле $p = 3r + x + y = c + r$, а по четырём открытым вопросам (**Q1 `asymQ`**, **Q2 `float64`**, **Q3 `euclid`**, **Q4 `transversals`**) требуется явное проектное утверждение до начала написания кода.

---

## 2. Repository Audit (Phase 0)

Аудит выполнен непосредственно по исходным файлам `src/core/exact/`, `src/core/factorization/`, `src/core/classification/` и `src/core/facets/`.

### 2.1 Реальные контракты существующих слоёв M1–M4

| Компонент | Реальный контракт (по коду) | Что M5 может использовать | Ограничения |
| :--- | :--- | :--- | :--- |
| **M1 Exact Core** (`src/core/exact/`) | `BigInt`-математика (`isqrtBigInt`, `exactSqrtBigInt`, `gcdBigInt`, `lcmBigInt`, `powBigInt`, `exactDivBigInt`), `ExactRational` (`createRational`, `add/sub/mul/divRational`, `cmp/eq/lt/lte/gt/gteRational`, `formatRational`), `radiusPrimitives` (`computeDiameter`, `computeTwoRSquared`, `verifyHyperbolaIdentity`, `verifyPythagoreanIdentity`). | Вся точная `BigInt` и `ExactRational` арифметика, сравнения, форматирование и базовые проверки тождеств. | Строго запрещены `Number()`, `Math.*`, `parseFloat`, `parseInt`, `float64`. |
| **M2 Number Theory Engine** (`src/core/factorization/`) | `analyzeRadiusNumberTheory(r, options): RadiusNumberTheoryResult` возвращает `radius`, `diameter`, `twoRSquared`, `rFactorization` (`twoExponent`, `oddPrimeFactors`, `certificationStatus`), `twoRSquaredFactorization`, `certificationStatus` (`'PROVEN_COMPLETE' \| 'PROBABLE_COMPLETE' \| 'INCOMPLETE'`), `isFactorizationComplete`, `isDivisorEnumerationComplete`, `divisorsOfR`, `counters: { omegaStar, tauR, tauTwoRSquared, T, N }`, `hyperbolaPairs`, `warnings`. | Прямой источник `rFactorization`, `certificationStatus`, счётчиков $\omega^*(r), \tau(r), \tau(2r^2), T(r), N(r)$ и `divisorsOfR`. | При `INCOMPLETE` или превышении `maxDivisorEnumerationCount` (`500_000n`) `counters` или `hyperbolaPairs` могут быть `null`. M5 не должен перефакторизовывать $r$. |
| **M3 Classification Engine** (`src/core/classification/`) | `classifyRadius(r): RadiusClassificationResult` возвращает `{ r, totalTriplesCount, expectedTotalCount, isComplete, subclasses: SubclassGroup[], allTriples: PythagoreanTriple[], warnings }`. Каждый `PythagoreanTriple` содержит `{ r, D, x, y, a, b, c, k, isPrimitive, primitiveRadius, primitiveAncestor, classId, tripleId, primId, euclideanParams?: { m, n, u, v } }`. Также экспортируется `recoverEuclideanParameters(x0, y0)`. | Каркас строк матрицы, канонические ID (`CL-R{r}-D{2r}`, `PT-R{r}-K{k}-X{x}`, `PT-R{r/k}-K1-X{x/k}`), разбиение на подклассы $C_k(r)$, `euclideanParams` (`n = u`, `m = u + v`). | Интерфейс `RadiusClassificationResult` **не** содержит поля `status` и **не** пробрасывает `rFactorization`, `certificationStatus`, `omegaStar`, `tauR`, `tauTwoRSquared` из M2. Поле `euclideanParams` в типе опционально (`?`), хотя `classifyTriple` всегда его заполняет. |
| **M4-S1 `SpornFacet`** (`src/core/facets/spornFacet.ts`) | `computeSpornFacetForTriple`, `computeSpornFacetsForClass` → `SpornFacetResult`: `{ tripleId, classId, primId, r, k, isPrimitive, x, y, spornX, spornY, spornZone, rayBaseR0, parityCase, tanHalfA, tanHalfB, sinA, cosA, tanA, formT, asymQ, normS, normP }`. Инварианты `SF-INV-01..06`. | `spornX`, `spornY`, `spornZone`, `rayBaseR0`, `parityCase`, `sinA (= a/c)`, `cosA (= b/c)`, `tanA (= a/b)`, `tanHalfA/B`, `formT`, `normS`, `normP = 2 * normS`, `asymQ`. | При `!classification.isComplete` выбрасывает `IncompleteClassificationError`. `Q1 = CLOSED` — M5 наследует `asymQ = (b-a)/(a+b)` из замороженного `M4-S1` без переопределения. |
| **M4-S2 `BerggrenFacet`** (`src/core/facets/berggrenFacet.ts`) | `computeBerggrenFacetForTriple`, `computeBerggrenFacetsForClass` → `BerggrenFacetResult`: `{ tripleId, classId, primId, r, k, isPrimitive, appliesToPrimitiveAncestor, primitiveAncestor, isRoot, canonWord, rawWord, treeDepth, parentOperator, parentId, children }`. Инварианты `BF-INV-01..06`. | `canonWord`, `rawWord`, `treeDepth`, `parentOperator`, `parentId`, `appliesToPrimitiveAncestor`, `children`. | В `BerggrenFacetResult` флаг `legSwapped` присутствует в `children.{A1,A2,A3}`, но отсутствует на верхнем уровне текущей тройки (восстанавливается как `parentOperator === 'A2' \|\| parentOperator === 'A3'`). Сложность — $O(d)$ на тройку ($d \le r_0 - 1$). |
| **M4-S3 `ClassProfileFacet`** (`src/core/facets/classProfileFacet.ts`) | `buildClassProfileFacet(classification, spornFacets, berggrenFacets)` → `ClassProfileFacetResult`: `{ classId, r, cMin, cMax, cMinRatio, hasSub5rCompression, spornXMin, spornXMax, allTriples: ClassPopulationMetrics, primitiveTriples: PrimitivePopulationMetrics }`. Инварианты `CPF-INV-01..12`. | Готовые агрегаты класса, экстремумы гипотенузы и $\tilde{x}$, сжатие `< 5r`, гистограммы зон, точные средние `meanSpornX`, `meanADivC`, глубины Берггрена строго по ППТ. | M5 не должен пересчитывать эти метрики. Принимает только полные классы с 1-to-1 биекцией `tripleId`. |

### 2.2 Явные расхождения между черновиком `v0.1` и фактическим репозиторием

1. **Евклидовы параметры `(m, n, u, v)`:** черновик `v0.1` предполагал необходимость отдельного расчёта `(m, n, u, v)` через `isqrtBigInt` в M5. **Факт:** `recoverEuclideanParameters(x0, y0)` уже реализована в `src/core/classification/recoverEuclideanParameters.ts` и вызывается для каждой тройки в `classifyTriple.ts` (поле `triple.euclideanParams`).
2. **Опечатка полупериметра $p$:** в ранней заметке `v0.1` указано $p = 2r + x + y$. **Факт:** при $a = 2r + x$, $b = 2r + y$, $c = 2r + x + y$ полупериметр равен $p = \frac{a+b+c}{2} = 3r + x + y = c + r$, а полный периметр $P = 2p = 6r + 2x + 2y$ (согласовано с `normP = 2 * normS` в `M4-S1`).
3. **Групповые кортежи (`AUD-01`):** в черновике `v0.1` признаки сводились в кортежи (`div3_leg, div4_leg, div5_side`, `a, b, c, S, p, P...`). В настоящей спецификации все поля развёрнуты индивидуально.
4. **Верхнеуровневый признак перестановки катетов (`treeLegSwapped`):** в `BerggrenFacetResult` отсутствует прямое верхнеуровневое поле `legSwapped`, поэтому M5 выводит `treeLegSwapped` из `parentOperator === 'A2' || parentOperator === 'A3'`.
5. **Отсутствие `status` и M2-счётчиков в `RadiusClassificationResult`:** в отличие от предположений `v0.1`, тип `RadiusClassificationResult` содержит только `isComplete`, без поля `status` и без $\omega^*(r), \tau(r), \tau(2r^2), \text{certificationStatus}$.
6. **Трансверсальная формула `commonLegPrimA`:** оценка $2^{\omega(a)-1}$ из `v0.1` математически неточна для *меньшего* катета $a$, так как считает ППТ с заданным катетом в *любой* позиции ($a$ или $b$), а для $k > 1$ не определена без выбора между $a$ и $a_0$.
7. **Градусные углы `float64`:** включение `angle_A_deg`, `angle_B_deg` в ядро матрицы конфликтует с политикой нулевого `float64` в `src/core/`.

---

## 3. M5 Architecture

Модуль M5 размещается в `src/core/passports/` с соблюдением строго ациклического графа зависимостей:

```text
M1 (exact) ◄── M2 (factorization) ◄── M3 (classification) ◄── M4 (facets: S1, S2, S3) ◄── M5 (passports)
```

### Основные структурные блоки M5
1. **`euclidAdapter.ts`** — бездубликатное извлечение `EuclideanParameters` из `PythagoreanTriple.euclideanParams` с fallback на `recoverEuclideanParameters` (M3).
2. **`classPassport.ts` (`M5-S1`)** — сборка `ClassPassportResult` (`CL-R{r}-D{2r}`) поверх M2 + M3 + M4-S3.
3. **`classMatrix.ts` (`M5-S2`)** — построение `ClassMatrix` (`PT-R{r}-K{k}-X{x}`) в режимах `FullClassMatrix` и `LazyClassMatrix` с модульными группами столбцов.
4. **`rangeCatalog.ts` (`M5-S3`)** — последовательная агрегация паспортов по диапазону $[r_{\min}, r_{\max}]$ с явной фиксацией `INCOMPLETE`-классов.
5. **Внешний проекционный адаптер `displayProjection` (за пределами `src/core/passports/`, для M7/M8)** — опциональный расчёт градусных углов `angleADeg`, `angleBDeg` (`float64`).

### Запрещённые зависимости для `src/core/passports/`
Запрещены: `React`, DOM/SVG, `Math.*`, `Number()`, `parseFloat`, `parseInt`, `Float64Array`, перефакторизация $r$ в обход M2, пересчёт `SpornFacet`/`BerggrenFacet`/`ClassProfileFacet`, логика `M6` (`CHK-01..12`) и `Price tree`.

---

## 4. Class Passport Specification (`CL-R{r}-D{2r}`)

### 4.1 Граница ответственности между `ClassProfileFacet` (M4-S3) и `ClassPassport` (M5)
`ClassPassport` **не дублирует** вычисления `M4-S3`:
- **Из `M4-S3` (`ClassProfileFacetResult`) напрямую встраивается:** `profile` (`cMin`, `cMax`, `cMinRatio`, `hasSub5rCompression`, `spornXMin`, `spornXMax`, `allTriples`, `primitiveTriples`).
- **Из `M2` (`RadiusNumberTheoryResult`) включается:** `certificationStatus`, `rFactorization` (`twoExponent`, `oddPrimeFactors`, `isComplete`), `counters` (`omegaStar`, `tauR`, `tauTwoRSquared`, `T`, `N`), `divisorsOfR`.
- **Из `M3` (`RadiusClassificationResult`) включается:** `subclassSpectrum` (список `{ k, primitiveRadius, count, expectedCount, isCardinalityMatch }` для каждого $k \mid r$).
- **Собственный слой `M5`:** кросс-модульная сверка согласованности M2 ↔ M3 ↔ M4-S3, статус полноты паспорта (`COMPLETE | INCOMPLETE`) и метаданные привязки к матрице (`expectedMatrixSummary`).

### 4.2 Поля `ClassPassportResult`

| Поле | Тип | Источник | Описание / Инвариант |
| :--- | :--- | :---: | :--- |
| `specVersion` | `'0.1'` | M5 | Версия спецификации контракта паспорта. |
| `classId` | `string` | M3 / M4-S3 | Канонический идентификатор `CL-R{r}-D{2r}`. |
| `r` | `bigint` | M2 / M3 | Радиус вписанной окружности ($r \ge 1\text{n}$). |
| `D` | `bigint` | M1 / M2 | Диаметр вписанной окружности ($D = 2r$). |
| `twoRSquared` | `bigint` | M1 / M2 | Гиперболическая константа $2r^2$. |
| `status` | `'COMPLETE' \| 'INCOMPLETE'` | M5 | Сводный статус вычислительной полноты паспорта. |
| `isComplete` | `boolean` | M5 | Строго `status === 'COMPLETE'`. |
| `certificationStatus` | `FactorizationCertificationStatus` | M2 | Математическая сертификация: `'PROVEN_COMPLETE' \| 'PROBABLE_COMPLETE' \| 'INCOMPLETE'`. |
| `isDivisorEnumerationComplete` | `boolean` | M2 | Завершённость перечисления делителей в M2. |
| `numberTheory` | `PassportNumberTheorySummary` | M2 | `{ twoExponent, oddPrimeFactors, omegaStar, tauR, tauTwoRSquared, T, N, divisorsOfR }`; сохраняет доступные частичные данные M2 при `INCOMPLETE` (невычисленные поля — `null`). |
| `subclassSpectrum` | `readonly SubclassSpectrumEntry[]` | M3 | `{ k, primitiveRadius, actualCount, expectedCount, isCardinalityMatch }[]`, отсортировано по `k` $\uparrow$; `[]` при `INCOMPLETE`. |
| `profile` | `ClassProfileFacetResult \| null` | M4-S3 | Вложенный замороженный профиль класса из M4-S3; строго `null` при `!isComplete`. |
| `expectedMatrixSummary` | `ExpectedMatrixSummary` | M5 | `{ rowCount, isSortedByX, firstTripleId, lastTripleId }` (`rowCount: null`, `isSortedByX: false`, `firstTripleId: null`, `lastTripleId: null` при `INCOMPLETE`). |
| `warnings` | `readonly string[]` | M2 / M3 | Объединённый диагностический журнал предупреждений без сокрытия `PROBABLE_PRIME` и лимитов. |

### 4.3 Инварианты целостности паспорта (`CP-INV-01..08`)
- **`CP-INV-01`:** `r >= 1n`, `D === 2n * r`, `twoRSquared === 2n * r * r`, `classId === CL-R{r}-D{2r}`.
- **`CP-INV-02`:** `isComplete === (status === 'COMPLETE')`; при `COMPLETE` требуются `certificationStatus !== 'INCOMPLETE'`, `isDivisorEnumerationComplete === true` и `profile !== null`.
- **`CP-INV-03`:** При `COMPLETE` все счётчики `numberTheory` и `divisorsOfR` не `null` и удовлетворяют точным формулам $T = 2^{\omega^*(r)}$, $N = (e_0+1)\prod(2e_i+1)$, $\tau(r)$, $\tau(2r^2) = 2N$.
- **`CP-INV-04`:** Полнота и строгая сортировка `subclassSpectrum` по возрастанию $k$, длина $\tau(r)$, $k \cdot r_0 = r$, совпадение кардинальностей и $\sum g.\text{actualCount} = N$.
- **`CP-INV-05`:** Согласованность вложенного профиля M4-S3: `profile.r === r`, `profile.classId === classId`, `profile.allTriples.count === N`, `profile.primitiveTriples.count === T`.
- **`CP-INV-06`:** Для `COMPLETE` проверяется `expectedMatrixSummary`: `rowCount === N`, `isSortedByX === true` (строгая сортировка `classification.allTriples` по возрастанию `x`), ненулевые `firstTripleId` и `lastTripleId`.
- **`CP-INV-07`:** Для `INCOMPLETE` строго проверяются `profile === null`, `subclassSpectrum.length === 0`, `expectedMatrixSummary.rowCount === null`, `isSortedByX === false`, `firstTripleId === null`, `lastTripleId === null` (при сохранении доступных частичных данных M2 в `numberTheory`).
- **`CP-INV-08`:** Вычислительная полнота (`COMPLETE`) отделена от математической сертификации M2: при `certificationStatus === 'PROBABLE_COMPLETE'` и полных M3/M4-S3 паспорт остаётся `COMPLETE`.
- *(Все результирующие объекты и вложенные массивы `ClassPassportResult` и `resolveEuclideanParameters` замораживаются через `Object.freeze`.)*

---

## 5. Class Matrix Specification (`PT-R{r}-K{k}-X{x}`)

Матрица класса `ClassMatrix` представляет все $N(r)$ троек класса $C(r)$, строго отсортированных по возрастанию гиперболического сдвига $x$.

### 5.1 Структура строки и группы столбцов
1. **Обязательный каркас (`CORE` + `INDEX`):** всегда доступен сразу (`rowIdx`, `tripleId`, `classId`, `primId`, `r`, `x`, `y`, `a`, `b`, `c`, `k`, `isPrimitive`).
2. **Ленивые модульные группы (`MatrixColumnGroup`):**
   - `'ARITH'`: `gcdSides`, `aEven`, `div3Leg`, `div4Leg`, `div5Side`.
   - `'EUCLID'`: `euclidU`, `euclidV`, `euclidM`, `euclidN`.
   - `'GEOM'`: `D`, `areaS`, `semiPerimeter`, `perimeter`, `aDivC`, `bDivC`.
   - `'SPORN'`: `spornX`, `spornY`, `spornZone`, `rayBaseR0`, `parityCase`, `tanHalfA`, `tanHalfB`, `tanA`, `formT`, `asymQ`, `normS`, `normP`.
   - `'BERGGREN'`: `canonWord`, `rawWord`, `treeDepth`, `parentOperator`, `treeLegSwapped`, `appliesToPrimitiveAncestor`.
   - `'TRANSVERSAL'` *(отложенная/опциональная, только после закрытия Q4)*: `commonLegPrimA`, `commonHypPrimC`.

---

## 6. Полная таблица полей матрицы (Категории 1–6, закрытие `AUD-01`)

Каждое поле развёрнуто индивидуально (без групповых кортежей).

### Категория 1. Идентификационные поля

| Поле | Источник | Точная формула / правило | Единица измерения | Тип точности | Обязательность | Режим вычисления | Зависимости |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `rowIdx` | M5 | Порядковый индекс строки при сортировке $x \uparrow$: $0\text{n} \dots N-1\text{n}$ | индекс ($L^0$) | `bigint` | Обязательно | `eager (INDEX)` | `x` (порядок в $C(r)$) |
| `tripleId` | M3 | `PT-R{r}-K{k}-X{x}` (без ведущих нулей) | идентификатор | `string` | Обязательно (Каркас) | `eager (CORE)` | `r`, `k`, `x` |
| `classId` | M3 | `CL-R{r}-D{2r}` (без ведущих нулей) | идентификатор | `string` | Обязательно (Каркас) | `eager (CORE)` | `r` |
| `primId` | M3 | `PT-R{r/k}-K1-X{x/k}` (идентификатор примитивного предка) | идентификатор | `string` | Обязательно (Каркас) | `eager (CORE)` | `r`, `k`, `x` |

### Категория 2. Арифметические поля

| Поле | Источник | Точная формула / правило | Единица измерения | Тип точности | Обязательность | Режим вычисления | Зависимости |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `x` | M3 | $x = a - 2r = c - b$ ($1 \le x < \sqrt{2}\,r$) | длина ($L^1$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | M2 `hyperbolaPairs` |
| `y` | M3 | $y = \frac{2r^2}{x} = b - 2r = c - a$ ($y > x$) | длина ($L^1$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | `r`, `x` |
| `k` | M3 | $k = \gcd(a, b, c) = \gcd(x, y)$ ($k \mid r$) | масштаб ($L^0$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | `a`, `b`, `c` |
| `isPrimitive` | M3 | $k === 1\text{n}$ | логическая | `boolean` | Обязательно (Каркас) | `eager (CORE)` | `k` |
| `gcdSides` | M5 (`ARITH`) | $\gcd(\gcd(a, b), c)$ (сверка с `k` для M6) | масштаб ($L^0$) | `bigint` | В группе `ARITH` | `lazy (ARITH)` | `a`, `b`, `c` |
| `aEven` | M5 (`ARITH`) | $(a \bmod 2\text{n}) === 0\text{n}$ | логическая | `boolean` | В группе `ARITH` | `lazy (ARITH)` | `a` |
| `div3Leg` | M5 (`ARITH`) | $(a \bmod 3\text{n} === 0\text{n}) \lor (b \bmod 3\text{n} === 0\text{n})$ | логическая | `boolean` | В группе `ARITH` | `lazy (ARITH)` | `a`, `b` |
| `div4Leg` | M5 (`ARITH`) | $(a \bmod 4\text{n} === 0\text{n}) \lor (b \bmod 4\text{n} === 0\text{n})$ | логическая | `boolean` | В группе `ARITH` | `lazy (ARITH)` | `a`, `b` |
| `div5Side` | M5 (`ARITH`) | $(a \bmod 5\text{n} === 0\text{n}) \lor (b \bmod 5\text{n} === 0\text{n}) \lor (c \bmod 5\text{n} === 0\text{n})$ | логическая | `boolean` | В группе `ARITH` | `lazy (ARITH)` | `a`, `b`, `c` |

### Категория 3. Параметрические поля (Евклид)

| Поле | Источник | Точная формула / правило | Единица измерения | Тип точности | Обязательность | Режим вычисления | Зависимости |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `euclidU` | M3 (`EUCLID`) | $u = \sqrt{\text{even}(x_0, y_0)/2}$, где $x_0=x/k,\; y_0=y/k$ | безразм. параметр ($L^0$) | `bigint` | В группе `EUCLID` | `lazy (EUCLID)` | `x`, `y`, `k` |
| `euclidV` | M3 (`EUCLID`) | $v = \sqrt{\text{odd}(x_0, y_0)}$ ($v$ нечётно, $\gcd(u,v)=1$) | безразм. параметр ($L^0$) | `bigint` | В группе `EUCLID` | `lazy (EUCLID)` | `x`, `y`, `k` |
| `euclidM` | M3 (`EUCLID`) | $m = u + v$ ($m > n > 0$, $\gcd(m,n)=1$, $2 \nmid (m-n)$) | безразм. параметр ($L^0$) | `bigint` | В группе `EUCLID` | `lazy (EUCLID)` | `euclidU`, `euclidV` |
| `euclidN` | M3 (`EUCLID`) | $n = u$ ($r_0 = n(m-n) = uv$) | безразм. параметр ($L^0$) | `bigint` | В группе `EUCLID` | `lazy (EUCLID)` | `euclidU` |

### Категория 4. Геометрические поля

| Поле | Источник | Точная формула / правило | Единица измерения | Тип точности | Обязательность | Режим вычисления | Зависимости |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `a` | M3 | $a = 2r + x$ (меньший катет, $0 < a < b$) | длина ($L^1$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | `r`, `x` |
| `b` | M3 | $b = 2r + y$ (больший катет) | длина ($L^1$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | `r`, `y` |
| `c` | M3 | $c = 2r + x + y$ (гипотенуза) | длина ($L^1$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | `r`, `x`, `y` |
| `r` | M3 | $r = (a + b - c)/2$ (радиус вписанной окружности) | длина ($L^1$) | `bigint` | Обязательно (Каркас) | `eager (CORE)` | Вход класса |
| `D` | M3 / M5 (`GEOM`) | $D = 2r = a + b - c$ | длина ($L^1$) | `bigint` | В группе `GEOM` | `lazy (GEOM)` | `r` |
| `areaS` | M5 (`GEOM`) | $S = \frac{ab}{2} = r \cdot (3r + x + y)$ | площадь ($L^2$) | `bigint` | В группе `GEOM` | `lazy (GEOM)` | `a`, `b` |
| `semiPerimeter` | M5 (`GEOM`) | $p = \frac{a + b + c}{2} = 3r + x + y = c + r$ | длина ($L^1$) | `bigint` | В группе `GEOM` | `lazy (GEOM)` | `a`, `b`, `c` |
| `perimeter` | M5 (`GEOM`) | $P = a + b + c = 2p = 6r + 2x + 2y$ | длина ($L^1$) | `bigint` | В группе `GEOM` | `lazy (GEOM)` | `a`, `b`, `c` |
| `aDivC` | M4-S1 (`sinA`) | $\frac{a}{c} = \sin A$ | безразм. ($L^0$) | `ExactRational` | В группе `GEOM` | `lazy (GEOM)` | `sporn.sinA` (или `a, c`) |
| `bDivC` | M4-S1 (`cosA`) | $\frac{b}{c} = \cos A$ | безразм. ($L^0$) | `ExactRational` | В группе `GEOM` | `lazy (GEOM)` | `sporn.cosA` (или `b, c`) |
| `angleADeg` *(проекция)* | M7/M8 (`displayProjection`) | $\operatorname{atan2}(a, b) \cdot \frac{180}{\pi}$ | градусы ($\deg$) | `float64` *(вне ядра M5)* | Опционально в UI/экспорте | Вне ядра M5 | `a`, `b` (**Q2**) |
| `angleBDeg` *(проекция)* | M7/M8 (`displayProjection`) | $90 - \angle A$ | градусы ($\deg$) | `float64` *(вне ядра M5)* | Опционально в UI/экспорте | Вне ядра M5 | `angleADeg` (**Q2**) |

### Категория 5. Структурные поля (`SpornFacet` ← M4-S1)

| Поле | Источник | Точная формула / правило | Единица измерения | Тип точности | Обязательность | Режим вычисления | Зависимости |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `spornX` | M4-S1 | $\tilde{x} = \frac{x}{r} \in \mathbb{Q} \cap (0, \sqrt{2})$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `x`, `r` |
| `spornY` | M4-S1 | $\tilde{y} = \frac{y}{r} = \frac{2}{\tilde{x}}$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `y`, `r` |
| `spornZone` | M4-S1 | Целочисленный 4-зонный классификатор по $(x, r)$ | категория | `'Z0_ROOT' \| 'Z1_A1' \| 'Z2_A2' \| 'Z3_A3'` | В группе `SPORN` | `lazy (SPORN)` | `x`, `r` |
| `rayBaseR0` | M4-S1 | $r_0 = \frac{r}{k}$ (базовый радиус примитивного луча) | длина ($L^1$) | `bigint` | В группе `SPORN` | `lazy (SPORN)` | `r`, `k` |
| `parityCase` | M4-S1 | Чётность $x_0 = \frac{x}{k}$ (`'X0_ODD' \| 'X0_EVEN'`) | категория | `SpornParityCase` enum | В группе `SPORN` | `lazy (SPORN)` | `x`, `k` |
| `tanHalfA` | M4-S1 | $\tan(A/2) = \frac{r}{r + y} = \frac{1}{\tilde{y} + 1}$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `r`, `y` |
| `tanHalfB` | M4-S1 | $\tan(B/2) = \frac{r}{r + x} = \frac{1}{\tilde{x} + 1}$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `r`, `x` |
| `tanA` | M4-S1 | $\tan A = \frac{a}{b}$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `a`, `b` |
| `formT` | M4-S1 | $t = \frac{b}{a} > 1$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `a`, `b` |
| `asymQ` | M4-S1 | $q = \frac{b - a}{a + b} = \frac{t - 1}{t + 1}$ *(наследуется из M4-S1; `Q1 = CLOSED`)* | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `a`, `b` (**Q1 = CLOSED**) |
| `normS` | M4-S1 | $\frac{S}{r^2} = 3 + \tilde{x} + \tilde{y}$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `spornX`, `spornY` |
| `normP` | M4-S1 | $\frac{P}{r} = 6 + 2\tilde{x} + 2\tilde{y} = 2 \cdot \text{normS}$ | безразм. ($L^0$) | `ExactRational` | В группе `SPORN` | `lazy (SPORN)` | `normS` |

### Категория 6. Генеративные и трансверсальные поля (`BerggrenFacet` ← M4-S2 + опц. Q4)

| Поле | Источник | Точная формула / правило | Единица измерения | Тип точности | Обязательность | Режим вычисления | Зависимости |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `canonWord` | M4-S2 | Слово от `(3,4,5)` с канонизацией $a < b$ на каждом шаге | последовательность | `readonly BerggrenOperator[]` | В группе `BERGGREN` | `lazy (BERGGREN)` | `primitiveAncestor` |
| `rawWord` | M4-S2 | Слово без перестановок (сопряжение $A_1 \leftrightarrow A_3$) | последовательность | `readonly BerggrenOperator[]` | В группе `BERGGREN` | `lazy (BERGGREN)` | `canonWord` |
| `treeDepth` | M4-S2 | $d = \|\text{canonWord}\|$ ($0 \le d \le r_0 - 1$) | глубина ($L^0$) | `bigint` | В группе `BERGGREN` | `lazy (BERGGREN)` | `canonWord` |
| `parentOperator` | M4-S2 | Последний оператор `canonWord` (`null` для `(3,4,5)`) | оператор | `BerggrenOperator \| null` | В группе `BERGGREN` | `lazy (BERGGREN)` | `primitiveAncestor` |
| `treeLegSwapped` | M5 ← M4-S2 | `parentOperator === 'A2' \|\| parentOperator === 'A3'` | логическая | `boolean` | В группе `BERGGREN` | `lazy (BERGGREN)` | `parentOperator` |
| `appliesToPrimitiveAncestor` | M4-S2 | `!isPrimitive` ($k > 1\text{n}$) | логическая | `boolean` | В группе `BERGGREN` | `lazy (BERGGREN)` | `isPrimitive` |
| `commonLegPrimA` *(Q4)* | M5 / Отложен | Подлежит уточнению (см. Q4); требует факторизации $a$ / $a_0$ | счётчик ($L^0$) | `bigint \| null` | Отложен / опц. `TRANSVERSAL` | `lazy (TRANSVERSAL)` | `a` или `a_0` (**Q4**) |
| `commonHypPrimC` *(Q4)* | M5 / Отложен | $2^{\omega(c_0)-1}$ для $c_0$ (или `0n` при $k > 1$, см. Q4); требует факторизации $c$ / $c_0$ | счётчик ($L^0$) | `bigint \| null` | Отложен / опц. `TRANSVERSAL` | `lazy (TRANSVERSAL)` | `c` или `c_0` (**Q4**) |

---

## 7. Four Open Design Questions (Phase 2)

### Q1. `asymQ` (`CLOSED — INHERITED FROM M4-S1`)
**Статус:** `Q1 = CLOSED` — M5 наследует $q = \frac{b - a}{a + b} = \frac{t - 1}{t + 1} \in \mathbb{Q} \cap (0, 1)$ напрямую из замороженного `M4-S1` (`SpornFacetResult.asymQ`) без переопределения. Плюсы: полная согласованность с `M4-S1` и стендом `square-to-Rhombus-Geometry-lab`, точная рациональность в `ExactRational`, строгая монотонность по $t = b/a$, обратимость $t = (1+q)/(1-q)$ и единое значение во всех строках `ClassMatrix` (`CM-INV-06`).

### Q2. Углы и `float64`
- **Целевая архитектура:** точное ядро M5 (`src/core/passports/`) оперирует **только** в `BigInt` и `ExactRational` и содержит полную точную тригонометрию (`sinA = a/c`, `cosA = b/c`, `tanA = a/b`, `tanHalfA = r/(r+y)`, `tanHalfB = r/(r+x)`).
- **Отдельный проекционный слой `displayProjection` (для M7/M8):** выносится за пределы `src/core/passports/` (например, в адаптер визуализации/экспорта). Принимает `a, b` / `sinA, cosA` и вычисляет `angleADeg`, `angleBDeg` (`float64`) исключительно для отображения пользователю и экспорта таблиц.
- **Преимущество:** вся ветка `src/core/` (M1–M6) остаётся абсолютно свободной от `Number()`, `Math.*` и потери точности при $r > 2^{53}$.

### Q3. Евклидовы параметры `(euclidU, euclidV, euclidM, euclidN)`
- **Результат проверки:** функция `recoverEuclideanParameters(x0, y0)` в `src/core/classification/recoverEuclideanParameters.ts` уже вычисляет `{ m, n, u, v }` через `isqrtBigInt` из M1, проверяет $m > n > 0$, $\gcd(m, n) = 1$, $2 \nmid (m - n)$ и $m^2 - n^2, 2mn, m^2 + n^2$, а `classifyTriple.ts` уже заполняет `triple.euclideanParams`.
- **Решение для M5:** не создавать отдельную дублирующую математическую функцию в M5 и не менять M1–M3. Реализовать адаптер `resolveEuclideanParameters(triple: PythagoreanTriple): EuclideanParameters`, который читает `triple.euclideanParams` и лишь при его отсутствии (например, на вручную сконструированном объекте) делегирует в `recoverEuclideanParameters(triple.primitiveAncestor.x, triple.primitiveAncestor.y)` из M3.

### Q4. Трансверсальные индексы (`commonLegPrimA`, `commonHypPrimC`)
Математическая проверка формул и условий применимости:
1. **`commonHypPrimC`:**
   - Для примитивной гипотенузы $c_0$ (все простые делители $p_i \equiv 1 \pmod 4$) число ППТ с гипотенузой $c_0$ равно $2^{\omega(c_0) - 1}$, так как каждое из $2^{\omega(c_0)-1}$ примитивных представлений $c_0 = m^2 + n^2$ даёт ровно одну неупорядоченную пару катетов, которая однозначно канонизируется условием $a < b$.
   - Если тройка масштабирована ($k > 1$), у самой $c = k c_0$ нет примитивных троек (`0n`), если индекс отнесён к $c$, или $2^{\omega(c_0)-1}$, если к $c_0$.
2. **`commonLegPrimA`:**
   - Формула $2^{\omega(L) - 1}$ из ранней заметки `v0.1` считает число ППТ, в которых $L$ является катетом **без различия между меньшим ($a$) и большим ($b$) катетом**. Так, для $L = 15$ ($2^{\omega(15)-1} = 2$) существуют две ППТ: $(8, 15, 17)$ (где $15 = b > a$) и $(15, 112, 113)$ (где $15 = a < b$). Следовательно, число ППТ с *меньшим катетом* $a_0 = 15$ равно $1 \ne 2$.
   - Точный подсчёт для *меньшего* катета $a_0$ требует перебора копримных разложений $a_0$ (или перебора $d_1 d_2 = a_0$ / $2mn = a_0$ с проверкой неравенства $a < b$), а также решения: считать индекс для стороны $a$ самой тройки (`0n` при $k > 1$) или для предка $a_0$.
- **Рекомендация:** **не** включать `commonLegPrimA` и `commonHypPrimC` в обязательный состав `v0.1` ядра M5; выделить их либо в отдельную отложенную lazy-группу `TRANSVERSAL` (`M5-S4`), либо в самостоятельный пост-M5 фасет после формального утверждения определений и факторизационной политики (M2 для $a, c$).

---

## 8. Data Model and Lazy Computation Policy (Phase 3)

### 8.1 Минимальный каркас строки
```ts
export interface ClassMatrixRowCore {
  readonly rowIdx: bigint;
  readonly tripleId: string;
  readonly classId: string;
  readonly primId: string;
  readonly r: bigint;
  readonly x: bigint;
  readonly y: bigint;
  readonly a: bigint;
  readonly b: bigint;
  readonly c: bigint;
  readonly k: bigint;
  readonly isPrimitive: boolean;
}
```

### 8.2 Режимы работы, кэширование и политика неполноты
1. **Сортировка по `x` (Политика B5):** строки матрицы строго упорядочены по $x_0 < x_1 < \dots < x_{N-1}$. При построении проверяется уникальность `tripleId` (`DUPLICATE_TRIPLE_ID`) и `x` (`DUPLICATE_X`), валидируются все тройки, затем детерминированно сортируется **поверхностная копия** (`shallow copy`) массива по возрастанию `x` без мутации входного `classification.allTriples`, и лишь после этого присваиваются непрерывные индексы `rowIdx = 0n .. N-1n`. (Отметим: `M5-S1` `buildClassPassport` по-прежнему требует предсортированный `classification.allTriples` при `COMPLETE`.)
2. **Стабильность ID:** `tripleId`, `classId`, `primId` копируются напрямую из M3 и неизменны в любых режимах.
3. **Два режима материализации с едиными формулами:**
   - **Full Matrix (`buildFullClassMatrix`):** материализует все утверждённые группы (`ARITH`, `EUCLID`, `GEOM`, `SPORN`, `BERGGREN`) в замороженный объект.
   - **Lazy Matrix (`createLazyClassMatrix`):** создаёт каркас `coreRows` и материализует группы по запросу: `materializeGroup(group)`, `materializeGroups(groups)`, `getRow(rowIdx, groups?)`, `toFullMatrix()`.
   - **Единство контракта:** оба режима вызывают одни и те же чистые функции расчёта групп, гарантируя побитовое совпадение значений.
4. **Кэширование и повторные запросы:**
   - Внутри экземпляра `LazyClassMatrix` результаты по каждой материализованной группе кэшируются в внутренней `Map<MatrixColumnGroup, ReadonlyArray<...>>` (либо кэшируются переданные/вычисленные `SpornFacetResult[]` и `BerggrenFacetResult[]` так, что вызов `GEOM` после `SPORN` не пересчитывает `SpornFacet` повторно).
   - Повторный запрос уже материализованной группы возвращает замороженную ссылку из кэша за $O(1)$.
5. **Политика при `isComplete === false`:**
   - **Запрет выдачи неполной матрицы за полную:** `buildFullClassMatrix` и `createLazyClassMatrix` строго отклоняют `classification.isComplete === false` или `totalTriplesCount !== expectedTotalCount` выбрасыванием `IncompleteClassificationError`.
   - **Фактический контракт `buildClassPassport` при неполных M2 или M3 (`src/core/passports/classPassport.ts`):**
     - При неполном M2 или M3 `buildClassPassport` возвращает иммутабельный паспорт со статусом `status: 'INCOMPLETE'` (`isComplete: false`), **не выбрасывая ошибку** только из-за неполноты входных вычислений;
     - `profile = null`;
     - `subclassSpectrum = []`;
     - `expectedMatrixSummary = { rowCount: null, isSortedByX: false, firstTripleId: null, lastTripleId: null }`;
     - доступные частичные данные M2 (например, `twoExponent`, `oddPrimeFactors` и вычисленные до остановки счётчики/делители) сохраняются в `numberTheory`.
   - **Отсутствующий профиль при полных M2 и M3:** если и M2, и M3 завершены (`m2Complete && m3Complete`), но профиль M4-S3 (`ClassProfileFacetResult`) не передан (`null` или `undefined`), `buildClassPassport` выбрасывает `MissingProfileError`.

---

## 9. Proposed M5 Sub-phases (Phase 4)

Архитектура естественно делится на **3 основные подфазы** (и 1 опциональную подфазу для Q4):

### Подфаза `M5-S1`: `ClassPassport` & `EuclidAdapter` *(Статус: `IMPLEMENTED — PENDING INDEPENDENT AUDIT`)*
- **Назначение:** построение целостного паспорта класса `CL-R{r}-D{2r}` поверх готовых выходов M2 + M3 + M4-S3 без дублирования вычислений и адаптера евклидовых параметров поверх M3 с проверкой `{x0, y0} = {v², 2u²}`.
- **Входы:** `RadiusNumberTheoryResult` (M2), `RadiusClassificationResult` (M3), `ClassProfileFacetResult` (M4-S3).
- **Выходные интерфейсы:** `ClassPassportResult`, `PassportNumberTheorySummary`, `SubclassSpectrumEntry`, `ExpectedMatrixSummary`, `resolveEuclideanParameters`, `buildClassPassport`, `verifyClassPassportInvariants`.
- **Созданные модули:** `src/core/passports/types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts`, тест `src/tests/core/classPassportM5S1.test.ts` (подключён в `package.json`).
- **Зависимости:** M1, M2, M3, M4-S3.
- **Инварианты:** `CP-INV-01..08`.
- **Покрытие (проверено в среде реализации Gemini, ожидает независимого аудита):** golden-векторы $r = 1, 2, 3, 6, 35, 105$, `EuclidAdapter` (включая контрпример `{x0, y0} ≠ {v², 2u²}`), строгая сортировка `allTriples` по `x`, сохранение частичных данных M2 при `INCOMPLETE`, усиление `CP-INV-07` с негативным тестом на `isSortedByX = undefined` (`PassportInvariantError`), разделение `status`/`isComplete` и `certificationStatus`, прогон $r = 1\dots 30$, 0 `float64` (`SCAN_CLEAN`), `npm test` (10/10 наборов), `tsc --noEmit`, `npm run build`.

### Подфаза `M5-S2`: `ClassMatrix` (`Full` & `Lazy`) *(Статус: `IMPLEMENTED — PENDING INDEPENDENT AUDIT`)*
- **Назначение:** построение многопризнаковой матрицы строк (`PT-R{r}-K{k}-X{x}`), отсортированных по `x`, в режимах `Full` и `Lazy` для 5 групп `ARITH`, `EUCLID`, `GEOM`, `SPORN`, `BERGGREN` поверх `CORE`/`INDEX` (`Q1 = CLOSED`, `TRANSVERSAL` отложен).
- **Входы:** `RadiusClassificationResult` (M3) + опциональный кэш `SpornFacetResult[]` / `BerggrenFacetResult[]`.
- **Выходные интерфейсы:** `ClassMatrixRowCore`, `ClassMatrixRowFull`, `ClassMatrixRowView`, `FullClassMatrixResult`, `LazyClassMatrix`, `buildFullClassMatrix`, `createLazyClassMatrix`, `verifyClassMatrixInvariants`, `verifyFullLazyMatrixParity`, `verifyPassportMatrixAlignment`, `findFullMatrixRowByX`, `getFullMatrixRowByIndex`.
- **Созданные модули:** `src/core/passports/classMatrix.ts` (и расширение `types.ts`, `errors.ts`), тест `src/tests/core/classMatrixM5S2.test.ts` (подключён в `package.json`).
- **Зависимости:** M1, M3, M4-S1, M4-S2, `M5-S1` (`euclidAdapter`, `types`, `errors`).
- **Инварианты (`CM-INV-01..08`):**
  1. `CM-INV-01`: соответствие полей `CORE`, гиперболических уравнений и канонических ID (`tripleId`, `primId`, `classId`) данным M3.
  2. `CM-INV-02`: непрерывность `rowIdx = 0n..N-1n`, корректность границ заголовка (`rowCount`, `firstTripleId`, `lastTripleId`) и `Object.freeze`-иммутабельность.
  3. `CM-INV-03`: строгая сортировка по возрастанию `x` и уникальность `tripleId` и `x`.
  4. `CM-INV-04`: геометрические тождества ($p = 3r+x+y = c+r$, $P = 2p$, $S = ab/2 = r\cdot p$).
  5. `CM-INV-05`: арифметика `ARITH` (`gcdSides === k`, делимости) и соответствие `EUCLID` (`{x0, y0} = {v², 2u²}`).
  6. `CM-INV-06`: точная рациональная тригонометрия `aDivC === sinA`, `bDivC === cosA` и паритет со `SPORN` (`asymQ = (b-a)/(a+b)` из M4-S1).
  7. `CM-INV-07` *(BERGGREN mathematical identity)*: проверяет не только внутреннюю согласованность (`treeLegSwapped = (A2|A3)`, `canonWord <-> rawWord`, `treeDepth`, `parentOperator`, `appliesToPrimitiveAncestor`, эквивалентность корня `(3,4,5) <-> treeDepth === 0n`), но и точное восстановление примитивного предка `(a0, b0, c0, r0, x0, y0)` из `CORE`-параметров текущей строки через `applyCanonWord` и `applyRawWord` из замороженного `M4-S2`. Входной кэш `options.berggrenFacets` принимается только при полном совпадении с соответствующей тройкой M3 (`tripleId`, `classId`, `r`, `primId`, `k`, `isPrimitive`, `appliesToPrimitiveAncestor`, `primitiveAncestor` и `primitiveRadius`) и проверке `verifyBerggrenFacetInvariants()` (`FACET_CACHE_MISMATCH` при несоответствии кэша).
  8. `CM-INV-08`: побитовый паритет `Full === Lazy` во всех порядках материализации (`verifyFullLazyMatrixParity`).
- **Покрытие (проверено в среде реализации Gemini, ожидает независимого аудита):** Golden-векторы $r = 1, 2, 3, 6, 15, 30, 35, 105, 420$, перекрёстная проверка `Full` vs `Lazy`, `GEOM` после `SPORN` без пересчёта `SpornFacet`, нормализация несортированного `allTriples` на поверхностной копии без мутации входа, негативные тесты (`isComplete === false`, `totalTriplesCount !== expectedTotalCount`, дубликат `tripleId`, дубликат `x`, мутации `CM-INV-01..08`, аудит-тесты A–E усиления `BERGGREN`, `verifyPassportMatrixAlignment`), прогон $r = 1..50$ ($339$ строк, $110$ примитивных).
- **Риски:** объём памяти в `Full` при больших $N$; минимизируется режимом `Lazy` и кэшированием по группам.

### Подфаза `M5-S3`: `RangeCatalog` & Barrel Export
- **Назначение:** формирование сводного каталога паспортов на интервале $[r_{\min}, r_{\max}]$ с явной статистикой полноты и публикация публичного barrel-модуля `src/core/passports/index.ts`.
- **Входы:** `rFrom: bigint`, `rTo: bigint`, опции факторизации и режим обработки `INCOMPLETE`.
- **Выходные интерфейсы:** `RangeCatalogResult`, `buildRangeCatalog`.
- **Создаваемые модули:** `src/core/passports/rangeCatalog.ts`, `src/core/passports/index.ts`.
- **Зависимости:** `M5-S1`, `M5-S2` (опционально для выборки), M2, M3, M4-S3.
- **Инварианты:** `RC-INV-01..04` (покрытие всего $[r_{\min}, r_{\max}]$, `completeCount + incompleteCount === count`, несокрытие `INCOMPLETE`).
- **Golden Tests:** $r = 1..30$ ($174$ тройки, $61$ ППТ) и $r = 1..120$ ($1098$ троек, $311$ ППТ).
- **Negative Tests:** `rFrom <= 0n`, `rFrom > rTo`, искусственно вызванный `INCOMPLETE` через `FactorizationOptions`.
- **Критерии приёмки:** **совместная приёмка** всего пакета M5 (`S1 + S2 + S3`), `npm test`, `npx tsc --noEmit`, `npm run build`, скан `float64`.
- **Риски:** долгое время прогона больших диапазонов из-за $O(d)$ в `M4-S2` — контролируется профилированием в тестах.

### *(Опциональная подфаза `M5-S4` — только после закрытия Q4)*: `TransversalFacet`
- **Назначение:** реализация `commonLegPrimA` и `commonHypPrimC` после утверждения математических определений (позиция катета $a$ vs $\{a,b\}$, режим $k = 1$ vs $k > 1$) и оценки стоимости факторизации $a$ и $c$.

---

## 10. Test and Acceptance Strategy

1. **Статический скан изоляции (Section 0):** автоматическая проверка `src/core/passports/` на отсутствие `Math.*`, `Number()`, `parseFloat`, `parseInt`, `Float64`, `React`.
2. **Golden Vectors:** точная проверка паспортов и полных матриц на $r \in \{1, 2, 3, 6, 15, 30, 35, 105, 420\}$, включая контроль `semiPerimeter = c + r` и `perimeter = 2 * semiPerimeter`.
3. **Паритет `Full === Lazy`:** тесты эквивалентности `FullClassMatrix` и `LazyClassMatrix` при различных последовательностях вызова `materializeGroup` и кэшировании повторных запросов.
4. **Негативные и мутационные тесты:** подмена `tripleId`, нарушение сортировки $x$, передача `isComplete: false`, расхождение $N/T$ между M2/M3/S3.
5. **Диапазонные сверки:** $r = 1..30$ и $r = 1..120$ с подтверждением тождественности агрегатов с M2/M3/M4.

---

## 11. M6 Compatibility (Готовность к независимому верификатору `CHK-01..12`)

1. **Прозрачный provenance:** каждая строка матрицы хранит первоисточники `(r, x, y, a, b, c, k)` в `CORE`, а паспорт сохраняет вложенный `profile` и `numberTheory`, что позволяет M6 проверить происхождение любого производного значения.
2. **Независимый пересчёт:** M6 может пересчитать по одному `CORE`: $a^2+b^2=c^2$, $xy=2r^2$, $S=ab/2$, $p=(a+b+c)/2$, $(m^2-n^2, 2mn)$, $\tilde{x} = x/r$, а также независимо прогнать `canonWord` и `rawWord` без использования кода M5.
3. **Обнаружение подмен и дублей:** уникальность `tripleId`, строгий порядок $x_0 < \dots < x_{N-1}$ и проверка $\sum |C_k(r)| = N$ гарантируют выявление любых подмен, пропусков или дубликатов строк.
4. **Отсутствие самосертификации:** M5 не выставляет и не имитирует флаги `M6` (`CHK-*`); M5 отвечает только за внутреннюю структурную согласованность.
5. **Отсутствие скрытых `BigInt -> Number` преобразований:** сохраняет 100% точность для верификации на $r > 2^{53}$.

---

## 12. Performance Considerations & Benchmark Plan

### Архитектурная оценка стоимости
- **`ClassPassport` (`M5-S1`):** $O(\tau(r) + 1)$ при готовых M2/M3/M4-S3.
- **`LazyClassMatrix` (`CORE` + `ARITH` + `EUCLID` + `GEOM без SPORN`):** $O(N(r))$ арифметических операций `BigInt` без рекурсий по дереву.
- **`SPORN`:** $O(N(r))$ операций `ExactRational`.
- **`BERGGREN`:** $O(\sum d_i)$, где для примитивных узлов $d \le r_0 - 1$ (плюс $O(d)$ самопроверка внутри S2). Изоляция в lazy-группу `BERGGREN` предотвращает лишнюю нагрузку при работе с каркасом и геометрией.
- **Сортировка и поиск:** линейная проверка $O(N)$ порядка `x` (поскольку M3 уже упорядочен), доступ по `rowIdx` за $O(1)$, бинарный поиск по `x` за $O(\log N)$, поиск по `tripleId` через индекс за $O(1)$.
- **Без искусственных ограничений:** M5 не накладывает произвольных ограничений на $r$ или глубину (работают только защитные лимиты M2).

### Benchmark-план (после реализации `M5-S2`/`M5-S3`)
1. **Серийный диапазон:** $r = 1..120$ (замер времени и памяти на полных паспортах + матрицах).
2. **Высокосоставной $r$ (большое $N(r)$):** $r = 420$ ($N=81$), $r = 2520$ ($N=225$), $r = 55440$ ($N \approx 1125$) — сравнение `Full` vs `Lazy` и эффекта кэширования.
3. **Глубокий примитивный $r$ (большое $d = r - 1$ при $x=1$):** $r = 1009$, $r = 10007$ — измерение изоляции стоимости `BERGGREN` от `CORE/ARITH/GEOM/SPORN`.
4. **Крупный `BigInt` ($r > 2^{53}$):** $r = 10^{16} + 61$ — контроль точности `BigInt` без деградации каркаса.

---

## 13. Risks and Unresolved Decisions

| Риск / Решение | Описание | Статус | Способ закрытия |
| :--- | :--- | :---: | :--- |
| **Q1 (`asymQ`)** | Наследование формулы `(b-a)/(a+b)` из замороженного M4-S1 без переопределения. | `CLOSED` | `Q1 = CLOSED` — зафиксировано наследование из M4-S1. |
| **Q2 (`float64`)** | Вынос `angleADeg`, `angleBDeg` из ядра `src/core/passports/` во внешний `displayProjection` (M7/M8). | `RECOMMENDED` | Подтверждение пользователем. |
| **Q4 (`TRANSVERSAL`)** | Неточность $2^{\omega(a)-1}$ для *меньшего* катета $a$ и неопределённость для $k > 1$; необходимость факторизации $a, c$. | `OPEN / DEFERRED` | Вынос за рамки `v0.1` в отдельную отложенную подфазу `M5-S4`. |
| **M2-данные в M3** | `RadiusClassificationResult` не передаёт `omegaStar`, `tauR`, `certificationStatus`. | `SOLVED IN DESIGN` | Явный вход `{ numberTheory, classification, profile }` в `buildClassPassport`. |
| **Стоимость `BERGGREN`** | Линейная глубина $O(d)$ на больших простых $r$ при `FullMatrix`. | `MITIGATED` | Ленивая материализация `BERGGREN` в `LazyClassMatrix` по умолчанию. |

---

## 14. Implementation Roadmap

1. **Шаг 0 (Sign-off):** утверждение решений по **Q1–Q4** и настоящего `M5_IMPLEMENTATION_BLUEPRINT.md` (`Q1 = CLOSED`).
2. **Шаг 1 (`M5-S1`):** реализация `types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts` (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`).
3. **Шаг 2 (`M5-S2`):** реализация `classMatrix.ts` (`Full` + `Lazy`), проверка паритета и совместной согласованности `verifyPassportMatrixAlignment` (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`).
4. **Шаг 3 (`M5-S3`):** реализация `rangeCatalog.ts`, `index.ts`, прогоны `r = 1..120` и финальная приёмка M5 (**Deferred**).
5. **Шаг 4 (`M5-S4`, опционально):** реализация `transversalFacet.ts` после отдельного утверждения Q4 (**Deferred**).

| Подфаза | Текущий статус | Зависимости | Критерии готовности |
| :--- | :--- | :--- | :--- |
| **`M5-S1`** | **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`** | M1, M2, M3, M4-S3 | `CP-INV-01..08` (включая негативный тест `CP-INV-07` на `isSortedByX = undefined`), `{x0, y0} = {v², 2u²}`, сортировка `x` ↑, сохранение частичных данных M2 при `INCOMPLETE`; проверки среды реализации пройдены, ожидается независимый аудит. |
| **`M5-S2`** | **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`** | M1, M3, M4-S1, M4-S2, `M5-S1` | `FullClassMatrix` и `LazyClassMatrix`, `CM-INV-01..08`, строгий паритет `Full === Lazy`, `verifyPassportMatrixAlignment`, Golden $r = 1..420$ + Negative + `r = 1..50`, 0 `float64`; проверки среды реализации пройдены, ожидается независимый аудит. |
| **`M5-S3`** | **Deferred** | `M5-S1`, `M5-S2`, M2, M3, M4-S3 | `RangeCatalog`, `src/core/passports/index.ts`, прогоны `r=1..30` и `r=1..120`, несокрытие `INCOMPLETE`. |
| **`TransversalFacet` *(опц.)*** | **Deferred** | Закрытый `Q4`, M2, `M5-S2` | Утверждены определения (`commonLegPrimA`, `commonHypPrimC`), Golden-сверка с перебором ППТ. |

> `Price tree` не входит в архитектуру проекта.

---

## Статусы готовности этапа M5

1. **`M1–M4` BASELINE:** `FROZEN` (без изменений).
2. **`M5-S1` (`ClassPassport` + `EuclidAdapter`):** **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`** — модули `types.ts`, `errors.ts`, `euclidAdapter.ts`, `classPassport.ts` и тест `src/tests/core/classPassportM5S1.test.ts` (включая усиление `CP-INV-07`) прошли проверки в среде реализации Gemini и ожидают независимого аудита.
3. **`M5-S2` (`ClassMatrix`):** **`IMPLEMENTED — PENDING INDEPENDENT AUDIT`** — модуль `src/core/passports/classMatrix.ts` (`Full` и `Lazy`, `CM-INV-01..08`, `Q1 = CLOSED`) и тест `src/tests/core/classMatrixM5S2.test.ts` созданы, подключены в `package.json` (`npm test`: 10/10 наборов) и прошли проверки в среде реализации Gemini (ожидают независимого аудита).
4. **`M5-S3` (`RangeCatalog`) и `TransversalFacet`:** **Deferred** (`TRANSVERSAL` и `M5-S3` отложены; `Price tree` не входит в архитектуру).
