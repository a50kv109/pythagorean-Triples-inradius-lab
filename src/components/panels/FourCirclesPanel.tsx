/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { ActiveModuleId, DisplayMode, FourCirclesCalculations } from '../../types/geometry.ts';
import { Translations } from '../../i18n/translations.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import { MathFormula } from '../common/MathFormula.tsx';
import { KcVsKoComparison } from './KcVsKoComparison.tsx';
import { formatPoint } from '../../geometry/transforms.ts';
import {
  GraduationCap,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FourCirclesPanelProps {
  calc: FourCirclesCalculations;
  activeModule: ActiveModuleId;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  t: Translations;
}

export const FourCirclesPanel: React.FC<FourCirclesPanelProps> = ({
  calc,
  activeModule,
  displayMode,
  setDisplayMode,
  t,
}) => {
  const [showCoordinates, setShowCoordinates] = useState(false);

  const { triangle, circleA, circleB, circleC, incircle, circumcircle } = calc;
  const residualOk = calc.identityResidualRel < 1e-11;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{t.panel.title}</h2>
          <p className="text-xs text-slate-500">{t.panel.subtitle}</p>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setDisplayMode('school')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              displayMode === 'school'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> {t.modes.school}
          </button>
          <button
            onClick={() => setDisplayMode('research')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              displayMode === 'research'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" /> {t.modes.research}
          </button>
        </div>
      </div>

      {/* Central Mathematical Identity Observer */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900">{t.panel.identityTitle}</span>
          <span
            className={`text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
              residualOk ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {residualOk ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {residualOk ? t.panel.identityHold : t.panel.identityFail}
          </span>
        </div>

        <div className="bg-white rounded-md border border-slate-200/80 px-3 py-2 text-center">
          <MathFormula tex="\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono tabular-nums text-xs">
          <div className="bg-white rounded-md border border-slate-200/70 p-2">
            <div className="text-[11px] font-sans text-slate-500">{t.panel.lhsLabel}</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {calc.sqrtSumLegs.toFixed(6)}
            </div>
          </div>
          <div className="bg-white rounded-md border border-slate-200/70 p-2">
            <div className="text-[11px] font-sans text-slate-500">{t.panel.rhsLabel}</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {calc.sqrtSumHypAndIn.toFixed(6)}
            </div>
          </div>
          <div className="bg-white rounded-md border border-slate-200/70 p-2">
            <div className="text-[11px] font-sans text-slate-500">{t.panel.residualLabel}</div>
            <div className="text-sm font-bold text-emerald-700 mt-0.5">
              {calc.identityResidualAbs < 1e-13
                ? '< 10⁻¹³'
                : calc.identityResidualAbs.toExponential(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Module Explanation (Concise, no wall of text) */}
      {activeModule === 'identity_proof' && (
        <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200/70 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-slate-900">{t.panel.proofTitle}</div>
          <div className="overflow-x-auto">
            <MathFormula tex="\sqrt{K_a}+\sqrt{K_b}=\frac{\sqrt{\pi}}{2}(a+b), \quad \sqrt{K_c}+\sqrt{K_i}=\frac{\sqrt{\pi}}{2}c+\sqrt{\pi}\frac{a+b-c}{2}=\frac{\sqrt{\pi}}{2}(a+b)" />
          </div>
        </div>
      )}

      {activeModule === 'incircle_focus' && (
        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-slate-900">{t.panel.incircleTitle}</div>
          <p className="text-slate-600">
            {t.panel.incircleDescBefore} <span className="font-mono">(0, r)</span> {t.helpModal.sec1IntroAnd}{' '}
            <span className="font-mono">(r, 0)</span> {t.panel.incircleDescMiddle}{' '}
            <span className="font-mono">T_c</span>. {t.panel.incircleDescAfter}
          </p>
          <div className="text-center">
            <MathFormula
              tex={`r = \\frac{a + b - c}{2} = \\frac{${triangle.a.toFixed(2)} + ${triangle.b.toFixed(2)} - ${triangle.c.toFixed(3)}}{2} = ${incircle.radius.toFixed(4)}`}
            />
          </div>
        </div>
      )}

      {/* Primary Parameters: a, b, c, r */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricCard label={t.panel.legA} symbol="a" value={triangle.a.toFixed(2)} accentColor="sky" />
        <MetricCard label={t.panel.legB} symbol="b" value={triangle.b.toFixed(2)} accentColor="emerald" />
        <MetricCard
          label={t.panel.hypC}
          symbol="c"
          value={triangle.c}
          subtext="√(a² + b²)"
          highlight={true}
          accentColor="rose"
        />
        <MetricCard
          label={t.panel.radiusKi}
          symbol="r"
          value={incircle.radius}
          subtext="(a + b - c)/2"
          highlight={true}
          accentColor="amber"
        />
      </div>

      {/* Four Circles Areas & Square Roots Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-2 px-3 text-left">{t.panel.colCircle}</th>
              <th className="py-2 px-3 text-left">{t.panel.colLocation}</th>
              <th className="py-2 px-3 text-right">{t.panel.colDim}</th>
              <th className="py-2 px-3 text-right">{t.panel.colArea}</th>
              <th className="py-2 px-3 text-right">{t.panel.colSqrt}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            <tr className="hover:bg-slate-50/70">
              <td className="py-2 px-3 font-bold text-blue-700">K_a</td>
              <td className="py-2 px-3 font-sans text-slate-600">{t.panel.locSquareQa}</td>
              <td className="py-2 px-3 text-right text-slate-700">
                d = {circleA.diameter.toFixed(2)}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-slate-900">
                {circleA.area.toFixed(4)}
              </td>
              <td className="py-2 px-3 text-right font-bold text-blue-800">
                {circleA.sqrtArea.toFixed(4)}
              </td>
            </tr>
            <tr className="hover:bg-slate-50/70">
              <td className="py-2 px-3 font-bold text-emerald-700">K_b</td>
              <td className="py-2 px-3 font-sans text-slate-600">{t.panel.locSquareQb}</td>
              <td className="py-2 px-3 text-right text-slate-700">
                d = {circleB.diameter.toFixed(2)}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-slate-900">
                {circleB.area.toFixed(4)}
              </td>
              <td className="py-2 px-3 text-right font-bold text-emerald-800">
                {circleB.sqrtArea.toFixed(4)}
              </td>
            </tr>
            <tr className="hover:bg-slate-50/70">
              <td className="py-2 px-3 font-bold text-rose-700">K_c</td>
              <td className="py-2 px-3 font-sans text-slate-600">{t.panel.locSquareQc}</td>
              <td className="py-2 px-3 text-right text-slate-700">
                d = {circleC.diameter.toFixed(3)}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-slate-900">
                {circleC.area.toFixed(4)}
              </td>
              <td className="py-2 px-3 text-right font-bold text-rose-800">
                {circleC.sqrtArea.toFixed(4)}
              </td>
            </tr>
            <tr className="hover:bg-slate-50/70 bg-amber-50/30">
              <td className="py-2 px-3 font-bold text-amber-800">K_i</td>
              <td className="py-2 px-3 font-sans text-slate-700">{t.panel.locInsideTri}</td>
              <td className="py-2 px-3 text-right text-slate-700">
                r = {incircle.radius.toFixed(3)}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-slate-900">
                {incircle.area.toFixed(4)}
              </td>
              <td className="py-2 px-3 text-right font-bold text-amber-800">
                {incircle.sqrtArea.toFixed(4)}
              </td>
            </tr>
            <tr className="hover:bg-slate-50/70 bg-violet-50/35">
              <td className="py-2 px-3 font-bold text-violet-700">K_o</td>
              <td className="py-2 px-3 font-sans text-slate-700">{t.panel.locCircumscribed}</td>
              <td className="py-2 px-3 text-right text-slate-700">
                D_o = {circumcircle.diameter.toFixed(3)}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-slate-900">
                {circumcircle.area.toFixed(4)}
              </td>
              <td className="py-2 px-3 text-right font-bold text-violet-800">
                {circumcircle.sqrtArea.toFixed(4)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Area Relations Contrast: Why Ka + Kb != Kc + Ki */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-800">{t.panel.areaContrastTitle}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <MathFormula tex="K_a + K_b = K_c" />
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                Δ = {Math.abs(calc.pythagoreanAreaDiff) < 1e-12 ? '< 10⁻¹²' : Math.abs(calc.pythagoreanAreaDiff).toExponential(1)}
              </span>
            </div>
            <div className="font-mono tabular-nums text-slate-900 font-semibold">
              {calc.areaSumLegs.toFixed(4)} = {circleC.area.toFixed(4)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <MathFormula tex="K_a + K_b - K_c - K_i = -K_i" />
            </div>
            <div className="font-mono tabular-nums text-rose-700 font-semibold">
              {calc.areaMinusAll.toFixed(4)} ≠ 0 ({t.panel.equalsMinusKi})
            </div>
          </div>
        </div>

        {displayMode === 'research' && (
          <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
            {t.panel.contrastNoteBefore} <span className="font-mono">K_a + K_b = K_c + K_i</span>{' '}
            {t.panel.contrastNoteMiddle} <span className="font-mono">K_a + K_b = K_c</span>
            {t.panel.contrastNoteAfter} <span className="font-mono">K_i = πr² &gt; 0</span>.
          </div>
        )}
      </div>

      {/* K_c vs K_o Comparison Block */}
      <KcVsKoComparison calc={calc} t={t} />

      {/* Collapsible Centers & Tangency Points Coordinates */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 py-1"
        >
          <span>{t.panel.coordinatesTitle}</span>
          {showCoordinates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showCoordinates && (
          <div className="grid grid-cols-2 gap-2 mt-2 p-2.5 bg-slate-50 rounded-lg text-xs font-mono tabular-nums border border-slate-200/70">
            <div>O_a = {formatPoint(circleA.center)}</div>
            <div>O_b = {formatPoint(circleB.center)}</div>
            <div>O_c = {formatPoint(circleC.center)}</div>
            <div className="text-violet-800 font-semibold">O_o = {formatPoint(circumcircle.center)}</div>
            <div>I = {formatPoint(incircle.center)}</div>
            <div>T_a(OA) = {formatPoint(incircle.tangencyOA)}</div>
            <div>T_b(OB) = {formatPoint(incircle.tangencyOB)}</div>
            <div>T_c(AB) = {formatPoint(incircle.tangencyAB)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
