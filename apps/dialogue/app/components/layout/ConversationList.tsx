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
}

export function ConversationList({ onLoadConversation }: ConversationListProps) {
  const { conversations, activeConversationId, isHydrated, loadConversation, deleteConversation } =
    useChatStore();

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

  if (!isHydrated) {
    return null;
  }

  return (
    <>
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
        <div className="px-3 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
          {m['app.noHistory']()}
        </div>
      )}
    </>
  );
}

// Icons
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
