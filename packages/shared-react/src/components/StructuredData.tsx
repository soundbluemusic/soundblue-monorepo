/**
 * JSON-LD Structured Data Components
 * Improves SEO with rich snippets in search results
 */

interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
  inLanguage?: string[];
}

interface MusicGroupSchema {
  name: string;
  url: string;
  description?: string;
  genre?: string[];
  sameAs?: string[];
}

interface SoftwareApplicationSchema {
  name: string;
  url: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * WebSite structured data
 */
export function WebSiteStructuredData({ name, url, description, inLanguage }: WebSiteSchema) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(description && { description }),
    ...(inLanguage && { inLanguage }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * MusicGroup structured data for artist pages
 */
export function MusicGroupStructuredData({
  name,
  url,
  description,
  genre,
  sameAs,
}: MusicGroupSchema) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name,
    url,
    ...(description && { description }),
    ...(genre && { genre }),
    ...(sameAs && { sameAs }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * SoftwareApplication structured data for tools
 */
export function SoftwareApplicationStructuredData({
  name,
  url,
  description,
  applicationCategory,
  operatingSystem = 'Web Browser',
  offers = { price: '0', priceCurrency: 'USD' },
}: SoftwareApplicationSchema) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    url,
    ...(description && { description }),
    ...(applicationCategory && { applicationCategory }),
    operatingSystem,
    offers: {
      '@type': 'Offer',
      ...offers,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * Breadcrumb structured data
 */
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * Organization structured data
 */
export function OrganizationStructuredData({
  name,
  url,
  logo,
  sameAs,
}: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
    ...(sameAs && { sameAs }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
