'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Link, useRouterState } from '@tanstack/react-router';
import { TOOL_CATEGORIES } from '~/lib/toolCategories';
import { useToolStore } from '~/stores/tool-store';
import { ToolCategory } from './ToolCategory';

// ========================================
// Icon Components
// ========================================

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function SitemapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ChangelogIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
      />
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
    </svg>
  );
}

// ========================================
// ToolSidebar Component - Sound Blue Style
// ========================================

export function ToolSidebar() {
  const { locale, localizedPath } = useParaglideI18n();
  const { sidebarCollapsed, openTool } = useToolStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const t = {
    navHome: locale === 'ko' ? '홈' : 'Home',
    navAbout: locale === 'ko' ? '소개' : 'About',
    navBenchmark: locale === 'ko' ? '벤치마크' : 'Benchmark',
    navSitemap: locale === 'ko' ? '사이트맵' : 'Sitemap',
    navChangelog: locale === 'ko' ? '변경 이력' : 'Changelog',
  };

  const items = [
    { path: localizedPath('/'), icon: HomeIcon, label: t.navHome },
    { path: localizedPath('/about'), icon: InfoIcon, label: t.navAbout },
    { path: localizedPath('/benchmark'), icon: ChartIcon, label: t.navBenchmark },
    { path: localizedPath('/sitemap'), icon: SitemapIcon, label: t.navSitemap },
    { path: localizedPath('/changelog'), icon: ChangelogIcon, label: t.navChangelog },
  ];

  return (
    <aside
      className={`sidebar-transition flex flex-col fixed top-[var(--header-height)] left-0 bottom-0 w-[var(--sidebar-width)] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)] overflow-y-auto overflow-x-hidden z-50 max-md:hidden scrollbar-thin scrollbar-thumb-[var(--color-border-primary)] scrollbar-track-transparent ${
        sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}
    >
      <nav className="py-4" aria-label="Main navigation">
        <ul className="list-none m-0 p-0">
          {items.map((item) => {
            const Icon = item.icon;
            const homePath = localizedPath('/');
            const isHome = item.path === homePath;
            const isActive = isHome ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <li key={item.path} className="mb-1 px-3">
                <Link
                  to={item.path}
                  preload="intent"
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium no-underline transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 ${
                    sidebarCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="flex items-center justify-center w-5 h-5 shrink-0">
                    <Icon />
                  </span>
                  {!sidebarCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-4 border-t border-[var(--color-border-primary)] pt-4">
        <div
          className={`px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
            sidebarCollapsed ? 'sr-only' : ''
          }`}
        >
          {locale === 'ko' ? '도구' : 'Tools'}
        </div>
        <div className="space-y-2 px-2 pb-4">
          {TOOL_CATEGORIES.map((category) => (
            <ToolCategory
              key={category.id}
              category={category}
              onToolClick={openTool}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
