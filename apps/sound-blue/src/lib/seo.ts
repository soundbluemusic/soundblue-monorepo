import { DEFAULT_LOCALE, type Locale, parseLocalePath, SUPPORTED_LOCALES } from '@soundblue/locale';

// Custom type for meta descriptors (TanStack Router uses different meta system)
type MetaDescriptor = Record<string, unknown>;

const SITE_URL = 'https://soundbluemusic.com';

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
 * Get SEO meta for a route based on location
 * Uses location.pathname to detect locale (works in SSG prerender)
 *
 * @example
 * export const meta: MetaFunction = ({ location }) => [
 *   { title: 'Page Title' },
 *   ...getSeoMeta(location),
 * ];
 */
export function getSeoMeta(location: { pathname: string }): MetaDescriptor[] {
  const { locale, basePath } = parseLocalePath(location.pathname);
  return generateSeoMeta(basePath, locale);
}
