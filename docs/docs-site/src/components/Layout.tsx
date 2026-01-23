import { Link, useRouterState } from '@tanstack/react-router';
import { getLocaleFromPath, getContent, type Locale } from '~/content';

function LogoIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="currentColor">
      <circle cx="16" cy="16" r="14" fill="var(--color-brand)" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">S</text>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { location } = useRouterState();
  const locale = getLocaleFromPath(location.pathname);
  const t = getContent(locale);
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={`${localePrefix}/` as '/'} className="flex items-center gap-2 font-bold text-lg">
            <LogoIcon />
            <span>SoundBlue</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-sm">
              <LocaleLink locale="en" currentLocale={locale} pathname={location.pathname} />
              <span className="text-[var(--color-text-secondary)]">/</span>
              <LocaleLink locale="ko" currentLocale={locale} pathname={location.pathname} />
              <span className="text-[var(--color-text-secondary)]">/</span>
              <LocaleLink locale="ja" currentLocale={locale} pathname={location.pathname} />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/soundbluemusic/soundblue-monorepo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://www.youtube.com/@SoundBlueMusic"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-[var(--color-border)] p-4">
          <nav className="sticky top-20">
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
                {t.nav.projects}
              </h3>
              <ul className="space-y-1">
                {t.sidebar.slice(0, 3).map((item) => (
                  <li key={item.href}>
                    <SidebarLink href={item.href} currentPath={location.pathname}>
                      {item.label}
                    </SidebarLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
                {t.nav.about}
              </h3>
              <ul className="space-y-1">
                {t.sidebar.slice(3).map((item) => (
                  <li key={item.href}>
                    <SidebarLink href={item.href} currentPath={location.pathname}>
                      {item.label}
                    </SidebarLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-4xl">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-text-secondary)]">
        {t.footer.copyright}
      </footer>
    </div>
  );
}

function SidebarLink({ href, currentPath, children }: { href: string; currentPath: string; children: React.ReactNode }) {
  const isActive = currentPath.endsWith(href) || currentPath.endsWith(`${href}/`);

  return (
    <Link to={href as '/'} className={`sidebar-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  );
}

function LocaleLink({ locale, currentLocale, pathname }: { locale: Locale; currentLocale: Locale; pathname: string }) {
  // Get the page path without locale prefix (remove /soundblue-monorepo and /ko or /ja)
  let pagePath = pathname.replace(/^\/soundblue-monorepo/, '').replace(/^\/(ko|ja)/, '').replace(/^\//, '');
  if (!pagePath) pagePath = '';

  const newPath = locale === 'en' ? `/${pagePath}` : `/${locale}/${pagePath}`;
  const isActive = locale === currentLocale;

  const labels: Record<Locale, string> = {
    en: 'EN',
    ko: 'KO',
    ja: 'JA',
  };

  return (
    <Link
      to={(newPath || '/') as '/'}
      className={`px-2 py-1 rounded ${isActive ? 'bg-[var(--color-brand)] text-white' : 'hover:bg-[var(--color-bg-secondary)]'}`}
    >
      {labels[locale]}
    </Link>
  );
}
