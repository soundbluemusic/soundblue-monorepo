// ========================================
// @soundblue/seo - JSON-LD Generator
// Generate structured data for SEO
// ========================================

import type {
  BreadcrumbItem,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebSiteJsonLd,
} from '../types';

/**
 * Create WebSite JSON-LD
 */
export function createWebSiteJsonLd(options: {
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
  searchUrl?: string;
}): WebSiteJsonLd {
  const jsonLd: WebSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name,
    url: options.url,
    description: options.description,
    inLanguage: options.inLanguage,
  };

  if (options.searchUrl) {
    jsonLd.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: options.searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return jsonLd;
}

/**
 * Create SoftwareApplication JSON-LD
 */
export function createSoftwareApplicationJsonLd(options: {
  name: string;
  description: string;
  url: string;
  category?: string;
  operatingSystem?: string;
  isFree?: boolean;
}): SoftwareApplicationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    description: options.description,
    url: options.url,
    applicationCategory: options.category || 'WebApplication',
    operatingSystem: options.operatingSystem || 'All',
    offers:
      options.isFree !== false
        ? {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          }
        : undefined,
  };
}

/**
 * Create Organization JSON-LD
 */
export function createOrganizationJsonLd(options: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
    logo: options.logo,
    sameAs: options.sameAs,
  };
}

/**
 * Create BreadcrumbList JSON-LD
 */
export function createBreadcrumbJsonLd(items: { name: string; url?: string }[]): BreadcrumbJsonLd {
  const itemListElement: BreadcrumbItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * Generate JSON-LD script tag
 */
export function generateJsonLdScript(jsonLd: object | object[]): string {
  const content = JSON.stringify(jsonLd);
  return `<script type="application/ld+json">${content}</script>`;
}

/**
 * Combine multiple JSON-LD objects into array
 */
export function combineJsonLd(...jsonLds: object[]): object[] {
  return jsonLds.filter(Boolean);
}
