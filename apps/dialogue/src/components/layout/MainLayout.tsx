import { Component, createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { useI18n } from "~/i18n";
import { uiActions, uiStore } from "~/stores/ui-store";
import { ChatContainer } from "../chat/ChatContainer";
import { AppSidebar } from "./AppSidebar";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ResultPanel } from "./ResultPanel";

// ========================================
// MainLayout Component - 메인 3열 레이아웃
// ========================================

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 768, // md
} as const;

// Chat panel resize limits (px)
const CHAT_WIDTH = {
  min: 280,
  max: 600,
  default: 360,
} as const;

// Sidebar widths
const SIDEBAR_WIDTH = {
  collapsed: 56, // w-14
  expanded: 208, // w-52
} as const;

// Tab button styles
const TAB_BASE_CLASS = "flex-1 py-3 text-sm font-medium transition-colors text-center";
const TAB_ACTIVE_CLASS = "border-b-2 border-accent text-accent";
const TAB_INACTIVE_CLASS = "text-text-muted";

export const MainLayout: Component = () => {
  const { t } = useI18n();
  const [isMobile, setIsMobile] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<"chat" | "result">("chat");

  // Resizable chat panel
  const [chatWidth, setChatWidth] = createSignal(CHAT_WIDTH.default);
  const [isResizing, setIsResizing] = createSignal(false);

  // Chat container ref for new chat
  let chatContainerRef: any;

  // Check screen size
  const checkScreenSize = () => {
    if (isServer) return;
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
  };

  onMount(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
  });

  // Close sidebar when switching to mobile
  createEffect(() => {
    if (isMobile()) {
      uiActions.setSidebarOpen(false);
    }
  });

  onCleanup(() => {
    if (!isServer) {
      window.removeEventListener("resize", checkScreenSize);
    }
  });

  // Resize handlers
  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing()) return;

    const sidebarWidth = uiStore.sidebarCollapsed
      ? SIDEBAR_WIDTH.collapsed
      : SIDEBAR_WIDTH.expanded;
    const newWidth = e.clientX - sidebarWidth;

    const clampedWidth = Math.max(CHAT_WIDTH.min, Math.min(CHAT_WIDTH.max, newWidth));
    setChatWidth(clampedWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Global mouse events for resize
  createEffect(() => {
    if (isServer || !isResizing()) return;

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);

    onCleanup(() => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    });
  });

  // Switch to result tab when content is shown
  createEffect(() => {
    if (isMobile() && uiStore.resultPanelOpen) {
      setActiveTab("result");
    }
  });

  // Mobile sidebar overlay
  const showMobileOverlay = () => isMobile() && uiStore.sidebarOpen;

  // Handle new chat
  const handleNewChat = () => {
    // Reset chat through ChatContainer
    if (chatContainerRef?.handleNewChat) {
      chatContainerRef.handleNewChat();
    }
  };

  return (
    <div class="flex h-screen flex-col bg-bg-primary">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main class="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <Show when={showMobileOverlay()}>
          <div
            class="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => uiActions.setSidebarOpen(false)}
          />
        </Show>

        {/* Sidebar */}
        <div
          class="z-50"
          classList={{
            "fixed inset-y-0 left-0 pt-14 transition-transform duration-200": isMobile(),
            "-translate-x-full": isMobile() && !uiStore.sidebarOpen,
            relative: !isMobile(),
          }}
        >
          <AppSidebar onNewChat={handleNewChat} />
        </div>

        {/* Main Area (Chat + Result Panel) */}
        <div class="flex flex-1 overflow-hidden">
          {/* Mobile: Tab-based view */}
          <Show when={isMobile()}>
            <div class="flex flex-1 flex-col min-h-[200px]">
              {/* Tab Switcher */}
              <div class="flex shrink-0 border-b border-border bg-bg-secondary">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  class={`${TAB_BASE_CLASS} ${activeTab() === "chat" ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`}
                >
                  {t.title}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("result")}
                  class={`${TAB_BASE_CLASS} ${activeTab() === "result" ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`}
                >
                  {t.aboutInfo || "Results"}
                </button>
              </div>

              {/* Tab Content */}
              <div class="flex-1 overflow-auto min-h-[150px]">
                <Show when={activeTab() === "chat"}>
                  <ChatContainer ref={chatContainerRef} onNewChat={handleNewChat} />
                </Show>
                <Show when={activeTab() === "result"}>
                  <ResultPanel />
                </Show>
              </div>
            </div>
          </Show>

          {/* Desktop: 2 columns with resizable chat */}
          <Show when={!isMobile()}>
            {/* Chat Area */}
            <div
              class="relative flex-shrink-0 border-r border-border min-h-[200px]"
              style={{ width: `${chatWidth()}px` }}
            >
              <ChatContainer ref={chatContainerRef} onNewChat={handleNewChat} />

              {/* Resize Handle */}
              <div
                onMouseDown={handleResizeStart}
                class="absolute -right-1 top-0 h-full w-3 cursor-col-resize flex items-center justify-center group"
              >
                <div
                  class="h-full w-1 transition-colors duration-150 group-hover:bg-accent/30 group-active:bg-accent/50"
                  classList={{ "bg-accent/50": isResizing() }}
                />
              </div>
            </div>

            {/* Result Panel Area */}
            <div class="flex-1">
              <ResultPanel />
            </div>
          </Show>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
