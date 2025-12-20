import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '벤치마크 | Tools' },
  { name: 'description', content: 'Tools 성능 벤치마크.' },
];

export default function BenchmarkKo() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t.sidebar.benchmark}</h1>
        <p className="text-muted-foreground">벤치마크 페이지 - 준비 중</p>
      </div>
    </div>
  );
}
