import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '소개 | Sound Blue' },
  { name: 'description', content: 'SoundBlue에 대해 알아보세요.' },
];

export default function AboutKo() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t.about.title}</h1>
        <p className="text-content-muted">{t.about.intro}</p>
      </div>
    </NavigationLayout>
  );
}
