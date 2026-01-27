import { useToast } from '@soundblue/ui-components/base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import m from '~/lib/messages';
import type { Conversation, Message } from '~/stores';
import { generateId, useChatStore } from '~/stores';

// Format conversation for export
function formatConversationForExport(conv: Conversation): string {
  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  const lines: string[] = [
    '=== Dialogue Export ===',
    `Title: ${conv.title || 'Untitled'}`,
    `Date: ${formatTimestamp(conv.createdAt)}`,
    '',
    '---',
    '',
  ];

  for (const msg of conv.messages) {
    const role = msg.role === 'user' ? 'User' : 'Dialogue';
    lines.push(`[${role}] ${formatTimestamp(msg.timestamp)}`);
    lines.push(msg.content);
    lines.push('');
  }

  lines.push('---');
  lines.push('Exported from Dialogue');

  return lines.join('\n');
}

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
    deletedConversations,
    activeConversationId,
    ghostMode,
    isHydrated,
    loadConversation,
    deleteConversation,
    restoreConversation,
    permanentDeleteConversation,
    emptyTrash,
    cleanupExpiredTrash,
    createConversation,
    toggleGhostMode,
    renameConversation,
  } = useChatStore();

  const { toast } = useToast();
  const [showTrash, setShowTrash] = useState(false);
  const [permanentDeleteTargetId, setPermanentDeleteTargetId] = useState<string | null>(null);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some((msg) => msg.content.toLowerCase().includes(query)),
    );
  }, [conversations, searchQuery]);

  // Cleanup expired trash on mount
  useEffect(() => {
    if (isHydrated) {
      cleanupExpiredTrash();
    }
  }, [isHydrated, cleanupExpiredTrash]);

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
      const wasActive = activeConversationId === deleteTargetId;
      deleteConversation(deleteTargetId);
      setDeleteTargetId(null);

      // Show undo toast
      toast.info('Moved to trash', {
        description: 'Conversation will be permanently deleted after 30 days',
        action: {
          label: 'Undo',
          onClick: () => {
            restoreConversation(deleteTargetId);
            toast.success('Restored');
          },
        },
      });

      // 삭제한 대화가 현재 활성 대화였다면 새 대화 자동 시작
      if (wasActive && !ghostMode) {
        const welcomeMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: m['app.welcome'](),
          timestamp: Date.now(),
        };
        createConversation(welcomeMessage);
      }
    }
  }, [
    deleteTargetId,
    activeConversationId,
    ghostMode,
    deleteConversation,
    createConversation,
    toast,
    restoreConversation,
  ]);

  const handleRestore = useCallback(
    (id: string) => {
      restoreConversation(id);
      toast.success('Conversation restored');
    },
    [restoreConversation, toast],
  );

  const handlePermanentDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPermanentDeleteTargetId(id);
  }, []);

  const handleConfirmPermanentDelete = useCallback(() => {
    if (permanentDeleteTargetId) {
      permanentDeleteConversation(permanentDeleteTargetId);
      setPermanentDeleteTargetId(null);
      toast.success('Permanently deleted');
    }
  }, [permanentDeleteTargetId, permanentDeleteConversation, toast]);

  const handleEmptyTrash = useCallback(() => {
    emptyTrash();
    setShowEmptyTrashConfirm(false);
    toast.success('Trash emptied');
  }, [emptyTrash, toast]);

  const formatDeletedDate = (_deletedAt: number, expiresAt: number) => {
    const daysLeft = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    return `${daysLeft} days left`;
  };

  const handleCancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  // Rename handlers
  const handleRenameClick = useCallback((e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title || '');
    // Focus input after state update
    setTimeout(() => renameInputRef.current?.focus(), 0);
  }, []);

  const handleRenameSubmit = useCallback(
    (id: string) => {
      const trimmed = editingTitle.trim();
      if (trimmed) {
        renameConversation(id, trimmed);
      }
      setEditingId(null);
      setEditingTitle('');
    },
    [editingTitle, renameConversation],
  );

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRenameSubmit(id);
      } else if (e.key === 'Escape') {
        setEditingId(null);
        setEditingTitle('');
      }
    },
    [handleRenameSubmit],
  );

  const handleRenameBlur = useCallback(
    (id: string) => {
      handleRenameSubmit(id);
    },
    [handleRenameSubmit],
  );

  const handleExport = useCallback((e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    e.stopPropagation();

    const content = formatConversationForExport(conv);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title || 'dialogue'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <div className="w-4 h-4 bg-[var(--color-bg-tertiary)] rounded" />
            <div className="flex-1">
              <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-1/2" />
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
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-[var(--color-border-primary)]">
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-[var(--color-accent-primary)] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-[var(--color-accent-secondary)] active:scale-[0.98] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            <PlusIcon />
            <span>{m['app.newChat']()}</span>
          </button>

          {/* Ghost Mode Toggle */}
          <button
            type="button"
            onClick={toggleGhostMode}
            className={[
              'flex items-center gap-4 w-full py-2.5 px-4 border-none rounded-lg text-sm cursor-pointer transition-colors duration-150 focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2',
              ghostMode
                ? 'bg-[var(--color-ghost-light)] text-[var(--color-ghost)]'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)]',
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

      {/* Search Input */}
      {conversations.length > 0 && (
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={m['app.searchConversations']()}
            className="w-full py-2 pl-9 pr-3 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded-lg placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-light)] transition-all duration-150"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      )}

      {/* Conversation List */}
      {filteredConversations.length > 0 ? (
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div key={conv.id} className="relative">
              {editingId === conv.id ? (
                /* Rename Input */
                <div className="flex items-center gap-2 py-2 px-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <ChatIcon />
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => handleRenameKeyDown(e, conv.id)}
                    onBlur={() => handleRenameBlur(conv.id)}
                    className="flex-1 py-1 px-2 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-accent-primary)] rounded focus:outline-none"
                    placeholder={m['app.untitled']()}
                  />
                </div>
              ) : (
                /* Conversation Button */
                <button
                  type="button"
                  onClick={() => handleLoadConversation(conv)}
                  className={[
                    'group min-h-[44px] flex w-full items-center gap-3 py-2 px-3 rounded-lg text-sm bg-none border-none cursor-pointer text-left transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-accent-primary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2',
                    activeConversationId === conv.id
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-secondary)]',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <ChatIcon />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">
                      {conv.title || m['app.untitled']()}
                    </div>
                    <div className="text-xs text-[var(--color-text-tertiary)] truncate">
                      {formatDate(conv.updatedAt)}
                    </div>
                  </div>
                  {/* 액션 버튼 - 터치 디바이스에서는 항상 표시, 데스크톱에서는 호버 시 표시 */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-150">
                    <button
                      type="button"
                      onClick={(e) => handleRenameClick(e, conv)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-md bg-none border-none cursor-pointer text-[var(--color-text-tertiary)] transition-all duration-150 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2 active:bg-[var(--color-accent-light)]"
                      title={m['app.rename']()}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleExport(e, conv)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-md bg-none border-none cursor-pointer text-[var(--color-text-tertiary)] transition-all duration-150 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2 active:bg-[var(--color-accent-light)]"
                      title={m['app.export']()}
                    >
                      <ExportIcon />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, conv.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-md bg-none border-none cursor-pointer text-[var(--color-text-tertiary)] transition-all duration-150 hover:bg-red-500/15 hover:text-[var(--color-error)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2 active:bg-red-500/15"
                      title={m['app.deleteChat']()}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        /* No search results */
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-8">
          <div className="w-12 h-12 mb-3 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
            <SearchIcon />
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)]">No conversations found</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
            <ChatIcon />
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            {m['app.noHistory']()}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
            {isMobile
              ? 'Start a new conversation to begin'
              : 'Click "New Chat" to start a conversation'}
          </p>
          {isMobile && onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="py-2 px-4 bg-[var(--color-accent-primary)] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-[var(--color-accent-secondary)] active:scale-95 focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
            >
              {m['app.newChat']()}
            </button>
          )}
        </div>
      )}

      {/* Trash Section */}
      {deletedConversations.length > 0 && (
        <div className="mt-auto pt-4 border-t border-[var(--color-border-primary)]">
          <button
            type="button"
            onClick={() => setShowTrash(!showTrash)}
            className="flex items-center gap-2 w-full py-2 px-4 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <TrashBinIcon />
            <span>Trash ({deletedConversations.length})</span>
            <ChevronIcon
              className={`ml-auto transition-transform ${showTrash ? 'rotate-180' : ''}`}
            />
          </button>

          {showTrash && (
            <div className="flex flex-col gap-1 mt-2">
              {/* Empty Trash Button */}
              <button
                type="button"
                onClick={() => setShowEmptyTrashConfirm(true)}
                className="flex items-center gap-2 py-1.5 px-4 text-xs text-[var(--color-error)] hover:bg-red-500/10 rounded transition-colors"
              >
                <TrashIcon />
                <span>Empty Trash</span>
              </button>

              {/* Deleted Conversations */}
              {deletedConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center gap-3 py-2 px-4 text-sm text-[var(--color-text-tertiary)] rounded-lg hover:bg-[var(--color-interactive-hover)]"
                >
                  <ChatIcon />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm truncate opacity-60">
                      {conv.title || m['app.untitled']()}
                    </div>
                    <div className="text-xs opacity-40">
                      {formatDeletedDate(conv.deletedAt, conv.expiresAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRestore(conv.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)] transition-all"
                      title="Restore"
                    >
                      <RestoreIcon />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handlePermanentDeleteClick(e, conv.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:bg-red-500/15 hover:text-[var(--color-error)] transition-all"
                      title="Delete permanently"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Permanent Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={permanentDeleteTargetId !== null}
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setPermanentDeleteTargetId(null)}
        title="Delete permanently?"
        message="This conversation will be permanently deleted. This action cannot be undone."
      />

      {/* Empty Trash Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showEmptyTrashConfirm}
        onConfirm={handleEmptyTrash}
        onCancel={() => setShowEmptyTrashConfirm(false)}
        title="Empty trash?"
        message={`All ${deletedConversations.length} conversations in trash will be permanently deleted.`}
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

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

function TrashBinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className={className}>
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className={className}>
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}
