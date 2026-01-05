import type { MetaDescriptor } from 'react-router';

/**
 * SEO utility for generating canonical URLs and hreflang tags
 * Fixes Google Search Console issues:
 * - Alternate page with proper canonical tag
 * - Page with redirect (hreflang tags)
 * - Duplicate without user-selected canonical
 */

const SITE_URL = 'https://dialogue.soundbluemusic.com';
const SUPPORTED_LOCALES = ['en', 'ko'] as const;
const DEFAULT_LOCALE = 'en';

type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Generate canonical URL and hreflang meta tags for SEO
 * @param pathname - The route pathname (e.g., '/about', '/sitemap')
 * @param currentLocale - Current locale from route params
 * @returns Array of MetaDescriptor for canonical and hreflang tags
 */
export function generateSeoMeta(
  pathname: string,
  currentLocale: Locale = DEFAULT_LOCALE,
): MetaDescriptor[] {
  const meta: MetaDescriptor[] = [];

  // Normalize pathname (remove trailing slash, handle root)
  const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');

  // Generate canonical URL for current locale
  const currentUrl =
    currentLocale === DEFAULT_LOCALE
      ? `${SITE_URL}${normalizedPath || '/'}`
      : `${SITE_URL}/${currentLocale}${normalizedPath || ''}`;

  // Add canonical tag
  meta.push({
    tagName: 'link',
    rel: 'canonical',
    href: currentUrl,
  });

  // Add hreflang tags for all supported locales
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

  // Add x-default hreflang (points to default locale version)
  meta.push({
    tagName: 'link',
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${SITE_URL}${normalizedPath || '/'}`,
  });

  return meta;
}

/**
 * Helper function to get SEO meta from route params
 * Use this in your route's meta function:
 * export const meta: MetaFunction = ({ params }) => [
 *   { title: 'Page Title' },
 *   ...getSeoMeta('/pathname', params),
 * ];
 */
export function getSeoMeta(pathname: string, params: { locale?: string }): MetaDescriptor[] {
  const locale = (params.locale as Locale) || DEFAULT_LOCALE;
  return generateSeoMeta(pathname, locale);
}
