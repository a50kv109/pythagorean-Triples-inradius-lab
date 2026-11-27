/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useMemo, useState } from 'react';
import { BoardLayerFilter } from '../../../types/geometry.ts';
import { M7SvgProjectionInput } from '../../../types/classification.ts';
import { Translations } from '../../../i18n/translations.ts';
import { calculateFourCircles } from '../../../math/FourCirclesModel.ts';
import { GeometryBoard } from '../../geometry/GeometryBoard.tsx';
import {
  DOCUMENTED_CLASS_EXAMPLES,
  GEOMETRIC_PREVIEW_SAMPLES,
} from '../workspaceMetadata.ts';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';
import { Compass } from 'lucide-react';

interface GeometricInspectorSectionProps {
  selectedRadius: number;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  onOpenLegacyLab: () => void;
  /** Prepared adapter contract for future M7 integration; stays null in Phase 1.1. */
  m7Projection?: M7SvgProjectionInput | null;
  t: Translations;
}

export const GeometricInspectorSection: React.FC<GeometricInspectorSectionProps> = ({
  selectedRadius,
  isInspectorOpen,
  onToggleInspector,
  onOpenLegacyLab,
  m7Projection = null,
  t,
}) => {
  const [sampleId, setSampleId] = useState<string>(GEOMETRIC_PREVIEW_SAMPLES[0].id);
  const [a, setA] = useState<number>(GEOMETRIC_PREVIEW_SAMPLES[0].a);
  const [b, setB] = useState<number>(GEOMETRIC_PREVIEW_SAMPLES[0].b);
  const [layerFilter, setLayerFilter] = useState<BoardLayerFilter>('triangle_incircle');

  const sectionInfo = t.classificationLab.sections.geometric_inspector;
  const documentedExamples = DOCUMENTED_CLASS_EXAMPLES[selectedRadius] ?? null;

  const calc = useMemo(() => calculateFourCircles(a, b), [a, b]);

  const handleSelectSample = (id: string, nextA: number, nextB: number) => {
    setSampleId(id);
    setA(nextA);
    setB(nextB);
  };

  return (
    <div className="space-y-6">
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
          onClick={onOpenLegacyLab}
          className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Compass className="w-3.5 h-3.5 text-slate-600" />
          <span>{t.classificationLab.legacyBtn}</span>
        </button>
      </header>

      {/* Section A: Selected Class C(r) Context & Static Documented Examples */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Контекст выбранного класса C({selectedRadius}) · ключ CL-R{selectedRadius}-D{selectedRadius * 2}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Строгое отделение целочисленного класса от автономной SVG-доски float64 ниже
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600">
            r = {selectedRadius} · D = {selectedRadius * 2} · {m7Projection ? `M7: ${m7Projection.tripleId}` : 'M7 не подключён'}
          </span>
        </div>

        {documentedExamples ? (
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800">
                Документированные примеры класса C({selectedRadius}) (BENCHMARK_DATA_CATALOG.md)
              </span>
              <span className="text-amber-800 font-medium">
                Статический эталон документа · НЕ живой расчёт M3
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2 px-3 font-semibold">triple_id</th>
                    <th className="py-2 px-3 font-semibold">Канон (a, b, c)</th>
                    <th className="py-2 px-3 font-semibold">k</th>
                    <th className="py-2 px-3 font-semibold">Слой Cₖ({selectedRadius})</th>
                    <th className="py-2 px-3 font-semibold">(x, y), xy = 2r²</th>
                    <th className="py-2 px-3 font-semibold">Статус проекции M7</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-800">
                  {documentedExamples.map((row) => (
                    <tr key={row.tripleId}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{row.tripleId}</td>
                      <td className="py-2 px-3">({row.a}, {row.b}, {row.c})</td>
                      <td className="py-2 px-3">{row.k}</td>
                      <td className="py-2 px-3 font-sans">
                        {row.isPrimitive
                          ? `C₁(${selectedRadius}) · примитивная`
                          : `C${row.k}(${selectedRadius}) · масштабированная`}
                      </td>
                      <td className="py-2 px-3">({row.x}, {row.y})</td>
                      <td className="py-2 px-3 font-sans text-slate-500">
                        Ожидает M7 (автопроекция не подключена)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <EmptyModuleNotice
              kind="awaiting_verified_data"
              moduleCode="M3 + M5 + M7"
              description={`Для выбранного класса C(${selectedRadius}) список целочисленных троек (a, b, c) появится после реализации генератора M3, построителя паспортов M5 и адаптера SVG-проекции M7. В статическом эталоне документированы подробные примеры для r = 1 и r = 3.`}
              expectedInputs={`Ожидается массив M7SvgProjectionInput для класса CL-R${selectedRadius}-D${selectedRadius * 2}`}
              t={t}
            />
          </div>
        )}
      </section>

      {/* Section B: Decoupled Legacy GeometryBoard Standalone Demo */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Автономная демонстрация SVG-движка (GeometryBoard, приближение float64)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Независимый геометрический тест-стенд с непрерывными координатами · не привязан к глобальному классу C({selectedRadius}) до реализации M7
            </p>
          </div>

          <div className="text-xs font-mono tabular-nums text-amber-800">
            r_demo = {calc.incircle.radius.toFixed(4)} (float64) · глобальный выбор: r = {selectedRadius}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-slate-600 mr-1">
            Тестовые пресеты SVG-движка:
          </span>
          {GEOMETRIC_PREVIEW_SAMPLES.map((sample) => {
            const isActive =
              sampleId === sample.id &&
              Math.abs(a - sample.a) < 1e-6 &&
              Math.abs(b - sample.b) < 1e-6;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample.id, sample.a, sample.b)}
                title={sample.note}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sample.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Вертикальный катет демо (ось +Oy)</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {calc.triangle.a.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Горизонтальный катет демо (ось +Ox)</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {calc.triangle.b.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Гипотенуза демо c (float64)</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {calc.triangle.c.toFixed(4)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Вписанный радиус демо r_demo</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {calc.incircle.radius.toFixed(4)}
            </span>
          </div>
        </div>
      </section>

      {/* Reused Interactive SVG Board */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden h-[480px] relative">
        <GeometryBoard
          calc={calc}
          activeModule="incircle_focus"
          onChangeA={(val) => setA(Math.max(0.2, Math.min(40, val)))}
          onChangeB={(val) => setB(Math.max(0.2, Math.min(40, val)))}
          layerFilter={layerFilter}
          setLayerFilter={setLayerFilter}
          isRightPanelOpen={isInspectorOpen}
          onToggleRightPanel={onToggleInspector}
          t={t}
        />
      </section>

      <EmptyModuleNotice
        kind="under_development"
        moduleCode="M7 (tripleToSvgGeometry) · OQ-01"
        description={`Автоматическая проекция выбранной целочисленной тройки класса CL-R${selectedRadius}-D${selectedRadius * 2} на SVG-доску и переключение ориентации осей (OQ-01: b_horizontal_a_vertical vs a_horizontal_b_vertical) будут подключены после реализации адаптера M7.`}
        expectedInputs="Контракт интерфейса M7SvgProjectionInput: { tripleId, classId, exactA, exactB, exactC, exactR, orientation: OQ-01 }. Сейчас выше показан сохранённый SVG-движок GeometryBoard с ручным перетаскиванием вершин в float64."
        t={t}
      />
    </div>
  );
};
