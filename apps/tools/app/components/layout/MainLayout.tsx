'use client';

import { ToolSidebar } from '~/components/sidebar';
import { ToolContainer } from '~/components/tools';
import { useToolStore } from '~/stores/tool-store';
import { BottomNavigation } from '../home/BottomNavigation';
import { Footer } from './Footer';
import { Header } from './Header';

// ========================================
// MainLayout Component - Sound Blue Style
// ========================================

export function MainLayout() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <div className="min-h-screen bg-(--color-bg-primary) text-(--color-text-primary)">
      {/* Fixed Header */}
      <Header />

      {/* Desktop Sidebar */}
      <ToolSidebar />

      {/* Main Content Area */}
      <main
        className={`pt-(--header-height) pb-4 transition-[padding] duration-150 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
          sidebarCollapsed ? 'pl-[var(--sidebar-collapsed-width)]' : 'pl-[var(--sidebar-width)]'
        } max-md:pl-0`}
      >
        <div className="h-[calc(100vh-var(--header-height)-16px)] max-md:h-[calc(100vh-52px-var(--bottom-nav-height)-16px)]">
          <ToolContainer />
        </div>

        {/* Desktop Footer */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
