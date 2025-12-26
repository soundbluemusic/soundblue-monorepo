import { useCallback } from 'react';
import m from '~/lib/messages';
import type { Conversation } from '~/stores';
import { useChatStore } from '~/stores';
import styles from './ConversationList.module.scss';

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
      <div className={styles.skeleton}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonItem}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonDate} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Mobile Header - 새 대화 + Ghost Mode */}
      {isMobile && onNewChat && (
        <div className={styles.mobileHeader}>
          <button type="button" onClick={onNewChat} className={styles.newChatButton}>
            <PlusIcon />
            <span>{m['app.newChat']()}</span>
          </button>

          {/* Ghost Mode Toggle */}
          <button
            type="button"
            onClick={toggleGhostMode}
            className={[
              styles.ghostModeToggle,
              ghostMode ? styles.ghostModeActive : styles.ghostModeInactive,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <GhostIcon />
            <div className={styles.ghostModeContent}>
              <div className={styles.ghostModeTitle}>{m['app.ghostMode']()}</div>
              {ghostMode && <div className={styles.ghostModeDesc}>{m['app.ghostModeDesc']()}</div>}
            </div>
            {ghostMode && <CheckIcon />}
          </button>
        </div>
      )}

      {/* Conversation List */}
      {conversations.length > 0 ? (
        <div className={styles.list}>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => handleLoadConversation(conv)}
              className={[
                styles.conversationItem,
                activeConversationId === conv.id
                  ? styles.conversationItemActive
                  : styles.conversationItemInactive,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <ChatIcon />
              <div className={styles.conversationContent}>
                <div className={styles.conversationTitle}>{conv.title || m['app.untitled']()}</div>
                <div className={styles.conversationDate}>{formatDate(conv.updatedAt)}</div>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                className={styles.deleteButton}
                title={m['app.deleteChat']()}
              >
                <TrashIcon />
              </button>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ChatIcon />
          </div>
          <p className={styles.emptyTitle}>{m['app.noHistory']()}</p>
          <p className={styles.emptyDescription}>
            {isMobile
              ? 'Start a new conversation to begin'
              : 'Click "New Chat" to start a conversation'}
          </p>
          {isMobile && onNewChat && (
            <button type="button" onClick={onNewChat} className={styles.emptyNewChatButton}>
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
