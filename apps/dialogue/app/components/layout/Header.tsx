import { useTheme } from '@soundblue/shared-react';
import { useI18n } from '~/i18n';

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">{t.title}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={resolvedTheme === 'dark' ? t.lightMode : t.darkMode}
        >
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Language toggle */}
        <button
          type="button"
          onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {locale === 'en' ? '한국어' : 'English'}
        </button>

        {/* About link */}
        <a
          href={locale === 'ko' ? '/ko/about' : '/about'}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {t.about}
        </a>
      </div>
    </header>
  );
}
