import { useCallback, useEffect, useRef, useState } from 'react';
import m from '~/lib/messages';
import { createWelcomeMessage, useChatStore, useUIStore } from '~/stores';
import { ChatContainer } from '../chat/ChatContainer';
import { ConversationList } from './ConversationList';
import { Footer } from './Footer';
import { Header } from './Header';
import { ResultPanel } from './ResultPanel';
import { Sidebar } from './Sidebar';

// ========================================
// MainLayout Component - 메인 3열 레이아웃
// ========================================

const BREAKPOINTS = { mobile: 768, tablet: 1024 };

// Chat panel resize limits (px)
const CHAT_WIDTH = {
  min: 280,
  max: 600,
  default: 360,
} as const;

// Result panel minimum width (px)
const RESULT_MIN_WIDTH = 280;

// Sidebar widths (px)
const SIDEBAR_WIDTH = {
  collapsed: 56,
  expanded: 256,
} as const;

export function MainLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'result'>('chat');

  // Resizable chat panel
  const [chatWidth, setChatWidth] = useState<number>(CHAT_WIDTH.default);
  const [isResizing, setIsResizing] = useState(false);

  // Container width for dynamic calculations
  const [containerWidth, setContainerWidth] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const { sidebarOpen, sidebarCollapsed, resultPanelOpen, setSidebarOpen } = useUIStore();
  const { clearActive, createConversation } = useChatStore();

  // Check screen size
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < BREAKPOINTS.mobile);
    setIsTablet(width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet);
  }, []);

  // Track container width for dynamic chat max width calculation
  useEffect(() => {
    const updateContainerWidth = () => {
      if (mainRef.current) {
        setContainerWidth(mainRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  useEffect(() => {
    checkScreenSize();
    requestAnimationFrame(() => setIsHydrated(true));
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [checkScreenSize]);

  // Calculate dynamic max chat width to ensure Result Panel has minimum space
  const availableWidth = containerWidth > 0 ? containerWidth : 800; // fallback
  // Result panel needs at least 250px to be usable
  const MIN_RESULT_WIDTH = 250;

  const dynamicMaxChatWidth = Math.max(
    CHAT_WIDTH.min,
    Math.min(CHAT_WIDTH.max, availableWidth - MIN_RESULT_WIDTH),
  );

  // Clamp current chatWidth if it exceeds new max
  useEffect(() => {
    if (chatWidth > dynamicMaxChatWidth) {
      setChatWidth(dynamicMaxChatWidth);
    }
    // Also ensure it's not smaller than min
    if (chatWidth < CHAT_WIDTH.min) {
      setChatWidth(CHAT_WIDTH.min);
    }
  }, [dynamicMaxChatWidth, chatWidth]);

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

    const handleResizeMove = (e: MouseEvent) => {
      const currentSidebarWidth = sidebarCollapsed
        ? SIDEBAR_WIDTH.collapsed
        : SIDEBAR_WIDTH.expanded;
      const newWidth = e.clientX - currentSidebarWidth;
      const clampedWidth = Math.max(CHAT_WIDTH.min, Math.min(dynamicMaxChatWidth, newWidth));
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
  }, [isResizing, sidebarCollapsed, dynamicMaxChatWidth]);

  // Switch to result tab when content is shown
  useEffect(() => {
    if (isMobile && resultPanelOpen) {
      setActiveTab('result');
    }
  }, [isMobile, resultPanelOpen]);

  // Handle new chat - clear active and create new conversation
  const handleNewChat = useCallback(() => {
    clearActive();
    createConversation(createWelcomeMessage(m['app.welcome']()));
    if (isMobile) {
      setActiveTab('chat');
    }
  }, [clearActive, createConversation, isMobile]);

  // Handle load conversation - switch to chat tab on mobile
  const handleLoadConversation = useCallback(() => {
    if (isMobile) {
      setActiveTab('chat');
    }
  }, [isMobile]);

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg-primary)]">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-accent-primary)] focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Header - fixed height */}
      <Header />

      {/* Main Content - Fixed height to push footer below fold */}
      <main
        id="main-content"
        className="flex flex-row h-[calc(100dvh-var(--header-height))] overflow-hidden shrink-0"
      >
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
            'max-md:fixed max-md:inset-0 max-md:left-0 max-md:pt-[var(--header-height)]',
            'md:relative',
            isHydrated && 'sidebar-transition',
            !sidebarOpen && 'max-md:-translate-x-full',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Sidebar onNewChat={handleNewChat} onLoadConversation={handleLoadConversation} />
        </div>

        {/* Main Area (Chat + Result Panel) - 조건부 렌더링으로 DOM 중복 방지 */}
        <div ref={mainRef} className="flex flex-1 min-h-0 overflow-hidden">
          {isMobile ? (
            /* Mobile: Tab-based view - 조건부 렌더링 */
            <div className="flex flex-col flex-1 min-h-0">
              {/* Tab Switcher */}
              <div className="flex shrink-0 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={[
                    'min-h-[44px] min-w-[80px] flex-1 py-2 text-sm font-medium text-center bg-none border-none cursor-pointer transition-colors duration-150',
                    activeTab === 'chat'
                      ? 'border-b-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-tertiary)]',
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
                    'min-h-[44px] min-w-[80px] flex-1 py-2 text-sm font-medium text-center bg-none border-none cursor-pointer transition-colors duration-150',
                    activeTab === 'history'
                      ? 'border-b-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-tertiary)]',
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
                    'min-h-[44px] min-w-[80px] flex-1 py-2 text-sm font-medium text-center bg-none border-none cursor-pointer transition-colors duration-150',
                    activeTab === 'result'
                      ? 'border-b-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-tertiary)]',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {m['app.results']()}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-h-0 overflow-hidden h-full">
                {activeTab === 'chat' && <ChatContainer />}
                {activeTab === 'history' && (
                  <div className="h-full p-4 overflow-auto">
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
          ) : (
            /* Desktop: 2 columns with resizable chat */
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Chat Area - width controlled by chatWidth state */}
              <div
                className="relative shrink-0 border-r border-[var(--color-border-primary)] min-h-0 h-full flex flex-col"
                style={{ width: chatWidth }}
              >
                <ChatContainer />

                {/* Resize Handle */}
                <button
                  type="button"
                  onMouseDown={handleResizeStart}
                  aria-label={m['app.resizeChatPanel']()}
                  className="absolute -right-1 top-0 h-full w-3 cursor-col-resize flex items-center justify-center group bg-transparent border-none p-0 z-10"
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
                </button>
              </div>

              {/* Result Panel Area */}
              <div className="flex-1 min-w-0 min-h-0 bg-[var(--color-bg-secondary)] relative">
                {/* Remove hard min-width constraint that causes overflow, handle specialized min-width via grid or internal scrolling if needed */}
                <div className="h-full w-full overflow-hidden">
                  <ResultPanel isCompact={isTablet || containerWidth < 800} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Visible only when scrolling past the main content */}
      <Footer className="shrink-0 z-10 relative" />
    </div>
  );
}
