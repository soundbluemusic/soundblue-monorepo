import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://soundbluemusic.github.io',
	base: '/soundblue-monorepo',
	legacy: {
		collections: true,
	},
	vite: {
		ssr: {
			noExternal: ['nanoid'],
		},
	},
	integrations: [
		sitemap(),
		starlight({
			title: 'SoundBlue Projects',
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
						rel: 'manifest',
						href: '/soundblue-monorepo/manifest.json',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'theme-color',
						content: '#c9553d',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'mobile-web-app-capable',
						content: 'yes',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'apple-mobile-web-app-status-bar-style',
						content: 'black-translucent',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'apple-touch-icon',
						sizes: '180x180',
						href: '/soundblue-monorepo/apple-touch-icon.png',
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
				{
					tag: 'link',
					attrs: {
						rel: 'icon',
						type: 'image/png',
						sizes: '32x32',
						href: '/soundblue-monorepo/favicon-32.png',
					},
				},
				{
					tag: 'script',
					content: `
						// Register Service Worker for PWA
						if ('serviceWorker' in navigator) {
							window.addEventListener('load', function() {
								navigator.serviceWorker.register('/soundblue-monorepo/sw.js')
									.then(function(registration) {
										console.log('SW registered:', registration.scope);
									})
									.catch(function(error) {
										console.log('SW registration failed:', error);
									});
							});
						}

						// Search suggestions - show quick links when search is empty
						function initSearchSuggestions() {
							var dialog = document.querySelector('dialog[aria-label="Search"]');
							if (!dialog || !dialog.open) return;

							var searchContainer = dialog.querySelector('.search-container');
							if (!searchContainer) return;

							if (searchContainer.querySelector('#search-suggestions-container')) return;

							var lang = document.documentElement.lang || 'en';
							var basePath = '/soundblue-monorepo';

							var suggestions = {
								en: {
									title: 'Quick Links',
									links: [
										{ icon: '🎵', label: 'Sound Blue', href: basePath + '/sound-blue/' },
										{ icon: '🎛️', label: 'Tools', href: basePath + '/tools/' },
										{ icon: '💬', label: 'Dialogue', href: basePath + '/dialogue/' },
										{ icon: '📖', label: 'About', href: basePath + '/about/' }
									]
								},
								ko: {
									title: '빠른 링크',
									links: [
										{ icon: '🎵', label: 'Sound Blue', href: basePath + '/ko/sound-blue/' },
										{ icon: '🎛️', label: 'Tools', href: basePath + '/ko/tools/' },
										{ icon: '💬', label: 'Dialogue', href: basePath + '/ko/dialogue/' },
										{ icon: '📖', label: '소개', href: basePath + '/ko/about/' }
									]
								},
								ja: {
									title: 'クイックリンク',
									links: [
										{ icon: '🎵', label: 'Sound Blue', href: basePath + '/ja/sound-blue/' },
										{ icon: '🎛️', label: 'Tools', href: basePath + '/ja/tools/' },
										{ icon: '💬', label: 'Dialogue', href: basePath + '/ja/dialogue/' },
										{ icon: '📖', label: 'About', href: basePath + '/ja/about/' }
									]
								}
							};

							var data = suggestions[lang] || suggestions.en;

							var suggestionsEl = document.createElement('div');
							suggestionsEl.id = 'search-suggestions-container';
							suggestionsEl.innerHTML = '<div class="search-suggestions">' +
								'<div class="search-suggestions-title">' + data.title + '</div>' +
								'<div class="search-suggestions-links">' +
								data.links.map(function(link) {
									return '<a href="' + link.href + '" class="search-suggestion-link">' +
										'<span class="search-suggestion-icon">' + link.icon + '</span>' +
										'<span>' + link.label + '</span>' +
									'</a>';
								}).join('') +
								'</div></div>';

							searchContainer.appendChild(suggestionsEl);

							function checkInput() {
								var input = searchContainer.querySelector('input');
								if (input) {
									var hasQuery = input.value.length > 0;
									suggestionsEl.style.display = hasQuery ? 'none' : 'block';
									input.addEventListener('input', function() {
										suggestionsEl.style.display = this.value.length > 0 ? 'none' : 'block';
									});
								}
							}

							var checkInterval = setInterval(function() {
								var input = searchContainer.querySelector('input');
								if (input) {
									clearInterval(checkInterval);
									checkInput();
								}
							}, 100);

							setTimeout(function() { clearInterval(checkInterval); }, 5000);
						}

						document.addEventListener('click', function(e) {
							if (e.target.closest('[data-open-modal]')) {
								setTimeout(initSearchSuggestions, 300);
							}
						});

						document.addEventListener('keydown', function(e) {
							if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
								setTimeout(initSearchSuggestions, 300);
							}
						});
					`,
				},
			],
			credits: false,
			editLink: {
				baseUrl: 'https://github.com/soundbluemusic/soundblue-monorepo/edit/main/docs/docs-site/',
			},
			lastUpdated: true,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
			components: {
				Footer: './src/components/CustomFooter.astro',
			},
		}),
	],
});
