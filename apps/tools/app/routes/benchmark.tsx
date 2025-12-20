import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Benchmark | Tools' },
  { name: 'description', content: 'Performance benchmark for Tools.' },
];

export default function Benchmark() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t.sidebar.benchmark}</h1>
        <p className="text-muted-foreground">Benchmark page - Coming soon</p>
      </div>
    </div>
  );
}
