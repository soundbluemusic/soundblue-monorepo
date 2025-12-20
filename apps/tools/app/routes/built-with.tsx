import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Built With | Tools' },
  {
    name: 'description',
    content: 'Technologies used to build Tools - React, TypeScript, Tailwind CSS.',
  },
];

export default function BuiltWith() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t.navigation.builtWith}</h1>
        <p className="text-muted-foreground mb-8">{t.builtWith.intro}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.builtWith.framework}</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>React 19</li>
            <li>React Router v7</li>
            <li>TypeScript</li>
            <li>Tailwind CSS v4</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.builtWith.deployment}</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Cloudflare Pages</li>
            <li>100% SSG (Static Site Generation)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.builtWith.uiux}</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t.builtWith.webStandardsLayout}</li>
            <li>{t.builtWith.darkLightMode}</li>
            <li>{t.builtWith.responsiveDesign}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.builtWith.browserApi}</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Web Audio API</li>
            <li>Canvas API</li>
            <li>Service Worker / PWA</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
