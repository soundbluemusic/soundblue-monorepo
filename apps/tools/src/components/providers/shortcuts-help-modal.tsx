// ========================================
// Shortcuts Help Modal
// ========================================
// Displays all available keyboard shortcuts

import { Keyboard, X } from 'lucide-solid';
import { type Component, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { DEFAULT_SHORTCUTS, type ShortcutDefinition } from '~/hooks/use-keyboard-shortcuts';
import { useTranslations } from '~/i18n';
import { cn } from '~/lib/utils';

// Local signal to track help modal state (synced with the hook)
const [isOpen, setIsOpen] = createSignal(false);

// Listen for toggle events from the hook
if (typeof window !== 'undefined') {
  const originalToggle = () => setIsOpen((prev) => !prev);
  // We'll use a custom event to communicate
  window.addEventListener('shortcut:toggleHelp', originalToggle);
}

// Export for the hook to use
export function toggleHelpModal(): void {
  setIsOpen((prev) => !prev);
}

export function setHelpModalOpen(open: boolean): void {
  setIsOpen(open);
}

// Group shortcuts by category
function groupShortcuts(): Record<string, ShortcutDefinition[]> {
  const groups: Record<string, ShortcutDefinition[]> = {
    transport: [],
    navigation: [],
    tool: [],
    general: [],
  };

  for (const shortcut of DEFAULT_SHORTCUTS) {
    const group = groups[shortcut.category];
    if (group) {
      group.push(shortcut);
    }
  }

  return groups;
}

// Format key for display
function formatKey(key: string): string {
  return key
    .replace('Ctrl+', '⌃ ')
    .replace('Shift+', '⇧ ')
    .replace('Alt+', '⌥ ')
    .replace('Meta+', '⌘ ')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→')
    .replace('Space', '␣ Space')
    .replace('Escape', 'Esc')
    .replace('Enter', '↵ Enter');
}

export const ShortcutsHelpModal: Component = () => {
  const t = useTranslations();
  const groups = groupShortcuts();

  // Category label mapping
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'transport':
        return t().shortcuts.categories.transport;
      case 'navigation':
        return t().shortcuts.categories.navigation;
      case 'tool':
        return t().shortcuts.categories.tool;
      case 'general':
        return t().shortcuts.categories.general;
      default:
        return category;
    }
  };

  // Close on Escape
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    });
  });

  // Close on backdrop click
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <Show when={isOpen()}>
      <Portal>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={t().shortcuts.title}
        >
          <div
            class={cn(
              'relative w-full max-w-lg mx-4',
              'bg-background border border-border rounded-xl shadow-2xl',
              'max-h-[80vh] overflow-hidden flex flex-col',
              'animate-in fade-in zoom-in-95 duration-200',
            )}
          >
            {/* Header */}
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <div class="flex items-center gap-3">
                <Keyboard class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{t().shortcuts.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                class={cn(
                  'p-2 rounded-lg',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-muted transition-colors',
                )}
                aria-label={t().common.close}
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <For each={Object.entries(groups)}>
                {([category, shortcuts]) => (
                  <Show when={shortcuts.length > 0}>
                    <div>
                      <h3 class="text-sm font-medium text-muted-foreground mb-3">
                        {getCategoryLabel(category)}
                      </h3>
                      <div class="space-y-2">
                        <For each={shortcuts}>
                          {(shortcut) => (
                            <div class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <div class="flex flex-col">
                                <span class="text-sm font-medium">{shortcut.name}</span>
                                <span class="text-xs text-muted-foreground">
                                  {shortcut.description}
                                </span>
                              </div>
                              <kbd
                                class={cn(
                                  'inline-flex items-center gap-1 px-2.5 py-1.5',
                                  'text-xs font-mono font-medium',
                                  'bg-muted border border-border rounded-md',
                                  'text-muted-foreground',
                                )}
                              >
                                {formatKey(shortcut.key)}
                              </kbd>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                )}
              </For>
            </div>

            {/* Footer */}
            <div class="px-6 py-4 border-t border-border bg-muted/30">
              <p class="text-xs text-muted-foreground text-center">{t().shortcuts.helpText}</p>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

// Re-export for use in provider
export { isOpen as showHelpModal, setIsOpen as setShowHelpModal };
