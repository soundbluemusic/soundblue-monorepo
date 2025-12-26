import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import styles from '../BuiltWith.module.scss';

export const meta: MetaFunction = () => [
  { title: '기술 스택 | Tools' },
  {
    name: 'description',
    content: 'Tools를 만드는 데 사용된 기술 - React, TypeScript, SCSS Modules.',
  },
];

export default function BuiltWithKo() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{m['navigation_builtWith']?.()}</h1>
          <p className={styles.intro}>{m['builtWith_intro']?.()}</p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['builtWith_framework']?.()}</h2>
            <ul className={styles.list}>
              <li>React 19</li>
              <li>React Router v7</li>
              <li>TypeScript</li>
              <li>SCSS Modules</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['builtWith_deployment']?.()}</h2>
            <ul className={styles.list}>
              <li>Cloudflare Pages</li>
              <li>100% SSG (정적 사이트 생성)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['builtWith_uiux']?.()}</h2>
            <ul className={styles.list}>
              <li>{m['builtWith_webStandardsLayout']?.()}</li>
              <li>{m['builtWith_darkLightMode']?.()}</li>
              <li>{m['builtWith_responsiveDesign']?.()}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{m['builtWith_browserApi']?.()}</h2>
            <ul className={styles.list}>
              <li>Web Audio API</li>
              <li>Canvas API</li>
              <li>Service Worker / PWA</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer appName="기술 스택" />
    </div>
  );
}
