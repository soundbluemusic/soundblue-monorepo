import { getLocalizedPath } from '@soundblue/i18n';
import { getLocaleFromPath } from '@soundblue/locale';
import { addToContext, analyzeInput, type ConversationTurn } from '@soundblue/nlu';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import m from '~/lib/messages';
import { detectLanguageSwitch, detectToolRequest, getResponse } from '~/lib/response-handler';
import { generateId, type Message, useChatStore, useUIStore } from '~/stores';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

// Suggested prompts for welcome screen
const SUGGESTED_PROMPTS = {
  en: [
    { icon: '💡', text: 'What can you help me with?' },
    { icon: '🌐', text: 'How do I switch to Korean?' },
    { icon: '🔧', text: 'Open the translator tool' },
    { icon: '📱', text: 'Generate a QR code for me' },
  ],
  ko: [
    { icon: '💡', text: '어떤 도움을 줄 수 있나요?' },
    { icon: '🌐', text: '영어로 바꿔줘' },
    { icon: '🔧', text: '번역기 열어줘' },
    { icon: '📱', text: 'QR 코드 만들어줘' },
  ],
};

// Thinking Block Component
function ThinkingBlock() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex gap-3 animate-fade-in-up">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 text-sm font-medium text-[var(--color-text-secondary)]">
        D
      </div>

      {/* Thinking content */}
      <div className="flex-1 max-w-[75%]">
        <div className="px-4 py-3 bg-[var(--color-bg-tertiary)] rounded-2xl rounded-bl-md">
          {/* Header */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 w-full bg-transparent border-none cursor-pointer text-left p-0"
          >
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {m['app.thinking']?.() || 'Thinking...'}
            </span>
            <ChevronIcon
              className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </button>

          {/* Dots animation */}
          <div className={`thinking-block-content ${isCollapsed ? 'collapsed' : 'expanded'} mt-2`}>
            <div className="flex items-center gap-1.5">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Prompt Card Component
interface PromptCardProps {
  icon: string;
  text: string;
  onClick: () => void;
}

function PromptCard({ icon, text, onClick }: PromptCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="prompt-card flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl text-left cursor-pointer hover:border-[var(--color-accent-primary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2 min-h-[72px]"
    >
      <span className="text-2xl shrink-0">{icon}</span>
      <span className="text-sm text-[var(--color-text-primary)] line-clamp-2 break-words">
        {text}
      </span>
    </button>
  );
}

// Welcome Screen Component
interface WelcomeScreenProps {
  onPromptSelect: (text: string) => void;
  locale: string;
}

function WelcomeScreen({ onPromptSelect, locale }: WelcomeScreenProps) {
  const prompts = locale === 'ko' ? SUGGESTED_PROMPTS.ko : SUGGESTED_PROMPTS.en;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto">
      {/* Logo/Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mb-4 sm:mb-6 shrink-0">
        <span className="text-3xl sm:text-4xl">💬</span>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
        {m['app.title']()}
      </h2>
      <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)] mb-6 sm:mb-8 text-center max-w-md px-2">
        {m['app.subtitle']()}
      </p>

      {/* Prompt Cards - 반응형 그리드 개선 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-lg px-2">
        {prompts.map((prompt, index) => (
          <PromptCard
            key={index}
            icon={prompt.icon}
            text={prompt.text}
            onClick={() => onPromptSelect(prompt.text)}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [userMessageCount, setUserMessageCount] = useState(0);

  // Refs for stable callback access (prevents unnecessary re-renders)
  const userMessageCountRef = useRef(userMessageCount);
  const localMessagesRef = useRef(localMessages);
  const isMountedRef = useRef(true);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mounted state and cleanup timeouts
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    userMessageCountRef.current = userMessageCount;
  }, [userMessageCount]);

  useEffect(() => {
    localMessagesRef.current = localMessages;
  }, [localMessages]);

  const {
    isHydrated,
    ghostMode,
    activeConversationId,
    getActiveConversation,
    createConversation,
    addMessage,
    clearActive,
    findEmptyConversation,
    loadConversation,
  } = useChatStore();

  const { setResultContent } = useUIStore();

  // Get messages from active conversation or local state (ghost mode)
  const activeConversation = getActiveConversation();
  const messages = ghostMode ? localMessages : (activeConversation?.messages ?? []);

  // Extract locale from pathname to ensure it's tracked as dependency
  const locale = getLocaleFromPath(location.pathname);

  // Check if this is an empty conversation (only welcome message or no messages)
  const isEmptyConversation = useMemo(() => {
    if (messages.length === 0) return true;
    if (messages.length === 1 && messages[0]?.role === 'assistant') return true;
    return false;
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (!isHydrated) return;

    // If no active conversation and not ghost mode
    if (!activeConversationId && !ghostMode) {
      // Reuse existing empty conversation if available
      const existingEmpty = findEmptyConversation();
      if (existingEmpty) {
        loadConversation(existingEmpty.id);
      } else {
        // Create new conversation only if no empty one exists
        const welcomeMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: m['app.welcome'](),
          timestamp: Date.now(),
        };
        createConversation(welcomeMessage);
      }
    }

    // If ghost mode, initialize with welcome message
    if (ghostMode && localMessages.length === 0) {
      setLocalMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: m['app.welcome'](),
          timestamp: Date.now(),
        },
      ]);
    }
  }, [
    isHydrated,
    activeConversationId,
    ghostMode,
    createConversation,
    localMessages.length,
    findEmptyConversation,
    loadConversation,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle sending a message with advanced NLU
  const handleSend = useCallback(
    async (content: string) => {
      // Capture ghostMode at start to prevent race conditions during async operations
      const isGhostMode = ghostMode;

      // Check for language switch request
      const languageSwitch = detectLanguageSwitch(content, locale);
      if (languageSwitch.shouldSwitch && languageSwitch.targetLocale) {
        // Show language switch message
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        const switchMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: languageSwitch.message || '',
          timestamp: Date.now(),
        };

        if (isGhostMode) {
          setLocalMessages((prev) => [...prev, userMessage, switchMessage]);
        } else {
          addMessage(userMessage);
          addMessage(switchMessage);
        }

        // Redirect to target language page
        const currentPath = location.pathname.replace(/^\/(ko|en)/, '') || '/';
        const newPath = getLocalizedPath(currentPath, languageSwitch.targetLocale);

        if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
        navigateTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) navigate({ to: newPath });
        }, 500);
        return;
      }

      // Handle language switch detection (already on correct page)
      if (languageSwitch.message) {
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        const alreadyOnPageMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: languageSwitch.message,
          timestamp: Date.now(),
        };

        if (isGhostMode) {
          setLocalMessages((prev) => [...prev, userMessage, alreadyOnPageMessage]);
        } else {
          addMessage(userMessage);
          addMessage(alreadyOnPageMessage);
        }
        return;
      }

      // Check for tool request
      const toolRequest = detectToolRequest(content, locale);
      if (toolRequest.shouldOpenTool && toolRequest.tool) {
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        const toolMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: toolRequest.message || '',
          timestamp: Date.now(),
        };

        if (isGhostMode) {
          setLocalMessages((prev) => [...prev, userMessage, toolMessage]);
        } else {
          addMessage(userMessage);
          addMessage(toolMessage);
        }

        // Open tool in result panel
        const toolNames: Record<string, string> = {
          translator: locale === 'ko' ? '번역기' : 'Translator',
          'qr-generator': locale === 'ko' ? 'QR 코드 생성기' : 'QR Code Generator',
        };

        setResultContent({
          type: 'tool',
          title: toolNames[toolRequest.tool] || toolRequest.tool,
          content: '',
          tool: toolRequest.tool,
          initialText: toolRequest.extractedText,
        });

        return;
      }

      // Normal message flow
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      // Increment user message count (use ref for stable access)
      const currentCount = userMessageCountRef.current;
      const newUserMessageCount = currentCount + 1;
      setUserMessageCount(newUserMessageCount);

      // Get current local messages from ref for stable access
      const currentLocalMessages = localMessagesRef.current;

      // Auto-save after 3 messages in ghost mode
      if (isGhostMode && newUserMessageCount >= 3 && currentLocalMessages.length > 0) {
        // Convert to regular conversation with error handling
        try {
          const welcomeMessage: Message = currentLocalMessages[0] || {
            id: generateId(),
            role: 'assistant',
            content: m['app.welcome'](),
            timestamp: Date.now(),
          };

          // Create conversation with all existing messages
          createConversation(welcomeMessage);

          // Add all previous messages
          for (let i = 1; i < currentLocalMessages.length; i++) {
            const msg = currentLocalMessages[i];
            if (msg) {
              addMessage(msg);
            }
          }

          // Add current user message
          addMessage(userMessage);

          // Clear local messages and reset count only on success
          setLocalMessages([]);
          setUserMessageCount(0);
        } catch (error: unknown) {
          // On failure, keep messages in local state and continue in ghost mode
          console.warn('Auto-save failed, keeping messages in ghost mode:', error);
          setLocalMessages((prev) => [...prev, userMessage]);
        }
      } else {
        // Normal ghost mode or regular conversation
        if (isGhostMode) {
          setLocalMessages((prev) => [...prev, userMessage]);
        } else {
          addMessage(userMessage);
        }
      }

      setIsThinking(true);

      // LLM-like response time: 0.3s ~ 0.8s
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

      // Check if component is still mounted after async delay
      if (!isMountedRef.current) return;

      // Perform advanced NLU analysis
      const nluResult = analyzeInput(content, locale);

      // Get response with NLU context
      const responseContent = getResponse(content, {
        intent: nluResult.intent,
        sentiment: nluResult.sentiment,
        implicitMeaning: nluResult.implicitMeaning,
      });

      const assistantResponse = responseContent || m['app.noResults']();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: Date.now(),
      };

      // Add to context for conversation tracking
      const turn: ConversationTurn = {
        userInput: content,
        assistantResponse,
        intent: nluResult.intent,
        sentiment: nluResult.sentiment,
        entities: nluResult.entities,
        timestamp: Date.now(),
      };
      addToContext(turn);

      // Final check before state updates
      if (!isMountedRef.current) return;

      // Set streaming message for typing effect
      setStreamingMessageId(assistantMessage.id);

      if (isGhostMode && userMessageCountRef.current < 3) {
        setLocalMessages((prev) => [...prev, assistantMessage]);
      } else {
        addMessage(assistantMessage);
      }

      setIsThinking(false);

      // Clear streaming after animation completes
      setTimeout(
        () => {
          if (isMountedRef.current) {
            setStreamingMessageId(null);
          }
        },
        assistantResponse.length * 25 + 500,
      ); // Approximate streaming time
    },
    [
      ghostMode,
      addMessage,
      createConversation,
      locale,
      navigate,
      location.pathname,
      setResultContent,
    ],
  );

  // Handle new chat
  const handleNewChat = useCallback(() => {
    // Reset user message count
    setUserMessageCount(0);

    if (ghostMode) {
      setLocalMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: m['app.welcome'](),
          timestamp: Date.now(),
        },
      ]);
    } else {
      clearActive();
      const welcomeMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: m['app.welcome'](),
        timestamp: Date.now(),
      };
      createConversation(welcomeMessage);
    }
  }, [ghostMode, clearActive, createConversation]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="thinking-dot" />
            <span className="thinking-dot" />
            <span className="thinking-dot" />
          </div>
          <span className="text-sm text-[var(--color-text-tertiary)]">{m['app.thinking']()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-[var(--color-border-primary)]">
        <div>
          <h1 className="text-xl font-semibold">{m['app.title']()}</h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">{m['app.subtitle']()}</p>
        </div>
        <div className="flex items-center gap-2">
          {ghostMode && (
            <span className="px-2 py-1 text-xs bg-[var(--color-ghost-light)] text-[var(--color-ghost)] rounded-full font-medium">
              {m['app.ghostMode']()}
            </span>
          )}
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-bg-tertiary)] border-none rounded-lg cursor-pointer transition-all duration-150 hover:bg-[var(--color-bg-elevated)] active:scale-95 focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            <PlusIcon />
            <span className="hidden sm:inline">{m['app.newChat']()}</span>
          </button>
        </div>
      </div>

      {/* Messages or Welcome Screen */}
      {isEmptyConversation && !isThinking ? (
        <WelcomeScreen onPromptSelect={handleSend} locale={locale} />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={message.id === streamingMessageId}
            />
          ))}
          {isThinking && <ThinkingBlock />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-[var(--color-border-primary)]">
        <ChatInput onSend={handleSend} disabled={isThinking} />
      </div>
    </div>
  );
}

// Icons
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className={className}>
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}
