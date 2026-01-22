// ========================================
// @soundblue/worker - Browser Implementation
// For runtime in browser environment
// ========================================

/**
 * @fileoverview Web Worker RPC (Remote Procedure Call) Communication Library
 *
 * This module provides a type-safe, Promise-based RPC mechanism for communicating
 * with Web Workers. It abstracts the complexity of postMessage/onmessage patterns
 * and handles:
 * - Request/response correlation via unique IDs
 * - Configurable timeouts with automatic cleanup
 * - Automatic detection of transferable objects (ArrayBuffer, TypedArray)
 * - Bidirectional communication (main thread ↔ worker)
 * - SSG/SSR safety via dual implementation pattern
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         MAIN THREAD                                     │
 * │  ┌─────────────────┐                      ┌─────────────────────────┐  │
 * │  │   Application   │                      │     WorkerRPC           │  │
 * │  │                 │  call('method', x)   │  (isWorkerSide=false)   │  │
 * │  │   await rpc     │ ─────────────────▶   │                         │  │
 * │  │   .call(...)    │                      │  ┌───────────────────┐  │  │
 * │  │                 │                      │  │ pending Map       │  │  │
 * │  │                 │  ◀───────────────    │  │ {id: {resolve,    │  │  │
 * │  │   result       │     result/error      │  │  reject,timeout}} │  │  │
 * │  └─────────────────┘                      │  └───────────────────┘  │  │
 * └──────────────────────────────┬────────────┴─────────────────────────┘  │
 *                                │                                          │
 *                    postMessage │ ▲ onmessage                              │
 *                  {id,method,   │ │ {id,result}                            │
 *                   payload}     │ │ or {id,error}                          │
 *                                │ │                                        │
 * ┌──────────────────────────────┴─┴────────────────────────────────────────┘
 * │                          WEB WORKER                                     │
 * │  ┌─────────────────────────────┐     ┌───────────────────────────────┐ │
 * │  │     WorkerRPC               │     │      Handler Functions        │ │
 * │  │  (isWorkerSide=true)        │     │                               │ │
 * │  │                             │     │  rpc.register('method',       │ │
 * │  │  ┌───────────────────────┐  │     │    async (payload) => {       │ │
 * │  │  │ handlers Map          │──┼────▶│      // process payload       │ │
 * │  │  │ {'method': handler}   │  │     │      return result;           │ │
 * │  │  └───────────────────────┘  │     │    });                        │ │
 * │  └─────────────────────────────┘     └───────────────────────────────┘ │
 * └─────────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Message Flow
 *
 * 1. Main thread calls `rpc.call('method', payload)`
 * 2. WorkerRPC generates unique ID, stores Promise handlers in `pending` Map
 * 3. Message `{id, method, payload}` sent via postMessage with transferables
 * 4. Worker receives message, looks up handler in `handlers` Map
 * 5. Handler processes payload, returns Promise
 * 6. WorkerRPC sends response `{id, result}` or `{id, error}` back
 * 7. Main thread WorkerRPC matches ID, resolves/rejects Promise, clears timeout
 *
 * ## Usage Examples
 *
 * ### Main Thread (Application)
 *
 * ```typescript
 * import { createWorkerRPC } from '@soundblue/worker';
 *
 * // Create RPC instance with worker URL
 * const rpc = createWorkerRPC('/workers/translator.js');
 *
 * // Check if workers are available (returns false during SSR)
 * if (rpc.isAvailable()) {
 *   try {
 *     // Call worker method with payload and optional timeout (default: 30s)
 *     const result = await rpc.call<TranslateInput, TranslateOutput>(
 *       'translate',
 *       { text: '안녕하세요', direction: 'ko-en' },
 *       5000 // 5 second timeout
 *     );
 *     console.log(result); // { translated: 'Hello' }
 *   } catch (error) {
 *     // Handles timeout, worker errors, and termination
 *     console.error('Translation failed:', error.message);
 *   }
 * }
 *
 * // Clean up when done
 * rpc.terminate();
 * ```
 *
 * ### Worker Thread (translator.js)
 *
 * ```typescript
 * import { createWorkerRPCSelf } from '@soundblue/worker';
 *
 * // Create RPC instance for worker side
 * const rpc = createWorkerRPCSelf();
 *
 * // Register handler for 'translate' method
 * rpc.register<TranslateInput, TranslateOutput>(
 *   'translate',
 *   async (payload) => {
 *     const { text, direction } = payload;
 *     // Perform translation...
 *     return { translated: translate(text, direction) };
 *   }
 * );
 *
 * // Register multiple handlers
 * rpc.register('tokenize', async (payload) => tokenize(payload.text));
 * rpc.register('analyze', async (payload) => analyze(payload.sentence));
 * ```
 *
 * ### Transferable Objects (Zero-Copy Performance)
 *
 * ```typescript
 * // ArrayBuffer and TypedArray are automatically detected and transferred
 * const audioData = new Float32Array(44100);
 * // ... fill with audio samples
 *
 * // The buffer is transferred (not copied) for better performance
 * const result = await rpc.call('processAudio', audioData);
 * // Warning: audioData.buffer is now detached and unusable!
 * ```
 *
 * ## Error Handling
 *
 * The RPC system throws errors in these cases:
 * - **Timeout**: `"RPC timeout: methodName (30000ms)"` - no response within timeout
 * - **Worker Error**: Re-thrown error from worker's handler
 * - **Termination**: `"Worker terminated"` - terminate() called with pending requests
 * - **Unknown Method**: `"Unknown method: methodName"` - no handler registered
 *
 * ## SSG/SSR Safety
 *
 * This module uses the dual implementation pattern:
 * - Browser: Full RPC functionality (this file)
 * - SSR/SSG: Noop implementation that throws on `call()`
 *
 * Always check `rpc.isAvailable()` before calling methods that need workers.
 *
 * @module @soundblue/worker
 * @see {@link WorkerRPC} - Main RPC class
 * @see {@link createWorkerRPC} - Factory for main thread
 * @see {@link createWorkerRPCSelf} - Factory for worker thread
 */

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
 * Internal state for a pending RPC request awaiting response.
 *
 * Each call to `WorkerRPC.call()` creates one of these entries, which is stored
 * in the `pending` Map until either:
 * - A response arrives (resolved/rejected based on result/error)
 * - Timeout expires (rejected with timeout error)
 * - Worker is terminated (rejected with termination error)
 *
 * @internal
 */
interface PendingRequest {
  /** Resolves the call() Promise with the worker's result */
  resolve: (value: unknown) => void;
  /** Rejects the call() Promise with an error */
  reject: (error: Error) => void;
  /** Timer ID for automatic timeout cleanup */
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Type-safe RPC (Remote Procedure Call) communication with Web Workers.
 *
 * This class provides a Promise-based abstraction over the postMessage/onmessage
 * pattern, enabling clean async/await syntax for worker communication.
 *
 * ## Key Features
 *
 * - **Type Safety**: Generic types for payload and response
 * - **Timeout Management**: Automatic cleanup of stale requests
 * - **Transferable Detection**: Zero-copy transfer of ArrayBuffer/TypedArray
 * - **Bidirectional**: Works on both main thread and worker side
 * - **Error Propagation**: Worker errors are re-thrown on main thread
 *
 * ## Internal State
 *
 * ```
 * WorkerRPC Instance
 * ├── target: Worker | WorkerMessagePort  (communication endpoint)
 * ├── pending: Map<id, PendingRequest>    (main thread only: awaiting responses)
 * ├── handlers: Map<method, handler>       (worker side only: registered handlers)
 * └── isWorkerSide: boolean               (determines message flow direction)
 * ```
 *
 * ## Thread-Specific Behavior
 *
 * | Feature | Main Thread | Worker Side |
 * |---------|-------------|-------------|
 * | `call()` | Sends request, awaits response | Sends response (internal) |
 * | `register()` | No effect | Adds method handler |
 * | `terminate()` | Kills worker, rejects pending | No effect |
 * | `pending` Map | Active (stores promises) | Empty |
 * | `handlers` Map | Empty | Active (stores handlers) |
 *
 * @implements {IWorkerRPC}
 *
 * @example
 * // Main thread: create and use
 * const rpc = new WorkerRPC(new Worker('/my-worker.js'));
 * const result = await rpc.call('compute', { input: 42 });
 *
 * @example
 * // Worker side: create and register handlers
 * const rpc = new WorkerRPC(null, true);
 * rpc.register('compute', async ({ input }) => input * 2);
 */
export class WorkerRPC implements IWorkerRPC {
  /**
   * Communication target for postMessage.
   * - Main thread: Worker instance created from URL
   * - Worker side: DedicatedWorkerGlobalScope (self)
   */
  private target: WorkerTarget;

  /**
   * Message port abstraction for worker-side communication.
   * Only set when `isWorkerSide=true`, allowing unified message handling.
   */
  private messagePort: WorkerMessagePort | null;

  /**
   * Map of pending requests awaiting response from worker.
   *
   * Key: Unique request ID (UUID)
   * Value: Promise handlers + timeout ID
   *
   * Used only on main thread. When a response arrives, the matching
   * entry is found by ID, resolved/rejected, and removed.
   */
  private pending = new Map<string, PendingRequest>();

  /**
   * Map of registered RPC handlers.
   *
   * Key: Method name (e.g., 'translate', 'compute')
   * Value: Async handler function
   *
   * Used only on worker side. When a request arrives, the matching
   * handler is invoked and its result sent back as response.
   */
  private handlers = new Map<string, RPCHandler<unknown, unknown>>();

  /**
   * Indicates whether this instance runs inside a Web Worker.
   * Determines message flow direction and available operations.
   */
  private readonly isWorkerSide: boolean;

  /**
   * Creates a new WorkerRPC instance.
   *
   * ## Construction Patterns
   *
   * ```typescript
   * // Pattern 1: Main thread with Worker URL (most common)
   * const rpc = new WorkerRPC('/workers/compute.js');
   *
   * // Pattern 2: Main thread with existing Worker
   * const worker = new Worker('/workers/compute.js', { type: 'module' });
   * const rpc = new WorkerRPC(worker);
   *
   * // Pattern 3: Worker side (use factory function instead)
   * const rpc = new WorkerRPC(null, true);
   * // Preferred: createWorkerRPCSelf()
   * ```
   *
   * @param workerOrUrl - One of:
   *   - `Worker`: Existing Worker instance (main thread)
   *   - `URL | string`: URL to worker script, creates new Worker (main thread)
   *   - `null`: Required when `isWorkerSide=true` (worker thread)
   *
   * @param isWorkerSide - Set to `true` when running inside a Web Worker.
   *   When true, the instance communicates via `self` (DedicatedWorkerGlobalScope).
   *   Default: `false`
   *
   * @throws {Error} "Worker URL required when not in worker context"
   *   - When `workerOrUrl` is null and `isWorkerSide` is false
   *
   * @throws {Error} "getWorkerSelf() can only be called from within a Web Worker"
   *   - When `isWorkerSide` is true but code runs on main thread
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

  /**
   * Checks if Web Workers are available in the current environment.
   *
   * @returns `true` if Worker API is available, `false` during SSR/SSG
   *
   * @example
   * const rpc = createWorkerRPC('/worker.js');
   * if (rpc.isAvailable()) {
   *   // Safe to call worker methods
   *   await rpc.call('process', data);
   * } else {
   *   // Fallback to main thread processing
   *   processSync(data);
   * }
   */
  isAvailable(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Calls a method on the worker and awaits the response.
   *
   * ## Request Flow
   *
   * ```
   * call('method', payload)
   *   │
   *   ├─▶ Generate unique ID (crypto.randomUUID)
   *   ├─▶ Create timeout timer
   *   ├─▶ Store {resolve, reject, timeoutId} in pending Map
   *   ├─▶ Detect transferable objects in payload
   *   ├─▶ postMessage({id, method, payload}, transferables)
   *   │
   *   │   ... worker processes ...
   *   │
   *   └─▶ handleMessage receives {id, result} or {id, error}
   *       ├─▶ Clear timeout
   *       ├─▶ Remove from pending Map
   *       └─▶ resolve(result) or reject(Error(error))
   * ```
   *
   * ## Timeout Behavior
   *
   * If no response arrives within the timeout:
   * 1. The pending request is removed from the Map
   * 2. The Promise is rejected with `"RPC timeout: method (Xms)"`
   * 3. Any late response is ignored (no matching pending entry)
   *
   * @typeParam T - Type of the payload sent to the worker
   * @typeParam R - Type of the result returned by the worker
   *
   * @param method - Name of the RPC method to call (must be registered on worker)
   * @param payload - Data to send to the worker handler
   * @param timeout - Maximum wait time in milliseconds. Default: 30000 (30s)
   *
   * @returns Promise that resolves with the worker's result
   *
   * @throws {Error} `"RPC timeout: method (Xms)"` - No response within timeout
   * @throws {Error} `"Worker terminated"` - Worker was terminated while waiting
   * @throws {Error} Worker-thrown error - Re-thrown from worker's handler
   * @throws {Error} `"Unknown method: method"` - No handler registered for method
   *
   * @example
   * // Basic call with default timeout
   * const result = await rpc.call('translate', { text: 'hello' });
   *
   * @example
   * // Type-safe call with custom timeout
   * interface Input { text: string }
   * interface Output { translated: string }
   *
   * const result = await rpc.call<Input, Output>(
   *   'translate',
   *   { text: 'hello' },
   *   5000 // 5 second timeout for fast operations
   * );
   *
   * @example
   * // Handling errors
   * try {
   *   const result = await rpc.call('riskyOperation', data);
   * } catch (error) {
   *   if (error.message.includes('timeout')) {
   *     // Worker is slow or stuck
   *   } else if (error.message.includes('terminated')) {
   *     // Worker was killed
   *   } else {
   *     // Worker threw an error
   *   }
   * }
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
   * Registers a handler function for an RPC method.
   *
   * **This method is intended for worker-side use only.**
   * On the main thread, it has no effect (handlers are never invoked).
   *
   * ## Handler Contract
   *
   * - Receives the `payload` from `call(method, payload)`
   * - Must return a Promise (use async function)
   * - Resolved value becomes the `result` sent back to caller
   * - Rejected error becomes the `error` sent back to caller
   *
   * ## Multiple Handlers
   *
   * Each method name can have only one handler. Calling `register()`
   * with the same method name replaces the previous handler.
   *
   * @typeParam T - Type of the payload received from caller
   * @typeParam R - Type of the result returned to caller
   *
   * @param method - Name of the RPC method (used in `call(method, ...)`)
   * @param handler - Async function that processes the request
   *
   * @example
   * // Worker-side: Register a simple handler
   * rpc.register('double', async (num: number) => num * 2);
   *
   * @example
   * // Worker-side: Register with typed payload and result
   * interface TranslateRequest {
   *   text: string;
   *   direction: 'ko-en' | 'en-ko';
   * }
   * interface TranslateResponse {
   *   translated: string;
   *   confidence: number;
   * }
   *
   * rpc.register<TranslateRequest, TranslateResponse>(
   *   'translate',
   *   async ({ text, direction }) => {
   *     const result = await translate(text, direction);
   *     return {
   *       translated: result.text,
   *       confidence: result.score
   *     };
   *   }
   * );
   *
   * @example
   * // Worker-side: Handler that throws (error sent to caller)
   * rpc.register('divide', async ({ a, b }: { a: number; b: number }) => {
   *   if (b === 0) {
   *     throw new Error('Division by zero');
   *   }
   *   return a / b;
   * });
   */
  register<T, R>(method: string, handler: RPCHandler<T, R>): void {
    this.handlers.set(method, handler as RPCHandler<unknown, unknown>);
  }

  /**
   * Terminates the worker and cleans up resources.
   *
   * ## Cleanup Process
   *
   * 1. **Clear pending requests**: All awaiting Promises are rejected
   *    with `"Worker terminated"` error
   * 2. **Clear timeouts**: All pending timeout timers are cleared
   * 3. **Terminate worker**: If on main thread, calls `worker.terminate()`
   *
   * ## Thread-Specific Behavior
   *
   * - **Main thread**: Terminates the worker process
   * - **Worker side**: No effect (workers can't terminate themselves)
   *
   * ## Important Notes
   *
   * - Terminated workers cannot be restarted
   * - Create a new WorkerRPC instance if you need to restart
   * - Always call terminate() when done to free resources
   *
   * @example
   * const rpc = createWorkerRPC('/worker.js');
   *
   * // Use the worker...
   * await rpc.call('process', data);
   *
   * // Clean up when done
   * rpc.terminate();
   *
   * @example
   * // Handling termination during pending calls
   * const rpc = createWorkerRPC('/worker.js');
   * const promise = rpc.call('longOperation', data);
   *
   * // User cancels - this rejects the pending promise
   * rpc.terminate();
   *
   * try {
   *   await promise;
   * } catch (error) {
   *   console.log(error.message); // "Worker terminated"
   * }
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

  /**
   * Internal message handler for both request and response processing.
   *
   * ## Message Type Detection
   *
   * Messages are distinguished by their properties:
   * - **Response**: Has `result` or `error` property → process as response
   * - **Request**: Has `method` property → process as request
   *
   * ## Response Processing (Main Thread)
   *
   * ```
   * {id, result} or {id, error}
   *   │
   *   ├─▶ Find pending entry by id
   *   ├─▶ Clear timeout timer
   *   ├─▶ Remove from pending Map
   *   └─▶ resolve(result) or reject(Error(error))
   * ```
   *
   * ## Request Processing (Worker Side)
   *
   * ```
   * {id, method, payload}
   *   │
   *   ├─▶ Find handler by method name
   *   ├─▶ If found:
   *   │     ├─▶ await handler(payload)
   *   │     └─▶ sendResponse({id, result})
   *   │   On error:
   *   │     └─▶ sendResponse({id, error: message})
   *   │
   *   └─▶ If not found:
   *         └─▶ sendResponse({id, error: "Unknown method: ..."})
   * ```
   *
   * @param event - MessageEvent containing RPC request or response
   * @internal
   */
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

  /**
   * Handles worker-level errors (not RPC errors).
   *
   * These are typically syntax errors or uncaught exceptions in the worker
   * that occur outside of RPC handlers. RPC-level errors are handled via
   * the `{id, error}` response message instead.
   *
   * @param error - ErrorEvent from the worker
   * @internal
   */
  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error.message);
  }

  /**
   * Sends an RPC response back to the caller (worker side only).
   *
   * Responses don't need transferable objects since results are typically
   * small JSON-serializable values. Empty transfer array is passed explicitly.
   *
   * @param response - RPC response with id and result/error
   * @internal
   */
  private sendResponse(response: RPCResponse): void {
    // Use target for unified response sending (no transfers needed for responses)
    this.target.postMessage(response, []);
  }

  /**
   * Recursively detects transferable objects in a payload.
   *
   * Transferable objects are moved (not copied) to the worker, providing
   * zero-copy performance for large binary data. After transfer, the
   * original buffer becomes "detached" and unusable.
   *
   * ## Detected Types
   *
   * | Type | Transfer | Notes |
   * |------|----------|-------|
   * | `ArrayBuffer` | The buffer itself | Direct transfer |
   * | `TypedArray` | The underlying `.buffer` | Uint8Array, Float32Array, etc. |
   * | `Object` | Nested transferables | Recursively scanned |
   * | Other | Not transferred | Copied via structured clone |
   *
   * ## Recursion Logic
   *
   * ```
   * detectTransferable(payload)
   *   │
   *   ├─▶ payload instanceof ArrayBuffer → [payload]
   *   ├─▶ ArrayBuffer.isView(payload) → [payload.buffer]
   *   └─▶ typeof payload === 'object'
   *         └─▶ Object.values(payload).flatMap(detectTransferable)
   * ```
   *
   * ## Performance Consideration
   *
   * Transferring large buffers (e.g., audio data) is much faster than
   * copying, but the original data becomes unusable. Make a copy first
   * if you need to keep the original.
   *
   * @param payload - Data being sent to the worker
   * @returns Array of transferable objects found in payload
   *
   * @example
   * // ArrayBuffer - direct transfer
   * detectTransferable(new ArrayBuffer(1024))
   * // Returns: [ArrayBuffer]
   *
   * @example
   * // TypedArray - transfers underlying buffer
   * detectTransferable(new Float32Array(256))
   * // Returns: [ArrayBuffer] (the .buffer property)
   *
   * @example
   * // Nested object - recursive scan
   * detectTransferable({
   *   text: 'hello',  // ignored (string)
   *   audio: new Float32Array(256),  // found!
   *   config: { buffer: new ArrayBuffer(64) }  // found!
   * })
   * // Returns: [ArrayBuffer, ArrayBuffer]
   *
   * @internal
   */
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
 * Factory function to create a WorkerRPC instance for the main thread.
 *
 * This is the recommended way to create a WorkerRPC on the main thread.
 * It creates a new Worker from the provided URL and sets up bidirectional
 * RPC communication.
 *
 * ## Worker Module Type
 *
 * The created Worker uses `type: 'module'`, allowing ES module syntax
 * (`import`/`export`) in your worker script.
 *
 * @param workerUrl - URL or path to the worker script
 *   - Absolute: `'https://example.com/worker.js'`
 *   - Relative: `'/workers/translator.js'`
 *   - URL object: `new URL('./worker.js', import.meta.url)`
 *
 * @returns New WorkerRPC instance ready for `call()` operations
 *
 * @example
 * // Basic usage with relative path
 * const rpc = createWorkerRPC('/workers/compute.js');
 *
 * // With URL object (useful for bundlers)
 * const rpc = createWorkerRPC(
 *   new URL('./compute.worker.ts', import.meta.url)
 * );
 *
 * // Usage pattern
 * const result = await rpc.call('compute', { input: 42 });
 * rpc.terminate();
 *
 * @see {@link createWorkerRPCSelf} - For worker-side creation
 * @see {@link WorkerRPC} - For direct instantiation with existing Worker
 */
export function createWorkerRPC(workerUrl: string | URL): WorkerRPC {
  return new WorkerRPC(workerUrl);
}

/**
 * Factory function to create a WorkerRPC instance inside a Web Worker.
 *
 * This is the recommended way to create a WorkerRPC on the worker side.
 * It uses `self` (DedicatedWorkerGlobalScope) for communication with
 * the main thread.
 *
 * ## Typical Worker Script Structure
 *
 * ```typescript
 * // my-worker.ts
 * import { createWorkerRPCSelf } from '@soundblue/worker';
 *
 * const rpc = createWorkerRPCSelf();
 *
 * // Register all handlers
 * rpc.register('methodA', async (payload) => { ... });
 * rpc.register('methodB', async (payload) => { ... });
 *
 * // Worker is now ready to receive messages
 * ```
 *
 * @returns New WorkerRPC instance configured for worker-side operation
 *
 * @throws {Error} "getWorkerSelf() can only be called from within a Web Worker"
 *   - If called from the main thread instead of inside a worker
 *
 * @example
 * // translator.worker.ts
 * import { createWorkerRPCSelf } from '@soundblue/worker';
 * import { translate } from './translate';
 *
 * const rpc = createWorkerRPCSelf();
 *
 * rpc.register('translate', async ({ text, direction }) => {
 *   return translate(text, direction);
 * });
 *
 * rpc.register('tokenize', async ({ text }) => {
 *   return text.split(/\s+/);
 * });
 *
 * @see {@link createWorkerRPC} - For main-thread creation
 */
export function createWorkerRPCSelf(): WorkerRPC {
  return new WorkerRPC(null, true);
}
