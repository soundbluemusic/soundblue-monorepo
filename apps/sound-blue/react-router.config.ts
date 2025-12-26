import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  async prerender() {
    return [
      '/',
      '/ko',
      '/about',
      '/ko/about',
      '/privacy',
      '/ko/privacy',
      '/terms',
      '/ko/terms',
      '/license',
      '/ko/license',
      '/sitemap',
      '/ko/sitemap',
      '/sound-recording',
      '/ko/sound-recording',
      '/offline',
      '/ko/offline',
      '/blog',
      '/ko/blog',
      '/news',
      '/ko/news',
      '/chat',
      '/ko/chat',
      '/built-with',
      '/ko/built-with',
    ];
  },
} satisfies Config;
