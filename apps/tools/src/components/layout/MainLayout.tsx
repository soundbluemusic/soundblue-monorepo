import { BREAKPOINTS, Footer } from '@soundblue/shared';
import { type Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
import { ToolSidebar } from '~/components/sidebar';
import { ToolContainer } from '~/components/tools';
import { cn } from '~/lib/utils';
import { toolActions, toolStore } from '~/stores/tool-store';
import { Header } from './Header';

// ========================================
// MainLayout Component - 메인 2열 레이아웃 (사이드바 + 도구)
// ========================================

export const MainLayout: Component = () => {
  const [isMobile, setIsMobile] = createSignal(false);

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

  // Close mobile sidebar on tool selection
  createEffect(() => {
    if (isMobile() && toolStore.currentTool) {
      toolActions.setSidebarOpen(false);
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
          <button
            type="button"
            class="fixed inset-0 z-40 bg-black/50 md:hidden border-none cursor-default"
            onClick={() => toolActions.setSidebarOpen(false)}
            aria-label="Close sidebar"
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
            !isMobile() && 'relative',
          )}
        >
          <ToolSidebar />
        </div>

        {/* Tool Area */}
        <div class="flex-1 overflow-auto">
          <ToolContainer />
        </div>
      </main>

      {/* Footer */}
      <Footer appName="Tools" tagline="UI/UX based on web standards" />
    </div>
  );
};
