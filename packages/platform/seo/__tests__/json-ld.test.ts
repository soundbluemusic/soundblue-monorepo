import { describe, expect, it } from 'vitest';
import {
  combineJsonLd,
  createBreadcrumbJsonLd,
  createOrganizationJsonLd,
  createSoftwareApplicationJsonLd,
  createWebSiteJsonLd,
  generateJsonLdScript,
} from '../src/structured-data/json-ld';

describe('json-ld - Structured Data Generator', () => {
  describe('createWebSiteJsonLd', () => {
    it('기본 WebSite JSON-LD 생성', () => {
      const result = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
      });

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
      expect(result.name).toBe('Test Site');
      expect(result.url).toBe('https://example.com');
    });

    it('설명과 언어 포함', () => {
      const result = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
        description: 'A test website',
        inLanguage: 'en',
      });

      expect(result.description).toBe('A test website');
      expect(result.inLanguage).toBe('en');
    });

    it('검색 액션 포함', () => {
      const result = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
        searchUrl: 'https://example.com/search?q={search_term_string}',
      });

      expect(result.potentialAction).toBeDefined();
      expect(result.potentialAction?.['@type']).toBe('SearchAction');
      expect(result.potentialAction?.target['@type']).toBe('EntryPoint');
      expect(result.potentialAction?.target.urlTemplate).toBe(
        'https://example.com/search?q={search_term_string}',
      );
      expect(result.potentialAction?.['query-input']).toBe('required name=search_term_string');
    });

    it('검색 URL 없으면 potentialAction 없음', () => {
      const result = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
      });

      expect(result.potentialAction).toBeUndefined();
    });
  });

  describe('createSoftwareApplicationJsonLd', () => {
    it('기본 SoftwareApplication JSON-LD 생성', () => {
      const result = createSoftwareApplicationJsonLd({
        name: 'Test App',
        description: 'A test application',
        url: 'https://example.com/app',
      });

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('SoftwareApplication');
      expect(result.name).toBe('Test App');
      expect(result.description).toBe('A test application');
      expect(result.url).toBe('https://example.com/app');
      expect(result.applicationCategory).toBe('WebApplication');
      expect(result.operatingSystem).toBe('All');
    });

    it('커스텀 카테고리와 OS', () => {
      const result = createSoftwareApplicationJsonLd({
        name: 'Test App',
        description: 'A test application',
        url: 'https://example.com/app',
        category: 'MusicApplication',
        operatingSystem: 'Web, iOS, Android',
      });

      expect(result.applicationCategory).toBe('MusicApplication');
      expect(result.operatingSystem).toBe('Web, iOS, Android');
    });

    it('무료 앱 (기본값)', () => {
      const result = createSoftwareApplicationJsonLd({
        name: 'Test App',
        description: 'A test application',
        url: 'https://example.com/app',
      });

      expect(result.offers).toBeDefined();
      expect(result.offers?.['@type']).toBe('Offer');
      expect(result.offers?.price).toBe('0');
      expect(result.offers?.priceCurrency).toBe('USD');
    });

    it('무료 앱 명시적 true', () => {
      const result = createSoftwareApplicationJsonLd({
        name: 'Test App',
        description: 'A test application',
        url: 'https://example.com/app',
        isFree: true,
      });

      expect(result.offers?.price).toBe('0');
    });

    it('유료 앱', () => {
      const result = createSoftwareApplicationJsonLd({
        name: 'Test App',
        description: 'A test application',
        url: 'https://example.com/app',
        isFree: false,
      });

      expect(result.offers).toBeUndefined();
    });
  });

  describe('createOrganizationJsonLd', () => {
    it('기본 Organization JSON-LD 생성', () => {
      const result = createOrganizationJsonLd({
        name: 'Test Company',
        url: 'https://example.com',
      });

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
      expect(result.name).toBe('Test Company');
      expect(result.url).toBe('https://example.com');
    });

    it('로고 포함', () => {
      const result = createOrganizationJsonLd({
        name: 'Test Company',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
      });

      expect(result.logo).toBe('https://example.com/logo.png');
    });

    it('소셜 미디어 링크 포함', () => {
      const result = createOrganizationJsonLd({
        name: 'Test Company',
        url: 'https://example.com',
        sameAs: [
          'https://twitter.com/testcompany',
          'https://facebook.com/testcompany',
          'https://instagram.com/testcompany',
        ],
      });

      expect(result.sameAs).toHaveLength(3);
      expect(result.sameAs).toContain('https://twitter.com/testcompany');
    });

    it('로고와 sameAs 없을 때', () => {
      const result = createOrganizationJsonLd({
        name: 'Test Company',
        url: 'https://example.com',
      });

      expect(result.logo).toBeUndefined();
      expect(result.sameAs).toBeUndefined();
    });
  });

  describe('createBreadcrumbJsonLd', () => {
    it('빈 브레드크럼', () => {
      const result = createBreadcrumbJsonLd([]);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(0);
    });

    it('단일 브레드크럼 항목', () => {
      const result = createBreadcrumbJsonLd([{ name: 'Home', url: 'https://example.com' }]);

      expect(result.itemListElement).toHaveLength(1);
      expect(result.itemListElement[0]['@type']).toBe('ListItem');
      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[0].name).toBe('Home');
      expect(result.itemListElement[0].item).toBe('https://example.com');
    });

    it('다중 브레드크럼 항목', () => {
      const result = createBreadcrumbJsonLd([
        { name: 'Home', url: 'https://example.com' },
        { name: 'Products', url: 'https://example.com/products' },
        { name: 'Item', url: 'https://example.com/products/item' },
      ]);

      expect(result.itemListElement).toHaveLength(3);
      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[1].position).toBe(2);
      expect(result.itemListElement[2].position).toBe(3);
    });

    it('URL 없는 마지막 항목 (현재 페이지)', () => {
      const result = createBreadcrumbJsonLd([
        { name: 'Home', url: 'https://example.com' },
        { name: 'Current Page' },
      ]);

      expect(result.itemListElement[1].item).toBeUndefined();
      expect(result.itemListElement[1].name).toBe('Current Page');
    });
  });

  describe('generateJsonLdScript', () => {
    it('단일 JSON-LD 스크립트 생성', () => {
      const jsonLd = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
      });

      const result = generateJsonLdScript(jsonLd);

      expect(result).toContain('<script type="application/ld+json">');
      expect(result).toContain('</script>');
      expect(result).toContain('"@context":"https://schema.org"');
      expect(result).toContain('"@type":"WebSite"');
    });

    it('배열 JSON-LD 스크립트 생성', () => {
      const jsonLds = [
        createWebSiteJsonLd({
          name: 'Test Site',
          url: 'https://example.com',
        }),
        createOrganizationJsonLd({
          name: 'Test Company',
          url: 'https://example.com',
        }),
      ];

      const result = generateJsonLdScript(jsonLds);

      expect(result).toContain('<script type="application/ld+json">');
      expect(result).toContain('"WebSite"');
      expect(result).toContain('"Organization"');
    });
  });

  describe('combineJsonLd', () => {
    it('여러 JSON-LD 결합', () => {
      const website = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
      });
      const org = createOrganizationJsonLd({
        name: 'Test Company',
        url: 'https://example.com',
      });

      const result = combineJsonLd(website, org);

      expect(result).toHaveLength(2);
      expect(result[0]['@type']).toBe('WebSite');
      expect(result[1]['@type']).toBe('Organization');
    });

    it('falsy 값 필터링', () => {
      const website = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
      });

      // @ts-expect-error - testing falsy value filtering
      const result = combineJsonLd(website, null, undefined);

      expect(result).toHaveLength(1);
    });

    it('빈 결합', () => {
      const result = combineJsonLd();

      expect(result).toHaveLength(0);
    });

    it('모든 타입 결합', () => {
      const website = createWebSiteJsonLd({
        name: 'Test Site',
        url: 'https://example.com',
      });
      const org = createOrganizationJsonLd({
        name: 'Test Company',
        url: 'https://example.com',
      });
      const app = createSoftwareApplicationJsonLd({
        name: 'Test App',
        description: 'A test app',
        url: 'https://example.com/app',
      });
      const breadcrumb = createBreadcrumbJsonLd([{ name: 'Home', url: 'https://example.com' }]);

      const result = combineJsonLd(website, org, app, breadcrumb);

      expect(result).toHaveLength(4);
    });
  });
});
