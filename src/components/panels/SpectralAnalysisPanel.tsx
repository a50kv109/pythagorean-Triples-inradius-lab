/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import {
  AxisScaleMode,
  CIRCLE_SERIES_META,
  CircleKey,
  LinearMeasureKind,
  REFERENCE_T_VALUES,
  SpectralGraphMode,
  THALES_SERIES_META,
  computeFourCirclesSpectralAnalysis,
  evaluateParametricFourCircles,
  getNormalizedValuesForMode,
  getThalesNormalizedValueForMode,
  sampleSpectralCurves,
  sampleThalesAbsoluteCurves,
  sampleThalesScaleCurves,
} from '../../math/FourCirclesSpectralAnalysis.ts';
import { MathFormula } from '../common/MathFormula.tsx';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';
import {
  SYMMETRY_ANIMATION_DURATION_MS,
  evaluateSymmetryTrajectoryT,
  isAtSymmetryAxis,
} from '../../math/symmetryAnimation.ts';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers,
  Pause,
  PieChart,
  Play,
  RotateCcw,
  Sliders,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface SpectralAnalysisPanelProps {
  calc: FourCirclesCalculations;
  onChangeT: (
    targetT: number,
    recordHistory?: boolean,
    fixedHypotenuse?: number,
    fromSymmetryAnimation?: boolean
  ) => void;
  onChangeLambda?: (targetLambda: number, recordHistory?: boolean) => void;
  externalLegMutationToken?: number;
  t?: Translations;
}

const SERIES_ORDER: CircleKey[] = ['Ka', 'Kb', 'Kc', 'Ki'];

const PLOT = {
  width: 640,
  height: 300,
  left: 50,
  right: 20,
  top: 22,
  bottom: 38,
};

const PLOT_W = PLOT.width - PLOT.left - PLOT.right;
const PLOT_H = PLOT.height - PLOT.top - PLOT.bottom;
const Y_MIN = 0;
const Y_MAX = 1.06;

function formatTLabel(val: number): string {
  if (Math.abs(val - 1) < 1e-6) return '1';
  if (val >= 10) return val.toFixed(0);
  if (val >= 1) return Number(val.toFixed(2)).toString();
  if (val >= 0.1) return Number(val.toFixed(2)).toString();
  return Number(val.toFixed(3)).toString();
}

export const SpectralAnalysisPanel: React.FC<SpectralAnalysisPanelProps> = ({
  calc,
  onChangeT,
  onChangeLambda,
  externalLegMutationToken = 0,
  t = TRANSLATIONS.ru,
}) => {
  const [graphMode, setGraphMode] = useState<SpectralGraphMode>('areas');
  const [linearKind, setLinearKind] = useState<LinearMeasureKind>('radius');
  const [scaleMode, setScaleMode] = useState<AxisScaleMode>('log');
  const [tMin, setTMin] = useState<number>(0.1);
  const [tMax, setTMax] = useState<number>(10);
  const [showKoOverlay, setShowKoOverlay] = useState<boolean>(true);
  const [showShareBars, setShowShareBars] = useState<boolean>(false);
  const [isSweepingSymmetry, setIsSweepingSymmetry] = useState<boolean>(false);
  const [atSymmetryNotice, setAtSymmetryNotice] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Authoritative single animation controller state (never recreated on rerenders)
  const animStateRef = useRef<{
    rafId: number | null;
    startTime: number;
    tStart: number;
    referenceC: number;
  }>({
    rafId: null,
    startTime: 0,
    tStart: 1,
    referenceC: calc.triangle.c,
  });

  const onChangeTRef = useRef(onChangeT);
  onChangeTRef.current = onChangeT;

  // Authoritative parameter t = b / a from unified geometry model
  const currentT = calc.triangle.b / calc.triangle.a;

  // Authoritative current scale factor lambda = c / 5.0 (relative to Egyptian baseline c0 = 5)
  const currentLambda = calc.triangle.c / 5.0;

  // Authoritative current-state spectral calculations
  const spectral = useMemo(() => computeFourCirclesSpectralAnalysis(calc), [calc]);

  // Parametric normalized evaluation at exact currentT (synchronizes 100% with curves)
  const currentParametric = useMemo(
    () => evaluateParametricFourCircles(currentT),
    [currentT]
  );

  const isThalesAbsMode = graphMode === 'thales_abs';
  const isScaleMode = graphMode === 'scale_lambda';

  const currentNormalized = useMemo(
    () => getNormalizedValuesForMode(currentParametric, graphMode, linearKind),
    [currentParametric, graphMode, linearKind]
  );

  const currentThalesNorm = useMemo(
    () => getThalesNormalizedValueForMode(currentParametric, graphMode, linearKind),
    [currentParametric, graphMode, linearKind]
  );

  // Sample four mathematical curves + constant Ko line across [tMin, tMax]
  const curveSamples = useMemo(
    () =>
      isThalesAbsMode || isScaleMode
        ? []
        : sampleSpectralCurves({
            tMin,
            tMax,
            steps: 220,
            mode: graphMode,
            linearKind,
            scaleMode,
          }),
    [isThalesAbsMode, isScaleMode, tMin, tMax, graphMode, linearKind, scaleMode]
  );

  // Sample unnormalized K_o(t) absolute growth curves when in thales_abs mode
  const thalesAbsSamples = useMemo(
    () =>
      isThalesAbsMode
        ? sampleThalesAbsoluteCurves({
            tMin,
            tMax,
            steps: 220,
            scaleMode,
          })
        : [],
    [isThalesAbsMode, tMin, tMax, scaleMode]
  );

  // Sample dynamic scaling curves when in scale_lambda mode
  const scaleSamples = useMemo(
    () =>
      isScaleMode
        ? sampleThalesScaleCurves({
            baseC: 5,
            baseA: calc.triangle.a,
            baseB: calc.triangle.b,
            lambdaMin: 0.2,
            lambdaMax: 2.5,
            steps: 220,
            scaleMode: 'linear',
          })
        : [],
    [isScaleMode, calc.triangle.a, calc.triangle.b]
  );

  // Dynamic Y bounds for absolute growth chart vs scale chart vs fixed [0, 1.06] for normalized charts
  const absYMax = useMemo(() => {
    if (!isThalesAbsMode || thalesAbsSamples.length === 0) return Y_MAX;
    let maxVal = 1;
    for (const pt of thalesAbsSamples) {
      maxVal = Math.max(maxVal, pt.Ro, pt.Do, pt.Ko, pt.Lo);
    }
    return Math.max(2, maxVal * 1.08);
  }, [isThalesAbsMode, thalesAbsSamples]);

  const scaleYMax = useMemo(() => {
    if (!isScaleMode || scaleSamples.length === 0) return Y_MAX;
    let maxVal = 1;
    for (const pt of scaleSamples) {
      maxVal = Math.max(maxVal, pt.Ko, pt.Lo, pt.Do, pt.Ro, pt.Ki);
    }
    return Math.max(2, maxVal * 1.08);
  }, [isScaleMode, scaleSamples]);

  // Precompute reference points for active mode
  const referenceReadouts = useMemo(
    () =>
      REFERENCE_T_VALUES.map((refT) => {
        const ratios = evaluateParametricFourCircles(refT);
        const norm = getNormalizedValuesForMode(ratios, graphMode, linearKind);
        return { t: refT, norm, thalesAbs: ratios.thalesAbs };
      }),
    [graphMode, linearKind]
  );

  // Cancel symmetry animation cleanly whenever user modifies geometry externally
  const prevLegMutationTokenRef = useRef(externalLegMutationToken);
  useEffect(() => {
    if (externalLegMutationToken !== prevLegMutationTokenRef.current) {
      prevLegMutationTokenRef.current = externalLegMutationToken;
      setIsSweepingSymmetry(false);
    }
  }, [externalLegMutationToken]);

  // Clear t = 1 notice automatically once t moves away from the symmetry axis
  useEffect(() => {
    if (atSymmetryNotice && !isAtSymmetryAxis(currentT)) {
      setAtSymmetryNotice(false);
    }
  }, [atSymmetryNotice, currentT]);

  // Single authoritative requestAnimationFrame loop: smooth t_start -> 1/t_start -> t_start in log space
  useEffect(() => {
    if (!isSweepingSymmetry) {
      if (animStateRef.current.rafId !== null) {
        cancelAnimationFrame(animStateRef.current.rafId);
        animStateRef.current.rafId = null;
      }
      return;
    }

    const { startTime, tStart, referenceC } = animStateRef.current;

    const step = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(1, elapsed / SYMMETRY_ANIMATION_DURATION_MS);
      const nextT = evaluateSymmetryTrajectoryT(tStart, progress);

      onChangeTRef.current(nextT, false, referenceC, true);

      if (progress >= 1) {
        animStateRef.current.rafId = null;
        onChangeTRef.current(tStart, true, referenceC, true);
        setIsSweepingSymmetry(false);
        return;
      }

      animStateRef.current.rafId = requestAnimationFrame(step);
    };

    animStateRef.current.rafId = requestAnimationFrame(step);
    return () => {
      if (animStateRef.current.rafId !== null) {
        cancelAnimationFrame(animStateRef.current.rafId);
        animStateRef.current.rafId = null;
      }
    };
  }, [isSweepingSymmetry]);

  const handleToggleSymmetrySweep = () => {
    if (isSweepingSymmetry) {
      setIsSweepingSymmetry(false);
      return;
    }

    if (isAtSymmetryAxis(currentT)) {
      // Already at t = 1: preserve exact axis cleanly without unnecessary oscillation
      if (Math.abs(currentT - 1) > 1e-6) {
        onChangeT(1, false, calc.triangle.c, true);
      }
      setAtSymmetryNotice(true);
      setIsSweepingSymmetry(false);
      return;
    }

    const reciprocalT = 1 / currentT;
    const neededMin = Math.min(currentT, reciprocalT);
    const neededMax = Math.max(currentT, reciprocalT);
    if (neededMin < tMin) {
      setTMin(Math.max(0.02, neededMin * 0.85));
    }
    if (neededMax > tMax) {
      setTMax(Math.min(50, neededMax * 1.15));
    }

    animStateRef.current = {
      rafId: null,
      startTime: performance.now(),
      tStart: currentT,
      referenceC: calc.triangle.c,
    };
    setAtSymmetryNotice(false);
    setIsSweepingSymmetry(true);
  };

  // Coordinate mapping helpers
  const xToPx = useCallback(
    (val: number): number => {
      if (isScaleMode) {
        return PLOT.left + ((val - 0.2) / (2.5 - 0.2)) * PLOT_W;
      }
      if (scaleMode === 'log') {
        const lMin = Math.log10(tMin);
        const lMax = Math.log10(tMax);
        const lVal = Math.log10(Math.max(1e-9, val));
        return PLOT.left + ((lVal - lMin) / (lMax - lMin)) * PLOT_W;
      }
      return PLOT.left + ((val - tMin) / (tMax - tMin)) * PLOT_W;
    },
    [isScaleMode, scaleMode, tMin, tMax]
  );

  const pxToVal = useCallback(
    (svgX: number): number => {
      const clampedX = Math.max(PLOT.left, Math.min(PLOT.left + PLOT_W, svgX));
      const u = (clampedX - PLOT.left) / PLOT_W;
      if (isScaleMode) {
        return 0.2 + u * (2.5 - 0.2);
      }
      if (scaleMode === 'log') {
        const lMin = Math.log10(tMin);
        const lMax = Math.log10(tMax);
        return Math.pow(10, lMin + u * (lMax - lMin));
      }
      return tMin + u * (tMax - tMin);
    },
    [isScaleMode, scaleMode, tMin, tMax]
  );

  const activeYMax = isScaleMode ? scaleYMax : isThalesAbsMode ? absYMax : Y_MAX;

  const yToPx = useCallback(
    (yVal: number): number => {
      const ratio = (yVal - Y_MIN) / (activeYMax - Y_MIN);
      return PLOT.top + PLOT_H - ratio * PLOT_H;
    },
    [activeYMax]
  );

  // Build SVG path string for a given circle key (including constant normalized Ko)
  const buildCurvePath = useCallback(
    (key: CircleKey | 'Ko'): string => {
      if (curveSamples.length === 0) return '';
      return curveSamples
        .map((pt, idx) => {
          const px = xToPx(pt.t);
          const py = yToPx(pt[key]);
          return `${idx === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
        })
        .join(' ');
    },
    [curveSamples, xToPx, yToPx]
  );

  const buildThalesAbsPath = useCallback(
    (key: 'Ro' | 'Do' | 'Ko' | 'Lo'): string => {
      if (thalesAbsSamples.length === 0) return '';
      return thalesAbsSamples
        .map((pt, idx) => {
          const px = xToPx(pt.t);
          const py = yToPx(pt[key]);
          return `${idx === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
        })
        .join(' ');
    },
    [thalesAbsSamples, xToPx, yToPx]
  );

  const buildScalePath = useCallback(
    (key: 'Ko' | 'Lo' | 'Do' | 'Ro' | 'Ki'): string => {
      if (scaleSamples.length === 0) return '';
      return scaleSamples
        .map((pt, idx) => {
          const px = xToPx(pt.lambda);
          const py = yToPx(pt[key]);
          return `${idx === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
        })
        .join(' ');
    },
    [scaleSamples, xToPx, yToPx]
  );

  // Pointer scrubbing handlers directly on the SVG graph
  const updatePointerEvent = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, recordHistory: boolean) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0) return;
      const svgX = ((e.clientX - rect.left) / rect.width) * PLOT.width;
      const nextVal = pxToVal(svgX);
      if (isScaleMode) {
        onChangeLambda?.(nextVal, recordHistory);
      } else {
        onChangeT(nextVal, recordHistory);
      }
    },
    [pxToVal, isScaleMode, onChangeLambda, onChangeT]
  );

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsSweepingSymmetry(false);
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePointerEvent(e, false);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    updatePointerEvent(e, false);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
    updatePointerEvent(e, true);
  };

  // Zoom & Reset helpers
  const handleZoomIn = () => {
    const centerT = currentT >= tMin && currentT <= tMax ? currentT : Math.sqrt(tMin * tMax);
    if (scaleMode === 'log') {
      const lCenter = Math.log10(centerT);
      const halfSpan = Math.max(0.15, (Math.log10(tMax) - Math.log10(tMin)) * 0.35);
      setTMin(Math.max(0.02, Math.pow(10, lCenter - halfSpan)));
      setTMax(Math.min(50, Math.pow(10, lCenter + halfSpan)));
    } else {
      const span = Math.max(0.4, (tMax - tMin) * 0.65);
      const nextMin = Math.max(0.02, centerT - span / 2);
      const nextMax = Math.min(50, nextMin + span);
      setTMin(nextMin);
      setTMax(nextMax);
    }
  };

  const handleZoomOut = () => {
    const centerT = currentT >= tMin && currentT <= tMax ? currentT : Math.sqrt(tMin * tMax);
    if (scaleMode === 'log') {
      const lCenter = Math.log10(centerT);
      const halfSpan = Math.min(1.6, (Math.log10(tMax) - Math.log10(tMin)) * 0.72);
      setTMin(Math.max(0.02, Math.pow(10, lCenter - halfSpan)));
      setTMax(Math.min(50, Math.pow(10, lCenter + halfSpan)));
    } else {
      const span = Math.min(40, (tMax - tMin) * 1.45);
      const nextMin = Math.max(0.02, centerT - span / 2);
      const nextMax = Math.min(50, nextMin + span);
      setTMin(nextMin);
      setTMax(nextMax);
    }
  };

  const handleResetRange = () => {
    setTMin(0.1);
    setTMax(10);
  };

  const handleFitCurrentT = () => {
    setTMin(Math.min(0.1, currentT * 0.7));
    setTMax(Math.max(10, currentT * 1.4));
  };

  // X-axis tick values
  const xTicks = useMemo(() => {
    if (isScaleMode) {
      return [0.2, 0.5, 1.0, 1.5, 2.0, 2.5];
    }
    if (scaleMode === 'log') {
      const standardLog = [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];
      const inside = standardLog.filter((v) => v >= tMin * 0.999 && v <= tMax * 1.001);
      if (inside.length >= 3) return inside;
      const out: number[] = [];
      const lMin = Math.log10(tMin);
      const lMax = Math.log10(tMax);
      for (let i = 0; i <= 4; i++) {
        out.push(Math.pow(10, lMin + (i / 4) * (lMax - lMin)));
      }
      return out;
    }
    const count = 5;
    const out: number[] = [];
    for (let i = 0; i <= count; i++) {
      out.push(tMin + (i / count) * (tMax - tMin));
    }
    return out;
  }, [isScaleMode, scaleMode, tMin, tMax]);

  const yTicks = useMemo(() => {
    if (!isThalesAbsMode && !isScaleMode) return [0, 0.25, 0.5, 0.75, 1.0];
    const targetMax = isScaleMode ? scaleYMax : absYMax;
    const step = targetMax / 4;
    return [0, step, step * 2, step * 3, targetMax];
  }, [isThalesAbsMode, isScaleMode, absYMax, scaleYMax]);

  const isSymmetryInRange = !isScaleMode && tMin <= 1 && 1 <= tMax;
  const symmetryX = isSymmetryInRange ? xToPx(1) : null;
  const isCurrentTInRange = isScaleMode
    ? currentLambda >= 0.19 && currentLambda <= 2.55
    : currentT >= tMin * 0.999 && currentT <= tMax * 1.001;
  const cursorX = isScaleMode
    ? xToPx(Math.max(0.2, Math.min(2.5, currentLambda)))
    : xToPx(Math.max(tMin, Math.min(tMax, currentT)));

  // Active mode labels & formulas
  const modeSymbolPrefix =
    graphMode === 'areas'
      ? 'K'
      : graphMode === 'perimeters'
      ? 'P'
      : linearKind === 'radius'
      ? 'R'
      : 'D';

  const koNormLabel =
    graphMode === 'areas'
      ? 'K_o/K_c'
      : graphMode === 'perimeters'
      ? 'L_o/L_c'
      : linearKind === 'radius'
      ? 'R_o/c'
      : 'D_o/c';

  const normalizedSectionTitle =
    graphMode === 'areas'
      ? t.spectral.formulaSecBNormalizedAreas
      : graphMode === 'perimeters'
      ? t.spectral.formulaSecBNormalizedPerimeters
      : linearKind === 'radius'
      ? t.spectral.formulaSecBNormalizedRadii
      : t.spectral.formulaSecBNormalizedDiameters;

  const ratioSectionTitle =
    graphMode === 'areas'
      ? t.spectral.formulaSecCRatioAreas
      : graphMode === 'perimeters'
      ? t.spectral.formulaSecCRatioPerimeters
      : linearKind === 'radius'
      ? t.spectral.formulaSecCRatioRadii
      : t.spectral.formulaSecCRatioDiameters;

  const paramGeomTex =
    't = \\frac{b}{a}, \\quad a_{\\text{norm}} = 1, \\quad b_{\\text{norm}} = t, \\quad c_{\\text{norm}}(t) = \\sqrt{1 + t^2}';

  const normalizedCirclesTex =
    graphMode === 'areas'
      ? 'K_a^* = \\frac{\\pi}{4}, \\quad K_b^* = \\frac{\\pi t^2}{4}, \\quad K_c^*(t) = K_o^*(t) = \\frac{\\pi(1+t^2)}{4}'
      : graphMode === 'perimeters'
      ? 'P_a^* = \\pi, \\quad P_b^* = \\pi t, \\quad P_c^*(t) = L_o^*(t) = \\pi\\sqrt{1+t^2}'
      : linearKind === 'radius'
      ? 'R_a^* = \\frac{1}{2}, \\quad R_b^* = \\frac{t}{2}, \\quad R_c^*(t) = R_o^*(t) = \\frac{\\sqrt{1+t^2}}{2}'
      : 'D_a^* = 1, \\quad D_b^* = t, \\quad D_c^*(t) = D_o^*(t) = \\sqrt{1+t^2}';

  const normalizedIncircleTex =
    graphMode === 'areas'
      ? 'r^*(t) = \\frac{1 + t - \\sqrt{1+t^2}}{2}, \\qquad K_i^*(t) = \\pi\\left(r^*(t)\\right)^2'
      : graphMode === 'perimeters'
      ? 'r^*(t) = \\frac{1 + t - \\sqrt{1+t^2}}{2}, \\qquad P_i^*(t) = 2\\pi\\,r^*(t) = \\pi\\left(1 + t - \\sqrt{1+t^2}\\right)'
      : linearKind === 'radius'
      ? 'r^*(t) = \\frac{1 + t - \\sqrt{1+t^2}}{2}, \\qquad R_i^*(t) = r^*(t)'
      : 'r^*(t) = \\frac{1 + t - \\sqrt{1+t^2}}{2}, \\qquad D_i^*(t) = 2r^*(t) = 1 + t - \\sqrt{1+t^2}';

  const graphRatiosTex =
    graphMode === 'areas'
      ? '\\frac{K_a}{K_c} = \\frac{1}{1+t^2}, \\quad \\frac{K_b}{K_c} = \\frac{t^2}{1+t^2}, \\quad \\frac{K_c}{K_c} = \\frac{K_o}{K_c} = 1, \\quad \\frac{K_i}{K_c} = \\frac{\\left(1 + t - \\sqrt{1+t^2}\\right)^2}{1+t^2}'
      : graphMode === 'perimeters'
      ? '\\frac{P_a}{P_c} = \\frac{1}{\\sqrt{1+t^2}}, \\quad \\frac{P_b}{P_c} = \\frac{t}{\\sqrt{1+t^2}}, \\quad \\frac{P_c}{P_c} = \\frac{L_o}{L_c} = 1, \\quad \\frac{P_i}{P_c} = \\frac{1 + t - \\sqrt{1+t^2}}{\\sqrt{1+t^2}}'
      : linearKind === 'radius'
      ? '\\frac{R_a}{R_c} = \\frac{1}{\\sqrt{1+t^2}}, \\quad \\frac{R_b}{R_c} = \\frac{t}{\\sqrt{1+t^2}}, \\quad \\frac{R_c}{R_c} = 1, \\quad \\frac{R_o}{c} = \\frac{1}{2}, \\quad \\frac{R_i}{R_c} = \\frac{1 + t - \\sqrt{1+t^2}}{\\sqrt{1+t^2}}'
      : '\\frac{D_a}{D_c} = \\frac{1}{\\sqrt{1+t^2}}, \\quad \\frac{D_b}{D_c} = \\frac{t}{\\sqrt{1+t^2}}, \\quad \\frac{D_c}{D_c} = \\frac{D_o}{c} = 1, \\quad \\frac{D_i}{D_c} = \\frac{1 + t - \\sqrt{1+t^2}}{\\sqrt{1+t^2}}';

  const THALES_ABS_META = [
    { key: 'Ro' as const, label: 'R_o*(t)', color: '#7c3aed' },
    { key: 'Do' as const, label: 'D_o*(t)', color: '#4f46e5' },
    { key: 'Lo' as const, label: 'L_o*(t)', color: '#059669' },
    { key: 'Ko' as const, label: 'K_o*(t)', color: '#e11d48' },
  ];

  const SCALE_CURVES_META = [
    { key: 'Ko' as const, label: 'K_o(λ) ~ λ²', color: '#7c3aed', isQuadratic: true },
    { key: 'Ki' as const, label: 'K_i(λ) ~ λ²', color: '#d97706', isQuadratic: true },
    { key: 'Lo' as const, label: 'L_o(λ) ~ λ', color: '#059669', isQuadratic: false },
    { key: 'Do' as const, label: 'D_o(λ) ~ λ', color: '#4f46e5', isQuadratic: false },
    { key: 'Ro' as const, label: 'R_o(λ) ~ λ', color: '#2563eb', isQuadratic: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-4">
      {/* Header (zero-pill clean scientific header) */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {isScaleMode ? t.spectral.scaleTitle : t.spectral.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isScaleMode ? (
              <>
                Масштаб <span className="font-mono font-semibold text-slate-700">λ = c / 5.0</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                {t.spectral.scaleDeg1} vs {t.spectral.scaleDeg2}
              </>
            ) : (
              <>
                {t.spectral.subtitleBefore} <span className="font-mono font-semibold text-slate-700">t = b / a</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                {t.spectral.subtitleAfter} <span className="font-mono">K_c</span>
              </>
            )}
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-600">
          {isScaleMode ? (
            <>λ = <span className="font-bold text-slate-900">{currentLambda.toFixed(4)}</span></>
          ) : (
            <>t = <span className="font-bold text-slate-900">{currentT.toFixed(4)}</span></>
          )}
        </div>
      </div>

      {/* Mode Selector Tabs: Areas | Perimeters | Radii & Diameters | Abs. Growth K_o(t) | Scale λ */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setGraphMode('areas')}
          className={`flex-1 px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
            graphMode === 'areas'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-blue-600" /> {t.spectral.tabAreas}
        </button>
        <button
          onClick={() => setGraphMode('perimeters')}
          className={`flex-1 px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
            graphMode === 'perimeters'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-600" /> {t.spectral.tabPerimeters}
        </button>
        <button
          onClick={() => setGraphMode('radii_diameters')}
          className={`flex-1 px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
            graphMode === 'radii_diameters'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" /> {t.spectral.tabRadiiDiameters}
        </button>
        <button
          onClick={() => setGraphMode('thales_abs')}
          className={`flex-1 px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
            graphMode === 'thales_abs'
              ? 'bg-white text-violet-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-violet-600" /> {t.spectral.tabThalesAbs}
        </button>
        <button
          onClick={() => setGraphMode('scale_lambda')}
          className={`flex-1 px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
            graphMode === 'scale_lambda'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" /> {t.spectral.tabScaleLambda}
        </button>
      </div>

      {/* Mode C Sub-Switch (Radius vs Diameter) + Proportional Note */}
      {graphMode === 'radii_diameters' && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
          <span className="text-slate-600">
            {t.spectral.linearNoteBefore} <span className="font-mono">D = 2R</span> — {t.spectral.linearNoteMiddle}{' '}
            <span className="font-mono">R_x/R_c</span> {t.spectral.linearNoteAnd} <span className="font-mono">D_x/D_c</span> {t.spectral.linearNoteAfter}
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-md text-[11px] font-semibold">
            <button
              onClick={() => setLinearKind('radius')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                linearKind === 'radius'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.spectral.radiiBtn}
            </button>
            <button
              onClick={() => setLinearKind('diameter')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                linearKind === 'diameter'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.spectral.diametersBtn}
            </button>
          </div>
        </div>
      )}

      {/* Absolute Growth Banner when in thales_abs mode */}
      {isThalesAbsMode && (
        <div className="px-3 py-2 rounded-lg bg-violet-50/60 border border-violet-200/70 text-xs space-y-1">
          <div className="font-bold text-slate-900">{t.spectral.thalesAbsTitle}</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{t.spectral.thalesAbsDesc}</p>
        </div>
      )}

      {/* Dynamic Scale Banner when in scale_lambda mode */}
      {isScaleMode && (
        <div className="px-3 py-2 rounded-lg bg-indigo-50/60 border border-indigo-200/70 text-xs space-y-1">
          <div className="font-bold text-indigo-950">{t.spectral.scaleTitle}</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{t.spectral.scaleSubtitle}</p>
        </div>
      )}

      {/* ================================================================== */}
      {/* PRIMARY VISUALIZATION: INTERACTIVE CARTESIAN FUNCTION PLOT          */}
      {/* ================================================================== */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2.5">
        {/* Plot Header: Title & Curve Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800">
            {isScaleMode ? (
              <>
                Графики функций от масштаба <span className="font-mono">λ = c / 5</span>
              </>
            ) : (
              <>
                {t.spectral.plotTitle} <span className="font-mono">t = b/a</span>
              </>
            )}
          </div>

          {isScaleMode ? (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-semibold">
              {SCALE_CURVES_META.map((m) => (
                <span key={m.key} className="inline-flex items-center gap-1.5" style={{ color: m.color }}>
                  <span
                    className="inline-block w-3 h-0.5 rounded-full"
                    style={{
                      backgroundColor: m.color,
                      borderBottom: m.isQuadratic ? undefined : '1px dashed currentColor',
                    }}
                  />
                  {m.label}
                </span>
              ))}
            </div>
          ) : isThalesAbsMode ? (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-semibold">
              {THALES_ABS_META.map((m) => (
                <span key={m.key} className="inline-flex items-center gap-1.5" style={{ color: m.color }}>
                  <span className="inline-block w-3 h-0.5 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-semibold">
              {SERIES_ORDER.map((key) => {
                const meta = CIRCLE_SERIES_META[key];
                return (
                  <span key={key} className="inline-flex items-center gap-1.5" style={{ color: meta.color }}>
                    <span
                      className="inline-block w-3 h-0.5 rounded-full"
                      style={{
                        backgroundColor: meta.color,
                        borderBottom: key === 'Kc' ? '1px dashed #e11d48' : undefined,
                      }}
                    />
                    {modeSymbolPrefix}_{key.replace('K', '')}/{modeSymbolPrefix}_c
                  </span>
                );
              })}
              <button
                onClick={() => setShowKoOverlay(!showKoOverlay)}
                className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                  showKoOverlay
                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                    : 'text-slate-400 border border-slate-200 hover:text-slate-600'
                }`}
                title={t.spectral.koOverlayToggle}
              >
                <span
                  className="inline-block w-3 h-0.5"
                  style={{ borderBottom: `2px dashed ${THALES_SERIES_META.color}` }}
                />
                {koNormLabel}
              </button>
            </div>
          )}
        </div>

        {/* Structured Formula Panel */}
        {isScaleMode ? (
          <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-200/80 space-y-2 text-left">
            <div className="text-[11px] font-semibold text-indigo-950">
              {t.spectral.scaleFormulaTitle}
            </div>
            <div className="overflow-x-auto space-y-1.5 py-0.5 text-center">
              <div>
                <div className="text-[10px] text-slate-500 mb-0.5">{t.spectral.scaleLawLinear}</div>
                <MathFormula
                  tex="D_o(\lambda) = \lambda c_0,\quad R_o(\lambda) = \frac{\lambda c_0}{2},\quad L_o(\lambda) = \pi \lambda c_0 \quad (\sim \lambda^1)"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div className="pt-1 border-t border-indigo-100">
                <div className="text-[10px] text-slate-500 mb-0.5">{t.spectral.scaleLawQuadratic}</div>
                <MathFormula
                  tex="K_o(\lambda) = \lambda^2 \frac{\pi c_0^2}{4} = \lambda^2 K_o(1),\quad K_c(\lambda) = K_o(\lambda),\quad K_i(\lambda) = \lambda^2 K_i(1) \quad (\sim \lambda^2)"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 leading-snug">
              c_0 = 5.0 (базовый эталон). Линейные метрики (D, R, L, r) масштабируются как λ, площади (K, S) — как λ². Тождество √(K_a) + √(K_b) = √(K_c) + √(K_i) инвариантно для любого λ &gt; 0.
            </div>
          </div>
        ) : isThalesAbsMode ? (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-left">
            <div className="text-[11px] font-semibold text-slate-700">
              {t.spectral.thalesAbsFormulaTitle}
            </div>
            <div className="overflow-x-auto space-y-1 py-0.5 text-center">
              <div>
                <MathFormula
                  tex="R_o^*(t)=\frac{\sqrt{1+t^2}}{2},\quad D_o^*(t)=\sqrt{1+t^2},\quad K_o^*(t)=\frac{\pi(1+t^2)}{4},\quad L_o^*(t)=\pi\sqrt{1+t^2}"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <MathFormula
                  tex="\frac{R_o}{c}=\frac{1}{2},\quad \frac{D_o}{c}=1,\quad \frac{K_o}{K_c}=1,\quad \frac{L_o}{L_c}=1"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 leading-snug">
              {t.spectral.formulaAsteriskNote}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-left">
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mb-1">
                {t.spectral.formulaSecA}
              </div>
              <div className="overflow-x-auto py-0.5 text-center">
                <MathFormula tex={paramGeomTex} className="text-xs sm:text-sm" />
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                {t.spectral.formulaAsteriskNote}
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200/70">
              <div className="text-[11px] font-semibold text-slate-600 mb-1">
                {normalizedSectionTitle}
              </div>
              <div className="overflow-x-auto space-y-1 py-0.5 text-center">
                <div>
                  <MathFormula tex={normalizedCirclesTex} className="text-xs sm:text-sm" />
                </div>
                <div>
                  <MathFormula tex={normalizedIncircleTex} className="text-xs sm:text-sm" />
                </div>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200/70">
              <div className="text-[11px] font-semibold text-slate-800 mb-1">
                {ratioSectionTitle}
              </div>
              <div className="overflow-x-auto py-0.5 text-center">
                <MathFormula tex={graphRatiosTex} className="text-xs sm:text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Graph Controls Bar: Scale, Zoom, Symmetry Sweep */}
        {isScaleMode ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">
                {t.controls.scaleTitle}: <span className="font-mono text-indigo-950 font-bold">λ = {currentLambda.toFixed(2)}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[10px]">
                c = {(currentLambda * 5).toFixed(2)}, c² = {(25 * currentLambda * currentLambda).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[0.5, 1.0, 1.5, 2.0].map((sVal) => (
                <button
                  key={sVal}
                  onClick={() => onChangeLambda?.(sVal, true)}
                  className={`px-2 py-1 rounded font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(currentLambda - sVal) < 0.05
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {sVal === 1.0 ? 'λ = 1.0' : `λ = ${sVal}x`}
                </button>
              ))}
              <button
                onClick={() => onChangeLambda?.(1.0, true)}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono flex items-center gap-1 whitespace-nowrap shrink-0"
                title={t.controls.scaleReset}
              >
                <RotateCcw className="w-3 h-3" /> {t.controls.scaleReset}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              {/* Axis scale mode */}
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-md font-semibold">
                <button
                  onClick={() => setScaleMode('log')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                    scaleMode === 'log' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                  title={t.spectral.logScaleTitle}
                >
                  {t.spectral.logScaleBtn}
                </button>
                <button
                  onClick={() => setScaleMode('linear')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                    scaleMode === 'linear' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                  title={t.spectral.linearScaleTitle}
                >
                  {t.spectral.linearScaleBtn}
                </button>
              </div>

              {/* Zoom & Reset buttons */}
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                title={t.spectral.zoomInTitle}
                aria-label={t.spectral.zoomInTitle}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                title={t.spectral.zoomOutTitle}
                aria-label={t.spectral.zoomOutTitle}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetRange}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono flex items-center gap-1 whitespace-nowrap shrink-0"
                title={t.spectral.resetRangeTitle}
              >
                <RotateCcw className="w-3 h-3" /> [0.1, 10]
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setIsSweepingSymmetry(false);
                  setAtSymmetryNotice(false);
                  onChangeT(1.0, true);
                }}
                className={`px-2.5 py-1 rounded font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  Math.abs(currentT - 1) < 1e-3
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
                title={t.spectral.symmetryBtnTitle}
              >
                {t.spectral.symmetryBtn}
              </button>
              <button
                onClick={handleToggleSymmetrySweep}
                className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  isSweepingSymmetry
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSweepingSymmetry ? (
                  <>
                    <Pause className="w-3 h-3" /> {t.spectral.pauseBtn}
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> {t.spectral.sweepBtn}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Notice if user clicks Play Through Symmetry while already on symmetry axis t = 1 */}
        {!isScaleMode && atSymmetryNotice && (
          <div className="px-2.5 py-1.5 rounded bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-800">
            {t.spectral.atSymmetryNotice}
          </div>
        )}

        {/* Out-of-range alert when user zoomed away from currentT */}
        {!isScaleMode && !isCurrentTInRange && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
            <span>
              {t.spectral.outOfRangeBefore} <span className="font-mono font-bold">t = {currentT.toFixed(3)}</span>{' '}
              {t.spectral.outOfRangeMiddle} [{formatTLabel(tMin)}, {formatTLabel(tMax)}].
            </span>
            <button
              onClick={handleFitCurrentT}
              className="font-semibold underline hover:text-amber-700 whitespace-nowrap"
            >
              {t.spectral.fitRangeBtn}
            </button>
          </div>
        )}

        {/* Cartesian SVG Plot */}
        <div className="relative select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
            className="w-full h-auto block cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            role="img"
            aria-label={t.spectral.svgAriaLabel}
          >
            {/* Plot Area Background */}
            <rect
              x={PLOT.left}
              y={PLOT.top}
              width={PLOT_W}
              height={PLOT_H}
              fill="#fcfdff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Horizontal Gridlines & Y-Axis Ticks */}
            {yTicks.map((yVal) => {
              const py = yToPx(yVal);
              return (
                <g key={`y-${yVal}`}>
                  <line
                    x1={PLOT.left}
                    y1={py}
                    x2={PLOT.left + PLOT_W}
                    y2={py}
                    stroke={yVal === 0 ? '#94a3b8' : '#e2e8f0'}
                    strokeWidth={yVal === 0 ? '1.2' : '0.8'}
                  />
                  <text
                    x={PLOT.left - 8}
                    y={py + 3.5}
                    textAnchor="end"
                    fontSize="10.5"
                    fill="#64748b"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  >
                    {isThalesAbsMode ? (yVal >= 10 ? yVal.toFixed(1) : yVal.toFixed(2)) : yVal.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Vertical Gridlines & X-Axis Ticks */}
            {xTicks.map((tTick) => {
              const px = xToPx(tTick);
              const nearSymmetry = symmetryX !== null && Math.abs(px - symmetryX) < 22 && Math.abs(tTick - 1) > 1e-3;
              return (
                <g key={`x-${tTick}`}>
                  <line
                    x1={px}
                    y1={PLOT.top}
                    x2={px}
                    y2={PLOT.top + PLOT_H}
                    stroke="#e2e8f0"
                    strokeWidth="0.8"
                  />
                  {!nearSymmetry && Math.abs(tTick - 1) > 1e-3 && (
                    <text
                      x={px}
                      y={PLOT.top + PLOT_H + 15}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill="#64748b"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    >
                      {formatTLabel(tTick)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axis Titles */}
            <text
              x={PLOT.left + PLOT_W / 2}
              y={PLOT.height - 5}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#475569"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              {isScaleMode
                ? 'λ = c / 5.0 (Коэффициент масштабирования треугольника)'
                : `t = b / a ${scaleMode === 'log' ? t.spectral.axisLogLabel : t.spectral.axisLinearLabel}`}
            </text>
            <text
              x={14}
              y={PLOT.top + PLOT_H / 2}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#475569"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              transform={`rotate(-90 14 ${PLOT.top + PLOT_H / 2})`}
            >
              {isScaleMode
                ? 'K_o, K_i (площади) / L_o, D_o, R_o (длины)'
                : isThalesAbsMode
                ? 'R_o*, D_o*, L_o*, K_o*'
                : `${modeSymbolPrefix}_x / ${modeSymbolPrefix}_c`}
            </text>

            {/* Symmetry Line t = 1 or Scale Reference Line λ = 1 */}
            {isScaleMode ? (
              <g>
                <line
                  x1={xToPx(1.0)}
                  y1={PLOT.top}
                  x2={xToPx(1.0)}
                  y2={PLOT.top + PLOT_H}
                  stroke="#6366f1"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                />
                <text
                  x={xToPx(1.0)}
                  y={PLOT.top + PLOT_H + 15}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#4338ca"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                >
                  λ = 1
                </text>
                <text
                  x={xToPx(1.0) + 4}
                  y={PLOT.top + 12}
                  textAnchor="start"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#4f46e5"
                >
                  Эталон (3-4-5)
                </text>
              </g>
            ) : symmetryX !== null && (
              <g>
                <line
                  x1={symmetryX}
                  y1={PLOT.top}
                  x2={symmetryX}
                  y2={PLOT.top + PLOT_H}
                  stroke="#64748b"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                />
                <text
                  x={symmetryX}
                  y={PLOT.top + PLOT_H + 15}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#334155"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                >
                  t = 1
                </text>
                <text
                  x={symmetryX + 4}
                  y={PLOT.top + 12}
                  textAnchor="start"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#475569"
                >
                  {t.spectral.symmetryTag}
                </text>
              </g>
            )}

            {/* Plotted Function Curves */}
            {isScaleMode ? (
              <>
                {SCALE_CURVES_META.map((m) => (
                  <path
                    key={`scale-${m.key}`}
                    d={buildScalePath(m.key)}
                    fill="none"
                    stroke={m.color}
                    strokeWidth={m.isQuadratic ? '2.5' : '2.0'}
                    strokeDasharray={m.isQuadratic ? undefined : '5 3'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </>
            ) : isThalesAbsMode ? (
              <>
                {THALES_ABS_META.map((m) => (
                  <path
                    key={`abs-${m.key}`}
                    d={buildThalesAbsPath(m.key)}
                    fill="none"
                    stroke={m.color}
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </>
            ) : (
              <>
                <path
                  d={buildCurvePath('Kc')}
                  fill="none"
                  stroke={CIRCLE_SERIES_META.Kc.color}
                  strokeWidth="1.9"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
                {showKoOverlay && (
                  <path
                    d={buildCurvePath('Ko')}
                    fill="none"
                    stroke={THALES_SERIES_META.color}
                    strokeWidth="2.1"
                    strokeDasharray="3 4"
                    strokeLinecap="round"
                  />
                )}
                <path
                  d={buildCurvePath('Ka')}
                  fill="none"
                  stroke={CIRCLE_SERIES_META.Ka.color}
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={buildCurvePath('Kb')}
                  fill="none"
                  stroke={CIRCLE_SERIES_META.Kb.color}
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={buildCurvePath('Ki')}
                  fill="none"
                  stroke={CIRCLE_SERIES_META.Ki.color}
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Interactive Vertical Cursor & Moving Markers */}
            {isCurrentTInRange && (
              <g>
                <line
                  x1={cursorX}
                  y1={PLOT.top}
                  x2={cursorX}
                  y2={PLOT.top + PLOT_H}
                  stroke="#ec4899"
                  strokeWidth="1.8"
                />
                {isScaleMode ? (
                  (() => {
                    const curDo = currentLambda * 5.0;
                    const curRo = curDo / 2;
                    const curLo = Math.PI * curDo;
                    const curKo = (Math.PI * curDo * curDo) / 4;
                    const curKi = Math.PI * currentLambda * currentLambda;
                    const vals: Record<'Ko' | 'Ki' | 'Lo' | 'Do' | 'Ro', number> = {
                      Ko: curKo,
                      Ki: curKi,
                      Lo: curLo,
                      Do: curDo,
                      Ro: curRo,
                    };
                    return SCALE_CURVES_META.map((m) => {
                      const cy = yToPx(vals[m.key]);
                      return (
                        <circle
                          key={`marker-scale-${m.key}`}
                          cx={cursorX}
                          cy={cy}
                          r="4.5"
                          fill={m.color}
                          stroke="#ffffff"
                          strokeWidth="1.75"
                        />
                      );
                    });
                  })()
                ) : isThalesAbsMode ? (
                  THALES_ABS_META.map((m) => {
                    const cy = yToPx(currentParametric.thalesAbs[m.key]);
                    return (
                      <circle
                        key={`marker-abs-${m.key}`}
                        cx={cursorX}
                        cy={cy}
                        r="4.5"
                        fill={m.color}
                        stroke="#ffffff"
                        strokeWidth="1.75"
                      />
                    );
                  })
                ) : (
                  <>
                    {SERIES_ORDER.map((key) => {
                      const cy = yToPx(currentNormalized[key]);
                      return (
                        <circle
                          key={`marker-${key}`}
                          cx={cursorX}
                          cy={cy}
                          r="4.5"
                          fill={CIRCLE_SERIES_META[key].color}
                          stroke="#ffffff"
                          strokeWidth="1.75"
                        />
                      );
                    })}
                    {showKoOverlay && (
                      <circle
                        cx={cursorX}
                        cy={yToPx(currentThalesNorm)}
                        r="4.5"
                        fill={THALES_SERIES_META.color}
                        stroke="#ffffff"
                        strokeWidth="1.75"
                      />
                    )}
                  </>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Synchronized Current Point Readout Bar (directly under graph) */}
        <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
          <span className="text-slate-700 font-semibold">
            {isScaleMode ? (
              <>
                Текущий масштаб: <span className="text-indigo-950 font-bold">λ = {currentLambda.toFixed(4)}</span> (c = {(currentLambda * 5).toFixed(3)})
              </>
            ) : (
              <>
                {t.spectral.currentPointLabel} <span className="text-slate-900">t = {currentT.toFixed(4)}</span>
              </>
            )}
          </span>
          {isScaleMode ? (
            <div className="flex flex-wrap items-center gap-3 font-bold">
              <span style={{ color: '#7c3aed' }}>K_o = {((Math.PI * 25 * currentLambda * currentLambda) / 4).toFixed(3)}</span>
              <span style={{ color: '#d97706' }}>K_i = {(Math.PI * currentLambda * currentLambda).toFixed(3)}</span>
              <span style={{ color: '#059669' }}>L_o = {(Math.PI * 5 * currentLambda).toFixed(3)}</span>
              <span style={{ color: '#4f46e5' }}>D_o = {(5 * currentLambda).toFixed(3)}</span>
              <span style={{ color: '#2563eb' }}>R_o = {(2.5 * currentLambda).toFixed(3)}</span>
              <span className="text-slate-500 font-normal">λ² = {(currentLambda * currentLambda).toFixed(3)}</span>
            </div>
          ) : isThalesAbsMode ? (
            <div className="flex flex-wrap items-center gap-3 font-bold">
              {THALES_ABS_META.map((m) => (
                <span key={`read-abs-${m.key}`} style={{ color: m.color }}>
                  {m.label} = {currentParametric.thalesAbs[m.key].toFixed(4)}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 font-bold">
              {SERIES_ORDER.map((key) => {
                const meta = CIRCLE_SERIES_META[key];
                const sub = key.replace('K', '');
                return (
                  <span key={key} style={{ color: meta.color }}>
                    {modeSymbolPrefix}_{sub}/{modeSymbolPrefix}_c = {currentNormalized[key].toFixed(4)}
                  </span>
                );
              })}
              {showKoOverlay && (
                <span style={{ color: THALES_SERIES_META.color }}>
                  {koNormLabel} = {currentThalesNorm.toFixed(4)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* REFERENCE PARAMETER VALUES (Click to Jump & Sync Geometry)         */}
      {/* ================================================================== */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-600">
          {isScaleMode ? (
            <>
              {t.spectral.referenceTitle} <span className="font-mono">λ = c / 5.0</span>:
            </>
          ) : (
            <>
              {t.spectral.referenceTitle} <span className="font-mono">t = b/a</span>:
            </>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {isScaleMode
            ? [
                { l: 0.2, desc: '0.2x', label: 'λ = 0.2' },
                { l: 0.5, desc: '0.5x', label: 'λ = 0.5' },
                { l: 1.0, desc: 'Эталон', label: 'λ = 1.0' },
                { l: 1.5, desc: '1.5x', label: 'λ = 1.5' },
                { l: 2.0, desc: '2.0x', label: 'λ = 2.0' },
              ].map((ref) => {
                const isActive = Math.abs(currentLambda - ref.l) < 0.05;
                const curDo = ref.l * 5;
                const curKo = (Math.PI * curDo * curDo) / 4;
                return (
                  <button
                    key={ref.l}
                    onClick={() => onChangeLambda?.(ref.l, true)}
                    className={`p-2 rounded-lg border text-left transition-colors font-mono tabular-nums ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{ref.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                      <div className="text-indigo-700 font-semibold">{ref.desc}</div>
                      <div>D_o: {curDo.toFixed(2)}</div>
                      <div className="text-violet-700 font-semibold">K_o: {curKo.toFixed(2)}</div>
                      <div>λ²: {(ref.l * ref.l).toFixed(2)}</div>
                    </div>
                  </button>
                );
              })
            : referenceReadouts.map((ref) => {
                const isSym = Math.abs(ref.t - 1) < 1e-6;
                const isActive = Math.abs(currentT - ref.t) / ref.t < 0.015;
                return (
                  <button
                    key={ref.t}
                    onClick={() => {
                      setIsSweepingSymmetry(false);
                      onChangeT(ref.t, true);
                    }}
                    className={`p-2 rounded-lg border text-left transition-colors font-mono tabular-nums ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">
                      t = {ref.t.toFixed(1)}
                    </div>
                    {isThalesAbsMode ? (
                      <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                        <div className="text-violet-700 font-semibold">
                          R_o*: {ref.thalesAbs.Ro.toFixed(3)}
                        </div>
                        <div>D_o*: {ref.thalesAbs.Do.toFixed(3)}</div>
                        <div className="text-rose-700 font-semibold">
                          K_o*: {ref.thalesAbs.Ko.toFixed(3)}
                        </div>
                        {isSym && <div className="font-sans text-indigo-700 font-semibold">({t.spectral.symmetryTag})</div>}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                        <div>
                          {modeSymbolPrefix}_a: {ref.norm.Ka.toFixed(3)}
                        </div>
                        <div>
                          {modeSymbolPrefix}_b: {ref.norm.Kb.toFixed(3)}
                        </div>
                        <div className="text-amber-700 font-semibold">
                          {modeSymbolPrefix}_i: {ref.norm.Ki.toFixed(3)}
                        </div>
                        {isSym && <div className="font-sans text-indigo-700 font-semibold">({t.spectral.symmetryTag})</div>}
                      </div>
                    )}
                  </button>
                );
              })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* COMPARISON TABLE: SCALE HOMOGENEITY (if isScaleMode) OR THALES K_o */}
      {/* ================================================================== */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="text-xs font-bold text-indigo-950">
          {isScaleMode ? t.thalesPanel.scaleTableTitle : t.spectral.thalesLiveReadoutTitle}
        </div>
        <div className="border border-indigo-200/80 rounded-lg overflow-x-auto">
          {isScaleMode ? (
            <table className="w-full text-xs">
              <thead className="bg-indigo-50/70 border-b border-indigo-200/70 text-slate-700 font-semibold">
                <tr>
                  <th className="py-1.5 px-2.5 text-left">{t.spectral.colCircle} / Метрика</th>
                  <th className="py-1.5 px-2.5 text-center">Степень</th>
                  <th className="py-1.5 px-2.5 text-right">Эталон (λ = 1)</th>
                  <th className="py-1.5 px-2.5 text-right">Текущее (λ = {currentLambda.toFixed(2)})</th>
                  <th className="py-1.5 px-2.5 text-right">Коэффициент роста</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                <tr className="hover:bg-indigo-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-blue-800">Диаметр D_o</td>
                  <td className="py-1.5 px-2.5 text-center text-slate-600 font-sans text-[11px]">{t.spectral.scaleDeg1} (λ)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">5.0000</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{(5 * currentLambda).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-blue-700">λ¹ = {currentLambda.toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-indigo-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-blue-800">Радиус R_o</td>
                  <td className="py-1.5 px-2.5 text-center text-slate-600 font-sans text-[11px]">{t.spectral.scaleDeg1} (λ)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">2.5000</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{(2.5 * currentLambda).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-blue-700">λ¹ = {currentLambda.toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-indigo-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-emerald-800">Длина окружности L_o</td>
                  <td className="py-1.5 px-2.5 text-center text-slate-600 font-sans text-[11px]">{t.spectral.scaleDeg1} (λ)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{(5 * Math.PI).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{(5 * Math.PI * currentLambda).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-emerald-700">λ¹ = {currentLambda.toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-indigo-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-violet-800">Площадь круга Фалеса K_o</td>
                  <td className="py-1.5 px-2.5 text-center text-slate-600 font-sans text-[11px]">{t.spectral.scaleDeg2} (λ²)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{((25 * Math.PI) / 4).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{(((25 * Math.PI) / 4) * currentLambda * currentLambda).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-violet-700">λ² = {(currentLambda * currentLambda).toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-indigo-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-amber-800">Вписанный круг K_i</td>
                  <td className="py-1.5 px-2.5 text-center text-slate-600 font-sans text-[11px]">{t.spectral.scaleDeg2} (λ²)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{(Math.PI).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{(Math.PI * currentLambda * currentLambda).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-amber-700">λ² = {(currentLambda * currentLambda).toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-indigo-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-rose-800">Квадрат гипотенузы S_c</td>
                  <td className="py-1.5 px-2.5 text-center text-slate-600 font-sans text-[11px]">{t.spectral.scaleDeg2} (λ²)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">25.0000</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{(25 * currentLambda * currentLambda).toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-rose-700">λ² = {(currentLambda * currentLambda).toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-violet-50/70 border-b border-violet-200/70 text-slate-700 font-semibold">
                <tr>
                  <th className="py-1.5 px-2.5 text-left">K_o</th>
                  <th className="py-1.5 px-2.5 text-right">{t.spectral.colDimensional}</th>
                  <th className="py-1.5 px-2.5 text-right">{t.spectral.colNormalizedUnit}</th>
                  <th className="py-1.5 px-2.5 text-right">{t.spectral.colRatioNorm}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                <tr className="hover:bg-violet-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-violet-800">{t.spectral.colRadius} (R_o)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{calc.circumcircle.radius.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{currentParametric.thalesAbs.Ro.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-violet-700">R_o/c = {currentParametric.thalesNorm.RoOverC.toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-violet-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-violet-800">{t.spectral.colDiameter} (D_o)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{calc.circumcircle.diameter.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{currentParametric.thalesAbs.Do.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-violet-700">D_o/c = {currentParametric.thalesNorm.DoOverC.toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-violet-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-violet-800">{t.spectral.colArea} (K_o)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{calc.circumcircle.area.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{currentParametric.thalesAbs.Ko.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-violet-700">K_o/K_c = {currentParametric.thalesNorm.KoOverKc.toFixed(4)}</td>
                </tr>
                <tr className="hover:bg-violet-50/30">
                  <td className="py-1.5 px-2.5 font-semibold text-violet-800">{t.spectral.colPerimeter} (L_o)</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-900">{calc.circumcircle.circumference.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-700">{currentParametric.thalesAbs.Lo.toFixed(4)}</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-violet-700">L_o/L_c = {currentParametric.thalesNorm.LoOverLc.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* SYNCHRONIZED NUMERICAL READOUT TABLE (Same State as Geometry & Plot)*/}
      {/* ================================================================== */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        {/* Geometry Parameters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center font-mono tabular-nums">
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-sans text-slate-500">t = b/a</div>
            <div className="text-xs font-bold text-slate-900">{currentT.toFixed(4)}</div>
          </div>
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-sans text-slate-500">{t.spectral.legAShort}</div>
            <div className="text-xs font-bold text-blue-700">{calc.triangle.a.toFixed(3)}</div>
          </div>
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-sans text-slate-500">{t.spectral.legBShort}</div>
            <div className="text-xs font-bold text-emerald-700">{calc.triangle.b.toFixed(3)}</div>
          </div>
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-sans text-slate-500">{t.spectral.hypCShort}</div>
            <div className="text-xs font-bold text-rose-700">{calc.triangle.c.toFixed(3)}</div>
          </div>
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200/70 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-sans text-slate-500">{t.spectral.radRShort}</div>
            <div className="text-xs font-bold text-amber-700">{calc.incircle.radius.toFixed(3)}</div>
          </div>
        </div>

        {/* Complete 5-Circle Readout Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2 px-2.5 text-left">{t.spectral.colCircle}</th>
                <th className="py-2 px-2.5 text-right">
                  {isThalesAbsMode ? t.spectral.colRatioNorm : `${modeSymbolPrefix}_x / ${modeSymbolPrefix}_c`}
                </th>
                <th className="py-2 px-2.5 text-right">{t.spectral.colArea}</th>
                <th className="py-2 px-2.5 text-right">{t.spectral.colPerimeter}</th>
                <th className="py-2 px-2.5 text-right">{t.spectral.colRadius}</th>
                <th className="py-2 px-2.5 text-right">{t.spectral.colDiameter}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {[...spectral.items, spectral.circumcircleItem].map((item) => {
                const normVal =
                  item.id === 'Ko'
                    ? currentThalesNorm
                    : graphMode === 'areas'
                    ? item.areaRatioToKc
                    : graphMode === 'perimeters'
                    ? item.perimeterRatioToKc
                    : linearKind === 'radius'
                    ? item.radiusRatioToC
                    : item.diameterRatioToC;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 ${item.id === 'Ko' ? 'bg-violet-50/35' : ''}`}
                  >
                    <td className="py-1.5 px-2.5 font-bold" style={{ color: item.color }}>
                      {item.label}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                      {item.id === 'Ko' && isThalesAbsMode
                        ? '1.0000'
                        : item.id === 'Ko' && graphMode === 'radii_diameters' && linearKind === 'radius'
                        ? `${normVal.toFixed(4)} (R_o/c)`
                        : normVal.toFixed(4)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-slate-700">
                      {item.area.toFixed(4)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-slate-700">
                      {item.perimeter.toFixed(4)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-slate-700">
                      {item.radius.toFixed(4)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-slate-700">
                      {item.diameter.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible Secondary Numerical Comparison (Proportion Bars) */}
      <div className="pt-1 border-t border-slate-100">
        <button
          onClick={() => setShowShareBars(!showShareBars)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
        >
          <span>{t.spectral.shareToggle}</span>
          {showShareBars ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showShareBars && (
          <div className="mt-2 space-y-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            {spectral.items.map((item) => {
              const normVal =
                graphMode === 'areas'
                  ? item.areaRatioToKc
                  : graphMode === 'perimeters'
                  ? item.perimeterRatioToKc
                  : linearKind === 'radius'
                  ? item.radiusRatioToC
                  : item.diameterRatioToC;
              const widthPct = Math.max(4, Math.min(100, normVal * 100));
              return (
                <div key={`bar-${item.id}`} className="space-y-1 text-[11px] font-mono tabular-nums">
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: item.color }}>
                      {item.label}
                    </span>
                    <span className="text-slate-700">
                      {modeSymbolPrefix}_x/{modeSymbolPrefix}_c = {normVal.toFixed(4)} ({t.spectral.shareLabel}{' '}
                      {(graphMode === 'areas' ? item.areaSharePercent : item.perimeterSharePercent).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
