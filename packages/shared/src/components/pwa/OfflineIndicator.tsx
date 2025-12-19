// ========================================
// Offline Indicator Component
// ========================================
// Shows online/offline status and PWA update notifications
// Shared component for all apps in the monorepo

import { RefreshCw, Wifi, WifiOff, X } from 'lucide-solid';
import { type Component, createEffect, createSignal, Show } from 'solid-js';
import { skipWaiting, useOnlineStatus, useServiceWorker } from '../../hooks';
import { getLocaleFromPath, type Locale } from '../../providers/I18nProvider';
import { cn } from '../../utils/cn';

export const OfflineIndicator: Component = () => {
  // URL에서 직접 locale 감지 (Context 의존성 제거 - 빌드 시 Context 인스턴스 분리 문제 방지)
  const locale = (): Locale => {
    if (typeof window === 'undefined') return 'en';
    return getLocaleFromPath(window.location.pathname);
  };
  const { isOnline, wasOffline } = useOnlineStatus();
  const { state: swState } = useServiceWorker();

  const [showOnlineNotification, setShowOnlineNotification] = createSignal(false);
  const [showUpdateBanner, setShowUpdateBanner] = createSignal(false);
  const [dismissed, setDismissed] = createSignal(false);

  // Show "back online" notification when coming back online
  createEffect(() => {
    if (isOnline() && wasOffline()) {
      setShowOnlineNotification(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowOnlineNotification(false), 3000);
    }
  });

  // Show update banner when update is available
  createEffect(() => {
    if (swState().updateAvailable && !dismissed()) {
      setShowUpdateBanner(true);
    }
  });

  const handleUpdate = () => {
    skipWaiting();
  };

  const handleDismiss = () => {
    setShowUpdateBanner(false);
    setDismissed(true);
  };

  const t = {
    offline: {
      ko: '오프라인 상태입니다',
      en: 'You are offline',
    },
    online: {
      ko: '다시 온라인 상태입니다',
      en: 'Back online',
    },
    updateAvailable: {
      ko: '새 버전이 있습니다',
      en: 'Update available',
    },
    updateNow: {
      ko: '지금 업데이트',
      en: 'Update now',
    },
  };

  return (
    <>
      {/* Offline Banner - Fixed at top */}
      <Show when={!isOnline()}>
        <div
          class={cn(
            'fixed top-0 left-0 right-0 z-50',
            'bg-yellow-500 text-yellow-950',
            'px-4 py-2 flex items-center justify-center gap-2',
            'text-sm font-medium',
            'animate-in slide-in-from-top duration-300',
          )}
          role="alert"
        >
          <WifiOff class="h-4 w-4" />
          <span>{t.offline[locale()]}</span>
        </div>
      </Show>

      {/* Back Online Toast */}
      <Show when={showOnlineNotification()}>
        <output
          class={cn(
            'fixed top-4 right-4 z-50',
            'bg-green-500 text-white',
            'px-4 py-2 rounded-lg shadow-lg',
            'flex items-center gap-2',
            'text-sm font-medium',
            'animate-in slide-in-from-right duration-300',
          )}
        >
          <Wifi class="h-4 w-4" />
          <span>{t.online[locale()]}</span>
        </output>
      </Show>

      {/* Update Available Banner */}
      <Show when={showUpdateBanner()}>
        <div
          class={cn(
            'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md',
            'bg-primary text-primary-foreground',
            'px-4 py-3 rounded-xl shadow-lg',
            'flex items-center justify-between gap-3',
            'animate-in slide-in-from-bottom duration-300',
          )}
          role="alert"
        >
          <div class="flex items-center gap-2">
            <RefreshCw class="h-4 w-4" />
            <span class="text-sm font-medium">{t.updateAvailable[locale()]}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              class={cn(
                'px-3 py-1 rounded-md text-sm font-medium',
                'bg-primary-foreground text-primary',
                'hover:bg-primary-foreground/90 transition-colors',
              )}
            >
              {t.updateNow[locale()]}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              class="p-1 rounded hover:bg-primary-foreground/20 transition-colors"
              aria-label="Dismiss"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </Show>
    </>
  );
};
