/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ClassificationSectionId } from '../../types/classification.ts';
import { Translations } from '../../i18n/translations.ts';
import { WORKSPACE_SECTION_ORDER } from './workspaceMetadata.ts';
import {
  Grid,
  Layers,
  Table2,
  GitFork,
  Compass,
  Network,
  ShieldCheck,
  History,
} from 'lucide-react';

interface ClassificationSidebarProps {
  activeSection: ClassificationSectionId;
  onSelectSection: (section: ClassificationSectionId) => void;
  onOpenLegacyLab: () => void;
  t: Translations;
}

const SECTION_ICONS: Record<ClassificationSectionId, React.ReactNode> = {
  class_atlas: <Grid className="w-4 h-4 shrink-0" />,
  class_inspector: <Layers className="w-4 h-4 shrink-0" />,
  triple_matrix: <Table2 className="w-4 h-4 shrink-0" />,
  hyperbola_divisors: <GitFork className="w-4 h-4 shrink-0" />,
  geometric_inspector: <Compass className="w-4 h-4 shrink-0" />,
  structural_analysis: <Network className="w-4 h-4 shrink-0" />,
  verification_export: <ShieldCheck className="w-4 h-4 shrink-0" />,
};

export const ClassificationSidebar: React.FC<ClassificationSidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenLegacyLab,
  t,
}) => {
  return (
    <>
      {/* Desktop Persistent Sidebar Rail */}
      <aside
        aria-label={t.classificationLab.sidebarWorkspaceLabel}
        className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 justify-between overflow-y-auto"
      >
        <div className="p-4 space-y-6">
          <div className="space-y-1.5">
            <div className="px-2.5 pb-1 text-xs font-semibold text-slate-500">
              {t.classificationLab.sidebarWorkspaceLabel}
            </div>
            <nav className="space-y-1">
              {WORKSPACE_SECTION_ORDER.map((id) => {
                const isActive = activeSection === id;
                const label = t.classificationLab.sections[id].short;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectSection(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span className={isActive ? 'text-blue-300' : 'text-slate-400'}>
                      {SECTION_ICONS[id]}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Separated Legacy Geometry Laboratory Link */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2">
          <div className="px-1 text-xs font-medium text-slate-500">
            {t.classificationLab.sidebarLegacySectionLabel}
          </div>
          <button
            type="button"
            onClick={onOpenLegacyLab}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{t.classificationLab.legacyBtn}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Compact Horizontal Section Bar */}
      <nav
        aria-label={t.classificationLab.sidebarWorkspaceLabel}
        className="flex md:hidden items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto shrink-0"
      >
        {WORKSPACE_SECTION_ORDER.map((id) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectSection(id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.classificationLab.sections[id].short}
            </button>
          );
        })}
      </nav>
    </>
  );
};
