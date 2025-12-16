import { A, useNavigate, usePreloadRoute } from '@solidjs/router';
import { createMemo, createSignal, For, type JSX, onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';
import { useLanguage } from '~/components/providers';

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

export function SearchBox(): JSX.Element {
  const navigate = useNavigate();
  const preloadRoute = usePreloadRoute();
  const { t, localizedPath } = useLanguage();
  const [query, setQuery] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [isFocused, setIsFocused] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  /** Detect if user is on macOS/iOS to show correct keyboard shortcut (⌘K vs Ctrl+K) */
  const isMac: boolean =
    !isServer &&
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  const results = createMemo(() => {
    const q = query().toLowerCase().trim();
    if (!q) return [];
    return SITE_PAGES.filter((page) => {
      const pageData = t().search.pages[page.key];
      const title = pageData.title;
      const desc = pageData.desc;
      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      );
    });
  });

  const handleGlobalKeyDown = (e: KeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef?.focus();
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      e.preventDefault();
      inputRef?.focus();
    }
  };

  const handleClickOutside = (e: MouseEvent): void => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    if (isServer) return;
    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
  });

  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener('keydown', handleGlobalKeyDown);
    document.removeEventListener('mousedown', handleClickOutside);
  });

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (!isOpen() || results().length === 0) {
      if (e.key === 'Enter' && query().trim()) setIsOpen(true);
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results().length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results().length - 1));
        break;
      case 'Enter': {
        e.preventDefault();
        const selectedResult = results()[selectedIndex()];
        if (selectedIndex() >= 0 && selectedResult) {
          navigate(localizedPath(selectedResult.path));
          setIsOpen(false);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef?.blur();
        break;
    }
  };

  const handleClear = (): void => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef?.focus();
  };

  return (
    <div
      class="relative flex-1 max-w-[280px] ml-4 max-sm:max-w-[160px] max-sm:ml-2 max-[480px]:max-w-[120px]"
      ref={containerRef}
    >
      <div class="relative flex items-center">
        <svg
          class="absolute left-2.5 w-4 h-4 text-content-subtle pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          class="w-full h-9 pl-[34px] pr-8 text-sm font-inherit text-content bg-surface-dim border border-line rounded-lg outline-none transition-[border-color,background-color] duration-150 placeholder:text-content-subtle focus:border-line-focus focus:bg-surface-alt [&::-webkit-search-cancel-button]:hidden max-sm:h-8 max-sm:text-[0.8125rem] max-[480px]:placeholder:text-xs"
          placeholder={t().search.placeholder}
          value={query()}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            setIsOpen(e.currentTarget.value.trim().length > 0);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query().trim()) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          aria-label={t().search.label}
          aria-expanded={isOpen()}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {!isFocused() && !query() && (
          <span class="absolute right-2 flex items-center py-0.5 px-1.5 font-inherit text-[0.6875rem] font-medium text-content-subtle bg-surface-alt border border-line rounded pointer-events-none max-sm:hidden">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </span>
        )}
        {query() && (
          <button
            type="button"
            class="absolute right-1.5 flex items-center justify-center w-6 h-6 p-0 bg-transparent border-none rounded text-content-subtle cursor-pointer transition-all duration-150 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-90"
            onClick={handleClear}
            aria-label={t().search.clear}
          >
            <svg
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen() && results().length > 0 && (
        <div
          class="absolute top-[calc(100%+4px)] left-0 right-0 z-700 max-h-[300px] overflow-y-auto bg-surface-alt border border-line rounded-lg shadow-lg m-0 p-1"
          role="listbox"
        >
          <For each={results()}>
            {(result, index) => (
              <A
                href={localizedPath(result.path)}
                role="option"
                tabIndex={0}
                aria-selected={index() === selectedIndex()}
                class={`flex flex-col gap-0.5 py-2.5 px-3 no-underline rounded transition-all duration-150 hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${index() === selectedIndex() ? 'bg-state-hover' : ''}`}
                onMouseEnter={() => preloadRoute(localizedPath(result.path))}
                onClick={() => setIsOpen(false)}
              >
                <span class="text-sm font-medium text-content">
                  {t().search.pages[result.key].title}
                </span>
                <span class="text-xs text-content-subtle">{t().search.pages[result.key].desc}</span>
              </A>
            )}
          </For>
        </div>
      )}

      {isOpen() && query().trim() && results().length === 0 && (
        <div class="absolute top-[calc(100%+4px)] left-0 right-0 z-700 bg-surface-alt border border-line rounded-lg shadow-lg p-4 text-center text-sm text-content-subtle">
          {t().search.noResults}
        </div>
      )}
    </div>
  );
}
