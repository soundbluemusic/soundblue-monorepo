/**
 * @fileoverview Chat container component with site Q&A functionality.
 *
 * This module provides the main chat interface that allows users to ask
 * questions about the Sound Blue website in English or Korean.
 *
 * ## Features
 *
 * - **Bilingual NLP**: Detects topic requests in both English and Korean
 * - **Site Information**: Answers questions about artist, music, license, etc.
 * - **Page Navigation**: Suggests relevant pages based on user queries
 * - **Time/Date**: Responds with current Seoul time and date
 * - **Typing Simulation**: Shows a realistic typing indicator before bot responses
 * - **Auto-scroll**: Automatically scrolls to the latest message
 *
 * ## Supported Topics
 *
 * | Topic | English Keywords | Korean Keywords |
 * |-------|-----------------|-----------------|
 * | About | who, sound blue, artist, producer | 누구, 사운드블루, 아티스트 |
 * | Music | music, bgm, genre, soundtrack | 음악, 장르, 사운드트랙 |
 * | License | license, use, permitted | 라이선스, 사용, 허용 |
 * | Sound Recording | recording, field, sound effect | 녹음, 필드, 효과음 |
 * | Contact | youtube, github, contact | 유튜브, 깃헙, 연락 |
 * | Built With | built, tech, framework | 기술, 프레임워크 |
 * | Navigation | where, page, find | 어디, 페이지, 찾기 |
 * | Time | what time, 몇 시 | 시간 |
 * | Date | what day, 몇 일, 오늘 | 날짜 |
 *
 * @module components/chat/ChatContainer
 */

import { useNavigate } from '@solidjs/router';
import { createEffect, createSignal, For, type JSX, onMount } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { getStorageItem, removeStorageItem, setStorageItem } from '~/utils';
import { ChatInput } from './ChatInput';
import type { Message } from './ChatMessage';
import { ChatMessage } from './ChatMessage';
import type { TopicType } from './InfoPanel';

/**
 * Props for the ChatContainer component.
 */
interface ChatContainerProps {
  /**
   * Callback fired when the user asks about a topic.
   *
   * @param topic - The identified topic type
   */
  onTopicSelect: (topic: TopicType) => void;
}

/**
 * Union type of supported topic keys.
 * Must match keys in the i18n `chat.topics` object.
 */
type TopicKey = Exclude<TopicType, null>;

/**
 * Keyword mapping for natural language topic detection.
 *
 * Each topic is associated with an array of keywords in both English and Korean.
 * Keywords are matched case-insensitively against user messages.
 */
const TOPIC_KEYWORDS: Record<TopicKey, string[]> = {
  about: [
    'sound blue',
    'soundblue',
    '사운드블루',
    '사운드 블루',
    'who',
    '누구',
    'artist',
    '아티스트',
    'producer',
    '프로듀서',
    'about',
    '소개',
    'introduce',
  ],
  music: [
    'music',
    '음악',
    'bgm',
    'genre',
    '장르',
    'soundtrack',
    '사운드트랙',
    'ambient',
    '앰비언트',
    'instrumental',
    '인스트루멘탈',
    'what kind',
    '어떤 음악',
    'style',
    '스타일',
  ],
  license: [
    'license',
    '라이선스',
    'use',
    '사용',
    'permitted',
    '허용',
    'allowed',
    '가능',
    'prohibited',
    '금지',
    'copyright',
    '저작권',
    'can i use',
    '써도 되',
    '사용해도',
  ],
  soundRecording: [
    'recording',
    '레코딩',
    '녹음',
    'field',
    '필드',
    'sound effect',
    '효과음',
    'sample',
    '샘플',
    'ambience',
    '환경음',
    'foley',
    '폴리',
  ],
  contact: [
    'youtube',
    '유튜브',
    'github',
    '깃헙',
    '깃허브',
    'contact',
    '연락',
    'sns',
    'link',
    '링크',
    'channel',
    '채널',
    'discography',
    '디스코그래피',
  ],
  builtWith: [
    'built',
    'tech',
    '기술',
    'framework',
    '프레임워크',
    'solidjs',
    'typescript',
    'tailwind',
    'stack',
    '스택',
    'how made',
    '어떻게 만들',
  ],
  navigation: [
    'where',
    '어디',
    'page',
    '페이지',
    'find',
    '찾',
    'sitemap',
    '사이트맵',
    'menu',
    '메뉴',
    'navigate',
    '이동',
  ],
  // Help is handled separately before topic parsing, so no keywords needed here
  help: [],
};

/**
 * Topics that can be detected from user messages via keyword matching.
 * Excludes 'help' since it's handled separately before parsing.
 */
type ParseableTopicKey = Exclude<TopicKey, 'help'>;

/**
 * Result of parsing a user message for topic intent.
 */
interface ParsedTopicMessage {
  /** The identified topic type (excludes 'help' which is handled separately) */
  topic: ParseableTopicKey;
}

/**
 * Parses a user message to detect topic requests.
 *
 * This function implements a keyword-based NLP approach:
 * 1. Converts message to lowercase for case-insensitive matching
 * 2. Iterates through topic keywords to find a match
 *
 * @param message - The user's input message
 * @returns Parsed topic info, or null if no topic detected
 */
function parseMessage(message: string): ParsedTopicMessage | null {
  const lower = message.toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [TopicKey, string[]][]) {
    // Skip 'help' since it has no keywords and is handled separately
    if (topic === 'help') continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return { topic: topic as ParseableTopicKey };
    }
  }

  return null;
}

/**
 * Generates a unique ID for chat messages.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Keywords for time queries */
const TIME_KEYWORDS = [
  'what time',
  'time now',
  'current time',
  '몇 시',
  '몇시',
  '지금 시간',
  '현재 시간',
];

/** Keywords for date queries */
const DATE_KEYWORDS = ['what day', 'what date', 'today', '몇 일', '몇일', '오늘', '며칠', '날짜'];

/**
 * Gets the current time in Seoul timezone.
 * @returns Date object representing current Seoul time
 */
function getSeoulDateTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

/**
 * Gets the current Seoul time formatted for display.
 * @param isKorean - Whether to format in Korean
 * @returns Formatted time string
 */
function getSeoulTime(isKorean: boolean): string {
  const seoulTime = getSeoulDateTime();

  if (isKorean) {
    const hours = seoulTime.getHours();
    const minutes = seoulTime.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${period} ${displayHours}시 ${minutes}분`;
  }

  return seoulTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Gets the current Seoul date formatted for display.
 * @param isKorean - Whether to format in Korean
 * @returns Formatted date string
 */
function getSeoulDate(isKorean: boolean): string {
  const seoulTime = getSeoulDateTime();

  if (isKorean) {
    const year = seoulTime.getFullYear();
    const month = seoulTime.getMonth() + 1;
    const date = seoulTime.getDate();
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = dayNames[seoulTime.getDay()];
    return `${year}년 ${month}월 ${date}일 ${dayName}`;
  }

  return seoulTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Checks if the message is asking for time.
 */
function isTimeQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return TIME_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Checks if the message is asking for date.
 */
function isDateQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return DATE_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Minimum Korean character ratio to trigger redirect (70%) */
const KOREAN_REDIRECT_THRESHOLD = 0.7;

/**
 * Calculates the ratio of Korean characters in a string.
 * Uses Unicode ranges for Korean syllables and Jamo.
 *
 * @param text - The text to analyze
 * @returns Ratio from 0 to 1 (e.g., 0.7 = 70% Korean)
 */
function getKoreanRatio(text: string): number {
  // Remove whitespace for accurate ratio calculation
  const chars = text.replace(/\s/g, '');
  if (chars.length === 0) return 0;

  // Hangul syllables: U+AC00-U+D7AF
  // Hangul Jamo: U+1100-U+11FF
  // Hangul Compatibility Jamo: U+3130-U+318F
  const koreanChars = chars.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g);
  return (koreanChars?.length || 0) / chars.length;
}

/** Storage key for preserving chat state during language redirect */
const CHAT_STATE_KEY = 'sb-chat-state';

/** Storage key for persistent chat history */
const CHAT_HISTORY_KEY = 'sb-chat-history';

/** Maximum number of messages to persist in history */
const MAX_HISTORY_MESSAGES = 100;

/** Interface for saved chat state (used during redirect) */
interface SavedChatState {
  messages: Message[];
  pendingMessage: string;
}

/**
 * Main chat interface component for site Q&A interaction.
 *
 * Renders a complete chat UI with message history, typing indicators,
 * and input field. Parses user messages to detect topic requests.
 */
export function ChatContainer(props: ChatContainerProps): JSX.Element {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  /** Reactive array of all chat messages */
  const [messages, setMessages] = createSignal<Message[]>([]);

  /** Whether the bot is currently "typing" (shows animation) */
  const [isTyping, setIsTyping] = createSignal(false);

  /** Pending message to process after redirect */
  const [pendingMessage, setPendingMessage] = createSignal<string | null>(null);

  /** Reference to the end-of-messages element for auto-scrolling */
  let messagesEndRef: HTMLLIElement | undefined;

  // Initialize chat: restore from redirect state, history, or show welcome
  onMount(async () => {
    // First, check for redirect state (takes priority)
    const redirectState = await getStorageItem<SavedChatState | null>(CHAT_STATE_KEY, null);

    if (redirectState) {
      // Restore saved conversation state after redirect
      setMessages(redirectState.messages);
      setPendingMessage(redirectState.pendingMessage);
      // Clear redirect state after restoring
      void removeStorageItem(CHAT_STATE_KEY);
      return;
    }

    // Second, try to load from persistent history
    const savedHistory = await getStorageItem<Message[] | null>(CHAT_HISTORY_KEY, null);

    if (savedHistory && savedHistory.length > 0) {
      setMessages(savedHistory);
      return;
    }

    // No saved state - initialize with welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: t().chat.welcome,
        timestamp: Date.now(),
      },
    ]);
  });

  // Process pending message after state is restored
  createEffect(() => {
    const pending = pendingMessage();
    if (pending) {
      setPendingMessage(null);
      // Process the message after a brief delay to ensure UI is ready
      setTimeout(() => {
        processMessage(pending);
      }, 100);
    }
  });

  // Auto-scroll to bottom when messages change
  createEffect(() => {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Persist messages to IndexedDB whenever they change
  createEffect(() => {
    const currentMessages = messages();
    // Only save if there are messages (skip empty state)
    if (currentMessages.length > 0) {
      // Limit to max history size, keeping most recent messages
      const messagesToSave = currentMessages.slice(-MAX_HISTORY_MESSAGES);
      void setStorageItem(CHAT_HISTORY_KEY, messagesToSave);
    }
  });

  /**
   * Adds a bot message to the chat history.
   */
  const addBotMessage = (content: string): void => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        type: 'bot',
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  /**
   * Processes a message and generates bot response.
   * This is called after user message is added to history.
   */
  const processMessage = (message: string): void => {
    // Show typing indicator
    setIsTyping(true);

    // Simulate realistic typing delay before bot response
    setTimeout(() => {
      setIsTyping(false);

      const lower = message.toLowerCase();

      // Check for greeting keywords
      if (
        lower.includes('hello') ||
        lower.includes('hi') ||
        lower.includes('안녕') ||
        lower.includes('하이')
      ) {
        addBotMessage(t().chat.responses.greeting);
        return;
      }

      // Check for help keywords - show site navigation in InfoPanel
      if (lower.includes('help') || lower.includes('도움') || lower.includes('도움말')) {
        addBotMessage(t().chat.responses.help);
        props.onTopicSelect('help');
        return;
      }

      // Check for time query
      if (isTimeQuery(message)) {
        const timeStr = getSeoulTime(language() === 'ko');
        const response = t().chat.responses.time.replace('{time}', timeStr);
        addBotMessage(response);
        return;
      }

      // Check for date query
      if (isDateQuery(message)) {
        const dateStr = getSeoulDate(language() === 'ko');
        const response = t().chat.responses.date.replace('{date}', dateStr);
        addBotMessage(response);
        return;
      }

      // Parse message for topic intent
      const parsed = parseMessage(message);
      if (parsed?.topic) {
        // Get response for the topic
        const topicResponse = t().chat.responses.topics[parsed.topic];
        addBotMessage(topicResponse);

        // Notify parent component of topic selection
        props.onTopicSelect(parsed.topic);
        return;
      }

      // Fallback for unrecognized messages
      addBotMessage(t().chat.responses.unknown);
    }, 300);
  };

  /**
   * Handles user message submission.
   * Detects predominantly Korean input on English page and redirects to Korean chat.
   */
  const handleSend = (message: string): void => {
    // Check if user is typing predominantly Korean on English page (70%+ Korean chars)
    if (language() !== 'ko' && getKoreanRatio(message) >= KOREAN_REDIRECT_THRESHOLD) {
      // Add user message to chat history first
      const updatedMessages: Message[] = [
        ...messages(),
        {
          id: generateId(),
          type: 'user',
          content: message,
          timestamp: Date.now(),
        },
      ];
      setMessages(updatedMessages);

      // Save current conversation state
      const stateToSave: SavedChatState = {
        messages: updatedMessages,
        pendingMessage: message,
      };
      void setStorageItem(CHAT_STATE_KEY, stateToSave);

      // Redirect to Korean chat page
      navigate('/ko/chat/');
      return;
    }

    // Add user message to chat history
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        type: 'user',
        content: message,
        timestamp: Date.now(),
      },
    ]);

    // Process the message
    processMessage(message);
  };

  return (
    <div class="flex flex-col h-full bg-surface">
      {/* Header */}
      <div class="flex items-center h-14 px-4 border-b border-line">
        <h2 class="text-sm font-semibold text-content">{t().chat.title}</h2>
      </div>

      {/* Messages */}
      <ul class="flex-1 overflow-y-auto p-4 space-y-3 list-none m-0" aria-label="Chat messages">
        <For each={messages()}>{(message) => <ChatMessage message={message} />}</For>

        {isTyping() && (
          <li class="flex justify-start list-none">
            <div class="bg-surface-alt text-content-muted px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
              <span class="inline-flex gap-1">
                <span class="w-2 h-2 bg-content-muted rounded-full animate-bounce" />
                <span
                  class="w-2 h-2 bg-content-muted rounded-full animate-bounce"
                  style="animation-delay: 0.1s"
                />
                <span
                  class="w-2 h-2 bg-content-muted rounded-full animate-bounce"
                  style="animation-delay: 0.2s"
                />
              </span>
            </div>
          </li>
        )}

        <li class="list-none" ref={messagesEndRef} aria-hidden="true" />
      </ul>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping()} />
    </div>
  );
}
