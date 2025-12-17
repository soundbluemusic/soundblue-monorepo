import { A, useIsRouting, useLocation } from '@solidjs/router';
import { Code2, Globe, Home, Loader2, Menu, Moon, Sun } from 'lucide-solid';
import { type Component, Show } from 'solid-js';
import { useTheme } from '~/components/providers/theme-provider';
import { Button } from '~/components/ui/button';
import { getLocalizedPath, getPathWithoutLocale, useLanguage } from '~/i18n';
import { toolActions, toolStore } from '~/stores/tool-store';

// ========================================
// Header Component - 헤더 (새 레이아웃용)
// ========================================

export const Header: Component = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const isRouting = useIsRouting();

  // Check if we're on built-with page (any locale)
  const isBuiltWithPage = () => {
    const pathWithoutLocale = getPathWithoutLocale(location.pathname);
    return pathWithoutLocale === '/built-with';
  };

  // Check if we're on about page (any locale)
  const isAboutPage = () => {
    const pathWithoutLocale = getPathWithoutLocale(location.pathname);
    return pathWithoutLocale === '/about';
  };

  // Check if we're on any secondary page (no sidebar)
  const isSecondaryPage = () => isBuiltWithPage() || isAboutPage();

  // Get localized paths
  const homePath = () => getLocalizedPath('/', language());
  const builtWithPath = () => getLocalizedPath('/built-with', language());

  const toggleMobileSidebar = () => {
    toolActions.setSidebarOpen(!toolStore.sidebarOpen);
  };

  return (
    <header class="relative z-30 flex h-14 items-center justify-between border-b bg-background px-4 pt-[env(safe-area-inset-top)]">
      {/* Left: Mobile menu + Logo */}
      <div class="flex items-center gap-3">
        {/* Mobile menu toggle - only show on main pages */}
        <Show when={!isSecondaryPage()}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMobileSidebar}
            class="md:hidden text-muted-foreground hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.12] dark:active:bg-white/[0.18]"
            aria-label={t().common.menu}
          >
            <Menu class="h-5 w-5" />
          </Button>
        </Show>

        {/* Logo with page title */}
        <A
          href={homePath()}
          class="text-lg font-semibold tracking-tight text-brand transition-all duration-200 hover:opacity-80 active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          {t().brand}
          <Show when={isBuiltWithPage()}>
            <span class="text-muted-foreground font-normal"> - Built With</span>
          </Show>
          <Show when={isAboutPage()}>
            <span class="text-muted-foreground font-normal"> - {t().navigation.about}</span>
          </Show>
        </A>

        {/* Route Loading Indicator */}
        <Show when={isRouting()}>
          <Loader2 class="h-4 w-4 animate-spin text-primary" aria-label="Loading" />
        </Show>
      </div>

      {/* Right: Controls */}
      <div class="flex items-center gap-1">
        {/* Navigation Link - contextual */}
        <Show
          when={isSecondaryPage()}
          fallback={
            <A
              href={builtWithPath()}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.12] dark:active:bg-white/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <Code2 class="h-4 w-4" />
              <span>Built With</span>
            </A>
          }
        >
          <A
            href={homePath()}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.12] dark:active:bg-white/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <Home class="h-4 w-4" />
            <span>{t().navigation.home}</span>
          </A>
        </Show>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark')}
          aria-label={resolvedTheme() === 'dark' ? t().theme.light : t().theme.dark}
          class="relative text-muted-foreground hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.12] dark:active:bg-white/[0.18]"
        >
          <Sun
            class="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
          />
          <Moon
            class="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            aria-hidden="true"
          />
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          class="gap-1.5 px-3 text-muted-foreground hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.12] dark:active:bg-white/[0.18]"
          aria-label={language() === 'ko' ? 'Switch to English' : '한국어로 전환'}
        >
          <Globe class="h-4 w-4" />
          <span class="text-xs font-semibold">{language() === 'ko' ? 'KO' : 'EN'}</span>
        </Button>
      </div>
    </header>
  );
};
