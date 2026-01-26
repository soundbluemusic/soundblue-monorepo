import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import m from '~/lib/messages';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MAX_HEIGHT = 200; // Max textarea height in pixels
const MIN_HEIGHT = 56; // Min textarea height (single line)

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Auto-focus input when enabled (after response)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Adjust height on input change
  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');

    // Reset height after send
    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div
      className={`input-shimmer relative flex gap-2 items-end p-1 rounded-2xl border transition-all duration-200 ${
        isFocused
          ? 'border-[var(--color-accent-primary)] shadow-[0_0_0_3px_var(--color-accent-light)]'
          : 'border-[var(--color-border-primary)]'
      } bg-[var(--color-bg-tertiary)]`}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={m['app.placeholder']()}
        disabled={disabled}
        rows={1}
        className="flex-1 p-3 bg-transparent border-none rounded-xl resize-none font-inherit text-base focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--color-text-tertiary)] overflow-y-auto"
        style={{
          minHeight: `${MIN_HEIGHT}px`,
          maxHeight: `${MAX_HEIGHT}px`,
        }}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={`shrink-0 p-3 rounded-xl font-inherit text-base cursor-pointer transition-all duration-200 border-none focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2 ${
          disabled || !input.trim()
            ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed'
            : 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-secondary)] hover:scale-105 active:scale-95'
        }`}
      >
        <SendIcon />
      </button>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
