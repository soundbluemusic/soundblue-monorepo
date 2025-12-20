import { cn } from '@soundblue/shared-react';
import type { Message } from '~/stores';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
        )}
      >
        {isUser ? 'U' : 'D'}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 rounded-2xl',
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
