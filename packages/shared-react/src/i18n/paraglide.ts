/**
 * @fileoverview Paraglide JS utilities for React apps
 *
 * Provides lightweight utilities for using Paraglide-compiled i18n messages.
 * Paraglide uses build-time compilation, so no heavy runtime provider is needed.
 *
 * @module @soundblue/shared-react/i18n/paraglide
 */

import type { Locale } from './types';

/**
 * Get the opposite locale (for toggle functionality).
 * Only works for two-locale configurations.
 */
export function getOppositeLocale(currentLocale: Locale): Locale {
  return currentLocale === 'ko' ? 'en' : 'ko';
}

/**
 * Get localized path for a given base path and locale.
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

/**
 * Extract locale from URL pathname.
 *
 * @param pathname - URL pathname (e.g., "/ko/about" or "/about")
 * @returns Detected locale ('ko' or 'en')
 *
 * @example
 * getLocaleFromPath('/ko/about') // "ko"
 * getLocaleFromPath('/about')    // "en"
 */
export function getLocaleFromPath(pathname: string): Locale {
  // Check if path starts with /ko
  if (pathname.startsWith('/ko/') || pathname === '/ko') {
    return 'ko';
  }

  // Default to English
  return 'en';
}
