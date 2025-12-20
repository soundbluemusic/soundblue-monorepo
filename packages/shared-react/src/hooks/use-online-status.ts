/**
 * @fileoverview Online Status Hook for React
 *
 * Tracks online/offline status for PWA functionality
 *
 * @module @soundblue/shared-react/hooks/use-online-status
 */

import { useCallback, useSyncExternalStore } from 'react';

export interface OnlineStatus {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Whether the app was ever offline during this session */
  wasOffline: boolean;
  /** Timestamp of last online status change */
  lastChanged: number | null;
}

// Global state for online status
let isOnline = true;
let wasOffline = false;
let lastChanged: number | null = null;

// Listeners for status changes
type OnlineStatusListener = (online: boolean) => void;
const listeners = new Set<OnlineStatusListener>();
const subscribers = new Set<() => void>();

let initialized = false;

/**
 * Notify all subscribers of state change (for useSyncExternalStore)
 */
function notifySubscribers(): void {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

/**
 * Notify all listeners of status change
 */
function notifyListeners(online: boolean): void {
  for (const listener of listeners) {
    listener(online);
  }
}

/**
 * Initialize online status tracking (called once)
 */
function initOnlineStatus(): void {
  if (typeof window === 'undefined' || initialized) return;

  initialized = true;

  // Set initial state
  isOnline = navigator.onLine;

  const handleOnline = (): void => {
    isOnline = true;
    lastChanged = Date.now();
    notifySubscribers();
    notifyListeners(true);
  };

  const handleOffline = (): void => {
    isOnline = false;
    wasOffline = true;
    lastChanged = Date.now();
    notifySubscribers();
    notifyListeners(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
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
 * Subscribe function for useSyncExternalStore
 */
function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  initOnlineStatus();
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Get snapshot for useSyncExternalStore
 */
function getSnapshot(): OnlineStatus {
  return {
    isOnline,
    wasOffline,
    lastChanged,
  };
}

/**
 * Get server snapshot for useSyncExternalStore (SSG/SSR)
 */
function getServerSnapshot(): OnlineStatus {
  return {
    isOnline: true,
    wasOffline: false,
    lastChanged: null,
  };
}

/** Return type for useOnlineStatus hook */
export interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  lastChanged: number | null;
  onStatusChange: (listener: OnlineStatusListener) => () => void;
}

/**
 * Hook for tracking online/offline status
 *
 * @example
 * ```tsx
 * function OfflineIndicator() {
 *   const { isOnline, wasOffline } = useOnlineStatus();
 *
 *   if (isOnline && !wasOffline) return null;
 *
 *   return (
 *     <div className={isOnline ? 'bg-green-500' : 'bg-red-500'}>
 *       {isOnline ? 'Back online!' : 'You are offline'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const onStatusChange = useCallback((listener: OnlineStatusListener) => {
    return onOnlineStatusChange(listener);
  }, []);

  return {
    isOnline: status.isOnline,
    wasOffline: status.wasOffline,
    lastChanged: status.lastChanged,
    onStatusChange,
  };
}

/**
 * Get current online status (non-reactive)
 */
export function getOnlineStatus(): OnlineStatus {
  return getSnapshot();
}
