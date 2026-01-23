import { createFileRoute, Link } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/sitemap')({
  head: () => ({
    meta: [
      { title: '사이트맵 | Sound Blue' },
      { name: 'description', content: 'Sound Blue 웹사이트의 전체 사이트맵입니다.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/sitemap' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/sitemap' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/sitemap' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/sitemap' },
    ],
  }),
  component: Sitemap,
});

function Sitemap() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{m['sitemap.title']()}</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.main']()}</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/ko" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.home']()}
              </Link>
            </li>
            <li>
              <Link to="/ko/about" className="text-[var(--color-link)] hover:underline">
                {m['nav.about']()}
              </Link>
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.content']()}</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/ko/news" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.news']()}
              </Link>
            </li>
            <li>
              <Link to="/ko/blog" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.blog']()}
              </Link>
            </li>
            <li>
              <Link to="/ko/sound-recording" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.soundRecording']()}
              </Link>
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.legal']()}</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/ko/privacy" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.privacy']()}
              </Link>
            </li>
            <li>
              <Link to="/ko/terms" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.terms']()}
              </Link>
            </li>
            <li>
              <Link to="/ko/license" className="text-[var(--color-link)] hover:underline">
                {m['sitemap.links.license']()}
              </Link>
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.other']()}</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-link)] hover:underline"
              >
                {m['sitemap.xml']()}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </NavigationLayout>
  );
}
