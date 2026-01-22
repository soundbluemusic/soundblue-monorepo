import { getLocaleFromPath, getLocalizedPath } from '@soundblue/i18n';
import { ColorblindSelector, useTheme } from '@soundblue/ui-components/base';
import { ServiceMenu } from '@soundblue/ui-components/composite';
import { useLocation, useNavigate } from '@tanstack/react-router';
import m from '~/lib/messages';

export function Header() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ko' : 'en';
    const currentPath = location.pathname.replace(/^\/(ko|en)/, '') || '/';
    const newPath = getLocalizedPath(currentPath, newLocale);
    navigate({ to: newPath });
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border-primary)]">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">{m['app.title']()}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Service Menu */}
        <ServiceMenu currentApp="dialogue" locale={locale} />
        {/* Colorblind Mode Selector */}
        <ColorblindSelector locale={locale} />
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-none border-none cursor-pointer text-inherit transition-colors duration-150 hover:bg-[var(--color-bg-hover)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          title={resolvedTheme === 'dark' ? m['app.lightMode']() : m['app.darkMode']()}
        >
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          onClick={toggleLocale}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-none border-none cursor-pointer text-inherit no-underline transition-colors duration-150 hover:bg-[var(--color-bg-hover)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
          title={locale === 'en' ? m['app.korean']() : m['app.english']()}
          aria-label={locale === 'en' ? m['app.korean']() : m['app.english']()}
        >
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-sm font-semibold" aria-hidden="true">
            {locale === 'en' ? 'KO' : 'EN'}
          </span>
        </button>

        {/* About link */}
        <a
          href={locale === 'ko' ? '/ko/about' : '/about'}
          className="min-h-[44px] flex items-center py-2 px-4 text-sm rounded-lg bg-none border-none cursor-pointer text-inherit no-underline transition-colors duration-150 hover:bg-[var(--color-bg-hover)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
        >
          {m['app.about']()}
        </a>
      </div>
    </header>
  );
}
