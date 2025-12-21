import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: '녹음 | Sound Blue' },
  { name: 'description', content: '브라우저에서 사운드 녹음.' },
];

export default function SoundRecordingKo() {
  
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['soundRecording.title']()}</h1>
        <p className="text-content-muted">{m['soundRecording.intro']()}</p>
      </div>
    </NavigationLayout>
  );
}
