// ========================================
// Keyboard Shortcuts Hook
// ========================================
// Professional DAW-inspired keyboard shortcuts
// Reference: Ableton Live, Logic Pro, FL Studio, Pro Tools

import { createSignal, onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

/**
 * Shortcut definition
 */
export interface ShortcutDefinition {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Key combination (e.g., 'Space', 'Ctrl+S', 'Shift+ArrowUp') */
  key: string;
  /** Description of what the shortcut does */
  description: string;
  /** Category for grouping in help modal */
  category: 'transport' | 'navigation' | 'tool' | 'general';
  /** Whether the shortcut is enabled */
  enabled?: boolean;
}

/**
 * Parsed key combination
 */
interface KeyCombo {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

/**
 * Parse a key string into components
 */
function parseKeyCombo(keyString: string): KeyCombo {
  const parts = keyString.toLowerCase().split('+');
  const key = parts[parts.length - 1] ?? '';

  return {
    key,
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  };
}

/**
 * Check if a keyboard event matches a key combo
 */
function matchesKeyCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  const eventKey = event.key.toLowerCase();

  // Handle special keys
  const keyMatches =
    eventKey === combo.key ||
    event.code.toLowerCase() === combo.key ||
    event.code.toLowerCase() === `key${combo.key}` ||
    event.code.toLowerCase() === `digit${combo.key}` ||
    // Arrow keys
    (combo.key === 'arrowup' && eventKey === 'arrowup') ||
    (combo.key === 'arrowdown' && eventKey === 'arrowdown') ||
    (combo.key === 'arrowleft' && eventKey === 'arrowleft') ||
    (combo.key === 'arrowright' && eventKey === 'arrowright') ||
    // Space
    (combo.key === 'space' && (eventKey === ' ' || event.code === 'Space')) ||
    // Escape
    (combo.key === 'escape' && eventKey === 'escape') ||
    // Question mark
    (combo.key === '?' && eventKey === '?');

  const modifiersMatch =
    event.ctrlKey === combo.ctrl &&
    event.shiftKey === combo.shift &&
    event.altKey === combo.alt &&
    event.metaKey === combo.meta;

  return keyMatches && modifiersMatch;
}

/**
 * Default keyboard shortcuts - Professional DAW inspired
 */
export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // Transport Controls (Ableton, Logic, FL Studio common)
  {
    id: 'transport.playStop',
    name: 'Play / Stop',
    key: 'Space',
    description: '재생/정지 토글',
    category: 'transport',
  },
  {
    id: 'transport.stop',
    name: 'Stop & Return',
    key: 'Enter',
    description: '정지하고 처음으로 돌아가기',
    category: 'transport',
  },

  // BPM Controls (Ableton-style fine control)
  {
    id: 'bpm.up',
    name: 'BPM +1',
    key: 'ArrowUp',
    description: 'BPM 1 증가',
    category: 'transport',
  },
  {
    id: 'bpm.down',
    name: 'BPM -1',
    key: 'ArrowDown',
    description: 'BPM 1 감소',
    category: 'transport',
  },
  {
    id: 'bpm.upLarge',
    name: 'BPM +10',
    key: 'Shift+ArrowUp',
    description: 'BPM 10 증가',
    category: 'transport',
  },
  {
    id: 'bpm.downLarge',
    name: 'BPM -10',
    key: 'Shift+ArrowDown',
    description: 'BPM 10 감소',
    category: 'transport',
  },

  // Tool Navigation
  {
    id: 'tool.close',
    name: 'Close Tool',
    key: 'Escape',
    description: '현재 도구 닫기',
    category: 'tool',
  },
  {
    id: 'tool.metronome',
    name: 'Metronome',
    key: '1',
    description: '메트로놈 열기',
    category: 'tool',
  },
  {
    id: 'tool.drumMachine',
    name: 'Drum Machine',
    key: '2',
    description: '드럼 머신 열기',
    category: 'tool',
  },
  {
    id: 'tool.qr',
    name: 'QR Generator',
    key: '3',
    description: 'QR 생성기 열기',
    category: 'tool',
  },

  // General
  {
    id: 'general.help',
    name: 'Shortcuts Help',
    key: '?',
    description: '단축키 도움말 표시',
    category: 'general',
  },
  {
    id: 'general.toggleSidebar',
    name: 'Toggle Sidebar',
    key: 'Ctrl+B',
    description: '사이드바 토글',
    category: 'general',
  },
];

export type ShortcutHandler = (event: KeyboardEvent) => void;

interface ShortcutRegistration {
  combo: KeyCombo;
  handler: ShortcutHandler;
  definition: ShortcutDefinition;
}

// Global shortcut registry
const shortcutRegistry = new Map<string, ShortcutRegistration>();
const [isEnabled, setIsEnabled] = createSignal(true);

// Help modal state is managed in shortcuts-help-modal.tsx
// We just dispatch events here
function dispatchHelpToggle(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shortcut:toggleHelp'));
  }
}

/**
 * Check if an element should block keyboard shortcuts
 */
function shouldBlockShortcuts(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  const isEditable = target.isContentEditable;
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

  // Allow shortcuts in input if only modifier keys are involved
  return isInput || isEditable;
}

/**
 * Global keyboard event handler
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (!isEnabled()) return;

  // Check if we should block shortcuts (e.g., when typing in input)
  if (shouldBlockShortcuts(event.target)) {
    // Allow Escape in inputs to blur them
    if (event.key === 'Escape') {
      (event.target as HTMLElement).blur();
    }
    return;
  }

  // Find matching shortcut
  for (const [id, registration] of shortcutRegistry) {
    if (registration.definition.enabled === false) continue;

    if (matchesKeyCombo(event, registration.combo)) {
      event.preventDefault();
      event.stopPropagation();
      registration.handler(event);
      return;
    }
  }
}

/**
 * Initialize keyboard shortcuts system
 */
export function initKeyboardShortcuts(): void {
  if (isServer) return;

  window.addEventListener('keydown', handleKeyDown);
}

/**
 * Cleanup keyboard shortcuts system
 */
export function cleanupKeyboardShortcuts(): void {
  if (isServer) return;

  window.removeEventListener('keydown', handleKeyDown);
  shortcutRegistry.clear();
}

/**
 * Register a keyboard shortcut
 */
export function registerShortcut(
  definition: ShortcutDefinition,
  handler: ShortcutHandler
): () => void {
  const combo = parseKeyCombo(definition.key);

  shortcutRegistry.set(definition.id, {
    combo,
    handler,
    definition,
  });

  // Return unregister function
  return () => {
    shortcutRegistry.delete(definition.id);
  };
}

/**
 * Register multiple shortcuts at once
 */
export function registerShortcuts(
  shortcuts: Array<{ definition: ShortcutDefinition; handler: ShortcutHandler }>
): () => void {
  const unregisterFns = shortcuts.map(({ definition, handler }) =>
    registerShortcut(definition, handler)
  );

  return () => {
    unregisterFns.forEach((unregister) => unregister());
  };
}

/**
 * Get all registered shortcuts
 */
export function getRegisteredShortcuts(): ShortcutDefinition[] {
  return Array.from(shortcutRegistry.values()).map((reg) => reg.definition);
}

/**
 * Enable/disable keyboard shortcuts globally
 */
export function setShortcutsEnabled(enabled: boolean): void {
  setIsEnabled(enabled);
}

/**
 * Show/hide shortcuts help modal
 */
export function toggleShortcutsHelp(): void {
  dispatchHelpToggle();
}

export function setShowShortcutsHelp(show: boolean): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shortcut:setHelp', { detail: show }));
  }
}

/** Return type for useKeyboardShortcuts hook */
export interface UseKeyboardShortcutsReturn {
  isEnabled: typeof isEnabled;
  setEnabled: typeof setShortcutsEnabled;
  toggleHelp: typeof toggleShortcutsHelp;
  setShowHelp: typeof setShowShortcutsHelp;
  register: typeof registerShortcut;
  registerMany: typeof registerShortcuts;
  getShortcuts: typeof getRegisteredShortcuts;
}

/**
 * Hook for using keyboard shortcuts in components
 */
export function useKeyboardShortcuts(): UseKeyboardShortcutsReturn {
  onMount(() => {
    initKeyboardShortcuts();
  });

  onCleanup(() => {
    cleanupKeyboardShortcuts();
  });

  return {
    isEnabled,
    setEnabled: setShortcutsEnabled,
    toggleHelp: toggleShortcutsHelp,
    setShowHelp: setShowShortcutsHelp,
    register: registerShortcut,
    registerMany: registerShortcuts,
    getShortcuts: getRegisteredShortcuts,
  };
}

/**
 * Hook for registering shortcuts that auto-cleanup on component unmount
 */
export function useShortcut(definition: ShortcutDefinition, handler: ShortcutHandler): void {
  onMount(() => {
    const unregister = registerShortcut(definition, handler);
    onCleanup(unregister);
  });
}
