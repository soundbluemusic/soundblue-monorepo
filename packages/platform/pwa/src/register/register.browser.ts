// ========================================
// @soundblue/pwa - SW Register (Browser)
// Service worker registration wrapper
// ========================================

import type { SWRegistrationOptions } from '../types';

/**
 * Register service worker
 */
export async function registerSW(
  options: SWRegistrationOptions = {},
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  const swUrl = options.swUrl || '/sw.js';
  const scope = options.scope || '/';

  try {
    const registration = await navigator.serviceWorker.register(swUrl, { scope });

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              options.onUpdateAvailable?.(registration);
            } else {
              // First install
              options.onReady?.(registration);
            }
          }
        });
      }
    });

    // Already ready
    if (registration.active) {
      options.onReady?.(registration);
    }

    return registration;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    options.onError?.(err);
    console.error('Service worker registration failed:', err);
    return null;
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterSW(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
    return true;
  } catch (error: unknown) {
    console.error('Failed to unregister service workers:', error);
    return false;
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting(registration: ServiceWorkerRegistration): void {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
