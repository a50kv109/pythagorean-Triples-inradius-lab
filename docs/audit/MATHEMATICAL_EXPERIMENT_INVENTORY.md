# MATHEMATICAL EXPERIMENT INVENTORY — Pythagoras-Circles-Lab

**Статус документа:** Этап 1 (Инвентаризация без изменения вычислительной логики и исходного кода `src/`).  
**Объект аудита:** Репозиторий `Pythagoras-Circles-Lab` (`v1.2.0`), включая базовое вычислительное ядро, слой UMFP/семантических паспортов и все исследовательские модули `Experiment 01` – `Experiment 06`.

---

## Сводная карта охвата инвентаризации

| № | ID | Название модуля / эксперимента | Основные исходные файлы |
|---|---|---|---|
| 1 | `CORE-01` | Базовая модель четырёх окружностей (`Four-Circles Model`) | `RightTriangle.ts`, `SquareConstruction.ts`, `FourCirclesModel.ts`, `FourCirclesValidators.ts`, `inputValidation.ts`, `presets.ts` |
| 2 | `CORE-02` | Окружность Фалеса ($K_o$) и двухпараметрическая спектральная модель $(t, \lambda)$ | `ThalesCircumcircle.ts`, `ThalesValidators.ts`, `FourCirclesSpectralAnalysis.ts`, `symmetryAnimation.ts` |
| 3 | `CORE-03` | Реестр формульных и семантических паспортов (`UMFP PCL-A01..G30`, `F-001..F-007`) | `docs/FORMULA_PASSPORTS.md`, `docs/FORMULA_DEPENDENCY_GRAPH.md`, `docs/semantic-formula-passports/*`, `src/tests/semanticFormulaPassports.test.ts` |
| 4 | `EXP-01` | `Experiment 01`: Классификация прямоугольных треугольников от вписанной окружности (`Circle-First`) | `src/math/experiments/circleFirstClassification.ts` |
| 5 | `EXP-02` | `Experiment 02`: Дуговая дискретизация семейства прямоугольных треугольников | `src/math/experiments/arcBasedClassification.ts` |
| 6 | `EXP-03` | `Experiment 03`: Независимая геометрическая валидация дуговой параметризации | `src/math/experiments/arcGeometricValidation.ts` |
| 7 | `EXP-04` | `Experiment 04`: Совместный параметрический анализ дуги и углов при катетах | `src/math/experiments/arcAngleParametricAnalysis.ts` |
| 8 | `EXP-05` | `Experiment 05`: Анализ распределения трёх дуг вписанной окружности | `src/math/experiments/incircleArcDistribution.ts` |
| 9 | `EXP-06` | `Experiment 06`: Соответствие дуг, сторон и площадей подтреугольников + аудит | `src/math/experiments/arcSideAreaCorrespondence.ts` |

---

## 1. `CORE-01` — Базовая модель четырёх окружностей (`Four-Circles Model`)

1. **ID / Название:** `CORE-01` / Базовая модель четырёх окружностей прямоугольного треугольника (`Four-Circles Model`).
2. **Файлы кода, UI и тестов:**
   - Математическое ядро: `src/math/inputValidation.ts`, `src/math/RightTriangle.ts`, `src/math/SquareConstruction.ts`, `src/math/FourCirclesModel.ts`, `src/math/FourCirclesValidators.ts`, `src/math/presets.ts`.
   - Типы и трансформация координат: `src/types/geometry.ts`, `src/geometry/transforms.ts`.
   - UI-компоненты: `src/App.tsx`, `src/components/geometry/GeometryBoard.tsx`, `src/components/geometry/RightTriangleView.tsx`, `src/components/geometry/FourCirclesView.tsx`, `src/components/panels/ControlsPanel.tsx`, `src/components/panels/FourCirclesPanel.tsx`, `src/components/panels/InvariantsPanel.tsx`.
   - Тесты и документация: `src/tests/geometry.test.ts` (разделы 1–5), `docs/PREPRINT_ZENODO.md`, `docs/MATHEMATICAL_FOUNDATION.md`, `docs/MATHEMATICAL_PROOFS.md`, `docs/NUMERICAL_ANALYSIS.md`.
3. **Входные параметры:**
   - Длины двух катетов $a, b \in \mathbb{R}_{>0}$ (конечные строго положительные числа, `assertValidLegs`; в интерактивном UI ограничены `[0.2, 15]` с округлением `clampVal`, на слайдерах `[0.5, 12]`).
4. **Выходные величины:**
   - Структура `RightTriangleGeometry`: вершины $O, A, B$, гипотенуза $c$, углы $\alpha, \beta$ (в радианах и градусах), $\cos\alpha, \sin\alpha$, площадь $S_{\triangle}$, периметр $P_{\triangle}$, высота $h_c$, основание высоты $H$, проекции $c_a, c_b$.
   - Внешние квадраты $Q_a, Q_b, Q_c$ (`SquareVertices`, `HypotenuseSquareVertices`) со сторонами и площадями $S_a, S_b, S_c$.
   - Окружности $K_a, K_b, K_c$ (`CircleMetrics`: центр, радиус, диаметр, площадь, $\sqrt{\text{area}}$, 4 точки касания) и вписанная окружность $K_i$ (`IncircleMetrics`: центр $I$, радиус $r$, диаметр, площадь, $\sqrt{\text{area}}$, точки касания $T_{OA}, T_{OB}, T_{AB}$).
   - Сводные величины тождества: `sqrtSumLegs`, `sqrtSumHypAndIn`, `identityResidualAbs`, `identityResidualRel`, `areaSumLegs`, `areaContrastExpected`, `areaMinusAll`, `pythagoreanAreaDiff`.
   - 8 runtime-инвариантов `validateFourCirclesInvariants`.
5. **Определения и принятые обозначения (локальная конвенция):**
   - $O = (0,0)$, $A = (0, a)$ на полуоси $+Oy$, $B = (b, 0)$ на полуоси $+Ox$, $\angle AOB = 90^\circ$.
   - **`a` = вертикальный катет $|OA|$**, **`b` = горизонтальный катет $|OB|$**, $c = |AB|$.
   - **`alphaDeg` = $\angle OAB = \arctan(b/a)$** (угол при вершине $A$!), **`betaDeg` = $\angle OBA = \arctan(a/b)$** (угол при вершине $B$!).
   - $S_a = a^2, S_b = b^2, S_c = c^2$ — **площади внешних квадратов $Q_a, Q_b, Q_c$**.
   - $K_a, K_b, K_c$ — площади кругов в $Q_a, Q_b, Q_c$; $K_i$ — площадь вписанного круга.
6. **Основные формулы:**
   $$c = \sqrt{a^2 + b^2}, \quad r = \frac{ab}{a + b + c} = \frac{a + b - c}{2}, \quad I = (r, r),$$
   $$K_a = \frac{\pi a^2}{4}, \quad K_b = \frac{\pi b^2}{4}, \quad K_c = \frac{\pi c^2}{4}, \quad K_i = \pi r^2,$$
   $$\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i} = \frac{\sqrt{\pi}}{2}(a + b),$$
   $$K_a + K_b = K_c, \qquad K_a + K_b - K_c - K_i = -K_i < 0.$$
7. **Утверждаемые результаты / гипотезы:**
   - Дедуктивная эквивалентность центрального тождества корней линейному условию касания $a + b = c + 2r$ (только для евклидовых прямоугольных треугольников).
   - Невозможность прямого равенства площадей $K_a + K_b = K_c + K_i$ (дефицит равен $-K_i$).
   - Вычислительная устойчивость формы $r = \frac{a}{a+b+c}\cdot b$ против катастрофического сокращения знаков при $a \ll b$ или $b \ll a$.
   - В `MATHEMATICAL_PROOFS.md` разд. 6 зафиксированы открытые гипотезы (внесферные/вневписанные аналоги, неевклидовы обобщения) — вне реализации `v1.2.0`.
8. **Статус доказанности:** **Аналитически доказано** (для всех основных тождеств и координат в `MATHEMATICAL_PROOFS.md`); обобщения раздела 6 — **Гипотеза / открытый вопрос**.
9. **Статус автоматизированной верификации:**
   - Проверено в `src/tests/geometry.test.ts` (разделы 1–5): 6 контрольных треугольников (`(3,4,5)`, `(4,3,5)`, `(5,12,13)`, `(4,4,4√2)`, `(1,10,√101)`, `(10,1,√101)`), симметрия $a \leftrightarrow b$, отклонение невалидных входов, масштабы от $10^{-6}$ до $10^{50}$, 3 мутационных теста валидаторов (`tol = 1e-9`).
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - Локальная конвенция **`a = |OA|`, `b = |OB|`** противоположна стандартной евклидовой нотации противоположных сторон (`a` напротив $A$, `b` напротив $B$), принятой в `Experiment 06`.
    - Локальная конвенция **`alphaDeg` = $\angle A = \arctan(b/a)$** прямо противоположна конвенции **`alphaDeg` = $\angle B$** в `Experiment 03–06`.
    - Символы **$S_a, S_b, S_c$** заняты для площадей внешних квадратов ($a^2, b^2, c^2$), тогда как в `Experiment 06` те же символы $S_a, S_b, S_c$ использованы для площадей малых подтреугольников разбиения $\triangle IOB, \triangle IOA, \triangle IAB$.
    - Поля `altitude`, `altitudePoint`, `projectionA`, `projectionB` в `RightTriangle.ts` не проверяются прямыми assertions в `geometry.test.ts` (косвенно задействованы только косинусы/синусы направления).

---

## 2. `CORE-02` — Окружность Фалеса ($K_o$) и спектральная модель $(t, \lambda)$

1. **ID / Название:** `CORE-02` / Пятая окружность (описанная окружность Фалеса $K_o$) и двухпараметрическая спектральная модель $(t, \lambda)$.
2. **Файлы кода, UI и тестов:**
   - Математическое ядро: `src/math/ThalesCircumcircle.ts`, `src/math/ThalesValidators.ts`, `src/math/FourCirclesSpectralAnalysis.ts`, `src/math/symmetryAnimation.ts`.
   - UI-компоненты: `src/components/panels/ThalesCircumcirclePanel.tsx`, `src/components/panels/KcVsKoComparison.tsx`, `src/components/panels/SpectralAnalysisPanel.tsx`.
   - Тесты и документация: `src/tests/geometry.test.ts` (разделы 6–10), `docs/MATHEMATICAL_FOUNDATION.md` (разд. 3.3, 6, 7, 9), `docs/MATHEMATICAL_PROOFS.md`.
3. **Входные параметры:**
   - Вершины $A, B, C \in \mathbb{R}^2$ с $|A - B| > 0$ (`calculateThalesCircumcircleFromVertices`).
   - Параметр формы $t = b/a \in (0, +\infty)$ (`evaluateParametricFourCircles`, `sampleSpectralCurves`, `legsFromRatioAndHypotenuse`).
   - Параметр масштаба $\lambda \in (0, +\infty)$ (`scaleTriangleGeometry`, `sampleThalesScaleCurves`, эталон `c_0 = 5` для `(3,4,5)`).
4. **Выходные величины:**
   - `ThalesCircumcircleMetrics`: центр $O_o$, диаметр $D_o$, радиус $R_o$, площадь $K_o$, длина окружности $L_o$, расстояния до $A, B, C$, угол $\angle ACB$, `areaDiffWithKc`, `centerDistanceToKc`.
   - `ParametricPoint`: нормированные кривые `areas` ($K_x/K_c$), `perimeters` ($P_x/P_c$), `radii` ($R_x/R_c$), `diameters` ($D_x/D_c$), абсолютные метрики при $a=1, b=t$, метрики `thalesNorm` и `thalesAbs`.
   - `ScaleHomogeneityPoint`: все метрики при масштабировании $\lambda(a_0, b_0)$.
   - 9 runtime-инвариантов `validateThalesCircumcircleInvariants` (итого 17 в `validateAllFiveCirclesInvariants`).
5. **Определения и принятые обозначения (локальная конвенция):**
   - $O_o = \frac{A+B}{2} = (\frac{b}{2}, \frac{a}{2})$ — центр описанной окружности $K_o$; $O_c = (\frac{a+b}{2}, \frac{a+b}{2})$ — центр $K_c$ внутри $Q_c$.
   - $t = b/a = \tan(\angle A_{\text{RightTriangle}})$ (безразмерный параметр формы).
   - $\lambda$ — линейный коэффициент гомотетии; эталон в UI-вкладке `Scale λ` привязан к $(a_0=3, b_0=4, c_0=5)$.
   - Длина окружности для $K_a, K_b, K_c, K_i$ обозначена $P_x$, а для $K_o$ — $L_o = \pi c$.
6. **Основные формулы:**
   $$D_o = c, \quad R_o = \frac{c}{2}, \quad K_o = K_c = \frac{\pi c^2}{4}, \quad L_o = L_c = \pi c, \quad |O_o - O_c| = \left\|\left(\frac{a}{2}, \frac{b}{2}\right)\right\| = \frac{c}{2} > 0,$$
   $$\frac{K_a(t)}{K_c(t)} = \frac{1}{1+t^2}, \quad \frac{K_b(t)}{K_c(t)} = \frac{t^2}{1+t^2}, \quad \frac{K_i(t)}{K_c(t)} = \frac{(1+t-\sqrt{1+t^2})^2}{1+t^2},$$
   $$\max_{t>0} \frac{R_i(t)}{R_c(t)} = \sqrt{2}-1, \quad \max_{t>0} \frac{K_i(t)}{K_c(t)} = 3 - 2\sqrt{2} \quad (\text{при } t = 1),$$
   $$\frac{K_x(1/t)}{K_c(1/t)} = \frac{K_{\bar{x}}(t)}{K_c(t)} \; (a \leftrightarrow b), \qquad f_{\text{lin}}(\lambda) = \lambda f_{\text{lin}}(1), \quad f_{\text{area}}(\lambda) = \lambda^2 f_{\text{area}}(1).$$
7. **Утверждаемые результаты / гипотезы:**
   - Совпадение всех скалярных метрик $K_o = K_c$ при ненулевом расстоянии центров $|O_o - O_c| = c/2$.
   - Совпадение нормированных кривых $P_x/P_c \equiv R_x/R_c \equiv D_x/D_c$.
   - Ортогональное разложение пространства конфигураций на форму $t$ и масштаб $\lambda$.
   - Глобальный максимум $K_i/K_c = 3 - 2\sqrt{2}$ при $t = 1$ и дуальность $t \leftrightarrow 1/t$.
8. **Статус доказанности:** **Аналитически доказано** (`MATHEMATICAL_FOUNDATION.md`, `MATHEMATICAL_PROOFS.md`, Предложение 7 и Тождества 5–6).
9. **Статус автоматизированной верификации:**
   - Проверено в `src/tests/geometry.test.ts` (разделы 6–10): 4 контрольных тройки, повёрнутый и сдвинутый треугольник ($C=(10,-4), \theta=0.63$), экстремальные соотношения сторон, симметрия $t \leftrightarrow 1/t$, траектория анимации, гомогенность $\lambda \in \{0.1 \dots 10\}$, 17 runtime-инвариантов (`tol = 1e-9`).
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - В `ThalesCircumcircle.ts` и `FORMULA_PASSPORTS.md` длина окружности $K_o$ обозначена $L_o$, тогда как в `FourCirclesSpectralAnalysis.ts` длины окружностей $K_a, K_b, K_c, K_i$ обозначены $P_x$ (при этом $L$ также означает длину дуги в `Exp 02–06`, а $P$ — периметр треугольника).
    - Конструктор `calculateThalesCircumcircleFromVertices` не проверяет явно $\angle ACB = 90^\circ$ (проверка ортогональности вынесена в валидатор `thales_right_angle`).
    - В `legsFromRatioAndHypotenuse` при экстремальных $t \notin [1/75, 75]$ финальный кламп `[0.2, 15]` нарушает точное $b/a = t$ (указано в `NUMERICAL_ANALYSIS.md`, п. 4).

---

## 3. `CORE-03` — Реестр паспортов формул (`UMFP` и семантические паспорта `F-001`–`F-007`)

1. **ID / Название:** `CORE-03` / Каталог паспортов формул `PCL-A01`–`PCL-G30` и пилотный набор семантических паспортов `F-001`–`F-007`.
2. **Файлы кода, UI и тестов:**
   - Документация: `docs/FORMULA_PASSPORTS.md`, `docs/FORMULA_DEPENDENCY_GRAPH.md`, `docs/semantic-formula-passports/README.md`, `F-001-pythagorean-theorem.md` … `F-007-parametric-triangle-model.md`, `DEPENDENCY_GRAPH.md`.
   - Тесты: `src/tests/semanticFormulaPassports.test.ts`.
3. **Входные параметры:** Зависят от конкретного паспорта: $(a, b)$ для `F-001`–`F-006` и `PCL-A01..G30`; $(r, \alpha)$ для `F-007`.
4. **Выходные величины:** Структурированные описания формул (`RAW`, `NORMALIZED`, реестр символов, область применимости, вывод, зависимости, анти-примеры и контрольные проверки на `(5, 12, 13)` и `(5, 5, 6)`).
5. **Определения и принятые обозначения (локальная конвенция):**
   - `PCL-A01..G30` следует конвенции `CORE-01` ($a=|OA|, b=|OB|, \alpha = \angle A = \arctan(b/a)$).
   - **`F-007`** следует конвенции `Experiment 03–04` ($a=|OA|, b=|OB|$, но **$\alpha = \angle B = \arctan(a/b)$**, $a/b = \tan\alpha$).
6. **Основные формулы:** Формулы `F-001`: $c^2=a^2+b^2$; `F-002`: $S=ab/2$; `F-003`: $p=(a+b+c)/2$; `F-004`: $S=pr$; `F-005`: $r=\frac{ab}{a+b+c}=\frac{a+b-c}{2}$; `F-006`: $\sqrt{K_a}+\sqrt{K_b}=\sqrt{K_c}+\sqrt{K_i}$; `F-007`: $a(r,\alpha), b(r,\alpha), c(r,\alpha), L=r\alpha$.
7. **Утверждаемые результаты / гипотезы:** Демонстрация концепции *Semantic Closure* (устранение потери семантических переходов в записи $S = pr$ и разграничение определений, теорем и следствий).
8. **Статус доказанности:** **Аналитически доказано** (все формулы внутри `F-001`–`F-007` и `PCL-A01`–`PCL-G30` приведены с пошаговыми выводами).
9. **Статус автоматизированной верификации:**
   - `src/tests/semanticFormulaPassports.test.ts` проверяет `F-001`–`F-006` на `(5, 12, 13)`, негативный контроль на непрямоугольном треугольнике `(5, 5, 6)`, и `F-007` против `computeArcAnglePoint` при $r \in \{1,2,3\}, \alpha \in \{15^\circ..75^\circ\}$ (`TOL = 1e-11`).
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - **Прямой конфликт обозначения $\alpha$ внутри одной и той же папки документации:** в `PCL-A04` / `MATHEMATICAL_FOUNDATION.md` $\alpha = \arctan(b/a) = \angle A$, а в `F-007` $\alpha = \arctan(a/b) = \angle B$.
    - В `FORMULA_PASSPORTS.md` строка 3 заявлено «29 паспортов (`PCL-A01`–`PCL-G29`)», фактически присутствуют **30** (`PCL-A01`–`PCL-G30`), а в `FORMULA_DEPENDENCY_GRAPH.md` строка 3 указано «24 паспорта (`PCL-A01`–`PCL-F24`)» (граф не обновлён под группу `G`).
    - В `FORMULA_PASSPORTS.md` строка 465 (`PCL-F24`) указано округление до `1e-6`, тогда как в `NUMERICAL_ANALYSIS.md` строка 65 (и `App.tsx`) используется округление до `1e-4`.

---

## 4. `EXP-01` — `Experiment 01`: Классификация от вписанной окружности (`Circle-First`)

1. **ID / Название:** `EXP-01` / `Experiment 01 — Circle-First Classification of Right Triangles`.
2. **Файлы кода, UI и тестов:**
   - Код: `src/math/experiments/circleFirstClassification.ts`.
   - Тесты: `src/tests/experiment01.circleFirst.test.ts`.
   - Документация: `docs/experiments/EXPERIMENT_01_CIRCLE_FIRST_CLASSIFICATION.md`.
   - Отдельная UI-панель отсутствует (используется программно и как математическая база для `Exp 02–06`).
3. **Входные параметры:**
   - $r \in (0, +\infty)$ — радиус вписанной окружности;
   - $t = b/a \in (0, +\infty)$ — безразмерное отношение катетов (`r, t` конечны и строго положительны, иначе `InvalidCircleFirstInputError`).
4. **Выходные величины:**
   - `CircleFirstTriangleRow`: `a, b, c, alphaDeg, betaDeg, area, perimeter, rRecoveredDirect, rRecoveredStable, residuals` (`pythagoreanResidualAbs`, `incircleEqResidualAbs`, `inradiusRecoveryResidualAbs`).
   - `CircleFirstGeometricPassport`: полный результат `calculateFourCircles(a, b)` и проверка 17 инвариантов.
   - Вспомогательные функции: `forwardClassifyFromLegs`, `computeDirectSubtractionLegs` (бенчмарк сокращения знаков), `evaluateErroneousPreambleFormula` (регрессионное опровержение).
5. **Определения и принятые обозначения (локальная конвенция):**
   - `a = |OA|` (вертикальный катет), `b = |OB|` (горизонтальный катет).
   - `t = b/a`.
   - `alphaDeg = atan2(b, a)` ($\angle A$), `betaDeg = atan2(a, b)` ($\angle B$) — совпадает с `CORE-01`.
6. **Основные формулы:**
   $$\Psi(r, t):\quad a = \frac{r\left(1 + t + \sqrt{1 + t^2}\right)}{t}, \qquad b = r\left(1 + t + \sqrt{1 + t^2}\right), \qquad c = \frac{r\sqrt{1+t^2}\left(1 + t + \sqrt{1 + t^2}\right)}{t},$$
   $$\Phi(a, b) = \left(\frac{ab}{a + b + \sqrt{a^2+b^2}},\; \frac{b}{a}\right), \qquad \Phi \circ \Psi = \mathrm{id}, \quad \Psi \circ \Phi = \mathrm{id}.$$
7. **Утверждаемые результаты / гипотезы:**
   - Биекция $\mathbb{R}_{>0}^2 \leftrightarrow \mathbb{R}_{>0}^2$ между пространством $(a, b)$ и пространством $(r, t)$.
   - Опровержение ошибочной преамбулы задачи ($a = r(1+t+\sqrt{1+t^2})/(1+\dots)$ дававшей $(2,2,2)$ при $r=1, t=1$).
   - Алгоритмическое устранение катастрофического сокращения знаков в знаменателе $(1 + t - \sqrt{1+t^2})$ при $t \ll 1$ или $t \gg 1$ (при $t = 10^{16}$ прямое вычитание даёт деление на $0$, а рационализированная форма $\Psi$ сохраняет точность `float64`).
8. **Статус доказанности:** **Аналитически доказано** (биекция, однородность степени $1$ по сторонам и степени $2$ по площади, дуальность $t \leftrightarrow 1/t$, тождественность $a^2+b^2=c^2$ и $a+b-c=2r$ доказаны алгебраически).
9. **Статус автоматизированной верификации:**
   - `src/tests/experiment01.circleFirst.test.ts`: опровержение преамбулы, восстановление `(3,4,5)`, `(6,8,10)`, `(9,12,15)`, широкая сетка `r ∈ [1e-5, 1e5]` × `t ∈ [1e-6, 1e6]`, бенчмарк сокращения знаков при `t = 1e-15` и `t = 1e16`, валидация 17 инвариантов.
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - Обозначения $a=|OA|, b=|OB|, \alpha = \angle A$ конфликтуют с `Experiment 03–06`.
    - Наличие функции `evaluateErroneousPreambleFormula` требует явной маркировки как исторического контрпримера, чтобы избежать путаницы при аудите.

---

## 5. `EXP-02` — `Experiment 02`: Дуговая дискретизация семейства треугольников

1. **ID / Название:** `EXP-02` / `Experiment 02 — Arc-Based Classification of Right Triangles`.
2. **Файлы кода, UI и тестов:**
   - Код: `src/math/experiments/arcBasedClassification.ts`.
   - UI: `src/components/panels/ArcClassificationPanel.tsx`, `src/components/geometry/ArcClassificationBoardOverlay.tsx`.
   - Тесты: `src/tests/experiment02.arcBased.test.ts`.
   - Документация: `docs/experiments/EXPERIMENT_02_ARC_BASED_CLASSIFICATION.md`.
3. **Входные параметры:**
   - $r > 0$;
   - $\varphi \in (0^\circ, 90^\circ)$ (физический центральный угол на дуге $N \to E$) или $\theta \in (0^\circ, 180^\circ)$ (параметр половинного угла в $t = \cot(\theta/2)$);
   - шаги дискретизации: угловой $\Delta\varphi > 0$ или линейный $\Delta L > 0$.
4. **Выходные величины:**
   - `ArcSampleTriangle`: `index`, `phiDeg`, `thetaCotHalfDeg`, `arcLengthFromN`, `tangencyPoint`, `t`, `triangle` (из `Exp 01`), `isUniqueShape`, `tangencyMatchResidual`.
   - `ArcDiscretizationResult`: `arcLengthMax = \pi r / 2`, `intervalCount`, `boundaryInclusivePointCount`, `interiorNonDegenerateCount`, `uniqueCongruenceCount`, `duplicateCongruenceCount`, `effectiveAngularStepDeg`, `samples`.
5. **Определения и принятые обозначения (локальная конвенция):**
   - `a = |OA|`, `b = |OB|`, $t = b/a$.
   - **`phiDeg` ($\varphi$)** — центральный угол поворота $I \to T_{AB}$ по часовой стрелке от северной точки $N=(r, 2r)$ к $E=(2r, r)$ (фактически равен $\angle B$!).
   - **`thetaCotHalfDeg` ($\theta$)** — удвоенный параметр $\theta = 2\varphi$ из $t = \cot(\theta/2)$.
6. **Основные формулы:**
   $$L_{\max}(r) = \frac{\pi r}{2}, \quad T_{AB}(\varphi) = \big(r(1+\sin\varphi),\; r(1+\cos\varphi)\big), \quad L(\varphi) = r\varphi_{\text{рад}},$$
   $$t = \cot\varphi = \cot\left(\frac{\theta}{2}\right), \quad N_{\text{ang}} = \left\lceil\frac{90^\circ}{\Delta\varphi}\right\rceil - 1, \quad N_{\text{lin}} = \left\lfloor\frac{\pi r}{2\,\Delta L}\right\rfloor \text{ (при некратности } L_{\max}/\Delta L\text{)}.$$
7. **Утверждаемые результаты / гипотезы:**
   - При постоянном угловом шаге $\Delta\varphi$ число невырожденных треугольников **не зависит от $r$** (одинаково для $r=1,2,3$).
   - При постоянном линейном шаге $\Delta L$ число треугольников растёт пропорционально $L_{\max} = \pi r / 2$ ($\lfloor \frac{\pi r}{2\Delta L} \rfloor$).
   - **Опровергнута** исходная гипотеза о «предельной ёмкости» $L_{\max}$ (при $\Delta L \to 0$ число треугольников неограниченно растёт).
   - Из-за трансцендентности $\pi$ рациональные шаги $\Delta L$ при рациональном $r$ никогда не порождают точных зеркальных пар $L_1 + L_2 = \pi r / 2$ (дубликатов $a \leftrightarrow b$ равно $0$).
8. **Статус доказанности:** **Аналитически доказано** (включая трансцендентность $\pi$ — следствие теоремы Линдемана–Вейерштрасса — и формулы числа узлов); однако в текстовом отчёте `Exp 02` содержалось **терминологическое смешение $\theta$ и $\varphi$**, разоблачённое в `Exp 03`.
9. **Статус автоматизированной верификации:**
   - `src/tests/experiment02.arcBased.test.ts`: проверка $t = \cot(\theta/2)$ при $\theta \in \{10^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ\}$, угловые сетки $\Delta\varphi \in \{15^\circ, 5^\circ, 1^\circ, 0.5^\circ, 0.1^\circ\}$ (до 899 треугольников) и линейные $\Delta L \in \{0.5, 0.25, 0.1, 0.05\}$ при $r=1,2,3$, исключение границ $0^\circ$ и $90^\circ$.
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - **Коллизия символа $\varphi$:** здесь `phiDeg` — угол положения $T_{AB}$ ($0^\circ \dots 90^\circ$), а в `Experiment 05–06` $\varphi_A, \varphi_B, \varphi_C$ — углы трёх секторов вписанной окружности ($90^\circ + \alpha$, $180^\circ - \alpha$, $90^\circ$).
    - **Несовместимость пары формул в ранней постановке `Exp 02`:** в отчёте `Exp 02` и интерфейсе рядом с $t = \cot(\theta/2)$ упоминалось $L(\theta) = r\theta$, что вдвое превышает реальную дугу $L = r\varphi$ (установлено в `Exp 03`).
    - При $t = b/a$ внутреннее поле `triangle.alphaDeg` внутри `s.triangle` равно $\angle A = 90^\circ - \varphi$, что противоречит именованию $\alpha$ в `Exp 03–06`.

---

## 6. `EXP-03` — `Experiment 03`: Геометрическая валидация дуговой параметризации

1. **ID / Название:** `EXP-03` / `Experiment 03 — Geometric Validation of Arc Parameterization`.
2. **Файлы кода, UI и тестов:**
   - Код: `src/math/experiments/arcGeometricValidation.ts`.
   - Тесты: `src/tests/experiment03.geometricValidation.test.ts`.
   - Документация: `docs/experiments/EXPERIMENT_03_GEOMETRIC_VALIDATION.md`.
   - UI-панель отсутствует (валидационный модуль).
3. **Входные параметры:**
   - $r > 0$;
   - $\alpha \in [0^\circ, 90^\circ]$ (`alphaDeg` — физический центральный угол от $N=(r,2r)$ к $T_{AB}$, включая граничные $0^\circ$ и $90^\circ$ для явной диагностики вырожденности).
4. **Выходные величины:**
   - `TangentGeometricValidation`: `alphaDeg`, `thetaExp02Deg = 2*alphaDeg`, `phiExp02Deg = alphaDeg`, `arcLengthActual = r*alphaRad`, `arcLengthIfUsingTheta = 2*r*alphaRad`, `tangencyPoint`, `tangentLine` ($A_{\text{line}}x + B_{\text{line}}y = C_{\text{line}}$, расстояние до $I$), флаг `isDegenerate`, `a, b, c`, `angleADeg, angleBDeg`, `rActualDirect, rActualStable`, невязки и сверка с `Exp 01` и `Exp 02`.
   - `DiscretizationComparisonEntry` (сопоставление углового и линейного режимов).
5. **Определения и принятые обозначения (локальная конвенция):**
   - `a = |OA|` (вертикальный катет), `b = |OB|` (горизонтальный катет).
   - **Переопределение символа $\alpha$:** с этого модуля **$\alpha \equiv \angle B = \varphi_{\text{Exp02}}$**, а $\angle A = 90^\circ - \alpha$.
6. **Основные формулы:**
   $$x\sin\alpha + y\cos\alpha = r(1 + \sin\alpha + \cos\alpha),$$
   $$a = \frac{r(1 + \sin\alpha + \cos\alpha)}{\cos\alpha}, \quad b = \frac{r(1 + \sin\alpha + \cos\alpha)}{\sin\alpha}, \quad c = \frac{r(1 + \sin\alpha + \cos\alpha)}{\sin\alpha\cos\alpha},$$
   $$L(\alpha) = r\alpha_{\text{рад}}, \qquad \theta_{\text{Exp02}} = 2\alpha \implies r\theta = 2L(\alpha).$$
7. **Утверждаемые результаты / гипотезы:**
   - Независимый прямой вывод формул $(a, b, c)$ из уравнения касательной к $K_i$ и алгебраическая проверка $a^2+b^2=c^2$ и $a+b-c=2r$.
   - Разрешение вопроса рецензии о $L(15^\circ) = 0.261799$: числовой результат `Exp 02` точен ($\varphi = \alpha = 15^\circ$), а параметр $\theta = 30^\circ$ является удвоенным алгебраическим параметром $t = \cot(\theta/2)$, не равным углу точки касания на $K_i$.
8. **Статус доказанности:** **Аналитически доказано** (`EXPERIMENT_03_GEOMETRIC_VALIDATION.md`, разделы 1–2).
9. **Статус автоматизированной верификации:**
   - `src/tests/experiment03.geometricValidation.test.ts`: проверка на $r \in \{1,2,3\}$ и $\alpha \in \{0^\circ, 15^\circ, 30^\circ, 45^\circ, 60^\circ, 75^\circ, 90^\circ\}$, сверка с `Exp 01` и `Exp 02` (`< 1e-12`), сравнение дискретизаций, отбраковка некорректных входов.
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - Фиксирует (но не устраняет в более ранних файлах) расхождение смысла `alpha` между `CORE-01`/`EXP-01` ($\alpha = \angle A$) и `EXP-03..06` ($\alpha = \angle B$).
    - Внутри `Experiment 03` (как и `04–05`) $a$ по-прежнему обозначает вертикальный катет $|OA|$, а $b$ — горизонтальный катет $|OB|$, при этом $a = \dots/\cos\alpha$, $b = \dots/\sin\alpha$ и $\angle B = \alpha$ (то есть $b$ прилежит к $B$ и противолежит $A$, что расходится со стандартной нотацией `a opp A`).

---

## 7. `EXP-04` — `Experiment 04`: Совместный параметрический анализ дуги и углов

1. **ID / Название:** `EXP-04` / `Experiment 04 — Arc–Angle Parametric Analysis`.
2. **Файлы кода, UI и тестов:**
   - Код: `src/math/experiments/arcAngleParametricAnalysis.ts`.
   - UI: `src/components/panels/ArcAngleAnalysisPanel.tsx`, `src/components/geometry/ArcAngleBoardOverlay.tsx`.
   - Тесты и графики: `src/tests/experiment04.arcAngle.test.ts`, `docs/experiments/figures/exp04_chart1_angle_a.svg` … `exp04_chart5_leg_ratio.svg`.
   - Документация: `docs/experiments/EXPERIMENT_04_ARC_ANGLE_PARAMETRIC_ANALYSIS.md`, `docs/semantic-formula-passports/F-007-parametric-triangle-model.md`.
3. **Входные параметры:**
   - $r > 0$ (эталонная серия `EXPERIMENT04_RADII = [1, 2, 3]`);
   - $\alpha \in (0^\circ, 90^\circ)$ (сетка по умолчанию шаг $5^\circ$, 17 внутренних узлов; границы $0^\circ, 90^\circ$ выделяются отдельно);
   - 6 исследовательских зон: `10°–15°`, `15°–30°`, `30°–45°`, `45°–60°`, `60°–75°`, `75°–80°`.
4. **Выходные величины:**
   - `ArcAnglePoint`: `r, alphaDeg, arcLength, angleADeg, angleBDeg, angleSumDeg, a, b, c, ratioBA (b/a), ratioAB (a/b), tangencyPoint, rActual, pythagoreanResidual, tangentLineDistance, isSymmetricIsosceles`.
   - `ArcAngleZoneSummary`, `ArcAngleScaleInvarianceReport`, 5 SVG-графиков, функция `legsFromArcAngle(r, alphaDeg)`.
5. **Определения и принятые обозначения (локальная конвенция):**
   - `a = |OA|`, `b = |OB|`.
   - `alphaDeg = ∠B`, `angleADeg = 90° - alphaDeg`.
   - Формула соотношения: $b/a = \cot\alpha = \tan A = \cot B$.
6. **Основные формулы:**
   $$\angle B = \alpha, \qquad \angle A = 90^\circ - \alpha, \qquad L(r, \alpha) = r\alpha_{\text{рад}}, \qquad \frac{b}{a} = \cot\alpha,$$
   $$a = r(1 + \tan\alpha + \sec\alpha), \qquad b = r(1 + \cot\alpha + \csc\alpha), \qquad c = \frac{r(1+\sin\alpha+\cos\alpha)}{\sin\alpha\cos\alpha}.$$
7. **Утверждаемые результаты / гипотезы:**
   - **Доказанные/проверенные:** полное разделение параметров формы ($\alpha, A, B, b/a$ — инвариантны к $r$) и масштаба ($a, b, c, L \propto r$); инволюция отражения $\alpha \leftrightarrow 90^\circ - \alpha$ с единственной точкой симметрии $\alpha = 45^\circ$ ($a=b=r(2+\sqrt{2})$); ответ на вопрос о смысле углов $A, B$ (внутренние углы при катетах).
   - **Открытые гипотезы (разд. 12.3 документа):** (1) оптимальное нелинейное/логарифмическое разбиение угловых зон вокруг $\ln(b/a)$ или пифагоровых троек; (2) распределение спектральной плотности треугольников при равномерном шаге по $t$ или $S$; (3) обобщение на непрямоугольные треугольники с углом $\gamma \in (0, \pi)$ и сдвигом линейной зависимости на $\gamma/2$.
8. **Статус доказанности:**
   - Все формулы параметризации, разделения масштаба и симметрии — **Аналитически доказано**.
   - Три гипотезы из раздела 12.3 — **Гипотеза / открытый вопрос** (не доказаны и не реализованы).
9. **Статус автоматизированной верификации:**
   - `src/tests/experiment04.arcAngle.test.ts`: 51 внутренняя точка ($r=1,2,3$ × шаг $5^\circ$), 6 граничных, симметрия $\alpha \leftrightarrow 90^\circ-\alpha$, сводки 6 зон × 3 радиуса, отчёт масштабной инвариантности (`max |ΔA| ≤ 1.5e-14°`, `relErr ≤ 3.8e-16`), генерация 5 SVG.
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - **Опасная коллизия в UI-компонентах `ArcAngleAnalysisPanel.tsx` (строки 47–48) и `ArcAngleBoardOverlay.tsx` (строки 42–43):** проп `alphaDeg` равен $\angle B$ (по конвенции `Exp 04`), тогда как сразу рядом считывается `calc.triangle.alphaDeg` для `angleA` ($\angle A = 90^\circ - \alpha_{\text{prop}}$) и `calc.triangle.betaDeg` для `angleB`! В одном файле имя `alphaDeg` означает одновременно два дополнительных угла.
    - Ранняя перестановка знаменателей $\sin\alpha \leftrightarrow \cos\alpha$ (отмечена в `F-007`).

---

## 8. `EXP-05` — `Experiment 05`: Распределение трёх дуг вписанной окружности

1. **ID / Название:** `EXP-05` / `Experiment 05 — Incircle Arc Distribution Analysis`.
2. **Файлы кода, UI и тестов:**
   - Код: `src/math/experiments/incircleArcDistribution.ts`.
   - UI: `src/components/panels/IncircleArcDistributionPanel.tsx`, `src/components/geometry/IncircleArcDistributionOverlay.tsx`.
   - Тесты и графики: `src/tests/experiment05.incircleArcDistribution.test.ts`, `docs/experiments/figures/exp05_chart1_central_angles.svg` … `exp05_chart4_polar_sectors.svg`.
   - Документация: `docs/experiments/EXPERIMENT_05_INCIRCLE_ARC_DISTRIBUTION.md`.
3. **Входные параметры:**
   - $r > 0$, $\alpha \in (0^\circ, 90^\circ)$ (`computeIncircleArcDistribution`), или $(a, b) \in \mathbb{R}_{>0}^2$ (`computeIncircleArcDistributionFromLegs`), или $(A, B, C)$ произвольного треугольника (`evaluateGeneralTriangleCentralAngles`).
4. **Выходные величины:**
   - `IncircleArcDistributionPoint`: `r, alphaDeg, angleADeg, angleBDeg, angleCDeg, a, b, c, phiADeg, phiBDeg, phiCDeg, centralAngleSumDeg, lengthA, lengthB, lengthC, arcLengthSum, totalCircumference, shareA, shareB, shareC, shareSum, tangencyOA, tangencyOB, tangencyAB, areAllThreeEqual, areLegArcsEqual`.
5. **Определения и принятые обозначения (локальная конвенция):**
   - `a = |OA|`, `b = |OB|`, `alphaDeg = ∠B`.
   - **`phiADeg, phiBDeg, phiCDeg` ($\varphi_A, \varphi_B, \varphi_C$)** — центральные углы секторов вписанной окружности, заключённых между парами радиусов касания в соответствующих вершинах $A, B, C$:
     - $\varphi_A$ между $IT_{OA}$ и $IT_{AB}$ (вокруг вершины $A$);
     - $\varphi_B$ между $IT_{OB}$ и $IT_{AB}$ (вокруг вершины $B$);
     - $\varphi_C$ между $IT_{OA}$ и $IT_{OB}$ (вокруг прямого угла $C = O$).
   - `shareA, shareB, shareC` — нормированные доли $L_X / (2\pi r) = \varphi_X / 360^\circ$.
6. **Основные формулы:**
   $$\varphi_A = 180^\circ - A = 90^\circ + \alpha, \qquad \varphi_B = 180^\circ - B = 180^\circ - \alpha, \qquad \varphi_C = 180^\circ - C = 90^\circ,$$
   $$\varphi_A + \varphi_B + \varphi_C = 360^\circ, \qquad L_X = r\varphi_{X,\text{рад}}, \qquad s_A = \frac{1}{4} + \frac{\alpha}{360^\circ},\quad s_B = \frac{1}{2} - \frac{\alpha}{360^\circ},\quad s_C \equiv \frac{1}{4}.$$
7. **Утверждаемые результаты / гипотезы:**
   - Точный закон распределения трёх дуг $\varphi_X = 180^\circ - X$ (из суммы углов четырёхугольников у вершин $A, B, O$ с двумя прямыми углами в точках касания).
   - Полная сумма $\varphi_A + \varphi_B + \varphi_C = 360^\circ$ и $L_A + L_B + L_C = 2\pi r$.
   - **Невозможность равного деления $120^\circ/120^\circ/120^\circ$** в прямоугольном треугольнике (поскольку $\varphi_C \equiv 90^\circ$, а равенство $120^\circ$ достигается только при $A=B=C=60^\circ$).
   - Симметрия при $\alpha = 45^\circ$: $\varphi_A = \varphi_B = 135^\circ$ ($37.5\%$), $\varphi_C = 90^\circ$ ($25\%$).
   - Масштабная инвариантность углов и долей по $r$ и линейность $L_X \propto r$.
8. **Статус доказанности:** **Аналитически доказано** (элементарная геометрия четырёхугольников с двумя прямыми углами, доказано в `EXPERIMENT_05_INCIRCLE_ARC_DISTRIBUTION.md`).
9. **Статус автоматизированной верификации:**
   - `src/tests/experiment05.incircleArcDistribution.test.ts`: 51 точка ($r=1,2,3$, шаг $5^\circ$), особые случаи $30^\circ, 45^\circ, 60^\circ$, проверка равностороннего `(60,60,60)` и прямоугольного `(45,45,90)`, симметрия $a \leftrightarrow b$, масштабная инвариантность, предельные точки $0.001^\circ$ и $89.999^\circ$, генерация 4 SVG.
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - **Коллизия символа $\varphi$:** $\varphi_A, \varphi_B, \varphi_C$ (углы секторов суммы $360^\circ$) конфликтуют с $\varphi$ из `Experiment 02` (где $\varphi = \alpha$ от $N$ к $T_{AB}$).
    - **Инверсия угловых и линейных индексов на уровне документации:** в `Exp 05` `a = |OA|` (прилежит к $A$, противолежит $B$), но дуга $\varphi_A$ при вершине $A$ сопряжена с **углом $A$** и фактически лежит напротив катета $b = |OB|$ (это вскрыло путаницу при переходе к `Experiment 06`).

---

## 9. `EXP-06` — `Experiment 06`: Соответствие дуг, сторон и площадей + аудит

1. **ID / Название:** `EXP-06` / `Experiment 06 — Arc–Side–Area Correspondence Analysis` (включая независимый математический аудит).
2. **Файлы кода, UI и тестов:**
   - Код: `src/math/experiments/arcSideAreaCorrespondence.ts`.
   - UI: `src/components/panels/ArcSideAreaPanel.tsx`, `src/components/geometry/ArcSideAreaBoardOverlay.tsx`.
   - Тесты и графики: `src/tests/experiment06.arcSideArea.test.ts`, `src/tests/experiment06.audit.test.ts`, `docs/experiments/figures/exp06_chart1_shares_comparison.svg`, `exp06_chart2_area_defect.svg`, `exp06_chart3_radii_vs_bisectors.svg`.
   - Документация: `docs/experiments/EXPERIMENT_06_ARC_SIDE_AREA_CORRESPONDENCE.md`, `docs/experiments/EXPERIMENT_06_MATHEMATICAL_AUDIT.md`.
3. **Входные параметры:**
   - $r > 0$, $\alpha \in (0^\circ, 90^\circ)$ (`computeArcSideAreaPoint`), или угловые доли дуг $(w^{\text{arc}}_A, w^{\text{arc}}_B, w^{\text{arc}}_C)$ (`reconstructNormalizedModelFromArcShares` — работает и для произвольных непрямоугольных треугольников).
4. **Выходные величины:**
   - `ArcSideAreaPoint`: 3 системы распределения (`arcShareA/B/C`, `sideShareA/B/C`, `areaShareA/B/C`), стороны $a, b, c$ + явный мост `legOA, legOB`, касательные отрезки `tangentSegA/B/C`, площади $S_a, S_b, S_c$ (`areaA, areaB, areaC`), расстояния до вершин $|IA|, |IB|, |IO|$ и углы биссектрис $\psi_A, \psi_B, \psi_C$, все невязки мостов и инвариантов.
   - 6 численных точек пересечения (`EXPERIMENT06_CROSSING_POINTS`), `EXPERIMENT06_LAWS_CATALOG` (`L-01`–`L-08`).
5. **Определения и принятые обозначения (локальная конвенция):**
   - **Стандартная нотация противоположных сторон (отличная от `CORE-01` и `EXP-01..05`!):**
     - `a = |OB|` (горизонтальный катет, напротив $\angle A = 90^\circ - \alpha$);
     - `b = |OA|` (вертикальный катет, напротив $\angle B = \alpha$);
     - `c = |AB|` (гипотенуза, напротив $\angle C = 90^\circ$).
   - `alphaDeg = ∠B` (совпадает с `EXP-03..05`, но не с `CORE-01`).
   - $S_a = \frac{1}{2}ar$ (`areaA`, $\triangle IOB$), $S_b = \frac{1}{2}br$ (`areaB`, $\triangle IOA$), $S_c = \frac{1}{2}cr$ (`areaC`, $\triangle IAB$).
   - $\varphi_X = 180^\circ - X$ (углы между радиусами касания); $\psi_X = 90^\circ + X/2$ (углы между биссектрисами из $I$ к вершинам).
   - $w^{\text{arc}}_K = \varphi_K / 360^\circ$, $w^{\text{side}}_k = s_k / (a+b+c)$, $w^{\text{area}}_k = S_k / S$.
6. **Основные формулы:**
   $$w^{\text{area}}_k = \frac{S_k}{S} = \frac{s_k}{a+b+c} = w^{\text{side}}_k, \qquad w^{\text{area}}_k = \frac{\sin\varphi_K}{\sin\varphi_A + \sin\varphi_B + \sin\varphi_C},$$
   $$\left(\tan\frac{\varphi_A}{2} - 1\right)\left(\tan\frac{\varphi_B}{2} - 1\right) = 2, \qquad \frac{S}{r^2} = \tan\frac{\varphi_A}{2}\tan\frac{\varphi_B}{2},$$
   $$S_a^2 + S_b^2 = S_c^2, \qquad S_a + S_b - S_c = r^2, \qquad \frac{r^2}{S} = w^{\text{area}}_a + w^{\text{area}}_b - w^{\text{area}}_c = 2 w^{\text{area}}_a w^{\text{area}}_b \le 3 - 2\sqrt{2},$$
   $$\psi_X = 90^\circ + \frac{X}{2} = \frac{360^\circ - \varphi_X}{2}, \qquad S_c = \frac{|IA|\,|IB|}{2\sqrt{2}},$$
   $$\text{Реконструкция: } X = 180^\circ(1 - 2w^{\text{arc}}_X) \implies (a:b:c) = (\sin A : \sin B : \sin C).$$
7. **Утверждаемые результаты / гипотезы:**
   - Тождественность линейного и площадного распределений ($w^{\text{area}}_k \equiv w^{\text{side}}_k$) и прямой синусный перенос без перестановки индексов.
   - Возможность полного восстановления треугольника (с точностью до масштаба) только из долей дуг (справедливо и для общих треугольников!).
   - Существование гиперболического инварианта половинных тангенсов $(\tan\frac{\varphi_A}{2}-1)(\tan\frac{\varphi_B}{2}-1)=2$.
   - Пифагорово тождество малых площадей $S_a^2+S_b^2=S_c^2$ и площадной дефект $S_a+S_b-S_c=r^2$.
   - **Топология 6 парных пересечений и 3 строго непересекающихся пар** на $(0^\circ, 90^\circ)$: пересекаются $(A,a)$ ($\approx 34.36^\circ$), $(B,b)$ ($\approx 55.64^\circ$), $(A,c)$ ($\approx 36.61^\circ$), $(B,c)$ ($\approx 53.39^\circ$), $(C,b)$ ($= \arcsin(3/5) \approx 36.87^\circ$, тройка $(3,4,5)$), $(C,a)$ ($= \arccos(3/5) \approx 53.13^\circ$, тройка $(4,3,5)$); строго не пересекаются $(C,c)$, $(A,b)$, $(B,a)$.
8. **Статус доказанности:**
   - Алгебраические и тригонометрические тождества (`L-01`–`L-06`, `L-08`, реконструкция, $\max(r^2/S) = 3-2\sqrt{2}$) — **Аналитически доказано**.
   - **Точное число корней (ровно 6 пересечений) и отсутствие корней в парах `(A,b)` и `(B,a)`** — **Численно проверено / не доказано аналитически**: в `experiment06.audit.test.ts` выполнено лишь сканирование 8999 точек с шагом $0.01^\circ$ и бисекция; строгое аналитическое доказательство через производные, знаки $f'(\alpha)$ и монотонность (а также явный вывод алгебраической единственности $(3,4,5)$ / $(4,3,5)$ для $w_C = w_b, w_a$) отсутствует и вынесено на Этап 4.
9. **Статус автоматизированной верификации:**
   - `src/tests/experiment06.arcSideArea.test.ts`: 51 точка ($r=1,2,3$, шаг $5^\circ$), все мосты и инварианты, `(3,4,5)`, `(4,3,5)`, реконструкция, 6 пересечений методом бисекции, 3 SVG.
   - `src/tests/experiment06.audit.test.ts`: независимый пересчёт координат и площадей (формула шнурков + полусуммы с биссектрисами), проверка Law of Sines (с относительным допуском), реконструкция непрямоугольного треугольника `(50°, 60°, 70°)`, скан 8999 точек.
10. **Обнаруженные проблемы, коллизии обозначений, противоречия или пробелы:**
    - **Системная коллизия `a, b` с `CORE-01` и `EXP-01..05`:** здесь `a = |OB|, b = |OA|`, в остальном проекте наоборот (`a = |OA|, b = |OB|`).
    - **Коллизия $S_a, S_b, S_c$ с `CORE-01` (`SquareConstruction.ts` / `PCL-B07`):** в `CORE-01` $S_a = a^2, S_b = b^2, S_c = c^2$ (внешние квадраты), а в `EXP-06` $S_a, S_b, S_c$ — площади подтреугольников $\frac{1}{2}ar, \frac{1}{2}br, \frac{1}{2}cr$ (и в `F-004` они же названы $S_{OA}, S_{OB}, S_{AB}$).
    - **Коллизия $\alpha$ с `CORE-01` (`RightTriangle.ts`):** в `EXP-06` $\alpha = \angle B$, а в `RightTriangle.ts` `alphaDeg` $= \angle A$.
    - **Коллизия `areaA, areaB, areaC` в TypeScript vs $S_a, S_b, S_c$ в документах** (в Едином стандарте обозначений Этапа 3 целесообразно унифицировать регистр индексов).
    - Отсутствие строгого аналитического доказательства единственности каждого из 6 корней и строгого неравенства для пар `(A,b)`, `(B,a)` (только плотная сетка 8999 точек).
    - Раздел 3 `EXPERIMENT_06_ARC_SIDE_AREA_CORRESPONDENCE.md` не содержит явной ссылки на строгий аудит корней в отрыве от скана (подлежит замене на аналитическое доказательство на Этапе 4).

---

## Сводный реестр системных коллизий и противоречий (для Этапов 3–4)

1. **Противоречие 1 (Обозначение катетов `a` и `b`):** `CORE-01`, `EXP-01..05` (`a = |OA|`, `b = |OB|`) $\longleftrightarrow$ `EXP-06` (`a = |OB|`, `b = |OA|`).
2. **Противоречие 2 (Тройная перегрузка символа $\alpha$):**
   - `CORE-01`, `EXP-01`: $\alpha = \angle A = \arctan(b/a)$;
   - `EXP-03..06` (и `F-007`): $\alpha = \angle B = \arctan(a/b)$;
   - `ArcAngleAnalysisPanel.tsx` / `ArcAngleBoardOverlay.tsx`: смешение пропса `alphaDeg` ($\angle B$) и `calc.triangle.alphaDeg` ($\angle A$) в одном компоненте.
3. **Противоречие 3 (Двойная перегрузка символа $\varphi$ и $\theta$):** `EXP-02` ($\varphi = \alpha$, $\theta = 2\alpha$) $\longleftrightarrow$ `EXP-05..06` ($\varphi_K = 180^\circ - K$, сумма $360^\circ$).
4. **Противоречие 4 (Конфликт $S_a, S_b, S_c$):** в `PCL-B07` — площади внешних квадратов ($a^2, b^2, c^2$); в `EXP-06` — площади подтреугольников ($\frac{1}{2}ar, \frac{1}{2}br, \frac{1}{2}cr$); в `F-004` — $S_{OA}, S_{OB}, S_{AB}$.
5. **Противоречие 5 (Перегрузка $P, L$):** $P$ = периметр треугольника / длина окружности $P_x$; $p$ = полупериметр; $L$ = длина дуги вписанной окружности / длина описанной окружности $L_o = \pi c$.
6. **Противоречие 6 (Численный скан вместо аналитического доказательства в `EXP-06`):** число корней ($6$) и отсутствие корней у `(A,b)`, `(B,a)` подтверждены лишь сканом $8999$ точек без производных и анализа монотонности.
7. **Противоречие 7 (Мелкие расхождения метаданных в `docs/`):** количество паспортов в `FORMULA_PASSPORTS.md` (`29` в шапке vs `30` по факту `A01..G30`) и `FORMULA_DEPENDENCY_GRAPH.md` (`24`), а также точность округления `clampVal` (`1e-6` в `PCL-F24` vs `1e-4` в `NUMERICAL_ANALYSIS.md`).
