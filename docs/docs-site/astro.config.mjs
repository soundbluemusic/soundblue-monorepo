import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://soundbluemusic.github.io',
  base: '/soundblue-monorepo',
  integrations: [
    starlight({
      title: 'SoundBlue',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ko: { label: '한국어', lang: 'ko' },
        ja: { label: '日本語', lang: 'ja' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/soundbluemusic/soundblue-monorepo' },
        { icon: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@SoundBlueMusic' },
      ],
      sidebar: [
        {
          label: 'Projects',
          translations: { ko: '프로젝트', ja: 'プロジェクト' },
          items: [
            { label: 'Sound Blue', link: '/sound-blue/' },
            { label: 'Tools', link: '/tools/' },
            { label: 'Dialogue', link: '/dialogue/' },
          ],
        },
        {
          label: 'About',
          translations: { ko: '소개', ja: '紹介' },
          items: [{ label: 'About', link: '/about/' }],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#c9553d' },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://soundbluemusic.github.io/soundblue-monorepo/og-image.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://soundbluemusic.github.io/soundblue-monorepo/og-image.png',
          },
        },
      ],
    }),
  ],
});
