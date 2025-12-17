import { Link, Meta, Title } from '@solidjs/meta';
import { useLocation } from '@solidjs/router';
import { createMemo, type JSX } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { BRAND } from '~/constants/brand';

export type PageKey =
  | 'home'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'license'
  | 'soundRecording'
  | 'sitemap'
  | 'news'
  | 'blog'
  | 'builtWith'
  | 'chat';

interface PageSeoProps {
  page: PageKey;
}

interface SeoData {
  title: string;
  description: string;
}

interface AlternateUrls {
  en: string;
  ko: string;
}

/** JSON-LD Schema.org WebSite type */
interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher: {
    '@type': 'Person';
    name: string;
    url: string;
  };
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

/** JSON-LD Schema.org Person type */
interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  alternateName: string;
  description: string;
  url: string;
  sameAs: string[];
  jobTitle: string;
  knowsAbout: string[];
}

/**
 * PageSeo - Dynamic SEO component with meta tags and JSON-LD
 *
 * Provides:
 * - Dynamic title and description per page
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URL with hreflang
 * - JSON-LD structured data
 */
export function PageSeo(props: PageSeoProps): JSX.Element {
  const { t, language } = useLanguage();
  const location = useLocation();
  const isKorean = (): boolean => language() === 'ko';

  const seoData = createMemo((): SeoData => {
    const pageData = t().seo.pages[props.page];
    return {
      title: pageData.title,
      description: pageData.description,
    };
  });

  const canonicalUrl = createMemo((): string => {
    const path = location.pathname.replace(/^\/ko/, '') || '/';
    return `${BRAND.siteUrl}${isKorean() ? '/ko' : ''}${path === '/' ? '' : path}`;
  });

  const alternateUrls = createMemo((): AlternateUrls => {
    const path = location.pathname.replace(/^\/ko/, '') || '/';
    const basePath = path === '/' ? '' : path;
    return {
      en: `${BRAND.siteUrl}${basePath}`,
      ko: `${BRAND.siteUrl}/ko${basePath}`,
    };
  });

  // JSON-LD structured data for the website
  const jsonLd = createMemo((): WebSiteSchema => {
    const baseData: WebSiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: t().seo.siteName,
      url: BRAND.siteUrl,
      description: t().seo.defaultDescription,
      inLanguage: isKorean() ? 'ko-KR' : 'en-US',
      publisher: {
        '@type': 'Person',
        name: 'SoundBlueMusic',
        url: BRAND.siteUrl,
      },
    };

    // Add specific schema based on page
    if (props.page === 'home') {
      return {
        ...baseData,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BRAND.siteUrl}/sitemap`,
          'query-input': 'required name=search_term_string',
        },
      };
    }

    return baseData;
  });

  // Person schema for the artist (only on home page)
  const personJsonLd = createMemo((): PersonSchema | null => {
    if (props.page !== 'home') return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Sound Blue',
      alternateName: 'SoundBlueMusic',
      description: t().seo.defaultDescription,
      url: BRAND.siteUrl,
      sameAs: ['https://www.youtube.com/@SoundBlueMusic', BRAND.githubUrl],
      jobTitle: isKorean() ? '음악 프로듀서' : 'Music Producer',
      knowsAbout: ['Music Production', 'BGM', 'Soundtrack', 'Ambient Music'],
    };
  });

  return (
    <>
      {/* Basic Meta Tags */}
      <Title>{seoData().title}</Title>
      <Meta name="description" content={seoData().description} />
      <Meta name="author" content={BRAND.copyrightHolder} />

      {/* Canonical and Language Alternates */}
      <Link rel="canonical" href={canonicalUrl()} />
      <Link rel="alternate" hreflang="en" href={alternateUrls().en} />
      <Link rel="alternate" hreflang="ko" href={alternateUrls().ko} />
      <Link rel="alternate" hreflang="x-default" href={alternateUrls().en} />

      {/* Open Graph */}
      <Meta property="og:title" content={seoData().title} />
      <Meta property="og:description" content={seoData().description} />
      <Meta property="og:type" content="website" />
      <Meta property="og:url" content={canonicalUrl()} />
      <Meta property="og:image" content={`${BRAND.siteUrl}/og-image.png`} />
      <Meta property="og:site_name" content={t().seo.siteName} />
      <Meta property="og:locale" content={isKorean() ? 'ko_KR' : 'en_US'} />
      <Meta property="og:locale:alternate" content={isKorean() ? 'en_US' : 'ko_KR'} />

      {/* Twitter Card */}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={seoData().title} />
      <Meta name="twitter:description" content={seoData().description} />
      <Meta name="twitter:image" content={`${BRAND.siteUrl}/og-image.png`} />

      {/* JSON-LD Structured Data - using textContent for safety */}
      <script type="application/ld+json" textContent={JSON.stringify(jsonLd())} />
      {personJsonLd() && (
        <script type="application/ld+json" textContent={JSON.stringify(personJsonLd())} />
      )}
    </>
  );
}
