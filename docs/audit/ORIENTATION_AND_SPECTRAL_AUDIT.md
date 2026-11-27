# Audit: Geometric Orientation (`Legacy → Canonical`) & Spectral Parameter (`t`)

**Дата:** 2026-11-26  
**Статус:** Контрольный аудит этапа **TASK 2** (до миграции `LT-04`–`LT-23`).

---

## 1. Аудит ориентации геометрической модели: `Legacy (O, A, B) → Canonical (C, A, B)`

Ниже приведена проверка всех семи геометрических критериев строго по формулам и координатам из `src/math/*` и `src/canonical/*`, без опоры на названия идентификаторов.

| № | Проверяемый критерий | Legacy Stand (`src/math/*`) | Canonical Shadow Stand (`src/canonical/*`) | Результат аудита |
|---|---|---|---|---|
| 1 | **Координаты всех вершин** | `RightTriangle.ts:50-52`: $O=(0,0)$, $A=(0, a_{\text{leg}})$, $B=(b_{\text{leg}}, 0)$. | `canonicalFourCircles.ts:59-61`: $C=(0,0)$, $A=(0, \text{sideB})$, $B=(\text{sideA}, 0)$. | **Совпадают тождественно** в $\mathbb{R}^2$ при $a_{\text{leg}} = \text{sideB}$, $b_{\text{leg}} = \text{sideA}$ (`dist = 0`). |
| 2 | **Геометрические углы** | `RightTriangle.ts:22-27`: $\alpha = \text{atan2}(b_{\text{leg}}, a_{\text{leg}})$ при вершине $A$, $\beta = \text{atan2}(a_{\text{leg}}, b_{\text{leg}})$ при вершине $B$, прямой угол при $O$. | `canonicalFourCircles.ts:45-48`: $\alpha = \text{atan2}(\text{sideA}, \text{sideB})$ при $A$, $\beta = \text{atan2}(\text{sideB}, \text{sideA})$ при $B$, $\gamma = 90^\circ$ при $C$. | **Совпадают тождественно** при тех же вершинах $A$ и $B$. |
| 3 | **Определение сторон $a, b, c$** | В Legacy `a = |OA|` (по $+Oy$), `b = |OB|` (по $+Ox$), `c = |AB|`. | В Canonical `sideA = |BC|` (по $+Ox$), `sideB = |AC|` (по $+Oy$), `sideC = |AB|`. | На числовой плоскости длины $|OB|, |OA|, |AB|$ сохранены; смена имён `a↔b` устраняет противоречие Legacy. |
| 4 | **Соответствие «сторона ↔ противоположная вершина»** | В Legacy **нарушено**: сторона $a = OA$ смежна с вершиной $A$ и противолежит вершине $B$; сторона $b = OB$ противолежит $A$. | В Canonical **восстановлено**: `sideA` ($BC$) противолежит $A$ ($\alpha$); `sideB` ($AC$) противолежит $B$ ($\beta$); `sideC` ($AB$) противолежит $C$ ($90^\circ$). | Выполняется правило $a > b \iff \alpha > \beta$ и $a/\sin\alpha = b/\sin\beta = c$ без перестановки индексов. |
| 5 | **Геометрические роли окружностей (`circleA/B/C/Ki/Ko`)** | Проверено ниже по координатам и точкам касания. | Проверено ниже по координатам и точкам касания. | Роль «окружность напротив вершины» **восстановлена** при точном сохранении геометрии кругов в $\mathbb{R}^2$. |
| 6 | **Сопоставление внешних квадратов ($Q_a, Q_b, Q_c$)** | `SquareConstruction.ts:16-64`. | `canonicalFourCircles.ts:147-197`. | Вершины, центры и площади квадратов совпадают с погрешностью `0`. |
| 7 | **Отсутствие искажения физического/математического смысла** | Центральное тождество $\sqrt{K_a}+\sqrt{K_b}=\sqrt{K_c}+\sqrt{K_i}$ инвариантно к перестановке катетов. | То же тождество; вдобавок все производные законы Exp 06 (теорема синусов, $S_A, S_B, S_C$, $\varphi_A, \varphi_B, \varphi_C$) получают единую индексацию. | **Никакого искажения смысла нет** — устранена историческая инверсия индексов катетов Core. |

### 1.1. Геометрическое доказательство правила `legacy.circleA → canonical.circleKb` и `legacy.circleB → canonical.circleKa`

Доказывается **исключительно через координаты и геометрические связи**, без опоры на буквенные названия:

1. Рассмотрим отрезок $AC = [(0,0), (0, y_A)]$ на оси $+Oy$, который **лежит напротив вершины $B$** (угол $\beta$).
   - В Legacy (`SquareConstruction.ts:16-28`, `FourCirclesModel.ts:39-55`) на этом отрезке (названном в Legacy `OA`) во II квадранте строится квадрат с вершинами $(0,0), (0, y_A), (-y_A, y_A), (-y_A, 0)$, вписанный круг имеет центр $(-y_A/2, y_A/2)$, радиус $y_A/2$, площадь $\pi y_A^2/4$ и точку касания $(0, y_A/2)$ на отрезке $AC$. Этот объект в Legacy помечен как `squareA` / `circleA`.
   - По каноническому определению, сторона, лежащая напротив вершины $B$, есть $b = |AC|$, а внешний квадрат и вписанная в него окружность на стороне $b$ носят геометрическую роль **$Q_b$ и $K_b$** (`squareB` / `circleKb`). В `canonicalFourCircles.ts` квадрат `squareB` имеет ровно те же вершины $(0,0), (0, y_A), (-y_A, y_A), (-y_A, 0)$, а круг `circleKb` — ровно тот же центр $(-y_A/2, y_A/2)$, радиус $y_A/2$ и точки касания.
2. Аналогично рассмотрим отрезок $BC = [(0,0), (x_B, 0)]$ на оси $+Ox$, который **лежит напротив вершины $A$** (угол $\alpha$).
   - В Legacy (`SquareConstruction.ts:35-47`, `FourCirclesModel.ts:58-74`) на этом отрезке (названном в Legacy `OB`) в IV квадранте строится квадрат с вершинами $(0,0), (x_B, 0), (x_B, -x_B), (0, -x_B)$ и круг с центром $(x_B/2, -x_B/2)$, радиусом $x_B/2$, точкой касания $(x_B/2, 0)$ на отрезке $BC$. В Legacy этот объект помечен как `squareB` / `circleB`.
   - По каноническому определению, сторона напротив $A$ есть $a = |BC|$, поэтому квадрат и окружность на ней несут роль **$Q_a$ и $K_a$** (`squareA` / `circleKa`).
3. Для гипотенузы $AB$, вписанной окружности $K_i$ и окружности Фалеса $K_o$ объекты тождественны как множества точек без перестановки индексов (`squareC ↔ squareC`, `circleC ↔ circleKc`, `incircle ↔ incircleKi`, `circumcircle ↔ circumcircleKo`), при этом точки касания $K_i$ на катетах переходят по тем же геометрическим сторонам: `tangencyOA (на AC) → tangencySideB`, `tangencyOB (на BC) → tangencySideA`.

**Вердикт по ориентации:** Соответствие `Legacy (O, A, B) → Canonical (C, A, B)` с правилом `legacy.squareA/circleA → canonical.squareB/circleKb` и `legacy.squareB/circleB → canonical.squareA/circleKa` **математически подтверждено и утверждено как официальное правило миграции.**

---

## 2. Исследование математического смысла спектрального параметра (`t`)

> **Статус кода:** В соответствии с ограничением Task 2 код и имя спектрального параметра `t` **не изменялись**. Ниже представлены результаты анализа и предложение к согласованию.

### 2.1. Ответы на вопросы анализа

1. **Что характеризует параметр `t`?**
   - В `FourCirclesSpectralAnalysis.ts:292-301`, `symmetryAnimation.ts:20` и `circleFirstClassification.ts:95` параметр определяется как:
     $$t = \frac{b_{\text{leg}}}{a_{\text{leg}}} = \frac{|OB|}{|OA|} \in (0, +\infty).$$
   - В канонических координатах (при `Legacy (O, A, B) → Canonical (C, A, B)`) это равно:
     $$t = \frac{|CB|}{|CA|} = \frac{\text{sideA}}{\text{sideB}} = \frac{a}{b} = \tan\alpha = \cot\beta.$$
   - Он характеризует **класс подобия прямоугольного треугольника** (безразмерное отношение катетов, инвариантное относительно масштабного преобразования $\lambda > 0$). Ось $t = 1$ задаёт равнобедренный случай ($a = b$, $\alpha = \beta = 45^\circ$), а инволюция $t \leftrightarrow 1/t$ эквивалентна симметричному обмену катетов ($\ln t \mapsto -\ln t$).

2. **Является ли он углом, коэффициентом или независимым параметром?**
   - Это **НЕ угол** (безразмерная положительная величина на $(0, +\infty)$, а не мера угла в радианах/градусах).
   - Это **независимая координата формы** в двухпараметрической декомпозиции треугольника $(t, \lambda)$, где $t \in (0, +\infty)$ задаёт форму (однородность степени $0$ по $\lambda$), а $\lambda > 0$ задаёт масштаб (однородность степеней $1$ и $2$).
   - Благодаря алгебраической природе $t$ (без тригонометрии) нормированные отношения площадей окружностей выражаются рациональными/алгебраическими функциями $t$.

3. **Какие формулы от него зависят?**
   - Нормированная модель при $a_{\text{leg}} = 1, b_{\text{leg}} = t$ (`evaluateParametricFourCircles(t)`):
     - $c^*(t) = \sqrt{1+t^2}$, $r^*(t) = \frac{1+t-\sqrt{1+t^2}}{2}$.
     - Доли площадей (в терминах Legacy $K_a^{\text{leg}}, K_b^{\text{leg}}$): $\frac{K_a^{\text{leg}}}{K_c} = \frac{1}{1+t^2}$, $\frac{K_b^{\text{leg}}}{K_c} = \frac{t^2}{1+t^2}$, $\frac{K_i}{K_c} = \frac{(1+t-\sqrt{1+t^2})^2}{1+t^2}$ (глобальный максимум $3 - 2\sqrt{2}$ при $t=1$).
     - Отношения радиусов/периметров/диаметров: $\frac{1}{\sqrt{1+t^2}}$, $\frac{t}{\sqrt{1+t^2}}$, $\frac{1+t-\sqrt{1+t^2}}{\sqrt{1+t^2}}$.
     - Абсолютные кривые Фалеса при $a_{\text{leg}}=1$: $R_o^*(t) = \frac{\sqrt{1+t^2}}{2}$, $K_o^*(t) = \frac{\pi(1+t^2)}{4}$.
     - Логарифмическая траектория симметрии (`symmetryAnimation.ts`): $u = \ln t$, переход $u_{\text{start}} \to 0 \to -u_{\text{start}} \to u_{\text{start}}$.
     - Классификация Exp 01 (`circleFirstClassification.ts`): $\Psi(r, t) \to (a_{\text{leg}}, b_{\text{leg}}, c)$, и Exp 02 (`arcBasedClassification.ts`): $t = \cot\beta = \cot(\theta/2)$.

4. **Где он используется?**
   - `FourCirclesSpectralAnalysis.ts` (`evaluateParametricFourCircles`, `sampleSpectralCurves`, `sampleThalesAbsoluteCurves`, `legsFromRatioAndHypotenuse`)
   - `symmetryAnimation.ts` (`isAtSymmetryAxis`, `evaluateSymmetryTrajectoryT`)
   - `circleFirstClassification.ts` (`tInput`, `shapeIndex`, `dualShapeIndex`)
   - `arcBasedClassification.ts` (`t = cot(phi)`)
   - `SpectralAnalysisPanel.tsx`, `ControlsPanel.tsx`, `App.tsx` (`handleChangeT`)
   - Тесты: `geometry.test.ts` (Sections 7, 8, 9e, 10d) и `experiment01`–`04`.

5. **Пересекается ли его смысл с углами $\alpha, \beta, \gamma$ или другими символами?**
   - С углами $\alpha, \beta, \gamma, \varphi$ по смыслу не пересекается (это тангенс угла $\tan\alpha = a/b$, а не сам угол $\alpha$), хотя находится с $\alpha$ в биективном соответствии $t = \tan\alpha$.
   - **Обнаружены два скрытых конфликта при миграции:**
     1. **Конфликт буквы $t$ в Exp 06:** в `experiment06.audit.test.ts:50-52` и ряде описаний Exp 06 буквами $t_A, t_B, t_C$ обозначены **длины отрезков касательных** ($p-a, p-b, p-c$).
     2. **Конфликт порядка дроби $b/a$ vs $a/b$:** в Legacy формула спектра записана как $t = b/a$ (потому что $b = |OB|$ горизонтальный, $a = |OA|$ вертикальный). В канонике $|OB| = \text{sideA}$, $|OA| = \text{sideB}$, то есть **та же самая геометрическая дробь $\frac{|OB|}{|OA|}$ равна $\text{sideA} / \text{sideB} = \tan\alpha$**, а не $\text{sideB}/\text{sideA}$! Слепой перенос записи `t = b/a` перевернул бы кривые $K_a/K_c$ и $K_b/K_c$ вверх ногами.

### 2.2. Закреплённое каноническое решение (Контракт Task 3)

Решения аудита закреплены в [`CANONICAL_SEMANTIC_CONTRACT.md`](../standards/CANONICAL_SEMANTIC_CONTRACT.md) и `src/canonical/semanticContract.ts` (без изменения Legacy-кода):

- **Не** использовать $\alpha$ или $\varphi$ для спектрального параметра (они закреплены за углом при $A$ и центральными углами секторов вписанной окружности).
- В Canonical Shadow Stand принято концептуальное имя **`shapeRatio`** (математически $\rho$) вместе с обязательным полем определения **`shapeRatioDefinition = 'sideA / sideB'`** ($\rho = \text{sideA}/\text{sideB} = |BC|/|AC| = \tan\alpha = t_{\text{legacy}}$); сохранены также явные направленные поля `ratioSideAToSideB` ($=\rho$) и `ratioSideBToSideA` ($=1/\rho$).
- В Legacy Stand прежнее обозначение **`t`** сохраняется без изменений.
- Отрезки касательных `t_A, t_B, t_C` из Exp 06 в Canonical Stand закреплены исключительно под именами **`tangentSegA`**, **`tangentSegB`**, **`tangentSegC`** (`incenterPartition.tangentSegA/B/C`).

