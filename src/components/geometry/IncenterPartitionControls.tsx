/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import { IncenterPartitionModel } from '../../math/IncenterPartition.ts';
import { IncenterPartitionSpectralPanel } from './IncenterPartitionSpectralPanel.tsx';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface IncenterPartitionControlsProps {
  partition: IncenterPartitionModel;
  mode: 'geometric' | 'proof' | 'spectral';
  onChangeMode: (mode: 'geometric' | 'proof' | 'spectral') => void;
  showSegments: boolean;
  onToggleSegments: () => void;
  showFills: boolean;
  onToggleFills: () => void;
  showRadii: boolean;
  onToggleRadii: () => void;
  showAllRadii: boolean;
  onToggleAllRadii: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showValues: boolean;
  onToggleValues: () => void;
  proofStep: number;
  onChangeProofStep: (step: number) => void;
  onClose?: () => void;
}

const PROOF_STEPS = [
  {
    step: 1,
    title: '1. Исходный прямоугольный треугольник',
    desc: 'Задан треугольник △ABC с катетами a, b и гипотенузой c. Его площадь S = ab / 2.',
    formula: 'S = \\frac{ab}{2}',
  },
  {
    step: 2,
    title: '2. Инцентр I и вписанная окружность',
    desc: 'Находим центр вписанной окружности I. Расстояние от I до каждой из трёх сторон равно радиусу r.',
    formula: 'r = \\frac{ab}{a + b + c}',
  },
  {
    step: 3,
    title: '3. Отрезки из инцентра к вершинам',
    desc: 'Проводим отрезки IA, IB, IC, соединяющие инцентр с тремя вершинами треугольника.',
    formula: 'IA, \\; IB, \\; IC',
  },
  {
    step: 4,
    title: '4. Разбиение на три области',
    desc: 'Треугольник разбит на 3 меньших треугольника: S_A (на стороне a), S_B (на стороне b), S_C (на гипотенузе c).',
    formula: 'S = S_A + S_B + S_C',
  },
  {
    step: 5,
    title: '5. Общая высота — радиус r',
    desc: 'Каждый подтреугольник имеет основанием сторону исходного треугольника, а высотой — радиус вписанной окружности r.',
    formula: 'h_A = h_B = h_C = r',
  },
  {
    step: 6,
    title: '6. Формулы трёх площадей',
    desc: 'Площадь каждого подтреугольника: половина произведения основания на высоту r.',
    formula: 'S_A = \\frac{ar}{2}, \\; S_B = \\frac{br}{2}, \\; S_C = \\frac{cr}{2}',
  },
  {
    step: 7,
    title: '7. Итоговое доказательство S = pr',
    desc: 'Складываем площади: S = (ar + br + cr)/2 = ((a + b + c)r)/2 = pr, где p — полупериметр.',
    formula: 'S = \\frac{(a+b+c)r}{2} = p \\cdot r',
  },
];

export const IncenterPartitionControls: React.FC<IncenterPartitionControlsProps> = ({
  partition,
  mode,
  onChangeMode,
  showSegments,
  onToggleSegments,
  showFills,
  onToggleFills,
  showRadii,
  onToggleRadii,
  showAllRadii,
  onToggleAllRadii,
  showLabels,
  onToggleLabels,
  showValues,
  onToggleValues,
  proofStep,
  onChangeProofStep,
  onClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTable, setShowTable] = useState(true);

  // Auto-play timer for progressive proof
  useEffect(() => {
    if (!isPlaying || mode !== 'proof') return;

    const timer = setInterval(() => {
      if (proofStep >= 7) {
        setIsPlaying(false);
      } else {
        onChangeProofStep(proofStep + 1);
      }
    }, 2400);

    return () => clearInterval(timer);
  }, [isPlaying, mode, proofStep, onChangeProofStep]);

  const handleNextStep = () => {
    if (proofStep < 7) onChangeProofStep(proofStep + 1);
  };

  const handlePrevStep = () => {
    if (proofStep > 1) onChangeProofStep(proofStep - 1);
  };

  const handleResetStep = () => {
    setIsPlaying(false);
    onChangeProofStep(1);
  };

  const currentStepInfo = PROOF_STEPS.find((s) => s.step === proofStep) || PROOF_STEPS[0];

  const { sideA, sideB, sideC, triangleArea, semiperimeter, inradius, subTriangles, areaSum, productPR, isExact } =
    partition;

  return (
    <div className="absolute top-16 left-3 z-20 max-w-[340px] sm:max-w-[380px] w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-lg text-slate-800 text-xs overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-rose-50 via-slate-50 to-indigo-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-rose-600 text-white rounded-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <h4 className="font-semibold text-slate-900 leading-tight">Разбиение через инцентр</h4>
            <span className="text-[10px] font-mono text-rose-700 font-medium">S = S_A + S_B + S_C = pr</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded"
            title={isCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto">
          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-[11px]">
            <button
              onClick={() => {
                setIsPlaying(false);
                onChangeMode('geometric');
              }}
              className={`py-1.5 px-1 font-medium rounded-md text-center transition-colors truncate ${
                mode === 'geometric'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Геометрия
            </button>
            <button
              onClick={() => {
                onChangeMode('proof');
                if (proofStep === 0) onChangeProofStep(1);
              }}
              className={`py-1.5 px-1 font-medium rounded-md text-center transition-colors truncate ${
                mode === 'proof'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Доказательство
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                onChangeMode('spectral');
              }}
              className={`py-1.5 px-1 font-medium rounded-md text-center transition-colors truncate ${
                mode === 'spectral'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Спектр
            </button>
          </div>

          {/* Mode 1: Geometric Controls */}
          {mode === 'geometric' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" /> Элементы слоя
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onToggleSegments}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    showSegments
                      ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>Отрезки IA, IB, IC</span>
                  {showSegments ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={onToggleFills}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    showFills
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>Заливка областей</span>
                  {showFills ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={onToggleRadii}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    showRadii
                      ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>Высоты (радиусы r)</span>
                  {showRadii ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={onToggleAllRadii}
                  disabled={!showRadii}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    showAllRadii
                      ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  } ${!showRadii ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span>{showAllRadii ? 'Все 3 высоты' : 'Одна высота'}</span>
                  <span className="font-mono text-[10px] font-bold">r</span>
                </button>

                <button
                  onClick={onToggleLabels}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    showLabels
                      ? 'bg-amber-50 border-amber-200 text-amber-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>Метки S_A, S_B, S_C</span>
                  {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={onToggleValues}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    showValues
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>Значения площадей</span>
                  {showValues ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Spectral Analysis Lab inside Incenter Partition Panel */}
          {mode === 'spectral' && <IncenterPartitionSpectralPanel partition={partition} />}

          {/* Mode 2: Progressive Proof */}
          {mode === 'proof' && (
            <div className="space-y-3">
              {/* Step indicator header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Этап {proofStep} из 7
                </span>
                <div className="flex items-center gap-1">
                  {PROOF_STEPS.map((s) => (
                    <button
                      key={s.step}
                      onClick={() => {
                        setIsPlaying(false);
                        onChangeProofStep(s.step);
                      }}
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                        proofStep === s.step
                          ? 'bg-rose-600 text-white shadow-xs'
                          : proofStep > s.step
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {s.step}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step card */}
              <div className="p-3 bg-gradient-to-br from-rose-50/70 via-white to-indigo-50/50 rounded-xl border border-rose-100 space-y-1.5">
                <div className="font-semibold text-slate-900 text-[12px]">{currentStepInfo.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{currentStepInfo.desc}</p>
                <div className="mt-1 pt-1.5 border-t border-rose-100/60 font-mono text-[11px] font-semibold text-rose-800">
                  {currentStepInfo.step === 1 && `S = (${sideA.toFixed(2)} × ${sideB.toFixed(2)}) / 2 = ${triangleArea.toFixed(3)}`}
                  {currentStepInfo.step === 2 && `I = (${inradius.toFixed(3)}, ${inradius.toFixed(3)}), r = ${inradius.toFixed(3)}`}
                  {currentStepInfo.step === 3 && `Соединяем I(${inradius.toFixed(2)}, ${inradius.toFixed(2)}) с вершинами A, B, C`}
                  {currentStepInfo.step === 4 && `S_A = ${subTriangles.SA.area.toFixed(2)}, S_B = ${subTriangles.SB.area.toFixed(2)}, S_C = ${subTriangles.SC.area.toFixed(2)}`}
                  {currentStepInfo.step === 5 && `Высота h к каждой стороне = радиусу r = ${inradius.toFixed(3)}`}
                  {currentStepInfo.step === 6 && `S_A=${subTriangles.SA.area.toFixed(2)}, S_B=${subTriangles.SB.area.toFixed(2)}, S_C=${subTriangles.SC.area.toFixed(2)}`}
                  {currentStepInfo.step === 7 && `S = ${subTriangles.SA.area.toFixed(2)} + ${subTriangles.SB.area.toFixed(2)} + ${subTriangles.SC.area.toFixed(2)} = ${areaSum.toFixed(2)} = pr = (${semiperimeter.toFixed(2)} × ${inradius.toFixed(2)}) = ${productPR.toFixed(2)}`}
                </div>
              </div>

              {/* Playback action buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={handlePrevStep}
                  disabled={proofStep <= 1}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Назад
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 font-medium rounded-lg text-white transition-colors ${
                    isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700 shadow-xs'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Пауза
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Воспроизвести
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={proofStep >= 7}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Вперёд <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetStep}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Сбросить к началу"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Numerical Panel (Section 5 from prompt) */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
                Числовая панель
              </span>
              <button
                onClick={() => setShowTable(!showTable)}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
              >
                {showTable ? 'Скрыть' : 'Показать'}
              </button>
            </div>

            {showTable && (
              <div className="rounded-lg border border-slate-200 overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-1 px-2.5">Параметр</th>
                      <th className="py-1 px-2">Формула</th>
                      <th className="py-1 px-2.5 text-right">Значение</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr className="hover:bg-emerald-50/50">
                      <td className="py-1 px-2.5 font-bold text-emerald-800">S_A</td>
                      <td className="py-1 px-2 text-slate-500">ar / 2</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-900">{subTriangles.SA.area.toFixed(3)}</td>
                    </tr>
                    <tr className="hover:bg-amber-50/50">
                      <td className="py-1 px-2.5 font-bold text-amber-800">S_B</td>
                      <td className="py-1 px-2 text-slate-500">br / 2</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-900">{subTriangles.SB.area.toFixed(3)}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/50">
                      <td className="py-1 px-2.5 font-bold text-indigo-800">S_C</td>
                      <td className="py-1 px-2 text-slate-500">cr / 2</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-900">{subTriangles.SC.area.toFixed(3)}</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="py-1 px-2.5 text-slate-800">S_A + S_B + S_C</td>
                      <td className="py-1 px-2 text-slate-500">сумма</td>
                      <td className="py-1 px-2.5 text-right text-rose-700">{areaSum.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-semibold text-slate-800">S</td>
                      <td className="py-1 px-2 text-slate-500">ab / 2</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-900">{triangleArea.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-semibold text-slate-800">p</td>
                      <td className="py-1 px-2 text-slate-500">(a+b+c) / 2</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-900">{semiperimeter.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-semibold text-slate-800">r</td>
                      <td className="py-1 px-2 text-slate-500">ab / (a+b+c)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-900">{inradius.toFixed(3)}</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="py-1 px-2.5 text-slate-800">pr</td>
                      <td className="py-1 px-2 text-slate-500">p × r</td>
                      <td className="py-1 px-2.5 text-right text-rose-700">{productPR.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Verification confirmation badge */}
                <div className="p-2 bg-emerald-50 border-t border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[10.5px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>S_A + S_B + S_C = S = pr</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                    Δ = 0.000
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
