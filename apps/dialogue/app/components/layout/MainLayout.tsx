import { useCallback, useEffect, useRef, useState } from 'react';
import m from '~/lib/messages';
import { useUIStore } from '~/stores';
import { ChatContainer } from '../chat/ChatContainer';
import { ConversationList } from './ConversationList';
import { Header } from './Header';
import styles from './MainLayout.module.scss';
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
    <div className={styles.layout}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={styles.main}>
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <button
            type="button"
            className={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
            aria-label={m['app.closeSidebar']()}
          />
        )}

        {/* Sidebar */}
        <div
          className={[
            styles.sidebarContainer,
            isHydrated && styles.sidebarHydrated,
            !sidebarOpen && styles.sidebarHidden,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Sidebar onNewChat={handleNewChat} onLoadConversation={handleLoadConversation} />
        </div>

        {/* Main Area (Chat + Result Panel) */}
        <div className={styles.mainArea}>
          {/* Mobile: Tab-based view */}
          <div className={styles.mobileTabView}>
            {/* Tab Switcher */}
            <div className={styles.tabSwitcher}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={[
                  styles.tabButton,
                  activeTab === 'chat' ? styles.tabActive : styles.tabInactive,
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
                  styles.tabButton,
                  activeTab === 'history' ? styles.tabActive : styles.tabInactive,
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
                  styles.tabButton,
                  activeTab === 'result' ? styles.tabActive : styles.tabInactive,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {m['app.results']()}
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'chat' && <ChatContainer />}
              {activeTab === 'history' && (
                <div className={styles.historyPanel}>
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
          <div className={styles.desktopView}>
            {/* Chat Area */}
            <div className={styles.chatPanel} style={{ width: `${chatWidth}px` }}>
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
                className={styles.resizeHandle}
              >
                <div
                  className={[styles.resizeBar, isResizing && styles.resizeBarActive]
                    .filter(Boolean)
                    .join(' ')}
                />
              </div>
            </div>

            {/* Result Panel Area */}
            <div className={styles.resultArea}>
              <ResultPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>{m['app.title']()}</span>
        <span className={styles.footerSeparator}>·</span>
        <span>{m['app.footerDescription']()}</span>
      </footer>
    </div>
  );
}
