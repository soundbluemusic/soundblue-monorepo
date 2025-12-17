// ========================================
// Offline Indicator Component
// ========================================
// Shows online/offline status and PWA update notifications

import { type Component, createEffect, createSignal, type JSX, Show } from 'solid-js';
import { useOnlineStatus, useServiceWorker, skipWaiting } from '~/hooks';

export const OfflineIndicator: Component = (): JSX.Element => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { state: swState } = useServiceWorker();

  const [showOnlineNotification, setShowOnlineNotification] = createSignal(false);
  const [showUpdateBanner, setShowUpdateBanner] = createSignal(false);
  const [dismissed, setDismissed] = createSignal(false);

  // Show "back online" notification when coming back online
  createEffect(() => {
    if (isOnline() && wasOffline()) {
      setShowOnlineNotification(true);
      setTimeout(() => setShowOnlineNotification(false), 3000);
    }
  });

  // Show update banner when update is available
  createEffect(() => {
    if (swState().updateAvailable && !dismissed()) {
      setShowUpdateBanner(true);
    }
  });

  const handleUpdate = (): void => {
    skipWaiting();
  };

  const handleDismiss = (): void => {
    setShowUpdateBanner(false);
    setDismissed(true);
  };

  return (
    <>
      {/* Offline Banner */}
      <Show when={!isOnline()}>
        <div
          class="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top duration-300"
          role="alert"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656m-7.072 7.072a9 9 0 010-12.728m3.536 3.536a4 4 0 010 5.656"
            />
            <path stroke-linecap="round" stroke-width="2" d="M6 18L18 6" />
          </svg>
          <span>You are offline</span>
        </div>
      </Show>

      {/* Back Online Toast */}
      <Show when={showOnlineNotification()}>
        <div
          class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate-in slide-in-from-right duration-300"
          role="status"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
          <span>Back online</span>
        </div>
      </Show>

      {/* Update Available Banner */}
      <Show when={showUpdateBanner()}>
        <div
          class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md bg-stone-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
          role="alert"
        >
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span class="text-sm font-medium">Update available</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              class="px-3 py-1 rounded-md text-sm font-medium bg-white text-stone-800 hover:bg-stone-100 transition-colors"
            >
              Update now
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              class="p-1 rounded hover:bg-stone-700 transition-colors"
              aria-label="Dismiss"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Show>
    </>
  );
};
