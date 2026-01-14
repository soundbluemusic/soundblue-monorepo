/**
 * @soundblue/worker - Noop Implementation Tests
 * Tests for SSG/build time implementation
 */
import { describe, expect, it } from 'vitest';
import { createWorkerRPC, createWorkerRPCSelf, WorkerRPC } from '../src/index.noop';

describe('@soundblue/worker noop implementation', () => {
  describe('WorkerRPC', () => {
    it('should create instance', () => {
      const rpc = new WorkerRPC();
      expect(rpc).toBeInstanceOf(WorkerRPC);
    });

    it('should report not available', () => {
      const rpc = new WorkerRPC();
      expect(rpc.isAvailable()).toBe(false);
    });

    it('should throw error on call', async () => {
      const rpc = new WorkerRPC();
      await expect(rpc.call('test', { data: 'test' })).rejects.toThrow(
        'Worker is not available during SSR',
      );
    });

    it('should not throw on register', () => {
      const rpc = new WorkerRPC();
      expect(() => rpc.register('test', async () => 'result')).not.toThrow();
    });

    it('should not throw on terminate', () => {
      const rpc = new WorkerRPC();
      expect(() => rpc.terminate()).not.toThrow();
    });
  });

  describe('factory functions', () => {
    it('createWorkerRPC should return WorkerRPC instance', () => {
      const rpc = createWorkerRPC('/worker.js');
      expect(rpc).toBeInstanceOf(WorkerRPC);
      expect(rpc.isAvailable()).toBe(false);
    });

    it('createWorkerRPCSelf should return WorkerRPC instance', () => {
      const rpc = createWorkerRPCSelf();
      expect(rpc).toBeInstanceOf(WorkerRPC);
      expect(rpc.isAvailable()).toBe(false);
    });
  });
});
