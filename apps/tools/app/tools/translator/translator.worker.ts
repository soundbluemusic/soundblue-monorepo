// Web Worker for heavy translation tasks
// Runs translations off the main thread to prevent UI blocking

import { translate } from './translator-service';
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

// Handle messages from main thread
self.onmessage = (event: MessageEvent<TranslateRequest>) => {
  const { id, input, direction } = event.data;

  try {
    const result = translate(input, direction);
    self.postMessage({ id, result } as TranslateResponse);
  } catch (error) {
    self.postMessage({ id, result: `[Error: ${error}]` } as TranslateResponse);
  }
};
