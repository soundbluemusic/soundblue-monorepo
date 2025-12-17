// ========================================
// Online Status Hook
// ========================================
// Tracks online/offline status for PWA functionality

import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

export interface UseOnlineStatusReturn {
  isOnline: Accessor<boolean>;
  wasOffline: Accessor<boolean>;
  lastChanged: Accessor<number | null>;
}

// Global signals for online status
const [isOnline, setIsOnline] = createSignal(true);
const [wasOffline, setWasOffline] = createSignal(false);
const [lastChanged, setLastChanged] = createSignal<number | null>(null);

/**
 * Hook for tracking online/offline status
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  onMount(() => {
    if (isServer) return;

    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = (): void => {
      setIsOnline(true);
      setLastChanged(Date.now());
    };

    const handleOffline = (): void => {
      setIsOnline(false);
      setWasOffline(true);
      setLastChanged(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    onCleanup(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  });

  return {
    isOnline,
    wasOffline,
    lastChanged,
  };
}
