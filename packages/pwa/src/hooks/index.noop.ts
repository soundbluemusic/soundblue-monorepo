// ========================================
// @soundblue/pwa - Hooks (Noop)
// For SSR/build time
// ========================================

import type { PWAInstallState, PWAUpdateState } from '../types';

/**
 * usePWA hook return type
 */
export interface UsePWAResult {
  install: PWAInstallState;
  update: PWAUpdateState;
  promptInstall: () => Promise<boolean>;
  applyUpdate: () => void;
  checkForUpdates: () => Promise<void>;
}

/**
 * Noop usePWA hook for SSR
 */
export function usePWA(): UsePWAResult {
  return {
    install: {
      canInstall: false,
      isInstalled: false,
      deferredPrompt: null,
    },
    update: {
      updateAvailable: false,
      isChecking: false,
      waitingWorker: null,
    },
    promptInstall: async () => false,
    applyUpdate: () => {},
    checkForUpdates: async () => {},
  };
}
