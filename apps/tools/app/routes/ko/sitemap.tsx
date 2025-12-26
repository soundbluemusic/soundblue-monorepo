import { useParaglideI18n } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import { ALL_TOOLS } from '~/lib/toolCategories';

export const meta: MetaFunction = () => [
  { title: '사이트맵 | Tools' },
  { name: 'description', content: 'SoundBlueMusic Tools 웹사이트의 모든 페이지.' },
];

export default function SitemapKo() {
  const { locale, localizedPath } = useParaglideI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-2xl font-bold sm:text-3xl">{m['sitemap_title']?.()}</h1>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-(--muted-foreground)">
              {m['sitemap_sections_main']?.()}
            </h2>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to={localizedPath('/')}
                  className="text-(--primary) transition-colors duration-150 hover:underline"
                >
                  {m['navigation_home']?.()}
                </Link>
              </li>
              <li>
                <Link
                  to={localizedPath('/about')}
                  className="text-(--primary) transition-colors duration-150 hover:underline"
                >
                  {m['navigation_about']?.()}
                </Link>
              </li>
              <li>
                <Link
                  to={localizedPath('/built-with')}
                  className="text-(--primary) transition-colors duration-150 hover:underline"
                >
                  {m['navigation_builtWith']?.()}
                </Link>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-(--muted-foreground)">
              {m['sitemap_sections_tools']?.()}
            </h2>
            <ul className="flex flex-col gap-2">
              {ALL_TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={localizedPath(`/${tool.slug}`)}
                    className="inline-flex items-center gap-2 text-(--primary) transition-colors duration-150 hover:underline"
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.name[locale]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-(--muted-foreground)">
              {m['sitemap_sections_other']?.()}
            </h2>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to={localizedPath('/benchmark')}
                  className="text-(--primary) transition-colors duration-150 hover:underline"
                >
                  {m['sidebar_benchmark']?.()}
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--primary) transition-colors duration-150 hover:underline"
                >
                  {m['sitemap_xml']?.()}
                </a>
              </li>
            </ul>
          </section>

          <p className="mt-8 text-sm text-(--muted-foreground)">
            {m['sitemap_lastUpdated']?.()}:{' '}
            {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
          </p>
        </div>
      </main>
      <Footer appName="사이트맵" />
    </div>
  );
}
