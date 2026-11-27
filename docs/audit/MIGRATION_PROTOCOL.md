# Migration Protocol (`LEGACY → CANONICAL`) — Pythagoras-Circles-Lab

**Статус:** Поэтапный протокол миграции через Canonical Shadow Stand  
**Текущий этап:** **Stage 5.2.3 (`LT-04 → CT-04` пересмотрен и синхронизирован с рабочим доменом; мигрированы `4` из `23` тестов)**. Проверены одновременные (`AND`) границы Уровня 1 (`rho in [1/24, 24]`, `alpha in [2.386°, 87.614°]`, `lambda in [0.1414, 4.2426]`) и Уровня 2 (`rho in [0.01, 100]`, `alpha in [0.573°, 89.427°]`, `lambda in [0.0283, 42.4264]`) + плотный скан из `457` точек без ослабления допусков; экстремальные пробы (`1e±150`, `1e5`, `1e8`, `1e154`) исключены из обязательного Canonical. Остановка перед `LT-05`–`LT-23`.  
**Разрешённые статусы (`migration_status`):** `NOT_STARTED`, `IN_PROGRESS`, `PASSED`, `FAILED`, `REQUIRES_DECISION`.

---

## 1. Протокол по каждой тестовой единице

### `LT-01` → `CT-01`: Control Triangles & 8 Core Invariants (`PASSED`)
- **test_id:** `LT-01`
- **legacy_test_reference:** `src/tests/geometry.test.ts` (Section 1, lines 56–109)
- **canonical_test_reference:** `src/tests/canonical/test01_controlTriangles.canonical.test.ts` (`CT-01`)
- **legacy_notation:** `a = |OA| (opp B)`, `b = |OB| (opp A)`, `c = |AB|`, `O = (0,0)`, `A = (0, a)`, `B = (b, 0)`, `squareA/circleA` (на $OA$, центр $(-a/2, a/2)$), `squareB/circleB` (на $OB$, центр $(b/2, -b/2)$), `squareC/circleC` (на $AB$), `incircle` ($I=(r,r)$), `Ka, Kb, Kc, Ki`
- **canonical_notation:** `sideA = |BC| (opp A)`, `sideB = |AC| (opp B)`, `sideC = |AB| (opp C)`, `vertexC = (0,0)`, `vertexA = (0, sideB)`, `vertexB = (sideA, 0)`, `angleAlphaDeg = angleA`, `angleBetaDeg = angleB`, `squareA/circleKa` (на $BC$, центр `(sideA/2, -sideA/2)`), `squareB/circleKb` (на $AC$, центр `(-sideB/2, sideB/2)`), `squareC/circleKc` (на $AB$), `incircleKi`, `subtriangleAreaA/B/C`, `arcAngleA/B/C`
- **semantic_mapping:** Vertex-Preserving (`Legacy (O, A, B) → Canonical (C, A, B)`):
  - `legacy.triangle.b` ($|OB|$) $\mapsto$ `canonical.triangle.sideA` ($|BC|$)
  - `legacy.triangle.a` ($|OA|$) $\mapsto$ `canonical.triangle.sideB` ($|AC|$)
  - `legacy.triangle.c` $\mapsto$ `canonical.triangle.sideC`
  - `legacy.triangle.alphaDeg` $\mapsto$ `canonical.triangle.angleAlphaDeg`
  - `legacy.triangle.betaDeg` $\mapsto$ `canonical.triangle.angleBetaDeg`
  - `legacy.squareA / circleA` $\mapsto$ `canonical.squareB / circleKb`
  - `legacy.squareB / circleB` $\mapsto$ `canonical.squareA / circleKa`
  - `legacy.squareC / circleC / incircle` $\mapsto$ `canonical.squareC / circleKc / incircleKi`
  - `legacy.incircle.tangencyOA / OB / AB` $\mapsto$ `canonical.incircleKi.tangencySideB / SideA / SideC`
- **expected_result:** Для всех 6 контрольных треугольников (`(3,4,5)`, `(4,3,5)`, `(5,12,13)`, `(4,4,4√2)`, `(1,10,√101)`, `(10,1,√101)`): точные $c, r>0$, точные центры и диаметры окружностей, площади $K_a, K_b, K_c, K_i$, все 8 инвариантов `isValid === true`, $\sqrt{K_a}+\sqrt{K_b}=\sqrt{K_c}+\sqrt{K_i}$, $K_a+K_b=K_c$, $K_a+K_b-K_c-K_i=-K_i < 0$, а в канонике дополнительно: строгое соответствие $a > b \iff \alpha > \beta$, равенство $S_A + S_B + S_C = S = p r$ и $100\%$ семантическая эквивалентность координат и объектов с Legacy через `verifyLegacyToCanonicalMapping`.
- **legacy_result:** `PASSED` (6 контрольных треугольников × 8 инвариантов + арифметические проверки; `npm test` зелёный).
- **canonical_result:** `PASSED` (`npx tsx src/tests/canonical/test01_controlTriangles.canonical.test.ts` — паспорт `CT01_PASSPORT`, все 6 треугольников, паритет `8/8` Legacy и Canonical инвариантов, правило $a>b \iff \alpha>\beta$, разбиение $S_A+S_B+S_C=S=pr$ и поэлементный мост `verifyLegacyToCanonicalMapping` с `maxDeviation = 0`).
- **equivalence_status:** `EQUIVALENT_UNDER_VERTEX_PRESERVING_MAP` (`maxDeviation = 0`, включая полные координаты вершин, центров квадратов/кругов, точек касания и острых углов; явно зафиксирована перестановка индексов `circleA ↔ circleKb`, `circleB ↔ circleKa`).
- **diagnostics:** В координатах и геометрии расхождений нет (`0` float64 discrepancy). В Stage 5.1 добавлен 6-компонентный паспорт `CT01_PASSPORT`, проверка `validateLegacyFourCirclesInvariants` и вынесены общие утилиты в `testHelpers.ts`.
- **migration_status:** `PASSED`

---

### `LT-02` → `CT-02`: Leg-Swap Symmetry (`PASSED`)
- **test_id:** `LT-02`
- **legacy_test_reference:** `src/tests/geometry.test.ts` (Section 2, lines 111–120)
- **canonical_test_reference:** `src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` (`CT-02`)
- **legacy_notation:** `a = |OA|`, `b = |OB|`, `Ka = circleA.area`, `Kb = circleB.area`, `Kc = circleC.area`, `r = incircle.radius`, `Ki = incircle.area`; перестановка `(3, 7) <-> (7, 3)`
- **canonical_notation:** `sideA = |BC|`, `sideB = |AC|`, `squareA/circleKa` (на `BC`), `squareB/circleKb` (на `AC`), `circleKc`, `circumcircleKo`, `incircleKi`, `angleAlphaDeg`, `angleBetaDeg`, `incenterPartition.subtriangleAreaA/B`, `incenterPartition.arcAngleADeg/BDeg`; отражение относительно $y = x$: `(sideA, sideB) <-> (sideB, sideA)`
- **semantic_mapping:** Vertex-Preserving (`Legacy (O, A, B) → Canonical (C, A, B)`):
  - `legacy(3, 7)` $\mapsto$ `canonical(sideA=7, sideB=3)`
  - `legacy(7, 3)` $\mapsto$ `canonical(sideA=3, sideB=7)`
  - `legacy.s1.circleA` (на $OA=3$) $\mapsto$ `canonical(7,3).circleKb` (на $AC=3$)
  - `legacy.s2.circleB` (на $OB=3$) $\mapsto$ `canonical(3,7).circleKa` (на $BC=3$)
  - `legacy.circleC / incircle` $\mapsto$ `canonical.circleKc / incircleKi` (инвариантны к перестановке)
- **expected_result:** При `(sideA, sideB) <-> (sideB, sideA)` обмениваются площади, диаметры и отражаются $(x \leftrightarrow y)$ центры `circleKa <-> circleKb` и `squareA <-> squareB`, обмениваются острые углы `angleAlpha <-> angleBeta`, площади подтреугольников `subtriangleAreaA <-> subtriangleAreaB`, углы секторов `arcAngleA <-> arcAngleB` и точки касания $T_a \leftrightarrow T_b$; сохраняются $K_c, K_o, r, K_i, c, S$, а оба состояния удовлетворяют всем 8 каноническим инвариантам и воспроизводимы при повторном вызове.
- **legacy_result:** `PASSED` (`npm test` Section 2 зелёный).
- **canonical_result:** `PASSED` (`npx tsx src/tests/canonical/test02_legSwapSymmetry.canonical.test.ts` — паспорт `CT02_PASSPORT`, чистый канонический тест для `(7,3)` и `(1.25, 4.8)` с проверкой `Ka<->Kb`, `C_a<->C_b`, `P`, `tangentSegA<->B`, `shares`, `T_a<->T_b` + двусторонняя сверка с Legacy `(3,7) <-> (7,3)`).
- **equivalence_status:** `EQUIVALENT_UNDER_VERTEX_PRESERVING_MAP` (`maxDev(3,7) = 0.00e+0`, `maxDev(7,3) = 0.00e+0` через `verifyLegacyToCanonicalMapping`).
- **diagnostics:** Расхождений нет. Повторно подтверждена инверсия индексов кругов на катетах при переходе `Legacy → Canonical`: `circleKb(7,3) === circleKa(3,7)`. Инверсия `shapeRatio` не дублируется с `semanticContract.canonical.test.ts`.
- **migration_status:** `PASSED`

---

### `LT-03` → `CT-03`: Strict Input Validation Contract (`PASSED`)
- **test_id:** `LT-03`
- **legacy_test_reference:** `src/tests/geometry.test.ts` (Section 3, lines 122–156)
- **canonical_test_reference:** `src/tests/canonical/test03_inputValidation.canonical.test.ts` (`CT-03`)
- **legacy_notation:** `InvalidTriangleInputError`, `calculateFourCircles(a,b)`, `calculateRightTriangle(a,b)`, `calculateSquareC(a,b)`, `calculateSquareA(a)` (по $|OA|$), `calculateSquareB(b)` (по $|OB|$)
- **canonical_notation:** `InvalidCanonicalTriangleInputError` (с полями `sideName`, `value`), `calculateCanonicalFourCircles(sideA, sideB)`, `buildCanonicalRightTriangle(sideA, sideB)`, `buildCanonicalSquareC(sideA, sideB)`, `buildCanonicalSquareA(sideA)` (на `BC`), `buildCanonicalSquareB(sideB)` (на `AC`), `assertValidCanonicalSide(value, sideName)`, `assertValidCanonicalSides(sideA, sideB)`
- **semantic_mapping:**
  - `legacy.calculateFourCircles(a, b)` $\mapsto$ `canonical.calculateCanonicalFourCircles(sideA=b, sideB=a)`
  - `legacy.calculateRightTriangle(a, b)` $\mapsto$ `canonical.buildCanonicalRightTriangle(sideA=b, sideB=a)`
  - `legacy.calculateSquareC(a, b)` $\mapsto$ `canonical.buildCanonicalSquareC(sideA=b, sideB=a)`
  - `legacy.calculateSquareA(a)` (сторона $OA$) $\mapsto$ `canonical.buildCanonicalSquareB(sideB=a)` (сторона $AC$)
  - `legacy.calculateSquareB(b)` (сторона $OB$) $\mapsto$ `canonical.buildCanonicalSquareA(sideA=b)` (сторона $BC$)
- **expected_result:** Область допустимых входов — строго $(0, +\infty)^2 \subset \mathbb{R}^2$. Все вырожденные и неконечные значения (`0`, `-0`, `<0`, `NaN`, `+Infinity`, `-Infinity`) выбрасывают `InvalidCanonicalTriangleInputError` с корректным указанием имени отвергнутого параметра (`sideName`), а валидные входы воспроизводимо строят $Q_a, Q_b$ и полную 5-окружностную модель.
- **legacy_result:** `PASSED` (`npm test` Section 3 зелёный).
- **canonical_result:** `PASSED` (`npx tsx src/tests/canonical/test03_inputValidation.canonical.test.ts` — паспорт `CT03_PASSPORT`, 11 пар входов + 6 одиночных значений + положительные границы `(4,3)`, `(1e-12,1e-12)`, `(1e12,1e12)` + точный паритет `err.sideName` на всех 9 парах Legacy LT-03 и `SquareA(0)/SquareB(-1)`).
- **equivalence_status:** `EQUIVALENT_CONTRACT_UNDER_SIDE_ROLE_MAP` (100% совпадение отклонений во всех точках входа при точном сопоставлении `legacy.calculateSquareA ↔ canonical.buildCanonicalSquareB` и `legacy.calculateSquareB ↔ canonical.buildCanonicalSquareA`).
- **diagnostics:** В Stage 5.1 добавлен паспорт `CT03_PASSPORT`, проверка допустимых границ и явная проверка `err.sideName` при отображении индексов Legacy (`legA -> sideB`, `legB -> sideA`). Legacy-код `src/math/*` не затрагивался.
- **migration_status:** `PASSED`

---

### `LT-04` → `CT-04`: Practical Domain Numerical Stability (`PASSED`, Stage 5.2.3 Revised)
- **test_id:** `LT-04`
- **legacy_test_reference:** `src/tests/geometry.test.ts` (Section 4, lines 158–178)
- **canonical_test_reference:** `src/tests/canonical/test04_numericalStability.canonical.test.ts` (`CT-04`)
- **legacy_notation:** `scaleCases: [1e-6,1e-6], [1e-4,3e-4], [0.2,15], [15,0.2], [1,1e5], [1e5,1], [1e50,2e50]`, `validateFourCirclesInvariants`
- **canonical_notation:** `sideA, sideB, sideC, inradius, shapeRatio = sideA/sideB = tan(alpha), angleAlphaDeg, Ka/Kb/Kc/Ki/Ko, subtriangleAreaA/B/C, tangentSegA/B/C` внутри одновременного (`AND`) рабочего домена Stage 5.2.3: Part A (Scale `lambda in [0.0283, 42.4264]` + 6 пресетов), Part B (Aspect Ratio `rho in [1/24, 24]` для Уровня 1 и `[0.01, 100]` для Уровня 2, включая `LT-04` `(15, 0.2)` и `(0.2, 15)`), Part C (плотный скан `457` точек)
- **semantic_mapping:** Vertex-Preserving (`legacy.a → sideB`, `legacy.b → sideA`) для практических пар `(0.2, 15)` и `(15, 0.2)`; экстремальные пробы `LT-04` `(1e-6, 1e-6)`, `(1e-4, 3e-4)`, `(1e50, 2e50)`, `(1, 1e5)`, `(1e5, 1)` классифицированы как `OUT_OF_PRACTICAL_DOMAIN` по принципу `VISUAL-GEOMETRIC FIDELITY OVER EXTREME NUMERICAL RANGE` и оставлены только в архиве Legacy `LT-04`
- **expected_result:** Во всём рабочем домене (`0.1 <= sideA, sideB <= 150` И `0.01 <= rho <= 100`, `0.573° <= alpha <= 89.427°`, производный `lambda in [0.0283, 42.4264]`) проходят все `8/8` канонических и `8/8` Legacy-инвариантов (`tol = 1e-9`), однородность степеней `1, 2, 0` (`<= 1e-12` rel) и семантический мост (`maxDeviation <= 1e-12`)
- **legacy_result:** `PASSED` (`npm test` Section 4 зелёный на всех 7 парах; Legacy-файл не менялся)
- **canonical_result:** `PASSED` (`npx tsx src/tests/canonical/test04_numericalStability.canonical.test.ts` — паспорт `CT04_PASSPORT`, Part A/B/C пройдены; в плотном скане `457` точек `maxDelta = 7.74e-14` в Уровне 1 и `2.34e-12` в Уровне 2)
- **equivalence_status:** `EQUIVALENT_ON_PRACTICAL_DOMAIN` (100% паритет скаляров и геометрии с Legacy в пределах Уровня 1 и Уровня 2; экстремальные пробы вне рабочего домена исключены из Canonical по Stage 5.2.3)
- **diagnostics:** В `CT-04` убраны экстремальные пробы (`1e±150`, `1e5`, `1e8`, `1e154`) и добавлен плотный двумерный скан `457` точек рабочего домена; ядро `src/canonical/*`, `src/math/*` и допуски `1e-9` / `1e-12` не изменялись.
- **migration_status:** `PASSED`

---

### Ожидающие миграции тесты (`LT-05` – `LT-23`) — ВСЕ в статусе `NOT_STARTED`

| test_id | legacy_test_reference | canonical_test_reference | legacy_notation | canonical_notation | semantic_mapping | expected_result | legacy_result | canonical_result | equivalence_status | diagnostics | migration_status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `LT-05` | `geometry.test.ts` Sec 5 | `TBD` | Мутации `incircle`, `squareC` | Мутации `incircleKi`, `squareC` | `incircle→incircleKi, Qc.Bc→vertices[1]` | Валидаторы ловят поломки геометрии | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-06` | `geometry.test.ts` Sec 6 | `TBD` | `computeFourCirclesSpectralAnalysis`, `Pa..Pi` | `circumferenceKa..Ki`, `items[4]` | `Ka↔Kb` при переходе на `sideA/B` | Сумма долей $100\%$, симметрия | `PASS (Legacy)` | `—` | `PENDING` | Требует канонизации модуля спектра | `NOT_STARTED` |
| `LT-07` | `geometry.test.ts` Sec 7 | `TBD` | `t = b/a`, `evaluateParametricFourCircles` | `shapeRatio = sideA/sideB`, `shapeRatioDefinition`, `evaluateCanonicalSpectralByShapeRatio` | `t_legacy = shapeRatio = sideA/sideB = tan(alpha)` | Все кривые совпадают с аналитикой | `PASS (Legacy)` | `—` | `PENDING` | Контракт `shapeRatio` закреплён в Task 3; ждёт миграции `CT-07` | `NOT_STARTED` |
| `LT-08` | `geometry.test.ts` Sec 8 | `TBD` | `t <-> 1/t`, `evaluateSymmetryTrajectoryT` | Симметрия `sideA <-> sideB` | `t_legacy ↔ 1/t_legacy` | Обмен $K_a \leftrightarrow K_b$, монотонность в $\ln t$ | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-09` | `geometry.test.ts` Sec 9 | `TBD` | `ThalesCircumcircle`, `Oo=(b/2,a/2)`, `Lo` | `circumcircleKo`, `O_o=(sideA/2, sideB/2)`, `C_o` | `17` инвариантов (`8 + 9`), `Lo → circumferenceKo` | $K_o=K_c$, поворот, 17 инвариантов, мутации | `PASS (Legacy)` | `—` | `PENDING` | Требует добавления 9 Thales-валидаторов в `canonicalValidators.ts` | `NOT_STARTED` |
| `LT-10` | `geometry.test.ts` Sec 10 | `TBD` | `lambda`, `Sc` (площадь квадрата!) | `lambda`, `squareAreaC` | `Sc_square → squareAreaC` | Однородность степеней 1 и 2, 17 инвариантов | `PASS (Legacy)` | `—` | `PENDING` | Критично устранить имя `Sc` для площади квадрата | `NOT_STARTED` |
| `LT-11` | `semanticFormulaPassports.test.ts` Sec 1 | `TBD` | `a=5,b=12,S_OA,S_OB,S_AB` | `sideA=12,sideB=5,S_A,S_B,S_C` или `(5,12)` с явными $A,B$ | `S_OA→subtriangleAreaB`, `S_OB→subtriangleAreaA` | Верны `F-001`..`F-006` | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-12` | `semanticFormulaPassports.test.ts` Sec 2 | `TBD` | Непрямоугольный `(5,5,6)` | `sideA=5, sideB=5, sideC=6` ($\gamma\neq 90^\circ$) | Прямое сопоставление границ домена | $S=pr$ верно, формулы $C=90^\circ$ ложны | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-13` | `semanticFormulaPassports.test.ts` Sec 3 | `TBD` | `F-007`, `alphaDeg = angleB` | `angleBetaDeg = angleB`, `angleAlphaDeg = angleA` | `Exp04 alphaDeg → angleBetaDeg` | Согласование с Exp 04 и отказ перепутанного варианта | `PASS (Legacy)` | `—` | `PENDING` | Критическая замена имени `alphaDeg → angleBetaDeg` | `NOT_STARTED` |
| `LT-14` | `experiment01.circleFirst.test.ts` Sec 1–2 | `TBD` | `r, t=b/a, a=|OA|, b=|OB|` | `inradius, sideA, sideB` | `(a,b) → (sideB, sideA)` | Отсечение ошибочной формулы и `(3,4,5)` | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-15` | `experiment01.circleFirst.test.ts` Sec 3–4 | `TBD` | `r=1,2,3`, `P`, `S`, `alphaDeg, betaDeg` | `inradius, perimeter, triangleArea, angleAlphaDeg, angleBetaDeg` | `P → perimeter` | Однородность по $r$, 17 инвариантов Core | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-16` | `experiment01.circleFirst.test.ts` Sec 5–6 | `TBD` | Биекция $\Phi, \Psi$, `t <-> 1/t` | Канонические $\Phi, \Psi$ | Инверсия/сохранение `t` | Точность при $t=10^{-15}$, ошибка $<10^{-12}$ | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-17` | `experiment02.arcBased.test.ts` Sec 1–2 | `TBD` | `phiDeg (=angleB)`, `thetaCotHalfDeg` | `tangentPolarAngleDeg = angleBetaDeg`, `cotHalfParamThetaDeg` | `Exp02 phiDeg → angleBetaDeg` | Соответствие $\theta=90^\circ \Rightarrow t=1$ | `PASS (Legacy)` | `—` | `PENDING` | Устраняет коллизию `phi` с Exp 05 | `NOT_STARTED` |
| `LT-18` | `experiment02.arcBased.test.ts` Sec 3–5 | `TBD` | Угловая и линейная сетки | То же в `angleBetaDeg`, `arcLengthFromNorth` | `phiDeg → angleBetaDeg` | Счётчики треугольников и отсев границ | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-19` | `experiment03.geometricValidation.test.ts` | `TBD` | `alphaDeg (=angleB)`, `thetaExp02Deg` | `angleBetaDeg`, `cotHalfParamThetaDeg` | `Exp03 alphaDeg → angleBetaDeg` | Касательная и $L=r\beta_{\text{рад}}$ совпадают | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-20` | `experiment04.arcAngle.test.ts` | `TBD` | `alphaDeg (=B)`, `angleADeg=90-alpha`, `a=|OA|, b=|OB|` | `angleBetaDeg`, `angleAlphaDeg`, `sideB=|OA|, sideA=|OB|` | `alphaDeg→angleBetaDeg`, `a→sideB`, `b→sideA` | 51 точка, 6 зон, симметрия | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-21` | `experiment05.incircleArcDistribution.test.ts` | `TBD` | `alphaDeg (=B)`, `phiADeg, phiBDeg, phiCDeg`, `a=|OA|, b=|OB|` | `angleBetaDeg`, `arcAngleADeg/BDeg/CDeg`, `sideB, sideA` | **Осторожно:** в Exp 05 `phiA=180-A=90+alpha_exp05` | $\sum\varphi=360^\circ$, $\varphi_C=90^\circ$, невозможность $120^\circ\times 3$ | `PASS (Legacy)` | `—` | `PENDING` | Проверить формулу $\varphi_A = 180^\circ - \alpha_{\text{canon}} = 90^\circ + \beta_{\text{canon}}$ | `NOT_STARTED` |
| `LT-22` | `experiment06.arcSideArea.test.ts` | `TBD` | `a=|OB|, b=|OA|` (уже opp), но `alphaDeg=B`, `areaA/B/C` | `sideA, sideB, angleAlphaDeg=A, angleBetaDeg=B, subtriangleAreaA/B/C` | `Exp06 alphaDeg → angleBetaDeg` | Законы `L-01`..`L-08`, реконструкция, 6 совпадений | `PASS (Legacy)` | `—` | `PENDING` | — | `NOT_STARTED` |
| `LT-23` | `experiment06.audit.test.ts` | `TBD` | Независимый аудит, `alpha=B`, `S_a, S_b, S_c` | Независимый аудит в `angleAlpha/Beta`, `subtriangleAreaA/B/C` | `alpha→angleBeta` | Shoelace, 8999-точечное сканирование | `PASS (Legacy)` | `—` | `PENDING` | Связано с Stage 4 корневым аудитом | `NOT_STARTED` |
