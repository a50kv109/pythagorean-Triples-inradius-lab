/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from 'react';
import { Translations } from '../../../i18n/translations.ts';
import { CHK_SPEC_ITEMS } from '../workspaceMetadata.ts';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';

interface VerificationExportSectionProps {
  selectedRadius: number;
  t: Translations;
}

type CheckScopeFilter = 'all' | 'row' | 'completeness' | 'certification';
type ExportSchemaTab = 'csv' | 'json';

export const VerificationExportSection: React.FC<VerificationExportSectionProps> = ({
  selectedRadius,
  t,
}) => {
  const [scopeFilter, setScopeFilter] = useState<CheckScopeFilter>('all');
  const [schemaTab, setSchemaTab] = useState<ExportSchemaTab>('csv');

  const sectionInfo = t.classificationLab.sections.verification_export;

  const filteredChecks = useMemo(() => {
    if (scopeFilter === 'all') return CHK_SPEC_ITEMS;
    return CHK_SPEC_ITEMS.filter((item) => item.scope === scopeFilter);
  }, [scopeFilter]);

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

      {/* Independence Architecture Banner */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Архитектурная развязка генератора (M2/M3) и верификатора (M6)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Для исключения общей ошибки (common-mode error) модуль верификации M6 запрещено связывать с кодом факторизатора M2 и генератора M3. Проверка полноты CHK-06, CHK-07 и CHK-10 опирается на три независимых метода: прямое пробное деление (V1), прямой перебор делителей x ≤ ⌊√2·r⌋ (V2) и полный перебор сторон в тестах (V3).
        </p>
      </section>

      {/* CHK-01..12 Checklist Specification */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(
              [
                { id: 'all', label: 'Все CHK-01…12 (12)' },
                { id: 'row', label: 'Построчные (6)' },
                { id: 'completeness', label: 'Полнота и слои (4)' },
                { id: 'certification', label: 'Сертификация и ID (2)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScopeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  scopeFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-500">
            Класс CL-R{selectedRadius}-D{selectedRadius * 2} · симуляция PASS запрещена
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4 font-semibold">Код</th>
                  <th className="py-2.5 px-4 font-semibold">Проверка</th>
                  <th className="py-2.5 px-4 font-semibold">Инвариант (BigInt / ExactRational)</th>
                  <th className="py-2.5 px-4 font-semibold">Критерий прохождения</th>
                  <th className="py-2.5 px-4 font-semibold">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecks.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {item.title}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {item.formula}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {item.criterion}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      ○ Ожидает M6
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Export Schema Preview */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            Подготовка схемы экспорта (M8)
          </h2>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSchemaTab('csv')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                schemaTab === 'csv'
                  ? 'bg-white text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Схема CSV (PDF, 18 столбцов)
            </button>
            <button
              type="button"
              onClick={() => setSchemaTab('json')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                schemaTab === 'json'
                  ? 'bg-white text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Схема JSON паспорта v0.1
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          {schemaTab === 'csv' ? (
            <>
              <div className="text-xs font-semibold text-slate-700">
                Заголовок эталонного датасета INRADIUS_CLASSIFICATION.csv (BENCHMARK_DATA_CATALOG.md §4.1)
              </div>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 overflow-x-auto">
                ClassID,r,D,a,b,c,Prim,gcd,m,n,k,Area,Semiperim,AngleA,AngleB,ac,bc,Source
              </pre>
            </>
          ) : (
            <>
              <div className="text-xs font-semibold text-slate-700">
                Контракт JSON-паспорта класса C({selectedRadius}) по спецификации v0.1
              </div>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 overflow-x-auto">
{`{
  "class_id": "CL-R${selectedRadius}-D${selectedRadius * 2}",
  "status": "AWAITING_M2_M3_M5_M6",
  "spec_version": "v0.1"
}`}
              </pre>
            </>
          )}
        </div>

        <EmptyModuleNotice
          kind="not_implemented"
          moduleCode="M6 + M8"
          description="Запуск верификации CHK-01…CHK-12, сверка с эталонными таблицами (r ≤ 30, r ≤ 100) и выгрузка проверенных файлов CSV/JSON станут доступны после реализации модулей M5, M6 и M8."
          t={t}
        />
      </section>
    </div>
  );
};
