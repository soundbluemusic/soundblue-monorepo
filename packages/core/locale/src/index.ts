// ========================================
// @soundblue/locale
// Pure locale utilities (no browser APIs)
// ========================================

// Display utilities
export {
  getHrefLang,
  getHtmlLang,
  getLocaleDisplayName,
  getLocaleNativeName,
  getTextDirection,
} from './display';
// Path utilities
export {
  buildLocalizedPath,
  getLocaleFromPath,
  getLocalizedPath,
  getOppositeLocale,
  isKoreanPath,
  isValidLocale,
  parseLocalePath,
  removeLocaleFromPath,
} from './path';
// Types
export type { Locale, TextDirection } from './types';
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './types';
