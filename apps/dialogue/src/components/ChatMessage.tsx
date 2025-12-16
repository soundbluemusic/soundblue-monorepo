import { Component, Show } from "solid-js";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: Component<ChatMessageProps> = (props) => {
  const isUser = () => props.message.role === "user";

  return (
    <div
      class="flex gap-3 px-6 py-4 animate-fade-in max-md:px-4 max-md:py-3"
      classList={{ "flex-row-reverse": isUser() }}
    >
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        classList={{
          "bg-accent text-white": isUser(),
          "bg-assistant-bubble text-accent": !isUser()
        }}
      >
        <Show when={isUser()} fallback={<AssistantIcon />}>
          <UserIcon />
        </Show>
      </div>
      <div
        class="max-w-[70%] px-4 py-3 rounded-[--radius-md] leading-normal max-md:max-w-[85%]"
        classList={{
          "bg-user-bubble text-white rounded-br-[4px]": isUser(),
          "bg-assistant-bubble text-text-primary rounded-bl-[4px]": !isUser()
        }}
      >
        <p class="m-0 whitespace-pre-wrap break-words">{props.message.content}</p>
      </div>
    </div>
  );
};

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const AssistantIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
