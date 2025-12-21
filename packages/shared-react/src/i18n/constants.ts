/**
 * @fileoverview Shared i18n constants for all apps
 *
 * Common constants used across all apps for internationalization.
 * Centralizing these ensures consistency in locale handling.
 *
 * @module @soundblue/shared/i18n
 */

import type { Locale } from './types';

/**
 * LocalStorage key for storing user's locale preference.
 */
export const LOCALE_STORAGE_KEY = 'soundblue-locale';

/**
 * Cookie name for storing user's locale preference.
 */
export const LOCALE_COOKIE_NAME = 'locale';

/**
 * URL query parameter for locale override.
 */
export const LOCALE_QUERY_PARAM = 'lang';

/**
 * Common translation keys shared across apps.
 * These keys should exist in all app translation files.
 */
export const COMMON_TRANSLATION_KEYS = {
  // Language switching
  LANG_SWITCH: 'common.langSwitch',
  LANG_CODE: 'common.langCode',

  // Common actions
  CLOSE: 'common.close',
  SAVE: 'common.save',
  CANCEL: 'common.cancel',
  DELETE: 'common.delete',
  EDIT: 'common.edit',
  COPY: 'common.copy',
  SHARE: 'common.share',

  // Common states
  LOADING: 'common.loading',
  ERROR: 'common.error',
  SUCCESS: 'common.success',

  // Theme
  THEME_LIGHT: 'common.themeLight',
  THEME_DARK: 'common.themeDark',
} as const;

/**
 * Date/time format patterns for each locale.
 */
export const LOCALE_DATE_FORMATS: Record<Locale, { short: string; long: string }> = {
  ko: {
    short: 'YYYY.MM.DD',
    long: 'YYYY년 M월 D일',
  },
  en: {
    short: 'MM/DD/YYYY',
    long: 'MMMM D, YYYY',
  },
};

/**
 * Number format options for each locale.
 */
export const LOCALE_NUMBER_FORMATS: Record<Locale, Intl.NumberFormatOptions> = {
  ko: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  en: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
};
