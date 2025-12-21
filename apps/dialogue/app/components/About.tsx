import { Link } from 'react-router';
import { useI18n } from '~/i18n';

export function About() {
  const { t, locale } = useI18n();

  const getHomeUrl = () => {
    return locale === 'en' ? '/' : `/${locale}`;
  };

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-gray-900">
      <header className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <Link
          to={getHomeUrl()}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 no-underline rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <BackIcon />
          <span>{t.backToChat}</span>
        </Link>
      </header>

      <main className="flex-1 px-6 py-8 max-w-[800px] mx-auto w-full max-sm:px-4 max-sm:py-6">
        {/* Hero */}
        <div className="text-center py-10 max-sm:py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-[20px] mb-4">
            <LogoIcon />
          </div>
          <h1 className="text-[32px] font-bold text-gray-900 dark:text-gray-100 mb-1 max-sm:text-[28px]">
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.version}</p>
          <p className="text-base text-gray-600 dark:text-gray-300">{t.subtitle}</p>
        </div>

        {/* Features Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-2 border-b border-gray-200 dark:border-gray-700">
            {t.aboutFeatures}
          </h2>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mb-3">
                <OfflineIcon />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                {t.featureOffline}
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-normal">
                {t.featureOfflineDesc}
              </p>
            </div>
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mb-3">
                <SpeedIcon />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                {t.featureInstant}
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-normal">
                {t.featureInstantDesc}
              </p>
            </div>
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mb-3">
                <LanguageIcon />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                {t.featureMultilang}
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-normal">
                {t.featureMultilangDesc}
              </p>
            </div>
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mb-3">
                <ThemeIcon />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                {t.featureTheme}
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-normal">
                {t.featureThemeDesc}
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-2 border-b border-gray-200 dark:border-gray-700">
            {t.aboutTech}
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-4.5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.techFramework}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t.techFrameworkValue}
              </span>
            </div>
            <div className="flex justify-between items-center px-4.5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.techLanguage}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t.techLanguageValue}
              </span>
            </div>
            <div className="flex justify-between items-center px-4.5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.techRendering}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t.techRenderingValue}
              </span>
            </div>
            <div className="flex justify-between items-center px-4.5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.techPwa}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t.techPwaValue}
              </span>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-2 border-b border-gray-200 dark:border-gray-700">
            {t.aboutInfo}
          </h2>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/soundbluemusic/Dialogue"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4.5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 no-underline transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <GithubIcon />
              <span className="flex-1 text-sm">{t.githubRepository}</span>
              <ExternalIcon />
            </a>
            <div className="flex items-center gap-3 px-4.5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
              <LicenseIcon />
              <span className="flex-1 text-sm">{t.mitLicense}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-gray-500 dark:text-gray-400 text-[13px] border-t border-gray-200 dark:border-gray-700">
        <p>{t.aboutMadeWith}</p>
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
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      className="text-gray-600 dark:text-gray-400"
    >
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
      className="text-gray-400 dark:text-gray-500"
    >
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  );
}

function LicenseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      className="text-gray-600 dark:text-gray-400"
    >
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}
