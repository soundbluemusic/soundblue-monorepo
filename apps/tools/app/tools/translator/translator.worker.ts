// Web Worker for heavy translation tasks
// Runs translations off the main thread to prevent UI blocking

import { translate } from './translator-service';
import type { TranslationDirection } from './types';

// ========================================
// Message Types
// ========================================

export type WorkerMessage =
  | { type: 'translate'; payload: TranslateRequest }
  | { type: 'translateBatch'; payload: BatchTranslateRequest };

export type WorkerResponse =
  | { type: 'translateResult'; payload: TranslateResponse }
  | { type: 'batchProgress'; payload: BatchProgressResponse }
  | { type: 'batchComplete'; payload: BatchCompleteResponse }
  | { type: 'error'; payload: { message: string } };

// ========================================
// Single Translation Types
// ========================================

export interface TranslateRequest {
  id: string;
  input: string;
  direction: TranslationDirection;
}

export interface TranslateResponse {
  id: string;
  result: string;
}

// ========================================
// Batch Translation Types
// ========================================

export interface BatchTranslateRequest {
  batchId: string;
  tests: Array<{
    id: string;
    input: string;
    direction: TranslationDirection;
  }>;
}

export interface BatchProgressResponse {
  batchId: string;
  current: number;
  total: number;
  latestResult: {
    id: string;
    result: string;
  };
}

export interface BatchCompleteResponse {
  batchId: string;
  results: Array<{
    id: string;
    result: string;
  }>;
}

// ========================================
// Worker Message Handler
// ========================================

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'translate':
      handleSingleTranslate(message.payload);
      break;
    case 'translateBatch':
      handleBatchTranslate(message.payload);
      break;
  }
};

// ========================================
// Single Translation Handler
// ========================================

function handleSingleTranslate(request: TranslateRequest): void {
  const { id, input, direction } = request;

  try {
    const result = translate(input, direction);
    const response: WorkerResponse = {
      type: 'translateResult',
      payload: { id, result },
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      payload: { message: `Translation error: ${error}` },
    };
    self.postMessage(response);
  }
}

// ========================================
// Batch Translation Handler
// ========================================

function handleBatchTranslate(request: BatchTranslateRequest): void {
  const { batchId, tests } = request;
  const results: Array<{ id: string; result: string }> = [];
  const total = tests.length;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    try {
      const result = translate(test.input, test.direction);
      const testResult = { id: test.id, result };
      results.push(testResult);

      // Send progress update every 10 tests or on last test
      if ((i + 1) % 10 === 0 || i === tests.length - 1) {
        const progressResponse: WorkerResponse = {
          type: 'batchProgress',
          payload: {
            batchId,
            current: i + 1,
            total,
            latestResult: testResult,
          },
        };
        self.postMessage(progressResponse);
      }
    } catch (error) {
      results.push({ id: test.id, result: `[Error: ${error}]` });
    }
  }

  // Send completion message
  const completeResponse: WorkerResponse = {
    type: 'batchComplete',
    payload: { batchId, results },
  };
  self.postMessage(completeResponse);
}
