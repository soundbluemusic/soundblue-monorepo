import type { JSX } from 'solid-js';
import { cn } from '~/lib/utils';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage(props: ChatMessageProps): JSX.Element {
  const isBot = () => props.message.type === 'bot';

  return (
    <li class={cn('flex w-full list-none', isBot() ? 'justify-start' : 'justify-end')}>
      <div
        class={cn(
          'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isBot()
            ? 'bg-surface-alt text-content rounded-bl-md'
            : 'bg-accent text-white rounded-br-md',
        )}
      >
        {props.message.content}
      </div>
    </li>
  );
}
