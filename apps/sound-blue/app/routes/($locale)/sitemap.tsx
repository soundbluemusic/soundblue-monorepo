import { useParaglideI18n } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: 'Sitemap | Sound Blue' },
  { name: 'description', content: 'Complete sitemap of Sound Blue website.' },
];

export default function Sitemap() {
  const { locale } = useParaglideI18n();
  const prefix = locale === 'ko' ? '/ko' : '';

  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{m['sitemap.title']()}</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.main']()}</h2>
          <ul className="space-y-2">
            <li>
              <Link to={prefix || '/'} className="text-(--color-link) hover:underline">
                {m['sitemap.links.home']()}
              </Link>
            </li>
            <li>
              <Link to={`${prefix}/about`} className="text-(--color-link) hover:underline">
                {m['nav.about']()}
              </Link>
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.content']()}</h2>
          <ul className="space-y-2">
            <li>
              <Link to={`${prefix}/news`} className="text-(--color-link) hover:underline">
                {m['sitemap.links.news']()}
              </Link>
            </li>
            <li>
              <Link to={`${prefix}/blog`} className="text-(--color-link) hover:underline">
                {m['sitemap.links.blog']()}
              </Link>
            </li>
            <li>
              <Link
                to={`${prefix}/sound-recording`}
                className="text-(--color-link) hover:underline"
              >
                {m['sitemap.links.soundRecording']()}
              </Link>
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['sitemap.sections.legal']()}</h2>
          <ul className="space-y-2">
            <li>
              <Link to={`${prefix}/privacy`} className="text-(--color-link) hover:underline">
                {m['sitemap.links.privacy']()}
              </Link>
            </li>
            <li>
              <Link to={`${prefix}/terms`} className="text-(--color-link) hover:underline">
                {m['sitemap.links.terms']()}
              </Link>
            </li>
            <li>
              <Link to={`${prefix}/license`} className="text-(--color-link) hover:underline">
                {m['sitemap.links.license']()}
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </NavigationLayout>
  );
}
