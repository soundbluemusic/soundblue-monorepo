// ========================================
// @soundblue/seo - Types
// SEO type definitions
// ========================================

/**
 * Supported locales
 */
export type Locale = 'en' | 'ko';

/**
 * Basic meta information
 */
export interface MetaInfo {
  title: string;
  description: string;
  keywords?: string[];
}

/**
 * Open Graph meta data
 */
export interface OpenGraphMeta {
  type: 'website' | 'article' | 'product';
  title: string;
  description: string;
  url: string;
  siteName: string;
  locale: string;
  images?: OpenGraphImage[];
}

/**
 * Open Graph image
 */
export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Twitter Card meta data
 */
export interface TwitterMeta {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

/**
 * Complete page meta data
 */
export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraphMeta;
  twitter?: TwitterMeta;
  alternates?: AlternateLink[];
}

/**
 * Alternate language link
 */
export interface AlternateLink {
  hrefLang: string;
  href: string;
}

/**
 * JSON-LD structured data types
 */
export interface JsonLdBase {
  '@context': 'https://schema.org';
  '@type': string;
}

/**
 * WebSite JSON-LD
 */
export interface WebSiteJsonLd extends JsonLdBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
  potentialAction?: SearchAction;
}

/**
 * Search action for WebSite
 */
export interface SearchAction {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

/**
 * SoftwareApplication JSON-LD
 */
export interface SoftwareApplicationJsonLd extends JsonLdBase {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
}

/**
 * Organization JSON-LD
 */
export interface OrganizationJsonLd extends JsonLdBase {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

/**
 * BreadcrumbList JSON-LD
 */
export interface BreadcrumbJsonLd extends JsonLdBase {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}
