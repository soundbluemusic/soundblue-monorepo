import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';

export const meta: MetaFunction = () => [
  { title: 'Built With | Tools' },
  {
    name: 'description',
    content: 'Technologies used to build Tools - React, TypeScript, SCSS Modules.',
  },
];

export default function BuiltWith() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{m['navigation_builtWith']?.()}</h1>
          <p className="mb-8 text-(--muted-foreground)">{m['builtWith_intro']?.()}</p>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['builtWith_framework']?.()}</h2>
            <ul className="flex flex-col gap-2 text-(--muted-foreground)">
              <li>React 19</li>
              <li>React Router v7</li>
              <li>TypeScript</li>
              <li>SCSS Modules</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['builtWith_deployment']?.()}</h2>
            <ul className="flex flex-col gap-2 text-(--muted-foreground)">
              <li>Cloudflare Pages</li>
              <li>100% SSG (Static Site Generation)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['builtWith_uiux']?.()}</h2>
            <ul className="flex flex-col gap-2 text-(--muted-foreground)">
              <li>{m['builtWith_webStandardsLayout']?.()}</li>
              <li>{m['builtWith_darkLightMode']?.()}</li>
              <li>{m['builtWith_responsiveDesign']?.()}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['builtWith_browserApi']?.()}</h2>
            <ul className="flex flex-col gap-2 text-(--muted-foreground)">
              <li>Web Audio API</li>
              <li>Canvas API</li>
              <li>Service Worker / PWA</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer appName="Built With" />
    </div>
  );
}
