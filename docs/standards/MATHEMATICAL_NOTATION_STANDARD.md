# Mathematical Notation Standard — Pythagoras-Circles-Lab

**Статус:** Утверждённый стандарт Stage 3 / Canonical Shadow Stand (`v1.0-standard`)  
**Область действия:** Вся будущая разработка, канонический теневой стенд (`src/canonical/`), мигрированные канонические тесты (`src/tests/canonical/`) и аудит Stage 4.  
**Ограничение на Legacy Stand:** Документы стандарта **не** изменяют код Legacy Stand (`src/math/*`, `src/types/geometry.ts`, `src/components/*`, `src/tests/*.test.ts`); переход осуществляется исключительно через параллельный теневой стенд и семантическое отображение `LEGACY → CANONICAL`.

---

## 1. Базовая геометрия прямоугольного треугольника (Canonical Opposite-Side Convention)

Принят **стандартный евклидов профиль противоположных обозначений**: имя стороны (строчная буква) совпадает с именем противолежащей вершины (заглавная буква), а угол при вершине обозначается соответствующей греческой буквой:

| Элемент | Канонический символ | Математическое определение | Координатная реализация в $\mathbb{R}^2$ (vertex-preserving) |
|---|---|---|---|
| Вершина прямого угла | $C$ | $\angle ACB = 90^\circ$ | $C = (0, 0)$ |
| Вершина на $+Oy$ | $A$ | Острая вершина с углом $\alpha$ | $A = (0, b) = (0, \text{sideB})$ |
| Вершина на $+Ox$ | $B$ | Острая вершина с углом $\beta$ | $B = (a, 0) = (\text{sideA}, 0)$ |
| Угол при вершине $A$ | $\alpha = \angle A$ | $\alpha = \arctan(a / b) \in (0^\circ, 90^\circ)$ | Между $AC$ и $AB$ |
| Угол при вершине $B$ | $\beta = \angle B$ | $\beta = \arctan(b / a) = 90^\circ - \alpha \in (0^\circ, 90^\circ)$ | Между $BC$ и $BA$ |
| Прямой угол при $C$ | $\gamma = \angle C$ | $\gamma \equiv 90^\circ$ ($\pi/2$ рад) | Между $+Ox$ и $+Oy$ |
| Катет напротив $A$ | $a = |BC|$ | $a = c\sin\alpha = c\cos\beta$ | Горизонтальный катет на $+Ox$ (`legOB`) |
| Катет напротив $B$ | $b = |AC|$ | $b = c\sin\beta = c\cos\alpha$ | Вертикальный катет на $+Oy$ (`legOA`) |
| Гипотенуза напротив $C$ | $c = |AB|$ | $c = \sqrt{a^2 + b^2}$ ($c^2 = a^2 + b^2$) | Отрезок $AB$ |
| Площадь треугольника | $S$ | $S = \frac{1}{2}ab = pr$ | $\text{Area}(\triangle ABC)$ |
| Полупериметр | $p$ | $p = \frac{a + b + c}{2}$ | Линейный полупериметр |
| Периметр | $P$ | $P = a + b + c = 2p$ | Полный периметр (не путать с $P_a, P_b$!) |
| Центр вписанной окружности | $I$ | Пересечение биссектрис | $I = (r, r)$ |
| Радиус вписанной окружности | $r$ | $r = \frac{ab}{a+b+c} = \frac{a+b-c}{2}$ | Расстояние от $I$ до всех трёх сторон |

> **Правило монотонного соответствия (проверка непротиворечивости):**
> В каноническом стандарте **всегда** выполняется эквивалентность:
> $$\alpha > \beta \iff a > b$$
> Больший катет $a$ всегда лежит напротив большего острого угла $\alpha = \angle A$.

---

## 2. Вписанная окружность, дуги и разбиение площади

### 2.1. Точки касания вписанной окружности $K_i$

| Объект | Канонический символ | Координаты в канонической системе | Сторона касания |
|---|---|---|---|
| Точка касания на стороне $a = BC$ | $T_a$ | $(r, 0)$ | Катет $BC$ (напротив $A$) |
| Точка касания на стороне $b = AC$ | $T_b$ | $(0, r)$ | Катет $AC$ (напротив $B$) |
| Точка касания на гипотенузе $c = AB$ | $T_c$ | $\left(r\left(1 + \sin\beta\right),\, r\left(1 + \cos\beta\right)\right)$ | Гипотенуза $AB$ (напротив $C$) |

*Проверка $T_c$:* прямая $AB$ соединяет $A=(0,b)$ и $B=(a,0)$: уравнение $\frac{x}{a} + \frac{y}{b} = 1 \iff bx + ay = ab$. Внешняя единичная нормаль к $AB$ (учитывая $\sin\alpha = a/c$, $\cos\alpha = b/c$) равна $\mathbf{n} = \left(\frac{b}{c}, \frac{a}{c}\right) = (\cos\alpha, \sin\alpha) = (\sin\beta, \cos\beta)$.  
Тогда $T_c = I + r\mathbf{n} = \left(r\left(1 + \frac{b}{c}\right),\, r\left(1 + \frac{a}{c}\right)\right) = (r(1+\cos\alpha),\, r(1+\sin\alpha)) = (r(1+\sin\beta),\, r(1+\cos\beta))$.  
Скалярное произведение $b\cdot T_{c,x} + a\cdot T_{c,y} = b r (1 + b/c) + a r (1 + a/c) = r(a+b+c) = \frac{ab}{a+b+c}(a+b+c) = ab$, что строго подтверждает инцидентность $T_c \in AB$.

### 2.2. Сектора и дуги вписанной окружности ($\varphi_A, \varphi_B, \varphi_C$ и $L_A, L_B, L_C$)

Каждая дуга $\varphi_X$ соответствует **вершине $X \in \{A, B, C\}$** (между двумя касательными, выходящими из $X$, и противолежащая дуге на стороне $x$):

| Вершина | Дуга (между радиусами) | Центральный угол | В терминах $(\alpha, \beta)$ | Длина дуги | Доля окружности |
|---|---|---|---|---|---|
| $A$ | Между $IT_b$ и $IT_c$ | $\varphi_A = 180^\circ - \alpha$ | $90^\circ + \beta$ | $L_A = r\varphi_A^{\text{рад}}$ | $w^{\text{arc}}_A = \frac{\varphi_A}{360^\circ}$ |
| $B$ | Между $IT_a$ и $IT_c$ | $\varphi_B = 180^\circ - \beta$ | $90^\circ + \alpha$ | $L_B = r\varphi_B^{\text{рад}}$ | $w^{\text{arc}}_B = \frac{\varphi_B}{360^\circ}$ |
| $C$ | Между $IT_a$ и $IT_b$ | $\varphi_C = 180^\circ - \gamma$ | $90^\circ$ (const) | $L_C = \frac{\pi r}{2}$ | $w^{\text{arc}}_C \equiv \frac{1}{4}$ |

Инварианты:
$$\varphi_A + \varphi_B + \varphi_C = 360^\circ, \qquad L_A + L_B + L_C = 2\pi r = C_i.$$

### 2.3. Малые треугольники разбиения ($S_A, S_B, S_C$)

| Треугольник | Основание (сторона) | Канонический символ | Формула площади | Доля площади |
|---|---|---|---|---|
| $\triangle IBC$ | $a = |BC|$ (напротив $A$) | $S_A$ | $S_A = \frac{1}{2}ar$ | $w^{\text{area}}_A = \frac{S_A}{S} = \frac{a}{a+b+c}$ |
| $\triangle IAC$ | $b = |AC|$ (напротив $B$) | $S_B$ | $S_B = \frac{1}{2}br$ | $w^{\text{area}}_B = \frac{S_B}{S} = \frac{b}{a+b+c}$ |
| $\triangle IAB$ | $c = |AB|$ (напротив $C$) | $S_C$ | $S_C = \frac{1}{2}cr$ | $w^{\text{area}}_C = \frac{S_C}{S} = \frac{c}{a+b+c}$ |

> **Запрет коллизии с площадями квадратов:**
> Символы $S_A, S_B, S_C$ (с верхним регистром или как `subtriangleAreaA/B/C`) закреплены **только** за площадями малых треугольников $\triangle IBC, \triangle IAC, \triangle IAB$.
> Площади внешних квадратов обозначаются через $\text{Area}(Q_a) = a^2$, $\text{Area}(Q_b) = b^2$, $\text{Area}(Q_c) = c^2$ (в коде: `squareAreaA`, `squareAreaB`, `squareAreaC`), а **не** $S_a, S_b, S_c$!

---

## 3. Пять окружностей и три внешних квадрата

| Объект | Канонический символ | Геометрическая привязка | Диаметр / Радиус | Площадь | Длина окружности |
|---|---|---|---|---|---|
| Внешний квадрат на $BC$ ($a$) | $Q_a$ | Внешняя полуплоскость к $BC$ (IV квадрант) | сторона $a$ | $a^2$ | периметр $4a$ |
| Внешний квадрат на $AC$ ($b$) | $Q_b$ | Внешняя полуплоскость к $AC$ (II квадрант) | сторона $b$ | $b^2$ | периметр $4b$ |
| Внешний квадрат на $AB$ ($c$) | $Q_c$ | Внешняя полуплоскость к $AB$ (I квадрант) | сторона $c$ | $c^2$ | периметр $4c$ |
| Окружность в $Q_a$ | $K_a$ | Центр $(\frac{a}{2}, -\frac{a}{2})$ | $d_a = a$, $R_a = \frac{a}{2}$ | $K_a = \frac{\pi a^2}{4}$ | $C_a = \pi a$ |
| Окружность в $Q_b$ | $K_b$ | Центр $(-\frac{b}{2}, \frac{b}{2})$ | $d_b = b$, $R_b = \frac{b}{2}$ | $K_b = \frac{\pi b^2}{4}$ | $C_b = \pi b$ |
| Окружность в $Q_c$ | $K_c$ | Центр $(\frac{a+b}{2}, \frac{a+b}{2})$ | $d_c = c$, $R_c = \frac{c}{2}$ | $K_c = \frac{\pi c^2}{4}$ | $C_c = \pi c$ |
| Вписанная окружность | $K_i$ | Центр $I = (r, r)$ | $d_i = 2r$, $R_i = r$ | $K_i = \pi r^2$ | $C_i = 2\pi r$ |
| Описанная окружность Фалеса | $K_o$ | Центр $O_o = (\frac{a}{2}, \frac{b}{2})$ | $d_o = c$, $R_o = \frac{c}{2}$ | $K_o = \frac{\pi c^2}{4}$ | $C_o = \pi c$ |

### 3.1. Запрет повторного использования букв (Disambiguation Rules)

1. **$P$ vs $p$ vs $C_x$:**
   - $p$ — только полупериметр треугольника;
   - $P$ — только периметр треугольника;
   - длины пяти окружностей обозначаются $C_a, C_b, C_c, C_i, C_o$ (или `circumferenceKa/Kb/Kc/Ki/Ko`), **не** $P_a, P_b, P_c, P_i$ и **не** $L_o$ (чтобы не конфликтовать с длинами дуг $L_A, L_B, L_C$).
2. **Параметр угла дуги vs угол треугольника:**
   - $\alpha$ — **всегда** острый угол при вершине $A$ ($\angle A$), $\beta$ — **всегда** острый угол при вершине $B$ ($\angle B$);
   - параметр положения точки касания $T_c$ вдоль четверти окружности от $(0, r)$ к $(r, 0)$ (или от $N=(r,2r)$ к $E=(2r,r)$):
     - в точках на окружности $(r, 2r) \to (2r, r)$ вектор нормали равен $(\sin\beta, \cos\beta)$;
     - поэтому полярный угол от «севера» $N=(r,2r)$ по часовой стрелке равен **$\beta$** (углу при $B$), а **не** $\alpha$! Использование буквы $\alpha$ для угла от $(r,2r)$ в Экспериментах 03–06 является **известной коллизией Legacy** (см. `NOTATION_MIGRATION_MAP.md`).
   - В каноническом стандарте:
     - угол при $A$ всегда обозначается `angleAlpha` ($\alpha$);
     - угол при $B$ всегда обозначается `angleBeta` ($\beta$);
     - в Exp 02 угол половинной формулы $\theta = 2\beta$ (`thetaHalfAngleDeg`) не должен смешиваться с физическим углом касания $\beta$.

---

## 4. Стандарт программных идентификаторов TypeScript

### 4.1. Обязательные канонические имена полей (`src/canonical/`)

| Категория | Канонические идентификаторы | Запрещённые неоднозначные имена в каноническом коде |
|---|---|---|
| Стороны треугольника | `sideA`, `sideB`, `sideC` | голые `a, b` без уточнения (кроме локальных матем. вспомогательных переменных, если однозначны) |
| Координатные алиасы | `legOB` (`= sideA`, по $+Ox$), `legOA` (`= sideB`, по $+Oy$) | — (допустимы **только** вместе с явным маппингом на `sideA`/`sideB`) |
| Углы треугольника | `angleAlpha`, `angleBeta`, `angleGamma` (с суффиксом `Deg` / `Rad`) | смешение `alphaDeg = angleB` |
| Метрики треугольника | `triangleArea`, `perimeter`, `semiperimeter`, `inradius`, `circumradius` | `P` для периметра окружности, `S` без контекста при наличии квадратов |
| Дуги вписанной окружности | `arcAngleADeg`, `arcAngleBDeg`, `arcAngleCDeg` (`arcAngleA`..`C`), `arcLengthA`, `arcLengthB`, `arcLengthC`, `arcShareA`, `arcShareB`, `arcShareC` | `phiDeg` для угла точки касания из Exp 02 (в Exp 05–06 `phiADeg` означает $180^\circ - \alpha$) |
| Площади подтреугольников | `subtriangleAreaA`, `subtriangleAreaB`, `subtriangleAreaC`, `areaShareA`, `areaShareB`, `areaShareC` | `Sa`, `Sb`, `Sc` |
| Внешние квадраты | `squareA` ($Q_a$ на $BC$), `squareB` ($Q_b$ на $AC$), `squareC` ($Q_c$ на $AB$), `squareAreaA`, `squareAreaB`, `squareAreaC` | `Sa`, `Sb`, `Sc` для площадей квадратов |
| Пять окружностей | `circleKa`, `circleKb`, `circleKc`, `incircleKi`, `circumcircleKo` (площади `areaKa`..`areaKo`, радиусы `radiusKa`..`radiusKo`, длины `circumferenceKa`..`circumferenceKo`) | `Pa, Pb, Pc, Pi, Lo` |
| Точки касания | `tangencySideA` ($T_a$ на $BC$), `tangencySideB` ($T_b$ на $AC$), `tangencySideC` ($T_c$ на $AB$) | `tangencyOA` / `tangencyOB` без явной ссылки на `sideB` / `sideA` |
| Спектральный параметр формы | `shapeRatio` ($\rho = \text{sideA}/\text{sideB} = \tan\alpha$), `shapeRatioDefinition = 'sideA / sideB'` (алиас `ratioSideAToSideB`) | голый `t` без направления дроби; $\alpha$ или $\varphi$ |
| Отрезки касательных из вершин | `tangentSegA` ($p-a$), `tangentSegB` ($p-b$), `tangentSegC` ($p-c=r$) | `t_A`, `t_B`, `t_C` (конфликт со спектральным `t`) |

### 4.2. Два возможных отображения координатной ориентации (Требуется явная фиксация)

При сопоставлении Legacy Core (`O=(0,0), A=(0, legacy.a), B=(legacy.b, 0)`) с каноническим треугольником существуют два математически корректных способа согласования:

1. **Режим 1 (принят в Canonical Shadow Stand — Vertex-Preserving `Legacy (O,A,B) → Canonical (C,A,B)`):**
   - Геометрические точки на плоскости $\mathbb{R}^2$ сохраняются на своих местах: $C = O = (0,0)$, $A = (0, \text{sideB})$, $B = (\text{sideA}, 0)$.
   - Углы сохраняются тождественно: `canonical.angleAlphaDeg === legacy.triangle.alphaDeg`, `canonical.angleBetaDeg === legacy.triangle.betaDeg`.
   - Зато катеты, внешние квадраты на катетах и соответствующие им окружности меняются индексами на противоположные:
     - `canonical.sideA` ($|BC|$) $= \text{legacy.triangle.b}$ ($|OB|$)
     - `canonical.sideB` ($|AC|$) $= \text{legacy.triangle.a}$ ($|OA|$)
     - `canonical.squareA` / `circleKa` $= \text{legacy.squareB}$ / `circleB`
     - `canonical.squareB` / `circleKb` $= \text{legacy.squareA}$ / `circleA`
   - *Плюс:* полностью совпадает с координатным мостом `Experiment 06` (`arcSideAreaCorrespondence.ts:251-258`) и не переворачивает чертёж на экране.

2. **Режим 2 (альтернативный — Leg-Name-Preserving / Mirror `Legacy (O,A,B) → Canonical (C,B,A)`):**
   - Сохраняет значения `sideA = legacy.a`, `sideB = legacy.b`, но отражает чертёж относительно биссектрисы $y=x$ (или меняет местами вершины $A \leftrightarrow B$ и углы $\alpha \leftrightarrow \beta$).
   - *Минус:* ломает инвариантность подписей вершин $A, B$ и углов $\alpha, \beta$ на уже существующем чертеже Core UI.

> **Решение в Shadow Stand:** принят **Режим 1 (`Vertex-Preserving`)**, так как он согласован с `Experiment 06` и сохраняет положения вершин $A, B$ и углов $\alpha, \beta$. Оба варианта зафиксированы в `legacyMapping.ts` и отмечены как точка ручного подтверждения архитектуры перед будущей миграцией UI.

---

## 5. Сводка несогласованностей документации и метаданных (Stage 3 Audit Check)

Во время аудита документации проекта выявлены следующие расхождения в метаданных (без изменения файлов Legacy Docs до отдельного решения):

| № | Файл и строка | Заявлено в документе | Фактическое состояние в коде / файлах | Статус / Требует решения |
|---|---|---|---|---|
| 1 | `docs/FORMULA_PASSPORTS.md:3,8` | «29 passports (`PCL-A01`–`PCL-G29`)» | В файле описаны **30** паспортов: последний паспорт — `PCL-G30` (строки 557–575). | Требует ручной правки шапки в будущем обновлении docs |
| 2 | `docs/VERIFICATION_MATRIX.md:3,7` | Перечень `PCL-A01`–`PCL-G29`; «Sections 1–9» | Не включён `PCL-G30`; в `src/tests/geometry.test.ts` **10 секций** (Section 10 проверяет $\lambda$-масштабирование и `PCL-G30`). | Требует синхронизации таблицы верификации |
| 3 | `docs/FORMULA_DEPENDENCY_GRAPH.md:3` | «24 UMFP formula passports (`PCL-A01` – `PCL-F24`)» | Не учтена вся группа G (`PCL-G25` – `PCL-G30`: Thales $K_o$ и $\lambda$-масштабирование). | Требует расширения графа зависимостей |
| 4 | `docs/NUMERICAL_ANALYSIS.md:63-67` vs `docs/FORMULA_PASSPORTS.md:465` (`PCL-F24`) | `NUMERICAL_ANALYSIS.md` утверждает, что `clampVal` в `App.tsx` округляет до 4 знаков (`10000`) | В реальном `src/App.tsx:130` используется `Math.round(val * 1e6) / 1e6` (6 знаков после запятой), что подтверждает `PCL-F24`. | Документ `NUMERICAL_ANALYSIS.md` устарел относительно кода |
| 5 | `src/math/FourCirclesSpectralAnalysis.ts` vs `src/canonical/` | Коллизия параметра формы `t` и `t_A/B/C` | Закреплено в [`CANONICAL_SEMANTIC_CONTRACT.md`](CANONICAL_SEMANTIC_CONTRACT.md): в Canonical принято имя `shapeRatio` ($\rho = \text{sideA}/\text{sideB} = \tan\alpha === t_{\text{legacy}}$) с полем `shapeRatioDefinition = 'sideA / sideB'`, а `t_A/B/C` заменены на `tangentSegA/B/C`. Legacy `t` сохранён без изменений. | **Закреплено в Task 3** (`src/canonical/semanticContract.ts`) |
| 6 | Классификация новизны `CLASS A–E` | Риск смешения новизны формулы и новизны записи | `CLASS C` (следствия в Exp 05–06) математически истинны, но не являются «новыми теоремами геометрии», а `CLASS D` (отсутствие точной линейной пропорции в Exp 06) требует строгого корневого аудита в Stage 4 (проверить тригонометрическую/алгебраическую сущность численных корней $34.36^\circ$ и др., где возможно вовлечение $\pi$). | Зафиксировано; ждёт перехода к Stage 4 |
