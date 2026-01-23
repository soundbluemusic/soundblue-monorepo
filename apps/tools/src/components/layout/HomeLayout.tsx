'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';
import { useToolStore } from '~/stores/tool-store';
import { BottomNavigation } from '../home/BottomNavigation';
import { CategorySection } from '../home/CategorySection';
import { NewUpdatedSection } from '../home/NewUpdatedSection';
import { PopularToolsSection } from '../home/PopularToolsSection';
import { ToolSidebar } from '../sidebar/ToolSidebar';
import { Footer } from './Footer';
import { Header } from './Header';

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
// HomeLayout Component - uiux-studio Style
// ========================================

export function HomeLayout() {
  const { locale, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();
  const { openTool, sidebarCollapsed } = useToolStore();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Search Logic
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

    // Simple page search
    const matchedPages: SearchResult[] = SITE_PAGES.filter((page) => {
      return page.key.toLowerCase().includes(q) || page.path.includes(q);
    }).map((page) => ({ type: 'page', data: page }));

    return [...matchedTools, ...matchedPages];
  }, [searchQuery, locale]);

  // 전역 키보드 단축키
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        const first = searchResults[0];
        if (first.type === 'tool') {
          openTool(first.data.id);
          navigate({ to: localizedPath(`/${first.data.id}`) });
        } else {
          navigate({ to: localizedPath(first.data.path) });
        }
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Fixed Header */}
      <Header />

      {/* Desktop Sidebar */}
      <ToolSidebar />

      {/* Main Content Area */}
      <main
        className={`main-content-transition pt-[var(--header-height)] pb-4 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
          sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
        } max-md:ml-0`}
      >
        <div className="w-full max-w-4xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder={locale === 'ko' ? '도구 검색... (⌘K)' : 'Search tools... (⌘K)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full h-12 pl-12 pr-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/30 focus:border-[var(--color-accent-primary)]/30 outline-none transition-all"
            />
          </div>

          {/* Search Results or Default View */}
          {searchQuery ? (
            // Search Results View
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <p className="text-center text-[var(--color-text-secondary)] py-8">
                  {locale === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}
                </p>
              ) : (
                searchResults.map((result, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      if (result.type === 'tool') {
                        openTool(result.data.id);
                        navigate({ to: localizedPath(`/${result.data.id}`) });
                      } else {
                        navigate({ to: localizedPath(result.data.path) });
                      }
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-interactive-hover)] active:scale-[0.99] transition-all"
                  >
                    {result.type === 'tool' ? (
                      <div>
                        <div className="font-medium text-[var(--color-text-primary)]">
                          {result.data.name[locale]}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                          {result.data.description[locale]}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-[var(--color-text-primary)] capitalize">
                          {result.data.key}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                          Page
                        </div>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            // Default View
            <div className="space-y-6">
              <PopularToolsSection onToolClick={openTool} />
              {/* Mobile only sections */}
              <div className="md:hidden space-y-6">
                <CategorySection />
                <NewUpdatedSection onToolClick={openTool} />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Footer */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
