import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'License | Sound Blue' },
  { name: 'description', content: 'Sound recording license information.' },
];

export default function License() {
  const { t } = useI18n();
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6 prose">
        <h1>{t.license.title}</h1>
        <h2>{t.license.soundRecording.title}</h2>
        <p>{t.license.soundRecording.description}</p>
        <h3>{t.license.soundRecording.permitted.title}</h3>
        <ul>
          {t.license.soundRecording.permitted.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <h3>{t.license.soundRecording.prohibited.title}</h3>
        <ul>
          {t.license.soundRecording.prohibited.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </NavigationLayout>
  );
}
