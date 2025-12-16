import { createStore } from "solid-js/store";

// ========================================
// UI Store - 사이드바, 패널 상태 관리
// ========================================

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  resultPanelOpen: boolean;
  resultContent: ResultContent | null;
}

export interface ResultContent {
  type: "report" | "info" | "help";
  title: string;
  content: string;
}

const initialState: UIState = {
  sidebarOpen: false,
  sidebarCollapsed: false,
  resultPanelOpen: false,
  resultContent: null,
};

const [uiStore, setUIStore] = createStore<UIState>(initialState);

export const uiActions = {
  // Sidebar
  setSidebarOpen: (open: boolean) => setUIStore("sidebarOpen", open),
  toggleSidebar: () => setUIStore("sidebarOpen", (prev) => !prev),
  setSidebarCollapsed: (collapsed: boolean) => setUIStore("sidebarCollapsed", collapsed),
  toggleSidebarCollapse: () => setUIStore("sidebarCollapsed", (prev) => !prev),

  // Result Panel
  setResultPanelOpen: (open: boolean) => setUIStore("resultPanelOpen", open),
  toggleResultPanel: () => setUIStore("resultPanelOpen", (prev) => !prev),
  setResultContent: (content: ResultContent | null) => {
    setUIStore("resultContent", content);
    if (content) {
      setUIStore("resultPanelOpen", true);
    }
  },
  closeResultPanel: () => {
    setUIStore("resultPanelOpen", false);
    setUIStore("resultContent", null);
  },
};

export { uiStore };
