/**
 * @fileoverview Hooks barrel export
 */

// Re-export PWA hooks from shared
export {
  useOnlineStatus,
  useServiceWorker,
  skipWaiting,
  checkForUpdates,
  onUpdateAvailable,
  getServiceWorkerState,
  onOnlineStatusChange,
  getOnlineStatus,
  type OnlineStatus,
  type UseOnlineStatusReturn,
  type ServiceWorkerState,
  type UseServiceWorkerReturn,
} from '@soundblue/shared';
