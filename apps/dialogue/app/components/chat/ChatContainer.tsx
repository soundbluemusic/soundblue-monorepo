import { getLocalizedPath } from '@soundblue/i18n';
import { getLocaleFromPath } from '@soundblue/locale';
import { addToContext, analyzeInput, type ConversationTurn } from '@soundblue/nlu';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import m from '~/lib/messages';
import { detectLanguageSwitch, detectToolRequest, getResponse } from '~/lib/response-handler';
import { generateId, type Message, useChatStore, useUIStore } from '~/stores';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export function ChatContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
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
  } = useChatStore();

  const { setResultContent } = useUIStore();

  // Get messages from active conversation or local state (ghost mode)
  const activeConversation = getActiveConversation();
  const messages = ghostMode ? localMessages : (activeConversation?.messages ?? []);

  // Initialize with welcome message
  useEffect(() => {
    if (!isHydrated) return;

    // If no active conversation and not ghost mode, create one
    if (!activeConversationId && !ghostMode) {
      const welcomeMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: m['app.welcome'](),
        timestamp: Date.now(),
      };
      createConversation(welcomeMessage);
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
  }, [isHydrated, activeConversationId, ghostMode, createConversation, localMessages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract locale from pathname to ensure it's tracked as dependency
  const locale = getLocaleFromPath(location.pathname);

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
          if (isMountedRef.current) navigate(newPath);
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

      // LLM-like response time: 0.1s ~ 0.5s (100ms ~ 500ms)
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

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

      if (isGhostMode && userMessageCountRef.current < 3) {
        setLocalMessages((prev) => [...prev, assistantMessage]);
      } else {
        addMessage(assistantMessage);
      }

      setIsThinking(false);
    },
    [ghostMode, addMessage, createConversation, locale, navigate],
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
        <div className="animate-pulse text-[var(--color-text-tertiary)]">{m['app.thinking']()}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-primary)]">
        <div>
          <h1 className="text-xl font-semibold">{m['app.title']()}</h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">{m['app.subtitle']()}</p>
        </div>
        <div className="flex items-center gap-2">
          {ghostMode && (
            <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400 rounded">
              {m['app.ghostMode']()}
            </span>
          )}
          <button
            type="button"
            onClick={handleNewChat}
            className="px-4 py-1 text-sm bg-[var(--color-bg-tertiary)] border-none rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-elevated)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          >
            {m['app.newChat']()}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isThinking && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 text-sm font-medium text-[var(--color-text-secondary)]">
              D
            </div>
            <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-2xl rounded-bl-md">
              <span className="animate-pulse">{m['app.thinking']()}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--color-border-primary)]">
        <ChatInput onSend={handleSend} disabled={isThinking} />
      </div>
    </div>
  );
}
