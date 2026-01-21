// ========================================
// @soundblue/worker - Browser Implementation
// For runtime in browser environment
// ========================================

import type {
  IWorkerRPC,
  RPCHandler,
  RPCRequest,
  RPCResponse,
  WorkerMessagePort,
  WorkerTarget,
} from './types';

export * from './types';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Type guard to check if we're in a worker context.
 * In a worker, `self` is a DedicatedWorkerGlobalScope.
 */
function isWorkerContext(): boolean {
  return (
    typeof self !== 'undefined' &&
    typeof (self as unknown as { postMessage?: unknown }).postMessage === 'function' &&
    typeof Worker === 'undefined'
  );
}

/**
 * Get the worker global scope as a message port.
 * Used when running inside a Web Worker to communicate with main thread.
 *
 * @returns The worker's global scope cast to WorkerMessagePort
 * @throws Error if not in a worker context
 */
function getWorkerSelf(): WorkerMessagePort {
  if (!isWorkerContext()) {
    throw new Error('getWorkerSelf() can only be called from within a Web Worker');
  }
  // In worker context, self has postMessage and message event handlers
  // Cast is safe because we verified the context above
  return self as unknown as WorkerMessagePort;
}

/**
 * Pending RPC request state
 */
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Worker RPC implementation for browser environment.
 * Provides type-safe communication with Web Workers.
 */
export class WorkerRPC implements IWorkerRPC {
  /** Communication target - either a Worker or WorkerMessagePort */
  private target: WorkerTarget;
  /** Message port for worker-side communication (null on main thread) */
  private messagePort: WorkerMessagePort | null;
  /** Pending RPC requests awaiting response */
  private pending = new Map<string, PendingRequest>();
  /** Registered RPC handlers (worker-side only) */
  private handlers = new Map<string, RPCHandler<unknown, unknown>>();
  /** Whether this instance is running inside a worker */
  private readonly isWorkerSide: boolean;

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
      // Use messagePort as the communication target
      this.target = this.messagePort;
    } else if (workerOrUrl instanceof Worker) {
      this.target = workerOrUrl;
    } else if (workerOrUrl !== null) {
      this.target = new Worker(workerOrUrl, { type: 'module' });
    } else {
      throw new Error('Worker URL required when not in worker context');
    }

    this.target.onmessage = this.handleMessage.bind(this);
    this.target.onerror = this.handleError.bind(this);
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

      // Use target for unified message sending
      this.target.postMessage(message, transfer);
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

    // Only terminate if we're on the main thread and target is a Worker
    if (!this.isWorkerSide && 'terminate' in this.target) {
      (this.target as Worker).terminate();
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
    // Use target for unified response sending (no transfers needed for responses)
    this.target.postMessage(response, []);
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
