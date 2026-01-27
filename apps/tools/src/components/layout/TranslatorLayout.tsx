'use client';

/**
 * @fileoverview TranslatorLayout - Dedicated layout for translator tool
 *
 * This layout bypasses ToolContainer to enable proper code splitting.
 * The translator module (~190KB) is only loaded when visiting /translator route.
 *
 * D1 데이터 주입:
 * - translator.tsx의 loader에서 D1 사전 데이터를 로드
 * - 이 컴포넌트에서 Route.useLoaderData로 데이터를 받아 외부 사전에 주입
 * - 번역기가 D1의 대규모 어휘 데이터를 활용할 수 있음
 *
 * @module components/layout/TranslatorLayout
 */

import { useParaglideI18n } from '@soundblue/i18n';
import { useToast } from '@soundblue/ui-components/base';
import {
  injectDictionaryData,
  Translator,
} from '@soundblue/ui-components/composite/tool/translator';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import m from '~/lib/messages';
import { getToolGuide } from '~/lib/toolGuides';
import { useDictionaryQuery } from '~/queries/dictionary';
import { Route } from '~/routes/translator';
import { useToolStore } from '~/stores/tool-store';
import { defaultTranslatorSettings, type TranslatorSettings } from '~/tools/translator/settings';
import { BottomNavigation } from '../home/BottomNavigation';
import { ToolSidebar } from '../sidebar';
import { ToolGuide } from '../tools/ToolGuide';
import { Footer } from './Footer';
import { Header } from './Header';

// ========================================
// Compatibility hook for URL params
// ========================================

function useSearchParams(): [
  URLSearchParams,
  (params: URLSearchParams, options?: { replace?: boolean }) => void,
] {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search });

  const searchParams = new URLSearchParams(search);

  const setSearchParams = useCallback(
    (params: URLSearchParams, options?: { replace?: boolean }) => {
      const searchObj: Record<string, string> = {};
      params.forEach((value, key) => {
        searchObj[key] = value;
      });
      navigate({
        to: '.',
        search: searchObj,
        replace: options?.replace,
      });
    },
    [navigate],
  );

  return [searchParams, setSearchParams];
}

// ========================================
// Loading & Error Components
// ========================================

function TranslatorLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

function TranslatorErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const isChunkError =
    error.message.includes('Failed to fetch') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('dynamically imported module');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-amber-500" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {isChunkError
            ? (m['tools.loadError_network']?.() ?? 'Network Error')
            : (m['tools.loadError_title']?.() ?? 'Failed to load tool')}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
          {isChunkError
            ? (m['tools.loadError_networkDesc']?.() ??
              'Please check your internet connection and try again.')
            : (m['tools.loadError_desc']?.() ??
              'An unexpected error occurred while loading the tool.')}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        {m['tools.retry']?.() ?? 'Retry'}
      </button>
    </div>
  );
}

// Error Boundary
interface TranslatorErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface TranslatorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TranslatorErrorBoundary extends Component<
  TranslatorErrorBoundaryProps,
  TranslatorErrorBoundaryState
> {
  constructor(props: TranslatorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TranslatorErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Translator loading error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return <TranslatorErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

// ========================================
// URL Parameters
// ========================================

const URL_PARAMS = ['direction', 'formality', 'text'] as const;
const PRESERVED_PARAMS = ['s'] as const;

// ========================================
// TranslatorLayout Component
// ========================================

export function TranslatorLayout() {
  const navigate = useNavigate();
  const { locale, localizedPath } = useParaglideI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sidebarCollapsed, toolSettings, updateToolSettings, openTool, closeTool } =
    useToolStore();
  const { toast } = useToast();

  // D1에서 로드한 사전 데이터 가져오기 (SSR loader → TanStack Query 캐시)
  const loaderData = Route.useLoaderData();
  const { data: dictionary } = useDictionaryQuery(loaderData?.dictionary);

  const [urlCopied, setUrlCopied] = useState(false);
  const [urlCopyFailed, setUrlCopyFailed] = useState(false);
  const urlCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUrlSyncInitializedRef = useRef(false);
  const prevSettingsRef = useRef<Partial<TranslatorSettings> | null>(null);

  // D1 사전 데이터를 외부 사전 캐시에 주입 (TanStack Query에서 관리)
  useEffect(() => {
    if (dictionary) {
      injectDictionaryData(dictionary);
    }
  }, [dictionary]);

  // Sync store with translator tool on mount
  useEffect(() => {
    openTool('translator');
  }, [openTool]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
    };
  }, []);

  // Read settings from URL on mount (ONE-TIME ONLY to prevent infinite loop)
  useEffect(() => {
    // Skip if already initialized to prevent infinite loop
    if (isUrlSyncInitializedRef.current) return;
    isUrlSyncInitializedRef.current = true;

    const settings: Partial<TranslatorSettings> = {};
    let hasUrlSettings = false;

    for (const param of URL_PARAMS) {
      const rawValue = searchParams.get(param);
      if (rawValue !== null && rawValue !== '') {
        hasUrlSettings = true;
        if (param === 'direction') settings.direction = rawValue as TranslatorSettings['direction'];
        if (param === 'formality') settings.formality = rawValue as TranslatorSettings['formality'];
        if (param === 'text') settings.lastInput = decodeURIComponent(rawValue);
      }
    }

    if (hasUrlSettings) {
      prevSettingsRef.current = settings;
      updateToolSettings('translator', settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally run only on mount
  }, []);

  // Update URL when settings change (with change detection to prevent infinite loop)
  useEffect(() => {
    const settings = toolSettings.translator ?? {};

    // Compare with previous settings to prevent unnecessary URL updates
    const prev = prevSettingsRef.current;
    const hasChanged =
      !prev ||
      prev.direction !== settings.direction ||
      prev.formality !== settings.formality ||
      prev.lastInput !== settings.lastInput;

    if (!hasChanged) return;
    prevSettingsRef.current = { ...settings };

    const urlUpdate = new URLSearchParams();

    // Preserve special params (read current URL directly to avoid dependency)
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      for (const param of PRESERVED_PARAMS) {
        const value = currentParams.get(param);
        if (value) urlUpdate.set(param, value);
      }
    }

    // Set translator params
    if (settings.direction) urlUpdate.set('direction', settings.direction);
    if (settings.formality) urlUpdate.set('formality', settings.formality);
    if (settings.lastInput) urlUpdate.set('text', settings.lastInput);

    setSearchParams(urlUpdate, { replace: true });
  }, [toolSettings.translator, setSearchParams]);

  // Copy share URL
  const copyShareUrl = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setUrlCopied(true);
      setUrlCopyFailed(false);
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
      urlCopiedTimeoutRef.current = setTimeout(() => setUrlCopied(false), 2000);
    } catch (error: unknown) {
      console.warn('[clipboard] URL copy failed:', error);
      setUrlCopyFailed(true);
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
      urlCopiedTimeoutRef.current = setTimeout(() => setUrlCopyFailed(false), 2000);
    }
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    closeTool();
    navigate({ to: localizedPath('/') });
  }, [closeTool, navigate, localizedPath]);

  // Settings change handler
  const handleSettingsChange = useCallback(
    (settings: Partial<TranslatorSettings>) => {
      updateToolSettings('translator', settings);
    },
    [updateToolSettings],
  );

  // Toast callbacks
  const handleCopySuccess = useCallback(() => {
    toast.success(locale === 'ko' ? '복사됨!' : 'Copied!');
  }, [toast, locale]);

  const handleCopyError = useCallback(() => {
    toast.error(locale === 'ko' ? '복사 실패' : 'Copy failed');
  }, [toast, locale]);

  // Merged settings
  const translatorSettings = useMemo(
    () => ({
      ...defaultTranslatorSettings,
      ...(toolSettings.translator ?? {}),
    }),
    [toolSettings.translator],
  );

  // Tool guide
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const guide = getToolGuide('translator', currentLocale);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Fixed Header */}
      <Header />

      {/* Desktop Sidebar */}
      <ToolSidebar />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`main-content-transition pt-[var(--header-height)] pb-4 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
          sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
        } max-md:ml-0`}
      >
        <div className="h-[calc(100vh-var(--header-height)-16px)] max-md:h-[calc(100vh-52px-var(--bottom-nav-height)-16px)]">
          <div className="flex h-full flex-col bg-[var(--color-bg-primary)]">
            {/* Tool Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌐</span>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {locale === 'ko' ? '번역기' : 'Translator'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Share URL Button */}
                <button
                  type="button"
                  onClick={copyShareUrl}
                  className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] text-sm font-medium ${
                    urlCopyFailed
                      ? 'text-red-500 dark:text-red-400'
                      : urlCopied
                        ? 'text-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                  aria-label={m['tools.shareUrl']?.()}
                >
                  {urlCopyFailed ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {urlCopyFailed
                      ? (m['tools.urlCopyFailed']?.() ?? 'Copy failed')
                      : urlCopied
                        ? m['tools.urlCopied']?.()
                        : m['tools.shareUrl']?.()}
                  </span>
                </button>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent text-[var(--color-text-secondary)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]"
                  aria-label={m['tools.closeTool']?.()}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Translator Content */}
            <div className="flex-1 overflow-auto">
              <TranslatorErrorBoundary>
                <Suspense fallback={<TranslatorLoading />}>
                  <Translator
                    settings={translatorSettings}
                    onSettingsChange={handleSettingsChange}
                    guideSlot={<ToolGuide title={guide.title} sections={guide.sections} />}
                    onCopySuccess={handleCopySuccess}
                    onCopyError={handleCopyError}
                  />
                </Suspense>
              </TranslatorErrorBoundary>
            </div>
          </div>
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
