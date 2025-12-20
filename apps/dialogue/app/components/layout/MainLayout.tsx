import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '~/i18n';
import { useUIStore } from '~/stores';
import { ChatContainer } from '../chat/ChatContainer';
import { Header } from './Header';
import { ResultPanel } from './ResultPanel';
import { Sidebar } from './Sidebar';

// ========================================
// MainLayout Component - 메인 3열 레이아웃
// ========================================

const BREAKPOINTS = { mobile: 768 };

// Chat panel resize limits (px)
const CHAT_WIDTH = {
  min: 280,
  max: 600,
  default: 360,
} as const;

// Tab button styles
const TAB_BASE_CLASS = 'flex-1 py-3 text-sm font-medium transition-colors text-center';
const TAB_ACTIVE_CLASS =
  'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400';
const TAB_INACTIVE_CLASS = 'text-gray-500 dark:text-gray-400';

export function MainLayout() {
  const { t } = useI18n();
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'result'>('chat');

  // Resizable chat panel
  const [chatWidth, setChatWidth] = useState<number>(CHAT_WIDTH.default);
  const [isResizing, setIsResizing] = useState(false);

  // Chat container triggers
  const [_chatResetTrigger, setChatResetTrigger] = useState(0);
  const [_chatLoadTrigger, setChatLoadTrigger] = useState(0);

  const { sidebarOpen, sidebarCollapsed, resultPanelOpen, setSidebarOpen } = useUIStore();

  // Check screen size
  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
  }, []);

  useEffect(() => {
    checkScreenSize();
    requestAnimationFrame(() => setIsHydrated(true));
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [checkScreenSize]);

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const _handleResizeRef = useRef<{
    move: (e: MouseEvent) => void;
    end: () => void;
  } | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const SIDEBAR_WIDTH = {
      collapsed: 56,
      expanded: 208,
    };

    const handleResizeMove = (e: MouseEvent) => {
      const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
      const newWidth = e.clientX - sidebarWidth;
      const clampedWidth = Math.max(CHAT_WIDTH.min, Math.min(CHAT_WIDTH.max, newWidth));
      setChatWidth(clampedWidth);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, sidebarCollapsed]);

  // Switch to result tab when content is shown
  useEffect(() => {
    if (isMobile && resultPanelOpen) {
      setActiveTab('result');
    }
  }, [isMobile, resultPanelOpen]);

  // Handle new chat - trigger reset via signal
  const handleNewChat = useCallback(() => {
    setChatResetTrigger((prev) => prev + 1);
  }, []);

  // Handle load conversation - trigger load via signal
  const handleLoadConversation = useCallback(() => {
    setChatLoadTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden border-none cursor-default"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <div
          className={`z-50 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:pt-14 md:relative ${
            isHydrated ? 'max-md:transition-transform max-md:duration-200' : ''
          } ${!sidebarOpen ? 'max-md:-translate-x-full' : ''}`}
        >
          <Sidebar onNewChat={handleNewChat} onLoadConversation={handleLoadConversation} />
        </div>

        {/* Main Area (Chat + Result Panel) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile: Tab-based view */}
          <div className="flex flex-1 flex-col min-h-[200px] md:hidden">
            {/* Tab Switcher */}
            <div className="flex shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`${TAB_BASE_CLASS} ${activeTab === 'chat' ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`}
              >
                {t.title}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('result')}
                className={`${TAB_BASE_CLASS} ${activeTab === 'result' ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`}
              >
                {t.aboutInfo || 'Results'}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto min-h-[150px]">
              {activeTab === 'chat' && <ChatContainer />}
              {activeTab === 'result' && <ResultPanel />}
            </div>
          </div>

          {/* Desktop: 2 columns with resizable chat */}
          <div className="hidden md:flex md:flex-1">
            {/* Chat Area */}
            <div
              className="relative shrink-0 border-r border-gray-200 dark:border-gray-700 min-h-[200px]"
              style={{ width: `${chatWidth}px` }}
            >
              <ChatContainer />

              {/* Resize Handle */}
              <div
                onMouseDown={handleResizeStart}
                role="slider"
                aria-orientation="vertical"
                aria-label="Resize chat panel"
                aria-valuenow={chatWidth}
                aria-valuemin={CHAT_WIDTH.min}
                aria-valuemax={CHAT_WIDTH.max}
                tabIndex={0}
                className="absolute -right-1 top-0 h-full w-3 cursor-col-resize flex items-center justify-center group"
              >
                <div
                  className={`h-full w-1 transition-colors duration-150 group-hover:bg-blue-400/30 group-active:bg-blue-400/50 ${
                    isResizing ? 'bg-blue-400/50' : ''
                  }`}
                />
              </div>
            </div>

            {/* Result Panel Area */}
            <div className="flex-1">
              <ResultPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <span>Dialogue</span>
        <span className="mx-2">·</span>
        <span>UI/UX based on web standards</span>
      </footer>
    </div>
  );
}
