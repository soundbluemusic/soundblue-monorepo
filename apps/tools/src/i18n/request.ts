// Locale configuration for SolidStart
// Server-side locale detection is handled by the routes

export type Locale = 'ko' | 'en';

export const locales: Locale[] = ['ko', 'en'];
export const defaultLocale: Locale = 'en';

// Helper to extract locale from pathname
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment === 'en') {
    return 'en';
  }
  if (firstSegment === 'ko') {
    return 'ko';
  }

  return defaultLocale;
}

// Helper to get path without locale prefix
export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment === 'en' || firstSegment === 'ko') {
    return `/${segments.slice(1).join('/')}`;
  }

  return pathname;
}

// Helper to add locale to path
export function getLocalizedPath(pathname: string, locale: Locale): string {
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  if (locale === defaultLocale) {
    return pathWithoutLocale || '/';
  }

  return `/${locale}${pathWithoutLocale || ''}`;
}
