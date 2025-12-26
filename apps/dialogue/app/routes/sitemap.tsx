import { getLocaleFromPath, getLocalizedPath } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link, useLocation } from 'react-router';
import m from '~/lib/messages';
import styles from './Sitemap.module.scss';

export const meta: MetaFunction = () => [
  { title: 'Sitemap - Dialogue' },
  { name: 'description', content: 'Complete sitemap of Dialogue website.' },
];

export default function Sitemap() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{m['app_sitemap_title']?.() || 'Sitemap'}</h1>

        {/* Main Pages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {m['app_sitemap_sections_main']?.() || 'Main Pages'}
          </h2>
          <ul className={styles.list}>
            <li>
              <Link to={getLocalizedPath('/', locale)} className={styles.link}>
                {m['app_sitemap_links_home']?.() || 'Home'}
              </Link>
            </li>
            <li>
              <Link to={getLocalizedPath('/about', locale)} className={styles.link}>
                {m['app_about']?.() || 'About'}
              </Link>
            </li>
          </ul>
        </section>

        {/* XML Sitemap */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{m['app_sitemap_sections_other']?.() || 'Other'}</h2>
          <ul className={styles.list}>
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {m['app_sitemap_xml']?.() || 'XML Sitemap (for search engines)'}
              </a>
            </li>
          </ul>
        </section>

        {/* Footer note */}
        <p className={styles.footer}>
          {m['app_sitemap_lastUpdated']?.() || 'Last updated'}:{' '}
          {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      </div>
    </div>
  );
}
