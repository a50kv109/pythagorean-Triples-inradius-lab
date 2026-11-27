/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ClassificationSectionId } from '../../../types/classification.ts';
import { Translations } from '../../../i18n/translations.ts';
import { MathFormula } from '../../common/MathFormula.tsx';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';
import { ArrowRight } from 'lucide-react';

interface ClassInspectorSectionProps {
  selectedRadius: number;
  onNavigateSection: (section: ClassificationSectionId) => void;
  t: Translations;
}

export const ClassInspectorSection: React.FC<ClassInspectorSectionProps> = ({
  selectedRadius,
  onNavigateSection,
  t,
}) => {
  const sectionInfo = t.classificationLab.sections.class_inspector;
  const diameter = selectedRadius * 2;

  const passportFields = [
    { field: 'class_id', type: 'Идентификатор', value: `CL-R${selectedRadius}-D${diameter}`, note: 'Формат v0.1 без ведущих нулей' },
    { field: 'r / D', type: 'BigInt (точное)', value: `${selectedRadius} / ${diameter}`, note: 'D = 2r строго чётно' },
    { field: 'r_factorization', type: 'BigInt + Сертификат', value: t.classificationLab.emptyStates.awaiting_verified_data, note: 'Разложение r = 2^{e₀} ∏ pᵢ^{eᵢ} (M2)' },
    { field: 'omega_star / tau_r', type: 'BigInt (точное)', value: t.classificationLab.emptyStates.awaiting_verified_data, note: 'ω*(r) — нечётные простые делители; τ(r) — число слоёв' },
    { field: 'T_prim = T(r)', type: 'BigInt (точное)', value: t.classificationLab.emptyStates.not_implemented, note: 'Число ППТ: T(r) = 2^{ω*(r)} ≥ 1 (Robbins, 2006)' },
    { field: 'N_total = N(r)', type: 'BigInt (точное)', value: t.classificationLab.emptyStates.not_implemented, note: 'Всего троек: N(r) = τ(2r²)/2 = Σ_{k|r} T(r/k) (Omland, 2017)' },
    { field: 'N_scaled', type: 'BigInt (точное)', value: t.classificationLab.emptyStates.not_implemented, note: 'Масштабированные тройки: N(r) − T(r) в τ(r) − 1 слоях' },
    { field: 'c_min / c_max', type: 'BigInt (точное)', value: t.classificationLab.emptyStates.not_implemented, note: '(2 + 2√2)r < c_min ≤ 5r; c_max = 2r² + 2r + 1' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {sectionInfo.title}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {sectionInfo.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateSection('triple_matrix')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>Перейти к матрице C({selectedRadius})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Class Passport Schema */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Структура паспорта класса CL-R{selectedRadius}-D{diameter}
          </h2>
          <span className="text-xs font-mono text-slate-500">
            CLASSIFICATION_SPECIFICATION.md · v0.1
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4 font-semibold">Поле паспорта</th>
                  <th className="py-2.5 px-4 font-semibold">Тип точности</th>
                  <th className="py-2.5 px-4 font-semibold">Текущее состояние</th>
                  <th className="py-2.5 px-4 font-semibold">Математическое определение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passportFields.map((row) => (
                  <tr key={row.field}>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {row.field}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {row.type}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-amber-700 whitespace-nowrap">
                      {row.value}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Subclasses C_k(r) Partition */}
      <section className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Разложение по масштабным подклассам Cₖ(r)
          </h2>
          <div className="overflow-x-auto py-1 text-slate-900">
            <MathFormula
              block
              tex="C_k(r) = \{(a,b,c) \in C(r) : \gcd(a,b,c) = k\}, \quad k = \gcd(x, y) \mid r, \quad |C_k(r)| = T\!\left(\frac{r}{k}\right) = 2^{\omega^*(r/k)} \ge 1"
            />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Каждый класс C(r) содержит ровно 1 примитивный слой (k = 1) и τ(r) − 1 непустых масштабированных слоёв (k &gt; 1, k | r).
          </p>
        </div>

        <EmptyModuleNotice
          kind="not_implemented"
          moduleCode="M2 + M3 + M5"
          description={`Список подклассов Cₖ(${selectedRadius}) для каждого делителя k | ${selectedRadius} не сформирован: отсутствуют факторизация r и построитель слоёв.`}
          expectedInputs="Ожидаемые поля слоя: k · r/k · тип (примитивный k=1 / масштабированный k>1) · |Cₖ(r)| = T(r/k) · диапазон x · статус CHK-10"
          t={t}
        />
      </section>

      {/* Factorization Certification Policy (DESIGN_REVIEW.md) */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Политика сертификации факторизации (CHK-11)
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4 font-semibold">Статус сертификата</th>
                  <th className="py-2.5 px-4 font-semibold">Критерий присвоения</th>
                  <th className="py-2.5 px-4 font-semibold">Поведение паспорта</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-mono font-semibold text-emerald-800 whitespace-nowrap">
                    PROVEN_PRIME
                  </td>
                  <td className="py-2.5 px-4">
                    Пробное деление до √p или детерминированный тест Миллера–Рабина (13 оснований для p &lt; 3.317 × 10²⁴)
                  </td>
                  <td className="py-2.5 px-4">
                    Паспорт допускается к статусу VERIFIED_PROVEN
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-semibold text-amber-800 whitespace-nowrap">
                    PROBABLE_PRIME
                  </td>
                  <td className="py-2.5 px-4">
                    Вероятностный Миллер–Рабин для p ≥ 3.317 × 10²⁴ без сертификата ECPP/Поклингтона
                  </td>
                  <td className="py-2.5 px-4">
                    Понижение класса до условно проверенного PROBABLE_ONLY
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-semibold text-rose-800 whitespace-nowrap">
                    UNFACTORED_COMPOSITE
                  </td>
                  <td className="py-2.5 px-4">
                    Остаток составной и не разложен в пределах квоты итераций M2
                  </td>
                  <td className="py-2.5 px-4">
                    Запрет публикации полного паспорта C(r) до завершения разложения
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
