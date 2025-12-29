// Worker API wrapper for translator
// Provides async interface to the translator worker

import type { TranslationDirection } from './types';

export interface TranslateRequest {
  id: string;
  input: string;
  direction: TranslationDirection;
}

export interface TranslateResponse {
  id: string;
  result: string;
}

/**
 * Translator Worker API
 * Manages a Web Worker instance for running translations off the main thread
 */
export class TranslatorWorkerApi {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, (result: string) => void> = new Map();
  private requestId = 0;

  /**
   * Initialize the worker
   * Must be called before using translateAsync
   */
  async init(): Promise<void> {
    if (this.worker) return;

    // Vite worker import syntax
    this.worker = new Worker(new URL('./translator.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (event: MessageEvent<TranslateResponse>) => {
      const { id, result } = event.data;
      const resolve = this.pendingRequests.get(id);
      if (resolve) {
        resolve(result);
        this.pendingRequests.delete(id);
      }
    };

    this.worker.onerror = (error) => {
      console.error('Translator worker error:', error);
      // Reject all pending requests
      for (const [id, resolve] of this.pendingRequests) {
        resolve(`[Worker Error: ${error.message}]`);
        this.pendingRequests.delete(id);
      }
    };
  }

  /**
   * Translate text asynchronously using the worker
   * @param input Text to translate
   * @param direction Translation direction
   * @returns Promise that resolves with translated text
   */
  async translateAsync(input: string, direction: TranslationDirection): Promise<string> {
    if (!this.worker) {
      await this.init();
    }

    const id = `req-${this.requestId++}`;

    return new Promise((resolve) => {
      this.pendingRequests.set(id, resolve);
      this.worker!.postMessage({ id, input, direction } as TranslateRequest);
    });
  }

  /**
   * Terminate the worker
   * Call this when done with translations to free resources
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingRequests.clear();
    }
  }
}

// Singleton instance for convenience
let instance: TranslatorWorkerApi | null = null;

/**
 * Get or create the singleton translator worker API instance
 */
export function getTranslatorWorker(): TranslatorWorkerApi {
  if (!instance) {
    instance = new TranslatorWorkerApi();
  }
  return instance;
}

/**
 * Translate text asynchronously using the singleton worker
 * Convenience function that auto-initializes the worker
 */
export async function translateAsync(
  input: string,
  direction: TranslationDirection,
): Promise<string> {
  const worker = getTranslatorWorker();
  return worker.translateAsync(input, direction);
}
