'use client';

import { useParaglideI18n, useTheme } from '@soundblue/shared-react';
import { Code2, Globe, Home, Menu, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import m from '~/lib/messages';
import { useToolStore } from '~/stores/tool-store';
import styles from './Header.module.scss';

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
    <header className={styles.header}>
      {/* Left: Mobile menu + Logo */}
      <div className={styles.leftSection}>
        {/* Mobile menu toggle - only show on main pages */}
        {!isSecondaryPage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className={styles.mobileMenuButton}
            aria-label={m['common_menu']?.()}
          >
            <Menu className={styles.iconMd} />
          </Button>
        )}

        {/* Logo with page title */}
        <Link to={homePath} className={styles.logoLink}>
          {m['brand']?.()}
          {isBuiltWithPage && <span className={styles.pageTitle}> - Built With</span>}
          {isAboutPage && <span className={styles.pageTitle}> - {m['navigation_about']?.()}</span>}
        </Link>
      </div>

      {/* Right: Controls */}
      <div className={styles.rightSection}>
        {/* Navigation Link - contextual */}
        {isSecondaryPage ? (
          <Link to={homePath} className={styles.navLink}>
            <Home className={styles.icon} />
            <span>{m['navigation_home']?.()}</span>
          </Link>
        ) : (
          <Link to={builtWithPath} className={styles.navLink}>
            <Code2 className={styles.icon} />
            <span>Built With</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={resolvedTheme === 'dark' ? m['theme_light']?.() : m['theme_dark']?.()}
          className={styles.themeButton}
        >
          <Sun className={styles.sunIcon} />
          <Moon className={styles.moonIcon} />
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className={styles.langButton}
          aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
        >
          <Globe className={styles.icon} />
          <span className={styles.langText}>{locale === 'ko' ? 'KO' : 'EN'}</span>
        </Button>
      </div>
    </header>
  );
}
