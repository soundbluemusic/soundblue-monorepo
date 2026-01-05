import type { MetaDescriptor } from 'react-router';

const SITE_URL = 'https://soundbluemusic.com';
const SUPPORTED_LOCALES = ['en', 'ko'] as const;
const DEFAULT_LOCALE = 'en';

type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Generate SEO meta tags for canonical URL and hreflang
 * React Router v7's LinksFunction doesn't receive params,
 * so we use MetaFunction with tagName: 'link' instead.
 */
export function generateSeoMeta(
  pathname: string,
  currentLocale: Locale = DEFAULT_LOCALE,
): MetaDescriptor[] {
  const meta: MetaDescriptor[] = [];

  // Normalize pathname (remove trailing slash, handle root)
  const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');

  // Build current URL based on locale
  const currentUrl =
    currentLocale === DEFAULT_LOCALE
      ? `${SITE_URL}${normalizedPath || '/'}`
      : `${SITE_URL}/${currentLocale}${normalizedPath || ''}`;

  // Canonical URL - points to current page
  meta.push({
    tagName: 'link',
    rel: 'canonical',
    href: currentUrl,
  });

  // Hreflang for each supported locale
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

  // x-default for language negotiation (points to default locale version)
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
 * Usage in route file:
 *
 * export const meta: MetaFunction = ({ params }) => [
 *   { title: 'Page Title' },
 *   { name: 'description', content: 'Page description' },
 *   ...getSeoMeta('/page-path', params),
 * ];
 */
export function getSeoMeta(pathname: string, params: { locale?: string }): MetaDescriptor[] {
  const locale = (params.locale as Locale) || DEFAULT_LOCALE;
  return generateSeoMeta(pathname, locale);
}
