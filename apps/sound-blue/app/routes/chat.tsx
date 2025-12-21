import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Chat | Sound Blue' },
  { name: 'description', content: 'Chat with Sound Blue assistant.' },
];

export default function Chat() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t.chat.title}</h1>
        <p className="text-content-muted mb-8">{t.chat.subtitle}</p>
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-content-muted">
          {t.chat.welcome}
        </div>
      </div>
    </NavigationLayout>
  );
}
