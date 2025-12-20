'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { ToolSidebar } from '~/components/sidebar';
import { cn } from '~/lib/utils';
import { useToolStore } from '~/stores/tool-store';
import { Header } from './Header';

const BREAKPOINT_MOBILE = 768;

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { sidebarOpen, setSidebarOpen, currentTool } = useToolStore();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < BREAKPOINT_MOBILE);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  // Close mobile sidebar on tool selection
  useEffect(() => {
    if (isMobile && currentTool) {
      setSidebarOpen(false);
    }
  }, [isMobile, currentTool, setSidebarOpen]);

  const showMobileOverlay = isMobile && sidebarOpen;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {showMobileOverlay && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden border-none cursor-default"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'z-50',
            isMobile && 'fixed inset-y-0 left-0 pt-14 transition-transform duration-200',
            isMobile && !sidebarOpen && '-translate-x-full',
            !isMobile && 'relative',
          )}
        >
          <ToolSidebar />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
