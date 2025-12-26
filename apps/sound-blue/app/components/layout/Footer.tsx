import { useParaglideI18n } from '@soundblue/shared-react';
import { Link } from 'react-router';
import { BRAND } from '~/constants';
import m from '~/lib/messages';
import styles from './Footer.module.scss';

interface FooterLink {
  path: string;
  labelKey: 'privacy' | 'terms' | 'license' | 'sitemap';
}

const FOOTER_LINKS: FooterLink[] = [
  { path: '/privacy', labelKey: 'privacy' },
  { path: '/terms', labelKey: 'terms' },
  { path: '/license', labelKey: 'license' },
  { path: '/sitemap', labelKey: 'sitemap' },
];

export function Footer() {
  const { localizedPath } = useParaglideI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <nav className={styles.nav} aria-label="Footer navigation">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.path} to={localizedPath(link.path)} className={styles.navLink}>
            {m[`footer_${link.labelKey}`]?.()}
          </Link>
        ))}
      </nav>
      <p className={styles.tagline}>
        {m['footer.tagline']()}{' '}
        <Link to={localizedPath('/built-with')} className={styles.builtWithLink}>
          {m['footer.builtWith']()}
        </Link>
      </p>
      <p className={styles.copyright}>
        &copy; {currentYear} {BRAND.copyrightHolder}. All rights reserved.
      </p>
    </footer>
  );
}
