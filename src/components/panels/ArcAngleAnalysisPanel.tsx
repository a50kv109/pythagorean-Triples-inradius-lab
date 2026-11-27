/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { LanguageCode } from '../../i18n/translations.ts';
import {
  ArcAngleZoneSpec,
  EXPERIMENT04_RADII,
  EXPERIMENT04_RESEARCH_ZONES,
  computeArcAnglePoint,
  computeZoneSummaries,
  getInteriorAnglesDeg,
} from '../../math/experiments/arcAngleParametricAnalysis.ts';
import { MathFormula } from '../common/MathFormula.tsx';
import { Compass } from 'lucide-react';

interface ArcAngleAnalysisPanelProps {
  calc: FourCirclesCalculations;
  alphaDeg: number;
  selectedZoneId: string | null;
  onSelectZoneId: (zoneId: string | null) => void;
  onChangeRadiusAndAlpha: (newR: number, newAlphaDeg: number, recordHistory?: boolean) => void;
  lang?: LanguageCode;
}

type ChartMode = 'angles' | 'arc_length' | 'ratio';

const ALPHA_PRESETS = [15, 30, 45, 60, 75];
const DEG2RAD = Math.PI / 180;

export const ArcAngleAnalysisPanel: React.FC<ArcAngleAnalysisPanelProps> = ({
  calc,
  alphaDeg,
  selectedZoneId,
  onSelectZoneId,
  onChangeRadiusAndAlpha,
  lang = 'ru',
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('angles');

  const r = calc.incircle.radius;
  const alphaRad = alphaDeg * DEG2RAD;
  const currentArcLen = r * alphaRad;
  const angleA = calc.triangle.alphaDeg;
  const angleB = calc.triangle.betaDeg;
  const ratioBA = calc.triangle.b / calc.triangle.a;

  const selectedZone: ArcAngleZoneSpec | null = useMemo(
    () => EXPERIMENT04_RESEARCH_ZONES.find((z) => z.id === selectedZoneId) ?? null,
    [selectedZoneId]
  );

  const selectedZoneSummary = useMemo(() => {
    if (!selectedZone) return null;
    return computeZoneSummaries([r], [selectedZone])[0] ?? null;
  }, [r, selectedZone]);

  const fiveDegRows = useMemo(() => {
    const angles = getInteriorAnglesDeg(5);
    return angles.map((deg, idx) => computeArcAnglePoint(r, deg, idx + 1));
  }, [r]);

  const copy = useMemo(() => {
    if (lang === 'en') {
      return {
        title: '07. Arc–Angle Parametric Analysis (Experiment 04)',
        subtitle: 'Coupled arc length L, leg-hypotenuse angles A & B, and scale separation',
        radiusLabel: 'Incircle radius r',
        alphaLabel: 'Central tangency angle α (0° < α < 90°)',
        zonesLabel: 'Research arc zones (5° grid)',
        zoneAll: 'All (5°–85°)',
        zoneHeader: 'Active zone summary',
        zoneArcLen: 'Arc span L',
        zoneRatio: 'Ratio b/a',
        angleALabel: 'Angle A (leg OA / hyp)',
        angleBLabel: 'Angle B (leg OB / hyp)',
        arcLenLabel: 'Arc length L = r·α',
        ratioLabel: 'Leg ratio b/a = cot α',
        sumCheckLabel: 'A + B',
        chartTabAngles: 'A & B(α)',
        chartTabArc: 'L(α) · r=1,2,3',
        chartTabRatio: 'b/a(α)',
        chartDescAngles: 'Complementary linear laws A = 90° − α and B = α (scale-invariant)',
        chartDescArc: 'Arc length L(α) = r·α scales linearly with radius r = 1, 2, 3',
        chartDescRatio: 'Shape invariant t = b/a = cot α (symmetry point at α = 45°, b/a = 1)',
        tableTitle: '5°-step table at current radius (click row to inspect)',
        colAlpha: 'α',
        colL: 'L',
        colA: '∠A',
        colB: '∠B',
        colSides: 'a / b / c',
      };
    }
    if (lang === 'uk') {
      return {
        title: '07. Аналіз дуги та кутів (Експеримент 04)',
        subtitle: 'Зв’язок довжини дуги L, кутів A і B при катетах та відокремлення масштабу',
        radiusLabel: 'Радіус вписаного кола r',
        alphaLabel: 'Центральний кут дотику α (0° < α < 90°)',
        zonesLabel: 'Дослідницькі діапазони дуги',
        zoneAll: 'Уся (5°–85°)',
        zoneHeader: 'Параметри обраного діапазону',
        zoneArcLen: 'Діапазон дуги L',
        zoneRatio: 'Відношення b/a',
        angleALabel: 'Кут A (катет OA / гіпот.)',
        angleBLabel: 'Кут B (катет OB / гіпот.)',
        arcLenLabel: 'Довжина дуги L = r·α',
        ratioLabel: 'Відношення b/a = cot α',
        sumCheckLabel: 'A + B',
        chartTabAngles: 'A і B(α)',
        chartTabArc: 'L(α) · r=1,2,3',
        chartTabRatio: 'b/a(α)',
        chartDescAngles: 'Лінійна додатковість A = 90° − α і B = α (не залежить від r)',
        chartDescArc: 'Довжина дуги L(α) = r·α пропорційна радіусу r = 1, 2, 3',
        chartDescRatio: 'Інваріант форми t = b/a = cot α (симетрія α = 45°, b/a = 1)',
        tableTitle: 'Таблиця з кроком 5° для поточного r (клік — перехід)',
        colAlpha: 'α',
        colL: 'L',
        colA: '∠A',
        colB: '∠B',
        colSides: 'a / b / c',
      };
    }
    return {
      title: '07. Анализ дуги и углов (Эксперимент 04)',
      subtitle: 'Связь длины дуги L, углов A и B при катетах и разделение формы и масштаба',
      radiusLabel: 'Радиус вписанной окружности r',
      alphaLabel: 'Центральный угол касания α (0° < α < 90°)',
      zonesLabel: 'Исследовательские диапазоны дуги',
      zoneAll: 'Вся (5°–85°)',
      zoneHeader: 'Сводка по выбранному диапазону',
      zoneArcLen: 'Диапазон длины L',
      zoneRatio: 'Отношение b/a',
      angleALabel: 'Угол A (катет OA / гипот.)',
      angleBLabel: 'Угол B (катет OB / гипот.)',
      arcLenLabel: 'Длина дуги L = r·α',
      ratioLabel: 'Отношение b/a = cot α',
      sumCheckLabel: 'A + B',
      chartTabAngles: 'A и B(α)',
      chartTabArc: 'L(α) · r=1,2,3',
      chartTabRatio: 'b/a(α)',
      chartDescAngles: 'Взаимно дополнительные линейные функции A = 90° − α и B = α (инвариант масштаба)',
      chartDescArc: 'Длина дуги L(α) = r·α растёт линейно с радиусом r = 1, 2, 3',
      chartDescRatio: 'Инвариант формы t = b/a = cot α (точка симметрии α = 45°, b/a = 1)',
      tableTitle: 'Таблица шага 5° для текущего радиуса r (клик — перейти)',
      colAlpha: 'α',
      colL: 'L',
      colA: '∠A',
      colB: '∠B',
      colSides: 'a / b / c',
    };
  }, [lang]);

  const handleSelectZone = (zone: ArcAngleZoneSpec | null) => {
    if (!zone) {
      onSelectZoneId(null);
      return;
    }
    onSelectZoneId(zone.id);
    if (alphaDeg < zone.alphaMinDeg || alphaDeg > zone.alphaMaxDeg) {
      const midAlpha = (zone.alphaMinDeg + zone.alphaMaxDeg) / 2;
      onChangeRadiusAndAlpha(r, midAlpha, true);
    }
  };

  // Interactive SVG Chart dimensions
  const W = 440;
  const H = 165;
  const PAD = { l: 42, r: 16, t: 14, b: 26 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const xOfAlpha = (deg: number) => PAD.l + (deg / 90) * plotW;

  const yOfDeg = (deg: number) => PAD.t + plotH - (deg / 90) * plotH;
  const yOfL = (L: number) => PAD.t + plotH - (Math.min(5, L) / 5) * plotH;
  const yOfRatio = (val: number) => PAD.t + plotH - (Math.min(12, val) / 12) * plotH;

  const ratioCurvePath = useMemo(() => {
    const pts: string[] = [];
    for (let deg = 5; deg <= 85; deg += 1) {
      const val = 1 / Math.tan(deg * DEG2RAD);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${xOfAlpha(deg).toFixed(1)} ${yOfRatio(val).toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{copy.title}</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{copy.subtitle}</p>
      </div>

      {/* Formula Strip */}
      <div className="bg-slate-50 rounded-lg border border-slate-200/80 px-3 py-2 text-center overflow-x-auto">
        <MathFormula tex="\angle B = \alpha, \quad \angle A = 90^\circ - \alpha, \quad L = r\alpha, \quad \frac{b}{a} = \cot\alpha = \tan A" />
      </div>

      {/* Interactive Controls */}
      <div className="space-y-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
        {/* 1. Incircle Radius r */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="exp04-radius-slider" className="font-semibold text-slate-700">
              {copy.radiusLabel}:{' '}
              <span className="font-mono tabular-nums text-sky-800">{r.toFixed(2)}</span>
            </label>
            <div className="flex items-center gap-1">
              {EXPERIMENT04_RADII.map((rv) => (
                <button
                  key={rv}
                  onClick={() => onChangeRadiusAndAlpha(rv, alphaDeg, true)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(r - rv) < 0.02
                      ? 'bg-sky-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  r={rv}
                </button>
              ))}
            </div>
          </div>
          <input
            id="exp04-radius-slider"
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={Math.min(4, Math.max(0.5, r))}
            onChange={(e) => onChangeRadiusAndAlpha(parseFloat(e.target.value) || 1, alphaDeg, false)}
            onPointerUp={() => onChangeRadiusAndAlpha(r, alphaDeg, true)}
            className="w-full accent-sky-700 cursor-pointer"
          />
        </div>

        {/* 2. Central Angle alpha */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor="exp04-alpha-slider" className="font-semibold text-slate-700">
              {copy.alphaLabel}:{' '}
              <span className="font-mono tabular-nums text-slate-900">{alphaDeg.toFixed(1)}°</span>
            </label>
            <div className="flex items-center gap-1">
              {ALPHA_PRESETS.map((pv) => (
                <button
                  key={pv}
                  onClick={() => onChangeRadiusAndAlpha(r, pv, true)}
                  className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(alphaDeg - pv) < 0.25
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
            id="exp04-alpha-slider"
            type="range"
            min="5"
            max="85"
            step="0.5"
            value={Math.min(85, Math.max(5, alphaDeg))}
            onChange={(e) => onChangeRadiusAndAlpha(r, parseFloat(e.target.value) || 45, false)}
            onPointerUp={() => onChangeRadiusAndAlpha(r, alphaDeg, true)}
            className="w-full accent-slate-800 cursor-pointer"
          />
        </div>

        {/* 3. Research Arc Zones Selector */}
        <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
          <div className="text-xs font-semibold text-slate-700">{copy.zonesLabel}</div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => handleSelectZone(null)}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                selectedZoneId === null
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {copy.zoneAll}
            </button>
            {EXPERIMENT04_RESEARCH_ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => handleSelectZone(z)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                  selectedZoneId === z.id
                    ? 'bg-sky-700 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Angle & Arc Readout */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.angleALabel}</div>
          <div className="font-mono tabular-nums font-bold text-blue-700 text-base mt-0.5">
            {angleA.toFixed(2)}°
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.angleBLabel}</div>
          <div className="font-mono tabular-nums font-bold text-emerald-700 text-base mt-0.5">
            {angleB.toFixed(2)}°
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.arcLenLabel}</div>
          <div className="font-mono tabular-nums font-bold text-amber-800 text-sm mt-0.5">
            {currentArcLen.toFixed(4)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="text-[11px] text-slate-500">{copy.ratioLabel}</div>
          <div className="font-mono tabular-nums font-semibold text-slate-900 text-sm mt-0.5">
            {ratioBA.toFixed(4)}{' '}
            <span className="text-[11px] text-slate-500 font-normal">
              ({copy.sumCheckLabel}={(angleA + angleB).toFixed(1)}°)
            </span>
          </div>
        </div>
      </div>

      {/* Active Zone Range Card (when a research zone is selected) */}
      {selectedZoneSummary && (
        <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/50 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>
              {copy.zoneHeader}: {selectedZoneSummary.arcIntervalLabel}
            </span>
            <span className="font-mono text-sky-800">r = {r.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums text-[11px]">
            <div className="text-blue-800">
              ∠A: {selectedZoneSummary.angleAMinDeg.toFixed(0)}°–{selectedZoneSummary.angleAMaxDeg.toFixed(0)}°
            </div>
            <div className="text-emerald-800">
              ∠B: {selectedZoneSummary.angleBMinDeg.toFixed(0)}°–{selectedZoneSummary.angleBMaxDeg.toFixed(0)}°
            </div>
            <div className="text-amber-900">
              {copy.zoneArcLen}: {selectedZoneSummary.arcLengthMin.toFixed(4)}–
              {selectedZoneSummary.arcLengthMax.toFixed(4)} (ΔL={selectedZoneSummary.arcLengthDelta.toFixed(4)})
            </div>
            <div className="text-slate-700">
              {copy.zoneRatio}: {selectedZoneSummary.ratioBAMin.toFixed(3)}–
              {selectedZoneSummary.ratioBAMax.toFixed(3)}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Parametric Charts */}
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
            {copy.chartTabAngles}
          </button>
          <button
            onClick={() => setChartMode('arc_length')}
            className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
              chartMode === 'arc_length'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.chartTabArc}
          </button>
          <button
            onClick={() => setChartMode('ratio')}
            className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
              chartMode === 'ratio'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.chartTabRatio}
          </button>
        </div>

        <div className="text-[11px] text-slate-500">
          {chartMode === 'angles'
            ? copy.chartDescAngles
            : chartMode === 'arc_length'
              ? copy.chartDescArc
              : copy.chartDescRatio}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Selected Zone Highlight Band */}
          {selectedZone && (
            <rect
              x={xOfAlpha(selectedZone.alphaMinDeg)}
              y={PAD.t}
              width={xOfAlpha(selectedZone.alphaMaxDeg) - xOfAlpha(selectedZone.alphaMinDeg)}
              height={plotH}
              fill="#0ea5e9"
              fillOpacity="0.14"
            />
          )}

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

          {/* X-axis ticks (0, 15, 30, 45, 60, 75, 90) */}
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

          {/* Mode-specific curves */}
          {chartMode === 'angles' && (
            <>
              {[0, 30, 45, 60, 90].map((yv) => (
                <g key={`ya-${yv}`}>
                  <line
                    x1={PAD.l}
                    y1={yOfDeg(yv)}
                    x2={W - PAD.r}
                    y2={yOfDeg(yv)}
                    stroke="#f1f5f9"
                  />
                  <text
                    x={PAD.l - 5}
                    y={yOfDeg(yv) + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-500"
                  >
                    {yv}°
                  </text>
                </g>
              ))}
              {/* Angle A = 90 - alpha */}
              <line
                x1={xOfAlpha(0)}
                y1={yOfDeg(90)}
                x2={xOfAlpha(90)}
                y2={yOfDeg(0)}
                stroke="#2563eb"
                strokeWidth="2.2"
              />
              {/* Angle B = alpha */}
              <line
                x1={xOfAlpha(0)}
                y1={yOfDeg(0)}
                x2={xOfAlpha(90)}
                y2={yOfDeg(90)}
                stroke="#059669"
                strokeWidth="2.2"
              />
              {/* Live markers */}
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfDeg(angleA)} r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.3" />
              <circle cx={xOfAlpha(alphaDeg)} cy={yOfDeg(angleB)} r="4" fill="#059669" stroke="#fff" strokeWidth="1.3" />
            </>
          )}

          {chartMode === 'arc_length' && (
            <>
              {[0, 1, 2, 3, 4, 5].map((lv) => (
                <g key={`yl-${lv}`}>
                  <line
                    x1={PAD.l}
                    y1={yOfL(lv)}
                    x2={W - PAD.r}
                    y2={yOfL(lv)}
                    stroke="#f1f5f9"
                  />
                  <text
                    x={PAD.l - 5}
                    y={yOfL(lv) + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-500"
                  >
                    {lv}
                  </text>
                </g>
              ))}
              {[
                { rv: 1, color: '#0284c7' },
                { rv: 2, color: '#d97706' },
                { rv: 3, color: '#7c3aed' },
              ].map((item) => (
                <g key={`arc-r-${item.rv}`}>
                  <line
                    x1={xOfAlpha(0)}
                    y1={yOfL(0)}
                    x2={xOfAlpha(90)}
                    y2={yOfL((item.rv * Math.PI) / 2)}
                    stroke={item.color}
                    strokeWidth="2"
                  />
                  <text
                    x={xOfAlpha(90) - 4}
                    y={yOfL((item.rv * Math.PI) / 2) - 4}
                    textAnchor="end"
                    className="text-[9px] font-mono font-semibold"
                    fill={item.color}
                  >
                    r={item.rv}
                  </text>
                </g>
              ))}
              <circle
                cx={xOfAlpha(alphaDeg)}
                cy={yOfL(currentArcLen)}
                r="4.2"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="1.4"
              />
            </>
          )}

          {chartMode === 'ratio' && (
            <>
              {[0, 1, 3, 6, 9, 12].map((tv) => (
                <g key={`yt-${tv}`}>
                  <line
                    x1={PAD.l}
                    y1={yOfRatio(tv)}
                    x2={W - PAD.r}
                    y2={yOfRatio(tv)}
                    stroke={tv === 1 ? '#cbd5e1' : '#f1f5f9'}
                    strokeDasharray={tv === 1 ? '3 3' : undefined}
                  />
                  <text
                    x={PAD.l - 5}
                    y={yOfRatio(tv) + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-500"
                  >
                    {tv}
                  </text>
                </g>
              ))}
              <path d={ratioCurvePath} fill="none" stroke="#dc2626" strokeWidth="2.2" />
              <circle
                cx={xOfAlpha(alphaDeg)}
                cy={yOfRatio(ratioBA)}
                r="4.2"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="1.4"
              />
            </>
          )}

          {/* Live vertical guide at alphaDeg */}
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

      {/* Interactive 5-Degree Table */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-800">{copy.tableTitle}</div>
        <div className="max-h-60 overflow-y-auto border border-slate-200/80 rounded-lg bg-white">
          <table className="w-full text-[11px] font-mono tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
              <tr>
                <th className="py-1.5 px-2 text-left">{copy.colAlpha}</th>
                <th className="py-1.5 px-2 text-right">{copy.colL}</th>
                <th className="py-1.5 px-2 text-right text-blue-700">{copy.colA}</th>
                <th className="py-1.5 px-2 text-right text-emerald-700">{copy.colB}</th>
                <th className="py-1.5 px-2 text-right">{copy.colSides}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fiveDegRows.map((row) => {
                const isSelected = Math.abs(row.alphaDeg - alphaDeg) < 0.25;
                const inZone =
                  selectedZone !== null &&
                  row.alphaDeg >= selectedZone.alphaMinDeg - 1e-6 &&
                  row.alphaDeg <= selectedZone.alphaMaxDeg + 1e-6;
                return (
                  <tr
                    key={row.alphaDeg}
                    onClick={() => onChangeRadiusAndAlpha(r, row.alphaDeg, true)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50 font-semibold'
                        : inZone
                          ? 'bg-sky-50/70 hover:bg-sky-100/70'
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-1 px-2 text-slate-900">{row.alphaDeg.toFixed(0)}°</td>
                    <td className="py-1 px-2 text-right text-slate-700">{row.arcLength.toFixed(4)}</td>
                    <td className="py-1 px-2 text-right text-blue-700">{row.angleADeg.toFixed(1)}°</td>
                    <td className="py-1 px-2 text-right text-emerald-700">{row.angleBDeg.toFixed(1)}°</td>
                    <td className="py-1 px-2 text-right text-slate-800">
                      {row.a.toFixed(2)} / {row.b.toFixed(2)} / {row.c.toFixed(2)}
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
