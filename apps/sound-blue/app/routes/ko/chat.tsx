import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '채팅 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 어시스턴트와 채팅하세요.' },
];

export default function ChatKo() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">{t.chat.title}</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">{t.chat.subtitle}</p>
          <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
            {t.chat.welcome}
          </div>
        </div>
      </main>
    </div>
  );
}
