import { useLocation, useNavigate } from '@solidjs/router';
import type { Component } from 'solid-js';
import { createEffect, createSignal, For, onMount, Show } from 'solid-js';
import { useI18n } from '~/i18n';
import { translations } from '~/i18n/translations';
import { handleDynamicQuery } from '~/lib/handlers';
import { detectLanguage } from '~/lib/language-detector';
import { searchKnowledge } from '~/lib/search';
import type { Message } from '~/stores/chat-store';
import { chatActions, chatStore, generateId } from '~/stores/chat-store';
import { ChatInput } from '../ChatInput';
import { ChatMessage } from '../ChatMessage';

// ========================================
// ChatContainer Component - 채팅 컨테이너
// ========================================

interface ChatContainerProps {
  onNewChat?: () => void;
  resetTrigger?: number;
  loadTrigger?: number;
}

export const ChatContainer: Component<ChatContainerProps> = (props) => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isThinking, setIsThinking] = createSignal(false);
  let messagesEndRef: HTMLDivElement | undefined;

  // Track previous trigger values to detect actual changes
  let prevResetTrigger = 0;
  let prevLoadTrigger = 0;

  // Helper to get localized chat path
  const getChatPath = (id: string) => {
    const isKorean = location.pathname.startsWith('/ko');
    return isKorean ? `/ko/c/${id}` : `/c/${id}`;
  };

  // Helper to get home path
  const getHomePath = () => {
    const isKorean = location.pathname.startsWith('/ko');
    return isKorean ? '/ko' : '/';
  };

  // Initialize with welcome message
  const initializeChat = () => {
    // Clear active conversation FIRST to prevent race conditions
    // 먼저 활성 대화를 클리어하여 race condition 방지
    chatActions.clearActive();

    const welcomeMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: t.welcome,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  };

  onMount(() => {
    initializeChat();
  });

  // Scroll to bottom when messages change
  createEffect(() => {
    if (messagesEndRef && messages().length > 0) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Load conversation when activeConversationId changes (from route or sidebar)
  // Track previous active ID to detect actual changes
  let prevActiveId: string | null = null;

  createEffect(() => {
    const isHydrated = chatStore.isHydrated;
    if (!isHydrated) return;

    const activeId = chatStore.activeConversationId;

    // Only react to actual ID changes
    if (activeId === prevActiveId) return;
    prevActiveId = activeId;

    if (activeId) {
      const conversation = chatStore.conversations.find((c) => c.id === activeId);
      if (conversation && conversation.messages.length > 0) {
        setMessages([...conversation.messages]);
      }
    }
  });

  // Also handle explicit load trigger from sidebar (for backwards compatibility)
  createEffect(() => {
    const trigger = props.loadTrigger ?? 0;
    if (trigger <= prevLoadTrigger) return;
    prevLoadTrigger = trigger;
    // The activeConversationId effect above will handle the actual loading
  });

  const resetChat = () => {
    initializeChat();
    // Navigate to home when starting new chat
    const currentPath = location.pathname;
    const homePath = getHomePath();
    if (currentPath !== homePath && currentPath !== `${homePath}/`) {
      navigate(homePath, { replace: true });
    }
    props.onNewChat?.();
  };

  // Listen for reset trigger from parent (only when actually changed)
  createEffect(() => {
    const trigger = props.resetTrigger ?? 0;
    if (trigger > prevResetTrigger) {
      prevResetTrigger = trigger;
      resetChat();
    }
  });

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Start a new conversation if needed (not in ghost mode)
    // Use activeConversationId check instead of conversationStarted for atomicity
    // conversationStarted 대신 activeConversationId 체크하여 원자성 보장
    if (!chatStore.activeConversationId && !chatStore.ghostMode) {
      const welcomeMsg = messages()[0];
      if (welcomeMsg) {
        const newConversation = chatActions.createConversation(welcomeMsg);
        // Update URL to reflect new conversation
        if (newConversation) {
          navigate(getChatPath(newConversation.id), { replace: true });
        }
      }
    }

    setMessages((prev) => [...prev, userMessage]);

    // Save to store (only if not in ghost mode and has active conversation)
    if (!chatStore.ghostMode && chatStore.activeConversationId) {
      chatActions.addMessage(userMessage);
    }

    setIsThinking(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Detect language from user input (fallback to URL locale)
    const detectedLocale = detectLanguage(content, locale());
    const localizedT = translations[detectedLocale].app;

    let responseContent: string;

    const dynamicResult = handleDynamicQuery(content, detectedLocale);

    if (dynamicResult.matched) {
      if (dynamicResult.isAsync && dynamicResult.asyncResponse) {
        responseContent = await dynamicResult.asyncResponse();
      } else {
        responseContent = dynamicResult.response || localizedT.noResults;
      }
    } else {
      const results = searchKnowledge(content, detectedLocale);

      if (results.length > 0 && results[0]) {
        responseContent = results[0].answer;
      } else {
        responseContent = localizedT.noResults;
      }
    }

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now(),
    };

    setIsThinking(false);
    setMessages((prev) => [...prev, assistantMessage]);

    // Save to store (only if not in ghost mode and has active conversation)
    if (!chatStore.ghostMode && chatStore.activeConversationId) {
      chatActions.addMessage(assistantMessage);
    }
  };

  return (
    <div class="flex h-full flex-col bg-bg-chat">
      {/* Header */}
      <div class="flex items-center justify-between border-b border-border bg-bg-secondary px-4 py-3">
        <div class="flex items-center gap-2">
          <h2 class="font-semibold text-sm text-text-primary">{t.title}</h2>
          <Show when={chatStore.ghostMode}>
            <span class="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
              {t.ghostMode}
            </span>
          </Show>
        </div>
      </div>

      {/* Messages */}
      <div class="flex-1 overflow-y-auto py-4">
        <For each={messages()}>{(message) => <ChatMessage message={message} />}</For>

        {isThinking() && (
          <div class="flex items-center gap-3 px-6 py-4 animate-fade-in">
            <div class="flex gap-1">
              <span
                class="w-2 h-2 bg-accent rounded-full animate-typing"
                style="animation-delay: 0s"
              />
              <span
                class="w-2 h-2 bg-accent rounded-full animate-typing"
                style="animation-delay: 0.2s"
              />
              <span
                class="w-2 h-2 bg-accent rounded-full animate-typing"
                style="animation-delay: 0.4s"
              />
            </div>
            <span class="text-text-muted text-sm">{t.thinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isThinking()} />
    </div>
  );
};

// Re-export for convenience
export { ChatContainer as default };
