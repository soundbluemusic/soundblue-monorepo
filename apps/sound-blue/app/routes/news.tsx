import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'News | Sound Blue' },
  { name: 'description', content: 'Latest news and updates from Sound Blue.' },
];

export default function News() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t.news.title}</h1>
        <p className="text-content-muted">{t.news.comingSoon}</p>
      </div>
    </NavigationLayout>
  );
}
