import { Component, createSignal, For, createEffect, onMount } from "solid-js";
import { useI18n } from "~/i18n";
import { translations } from "~/i18n/translations";
import { searchKnowledge } from "~/lib/search";
import { handleDynamicQuery } from "~/lib/handlers";
import { detectLanguage } from "~/lib/language-detector";
import { ChatMessage, Message } from "../ChatMessage";
import { ChatInput } from "../ChatInput";

// ========================================
// ChatContainer Component - 채팅 컨테이너
// ========================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface ChatContainerProps {
  onNewChat?: () => void;
  resetTrigger?: number;
}

export const ChatContainer: Component<ChatContainerProps> = (props) => {
  const { t, locale } = useI18n();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isThinking, setIsThinking] = createSignal(false);
  let messagesEndRef: HTMLDivElement | undefined;

  onMount(() => {
    const welcomeMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: t.welcome,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  });

  createEffect(() => {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: "smooth" });
    }
  });

  const resetChat = () => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: t.welcome,
        timestamp: Date.now(),
      },
    ]);
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
    setMessages((prev) => [...prev, userMessage]);

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
  };

  return (
    <div class="flex h-full flex-col bg-bg-chat">
      {/* Header */}
      <div class="flex items-center justify-between border-b border-border bg-bg-secondary px-4 py-3">
        <h2 class="font-semibold text-sm text-text-primary">{t.title}</h2>
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
