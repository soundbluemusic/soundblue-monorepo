import { getLocaleFromPath, getLocalizedPath, useTheme } from '@soundblue/shared-react';
import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import m from '~/lib/messages';
import type { Conversation } from '~/stores';
import { useChatStore, useUIStore } from '~/stores';

// ========================================
// Sidebar Component - 메인 사이드바
// ========================================

const HOVER_STYLES =
  'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400';
const FOCUS_STYLES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1';
const MENU_ITEM_CLASS = `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${HOVER_STYLES} ${FOCUS_STYLES}`;

interface SidebarProps {
  onNewChat: () => void;
  onLoadConversation?: () => void;
}

export function Sidebar({ onNewChat, onLoadConversation }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';
  const { resolvedTheme, toggleTheme } = useTheme();

  const {
    conversations,
    activeConversationId,
    ghostMode,
    isHydrated,
    toggleGhostMode,
    loadConversation,
    deleteConversation,
  } = useChatStore();

  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  const [moreExpanded, setMoreExpanded] = useState(false);

  const languages: { code: 'en' | 'ko'; label: string; flag: string }[] = [
    { code: 'en', label: m['app.english'](), flag: 'EN' },
    { code: 'ko', label: m['app.korean'](), flag: 'KO' },
  ];

  const handleLanguageChange = useCallback(
    (newLocale: 'en' | 'ko') => {
      const currentPath = location.pathname.replace(/^\/(ko|en)/, '') || '/';
      const newPath = getLocalizedPath(currentPath, newLocale);
      navigate(newPath);
    },
    [location.pathname, navigate],
  );

  const getAboutUrl = () => getLocalizedPath('/about', locale);

  const handleLoadConversation = useCallback(
    (conv: Conversation) => {
      loadConversation(conv.id);
      onLoadConversation?.();
    },
    [loadConversation, onLoadConversation],
  );

  const handleDeleteConversation = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      deleteConversation(id);
    },
    [deleteConversation],
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <aside
      className={`flex h-full flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 ${
        sidebarCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-gray-200 dark:border-gray-700 px-3 py-3 ${
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!sidebarCollapsed && (
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {m['app.history']()}
          </h2>
        )}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className={`p-1.5 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 ${HOVER_STYLES}`}
          aria-label={sidebarCollapsed ? m['app.expandSidebar']() : m['app.collapseSidebar']()}
        >
          {sidebarCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className={`w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title={sidebarCollapsed ? m['app.newChat']() : undefined}
        >
          <PlusIcon />
          {!sidebarCollapsed && <span>{m['app.newChat']()}</span>}
        </button>

        {/* Ghost Mode Toggle */}
        <button
          type="button"
          onClick={toggleGhostMode}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
            sidebarCollapsed ? 'justify-center' : ''
          } ${
            ghostMode
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={sidebarCollapsed ? m['app.ghostMode']() : undefined}
        >
          <GhostIcon />
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="font-medium">{m['app.ghostMode']()}</div>
                {ghostMode && <div className="text-xs opacity-70">{m['app.ghostModeDesc']()}</div>}
              </div>
              {ghostMode && <CheckIcon />}
            </>
          )}
        </button>

        {/* Conversation History */}
        {!sidebarCollapsed && isHydrated && (
          <div className="mt-4">
            {conversations.length > 0 ? (
              <div className="flex flex-col gap-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleLoadConversation(conv)}
                    className={`${MENU_ITEM_CLASS} group cursor-pointer w-full ${
                      activeConversationId === conv.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <ChatIcon />
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="truncate text-sm">{conv.title || m['app.untitled']()}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(conv.updatedAt)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                      title={m['app.deleteChat']()}
                    >
                      <TrashIcon />
                    </button>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500 text-center">
                {m['app.noHistory']()}
              </div>
            )}
          </div>
        )}

        {/* Collapsed: Ghost Mode indicator */}
        {sidebarCollapsed && ghostMode && (
          <div className="w-full flex justify-center">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* More Section */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        {/* More Header (clickable) */}
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setMoreExpanded(!moreExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-500 transition-colors"
          >
            <span>─── {m['app.more']()} ───</span>
            <ChevronIcon expanded={moreExpanded} />
          </button>
        )}

        {/* Expanded More Content */}
        {moreExpanded && !sidebarCollapsed && (
          <div className="px-2 pb-2 space-y-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`${MENU_ITEM_CLASS} bg-gray-100 dark:bg-gray-700`}
            >
              <span className="text-blue-600 dark:text-blue-400">
                {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
              </span>
              <span className="flex-1 text-left text-gray-900 dark:text-gray-100">
                {resolvedTheme === 'dark' ? m['app.darkMode']() : m['app.lightMode']()}
              </span>
            </button>

            {/* Language Options */}
            <div className="flex flex-col gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`${MENU_ITEM_CLASS} ${
                    locale === lang.code
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span
                    className={`text-xs font-semibold w-7 h-5 flex items-center justify-center rounded ${
                      locale === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {lang.flag}
                  </span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {locale === lang.code && <CheckIcon />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed: Theme toggle */}
        {sidebarCollapsed && (
          <div className="p-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={resolvedTheme === 'dark' ? m['app.lightMode']() : m['app.darkMode']()}
            >
              {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={getAboutUrl()}
            className={`${MENU_ITEM_CLASS} text-gray-600 dark:text-gray-400 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? m['app.about']() : undefined}
          >
            <InfoIcon />
            {!sidebarCollapsed && <span>{m['app.about']()}</span>}
          </Link>

          {/* Offline Badge */}
          <div
            className={`mt-2 flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <OfflineIcon />
            {!sidebarCollapsed && <span>{m['app.offline']()}</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Icons
function PanelLeftOpenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

function PanelLeftCloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function GhostIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2C7.03 2 3 6.03 3 11v9.5c0 .83 1.01 1.25 1.6.66l1.4-1.4 1.4 1.4c.39.39 1.02.39 1.41 0l1.4-1.4 1.4 1.4c.39.39 1.02.39 1.41 0l1.4-1.4 1.4 1.4c.59.59 1.6.17 1.6-.66V11c0-4.97-4.03-9-9-9zm-3 9c-.83 0-1.5-.67-1.5-1.5S8.17 8 9 8s1.5.67 1.5 1.5S9.83 11 9 11zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 8 15 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="14"
      height="14"
      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}
