/**
 * @fileoverview Toast container component
 *
 * Renders all active toasts in a fixed position container.
 * Should be placed once at the root of your app.
 *
 * @module @soundblue/shared-react/components/ui/ToastContainer
 *
 * @example
 * ```tsx
 * // In your root layout
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <ToastContainer />
 *     </>
 *   );
 * }
 * ```
 */

import type { HTMLAttributes } from 'react';
import { useToastStore } from '../stores/toast-store';
import { Toast } from './Toast';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
  maxToasts?: number;
}

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({
  position = 'top-right',
  maxToasts = 5,
  className = '',
  ...props
}: ToastContainerProps) {
  const { toasts, removeToast } = useToastStore();

  // Show only the most recent toasts
  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Notifications"
      className={`fixed z-50 flex flex-col gap-2 w-full max-w-sm ${positionClasses[position]} ${className}`}
      {...props}
    >
      {visibleToasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </section>
  );
}
