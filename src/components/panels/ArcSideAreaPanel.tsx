/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { LanguageCode } from '../../i18n/translations.ts';
import {
  EXPERIMENT06_LAWS_CATALOG,
  EXPERIMENT06_RADII,
  computeArcSideAreaPoint,
  generateExperiment06Table,
} from '../../math/experiments/arcSideAreaCorrespondence.ts';
import { MathFormula } from '../common/MathFormula.tsx';
import { GitCompareArrows } from 'lucide-react';

interface ArcSideAreaPanelProps {
  calc: FourCirclesCalculations;
  alphaDeg: number;
  onChangeRadiusAndAlpha: (newR: number, newAlphaDeg: number, recordHistory?: boolean) => void;
  lang?: LanguageCode;
}

type ChartMode = 'shares' | 'defect' | 'angles';

const PRESET_ALPHAS = [
  { deg: 2, label: '→0°' },
  { deg: 30, label: '30°' },
  { deg: 36.8698976, label: '3-4-5' },
  { deg: 45, label: '45°' },
  { deg: 60, label: '60°' },
  { deg: 88, label: '→90°' },
];

export const ArcSideAreaPanel: React.FC<ArcSideAreaPanelProps> = ({
  calc,
  alphaDeg,
  onChangeRadiusAndAlpha,
  lang = 'ru',
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('shares');

  const r = calc.incircle.radius;
  const pt = useMemo(() => computeArcSideAreaPoint(r, alphaDeg), [r, alphaDeg]);
  const tableRows = useMemo(() => generateExperiment06Table([r], 5), [r]);

  const finePts = useMemo(() => {
    const list = [];
    for (let d = 2; d <= 88; d += 2) {
      list.push(computeArcSideAreaPoint(1, d));
    }
    return list;
  }, []);

  const copy = useMemo(() => {
    if (lang === 'en') {
      return {
        title: '09. Arc–Side–Area Correspondence (Experiment 06)',
        subtitle: 'Joint analysis of incircle arcs (System A), sides (System B), and subtriangle areas (System C)',
        alphaLabel: 'Shape angle α = ∠B',
        radiusLabel: 'Incircle radius r (preserves shape α)',
        matrixTitle: 'Three-system comparison matrix',
        colSector: 'Sector',
        colArcSys: 'A. Arc share (φ)',
        colSideSys: 'B. Side (s / P)',
        colAreaSys: 'C. Area (S_k / S)',
        rowA: 'A ↔ a (|OB|)',
        rowB: 'B ↔ b (|OA|)',
        rowC: 'C ↔ c (|AB|)',
        bridgesTitle: 'Verified cross-system bridge identities',
        lawCatalogTitle: 'Catalog & classification of laws (A–C)',
        chartShares: 'Shares (A vs B/C)',
        chartDefect: 'Defect r²/S',
        chartAngles: 'Radii φ vs Bisectors ψ',
        chartDescShares: 'Solid: w_area ≡ w_side (a opp A, b opp B); dashed: w_arc (w_A=w_a @34.4°, w_B=w_b @55.6°)',
        chartDescDefect: 'Scale-invariant r²/S = w_a + w_b − w_c = 2·w_a·w_b (peaks at 3−2√2 ≈ 17.16% when α=45°)',
        chartDescAngles: 'Solid: tangency radii φ_k; dashed: vertex segment angles ψ_k = 90° + X/2 (ψ_C ≡ 135°)',
        tableTitle: '5°-step cross-system table (click row to inspect)',
      };
    }
    if (lang === 'uk') {
      return {
        title: '09. Дуги–Сторони–Площі (Експеримент 06)',
        subtitle: 'Спільний аналіз дуг кола (A), сторін трикутника (B) і площ трьох частин (C)',
        alphaLabel: 'Кут форми α = ∠B',
        radiusLabel: 'Радіус вписаного кола r (форма α зберігається)',
        matrixTitle: 'Порівняльна матриця трьох систем',
        colSector: 'Сектор',
        colArcSys: 'A. Дуга (φ / w_arc)',
        colSideSys: 'B. Сторона (s / P)',
        colAreaSys: 'C. Площа (S_k / S)',
        rowA: 'A ↔ a (|OB|)',
        rowB: 'B ↔ b (|OA|)',
        rowC: 'C ↔ c (|AB|)',
        bridgesTitle: 'Точні алгебраїчні й тригонометричні мости',
        lawCatalogTitle: 'Каталог і класифікація закономірностей (A–C)',
        chartShares: 'Частки (A vs B/C)',
        chartDefect: 'Дефект r²/S',
        chartAngles: 'Радіуси φ vs бісектриси ψ',
        chartDescShares: 'Суцільні: w_area ≡ w_side (a проти A, b проти B); штрих: w_arc (перетини w_A=w_a @34.4°)',
        chartDescDefect: 'Масштабний інваріант r²/S = w_a + w_b − w_c = 2·w_a·w_b (максимум 3−2√2 при α=45°)',
        chartDescAngles: 'Суцільні: кути радіусів φ_k; штрих: кути між відрізками до вершин ψ_k (ψ_C ≡ 135°)',
        tableTitle: 'Таблиця трьох систем (крок 5°, клік — перехід)',
      };
    }
    return {
      title: '09. Дуги–Стороны–Площади (Эксперимент 06)',
      subtitle: 'Стандартная нотация: a=|OB| против ∠A, b=|OA| против ∠B, c=|AB| против ∠C',
      alphaLabel: 'Угол формы α = ∠B',
      radiusLabel: 'Радиус вписанной окружности r (форма α сохраняется)',
      matrixTitle: 'Сравнительная матрица трёх систем распределения',
      colSector: 'Индекс',
      colArcSys: 'A. Дуга (φ / w_arc)',
      colSideSys: 'B. Сторона (s / P)',
      colAreaSys: 'C. Площадь (S_k / S)',
      rowA: 'A ↔ a (|OB|)',
      rowB: 'B ↔ b (|OA|)',
      rowC: 'C ↔ c (|AB|)',
      bridgesTitle: 'Проверенные межуровневые тождества и инварианты',
      lawCatalogTitle: 'Каталог и классификация закономерностей (A–C)',
      chartShares: 'Доли (A vs B/C)',
      chartDefect: 'Дефект r²/S',
      chartAngles: 'Радиусы φ vs биссектрисы ψ',
      chartDescShares: 'Сплошные: w_area ≡ w_side (a против A, b против B); штрих: w_arc (w_A=w_a при 34.4°)',
      chartDescDefect: 'Безразмерный инвариант r²/S = w_a + w_b − w_c = 2·w_a·w_b (пик 3−2√2 ≈ 17.16% при α=45°)',
      chartDescAngles: 'Сплошные: углы радиусов касания φ_k; штрих: углы отрезков к вершинам ψ_k (ψ_C ≡ 135°)',
      tableTitle: 'Сводная таблица 3 систем (шаг 5°, клик — перейти)',
    };
  }, [lang]);

  // Chart geometry
  const W = 440;
  const H = 165;
  const PAD = { l: 42, r: 16, t: 14, b: 26 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const xOfAlpha = (deg: number) => PAD.l + (deg / 90) * plotW;
  const yOfPct = (pct: number) => PAD.t + plotH - (pct / 55) * plotH;
  const yOfDefect = (val: number) => PAD.t + plotH - (val / 0.22) * plotH;
  const yOfDeg = (deg: number) => PAD.t + plotH - (deg / 180) * plotH;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-4 h-4 text-indigo-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{copy.title}</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{copy.subtitle}</p>
      </div>

      {/* Central Bridge Formula Strip */}
      <div className="bg-slate-50 rounded-lg border border-slate-200/80 px-3 py-2 text-center overflow-x-auto">
        <MathFormula tex="w^{\text{area}}_k = w^{\text{side}}_k = \frac{\sin\varphi_k}{\sum\sin\varphi}, \qquad S_a^2+S_b^2=S_c^2, \qquad S_a+S_b-S_c=r^2" />
      </div>

      {/* Interactive Controls */}
      <div className="space-y-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor="exp06-alpha-slider" className="font-semibold text-slate-700">
              {copy.alphaLabel}:{' '}
              <span className="font-mono tabular-nums text-slate-900">{alphaDeg.toFixed(2)}°</span>
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {PRESET_ALPHAS.map((preset) => (
                <button
                  key={preset.label}
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
            id="exp06-alpha-slider"
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

        <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="exp06-radius-slider" className="font-semibold text-slate-700">
              {copy.radiusLabel}:{' '}
              <span className="font-mono tabular-nums text-indigo-800">{r.toFixed(2)}</span>
            </label>
            <div className="flex items-center gap-1">
              {EXPERIMENT06_RADII.map((rv) => (
                <button
                  key={rv}
                  onClick={() => onChangeRadiusAndAlpha(rv, alphaDeg, true)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(r - rv) < 0.02
                      ? 'bg-indigo-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  r={rv}
                </button>
              ))}
            </div>
          </div>
          <input
            id="exp06-radius-slider"
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={Math.min(4, Math.max(0.5, r))}
            onChange={(e) => onChangeRadiusAndAlpha(parseFloat(e.target.value) || 1, alphaDeg, false)}
            onPointerUp={() => onChangeRadiusAndAlpha(r, alphaDeg, true)}
            className="w-full accent-indigo-700 cursor-pointer"
          />
        </div>
      </div>

      {/* Three-System Matrix */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-800">{copy.matrixTitle}</div>
        <div className="border border-slate-200/80 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-[11px] font-mono tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans">
              <tr>
                <th className="py-1.5 px-2 text-left">{copy.colSector}</th>
                <th className="py-1.5 px-2 text-right">{copy.colArcSys}</th>
                <th className="py-1.5 px-2 text-right">{copy.colSideSys}</th>
                <th className="py-1.5 px-2 text-right">{copy.colAreaSys}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-1.5 px-2 font-sans font-semibold text-blue-700">{copy.rowA}</td>
                <td className="py-1.5 px-2 text-right">
                  {pt.phiADeg.toFixed(1)}° · {(pt.arcShareA * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-right">
                  {pt.a.toFixed(2)} · {(pt.sideShareA * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-right font-semibold text-blue-700">
                  {pt.areaA.toFixed(2)} · {(pt.areaShareA * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans font-semibold text-emerald-700">{copy.rowB}</td>
                <td className="py-1.5 px-2 text-right">
                  {pt.phiBDeg.toFixed(1)}° · {(pt.arcShareB * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-right">
                  {pt.b.toFixed(2)} · {(pt.sideShareB * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-right font-semibold text-emerald-700">
                  {pt.areaB.toFixed(2)} · {(pt.areaShareB * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans font-semibold text-amber-800">{copy.rowC}</td>
                <td className="py-1.5 px-2 text-right">
                  90.0° · {(pt.arcShareC * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-right">
                  {pt.c.toFixed(2)} · {(pt.sideShareC * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-right font-semibold text-amber-800">
                  {pt.areaC.toFixed(2)} · {(pt.areaShareC * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Verified Bridge Identities */}
      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
        <div className="font-bold text-slate-900">{copy.bridgesTitle}</div>
        <div className="grid grid-cols-2 gap-2 font-mono tabular-nums text-[11px]">
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <div className="text-slate-500 font-sans">max |w_side − w_area|</div>
            <div className="font-bold text-slate-900 mt-0.5">{pt.sideAreaShareMaxDiff.toExponential(2)}</div>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <div className="text-slate-500 font-sans">|S_a² + S_b² − S_c²|</div>
            <div className="font-bold text-slate-900 mt-0.5">{pt.pythagoreanAreaResidual.toExponential(2)}</div>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <div className="text-slate-500 font-sans">S_a + S_b − S_c (= r²)</div>
            <div className="font-bold text-violet-800 mt-0.5">
              {(pt.areaA + pt.areaB - pt.areaC).toFixed(4)} (= {(r * r).toFixed(4)})
            </div>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <div className="text-slate-500 font-sans">r²/S (= 2·w_a·w_b)</div>
            <div className="font-bold text-violet-800 mt-0.5">
              {(pt.rSquaredOverS * 100).toFixed(2)}% (= {(2 * pt.areaShareA * pt.areaShareB * 100).toFixed(2)}%)
            </div>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <div className="text-slate-500 font-sans">(tan(φ_A/2)−1)(tan(φ_B/2)−1)</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {((pt.tanHalfPhiA - 1) * (pt.tanHalfPhiB - 1)).toFixed(6)}
            </div>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <div className="text-slate-500 font-sans">Отрезки |IA| / |IB| / |IO|</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {pt.vertexDistIA.toFixed(2)} / {pt.vertexDistIB.toFixed(2)} / {pt.vertexDistIO.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Comparison SVG Charts */}
      <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-2">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
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
            onClick={() => setChartMode('defect')}
            className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
              chartMode === 'defect'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.chartDefect}
          </button>
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
        </div>

        <div className="text-[11px] text-slate-500">
          {chartMode === 'shares'
            ? copy.chartDescShares
            : chartMode === 'defect'
              ? copy.chartDescDefect
              : copy.chartDescAngles}
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
              <text x={xOfAlpha(deg)} y={H - 8} textAnchor="middle" className="text-[9px] font-mono fill-slate-500">
                {deg}°
              </text>
            </g>
          ))}

          {chartMode === 'shares' && (
            <>
              {[0, 15, 25, 37.5, 50].map((yv) => (
                <g key={`ys-${yv}`}>
                  <line x1={PAD.l} y1={yOfPct(yv)} x2={W - PAD.r} y2={yOfPct(yv)} stroke="#f1f5f9" />
                  <text x={PAD.l - 5} y={yOfPct(yv) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                    {yv}%
                  </text>
                </g>
              ))}
              {/* Solid area/side shares */}
              <path
                d={finePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfPct(p.areaShareA * 100).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.1"
              />
              <path
                d={finePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfPct(p.areaShareB * 100).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#059669"
                strokeWidth="2.1"
              />
              <path
                d={finePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfPct(p.areaShareC * 100).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.3"
              />
              {/* Dashed arc shares */}
              <line x1={xOfAlpha(0)} y1={yOfPct(25)} x2={xOfAlpha(90)} y2={yOfPct(50)} stroke="#2563eb" strokeWidth="1.7" strokeDasharray="4 3" />
              <line x1={xOfAlpha(0)} y1={yOfPct(50)} x2={xOfAlpha(90)} y2={yOfPct(25)} stroke="#059669" strokeWidth="1.7" strokeDasharray="4 3" />
              <line x1={xOfAlpha(0)} y1={yOfPct(25)} x2={xOfAlpha(90)} y2={yOfPct(25)} stroke="#d97706" strokeWidth="1.7" strokeDasharray="4 3" />

              <circle cx={xOfAlpha(alphaDeg)} cy={yOfPct(pt.areaShareC * 100)} r="3.8" fill="#d97706" stroke="#fff" strokeWidth="1.2" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfPct(pt.arcShareC * 100)} r="3.5" fill="#fff" stroke="#d97706" strokeWidth="1.8" />
            </>
          )}

          {chartMode === 'defect' && (
            <>
              {[0, 0.05, 0.1, 0.15, 0.2].map((dv) => (
                <g key={`yd-${dv}`}>
                  <line x1={PAD.l} y1={yOfDefect(dv)} x2={W - PAD.r} y2={yOfDefect(dv)} stroke="#f1f5f9" />
                  <text x={PAD.l - 5} y={yOfDefect(dv) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                    {dv.toFixed(2)}
                  </text>
                </g>
              ))}
              <path
                d={finePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfAlpha(p.alphaDeg).toFixed(1)} ${yOfDefect(p.rSquaredOverS).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.3"
              />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfDefect(pt.rSquaredOverS)} r="4" fill="#7c3aed" stroke="#fff" strokeWidth="1.3" />
            </>
          )}

          {chartMode === 'angles' && (
            <>
              {[0, 45, 90, 135, 180].map((yv) => (
                <g key={`ya-${yv}`}>
                  <line x1={PAD.l} y1={yOfDeg(yv)} x2={W - PAD.r} y2={yOfDeg(yv)} stroke="#f1f5f9" />
                  <text x={PAD.l - 5} y={yOfDeg(yv) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                    {yv}°
                  </text>
                </g>
              ))}
              {/* Solid phi_k */}
              <line x1={xOfAlpha(0)} y1={yOfDeg(90)} x2={xOfAlpha(90)} y2={yOfDeg(180)} stroke="#2563eb" strokeWidth="2.1" />
              <line x1={xOfAlpha(0)} y1={yOfDeg(180)} x2={xOfAlpha(90)} y2={yOfDeg(90)} stroke="#059669" strokeWidth="2.1" />
              <line x1={xOfAlpha(0)} y1={yOfDeg(90)} x2={xOfAlpha(90)} y2={yOfDeg(90)} stroke="#d97706" strokeWidth="2.1" />
              {/* Dashed psi_k */}
              <line x1={xOfAlpha(0)} y1={yOfDeg(135)} x2={xOfAlpha(90)} y2={yOfDeg(90)} stroke="#2563eb" strokeWidth="1.6" strokeDasharray="4 3" />
              <line x1={xOfAlpha(0)} y1={yOfDeg(90)} x2={xOfAlpha(90)} y2={yOfDeg(135)} stroke="#059669" strokeWidth="1.6" strokeDasharray="4 3" />
              <line x1={xOfAlpha(0)} y1={yOfDeg(135)} x2={xOfAlpha(90)} y2={yOfDeg(135)} stroke="#d97706" strokeWidth="1.6" strokeDasharray="4 3" />
            </>
          )}

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

      {/* Law Classification Catalog (A, B, C) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-800">{copy.lawCatalogTitle}</div>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {EXPERIMENT06_LAWS_CATALOG.map((law) => (
            <div key={law.id} className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">
                  {law.id}. {law.title}
                </span>
                <span className="text-[11px] font-mono font-semibold text-indigo-700 shrink-0">
                  Кат. {law.category}
                </span>
              </div>
              <div className="bg-white rounded border border-slate-200/70 px-2 py-1 overflow-x-auto">
                <MathFormula tex={law.formulaTex} />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{law.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-deg Interactive Cross-System Table */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-800">{copy.tableTitle}</div>
        <div className="max-h-52 overflow-y-auto border border-slate-200/80 rounded-lg bg-white">
          <table className="w-full text-[11px] font-mono tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
              <tr>
                <th className="py-1.5 px-2 text-left">α</th>
                <th className="py-1.5 px-2 text-right">w_arc (A/B/C)</th>
                <th className="py-1.5 px-2 text-right">w_area≡w_side (a/b/c)</th>
                <th className="py-1.5 px-2 text-right">r²/S</th>
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
                      isSelected ? 'bg-indigo-50 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-1 px-2 text-slate-900">{row.alphaDeg.toFixed(0)}°</td>
                    <td className="py-1 px-2 text-right text-slate-700">
                      {(row.arcShareA * 100).toFixed(1)} / {(row.arcShareB * 100).toFixed(1)} / 25.0%
                    </td>
                    <td className="py-1 px-2 text-right text-slate-800">
                      {(row.areaShareA * 100).toFixed(1)} / {(row.areaShareB * 100).toFixed(1)} /{' '}
                      {(row.areaShareC * 100).toFixed(1)}%
                    </td>
                    <td className="py-1 px-2 text-right text-violet-800">
                      {(row.rSquaredOverS * 100).toFixed(2)}%
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
