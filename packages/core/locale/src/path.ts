// ========================================
// @soundblue/locale - Path utilities
// Pure functions for locale path manipulation
// ========================================

import type { Locale } from './types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './types';

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Get locale from URL path.
 * Returns default locale ('en') if no valid locale prefix found.
 *
 * @param path - URL pathname (e.g., "/ko/about" or "/about")
 * @returns Detected locale ('ko' or 'en')
 *
 * @example
 * getLocaleFromPath('/ko/about') // "ko"
 * getLocaleFromPath('/about')    // "en"
 */
export function getLocaleFromPath(path: string): Locale {
  // Check if path starts with /ko
  if (path.startsWith('/ko/') || path === '/ko') {
    return 'ko';
  }

  // Default to English
  return DEFAULT_LOCALE;
}

/**
 * Build localized path
 */
export function buildLocalizedPath(path: string, locale: Locale): string {
  // Remove existing locale prefix if present
  const pathWithoutLocale = removeLocaleFromPath(path);

  // Add new locale prefix
  return `/${locale}${pathWithoutLocale}`;
}

/**
 * Remove locale from path
 */
export function removeLocaleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isValidLocale(firstSegment)) {
    return `/${segments.slice(1).join('/')}`;
  }

  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Get the opposite locale (for toggle functionality).
 * Only works for two-locale configurations.
 */
export function getOppositeLocale(currentLocale: Locale): Locale {
  return currentLocale === 'ko' ? 'en' : 'ko';
}

/**
 * Get localized path for a given base path and locale.
 * English is the default locale with no prefix.
 *
 * @param path - Base path (e.g., "/about")
 * @param locale - Target locale
 * @returns Localized path (e.g., "/ko/about" for Korean, "/about" for English)
 *
 * @example
 * getLocalizedPath('/about', 'ko') // "/ko/about"
 * getLocalizedPath('/about', 'en') // "/about"
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove any existing locale prefix
  const basePath = path.replace(/^\/(ko|en)/, '') || '/';

  // For English (default), no prefix needed
  if (locale === 'en') {
    return basePath === '/' ? '/' : basePath;
  }

  // For Korean, add /ko prefix
  return basePath === '/' ? '/ko' : `/ko${basePath}`;
}
