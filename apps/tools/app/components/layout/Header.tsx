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
    <header className="relative z-30 flex h-14 items-center justify-between border-b bg-background px-4 pt-[env(safe-area-inset-top)]">
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle - only show on main pages */}
        {!isSecondaryPage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label={m['common_menu']?.()}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo with page title */}
        <Link
          to={homePath}
          className="text-lg font-semibold tracking-tight text-brand transition-all duration-200 hover:opacity-80 active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          {m['brand']?.()}
          {isBuiltWithPage && (
            <span className="text-muted-foreground font-normal"> - Built With</span>
          )}
          {isAboutPage && (
            <span className="text-muted-foreground font-normal">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/8 dark:hover:bg-white/12"
          >
            <Home className="h-4 w-4" />
            <span>{m['navigation_home']?.()}</span>
          </Link>
        ) : (
          <Link
            to={builtWithPath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/8 dark:hover:bg-white/12"
          >
            <Code2 className="h-4 w-4" />
            <span>Built With</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={resolvedTheme === 'dark' ? m['theme_light']?.() : m['theme_dark']?.()}
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 px-3 text-muted-foreground hover:text-foreground"
          aria-label={
            locale === 'ko' ? 'Switch to English' : '\uD55C\uAD6D\uC5B4\uB85C \uC804\uD658'
          }
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{locale === 'ko' ? 'KO' : 'EN'}</span>
        </Button>
      </div>
    </header>
  );
}
