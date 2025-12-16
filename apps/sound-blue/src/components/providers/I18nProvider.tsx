/**
 * @fileoverview Internationalization (i18n) Provider for Sound Blue
 *
 * This module provides URL-based internationalization with the following features:
 * - Automatic language detection from URL path (`/ko/*` → Korean, all other → English)
 * - Type-safe translation access via `@solid-primitives/i18n` pattern
 * - Path localization utilities for generating language-specific URLs
 * - SSR-compatible language state management
 *
 * ## URL Routing Strategy
 *
 * The project uses a sub-path routing strategy:
 * - English (default): `/`, `/about`, `/news`, etc.
 * - Korean: `/ko/`, `/ko/about`, `/ko/news`, etc.
 *
 * ## Architecture
 *
 * ```
 * URL Change → getLanguageFromPath() → language signal → t() translations
 *                                                     → localizedPath() for links
 * ```
 *
 * @example
 * // Wrap your app with I18nProvider
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 *
 * @example
 * // Access translations in components
 * const { t, language, localizedPath } = useLanguage();
 * return <a href={localizedPath('/about')}>{t().nav.about}</a>;
 *
 * @module I18nProvider
 * @see {@link https://primitives.solidjs.community/package/i18n | @solid-primitives/i18n}
 */

import { useLocation, useNavigate } from '@solidjs/router';
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  type ParentComponent,
  useContext,
} from 'solid-js';
import enMessages from '../../../messages/en.json';
import koMessages from '../../../messages/ko.json';

/**
 * Supported language codes
 *
 * @remarks
 * - `'en'` - English (default language, served from root paths)
 * - `'ko'` - Korean (served from `/ko/*` paths)
 */
export type Language = 'en' | 'ko';

/**
 * Type-safe translation messages structure
 *
 * @remarks
 * The type is inferred from the English translation file (`messages/en.json`).
 * All translation files must conform to this structure to ensure type safety.
 *
 * @example
 * // Access nested translation keys
 * const { t } = useLanguage();
 * t().nav.home     // "Home" or "홈"
 * t().nav.about    // "About" or "소개"
 * t().footer.copyright // "All rights reserved" or "모든 권리 보유"
 */
export type Messages = typeof enMessages;

/**
 * Context value provided by I18nProvider
 *
 * @remarks
 * All properties are reactive and will trigger re-renders when the language changes.
 * Access signal values using function call syntax: `language()`, `t()`, `basePath()`.
 */
interface I18nContextValue {
  /**
   * Current language signal
   * @returns The active language code ('en' or 'ko')
   * @example
   * if (language() === 'ko') { ... }
   */
  language: Accessor<Language>;

  /**
   * Translation messages accessor
   * @returns The complete translation object for the current language
   * @example
   * t().nav.home    // "Home" or "홈"
   * t().meta.title  // Page title in current language
   */
  t: Accessor<Messages>;

  /**
   * Programmatically change the language
   * @param lang - Target language code
   * @remarks Navigates to the equivalent page in the target language
   * @example
   * setLanguage('ko'); // Navigate to Korean version
   */
  setLanguage: (lang: Language) => void;

  /**
   * Toggle between English and Korean
   * @remarks Navigates to the equivalent page in the other language
   * @example
   * <button onClick={toggleLanguage}>Switch Language</button>
   */
  toggleLanguage: () => void;

  /**
   * Generate a localized path for the current language
   * @param path - Base path without language prefix (e.g., '/about')
   * @returns Localized path with trailing slash (e.g., '/ko/about/' for Korean)
   * @example
   * localizedPath('/about')  // '/about/' (English) or '/ko/about/' (Korean)
   * localizedPath('/')       // '/' (English) or '/ko/' (Korean)
   */
  localizedPath: (path: string) => string;

  /**
   * Current path without language prefix
   * @returns Base path extracted from current URL (e.g., '/about' from '/ko/about')
   * @example
   * // On page /ko/about
   * basePath() // Returns '/about'
   */
  basePath: Accessor<string>;
}

const I18nContext = createContext<I18nContextValue>();

/**
 * Translation message lookup table
 * @internal
 */
const messages: Record<Language, Messages> = {
  en: enMessages,
  ko: koMessages,
};

/**
 * Detect language from URL pathname
 *
 * @param pathname - Current URL pathname (e.g., '/ko/about', '/news')
 * @returns Detected language code
 *
 * @remarks
 * Detection rules:
 * - Paths starting with `/ko/` or exactly `/ko` → Korean
 * - All other paths → English (default)
 *
 * @example
 * getLanguageFromPath('/ko/about')  // 'ko'
 * getLanguageFromPath('/ko')        // 'ko'
 * getLanguageFromPath('/about')     // 'en'
 * getLanguageFromPath('/')          // 'en'
 *
 * @internal
 */
function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/ko/') || pathname === '/ko') {
    return 'ko';
  }
  return 'en';
}

/**
 * Extract base path by removing language prefix and normalizing
 *
 * @param pathname - Current URL pathname (e.g., '/ko/about/', '/news')
 * @returns Normalized base path without language prefix
 *
 * @remarks
 * Normalization steps:
 * 1. Remove trailing slash (except for root '/')
 * 2. Remove `/ko` prefix if present
 * 3. Ensure non-empty path (fallback to '/')
 *
 * @example
 * // Korean paths - prefix removed
 * getBasePath('/ko/about/')  // '/about'
 * getBasePath('/ko/about')   // '/about'
 * getBasePath('/ko/')        // '/'
 * getBasePath('/ko')         // '/'
 *
 * // English paths - unchanged (except trailing slash)
 * getBasePath('/about/')     // '/about'
 * getBasePath('/about')      // '/about'
 * getBasePath('/')           // '/'
 *
 * @internal
 */
function getBasePath(pathname: string): string {
  // Remove trailing slash for processing
  const cleanPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

  // Remove /ko prefix if present
  if (cleanPath.startsWith('/ko/')) {
    return cleanPath.slice(3);
  }
  if (cleanPath === '/ko') {
    return '/';
  }

  return cleanPath || '/';
}

/**
 * Internationalization context provider component
 *
 * Provides URL-based language detection and translation utilities to all
 * descendant components. Must wrap the application root or route layout.
 *
 * ## Features
 *
 * - **URL-based detection**: Language is determined from the URL path
 * - **SSR-compatible**: Initial language is set synchronously from pathname
 * - **Client-side sync**: Language updates automatically on navigation
 * - **Path utilities**: Generate localized links for navigation
 *
 * ## Usage
 *
 * @example
 * // In app.tsx or root layout
 * import { I18nProvider } from '~/components/providers';
 *
 * export default function App() {
 *   return (
 *     <I18nProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </I18nProvider>
 *   );
 * }
 *
 * @example
 * // In a page component
 * import { useLanguage } from '~/components/providers';
 *
 * function AboutPage() {
 *   const { t, language, localizedPath } = useLanguage();
 *
 *   return (
 *     <div>
 *       <h1>{t().nav.about}</h1>
 *       <p>Current language: {language()}</p>
 *       <a href={localizedPath('/news')}>
 *         {t().nav.news}
 *       </a>
 *     </div>
 *   );
 * }
 *
 * @param props - Standard SolidJS parent component props
 * @returns JSX element wrapping children with i18n context
 *
 * @see {@link useLanguage} - Hook to consume the i18n context
 */
export const I18nProvider: ParentComponent = (props): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize language from URL path immediately (important for SSR)
  const [language, setLanguageSignal] = createSignal<Language>(
    getLanguageFromPath(location.pathname),
  );

  // Update language when pathname changes (for client-side navigation)
  createEffect(() => {
    const lang = getLanguageFromPath(location.pathname);
    setLanguageSignal(lang);
  });

  const t = createMemo(() => messages[language()]);

  const basePath = createMemo(() => getBasePath(location.pathname));

  /**
   * Navigate to the equivalent page in a different language
   *
   * @param lang - Target language to switch to
   *
   * @remarks
   * Constructs the new URL by:
   * 1. Getting the current base path (without /ko prefix)
   * 2. Adding /ko prefix for Korean or removing it for English
   * 3. Ensuring trailing slash for consistency
   */
  const setLanguage = (lang: Language): void => {
    const base = basePath();
    let newPath: string;

    if (lang === 'ko') {
      newPath = base === '/' ? '/ko/' : `/ko${base}/`;
    } else {
      newPath = base === '/' ? '/' : `${base}/`;
    }

    navigate(newPath);
  };

  /**
   * Toggle between English and Korean languages
   *
   * @remarks
   * Convenience method that calls setLanguage with the opposite language
   */
  const toggleLanguage = (): void => {
    const newLang = language() === 'en' ? 'ko' : 'en';
    setLanguage(newLang);
  };

  /**
   * Generate a localized URL path for the current language
   *
   * @param path - Base path without language prefix
   * @returns Properly formatted path with language prefix if Korean
   *
   * @remarks
   * Path normalization:
   * 1. Ensures leading slash
   * 2. Ensures trailing slash
   * 3. Adds /ko prefix if current language is Korean
   *
   * @example
   * // When language is English
   * localizedPath('/about')  // Returns '/about/'
   * localizedPath('news')    // Returns '/news/'
   *
   * // When language is Korean
   * localizedPath('/about')  // Returns '/ko/about/'
   * localizedPath('/')       // Returns '/ko/'
   */
  const localizedPath = (path: string): string => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // Ensure trailing slash
    const withSlash = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;

    if (language() === 'ko') {
      return `/ko${withSlash === '/' ? '/' : withSlash}`;
    }
    return withSlash;
  };

  const value: I18nContextValue = {
    language,
    t,
    setLanguage,
    toggleLanguage,
    localizedPath,
    basePath,
  };

  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
};

/**
 * Hook to access internationalization context
 *
 * Provides access to language state, translations, and path utilities.
 * Must be called within a component wrapped by `I18nProvider`.
 *
 * ## Returned Values
 *
 * | Property | Type | Description |
 * |----------|------|-------------|
 * | `language` | `Accessor<Language>` | Current language ('en' \| 'ko') |
 * | `t` | `Accessor<Messages>` | Translation messages object |
 * | `setLanguage` | `(lang: Language) => void` | Navigate to specific language |
 * | `toggleLanguage` | `() => void` | Switch between en/ko |
 * | `localizedPath` | `(path: string) => string` | Generate localized URL |
 * | `basePath` | `Accessor<string>` | Current path without /ko prefix |
 *
 * @returns I18n context value with language utilities
 * @throws Error if used outside of I18nProvider
 *
 * @example
 * // Basic translation usage
 * function NavBar() {
 *   const { t, localizedPath } = useLanguage();
 *
 *   return (
 *     <nav>
 *       <a href={localizedPath('/')}>{t().nav.home}</a>
 *       <a href={localizedPath('/about')}>{t().nav.about}</a>
 *     </nav>
 *   );
 * }
 *
 * @example
 * // Language toggle button
 * function LanguageToggle() {
 *   const { language, toggleLanguage } = useLanguage();
 *
 *   return (
 *     <button onClick={toggleLanguage}>
 *       {language() === 'en' ? '한국어' : 'English'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // Conditional rendering based on language
 * function WelcomeMessage() {
 *   const { language } = useLanguage();
 *
 *   return (
 *     <Show when={language() === 'ko'} fallback={<p>Welcome!</p>}>
 *       <p>환영합니다!</p>
 *     </Show>
 *   );
 * }
 *
 * @see {@link I18nProvider} - Provider component that must wrap components using this hook
 */
export function useLanguage(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return context;
}
