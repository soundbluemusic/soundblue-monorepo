/**
 * @fileoverview Type-safe route definitions using Template Literal Types.
 *
 * This module provides compile-time validation for route paths,
 * preventing typos and ensuring all routes are valid.
 *
 * @module lib/routes
 */

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * All valid page routes in the application.
 * Add new routes here to make them available throughout the app.
 */
export const PAGE_ROUTES = [
  '/',
  '/about',
  '/news',
  '/blog',
  '/built-with',
  '/chat',
  '/privacy',
  '/terms',
  '/license',
  '/sitemap',
  '/sound-recording',
  '/offline',
] as const;

/**
 * Valid page route type - only these paths are allowed.
 * Using template literal types for compile-time validation.
 */
export type PageRoute = (typeof PAGE_ROUTES)[number];

/**
 * Korean route prefix
 */
export type KoreanPrefix = '/ko';

/**
 * Korean localized routes
 */
export type KoreanRoute = `${KoreanPrefix}${PageRoute}` | KoreanPrefix;

/**
 * All valid routes (English + Korean)
 */
export type AppRoute = PageRoute | KoreanRoute;

/**
 * External URLs that the app links to
 */
export type ExternalUrl = `https://${string}` | `http://${string}`;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Checks if a string is a valid page route.
 *
 * @param path - The path to validate
 * @returns true if path is a valid PageRoute
 *
 * @example
 * ```ts
 * if (isPageRoute(userInput)) {
 *   navigate(userInput); // userInput is PageRoute
 * }
 * ```
 */
export function isPageRoute(path: string): path is PageRoute {
  return (PAGE_ROUTES as readonly string[]).includes(path);
}

/**
 * Checks if a string is a valid Korean route.
 *
 * @param path - The path to validate
 * @returns true if path is a valid Korean route
 */
export function isKoreanRoute(path: string): path is KoreanRoute {
  if (path === '/ko') return true;
  if (!path.startsWith('/ko/')) return false;
  const basePath = path.slice(3) as string;
  return isPageRoute(basePath);
}

/**
 * Checks if a string is a valid app route (English or Korean).
 *
 * @param path - The path to validate
 * @returns true if path is a valid AppRoute
 */
export function isAppRoute(path: string): path is AppRoute {
  return isPageRoute(path) || isKoreanRoute(path);
}

/**
 * Checks if a string is an external URL.
 *
 * @param url - The URL to validate
 * @returns true if url is an external URL
 */
export function isExternalUrl(url: string): url is ExternalUrl {
  return url.startsWith('https://') || url.startsWith('http://');
}

// ============================================================================
// Route Utilities
// ============================================================================

/**
 * Extracts the base path from a potentially localized route.
 *
 * @param path - The route path (may include /ko prefix)
 * @returns The base path without locale prefix
 *
 * @example
 * ```ts
 * getBasePath('/ko/about') // '/about'
 * getBasePath('/about')    // '/about'
 * getBasePath('/ko')       // '/'
 * ```
 */
export function getBasePath(path: AppRoute | string): PageRoute {
  if (path === '/ko' || path === '/ko/') return '/';
  if (path.startsWith('/ko/')) {
    const base = path.slice(3);
    // Remove trailing slash if present
    const normalized = base.endsWith('/') && base !== '/' ? base.slice(0, -1) : base;
    return normalized as PageRoute;
  }
  // Remove trailing slash if present
  const normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return normalized as PageRoute;
}

/**
 * Creates a localized path based on the current language.
 *
 * @param path - The base path (without locale prefix)
 * @param isKorean - Whether to use Korean locale
 * @returns The localized path with trailing slash
 *
 * @example
 * ```ts
 * createLocalizedPath('/about', true)  // '/ko/about/'
 * createLocalizedPath('/about', false) // '/about/'
 * createLocalizedPath('/', true)       // '/ko/'
 * ```
 */
export function createLocalizedPath(path: PageRoute, isKorean: boolean): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const withSlash = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;

  if (isKorean) {
    return `/ko${withSlash === '/' ? '/' : withSlash}`;
  }
  return withSlash;
}
