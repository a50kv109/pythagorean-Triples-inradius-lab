/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo } from 'react';
import { calculateFourCircles } from '../../math/FourCirclesModel.ts';
import { validateAllFiveCirclesInvariants } from '../../math/ThalesValidators.ts';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';
import { X, CheckCircle, PlayCircle } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTestCase: (a: number, b: number) => void;
  t?: Translations;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  onClose,
  onLoadTestCase,
  t = TRANSLATIONS.ru,
}) => {
  const testResults = useMemo(() => {
    const testCases = [
      { a: 3, b: 4, title: '(3, 4, 5)', key: '3_4' },
      { a: 5, b: 12, title: '(5, 12, 13)', key: '5_12' },
      { a: 4, b: 4, title: '(4, 4, 4√2)', key: '4_4' },
      { a: 1, b: 10, title: '(1, 10, √101)', key: '1_10' },
      { a: 10, b: 1, title: '(10, 1, √101)', key: '10_1' },
    ];
    return testCases.map((tc) => {
      const calc = calculateFourCircles(tc.a, tc.b);
      const invariants = validateAllFiveCirclesInvariants(calc);
      const allPassed = invariants.every((inv) => inv.isValid);
      const maxDelta = Math.max(...invariants.map((inv) => inv.delta));
      return {
        ...tc,
        calc,
        allPassed,
        maxDelta,
        invariantsCount: invariants.length,
      };
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.testModal.title}
              </h3>
              <p className="text-xs text-slate-500">
                {t.testModal.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 text-left">{t.testModal.colTriangle}</th>
                  <th className="py-2.5 px-3 text-left">{t.testModal.colProfile}</th>
                  <th className="py-2.5 px-3 text-right">r</th>
                  <th className="py-2.5 px-3 text-right">R_o</th>
                  <th className="py-2.5 px-3 text-right">√K_a + √K_b</th>
                  <th className="py-2.5 px-3 text-right">√K_c + √K_i</th>
                  <th className="py-2.5 px-3 text-right">{t.testModal.colChecks}</th>
                  <th className="py-2.5 px-3 text-right">{t.testModal.colDelta}</th>
                  <th className="py-2.5 px-3 text-center">{t.testModal.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {testResults.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900 whitespace-nowrap">{res.title}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{t.testModal.cases[res.key]}</td>
                    <td className="py-2.5 px-3 text-right text-amber-800 font-semibold">
                      {res.calc.incircle.radius.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-violet-700 font-semibold">
                      {res.calc.circumcircle.radius.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {res.calc.sqrtSumLegs.toFixed(5)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {res.calc.sqrtSumHypAndIn.toFixed(5)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                        res.allPassed ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {res.allPassed
                        ? `${res.invariantsCount}/${res.invariantsCount} ${t.testModal.okStatus}`
                        : t.testModal.failStatus}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                      &lt; {res.maxDelta < 1e-12 ? '10⁻¹²' : res.maxDelta.toExponential(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <button
                        onClick={() => {
                          onLoadTestCase(res.a, res.b);
                          onClose();
                        }}
                        className="px-2 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                        title={t.testModal.openTitle}
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> {t.testModal.openBtn}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {testResults.every((r) => r.allPassed) ? (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800">
              {t.testModal.allPassBanner}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/60 text-xs text-rose-800">
              {t.testModal.failBanner}
            </div>
          )}
        </div>

        {/* Footer */}
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
