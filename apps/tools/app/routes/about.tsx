import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import styles from './About.module.scss';

export const meta: MetaFunction = () => [
  { title: 'About | Tools' },
  {
    name: 'description',
    content: 'We believe powerful tools should be accessible to everyone.',
  },
];

export default function About() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <blockquote className={styles.quote}>"{m['about_missionText']?.()}"</blockquote>
          <div className={styles.divider} />
          <p className={styles.intro}>{m['about_intro']?.()}</p>
        </div>
      </main>
      <Footer appName="About" />
    </div>
  );
}
