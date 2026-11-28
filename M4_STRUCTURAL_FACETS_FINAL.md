# M4_STRUCTURAL_FACETS_FINAL — Контрольная точка завершения M4

**Проект:** `pythagorean-Triples-inradius-lab` (Pythagoras Triples Inradius Classification Laboratory)  
**Контрольная точка:** `M4_STRUCTURAL_FACETS_FINAL`  
**Дата фиксации:** `2026-11-28`  
**Итоговый статус пакета:** **`M4 STRUCTURAL FACETS — COMPLETED`**

---

## 1. Статус этапов M1–M4

| Этап | Модуль / Подмодуль | Статус |
| :--- | :--- | :--- |
| **M1** | `Exact Core` (`src/core/exact/`) | **ACCEPTED / FROZEN** |
| **M2** | `Number Theory Engine` (`src/core/factorization/`) | **ACCEPTED / STABILIZED / FROZEN** |
| **M3** | `Classification Engine` (`src/core/classification/`) | **ACCEPTED / FROZEN** |
| **M4-S1** | `SpornFacet` (`src/core/facets/spornFacet.ts`) | **ACCEPTED** |
| **M4-S2** | `BerggrenFacet` (`src/core/facets/berggrenFacet.ts`) | **ACCEPTED** |
| **M4-S3** | `ClassProfileFacet` (`src/core/facets/classProfileFacet.ts`) | **ACCEPTED** |
| **M4** | **Structural Facets (пакет целиком)** | **COMPLETED** |
| **M5–M8** | Passports, Verifier, Projection, Export | *Не начинались (запланированы)* |

---

## 2. Принятые компоненты и основные математические инварианты

1. **M4-S1 (`SpornFacet`):**
   - Координаты $\tilde{x} = x/r$, $\tilde{y} = y/r$, базовый радиус $r_0 = r/k$, чётность `X0_ODD | X0_EVEN`, целочисленный 4-зонный классификатор (`Z0_ROOT`, `Z1_A1`, `Z3_A3`, `Z2_A2`), точные рациональные параметры формы (`normP = P/r = 2 * normS`).
   - Инварианты: **`SF-INV-01..06`** (+ инвариантность предка `SF-INV-07` в тестах).
2. **M4-S2 (`BerggrenFacet`):**
   - Прямые операторы `stepA1`, `stepA2`, `stepA3`, однозначный спуск `stepParent` / `requireBerggrenParent`, двусторонняя адресация `canonWord` ↔ `rawWord`, наследование примитивного предка для масштабированных троек ($k > 1$, `appliesToPrimitiveAncestor = true`).
   - Инварианты: **`BF-INV-01..06`**.
3. **M4-S3 (`ClassProfileFacet`):**
   - Агрегация класса поверх M3 + S1 + S2 по строгой биекции `tripleId`, раздельные метрики `allTriples` ($N(r)$) и `primitiveTriples` ($T(r)$), сбалансированное попарное суммирование в `ExactRational`, глубины дерева строго по примитивным тройкам.
   - Инварианты: **`CPF-INV-01..12`**.

---

## 3. Контрольные тесты и результаты сборки

- **`npm test` (все 8 наборов):** **PASS** (код `0`):
  - `src/tests/geometry.test.ts` (10 секций) — PASS
  - `src/tests/incenterPartition.test.ts` — PASS
  - `src/tests/core/exactM1.test.ts` (5 секций) — PASS
  - `src/tests/core/factorizationM2.test.ts` (6 секций) — PASS
  - `src/tests/core/classificationM3.test.ts` (6 секций) — PASS
  - `src/tests/core/spornFacetM4S1.test.ts` (`G1–G9`, $r = 1\dots 30$: 174 тройки) — PASS
  - `src/tests/core/berggrenFacetM4S2.test.ts` (корень, 12 переходов 2-го уровня включая все 3 потомка `A2(root)`, $r = 1\dots 30$: 174 тройки / 61 ППТ; $r = 1\dots 50$: 110 уникальных путей) — PASS
  - `src/tests/core/classProfileFacetM4S3.test.ts` (Golden `r=1, 2, 3, 15, 35, 105`, 14 мутаций `CPF-INV-01..12`, 12 негативных тестов `P-NEG-1..4`+, крупный класс `r=420` $N=81>50$, прогон `r=1..120`: 120 классов, 1098 троек, 311 ППТ, 0 нарушений) — PASS
- **`npx tsc --noEmit` / `npm run lint`:** **PASS** (0 ошибок).
- **`npm run build` (`vite build`):** **PASS** (1724 модуля собраны в `dist/`).
- **Статический скан `src/core/facets/` (`Number(`, `Math.`, `parseFloat`, `parseInt`, `Float64`, `toFixed`):** **0 совпадений**.

---

## 4. Перечень файлов, относящихся к M4

### Исходный код (`src/core/facets/`)
- `src/core/facets/types.ts`
- `src/core/facets/errors.ts`
- `src/core/facets/spornFacet.ts`
- `src/core/facets/berggrenFacet.ts`
- `src/core/facets/classProfileFacet.ts`
- `src/core/facets/index.ts`

### Тесты и конфигурация
- `src/tests/core/spornFacetM4S1.test.ts`
- `src/tests/core/berggrenFacetM4S2.test.ts`
- `src/tests/core/classProfileFacetM4S3.test.ts`
- `package.json` (`scripts.test`)

### Синхронизированная документация
- `README.md`, `README_RU.md`, `CHANGELOG.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/architecture/MODULE_BOUNDARIES.md`, `docs/architecture/M4_API_REFERENCE.md`
- `docs/mathematics/M4_MATHEMATICAL_SPECIFICATION.md`
- `docs/development/DEVELOPMENT_ROADMAP.md`, `docs/development/IMPLEMENTATION_STATUS.md`, `docs/development/VERIFICATION_POLICY.md`, `docs/development/M4_VERIFICATION_AND_TESTS.md`
- `M4_STRUCTURAL_FACETS_FINAL.md` *(настоящая контрольная точка)*

---

## 5. Архитектурные характеристики и примечания

1. **Покрытие ветви `A2(root)` закрыто:** в секциях 2–3 `src/tests/core/berggrenFacetM4S2.test.ts` явно проверяются все **12** переходов (прежние 9 для `(5,12,13)`, `(8,15,17)`, `(7,24,25)` и все 3 потомка `A2(root) = (20,21,29)` — `(36,77,85)`, `(119,120,169)`, `(39,80,89)`, плюс точные соотношения $f_1, f_2, f_3$ при $t = 8/6 = 4/3$).
2. **Линейная сложность восстановления пути $O(d)$ (осознанная характеристика архитектуры, не дефект корректности):** `computeBerggrenFacetForTriple` восстанавливает `canonWord` спуском `stepParent`, а `verifyBerggrenFacetInvariants` повторно воспроизводит `canonWord` и `rawWord` с точностью $O(d)$, где $d = \text{treeDepth} \le r_0 - 1$ (на граничной серии $x_0 = 1$ достигается $d = r_0 - 1$). Это осознанный обмен дополнительных вычислений на независимую самопроверку реконструкции пути; искусственные ограничения глубины/радиуса не вводятся, а оптимизация отложена до появления измеренного узкого места производительности.
3. Рабочая среда не является локальным `.git`-репозиторием (`fatal: not a git repository`), поэтому git tag/commit в среде не создавались; контрольная точка зафиксирована документом `M4_STRUCTURAL_FACETS_FINAL.md`.
