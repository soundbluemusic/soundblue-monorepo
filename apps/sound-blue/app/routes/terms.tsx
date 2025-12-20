import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Terms of Service | Sound Blue' },
  {
    name: 'description',
    content: 'Terms and conditions for using Sound Blue website and services.',
  },
];

export default function Terms() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6 prose">
          <h1>{t.terms.title}</h1>
          <h2>{t.terms.sections.use.title}</h2>
          <p>{t.terms.sections.use.content}</p>
          <h2>{t.terms.sections.copyright.title}</h2>
          <p>{t.terms.sections.copyright.content}</p>
          <h2>{t.terms.sections.disclaimer.title}</h2>
          <p>{t.terms.sections.disclaimer.content}</p>
          <h2>{t.terms.sections.changes.title}</h2>
          <p>{t.terms.sections.changes.content}</p>
        </div>
      </main>
    </div>
  );
}
