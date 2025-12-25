import { useParaglideI18n } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import m from '~/lib/messages';
import { ALL_TOOLS } from '~/lib/toolCategories';

export const meta: MetaFunction = () => [
  { title: '사이트맵 | Tools' },
  { name: 'description', content: 'SoundBlueMusic Tools 웹사이트의 모든 페이지.' },
];

export default function SitemapKo() {
  const { locale, localizedPath } = useParaglideI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{m['sitemap_title']?.()}</h1>

        {/* Main Pages */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            {m['sitemap_sections_main']?.()}
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                to={localizedPath('/')}
                className="text-primary hover:underline transition-colors"
              >
                {m['navigation_home']?.()}
              </Link>
            </li>
            <li>
              <Link
                to={localizedPath('/about')}
                className="text-primary hover:underline transition-colors"
              >
                {m['navigation_about']?.()}
              </Link>
            </li>
            <li>
              <Link
                to={localizedPath('/built-with')}
                className="text-primary hover:underline transition-colors"
              >
                {m['navigation_builtWith']?.()}
              </Link>
            </li>
          </ul>
        </section>

        {/* Tools */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            {m['sitemap_sections_tools']?.()}
          </h2>
          <ul className="space-y-2">
            {ALL_TOOLS.map((tool) => (
              <li key={tool.id}>
                <Link
                  to={localizedPath(`/${tool.slug}`)}
                  className="text-primary hover:underline transition-colors inline-flex items-center gap-2"
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name[locale]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Other */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            {m['sitemap_sections_other']?.()}
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                to={localizedPath('/benchmark')}
                className="text-primary hover:underline transition-colors"
              >
                {m['sidebar_benchmark']?.()}
              </Link>
            </li>
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors"
              >
                {m['sitemap_xml']?.()}
              </a>
            </li>
          </ul>
        </section>

        {/* Footer note */}
        <p className="text-sm text-muted-foreground mt-8">
          {m['sitemap_lastUpdated']?.()}:{' '}
          {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      </div>
    </div>
  );
}
