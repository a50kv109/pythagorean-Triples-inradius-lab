/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { Translations } from '../../../i18n/translations.ts';
import { MathFormula } from '../../common/MathFormula.tsx';
import { EmptyModuleNotice } from '../EmptyModuleNotice.tsx';

interface HyperbolaDivisorSectionProps {
  selectedRadius: number;
  t: Translations;
}

export const HyperbolaDivisorSection: React.FC<HyperbolaDivisorSectionProps> = ({
  selectedRadius,
  t,
}) => {
  const sectionInfo = t.classificationLab.sections.hyperbola_divisors;

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

      {/* Algebraic Model + Schematic Hyperbola Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Exact Equations */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="text-xs font-semibold text-slate-500">
            Точная факторизационная модель (DESIGN_REVIEW.md §2.1–2.2)
          </div>

          <div className="space-y-3 text-sm text-slate-800">
            <div className="overflow-x-auto">
              <MathFormula
                block
                tex="x = a - 2r = c - b, \quad y = b - 2r = c - a, \quad x \cdot y = 2r^2"
              />
            </div>
            <div className="overflow-x-auto">
              <MathFormula
                block
                tex="1 \le x < \sqrt{2}\,r < y \le 2r^2 \qquad \Longrightarrow \qquad a = 2r + x,\; b = 2r + y,\; c = 2r + x + y"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="font-semibold text-slate-800">
              Обратная связь с параметрами Евклида (k, m, n) и (u, v):
            </div>
            <div>
              <MathFormula tex="k = \gcd(x, y) \mid r, \quad \{x_0, y_0\} = \{x/k, y/k\} = \{2u^2, v^2\}, \quad 2 \nmid v, \quad n = u,\; m = u + v" />
            </div>
            <p>
              Неравенство <MathFormula tex="y \le 2r^2" /> нестрогое: верхний предел достигается при <MathFormula tex="x = 1" /> (включая граничный класс <MathFormula tex="r = 1" />, где <MathFormula tex="(x, y) = (1, 2)" />).
            </p>
          </div>
        </section>

        {/* Right: Schematic Diagram (Explicitly non-computed illustrative SVG) */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Схематическая диаграмма гиперболы xy = 2r²
            </span>
            <span className="text-xs font-mono text-amber-700">
              Иллюстрация осей (float64 · без расчёта делителей)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
            <svg
              viewBox="0 0 420 230"
              className="w-full h-auto"
              role="img"
              aria-label="Схематический график гиперболы xy = 2r² с разделением канонической и зеркальной ветвей"
            >
              {/* Grid lines */}
              <line x1="48" y1="20" x2="48" y2="195" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="48" y1="195" x2="395" y2="195" stroke="#94a3b8" strokeWidth="1.2" />

              {/* Canonical shaded domain 1 <= x < sqrt(2)r */}
              <rect x="64" y="25" width="96" height="170" fill="#dbeafe" fillOpacity="0.45" />

              {/* Symmetry line y = x (x = sqrt(2)r boundary) */}
              <line
                x1="48"
                y1="195"
                x2="230"
                y2="13"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <line
                x1="160"
                y1="25"
                x2="160"
                y2="195"
                stroke="#2563eb"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Schematic curve xy = const */}
              <path
                d="M 64 34 C 76 72, 108 106, 160 128 C 215 151, 290 168, 378 178"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.2"
              />

              {/* Boundary marker x = 1, y = 2r^2 */}
              <circle cx="64" cy="34" r="4" fill="#2563eb" />
              <text x="72" y="38" fontSize="11" fill="#1e3a8a" fontFamily="JetBrains Mono, monospace">
                x = 1, y = 2r² (c_max)
              </text>

              {/* Irrational intersection marker (sqrt(2)r, sqrt(2)r) */}
              <circle cx="160" cy="128" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              <text x="168" y="122" fontSize="10.5" fill="#334155" fontFamily="JetBrains Mono, monospace">
                (√2·r, √2·r) ∉ ℕ²
              </text>

              {/* Labels */}
              <text x="74" y="182" fontSize="10.5" fill="#1d4ed8" fontFamily="Plus Jakarta Sans, sans-serif">
                Канон a &lt; b: 1 ≤ x &lt; √2·r
              </text>
              <text x="235" y="156" fontSize="10.5" fill="#64748b" fontFamily="Plus Jakarta Sans, sans-serif">
                Зеркало b &lt; a (исключено)
              </text>
              <text x="380" y="212" fontSize="11" fill="#475569" fontFamily="JetBrains Mono, monospace">
                x
              </text>
              <text x="32" y="30" fontSize="11" fill="#475569" fontFamily="JetBrains Mono, monospace">
                y
              </text>
            </svg>
          </div>

          <p className="text-xs text-slate-500">
            Для <span className="font-mono text-slate-800">r = {selectedRadius}</span> область перебора целых делителей: <MathFormula tex={`1 \\le x \\le \\lfloor\\sqrt{2}\\cdot ${selectedRadius}\\rfloor`} />, условие <MathFormula tex={`(2 \\cdot ${selectedRadius}^2) \\bmod x = 0`} />.
          </p>
        </section>
      </div>

      {/* Empty Divisor Table */}
      <EmptyModuleNotice
        kind="awaiting_verified_data"
        moduleCode="M2 + M3"
        description={`Таблица допустимых пар делителей (x, y) для уравнения xy = 2·${selectedRadius}² (2r² = ${2 * selectedRadius * selectedRadius} в символьном виде) будет заполнена после реализации перебора делителей в M2/M3 и проверки CHK-03, CHK-09.`}
        expectedInputs="Ожидаемые столбцы: x · y · k = gcd(x,y) · x₀ · y₀ · u · v · m · n · восстановленная тройка (a, b, c)"
        t={t}
      />
    </div>
  );
};
