// PWA Hooks
export {
  useOnlineStatus,
  onOnlineStatusChange,
  getOnlineStatus,
  type OnlineStatus,
  type UseOnlineStatusReturn,
} from './use-online-status';

export {
  useServiceWorker,
  checkForUpdates,
  skipWaiting,
  onUpdateAvailable,
  getServiceWorkerState,
  type ServiceWorkerState,
  type UseServiceWorkerReturn,
} from './use-service-worker';
