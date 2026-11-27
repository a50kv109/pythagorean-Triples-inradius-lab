/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ActiveModuleId, BoardLayerFilter, DisplayMode } from '../../types/geometry.ts';
import { calculateFourCircles } from '../../math/FourCirclesModel.ts';
import { legsFromRatioAndHypotenuse } from '../../math/FourCirclesSpectralAnalysis.ts';
import { LanguageCode, TRANSLATIONS } from '../../i18n/translations.ts';
import { Header } from '../common/Header.tsx';
import { BottomToolbar } from '../common/BottomToolbar.tsx';
import { GeometryBoard } from '../geometry/GeometryBoard.tsx';
import { ControlsPanel } from '../panels/ControlsPanel.tsx';
import { FourCirclesPanel } from '../panels/FourCirclesPanel.tsx';
import { SpectralAnalysisPanel } from '../panels/SpectralAnalysisPanel.tsx';
import { ThalesCircumcirclePanel } from '../panels/ThalesCircumcirclePanel.tsx';
import { ArcClassificationPanel } from '../panels/ArcClassificationPanel.tsx';
import { ArcAngleAnalysisPanel } from '../panels/ArcAngleAnalysisPanel.tsx';
import { IncircleArcDistributionPanel } from '../panels/IncircleArcDistributionPanel.tsx';
import { ArcSideAreaPanel } from '../panels/ArcSideAreaPanel.tsx';
import { InvariantsPanel } from '../panels/InvariantsPanel.tsx';
import { ComparisonModal } from '../panels/ComparisonModal.tsx';
import { TestRunnerModal } from '../panels/TestRunnerModal.tsx';
import { HelpModal } from '../panels/HelpModal.tsx';
import {
  DiscretizationMode,
  discretizeArcAngular,
  discretizeArcLinear,
  triangleFromPhysicalArcAngle,
} from '../../math/experiments/arcBasedClassification.ts';
import { EXPERIMENT04_RESEARCH_ZONES } from '../../math/experiments/arcAngleParametricAnalysis.ts';
import { ArrowLeft } from 'lucide-react';

interface HistoryEntry {
  a: number;
  b: number;
}

interface LegacyGeometryWorkspaceProps {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  onReturnToClassification: () => void;
}

export const LegacyGeometryWorkspace: React.FC<LegacyGeometryWorkspaceProps> = ({
  lang,
  setLang,
  onReturnToClassification,
}) => {
  const [a, setA] = useState<number>(4);
  const [b, setB] = useState<number>(3);

  const [historyState, setHistoryState] = useState<{
    entries: HistoryEntry[];
    index: number;
  }>({
    entries: [{ a: 4, b: 3 }],
    index: 0,
  });

  const [legMutationToken, setLegMutationToken] = useState<number>(0);
  const [graphMutationToken, setGraphMutationToken] = useState<number>(0);

  const t = TRANSLATIONS[lang];

  const [activeModule, setActiveModule] = useState<ActiveModuleId>('four_circles');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('research');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  const [layerFilter, setLayerFilter] = useState<BoardLayerFilter>('all');
  const [isStepAnimating, setIsStepAnimating] = useState<boolean>(false);

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const svgBoardRef = useRef<SVGSVGElement | null>(null);

  const [arcMode, setArcMode] = useState<DiscretizationMode>('angular');
  const [arcAngularStepDeg, setArcAngularStepDeg] = useState<number>(15);
  const [arcLinearStepL, setArcLinearStepL] = useState<number>(0.25);
  const [exp04ZoneId, setExp04ZoneId] = useState<string | null>('zone_15_30');

  const calc = useMemo(() => calculateFourCircles(a, b), [a, b]);

  const currentArcPhiDeg = useMemo(() => {
    const deg = (Math.atan2(calc.triangle.a, calc.triangle.b) * 180) / Math.PI;
    return Math.max(0.5, Math.min(89.5, deg));
  }, [calc.triangle.a, calc.triangle.b]);

  const selectedExp04Zone = useMemo(
    () => EXPERIMENT04_RESEARCH_ZONES.find((z) => z.id === exp04ZoneId) ?? null,
    [exp04ZoneId]
  );

  const arcDiscretization = useMemo(() => {
    if (activeModule !== 'arc_classification') return undefined;
    const r = calc.incircle.radius;
    return arcMode === 'angular'
      ? discretizeArcAngular(r, arcAngularStepDeg)
      : discretizeArcLinear(r, arcLinearStepL);
  }, [activeModule, calc.incircle.radius, arcMode, arcAngularStepDeg, arcLinearStepL]);

  const latestGeomRef = useRef({ a, b, c: calc.triangle.c });
  latestGeomRef.current = { a, b, c: calc.triangle.c };

  const pushHistory = useCallback((nextA: number, nextB: number) => {
    setHistoryState((prev) => {
      const sliced = prev.entries.slice(0, prev.index + 1);
      const last = sliced[sliced.length - 1];
      if (last && Math.abs(last.a - nextA) < 1e-5 && Math.abs(last.b - nextB) < 1e-5) {
        return prev;
      }
      const entries = [...sliced, { a: nextA, b: nextB }].slice(-40);
      return { entries, index: entries.length - 1 };
    });
  }, []);

  const clampVal = (val: number) => {
    if (!Number.isFinite(val)) return 1;
    return Math.max(0.2, Math.min(15, Math.round(val * 1e6) / 1e6));
  };

  const handleChangeA = useCallback(
    (newA: number, recordHistory = true) => {
      const clamped = clampVal(newA);
      setA(clamped);
      setLegMutationToken((n) => n + 1);
      if (recordHistory) {
        pushHistory(clamped, latestGeomRef.current.b);
      }
    },
    [pushHistory]
  );

  const handleChangeB = useCallback(
    (newB: number, recordHistory = true) => {
      const clamped = clampVal(newB);
      setB(clamped);
      setLegMutationToken((n) => n + 1);
      if (recordHistory) {
        pushHistory(latestGeomRef.current.a, clamped);
      }
    },
    [pushHistory]
  );

  const handleSetBoth = useCallback(
    (newA: number, newB: number, recordHistory = true) => {
      const clampedA = clampVal(newA);
      const clampedB = clampVal(newB);
      setA(clampedA);
      setB(clampedB);
      setLegMutationToken((n) => n + 1);
      if (recordHistory) {
        pushHistory(clampedA, clampedB);
      }
    },
    [pushHistory]
  );

  const handleChangeT = useCallback(
    (
      targetT: number,
      recordHistory = true,
      fixedHypotenuse?: number,
      fromSymmetryAnimation = false
    ) => {
      if (!Number.isFinite(targetT) || targetT <= 0) return;
      const refC =
        fixedHypotenuse !== undefined && Number.isFinite(fixedHypotenuse) && fixedHypotenuse > 0
          ? fixedHypotenuse
          : latestGeomRef.current.c;
      const { a: nextA, b: nextB } = legsFromRatioAndHypotenuse(targetT, refC, 0.2, 15);
      const clampedA = clampVal(nextA);
      const clampedB = clampVal(nextB);
      setA(clampedA);
      setB(clampedB);
      if (recordHistory) {
        pushHistory(clampedA, clampedB);
      }
      if (!fromSymmetryAnimation) {
        setLegMutationToken((n) => n + 1);
      }
      setGraphMutationToken((n) => n + 1);
    },
    [pushHistory]
  );

  const handleChangeLambda = useCallback(
    (targetLambda: number, recordHistory = true) => {
      if (!Number.isFinite(targetLambda) || targetLambda <= 0) return;
      const currentC = latestGeomRef.current.c;
      const currentLambda = currentC / 5.0;
      if (currentLambda <= 0) return;
      const factor = targetLambda / currentLambda;
      const newA = clampVal(latestGeomRef.current.a * factor);
      const newB = clampVal(latestGeomRef.current.b * factor);
      setA(newA);
      setB(newB);
      setLegMutationToken((n) => n + 1);
      setGraphMutationToken((n) => n + 1);
      if (recordHistory) {
        pushHistory(newA, newB);
      }
    },
    [pushHistory]
  );

  const handleChangeArcPhi = useCallback(
    (newR: number, newPhiDeg: number, recordHistory = true) => {
      if (!Number.isFinite(newR) || newR <= 0 || !Number.isFinite(newPhiDeg)) return;
      const clampedR = Math.max(0.25, Math.min(10, newR));
      const clampedPhi = Math.max(1, Math.min(89, newPhiDeg));
      const sample = triangleFromPhysicalArcAngle(clampedR, clampedPhi);
      const nextA = Math.max(0.1, Math.min(150, Math.round(sample.triangle.a * 1e6) / 1e6));
      const nextB = Math.max(0.1, Math.min(150, Math.round(sample.triangle.b * 1e6) / 1e6));
      setA(nextA);
      setB(nextB);
      setLegMutationToken((n) => n + 1);
      setGraphMutationToken((n) => n + 1);
      if (recordHistory) {
        pushHistory(nextA, nextB);
      }
    },
    [pushHistory]
  );

  const handleCommitDrag = useCallback(() => {
    pushHistory(latestGeomRef.current.a, latestGeomRef.current.b);
  }, [pushHistory]);

  const canUndo = historyState.index > 0;
  const canRedo = historyState.index < historyState.entries.length - 1;

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index <= 0) return prev;
      const prevIdx = prev.index - 1;
      const entry = prev.entries[prevIdx];
      setA(entry.a);
      setB(entry.b);
      setLegMutationToken((n) => n + 1);
      return { ...prev, index: prevIdx };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index >= prev.entries.length - 1) return prev;
      const nextIdx = prev.index + 1;
      const entry = prev.entries[nextIdx];
      setA(entry.a);
      setB(entry.b);
      setLegMutationToken((n) => n + 1);
      return { ...prev, index: nextIdx };
    });
  }, []);

  const handleReset = useCallback(() => {
    handleSetBoth(4, 3, true);
    setLayerFilter('all');
  }, [handleSetBoth]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    if (!isStepAnimating) return;

    setActiveModule('four_circles');
    const sequence: BoardLayerFilter[] = [
      'triangle_incircle',
      'squares',
      'square_circles',
      'thales_only',
      'five_circles',
      'all',
    ];
    let stepIdx = 0;
    setLayerFilter(sequence[0]);

    const timer = setInterval(() => {
      stepIdx += 1;
      if (stepIdx >= sequence.length) {
        setLayerFilter('all');
        setIsStepAnimating(false);
        clearInterval(timer);
      } else {
        setLayerFilter(sequence[stepIdx]);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [isStepAnimating]);

  const handleExportSvg = useCallback(() => {
    const svg = svgBoardRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `four_circles_a${a}_b${b}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [a, b]);

  const handleExportPng = useCallback(() => {
    const svg = svgBoardRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const width = Math.max(800, rect.width || 1000);
    const height = Math.max(600, rect.height || 700);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `four_circles_a${a}_b${b}.png`;
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [a, b]);

  return (
    <div className="flex flex-col h-dvh w-full overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* Isolated Legacy Context Ribbon */}
      <div className="bg-slate-900 text-white px-5 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="text-xs font-semibold whitespace-nowrap">
            {t.classificationLab.legacyBannerTitle}
          </span>
          <span aria-hidden="true" className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-xs text-slate-300 truncate">
            {t.classificationLab.legacyBannerSubtitle}
          </span>
        </div>
        <button
          type="button"
          onClick={onReturnToClassification}
          className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.classificationLab.backToClassificationBtn}</span>
        </button>
      </div>

      {/* Preserved Legacy Four-Circles Header */}
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        t={t}
      />

      {/* Preserved Split 2-zone Legacy Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section
          aria-label={t.aria.boardSection}
          className={`relative bg-white transition-all ${
            isRightPanelOpen
              ? 'flex-1 lg:flex-[1.4] h-[45vh] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200'
              : 'flex-1 h-full w-full'
          }`}
        >
          <GeometryBoard
            calc={calc}
            activeModule={activeModule}
            onChangeA={handleChangeA}
            onChangeB={handleChangeB}
            onCommitDrag={handleCommitDrag}
            layerFilter={layerFilter}
            setLayerFilter={setLayerFilter}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
            svgRefExternal={svgBoardRef}
            arcPhiDeg={currentArcPhiDeg}
            arcDiscretization={arcDiscretization}
            selectedArcAngleZone={selectedExp04Zone}
            onChangeArcPhi={handleChangeArcPhi}
            t={t}
          />
        </section>

        {isRightPanelOpen && (
          <aside
            aria-label={t.aria.panelAside}
            className="flex-1 lg:flex-[1] h-[55vh] lg:h-full overflow-y-auto bg-slate-50/70 p-4 space-y-4"
          >
            {activeModule !== 'arc_classification' &&
              activeModule !== 'arc_angle_analysis' &&
              activeModule !== 'incircle_arc_distribution' &&
              activeModule !== 'arc_side_area' && (
              <ControlsPanel
                calc={calc}
                onChangeA={handleChangeA}
                onChangeB={handleChangeB}
                onSetBoth={handleSetBoth}
                onChangeLambda={handleChangeLambda}
                externalGraphMutationToken={graphMutationToken}
                t={t}
              />
            )}

            {activeModule === 'arc_side_area' ? (
              <ArcSideAreaPanel
                calc={calc}
                alphaDeg={currentArcPhiDeg}
                onChangeRadiusAndAlpha={handleChangeArcPhi}
                lang={lang}
              />
            ) : activeModule === 'incircle_arc_distribution' ? (
              <IncircleArcDistributionPanel
                calc={calc}
                alphaDeg={currentArcPhiDeg}
                onChangeRadiusAndAlpha={handleChangeArcPhi}
                lang={lang}
              />
            ) : activeModule === 'arc_angle_analysis' ? (
              <ArcAngleAnalysisPanel
                calc={calc}
                alphaDeg={currentArcPhiDeg}
                selectedZoneId={exp04ZoneId}
                onSelectZoneId={setExp04ZoneId}
                onChangeRadiusAndAlpha={handleChangeArcPhi}
                lang={lang}
              />
            ) : activeModule === 'arc_classification' && arcDiscretization ? (
              <ArcClassificationPanel
                calc={calc}
                phiDeg={currentArcPhiDeg}
                discretizationMode={arcMode}
                angularStepDeg={arcAngularStepDeg}
                linearStepL={arcLinearStepL}
                discretization={arcDiscretization}
                onChangeRadiusAndPhi={handleChangeArcPhi}
                onChangeMode={setArcMode}
                onChangeAngularStep={setArcAngularStepDeg}
                onChangeLinearStep={setArcLinearStepL}
                lang={lang}
              />
            ) : activeModule === 'spectral_analysis' ? (
              <SpectralAnalysisPanel
                calc={calc}
                onChangeT={handleChangeT}
                onChangeLambda={handleChangeLambda}
                externalLegMutationToken={legMutationToken}
                t={t}
              />
            ) : activeModule === 'thales_circumcircle' ? (
              <ThalesCircumcirclePanel
                calc={calc}
                onChangeLambda={handleChangeLambda}
                t={t}
              />
            ) : (
              <FourCirclesPanel
                calc={calc}
                activeModule={activeModule}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                t={t}
              />
            )}

            <InvariantsPanel calc={calc} t={t} />
          </aside>
        )}
      </div>

      <BottomToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        currentA={a}
        currentB={b}
        onLoadConfig={(na, nb) => handleSetBoth(na, nb, true)}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        isStepAnimating={isStepAnimating}
        onToggleStepAnimation={() => setIsStepAnimating(!isStepAnimating)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      <ComparisonModal
        currentCalc={calc}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onApplyConfig={(na, nb) => handleSetBoth(na, nb, true)}
        t={t}
      />

      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onLoadTestCase={(na, nb) => handleSetBoth(na, nb, true)}
        t={t}
      />

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} t={t} />
    </div>
  );
};
