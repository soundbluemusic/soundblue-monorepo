'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useTheme } from '@soundblue/ui-components/base';
import { Code2, FileText, Globe, Info, Menu, Moon, Sun, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import m from '~/lib/messages';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';
import { useToolStore } from '~/stores/tool-store';

// ========================================
// 검색 대상 페이지 정의
// ========================================
type PageKey = 'home' | 'about' | 'builtWith' | 'sitemap' | 'benchmark';

interface SearchPage {
  path: string;
  key: PageKey;
}

const SITE_PAGES: SearchPage[] = [
  { path: '/', key: 'home' },
  { path: '/about', key: 'about' },
  { path: '/built-with', key: 'builtWith' },
  { path: '/sitemap', key: 'sitemap' },
  { path: '/benchmark', key: 'benchmark' },
];

type SearchResult = { type: 'page'; data: SearchPage } | { type: 'tool'; data: ToolInfo };

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // isMac detection only on client side to avoid hydration mismatch
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  // 페이지 타이틀/설명 가져오기
  const getPageTitle = (key: PageKey): string => {
    const titles: Record<PageKey, () => string | undefined> = {
      home: () => m['navigation_home']?.(),
      about: () => m['navigation_about']?.(),
      builtWith: () => m['navigation_builtWith']?.(),
      sitemap: () => m['sitemap_title']?.(),
      benchmark: () => m['sidebar_benchmark']?.(),
    };
    return titles[key]?.() ?? key;
  };

  const getPageDesc = (key: PageKey): string => {
    const descs: Record<PageKey, () => string | undefined> = {
      home: () => m['about_tagline']?.(),
      about: () => m['about_intro']?.(),
      builtWith: () => m['builtWith_intro']?.(),
      sitemap: () => m['sitemap_sections_main']?.(),
      benchmark: () => m['benchmark_description']?.(),
    };
    return descs[key]?.() ?? '';
  };

  // 검색 결과 (도구 + 페이지)
  const searchResults = useMemo((): SearchResult[] => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const matchedTools: SearchResult[] = ALL_TOOLS.filter((tool) => {
      const name = tool.name[locale];
      const desc = tool.description[locale];
      return (
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q)
      );
    }).map((tool) => ({ type: 'tool', data: tool }));

    const matchedPages: SearchResult[] = SITE_PAGES.filter((page) => {
      const title = getPageTitle(page.key);
      const desc = getPageDesc(page.key);
      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      );
    }).map((page) => ({ type: 'page', data: page }));

    return [...matchedTools, ...matchedPages];
  }, [searchQuery, locale]);

  // 도구만 필터링 (그리드 표시용)
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

  // 전역 키보드 단축키
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  // 외부 클릭 감지
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleGlobalKeyDown, handleClickOutside]);

  const getResultPath = (result: SearchResult): string => {
    if (result.type === 'page') {
      return result.data.path;
    }
    return `/${result.data.slug}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) setIsDropdownOpen(true);
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        break;
      case 'Enter': {
        e.preventDefault();
        const selectedResult = searchResults[selectedIndex];
        if (selectedIndex >= 0 && selectedResult) {
          if (selectedResult.type === 'tool') {
            openTool(selectedResult.data.id);
          }
          navigate(localizedPath(getResultPath(selectedResult)));
          setIsDropdownOpen(false);
          setSearchQuery('');
        }
        break;
      }
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleToolClick = (tool: ToolInfo) => {
    openTool(tool.id);
    navigate(localizedPath(`/${tool.slug}`));
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'tool') {
      openTool(result.data.id);
    }
    navigate(localizedPath(getResultPath(result)));
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--background)">
      {/* Header */}
      <header className="relative z-30 flex h-14 items-center justify-between border-b border-(--border) px-4">
        <Link
          to={localizedPath('/')}
          className="text-lg font-semibold tracking-tight text-(--brand) no-underline"
        >
          {m['brand']?.()}
        </Link>

        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedTheme === 'dark' ? m['theme_light']?.() : m['theme_dark']?.()}
            className="text-(--muted-foreground) hover:text-(--foreground)"
          >
            <Sun className="h-[1.125rem] w-[1.125rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.125rem] w-[1.125rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 text-(--muted-foreground) hover:text-(--foreground)"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{locale === 'ko' ? 'KO' : 'EN'}</span>
          </Button>

          {/* Menu Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={m['common_menu']?.()}
              aria-expanded={menuOpen}
              className="text-(--muted-foreground) hover:text-(--foreground)"
            >
              {menuOpen ? (
                <X className="h-[1.125rem] w-[1.125rem]" />
              ) : (
                <Menu className="h-[1.125rem] w-[1.125rem]" />
              )}
            </Button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-(--border) bg-(--card) p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                <Link
                  to={localizedPath('/built-with')}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted-foreground) no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-(--foreground)"
                >
                  <Code2 className="h-4 w-4" />
                  <span>{m['navigation_builtWith']?.()}</span>
                </Link>
                <Link
                  to={localizedPath('/about')}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted-foreground) no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-(--foreground)"
                >
                  <Info className="h-4 w-4" />
                  <span>{m['navigation_about']?.()}</span>
                </Link>
                <Link
                  to={localizedPath('/sitemap')}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted-foreground) no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-(--foreground)"
                >
                  <FileText className="h-4 w-4" />
                  <span>{m['sidebar_sitemap']?.()}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Search Section - Sound Blue 스타일 */}
          <div className="mb-8 md:mb-12">
            <div className="relative mx-auto max-w-md" ref={containerRef}>
              <div className="relative flex items-center">
                <svg
                  className="absolute left-4 w-5 h-5 text-(--muted-foreground) pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  role="combobox"
                  placeholder={m['search_placeholder']?.() ?? 'Search...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.currentTarget.value);
                    setIsDropdownOpen(e.currentTarget.value.trim().length > 0);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    if (searchQuery.trim()) setIsDropdownOpen(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12 pl-12 pr-16 text-base rounded-2xl border border-(--border) bg-(--card) transition-all duration-200 placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--ring) focus:ring-offset-2 focus:ring-offset-(--background) [&::-webkit-search-cancel-button]:hidden"
                  aria-label={m['search_label']?.() ?? 'Search'}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                />
                {!isFocused && !searchQuery && (
                  <span className="absolute right-4 flex items-center px-2 py-1 text-xs font-medium text-(--muted-foreground) bg-(--muted)/50 border border-(--border) rounded-lg pointer-events-none">
                    {isMac ? '\u2318K' : 'Ctrl+K'}
                  </span>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-4 flex items-center justify-center w-7 h-7 p-0 bg-transparent border-none rounded-lg text-(--muted-foreground) cursor-pointer transition-all duration-150 hover:text-(--foreground) hover:bg-(--muted)/50 active:scale-90"
                    onClick={handleClear}
                    aria-label={m['search_clear']?.() ?? 'Clear'}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 드롭다운 결과 목록 */}
              {isDropdownOpen && searchResults.length > 0 && (
                <div
                  className="absolute top-[calc(100%+8px)] left-0 right-0 z-[600] max-h-80 overflow-y-auto bg-(--card) border border-(--border) rounded-2xl shadow-lg p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-(--border) [&::-webkit-scrollbar-thumb]:rounded-full"
                  role="listbox"
                >
                  {searchResults.map((result, index) => {
                    const isSelected = index === selectedIndex;
                    if (result.type === 'tool') {
                      const tool = result.data;
                      return (
                        <button
                          key={`tool-${tool.id}`}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`flex items-center gap-3 w-full py-3 px-4 text-left rounded-xl transition-all duration-150 cursor-pointer hover:bg-(--muted)/50 ${
                            isSelected ? 'bg-(--muted)/50' : ''
                          }`}
                          onClick={() => handleResultClick(result)}
                        >
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-(--foreground)">
                              {tool.name[locale]}
                            </span>
                            <span className="text-xs text-(--muted-foreground)">
                              {tool.description[locale]}
                            </span>
                          </div>
                        </button>
                      );
                    }
                    const page = result.data;
                    return (
                      <button
                        key={`page-${page.key}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`flex flex-col gap-0.5 w-full py-3 px-4 text-left rounded-xl transition-all duration-150 cursor-pointer hover:bg-(--muted)/50 ${
                          isSelected ? 'bg-(--muted)/50' : ''
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <span className="text-sm font-medium text-(--foreground)">
                          {getPageTitle(page.key)}
                        </span>
                        <span className="text-xs text-(--muted-foreground)">
                          {getPageDesc(page.key)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 검색 결과 없음 */}
              {isDropdownOpen && searchQuery.trim() && searchResults.length === 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[600] bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6 text-center text-sm text-(--muted-foreground)">
                  {m['search_noResults']?.() ?? 'No results found'}
                </div>
              )}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool)}
                className="group flex flex-col items-center gap-3 rounded-3xl border border-(--border) bg-(--card) p-4 cursor-pointer transition-all duration-200 md:p-6 hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] hover:shadow-lg hover:-translate-y-1 active:scale-98 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-3xl transition-transform duration-200 md:h-16 md:w-16 md:text-4xl group-hover:scale-110">
                  {tool.icon}
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-(--foreground) md:text-base">
                  {tool.name[locale]}
                </span>

                {/* Description - hidden on mobile */}
                <span className="hidden text-center text-xs text-(--muted-foreground) md:block">
                  {tool.description[locale]}
                </span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredTools.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-(--muted-foreground)">
                {m['search_noResults']?.() ?? 'No results found'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) px-4 py-3">
        <p className="text-center text-xs text-(--muted-foreground)">
          {'Tools by '}
          <a
            href="https://soundbluemusic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--primary) no-underline hover:underline"
          >
            SoundBlueMusic
          </a>
        </p>
      </footer>
    </div>
  );
}
