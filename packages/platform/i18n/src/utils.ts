// ========================================
// @soundblue/i18n - Utils
// Platform-specific locale utilities (browser APIs)
// ========================================

import { DEFAULT_LOCALE, isValidLocale, type Locale } from '@soundblue/locale';

// Re-export pure utilities from core/locale for backward compatibility
export {
  buildLocalizedPath,
  getHrefLang,
  getHtmlLang,
  getLocaleDisplayName,
  getLocaleFromPath,
  getLocaleNativeName,
  getLocalizedPath,
  getOppositeLocale,
  isValidLocale,
  removeLocaleFromPath,
} from '@soundblue/locale';

/**
 * Get locale from browser/navigator
 * NOTE: This is the only browser-dependent function in this file
 */
export function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const browserLang = navigator.language.split('-')[0] ?? '';
  return isValidLocale(browserLang) ? browserLang : DEFAULT_LOCALE;
}
