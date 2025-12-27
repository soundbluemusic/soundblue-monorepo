import { getLocaleFromPath, getLocalizedPath } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link, useLocation } from 'react-router';
import m from '~/lib/messages';

export const meta: MetaFunction = () => [
  { title: '사이트맵 - Dialogue' },
  { name: 'description', content: 'Dialogue 웹사이트의 모든 페이지.' },
];

export default function SitemapKo() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  return (
    <div className="min-h-screen bg-(--color-bg-secondary)">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-(--color-text-primary)">
          {m['app.sitemap.title']()}
        </h1>

        {/* Main Pages */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-(--color-text-tertiary)">
            {m['app.sitemap.sections.main']()}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to={getLocalizedPath('/', locale)}
                className="text-(--color-accent-primary) no-underline transition-all duration-200 hover:underline"
              >
                {m['app.sitemap.links.home']()}
              </Link>
            </li>
            <li>
              <Link
                to={getLocalizedPath('/about', locale)}
                className="text-(--color-accent-primary) no-underline transition-all duration-200 hover:underline"
              >
                {m['app.about']()}
              </Link>
            </li>
          </ul>
        </section>

        {/* XML Sitemap */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-(--color-text-tertiary)">
            {m['app.sitemap.sections.other']()}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--color-accent-primary) no-underline transition-all duration-200 hover:underline"
              >
                {m['app.sitemap.xml']()}
              </a>
            </li>
          </ul>
        </section>

        {/* Footer note */}
        <p className="text-sm text-(--color-text-tertiary) mt-8">
          {m['app.sitemap.lastUpdated']()}:{' '}
          {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      </div>
    </div>
  );
}
