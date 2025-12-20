// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

// pwa.config.ts
import { VitePWA } from "vite-plugin-pwa";
function vitePluginPwa() {
  return VitePWA({
    registerType: "autoUpdate",
    injectRegister: "auto",
    workbox: {
      // SSG: Precache all static files for 100% offline support
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webp,avif,json}"],
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
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
              // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "gstatic-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
              // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    manifest: false,
    // Use existing manifest.webmanifest in public/
    devOptions: {
      enabled: false
    }
  });
}

// app.config.ts
var isAnalyze = process.env["ANALYZE"] === "true";
var app_config_default = defineConfig({
  // SSR disabled - 100% static site generation (SSG)
  ssr: false,
  server: {
    preset: "static",
    prerender: {
      routes: [
        "/",
        "/ko/",
        "/about/",
        "/ko/about/",
        "/privacy/",
        "/ko/privacy/",
        "/terms/",
        "/ko/terms/",
        "/license/",
        "/ko/license/",
        "/sitemap/",
        "/ko/sitemap/",
        "/sound-recording/",
        "/ko/sound-recording/",
        "/offline/"
      ],
      crawlLinks: true
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
      vitePluginPwa(),
      // Gzip compression (fallback)
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
        // Only compress files > 1KB
        deleteOriginFile: false
      }),
      // Brotli compression (best compression)
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
        deleteOriginFile: false
      }),
      // Bundle analyzer (only when ANALYZE=true)
      isAnalyze && visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap"
        // treemap, sunburst, network
      })
    ].filter(Boolean),
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      cssMinify: "esbuild",
      rollupOptions: {
        output: {
          // Code splitting for better caching
          // Note: solid-js packages are externalized in SSR, so only include non-SSR dependencies
          manualChunks: (id) => {
            if (!id.includes("node_modules")) return void 0;
            if (id.includes("solid-js") || id.includes("@solidjs")) return void 0;
            if (id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) {
              return "ui-vendor";
            }
            return void 0;
          }
        }
      }
    },
    css: {
      devSourcemap: true
    }
  }
});
export {
  app_config_default as default
};
