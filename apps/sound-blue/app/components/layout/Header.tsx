import { useTheme } from '@soundblue/shared-react';
import { Link } from 'react-router';
import { SearchBox, ThemeIcon } from '~/components/ui';
import { ToolsIcon } from '~/constants/icons';
import { useI18n } from '~/i18n';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onSidebarToggle, isSidebarOpen = true }: HeaderProps) {
  const { t, toggleLanguage, localizedPath } = useI18n();
  const { resolvedTheme, toggleTheme } = useTheme();

  const themeTitle = resolvedTheme === 'light' ? t.header.themeDark : t.header.themeLight;

  return (
    <header className="view-transition-header fixed top-0 left-0 right-0 z-100 h-14 bg-surface-alt border-b border-line supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] supports-[padding:env(safe-area-inset-top)]:h-[calc(56px+env(safe-area-inset-top))] max-sm:h-13 max-sm:supports-[padding:env(safe-area-inset-top)]:h-[calc(52px+env(safe-area-inset-top))]">
      <div className="flex items-center gap-4 w-full h-full px-4 md:pl-[calc(var(--sidebar-width)+16px)] max-sm:px-3 max-sm:gap-2">
        {/* Sidebar Toggle - Desktop only */}
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            className="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg text-content-muted hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 transition-all duration-150 max-sm:w-9 max-sm:h-9"
            title={isSidebarOpen ? t.header.sidebarClose : t.header.sidebarOpen}
            aria-label={isSidebarOpen ? t.header.sidebarClose : t.header.sidebarOpen}
            aria-expanded={isSidebarOpen}
          >
            <svg
              className="w-4.5 h-4.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              {isSidebarOpen ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <path strokeWidth="2" d="M9 3v18" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <path strokeWidth="2" d="M9 3v18" />
                  <path strokeWidth="2" strokeLinecap="round" d="M14 9l3 3-3 3" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link
          to={localizedPath('/')}
          className="flex items-center gap-1.5 no-underline shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="text-xl font-semibold text-content tracking-tight max-sm:text-lg">
            Sound Blue
          </span>
        </Link>

        {/* Search */}
        <SearchBox />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Tools Button */}
        <a
          href="https://tools.soundbluemusic.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Tools"
        >
          <ToolsIcon className="w-4 h-4" />
          <span>Tools</span>
        </a>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg text-content-muted hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 transition-all duration-150 max-sm:w-9 max-sm:h-9"
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={resolvedTheme as 'light' | 'dark'} />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center justify-center gap-1 w-auto h-10 px-3 bg-transparent rounded-lg text-content-muted hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 transition-all duration-150 max-sm:h-9 max-sm:px-2"
            title={t.header.langSwitch}
            aria-label={t.header.langSwitch}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-xs font-semibold tracking-wide">{t.header.langCode}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
