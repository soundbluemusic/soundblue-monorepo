// ========================================
// Service Worker Hook
// ========================================
// Manages service worker registration and updates for PWA

import { createSignal, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

export interface ServiceWorkerState {
  /** Whether service worker is supported */
  isSupported: boolean;
  /** Whether service worker is registered */
  isRegistered: boolean;
  /** Whether an update is available */
  updateAvailable: boolean;
  /** Whether the app is being controlled by a service worker */
  isControlled: boolean;
  /** Registration object */
  registration: ServiceWorkerRegistration | null;
}

const [state, setState] = createSignal<ServiceWorkerState>({
  isSupported: false,
  isRegistered: false,
  updateAvailable: false,
  isControlled: false,
  registration: null,
});

// Listeners for update events
type UpdateListener = () => void;
const updateListeners = new Set<UpdateListener>();

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<void> {
  const currentState = state();
  if (!currentState.registration) return;

  try {
    await currentState.registration.update();
  } catch {
    // Update check failed silently
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting(): void {
  const currentState = state();
  if (!currentState.registration?.waiting) return;

  currentState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Subscribe to update available events
 */
export function onUpdateAvailable(listener: UpdateListener): () => void {
  updateListeners.add(listener);
  return () => {
    updateListeners.delete(listener);
  };
}

/**
 * Notify listeners of available update
 */
function notifyUpdateListeners(): void {
  updateListeners.forEach((listener) => listener());
}

/** Return type for useServiceWorker hook */
export interface UseServiceWorkerReturn {
  state: typeof state;
  checkForUpdates: typeof checkForUpdates;
  skipWaiting: typeof skipWaiting;
  onUpdateAvailable: typeof onUpdateAvailable;
}

/**
 * Hook for service worker management
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  onMount(async () => {
    if (isServer) return;
    if (!('serviceWorker' in navigator)) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSupported: true,
      isControlled: !!navigator.serviceWorker.controller,
    }));

    try {
      // Listen for registration from vite-plugin-pwa
      const registration = await navigator.serviceWorker.ready;

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            setState((prev) => ({ ...prev, updateAvailable: true }));
            notifyUpdateListeners();
          }
        });
      });

      // Listen for controller change (update activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload to get the new version
        window.location.reload();
      });
    } catch {
      // Service worker registration failed silently
    }
  });

  return {
    state,
    checkForUpdates,
    skipWaiting,
    onUpdateAvailable,
  };
}
