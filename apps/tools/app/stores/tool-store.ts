import type { QRSettings, TranslatorSettings } from '@soundblue/ui-components/composite/tool';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ColorDecomposerSettings } from '../tools/color-decomposer/settings';
import type { ColorHarmonySettings } from '../tools/color-harmony/settings';
import type { ColorPaletteSettings } from '../tools/color-palette/settings';
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
  | 'tapTempo'
  | 'colorHarmony'
  | 'colorPalette'
  | 'colorDecomposer';

interface ToolSettings {
  metronome: Partial<MetronomeSettings>;
  qr: Partial<QRSettings>;
  drumMachine: Partial<DrumMachineSettings>;
  delayCalculator: Partial<DelayCalculatorSettings>;
  translator: Partial<TranslatorSettings>;
  spellChecker: Partial<SpellCheckerSettings>;
  englishSpellChecker: Partial<EnglishSpellCheckerSettings>;
  tapTempo: Partial<TapTempoSettings>;
  colorHarmony: Partial<ColorHarmonySettings>;
  colorPalette: Partial<ColorPaletteSettings>;
  colorDecomposer: Partial<ColorDecomposerSettings>;
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

// Default toolSettings - ensure all tools have empty object defaults
const defaultToolSettings: ToolSettings = {
  metronome: {},
  qr: {},
  drumMachine: {},
  delayCalculator: {},
  translator: {},
  spellChecker: {},
  englishSpellChecker: {},
  tapTempo: {},
  colorHarmony: {},
  colorPalette: {},
  colorDecomposer: {},
};

export const useToolStore = create<ToolState>()(
  persist(
    immer((set) => ({
      currentTool: null,
      toolSettings: { ...defaultToolSettings },
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
          // Ensure toolSettings[tool] exists before assigning
          if (!state.toolSettings[tool]) {
            state.toolSettings[tool] = {};
          }
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
      // Deep merge persisted state with default state to handle new tools
      merge: (persistedState, currentState) => {
        // Handle null/undefined persistedState
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const persisted = persistedState as Partial<ToolState>;
        const persistedToolSettings = persisted.toolSettings;

        // Build merged toolSettings safely
        const mergedToolSettings: ToolSettings = { ...defaultToolSettings };
        if (persistedToolSettings && typeof persistedToolSettings === 'object') {
          for (const key of Object.keys(defaultToolSettings) as (keyof ToolSettings)[]) {
            const defaultValue = defaultToolSettings[key] ?? {};
            const persistedValue = persistedToolSettings[key];
            // Use type assertion since we're iterating over known keys
            (mergedToolSettings as unknown as Record<string, object>)[key] = {
              ...defaultValue,
              ...(persistedValue && typeof persistedValue === 'object' ? persistedValue : {}),
            };
          }
        }

        return {
          ...currentState,
          sidebarCollapsed:
            typeof persisted.sidebarCollapsed === 'boolean'
              ? persisted.sidebarCollapsed
              : currentState.sidebarCollapsed,
          toolSettings: mergedToolSettings,
        };
      },
    },
  ),
);
