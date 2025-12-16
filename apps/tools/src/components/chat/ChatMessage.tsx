import type { Component } from 'solid-js';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import type { Message } from '@/stores/chat-store';

// ========================================
// ChatMessage Component - 개별 채팅 메시지
// ========================================

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: Component<ChatMessageProps> = (props) => {
  const { t } = useLanguage();
  const isBot = () => props.message.type === 'bot';

  // Get translated content for special messages (e.g., welcome message)
  const getContent = () => {
    if (props.message.id === 'welcome') {
      return t().chat.welcome;
    }
    return props.message.content;
  };

  return (
    <div class={cn('flex w-full', isBot() ? 'justify-start' : 'justify-end')}>
      <div
        class={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
          isBot()
            ? 'bg-muted text-foreground rounded-bl-md'
            : 'bg-primary text-primary-foreground rounded-br-md'
        )}
      >
        <p class="whitespace-pre-wrap break-words">{getContent()}</p>
      </div>
    </div>
  );
};
