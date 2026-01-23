import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/chat')({
  head: () => ({
    meta: [
      { title: '채팅 | Sound Blue' },
      { name: 'description', content: 'Sound Blue 어시스턴트와 대화하세요.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/chat' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/chat' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/chat' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/chat' },
    ],
  }),
  component: Chat,
});

function Chat() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['chat.title']()}</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">{m['chat.subtitle']()}</p>
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
          {m['chat.welcome']()}
        </div>
      </div>
    </NavigationLayout>
  );
}
