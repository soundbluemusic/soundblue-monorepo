import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './app/paraglide',
    }),
    reactRouter(),
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
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined;
          // React core stays in main bundle
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router'))
            return undefined;
          // Lucide icons - separate chunk
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // State management
          if (id.includes('zustand')) {
            return 'state-vendor';
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': '/app',
    },
  },
});
