import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Built With | Sound Blue' },
  { name: 'description', content: 'Technologies used to build Sound Blue website.' },
];

export default function BuiltWith() {
  const { t } = useI18n();
  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">{t.builtWith.title}</h1>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.builtWith.sections.frameworks}</h2>
            <ul className="space-y-2 text-[var(--color-text-secondary)]">
              <li>React 19</li>
              <li>React Router v7</li>
              <li>TypeScript</li>
              <li>Tailwind CSS v4</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.builtWith.sections.deployment}</h2>
            <ul className="space-y-2 text-[var(--color-text-secondary)]">
              <li>Cloudflare Pages</li>
              <li>100% SSG (Static Site Generation)</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
