'use client';

import { useEffect } from 'react';
import { ToolSidebar } from '~/components/sidebar';
import { ToolContainer } from '~/components/tools';
import { type ToolType, useToolStore } from '~/stores/tool-store';
import { BottomNavigation } from '../home/BottomNavigation';
import { CategorySection } from '../home/CategorySection';
import { NewUpdatedSection } from '../home/NewUpdatedSection';
import { PopularToolsSection } from '../home/PopularToolsSection';
import { Footer } from './Footer';
import { Header } from './Header';

// ========================================
// MainLayout Component - Sound Blue Style
// ========================================

interface MainLayoutProps {
  /** Default tool to display - used for SSG to avoid flash of home screen */
  defaultTool?: ToolType;
}

export function MainLayout({ defaultTool }: MainLayoutProps) {
  const { sidebarCollapsed, currentTool, openTool } = useToolStore();

  // Sync store with defaultTool prop (for navigation and sidebar state)
  useEffect(() => {
    if (defaultTool && currentTool !== defaultTool) {
      openTool(defaultTool);
    }
  }, [defaultTool, currentTool, openTool]);

  // Use defaultTool for initial render, then sync with store
  const activeTool = currentTool ?? defaultTool;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Fixed Header */}
      <Header />

      {/* Desktop Sidebar */}
      <ToolSidebar />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`main-content-transition pt-[var(--header-height)] pb-4 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
          sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
        } max-md:ml-0`}
      >
        {activeTool ? (
          // Tool is open - show ToolContainer
          <div className="h-[calc(100vh-var(--header-height)-16px)] max-md:h-[calc(100vh-52px-var(--bottom-nav-height)-16px)]">
            <ToolContainer tool={activeTool} />
          </div>
        ) : (
          // No tool open - show tool list (for when X button is clicked)
          <div className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-6">
              <PopularToolsSection onToolClick={openTool} />
              {/* Mobile only sections */}
              <div className="md:hidden space-y-6">
                <CategorySection />
                <NewUpdatedSection onToolClick={openTool} />
              </div>
            </div>
          </div>
        )}

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
