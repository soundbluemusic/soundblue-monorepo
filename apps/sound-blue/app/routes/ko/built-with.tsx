import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: '기술 스택 | Sound Blue' },
  { name: 'description', content: 'Sound Blue 웹사이트를 만드는 데 사용된 기술.' },
];

export default function BuiltWithKo() {
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
              <li>100% SSG (정적 사이트 생성)</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
