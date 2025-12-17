// ========================================
// Online Status Hook
// ========================================
// Tracks online/offline status for PWA functionality

import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

export interface OnlineStatus {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Whether the app was ever offline during this session */
  wasOffline: boolean;
  /** Timestamp of last online status change */
  lastChanged: number | null;
}

/** Return type for useOnlineStatus hook */
export interface UseOnlineStatusReturn {
  isOnline: Accessor<boolean>;
  wasOffline: Accessor<boolean>;
  lastChanged: Accessor<number | null>;
  onStatusChange: (listener: OnlineStatusListener) => () => void;
}

// Global signals for online status
const [isOnline, setIsOnline] = createSignal(true);
const [wasOffline, setWasOffline] = createSignal(false);
const [lastChanged, setLastChanged] = createSignal<number | null>(null);

// Listeners for status changes
type OnlineStatusListener = (online: boolean) => void;
const listeners = new Set<OnlineStatusListener>();

let initialized = false;

/**
 * Initialize online status tracking (called once)
 */
function initOnlineStatus(): (() => void) | undefined {
  if (isServer || initialized) return undefined;

  initialized = true;

  // Set initial state
  setIsOnline(navigator.onLine);

  const handleOnline = (): void => {
    setIsOnline(true);
    setLastChanged(Date.now());
    notifyListeners(true);
  };

  const handleOffline = (): void => {
    setIsOnline(false);
    setWasOffline(true);
    setLastChanged(Date.now());
    notifyListeners(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    initialized = false;
  };
}

/**
 * Notify all listeners of status change
 */
function notifyListeners(online: boolean): void {
  listeners.forEach((listener) => listener(online));
}

/**
 * Subscribe to online status changes
 */
export function onOnlineStatusChange(listener: OnlineStatusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Hook for tracking online/offline status
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  onMount(() => {
    const cleanup = initOnlineStatus();
    if (cleanup) {
      onCleanup(cleanup);
    }
  });

  return {
    isOnline,
    wasOffline,
    lastChanged,
    onStatusChange: onOnlineStatusChange,
  };
}

/**
 * Get current online status (non-reactive)
 */
export function getOnlineStatus(): OnlineStatus {
  return {
    isOnline: isOnline(),
    wasOffline: wasOffline(),
    lastChanged: lastChanged(),
  };
}
