# Canonical Semantic Contract — Geometry Reasoning Stand

**Статус:** Закреплённый семантический контракт этапа **TASK 3** (`Canonical Shadow Stand`)  
**Назначение:** Зафиксировать строгую трёхуровневую идентификацию геометрических объектов, канонический паспорт спектрального параметра `shapeRatio` и однозначное разведение обозначений до продолжения миграции `LT-04`–`LT-23`.  
**Правило изоляции:** Код, формулы и имена **Legacy Stand** (`src/math/*`, `src/types/geometry.ts`, `src/components/*`, `src/tests/*.test.ts`) не изменяются и не удаляются.

---

## 1. Архитектурный принцип Geometry Reasoning Stand (Три слоя модели)

В каноническом стенде (`src/canonical/`) жёстко разделяются три независимых слоя, которые ранее смешивались в Legacy-коде и статьях:

1. **Геометрический объект (Layer 1 — Geometric Entity):** математическая сущность в $\mathbb{R}^2$ (отрезок с координатами концов, квадрат с четырьмя вершинами и полуплоскостью, окружность с центром и радиусом, угол между лучами).
2. **Семантическая роль (Layer 2 — Semantic Role):** позиция и функция объекта в конструкции прямоугольного треугольника (например, *«окружность в квадрате на катете напротив вершины $A$»* или *«длина касательного отрезка из вершины $A$»*).
3. **Символьное/программное обозначение (Layer 3 — Identifier / Symbol):** имя в стандарте и коде (`circleKa`, `shapeRatio`, `tangentSegA`).

**Следствие (Постоянное правило семантического моста):**  
Геометрическая идентичность объекта при переходе `Legacy ↔ Canonical` выводится **исключительно из его геометрических координат и ролей (Layer 1 + Layer 2)**, а **не** из буквенного совпадения имени в Legacy.

---

## 2. Полное соответствие геометрических объектов (`Legacy ↔ Canonical`)

Ориентация треугольника зафиксирована в режиме `Vertex-Preserving`: $O = C = (0,0)$, $A = (0, \text{sideB})$, $B = (\text{sideA}, 0)$.

### 2.1. Все пять окружностей (`Ka`, `Kb`, `Kc`, `Ki`, `Ko`)

| Canonical ID | Legacy ID | Геометрический центр | Радиус | Связанная сторона треугольника | Противоположная вершина | Геометрическая роль (Layer 2) |
|---|---|---|---|---|---|---|
| `circleKa` ($K_a$) | `circleB` ($K_b^{\text{leg}}$) | $\left(\frac{\text{sideA}}{2},\, -\frac{\text{sideA}}{2}\right)$ (IV квадрант) | $\frac{\text{sideA}}{2}$ | `sideA` $= BC = [(0,0), (\text{sideA},0)]$ | $A$ ($\alpha$) | Окружность, вписанная во внешний квадрат $Q_a$ на катете `sideA` напротив $A$ |
| `circleKb` ($K_b$) | `circleA` ($K_a^{\text{leg}}$) | $\left(-\frac{\text{sideB}}{2},\, \frac{\text{sideB}}{2}\right)$ (II квадрант) | $\frac{\text{sideB}}{2}$ | `sideB` $= AC = [(0,0), (0,\text{sideB})]$ | $B$ ($\beta$) | Окружность, вписанная во внешний квадрат $Q_b$ на катете `sideB` напротив $B$ |
| `circleKc` ($K_c$) | `circleC` ($K_c$) | $\left(\frac{\text{sideA}+\text{sideB}}{2},\, \frac{\text{sideA}+\text{sideB}}{2}\right)$ (I квадрант) | $\frac{\text{sideC}}{2}$ | `sideC` $= AB = [(0,\text{sideB}), (\text{sideA},0)]$ | $C$ ($\gamma=90^\circ$) | Окружность, вписанная во внешний квадрат $Q_c$ на гипотенузе `sideC` напротив $C$ |
| `incircleKi` ($K_i$) | `incircle` ($K_i$) | $I = (r, r)$, где $r = \frac{\text{sideA}\cdot\text{sideB}}{\text{sideA}+\text{sideB}+\text{sideC}}$ | $r$ | Все три стороны (`sideA`, `sideB`, `sideC`) | — *(внутренняя для $\triangle ABC$)* | Вписанная окружность $\triangle ABC$, касающаяся всех трёх сторон в $T_a, T_b, T_c$ |
| `circumcircleKo` ($K_o$) | `circumcircle` ($K_o$) | $O_o = \left(\frac{\text{sideA}}{2},\, \frac{\text{sideB}}{2}\right)$ | $\frac{\text{sideC}}{2}$ | Концы гипотенузы `AB` (`sideC` — диаметр) | $C$ ($\gamma=90^\circ$) | Описанная окружность Фалеса $\triangle ABC$; равноудалена от $A, B, C$ и имеет $K_o = K_c$ |

### 2.2. Все три внешних квадрата (`Qa`, `Qb`, `Qc`)

| Canonical ID | Legacy ID | Геометрический центр | Длина стороны / Площадь | Связанная сторона | Противоположная вершина | Геометрическая роль (Layer 2) |
|---|---|---|---|---|---|---|
| `squareA` ($Q_a$) | `squareB` | $\left(\frac{\text{sideA}}{2},\, -\frac{\text{sideA}}{2}\right)$ (IV квадрант) | $\text{sideA}$ / $\text{sideA}^2$ | `sideA` $= BC$ | $A$ ($\alpha$) | Внешний квадрат на катете напротив вершины $A$ |
| `squareB` ($Q_b$) | `squareA` | $\left(-\frac{\text{sideB}}{2},\, \frac{\text{sideB}}{2}\right)$ (II квадрант) | $\text{sideB}$ / $\text{sideB}^2$ | `sideB` $= AC$ | $B$ ($\beta$) | Внешний квадрат на катете напротив вершины $B$ |
| `squareC` ($Q_c$) | `squareC` | $\left(\frac{\text{sideA}+\text{sideB}}{2},\, \frac{\text{sideA}+\text{sideB}}{2}\right)$ (I квадрант) | $\text{sideC}$ / $\text{sideC}^2$ | `sideC` $= AB$ | $C$ ($\gamma=90^\circ$) | Внешний квадрат на гипотенузе напротив прямого угла $C$ |

### 2.3. Стороны, вершины и зависимые геометрические объекты

| Canonical ID | Legacy ID | Математическое / координатное определение | Противоположная вершина / привязка | Геометрическая роль |
|---|---|---|---|---|
| `sideA` ($a$) | `triangle.b` (Core/Exp 01–05), `a` (Exp 06) | Отрезок $BC = [(0,0), (\text{sideA},0)]$ | Противолежит $A$ ($\alpha$) | Катет на $+Ox$ |
| `sideB` ($b$) | `triangle.a` (Core/Exp 01–05), `b` (Exp 06) | Отрезок $AC = [(0,0), (0,\text{sideB})]$ | Противолежит $B$ ($\beta$) | Катет на $+Oy$ |
| `sideC` ($c$) | `triangle.c` | Отрезок $AB = [(0,\text{sideB}), (\text{sideA},0)]$ | Противолежит $C$ ($\gamma=90^\circ$) | Гипотенуза |
| `tangencySideA` ($T_a$) | `incircle.tangencyOB` | $(r, 0)$ на стороне `sideA` ($BC$) | Напротив $A$ | Точка касания $K_i$ к $BC$ |
| `tangencySideB` ($T_b$) | `incircle.tangencyOA` | $(0, r)$ на стороне `sideB` ($AC$) | Напротив $B$ | Точка касания $K_i$ к $AC$ |
| `tangencySideC` ($T_c$) | `incircle.tangencyAB` | $\left(r(1+\frac{\text{sideB}}{\text{sideC}}),\, r(1+\frac{\text{sideA}}{\text{sideC}})\right)$ на `sideC` | Напротив $C$ | Точка касания $K_i$ к $AB$ |
| `subtriangleAreaA/B/C` ($S_A, S_B, S_C$) | `S_OB/S_OA/S_AB` (`F-004`), `areaA/B/C` (Exp 06) | $\frac{1}{2}\text{sideA}\cdot r,\; \frac{1}{2}\text{sideB}\cdot r,\; \frac{1}{2}\text{sideC}\cdot r$ | Основания `sideA, sideB, sideC` | Площади подтреугольников $\triangle IBC, \triangle IAC, \triangle IAB$ |
| `arcAngleADeg/BDeg/CDeg` ($\varphi_A, \varphi_B, \varphi_C$) | `phiADeg/BDeg/CDeg` (Exp 05–06) | $180^\circ-\alpha,\; 180^\circ-\beta,\; 90^\circ$ | При вершинах $A, B, C$ | Центральные углы секторов $K_i$ |
| `tangentSegA/B/C` | `t_A, t_B, t_C` (Exp 06) | $p-\text{sideA},\; p-\text{sideB},\; p-\text{sideC}=r$ | Отрезки из вершин $A, B, C$ | Длины отрезков касательных из $A, B, C$ к $K_i$ |

---

## 3. Канонический паспорт спектрального параметра (`shapeRatio`)

Концептуальное имя `shapeRatio` вводится как **новое имя существующей величины** (без создания новой математической сущности) и обязательно сопровождается полем `shapeRatioDefinition`. В Legacy сохраняется прежнее обозначение `t`.

| Поле паспорта | Закреплённый контракт |
|---|---|
| **Концептуальное имя (`canonicalName`)** | `shapeRatio` *(в коде также `shapeRatioDefinition = 'sideA / sideB'`)* |
| **Математический символ** | $\rho$ *(в Legacy: $t$)* |
| **Точная формула** | $\rho \equiv \text{shapeRatio} = \dfrac{\text{sideA}}{\text{sideB}} = \dfrac{|BC|}{|AC|} = \tan\alpha = \cot\beta \;\equiv\; \dfrac{b_{\text{leg}}}{a_{\text{leg}}} = \dfrac{|OB|}{|OA|} = t_{\text{legacy}}$ |
| **Числовой диапазон** | $\rho \in (0, +\infty)$ |
| **Размерность** | Безразмерная величина; однородна степени $0$ относительно масштаба $\lambda > 0$: $\text{shapeRatio}(\lambda a, \lambda b) = \text{shapeRatio}(a, b)$ |
| **Зависимость от сторон** | Прямо пропорциональна `sideA` ($a$), обратно пропорциональна `sideB` ($b$); при нормировке $\text{sideB} = 1$: $\text{sideA} = \rho$, $\alpha = \arctan\rho$, $\beta = \operatorname{arccot}\rho$ |
| **Поведение при перестановке катетов (`sideA ↔ sideB`)** | Инверсия $\rho \mapsto \rho' = \dfrac{1}{\rho}$ ($\ln\rho' = -\ln\rho$); ось симметрии $\rho = 1$ ($\alpha = \beta = 45^\circ$, `ratioSideBToSideA = 1 / shapeRatio`) |
| **Спектральные формулы (при `sideB = 1, sideA = rho`)** | $c^*(\rho) = \sqrt{\rho^2 + 1}$, $r^*(\rho) = \frac{\rho + 1 - \sqrt{\rho^2 + 1}}{2}$; $\frac{K_a}{K_c} = \frac{\rho^2}{1 + \rho^2}$ (= Legacy $\frac{K_b}{K_c}$), $\frac{K_b}{K_c} = \frac{1}{1 + \rho^2}$ (= Legacy $\frac{K_a}{K_c}$), $\frac{K_i}{K_c} = \frac{(\rho + 1 - \sqrt{\rho^2 + 1})^2}{1 + \rho^2}$; при $\rho \leftrightarrow 1/\rho$: $K_a(\rho) = K_b(1/\rho)$ |
| **Независимость от углов $\alpha, \beta, \gamma$** | $\alpha, \beta \in (0, \pi/2)$ рад $= (0^\circ, 90^\circ)$ ограничены, а $\rho = \tan\alpha \in (0, +\infty)$ не является мерой угла |

> **Замечание об инверсии формульной записи (`b/a` vs `sideA/sideB`):**  
> В Legacy Core (`FourCirclesSpectralAnalysis.ts:292`) написано `t = b / a`, потому что горизонтальный катет $|OB|$ там назван `b`, а вертикальный $|OA|$ — `a`. В каноническом стандарте $|OB| = \text{sideA}$ и $|OA| = \text{sideB}$, поэтому та же самая геометрическая величина $|OB| / |OA|$ записывается как **`sideA / sideB`**! Поле `shapeRatioDefinition: 'sideA / sideB'` исключает любую двусмысленность направления дроби.

---

## 4. Разведение спектрального параметра и длин касательных (`tangentSegA/B/C`)

Проверка кода Legacy показала, что в `src/tests/experiment06.audit.test.ts:49-57`, `src/math/experiments/arcSideAreaCorrespondence.ts:146-148,266-268` и `docs/experiments/EXPERIMENT_06_ARC_SIDE_AREA_CORRESPONDENCE.md:30,50` обозначения $t_A, t_B, t_C$ (в коде `tA, tB, tC`) строго обозначают **длины равных отрезков касательных**, проведённых из вершин $A, B, C$ к точкам касания вписанной окружности:

| Legacy символ (Exp 06) | Legacy код | Canonical ID | Формула в Canonical | Размерность / степень по $\lambda$ |
|---|---|---|---|---|
| $t_A$ | `tA` (`audit.test.ts`), `tangentSegA` (`arcSideAreaCorrespondence.ts`) | `tangentSegA` | $p - \text{sideA} = \text{sideB} - r = r\cot\frac{\alpha}{2} = r\tan\frac{\varphi_A}{2}$ | Линейная ($\propto \lambda^1$) |
| $t_B$ | `tB` (`audit.test.ts`), `tangentSegB` (`arcSideAreaCorrespondence.ts`) | `tangentSegB` | $p - \text{sideB} = \text{sideA} - r = r\cot\frac{\beta}{2} = r\tan\frac{\varphi_B}{2}$ | Линейная ($\propto \lambda^1$) |
| $t_C$ | `tC` (`audit.test.ts`), `tangentSegC` (`arcSideAreaCorrespondence.ts`) | `tangentSegC` | $p - \text{sideC} = r\cot 45^\circ = r$ | Линейная ($\propto \lambda^1$) |
| $t$ *(спектр Core/Exp 01–04)* | `t` | `shapeRatio` ($\rho$) | $\text{sideA} / \text{sideB} = \tan\alpha$ | Безразмерная ($\propto \lambda^0$) |

В каноническом слое запрещено использовать `t`, `t_A`, `t_B`, `t_C` для длин отрезков касательных — закреплены имена `tangentSegA`, `tangentSegB`, `tangentSegC`. В Legacy-файлах прежние символы сохранены без изменений.
