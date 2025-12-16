import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { useLanguage } from '~/components/providers';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput(props: ChatInputProps): JSX.Element {
  const { t } = useLanguage();
  const [value, setValue] = createSignal('');
  const [isComposing, setIsComposing] = createSignal(false);

  const submitMessage = (): void => {
    const message = value().trim();
    if (message && !props.disabled) {
      props.onSend(message);
      setValue('');
    }
  };

  const handleSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing()) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <form onSubmit={handleSubmit} class="flex items-center gap-2 p-3 border-t border-line">
      <input
        type="text"
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder={t().chat.inputPlaceholder}
        disabled={props.disabled}
        class="flex-1 h-10 px-4 bg-surface-alt border border-line rounded-full text-sm text-content placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t().chat.inputPlaceholder}
      />
      <button
        type="submit"
        disabled={props.disabled || !value().trim()}
        class="inline-flex items-center justify-center w-10 h-10 bg-accent hover:bg-accent-hover text-white rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t().chat.send}
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </form>
  );
}
