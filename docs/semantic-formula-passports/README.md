# Семантические паспорта математических формул (UMFP Semantic Closure Pilot)

**Целевая методология:** Universal Mathematical Formula Passport (UMFP)  
**Контекст проверки:** `Pythagoras-Circles-Lab` (прямоугольный треугольник, вписанная окружность $K_i$, четыре/пять окружностей и параметрическая модель Experiment 04)  
**Язык:** русский (с англоязычными идентификаторами для совместимости с `UMFP 0.1.x` Core и Insight Bank)

---

## 1. Назначение раздела и принцип Semantic Transparency

Математическая запись вида $S = pr$ формально безупречна, но при изолированном чтении теряет **семантические переходы**: откуда появилась буква $p$, почему в знаменателе стоит двойка и почему три стороны треугольника суммируются именно в периметр.

В этом разделе реализуется концепция **Semantic Closure (семантическая полнота формулы)**: паспорт фиксирует не только синтаксическое выражение, но и:
- значение, роль и **происхождение** каждого символа (включая сокращённые обозначения);
- явные **определения** используемых величин до их подстановки;
- **геометрический смысл** и разложение конструкций;
- полную цепочку **вывода без пропущенных шагов**;
- граф логических зависимостей, условия применимости, численную проверку на эталоне $5\text{–}12\text{–}13$ и типичные ошибки интерпретации.

---

## 2. Соответствие архитектуре UMFP (`0.1.x` Core vs. Insight Bank / Semantic Layer)

В репозитории **UMFP `0.1.x`** (`a50kv109/universal-Mathematical-formula-Passport`, `src/umfp-core/types.ts`, `docs/ARCHITECTURE.md`, `docs/SPECIFICATION.md`) разделены два контура:

1. **`UMFP Core` (`0.1.x`)** — детерминированный структурно-синтаксический паспорт одного выражения (`FormulaPassport`):
   - `umfpVersion`, `sourceExpression`, `parseStatus`
   - `numberDomain`, `requestedNumberDomain`, `requiredNumberDomain`, `effectiveNumberDomain`
   - `structuralId`, `structuralSchemaId`, `canonicalExact`, `canonicalSchema`, `logicalClassId`
   - `constants`, `features` (`variables`, `freeVariables`, `boundVariables`, `variableScopes`, `structuralConstructs`, `operations`, `maximumDepth`, `nodeCount`, …)
   - `fractionDetails`, `constraints`, `validationErrors`, `symmetryStatus`
   - `logicalOrganizations`, `domains`, `domainClassification`
   - `rawAst`, `normalizedAst`, `diagnostics`

2. **`Insight Bank` и предлагаемый семантический слой (`Semantic Passport Layer`)** — не изменяет контракты `UMFP Core 0.1.x`, а дополняет их смысловой оболочкой знания.

### Распределение 17 секций паспорта между Core и предлагаемым расширением

| № | Секция паспорта | Покрытие в `UMFP Core 0.1.x` | Статус / предлагаемое расширение |
|---|---|---|---|
| 1–2 | `Formula ID`, `Formula Name` | ID есть в `Insight Bank` (`PTH-001`…) | Семантический / каталожный слой |
| 3 | `Canonical Expression` | Частично: `sourceExpression`, `canonicalExact`, `canonicalSchema` | Синхронизация с Core |
| 4 | `Semantic Statement` | Отсутствует в `FormulaPassport` | **Предлагаемое расширение** |
| 5 | `Symbol Registry` | В Core есть только имена в `features.freeVariables` и константы в `constants` | **Предлагаемое расширение** (значение + происхождение каждого символа) |
| 6 | `Definitions` | Отсутствует | **Предлагаемое расширение** |
| 7 | `Geometric Interpretation` | Есть в `Insight Bank` (не в `Core`) | Слой `Insight Bank` |
| 8–9 | `Preconditions`, `Domain and Constraints` | В Core только синтаксические `constraints` (`nonzero_denominator`, `radicand_domain`) | **Расширение** (геометрические условия: невырожденность, $\angle O = 90^\circ$) |
| 10 | `Derivation` | Отсутствует | **Предлагаемое расширение** (пошаговый вывод) |
| 11 | `Dependency Graph` | Отсутствует в Core | **Предлагаемое расширение** (DAG определений и теорем) |
| 12 | `Mathematical Status` | В Core только `domains`, `symmetryStatus`, `EquivalenceReport.mathematicalEquivalence` | Различение `Definition` / `Theorem` / `Derived` / `Parametric Model` |
| 13–14 | `Numerical Example`, `Validation Cases` | В Core есть только 6-точечный сэмплер эквивалентности | Слой `Insight Bank` + автотесты |
| 15–17 | `Common Misinterpretations`, `Related Formulas`, `Source / References` | Частично в `Insight Bank` (`PTH-*`) | Слой `Insight Bank` |

> **Принцип совместимости:** настоящая документация **не имитирует** поддержку новых полей внутри `UMFP Core 0.1.x` и не меняет его интерфейс `FormulaPassport`. Все семантические поля оформлены как надстройка уровня `Insight Bank / Semantic Extension`.

---

## 3. Состав набора паспортов (`F-001` – `F-007`)

| ID | Название | Каноническая запись | Математический статус | Файл |
|---|---|---|---|---|
| **F-001** | Теорема Пифагора | $c^2 = a^2 + b^2$ | `Theorem` (доказана в евклидовой геометрии) | [`F-001-pythagorean-theorem.md`](F-001-pythagorean-theorem.md) |
| **F-002** | Площадь прямоугольного треугольника | $S = \dfrac{ab}{2}$ | `Derived Theorem` (из площади прямоугольника) | [`F-002-right-triangle-area.md`](F-002-right-triangle-area.md) |
| **F-003** | Полупериметр треугольника | $p = \dfrac{a + b + c}{2}$ | `Definition` (определение величины, не теорема) | [`F-003-semiperimeter.md`](F-003-semiperimeter.md) |
| **F-004** | Площадь треугольника через вписанный радиус | $S = pr$ | `Derived Theorem` (из разложения на 3 треугольника и F-003) | [`F-004-area-incircle-radius.md`](F-004-area-incircle-radius.md) |
| **F-005** | Радиус вписанной окружности прямоугольного треугольника | $r = \dfrac{ab}{a+b+c} = \dfrac{a+b-c}{2}$ | `Derived Formula / Corollary` (из F-001, F-002, F-004) | [`F-005-right-triangle-inradius.md`](F-005-right-triangle-inradius.md) |
| **F-006** | Четыре окружности прямоугольного треугольника | $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ | `Derived Identity` (эквивалентна $a+b=c+2r$ из F-005) | [`F-006-four-circles-identity.md`](F-006-four-circles-identity.md) |
| **F-007** | Параметрическая модель семейства треугольников | $a(\alpha), b(\alpha), c(\alpha), L = r\alpha_{\text{рад}}$ | `Derived Parametric Model` (верифицирована в `Experiment 04`) | [`F-007-parametric-triangle-model.md`](F-007-parametric-triangle-model.md) |
| — | Граф зависимостей формул | DAG (`F-001` – `F-007`) | Архитектура связей и статусов | [`DEPENDENCY_GRAPH.md`](DEPENDENCY_GRAPH.md) |

---

## 4. Сквозной контрольный расчёт и автотесты

Все 7 паспортов проверены на едином контрольном треугольнике $(5, 12, 13)$ и параметрической модели `Experiment 04` в автоматизированном тестовом наборе `src/tests/semanticFormulaPassports.test.ts`.
