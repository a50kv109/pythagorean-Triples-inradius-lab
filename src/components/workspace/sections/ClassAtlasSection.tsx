/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { ClassificationSectionId } from '../../../types/classification.ts';
import { Translations } from '../../../i18n/translations.ts';
import { MathFormula } from '../../common/MathFormula.tsx';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';
import {
  PER_RADIUS_REFERENCE_R1_R6,
  REFERENCE_RADII_PRESETS,
} from '../workspaceMetadata.ts';
import { ArrowRight } from 'lucide-react';

interface ClassAtlasSectionProps {
  selectedRadius: number;
  onSelectRadius: (r: number) => void;
  onNavigateSection: (section: ClassificationSectionId) => void;
  t: Translations;
}

type AtlasRangeFilter = 'r_1_30' | 'r_31_100' | 'r_1_100' | 'custom';

export const ClassAtlasSection: React.FC<ClassAtlasSectionProps> = ({
  selectedRadius,
  onSelectRadius,
  onNavigateSection,
  t,
}) => {
  const [rangeFilter, setRangeFilter] = useState<AtlasRangeFilter>('r_1_100');

  const sectionInfo = t.classificationLab.sections.class_atlas;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {sectionInfo.title}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {sectionInfo.subtitle}
        </p>
      </header>

      {/* Primary Partition Formula */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="text-xs font-semibold text-slate-500">
          Каноническое ядро разбиения (MATHEMATICAL_FOUNDATION.md)
        </div>
        <div className="overflow-x-auto py-1 text-slate-900">
          <MathFormula
            block
            tex="\mathcal{P} = \bigsqcup_{r=1}^{\infty} C(r), \qquad C(r) = \left\{(a, b, c) \in \mathbb{N}^3 \;\middle|\; a^2 + b^2 = c^2,\; 0 < a < b < c,\; \frac{a + b - c}{2} = r\right\}"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>
            Текущий выбор: <strong className="font-mono text-slate-900">r = {selectedRadius}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Диаметр: <strong className="font-mono text-slate-900">D = {selectedRadius * 2}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Формулы подсчёта: <MathFormula tex="T(r) = 2^{\omega^*(r)} \ge 1,\; N(r) = \frac{\tau(2r^2)}{2}" />
          </span>
        </div>
      </section>

      {/* Layer 1: Documented Aggregate Range Summary (Static Reference from BENCHMARK_DATA_CATALOG.md) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            1. Сводные агрегаты корпуса по диапазонам (BENCHMARK_DATA_CATALOG.md)
          </h2>
          <span className="text-xs text-slate-500">
            Статические сводные данные по диапазонам · не по-радиусный живой расчёт
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-xs font-medium text-slate-500">Таблица A (1 ≤ r ≤ 30)</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              174
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              61 ППТ · 113 масшт. · c ≤ 1861
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-xs font-medium text-slate-500">Таблица B (31 ≤ r ≤ 100)</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              681
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              188 ППТ · 493 масшт.
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-xs font-medium text-slate-500">Сводный срез (1 ≤ r ≤ 100)</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              855
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              249 ППТ · 606 масшт. · 100 классов
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-xs font-medium text-slate-500">Спектр T(r) для r ≤ 100</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              7 / 65 / 28
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              T=1 (2^e) · T=2 · T=4 (min T=8: r=105)
            </div>
          </div>
        </div>
      </section>

      {/* Layer 2: Compact Documented Per-Radius Reference Table r = 1..6 */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            2. Документированные по-радиусные значения (r = 1…6, таблица 3.2 корпуса)
          </h2>
          <span className="text-xs text-amber-800 font-medium">
            Статический справочник по формулам и PDF · не динамическая генерация M2/M3
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">r</th>
                  <th className="py-2.5 px-3 font-semibold">D = 2r</th>
                  <th className="py-2.5 px-3 font-semibold">N(r)</th>
                  <th className="py-2.5 px-3 font-semibold">T(r)</th>
                  <th className="py-2.5 px-3 font-semibold">N(r) − T(r)</th>
                  <th className="py-2.5 px-3 font-semibold">Примечание (эталон)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PER_RADIUS_REFERENCE_R1_R6.map((row) => {
                  const isSelected = row.r === selectedRadius;
                  return (
                    <tr
                      key={row.r}
                      className={isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/70'}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold tabular-nums text-slate-900">
                        {row.r}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {row.D}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold tabular-nums text-slate-900">
                        {row.N}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-800">
                        {row.T}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {row.scaledCount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {row.note}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectRadius(row.r)}
                          className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? `Выбран r = ${row.r}` : `Выбрать r = ${row.r}`}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Layer 3: Future Dynamic Atlas Table + Range Filter */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            3. Динамически вычисляемый атлас (ожидает модули M2 + M3 + M6)
          </h2>
          <span className="text-xs text-slate-500">
            Будет вычисляться в браузере в точной арифметике BigInt
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
            {(
              [
                { id: 'r_1_30', label: '1 ≤ r ≤ 30' },
                { id: 'r_31_100', label: '31 ≤ r ≤ 100' },
                { id: 'r_1_100', label: '1 ≤ r ≤ 100' },
                { id: 'custom', label: `Выбранный r = ${selectedRadius}` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRangeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  rangeFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigateSection('class_inspector')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>Открыть класс C({selectedRadius}) в инспекторе</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Empty State for Dynamic Atlas Table */}
        <EmptyModuleNotice
          kind="awaiting_verified_data"
          moduleCode="M2 + M3 + M6"
          description={`Динамическая по-радиусная таблица для фильтра (${
            rangeFilter === 'r_1_30'
              ? '1 ≤ r ≤ 30'
              : rangeFilter === 'r_31_100'
                ? '31 ≤ r ≤ 100'
                : rangeFilter === 'r_1_100'
                  ? '1 ≤ r ≤ 100'
                  : `r = ${selectedRadius}`
          }) будет формироваться только после реализации точного факторизатора (M2), генератора классов (M3) и независимого верификатора (M6).`}
          expectedInputs="Ожидаемые столбцы: CL-R{r}-D{2r} · r · D · факторизация · T(r) · N(r) · τ(r) · c_min · c_max · статус CHK-01…12"
          t={t}
        />

        {/* Quick Reference Radii Directory */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Контрольные ориентиры корпуса (быстрый переход по r)
            </span>
            <span className="text-xs text-slate-500">OQ-04: пределы интерактивного расчёта на согласовании</span>
          </div>
          <div className="divide-y divide-slate-100">
            {REFERENCE_RADII_PRESETS.map((item) => {
              const isSelected = item.r === selectedRadius;
              return (
                <div
                  key={item.r}
                  className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isSelected ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold tabular-nums text-slate-900 w-16 shrink-0">
                      r = {item.r}
                    </span>
                    <span className="font-mono text-slate-500 w-24 shrink-0">
                      CL-R{item.r}-D{item.r * 2}
                    </span>
                    <span className="text-slate-700 truncate">{item.note}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRadius(item.r);
                      onNavigateSection('class_inspector');
                    }}
                    className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    Выбрать r = {item.r}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
