'use client';

import { useEffect } from 'react';

import { ToolSidebar } from '~/components/sidebar';
import { ToolContainer } from '~/components/tools';
import { useToolStore } from '~/stores/tool-store';
import { Footer } from './Footer';
import { Header } from './Header';

// ========================================
// MainLayout Component - 메인 2열 레이아웃 (사이드바 + 도구)
// CSS 미디어 쿼리로 반응형 처리 (JS resize listener 제거)
// ========================================

export function MainLayout() {
  const { sidebarOpen, setSidebarOpen } = useToolStore();

  // Resize listener: 화면 크기가 줄어들면 사이드바 자동 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay - CSS로 md 이상에서 숨김 */}
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default border-none bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar - 모바일: 슬라이드, 데스크톱: 고정 */}
        <div
          className={`fixed bottom-0 left-0 top-14 z-40 w-fit bg-card transition-transform duration-200 md:relative md:inset-auto md:translate-x-0 ${
            !sidebarOpen ? '-translate-x-full md:translate-x-0' : ''
          }`}
        >
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
