/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { EmptyStateKind } from '../../types/classification.ts';
import { Translations } from '../../i18n/translations.ts';

interface EmptyModuleNoticeProps {
  kind: EmptyStateKind;
  moduleCode: string;
  description: string;
  expectedInputs?: string;
  t: Translations;
}

export const EmptyModuleNotice: React.FC<EmptyModuleNoticeProps> = ({
  kind,
  moduleCode,
  description,
  expectedInputs,
  t,
}) => {
  const statusGlyph =
    kind === 'not_implemented'
      ? '○'
      : kind === 'awaiting_verified_data'
        ? '◌'
        : '△';

  const statusTone =
    kind === 'not_implemented'
      ? 'text-slate-700'
      : kind === 'awaiting_verified_data'
        ? 'text-amber-700'
        : 'text-indigo-700';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <span className={`text-xs font-semibold ${statusTone}`}>
          <span aria-hidden="true" className="mr-1.5 font-mono">
            {statusGlyph}
          </span>
          {t.classificationLab.emptyStates[kind]}
        </span>
        <span className="text-xs font-mono text-slate-500">
          {moduleCode}
        </span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
      {expectedInputs && (
        <p className="text-xs text-slate-500 font-mono">
          {expectedInputs}
        </p>
      )}
    </div>
  );
};
