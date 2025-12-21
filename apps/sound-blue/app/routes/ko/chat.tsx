import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: '채팅 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 어시스턴트와 채팅하세요.' },
];

export default function ChatKo() {
  
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['chat.title']()}</h1>
        <p className="text-content-muted mb-8">{m['chat.subtitle']()}</p>
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-content-muted">
          {m['chat.welcome']()}
        </div>
      </div>
    </NavigationLayout>
  );
}
