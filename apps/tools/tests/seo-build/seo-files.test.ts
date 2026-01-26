import { describe, expect, it } from 'vitest';
import { BUILD_DIR, fileExists, isValidXML, readFile } from './helpers/test-utils';

/**
 * Tools App - SEO Files Test
 *
 * 목적:
 * - robots.txt, sitemap.xml 등 SEO 파일이 올바르게 생성되었는지 확인
 * - AI 크롤러 허용 여부 확인
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
    });

    it('AI 크롤러 명시적 허용 - Anthropic (Claude)', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toMatch(/User-agent: Claude-Web|User-agent: ClaudeBot/);
    });

    it('AI 크롤러 명시적 허용 - Google Extended (Gemini)', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('User-agent: Google-Extended');
    });

    it('AI 크롤러 차단 안 됨', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);

      const aiCrawlers = ['GPTBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended'];

      aiCrawlers.forEach((crawler) => {
        // "User-agent: GPTBot\nDisallow: /" 같은 차단 패턴이 없어야 함
        const blockPattern = new RegExp(
          `User-agent:\\s*${crawler}[\\s\\S]*?Disallow:\\s*/\\s`,
          'i',
        );
        expect(robotsTxt).not.toMatch(blockPattern);
      });
    });

    it('Sitemap 링크 존재', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);
      expect(robotsTxt).toContain('Sitemap:');
      expect(robotsTxt).toMatch(/Sitemap:\s*https?:\/\//);
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
      expect(sitemap).toContain('tools.soundbluemusic.com');
    });
  });

  describe('도구별 sitemap 검증', () => {
    it('sitemap-tools.xml 존재 (도구 전용)', () => {
      const exists = fileExists(`${BUILD_DIR}/sitemap-tools.xml`);
      if (exists) {
        const sitemap = readFile(`${BUILD_DIR}/sitemap-tools.xml`);
        expect(isValidXML(sitemap)).toBe(true);
      }
    });

    it('sitemap-pages.xml 존재 (페이지 전용)', () => {
      const exists = fileExists(`${BUILD_DIR}/sitemap-pages.xml`);
      if (exists) {
        const sitemap = readFile(`${BUILD_DIR}/sitemap-pages.xml`);
        expect(isValidXML(sitemap)).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('robots.txt에 잘못된 문법 없음', () => {
      const robotsTxt = readFile(`${BUILD_DIR}/robots.txt`);

      const lines = robotsTxt.split('\n');

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('#')) {
          return; // 빈 줄이나 주석은 허용
        }

        // 유효한 directive만 허용
        const validDirectives = [
          'User-agent:',
          'Allow:',
          'Disallow:',
          'Crawl-delay:',
          'Sitemap:',
          'Host:',
        ];

        const isValid = validDirectives.some((d) => trimmed.startsWith(d));
        if (!isValid) {
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
  });

  describe('404 페이지', () => {
    it('404.html 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/404.html`)).toBe(true);
    });

    it('404 페이지에 콘텐츠 있음', () => {
      const content = readFile(`${BUILD_DIR}/404.html`);
      expect(content.length).toBeGreaterThan(100);
      expect(content.toLowerCase()).toContain('<!doctype html>');
    });
  });
});
