'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';
import { type ToolType, useToolStore } from '~/stores/tool-store';
import { BottomNavigation } from '../home/BottomNavigation';
import { CategorySection } from '../home/CategorySection';
import { HomeHeader } from '../home/HomeHeader';
import { NewUpdatedSection } from '../home/NewUpdatedSection';
import { PopularToolsSection } from '../home/PopularToolsSection';
import { ToolSidebar } from '../sidebar/ToolSidebar';
import { Footer } from './Footer';

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
// HomeLayout Component - Responsive Design
// ========================================

export function HomeLayout() {
  const { locale, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();
  const { openTool } = useToolStore();
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
          navigate(localizedPath(`/${first.data.id}`));
        } else {
          navigate(localizedPath(first.data.path));
        }
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-(--background) font-display">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <ToolSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <HomeHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchKeyDown={handleSearchKeyDown}
          inputRef={inputRef}
        />

        <main className="flex-1 overflow-x-hidden pb-10 md:pb-0">
          {/* Main Content Sections */}
          {searchQuery ? (
            // Search Results View
            <div className="p-4 space-y-4 max-w-7xl mx-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-(--muted-foreground) mt-8">
                  {locale === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}
                </p>
              ) : (
                searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (result.type === 'tool') {
                        openTool(result.data.id);
                        navigate(localizedPath(`/${result.data.id}`));
                      } else {
                        navigate(localizedPath(result.data.path));
                      }
                    }}
                    className="w-full text-left p-4 rounded-xl bg-(--card) ring-1 ring-(--border) hover:bg-(--muted)/50"
                  >
                    {result.type === 'tool' ? (
                      <div>
                        <div className="font-bold">{result.data.name[locale]}</div>
                        <div className="text-sm text-(--muted-foreground)">
                          {result.data.description[locale]}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold capitalize">{result.data.key}</div>
                        <div className="text-sm text-(--muted-foreground)">Page</div>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            // Default View
            <>
              <PopularToolsSection onToolClick={openTool} />
              {/* Mobile only sections */}
              <div className="md:hidden">
                <CategorySection />
                <NewUpdatedSection onToolClick={openTool} />
              </div>
            </>
          )}
        </main>

        {/* Desktop Footer */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
