import { useParaglideI18n } from '@soundblue/i18n';
import type { MetaFunction } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';
import { ALL_TOOLS } from '~/lib/toolCategories';

/**
 * 빌드 타임에 날짜를 캡처하여 Hydration 불일치 방지
 */
export async function loader() {
  const now = new Date();
  return {
    lastUpdated: {
      en: now.toLocaleDateString('en-US'),
      ko: now.toLocaleDateString('ko-KR'),
    },
  };
}

export const meta: MetaFunction = ({ location }) => [
  { title: 'Sitemap | Tools' },
  { name: 'description', content: 'Complete sitemap of SoundBlueMusic Tools website.' },
  ...getSeoMeta(location),
];

export default function Sitemap() {
  const { locale, localizedPath } = useParaglideI18n();
  const { lastUpdated } = useLoaderData<typeof loader>();

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
            {`${m['sitemap_lastUpdated']?.()}: ${locale === 'ko' ? lastUpdated.ko : lastUpdated.en}`}
          </p>
        </div>
      </main>
      <Footer appName="Sitemap" />
    </div>
  );
}
