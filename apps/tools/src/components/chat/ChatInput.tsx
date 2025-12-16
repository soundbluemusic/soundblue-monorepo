import { Send } from 'lucide-solid';
import { type Component, createSignal } from 'solid-js';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

// ========================================
// ChatInput Component - 채팅 입력창
// ========================================

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: Component<ChatInputProps> = (props) => {
  const { t } = useLanguage();
  const [value, setValue] = createSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const trimmed = value().trim();
    if (trimmed && !props.disabled) {
      props.onSend(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // IME 조합 중에는 Enter 무시 (한글 입력 시 중복 전송 방지)
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="flex items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t bg-background"
    >
      <input
        type="text"
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder ?? t().chat.inputPlaceholder}
        disabled={props.disabled}
        class={cn(
          'flex-1 rounded-full border bg-muted/50 px-4 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'transition-all duration-200 ease-out',
          // Visible color contrast on hover
          'hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:border-primary/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background focus-visible:border-primary/50',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
      <button
        type="submit"
        disabled={props.disabled || !value().trim()}
        class={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          'bg-primary text-primary-foreground',
          'transition-all duration-200 ease-out',
          // Strong color contrast on hover - darker primary
          'hover:bg-primary/80 hover:shadow-lg hover:shadow-primary/30',
          'active:bg-primary/70',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-none'
        )}
        aria-label={t().chat.send}
      >
        <Send class="h-4 w-4" />
      </button>
    </form>
  );
};
