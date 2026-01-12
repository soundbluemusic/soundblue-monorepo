import type { QRSettings, TranslatorSettings } from '@soundblue/ui-components/composite/tool';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { DelayCalculatorSettings } from '../tools/delay-calculator/settings';
import type { DrumMachineSettings } from '../tools/drum-machine/settings';
import type { EnglishSpellCheckerSettings } from '../tools/english-spell-checker/settings';
import type { MetronomeSettings } from '../tools/metronome/settings';
import type { SpellCheckerSettings } from '../tools/spell-checker/settings';
import type { TapTempoSettings } from '../tools/tap-tempo/settings';

export type ToolType =
  | 'metronome'
  | 'qr'
  | 'drumMachine'
  | 'delayCalculator'
  | 'translator'
  | 'spellChecker'
  | 'englishSpellChecker'
  | 'tapTempo';

interface ToolSettings {
  metronome: Partial<MetronomeSettings>;
  qr: Partial<QRSettings>;
  drumMachine: Partial<DrumMachineSettings>;
  delayCalculator: Partial<DelayCalculatorSettings>;
  translator: Partial<TranslatorSettings>;
  spellChecker: Partial<SpellCheckerSettings>;
  englishSpellChecker: Partial<EnglishSpellCheckerSettings>;
  tapTempo: Partial<TapTempoSettings>;
}

interface ToolState {
  currentTool: ToolType | null;
  toolSettings: ToolSettings;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  // Actions
  openTool: (tool: ToolType) => void;
  closeTool: () => void;
  updateToolSettings: <T extends ToolType>(tool: T, settings: Partial<ToolSettings[T]>) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useToolStore = create<ToolState>()(
  persist(
    immer((set) => ({
      currentTool: null,
      toolSettings: {
        metronome: {},
        qr: {},
        drumMachine: {},
        delayCalculator: {},
        translator: {},
        spellChecker: {},
        englishSpellChecker: {},
        tapTempo: {},
      },
      sidebarOpen: true,
      sidebarCollapsed: false,

      openTool: (tool) =>
        set((state) => {
          state.currentTool = tool;
        }),
      closeTool: () =>
        set((state) => {
          state.currentTool = null;
        }),
      updateToolSettings: (tool, settings) =>
        set((state) => {
          Object.assign(state.toolSettings[tool], settings);
        }),
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),
      toggleSidebarCollapse: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        }),
      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed;
        }),
    })),
    {
      name: 'tool-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        toolSettings: state.toolSettings,
      }),
    },
  ),
);
