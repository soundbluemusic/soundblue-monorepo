'use client';

import { useEffect, useState } from 'react';
import { ToolSidebar } from '~/components/sidebar';
import { ToolContainer } from '~/components/tools';
import { useToolStore } from '~/stores/tool-store';
import { Footer } from './Footer';
import { Header } from './Header';

const BREAKPOINT_MOBILE = 768;

// ========================================
// MainLayout Component - 메인 2열 레이아웃 (사이드바 + 도구)
// ========================================

export function MainLayout() {
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

  const sidebarClasses = [
    'z-50',
    isMobile
      ? `fixed inset-0 left-0 pt-14 transition-transform duration-200 ${!sidebarOpen ? '-translate-x-full' : ''}`
      : 'relative',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex h-screen flex-col bg-(--background)">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {showMobileOverlay && (
          <button
            type="button"
            className="fixed inset-0 z-40 border-none bg-black/50 cursor-default md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <div className={sidebarClasses}>
          <ToolSidebar />
        </div>

        {/* Tool Area */}
        <div className="flex-1 overflow-auto">
          <ToolContainer />
        </div>
      </main>

      {/* Footer */}
      <Footer appName="Tools" tagline="UI/UX based on web standards" />
    </div>
  );
}
