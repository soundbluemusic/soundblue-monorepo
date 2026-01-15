'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useTheme } from '@soundblue/ui-components/base';
import { ServiceMenu } from '@soundblue/ui-components/composite';
import { Link } from 'react-router';
import { useToolStore } from '~/stores/tool-store';

// ========================================
// Header Component - Sound Blue Style
// ========================================

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  if (theme === 'dark') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" strokeWidth="2" />
        <path
          strokeWidth="2"
          strokeLinecap="round"
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      />
    </svg>
  );
}

function SidebarIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path strokeWidth="2" d="M9 3v18" />
      {!isOpen && <path strokeWidth="2" strokeLinecap="round" d="M14 9l3 3-3 3" />}
    </svg>
  );
}

export function Header() {
  const { toggleLanguage, localizedPath, locale } = useParaglideI18n();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { sidebarCollapsed, toggleSidebarCollapse } = useToolStore();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';

  const t = {
    appTitle: 'Tools',
    sidebarOpen: locale === 'ko' ? '사이드바 열기' : 'Open sidebar',
    sidebarClose: locale === 'ko' ? '사이드바 닫기' : 'Close sidebar',
    themeDark: locale === 'ko' ? '다크 모드' : 'Dark mode',
    themeLight: locale === 'ko' ? '라이트 모드' : 'Light mode',
    langSwitch: locale === 'ko' ? '영어로 전환' : 'Switch to Korean',
    langCode: locale === 'ko' ? 'EN' : 'KO',
  };

  const themeTitle = resolvedTheme === 'light' ? t.themeDark : t.themeLight;
  const sidebarTitle = sidebarCollapsed ? t.sidebarOpen : t.sidebarClose;

  return (
    <header className="fixed inset-x-0 top-0 z-[100] h-[var(--header-height)] bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)] max-md:h-[52px]">
      <div className="flex items-center gap-4 w-full h-full px-4 pl-[calc(var(--sidebar-width)+16px)] max-md:px-3 max-md:gap-2 max-md:!pl-3">
        {/* Sidebar Toggle - Desktop only */}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center w-10 h-10 p-0 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] transition-colors duration-150 cursor-pointer border-none bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
          title={sidebarTitle}
          aria-label={sidebarTitle}
          aria-expanded={sidebarCollapsed ? 'false' : 'true'}
        >
          <SidebarIcon isOpen={!sidebarCollapsed} />
        </button>

        {/* Logo */}
        <Link
          to={localizedPath('/')}
          className="flex items-center gap-1.5 no-underline shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
        >
          <span className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight max-md:text-lg">
            {t.appTitle}
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Service Menu */}
          <ServiceMenu currentApp="tools" locale={currentLocale} />
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center min-w-11 min-h-11 w-10 h-10 p-0 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] transition-colors duration-150 cursor-pointer border-none bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 max-md:w-9 max-md:h-9"
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={resolvedTheme as 'light' | 'dark'} />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center justify-center gap-1 min-w-11 min-h-11 h-10 px-3 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] transition-colors duration-150 cursor-pointer border-none bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 max-md:h-9 max-md:px-2"
            title={t.langSwitch}
            aria-label={`${t.langSwitch} (${t.langCode})`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-xs font-semibold tracking-wide" aria-hidden="true">
              {t.langCode}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
