import { Component, createSignal } from "solid-js";
import { useI18n } from "~/i18n";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: Component<ChatInputProps> = (props) => {
  const { t } = useI18n();
  const [input, setInput] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const message = input().trim();
    if (message && !props.disabled) {
      props.onSend(message);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form class="px-6 py-4 bg-bg-secondary border-t border-border max-md:px-4 max-md:py-3" onSubmit={handleSubmit}>
      <div class="flex items-end gap-3 max-w-225 mx-auto bg-bg-tertiary rounded-[--radius-md] p-2 pl-4 border border-border transition-colors duration-200 focus-within:border-accent max-md:p-1 max-md:pl-3">
        <textarea
          class="flex-1 resize-none min-h-6 max-h-37.5 py-2 text-base leading-normal text-text-primary bg-transparent outline-none placeholder:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          disabled={props.disabled}
          rows={1}
          aria-label={t.placeholder}
        />
        <button
          type="submit"
          class="w-10 h-10 rounded-[--radius-sm] bg-accent text-white flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-accent-hover active:scale-95 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed disabled:active:scale-100"
          disabled={!input().trim() || props.disabled}
          aria-label={t.send}
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
