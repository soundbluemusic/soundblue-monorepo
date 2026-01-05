/**
 * SEO utilities for Tools app
 * Generates canonical URLs and hreflang meta tags for React Router
 *
 * Note: React Router v7's LinksFunction doesn't receive params,
 * so we use MetaFunction with tagName: 'link' instead.
 */

import type { MetaDescriptor } from 'react-router';

const SITE_URL = 'https://tools.soundbluemusic.com';
const SUPPORTED_LOCALES = ['en', 'ko'] as const;
const DEFAULT_LOCALE = 'en';

type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Generate canonical and hreflang meta descriptors for a route
 * These are added to the meta function, not links function
 *
 * @param pathname - The base pathname without locale prefix (e.g., '/translator', '/about')
 * @param currentLocale - Current page locale ('en' or 'ko')
 * @returns Array of MetaDescriptor for React Router's meta export
 */
export function generateSeoMeta(
  pathname: string,
  currentLocale: Locale = DEFAULT_LOCALE,
): MetaDescriptor[] {
  const meta: MetaDescriptor[] = [];

  // Normalize pathname (ensure it starts with / and has no trailing slash)
  const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');

  // Build current URL based on locale
  const currentUrl =
    currentLocale === DEFAULT_LOCALE
      ? `${SITE_URL}${normalizedPath || '/'}`
      : `${SITE_URL}/${currentLocale}${normalizedPath || ''}`;

  // 1. Canonical URL (self-referencing)
  meta.push({
    tagName: 'link',
    rel: 'canonical',
    href: currentUrl,
  });

  // 2. Hreflang links for all supported locales
  for (const locale of SUPPORTED_LOCALES) {
    const localeUrl =
      locale === DEFAULT_LOCALE
        ? `${SITE_URL}${normalizedPath || '/'}`
        : `${SITE_URL}/${locale}${normalizedPath || ''}`;

    meta.push({
      tagName: 'link',
      rel: 'alternate',
      hrefLang: locale,
      href: localeUrl,
    });
  }

  // 3. x-default (points to default locale)
  meta.push({
    tagName: 'link',
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${SITE_URL}${normalizedPath || '/'}`,
  });

  return meta;
}

/**
 * Get SEO meta for a route based on params
 * Use this in your meta function to add canonical and hreflang tags
 *
 * @param pathname - The base pathname without locale prefix
 * @param params - Route params containing optional locale
 * @returns Array of MetaDescriptor
 *
 * @example
 * export const meta: MetaFunction = ({ params }) => [
 *   { title: 'Page Title' },
 *   ...getSeoMeta('/translator', params),
 * ];
 */
export function getSeoMeta(pathname: string, params: { locale?: string }): MetaDescriptor[] {
  const locale = (params.locale as Locale) || DEFAULT_LOCALE;
  return generateSeoMeta(pathname, locale);
}
