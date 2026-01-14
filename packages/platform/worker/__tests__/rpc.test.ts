/**
 * @soundblue/worker - WorkerRPC Browser Implementation Tests
 * Tests for Worker RPC communication
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkerRPC } from '../src/index.browser';

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  // Simulate receiving a response
  simulateResponse(data: unknown): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  // Simulate error
  simulateError(message: string): void {
    if (this.onerror) {
      this.onerror(new ErrorEvent('error', { message }));
    }
  }
}

describe('@soundblue/worker WorkerRPC browser implementation', () => {
  let mockWorker: MockWorker;

  beforeEach(() => {
    vi.useFakeTimers();
    mockWorker = new MockWorker();
    // Mock Worker global for instanceof checks
    vi.stubGlobal('Worker', MockWorker);
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid-123'),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe('constructor', () => {
    it('should accept Worker instance', () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      expect(rpc).toBeInstanceOf(WorkerRPC);
    });

    it('should throw when workerOrUrl is null and not worker side', () => {
      expect(() => new WorkerRPC(null, false)).toThrow(
        'Worker URL required when not in worker context',
      );
    });
  });

  describe('isAvailable', () => {
    it('should return true when Worker is available', () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      expect(rpc.isAvailable()).toBe(true);
    });
  });

  describe('call', () => {
    it('should send message to worker', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);

      const callPromise = rpc.call('testMethod', { data: 'test' });

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        { id: 'test-uuid-123', method: 'testMethod', payload: { data: 'test' } },
        [],
      );

      // Simulate worker response
      mockWorker.simulateResponse({ id: 'test-uuid-123', result: 'success' });

      const result = await callPromise;
      expect(result).toBe('success');
    });

    it('should handle worker error response', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);

      const callPromise = rpc.call('failingMethod', {});

      // Simulate error response
      mockWorker.simulateResponse({
        id: 'test-uuid-123',
        error: 'Something went wrong',
      });

      await expect(callPromise).rejects.toThrow('Something went wrong');
    });

    it('should timeout on no response', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);

      const callPromise = rpc.call('slowMethod', {}, 1000);

      // Advance time past timeout
      vi.advanceTimersByTime(1001);

      await expect(callPromise).rejects.toThrow('RPC timeout: slowMethod (1000ms)');
    });

    it('should use default timeout of 30 seconds', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);

      const callPromise = rpc.call('method', {});

      // Advance time to just before default timeout
      vi.advanceTimersByTime(29999);

      // Should not have rejected yet
      let rejected = false;
      callPromise.catch(() => {
        rejected = true;
      });
      await Promise.resolve(); // flush

      expect(rejected).toBe(false);

      // Advance past timeout
      vi.advanceTimersByTime(2);
      await Promise.resolve();

      await expect(callPromise).rejects.toThrow('RPC timeout: method (30000ms)');
    });
  });

  describe('register', () => {
    it('should register handler', () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      const handler = vi.fn(async () => 'result');

      expect(() => rpc.register('myMethod', handler)).not.toThrow();
    });

    it('should call handler when request received', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      const handler = vi.fn(async (payload: { value: number }) => payload.value * 2);

      rpc.register('double', handler);

      // Simulate incoming request
      mockWorker.simulateResponse({
        id: 'request-1',
        method: 'double',
        payload: { value: 5 },
      });

      // Wait for handler to be called
      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledWith({ value: 5 });
      });
    });
  });

  describe('terminate', () => {
    it('should terminate worker', () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      rpc.terminate();
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should reject pending calls on terminate', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);

      const callPromise = rpc.call('pendingMethod', {});
      rpc.terminate();

      await expect(callPromise).rejects.toThrow('Worker terminated');
    });
  });

  describe('transferable detection', () => {
    it('should detect ArrayBuffer', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      const buffer = new ArrayBuffer(8);

      rpc.call('bufferMethod', buffer);

      expect(mockWorker.postMessage).toHaveBeenCalledWith(expect.anything(), [buffer]);
    });

    it('should detect TypedArray buffer', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      const typed = new Uint8Array(8);

      rpc.call('typedMethod', typed);

      expect(mockWorker.postMessage).toHaveBeenCalledWith(expect.anything(), [typed.buffer]);
    });

    it('should detect nested transferables', async () => {
      const rpc = new WorkerRPC(mockWorker as unknown as Worker);
      const buffer = new ArrayBuffer(8);

      rpc.call('nestedMethod', { nested: { buffer } });

      expect(mockWorker.postMessage).toHaveBeenCalledWith(expect.anything(), [buffer]);
    });
  });
});
