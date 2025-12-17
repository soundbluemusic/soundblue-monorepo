import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

const isAnalyze = process.env['ANALYZE'] === 'true';

export default defineConfig({
  // Static Site Generation (SSG) - Pre-render all pages at build time
  ssr: true,
  server: {
    preset: 'static',
  },

  vite: {
    plugins: [
      // Tailwind CSS 4 - spread array for vinxi compatibility
      ...tailwindcss(),

      // PWA Support - Enhanced offline capabilities
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icons/*.png', 'og-image.png'],
        manifest: {
          name: 'Tools',
          short_name: 'Tools',
          description: 'Music Tools with Chat Interface - Metronome, Drum Machine, QR Generator',
          theme_color: '#3b82f6',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          lang: 'ko',
          dir: 'ltr',
          categories: ['music', 'utilities', 'productivity'],
          shortcuts: [
            {
              name: 'Metronome',
              short_name: 'Metronome',
              description: 'Open Metronome tool',
              url: '/metronome',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Drum Machine',
              short_name: 'Drums',
              description: 'Open Drum Machine tool',
              url: '/drumMachine',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'QR Generator',
              short_name: 'QR',
              description: 'Open QR Code Generator',
              url: '/qr',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
            },
          ],
          icons: [
            {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png',
            },
            {
              src: '/icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: '/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: '/icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: '/icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png',
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Cache all static assets for offline use
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm,json}'],
          // Clean up old caches
          cleanupOutdatedCaches: true,
          // Skip waiting to activate new service worker immediately
          skipWaiting: true,
          // Claim clients immediately
          clientsClaim: true,
          // Navigation preload for faster page loads
          navigationPreload: true,
          runtimeCaching: [
            // Cache page navigations (HTML) with Network First strategy
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                networkTimeoutSeconds: 3,
              },
            },
            // Cache WASM files with Cache First (they rarely change)
            {
              urlPattern: /\.(?:wasm)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'wasm-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            // Cache audio files
            {
              urlPattern: /\.(?:wav|mp3|ogg|m4a)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            // Cache fonts with Cache First
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
                },
              },
            },
            // Cache images with Cache First
            {
              urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            // Cache JS/CSS with Stale While Revalidate
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Disable in development
        },
      }),
      // Note: Brotli/Gzip compression is handled automatically by Cloudflare Pages
    ],

    // WASM & Worker 지원
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },

    worker: {
      format: 'es',
    },

    build: {
      target: 'esnext',
      // WASM 파일 처리
      assetsInlineLimit: 0,
      // 빌드 속도 최적화
      sourcemap: false,
      minify: 'esbuild',
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          // Code splitting for better caching
          // Note: solid-js packages are externalized in SSR, so only include non-SSR dependencies
          manualChunks: (id: string) => {
            // Only apply chunking to node_modules
            if (!id.includes('node_modules')) return undefined;
            // Skip externalized SSR packages
            if (id.includes('solid-js') || id.includes('@solidjs')) return undefined;
            // UI vendor chunk
            if (
              id.includes('@kobalte/core') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'ui-vendor';
            }
            return undefined;
          },
        },
        plugins: isAnalyze
          ? [
              visualizer({
                filename: 'dist/stats.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
              }),
            ]
          : [],
      },
    },

    // 경로 별칭
    resolve: {
      alias: {
        '@': '/src',
        '~/components': '/src/components',
        '~/engine': '/src/engine',
        '~/stores': '/src/stores',
        '~/hooks': '/src/hooks',
        '~/lib': '/src/lib',
        '~/types': '/src/types',
        '~/tools': '/src/tools',
        '~/i18n': '/src/i18n',
      },
    },
  },
});
