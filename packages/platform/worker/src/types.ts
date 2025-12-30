// ========================================
// @soundblue/worker - Shared Types
// Types shared between browser and noop implementations
// ========================================

/**
 * RPC message sent to worker
 */
export interface RPCRequest<T = unknown> {
  id: string;
  method: string;
  payload: T;
}

/**
 * RPC response from worker
 */
export interface RPCResponse<R = unknown> {
  id: string;
  result?: R;
  error?: string;
}

/**
 * RPC handler function type
 */
export type RPCHandler<T = unknown, R = unknown> = (payload: T) => Promise<R>;

/**
 * Worker RPC interface
 */
export interface IWorkerRPC {
  /**
   * Call a method on the worker
   */
  call<T, R>(method: string, payload: T, timeout?: number): Promise<R>;

  /**
   * Register a handler for a method (worker side)
   */
  register<T, R>(method: string, handler: RPCHandler<T, R>): void;

  /**
   * Terminate the worker
   */
  terminate(): void;

  /**
   * Check if worker is available
   */
  isAvailable(): boolean;
}

/**
 * Worker pool configuration
 */
export interface WorkerPoolConfig {
  /** Maximum number of workers */
  maxWorkers: number;
  /** Idle timeout before terminating worker (ms) */
  idleTimeout: number;
  /** Task timeout (ms) */
  taskTimeout: number;
}

/**
 * Task in worker queue
 */
export interface WorkerTask<T = unknown, R = unknown> {
  id: string;
  method: string;
  payload: T;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout> | null;
}
