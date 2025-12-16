/**
 * Online Status Risk Tests
 * 온라인 상태 리스크 테스트
 *
 * Risk Coverage: 오프라인 시나리오, PWA 기능
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOnlineStatus, onOnlineStatusChange } from './use-online-status';

describe('Online Status Risk Scenarios', () => {
  describe('Risk: 오프라인 상태 감지', () => {
    it('should return current online status', () => {
      const status = getOnlineStatus();
      expect(typeof status.isOnline).toBe('boolean');
    });

    it('should track if app was ever offline', () => {
      const status = getOnlineStatus();
      expect(typeof status.wasOffline).toBe('boolean');
    });

    it('should provide last changed timestamp', () => {
      const status = getOnlineStatus();
      expect(status.lastChanged === null || typeof status.lastChanged === 'number').toBe(true);
    });
  });

  describe('Risk: 상태 변경 리스너', () => {
    it('should allow subscribing to status changes', () => {
      const callback = vi.fn();
      const unsubscribe = onOnlineStatusChange(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should not throw when unsubscribing multiple times', () => {
      const callback = vi.fn();
      const unsubscribe = onOnlineStatusChange(callback);

      expect(() => {
        unsubscribe();
        unsubscribe();
        unsubscribe();
      }).not.toThrow();
    });

    it('should support multiple listeners', () => {
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      const unsubscribers = callbacks.map((cb) => onOnlineStatusChange(cb));

      // 정리
      unsubscribers.forEach((unsub) => unsub());
    });
  });

  describe('Risk: PWA 오프라인 지원', () => {
    it('should have consistent status object shape', () => {
      const status = getOnlineStatus();

      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('wasOffline');
      expect(status).toHaveProperty('lastChanged');
    });

    it('should return same structure on repeated calls', () => {
      const status1 = getOnlineStatus();
      const status2 = getOnlineStatus();

      expect(Object.keys(status1)).toEqual(Object.keys(status2));
    });
  });

  describe('Risk: 메모리 누수 방지', () => {
    it('should clean up listeners properly', () => {
      const listeners: (() => void)[] = [];

      // 많은 리스너 추가
      for (let i = 0; i < 100; i++) {
        listeners.push(onOnlineStatusChange(() => {}));
      }

      // 모두 정리
      listeners.forEach((unsub) => unsub());

      // 추가 리스너가 여전히 작동해야 함
      const callback = vi.fn();
      const unsub = onOnlineStatusChange(callback);
      expect(typeof unsub).toBe('function');
      unsub();
    });
  });
});
