/**
 * @fileoverview Keyboard shortcuts guide modal
 *
 * Displays all registered keyboard shortcuts in a modal dialog.
 * Typically opened with '?' key.
 *
 * @module @soundblue/shared-react/components/ui/KeyboardShortcutsModal
 */

import { useCallback, useEffect, useRef } from 'react';
import { formatShortcut, type Shortcut } from '../hooks/useKeyboardShortcuts';

export interface ShortcutGroup {
  name: string;
  shortcuts: Array<Shortcut & { description: string }>;
}

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
  title?: string;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  groups,
  title = 'Keyboard Shortcuts',
}: KeyboardShortcutsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="
        fixed inset-0 z-50 m-auto p-0
        bg-transparent backdrop:bg-black/50
        open:animate-scale-in
        max-w-2xl w-full max-h-[80vh]
      "
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      aria-labelledby="shortcuts-modal-title"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Event propagation handled by dialog */}
      <div
        role="document"
        className="
          w-full p-6 rounded-(--radius-xl, 16px)
          bg-(--color-bg-elevated, #ffffff)
          shadow-(--shadow-xl, 0 25px 50px rgba(0,0,0,0.25))
          overflow-y-auto max-h-[80vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="shortcuts-modal-title"
            className="text-xl font-semibold text-(--color-text-primary, #111827)"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-(--color-bg-tertiary, #e2e4e8) transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-(--color-text-tertiary, #6b7280)"
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

        {/* Shortcut Groups */}
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.name}>
              <h3 className="text-sm font-medium text-(--color-text-secondary, #6b7280) mb-3">
                {group.name}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={`${shortcut.key}-${shortcut.mod}-${shortcut.shift}`}
                    className="flex items-center justify-between py-2 px-3 rounded-(--radius-md, 6px) hover:bg-(--color-bg-secondary, #f0f1f3)"
                  >
                    <span className="text-sm text-(--color-text-primary, #111827)">
                      {shortcut.description}
                    </span>
                    <kbd
                      className="
                        px-2 py-1 text-xs font-mono
                        bg-(--color-bg-tertiary, #e2e4e8) text-(--color-text-secondary, #6b7280)
                        rounded-(--radius-sm, 4px) border border-(--color-border-primary, #e5e7eb)
                      "
                    >
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-xs text-(--color-text-muted, #9ca3af) text-center">
          Press{' '}
          <kbd className="px-1 py-0.5 bg-(--color-bg-tertiary, #e2e4e8) rounded text-xs">?</kbd> to
          toggle this modal
        </p>
      </div>
    </dialog>
  );
}
