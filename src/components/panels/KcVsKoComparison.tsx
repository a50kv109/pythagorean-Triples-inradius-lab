/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { Translations } from '../../i18n/translations.ts';
import { formatPoint } from '../../geometry/transforms.ts';
import { CheckCircle2, ArrowLeftRight } from 'lucide-react';

interface KcVsKoComparisonProps {
  calc: FourCirclesCalculations;
  t: Translations;
}

export const KcVsKoComparison: React.FC<KcVsKoComparisonProps> = ({ calc, t }) => {
  const { circleC, circumcircle } = calc;
  const kcPeri = Math.PI * circleC.diameter;
  const areaDiffAbs = Math.abs(circumcircle.areaDiffWithKc);
  const kcVsKo = t.panel.kcVsKo;

  const rows = [
    {
      label: kcVsKo.rowRole,
      kc: kcVsKo.roleKc,
      ko: kcVsKo.roleKo,
      isText: true,
    },
    {
      label: kcVsKo.rowCenter,
      kc: `O_c = ${formatPoint(circleC.center)}`,
      ko: `O_o = ${formatPoint(circumcircle.center)}`,
      isText: false,
      highlightDiff: true,
    },
    {
      label: kcVsKo.rowDiameter,
      kc: `c = ${circleC.diameter.toFixed(4)}`,
      ko: `D_o = ${circumcircle.diameter.toFixed(4)}`,
      isText: false,
    },
    {
      label: kcVsKo.rowRadius,
      kc: `R_c = ${circleC.radius.toFixed(4)}`,
      ko: `R_o = ${circumcircle.radius.toFixed(4)}`,
      isText: false,
    },
    {
      label: kcVsKo.rowArea,
      kc: `K_c = ${circleC.area.toFixed(4)}`,
      ko: `K_o = ${circumcircle.area.toFixed(4)}`,
      isText: false,
    },
    {
      label: kcVsKo.rowCircumference,
      kc: `L_c = ${kcPeri.toFixed(4)}`,
      ko: `L_o = ${circumcircle.circumference.toFixed(4)}`,
      isText: false,
    },
    {
      label: kcVsKo.rowVertices,
      kc: kcVsKo.verticesKc,
      ko: kcVsKo.verticesKo,
      isText: true,
    },
  ];

  return (
    <div className="space-y-2.5 pt-2 border-t border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600" />
          {kcVsKo.title}
        </span>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {kcVsKo.badgeEq}
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-violet-700">{kcVsKo.badgeDiffCenter}</span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-1.5 px-2.5 text-left">{kcVsKo.colParam}</th>
              <th className="py-1.5 px-2.5 text-right text-rose-700 font-mono">K_c</th>
              <th className="py-1.5 px-2.5 text-right text-violet-700 font-mono">K_o</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70">
                <td className="py-1.5 px-2.5 text-slate-600 font-medium">{row.label}</td>
                <td
                  className={`py-1.5 px-2.5 text-right ${
                    row.isText ? 'text-slate-600' : 'font-mono tabular-nums text-slate-800'
                  } ${row.highlightDiff ? 'font-semibold text-rose-700' : ''}`}
                >
                  {row.kc}
                </td>
                <td
                  className={`py-1.5 px-2.5 text-right ${
                    row.isText ? 'text-slate-700' : 'font-mono tabular-nums text-slate-900 font-semibold'
                  } ${row.highlightDiff ? 'text-violet-800' : ''}`}
                >
                  {row.ko}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
        <div className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
          <span className="font-sans text-slate-600">{kcVsKo.rowAreaDiff}</span>
          <span className="font-bold text-emerald-700">
            {areaDiffAbs < 1e-12 ? '< 10⁻¹²' : areaDiffAbs.toExponential(1)}
          </span>
        </div>
        <div className="px-2.5 py-1.5 rounded-md bg-violet-50/60 border border-violet-200/70 flex items-center justify-between gap-2">
          <span className="font-sans text-slate-600">{kcVsKo.rowCenterDist}</span>
          <span className="font-bold text-violet-800">
            {circumcircle.centerDistanceToKc.toFixed(4)} (= c/2)
          </span>
        </div>
      </div>
    </div>
  );
};
