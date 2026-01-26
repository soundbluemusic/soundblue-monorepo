import type { Message } from '@soundblue/ui-components/base';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ========================================
// Chat Store - 대화 기록 관리 (Zustand + localStorage)
// SSG 호환: 서버에서는 빈 상태, 클라이언트에서 hydration 후 로드
// ========================================

// Message 타입은 @soundblue/ui-components/base에서 import
export type { Message };

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface DeletedConversation extends Conversation {
  deletedAt: number;
  expiresAt: number; // 30 days after deletion
}

interface ChatState {
  conversations: Conversation[];
  deletedConversations: DeletedConversation[];
  activeConversationId: string | null;
  ghostMode: boolean;
  isHydrated: boolean;
}

interface ChatActions {
  setHydrated: () => void;
  setGhostMode: (enabled: boolean) => void;
  toggleGhostMode: () => void;
  createConversation: (welcomeMessage: Message) => Conversation | null;
  addMessage: (message: Message) => void;
  loadConversation: (id: string) => Conversation | undefined;
  deleteConversation: (id: string) => void;
  restoreConversation: (id: string) => void;
  permanentDeleteConversation: (id: string) => void;
  emptyTrash: () => void;
  cleanupExpiredTrash: () => void;
  clearActive: () => void;
  getActiveConversation: () => Conversation | undefined;
  renameConversation: (id: string, newTitle: string) => void;
}

// Generate cryptographically secure unique ID
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const randomPart = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    return Date.now().toString(36) + randomPart;
  }
  // Fallback for SSR
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/**
 * Create a welcome message for a new conversation
 *
 * @param content - The welcome message content (typically from i18n)
 * @returns A new Message object with assistant role
 */
export function createWelcomeMessage(content: string): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: Date.now(),
  };
}

const TRASH_EXPIRY_DAYS = 30;

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      deletedConversations: [],
      activeConversationId: null,
      ghostMode: false,
      isHydrated: false,

      // Actions
      setHydrated: () => set({ isHydrated: true }),

      setGhostMode: (enabled) => set({ ghostMode: enabled }),

      toggleGhostMode: () => set((state) => ({ ghostMode: !state.ghostMode })),

      createConversation: (welcomeMessage) => {
        const state = get();
        if (state.ghostMode) {
          set({ activeConversationId: null });
          return null;
        }

        // Prevent duplicate creation
        if (state.activeConversationId) {
          const existing = state.conversations.find((c) => c.id === state.activeConversationId);
          if (existing) return existing;
        }

        const newConversation: Conversation = {
          id: generateId(),
          title: '',
          messages: [welcomeMessage],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({
          activeConversationId: newConversation.id,
          conversations: [newConversation, ...state.conversations],
        });

        return newConversation;
      },

      addMessage: (message) => {
        const state = get();
        if (state.ghostMode) return;

        const activeId = state.activeConversationId;
        if (!activeId) return;

        const convIndex = state.conversations.findIndex((c) => c.id === activeId);
        if (convIndex === -1) return;

        const conversation = state.conversations[convIndex];
        if (!conversation) return;

        const updatedMessages = [...conversation.messages, message];
        let updatedTitle = conversation.title;

        // Update title from first user message
        if (!updatedTitle && message.role === 'user') {
          updatedTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }

        const updatedConversation: Conversation = {
          ...conversation,
          messages: updatedMessages,
          title: updatedTitle,
          updatedAt: Date.now(),
        };

        const newConversations = [...state.conversations];
        newConversations[convIndex] = updatedConversation;

        set({ conversations: newConversations });
      },

      loadConversation: (id) => {
        const conversation = get().conversations.find((c) => c.id === id);
        if (conversation) {
          set({ activeConversationId: id });
        }
        return conversation;
      },

      deleteConversation: (id) => {
        const state = get();
        const conversationToDelete = state.conversations.find((c) => c.id === id);
        if (!conversationToDelete) return;

        const now = Date.now();
        const deletedConversation: DeletedConversation = {
          ...conversationToDelete,
          deletedAt: now,
          expiresAt: now + TRASH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        };

        set({
          conversations: state.conversations.filter((c) => c.id !== id),
          deletedConversations: [deletedConversation, ...state.deletedConversations],
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        });
      },

      restoreConversation: (id) => {
        const state = get();
        const conversationToRestore = state.deletedConversations.find((c) => c.id === id);
        if (!conversationToRestore) return;

        // Remove trash-specific fields
        const { deletedAt: _, expiresAt: __, ...restoredConversation } = conversationToRestore;

        set({
          deletedConversations: state.deletedConversations.filter((c) => c.id !== id),
          conversations: [restoredConversation, ...state.conversations],
        });
      },

      permanentDeleteConversation: (id) => {
        set((state) => ({
          deletedConversations: state.deletedConversations.filter((c) => c.id !== id),
        }));
      },

      emptyTrash: () => {
        set({ deletedConversations: [] });
      },

      cleanupExpiredTrash: () => {
        const now = Date.now();
        set((state) => ({
          deletedConversations: state.deletedConversations.filter((c) => c.expiresAt > now),
        }));
      },

      clearActive: () => set({ activeConversationId: null }),

      getActiveConversation: () => {
        const state = get();
        if (!state.activeConversationId) return undefined;
        return state.conversations.find((c) => c.id === state.activeConversationId);
      },

      renameConversation: (id, newTitle) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c,
          ),
        }));
      },
    }),
    {
      name: 'dialogue-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        deletedConversations: state.deletedConversations,
        ghostMode: state.ghostMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
