import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: '라이선스 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 라이선스 정보.' },
];

export default function LicenseKo() {
  
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['license.title']()}</h1>
        <p className="text-content-muted">{m['license.soundRecording.description']()}</p>
      </div>
    </NavigationLayout>
  );
}
