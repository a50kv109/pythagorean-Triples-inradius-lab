# STAGE 5.1 — CANONICAL MIGRATION REPORT (`LT-01`–`LT-03`)

**Проект:** `Pythagoras-Circles-Lab`  
**Дата этапа:** 2026-11-26  
**Базовые документы:**
- [`MATHEMATICAL_NOTATION_STANDARD.md`](../standards/MATHEMATICAL_NOTATION_STANDARD.md)
- [`NOTATION_MIGRATION_MAP.md`](./NOTATION_MIGRATION_MAP.md)
- [`EXPERIMENT_06_STRICT_ROOT_AUDIT.md`](./EXPERIMENT_06_STRICT_ROOT_AUDIT.md)
- [`MIGRATION_PROTOCOL.md`](./MIGRATION_PROTOCOL.md) & [`LEGACY_TESTS_REGISTRY.md`](./LEGACY_TESTS_REGISTRY.md)

**Область миграции Stage 5.1:** строго `LT-01`, `LT-02`, `LT-03` (`src/tests/geometry.test.ts`, разделы 1–3). Переход к `LT-04` и последующим тестам **остановлен**.

---

## 1. Что перенесено и формализовано (`LT-01`–`LT-03` → `CT-01`–`CT-03`)

Для каждого из трёх базовых тестов в Canonical Shadow Stand закреплён 6-компонентный паспорт (`CanonicalTestPassport`: математический принцип, входные данные, канонические обозначения, ожидаемые инварианты, связь с Legacy, критерии успешного прохождения) и обеспечена двусторонняя сверка `Legacy ↔ Canonical`:

### 1.1. `LT-01` → `CT-01`: Control Triangles (`src/tests/canonical/test01_controlTriangles.canonical.test.ts`)
- **Математический принцип:** евклидовы тождества прямоугольного треугольника и четырёх окружностей: $c^2 = a^2 + b^2$, $r = \frac{ab}{a+b+c} = \frac{a+b-c}{2} > 0$, $K_a + K_b = K_c$, центральное тождество $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$, контраст площадей $K_a + K_b - K_c - K_i = -K_i < 0$, разбиение инцентром $S_A + S_B + S_C = S = pr$ и $\varphi_A + \varphi_B + \varphi_C = 360^\circ$.
- **Входные данные:** 6 канонических контрольных пар `(sideA, sideB)`: `(4,3)`, `(3,4)`, `(12,5)`, `(4,4)`, `(10,1)`, `(1,10)` (соответствующих Legacy `(3,4)`, `(4,3)`, `(5,12)`, `(4,4)`, `(1,10)`, `(10,1)`).
- **Канонические обозначения:** $C=(0,0)$ ($\gamma=90^\circ$), $A=(0,\text{sideB})$ ($\alpha=\angle A$), $B=(\text{sideA},0)$ ($\beta=\angle B$), `sideA = |BC|` (напротив $A$), `sideB = |AC|` (напротив $B$), `sideC = |AB|` (напротив $C$), $Q_a/K_a$ (IV кв., на `BC`), $Q_b/K_b$ (II кв., на `AC`), $Q_c/K_c$ (I кв., на `AB`), $K_i$ ($I=(r,r)$).
- **Ожидаемые инварианты:** все `8/8` канонических инвариантов `validateCanonicalFourCirclesInvariants`, монотонное правило $\text{sideA} > \text{sideB} \iff \alpha > \beta$, точные центры/диаметры/площади `Ka/Kb/Kc/Ki`, равенства $S_A+S_B+S_C=S=pr$ и $\sum \varphi_X = 360^\circ$.
- **Связь с Legacy:** `LT-01` (`src/tests/geometry.test.ts:45-109`) через отображение `Vertex-Preserving`: `legacy.b → sideA`, `legacy.a → sideB`, `circleB → Ka`, `circleA → Kb`, с перекрёстной проверкой `validateLegacyFourCirclesInvariants` и `verifyLegacyToCanonicalMapping`.
- **Критерии успешного прохождения:** допуск `tol <= 1e-9` по всем скалярам/инвариантам, `maxDeviation <= 1e-12` по поэлементному мосту, паритет `8/8` инвариантов в обоих стендах.

### 1.2. `LT-02` → `CT-02`: Leg-Swap Symmetry (`src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts`)
- **Математический принцип:** инволюционная симметрия при отражении относительно биссектрисы $y = x$: $(\text{sideA}, \text{sideB}) \leftrightarrow (\text{sideB}, \text{sideA})$ взаимно меняет объекты на катетах и острые углы, сохраняя инварианты гипотенузы и вписанной/описанной окружностей.
- **Входные данные:** канонические пары `(7,3) ↔ (3,7)` и `(1.25, 4.8) ↔ (4.8, 1.25)`; для Legacy-сверки — пара `(3,7) ↔ (7,3)`.
- **Канонические обозначения:** `sideA ↔ sideB`, `squareA ↔ squareB`, `circleKa ↔ circleKb`, `angleAlphaDeg ↔ angleBetaDeg`, `subtriangleAreaA ↔ subtriangleAreaB`, `areaShareA ↔ areaShareB`, `arcAngleADeg ↔ arcAngleBDeg`, `arcShareA ↔ arcShareB`, `tangentSegA ↔ tangentSegB`, $T_a \leftrightarrow T_b$.
- **Ожидаемые инварианты:** детерминированная воспроизводимость (`assert.deepEqual`), `8/8` инвариантов на обеих конфигурациях, обмен площадей/диаметров/длин окружностей $K_a \leftrightarrow K_b$ и отражение их центров $(x \leftrightarrow y)$, сохранение $K_c, C_c, K_o, K_i, r, \text{sideC}, P, S$, отражение $T_a \leftrightarrow T_b$ и $T_{c,x} \leftrightarrow T_{c,y}$.
- **Связь с Legacy:** `LT-02` (`src/tests/geometry.test.ts:111-120`) — подтверждено двустороннее соответствие `s1.circleA (OA=3) === canon(7,3).circleKb`, `s1.circleB (OB=7) === canon(7,3).circleKa`, `s2.circleB (OB=3) === canon(3,7).circleKa`, `s2.circleA (OA=7) === canon(3,7).circleKb`.
- **Критерии успешного прохождения:** допуск `tol <= 1e-9` по всем соотношениям симметрии, строгое `deepEqual` при повторном вызове, `maxDeviation <= 1e-12` в `verifyLegacyToCanonicalMapping`.

### 1.3. `LT-03` → `CT-03`: Strict Input Validation (`src/tests/canonical/test03_inputValidation.canonical.test.ts`)
- **Математический принцип:** область невырожденных конечных прямоугольных треугольников — строго открытый квадрант $(\text{sideA}, \text{sideB}) \in (0, +\infty)^2 \subset \mathbb{R}^2$; значения $0$, $-0$, $<0$, `NaN`, $\pm\infty$ недопустимы.
- **Входные данные:** 11 невалидных пар (все 9 пар из `LT-03` плюс `(-0, 4)` и `(4, -Infinity)`), 6 невалидных скаляров `[0, -1, -0, NaN, +Infinity, -Infinity]` для отдельных квадратов и контрольные валидные границы `(4,3)`, `(1e-12, 1e-12)`, `(1e12, 1e12)`.
- **Канонические обозначения:** `InvalidCanonicalTriangleInputError` (`sideName: 'sideA' | 'sideB'`, `value`), `calculateCanonicalFourCircles`, `buildCanonicalRightTriangle`, `buildCanonicalSquareA/B/C`, `assertValidCanonicalSide/Sides`.
- **Ожидаемые инварианты:** 100% отклонение невалидных входов с точным указанием `err.sideName`; корректная конструкция положительных граничных конфигураций.
- **Связь с Legacy:** `LT-03` (`src/tests/geometry.test.ts:122-156`) — паритет выброса исключений на всех 9 парах `LT-03`, соответствие `calculateSquareA(0) ↔ buildCanonicalSquareB(0)` и `calculateSquareB(-1) ↔ buildCanonicalSquareA(-1)`, а также проверка инверсии `err.sideName` (`legA → 'sideB'`, `legB → 'sideA'`).
- **Критерии успешного прохождения:** 100% совпадение факта исключения и имени отвергнутой стороны между Legacy и Canonical.

---

## 2. Что уже существовало до Stage 5.1

- Параллельный Canonical Shadow Stand в `src/canonical/` (`types.ts`, `canonicalFourCircles.ts`, `canonicalValidators.ts`, `legacyMapping.ts`, `semanticContract.ts`, `index.ts`), созданный на Этапах 2–3.
- Начальные файлы `test01_controlTriangles.canonical.test.ts`, `test02_legSwapSymmetry.canonical.test.ts`, `test03_inputValidation.canonical.test.ts` (без единых паспортов `CT01_PASSPORT`–`CT03_PASSPORT` и с частичным дублированием утилит).
- Тест семантического контракта `semanticContract.canonical.test.ts` (Task 3) и аудит Experiment 06 `experiment06.strictRootAudit.test.ts` (Stage 4 / 4.1).

---

## 3. Что было объединено и как устранено дублирование

1. **Вынесен общий модуль утилит `src/tests/canonical/testHelpers.ts`:**
   - Объединены повторявшиеся в `CT-01`..`CT-03` константы допусков (`CANONICAL_CORE_TOLERANCE = 1e-9`, `CANONICAL_BRIDGE_TOLERANCE = 1e-12`), список `EXPECTED_CANONICAL_CORE_INVARIANT_IDS`, интерфейс `CanonicalTestPassport`, `assertClose` и `assertAllCanonicalCoreInvariantsValid`.
2. **Не создавались дублирующие файлы тестов:** вместо создания новых дубликатов `LT-01`..`LT-03`, существующие `CT-01`..`CT-03` были формализованы, дополнены недостающими проверками паритета и сведены в единый контракт.
3. **Разграничены области ответственности с `semanticContract.canonical.test.ts`:** в `CT-02` явно зафиксировано, что инверсия спектрального параметра `shapeRatio` ($\rho \leftrightarrow 1/\rho$) проверяется в `semanticContract.canonical.test.ts` и не дублируется в `CT-02`.

---

## 4. Какие инварианты проверены

- **8/8 базовых инвариантов модели 4 окружностей** (`incircle_positive`, `squares_construction`, `square_circles_tangency`, `incircle_tangency`, `four_circle_areas`, `central_sqrt_identity`, `pythagorean_circle_areas`, `area_non_equality_contrast`) — в обоих стендах для всех контрольных и симметричных конфигураций.
- **Инварианты разбиения инцентром и монотонности:** $S_A + S_B + S_C = S = pr$, $\varphi_A + \varphi_B + \varphi_C = 360^\circ$, $\text{sideA} > \text{sideB} \iff \alpha > \beta$.
- **Инволюционные инварианты отражения $y = x$:** обмен $K_a \leftrightarrow K_b$, $C_a \leftrightarrow C_b$, $Q_a \leftrightarrow Q_b$, $\alpha \leftrightarrow \beta$, $S_A \leftrightarrow S_B$, $w^{\text{area}}_A \leftrightarrow w^{\text{area}}_B$, $\varphi_A \leftrightarrow \varphi_B$, $w^{\text{arc}}_A \leftrightarrow w^{\text{arc}}_B$, $t^{\text{seg}}_A \leftrightarrow t^{\text{seg}}_B$, $T_a \leftrightarrow T_b$, отражение центров и сохранение $K_c, C_c, K_o, K_i, r, c, P, S$.
- **Контракт области определения:** $(0, +\infty)^2 \subset \mathbb{R}^2$ с точным определением `sideName` при отклонении.
- **Семантический мост `Legacy ↔ Canonical`:** `maxDeviation = 0.00e+0` во всех контрольных точках `CT-01` и `CT-02`.

---

## 5. Какие расхождения обнаружены

1. **Программно-геометрических расхождений (`float64`):** **`0`** (`maxDeviation = 0.00e+0` по координатам, радиусам, площадям и углам при правильном отображении `Vertex-Preserving`).
2. **Семантическая перестановка индексов на катетах (Legacy Core vs Canonical):**
   - `legacy.triangle.a` ($|OA|$), `legacy.squareA`, `legacy.circleA` соответствуют `canonical.triangle.sideB` ($|AC|$), `canonical.squareB`, `canonical.circleKb`.
   - `legacy.triangle.b` ($|OB|$), `legacy.squareB`, `legacy.circleB` соответствуют `canonical.triangle.sideA` ($|BC|$), `canonical.squareA`, `canonical.circleKa`.
   - При валидации входов (`CT-03`) ошибка в первом аргументе Legacy (`legA`) соответствует `'sideB'` в Canonical, а во втором (`legB`) — `'sideA'`.
3. **Устранены неполноты в самих `CT-01`..`CT-03`:** до Stage 5.1 в `CT-01` не запускался параллельно `validateFourCirclesInvariants` на Legacy-модели, в `CT-02` не проверялись `circumference`, `perimeter`, `areaShare`, `arcShare`, `tangentSeg` при перестановке, а в `CT-03` не проверялось соответствие `err.sideName` для пар из `LT-03`. Все три пункта добавлены.

---

## 6. Какие тесты и проверки пройдены

| Проверка | Команда / Инструмент | Результат |
|---|---|---|
| `CT-01` (Control Triangles) | `npx tsx src/tests/canonical/test01_controlTriangles.canonical.test.ts` | **PASSED** (`6/6` треугольников, `maxDev = 0.00e+0`) |
| `CT-02` (Leg-Swap Symmetry) | `npx tsx src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` | **PASSED** (`maxDev = 0.00e+0` на обоих входах) |
| `CT-03` (Input Validation) | `npx tsx src/tests/canonical/test03_inputValidation.canonical.test.ts` | **PASSED** (100% паритет отказов и `sideName`) |
| `semanticContract.canonical.test.ts` | `npx tsx src/tests/canonical/semanticContract.canonical.test.ts` | **PASSED** (`7/7` групп контракта) |
| `experiment06.strictRootAudit.test.ts` | `npx tsx src/tests/canonical/experiment06.strictRootAudit.test.ts` | **PASSED** (Stage 4.1 аудит корней) |
| Полный Legacy suite | `npm test` (`tsx src/tests/geometry.test.ts`) | **PASSED** (все 10 секций) |
| Сборка и TypeScript lint | `compile_applet` + `lint_applet` (`tsc --noEmit`) | **PASSED** (`0` ошибок) |
| Неизменность защищённых файлов | `sha256sum -c` по всем **104** защищённым файлам (`src/math/*`, `src/types/*`, `src/components/*`, `src/tests/*.test.ts`, исходные `docs/*`) | **PASSED (`104 / 104 OK`)** |

---

## 7. Какие ограничения остались

1. Миграция намеренно остановлена на **`3 / 23`** (`LT-01`–`LT-03`). Тесты **`LT-04`–`LT-23`** остаются в статусе `NOT_STARTED`.
2. Legacy-модули (`src/math/*`), Legacy-тесты (`src/tests/*.test.ts`) и оригинальная документация экспериментов не изменялись и сохраняют прежнюю нотацию (`a = |OA|`, `b = |OB|`, `alphaDeg = B` в Exp 03–06).
3. Альтернативная зеркальная ориентация `mirror_leg_name_preserving` остаётся задокументированной в `legacyMapping.ts` и `MATHEMATICAL_NOTATION_STANDARD.md` как неактивная до явного архитектурного решения по UI.
4. Для следующих этапов миграции (`LT-04`–`LT-10`) в `src/canonical/` в будущем потребуется добавить канонические Thales-$K_o$-валидаторы (для `CT-09`–`CT-10`) и/или явную каноническую обёртку спектрального модуля (для `CT-06`–`CT-08`).
