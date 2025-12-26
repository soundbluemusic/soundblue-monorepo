import type { Message } from '~/stores';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 animate-[fadeIn_0.3s_ease-out] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium ${
          isUser
            ? 'bg-(--color-accent-primary) text-white'
            : 'bg-(--color-bg-tertiary) text-(--color-text-secondary)'
        }`}
      >
        {isUser ? 'U' : 'D'}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-(--color-accent-primary) text-white rounded-br-md'
            : 'bg-(--color-bg-tertiary) text-(--color-text-primary) rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
