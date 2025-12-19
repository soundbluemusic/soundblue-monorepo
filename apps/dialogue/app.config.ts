import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // SSR disabled - 100% static site generation (SSG)
  ssr: false,
  server: {
    preset: 'static',
    prerender: {
      routes: ['/', '/ko', '/about', '/ko/about'],
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),

      // PWA Support - SSG optimized (100% offline)
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'icons/*.png', 'icons/*.svg'],
        manifest: false, // Use existing manifest.json in public/
        // Fix SW path: generate at /_build/sw.js and register from there
        buildBase: '/_build/',
        workbox: {
          // SSG: precache all static files
          globPatterns: ['**/*.{html,js,css,png,svg,ico,woff,woff2,json}'],
          // SSG doesn't need navigateFallback (all pages are precached)
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  },
});
