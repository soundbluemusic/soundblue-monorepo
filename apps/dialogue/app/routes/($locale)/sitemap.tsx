import { getLocaleFromPath, getLocalizedPath } from '@soundblue/i18n';
import type { MetaFunction } from 'react-router';
import { Link, useLoaderData, useLocation } from 'react-router';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

/**
 * Build-time loader for sitemap date
 * Prevents hydration mismatch by using fixed date from build time
 */
export async function loader() {
  return {
    lastUpdated: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  };
}

export const meta: MetaFunction = ({ location }) => [
  { title: 'Sitemap - Dialogue' },
  { name: 'description', content: 'Complete sitemap of Dialogue website.' },
  ...getSeoMeta(location),
];

export default function Sitemap() {
  const { lastUpdated } = useLoaderData<typeof loader>();
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
          {m['app.sitemap.lastUpdated']()}: {lastUpdated}
        </p>
      </div>
    </div>
  );
}
