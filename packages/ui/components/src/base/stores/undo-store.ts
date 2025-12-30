/**
 * @fileoverview Undo/Redo system store using Zustand
 *
 * Provides global undo/redo functionality for reversible actions.
 * Integrates with toast notifications for user feedback.
 *
 * @module @soundblue/shared-react/stores/undo-store
 */

import { create } from 'zustand';

export interface UndoAction {
  id: string;
  type: string;
  description: string;
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
  timestamp: number;
}

export interface UndoStore {
  undoStack: UndoAction[];
  redoStack: UndoAction[];
  maxHistory: number;
  push: (action: Omit<UndoAction, 'id' | 'timestamp'>) => string;
  undo: () => Promise<UndoAction | null>;
  redo: () => Promise<UndoAction | null>;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const DEFAULT_MAX_HISTORY = 20;

export const useUndoStore = create<UndoStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistory: DEFAULT_MAX_HISTORY,

  push: (action) => {
    const id = `undo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newAction: UndoAction = {
      ...action,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      undoStack: [...state.undoStack, newAction].slice(-state.maxHistory),
      // Clear redo stack when new action is pushed
      redoStack: [],
    }));

    return id;
  },

  undo: async () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;

    const action = undoStack[undoStack.length - 1];
    if (!action) return null;

    try {
      await action.undo();

      set((state) => ({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, action],
      }));

      return action;
    } catch (error) {
      console.error('Undo failed:', error);
      return null;
    }
  },

  redo: async () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return null;

    const action = redoStack[redoStack.length - 1];
    if (!action) return null;

    try {
      await action.redo();

      set((state) => ({
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, action],
      }));

      return action;
    } catch (error) {
      console.error('Redo failed:', error);
      return null;
    }
  },

  clear: () => {
    set({ undoStack: [], redoStack: [] });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}));
