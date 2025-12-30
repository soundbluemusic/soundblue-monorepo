import { getLocaleFromPath, getLocalizedPath } from '@soundblue/i18n';
import { useTheme } from '@soundblue/ui-components/base';
import { useLocation, useNavigate } from 'react-router';
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
    navigate(newPath);
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-(--color-border-primary)">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">{m['app.title']()}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-none border-none cursor-pointer text-inherit transition-colors duration-150 hover:bg-(--color-bg-hover) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
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
          className="min-h-[44px] flex items-center py-2 px-4 text-sm rounded-lg bg-none border-none cursor-pointer text-inherit no-underline transition-colors duration-150 hover:bg-(--color-bg-hover) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
        >
          {locale === 'en' ? m['app.korean']() : m['app.english']()}
        </button>

        {/* About link */}
        <a
          href={locale === 'ko' ? '/ko/about' : '/about'}
          className="min-h-[44px] flex items-center py-2 px-4 text-sm rounded-lg bg-none border-none cursor-pointer text-inherit no-underline transition-colors duration-150 hover:bg-(--color-bg-hover) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
        >
          {m['app.about']()}
        </a>
      </div>
    </header>
  );
}
