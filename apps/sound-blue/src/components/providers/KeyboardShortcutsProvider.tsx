/**
 * @fileoverview Global Keyboard Shortcuts Provider
 *
 * Production-grade keyboard shortcuts system following best practices:
 * - Global event delegation with proper cleanup
 * - Input/textarea focus detection to prevent conflicts
 * - Modifier key support (Ctrl/Cmd cross-platform)
 * - Help modal with focus trap and escape handling
 * - SSR-safe implementation
 *
 * @example
 * // Wrap your app with KeyboardShortcutsProvider
 * <KeyboardShortcutsProvider>
 *   <App />
 * </KeyboardShortcutsProvider>
 */

import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  For,
  type JSX,
  onCleanup,
  onMount,
  type ParentComponent,
  useContext,
} from 'solid-js';
import { isServer, Portal } from 'solid-js/web';
import { useLanguage, useTheme } from '~/components/providers';
import { useViewTransitionNavigate } from '~/hooks';

/** Keyboard shortcut definition */
interface Shortcut {
  /** Unique key identifier */
  key: string;
  /** Key to display (e.g., 'K', '?', 'Esc') */
  display: string;
  /** Modifier keys required */
  modifiers?: ('ctrl' | 'meta' | 'shift' | 'alt')[];
  /** Translation key for description */
  labelKey: keyof typeof SHORTCUT_LABELS;
  /** Section grouping */
  section: 'navigation' | 'actions' | 'general';
}

/** Shortcut label keys mapping */
const SHORTCUT_LABELS = {
  search: 'search',
  home: 'home',
  theme: 'theme',
  language: 'language',
  help: 'help',
  escape: 'escape',
} as const;

/** Shortcuts for display (deduplicated - merge Ctrl+K and ⌘K) */
const DISPLAY_SHORTCUTS: Shortcut[] = [
  {
    key: 'k',
    display: '⌘K / Ctrl+K',
    modifiers: ['ctrl'],
    labelKey: 'search',
    section: 'navigation',
  },
  { key: '/', display: '/', labelKey: 'search', section: 'navigation' },
  { key: 'h', display: 'H', labelKey: 'home', section: 'navigation' },
  { key: 't', display: 'T', labelKey: 'theme', section: 'actions' },
  { key: 'l', display: 'L', labelKey: 'language', section: 'actions' },
  { key: '?', display: 'Shift + ?', modifiers: ['shift'], labelKey: 'help', section: 'general' },
  { key: 'Escape', display: 'Esc', labelKey: 'escape', section: 'general' },
];

interface KeyboardShortcutsContextValue {
  /** Whether the help modal is open */
  isHelpOpen: Accessor<boolean>;
  /** Open the help modal */
  openHelp: () => void;
  /** Close the help modal */
  closeHelp: () => void;
  /** Toggle the help modal */
  toggleHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue>();

/**
 * Check if the current focus is in an input field
 */
function isInputFocused(): boolean {
  if (isServer) return false;
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.getAttribute('contenteditable') === 'true';

  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable;
}

/**
 * Keyboard Shortcuts Help Modal
 */
function ShortcutsHelpModal(props: { isOpen: boolean; onClose: () => void }): JSX.Element {
  const { t } = useLanguage();
  let dialogRef: HTMLDialogElement | undefined;

  // Handle dialog open/close
  createEffect(() => {
    if (!dialogRef) return;
    if (props.isOpen) {
      dialogRef.showModal();
    } else {
      dialogRef.close();
    }
  });

  // Close on backdrop click
  const handleBackdropClick = (e: MouseEvent): void => {
    if (e.target === dialogRef) {
      props.onClose();
    }
  };

  // Close on Escape
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      props.onClose();
    }
  };

  const getSectionShortcuts = (section: Shortcut['section']): Shortcut[] => {
    return DISPLAY_SHORTCUTS.filter((s) => s.section === section);
  };

  return (
    <Portal>
      <dialog
        ref={dialogRef}
        class="keyboard-shortcuts-modal"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div class="keyboard-shortcuts-content">
          {/* Header */}
          <div class="flex items-center justify-between mb-6">
            <h2 id="keyboard-shortcuts-title" class="text-lg font-semibold text-content">
              {t().keyboard.title}
            </h2>
            <button
              type="button"
              onClick={props.onClose}
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:bg-state-hover hover:text-content transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t().keyboard.close}
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sections */}
          <div class="space-y-6">
            <For each={['navigation', 'actions', 'general'] as const}>
              {(section) => (
                <div>
                  <h3 class="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">
                    {t().keyboard.sections[section]}
                  </h3>
                  <div class="space-y-2">
                    <For each={getSectionShortcuts(section)}>
                      {(shortcut) => (
                        <div class="flex items-center justify-between py-2">
                          <span class="text-sm text-content">
                            {t().keyboard.shortcuts[shortcut.labelKey]}
                          </span>
                          <kbd class="keyboard-key">{shortcut.display}</kbd>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </dialog>
    </Portal>
  );
}

/**
 * Global Keyboard Shortcuts Provider
 *
 * Provides keyboard shortcuts functionality to the entire application.
 * Handles global keydown events and provides a help modal.
 */
export const KeyboardShortcutsProvider: ParentComponent = (props): JSX.Element => {
  const [isHelpOpen, setIsHelpOpen] = createSignal(false);
  const navigate = useViewTransitionNavigate();
  const { toggleTheme } = useTheme();
  const { toggleLanguage, localizedPath } = useLanguage();

  const openHelp = (): void => {
    setIsHelpOpen(true);
  };
  const closeHelp = (): void => {
    setIsHelpOpen(false);
  };
  const toggleHelp = (): void => {
    setIsHelpOpen((prev) => !prev);
  };

  // Focus search input
  const focusSearch = (): void => {
    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
    searchInput?.focus();
  };

  // Global keyboard event handler
  const handleGlobalKeyDown = (e: KeyboardEvent): void => {
    // Don't handle if in input field (except for Escape and Ctrl/Cmd+K)
    const inInput = isInputFocused();
    const isModifierKey = e.ctrlKey || e.metaKey;

    // Always allow Escape
    if (e.key === 'Escape') {
      if (isHelpOpen()) {
        e.preventDefault();
        closeHelp();
        return;
      }
      // Let other escape handlers work (like search)
      return;
    }

    // Allow Ctrl/Cmd+K even in inputs
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
      return;
    }

    // Don't handle other shortcuts if in input
    if (inInput) return;

    // "/" to focus search (not in inputs)
    if (e.key === '/' && !isModifierKey) {
      e.preventDefault();
      focusSearch();
      return;
    }

    // "?" (Shift + /) to show help
    if (e.key === '?' && e.shiftKey) {
      e.preventDefault();
      toggleHelp();
      return;
    }

    // Single key shortcuts (case-insensitive)
    const key = e.key.toLowerCase();

    switch (key) {
      case 'h':
        if (!e.shiftKey && !isModifierKey) {
          e.preventDefault();
          navigate(localizedPath('/'));
        }
        break;
      case 't':
        if (!e.shiftKey && !isModifierKey) {
          e.preventDefault();
          toggleTheme();
        }
        break;
      case 'l':
        if (!e.shiftKey && !isModifierKey) {
          e.preventDefault();
          toggleLanguage();
        }
        break;
    }
  };

  onMount(() => {
    if (isServer) return;
    document.addEventListener('keydown', handleGlobalKeyDown);
  });

  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener('keydown', handleGlobalKeyDown);
  });

  const value: KeyboardShortcutsContextValue = {
    isHelpOpen,
    openHelp,
    closeHelp,
    toggleHelp,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {props.children}
      <ShortcutsHelpModal isOpen={isHelpOpen()} onClose={closeHelp} />
    </KeyboardShortcutsContext.Provider>
  );
};

/**
 * Hook to access keyboard shortcuts context
 *
 * @returns Keyboard shortcuts context value
 * @throws Error if used outside of KeyboardShortcutsProvider
 */
export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}
