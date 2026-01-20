import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://soundbluemusic.github.io',
	base: '/soundblue-monorepo',
	integrations: [
		starlight({
			title: 'SoundBlueMusic',
			description: 'Music and creative projects by Sound Blue',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/soundbluemusic/soundblue-monorepo' },
				{ icon: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@SoundBlueMusic' },
			],
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
				ko: {
					label: '한국어',
					lang: 'ko',
				},
				ja: {
					label: '日本語',
					lang: 'ja',
				},
			},
			sidebar: [
				{
					label: 'Projects',
					items: [
						{ label: 'Sound Blue', slug: 'sound-blue' },
						{ label: 'Tools', slug: 'tools' },
						{ label: 'Dialogue', slug: 'dialogue' },
					],
				},
				{
					label: 'About',
					items: [
						{ label: 'SoundBlueMusic', slug: 'about' },
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
			head: [
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://soundbluemusic.github.io/soundblue-monorepo/og-image.png',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'icon',
						type: 'image/svg+xml',
						href: '/soundblue-monorepo/favicon.svg',
					},
				},
			],
			credits: false,
			editLink: {
				baseUrl: 'https://github.com/soundbluemusic/soundblue-monorepo/edit/main/docs/docs-site/',
			},
			lastUpdated: true,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
		}),
	],
});
