import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Blog | Sound Blue' },
  { name: 'description', content: "Sound Blue's blog." },
];

export default function Blog() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t.blog.title}</h1>
        <p className="text-content-muted">{t.blog.comingSoon}</p>
      </div>
    </NavigationLayout>
  );
}
