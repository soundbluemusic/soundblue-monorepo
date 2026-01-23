import { useCallback, useEffect, useRef } from 'react';
import m from '~/lib/messages';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      confirmButtonRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onCancel],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onCancel();
      }
    },
    [onCancel],
  );

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[70] m-auto p-0 bg-transparent backdrop:bg-black/50 border-none max-w-[90vw] w-[360px]"
    >
      <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-xl border border-[var(--color-border-primary)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-primary)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] m-0">
            {title ?? m['app.deleteConfirmTitle']()}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-text-secondary)] m-0 leading-relaxed">
            {message ?? m['app.deleteConfirmMessage']()}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-hover)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            {m['app.cancel']()}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-error)] border-none rounded-lg cursor-pointer transition-colors duration-150 hover:brightness-110 focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            {m['app.confirm']()}
          </button>
        </div>
      </div>
    </dialog>
  );
}
