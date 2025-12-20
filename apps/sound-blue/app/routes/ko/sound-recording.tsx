import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '녹음 | Sound Blue' },
  { name: 'description', content: '브라우저에서 사운드 녹음.' },
];

export default function SoundRecordingKo() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">{t.soundRecording.title}</h1>
          <p className="text-[var(--color-text-secondary)]">{t.soundRecording.intro}</p>
        </div>
      </main>
    </div>
  );
}
