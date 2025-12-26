import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import styles from './BuiltWith.module.scss';

export const meta: MetaFunction = () => [
  { title: 'Built With | Tools' },
  {
    name: 'description',
    content: 'Technologies used to build Tools - React, TypeScript, SCSS Modules.',
  },
];

export default function BuiltWith() {
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
              <li>100% SSG (Static Site Generation)</li>
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
      <Footer appName="Built With" />
    </div>
  );
}
