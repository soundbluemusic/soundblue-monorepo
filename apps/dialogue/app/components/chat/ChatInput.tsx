import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import m from '~/lib/messages';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input when enabled (after response)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');
    // Focus will be maintained by the useEffect above
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={m['app.placeholder']()}
        disabled={disabled}
        rows={1}
        className="flex-1 p-4 bg-(--color-bg-tertiary) border border-(--color-border-primary) rounded-xl resize-none font-inherit text-base transition-all duration-150 focus:outline-none focus:border-(--color-accent-primary) focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-(--color-text-tertiary)"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="p-4 bg-(--color-accent-primary) text-white border-none rounded-xl font-inherit text-base cursor-pointer transition-colors duration-150 hover:bg-(--color-accent-secondary) disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
      >
        {m['app.send']()}
      </button>
    </div>
  );
}
