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
        injectRegister: 'auto',
        includeAssets: ['favicon.png', 'icons/*.png', 'icons/*.svg'],
        manifest: false, // Use existing manifest.json in public/
        workbox: {
          // SSG: precache all static files
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
          // Clean up old caches on update
          cleanupOutdatedCaches: true,
          // Activate new SW immediately
          skipWaiting: true,
          // Take control of all clients immediately
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
