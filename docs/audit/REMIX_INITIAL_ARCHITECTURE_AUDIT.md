# Начальный архитектурный аудит репозитория после Remix (`REMIX_INITIAL_ARCHITECTURE_AUDIT`)

**Проект:** `Pythagoras-Circles-Lab` (после Remix)  
**Тип документа:** Ознакомительный аудит структуры, поколений архитектуры, математической и численной базы  
**Режим выполнения:** Read-only аудит без изменения исходного кода, тестов и существующей документации

---

## 1. Фактическая структура репозитория после Remix

По состоянию рабочего дерева репозитория проект содержит **3 основных функциональных контура** (Legacy-стенд v1.2.0 + эксперименты 01–06, теневой стенд New Canonical и многослойную документацию) и **1 остаточный контур артефактов Remix**:

| Каталог / группа | Состав и фактическое количество | Назначение в репозитории |
|---|---|---|
| **Корень репозитория** | 13 файлов: `package.json`, `metadata.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `bun.lock`, `README.md`, `README_RU.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `.env.example`, `.gitignore` | Конфигурация Vite + React + TypeScript (`package.json`: `"name": "pythagoras-circles-lab"`, `"version": "1.2.0"`), метаданные AI Studio, корневые README и changelog. |
| **`src/canonical/`** | 6 файлов: `index.ts`, `types.ts`, `semanticContract.ts`, `canonicalFourCircles.ts`, `canonicalValidators.ts`, `legacyMapping.ts` | Теневое математическое ядро **New Canonical** (противолежащая нотация `sideA/sideB/sideC`, валидаторы `NC-01`, семантический мост `Vertex-Preserving`). |
| **`src/tests/canonical/`** | 7 файлов: `testHelpers.ts`, `semanticContract.canonical.test.ts`, `test01_controlTriangles.canonical.test.ts`, `test02_legSwapSymmetry.canonical.test.ts`, `test03_inputValidation.canonical.test.ts`, `test04_numericalStability.canonical.test.ts`, `experiment06.strictRootAudit.test.ts` | Канонические тесты (`CT-01`..`CT-04` из 23 запланированных, тест контракта, строгий аудит корней Эксперимента 06). |
| **`src/math/` (ядро Legacy)** | 10 файлов: `RightTriangle.ts`, `SquareConstruction.ts`, `FourCirclesModel.ts`, `FourCirclesValidators.ts`, `ThalesCircumcircle.ts`, `ThalesValidators.ts`, `FourCirclesSpectralAnalysis.ts`, `inputValidation.ts`, `presets.ts`, `symmetryAnimation.ts` | Действующее вычислительное ядро **Legacy / Previous Canonical** (используется текущим UI). |
| **`src/math/experiments/`** | 6 файлов: `circleFirstClassification.ts` (Exp 01), `arcBasedClassification.ts` (Exp 02), `arcGeometricValidation.ts` (Exp 03), `arcAngleParametricAnalysis.ts` (Exp 04), `incircleArcDistribution.ts` (Exp 05), `arcSideAreaCorrespondence.ts` (Exp 06) | Вычислительные модули 6 исследовательских экспериментов, интегрированные в Legacy UI. |
| **`src/components/`** | 26 файлов в 3 подкаталогах:<br>• `common/` (4): `Header.tsx`, `BottomToolbar.tsx`, `MathFormula.tsx`, `MetricCard.tsx`<br>• `geometry/` (9): `GeometryBoard.tsx`, `CoordinateGrid.tsx`, `RightTriangleView.tsx`, `FourCirclesView.tsx`, `InteractivePoint.tsx`, `ArcClassificationBoardOverlay.tsx`, `ArcAngleBoardOverlay.tsx`, `IncircleArcDistributionOverlay.tsx`, `ArcSideAreaBoardOverlay.tsx`<br>• `panels/` (13): `ControlsPanel.tsx`, `FourCirclesPanel.tsx`, `InvariantsPanel.tsx`, `SpectralAnalysisPanel.tsx`, `ThalesCircumcirclePanel.tsx`, `KcVsKoComparison.tsx`, `ArcClassificationPanel.tsx`, `ArcAngleAnalysisPanel.tsx`, `IncircleArcDistributionPanel.tsx`, `ArcSideAreaPanel.tsx`, `ComparisonModal.tsx`, `TestRunnerModal.tsx`, `HelpModal.tsx` | Графическая сцена SVG, панели управления/анализа и модальные окна действующего Legacy-приложения. |
| **Прочие файлы `src/`** | `App.tsx`, `main.tsx`, `index.css`, `types/geometry.ts`, `geometry/transforms.ts`, `i18n/translations.ts` (6 файлов) | Корневая оркестрация UI, Legacy-типы, преобразование координат и трёхъязычная локализация (`RU / UK / EN`). |
| **`src/tests/` (корень Legacy)** | 9 файлов: `geometry.test.ts` (секции 1–10), `experiment01.circleFirst.test.ts` .. `experiment05.incircleArcDistribution.test.ts`, `experiment06.arcSideArea.test.ts`, `experiment06.audit.test.ts`, `semanticFormulaPassports.test.ts` | Набор тестов Legacy-ядра, экспериментов 01–06 и семантических паспортов `F-001..F-007`. |
| **`docs/` (верхний уровень)** | 14 `.md`-файлов (`ARCHITECTURE.md`, `FORMULA_DEPENDENCY_GRAPH.md`, `FORMULA_PASSPORTS.md`, `MATHEMATICAL_FOUNDATION.md`, `MATHEMATICAL_PROOFS.md`, `NUMERICAL_ANALYSIS.md`, `PREPRINT_ZENODO.md`, `PROJECT_STATUS.md`, `RELEASE_NOTES_v1.2.0.md`, `RELEASE_READINESS.md`, `ROADMAP.md`, `USER_GUIDE.md`, `VERIFICATION_AND_TESTING.md`, `VERIFICATION_MATRIX.md`) + `assets/four-circles-diagram.svg` | Основная документация Legacy-стенда v1.0–v1.2.0 и реестр паспортов `PCL-*`. |
| **`docs/archive/legacy-pythagorean-pants/`** | 5 файлов: `INVARIANT_PROOFS_v1.0.md`, `MATHEMATICAL_FOUNDATION_v1.0.md`, `MATHEMATICAL_SPEC_v1.0.md`, `NUMERICAL_ANALYSIS_v1.0.md`, `VERIFICATION_MATRIX_v1.0.md` | Исторический архив до-PCL версии («Пифагоровы штаны»). |
| **`docs/experiments/`** | 7 `.md`-файлов (`EXPERIMENT_01..06`, `EXPERIMENT_06_MATHEMATICAL_AUDIT.md`) + 13 SVG-графиков в `figures/` | Отчёты по экспериментам 01–06 и их математический аудит. |
| **`docs/semantic-formula-passports/`** | 9 файлов: `README.md`, `DEPENDENCY_GRAPH.md`, `F-001` .. `F-007` | Переходный слой семантических формульных паспортов UMFP. |
| **`docs/standards/`** | 2 файла: `CANONICAL_SEMANTIC_CONTRACT.md`, `MATHEMATICAL_NOTATION_STANDARD.md` | Нормативные спецификации **New Canonical**. |
| **`docs/audit/`** | 13 файлов: `EXPERIMENT_06_STRICT_ROOT_AUDIT.md`, `LEGACY_TESTS_REGISTRY.md`, `MATHEMATICAL_EXPERIMENT_INVENTORY.md`, `MATHEMATICAL_RESULT_CLASSIFICATION.md`, `MIGRATION_PROTOCOL.md`, `NOTATION_MIGRATION_MAP.md`, `ORIENTATION_AND_SPECTRAL_AUDIT.md`, `SHADOW_STAND_MIGRATION_REPORT.md`, `STAGE_5_1_CANONICAL_MIGRATION.md`, `STAGE_5_2_CANONICAL_MIGRATION.md`, `STAGE_5_2_1_NUMERICAL_CLARIFICATION.md`, `STAGE_5_2_2_NUMERICAL_CORE_DESIGN.md`, `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` | Полный след аудита математической/символьной/тестовой миграции к New Canonical. |
| **`public/assets/aistudio/`** | 7 файлов: `Zenodo_Preprint_Manuscript_LaTeX__PDF__2__f2b9ee57.pdf`, 4 `figure_*`, `review_checklist_*`, `zenodo_preprint_manuscript_markdown_*` | Публичные материалы препринта Zenodo (фактически присутствуют на диске). |
| **`.aistudio/artifacts/brain/`** | Следы раннего Remix / эскиза: `PFB_006_Four_Circles_Sketch.md` (+ `.metadata.json`) и временные медиа-изображения | Внутренние артефакты AI Studio (не входят в runtime-сборку приложения). |

Итого в `src/` фактически находится **66 файлов** (против `34`, упоминаемых в ряде устаревших обзоров — см. раздел 9).

---

## 2. Обнаруженные поколения архитектуры

Анализ кода и документации выявляет **три исторических пласта**, причём в активном проекте одновременно сосуществуют два конкурирующих поколения — **Legacy / Previous Canonical** и **New Canonical**.

### Поколение 0: Архивный прототип («Пифагоровы штаны» / PFB-006)
- **Файлы:** `docs/archive/legacy-pythagorean-pants/*_v1.0.md`, остаточное описание в `metadata.json` (`"Remix КРУГИ Pythagoras Geometry Lab"`), артефакт `.aistudio/artifacts/brain/b396dff1-d92c-4d15-9380-707726a19318/PFB_006_Four_Circles_Sketch.md`.
- **Роль:** Исключительно историческая предыстория модели четырёх кругов без вневписанных окружностей.

### Поколение A: Legacy / Previous Canonical (PCL v1.0–v1.2.0 + Эксперименты 01–06)
- **Код:** `src/math/*`, `src/math/experiments/*`, `src/types/geometry.ts`, `src/geometry/transforms.ts`, `src/components/**/*`, `src/App.tsx`, `src/tests/*.test.ts` (`geometry.test.ts`, `experiment01..06*.test.ts`, `semanticFormulaPassports.test.ts`).
- **Документация:** `README.md`, `docs/ARCHITECTURE.md`, `docs/MATHEMATICAL_FOUNDATION.md`, `docs/MATHEMATICAL_PROOFS.md`, `docs/FORMULA_PASSPORTS.md`, `docs/FORMULA_DEPENDENCY_GRAPH.md`, `docs/NUMERICAL_ANALYSIS.md`, `docs/VERIFICATION_MATRIX.md`, `docs/experiments/*`.
- **Переходный мост UMFP:** `docs/semantic-formula-passports/F-001`..`F-007` (методически описывает базовые формулы `F-001..F-006`, но в `F-007` опирается на инвертированную угловую конвенцию Experiment 04).
- **Характерные признаки:**
  - Обозначения сторон привязаны к осям, а не к противоположным вершинам: $a = |OA|$ по $+Oy$, $b = |OB|$ по $+Ox$ (`src/math/RightTriangle.ts:24-31`, `docs/MATHEMATICAL_FOUNDATION.md:14-17`).
  - Внутри одного поколения возникли конфликты нотации: в `RightTriangle.ts:39-40` $\alpha = \angle A$, тогда как в `src/math/experiments/arcAngleParametricAnalysis.ts:36-40` и `arcSideAreaCorrespondence.ts:30-31` $\alpha = \angle B$; одновременно в `FourCirclesSpectralAnalysis.ts:292` введён параметр $t = b/a$, а в `arcSideAreaCorrespondence.ts:78` — касательные отрезки $t_A, t_B$ и площади $S_a, S_b, S_c$.
  - Валидация строится вокруг 17 проверок (`FourCirclesValidators.ts` + `ThalesValidators.ts`), где контраст площадей нормируется по $K_c$ без проверки знака (`FourCirclesValidators.ts:217, 306`).
  - UI жёстко связан с 9 вкладками, Legacy-объектом `FourCirclesCalculations` и оверлеями экспериментов.

### Поколение B: New Canonical (Стандарты, Аудит этапов 1–5.2.3 и Теневой стенд)
- **Код:** `src/canonical/*` (6 модулей) и `src/tests/canonical/*` (7 модулей).
- **Документация:** `docs/standards/*` и `docs/audit/*`.
- **Характерные признаки:**
  - Жёсткая **трёхслойная модель идентичности** (Геометрическая сущность → Семантическая роль → Символ/ID) в `docs/standards/CANONICAL_SEMANTIC_CONTRACT.md` §1.
  - Единая **противолежащая евклидова конвенция** (`MATHEMATICAL_NOTATION_STANDARD.md` §1): $C=(0,0)$, $A=(0, \text{sideB})$, $B=(\text{sideA}, 0)$, где `sideA` $= |BC|$ лежит напротив $\angle A = \alpha$, `sideB` $= |AC|$ — напротив $\angle B = \beta$.
  - Устранение всех 6 коллизий символов (`NOTATION_MIGRATION_MAP.md` §1–5).
  - Уточнённый численный контракт `NC-01` (`STAGE_5_2_1_NUMERICAL_CLARIFICATION.md`) и переориентация на двухуровневый **практический геометрический домен** (`STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md`), отменяющий обязательность экстремальных IEEE-754/BigInt сдвигов для рабочей системы.
  - Разделение эпистемических статусов математических утверждений (`PROVEN`, `NUMERICALLY OBSERVED`, `REFUTED`, `UNPROVEN_HYPOTHESIS`) в `MATHEMATICAL_RESULT_CLASSIFICATION.md` и `EXPERIMENT_06_STRICT_ROOT_AUDIT.md`.

---

## 3. Документы, определяющие New Canonical Architecture, и их фактическая иерархия

Вопреки датам или объёму более ранних документов (`ARCHITECTURE.md`, `MATHEMATICAL_FOUNDATION.md`, `FORMULA_PASSPORTS.md`), актуальная иерархия нормативных источников для новой системы распределяется по четырём уровням:

### Уровень 1 — Высшие нормативные спецификации языка и семантики
1. **`docs/standards/MATHEMATICAL_NOTATION_STANDARD.md`** (`v1.0-standard`) — единый стандарт вершин, сторон, углов, окружностей ($K_a, K_b, K_c, K_i, K_o$), квадратов ($Q_a, Q_b, Q_c$), разбиения инцентра, безразмерного отношения $\rho = \text{sideA}/\text{sideB}$ и масштаба $\lambda$, запрет на 6 коллизий символов.
2. **`docs/standards/CANONICAL_SEMANTIC_CONTRACT.md`** — трёхслойная модель идентичности, правила определения ориентации треугольника (`vertex_preserving` как активный стандарт и `mirror_leg_name_preserving` как альтернативный режим), обязательный `shapeRatioDefinition`, контракт семантической инвариантности.

### Уровень 2 — Нормативные контракты численной модели и рабочего домена
3. **`docs/audit/STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md`** — **актуальное перекрывающее решение** по рабочему домену (Level 1 Visual, Level 2 Research, Out-of-Domain), пересмотр статуса `CT-04` под практический домен, отказ от BigInt/экстремального IEEE-754 как обязательного канона, фильтр включения результатов экспериментов `EXP-01..06` в Canonical.
4. **`docs/audit/STAGE_5_2_1_NUMERICAL_CLARIFICATION.md`** — уточнение численного контракта `NC-01` (`area_non_equality_contrast`: нормировка по `max(1e-300, K_i)` и знак `areaMinusAll < 0`), три уровня статусов достоверности (`MATHEMATICAL_PROVEN`, `IEEE754_VERIFIED`, `NUMERICALLY_DEGRADED`).
5. **`docs/audit/STAGE_5_2_2_NUMERICAL_CORE_DESIGN.md`** — **целевой архитектурный дизайн** разделения 3 слоёв вычислительного результата (`CanonicalMathematicalResult` / `FloatingPointContrastEvaluation` / `NumericalReliabilityDiagnostic`). *Примечание: имеет статус DESIGN ONLY (см. §7 `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md`) и пока не воплощён в коде `src/canonical/`.*

### Уровень 3 — Математический отбор, аудит и протоколы миграции
6. **`docs/audit/EXPERIMENT_06_STRICT_ROOT_AUDIT.md`** (Этап 4.1) — строгие аналитические доказательства и разделение `PROVEN` vs `NUMERICALLY OBSERVED` (через внешнюю IEEE-754 интервальную оболочку) для 6 точек совпадения долей в Эксперименте 06.
7. **`docs/audit/MATHEMATICAL_RESULT_CLASSIFICATION.md`** — классификатор всех формул и выводов по классам `CLASS A`..`CLASS E` (критерий включения в Canonical).
8. **`docs/audit/NOTATION_MIGRATION_MAP.md`** — полная карта соответствий и устранения коллизий между Legacy, `EXP-01..06` и New Canonical.
9. **`docs/audit/ORIENTATION_AND_SPECTRAL_AUDIT.md`** — аудит противоречия `a/b` и $\alpha/\beta$ в `RightTriangle.ts` vs `EXP-03..06` и `FourCirclesSpectralAnalysis.ts`.
10. **`docs/audit/MATHEMATICAL_EXPERIMENT_INVENTORY.md`** — инвентаризация всех 6 экспериментов (`EXP-01..06`), их файлов, тестов и формул.
11. **`docs/audit/MIGRATION_PROTOCOL.md`**, **`docs/audit/LEGACY_TESTS_REGISTRY.md`**, **`docs/audit/SHADOW_STAND_MIGRATION_REPORT.md`**, **`docs/audit/STAGE_5_1_CANONICAL_MIGRATION.md`**, **`docs/audit/STAGE_5_2_CANONICAL_MIGRATION.md`** — реестр 23 Legacy-тестов (`LT-01..23`), 6-пунктовый паспорт миграции в `CT-*` и отчёт по миграции первых 4 тестов (`CT-01..04`).
    *(Ограничение: `STAGE_5_2_CANONICAL_MIGRATION.md` в части BigInt-оракула и масштабов $10^{\pm 150}$ был пересмотрен документами `STAGE_5_2_1`–`STAGE_5_2_3`.)*

### Уровень 4 — Переходные и справочные документы (Legacy Reference Only)
- `docs/semantic-formula-passports/README.md`, `DEPENDENCY_GRAPH.md`, `F-001..F-007` — переходные паспорта (требуют приведения `F-007` к каноническому углу $\alpha = \angle A$).
- Все документы в `docs/*.md` (v1.0–v1.2.0), `docs/experiments/*` и `docs/archive/*` — **исторические / Legacy Reference**, не являются нормативными для новой архитектуры.

---

## 4. Отличия Previous Canonical (Legacy Core) от New Canonical

| Аспект | Previous Canonical (Legacy Core: `src/math/*`) | New Canonical (`docs/standards/*`, `docs/audit/*`, `src/canonical/*`) |
|---|---|---|
| **Модель идентификации объектов** | Плоские структуры (`RightTriangleCalculations`, `SquareGeometry`, `CircleGeometry`), привязанные к именам полей (`a, b`, `circleA/B`) | Трёхслойный контракт (`CANONICAL_SEMANTIC_CONTRACT.md` §1): **Сущность** (геометрия) → **Роль** (`oppositeSide`, `incircleKi`) → **Символ/ID** |
| **Вершины и ориентация треугольника** | $O=(0,0), A=(0,a), B=(b,0)$; катет $a=\|OA\|$ при вершине $A$, катет $b=\|OB\|$ при вершине $B$ (`RightTriangle.ts:24-31`) | **Режим `vertex_preserving`** (`MATHEMATICAL_NOTATION_STANDARD.md` §1, `legacyMapping.ts:22-35`): $C=(0,0)$, $A=(0,\text{sideB})$, $B=(\text{sideA},0)$; `sideA = \|BC\|` напротив $A$, `sideB = \|AC\|` напротив $B$ |
| **Квадраты и круги на катетах** | `squareA/circleA` в II квадранте (на $OA=a$), `squareB/circleB` в IV квадранте (на $OB=b$) (`FourCirclesModel.ts:44-59`) | `squareA/circleKa` ($Q_a, K_a$) в IV квадранте на $BC=\text{sideA}$; `squareB/circleKb` ($Q_b, K_b$) в II квадранте на $AC=\text{sideB}$ (`canonicalFourCircles.ts:111-155`) |
| **Углы $\alpha$ и $\beta$** | **Коллизия:** `RightTriangle.ts:39-40` задаёт $\alpha = \angle A$, но `EXP-03..06` задают `alphaDeg` $= \angle B$ (в `ArcAngleAnalysisPanel.tsx` и `ArcAngleBoardOverlay.tsx` обе конвенции сосуществуют одновременно) | Строго $\alpha = \angle A = \operatorname{atan2}(\text{sideA}, \text{sideB})$ и $\beta = \angle B = 90^\circ - \alpha$ (`canonicalFourCircles.ts:80-81`); выполняется $\text{sideA} > \text{sideB} \iff \alpha > \beta$ |
| **Параметр формы** | Неоднозначный `t = b/a` (`FourCirclesSpectralAnalysis.ts:292`) | `shapeRatio` $\rho = \text{sideA}/\text{sideB} = \tan\alpha$ с обязательным дискриминатором `shapeRatioDefinition: 'sideA / sideB'` (`CANONICAL_SEMANTIC_CONTRACT.md` §3, `types.ts:132`) |
| **Длины окружностей, дуги, касательные, подтреугольники** | 5 коллизий: `Pa..Pi` и `Lo` (`FourCirclesSpectralAnalysis.ts:185, 274`), `t_A/t_B/t_C` (`arcSideAreaCorrespondence.ts:78`), `S_a/S_b/S_c` (`ThalesCircumcircle.ts:131-133` vs `Exp 06:34-36`), `phiDeg` vs `thetaCotHalfDeg` (`Exp 02:24-26`) | Однозначные имена (`NOTATION_MIGRATION_MAP.md` §1–5): `circumferenceKa..Ko` ($C_a..C_o$), `tangentSegA/B/C` ($p-a, p-b, p-c=r$), `subtriangleAreaA/B/C` ($S_A..S_C$) vs `squareAreaA/B/C` ($a^2,b^2,c^2$), `arcAngleADeg/BDeg/CDeg` ($\varphi_A..C$) vs `tangentPolarAngleDeg` ($=\beta$) |
| **Валидация контраста площадей (`NC-01`)** | `FourCirclesValidators.ts:217, 306`: нормировка по $K_c$ без проверки знака `areaMinusAll < 0` (маскирует потерю точности и смену знака при большом $\rho$) | `canonicalValidators.ts:125-126, 188`, `STAGE_5_2_1` §2.4: нормировка по $\max(10^{-300}, K_i)$ и обязательная проверка `areaMinusAll < 0` |
| **Микро-масштабы и расстояние до прямой** | `FourCirclesValidators.ts:17, 130`: `Math.max(1, ...)` завышает знаменатель при $r < 1$; неинвариантный `pointToLineDistance` | `canonicalValidators.ts:20, 62, 179`: `Math.max(1e-300, ...)` и трансляционно-инвариантный `pointToLineDistance` |
| **Рабочий диапазон и тесты** | Экстремальный диапазон в `LT-04` (`1e-6`..`1e50`, `1e5:1`), 17 инвариантов Legacy без статуса домена | Двухуровневый практический домен (`STAGE_5_2_3`): Level 1 `[0.5, 15] & [1/24, 24]`, Level 2 `[0.1, 150] & [0.01, 100]`; мигрировано `CT-01..04` (из 23); **пока отсутствуют** в `src/canonical/` валидаторы $K_o$ и модуль масштабирования $\lambda$ |

---

## 5. Математические свойства, уже подтверждённые (`PROVEN`) и пригодные для новой системы

Согласно `docs/audit/MATHEMATICAL_RESULT_CLASSIFICATION.md`, `docs/audit/EXPERIMENT_06_STRICT_ROOT_AUDIT.md` и фильтру `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` §3, в новое ядро правомерно переносить только следующие доказанные свойства:

1. **Евклидово ядро 4 и 5 кругов (`MATHEMATICAL_PROOFS.md` §1–4, `STAGE_5_1`):**
   - Теорема Пифагора $a^2 + b^2 = c^2$ (`sideC = Math.hypot(sideA, sideB)`), $S_{\triangle} = \frac{1}{2}ab = pr$, $h_c = \frac{ab}{c}$.
   - Безвычитательная формула вписанного радиуса $r = \frac{ab}{a+b+c} = \frac{a+b-c}{2} > 0$ и центр инцентра $I=(r,r)$.
   - Точные координаты центров, вершин квадратов $Q_a, Q_b, Q_c$ и точек касания $T_a=(0,r), T_b=(r,0), T_c=(r(1+a/c), r(1+b/c))$ (в канонических координатах `T_a` на `sideA`, `T_b` на `sideB`).
   - Пифагорова сумма площадей квадратных кругов $K_a + K_b = K_c$.
   - **Центральное тождество корней площадей:** $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ и его безразмерная форма $\Psi(r, t) = \sqrt{K_a}+\sqrt{K_b}-\sqrt{K_c}-\sqrt{K_i} \equiv 0$.
   - Строгий площадной контраст: $K_a + K_b - K_c - K_i = -K_i < 0$.
   - Окружность Фалеса $K_o$: диаметр $D_o = c$, $R_o = c/2$, центр $O_o = \frac{A+B}{2}$, равенство площадей и длин $K_o = K_c$, $C_o = C_c$ при несовпадении центров $|O_o - O_c| = c/2 > 0$.
2. **Двухпараметрическая геометрия $(\rho, \lambda)$ (`MATHEMATICAL_PROOFS.md` §4–5, `ThalesCircumcircle.ts`):**
   - Ортогональное разделение формы ($\rho = \text{sideA}/\text{sideB}$) и масштаба ($\lambda = c/c_0$).
   - Закон однородности: линейные величины ($a,b,c,r,R_o,D_o,C_a..C_o$) однородны степени $1$ по $\lambda$; площади ($K_a..K_o, Q_a..Q_c, S_{\triangle}$) однородны степени $2$; безразмерные отношения ($\alpha, \beta, \rho$, доли) имеют степень $0$.
   - Симметрия инволюции $\rho \leftrightarrow 1/\rho$ ($\alpha \leftrightarrow \beta$) с единственной неподвижной точкой $\rho = 1$ ($\alpha = \beta = 45^\circ$), где достигается глобальный максимум $K_i / K_c = 3 - 2\sqrt{2} \approx 0.171573$.
3. **Подтверждённые закономерности Экспериментов 01–06 (`MATHEMATICAL_RESULT_CLASSIFICATION.md` Класс A–C, `STAGE_5_2_3` §3):**
   - **Exp 01:** Параметризация $(r, t)$ / $(r, \rho)$ однозначно разделяет масштаб и форму.
   - **Exp 02:** Формула числа шагов при равномерной линейной дискретизации $N_{\text{lin}}(r, \Delta L) = \lfloor \frac{\pi r}{2\Delta L} \rfloor$ (растёт пропорционально $r$) против масштабно-инвариантного $N_{\text{ang}}(\Delta\varphi)$; отсутствие точных зеркальных дубликатов при несимметричных линейных сетках на $(0, \pi r/2)$.
   - **Exp 03–04:** Касательная гипотенузы в точке $T_{AB}$ с полярным углом от нормали $N=(r,2r)$ к $E=(2r,r)$ (равным $\beta$ в канонической нотации) даёт истинную длину дуги $L = r\beta_{\text{рад}}$ (или в каноническом угле $\alpha$: $T_{AB}=(r(1+\cos\alpha), r(1+\sin\alpha))$, $L = r(\frac{\pi}{2}-\alpha)$), а формулы сторон по $(r, \alpha)$ тождественно удовлетворяют $a^2+b^2=c^2$ и $a+b-c=2r$.
   - **Exp 05:** Теорема дополнительных углов дуг инцентра $\varphi_X = 180^\circ - X$, сумма $\varphi_A + \varphi_B + \varphi_C = 360^\circ$, строгий инвариант дуги гипотенузы $\varphi_C \equiv 90^\circ$ ($w^{\text{arc}}_C = \frac{1}{4}$), невозможность равенства всех трёх дуг $120^\circ$ в прямоугольном треугольнике (так как $\varphi_C = 90^\circ \ne 120^\circ$).
   - **Exp 06 (`L-01`..`L-08` и `EXPERIMENT_06_STRICT_ROOT_AUDIT.md`):**
     - Изоморфизм долей площадей подтреугольников и сторон: $w^{\text{area}}_k = S_k/S = s_k/(a+b+c) = w^{\text{side}}_k$ (`L-01`).
     - Синусная реконструкция формы по долям дуг: $w^{\text{area}}_A : w^{\text{area}}_B : w^{\text{area}}_C = \sin\varphi_A : \sin\varphi_B : \sin\varphi_C$ (`L-03`).
     - Гиперболический инвариант половинных тангенсов $(\tan\frac{\varphi_A}{2}-1)(\tan\frac{\varphi_B}{2}-1)=2$ и $\frac{S}{r^2} = \tan\frac{\varphi_A}{2}\tan\frac{\varphi_B}{2}$ (`L-04`).
     - Пифагорово соотношение малых площадей $S_A^2 + S_B^2 = S_C^2$ (`L-05`) и площадной дефект $S_A + S_B - S_C = r^2$ (`L-06`).
     - Строгое отличие радиусов касания и биссектрис $\psi_X = 90^\circ + X/2$ (`L-08`).
     - Доказанное отсутствие пересечений для пар долей $(A,B), (B,A), (C,C)$ и невозможность одновременного равенства всех трёх долей.
     - **Точные алгебраические корни (`PROVEN`):** корни #5 и #6 в каноническом $\alpha$: $\alpha_5 = \arctan(4/3)$ ($4:3:5$) и $\alpha_6 = \arctan(3/4)$ ($3:4:5$).
     - **Существование, единственность и зеркальная симметрия корней #1–#4 (`PROVEN`):** существование и единственность трансцендентных корней $(A,A), (B,B), (B,C), (A,C)$ и их строгая симметрия $\alpha_1 + \alpha_2 = 90^\circ$, $\alpha_3 + \alpha_4 = 90^\circ$ доказаны аналитически (численные же десятичные координаты этих четырёх корней имеют статус **`NUMERICALLY OBSERVED`** через IEEE-754 интервальную оболочку, см. `EXPERIMENT_06_STRICT_ROOT_AUDIT.md`).

---

## 6. Legacy-решения, гипотезы и пробы, которые НЕ должны переноситься в новую систему

На основании `MATHEMATICAL_RESULT_CLASSIFICATION.md` (Классы D и E), `STAGE_5_2_1`, `STAGE_5_2_3` (§1–4) и `MATHEMATICAL_PROOFS.md` §6 из новой системы **должны быть исключены**:

1. **Опровергнутые (`REFUTED`) формулы и гипотезы:**
   - Ошибочная предварительная формула из постановки Эксперимента 01 (`circleFirstClassification.ts:74-80`, `MATHEMATICAL_EXPERIMENT_INVENTORY.md` §4).
   - Подмена физического центрального угла касания удвоенным параметром $\theta = 2\beta$ в формуле длины дуги ($L = r\theta$ вместо $L = r\beta$), опровергнутая в Эксперименте 03 (`arcGeometricValidation.ts:34`).
   - Гипотеза о «предельной геометрической ёмкости» $L_{\max}$ семейства прямоугольных треугольников из Эксперимента 02 (`EXPERIMENT_02_ARC_BASED_CLASSIFICATION.md`, `MATHEMATICAL_RESULT_CLASSIFICATION.md` Класс E).
   - Предположение о возможности пропорционального совпадения всех трёх дуг и площадей одновременно в прямоугольном треугольнике (опровергнуто в Exp 05 и Exp 06 `L-07`).
2. **Неподтверждённые гипотезы (`UNPROVEN_HYPOTHESIS` / `CONJECTURE` / `ANALOGY`):**
   - Три открытые гипотезы раздела 12.3 `EXPERIMENT_04_ARC_ANGLE_PARAMETRIC_ANALYSIS.md:249-252` (`E-03`: выбор канонического логарифмического разбиения зон; `E-04`: спектральная плотность распределения треугольников; `E-05`: линейный сдвиг $\gamma/2$ для непрямоугольных треугольников).
   - Три направления раздела 6 `MATHEMATICAL_PROOFS.md:151-156` (аналогии с вневписанными окружностями/excircles, дискретное DFT-разложение 4 кругов, неевклидовы обобщения).
3. **Устаревшие / отклонённые вычислительные и доменные решения:**
   - **BigInt / double-double оракул и экстремальные IEEE-754 пробы** ($10^{-150}..10^{155}$, $10^{50}$, соотношения $10^5:1$ из Legacy `LT-04` и `STAGE_5_2`), отклонённые в `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` §1–2 ради ясного практического домена на стандартном `float64`.
   - **Устаревшие дефекты Legacy-валидации:** нормализация контраста по $K_c$ без проверки знака $D<0$ (`FourCirclesValidators.ts:217, 306`), порог делителя `Math.max(1, ...)` для микро-величин (`FourCirclesValidators.ts:17, 130`), неинвариантный расчёт `pointToLineDistance`.
   - **Околовырожденные и вырожденные пробы как рабочий домен стенда:** граничные углы $0^\circ, 90^\circ$, а также экстремальные точки $0.001^\circ, 89.999^\circ$ и широкий скан `0.01°..89.99°` из Exp 05/06 (`STAGE_5_2_3` §4 допускает их только как диагностические асимптотики, но не как рабочий домен UI).
   - **Упоминания и модели с вневписанными окружностями (excircles)** (`PFB_006_Four_Circles_Sketch.md:19`, `ROADMAP.md:10`).

---

## 7. Числовой и геометрический рабочий домен, заданный документацией

Нормативный рабочий домен новой системы зафиксирован в **`docs/audit/STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` (§1–2)** и уточнён контрактом `NC-01` в **`STAGE_5_2_1_NUMERICAL_CLARIFICATION.md`**:

### 7.1. Двухуровневый практический геометрический домен (`AND`-конъюнкция)
Треугольник входит в домен **только при одновременном** выполнении ограничений на оба катета и на их отношение формы $\rho = \text{sideA} / \text{sideB}$:

| Уровень домена | Статус (`DomainClass`) | Катеты `sideA`, `sideB` | Отношение формы $\rho = \text{sideA}/\text{sideB}$ | Производный диапазон углов $\alpha, \beta$ | Производный масштаб $\lambda = c/5$ | Достижимая погрешность `float64` (`CT-04`) |
|---|---|---|---|---|---|---|
| **Level 1 — Визуальный интерактивный домен** | `IN_LEVEL_1_VISUAL` | $[0.5,\; 15.0]$ | $[1/24,\; 24.0]$ | $[2.386^\circ,\; 87.614^\circ]$ | $[0.1414,\; 4.2426]$ | $\le 1.32 \times 10^{-13}$ (`maxDelta` в `CT-04`, допуск `1e-9`) |
| **Level 2 — Расширенный исследовательский домен** | `IN_LEVEL_2_RESEARCH` | $[0.1,\; 150.0]$ | $[0.01,\; 100.0]$ | $[0.573^\circ,\; 89.427^\circ]$ | $[0.0283,\; 42.4264]$ | $\le 2.34 \times 10^{-12}$ (на всех 457 точках `CT-04`, запас $> 420\times$ до `1e-9`) |
| **Вне рабочего домена** | `OUT_OF_PRACTICAL_DOMAIN` | $< 0.1$ или $> 150.0$ | $< 0.01$ или $> 100.0$ | $< 0.573^\circ$ или $> 89.427^\circ$ | — | Для них не гарантируются визуальная читаемость и UI-вывод `IEEE754_VERIFIED` |

### 7.2. Численный контракт и статусы достоверности
- **Базовый допуск ядра (`CANONICAL_CORE_TOLERANCE`):** `1e-9` (запас точности более $10^2$ раз внутри Level 2).
- **Численный контракт `NC-01` (`canonicalValidators.ts`):**
  - Контраст площадей $D = K_a + K_b - K_c - K_i$ проверяется относительно **целевой величины** $\max(10^{-300}, K_i)$: `|D - (-K_i)| / max(1e-300, K_i) < tol` **И** строго `D < 0`.
  - Тождество корней $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ вычисляется без вычитательного сокращения; в формулах радиуса обязательно $r = \frac{ab}{a+b+c}$.
- **Трёхуровневая диагностика результата (`STAGE_5_2_1` §3, `STAGE_5_2_2`, `STAGE_5_2_3` §7 — целевой дизайн):**
  - Эпистемическая истина: `MATHEMATICAL_PROVEN` (или `MATHEMATICALLY_TRUE_BY_PROOF`).
  - Вычислительная точность IEEE-754: `IEEE754_VERIFIED` vs `NUMERICALLY_DEGRADED` (при превышении порога ошибки усечения/вычитания).
  - Принадлежность домену: `IN_LEVEL_1_VISUAL`, `IN_LEVEL_2_RESEARCH`, `OUT_OF_PRACTICAL_DOMAIN`.

---

## 8. Какие части существующего приложения являются Legacy-графикой и не должны диктовать новую архитектуру

Следующие модули действующего приложения относятся к **Legacy-графике и Legacy-UI** и **не должны** определять архитектуру новой графической системы:

1. **Единый корневой оркестратор `src/App.tsx` (539 строк):**
   - Хранит состояние в Legacy-переменных `(a, b)`, зажимает их несогласованными функциями (`clampVal` → `[0.2, 15]` на стр. 130 против `[0.1, 150]` в `handleChangeArcPhi` на стр. 225–226), жёстко переключает 9 Legacy-вкладок (`ActiveModuleId`, стр. 418–493).
2. **Геометрическая сцена и координатный мост (`src/geometry/transforms.ts`, `src/components/geometry/GeometryBoard.tsx`, `RightTriangleView.tsx`, `FourCirclesView.tsx`):**
   - `transforms.ts` жёстко привязан к пиксельным преобразованиям и округлению `Math.round(mathP.y * 10) / 10` при перетаскивании.
   - `RightTriangleView.tsx` и `FourCirclesView.tsx` захардкожены на Legacy-раскладку (`triangle.a` по вертикали, `triangle.b` по горизонтали, `squareA` в II квадранте, `squareB` в IV квадранте) и напрямую читают Legacy-объект `FourCirclesCalculations`.
   - `GeometryBoard.tsx` вычисляет автоподгонку (`handleFitView`) через Legacy-размеры `calc.triangle.a / b` и смешивает логику перетаскивания точек (`A, B, T_AB`) с математическими пересчётами.
3. **Оверлеи экспериментов на сцене (`ArcClassificationBoardOverlay.tsx`, `ArcAngleBoardOverlay.tsx`, `IncircleArcDistributionOverlay.tsx`, `ArcSideAreaBoardOverlay.tsx`):**
   - Напрямую вызывают `src/math/experiments/*` внутри React-рендера (`computeIncircleArcDistribution`, `computeArcSideAreaPoint`, и т.д.).
   - Закрепляют конфликтующую терминологию (`alphaDeg` $= \angle B$ в UI) и смешивают геометрическую сцену с логикой конкретных экспериментов.
4. **Аналитические панели и модальные окна (`src/components/panels/*`):**
   - `SpectralAnalysisPanel.tsx` (1795 строк) жёстко зашит под Legacy `t = b/a`, содержит изолированную SVG-сцену размером `640x300` с собственной координатной системой и логикой кривых.
   - `ControlsPanel.tsx`, `FourCirclesPanel.tsx`, `InvariantsPanel.tsx`, `ThalesCircumcirclePanel.tsx`, `KcVsKoComparison.tsx`, `Arc*Panel.tsx`, `ComparisonModal.tsx`, `TestRunnerModal.tsx` напрямую завязаны на Legacy-поля `circleA/B`, `Pa..Pi`, `Lo`, `17` Legacy-валидаторов и старые обозначения в `src/i18n/translations.ts`.
   - `Header.tsx` закрепляет 9 Legacy-вкладок с индивидуальной цветовой логикой под старые модули.

---

## 9. Открытые вопросы и зафиксированные противоречия между документами

Ниже приведены **фактические расхождения и нерешённые вопросы**, зафиксированные в репозитории без их самовольного сглаживания:

### 9.1. Противоречия между документами и фактической кодовой базой
1. **Количество модулей приложения (5 против 9):** `docs/ARCHITECTURE.md` (§1, §5), `README.md` (§5), `docs/PROJECT_STATUS.md` (§1) и `docs/RELEASE_READINESS.md` описывают только 5 модулей (`01..05`), тогда как в коде (`src/types/geometry.ts:150-159`, `src/components/common/Header.tsx:28-38`, `src/App.tsx:418-493`) реализовано **9 модулей** (добавлены модули экспериментов 02, 04, 05, 06).
2. **Количество файлов в `src/` (34 против 66):** `README.md`, `docs/ARCHITECTURE.md` и `docs/RELEASE_READINESS.md` по-прежнему указывают `34` файла, тогда как фактическое дерево `src/` насчитывает **66 файлов**.
3. **Метаданные и название в `metadata.json`:** `docs/PROJECT_STATUS.md:59` утверждает, что `metadata.json` переименован в `"Pythagoras-Circles-Lab — Four-Circles Pythagorean Geometry Lab"`, но фактически в `metadata.json` сохраняется строка `"Remix КРУГИ Pythagoras Geometry Lab"` и упоминание `"Пифагоровы штаны"`.
4. **Наличие `public/assets/aistudio/`:** `docs/PROJECT_STATUS.md:55` и `docs/RELEASE_READINESS.md:20` утверждают, что неиспользуемый каталог `public/assets/aistudio/` удалён, однако на диске в нём по-прежнему находятся 7 файлов.
5. **Расхождение счётчиков паспортов UMFP и секций тестов:**
   - `docs/FORMULA_PASSPORTS.md:3,8` декларирует 29 паспортов (`PCL-A01..G29`), но в теле файла определено 30 паспортов (включая `PCL-G30`).
   - `docs/VERIFICATION_MATRIX.md:3,7` указывает 29 паспортов и секции `1–9` тестов, тогда как `src/tests/geometry.test.ts` содержит 10 секций (добавлена секция 10 для $\lambda$-масштабирования).
   - `docs/FORMULA_DEPENDENCY_GRAPH.md:3` по-прежнему ссылается на 24 паспорта (`PCL-A01..F24`).
6. **Точность округления и границы `clampVal` в `App.tsx`:** `docs/NUMERICAL_ANALYSIS.md:63-67` описывает округление в `App.tsx` до 4 знаков (`10000`), фактически `src/App.tsx:130` округляет до 6 знаков (`1e6`, как в `PCL-F24`) и зажимает катеты в `[0.2, 15]`, причём в том же файле `handleChangeArcPhi` (`App.tsx:225-226`) зажимает катеты в `[0.1, 150]`. Оба диапазона расходятся с двухуровневым стандартом `STAGE_5_2_3` (`[0.5, 15]` / `[0.1, 150]` с дополнительным ограничением на $\rho$).
7. **Коллизия значения $\alpha$ между стандартом New Canonical и `F-007` / `EXP-03..06`:** `MATHEMATICAL_NOTATION_STANDARD.md` и `CANONICAL_SEMANTIC_CONTRACT.md` фиксируют $\alpha = \angle A$, тогда как `docs/semantic-formula-passports/F-007-parametric-triangle-model.md` и `src/math/experiments/arcAngleParametricAnalysis.ts` / `arcSideAreaCorrespondence.ts` используют $\alpha = \angle B$.
8. **Разрыв между дизайном New Canonical и кодом `src/canonical/`:**
   - Документ `STAGE_5_2_2_NUMERICAL_CORE_DESIGN.md` и `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` (§7) задают 3-слойную архитектуру результата (`Layer A / B / C`) и доменную классификацию `IN_LEVEL_1_VISUAL / IN_LEVEL_2_RESEARCH / OUT_OF_PRACTICAL_DOMAIN`, однако `src/canonical/canonicalFourCircles.ts` и `src/canonical/canonicalValidators.ts` эти слои и доменные классы пока не реализуют.
   - В `src/canonical/` ещё не перенесены каноническая модель и 9 валидаторов окружности Фалеса $K_o$, а также двухпараметрическое масштабирование $\lambda$.
   - Из 23 Legacy-тестов (`LEGACY_TESTS_REGISTRY.md`) в `src/tests/canonical/` мигрированы только 4 (`CT-01`..`CT-04`), миграция остановлена перед `LT-05` (`SHADOW_STAND_MIGRATION_REPORT.md`).

### 9.2. Открытые продуктовые и архитектурные вопросы для дальнейших этапов
1. **Выбор канонической визуальной ориентации сцены:** подтвердить для UI активный режим `vertex_preserving` ($C=(0,0), A=(0,\text{sideB}), B=(\text{sideA},0)$) или альтернативный `mirror_leg_name_preserving` (`CANONICAL_SEMANTIC_CONTRACT.md` §2, `src/canonical/types.ts`).
2. **Состав модулей нового графического стенда:** определить, какие именно подтверждённые модули (Базовая модель 4 кругов, Окружность Фалеса $K_o$, Спектральная модель $(\rho, \lambda)$, подтверждённые законы из `EXP-01..06`, включая разбиение инцентра и дуги/площади `EXP-05/06`) войдут в новую архитектуру UI, а какие останутся за её пределами.
3. **Судьба Legacy-слоёв и артефактов:** определить порядок вывода из эксплуатации или изоляции `src/math/*`, `src/math/experiments/*`, `public/assets/aistudio/` и обновления `metadata.json` (с учётом правил первого/последующих этапов).

---

## 10. Предлагаемая последовательность дальнейшего проектирования нового стенда

1. **Этап 1 — Фиксация продуктовых и семантических решений:**
   - Получить решение по открытым вопросам из раздела 9.2 (активная визуальная ориентация сцены, целевой состав модулей, границы интерактивного Level 1 vs исследовательского Level 2 в UI).
2. **Этап 2 — Завершение математического ядра New Canonical (`src/canonical/`):**
   - Внедрить 3-слойную модель контраста (`STAGE_5_2_2`) и классификацию практического домена (`STAGE_5_2_3`).
   - Перенести в `src/canonical/` каноническую окружность Фалеса $K_o$ (9 валидаторов), модель гомогении $(\rho, \lambda)$ и подтверждённые закономерности `EXP-01..06` строго в канонической нотации `MATHEMATICAL_NOTATION_STANDARD.md`.
   - Завершить миграцию тестового сюита `CT-05..CT-23`.
3. **Этап 3 — Проектирование контракта «Ядро → Вычислительные сценарии → Визуальное представление»:**
   - Определить чистый слой view-model / scene-adapter, который преобразует канонические математические объекты и доменные статусы в независимые от координатной сетки и UI-фреймворка геометрические примитивы (исключив прямые вызовы математических модулей и смешение зажимов из компонентов рендера).
4. **Этап 4 — Проектирование и построение новой графической системы:**
   - Спроектировать единую каноническую графическую сцену, панель параметров $(\text{sideA}, \text{sideB})$ / $(\rho, \lambda)$ и аналитические графики с нуля на основе New Canonical без наследования Legacy-оверлеев.
5. **Этап 5 — Сквозная верификация и синхронизация документации:**
   - Прогнать весь канонический тестовый контур (`CT-01..23` + строгий аудит корней `EXP-06`), обновить/заменить формульные паспорта (`F-007` и др.) и привести всю документацию репозитория к единому состоянию.
