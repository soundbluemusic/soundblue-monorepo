'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Button, useTheme } from '@soundblue/ui-components/base';
import { Globe, Moon, Search, Sun } from 'lucide-react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import m from '~/lib/messages';

interface HomeHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function HomeHeader({
  searchQuery,
  onSearchChange,
  onSearchKeyDown,
  inputRef,
}: HomeHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, toggleLanguage } = useParaglideI18n();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 bg-(--background)/90 backdrop-blur-md border-b border-(--border) transition-colors">
      <div className="flex items-center justify-between px-4 pt-4 pb-4 md:pt-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-(--foreground)">
            {locale === 'ko' ? '툴즈' : 'Tools'}
          </h1>
          <span className="text-sm font-medium text-(--muted-foreground)">
            {locale === 'ko' ? '창작자를 위한 도구모음' : 'Tools for Creators'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-(--secondary) hover:bg-(--secondary)/80 text-(--foreground) transition-colors"
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-(--secondary) hover:bg-(--secondary)/80 text-(--foreground) transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">{locale === 'ko' ? 'KO' : 'EN'}</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4 md:max-w-3xl md:mx-auto md:w-full">
        <div className="relative flex w-full items-center rounded-2xl md:rounded-full bg-(--card) shadow-sm border border-(--border) dark:border-white/20 md:h-14">
          <div className="flex items-center justify-center pl-4 md:pl-6 text-(--muted-foreground)">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full border-none bg-transparent py-3 md:py-4 pl-3 pr-4 md:pr-20 text-sm md:text-base font-medium text-(--foreground) placeholder:text-(--muted-foreground) focus:ring-0 focus:outline-none"
            placeholder={
              m['search_placeholder']?.() ?? (locale === 'ko' ? '도구 검색...' : 'Search...')
            }
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={onSearchKeyDown}
          />
          {/* Keyboard shortcut badge - desktop only */}
          <div className="hidden md:flex absolute right-4 items-center gap-1 bg-(--secondary) border border-(--border) px-2.5 py-1 rounded-lg text-xs font-bold text-(--muted-foreground)">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>
    </header>
  );
}
