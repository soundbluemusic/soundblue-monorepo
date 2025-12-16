import { createStore } from 'solid-js/store';
import type { DrumMachineSettings } from '@/tools/drum-machine';
import type { MetronomeSettings } from '@/tools/metronome';
import type { QRSettings } from '@/tools/qr-generator';
import type { TranslatorSettings } from '@/tools/translator';

// ========================================
// Tool Store - 현재 활성 도구 상태 관리
// ========================================

export type ToolType = 'metronome' | 'qr' | 'drumMachine' | 'translator';

export interface ToolState {
  currentTool: ToolType | null;
  toolSettings: {
    metronome: Partial<MetronomeSettings>;
    qr: Partial<QRSettings>;
    drumMachine: Partial<DrumMachineSettings>;
    translator: Partial<TranslatorSettings>;
  };
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

const initialState: ToolState = {
  currentTool: null,
  toolSettings: {
    metronome: {},
    qr: {},
    drumMachine: {},
    translator: {},
  },
  sidebarOpen: true,
  sidebarCollapsed: false,
};

// Create the store
const [toolStore, setToolStore] = createStore<ToolState>(initialState);

/** Tool action methods with explicit return types */
export interface ToolActions {
  openTool: (tool: ToolType) => void;
  closeTool: () => void;
  updateToolSettings: <T extends ToolType>(
    tool: T,
    settings: Partial<ToolState['toolSettings'][T]>
  ) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// Actions
export const toolActions: ToolActions = {
  openTool: (tool: ToolType): void => {
    setToolStore('currentTool', tool);
  },

  closeTool: (): void => {
    setToolStore('currentTool', null);
  },

  updateToolSettings: <T extends ToolType>(
    tool: T,
    settings: Partial<ToolState['toolSettings'][T]>
  ): void => {
    setToolStore('toolSettings', tool, (prev) => ({ ...prev, ...settings }));
  },

  toggleSidebar: (): void => {
    setToolStore('sidebarOpen', (prev) => !prev);
  },

  setSidebarOpen: (open: boolean): void => {
    setToolStore('sidebarOpen', open);
  },

  toggleSidebarCollapse: (): void => {
    setToolStore('sidebarCollapsed', (prev) => !prev);
  },

  setSidebarCollapsed: (collapsed: boolean): void => {
    setToolStore('sidebarCollapsed', collapsed);
  },
};

// Export store and selectors
export { toolStore, setToolStore };

// Selector functions
export const useCurrentTool = (): ToolType | null => toolStore.currentTool;
export const useToolSettings = <T extends ToolType>(tool: T): ToolState['toolSettings'][T] =>
  toolStore.toolSettings[tool];
export const useSidebarOpen = (): boolean => toolStore.sidebarOpen;
export const useSidebarCollapsed = (): boolean => toolStore.sidebarCollapsed;
