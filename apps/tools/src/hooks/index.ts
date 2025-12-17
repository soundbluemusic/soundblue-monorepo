// ========================================
// Custom Hooks - Exports
// ========================================

// Engine hooks
export { useMIDI } from '~/engine/midi';
export { useAutoSave, useProjectStorage } from '~/engine/storage';

// Audio hooks
export { type UseAudioContextReturn, useAudioContext } from './use-audio-context';

// Event Bus hooks
export {
  useEventBus,
  useEventBusChannel,
  useEventEmitter,
} from './use-event-bus';

// Keyboard shortcuts hooks
export {
  DEFAULT_SHORTCUTS,
  registerShortcut,
  type ShortcutDefinition,
  toggleShortcutsHelp,
  useKeyboardShortcuts,
  useShortcut,
} from './use-keyboard-shortcuts';

// PWA / Online status hooks (re-exported from shared)
export {
  useOnlineStatus,
  getOnlineStatus,
  onOnlineStatusChange,
  type OnlineStatus,
  type UseOnlineStatusReturn,
  useServiceWorker,
  checkForUpdates,
  skipWaiting,
  onUpdateAvailable,
  getServiceWorkerState,
  type ServiceWorkerState,
  type UseServiceWorkerReturn,
} from '@soundblue/shared';

// Tempo synchronization hooks
export {
  type UseTempoReturn,
  type UseTempoSubscriberReturn,
  useTempo,
  useTempoSubscriber,
} from './use-tempo';
