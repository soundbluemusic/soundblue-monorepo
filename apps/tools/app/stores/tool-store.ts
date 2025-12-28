import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ToolType = 'metronome' | 'qr' | 'drumMachine' | 'translator';

interface ToolSettings {
  metronome: Record<string, unknown>;
  qr: Record<string, unknown>;
  drumMachine: Record<string, unknown>;
  translator: Record<string, unknown>;
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
        translator: {},
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
