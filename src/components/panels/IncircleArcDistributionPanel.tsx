/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { LanguageCode } from '../../i18n/translations.ts';
import {
  EXPERIMENT05_RADII,
  computeIncircleArcDistribution,
  generateExperiment05Table,
} from '../../math/experiments/incircleArcDistribution.ts';
import { MathFormula } from '../common/MathFormula.tsx';
import { PieChart } from 'lucide-react';

interface IncircleArcDistributionPanelProps {
  calc: FourCirclesCalculations;
  alphaDeg: number;
  onChangeRadiusAndAlpha: (newR: number, newAlphaDeg: number, recordHistory?: boolean) => void;
  lang?: LanguageCode;
}

type ChartMode = 'angles' | 'shares' | 'lengths';

const SPECIAL_ALPHAS = [
  { deg: 2, label: '→0° (2°)' },
  { deg: 30, label: '30°' },
  { deg: 45, label: '45°' },
  { deg: 60, label: '60°' },
  { deg: 88, label: '→90° (88°)' },
];

export const IncircleArcDistributionPanel: React.FC<IncircleArcDistributionPanelProps> = ({
  calc,
  alphaDeg,
  onChangeRadiusAndAlpha,
  lang = 'ru',
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('angles');

  const r = calc.incircle.radius;
  const dist = useMemo(() => computeIncircleArcDistribution(r, alphaDeg), [r, alphaDeg]);
  const tableRows = useMemo(() => generateExperiment05Table([r], 5), [r]);

  const copy = useMemo(() => {
    if (lang === 'en') {
      return {
        title: '08. Incircle Three-Arc Distribution (Experiment 05)',
        subtitle: 'Central angles between tangency radii, arc lengths L = r·φ, and shape vs scale invariance',
        radiusLabel: 'Incircle radius r (preserves shape α)',
        alphaLabel: 'Shape angle α = ∠B (0° < α < 90°)',
        triAnglesTitle: 'Triangle angles',
        sumLabel: 'Sum',
        centralTitle: 'Three central angles & arc lengths',
        colArc: 'Arc',
        colPhi: 'Central φ',
        colLen: 'Length L',
        colShare: 'Share',
        arcALabel: 'Arc A (opp. ∠A)',
        arcBLabel: 'Arc B (opp. ∠B)',
        arcCLabel: 'Arc C (opp. ∠C)',
        totalRow: 'Total (2πr)',
        equalityFindingTitle: 'Three-way 120° equality check',
        equalityFindingBody:
          'Since ∠C = 90° in every right triangle, φ_C = 180° − 90° = 90° (25%) is strictly constant. Equal 120° arcs occur ONLY in an equilateral triangle (A=B=C=60°). At α = 45° only the two leg arcs match: φ_A = φ_B = 135° (37.5% each), while φ_C = 90°.',
        chartAngles: 'Angles φ(α)',
        chartShares: 'Shares s(α)',
        chartLengths: 'Lengths L(α)',
        chartDescAngles: 'φ_A = 90° + α, φ_B = 180° − α, φ_C ≡ 90° (scale-invariant across r)',
        chartDescShares: 'Share s_C ≡ 25%; remaining 75% splits linearly between s_A and s_B',
        chartDescLengths: 'Absolute lengths L = r·φ_rad scale proportionally to radius r',
        tableTitle: '5°-step distribution at current r (click row to inspect)',
      };
    }
    if (lang === 'uk') {
      return {
        title: '08. Розподіл трьох дуг вписаного кола (Експеримент 05)',
        subtitle: 'Центральні кути між радіусами дотику, довжини дуг L = r·φ та інваріантність форми',
        radiusLabel: 'Радіус вписаного кола r (зберігає форму α)',
        alphaLabel: 'Кут форми α = ∠B (0° < α < 90°)',
        triAnglesTitle: 'Кути трикутника',
        sumLabel: 'Сума',
        centralTitle: 'Три центральні кути та довжини дуг',
        colArc: 'Дуга',
        colPhi: 'Кут φ',
        colLen: 'Довжина L',
        colShare: 'Частка',
        arcALabel: 'Дуга A (проти ∠A)',
        arcBLabel: 'Дуга B (проти ∠B)',
        arcCLabel: 'Дуга C (проти ∠C)',
        totalRow: 'Усього (2πr)',
        equalityFindingTitle: 'Умова рівності трьох дуг по 120°',
        equalityFindingBody:
          'У будь-якому прямокутному трикутнику ∠C = 90°, отже φ_C = 180° − 90° = 90° (25%) є сталою. Рівність 120° = 120° = 120° можлива ЛИШЕ в рівносторонньому трикутнику (A=B=C=60°). При α = 45° рівні лише дві дуги при катетах: φ_A = φ_B = 135° (по 37.5%), тоді як φ_C = 90°.',
        chartAngles: 'Кути φ(α)',
        chartShares: 'Частки s(α)',
        chartLengths: 'Довжини L(α)',
        chartDescAngles: 'φ_A = 90° + α, φ_B = 180° − α, φ_C ≡ 90° (не залежать від r)',
        chartDescShares: 'Частка s_C ≡ 25%; решта 75% лінійно перерозподіляється між s_A і s_B',
        chartDescLengths: 'Абсолютні довжини L = r·φ_рад масштабуються пропорційно до r',
        tableTitle: 'Таблиця розподілу (крок 5°) для поточного r (клік — перехід)',
      };
    }
    return {
      title: '08. Распределение трёх дуг вписанной окружности (Эксперимент 05)',
      subtitle: 'Центральные углы между радиусами касания, длины дуг L = r·φ и инвариантность формы',
      radiusLabel: 'Радиус вписанной окружности r (форма α сохраняется)',
      alphaLabel: 'Угол формы α = ∠B (0° < α < 90°)',
      triAnglesTitle: 'Углы треугольника',
      sumLabel: 'Сумма',
      centralTitle: 'Три центральных угла, длины дуг и доли окружности',
      colArc: 'Дуга',
      colPhi: 'Угол φ',
      colLen: 'Длина L',
      colShare: 'Доля',
      arcALabel: 'Дуга A (против ∠A)',
      arcBLabel: 'Дуга B (против ∠B)',
      arcCLabel: 'Дуга C (против ∠C)',
      totalRow: 'Сумма (2πr)',
      equalityFindingTitle: 'Проверка равенства трёх дуг (по 120°)',
      equalityFindingBody:
        'Так как в прямоугольном треугольнике ∠C = 90°, центральный угол φ_C = 180° − 90° = 90° (25%) строго постоянен. Три равные дуги по 120° возникают ТОЛЬКО в равностороннем треугольнике (A=B=C=60°). При α = 45° равны лишь две дуги при катетах: φ_A = φ_B = 135° (по 37.5%), а φ_C = 90°.',
      chartAngles: 'Углы φ(α)',
      chartShares: 'Доли s(α)',
      chartLengths: 'Длины L(α)',
      chartDescAngles: 'φ_A = 90° + α, φ_B = 180° − α, φ_C ≡ 90° (инвариант масштаба r)',
      chartDescShares: 'Доля дуги прямого угла s_C ≡ 25%; оставшиеся 75% линейно делят s_A и s_B',
      chartDescLengths: 'Абсолютные длины L = r·φ_рад растут прямо пропорционально радиусу r',
      tableTitle: 'Таблица распределения (шаг 5°) для текущего r (клик — перейти)',
    };
  }, [lang]);

  // SVG Chart dimensions
  const W = 440;
  const H = 165;
  const PAD = { l: 42, r: 16, t: 14, b: 26 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const xOfAlpha = (deg: number) => PAD.l + (deg / 90) * plotW;

  const yOfPhi = (deg: number) => PAD.t + plotH - (deg / 180) * plotH;
  const yOfShare = (pct: number) => PAD.t + plotH - (pct / 60) * plotH;
  const maxLenChart = Math.max(4, Math.ceil(Math.PI * r * 1.1));
  const yOfLen = (len: number) => PAD.t + plotH - (Math.min(maxLenChart, len) / maxLenChart) * plotH;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{copy.title}</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{copy.subtitle}</p>
      </div>

      {/* Formula Strip */}
      <div className="bg-slate-50 rounded-lg border border-slate-200/80 px-3 py-2 text-center overflow-x-auto">
        <MathFormula tex="\varphi_A = 180^\circ - A = 90^\circ + \alpha, \quad \varphi_B = 180^\circ - B = 180^\circ - \alpha, \quad \varphi_C = 90^\circ, \quad L_k = r\varphi_k" />
      </div>

      {/* Interactive Controls: alpha & r */}
      <div className="space-y-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
        {/* Alpha control */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor="exp05-alpha-slider" className="font-semibold text-slate-700">
              {copy.alphaLabel}:{' '}
              <span className="font-mono tabular-nums text-slate-900">{alphaDeg.toFixed(1)}°</span>
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {SPECIAL_ALPHAS.map((preset) => (
                <button
                  key={preset.deg}
                  onClick={() => onChangeRadiusAndAlpha(r, preset.deg, true)}
                  className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(alphaDeg - preset.deg) < 0.3
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <input
            id="exp05-alpha-slider"
            type="range"
            min="1"
            max="89"
            step="0.5"
            value={Math.min(89, Math.max(1, alphaDeg))}
            onChange={(e) => onChangeRadiusAndAlpha(r, parseFloat(e.target.value) || 45, false)}
            onPointerUp={() => onChangeRadiusAndAlpha(r, alphaDeg, true)}
            className="w-full accent-slate-900 cursor-pointer"
          />
        </div>

        {/* Radius r control */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="exp05-radius-slider" className="font-semibold text-slate-700">
              {copy.radiusLabel}:{' '}
              <span className="font-mono tabular-nums text-blue-800">{r.toFixed(2)}</span>
            </label>
            <div className="flex items-center gap-1">
              {EXPERIMENT05_RADII.map((rv) => (
                <button
                  key={rv}
                  onClick={() => onChangeRadiusAndAlpha(rv, alphaDeg, true)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(r - rv) < 0.02
                      ? 'bg-blue-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  r={rv}
                </button>
              ))}
            </div>
          </div>
          <input
            id="exp05-radius-slider"
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={Math.min(4, Math.max(0.5, r))}
            onChange={(e) => onChangeRadiusAndAlpha(parseFloat(e.target.value) || 1, alphaDeg, false)}
            onPointerUp={() => onChangeRadiusAndAlpha(r, alphaDeg, true)}
            className="w-full accent-blue-700 cursor-pointer"
          />
        </div>
      </div>

      {/* Triangle Angles Summary Row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">∠A = 90° − α</div>
          <div className="font-mono tabular-nums font-bold text-blue-700 text-sm mt-0.5">
            {dist.angleADeg.toFixed(2)}°
          </div>
        </div>
        <div className="p-2 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">∠B = α</div>
          <div className="font-mono tabular-nums font-bold text-emerald-700 text-sm mt-0.5">
            {dist.angleBDeg.toFixed(2)}°
          </div>
        </div>
        <div className="p-2 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">∠C (O)</div>
          <div className="font-mono tabular-nums font-bold text-amber-700 text-sm mt-0.5">
            {dist.angleCDeg.toFixed(2)}°
          </div>
        </div>
      </div>

      {/* Proportional Circumference Distribution Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">{copy.centralTitle}</span>
          <span className="font-mono tabular-nums text-[11px] text-slate-500">
            Σφ = {dist.centralAngleSumDeg.toFixed(2)}°
          </span>
        </div>
        <div className="h-3 w-full rounded-md overflow-hidden flex border border-slate-200">
          <div
            style={{ width: `${dist.shareA * 100}%` }}
            className="bg-blue-600 transition-all duration-150"
            title={`φ_A = ${dist.phiADeg.toFixed(1)}°`}
          />
          <div
            style={{ width: `${dist.shareB * 100}%` }}
            className="bg-emerald-600 transition-all duration-150"
            title={`φ_B = ${dist.phiBDeg.toFixed(1)}°`}
          />
          <div
            style={{ width: `${dist.shareC * 100}%` }}
            className="bg-amber-500 transition-all duration-150"
            title={`φ_C = ${dist.phiCDeg.toFixed(1)}°`}
          />
        </div>

        {/* Structured Arc Table */}
        <div className="border border-slate-200/80 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-xs font-mono tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans text-[11px]">
              <tr>
                <th className="py-1.5 px-2.5 text-left">{copy.colArc}</th>
                <th className="py-1.5 px-2 text-right">{copy.colPhi}</th>
                <th className="py-1.5 px-2 text-right">{copy.colLen}</th>
                <th className="py-1.5 px-2.5 text-right">{copy.colShare}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-1.5 px-2.5 font-sans font-semibold text-blue-700">{copy.arcALabel}</td>
                <td className="py-1.5 px-2 text-right text-slate-900">{dist.phiADeg.toFixed(2)}°</td>
                <td className="py-1.5 px-2 text-right text-slate-800">{dist.lengthA.toFixed(4)}</td>
                <td className="py-1.5 px-2.5 text-right text-blue-700 font-semibold">
                  {(dist.shareA * 100).toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-2.5 font-sans font-semibold text-emerald-700">{copy.arcBLabel}</td>
                <td className="py-1.5 px-2 text-right text-slate-900">{dist.phiBDeg.toFixed(2)}°</td>
                <td className="py-1.5 px-2 text-right text-slate-800">{dist.lengthB.toFixed(4)}</td>
                <td className="py-1.5 px-2.5 text-right text-emerald-700 font-semibold">
                  {(dist.shareB * 100).toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-2.5 font-sans font-semibold text-amber-800">{copy.arcCLabel}</td>
                <td className="py-1.5 px-2 text-right text-slate-900">{dist.phiCDeg.toFixed(2)}°</td>
                <td className="py-1.5 px-2 text-right text-slate-800">{dist.lengthC.toFixed(4)}</td>
                <td className="py-1.5 px-2.5 text-right text-amber-800 font-semibold">
                  {(dist.shareC * 100).toFixed(2)}%
                </td>
              </tr>
              <tr className="bg-slate-50/80 font-semibold">
                <td className="py-1.5 px-2.5 font-sans text-slate-700">{copy.totalRow}</td>
                <td className="py-1.5 px-2 text-right text-slate-900">{dist.centralAngleSumDeg.toFixed(2)}°</td>
                <td className="py-1.5 px-2 text-right text-slate-900">{dist.arcLengthSum.toFixed(4)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-900">
                  {(dist.shareSum * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Mathematical Proof Conclusion Card (no left thick stripe, clean hairline border) */}
      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 text-xs space-y-1">
        <div className="font-bold text-slate-900">{copy.equalityFindingTitle}</div>
        <p className="text-slate-600 leading-relaxed">{copy.equalityFindingBody}</p>
      </div>

      {/* Interactive Distribution Curves */}
      <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-2">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => setChartMode('angles')}
            className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
              chartMode === 'angles'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.chartAngles}
          </button>
          <button
            onClick={() => setChartMode('shares')}
            className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
              chartMode === 'shares'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.chartShares}
          </button>
          <button
            onClick={() => setChartMode('lengths')}
            className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
              chartMode === 'lengths'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.chartLengths}
          </button>
        </div>

        <div className="text-[11px] text-slate-500">
          {chartMode === 'angles'
            ? copy.chartDescAngles
            : chartMode === 'shares'
              ? copy.chartDescShares
              : copy.chartDescLengths}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth="1" />

          {[0, 15, 30, 45, 60, 75, 90].map((deg) => (
            <g key={`x-${deg}`}>
              <line
                x1={xOfAlpha(deg)}
                y1={PAD.t}
                x2={xOfAlpha(deg)}
                y2={H - PAD.b}
                stroke={deg === 45 ? '#cbd5e1' : '#f1f5f9'}
                strokeDasharray={deg === 45 ? '3 3' : undefined}
              />
              <text
                x={xOfAlpha(deg)}
                y={H - 8}
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-500"
              >
                {deg}°
              </text>
            </g>
          ))}

          {chartMode === 'angles' && (
            <>
              {[0, 45, 90, 120, 135, 180].map((yv) => (
                <g key={`yp-${yv}`}>
                  <line
                    x1={PAD.l}
                    y1={yOfPhi(yv)}
                    x2={W - PAD.r}
                    y2={yOfPhi(yv)}
                    stroke={yv === 120 ? '#cbd5e1' : '#f1f5f9'}
                    strokeDasharray={yv === 120 ? '3 3' : undefined}
                  />
                  <text
                    x={PAD.l - 5}
                    y={yOfPhi(yv) + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-500"
                  >
                    {yv}°
                  </text>
                </g>
              ))}
              {/* phi_A = 90 + alpha */}
              <line x1={xOfAlpha(0)} y1={yOfPhi(90)} x2={xOfAlpha(90)} y2={yOfPhi(180)} stroke="#2563eb" strokeWidth="2.2" />
              {/* phi_B = 180 - alpha */}
              <line x1={xOfAlpha(0)} y1={yOfPhi(180)} x2={xOfAlpha(90)} y2={yOfPhi(90)} stroke="#059669" strokeWidth="2.2" />
              {/* phi_C = 90 */}
              <line x1={xOfAlpha(0)} y1={yOfPhi(90)} x2={xOfAlpha(90)} y2={yOfPhi(90)} stroke="#d97706" strokeWidth="2.2" />

              <circle cx={xOfAlpha(alphaDeg)} cy={yOfPhi(dist.phiADeg)} r="3.8" fill="#2563eb" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfPhi(dist.phiBDeg)} r="3.8" fill="#059669" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfPhi(dist.phiCDeg)} r="3.8" fill="#d97706" stroke="#fff" strokeWidth="1.2" />
            </>
          )}

          {chartMode === 'shares' && (
            <>
              {[0, 15, 25, 37.5, 50, 60].map((pv) => (
                <g key={`ys-${pv}`}>
                  <line x1={PAD.l} y1={yOfShare(pv)} x2={W - PAD.r} y2={yOfShare(pv)} stroke="#f1f5f9" />
                  <text x={PAD.l - 5} y={yOfShare(pv) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                    {pv}%
                  </text>
                </g>
              ))}
              <line x1={xOfAlpha(0)} y1={yOfShare(25)} x2={xOfAlpha(90)} y2={yOfShare(50)} stroke="#2563eb" strokeWidth="2.2" />
              <line x1={xOfAlpha(0)} y1={yOfShare(50)} x2={xOfAlpha(90)} y2={yOfShare(25)} stroke="#059669" strokeWidth="2.2" />
              <line x1={xOfAlpha(0)} y1={yOfShare(25)} x2={xOfAlpha(90)} y2={yOfShare(25)} stroke="#d97706" strokeWidth="2.2" />

              <circle cx={xOfAlpha(alphaDeg)} cy={yOfShare(dist.shareA * 100)} r="3.8" fill="#2563eb" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfShare(dist.shareB * 100)} r="3.8" fill="#059669" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfShare(dist.shareC * 100)} r="3.8" fill="#d97706" stroke="#fff" strokeWidth="1.2" />
            </>
          )}

          {chartMode === 'lengths' && (
            <>
              {[0, maxLenChart * 0.25, maxLenChart * 0.5, maxLenChart * 0.75, maxLenChart].map((lv) => (
                <g key={`yl-${lv}`}>
                  <line x1={PAD.l} y1={yOfLen(lv)} x2={W - PAD.r} y2={yOfLen(lv)} stroke="#f1f5f9" />
                  <text x={PAD.l - 5} y={yOfLen(lv) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                    {lv.toFixed(1)}
                  </text>
                </g>
              ))}
              <line
                x1={xOfAlpha(0)}
                y1={yOfLen((r * Math.PI) / 2)}
                x2={xOfAlpha(90)}
                y2={yOfLen(r * Math.PI)}
                stroke="#2563eb"
                strokeWidth="2.2"
              />
              <line
                x1={xOfAlpha(0)}
                y1={yOfLen(r * Math.PI)}
                x2={xOfAlpha(90)}
                y2={yOfLen((r * Math.PI) / 2)}
                stroke="#059669"
                strokeWidth="2.2"
              />
              <line
                x1={xOfAlpha(0)}
                y1={yOfLen((r * Math.PI) / 2)}
                x2={xOfAlpha(90)}
                y2={yOfLen((r * Math.PI) / 2)}
                stroke="#d97706"
                strokeWidth="2.2"
              />

              <circle cx={xOfAlpha(alphaDeg)} cy={yOfLen(dist.lengthA)} r="3.8" fill="#2563eb" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfLen(dist.lengthB)} r="3.8" fill="#059669" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfLen(dist.lengthC)} r="3.8" fill="#d97706" stroke="#fff" strokeWidth="1.2" />
            </>
          )}

          {/* Live vertical guide */}
          <line
            x1={xOfAlpha(alphaDeg)}
            y1={PAD.t}
            x2={xOfAlpha(alphaDeg)}
            y2={H - PAD.b}
            stroke="#0f172a"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* 5-degree interactive table */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-800">{copy.tableTitle}</div>
        <div className="max-h-56 overflow-y-auto border border-slate-200/80 rounded-lg bg-white">
          <table className="w-full text-[11px] font-mono tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
              <tr>
                <th className="py-1.5 px-2 text-left">α</th>
                <th className="py-1.5 px-2 text-right text-blue-700">φ_A</th>
                <th className="py-1.5 px-2 text-right text-emerald-700">φ_B</th>
                <th className="py-1.5 px-2 text-right text-amber-800">φ_C</th>
                <th className="py-1.5 px-2 text-right">L_A / L_B / L_C</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((row) => {
                const isSelected = Math.abs(row.alphaDeg - alphaDeg) < 0.25;
                return (
                  <tr
                    key={row.alphaDeg}
                    onClick={() => onChangeRadiusAndAlpha(r, row.alphaDeg, true)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-1 px-2 text-slate-900">{row.alphaDeg.toFixed(0)}°</td>
                    <td className="py-1 px-2 text-right text-blue-700">{row.phiADeg.toFixed(0)}°</td>
                    <td className="py-1 px-2 text-right text-emerald-700">{row.phiBDeg.toFixed(0)}°</td>
                    <td className="py-1 px-2 text-right text-amber-800">{row.phiCDeg.toFixed(0)}°</td>
                    <td className="py-1 px-2 text-right text-slate-800">
                      {row.lengthA.toFixed(2)} / {row.lengthB.toFixed(2)} / {row.lengthC.toFixed(2)}
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
