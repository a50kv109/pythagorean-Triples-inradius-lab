/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from 'react';
import { MatrixCategoryId } from '../../../types/classification.ts';
import { Translations } from '../../../i18n/translations.ts';
import { MATRIX_SCHEMA_COLUMNS } from '../workspaceMetadata.ts';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';

interface TripleMatrixSectionProps {
  selectedRadius: number;
  t: Translations;
}

const CATEGORY_TABS: { id: MatrixCategoryId; label: string }[] = [
  { id: 'all', label: 'Все 6 категорий' },
  { id: 'identification', label: '1. Идентификация' },
  { id: 'arithmetic', label: '2. Арифметика' },
  { id: 'parametric', label: '3. Параметры (m,n,u,v)' },
  { id: 'geometric', label: '4. Геометрия' },
  { id: 'structural', label: '5. Структура и подобие' },
  { id: 'generative', label: '6. Генеалогия' },
];

export const TripleMatrixSection: React.FC<TripleMatrixSectionProps> = ({
  selectedRadius,
  t,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MatrixCategoryId>('all');
  const sectionInfo = t.classificationLab.sections.triple_matrix;

  const visibleColumns = useMemo(() => {
    if (selectedCategory === 'all') return MATRIX_SCHEMA_COLUMNS;
    return MATRIX_SCHEMA_COLUMNS.filter((col) => col.category === selectedCategory);
  }, [selectedCategory]);

  const precisionLabel = (precision: string) => {
    switch (precision) {
      case 'exact_int':
        return 'Точное целое (BigInt)';
      case 'exact_rational':
        return 'Точная дробь (ExactRational)';
      case 'approx_float64':
        return 'Приближённое (float64)';
      default:
        return 'Точный ID / флаг';
    }
  };

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

      {/* Category Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-500">
            Сортировка строк матрицы: xᵢ &lt; xᵢ₊₁ (a возрастает; y, b, c убывают)
          </span>
        </div>

        {/* Schema Columns & Precision Classification */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Схема столбцов матрицы класса C({selectedRadius}) · показано полей: {visibleColumns.length}
            </span>
            <span className="text-xs text-slate-500">
              Формат строк: PT-R{selectedRadius}-K&#123;k&#125;-X&#123;x&#125;
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-white">
                  <th className="py-2.5 px-4 font-semibold">Ключ поля</th>
                  <th className="py-2.5 px-4 font-semibold">Категория</th>
                  <th className="py-2.5 px-4 font-semibold">Класс точности</th>
                  <th className="py-2.5 px-4 font-semibold">Назначение (Спецификация v0.1)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleColumns.map((col) => (
                  <tr key={col.key}>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {col.key}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {col.categoryLabel}
                    </td>
                    <td
                      className={`py-2.5 px-4 font-mono whitespace-nowrap ${
                        col.precision === 'approx_float64'
                          ? 'text-amber-700 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {precisionLabel(col.precision)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {col.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <EmptyModuleNotice
          kind="not_implemented"
          moduleCode="M3 + M4 + M5"
          description={`Строки матрицы троек для класса CL-R${selectedRadius}-D${selectedRadius * 2} и детальный паспорт выбранной тройки PT-R${selectedRadius}-K{k}-X{x} ожидают реализации модулей генерации (M3), фасетного профилирования (M4) и сборки паспортов (M5).`}
          expectedInputs="Вход: r (BigInt) -> Выход: упорядоченный по x массив TriplePassport[]"
          t={t}
        />
      </section>

      {/* Single Triple Passport Slot */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <h2 className="text-base font-semibold text-slate-900">
            Паспорт выбранной тройки
          </h2>
          <span className="text-xs font-mono text-slate-500">
            triple_id · prim_id
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Тройка из матрицы не выбрана: {t.classificationLab.emptyStates.awaiting_verified_data}. После запуска M3/M5 выбор строки в таблице откроет здесь полный 6-категориальный паспорт с каноническим прообразом <span className="font-mono text-slate-800">prim_id</span> и ссылкой на чертёж в разделе 05.
        </p>
      </section>
    </div>
  );
};
