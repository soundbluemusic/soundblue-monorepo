import { useParaglideI18n } from '@soundblue/shared-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import m from '~/lib/messages';
import styles from './SearchBox.module.scss';

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
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <svg
          className={styles.searchIcon}
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
          className={styles.input}
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
          <span className={styles.shortcut}>{isMac ? '\u2318K' : 'Ctrl+K'}</span>
        )}
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label={m['search.clear']()}
          >
            <svg
              className={styles.clearIcon}
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

      {isOpen && results.length > 0 && (
        <div className={styles.dropdown} role="listbox">
          {results.map((result, index) => {
            const itemClasses = [
              styles.resultItem,
              index === selectedIndex && styles.resultItemSelected,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <Link
                key={result.path}
                to={localizedPath(result.path)}
                role="option"
                tabIndex={0}
                aria-selected={index === selectedIndex}
                className={itemClasses}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.resultTitle}>
                  {m[`search_pages_${result.key}_title`]?.()}
                </span>
                <span className={styles.resultDesc}>
                  {m[`search_pages_${result.key}_desc`]?.()}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className={styles.noResults}>{m['search.noResults']()}</div>
      )}
    </div>
  );
}
