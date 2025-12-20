import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [{ title: 'Offline | Sound Blue' }];

export default function Offline() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
          {t.offline.title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{t.offline.message}</p>
      </div>
    </div>
  );
}
