import type { Config } from '@react-router/dev/config';
import { describe, expect, it } from 'vitest';

/** Helper type for prerender result */
interface PrerenderResult {
  paths?: string[];
}

/**
 * Routing Integration Test - 라우트 구성 검증
 *
 * 목적:
 * - SSG prerender 라우트가 올바르게 설정되었는지 확인
 * - 모든 라우트에 다국어 버전이 존재하는지 확인
 * - SSR이 비활성화되었는지 확인
 */

// react-router.config.ts 동적 import
const getReactRouterConfig = async (): Promise<Config> => {
  const config = await import('../../react-router.config');
  return config.default;
};

// Helper function to get prerender routes
const getPrerenderRoutes = async (): Promise<string[]> => {
  const config = await getReactRouterConfig();
  if (typeof config.prerender !== 'function') {
    throw new Error('prerender is not a function');
  }
  // prerender can be called with empty args for static route discovery
  const result = await (
    config.prerender as (args: Record<string, unknown>) => Promise<string[] | PrerenderResult>
  )({});
  // Handle both array and object return types
  return Array.isArray(result) ? result : (result.paths ?? []);
};

describe('React Router Configuration', () => {
  describe('SSG 설정', () => {
    it('SSR이 비활성화되어 있음 (100% SSG)', async () => {
      const config = await getReactRouterConfig();
      expect(config.ssr).toBe(false);
    });

    it('prerender 함수가 존재', async () => {
      const config = await getReactRouterConfig();
      expect(config.prerender).toBeDefined();
      expect(typeof config.prerender).toBe('function');
    });
  });

  describe('Prerender 라우트', () => {
    it('prerender 함수가 라우트 배열을 반환', async () => {
      const routes = await getPrerenderRoutes();

      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('루트 경로 (/) 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/');
    });

    it('한국어 루트 경로 (/ko) 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/ko');
    });
  });

  describe('다국어 라우트 일관성', () => {
    it('모든 영어 라우트에 대응하는 한국어 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      const enRoutes = routes.filter(
        (route: string) => !route.startsWith('/ko') && route !== '/offline',
      );
      const koRoutes = routes.filter((route: string) => route.startsWith('/ko'));

      const missingKoRoutes: string[] = [];

      enRoutes.forEach((enRoute: string) => {
        const expectedKoRoute = enRoute === '/' ? '/ko' : `/ko${enRoute}`;
        if (!koRoutes.includes(expectedKoRoute)) {
          missingKoRoutes.push(expectedKoRoute);
        }
      });

      expect(missingKoRoutes, `Missing Korean routes: ${missingKoRoutes.join(', ')}`).toEqual([]);
    });

    it('영어와 한국어 라우트 수가 동일 (offline 제외)', async () => {
      const routes = await getPrerenderRoutes();

      const enRoutes = routes.filter(
        (route: string) => !route.startsWith('/ko') && route !== '/offline',
      );
      const koRoutes = routes.filter((route: string) => route.startsWith('/ko'));

      expect(enRoutes.length, `English: ${enRoutes.length}, Korean: ${koRoutes.length}`).toBe(
        koRoutes.length,
      );
    });
  });

  describe('필수 페이지', () => {
    it('about 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/about');
      expect(routes).toContain('/ko/about');
    });

    it('privacy 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/privacy');
      expect(routes).toContain('/ko/privacy');
    });

    it('terms 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/terms');
      expect(routes).toContain('/ko/terms');
    });

    it('license 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/license');
      expect(routes).toContain('/ko/license');
    });

    it('sitemap 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/sitemap');
      expect(routes).toContain('/ko/sitemap');
    });

    it('sound-recording 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/sound-recording');
      expect(routes).toContain('/ko/sound-recording');
    });

    it('offline 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/offline');
    });

    it('blog 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/blog');
      expect(routes).toContain('/ko/blog');
    });

    it('news 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/news');
      expect(routes).toContain('/ko/news');
    });

    it('chat 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/chat');
      expect(routes).toContain('/ko/chat');
    });

    it('built-with 페이지 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).toContain('/built-with');
      expect(routes).toContain('/ko/built-with');
    });
  });

  describe('라우트 형식 검증', () => {
    it('모든 라우트가 슬래시(/)로 시작', async () => {
      const routes = await getPrerenderRoutes();

      const invalidRoutes = routes.filter((route: string) => !route.startsWith('/'));

      expect(invalidRoutes, `Invalid routes: ${invalidRoutes.join(', ')}`).toEqual([]);
    });

    it('라우트에 중복 없음', async () => {
      const routes = await getPrerenderRoutes();

      const uniqueRoutes = [...new Set(routes)];

      expect(routes.length).toBe(uniqueRoutes.length);
    });

    it('라우트에 공백 없음', async () => {
      const routes = await getPrerenderRoutes();

      const routesWithSpaces = routes.filter((route: string) => route.includes(' '));

      expect(routesWithSpaces, `Routes with spaces: ${routesWithSpaces.join(', ')}`).toEqual([]);
    });

    it('라우트가 슬래시(/)로 끝나지 않음 (루트 제외)', async () => {
      const routes = await getPrerenderRoutes();

      const routesEndingWithSlash = routes.filter(
        (route: string) => route !== '/' && route !== '/ko' && route.endsWith('/'),
      );

      expect(
        routesEndingWithSlash,
        `Routes ending with slash: ${routesEndingWithSlash.join(', ')}`,
      ).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열 라우트 없음', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes).not.toContain('');
    });

    it('undefined 또는 null 라우트 없음', async () => {
      const routes = await getPrerenderRoutes();

      const invalidRoutes = routes.filter((route: string) => route === undefined || route === null);

      expect(invalidRoutes).toEqual([]);
    });

    it('최소 10개 이상의 라우트 존재', async () => {
      const routes = await getPrerenderRoutes();

      expect(routes.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('라우트 명명 규칙', () => {
    it('라우트는 소문자 사용 (케밥 케이스)', async () => {
      const routes = await getPrerenderRoutes();

      const uppercaseRoutes = routes.filter((route: string) => /[A-Z]/.test(route));

      expect(uppercaseRoutes, `Routes with uppercase: ${uppercaseRoutes.join(', ')}`).toEqual([]);
    });

    it('라우트는 하이픈(-) 구분자 사용', async () => {
      const routes = await getPrerenderRoutes();

      // 언더스코어나 다른 구분자 사용하는 라우트 체크
      const invalidSeparators = routes.filter((route: string) => route.includes('_'));

      expect(invalidSeparators, `Routes with underscore: ${invalidSeparators.join(', ')}`).toEqual(
        [],
      );
    });
  });
});
