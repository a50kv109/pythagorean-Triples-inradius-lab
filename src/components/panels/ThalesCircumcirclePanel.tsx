/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { Translations } from '../../i18n/translations.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import { MathFormula } from '../common/MathFormula.tsx';
import { KcVsKoComparison } from './KcVsKoComparison.tsx';
import { formatPoint } from '../../geometry/transforms.ts';
import { CheckCircle2, Compass } from 'lucide-react';

interface ThalesCircumcirclePanelProps {
  calc: FourCirclesCalculations;
  onChangeLambda?: (newLambda: number, recordHistory?: boolean) => void;
  t: Translations;
}

export const ThalesCircumcirclePanel: React.FC<ThalesCircumcirclePanelProps> = ({
  calc,
  onChangeLambda,
  t,
}) => {
  const { triangle, circleC, incircle, circumcircle } = calc;

  const distDiffA = Math.abs(circumcircle.vertexDistances.toA - circumcircle.radius);
  const distDiffB = Math.abs(circumcircle.vertexDistances.toB - circumcircle.radius);
  const distDiffO = Math.abs(circumcircle.vertexDistances.toC - circumcircle.radius);
  const angleOk = Math.abs(circumcircle.angleAtRightVertexDeg - 90) < 1e-9;

  // Reference hypotenuse c0 = 5.0 (canonical Egyptian base)
  const currentLambda = triangle.c / 5.0;
  const areaRatioToUnit = Math.pow(currentLambda, 2);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-violet-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            {t.thalesPanel.title}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{t.thalesPanel.subtitle}</p>
      </div>

      {/* Theorem Statement & Algebraic Summary */}
      <div className="p-3.5 rounded-lg bg-violet-50/50 border border-violet-200/70 space-y-2.5">
        <div className="text-xs font-bold text-slate-900">{t.thalesPanel.theoremTitle}</div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t.thalesPanel.theoremSummary}
        </p>
        <div className="bg-white rounded-md border border-violet-200/70 px-3 py-2 text-center overflow-x-auto">
          <MathFormula tex="O_o = \frac{A + B}{2}, \quad D_o = c, \quad R_o = \frac{c}{2}, \quad K_o = \frac{\pi c^2}{4}, \quad \angle AOB = 90^\circ" />
        </div>
      </div>

      {/* 4 Primary Circumcircle Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricCard
          label={t.thalesPanel.metricDo}
          symbol="D_o = c"
          value={circumcircle.diameter}
          accentColor="indigo"
        />
        <MetricCard
          label={t.thalesPanel.metricRo}
          symbol="R_o = c/2"
          value={circumcircle.radius}
          highlight={true}
          accentColor="indigo"
        />
        <MetricCard
          label={t.thalesPanel.metricKo}
          symbol="K_o = πc²/4"
          value={circumcircle.area}
          accentColor="rose"
        />
        <MetricCard
          label={t.thalesPanel.metricLo}
          symbol="L_o = πc"
          value={circumcircle.circumference}
          accentColor="emerald"
        />
      </div>

      {/* ================================================================== */}
      {/* DYNAMIC SCALING CARD: K_o(lambda) = lambda^2 * K_o(1)             */}
      {/* ================================================================== */}
      <div className="p-3.5 rounded-lg bg-violet-50/40 border border-violet-200 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-violet-950">
              {t.thalesPanel.scaleCardTitle}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {t.thalesPanel.scaleCardSubtitle}
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200">
            λ = {currentLambda.toFixed(3)}
          </span>
        </div>

        {/* Dynamic Scale Slider */}
        <div className="space-y-1.5 p-2.5 rounded-md bg-white border border-violet-200/80">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700">
              {t.thalesPanel.scaleSliderLabel}
            </label>
            <div className="flex items-center gap-1">
              {[0.5, 1.0, 1.5, 2.0].map((sVal) => {
                const isActive = Math.abs(currentLambda - sVal) < 0.03;
                return (
                  <button
                    key={sVal}
                    onClick={() => onChangeLambda?.(sVal, true)}
                    className={`px-1.5 py-0.5 text-[11px] font-mono rounded font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sVal}x
                  </button>
                );
              })}
            </div>
          </div>

          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={currentLambda}
            onChange={(e) => onChangeLambda?.(parseFloat(e.target.value) || 1.0, false)}
            onPointerUp={() => onChangeLambda?.(currentLambda, true)}
            className="w-full accent-violet-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums">
            <span>0.20x</span>
            <span>1.00x (c₀ = 5)</span>
            <span>2.50x</span>
          </div>
        </div>

        {/* Mathematical Formulas for Linear vs. Quadratic Growth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-white border border-violet-100 space-y-1">
            <span className="text-[11px] font-semibold text-indigo-900 block">
              {t.thalesPanel.scaleMetricLinear}
            </span>
            <div className="font-mono tabular-nums text-slate-800 text-[11px] space-y-0.5">
              <div>D_o(λ) = λ · 5.0000 = <span className="font-bold text-indigo-700">{circumcircle.diameter.toFixed(4)}</span></div>
              <div>R_o(λ) = λ · 2.5000 = <span className="font-bold text-indigo-700">{circumcircle.radius.toFixed(4)}</span></div>
              <div>L_o(λ) = λ · 15.7080 = <span className="font-bold text-indigo-700">{circumcircle.circumference.toFixed(4)}</span></div>
            </div>
          </div>

          <div className="p-2 rounded bg-white border border-violet-100 space-y-1">
            <span className="text-[11px] font-semibold text-rose-900 block">
              {t.thalesPanel.scaleMetricArea}
            </span>
            <div className="font-mono tabular-nums text-slate-800 text-[11px] space-y-0.5">
              <div>K_o(λ) = λ² · K_o(1) = <span className="font-bold text-rose-700">{circumcircle.area.toFixed(4)}</span></div>
              <div>Коэфф. роста: λ² = <span className="font-bold text-rose-700">{areaRatioToUnit.toFixed(4)}x</span></div>
              <div>K_c(λ) ≡ K_o(λ) = <span className="font-bold text-rose-700">{circleC.area.toFixed(4)}</span></div>
            </div>
          </div>
        </div>

        {/* Similarity Law Benchmarks Table */}
        <div className="border border-violet-200/80 rounded-md overflow-x-auto bg-white">
          <table className="w-full text-xs font-mono tabular-nums">
            <thead className="bg-violet-50/70 border-b border-violet-200/70 text-slate-600 font-sans text-[11px]">
              <tr>
                <th className="py-1 px-2 text-left">Масштаб λ</th>
                <th className="py-1 px-2 text-right">R_o (c/2)</th>
                <th className="py-1 px-2 text-right">D_o (c)</th>
                <th className="py-1 px-2 text-right">L_o (πc)</th>
                <th className="py-1 px-2 text-right">K_o (πc²/4)</th>
                <th className="py-1 px-2 text-right">Рост K_o/K₀</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {[0.5, 1.0, 1.5, 2.0].map((benchmark) => {
                const bC = benchmark * 5.0;
                const bRo = bC / 2;
                const bDo = bC;
                const bLo = Math.PI * bC;
                const bKo = (Math.PI * bC * bC) / 4;
                const bRatio = Math.pow(benchmark, 2);
                const isCurrent = Math.abs(currentLambda - benchmark) < 0.03;
                return (
                  <tr
                    key={benchmark}
                    className={`hover:bg-violet-50/30 ${isCurrent ? 'bg-violet-100/50 font-bold' : ''}`}
                  >
                    <td className="py-1 px-2 text-violet-900 font-sans">
                      λ = {benchmark.toFixed(1)} {benchmark === 1.0 ? '(База)' : ''}
                    </td>
                    <td className="py-1 px-2 text-right text-slate-700">{bRo.toFixed(3)}</td>
                    <td className="py-1 px-2 text-right text-slate-700">{bDo.toFixed(3)}</td>
                    <td className="py-1 px-2 text-right text-slate-700">{bLo.toFixed(3)}</td>
                    <td className="py-1 px-2 text-right text-rose-700">{bKo.toFixed(3)}</td>
                    <td className="py-1 px-2 text-right text-violet-800 font-bold">{bRatio.toFixed(2)}x</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-violet-800/80 leading-snug">
          {t.thalesPanel.scaleInvariantNote}
        </p>
      </div>

      {/* Live Vertex Equidistance & Right-Angle Checks */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">{t.thalesPanel.checksTitle}</span>
          <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {angleOk ? '∠AOB = 90.0000°' : `${circumcircle.angleAtRightVertexDeg.toFixed(4)}°`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono tabular-nums">
          <div className="bg-white rounded-md border border-slate-200/70 px-2.5 py-2 flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-slate-600">{t.thalesPanel.centerCoordLabel}</span>
            <span className="font-bold text-violet-800">{formatPoint(circumcircle.center)}</span>
          </div>
          <div className="bg-white rounded-md border border-slate-200/70 px-2.5 py-2 flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-slate-600">{t.thalesPanel.angleCheckLabel}</span>
            <span className="font-bold text-slate-900">
              {circumcircle.angleAtRightVertexDeg.toFixed(4)}°
            </span>
          </div>
          <div className="bg-white rounded-md border border-slate-200/70 px-2.5 py-2 flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-slate-600">{t.thalesPanel.distALabel}</span>
            <span className="font-semibold text-slate-900">
              {circumcircle.vertexDistances.toA.toFixed(4)}
              <span className="text-[10px] text-emerald-700 ml-1">
                ({distDiffA < 1e-12 ? 'Δ<10⁻¹²' : distDiffA.toExponential(1)})
              </span>
            </span>
          </div>
          <div className="bg-white rounded-md border border-slate-200/70 px-2.5 py-2 flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-slate-600">{t.thalesPanel.distBLabel}</span>
            <span className="font-semibold text-slate-900">
              {circumcircle.vertexDistances.toB.toFixed(4)}
              <span className="text-[10px] text-emerald-700 ml-1">
                ({distDiffB < 1e-12 ? 'Δ<10⁻¹²' : distDiffB.toExponential(1)})
              </span>
            </span>
          </div>
          <div className="sm:col-span-2 bg-white rounded-md border border-slate-200/70 px-2.5 py-2 flex items-center justify-between gap-2">
            <span className="font-sans text-[11px] text-slate-600">{t.thalesPanel.distOLabel}</span>
            <span className="font-semibold text-slate-900">
              {circumcircle.vertexDistances.toC.toFixed(4)} = R_o = c/2 = {(triangle.c / 2).toFixed(4)}
              <span className="text-[10px] text-emerald-700 ml-1.5">
                ({distDiffO < 1e-12 ? 'Δ<10⁻¹²' : distDiffO.toExponential(1)})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Key Geometric Centers Comparison: I vs O_o vs O_c */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-800">{t.thalesPanel.centersComparisonTitle}</div>
        <div className="grid grid-cols-1 gap-1.5 text-xs font-mono tabular-nums">
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-amber-50/40 border border-amber-200/60">
            <span className="font-sans text-slate-700">{t.thalesPanel.incenterRole}</span>
            <span className="font-bold text-amber-900">I = {formatPoint(incircle.center)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-violet-50/60 border border-violet-200/70">
            <span className="font-sans text-slate-700">{t.thalesPanel.circumcenterRole}</span>
            <span className="font-bold text-violet-800">O_o = {formatPoint(circumcircle.center)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-rose-50/40 border border-rose-200/60">
            <span className="font-sans text-slate-700">{t.thalesPanel.kcCenterRole}</span>
            <span className="font-bold text-rose-800">O_c = {formatPoint(circleC.center)}</span>
          </div>
        </div>
      </div>

      {/* K_c vs K_o Structural & Numeric Comparison Table */}
      <KcVsKoComparison calc={calc} t={t} />
    </div>
  );
};
