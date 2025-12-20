import type { Config } from '@react-router/dev/config';

// Tool slugs for pre-rendering
const tools = ['metronome', 'drumMachine', 'qr', 'translator'];

export default {
  // 100% SSG - No server-side rendering (CLAUDE.md requirement)
  ssr: false,

  // Pre-render all routes for static hosting
  async prerender() {
    const toolRoutes = tools.flatMap((slug) => [`/${slug}`, `/ko/${slug}`]);
    return [
      '/',
      '/ko',
      '/about',
      '/ko/about',
      '/built-with',
      '/ko/built-with',
      '/benchmark',
      '/ko/benchmark',
      ...toolRoutes,
    ];
  },
} satisfies Config;
