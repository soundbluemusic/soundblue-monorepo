import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ========================================
// Chat Store - 대화 기록 관리 (Zustand + localStorage)
// SSG 호환: 서버에서는 빈 상태, 클라이언트에서 hydration 후 로드
// ========================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
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
  clearActive: () => void;
  getActiveConversation: () => Conversation | undefined;
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

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
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
        const newConversations = state.conversations.filter((c) => c.id !== id);

        set({
          conversations: newConversations,
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        });
      },

      clearActive: () => set({ activeConversationId: null }),

      getActiveConversation: () => {
        const state = get();
        if (!state.activeConversationId) return undefined;
        return state.conversations.find((c) => c.id === state.activeConversationId);
      },
    }),
    {
      name: 'dialogue-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        ghostMode: state.ghostMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
