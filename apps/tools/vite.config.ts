import { cloudflare } from '@cloudflare/vite-plugin';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { vitePluginPwa } from './pwa.config';

const isAnalyze = process.env['ANALYZE'] === 'true';

export default defineConfig({
  plugins: [
    viteTsConfigPaths(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
    }),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    vitePluginPwa(),
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
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('@tanstack/react-router')
          )
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
      '~': '/src',
      '@': '/src',
    },
  },
});
