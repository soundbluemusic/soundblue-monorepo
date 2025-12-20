import type { Config } from '@react-router/dev/config';

export default {
  // 100% SSG - No server-side rendering (CLAUDE.md requirement)
  ssr: false,

  // Pre-render all routes for static hosting
  async prerender() {
    return ['/', '/ko', '/about', '/ko/about'];
  },
} satisfies Config;
