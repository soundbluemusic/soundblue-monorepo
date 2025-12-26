import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';
import styles from '../About.module.scss';

export const meta: MetaFunction = () => [
  { title: '소개 | Tools' },
  {
    name: 'description',
    content: '강력한 도구는 모두에게 접근 가능해야 합니다.',
  },
];

export default function AboutKo() {
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
      <Footer appName="소개" />
    </div>
  );
}
