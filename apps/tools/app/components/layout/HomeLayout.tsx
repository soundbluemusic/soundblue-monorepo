'use client';

import { useParaglideI18n, useTheme } from '@soundblue/shared-react';
import { Code2, FileText, Globe, Info, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import m from '~/lib/messages';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';
import { useToolStore } from '~/stores/tool-store';
import styles from './HomeLayout.module.scss';

// ========================================
// HomeLayout Component - 런처 스타일 홈 레이아웃
// ========================================

export function HomeLayout() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, toggleLanguage, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();
  const { openTool } = useToolStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Filter tools based on search query (memoized)
  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return ALL_TOOLS;

    return ALL_TOOLS.filter((tool) => {
      const nameMatch =
        tool.name.ko.toLowerCase().includes(query) || tool.name.en.toLowerCase().includes(query);
      const descMatch =
        tool.description.ko.toLowerCase().includes(query) ||
        tool.description.en.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }, [searchQuery]);

  const handleToolClick = (tool: ToolInfo) => {
    openTool(tool.id);
    navigate(localizedPath(`/${tool.slug}`));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link to={localizedPath('/')} className={styles.logoLink}>
          {m['brand']?.()}
        </Link>

        <div className={styles.headerControls}>
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedTheme === 'dark' ? m['theme_light']?.() : m['theme_dark']?.()}
            className={styles.themeButton}
          >
            <Sun className={styles.sunIcon} />
            <Moon className={styles.moonIcon} />
          </Button>

          {/* Language Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className={styles.langButton}>
            <Globe className={styles.langIcon} />
            <span className={styles.langText}>{locale === 'ko' ? 'KO' : 'EN'}</span>
          </Button>

          {/* Menu Button */}
          <div className={styles.menuButtonWrapper}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={m['common_menu']?.()}
              aria-expanded={menuOpen}
              className={styles.menuButton}
            >
              {menuOpen ? <X className={styles.menuIcon} /> : <Menu className={styles.menuIcon} />}
            </Button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className={styles.dropdown}>
                <Link
                  to={localizedPath('/built-with')}
                  onClick={() => setMenuOpen(false)}
                  className={styles.dropdownItem}
                >
                  <Code2 className={styles.dropdownIcon} />
                  <span>{m['navigation_builtWith']?.()}</span>
                </Link>
                <Link
                  to={localizedPath('/about')}
                  onClick={() => setMenuOpen(false)}
                  className={styles.dropdownItem}
                >
                  <Info className={styles.dropdownIcon} />
                  <span>{m['navigation_about']?.()}</span>
                </Link>
                <Link
                  to={localizedPath('/sitemap')}
                  onClick={() => setMenuOpen(false)}
                  className={styles.dropdownItem}
                >
                  <FileText className={styles.dropdownIcon} />
                  <span>{m['sidebar_sitemap']?.()}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Search Section */}
          <div className={styles.searchSection}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder={locale === 'ko' ? '도구 검색...' : 'Search tools...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className={styles.toolsGrid}>
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool)}
                className={styles.toolCard}
              >
                {/* Icon */}
                <div className={styles.toolIconWrapper}>{tool.icon}</div>

                {/* Name */}
                <span className={styles.toolName}>{tool.name[locale]}</span>

                {/* Description - hidden on mobile */}
                <span className={styles.toolDescription}>{tool.description[locale]}</span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredTools.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {locale === 'ko' ? '검색 결과가 없습니다' : 'No tools found'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Tools by{' '}
          <a
            href="https://soundbluemusic.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            SoundBlueMusic
          </a>
        </p>
      </footer>
    </div>
  );
}
