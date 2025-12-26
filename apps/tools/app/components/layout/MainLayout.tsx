'use client';

import { useEffect, useState } from 'react';
import { ToolSidebar } from '~/components/sidebar';
import { ToolContainer } from '~/components/tools';
import { useToolStore } from '~/stores/tool-store';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './MainLayout.module.scss';

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
    styles.sidebarWrapper,
    isMobile ? styles.mobile : styles.desktop,
    isMobile && !sidebarOpen ? styles.closed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={styles.main}>
        {/* Mobile Sidebar Overlay */}
        {showMobileOverlay && (
          <button
            type="button"
            className={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <div className={sidebarClasses}>
          <ToolSidebar />
        </div>

        {/* Tool Area */}
        <div className={styles.toolArea}>
          <ToolContainer />
        </div>
      </main>

      {/* Footer */}
      <Footer appName="Tools" tagline="UI/UX based on web standards" />
    </div>
  );
}
