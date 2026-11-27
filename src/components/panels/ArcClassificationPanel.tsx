/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { LanguageCode } from '../../i18n/translations.ts';
import {
  ArcDiscretizationResult,
  ArcSampleTriangle,
  DiscretizationMode,
  discretizeArcAngular,
  discretizeArcLinear,
} from '../../math/experiments/arcBasedClassification.ts';
import { MathFormula } from '../common/MathFormula.tsx';
import { Compass } from 'lucide-react';

interface ArcClassificationPanelProps {
  calc: FourCirclesCalculations;
  phiDeg: number;
  discretizationMode: DiscretizationMode;
  angularStepDeg: number;
  linearStepL: number;
  discretization: ArcDiscretizationResult;
  onChangeRadiusAndPhi: (newR: number, newPhiDeg: number, recordHistory?: boolean) => void;
  onChangeMode: (mode: DiscretizationMode) => void;
  onChangeAngularStep: (stepDeg: number) => void;
  onChangeLinearStep: (deltaL: number) => void;
  lang?: LanguageCode;
}

const ANGULAR_PRESETS = [15, 5, 1, 0.5, 0.1];
const LINEAR_PRESETS = [0.5, 0.25, 0.1, 0.05];
const PHI_PRESETS = [15, 30, 45, 60, 75];
const RADII_PRESETS = [1, 2, 3];

export const ArcClassificationPanel: React.FC<ArcClassificationPanelProps> = ({
  calc,
  phiDeg,
  discretizationMode,
  angularStepDeg,
  linearStepL,
  discretization,
  onChangeRadiusAndPhi,
  onChangeMode,
  onChangeAngularStep,
  onChangeLinearStep,
  lang = 'ru',
}) => {
  const r = calc.incircle.radius;
  const phiRad = (phiDeg * Math.PI) / 180;
  const arcPos = r * phiRad;
  const tRatio = calc.triangle.b / calc.triangle.a;

  const copy = useMemo(() => {
    if (lang === 'en') {
      return {
        title: '06. Arc-Based Classification (Experiment 02)',
        subtitle: 'Fixed orthogonal legs, rolling tangent hypotenuse, and arc discretization',
        radiusLabel: 'Incircle radius r',
        phiLabel: 'Tangency arc angle φ (0° < φ < 90°)',
        modeLabel: 'Discretization mode',
        modeAngular: 'Angular step Δφ°',
        modeLinear: 'Linear arc step ΔL',
        stepAngularLabel: 'Angular step Δφ',
        stepLinearLabel: 'Linear arc step ΔL',
        statLmax: 'Available arc L_max = πr/2',
        statLcur: 'Arc coordinate L(φ) = rφ',
        statTheta: 'Angle φ / θ=2φ (t = cot θ/2)',
        statEffStep: 'Effective angular step',
        statIntervals: 'Grid intervals',
        statOrdered: 'Non-degenerate (ordered)',
        statUnique: 'Unique shapes (no a↔b)',
        chartTitle: 'Triangle count N(r) vs. inradius r',
        chartSubAngular: 'Angular step: N is constant across r (independent of arc length)',
        chartSubLinear: 'Linear step: N grows linearly with L_max = πr/2',
        tableTitle: 'Discretized family triangles (click row to inspect)',
        tableTruncated: 'Showing first 120 of',
        colIdx: '#',
        colPhi: 'φ°',
        colL: 'L',
        colT: 't = b/a',
        colSides: 'a / b / c',
        colArea: 'S',
        colType: 'Class',
        uniqueTag: 'Unique',
        twinTag: 'a↔b twin',
      };
    }
    if (lang === 'uk') {
      return {
        title: '06. Дугова класифікація (Експеримент 02)',
        subtitle: 'Нерухомі катети, рухома дотична гіпотенуза та дискретизація дуги',
        radiusLabel: 'Радіус вписаного кола r',
        phiLabel: 'Кут дуги дотику φ (0° < φ < 90°)',
        modeLabel: 'Спосіб дискретизації дуги',
        modeAngular: 'За кутом Δφ°',
        modeLinear: 'За довжиною ΔL',
        stepAngularLabel: 'Кутовий крок Δφ',
        stepLinearLabel: 'Лінійний крок ΔL',
        statLmax: 'Доступна дуга L_max = πr/2',
        statLcur: 'Координата дуги L(φ) = rφ',
        statTheta: 'Кут φ / θ=2φ (t = cot θ/2)',
        statEffStep: 'Ефективний кутовий крок',
        statIntervals: 'Інтервалів сітки',
        statOrdered: 'Невироджені (впорядк.)',
        statUnique: 'Унікальні форми (без a↔b)',
        chartTitle: 'Залежність числа трикутників N(r) від радіуса r',
        chartSubAngular: 'Кутовий крок: N однакове при всіх r (не залежить від довжини дуги)',
        chartSubLinear: 'Лінійний крок: N зростає лінійно з довжиною L_max = πr/2',
        tableTitle: 'Таблиця дискретизації сімейства (клік по рядку фіксує трикутник)',
        tableTruncated: 'Показано перші 120 із',
        colIdx: '#',
        colPhi: 'φ°',
        colL: 'L',
        colT: 't = b/a',
        colSides: 'a / b / c',
        colArea: 'S',
        colType: 'Клас',
        uniqueTag: 'Унік.',
        twinTag: 'Двійник a↔b',
      };
    }
    return {
      title: '06. Дуговая классификация (Эксперимент 02)',
      subtitle: 'Неподвижные катеты, скользящая касательная гипотенуза и дискретизация дуги',
      radiusLabel: 'Радиус вписанной окружности r',
      phiLabel: 'Угол дуги касания φ (0° < φ < 90°)',
      modeLabel: 'Способ дискретизации дуги',
      modeAngular: 'По градусам Δφ°',
      modeLinear: 'По длине дуги ΔL',
      stepAngularLabel: 'Угловой шаг Δφ',
      stepLinearLabel: 'Линейный шаг ΔL',
      statLmax: 'Доступная дуга L_max = πr/2',
      statLcur: 'Длина дуги L(φ) = rφ',
      statTheta: 'Угол φ / θ=2φ (t = cot θ/2)',
      statEffStep: 'Эффективный угловой шаг',
      statIntervals: 'Интервалов разбиения',
      statOrdered: 'Невырожденных (упоряд.)',
      statUnique: 'Уникальных форм (без a↔b)',
      chartTitle: 'Зависимость числа треугольников N(r) от радиуса r',
      chartSubAngular: 'Фиксированный угловой шаг: N постоянно при росте r и L_max',
      chartSubLinear: 'Фиксированный линейный шаг ΔL: N растёт пропорционально L_max = πr/2',
      tableTitle: 'Дискретное семейство треугольников (клик — перейти к положению)',
      tableTruncated: 'Показаны первые 120 из',
      colIdx: '#',
      colPhi: 'φ°',
      colL: 'L',
      colT: 't = b/a',
      colSides: 'a / b / c',
      colArea: 'S',
      colType: 'Класс',
      uniqueTag: 'Уник.',
      twinTag: 'Двойник a↔b',
    };
  }, [lang]);

  // Sample N(r) across r in [0.5, 4.0] for comparison plot
  const chartData = useMemo(() => {
    const rGrid: number[] = [];
    for (let rv = 0.5; rv <= 4.0001; rv += 0.25) {
      rGrid.push(Number(rv.toFixed(2)));
    }
    const points = rGrid.map((rv) => {
      const ang = discretizeArcAngular(rv, angularStepDeg);
      const lin = discretizeArcLinear(rv, linearStepL);
      return {
        r: rv,
        nAngular: ang.interiorNonDegenerateCount,
        nLinear: lin.interiorNonDegenerateCount,
      };
    });
    const maxY = Math.max(
      10,
      ...points.map((p) => (discretizationMode === 'angular' ? p.nAngular : p.nLinear))
    );
    return { points, maxY };
  }, [angularStepDeg, linearStepL, discretizationMode]);

  const W = 440;
  const H = 155;
  const PAD = { l: 38, r: 16, t: 14, b: 26 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const xOfR = (rv: number) => PAD.l + ((rv - 0.5) / 3.5) * plotW;
  const yOfN = (n: number) => PAD.t + plotH - (n / chartData.maxY) * plotH;

  const activeLinePath = chartData.points
    .map((pt, i) => {
      const val = discretizationMode === 'angular' ? pt.nAngular : pt.nLinear;
      return `${i === 0 ? 'M' : 'L'} ${xOfR(pt.r).toFixed(1)} ${yOfN(val).toFixed(1)}`;
    })
    .join(' ');

  const visibleRows: ArcSampleTriangle[] = discretization.samples.slice(0, 120);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{copy.title}</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{copy.subtitle}</p>
      </div>

      {/* Exact Formula Strip */}
      <div className="bg-slate-50 rounded-lg border border-slate-200/80 px-3 py-2 text-center overflow-x-auto">
        <MathFormula tex="L_{\max} = \frac{\pi r}{2}, \quad L(\varphi) = r\varphi, \quad \frac{b}{a} = \cot\varphi = \cot\frac{\theta}{2} \;\;(\theta = 2\varphi)" />
      </div>

      {/* Primary Interactive Controls: r, phi, Discretization Mode & Step */}
      <div className="space-y-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
        {/* 1. Inradius r */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="arc-radius-slider" className="font-semibold text-slate-700">
              {copy.radiusLabel}: <span className="font-mono tabular-nums text-amber-800">{r.toFixed(2)}</span>
            </label>
            <div className="flex items-center gap-1">
              {RADII_PRESETS.map((rv) => (
                <button
                  key={rv}
                  onClick={() => onChangeRadiusAndPhi(rv, phiDeg, true)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(r - rv) < 0.02
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  r={rv}
                </button>
              ))}
            </div>
          </div>
          <input
            id="arc-radius-slider"
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={Math.min(4, Math.max(0.5, r))}
            onChange={(e) => onChangeRadiusAndPhi(parseFloat(e.target.value) || 1, phiDeg, false)}
            onPointerUp={() => onChangeRadiusAndPhi(r, phiDeg, true)}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        {/* 2. Tangency position angle phi */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor="arc-phi-slider" className="font-semibold text-slate-700">
              {copy.phiLabel}: <span className="font-mono tabular-nums text-slate-900">{phiDeg.toFixed(1)}°</span>
            </label>
            <div className="flex items-center gap-1">
              {PHI_PRESETS.map((pv) => (
                <button
                  key={pv}
                  onClick={() => onChangeRadiusAndPhi(r, pv, true)}
                  className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(phiDeg - pv) < 0.25
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pv}°
                </button>
              ))}
            </div>
          </div>
          <input
            id="arc-phi-slider"
            type="range"
            min="2"
            max="88"
            step="0.5"
            value={Math.min(88, Math.max(2, phiDeg))}
            onChange={(e) => onChangeRadiusAndPhi(r, parseFloat(e.target.value) || 45, false)}
            onPointerUp={() => onChangeRadiusAndPhi(r, phiDeg, true)}
            className="w-full accent-slate-800 cursor-pointer"
          />
        </div>

        {/* 3. Discretization Mode Segmented Switch */}
        <div className="pt-2 border-t border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">{copy.modeLabel}</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
              <button
                onClick={() => onChangeMode('angular')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  discretizationMode === 'angular'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.modeAngular}
              </button>
              <button
                onClick={() => onChangeMode('linear')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  discretizationMode === 'linear'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.modeLinear}
              </button>
            </div>
          </div>

          {/* Step selector */}
          {discretizationMode === 'angular' ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <label htmlFor="arc-step-ang" className="text-slate-600">
                  {copy.stepAngularLabel}:{' '}
                  <span className="font-mono font-semibold text-slate-900">{angularStepDeg}°</span>
                </label>
                <div className="flex items-center gap-1">
                  {ANGULAR_PRESETS.map((step) => (
                    <button
                      key={step}
                      onClick={() => onChangeAngularStep(step)}
                      className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                        Math.abs(angularStepDeg - step) < 1e-6
                          ? 'bg-sky-700 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {step}°
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="arc-step-ang"
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={angularStepDeg}
                onChange={(e) => onChangeAngularStep(parseFloat(e.target.value) || 1)}
                className="w-full accent-sky-700 cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <label htmlFor="arc-step-lin" className="text-slate-600">
                  {copy.stepLinearLabel}:{' '}
                  <span className="font-mono font-semibold text-slate-900">{linearStepL}</span>
                </label>
                <div className="flex items-center gap-1">
                  {LINEAR_PRESETS.map((step) => (
                    <button
                      key={step}
                      onClick={() => onChangeLinearStep(step)}
                      className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                        Math.abs(linearStepL - step) < 1e-6
                          ? 'bg-sky-700 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="arc-step-lin"
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={linearStepL}
                onChange={(e) => onChangeLinearStep(parseFloat(e.target.value) || 0.1)}
                className="w-full accent-sky-700 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Live Numeric Readout Grid (Hairline borders, tabular numerals) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.statLmax}</div>
          <div className="font-mono tabular-nums font-bold text-slate-900 text-sm mt-0.5">
            {discretization.arcLengthMax.toFixed(6)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.statLcur}</div>
          <div className="font-mono tabular-nums font-bold text-amber-800 text-sm mt-0.5">
            {arcPos.toFixed(6)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.statTheta}</div>
          <div className="font-mono tabular-nums font-semibold text-slate-900 mt-0.5">
            {phiDeg.toFixed(2)}° / {(2 * phiDeg).toFixed(2)}°{' '}
            <span className="text-slate-500 font-normal">(t={tRatio.toFixed(3)})</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.statEffStep}</div>
          <div className="font-mono tabular-nums font-semibold text-slate-900 mt-0.5">
            {discretization.effectiveAngularStepDeg.toFixed(4)}°
          </div>
        </div>
      </div>

      {/* Separate Counts Summary: Intervals vs Ordered Non-Degenerate vs Unique Shapes */}
      <div className="grid grid-cols-3 gap-2 text-xs border border-slate-200/80 rounded-lg p-2.5 bg-slate-50/50">
        <div>
          <div className="text-[11px] text-slate-500">{copy.statIntervals}</div>
          <div className="font-mono tabular-nums font-semibold text-slate-800 text-base">
            {discretization.intervalCount}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">{copy.statOrdered}</div>
          <div className="font-mono tabular-nums font-bold text-sky-800 text-base">
            {discretization.interiorNonDegenerateCount}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">{copy.statUnique}</div>
          <div className="font-mono tabular-nums font-bold text-emerald-800 text-base">
            {discretization.uniqueCongruenceCount}
          </div>
        </div>
      </div>

      {/* Dependence Graph N(r) */}
      <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-1.5">
        <div className="text-xs font-bold text-slate-800">{copy.chartTitle}</div>
        <div className="text-[11px] text-slate-500">
          {discretizationMode === 'angular' ? copy.chartSubAngular : copy.chartSubLinear}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth="1" />
          <line
            x1={PAD.l}
            y1={H - PAD.b}
            x2={W - PAD.r}
            y2={H - PAD.b}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Horizontal grid & Y labels */}
          {[0, 0.5, 1].map((frac) => {
            const val = Math.round(chartData.maxY * frac);
            const y = yOfN(val);
            return (
              <g key={frac}>
                <line
                  x1={PAD.l}
                  y1={y}
                  x2={W - PAD.r}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={PAD.l - 5}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-slate-500"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Reference r = 1, 2, 3 ticks */}
          {[1, 2, 3].map((rv) => (
            <g key={rv}>
              <line
                x1={xOfR(rv)}
                y1={PAD.t}
                x2={xOfR(rv)}
                y2={H - PAD.b}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={xOfR(rv)}
                y={H - 8}
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-600"
              >
                r={rv}
              </text>
            </g>
          ))}

          {/* Active N(r) curve */}
          <path d={activeLinePath} fill="none" stroke="#0284c7" strokeWidth="2.2" />

          {/* Points at r = 1, 2, 3 */}
          {[1, 2, 3].map((rv) => {
            const pt = chartData.points.find((p) => p.r === rv);
            if (!pt) return null;
            const nVal = discretizationMode === 'angular' ? pt.nAngular : pt.nLinear;
            return (
              <g key={`pt-${rv}`}>
                <circle cx={xOfR(rv)} cy={yOfN(nVal)} r="3.5" fill="#0284c7" stroke="#fff" strokeWidth="1.2" />
                <text
                  x={xOfR(rv)}
                  y={Math.max(PAD.t + 9, yOfN(nVal) - 6)}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-semibold fill-sky-900"
                >
                  {nVal}
                </text>
              </g>
            );
          })}

          {/* Current live r marker */}
          <circle
            cx={xOfR(Math.min(4, Math.max(0.5, r)))}
            cy={yOfN(discretization.interiorNonDegenerateCount)}
            r="4.5"
            fill="#d97706"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Interactive Discretized Family Table */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">{copy.tableTitle}</span>
          {discretization.samples.length > 120 && (
            <span className="text-[11px] font-mono text-slate-500">
              {copy.tableTruncated} {discretization.samples.length}
            </span>
          )}
        </div>
        <div className="max-h-60 overflow-y-auto border border-slate-200/80 rounded-lg bg-white">
          <table className="w-full text-[11px] font-mono tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
              <tr>
                <th className="py-1.5 px-2 text-left">{copy.colIdx}</th>
                <th className="py-1.5 px-2 text-right">{copy.colPhi}</th>
                <th className="py-1.5 px-2 text-right">{copy.colL}</th>
                <th className="py-1.5 px-2 text-right">{copy.colT}</th>
                <th className="py-1.5 px-2 text-right">{copy.colSides}</th>
                <th className="py-1.5 px-2 text-right">{copy.colArea}</th>
                <th className="py-1.5 px-2 text-right">{copy.colType}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((s) => {
                const isSelected = Math.abs(s.phiDeg - phiDeg) < 0.08;
                return (
                  <tr
                    key={s.index}
                    onClick={() => onChangeRadiusAndPhi(r, s.phiDeg, true)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-1 px-2 text-slate-500">{s.index}</td>
                    <td className="py-1 px-2 text-right text-slate-900">{s.phiDeg.toFixed(2)}°</td>
                    <td className="py-1 px-2 text-right text-slate-700">{s.arcLengthFromN.toFixed(3)}</td>
                    <td className="py-1 px-2 text-right text-slate-700">{s.t.toFixed(3)}</td>
                    <td className="py-1 px-2 text-right text-slate-800">
                      {s.triangle.a.toFixed(2)} / {s.triangle.b.toFixed(2)} / {s.triangle.c.toFixed(2)}
                    </td>
                    <td className="py-1 px-2 text-right text-slate-700">{s.triangle.area.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right font-sans">
                      <span className={s.isUniqueShape ? 'text-emerald-700' : 'text-slate-400'}>
                        {s.isUniqueShape ? copy.uniqueTag : copy.twinTag}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
