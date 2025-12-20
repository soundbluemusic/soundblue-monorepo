import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Sitemap | Sound Blue' },
  { name: 'description', content: 'Complete sitemap of Sound Blue website.' },
];

export default function Sitemap() {
  const { t, locale } = useI18n();
  const prefix = locale === 'ko' ? '/ko' : '';

  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">{t.sitemap.title}</h1>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.sitemap.sections.main}</h2>
            <ul className="space-y-2">
              <li>
                <Link to={prefix || '/'} className="text-[var(--color-link)] hover:underline">
                  {t.sitemap.links.home}
                </Link>
              </li>
              <li>
                <Link to={`${prefix}/about`} className="text-[var(--color-link)] hover:underline">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.sitemap.sections.content}</h2>
            <ul className="space-y-2">
              <li>
                <Link to={`${prefix}/news`} className="text-[var(--color-link)] hover:underline">
                  {t.sitemap.links.news}
                </Link>
              </li>
              <li>
                <Link to={`${prefix}/blog`} className="text-[var(--color-link)] hover:underline">
                  {t.sitemap.links.blog}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/sound-recording`}
                  className="text-[var(--color-link)] hover:underline"
                >
                  {t.sitemap.links.soundRecording}
                </Link>
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.sitemap.sections.legal}</h2>
            <ul className="space-y-2">
              <li>
                <Link to={`${prefix}/privacy`} className="text-[var(--color-link)] hover:underline">
                  {t.sitemap.links.privacy}
                </Link>
              </li>
              <li>
                <Link to={`${prefix}/terms`} className="text-[var(--color-link)] hover:underline">
                  {t.sitemap.links.terms}
                </Link>
              </li>
              <li>
                <Link to={`${prefix}/license`} className="text-[var(--color-link)] hover:underline">
                  {t.sitemap.links.license}
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
