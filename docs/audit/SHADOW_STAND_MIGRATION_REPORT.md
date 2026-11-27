# Shadow Stand Migration Report — Checkpoint 3 (Task 3: Canonical Semantic Contract)

**Дата контрольной точки:** 2026-11-26  
**Статус задания (`TASK 3 — CANONICAL SEMANTIC CONTRACT`):** Закреплена трёхуровневая архитектура идентичности геометрических объектов (все 5 окружностей, 3 квадрата, стороны и касательные), оформлен канонический паспорт спектрального параметра `shapeRatio` (без изменения Legacy `t`), разведены `shapeRatio` и `tangentSegA/B/C`, синхронизированы все 6 документов и `src/canonical/`. Новые тесты (`LT-04`–`LT-23`) не мигрировались; выполнение остановлено для проверки пользователем.

---

## 1. Какие правила канонической идентичности закреплены

В [`docs/standards/CANONICAL_SEMANTIC_CONTRACT.md`](../standards/CANONICAL_SEMANTIC_CONTRACT.md) и `src/canonical/semanticContract.ts` закреплён архитектурный принцип **Geometry Reasoning Stand** (разделение на **Layer 1: Geometric Entity**, **Layer 2: Semantic Role**, **Layer 3: Canonical Identifier**) и постоянное правило семантического моста: идентичность объекта определяется геометрическими координатами и противоположной вершиной, а не именем в Legacy.

- **Все 5 окружностей:**
  - `circleKa` ($K_a$) $\leftrightarrow$ Legacy `circleB`: центр $(\text{sideA}/2, -\text{sideA}/2)$, радиус $\text{sideA}/2$, на `sideA` ($BC$), напротив $A$;
  - `circleKb` ($K_b$) $\leftrightarrow$ Legacy `circleA`: центр $(-\text{sideB}/2, \text{sideB}/2)$, радиус $\text{sideB}/2$, на `sideB` ($AC$), напротив $B$;
  - `circleKc` ($K_c$) $\leftrightarrow$ Legacy `circleC`: центр $((\text{sideA}+\text{sideB})/2, (\text{sideA}+\text{sideB})/2)$, радиус $\text{sideC}/2$, на `sideC` ($AB$), напротив $C$;
  - `incircleKi` ($K_i$) $\leftrightarrow$ Legacy `incircle`: центр $I=(r,r)$, радиус $r$, касается всех трёх сторон в `tangencySideA/B/C`;
  - `circumcircleKo` ($K_o$) $\leftrightarrow$ Legacy `circumcircle`: центр $(\text{sideA}/2, \text{sideB}/2)$, радиус $\text{sideC}/2$, описана около $A, B, C$ напротив $C$.
- **Все 3 квадрата:** `squareA` ($Q_a$, IV кв., на `sideA`, opp $A$) $\leftrightarrow$ Legacy `squareB`; `squareB` ($Q_b$, II кв., на `sideB`, opp $B$) $\leftrightarrow$ Legacy `squareA`; `squareC` ($Q_c$, I кв., на `sideC`, opp $C$) $\leftrightarrow$ Legacy `squareC`.
- **Стороны и зависимые объекты:** `sideA = |BC|` opp $A$ $\leftrightarrow$ `triangle.b`, `sideB = |AC|` opp $B$ $\leftrightarrow$ `triangle.a`, `sideC = |AB|` opp $C$ $\leftrightarrow$ `triangle.c`; точки касания `tangencySideA/B/C` $\leftrightarrow$ `tangencyOB/OA/AB`; подтреугольники `subtriangleAreaA/B/C`; секторы `arcAngleADeg/BDeg/CDeg`.

---

## 2. Как определён `shapeRatio`

- **Концептуальное имя и контракт:** `shapeRatio` (математически $\rho$) с обязательным полем направления **`shapeRatioDefinition = 'sideA / sideB'`**. Это не новый параметр, а каноническое имя для величины Legacy $t$:
  $$\rho \equiv \text{shapeRatio} = \frac{\text{sideA}}{\text{sideB}} = \frac{|BC|}{|AC|} = \tan\alpha = \cot\beta \;\equiv\; \frac{b_{\text{leg}}}{a_{\text{leg}}} = \frac{|OB|}{|OA|} = t_{\text{legacy}}.$$
- **Свойства паспорта (`CANONICAL_SHAPE_RATIO_PASSPORT`):**
  - диапазон $(0, +\infty)$, безразмерная (однородность степени $0$ по масштабу $\lambda > 0$);
  - при перестановке катетов `sideA ↔ sideB` выполняется инверсия $\rho \mapsto 1/\rho$ ($\ln\rho' = -\ln\rho$), ось симметрии $\rho = 1$;
  - в спектральных формулах при $\text{sideB}=1, \text{sideA}=\rho$: $K_a/K_c = \frac{\rho^2}{1+\rho^2}$ (= Legacy $K_b/K_c$), $K_b/K_c = \frac{1}{1+\rho^2}$ (= Legacy $K_a/K_c$), $K_i/K_c = \frac{(\rho+1-\sqrt{\rho^2+1})^2}{1+\rho^2}$;
  - в Legacy прежнее `t` сохранено без изменений.

---

## 3. Как разведены спектральный параметр и длины касательных

По `src/tests/experiment06.audit.test.ts:49-57`, `src/math/experiments/arcSideAreaCorrespondence.ts:146-148,266-268` и `EXPERIMENT_06_ARC_SIDE_AREA_CORRESPONDENCE.md:30,50` подтверждено, что `t_A, t_B, t_C` означают именно длины отрезков касательных от вершин к $K_i$ ($p-a, p-b, p-c=r$). В Canonical Stand они вычисляются без потери знаков и закреплены как:
- `tangentSegA = sideB - r = p - sideA = r·cot(alpha/2)` (Legacy Exp 06 `t_A`);
- `tangentSegB = sideA - r = p - sideB = r·cot(beta/2)` (Legacy Exp 06 `t_B`);
- `tangentSegC = r = p - sideC` (Legacy Exp 06 `t_C`).
В Legacy-файлах старые имена `t_A, t_B, t_C` не изменялись.

---

## 4. Какие тесты добавлены и запущены

- **Добавлен независимый тестовый набор Task 3:** `src/tests/canonical/semanticContract.canonical.test.ts` (7 математических групп проверок: все 5 окружностей, все 3 квадрата, связь стороны и противоположной вершины + теорема синусов, точная формула `shapeRatio` и спектр vs Legacy `t`, инверсия при `sideA ↔ sideB`, несовпадение с углами $\alpha,\beta,\gamma$, размерностное и аналитическое разделение с `tangentSegA/B/C`).
- **Результаты запуска:**
  - `npx tsx src/tests/canonical/test01_controlTriangles.canonical.test.ts` — **PASSED** (`CT-01`);
  - `npx tsx src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` — **PASSED** (`CT-02`);
  - `npx tsx src/tests/canonical/test03_inputValidation.canonical.test.ts` — **PASSED** (`CT-03`);
  - `npx tsx src/tests/canonical/semanticContract.canonical.test.ts` — **PASSED** (все 7 проверок контракта);
  - `npm test` — **PASSED** (все 10 секций Legacy-набора);
  - `compile_applet` + `lint_applet` (`tsc --noEmit`) — **PASSED**.

---

## 5. Какие файлы изменены и созданы

- **Код Canonical Stand и тесты (`src/canonical/`, `src/tests/canonical/`):**
  - `src/canonical/types.ts` *(обновлён)* — добавлены `shapeRatio`, `shapeRatioDefinition`, `tangentSegA/B/C`, `CanonicalObjectIdentityRecord`, `CanonicalShapeRatioPassport`.
  - `src/canonical/canonicalFourCircles.ts` *(обновлён)* — вычисление `shapeRatio`, `shapeRatioDefinition` и свободных от сокращения значимых цифр `tangentSegA/B/C`.
  - `src/canonical/semanticContract.ts` *(создан)* — `CANONICAL_SHAPE_RATIO_PASSPORT`, `computeCanonicalShapeRatio`, `evaluateCanonicalSpectralByShapeRatio`, `buildCanonicalObjectIdentityCatalog`.
  - `src/canonical/index.ts` *(обновлён)* — экспорт `semanticContract.ts`.
  - `src/tests/canonical/semanticContract.canonical.test.ts` *(создан)* — независимая верификация Task 3.
- **Документация стандарта и аудита (`docs/standards/`, `docs/audit/`):**
  - `docs/standards/CANONICAL_SEMANTIC_CONTRACT.md` *(создан)*;
  - `docs/standards/MATHEMATICAL_NOTATION_STANDARD.md` *(обновлён: убран черновой текст проверки $T_c$, добавлены `shapeRatio`, `shapeRatioDefinition`, `tangentSegA/B/C`, синхронизирована строка 5 таблицы раздела 5)*;
  - `docs/audit/NOTATION_MIGRATION_MAP.md` *(обновлён: `t → shapeRatio`, добавлена строка `t_A/B/C → tangentSegA/B/C`)*;
  - `docs/audit/ORIENTATION_AND_SPECTRAL_AUDIT.md` *(обновлён: раздел 2.2 синхронизирован с контрактом Task 3)*;
  - `docs/audit/LEGACY_TESTS_REGISTRY.md` *(обновлён статус Task 3 и ссылка в `LT-07` без изменения статуса `NOT_STARTED`)*;
  - `docs/audit/MIGRATION_PROTOCOL.md` *(обновлён заголовок и диагностика `LT-07` без изменения статуса `NOT_STARTED`)*;
  - `docs/audit/SHADOW_STAND_MIGRATION_REPORT.md` *(обновлён до Checkpoint 3)*.

---

## 6. Подтверждение неизменности Legacy Stand

- **Git недоступен:** в `/app/applet` отсутствует `.git` (`fatal: not a git repository`), проверка проведена инструментально.
- **SHA-256 контрольные суммы `src/`:** до начала Task 3 сняты суммы всех **57** legacy-файлов в `src/`; после всех правок `sha256sum -c` показал **57 / 57 `OK`**.
- **Временные метки `docs/`:** проверка `stat` по всем **49** legacy-файлам в `docs/` (вне `docs/audit/` и `docs/standards/`) подтвердила сохранность исходной метки времени `2026-11-26 08:22:11 +0000` (`epoch 1795681331`).

---

## 7. Какие вопросы остались нерешёнными (до следующих этапов)

1. **Массовая миграция тестов `LT-04` – `LT-23`:** 20 из 23 тестов по-прежнему в статусе `NOT_STARTED` (ожидают одобрения на следующий батч, например `LT-04`–`LT-08`).
2. **Несинхронизированные заголовки и старые счётчики в Legacy-документации (`docs/FORMULA_PASSPORTS.md`, `VERIFICATION_MATRIX.md`, `FORMULA_DEPENDENCY_GRAPH.md`, `NUMERICAL_ANALYSIS.md`):** сознательно не правлены из-за запрета на изменение Legacy-файлов.
3. **Stage 4 корневой аудит `CLASS D` в Exp 06** (трансцендентный/численный характер корней совпадения долей, например $\alpha \approx 34.36^\circ$) — запланирован после завершения миграции или по отдельному указанию.
