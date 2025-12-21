import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: '개인정보처리방침 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 개인정보처리방침.' },
];

export default function PrivacyKo() {
  
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['privacy.title']()}</h1>
      </div>
    </NavigationLayout>
  );
}
