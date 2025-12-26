import { useParaglideI18n } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import { ALL_TOOLS } from '~/lib/toolCategories';
import styles from '../Sitemap.module.scss';

export const meta: MetaFunction = () => [
  { title: '사이트맵 | Tools' },
  { name: 'description', content: 'SoundBlueMusic Tools 웹사이트의 모든 페이지.' },
];

export default function SitemapKo() {
  const { locale, localizedPath } = useParaglideI18n();

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{m['sitemap_title']?.()}</h1>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['sitemap_sections_main']?.()}</h2>
            <ul className={styles.list}>
              <li>
                <Link to={localizedPath('/')} className={styles.link}>
                  {m['navigation_home']?.()}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/about')} className={styles.link}>
                  {m['navigation_about']?.()}
                </Link>
              </li>
              <li>
                <Link to={localizedPath('/built-with')} className={styles.link}>
                  {m['navigation_builtWith']?.()}
                </Link>
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['sitemap_sections_tools']?.()}</h2>
            <ul className={styles.list}>
              {ALL_TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link to={localizedPath(`/${tool.slug}`)} className={styles.toolLink}>
                    <span>{tool.icon}</span>
                    <span>{tool.name[locale]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['sitemap_sections_other']?.()}</h2>
            <ul className={styles.list}>
              <li>
                <Link to={localizedPath('/benchmark')} className={styles.link}>
                  {m['sidebar_benchmark']?.()}
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {m['sitemap_xml']?.()}
                </a>
              </li>
            </ul>
          </section>

          <p className={styles.footer}>
            {m['sitemap_lastUpdated']?.()}:{' '}
            {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
          </p>
        </div>
      </main>
      <Footer appName="사이트맵" />
    </div>
  );
}
