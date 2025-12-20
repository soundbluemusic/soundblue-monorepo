import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Sound Recording | Sound Blue' },
  { name: 'description', content: 'Field recording library by Sound Blue.' },
];

export default function SoundRecording() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6 prose">
          <h1>{t.soundRecording.title}</h1>
          <p className="text-lg">{t.soundRecording.intro}</p>
          <h2>{t.soundRecording.about.title}</h2>
          <p>{t.soundRecording.about.content}</p>
          <h2>{t.soundRecording.types.title}</h2>
          <ul>
            {t.soundRecording.types.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h2>{t.soundRecording.downloads.title}</h2>
          <p>{t.soundRecording.downloads.content}</p>
        </div>
      </main>
    </div>
  );
}
