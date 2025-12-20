/**
 * @fileoverview Service Worker Hook for React
 *
 * Manages service worker registration and updates for PWA
 *
 * @module @soundblue/shared-react/hooks/use-service-worker
 */

import { useCallback, useSyncExternalStore } from 'react';

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

// Global state
let state: ServiceWorkerState = {
  isSupported: false,
  isRegistered: false,
  updateAvailable: false,
  isControlled: false,
  registration: null,
};

// Listeners for update events
type UpdateListener = () => void;
const updateListeners = new Set<UpdateListener>();
const subscribers = new Set<() => void>();

let initialized = false;

/**
 * Update state and notify subscribers
 */
function setState(updater: (prev: ServiceWorkerState) => ServiceWorkerState): void {
  state = updater(state);
  for (const subscriber of subscribers) {
    subscriber();
  }
}

/**
 * Notify listeners of available update
 */
function notifyUpdateListeners(): void {
  for (const listener of updateListeners) {
    listener();
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<void> {
  if (!state.registration) return;

  try {
    await state.registration.update();
  } catch {
    // Update check failed silently
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting(): void {
  if (!state.registration?.waiting) return;

  state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
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
 * Initialize service worker tracking
 */
async function initServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || initialized) return;

  initialized = true;

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
}

/**
 * Subscribe function for useSyncExternalStore
 */
function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  initServiceWorker();
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Get snapshot for useSyncExternalStore
 */
function getSnapshot(): ServiceWorkerState {
  return state;
}

/**
 * Get server snapshot for useSyncExternalStore (SSG/SSR)
 */
function getServerSnapshot(): ServiceWorkerState {
  return {
    isSupported: false,
    isRegistered: false,
    updateAvailable: false,
    isControlled: false,
    registration: null,
  };
}

/** Return type for useServiceWorker hook */
export interface UseServiceWorkerReturn {
  state: ServiceWorkerState;
  checkForUpdates: () => Promise<void>;
  skipWaiting: () => void;
  onUpdateAvailable: (listener: UpdateListener) => () => void;
}

/**
 * Hook for service worker management
 *
 * @example
 * ```tsx
 * function UpdatePrompt() {
 *   const { state, skipWaiting, onUpdateAvailable } = useServiceWorker();
 *   const [showPrompt, setShowPrompt] = useState(false);
 *
 *   useEffect(() => {
 *     return onUpdateAvailable(() => setShowPrompt(true));
 *   }, [onUpdateAvailable]);
 *
 *   if (!showPrompt) return null;
 *
 *   return (
 *     <div>
 *       <p>A new version is available!</p>
 *       <button onClick={skipWaiting}>Update now</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const swState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleCheckForUpdates = useCallback(() => checkForUpdates(), []);
  const handleSkipWaiting = useCallback(() => skipWaiting(), []);
  const handleOnUpdateAvailable = useCallback(
    (listener: UpdateListener) => onUpdateAvailable(listener),
    [],
  );

  return {
    state: swState,
    checkForUpdates: handleCheckForUpdates,
    skipWaiting: handleSkipWaiting,
    onUpdateAvailable: handleOnUpdateAvailable,
  };
}

/**
 * Get current service worker state (non-reactive)
 */
export function getServiceWorkerState(): ServiceWorkerState {
  return state;
}
