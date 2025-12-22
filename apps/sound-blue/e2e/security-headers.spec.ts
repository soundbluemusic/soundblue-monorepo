import { expect, test } from '@playwright/test';

/**
 * Security Headers Tests
 *
 * 검증 항목:
 * - CSP (Content-Security-Policy)
 * - HSTS (Strict-Transport-Security)
 * - SRI (Subresource Integrity) for external scripts
 * - X-Frame-Options, X-Content-Type-Options
 * - COOP, COEP (Cross-Origin-*-Policy)
 */

test.describe('Security Headers', () => {
  test.describe('필수 보안 헤더 존재', () => {
    test('HSTS 헤더 설정', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const hsts = headers?.['strict-transport-security'];
      expect(hsts, 'Strict-Transport-Security header missing').toBeDefined();

      // max-age 포함 확인
      expect(hsts, 'HSTS must include max-age').toContain('max-age=');

      // max-age 값이 충분히 큼 (최소 6개월 = 15768000초)
      const maxAge = hsts?.match(/max-age=(\d+)/)?.[1];
      if (maxAge) {
        expect(
          Number.parseInt(maxAge),
          'HSTS max-age should be at least 6 months',
        ).toBeGreaterThanOrEqual(15768000);
      }
    });

    test('X-Content-Type-Options 헤더 설정', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const xContentType = headers?.['x-content-type-options'];
      expect(xContentType, 'X-Content-Type-Options header missing').toBeDefined();
      expect(xContentType, 'X-Content-Type-Options must be nosniff').toBe('nosniff');
    });

    test('X-Frame-Options 헤더 설정', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const xFrame = headers?.['x-frame-options'];
      expect(xFrame, 'X-Frame-Options header missing').toBeDefined();
      expect(xFrame, 'X-Frame-Options must be DENY or SAMEORIGIN').toMatch(/DENY|SAMEORIGIN/);
    });

    test('Referrer-Policy 헤더 설정', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const referrer = headers?.['referrer-policy'];
      expect(referrer, 'Referrer-Policy header missing').toBeDefined();
    });

    test('X-XSS-Protection 헤더 설정 (선택사항)', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const xss = headers?.['x-xss-protection'];
      if (xss) {
        // 설정되어 있다면 1; mode=block이어야 함
        expect(xss).toMatch(/1;\s*mode=block/);
      }
    });
  });

  test.describe('Content-Security-Policy (CSP)', () => {
    test('CSP 헤더 존재', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const csp = headers?.['content-security-policy'];
      expect(csp, 'Content-Security-Policy header missing').toBeDefined();
    });

    test('CSP에 default-src 지시어 포함', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const csp = headers?.['content-security-policy'];
      expect(csp, 'CSP must include default-src').toContain('default-src');
    });

    test('CSP에 script-src 지시어 포함', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const csp = headers?.['content-security-policy'];
      expect(csp, 'CSP must include script-src').toContain('script-src');
    });

    test('CSP default-src에 self 포함', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const csp = headers?.['content-security-policy'];
      expect(csp, "CSP default-src must include 'self'").toMatch(/default-src[^;]*'self'/);
    });

    test('CSP에 위험한 지시어 없음 (unsafe-eval)', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const csp = headers?.['content-security-policy'];

      // unsafe-eval은 사용하지 않아야 함
      expect(csp, "CSP should not include 'unsafe-eval'").not.toContain('unsafe-eval');
    });
  });

  test.describe('Cross-Origin Policies', () => {
    test('COOP (Cross-Origin-Opener-Policy) 설정', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const coop = headers?.['cross-origin-opener-policy'];
      expect(coop, 'Cross-Origin-Opener-Policy header missing').toBeDefined();
    });

    test('COEP (Cross-Origin-Embedder-Policy) 설정', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const coep = headers?.['cross-origin-embedder-policy'];
      expect(coep, 'Cross-Origin-Embedder-Policy header missing').toBeDefined();
    });

    test('COOP 값이 유효함', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const coop = headers?.['cross-origin-opener-policy'];
      expect(coop).toMatch(/same-origin|same-origin-allow-popups|unsafe-none/);
    });

    test('COEP 값이 유효함', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const coep = headers?.['cross-origin-embedder-policy'];
      expect(coep).toMatch(/require-corp|credentialless|unsafe-none/);
    });
  });

  test.describe('Subresource Integrity (SRI)', () => {
    test('외부 스크립트에 integrity 속성', async ({ page }) => {
      await page.goto('/');

      const externalScripts = await page.$$('script[src^="https://"]');

      for (const script of externalScripts) {
        const src = await script.getAttribute('src');

        // 자체 도메인은 제외
        if (src?.includes('soundbluemusic.com')) {
          continue;
        }

        const integrity = await script.getAttribute('integrity');
        const crossorigin = await script.getAttribute('crossorigin');

        expect(
          integrity,
          `External script ${src} should have integrity attribute`,
        ).toBeDefined();

        expect(
          integrity,
          `External script ${src} integrity must start with sha256/384/512`,
        ).toMatch(/^sha(256|384|512)-/);

        expect(
          crossorigin,
          `External script ${src} must have crossorigin="anonymous"`,
        ).toBe('anonymous');
      }
    });

    test('외부 스타일시트에 integrity 속성', async ({ page }) => {
      await page.goto('/');

      const externalStyles = await page.$$('link[rel="stylesheet"][href^="https://"]');

      for (const style of externalStyles) {
        const href = await style.getAttribute('href');

        // 자체 도메인은 제외
        if (href?.includes('soundbluemusic.com')) {
          continue;
        }

        const integrity = await style.getAttribute('integrity');

        if (integrity) {
          expect(integrity).toMatch(/^sha(256|384|512)-/);

          const crossorigin = await style.getAttribute('crossorigin');
          expect(crossorigin).toBe('anonymous');
        }
      }
    });
  });

  test.describe('Permissions Policy', () => {
    test('Permissions-Policy 헤더 설정 (선택사항)', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const permissions = headers?.['permissions-policy'];

      if (permissions) {
        // 불필요한 권한은 비활성화되어야 함
        expect(permissions).toMatch(/camera=\(\)|microphone=\(\)|geolocation=\(\)/);
      }
    });
  });

  test.describe('캐싱 헤더 보안', () => {
    test('HTML 파일은 짧은 캐시', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      const cacheControl = headers?.['cache-control'];

      if (cacheControl) {
        // HTML은 no-cache 또는 짧은 max-age
        const hasNoCache = cacheControl.includes('no-cache') || cacheControl.includes('must-revalidate');
        const hasShortMaxAge = cacheControl.match(/max-age=(\d+)/)?.[1];
        const maxAge = hasShortMaxAge ? Number.parseInt(hasShortMaxAge) : 0;

        expect(
          hasNoCache || maxAge <= 3600,
          'HTML should have short cache or no-cache',
        ).toBeTruthy();
      }
    });

    test('정적 asset은 긴 캐시', async ({ page }) => {
      const response = await page.goto('/');

      // JavaScript 파일 요청 캐치
      const jsResponse = await page.waitForResponse(
        (response) => response.url().includes('/_build/') && response.url().endsWith('.js'),
        { timeout: 5000 },
      ).catch(() => null);

      if (jsResponse) {
        const headers = jsResponse.headers();
        const cacheControl = headers['cache-control'];

        expect(cacheControl).toBeDefined();
        expect(cacheControl).toContain('max-age=');

        const maxAge = cacheControl.match(/max-age=(\d+)/)?.[1];
        if (maxAge) {
          // 최소 1년 (31536000초)
          expect(Number.parseInt(maxAge)).toBeGreaterThanOrEqual(31536000);
        }
      }
    });
  });

  test.describe('보안 취약점 확인', () => {
    test('inline 스크립트 최소화 (CSP 준수)', async ({ page }) => {
      await page.goto('/');

      const inlineScripts = await page.$$('script:not([src])');

      // inline 스크립트는 최소화되어야 함 (5개 이하)
      expect(
        inlineScripts.length,
        `Too many inline scripts (${inlineScripts.length}), should use external files`,
      ).toBeLessThanOrEqual(5);
    });

    test('form action이 HTTPS', async ({ page }) => {
      await page.goto('/');

      const forms = await page.$$('form[action]');

      for (const form of forms) {
        const action = await form.getAttribute('action');

        if (action && action.startsWith('http')) {
          expect(action, 'Form action must use HTTPS').toMatch(/^https:/);
        }
      }
    });

    test('외부 링크에 rel="noopener noreferrer"', async ({ page }) => {
      await page.goto('/');

      const externalLinks = await page.$$('a[target="_blank"]');

      for (const link of externalLinks) {
        const rel = await link.getAttribute('rel');

        expect(
          rel,
          'External links with target="_blank" should have rel="noopener noreferrer"',
        ).toBeDefined();

        expect(rel).toContain('noopener');
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('모든 보안 헤더가 소문자 키로 접근 가능', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      // HTTP 헤더는 대소문자 구분 없지만, Playwright는 소문자로 반환
      expect(headers).toHaveProperty('strict-transport-security');
      expect(headers).toHaveProperty('x-content-type-options');
      expect(headers).toHaveProperty('content-security-policy');
    });

    test('여러 페이지에서 일관된 보안 헤더', async ({ page }) => {
      const routes = ['/', '/about', '/ko'];

      for (const route of routes) {
        const response = await page.goto(route);
        const headers = response?.headers();

        expect(headers?.['strict-transport-security']).toBeDefined();
        expect(headers?.['x-content-type-options']).toBe('nosniff');
        expect(headers?.['content-security-policy']).toBeDefined();
      }
    });
  });
});
