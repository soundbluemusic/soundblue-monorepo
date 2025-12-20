import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '개인정보처리방침 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 개인정보처리방침.' },
];

export default function PrivacyKo() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">{t.privacy.title}</h1>
        </div>
      </main>
    </div>
  );
}
