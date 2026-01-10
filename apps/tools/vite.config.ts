import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const isAnalyze = process.env['ANALYZE'] === 'true';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './app/paraglide',
    }),
    tailwindcss(),
    reactRouter(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'icons/*.png', 'og-image.png'],
      manifest: {
        name: 'Tools',
        short_name: 'Tools',
        description: 'Music Tools - Metronome, Drum Machine, QR Generator',
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
            url: '/drum-machine',
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
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // data/sentences/*.json 제외 (12MB+ 파일 - runtime caching 사용)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}'],
        globIgnores: ['**/data/sentences/**'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:wasm)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\.(?:wav|mp3|ogg|m4a)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // 문장 사전 JSON - lazy loading + runtime caching
            urlPattern: /\/data\/sentences\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sentences-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    isAnalyze &&
      visualizer({
        filename: 'stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
  ].filter(Boolean) as PluginOption[],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    include: ['lucide-react'],
  },
  worker: { format: 'es' },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // ========================================
          // 번역기 청크 분리 (920KB 외부 사전 lazy loading)
          // ========================================
          // 외부 사전 - 가장 큰 파일, 별도 청크로 lazy load
          if (id.includes('translator/dictionary/external/words')) {
            return 'translator-external-dict';
          }
          // 번역기 v2.1 엔진 - 24K줄, 별도 청크
          if (id.includes('translator/v2.1')) {
            return 'translator-engine';
          }
          // 번역기 사전 (외부 제외) - generated, domains 등
          if (id.includes('translator/dictionary')) {
            return 'translator-dict';
          }
          // 벤치마크 데이터 - /benchmark route에서만 필요
          if (
            id.includes('translator/benchmark-data') ||
            id.includes('translator/benchmark-tests')
          ) {
            return 'translator-benchmark';
          }

          // ========================================
          // node_modules 벤더 청크
          // ========================================
          if (!id.includes('node_modules')) return undefined;
          // React core stays in main bundle for optimal loading
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router'))
            return undefined;
          // UI components - loaded on first interaction
          if (
            id.includes('@radix-ui') ||
            id.includes('class-variance-authority') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge')
          ) {
            return 'ui-vendor';
          }
          // IndexedDB - lazy load, only needed for persistence
          if (id.includes('dexie')) {
            return 'dexie-vendor';
          }
          // State management - separate chunk
          if (id.includes('zustand')) {
            return 'state-vendor';
          }
          // QR code library - only for QR tool
          if (id.includes('qrcode')) {
            return 'qrcode-vendor';
          }
          // Lucide icons - commonly used, separate chunk
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // Tone.js - audio library, only for metronome/drum-machine
          // Separate chunk to prevent duplication across audio tools
          if (id.includes('tone')) {
            return 'tone-vendor';
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': '/app',
      '@': '/app',
    },
  },
});
