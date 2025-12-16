import { Component, createSignal, For, onMount, createEffect } from "solid-js";
import { useI18n } from "~/i18n";
import { searchKnowledge } from "~/lib/search";
import { handleDynamicQuery } from "~/lib/handlers";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const Chat: Component = () => {
  const { t, locale } = useI18n();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isThinking, setIsThinking] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
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

  const handleNewChat = () => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: t.welcome,
        timestamp: Date.now(),
      },
    ]);
  };

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

    let responseContent: string;

    const dynamicResult = handleDynamicQuery(content, locale());

    if (dynamicResult.matched) {
      if (dynamicResult.isAsync && dynamicResult.asyncResponse) {
        responseContent = await dynamicResult.asyncResponse();
      } else {
        responseContent = dynamicResult.response || t.noResults;
      }
    } else {
      const results = searchKnowledge(content, locale());

      if (results.length > 0) {
        responseContent = results[0].answer;
      } else {
        responseContent = t.noResults;
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
    <div class="flex flex-col h-full bg-bg-primary">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main class="flex-1 overflow-y-auto py-6 max-md:py-4">
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
      </main>

      <ChatInput onSend={handleSend} disabled={isThinking()} />
    </div>
  );
};
