import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '라이선스 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 라이선스 정보.' },
];

export default function LicenseKo() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">{t.license.title}</h1>
          <p className="text-[var(--color-text-secondary)]">
            {t.license.soundRecording.description}
          </p>
        </div>
      </main>
    </div>
  );
}
