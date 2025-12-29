import { useState } from 'react';
import m from '~/lib/messages';
import type { Message } from '~/stores';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className={`group flex gap-2 animate-[fadeIn_0.3s_ease-out] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
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
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-(--color-accent-primary) text-white rounded-br-md'
            : 'bg-(--color-bg-tertiary) text-(--color-text-primary) rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`self-center p-1.5 rounded-md border-none cursor-pointer transition-all duration-150 focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2 ${
          copied
            ? 'bg-green-500/15 text-green-600 dark:text-green-400'
            : 'bg-transparent text-(--color-text-tertiary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text-secondary)'
        }`}
        title={copied ? m['app.copied']() : m['app.copy']()}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}
