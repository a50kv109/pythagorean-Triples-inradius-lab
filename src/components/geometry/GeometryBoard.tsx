/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ActiveModuleId,
  BoardLayerFilter,
  FourCirclesCalculations,
  HoveredObject,
  Point2D,
} from '../../types/geometry.ts';
import { Translations } from '../../i18n/translations.ts';
import { CoordinateGrid } from './CoordinateGrid.tsx';
import { RightTriangleView } from './RightTriangleView.tsx';
import { FourCirclesView } from './FourCirclesView.tsx';
import { InteractivePoint } from './InteractivePoint.tsx';
import { ArcClassificationBoardOverlay } from './ArcClassificationBoardOverlay.tsx';
import { ArcAngleBoardOverlay } from './ArcAngleBoardOverlay.tsx';
import { IncircleArcDistributionOverlay } from './IncircleArcDistributionOverlay.tsx';
import { ArcSideAreaBoardOverlay } from './ArcSideAreaBoardOverlay.tsx';
import { IncenterPartitionOverlay } from './IncenterPartitionOverlay.tsx';
import { IncenterPartitionControls } from './IncenterPartitionControls.tsx';
import { calculateIncenterPartition } from '../../math/IncenterPartition.ts';
import {
  ArcDiscretizationResult,
  ArcSampleTriangle,
} from '../../math/experiments/arcBasedClassification.ts';
import { ArcAngleZoneSpec } from '../../math/experiments/arcAngleParametricAnalysis.ts';
import { toScreen, toMath } from '../../geometry/transforms.ts';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Layers,
  Compass,
  PanelRightClose,
  PanelRightOpen,
  Info,
} from 'lucide-react';

interface GeometryBoardProps {
  calc: FourCirclesCalculations;
  activeModule: ActiveModuleId;
  onChangeA: (newA: number, recordHistory?: boolean) => void;
  onChangeB: (newB: number, recordHistory?: boolean) => void;
  onCommitDrag?: () => void;
  layerFilter: BoardLayerFilter;
  setLayerFilter: (layer: BoardLayerFilter) => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  svgRefExternal?: React.RefObject<SVGSVGElement | null>;
  arcPhiDeg?: number;
  arcDiscretization?: ArcDiscretizationResult;
  selectedArcAngleZone?: ArcAngleZoneSpec | null;
  onChangeArcPhi?: (newR: number, newPhiDeg: number, recordHistory?: boolean) => void;
  t: Translations;
}

export const GeometryBoard: React.FC<GeometryBoardProps> = ({
  calc,
  activeModule,
  onChangeA,
  onChangeB,
  onCommitDrag,
  layerFilter,
  setLayerFilter,
  isRightPanelOpen,
  onToggleRightPanel,
  svgRefExternal,
  arcPhiDeg = 45,
  arcDiscretization,
  selectedArcAngleZone = null,
  onChangeArcPhi,
  t,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = svgRefExternal || internalSvgRef;

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(38);
  const [originOffset, setOriginOffset] = useState<Point2D>({ x: 260, y: 400 });

  // Dragging states (A along Y, B along X, T_AB along quarter-circle arc, or pan background)
  const [activeDrag, setActiveDrag] = useState<'A' | 'B' | 'T_AB' | 'pan' | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; origOffset: Point2D }>({
    clientX: 0,
    clientY: 0,
    origOffset: { x: 260, y: 400 },
  });

  // Display toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showCenters, setShowCenters] = useState(true);
  const [showRadii, setShowRadii] = useState(true);
  const [showAngles, setShowAngles] = useState(false);
  const [showCircumcircle, setShowCircumcircle] = useState(true);

  // Incenter partition layer states
  const [showIncenterPartition, setShowIncenterPartition] = useState<boolean>(false);
  const [partitionMode, setPartitionMode] = useState<'geometric' | 'proof' | 'spectral'>('geometric');
  const [partitionProofStep, setPartitionProofStep] = useState<number>(0);
  const [partitionShowSegments, setPartitionShowSegments] = useState<boolean>(true);
  const [partitionShowFills, setPartitionShowFills] = useState<boolean>(true);
  const [partitionShowRadii, setPartitionShowRadii] = useState<boolean>(true);
  const [partitionShowAllRadii, setPartitionShowAllRadii] = useState<boolean>(true);
  const [partitionShowLabels, setPartitionShowLabels] = useState<boolean>(true);
  const [partitionShowValues, setPartitionShowValues] = useState<boolean>(true);

  // Hovered object inspection
  const [hoveredObj, setHoveredObj] = useState<HoveredObject | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleFitView = useCallback(() => {
    const a = calc.triangle.a;
    const b = calc.triangle.b;
    const focusTriangleOnly =
      layerFilter === 'incenter_partition' ||
      showIncenterPartition ||
      activeModule === 'incircle_focus' ||
      activeModule === 'arc_classification' ||
      activeModule === 'arc_angle_analysis' ||
      activeModule === 'incircle_arc_distribution' ||
      activeModule === 'arc_side_area';
    const focusThalesOnly =
      activeModule === 'thales_circumcircle' || layerFilter === 'thales_only';

    let minX = -a - 1;
    let maxX = b + a + 1;
    let minY = -b - 1;
    let maxY = a + b + 1;

    if (focusThalesOnly) {
      const { center, radius } = calc.circumcircle;
      minX = Math.min(-0.8, center.x - radius - 0.9);
      maxX = Math.max(b + 0.9, center.x + radius + 0.9);
      minY = Math.min(-0.8, center.y - radius - 0.9);
      maxY = Math.max(a + 0.9, center.y + radius + 1.1);
    } else if (focusTriangleOnly) {
      const r2 = 2 * calc.incircle.radius;
      minX = -0.8;
      maxX = Math.max(b + 1.2, r2 + 1.6);
      minY = -0.8;
      maxY = Math.max(a + 1.2, r2 + 1.6);
    }

    const mathWidth = maxX - minX;
    const mathHeight = maxY - minY;

    const fitScaleX = (dimensions.width * 0.78) / mathWidth;
    const fitScaleY = (dimensions.height * 0.78) / mathHeight;
    const newScale = Math.min(80, Math.max(14, Math.min(fitScaleX, fitScaleY)));

    setScale(newScale);

    const centerMathX = (minX + maxX) / 2;
    const centerMathY = (minY + maxY) / 2;
    const newOriginX = dimensions.width / 2 - centerMathX * newScale;
    const newOriginY = dimensions.height / 2 + centerMathY * newScale;

    setOriginOffset({ x: newOriginX, y: newOriginY });
  }, [calc, dimensions, activeModule, layerFilter]);

  // Fit on initial mount / container ready
  const didInitialFitRef = useRef(false);
  useEffect(() => {
    if (!didInitialFitRef.current && dimensions.width > 100 && dimensions.height > 100) {
      didInitialFitRef.current = true;
      handleFitView();
    }
  }, [dimensions, handleFitView]);

  const handlePointerDownA = (e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveDrag('A');
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerDownB = (e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveDrag('B');
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerDownTangent = (e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveDrag('T_AB');
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleSelectArcSample = (sample: ArcSampleTriangle) => {
    onChangeArcPhi?.(sample.r, sample.phiDeg, true);
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setActiveDrag('pan');
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      origOffset: { ...originOffset },
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || !svgRef.current) return;

    if (activeDrag === 'pan') {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;
      setOriginOffset({
        x: dragStartRef.current.origOffset.x + dx,
        y: dragStartRef.current.origOffset.y + dy,
      });
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const mathP = toMath({ x: screenX, y: screenY }, originOffset, scale);

    if (activeDrag === 'A') {
      const newA = Math.max(0.5, Math.min(15, Math.round(mathP.y * 10) / 10));
      onChangeA(newA, false);
    } else if (activeDrag === 'B') {
      const newB = Math.max(0.5, Math.min(15, Math.round(mathP.x * 10) / 10));
      onChangeB(newB, false);
    } else if (activeDrag === 'T_AB') {
      const r = calc.incircle.radius;
      const dx = Math.max(1e-4, mathP.x - r);
      const dy = Math.max(1e-4, mathP.y - r);
      const rawPhiDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
      const clampedPhi = Math.max(2, Math.min(88, Math.round(rawPhiDeg * 10) / 10));
      onChangeArcPhi?.(r, clampedPhi, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
      if (activeDrag === 'A' || activeDrag === 'B' || activeDrag === 'T_AB') {
        onCommitDrag?.();
      }
      setActiveDrag(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!svgRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(120, Math.max(12, scale * zoomFactor));

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newOriginX = mouseX - (mouseX - originOffset.x) * (newScale / scale);
    const newOriginY = mouseY - (mouseY - originOffset.y) * (newScale / scale);

    setScale(newScale);
    setOriginOffset({ x: newOriginX, y: newOriginY });
  };

  const pO = toScreen(calc.triangle.O, originOffset, scale);
  const pA = toScreen(calc.triangle.A, originOffset, scale);
  const pB = toScreen(calc.triangle.B, originOffset, scale);

  const incenterPartition = React.useMemo(() => calculateIncenterPartition(calc), [calc]);
  const isPartitionActive = layerFilter === 'incenter_partition' || showIncenterPartition;

  const layerOptions: Array<{ id: BoardLayerFilter; label: string }> = [
    { id: 'all', label: t.board.all },
    { id: 'triangle_incircle', label: t.board.triIncircle },
    { id: 'incenter_partition', label: t.board.incenterPartition || 'Разбиение через I' },
    { id: 'squares', label: t.board.squares },
    { id: 'square_circles', label: t.board.squareCircles },
    { id: 'four_circles_only', label: t.board.fourCirclesOnly },
    { id: 'thales_only', label: t.board.thalesOnly },
    { id: 'five_circles', label: t.board.fiveCircles },
  ];

  const handleSelectLayer = (id: BoardLayerFilter) => {
    setLayerFilter(id);
    if (id === 'thales_only' || id === 'five_circles') {
      setShowCircumcircle(true);
    }
    if (id === 'incenter_partition') {
      setShowIncenterPartition(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[260px] lg:min-h-[400px] bg-slate-50 overflow-hidden select-none flex flex-col"
    >
      {/* Board Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer selector */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white/92 backdrop-blur-md rounded-lg border border-slate-200/90 shadow-xs pointer-events-auto max-w-full">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1 whitespace-nowrap shrink-0">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> {t.board.layers}
          </span>
          {layerOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelectLayer(opt.id)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                layerFilter === opt.id
                  ? opt.id === 'incenter_partition'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : opt.id === 'thales_only' || opt.id === 'five_circles'
                    ? 'bg-violet-700 text-white shadow-xs'
                    : 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Visibility Toggles & Zoom Deck */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white/92 backdrop-blur-md rounded-lg border border-slate-200/90 shadow-xs pointer-events-auto ml-auto max-w-full">
          <button
            onClick={() => setShowIncenterPartition(!showIncenterPartition)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              isPartitionActive
                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Показать или скрыть слой «Разбиение через инцентр» (S = pr)"
          >
            {t.board.incenterPartition || 'Разбиение через I'}
          </button>
          <button
            onClick={() => setShowCircumcircle(!showCircumcircle)}
            className={`px-2 py-1 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showCircumcircle || layerFilter === 'thales_only'
                ? 'bg-violet-50 text-violet-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title={t.board.circumcircleToggleTitle}
          >
            {t.board.circumcircleToggle}
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showGrid ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.board.grid}
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showLabels ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.board.labels}
          </button>
          <button
            onClick={() => setShowCenters(!showCenters)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showCenters ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.board.centers}
          </button>
          <button
            onClick={() => setShowRadii(!showRadii)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showRadii ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.board.radii}
          </button>
          <button
            onClick={() => setShowAngles(!showAngles)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              showAngles ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.board.angles}
          </button>

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          <button
            onClick={() => setScale((s) => Math.min(120, s * 1.15))}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title={t.board.zoomInTitle}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(12, s * 0.85))}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title={t.board.zoomOutTitle}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitView}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title={t.board.fitViewTitle}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitView}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title={t.board.resetViewTitle}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="hidden lg:block w-px h-4 bg-slate-200 mx-0.5" />
          <button
            onClick={onToggleRightPanel}
            className="hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded whitespace-nowrap shrink-0"
            title={isRightPanelOpen ? t.actions.expandBoard : t.actions.showPanel}
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4" />
                <span>{t.actions.showPanel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        className={`w-full h-full bg-slate-50 cursor-crosshair ${
          activeDrag === 'pan' ? 'cursor-grabbing' : ''
        }`}
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <CoordinateGrid
          width={dimensions.width}
          height={dimensions.height}
          origin={originOffset}
          scale={scale}
          showGrid={showGrid}
          showAxes={true}
        />

        {/* Five Circles (Ka, Kb, Kc, Ki, Ko) + Three Squares Layer */}
        <FourCirclesView
          calc={calc}
          origin={originOffset}
          scale={scale}
          activeModule={activeModule}
          layerFilter={
            (activeModule === 'arc_classification' ||
              activeModule === 'arc_angle_analysis' ||
              activeModule === 'incircle_arc_distribution' ||
              activeModule === 'arc_side_area') &&
            layerFilter === 'all'
              ? 'triangle_incircle'
              : layerFilter
          }
          showLabels={showLabels}
          showCenters={showCenters}
          showRadii={showRadii}
          showCircumcircle={showCircumcircle}
          onHoverObject={setHoveredObj}
          t={t}
        />

        {/* Right Triangle OAB */}
        <RightTriangleView
          triangle={calc.triangle}
          origin={originOffset}
          scale={scale}
          showLabels={showLabels}
          showAngles={showAngles}
          showAltitude={false}
          hasExteriorSquares={
            activeModule !== 'arc_classification' &&
            activeModule !== 'arc_angle_analysis' &&
            activeModule !== 'incircle_arc_distribution' &&
            activeModule !== 'arc_side_area' &&
            layerFilter !== 'triangle_incircle' &&
            layerFilter !== 'thales_only' &&
            layerFilter !== 'incenter_partition' &&
            !showIncenterPartition
          }
          onHoverObject={setHoveredObj}
          t={t}
        />

        {/* Incenter Triangle Partition Layer (S = SA + SB + SC = pr) */}
        {isPartitionActive && (
          <IncenterPartitionOverlay
            partition={incenterPartition}
            origin={originOffset}
            scale={scale}
            showSegments={partitionShowSegments}
            showFills={partitionShowFills}
            showRadii={partitionShowRadii}
            showAllRadii={partitionShowAllRadii}
            showLabels={partitionShowLabels}
            showValues={partitionShowValues}
            proofStep={partitionMode === 'proof' ? partitionProofStep : 0}
            onHoverObject={setHoveredObj}
            t={t}
          />
        )}

        {/* Experiment 02 Arc-Based Classification Overlay */}
        {activeModule === 'arc_classification' && arcDiscretization && (
          <ArcClassificationBoardOverlay
            calc={calc}
            origin={originOffset}
            scale={scale}
            phiDeg={arcPhiDeg}
            discretization={arcDiscretization}
            isDraggingTangent={activeDrag === 'T_AB'}
            onPointerDownTangent={handlePointerDownTangent}
            onSelectSample={handleSelectArcSample}
            onHoverObject={setHoveredObj}
          />
        )}

        {/* Experiment 04 Arc-Angle Parametric Analysis Overlay */}
        {activeModule === 'arc_angle_analysis' && (
          <ArcAngleBoardOverlay
            calc={calc}
            origin={originOffset}
            scale={scale}
            alphaDeg={arcPhiDeg}
            selectedZone={selectedArcAngleZone}
            isDraggingTangent={activeDrag === 'T_AB'}
            onPointerDownTangent={handlePointerDownTangent}
            onSelectAlpha={(deg) => onChangeArcPhi?.(calc.incircle.radius, deg, true)}
            onHoverObject={setHoveredObj}
          />
        )}

        {/* Experiment 05 Incircle Three-Arc Distribution Overlay */}
        {activeModule === 'incircle_arc_distribution' && (
          <IncircleArcDistributionOverlay
            calc={calc}
            origin={originOffset}
            scale={scale}
            alphaDeg={arcPhiDeg}
            isDraggingTangent={activeDrag === 'T_AB'}
            onPointerDownTangent={handlePointerDownTangent}
            onHoverObject={setHoveredObj}
          />
        )}

        {/* Experiment 06 Arc-Side-Area Correspondence Overlay */}
        {activeModule === 'arc_side_area' && (
          <ArcSideAreaBoardOverlay
            calc={calc}
            origin={originOffset}
            scale={scale}
            alphaDeg={arcPhiDeg}
            isDraggingTangent={activeDrag === 'T_AB'}
            onPointerDownTangent={handlePointerDownTangent}
            onHoverObject={setHoveredObj}
          />
        )}

        {/* Fixed Origin Vertex O */}
        <circle
          cx={pO.x}
          cy={pO.y}
          r="5"
          fill="#1e293b"
          stroke="#ffffff"
          strokeWidth="2"
          className="cursor-pointer"
          onPointerEnter={() =>
            setHoveredObj({
              id: 'vertex-O',
              title: t.hover.originTitle,
              details: t.hover.originDetails,
              category: 'vertex',
            })
          }
          onPointerLeave={() => setHoveredObj(null)}
        />

        {/* Interactive Point A (along y-axis) */}
        <InteractivePoint
          id="handle-vertex-A"
          name="A"
          point={pA}
          mathCoord={calc.triangle.A}
          color="#2563eb"
          isDraggable={true}
          axisConstraint="y-axis"
          isDragging={activeDrag === 'A'}
          onPointerDown={handlePointerDownA}
          onHoverObject={setHoveredObj}
          t={t}
        />

        {/* Interactive Point B (along x-axis) */}
        <InteractivePoint
          id="handle-vertex-B"
          name="B"
          point={pB}
          mathCoord={calc.triangle.B}
          color="#059669"
          isDraggable={true}
          axisConstraint="x-axis"
          isDragging={activeDrag === 'B'}
          onPointerDown={handlePointerDownB}
          onHoverObject={setHoveredObj}
          t={t}
        />
      </svg>

      {/* Floating Incenter Partition Interactive Controls & Numerical Table */}
      {isPartitionActive && (
        <IncenterPartitionControls
          partition={incenterPartition}
          mode={partitionMode}
          onChangeMode={(m) => {
            setPartitionMode(m);
            if (m === 'proof' && partitionProofStep === 0) {
              setPartitionProofStep(1);
            }
          }}
          showSegments={partitionShowSegments}
          onToggleSegments={() => setPartitionShowSegments((s) => !s)}
          showFills={partitionShowFills}
          onToggleFills={() => setPartitionShowFills((s) => !s)}
          showRadii={partitionShowRadii}
          onToggleRadii={() => setPartitionShowRadii((s) => !s)}
          showAllRadii={partitionShowAllRadii}
          onToggleAllRadii={() => setPartitionShowAllRadii((s) => !s)}
          showLabels={partitionShowLabels}
          onToggleLabels={() => setPartitionShowLabels((s) => !s)}
          showValues={partitionShowValues}
          onToggleValues={() => setPartitionShowValues((s) => !s)}
          proofStep={partitionProofStep}
          onChangeProofStep={setPartitionProofStep}
          onClose={() => {
            setShowIncenterPartition(false);
            if (layerFilter === 'incenter_partition') {
              setLayerFilter('triangle_incircle');
            }
          }}
        />
      )}

      {/* Bottom Board HUD: Hover Inspector + Drag Hint */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 shadow-xs">
          <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{t.board.dragHint}</span>
        </div>

        <div className="flex items-center gap-2 bg-white/92 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs max-w-md truncate">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          {hoveredObj ? (
            <span className="truncate">
              <strong className="text-slate-900">{hoveredObj.title}:</strong>{' '}
              <span className="text-slate-600 font-mono text-[11px]">{hoveredObj.details}</span>
            </span>
          ) : (
            <span className="text-slate-500">{t.board.hoverDefault}</span>
          )}
        </div>
      </div>
    </div>
  );
};
