# PHASE 1.1 — VISUAL & MATHEMATICAL WORKSPACE REFINEMENT REPORT

**Проект:** Лаборатория классификации пифагоровых троек (`Pythagoras — Circles & Classification Lab`)  
**Этап:** Phase 1.1 — визуальная, терминологическая и математическая шлифовка каркаса (без реализации модулей `M1–M8`)  
**Статус модулей ядра:** `M1–M8` не реализованы; сохраняется строгое разделение между статическими документальными эталонами, открытыми вопросами (`OQ-01..06`) и будущими динамическими расчётами.

---

## 1. Выявленные дефекты визуального и кодового аудита (Phase 1 -> Phase 1.1)

1. **Смешение выбранного класса `C(r)` и демо-треугольника `(3, 4, 5)` в Геометрическом инспекторе (`GeometricInspectorSection.tsx`):**
   - При глобально выбранном `r = 3` раздел `05` по умолчанию открывал треугольник `(3, 4, 5)` (`r = 1`), а первый пресет содержал двусмысленную подпись, что создавало ложное впечатление принадлежности `(3, 4, 5)` классу `C(3)`.
   - Кнопка переключения боковой панели внутри `GeometryBoard` была подключена к заглушке `onToggleRightPanel={() => {}}` («мертвый» клик).
   - Отсутствовал явно типизированный контракт интерфейса будущего адаптера `M7` (`tripleToSvgGeometry`).

2. **Неполная видимость 7 разделов в верхней панели и скрытие пресетов `r` (`ClassificationTopBar.tsx`, `RadiusRibbon.tsx`):**
   - `TOP_NAV_SECTIONS` в `ClassificationTopBar` содержал только 5 из 7 разделов (`01, 02, 03, 04, 07`), опуская `05. Геометрический инспектор` и `06. Структурный анализ`.
   - Быстрые пресеты радиусов в `RadiusRibbon` были скрыты на экранах уже `1280px` (`hidden xl:flex`), снижая удобство на стандартных ноутбуках (`1024px–1279px`).

3. **Смешение утверждённых формул и открытого вопроса `OQ-02` в Структурном анализе (`StructuralAnalysisSection.tsx`):**
   - Кандидатная формула асимметрии `q = (b - a)/(a + b) = (t - 1)/(t + 1)` находилась в основном блоке KaTeX рядом с утверждёнными формулами координат Спорна и групповой структуры, что визуально создавало ощущение её финализации, хотя `OQ-02` в `DESIGN_REVIEW.md` открыт.

4. **Неточная подпись и отсутствие по-радиусной таблицы `r = 1…6` в Атласе классов (`ClassAtlasSection.tsx`):**
   - Подпись перед `T(r) = 2^{ω*(r)}, N(r) = τ(2r²)/2` ошибочно называла их «Точная граница» (тогда как границы относятся к `c_min, c_max`).
   - В разделе не хватало компактной по-радиусной таблицы `r = 1…6` (таблица 3.2 из 39-страничного PDF / `BENCHMARK_DATA_CATALOG.md §3`), явно отделённой от агрегатов по диапазонам (`1..30`, `31..100`, `1..100`) и будущих динамических вычислений `M2 + M3 + M6`.

5. **Межъязыковая согласованность терминологии (`ru`, `uk`, `en`):**
   - Добавлены компактные ключи `navShort` (`01`..`07`) и унифицирована терминология (`inradius r`, `diameter D = 2r`, `class C(r)`, `subclass C_k(r)`, `primitive triples`, `factorization pair (x, y)`, `exact arithmetic`, `approximate visualization`).

---

## 2. Проверка математической точности отображаемых формул

Проверена корректность всех математических определений, отображаемых в интерфейсе Phase 1.1:
- **Гиперболическая факторизационная модель:** `xy = 2r²`, сдвиги `x = a - 2r = c - b`, `y = b - 2r = c - a`.
- **Канонические неравенства (строгая упорядоченность катетов `0 < a < b < c`):**  
  `1 <= x < sqrt(2) * r < y <= 2r²` (верхняя граница `y = 2r²` достигается при `x = 1`, включая `r = 1`).
- **Счётные функции:** `T(r) = 2^{ω*(r)} >= 1` (число ППТ), `N(r) = τ(2r²)/2 = Σ_{k|r} T(r/k)` (полное число троек в классе), `|C_k(r)| = T(r/k)` (мощность подкласса масштаба `k | r`).
- **Границы гипотенузы в `C(r)`:** `(2 + 2√2)r < c_min <= 5r` (отделено от счётных формул `T(r)` и `N(r)`), `c_max = 2r² + 2r + 1`.
- **Разделение контуров точности:** точные целочисленные и рациональные величины (`BigInt / ExactRational`) явно отделены от приближённой 2D-геометрии SVG (`float64`).

---

## 3. Выполненные исправления

- **Типы и контракт `M7` (`/src/types/classification.ts`):**
  - Добавлены интерфейсы `AtlasPerRadiusRow`, `DocumentedTripleExample`, а также подготовленный контракт `M7OrientationMode` и `M7SvgProjectionInput` для будущего модуля `M7` (без реализации логики `M7`).
- **Локализация и единая терминология (`/src/i18n/translations.ts`):**
  - Добавлены поля `navShort` для всех 7 разделов (`ru`, `uk`, `en`), стандартизированы переводы терминов `C(r)`, `C_k(r)`, `factorization pair (x, y)`, `exact arithmetic`, `approximate visualization`.
- **Эталонные статические данные (`/src/components/workspace/workspaceMetadata.ts`):**
  - Добавлены `PER_RADIUS_REFERENCE_R1_R6` (`r = 1…6`) и `DOCUMENTED_CLASS_EXAMPLES` (для `r = 1` и `r = 3`: `(7, 24, 25), (8, 15, 17), (9, 12, 15)`).
  - Пресеты `GEOMETRIC_PREVIEW_SAMPLES` явно переименованы как автономные демо-треугольники SVG-движка (`r_demo`), не привязанные к `C(r)`.
  - Поля `asym_q` (`OQ-02`) и `berggren_path` (`OQ-05`) помечены как неутверждённые кандидаты.
- **Верхняя панель и лента радиуса (`/src/components/workspace/ClassificationTopBar.tsx`, `/src/components/workspace/RadiusRibbon.tsx`):**
  - Верхняя панель теперь выводит все 7 разделов (`WORKSPACE_SECTION_ORDER`) через `navShort` с безопасной горизонтальной прокруткой `overflow-x-auto`.
  - Быстрые пресеты `r` в `RadiusRibbon` доступны с брейкпоинта `lg` с переносом `flex-wrap`.
- **Геометрический инспектор (`/src/components/workspace/sections/GeometricInspectorSection.tsx`, `/src/App.tsx`):**
  - Раздел разделён на два явных блока: (A) *Контекст выбранного класса `C(r)`* (с таблицей статических документированных примеров для `r = 1` и `r = 3`, исключающей попадание `(3, 4, 5)` в `C(3)`, и заглушкой `M3 + M5 + M7` для остальных `r`), и (B) *Автономная демонстрация SVG-движка (`GeometryBoard`, приближение `float64`)* с явной индикацией `r_demo`.
  - Убран «мертвый» обработчик `onToggleRightPanel={() => {}}` — передаются реальные `isInspectorOpen` и `onToggleInspector` из `App.tsx`, а также `m7Projection={null}`.
- **Атлас классов (`/src/components/workspace/sections/ClassAtlasSection.tsx`):**
  - Исправлена подпись «Точная граница:» на «Формулы подсчёта:».
  - Чётко разделены 3 слоя: (1) сводные агрегаты `1..30`, `31..100`, `1..100`, (2) компактная по-радиусная таблица `r = 1…6` (статический справочник PDF с кнопкой выбора `r`), (3) будущий динамический расчёт `M2 + M3 + M6`.
- **Структурный анализ (`/src/components/workspace/sections/StructuralAnalysisSection.tsx`):**
  - Утверждённые формулы Спорна ($\tilde{x}, \tilde{y}, \tilde{x}\tilde{y}=2, \tan(A/2), \tan(B/2), t=b/a$, группа $\odot$) отделены от неутверждённой метрики `asym_q`, вынесенной в отдельный блок `OQ-02 · НЕ УТВЕРЖДЕНО` с перечислением альтернатив из `DESIGN_REVIEW.md` (`(b-a)/c`, `y/x`, `(y-x)/(y+x)`, `ln(b/a)`).
  - Вкладка деревьев явно фиксирует открытый статус формата `berggren_word` (`OQ-05`).

---

## 4. Изменённые и созданные файлы

- Изменены:
  - `/src/types/classification.ts`
  - `/src/i18n/translations.ts`
  - `/src/components/workspace/workspaceMetadata.ts`
  - `/src/components/workspace/ClassificationTopBar.tsx`
  - `/src/components/workspace/RadiusRibbon.tsx`
  - `/src/components/workspace/sections/GeometricInspectorSection.tsx`
  - `/src/components/workspace/sections/ClassAtlasSection.tsx`
  - `/src/components/workspace/sections/StructuralAnalysisSection.tsx`
  - `/src/App.tsx`
- Создан:
  - `/PHASE_1_1_REFINEMENT_REPORT.md`
- Не тронуты (строго сохранены без изменений):
  - `src/math/*`, `src/geometry/*`, `src/components/workspace/LegacyGeometryWorkspace.tsx`, `docs/*`, `TRANSFORMATION_ANALYSIS.md`, `DESIGN_REVIEW.md` и корневые файлы базы знаний.

---

## 5. Остающиеся открытые вопросы и следующие этапы

- **Открытые проектные решения (`OQ-01..OQ-06`):**
  - `OQ-01`: Ориентация катетов `a < b` на осях чертежа (`b_horizontal_a_vertical` vs `a_horizontal_b_vertical`) при подключении `M7`.
  - `OQ-02`: Окончательная формула `asym_q` (кандидат v0.1 vs альтернативы `DESIGN_REVIEW.md`).
  - `OQ-04`: Браузерные бюджеты для больших `r` и `N(r)`.
  - `OQ-05`: Семантика и направление чтения `berggren_word`.
- **Нереализованные модули (следующая фаза после утверждения):** `M1` (BigInt/Rational ядро), `M2` (факторизация и сертификация), `M3` (двойная генерация `C(r)` и `C_k(r)`), `M4` (фасеты), `M5` (паспорта и матрицы), `M6` (независимый верификатор `CHK-01…12`), `M7` (адаптер SVG-проекции), `M8` (экспорт CSV/JSON).

---

## 6. Результаты проверок (фактические запуски после правок Phase 1.1)

- **Сборка Vite (`compile_applet`):** успешна (`Build succeeded - the applet is compiled`).
- **Проверка типов TypeScript (`lint_applet` / `tsc --noEmit`):** успешна, 0 ошибок.
- **Существующие модульные тесты (`npm test`):**
  - `src/tests/geometry.test.ts` — пройдены все 10 секций (`ALL 10 SECTIONS OF PYTHAGORAS — FIVE CIRCLES GEOMETRY LAB PASSED!`).
  - `src/tests/incenterPartition.test.ts` — пройдены все проверки разбиения по инцентру (`ALL INCENTER PARTITION TESTS PASSED! S = SA + SB + SC = pr VERIFIED!`).
