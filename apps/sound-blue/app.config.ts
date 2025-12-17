import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { vitePluginPwa } from './pwa.config';

const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig({
  server: {
    preset: 'static',
    prerender: {
      routes: [
        '/',
        '/ko/',
        '/about/',
        '/ko/about/',
        '/privacy/',
        '/ko/privacy/',
        '/terms/',
        '/ko/terms/',
        '/license/',
        '/ko/license/',
        '/sitemap/',
        '/ko/sitemap/',
        '/sound-recording/',
        '/ko/sound-recording/',
        '/offline/',
      ],
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
      vitePluginPwa(),
      // Gzip compression (fallback)
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files > 1KB
        deleteOriginFile: false,
      }),
      // Brotli compression (best compression)
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Bundle analyzer (only when ANALYZE=true)
      isAnalyze &&
        visualizer({
          filename: 'stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // treemap, sunburst, network
        }),
    ].filter(Boolean),
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          // Code splitting for better caching
          manualChunks: {
            'solid-vendor': ['solid-js', '@solidjs/router', '@solidjs/meta'],
            'ui-vendor': ['class-variance-authority', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
    css: {
      devSourcemap: true,
    },
  },
});
