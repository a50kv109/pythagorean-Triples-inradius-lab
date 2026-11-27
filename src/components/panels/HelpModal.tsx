/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { X, BookOpen, CircleDot, CheckCircle2 } from 'lucide-react';
import { MathFormula } from '../common/MathFormula.tsx';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t?: Translations;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, t = TRANSLATIONS.ru }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.helpModal.title}
              </h3>
              <p className="text-xs text-slate-500">
                {t.helpModal.subtitle}
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
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-indigo-600" />
              {t.helpModal.sec1Title}
            </h4>
            <p>
              {t.helpModal.sec1IntroBefore}{' '}
              <MathFormula tex="a" /> {t.helpModal.sec1IntroAnd} <MathFormula tex="b" />{' '}
              {t.helpModal.sec1IntroTriangle} <MathFormula tex="OAB" /> (<MathFormula tex="c = \sqrt{a^2 + b^2}" />):
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                <strong><MathFormula tex="K_a" /> ({t.helpModal.kaColor}):</strong> {t.helpModal.kaDesc1}{' '}
                <MathFormula tex="a" />, {t.helpModal.kaDesc2} <MathFormula tex="Q_a" />{' '}
                {t.helpModal.kaDesc3} <MathFormula tex="OA" />.{' '}
                <MathFormula tex="K_a = \frac{\pi a^2}{4}" />.
              </li>
              <li>
                <strong><MathFormula tex="K_b" /> ({t.helpModal.kbColor}):</strong> {t.helpModal.kbDesc1}{' '}
                <MathFormula tex="b" />, {t.helpModal.kbDesc2} <MathFormula tex="Q_b" />{' '}
                {t.helpModal.kbDesc3} <MathFormula tex="OB" />.{' '}
                <MathFormula tex="K_b = \frac{\pi b^2}{4}" />.
              </li>
              <li>
                <strong><MathFormula tex="K_c" /> ({t.helpModal.kcColor}):</strong> {t.helpModal.kcDesc1}{' '}
                <MathFormula tex="c" />, {t.helpModal.kcDesc2} <MathFormula tex="Q_c" />{' '}
                {t.helpModal.kcDesc3} <MathFormula tex="AB" />.{' '}
                <MathFormula tex="K_c = \frac{\pi c^2}{4}" />.
              </li>
              <li>
                <strong><MathFormula tex="K_i" /> ({t.helpModal.kiColor}):</strong> {t.helpModal.kiDesc1}{' '}
                <MathFormula tex="OAB" />, {t.helpModal.kiDesc2}{' '}
                <MathFormula tex="r = \frac{a + b - c}{2}" />, {t.helpModal.kiDesc3}{' '}
                <MathFormula tex="K_i = \pi r^2" />.
              </li>
              <li>
                <strong><MathFormula tex="K_o" /> ({t.helpModal.koColor}):</strong> {t.helpModal.koDesc1}{' '}
                <MathFormula tex="OAB" />, {t.helpModal.koDesc2} <MathFormula tex="O_o = \frac{A+B}{2}" />{' '}
                {t.helpModal.koDesc3} <MathFormula tex="D_o = c" />,{' '}
                <MathFormula tex="R_o = \frac{c}{2}" />, <MathFormula tex="K_o = \frac{\pi c^2}{4}" />.
              </li>
            </ul>
          </section>

          <section className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <h4 className="font-bold text-slate-900">{t.helpModal.sec2Title}</h4>
            <div className="py-1 font-mono text-center text-sm overflow-x-auto">
              <MathFormula tex="\sqrt{K_a} + \sqrt{K_b} = \sqrt{K_c} + \sqrt{K_i}" />
            </div>
            <p className="text-slate-600">
              {t.helpModal.sec2Text1} <MathFormula tex="\sqrt{K_a} = \frac{\sqrt{\pi}}{2}a" />,{' '}
              <MathFormula tex="\sqrt{K_b} = \frac{\sqrt{\pi}}{2}b" />,{' '}
              <MathFormula tex="\sqrt{K_c} = \frac{\sqrt{\pi}}{2}c" /> {t.helpModal.sec2TextAnd}{' '}
              <MathFormula tex="\sqrt{K_i} = \sqrt{\pi}\frac{a+b-c}{2}" />, {t.helpModal.sec2Text2}{' '}
              <MathFormula tex="\frac{\sqrt{\pi}}{2}(c + a + b - c) = \frac{\sqrt{\pi}}{2}(a + b)" />{' '}
              {t.helpModal.sec2Text3}
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900">{t.helpModal.sec3Title}</h4>
            <div className="space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {t.helpModal.sec3Bullet1} <MathFormula tex="K_a + K_b = K_c" />.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {t.helpModal.sec3Bullet2Before} <MathFormula tex="K_i > 0" />
                  {t.helpModal.sec3Bullet2After} <MathFormula tex="K_a + K_b - K_c - K_i = -K_i \neq 0" />.
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-1.5 bg-violet-50/70 p-3.5 rounded-xl border border-violet-200/70">
            <h4 className="font-bold text-violet-950">{t.helpModal.sec4Title}</h4>
            <p className="text-slate-700">
              {t.helpModal.sec4Text} <MathFormula tex="K_o = K_c" />,{' '}
              <MathFormula tex="O_o = \left(\frac{b}{2}, \frac{a}{2}\right) \neq O_c" />,{' '}
              <MathFormula tex="|O_o - O_c| = \frac{c}{2}" />.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            {t.helpModal.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
