import { VitePWA } from 'vite-plugin-pwa';

export function vitePluginPwa() {
  return VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: {
      // SSG: Precache all static files for 100% offline support
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webp,avif,json}'],
      // Clean up old caches on update
      cleanupOutdatedCaches: true,
      // Activate new SW immediately
      skipWaiting: true,
      // Take control of all clients immediately
      clientsClaim: true,
      // SSG doesn't need navigateFallback - all pages are precached
      // Only cache external resources (Google Fonts)
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    manifest: false, // Use existing manifest.webmanifest in public/
    devOptions: {
      enabled: false,
    },
  });
}
