// Locale configuration for SolidStart
// Server-side locale detection is handled by the routes
// Re-exports shared i18n utilities with app-specific types

import {
  getLocaleFromPath as sharedGetLocaleFromPath,
  getPathWithoutLocale as sharedGetPathWithoutLocale,
  getLocalizedPath as sharedGetLocalizedPath,
  type I18nPathConfig,
} from '@soundblue/shared';

export type Locale = 'ko' | 'en';

export const locales: readonly Locale[] = ['ko', 'en'] as const;
export const defaultLocale: Locale = 'en';

// App-specific i18n config
const i18nConfig: I18nPathConfig = {
  locales: locales,
  defaultLocale: defaultLocale,
};

// Re-export with app-specific typing
export function getLocaleFromPath(pathname: string): Locale {
  return sharedGetLocaleFromPath(pathname, i18nConfig) as Locale;
}

export function getPathWithoutLocale(pathname: string): string {
  return sharedGetPathWithoutLocale(pathname, i18nConfig);
}

export function getLocalizedPath(pathname: string, locale: Locale): string {
  // Remove trailing slash for consistency with original behavior
  const result = sharedGetLocalizedPath(pathname, locale, i18nConfig);
  return result.endsWith('/') && result !== '/' ? result.slice(0, -1) : result;
}
