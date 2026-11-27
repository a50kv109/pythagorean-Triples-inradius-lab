/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { Translations } from '../../../i18n/translations.ts';
import { MathFormula } from '../../common/MathFormula.tsx';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';

interface StructuralAnalysisSectionProps {
  selectedRadius: number;
  t: Translations;
}

type StructuralTab = 'sporn' | 'trees' | 'pencils';

export const StructuralAnalysisSection: React.FC<StructuralAnalysisSectionProps> = ({
  selectedRadius,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<StructuralTab>('sporn');
  const sectionInfo = t.classificationLab.sections.structural_analysis;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {sectionInfo.title}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {sectionInfo.subtitle}
        </p>
      </header>

      {/* Interactive Structural Facet Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit">
        {(
          [
            { id: 'sporn', label: 'Спорн и асимметрия' },
            { id: 'trees', label: 'Деревья Берггрена / Прайса' },
            { id: 'pencils', label: 'Трансверсальные пучки и ФЗЧП' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sporn & Asymmetry */}
      {activeTab === 'sporn' && (
        <div className="space-y-4">
          {/* Approved / Established Sporn Coordinate & Group Laws */}
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-semibold text-slate-900">
                Утверждённая нормировка координат Спорна и групповая структура (STRUCTURAL_ANALYSIS_CATALOG.md §2)
              </h2>
              <span className="text-xs font-mono text-slate-500">Математическое ядро</span>
            </div>

            <div className="space-y-3 overflow-x-auto text-slate-900">
              <MathFormula
                block
                tex="\tilde{x} = \frac{x}{r} \in \mathbb{Q}_+, \qquad \tilde{y} = \frac{y}{r} \in \mathbb{Q}_+, \qquad \tilde{x}\tilde{y} = 2, \qquad \frac{1}{r} \le \tilde{x}_{\text{canon}} < \sqrt{2} < \tilde{y} \le 2r"
              />
              <MathFormula
                block
                tex="\tan\frac{A}{2} = \frac{1}{1 + \tilde{y}}, \qquad \tan\frac{B}{2} = \frac{1}{1 + \tilde{x}}, \qquad t = \frac{b}{a} > 1"
              />
              <MathFormula
                block
                tex="(\tilde{x}_1, 2/\tilde{x}_1) \odot (\tilde{x}_2, 2/\tilde{x}_2) = \left(\tilde{x}_1 \tilde{x}_2,\; \frac{2}{\tilde{x}_1 \tilde{x}_2}\right) \cong (\mathbb{Q}_+, \cdot), \qquad e = (1, 2)"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Следует строго различать каноническую нормировку строки матрицы (<MathFormula tex="\tilde{x} < \sqrt{2}" />) и групповое умножение Спорна на упорядоченных классах подобия <MathFormula tex="(a,b,c) \ne (b,a,c)" />.
            </p>
          </section>

          {/* Unfinalized Open Question OQ-02 Sub-Card for asym_q */}
          <section className="bg-amber-50/40 border border-amber-200 rounded-lg p-5 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-amber-200/70 pb-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Статус метрики асимметрии asym_q (OQ-02 — открытый вопрос, НЕ финализировано)
              </h3>
              <span className="text-xs font-mono text-amber-800 font-semibold">
                OQ-02 · НЕ УТВЕРЖДЕНО
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Окончательный выбор меры асимметрии между катетами остаётся открытым до согласования <span className="font-mono font-semibold">OQ-02</span> (см. <span className="font-mono">DESIGN_REVIEW.md §2</span>). Ниже приведён кандидат черновика v0.1 и альтернативные варианты без утверждения одного из них:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-amber-200 rounded-md p-3.5 space-y-1.5">
                <div className="font-semibold text-slate-900">
                  Кандидат спецификации v0.1 (не утверждён)
                </div>
                <div className="overflow-x-auto py-1">
                  <MathFormula tex="q_{\text{v0.1}} = \frac{b - a}{a + b} = \frac{t - 1}{t + 1} \in (0, 1)" />
                </div>
                <p className="text-slate-600">
                  Нормированная полуразность катетов из черновика v0.1; сохраняется как конфигурируемый вариант.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-1.5">
                <div className="font-semibold text-slate-900">
                  Альтернативы в DESIGN_REVIEW.md (на рассмотрении)
                </div>
                <ul className="space-y-1 font-mono text-slate-700">
                  <li>· (b − a) / c — нормировка по гипотенузе</li>
                  <li>· y / x — факторизационное отношение сдвигов</li>
                  <li>· (y − x) / (y + x) — нормированный баланс (x, y)</li>
                  <li>· ln(b / a) — логарифмический индекс масштаба</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Berggren / Price / Saunders-Randall Trees */}
      {activeTab === 'trees' && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h2 className="text-base font-semibold text-slate-900">
              Матричные деревья генерации ППТ от корня (3, 4, 5)
            </h2>
            <span className="text-xs font-mono text-slate-500">OQ-05 · Agarwal (2020, P29–P31)</span>
          </div>

          <div className="overflow-x-auto py-1 text-slate-900">
            <MathFormula
              block
              tex="A_1 = \begin{pmatrix} 1 & 2 & 2 \\ -2 & -1 & -2 \\ 2 & 2 & 3 \end{pmatrix}, \quad A_2 = \begin{pmatrix} 1 & 2 & 2 \\ 2 & 1 & 2 \\ 2 & 2 & 3 \end{pmatrix}, \quad A_3 = \begin{pmatrix} -1 & -2 & -2 \\ 2 & 1 & 2 \\ 2 & 2 & 3 \end{pmatrix}"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <div className="font-semibold text-slate-800">Перестановка катетов (tree_leg_swapped)</div>
              <p>
                Узлы дерева Берггрена могут иметь a &gt; b (например, (3, 4, 5)A₃ = (15, 8, 17)); булев флаг <span className="font-mono text-slate-800">tree_leg_swapped</span> фиксирует приведение к канону a &lt; b.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-slate-800">Альтернативные деревья и OQ-05 (не финализировано)</div>
              <p>
                Дерево Прайса (A₁′, A₂′, A₃′; arXiv:0809.4324) и матрицы (m, n) Саундерса–Рэндалла B₁, B₂, B₃. Семантика RLE-записи <span className="font-mono text-slate-800">berggren_word</span> (направление чтения от корня или от листа) не утверждена и ожидает решения <span className="font-mono font-semibold">OQ-05</span>.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Transversal Pencils & Open Research */}
      {activeTab === 'pencils' && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h2 className="text-base font-semibold text-slate-900">
              Трансверсальные пучки и открытые исследовательские направления
            </h2>
            <span className="text-xs font-mono text-slate-500">Контур 2 · Контекстный индекс</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-1">
              <div className="font-semibold text-slate-900">Общий катет</div>
              <div className="font-mono text-slate-700">Lₚ(n) = 2^(q−1)</div>
              <p className="text-slate-600">Число ППТ с заданным катетом (Ochieng et al., 2019; Agarwal P26).</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-1">
              <div className="font-semibold text-slate-900">Общая гипотенуза</div>
              <div className="font-mono text-slate-700">Hₚ(n) = 2^(t−1)</div>
              <p className="text-slate-600">Пример: c = 65 пересекает классы r = 7 и r = 12 (Agarwal P15, P26).</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-1">
              <div className="font-semibold text-slate-900">Равная площадь / периметр</div>
              <div className="font-mono text-slate-700">S(20,21,29) = S(12,35,37) = 210</div>
              <p className="text-slate-600">Межклассовые совпадения между r = 6 и r = 5 (Agarwal P9–P10).</p>
            </div>
          </div>
        </section>
      )}

      <EmptyModuleNotice
        kind="under_development"
        moduleCode="M4 (Фасеты и проекции)"
        description={`Вычисление проекций Спорна, обратных путей Берггрена/Прайса и трансверсальных пучков для класса C(${selectedRadius}) не реализовано.`}
        expectedInputs="Ожидаемые данные: массив TriplePassport[] из M3/M5 и утверждённые спецификации OQ-02, OQ-05."
        t={t}
      />
    </div>
  );
};
