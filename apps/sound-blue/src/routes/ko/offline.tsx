import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/offline')({
  head: () => ({
    meta: [{ title: '오프라인 | Sound Blue' }],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/offline' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/offline' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/offline' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/offline' },
    ],
  }),
  component: Offline,
});

function Offline() {
  return (
    <NavigationLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-content mb-4">{m['offline.title']()}</h1>
          <p className="text-content-muted">{m['offline.message']()}</p>
        </div>
      </div>
    </NavigationLayout>
  );
}
