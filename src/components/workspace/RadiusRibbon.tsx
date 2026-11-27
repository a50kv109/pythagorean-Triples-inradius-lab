/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useState } from 'react';
import { LanguageCode, Translations } from '../../i18n/translations.ts';
import { REFERENCE_RADII_PRESETS } from './workspaceMetadata.ts';
import { Minus, Plus, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface RadiusRibbonProps {
  selectedRadius: number;
  onSelectRadius: (r: number) => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  t: Translations;
}

export const RadiusRibbon: React.FC<RadiusRibbonProps> = ({
  selectedRadius,
  onSelectRadius,
  lang,
  setLang,
  isInspectorOpen,
  onToggleInspector,
  t,
}) => {
  const [draftInput, setDraftInput] = useState<string>(String(selectedRadius));
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    setDraftInput(String(selectedRadius));
    setInputError(null);
  }, [selectedRadius]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(draftInput.trim());
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1_000_000_000) {
      setInputError(t.classificationLab.invalidRadiusError);
      return;
    }
    setInputError(null);
    onSelectRadius(parsed);
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-5 lg:px-7 py-2 shrink-0 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Global Compact Radius Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleApplySubmit} className="flex items-center gap-1.5">
          <label
            htmlFor="global-radius-input"
            className="text-xs font-semibold text-slate-700 whitespace-nowrap"
          >
            {t.classificationLab.radiusLabel}
          </label>
          <div className="flex items-center bg-white border border-slate-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => onSelectRadius(Math.max(1, selectedRadius - 1))}
              disabled={selectedRadius <= 1}
              aria-label="Уменьшить радиус r"
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              id="global-radius-input"
              type="text"
              inputMode="numeric"
              value={draftInput}
              onChange={(e) => {
                setDraftInput(e.target.value);
                setInputError(null);
              }}
              className="w-16 px-2 py-1 text-center text-sm font-mono font-semibold tabular-nums text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onSelectRadius(selectedRadius + 1)}
              aria-label="Увеличить радиус r"
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {t.classificationLab.applyRadiusBtn}
          </button>
        </form>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span>{t.classificationLab.diameterLabel}:</span>
          <span className="font-mono font-semibold tabular-nums text-slate-900">
            {selectedRadius * 2}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-mono text-slate-700">
            CL-R{selectedRadius}-D{selectedRadius * 2}
          </span>
        </div>

        {inputError && (
          <span className="text-xs font-medium text-rose-700">{inputError}</span>
        )}
      </div>

      {/* Center: Quick Reference Radii */}
      <div className="hidden lg:flex items-center gap-1 flex-wrap">
        <span className="text-xs text-slate-500 mr-1 whitespace-nowrap">
          {t.classificationLab.quickRadiiLabel}
        </span>
        {REFERENCE_RADII_PRESETS.map((preset) => {
          const active = preset.r === selectedRadius;
          return (
            <button
              key={preset.r}
              type="button"
              onClick={() => onSelectRadius(preset.r)}
              title={preset.note}
              className={`px-2 py-1 text-xs font-mono tabular-nums rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {preset.r}
            </button>
          );
        })}
      </div>

      {/* Right: Language Switcher & Inspector Toggle */}
      <div className="flex items-center gap-2.5">
        <div
          role="group"
          aria-label="Language"
          className="flex items-center p-0.5 bg-slate-200/80 rounded-md text-xs font-mono font-semibold"
        >
          {(['ru', 'uk', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-2 py-0.5 rounded transition-colors uppercase whitespace-nowrap shrink-0 ${
                lang === code
                  ? 'bg-white text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleInspector}
          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          {isInspectorOpen ? (
            <>
              <PanelRightClose className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">{t.classificationLab.toggleInspectorHide}</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">{t.classificationLab.toggleInspectorShow}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
