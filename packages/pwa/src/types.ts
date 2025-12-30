// ========================================
// @soundblue/pwa - Types
// PWA type definitions
// ========================================

/**
 * PWA install state
 */
export interface PWAInstallState {
  /** Whether the app can be installed */
  canInstall: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** The deferred install prompt */
  deferredPrompt: BeforeInstallPromptEvent | null;
}

/**
 * BeforeInstallPromptEvent - not in standard typings
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * PWA update state
 */
export interface PWAUpdateState {
  /** Whether an update is available */
  updateAvailable: boolean;
  /** Whether currently checking for updates */
  isChecking: boolean;
  /** The waiting service worker */
  waitingWorker: ServiceWorker | null;
}

/**
 * SW registration options
 */
export interface SWRegistrationOptions {
  /** Path to service worker */
  swUrl?: string;
  /** Scope of service worker */
  scope?: string;
  /** Callback when update is available */
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when SW is ready */
  onReady?: (registration: ServiceWorkerRegistration) => void;
  /** Callback on registration error */
  onError?: (error: Error) => void;
}

/**
 * vite-plugin-pwa config options (partial)
 */
export interface VitePWAOptions {
  registerType?: 'autoUpdate' | 'prompt';
  includeAssets?: string[];
  manifest?: ManifestOptions;
  workbox?: WorkboxOptions;
}

/**
 * Web App Manifest options
 */
export interface ManifestOptions {
  name: string;
  short_name: string;
  description?: string;
  theme_color?: string;
  background_color?: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'portrait' | 'landscape' | 'any';
  start_url?: string;
  scope?: string;
  icons?: ManifestIcon[];
  screenshots?: ManifestScreenshot[];
  categories?: string[];
  lang?: string;
}

/**
 * Manifest icon
 */
export interface ManifestIcon {
  src: string;
  sizes: string;
  type?: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

/**
 * Manifest screenshot
 */
export interface ManifestScreenshot {
  src: string;
  sizes: string;
  type?: string;
  form_factor?: 'narrow' | 'wide';
  label?: string;
}

/**
 * Workbox options (partial)
 */
export interface WorkboxOptions {
  globPatterns?: string[];
  navigateFallback?: string;
  navigateFallbackDenylist?: RegExp[];
  runtimeCaching?: RuntimeCacheEntry[];
}

/**
 * Runtime cache entry
 */
export interface RuntimeCacheEntry {
  urlPattern: RegExp | string;
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
  options?: {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
  };
}
