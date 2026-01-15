import { useParaglideI18n } from '@soundblue/i18n';
import { useTheme } from '@soundblue/ui-components/base';
import { ServiceMenu } from '@soundblue/ui-components/composite';
import { Link } from 'react-router';
import { SearchBox, ThemeIcon } from '~/components/ui';
import m from '~/lib/messages';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onSidebarToggle, isSidebarOpen = true }: HeaderProps) {
  const { toggleLanguage, localizedPath, locale } = useParaglideI18n();
  const { resolvedTheme, toggleTheme } = useTheme();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';

  const themeTitle = resolvedTheme === 'light' ? m['header.themeDark']() : m['header.themeLight']();

  return (
    <header className="fixed inset-x-0 top-0 z-[100] h-[var(--header-height)] bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)] supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] supports-[padding:env(safe-area-inset-top)]:h-[calc(56px+env(safe-area-inset-top))] max-md:h-[52px] max-md:supports-[padding:env(safe-area-inset-top)]:h-[calc(52px+env(safe-area-inset-top))]">
      <div className="flex items-center gap-4 w-full h-full px-4 pl-[calc(var(--sidebar-width)+16px)] max-md:px-3 max-md:gap-2">
        {/* Sidebar Toggle - Desktop only */}
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center w-10 h-10 p-0 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] transition-colors duration-150 cursor-pointer border-none bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 max-md:w-9 max-md:h-9"
            title={isSidebarOpen ? m['header.sidebarClose']() : m['header.sidebarOpen']()}
            aria-label={isSidebarOpen ? m['header.sidebarClose']() : m['header.sidebarOpen']()}
            aria-expanded={isSidebarOpen}
          >
            <svg
              className="w-[1.125rem] h-[1.125rem] shrink-0"
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
          className="flex items-center gap-1.5 no-underline shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
        >
          <span className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight max-md:text-lg">
            Sound Blue
          </span>
        </Link>

        {/* Search */}
        <SearchBox />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Service Menu */}
          <ServiceMenu currentApp="sound-blue" locale={currentLocale} />
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
            title={m['header.langSwitch']()}
            aria-label={`${m['header.langSwitch']()} (${m['header.langCode']()})`}
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
              {m['header.langCode']()}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
