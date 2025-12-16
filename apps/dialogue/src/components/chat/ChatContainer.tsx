import { Component, createSignal, For, createEffect, onMount, Show } from "solid-js";
import { useI18n } from "~/i18n";
import { translations } from "~/i18n/translations";
import { searchKnowledge } from "~/lib/search";
import { handleDynamicQuery } from "~/lib/handlers";
import { detectLanguage } from "~/lib/language-detector";
import { ChatMessage } from "../ChatMessage";
import { ChatInput } from "../ChatInput";
import {
  chatStore,
  chatActions,
  generateId,
  Message,
} from "~/stores/chat-store";

// ========================================
// ChatContainer Component - 채팅 컨테이너
// ========================================

interface ChatContainerProps {
  onNewChat?: () => void;
  resetTrigger?: number;
}

export const ChatContainer: Component<ChatContainerProps> = (props) => {
  const { t, locale } = useI18n();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isThinking, setIsThinking] = createSignal(false);
  const [conversationStarted, setConversationStarted] = createSignal(false);
  let messagesEndRef: HTMLDivElement | undefined;

  // Initialize with welcome message
  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: t.welcome,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
    setConversationStarted(false);
    chatActions.clearActive();
  };

  onMount(() => {
    initializeChat();
  });

  // Scroll to bottom when messages change
  createEffect(() => {
    if (messagesEndRef && messages().length > 0) {
      messagesEndRef.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Load conversation when activeConversationId changes
  createEffect(() => {
    const activeId = chatStore.activeConversationId;
    if (activeId) {
      const conversation = chatStore.conversations.find((c) => c.id === activeId);
      if (conversation && conversation.messages.length > 0) {
        setMessages([...conversation.messages]);
        setConversationStarted(true);
      }
    }
  });

  const resetChat = () => {
    initializeChat();
    props.onNewChat?.();
  };

  // Listen for reset trigger from parent
  createEffect(() => {
    const trigger = props.resetTrigger;
    if (trigger !== undefined && trigger > 0) {
      resetChat();
    }
  });

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Start a new conversation if needed (not in ghost mode)
    if (!conversationStarted() && !chatStore.ghostMode) {
      const welcomeMsg = messages()[0];
      if (welcomeMsg) {
        chatActions.createConversation(welcomeMsg);
      }
      setConversationStarted(true);
    }

    setMessages((prev) => [...prev, userMessage]);

    // Save to store (only if not in ghost mode)
    if (!chatStore.ghostMode) {
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

      if (results.length > 0) {
        responseContent = results[0].answer;
      } else {
        responseContent = localizedT.noResults;
      }
    }

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
    };

    setIsThinking(false);
    setMessages((prev) => [...prev, assistantMessage]);

    // Save to store (only if not in ghost mode)
    if (!chatStore.ghostMode) {
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
        <For each={messages()}>
          {(message) => <ChatMessage message={message} />}
        </For>

        {isThinking() && (
          <div class="flex items-center gap-3 px-6 py-4 animate-fade-in">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-accent rounded-full animate-typing" style="animation-delay: 0s" />
              <span class="w-2 h-2 bg-accent rounded-full animate-typing" style="animation-delay: 0.2s" />
              <span class="w-2 h-2 bg-accent rounded-full animate-typing" style="animation-delay: 0.4s" />
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
