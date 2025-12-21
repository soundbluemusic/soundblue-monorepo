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

// Types
export type {
  Locale,
  I18nConfig,
  I18nMessages,
  TranslationDictionary,
  LocaleDirection,
} from './types';

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  getLocaleDirection,
  getOppositeLocale,
  isValidLocale,
  getLocaleWithFallback,
} from './types';

// Constants
export {
  LOCALE_STORAGE_KEY,
  LOCALE_COOKIE_NAME,
  LOCALE_QUERY_PARAM,
  COMMON_TRANSLATION_KEYS,
  LOCALE_DATE_FORMATS,
  LOCALE_NUMBER_FORMATS,
} from './constants';
