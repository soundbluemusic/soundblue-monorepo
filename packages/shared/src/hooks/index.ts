// PWA Hooks
export {
  getOnlineStatus,
  type OnlineStatus,
  onOnlineStatusChange,
  type UseOnlineStatusReturn,
  useOnlineStatus,
} from './use-online-status';

export {
  checkForUpdates,
  getServiceWorkerState,
  onUpdateAvailable,
  type ServiceWorkerState,
  skipWaiting,
  type UseServiceWorkerReturn,
  useServiceWorker,
} from './use-service-worker';
