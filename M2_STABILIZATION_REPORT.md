# M2_STABILIZATION_REPORT — Отчёт о стабилизационном патче модуля M2 (Contract Hardening)

**Проект:** *Pythagoras Circles — Canonical Geometry Research Laboratory*  
**Этап:** **Implementation Phase M2 — Stabilization Patch (Contract Hardening)**  
**Статус:** Все 6 замечаний из `M2_POST_IMPLEMENTATION_AUDIT.md` (`M2-AUD-01` .. `M2-AUD-06`) успешно устранены; модули **M3–M8 не реализовывались**.  
**Дата:** 2026-11-27  

---

## 1. Сводка устранённых замечаний (`M2-AUD-01` .. `M2-AUD-06`)

| ID замечания | Описание проблемы из аудита | Принятое техническое решение и исправление | Файл(ы) изменений |
| :--- | :--- | :--- | :--- |
| **`M2-AUD-01`** | `passesMillerRabinBase(n, base)` не выполняла строгую валидацию $2 \le a < n$, допуская некорректные базы (напр., `base = 1` или `base >= n`), возвращающие ложный `true` из-за неконтроллируемого деления по модулю. | Введена строгая проверка домена в `passesMillerRabinBase`: при $n \le 2$ или чётном $n$, а также при выходе основания за пределы $2 \le \text{base} < n$, выбрасывается `InvalidFactorizationInputError`. Добавлены тесты для `base = 1`, `base = n`, `base = n + 1`. | `src/core/factorization/primality.ts` |
| **`M2-AUD-02`** | Standalone-функция `buildHyperbolaDivisorPairs(r, twoRSquaredDivisors)` принимала неполный симметричный набор делителей без проверки по $\tau(2r^2)$. | В начале `buildHyperbolaDivisorPairs` добавлена обязательная проверка длины переданного списка делителей по точному значению $\tau(2r^2)$, вычисляемому через каноническое разложение $2r^2$. Неполные списки (напр., `[1n, 18n]` для $r=3$) теперь гарантированно выбрасывают `IncompleteFactorizationError`. | `src/core/factorization/hyperbolaPairs.ts` |
| **`M2-AUD-03`** | Несогласованность между константой `DEFAULT_TRIAL_PROOF_MAX_N = 10_000_000_000n` и жёстким ограничением `vn <= 100_000_000n` в `certifyPrimality`. | Жёсткое ограничение `&& vn <= 100_000_000n` удалено; теперь детерминированное пробное деление управляется единым параметром `trialProofMaxN` (по умолчанию `10_000_000_000n`), что устраняет расхождение контракта. | `src/core/factorization/primality.ts` |
| **`M2-AUD-04`** | Генератор дополнительных оснований Миллера–Рабина при `probablePrimeRounds > 25n` мог теоретически повторять уже протестированные базы. | Внутри `buildDeterministicProbableBases` задействован `Set<string>`, отсекающий любые повторяющиеся основания (как из фиксированного пула, так и из детерминированной LCG-последовательности). | `src/core/factorization/primality.ts` |
| **`M2-AUD-05`** | Вспомогательная функция `addPrime` при слиянии записей одинакового простого сомножителя могла теоретически повысить статус до `PROVEN_PRIME` при конфликте. | Логическое «ИЛИ» (`||`) заменено на консервативное «И» (`&&`): статус `PROVEN_PRIME` сохраняется только тогда, когда и существующий, и входящий фактор имеют статус `PROVEN_PRIME`; в противном случае результат консервативно остаётся `PROBABLE_PRIME`. | `src/core/factorization/primeFactorization.ts` |
| **`M2-AUD-06`** | В цикле отката алгоритма Pollard–Brent (`g === n`) не проверялся лимит реального времени `deadlineMs`. | Внутрь цикла `do ... while (g === 1n)` добавлена проверка `nowMsBigInt() >= deadlineMs` с корректным возвратом статуса `TIME_BUDGET_EXCEEDED`, обеспечивающая гарантированное завершение по таймауту. | `src/core/factorization/primeFactorization.ts` |

---

## 2. Перечень изменённых файлов

1. `/src/core/factorization/primality.ts` (`M2-AUD-01`, `M2-AUD-03`, `M2-AUD-04`)
2. `/src/core/factorization/hyperbolaPairs.ts` (`M2-AUD-02`)
3. `/src/core/factorization/primeFactorization.ts` (`M2-AUD-05`, `M2-AUD-06`)
4. `/src/tests/core/factorizationM2.test.ts` (добавлены прямые регрессионные тесты на все устранённые замечания)
5. `/M2_STABILIZATION_REPORT.md` (настоящий отчёт)

*Файлы M1, старой лаборатории, UI и документы M3–M8 не изменялись.*

---

## 3. Публичный API и изменения контрактов

- **Изменений публичного контракта M2, ломающих обратную совместимость, нет.**
- Функция `passesMillerRabinBase` теперь более строго валидирует домен и отклоняет недопустимые основания ($a < 2$ или $a \ge n$), что повышает безопасность утилиты.
- Функция `buildHyperbolaDivisorPairs` стала безопаснее для standalone-вызовов благодаря встроенной проверке полноты списка делителей.

---

## 4. Результаты верификации и тестов

После применения стабилизационного патча выполнены обязательные проверки:

1. **TypeScript Type Checking (`tsc --noEmit` / `lint_applet`):** **PASS** (0 ошибок).
2. **Тестовый набор (`npm test`):** **PASS** (код возврата `0`):
   - `src/tests/geometry.test.ts` (10 секций): **PASS**
   - `src/tests/incenterPartition.test.ts`: **PASS**
   - `src/tests/core/exactM1.test.ts` (5 секций): **PASS**
   - `src/tests/core/factorizationM2.test.ts` (6 секций, включая новые тесты на `passesMillerRabinBase` и standalone `buildHyperbolaDivisorPairs`): **PASS**
3. **Production Build (`vite build` / `compile_applet`):** **PASS** (успешная сборка).

---

## 5. Подтверждение отсутствия реализации M3

Настоящим подтверждается, что в рамках данного этапа **модуль M3 (`Classification Engine`) не реализовывался**. Выполнены исключительно стабилизация и закалка контрактов вычислительного ядра M2.

---

## 6. Заключение

Вычислительное ядро **M2 (`src/core/factorization/`)** полностью стабилизировано, все замечания аудита закрыты. Система готова служить надёжным арифметическим фундаментом для следующего этапа — **M3 (Классификация троек и построение слоёв $C_k(r)$)**.
