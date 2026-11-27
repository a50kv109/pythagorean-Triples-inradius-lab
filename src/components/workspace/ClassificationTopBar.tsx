/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ClassificationSectionId } from '../../types/classification.ts';
import { Translations } from '../../i18n/translations.ts';
import { Compass } from 'lucide-react';
import { WORKSPACE_SECTION_ORDER } from './workspaceMetadata.ts';

interface ClassificationTopBarProps {
  activeSection: ClassificationSectionId;
  onSelectSection: (section: ClassificationSectionId) => void;
  onOpenLegacyLab: () => void;
  t: Translations;
}

export const ClassificationTopBar: React.FC<ClassificationTopBarProps> = ({
  activeSection,
  onSelectSection,
  onOpenLegacyLab,
  t,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center justify-between gap-4 px-5 lg:px-7 py-3">
        {/* Zone 1: Single text element wordmark */}
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          {t.classificationLab.brandTitle}
        </span>

        {/* Zone 2: All 7 concise single-line text navigation links */}
        <nav
          aria-label={t.classificationLab.sidebarWorkspaceLabel}
          className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600 overflow-x-auto min-w-0 py-0.5"
        >
          {WORKSPACE_SECTION_ORDER.map((id) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectSection(id)}
                title={t.classificationLab.sections[id].title}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {t.classificationLab.sections[id].navShort}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action to isolated Legacy Geometry Laboratory */}
        <button
          type="button"
          onClick={onOpenLegacyLab}
          className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Compass className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>{t.classificationLab.legacyBtn}</span>
        </button>
      </div>
    </header>
  );
};
