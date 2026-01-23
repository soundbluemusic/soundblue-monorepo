import { getLocaleFromPath, getLocalizedPath } from '@soundblue/i18n';
import { createFileRoute, Link, useLocation } from '@tanstack/react-router';
import m from '~/lib/messages';

export const Route = createFileRoute('/sitemap')({
  head: () => ({
    meta: [
      { title: 'Sitemap - Dialogue' },
      { name: 'description', content: 'Complete sitemap of Dialogue website.' },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/sitemap' },
      // Alternate language
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'ko',
        href: 'https://dialogue.soundbluemusic.com/ko/sitemap',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://dialogue.soundbluemusic.com/sitemap',
      },
    ],
  }),
  loader: async () => {
    return {
      lastUpdated: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };
  },
  component: SitemapPage,
});

function SitemapPage() {
  const { lastUpdated } = Route.useLoaderData();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-text-primary)]">
          {m['app.sitemap.title']()}
        </h1>

        {/* Main Pages */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-tertiary)]">
            {m['app.sitemap.sections.main']()}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to={getLocalizedPath('/', locale)}
                className="text-[var(--color-accent-primary)] no-underline transition-all duration-200 hover:underline"
              >
                {m['app.sitemap.links.home']()}
              </Link>
            </li>
            <li>
              <Link
                to={getLocalizedPath('/about', locale)}
                className="text-[var(--color-accent-primary)] no-underline transition-all duration-200 hover:underline"
              >
                {m['app.about']()}
              </Link>
            </li>
            <li>
              <Link
                to={getLocalizedPath('/built-with', locale)}
                className="text-[var(--color-accent-primary)] no-underline transition-all duration-200 hover:underline"
              >
                {m['app.openSourceLicenses']()}
              </Link>
            </li>
          </ul>
        </section>

        {/* XML Sitemap */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-tertiary)]">
            {m['app.sitemap.sections.other']()}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent-primary)] no-underline transition-all duration-200 hover:underline"
              >
                {m['app.sitemap.xml']()}
              </a>
            </li>
          </ul>
        </section>

        {/* Footer note */}
        <p className="text-sm text-[var(--color-text-tertiary)] mt-8">
          {m['app.sitemap.lastUpdated']()}: {lastUpdated}
        </p>
      </div>
    </div>
  );
}
