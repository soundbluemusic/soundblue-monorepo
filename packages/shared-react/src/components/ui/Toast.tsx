/**
 * @fileoverview Toast notification component
 *
 * Individual toast notification with icons, animations, and optional actions.
 *
 * @module @soundblue/shared-react/components/ui/Toast
 */

import type { HTMLAttributes, ReactNode } from 'react';
import type { Toast as ToastData, ToastType as ToastVariant } from '../../stores/toast-store';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const iconsByType: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const bgByType: Record<ToastVariant, string> = {
  success: 'bg-(--color-success-light, rgba(34, 197, 94, 0.1))',
  error: 'bg-(--color-error-light, rgba(239, 68, 68, 0.1))',
  warning: 'bg-(--color-warning-light, rgba(245, 158, 11, 0.1))',
  info: 'bg-(--color-accent-light, rgba(59, 130, 246, 0.1))',
};

export function Toast({ toast, onDismiss, className = '', ...props }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-(--radius-lg, 8px)
        bg-(--color-bg-elevated, #ffffff) dark:bg-(--color-bg-elevated, #373e47)
        border border-(--color-border-primary, #e5e7eb)
        shadow-(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1))
        animate-slide-up
        ${className}
      `}
      {...props}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-1 rounded-full ${bgByType[toast.type]}`}>
        {iconsByType[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-(--color-text-primary, #111827)">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-(--color-text-secondary, #6b7280)">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-(--color-accent-primary, #3b82f6) hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-(--color-bg-tertiary, #e2e4e8) transition-colors"
        aria-label="Dismiss"
      >
        <svg
          className="w-4 h-4 text-(--color-text-tertiary, #6b7280)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
