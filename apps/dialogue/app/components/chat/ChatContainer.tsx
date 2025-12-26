import { getLocalizedPath } from '@soundblue/shared-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import m from '~/lib/messages';
import { addToContext, analyzeInput, type ConversationTurn } from '~/lib/nlu';
import { detectLanguageSwitch, getResponse, initializeQA } from '~/lib/response-handler';
import { getLocale } from '~/paraglide/runtime';
import { generateId, type Message, useChatStore } from '~/stores';
import styles from './ChatContainer.module.scss';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export function ChatContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [qaInitialized, setQaInitialized] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);

  const {
    isHydrated,
    ghostMode,
    activeConversationId,
    getActiveConversation,
    createConversation,
    addMessage,
    clearActive,
  } = useChatStore();

  // Initialize Q&A database
  useEffect(() => {
    if (!qaInitialized) {
      initializeQA()
        .then(() => {
          setQaInitialized(true);
        })
        .catch((error) => {
          console.warn('Q&A initialization failed:', error);
          setQaInitialized(true); // Continue anyway
        });
    }
  }, [qaInitialized]);

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

  // Handle sending a message with advanced NLU
  const handleSend = useCallback(
    async (content: string) => {
      const locale = typeof getLocale === 'function' ? getLocale() : 'en';

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

        if (ghostMode) {
          setLocalMessages((prev) => [...prev, userMessage, switchMessage]);
        } else {
          addMessage(userMessage);
          addMessage(switchMessage);
        }

        // Redirect to target language page
        const currentPath = location.pathname.replace(/^\/(ko|en)/, '') || '/';
        const newPath = getLocalizedPath(currentPath, languageSwitch.targetLocale);

        setTimeout(() => {
          navigate(newPath);
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

        if (ghostMode) {
          setLocalMessages((prev) => [...prev, userMessage, alreadyOnPageMessage]);
        } else {
          addMessage(userMessage);
          addMessage(alreadyOnPageMessage);
        }
        return;
      }

      // Normal message flow
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      // Increment user message count
      const newUserMessageCount = userMessageCount + 1;
      setUserMessageCount(newUserMessageCount);

      // Auto-save after 3 messages in ghost mode
      if (ghostMode && newUserMessageCount >= 3 && localMessages.length > 0) {
        // Convert to regular conversation
        const welcomeMessage: Message = localMessages[0] || {
          id: generateId(),
          role: 'assistant',
          content: m['app.welcome'](),
          timestamp: Date.now(),
        };

        // Create conversation with all existing messages
        createConversation(welcomeMessage);

        // Add all previous messages
        for (let i = 1; i < localMessages.length; i++) {
          addMessage(localMessages[i]);
        }

        // Add current user message
        addMessage(userMessage);

        // Clear local messages and reset count
        setLocalMessages([]);
        setUserMessageCount(0);
      } else {
        // Normal ghost mode or regular conversation
        if (ghostMode) {
          setLocalMessages((prev) => [...prev, userMessage]);
        } else {
          addMessage(userMessage);
        }
      }

      setIsThinking(true);

      // LLM-like response time: 0.1s ~ 0.5s (100ms ~ 500ms)
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

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

      if (ghostMode && userMessageCount < 3) {
        setLocalMessages((prev) => [...prev, assistantMessage]);
      } else {
        addMessage(assistantMessage);
      }

      setIsThinking(false);
    },
    [
      ghostMode,
      addMessage,
      userMessageCount,
      localMessages,
      createConversation,
      location.pathname,
      navigate,
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
      <div className={styles.loading}>
        <div className={styles.loadingText}>{m['app.thinking']()}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{m['app.title']()}</h1>
          <p className={styles.subtitle}>{m['app.subtitle']()}</p>
        </div>
        <div className={styles.headerRight}>
          {ghostMode && <span className={styles.ghostBadge}>{m['app.ghostMode']()}</span>}
          <button type="button" onClick={handleNewChat} className={styles.newChatButton}>
            {m['app.newChat']()}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isThinking && (
          <div className={styles.thinking}>
            <div className={styles.thinkingAvatar}>D</div>
            <div className={styles.thinkingBubble}>
              <span className={styles.thinkingText}>{m['app.thinking']()}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <ChatInput onSend={handleSend} disabled={isThinking} />
      </div>
    </div>
  );
}
