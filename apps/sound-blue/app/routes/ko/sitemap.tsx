import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '사이트맵 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 웹사이트의 모든 페이지.' },
];

export default function SitemapKo() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t.sitemap.title}</h1>
      </div>
    </NavigationLayout>
  );
}
