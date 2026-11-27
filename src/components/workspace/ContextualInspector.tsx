/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ClassificationSectionId } from '../../types/classification.ts';
import { Translations } from '../../i18n/translations.ts';
import { MODULE_READINESS_SPEC, OPEN_QUESTIONS_SPEC } from './workspaceMetadata.ts';
import { MathFormula } from '../common/MathFormula.tsx';

interface ContextualInspectorProps {
  selectedRadius: number;
  activeSection: ClassificationSectionId;
  t: Translations;
}

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  selectedRadius,
  activeSection,
  t,
}) => {
  const diameter = selectedRadius * 2;

  return (
    <aside
      aria-label={t.classificationLab.inspectorTitle}
      className="w-full xl:w-80 shrink-0 bg-slate-50 border-t xl:border-t-0 xl:border-l border-slate-200 overflow-y-auto p-5 space-y-6"
    >
      {/* Active Class Key Readout */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500">
          {t.classificationLab.inspectorTitle}
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-slate-500">{t.classificationLab.inspectorActiveClass}</span>
            <span className="text-sm font-mono font-bold text-slate-900">
              CL-R{selectedRadius}-D{diameter}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500">{t.classificationLab.radiusLabel}</div>
              <div className="text-lg font-mono font-bold tabular-nums text-slate-900">
                {selectedRadius}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t.classificationLab.diameterLabel}</div>
              <div className="text-lg font-mono font-bold tabular-nums text-slate-900">
                {diameter}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div>
              <MathFormula tex={`xy = 2r^2,\\; r = ${selectedRadius}`} />
            </div>
            <div className="text-amber-700 font-medium">
              ◌ {t.classificationLab.emptyStates.awaiting_verified_data}
            </div>
          </div>
        </div>
      </section>

      {/* Exact vs Approximate Domain Separation */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-500">
          Разграничение точности данных
        </h3>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
          <div className="p-3 space-y-1">
            <div className="font-semibold text-slate-900">Точный контур (BigInt / ExactRational)</div>
            <p className="text-slate-600 leading-relaxed">
              {t.classificationLab.exactDomainLegend}
            </p>
          </div>
          <div className="p-3 space-y-1">
            <div className="font-semibold text-slate-900">Визуальный контур (float64)</div>
            <p className="text-slate-600 leading-relaxed">
              {t.classificationLab.approxDomainLegend}
            </p>
          </div>
        </div>
      </section>

      {/* Module Implementation Status M1-M8 */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-500">
          {t.classificationLab.inspectorReadinessTitle}
        </h3>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {MODULE_READINESS_SPEC.map((mod) => (
            <div key={mod.id} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-mono font-semibold text-slate-800 mr-1.5">{mod.id}</span>
                <span className="text-slate-600 truncate">{mod.scope}</span>
              </div>
              <span className="text-slate-500 whitespace-nowrap shrink-0 font-mono">
                {mod.status === 'under_development' ? '△ В разработке' : '○ Не реализ.'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Open Decisions Registry OQ-01..06 */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-500">
          {t.classificationLab.inspectorOpenQuestionsTitle} ({activeSection === 'geometric_inspector' ? 'OQ-01, OQ-03' : 'OQ-01…06'})
        </h3>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
          {OPEN_QUESTIONS_SPEC.map((oq) => (
            <div key={oq.id} className="p-2.5 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-semibold text-slate-800">{oq.id}</span>
                <span className="text-slate-500">{oq.status}</span>
              </div>
              <div className="text-slate-600">{oq.title}</div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};
