/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo } from 'react';
import { FourCirclesCalculations } from '../../types/geometry.ts';
import { validateAllFiveCirclesInvariants } from '../../math/ThalesValidators.ts';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';
import { MathFormula } from '../common/MathFormula.tsx';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface InvariantsPanelProps {
  calc: FourCirclesCalculations;
  t?: Translations;
}

export const InvariantsPanel: React.FC<InvariantsPanelProps> = ({ calc, t = TRANSLATIONS.ru }) => {
  const invariants = useMemo(() => validateAllFiveCirclesInvariants(calc), [calc]);

  const coreInvariants = useMemo(
    () => invariants.filter((inv) => !inv.id.startsWith('thales_')),
    [invariants]
  );
  const thalesInvariants = useMemo(
    () => invariants.filter((inv) => inv.id.startsWith('thales_')),
    [invariants]
  );

  const passedCount = invariants.filter((inv) => inv.isValid).length;
  const allPassed = passedCount === invariants.length;

  const renderInvariantCard = (inv: (typeof invariants)[number]) => {
    const localized = t.invariants.items[inv.id];
    const isThales = inv.id.startsWith('thales_');
    return (
      <div
        key={inv.id}
        className={`p-2.5 rounded-lg border transition-colors space-y-1.5 ${
          isThales
            ? 'border-violet-200/80 bg-violet-50/40 hover:bg-white'
            : 'border-slate-200/80 bg-slate-50/70 hover:bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {localized?.name || inv.name}
            </span>
            <div
              className={`text-xs font-mono overflow-x-auto ${
                isThales ? 'text-violet-700' : 'text-indigo-700'
              }`}
            >
              <MathFormula tex={inv.formula} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-[10px] font-mono tabular-nums font-semibold ${
                inv.isValid ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {Number.isFinite(inv.delta)
                ? inv.delta < 1e-12
                  ? 'Δ < 10⁻¹²'
                  : `Δ = ${inv.delta.toExponential(1)}`
                : `Δ = ${String(inv.delta)}`}
            </span>
            {inv.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          {localized?.description || inv.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums pt-1 border-t border-slate-200/50 text-slate-600">
          <span>
            {t.invariants.calcLabel}: {inv.calculatedValue}
          </span>
          <span>
            {t.invariants.expectedLabel}: {inv.expectedValue}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${allPassed ? 'text-emerald-600' : 'text-rose-600'}`} />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {t.invariants.title}
          </h3>
        </div>

        <span
          className={`text-xs font-semibold tabular-nums whitespace-nowrap shrink-0 ${
            allPassed ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {passedCount} / {invariants.length} {t.invariants.confirmedSuffix}
        </span>
      </div>

      <p className="text-xs text-slate-500">
        {t.invariants.subtitle}
      </p>

      {/* Invariants list grouped by 4 Circles and Thales K_o */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            {t.invariants.groupFourCircles} ({coreInvariants.filter((i) => i.isValid).length}/{coreInvariants.length})
          </div>
          {coreInvariants.map(renderInvariantCard)}
        </div>

        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700 px-0.5">
            {t.invariants.groupThales} ({thalesInvariants.filter((i) => i.isValid).length}/{thalesInvariants.length})
          </div>
          {thalesInvariants.map(renderInvariantCard)}
        </div>
      </div>
    </div>
  );
};
