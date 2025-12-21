import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: '소개 | Sound Blue' },
  { name: 'description', content: 'SoundBlue에 대해 알아보세요.' },
];

export default function AboutKo() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['about.title']()}</h1>
        <p className="text-content-muted">{m['about.intro']()}</p>
      </div>
    </NavigationLayout>
  );
}
