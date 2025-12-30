/**
 * @fileoverview useKeyboardShortcuts hook for keyboard shortcut management
 *
 * Provides a declarative way to register and manage keyboard shortcuts.
 * Supports modifier keys (Cmd/Ctrl, Shift, Alt) and prevents conflicts with input fields.
 *
 * @module @soundblue/shared-react/hooks/useKeyboardShortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 'k', mod: true, handler: () => openSearch() },
 *   { key: 'Escape', handler: () => closeModal() },
 *   { key: '/', handler: () => focusInput(), allowInInput: false },
 * ]);
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';

export interface Shortcut {
  /** The key to listen for (e.g., 'k', 'Escape', 'Enter') */
  key: string;
  /** Require Cmd (Mac) or Ctrl (Windows/Linux) */
  mod?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt/Option key */
  alt?: boolean;
  /** Handler function called when shortcut is triggered */
  handler: (e: KeyboardEvent) => void;
  /** Allow shortcut to trigger when focused on input/textarea (default: false) */
  allowInInput?: boolean;
  /** Description for keyboard shortcuts modal */
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  /** Enable/disable all shortcuts */
  enabled?: boolean;
  /** Target element (default: window) */
  target?: EventTarget | null;
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

/**
 * Normalize key names for consistent comparison
 */
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    esc: 'escape',
    return: 'enter',
    space: ' ',
    spacebar: ' ',
    del: 'delete',
    ins: 'insert',
  };
  return keyMap[key.toLowerCase()] ?? key.toLowerCase();
}

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  options: UseKeyboardShortcutsOptions = {},
): void {
  const { enabled = true, target } = options;

  // Keep shortcuts in a ref to avoid re-registering on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: Event) => {
      if (!enabled) return;

      const e = event as KeyboardEvent;
      const pressedKey = normalizeKey(e.key);

      for (const shortcut of shortcutsRef.current) {
        const targetKey = normalizeKey(shortcut.key);

        // Check if key matches
        if (pressedKey !== targetKey) continue;

        // Check modifier keys
        const isMod = e.metaKey || e.ctrlKey;
        if (shortcut.mod && !isMod) continue;
        if (!shortcut.mod && isMod && targetKey.length === 1) continue; // Ignore if mod pressed but not required for letter keys

        if (shortcut.shift && !e.shiftKey) continue;
        if (!shortcut.shift && e.shiftKey && targetKey.length === 1) continue;

        if (shortcut.alt && !e.altKey) continue;
        if (!shortcut.alt && e.altKey && targetKey.length === 1) continue;

        // Check if in input field
        if (!shortcut.allowInInput && isInputElement(e.target)) continue;

        // Prevent default and execute handler
        e.preventDefault();
        shortcut.handler(e);
        break; // Only one shortcut should fire
      }
    },
    [enabled],
  );

  useEffect(() => {
    const targetElement = target ?? (typeof window !== 'undefined' ? window : null);
    if (!targetElement) return;

    targetElement.addEventListener('keydown', handleKeyDown);
    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, handleKeyDown]);
}

/**
 * Get platform-specific modifier key symbol
 */
export function getModifierSymbol(): string {
  if (typeof navigator === 'undefined') return 'Ctrl';
  return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = [];

  if (shortcut.mod) {
    parts.push(getModifierSymbol());
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }
  if (shortcut.alt) {
    parts.push(
      typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌥' : 'Alt',
    );
  }

  // Format key
  let keyDisplay = shortcut.key;
  if (shortcut.key === ' ') keyDisplay = 'Space';
  else if (shortcut.key === 'Escape') keyDisplay = 'Esc';
  else if (shortcut.key.length === 1) keyDisplay = shortcut.key.toUpperCase();

  parts.push(keyDisplay);

  return parts.join(' + ');
}
