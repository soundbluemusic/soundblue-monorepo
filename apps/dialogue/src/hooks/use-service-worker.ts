// ========================================
// Service Worker Hook
// ========================================
// Manages service worker registration and updates for PWA

import { createSignal, onMount } from "solid-js";
import { isServer } from "solid-js/web";

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  isControlled: boolean;
  registration: ServiceWorkerRegistration | null;
}

const [state, setState] = createSignal<ServiceWorkerState>({
  isSupported: false,
  isRegistered: false,
  updateAvailable: false,
  isControlled: false,
  registration: null,
});

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting(): void {
  const currentState = state();
  if (!currentState.registration?.waiting) return;

  currentState.registration.waiting.postMessage({ type: "SKIP_WAITING" });
}

export interface UseServiceWorkerReturn {
  state: typeof state;
  skipWaiting: typeof skipWaiting;
}

/**
 * Hook for service worker management
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  onMount(async () => {
    if (isServer) return;
    if (!("serviceWorker" in navigator)) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSupported: true,
      isControlled: !!navigator.serviceWorker.controller,
    }));

    try {
      const registration = await navigator.serviceWorker.ready;

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setState((prev) => ({ ...prev, updateAvailable: true }));
          }
        });
      });

      // Listen for controller change (update activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } catch {
      // Service worker registration failed silently
    }
  });

  return {
    state,
    skipWaiting,
  };
}
