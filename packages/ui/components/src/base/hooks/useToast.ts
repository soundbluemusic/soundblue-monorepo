/**
 * @fileoverview useToast hook for convenient toast notifications
 *
 * Provides a simple API for showing toast notifications.
 *
 * @module @soundblue/shared-react/hooks/useToast
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 *
 * // Simple usage
 * toast.success('Operation completed');
 * toast.error('Something went wrong');
 *
 * // With description
 * toast.success('Copied', { description: 'Text copied to clipboard' });
 *
 * // With action
 * toast.error('Failed to save', {
 *   action: { label: 'Retry', onClick: handleRetry }
 * });
 * ```
 */

import { useCallback, useMemo } from 'react';
import { type Toast, type ToastType, useToastStore } from '../stores/toast-store';

type ToastOptions = Omit<Toast, 'id' | 'type' | 'title'>;

interface ToastMethods {
  success: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  warning: (title: string, options?: ToastOptions) => string;
  info: (title: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface UseToastReturn {
  toast: ToastMethods;
  toasts: Toast[];
}

export function useToast(): UseToastReturn {
  const { toasts, addToast, removeToast, clearAll } = useToastStore();

  const createToast = useCallback(
    (type: ToastType) => (title: string, options?: ToastOptions) => {
      return addToast({ type, title, ...options });
    },
    [addToast],
  );

  const toast = useMemo<ToastMethods>(
    () => ({
      success: createToast('success'),
      error: createToast('error'),
      warning: createToast('warning'),
      info: createToast('info'),
      dismiss: removeToast,
      dismissAll: clearAll,
    }),
    [createToast, removeToast, clearAll],
  );

  return { toast, toasts };
}
