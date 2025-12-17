/**
 * @fileoverview 키보드 단축키 프로바이더 (Keyboard Shortcuts Provider)
 *
 * 앱 전역 키보드 단축키를 관리하고 이벤트를 발행합니다.
 * Professional DAW(Ableton, Logic, FL Studio) 스타일의 단축키를 제공합니다.
 *
 * ## 발행 이벤트 (Custom Events)
 * 각 단축키 실행 시 window에 CustomEvent가 발행되어 도구 컴포넌트가 구독할 수 있습니다.
 *
 * | 이벤트 | 트리거 | 설명 |
 * |--------|--------|------|
 * | `shortcut:playStop` | Space | 재생/일시정지 토글 |
 * | `shortcut:stop` | Enter | 정지 및 처음으로 |
 *
 * @example
 * // 도구 컴포넌트에서 이벤트 구독
 * onMount(() => {
 *   const handlePlayStop = () => {
 *     // 재생/정지 로직
 *   };
 *   window.addEventListener('shortcut:playStop', handlePlayStop);
 *   onCleanup(() => window.removeEventListener('shortcut:playStop', handlePlayStop));
 * });
 *
 * @module keyboard-shortcuts-provider
 */

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
} from '~/hooks/use-keyboard-shortcuts';
import { audioActions, audioStore } from '~/stores/audio-store';
import { toolActions, toolStore } from '~/stores/tool-store';
import { ShortcutsHelpModal } from './shortcuts-help-modal';

/**
 * 단축키 ID로 단축키 정의를 조회합니다.
 *
 * @param {string} id - 단축키 ID (예: 'transport.playStop', 'bpm.up')
 * @returns {ShortcutDefinition | undefined} 단축키 정의 객체 또는 undefined
 *
 * @example
 * const playStopShortcut = getShortcut('transport.playStop');
 * // { id: 'transport.playStop', key: ' ', description: 'Play/Stop', ... }
 */
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
