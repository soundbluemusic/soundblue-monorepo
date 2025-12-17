// ========================================
// Offline Indicator Component
// ========================================
// Shows online/offline status for PWA

import { type Component, createEffect, createSignal, Show } from "solid-js";
import { useOnlineStatus } from "~/hooks/use-online-status";

export const OfflineIndicator: Component = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showOnlineNotification, setShowOnlineNotification] = createSignal(false);

  // Show "back online" notification when coming back online
  createEffect(() => {
    if (isOnline() && wasOffline()) {
      setShowOnlineNotification(true);
      setTimeout(() => setShowOnlineNotification(false), 3000);
    }
  });

  return (
    <>
      {/* Offline Banner */}
      <Show when={!isOnline()}>
        <div
          class="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
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
          <span>오프라인 모드</span>
        </div>
      </Show>

      {/* Back Online Toast */}
      <Show when={showOnlineNotification()}>
        <div
          class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate-pulse"
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
          <span>다시 온라인 상태입니다</span>
        </div>
      </Show>
    </>
  );
};
