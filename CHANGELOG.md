# Changelog — Pythagoras Four Circles Laboratory (PCL)

Все заметные изменения в проекте документируются в этом файле.

## [M5-S1 — ClassPassport + EuclidAdapter (`IMPLEMENTED — PENDING INDEPENDENT AUDIT`)] — 2026-11-28

### Реализовано и доработано (`M5-S1`)
- **Статус этапа:** `IMPLEMENTED — PENDING INDEPENDENT AUDIT` (базовая линия `M1–M4` заморожена и не изменялась; `M5-S2 ClassMatrix` не начат; `M5-S3 RangeCatalog` и `TransversalFacet` отложены; `Price tree` не входит в архитектуру проекта).
- **Созданные модули (`src/core/passports/`):**
  - `types.ts` — контракты `ClassPassportResult` (`specVersion: '0.1'`), `PassportStatus`, `PassportNumberTheorySummary`, `SubclassSpectrumEntry`, `ExpectedMatrixSummary`, `BuildClassPassportInput`, `ClassifiedTripleInput`, `ResolvedEuclideanParameters`.
  - `errors.ts` — типизированные ошибки `ClassPassportError`, `InvalidRadiusError`, `PassportMismatchError`, `MissingProfileError`, `PassportInvariantError`, `EuclidAdapterError`.
  - `euclidAdapter.ts` — `resolveEuclideanParameters(triple)` для бездубликатного чтения `triple.euclideanParams` (с fallback на `recoverEuclideanParameters` из M3 при их отсутствии) и строгой проверки соответствия параметров Евклида исходным примитивным сдвигам `{x0, y0} = {v², 2u²}`.
  - `classPassport.ts` — `buildClassPassport` и `verifyClassPassportInvariants` поверх готовых выходов M2 (`RadiusNumberTheoryResult`), M3 (`RadiusClassificationResult`) и M4-S3 (`ClassProfileFacetResult`) без пересчёта классификации или профиля.
- **Тесты и конфигурация:**
  - Создан тест `src/tests/core/classPassportM5S1.test.ts` (секции 0–5: изоляция `BigInt`, golden-векторы $r = 1, 2, 3, 6, 35, 105$, проверки `EuclidAdapter` включая контрпример `{x0, y0} ≠ {v², 2u²}`, инварианты `CP-INV-01..08`, негативные тесты включая `INCOMPLETE` и несортированные `allTriples`, диапазон $r = 1\dots 30$).
  - Обновлён `package.json` (`scripts.test` теперь последовательно запускает 9 наборов тестов).
- **Ключевые инварианты и поведение M5-S1:**
  - Реализована полная проверка **`CP-INV-01..08`**.
  - Для `COMPLETE`-паспорта строго проверяется возрастающая сортировка `classification.allTriples` по `x` (`expectedMatrixSummary.isSortedByX === true`).
  - При `INCOMPLETE` сохраняются частичные данные M2 (например, доступная `rFactorization` и счётчики/делители до остановки), при этом `profile = null`, `subclassSpectrum = []`, `expectedMatrixSummary = { rowCount: null, isSortedByX: false, firstTripleId: null, lastTripleId: null }`.
  - Разделены вычислительная полнота паспорта (`status: 'COMPLETE' | 'INCOMPLETE'`, `isComplete`) и математическая сертификация M2 (`certificationStatus: 'PROVEN_COMPLETE' | 'PROBABLE_COMPLETE' | 'INCOMPLETE'`).
- **Проверки среды реализации (Gemini; ожидают независимого аудита):**
  - Тест `M5-S1` (`npx tsx src/tests/core/classPassportM5S1.test.ts`) — **PASS**.
  - Все 9 наборов `npm test` — **PASS**.
  - Проверка типов TypeScript (`npx tsc --noEmit`) — **PASS** (0 ошибок).
  - Production-сборка (`npm run build`) — **PASS**.
  - Статический скан `src/core/passports/` на `float64`/`Number()`/`Math.*`/`React` — **`SCAN_CLEAN`**.
  - *Примечание:* указанные результаты получены в среде реализации Gemini и **не заменяют** независимый аудит.

## [M4 — Structural Facets Completed] — 2026-11-28

### Завершено (`M4-S1`, `M4-S2`, `M4-S3` + синхронизация документации)
- **Состав пакета M4 (`src/core/facets/`):**
  - **M4-S1 (`spornFacet.ts` — `SpornFacet`, ACCEPTED):** точные нормированные координаты Спорна (`spornX`, `spornY`), базовый радиус луча $r_0 = r/k$, режим чётности (`X0_ODD` / `X0_EVEN`), целочисленный классификатор 4 зон (`classifySpornZone`), точная рациональная геометрия (`tanHalfA`, `tanHalfB`, `sinA`, `cosA`, `tanA`, `formT`, `asymQ`, `normS`, `normP = P/r = 2 * normS`), инварианты `SF-INV-01..06` и инвариантность предка `SF-INV-07`.
  - **M4-S2 (`berggrenFacet.ts` — `BerggrenFacet`, ACCEPTED):** операторы троичного дерева Берггрена (`stepA1`, `stepA2`, `stepA3`, `stepBerggren`), однозначный спуск к родителю по зоне Спорна (`stepParent`, `requireBerggrenParent`), двусторонняя адресация `canonWord` ↔ `rawWord` (`canonWordToRawWord`, `rawWordToCanonWord`, `applyCanonWord`, `applyRawWord`), наследование примитивного предка для масштабированных троек ($k > 1$, `appliesToPrimitiveAncestor = true`) и инварианты `BF-INV-01..06`.
  - **M4-S3 (`classProfileFacet.ts` — `ClassProfileFacet`, ACCEPTED):** агрегированный профиль класса (`buildClassProfileFacet`, `verifyClassProfileInvariants`) поверх M3 + S1 + S2 со строгой биекцией по `tripleId`, раздельными популяциями `allTriples` ($N(r)$) и `primitiveTriples` ($T(r)$), сбалансированным попарным суммированием дробей `ExactRational`, гистограммами зон, индикатором сжатия $c_{\min} < 5r$, глубинами дерева строго по примитивным тройкам и инвариантами `CPF-INV-01..12`.
- **Новые и обновлённые файлы M4:**
  - Исходный код: `src/core/facets/types.ts`, `src/core/facets/errors.ts`, `src/core/facets/spornFacet.ts`, `src/core/facets/berggrenFacet.ts`, `src/core/facets/classProfileFacet.ts`, `src/core/facets/index.ts`.
  - Тесты: `src/tests/core/spornFacetM4S1.test.ts`, `src/tests/core/berggrenFacetM4S2.test.ts`, `src/tests/core/classProfileFacetM4S3.test.ts`, `package.json` (`scripts.test`).
  - Документация и контрольная точка: `README.md`, `README_RU.md`, `CHANGELOG.md`, `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/architecture/MODULE_BOUNDARIES.md`, `docs/architecture/M4_API_REFERENCE.md`, `docs/mathematics/M4_MATHEMATICAL_SPECIFICATION.md`, `docs/development/DEVELOPMENT_ROADMAP.md`, `docs/development/IMPLEMENTATION_STATUS.md`, `docs/development/VERIFICATION_POLICY.md`, `docs/development/M4_VERIFICATION_AND_TESTS.md`, `M4_STRUCTURAL_FACETS_FINAL.md`.
- **Результаты верификации:** `npm test` (все 8 наборов тестов: геометрия, разбиение инцентром, M1, M2, M3, M4-S1, M4-S2, M4-S3) — **PASS**; `npx tsc --noEmit` — **0 ошибок**; `npm run build` (`vite build`) — **PASS**; статический скан `src/core/facets/` на `Number()`/`Math.*`/`float64` — **0 совпадений**.
- **Корректирующая доработка M4-S2 (`M4-S2 Maintenance — 2026-11-28`):**
  - В `src/tests/core/berggrenFacetM4S2.test.ts` (секции 2–3) к прежним 9 переходам (6 переходов второго уровня от `A1(root)`, `A3(root)` и 3 перехода третьего уровня от `(7,24,25) = A1(A1(root))`) добавлены все 3 перехода второго уровня от `A2(root) = (20,21,29)` (`(36,77,85)`, `(119,120,169)`, `(39,80,89)`) и точные проверки $f_1(4/3)=4/7$, $f_2(4/3)=7/5$, $f_3(4/3)=3/5$ (итого 12 явных переходов: 9 переходов второго уровня и 3 перехода третьего уровня, а не 12 переходов второго уровня).
  - В документации зафиксирована осознанная сложность восстановления и самопроверки пути $O(d)$ ($d \le r_0 - 1$, $d = r_0 - 1$ при $x_0 = 1$); публичные API и production-алгоритмы M1–M4 не изменялись.
- **Среда сборки:** рабочая среда не содержит `.git`, поэтому локальный git-коммит/тег в данной среде не создавался.

## [M3 — Classification Engine Completed] — 2026-11-27

### Завершено (`M3` + стабилизация M2)
- Реализован движок классификации `src/core/classification/` (`classifyRadius`, `buildSubclasses`, `classifyTriple`, `reconstructTriple`, `recoverEuclideanParameters`) и набор тестов `src/tests/core/classificationM3.test.ts` (отчёт: `M3_IMPLEMENTATION_REPORT.md`).
- Завершена дополнительная проверка полноты и упорядоченности делителей в `src/core/factorization/hyperbolaPairs.ts`.

## [1.2.0] — 2026-11-24

### Добавлено (Двухпараметрическая модель $t, \lambda$ и масштабируемый пятый круг)
- **Двухпараметрический математический аппарат (`ThalesCircumcircle.ts`):** Ортогональное разделение формы треугольника ($t = b/a \in \mathbb{R}_{>0}$) и масштаба системы ($\lambda = c/c_0 \in \mathbb{R}_{>0}$). Реализованы функции пропорционального масштабирования `scaleTriangleGeometry` и семплирования кривых гомогении `sampleThalesScaleCurves`.
- **Закон гомогении (Homogeneity Law):** Строго доказано и проверено в тестах, что линейные величины ($D_o, R_o, L_o, r$) масштабируются со степенью 1 ($\lambda$), а площади ($K_o, K_c, K_i, S_c$) — со степенью 2 ($\lambda^2$). Центральное тождество $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$ сохраняет строгую инвариантность для любого $\lambda > 0$.
- **Регулятор и управление масштабом (`ControlsPanel.tsx`, `ThalesCircumcirclePanel.tsx`, `App.tsx`):** Добавлен интерактивный слайдер масштаба $\lambda$ ($0.2$ до $2.5$), быстрые пресеты ($0.5x, 1.0x, 1.5x, 2.0x$) и сброс на эталон `$\lambda = 1.0$`.
- **Новая вкладка спектрального анализа «Масштаб $\lambda$» (`SpectralAnalysisPanel.tsx`):** Визуализация кривых роста величин от $\lambda$, вертикальный маркер эталона $\lambda = 1$, таблица проверки степени гомогении и формульный блок `PCL-G30`.
- **Расширенный тестовый сюит (`src/tests/geometry.test.ts`):** Добавлена **секция 10** (проверка масштабирования $\lambda=1, 2, 0.5$, независимости $t$ и $\lambda$, сохранения всех 17 инвариантов и валидации диапазонов). Все 10 секций успешно пройдены (`10/10 PASS`).
- **Обновлённая документация и паспорта:** Добавлен паспорт `PCL-G30` в `FORMULA_PASSPORTS.md`, обновлены `MATHEMATICAL_FOUNDATION.md`, `USER_GUIDE.md`, `PROJECT_STATUS.md`, `RELEASE_READINESS.md` и создан файл `docs/RELEASE_NOTES_v1.2.0.md`.

## [1.1.0] — 2026-11-24

### Добавлено (Пятый геометрический слой — окружность Фалеса $K_o$)
- Чистое вычислительное ядро пятой окружности `src/math/ThalesCircumcircle.ts` (`calculateThalesCircumcircleFromVertices`, `calculateThalesCircumcircle`): расчёт центра $O_o = \frac{A+B}{2}$ непосредственно по координатам вершин гипотенузы, диаметра $D_o = c$, радиуса $R_o = c/2$, площади $K_o = \frac{\pi c^2}{4}$, длины $L_o = \pi c$, расстояний до всех трёх вершин и фактического вписанного угла $\angle AOB = 90^\circ$.
- Валидатор `src/math/ThalesValidators.ts` с 9 новыми масштабно-инвариантными проверками $K_o$ (`validateThalesCircumcircleInvariants`) и объединённым валидатором `validateAllFiveCirclesInvariants` (17/17 проверок в `InvariantsPanel.tsx` и `TestRunnerModal.tsx`).
- Интеграция на SVG-сцену (`FourCirclesView.tsx`, `GeometryBoard.tsx`): фиолетовая пунктирная окружность $K_o$, центр $O_o$, радиус-вектор $R_o$, переключатель `K_o` и расширенные фильтры слоёв (`4 круга`, `Фалес K_o`, `5 кругов`), а также пошаговая анимация.
- Новый модуль **`05. Окружность Фалеса Kₒ`** (`ThalesCircumcirclePanel.tsx`) и переиспользуемый компонент сравнения $K_c$ и $K_o$ (`KcVsKoComparison.tsx`), показывающий равенство площадей $K_o = K_c$ при различии центров $|O_o - O_c| = c/2$.
- Расширение параметрического анализа (`FourCirclesSpectralAnalysis.ts`, `SpectralAnalysisPanel.tsx`): опциональное наложение $K_o$ на нормированные графики, новая вкладка `Рост K_o(t)` для монотонных ненормированных кривых при $a=1, b=t$, а также живое сопоставление $(a,b)$ vs. $(1,t)$ vs. безразмерных инвариантов.
- Обновлённая трёхъязычная локализация `RU / UK / EN` для всех новых панелей, фильтров, подсказок, 17 инвариантов и модальных окон (`ComparisonModal`, `TestRunnerModal`, `HelpModal`).
- Раздел 9 автоматических тестов в `src/tests/geometry.test.ts` (включая тест на повёрнутом и смещённом треугольнике, проверку монотонности, симметрии обмена катетов и мутационные тесты) + паспорта `PCL-G25`–`PCL-G29` в документации.

## [1.0.0] — 2026-11-24

### Добавлено
- Самостоятельный исследовательский стенд «Пифагор — Лаборатория четырёх кругов» (Pythagoras — Four Circles Laboratory).
- Вычислительное ядро четырёх кругов (`FourCirclesModel.ts`): прямоугольный треугольник $OAB$, три внешних квадрата $Q_a, Q_b, Q_c$, три вписанные окружности $K_a, K_b, K_c$ и четвёртая вписанная окружность $K_i$ внутри треугольника.
- Валидатор 8 инвариантов (`FourCirclesValidators.ts`), включая проверку центрального четырёхкругового тождества $\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}$.
- Интерактивная SVG-сцена (`FourCirclesView.tsx`) с поддержкой фильтрации слоёв, отображения центров и радиусов.
- Числовая панель (`FourCirclesPanel.tsx`), таблица площадей и корней, невязка тождества и контраст площадей.
- Интерактивный параметрический анализ (`FourCirclesSpectralAnalysis.ts`, `SpectralAnalysisPanel.tsx`): график нормированных кривых от $t = b/a$ (площади, периметры, радиусы/диаметры), логарифмическая и линейная шкалы, проход через симметрию $t = 1$ и синхронизация с геометрической моделью.
- Полная документация по методологии UMFP (`PCL-A01`–`PCL-F24`) в каталоге `docs/` (`FORMULA_PASSPORTS.md`, `FORMULA_DEPENDENCY_GRAPH.md`, `MATHEMATICAL_FOUNDATION.md`, `MATHEMATICAL_PROOFS.md`, `NUMERICAL_ANALYSIS.md`, `VERIFICATION_MATRIX.md`, `ARCHITECTURE.md`).
- Лицензирование проекта под стандартной лицензией **MIT License** (`LICENSE`, `Copyright (c) 2026 Andrey Artsybashev`).
- Полная трёхъязычная локализация интерфейса (`RU / UK / EN`) в `src/i18n/translations.ts` для всех панелей, модальных окон, всплывающих подсказок и элементов управления.
- Локальная сборка `katex/dist/katex.min.css` и математических шрифтов средствами Vite (без зависимости от внешнего KaTeX CDN) и очистка неиспользуемых шаблонных зависимостей с выровненным `bun.lock`.
- Автоматический тестовый сюит (`src/tests/geometry.test.ts`) со строгим входным контрактом, проверкой масштабов, дуальности, параметрической синхронизации и мутационными тестами.
