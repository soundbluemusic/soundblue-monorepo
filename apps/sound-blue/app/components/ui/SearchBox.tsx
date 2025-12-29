import { useParaglideI18n } from '@soundblue/shared-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import m from '~/lib/messages';

type PageKey = 'home' | 'sitemap' | 'privacy' | 'terms' | 'license' | 'soundRecording';

interface SearchPage {
  path: string;
  key: PageKey;
}

const SITE_PAGES: SearchPage[] = [
  { path: '/', key: 'home' },
  { path: '/sitemap', key: 'sitemap' },
  { path: '/privacy', key: 'privacy' },
  { path: '/terms', key: 'terms' },
  { path: '/license', key: 'license' },
  { path: '/sound-recording', key: 'soundRecording' },
];

export function SearchBox() {
  const navigate = useNavigate();
  const { localizedPath } = useParaglideI18n();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return SITE_PAGES.filter((page) => {
      const title = m[`search_pages_${page.key}_title`]?.() ?? '';
      const desc = m[`search_pages_${page.key}_desc`]?.() ?? '';
      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
    // Safe tagName check - ensure e.target is an Element
    const target = e.target;
    if (
      e.key === '/' &&
      target instanceof Element &&
      !['INPUT', 'TEXTAREA'].includes(target.tagName)
    ) {
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
          navigate(localizedPath(selectedResult.path));
          setIsOpen(false);
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

  return (
    <div
      className="relative flex-1 ml-4 max-w-70 max-md:max-w-40 max-md:ml-2 max-[480px]:max-w-30"
      ref={containerRef}
    >
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 w-4 h-4 text-(--color-text-tertiary) pointer-events-none"
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
          className="w-full h-9 max-md:h-10 pl-8.5 pr-8 text-base font-inherit text-(--color-text-primary) bg-(--color-bg-tertiary) border border-(--color-border-primary) rounded-xl outline-none transition-[border-color,background-color] duration-150 ease-[var(--ease-default)] placeholder:text-(--color-text-tertiary) focus:border-(--color-border-focus) focus:bg-(--color-bg-secondary) [&::-webkit-search-cancel-button]:hidden"
          placeholder={m['search.placeholder']()}
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
          aria-label={m['search.label']()}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {!isFocused && !query && (
          <span className="absolute right-2 flex items-center px-1.5 py-0.5 font-inherit text-[0.6875rem] font-medium text-(--color-text-tertiary) bg-(--color-bg-secondary) border border-(--color-border-primary) rounded pointer-events-none max-md:hidden">
            {isMac ? '\u2318K' : 'Ctrl+K'}
          </span>
        )}
        {query && (
          <button
            type="button"
            className="absolute right-1.5 flex items-center justify-center w-6 h-6 p-0 bg-transparent border-none rounded text-(--color-text-tertiary) cursor-pointer transition-all duration-150 ease-[var(--ease-default)] hover:text-(--color-text-primary) active:scale-90 focus-visible:outline-2 focus-visible:outline-(--color-border-focus) focus-visible:outline-offset-2"
            onClick={handleClear}
            aria-label={m['search.clear']()}
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
            : m['search.noResults']())}
      </div>

      {isOpen && results.length > 0 && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-[600] max-h-75 overflow-y-auto bg-(--color-bg-secondary) border border-(--color-border-primary) rounded-xl shadow-(--shadow-lg) m-0 p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-(--color-border-primary) [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-(--color-text-tertiary)"
          role="listbox"
        >
          {results.map((result, index) => (
            <Link
              key={result.path}
              to={localizedPath(result.path)}
              role="option"
              tabIndex={0}
              aria-selected={index === selectedIndex}
              className={`flex flex-col gap-0.5 py-2.5 px-3 no-underline rounded-lg transition-all duration-150 ease-[var(--ease-default)] hover:bg-(--color-interactive-hover) focus-visible:outline-2 focus-visible:outline-(--color-border-focus) focus-visible:outline-offset-2 ${
                index === selectedIndex ? 'bg-(--color-interactive-hover)' : ''
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="text-sm font-medium text-(--color-text-primary)">
                {m[`search_pages_${result.key}_title`]?.()}
              </span>
              <span className="text-xs text-(--color-text-tertiary)">
                {m[`search_pages_${result.key}_desc`]?.()}
              </span>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-[600] bg-(--color-bg-secondary) border border-(--color-border-primary) rounded-xl shadow-(--shadow-lg) p-4 text-center text-sm text-(--color-text-tertiary)">
          {m['search.noResults']()}
        </div>
      )}
    </div>
  );
}
