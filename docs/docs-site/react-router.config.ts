import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  basename: '/soundblue-monorepo/',
  async prerender() {
    const locales = ['', 'ko', 'ja'];
    const pages = ['', 'sound-blue', 'tools', 'dialogue', 'about'];

    const paths: string[] = [];

    for (const locale of locales) {
      for (const page of pages) {
        if (locale === '') {
          paths.push(page === '' ? '/' : `/${page}`);
        } else {
          paths.push(page === '' ? `/${locale}` : `/${locale}/${page}`);
        }
      }
    }

    return paths;
  },
} satisfies Config;
