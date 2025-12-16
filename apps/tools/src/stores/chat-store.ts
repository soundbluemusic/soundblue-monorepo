import { createStore } from 'solid-js/store';

// ========================================
// Chat Store - 채팅 메시지 상태 관리
// ========================================

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}

const createInitialMessages = (): Message[] => [
  {
    id: 'welcome',
    type: 'bot',
    content: '안녕하세요! 어떤 도구를 열까요?',
    timestamp: Date.now(),
  },
];

const initialState: ChatState = {
  messages: createInitialMessages(),
  isTyping: false,
};

// Create the store
const [chatStore, setChatStore] = createStore<ChatState>(initialState);

// Generate unique ID
const generateId = (): string => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Chat action methods with explicit return types */
export interface ChatActions {
  addUserMessage: (content: string) => Message;
  addBotMessage: (content: string) => Message;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

// Actions
export const chatActions: ChatActions = {
  addUserMessage: (content: string): Message => {
    const message: Message = {
      id: generateId(),
      type: 'user',
      content,
      timestamp: Date.now(),
    };
    setChatStore('messages', (prev) => [...prev, message]);
    return message;
  },

  addBotMessage: (content: string): Message => {
    const message: Message = {
      id: generateId(),
      type: 'bot',
      content,
      timestamp: Date.now(),
    };
    setChatStore('messages', (prev) => [...prev, message]);
    return message;
  },

  setTyping: (isTyping: boolean): void => {
    setChatStore('isTyping', isTyping);
  },

  clearMessages: (): void => {
    setChatStore('messages', createInitialMessages());
  },
};

// Export store and selectors
export { chatStore, setChatStore };

// Selector functions
export const useMessages = (): Message[] => chatStore.messages;
export const useIsTyping = (): boolean => chatStore.isTyping;
