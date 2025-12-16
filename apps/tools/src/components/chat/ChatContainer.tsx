import { type Component, createEffect, For, Show } from 'solid-js';
import { WorldClockWidget } from '@/components/widgets';
import { useLanguage } from '@/i18n';
import { parseCommand, RESPONSES } from '@/lib/commands';
import { getToolName } from '@/lib/toolCategories';
import { chatActions, chatStore } from '@/stores/chat-store';
import { toolActions, toolStore } from '@/stores/tool-store';
import type { DrumMachineSettings } from '@/tools/drum-machine';
import type { MetronomeSettings } from '@/tools/metronome';
import type { QRSettings } from '@/tools/qr-generator';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

// ========================================
// ChatContainer Component - 채팅 컨테이너
// ========================================

export const ChatContainer: Component = () => {
  const { t } = useLanguage();
  let messagesEndRef: HTMLDivElement | undefined;

  // Scroll to bottom when messages change
  createEffect(() => {
    // Track messages length to trigger scroll on new messages
    if (chatStore.messages.length > 0 && messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const handleSend = (input: string) => {
    // Add user message
    chatActions.addUserMessage(input);

    // Parse command and handle
    const intent = parseCommand(input);

    // Simulate typing delay
    chatActions.setTyping(true);
    setTimeout(() => {
      chatActions.setTyping(false);

      switch (intent.type) {
        case 'OPEN_TOOL': {
          toolActions.openTool(intent.tool);
          const toolName = getToolName(intent.tool);
          chatActions.addBotMessage(RESPONSES.openTool(toolName));
          break;
        }
        case 'CLOSE_TOOL': {
          if (toolStore.currentTool) {
            toolActions.closeTool();
            chatActions.addBotMessage(RESPONSES.closeTool);
          } else {
            chatActions.addBotMessage(RESPONSES.noToolOpen);
          }
          break;
        }
        case 'SET_PARAM': {
          // Open tool if not already open
          if (toolStore.currentTool !== intent.tool) {
            toolActions.openTool(intent.tool);
          }
          // Update settings - param is validated by parseCommand to be a known param
          const settingsUpdate = { [intent.param]: intent.value } as
            | Partial<MetronomeSettings>
            | Partial<QRSettings>
            | Partial<DrumMachineSettings>;
          toolActions.updateToolSettings(intent.tool, settingsUpdate);
          chatActions.addBotMessage(RESPONSES.setParam(intent.param, intent.value));
          break;
        }
        case 'HELP': {
          chatActions.addBotMessage(RESPONSES.help);
          break;
        }
        default: {
          chatActions.addBotMessage(RESPONSES.unknown);
        }
      }
    }, 300);
  };

  return (
    <div class="flex h-full flex-col bg-muted">
      {/* Header */}
      <div class="flex items-center justify-between border-b bg-muted px-4 py-3">
        <h2 class="font-semibold text-sm">{t().chat.title}</h2>
      </div>

      {/* Messages or World Clock */}
      <Show
        when={chatStore.messages.length > 0}
        fallback={
          <div class="flex-1 overflow-y-auto md:hidden">
            <WorldClockWidget />
          </div>
        }
      >
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <For each={chatStore.messages}>{(message) => <ChatMessage message={message} />}</For>

          {/* Typing indicator */}
          <Show when={chatStore.isTyping}>
            <div class="flex justify-start">
              <div class="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                <div class="flex gap-1">
                  <span
                    class="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce"
                    style={{ 'animation-delay': '0ms' }}
                  />
                  <span
                    class="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce"
                    style={{ 'animation-delay': '150ms' }}
                  />
                  <span
                    class="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce"
                    style={{ 'animation-delay': '300ms' }}
                  />
                </div>
              </div>
            </div>
          </Show>

          <div ref={messagesEndRef} />
        </div>
      </Show>

      {/* Desktop: empty messages area */}
      <Show when={chatStore.messages.length === 0}>
        <div class="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          {t().chat.inputPlaceholder}
        </div>
      </Show>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
};
