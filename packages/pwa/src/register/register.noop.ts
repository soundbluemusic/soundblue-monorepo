// ========================================
// @soundblue/pwa - SW Register (Noop)
// For SSR/build time
// ========================================

import type { SWRegistrationOptions } from '../types';

/**
 * Noop register service worker
 */
export async function registerSW(
  _options: SWRegistrationOptions = {},
): Promise<ServiceWorkerRegistration | null> {
  return null;
}

/**
 * Noop unregister service workers
 */
export async function unregisterSW(): Promise<boolean> {
  return false;
}

/**
 * Noop skip waiting
 */
export function skipWaiting(_registration: ServiceWorkerRegistration): void {
  // noop
}
