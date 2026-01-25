// ========================================
// @soundblue/pwa - usePWA Hook
// React hook for PWA install and update
// ========================================

import { useCallback, useEffect, useState } from 'react';
import type {
  BeforeInstallPromptEvent,
  NavigatorWithStandalone,
  PWAInstallState,
  PWAUpdateState,
} from '../types';

/**
 * usePWA hook return type
 */
export interface UsePWAResult {
  /** Install state */
  install: PWAInstallState;
  /** Update state */
  update: PWAUpdateState;
  /** Prompt user to install */
  promptInstall: () => Promise<boolean>;
  /** Apply waiting update */
  applyUpdate: () => void;
  /** Check for updates */
  checkForUpdates: () => Promise<void>;
}

/**
 * React hook for PWA install and update functionality
 */
export function usePWA(): UsePWAResult {
  const [installState, setInstallState] = useState<PWAInstallState>({
    canInstall: false,
    isInstalled: false,
    deferredPrompt: null,
  });

  const [updateState, setUpdateState] = useState<PWAUpdateState>({
    updateAvailable: false,
    isChecking: false,
    waitingWorker: null,
  });

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallState((prev) => ({
        ...prev,
        canInstall: true,
        deferredPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    // Check if already installed
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as NavigatorWithStandalone).standalone === true;

      setInstallState((prev) => ({
        ...prev,
        isInstalled: isStandalone,
      }));
    };

    const handleAppInstalled = () => {
      setInstallState((prev) => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        deferredPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    checkInstalled();

    // 성능: 메모리 누수 방지를 위한 모든 리스너 cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for service worker updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // New service worker has taken over
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for existing waiting worker
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setUpdateState((prev) => ({
          ...prev,
          updateAvailable: true,
          waitingWorker: registration.waiting,
        }));
      }

      // Listen for new waiting workers
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateState((prev) => ({
                ...prev,
                updateAvailable: true,
                waitingWorker: registration.waiting,
              }));
            }
          });
        }
      });
    });

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Prompt install
  const promptInstall = useCallback(async (): Promise<boolean> => {
    const { deferredPrompt } = installState;
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setInstallState((prev) => ({
      ...prev,
      deferredPrompt: null,
      canInstall: false,
    }));

    return outcome === 'accepted';
  }, [installState]);

  // Apply update
  const applyUpdate = useCallback(() => {
    const { waitingWorker } = updateState;
    if (!waitingWorker) return;

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }, [updateState]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    setUpdateState((prev) => ({ ...prev, isChecking: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } finally {
      setUpdateState((prev) => ({ ...prev, isChecking: false }));
    }
  }, []);

  return {
    install: installState,
    update: updateState,
    promptInstall,
    applyUpdate,
    checkForUpdates,
  };
}
