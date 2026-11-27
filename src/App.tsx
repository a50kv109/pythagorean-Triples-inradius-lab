/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useState } from 'react';
import { ClassificationSectionId, WorkspaceMode } from './types/classification.ts';
import { LanguageCode, TRANSLATIONS } from './i18n/translations.ts';
import { ClassificationTopBar } from './components/workspace/ClassificationTopBar.tsx';
import { RadiusRibbon } from './components/workspace/RadiusRibbon.tsx';
import { ClassificationSidebar } from './components/workspace/ClassificationSidebar.tsx';
import { ContextualInspector } from './components/workspace/ContextualInspector.tsx';
import { LegacyGeometryWorkspace } from './components/workspace/LegacyGeometryWorkspace.tsx';
import { ClassAtlasSection } from './components/workspace/sections/ClassAtlasSection.tsx';
import { ClassInspectorSection } from './components/workspace/sections/ClassInspectorSection.tsx';
import { TripleMatrixSection } from './components/workspace/sections/TripleMatrixSection.tsx';
import { HyperbolaDivisorSection } from './components/workspace/sections/HyperbolaDivisorSection.tsx';
import { GeometricInspectorSection } from './components/workspace/sections/GeometricInspectorSection.tsx';
import { StructuralAnalysisSection } from './components/workspace/sections/StructuralAnalysisSection.tsx';
import { VerificationExportSection } from './components/workspace/sections/VerificationExportSection.tsx';

export default function App() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('classification');
  const [activeSection, setActiveSection] = useState<ClassificationSectionId>('class_atlas');
  const [selectedRadius, setSelectedRadius] = useState<number>(3);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [lang, setLang] = useState<LanguageCode>('ru');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  if (workspaceMode === 'legacy') {
    return (
      <LegacyGeometryWorkspace
        lang={lang}
        setLang={setLang}
        onReturnToClassification={() => setWorkspaceMode('classification')}
      />
    );
  }

  return (
    <div className="flex flex-col h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <ClassificationTopBar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenLegacyLab={() => setWorkspaceMode('legacy')}
        t={t}
      />

      <RadiusRibbon
        selectedRadius={selectedRadius}
        onSelectRadius={setSelectedRadius}
        lang={lang}
        setLang={setLang}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
        t={t}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <ClassificationSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onOpenLegacyLab={() => setWorkspaceMode('legacy')}
          t={t}
        />

        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              {activeSection === 'class_atlas' && (
                <ClassAtlasSection
                  selectedRadius={selectedRadius}
                  onSelectRadius={setSelectedRadius}
                  onNavigateSection={setActiveSection}
                  t={t}
                />
              )}
              {activeSection === 'class_inspector' && (
                <ClassInspectorSection
                  selectedRadius={selectedRadius}
                  onNavigateSection={setActiveSection}
                  t={t}
                />
              )}
              {activeSection === 'triple_matrix' && (
                <TripleMatrixSection
                  selectedRadius={selectedRadius}
                  t={t}
                />
              )}
              {activeSection === 'hyperbola_divisors' && (
                <HyperbolaDivisorSection
                  selectedRadius={selectedRadius}
                  t={t}
                />
              )}
              {activeSection === 'geometric_inspector' && (
                <GeometricInspectorSection
                  selectedRadius={selectedRadius}
                  isInspectorOpen={isInspectorOpen}
                  onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
                  onOpenLegacyLab={() => setWorkspaceMode('legacy')}
                  m7Projection={null}
                  t={t}
                />
              )}
              {activeSection === 'structural_analysis' && (
                <StructuralAnalysisSection
                  selectedRadius={selectedRadius}
                  t={t}
                />
              )}
              {activeSection === 'verification_export' && (
                <VerificationExportSection
                  selectedRadius={selectedRadius}
                  t={t}
                />
              )}
            </div>
          </main>

          {isInspectorOpen && (
            <ContextualInspector
              selectedRadius={selectedRadius}
              activeSection={activeSection}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
}
