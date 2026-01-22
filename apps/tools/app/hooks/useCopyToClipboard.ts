/**
 * @fileoverview useCopyToClipboard Hook
 *
 * Provides clipboard copy functionality with Toast notifications.
 * Wraps the clipboard utility with automatic user feedback.
 */

import { useToast } from '@soundblue/ui-components/base';
import { useCallback } from 'react';
import { copyToClipboard } from '~/lib/clipboard';

export interface UseCopyToClipboardOptions {
  /** Success message to show in toast */
  successMessage?: string;
  /** Error message to show in toast */
  errorMessage?: string;
  /** Optional description for success toast */
  successDescription?: string;
  /** Optional description for error toast */
  errorDescription?: string;
}

export interface UseCopyToClipboardReturn {
  /** Copy text to clipboard with toast feedback */
  copy: (text: string) => Promise<boolean>;
}

const DEFAULT_SUCCESS_MESSAGE = 'Copied!';
const DEFAULT_ERROR_MESSAGE = 'Copy failed';

/**
 * Hook for copying text to clipboard with automatic Toast notifications
 *
 * @example
 * ```tsx
 * const { copy } = useCopyToClipboard({
 *   successMessage: 'URL copied!',
 *   errorMessage: 'Failed to copy URL',
 * });
 *
 * <button onClick={() => copy(url)}>Copy URL</button>
 * ```
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { toast } = useToast();
  const {
    successMessage = DEFAULT_SUCCESS_MESSAGE,
    errorMessage = DEFAULT_ERROR_MESSAGE,
    successDescription,
    errorDescription,
  } = options;

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      const success = await copyToClipboard(text);

      if (success) {
        toast.success(successMessage, {
          description: successDescription,
        });
      } else {
        toast.error(errorMessage, {
          description: errorDescription,
        });
      }

      return success;
    },
    [toast, successMessage, errorMessage, successDescription, errorDescription],
  );

  return { copy };
}
