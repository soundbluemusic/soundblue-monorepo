'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Link, useRouterState } from '@tanstack/react-router';

// ========================================
// Icon Components
// ========================================

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

// ========================================
// BottomNavigation Component - Sound Blue Style
// ========================================

export function BottomNavigation() {
  const { locale, localizedPath } = useParaglideI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const t = {
    navHome: locale === 'ko' ? '홈' : 'Home',
    navAbout: locale === 'ko' ? '소개' : 'About',
    navBenchmark: locale === 'ko' ? '벤치' : 'Bench',
    navSitemap: locale === 'ko' ? '맵' : 'Map',
  };

  const items = [
    { path: localizedPath('/'), icon: HomeIcon, label: t.navHome },
    { path: localizedPath('/about'), icon: InfoIcon, label: t.navAbout },
    { path: localizedPath('/benchmark'), icon: ChartIcon, label: t.navBenchmark },
    { path: localizedPath('/sitemap'), icon: SitemapIcon, label: t.navSitemap },
  ];

  return (
    <nav
      className="hidden max-md:block fixed bottom-0 left-0 right-0 h-[var(--bottom-nav-height)] bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-primary)] z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around h-full m-0 p-0 list-none">
        {items.map((item) => {
          const Icon = item.icon;
          const homePath = localizedPath('/');
          const isHome = item.path === homePath;
          const isActive = isHome ? pathname === item.path : pathname.startsWith(item.path);

          return (
            <li key={item.path} className="flex-1 h-full">
              <Link
                to={item.path}
                preload="intent"
                className={`flex flex-col items-center justify-center gap-1 h-full p-2 no-underline transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 ${
                  isActive
                    ? 'text-[var(--color-accent-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                  <Icon />
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
