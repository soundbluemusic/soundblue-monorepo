/**
 * @soundblue/pwa - usePWA Hook Tests
 * Tests for PWA install and update hook
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePWA } from '../src/hooks/usePWA';

describe('@soundblue/pwa usePWA', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockServiceWorker: {
    ready: Promise<ServiceWorkerRegistration>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    controller: ServiceWorker | null;
  };
  let mockRegistration: Partial<ServiceWorkerRegistration>;

  beforeEach(() => {
    mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };

    mockServiceWorker = {
      ready: Promise.resolve(mockRegistration as ServiceWorkerRegistration),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      controller: null,
    };

    vi.stubGlobal('window', {
      matchMedia: mockMatchMedia,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: { reload: vi.fn() },
    });

    vi.stubGlobal('navigator', {
      standalone: false,
      serviceWorker: mockServiceWorker,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have initial install state', () => {
      const { result } = renderHook(() => usePWA());

      expect(result.current.install.canInstall).toBe(false);
      expect(result.current.install.isInstalled).toBe(false);
      expect(result.current.install.deferredPrompt).toBe(null);
    });

    it('should have initial update state', () => {
      const { result } = renderHook(() => usePWA());

      expect(result.current.update.updateAvailable).toBe(false);
      expect(result.current.update.isChecking).toBe(false);
      expect(result.current.update.waitingWorker).toBe(null);
    });
  });

  describe('installed detection', () => {
    it('should detect standalone mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => usePWA());

      expect(result.current.install.isInstalled).toBe(true);
    });

    it('should detect iOS standalone mode', () => {
      vi.stubGlobal('navigator', {
        standalone: true,
        serviceWorker: mockServiceWorker,
      });

      const { result } = renderHook(() => usePWA());

      expect(result.current.install.isInstalled).toBe(true);
    });
  });

  describe('beforeinstallprompt event', () => {
    it('should set canInstall when beforeinstallprompt fires', async () => {
      let beforeInstallHandler: ((e: Event) => void) | undefined;
      const mockAddEventListener = vi.fn((event: string, handler: (e: Event) => void) => {
        if (event === 'beforeinstallprompt') {
          beforeInstallHandler = handler;
        }
      });

      vi.stubGlobal('window', {
        matchMedia: mockMatchMedia,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
        location: { reload: vi.fn() },
      });

      const { result } = renderHook(() => usePWA());

      expect(result.current.install.canInstall).toBe(false);

      // Simulate beforeinstallprompt event
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      await act(async () => {
        beforeInstallHandler?.(mockEvent as unknown as Event);
      });

      expect(result.current.install.canInstall).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('promptInstall', () => {
    it('should return false when no deferred prompt', async () => {
      const { result } = renderHook(() => usePWA());

      const accepted = await result.current.promptInstall();

      expect(accepted).toBe(false);
    });
  });

  describe('applyUpdate', () => {
    it('should not throw when no waiting worker', () => {
      const { result } = renderHook(() => usePWA());

      expect(() => result.current.applyUpdate()).not.toThrow();
    });
  });

  describe('checkForUpdates', () => {
    it('should set isChecking during update check', async () => {
      const { result } = renderHook(() => usePWA());

      await act(async () => {
        await result.current.checkForUpdates();
      });

      expect(result.current.update.isChecking).toBe(false);
    });

    it('should handle missing serviceWorker', async () => {
      vi.stubGlobal('navigator', {});

      const { result } = renderHook(() => usePWA());

      await expect(result.current.checkForUpdates()).resolves.toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const mockRemoveEventListener = vi.fn();
      vi.stubGlobal('window', {
        matchMedia: mockMatchMedia,
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
        location: { reload: vi.fn() },
      });

      const { unmount } = renderHook(() => usePWA());
      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });
});
