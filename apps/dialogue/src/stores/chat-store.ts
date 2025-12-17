import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

// ========================================
// Chat Store - 대화 기록 관리 (IndexedDB 연동)
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
  isHydrated: boolean;
}

const DB_NAME = "dialogue-db";
const DB_VERSION = 1;
const STORE_NAME = "conversations";
const SETTINGS_STORE = "settings";

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// SSG 호환: 항상 빈 상태로 시작
const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  ghostMode: false,
  isHydrated: false,
};

const [chatStore, setChatStore] = createStore<ChatState>(initialState);

// Hydration lock to prevent race conditions
let isHydrating = false;

// IndexedDB helper functions
let dbInstance: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Conversations store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };
  });
}

async function getAllConversations(): Promise<Conversation[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("updatedAt");
      const request = index.getAll();

      request.onsuccess = () => {
        // Sort by updatedAt descending (newest first)
        const conversations = request.result.sort(
          (a, b) => b.updatedAt - a.updatedAt
        );
        resolve(conversations);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(conversation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Storage unavailable
  }
}

async function deleteConversationFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Storage unavailable
  }
}

async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, "readonly");
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, "readwrite");
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Storage unavailable
  }
}

export const chatActions = {
  // 클라이언트에서 hydration 후 호출 (onMount에서 한 번만)
  hydrate: async () => {
    if (isServer || chatStore.isHydrated || isHydrating) return;

    isHydrating = true;

    try {
      const [conversations, ghostMode] = await Promise.all([
        getAllConversations(),
        getSetting<boolean>("ghostMode"),
      ]);

      // 개별 필드 업데이트 (reconcile 대신) - 기존 상태 보존
      setChatStore("conversations", conversations || []);
      setChatStore("ghostMode", ghostMode === true);
      setChatStore("isHydrated", true);
    } catch {
      setChatStore("isHydrated", true);
    } finally {
      isHydrating = false;
    }
  },

  // Ghost Mode
  setGhostMode: (enabled: boolean) => {
    setChatStore("ghostMode", enabled);
    setSetting("ghostMode", enabled);
  },

  toggleGhostMode: () => {
    const newValue = !chatStore.ghostMode;
    setChatStore("ghostMode", newValue);
    setSetting("ghostMode", newValue);
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
    saveConversation(newConversation);

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
    saveConversation(updatedConversation);
  },

  // Load conversation (sets active ID only - actual loading handled by ChatContainer via loadTrigger)
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

    deleteConversationFromDB(id);
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
