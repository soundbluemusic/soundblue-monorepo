/**
 * @fileoverview useUndo hook for undo/redo functionality
 *
 * Provides a convenient API for managing undoable actions with keyboard shortcuts.
 *
 * @module @soundblue/shared-react/hooks/useUndo
 *
 * @example
 * ```tsx
 * const { push, undo, redo, canUndo, canRedo } = useUndo();
 *
 * // Register an undoable action
 * const deleteItem = (item) => {
 *   // Store original state for undo
 *   const originalItems = [...items];
 *
 *   // Perform delete
 *   setItems(items.filter(i => i.id !== item.id));
 *
 *   // Register undo action
 *   push({
 *     type: 'delete-item',
 *     description: `Delete ${item.name}`,
 *     undo: () => setItems(originalItems),
 *     redo: () => setItems(items.filter(i => i.id !== item.id)),
 *   });
 * };
 * ```
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useToastStore } from '../stores/toast-store';
import { type UndoAction, useUndoStore } from '../stores/undo-store';

export interface UseUndoOptions {
  /** Enable keyboard shortcuts (Cmd/Ctrl+Z for undo, Cmd/Ctrl+Shift+Z for redo) */
  enableKeyboardShortcuts?: boolean;
  /** Show toast notifications on undo/redo */
  showToasts?: boolean;
}

export interface UseUndoReturn {
  push: (action: Omit<UndoAction, 'id' | 'timestamp'>) => string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  undoStack: UndoAction[];
  redoStack: UndoAction[];
}

export function useUndo(options: UseUndoOptions = {}): UseUndoReturn {
  const { enableKeyboardShortcuts = true, showToasts = true } = options;

  const {
    undoStack,
    redoStack,
    push: storePush,
    undo: storeUndo,
    redo: storeRedo,
    clear,
    canUndo: storeCanUndo,
    canRedo: storeCanRedo,
  } = useUndoStore();

  const { addToast } = useToastStore();

  const canUndo = storeCanUndo();
  const canRedo = storeCanRedo();

  const undo = useCallback(async () => {
    const action = await storeUndo();
    if (action && showToasts) {
      addToast({
        type: 'info',
        title: 'Undone',
        description: action.description,
        duration: 2000,
      });
    }
  }, [storeUndo, showToasts, addToast]);

  const redo = useCallback(async () => {
    const action = await storeRedo();
    if (action && showToasts) {
      addToast({
        type: 'info',
        title: 'Redone',
        description: action.description,
        duration: 2000,
      });
    }
  }, [storeRedo, showToasts, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  return useMemo(
    () => ({
      push: storePush,
      undo,
      redo,
      canUndo,
      canRedo,
      clear,
      undoStack,
      redoStack,
    }),
    [storePush, undo, redo, canUndo, canRedo, clear, undoStack, redoStack],
  );
}
