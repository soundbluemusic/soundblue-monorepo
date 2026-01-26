import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import m from '~/lib/messages';
import type { Message } from '~/stores';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

/**
 * Parse simple markdown to React elements
 */
function parseMarkdown(text: string): React.ReactNode {
  // Split by code blocks first
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;

  const processInlineMarkdown = (str: string): React.ReactNode => {
    let remaining = str;
    let inlineKey = 0;

    // Bold **text** or __text__
    remaining = remaining.replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, g1, g2) => {
      return `<strong>${g1 || g2}</strong>`;
    });

    // Italic *text* or _text_
    remaining = remaining.replace(/(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)/g, (_, g1, g2) => {
      return `<em>${g1 || g2}</em>`;
    });

    // Inline code `text`
    remaining = remaining.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links [text](url)
    remaining = remaining.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    // Convert HTML strings back to elements
    if (remaining.includes('<')) {
      return <span key={inlineKey++} dangerouslySetInnerHTML={{ __html: remaining }} />;
    }

    return remaining;
  };

  const processLines = (str: string): React.ReactNode[] => {
    const lines = str.split('\n');
    const result: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let lineKey = 0;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        result.push(
          <ListTag key={`list-${lineKey++}`}>
            {listItems.map((item, i) => (
              <li key={i}>{processInlineMarkdown(item)}</li>
            ))}
          </ListTag>,
        );
        listItems = [];
        listType = null;
      }
    };

    for (const line of lines) {
      // Headers
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch?.[1] && headerMatch[2]) {
        flushList();
        const level = headerMatch[1].length as 1 | 2 | 3;
        const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
        result.push(<Tag key={`h-${lineKey++}`}>{processInlineMarkdown(headerMatch[2])}</Tag>);
        continue;
      }

      // Unordered list
      const ulMatch = line.match(/^[-*]\s+(.+)$/);
      if (ulMatch?.[1]) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^\d+\.\s+(.+)$/);
      if (olMatch?.[1]) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(olMatch[1]);
        continue;
      }

      // Blockquote
      const bqMatch = line.match(/^>\s*(.*)$/);
      if (bqMatch && bqMatch[1] !== undefined) {
        flushList();
        result.push(
          <blockquote key={`bq-${lineKey++}`}>{processInlineMarkdown(bqMatch[1])}</blockquote>,
        );
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        flushList();
        continue;
      }

      // Regular paragraph
      flushList();
      result.push(<p key={`p-${lineKey++}`}>{processInlineMarkdown(line)}</p>);
    }

    flushList();
    return result;
  };

  // Process code blocks
  for (
    let codeMatch = codeBlockRegex.exec(text);
    codeMatch !== null;
    codeMatch = codeBlockRegex.exec(text)
  ) {
    // Add text before code block
    if (codeMatch.index > lastIndex) {
      const textBefore = text.slice(lastIndex, codeMatch.index);
      parts.push(...processLines(textBefore));
    }

    // Add code block
    const language = codeMatch[1];
    const code = codeMatch[2];
    parts.push(
      <pre key={`code-${keyIndex++}`} className="relative">
        {language && (
          <span className="absolute top-2 right-2 text-xs text-[var(--color-text-tertiary)]">
            {language}
          </span>
        )}
        <code>{code}</code>
      </pre>,
    );

    lastIndex = codeMatch.index + codeMatch[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(...processLines(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * ChatMessage - Individual message component with streaming and markdown support
 */
export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
  onRegenerate,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? '' : message.content);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamIndexRef = useRef(0);

  // Streaming effect
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(message.content);
      streamIndexRef.current = message.content.length;
      return;
    }

    // Reset for new streaming
    streamIndexRef.current = 0;
    setDisplayedContent('');

    const streamContent = () => {
      if (streamIndexRef.current < message.content.length) {
        // Stream 1-3 characters at a time for natural effect
        const charsToAdd = Math.min(
          Math.floor(Math.random() * 3) + 1,
          message.content.length - streamIndexRef.current,
        );
        streamIndexRef.current += charsToAdd;
        setDisplayedContent(message.content.slice(0, streamIndexRef.current));

        // Variable delay for natural typing feel
        const delay = Math.random() * 30 + 10;
        timeoutRef.current = setTimeout(streamContent, delay);
      }
    };

    timeoutRef.current = setTimeout(streamContent, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isStreaming, message.content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    }
  }, [message.content]);

  // Memoize parsed markdown
  const renderedContent = useMemo(() => {
    if (isUser) {
      return <p className="whitespace-pre-wrap break-words">{displayedContent}</p>;
    }
    return (
      <div className="markdown-content whitespace-pre-wrap break-words">
        {parseMarkdown(displayedContent)}
      </div>
    );
  }, [displayedContent, isUser]);

  const showCursor = isStreaming && streamIndexRef.current < message.content.length;

  return (
    <div
      className={`message-container group flex gap-3 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium ${
          isUser
            ? 'bg-[var(--color-accent-primary)] text-white'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
        }`}
      >
        {isUser ? 'U' : 'D'}
      </div>

      {/* Message content */}
      <div
        className={`relative max-w-[75%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-[var(--color-accent-primary)] text-white rounded-br-md'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-bl-md'
        }`}
      >
        {renderedContent}
        {showCursor && <span className="typing-cursor" />}
      </div>

      {/* Action buttons */}
      <div
        className={`message-actions self-center flex items-center gap-1 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className={`p-1.5 rounded-md border-none cursor-pointer transition-all duration-150 focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2 ${
            copied
              ? 'bg-green-500/15 text-green-600 dark:text-green-400'
              : 'bg-transparent text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]'
          }`}
          title={copied ? m['app.copied']() : m['app.copy']()}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>

        {/* Regenerate button (assistant only) */}
        {!isUser && onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="p-1.5 rounded-md bg-transparent border-none cursor-pointer text-[var(--color-text-tertiary)] transition-all duration-150 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
            title={m['app.regenerate']?.() || 'Regenerate'}
          >
            <RegenerateIcon />
          </button>
        )}
      </div>
    </div>
  );
});

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

function RegenerateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}
