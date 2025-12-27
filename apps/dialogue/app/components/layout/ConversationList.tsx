import { useCallback, useState } from 'react';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import m from '~/lib/messages';
import type { Conversation } from '~/stores';
import { useChatStore } from '~/stores';

// ========================================
// ConversationList Component - 대화 내역 목록
// ========================================

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

  // State for delete confirmation dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleLoadConversation = useCallback(
    (conv: Conversation) => {
      loadConversation(conv.id);
      onLoadConversation?.();
    },
    [loadConversation, onLoadConversation],
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTargetId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteConversation(deleteTargetId);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, deleteConversation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

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
          <div key={i} className="flex items-center gap-4 py-2 px-4">
            <div className="w-4 h-4 bg-(--color-bg-tertiary) rounded" />
            <div className="flex-1">
              <div className="h-4 bg-(--color-bg-tertiary) rounded w-3/4 mb-2" />
              <div className="h-3 bg-(--color-bg-tertiary) rounded w-1/2" />
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
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-(--color-border-primary)">
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-(--color-accent-primary) text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-(--color-accent-secondary) active:scale-[0.98] focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
          >
            <PlusIcon />
            <span>{m['app.newChat']()}</span>
          </button>

          {/* Ghost Mode Toggle */}
          <button
            type="button"
            onClick={toggleGhostMode}
            className={[
              'flex items-center gap-4 w-full py-2.5 px-4 border-none rounded-lg text-sm cursor-pointer transition-colors duration-150 focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
              ghostMode
                ? 'bg-(--color-ghost-light) text-(--color-ghost)'
                : 'bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:bg-(--color-bg-hover)',
            ]
              .filter(Boolean)
              .join(' ')}
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
              type="button"
              key={conv.id}
              onClick={() => handleLoadConversation(conv)}
              className={[
                'group min-h-[44px] flex w-full items-center gap-4 py-2 px-4 rounded-lg text-sm bg-none border-none cursor-pointer text-left transition-colors duration-150 hover:bg-(--color-bg-hover) hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
                activeConversationId === conv.id
                  ? 'bg-(--color-accent-light) text-(--color-accent-primary)'
                  : 'text-(--color-text-secondary)',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <ChatIcon />
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-medium truncate">
                  {conv.title || m['app.untitled']()}
                </div>
                <div className="text-xs text-(--color-text-tertiary)">
                  {formatDate(conv.updatedAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteClick(e, conv.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 p-2 rounded-md bg-none border-none cursor-pointer text-(--color-text-tertiary) transition-all duration-150 hover:bg-red-500/15 hover:text-(--color-error) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
                title={m['app.deleteChat']()}
              >
                <TrashIcon />
              </button>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-(--color-bg-tertiary) flex items-center justify-center">
            <ChatIcon />
          </div>
          <p className="text-sm font-medium text-(--color-text-primary) mb-1">
            {m['app.noHistory']()}
          </p>
          <p className="text-xs text-(--color-text-tertiary) mb-4">
            {isMobile
              ? 'Start a new conversation to begin'
              : 'Click "New Chat" to start a conversation'}
          </p>
          {isMobile && onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="py-2 px-4 bg-(--color-accent-primary) text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-(--color-accent-secondary) active:scale-95 focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
            >
              {m['app.newChat']()}
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
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
