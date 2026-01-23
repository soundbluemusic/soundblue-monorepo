import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
import { generateSeoMeta } from '~/lib/seo';

export const Route = createFileRoute('/offline')({
  head: () => ({
    meta: [{ title: 'Offline | Sound Blue' }, ...generateSeoMeta('/offline')],
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
