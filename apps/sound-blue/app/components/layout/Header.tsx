import { useParaglideI18n, useTheme } from '@soundblue/shared-react';
import { Link } from 'react-router';
import { SearchBox, ThemeIcon } from '~/components/ui';
import { ToolsIcon } from '~/constants/icons';
import m from '~/lib/messages';
import styles from './Header.module.scss';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onSidebarToggle, isSidebarOpen = true }: HeaderProps) {
  const { toggleLanguage, localizedPath } = useParaglideI18n();
  const { resolvedTheme, toggleTheme } = useTheme();

  const themeTitle = resolvedTheme === 'light' ? m['header.themeDark']() : m['header.themeLight']();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Sidebar Toggle - Desktop only */}
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            className={styles.sidebarToggle}
            title={isSidebarOpen ? m['header.sidebarClose']() : m['header.sidebarOpen']()}
            aria-label={isSidebarOpen ? m['header.sidebarClose']() : m['header.sidebarOpen']()}
            aria-expanded={isSidebarOpen}
          >
            <svg
              className={styles.toggleIcon}
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
        <Link to={localizedPath('/')} className={styles.logo}>
          <span className={styles.logoText}>Sound Blue</span>
        </Link>

        {/* Search */}
        <SearchBox />

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Tools Button */}
        <a
          href="https://tools.soundbluemusic.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.toolsLink}
          title={m['externalLinks.tools']()}
        >
          <ToolsIcon className={styles.toolsIcon} />
          <span>{m['externalLinks.tools']()}</span>
        </a>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.iconButton}
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={resolvedTheme as 'light' | 'dark'} />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={styles.langButton}
            title={m['header.langSwitch']()}
            aria-label={m['header.langSwitch']()}
          >
            <svg
              className={styles.langIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className={styles.langCode}>{m['header.langCode']()}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
