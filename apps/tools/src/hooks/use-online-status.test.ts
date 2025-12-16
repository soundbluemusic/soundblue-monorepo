import { describe, expect, it, vi } from 'vitest';
import { getOnlineStatus, onOnlineStatusChange } from './use-online-status';

describe('online status utilities', () => {
  describe('getOnlineStatus', () => {
    it('should return an object with isOnline, wasOffline, and lastChanged', () => {
      const status = getOnlineStatus();

      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('wasOffline');
      expect(status).toHaveProperty('lastChanged');

      expect(typeof status.isOnline).toBe('boolean');
      expect(typeof status.wasOffline).toBe('boolean');
      expect(status.lastChanged === null || typeof status.lastChanged === 'number').toBe(true);
    });

    it('should return consistent values on multiple calls', () => {
      const status1 = getOnlineStatus();
      const status2 = getOnlineStatus();

      expect(status1.isOnline).toBe(status2.isOnline);
      expect(status1.wasOffline).toBe(status2.wasOffline);
    });
  });

  describe('onOnlineStatusChange', () => {
    it('should return an unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = onOnlineStatusChange(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should not throw when unsubscribing', () => {
      const callback = vi.fn();
      const unsubscribe = onOnlineStatusChange(callback);

      expect(() => unsubscribe()).not.toThrow();
    });

    it('should allow multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = onOnlineStatusChange(callback1);
      const unsub2 = onOnlineStatusChange(callback2);

      unsub1();
      unsub2();
    });

    it('should safely handle double unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = onOnlineStatusChange(callback);

      expect(() => {
        unsubscribe();
        unsubscribe();
      }).not.toThrow();
    });
  });
});
