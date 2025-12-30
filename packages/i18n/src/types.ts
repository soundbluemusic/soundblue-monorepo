// ========================================
// @soundblue/i18n - Types
// Internationalization type definitions
// ========================================

/**
 * Supported locales
 */
export type Locale = 'en' | 'ko';

/**
 * Locale configuration
 */
export interface LocaleConfig {
  /** Current locale */
  locale: Locale;
  /** Default/fallback locale */
  defaultLocale: Locale;
  /** All supported locales */
  supportedLocales: Locale[];
}

/**
 * Locale context value
 */
export interface LocaleContextValue {
  /** Current locale */
  locale: Locale;
  /** Set locale */
  setLocale: (locale: Locale) => void;
  /** Check if locale is supported */
  isSupported: (locale: string) => locale is Locale;
  /** Get locale from path */
  getLocaleFromPath: (path: string) => Locale | null;
}

/**
 * Translation dictionary (nested structure)
 */
export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

/**
 * Flat translation map
 */
export type TranslationMap = Record<string, string>;

/**
 * Translation function options
 */
export interface TranslateOptions {
  /** Fallback value if key not found */
  fallback?: string;
  /** Interpolation values */
  values?: Record<string, string | number>;
}
