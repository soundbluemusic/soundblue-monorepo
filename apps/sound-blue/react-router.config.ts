import type { Config } from '@react-router/dev/config';

// 지원 로케일
const LOCALES = ['en', 'ko'] as const;
const DEFAULT_LOCALE = 'en';

// 기본 경로 목록 (로케일 prefix 없이)
const BASE_PATHS = [
  '/',
  '/about',
  '/music',
  '/privacy',
  '/terms',
  '/license',
  '/sitemap',
  '/sound-recording',
  '/news',
  '/blog',
  '/chat',
  '/built-with',
  '/offline',
];

// 로케일별 경로 생성
function generateLocalizedPaths(): string[] {
  const paths: string[] = [];

  for (const locale of LOCALES) {
    for (const basePath of BASE_PATHS) {
      if (locale === DEFAULT_LOCALE) {
        // 기본 로케일은 prefix 없이
        paths.push(basePath);
      } else {
        // 기타 로케일은 prefix 추가
        if (basePath === '/') {
          paths.push(`/${locale}`);
        } else {
          paths.push(`/${locale}${basePath}`);
        }
      }
    }
  }

  return paths;
}

export default {
  // SSG 모드 - 빌드 시 정적 HTML 생성
  ssr: false,

  // Pre-render static routes for SEO
  async prerender() {
    return generateLocalizedPaths();
  },
} satisfies Config;
