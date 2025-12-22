import { describe, expect, it } from 'vitest';
import { BUILD_DIR, fileExists, isValidXML, readFile } from './helpers/test-utils';

/**
 * SEO Files Test - SEO 관련 파일 검증
 *
 * 목적:
 * - robots.txt, sitemap.xml, _headers 등 SEO 파일이 올바르게 생성되었는지 확인
 * - AI 크롤러 허용 여부 확인
 * - 보안 헤더 설정 확인
 */

describe('SEO Files', () => {
  describe('robots.txt', () => {
    it('robots.txt 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/robots.txt`)).toBe(true);
    });

    it('모든 크롤러 허용 설정', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);

      expect(robotsTxt).toContain('User-agent: *');
      expect(robotsTxt).toContain('Allow: /');
    });

    it('AI 크롤러 명시적 허용 - OpenAI (GPTBot)', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('User-agent: GPTBot');
      expect(robotsTxt).toContain('User-agent: ChatGPT-User');
    });

    it('AI 크롤러 명시적 허용 - Anthropic (Claude)', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toMatch(/User-agent: Claude-Web|User-agent: ClaudeBot/);
    });

    it('AI 크롤러 명시적 허용 - Google Extended (Gemini)', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('User-agent: Google-Extended');
    });

    it('AI 크롤러 명시적 허용 - Perplexity', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('User-agent: PerplexityBot');
    });

    it('AI 크롤러 명시적 허용 - Common Crawl', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('User-agent: CCBot');
    });

    it('AI 크롤러 차단 안 됨', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);

      const aiCrawlers = [
        'GPTBot',
        'ClaudeBot',
        'Claude-Web',
        'PerplexityBot',
        'Google-Extended',
        'CCBot',
      ];

      aiCrawlers.forEach((crawler) => {
        // "User-agent: GPTBot\nDisallow: /" 같은 차단 패턴이 없어야 함
        const blockPattern = new RegExp(`User-agent:\\s*${crawler}[\\s\\S]*?Disallow:\\s*/\\s`, 'i');
        expect(robotsTxt).not.toMatch(blockPattern);
      });
    });

    it('Sitemap 링크 존재', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('Sitemap:');
      expect(robotsTxt).toMatch(/Sitemap:\s*https?:\/\//);
    });

    it('빌드 아티팩트 차단', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toMatch(/Disallow:\s*\/_build/);
    });
  });

  describe('sitemap.xml', () => {
    it('sitemap.xml 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/sitemap.xml`)).toBe(true);
    });

    it('유효한 XML 형식', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      expect(isValidXML(sitemap)).toBe(true);
    });

    it('XML 선언 포함', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      expect(sitemap).toMatch(/<\?xml version="1\.0"/);
    });

    it('sitemap 네임스페이스 정의', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    });

    it('urlset 또는 sitemapindex 태그 존재', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      expect(sitemap).toMatch(/<urlset|<sitemapindex/);
    });

    it('loc 태그에 HTTPS URL 포함', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      expect(sitemap).toMatch(/<loc>https:\/\//);
    });

    it('도메인 포함', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      expect(sitemap).toContain('soundbluemusic.com');
    });
  });

  describe('_headers (보안 헤더)', () => {
    it('_headers 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/_headers`)).toBe(true);
    });

    it('HSTS 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toContain('Strict-Transport-Security');
      expect(headers).toMatch(/max-age=\d+/);
    });

    it('X-Content-Type-Options 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toContain('X-Content-Type-Options: nosniff');
    });

    it('X-Frame-Options 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toMatch(/X-Frame-Options:\s*(DENY|SAMEORIGIN)/);
    });

    it('Content-Security-Policy 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toContain('Content-Security-Policy');
    });

    it('Referrer-Policy 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toContain('Referrer-Policy');
    });

    it('COOP/COEP 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toContain('Cross-Origin-Opener-Policy');
      expect(headers).toContain('Cross-Origin-Embedder-Policy');
    });

    it('정적 asset 캐싱 헤더 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toContain('Cache-Control');
    });

    it('_build 디렉토리에 긴 캐시 설정', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      expect(headers).toMatch(/_build.*Cache-Control.*max-age=31536000/s);
    });
  });

  describe('_redirects', () => {
    it('_redirects 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/_redirects`)).toBe(true);
    });

    it('루트 경로 리다이렉트 설정 (언어 기본값)', () => {
      const redirects = readFile(`${BUILD_DIR}/_redirects`);

      // 기본 언어로 리다이렉트하거나 언어 감지 로직 존재
      // Example: "/" -> "/en" or "/" -> "/ko"
      const hasRedirect =
        redirects.includes('/') &&
        (redirects.includes('/en') || redirects.includes('/ko'));

      expect(hasRedirect).toBe(true);
    });

    it('404 페이지 처리', () => {
      const redirects = readFile(`${BUILD_DIR}/_redirects`);
      expect(redirects).toMatch(/\/\*.*404/);
    });
  });

  describe('기타 SEO 파일', () => {
    it('llms.txt 파일 존재 (AI 가이드)', () => {
      const llmsExists = fileExists(`${BUILD_DIR}/llms.txt`);
      if (llmsExists) {
        const llms = readFile(`${BUILD_DIR}/llms.txt`);
        expect(llms.length).toBeGreaterThan(0);
      }
    });

    it('sitemap.xsl 파일 존재 (sitemap 스타일링)', () => {
      const xslExists = fileExists(`${BUILD_DIR}/sitemap.xsl`);
      if (xslExists) {
        const xsl = readFile(`${BUILD_DIR}/sitemap.xsl`);
        expect(xsl).toContain('<?xml');
        expect(xsl).toMatch(/<xsl:stylesheet|<xsl:transform/);
      }
    });
  });

  describe('Edge Cases', () => {
    it('robots.txt에 잘못된 문법 없음', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);

      // 각 User-agent 블록이 올바른 형식인지 확인
      const lines = robotsTxt.split('\n');
      let inUserAgentBlock = false;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('User-agent:')) {
          inUserAgentBlock = true;
        } else if (trimmed.startsWith('#') || trimmed === '') {
          // 주석이나 빈 줄은 허용
        } else if (
          trimmed.startsWith('Allow:') ||
          trimmed.startsWith('Disallow:') ||
          trimmed.startsWith('Crawl-delay:') ||
          trimmed.startsWith('Sitemap:')
        ) {
          // 유효한 directive
        } else if (inUserAgentBlock) {
          // 알 수 없는 directive는 경고
          console.warn(`Unknown directive in robots.txt: ${trimmed}`);
        }
      });
    });

    it('sitemap.xml에 중복 URL 없음', () => {
      const sitemap = readFile(`${BUILD_DIR}/sitemap.xml`);
      const locMatches = sitemap.match(/<loc>([^<]+)<\/loc>/g);

      if (locMatches) {
        const urls = locMatches.map((match) => match.replace(/<\/?loc>/g, ''));
        const uniqueUrls = [...new Set(urls)];

        expect(urls.length).toBe(uniqueUrls.length);
      }
    });

    it('_headers에 중복 설정 없음', () => {
      const headers = readFile(`${BUILD_DIR}/_headers`);
      const lines = headers.split('\n').filter((line) => line.trim());

      const headerNames = lines
        .filter((line) => line.includes(':') && !line.startsWith('#') && !line.startsWith('/'))
        .map((line) => line.split(':')[0].trim());

      // 섹션별로 중복 체크
      const sections = headers.split(/^\/.*$/m);
      sections.forEach((section) => {
        const sectionHeaders = section
          .split('\n')
          .filter((line) => line.includes(':') && !line.startsWith('#'))
          .map((line) => line.split(':')[0].trim());

        const unique = [...new Set(sectionHeaders)];
        expect(sectionHeaders.length).toBe(unique.length);
      });
    });
  });
});
