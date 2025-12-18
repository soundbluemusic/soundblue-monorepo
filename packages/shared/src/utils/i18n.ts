/**
 * @fileoverview Shared i18n utility functions
 *
 * Provides common internationalization utilities that can be used across all apps:
 * - Locale detection from URL path
 * - Localized path generation
 * - Path normalization
 *
 * @module @soundblue/shared/utils/i18n
 */

/**
 * Supported locale type.
 * @deprecated Use Locale from providers/I18nProvider instead
 */
export type BaseLocale = 'en' | 'ko';

/**
 * Configuration for i18n path utilities.
 */
export interface I18nPathConfig {
  /** Supported locales */
  locales: readonly string[];
  /** Default locale (doesn't appear in URL) */
  defaultLocale: string;
}

/**
 * Default configuration for i18n paths.
 */
export const DEFAULT_I18N_CONFIG: I18nPathConfig = {
  locales: ['en', 'ko'],
  defaultLocale: 'en',
};

/**
 * Extracts locale from URL pathname.
 *
 * @param pathname - URL pathname (e.g., '/ko/about', '/news')
 * @param config - i18n configuration
 * @returns Detected locale code
 *
 * @example
 * ```ts
 * getLocaleFromPath('/ko/about')  // 'ko'
 * getLocaleFromPath('/ko')        // 'ko'
 * getLocaleFromPath('/about')     // 'en' (default)
 * getLocaleFromPath('/')          // 'en' (default)
 * ```
 */
export function getLocaleFromPath(
  pathname: string,
  config: I18nPathConfig = DEFAULT_I18N_CONFIG,
): string {
  // Extract the first path segment
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Check if first segment is a supported locale
  if (firstSegment && config.locales.includes(firstSegment)) {
    return firstSegment;
  }

  return config.defaultLocale;
}

/**
 * Removes locale prefix from pathname.
 *
 * @param pathname - URL pathname with potential locale prefix
 * @param config - i18n configuration
 * @returns Path without locale prefix
 *
 * @example
 * ```ts
 * getPathWithoutLocale('/ko/about')  // '/about'
 * getPathWithoutLocale('/ko/')       // '/'
 * getPathWithoutLocale('/about')     // '/about'
 * ```
 */
export function getPathWithoutLocale(
  pathname: string,
  config: I18nPathConfig = DEFAULT_I18N_CONFIG,
): string {
  const locale = getLocaleFromPath(pathname, config);

  // If using default locale (no prefix), return as is
  if (locale === config.defaultLocale) {
    // Still need to check if default locale is explicitly in path
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === config.defaultLocale) {
      const rest = '/' + segments.slice(1).join('/');
      return rest || '/';
    }
    return pathname;
  }

  // Remove locale prefix
  const prefix = `/${locale}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return '/';
  }
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || '/';
  }

  return pathname;
}

/**
 * Generates a localized path for a given locale.
 *
 * @param path - Base path without locale prefix
 * @param locale - Target locale
 * @param config - i18n configuration
 * @returns Localized path with trailing slash
 *
 * @example
 * ```ts
 * // For locale 'ko':
 * getLocalizedPath('/about', 'ko')  // '/ko/about/'
 * getLocalizedPath('/', 'ko')       // '/ko/'
 *
 * // For default locale 'en':
 * getLocalizedPath('/about', 'en')  // '/about/'
 * getLocalizedPath('/', 'en')       // '/'
 * ```
 */
export function getLocalizedPath(
  path: string,
  locale: string,
  config: I18nPathConfig = DEFAULT_I18N_CONFIG,
): string {
  // Normalize path: ensure leading slash, remove trailing slash for processing
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Remove any existing locale prefix
  normalizedPath = getPathWithoutLocale(normalizedPath, config);

  // For default locale, just ensure trailing slash
  if (locale === config.defaultLocale) {
    return normalizedPath === '/' ? '/' : `${normalizedPath}/`;
  }

  // Add locale prefix
  if (normalizedPath === '/') {
    return `/${locale}/`;
  }
  return `/${locale}${normalizedPath}/`;
}

/**
 * Creates a path builder function for a specific locale.
 *
 * @param locale - The locale to build paths for
 * @param config - i18n configuration
 * @returns A function that generates localized paths
 *
 * @example
 * ```ts
 * const koPath = createLocalizedPathBuilder('ko');
 * koPath('/about')  // '/ko/about/'
 * koPath('/')       // '/ko/'
 * ```
 */
export function createLocalizedPathBuilder(
  locale: string,
  config: I18nPathConfig = DEFAULT_I18N_CONFIG,
): (path: string) => string {
  return (path: string) => getLocalizedPath(path, locale, config);
}

/**
 * Checks if a path has a locale prefix.
 *
 * @param pathname - URL pathname to check
 * @param config - i18n configuration
 * @returns true if path has a non-default locale prefix
 */
export function hasLocalePrefix(
  pathname: string,
  config: I18nPathConfig = DEFAULT_I18N_CONFIG,
): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  return (
    !!firstSegment &&
    config.locales.includes(firstSegment) &&
    firstSegment !== config.defaultLocale
  );
}

/**
 * Gets the opposite locale (for toggle functionality).
 * Only works for two-locale configurations.
 *
 * @param currentLocale - Current locale
 * @param config - i18n configuration
 * @returns The other locale, or current if more than 2 locales
 */
export function getOppositeLocale(
  currentLocale: string,
  config: I18nPathConfig = DEFAULT_I18N_CONFIG,
): string {
  if (config.locales.length !== 2) {
    return currentLocale;
  }
  const first = config.locales[0];
  const second = config.locales[1];
  if (!first || !second) return currentLocale;
  return currentLocale === first ? second : first;
}
