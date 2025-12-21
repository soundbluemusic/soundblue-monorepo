import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [{ title: 'Offline | Sound Blue' }];

export default function Offline() {
  
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
