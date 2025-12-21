import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Privacy Policy | Sound Blue' },
  { name: 'description', content: "Sound Blue's privacy policy." },
];

export default function Privacy() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6 prose">
        <h1>{t.privacy.title}</h1>
        <h2>{t.privacy.sections.collection.title}</h2>
        <p>{t.privacy.sections.collection.content}</p>
        <h2>{t.privacy.sections.cookies.title}</h2>
        <p>{t.privacy.sections.cookies.content}</p>
        <h2>{t.privacy.sections.thirdParty.title}</h2>
        <p>{t.privacy.sections.thirdParty.content}</p>
        <h2>{t.privacy.sections.contact.title}</h2>
        <p>{t.privacy.sections.contact.content}</p>
      </div>
    </NavigationLayout>
  );
}
