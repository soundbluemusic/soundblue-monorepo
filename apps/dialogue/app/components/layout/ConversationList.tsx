import { useCallback } from 'react';
import m from '~/lib/messages';
import type { Conversation } from '~/stores';
import { useChatStore } from '~/stores';

// ========================================
// ConversationList Component - 대화 내역 목록
// ========================================

const HOVER_STYLES =
  'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400';
const FOCUS_STYLES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1';
const MENU_ITEM_CLASS = `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${HOVER_STYLES} ${FOCUS_STYLES}`;

interface ConversationListProps {
  onLoadConversation?: () => void;
  onNewChat?: () => void;
  isMobile?: boolean;
}

export function ConversationList({
  onLoadConversation,
  onNewChat,
  isMobile = false,
}: ConversationListProps) {
  const {
    conversations,
    activeConversationId,
    ghostMode,
    isHydrated,
    loadConversation,
    deleteConversation,
    toggleGhostMode,
  } = useChatStore();

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

  // Loading skeleton
  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header - 새 대화 + Ghost Mode */}
      {isMobile && onNewChat && (
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
          >
            <PlusIcon />
            <span>{m['app.newChat']()}</span>
          </button>

          {/* Ghost Mode Toggle */}
          <button
            type="button"
            onClick={toggleGhostMode}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              ghostMode
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <GhostIcon />
            <div className="flex-1 text-left">
              <div className="font-medium">{m['app.ghostMode']()}</div>
              {ghostMode && <div className="text-xs opacity-70">{m['app.ghostModeDesc']()}</div>}
            </div>
            {ghostMode && <CheckIcon />}
          </button>
        </div>
      )}

      {/* Conversation List */}
      {conversations.length > 0 ? (
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
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
                <div className="truncate text-sm font-medium">
                  {conv.title || m['app.untitled']()}
                </div>
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
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ChatIcon />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {m['app.noHistory']()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {isMobile
              ? 'Start a new conversation to begin'
              : 'Click "New Chat" to start a conversation'}
          </p>
          {isMobile && onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-700 active:scale-95"
            >
              {m['app.newChat']()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Icons
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
