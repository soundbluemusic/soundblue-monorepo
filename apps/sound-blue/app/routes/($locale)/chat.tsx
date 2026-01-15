import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Chat | Sound Blue' },
  { name: 'description', content: 'Chat with Sound Blue assistant.' },
  ...getSeoMeta(location),
];

export default function Chat() {
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
