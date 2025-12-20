import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '뉴스 | Sound Blue' },
  { name: 'description', content: 'Sound Blue의 최신 뉴스와 업데이트.' },
];

export default function NewsKo() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">{t.news.title}</h1>
          <p className="text-content-muted">{t.news.comingSoon}</p>
        </div>
      </main>
    </div>
  );
}
