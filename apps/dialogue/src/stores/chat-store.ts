import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";
import { isServer } from "solid-js/web";

// ========================================
// Chat Store - 대화 기록 관리 (localStorage 연동)
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
  ghostMode: boolean; // 고스트 모드 - 대화 저장 안함
}

const STORAGE_KEY = "dialogue-conversations";
const GHOST_MODE_KEY = "dialogue-ghost-mode";

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Load from localStorage
function loadFromStorage(): { conversations: Conversation[]; ghostMode: boolean } {
  if (isServer) return { conversations: [], ghostMode: false };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const ghostMode = localStorage.getItem(GHOST_MODE_KEY) === "true";
    return {
      conversations: saved ? JSON.parse(saved) : [],
      ghostMode,
    };
  } catch {
    return { conversations: [], ghostMode: false };
  }
}

// Save to localStorage
function saveToStorage(conversations: Conversation[]): void {
  if (isServer) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable
  }
}

// Initial state
const stored = loadFromStorage();
const initialState: ChatState = {
  conversations: stored.conversations,
  activeConversationId: null,
  ghostMode: stored.ghostMode,
};

const [chatStore, setChatStore] = createStore<ChatState>(initialState);

// Auto-save when conversations change (but not in ghost mode)
if (!isServer) {
  createEffect(() => {
    if (!chatStore.ghostMode) {
      saveToStorage(chatStore.conversations);
    }
  });
}

export const chatActions = {
  // Ghost Mode
  setGhostMode: (enabled: boolean) => {
    setChatStore("ghostMode", enabled);
    if (!isServer) {
      localStorage.setItem(GHOST_MODE_KEY, String(enabled));
    }
  },
  toggleGhostMode: () => {
    const newValue = !chatStore.ghostMode;
    setChatStore("ghostMode", newValue);
    if (!isServer) {
      localStorage.setItem(GHOST_MODE_KEY, String(newValue));
    }
  },

  // Create new conversation
  createConversation: (welcomeMessage: Message): Conversation | null => {
    if (chatStore.ghostMode) {
      // In ghost mode, just set active to null (no saving)
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

    setChatStore("conversations", (prev) => [newConversation, ...prev]);
    setChatStore("activeConversationId", newConversation.id);
    return newConversation;
  },

  // Add message to active conversation
  addMessage: (message: Message) => {
    if (chatStore.ghostMode) return;

    const activeId = chatStore.activeConversationId;
    if (!activeId) return;

    setChatStore("conversations", (conv) => conv.id === activeId, "messages", (msgs) => [...msgs, message]);
    setChatStore("conversations", (conv) => conv.id === activeId, "updatedAt", Date.now());

    // Update title from first user message
    const conversation = chatStore.conversations.find((c) => c.id === activeId);
    if (conversation && !conversation.title && message.role === "user") {
      const title = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "");
      setChatStore("conversations", (conv) => conv.id === activeId, "title", title);
    }
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
    setChatStore("conversations", (prev) => prev.filter((c) => c.id !== id));
    if (chatStore.activeConversationId === id) {
      setChatStore("activeConversationId", null);
    }
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
