/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export type LanguageCode = 'ru' | 'uk' | 'en';

export interface InvariantText {
  name: string;
  description: string;
}

export interface Translations {
  brandTitle: string;
  aria: {
    boardSection: string;
    panelAside: string;
  };
  modules: {
    fourCircles: string;
    identityProof: string;
    incircleFocus: string;
    spectralAnalysis: string;
    thalesCircumcircle: string;
    arcClassification: string;
    arcAngleAnalysis: string;
    incircleArcDistribution: string;
    arcSideArea: string;
  };
  actions: {
    compare: string;
    tests: string;
    help: string;
    undo: string;
    redo: string;
    reset: string;
    save: string;
    saved: string;
    load: string;
    snapshotPng: string;
    snapshotSvg: string;
    buildAnim: string;
    expandBoard: string;
    showPanel: string;
    close: string;
  };
  toolbar: {
    configsTitle: string;
    exportJson: string;
    importJson: string;
    noSavedConfigs: string;
    deleteConfig: string;
    snapshotPngTitle: string;
    snapshotSvgTitle: string;
  };
  modes: {
    school: string;
    research: string;
  };
  board: {
    layers: string;
    all: string;
    triIncircle: string;
    squares: string;
    squareCircles: string;
    fourCirclesOnly: string;
    thalesOnly: string;
    fiveCircles: string;
    incenterPartition: string;
    circumcircleToggle: string;
    circumcircleToggleTitle: string;
    grid: string;
    labels: string;
    centers: string;
    radii: string;
    angles: string;
    zoomInTitle: string;
    zoomOutTitle: string;
    fitViewTitle: string;
    resetViewTitle: string;
    dragHint: string;
    hoverDefault: string;
  };
  hover: {
    vertexPrefix: string;
    coordsLabel: string;
    dragY: string;
    dragX: string;
    fixedVertex: string;
    originTitle: string;
    originDetails: string;
    triangleTitle: string;
    triangleLegsPrefix: string;
    triangleHypLabel: string;
    legOATitle: string;
    legOBTitle: string;
    lengthUnit: string;
    projHyp: string;
    hypABTitle: string;
    hypDetailsSuffix: string;
    squareQaTitle: string;
    squareQbTitle: string;
    squareQcTitle: string;
    sideLabel: string;
    areaLabel: string;
    circleKaTitle: string;
    circleKbTitle: string;
    circleKcTitle: string;
    circleKiTitle: string;
    circleKoTitle: string;
    circumcenterTitle: string;
    thalesRadiusTitle: string;
    thalesDiameterTitle: string;
    tanOATitle: string;
    tanOBTitle: string;
    tanABTitle: string;
    incenterTitle: string;
  };
  controls: {
    title: string;
    setIsoscelesTitle: string;
    legALabel: string;
    legBLabel: string;
    unitShort: string;
    presetsTitle: string;
    pause: string;
    smoothSweep: string;
    reset345: string;
    scaleTitle: string;
    scaleDesc: string;
    scaleReset: string;
    presetDescriptions: Record<string, string>;
  };
  panel: {
    title: string;
    subtitle: string;
    identityTitle: string;
    identityHold: string;
    identityFail: string;
    lhsLabel: string;
    rhsLabel: string;
    residualLabel: string;
    proofTitle: string;
    incircleTitle: string;
    incircleDescBefore: string;
    incircleDescMiddle: string;
    incircleDescAfter: string;
    legA: string;
    legB: string;
    hypC: string;
    radiusKi: string;
    colCircle: string;
    colLocation: string;
    colDim: string;
    colArea: string;
    colSqrt: string;
    locSquareQa: string;
    locSquareQb: string;
    locSquareQc: string;
    locInsideTri: string;
    locCircumscribed: string;
    areaContrastTitle: string;
    equalsMinusKi: string;
    contrastNoteBefore: string;
    contrastNoteMiddle: string;
    contrastNoteAfter: string;
    coordinatesTitle: string;
    kcVsKo: {
      title: string;
      badgeEq: string;
      badgeDiffCenter: string;
      colParam: string;
      rowRole: string;
      roleKc: string;
      roleKo: string;
      rowCenter: string;
      rowDiameter: string;
      rowRadius: string;
      rowArea: string;
      rowCircumference: string;
      rowVertices: string;
      verticesKc: string;
      verticesKo: string;
      rowAreaDiff: string;
      rowCenterDist: string;
    };
  };
  thalesPanel: {
    title: string;
    subtitle: string;
    theoremTitle: string;
    theoremSummary: string;
    metricDo: string;
    metricRo: string;
    metricKo: string;
    metricLo: string;
    checksTitle: string;
    angleCheckLabel: string;
    centerCoordLabel: string;
    distALabel: string;
    distBLabel: string;
    distOLabel: string;
    centersComparisonTitle: string;
    incenterRole: string;
    circumcenterRole: string;
    kcCenterRole: string;
    scaleCardTitle: string;
    scaleCardSubtitle: string;
    scaleSliderLabel: string;
    scaleMetricLinear: string;
    scaleMetricArea: string;
    scaleTableTitle: string;
    scaleInvariantNote: string;
  };
  spectral: {
    title: string;
    subtitleBefore: string;
    subtitleAfter: string;
    tabAreas: string;
    tabPerimeters: string;
    tabRadiiDiameters: string;
    tabThalesAbs: string;
    tabScaleLambda: string;
    scaleTitle: string;
    scaleSubtitle: string;
    scaleFormulaTitle: string;
    colScale: string;
    scaleDeg1: string;
    scaleDeg2: string;
    scaleLawLinear: string;
    scaleLawQuadratic: string;
    koOverlayToggle: string;
    thalesNormNote: string;
    thalesAbsTitle: string;
    thalesAbsDesc: string;
    thalesAbsFormulaTitle: string;
    thalesLiveReadoutTitle: string;
    colDimensional: string;
    colNormalizedUnit: string;
    colRatioNorm: string;
    linearNoteBefore: string;
    linearNoteMiddle: string;
    linearNoteAnd: string;
    linearNoteAfter: string;
    radiiBtn: string;
    diametersBtn: string;
    plotTitle: string;
    logScaleBtn: string;
    logScaleTitle: string;
    linearScaleBtn: string;
    linearScaleTitle: string;
    zoomInTitle: string;
    zoomOutTitle: string;
    resetRangeTitle: string;
    symmetryBtn: string;
    symmetryBtnTitle: string;
    pauseBtn: string;
    sweepBtn: string;
    outOfRangeBefore: string;
    outOfRangeMiddle: string;
    fitRangeBtn: string;
    svgAriaLabel: string;
    axisLogLabel: string;
    axisLinearLabel: string;
    symmetryTag: string;
    currentPointLabel: string;
    referenceTitle: string;
    legAShort: string;
    legBShort: string;
    hypCShort: string;
    radRShort: string;
    colCircle: string;
    colArea: string;
    colPerimeter: string;
    colRadius: string;
    colDiameter: string;
    shareToggle: string;
    shareLabel: string;
    formulaSecA: string;
    formulaAsteriskNote: string;
    formulaSecBNormalizedAreas: string;
    formulaSecBNormalizedPerimeters: string;
    formulaSecBNormalizedRadii: string;
    formulaSecBNormalizedDiameters: string;
    formulaSecCRatioAreas: string;
    formulaSecCRatioPerimeters: string;
    formulaSecCRatioRadii: string;
    formulaSecCRatioDiameters: string;
    atSymmetryNotice: string;
  };
  invariants: {
    title: string;
    confirmedSuffix: string;
    subtitle: string;
    calcLabel: string;
    expectedLabel: string;
    groupFourCircles: string;
    groupThales: string;
    items: Record<string, InvariantText>;
  };
  compareModal: {
    title: string;
    subtitle: string;
    captureBtn: string;
    loadBtn: string;
    config1: string;
    config2: string;
    colQuantity: string;
    colConf1: string;
    colConf2: string;
    metrics: {
      legA: string;
      legB: string;
      hypC: string;
      inradiusR: string;
      radiusRo: string;
      areaKa: string;
      areaKb: string;
      areaKc: string;
      areaKi: string;
      areaKo: string;
    };
  };
  testModal: {
    title: string;
    subtitle: string;
    colTriangle: string;
    colProfile: string;
    colChecks: string;
    colDelta: string;
    colAction: string;
    okStatus: string;
    failStatus: string;
    openBtn: string;
    openTitle: string;
    allPassBanner: string;
    failBanner: string;
    cases: Record<string, string>;
  };
  helpModal: {
    title: string;
    subtitle: string;
    sec1Title: string;
    sec1IntroBefore: string;
    sec1IntroAnd: string;
    sec1IntroTriangle: string;
    kaDesc1: string;
    kaDesc2: string;
    kaDesc3: string;
    kbDesc1: string;
    kbDesc2: string;
    kbDesc3: string;
    kcDesc1: string;
    kcDesc2: string;
    kcDesc3: string;
    kiDesc1: string;
    kiDesc2: string;
    kiDesc3: string;
    koDesc1: string;
    koDesc2: string;
    koDesc3: string;
    kaColor: string;
    kbColor: string;
    kcColor: string;
    kiColor: string;
    koColor: string;
    sec2Title: string;
    sec2Text1: string;
    sec2TextAnd: string;
    sec2Text2: string;
    sec2Text3: string;
    sec3Title: string;
    sec3Bullet1: string;
    sec3Bullet2Before: string;
    sec3Bullet2After: string;
    sec4Title: string;
    sec4Text: string;
    gotItBtn: string;
  };
  classificationLab: {
    brandTitle: string;
    legacyBtn: string;
    backToClassificationBtn: string;
    legacyBannerTitle: string;
    legacyBannerSubtitle: string;
    radiusLabel: string;
    diameterLabel: string;
    applyRadiusBtn: string;
    invalidRadiusError: string;
    quickRadiiLabel: string;
    exactDomainLegend: string;
    approxDomainLegend: string;
    toggleInspectorShow: string;
    toggleInspectorHide: string;
    sidebarWorkspaceLabel: string;
    sidebarLegacySectionLabel: string;
    inspectorTitle: string;
    inspectorActiveClass: string;
    inspectorReadinessTitle: string;
    inspectorOpenQuestionsTitle: string;
    emptyStates: {
      not_implemented: string;
      awaiting_verified_data: string;
      under_development: string;
    };
    sections: {
      class_atlas: { navShort: string; short: string; title: string; subtitle: string };
      class_inspector: { navShort: string; short: string; title: string; subtitle: string };
      triple_matrix: { navShort: string; short: string; title: string; subtitle: string };
      hyperbola_divisors: { navShort: string; short: string; title: string; subtitle: string };
      geometric_inspector: { navShort: string; short: string; title: string; subtitle: string };
      structural_analysis: { navShort: string; short: string; title: string; subtitle: string };
      verification_export: { navShort: string; short: string; title: string; subtitle: string };
    };
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  ru: {
    brandTitle: 'Pythagoras — Four Circles',
    aria: {
      boardSection: 'Интерактивная геометрическая сцена четырёх кругов',
      panelAside: 'Панель управления и числового наблюдения',
    },
    modules: {
      fourCircles: '01. Четыре круга',
      identityProof: '02. Тождество √K',
      incircleFocus: '03. Вписанный круг Kᵢ',
      spectralAnalysis: '04. Спектральный анализ',
      thalesCircumcircle: '05. Окружность Фалеса Kₒ',
      arcClassification: '06. Дуга и классификация',
      arcAngleAnalysis: '07. Дуга и углы',
      incircleArcDistribution: '08. Три дуги Kᵢ',
      arcSideArea: '09. Дуги–Стороны–Площади',
    },
    actions: {
      compare: 'Сравнить',
      tests: 'Тесты 17/17',
      help: 'Справка',
      undo: 'Отменить',
      redo: 'Вернуть',
      reset: 'Сброс',
      save: 'Сохранить',
      saved: 'Сохранено',
      load: 'Загрузить',
      snapshotPng: 'Снимок PNG',
      snapshotSvg: 'SVG',
      buildAnim: 'Пошагово',
      expandBoard: 'Скрыть панель',
      showPanel: 'Показать панель',
      close: 'Закрыть',
    },
    toolbar: {
      configsTitle: 'Конфигурации',
      exportJson: 'Экспорт JSON',
      importJson: 'Импорт JSON',
      noSavedConfigs: 'Нет сохранённых точек',
      deleteConfig: 'Удалить',
      snapshotPngTitle: 'Скачать снимок эксперимента (PNG)',
      snapshotSvgTitle: 'Скачать векторный чертёж (SVG)',
    },
    modes: {
      school: 'Наглядный',
      research: 'Исследовательский',
    },
    board: {
      layers: 'Слои:',
      all: 'Все',
      triIncircle: '△ и Kᵢ',
      squares: 'Квадраты Q',
      squareCircles: 'Круги K_a,b,c',
      fourCirclesOnly: '4 круга',
      thalesOnly: 'Описанная K_o',
      fiveCircles: 'Все 5 кругов',
      incenterPartition: 'Разбиение через I',
      circumcircleToggle: 'K_o',
      circumcircleToggleTitle: 'Показать или скрыть описанную окружность Фалеса K_o',
      grid: 'Сетка',
      labels: 'Подписи',
      centers: 'Центры',
      radii: 'Радиусы',
      angles: 'Углы',
      zoomInTitle: 'Увеличить',
      zoomOutTitle: 'Уменьшить',
      fitViewTitle: 'Вписать конструкцию',
      resetViewTitle: 'Сброс вида',
      dragHint: 'Тяните A по вертикали или B по горизонтали · Колёсико для зума',
      hoverDefault: 'Наведите на круг, квадрат или сторону для инспекции',
    },
    hover: {
      vertexPrefix: 'Вершина',
      coordsLabel: 'Координаты',
      dragY: 'Перемещение по вертикальной оси (x = 0)',
      dragX: 'Перемещение по горизонтальной оси (y = 0)',
      fixedVertex: 'Фиксированная вершина',
      originTitle: 'Вершина O (Прямой угол 90°)',
      originDetails: 'Фиксированное начало координат (0, 0). Гарантирует сохранение прямого угла.',
      triangleTitle: 'Прямоугольный треугольник OAB',
      triangleLegsPrefix: 'Катеты',
      triangleHypLabel: 'гипотенуза',
      legOATitle: 'Вертикальный катет OA',
      legOBTitle: 'Горизонтальный катет OB',
      lengthUnit: 'Длина',
      projHyp: 'Проекция на гипотенузу',
      hypABTitle: 'Гипотенуза AB',
      hypDetailsSuffix: 'Сторона квадрата Q_c и диаметр кругов K_c и K_o',
      squareQaTitle: 'Квадрат Q_a на катете a',
      squareQbTitle: 'Квадрат Q_b на катете b',
      squareQcTitle: 'Квадрат Q_c на гипотенузе c',
      sideLabel: 'Сторона',
      areaLabel: 'Площадь',
      circleKaTitle: 'Круг K_a (вписан в квадрат Q_a)',
      circleKbTitle: 'Круг K_b (вписан в квадрат Q_b)',
      circleKcTitle: 'Круг K_c (вписан в квадрат Q_c)',
      circleKiTitle: 'Вписанный круг K_i (внутри треугольника OAB)',
      circleKoTitle: 'Описанная окружность Фалеса K_o (вокруг △OAB)',
      circumcenterTitle: 'Центр описанной окружности O_o = (A + B)/2',
      thalesRadiusTitle: 'Радиус описанной окружности R_o = c / 2',
      thalesDiameterTitle: 'Диаметр D_o = гипотенуза AB',
      tanOATitle: 'Точка касания на катете OA',
      tanOBTitle: 'Точка касания на катете OB',
      tanABTitle: 'Точка касания на гипотенузе AB',
      incenterTitle: 'Центр вписанной окружности I = (r, r)',
    },
    controls: {
      title: 'Параметры треугольника (a, b)',
      setIsoscelesTitle: 'Установить равнобедренный треугольник a = b = 4',
      legALabel: 'Катет',
      legBLabel: 'Катет',
      unitShort: 'ед.',
      presetsTitle: 'Контрольные треугольники:',
      pause: 'Пауза',
      smoothSweep: 'Плавное изменение (a, b)',
      reset345: 'Сброс (3-4-5)',
      scaleTitle: 'Масштаб треугольника λ',
      scaleDesc: 'Пропорциональное масштабирование (c = λ·5): длины ~ λ, площади ~ λ²',
      scaleReset: 'λ = 1 (Эталон 3-4-5)',
      presetDescriptions: {
        classic_3_4_5: 'Классический египетский треугольник: целые стороны и целочисленный вписанный радиус r = 1.',
        classic_5_12_13: 'Пифагорова тройка с целым радиусом вписанной окружности r = (5 + 12 - 13)/2 = 2.',
        sym_4_4: 'Симметричный прямоугольный треугольник: K_a = K_b, r = 4 - 2√2 ≈ 1.1716.',
        extreme_1_10: 'Сильно вытянутый треугольник (b/a = 10): маленький вписанный круг K_i (r ≈ 0.475).',
        extreme_10_1: 'Зеркальное вытягивание вдоль вертикального катета: K_a и K_b меняются местами, K_i и K_c неизменны.',
        classic_8_15_17: 'Ещё одна примитивная пифагорова тройка с целым радиусом вписанной окружности r = 3.',
      },
    },
    panel: {
      title: 'Числовая панель четырёх кругов',
      subtitle: 'Синхронный пересчёт площадей, корней, невязки и K_o',
      identityTitle: 'Центральное четырёхкруговое тождество',
      identityHold: 'Тождество выполняется точно',
      identityFail: 'Обнаружена невязка',
      lhsLabel: 'Левая часть: √K_a + √K_b',
      rhsLabel: 'Правая часть: √K_c + √K_i',
      residualLabel: 'Невязка тождества',
      proofTitle: 'Алгебраическое доказательство тождества',
      incircleTitle: 'Геометрия вписанной окружности K_i',
      incircleDescBefore: 'Обычная вписанная окружность касается катетов в точках',
      incircleDescMiddle: 'и гипотенузы в точке',
      incircleDescAfter: 'Её радиус всегда положителен:',
      legA: 'Катет a',
      legB: 'Катет b',
      hypC: 'Гипотенуза c',
      radiusKi: 'Радиус K_i',
      colCircle: 'Круг',
      colLocation: 'Расположение',
      colDim: 'Диаметр / Радиус',
      colArea: 'Площадь K',
      colSqrt: 'Корень √K',
      locSquareQa: 'Квадрат Q_a',
      locSquareQb: 'Квадрат Q_b',
      locSquareQc: 'Квадрат Q_c',
      locInsideTri: 'Внутри △OAB',
      locCircumscribed: 'Описана вокруг △OAB',
      areaContrastTitle: 'Соотношение самих площадей (контраст)',
      equalsMinusKi: 'равняется -K_i',
      contrastNoteBefore: 'Прямое равенство площадей',
      contrastNoteMiddle: 'неверно, так как по теореме Пифагора',
      contrastNoteAfter: ', а площадь вписанной окружности',
      coordinatesTitle: 'Координаты центров и точек касания',
      kcVsKo: {
        title: 'Сравнение гипотенузного круга K_c и описанной окружности K_o',
        badgeEq: 'K_o = K_c (равные величины)',
        badgeDiffCenter: 'O_o ≠ O_c (разные центры)',
        colParam: 'Параметр',
        rowRole: 'Геометрическая роль',
        roleKc: 'Вписана в квадрат Q_c на гипотенузе',
        roleKo: 'Описана вокруг треугольника OAB',
        rowCenter: 'Координаты центра',
        rowDiameter: 'Диаметр',
        rowRadius: 'Радиус',
        rowArea: 'Площадь',
        rowCircumference: 'Длина окружности',
        rowVertices: 'Прохождение через вершины',
        verticesKc: 'Нет (касание сторон квадрата Q_c)',
        verticesKo: 'Да: O, A, B',
        rowAreaDiff: 'Разность |K_o − K_c|',
        rowCenterDist: 'Расстояние между центрами |O_o − O_c|',
      },
    },
    thalesPanel: {
      title: '05. Описанная окружность Фалеса K_o',
      subtitle: 'Теорема Фалеса: вписанный угол ∠AOB = 90° опирается на диаметр AB',
      theoremTitle: 'Теорема Фалеса и равноудалённость вершин',
      theoremSummary: 'Середина гипотенузы O_o = (A + B)/2 равноудалена от вершин A, B и вершины прямого угла O. Поэтому окружность радиуса R_o = c/2 проходит через O, A и B, а вписанный угол ∠AOB = 90° опирается на диаметр D_o = c.',
      metricDo: 'Диаметр D_o',
      metricRo: 'Радиус R_o',
      metricKo: 'Площадь K_o',
      metricLo: 'Длина L_o',
      checksTitle: 'Верификация геометрии Фалеса в реальном времени',
      angleCheckLabel: 'Угол при вершине O (∠AOB)',
      centerCoordLabel: 'Центр описанной O_o = (A + B)/2',
      distALabel: 'Расстояние |O_o − A|',
      distBLabel: 'Расстояние |O_o − B|',
      distOLabel: 'Расстояние |O_o − O| (медиана)',
      centersComparisonTitle: 'Три ключевых центра треугольника',
      incenterRole: 'Центр вписанной окружности K_i',
      circumcenterRole: 'Центр описанной окружности K_o (середина AB)',
      kcCenterRole: 'Центр круга K_c внутри квадрата Q_c',
      scaleCardTitle: 'Динамическое масштабирование окружности Фалеса K_o(λ)',
      scaleCardSubtitle: 'Исследование двухпараметрической модели: форма t = b/a и масштаб λ = c / c₀',
      scaleSliderLabel: 'Масштаб треугольника λ:',
      scaleMetricLinear: 'Линейный рост (степень 1): D_o(λ) = λ·c₀, R_o(λ) = λ·c₀/2, L_o(λ) = π·λ·c₀',
      scaleMetricArea: 'Квадратичный рост (степень 2): K_o(λ) = λ²·(πc₀²/4) = λ²·K_o(1)',
      scaleTableTitle: 'Закон подобия для характеристик окружности Фалеса K_o',
      scaleInvariantNote: 'Тождества K_o(λ) ≡ K_c(λ) и K_a(λ) + K_b(λ) = K_o(λ) сохраняются строго при любом значении масштаба λ > 0',
    },
    spectral: {
      title: 'Параметрический спектральный анализ',
      subtitleBefore: 'Безразмерный параметр',
      subtitleAfter: 'нормировка на гипотенузный круг',
      tabAreas: 'Площади',
      tabPerimeters: 'Периметры',
      tabRadiiDiameters: 'Радиусы / Диаметры',
      tabThalesAbs: 'Абс. рост K_o(t)',
      tabScaleLambda: 'Масштаб λ',
      scaleTitle: 'Динамические функции масштабирования от параметра λ',
      scaleSubtitle: 'Сравнение квадратичного роста площадей (K_o, K_c, K_i ~ λ²) и линейного роста размеров (D_o, R_o, L_o ~ λ)',
      scaleFormulaTitle: 'Степенные законы масштабирования Евклидовой геометрии',
      colScale: 'Масштаб λ',
      scaleDeg1: 'Степень 1 (длины)',
      scaleDeg2: 'Степень 2 (площади)',
      scaleLawLinear: 'D_o(λ) = λ·c₀,  R_o(λ) = λ·c₀/2,  L_o(λ) = π·λ·c₀',
      scaleLawQuadratic: 'K_o(λ) = λ²·(π·c₀²/4) = λ²·K_o(1)',
      koOverlayToggle: 'Показать K_o',
      thalesNormNote: 'Постоянная линия Фалеса:',
      thalesAbsTitle: 'Абсолютный рост характеристик K_o(t) при нормировке катета a_norm = 1, b_norm = t',
      thalesAbsDesc: 'При росте t = b/a абсолютные величины R_o*(t), D_o*(t), K_o*(t), L_o*(t) монотонно возрастают, тогда как нормированные отношения R_o/c = 1/2, D_o/c = 1, K_o/K_c = 1 и L_o/L_c = 1 строго постоянны.',
      thalesAbsFormulaTitle: 'Абсолютные параметрические функции K_o (a_norm = 1) и постоянные отношения',
      thalesLiveReadoutTitle: 'Текущий треугольник (размерные a, b, c) и нормировка a_norm = 1',
      colDimensional: 'Текущий (a, b)',
      colNormalizedUnit: 'Нормир. *(1, t)',
      colRatioNorm: 'Отношение',
      linearNoteBefore: 'Линейный масштаб:',
      linearNoteMiddle: 'нормированные кривые',
      linearNoteAnd: 'и',
      linearNoteAfter: 'совпадают',
      radiiBtn: 'Радиусы (R)',
      diametersBtn: 'Диаметры (D)',
      plotTitle: 'Графики функций от отношения катетов',
      logScaleBtn: 'Лог. t',
      logScaleTitle: 'Логарифмическая шкала t (симметрия t ↔ 1/t вокруг t = 1)',
      linearScaleBtn: 'Линейн. t',
      linearScaleTitle: 'Линейная шкала t',
      zoomInTitle: 'Приблизить диапазон t',
      zoomOutTitle: 'Отдалить диапазон t',
      resetRangeTitle: 'Сбросить диапазон на [0.1, 10]',
      symmetryBtn: 't = 1 (Симметрия)',
      symmetryBtnTitle: 'Установить симметричный треугольник t = 1 (a = b)',
      pauseBtn: 'Пауза',
      sweepBtn: 'Пройти через симметрию',
      outOfRangeBefore: 'Текущее значение',
      outOfRangeMiddle: 'вне видимого диапазона',
      fitRangeBtn: 'Включить в диапазон',
      svgAriaLabel: 'Декартовый график характеристик окружностей в зависимости от t = b/a',
      axisLogLabel: '(логарифмическая шкала)',
      axisLinearLabel: '(линейная шкала)',
      symmetryTag: 'Симметрия',
      currentPointLabel: 'Текущая точка:',
      referenceTitle: 'Эталонные точки отношения катетов',
      legAShort: 'Катет a',
      legBShort: 'Катет b',
      hypCShort: 'Гипот. c',
      radRShort: 'Радиус r',
      colCircle: 'Круг',
      colArea: 'Площадь K',
      colPerimeter: 'Периметр P',
      colRadius: 'Радиус R',
      colDiameter: 'Диаметр D',
      shareToggle: 'Долевое распределение в текущем состоянии (вспомогательно)',
      shareLabel: 'доля',
      formulaSecA: 'A. Параметрическое отношение и нормированная геометрия (a_norm = 1)',
      formulaAsteriskNote: 'Символ * обозначает нормированные величины при a_norm = 1 (не размерные величины исходного треугольника).',
      formulaSecBNormalizedAreas: 'B. Нормированные площади (a_norm = 1)',
      formulaSecBNormalizedPerimeters: 'B. Нормированные периметры (a_norm = 1)',
      formulaSecBNormalizedRadii: 'B. Нормированные радиусы (a_norm = 1)',
      formulaSecBNormalizedDiameters: 'B. Нормированные диаметры (a_norm = 1)',
      formulaSecCRatioAreas: 'C. Отношения площадей (функции на графике)',
      formulaSecCRatioPerimeters: 'C. Отношения периметров (функции на графике)',
      formulaSecCRatioRadii: 'C. Отношения радиусных величин (функции на графике)',
      formulaSecCRatioDiameters: 'C. Отношения диаметров (функции на графике)',
      atSymmetryNotice: 'Треугольник уже на оси симметрии t = 1 (a = b, 1/t = t).',
    },
    invariants: {
      title: 'Верификация геометрии и тождеств',
      confirmedSuffix: 'подтверждены',
      subtitle: 'Проверка евклидовых условий касания, площадей, четырёхкругового тождества и теоремы Фалеса (допуск 10⁻⁹):',
      calcLabel: 'Расчёт',
      expectedLabel: 'Эталон',
      groupFourCircles: 'Четыре базовые окружности (8)',
      groupThales: 'Описанная окружность Фалеса K_o (9)',
      items: {
        incircle_positive: {
          name: 'Положительность вписанного радиуса r',
          description: 'Вписанная окружность K_i существует, r > 0 и центр I строго внутри треугольника OAB.',
        },
        squares_construction: {
          name: 'Построение трёх квадратов Q_a, Q_b, Q_c',
          description: 'Все стороны квадратов равны соответствующим сторонам треугольника, углы строго 90°.',
        },
        square_circles_tangency: {
          name: 'Касание K_a, K_b, K_c сторон квадратов',
          description: 'Каждая из трёх окружностей в квадратах касается всех четырёх сторон своего квадрата.',
        },
        incircle_tangency: {
          name: 'Касание K_i всех сторон треугольника',
          description: 'Четвёртая окружность K_i касается обоих катетов и гипотенузы треугольника OAB.',
        },
        four_circle_areas: {
          name: 'Точность площадей четырёх кругов',
          description: 'Согласованность вычисленных площадей всех четырёх окружностей с их аналитическими формулами.',
        },
        central_sqrt_identity: {
          name: 'Центральное тождество корней площадей',
          description: 'Сумма квадратных корней из площадей кругов на катетах равна сумме корней для гипотенузы и вписанного круга.',
        },
        pythagorean_circle_areas: {
          name: 'Пифагорова сумма площадей на сторонах',
          description: 'Сумма площадей кругов в квадратах на катетах равна площади круга на гипотенузе.',
        },
        area_non_equality_contrast: {
          name: 'Отличие тождества от суммы площадей',
          description: 'Прямая сумма площадей не равна K_c + K_i: расхождение строго равно -K_i < 0.',
        },
        thales_diameter: {
          name: 'Диаметр K_o равен гипотенузе (D_o = c)',
          description: 'По теореме Фалеса диаметр описанной окружности прямоугольного треугольника равен гипотенузе.',
        },
        thales_radius: {
          name: 'Радиус K_o равен половине гипотенузы (R_o = c/2)',
          description: 'Радиус описанной окружности составляет ровно половину длины гипотенузы.',
        },
        thales_area: {
          name: 'Площадь описанной окружности (K_o = πc²/4)',
          description: 'Площадь круга K_o согласована с его радиусом R_o = c/2.',
        },
        thales_circumference: {
          name: 'Длина описанной окружности (L_o = πc)',
          description: 'Длина окружности K_o пропорциональна гипотенузе с коэффициентом π.',
        },
        thales_dist_A: {
          name: 'Принадлежность вершины A окружности K_o',
          description: 'Расстояние от середины гипотенузы O_o до вершины A равно радиусу R_o.',
        },
        thales_dist_B: {
          name: 'Принадлежность вершины B окружности K_o',
          description: 'Расстояние от середины гипотенузы O_o до вершины B равно радиусу R_o.',
        },
        thales_dist_C: {
          name: 'Принадлежность вершины прямого угла окружности K_o',
          description: 'Вершина прямого угла лежит на окружности K_o (медиана к гипотенузе равна c/2).',
        },
        thales_area_eq_Kc: {
          name: 'Равенство площадей K_o = K_c при разных центрах',
          description: 'Окружность в квадрате на гипотенузе и описанная окружность имеют равные площади и разные центры.',
        },
        thales_right_angle: {
          name: 'Прямой угол напротив диаметра (∠AOB = 90°)',
          description: 'Угол, опирающийся на диаметр AB окружности K_o, остаётся равным 90° при любых катетах.',
        },
      },
    },
    compareModal: {
      title: 'Сравнение пятикруговых конфигураций',
      subtitle: 'Сопоставление эталонного треугольника и текущей конструкции',
      captureBtn: 'Зафиксировать текущую в Конфигурацию 1',
      loadBtn: 'Загрузить Конфигурацию 1',
      config1: 'Конфигурация 1',
      config2: 'Конфигурация 2',
      colQuantity: 'Величина',
      colConf1: 'Конф. 1',
      colConf2: 'Конф. 2',
      metrics: {
        legA: 'Катет a',
        legB: 'Катет b',
        hypC: 'Гипотенуза c',
        inradiusR: 'Вписанный радиус r',
        radiusRo: 'Радиус описанной R_o',
        areaKa: 'Площадь K_a',
        areaKb: 'Площадь K_b',
        areaKc: 'Площадь K_c',
        areaKi: 'Площадь K_i',
        areaKo: 'Площадь K_o',
      },
    },
    testModal: {
      title: 'Контрольные треугольники и проверка тождеств',
      subtitle: 'Автоматическая верификация 17 инвариантов (8 базовых + 9 инвариантов Фалеса K_o)',
      colTriangle: 'Треугольник',
      colProfile: 'Геометрический профиль',
      colChecks: 'Проверки',
      colDelta: 'Невязка Δ',
      colAction: 'Действие',
      okStatus: 'OK',
      failStatus: 'ОШИБКА',
      openBtn: 'Открыть',
      openTitle: 'Загрузить этот треугольник на планшет',
      allPassBanner: 'Все контрольные треугольники подтвердили 17/17 инвариантов: квадраты и четыре круга, тождество √K_a + √K_b = √K_c + √K_i, а также все свойства описанной окружности Фалеса K_o (D_o = c, K_o = K_c, O_o ≠ O_c, ∠AOB = 90°).',
      failBanner: 'Обнаружено расхождение инвариантов в одной или нескольких конфигурациях.',
      cases: {
        '3_4': 'Египетский треугольник: c = 5, r = 1, R_o = 2.5',
        '5_12': 'Пифагорова тройка: c = 13, r = 2, R_o = 6.5',
        '4_4': 'Симметрия a = b: K_a = K_b, r ≈ 1.1716, R_o = 2√2',
        '1_10': 'Вытянутый треугольник: c ≈ 10.0499, r ≈ 0.4751',
        '10_1': 'Зеркальный вытянутый: K_a ↔ K_b, K_i и K_o неизменны',
      },
    },
    helpModal: {
      title: 'Справка: Лаборатория Пифагора — четыре круга и круг Фалеса',
      subtitle: 'Геометрическая модель пяти окружностей, порождённых прямоугольным треугольником',
      sec1Title: 'Пять окружностей единой параметрической системы',
      sec1IntroBefore: 'Все объекты конструкции вычисляются детерминированно из двух независимых параметров — катетов',
      sec1IntroAnd: 'и',
      sec1IntroTriangle: 'прямоугольного треугольника',
      kaColor: 'синий',
      kaDesc1: 'окружность диаметра',
      kaDesc2: 'вписанная в квадрат',
      kaDesc3: 'на катете',
      kbColor: 'зелёный',
      kbDesc1: 'окружность диаметра',
      kbDesc2: 'вписанная в квадрат',
      kbDesc3: 'на катете',
      kcColor: 'красный',
      kcDesc1: 'окружность диаметра',
      kcDesc2: 'вписанная в квадрат',
      kcDesc3: 'на гипотенузе',
      kiColor: 'янтарный',
      kiDesc1: 'обычная вписанная окружность строго внутри треугольника',
      kiDesc2: 'касающаяся всех трёх его сторон. Радиус',
      kiDesc3: 'площадь',
      koColor: 'фиолетовый',
      koDesc1: 'описанная окружность Фалеса, проходящая через все три вершины',
      koDesc2: 'с центром в середине гипотенузы',
      koDesc3: 'диаметром',
      sec2Title: 'Центральное четырёхкруговое тождество:',
      sec2Text1: 'Так как',
      sec2TextAnd: 'и',
      sec2Text2: 'сумма правых частей равна',
      sec2Text3: '— тождественно совпадая с левой частью!',
      sec3Title: 'Почему равенство самих площадей неверно:',
      sec3Bullet1: 'По теореме Пифагора для трёх квадратных кругов выполняется',
      sec3Bullet2Before: 'Поскольку вписанный круг имеет положительную площадь',
      sec3Bullet2After: ', выражение',
      sec4Title: 'Теорема Фалеса и равенство K_o = K_c:',
      sec4Text: 'Окружность K_o с диаметром на гипотенузе AB и окружность K_c внутри квадрата Q_c имеют одинаковый диаметр c, радиус c/2, длину πc и площадь πc²/4, но расположены вокруг разных центров: O_o = (b/2, a/2) и O_c = ((a+b)/2, (a+b)/2).',
      gotItBtn: 'Понятно',
    },
    classificationLab: {
      brandTitle: 'Лаборатория классификации троек',
      legacyBtn: 'Лаборатория 4 окружностей',
      backToClassificationBtn: 'Вернуться в Лабораторию классификации C(r)',
      legacyBannerTitle: 'Режим наследия: Лаборатория четырёх окружностей',
      legacyBannerSubtitle: 'Изолированная среда непрерывной геометрии (F01–F19, Exp 01–06). Не смешивается с дискретной классификацией C(r).',
      radiusLabel: 'Вписанный радиус r',
      diameterLabel: 'Диаметр D = 2r',
      applyRadiusBtn: 'Выбрать',
      invalidRadiusError: 'Введите целое r ≥ 1',
      quickRadiiLabel: 'Эталонные r:',
      exactDomainLegend: 'Точная арифметика: BigInt / ExactRational (M1–M6 не реализованы)',
      approxDomainLegend: 'Приближённая визуализация: 2D-графика float64',
      toggleInspectorShow: 'Показать инспектор',
      toggleInspectorHide: 'Скрыть инспектор',
      sidebarWorkspaceLabel: 'Рабочие разделы',
      sidebarLegacySectionLabel: 'Сохраняемое наследие',
      inspectorTitle: 'Контекст класса C(r)',
      inspectorActiveClass: 'Выбранный класс',
      inspectorReadinessTitle: 'Статус модулей ядра (M1–M8)',
      inspectorOpenQuestionsTitle: 'Открытые решения (DESIGN_REVIEW)',
      emptyStates: {
        not_implemented: 'Модуль не реализован',
        awaiting_verified_data: 'Ожидание верифицированных данных',
        under_development: 'Исследовательский модуль в разработке',
      },
      sections: {
        class_atlas: {
          navShort: '01 Атлас',
          short: '01. Атлас классов',
          title: '01. Атлас классов по вписанному радиусу C(r)',
          subtitle: 'Обзор целочисленных классов C(r), чётных диаметров D = 2r и документированного корпуса r = 1..100',
        },
        class_inspector: {
          navShort: '02 Класс C(r)',
          short: '02. Инспектор C(r)',
          title: '02. Инспектор класса C(r) и подклассов Cₖ(r)',
          subtitle: 'Паспорт класса CL-R{r}-D{2r}, разбиение по масштабным подклассам Cₖ(r) (k | r) и политика сертификации факторизации',
        },
        triple_matrix: {
          navShort: '03 Матрица',
          short: '03. Матрица и паспорт',
          title: '03. Многопризнаковая матрица троек и паспорт PT-R{r}-K{k}-X{x}',
          subtitle: 'Шесть категорий признаков спецификации v0.1 с разделением точной арифметики и приближённых величин float64',
        },
        hyperbola_divisors: {
          navShort: '04 Гипербола',
          short: '04. Гипербола xy = 2r²',
          title: '04. Исследователь факторизационной пары (x, y) и гиперболы xy = 2r²',
          subtitle: 'Факторизационное преобразование x = a − 2r, y = b − 2r, границы 1 ≤ x < √2·r < y ≤ 2r² и биекция с (u, v)',
        },
        geometric_inspector: {
          navShort: '05 Геометрия',
          short: '05. Геометрический инспектор',
          title: '05. Геометрический инспектор (приближённая визуализация float64)',
          subtitle: 'Автономная демонстрация SVG-движка GeometryBoard и подготовка интерфейса адаптера M7 для выбранного класса C(r)',
        },
        structural_analysis: {
          navShort: '06 Анализ',
          short: '06. Структурный анализ',
          title: '06. Структурный анализ: Спорн, Берггрен, Прайс и пучки',
          subtitle: 'Нормированные координаты x̃ỹ = 2, статус метрики асимметрии (OQ-02), деревья генерации примитивных троек и пучки',
        },
        verification_export: {
          navShort: '07 Верификация',
          short: '07. Верификация и экспорт',
          title: '07. Независимая верификация CHK-01…CHK-12 и экспорт',
          subtitle: 'Контроль инвариантов, сверка с документированными эталонными наборами (r ≤ 30, r ≤ 100) и схема экспорта',
        },
      },
    },
  },
  uk: {
    brandTitle: 'Pythagoras — Four Circles',
    aria: {
      boardSection: 'Інтерактивна геометрична сцена чотирьох кіл',
      panelAside: 'Панель керування та числового спостереження',
    },
    modules: {
      fourCircles: '01. Чотири кола',
      identityProof: '02. Тотожність √K',
      incircleFocus: '03. Вписане коло Kᵢ',
      spectralAnalysis: '04. Спектральний аналіз',
      thalesCircumcircle: '05. Коло Фалеса Kₒ',
      arcClassification: '06. Дуга і класифікація',
      arcAngleAnalysis: '07. Дуга і кути',
      incircleArcDistribution: '08. Три дуги Kᵢ',
      arcSideArea: '09. Дуги–Сторони–Площі',
    },
    actions: {
      compare: 'Порівняти',
      tests: 'Тести 17/17',
      help: 'Довідка',
      undo: 'Скасувати',
      redo: 'Повернути',
      reset: 'Скидання',
      save: 'Зберегти',
      saved: 'Збережено',
      load: 'Завантажити',
      snapshotPng: 'Знімок PNG',
      snapshotSvg: 'SVG',
      buildAnim: 'Покроково',
      expandBoard: 'Сховати панель',
      showPanel: 'Показати панель',
      close: 'Закрити',
    },
    toolbar: {
      configsTitle: 'Конфігурації',
      exportJson: 'Експорт JSON',
      importJson: 'Імпорт JSON',
      noSavedConfigs: 'Немає збережених точок',
      deleteConfig: 'Видалити',
      snapshotPngTitle: 'Завантажити знімок експерименту (PNG)',
      snapshotSvgTitle: 'Завантажити векторне креслення (SVG)',
    },
    modes: {
      school: 'Наочний',
      research: 'Дослідницький',
    },
    board: {
      layers: 'Шари:',
      all: 'Усі',
      triIncircle: '△ та Kᵢ',
      squares: 'Квадрати Q',
      squareCircles: 'Кола K_a,b,c',
      fourCirclesOnly: '4 кола',
      thalesOnly: 'Описане K_o',
      fiveCircles: 'Усі 5 кіл',
      incenterPartition: 'Розбиття через I',
      circumcircleToggle: 'K_o',
      circumcircleToggleTitle: 'Показати або приховати описане коло Фалеса K_o',
      grid: 'Сітка',
      labels: 'Підписи',
      centers: 'Центри',
      radii: 'Радіуси',
      angles: 'Кути',
      zoomInTitle: 'Збільшити',
      zoomOutTitle: 'Зменшити',
      fitViewTitle: 'Вписати конструкцію',
      resetViewTitle: 'Скинути вигляд',
      dragHint: 'Тягніть A по вертикалі або B по горизонталі · Коліщатко для зуму',
      hoverDefault: 'Наведіть на коло, квадрат або сторону для інспекції',
    },
    hover: {
      vertexPrefix: 'Вершина',
      coordsLabel: 'Координати',
      dragY: 'Переміщення по вертикальній осі (x = 0)',
      dragX: 'Переміщення по горизонтальній осі (y = 0)',
      fixedVertex: 'Фіксована вершина',
      originTitle: 'Вершина O (Прямий кут 90°)',
      originDetails: 'Фіксований початок координат (0, 0). Гарантує збереження прямого кута.',
      triangleTitle: 'Прямокутний трикутник OAB',
      triangleLegsPrefix: 'Катети',
      triangleHypLabel: 'гіпотенуза',
      legOATitle: 'Вертикальний катет OA',
      legOBTitle: 'Горизонтальний катет OB',
      lengthUnit: 'Довжина',
      projHyp: 'Проєкція на гіпотенузу',
      hypABTitle: 'Гіпотенуза AB',
      hypDetailsSuffix: 'Сторона квадрата Q_c і діаметр кіл K_c та K_o',
      squareQaTitle: 'Квадрат Q_a на катеті a',
      squareQbTitle: 'Квадрат Q_b на катеті b',
      squareQcTitle: 'Квадрат Q_c на гіпотенузі c',
      sideLabel: 'Сторона',
      areaLabel: 'Площа',
      circleKaTitle: 'Коло K_a (вписане у квадрат Q_a)',
      circleKbTitle: 'Коло K_b (вписане у квадрат Q_b)',
      circleKcTitle: 'Коло K_c (вписане у квадрат Q_c)',
      circleKiTitle: 'Вписане коло K_i (усередині трикутника OAB)',
      circleKoTitle: 'Описане коло Фалеса K_o (навколо △OAB)',
      circumcenterTitle: 'Центр описаного кола O_o = (A + B)/2',
      thalesRadiusTitle: 'Радіус описаного кола R_o = c / 2',
      thalesDiameterTitle: 'Діаметр D_o = гіпотенуза AB',
      tanOATitle: 'Точка дотику на катеті OA',
      tanOBTitle: 'Точка дотику на катеті OB',
      tanABTitle: 'Точка дотику на гіпотенузі AB',
      incenterTitle: 'Центр вписаного кола I = (r, r)',
    },
    controls: {
      title: 'Параметри трикутника (a, b)',
      setIsoscelesTitle: 'Встановити рівнобедрений трикутник a = b = 4',
      legALabel: 'Катет',
      legBLabel: 'Катет',
      unitShort: 'од.',
      presetsTitle: 'Контрольні трикутники:',
      pause: 'Пауза',
      smoothSweep: 'Плавна зміна (a, b)',
      reset345: 'Скидання (3-4-5)',
      scaleTitle: 'Масштаб трикутника λ',
      scaleDesc: 'Пропорційне масштабування (c = λ·5): довжини ~ λ, площі ~ λ²',
      scaleReset: 'λ = 1 (Еталон 3-4-5)',
      presetDescriptions: {
        classic_3_4_5: 'Класичний єгипетський трикутник: цілі сторони та цілочисловий вписаний радіус r = 1.',
        classic_5_12_13: 'Піфагорова трійка з цілим радіусом вписаного кола r = (5 + 12 - 13)/2 = 2.',
        sym_4_4: 'Симетричний прямокутний трикутник: K_a = K_b, r = 4 - 2√2 ≈ 1.1716.',
        extreme_1_10: 'Сильно витягнутий трикутник (b/a = 10): мале вписане коло K_i (r ≈ 0.475).',
        extreme_10_1: 'Дзеркальне витягування вздовж вертикального катета: K_a і K_b міняються місцями, K_i та K_c незмінні.',
        classic_8_15_17: 'Ще одна примітивна піфагорова трійка з цілим радіусом вписаного кола r = 3.',
      },
    },
    panel: {
      title: 'Числова панель чотирьох кіл',
      subtitle: 'Синхронний перерахунок площ, коренів, нев’язки та K_o',
      identityTitle: 'Центральна тотожність чотирьох кіл',
      identityHold: 'Тотожність виконується точно',
      identityFail: 'Виявлено нев’язку',
      lhsLabel: 'Ліва частина: √K_a + √K_b',
      rhsLabel: 'Права частина: √K_c + √K_i',
      residualLabel: 'Нев’язка тотожності',
      proofTitle: 'Алгебраїчне доведення тотожності',
      incircleTitle: 'Геометрія вписаного кола K_i',
      incircleDescBefore: 'Звичайне вписане коло торкається катетів у точках',
      incircleDescMiddle: 'та гіпотенузи в точці',
      incircleDescAfter: 'Його радіус завжди додатний:',
      legA: 'Катет a',
      legB: 'Катет b',
      hypC: 'Гіпотенуза c',
      radiusKi: 'Радіус K_i',
      colCircle: 'Коло',
      colLocation: 'Розташування',
      colDim: 'Діаметр / Радіус',
      colArea: 'Площа K',
      colSqrt: 'Корінь √K',
      locSquareQa: 'Квадрат Q_a',
      locSquareQb: 'Квадрат Q_b',
      locSquareQc: 'Квадрат Q_c',
      locInsideTri: 'Всередині △OAB',
      locCircumscribed: 'Описане навколо △OAB',
      areaContrastTitle: 'Співвідношення самих площ (контраст)',
      equalsMinusKi: 'дорівнює -K_i',
      contrastNoteBefore: 'Пряма рівність площ',
      contrastNoteMiddle: 'хибна, оскільки за теоремою Піфагора',
      contrastNoteAfter: ', а площа вписаного кола',
      coordinatesTitle: 'Координати центрів та точок дотику',
      kcVsKo: {
        title: 'Порівняння гіпотенузного кола K_c та описаного кола K_o',
        badgeEq: 'K_o = K_c (рівні величини)',
        badgeDiffCenter: 'O_o ≠ O_c (різні центри)',
        colParam: 'Параметр',
        rowRole: 'Геометрична роль',
        roleKc: 'Вписане у квадрат Q_c на гіпотенузі',
        roleKo: 'Описане навколо трикутника OAB',
        rowCenter: 'Координати центра',
        rowDiameter: 'Діаметр',
        rowRadius: 'Радіус',
        rowArea: 'Площа',
        rowCircumference: 'Довжина кола',
        rowVertices: 'Проходження через вершини',
        verticesKc: 'Ні (дотик до сторін квадрата Q_c)',
        verticesKo: 'Так: O, A, B',
        rowAreaDiff: 'Різниця |K_o − K_c|',
        rowCenterDist: 'Відстань між центрами |O_o − O_c|',
      },
    },
    thalesPanel: {
      title: '05. Описане коло Фалеса K_o',
      subtitle: 'Теорема Фалеса: вписаний кут ∠AOB = 90° спирається на діаметр AB',
      theoremTitle: 'Теорема Фалеса та рівновіддаленість вершин',
      theoremSummary: 'Середина гіпотенузи O_o = (A + B)/2 рівновіддалена від вершин A, B і вершини прямого кута O. Тому коло радіуса R_o = c/2 проходить через O, A та B, а вписаний кут ∠AOB = 90° спирається на діаметр D_o = c.',
      metricDo: 'Діаметр D_o',
      metricRo: 'Радіус R_o',
      metricKo: 'Площа K_o',
      metricLo: 'Довжина L_o',
      checksTitle: 'Верифікація геометрії Фалеса в реальному часі',
      angleCheckLabel: 'Кут при вершині O (∠AOB)',
      centerCoordLabel: 'Центр описаного O_o = (A + B)/2',
      distALabel: 'Відстань |O_o − A|',
      distBLabel: 'Відстань |O_o − B|',
      distOLabel: 'Відстань |O_o − O| (медіана)',
      centersComparisonTitle: 'Три ключові центри трикутника',
      incenterRole: 'Центр вписаного кола K_i',
      circumcenterRole: 'Центр описаного кола K_o (середина AB)',
      kcCenterRole: 'Центр кола K_c усередині квадрата Q_c',
      scaleCardTitle: 'Динамічне масштабування кола Фалеса K_o(λ)',
      scaleCardSubtitle: 'Дослідження двопараметричної моделі: форма t = b/a та масштаб λ = c / c₀',
      scaleSliderLabel: 'Масштаб трикутника λ:',
      scaleMetricLinear: 'Лінійний ріст (степінь 1): D_o(λ) = λ·c₀, R_o(λ) = λ·c₀/2, L_o(λ) = π·λ·c₀',
      scaleMetricArea: 'Квадратичний ріст (степінь 2): K_o(λ) = λ²·(πc₀²/4) = λ²·K_o(1)',
      scaleTableTitle: 'Закон подібності для характеристик кола Фалеса K_o',
      scaleInvariantNote: 'Тотожності K_o(λ) ≡ K_c(λ) та K_a(λ) + K_b(λ) = K_o(λ) зберігаються суворо за будь-якого масштабу λ > 0',
    },
    spectral: {
      title: 'Параметричний спектральний аналіз',
      subtitleBefore: 'Безрозмірний параметр',
      subtitleAfter: 'нормування на гіпотенузне коло',
      tabAreas: 'Площі',
      tabPerimeters: 'Периметри',
      tabRadiiDiameters: 'Радіуси / Діаметри',
      tabThalesAbs: 'Абс. ріст K_o(t)',
      tabScaleLambda: 'Масштаб λ',
      scaleTitle: 'Динамічні функції масштабування від параметра λ',
      scaleSubtitle: 'Порівняння квадратичного зростання площ (K_o, K_c, K_i ~ λ²) та лінійного зростання розмірів (D_o, R_o, L_o ~ λ)',
      scaleFormulaTitle: 'Степеневі закони масштабування Евклідової геометрії',
      colScale: 'Масштаб λ',
      scaleDeg1: 'Степінь 1 (довжини)',
      scaleDeg2: 'Степінь 2 (площі)',
      scaleLawLinear: 'D_o(λ) = λ·c₀,  R_o(λ) = λ·c₀/2,  L_o(λ) = π·λ·c₀',
      scaleLawQuadratic: 'K_o(λ) = λ²·(π·c₀²/4) = λ²·K_o(1)',
      koOverlayToggle: 'Показати K_o',
      thalesNormNote: 'Стала лінія Фалеса:',
      thalesAbsTitle: 'Абсолютний ріст характеристик K_o(t) при нормуванні катета a_norm = 1, b_norm = t',
      thalesAbsDesc: 'При зростанні t = b/a абсолютні величини R_o*(t), D_o*(t), K_o*(t), L_o*(t) монотонно зростають, тоді як нормовані відношення R_o/c = 1/2, D_o/c = 1, K_o/K_c = 1 та L_o/L_c = 1 суворо сталі.',
      thalesAbsFormulaTitle: 'Абсолютні параметричні функції K_o (a_norm = 1) та сталі відношення',
      thalesLiveReadoutTitle: 'Поточний трикутник (розмірні a, b, c) та нормування a_norm = 1',
      colDimensional: 'Поточний (a, b)',
      colNormalizedUnit: 'Нормов. *(1, t)',
      colRatioNorm: 'Відношення',
      linearNoteBefore: 'Лінійний масштаб:',
      linearNoteMiddle: 'нормовані криві',
      linearNoteAnd: 'та',
      linearNoteAfter: 'збігаються',
      radiiBtn: 'Радіуси (R)',
      diametersBtn: 'Діаметри (D)',
      plotTitle: 'Графіки функцій від відношення катетів',
      logScaleBtn: 'Лог. t',
      logScaleTitle: 'Логарифмічна шкала t (симетрія t ↔ 1/t навколо t = 1)',
      linearScaleBtn: 'Лінійна t',
      linearScaleTitle: 'Лінійна шкала t',
      zoomInTitle: 'Наблизити діапазон t',
      zoomOutTitle: 'Віддалити діапазон t',
      resetRangeTitle: 'Скинути діапазон на [0.1, 10]',
      symmetryBtn: 't = 1 (Симетрія)',
      symmetryBtnTitle: 'Встановити симетричний трикутник t = 1 (a = b)',
      pauseBtn: 'Пауза',
      sweepBtn: 'Пройти через симетрію',
      outOfRangeBefore: 'Поточне значення',
      outOfRangeMiddle: 'поза видимим діапазоном',
      fitRangeBtn: 'Включити в діапазон',
      svgAriaLabel: 'Декартовий графік характеристик кіл залежно від t = b/a',
      axisLogLabel: '(логарифмічна шкала)',
      axisLinearLabel: '(лінійна шкала)',
      symmetryTag: 'Симетрія',
      currentPointLabel: 'Поточна точка:',
      referenceTitle: 'Еталонні точки відношення катетів',
      legAShort: 'Катет a',
      legBShort: 'Катет b',
      hypCShort: 'Гіпот. c',
      radRShort: 'Радіус r',
      colCircle: 'Коло',
      colArea: 'Площа K',
      colPerimeter: 'Периметр P',
      colRadius: 'Радіус R',
      colDiameter: 'Діаметр D',
      shareToggle: 'Частковий розподіл у поточному стані (допоміжно)',
      shareLabel: 'частка',
      formulaSecA: 'A. Параметричне відношення та нормована геометрія (a_norm = 1)',
      formulaAsteriskNote: 'Символ * позначає нормовані величини при a_norm = 1 (не розмірні величини вихідного трикутника).',
      formulaSecBNormalizedAreas: 'B. Нормовані площі (a_norm = 1)',
      formulaSecBNormalizedPerimeters: 'B. Нормовані периметри (a_norm = 1)',
      formulaSecBNormalizedRadii: 'B. Нормовані радіуси (a_norm = 1)',
      formulaSecBNormalizedDiameters: 'B. Нормовані діаметри (a_norm = 1)',
      formulaSecCRatioAreas: 'C. Відношення площ (функції на графіку)',
      formulaSecCRatioPerimeters: 'C. Відношення периметрів (функції на графіку)',
      formulaSecCRatioRadii: 'C. Відношення радіусних величин (функції на графіку)',
      formulaSecCRatioDiameters: 'C. Відношення діаметрів (функції на графіку)',
      atSymmetryNotice: 'Трикутник уже на осі симетрії t = 1 (a = b, 1/t = t).',
    },
    invariants: {
      title: 'Верифікація геометрії та тотожностей',
      confirmedSuffix: 'підтверджені',
      subtitle: 'Перевірка евклідових умов дотику, площ, тотожності чотирьох кіл та теореми Фалеса (допуск 10⁻⁹):',
      calcLabel: 'Розрахунок',
      expectedLabel: 'Еталон',
      groupFourCircles: 'Чотири базові кола (8)',
      groupThales: 'Описане коло Фалеса K_o (9)',
      items: {
        incircle_positive: {
          name: 'Додатність вписаного радіуса r',
          description: 'Вписане коло K_i існує, r > 0 і центр I суворо всередині трикутника OAB.',
        },
        squares_construction: {
          name: 'Побудова трьох квадратів Q_a, Q_b, Q_c',
          description: 'Усі сторони квадратів дорівнюють відповідним сторонам трикутника, кути суворо 90°.',
        },
        square_circles_tangency: {
          name: 'Дотик K_a, K_b, K_c до сторін квадратів',
          description: 'Кожне з трьох кіл у квадратах торкається всіх чотирьох сторін свого квадрата.',
        },
        incircle_tangency: {
          name: 'Дотик K_i до всіх сторін трикутника',
          description: 'Четверте коло K_i торкається обох катетів та гіпотенузи трикутника OAB.',
        },
        four_circle_areas: {
          name: 'Точність площ чотирьох кіл',
          description: 'Узгодженість обчислених площ усіх чотирьох кіл із їх аналітичними формулами.',
        },
        central_sqrt_identity: {
          name: 'Центральна тотожність коренів площ',
          description: 'Сума квадратних коренів із площ кіл на катетах дорівнює сумі коренів для гіпотенузи та вписаного кола.',
        },
        pythagorean_circle_areas: {
          name: 'Піфагорова сума площ на сторонах',
          description: 'Сума площ кіл у квадратах на катетах дорівнює площі кола на гіпотенузі.',
        },
        area_non_equality_contrast: {
          name: 'Відмінність тотожності від суми площ',
          description: 'Пряма сума площ не дорівнює K_c + K_i: розбіжність суворо дорівнює -K_i < 0.',
        },
        thales_diameter: {
          name: 'Діаметр K_o дорівнює гіпотенузі (D_o = c)',
          description: 'За теоремою Фалеса діаметр описаного кола прямокутного трикутника дорівнює гіпотенузі.',
        },
        thales_radius: {
          name: 'Радіус K_o дорівнює половині гіпотенузи (R_o = c/2)',
          description: 'Радіус описаного кола становить рівно половину довжини гіпотенузи.',
        },
        thales_area: {
          name: 'Площа описаного кола (K_o = πc²/4)',
          description: 'Площа кола K_o узгоджена з його радіусом R_o = c/2.',
        },
        thales_circumference: {
          name: 'Довжина описаного кола (L_o = πc)',
          description: 'Довжина кола K_o пропорційна гіпотенузі з коефіцієнтом π.',
        },
        thales_dist_A: {
          name: 'Належність вершини A колу K_o',
          description: 'Відстань від середини гіпотенузи O_o до вершини A дорівнює радіусу R_o.',
        },
        thales_dist_B: {
          name: 'Належність вершини B колу K_o',
          description: 'Відстань від середини гіпотенузи O_o до вершини B дорівнює радіусу R_o.',
        },
        thales_dist_C: {
          name: 'Належність вершини прямого кута колу K_o',
          description: 'Вершина прямого кута лежить на колі K_o (медіана до гіпотенузи дорівнює c/2).',
        },
        thales_area_eq_Kc: {
          name: 'Рівність площ K_o = K_c при різних центрах',
          description: 'Коло у квадраті на гіпотенузі та описане коло мають рівні площі й різні центри.',
        },
        thales_right_angle: {
          name: 'Прямий кут навпроти діаметра (∠AOB = 90°)',
          description: 'Кут, що спирається на діаметр AB кола K_o, залишається рівним 90° за будь-яких катетів.',
        },
      },
    },
    compareModal: {
      title: 'Порівняння п’ятиколових конфігурацій',
      subtitle: 'Зіставлення еталонного трикутника та поточної конструкції',
      captureBtn: 'Зафіксувати поточну в Конфігурацію 1',
      loadBtn: 'Завантажити Конфігурацію 1',
      config1: 'Конфігурація 1',
      config2: 'Конфігурація 2',
      colQuantity: 'Величина',
      colConf1: 'Конф. 1',
      colConf2: 'Конф. 2',
      metrics: {
        legA: 'Катет a',
        legB: 'Катет b',
        hypC: 'Гіпотенуза c',
        inradiusR: 'Вписаний радіус r',
        radiusRo: 'Радіус описаного R_o',
        areaKa: 'Площа K_a',
        areaKb: 'Площа K_b',
        areaKc: 'Площа K_c',
        areaKi: 'Площа K_i',
        areaKo: 'Площа K_o',
      },
    },
    testModal: {
      title: 'Контрольні трикутники та перевірка тотожностей',
      subtitle: 'Автоматична верифікація 17 інваріантів (8 базових + 9 інваріантів Фалеса K_o)',
      colTriangle: 'Трикутник',
      colProfile: 'Геометричний профіль',
      colChecks: 'Перевірки',
      colDelta: 'Нев’язка Δ',
      colAction: 'Дія',
      okStatus: 'OK',
      failStatus: 'ПОМИЛКА',
      openBtn: 'Відкрити',
      openTitle: 'Завантажити цей трикутник на полотно',
      allPassBanner: 'Усі контрольні трикутники підтвердили 17/17 інваріантів: квадрати й чотири кола, тотожність √K_a + √K_b = √K_c + √K_i, а також усі властивості описаного кола Фалеса K_o (D_o = c, K_o = K_c, O_o ≠ O_c, ∠AOB = 90°).',
      failBanner: 'Виявлено розбіжність інваріантів в одній або кількох конфігураціях.',
      cases: {
        '3_4': 'Єгипетський трикутник: c = 5, r = 1, R_o = 2.5',
        '5_12': 'Піфагорова трійка: c = 13, r = 2, R_o = 6.5',
        '4_4': 'Симетрія a = b: K_a = K_b, r ≈ 1.1716, R_o = 2√2',
        '1_10': 'Витягнутий трикутник: c ≈ 10.0499, r ≈ 0.4751',
        '10_1': 'Дзеркальний витягнутий: K_a ↔ K_b, K_i та K_o незмінні',
      },
    },
    helpModal: {
      title: 'Довідка: Лабораторія Піфагора — чотири кола та коло Фалеса',
      subtitle: 'Геометрична модель п’яти кіл, породжених прямокутним трикутником',
      sec1Title: 'П’ять кіл єдиної параметричної системи',
      sec1IntroBefore: 'Усі об’єкти конструкції обчислюються детерміновано з двох незалежних параметрів — катетів',
      sec1IntroAnd: 'і',
      sec1IntroTriangle: 'прямокутного трикутника',
      kaColor: 'синій',
      kaDesc1: 'коло діаметра',
      kaDesc2: 'вписане у квадрат',
      kaDesc3: 'на катеті',
      kbColor: 'зелений',
      kbDesc1: 'коло діаметра',
      kbDesc2: 'вписане у квадрат',
      kbDesc3: 'на катеті',
      kcColor: 'червоний',
      kcDesc1: 'коло діаметра',
      kcDesc2: 'вписане у квадрат',
      kcDesc3: 'на гіпотенузі',
      kiColor: 'бурштиновий',
      kiDesc1: 'звичайне вписане коло суворо всередині трикутника',
      kiDesc2: 'що торкається всіх трьох його сторін. Радіус',
      kiDesc3: 'площа',
      koColor: 'фіолетовий',
      koDesc1: 'описане коло Фалеса, що проходить крізь усі три вершини',
      koDesc2: 'із центром у середині гіпотенузи',
      koDesc3: 'діаметром',
      sec2Title: 'Центральна тотожність чотирьох кіл:',
      sec2Text1: 'Оскільки',
      sec2TextAnd: 'та',
      sec2Text2: 'сума правих частин дорівнює',
      sec2Text3: '— тотожно збігаючись із лівою частиною!',
      sec3Title: 'Чому рівність самих площ хибна:',
      sec3Bullet1: 'За теоремою Піфагора для трьох квадратних кіл виконується',
      sec3Bullet2Before: 'Оскільки вписане коло має додатну площу',
      sec3Bullet2After: ', вираз',
      sec4Title: 'Теорема Фалеса та рівність K_o = K_c:',
      sec4Text: 'Коло K_o з діаметром на гіпотенузі AB і коло K_c усередині квадрата Q_c мають однаковий діаметр c, радіус c/2, довжину πc та площу πc²/4, проте розташовані навколо різних центрів: O_o = (b/2, a/2) і O_c = ((a+b)/2, (a+b)/2).',
      gotItBtn: 'Зрозуміло',
    },
    classificationLab: {
      brandTitle: 'Лабораторія класифікації трійок',
      legacyBtn: 'Лабораторія 4 кіл',
      backToClassificationBtn: 'Повернутися до Лабораторії класифікації C(r)',
      legacyBannerTitle: 'Режим спадщини: Лабораторія чотирьох кіл',
      legacyBannerSubtitle: 'Ізольоване середовище неперервної геометрії (F01–F19, Exp 01–06). Не змішується з дискретною класифікацією C(r).',
      radiusLabel: 'Вписаний радіус r',
      diameterLabel: 'Діаметр D = 2r',
      applyRadiusBtn: 'Обрати',
      invalidRadiusError: 'Введіть ціле r ≥ 1',
      quickRadiiLabel: 'Еталонні r:',
      exactDomainLegend: 'Точна арифметика: BigInt / ExactRational (M1–M6 не реалізовані)',
      approxDomainLegend: 'Наближена візуалізація: 2D-графіка float64',
      toggleInspectorShow: 'Показати інспектор',
      toggleInspectorHide: 'Приховати інспектор',
      sidebarWorkspaceLabel: 'Робочі розділи',
      sidebarLegacySectionLabel: 'Збережена спадщина',
      inspectorTitle: 'Контекст класу C(r)',
      inspectorActiveClass: 'Обраний клас',
      inspectorReadinessTitle: 'Статус модулів ядра (M1–M8)',
      inspectorOpenQuestionsTitle: 'Відкриті рішення (DESIGN_REVIEW)',
      emptyStates: {
        not_implemented: 'Модуль не реалізовано',
        awaiting_verified_data: 'Очікування верифікованих даних',
        under_development: 'Дослідницький модуль у розробці',
      },
      sections: {
        class_atlas: {
          navShort: '01 Атлас',
          short: '01. Атлас класів',
          title: '01. Атлас класів за вписаним радіусом C(r)',
          subtitle: 'Огляд цілочислових класів C(r), парних діаметрів D = 2r та задокументованого корпусу r = 1..100',
        },
        class_inspector: {
          navShort: '02 Клас C(r)',
          short: '02. Інспектор C(r)',
          title: '02. Інспектор класу C(r) і підкласів Cₖ(r)',
          subtitle: 'Паспорт класу CL-R{r}-D{2r}, розбиття за масштабними підкласами Cₖ(r) (k | r) та політика сертифікації факторизації',
        },
        triple_matrix: {
          navShort: '03 Матриця',
          short: '03. Матриця і паспорт',
          title: '03. Багатоознакова матриця трійок та паспорт PT-R{r}-K{k}-X{x}',
          subtitle: 'Шість категорій ознак специфікації v0.1 із розділенням точної арифметики і наближених величин float64',
        },
        hyperbola_divisors: {
          navShort: '04 Гіпербола',
          short: '04. Гіпербола xy = 2r²',
          title: '04. Дослідник факторизаційної пари (x, y) і гіперболи xy = 2r²',
          subtitle: 'Факторизаційне перетворення x = a − 2r, y = b − 2r, межі 1 ≤ x < √2·r < y ≤ 2r² і бієкція з (u, v)',
        },
        geometric_inspector: {
          navShort: '05 Геометрія',
          short: '05. Геометричний інспектор',
          title: '05. Геометричний інспектор (наближена візуалізація float64)',
          subtitle: 'Автономна демонстрація SVG-рушія GeometryBoard і підготовка інтерфейсу адаптера M7 для обраного класу C(r)',
        },
        structural_analysis: {
          navShort: '06 Аналіз',
          short: '06. Структурний аналіз',
          title: '06. Структурний аналіз: Спорн, Берггрен, Прайс і пучки',
          subtitle: 'Нормовані координати x̃ỹ = 2, статус метрики асиметрії (OQ-02), дерева генерації примітивних трійок і пучки',
        },
        verification_export: {
          navShort: '07 Верифікація',
          short: '07. Верифікація та експорт',
          title: '07. Незалежна верифікація CHK-01…CHK-12 та експорт',
          subtitle: 'Контроль інваріантів, звірка із задокументованими еталонними наборами (r ≤ 30, r ≤ 100) і схема експорту',
        },
      },
    },
  },
  en: {
    brandTitle: 'Pythagoras — Four Circles',
    aria: {
      boardSection: 'Interactive Four-Circles geometry canvas',
      panelAside: 'Controls and numeric observer panel',
    },
    modules: {
      fourCircles: '01. Four Circles',
      identityProof: '02. √K Identity',
      incircleFocus: '03. Incircle Kᵢ',
      spectralAnalysis: '04. Spectral Analysis',
      thalesCircumcircle: '05. Thales Circle Kₒ',
      arcClassification: '06. Arc Classification',
      arcAngleAnalysis: '07. Arc & Angles',
      incircleArcDistribution: '08. Three Arcs Kᵢ',
      arcSideArea: '09. Arc–Side–Area',
    },
    actions: {
      compare: 'Compare',
      tests: 'Tests 17/17',
      help: 'Help',
      undo: 'Undo',
      redo: 'Redo',
      reset: 'Reset',
      save: 'Save',
      saved: 'Saved',
      load: 'Load',
      snapshotPng: 'Snapshot PNG',
      snapshotSvg: 'SVG',
      buildAnim: 'Step Build',
      expandBoard: 'Hide Panel',
      showPanel: 'Show Panel',
      close: 'Close',
    },
    toolbar: {
      configsTitle: 'Configurations',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      noSavedConfigs: 'No saved points',
      deleteConfig: 'Delete',
      snapshotPngTitle: 'Download experiment snapshot (PNG)',
      snapshotSvgTitle: 'Download vector drawing (SVG)',
    },
    modes: {
      school: 'Visual',
      research: 'Research',
    },
    board: {
      layers: 'Layers:',
      all: 'All',
      triIncircle: '△ & Kᵢ',
      squares: 'Squares Q',
      squareCircles: 'Circles K_a,b,c',
      fourCirclesOnly: '4 Circles',
      thalesOnly: 'Circumcircle K_o',
      fiveCircles: 'All 5 Circles',
      incenterPartition: 'Partition via I',
      circumcircleToggle: 'K_o',
      circumcircleToggleTitle: 'Show or hide Thales circumcircle K_o',
      grid: 'Grid',
      labels: 'Labels',
      centers: 'Centers',
      radii: 'Radii',
      angles: 'Angles',
      zoomInTitle: 'Zoom in',
      zoomOutTitle: 'Zoom out',
      fitViewTitle: 'Fit construction',
      resetViewTitle: 'Reset view',
      dragHint: 'Drag A vertically or B horizontally · Scroll to zoom',
      hoverDefault: 'Hover any circle, square, or side to inspect',
    },
    hover: {
      vertexPrefix: 'Vertex',
      coordsLabel: 'Coordinates',
      dragY: 'Constrained along vertical axis (x = 0)',
      dragX: 'Constrained along horizontal axis (y = 0)',
      fixedVertex: 'Fixed vertex',
      originTitle: 'Vertex O (Right angle 90°)',
      originDetails: 'Fixed coordinate origin (0, 0). Preserves the 90° right angle.',
      triangleTitle: 'Right Triangle OAB',
      triangleLegsPrefix: 'Legs',
      triangleHypLabel: 'hypotenuse',
      legOATitle: 'Vertical Leg OA',
      legOBTitle: 'Horizontal Leg OB',
      lengthUnit: 'Length',
      projHyp: 'Projection onto hypotenuse',
      hypABTitle: 'Hypotenuse AB',
      hypDetailsSuffix: 'Side of square Q_c and diameter of circles K_c and K_o',
      squareQaTitle: 'Square Q_a on leg a',
      squareQbTitle: 'Square Q_b on leg b',
      squareQcTitle: 'Square Q_c on hypotenuse c',
      sideLabel: 'Side',
      areaLabel: 'Area',
      circleKaTitle: 'Circle K_a (inscribed in square Q_a)',
      circleKbTitle: 'Circle K_b (inscribed in square Q_b)',
      circleKcTitle: 'Circle K_c (inscribed in square Q_c)',
      circleKiTitle: 'Incircle K_i (inside triangle OAB)',
      circleKoTitle: 'Thales Circumcircle K_o (circumscribed around △OAB)',
      circumcenterTitle: 'Circumcenter O_o = (A + B)/2',
      thalesRadiusTitle: 'Circumradius R_o = c / 2',
      thalesDiameterTitle: 'Diameter D_o = hypotenuse AB',
      tanOATitle: 'Tangency point on leg OA',
      tanOBTitle: 'Tangency point on leg OB',
      tanABTitle: 'Tangency point on hypotenuse AB',
      incenterTitle: 'Incircle center I = (r, r)',
    },
    controls: {
      title: 'Triangle Parameters (a, b)',
      setIsoscelesTitle: 'Set isosceles right triangle a = b = 4',
      legALabel: 'Leg',
      legBLabel: 'Leg',
      unitShort: 'u.',
      presetsTitle: 'Control triangles:',
      pause: 'Pause',
      smoothSweep: 'Smooth sweep (a, b)',
      reset345: 'Reset (3-4-5)',
      scaleTitle: 'Triangle Scale λ',
      scaleDesc: 'Proportional scaling (c = λ·5): lengths ~ λ, areas ~ λ²',
      scaleReset: 'λ = 1 (Reference 3-4-5)',
      presetDescriptions: {
        classic_3_4_5: 'Classic Egyptian right triangle: integer sides and integer inradius r = 1.',
        classic_5_12_13: 'Pythagorean triple with integer incircle radius r = (5 + 12 - 13)/2 = 2.',
        sym_4_4: 'Symmetric isosceles right triangle: K_a = K_b, r = 4 - 2√2 ≈ 1.1716.',
        extreme_1_10: 'Elongated triangle (b/a = 10): small incircle K_i (r ≈ 0.475).',
        extreme_10_1: 'Mirrored elongation along vertical leg: K_a and K_b swap, while K_i and K_c stay unchanged.',
        classic_8_15_17: 'Another primitive Pythagorean triple with integer inradius r = 3.',
      },
    },
    panel: {
      title: 'Four Circles Numeric Observer',
      subtitle: 'Synchronized areas, square roots, residual, and K_o',
      identityTitle: 'Central Four-Circle Identity',
      identityHold: 'Identity holds exactly',
      identityFail: 'Residual detected',
      lhsLabel: 'LHS: √K_a + √K_b',
      rhsLabel: 'RHS: √K_c + √K_i',
      residualLabel: 'Identity residual',
      proofTitle: 'Algebraic Proof of the Identity',
      incircleTitle: 'Incircle K_i Geometry',
      incircleDescBefore: 'The triangle incircle touches both legs at',
      incircleDescMiddle: 'and the hypotenuse at',
      incircleDescAfter: 'Its radius is always strictly positive:',
      legA: 'Leg a',
      legB: 'Leg b',
      hypC: 'Hypotenuse c',
      radiusKi: 'Radius K_i',
      colCircle: 'Circle',
      colLocation: 'Construction',
      colDim: 'Diameter / Radius',
      colArea: 'Area K',
      colSqrt: 'Root √K',
      locSquareQa: 'Square Q_a',
      locSquareQb: 'Square Q_b',
      locSquareQc: 'Square Q_c',
      locInsideTri: 'Inside △OAB',
      locCircumscribed: 'Circumscribed △OAB',
      areaContrastTitle: 'Direct Area Contrast (Non-Equality)',
      equalsMinusKi: 'equals -K_i',
      contrastNoteBefore: 'Direct area equality',
      contrastNoteMiddle: 'is false because by the Pythagorean theorem',
      contrastNoteAfter: ', while the incircle area is',
      coordinatesTitle: 'Centers & Tangency Coordinates',
      kcVsKo: {
        title: 'Hypotenuse Circle K_c vs. Thales Circumcircle K_o',
        badgeEq: 'K_o = K_c (equal measure)',
        badgeDiffCenter: 'O_o ≠ O_c (distinct centers)',
        colParam: 'Parameter',
        rowRole: 'Geometric role',
        roleKc: 'Inscribed in hypotenuse square Q_c',
        roleKo: 'Circumscribed around triangle OAB',
        rowCenter: 'Center coordinates',
        rowDiameter: 'Diameter',
        rowRadius: 'Radius',
        rowArea: 'Area',
        rowCircumference: 'Circumference',
        rowVertices: 'Passes through A, B, O',
        verticesKc: 'No (tangent to Q_c sides)',
        verticesKo: 'Yes: O, A, B',
        rowAreaDiff: 'Area difference |K_o − K_c|',
        rowCenterDist: 'Center separation |O_o − O_c|',
      },
    },
    thalesPanel: {
      title: '05. Thales Circumcircle K_o',
      subtitle: 'Thales Theorem: inscribed right angle ∠AOB = 90° subtends diameter AB',
      theoremTitle: 'Thales Theorem & Vertex Equidistance',
      theoremSummary: 'The hypotenuse midpoint O_o = (A + B)/2 is equidistant from vertices A, B, and the right-angle vertex O. Thus the circle of radius R_o = c/2 passes through O, A, and B, and ∠AOB = 90° subtends diameter D_o = c.',
      metricDo: 'Diameter D_o',
      metricRo: 'Radius R_o',
      metricKo: 'Area K_o',
      metricLo: 'Circumference L_o',
      checksTitle: 'Live Thales Geometry Verification',
      angleCheckLabel: 'Angle at right vertex O (∠AOB)',
      centerCoordLabel: 'Circumcenter O_o = (A + B)/2',
      distALabel: 'Distance |O_o − A|',
      distBLabel: 'Distance |O_o − B|',
      distOLabel: 'Distance |O_o − O| (median)',
      centersComparisonTitle: 'Three Key Centers Around Triangle OAB',
      incenterRole: 'Incenter of incircle K_i',
      circumcenterRole: 'Circumcenter of K_o (midpoint of AB)',
      kcCenterRole: 'Center of circle K_c in square Q_c',
      scaleCardTitle: 'Dynamic Scaling of Thales Circumcircle K_o(λ)',
      scaleCardSubtitle: 'Two-parameter exploration model: shape t = b/a and scale λ = c / c₀',
      scaleSliderLabel: 'Triangle scale λ:',
      scaleMetricLinear: 'Linear growth (degree 1): D_o(λ) = λ·c₀, R_o(λ) = λ·c₀/2, L_o(λ) = π·λ·c₀',
      scaleMetricArea: 'Quadratic growth (degree 2): K_o(λ) = λ²·(πc₀²/4) = λ²·K_o(1)',
      scaleTableTitle: 'Similarity law for Thales circumcircle metrics',
      scaleInvariantNote: 'Identities K_o(λ) ≡ K_c(λ) and K_a(λ) + K_b(λ) = K_o(λ) hold strictly for every scale factor λ > 0',
    },
    spectral: {
      title: 'Parametric Spectral Analysis',
      subtitleBefore: 'Dimensionless ratio',
      subtitleAfter: 'normalized to hypotenuse circle',
      tabAreas: 'Areas',
      tabPerimeters: 'Perimeters',
      tabRadiiDiameters: 'Radii / Diameters',
      tabThalesAbs: 'Abs. Growth K_o(t)',
      tabScaleLambda: 'Scale λ',
      scaleTitle: 'Dynamic Scaling Functions vs. Scale Parameter λ',
      scaleSubtitle: 'Contrasting quadratic area growth (K_o, K_c, K_i ~ λ²) with linear length growth (D_o, R_o, L_o ~ λ)',
      scaleFormulaTitle: 'Euclidean Geometry Power Laws of Scaling',
      colScale: 'Scale λ',
      scaleDeg1: 'Degree 1 (lengths)',
      scaleDeg2: 'Degree 2 (areas)',
      scaleLawLinear: 'D_o(λ) = λ·c₀,  R_o(λ) = λ·c₀/2,  L_o(λ) = π·λ·c₀',
      scaleLawQuadratic: 'K_o(λ) = λ²·(π·c₀²/4) = λ²·K_o(1)',
      koOverlayToggle: 'Show K_o',
      thalesNormNote: 'Constant Thales line:',
      thalesAbsTitle: 'Absolute K_o(t) Growth under Unit-Leg Normalization a_norm = 1, b_norm = t',
      thalesAbsDesc: 'As t = b/a increases, absolute metrics R_o*(t), D_o*(t), K_o*(t), L_o*(t) grow monotonically, while normalized ratios R_o/c = 1/2, D_o/c = 1, K_o/K_c = 1, and L_o/L_c = 1 remain strictly constant.',
      thalesAbsFormulaTitle: 'Absolute Parametric Functions for K_o (a_norm = 1) & Constant Ratios',
      thalesLiveReadoutTitle: 'Current Triangle (dimensional a, b, c) vs. Unit-Leg Normalization a_norm = 1',
      colDimensional: 'Live (a, b)',
      colNormalizedUnit: 'Unit *(1, t)',
      colRatioNorm: 'Constant Ratio',
      linearNoteBefore: 'Linear scale:',
      linearNoteMiddle: 'normalized curves',
      linearNoteAnd: 'and',
      linearNoteAfter: 'coincide',
      radiiBtn: 'Radii (R)',
      diametersBtn: 'Diameters (D)',
      plotTitle: 'Normalized functions vs. leg ratio',
      logScaleBtn: 'Log t',
      logScaleTitle: 'Logarithmic t-axis (t ↔ 1/t symmetry around t = 1)',
      linearScaleBtn: 'Linear t',
      linearScaleTitle: 'Linear t-axis',
      zoomInTitle: 'Zoom in t-range',
      zoomOutTitle: 'Zoom out t-range',
      resetRangeTitle: 'Reset range to [0.1, 10]',
      symmetryBtn: 't = 1 (Symmetry)',
      symmetryBtnTitle: 'Set symmetric triangle t = 1 (a = b)',
      pauseBtn: 'Pause',
      sweepBtn: 'Play Through Symmetry',
      outOfRangeBefore: 'Current value',
      outOfRangeMiddle: 'is outside visible range',
      fitRangeBtn: 'Include in range',
      svgAriaLabel: 'Cartesian plot of circle metrics vs. t = b/a',
      axisLogLabel: '(logarithmic scale)',
      axisLinearLabel: '(linear scale)',
      symmetryTag: 'Symmetry',
      currentPointLabel: 'Current point:',
      referenceTitle: 'Reference leg-ratio points',
      legAShort: 'Leg a',
      legBShort: 'Leg b',
      hypCShort: 'Hypot. c',
      radRShort: 'Radius r',
      colCircle: 'Circle',
      colArea: 'Area K',
      colPerimeter: 'Perimeter P',
      colRadius: 'Radius R',
      colDiameter: 'Diameter D',
      shareToggle: 'Current-state proportional breakdown (auxiliary)',
      shareLabel: 'share',
      formulaSecA: 'A. Parameter Ratio & Normalized Geometry (a_norm = 1)',
      formulaAsteriskNote: 'The asterisk (*) denotes normalized quantities with a_norm = 1 (distinct from dimensional triangle values).',
      formulaSecBNormalizedAreas: 'B. Normalized Areas (a_norm = 1)',
      formulaSecBNormalizedPerimeters: 'B. Normalized Perimeters (a_norm = 1)',
      formulaSecBNormalizedRadii: 'B. Normalized Radii (a_norm = 1)',
      formulaSecBNormalizedDiameters: 'B. Normalized Diameters (a_norm = 1)',
      formulaSecCRatioAreas: 'C. Area Ratios (Plotted Graph Functions)',
      formulaSecCRatioPerimeters: 'C. Perimeter Ratios (Plotted Graph Functions)',
      formulaSecCRatioRadii: 'C. Radius Ratios (Plotted Graph Functions)',
      formulaSecCRatioDiameters: 'C. Diameter Ratios (Plotted Graph Functions)',
      atSymmetryNotice: 'Already at the symmetry axis t = 1 (a = b, 1/t = t).',
    },
    invariants: {
      title: 'Geometry & Identity Verification',
      confirmedSuffix: 'verified',
      subtitle: 'Live Euclidean tangency, area, four-circle identity, and Thales theorem checks (tolerance 10⁻⁹):',
      calcLabel: 'Computed',
      expectedLabel: 'Expected',
      groupFourCircles: 'Four Core Circles (8)',
      groupThales: 'Thales Circumcircle K_o (9)',
      items: {
        incircle_positive: {
          name: 'Inradius Positivity (r > 0)',
          description: 'Incircle K_i exists with r > 0 and center I strictly inside triangle OAB.',
        },
        squares_construction: {
          name: 'Three Squares Q_a, Q_b, Q_c Construction',
          description: 'All square sides match triangle side lengths with exact 90° orthogonality.',
        },
        square_circles_tangency: {
          name: 'Square-Inscribed Circles Tangency (K_a, K_b, K_c)',
          description: 'Each of the three square circles is tangent to all four sides of its square.',
        },
        incircle_tangency: {
          name: 'Incircle K_i Tangency to Triangle Sides',
          description: 'Fourth circle K_i is tangent to both legs OA, OB and hypotenuse AB.',
        },
        four_circle_areas: {
          name: 'Four-Circle Area Consistency',
          description: 'All four circle areas match their closed-form analytical expressions.',
        },
        central_sqrt_identity: {
          name: 'Central Square-Root Area Identity',
          description: 'Sum of square roots of leg circle areas equals the sum for hypotenuse and incircle.',
        },
        pythagorean_circle_areas: {
          name: 'Pythagorean Square-Circle Area Sum',
          description: 'Sum of square-inscribed circle areas on legs equals the hypotenuse circle area.',
        },
        area_non_equality_contrast: {
          name: 'Direct Area Contrast (Non-Equality)',
          description: 'Direct area sum differs from K_c + K_i by exactly -K_i < 0.',
        },
        thales_diameter: {
          name: 'K_o Diameter Equals Hypotenuse (D_o = c)',
          description: 'By Thales theorem, the diameter of the circumcircle of a right triangle equals the hypotenuse.',
        },
        thales_radius: {
          name: 'K_o Radius Equals Half Hypotenuse (R_o = c/2)',
          description: 'The circumradius equals exactly half of the hypotenuse length.',
        },
        thales_area: {
          name: 'Circumcircle Area Consistency (K_o = πc²/4)',
          description: 'Circumcircle area K_o matches its analytical formula from radius R_o = c/2.',
        },
        thales_circumference: {
          name: 'Circumcircle Perimeter Consistency (L_o = πc)',
          description: 'Circumference L_o equals π times the hypotenuse.',
        },
        thales_dist_A: {
          name: 'Vertex A Lies on K_o (|O_o - A| = R_o)',
          description: 'Distance from hypotenuse midpoint O_o to vertex A equals circumradius R_o.',
        },
        thales_dist_B: {
          name: 'Vertex B Lies on K_o (|O_o - B| = R_o)',
          description: 'Distance from hypotenuse midpoint O_o to vertex B equals circumradius R_o.',
        },
        thales_dist_C: {
          name: 'Right-Angle Vertex O Lies on K_o (|O_o - O| = R_o)',
          description: 'The right-angle vertex lies directly on circumcircle K_o (median to hypotenuse is c/2).',
        },
        thales_area_eq_Kc: {
          name: 'Area Equality K_o = K_c with Distinct Centers',
          description: 'Hypotenuse square circle K_c and circumcircle K_o have equal area while O_o ≠ O_c.',
        },
        thales_right_angle: {
          name: 'Right Angle Subtending Diameter AB (∠AOB = 90°)',
          description: 'The inscribed angle opposite diameter AB remains 90° across all valid legs.',
        },
      },
    },
    compareModal: {
      title: 'Compare Five-Circle Configurations',
      subtitle: 'Side-by-side comparison of reference triangle and current construction',
      captureBtn: 'Capture current as Config 1',
      loadBtn: 'Load Config 1',
      config1: 'Config 1',
      config2: 'Config 2',
      colQuantity: 'Metric',
      colConf1: 'Config 1',
      colConf2: 'Config 2',
      metrics: {
        legA: 'Leg a',
        legB: 'Leg b',
        hypC: 'Hypotenuse c',
        inradiusR: 'Inradius r',
        radiusRo: 'Circumradius R_o',
        areaKa: 'Area K_a',
        areaKb: 'Area K_b',
        areaKc: 'Area K_c',
        areaKi: 'Area K_i',
        areaKo: 'Area K_o',
      },
    },
    testModal: {
      title: 'Control Triangles & Identity Verification',
      subtitle: 'Automated verification of 17 invariants (8 Four-Circles + 9 Thales Circumcircle K_o)',
      colTriangle: 'Triangle',
      colProfile: 'Geometric Profile',
      colChecks: 'Checks',
      colDelta: 'Residual Δ',
      colAction: 'Action',
      okStatus: 'OK',
      failStatus: 'FAIL',
      openBtn: 'Open',
      openTitle: 'Load this triangle onto the board',
      allPassBanner: 'All control triangles verified 17/17 invariants: squares and four circles, √K_a + √K_b = √K_c + √K_i, and all Thales circumcircle K_o properties (D_o = c, K_o = K_c, O_o ≠ O_c, ∠AOB = 90°).',
      failBanner: 'Invariant discrepancy detected in one or more configurations.',
      cases: {
        '3_4': 'Egyptian triangle: c = 5, r = 1, R_o = 2.5',
        '5_12': 'Pythagorean triple: c = 13, r = 2, R_o = 6.5',
        '4_4': 'Symmetry a = b: K_a = K_b, r ≈ 1.1716, R_o = 2√2',
        '1_10': 'Elongated triangle: c ≈ 10.0499, r ≈ 0.4751',
        '10_1': 'Mirrored elongated: K_a ↔ K_b, K_i and K_o unchanged',
      },
    },
    helpModal: {
      title: 'Help: Pythagoras — Four Circles & Thales Circumcircle',
      subtitle: 'Geometric model of five circles generated by a right triangle',
      sec1Title: 'Five Circles in a Single Parametric System',
      sec1IntroBefore: 'Every object in the construction is computed deterministically from two independent parameters — legs',
      sec1IntroAnd: 'and',
      sec1IntroTriangle: 'of right triangle',
      kaColor: 'blue',
      kaDesc1: 'circle of diameter',
      kaDesc2: 'inscribed in square',
      kaDesc3: 'on leg',
      kbColor: 'emerald',
      kbDesc1: 'circle of diameter',
      kbDesc2: 'inscribed in square',
      kbDesc3: 'on leg',
      kcColor: 'crimson',
      kcDesc1: 'circle of diameter',
      kcDesc2: 'inscribed in square',
      kcDesc3: 'on hypotenuse',
      kiColor: 'amber',
      kiDesc1: 'the triangle incircle strictly inside',
      kiDesc2: 'tangent to all three sides. Radius',
      kiDesc3: 'area',
      koColor: 'violet',
      koDesc1: 'Thales circumcircle passing through all three vertices',
      koDesc2: 'centered at hypotenuse midpoint',
      koDesc3: 'diameter',
      sec2Title: 'Central Four-Circle Identity:',
      sec2Text1: 'Since',
      sec2TextAnd: 'and',
      sec2Text2: 'adding the right-hand terms gives',
      sec2Text3: '— matching the left-hand side identically!',
      sec3Title: 'Why Direct Area Equality Fails:',
      sec3Bullet1: 'By the Pythagorean theorem on the three square circles:',
      sec3Bullet2Before: 'Since the incircle has strictly positive area',
      sec3Bullet2After: ', we obtain',
      sec4Title: 'Thales Theorem & K_o = K_c Equality:',
      sec4Text: 'Circumcircle K_o on diameter AB and square-inscribed circle K_c inside Q_c share the same diameter c, radius c/2, circumference πc, and area πc²/4, while having distinct centers O_o = (b/2, a/2) and O_c = ((a+b)/2, (a+b)/2).',
      gotItBtn: 'Got it',
    },
    classificationLab: {
      brandTitle: 'Pythagorean Classification Lab',
      legacyBtn: 'Legacy Geometry Lab',
      backToClassificationBtn: 'Return to Classification Lab C(r)',
      legacyBannerTitle: 'Legacy Mode: Four-Circles Geometry Laboratory',
      legacyBannerSubtitle: 'Isolated continuous-geometry environment (F01–F19, Exp 01–06). Kept strictly separate from discrete C(r) classification.',
      radiusLabel: 'Inradius r',
      diameterLabel: 'Diameter D = 2r',
      applyRadiusBtn: 'Apply',
      invalidRadiusError: 'Enter an integer r ≥ 1',
      quickRadiiLabel: 'Reference r:',
      exactDomainLegend: 'Exact arithmetic: BigInt / ExactRational (M1–M6 not implemented)',
      approxDomainLegend: 'Approximate visualization: float64 2D graphics',
      toggleInspectorShow: 'Show Inspector',
      toggleInspectorHide: 'Hide Inspector',
      sidebarWorkspaceLabel: 'Research Sections',
      sidebarLegacySectionLabel: 'Preserved Legacy',
      inspectorTitle: 'Class Context C(r)',
      inspectorActiveClass: 'Selected Class',
      inspectorReadinessTitle: 'Core Module Status (M1–M8)',
      inspectorOpenQuestionsTitle: 'Open Decisions (DESIGN_REVIEW)',
      emptyStates: {
        not_implemented: 'Module not implemented',
        awaiting_verified_data: 'Awaiting verified data',
        under_development: 'Research module under development',
      },
      sections: {
        class_atlas: {
          navShort: '01 Atlas',
          short: '01. Class Atlas',
          title: '01. Inradius Class Atlas C(r)',
          subtitle: 'Overview of integer classes C(r), even diameters D = 2r, and documented corpus scope r = 1..100',
        },
        class_inspector: {
          navShort: '02 Class C(r)',
          short: '02. Class Inspector',
          title: '02. Class Inspector C(r) & Subclasses Cₖ(r)',
          subtitle: 'Class passport CL-R{r}-D{2r}, scale subclass decomposition Cₖ(r) (k | r), and factorization certification policy',
        },
        triple_matrix: {
          navShort: '03 Matrix',
          short: '03. Matrix & Passport',
          title: '03. Triple Matrix & Passport PT-R{r}-K{k}-X{x}',
          subtitle: 'Six feature categories of Specification v0.1 separating exact arithmetic columns from approximate float64 quantities',
        },
        hyperbola_divisors: {
          navShort: '04 Hyperbola',
          short: '04. Hyperbola xy = 2r²',
          title: '04. Factorization Pair (x, y) & Hyperbola xy = 2r² Explorer',
          subtitle: 'Factorization shift x = a − 2r, y = b − 2r, bounds 1 ≤ x < √2·r < y ≤ 2r², and bijection with (u, v)',
        },
        geometric_inspector: {
          navShort: '05 Geometry',
          short: '05. Geometric Inspector',
          title: '05. Geometric Inspector (Approximate float64 Visualization)',
          subtitle: 'Standalone GeometryBoard SVG engine demo and prepared M7 adapter interface for the selected class C(r)',
        },
        structural_analysis: {
          navShort: '06 Analysis',
          short: '06. Structural Analysis',
          title: '06. Structural Analysis: Sporn, Berggren, Price & Pencils',
          subtitle: 'Normalized coordinates x̃ỹ = 2, asymmetry metric status (OQ-02), primitive triple generation trees, and pencils',
        },
        verification_export: {
          navShort: '07 Verify',
          short: '07. Verification & Export',
          title: '07. Independent Verification CHK-01…CHK-12 & Export',
          subtitle: 'Invariant verification checklist, documented reference datasets (r ≤ 30, r ≤ 100), and reproducible export schema',
        },
      },
    },
  },
};
