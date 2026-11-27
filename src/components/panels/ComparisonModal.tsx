/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { calculateFourCircles } from '../../math/FourCirclesModel.ts';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';
import { X, ArrowLeftRight, BookmarkPlus } from 'lucide-react';

interface ComparisonModalProps {
  currentCalc: FourCirclesCalculations;
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (a: number, b: number) => void;
  t?: Translations;
}

const MiniFourCirclesPreview: React.FC<{
  calc: FourCirclesCalculations;
  label: string;
  accent: string;
}> = ({ calc, label, accent }) => {
  const { triangle, squareA, squareB, squareC, circleA, circleB, circleC, incircle, circumcircle } = calc;
  const minX = -triangle.a - 0.8;
  const maxX = triangle.b + triangle.a + 0.8;
  const minY = -triangle.b - 0.8;
  const maxY = triangle.a + triangle.b + 0.8;
  const span = Math.max(maxX - minX, maxY - minY, 6);
  const scale = 150 / span;

  const ox = 85 - ((minX + maxX) / 2) * scale;
  const oy = 85 + ((minY + maxY) / 2) * scale;
  const p = (pt: { x: number; y: number }) => `${ox + pt.x * scale},${oy - pt.y * scale}`;
  const sx = (pt: { x: number; y: number }) => ox + pt.x * scale;
  const sy = (pt: { x: number; y: number }) => oy - pt.y * scale;

  return (
    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-2.5 flex flex-col items-center">
      <span className={`text-[11px] font-bold mb-1 ${accent}`}>{label}</span>
      <svg viewBox="0 0 170 170" className="w-40 h-40 bg-white rounded-lg border border-slate-100">
        {/* Squares Qa, Qb, Qc */}
        <polygon
          points={`${p(squareA.O)} ${p(squareA.legVertex)} ${p(squareA.outerVertex)} ${p(squareA.baseVertex)}`}
          fill="#2563eb"
          fillOpacity="0.06"
          stroke="#3b82f6"
          strokeWidth="1"
        />
        <polygon
          points={`${p(squareB.O)} ${p(squareB.legVertex)} ${p(squareB.outerVertex)} ${p(squareB.baseVertex)}`}
          fill="#059669"
          fillOpacity="0.06"
          stroke="#10b981"
          strokeWidth="1"
        />
        <polygon
          points={`${p(squareC.A)} ${p(squareC.B)} ${p(squareC.Bc)} ${p(squareC.Ac)}`}
          fill="#e11d48"
          fillOpacity="0.06"
          stroke="#f43f5e"
          strokeWidth="1"
        />

        {/* Circles Ka, Kb, Kc */}
        <circle
          cx={sx(circleA.center)}
          cy={sy(circleA.center)}
          r={circleA.radius * scale}
          fill="#3b82f6"
          fillOpacity="0.18"
          stroke="#2563eb"
          strokeWidth="1.2"
        />
        <circle
          cx={sx(circleB.center)}
          cy={sy(circleB.center)}
          r={circleB.radius * scale}
          fill="#10b981"
          fillOpacity="0.18"
          stroke="#059669"
          strokeWidth="1.2"
        />
        <circle
          cx={sx(circleC.center)}
          cy={sy(circleC.center)}
          r={circleC.radius * scale}
          fill="#f43f5e"
          fillOpacity="0.16"
          stroke="#e11d48"
          strokeWidth="1.2"
        />

        {/* Triangle */}
        <polygon
          points={`${p(triangle.O)} ${p(triangle.A)} ${p(triangle.B)}`}
          fill="#3b82f6"
          fillOpacity="0.08"
          stroke="#1e293b"
          strokeWidth="1.3"
        />

        {/* Thales Circumcircle Ko */}
        <circle
          cx={sx(circumcircle.center)}
          cy={sy(circumcircle.center)}
          r={circumcircle.radius * scale}
          fill="#7c3aed"
          fillOpacity="0.06"
          stroke="#7c3aed"
          strokeWidth="1.2"
          strokeDasharray="3,2"
        />

        {/* Incircle Ki */}
        <circle
          cx={sx(incircle.center)}
          cy={sy(incircle.center)}
          r={incircle.radius * scale}
          fill="#f59e0b"
          fillOpacity="0.3"
          stroke="#b45309"
          strokeWidth="1.4"
        />
      </svg>
    </div>
  );
};

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  currentCalc,
  isOpen,
  onClose,
  onApplyConfig,
  t = TRANSLATIONS.ru,
}) => {
  const [savedConfig, setSavedConfig] = useState<{ a: number; b: number }>({
    a: 4,
    b: 4,
  });

  if (!isOpen) return null;

  const config1 = calculateFourCircles(savedConfig.a, savedConfig.b);
  const config2 = currentCalc;

  const handleCaptureCurrent = () => {
    setSavedConfig({
      a: currentCalc.triangle.a,
      b: currentCalc.triangle.b,
    });
  };

  const metricsToCompare = [
    { label: t.compareModal.metrics.legA, v1: config1.triangle.a.toFixed(2), v2: config2.triangle.a.toFixed(2) },
    { label: t.compareModal.metrics.legB, v1: config1.triangle.b.toFixed(2), v2: config2.triangle.b.toFixed(2) },
    { label: t.compareModal.metrics.hypC, v1: config1.triangle.c.toFixed(4), v2: config2.triangle.c.toFixed(4) },
    { label: t.compareModal.metrics.inradiusR, v1: config1.incircle.radius.toFixed(4), v2: config2.incircle.radius.toFixed(4) },
    { label: t.compareModal.metrics.radiusRo, v1: config1.circumcircle.radius.toFixed(4), v2: config2.circumcircle.radius.toFixed(4) },
    { label: t.compareModal.metrics.areaKa, v1: config1.circleA.area.toFixed(4), v2: config2.circleA.area.toFixed(4) },
    { label: t.compareModal.metrics.areaKb, v1: config1.circleB.area.toFixed(4), v2: config2.circleB.area.toFixed(4) },
    { label: t.compareModal.metrics.areaKc, v1: config1.circleC.area.toFixed(4), v2: config2.circleC.area.toFixed(4) },
    { label: t.compareModal.metrics.areaKo, v1: config1.circumcircle.area.toFixed(4), v2: config2.circumcircle.area.toFixed(4) },
    { label: t.compareModal.metrics.areaKi, v1: config1.incircle.area.toFixed(4), v2: config2.incircle.area.toFixed(4) },
    { label: '√K_a + √K_b', v1: config1.sqrtSumLegs.toFixed(5), v2: config2.sqrtSumLegs.toFixed(5) },
    { label: '√K_c + √K_i', v1: config1.sqrtSumHypAndIn.toFixed(5), v2: config2.sqrtSumHypAndIn.toFixed(5) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.compareModal.title}</h3>
            <p className="text-xs text-slate-500">
              {t.compareModal.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleCaptureCurrent}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <BookmarkPlus className="w-4 h-4" /> {t.compareModal.captureBtn}
            </button>

            <button
              onClick={() => onApplyConfig(savedConfig.a, savedConfig.b)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> {t.compareModal.loadBtn}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <MiniFourCirclesPreview
              calc={config1}
              label={`${t.compareModal.config1} (a=${savedConfig.a}, b=${savedConfig.b})`}
              accent="text-slate-700"
            />
            <MiniFourCirclesPreview
              calc={config2}
              label={`${t.compareModal.config2} (a=${config2.triangle.a}, b=${config2.triangle.b})`}
              accent="text-indigo-700"
            />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-4 text-left">{t.compareModal.colQuantity}</th>
                  <th className="py-2 px-4 text-right bg-slate-100/50">
                    {t.compareModal.colConf1} (a={savedConfig.a}, b={savedConfig.b})
                  </th>
                  <th className="py-2 px-4 text-right text-indigo-700 bg-indigo-50/40">
                    {t.compareModal.colConf2} (a={config2.triangle.a}, b={config2.triangle.b})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {metricsToCompare.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-4 font-sans font-medium text-slate-700">{m.label}</td>
                    <td className="py-1.5 px-4 text-right text-slate-600 bg-slate-50/30">{m.v1}</td>
                    <td className="py-1.5 px-4 text-right font-bold text-indigo-900 bg-indigo-50/20">{m.v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            {t.actions.close}
          </button>
        </div>
      </div>
    </div>
  );
};
