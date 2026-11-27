# EVIDENCE TRACEABILITY MATRIX — Матрица прослеживаемости доказательств (Package 05)

**Пакет:** `PACKAGE 05 — REFERENCES & EVIDENCE`  
**Назначение:** Сквозное сопоставление каждого математического утверждения, авторской спецификации, эталонного набора данных и открытого вопроса с его эпистемическим статусом, источником, доступностью полного текста, способом проверки и связью с набором верификации `CHK-01..CHK-12`.

---

## 1. Легенда эпистемических статусов и доступности

| Код статуса | Значение |
| :--- | :--- |
| **`PUBLISHED_THEOREM`** | Строго доказанный результат из рецензируемой математической литературы или классической теории чисел |
| **`AUTHOR_DERIVATION_OR_SPEC`** | Строгий алгебраический вывод из 39-стр. PDF или нормативная инженерно-математическая конвенция спецификации `v0.1` / `DESIGN_REVIEW.md` |
| **`EMPIRICAL_BENCHMARK`** | Конкретные численные таблицы, счётчики классов и эталонные срезы из 39-стр. PDF (подлежат обязательному повторному прогону машинного верификатора) |
| **`OPEN_HYPOTHESIS`** | Недоказанное предположение, малоизученное исследовательское направление, открытый инженерный выбор (`OQ-01..06`) или утверждение из недоступного локально текста |

---

## 2. Сводная матрица прослеживаемости

### 2.1 Математическое ядро (Package 01)

| ID | Утверждение / Формула | Эпистемический статус | Источник и локализация | Доступность текста | Верификация и привязка `CHK` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MF-01` | $a^2+b^2=c^2,\; 0<a<b<c$ (катеты не могут быть равны, т.к. $\sqrt{2}\notin\mathbb{Q}$) | `PUBLISHED_THEOREM` | Agarwal (2020, с. 1); 39-стр. PDF (разд. 1, 2.1); `v0.1` (разд. 0) | `LOCAL_FULL_TEXT` + `PRIMARY_CORPUS_PDF` | `PROVEN_IN_LITERATURE` $\to$ `CHK-01` |
| `MF-02` | $r = \frac{a+b-c}{2} = \frac{S}{p}$, $D = 2r \in 2\mathbb{N}$ (при нечётном $D$ класс пуст) | `PUBLISHED_THEOREM` | Robbins (2006, Thm 1, Cor 1, с. 368); Omland (2017, с. 2) | `LOCAL_FULL_TEXT` | `PROVEN_IN_LITERATURE` $\to$ `CHK-02` |
| `MF-03` | Гиперболическая факторизация $xy = 2r^2$ ($x=a-2r, y=b-2r$), обратное $a=2r+x, b=2r+y, c=2r+x+y$ | `PUBLISHED_THEOREM` | Omland (2017, ур. (1), с. 1–2); Clarke (2005) через Sporn (2021, ур. (3)–(6)) | `LOCAL_FULL_TEXT` (Omland) | `PROVEN_IN_LITERATURE` $\to$ `CHK-03` |
| `MF-04` | Строгие и граничные неравенства $1 \le x < \sqrt{2}r < y \le 2r^2$ и монотонность $c(x)$ по возрастанию $x$ | `AUTHOR_DERIVATION_OR_SPEC` | 39-стр. PDF (разд. 2.1); уточнено в `DESIGN_REVIEW.md` (разд. 1.1, 2.1, $r=1$) | `PRIMARY_CORPUS_PDF` + `DESIGN_REVIEW` | `EXACT_ALGEBRAIC_CROSSCHECK` $\to$ `CHK-03` |
| `MF-05` | Каноническая параметризация Евклида с масштабом $k$: $a=k\min(m^2-n^2,2mn),\; b=k\max(\dots),\; c=k(m^2+n^2)$ | `PUBLISHED_THEOREM` | Agarwal (2020, ур. (9), Steps 1–6, с. 6–9); Robbins (2006, с. 368) | `LOCAL_FULL_TEXT` | `PROVEN_IN_LITERATURE` $\to$ `CHK-05` |
| `MF-06` | $r = kn(m-n) = kuv$ при $u=n,\; v=m-n,\; \gcd(u,v)=1,\; 2\nmid v$ (вся $2$-часть $r/k$ в $u$) и биекция $\{x_0, y_0\} = \{2u^2, v^2\}$ | `AUTHOR_DERIVATION_OR_SPEC` | 39-стр. PDF (разд. 2.2–2.3); уточнено в `DESIGN_REVIEW.md` (разд. 1.3, 2.2); база `r=k(u-v)v` в Agarwal P27 | `PRIMARY_CORPUS_PDF` + `LOCAL_FULL_TEXT` | `EXACT_ALGEBRAIC_CROSSCHECK` $\to$ `CHK-05`, `CHK-09` |
| `MF-07` | Теорема Роббинса: $T(r) = 2^{\omega^*(r)} \ge 1$; единственность ППТ $T(r)=1 \iff r=2^{e_0}$ | `PUBLISHED_THEOREM` | Robbins (2006, Thm 2, Cor 2, с. 368–369); подтверждено Omland (2017, с. 2) и `JC23` (Thm 3.4) | `LOCAL_FULL_TEXT` (Robbins, Omland) | `PROVEN_IN_LITERATURE` $\to$ `CHK-07` |
| `MF-08` | Теорема Омланда: $N(r) = \frac{\tau(2r^2)}{2} = (e_0+1)\prod_{i=1}^s (2e_i+1)$ | `PUBLISHED_THEOREM` | Omland (2017, Lemma, с. 1–2); Agarwal (2020, P27, с. 19) | `LOCAL_FULL_TEXT` | `PROVEN_IN_LITERATURE` $\to$ `CHK-06` |
| `MF-09` | Экстремальные границы гипотенузы: $c_{\max}(r) = 2r^2+2r+1$ ($x=1$) и $(2+2\sqrt{2})r < c_{\min}(r) \le 5r$ (первое нарушение $c_{\min}<5r$ при $r=6$) | `AUTHOR_DERIVATION_OR_SPEC` | 39-стр. PDF (разд. 2.5, 3.2); $(2r+1, 2r^2+2r, 2r^2+2r+1)$ в Agarwal (2020, ур. (4), с. 4) | `PRIMARY_CORPUS_PDF` + `LOCAL_FULL_TEXT` | `EXACT_ALGEBRAIC_CROSSCHECK` + `BRUTE_FORCE_BENCHMARK` $\to$ `CHK-03`, `CHK-06` |

### 2.2 Классификация, подклассы и спецификация `v0.1` (Package 02)

| ID | Утверждение / Правило | Эпистемический статус | Источник и локализация | Доступность текста | Верификация и привязка `CHK` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CL-01` | Непересекающееся разбиение $\mathcal{P} = \bigsqcup_{r=1}^{\infty} C(r)$ | `AUTHOR_DERIVATION_OR_SPEC` | Иерархически-фасетный проект (разд. 1–2); 39-стр. PDF | `USER_SPEC` + `PRIMARY_CORPUS_PDF` | `EXACT_ALGEBRAIC_CROSSCHECK` $\to$ `CHK-02`, `CHK-08` |
| `CL-02` | Эквивалентность $k = \gcd(a,b,c) = \gcd(x,y) \mid r$ и мощность слоя $|C_k(r)| = T(r/k) \ge 1$ | `AUTHOR_DERIVATION_OR_SPEC` | Пакет 2 пользователя; `DESIGN_REVIEW.md` (разд. 1.2, 2.3) | `USER_SPEC` + `DESIGN_REVIEW` | `EXACT_ALGEBRAIC_CROSSCHECK` $\to$ `CHK-04`, `CHK-10` |
| `CL-03` | Счёт слоёв: ровно $1$ примитивный $k$-подкласс ($k=1$) и $\tau(r)-1$ масштабированных; $\sum_{k \mid r} T(r/k) = N(r)$ | `AUTHOR_DERIVATION_OR_SPEC` | Пакет 2 пользователя; Спецификация `v0.1`; `DESIGN_REVIEW.md` (разд. 2.3) | `USER_SPEC` + `DESIGN_REVIEW` | `EXACT_ALGEBRAIC_CROSSCHECK` $\to$ `CHK-06`, `CHK-10` |
| `SP-01` | Конвенция $a<b<c$ в ядре + флаг `tree_leg_swapped` для дерева Берггрена + ветвь $\tilde{x}_{\text{canon}} \in (0, \sqrt{2})$ | `AUTHOR_DERIVATION_OR_SPEC` | Спецификация `v0.1` (разд. 0); `DESIGN_REVIEW.md` (разд. 2.5) | `USER_SPEC` (усечённый текст `v0.1`) | Нормативная конвенция $\to$ `CHK-01` |
| `SP-02` | Идентификаторы `CL-R{r}-D{2r}`, `PT-R{r}-K{k}-X{x}`, `prim_id` без ведущих нулей (вместо `R001-D002` из 39-стр. PDF) | `AUTHOR_DERIVATION_OR_SPEC` | Спецификация `v0.1`; Пакет 2/3; `DESIGN_REVIEW.md` (разд. 2.5) | `USER_SPEC` + `DESIGN_REVIEW` | Нормативная конвенция $\to$ `CHK-12` |
| `SP-03` | 6 категорий признаков матрицы, включая $q = \text{asym\_q} = \frac{b-a}{a+b} = \frac{t-1}{t+1}$ и $\tan(A/2), \tan(B/2)$ | `AUTHOR_DERIVATION_OR_SPEC` | Спецификация `v0.1` + Пакет 5 пользователя; 39-стр. PDF (с. 31) | `USER_SPEC` + `PRIMARY_CORPUS_PDF` | `EXACT_ALGEBRAIC_CROSSCHECK` (ожидает закрытия `OQ-02` в UI) |
| `SP-04` | Политика сертификации простоты (`PROVEN_PRIME` до $3.317\times 10^{24}$ по Sorenson–Webster / `PROBABLE_PRIME` / `UNFACTORED`) и развязка `M2/M3/M6` | `AUTHOR_DERIVATION_OR_SPEC` | `DESIGN_REVIEW.md` (разд. 1.4–1.5, 4.1–4.2) | `DESIGN_REVIEW` | Архитектурное требование $\to$ `CHK-11` + тесты `M6` |

### 2.3 Эталонные данные и табличные сводки (Package 03)

| ID | Эталонный набор / факт | Эпистемический статус | Источник и локализация | Доступность текста | Верификация и привязка `CHK` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BM-01` | Эталонный класс $C(3)$: $(7,24,25),\; (8,15,17),\; (9,12,15)$ ($N=3, T=2, NP=1$) | `EMPIRICAL_BENCHMARK` | 39-стр. PDF (Таблица A, с. 10); Пакет 3 пользователя | `PRIMARY_CORPUS_PDF` | `BRUTE_FORCE_BENCHMARK` + `PENDING_MACHINE_CHK_01_12` |
| `BM-02` | Сводка $1 \le r \le 30$ ($2 \le D \le 60$): **174** тройки (**61** ППТ, **113** масштабированных), полный перебор до $c \le 1861$ | `EMPIRICAL_BENCHMARK` | 39-стр. PDF (разд. 1.1, Таблица 3.2, Таблица A, с. 2, 7, 10–15) | `PRIMARY_CORPUS_PDF` | `BRUTE_FORCE_BENCHMARK` + `PENDING_MACHINE_CHK_01_12` |
| `BM-03` | Сводка $31 \le r \le 100$ и итог $1 \le r \le 100$: **188** ППТ + **493** непр. = **681**; всего **855** троек (**249** ППТ, **606** непр.) | `EMPIRICAL_BENCHMARK` | 39-стр. PDF (разд. 1.1, Таблица 3.2, Таблица B, с. 2, 7–8, 16–29) | `PRIMARY_CORPUS_PDF` | Повторная проверка в PDF; `PENDING_MACHINE_CHK_01_12` |
| `BM-04` | Распределение 100 классов по $T(r)$ ($7/65/28$), рекордсмены $N(90)=30,\; N(60)=N(84)=27$, $r=105$ ($T=8$), класс $r=35$ | `EMPIRICAL_BENCHMARK` | 39-стр. PDF (с. 4–8, 22); $r=35$ сверен с `JC23` (Ex. 3.5); `A070826` | `PRIMARY_CORPUS_PDF` | `PENDING_MACHINE_CHK_06_07_10` |
| `BM-05` | Схема 18 столбцов `INRADIUS_CLASSIFICATION.csv` и формат `R001-D002..R100-D200` | `EMPIRICAL_BENCHMARK` | 39-стр. PDF (разд. 4.1–4.2, с. 30) | `PRIMARY_CORPUS_PDF` | Ожидает импорта и `CHK-01..12` |

### 2.4 Структурный анализ, алгебра и открытые направления (Package 04)

| ID | Утверждение / направление | Эпистемический статус | Источник и локализация | Доступность текста | Верификация и статус |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ST-01` | Абелева группа Спорна на $\tilde{x}\tilde{y}=2$: $(\tilde{x}_1, 2/\tilde{x}_1) \odot (\tilde{x}_2, 2/\tilde{x}_2) = (\tilde{x}_1\tilde{x}_2, 2/(\tilde{x}_1\tilde{x}_2))$, единица $(1,2)$, изоморфизм $(\mathbb{Q}_+, \cdot)$ | `PUBLISHED_THEOREM` | Sporn (2021, ур. (9)–(10)); 39-стр. PDF (с. 5, 32) | `NO_LOCAL_FULL_TEXT` (выдержка в 39-стр. PDF) | Частично подтверждено выдержками PDF; требует полного текста Sporn (2021) |
| `ST-02` | Арифметический профиль делимости ППТ ($\mid 3$, $\mid 4$, $\mid 5$, $\mid 60$, запрет $4n+2$) | `PUBLISHED_THEOREM` | Agarwal (2020, P4–P7, с. 11–12); 39-стр. PDF | `LOCAL_FULL_TEXT` | `PROVEN_IN_LITERATURE` |
| `ST-03` | Дерево Берггрена $A_1,A_2,A_3$, Прайса $A_1',A_2',A_3'$, $(u,v)$-матрицы Саундерса–Рэндалла $B_1,B_2,B_3$ | `PUBLISHED_THEOREM` | Agarwal (2020, P29–P31, с. 20–21); Berggren (1934), Price (`arXiv:0809.4324`), Saunders & Randall (1994) | `LOCAL_FULL_TEXT` (через Agarwal) | `PROVEN_IN_LITERATURE` (для `berggren_word` открыт `OQ-05`) |
| `ST-04` | Трансверсальные пучки по общему катету $L_p(n)$, гипотенузе $H_p(n)$, площади/периметру | `PUBLISHED_THEOREM` | Agarwal (2020, P9–P10, P15, P26); Ochieng et al. (2019) | `LOCAL_FULL_TEXT` (Agarwal); `NO_LOCAL_FULL_TEXT` (Ochieng) | `PROVEN_IN_LITERATURE` (в части Agarwal) |
| `ST-05` | Поведенческие закономерности спектров углов / $c_{\min}/r$ в зависимости от разложения $r$; связь слоёв $r$ с траекториями Берггрена; ФЗЧП для символьной регрессии / ИИ | `OPEN_HYPOTHESIS` | 39-стр. PDF (разд. 5.2, Вопрос 10, с. 32, 38); `JC23` (фрагменты) | `PRIMARY_CORPUS_PDF`; `NO_LOCAL_FULL_TEXT` (`JC23`) | `OPEN_RESEARCH` |
| `ST-06` | Статьи без локального полного текста и с неподтверждённой/частичной связью с $r$ (Sporn 2021 полный текст, `JC23` полный текст, Clarke 2005, Akhtar, O'Loughlin, Giuseppina 2024, van Iterson 2026) | `OPEN_HYPOTHESIS` | 39-стр. PDF (разд. 6, с. 33–36) | `NO_LOCAL_FULL_TEXT` | Зафиксировано как пробел библиографического доступа |
| `OQ-01..06` | Проектные развилки реализации: ориентация чертежа, `asym_q`, режим 4 окружностей, пределы вычислений, формат `berggren_word`, локальное хранение | `OPEN_HYPOTHESIS` | `DESIGN_REVIEW.md` (разд. 5, 6); частичное уточнение `asym_q` в Пакете 5 | `DESIGN_REVIEW` + `USER_SPEC` | Ожидает утверждения пользователем перед кодом |

---

## 3. Сводное покрытие `CHK-01..CHK-12` по развязанным контурам (`DESIGN_REVIEW.md`)

| Проверка | Проверяемые элементы матрицы | Контур и метод независимой верификации (`M6`) |
| :--- | :--- | :--- |
| **`CHK-01`** | `MF-01`, `SP-01` | Построчно в `BigInt`: $a>0,\; a<b,\; b<c,\; a^2+b^2=c^2$ |
| **`CHK-02`** | `MF-02`, `CL-01` | Построчно в `BigInt`: $a+b-c=2r,\; P=a+b+c=2p,\; S=ab/2=pr$ |
| **`CHK-03`** | `MF-03`, `MF-04`, `MF-09` | Построчно: $x=a-2r, y=b-2r, xy=2r^2, 1\le x<y\le 2r^2, x^2<2r^2<y^2$, монотонность $x_i < x_{i+1}$ |
| **`CHK-04`** | `CL-02` | Построчно: $\gcd(x,y)=\gcd(a,b,c)=k,\; r \bmod k = 0,\; \text{is\_prim} \equiv (k=1)$ |
| **`CHK-05`** | `MF-05`, `MF-06` | Построчно: $m>n\ge 1, \gcd(m,n)=1, m\not\equiv n \pmod 2$, восстановление $\{a,b,c\}$ |
| **`CHK-06`** | `MF-08`, `CL-03`, `BM-02..04` | Независимо от `M2/M3`: метод V1 (пробное деление $r$), V2 (перебор $x \le \lfloor\sqrt{2}r\rfloor$ при $r \le 10^6$), V3 (перебор $a<b<c$ в тестах) |
| **`CHK-07`** | `MF-07`, `BM-02..04` | Независимый подсчёт числа ППТ $T_{\text{indep}}(r) = 2^{\omega^*(r)}$ через V1/V2/V3 |
| **`CHK-08`** | `CL-01`, уникальность | Проверка попарной уникальности $(a,b,c)$, $(x,y)$ и `triple_id` |
| **`CHK-09`** | `MF-06` | Обратное извлечение $(u,v,m,n)$ из $(x/k, y/k)$ с точным $\text{isqrt}$ и проверкой $2\nmid v$ |
| **`CHK-10`** | `CL-02`, `CL-03`, `BM-04` | Проверка полноты всех $k \mid r$ ($\tau(r)$ слоёв) и мощности $|C_k(r)| = T(r/k)$ |
| **`CHK-11`** | `SP-04` | Сертификация факторов $r$ и $2r^2$ (`PROVEN_PRIME` / `PROBABLE_PRIME` / запрет `UNFACTORED`) |
| **`CHK-12`** | `SP-02` | Посимвольная проверка `class_id`, `triple_id`, `prim_id` без ведущих нулей |

---

## 4. Фиксация отсутствующих оригиналов корпуса

1. **Неизвлечённые документы дискретной классификации:** отдельные файлы `NOTATION_PROFILE.md`, `FORMULA_INVENTORY.md` и `FORMULA_DEPENDENCY_GRAPH.md` для классификации пифагоровых троек по вписанному радиусу $r$ на данный момент отсутствуют и **не восстанавливались по предположению**.
2. **Не смешивать с существующими файлами `/docs/canonical/formula-passports/`:** имеющиеся в репозитории `NOTATION_PROFILE.md`, `FORMULA_INVENTORY.md`, `FORMULA_DEPENDENCY_GRAPH.md`, `AUDIT_REPORT.md` и паспорта `F01–F19` принадлежат геометрическому стенду «четырёх окружностей» (`CANONICAL_OPPOSITE_SIDE_V1`) и не являются заменой отсутствующих документов классификации троек.
