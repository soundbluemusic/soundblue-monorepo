/**
 * @fileoverview Footer component for Tools app
 *
 * A simple footer component.
 */

import styles from './Footer.module.scss';

interface FooterProps {
  appName?: string;
  brandName?: string;
  brandUrl?: string;
  tagline?: string;
  className?: string;
}

export function Footer({
  appName = 'Tools',
  brandName = 'SoundBlueMusic',
  brandUrl = 'https://soundbluemusic.com',
  tagline,
  className = '',
}: FooterProps) {
  const footerClass = className ? `${styles.footer} ${className}` : styles.footer;

  return (
    <footer className={footerClass}>
      {/* Tagline */}
      {tagline && <p className={styles.tagline}>{tagline}</p>}

      {/* App name and brand */}
      <p className={styles.credit}>
        {appName} by{' '}
        <a href={brandUrl} target="_blank" rel="noopener noreferrer" className={styles.brandLink}>
          {brandName}
        </a>
      </p>
    </footer>
  );
}
