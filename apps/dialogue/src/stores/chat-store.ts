import { createStore, reconcile } from "solid-js/store";
import { isServer } from "solid-js/web";

// ========================================
// Chat Store - 대화 기록 관리 (localStorage 연동)
// SSG 호환: 서버에서는 빈 상태, 클라이언트에서 hydration 후 로드
// ========================================

export interface Message {
  id: string;
  role: "user" | "assistant";
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
  isHydrated: boolean; // 클라이언트 hydration 완료 여부
}

const STORAGE_KEY = "dialogue-conversations";
const GHOST_MODE_KEY = "dialogue-ghost-mode";

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// SSG 호환: 항상 빈 상태로 시작 (서버/클라이언트 동일)
const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  ghostMode: false,
  isHydrated: false,
};

const [chatStore, setChatStore] = createStore<ChatState>(initialState);

// Save to localStorage (클라이언트에서만)
function saveConversations(conversations: Conversation[]): void {
  if (isServer) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable
  }
}

function saveGhostMode(enabled: boolean): void {
  if (isServer) return;
  try {
    localStorage.setItem(GHOST_MODE_KEY, String(enabled));
  } catch {
    // Storage unavailable
  }
}

export const chatActions = {
  // 클라이언트에서 hydration 후 호출 (onMount에서 한 번만)
  hydrate: () => {
    if (isServer || chatStore.isHydrated) return;

    try {
      const savedConversations = localStorage.getItem(STORAGE_KEY);
      const savedGhostMode = localStorage.getItem(GHOST_MODE_KEY);

      setChatStore(
        reconcile({
          conversations: savedConversations ? JSON.parse(savedConversations) : [],
          activeConversationId: null,
          ghostMode: savedGhostMode === "true",
          isHydrated: true,
        })
      );
    } catch {
      setChatStore("isHydrated", true);
    }
  },

  // Ghost Mode
  setGhostMode: (enabled: boolean) => {
    setChatStore("ghostMode", enabled);
    saveGhostMode(enabled);
  },

  toggleGhostMode: () => {
    const newValue = !chatStore.ghostMode;
    setChatStore("ghostMode", newValue);
    saveGhostMode(newValue);
  },

  // Create new conversation
  createConversation: (welcomeMessage: Message): Conversation | null => {
    if (chatStore.ghostMode) {
      setChatStore("activeConversationId", null);
      return null;
    }

    const newConversation: Conversation = {
      id: generateId(),
      title: "",
      messages: [welcomeMessage],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newConversations = [newConversation, ...chatStore.conversations];
    setChatStore("conversations", newConversations);
    setChatStore("activeConversationId", newConversation.id);
    saveConversations(newConversations);

    return newConversation;
  },

  // Add message to active conversation
  addMessage: (message: Message) => {
    if (chatStore.ghostMode) return;

    const activeId = chatStore.activeConversationId;
    if (!activeId) return;

    const convIndex = chatStore.conversations.findIndex((c) => c.id === activeId);
    if (convIndex === -1) return;

    const conversation = chatStore.conversations[convIndex];
    const updatedMessages = [...conversation.messages, message];
    let updatedTitle = conversation.title;

    // Update title from first user message
    if (!updatedTitle && message.role === "user") {
      updatedTitle = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "");
    }

    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      title: updatedTitle,
      updatedAt: Date.now(),
    };

    const newConversations = [...chatStore.conversations];
    newConversations[convIndex] = updatedConversation;

    setChatStore("conversations", newConversations);
    saveConversations(newConversations);
  },

  // Load conversation
  loadConversation: (id: string): Conversation | undefined => {
    const conversation = chatStore.conversations.find((c) => c.id === id);
    if (conversation) {
      setChatStore("activeConversationId", id);
    }
    return conversation;
  },

  // Delete conversation
  deleteConversation: (id: string) => {
    const newConversations = chatStore.conversations.filter((c) => c.id !== id);
    setChatStore("conversations", newConversations);

    if (chatStore.activeConversationId === id) {
      setChatStore("activeConversationId", null);
    }

    saveConversations(newConversations);
  },

  // Clear active conversation (for new chat)
  clearActive: () => {
    setChatStore("activeConversationId", null);
  },

  // Get active conversation
  getActiveConversation: (): Conversation | undefined => {
    if (!chatStore.activeConversationId) return undefined;
    return chatStore.conversations.find((c) => c.id === chatStore.activeConversationId);
  },
};

export { chatStore };
