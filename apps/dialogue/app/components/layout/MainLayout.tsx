import { useCallback, useEffect, useRef, useState } from 'react';
import m from '~/lib/messages';
import { useUIStore } from '~/stores';
import { ChatContainer } from '../chat/ChatContainer';
import { ConversationList } from './ConversationList';
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

export function MainLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'result'>('chat');

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

  // Handle load conversation - trigger load via signal and switch to chat tab on mobile
  const handleLoadConversation = useCallback(() => {
    setChatLoadTrigger((prev) => prev + 1);
    if (isMobile) {
      setActiveTab('chat');
    }
  }, [isMobile]);

  return (
    <div className="flex flex-col h-screen bg-(--color-bg-primary)">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 border-none cursor-default md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label={m['app.closeSidebar']()}
          />
        )}

        {/* Sidebar */}
        <div
          className={[
            'z-50',
            'max-md:fixed max-md:inset-0 max-md:left-0 max-md:pt-14',
            'md:relative',
            isHydrated && 'max-md:transition-transform max-md:duration-300 max-md:ease-in-out',
            !sidebarOpen && 'max-md:-translate-x-full',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Sidebar onNewChat={handleNewChat} onLoadConversation={handleLoadConversation} />
        </div>

        {/* Main Area (Chat + Result Panel) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile: Tab-based view */}
          <div className="flex flex-col flex-1 min-h-[200px] md:hidden">
            {/* Tab Switcher */}
            <div className="flex shrink-0 border-b border-(--color-border-primary) bg-(--color-bg-secondary)">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={[
                  'min-h-[44px] flex-1 py-2 text-sm font-medium text-center bg-none border-none cursor-pointer transition-colors duration-150',
                  activeTab === 'chat'
                    ? 'border-b-2 border-(--color-accent-primary) text-(--color-accent-primary)'
                    : 'text-(--color-text-tertiary)',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {m['app.title']()}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={[
                  'min-h-[44px] flex-1 py-2 text-sm font-medium text-center bg-none border-none cursor-pointer transition-colors duration-150',
                  activeTab === 'history'
                    ? 'border-b-2 border-(--color-accent-primary) text-(--color-accent-primary)'
                    : 'text-(--color-text-tertiary)',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {m['app.history']()}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('result')}
                className={[
                  'min-h-[44px] flex-1 py-2 text-sm font-medium text-center bg-none border-none cursor-pointer transition-colors duration-150',
                  activeTab === 'result'
                    ? 'border-b-2 border-(--color-accent-primary) text-(--color-accent-primary)'
                    : 'text-(--color-text-tertiary)',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {m['app.results']()}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden min-h-[150px]">
              {activeTab === 'chat' && <ChatContainer />}
              {activeTab === 'history' && (
                <div className="h-full p-4 overflow-hidden">
                  <ConversationList
                    onLoadConversation={handleLoadConversation}
                    onNewChat={handleNewChat}
                    isMobile={true}
                  />
                </div>
              )}
              {activeTab === 'result' && <ResultPanel />}
            </div>
          </div>

          {/* Desktop: 2 columns with resizable chat */}
          <div className="hidden md:flex md:flex-1">
            {/* Chat Area */}
            <div
              className="relative shrink-0 border-r border-(--color-border-primary) min-h-[200px]"
              style={{ width: `${chatWidth}px` }}
            >
              <ChatContainer />

              {/* Resize Handle */}
              <div
                onMouseDown={handleResizeStart}
                role="slider"
                aria-orientation="vertical"
                aria-label={m['app.resizeChatPanel']()}
                aria-valuenow={chatWidth}
                aria-valuemin={CHAT_WIDTH.min}
                aria-valuemax={CHAT_WIDTH.max}
                tabIndex={0}
                className="absolute -right-1 top-0 h-full w-3 cursor-col-resize flex items-center justify-center group"
              >
                <div
                  className={[
                    'h-full w-1 transition-colors duration-150',
                    'group-hover:bg-blue-500/30 group-active:bg-blue-500/30',
                    isResizing && 'bg-blue-500/50',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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
      <footer className="border-t border-(--color-border-primary) py-2 px-4 text-center text-xs text-(--color-text-tertiary)">
        <span>{m['app.title']()}</span>
        <span className="mx-2">·</span>
        <span>{m['app.footerDescription']()}</span>
      </footer>
    </div>
  );
}
