import { cloudflare } from '@cloudflare/vite-plugin';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';
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
  ].filter(Boolean),
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: 'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // ========================================
          // 번역기 청크 분리 (큰 사전 파일 lazy loading)
          // ========================================
          if (id.includes('translator/dictionary/external/words')) {
            return 'translator-external-dict';
          }
          if (id.includes('translator/v2.1')) {
            return 'translator-engine';
          }
          if (id.includes('translator/dictionary')) {
            return 'translator-dict';
          }

          // ========================================
          // node_modules 벤더 청크
          // ========================================
          if (!id.includes('node_modules')) return undefined;
          // React core stays in main bundle
          if (id.includes('react') || id.includes('react-dom') || id.includes('@tanstack'))
            return undefined;
          // Lucide icons - separate chunk
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // State management
          if (id.includes('zustand')) {
            return 'state-vendor';
          }
          // Framer Motion - animation library
          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-router'],
  },
  // HMR 및 개발 서버 설정 - SSR 번들 동기화 문제 해결
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      // 모든 src 파일 변경 감지
      ignored: ['!**/src/**'],
    },
  },
  // alias는 viteTsConfigPaths()가 tsconfig.json에서 자동 처리
  // 중복 설정 제거하여 충돌 방지
});
