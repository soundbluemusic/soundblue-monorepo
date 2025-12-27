import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';

export const meta: MetaFunction = () => [
  { title: '기술 스택 | Tools' },
  {
    name: 'description',
    content: 'Tools를 만드는 데 사용된 기술 - React, TypeScript, Tailwind CSS.',
  },
];

export default function BuiltWithKo() {
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
              <li>Tailwind CSS v4</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['builtWith_deployment']?.()}</h2>
            <ul className="flex flex-col gap-2 text-(--muted-foreground)">
              <li>Cloudflare Pages</li>
              <li>100% SSG (정적 사이트 생성)</li>
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

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['builtWith_devTools']?.()}</h2>
            <ul className="flex flex-col gap-2 text-(--muted-foreground)">
              <li>
                <a
                  href="https://docs.anthropic.com/en/docs/claude-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--color-accent-primary) hover:underline"
                >
                  Claude Code
                </a>
              </li>
              <li>Vite</li>
              <li>Vitest</li>
              <li>Biome</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer appName="기술 스택" />
    </div>
  );
}
