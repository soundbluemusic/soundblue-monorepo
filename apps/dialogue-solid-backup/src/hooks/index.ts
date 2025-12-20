/**
 * @fileoverview Hooks barrel export
 */

// Re-export PWA hooks from shared
export {
  checkForUpdates,
  getOnlineStatus,
  getServiceWorkerState,
  type OnlineStatus,
  onOnlineStatusChange,
  onUpdateAvailable,
  type ServiceWorkerState,
  skipWaiting,
  type UseOnlineStatusReturn,
  type UseServiceWorkerReturn,
  useOnlineStatus,
  useServiceWorker,
} from '@soundblue/shared';
