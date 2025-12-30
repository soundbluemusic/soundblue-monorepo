// ========================================
// @soundblue/ui-components/composite - ChatInput
// Chat input component with send button
// ========================================

import { type FormEvent, type KeyboardEvent, useCallback, useState } from 'react';

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Chat input with send button
 */
export function ChatInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !disabled) {
        onSend(trimmed);
        setValue('');
      }
    },
    [value, disabled, onSend],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed && !disabled) {
          onSend(trimmed);
          setValue('');
        }
      }
    },
    [value, disabled, onSend],
  );

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="
          flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600
          px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          dark:bg-gray-800 dark:text-white
        "
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="
          px-4 py-2 rounded-lg bg-blue-500 text-white
          hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
}
