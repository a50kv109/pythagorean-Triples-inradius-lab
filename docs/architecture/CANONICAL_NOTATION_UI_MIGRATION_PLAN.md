# REMIX — ЭТАП 2.1.1: Финализированный план миграции математической нотации и семантического словаря интерфейса на New Canonical Architecture

**Статус документа:** Финализированная архитектурная спецификация (Stage 2.1.1 — дополнено геометрической эквивалентностью $K_c \equiv K_o$ и правилами тестирования уникальности; ожидает финального согласования перед реализацией Шага 1 `SemanticNotationRegistry`; исходный код и тесты не изменялись)  
**Версия:** 1.2.0  
**Нормативная база:**
1. [`docs/standards/MATHEMATICAL_NOTATION_STANDARD.md`](../standards/MATHEMATICAL_NOTATION_STANDARD.md) *(приоритетный источник истины при расхождении обозначений)*
2. [`docs/standards/CANONICAL_SEMANTIC_CONTRACT.md`](../standards/CANONICAL_SEMANTIC_CONTRACT.md) *(приоритетный семантический и численный контракт)*
3. [`docs/audit/NOTATION_MIGRATION_MAP.md`](../audit/NOTATION_MIGRATION_MAP.md)
4. [`docs/audit/MATHEMATICAL_RESULT_CLASSIFICATION.md`](../audit/MATHEMATICAL_RESULT_CLASSIFICATION.md)
5. [`docs/audit/STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md`](../audit/STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md)
6. [`docs/audit/REMIX_INITIAL_ARCHITECTURE_AUDIT.md`](../audit/REMIX_INITIAL_ARCHITECTURE_AUDIT.md)
7. Программный контракт `src/canonical/` (`types.ts`, `semanticContract.ts`, `legacyMapping.ts`, `index.ts`)

---

## Содержание

1. [Полный реестр старых обозначений интерфейса (Legacy UI Notation Registry)](#1-полный-реестр-старых-обозначений-интерфейса-legacy-ui-notation-registry)
2. [Таблица соответствий `Legacy → New Canonical`](#2-таблица-соответствий-legacy--new-canonical)
3. [Единый канонический словарь интерфейса и правила форматирования](#3-единый-канонический-словарь-интерфейса-и-правила-форматирования)
4. [Архитектура будущего слоя `Semantic Notation Layer` (Design Only)](#4-архитектура-будущего-слоя-semantic-notation-layer-design-only)
5. [Карта затрагиваемых UI-компонентов и текстовых источников](#5-карта-затрагиваемых-ui-компонентов-и-текстовых-источников)
6. [Последовательность этапов миграции (10 шагов)](#6-последовательность-этапов-миграции-10-шагов)
7. [Критерии приёмки каждого этапа и сквозного аудита](#7-критерии-приёмки-каждого-этапа-и-сквозного-аудита)
8. [Нормативные решения (Stage 2.1), разрешение противоречий и открытые вопросы графической сцены](#8-нормативные-решения-stage-21-разрешение-противоречий-и-открытые-вопросы-графической-сцены)

---

## 1. Полный реестр старых обозначений интерфейса (Legacy UI Notation Registry)

Настоящий реестр строго разделяет **внутренние программные идентификаторы TypeScript/React** (имена полей типов, пропсов, переменных и CSS/SVG ID, которые могут сохранять переходные адаптеры на уровне кода) и **пользовательскую математическую нотацию интерфейса**, отображаемую пользователю в браузере.

### 1.1. Внутренние программные идентификаторы vs пользовательская нотация

| Категория | Примеры внутренних идентификаторов кода (`src/`) | Что видит пользователь в UI сейчас (Legacy UI) | Статус при UI-миграции |
| :--- | :--- | :--- | :--- |
| Типы и поля геометрии (`src/types/geometry.ts`) | `triangle.O`, `triangle.a` (верт. катет), `triangle.b` (гориз. катет), `incircle.tangencyOA`, `incircle.tangencyOB`, `incircle.tangencyAB` | `O (0,0)`, `△OAB`, `a (OA)`, `b (OB)`, `T_a(OA)`, `T_b(OB)`, `T_c(AB)` | Внутренние поля переходят на `src/canonical/` поэтапно или через адаптер; **UI-текст и SVG-подписи меняются обязательно и полностью**. |
| Спектральный анализ (`src/math/FourCirclesSpectralAnalysis.ts`) | `pA`, `pB`, `pC`, `pI` (длины окружностей), `t = b/a`, `cNorm = Math.sqrt(1 + t*t)` | `P_a, P_b, P_c, P_i`, `P_x / P_c`, `t = b/a`, `a=1` (нормировка) | Внутренний расчётный слой изолируется; в UI допускаются только `C_a, C_b, C_c, C_i, C_o`, `C_x / C_c`, $\rho = \text{sideA}/\text{sideB}$. |
| Эксперименты 02–06 (`src/math/experiments/*`) | `phiDeg` / `alphaDeg`, `thetaDeg`, `sA`, `sB`, `sC`, `Sa`, `Sb`, `Sc`, `Wa`, `Wb`, `Wc` | `φ`, `θ = 2φ`, `α = ∠B`, `s_A/s_B/s_C`, `S_a/S_b/S_c`, `w_a/w_b/w_c`, `t_A, t_B`, `L_max = πr/2` | Локальные поля модулей маппятся в единый `SemanticNotationLayer`; пользователь не видит локальных коллизий. |
| Идентификаторы SVG/DOM и `localStorage` | `id="vertex-O"`, `id="tan-OA"`, `STORAGE_KEY = 'pythagoras_four_circles_configs_v1'` | Hover-карточки `Вершина O`, имена экспорта `four_circles_a4_b3.png/svg/json` | DOM/CSS ID допустимо обновлять без ломки сериализации (сохраняя миграцию ключей JSON/localStorage при необходимости); имена экспортируемых файлов и заголовки переводятся на новую нотацию. |

---

### 1.2. Каталог пользовательских Legacy-обозначений по слоям представления

#### A. SVG-сцена, координатная сетка и оверлеи (`src/components/geometry/*`)

| Обозначение в UI | Где встречается (файл и строки) | Семантика в Legacy UI | Проблема / коллизия |
| :--- | :--- | :--- | :--- |
| `O (0,0)`, `O` | `CoordinateGrid.tsx:140`, `RightTriangleView.tsx:218`, `GeometryBoard.tsx:559` | Вершина прямого угла в начале координат | Конфликт с центрами окружностей `O_a, O_b, O_c, O_o`; в New Canonical вершина прямого угла — **`C`**. |
| `△OAB`, `∠AOB = 90°` | `RightTriangleView.tsx:54`, `translations.ts:478, 534`, `ThalesValidators.ts:176, 198` | Треугольник и прямой угол при `O` | Должно быть **`△ABC`** и **`∠ACB = γ = 90°`**. |
| `a` на вертикальном катете `OA`, `b` на горизонтальном катете `OB` | `RightTriangleView.tsx:229, 241`, `FourCirclesView.tsx:145, 165`, `ControlsPanel.tsx:101, 141` | `a = |OA|` (прилежит к `A`, лежит против `B`), `b = |OB|` (прилежит к `B`, лежит против `A`) | Нарушение стандартного правила «сторона против одноимённой вершины»; прямо противоположно модулю `ArcSideAreaPanel` (Эксп. 06), где `a` и `b` уже инвертированы. |
| `Q_a`, `K_a` на вертикальном катете; `Q_b`, `K_b` на горизонтальном | `FourCirclesView.tsx:132-278` | Внешний квадрат и окружность на `OA` названы с индексом `a`, на `OB` — с индексом `b` | При переходе к каноническим `sideA` / `sideB` индексы квадратов и окружностей должны строго следовать за сторонами $a$ и $b$. |
| `T_a = (0, r)`, `T_b = (r, 0)`, `T_c` | `FourCirclesView.tsx:603, 621, 639, 718-738` | `T_a` на вертикальном катете, `T_b` на горизонтальном | Индекс точки касания привязан к старой нумерации катетов; в оверлеях Эксп. 05–06 те же точки подписаны как `T_OA`, `T_OB`, `T_AB`. |
| `O_a, O_b, O_c, O_o` | `FourCirclesView.tsx:484-510, 802, 885, 937` | Центры окружностей | В `translations.ts` и `ThalesValidators.ts` также встречается `O_c` / `O_o`; по решению этапа 2.1 обозначения `O_a, O_b, O_c, O_o` сохраняются, так как вершина `O` упразднена (`C`), а `C_a..C_o` закреплены за длинами окружностей. |
| `L_o = ...` | `FourCirclesView.tsx:779` | Длина описанной окружности `K_o` | Коллизия с длинами дуг вписанной окружности **`L_A, L_B, L_C`** и **`L`**! По стандарту длина окружности — **`C_o`**. |
| `K_a = ...` (площадь в hover), `d = a` | `FourCirclesView.tsx:251, 272, 293, 779` | Одно и то же обозначение `K_a` используется и как имя окружности, и как числовое значение её площади; диаметр `d` без индекса, рядом `D_o` | Смешение объекта, площади и диаметра; по решению этапа 2.1 площадь записывается строго как `Area(K_x)`, а диаметры — как `d_a, d_b, d_c, d_i, D_o`. |
| `φ`, `θ = 2φ`, `t = cot(φ)`, `L_max = πr/2` | `ArcClassificationBoardOverlay.tsx` | Эксп. 02: полярный угол `φ` от оси `N=(r,2r)`, `θ = 2φ`, отношение `t = b/a`, предел `L_max` | `φ` конфликтует с центральными углами дуг `φ_A, φ_B, φ_C`; `t` заменено на `ρ`; гипотеза `L_max` **опровергнута (`REFUTED`)** и в новый UI не переносится. |
| `α = ∠B`, `∠A = 90° − α`, `L = r·α` | `ArcAngleBoardOverlay.tsx`, `IncircleArcDistributionOverlay.tsx`, `ArcSideAreaBoardOverlay.tsx` | Полярный/острый угол при вершине `B` назван **`α`**, хотя `α` в стандарте — угол при **`A`**! | Прямая семантическая ошибка знаков/вершин в 3 оверлеях сразу; закреплён угол **`β = ∠B`**. |
| `T_OA`, `T_OB`, `T_AB`, `S_a, S_b, S_c`, `w_a, w_b, w_c` | `IncircleArcDistributionOverlay.tsx`, `ArcSideAreaBoardOverlay.tsx` | Точки касания по имени старых отрезков, площади подтреугольников строчными `S_a, S_b, S_c` | `S_a, S_b, S_c` запрещены стандартом (конфликт с квадратами/площадями сторон); должны быть `S_A, S_B, S_C` и `w_A^{area}, w_B^{area}, w_C^{area}`. |

#### B. KaTeX-формулы (`MathFormula`), метрики (`MetricCard`) и текстовые формулы

| Legacy-формула в UI | Компонент / файл | Проблема |
| :--- | :--- | :--- |
| `r = \frac{a+b-c}{2}`, `(a + b - c)/2` | `FourCirclesPanel.tsx:141, 163`, `FourCirclesView.tsx:546`, `HelpModal.tsx:78`, `presets.ts:22`, `FourCirclesValidators.ts:224` | Вычислительно неустойчивая разностная форма как основная формула в UI (контракт `NC-01` требует первичной бесвычитательной формы $r = \frac{ab}{a+b+c}$). |
| `K_a = \frac{\pi a^2}{4}`, `K_a + K_b = K_c`, `K_a + K_b - K_c - K_i = -K_i` | `FourCirclesPanel.tsx:94, 257, 269`, `HelpModal.tsx:61..118`, `TestRunnerModal.tsx:84-85` | Отождествление имени окружности `K_x` с площадью `Area(K_x)`. |
| `O_o = \left(\frac{b}{2}, \frac{a}{2}\right)`, `\|O_o - O_c\| = \frac{c}{2}` | `HelpModal.tsx:128-129`, `ThalesCircumcirclePanel.tsx:84, 160` | Координатная привязка к старому расположению `a` (по Y) и `b` (по X). |
| `P_a = \pi a`, `P_x / P_c`, `L_c`, `L_o` | `ThalesCircumcirclePanel.tsx:184`, `KcVsKoComparison.tsx:57-58`, `SpectralAnalysisPanel.tsx:531..591` | Использование `P_x` и `L_x` вместо канонического `C_x` для длины окружности; `P` зарезервировано за периметром $P = a+b+c$. |
| `t = b/a = \cot\varphi = \cot(\theta/2)`, `L_{\max} = \frac{\pi r}{2}` | `ArcClassificationPanel.tsx:62, 68, 212` | Старый параметр формы `t`, конфликтный угол `φ` и опровергнутый термин/символ `L_max`. |
| `\alpha = \angle B`, `\angle A = 90^\circ - \alpha`, `L = r \cdot \alpha_{\text{rad}}`, `t = b/a = \cot \alpha = \tan A` | `ArcAngleAnalysisPanel.tsx:45-49, 72, 203, 314-356` | Одновременно присваивает `α` углу `B`, а `t` — отношению `b/a`. |
| `\varphi_A = 90^\circ + \alpha`, `\varphi_B = 180^\circ - \alpha`, `\varphi_C = 90^\circ`, `s_A, s_B, s_C` | `IncircleArcDistributionPanel.tsx:68-71, 160, 241-247` | Угол `α` вместо `β`; строчные `s_A, s_B, s_C` для долей дуг вместо $w_A^{\text{arc}}, w_B^{\text{arc}}, w_C^{\text{arc}}$ (опасная близость к площадям $S_A, S_B, S_C$!). |
| `S_a, S_b, S_c`, `w_a, w_b, w_c`, `w_C = w_b = 25\%`, `t_A, t_B`, `a = |OB|, b = |OA|` | `ArcSideAreaPanel.tsx:68-70, 109, 296, 512`, `arcSideAreaCorrespondence.ts:78, 102` | Массивная терминологическая инверсия и неканонические индексы в формулах законов L-01..L-08. |
| `S_c` как «Квадрат гипотенузы» | `SpectralAnalysisPanel.tsx:1608` | Коллизия с `S_c` (подтреугольник в Эксп. 06) и запрет на `S_a, S_b, S_c` для квадратов $Q_a, Q_b, Q_c$. |
| `Q_a = a^2`, `Q_b = b^2`, `Q_c = c^2` | `FourCirclesValidators.ts:235` | Смешение объекта квадрата $Q_x$ и его площади $\text{Area}(Q_x) = a^2$. |

#### C. Графики, легенды, оси, заголовки таблиц и вкладок

1. **`SpectralAnalysisPanel.tsx`:**
   - Параметр по оси X назван `t = b/a` (при $a_{\text{norm}} = 1$, $b_{\text{norm}} = t$).
   - Серии и подписи осей: `P_a, P_b, P_c, P_i`, `P_x / P_c`, `K_x / K_c`, `K_a(t)`, `K_b(t)`, `K_c(t)`, `K_i(t)`, `Q_a, Q_b, S_c`.
   - Критически много непереведённого захардкоженного русского текста (строки 619, 753, 845, 1150, 1164, 1201, 1409, 1475, 1564–1608) с прямыми формулами через `t`, `P_x`, `S_c`, `(a+b-c)/2`.
2. **`ArcClassificationPanel.tsx`:**
   - Ползунок и подписи графиков по `φ` и `θ = 2φ`, серия `L_max = πr/2`, ось `t = b/a`.
3. **`ArcAngleAnalysisPanel.tsx`:**
   - Ползунки, зоны и графики по `α = ∠B`, предел `L_max` на графике, `t = b/a`, предупреждения домена не согласованы с `STAGE_5_2_3` (`[0.5, 15]` vs `[0.1, 150]` vs Level 1/Level 2).
4. **`IncircleArcDistributionPanel.tsx`:**
   - Таблицы и графики с сериями `s_A(α), s_B(α), s_C(α)`, `φ_A(α), φ_B(α), φ_C(α)`.
5. **`ArcSideAreaPanel.tsx`:**
   - Таблица с колонкой `w_area≡w_side (a/b/c)`, заголовками `S_a, S_b, S_c`, `w_a, w_b, w_c`, `α = ∠B`, расчётные карточки с `a = |OB|, b = |OA|`.
6. **`ThalesCircumcirclePanel.tsx`, `KcVsKoComparison.tsx`, `TestRunnerModal.tsx`, `ComparisonModal.tsx`:**
   - Колонки `L_c`, `L_o`, `P_c`, `P_o`, подписи вершин `O, A, B`, профили `(3, 4, 5)` в привязке к `(a=OA=3, b=OB=4)`.

#### D. Локализация (`src/i18n/translations.ts`), hover/подсказки, метаданные и экспорт

1. **`src/i18n/translations.ts` (RU / UK / EN):**
   - `brandTitle: 'Pythagoras — Four Circles'`, `brandSubtitle` с упоминанием «Пифагоровы штаны» (`metadata.json:2-3`, `index.html:6-9`).
   - Множество ключей с зашитой старой нотацией: `hover.originTitle` («Вершина O»), `hover.tanOATitle` (`T_a (на OA)`), `hover.tanOBTitle` (`T_b (на OB)`), `hover.tanABTitle` (`T_c (на AB)`), `controls.legALabel` (`OA`), `controls.legBLabel` (`OB`), `invariants.items` (описания с `OAB`, `P_a`, `L_o`, `O_c`, `O_o`, `(a+b-c)/2`), `spectral.*`, `thalesPanel.*`, `helpModal.*`.
2. **Обход i18n в модулях Эксп. 02–06:**
   - Все 4 панели (`ArcClassificationPanel`, `ArcAngleAnalysisPanel`, `IncircleArcDistributionPanel`, `ArcSideAreaPanel`) и все 4 оверлея (`ArcClassificationBoardOverlay`, `ArcAngleBoardOverlay`, `IncircleArcDistributionOverlay`, `ArcSideAreaBoardOverlay`) содержат **локальные словари `copy = { ru: ..., uk: ..., en: ... }`** прямо в компонентах с жёстко вшитыми `φ`, `θ`, `α = ∠B`, `s_A`, `S_a`, `w_a`, `T_OA`, `L_max`.
3. **Динамические строки валидаторов, пресетов и экспорта:**
   - `FourCirclesValidators.ts`, `ThalesValidators.ts`: поля `name`, `formula`, `description`, `calculatedValue`, `expectedValue` формируются со старыми обозначениями (`OAB`, `Q_a = a^2`, `r = (a+b-c)/2`, `P_a`, `L_o`, `O_o-O_c`).
   - `src/math/presets.ts`: пресеты с комментариями и полями `a = 4, b = 3` (по старой ориентации).
   - `App.tsx` и `BottomToolbar.tsx`: имена файлов `four_circles_a${a}_b${b}.{svg,png,json}`, имя сохранённой конфигурации в `localStorage` (`a=..., b=...`).

---

## 2. Таблица соответствий `Legacy → New Canonical`

Таблица сгруппирована строго по 6 семантическим блокам с добавлением блока 7 для опровергнутых/уточнённых исследовательских обозначений.

### 2.1. Вершины, стороны и углы треугольника (ориентация `vertex_preserving`)

| Legacy UI | Источник Legacy | New Canonical UI (нормативно утверждено) | Код-идентификатор (`src/canonical`) | Примечание по переходу |
| :--- | :--- | :--- | :--- | :--- |
| `O (0, 0)` | `CoordinateGrid`, `GeometryBoard`, `RightTriangleView` | **$C = (0, 0)$** | `vertexC` | `O` полностью запрещено как имя вершины треугольника. |
| `A = (0, a)` | `RightTriangleView`, `FourCirclesModel` | **$A = (0, \text{sideB})$** *(вертикальный катет $AC = b$)* | `vertexA` | Находится на оси $+Oy$ на расстоянии `sideB` от `C` (ориентация `vertex_preserving`). |
| `B = (b, 0)` | `RightTriangleView`, `FourCirclesModel` | **$B = (\text{sideA}, 0)$** *(горизонтальный катет $BC = a$)* | `vertexB` | Находится на оси $+Ox$ на расстоянии `sideA` от `C` (ориентация `vertex_preserving`). |
| `△OAB`, `∠AOB = 90°` | `RightTriangleView`, `HelpModal`, `translations` | **$\triangle ABC$**, **$\angle ACB = \gamma = 90^\circ$** | `rightAngleDeg = 90` | Единое имя треугольника во всех вкладках, формулах и отчётах. |
| `a = |OA|` *(в ядре)*; `a = |OB|` *(в Эксп. 06)* | `FourCirclesModel` vs `ArcSideAreaPanel` | **$a = |BC|$** *(горизонтальный катет напротив $A$)* | `sideA` | Полная ликвидация разнобоя между ядром и Эксп. 06. |
| `b = |OB|` *(в ядре)*; `b = |OA|` *(в Эксп. 06)* | `FourCirclesModel` vs `ArcSideAreaPanel` | **$b = |AC|$** *(вертикальный катет напротив $B$)* | `sideB` | Катет напротив вершины $B$. |
| `c = |AB| = \sqrt{a^2+b^2}` | Везде | **$c = |AB| = \sqrt{a^2+b^2}$** | `sideC` | Гипотенуза напротив $C$. |
| `∠A = 90° − α` *(Эксп. 04–06)* | `ArcAngleAnalysisPanel`, `IncircleArc*`, `ArcSideArea*` | **$\alpha = \angle BAC$** *(угол при вершине $A$)* | `alphaDeg`, `alphaRad` | $\alpha = \arctan(a/b) = \arctan(\rho)$. |
| `α = ∠B` *(Эксп. 04–06)*; `φ = ∠B` *(Эксп. 02)* | `Arc*Panel`, `Arc*Overlay` | **$\beta = \angle ABC$** *(угол при вершине $B$)* | `betaDeg`, `betaRad` | $\beta = 90^\circ - \alpha = \arctan(1/\rho)$. |
| `90°` *(без символа)* | Сцена и панели | **$\gamma = \angle ACB = 90^\circ$** | `gammaDeg`, `gammaRad` | Закреплённый символ прямого угла. |

### 2.2. Параметры формы и масштаба

| Legacy UI | Источник Legacy | New Canonical UI | Код-идентификатор (`src/canonical`) | Примечание |
| :--- | :--- | :--- | :--- | :--- |
| `t = b/a` *(при $a_{\text{norm}}=1$)* | `SpectralAnalysisPanel`, `ArcClassificationPanel`, `ArcAngleAnalysisPanel` | **$\rho = \frac{a}{b}$** *(отношение горизонтального катета $a$ к вертикальному $b$)* | `rho` | Нормированный эталон (`semanticContract.ts`): `sideB = 1`, `sideA = ρ`, $c^*(\rho) = \sqrt{\rho^2+1}$. **Требует пересчёта осей и кривых графиков!** |
| `t_A, t_B` *(в тексте L-04)* | `arcSideAreaCorrespondence.ts:78` | В зависимости от контекста: длины касательных $\tau_A, \tau_B$ или отношение $\rho$ | — | Неканонический символ `t` устраняется полностью во избежание путаницы с Legacy `t = b/a`. |
| `λ = c / 5` | `ControlsPanel.tsx:184, 202` | **$\lambda = \frac{c}{5}$** | `lambda` | Символ сохраняется, формула привязывается к каноническим `sideC = |AB|`. |

### 2.3. Внешние квадраты

| Legacy UI | Источник Legacy | New Canonical UI | Код-идентификатор (`src/canonical`) | Примечание |
| :--- | :--- | :--- | :--- | :--- |
| `Q_a` *(на `OA`)* | `FourCirclesView` | **$Q_a$** *(только объект: квадрат на горизонтальном катете $a = BC$)* | `squareQa` | Объект-фигура переносится на катет `BC` (напротив `A`). |
| `Q_b` *(на `OB`)* | `FourCirclesView` | **$Q_b$** *(только объект: квадрат на вертикальном катете $b = AC$)* | `squareQb` | Объект-фигура переносится на катет `AC` (напротив `B`). |
| `Q_c` *(на `AB`)* | `FourCirclesView` | **$Q_c$** *(только объект: квадрат на гипотенузе $c = AB$)* | `squareQc` | Объект-фигура на гипотенузе. |
| `S_c` *(«Квадрат гипотенузы»)* | `SpectralAnalysisPanel:1608` | **$\operatorname{Area}(Q_c) = c^2$** *(числовая мера площади)* | `areaQc` (`sideC ** 2`) | **Запрещено:** `S_a, S_b, S_c` для квадратов! |
| `Q_a = a^2`, `Q_b = b^2`, `Q_c = c^2` | `FourCirclesValidators:235` | **$\operatorname{Area}(Q_a) = a^2$**, **$\operatorname{Area}(Q_b) = b^2$**, **$\operatorname{Area}(Q_c) = c^2$**; периметры **$4a, 4b, 4c$** | `areaQa`, `areaQb`, `areaQc`, `perimeterQa`.. | Строгое разграничение объекта $Q_x$ и его скалярных мер площади $\operatorname{Area}(Q_x)$ и периметра. |

### 2.4. Пять окружностей ($K_a, K_b, K_c, K_i, K_o$), их меры и геометрическая эквивалентность $K_c \equiv K_o$

| Legacy UI | Источник Legacy | New Canonical UI | Код-идентификатор (`src/canonical`) | Примечание |
| :--- | :--- | :--- | :--- | :--- |
| `K_a` *(на `OA`)*, `K_b` *(на `OB`)*, `K_c`, `K_i`, `K_o` | `FourCirclesView`, `FourCirclesPanel`, `HelpModal` | **$K_a$** *(на $a=BC$)*, **$K_b$** *(на $b=AC$)*, **$K_c$** *(на $c=AB$)*, **$K_i$** *(впис.)*, **$K_o$** *(опис.)* — **строго имена объектов** | `circleKa`, `circleKb`, `circleKc`, `circleKi`, `circleKo` | Индексы `a` и `b` строго привязаны к `sideA` (горизонталь) и `sideB` (вертикаль). Сохраняются оба обозначения $K_c$ и $K_o$. |
| *(Не зафиксировано)* | `MATHEMATICAL_SPEC` | **Геометрическая эквивалентность:** **$K_c \equiv K_o$** | `geometricIdentity: circleKo === circleKc` | **Математический факт:** $K_c$ (вписанная в $Q_c$) и $K_o$ (описанная около $\triangle ABC$) имеют один центр $O_c = O_o = (a/2, b/2)$ и один радиус $R_c = R_o = c/2$. Они геометрически совпадают ($K_c \equiv K_o$), $\operatorname{Area}(K_c) = \operatorname{Area}(K_o)$, $C_c = C_o$. Обозначения сохраняются как две разные семантические роли одного объекта. |
| `K_a = 12.566` *(как число площади)*, `K_a + K_b = K_c`, `\sqrt{K_a}` | `FourCirclesView:251`, `FourCirclesPanel:94, 257`, `HelpModal:61` | **$\operatorname{Area}(K_a) = \frac{\pi a^2}{4}$**, **$\operatorname{Area}(K_b) = \frac{\pi b^2}{4}$**, **$\operatorname{Area}(K_c) = \frac{\pi c^2}{4}$**, **$\operatorname{Area}(K_i) = \pi r^2$**, **$\operatorname{Area}(K_o) = \frac{\pi c^2}{4}$** | `areaKa`, `areaKb`, `areaKc`, `areaKi`, `areaKo` | **Решение Д-2:** в формулах и значениях площади всегда используется явная запись $\operatorname{Area}(K_x)$; не обозначать площадь одним символом $K_x$. $\operatorname{Area}(K_c) = \operatorname{Area}(K_o)$. |
| `R_a, R_b, R_c, r, R_o` *(частично без индексов `d = a`)* | `FourCirclesView`, `FourCirclesPanel`, `KcVsKoComparison` | **$R_a = \frac{a}{2}$**, **$R_b = \frac{b}{2}$**, **$R_c = \frac{c}{2}$**, **$r$**, **$R_o = \frac{c}{2}$** | `radiusRa`, `radiusRb`, `radiusRc`, `inradiusR`, `radiusRo` | $R_c = R_o = c/2$ (строгое равенство радиусов). |
| `d = a`, `d = b`, `d = c`, `D_o = c` | `FourCirclesView`, `FourCirclesPanel`, `KcVsKoComparison` | **$d_a = a$**, **$d_b = b$**, **$d_c = c$**, **$d_i = 2r$**, **$D_o = c$** | `diameterDa`, `diameterDb`, `diameterDc`, `diameterDi`, `diameterDo` | Исключается безликий `d` в таблицах и карточках; $d_c = D_o = c$. |
| `P_a, P_b, P_c, P_i`; `L_c, L_o`; `P_x / P_c` | `ThalesCircumcirclePanel`, `KcVsKoComparison`, `SpectralAnalysisPanel`, `FourCirclesView:779` | **$C_a = \pi a$**, **$C_b = \pi b$**, **$C_c = \pi c$**, **$C_i = 2\pi r$**, **$C_o = \pi c$**; отношение **$C_x / C_c$** | `circumferenceCa`..`circumferenceCo` | **Решение Д-4:** `C_a..C_o` закреплены за длинами окружностей; $C_c = C_o = \pi c$; `P_x` и `L_x` для окружностей полностью удаляются. |
| `O_a, O_b, O_c, O_o` | `FourCirclesView`, `ThalesCircumcirclePanel` | **$O_a, O_b, O_c, O_o$** | `centerKa`, `centerKb`, `centerKc`, `centerKo` | **Решение Д-4:** обозначения центров сохраняются; $O_c = O_o = (a/2, b/2)$ (совпадение центров). |

### 2.5. Инцентр, радиус, площади и разбиение треугольника ($S = S_A + S_B + S_C = pr$)

| Legacy UI | Источник Legacy | New Canonical UI | Код-идентификатор (`src/canonical`) | Примечание |
| :--- | :--- | :--- | :--- | :--- |
| `I = (r, r)` | Везде | **$I = (r, r)$** | `incenterI` | Инцентр; координаты $(r, r)$ одинаковы, так как оба катета исходят из $C=(0,0)$. |
| `r = (a + b - c) / 2` *(как первичная формула)* | `FourCirclesPanel`, `FourCirclesView`, `HelpModal`, `presets` | **$r = \frac{ab}{a+b+c}$** *(первичная, бесвычитательная, `NC-01`)*; $r = \frac{a+b-c}{2}$ *(только как алгебраическое следствие в доказательствах)* | `inradiusR` | Устраняет потерю значащих цифр при малых углах в представлении и расчёте. |
| *(Отсутствует в явном виде)* | — | **$S = \frac{ab}{2} = pr$** *(площадь $\triangle ABC$)*; **$P = a+b+c$**; **$p = \frac{a+b+c}{2}$** | `triangleAreaS`, `perimeterP`, `semiperimeterP` | $P$ — полный периметр, $p$ — полупериметр; $S = pr$ доказывается разбиением на $S_A, S_B, S_C$. |
| `S_a, S_b, S_c` *(площади подтреугольников в Эксп. 06)* | `ArcSideAreaPanel`, `arcSideAreaCorrespondence` | **$S_A = \operatorname{Area}(\triangle BCI) = \frac{ar}{2}$**, **$S_B = \operatorname{Area}(\triangle CAI) = \frac{br}{2}$**, **$S_C = \operatorname{Area}(\triangle ABI) = \frac{cr}{2}$** | `subtriangleAreaSA`, `subtriangleAreaSB`, `subtriangleAreaSC` | **Разбиение через инцентр:** соединение $I$ с $A, B, C$ даёт 3 треугольника с одинаковой высотой $r$. $S_A+S_B+S_C = \frac{(a+b+c)r}{2} = pr$. |
| `T_a(OA)`, `T_b(OB)`, `T_c(AB)`, `T_OA`, `T_OB`, `T_AB` | `FourCirclesView`, `FourCirclesPanel`, `IncircleArc*`, `ArcSideArea*` | **$T_a = (r, 0) \in BC$**, **$T_b = (0, r) \in AC$**, **$T_c \in AB$** | `tangencyTa`, `tangencyTb`, `tangencyTc` | При `vertex_preserving` $T_a$ лежит на горизонтальном катете $BC$, $T_b$ — на вертикальном $AC$. |
| *(Не выделены явно, иногда `t_A, t_B`)* | `arcSideAreaCorrespondence.ts:78` | **$\tau_A = p - a$**, **$\tau_B = p - b$**, **$\tau_C = p - c = r$** | `tangentSegA`, `tangentSegB`, `tangentSegC` | **Решение Д-5:** символ $\tau$ отделяет длины касательных от точек $T_a, T_b, T_c$ и параметра $\rho$. |

### 2.6. Дуги, углы и доли распределения на $K_i$

| Legacy UI | Источник Legacy | New Canonical UI | Код-идентификатор (`src/canonical`) | Примечание |
| :--- | :--- | :--- | :--- | :--- |
| `φ` (`phiDeg`) в Эксп. 02; `α = ∠B` в Эксп. 04–06; `L = r·α` в `EXP-03` | `ArcClassification*`, `ArcAngle*`, `IncircleArc*`, `ArcSideArea*`, `STAGE_5_2_3` §3 | **$\beta = \angle B$** *(полярный угол касательной $T_c$ на $K_i$ от северного полюса $N=(r,2r)$ по часовой к $E=(2r,r)$)*, $L = r\beta_{\text{rad}}$ | `tangentPolarFromNorthDeg`, `betaDeg` | **Уточнение №6:** старые формулы `EXP-03` через `α` в новый UI не переносятся. |
| `θ = 2φ` *(в Эксп. 02)* | `ArcClassificationPanel` | **$\theta = 2\beta$** *(параметр Эксп. 02 на удвоенной дуге)* | `doublePolarAngleThetaDeg` | Чётко маркируется как удвоенный полярный угол (не угол треугольника). |
| `φ_A = 90° + α`, `φ_B = 180° − α`, `φ_C = 90°` | `IncircleArcDistributionPanel` | **$\varphi_A = 180^\circ - \alpha$**, **$\varphi_B = 180^\circ - \beta$**, **$\varphi_C = 90^\circ$** | `arcCentralAnglePhiA`, `arcCentralAnglePhiB`, `arcCentralAnglePhiC` | Сумма $\varphi_A + \varphi_B + \varphi_C = 360^\circ$. |
| `L_A, L_B, L_C` | `IncircleArcDistributionPanel`, `ArcSideAreaPanel` | **$L_A = r\varphi_A^{\text{rad}}$**, **$L_B = r\varphi_B^{\text{rad}}$**, **$L_C = r\varphi_C^{\text{rad}}$** | `arcLengthLA`, `arcLengthLB`, `arcLengthLC` | Сумма $L_A + L_B + L_C = C_i = 2\pi r$. |
| `s_A, s_B, s_C` *(доли дуг)* | `IncircleArcDistributionPanel` | **$w^{\text{arc}}_A = \frac{\varphi_A}{360^\circ}$**, **$w^{\text{arc}}_B = \frac{\varphi_B}{360^\circ}$**, **$w^{\text{arc}}_C = \frac{1}{4}$** | `arcShareA`, `arcShareB`, `arcShareC` | Убирается строчная `s_X`, путаемая с площадью $S_X$. |
| `w_a, w_b, w_c`, `w_area≡w_side (a/b/c)`, `w_C = w_b = 25%` | `ArcSideAreaPanel`, `arcSideAreaCorrespondence` | **$w^{\text{area}}_A = w^{\text{side}}_A = \frac{a}{P}$**, **$w^{\text{area}}_B = w^{\text{side}}_B = \frac{b}{P}$**, **$w^{\text{area}}_C = w^{\text{side}}_C = \frac{c}{P}$** | `areaShareA`, `areaShareB`, `areaShareC` | **Решение Д-3:** заглавные индексы `A, B, C` + явное указание неравенства $w^{\text{arc}}_X \neq w^{\text{area}}_X$. |
| *(Не выведены как символы в UI)* | `NOTATION_MIGRATION_MAP` | **$\psi_A = \frac{\alpha}{2}$**, **$\psi_B = \frac{\beta}{2}$**, **$\psi_C = 45^\circ$** *(половинные углы при биссектрисах)* | `bisectorHalfAnglePsiA`.. | Опциональное отображение при показе биссектрис в инцентре. |

### 2.7. Эпистемическая маркировка, домен `Stage 5.2.3` и политика Legacy-архива

> **Уточнение №10:** Математические результаты и исторические эксперименты **не удаляются из Legacy-архива**, однако все неподтверждённые (`UNPROVEN_HYPOTHESIS`), некорректные и опровергнутые (`REFUTED`) утверждения **строго исключаются из нового Canonical UI**.

| Legacy UI | Источник | Статус по `MATHEMATICAL_RESULT_CLASSIFICATION` / `STAGE_5_2_3` | Действие в новом Canonical UI |
| :--- | :--- | :--- | :--- |
| `L_max = πr/2` *(«Предел ёмкости четверти дуги»)* | `ArcClassificationPanel:68, 212`, `ArcAngleAnalysisPanel` | **`REFUTED`** *(гипотеза предела ёмкости опровергнута)* | **Исключить из нового UI** термин «предел ёмкости» и символ `L_max`. Длину четверти $K_i$ обозначать строго как **$L_{\pi/2} = \frac{\pi r}{2} = \frac{C_i}{4}$** (либо **$L_{\text{quarter}}$**). |
| Неподтверждённые гипотезы Эксп. 04 (`E-03..E-05`), ошибочная преамбульная формула Эксп. 01, ложное равенство `w_arc = w_area` | `EXP-01`, `EXP-04`, `EXP-06` | **`UNPROVEN_HYPOTHESIS`** / **`REFUTED`** | **Не включать в новый Canonical UI**; в Эксп. 06 показывать доказанное различие $w^{\text{arc}}_X \neq w^{\text{area}}_X$ и точный дефект $\Delta_X$. |
| Границы «рабочего домена» `[0.5, 15]` / `[0.1, 150]` без `AND`-пересечения по $\rho$ и катетам | `ArcAngleAnalysisPanel`, `ControlsPanel` | **`STAGE_5_2_3`** *(правило одновременного пересечения `AND`)* | Унифицировать статус конфигурации по `STAGE_5_2_3`:<br>• **Level 1 (`IN_LEVEL_1_VISUAL`):** $0.5 \le \text{sideA}, \text{sideB} \le 15.0$ **И** $\frac{1}{24} \le \rho \le 24.0$ *(отсюда $2.386^\circ \le \alpha, \beta \le 87.614^\circ$, $0.1414 \le \lambda \le 4.2426$)*;<br>• **Level 2 (`IN_LEVEL_2_RESEARCH`):** $0.1 \le \text{sideA}, \text{sideB} \le 150.0$ **И** $0.01 \le \rho \le 100.0$ *(отсюда $0.573^\circ \le \alpha, \beta \le 89.427^\circ$, $0.0283 \le \lambda \le 42.4264$)*. |

---

## 3. Единый канонический словарь интерфейса и правила форматирования

### 3.1. Правила разграничения классов величин (Zero-Conflation Rules)

1. **Правило 1 — Геометрический объект $\neq$ его скалярные меры:**
   - Окружности носят имена **$K_a, K_b, K_c, K_i, K_o$** (их центры — **$O_a, O_b, O_c, O_o$** и инцентр **$I$**).
   - Квадраты носят имена **$Q_a, Q_b, Q_c$**.
   - Числовые площади всегда пишутся с явным оператором площади **$\operatorname{Area}(\cdot)$** (в формулах KaTeX, таблицах, карточках и hover-инспекторе) либо в виде алгебраической меры стороны:
     - Площадь квадрата: **$\operatorname{Area}(Q_a) = a^2$**, **$\operatorname{Area}(Q_b) = b^2$**, **$\operatorname{Area}(Q_c) = c^2$** *(никогда не $S_a$ и не $Q_a = 16$)*.
     - Площадь круга: **$\operatorname{Area}(K_a) = \frac{\pi a^2}{4}$**, **$\operatorname{Area}(K_i) = \pi r^2$**, **$\operatorname{Area}(K_o) = \frac{\pi c^2}{4}$** *(никогда не обозначать площадь одним символом $K_x$)*.
     - Главное тождество и контраст площадей (**Решение Д-2**):
       $$\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$$
       $$\operatorname{Area}(K_a) + \operatorname{Area}(K_b) = \operatorname{Area}(K_c), \qquad \operatorname{Area}(K_a) + \operatorname{Area}(K_b) - \operatorname{Area}(K_c) - \operatorname{Area}(K_i) = -\operatorname{Area}(K_i) < 0$$
     - Длины окружностей: строго **$C_a, C_b, C_c, C_i, C_o$** *(никогда не $P_x$ и не $L_x$)*.
2. **Правило 2 — Периметр vs полупериметр vs длина окружности:**
   - **$P = a + b + c$** — полный периметр $\triangle ABC$.
   - **$p = \frac{a + b + c}{2}$** — полупериметр $\triangle ABC$.
   - **$C_x$** ($x \in \{a, b, c, i, o\}$) — длина окружности $K_x$.
3. **Правило 3 — Заглавные индексы ($A, B, C$) vs строчные ($a, b, c$):**
   - Строчные индексы $a, b, c$ относятся к **сторонам** треугольника, внешним **квадратам** ($Q_a, Q_b, Q_c$), внешним **окружностям** ($K_a, K_b, K_c$), их **центрам** ($O_a, O_b, O_c$) и **точкам касания** на сторонах ($T_a, T_b, T_c$).
   - Заглавные индексы $A, B, C$ относятся к **вершинам**, внутренним **подтреугольникам** ($S_A, S_B, S_C$), **дугам и центральным углам** на $K_i$ ($\varphi_A, \varphi_B, \varphi_C$, $L_A, L_B, L_C$), **долям** ($w^{\text{arc}}_A, w^{\text{area}}_A$), **биссектрисным углам** ($\psi_A, \psi_B, \psi_C$) и **длинам касательных** от вершин ($\tau_A, \tau_B, \tau_C$).
4. **Правило 4 — Углы ($\alpha, \beta, \gamma, \varphi_X, \psi_X, \theta$):**
   - Внутри $\triangle ABC$ задействованы только $\alpha = \angle A$, $\beta = \angle B$, $\gamma = \angle C = 90^\circ$.
   - Полярный угол касания $T_c$ на $K_i$ от северной точки $N=(r, 2r)$ к восточной $E=(2r, r)$ равен $\beta$.
   - $\varphi_A, \varphi_B, \varphi_C$ — центральные углы дуг вписанной окружности $K_i$.
   - $\theta = 2\beta$ — исключительно удвоенный полярный параметр в Эксп. 02.
   - $\psi_A, \psi_B, \psi_C$ — половинные углы $\alpha/2, \beta/2, 45^\circ$.
5. **Правило 5 — Геометрическая эквивалентность $K_c \equiv K_o$ и три категории нотационных совпадений (Collision vs Alias vs Identity):**
   - **Коллизия обозначений (`notation collision`):** недопустимый конфликт, когда один и тот же символ ошибочно присваивается принципиально разным математическим объектам или мерам (например, $P$ одновременно для периметра треугольника и длины окружности, $S$ одновременно для подтреугольника и площади квадрата, $a$ для двух разных катетов). Это ошибка, которая должна строго блокироваться автоматическими тестами словаря.
   - **Семантический псевдоним (`semantic alias`):** допустимое использование различных контекстных форм представления одной и той же сущности для разных сред вывода (например, `tangencyAB` во внутреннем коде vs $T_c$ в UI; нотация KaTeX `\tau_A` vs SVG `τ_A` vs plain `tau_A`).
   - **Геометрическая эквивалентность (`geometric identity`):** совпадение двух геометрических объектов, построенных из различных конструктивных соображений, но обладающих абсолютно тождественным положением на плоскости и одинаковыми метрическими характеристиками:
     $$K_c \equiv K_o \iff O_c = O_o = \left(\frac{a}{2}, \frac{b}{2}\right), \quad R_c = R_o = \frac{c}{2}, \quad \operatorname{Area}(K_c) = \operatorname{Area}(K_o) = \frac{\pi c^2}{4}, \quad C_c = C_o = \pi c$$
     В геометрии прямоугольного треугольника окружность $K_c$ (вписанная в квадрат $Q_c$ на гипотенузе) и окружность $K_o$ (описанная около $\triangle ABC$) физически совпадают по теореме Фалеса. Оба символа $K_c$ и $K_o$ **сохраняются в словаре как две различные конструктивные роли / контекста одного геометрического объекта**. Автоматические тесты уникальности реестра на Шаге 1 должны строго отличать геометрическую эквивалентность от нотационной коллизии и НЕ браковать совпадение параметров $K_c$ и $K_o$ как ошибку.

### 3.2. Таблица форматов отображения для 4 целевых сред UI

| Сущность (`MathEntityId`) | KaTeX (формулы) | SVG / Canvas (короткая метка) | Таблицы и карточки (заголовок / символ) | Hover-инспектор (строка деталей) |
| :--- | :--- | :--- | :--- | :--- |
| Вершины треугольника | $C, A, B$ | `C (0,0)`, `A`, `B` | `C(0,0)`, `A`, `B` | `Вершина C = (0, 0) · ∠C = γ = 90°` |
| Стороны треугольника | $a, b, c$ | `a = ...`, `b = ...`, `c = ...` | `a = |BC|`, `b = |AC|`, `c = |AB|` | `Катет a = |BC| = ...` |
| Острые и прямой углы | $\alpha, \beta, \gamma$ | `α=..°`, `β=..°`, `90°` | `α = ∠A`, `β = ∠B`, `γ = 90°` | `Угол α при A = ...°` |
| Форма и масштаб | $\rho = \frac{a}{b}$, $\lambda = \frac{c}{5}$ | `ρ = ...`, `λ = ...` | `ρ = a / b`, `λ = c / 5` | `Отношение катетов ρ = a/b = ...` |
| Внешние квадраты | $Q_a, Q_b, Q_c$; $\operatorname{Area}(Q_x)$ | `Q_a`, `Q_b`, `Q_c` | `Q_a`, `Area(Q_a) = a²`, `4a` | `Квадрат Q_a на BC · сторона a = ... · Area(Q_a) = ...` |
| Окружности и их центры | $K_a..K_o$; $O_a..O_o$ | `K_a..K_o`, `O_a..O_o` | `K_a`, `O_a` | `Окружность K_a · центр O_a = (..., ...)` |
| Меры пяти окружностей | $d_x, R_x, C_x, \operatorname{Area}(K_x)$ | `d_a..D_o`, `R_a..R_o`, `C_a..C_o` | `d_a`, `R_a`, `C_a`, `Area(K_a)`, `√Area(K_a)` | `K_a · d_a = ... · C_a = ... · Area(K_a) = ...` |
| Радиус и инцентр | $I = (r, r)$, $r = \frac{ab}{a+b+c}$ | `I`, `r = ...` | `r = ab/(a+b+c)` | `Инцентр I = (r, r) · r = ...` |
| Подтреугольники и площадь | $S_A, S_B, S_C$, $S$, $P$, $p$ | `S_A`, `S_B`, `S_C` | `S_A = Area(△IBC)`, `S`, `P`, `p` | `Подтреугольник △IBC · S_A = ar/2 = ...` |
| Точки и отрезки касания | $T_a, T_b, T_c$; $\tau_A, \tau_B, \tau_C$ | `T_a`, `T_b`, `T_c` | `T_a ∈ BC`, `τ_A = p − a` | `Точка касания T_a ∈ BC = (..., ...) · τ_B = ...` |
| Дуги и доли на $K_i$ | $\varphi_X, L_X, w^{\text{arc}}_X, w^{\text{area}}_X$ | `φ_A`, `L_A` | `φ_A (°)`, `L_A`, `w_arc(A)`, `w_area(A)` | `Дуга напротив A: φ_A = ...° · L_A = ... · w_arc = ...%` |

### 3.3. Правила оформления графиков, осей и таблиц

1. **Оси спектральных графиков (`SpectralAnalysisPanel` и аналоги):**
   - Независимая ось: **$\rho = a / b$** *(логарифмическая или линейная сетка; нормировка $b^* = 1, a^* = \rho$ по `src/canonical/semanticContract.ts`)*.
   - Ось долей длин окружностей: **$C_x / C_c$** *(вместо `P_x / P_c`)*.
   - Ось долей площадей окружностей: **$\operatorname{Area}(K_x) / \operatorname{Area}(K_c)$** *(без использования голого `K_x / K_c`)*.
2. **Легенды серий данных:** каждая серия начинается с точного канонического символа, затем в скобках или через тире даётся краткая локализованная расшифровка: например, `C_i / C_c (вписанная / гипотенузная)`, `Area(K_i) / Area(K_c)`.
3. **Заголовки таблиц:** в заголовке колонки указываются символ и единица/размерность, например: `φ_X (°)`, `L_X (ед.)`, `w_arc (%)`, `w_area = w_side (%)`. Использование косых черт вроде `a/b/c` в значении индексов A/B/C запрещено — применяется `X ∈ {A, B, C}` или `X ∈ {a, b, c}`.

---

## 4. Архитектура будущего слоя `Semantic Notation Layer` (Design Only)

> **Ограничение этапа и архитектурная граница (Уточнение №9):**  
> Ниже описана только целевая архитектура и концептуальные контракты. На этапе планирования файлы в `src/` не создаются и не изменяются.  
> **`Semantic Notation Layer` является исключительно единым источником пользовательских математических обозначений, формульных представлений и семантических связей UI — он НЕ выполняет вычислительную математику и НЕ подменяет `Canonical Mathematical Core` (`src/canonical/*`).**

### 4.1. Принципиальная схема слоёв

```
[Canonical Mathematical Core: src/canonical/*]
  (Единственный источник геометрических сущностей, свойств, численных значений, инвариантов и домена Stage 5.2.3)
        │  передаёт вычисленные величины и статусы (только чтение в UI)
        ▼
[Semantic Notation Layer]  (Словарь-посредник пользовательских обозначений — не подменяет математическое ядро!)
  ├── MathEntityId              (Закрытый перечень всех сущностей, строго отделяющий объект от его мер)
  ├── SemanticNotationRegistry  (Единый реестр: символы KaTeX/SVG/plain, роль, нормативная ссылка, запреты Legacy)
  ├── NotationFormatters        (Форматирование в: 'katex' | 'svg' | 'plain' | 'tableHeader' | 'formulaDef')
  └── NotationInterpolator      (Подстановка канонических символов в локализованные шаблоны RU/UK/EN)
        │
        ▼
[src/i18n/translations.ts]  (Только естественный язык — без захардкоженных формул и имён вершин!)
        │
        ▼
[UI Components: geometry/*, panels/*, common/*]  (Запрет ad-hoc символов вне реестра)
```

### 4.2. Концептуальные интерфейсы и контракты (TypeScript Design Spec)

```typescript
// Концептуальный контракт (только проектирование, не для записи в src/ на этом этапе)

export type MathEntityCategory =
  | 'vertex'
  | 'side'
  | 'angle'
  | 'shape_scale'
  | 'square'
  | 'circle'
  | 'circle_measure'
  | 'incenter_partition'
  | 'arc_distribution'
  | 'epistemic_metric';

export type MathEntityId =
  // 1. Вершины, стороны, углы
  | 'vertex.A' | 'vertex.B' | 'vertex.C' | 'triangle.ABC'
  | 'side.a' | 'side.b' | 'side.c'
  | 'angle.alpha' | 'angle.beta' | 'angle.gamma'
  // 2. Форма и масштаб
  | 'param.rho' | 'param.lambda'
  // 3. Внешние квадраты
  | 'square.Qa' | 'square.Qb' | 'square.Qc'
  | 'area.Qa' | 'area.Qb' | 'area.Qc'
  | 'perim.Qa' | 'perim.Qb' | 'perim.Qc'
  // 4. Пять окружностей и меры
  | 'circle.Ka' | 'circle.Kb' | 'circle.Kc' | 'circle.Ki' | 'circle.Ko'
  | 'center.Ka' | 'center.Kb' | 'center.Kc' | 'center.Ko'
  | 'radius.Ra' | 'radius.Rb' | 'radius.Rc' | 'radius.r' | 'radius.Ro'
  | 'diameter.da' | 'diameter.db' | 'diameter.dc' | 'diameter.di' | 'diameter.Do'
  | 'circumference.Ca' | 'circumference.Cb' | 'circumference.Cc' | 'circumference.Ci' | 'circumference.Co'
  | 'area.Ka' | 'area.Kb' | 'area.Kc' | 'area.Ki' | 'area.Ko'
  // 5. Инцентр и разбиение
  | 'incenter.I'
  | 'measure.S' | 'measure.P' | 'measure.p'
  | 'subtriangle.SA' | 'subtriangle.SB' | 'subtriangle.SC'
  | 'tangency.Ta' | 'tangency.Tb' | 'tangency.Tc'
  | 'tangentSeg.A' | 'tangentSeg.B' | 'tangentSeg.C'
  // 6. Дуги и полярные углы
  | 'angle.polarBeta' | 'angle.doubleTheta'
  | 'arcAngle.phiA' | 'arcAngle.phiB' | 'arcAngle.phiC'
  | 'arcLength.LA' | 'arcLength.LB' | 'arcLength.LC' | 'arcLength.quarterPiR2'
  | 'share.arcA' | 'share.arcB' | 'share.arcC'
  | 'share.areaA' | 'share.areaB' | 'share.areaC'
  | 'bisectorAngle.psiA' | 'bisectorAngle.psiB' | 'bisectorAngle.psiC';

export type NotationRenderTarget =
  | 'katex'       // Строка для MathFormula (KaTeX)
  | 'svg'         // Короткая подпись на <text> в SVG (ASCII/Unicode без LaTeX-слэшей)
  | 'plain'       // Моноширинный текст в hover / таблицах значений / экспорте
  | 'tableHeader' // Компактный заголовок колонки
  | 'formulaDef'; // Каноническая определяющая формула (напр. r = ab / (a+b+c))

export type EntitySemanticRelation =
  | 'distinct'            // Независимая математическая сущность
  | 'geometric_identity' // Геометрическое тождество (напр. Kc ≡ Ko)
  | 'semantic_alias';    // Семантический алиас отображения

export interface SemanticEntitySpec {
  readonly id: MathEntityId;
  readonly category: MathEntityCategory;
  readonly symbols: Record<NotationRenderTarget, string>;
  readonly normativeRef: string; // напр. 'MATHEMATICAL_NOTATION_STANDARD#2.3'
  readonly forbiddenLegacyAliases: readonly string[];
  readonly isObjectVsMeasure: 'object' | 'scalar_measure' | 'parameter';
  readonly semanticRelation?: EntitySemanticRelation;
  readonly geometricIdentityOf?: MathEntityId; // Ссылка на эквивалентную сущность (напр. circle.Ko -> circle.Kc)
  readonly constructiveRole?: string;          // Конструктивное происхождение (напр. 'вписанная в квадрат Qc' vs 'описанная около △ABC')
}

export interface NotationContext {
  readonly lang: 'ru' | 'uk' | 'en';
  readonly displayMode: 'school' | 'research';
  readonly orientation: 'vertex_preserving';
}

export interface NotationFormatter {
  symbol(id: MathEntityId, target: NotationRenderTarget): string;
  labelWithValue(id: MathEntityId, value: number, digits?: number, target?: NotationRenderTarget): string;
  pointCoord(id: MathEntityId, x: number, y: number, digits?: number): string;
  hoverSummary(id: MathEntityId, ctx: NotationContext, metrics: Record<string, number>): {
    title: string;
    details: string;
  };
}
```

### 4.3. Разделение символьной нотации и языковой локализации (`RU / UK / EN`)

1. **`translations.ts` больше не хранит математические символы вперемешку с текстом** (никаких `Вершина O`, `на OA`, `S_a`, `α = ∠B` внутри языковых словарей).
2. Текстовые шаблоны локализации используют **именованные семантические плейсхолдеры**, например:
   - Было: `'Угол при B: α = {deg}°, при A: 90° - α'`
   - Станет: `'{{angle.beta.name}} ({{angle.beta.sym}} = {betaDeg}°), {{angle.alpha.name}} ({{angle.alpha.sym}} = {alphaDeg}°)'`
3. Функция-интерполятор (`formatLocalizedTemplate(templateKey, ctx)`) подставляет имя сущности на нужном языке (`ru`/`uk`/`en`) и её точный символ из `SemanticNotationRegistry` согласно `NotationRenderTarget`.
4. **Предотвращение появления ad-hoc символов в компонентах:**
   - Вводится статическая проверка (ESLint rule / Vitest-тест по AST и regex на `src/components/`), запрещающая литералы `O (0,0)`, `△OAB`, `∠AOB`, `P_a`, `P_b`, `P_c`, `P_i`, `L_o`, `L_max`, `S_a`, `S_b`, `S_c`, `T_OA`, `T_OB`, `T_AB`, `s_A`, `s_B`, `s_C` в JSX-разметке и в `copy`-словарях.
   - Локальные `copy`-объекты в 4 панелях и 4 оверлеях Эксп. 02–06 расформировываются и переносятся в `src/i18n/translations.ts`.

---

## 5. Карта затрагиваемых UI-компонентов и текстовых источников

Ниже перечислены все файлы UI, локализации, визуальных данных и валидации, содержащие пользовательскую математическую нотацию.

| Файл | Зафиксированные Legacy-обозначения | Объём и характер изменений |
| :--- | :--- | :--- |
| `index.html`, `metadata.json` | «Pythagoras-Circles-Lab», «Пифагоровы штаны», old title/description | Согласование метаданных названия/описания с каноническим именем стенда *(с учётом ограничения среды на `metadata.json` после первого хода — проверить допустимость правки с пользователем)*. |
| `src/App.tsx` | `arcPhiDeg` (смешение φ/α), имена файлов экспорта `four_circles_a${a}_b${b}.svg/png` | Использование канонической переменной полярного угла $\beta$, обновление имён экспортируемых файлов (`sideA`, `sideB`, `rho`). |
| `src/i18n/translations.ts` | `O`, `OAB`, `OA`, `OB`, `T_a(OA)`, `T_b(OB)`, `P_x`, `L_o`, `(a+b-c)/2`, `O_o = (b/2, a/2)`, старые заголовки модулей | Очистка всех 3 языков (`ru`, `uk`, `en`) от захардкоженной старой нотации; вливание текстов из 8 `copy`-словарей Эксп. 02–06. |
| `src/math/presets.ts` | Пресеты `a = 4, b = 3` (по вертикальному `a` и горизонтальному `b`), описания с `(a+b-c)/2` | Перепривязка пресетов к каноническим `sideA`, `sideB`, `rho`, `lambda`; актуализация описаний. |
| `src/components/common/Header.tsx` | Заголовки вкладок и навигации модулей (`t.modules.*`) | Обновление названий модулей (через i18n + Semantic Layer). |
| `src/components/common/BottomToolbar.tsx` | Имена конфигов `a=..., b=...`, файл `four_circles_a..._b....json`, `STORAGE_KEY` | Формат имён сохранений/экспорта по `sideA, sideB, rho` + совместимость загрузки старых конфигов. |
| `src/components/common/MetricCard.tsx`, `MathFormula.tsx` | Универсальные рендеры (чистые) | Добавление опциональной поддержки `MathEntityId` (при желании) без ломки KaTeX-рендера. |
| `src/components/geometry/CoordinateGrid.tsx` | `O (0,0)` (строка 140) | Замена подписи начала координат на `C (0,0)` (или скрытие буквы `O` и делегирование подписи `C` в `RightTriangleView`). |
| `src/components/geometry/GeometryBoard.tsx` | `vertex-O`, перетаскивание `A` по `Y` и `B` по `X`, `T_AB` (`atan2(dx,dy)`), hover-строки | Обновление меток вершин `C, A, B`, привязка перетаскивания к принятой ориентации `vertex_preserving` (`A=(0, sideB)` на `+Oy`, `B=(sideA, 0)` на `+Ox`), унификация hover-формата. |
| `src/components/geometry/RightTriangleView.tsx` | `△OAB`, `∠AOB = 90°`, `a` на `OA`, `b` на `OB`, угол `∠O`, подписи углов | Подписи вершин `C, A, B`, катетов `a = |BC|` (горизонтальный), `b = |AC|` (вертикальный), углов `α = ∠A`, `β = ∠B`, `γ = 90°`. |
| `src/components/geometry/FourCirclesView.tsx` | `Q_a, K_a` на `OA`, `Q_b, K_b` на `OB`, `T_a=(0,r)`, `T_b=(r,0)`, `O_a..O_o`, `L_o`, `r=(a+b-c)/2`, `K_a = area` | Перенос `Q_a, K_a` на горизонтальный катет $a=BC$ и `Q_b, K_b` на вертикальный $b=AC$; корректные `T_a=(r,0) ∈ BC`, `T_b=(0,r) ∈ AC`, `T_c ∈ AB`; сохранение центров `O_a..O_o`; замена `L_o → C_o`, `d → d_a/d_b/d_c`, `r = ab/(a+b+c)`; строго `Area(K_x)` для площадей. |
| `src/components/geometry/InteractivePoint.tsx` | Hover-текст перетаскиваемых вершин `A, B` | Обновление координат и формулировок на `C, A, B` и `sideA / sideB`. |
| `src/components/geometry/ArcClassificationBoardOverlay.tsx` | Локальный `copy`, `φ`, `θ=2φ`, `t=b/a`, `L_max=πr/2`, старые оси треугольника | Полная миграция на `β`, `θ=2β`, `ρ=a/b`, $L_{\pi/2}$, удаление `copy` и `L_max`. |
| `src/components/geometry/ArcAngleBoardOverlay.tsx` | Локальный `copy`, `α=∠B`, `∠A=90°−α`, `L=r·α`, `T_AB` | Миграция на `β=∠B`, `α=∠A`, `L=r·β_rad`, `T_c`, удаление `copy`. |
| `src/components/geometry/IncircleArcDistributionOverlay.tsx` | Локальный `copy`, `α=∠B`, `φ_A=90°+α`, `s_A/s_B/s_C`, `T_OA/T_OB/T_AB` | Миграция на `β`, `φ_A=180°−α`, `φ_B=180°−β`, `w_arc(A/B/C)`, `T_a, T_b, T_c`, удаление `copy`. |
| `src/components/geometry/ArcSideAreaBoardOverlay.tsx` | Локальный `copy`, `α=∠B`, `S_a/S_b/S_c`, `w_a/w_b/w_c`, `T_OA/T_OB/T_AB` | Миграция на `β`, `S_A/S_B/S_C`, `w_area(A/B/C)`, `T_a, T_b, T_c`, удаление `copy`. |
| `src/components/panels/ControlsPanel.tsx` | `a (OA)`, `b (OB)`, `a = b = 4`, кнопка `3-4-5` (`a=4,b=3`), `targetT = a/b` | Привязка слайдеров и пресетов к `a = |BC|` (`sideA`), `b = |AC|` (`sideB`), явное отображение `ρ = a/b` и `λ = c/5`, индикация домена по `STAGE_5_2_3`. |
| `src/components/panels/FourCirclesPanel.tsx` | `r = (a+b-c)/2`, `T_a(OA)`, `T_b(OB)`, `O_a..O_o`, `d = ...`, `K_a + K_b = K_c`, `\sqrt{K_a}` | Первичная формула $r = \frac{ab}{a+b+c}$, канонические `d_a..D_o`, `T_a..T_c`, `O_a..O_o`, строгое `Area(K_x)` в тождестве $\sqrt{\operatorname{Area}(K_a)} + \dots$ и контрасте **по решению Д-2**. |
| `src/components/panels/KcVsKoComparison.tsx` | `L_c`, `L_o`, `O_c`, `O_o`, `K_c = area`, подписи вершин `O, A, B` | Замена `L_c → C_c`, `L_o → C_o`, `K_x → Area(K_x)`, `O, A, B → C, A, B`; сохранение центров `O_c`, `O_o`. |
| `src/components/panels/InvariantsPanel.tsx` | Напрямую рендерит строки из `ThalesValidators` / `translations` | Адаптация под обновлённый слой валидаторов и i18n. |
| `src/components/panels/ThalesCircumcirclePanel.tsx` | `OAB`, `P_c, P_o`, `L_c, L_o`, `O_o = (b/2, a/2)`, `|O_o-O_c| = c/2` | Замена `OAB → ABC`, `P_x/L_x → C_x`, `O_o = (a/2, b/2)` по `vertex_preserving`, строго `Area(K_c) = Area(K_o)`. |
| `src/components/panels/SpectralAnalysisPanel.tsx` | `t = b/a` ($a_{\text{norm}}=1$), `P_a..P_i`, `P_x/P_c`, `S_c`, ~15 захардкоженных русских блоков без i18n | Переход на `ρ = a/b` ($b^*=1, a^*=\rho$), замена `P_x → C_x`, `K_x/K_c → Area(K_x)/Area(K_c)`, удаление `S_c`, полная локализация. |
| `src/components/panels/ArcClassificationPanel.tsx` | Локальный `copy`, `φ`, `θ=2φ`, `t=b/a`, `L_max=πr/2` | Переход на `β`, `θ=2β`, `ρ`, $L_{\pi/2}$; полное удаление опровергнутой гипотезы `L_max` из нового UI. |
| `src/components/panels/ArcAngleAnalysisPanel.tsx` | Локальный `copy`, `α=∠B`, `t=b/a=cot α=tan A`, доменные предупреждения вне `STAGE_5_2_3` | Переход на `β=∠B`, `α=∠A`, `ρ=a/b=tan α=cot β`, строгие границы `STAGE_5_2_3` (`AND`-пересечение) и исключение `E-03..E-05`. |
| `src/components/panels/IncircleArcDistributionPanel.tsx` | Локальный `copy`, `α=∠B`, `φ_A=90°+α`, `s_A/s_B/s_C`, `T_OA/T_OB/T_AB` | Переход на `β`, `φ_A=180°−α`, `φ_B=180°−β`, `w_arc(A/B/C)`, `T_a/T_b/T_c`. |
| `src/components/panels/ArcSideAreaPanel.tsx` | Локальный `copy`, `α=∠B`, `a=|OB|, b=|OA|`, `S_a/S_b/S_c`, `w_a/w_b/w_c`, `w_area≡w_side (a/b/c)` | Ликвидация перестановки `a/b`, переход на `S_A/S_B/S_C`, `w_area(A/B/C)`, `τ_A, τ_B, τ_C`, `T_a/T_b/T_c`. |
| `src/components/panels/HelpModal.tsx`, `ComparisonModal.tsx`, `TestRunnerModal.tsx` | `OAB`, `(a+b-c)/2`, `O_o=(b/2,a/2)`, `(3,4,5)` по старым катетам, `\sqrt{K_a}` | Обновление справочных формул ($\sqrt{\operatorname{Area}(K_a)}+\dots$), модальных таблиц и тестовых кейсов на `ABC`, `sideA/sideB`, `r = ab/(a+b+c)`. |
| `src/math/FourCirclesValidators.ts`, `ThalesValidators.ts`, `arcSideAreaCorrespondence.ts` | Строки формул и описаний для UI (`Q_a=a^2`, `P_a`, `L_o`, `OAB`, `S_a/S_b/S_c`, `t_A, t_B`, `w_C=w_b=25%`) | Обновление текстовых паспортов/строк законов (L-01..L-08) и инвариантов на `Area(Q_x)`, `Area(K_x)`, `τ_A..τ_C`, `S_A..S_C`; исправление опечатки `w_C = w_b = 25%`. |

---

## 6. Последовательность этапов миграции (10 шагов)

Последовательность выстроена от фундаментального словаря к геометрии сцены, затем к панелям/графикам, локализации и финальной проверке коллизий.

### Шаг 1. Создание канонического словаря сущностей (`Semantic Notation Layer`)
- **Цель:** Реализовать `MathEntityId`, `SemanticNotationRegistry`, `NotationFormatter` и unit-тесты словаря как единый источник пользовательских математических обозначений (без подмены расчётного слоя `Canonical Mathematical Core`).
- **Компоненты / файлы:** новый модуль `src/notation/` (или `src/canonical/notation/`) и его unit-тесты, связь с `src/canonical/types.ts` и `semanticContract.ts`.
- **Нормативные документы:** `MATHEMATICAL_NOTATION_STANDARD.md`, `CANONICAL_SEMANTIC_CONTRACT.md`, `NOTATION_MIGRATION_MAP.md`.
- **Зависимости:** Все 5 нотационных решений и 5 уточнений этапа 2.1 (Раздел 8.2) приняты и разблокируют немедленную реализацию после согласования настоящего плана.
- **Критерий проверки:** 100% покрытие всех `MathEntityId` в 5 форматах (`katex`, `svg`, `plain`, `tableHeader`, `formulaDef`); unit-тест уникальности символов с разграничением трёх категорий:
  1) выявление и блокировка реальных коллизий обозначений (`notation collision` между объектами, площадями `Area`, длинами `C_x`, центрами `O_x`, точками касания `T_x` и касательными `τ_X`);
  2) валидация семантических псевдонимов (`semantic alias`);
  3) распознавание и допуск доказанной геометрической эквивалентности $K_c \equiv K_o$ ($O_c = O_o, R_c = R_o, \operatorname{Area}(K_c) = \operatorname{Area}(K_o), C_c = C_o$) без ложного срабатывания теста на коллизию.

### Шаг 2. Миграция базовых подписей сцены (координатная сетка, холст, HUD)
- **Цель:** Заменить `O (0,0)` на `C (0,0)`, зафиксировать оси ориентации `vertex_preserving` ($A \in +Oy$, $B \in +Ox$), обновить идентификаторы интерактивных точек и формат строк hover-инспектора и нижней панели.
- **Компоненты:** `CoordinateGrid.tsx`, `GeometryBoard.tsx`, `InteractivePoint.tsx`, `BottomToolbar.tsx`, `App.tsx`.
- **Нормативные документы:** `CANONICAL_SEMANTIC_CONTRACT.md` (§2), `MATHEMATICAL_NOTATION_STANDARD.md` (§2.1, §4.2).
- **Зависимости:** Шаг 1.
- **Критерий проверки:** На координатной сетке и в hover-HUD полностью отсутствует `O (0,0)` как вершина; отображается `C (0,0)`.

### Шаг 3. Миграция сторон, вершин и углов треугольника ($\triangle ABC$, $a, b, c, \alpha, \beta, \gamma$)
- **Цель:** Унифицировать отображение сторон `a = |BC|` (горизонталь), `b = |AC|` (вертикаль), `c = |AB|`, вершин `A, B, C`, углов `α = ∠A`, `β = ∠B`, `γ = 90°`, а также параметров формы и масштаба `ρ = a/b`, `λ = c/5` в контролах и треугольнике.
- **Компоненты:** `RightTriangleView.tsx`, `ControlsPanel.tsx`, `src/math/presets.ts`.
- **Нормативные документы:** `MATHEMATICAL_NOTATION_STANDARD.md` (§2.1, §2.2), `CANONICAL_SEMANTIC_CONTRACT.md` (§1, §2).
- **Зависимости:** Шаги 1, 2.
- **Критерий проверки:** Ползунки, пресеты и подписи на треугольнике согласованы по `vertex_preserving`; `a` всегда напротив `A`, `b` всегда напротив `B`, нигде не используется `t = b/a` или `△OAB`.
- *(Параллелизация: Шаг 3 и Шаг 4 могут выполняться частично параллельно после завершения Шага 2 на базе утверждённой ориентации `vertex_preserving`.)*

### Шаг 4. Миграция пяти окружностей и трёх квадратов ($K_a..K_o, Q_a..Q_c, O_a..O_o, C_x, d_x, R_x, \operatorname{Area}(K_x)$)
- **Цель:** Перепривязать $Q_a, K_a$ к горизонтальной стороне $a$, $Q_b, K_b$ к вертикальной стороне $b$; закрепить центры $O_a, O_b, O_c, O_o$; закрепить геометрическую эквивалентность $K_c \equiv K_o$ ($O_c = O_o = (a/2, b/2)$, $R_c = R_o = c/2$, $\operatorname{Area}(K_c) = \operatorname{Area}(K_o)$, $C_c = C_o = \pi c$) с сохранением обоих символов для их конструктивных ролей; заменить все `P_x` и `L_o/L_c` на `C_a..C_o`; ввести `d_a..D_o`, строго отделить объект `K_x / Q_x` от $\operatorname{Area}(K_x)$ и $\operatorname{Area}(Q_x)$.
- **Компоненты:** `FourCirclesView.tsx`, `KcVsKoComparison.tsx`, `ThalesCircumcirclePanel.tsx`.
- **Нормативные документы:** `MATHEMATICAL_NOTATION_STANDARD.md` (§2.3, §3), `NOTATION_MIGRATION_MAP.md`.
- **Зависимости:** Шаги 1, 2, 3.
- **Критерий проверки:** На сцене и в таблице сравнения $K_c$ vs $K_o$ длины окружностей обозначаются строго как `C_c`, `C_o`, центры — как `O_c`, `O_o`, площади — только через `Area(K_x)`; индексы `a/b` квадратов и кругов совпадают с катетами $a$ и $b$; $K_c$ и $K_o$ отображаются согласованно без графических конфликтов и дублирующих пересчётов геометрии.

### Шаг 5. Миграция инцентра, радиуса, точек и отрезков касания, площадей ($I, r, T_a..T_c, \tau_A..\tau_C, S_A..S_C, S, P, p$)
- **Цель:** Сделать $r = \frac{ab}{a+b+c}$ основной отображаемой формулой вписанного радиуса, переименовать точки касания в $T_a = (r,0) \in BC$, $T_b = (0,r) \in AC$, $T_c \in AB$, ввести отрезки касания $\tau_A, \tau_B, \tau_C$, перевести подтреугольники в $S_A, S_B, S_C$, ввести явные $S, P, p$.
- **Компоненты:** `FourCirclesView.tsx` (секция $K_i$), `FourCirclesPanel.tsx`, `IncircleArcDistributionOverlay.tsx`, `ArcSideAreaBoardOverlay.tsx`.
- **Нормативные документы:** `CANONICAL_SEMANTIC_CONTRACT.md` (§3, `NC-01`), `MATHEMATICAL_NOTATION_STANDARD.md` (§2.3, §2.4).
- **Зависимости:** Шаги 1, 3, 4.
- **Критерий проверки:** В UI нигде нет `T_OA`, `T_OB`, `T_AB`, `S_a`, `S_b`, `S_c`, `t_A, t_B`; первичная формула вписанного радиуса — бесвычитательная.

### Шаг 6. Миграция формул, валидаторов и математических панелей
- **Цель:** Перевести все `MathFormula` (KaTeX), карточки инвариантов, справочную модалку и модалку тестов на канонические формулы (включая $\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$), с показом только математически подтверждённых результатов.
- **Компоненты:** `FourCirclesPanel.tsx`, `InvariantsPanel.tsx`, `HelpModal.tsx`, `TestRunnerModal.tsx`, `ComparisonModal.tsx`, `FourCirclesValidators.ts`, `ThalesValidators.ts`.
- **Нормативные документы:** `CANONICAL_SEMANTIC_CONTRACT.md`, `MATHEMATICAL_RESULT_CLASSIFICATION.md`.
- **Зависимости:** Шаги 4, 5.
- **Критерий проверки:** Все формулы в `HelpModal`, `InvariantsPanel` и `TestRunnerModal` проходят сверку с `SemanticNotationRegistry`; отсутствуют `Q_a = a^2`, неквалифицированные `K_a + K_b = K_c` и `P_x`.
- *(Параллелизация: Шаг 6 и Шаг 7 могут выполняться параллельно разными исполнителями после завершения Шага 5.)*

### Шаг 7. Миграция графиков, легенд и таблиц (Спектральный анализ и Эксп. 02–06)
- **Цель:** Перевести оси и серии графиков на $\rho = a/b$ (с канонической нормировкой $b^*=1, a^*=\rho$), $C_x/C_c$, $\operatorname{Area}(K_x)/\operatorname{Area}(K_c)$, $\beta$, $\theta=2\beta$, $\varphi_A..\varphi_C$, $L_A..L_C$, $w^{\text{arc}}_X$, $w^{\text{area}}_X$; исключить из нового UI `L_max`, неподтверждённые гипотезы (`E-03..E-05`) и старые формулы `EXP-03` с `α`; привести индикацию домена к `STAGE_5_2_3` (`1/24 <= ρ <= 24` для Level 1, `0.01 <= ρ <= 100` для Level 2 при одновременных ограничениях на `sideA` и `sideB`).
- **Компоненты:** `SpectralAnalysisPanel.tsx`, `ArcClassificationPanel.tsx`, `ArcAngleAnalysisPanel.tsx`, `IncircleArcDistributionPanel.tsx`, `ArcSideAreaPanel.tsx`, `FourCirclesSpectralAnalysis.ts`, `arcSideAreaCorrespondence.ts`, остальные оверлеи (`ArcClassificationBoardOverlay.tsx`, `ArcAngleBoardOverlay.tsx`).
- **Нормативные документы:** `MATHEMATICAL_NOTATION_STANDARD.md` (§3.1), `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md`, `MATHEMATICAL_RESULT_CLASSIFICATION.md`.
- **Зависимости:** Шаги 1, 3, 5.
- **Критерий проверки:** Значения и графики при переключении между «Основным стендом» и «Эксп. 06» полностью согласованы по $a, b, \alpha, \beta$; нигде не встречается `s_A`, `w_a`, `t = b/a`, `S_c` (как квадрат), `L_max`, `E-03..E-05`.

### Шаг 8. Миграция названий исследовательских модулей, вкладок и фильтров слоёв
- **Цель:** Привести названия модулей в шапке (`Header.tsx`), фильтров слоёв в `GeometryBoard.tsx` и заголовки/подзаголовки панелей к единому каноническому именованию.
- **Компоненты:** `Header.tsx`, `GeometryBoard.tsx`, `src/i18n/translations.ts` (ключи `modules`, `board`, заголовки панелей).
- **Нормативные документы:** `MATHEMATICAL_RESULT_CLASSIFICATION.md`, `REMIX_INITIAL_ARCHITECTURE_AUDIT.md`.
- **Зависимости:** Шаги 6, 7.
- **Критерий проверки:** Ни один заголовок модуля или фильтра не содержит устаревших терминов («предел ёмкости $L_{\max}$», `△OAB`, неясных имён без контекста).

### Шаг 9. Унификация локализации (`RU / UK / EN`) и пояснений
- **Цель:** Ликвидировать все захардкоженные `copy`-объекты в 4 панелях и 4 оверлеях, перенести захардкоженный русский текст из `SpectralAnalysisPanel.tsx` и `arcSideAreaCorrespondence.ts` в `translations.ts`, перевести формульные подстановки на интерполяцию через `SemanticNotationLayer`.
- **Компоненты:** `src/i18n/translations.ts`, все `Arc*Panel.tsx`, все `Arc*Overlay.tsx`, `SpectralAnalysisPanel.tsx`, `FourCirclesValidators.ts`, `ThalesValidators.ts`.
- **Нормативные документы:** `MATHEMATICAL_NOTATION_STANDARD.md`, `CANONICAL_SEMANTIC_CONTRACT.md`.
- **Зависимости:** Шаги 6, 7, 8.
- **Критерий проверки:** Переключение `RU ↔ UK ↔ EN` переводит 100% текстов и пояснений во всех модулях (включая `SpectralAnalysisPanel` и оверлеи), при этом математические символы остаются инвариантными во всех трёх языках.

### Шаг 10. Сквозная проверка отсутствия нотационных коллизий (Audit & Automated Gate)
- **Цель:** Запустить автоматизированные тесты и grep/AST-аудит по всей кодовой базе UI, локализации и экспортов, подтвердить отсутствие Legacy-символов и смешения сущностей.
- **Компоненты:** Весь `src/`, тесты верификации (`tests/` или `vitest`).
- **Нормативные документы:** Все 5 нормативных спецификаций + данный план миграции.
- **Зависимости:** Шаги 1–9.
- **Критерий проверки:** Пройдены все пункты чеклиста из Раздела 7.

---

## 7. Критерии приёмки каждого этапа и сквозного аудита

### 7.1. Поэтапные критерии приёмки

| Этап | Обязательный результат (Definition of Done) |
| :--- | :--- |
| **Шаг 1** | Реестр `SemanticNotationRegistry` покрывает 100% сущностей из Раздела 2; тесты подтверждают уникальность символов внутри каждого `NotationRenderTarget`, строго отличают реальные коллизии обозначений (`notation collision`) от допустимых псевдонимов (`semantic alias`) и доказанной геометрической эквивалентности $K_c \equiv K_o$, сохраняя полную независимость от расчётного `Canonical Mathematical Core`. |
| **Шаг 2** | Холст, сетка и hover-строки отображают `C (0,0)`, ориентация `vertex_preserving`, экспорт PNG/SVG/JSON сохраняет канонические имена параметров. |
| **Шаг 3** | При переключении любых вкладок `a = |BC|` горизонтален и лежит напротив `A`, `b = |AC|` вертикален и лежит напротив `B`, $\alpha = \angle A$, $\beta = \angle B$; параметры $\rho$ и $\lambda$ отображаются единообразно. |
| **Шаг 4** | Окружности $K_a..K_o$ и квадраты $Q_a..Q_c$ размещены строго на своих сторонах; центры — $O_a, O_b, O_c, O_o$; длины окружностей — только $C_x$; диаметры — $d_a, d_b, d_c, d_i, D_o$; площади — строго `Area(K_x)` и `Area(Q_x)`. |
| **Шаг 5** | Первичная формула $r = \frac{ab}{a+b+c}$ отображается в `FourCirclesPanel`, `FourCirclesView` и `HelpModal`; подтреугольники — $S_A, S_B, S_C$; точки касания — $T_a, T_b, T_c$; длины касательных — $\tau_A, \tau_B, \tau_C$. |
| **Шаг 6** | Все формулы KaTeX (включая $\sqrt{\operatorname{Area}(K_a)}+\sqrt{\operatorname{Area}(K_b)}=\sqrt{\operatorname{Area}(K_c)}+\sqrt{\operatorname{Area}(K_i)}$) и карточки инвариантов валидированы на соответствие `MATHEMATICAL_NOTATION_STANDARD.md` и `NC-01`..`NC-05`. |
| **Шаг 7** | Спектральный график строится по $\rho = a/b$ ($b^*=1$); графики Эксп. 02–06 не содержат `t`, `α=∠B`, `s_A`, `w_a`, `S_a`, `L_max`, `E-03..E-05`; границы домена соответствуют `STAGE_5_2_3` (`1/24 <= ρ <= 24`, `0.01 <= ρ <= 100`, одновременное пересечение `AND`). |
| **Шаг 8** | Все названия модулей и фильтров слоёв не содержат Legacy-обозначений и опровергнутых гипотез в заголовках. |
| **Шаг 9** | В `src/components/` не осталось локальных словарей `copy = { ru, uk, en }` и непереведённых русских литералов; все 3 языка синхронны по набору ключей. |
| **Шаг 10** | Сборка (`compile_applet`), линтинг (`lint_applet`), автотесты математических инвариантов, тесты `SemanticNotationRegistry` и сквозной zero-collision аудит пройдены без единого предупреждения; Legacy-архив сохранён нетронутым. |

### 7.2. Сквозной автоматизированный Zero-Collision Gate (для Шага 10)

Приёмка миграции считается завершённой только при прохождении следующих инвариантных проверок по всему каталогу `src/components/`, `src/i18n/` и пользовательским строкам `src/math/`:
1. **Запрет вершины `O`:** 0 вхождений `O (0,0)`, `△OAB`, `∠AOB`, `Вершина O` в пользовательских строках и SVG.
2. **Запрет `P_x` и `L_o/L_c` для окружностей:** 0 вхождений `P_a`, `P_b`, `P_c`, `P_i`, `P_o`, `P_x`, `L_o`, `L_c` (в значении длины окружности).
3. **Запрет строчных `S_a, S_b, S_c` и квадратного `S_c`:** 0 вхождений `S_a`, `S_b`, `S_c` во всём UI.
4. **Запрет `s_A/s_B/s_C`, `w_a/w_b/w_c` и `t_A/t_B`:** 0 вхождений; только $w^{\text{arc}}_X$, $w^{\text{area}}_X = w^{\text{side}}_X$ с индексами $A, B, C$ и $\tau_A, \tau_B, \tau_C$.
5. **Запрет старого параметра `t = b/a` и инверсии углов `α = ∠B`:** 0 вхождений `t = b/a`, `α = ∠B`, `∠A = 90° − α`, а также старой формулы `L = r * α` из `EXP-03`.
6. **Запрет `T_OA`, `T_OB`, `T_AB`:** 0 вхождений в SVG, hover и таблицах; только $T_a, T_b, T_c$.
7. **Удаление опровергнутых и неподтверждённых элементов из UI:** 0 вхождений `L_max` как «предела ёмкости», `E-03..E-05` и ошибочной преамбульной формулы `EXP-01` в новом Canonical UI (при полной сохранности в Legacy-архиве).
8. **Запрет смешения объекта $K_x$ и $Q_x$ с площадью:** 0 вхождений неквалифицированных записей вида `K_a = 12.56`, `K_a + K_b = K_c`, `\sqrt{K_a}` или `Q_a = a^2` в новом UI — только `Area(K_x)` и `Area(Q_x)`.
9. **Проверка первичности $r = \frac{ab}{a+b+c}$:** в первичных определениях и карточках вписанного радиуса используется бесвычитательная форма.
10. **Разграничение коллизий обозначений и геометрического тождества $K_c \equiv K_o$:** 0 неразрешённых коллизий символов между различными математическими сущностями; при этом совпадение геометрических параметров $K_c$ и $K_o$ ($O_c = O_o = (a/2, b/2)$, $R_c = R_o = c/2$, $\operatorname{Area}(K_c) = \operatorname{Area}(K_o)$, $C_c = C_o = \pi c$) нормативно валидируется как законное геометрическое тождество двух конструктивных ролей одного объекта и не блокируется тестами.

---

## 8. Нормативные решения (Stage 2.1), разрешение противоречий и открытые вопросы графической сцены

### 8.1. Реестр противоречий в документах (обновлённый по итогам Stage 2.1)

| № | Суть противоречия | Источник A | Источник B | Статус и решение (Stage 2.1) |
| :--- | :--- | :--- | :--- | :--- |
| **П-1** | **Имя полярного угла точки касания $T_c$ на $K_i$:** `β` против `α` | `MATHEMATICAL_NOTATION_STANDARD.md` (§3.1, стр. 97–105) и `NOTATION_MIGRATION_MAP.md` (стр. 53): полярный угол от севера $N=(r,2r)\to E=(2r,r)$ равен **$\beta = \angle B$**, и $L = r\beta_{\text{rad}} = r(\pi/2-\alpha_{\text{rad}})$. | `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` (§3, стр. 58, строка `EXP-03`): унаследованная запись `L = r * alpha_rad`. | **РАЗРЕШЕНО (Уточнение №6):** Полярный угол от $N$ к $E$ строго обозначается **$\beta$**, а не $\alpha$. Старые формулы `EXP-03` с $\alpha$ в новый UI не переносятся. |
| **П-2** | **Регистр индексов площадей подтреугольников и долей:** `S_A, S_B, S_C` против `S_a, S_b, S_c` | `MATHEMATICAL_NOTATION_STANDARD.md` (§2.3), `CANONICAL_SEMANTIC_CONTRACT.md`, `STAGE_5_2_3`, `src/canonical/types.ts`: заглавные **$S_A, S_B, S_C$**. | `MATHEMATICAL_RESULT_CLASSIFICATION.md`, документы Эксп. 06, `ArcSideAreaPanel.tsx`: строчные **$S_a, S_b, S_c$** и $w_a, w_b, w_c$. | **РАЗРЕШЕНО (Решение Д-3):** Приоритет у стандарта — строго **$S_A, S_B, S_C$** и **$w^{\text{area}}_A, w^{\text{area}}_B, w^{\text{area}}_C$**. Ошибочные обозначения Эксп. 06 не сохраняются. |
| **П-3** | **Символ $K_x$ как объект против площади $\operatorname{Area}(K_x)$** | Требование несмешения объекта ($K_x$), площади ($\operatorname{Area}(K_x)$) и длины окружности ($C_x$). | `MATHEMATICAL_NOTATION_STANDARD.md` (§3, стр. 85–89) и `FourCirclesValidators.ts:235` (`Q_a = a^2`). | **РАЗРЕШЕНО (Решение Д-2):** Площадь окружности всегда записывается явно как **$\operatorname{Area}(K_x)$** (включая главное тождество), площадь квадрата — как **$\operatorname{Area}(Q_x)$**. |
| **П-4** | **Якорь нормировки в спектральных кривых и графиках:** $b^* = 1$ против $a^* = 1$ | `src/canonical/semanticContract.ts` (стр. 28–35, 89): **`sideB = 1`, `sideA = ρ`**, $c^*(\rho)=\sqrt{\rho^2+1}$. | `FourCirclesSpectralAnalysis.ts` (Legacy): $a_{\text{norm}} = 1, b_{\text{norm}} = t$. | **РАЗРЕШЕНО (Решение Д-3):** Приоритет у `CANONICAL_SEMANTIC_CONTRACT.md` ($b^* = 1$, $a^* = \rho = a/b$). |
| **П-5** | **Обозначение центров окружностей:** $O_a, O_b, O_c, O_o$ после упразднения вершины $O$ | `FourCirclesView.tsx`, `KcVsKoComparison.tsx`, `NOTATION_MIGRATION_MAP.md` (стр. 41): $O_a, O_b, O_c, O_o$ (центры) vs $C_a..C_o$ (длины окружностей). | В `MATHEMATICAL_NOTATION_STANDARD.md` символ центров не вынесен в сводную таблицу. | **РАЗРЕШЕНО (Решение Д-4):** Сохраняем **$O_a, O_b, O_c, O_o$** для центров окружностей; **$C_a, C_b, C_c, C_i, C_o$** закреплены за длинами окружностей. |
| **П-6** | **Числовые границы практического домена `Stage 5.2.3` (исправлено по ревизии аудита)** | `STAGE_5_2_3_PRACTICAL_GEOMETRIC_DOMAIN.md` (§2, стр. 30–35):<br>• **Level 1:** $\frac{1}{24} \le \rho \le 24$ **И** $0.5 \le \text{sideA}, \text{sideB} \le 15.0$ ($2.386^\circ \le \alpha, \beta \le 87.614^\circ$, $0.1414 \le \lambda \le 4.2426$);<br>• **Level 2:** $0.01 \le \rho \le 100$ **И** $0.1 \le \text{sideA}, \text{sideB} \le 150.0$ ($0.573^\circ \le \alpha, \beta \le 89.427^\circ$, $0.0283 \le \lambda \le 42.4264$). | `ArcAngleAnalysisPanel.tsx` / `ControlsPanel.tsx` / `GeometryBoard.tsx`: локальные хардкоды `[0.5, 15]`, `[0.1, 150]`, `[2°, 88°]` без одновременного `AND`-пересечения. | **РАЗРЕШЕНО (Уточнение №7):** В UI используются актуальные границы `Stage 5.2.3` ($\frac{1}{24} \le \rho \le 24$ для Level 1; $0.01 \le \rho \le 100$ для Level 2) с обязательным одновременным (`AND`) контролем ограничений на `sideA` и `sideB`. |
| **П-7** | **Статус $K_c$ и $K_o$:** дублирующие символы против геометрической эквивалентности конструктивных ролей | Старые спецификации иногда рассматривали $K_c$ и $K_o$ как отдельные независимые окружности либо предлагали удалить одно из обозначений как дубликат. | Геометрия прямоугольного треугольника: $K_c \equiv K_o$ ($O_c = O_o = (a/2, b/2)$, $R_c = R_o = c/2$). | **РАЗРЕШЕНО (Решение Д-11):** Геометрическое тождество $K_c \equiv K_o$ фиксируется явно. Оба символа сохраняются как две конструктивные роли одного объекта. Тесты реестра отличают геометрическое тождество от коллизий обозначений. |

---

### 8.2. Утверждённые нормативные решения (Д-1 – Д-11)

Все блокирующие нотационные решения этапа 2 утверждены:

1. **Д-1 (Ориентация сцены):** `vertex_preserving` — $C=(0,0)$, $A=(0, \text{sideB})$ (вертикальный катет $AC = b$), $B=(\text{sideA}, 0)$ (горизонтальный катет $BC = a$).
2. **Д-2 (Площади окружностей):** во всех формулах, карточках, таблицах и hover используется явная запись **$\operatorname{Area}(K_x)$** (включая $\sqrt{\operatorname{Area}(K_a)} + \sqrt{\operatorname{Area}(K_b)} = \sqrt{\operatorname{Area}(K_c)} + \sqrt{\operatorname{Area}(K_i)}$). Площадь не обозначается голым символом $K_x$.
3. **Д-3 (Нормативный приоритет):** абсолютный приоритет принадлежит `MATHEMATICAL_NOTATION_STANDARD.md` и `CANONICAL_SEMANTIC_CONTRACT.md` ($\alpha=\angle A$, $\beta=\angle B$, $\varphi_A..\varphi_C$, $S_A..S_C$, $w_A^{\text{area}}..w_C^{\text{area}}$). Старые экспериментальные обозначения ради совместимости не сохраняются.
4. **Д-4 (Центры и длины окружностей):** центры окружностей обозначаются $O_a, O_b, O_c, O_o$; длины окружностей — $C_a, C_b, C_c, C_i, C_o$.
5. **Д-5 (Отрезки касания):** длины касательных от вершин обозначаются $\tau_A = p - a$, $\tau_B = p - b$, $\tau_C = p - c = r$.
6. **Д-6 (Исправление П-1):** полярный угол от $N$ к $E$ обозначается $\beta$, а не $\alpha$; старые формулы `EXP-03` с $\alpha$ в новый UI не переносятся.
7. **Д-7 (Исправление П-6 — актуальный домен `Stage 5.2.3`):** Level 1 ($\frac{1}{24} \le \rho \le 24$ И $0.5 \le \text{sideA}, \text{sideB} \le 15.0$) и Level 2 ($0.01 \le \rho \le 100$ И $0.1 \le \text{sideA}, \text{sideB} \le 150.0$) по правилу одновременного пересечения `AND`.
8. **Д-8 (Внутренняя согласованность словаря):** нулевая терпимость к коллизиям между объектами, площадями, длинами окружностей, радиусами и точками касания во всех таблицах соответствий.
9. **Д-9 (Роль `Semantic Notation Layer`):** слой является единым источником пользовательских математических обозначений и связей отображения, но **не подменяет** `Canonical Mathematical Core`.
10. **Д-10 (Политика Legacy-архива и фильтрация UI):** математические результаты из Legacy-архива **не удаляются**, однако неподтверждённые и опровергнутые результаты в новый Canonical UI **не включаются**.
11. **Д-11 (Геометрическая эквивалентность $K_c \equiv K_o$ и три категории нотационных тестов):**
    - В геометрии прямоугольного треугольника окружность $K_c$ (вписанная в квадрат гипотенузы $Q_c$) и окружность $K_o$ (описанная около $\triangle ABC$) абсолютно совпадают: $K_c \equiv K_o \iff O_c = O_o = (a/2, b/2)$, $R_c = R_o = c/2$, $\operatorname{Area}(K_c) = \operatorname{Area}(K_o) = \frac{\pi c^2}{4}$, $C_c = C_o = \pi c$.
    - Оба символа $K_c$ и $K_o$ сохраняются в словаре и UI для выражения двух различных конструктивных ролей одного геометрического круга (без дублирования расчётов в ядре).
    - В тестах реестра `SemanticNotationRegistry` (Шаг 1) и автоматизированном сквозном гейте (Шаг 10) строго разграничиваются три категории:
      1) *Коллизия обозначений (`notation collision`)* — присвоение одного символа разным математическим сущностям (запрещена, является критической ошибкой тестов);
      2) *Семантический псевдоним (`semantic alias`)* — контекстные варианты отображения одной сущности (разрешены для целевых сред);
      3) *Геометрическая эквивалентность (`geometric identity`)* — совпадение геометрических объектов из разных конструктивных определений ($K_c \equiv K_o$); признаётся нормативно валидной и не должна блокироваться тестами на коллизии.

---

### 8.3. Оставшиеся открытые решения этапа проектирования графической сцены (не блокируют Шаг 1)

Следующие продуктовые вопросы не влияют на создание `SemanticNotationRegistry` (Шаг 1) и могут решаться на этапе проектирования новой графической сцены:

1. **Визуальный стиль индикации домена `STAGE_5_2_3` (`IN_LEVEL_1_VISUAL` / `IN_LEVEL_2_RESEARCH` / `OUT_OF_PRACTICAL_DOMAIN`):** формат баннера/предупреждения на сцене и адаптация мобильного вьюпорта на краях Level 2.
2. **Визуальная подача эпистемических статусов подтверждённых результатов (`PROVEN` / `NUMERICALLY OBSERVED`):** композиция карточек теорем и законов (без пилл-тегов в новой графической системе).
3. **Уровень детализации второстепенных элементов по умолчанию:** отображать ли биссектрисные углы $\psi_A, \psi_B, \psi_C$ и длины касательных $\tau_A, \tau_B, \tau_C$ на основном полотне по умолчанию или только в режиме исследования / фокуса на инцентре.
4. **Стратегия совместимости `localStorage` и JSON-экспорта:** автоматическая миграция ранее сохранённых пользователем пресетов старого формата `{ a, b }` с учётом смены ориентации (`vertex_preserving`) или чистый старт хранилища в новом Remix.
5. **Окончательное продуктовое название стенда** в `metadata.json`, `index.html` и шапке (`Header.tsx`) на `RU / UK / EN`.

