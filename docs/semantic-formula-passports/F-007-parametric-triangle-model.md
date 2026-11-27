# F-007 — Параметрическая модель семейства прямоугольных треугольников (`Arc–Angle Parametric Model`)

## 1. Formula ID
`F-007` *(соотносится с `Experiment 01–04` в Pythagoras-Circles-Lab: `arcAngleParametricAnalysis.ts`, `arcGeometricValidation.ts`)*

## 2. Formula Name
Параметризация семейства прямоугольных треугольников через вписанный радиус $r$ и угловое положение подвижной касательной $\alpha$ (`Arc–Angle Parametric Family Model`)

## 3. Canonical Expression
В принятой координатной ориентации (`Experiment 02–04`: первый катет $a = OA$ вдоль оси $+Oy$, второй катет $b = OB$ вдоль оси $+Ox$, точка касания $T_{AB}$ движется по часовой стрелке от $N=(r,2r)$ к $E=(2r,r)$):
$$\angle A = 90^\circ - \alpha, \qquad \angle B = \alpha, \qquad \frac{a}{b} = \tan\alpha \quad \left(\frac{b}{a} = \cot\alpha\right),$$
$$a(r, \alpha) = \frac{r(1 + \sin\alpha + \cos\alpha)}{\cos\alpha}, \qquad b(r, \alpha) = \frac{r(1 + \sin\alpha + \cos\alpha)}{\sin\alpha}, \qquad c(r, \alpha) = \frac{r(1 + \sin\alpha + \cos\alpha)}{\sin\alpha\cos\alpha},$$
$$L(r, \alpha) = r\alpha_{\text{рад}} \qquad \left(r > 0,\quad 0^\circ < \alpha < 90^\circ,\quad \alpha_{\text{рад}} = \frac{\pi\alpha^\circ}{180}\right).$$

> **Важная сверка с реализацией `Experiment 04` (контроль ориентации обозначений):**  
> В предварительной текстовой постановке задания рядом с $\frac{a}{b} = \tan\alpha$, $A = 90^\circ - \alpha$, $B = \alpha$ встречалась перестановка знаменателей ($\sin\alpha$ в $a$, $\cos\alpha$ в $b$). Прямая проверка против математического ядра `Experiment 04` (`src/math/experiments/arcGeometricValidation.ts`, строки 192–200, и `src/math/experiments/arcAngleParametricAnalysis.ts`) показывает, что при $\frac{a}{b} = \tan\alpha$, $A = 90^\circ - \alpha$, $B = \alpha$ в знаменателе $a$ стоит именно **$\cos\alpha$**, а в знаменателе $b$ — именно **$\sin\alpha$**:
> $$\frac{a}{b} = \frac{r(1+\sin\alpha+\cos\alpha)/\cos\alpha}{r(1+\sin\alpha+\cos\alpha)/\sin\alpha} = \frac{\sin\alpha}{\cos\alpha} = \tan\alpha.$$
> (Формулы со swapped-знаменателями $\frac{\dots}{\sin\alpha}$ и $\frac{\dots}{\cos\alpha}$ соответствуют отсчёту угла от горизонтальной точки $E=(2r,r)$ либо перестановке $a \leftrightarrow b$, при которой $A = \alpha, B = 90^\circ - \alpha, a/b = \cot\alpha$.) Настоящий паспорт фиксирует **согласованную и проверенную в коде `Experiment 04`** систему формул.

## 4. Semantic Statement
Вся совокупность невырожденных прямоугольных треугольников с фиксированной вписанной окружностью радиуса $r$ порождается перекатыванием третьей касательной (гипотенузы) вдоль открытой четверти этой окружности. При этом угол $\alpha$ (положение точки касания) однозначно задаёт **форму** треугольника (углы $A, B$ и отношение катетов), а радиус $r$ однозначно задаёт **масштаб** (линейные размеры сторон $a, b, c$ и длину дуги $L$).

## 5. Symbol Registry
| Символ | Значение | Математическая роль | Происхождение / как возникает | Область значений |
|---|---|---|---|---|
| $r$ | Радиус вписанной окружности | Параметр **масштаба** | Радиус фиксированной вписанной окружности $K_i$ с центром $I=(r,r)$ | $r \in \mathbb{R}_{>0}$ |
| $\alpha$ | Центральный угол положения точки касания $T_{AB}$ | Параметр **формы** | Угол поворота радиус-вектора $I \to T_{AB}$ по часовой стрелке от верхнего предела $N=(r, 2r)$ к правому пределу $E=(2r, r)$ | $0^\circ < \alpha < 90^\circ$ ($0 < \alpha_{\text{рад}} < \frac{\pi}{2}$) |
| $L$ | Длина пройденной дуги от $N$ до $T_{AB}$ | Связующая дуговая координата | Длина дуги окружности радиуса $r$ для центрального угла $\alpha_{\text{рад}}$: $L = r\alpha_{\text{рад}}$ | $0 < L < \frac{\pi r}{2}$ |
| $\angle A$ | Острый угол при вершине $A=(0,a)$ | Угол формы | Угол между вертикальным катетом $OA$ и гипотенузой $AB$; равен $90^\circ - \alpha$ | $0^\circ < A < 90^\circ$ |
| $\angle B$ | Острый угол при вершине $B=(b,0)$ | Угол формы | Угол между горизонтальным катетом $OB$ и гипотенузой $AB$; равен $\alpha$ | $0^\circ < B < 90^\circ$ |
| $a$ | Длина вертикального катета $OA$ | Масштабируемая сторона | Ордината пересечения подвижной касательной с неподвижной осью $x = 0$ | $a > 2r$ |
| $b$ | Длина горизонтального катета $OB$ | Масштабируемая сторона | Абсцисса пересечения подвижной касательной с неподвижной осью $y = 0$ | $b > 2r$ |
| $c$ | Длина гипотенузы $AB$ | Масштабируемая сторона | Расстояние между точками пересечения $A=(0,a)$ и $B=(b,0)$ | $c \ge 2r(1 + \sqrt{2})$ |

## 6. Definitions
- **Неподвижные касательные-катеты:** луч $x = 0, y \ge 0$ (точка касания $T_{OA} = (0, r)$) и луч $y = 0, x \ge 0$ (точка касания $T_{OB} = (r, 0)$).
- **Точка касания гипотенузы ($T_{AB}$):** точка на дуге $K_i$ в первом квадранте:
  $$T_{AB}(\alpha) = \big(r(1 + \sin\alpha),\; r(1 + \cos\alpha)\big).$$
- **Допустимая открытая дуга:** открытая четверть окружности $(N, E)$ без концевых точек $N=(r,2r)$ ($\alpha = 0^\circ$) и $E=(2r,r)$ ($\alpha = 90^\circ$), на которых касательная становится параллельной одному из катетов.

## 7. Geometric Interpretation
1. **Разделение формы и масштаба:**
   - при **постоянном $r$** и изменении $\alpha \in (0^\circ, 90^\circ)$ точка касания скользит по одной и той же окружности: углы $A = 90^\circ-\alpha$, $B = \alpha$ и отношение $a/b = \tan\alpha$ меняются (меняется **форма**), а радиус $r$ постоянен;
   - при **постоянном $\alpha$** и изменении $r$ все углы $A, B$ и отношение $a/b$ строго сохраняются (форма треугольника не меняется), а длины $a, b, c, L$ масштабируются прямо пропорционально $r$ (меняется **масштаб**).
2. **Симметрия $\alpha \leftrightarrow 90^\circ - \alpha$:** отражение относительно биссектрисы $y = x$ меняет катеты $a \leftrightarrow b$, меняет углы $A \leftrightarrow B$ и оставляет гипотенузу $c$ неизменной; единственная неподвижная точка симметрии — равнобедренный прямоугольный треугольник при $\alpha = 45^\circ$ ($A = B = 45^\circ$, $a = b = r(2+\sqrt{2})$).
3. **Граничное поведение:**
   - при $\alpha \to 0^+$ ($L \to 0$): касательная приближается к горизонтали $y = 2r$, поэтому $a \to 2r$, $b \to +\infty$, $c \to +\infty$, $A \to 90^\circ$, $B \to 0^\circ$;
   - при $\alpha \to 90^-$ ($L \to \pi r/2$): касательная приближается к вертикали $x = 2r$, поэтому $b \to 2r$, $a \to +\infty$, $c \to +\infty$, $A \to 0^\circ$, $B \to 90^\circ$.

## 8. Preconditions
1. Евклидова плоскость; неподвижные катеты ортогональны ($\angle AOB = 90^\circ$).
2. $r > 0$ — строго положительный радиус вписанной окружности.
3. Угол $\alpha$ лежит строго внутри открытого интервала $0^\circ < \alpha < 90^\circ$ (граничные углы $0^\circ$ и $90^\circ$ вырождены и исключены).

## 9. Domain and Constraints
- **Область параметров:** $(r, \alpha) \in (0, +\infty) \times (0^\circ, 90^\circ)$.
- **Запрещённые значения:** $\alpha = 0^\circ$ ($\sin\alpha = 0$ — деление на ноль в $b, c$) и $\alpha = 90^\circ$ ($\cos\alpha = 0$ — деление на ноль в $a, c$).
- **Ограничения `UMFP Core 0.1.x`:** `0.1.x` Core не поддерживает тригонометрические функции `sin`, `cos`, `tan` в своём встроенном распознавателе доменов (`fn:*` попадает в `UNKNOWN` без `RADICAL`/`FRACTION`) и не моделирует углы с градусными единицами. Поэтому параметрический паспорт относится к **расширенному семантическому слою** и верифицируется численно-аналитически в `Experiment 04`.

## 10. Derivation
Вывод выполняется напрямую от окружности $K_i$ и касательной (без заимствования готового ответа):

1. Разместим центр окружности радиуса $r$ в точке $I = (r, r)$. Тогда прямые $x = 0$ и $y = 0$ касаются $K_i$ в точках $(0, r)$ и $(r, 0)$ (расстояния от $I$ до обеих осей равны $r$).
2. Зададим на окружности точку $T_{AB}(\alpha)$ на расстоянии $r$ от $I$ под углом $\alpha$ по часовой стрелке от направления $+Oy$ ($N = (r, 2r)$):
   $$\vec{n}(\alpha) = (\sin\alpha,\; \cos\alpha), \qquad T_{AB}(\alpha) = I + r\vec{n}(\alpha) = \big(r(1 + \sin\alpha),\; r(1 + \cos\alpha)\big).$$
   Проверка окружности: $|T_{AB} - I| = r\sqrt{\sin^2\alpha + \cos^2\alpha} = r$.
3. Длина дуги от $N=(r, 2r)$ до $T_{AB}(\alpha)$ по определению радианной меры равна:
   $$L = r\alpha_{\text{рад}}.$$
4. Касательная к окружности в точке $T_{AB}$ перпендикулярна радиус-вектору $T_{AB} - I = r\vec{n}(\alpha)$, поэтому для любой точки $(x, y)$ на касательной:
   $$\sin\alpha\,(x - r - r\sin\alpha) + \cos\alpha\,(y - r - r\cos\alpha) = 0.$$
5. Раскроем скобки и воспользуемся $\sin^2\alpha + \cos^2\alpha = 1$:
   $$x\sin\alpha + y\cos\alpha = r\sin\alpha + r\cos\alpha + r(\sin^2\alpha + \cos^2\alpha) = r(1 + \sin\alpha + \cos\alpha).$$
6. Найдём пересечение этой прямой с неподвижным вертикальным катетом $x = 0$ (при $\alpha \in (0^\circ, 90^\circ)$ имеем $\cos\alpha > 0$):
   $$y\cos\alpha = r(1 + \sin\alpha + \cos\alpha) \implies \boxed{a = \frac{r(1 + \sin\alpha + \cos\alpha)}{\cos\alpha}}.$$
7. Найдём пересечение с неподвижным горизонтальным катетом $y = 0$ (при $\alpha \in (0^\circ, 90^\circ)$ имеем $\sin\alpha > 0$):
   $$x\sin\alpha = r(1 + \sin\alpha + \cos\alpha) \implies \boxed{b = \frac{r(1 + \sin\alpha + \cos\alpha)}{\sin\alpha}}.$$
8. Найдём отношение катетов и острые углы:
   $$\frac{a}{b} = \frac{\sin\alpha}{\cos\alpha} = \tan\alpha, \qquad \tan(\angle B) = \frac{a}{b} = \tan\alpha \implies \angle B = \alpha, \qquad \angle A = 90^\circ - \angle B = 90^\circ - \alpha.$$
9. Найдём гипотенузу $c = \sqrt{a^2 + b^2}$:
   $$c = r(1 + \sin\alpha + \cos\alpha)\sqrt{\frac{1}{\cos^2\alpha} + \frac{1}{\sin^2\alpha}} = r(1 + \sin\alpha + \cos\alpha)\frac{\sqrt{\sin^2\alpha + \cos^2\alpha}}{\sin\alpha\cos\alpha} = \boxed{\frac{r(1 + \sin\alpha + \cos\alpha)}{\sin\alpha\cos\alpha}}.$$
10. Проверим выполнение [`F-005`](F-005-right-triangle-inradius.md) ($r = \frac{a+b-c}{2}$):
    $$\frac{a + b - c}{2} = \frac{r(1 + \sin\alpha + \cos\alpha)(\sin\alpha + \cos\alpha - 1)}{2\sin\alpha\cos\alpha} = \frac{r\big((\sin\alpha + \cos\alpha)^2 - 1\big)}{2\sin\alpha\cos\alpha} = \frac{r(2\sin\alpha\cos\alpha)}{2\sin\alpha\cos\alpha} = r.$$

## 11. Dependency Graph
- **Опирается на:** ортонормированную координатную конструкцию катетов, уравнение касательной к окружности, тригонометрическое тождество $\sin^2\alpha + \cos^2\alpha = 1$, теорему Пифагора [`F-001`](F-001-pythagorean-theorem.md) и обратную совместимость с [`F-005`](F-005-right-triangle-inradius.md).
- **Порождает:** параметрическую классификацию семейств прямоугольных треугольников по диапазонам $(A, B)$ и масштабу $r$ (`Experiment 04`).

## 12. Mathematical Status
- **Статус достоверности:** `DERIVED & VERIFIED` — аналитически выведена из уравнений касательной и проверена численно в `Experiment 03–04` на сетке $r \in \{1, 2, 3\}$, $\alpha \in \{5^\circ, 10^\circ, \dots, 85^\circ\}$ (51 точка, невязки $< 10^{-12}$).
- **Оговорка о конвенции:** формулы привязаны к выбранной ориентации осей ($a$ — по $+Oy$, $b$ — по $+Ox$, $\alpha$ — от $N=(r,2r)$ к $E=(2r,r)$) и **не** являются единственно возможным выбором координат.

## 13. Numerical Example
Проверим два конкретных случая:
1. **Симметричный случай ($r = 1$, $\alpha = 45^\circ$):**
   - $\sin 45^\circ = \cos 45^\circ = \frac{\sqrt{2}}{2} \approx 0.707107$.
   - $A = 45^\circ$, $B = 45^\circ$, $L = 1 \cdot \frac{\pi}{4} \approx 0.785398$.
   - $a = b = \frac{1 + \sqrt{2}}{\sqrt{2}/2} = 2 + \sqrt{2} \approx 3.414214$, $c = 2\sqrt{2} + 2 \approx 4.828427$.
   - Проверка `F-005`: $\frac{a + b - c}{2} = \frac{(4 + 2\sqrt{2}) - (2 + 2\sqrt{2})}{2} = 1 = r$.
2. **Контрольный треугольник $5\text{–}12\text{–}13$ ($a = 5, b = 12, c = 13, r = 2$):**
   - $\tan\alpha = \frac{a}{b} = \frac{5}{12} \implies \alpha = \arctan\!\left(\frac{5}{12}\right) \approx 22.619865^\circ$, $\sin\alpha = \frac{5}{13}$, $\cos\alpha = \frac{12}{13}$.
   - $\angle B = \alpha \approx 22.619865^\circ$, $\angle A = 90^\circ - \alpha \approx 67.380135^\circ$.
   - Проверка формул сторон:
     $$1 + \sin\alpha + \cos\alpha = 1 + \frac{5}{13} + \frac{12}{13} = \frac{30}{13},$$
     $$a = \frac{2 \cdot (30/13)}{12/13} = \frac{60}{12} = 5, \qquad b = \frac{2 \cdot (30/13)}{5/13} = \frac{60}{5} = 12, \qquad c = \frac{2 \cdot (30/13)}{(5/13)(12/13)} = \frac{60 \cdot 13}{60} = 13.$$
   - Длина дуги: $L = 2 \cdot \arctan(5/12) \approx 0.789582$.

## 14. Validation Cases
1. Все 51 точка таблицы `Experiment 04` ($r \in \{1,2,3\}$, шаг $5^\circ$): $a^2+b^2=c^2$, $A+B=90^\circ$, $\frac{a+b-c}{2}=r$ (невязка $< 10^{-11}$).
2. Проверка масштабной инвариантности формы: при переходе $r = 1 \to 2 \to 3$ углы $A, B$ и $a/b$ неизменны ($< 1.5 \times 10^{-14}$), а $a, b, c, L$ масштабируются ровно в $1:2:3$ раз.
3. Треугольник $(5, 12, 13)$ ($r = 2$, $\alpha = \arctan(5/12)$): точное восстановление $a=5, b=12, c=13$.

## 15. Common Misinterpretations
1. **Перестановка знаменателей $\sin\alpha \leftrightarrow \cos\alpha$ без смены ориентации:** если подставить $a = \frac{r(1+\sin\alpha+\cos\alpha)}{\sin\alpha}$ и $b = \frac{r(1+\sin\alpha+\cos\alpha)}{\cos\alpha}$, то получится $\frac{a}{b} = \cot\alpha$ вместо $\tan\alpha$, и углы $A, B$ поменяются местами ($A = \alpha, B = 90^\circ - \alpha$).
2. **Подмена $\alpha$ на удвоенный параметр $\theta = 2\alpha$ в формуле длины дуги:** как доказано в `Experiment 03`, физическая длина дуги равна $L = r\alpha$, а не $r\theta$.
3. **Включение вырожденных границ $\alpha = 0^\circ$ и $\alpha = 90^\circ$ в множество треугольников:** на границах одна из сторон уходит в бесконечность.

## 16. Related Formulas
- [`F-001`](F-001-pythagorean-theorem.md) — теорема Пифагора.
- [`F-005`](F-005-right-triangle-inradius.md) — радиус $r = \frac{a+b-c}{2}$.
- [`F-006`](F-006-four-circles-identity.md) — квадратные круги $K_a, K_b, K_c$ и $K_i$ на параметрическом семействе.

## 17. Source / References
- `Pythagoras-Circles-Lab`: `src/math/experiments/arcGeometricValidation.ts`, `src/math/experiments/arcAngleParametricAnalysis.ts`, `src/tests/experiment04.arcAngle.test.ts`, `docs/experiments/EXPERIMENT_04_ARC_ANGLE_PARAMETRIC_ANALYSIS.md`.
