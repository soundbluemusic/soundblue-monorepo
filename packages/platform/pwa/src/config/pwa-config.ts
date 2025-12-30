// ========================================
// @soundblue/pwa - PWA Config
// vite-plugin-pwa config presets
// ========================================

import type { ManifestOptions, VitePWAOptions, WorkboxOptions } from '../types';

/**
 * Default SoundBlue manifest options
 */
export function createDefaultManifest(options: {
  name: string;
  shortName: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
  startUrl?: string;
  lang?: string;
}): ManifestOptions {
  return {
    name: options.name,
    short_name: options.shortName,
    description: options.description,
    theme_color: options.themeColor || '#3b82f6',
    background_color: options.backgroundColor || '#ffffff',
    display: 'standalone',
    orientation: 'any',
    start_url: options.startUrl || '/',
    scope: '/',
    lang: options.lang || 'en',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['music', 'entertainment', 'utilities'],
  };
}

/**
 * Default Workbox options for static sites
 */
export function createDefaultWorkbox(options?: {
  navigateFallback?: string;
  additionalPatterns?: string[];
}): WorkboxOptions {
  return {
    globPatterns: [
      '**/*.{js,css,html,ico,png,svg,woff,woff2}',
      ...(options?.additionalPatterns || []),
    ],
    navigateFallback: options?.navigateFallback || '/offline.html',
    navigateFallbackDenylist: [/^\/api\//],
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
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  };
}

/**
 * Create complete vite-plugin-pwa config
 */
export function createPWAConfig(options: {
  name: string;
  shortName: string;
  description?: string;
  themeColor?: string;
  registerType?: 'autoUpdate' | 'prompt';
  includeAssets?: string[];
}): VitePWAOptions {
  return {
    registerType: options.registerType || 'prompt',
    includeAssets: options.includeAssets || ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: createDefaultManifest({
      name: options.name,
      shortName: options.shortName,
      description: options.description,
      themeColor: options.themeColor,
    }),
    workbox: createDefaultWorkbox(),
  };
}

/**
 * SoundBlue Tools preset
 */
export const TOOLS_PWA_CONFIG: VitePWAOptions = createPWAConfig({
  name: 'Sound Blue Tools',
  shortName: 'SB Tools',
  description: 'Free music tools for everyone',
  themeColor: '#3b82f6',
});

/**
 * SoundBlue Main preset
 */
export const MAIN_PWA_CONFIG: VitePWAOptions = createPWAConfig({
  name: 'Sound Blue',
  shortName: 'SoundBlue',
  description: 'Official website for SoundBlue',
  themeColor: '#3b82f6',
});

/**
 * Dialogue preset
 */
export const DIALOGUE_PWA_CONFIG: VitePWAOptions = createPWAConfig({
  name: 'Dialogue',
  shortName: 'Dialogue',
  description: 'Offline Q&A learning tool',
  themeColor: '#10b981',
});
