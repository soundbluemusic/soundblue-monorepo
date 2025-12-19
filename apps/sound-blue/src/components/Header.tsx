import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { useLanguage, useTheme } from '~/components/providers';
import { ToolsIcon } from '~/constants/icons';
import { SearchBoxClient, ThemeIcon } from './ui';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header(props: HeaderProps): JSX.Element {
  const { t, toggleLanguage, localizedPath } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isSidebarOpen = () => props.isSidebarOpen ?? true;

  const themeTitle = () => (theme() === 'light' ? t().header.themeDark : t().header.themeLight);

  return (
    <header class="view-transition-header fixed top-0 left-0 right-0 z-100 h-14 bg-surface-alt border-b border-line supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] supports-[padding:env(safe-area-inset-top)]:h-[calc(56px+env(safe-area-inset-top))] max-sm:h-13 max-sm:supports-[padding:env(safe-area-inset-top)]:h-[calc(52px+env(safe-area-inset-top))]">
      <div class="flex items-center gap-4 w-full h-full px-4 md:pl-[calc(var(--sidebar-width)+16px)] max-sm:px-3 max-sm:gap-2">
        {/* Sidebar Toggle - Desktop only */}
        {props.onSidebarToggle && (
          <button
            type="button"
            onClick={props.onSidebarToggle}
            class="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg text-content-muted hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 transition-all duration-150 max-sm:w-9 max-sm:h-9"
            title={isSidebarOpen() ? t().header.sidebarClose : t().header.sidebarOpen}
            aria-label={isSidebarOpen() ? t().header.sidebarClose : t().header.sidebarOpen}
            aria-expanded={isSidebarOpen()}
          >
            <svg
              class="w-4.5 h-4.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              {isSidebarOpen() ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
                  <path stroke-width="2" d="M9 3v18" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
                  <path stroke-width="2" d="M9 3v18" />
                  <path stroke-width="2" stroke-linecap="round" d="M14 9l3 3-3 3" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* Logo */}
        <A
          href={localizedPath('/')}
          class="flex items-center gap-1.5 no-underline shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span class="text-xl font-semibold text-content tracking-tight max-sm:text-lg">
            Sound Blue
          </span>
        </A>

        {/* Search */}
        <SearchBoxClient />

        {/* Spacer */}
        <div class="flex-1" />

        {/* Tools Button */}
        <a
          href="https://tools.soundbluemusic.com"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Tools"
        >
          <ToolsIcon class="w-4 h-4" />
          <span>Tools</span>
        </a>

        {/* Controls */}
        <div class="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            class="inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg text-content-muted hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 transition-all duration-150 max-sm:w-9 max-sm:h-9"
            title={themeTitle()}
            aria-label={themeTitle()}
          >
            <ThemeIcon theme={theme()} />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            class="inline-flex items-center justify-center gap-1 w-auto h-10 px-3 bg-transparent rounded-lg text-content-muted hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 transition-all duration-150 max-sm:h-9 max-sm:px-2"
            title={t().header.langSwitch}
            aria-label={t().header.langSwitch}
          >
            <svg
              class="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span class="text-xs font-semibold tracking-wide">{t().header.langCode}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
