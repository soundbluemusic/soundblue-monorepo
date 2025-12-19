import { A, useLocation, useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useI18n } from "~/i18n";
import type { Locale } from "~/i18n";
import { useTheme } from "~/theme";
import { uiActions, uiStore } from "~/stores/ui-store";

// ========================================
// Header Component - 헤더
// ========================================

export const Header: Component = () => {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isAboutPage = () => location.pathname.includes("/about");

  const getHomePath = () => (locale() === "en" ? "/" : `/${locale()}`);

  const toggleMobileSidebar = () => {
    uiActions.setSidebarOpen(!uiStore.sidebarOpen);
  };

  // Get current path without language prefix
  const getPathWithoutLocale = () => {
    const pathname = location.pathname;
    // Remove /ko prefix if exists
    if (pathname.startsWith("/ko")) {
      return pathname.slice(3) || "/";
    }
    return pathname;
  };

  // Build path with new locale
  const buildLocalizedPath = (newLocale: Locale) => {
    const basePath = getPathWithoutLocale();
    if (newLocale === "en") {
      return basePath;
    }
    // For ko, prepend the locale
    if (basePath === "/") {
      return `/${newLocale}`;
    }
    return `/${newLocale}${basePath}`;
  };

  const cycleLanguage = () => {
    const langs: Locale[] = ["en", "ko"];
    const currentLocale = locale();
    if (!currentLocale) return;
    const currentIndex = langs.indexOf(currentLocale);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    if (!nextLang) return;
    setLocale(nextLang);
    // Navigate to the localized path
    const newPath = buildLocalizedPath(nextLang);
    navigate(newPath);
  };

  return (
    <header class="relative z-30 flex h-14 items-center justify-between border-b border-border bg-bg-secondary px-4">
      {/* Left: Mobile menu + Logo */}
      <div class="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <Show when={!isAboutPage()}>
          <button
            type="button"
            onClick={toggleMobileSidebar}
            class="md:hidden w-8 h-8 flex items-center justify-center rounded-[--radius-sm] text-text-secondary transition-all duration-200 hover:bg-accent-light hover:text-accent"
            aria-label="Menu"
          >
            <MenuIcon />
          </button>
        </Show>

        {/* Logo */}
        <A
          href={getHomePath()}
          class="text-lg font-semibold tracking-tight text-accent transition-all duration-200 hover:opacity-80"
        >
          {t.title}
          <Show when={isAboutPage()}>
            <span class="text-text-secondary font-normal"> - {t.about}</span>
          </Show>
        </A>
      </div>

      {/* Right: Controls */}
      <div class="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          class="w-8 h-8 flex items-center justify-center rounded-[--radius-sm] text-text-secondary transition-all duration-200 hover:bg-accent-light hover:text-accent"
          aria-label={theme() === "dark" ? t.lightMode : t.darkMode}
        >
          <Show when={theme() === "dark"} fallback={<MoonIcon />}>
            <SunIcon />
          </Show>
        </button>

        {/* Language Toggle */}
        <button
          type="button"
          onClick={cycleLanguage}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-sm] text-xs font-semibold text-text-secondary transition-all duration-200 hover:bg-accent-light hover:text-accent"
          aria-label="Change language"
        >
          <GlobeIcon />
          <span>{(locale() ?? "en").toUpperCase()}</span>
        </button>

        {/* Offline Badge */}
        <div class="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-green-badge text-green-text rounded-[--radius-sm] text-xs font-medium">
          <OfflineIcon />
          <span>{t.offline}</span>
        </div>
      </div>
    </header>
  );
};

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const OfflineIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
