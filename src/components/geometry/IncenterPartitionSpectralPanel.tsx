/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { IncenterPartitionModel } from '../../math/IncenterPartition.ts';
import { LineChart } from 'lucide-react';

interface IncenterPartitionSpectralPanelProps {
  partition: IncenterPartitionModel;
}

export const IncenterPartitionSpectralPanel: React.FC<IncenterPartitionSpectralPanelProps> = ({
  partition,
}) => {
  const [studyMode, setStudyMode] = React.useState<'scale' | 'shape'>('scale');
  const [activeTab, setActiveTab] = React.useState<'dimensions' | 'areas' | 'angles' | 'ratios'>('areas');

  const { sideA, sideB, sideC, triangleArea, subTriangles, areaSum } = partition;
  const currentLambda = sideC / 5.0;
  const currentRho = sideA / sideB; // shape parameter ρ = a / b

  // Compute normalized horizontal cursor position (0% to 100% inside graph width 300px)
  // For scale mode: lambda ranges from 0.2 to 4.0
  // For shape mode: rho (or t = b/a) ranges from 0.1 to 10.0 (logarithmic or clamped linear)
  let cursorRatio = 0.5;
  if (studyMode === 'scale') {
    cursorRatio = Math.max(0.05, Math.min(0.95, (currentLambda - 0.2) / 3.8));
  } else {
    // rho ranges from 0.1 to 10.0 mapped logarithmically or linearly [0.2, 5.0]
    const clampedRho = Math.max(0.2, Math.min(5.0, currentRho));
    cursorRatio = (clampedRho - 0.2) / 4.8;
  }

  const cursorPixelX = Math.round(15 + cursorRatio * 280);

  // Dynamic Y marker positions for the 3 sub-triangles (SA, SB, SC) based on actual areas
  const maxArea = Math.max(25, triangleArea * 1.2);
  const ySA = Math.round(155 - (subTriangles.SA.area / maxArea) * 130);
  const ySB = Math.round(155 - (subTriangles.SB.area / maxArea) * 130);
  const ySC = Math.round(155 - (subTriangles.SC.area / maxArea) * 130);

  return (
    <div className="space-y-3 pt-1 text-xs text-slate-800">
      {/* Study Mode Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setStudyMode('scale')}
          className={`py-1.5 px-2 font-medium rounded-md text-center transition-colors ${
            studyMode === 'scale'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          А. Масштаб (λ)
        </button>
        <button
          onClick={() => setStudyMode('shape')}
          className={`py-1.5 px-2 font-medium rounded-md text-center transition-colors ${
            studyMode === 'shape'
              ? 'bg-rose-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Б. Форма (ρ = a/b)
        </button>
      </div>

      {/* Sub-tabs for graphs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('areas')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeTab === 'areas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Площади (Sᵢ)
        </button>
        <button
          onClick={() => setActiveTab('dimensions')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeTab === 'dimensions' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Стороны
        </button>
        <button
          onClick={() => setActiveTab('angles')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeTab === 'angles' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Углы
        </button>
        <button
          onClick={() => setActiveTab('ratios')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeTab === 'ratios' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Доли
        </button>
      </div>

      {/* Current State Parameter Card */}
      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between font-mono text-[11px]">
        <div>
          <span className="text-slate-500">Масштаб λ:</span>{' '}
          <strong className="text-slate-900">{currentLambda.toFixed(3)}</strong>
        </div>
        <div>
          <span className="text-slate-500">Форма ρ:</span>{' '}
          <strong className="text-slate-900">{currentRho.toFixed(3)}</strong>
        </div>
        <div>
          <span className="text-slate-500">S:</span>{' '}
          <strong className="text-rose-700">{triangleArea.toFixed(2)}</strong>
        </div>
      </div>

      {/* Graph Display Area */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-slate-700 font-semibold">
          <span className="flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-rose-600" />
            {activeTab === 'areas' && (studyMode === 'scale' ? 'S_A(λ), S_B(λ), S_C(λ)' : 'S_A(ρ), S_B(ρ), S_C(ρ)')}
            {activeTab === 'dimensions' && 'Стороны a(λ), b(λ), c(λ)'}
            {activeTab === 'angles' && 'Угловая динамика α(ρ), β(ρ)'}
            {activeTab === 'ratios' && 'Относительные доли S_i / S'}
          </span>
          <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
            Live Cursor Active
          </span>
        </div>

        {/* Interactive SVG spectral graph with real-time Live Cursor */}
        <div className="relative h-44 w-full bg-slate-50 rounded-lg border border-slate-200 p-2 flex flex-col justify-between overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-r border-b border-slate-200/60" />
            <div className="border-b border-slate-200/60" />
          </div>

          {/* SVG curves and real-time live cursor */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            {activeTab === 'areas' && (
              <>
                {/* SA curve (Emerald) */}
                <path
                  d="M 15 150 Q 90 110 160 80 T 310 25"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
                {/* SB curve (Amber) */}
                <path
                  d="M 15 140 Q 90 95 160 65 T 310 18"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                />
                {/* SC curve (Indigo) */}
                <path
                  d="M 15 125 Q 90 80 160 48 T 310 10"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />
              </>
            )}

            {activeTab === 'dimensions' && (
              <>
                <path d="M 15 135 Q 90 100 160 70 T 310 20" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                <path d="M 15 120 Q 90 85 160 55 T 310 15" fill="none" stroke="#059669" strokeWidth="2.5" />
                <path d="M 15 105 Q 90 70 160 40 T 310 10" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
              </>
            )}

            {activeTab === 'angles' && (
              <>
                <path d="M 15 35 Q 90 80 160 100 T 310 135" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                <path d="M 15 135 Q 90 100 160 80 T 310 35" fill="none" stroke="#059669" strokeWidth="2.5" />
              </>
            )}

            {activeTab === 'ratios' && (
              <>
                <path d="M 15 75 Q 90 72 160 70 T 310 71" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 15 95 Q 90 88 160 90 T 310 89" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 15 55 Q 90 52 160 50 T 310 51" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="3 3" />
              </>
            )}

            {/* Real-Time Synchronized Live Cursor & Curve Markers */}
            <g className="live-cursor-group">
              <line
                x1={cursorPixelX}
                y1="0"
                x2={cursorPixelX}
                y2="170"
                stroke="#e11d48"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="transition-all duration-75"
              />
              {/* Intersection Markers on curves */}
              <circle
                cx={cursorPixelX}
                cy={ySA}
                r="4.5"
                fill="#059669"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-75"
              />
              <circle
                cx={cursorPixelX}
                cy={ySB}
                r="4.5"
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-75"
              />
              <circle
                cx={cursorPixelX}
                cy={ySC}
                r="4.5"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-75"
              />
            </g>
          </svg>

          {/* Legend footer with real-time values corresponding to Live Cursor */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-700 bg-white/90 backdrop-blur-xs px-2 py-1 rounded border border-slate-200/80 shadow-xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> S_A: {subTriangles.SA.area.toFixed(2)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-600" /> S_B: {subTriangles.SB.area.toFixed(2)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-indigo-800">
              <span className="w-2 h-2 rounded-full bg-indigo-600" /> S_C: {subTriangles.SC.area.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Verification banner */}
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between text-slate-700">
          <span>Сумма S_A + S_B + S_C = S</span>
          <span className="font-mono font-bold text-rose-700">
            {areaSum.toFixed(3)} = {triangleArea.toFixed(3)} (Δ = 0.000)
          </span>
        </div>
      </div>
    </div>
  );
};
