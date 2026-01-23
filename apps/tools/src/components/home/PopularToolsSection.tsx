'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Link } from '@tanstack/react-router';
import { ALL_TOOLS } from '~/lib/toolCategories';
import type { ToolType } from '~/stores/tool-store';

interface PopularToolsSectionProps {
  onToolClick: (toolId: ToolType) => void;
}

// ========================================
// PopularToolsSection - Minimal Card Style
// ========================================

export function PopularToolsSection({ onToolClick }: PopularToolsSectionProps) {
  const { locale, localizedPath } = useParaglideI18n();

  const t = {
    popularTitle: locale === 'ko' ? '도구' : 'Tools',
    popularDesc: locale === 'ko' ? '자주 사용하는 도구들' : 'Your frequently used tools',
  };

  return (
    <section>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
          {t.popularTitle}
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">{t.popularDesc}</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALL_TOOLS.map((tool) => (
          <Link
            key={tool.id}
            to={localizedPath(`/${tool.slug}`)}
            preload="intent"
            onClick={() => onToolClick(tool.id)}
            className="flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl text-left hover:bg-[var(--color-interactive-hover)] active:scale-[0.98] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 no-underline"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] shrink-0">
              <span className="text-2xl" aria-hidden="true">
                {tool.icon}
              </span>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {tool.name[locale]}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                {tool.description[locale]}
              </p>
            </div>

            {/* Arrow */}
            <svg
              className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
