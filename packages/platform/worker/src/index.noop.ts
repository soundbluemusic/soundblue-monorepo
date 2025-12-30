// ========================================
// @soundblue/worker - Noop Implementation
// For SSR/build time - provides empty implementations
// ========================================

import type { IWorkerRPC, RPCHandler } from './types';

export * from './types';

/**
 * Noop Worker RPC implementation for SSR/build time.
 * All methods are safe to call but do nothing.
 */
export class WorkerRPC implements IWorkerRPC {
  isAvailable(): boolean {
    return false;
  }

  async call<T, R>(_method: string, _payload: T, _timeout?: number): Promise<R> {
    throw new Error('Worker is not available during SSR');
  }

  register<T, R>(_method: string, _handler: RPCHandler<T, R>): void {
    // noop
  }

  terminate(): void {
    // noop
  }
}

/**
 * Create a noop WorkerRPC instance for SSR
 */
export function createWorkerRPC(_workerUrl: string | URL): WorkerRPC {
  return new WorkerRPC();
}

/**
 * Create a noop WorkerRPC instance for SSR
 */
export function createWorkerRPCSelf(): WorkerRPC {
  return new WorkerRPC();
}
