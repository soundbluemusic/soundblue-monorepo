// ========================================
// @soundblue/worker - Browser Implementation
// For runtime in browser environment
// ========================================

import type { IWorkerRPC, RPCHandler, RPCRequest, RPCResponse, WorkerMessagePort } from './types';

export * from './types';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Get the worker global scope as a message port.
 * Used when running inside a Web Worker to communicate with main thread.
 */
function getWorkerSelf(): WorkerMessagePort {
  // In worker context, self is DedicatedWorkerGlobalScope which has postMessage
  const workerSelf = self as unknown as WorkerMessagePort;
  return workerSelf;
}

/**
 * Worker RPC implementation for browser environment.
 * Provides type-safe communication with Web Workers.
 */
export class WorkerRPC implements IWorkerRPC {
  private worker: Worker;
  private messagePort: WorkerMessagePort | null;
  private pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timeoutId: ReturnType<typeof setTimeout>;
    }
  >();
  private handlers = new Map<string, RPCHandler<unknown, unknown>>();
  private isWorkerSide: boolean;

  /**
   * Create a new WorkerRPC instance
   * @param workerOrUrl - Worker instance, URL to worker script, or null for worker-side
   * @param isWorkerSide - Set to true when running inside a worker
   */
  constructor(workerOrUrl: Worker | URL | string | null, isWorkerSide = false) {
    this.isWorkerSide = isWorkerSide;
    this.messagePort = null;

    if (isWorkerSide) {
      // Running inside worker - use self via message port abstraction
      this.messagePort = getWorkerSelf();
      // Assign to worker for unified handling (worker will be used for event binding)
      this.worker = this.messagePort as unknown as Worker;
    } else if (workerOrUrl instanceof Worker) {
      this.worker = workerOrUrl;
    } else if (workerOrUrl !== null) {
      this.worker = new Worker(workerOrUrl, { type: 'module' });
    } else {
      throw new Error('Worker URL required when not in worker context');
    }

    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);
  }

  isAvailable(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Call a method on the worker
   */
  async call<T, R>(method: string, payload: T, timeout = DEFAULT_TIMEOUT): Promise<R> {
    const id = crypto.randomUUID();

    return new Promise<R>((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RPC timeout: ${method} (${timeout}ms)`));
      }, timeout);

      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeoutId,
      });

      const message: RPCRequest<T> = { id, method, payload };

      // Detect transferable objects
      const transfer = this.detectTransferable(payload);

      if (this.isWorkerSide && this.messagePort) {
        this.messagePort.postMessage(message, transfer);
      } else {
        this.worker.postMessage(message, transfer);
      }
    });
  }

  /**
   * Register a handler for a method (worker side)
   */
  register<T, R>(method: string, handler: RPCHandler<T, R>): void {
    this.handlers.set(method, handler as RPCHandler<unknown, unknown>);
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    // Clear all pending requests
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Worker terminated'));
      this.pending.delete(id);
    }

    if (!this.isWorkerSide) {
      this.worker.terminate();
    }
  }

  private handleMessage(event: MessageEvent): void {
    const data = event.data;

    // Handle response (from worker to main)
    if ('result' in data || 'error' in data) {
      const response = data as RPCResponse;
      const pending = this.pending.get(response.id);

      if (pending) {
        clearTimeout(pending.timeoutId);
        this.pending.delete(response.id);

        if (response.error) {
          pending.reject(new Error(response.error));
        } else {
          pending.resolve(response.result);
        }
      }
      return;
    }

    // Handle request (from main to worker)
    const request = data as RPCRequest;
    const handler = this.handlers.get(request.method);

    if (handler) {
      handler(request.payload)
        .then((result) => {
          const response: RPCResponse = { id: request.id, result };
          this.sendResponse(response);
        })
        .catch((error: Error) => {
          const response: RPCResponse = {
            id: request.id,
            error: error.message || 'Unknown error',
          };
          this.sendResponse(response);
        });
    } else {
      // Unknown method
      const response: RPCResponse = {
        id: request.id,
        error: `Unknown method: ${request.method}`,
      };
      this.sendResponse(response);
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error.message);
  }

  private sendResponse(response: RPCResponse): void {
    if (this.isWorkerSide && this.messagePort) {
      this.messagePort.postMessage(response);
    } else {
      this.worker.postMessage(response);
    }
  }

  private detectTransferable(payload: unknown): Transferable[] {
    const transfers: Transferable[] = [];

    if (payload instanceof ArrayBuffer) {
      transfers.push(payload);
    } else if (ArrayBuffer.isView(payload)) {
      transfers.push(payload.buffer);
    } else if (typeof payload === 'object' && payload !== null) {
      for (const value of Object.values(payload)) {
        transfers.push(...this.detectTransferable(value));
      }
    }

    return transfers;
  }
}

/**
 * Create a WorkerRPC instance for the main thread
 */
export function createWorkerRPC(workerUrl: string | URL): WorkerRPC {
  return new WorkerRPC(workerUrl);
}

/**
 * Create a WorkerRPC instance for inside the worker
 */
export function createWorkerRPCSelf(): WorkerRPC {
  return new WorkerRPC(null, true);
}
