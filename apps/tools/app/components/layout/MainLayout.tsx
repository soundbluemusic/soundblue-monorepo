'use client';

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

  return (
    <div className="flex h-screen flex-col bg-(--background)">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay - CSS로 md 이상에서 숨김 */}
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 border-none bg-black/50 cursor-default md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar - 모바일: 슬라이드, 데스크톱: 고정 */}
        <div
          className={`z-40 bg-(--card) md:relative md:inset-auto fixed top-14 bottom-0 left-0 w-fit transition-transform duration-200 md:translate-x-0 ${
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
