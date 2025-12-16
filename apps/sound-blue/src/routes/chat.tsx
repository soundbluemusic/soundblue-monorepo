import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { NavigationLayout } from '~/components';
import type { TopicType } from '~/components/chat';
import { ChatContainer, InfoPanel } from '~/components/chat';
import { PageSeo } from '~/components/seo';

export default function ChatPage(): JSX.Element {
  const [selectedTopic, setSelectedTopic] = createSignal<TopicType>(null);

  const handleTopicSelect = (topic: TopicType): void => {
    setSelectedTopic(topic);
  };

  return (
    <NavigationLayout>
      <PageSeo page="chat" />

      <div class="flex h-[calc(100vh-var(--header-height)-var(--bottom-nav-height,0px))] md:h-[calc(100vh-var(--header-height))]">
        {/* Chat Container */}
        <div class="flex-1 min-w-0 md:max-w-[50%] lg:max-w-[45%]">
          <ChatContainer onTopicSelect={handleTopicSelect} />
        </div>

        {/* Info Panel - Hidden on mobile */}
        <div class="hidden md:block flex-1">
          <InfoPanel selectedTopic={selectedTopic()} />
        </div>
      </div>
    </NavigationLayout>
  );
}
