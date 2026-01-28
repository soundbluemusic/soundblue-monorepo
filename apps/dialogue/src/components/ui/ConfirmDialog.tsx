import { getLocaleFromPath } from '@soundblue/locale';
import { useLocation } from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';

// i18n messages for ConfirmDialog (pathname 기반 locale 감지)
const messages = {
  en: {
    deleteConfirmTitle: 'Delete Conversation',
    deleteConfirmMessage:
      'Saved conversations cannot be recovered. Are you sure you want to delete?',
    cancel: 'Cancel',
    confirm: 'Delete',
  },
  ko: {
    deleteConfirmTitle: '대화 삭제',
    deleteConfirmMessage: '저장된 대화는 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
    cancel: '취소',
    confirm: '삭제',
  },
} as const;

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }: ConfirmDialogProps) {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) === 'ko' ? 'ko' : 'en';
  const t = messages[locale];

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
            {title ?? t.deleteConfirmTitle}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-text-secondary)] m-0 leading-relaxed">
            {message ?? t.deleteConfirmMessage}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            {t.cancel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-error)] border-none rounded-lg cursor-pointer transition-colors duration-150 hover:brightness-110 focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </dialog>
  );
}
