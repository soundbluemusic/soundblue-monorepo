import { describe, expect, it } from 'vitest';
import {
  createPageMeta,
  formatTitle,
  generateMetaTags,
  type PageMetaInput,
  type SiteConfig,
} from '../src/meta/generator';

const mockSiteConfig: SiteConfig = {
  siteName: 'Test Site',
  siteUrl: 'https://example.com',
  defaultLocale: 'en',
  supportedLocales: ['en', 'ko'],
  twitterSite: '@testsite',
  defaultImage: '/images/og-default.png',
};

describe('generator - Meta Tag Generator', () => {
  describe('createPageMeta', () => {
    it('기본 페이지 메타 생성', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.title).toBe('Test Page');
      expect(result.description).toBe('Test description');
      expect(result.canonical).toBe('https://example.com/test');
      expect(result.robots).toBe('index, follow');
    });

    it('한국어 로케일 메타 생성', () => {
      const input: PageMetaInput = {
        title: '테스트 페이지',
        description: '테스트 설명',
        path: '/test',
        locale: 'ko',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.locale).toBe('ko_KR');
    });

    it('영어 로케일 메타 생성', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.locale).toBe('en_US');
    });

    it('noIndex 옵션 처리', () => {
      const input: PageMetaInput = {
        title: 'Private Page',
        description: 'Private description',
        path: '/private',
        locale: 'en',
        noIndex: true,
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.robots).toBe('noindex, nofollow');
    });

    it('키워드 포함', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
        keywords: ['test', 'seo', 'meta'],
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.keywords).toEqual(['test', 'seo', 'meta']);
    });

    it('커스텀 이미지 URL (절대 경로)', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
        image: 'https://cdn.example.com/image.png',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.images?.[0].url).toBe('https://cdn.example.com/image.png');
      expect(result.twitter?.image).toBe('https://cdn.example.com/image.png');
    });

    it('커스텀 이미지 URL (상대 경로)', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
        image: '/images/custom.png',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.images?.[0].url).toBe('https://example.com/images/custom.png');
      expect(result.twitter?.image).toBe('https://example.com/images/custom.png');
    });

    it('기본 이미지 사용', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.images?.[0].url).toBe('https://example.com/images/og-default.png');
      expect(result.twitter?.card).toBe('summary_large_image');
    });

    it('이미지 없을 때 Twitter card 타입', () => {
      const configWithoutImage = { ...mockSiteConfig, defaultImage: undefined };
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, configWithoutImage);

      expect(result.twitter?.card).toBe('summary');
      expect(result.openGraph?.images).toBeUndefined();
    });

    it('Open Graph 타입 지정', () => {
      const input: PageMetaInput = {
        title: 'Blog Article',
        description: 'Article description',
        path: '/blog/article',
        locale: 'en',
        type: 'article',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.type).toBe('article');
    });

    it('대체 언어 링크 생성', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.alternates).toHaveLength(2);
      expect(result.alternates?.find((a) => a.hrefLang === 'ko')).toBeDefined();
      expect(result.alternates?.find((a) => a.hrefLang === 'x-default')).toBeDefined();
    });

    it('Twitter 사이트 설정', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.twitter?.site).toBe('@testsite');
    });

    it('Open Graph 이미지 메타데이터', () => {
      const input: PageMetaInput = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        locale: 'en',
      };

      const result = createPageMeta(input, mockSiteConfig);

      expect(result.openGraph?.images?.[0].width).toBe(1200);
      expect(result.openGraph?.images?.[0].height).toBe(630);
      expect(result.openGraph?.images?.[0].alt).toBe('Test Page');
    });
  });

  describe('formatTitle', () => {
    it('기본 구분자로 타이틀 포맷', () => {
      const result = formatTitle('Page Title', 'Site Name');
      expect(result).toBe('Page Title | Site Name');
    });

    it('커스텀 구분자 사용', () => {
      const result = formatTitle('Page Title', 'Site Name', ' - ');
      expect(result).toBe('Page Title - Site Name');
    });

    it('빈 구분자 사용', () => {
      const result = formatTitle('Page Title', 'Site Name', '');
      expect(result).toBe('Page TitleSite Name');
    });
  });

  describe('generateMetaTags', () => {
    it('기본 메타 태그 생성', () => {
      const meta = {
        title: 'Test Page',
        description: 'Test description',
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<title>Test Page</title>');
      expect(result).toContain('<meta name="description" content="Test description" />');
    });

    it('키워드 메타 태그', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        keywords: ['seo', 'test', 'meta'],
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<meta name="keywords" content="seo, test, meta" />');
    });

    it('robots 메타 태그', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        robots: 'noindex, nofollow',
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<meta name="robots" content="noindex, nofollow" />');
    });

    it('canonical 링크', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        canonical: 'https://example.com/page',
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<link rel="canonical" href="https://example.com/page" />');
    });

    it('alternate 링크', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        alternates: [
          { hrefLang: 'ko', href: 'https://example.com/ko/page' },
          { hrefLang: 'x-default', href: 'https://example.com/en/page' },
        ],
      };

      const result = generateMetaTags(meta);

      expect(result).toContain(
        '<link rel="alternate" hreflang="ko" href="https://example.com/ko/page" />',
      );
      expect(result).toContain(
        '<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />',
      );
    });

    it('Open Graph 메타 태그', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        openGraph: {
          type: 'website' as const,
          title: 'OG Title',
          description: 'OG Description',
          url: 'https://example.com',
          siteName: 'Test Site',
          locale: 'en_US',
          images: [
            {
              url: 'https://example.com/image.png',
              width: 1200,
              height: 630,
              alt: 'Image Alt',
            },
          ],
        },
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<meta property="og:type" content="website" />');
      expect(result).toContain('<meta property="og:title" content="OG Title" />');
      expect(result).toContain('<meta property="og:description" content="OG Description" />');
      expect(result).toContain('<meta property="og:url" content="https://example.com" />');
      expect(result).toContain('<meta property="og:site_name" content="Test Site" />');
      expect(result).toContain('<meta property="og:locale" content="en_US" />');
      expect(result).toContain(
        '<meta property="og:image" content="https://example.com/image.png" />',
      );
      expect(result).toContain('<meta property="og:image:width" content="1200" />');
      expect(result).toContain('<meta property="og:image:height" content="630" />');
      expect(result).toContain('<meta property="og:image:alt" content="Image Alt" />');
    });

    it('Twitter 메타 태그', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        twitter: {
          card: 'summary_large_image' as const,
          site: '@testsite',
          title: 'Twitter Title',
          description: 'Twitter Description',
          image: 'https://example.com/twitter-image.png',
          imageAlt: 'Twitter Image Alt',
        },
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(result).toContain('<meta name="twitter:site" content="@testsite" />');
      expect(result).toContain('<meta name="twitter:title" content="Twitter Title" />');
      expect(result).toContain('<meta name="twitter:description" content="Twitter Description" />');
      expect(result).toContain(
        '<meta name="twitter:image" content="https://example.com/twitter-image.png" />',
      );
      expect(result).toContain('<meta name="twitter:image:alt" content="Twitter Image Alt" />');
    });

    it('HTML 특수문자 이스케이프', () => {
      const meta = {
        title: 'Test & "Special" <Characters>',
        description: "It's a test with 'quotes'",
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<title>Test &amp; &quot;Special&quot; &lt;Characters&gt;</title>');
      expect(result).toContain('It&#39;s a test with &#39;quotes&#39;');
    });

    it('Open Graph 이미지 없을 때', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        openGraph: {
          type: 'website' as const,
          title: 'OG Title',
          description: 'OG Description',
          url: 'https://example.com',
          siteName: 'Test Site',
          locale: 'en_US',
        },
      };

      const result = generateMetaTags(meta);

      expect(result).not.toContain('og:image');
    });

    it('Open Graph 이미지 width/height/alt 없을 때', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        openGraph: {
          type: 'website' as const,
          title: 'OG Title',
          description: 'OG Description',
          url: 'https://example.com',
          siteName: 'Test Site',
          locale: 'en_US',
          images: [
            {
              url: 'https://example.com/image.png',
              // width, height, alt 없음
            },
          ],
        },
      };

      const result = generateMetaTags(meta);

      expect(result).toContain(
        '<meta property="og:image" content="https://example.com/image.png" />',
      );
      expect(result).not.toContain('og:image:width');
      expect(result).not.toContain('og:image:height');
      expect(result).not.toContain('og:image:alt');
    });

    it('Twitter 이미지/사이트 없을 때', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        twitter: {
          card: 'summary' as const,
          title: 'Twitter Title',
          description: 'Twitter Description',
        },
      };

      const result = generateMetaTags(meta);

      expect(result).toContain('<meta name="twitter:card" content="summary" />');
      expect(result).not.toContain('twitter:site');
      expect(result).not.toContain('twitter:image');
    });

    it('Twitter imageAlt 없을 때', () => {
      const meta = {
        title: 'Test',
        description: 'Test',
        twitter: {
          card: 'summary_large_image' as const,
          title: 'Twitter Title',
          description: 'Twitter Description',
          image: 'https://example.com/image.png',
          // imageAlt 없음
        },
      };

      const result = generateMetaTags(meta);

      expect(result).toContain(
        '<meta name="twitter:image" content="https://example.com/image.png" />',
      );
      expect(result).not.toContain('twitter:image:alt');
    });
  });
});
