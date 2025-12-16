import { type Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
import { ChatContainer } from '@/components/chat';
import { ToolSidebar } from '@/components/sidebar';
import { ToolContainer } from '@/components/tools';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { toolActions, toolStore } from '@/stores/tool-store';
import { Footer } from './Footer';
import { Header } from './Header';

// ========================================
// MainLayout Component - 메인 3열 레이아웃
// ========================================

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 768, // md
} as const;

// Chat panel resize limits (px)
const CHAT_WIDTH: { min: number; max: number; default: number } = {
  min: 240,
  max: 600,
  default: 320,
};

// Sidebar widths (must match Tailwind classes: w-14 = 56px, w-52 = 208px)
const SIDEBAR_WIDTH = {
  collapsed: 56, // w-14
  expanded: 208, // w-52
} as const;

// Tab button base styles (extracted to avoid duplicate cn() calls)
const TAB_BASE_CLASS = 'flex-1 py-3 text-sm font-medium transition-colors text-center';
const TAB_ACTIVE_CLASS = 'border-b-2 border-primary text-primary';
const TAB_INACTIVE_CLASS = 'text-muted-foreground';

export const MainLayout: Component = () => {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'chat' | 'tool'>('chat');

  // Resizable chat panel
  const [chatWidth, setChatWidth] = createSignal(CHAT_WIDTH.default);
  const [isResizing, setIsResizing] = createSignal(false);

  // Check screen size
  const checkScreenSize = () => {
    if (isServer) return;
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
  };

  onMount(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  });

  // Close sidebar when switching to mobile view
  createEffect(() => {
    if (isMobile()) {
      toolActions.setSidebarOpen(false);
    }
  });

  onCleanup(() => {
    if (!isServer) {
      window.removeEventListener('resize', checkScreenSize);
    }
  });

  // Resize handlers
  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing()) return;

    // Calculate new width based on mouse position
    const sidebarWidth = toolStore.sidebarCollapsed
      ? SIDEBAR_WIDTH.collapsed
      : SIDEBAR_WIDTH.expanded;
    const newWidth = e.clientX - sidebarWidth;

    // Clamp to min/max
    const clampedWidth = Math.max(CHAT_WIDTH.min, Math.min(CHAT_WIDTH.max, newWidth));
    setChatWidth(clampedWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Global mouse events for resize
  createEffect(() => {
    if (isServer || !isResizing()) return;

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);

    onCleanup(() => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    });
  });

  // Close mobile sidebar on tool selection
  createEffect(() => {
    if (isMobile() && toolStore.currentTool) {
      toolActions.setSidebarOpen(false);
      setActiveTab('tool');
    }
  });

  // Mobile sidebar overlay
  const showMobileOverlay = () => isMobile() && toolStore.sidebarOpen;

  return (
    <div class="flex h-screen flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main class="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <Show when={showMobileOverlay()}>
          <div
            class="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => toolActions.setSidebarOpen(false)}
          />
        </Show>

        {/* Sidebar */}
        <div
          class={cn(
            'z-50',
            // Mobile: fixed overlay
            isMobile() && 'fixed inset-y-0 left-0 pt-14 transition-transform duration-200',
            isMobile() && !toolStore.sidebarOpen && '-translate-x-full',
            // Desktop: static
            !isMobile() && 'relative'
          )}
        >
          <ToolSidebar />
        </div>

        {/* Main Area (Chat + Tool) */}
        <div class="flex flex-1 overflow-hidden">
          {/* Mobile: Tab-based view */}
          <Show when={isMobile()}>
            <div class="flex flex-1 flex-col min-h-[200px]">
              {/* Tab Switcher */}
              <div class="flex shrink-0 border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  class={cn(
                    TAB_BASE_CLASS,
                    activeTab() === 'chat' ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS
                  )}
                >
                  {t().chat.title}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tool')}
                  class={cn(
                    TAB_BASE_CLASS,
                    activeTab() === 'tool' ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS
                  )}
                >
                  {t().sidebar.tools}
                </button>
              </div>

              {/* Tab Content */}
              <div class="flex-1 overflow-auto min-h-[150px]">
                <Show when={activeTab() === 'chat'}>
                  <ChatContainer />
                </Show>
                <Show when={activeTab() === 'tool'}>
                  <ToolContainer />
                </Show>
              </div>
            </div>
          </Show>

          {/* Tablet & Desktop: 2 columns with resizable chat */}
          <Show when={!isMobile()}>
            {/* Chat Area */}
            <div
              class="relative flex-shrink-0 border-r min-h-[200px]"
              style={{ width: `${chatWidth()}px` }}
            >
              <ChatContainer />

              {/* Resize Handle - wider hit area for easier dragging */}
              <div
                onMouseDown={handleResizeStart}
                class={cn(
                  'absolute -right-1 top-0 h-full w-3 cursor-col-resize',
                  'flex items-center justify-center',
                  'group'
                )}
              >
                <div
                  class={cn(
                    'h-full w-1 transition-colors duration-150',
                    'group-hover:bg-primary/30 group-active:bg-primary/50',
                    isResizing() && 'bg-primary/50'
                  )}
                />
              </div>
            </div>

            {/* Tool Area */}
            <div class="flex-1">
              <ToolContainer />
            </div>
          </Show>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
