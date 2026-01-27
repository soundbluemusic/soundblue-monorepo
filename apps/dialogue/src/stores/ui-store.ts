import { create } from 'zustand';

// ========================================
// UI Store - 사이드바, 패널 상태 관리
// ========================================

/** 사용 가능한 도구 타입 */
export type ToolType = 'translator' | 'qr-generator';

export interface ResultContent {
  type: 'report' | 'info' | 'help' | 'tool';
  title: string;
  content: string;
  /** tool 타입일 때 어떤 도구인지 */
  tool?: ToolType;
  /** translator 도구일 때 초기 입력 텍스트 */
  initialText?: string;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  resultPanelOpen: boolean;
  resultContent: ResultContent | null;
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;
  setResultPanelOpen: (open: boolean) => void;
  toggleResultPanel: () => void;
  setResultContent: (content: ResultContent | null) => void;
  closeResultPanel: () => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  // Initial state
  sidebarOpen: false,
  sidebarCollapsed: false,
  resultPanelOpen: false,
  resultContent: null,

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setResultPanelOpen: (open) => set({ resultPanelOpen: open }),
  toggleResultPanel: () => set((state) => ({ resultPanelOpen: !state.resultPanelOpen })),
  setResultContent: (content) =>
    set({
      resultContent: content,
      resultPanelOpen: content !== null,
    }),
  closeResultPanel: () =>
    set({
      resultPanelOpen: false,
      resultContent: null,
    }),
}));
