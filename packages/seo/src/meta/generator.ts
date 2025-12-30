// ========================================
// @soundblue/seo - Meta Generator
// Generate meta tags for pages
// ========================================

import type { AlternateLink, Locale, OpenGraphMeta, PageMeta, TwitterMeta } from '../types';

/**
 * Default site configuration
 */
export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  defaultLocale: Locale;
  supportedLocales: Locale[];
  twitterSite?: string;
  defaultImage?: string;
}

/**
 * Page-specific meta input
 */
export interface PageMetaInput {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  locale: Locale;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

/**
 * Create complete page meta from input
 */
export function createPageMeta(input: PageMetaInput, config: SiteConfig): PageMeta {
  const fullUrl = `${config.siteUrl}${input.path}`;
  const imageUrl = input.image || config.defaultImage;

  const openGraph: OpenGraphMeta = {
    type: input.type || 'website',
    title: input.title,
    description: input.description,
    url: fullUrl,
    siteName: config.siteName,
    locale: input.locale === 'ko' ? 'ko_KR' : 'en_US',
    images: imageUrl
      ? [
          {
            url: imageUrl.startsWith('http') ? imageUrl : `${config.siteUrl}${imageUrl}`,
            width: 1200,
            height: 630,
            alt: input.title,
          },
        ]
      : undefined,
  };

  const twitter: TwitterMeta = {
    card: imageUrl ? 'summary_large_image' : 'summary',
    site: config.twitterSite,
    title: input.title,
    description: input.description,
    image: imageUrl
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${config.siteUrl}${imageUrl}`
      : undefined,
    imageAlt: input.title,
  };

  // Generate alternate links for other locales
  const alternates: AlternateLink[] = config.supportedLocales
    .filter((loc) => loc !== input.locale)
    .map((loc) => ({
      hrefLang: loc,
      href: `${config.siteUrl}/${loc}${input.path}`,
    }));

  // Add x-default
  alternates.push({
    hrefLang: 'x-default',
    href: `${config.siteUrl}/${config.defaultLocale}${input.path}`,
  });

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    canonical: fullUrl,
    robots: input.noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph,
    twitter,
    alternates,
  };
}

/**
 * Format title with site name
 */
export function formatTitle(pageTitle: string, siteName: string, separator = ' | '): string {
  return `${pageTitle}${separator}${siteName}`;
}

/**
 * Generate HTML meta tags string
 */
export function generateMetaTags(meta: PageMeta): string {
  const tags: string[] = [];

  // Basic meta
  tags.push(`<title>${escapeHtml(meta.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);

  if (meta.keywords?.length) {
    tags.push(`<meta name="keywords" content="${escapeHtml(meta.keywords.join(', '))}" />`);
  }

  if (meta.robots) {
    tags.push(`<meta name="robots" content="${meta.robots}" />`);
  }

  if (meta.canonical) {
    tags.push(`<link rel="canonical" href="${meta.canonical}" />`);
  }

  // Alternate links
  if (meta.alternates) {
    for (const alt of meta.alternates) {
      tags.push(`<link rel="alternate" hreflang="${alt.hrefLang}" href="${alt.href}" />`);
    }
  }

  // Open Graph
  if (meta.openGraph) {
    const og = meta.openGraph;
    tags.push(`<meta property="og:type" content="${og.type}" />`);
    tags.push(`<meta property="og:title" content="${escapeHtml(og.title)}" />`);
    tags.push(`<meta property="og:description" content="${escapeHtml(og.description)}" />`);
    tags.push(`<meta property="og:url" content="${og.url}" />`);
    tags.push(`<meta property="og:site_name" content="${escapeHtml(og.siteName)}" />`);
    tags.push(`<meta property="og:locale" content="${og.locale}" />`);

    if (og.images) {
      for (const img of og.images) {
        tags.push(`<meta property="og:image" content="${img.url}" />`);
        if (img.width) tags.push(`<meta property="og:image:width" content="${img.width}" />`);
        if (img.height) tags.push(`<meta property="og:image:height" content="${img.height}" />`);
        if (img.alt) tags.push(`<meta property="og:image:alt" content="${escapeHtml(img.alt)}" />`);
      }
    }
  }

  // Twitter
  if (meta.twitter) {
    const tw = meta.twitter;
    tags.push(`<meta name="twitter:card" content="${tw.card}" />`);
    if (tw.site) tags.push(`<meta name="twitter:site" content="${tw.site}" />`);
    tags.push(`<meta name="twitter:title" content="${escapeHtml(tw.title)}" />`);
    tags.push(`<meta name="twitter:description" content="${escapeHtml(tw.description)}" />`);
    if (tw.image) tags.push(`<meta name="twitter:image" content="${tw.image}" />`);
    if (tw.imageAlt)
      tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(tw.imageAlt)}" />`);
  }

  return tags.join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
