// ========================================
// @soundblue/locale - Display utilities
// Pure functions for locale display names
// ========================================

import type { Locale, TextDirection } from './types';

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale, inLocale?: Locale): string {
  const displayLocale = inLocale || locale;

  const names: Record<Locale, Record<Locale, string>> = {
    en: {
      en: 'English',
      ko: 'Korean',
    },
    ko: {
      en: '영어',
      ko: '한국어',
    },
  };

  return names[displayLocale][locale];
}

/**
 * Get locale native name
 */
export function getLocaleNativeName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: 'English',
    ko: '한국어',
  };

  return names[locale];
}

/**
 * Get HTML lang attribute value
 */
export function getHtmlLang(locale: Locale): string {
  const langMap: Record<Locale, string> = {
    en: 'en',
    ko: 'ko',
  };

  return langMap[locale];
}

/**
 * Get hreflang value for alternate links
 */
export function getHrefLang(locale: Locale): string {
  return locale;
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(_locale: Locale): TextDirection {
  // Korean and English are both LTR
  return 'ltr';
}
