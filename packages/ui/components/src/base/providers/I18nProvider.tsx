/**
 * @fileoverview Shared I18n Provider for SoundBlue React apps
 *
 * Provides URL-based internationalization with support for:
 * - Automatic locale detection from URL path (`/ko/*` → Korean, all other → English)
 * - Type-safe translation access
 * - Path localization utilities for generating language-specific URLs
 * - SEO-friendly URL routing
 *
 * @module @soundblue/shared-react/providers/I18nProvider
 */

import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';

/**
 * Supported locale codes.
 * - `'en'` - English (default locale, served from root paths)
 * - `'ko'` - Korean (served from `/ko/*` paths)
 */
export type Locale = 'en' | 'ko';

/**
 * I18n configuration.
 */
export interface I18nConfig {
  /** Supported locales */
  locales: readonly Locale[];
  /** Default locale (doesn't appear in URL) */
  defaultLocale: Locale;
}

/**
 * Default i18n configuration.
 */
export const DEFAULT_I18N_CONFIG: I18nConfig = {
  locales: ['en', 'ko'],
  defaultLocale: 'en',
};

/**
 * Context value provided by I18nProvider.
 */
export interface I18nContextValue<T> {
  /** Current locale */
  locale: Locale;
  /** Translation messages */
  t: T;
  /** Programmatically change the locale */
  setLocale: (locale: Locale) => void;
  /** Toggle between English and Korean */
  toggleLocale: () => void;
  /** Generate a localized path for the current locale */
  localizedPath: (path: string) => string;
  /** Current path without locale prefix */
  basePath: string;
}

/**
 * Props for I18nProvider component.
 */
export interface I18nProviderProps<T> {
  children: ReactNode;
  /** Translation messages for each locale */
  messages: { en: T; ko: T } | Record<Locale, T>;
  /** Current pathname */
  pathname: string;
  /** Navigation function for locale changes */
  navigate: (path: string) => void;
  /** i18n configuration (optional, uses DEFAULT_I18N_CONFIG if not provided) */
  config?: I18nConfig;
}

// Create context with undefined default (will throw if used outside provider)
const I18nContext = createContext<I18nContextValue<unknown> | undefined>(undefined);

/**
 * Extracts locale from URL pathname.
 *
 * @param pathname - URL pathname (e.g., '/ko/about', '/news')
 * @param config - i18n configuration
 * @returns Detected locale code
 *
 * @example
 * ```ts
 * getLocaleFromPath('/ko/about')  // 'ko'
 * getLocaleFromPath('/ko')        // 'ko'
 * getLocaleFromPath('/about')     // 'en'
 * getLocaleFromPath('/')          // 'en'
 * ```
 */
export function getLocaleFromPath(
  pathname: string,
  config: I18nConfig = DEFAULT_I18N_CONFIG,
): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && config.locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return config.defaultLocale;
}

/**
 * Removes locale prefix from pathname.
 *
 * @param pathname - URL pathname with potential locale prefix
 * @param config - i18n configuration
 * @returns Path without locale prefix
 *
 * @example
 * ```ts
 * getPathWithoutLocale('/ko/about')  // '/about'
 * getPathWithoutLocale('/ko/')       // '/'
 * getPathWithoutLocale('/about')     // '/about'
 * ```
 */
export function getPathWithoutLocale(
  pathname: string,
  config: I18nConfig = DEFAULT_I18N_CONFIG,
): string {
  const locale = getLocaleFromPath(pathname, config);

  // If using default locale (no prefix), return as is
  if (locale === config.defaultLocale) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === config.defaultLocale) {
      const rest = `/${segments.slice(1).join('/')}`;
      return rest || '/';
    }
    return pathname;
  }

  // Remove locale prefix
  const prefix = `/${locale}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return '/';
  }
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || '/';
  }

  return pathname;
}

/**
 * Generates a localized path for a given locale.
 *
 * @param path - Base path without locale prefix
 * @param locale - Target locale
 * @param config - i18n configuration
 * @returns Localized path with trailing slash
 *
 * @example
 * ```ts
 * // For locale 'ko':
 * getLocalizedPath('/about', 'ko')  // '/ko/about/'
 * getLocalizedPath('/', 'ko')       // '/ko/'
 *
 * // For default locale 'en':
 * getLocalizedPath('/about', 'en')  // '/about/'
 * getLocalizedPath('/', 'en')       // '/'
 * ```
 */
export function getLocalizedPath(
  path: string,
  locale: Locale,
  config: I18nConfig = DEFAULT_I18N_CONFIG,
): string {
  // Normalize path: ensure leading slash, remove trailing slash for processing
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Remove any existing locale prefix
  normalizedPath = getPathWithoutLocale(normalizedPath, config);

  // For default locale, just ensure trailing slash
  if (locale === config.defaultLocale) {
    return normalizedPath === '/' ? '/' : `${normalizedPath}/`;
  }

  // Add locale prefix
  if (normalizedPath === '/') {
    return `/${locale}/`;
  }
  return `/${locale}${normalizedPath}/`;
}

/**
 * Extract base path by removing locale prefix and normalizing.
 */
function getBasePath(pathname: string, config: I18nConfig): string {
  // Remove trailing slash for processing
  const cleanPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

  // Check for locale prefix
  for (const locale of config.locales) {
    if (locale === config.defaultLocale) continue;
    if (cleanPath.startsWith(`/${locale}/`)) {
      return cleanPath.slice(locale.length + 1);
    }
    if (cleanPath === `/${locale}`) {
      return '/';
    }
  }

  return cleanPath || '/';
}

/**
 * I18n context provider component.
 *
 * Provides URL-based locale detection and translation utilities to all
 * descendant components. Must wrap the application root or route layout.
 *
 * @example
 * ```tsx
 * import { I18nProvider } from '@soundblue/shared-react/providers';
 * import enMessages from './messages/en.json';
 * import koMessages from './messages/ko.json';
 *
 * const messages = { en: enMessages, ko: koMessages };
 *
 * export default function App() {
 *   const location = useLocation();
 *   const navigate = useNavigate();
 *
 *   return (
 *     <I18nProvider
 *       messages={messages}
 *       pathname={location.pathname}
 *       navigate={navigate}
 *     >
 *       <Outlet />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider<T>({
  children,
  messages,
  pathname,
  navigate,
  config = DEFAULT_I18N_CONFIG,
}: I18nProviderProps<T>) {
  // Derive locale from URL path
  const locale = useMemo(() => getLocaleFromPath(pathname, config), [pathname, config]);

  // Get translation messages for current locale
  const t = useMemo(() => messages[locale], [messages, locale]);

  // Get base path without locale prefix
  const basePath = useMemo(() => getBasePath(pathname, config), [pathname, config]);

  /**
   * Navigate to the equivalent page in a different locale.
   */
  const setLocale = useCallback(
    (newLocale: Locale): void => {
      let newPath: string;

      if (newLocale === config.defaultLocale) {
        newPath = basePath === '/' ? '/' : `${basePath}/`;
      } else {
        newPath = basePath === '/' ? `/${newLocale}/` : `/${newLocale}${basePath}/`;
      }

      navigate(newPath);
    },
    [basePath, config, navigate],
  );

  /**
   * Toggle between English and Korean locales.
   */
  const toggleLocale = useCallback((): void => {
    const newLocale = locale === 'en' ? 'ko' : 'en';
    setLocale(newLocale);
  }, [locale, setLocale]);

  /**
   * Generate a localized URL path for the current locale.
   */
  const localizedPath = useCallback(
    (path: string): string => {
      return getLocalizedPath(path, locale, config);
    },
    [locale, config],
  );

  const value = useMemo<I18nContextValue<T>>(
    () => ({
      locale,
      t,
      setLocale,
      toggleLocale,
      localizedPath,
      basePath,
    }),
    [locale, t, setLocale, toggleLocale, localizedPath, basePath],
  );

  return (
    <I18nContext.Provider value={value as I18nContextValue<unknown>}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access internationalization context.
 *
 * @returns I18n context value with locale utilities
 * @throws Error if used outside of I18nProvider
 *
 * @example
 * ```tsx
 * function NavBar() {
 *   const { t, locale, localizedPath, toggleLocale } = useI18n<Messages>();
 *
 *   return (
 *     <nav>
 *       <a href={localizedPath('/')}>{t.nav.home}</a>
 *       <button onClick={toggleLocale}>
 *         {locale === 'en' ? '한국어' : 'English'}
 *       </button>
 *     </nav>
 *   );
 * }
 * ```
 */
export function useI18n<T>(): I18nContextValue<T> {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context as I18nContextValue<T>;
}
