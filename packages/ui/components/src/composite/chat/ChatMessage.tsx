// ========================================
// @soundblue/ui-components/composite - ChatMessage
// Individual chat message component
// ========================================

import type { ReactNode } from 'react';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageProps {
  role: ChatMessageRole;
  content: ReactNode;
  timestamp?: Date;
  className?: string;
}

/**
 * Individual chat message
 */
export function ChatMessage({ role, content, timestamp, className = '' }: ChatMessageProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  return (
    <li
      className={`
        flex w-full list-none
        ${isUser ? 'justify-end' : 'justify-start'}
        ${isSystem ? 'justify-center' : ''}
        ${className}
      `}
    >
      <div
        className={`
          max-w-[80%] rounded-lg px-4 py-2
          ${isUser ? 'bg-blue-500 text-white' : ''}
          ${role === 'assistant' ? 'bg-gray-100 dark:bg-gray-800' : ''}
          ${isSystem ? 'bg-yellow-50 dark:bg-yellow-900/20 text-sm text-gray-600 dark:text-gray-400' : ''}
        `}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {timestamp && (
          <time
            className={`
              block mt-1 text-xs opacity-70
              ${isUser ? 'text-right' : 'text-left'}
            `}
            dateTime={timestamp.toISOString()}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        )}
      </div>
    </li>
  );
}
