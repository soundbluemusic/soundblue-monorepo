// ========================================
// Keyboard Shortcuts Provider
// ========================================
// Provides global keyboard shortcuts for the application
// Professional DAW-inspired shortcuts (Ableton, Logic, FL Studio)

import { onCleanup, onMount, type ParentComponent } from 'solid-js';
import { isServer } from 'solid-js/web';
import {
  cleanupKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
  initKeyboardShortcuts,
  registerShortcuts,
  toggleShortcutsHelp,
} from '@/hooks/use-keyboard-shortcuts';
import { audioActions, audioStore } from '@/stores/audio-store';
import { toolActions, toolStore } from '@/stores/tool-store';
import { ShortcutsHelpModal } from './shortcuts-help-modal';

// Get the shortcut definition by ID
function getShortcut(id: string) {
  return DEFAULT_SHORTCUTS.find((s) => s.id === id);
}

export const KeyboardShortcutsProvider: ParentComponent = (props) => {
  onMount(() => {
    if (isServer) return;

    // Initialize the keyboard shortcuts system
    initKeyboardShortcuts();

    // Register all shortcuts with their handlers
    const unregister = registerShortcuts([
      // Transport: Play/Stop (Space)
      {
        definition: getShortcut('transport.playStop')!,
        handler: () => {
          // Toggle play state in audio store
          if (audioStore.transport.isPlaying) {
            audioActions.pause();
          } else {
            audioActions.play();
          }

          // Also trigger the current tool's play button if applicable
          // This dispatches a custom event that tools can listen to
          window.dispatchEvent(new CustomEvent('shortcut:playStop'));
        },
      },

      // Transport: Stop & Return (Enter)
      {
        definition: getShortcut('transport.stop')!,
        handler: () => {
          audioActions.stop();
          window.dispatchEvent(new CustomEvent('shortcut:stop'));
        },
      },

      // BPM +1 (ArrowUp)
      {
        definition: getShortcut('bpm.up')!,
        handler: () => {
          const currentBpm = audioStore.transport.bpm;
          audioActions.setBpm(currentBpm + 1);
          updateToolBpm(currentBpm + 1);
        },
      },

      // BPM -1 (ArrowDown)
      {
        definition: getShortcut('bpm.down')!,
        handler: () => {
          const currentBpm = audioStore.transport.bpm;
          audioActions.setBpm(currentBpm - 1);
          updateToolBpm(currentBpm - 1);
        },
      },

      // BPM +10 (Shift+ArrowUp)
      {
        definition: getShortcut('bpm.upLarge')!,
        handler: () => {
          const currentBpm = audioStore.transport.bpm;
          audioActions.setBpm(currentBpm + 10);
          updateToolBpm(currentBpm + 10);
        },
      },

      // BPM -10 (Shift+ArrowDown)
      {
        definition: getShortcut('bpm.downLarge')!,
        handler: () => {
          const currentBpm = audioStore.transport.bpm;
          audioActions.setBpm(currentBpm - 10);
          updateToolBpm(currentBpm - 10);
        },
      },

      // Close Tool (Escape)
      {
        definition: getShortcut('tool.close')!,
        handler: () => {
          if (toolStore.currentTool) {
            toolActions.closeTool();
          }
        },
      },

      // Open Metronome (1)
      {
        definition: getShortcut('tool.metronome')!,
        handler: () => {
          toolActions.openTool('metronome');
        },
      },

      // Open Drum Machine (2)
      {
        definition: getShortcut('tool.drumMachine')!,
        handler: () => {
          toolActions.openTool('drumMachine');
        },
      },

      // Open QR Generator (3)
      {
        definition: getShortcut('tool.qr')!,
        handler: () => {
          toolActions.openTool('qr');
        },
      },

      // Toggle Sidebar (Ctrl+B)
      {
        definition: getShortcut('general.toggleSidebar')!,
        handler: () => {
          toolActions.toggleSidebar();
        },
      },

      // Show Help (?)
      {
        definition: getShortcut('general.help')!,
        handler: () => {
          toggleShortcutsHelp();
        },
      },
    ]);

    onCleanup(() => {
      unregister();
      cleanupKeyboardShortcuts();
    });
  });

  return (
    <>
      {props.children}
      <ShortcutsHelpModal />
    </>
  );
};

/**
 * Update the BPM in the current tool's settings
 */
function updateToolBpm(bpm: number): void {
  const currentTool = toolStore.currentTool;
  if (!currentTool) return;

  // Only update BPM for tools that have BPM setting
  if (currentTool === 'metronome' || currentTool === 'drumMachine') {
    toolActions.updateToolSettings(currentTool, { bpm });
  }
}
