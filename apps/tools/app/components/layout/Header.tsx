'use client';

import { useParaglideI18n, useTheme } from '@soundblue/shared-react';
import { Code2, Globe, Home, Menu, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import m from '~/lib/messages';
import { useToolStore } from '~/stores/tool-store';

function getPathWithoutLocale(pathname: string): string {
  if (pathname.startsWith('/ko/')) {
    return pathname.slice(3);
  }
  if (pathname === '/ko') {
    return '/';
  }
  return pathname;
}

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, toggleLanguage, localizedPath } = useParaglideI18n();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useToolStore();

  const isBuiltWithPage = getPathWithoutLocale(location.pathname) === '/built-with';
  const isAboutPage = getPathWithoutLocale(location.pathname) === '/about';
  const isSecondaryPage = isBuiltWithPage || isAboutPage;

  const homePath = localizedPath('/');
  const builtWithPath = localizedPath('/built-with');

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="relative z-30 flex h-14 items-center justify-between border-b border-(--border) bg-(--background) px-4 pt-[env(safe-area-inset-top)]">
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle - only show on main pages */}
        {!isSecondaryPage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="text-(--muted-foreground) hover:text-(--foreground) md:hidden"
            aria-label={m['common_menu']?.()}
          >
            <Menu className="h-5 w-5 shrink-0" />
          </Button>
        )}

        {/* Logo with page title */}
        <Link
          to={homePath}
          className="text-lg font-semibold tracking-tight text-(--brand) transition-all duration-200 no-underline rounded-sm hover:opacity-80 active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
        >
          {m['brand']?.()}
          {isBuiltWithPage && (
            <span className="text-(--muted-foreground) font-normal"> - Built With</span>
          )}
          {isAboutPage && (
            <span className="text-(--muted-foreground) font-normal">
              {' '}
              - {m['navigation_about']?.()}
            </span>
          )}
        </Link>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Navigation Link - contextual */}
        {isSecondaryPage ? (
          <Link
            to={homePath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-(--muted-foreground) no-underline transition-all duration-200 hover:text-(--foreground) hover:bg-black/8 dark:hover:bg-white/12"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>{m['navigation_home']?.()}</span>
          </Link>
        ) : (
          <Link
            to={builtWithPath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-(--muted-foreground) no-underline transition-all duration-200 hover:text-(--foreground) hover:bg-black/8 dark:hover:bg-white/12"
          >
            <Code2 className="h-4 w-4 shrink-0" />
            <span>Built With</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={resolvedTheme === 'dark' ? m['theme_light']?.() : m['theme_dark']?.()}
          className="relative text-(--muted-foreground) hover:text-(--foreground)"
        >
          <Sun className="h-[1.125rem] w-[1.125rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.125rem] w-[1.125rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 text-(--muted-foreground) hover:text-(--foreground)"
          aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold">{locale === 'ko' ? 'KO' : 'EN'}</span>
        </Button>
      </div>
    </header>
  );
}
