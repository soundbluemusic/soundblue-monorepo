/**
 * @fileoverview Shared i18n types for all apps
 *
 * Common type definitions for internationalization across the monorepo.
 * These types ensure consistency between apps while allowing framework-specific implementations.
 *
 * @module @soundblue/shared/i18n
 */

/**
 * Supported locales across all apps.
 * Currently supporting Korean and English.
 */
export type Locale = 'ko' | 'en';

/**
 * Default locale for the application.
 * English is the default locale and doesn't appear in URLs.
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * All supported locales.
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['ko', 'en'] as const;

/**
 * Locale names in their native language.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

/**
 * Configuration for i18n message loading.
 */
export interface I18nConfig {
  /** Current locale */
  locale: Locale;
  /** Default locale (fallback) */
  defaultLocale: Locale;
  /** Supported locales */
  supportedLocales: readonly Locale[];
}

/**
 * Base interface for translation messages.
 * Apps can extend this with their specific message structure.
 */
export interface I18nMessages {
  [key: string]: string | I18nMessages;
}

/**
 * Translation dictionary structure.
 */
export interface TranslationDictionary<T = I18nMessages> {
  ko: T;
  en: T;
}

/**
 * Direction for language switching.
 */
export type LocaleDirection = 'ltr' | 'rtl';

/**
 * Get text direction for a locale.
 * Currently all supported locales are LTR.
 */
export function getLocaleDirection(locale: Locale): LocaleDirection {
  // All current locales are left-to-right
  return 'ltr';
}

/**
 * Get the opposite locale (for toggle functionality).
 * Only works for two-locale configurations.
 */
export function getOppositeLocale(currentLocale: Locale): Locale {
  return currentLocale === 'ko' ? 'en' : 'ko';
}

/**
 * Check if a string is a valid locale.
 */
export function isValidLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Get locale with fallback to default.
 */
export function getLocaleWithFallback(value: string | null | undefined): Locale {
  if (value && isValidLocale(value)) {
    return value;
  }
  return DEFAULT_LOCALE;
}
