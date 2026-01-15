import { useParaglideI18n } from '@soundblue/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import m from '~/lib/messages';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';

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

export function SearchBox() {
  const navigate = useNavigate();
  const { locale, localizedPath } = useParaglideI18n();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // isMac detection only on client side to avoid hydration mismatch
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

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

  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const matchedPages: SearchResult[] = SITE_PAGES.filter((page) => {
      const title = getPageTitle(page.key);
      const desc = getPageDesc(page.key);
      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      );
    }).map((page) => ({ type: 'page', data: page }));

    const matchedTools: SearchResult[] = ALL_TOOLS.filter((tool) => {
      const name = tool.name[locale];
      const desc = tool.description[locale];
      return (
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q)
      );
    }).map((tool) => ({ type: 'tool', data: tool }));

    return [...matchedTools, ...matchedPages];
  }, [query, locale]);

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

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
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
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) setIsOpen(true);
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter': {
        e.preventDefault();
        const selectedResult = results[selectedIndex];
        if (selectedIndex >= 0 && selectedResult) {
          navigate(localizedPath(getResultPath(selectedResult)));
          setIsOpen(false);
          setQuery('');
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const renderResult = (result: SearchResult, index: number) => {
    const path = getResultPath(result);
    const isSelected = index === selectedIndex;

    if (result.type === 'tool') {
      const tool = result.data;
      return (
        <Link
          key={`tool-${tool.id}`}
          to={localizedPath(path)}
          role="option"
          tabIndex={0}
          aria-selected={isSelected}
          className={`flex items-center gap-3 py-2.5 px-3 no-underline rounded-lg transition-all duration-150 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
            isSelected ? 'bg-muted/50' : ''
          }`}
          onClick={() => {
            setIsOpen(false);
            setQuery('');
          }}
        >
          <span className="text-lg">{tool.icon}</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{tool.name[locale]}</span>
            <span className="text-xs text-muted-foreground">{tool.description[locale]}</span>
          </div>
        </Link>
      );
    }

    const page = result.data;
    return (
      <Link
        key={`page-${page.key}`}
        to={localizedPath(path)}
        role="option"
        tabIndex={0}
        aria-selected={isSelected}
        className={`flex flex-col gap-0.5 py-2.5 px-3 no-underline rounded-lg transition-all duration-150 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
          isSelected ? 'bg-muted/50' : ''
        }`}
        onClick={() => {
          setIsOpen(false);
          setQuery('');
        }}
      >
        <span className="text-sm font-medium text-foreground">{getPageTitle(page.key)}</span>
        <span className="text-xs text-muted-foreground">{getPageDesc(page.key)}</span>
      </Link>
    );
  };

  return (
    <div
      className="relative flex-1 ml-3 max-w-64 max-md:max-w-40 max-[480px]:max-w-28"
      ref={containerRef}
    >
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 w-4 h-4 text-muted-foreground pointer-events-none"
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
          className="w-full h-9 pl-[2.125rem] pr-8 text-sm text-foreground bg-muted/30 border border-border rounded-xl outline-none transition-[border-color,background-color] duration-150 placeholder:text-muted-foreground focus:border-primary focus:bg-background [&::-webkit-search-cancel-button]:hidden"
          placeholder={m['search_placeholder']?.() ?? 'Search...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.trim().length > 0);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim()) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          aria-label={m['search_label']?.() ?? 'Search'}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {!isFocused && !query && (
          <span className="absolute right-2 flex items-center px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground bg-muted/50 border border-border rounded pointer-events-none max-md:hidden">
            {isMac ? '\u2318K' : 'Ctrl+K'}
          </span>
        )}
        {query && (
          <button
            type="button"
            className="absolute right-1.5 flex items-center justify-center w-6 h-6 p-0 bg-transparent border-none rounded text-muted-foreground cursor-pointer transition-all duration-150 hover:text-foreground active:scale-90 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={handleClear}
            aria-label={m['search_clear']?.() ?? 'Clear'}
          >
            <svg
              className="w-3.5 h-3.5"
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

      {/* Screen reader announcement for search results */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isOpen &&
          query.trim() &&
          (results.length > 0
            ? `${results.length} ${results.length === 1 ? 'result' : 'results'} found`
            : (m['search_noResults']?.() ?? 'No results found'))}
      </div>

      {isOpen && results.length > 0 && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-[60] max-h-80 overflow-y-auto bg-background border border-border rounded-xl shadow-lg m-0 p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground"
          role="listbox"
        >
          {results.map((result, index) => renderResult(result, index))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-[60] bg-background border border-border rounded-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
          {m['search_noResults']?.() ?? 'No results found'}
        </div>
      )}
    </div>
  );
}
