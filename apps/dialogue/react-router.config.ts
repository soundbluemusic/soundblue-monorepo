import type { Config } from '@react-router/dev/config';
import routes from './app/routes';

// routes.ts에서 경로 추출하여 prerender 목록 자동 생성
function extractPaths(routeConfigs: typeof routes): string[] {
  return routeConfigs.map((r) => {
    // index route는 '/'
    if (!r.path) return '/';
    // 일반 route는 '/path' 형태로
    return `/${r.path}`;
  });
}

export default {
  // 100% SSG - No server-side rendering (CLAUDE.md requirement)
  ssr: false,

  // Pre-render all routes for static hosting
  async prerender() {
    return extractPaths(routes);
  },
} satisfies Config;
