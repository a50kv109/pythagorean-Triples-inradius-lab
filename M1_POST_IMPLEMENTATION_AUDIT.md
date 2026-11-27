# M1_POST_IMPLEMENTATION_AUDIT — Независимый пост-реализационный аудит модуля M1 (Exact Computation Core)

**Проект:** *Pythagoras Circles — Canonical Geometry Research Laboratory*  
**Объект аудита:** Модуль **M1 — Exact Computation Core** (`src/core/exact/*`, `src/tests/core/exactM1.test.ts`, `M1_IMPLEMENTATION_REPORT.md`)  
**Режим проверки:** **Строго READ-ONLY** (код, тесты, формулы, конфигурация и модули M2–M8 не изменялись)  
**Дата аудита:** 2026-11-27  

---

## 1. Итоговый вердикт

### **Вердикт: `PASS WITH WARNINGS`**

- **Критических (`Critical`) дефектов:** **0**
- **Математических ошибок или расхождений со спецификацией:** **0**
- **Архитектурных нарушений изоляции ядра:** **0**
- **Замечаний уровня `Medium` / `Low`:** **5** (`M1-AUD-01` — `M1-AUD-05`: производительность повторной нормализации в горячих циклах `ExactRational`, мелкая правка JSDoc и перечень недостающих граничных unit-тестов)

### **Можно ли начинать M2, не рискуя унаследовать ошибки M1?**
**Да. Начинать реализацию M2 (`src/core/factorization/`) поверх текущего M1 безопасно.** Математические формулы, целочисленная арифметика `BigInt`, точный корень `isqrtBigInt`, нормализация `ExactRational` и примитивы радиуса/гиперболы реализованы корректно и устойчивы вплоть до сверхбольших значений ($r = 10^{15}$, $2r^2 = 2\cdot 10^{30} \gg 2^{53}$, $\sqrt{N}$ при $N > 10^{56}$). Зафиксированные предупреждения (`Medium`/`Low`) не искажают вычисления и могут быть устранены либо до, либо параллельно с M2 без ломки публичных контрактов M1.

---

## 2. Объём проверки и фактически прочитанные файлы

В рамках строгого read-only аудита полностью проверены все 7 артефактов M1 и выполнен контрольный прогон `npm test`:

1. `/src/core/exact/errors.ts` (71 строка)
2. `/src/core/exact/bigIntMath.ts` (234 строки)
3. `/src/core/exact/exactRational.ts` (227 строк)
4. `/src/core/exact/radiusPrimitives.ts` (170 строк)
5. `/src/core/exact/index.ts` (10 строк)
6. `/src/tests/core/exactM1.test.ts` (282 строки)
7. `/M1_IMPLEMENTATION_REPORT.md` (110 строк)

### Контрольный запуск существующих тестов (без изменения кода):
- `npm test` (`tsx src/tests/geometry.test.ts && tsx src/tests/incenterPartition.test.ts && tsx src/tests/core/exactM1.test.ts`): **EXIT CODE 0 (PASS)** — все 10 секций `geometry.test.ts`, весь `incenterPartition.test.ts` и все 5 секций `exactM1.test.ts` успешно пройдены.

---

## 3. Аудит математической корректности M1

| # | Проверяемый компонент / инвариант | Реализация и расположение | Результат проверки |
|---|-----------------------------------|---------------------------|--------------------|
| 1 | **`gcdBigInt` и `lcmBigInt`** (знаки, `0n`, переполнение при умножении) | `bigIntMath.ts:152–172` | **PASS.** Оба аргумента приводятся через `absBigInt`; `gcdBigInt(0n, 0n) = 0n`, `gcdBigInt(a, 0n) = |a|`. В `lcmBigInt` при `x === 0n \|\| y === 0n` возвращается `0n`, иначе `(x / gcdBigInt(x, y)) * y` (деление до умножения, хотя в `BigInt` переполнения нет, такой порядок ещё и снижает битовую длину промежуточного произведения). |
| 2 | **`isqrtBigInt`, `isPerfectSquareBigInt`, `exactSqrtBigInt`** (`0`, `1`, точные квадраты, между квадратами, `> 2^53`) | `bigIntMath.ts:197–233` | **PASS.** Для `n < 0n` в `isqrtBigInt`/`exactSqrtBigInt` бросается `InvalidBigIntInputError`; в `isPerfectSquareBigInt` для `n < 0n` возвращается `false`. Для `0n, 1n` — немедленный возврат. Начальное приближение `x = 1n << ((bitLength + 1n) >> 1n)` гарантированно удовлетворяет $x_0 > \sqrt{n} \ge 1$ (т. к. для $k$-битного числа $n < 2^k$ выполняется $2^{\lfloor (k+1)/2 \rfloor} \ge 2^{k/2} > \sqrt{n}$). Монотонный спуск Ньютона `while (y < x)` в целых числах сходится строго к $\lfloor \sqrt{n} \rfloor$ для любых $n$, включая $n = m^2 - 1$ и $n > 10^{56}$. |
| 3 | **Точное деление и делимость** (`divModBigInt`, `isDivisibleBigInt`, `exactDivBigInt`) | `bigIntMath.ts:117–146` | **PASS.** Все три функции защищены от `divisor === 0n` через `assertNonZeroBigInt` (`ExactDivisionByZeroError`). `divModBigInt` корректно задокументирован как truncating division к нулю (`-17n / 5n -> q=-3n, r=-2n`). `exactDivBigInt` проверяет `a % b !== 0n` и бросает `ExactDivisibilityError`. |
| 4 | **`ExactRational` нормализация, знак знаменателя, НОД, ноль, `den === 0n`** | `exactRational.ts:29–72` | **PASS.** `createRational` отвергает `den === 0n` (`ExactDivisionByZeroError`), приводит `0/d` к единственному каноническому `RATIONAL_ZERO ({ num: 0n, den: 1n })`, переносит знак в числитель (`den > 0n` строго), сокращает на `gcdBigInt(nSigned, dPos)` и замораживает объект `Object.freeze`. Все операции (`+`, `-`, `*`, `/`, `neg`, `abs`, `inv`, `pow`) сохраняют инварианты нормализации; `divRational(a, 0)`, `invRational(0)` и `powRational(0, -k)` бросают `ExactDivisionByZeroError`; `powRational(0, 0)` возвращает `RATIONAL_ONE` (согласовано с `powBigInt(0n, 0n) === 1n`). |
| 5 | **Операторы сравнения и формат вывода `ExactRational`** | `exactRational.ts:164–226` | **PASS.** `cmpRational` вычисляет перекрёстное произведение `x.num * y.den` и `y.num * x.den` в `BigInt` при гарантированно `x.den > 0n, y.den > 0n` — без потери точности и без смены знака неравенства. `eqRational` проверяет `x.num === y.num && x.den === y.den` над нормализованными дробями. `formatRational` выводит `"num"` при `den === 1n`, иначе `"num/den"`. |
| 6 | **Диаметр $D = 2r$ и константа гиперболы $2r^2$** | `radiusPrimitives.ts:36–47` | **PASS.** `computeDiameter(r) = 2n * validR`, `computeTwoRSquared(r) = 2n * validR * validR`, обе функции требуют `assertPositiveRadius(r)`. |
| 7 | **Сдвиги $x = a - 2r,\; y = b - 2r$, $xy = 2r^2$ и канонический порядок** | `radiusPrimitives.ts:52–169` | **PASS.** `verifyPythagoreanIdentity` проверяет $a, b, c > 0$ и $a^2 + b^2 = c^2$; `verifyCanonicalOrder` проверяет $0 < a < b < c$. `computeInradiusFromTriple` проверяет пифагорово тождество и $D = a + b - c > 0,\; 2 \mid D$, возвращая $D/2$ (симметрично по $a, b$). `verifyHyperbolaIdentity` проверяет $x \ge 1,\; x < y,\; y \le 2r^2,\; xy = 2r^2,\; x^2 < 2r^2 < y^2$ исключительно в `BigInt`. `computeFactorizationShifts` дополнительно проверяет $x = c - b$ и $y = c - a$. `reconstructTripleFromShifts` восстанавливает $(2r+x,\; 2r+y,\; 2r+x+y)$ только после `verifyHyperbolaIdentity`. |
| 8 | **Граничный случай $r = 1$ и масштабируемые/непримитивные тройки ($C(3)$)** | `radiusPrimitives.ts:93–169`, `exactM1.test.ts:225–240` | **PASS.** Для $r = 1$: $(x, y) = (1, 2)$, $(a, b, c) = (3, 4, 5)$, $1^2 < 2 < 2^2$. Для $C(3)$ проверены как примитивные `(7,24,25)` (`x=1, y=18`), `(8,15,17)` (`x=2, y=9`), так и масштабируемая тройка `(9,12,15)` (`x=3, y=6`, $3^2 = 9 < 18 < 36 = 6^2$). |
| 9 | **Защита от недопустимых радиусов ($r \le 0$)** | `radiusPrimitives.ts:23–31` | **PASS.** `assertPositiveRadius` отвергает `r <= 0n` и любой не-`bigint` (включая `number`, `string`, `null`, `undefined`) с выбросом `InvalidRadiusError`. |

---

## 4. Аудит архитектурной изоляции, точности и обработки ошибок

1. **Отсутствие `number` и `Math.*` в вычислениях:**  
   - Во всех файлах `src/core/exact/*.ts` нет ни `Math.*`, ни `Number(...)`, ни `parseInt`/`parseFloat`.  
   - Особое наблюдение (`bigIntMath.ts:201`): в `isqrtBigInt` используется выражение `BigInt(value.toString(2).length)`. Свойство `.length` двоичной строки имеет тип JS `number` (точное малое целое $\le 2^{29}$ в V8) и сразу оборачивается в `BigInt(...)` только для выбора верхней оценки старта метода Ньютона $x_0 = 2^{\lfloor(k+1)/2\rfloor}$. Плавающая точка IEEE-754 в вычислениях не участвует; корректность результата не зависит от `float64`.  
   - Метод `toNumber()` на `ExactRational` намеренно отсутствует — утечка точности невозможна.

2. **Изоляция от UI, SVG и старой лаборатории:**  
   - Ни один файл `src/core/exact/*.ts` не импортирует `react`, DOM, SVG, `src/math/*`, `src/geometry/*`, `src/canonical/*` или `src/components/*`. Зависимости строго однонаправленные внутри `src/core/exact/`: `errors.ts` ← `bigIntMath.ts` ← `exactRational.ts` и `radiusPrimitives.ts` ← `index.ts`.

3. **Типизированные ошибки и парсинг:**  
   - Иерархия `ExactArithmeticError` (`InvalidBigIntInputError`, `InvalidRadiusError`, `ExactDivisionByZeroError`, `ExactDivisibilityError`, `NotPerfectSquareError`, `ExactIdentityError`) последовательно применяется на всех невалидных входах.  
   - `parseIntegerBigInt` допускает необязательный префикс `+`/`-`, ведущие нули и пробелы по краям (`trim()`), но строго отклоняет дробные числа, экспоненту и нецифровые символы (`'-0'` корректно даёт `0n`).  
   - `parseRational` допускает пробелы вокруг `'/'` (так как обе части после `split('/')` передаются в `parseIntegerBigInt`, который делает `.trim()`), а пустые строки, плавающую точку, несколько `/` и `/0` отклоняет.

4. **Производительность повторной нормализации (`M1-AUD-02`):**  
   - `assertRationalObject` (`exactRational.ts:32–46`) на каждом вызове (включая `cmpRational`, `eqRational`, `ltRational`, `isZeroRational`, `formatRational`) вызывает `createRational(candidate.num, candidate.den)`, что запускает `gcdBigInt` и аллоцирует новый `Object.freeze({...})`.  
   - Это безопасная защитная мера от «поддельных» ненормализованных объектов, но при сортировке больших классов $C(r)$ в будущих модулях M3/M5 она будет вызывать лишние вычисления НОД и аллокации при каждом сравнении. Не является ошибкой корректности (`Low/Medium` техническое предупреждение).

---

## 5. Проверка достаточности тестов M1 и матрица непокрытых граничных сценариев

В `/src/tests/core/exactM1.test.ts` реализовано 5 содержательных секций (включая тест изоляции исходников и точности $> 2^{53}$ и $r = 10^{15}$). Вместе с тем выявлен ряд граничных случаев, которые реализованы в коде корректно, но пока **не закреплены явными assert-проверками** (см. `M1-AUD-04`):

| Идентификатор пробела | Модуль и проверяемая функция | Что именно не покрыто в `exactM1.test.ts` |
|-----------------------|------------------------------|-----------------------------------------|
| `M1-AUD-04a` | `bigIntMath.ts` (`gcdBigInt`, `lcmBigInt`, `isDivisibleBigInt`, `exactDivBigInt`, `parseIntegerBigInt`) | `gcdBigInt(-48n, -18n)` (оба отрицательных); `lcmBigInt(0n, 0n)` и `lcmBigInt(-12n, -18n)`; `isDivisibleBigInt(0n, 5n) === true`; `isDivisibleBigInt(5n, 0n)` (ожидание `ExactDivisionByZeroError`); `exactDivBigInt(0n, -7n) === 0n` и `exactDivBigInt(-84n, -7n) === 12n`; `parseIntegerBigInt('+42')`, `parseIntegerBigInt('-0')`, `parseIntegerBigInt('   ')`. |
| `M1-AUD-04b` | `bigIntMath.ts` (`isqrtBigInt`, `isPerfectSquareBigInt`, `exactSqrtBigInt`) | Граничные значения вокруг квадратов средних и степеней четвёрки (`8n, 9n, 10n`, `24n, 25n, 26n`, нечётная битовая длина `4n, 16n, 64n`); `exactSqrtBigInt(0n) === 0n`, `exactSqrtBigInt(1n) === 1n`, `isPerfectSquareBigInt(0n) === true`, `isPerfectSquareBigInt(1n) === true`, `exactSqrtBigInt(-1n)` (`InvalidBigIntInputError`). |
| `M1-AUD-04c` | `exactRational.ts` (граничные дроби и иммутабельность) | `negRational(RATIONAL_ZERO) === RATIONAL_ZERO`, `absRational(RATIONAL_ZERO) === RATIONAL_ZERO`, `Object.isFrozen(...)`; взаимное обнуление `addRational(a, negRational(a))` и `subRational(a, a)`; `parseRational('0/5')`, `parseRational('-10/-15')`, `parseRational('')`, `parseRational('   ')`, `parseRational('abc')`; `eqRational` для отрицательных дробей и `false`-сценария; `powRational(neg, 2n/3n/-3n)` и `powRational(RATIONAL_ZERO, 3n)`. |
| `M1-AUD-04d` | `radiusPrimitives.ts` (граничные и ошибочные ветки) | `computeDiameter(0n)`, `computeTwoRSquared(0n)`, `computeTwoRSquared(-1n)` (`InvalidRadiusError`); `computeInradiusFromTriple(0n, 4n, 4n)` и `(3n, 4n, 6n)` (`ExactIdentityError`); симметричный вызов `computeInradiusFromTriple(4n, 3n, 5n) === 1n`; `verifyHyperbolaIdentity(0n, 1n, 2n)` (`InvalidRadiusError`) и `verifyHyperbolaIdentity(3n, 0n, 18n) === false`; `computeFactorizationShifts(8n, 15n, 17n)` без 4-го аргумента `r`. |

---

## 6. Анализ достаточности контрактов M1 для следующего этапа (M2)

Публичный API `/src/core/exact/index.ts` полностью покрывает базовые потребности **M2 (`src/core/factorization/`)**:

- **Что M2 получает готовым из M1:**  
  `assertBigInt`, `assertPositiveBigInt`, `assertNonNegativeBigInt`, `assertNonZeroBigInt`, `assertPositiveRadius`, `computeDiameter`, `computeTwoRSquared`, `divModBigInt`, `isDivisibleBigInt`, `exactDivBigInt`, `gcdBigInt`, `lcmBigInt`, `powBigInt`, `isqrtBigInt`, `isPerfectSquareBigInt`, `exactSqrtBigInt`, полный набор `ExactRational` и классы ошибок `ExactArithmeticError`.

- **Что M2 должен реализовать сам (обоснованно отсутствует в M1, т. к. относится к теории чисел уровня M2):**
  1. **Модульное возведение в степень `modPowBigInt(base, exp, mod)`** — необходимо для 13-базового детерминированного Миллера–Рабина (до $3.317 \times 10^{24}$) и вероятностного теста для больших $r$. Может быть реализовано непосредственно внутри `src/core/factorization/` (или добавлено в `bigIntMath.ts` отдельным расширением без ломки контрактов).
  2. **Трёхуровневая сертификация простоты** (`PROVEN_PRIME`, `PROBABLE_PRIME`, `UNFACTORED_COMPOSITE`), пробное деление / Pollard–Rho (Brent), каноническое разложение $r = 2^{e_0}\prod p_i^{e_i}$ и подъём степеней к $2r^2 = 2^{2e_0+1}\prod p_i^{2e_i}$.
  3. **Генерация делителей** $k \mid r$, взаимно простых пар $(u, v)$ для $r/k = uv,\; \gcd(u, v) = 1,\; 2 \nmid v$, а также пар гиперболы $xy = 2r^2,\; 1 \le x < y \le 2r^2$.
  4. **Комбинаторные счётчики** $\omega^*(r)$, $\tau(r)$, $T(r) = 2^{\omega^*(r)}$ и $N(r) = \tau(2r^2)/2$.

Никаких «блокирующих пробелов» в сигнатурах или типах M1, мешающих разработке M2 или изоляции будущего независимого верификатора M6 (который будет опираться только на M1), не обнаружено.

---

## 7. Реестр замечаний и рекомендаций (без внесения правок)

| ID | Серьёзность | Файл и строки | Суть замечания и техническое обоснование | Рекомендация |
|----|-------------|---------------|------------------------------------------|--------------|
| **`M1-AUD-01`** | `Low` | `src/core/exact/bigIntMath.ts:126` | Незавершённый комментарий JSDoc: `Checks exact divisibility (divisor \| dividend). Returns false for divisor === 0n or throws?` — вопрос из черновика остался перед строкой 127, хотя фактическое поведение (бросать `ExactDivisionByZeroError`) однозначно описано и реализовано. | Удалить хвостовую фразу `Returns false for divisor === 0n or throws?` при ближайшем плановом обновлении документации. |
| **`M1-AUD-02`** | `Medium` | `src/core/exact/exactRational.ts:32–46` | `assertRationalObject` на каждой операции чтения, сравнения и форматирования (`cmpRational`, `eqRational`, `isZeroRational`, `formatRational`) заново вызывает `createRational(candidate.num, candidate.den)`, выполняя лишний `gcdBigInt` и аллоцируя новый замороженный объект. На корректность не влияет, но при массовой сортировке больших классов $C(r)$ в M3/M5 создаёт лишние накладные расходы. | При оптимизации (или перед M3/M5) оставить быструю проверку инвариантов (или признак нормализации / отдельный fast-path для `den > 0n` с ленивой или однократной проверкой при создании) в `assertRationalObject`. |
| **`M1-AUD-03`** | `Low` | `src/core/exact/bigIntMath.ts:201` | Использование `value.toString(2).length` в `isqrtBigInt` для выбора начального сдвига Ньютона безопасно математически и не использует `float64`-вычислений, но создаёт временную бинарную строку при каждом вызове корня. Для рабочего диапазона $r$ в браузере (тысячи бит) это незначительно, однако в `M1_IMPLEMENTATION_REPORT.md` корректно отмечено как асимптотическая особенность. | Оставить как есть для текущего диапазона; при необходимости расчёта сверхдлинных чисел (сотни тысяч бит) в будущем заменить на подсчёт битов через сдвиги `BigInt`. |
| **`M1-AUD-04`** | `Medium` | `src/tests/core/exactM1.test.ts` (весь файл) | Не все граничные и негативные сценарии (`M1-AUD-04a`–`M1-AUD-04d`: парное отрицательное НОД/НОК, `0n` в `exactSqrtBigInt`/`isPerfectSquareBigInt`/`isDivisibleBigInt`, граничные `8/9/10` в `isqrtBigInt`, `powRational(neg, ...)`, `Object.isFrozen`, `computeDiameter(0n)`, `computeInradiusFromTriple(4n, 3n, 5n)`) имеют явные assert-тесты. Логика в исходниках верна, но регрессионный щит можно усилить. | Добавить указанные кейсы в `src/tests/core/exactM1.test.ts` как отдельную доработку тестового покрытия перед или во время этапа M2. |
| **`M1-AUD-05`** | `Low` | `src/core/exact/exactRational.ts:82–100`, `src/core/exact/bigIntMath.ts:59–68` | `parseRational(' 6 / 8 ')` допускает пробелы вокруг `'/'`, а `parseIntegerBigInt` допускает ведущий `+`, ведущие нули и `'-0'` (приводит к `0n`). Это разумно, но не зафиксировано явно в JSDoc и тестах как принятая конвенция парсинга. | Задокументировать правила пробелов и знака в JSDoc `parseIntegerBigInt` и `parseRational` и покрыть граничными тестами. |

---

## 8. Заключение для перехода к M2

Модуль **M1 (`src/core/exact/`)** прошёл независимый аудит со статусом **`PASS WITH WARNINGS`**. Блокирующих математических или архитектурных дефектов не выявлено; все 3 существующих тестовых набора (включая `exactM1.test.ts`) проходят без ошибок, изоляция от `number`/`Math.*`/UI соблюдена строго.

**Переход к реализации M2 (`src/core/factorization/`) разрешён.** Рекомендуется при старте или параллельно с M2 закрыть тестовые пробелы `M1-AUD-04` и учесть профилирование `assertRationalObject` (`M1-AUD-02`) перед запуском массовых вычислений в M3–M5.
