import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [{ title: 'Offline | Sound Blue' }];

export default function Offline() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-content mb-4">{t.offline.title}</h1>
        <p className="text-content-muted">{t.offline.message}</p>
      </div>
    </div>
  );
}
