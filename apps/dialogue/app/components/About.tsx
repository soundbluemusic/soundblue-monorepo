import { getLocaleFromPath } from '@soundblue/shared-react';
import { Link, useLocation } from 'react-router';
import m from '~/lib/messages';
import styles from './About.module.scss';

export function About() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  const getHomeUrl = () => {
    return locale === 'en' ? '/' : `/${locale}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to={getHomeUrl()} className={styles.backLink}>
          <BackIcon />
          <span>{m['app.backToChat']()}</span>
        </Link>
      </header>

      <main className={styles.main}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.logo}>
            <LogoIcon />
          </div>
          <h1 className={styles.title}>{m['app.title']()}</h1>
          <p className={styles.version}>{m['app.version']()}</p>
          <p className={styles.subtitle}>{m['app.subtitle']()}</p>
        </div>

        {/* Features Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{m['app.aboutFeatures']()}</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <OfflineIcon />
              </div>
              <h3 className={styles.featureTitle}>{m['app.featureOffline']()}</h3>
              <p className={styles.featureDescription}>{m['app.featureOfflineDesc']()}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <SpeedIcon />
              </div>
              <h3 className={styles.featureTitle}>{m['app.featureInstant']()}</h3>
              <p className={styles.featureDescription}>{m['app.featureInstantDesc']()}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <LanguageIcon />
              </div>
              <h3 className={styles.featureTitle}>{m['app.featureMultilang']()}</h3>
              <p className={styles.featureDescription}>{m['app.featureMultilangDesc']()}</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <ThemeIcon />
              </div>
              <h3 className={styles.featureTitle}>{m['app.featureTheme']()}</h3>
              <p className={styles.featureDescription}>{m['app.featureThemeDesc']()}</p>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{m['app.aboutTech']()}</h2>
          <div className={styles.techList}>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>{m['app.techFramework']()}</span>
              <span className={styles.techValue}>{m['app.techFrameworkValue']()}</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>{m['app.techLanguage']()}</span>
              <span className={styles.techValue}>{m['app.techLanguageValue']()}</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>{m['app.techRendering']()}</span>
              <span className={styles.techValue}>{m['app.techRenderingValue']()}</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>{m['app.techPwa']()}</span>
              <span className={styles.techValue}>{m['app.techPwaValue']()}</span>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{m['app.aboutInfo']()}</h2>
          <div className={styles.infoList}>
            <a
              href="https://github.com/soundbluemusic/Dialogue"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.infoLink}
            >
              <GithubIcon />
              <span className={styles.infoText}>{m['app.githubRepository']()}</span>
              <ExternalIcon />
            </a>
            <div className={styles.infoItem}>
              <LicenseIcon />
              <span className={styles.infoText}>{m['app.mitLicense']()}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>{m['app.aboutMadeWith']()}</p>
      </footer>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={styles.infoIcon}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      className={styles.externalIcon}
    >
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  );
}

function LicenseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={styles.infoIcon}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}
