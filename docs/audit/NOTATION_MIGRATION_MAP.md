# Notation Migration Map (`LEGACY → CANONICAL`) — Pythagoras-Circles-Lab

**Статус:** Полный реестр символов и коллизий обозначений (`Stage 3`)  
**Назначение:** Однозначное сопоставление каждого legacy-символа и программного идентификатора с его реальным геометрическим смыслом и каноническим именем из [`MATHEMATICAL_NOTATION_STANDARD.md`](../standards/MATHEMATICAL_NOTATION_STANDARD.md).

---

## 1. Сводная карта наиболее опасных коллизий (Critical Symbol Collisions)

1. **Коллизия `a` / `b` между Core (`RightTriangle.ts`, Exp 01–05) и Exp 06 (`arcSideAreaCorrespondence.ts`):**
   - В Core и Exp 01–05: `a = |OA|` (вертикальный катет на $+Oy$, **напротив $\angle B$**), `b = |OB|` (горизонтальный катет на $+Ox$, **напротив $\angle A$**).
   - В Exp 06 и Каноническом стандарте: `sideA = a = |BC| = |OB|` (напротив $\angle A$), `sideB = b = |AC| = |OA|` (напротив $\angle B$).
   - **Следствие для кругов и квадратов:** при сохранении вершин `(O, A, B) → (C, A, B)` legacy-объекты `squareA` / `circleA` (построенные на $|OA|$) семантически являются каноническими **`squareB` ($Q_b$) / `circleKb` ($K_b$)**, а legacy `squareB` / `circleB` (на $|OB|$) — каноническими **`squareA` ($Q_a$) / `circleKa` ($K_a$)**!

2. **Коллизия `alphaDeg` между Core (`RightTriangle.ts`) и Exp 03–06:**
   - В `RightTriangle.ts`: `alphaDeg = ∠A = atan2(legOB, legOA)`.
   - В Exp 03–06 (`arcGeometricValidation.ts`, `arcAngleParametricAnalysis.ts`, `incircleArcDistribution.ts`, `arcSideAreaCorrespondence.ts`): `alphaDeg = ∠B = atan2(legOA, legOB)` (центральный угол от севера $N=(r,2r)$ к $E=(2r,r)$).
   - В UI (`ArcAngleAnalysisPanel.tsx:47`, `ArcAngleBoardOverlay.tsx:42`) обе переменные с именем `alphaDeg` (одна $= \angle B$, вторая `calc.triangle.alphaDeg = ∠A$) существуют в одном компоненте одновременно!

3. **Коллизия `phi` между Exp 02 и Exp 05–06:**
   - В Exp 02 (`arcBasedClassification.ts`): `phiDeg` $\in (0^\circ, 90^\circ)$ — координата точки касания $T_{AB}$ (равна $\angle B$), а `thetaCotHalfDeg = 2 * phiDeg`.
   - В Exp 05–06 (`incircleArcDistribution.ts`, `arcSideAreaCorrespondence.ts`): `phiADeg = 180 - A`, `phiBDeg = 180 - B`, `phiCDeg = 90` — центральные углы трёх секторов вписанной окружности, в сумме дающие $360^\circ$.

4. **Коллизия `S_a, S_b, S_c` между Core/Thales (`PCL-B07`) и Exp 06:**
   - В `ThalesCircumcircle.ts` (`ScaleTransformationResult.Sc`) и `docs/FORMULA_PASSPORTS.md`: `Sa, Sb, Sc` — площади **внешних квадратов** $Q_a, Q_b, Q_c$.
   - В `docs/experiments/EXPERIMENT_06...` и тестах Exp 06: $S_a, S_b, S_c$ — площади **малых треугольников** $\triangle IOB, \triangle IOA, \triangle IAB$.

5. **Коллизия `P` / `Pa..Pi` / `L_o` / `L`:**
   - `Pa, Pb, Pc, Pi` в `FourCirclesSpectralAnalysis.ts` — длины окружностей $K_a, K_b, K_c, K_i$.
   - `Lo` в `ThalesCircumcircle.ts` — длина описанной окружности $K_o$.
   - `P` (`perimeter`) в Exp 01 — периметр треугольника; `p` в `F-003` — полупериметр.
   - `L` / `L_A, L_B, L_C` в Exp 02–05 — длины дуг вписанной окружности.

---

## 2. Полная таблица миграции символов и идентификаторов

| Legacy идентификатор / символ | Реальный геометрический смысл в Legacy | Канонический символ / имя | Все места использования в коде / docs | Риск неверной трактовки | Рекомендуемая стратегия миграции |
|---|---|---|---|---|---|
| **Вершины и координаты** | | | | | |
| `triangle.O` / $O(0,0)$ | Вершина прямого угла $\angle O = 90^\circ$ в $(0,0)$ | $C = (0, 0)$ / `vertexC` | `src/types/geometry.ts`, `RightTriangle.ts`, `ThalesCircumcircle.ts`, `FourCirclesView.tsx`, Exp 03–06 | Низкий (путаница между точкой $O$ и центром окружности $O_a, O_b, O_c, O_o$) | Переименовать вершину в `vertexC` ($C$); центры окружностей оставить `centerKa..Ko` |
| `triangle.A` / $A(0, a_{\text{leg}})$ | Острая вершина на положительной полуоси $+Oy$ | $A = (0, \text{sideB})$ / `vertexA` | `RightTriangle.ts`, `FourCirclesView.tsx`, Exp 03–06 | Средний (из-за индекса `a` на соседнем катете $OA$) | Сохранить координату на $+Oy$, явно закрепив `OA = sideB` |
| `triangle.B` / $B(b_{\text{leg}}, 0)$ | Острая вершина на положительной полуоси $+Ox$ | $B = (\text{sideA}, 0)$ / `vertexB` | `RightTriangle.ts`, `FourCirclesView.tsx`, Exp 03–06 | Средний (из-за индекса `b` на соседнем катете $OB$) | Сохранить координату на $+Ox$, явно закрепив `OB = sideA` |
| **Стороны треугольника** | | | | | |
| `triangle.a` / $a$ (Core, Exp 01–05) | Вертикальный катет $|OA|$ на $+Oy$, **противолежащий вершине $B$** | $b = |AC|$ / `sideB` (алиас `legOA`) | `RightTriangle.ts`, `SquareConstruction.ts`, `FourCirclesModel.ts`, `FourCirclesSpectralAnalysis.ts`, `circleFirstClassification.ts`, `arcBasedClassification.ts`, `arcGeometricValidation.ts`, `arcAngleParametricAnalysis.ts`, `incircleArcDistribution.ts`, `geometry.test.ts` | **Критический:** инверсия правила $a \text{ opp } A$; ломает знаки и монотонность при переносе формул из учебников и Exp 06 | Ввести `sideB` в Canonical Stand; в `legacyMapping.ts` явно отображать `legacy.triangle.a → canonical.sideB` |
| `triangle.b` / $b$ (Core, Exp 01–05) | Горизонтальный катет $|OB|$ на $+Ox$, **противолежащий вершине $A$** | $a = |BC|$ / `sideA` (алиас `legOB`) | Все те же модули Core и Exp 01–05 | **Критический:** инверсия правила $b \text{ opp } B$ | Ввести `sideA` в Canonical Stand; `legacy.triangle.b → canonical.sideA` |
| `triangle.c` / $c$ | Гипотенуза $|AB|$, противолежащая прямому углу | $c = |AB|$ / `sideC` | Все модули Core, Thales, Exp 01–06 | Низкий | Зафиксировать `sideC` |
| `a, b` (в Exp 06) | Стандартные противоположные катеты: `a = |OB|` opp $A$, `b = |OA|` opp $B$ | $a$ (`sideA`), $b$ (`sideB`) | `src/math/experiments/arcSideAreaCorrespondence.ts`, `ArcSideAreaPanel.tsx`, `experiment06.*.test.ts` | Высокий при сравнении с `calc.triangle.a/b` в UI | В Canonical Stand принять это соглашение как базовое и перенести на `sideA, sideB` |
| `legOA`, `legOB` (Exp 06) | Явные координатные длины $|OA|$ на $+Oy$ и $|OB|$ на $+Ox$ | `legOA` ($= \text{sideB}$), `legOB` ($= \text{sideA}$) | `arcSideAreaCorrespondence.ts:135-136,254-257` | Низкий (введены как защитный мост) | Сохранить как явные координатные алиасы с комментарием |
| **Углы и параметры дуги** | | | | | |
| `triangle.alphaDeg` (Core, Exp 01) | Острый угол при вершине $A$: $\arctan(|OB|/|OA|)$ | $\alpha = \angle A$ / `angleAlphaDeg` | `RightTriangle.ts:28`, `circleFirstClassification.ts:125-126` | **Критический:** прямое столкновение с `alphaDeg` из Exp 03–06! | В Canonical Stand закрепить `angleAlphaDeg = angleA` |
| `triangle.betaDeg` (Core, Exp 01) | Острый угол при вершине $B$: $\arctan(|OA|/|OB|)$ | $\beta = \angle B$ / `angleBetaDeg` | `RightTriangle.ts:29`, `circleFirstClassification.ts:127-128` | **Критический:** в Exp 03–06 эта величина названа `alphaDeg` | В Canonical Stand закрепить `angleBetaDeg = angleB` |
| `alphaDeg`, `alphaRad` (Exp 03–06) | Центральный угол касания $T_{AB}$ от $N=(r,2r)$ к $E=(2r,r)$, равный **$\angle B$** | $\beta$ / `angleBetaDeg` (параметр `tangentPolarFromNorthDeg = angleBetaDeg`) | `arcGeometricValidation.ts:29`, `arcAngleParametricAnalysis.ts:36`, `incircleArcDistribution.ts:30`, `arcSideAreaCorrespondence.ts:117`, `ArcAngleAnalysisPanel.tsx`, `ArcAngleBoardOverlay.tsx`, `IncircleArcDistributionPanel.tsx`, `IncircleArcDistributionOverlay.tsx`, `ArcSideAreaPanel.tsx`, `App.tsx:93-96` | **Критический:** в одном файле `App.tsx` и `ArcAngleAnalysisPanel.tsx` одно имя `alphaDeg` означает $\angle B$, а `calc.triangle.alphaDeg` — $\angle A$! | В Canonical Stand отделить параметр положения $T_c$ (равный $\beta$) от угла при вершине $A$ ($\alpha$) |
| `phiDeg`, `phiRad` (Exp 02) | Координата точки касания от $N=(r,2r)$ к $E=(2r,r)$, равная $\angle B$ | `tangentPolarAngleDeg = angleBetaDeg` | `arcBasedClassification.ts:24-25`, `ArcClassificationPanel.tsx`, `experiment02.arcBased.test.ts` | **Высокий:** конфликтует с $\varphi_A, \varphi_B, \varphi_C$ из Exp 05–06 | Переименовать в `tangentPolarAngleDeg` (= `angleBetaDeg`) |
| `thetaCotHalfDeg`, `theta` (Exp 02) | Удвоенный параметр $\theta = 2\phi_{\text{Exp02}} = 2\beta$ из формулы $t = \cot(\theta/2)$ | `cotHalfParamThetaDeg = 2 * angleBetaDeg` | `arcBasedClassification.ts:26-27`, `arcGeometricValidation.ts:32`, `experiment02.arcBased.test.ts` | **Высокий:** ранее ошибочно отождествлялся с центральной дугой $r\theta$ вместо $r(\theta/2)$ | Зафиксировать как вспомогательный параметр половинного тангенса |
| `phiADeg`, `phiBDeg`, `phiCDeg` (Exp 05–06) | Центральные углы трёх секторов вписанной окружности: $180^\circ - A$, $180^\circ - B$, $90^\circ$ | $\varphi_A, \varphi_B, \varphi_C$ / `arcAngleADeg`, `arcAngleBDeg`, `arcAngleCDeg` | `incircleArcDistribution.ts:38-43`, `arcSideAreaCorrespondence.ts:123-125`, UI Exp 05–06, тесты 05–06 | Средний (коллизия буквы $\varphi$ с Exp 02 `phiDeg`) | Сохранить $\varphi_A, \varphi_B, \varphi_C$, в коде использовать `arcAngleADeg/BDeg/CDeg` |
| **Квадраты и четыре/пять окружностей** | | | | | |
| `squareA` ($Q_a$, Core) | Внешний квадрат на вертикальном катете $OA$ ($|OA| = \text{sideB}$) | $Q_b$ / `squareB` | `SquareConstruction.ts`, `FourCirclesModel.ts`, `FourCirclesValidators.ts`, `FourCirclesView.tsx` | **Высокий:** $Q_a$ стоит на стороне $b$, а не $a$ | В Canonical Stand $Q_a$ на $BC$ ($\text{sideA}$), $Q_b$ на $AC$ ($\text{sideB}$); в `legacyMapping.ts` явная перестановка |
| `squareB` ($Q_b$, Core) | Внешний квадрат на горизонтальном катете $OB$ ($|OB| = \text{sideA}$) | $Q_a$ / `squareA` | То же | **Высокий** | `legacy.squareB → canonical.squareA` |
| `squareC` ($Q_c$, Core) | Внешний квадрат на гипотенузе $AB$ ($c$) | $Q_c$ / `squareC` | То же | Низкий | Прямое соответствие |
| `circleA` ($K_a$, Core) | Окружность, вписанная в `squareA` (на $OA = \text{sideB}$, в II квадранте) | $K_b$ / `circleKb` | `FourCirclesModel.ts`, `FourCirclesSpectralAnalysis.ts`, `FourCirclesView.tsx`, `geometry.test.ts` | **Высокий:** `circleA` имеет диаметр `sideB`, хотя визуально находится у $OA$ | `legacy.circleA → canonical.circleKb` |
| `circleB` ($K_b$, Core) | Окружность, вписанная в `squareB` (на $OB = \text{sideA}$, в IV квадранте) | $K_a$ / `circleKa` | То же | **Высокий** | `legacy.circleB → canonical.circleKa` |
| `circleC` ($K_c$, Core) | Окружность в `squareC` (на гипотенузе $AB$, центр $(\frac{a+b}{2}, \frac{a+b}{2})$) | $K_c$ / `circleKc` | То же | Низкий | Прямое соответствие |
| `incircle` ($K_i$, Core) | Вписанная окружность треугольника (центр $I=(r,r)$) | $K_i$ / `incircleKi` | Все модули | Низкий (кроме имён точек касания) | `tangencyOA → tangencySideB`, `tangencyOB → tangencySideA`, `tangencyAB → tangencySideC` |
| `circumcircle` ($K_o$, Core/Thales) | Окружность Фалеса, описанная около $\triangle ABC$ | $K_o$ / `circumcircleKo` | `ThalesCircumcircle.ts`, `FourCirclesModel.ts`, `ThalesValidators.ts`, `geometry.test.ts` | Низкий (иногда путают $K_o$ и $K_c$ — равны по площади, разные центры) | Прямое соответствие |
| `Sa, Sb, Sc` (Thales / Passports `PCL-B07`) | Площади **внешних квадратов** ($a^2, b^2, c^2$) | `squareAreaB`, `squareAreaA`, `squareAreaC` | `ThalesCircumcircle.ts` (`ScaleTransformationResult.Sc`), `FORMULA_PASSPORTS.md`, `geometry.test.ts:652` | **Критический:** прямое столкновение с $S_a, S_b, S_c$ в Exp 06! | Заменить в каноническом коде на `squareAreaA/B/C` ($a^2, b^2, c^2$) |
| `areaA, areaB, areaC` / $S_a, S_b, S_c$ (Exp 06) | Площади **малых треугольников** $\triangle IOB, \triangle IOA, \triangle IAB$ | $S_A, S_B, S_C$ / `subtriangleAreaA`, `subtriangleAreaB`, `subtriangleAreaC` | `arcSideAreaCorrespondence.ts:151-153`, `ArcSideAreaPanel.tsx`, `experiment06.*.test.ts` | **Критический:** в `F-004` также использовано $S_{OA}, S_{OB}, S_{AB}$ | В Canonical Stand закрепить `subtriangleAreaA/B/C` ($S_A, S_B, S_C$) |
| `Pa, Pb, Pc, Pi` (Spectral) | Длины окружностей $K_a, K_b, K_c, K_i$ | $C_b, C_a, C_c, C_i$ / `circumferenceKb/Ka/Kc/Ki` | `FourCirclesSpectralAnalysis.ts`, `geometry.test.ts:279-282,312-315` | **Высокий:** `P` в Exp 01 — периметр треугольника, `p` в `F-003` — полупериметр | В каноническом коде использовать `circumferenceKa/Kb/Kc/Ki/Ko` |
| `Lo` (Thales) | Длина описанной окружности Фалеса $\pi c$ | $C_o$ / `circumferenceKo` | `ThalesCircumcircle.ts`, `FourCirclesSpectralAnalysis.ts`, `geometry.test.ts:475,563` | Средний ($L$ в Exp 02–05 — длина дуги $L_A, L_B, L_C$) | В каноническом коде `circumferenceKo` |
| `t` (`b / a` в Core/Exp 01–04) | Отношение горизонтального катета $|OB|$ к вертикальному $|OA|$ | $\rho = \tan\alpha = \text{sideA}/\text{sideB}$ (`shapeRatio`, `shapeRatioDefinition = 'sideA / sideB'`) | `FourCirclesSpectralAnalysis.ts`, `circleFirstClassification.ts`, `arcBasedClassification.ts`, `symmetryAnimation.ts` | **Высокий:** при переходе $a \leftrightarrow b$ запись `b/a` инвертируется в `sideA/sideB`! | В Canonical закреплено `shapeRatio` с обязательным полем `shapeRatioDefinition = 'sideA / sideB'` (алиас `ratioSideAToSideB`, обратная — `ratioSideBToSideA`); в Legacy `t` сохранён |
| `t_A`, `t_B`, `t_C` (Exp 06) | Длины отрезков касательных от вершин $A, B, C$ к $K_i$: $p-a, p-b, p-c=r$ | `tangentSegA`, `tangentSegB`, `tangentSegC` | `src/tests/experiment06.audit.test.ts:50-52`, `arcSideAreaCorrespondence.ts:146-148,266-268`, `EXPERIMENT_06_ARC_SIDE_AREA_CORRESPONDENCE.md:30,50` | **Высокий:** совпадение буквы `t` со спектральным параметром `t` и размерностный конфликт ($\lambda^1$ vs $\lambda^0$) | В Canonical строго `tangentSegA/B/C` (`incenterPartition.tangentSegA/B/C`); в Legacy `t_A/B/C` не трогаются |
| `psiADeg, psiBDeg, psiCDeg` (Exp 06) | Углы между отрезками биссектрис $IA, IB, IC$ ($\psi_X = 90^\circ + X/2$) | $\psi_A, \psi_B, \psi_C$ / `bisectorAngleADeg/BDeg/CDeg` | `arcSideAreaCorrespondence.ts:163-165`, `experiment06.*.test.ts` | Средний (путаница с центральными углами $\varphi_X$ при неверной гипотезе $135^\circ$ vs $90^\circ$) | Сохранить $\psi_X$ и переименовать в `bisectorAngleADeg/BDeg/CDeg` |
| `clampVal` (UI) | Ограничение катетов `[0.2, 15]` и округление до `1e-6` | UI constraint (`clampLegValue`) | `src/App.tsx:128-131`, `NUMERICAL_ANALYSIS.md:65` (ошибочно указано `10000`), `PCL-F24` (верно указано `1e-6`) | Документационная неточность | Зафиксировано в таблице расхождений; UI не трогается |

---

## 3. Проверка согласованности эпистемических статусов (`CLASS A–E`)

При переносе обозначений категорически запрещается путать:
1. **Математическую истинность** (вычислительно подтверждённое тождество);
2. **Литературную новизну** (много ли формул уже известны в классической евклидовой планиметрии: $c^2=a^2+b^2$, $S=pr$, $r=(a+b-c)/2$, теорема Фалеса, $\varphi_X = 180^\circ - X$, отрезки касательных $p-a$);
3. **Оригинальность представления** (`CLASS B`, например $\frac{S_A}{S} = \frac{\sin\varphi_A}{\sum\sin\varphi}$ и гиперболическое соотношение $\left(\tan\frac{\varphi_A}{2}-1\right)\left(\tan\frac{\varphi_B}{2}-1\right)=2$, являющееся переформулировкой классического тождества для прямоугольного треугольника);
4. **Оригинальность следствий (`CLASS C`) и открытых вопросов (`CLASS D`):**
   - Результаты `CLASS C` (например, $S_A^2 + S_B^2 = S_C^2$, $S_A + S_B - S_C = r^2$, невозможность одновременного равенства трёх дуг $120^\circ$ и трёх долей дуг и площадей) — строгие, но элементарные следствия классических теорем, а **не** «новые теоремы геометрии».
   - Корни совпадений долей `CLASS D` в Exp 06 (например $\alpha \approx 34.36^\circ$, где $w^{\text{arc}}_A = w^{\text{area}}_A$) приравнивают линейную функцию угла (зависящую от $\pi$ через $\varphi_A / 360^\circ$) к тригонометрическому отношению сторон ($\frac{\sin\alpha}{1+\sin\alpha+\cos\alpha}$) и требуют отдельного строгого корневого анализа в Stage 4 (вопрос трансцендентности, исключение ложных закрытых форм, точная классификация).
