import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { isServer } from 'solid-js/web';
import { CONVERSATIONS_STORE, getDialogueDb, getSetting, setSetting } from './db';

// ========================================
// Chat Store - 대화 기록 관리 (IndexedDB 연동)
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

// Generate cryptographically secure unique ID
export function generateId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const randomPart = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  return Date.now().toString(36) + randomPart;
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

// Conversation DB operations (using shared DB)
async function getAllConversations(): Promise<Conversation[]> {
  try {
    const db = await getDialogueDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CONVERSATIONS_STORE, 'readonly');
      const store = tx.objectStore(CONVERSATIONS_STORE);
      const index = store.index('updatedAt');
      const request = index.getAll();

      request.onsuccess = () => {
        // Sort by updatedAt descending (newest first)
        const conversations = request.result.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(conversations);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return [];
  }
}

async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    const db = await getDialogueDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CONVERSATIONS_STORE, 'readwrite');
      const store = tx.objectStore(CONVERSATIONS_STORE);
      const request = store.put(conversation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save conversation:', error);
    throw error;
  }
}

async function deleteConversationFromDB(id: string): Promise<void> {
  try {
    const db = await getDialogueDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CONVERSATIONS_STORE, 'readwrite');
      const store = tx.objectStore(CONVERSATIONS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
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
        getSetting<boolean>('ghostMode'),
      ]);

      // batch() 사용하여 단일 렌더링으로 최적화
      batch(() => {
        setChatStore('conversations', conversations || []);
        setChatStore('ghostMode', ghostMode === true);
        setChatStore('isHydrated', true);
      });
    } catch {
      setChatStore('isHydrated', true);
    } finally {
      isHydrating = false;
    }
  },

  // Ghost Mode
  setGhostMode: (enabled: boolean) => {
    setChatStore('ghostMode', enabled);
    void setSetting('ghostMode', enabled);
  },

  toggleGhostMode: () => {
    const newValue = !chatStore.ghostMode;
    setChatStore('ghostMode', newValue);
    void setSetting('ghostMode', newValue);
  },

  // Create new conversation (with race condition prevention)
  createConversation: (welcomeMessage: Message): Conversation | null => {
    if (chatStore.ghostMode) {
      setChatStore('activeConversationId', null);
      return null;
    }

    // Prevent duplicate creation - if already have active conversation, return it
    // 중복 생성 방지 - 이미 활성 대화가 있으면 해당 대화 반환
    if (chatStore.activeConversationId) {
      const existing = chatStore.conversations.find((c) => c.id === chatStore.activeConversationId);
      if (existing) return existing;
    }

    const newConversation: Conversation = {
      id: generateId(),
      title: '',
      messages: [welcomeMessage],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Set activeConversationId FIRST to prevent race conditions
    // activeConversationId를 먼저 설정하여 race condition 방지
    setChatStore('activeConversationId', newConversation.id);
    setChatStore('conversations', [newConversation, ...chatStore.conversations]);

    // Save with error handling
    saveConversation(newConversation).catch((err) => {
      console.error('Failed to save conversation:', err);
    });

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
    if (!conversation) return;

    const updatedMessages = [...conversation.messages, message];
    let updatedTitle = conversation.title;

    // Update title from first user message
    if (!updatedTitle && message.role === 'user') {
      updatedTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
    }

    const updatedConversation: Conversation = {
      id: conversation.id,
      createdAt: conversation.createdAt,
      messages: updatedMessages,
      title: updatedTitle,
      updatedAt: Date.now(),
    };

    const newConversations = [...chatStore.conversations];
    newConversations[convIndex] = updatedConversation;

    setChatStore('conversations', newConversations);

    // Save with error handling
    saveConversation(updatedConversation).catch((err) => {
      console.error('Failed to save message:', err);
    });
  },

  // Load conversation (sets active ID only - actual loading handled by ChatContainer via loadTrigger)
  loadConversation: (id: string): Conversation | undefined => {
    const conversation = chatStore.conversations.find((c) => c.id === id);
    if (conversation) {
      setChatStore('activeConversationId', id);
    }
    return conversation;
  },

  // Delete conversation
  deleteConversation: (id: string) => {
    const newConversations = chatStore.conversations.filter((c) => c.id !== id);
    setChatStore('conversations', newConversations);

    if (chatStore.activeConversationId === id) {
      setChatStore('activeConversationId', null);
    }

    // Delete with error handling
    deleteConversationFromDB(id).catch((err) => {
      console.error('Failed to delete conversation:', err);
    });
  },

  // Clear active conversation (for new chat)
  clearActive: () => {
    setChatStore('activeConversationId', null);
  },

  // Get active conversation
  getActiveConversation: (): Conversation | undefined => {
    if (!chatStore.activeConversationId) return undefined;
    return chatStore.conversations.find((c) => c.id === chatStore.activeConversationId);
  },
};

export { chatStore };
