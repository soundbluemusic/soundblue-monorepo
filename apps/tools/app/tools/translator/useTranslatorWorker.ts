import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BatchCompleteResponse,
  BatchProgressResponse,
  BatchTranslateRequest,
  TranslateRequest,
  TranslateResponse,
  WorkerMessage,
  WorkerResponse,
} from './translator.worker';
import type { TranslationDirection } from './types';

// ========================================
// Types
// ========================================

export interface TranslatorWorkerState {
  isReady: boolean;
  isProcessing: boolean;
  progress: {
    current: number;
    total: number;
    phase: string;
  };
}

export interface BatchTestInput {
  id: string;
  input: string;
  direction: TranslationDirection;
}

export interface BatchResult {
  id: string;
  result: string;
}

export interface UseTranslatorWorkerReturn {
  state: TranslatorWorkerState;
  translate: (input: string, direction: TranslationDirection) => Promise<string>;
  translateBatch: (
    tests: BatchTestInput[],
    phaseName: string,
    onProgress?: (current: number, total: number) => void,
  ) => Promise<BatchResult[]>;
  terminate: () => void;
}

// ========================================
// Hook Implementation
// ========================================

export function useTranslatorWorker(): UseTranslatorWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestsRef = useRef<
    Map<
      string,
      {
        resolve: (value: unknown) => void;
        reject: (error: Error) => void;
      }
    >
  >(new Map());
  const progressCallbackRef = useRef<((current: number, total: number) => void) | null>(null);

  const [state, setState] = useState<TranslatorWorkerState>({
    isReady: false,
    isProcessing: false,
    progress: { current: 0, total: 0, phase: '' },
  });

  // Initialize worker
  useEffect(() => {
    // Create worker using Vite's worker import pattern
    const worker = new Worker(new URL('./translator.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      switch (response.type) {
        case 'translateResult':
          handleTranslateResult(response.payload);
          break;
        case 'batchProgress':
          handleBatchProgress(response.payload);
          break;
        case 'batchComplete':
          handleBatchComplete(response.payload);
          break;
        case 'error':
          console.error('Worker error:', response.payload.message);
          break;
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setState((prev) => ({ ...prev, isReady: false }));
    };

    workerRef.current = worker;
    setState((prev) => ({ ...prev, isReady: true }));

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRequestsRef.current.clear();
    };
  }, []);

  // Handle single translation result
  const handleTranslateResult = useCallback((payload: TranslateResponse) => {
    const pending = pendingRequestsRef.current.get(payload.id);
    if (pending) {
      pending.resolve(payload.result);
      pendingRequestsRef.current.delete(payload.id);
    }
  }, []);

  // Handle batch progress update
  const handleBatchProgress = useCallback((payload: BatchProgressResponse) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        current: payload.current,
        total: payload.total,
      },
    }));

    // Call progress callback if set
    if (progressCallbackRef.current) {
      progressCallbackRef.current(payload.current, payload.total);
    }
  }, []);

  // Handle batch completion
  const handleBatchComplete = useCallback((payload: BatchCompleteResponse) => {
    const pending = pendingRequestsRef.current.get(payload.batchId);
    if (pending) {
      pending.resolve(payload.results);
      pendingRequestsRef.current.delete(payload.batchId);
    }

    setState((prev) => ({
      ...prev,
      isProcessing: false,
      progress: { current: 0, total: 0, phase: '' },
    }));

    progressCallbackRef.current = null;
  }, []);

  // Single translation
  const translate = useCallback(
    async (input: string, direction: TranslationDirection): Promise<string> => {
      if (!workerRef.current) {
        throw new Error('Worker not initialized');
      }

      const id = crypto.randomUUID();
      const request: TranslateRequest = { id, input, direction };
      const message: WorkerMessage = { type: 'translate', payload: request };

      return new Promise((resolve, reject) => {
        pendingRequestsRef.current.set(id, {
          resolve: resolve as (value: unknown) => void,
          reject,
        });
        workerRef.current?.postMessage(message);
      });
    },
    [],
  );

  // Batch translation
  const translateBatch = useCallback(
    async (
      tests: BatchTestInput[],
      phaseName: string,
      onProgress?: (current: number, total: number) => void,
    ): Promise<BatchResult[]> => {
      if (!workerRef.current) {
        throw new Error('Worker not initialized');
      }

      const batchId = crypto.randomUUID();

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: { current: 0, total: tests.length, phase: phaseName },
      }));

      progressCallbackRef.current = onProgress || null;

      const request: BatchTranslateRequest = { batchId, tests };
      const message: WorkerMessage = { type: 'translateBatch', payload: request };

      return new Promise((resolve, reject) => {
        pendingRequestsRef.current.set(batchId, {
          resolve: resolve as (value: unknown) => void,
          reject,
        });
        workerRef.current?.postMessage(message);
      });
    },
    [],
  );

  // Terminate worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      pendingRequestsRef.current.clear();
      setState({
        isReady: false,
        isProcessing: false,
        progress: { current: 0, total: 0, phase: '' },
      });
    }
  }, []);

  return {
    state,
    translate,
    translateBatch,
    terminate,
  };
}
