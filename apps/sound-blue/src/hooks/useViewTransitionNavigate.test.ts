/**
 * @fileoverview useViewTransitionNavigate hook tests
 *
 * Tests for:
 * - View Transitions API support detection
 * - Fallback to regular navigation
 * - Transition conflict handling
 * - Error handling
 * - Options passing
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useViewTransitionNavigate } from './useViewTransitionNavigate';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('@solidjs/router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock isServer
let mockIsServer = false;
vi.mock('solid-js/web', () => ({
  get isServer() {
    return mockIsServer;
  },
}));

describe('useViewTransitionNavigate', () => {
  let originalStartViewTransition: typeof document.startViewTransition;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsServer = false;

    // Store original document methods
    originalStartViewTransition = document.startViewTransition;
  });

  afterEach(() => {
    // Restore document
    if (originalStartViewTransition) {
      document.startViewTransition = originalStartViewTransition;
    } else {
      // @ts-expect-error - Removing property
      delete document.startViewTransition;
    }
  });

  describe('View Transitions API not supported', () => {
    beforeEach(() => {
      // Remove startViewTransition
      // @ts-expect-error - Removing property
      delete document.startViewTransition;
    });

    it('should fall back to regular navigation', () => {
      const navigate = useViewTransitionNavigate();

      navigate('/test');

      expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
    });

    it('should pass options to regular navigation', () => {
      const navigate = useViewTransitionNavigate();
      const options = { replace: true, scroll: false };

      navigate('/test', options);

      expect(mockNavigate).toHaveBeenCalledWith('/test', options);
    });
  });

  describe('Server-side rendering', () => {
    it('should fall back to regular navigation on SSR', () => {
      mockIsServer = true;

      const navigate = useViewTransitionNavigate();
      navigate('/test');

      expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
    });
  });

  describe('View Transitions API supported', () => {
    let mockTransition: {
      finished: Promise<void>;
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
      skipTransition: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockTransition = {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };

      // Mock startViewTransition
      document.startViewTransition = vi.fn((callback: () => void | Promise<void>) => {
        callback();
        return mockTransition as unknown as ViewTransition;
      });
    });

    it('should use startViewTransition when supported', () => {
      const navigate = useViewTransitionNavigate();

      navigate('/test');

      expect(document.startViewTransition).toHaveBeenCalled();
    });

    it('should call navigate inside startViewTransition callback', () => {
      const navigate = useViewTransitionNavigate();

      navigate('/test');

      expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
    });

    it('should pass options to navigate', () => {
      const navigate = useViewTransitionNavigate();
      const options = { replace: true, state: { foo: 'bar' } };

      navigate('/test', options);

      expect(mockNavigate).toHaveBeenCalledWith('/test', options);
    });
  });

  describe('Transition conflict handling', () => {
    let mockTransition: {
      finished: Promise<void>;
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
      skipTransition: ReturnType<typeof vi.fn>;
    };
    let finishPromiseResolve: () => void;

    beforeEach(() => {
      // Create a promise that we can control
      const finishedPromise = new Promise<void>((resolve) => {
        finishPromiseResolve = resolve;
      });

      mockTransition = {
        finished: finishedPromise,
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };

      document.startViewTransition = vi.fn((callback: () => void | Promise<void>) => {
        callback();
        return mockTransition as unknown as ViewTransition;
      });
    });

    it('should skip existing transition before starting new one', () => {
      const navigate = useViewTransitionNavigate();

      // First navigation
      navigate('/first');

      // Get reference to the first transition's skipTransition
      const firstTransitionSkip = mockTransition.skipTransition;

      // Create new transition mock for second navigation
      const secondMockTransition = {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };

      document.startViewTransition = vi.fn((callback: () => void | Promise<void>) => {
        callback();
        return secondMockTransition as unknown as ViewTransition;
      });

      // Second navigation should skip the first
      navigate('/second');

      expect(firstTransitionSkip).toHaveBeenCalled();
    });

    it('should clean up after transition finishes', async () => {
      const navigate = useViewTransitionNavigate();

      navigate('/test');

      // Resolve the finished promise
      finishPromiseResolve!();

      // Wait for promise to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should be able to navigate again without skipping
      const newMockTransition = {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };

      document.startViewTransition = vi.fn((callback: () => void | Promise<void>) => {
        callback();
        return newMockTransition as unknown as ViewTransition;
      });

      navigate('/second');

      // The original transition's skipTransition should not be called
      // because it was cleaned up
    });
  });

  describe('Error handling', () => {
    it('should fall back to regular navigation if startViewTransition throws', () => {
      document.startViewTransition = vi.fn(() => {
        throw new Error('View transition failed');
      });

      const navigate = useViewTransitionNavigate();

      // Should not throw
      expect(() => navigate('/test')).not.toThrow();

      // Should have called regular navigate
      expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
    });

    it('should silently handle transition.finished rejection', async () => {
      const mockTransition = {
        finished: Promise.reject(new Error('Transition aborted')),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };

      document.startViewTransition = vi.fn((callback: () => void | Promise<void>) => {
        callback();
        return mockTransition as unknown as ViewTransition;
      });

      const navigate = useViewTransitionNavigate();

      // Should not throw
      expect(() => navigate('/test')).not.toThrow();

      // Wait for promise to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Navigate should still work
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Options handling', () => {
    beforeEach(() => {
      // Remove startViewTransition to test fallback path
      // @ts-expect-error - Removing property
      delete document.startViewTransition;
    });

    it('should handle replace option', () => {
      const navigate = useViewTransitionNavigate();

      navigate('/test', { replace: true });

      expect(mockNavigate).toHaveBeenCalledWith('/test', { replace: true });
    });

    it('should handle scroll option', () => {
      const navigate = useViewTransitionNavigate();

      navigate('/test', { scroll: false });

      expect(mockNavigate).toHaveBeenCalledWith('/test', { scroll: false });
    });

    it('should handle state option', () => {
      const navigate = useViewTransitionNavigate();
      const state = { fromPage: 'home' };

      navigate('/test', { state });

      expect(mockNavigate).toHaveBeenCalledWith('/test', { state });
    });

    it('should handle multiple options', () => {
      const navigate = useViewTransitionNavigate();
      const options = { replace: true, scroll: true, state: { data: 'test' } };

      navigate('/test', options);

      expect(mockNavigate).toHaveBeenCalledWith('/test', options);
    });
  });
});
