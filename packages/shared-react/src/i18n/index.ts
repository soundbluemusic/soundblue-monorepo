/**
 * @fileoverview Shared i18n utilities and types
 *
 * This module provides common internationalization utilities that can be used
 * across all apps in the monorepo. It ensures consistency in locale handling,
 * translation patterns, and i18n best practices.
 *
 * @example
 * ```ts
 * import { Locale, getOppositeLocale, LOCALE_STORAGE_KEY } from '@soundblue/shared/i18n';
 *
 * const currentLocale: Locale = 'ko';
 * const nextLocale = getOppositeLocale(currentLocale); // 'en'
 * localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
 * ```
 *
 * @module @soundblue/shared/i18n
 */

// Constants
export {
  COMMON_TRANSLATION_KEYS,
  LOCALE_COOKIE_NAME,
  LOCALE_DATE_FORMATS,
  LOCALE_NUMBER_FORMATS,
  LOCALE_QUERY_PARAM,
  LOCALE_STORAGE_KEY,
} from './constants';
// Types
export type {
  I18nConfig,
  I18nMessages,
  Locale,
  LocaleDirection,
  TranslationDictionary,
} from './types';
export {
  DEFAULT_LOCALE,
  getLocaleDirection,
  getLocaleWithFallback,
  getOppositeLocale,
  isValidLocale,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
} from './types';
