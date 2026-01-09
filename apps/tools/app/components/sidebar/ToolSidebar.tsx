'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { NavLink } from 'react-router';
import { useToolStore } from '~/stores/tool-store';

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

// ========================================
// ToolSidebar Component - Sound Blue Style
// ========================================

export function ToolSidebar() {
  const { locale, localizedPath } = useParaglideI18n();
  const { sidebarCollapsed } = useToolStore();

  const t = {
    navHome: locale === 'ko' ? '홈' : 'Home',
    navAbout: locale === 'ko' ? '소개' : 'About',
    navBenchmark: locale === 'ko' ? '벤치마크' : 'Benchmark',
    navSitemap: locale === 'ko' ? '사이트맵' : 'Sitemap',
  };

  const items = [
    { path: localizedPath('/'), icon: HomeIcon, label: t.navHome },
    { path: localizedPath('/about'), icon: InfoIcon, label: t.navAbout },
    { path: localizedPath('/benchmark'), icon: ChartIcon, label: t.navBenchmark },
    { path: localizedPath('/sitemap'), icon: SitemapIcon, label: t.navSitemap },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-(--header-height) left-0 bottom-0 bg-(--color-bg-secondary) border-r border-(--color-border-primary) overflow-y-auto overflow-x-hidden z-50 transition-[width] duration-150 scrollbar-thin scrollbar-thumb-(--color-border-primary) scrollbar-track-transparent ${
        sidebarCollapsed ? 'w-(--sidebar-collapsed-width)' : 'w-(--sidebar-width)'
      }`}
    >
      <nav className="py-4" aria-label="Main navigation">
        <ul className="list-none m-0 p-0">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="mb-1 px-3">
                <NavLink
                  to={item.path}
                  end={item.path === localizedPath('/')}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium no-underline transition-all duration-150 focus-visible:outline-2 focus-visible:outline-(--color-border-focus) focus-visible:outline-offset-2 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-(--color-accent-light) text-(--color-accent-primary)'
                        : 'text-(--color-text-secondary) hover:bg-(--color-interactive-hover) hover:text-(--color-text-primary)'
                    }`
                  }
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
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
