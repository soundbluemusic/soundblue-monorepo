import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '이용약관 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 서비스 이용약관.' },
];

export default function TermsKo() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t.terms.title}</h1>
      </div>
    </NavigationLayout>
  );
}
