import { getLocaleFromPath, getLocalizedPath } from '@soundblue/shared-react';
import type { MetaFunction } from 'react-router';
import { Link, useLocation } from 'react-router';
import m from '~/lib/messages';
import styles from '../Sitemap.module.scss';

export const meta: MetaFunction = () => [
  { title: '사이트맵 - Dialogue' },
  { name: 'description', content: 'Dialogue 웹사이트의 모든 페이지.' },
];

export default function SitemapKo() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{m['app_sitemap_title']?.() || '사이트맵'}</h1>

        {/* Main Pages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {m['app_sitemap_sections_main']?.() || '주요 페이지'}
          </h2>
          <ul className={styles.list}>
            <li>
              <Link to={getLocalizedPath('/', locale)} className={styles.link}>
                {m['app_sitemap_links_home']?.() || '홈'}
              </Link>
            </li>
            <li>
              <Link to={getLocalizedPath('/about', locale)} className={styles.link}>
                {m['app_about']?.() || '정보'}
              </Link>
            </li>
          </ul>
        </section>

        {/* XML Sitemap */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{m['app_sitemap_sections_other']?.() || '기타'}</h2>
          <ul className={styles.list}>
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {m['app_sitemap_xml']?.() || 'XML 사이트맵 (검색 엔진용)'}
              </a>
            </li>
          </ul>
        </section>

        {/* Footer note */}
        <p className={styles.footer}>
          {m['app_sitemap_lastUpdated']?.() || '마지막 업데이트'}:{' '}
          {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      </div>
    </div>
  );
}
